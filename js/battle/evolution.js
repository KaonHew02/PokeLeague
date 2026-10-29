/* ============ evolution.js — when and into what a Pokémon evolves ============
 *   G.Evolution.candidates(mon, { trigger: 'level' | 'item', item, time }) -> [species]
 *       'level' covers level and friendship evolutions (checked after a battle
 *       in which it levelled up, or after a Rare Candy); 'item' is a stone used on it
 *       (or an item a trade evolution needs, used the same way: a Metal Coat on Onix).
 *       A friendship evolution may need the day (morning or day) or the night: `time` is
 *       'morning' | 'day' | 'night' (default G.Clock.period()). Tyrogue looks at its
 *       Attack against its Defense (`stats`: 1 more Attack, -1 more Defense, 0 equal).
 *   G.Evolution.evolve(mon, to) -> [moves its new form learns at its current level]
 *       Changes the species and recalculates stats (HP rises with max HP).
 *       The returned moves go through the usual "learn a new move" prompt.
 * Cancelling (B during the animation) simply means not calling evolve().
 * A Pokémon holding an Everstone (chapter 26) does not evolve, but by an item used on it.
 */
G.Evolution = (() => {
  function candidates(mon, o = {}) {
    const S = G.SPECIES[mon.sp];
    const out = [];
    if (mon.item === 'everstone' && o.trigger !== 'item') return out;
    const time = o.time || (G.Clock ? G.Clock.period() : 'day');
    const timeOk = e => !e.time || (e.time === 'night' ? time === 'night' : time !== 'night');
    for (const e of S.evo || []) {
      if (o.trigger === 'item') { if (e.how === 'item' && e.item === o.item) out.push(e.to); continue; }
      if (e.how === 'level' && mon.lvl >= e.level && statsOk(mon, e)) out.push(e.to);
      else if (e.how === 'friendship' && mon.friendship >= (e.min || 220) && timeOk(e)) out.push(e.to);
    }
    return out;
  }

  /** Tyrogue: which of Attack and Defense is higher decides its evolution. */
  function statsOk(mon, e) {
    if (e.stats == null) return true;
    const st = G.Mon.stats(mon), d = st[1] - st[2];
    return e.stats === Math.sign(d);
  }

  function evolve(mon, to) {
    const oldMax = G.Mon.maxHp(mon);
    mon.sp = to;
    G.Mon.recalc(mon, oldMax);
    return G.Mon.movesAt(to, mon.lvl).filter(id => !G.Mon.knows(mon, id));
  }

  return { candidates, evolve };
})();
