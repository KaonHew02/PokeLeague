/* ============ ai.js — what the other side does ============
 *   G.BattleAI.choose(battle, side) -> action
 *
 *   wild Pokémon      'random'  any move with PP left
 *   most trainers     'basic'   scores every move (expected damage against the
 *                               target's HP, useful status moves) and usually takes
 *                               the best one, sometimes the second best
 *   gym leaders etc.  'leader'  'basic', and heals with their items when low
 * Randomness comes from the battle's RNG, so battles stay reproducible.
 */
G.BattleAI = (() => {
  function usable(bm) {
    return bm.mon.moves.map((m, slot) => ({ m, slot })).filter(({ m }) => m.pp > 0 && !(bm.vol.disable && bm.vol.disable.move === m.id));
  }

  function choose(b, side) {
    const bm = side.bm;
    const moves = usable(bm);
    if (!moves.length) return { type: 'move', id: 'struggle' };
    const ai = side.trainer ? side.trainer.ai || 'basic' : 'random';
    if (ai === 'leader') { const it = healItem(b, side); if (it) return it; }
    if (ai === 'random') return { type: 'move', slot: moves[b.rng.int(0, moves.length - 1)].slot };
    const scored = moves.map(x => ({ slot: x.slot, s: score(b, bm, b.other(bm), x.m.id) })).sort((p, q) => q.s - p.s || p.slot - q.slot);
    const good = scored.filter(x => x.s > 0);
    if (!good.length) return { type: 'move', slot: scored[0].slot };
    const pick = good.length > 1 && b.rng.pct(20) ? good[1] : good[0];
    return { type: 'move', slot: pick.slot };
  }

  /** Rough value of a move right now (higher is better; 0 = pointless). */
  function score(b, user, target, id) {
    const M = G.MOVES[id], S = G.SpecialMoves[id] || {};
    if (!M || !target) return 0;
    const tHp = Math.max(1, target.mon.hp);
    if (M.cat !== 'status') {
      const type = S.moveType ? S.moveType(b, user) : M.type;
      const eff = S.typeless ? 1 : b.eff(type, target);
      if (eff === 0) return 0;
      let est;
      if (S.fixed) est = Math.max(0, S.fixed(b, user, target, M) || 0);
      else {
        const pow = S.power ? (S.check && S.check(b, user, target, M) === false ? 0 : guessPower(b, user, target, M, S, id)) : M.pow;
        if (!pow) return 0;
        const phys = M.cat === 'physical';
        est = G.Damage.calc({ lvl: user.mon.lvl, pow, atk: b.stat(user, phys ? 'atk' : 'spa'), def: b.stat(target, phys ? 'def' : 'spd'),
                              eff, stab: user.types.includes(type), roll: 92, burn: phys && user.mon.status === 'brn' });
        const h = M.meta.hits; if (h) est *= (h[0] + h[1]) / 2;
      }
      if (S.charge || S.recharge) est *= 0.6;
      const acc = M.acc == null ? 1 : M.acc / 100;
      let s = Math.min(est, tHp) / G.Mon.maxHp(target.mon) * 100 * acc;
      if (est >= tHp) s += 40 * acc;
      if (S.after && (id === 'self-destruct' || id === 'explosion')) s = user.mon.hp / G.Mon.maxHp(user.mon) < 0.25 ? s : s * 0.2;
      return s;
    }
    // status moves
    const k = M.meta.k, ail = M.meta.ail;
    if (k === 'ailment') {
      if (G.BattleFx.AIL[ail]) {
        if (target.mon.status || (G.BattleFx.POWDER.has(id) && target.types.includes('grass'))) return 0;
        if (M.type === 'electric' && b.eff('electric', target) === 0) return 0;
        return { slp: 40, par: 32, psn: 24, brn: 28, frz: 30 }[G.BattleFx.AIL[ail]] || 20;
      }
      if (ail === 'confusion') return target.vol.confusion ? 0 : 22;
      if (ail === 'leech-seed') return target.vol.seeded || target.types.includes('grass') ? 0 : 26;
      return 8;
    }
    if (k === 'net-good-stats') {
      const self = G.BattleFx.isSelf(M);
      const t = self ? user : target;
      const useful = M.stats.some(([s, d]) => (d > 0 ? t.stages[s] < 6 : t.stages[s] > -6) && (self ? t.stages[s] < 2 : t.stages[s] > -2));
      return useful ? 14 : 1;
    }
    if (k === 'heal') return user.mon.hp / G.Mon.maxHp(user.mon) < 0.5 ? 45 : 0;
    if (k === 'swagger') return target.vol.confusion ? 0 : 12;
    if (k === 'field-effect') return b.sideOf(user).field[{ 'light-screen': 'lightScreen' }[id] || id] ? 0 : 15;
    return S.use ? 6 : 0;
  }

  function guessPower(b, user, target, M, S, id) {
    // Magnitude rolls the battle's dice: use its average instead of asking it.
    if (id === 'magnitude') return 71;
    // The others only read the battlers (a copy of the volatile state, so nothing changes).
    try { return S.power(b, Object.assign(Object.create(user), { vol: Object.assign({}, user.vol) }), target, M, 0) || M.pow || 60; }
    catch (e) { return M.pow || 60; }
  }

  function healItem(b, side) {
    const bm = side.bm, max = G.Mon.maxHp(bm.mon);
    if (bm.mon.hp / max > 0.25) return null;
    for (const item of ['full-restore', 'max-potion', 'hyper-potion', 'super-potion', 'potion']) {
      if ((side.items[item] || 0) > 0) return { type: 'item', item, target: side.active };
    }
    return null;
  }

  return { choose, score };
})();
