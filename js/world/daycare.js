/* ============ daycare.js — G.DayCare: the Day Care on Route 34 (chapter 13) ============
 * The Day-Care Lady raises up to two Pokémon while you travel: each step you take gives each of
 * them 1 Exp. point (G.Field's walked() calls step()). A level reached there teaches the moves of
 * that level, forgetting the oldest one when it already knows four (as in the games); it does not
 * evolve there. Taking one back costs ₽100, plus ₽100 for each level it grew.
 *   save.daycare = [{ mon, lvl }]          lvl: its level when it was left
 *   G.DayCare.list() · full() · deposit(partyIndex) -> false when it cannot be left
 *   withdraw(k) -> the mon, or a reason ('party-full' | 'money')
 *   grown(k) (levels) · price(k) · step(n) · gain(mon, n)
 * Breeding (Eggs) is not done yet.
 */
G.DayCare = (() => {
  const MAX = 2;
  const S = () => G.Field.save;
  const list = () => S().daycare || (S().daycare = []);
  const full = () => list().length >= MAX;

  /** A Pokémon can be left unless it is the last one in the party that can still fight. */
  function canLeave(i) {
    const party = G.Field.party(), m = party[i];
    return !!m && party.some((o, j) => j !== i && o.hp > 0);
  }
  function deposit(i) {
    if (full() || !canLeave(i)) return false;
    const [mon] = G.Field.party().splice(i, 1);
    list().push({ mon, lvl: mon.lvl });
    return true;
  }

  const grown = k => (list()[k] ? list()[k].mon.lvl - list()[k].lvl : 0);
  const price = k => 100 + 100 * grown(k);

  function withdraw(k) {
    const e = list()[k];
    if (!e) return null;
    if (G.Field.party().length >= 6) return 'party-full';
    if (S().player.money < price(k)) return 'money';
    G.Field.money(-price(k));
    list().splice(k, 1);
    G.Mon.heal(e.mon);
    G.Field.party().push(e.mon);
    return e.mon;
  }

  /** Experience for one Pokémon: levels and their moves (no evolution, no move prompts). */
  function gain(mon, n) {
    const gr = G.SPECIES[mon.sp].gr;
    mon.exp = Math.min(G.Stats.expAt(gr, 100), (mon.exp || 0) + n);
    while (mon.lvl < 100 && mon.exp >= G.Stats.expAt(gr, mon.lvl + 1)) {
      const old = G.Mon.maxHp(mon);
      mon.lvl++;
      G.Mon.recalc(mon, old);
      for (const id of G.Mon.movesAt(mon.sp, mon.lvl)) {
        if (G.Mon.knows(mon, id)) continue;
        if (mon.moves.length >= 4) mon.moves.shift();
        G.Mon.learn(mon, id);
      }
    }
  }

  function step(n = 1) {
    for (const e of list()) gain(e.mon, n);
  }

  return { MAX, list, full, canLeave, deposit, withdraw, grown, price, gain, step };
})();
