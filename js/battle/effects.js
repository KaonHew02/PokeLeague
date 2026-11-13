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
 *   hitsInvuln: ['fly' | 'dig' | 'dive']  hits a target in the sky / underground / underwater
 *   doubleVsInvuln                     ... and does double damage to it (Gust, Earthquake, Surf...)
 *   beforeHit(b, user, target, M)      just before the damage (Brick Break breaks screens)
 *   onBlocked(b, user, target, M)      the target protected itself or is immune (Explosion still faints)
 *   after(b, user, target, M, res)     after the move hits      onMiss(b, user, target, M)
 *   recharge · rampage · leaveOne · whileAsleep · thawsUser   flags
 * Abilities (abilities.js) are asked for accuracy, critical hits, power, immunities (Water Absorb,
 * Wonder Guard...), contact (Static...), secondary effects (Shield Dust, Serene Grace) and recoil.
 * Double battles (chapter 40): the move's targets come from its `tgt` (TARGET for the Generation 3
 * ones that differ): one chosen target (Follow Me and Lightning Rod draw it), both foes (×0.5 each
 * with two), everyone else (Earthquake: the partner too, full damage), a random foe. useMove() then
 * runs the target's part (Protect, accuracy, damage, effects) once per target; Magnitude rolls once and
 * Self-Destruct faints its user once (`oncePower`, `faints` in moves-special.js).
 * A move with no handler and no generic meaning fails ("But it failed!"): those are
 * listed in G.SpecialMoves.FALLBACK so it is a deliberate choice (tests check it).
 */
