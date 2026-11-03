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
 * Chapter 44 (Generation 4): a level rule may need a held item (`item`: Gligar's Razor Fang, used up
 * when it evolves), the time of day (`time`), a gender (`gender`: 'm' | 'f', for items too: a male
 * Kirlia with a Dawn Stone), a known move (`move`: Aipom's Double Hit) or a species in the party
 * (`party`: Mantyke with a Remoraid; o.party, default the player's).
 */
G.Evolution = (() => {
  function candidates(mon, o = {}) {
    const S = G.SPECIES[mon.sp];
    const out = [];
    if (mon.item === 'everstone' && o.trigger !== 'item') return out;
    const time = o.time || (G.Clock ? G.Clock.period() : 'day');
    const timeOk = e => !e.time || (e.time === 'night' ? time === 'night' : time !== 'night');
    const party = o.party || (G.Field && G.Field.party ? G.Field.party() : []);
    const more = e => (!e.gender || mon.gender === e.gender) && (!e.move || G.Mon.knows(mon, e.move))
      && (!e.party || party.some(m => m && m !== mon && m.sp === e.party));
    for (const e of S.evo || []) {
      if (o.trigger === 'item') { if (e.how === 'item' && e.item === o.item && more(e)) out.push(e.to); continue; }
      if (e.how === 'level' && mon.lvl >= e.level && statsOk(mon, e) && timeOk(e) && (!e.item || mon.item === e.item) && more(e)) out.push(e.to);
      else if (e.how === 'friendship' && mon.friendship >= (e.min || 220) && timeOk(e) && more(e)) out.push(e.to);
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
    // An item held to evolve is used up (the Razor Fang, the Oval Stone).
    const rule = (G.SPECIES[mon.sp].evo || []).find(e => e.to === to && e.how === 'level' && e.item);
    if (rule && mon.item === rule.item) mon.item = null;
    mon.sp = to;
    G.Mon.recalc(mon, oldMax);
    return G.Mon.movesAt(to, mon.lvl).filter(id => !G.Mon.knows(mon, id));
  }

  return { candidates, evolve };
})();
