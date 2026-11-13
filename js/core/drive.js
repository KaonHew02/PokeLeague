/* ============ drive.js — a copy of the saves in your own Google Drive ============
 * The browser stays the working store (store.js): the game never needs an account or a connection. This adds
 * a second copy, the one that survives a cleared browser and can be brought down onto another phone or
 * computer. The same idea as MoneyFlow's drive.js.
 *
 * - Sign-in: Google's library (accounts.google.com/gsi/client), loaded only once a client ID is set
 *   (drive-config.js) and a screen with the Drive buttons opens (preload); a pop-up gives a token, kept in
 *   memory only. The scope is drive.file: the game sees only the files it made itself, not the rest of your
 *   Drive, and that needs no review by Google.
 * - The copy: the folder GameHub, shared with the other games on the same OAuth client (CardVerse's GameHub
 *   arrangement, drive-config.js; made by whichever game is first), with this game's one file in it,
 *   pokeleague-data.json, holding the three slots: { app: 'PokeLeague', kind: 'saves', v, at, slots: [save | null]
 *   × 3 }, each slot the same save that Export writes. The app and kind are checked before anything is loaded,
 *   so another game's file is refused by name. drive.file lets another device signed in to the same account
 *   find them.
 * - push(): this device's slots up. pull(confirm): shows what Drive and this device hold, and only once you
 *   agree writes Drive's saves into their slots; a slot empty in Drive keeps what is here.
 * - Auto (off by default, pl.drive.auto): after each save in the game (G.Session.save → touch) a copy goes up a
 *   few seconds later. It never puts a sign-in window in front of you: without a token that Google renews
 *   quietly, it stands down and the status turns red until you press "Save to Drive" once.
 * - status(): when this device last sent a copy (pl.drive.last), and whether that needs a press.
 *
 *   G.Drive.configured() · preload() · push() · pull(confirm) -> { ok } | { error, code }
 *   G.Drive.auto (get / set) · touch() · status() -> { state: 'setup' | 'none' | 'ok' | 'warn', days, at }
 *   G.Drive.message(result) -> the text for a result's error · statusText()
 */
