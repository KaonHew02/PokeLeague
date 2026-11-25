/* ============ offline.js — playing without internet ============
 * Registers the service worker (sw.js, at the root) from the published game:
 * it keeps the game's files on the device, so the game opens and plays with no
 * connection. The Pokémon sprites are kept as they are first seen; download()
 * fetches those of the regions reached so far (packs.js) ahead of time, so a Pokémon
 * never met before still shows up offline, and each new region's when it is reached.
 * Installed as an app (Home Screen) it does that by itself.
 * Not on dev.html (it always loads fresh files), on file:// or in tests.
 *
 *   G.Offline.init()          after boot (main.js)
 *   G.Offline.status()        null when not available, else { state, done, total }
 *                             state: checking · missing · loading · ready · failed
 *   G.Offline.check()         counts the cached sprites again (status changes through on)
 *   G.Offline.download()      fetches the sprites the cache lacks, a few at a time
 *   G.Offline.on(fn)          fn() when the status changes (at most 4 times a second)
 *   G.Offline.spriteUrls(top)  the sprite files of Pokémon 1..top, of what they evolve into and of the saves' own
 *                              Pokémon (no top: every one)
 *   G.Offline.SIZES           about how many MB each generation's sprites take (checked by a test)
 *   G.Offline.sizeMB()        about how much download() takes: the regions reached
 *   G.Offline.grew()          a region was reached (packs.js): its sprites and files count from now on
 */
