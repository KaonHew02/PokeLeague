/* ============ battle.js — the turn engine (pure, deterministic) ============
 * No DOM, no clock, no Math.random: everything random comes from G.RNG(seed),
 * so the same seed and the same choices always give the same battle (and it
 * runs in node: tests, tools/sim_battle.js).
 *
 *   const b = G.Battle.create({ kind: 'wild' | 'trainer', seed,
 *     player: { name, id, party, bag },            // live references: the battle changes them
 *     foe:    { party, trainer: { id, name, title, ai: 'basic' | 'leader', items: {potion: 1}, prize: 20 } | null },
 *     rules:  { canLose: false, shift: true, where: 'kanto-route-1', noCatch: false, forceCatch: false (debug) } })
 *   b.start()            -> events[]
 *   b.prompt             -> { kind: 'action' } | { kind: 'switch', forced: true } | { kind: 'shift', next: sp }
 *                           | { kind: 'learn', uid, move } | null (battle over)
 *   b.options()          -> { moves: [{ slot, id, pp, max, usable }], struggle, switchable: [i], canRun, canBall, trapped }
 *   b.act(action)        -> events[]   { type: 'move', slot } | { type: 'switch', to } | { type: 'item', item, target, move }
 *                                      | { type: 'ball', item } | { type: 'run' }
 *   b.answer(answer)     -> events[]   { switchTo: i | -1 } | { learnSlot: 0..3 | -1 }
 *   b.result             -> { outcome: 'win' | 'lose' | 'run' | 'caught' | 'fled', money, caught, toBox, leveled: [uid], evolve: [uid], seen: [sp] }
 *
 * Events are plain objects { type, ... } that the battle screen plays in order
 * (text: G.BattleText.line(event, battle)). side 0 = the player, 1 = the foe.
 * Internally the turn is a queue of steps; a step that needs the player's
 * answer sets `prompt` and the queue waits until answer().
 */
