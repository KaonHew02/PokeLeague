/* ============ packs.js — the published game in parts: each region's content is downloaded when it is needed ============
 * tools/build.js puts the engine, the data and Kanto in js/app.min.js, and Johto, Hoenn and Sinnoh (js/content/<region>/)
 * each in js/pack/<region>.js, with its texts in js/lang/<lang>/<region>.js. It writes what they are into G.PACKS:
 *   { johto: { js: 'js/pack/johto.js?v=…', lang: 'js/lang/{lang}/johto.js?v=…', maps: { '<map id>': '<loc>' | 0 } }, …,
 *     main, text: the dictionary and the Pokédex texts (locales.js loads them) }
 * On dev.html and in tests there is no G.PACKS: every file is loaded by itself and nothing here does anything.
 *
 * The journey goes one way (Kanto, Johto, Hoenn, Sinnoh), so a pack always brings those before it: what a later region
 * uses of an earlier one (the Day Care's scripts, Hoenn's Tower in Sinnoh's) is there.
 *
 *   await G.Packs.forSave(save)     the packs a save has reached (its maps, its flags): before Continue
 *   await G.Packs.forMap(id)        the pack of a map about to be entered (field.js warp)
 *   await G.Packs.findScript(name)  the packs up to the one with that script (a call from an earlier region)
 *       -> false when it could not be downloaded and the player gave up
 *   G.Packs.ahead(save)             close to the next region: downloads it quietly, so the way there needs no waiting
 *   G.Packs.more()                  is any pack still to come? (in this game: gen.js)
 *   G.Packs.loc(id)                 the place name id of a map not loaded yet (the list of saves)
 *   G.Packs.reached()               how many packs have been reached: 0 Kanto .. 3 Sinnoh (the saves, what is loaded)
 *   G.Packs.files()                 the code and text files of what has been reached, in the player's language
 */
