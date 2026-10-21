/* ============ effects.js — using a move ============
 *   G.BattleFx.useMove(battle, user, target, moveId, { locked, called })
 *
 * Most moves are handled generically from their PokeAPI data (G.MOVES[id].meta.k):
 *   damage · damage-ailment · damage-lower · damage-raise · damage-heal · ohko   -> damaging()
 *   ailment · net-good-stats · heal · swagger · force-switch                     -> statusMove()
 * Moves with their own rules live in moves-special.js (G.SpecialMoves[id]); hooks:
 *   charge(b, user) / charge: true     two-turn move (first turn charges); noChargeIf(b, user)
 *   use(b, user, target, M)            does the whole move after the "used X" line
 *   check(b, user, target) -> false    fails before the accuracy check
 *   power(b, user, target, M, hit)     variable base power      fixed(b, user, target, M) -> HP lost (or null = fail)
 *   acc(b, user, target, M)            variable accuracy        hits(b, user) -> number of hits
 *   moveType(b, user)                  variable type             typeless: true (Struggle)
 *   hitsInvuln: ['fly' | 'dig']        hits a target that is up in the sky / underground (double power)
 *   after(b, user, target, M, res)     after the move hits      onMiss(b, user, target, M)
 *   recharge · rampage · leaveOne · whileAsleep · thawsUser   flags
 * A move with no handler and no generic meaning fails ("But it failed!"): those are
 * listed in G.SpecialMoves.FALLBACK so it is a deliberate choice (tests check it).
 */