G.Battle = (() => {
  const STAGES = ['atk', 'def', 'spa', 'spd', 'spe', 'acc', 'eva'];
  const STAT_INDEX = { atk: 1, def: 2, spa: 3, spd: 4, spe: 5 };

  class Battle {
    constructor(o) {
      this.rng = G.RNG(o.seed == null ? 1 : o.seed);
      this.kind = o.kind || 'wild';
      this.rules = Object.assign({ canLose: false, shift: true, where: null }, o.rules);
      const pl = o.player, fo = o.foe;
      this.player = { side: 0, name: pl.name || 'Player', id: pl.id || 0, party: pl.party, bag: pl.bag || {}, bm: null, field: {} };
      this.foe = { side: 1, party: fo.party, trainer: fo.trainer || null, items: Object.assign({}, fo.trainer && fo.trainer.items), bm: null, field: {} };
      this.sides = [this.player, this.foe];
      this.events = []; this.queue = []; this.prompt = null; this.pending = null; this.result = null;
      this.turn = 0; this.runs = 0; this.weather = null; this.payDay = 0;
      this.seen = new Set(); this.leveled = new Set();
    }

    // ================= public =================

    start() {
      this.events = [];
      this.emit('start', { kind: this.kind, trainer: this.foe.trainer ? this.foe.trainer.id : null });
      this.sendOut(this.foe, this.firstHealthy(this.foe));
      this.sendOut(this.player, this.firstHealthy(this.player));
      this.process();
      return this.events;
    }

    options() {
      const bm = this.player.bm;
      const moves = bm.mon.moves.map((m, slot) => ({ slot, id: m.id, pp: m.pp, max: G.Mon.ppMax(m.id, m.ppUp),
        usable: m.pp > 0 && !(bm.vol.disable && bm.vol.disable.move === m.id) && !(bm.vol.encore && bm.vol.encore.move !== m.id) }));
      const trapped = this.trapped(bm);
      return {
        moves, struggle: !moves.some(m => m.usable),
        switchable: this.player.party.map((m, i) => i).filter(i => i !== this.player.active && this.player.party[i].hp > 0),
        canSwitch: !trapped, canRun: this.kind === 'wild' && !trapped, canBall: this.kind === 'wild' && !this.rules.noCatch, trapped
      };
    }

    act(a) {
      if (!this.prompt || this.prompt.kind !== 'action') return [{ type: 'error', reason: 'not-now' }];
      this.events = [];
      const bad = this.validate(a);
      if (bad) return [{ type: 'error', reason: bad }];
      if (a.type === 'run' && this.kind === 'trainer') { this.emit('noRunTrainer', {}); return this.events; }
      this.prompt = null;
      const pa = a.type === 'move' && this.options().struggle ? { type: 'move', id: 'struggle' } : a;
      const fa = this.lockedAction(this.foe.bm) || G.BattleAI.choose(this, this.foe);
      this.queue.push(() => this.runTurn(pa, fa));
      this.process();
      return this.events;
    }

    answer(ans = {}) {
      if (!this.prompt || this.prompt.kind === 'action') return [{ type: 'error', reason: 'not-now' }];
      this.events = [];
      const fn = this.pending;
      const k = this.prompt.kind;
      if ((k === 'switch' || k === 'shift') && ans.switchTo != null && ans.switchTo >= 0) {
        const m = this.player.party[ans.switchTo];
        if (!m || m.hp <= 0 || ans.switchTo === this.player.active) return [{ type: 'error', reason: 'bad-switch' }];
      }
      if (k === 'switch' && !(ans.switchTo >= 0)) return [{ type: 'error', reason: 'must-switch' }];
      this.prompt = null; this.pending = null;
      fn(ans);
      this.process();
      return this.events;
    }

    // ================= queue =================

    insert(...steps) { this.queue.unshift(...steps); }

    ask(prompt, fn) { this.prompt = prompt; this.pending = fn; }

    process() {
      for (let guard = 0; guard < 5000; guard++) {
        while (this.queue.length && !this.prompt && !this.result) this.queue.shift()();
        if (this.result) { this.queue.length = 0; this.prompt = null; return; }
        if (this.prompt) return;
        // A new turn. Charging, recharging or rampaging Pokémon act on their own.
        const lock = this.lockedAction(this.player.bm);
        if (lock) {
          const fa = this.lockedAction(this.foe.bm) || G.BattleAI.choose(this, this.foe);
          this.queue.push(() => this.runTurn(lock, fa));
          continue;
        }
        this.prompt = { kind: 'action' };
        return;
      }
      throw new Error('battle did not settle');
    }

    emit(type, data = {}) { this.events.push(Object.assign({ type }, data)); }

    finish(outcome, extra = {}) {
      const money = (extra.money || 0) + (outcome === 'win' ? this.payDay : 0);
      if (outcome === 'win' && this.payDay) this.emit('payDay', { amt: this.payDay });
      if (money && outcome === 'win') this.emit('money', { amt: money });
      const leveled = [...this.leveled];
      const evolve = leveled.filter(uid => {
        const m = this.player.party.find(x => x.uid === uid);
        return m && m.hp > 0 && G.Evolution.candidates(m, { trigger: 'level' }).length > 0;
      });
      this.result = Object.assign({ outcome, money, leveled, evolve, seen: [...this.seen], caught: null, toBox: false }, extra, { money });
      for (const s of this.sides) if (s.bm) { s.bm.mon.tox = 0; }
      this.emit('end', { outcome });
    }

    // ================= helpers for effects =================

    other(bm) { return bm.side === 0 ? this.foe.bm : this.player.bm; }
    sideOf(bm) { return this.sides[bm.side]; }
    alive(bm) { return !!bm && bm.mon.hp > 0 && !bm.fainted; }
    firstHealthy(side) { return side.party.findIndex(m => m.hp > 0); }
    healthyLeft(side) { return side.party.filter(m => m.hp > 0).length; }
    maxHp(bm) { return G.Mon.maxHp(bm.mon); }
    trapped(bm) { return !!(bm.vol.trap || this.byFoe(bm, bm.vol.cantEscape) || bm.vol.ingrain); }
    /** Is the foe that set this effect (by uid) still the one in battle? */
    byFoe(bm, uid) { const f = this.other(bm); return !!uid && !!f && this.alive(f) && f.mon.uid === uid; }

    /** Effective stat with stages (and paralysis for speed). opts.crit: attacker ignores
     *  its negative stage, defender its positive one. */
    stat(bm, key, opts = {}) {
      const raw = G.Mon.stats(bm.mon)[STAT_INDEX[key]];
      let st = bm.stages[key];
      if (opts.crit && opts.attacking) st = Math.max(0, st);
      if (opts.crit && opts.defending) st = Math.min(0, st);
      let v = Math.floor(raw * G.Stats.stage(st));
      if (key === 'spe' && bm.mon.status === 'par') v = Math.floor(v / 2);
      return Math.max(1, v);
    }

    /** Type effectiveness against this battler (Foresight lets Normal and Fighting hit Ghosts). */
    eff(type, bm) {
      let types = bm.types;
      if (bm.vol.foresight && (type === 'normal' || type === 'fighting')) types = types.filter(t => t !== 'ghost');
      return G.Types.eff(type, types);
    }

    weatherMult(type) {
      const w = this.weather && this.weather.w;
      if (w === 'sun') return type === 'fire' ? 1.5 : type === 'water' ? 0.5 : 1;
      if (w === 'rain') return type === 'water' ? 1.5 : type === 'fire' ? 0.5 : 1;
      return 1;
    }

    /** HP loss from a hit: a substitute takes it first; Endure / False Swipe leave 1 HP. */
    hurt(target, dmg, o = {}) {
      if (dmg <= 0) return 0;
      if (target.vol.substitute > 0 && o.user && o.user !== target && !o.ignoreSub) {
        const d = Math.min(dmg, target.vol.substitute);
        target.vol.substitute -= d;
        this.emit('subDamage', { side: target.side, uid: target.mon.uid, amt: d });
        if (target.vol.substitute <= 0) { target.vol.substitute = 0; this.emit('subFade', { side: target.side, uid: target.mon.uid }); }
        return d;
      }
      let amt = Math.min(dmg, target.mon.hp);
      if (amt >= target.mon.hp && (target.vol.endure || o.leaveOne)) {
        amt = target.mon.hp - 1;
        if (target.vol.endure) this.emit('endured', { side: target.side, uid: target.mon.uid });
      }
      target.mon.hp -= amt;
      this.emit('damage', { side: target.side, uid: target.mon.uid, amt, hp: target.mon.hp, max: this.maxHp(target),
                            crit: !!o.crit, eff: o.eff == null ? 1 : o.eff, why: o.why || 'hit', src: o.src || null });
      if (o.user && o.user !== target && o.move) {
        target.lastHit = { cat: o.move.cat, amt, from: o.user.side };
        if (target.vol.rage && target.mon.hp > 0) this.stage(target, 'atk', 1, { source: target, rage: true });
        if (target.mon.hp <= 0 && target.vol.destinyBond && this.alive(o.user)) {
          this.emit('destinyBond', { side: target.side, uid: target.mon.uid });
          o.user.mon.hp = 0;
          this.emit('damage', { side: o.user.side, uid: o.user.mon.uid, amt: 0, hp: 0, max: this.maxHp(o.user), why: 'destiny' });
        }
      }
      return amt;
    }

    heal(bm, amt, why, extra) {
      const max = this.maxHp(bm);
      const a = Math.min(Math.max(1, Math.floor(amt)), max - bm.mon.hp);
      if (a <= 0 || bm.mon.hp <= 0) return 0;
      bm.mon.hp += a;
      this.emit('heal', Object.assign({ side: bm.side, uid: bm.mon.uid, amt: a, hp: bm.mon.hp, max, why }, extra));
      return a;
    }

    /** Major status ('par' 'slp' 'psn' 'tox' 'brn' 'frz'). o: { source, statusMove, silent } -> applied? */
    inflict(target, s, o = {}) {
      const fail = why => { if (!o.silent) this.emit(why === 'immune' ? 'noEffect' : 'fail', { side: target.side, uid: target.mon.uid }); return false; };
      if (!this.alive(target)) return false;
      if (target.mon.status) return fail('already');
      const t = target.types;
      if ((s === 'brn' && t.includes('fire')) || (s === 'par' && t.includes('electric')) || (s === 'frz' && t.includes('ice'))
          || ((s === 'psn' || s === 'tox') && (t.includes('poison') || t.includes('steel')))) return fail('immune');
      if (s === 'frz' && this.weather && this.weather.w === 'sun') return fail('already');
      const foeSource = o.source && o.source.side !== target.side;
      if (foeSource && this.sideOf(target).field.safeguard) return fail('safeguard');
      if (foeSource && o.statusMove && target.vol.substitute) return fail('sub');
      target.mon.status = s;
      if (s === 'slp') target.mon.slp = o.sleepTurns || this.rng.int(1, 3);
      if (s === 'tox') target.mon.tox = 0;
      this.emit('status', { side: target.side, uid: target.mon.uid, s });
      return true;
    }

    confuse(target, o = {}) {
      if (!this.alive(target)) return false;
      const foeSource = o.source && o.source.side !== target.side;
      if (target.vol.confusion || (foeSource && this.sideOf(target).field.safeguard) || (foeSource && o.statusMove && target.vol.substitute)) {
        if (!o.silent) this.emit('fail', {});
        return false;
      }
      target.vol.confusion = this.rng.int(2, 5);
      this.emit('confuse', { side: target.side, uid: target.mon.uid, why: o.why || null });
      return true;
    }

    /** Stat stage change. o: { source, silent }. Mist and substitutes stop drops from the foe. */
    stage(target, stat, delta, o = {}) {
      if (!this.alive(target) || !delta) return false;
      const foeSource = o.source && o.source.side !== target.side;
      if (delta < 0 && foeSource && (this.sideOf(target).field.mist || (o.statusMove && target.vol.substitute))) {
        if (!o.silent) this.emit(this.sideOf(target).field.mist ? 'mistBlock' : 'fail', { side: target.side, uid: target.mon.uid });
        return false;
      }
      const before = target.stages[stat];
      const after = Math.max(-6, Math.min(6, before + delta));
      if (after === before) { if (!o.silent) this.emit('stage', { side: target.side, uid: target.mon.uid, stat, delta, capped: true }); return false; }
      target.stages[stat] = after;
      if (!o.silent) this.emit('stage', { side: target.side, uid: target.mon.uid, stat, delta: after - before, capped: false, rage: !!o.rage });
      return true;
    }

    // ================= turn =================

    lockedAction(bm) {
      if (!bm || !this.alive(bm)) return null;
      if (bm.vol.recharge) return { type: 'move', locked: 'recharge' };
      if (bm.vol.charging) return { type: 'move', id: bm.vol.charging, locked: 'charge' };
      if (bm.vol.rampage) return { type: 'move', id: bm.vol.rampage.move, locked: 'rampage' };
      return null;
    }

    validate(a) {
      const o = this.options();
      const bag = this.player.bag;
      if (a.type === 'move') {
        if (o.struggle) return null;
        const m = o.moves[a.slot];
        return m && m.usable ? null : 'bad-move';
      }
      if (a.type === 'switch') return o.canSwitch && o.switchable.includes(a.to) ? null : 'bad-switch';
      if (a.type === 'run') return this.kind === 'trainer' || o.canRun ? null : 'trapped';
      if (a.type === 'ball') {
        if (!o.canBall) return 'no-ball-in-trainer-battle';
        const fx = G.ITEM_FX[a.item];
        return fx && fx.ball && (bag[a.item] || 0) > 0 ? null : 'bad-item';
      }
      if (a.type === 'item') {
        const fx = G.ITEM_FX[a.item];
        if (!fx || !fx.battle || fx.ball || !(bag[a.item] > 0)) return 'bad-item';
        return G.BattleItems.canUse(this, this.player, a) ? null : 'no-effect';
      }
      return 'bad-action';
    }

    runTurn(pa, fa) {
      this.turn++;
      for (const s of this.sides) {
        const bm = s.bm;
        bm.moved = false; bm.vol.flinch = false; bm.vol.protect = false; bm.vol.endure = false; bm.lastHit = null;
      }
      const acts = [{ side: this.player, a: pa, n: 0 }, { side: this.foe, a: fa, n: 1 }].map(x => {
        const bm = x.side.bm;
        const id = x.a.type === 'move' ? (x.a.id || (bm.mon.moves[x.a.slot] || {}).id) : null;
        return Object.assign(x, {
          bracket: x.a.type === 'move' ? 0 : 1,
          pri: id && G.MOVES[id] ? G.MOVES[id].pri : 0,
          spe: this.stat(bm, 'spe'), tie: this.rng.next()
        });
      });
      acts.sort((p, q) => (q.bracket - p.bracket) || (q.bracket ? p.n - q.n : 0) || (q.pri - p.pri) || (q.spe - p.spe) || (p.tie - q.tie));
      this.insert(...acts.map(x => () => this.doAction(x.side, x.a)), () => this.endOfTurn());
    }

    doAction(side, a) {
      const bm = side.bm;
      if (!this.alive(bm) || this.result) return;
      bm.moved = true;
      if (a.type === 'switch') this.switchIn(side, a.to);
      else if (a.type === 'run') this.tryRun();
      else if (a.type === 'ball') this.throwBall(a.item);
      else if (a.type === 'item') G.BattleItems.use(this, side, a);
      else this.doMove(bm, a);
      this.afterAction();
    }

    /** Move with the checks that come before it (recharge, sleep, freeze, flinch, confusion, paralysis, love). */
    doMove(bm, a) {
      const target = this.other(bm);
      const say = why => this.emit('cantMove', { side: bm.side, uid: bm.mon.uid, why });
      // An interrupted move ends its charge, its time in the sky / underground and its rampage.
      const stop = () => { bm.vol.charging = null; bm.vol.invuln = null; bm.vol.rampage = null; };
      if (bm.vol.recharge) { bm.vol.recharge = false; return say('recharge'); }
      let id = a.id || bm.mon.moves[a.slot].id;
      // Encored after choosing this turn: it repeats the encored move instead.
      if (bm.vol.encore && id !== bm.vol.encore.move && id !== 'struggle' && !a.locked) id = bm.vol.encore.move;
      const sp = G.SpecialMoves[id] || {};
      const mon = bm.mon;
      if (mon.status === 'slp') {
        if (mon.slp > 0) {
          mon.slp--;
          if (!sp.whileAsleep) { say('slp'); stop(); return; }
        } else { mon.status = null; this.emit('wake', { side: bm.side, uid: mon.uid }); }
      }
      if (mon.status === 'frz') {
        if (this.rng.pct(20) || sp.thawsUser) { mon.status = null; this.emit('thaw', { side: bm.side, uid: mon.uid }); }
        else { stop(); return say('frz'); }
      }
      if (bm.vol.disable && bm.vol.disable.move === id && !a.locked) { stop(); return say('disabled'); }
      if (bm.vol.flinch) { stop(); return say('flinch'); }
      if (bm.vol.confusion) {
        bm.vol.confusion--;
        if (bm.vol.confusion <= 0) { bm.vol.confusion = 0; this.emit('confusionEnd', { side: bm.side, uid: mon.uid }); }
        else {
          this.emit('confused', { side: bm.side, uid: mon.uid });
          if (this.rng.pct(33)) {
            const dmg = G.Damage.calc({ lvl: mon.lvl, pow: 40, atk: this.stat(bm, 'atk'), def: this.stat(bm, 'def'), roll: this.rng.int(85, 100) });
            this.emit('hurtSelf', { side: bm.side, uid: mon.uid });
            this.hurt(bm, dmg, { why: 'confusion' });
            stop();
            return;
          }
        }
      }
      if (mon.status === 'par' && this.rng.pct(25)) { stop(); return say('par'); }
      if (bm.vol.attract && this.alive(target) && this.rng.pct(50)) { stop(); return say('attract'); }
      // rules.obeyCap (Johto): above that level, the player's Pokémon may not obey (the Gen 3 roll).
      const cap = bm.side === 0 ? this.rules.obeyCap : null;
      if (cap && mon.lvl > cap && !a.locked && Math.floor(this.rng.int(0, 255) * (mon.lvl + cap) / 256) >= cap) {
        stop();
        const roll = this.rng.int(0, 3);
        const others = mon.moves.filter(m => m.id !== id && m.pp > 0);
        if (roll === 0 && others.length) {
          const o = this.rng.pick(others);
          o.pp = Math.max(0, o.pp - 1);
          this.emit('disobey', { side: bm.side, uid: mon.uid, why: 'other' });
          G.BattleFx.useMove(this, bm, target, o.id, {});
          return;
        }
        if (roll === 1 && !mon.status) {
          mon.status = 'slp'; mon.slp = this.rng.int(1, 3);
          return this.emit('disobey', { side: bm.side, uid: mon.uid, why: 'nap' });
        }
        if (roll === 2) {
          this.emit('disobey', { side: bm.side, uid: mon.uid, why: 'other' });
          const dmg = G.Damage.calc({ lvl: mon.lvl, pow: 40, atk: this.stat(bm, 'atk'), def: this.stat(bm, 'def'), roll: this.rng.int(85, 100) });
          this.emit('hurtSelf', { side: bm.side, uid: mon.uid });
          this.hurt(bm, dmg, { why: 'confusion' });
          return;
        }
        return this.emit('disobey', { side: bm.side, uid: mon.uid, why: 'loaf', n: this.rng.int(0, 3) });
      }
      // PP is only used when the move really starts (not on the second turn of a charge or a rampage).
      if (!a.locked && id !== 'struggle') {
        const slot = bm.mon.moves.find(m => m.id === id);
        if (slot) slot.pp = Math.max(0, slot.pp - 1);
      }
      if (id !== 'rage') bm.vol.rage = false;
      if (id !== 'destiny-bond') bm.vol.destinyBond = false;
      if (!['protect', 'detect', 'endure'].includes(id)) bm.vol.protectCount = 0;
      if (id !== bm.lastMoveHit) bm.lastMoveHit = null;
      G.BattleFx.useMove(this, bm, target, id, { locked: a.locked || null });
    }

    /** After every action: faints, experience, and whether the battle is over. */
    afterAction() {
      const steps = [];
      for (const s of this.sides) {
        const bm = s.bm;
        if (bm && bm.mon.hp <= 0 && !bm.fainted) {
          bm.fainted = true;
          bm.mon.status = null; bm.mon.slp = 0; bm.mon.tox = 0;
          this.emit('faint', { side: s.side, uid: bm.mon.uid });
          if (s.side === 1) steps.push(...this.expSteps(bm));
        }
      }
      steps.push(() => this.decide());
      this.insert(...steps);
    }

    /** Ends the battle when one side is done. */
    decide() {
      if (this.result) return;
      // No Pokemon left able to fight is a loss, even when the foe fell at the same time.
      if (this.healthyLeft(this.player) === 0) {
        this.emit('outOfPokemon', {});
        return this.finish('lose');
      }
      const foeOut = this.foe.bm.fainted;
      if (foeOut && (this.kind === 'wild' || this.healthyLeft(this.foe) === 0)) {
        let money = 0;
        if (this.kind === 'trainer') {
          const t = this.foe.trainer || {};
          const last = this.foe.party[this.foe.party.length - 1];
          money = G.Exp.prize(t.prize == null ? 20 : t.prize, last.lvl);
          this.emit('defeated', { trainer: t.id || null });
        }
        return this.finish('win', { money });
      }
    }

    endOfTurn() {
      if (this.result) return;
      const order = this.sides.map(s => s.bm).filter(bm => this.alive(bm))
        .sort((p, q) => this.stat(q, 'spe') - this.stat(p, 'spe'));
      // Weather
      if (this.weather) {
        this.weather.turns--;
        if (this.weather.turns <= 0) { this.emit('weatherEnd', { w: this.weather.w }); this.weather = null; }
        else if (this.weather.w === 'sand' || this.weather.w === 'hail') {
          this.emit('weatherTick', { w: this.weather.w });
          for (const bm of order) {
            const safe = this.weather.w === 'sand' ? ['rock', 'ground', 'steel'] : ['ice'];
            if (this.alive(bm) && !bm.types.some(t => safe.includes(t)) && !bm.vol.invuln)
              this.hurt(bm, Math.max(1, Math.floor(this.maxHp(bm) / 16)), { why: this.weather.w });
          }
        }
      }
      for (const bm of order) {
        if (!this.alive(bm)) continue;
        const max = this.maxHp(bm), uid = bm.mon.uid;
        if (bm.vol.seeded) {
          const foe = this.other(bm);
          const d = this.hurt(bm, Math.max(1, Math.floor(max / 8)), { why: 'seed' });
          if (this.alive(foe)) this.heal(foe, d, 'leech');
        }
        if (this.alive(bm) && bm.vol.ingrain) this.heal(bm, max / 16, 'ingrain');
        const st = bm.mon.status;
        if (this.alive(bm) && (st === 'psn' || st === 'brn')) this.hurt(bm, Math.max(1, Math.floor(max / (st === 'psn' ? 8 : 16))), { why: st });
        if (this.alive(bm) && st === 'tox') { bm.mon.tox = Math.min(15, bm.mon.tox + 1); this.hurt(bm, Math.max(1, Math.floor(max * bm.mon.tox / 16)), { why: 'tox' }); }
        if (this.alive(bm) && bm.vol.nightmare) {
          if (bm.mon.status !== 'slp') bm.vol.nightmare = false;
          else this.hurt(bm, Math.max(1, Math.floor(max / 4)), { why: 'nightmare' });
        }
        if (this.alive(bm) && bm.vol.trap) {
          const t = bm.vol.trap;
          if (!this.byFoe(bm, t.src)) bm.vol.trap = null;          // the one holding it is gone
          else {
            this.hurt(bm, Math.max(1, Math.floor(max / 8)), { why: 'trap', src: t.move });
            if (--t.turns <= 0 && this.alive(bm)) { bm.vol.trap = null; this.emit('freed', { side: bm.side, uid, move: t.move }); }
          }
        }
        if (this.alive(bm) && bm.vol.yawn && --bm.vol.yawn === 0) {
          bm.vol.yawn = 0;
          this.inflict(bm, 'slp', { silent: false });
        }
        if (this.alive(bm) && bm.vol.perish) {
          bm.vol.perish--;
          this.emit('perish', { side: bm.side, uid, n: bm.vol.perish });
          if (bm.vol.perish <= 0) { bm.mon.hp = 0; this.emit('damage', { side: bm.side, uid, amt: 0, hp: 0, max, why: 'perish' }); }
        }
        if (bm.vol.disable && --bm.vol.disable.turns <= 0) { bm.vol.disable = null; this.emit('disableEnd', { side: bm.side, uid }); }
        if (bm.vol.encore && (--bm.vol.encore.turns <= 0 || !bm.mon.moves.some(m => m.id === bm.vol.encore.move && m.pp > 0))) {
          bm.vol.encore = null;
          this.emit('encoreEnd', { side: bm.side, uid });
        }
        bm.turns++;
      }
      // Reflect, Light Screen, Mist, Safeguard
      for (const s of this.sides) {
        for (const k of Object.keys(s.field)) {
          if (s.field[k] > 0 && --s.field[k] === 0) { delete s.field[k]; this.emit('fieldEnd', { side: s.side, effect: k }); }
        }
      }
      this.afterAction();
      this.queue.push(() => this.replacements());
    }

    /** Fainted Pokémon are replaced at the end of the turn. */
    replacements() {
      if (this.result) return;
      const steps = [];
      if (this.player.bm.fainted) {
        steps.push(() => this.ask({ kind: 'switch', forced: true }, ans => this.switchIn(this.player, ans.switchTo)));
      }
      if (this.foe.bm.fainted) {
        const next = this.firstHealthy(this.foe);
        const offer = this.rules.shift && !this.player.bm.fainted && this.player.party.some((m, i) => i !== this.player.active && m.hp > 0);
        if (offer) {
          steps.push(() => this.ask({ kind: 'shift', next: this.foe.party[next].sp }, ans => {
            if (ans.switchTo != null && ans.switchTo >= 0) this.insert(() => this.switchIn(this.player, ans.switchTo));
          }));
        }
        steps.push(() => this.sendOut(this.foe, next));
      }
      this.insert(...steps);
    }

    // ================= switching =================

    makeBM(side, mon) {
      return { mon, side: side.side, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, vol: {},
               types: G.SPECIES[mon.sp].types.slice(), moved: false, turns: 0, lastMove: null, lastHit: null,
               fainted: false, participants: new Set() };
    }

    sendOut(side, i) {
      side.active = i;
      const mon = side.party[i];
      side.bm = this.makeBM(side, mon);
      if (side.side === 1) this.seen.add(mon.sp);
      this.emit('send', { side: side.side, uid: mon.uid, sp: mon.sp, lvl: mon.lvl, hp: mon.hp, max: G.Mon.maxHp(mon),
                          shiny: !!mon.shiny, gender: mon.gender, status: mon.status });
      const pl = this.player.bm, fo = this.foe.bm;
      if (pl && fo && this.alive(pl) && this.alive(fo)) fo.participants.add(pl.mon.uid);
    }

    switchIn(side, i) {
      const old = side.bm;
      if (old && !old.fainted) {
        old.mon.tox = 0;
        this.emit('withdraw', { side: side.side, uid: old.mon.uid });
        // The foe's trap and seeds on it stay with the battler that leaves.
        const foe = this.other(old);
        if (foe && foe.vol.attract) foe.vol.attract = false;
      }
      this.sendOut(side, i);
    }

    // ================= running and catching =================

    tryRun() {
      this.runs++;
      const ps = G.Mon.stats(this.player.bm.mon)[5], fs = G.Mon.stats(this.foe.bm.mon)[5];
      let ok = ps >= fs;
      if (!ok) {
        const f = Math.floor(ps * 128 / Math.max(1, fs)) + 30 * (this.runs - 1);
        ok = f > 255 || this.rng.int(0, 255) < f;
      }
      this.emit('run', { ok });
      if (ok) this.finish('run');
    }

    throwBall(item) {
      const bag = this.player.bag;
      bag[item]--;
      if (!bag[item]) delete bag[item];
      const fo = this.foe.bm, mon = fo.mon;
      // rules.forceCatch: debug only (F7), the next ball catches.
      const ball = this.rules.forceCatch ? 255 : G.ITEM_FX[item].ball;
      this.rules.forceCatch = false;
      const r = G.Capture.roll({ max: G.Mon.maxHp(mon), hp: mon.hp, rate: G.SPECIES[mon.sp].cr, ball,
                                 status: mon.status, rng: this.rng });
      this.emit('ball', { item, shakes: r.shakes, caught: r.caught, uid: mon.uid });
      if (!r.caught) return;
      mon.ball = item;
      mon.ot = { name: this.player.name, id: this.player.id };
      mon.met = { map: this.rules.where, lvl: mon.lvl };
      const toBox = this.player.party.length >= 6;
      if (!toBox) this.player.party.push(mon);
      this.finish('caught', { caught: mon.uid, toBox, mon });
    }

    // ================= experience =================

    expSteps(foeBm) {
      const parts = this.player.party.filter(m => m.hp > 0 && foeBm.participants.has(m.uid));
      if (!parts.length) return [];
      const S = G.SPECIES[foeBm.mon.sp];
      const amt = G.Exp.gain(S.bx, foeBm.mon.lvl, this.kind === 'trainer', parts.length);
      return parts.map(m => () => this.giveExp(m, amt, S.ev));
    }

    giveExp(mon, amt, evs) {
      const gr = G.SPECIES[mon.sp].gr;
      const cap = G.Stats.expAt(gr, 100);
      if (mon.lvl >= 100) return;
      mon.exp = Math.min(cap, mon.exp + amt);
      G.Exp.addEvs(mon, evs);
      this.emit('exp', { uid: mon.uid, amt, exp: mon.exp, lvl: mon.lvl,
                         from: G.Stats.expAt(gr, mon.lvl), to: G.Stats.expAt(gr, Math.min(100, mon.lvl + 1)) });
      this.insert(() => this.levelStep(mon));
    }

    levelStep(mon) {
      const gr = G.SPECIES[mon.sp].gr;
      if (mon.lvl >= 100 || mon.exp < G.Stats.expAt(gr, mon.lvl + 1)) return;
      const before = G.Mon.stats(mon), oldMax = before[0];
      mon.lvl++;
      G.Mon.recalc(mon, oldMax);
      mon.friendship = Math.min(255, (mon.friendship || 0) + (mon.friendship < 100 ? 5 : mon.friendship < 200 ? 3 : 2));
      this.leveled.add(mon.uid);
      this.emit('levelup', { uid: mon.uid, lvl: mon.lvl, before, after: G.Mon.stats(mon), hp: mon.hp,
                             from: G.Stats.expAt(gr, mon.lvl), to: G.Stats.expAt(gr, Math.min(100, mon.lvl + 1)) });
      const bm = this.player.bm;
      if (bm && bm.mon === mon) bm.types = G.SPECIES[mon.sp].types.slice();
      const learn = G.Mon.movesAt(mon.sp, mon.lvl).map(id => () => this.learnStep(mon, id));
      this.insert(...learn, () => this.levelStep(mon));
    }

    learnStep(mon, id) {
      if (G.Mon.knows(mon, id)) return;
      if (mon.moves.length < 4) {
        G.Mon.learn(mon, id);
        this.emit('learned', { uid: mon.uid, move: id });
        return;
      }
      this.emit('learnPrompt', { uid: mon.uid, move: id });
      this.ask({ kind: 'learn', uid: mon.uid, move: id }, ans => {
        const slot = ans.learnSlot;
        if (slot != null && slot >= 0 && slot < 4) {
          const old = G.Mon.learn(mon, id, slot);
          this.emit('forgot', { uid: mon.uid, move: old });
          this.emit('learned', { uid: mon.uid, move: id });
        } else this.emit('notLearned', { uid: mon.uid, move: id });
      });
    }
  }

  return { create: o => new Battle(o), Battle, STAGES };
})();
