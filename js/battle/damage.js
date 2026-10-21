/* ============ damage.js — the damage formula (Generation 5 and later) ============
 *   G.Damage.calc({ lvl, pow, atk, def, stab, eff, crit, roll, burn, screen, weather })
 *     -> damage (an integer)
 *
 *   base = floor(floor(floor(2·L/5 + 2) · P · A / D) / 50) + 2
 *   then, rounding down after each step:
 *     weather ×1.5 / ×0.5 → critical ×1.5 → random roll 85..100 % → STAB ×1.5
 *     → type effectiveness → burn ×0.5 (physical) → Reflect / Light Screen ×0.5
 *   At least 1 unless the target is immune (eff 0 -> 0).
 *
 * `atk` and `def` are the effective stats, stages already applied (the battle
 * decides which stages a critical hit ignores).
 */
G.Damage = (() => {
  function base(lvl, pow, atk, def) {
    return Math.floor(Math.floor(Math.floor(2 * lvl / 5 + 2) * pow * atk / Math.max(1, def)) / 50) + 2;
  }

  function calc(o) {
    if (o.eff === 0) return 0;
    let d = base(o.lvl, o.pow, o.atk, o.def);
    if (o.weather) d = Math.floor(d * o.weather);
    if (o.crit) d = Math.floor(d * 1.5);
    d = Math.floor(d * (o.roll == null ? 100 : o.roll) / 100);
    if (o.stab) d = Math.floor(d * 1.5);
    d = Math.floor(d * (o.eff == null ? 1 : o.eff));
    if (o.burn) d = Math.floor(d / 2);
    if (o.screen) d = Math.floor(d / 2);
    return Math.max(1, d);
  }

  return { base, calc };
})();