G.BattleFx = (() => {
  const SELF = new Set(['user', 'users-field', 'user-and-allies', 'entire-field', 'all-allies', 'user-or-ally', 'ally', 'all-pokemon']);
  const POWDER = new Set(['sleep-powder', 'stun-spore', 'poison-powder', 'spore', 'cotton-spore']);
  const AIL = { paralysis: 'par', sleep: 'slp', poison: 'psn', burn: 'brn', freeze: 'frz' };
  const CRIT = [24, 8, 2, 1];

  const isSelf = M => SELF.has(M.tgt) || (M.tgt === 'specific-move' && M.cat === 'status');
  // Generation 3 targets that later games changed (Surf hits only the foes).
  const TARGET = { surf: 'all-opponents' };
  const tgtOf = (M, id) => TARGET[id] || M.tgt;

  /** Doubles: who a move hits. -> { list, spread } (spread: the damage factor for each). */
  function targetsOf(b, user, target, M, id) {
    const t = tgtOf(M, id);
    if (t === 'all-opponents' || t === 'all-other-pokemon') {
      const list = b.foes(user);
      if (t === 'all-other-pokemon' && b.ally(user)) list.push(b.ally(user));
      return { list, spread: t === 'all-opponents' && list.length > 1 ? 0.5 : null, many: true };
    }
    if (t === 'random-opponent') {
      const fs = b.foes(user);
      return { list: fs.length ? [fs.length > 1 ? fs[b.rng.int(0, fs.length - 1)] : fs[0]] : [] };
    }
    // Counter and Mirror Coat strike back at whoever hit the user.
    if (t === 'specific-move' && user.lastHit && user.lastHit.uid) {
      const back = b.foes(user).find(f => f.mon.uid === user.lastHit.uid);
      if (back) return { list: [back] };
    }
    // One target: Follow Me draws the foes' moves, Lightning Rod the Electric ones (Generation 3).
    let one = target;
    if (target && target.side !== user.side) {
      const follow = b.foes(user).find(f => f.vol.followMe);
      if (follow) one = follow;
      else if (M.type === 'electric' || M.type === 'water') {
        // Storm Drain (chapter 44) draws the Water moves as Lightning Rod does the Electric ones.
        const draw = M.type === 'electric' ? 'lightning-rod' : 'storm-drain';
        const rod = b.allActive().find(x => x !== user && b.alive(x) && x.ability === draw);
        if (rod && rod !== target) { one = rod; G.Abilities.say(b, rod, 'rod'); }
      }
    }
    return { list: one ? [one] : [] };
  }

  /** A move used: while it is, a user with Mold Breaker ignores its targets' abilities (chapter 44). */
  function useMove(b, user, target, id, ctx = {}) {
    const prev = b.moldBreaker;
    b.moldBreaker = user.ability === 'mold-breaker' ? user : null;
    try { return use(b, user, target, id, ctx); } finally { b.moldBreaker = prev; }
  }
  // Gravity (chapter 44): nothing leaves the ground.
  const GROUNDED = new Set(['fly', 'bounce', 'jump-kick', 'high-jump-kick', 'splash', 'magnet-rise']);
  function use(b, user, target, id, ctx = {}) {
    const M = G.MOVES[id];
    if (!M) { b.emit('fail', {}); return; }
    const S = G.SpecialMoves[id] || {};
    const who = { side: user.side, uid: user.mon.uid };
    if (b.gravity && GROUNDED.has(id)) { b.emit('move', Object.assign({ move: id }, who)); b.emit('fail', {}); return; }

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

    // Doubles: the chosen target too (the battle screen aims the animation at it).
    b.emit('move', Object.assign({ move: id }, who, b.double && target && target !== user ? { tuid: target.mon.uid } : {}));
    user.lastMove = id;
    const self = isSelf(M);
    // Damp: no Self-Destruct or Explosion while it is out.
    const damp = G.Abilities.damp(b, id);
    if (damp) { G.Abilities.say(b, damp, 'damp', { move: id }); return; }

    if (b.double && !self) {
      const tg = targetsOf(b, user, target, M, id);
      if (tg.many) return useOnMany(b, user, tg, M, S, id, ctx);
      target = tg.list[0] || target;
    }
    if (!self) {
      if (!b.alive(target)) { b.emit('noTarget', {}); return endRampage(b, user, S); }
      if (target.vol.protect && !S.ignoresProtect) {
        b.emit('protected', { side: target.side, uid: target.mon.uid });
        if (S.onBlocked) S.onBlocked(b, user, target, M);
        return endRampage(b, user, S);
      }
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
    if (S.roll && res !== false) roll(b, user, id);
  }

  /** Doubles: a move that hits several Pokémon, each in turn (one "used" line, one PP). */
  function useOnMany(b, user, tg, M, S, id, ctx) {
    const who = { side: user.side, uid: user.mon.uid };
    if (!tg.list.length) { b.emit('noTarget', {}); return endRampage(b, user, S); }
    // Self-Destruct and Explosion: the user faints once, after hitting everyone.
    const per = S.faints ? Object.assign({}, S, { after: null, onMiss: null, onBlocked: null }) : S;
    const sub = Object.assign({}, ctx, { spread: tg.spread });
    if (S.oncePower) sub.pow = S.power(b, user, tg.list[0], M, 0);          // Magnitude: one roll for everyone
    let total = 0, any = false;
    for (const t of tg.list) {
      if (!b.alive(t) || !b.alive(user)) continue;
      if (t.vol.protect && !S.ignoresProtect) { b.emit('protected', { side: t.side, uid: t.mon.uid }); if (per.onBlocked) per.onBlocked(b, user, t, M); continue; }
      if (S.check && S.check(b, user, t, M) === false) { b.emit('fail', {}); continue; }
      if (!accuracy(b, user, t, M, S)) { b.emit('miss', Object.assign({ target: t.mon.uid, tside: t.side }, who)); if (per.onMiss) per.onMiss(b, user, t, M); continue; }
      let res;
      if (S.use) res = S.use(b, user, t, M, sub);
      else if (M.cat !== 'status' || S.fixed || S.power) res = damaging(b, user, t, M, per, sub);
      else res = statusMove(b, user, t, M, per);
      if (per.after && res !== false) per.after(b, user, t, M, res || {});
      if (res && res.total) total += res.total;
      if (res !== false) any = true;
    }
    user.vol.lockOn = false;
    if (S.faints && S.after) S.after(b, user, tg.list[0], M, { total });
    if (S.recharge && total > 0) user.vol.recharge = true;
    if (S.rampage) rampage(b, user, id);
    if (S.roll && any) roll(b, user, id);
  }

  /** Rollout: locked in for five hits; `n` counts the hits so far. */
  function roll(b, user, id) {
    const r = user.vol.rampage;
    if (!r || r.move !== id) user.vol.rampage = { move: id, turns: 4, n: 1, roll: true };
    else if (--r.turns <= 0) user.vol.rampage = null;
    else r.n++;
  }

  function rampage(b, user, id) {
    if (!user.vol.rampage) user.vol.rampage = { move: id, turns: b.rng.int(2, 3) };
    if (--user.vol.rampage.turns <= 0) {
      user.vol.rampage = null;
      b.confuse(user, { why: 'fatigue', silent: false });
    }
  }
  function endRampage(b, user, S) { if (S.rampage || S.roll) user.vol.rampage = null; user.vol.charging = null; user.vol.invuln = null; return false; }

  function accuracy(b, user, target, M, S) {
    // No Guard (chapter 44): it hits, even in the sky or underground (a one-hit KO still needs the level).
    if (G.Abilities.alwaysHits(b, user, target) && !(M.meta.k === 'ohko' && target.mon.lvl > user.mon.lvl)) return true;
    if (target.vol.invuln && !(S.hitsInvuln && S.hitsInvuln.includes(target.vol.invuln)) && !user.vol.lockOn) return false;
    if (user.vol.lockOn) return true;
    if (M.meta.k === 'ohko') return target.mon.lvl <= user.mon.lvl && b.rng.int(1, 100) <= user.mon.lvl - target.mon.lvl + 30;
    const acc = S.acc ? S.acc(b, user, target, M) : M.acc;
    if (acc == null) return true;
    // Unaware (chapter 44): the other one's accuracy or evasion stages do not count.
    const eva = user.ability === 'unaware' ? 0 : target.vol.foresight ? Math.min(0, target.stages.eva) : target.stages.eva;
    const st = Math.max(-6, Math.min(6, (G.Abilities.unaware(b, target) ? 0 : user.stages.acc) - eva));
    // Bright Powder; Compound Eyes, Hustle, Sand Veil
    return b.rng.int(1, 100) <= Math.floor(acc * G.Stats.accStage(st) * G.Held.accMult(target.mon) * G.Abilities.accMult(b, user, target, M)
                                           * (b.gravity ? 5 / 3 : 1));          // Gravity
  }

  /** One hit's damage: { dmg, crit } (power already known). spread: doubles, a move on both foes. */
  function hitDamage(b, user, target, M, S, pow, eff, type, spread) {
    const stage = (M.meta.crit || 0) + (user.vol.focusEnergy ? 2 : 0) + G.Held.critBonus(user.mon) + G.Abilities.critBonus(user);   // Super Luck
    const crit = b.rng.int(1, CRIT[Math.min(3, stage)]) === 1 && !G.Abilities.noCrit(target, b);     // Battle Armor, Shell Armor
    const phys = M.cat === 'physical';
    // Unaware: the stages of the Pokémon facing it do not count.
    const atk = b.stat(user, phys ? 'atk' : 'spa', { crit, attacking: true, noStages: G.Abilities.unaware(b, target) });
    const def = b.stat(target, phys ? 'def' : 'spd', { crit, defending: true, noStages: user.ability === 'unaware' });
    const field = b.sideOf(target).field;
    const dmg = G.Damage.calc({
      lvl: user.mon.lvl, pow: Math.floor(pow * G.Held.power(user.mon, type) * (S.typeless ? 1 : G.Abilities.powerMult(b, user, target, type, M, pow))
                                * (user.vol.helped ? 1.5 : 1)),                // Helping Hand
      spread,
      atk, def, eff, crit: crit && G.Abilities.critMult(user), roll: b.rng.int(85, 100),     // Sniper
      stab: !S.typeless && user.types.includes(type) && G.Abilities.stab(user),              // Adaptability
      final: S.typeless ? 1 : G.Abilities.finalMult(b, user, target, eff),                 // Tinted Lens, Filter, Solid Rock
      burn: phys && user.mon.status === 'brn' && user.ability !== 'guts',
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
    if (h[0] === 2 && h[1] === 5 && G.Abilities.skillLink(user)) return 5;          // Skill Link
    if (h[0] === 2 && h[1] === 5) { const r = b.rng.int(1, 100); return r <= 35 ? 2 : r <= 70 ? 3 : r <= 85 ? 4 : 5; }
    return b.rng.int(h[0], h[1]);
  }

  function damaging(b, user, target, M, S, ctx) {
    const type = G.Abilities.moveType(user, S.moveType ? S.moveType(b, user) : M.type, idOf(M));      // Normalize
    const eff = S.typeless ? 1 : b.eff(type, target, user);
    if (eff === 0) {
      b.emit('noEffect', { side: target.side, uid: target.mon.uid });
      if (b.arena) b.arenaSkill(user, 0);                                  // the Battle Arena's skill (chapter 79)
      if (S.onBlocked) S.onBlocked(b, user, target, M);
      return { total: 0 };
    }
    // Water Absorb, Volt Absorb, Flash Fire, Wonder Guard, Soundproof
    if (!S.typeless && G.Abilities.stops(b, user, target, M, type, eff)) {
      if (S.onBlocked) S.onBlocked(b, user, target, M);
      return { total: 0 };
    }
    if (S.beforeHit) S.beforeHit(b, user, target, M);
    if (M.meta.k === 'ohko' && G.Abilities.noOhko(target, b)) { G.Abilities.say(b, target, 'protect'); return { total: 0 }; }   // Sturdy
    if (M.meta.k === 'ohko') {
      const d = b.hurt(target, target.mon.hp, { user, move: M, eff: 1 });
      if (target.mon.hp <= 0) b.emit('ohko', {});
      return { total: d };
    }
    const subBefore = target.vol.substitute > 0;
    const n = hitCount(b, user, M, S);
    let total = 0, done = 0;
    for (let i = 0; i < n; i++) {
      if (!b.alive(target) || !b.alive(user)) break;
      let dmg, crit = false;
      if (S.fixed) {
        dmg = S.fixed(b, user, target, M);
        if (dmg == null || dmg <= 0) { b.emit('fail', {}); return false; }
      } else {
        let pow = ctx && ctx.pow != null ? ctx.pow : S.power ? S.power(b, user, target, M, i) : M.pow;
        if (!pow) { b.emit('fail', {}); return false; }
        if (S.doubleVsInvuln && target.vol.invuln && S.hitsInvuln.includes(target.vol.invuln)) pow *= 2;
        ({ dmg, crit } = hitDamage(b, user, target, M, S, pow, eff, type, ctx && ctx.spread));
      }
      const sub = target.vol.substitute > 0;
      total += b.hurt(target, dmg, { user, move: M, crit, eff: S.fixed ? 1 : eff, leaveOne: S.leaveOne });
      done++;
      if (crit && !sub) G.Abilities.angerPoint(b, target);         // Anger Point (chapter 44)
      if (!sub) G.Abilities.contact(b, user, target, M);          // Static, Rough Skin...
    }
    if (done > 1) b.emit('hits', { n: done });
    if (!S.fixed && !S.typeless && eff !== 1) b.emit('effective', { side: target.side, eff });

    // Drain and recoil
    if (M.meta.drain > 0 && total > 0 && b.alive(user)) {
      const amt = Math.max(1, Math.floor(total * M.meta.drain / 100));
      if (G.Abilities.liquidOoze(target)) b.hurt(user, amt, { why: 'ooze' });      // Liquid Ooze
      else b.heal(user, amt, 'drain', { from: target.mon.uid, fromSide: target.side });
    }
    if (M.meta.drain < 0 && total > 0 && b.alive(user) && !G.Abilities.noRecoil(user)) b.hurt(user, Math.max(1, Math.floor(total * -M.meta.drain / 100)), { why: 'recoil' });

    // A frozen target is thawed by a fire move.
    if (type === 'fire' && target.mon.status === 'frz' && total > 0 && b.alive(target)) { target.mon.status = null; b.emit('thaw', { side: target.side, uid: target.mon.uid }); }

    // Secondary effects (not through a substitute, nor on Shield Dust); Serene Grace doubles their chance.
    const pct = p => G.Abilities.chance(user, p);
    if (!subBefore && total > 0 && b.alive(target) && !G.Abilities.shieldDust(target, b)) {
      const k = M.meta.k, ail = M.meta.ail;
      if (k === 'damage-ailment' && ail && b.rng.pct(pct(M.meta.ailP || M.eff || 100))) secondaryAilment(b, user, target, M, ail);
      if (M.meta.flinch && !target.moved && b.rng.pct(pct(M.meta.flinch))) target.vol.flinch = true;
      if (k === 'damage-lower' && b.rng.pct(pct(M.meta.statP || 100))) for (const [s, d] of M.stats) b.stage(target, s, d, { source: user });
    }
    if (M.meta.k === 'damage-raise' && total > 0 && b.alive(user) && b.rng.pct(pct(M.meta.statP || 100))) for (const [s, d] of M.stats) b.stage(user, s, d, { source: user });
    if (total > 0 && !S.typeless) G.Abilities.afterHit(b, user, target, type);    // Color Change
    G.Held.afterHit(b, user, target, M, total);          // King's Rock, Shell Bell
    return { total, hits: done };
  }

  function secondaryAilment(b, user, target, M, ail) {
    if (AIL[ail]) return b.inflict(target, AIL[ail], { source: user, silent: true });
    if (ail === 'confusion') return b.confuse(target, { source: user, silent: true });
    if (ail === 'trap' && !target.vol.trap) {
      target.vol.trap = { turns: b.rng.int(4, 5), move: idOf(M), src: user.mon.uid };
      b.emit('trap', { side: target.side, uid: target.mon.uid, move: target.vol.trap.move });
    }
    return false;
  }
  let slugs = null;
  const idOf = M => (slugs || (slugs = new Map(Object.entries(G.MOVES).map(([k, v]) => [v, k])))).get(M);

  function statusMove(b, user, target, M, S) {
    const k = M.meta.k, id = idOf(M);
    if (!isSelf(M) && G.Abilities.stops(b, user, target, M, M.type, null)) return false;    // Soundproof, Volt Absorb, Flash Fire
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
        target.vol.seeded = true;
        if (b.double) target.vol.seededBy = { side: user.side, slot: user.slot || 0 };
        b.emit('seeded', tid); return {};
      case 'infatuation':
        if (G.Abilities.blocksAttract(target)) { G.Abilities.say(b, target, 'protect'); return false; }      // Oblivious
        if (!user.mon.gender || !target.mon.gender || user.mon.gender === target.mon.gender || target.vol.attract || subBlocks) { b.emit('fail', {}); return false; }
        target.vol.attract = true; b.emit('attract', tid); return {};
      case 'yawn':
        if (target.mon.status || target.vol.yawn || subBlocks || b.sideOf(target).field.safeguard) { b.emit('fail', {}); return false; }
        target.vol.yawn = 2; b.emit('yawn', tid); return {};
      case 'nightmare':
        if (target.mon.status !== 'slp' || target.vol.nightmare || subBlocks) { b.emit('fail', {}); return false; }
        target.vol.nightmare = true; b.emit('nightmare', tid); return {};
      case 'perish-song':
        for (const bm of b.double ? b.allActive() : [user, target]) if (b.alive(bm) && !bm.vol.perish) bm.vol.perish = 4;
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
    if (target.vol.ingrain || b.arena) { b.emit('fail', {}); return false; }     // the Battle Arena: no switching (chapter 79)
    if (G.Abilities.suctionCups(target)) { G.Abilities.say(b, target, 'protect'); return false; }
    if (b.kind === 'wild') {
      b.emit('blownAway', { side: target.side, uid: target.mon.uid });
      b.finish(target.side === 1 ? 'fled' : 'run');
      return {};
    }
    const side = b.sideOf(target), slot = target.slot || 0;
    const opts = side.party.map((m, i) => i).filter(i => !side.actives.includes(i) && side.party[i].hp > 0);
    if (!opts.length) { b.emit('fail', {}); return false; }
    b.emit('blownAway', { side: target.side, uid: target.mon.uid });
    G.Abilities.switchOut(b, target);                                // Natural Cure
    b.sendOut(side, opts[b.rng.int(0, opts.length - 1)], { noEntry: true, slot });
    b.emit('draggedOut', { side: target.side, uid: side.bms[slot].mon.uid });
    G.Abilities.switchIn(b, side.bms[slot]);
    return {};
  }

  return { useMove, damaging, isSelf, POWDER, AIL, idOf, tgtOf, targetsOf };
})();
