/* ============ mon.js — Pokémon instances (party, boxes, wild and trainer Pokémon) ============
 * A Pokémon is a plain object that goes into the save as it is:
 *
 *   { uid, sp, nick, lvl, exp, hp, status, slp, tox, moves:[{id, pp, ppUp}], ivs:[6], evs:[6],
 *     nature, gender, shiny, friendship, ball, ot:{name, id}, met:{map, lvl}, item, ability,
 *     form (only some: Unown's letter 'A'..'Z', chapter 24) }
 *
 *   status: null | 'psn' | 'tox' | 'brn' | 'par' | 'slp' | 'frz'   (slp = turns left asleep,
 *   tox = bad-poison counter). Stats are not stored: G.Mon.stats(mon) computes them.
 *
 *   G.Mon.create(sp, lvl, { rng, wild, moves, nature, ivs, shinyOdds, ot, ball, met })
 *   G.Mon.stats(mon) · maxHp(mon) · types(mon) · name(mon) · ppMax(moveId, ppUp)
 *   G.Mon.heal(mon)                  full HP, no status, full PP (Pokémon Center)
 *   G.Mon.recalc(mon, oldMax)        after a level up / evolution: HP rises with max HP
 *   G.Mon.movesAt(sp, lvl)           moves its species learns at exactly that level
 *   G.Mon.defaultMoves(sp, lvl)      the last four distinct moves learned up to that level
 *   G.Mon.learn(mon, moveId, slot)   learn into an empty slot, or replace `slot`
 *   G.Mon.knows(mon, moveId)
 */
G.Mon = (() => {
  function uidFrom(rng) { return rng.int(0, 0x7fffffff).toString(36) + rng.int(0, 0xffff).toString(36); }

  function ppMax(id, ppUp = 0) {
    const m = G.MOVES[id];
    const base = m ? m.pp : 5;
    return base + Math.floor(base * ppUp / 5);
  }

  function defaultMoves(sp, lvl) {
    const out = [];
    for (const [l, m] of G.SPECIES[sp].learn) {
      if (l > lvl) break;
      const i = out.indexOf(m);
      if (i >= 0) out.splice(i, 1);          // learned again later: counts as the later one
      out.push(m);
    }
    return out.slice(-4);
  }

  const movesAt = (sp, lvl) => [...new Set(G.SPECIES[sp].learn.filter(([l]) => l === lvl).map(([, m]) => m))];

  function create(sp, lvl, o = {}) {
    const S = G.SPECIES[sp];
    if (!S) throw new Error('Unknown species ' + sp);
    const rng = o.rng || G.RNG(G.RNG.seed());
    const ivs = o.ivs || G.Stats.ORDER.map(() => rng.int(0, 31));
    const natures = Object.keys(G.NATURES).sort();
    const nature = o.nature || natures[rng.int(0, natures.length - 1)];
    const gender = S.gf < 0 ? null : rng.int(0, 7) < S.gf ? 'f' : 'm';
    const shiny = rng.int(1, o.shinyOdds || 4096) === 1;
    const ids = (o.moves || defaultMoves(sp, lvl)).slice(0, 4);
    const mon = {
      uid: uidFrom(rng), sp, nick: null, lvl, exp: G.Stats.expAt(S.gr, lvl), hp: 0,
      status: null, slp: 0, tox: 0,
      moves: ids.map(id => ({ id, pp: ppMax(id), ppUp: 0 })),
      ivs, evs: [0, 0, 0, 0, 0, 0], nature, gender, shiny,
      friendship: S.fr, ball: o.ball || null, ot: o.ot || null, met: o.met || null, item: null, ability: null
    };
    mon.hp = maxHp(mon);
    return mon;
  }

  const stats = mon => G.Stats.calc(G.SPECIES[mon.sp].base, mon.lvl, mon.ivs, mon.evs, mon.nature);
  const maxHp = mon => stats(mon)[0];
  const types = mon => G.SPECIES[mon.sp].types.slice();
  const name = mon => mon.nick || G.Names.mon(mon.sp);
  const knows = (mon, id) => mon.moves.some(m => m.id === id);

  function heal(mon) {
    mon.hp = maxHp(mon);
    mon.status = null; mon.slp = 0; mon.tox = 0;
    for (const m of mon.moves) m.pp = ppMax(m.id, m.ppUp);
  }

  function recalc(mon, oldMax) {
    const now = maxHp(mon);
    if (mon.hp > 0) mon.hp = Math.min(now, mon.hp + (now - oldMax));
  }

  /** Learns into a free slot (-> null), or replaces `slot` (-> the forgotten move).
   *  With four moves and no slot nothing changes (-> false): ask which one to forget first. */
  function learn(mon, id, slot) {
    const m = { id, pp: ppMax(id), ppUp: 0 };
    if (mon.moves.length < 4 && (slot == null || slot >= mon.moves.length)) { mon.moves.push(m); return null; }
    if (slot == null || !mon.moves[slot]) return false;
    const old = mon.moves[slot].id;
    mon.moves[slot] = m;
    return old;
  }

  return { create, stats, maxHp, types, name, knows, heal, recalc, learn, ppMax, defaultMoves, movesAt };
})();
