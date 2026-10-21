/* ============ exp.js — experience, effort values and prize money ============
 *   G.Exp.gain(baseExp, foeLevel, trainer, shared)
 *       = floor(floor(floor(b · L / 7) · (trainer ? 1.5 : 1)) / shared)       (Generation 3 / 4)
 *   G.Exp.addEvs(mon, yield)   EVs from a defeated Pokémon: 252 per stat, 510 in all
 *   G.Exp.prize(base, lastLevel)   trainer prize money = class base × level of its last Pokémon
 *   G.Exp.blackoutLoss(money)      money lost when all your Pokémon faint (half)
 */
G.Exp = (() => {
  const MAX_EV = 252, MAX_TOTAL = 510;

  function gain(b, lvl, trainer, shared = 1) {
    const raw = Math.floor(Math.floor(b * lvl / 7) * (trainer ? 3 : 2) / 2);
    return Math.max(1, Math.floor(raw / Math.max(1, shared)));
  }

  function addEvs(mon, yld) {
    for (let i = 0; i < 6; i++) {
      const total = mon.evs.reduce((s, v) => s + v, 0);
      const add = Math.min(yld[i] || 0, MAX_EV - mon.evs[i], MAX_TOTAL - total);
      if (add > 0) mon.evs[i] += add;
    }
  }

  const prize = (base, lvl) => Math.max(0, Math.round(base) * lvl);
  const blackoutLoss = money => Math.floor(money / 2);

  return { gain, addEvs, prize, blackoutLoss, MAX_EV, MAX_TOTAL };
})();
