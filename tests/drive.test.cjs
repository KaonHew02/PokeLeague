// The Google Drive copy of the saves (js/core/drive.js), with a fake Google sign-in and a fake Drive in memory.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE } = require('./helpers.cjs');

/** A storage like localStorage. */
function memory() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

/** The game's store and Drive module, a fake sign-in, and a fake Drive that records every request. */
function setup(o = {}) {
  const ctx = boot(CORE.concat('js/core/store.js', 'js/core/drive-config.js', 'js/core/drive.js'));
  const G = ctx.G;
  const store = memory();
  ctx.localStorage = store;
  G.Store.use(store);
  G.DRIVE_CONFIG = o.configured !== false ? { clientId: '123-abc.apps.googleusercontent.com', folderName: 'GameHub', filename: 'pokeleague-data.json' }
    : { clientId: '', folderName: 'GameHub', filename: 'pokeleague-data.json' };
  let signIns = 0;
  ctx.google = { accounts: { oauth2: { initTokenClient: c => ({
    requestAccessToken() { signIns++; const r = o.refuse ? { error: o.refuse } : { access_token: 'tok', expires_in: 3600 }; Promise.resolve().then(() => this.callback(r)); },
    callback: c.callback
  }) } } };
  const drive = { files: new Map(), next: 1 };
  const calls = [];
  const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
  G.Drive.fetch = async (url, opt = {}) => {
    const method = opt.method || 'GET';
    calls.push({ method, url, body: opt.body, auth: opt.headers && opt.headers.Authorization });
    const query = decodeURIComponent((/[?&]q=([^&]*)/.exec(url) || [])[1] || '');
    if (method === 'GET' && /googleapis\.com\/drive\/v3\/files\?/.test(url)) {
      const found = [...drive.files.values()].filter(f => (query.includes('vnd.google-apps.folder') ? f.folder && query.includes(`'${f.name}'`)
        : !f.folder && query.includes(`'${f.parent}' in parents`) && query.includes(`'${f.name}'`)));
      return json({ files: found.slice(0, 1).map(f => ({ id: f.id })) });
    }
    if (method === 'POST' && /googleapis\.com\/drive\/v3\/files/.test(url)) {
      const m = JSON.parse(opt.body), id = 'F' + drive.next++;
      drive.files.set(id, { id, name: m.name, folder: true });
      return json({ id });
    }
    if (method === 'POST' && /uploadType=multipart/.test(url)) {
      const parts = opt.body.split(/\r\n\r\n/);
      const meta = JSON.parse(parts[1].split('\r\n')[0]), content = parts[2].split('\r\n--')[0];
      const id = 'X' + drive.next++;
      drive.files.set(id, { id, name: meta.name, parent: meta.parents[0], content });
      return json({ id });
    }
    const m = /\/files\/(\w+)\?(alt=media|uploadType=media)/.exec(url);
    if (m && method === 'PATCH') { drive.files.get(m[1]).content = opt.body; return json({}); }
    if (m) { const f = drive.files.get(m[1]); return f ? { ok: true, status: 200, json: async () => JSON.parse(f.content) } : json({}, 404); }
    return json({}, 400);
  };
  const save = (n, name, badges = []) => { const s = G.Store.newSave({ name, gender: 'm', rival: 'Blue', id: 7 }); s.player.badges = badges; assert.ok(G.Store.write(n, s)); };
  return { ctx, G, store, drive, calls, save, signIns: () => signIns };
}

test('the shipped config: the shared GameHub client (as CardVerse), its folder, a file name of our own, and no client secret', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'core', 'drive-config.js'), 'utf8');
  const G = boot(CORE.concat('js/core/drive-config.js')).G;
  assert.match(G.DRIVE_CONFIG.clientId, /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
  assert.equal(G.DRIVE_CONFIG.folderName, 'GameHub');
  assert.equal(G.DRIVE_CONFIG.filename, 'pokeleague-data.json');
  assert.ok(!/GOCSPX|client_?secret\s*[:=]/i.test(src), 'no client secret');
});

test('Google Drive not set up: the buttons say so, and nothing talks to Google', async () => {
  const { G, calls } = setup({ configured: false });
  assert.equal(G.Drive.configured(), false);
  const r = await G.Drive.push();
  assert.equal(r.code, 'setup');
  assert.match(G.Drive.message(r), /not set up/);
  assert.equal((await G.Drive.pull(async () => true)).code, 'setup');
  assert.equal(calls.length, 0);
  assert.equal(G.Drive.status().state, 'setup');
});

