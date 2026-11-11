/* ============ roam.js — G.Roam: Pokémon that roam the routes of a region (chapters 42, 60 and 70) ============
 * Latias or Latios (the colour the player saw on the news, littleroot.js / legends.js) roams Hoenn; Mesprit
 * (sinnoh/legends.js) and Cresselia (sinnoh/fullmoon.js) roam Sinnoh. Each has its own slot and place in the save,
 * so none pushes out another: save.roamer / save.sinnohRoamer / save.cresselia = { mon, map, seen } — the Pokémon
 * itself (its HP and status stay from battle to battle), the route it is on, and whether the player has met it
 * (then the Town Map shows where it is). A slot names the region it roams ('hoenn' and 'sinnoh' are also slots).
 *   G.Roam.start(sp, lvl, rng, slot)    it starts roaming: a new Pokémon on a random route (slot: 'hoenn' unless given)
 *   G.Roam.move(rng)                    the player changed maps (field.js): each moves to a route next to its own
 *                                       (through a town too), or 1 time in 16 anywhere
 *   G.Roam.meets(rng, mapId)            a wild encounter on its route (walking or surfing): 1 in 4 is one of those
 *                                       there (two on one route: one of them, by the same RNG) -> its mon | null
 *   G.Roam.after(outcome, rng, mon)     after its battle: caught, it is gone; beaten, it recovers and goes far away;
 *                                       fled or run from, it keeps its HP and status and moves on -> its slot
 *   G.Roam.where(slot)                  -> its route once met (the Town Map), else null
 *   G.Roam.of(slot)                     -> the slot's { mon, map, seen } | null
 *   G.Roam.list(region)                 -> every one met in the region: [{ slot, sp, map }] (the Town Map)
 *   G.Roam.routes(region)               the routes they roam: the region's routes with wild Pokémon
 * Every roll uses the world's seeded RNG.
 */
G.Roam = (() => {
  const S = () => G.Field.save;
  // Each slot: its place in the save, the flag set when it is caught, the region it roams.
  const SLOTS = {
    hoenn: { key: 'roamer', caught: 'roamer-caught', region: 'hoenn' },
    sinnoh: { key: 'sinnohRoamer', caught: 'mesprit-caught', region: 'sinnoh' },
    cresselia: { key: 'cresselia', caught: 'cresselia-caught', region: 'sinnoh' }       // chapter 70
  };
  // Sinnoh's long routes are in parts (route210n, route210s).
  const ROUTE = { hoenn: /^route\d+$/, sinnoh: /^route\d+[a-z]?$/ };
  const of = (slot = 'hoenn') => (SLOTS[slot] && S()[SLOTS[slot].key]) || null;
  const slots = () => Object.keys(SLOTS).filter(g => of(g));
  const regionOf = slot => SLOTS[slot].region;

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

  function start(sp, lvl, rng, slot = 'hoenn') {
    S()[SLOTS[slot].key] = { mon: G.Mon.create(sp, lvl, { rng, wild: true }), map: anywhere(rng, null, regionOf(slot)), seen: false };
    return of(slot);
  }

  function moveOne(slot, rng) {
    const r = of(slot), region = regionOf(slot), next = near(r.map, region);
    r.map = rng.next() < 1 / 16 || !next.length ? anywhere(rng, r.map, region) : rng.pick(next);
  }
  function move(rng) { for (const g of slots()) moveOne(g, rng); }

  function meets(rng, mapId) {
    const here = slots().map(of).filter(r => r.map === mapId && r.mon.hp > 0);
    if (!here.length || rng.next() >= 0.25) return null;
    return (here.length > 1 ? rng.pick(here) : here[0]).mon;
  }

  function after(outcome, rng, mon) {
    const g = slots().find(x => !mon || of(x).mon === mon), r = g && of(g);
    if (!r) return null;
    r.seen = true;
    if (outcome === 'caught') { S()[SLOTS[g].key] = null; G.Field.setFlag(SLOTS[g].caught); return g; }
    if (outcome === 'win') {
      // Beaten: it recovers somewhere far away (in the games it was gone for good).
      r.mon.hp = G.Mon.maxHp(r.mon); r.mon.status = null; r.mon.slp = 0;
      r.map = anywhere(rng, r.map, regionOf(g));
      return g;
    }
    moveOne(g, rng);
    return g;
  }

  const where = (slot = 'hoenn') => { const r = of(slot); return r && r.seen ? r.map : null; };
  const list = region => slots().filter(g => regionOf(g) === region && of(g).seen).map(g => ({ slot: g, sp: of(g).mon.sp, map: of(g).map }));

  return { start, move, meets, after, where, of, list, routes, near };
})();
