/* ============ evolution.js — when and into what a Pokémon evolves ============
 *   G.Evolution.candidates(mon, { trigger: 'level' | 'item', item }) -> [species]
 *       'level' covers level and friendship evolutions (checked after a battle
 *       in which it levelled up, or after a Rare Candy); 'item' is a stone used on it.
 *   G.Evolution.evolve(mon, to) -> [moves its new form learns at its current level]
 *       Changes the species and recalculates stats (HP rises with max HP).
 *       The returned moves go through the usual "learn a new move" prompt.
 * Cancelling (B during the animation) simply means not calling evolve().
 */
G.Evolution = (() => {
  function candidates(mon, o = {}) {
    const S = G.SPECIES[mon.sp];
    const out = [];
    for (const e of S.evo || []) {
      if (o.trigger === 'item') { if (e.how === 'item' && e.item === o.item) out.push(e.to); continue; }
      if (e.how === 'level' && mon.lvl >= e.level) out.push(e.to);
      else if (e.how === 'friendship' && mon.friendship >= (e.min || 220)) out.push(e.to);
    }
    return out;
  }

  function evolve(mon, to) {
    const oldMax = G.Mon.maxHp(mon);
    mon.sp = to;
    G.Mon.recalc(mon, oldMax);
    return G.Mon.movesAt(to, mon.lvl).filter(id => !G.Mon.knows(mon, id));
  }

  return { candidates, evolve };
})();
