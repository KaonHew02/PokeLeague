/* ============ roam.js — G.Roam: Pokémon that roam the routes of a region (chapters 42 and 60) ============
 * Latias or Latios (the colour the player saw on the news, littleroot.js / legends.js) roams Hoenn, Mesprit
 * (sinnoh/legends.js) roams Sinnoh. Each region has its own place in the save, so neither pushes out the other:
 * save.roamer / save.sinnohRoamer = { mon, map, seen } — the Pokémon itself (its HP and status stay from battle to battle),
 * the route it is on, and whether the player has met it (then the Town Map shows where it is).
 *   G.Roam.start(sp, lvl, rng, region)  it starts roaming: a new Pokémon on a random route (region: 'hoenn' unless given)
 *   G.Roam.move(rng)                    the player changed maps (field.js): each moves to a route next to its own
 *                                       (through a town too), or 1 time in 16 anywhere
 *   G.Roam.meets(rng, mapId)            a wild encounter on its route (walking or surfing): 1 in 4 is it -> its mon | null
 *   G.Roam.after(outcome, rng, mon)     after its battle: caught, it is gone; beaten, it recovers and goes far away;
 *                                       fled or run from, it keeps its HP and status and moves on -> its region
 *   G.Roam.where(region)                -> its route once met (the Town Map), else null
 *   G.Roam.of(region)                   -> the region's { mon, map, seen } | null
 *   G.Roam.routes(region)               the routes it roams: the region's routes with wild Pokémon
 * Every roll uses the world's seeded RNG.
 */
G.Roam = (() => {
  const S = () => G.Field.save;
  const KEY = { hoenn: 'roamer', sinnoh: 'sinnohRoamer' };
  const CAUGHT = { hoenn: 'roamer-caught', sinnoh: 'mesprit-caught' };
  // Sinnoh's long routes are in parts (route210n, route210s).
  const ROUTE = { hoenn: /^route\d+$/, sinnoh: /^route\d+[a-z]?$/ };
  const of = (region = 'hoenn') => S()[KEY[region]] || null;
  const regions = () => Object.keys(KEY).filter(g => of(g));

  function isRoute(id, region) {
    if (!ROUTE[region].test(id) || !G.Maps.has(id)) return false;
    const d = G.Maps.get(id).def;
    return d.region === region && !!(d.encounters && (d.encounters.walk || d.encounters.water));
  }
  const routes = (region = 'hoenn') => G.Maps.all().filter(id => isRoute(id, region));
  const conn = id => (G.Maps.has(id) ? Object.values(G.Maps.get(id).def.connect || {}).map(c => c.map) : []);

  /** The routes next to one: connected to it, or to a town connected to it. */
  function near(id, region = 'hoenn') {
    const out = new Set();
    for (const a of conn(id)) {
      if (isRoute(a, region)) out.add(a);
      else for (const b of conn(a)) if (isRoute(b, region) && b !== id) out.add(b);
    }
    out.delete(id);
    return [...out].sort();
  }
  const anywhere = (rng, not, region) => { const all = routes(region).filter(r => r !== not); return all.length ? rng.pick(all) : not; };

  function start(sp, lvl, rng, region = 'hoenn') {
    S()[KEY[region]] = { mon: G.Mon.create(sp, lvl, { rng, wild: true }), map: anywhere(rng, null, region), seen: false };
    return of(region);
  }

  function moveOne(region, rng) {
    const r = of(region), next = near(r.map, region);
    r.map = rng.next() < 1 / 16 || !next.length ? anywhere(rng, r.map, region) : rng.pick(next);
  }
  function move(rng) { for (const g of regions()) moveOne(g, rng); }

  function meets(rng, mapId) {
    const g = regions().find(x => of(x).map === mapId), r = g && of(g);
    if (!r || r.mon.hp <= 0) return null;
    return rng.next() < 0.25 ? r.mon : null;
  }

  function after(outcome, rng, mon) {
    const g = regions().find(x => !mon || of(x).mon === mon), r = g && of(g);
    if (!r) return null;
    r.seen = true;
    if (outcome === 'caught') { S()[KEY[g]] = null; G.Field.setFlag(CAUGHT[g]); return g; }
    if (outcome === 'win') {
      // Beaten: it recovers somewhere far away (in the games it was gone for good).
      r.mon.hp = G.Mon.maxHp(r.mon); r.mon.status = null; r.mon.slp = 0;
      r.map = anywhere(rng, r.map, g);
      return g;
    }
    moveOne(g, rng);
    return g;
  }

  const where = (region = 'hoenn') => { const r = KEY[region] && of(region); return r && r.seen ? r.map : null; };

  return { start, move, meets, after, where, of, routes, near };
})();
