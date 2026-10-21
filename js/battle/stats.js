/* ============ stats.js — stat formulas (Generation 3 and later) ============
 * Stats are always arrays in the order hp, atk, def, spa, spd, spe.
 *
 *   G.Stats.calc(base, lvl, ivs, evs, nature) -> [hp, atk, def, spa, spd, spe]
 *     HP    = floor((2B + IV + floor(EV/4)) · L / 100) + L + 10
 *     other = floor((floor((2B + IV + floor(EV/4)) · L / 100) + 5) · nature)   nature ×1.1 / ×0.9
 *   G.Stats.expAt(growth, lvl)    total EXP needed for that level
 *   G.Stats.levelFor(growth, exp) the level that much EXP reaches
 *   G.Stats.stage(s)              multiplier of a stat stage (−6..+6): 2/8 .. 8/2
 *   G.Stats.accStage(s)           multiplier of an accuracy/evasion stage: 3/9 .. 9/3
 */
G.Stats = (() => {
  const ORDER = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

  /** ×1.1, ×0.9 or ×1 for this stat (as integer percent, to stay exact). */
  function naturePct(nature, stat) {
    const n = G.NATURES && G.NATURES[nature];
    if (!n) return 100;
    return n.up === stat && n.down !== stat ? 110 : n.down === stat && n.up !== stat ? 90 : 100;
  }

  function calc(base, lvl, ivs, evs, nature) {
    return ORDER.map((k, i) => {
      const core = Math.floor((2 * base[i] + ivs[i] + Math.floor(evs[i] / 4)) * lvl / 100);
      if (i === 0) return base[0] === 1 ? 1 : core + lvl + 10;       // (Shedinja would have 1 HP)
      return Math.floor((core + 5) * naturePct(nature, k) / 100);
    });
  }

  function expAt(growth, lvl) {
    const t = G.GROWTH[growth];
    return t[Math.max(1, Math.min(100, lvl))];
  }

  function levelFor(growth, exp) {
    const t = G.GROWTH[growth];
    let l = 1;
    while (l < 100 && t[l + 1] <= exp) l++;
    return l;
  }

  const stage = s => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
  const accStage = s => (s >= 0 ? (3 + s) / 3 : 3 / (3 - s));

  return { ORDER, calc, naturePct, expAt, levelFor, stage, accStage };
})();