G.Drive = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SCOPE = 'https://www.googleapis.com/auth/drive.file';
  const API = 'https://www.googleapis.com/drive/v3', UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
  const GSI = 'https://accounts.google.com/gsi/client';
  const FOLDER = 'application/vnd.google-apps.folder';
  const AUTO_KEY = 'pl.drive.auto', LAST_KEY = 'pl.drive.last';
  const AUTO_WAIT = 5000, STALE_DAYS = 7;

  const cfg = () => G.DRIVE_CONFIG || {};
  const configured = () => /\.apps\.googleusercontent\.com$/.test(cfg().clientId || '');
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage can be blocked */ } };
  const http = (...a) => (G.Drive.fetch || fetch)(...a);          // tests swap it

  let token = null, expires = 0, client = null, folderId = null, fileId = null, timer = null;
  const valid = () => !!token && Date.now() < expires - 60000;

  class DriveError extends Error { constructor(code, extra) { super(code); this.code = code; this.extra = extra; } }

  // ---------------- signing in ----------------

  const library = () => (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) || null;
  /** Google's library, early: a sign-in pop-up only opens if it is asked for during the tap itself. */
  function preload() {
    if (!configured() || library() || typeof document === 'undefined' || document.getElementById('gsi-client')) return;
    const s = document.createElement('script');
    s.id = 'gsi-client'; s.src = GSI; s.async = true; s.defer = true;
    document.head.appendChild(s);
  }

  /** A token, without a window if Google already knows the answer (the first time it asks, as it should). */
  function authorize() {
    return new Promise((resolve, reject) => {
      if (valid()) return resolve(token);
      const oauth2 = library();
      if (!oauth2) { preload(); return reject(new DriveError('library')); }
      if (!client) client = oauth2.initTokenClient({ client_id: cfg().clientId, scope: SCOPE, callback: () => {} });
      client.callback = r => {
        if (r.error) return reject(new DriveError(/access_denied|user_cancel/i.test(r.error) ? 'cancel' : 'refused'));
        token = r.access_token;
        expires = Date.now() + Number(r.expires_in || 3600) * 1000;
        resolve(token);
      };
      client.error_callback = e => reject(new DriveError(e && e.type === 'popup_closed' ? 'cancel' : 'popup'));
      client.requestAccessToken({ prompt: '' });
    });
  }

  // ---------------- talking to Drive ----------------

  /** Every request: a token gone stale in flight (401) is worth one quiet retry. */
  async function call(url, options = {}, retrying = false) {
    const r = await http(url, Object.assign({}, options, { headers: Object.assign({}, options.headers, { Authorization: 'Bearer ' + token }) }));
    if (r.status === 401 && !retrying) { token = null; await authorize(); return call(url, options, true); }
    if (!r.ok) throw new DriveError('http', r.status);
    return r;
  }
  const q = s => encodeURIComponent(s);
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  /** The game's folder: found (drive.file sees only what the game made), else made. */
  async function folder() {
    if (folderId) return folderId;
    const r = await call(`${API}/files?q=${q(`name = '${esc(cfg().folderName)}' and mimeType = '${FOLDER}' and trashed = false`)}&fields=files(id)&pageSize=1`);
    const b = await r.json();
    if (b.files && b.files[0]) return (folderId = b.files[0].id);
    const made = await call(`${API}/files?fields=id`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cfg().folderName, mimeType: FOLDER }) });
    return (folderId = (await made.json()).id);
  }
  /** The file in the folder, or null. */
  async function findFile() {
    if (fileId) return fileId;
    const dir = await folder();
    const r = await call(`${API}/files?q=${q(`'${dir}' in parents and name = '${esc(cfg().filename)}' and trashed = false`)}&fields=files(id,modifiedTime)&pageSize=1`);
    const b = await r.json();
    return (fileId = (b.files && b.files[0] && b.files[0].id) || null);
  }
  /** Writes the copy: made the first time (name, folder and content together), replaced after. */
  async function writeFile(env) {
    const body = JSON.stringify(env);
    const id = await findFile();
    if (id) {
      await call(`${UPLOAD}/files/${id}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
      return id;
    }
    const meta = { name: cfg().filename, parents: [await folder()], mimeType: 'application/json' };
    const bd = 'pokeleague-' + Date.now().toString(36);
    const multi = `--${bd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`
      + `--${bd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bd}--`;
    const r = await call(`${UPLOAD}/files?uploadType=multipart&fields=id`, { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + bd }, body: multi });
    return (fileId = (await r.json()).id);
  }

  // ---------------- the copy ----------------

  /** What goes up: the three slots as they are in this browser. */
  function envelope() {
    return { app: G.Store.APP, kind: 'saves', v: G.Store.V, at: new Date().toISOString(),
             slots: [1, 2, 3].map(n => G.Store.load(n)) };
  }
  /** A copy read back: each save checked as Import checks a file. -> { slots: [save | null] × 3, at } | { error } */
  function check(env) {
    if (!env || typeof env !== 'object' || env.app !== G.Store.APP || env.kind !== 'saves' || !Array.isArray(env.slots)) return { error: 'other' };
    const slots = [];
    for (let i = 0; i < 3; i++) {
      const s = env.slots[i];
      if (!s) { slots.push(null); continue; }
      const r = G.Store.importText(JSON.stringify(s));
      if (r.error) return { error: r.error === 'newer' ? 'newer' : 'bad' };
      slots.push(r.save);
    }
    return { slots, at: env.at || null };
  }
  /** "Slot 1: Red, 3 badges, 2:15" for each slot, or empty. */
  function describe(slots) {
    return slots.map((s, i) => s
      ? fmt('Slot {n}: {name}, {badges} badges, {time}', { n: i + 1, name: s.player.name, badges: (s.player.badges || []).length, time: G.Menus ? G.Menus.time(s.playTime || 0) : String(s.playTime | 0) })
      : fmt('Slot {n}: empty', { n: i + 1 })).join('\n');
  }

  function remember() { put(LAST_KEY, new Date().toISOString()); }
  const fail = e => ({ error: true, code: (e && e.code) || 'http', extra: e && e.extra });

  async function push() {
    if (!configured()) return { error: true, code: 'setup' };
    try {
      await authorize();
      await writeFile(envelope());
      remember();
      return { ok: true };
    } catch (e) { return fail(e); }
  }

  /** confirm(text) -> Promise<boolean>: asked with what both copies hold. -> { ok, written } | { error } | { cancelled } */
  async function pull(confirm) {
    if (!configured()) return { error: true, code: 'setup' };
    try {
      await authorize();
      const id = await findFile();
      if (!id) return { error: true, code: 'empty' };
      const r = await call(`${API}/files/${id}?alt=media`);
      let env = null;
      try { env = await r.json(); } catch (e) { env = null; }
      const c = check(env);
      if (c.error) return { error: true, code: c.error };
      const when = c.at ? new Date(c.at).toLocaleString(G.I18n.lang) : '?';
      const here = [1, 2, 3].map(n => G.Store.load(n));
      const text = fmt('Replace saves with the copy in Google Drive from {date}?', { date: when })
        + '\n\n' + T('Google Drive:') + '\n' + describe(c.slots)
        + '\n\n' + T('This device:') + '\n' + describe(here)
        + '\n\n' + T('A slot that is empty in Google Drive keeps what is here.');
      if (!(await confirm(text))) return { cancelled: true };
      let written = 0;
      c.slots.forEach((s, i) => { if (s && G.Store.write(i + 1, s)) written++; });
      return { ok: true, written };
    } catch (e) { return fail(e); }
  }

  // ---------------- on its own (Auto) ----------------

  const autoOn = () => get(AUTO_KEY) === 'on';
  /** After a save in the game (G.Session.save): a copy a few seconds later, once, if Auto is on. */
  function touch() {
    if (!autoOn() || !configured()) return;
    clearTimeout(timer);
    timer = setTimeout(run, AUTO_WAIT);
  }
  /** Auto's push: only with a token Google gives without a window; else it stands down (the status says so). */
  async function run() {
    if (!autoOn() || !configured()) return false;
    if (!valid()) {
      if (typeof document !== 'undefined' && document.visibilityState && document.visibilityState !== 'visible') return false;
      if (!get(LAST_KEY)) return false;              // the first copy has to be one you send
      try { await authorize(); } catch (e) { return false; }
    }
    try { await writeFile(envelope()); remember(); return true; } catch (e) { return false; }
  }

  // ---------------- what to show ----------------

  function status() {
    if (!configured()) return { state: 'setup' };
    const at = get(LAST_KEY);
    if (!at) return { state: autoOn() ? 'warn' : 'none', first: true };
    const days = Math.floor((Date.now() - new Date(at).getTime()) / 86400000);
    return { state: days >= STALE_DAYS ? 'warn' : 'ok', days, at };
  }
  function statusText() {
    const s = status();
    if (s.state === 'setup') return T('Google Drive is not set up for this game yet.');
    if (s.first) return s.state === 'warn' ? T('Auto is on, but the first copy has to be one you send: press "Save to Drive" once.')
      : T('Nothing has been sent to Google Drive from this device yet.');
    if (s.days === 0) return T('Saved to Google Drive today.');
    if (s.days === 1) return T('Saved to Google Drive yesterday.');
    return s.state === 'warn' ? fmt('The last copy went to Google Drive {n} days ago. Press "Save to Drive".', { n: s.days })
      : fmt('Saved to Google Drive {n} days ago.', { n: s.days });
  }
  function message(r) {
    switch (r && r.code) {
      case 'setup': return T('Google Drive is not set up for this game yet.');
      case 'library': return T("Google's sign-in has not loaded yet. Check the internet connection and try again.");
      case 'cancel': return T('Sign-in was cancelled, so nothing was sent or read.');
      case 'popup': return T('The Google sign-in window could not open. Allow pop-ups for this site and try again.');
      case 'refused': return T('Google refused the sign-in.');
      case 'empty': return T('There is nothing in Google Drive yet: press "Save to Drive" first.');
      case 'other': return T('The file in Google Drive is not a PokeLeague backup.');
      case 'newer': return T('The copy in Google Drive comes from a newer version of the game.');
      case 'bad': return T('The copy in Google Drive is damaged.');
      default: return fmt('Google Drive refused the request ({code}).', { code: (r && r.extra) || '?' });
    }
  }

  return {
    configured, preload, push, pull, touch, run, status, statusText, message, envelope, check, fetch: null,
    get auto() { return autoOn(); }, set auto(v) { put(AUTO_KEY, v ? 'on' : 'off'); if (v) touch(); else clearTimeout(timer); },
    /** Tests: forget the token, the folder and the file. */
    reset() { token = null; expires = 0; client = null; folderId = null; fileId = null; clearTimeout(timer); }
  };
})();