test('Save to Drive: the game makes its folder and its file the first time, then replaces the file', async () => {
  const { G, drive, calls, save, signIns } = setup();
  save(1, 'Red', [1, 2, 3]);
  assert.equal(G.Drive.status().state, 'none');
  assert.ok((await G.Drive.push()).ok);
  assert.equal(signIns(), 1);
  const folder = [...drive.files.values()].find(f => f.folder), file = [...drive.files.values()].find(f => !f.folder);
  assert.equal(folder.name, 'GameHub');
  assert.equal(file.name, 'pokeleague-data.json');
  assert.equal(file.parent, folder.id, 'the file is in the folder');
  const env = JSON.parse(file.content);
  assert.equal(env.app, 'PokeLeague');
  assert.equal(env.kind, 'saves');
  assert.equal(env.slots.length, 3);
  assert.equal(env.slots[0].player.name, 'Red');
  assert.equal(env.slots[1], null);
  assert.ok(calls.every(c => c.auth === 'Bearer tok'));
  assert.equal(G.Drive.status().state, 'ok');
  assert.match(G.Drive.statusText(), /today/);
  // Again: one PATCH of the same file, no second folder or file, no second sign-in.
  calls.length = 0;
  save(2, 'Leaf');
  assert.ok((await G.Drive.push()).ok);
  assert.equal(signIns(), 1, 'the token is still good');
  assert.deepEqual(calls.map(c => c.method), ['PATCH']);
  assert.equal(drive.files.size, 2);
  assert.equal(JSON.parse(file.content).slots[1].player.name, 'Leaf');
});

test('Load from Drive: both copies shown first; on yes, Drive\'s saves go into their slots and a slot empty in Drive keeps what is here', async () => {
  const { G, save } = setup();
  save(1, 'Red', [1]);
  assert.ok((await G.Drive.push()).ok);                 // Drive: Red in slot 1, the rest empty
  save(1, 'Other', [1, 2]);                             // this device then changes slot 1 and fills slot 3
  save(3, 'Kept');
  let asked = '';
  const no = await G.Drive.pull(async text => { asked = text; return false; });
  assert.ok(no.cancelled);
  assert.match(asked, /Slot 1: Red, 1 badges/);
  assert.match(asked, /Slot 1: Other, 2 badges/);
  assert.match(asked, /Slot 3: empty/);
  assert.equal(G.Store.load(1).player.name, 'Other', 'nothing written without a yes');
  const yes = await G.Drive.pull(async () => true);
  assert.ok(yes.ok);
  assert.equal(yes.written, 1);
  assert.equal(G.Store.load(1).player.name, 'Red');
  assert.equal(G.Store.load(3).player.name, 'Kept', 'empty in Drive: kept here');
});

test('Load from Drive refuses what is not a PokeLeague copy, a damaged one, one from a newer version, and an empty Drive', async () => {
  const { G, drive, save } = setup();
  assert.equal((await G.Drive.pull(async () => true)).code, 'empty');
  save(1, 'Red');
  await G.Drive.push();
  const file = [...drive.files.values()].find(f => !f.folder);
  const env = JSON.parse(file.content);
  file.content = JSON.stringify({ app: 'MoneyFlow', kind: 'saves', slots: [] });
  assert.equal((await G.Drive.pull(async () => true)).code, 'other');
  file.content = JSON.stringify(Object.assign({}, env, { slots: [{ app: 'PokeLeague', player: null }, null, null] }));
  assert.equal((await G.Drive.pull(async () => true)).code, 'bad');
  file.content = JSON.stringify(Object.assign({}, env, { slots: [Object.assign({}, env.slots[0], { v: 999 }), null, null] }));
  const r = await G.Drive.pull(async () => true);
  assert.equal(r.code, 'newer');
  assert.match(G.Drive.message(r), /newer version/);
});

test('Auto: off by default; on, it waits for the first copy you send, then sends after a save; a refused sign-in stands down', async () => {
  const { G, drive, save, store } = setup();
  save(1, 'Red');
  assert.equal(G.Drive.auto, false);
  assert.equal(await G.Drive.run(), false, 'off: nothing goes');
  G.Drive.auto = true;
  assert.equal(store.getItem('pl.drive.auto'), 'on');
  assert.equal(G.Drive.status().state, 'warn', 'on, but the first copy has to be one you send');
  assert.match(G.Drive.statusText(), /first copy/);
  assert.equal(await G.Drive.run(), false);
  assert.equal(drive.files.size, 0, 'it never signs you in on its own the first time');
  await G.Drive.push();
  save(1, 'Red again');
  assert.equal(await G.Drive.run(), true, 'with a token: a copy after the save');
  assert.equal(JSON.parse([...drive.files.values()].find(f => !f.folder).content).slots[0].player.name, 'Red again');
  // A week later, with Google refusing to sign in quietly: it stands down, and the status says to press.
  store.setItem('pl.drive.last', new Date(Date.now() - 8 * 86400000).toISOString());
  const two = setup({ refuse: 'interaction_required' });
  two.store.setItem('pl.drive.auto', 'on');
  two.store.setItem('pl.drive.last', new Date(Date.now() - 8 * 86400000).toISOString());
  assert.equal(await two.G.Drive.run(), false);
  assert.equal(two.G.Drive.status().state, 'warn');
  assert.match(two.G.Drive.statusText(), /8 days ago/);
  G.Drive.auto = false;
});

test('Drive errors: a cancelled sign-in and a refused request come back as messages, never as a crash', async () => {
  const { G } = setup({ refuse: 'access_denied' });
  const r = await G.Drive.push();
  assert.equal(r.code, 'cancel');
  assert.match(G.Drive.message(r), /cancelled/);
  const two = setup();
  two.G.Drive.fetch = async () => ({ ok: false, status: 403, json: async () => ({}) });
  const r2 = await two.G.Drive.push();
  assert.equal(r2.code, 'http');
  assert.match(two.G.Drive.message(r2), /\(403\)/);
});