G.Packs = (() => {
  const ORDER = ['johto', 'hoenn', 'sinnoh'];
  const WAIT_MS = 45000, SHOW_MS = 350;
  /** Flags that say a save has been to a region, whatever map it is on. */
  const START = { johto: ['vr-rival', 'johto-plateau', 'johto-start'], hoenn: ['hoenn-arrived', 'hoenn-start'],
                  sinnoh: ['sinnoh-arrived', 'sinnoh-start'] };
  const fetching = {}, code = {}, loaded = new Set();
  let owner = null;

  const info = () => G.PACKS || null;
  /** The packs of this game: a generation page (gen.js) has only its own regions. */
  const mine = () => (info() ? ORDER.filter(p => info()[p] && !(G.Gen && G.Gen.n && !G.Gen.regions.includes(p))) : []);
  const next = () => mine().find(p => !loaded.has(p)) || null;
  const more = () => !!next();

  function packOf(id) {
    const I = info();
    if (!I) return null;
    return ORDER.find(p => I[p] && Object.prototype.hasOwnProperty.call(I[p].maps, id)) || null;
  }
  const loc = id => { const p = packOf(id); return (p && info()[p].maps[id]) || null; };

  // ---------------- downloading ----------------

  function script(url) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      const t = setTimeout(() => end(new Error('too slow: ' + url)), WAIT_MS);
      function end(e) {
        clearTimeout(t);
        s.onload = s.onerror = null;
        if (e) { s.remove(); rej(e); } else res();
      }
      s.onload = () => end();
      s.onerror = () => end(new Error('not downloaded: ' + url));
      s.src = url;
      document.head.appendChild(s);
    });
  }
  /** The pack's two files; its code waits in code[name] (PL_PACK) until run() is called. */
  function fetchPack(name) {
    if (!fetching[name]) {
      const p = info()[name], lang = G.I18n.lang;
      const files = [script(p.js)].concat(lang === 'en' ? [] : [script(langUrl(name))]);
      fetching[name] = Promise.all(files).then(() => { if (!code[name]) throw new Error('empty pack: ' + name); });
      fetching[name].catch(() => { delete fetching[name]; });       // a later try downloads it again
    }
    return fetching[name];
  }
  const langUrl = name => info()[name].lang.replace('{lang}', G.I18n.lang);

  /** A pack's file calls this: PL_PACK('johto', function (G) { … }). */
  function arrived(name, fn) { if (ORDER.includes(name) && typeof fn === 'function' && !loaded.has(name)) code[name] = fn; }
  function run(name) {
    if (loaded.has(name)) return;
    loaded.add(name);
    code[name](G);
    delete code[name];
  }

  /** Every pack up to `name`, downloaded together and run in order. Throws when one does not arrive. */
  async function load(name) {
    const list = mine().slice(0, mine().indexOf(name) + 1).filter(p => !loaded.has(p));
    if (!list.length) return;
    await Promise.all(list.map(fetchPack));
    list.forEach(run);
    if (G.Offline && G.Offline.grew) G.Offline.grew();
  }

  /** load(), with "Loading…" when it takes a moment and a question when it fails. -> true | false (gave up) */
  async function need(name) {
    for (;;) {
      let shown = false;
      const t = setTimeout(() => { shown = true; G.UI.toast(G.T('Loading…'), WAIT_MS); }, SHOW_MS);
      let ok = true;
      try { await load(name); } catch (e) { ok = false; console.warn('[Packs]', e); }
      clearTimeout(t);
      if (shown) G.UI.toast(G.T('Loading…'), 1);
      if (ok) return true;
      const again = await G.Popup.choose(G.T('This part of the game could not be downloaded. Check the connection.'),
        [{ label: G.T('Try again'), value: true }, { label: G.T('Back'), value: false, back: true }]);
      if (!again) return false;
    }
  }

  // ---------------- what is needed ----------------

  /** How many packs a save has reached (0: Kanto only). */
  function reach(save) {
    if (!info() || !save) return 0;
    const ids = new Set(), p = save.player || {};
    if (p.map) ids.add(p.map);
    if (p.lastHeal && p.lastHeal.map) ids.add(p.lastHeal.map);
    for (const f of Object.keys(save.flags || {})) if (f.startsWith('visited:')) ids.add(f.slice(8));
    for (const k of Object.keys(save.done || {})) ids.add(k.split(':')[0]);        // a trainer beaten there
    let top = 0;
    ORDER.forEach((name, i) => {
      if (!mine().includes(name)) return;
      if (START[name].some(f => save.flags && save.flags[f])) top = Math.max(top, i + 1);
      else for (const id of ids) if (packOf(id) === name) { top = Math.max(top, i + 1); break; }
    });
    return top;
  }
  async function forSave(save) {
    owner = save;
    const n = reach(save);
    return n ? need(ORDER[n - 1]) : true;
  }
  async function forMap(id) {
    const p = packOf(id);
    if (!p || loaded.has(p)) return true;
    return mine().includes(p) ? need(p) : false;
  }
  async function findScript(name) {
    while (!G.Script.get(name) && more()) if (!(await need(next()))) return false;
    return !!G.Script.get(name);
  }

  /** The next region is close: Kanto's eight badges, Mt. Silver, Hoenn's Champion. */
  const CLOSE = { johto: s => s.player.badges.length >= 8, hoenn: s => !!s.flags['silver-beaten'], sinnoh: s => !!s.flags['hoenn-champion'] };
  function ahead(save) {
    const p = next();
    if (!p || !save || !save.player || !CLOSE[p](save)) return;
    if (navigator.connection && navigator.connection.saveData) return;
    fetchPack(p).catch(() => {});                                   // kept for when it is needed
  }

  /** The furthest any save here has been, or what is loaded. */
  function reached() {
    let top = ORDER.reduce((n, p, i) => (loaded.has(p) ? i + 1 : n), owner ? reach(owner) : 0);
    if (info() && G.Store) for (let n = 1; n <= G.Store.SLOTS; n++) top = Math.max(top, reach(G.Store.load(n)));
    return top;
  }
  function files() {
    if (!info()) return [];
    const lang = G.I18n.lang, I = info(), out = [I.text.replace('{lang}', lang === 'pt-BR' ? 'en' : lang)];
    if (lang !== 'en') out.push(I.main.replace('{lang}', lang));
    for (const p of ORDER.slice(0, reached()).filter(x => mine().includes(x))) {
      out.push(I[p].js);
      if (lang !== 'en') out.push(langUrl(p));
    }
    return out;
  }

  if (typeof window !== 'undefined') window.PL_PACK = arrived;
  return { ORDER, arrived, load, need, forSave, forMap, findScript, ahead, more, loc, packOf, reach, reached, files,
           get loaded() { return [...loaded]; } };
})();
