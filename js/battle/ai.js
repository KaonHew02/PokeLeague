/* ============ ai.js — what the other side does ============
 *   G.BattleAI.choose(battle, side) -> action
 *
 *   wild Pokémon      'random'  any move with PP left
 *   most trainers     'basic'   scores every move (expected damage against the
 *                               target's HP, useful status moves) and usually takes
 *                               the best one, sometimes the second best
 *   gym leaders etc.  'leader'  'basic', and heals with their items when low
 * Randomness comes from the battle's RNG, so battles stay reproducible. It knows the target's
 * ability (Levitate through b.eff, Water Absorb, Wonder Guard, Limber...) and does not waste moves on it.
 * Double battles (chapter 40): choose(b, side, slot) scores each move against each foe and aims at the
 * best one; a move on both foes counts both (half damage each), Earthquake counts its partner against it
 * (unless the partner cannot be hit), Helping Hand is worth something when the partner can attack.
 * A multi battle (chapter 55): the player's partner plays like a 'basic' trainer.
 */
G.BattleAI = (() => {
  function usable(bm) {
    return bm.mon.moves.map((m, slot) => ({ m, slot }))
      .filter(({ m }) => m.pp > 0 && !(bm.vol.disable && bm.vol.disable.move === m.id) && !(bm.vol.encore && bm.vol.encore.move !== m.id)
        && !(G.Held.locked(bm) && G.Held.locked(bm) !== m.id)                 // a Choice item (chapter 93)
        && !(bm.vol.taunt && G.MOVES[m.id] && G.MOVES[m.id].cat === 'status'));    // Taunt (chapter 110)
  }

  function choose(b, side, slot) {
    // A roaming Pokémon (rules.roamer, chapter 42) flees whenever it is not held.
    if (b.rules.roamer && b.kind === 'wild' && side === b.foe && !b.held(side.bm)) return { type: 'flee' };
    if (b.double) return chooseDouble(b, side, slot || 0);
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

  /** Doubles: the move and its target for the battler in this slot. */
  function chooseDouble(b, side, slot) {
    const bm = side.bms[slot];
    const moves = usable(bm);
    const foes = b.foes(bm);
    const aim = t => (t ? { side: t.side, slot: t.slot || 0 } : undefined);
    if (!moves.length) return { type: 'move', id: 'struggle', target: aim(foes[0]) };
    const ai = side === b.player ? 'basic' : side.trainer ? side.trainer.ai || 'basic' : 'random';
    if (ai === 'leader') { const it = healItem(b, side, slot); if (it) return it; }
    const scored = [];
    for (const x of moves) {
      const M = G.MOVES[x.m.id], t = G.BattleFx.tgtOf(M, x.m.id);
      if (t === 'all-opponents' || t === 'all-other-pokemon') {
        let s = foes.reduce((n, f) => n + score(b, bm, f, x.m.id) * (t === 'all-opponents' && foes.length > 1 ? 0.5 : 1), 0);
        const ally = b.ally(bm);
        if (t === 'all-other-pokemon' && ally) s -= 1.5 * score(b, bm, ally, x.m.id);
        scored.push({ slot: x.slot, s, target: aim(foes[0]) });
      } else if (x.m.id === 'helping-hand') {
        const ally = b.ally(bm);
        scored.push({ slot: x.slot, s: ally && !ally.moved && ally.mon.moves.some(m => G.MOVES[m.id] && G.MOVES[m.id].cat !== 'status') ? 18 : 0 });
      } else if (G.BattleFx.isSelf(M)) {
        scored.push({ slot: x.slot, s: score(b, bm, foes[0] || b.other(bm), x.m.id) });
      } else {
        let best = null;
        for (const f of foes) { const s = score(b, bm, f, x.m.id); if (!best || s > best.s) best = { s, f }; }
        scored.push({ slot: x.slot, s: best ? best.s : 0, target: aim(best ? best.f : foes[0]) });
      }
    }
    scored.sort((p, q) => q.s - p.s || p.slot - q.slot);
    if (ai === 'random') { const r = scored[b.rng.int(0, scored.length - 1)]; return { type: 'move', slot: r.slot, target: r.target || aim(foes[0]) }; }
    const good = scored.filter(x => x.s > 0);
    const pick = !good.length ? scored[0] : good.length > 1 && b.rng.pct(20) ? good[1] : good[0];
    return { type: 'move', slot: pick.slot, target: pick.target };
  }

  /** Rough value of a move right now (higher is better; 0 = pointless). */
  /** Chapter 110: Spikes and Toxic Spikes while the foe has someone to send in; Taunt after the foe used a status move;
   *  Wish below half HP; Tailwind once; Baton Pass with two stages or more to pass on. -> a score, or null (not one of them) */
  function special110(b, user, target, id) {
    const foeSide = b.sides[1 - user.side], mine = b.sideOf(user);
    const benchFoe = foeSide.party.some((m, i) => m.hp > 0 && !foeSide.actives.includes(i));
    switch (id) {
      case 'spikes': return benchFoe && (foeSide.spikes || 0) < 3 ? 14 - 3 * (foeSide.spikes || 0) : 0;
      case 'toxic-spikes': return benchFoe && (foeSide.toxicSpikes || 0) < 2 ? 12 - 4 * (foeSide.toxicSpikes || 0) : 0;
      case 'taunt': {
        const last = target.lastMove && G.MOVES[target.lastMove];
        return target.vol.taunt ? 0 : last && last.cat === 'status' ? 20 : 2;
      }
      case 'wish': return !b.wishes[user.side + ':' + (user.slot || 0)] && user.mon.hp * 2 < G.Mon.maxHp(user.mon) ? 35 : 0;
      case 'tailwind': return mine.field.tailwind ? 0 : 12;
      case 'baton-pass': {
        const up = Object.values(user.stages).reduce((a, v) => a + Math.max(0, v), 0);
        return up >= 2 && b.bench(mine, user.slot || 0).length ? 25 : 0;
      }
    }
    return null;
  }

  /** Chapter 110: what a delayed or risky attack is worth beside an ordinary one. Future Sight and Doom Desire: nothing while
   *  one waits on that place, else 0.6 (it lands two turns later); Focus Punch: a quarter, unless the target cannot hit back
   *  (asleep or frozen) or a Substitute takes the hit. */
  function delayed(b, user, target, id) {
    if (id === 'future-sight' || id === 'doom-desire') return b.futures && b.futures[target.side + ':' + (target.slot || 0)] ? 0 : 0.6;
    if (id === 'focus-punch') return target.mon.status === 'slp' || target.mon.status === 'frz' || user.vol.substitute > 0 ? 1 : 0.25;
    return 1;
  }

  function score(b, user, target, id) {
    const M = G.MOVES[id], S = G.SpecialMoves[id] || {};
    if (!M || !target) return 0;
    const tHp = Math.max(1, target.mon.hp);
    if (M.cat !== 'status') {
      const type = S.moveType ? S.moveType(b, user) : M.type;
      const eff = S.typeless ? 1 : b.eff(type, target, user);
      if (eff === 0 || (!S.typeless && G.Abilities.immune(user, target, M, type, eff))) return 0;
      if (M.meta.k === 'ohko' && G.Abilities.noOhko(target)) return 0;
      let est;
      if (S.fixed) est = Math.max(0, S.fixed(b, user, target, M) || 0);
      else {
        const pow = S.power ? (S.check && S.check(b, user, target, M) === false ? 0 : guessPower(b, user, target, M, S, id)) : M.pow;
        if (!pow) return 0;
        const phys = M.cat === 'physical';
        est = G.Damage.calc({ lvl: user.mon.lvl, pow: Math.floor(pow * G.Abilities.powerMult(b, user, target, type)),
                              atk: b.stat(user, phys ? 'atk' : 'spa'), def: b.stat(target, phys ? 'def' : 'spd'),
                              eff, stab: user.types.includes(type), roll: 92, burn: phys && user.mon.status === 'brn' && user.ability !== 'guts' });
        const h = M.meta.hits; if (h) est *= (h[0] + h[1]) / 2;
      }
      if (S.charge || S.recharge) est *= 0.6;
      const acc = M.acc == null ? 1 : M.acc / 100;
      const late = delayed(b, user, target, id);
      if (!late) return 0;
      let s = Math.min(est, tHp) / G.Mon.maxHp(target.mon) * 100 * acc * late;
      if (est >= tHp && late === 1) s += 40 * acc;
      if (S.after && (id === 'self-destruct' || id === 'explosion')) s = user.mon.hp / G.Mon.maxHp(user.mon) < 0.25 ? s : s * 0.2;
      return s;
    }
    // status moves
    // Chapter 110: the moves this chapter made real, when they are worth it.
    const ch110 = special110(b, user, target, id);
    if (ch110 != null) return ch110;
    const k = M.meta.k, ail = M.meta.ail;
    if (!G.BattleFx.isSelf(M) && G.Abilities.immune(user, target, M, M.type, null)) return 0;
    if (k === 'ailment') {
      if (G.BattleFx.AIL[ail]) {
        if (target.mon.status || (G.BattleFx.POWDER.has(id) && target.types.includes('grass'))) return 0;
        if (M.type === 'electric' && b.eff('electric', target) === 0) return 0;
        // The same immunities the engine applies: no point trying them.
        const s = id === 'toxic' ? 'tox' : G.BattleFx.AIL[ail], ty = target.types;
        if ((s === 'brn' && ty.includes('fire')) || (s === 'par' && ty.includes('electric')) || (s === 'frz' && ty.includes('ice'))
            || ((s === 'psn' || s === 'tox') && (ty.includes('poison') || ty.includes('steel')))) return 0;
        if (b.sideOf(target).field.safeguard || G.Abilities.blocksStatus(target, s, b)) return 0;
        return { slp: 40, par: 32, psn: 24, brn: 28, frz: 30 }[G.BattleFx.AIL[ail]] || 20;
      }
      if (ail === 'confusion') return target.vol.confusion || G.Abilities.blocksConfusion(target) ? 0 : 22;
      if (ail === 'leech-seed') return target.vol.seeded || target.types.includes('grass') ? 0 : 26;
      if (ail === 'infatuation') {
        const g = user.mon.gender, h = target.mon.gender;
        return !g || !h || g === h || target.vol.attract || G.Abilities.blocksAttract(target) ? 0 : 24;
      }
      return 8;
    }
    if (k === 'net-good-stats') {
      const self = G.BattleFx.isSelf(M);
      const t = self ? user : target;
      const useful = M.stats.some(([s, d]) => (d > 0 ? t.stages[s] < 6 : t.stages[s] > -6) && (self ? t.stages[s] < 2 : t.stages[s] > -2)
                                                && (self || d > 0 || !G.Abilities.blocksDrop(t, s)));
      return useful ? 14 : 1;
    }
    if (k === 'heal') return user.mon.hp / G.Mon.maxHp(user.mon) < 0.5 ? 45 : 0;
    if (k === 'swagger') return target.vol.confusion || G.Abilities.blocksConfusion(target) ? 0 : 12;
    // Encore pays off when the foe just used a move that does no damage.
    if (id === 'encore') {
      const last = target.lastMove && G.MOVES[target.lastMove];
      return !last || target.vol.encore ? 0 : last.cat === 'status' ? 30 : 4;
    }
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

  function healItem(b, side, slot = 0) {
    const bm = side.bms[slot], max = G.Mon.maxHp(bm.mon);
    if (bm.mon.hp / max > 0.25 || bm.vol.embargo) return null;      // Embargo (chapter 104): no items on it
    for (const item of ['full-restore', 'max-potion', 'hyper-potion', 'super-potion', 'potion']) {
      if ((side.items[item] || 0) > 0) return { type: 'item', item, target: side.actives[slot] };
    }
    return null;
  }

  return { choose, score, delayed };
})();
