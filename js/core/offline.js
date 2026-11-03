/* ============ offline.js — playing without internet ============
 * Registers the service worker (sw.js, at the root) from the published game:
 * it keeps the game's files on the device, so the game opens and plays with no
 * connection. The Pokémon sprites are kept as they are first seen; download()
 * fetches all of them ahead of time, so a Pokémon never met before still shows
 * up offline. Installed as an app (Home Screen) it does that by itself.
 * Not on dev.html (it always loads fresh files), on file:// or in tests.
 *
 *   G.Offline.init()          after boot (main.js)
 *   G.Offline.status()        null when not available, else { state, done, total }
 *                             state: checking · missing · loading · ready · failed
 *   G.Offline.check()         counts the cached sprites again (status changes through on)
 *   G.Offline.download()      fetches the sprites the cache lacks, a few at a time
 *   G.Offline.on(fn)          fn() when the status changes (at most 4 times a second)
 *   G.Offline.spriteUrls()    every sprite file the game can ask for
 *   G.Offline.SIZE_MB         about how much download() takes (checked by a test)
 */
G.Offline = (() => {
  const SIZE_MB = 36;
  const SPRITE_CACHE = 'pokeleague-sprites-';     // as in sw.js
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

  /** Every sheet sprites.js can load: each animation, and the shiny one when there is one. */
  function spriteUrls() {
    const out = [];
    for (const [dex, m] of Object.entries(G.SPRITE_META || {})) {
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

  /** The sprites still missing from the cache (counts done and total on the way). */
  async function refresh() {
    urls = urls || spriteUrls();
    const got = new Set();
    for (const k of await caches.keys()) {
      if (!k.startsWith(SPRITE_CACHE)) continue;
      for (const r of await (await caches.open(k)).keys()) got.add(new URL(r.url).pathname);
    }
    const todo = urls.filter(u => !got.has(new URL(u, location.href).pathname));
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
    const auto = () => { if (standalone() && !saveData() && (st.state === 'missing' || st.state === 'failed')) download(); };
    refresh().then(() => setTimeout(auto, START_DELAY_MS)).catch(e => console.warn('[Offline]', e));
    addEventListener('online', auto);
  }

  function status() { return usable() ? st : null; }
  /** Looks at the cache again: sprites seen while playing count too (Settings calls it). */
  function check() { if (usable() && !busy) refresh().catch(() => {}); }

  return { init, status, check, download, on, spriteUrls, SIZE_MB };
})();