G.Offline = (() => {
  const SIZES = [11, 7, 10, 8];
  const TOP = [151, 251, 386, 493];
  const SPRITE_CACHE = 'pokeleague-sprites-', SHELL_CACHE = 'pokeleague-shell-';     // as in sw.js
  const AT_ONCE = 6, GIVE_UP_AFTER = 20, START_DELAY_MS = 5000, WORKER_WAIT_MS = 30000;
  const st = { state: 'checking', done: 0, total: 0 };
  const listeners = [];
  let urls = null, busy = false, timer = 0;

  function usable() {
    return typeof window !== 'undefined' && typeof location !== 'undefined' && /^https?:$/.test(location.protocol)
      && !/\/dev\.html$/.test(location.pathname) && !!(navigator.serviceWorker && window.caches);
  }
  const standalone = () => !!navigator.standalone || !!(window.matchMedia && matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
  const saveData = () => !!(navigator.connection && navigator.connection.saveData);

  /** Every Pokémon whose sprites the regions reached may need. */
  function species(top) {
    const want = new Set();
    const add = sp => { if (want.has(sp)) return; want.add(sp); for (const e of (G.SPECIES && G.SPECIES[sp] && G.SPECIES[sp].evo) || []) add(e.to); };
    for (let sp = 1; sp <= top; sp++) add(sp);
    for (let n = 1; G.Store && n <= G.Store.SLOTS; n++) {
      const s = G.Store.load(n);
      if (s) for (const sp of Object.keys(s.dex.seen)) want.add(+sp);
    }
    return want;
  }
  /** Every sheet sprites.js can load: each animation, and the shiny one when there is one. */
  function spriteUrls(top) {
    const out = [], want = top ? species(top) : null;
    for (const [dex, m] of Object.entries(G.SPRITE_META || {})) {
      if (want && !want.has(+dex)) continue;
      for (const a of Object.keys(m.a)) {
        out.push(`assets/pokemon/${dex}/${a}.png`);
        if (m.sh && !(m.sm && m.sm.includes(a))) out.push(`assets/pokemon/${dex}/s/${a}.png`);
      }
    }
    return out;
  }

  function on(fn) { listeners.push(fn); }
  function changed() {
    if (timer) return;
    timer = setTimeout(() => { timer = 0; listeners.forEach(f => f()); }, 250);
  }

  const reached = () => (G.Packs ? G.Packs.reached() : TOP.length - 1);
  const sizeMB = () => SIZES.slice(0, reached() + 1).reduce((a, b) => a + b, 0);
  const code = () => (G.Packs ? G.Packs.files() : []);

  /** The files still missing from the caches: sprites by their path, code and texts with their ?v= (counts done and total). */
  async function refresh() {
    urls = urls || spriteUrls(TOP[reached()]).concat(code());
    const got = new Set();
    for (const k of await caches.keys()) {
      const sprites = k.startsWith(SPRITE_CACHE);
      if (!sprites && !k.startsWith(SHELL_CACHE)) continue;
      for (const r of await (await caches.open(k)).keys()) { const u = new URL(r.url); got.add(sprites ? u.pathname : u.pathname + u.search); }
    }
    // (document.baseURI: a generation page, gen1/, takes its files from the folder above: <base href="../">.)
    const base = (typeof document !== 'undefined' && document.baseURI) || location.href;
    const todo = urls.filter(u => { const x = new URL(u, base); return !got.has(x.pathname + x.search); });
    st.total = urls.length;
    st.done = urls.length - todo.length;
    if (!busy && (st.state !== 'failed' || !todo.length)) st.state = todo.length ? 'missing' : 'ready';
    changed();
    return todo;
  }

  /** Only files that go through the service worker are kept: wait until it runs the page. */
  function controlled() {
    if (navigator.serviceWorker.controller) return Promise.resolve(true);
    return new Promise(res => {
      navigator.serviceWorker.addEventListener('controllerchange', () => res(true), { once: true });
      setTimeout(() => res(!!navigator.serviceWorker.controller), WORKER_WAIT_MS);
    });
  }

  async function download() {
    if (!usable() || busy) return;
    busy = true;
    st.state = 'loading';
    changed();
    let fails = 0;
    try {
      // Asks the browser not to clear these files when space runs low.
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      if (!await controlled()) throw new Error('no service worker');
      const todo = await refresh();
      let i = 0;
      const worker = async () => {
        while (i < todo.length && fails < GIVE_UP_AFTER) {
          try {
            const r = await fetch(todo[i++]);
            if (!r.ok) fails++;
            else { await r.blob(); st.done++; }
          } catch (e) { fails++; }
          changed();
        }
      };
      await Promise.all(Array.from({ length: AT_ONCE }, worker));
    } catch (e) {
      fails++;
      console.warn('[Offline]', e);
    }
    busy = false;
    st.state = 'checking';
    try { await refresh(); } catch (e) { st.state = 'missing'; }
    if (fails && st.state === 'missing') st.state = 'failed';
    changed();
  }

  function init() {
    if (!usable()) return;
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('[Offline] service worker:', e));
    // Installed as an app: get every sprite now, while there is a connection.
    auto = () => { if (standalone() && !saveData() && (st.state === 'missing' || st.state === 'failed')) download(); };
    refresh().then(() => setTimeout(auto, START_DELAY_MS)).catch(e => console.warn('[Offline]', e));
    addEventListener('online', () => auto());
    keep();
  }
  let auto = () => {};

  /** The code and texts of the regions reached are kept even when the sprites are not: the first ones were fetched
   *  before the worker ran the page, so they are asked for once more (from the browser's own cache). */
  async function keep() {
    if (!usable() || !await controlled()) return;
    const base = (typeof document !== 'undefined' && document.baseURI) || location.href;
    for (const u of code()) {
      try { if (!await caches.match(new URL(u, base).href)) await (await fetch(u)).blob(); } catch (e) { /* the next time */ }
    }
  }
  /** A region was reached: its files count now, and an installed game downloads its sprites. */
  function grew() {
    urls = null;
    if (!usable()) return;
    keep();
    if (!busy) refresh().then(() => auto()).catch(() => {});
  }

  function status() { return usable() ? st : null; }
  /** Looks at the cache again: sprites seen while playing count too (Settings calls it). */
  function check() { if (usable() && !busy) refresh().catch(() => {}); }

  return { init, status, check, download, grew, on, spriteUrls, SIZES, sizeMB };
})();
