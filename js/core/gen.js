/* ============ gen.js — which game this page is: the whole journey or one generation ============
 * PokeLeague is published as several pages that run the same scripts (docs/DESIGN.md, "Generation pages"):
 *   /PokeLeague/        the whole journey, Kanto to Sinnoh (generation 0 here)
 *   /PokeLeague/gen1/   Generation 1: Kanto only, Pokémon 1-151 (gen2/ to gen4/ follow, one step each)
 * The page says which one it is: a built page with <html data-gen="1"> (tools/build.js; the CSP allows no
 * inline script), dev.html with ?gen=1, a test with G.Gen.set(1). Nothing said: 0.
 *
 *   G.Gen.n                 0 (the whole journey) or 1..4
 *   G.Gen.maxDex            the highest national Pokédex number in this game
 *   G.Gen.allows(sp)        is this species (dex number) in this game?
 *   G.Gen.table(t)          an encounter table { rate, mons, morning?, night? } without the species of later
 *                           generations (their chances shared out among the rest); the same table when none goes,
 *                           null when none is left
 *   G.Gen.mapOpen(id)       may the player go to this map? (its region is one of this game's; a map that is not loaded is not)
 *   G.Gen.CLOSED            the script of a road to a region this game leaves out (maps.js puts it on such warps)
 *   G.Gen.key(name)         a localStorage key of this game: 'pl.save.1' (0), 'pl.g1.save.1' (1)
 *   G.Gen.chapters, last    this game's chapters (null for the whole journey), its last one
 *   G.Gen.name(k), region(k), label(k)    'Generation 1', 'Kanto', 'Generation 1 · Kanto' (translated)
 *   G.Gen.title(), subtitle()             the browser tab's title; the title screen's line (null: the page's own)
 *   G.Gen.url(k)            the address of game k's page (dev.html: ?gen=k)
 *   G.Gen.PUBLISHED         the generations that have a page
 *   G.Gen.set(k)            (tests and dev only)
 */
G.Gen = (() => {
  const T = s => (G.T ? G.T(s) : s);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const INFO = {
    0: { maxDex: 493, regions: null, chapters: null },
    1: { maxDex: 151, regions: ['kanto'], chapters: range(1, 10) },
    2: { maxDex: 251, regions: ['johto'], chapters: range(11, 27) },
    3: { maxDex: 386, regions: ['hoenn'], chapters: range(28, 43).concat(range(77, 83), [86, 107, 108, 109]) },
    4: { maxDex: 493, regions: ['sinnoh'], chapters: range(44, 76).concat([84, 85], range(87, 106), [110]) }
  };
  /** The generations with a page of their own (tools/build.js writes gen<k>/ for each). */
  const PUBLISHED = [1];
  const NAME = { 1: () => T('Generation 1'), 2: () => T('Generation 2'), 3: () => T('Generation 3'), 4: () => T('Generation 4') };
  const REGION = { 1: () => T('Kanto'), 2: () => T('Johto'), 3: () => T('Hoenn'), 4: () => T('Sinnoh') };

  const isDev = () => typeof location !== 'undefined' && /\/dev\.html$/.test(location.pathname || '');
  /** The page's generation: <html data-gen>, or dev.html's ?gen=. */
  function fromPage() {
    try {
      const a = typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('data-gen');
      if (a) return +a;
      if (isDev()) return +new URLSearchParams(location.search).get('gen') || 0;
    } catch (e) { /* no page (tests) */ }
    return 0;
  }

  let n = 0, info = INFO[0];
  function set(k) {
    n = INFO[k | 0] ? k | 0 : 0;
    info = INFO[n];
    api.n = n; api.maxDex = info.maxDex; api.regions = info.regions; api.chapters = info.chapters;
    api.last = info.chapters ? info.chapters[info.chapters.length - 1] : null;
    tables = new WeakMap();
  }

  const allows = sp => !n || (+sp >= 1 && +sp <= info.maxDex);
  const spOf = s => (typeof s === 'number' ? s : G.Maps && G.Maps.species ? G.Maps.species(s) : +s);

  /** Rows of a wild list without the species from later generations; the chances of those left keep their
   *  proportions and add up to what the whole list did. null when none is left; the same list when none goes. */
  function rows(list) {
    if (!Array.isArray(list)) return list;
    const keep = list.filter(r => allows(spOf(r[0])));
    if (keep.length === list.length) return list;
    if (!keep.length) return null;
    const all = list.reduce((s, r) => s + r[3], 0), left = keep.reduce((s, r) => s + r[3], 0);
    return keep.map(r => { const c = r.slice(); c[3] = left ? r[3] * all / left : r[3]; return c; });
  }
  let tables = new WeakMap();
  function table(t) {
    if (!n || !t || info.maxDex >= 493) return t;
    if (tables.has(t)) return tables.get(t);
    let out = t;
    const mons = rows(t.mons), morning = rows(t.morning), night = rows(t.night);
    if (mons !== t.mons || morning !== t.morning || night !== t.night) {
      out = Object.assign({}, t);
      for (const [k, v] of [['mons', mons], ['morning', morning], ['night', night]]) { if (v) out[k] = v; else delete out[k]; }
      if (!out.mons) out = out.morning || out.night ? Object.assign(out, { mons: out.morning || out.night }) : null;
    }
    tables.set(t, out);
    return out;
  }

  function mapOpen(id) {
    if (!n) return true;
    const r = G.Maps && G.Maps.region ? G.Maps.region(id) : null;
    return !!r && info.regions.includes(r);          // (not loaded: a pack of another region, packs.js)
  }
  /** A road out of this game's regions: the player is told, and stays. */
  const CLOSED = [['js', h => h.say(T('This road leads to another region. In this game the journey stays in {region}.'),
                                    { vars: { region: region(n) } })]];

  const key = name => 'pl.' + (n ? 'g' + n + '.' : '') + name;
  const name = k => (NAME[k] ? NAME[k]() : '');
  const region = k => (REGION[k] ? REGION[k]() : '');
  const label = k => (k ? name(k) + ' · ' + region(k) : T('The whole journey: Kanto to Sinnoh'));
  const title = () => (n ? G.I18n.fmt('PokeLeague ({gen})', { gen: name(n) }) : 'PokeLeague');
  const subtitle = () => (n ? label(n) : null);

  /** The page of game k: gen<k>/ beside the whole journey's page (dev.html: the same page with ?gen=k). */
  function url(k) {
    if (isDev()) {
      const q = new URLSearchParams(location.search);
      if (k) q.set('gen', k); else q.delete('gen');
      const s = q.toString();
      return location.pathname + (s ? '?' + s : '');
    }
    const base = typeof document !== 'undefined' && document.baseURI || location.href;
    return new URL(k ? 'gen' + k + '/' : './', base).href;
  }

  const api = { PUBLISHED, INFO, set, allows, rows, table, mapOpen, CLOSED, key, name, region, label, title, subtitle, url };
  set(fromPage());
  return api;
})();