G.BattleFx = (() => {
  const SELF = new Set(['user', 'users-field', 'user-and-allies', 'entire-field', 'all-allies', 'user-or-ally', 'ally', 'all-pokemon']);
  const POWDER = new Set(['sleep-powder', 'stun-spore', 'poison-powder', 'spore', 'cotton-spore']);
  const AIL = { paralysis: 'par', sleep: 'slp', poison: 'psn', burn: 'brn', freeze: 'frz' };
  const CRIT = [24, 8, 2, 1];

  const isSelf = M => SELF.has(M.tgt) || (M.tgt === 'specific-move' && M.cat === 'status');

  function useMove(b, user, target, id, ctx = {}) {
    const M = G.MOVES[id];
    if (!M) { b.emit('fail', {}); return; }
    const S = G.SpecialMoves[id] || {};
    const who = { side: user.side, uid: user.mon.uid };

    // Two-turn moves: the first turn only charges.
    if (S.charge && ctx.locked !== 'charge') {
      if (!(S.noChargeIf && S.noChargeIf(b, user))) {
        user.vol.charging = id;
        b.emit('charge', Object.assign({ move: id }, who));
        if (typeof S.charge === 'function') S.charge(b, user);
        return;
      }
    }
    if (ctx.locked === 'charge') { user.vol.charging = null; user.vol.invuln = null; }

    b.emit('move', Object.assign({ move: id }, who));
    user.lastMove = id;
    const self = isSelf(M);

    if (!self) {
      if (!b.alive(target)) { b.emit('noTarget', {}); return endRampage(b, user, S); }
      if (target.vol.protect && !S.ignoresProtect) { b.emit('protected', { side: target.side, uid: target.mon.uid }); return endRampage(b, user, S); }
      if (S.check && S.check(b, user, target, M) === false) { b.emit('fail', {}); return endRampage(b, user, S); }
      if (!accuracy(b, user, target, M, S)) {
        b.emit('miss', who);
        if (S.onMiss) S.onMiss(b, user, target, M);
        return endRampage(b, user, S);
      }
    } else if (S.check && S.check(b, user, target, M) === false) { b.emit('fail', {}); return; }
    user.vol.lockOn = false;

    let res;
    if (S.use) res = S.use(b, user, target, M, ctx);
    else if (M.cat !== 'status' || S.fixed || S.power) res = damaging(b, user, target, M, S);
    else res = statusMove(b, user, target, M, S);
    if (S.after && res !== false) S.after(b, user, target, M, res || {});
    if (S.recharge && res && res.total > 0) user.vol.recharge = true;
    if (S.rampage) rampage(b, user, id);
  }

  function rampage(b, user, id) {
    if (!user.vol.rampage) user.vol.rampage = { move: id, turns: b.rng.int(2, 3) };
    if (--user.vol.rampage.turns <= 0) {
      user.vol.rampage = null;
      b.confuse(user, { why: 'fatigue', silent: false });
    }
  }
  function endRampage(b, user, S) { if (S.rampage) user.vol.rampage = null; user.vol.charging = null; user.vol.invuln = null; return false; }

  function accuracy(b, user, target, M, S) {
    if (target.vol.invuln && !(S.hitsInvuln && S.hitsInvuln.includes(target.vol.invuln)) && !user.vol.lockOn) return false;
    if (user.vol.lockOn) return true;
    if (M.meta.k === 'ohko') return target.mon.lvl <= user.mon.lvl && b.rng.int(1, 100) <= user.mon.lvl - target.mon.lvl + 30;
    const acc = S.acc ? S.acc(b, user, target, M) : M.acc;
    if (acc == null) return true;
    const eva = target.vol.foresight ? Math.min(0, target.stages.eva) : target.stages.eva;
    const st = Math.max(-6, Math.min(6, user.stages.acc - eva));
    return b.rng.int(1, 100) <= Math.floor(acc * G.Stats.accStage(st));
  }

  /** One hit's damage: { dmg, crit } (power already known). */
  function hitDamage(b, user, target, M, S, pow, eff, type) {
    const stage = (M.meta.crit || 0) + (user.vol.focusEnergy ? 2 : 0);
    const crit = b.rng.int(1, CRIT[Math.min(3, stage)]) === 1;
    const phys = M.cat === 'physical';
    const atk = b.stat(user, phys ? 'atk' : 'spa', { crit, attacking: true });
    const def = b.stat(target, phys ? 'def' : 'spd', { crit, defending: true });
    const field = b.sideOf(target).field;
    const dmg = G.Damage.calc({
      lvl: user.mon.lvl, pow, atk, def, eff, crit, roll: b.rng.int(85, 100),
      stab: !S.typeless && user.types.includes(type),
      burn: phys && user.mon.status === 'brn',
      screen: !crit && (phys ? field.reflect : field.lightScreen) > 0,
      weather: S.typeless ? 1 : b.weatherMult(type)
    });
    return { dmg, crit };
  }

  function hitCount(b, user, M, S) {
    if (S.hits) return S.hits(b, user);
    const h = M.meta.hits;
    if (!h) return 1;
    if (h[0] === h[1]) return h[0];
    if (h[0] === 2 && h[1] === 5) { const r = b.rng.int(1, 100); return r <= 35 ? 2 : r <= 70 ? 3 : r <= 85 ? 4 : 5; }
    return b.rng.int(h[0], h[1]);
  }

  function damaging(b, user, target, M, S) {
    const type = S.moveType ? S.moveType(b, user) : M.type;
    const eff = S.typeless ? 1 : b.eff(type, target);
    if (eff === 0) { b.emit('noEffect', { side: target.side, uid: target.mon.uid }); return { total: 0 }; }
    if (M.meta.k === 'ohko') {
      const d = b.hurt(target, target.mon.hp, { user, move: M, eff: 1 });
      if (target.mon.hp <= 0) b.emit('ohko', {});
      return { total: d };
    }
    const subBefore = target.vol.substitute > 0;
    const n = hitCount(b, user, M, S);
    let total = 0, done = 0;
    for (let i = 0; i < n; i++) {
      if (!b.alive(target)) break;
      let dmg, crit = false;
      if (S.fixed) {
        dmg = S.fixed(b, user, target, M);
        if (dmg == null || dmg <= 0) { b.emit('fail', {}); return false; }
      } else {
        let pow = S.power ? S.power(b, user, target, M, i) : M.pow;
        if (!pow) { b.emit('fail', {}); return false; }
        if (S.hitsInvuln && target.vol.invuln && S.hitsInvuln.includes(target.vol.invuln)) pow *= 2;
        ({ dmg, crit } = hitDamage(b, user, target, M, S, pow, eff, type));
      }
      total += b.hurt(target, dmg, { user, move: M, crit, eff: S.fixed ? 1 : eff, leaveOne: S.leaveOne });
      done++;
    }
    if (done > 1) b.emit('hits', { n: done });
    if (!S.fixed && !S.typeless && eff !== 1) b.emit('effective', { side: target.side, eff });

    // Drain and recoil
    if (M.meta.drain > 0 && total > 0 && b.alive(user)) b.heal(user, Math.max(1, Math.floor(total * M.meta.drain / 100)), 'drain', { from: target.mon.uid, fromSide: target.side });
    if (M.meta.drain < 0 && total > 0 && b.alive(user)) b.hurt(user, Math.max(1, Math.floor(total * -M.meta.drain / 100)), { why: 'recoil' });

    // A frozen target is thawed by a fire move.
    if (type === 'fire' && target.mon.status === 'frz' && total > 0 && b.alive(target)) { target.mon.status = null; b.emit('thaw', { side: target.side, uid: target.mon.uid }); }

    // Secondary effects (not through a substitute).
    if (!subBefore && total > 0 && b.alive(target)) {
      const k = M.meta.k, ail = M.meta.ail;
      if (k === 'damage-ailment' && ail && b.rng.pct(M.meta.ailP || M.eff || 100)) secondaryAilment(b, user, target, M, ail);
      if (M.meta.flinch && !target.moved && b.rng.pct(M.meta.flinch)) target.vol.flinch = true;
      if (k === 'damage-lower' && b.rng.pct(M.meta.statP || 100)) for (const [s, d] of M.stats) b.stage(target, s, d, { source: user });
    }
    if (M.meta.k === 'damage-raise' && total > 0 && b.alive(user) && b.rng.pct(M.meta.statP || 100)) for (const [s, d] of M.stats) b.stage(user, s, d, { source: user });
    return { total, hits: done };
  }

  function secondaryAilment(b, user, target, M, ail) {
    if (AIL[ail]) return b.inflict(target, AIL[ail], { source: user, silent: true });
    if (ail === 'confusion') return b.confuse(target, { source: user, silent: true });
    if (ail === 'trap' && !target.vol.trap) {
      target.vol.trap = { turns: b.rng.int(4, 5), move: idOf(M) };
      b.emit('trap', { side: target.side, uid: target.mon.uid, move: target.vol.trap.move });
    }
    return false;
  }
  let slugs = null;
  const idOf = M => (slugs || (slugs = new Map(Object.entries(G.MOVES).map(([k, v]) => [v, k])))).get(M);

  function statusMove(b, user, target, M, S) {
    const k = M.meta.k, id = idOf(M);
    if (k === 'ailment') return ailmentMove(b, user, target, M, id);
    if (k === 'net-good-stats') {
      const t = isSelf(M) ? user : target;
      let any = false;
      for (const [s, d] of M.stats) any = b.stage(t, s, d, { source: user, statusMove: t !== user }) || any;
      return any ? {} : false;
    }
    if (k === 'heal') {
      const max = b.maxHp(user);
      if (user.mon.hp >= max) { b.emit('fail', {}); return false; }
      const pct = S.healPct ? S.healPct(b, user) : M.meta.heal;
      b.heal(user, Math.max(1, Math.floor(max * pct / 100)), 'move');
      return {};
    }
    if (k === 'swagger') {
      for (const [s, d] of M.stats) b.stage(target, s, d, { source: user, statusMove: true });
      b.confuse(target, { source: user, statusMove: true });
      return {};
    }
    if (k === 'force-switch') return forceSwitch(b, user, target);
    b.emit('fail', {});
    return false;
  }

  function ailmentMove(b, user, target, M, id) {
    const ail = M.meta.ail;
    const tid = { side: target.side, uid: target.mon.uid };
    if (POWDER.has(id) && target.types.includes('grass')) { b.emit('noEffect', tid); return false; }
    if (M.type === 'electric' && AIL[ail] && b.eff('electric', target) === 0) { b.emit('noEffect', tid); return false; }
    if (AIL[ail]) {
      const s = id === 'toxic' ? 'tox' : AIL[ail];
      return b.inflict(target, s, { source: user, statusMove: true }) ? {} : false;
    }
    const subBlocks = target.vol.substitute > 0 && target !== user;
    switch (ail) {
      case 'confusion': return b.confuse(target, { source: user, statusMove: true }) ? {} : false;
      case 'leech-seed':
        if (target.types.includes('grass')) { b.emit('noEffect', tid); return false; }
        if (target.vol.seeded || subBlocks) { b.emit('fail', {}); return false; }
        target.vol.seeded = true; b.emit('seeded', tid); return {};
      case 'infatuation':
        if (!user.mon.gender || !target.mon.gender || user.mon.gender === target.mon.gender || target.vol.attract || subBlocks) { b.emit('fail', {}); return false; }
        target.vol.attract = true; b.emit('attract', tid); return {};
      case 'yawn':
        if (target.mon.status || target.vol.yawn || subBlocks || b.sideOf(target).field.safeguard) { b.emit('fail', {}); return false; }
        target.vol.yawn = 2; b.emit('yawn', tid); return {};
      case 'nightmare':
        if (target.mon.status !== 'slp' || target.vol.nightmare || subBlocks) { b.emit('fail', {}); return false; }
        target.vol.nightmare = true; b.emit('nightmare', tid); return {};
      case 'perish-song':
        for (const bm of [user, target]) if (b.alive(bm) && !bm.vol.perish) bm.vol.perish = 4;
        b.emit('perishSong', {}); return {};
      case 'ingrain':
        if (user.vol.ingrain) { b.emit('fail', {}); return false; }
        user.vol.ingrain = true; b.emit('ingrain', { side: user.side, uid: user.mon.uid }); return {};
      case 'no-type-immunity':
        target.vol.foresight = true; b.emit('identified', tid); return {};
      case 'disable': return G.SpecialMoves.disable.use(b, user, target, M);
      default: b.emit('fail', {}); return false;
    }
  }

  function forceSwitch(b, user, target) {
    if (target.vol.ingrain) { b.emit('fail', {}); return false; }
    if (b.kind === 'wild') {
      b.emit('blownAway', { side: target.side, uid: target.mon.uid });
      b.finish(target.side === 1 ? 'fled' : 'run');
      return {};
    }
    const side = b.sideOf(target);
    const opts = side.party.map((m, i) => i).filter(i => i !== side.active && side.party[i].hp > 0);
    if (!opts.length) { b.emit('fail', {}); return false; }
    b.emit('blownAway', { side: target.side, uid: target.mon.uid });
    b.sendOut(side, opts[b.rng.int(0, opts.length - 1)]);
    b.emit('draggedOut', { side: target.side, uid: side.bm.mon.uid });
    return {};
  }

  return { useMove, damaging, isSelf, POWDER, AIL, idOf };
})();
