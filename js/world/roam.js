/* ============ roam.js — G.Roam: a Pokémon that roams Hoenn's routes (chapter 42) ============
 * Latias or Latios (the colour the player saw on the news, littleroot.js / legends.js) roams Hoenn:
 * save.roamer = { mon, map, seen } — the Pokémon itself (its HP and status stay from battle to battle),
 * the route it is on, and whether the player has met it (then the Town Map shows where it is).
 *   G.Roam.start(sp, lvl, rng)   it starts roaming: a new Pokémon on a random route
 *   G.Roam.move(rng)             the player changed maps (field.js): it moves to a route next to its own
 *                                (through a town too), or 1 time in 16 anywhere
 *   G.Roam.meets(rng, mapId)     a wild encounter on its route (walking or surfing): 1 in 4 is it -> its mon | null
 *   G.Roam.after(outcome, rng)   after its battle: caught, it is gone; beaten, it recovers and goes far away;
 *                                fled or run from, it keeps its HP and status and moves on
 *   G.Roam.where()               -> its route once met (the Town Map), else null
 *   G.Roam.routes()              the routes it roams: Hoenn's routes with wild Pokémon
 * Every roll uses the world's seeded RNG.
 */
G.Roam = (() => {
  const S = () => G.Field.save;
  function isRoute(id) {
    if (!/^route\d+$/.test(id) || !G.Maps.has(id)) return false;
    const d = G.Maps.get(id).def;
    return d.region === 'hoenn' && !!(d.encounters && (d.encounters.walk || d.encounters.water));
  }
  const routes = () => G.Maps.all().filter(isRoute);
  const conn = id => (G.Maps.has(id) ? Object.values(G.Maps.get(id).def.connect || {}).map(c => c.map) : []);

  /** The routes next to one: connected to it, or to a town connected to it. */
  function near(id) {
    const out = new Set();
    for (const a of conn(id)) {
      if (isRoute(a)) out.add(a);
      else for (const b of conn(a)) if (isRoute(b) && b !== id) out.add(b);
    }
    out.delete(id);
    return [...out].sort();
  }
  const anywhere = (rng, not) => { const all = routes().filter(r => r !== not); return all.length ? rng.pick(all) : not; };

  function start(sp, lvl, rng) {
    S().roamer = { mon: G.Mon.create(sp, lvl, { rng, wild: true }), map: anywhere(rng, null), seen: false };
    return S().roamer;
  }

  function move(rng) {
    const r = S().roamer;
    if (!r) return;
    const next = near(r.map);
    r.map = rng.next() < 1 / 16 || !next.length ? anywhere(rng, r.map) : rng.pick(next);
  }

  function meets(rng, mapId) {
    const r = S().roamer;
    if (!r || r.map !== mapId || r.mon.hp <= 0) return null;
    return rng.next() < 0.25 ? r.mon : null;
  }

  function after(outcome, rng) {
    const r = S().roamer;
    if (!r) return;
    r.seen = true;
    if (outcome === 'caught') { S().roamer = null; G.Field.setFlag('roamer-caught'); return; }
    if (outcome === 'win') {
      // Beaten: it recovers somewhere far away (in the games it was gone for good).
      r.mon.hp = G.Mon.maxHp(r.mon); r.mon.status = null; r.mon.slp = 0;
      r.map = anywhere(rng, r.map);
      return;
    }
    move(rng);
  }

  const where = () => (S().roamer && S().roamer.seen ? S().roamer.map : null);

  return { start, move, meets, after, where, routes, near };
})();
