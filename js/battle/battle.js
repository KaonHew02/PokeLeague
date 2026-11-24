/* ============ battle.js — the turn engine (pure, deterministic) ============
 * No DOM, no clock, no Math.random: everything random comes from G.RNG(seed),
 * so the same seed and the same choices always give the same battle (and it
 * runs in node: tests, tools/sim_battle.js).
 *
 *   const b = G.Battle.create({ kind: 'wild' | 'trainer', seed,
 *     player: { name, id, party, bag },            // live references: the battle changes them
 *     foe:    { party, trainer: { id, name, title, ai: 'basic' | 'leader', items: {potion: 1}, prize: 20 } | null },
 *     partner: { name, party } (a multi battle, doubles only: see below),
 *     rules:  { canLose: false, shift: true, where: 'kanto-route-1', noCatch: false, forceCatch: false (debug),
 *               fishing: false (hooked with a rod: the Lure Ball), weather: 'rain' | 'sun' | 'sand' | 'hail' | 'fog' (the overworld's or the
 *               Battle Arcade's, for the whole battle; fog: accuracy x0.6), trickRoom: false (the Battle Arcade: Trick Room for five turns),
 *               double: false (two Pokémon a side: trainers, and since chapter 102 wild ones beside a partner), tag: false (doubles: two foes, one slot each),
               roamer: false (a roaming wild Pokémon that flees),
 *               noExp: false (no Exp. Points), noBag: false (no items or balls from the Bag: the Battle Tower),
 *               expAll: false (the rest of the team gets half of one fighter's Exp. Points: the setting expAll),
 *               arena: false (the Battle Arena: one on one, three turns, then the judge; see below),
 *               palace: false (the Battle Palace: Pokémon choose their own moves by their nature; see below) } })
 *   b.start()            -> events[]
 *   b.prompt             -> { kind: 'action' } | { kind: 'switch', forced: true } | { kind: 'shift', next: sp }
 *                           | { kind: 'learn', uid, move } | null (battle over)
 *   b.options()          -> { moves: [{ slot, id, pp, max, usable }], struggle, switchable: [i], canRun, canBall, trapped }
 *   b.act(action)        -> events[]   { type: 'move', slot } | { type: 'switch', to } | { type: 'item', item, target, move }
 *                                      | { type: 'ball', item } | { type: 'run' }
 *   b.answer(answer)     -> events[]   { switchTo: i | -1 } | { learnSlot: 0..3 | -1 }
 *   b.result             -> { outcome: 'win' | 'lose' | 'run' | 'caught' | 'fled', money, caught, toBox, leveled: [uid], evolve: [uid], seen: [sp] }
 *
 * Held items (chapter 26, G.Held in held.js): stats, Quick Claw in the turn order, Focus Band in
 * hurt(), berries after every action, Leftovers at the end of the turn, Lucky Egg and Exp. Share
 * in the experience, Amulet Coin in the prize money, Smoke Ball when running.
 * Abilities (chapter 28, G.Abilities in abilities.js): each battler has `ability`; the weather that
 * counts is weatherNow() (Cloud Nine, Air Lock); abilities that act on entry (Intimidate, Drizzle...)
 * act once both Pokémon are out, then whenever one comes in.
 *
 * Double battles (chapter 40, rules.double): each side has up to two battlers (side.bms, side.actives;
 * side.bm and side.active are the first slot, as in singles). The prompt { kind: 'action', slot } asks
 * for each of the player's battlers in turn (b.back() goes back to the first); a move's action names its
 * target { side, slot }. All four act in one order; a move aimed at a fainted foe goes to the other one;
 * spread moves (effects.js) hit every target; each fainted slot is refilled on its own ({ kind: 'switch',
 * forced: true, slot }), or stays empty. A player with only one Pokémon able to fight has one slot.
 * Singles keep their own code paths: the same seed and choices give the same battle as before.
 *
 * Wild double battles (chapter 102, Platinum's beside a partner): kind 'wild' with rules.double, foe.party one or two wild
 * Pokémon (two in grass and caves, one on water). A ball cannot be aimed while two are out (validate: 'two-foes'); with one
 * left it goes at that one. A Pokémon caught goes into the player's own party (o.player.party), never the partner's.
 *
 * Multi battles (chapter 55, o.partner): the player's side is the player in slot 0 and a partner in slot 1. Inside the
 * battle player.party is the player's Pokémon then the partner's, so the player's indexes do not change (the party array
 * of the save stays as it was). Only slot 0 is asked; the AI plays slot 1 and its next Pokémon comes in by itself. The
 * player can only switch to, or use items on, their own, and only they get experience. The side loses when neither has a
 * Pokémon left: with the player's team down the partner fights on. rules.tag: the foe's party alternates between two
 * trainers (first, second, first...), and each refills only their own slot.
 *
 * A roaming Pokémon (chapter 42, rules.roamer: Latias or Latios): unless it is held (Mean Look, Block,
 * Spider Web, a binding move, Ingrain, Shadow Tag, Arena Trap), it chooses { type: 'flee' }, which goes in
 * the order of a move with no priority; asleep, frozen, flinching or fully paralysed it cannot, and held
 * by then it stays ('roamHeld'). Fleeing ends the battle: 'roamFled', outcome 'fled'.
 *
 * The Battle Arena (chapter 79, rules.arena; a trainer battle in singles): no switching (canSwitch is false, Roar and
 * Whirlwind fail), and a fainted Pokémon is followed by the next in party order with no question asked. Each match-up
 * keeps a score for both battlers (bm.arena): mind +1 for each attacking move chosen, -1 for Protect, Detect or Endure;
 * skill once per move that lands, +2 super effective, +1 neutral, -1 not very effective or no effect; body = HP now /
 * HP when the match-up began. After the third turn of a match-up with both still standing, arenaJudge() compares the
 * three (higher 2 points, equal 1 each, lower 0): events 'judgeStart', 'judge' { marks } and 'judgeResult' { points, winner }, and the
 * loser (both on a tie) faints. A challenger whose last Pokémon goes down loses, as always, even on a tie.
 *
 * The Battle Palace (chapter 80, rules.palace; a trainer battle in singles): nobody chooses moves. A move action of the
 * player (any slot) and every action of the foe become palaceAction(bm): a locked action first; else a group drawn from
 * the nature's odds (PALACE[nature] = [attack, defense] above half HP, then below half; support is the rest), and a
 * random usable move of that group (palaceGroup: a damaging move is attack, a status move on its own side defense,
 * any other support, Counter and Mirror Coat too). With none in that group, half the time it hesitates ({ hesitate }:
 * 'cantMove' why 'palace', no move, no PP) and otherwise uses a random usable move; with none usable, Struggle.
 * Switching stays (the player's only choice); no Shift question. Chapter 108: in doubles too (Emerald's double battle halls):
 * the player's Fight becomes { palace: true } and both sides' Pokémon choose when the turn begins; a move for one target
 * goes at the foe with more HP, less HP or either, by nature (palaceAim, PALACE_TARGET).
 *
 * Events are plain objects { type, ... } that the battle screen plays in order
 * (text: G.BattleText.line(event, battle)). side 0 = the player, 1 = the foe.
 * Internally the turn is a queue of steps; a step that needs the player's
 * answer sets `prompt` and the queue waits until answer().
 */
G.Battle = (() => {
  const STAGES = ['atk', 'def', 'spa', 'spd', 'spe', 'acc', 'eva'];
  // The Battle Palace (chapter 80): each nature's odds of attack and defense (support is the rest), above half HP and
  // below it (Emerald's table, as altissimo's Battle Palace page lists it).
  const PALACE = {
    adamant: [38, 31, 70, 15], bashful: [30, 58, 30, 58], bold: [30, 20, 32, 58], brave: [70, 15, 32, 60], calm: [40, 50, 25, 62],
    careful: [42, 50, 42, 5], docile: [56, 22, 56, 22], gentle: [18, 70, 90, 5], hardy: [61, 7, 61, 7], hasty: [58, 37, 88, 6],
    impish: [69, 6, 28, 55], jolly: [35, 5, 35, 60], lax: [35, 10, 29, 6], lonely: [20, 25, 84, 8], mild: [44, 50, 34, 6],
    modest: [35, 45, 34, 60], naive: [56, 22, 56, 22], naughty: [20, 70, 70, 22], quiet: [56, 22, 56, 22], quirky: [56, 22, 56, 22],
    rash: [30, 13, 27, 6], relaxed: [25, 15, 75, 15], sassy: [88, 6, 22, 20], serious: [34, 11, 29, 11], timid: [62, 10, 30, 20]
  };
  // Chapter 108: in the Palace's double battles, the foe a move for one target goes at, by nature: the one with more HP (+1),
  // less HP (-1) or either (0). Emerald's gBattlePalaceNatureToMoveTarget (src/battle_anim_smokescreen.c).
  const PALACE_TARGET = {
    hardy: 1, lonely: 1, brave: -1, adamant: 1, naughty: -1, bold: -1, docile: 0, relaxed: 1, impish: 1, lax: 1, timid: -1, hasty: -1,
    serious: -1, jolly: 1, naive: 0, modest: -1, mild: 1, quiet: -1, bashful: -1, rash: 1, calm: 1, gentle: 1, sassy: -1, careful: -1, quirky: 1
  };
  const OWN_SIDE = new Set(['user', 'users-field', 'user-and-allies', 'user-or-ally']);
  /** A move's group in the Battle Palace: 'attack' | 'defense' | 'support'. */
  function palaceGroup(id) {
    const M = G.MOVES[id];
    if (!M) return 'attack';
    if (M.tgt === 'specific-move') return 'support';                // Counter, Mirror Coat
    if (M.cat !== 'status') return 'attack';
    return OWN_SIDE.has(M.tgt) ? 'defense' : 'support';
  }
  const STAT_INDEX = { atk: 1, def: 2, spa: 3, spd: 4, spe: 5 };

  class Battle {
    constructor(o) {
      this.rng = G.RNG(o.seed == null ? 1 : o.seed);
      this.kind = o.kind || 'wild';
      this.rules = Object.assign({ canLose: false, shift: true, where: null }, o.rules);
      this.double = !!this.rules.double && (this.kind === 'trainer' || this.kind === 'wild');     // wild: chapter 102
      if (this.double) this.rules.shift = false;
      this.arena = !!this.rules.arena && this.kind === 'trainer' && !this.double;     // the Battle Arena (chapter 79)
      this.palace = !!this.rules.palace && this.kind === 'trainer';    // the Battle Palace (chapter 80; doubles: chapter 108)
      if (this.arena || this.palace) this.rules.shift = false;
      this.arenaTurns = 0;
      const pl = o.player, fo = o.foe;
      this.partner = this.double && o.partner ? { name: o.partner.name, first: pl.party.length } : null;
      const party = this.partner ? pl.party.concat(o.partner.party) : pl.party;
      this.player = { side: 0, name: pl.name || 'Player', id: pl.id || 0, party, bag: pl.bag || {}, bms: [], actives: [], field: {} };
      this.ownParty = pl.party;          // the player's own party (a caught Pokémon goes here, not into the partner's)
      this.foe = { side: 1, party: fo.party, trainer: fo.trainer || null, items: Object.assign({}, fo.trainer && fo.trainer.items), bms: [], actives: [], field: {} };
      this.sides = [this.player, this.foe];
      // The first slot under its singles names.
      for (const sd of this.sides) {
        Object.defineProperty(sd, 'bm', { get() { return this.bms[0] || null; }, set(v) { this.bms[0] = v; }, enumerable: true });
        Object.defineProperty(sd, 'active', { get() { return this.actives[0]; }, set(v) { this.actives[0] = v; }, enumerable: true });
      }
      this.choices = [];                 // doubles: the player's actions chosen so far this turn
      this.events = []; this.queue = []; this.prompt = null; this.pending = null; this.result = null;
      this.turn = 0; this.runs = 0; this.weather = null; this.payDay = 0;
      this.wishes = {}; this.futures = {};                  // Wish, Future Sight and Doom Desire (chapter 110), by "side:slot"
      this.seen = new Set(); this.leveled = new Set();
      // Chapter 94: the items the player's Pokémon hold at the start, and those they used up themselves (finish gives the
      // others back: taken, knocked off, swapped).
      this.startItems = new Map(pl.party.map(m => [m, m.item || null]));
      this.usedUp = new Set();
      this.recycle = {};                 // chapter 104: Recycle's item by place on the field ('side:slot')
    }

    // ================= public =================

    start() {
      this.events = [];
      this.emit('start', { kind: this.kind, trainer: this.foe.trainer ? this.foe.trainer.id : null });
      // The overworld's weather (rules.weather, chapter 38: the storm): it lasts the whole battle.
      if (this.rules.weather) { this.weather = { w: this.rules.weather, turns: Infinity }; this.emit('weather', { w: this.rules.weather, field: true }); }
      // The Battle Arcade's Trick Room panel (rules.trickRoom, chapter 92): five turns from the start.
      if (this.rules.trickRoom) { this.trickRoom = 5; this.emit('trickRoom', { field: true }); }
      if (!this.double) {
        this.sendOut(this.foe, this.firstHealthy(this.foe));
        this.sendOut(this.player, this.firstHealthy(this.player));
      } else {
        // Two each (one when only one can fight), the foe's first.
        for (const sd of [this.foe, this.player]) {
          const up = sd.party.map((m, i) => i).filter(i => sd.party[i].hp > 0);
          const two = sd === this.player && this.partner ? [up.find(i => this.mine(i)), up.find(i => !this.mine(i))] : up.slice(0, 2);
          two.forEach((i, slot) => { if (i != null) this.sendOut(sd, i, { slot }); });
        }
      }
      // Abilities on entry, the faster first (the player's on a tie).
      this.started = true;
      for (const bm of this.allActive().sort((p, q) => this.stat(q, 'spe') - this.stat(p, 'spe'))) G.Abilities.switchIn(this, bm);
      this.process();
      return this.events;
    }

    options(slot) {
      if (slot == null) slot = this.prompt && this.prompt.slot != null ? this.prompt.slot : 0;
      const bm = this.player.bms[slot];
      const moves = bm.mon.moves.map((m, slot) => ({ slot, id: m.id, pp: m.pp, max: G.Mon.ppMax(m.id, m.ppUp),
        usable: m.pp > 0 && !(bm.vol.disable && bm.vol.disable.move === m.id) && !(bm.vol.encore && bm.vol.encore.move !== m.id)
          && !(G.Held.locked(bm) && G.Held.locked(bm) !== m.id)                 // a Choice item (chapter 93)
          && !(bm.vol.taunt && G.MOVES[m.id] && G.MOVES[m.id].cat === 'status') }));    // Taunt (chapter 110)
      const caught = this.trapped(bm) || G.Abilities.traps(this, bm);     // Shadow Tag, Arena Trap, Magnet Pull
      const trapped = caught && !G.Held.is(bm.mon, 'shed-shell');          // Shed Shell (chapter 94): it switches out, it does not flee
      return {
        moves, struggle: !moves.some(m => m.usable),
        switchable: this.player.party.map((m, i) => i).filter(i => this.mine(i) && !this.player.actives.includes(i) && this.player.party[i].hp > 0
                                                                && !this.choices.some(c => c && c.type === 'switch' && c.to === i)),
        canSwitch: !trapped && !this.arena, canRun: this.kind === 'wild' && (!caught || G.Abilities.runAway(bm)),
        canBall: this.kind === 'wild' && !this.rules.noCatch, trapped
      };
    }

    act(a) {
      if (!this.prompt || this.prompt.kind !== 'action') return [{ type: 'error', reason: 'not-now' }];
      this.events = [];
      // The Battle Palace: the Pokémon picks its own move, whatever slot was asked for.
      const own = this.palace && a.type === 'move';
      const bad = own ? null : this.validate(a);
      if (bad) return [{ type: 'error', reason: bad }];
      if (a.type === 'run' && this.kind === 'trainer') { this.emit('noRunTrainer', {}); return this.events; }
      if (this.double) return this.actDouble(a);
      this.prompt = null;
      const pa = own ? this.palaceAction(this.player.bm) : a.type === 'move' && this.options().struggle ? { type: 'move', id: 'struggle' } : a;
      const fa = this.foeAction();
      this.queue.push(() => this.runTurn(pa, fa));
      this.process();
      return this.events;
    }

    /** Doubles: one battler's action; the next one is asked, or the turn begins. */
    actDouble(a) {
      const slot = this.prompt.slot;
      // The Battle Palace (chapter 108): Fight lets the Pokémon choose, when the turn begins.
      this.choices[slot] = this.palace && a.type === 'move' ? { type: 'move', palace: true }
        : a.type === 'move' && this.options(slot).struggle ? { type: 'move', id: 'struggle' } : a;
      this.prompt = null;
      const next = this.chooser(slot + 1);
      if (next != null) { this.prompt = { kind: 'action', slot: next }; return this.events; }
      const choices = this.choices.slice();
      this.queue.push(() => this.runTurnDouble(choices));
      this.process();
      return this.events;
    }

    /** Doubles: back to the previous battler's choice (the screen's Back). */
    back() {
      if (!this.double || !this.prompt || this.prompt.kind !== 'action') return [{ type: 'error', reason: 'not-now' }];
      let k = this.prompt.slot - 1;
      while (k >= 0 && (!this.alive(this.player.bms[k]) || this.lockedAction(this.player.bms[k]))) k--;
      if (k < 0) return [{ type: 'error', reason: 'not-now' }];
      this.choices[k] = null;
      this.prompt = { kind: 'action', slot: k };
      return [];
    }

    /** Doubles: the first of the player's battlers from this slot on that chooses an action. */
    chooser(from = 0) {
      for (let k = from; k < this.player.bms.length; k++) {
        const bm = this.player.bms[k];
        if (this.alive(bm) && !this.lockedAction(bm) && !(this.partner && k === 1)) return k;
      }
      return null;
    }

    answer(ans = {}) {
      if (!this.prompt || this.prompt.kind === 'action') return [{ type: 'error', reason: 'not-now' }];
      this.events = [];
      const fn = this.pending;
      const k = this.prompt.kind;
      if ((k === 'switch' || k === 'shift') && ans.switchTo != null && ans.switchTo >= 0) {
        const m = this.player.party[ans.switchTo];
        if (!m || m.hp <= 0 || this.player.actives.includes(ans.switchTo) || !this.mine(ans.switchTo)) return [{ type: 'error', reason: 'bad-switch' }];
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
        if (this.double) {
          // Each of the player's battlers chooses, unless it acts on its own (charging, recharging, rampaging).
          this.choices = this.player.bms.map(bm => this.lockedAction(bm));
          if (this.partner && this.alive(this.player.bms[1]) && !this.choices[1]) this.choices[1] = G.BattleAI.choose(this, this.player, 1);
          const first = this.chooser(0);
          if (first == null) { const choices = this.choices.slice(); this.queue.push(() => this.runTurnDouble(choices)); continue; }
          this.prompt = { kind: 'action', slot: first };
          return;
        }
        // A new turn. Charging, recharging or rampaging Pokémon act on their own.
        const lock = this.lockedAction(this.player.bm);
        if (lock) {
          const fa = this.foeAction();
          this.queue.push(() => this.runTurn(lock, fa));
          continue;
        }
        this.prompt = { kind: 'action' };
        return;
      }
      throw new Error('battle did not settle');
    }

    emit(type, data = {}) { this.events.push(Object.assign({ type }, data)); }

    /** Its own item used up by a Pokémon of the player's (G.Held): it does not come back after the battle. */
    markUsed(mon) { if (this.startItems.has(mon) && mon.item && mon.item === this.startItems.get(mon)) this.usedUp.add(mon); }
    /** The player's Pokémon get back what they held at the start, unless they used it up themselves (chapter 94). */
    restoreItems() {
      for (const [m, it] of this.startItems) if ((m.item || null) !== it) m.item = this.usedUp.has(m) ? null : it;
    }

    finish(outcome, extra = {}) {
      for (const sd of this.sides) for (const m of sd.party) delete m.embargo;     // Embargo ends with the battle (chapter 104)
      this.restoreItems();
      const money = (extra.money || 0) + (outcome === 'win' ? this.payDay : 0);
      if (outcome === 'win' && this.payDay) this.emit('payDay', { amt: this.payDay });
      if (money && outcome === 'win') this.emit('money', { amt: money });
      const leveled = [...this.leveled];
      const evolve = leveled.filter(uid => {
        const m = this.player.party.find(x => x.uid === uid);
        return m && m.hp > 0 && G.Evolution.candidates(m, { trigger: 'level' }).length > 0;
      });
      this.result = Object.assign({ outcome, money, leveled, evolve, seen: [...this.seen], caught: null, toBox: false, turns: this.turn }, extra, { money });
      for (const bm of this.allActive()) { bm.mon.tox = 0; if (!bm.fainted) G.Abilities.switchOut(this, bm); }   // Natural Cure
      this.emit('end', { outcome });
    }

    // ================= helpers for effects =================

    /** The foe in front (singles: the foe; doubles: the one opposite, else the other one still standing). */
    other(bm) {
      if (!this.double) return bm.side === 0 ? this.foe.bm : this.player.bm;
      const opp = this.sides[1 - bm.side].bms, front = opp[bm.slot || 0];
      return (front && this.alive(front) ? front : opp.find(f => this.alive(f))) || front || opp[0] || null;
    }
    /** Every battler in the field (the player's first). */
    allActive() { return this.player.bms.concat(this.foe.bms).filter(Boolean); }
    /** The foes still standing. */
    foes(bm) { return this.sides[1 - bm.side].bms.filter(f => this.alive(f)); }
    /** A multi battle: is this party index one of the player's own, not the partner's? */
    mine(i) { return !this.partner || i < this.partner.first; }
    /** Doubles: the partner still standing, else null. */
    ally(bm) { const a = this.double ? this.sides[bm.side].bms.find(x => x && x !== bm) : null; return a && this.alive(a) ? a : null; }
    /** The battler of a Pokémon in the field, else null. */
    bmOf(mon) { return this.allActive().find(bm => bm.mon === mon) || null; }
    sideOf(bm) { return this.sides[bm.side]; }
    alive(bm) { return !!bm && bm.mon.hp > 0 && !bm.fainted; }
    firstHealthy(side) { return side.party.findIndex(m => m.hp > 0); }
    healthyLeft(side) { return side.party.filter(m => m.hp > 0).length; }
    maxHp(bm) { return G.Mon.maxHp(bm.mon); }
    trapped(bm) { return !!(bm.vol.trap || this.byFoe(bm, bm.vol.cantEscape) || bm.vol.ingrain); }
    /** Is the foe that set this effect (by uid) still the one in battle? */
    byFoe(bm, uid) {
      if (this.double) return !!uid && this.foes(bm).some(f => f.mon.uid === uid);
      const f = this.other(bm); return !!uid && !!f && this.alive(f) && f.mon.uid === uid;
    }

    /** Effective stat with stages (and paralysis for speed). opts.crit: attacker ignores
     *  its negative stage, defender its positive one. */
    stat(bm, key, opts = {}) {
      const raw = G.Mon.stats(bm.mon)[STAT_INDEX[key]];
      let st = opts.noStages ? 0 : bm.stages[key];       // Unaware (chapter 44)
      if (opts.crit && opts.attacking) st = Math.max(0, st);
      if (opts.crit && opts.defending) st = Math.min(0, st);
      let v = Math.floor(Math.floor(raw * G.Held.statMult(bm.mon, key) * G.Abilities.statMult(this, bm, key)) * G.Stats.stage(st));
      if (key === 'spe' && bm.mon.status === 'par' && bm.ability !== 'quick-feet') v = Math.floor(v / 2);
      if (key === 'spe' && this.sides[bm.side] && this.sides[bm.side].field.tailwind) v *= 2;     // Tailwind (chapter 110)
      return Math.max(1, v);
    }

    /** Type effectiveness against this battler (Foresight lets Normal and Fighting hit Ghosts; Levitate). */
    eff(type, bm, user) {
      // Gravity (chapter 44) brings Flying types and Levitate down to the ground.
      if (type === 'ground' && (this.gravity || G.Held.is(bm.mon, 'iron-ball'))) return G.Types.eff(type, bm.types.filter(t => t !== 'flying'));   // and the Iron Ball (chapter 93)
      if (type === 'ground' && G.Abilities.ab(this, bm) === 'levitate') return 0;        // (not against Mold Breaker)
      let types = bm.types;
      // Foresight, and Scrappy (chapter 44): Normal and Fighting moves hit Ghosts.
      if ((bm.vol.foresight || G.Abilities.scrappy(user, type)) && (type === 'normal' || type === 'fighting')) types = types.filter(t => t !== 'ghost');
      return G.Types.eff(type, types);
    }

    /** The weather that counts now: none while Cloud Nine or Air Lock is out. */
    weatherNow() { return G.Abilities.weather(this); }

    weatherMult(type) {
      const w = this.weatherNow();
      if (w === 'sun') return type === 'fire' ? 1.5 : type === 'water' ? 0.5 : 1;
      if (w === 'rain') return type === 'water' ? 1.5 : type === 'fire' ? 0.5 : 1;
      return 1;
    }

    /** HP loss from a hit: a substitute takes it first; Endure / False Swipe leave 1 HP. */
    hurt(target, dmg, o = {}) {
      if (dmg <= 0) return 0;
      if (G.Abilities.magicGuard(target, o.why)) return 0;          // Magic Guard (chapter 44)
      if (this.arena && o.user && o.user !== target && o.move) this.arenaSkill(o.user, o.eff == null ? 1 : o.eff);
      if (target.vol.substitute > 0 && o.user && o.user !== target && !o.ignoreSub) {
        const d = Math.min(dmg, target.vol.substitute);
        target.vol.substitute -= d;
        this.emit('subDamage', { side: target.side, uid: target.mon.uid, amt: d });
        if (target.vol.substitute <= 0) { target.vol.substitute = 0; this.emit('subFade', { side: target.side, uid: target.mon.uid }); }
        return d;
      }
      let amt = Math.min(dmg, target.mon.hp);
      // A Focus Band (or, at full HP, a Focus Sash: chapter 93) may hold on against a foe's hit that would knock it out.
      const item = target.mon.item;
      const band = amt >= target.mon.hp && !target.vol.endure && !o.leaveOne && !!o.user && o.user !== target && G.Held.survives(this, target);
      if (amt >= target.mon.hp && (target.vol.endure || o.leaveOne || band)) {
        amt = target.mon.hp - 1;
        if (target.vol.endure) this.emit('endured', { side: target.side, uid: target.mon.uid });
      }
      target.mon.hp -= amt;
      this.emit('damage', { side: target.side, uid: target.mon.uid, amt, hp: target.mon.hp, max: this.maxHp(target),
                            crit: !!o.crit, eff: o.eff == null ? 1 : o.eff, why: o.why || 'hit', src: o.src || null });
      if (band) this.emit('held', { side: target.side, uid: target.mon.uid, item, why: band });
      if (o.user && o.user !== target && o.move) {
        target.lastHit = { cat: o.move.cat, amt, from: o.user.side, uid: o.user.mon.uid };
        if (target.vol.rage && target.mon.hp > 0) this.stage(target, 'atk', 1, { source: target, rage: true });
        if (target.mon.hp <= 0 && target.vol.destinyBond && this.alive(o.user)) {
          this.emit('destinyBond', { side: target.side, uid: target.mon.uid });
          o.user.mon.hp = 0;
          this.emit('damage', { side: o.user.side, uid: o.user.mon.uid, amt: 0, hp: 0, max: this.maxHp(o.user), why: 'destiny' });
        }
        // Grudge (chapter 109, Emerald's): knocked out by a foe's move (not Struggle), that move of the foe loses all its PP.
        if (target.mon.hp <= 0 && target.vol.grudge && o.user.side !== target.side && this.alive(o.user) && o.move !== G.MOVES.struggle) {
          const slot = o.user.mon.moves.find(m => G.MOVES[m.id] === o.move);
          if (slot) { slot.pp = 0; this.emit('grudge', { side: o.user.side, uid: o.user.mon.uid, move: slot.id }); }
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
      if (s === 'frz' && this.weatherNow() === 'sun') return fail('already');
      if (G.Abilities.blocksStatus(target, s, this)) { if (!o.silent) G.Abilities.say(this, target, 'protect'); return false; }
      const foeSource = o.source && o.source.side !== target.side;
      if (foeSource && this.sideOf(target).field.safeguard) return fail('safeguard');
      if (foeSource && o.statusMove && target.vol.substitute) return fail('sub');
      target.mon.status = s;
      if (s === 'slp') target.mon.slp = o.sleepTurns || this.rng.int(1, 3);
      if (s === 'tox') target.mon.tox = 0;
      this.emit('status', Object.assign({ side: target.side, uid: target.mon.uid, s }, o.item ? { item: o.item } : {}));
      G.Abilities.afterStatus(this, target, s, o.source);         // Synchronize
      return true;
    }

    confuse(target, o = {}) {
      if (!this.alive(target)) return false;
      if (G.Abilities.blocksConfusion(target)) { if (!o.silent) G.Abilities.say(this, target, 'protect'); return false; }   // Own Tempo
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
      delta = G.Abilities.stageDelta(target, delta);                // Simple (chapter 44)
      const foeSource = o.source && o.source.side !== target.side;
      if (delta < 0 && foeSource && (this.sideOf(target).field.mist || (o.statusMove && target.vol.substitute))) {
        if (!o.silent) this.emit(this.sideOf(target).field.mist ? 'mistBlock' : 'fail', { side: target.side, uid: target.mon.uid });
        return false;
      }
      // Clear Body, White Smoke, Hyper Cutter, Keen Eye
      if (delta < 0 && foeSource && G.Abilities.blocksDrop(target, stat)) { if (!o.silent) G.Abilities.say(this, target, 'protect'); return false; }
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
      if ((a.type === 'ball' || a.type === 'item') && this.rules.noBag) return 'no-bag';
      if (a.type === 'ball') {
        if (!o.canBall) return 'no-ball-in-trainer-battle';
        if (this.twoFoes()) return 'two-foes';            // chapter 102: it cannot be aimed while two are out
        const fx = G.ITEM_FX[a.item];
        return fx && fx.ball && (bag[a.item] || 0) > 0 ? null : 'bad-item';
      }
      if (a.type === 'item') {
        const fx = G.ITEM_FX[a.item];
        if (!fx || !fx.battle || fx.ball || !(bag[a.item] > 0)) return 'bad-item';
        if (a.target != null && !this.mine(a.target)) return 'bad-item';
        return G.BattleItems.canUse(this, this.player, a, this.double ? this.player.bms[this.prompt.slot] : undefined) ? null : 'no-effect';
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
          bracket: x.a.type === 'move' || x.a.type === 'flee' ? 0 : 1,
          stall: G.Abilities.stall(bm) || G.Held.is(bm.mon, 'lagging-tail') ? 1 : 0,   // Stall (chapter 44), Lagging Tail (93)
          pri: id && G.MOVES[id] ? G.MOVES[id].pri : 0,
          quick: x.a.type === 'move' && G.Held.quick(this, bm) ? 1 : 0,          // Quick Claw
          spe: this.stat(bm, 'spe'), tie: this.rng.next()
        });
      });
      if (this.arena) for (const x of acts) this.arenaMind(x.side.bm, x.a);
      acts.sort((p, q) => (q.bracket - p.bracket) || (q.bracket ? p.n - q.n : 0) || (q.pri - p.pri) || (p.stall - q.stall) || (q.quick - p.quick)
                          || (this.trickRoom ? p.spe - q.spe : q.spe - p.spe) || (p.tie - q.tie));      // Trick Room (chapter 44)
      for (const x of acts) x.bm = x.side.bm;
      this.queueTurn(acts);
    }

    /** Chapter 110: the turn's steps in order. First Focus Punch's users tighten their focus (Platinum's turn-start check:
     *  not asleep, not loafing, not Struggling); a switch first lets a foe that chose Pursuit and has not moved hit the one
     *  leaving (pursuit()). */
    queueTurn(acts) {
      const moveOf = x => (x.a.type === 'move' ? x.a.id || (x.bm.mon.moves[x.a.slot] || {}).id : null);
      for (const x of acts) {
        const bm = x.bm;
        if (moveOf(x) === 'focus-punch' && this.alive(bm) && bm.mon.status !== 'slp' && !(bm.ability === 'truant' && bm.vol.loafing))
          this.emit('focusPunch', { side: bm.side, uid: bm.mon.uid });
      }
      this.insert(...acts.map(x => () => {
        if (x.done) return;
        x.done = true;
        if (x.a.type === 'switch') this.pursuit(x, acts, moveOf);
        this.doAction(x.side, x.a, x.bm);
      }), () => this.endOfTurn());
    }

    /** Chapter 110, Platinum's BtlCmd_TryPursuit: a foe that chose Pursuit (not asleep, frozen or loafing, the move with PP)
     *  and has not moved yet uses it on the one switching out, at double power, before it leaves; that is its action. */
    pursuit(x, acts, moveOf) {
      const leaving = x.bm;
      for (const p of acts) {
        if (p.done || p.side === x.side || !this.alive(p.bm) || !this.alive(leaving) || this.result) continue;
        const bm = p.bm, mon = bm.mon;
        if (mon.status === 'slp' || mon.status === 'frz' || (bm.ability === 'truant' && bm.vol.loafing)) continue;
        const id = bm.vol.encore ? bm.vol.encore.move : moveOf(p);
        const slot = mon.moves.find(m => m.id === id);
        if (id !== 'pursuit' || !slot || slot.pp <= 0) continue;
        p.done = true;
        bm.moved = true;
        bm.vol.pursuing = true;
        this.doMove(bm, Object.assign({}, p.a, { target: { side: leaving.side, slot: leaving.slot || 0 } }));
        bm.vol.pursuing = false;
        this.afterAction();
      }
    }

    /** Doubles: all four actions in one order (the same rules as runTurn). */
    runTurnDouble(choices) {
      this.turn++;
      for (const bm of this.allActive()) {
        bm.moved = false; bm.vol.flinch = false; bm.vol.protect = false; bm.vol.endure = false; bm.lastHit = null;
        bm.vol.helped = false; bm.vol.followMe = false;
      }
      const acts = [];
      this.player.bms.forEach((bm, k) => {
        if (this.alive(bm) && choices[k]) acts.push({ side: this.player, bm, a: choices[k].palace ? this.palaceAction(bm) : choices[k], n: 0 });
      });
      this.foe.bms.forEach((bm, k) => {
        if (this.alive(bm)) acts.push({ side: this.foe, bm, a: this.lockedAction(bm) || (this.palace ? this.palaceAction(bm) : G.BattleAI.choose(this, this.foe, k)), n: 1 });
      });
      for (const x of acts) {
        const id = x.a.type === 'move' ? (x.a.id || (x.bm.mon.moves[x.a.slot] || {}).id) : null;
        Object.assign(x, {
          bracket: x.a.type === 'move' || x.a.type === 'flee' ? 0 : 1,
          stall: G.Abilities.stall(x.bm) || G.Held.is(x.bm.mon, 'lagging-tail') ? 1 : 0,   // Stall (chapter 44), Lagging Tail (93)
          pri: id && G.MOVES[id] ? G.MOVES[id].pri : 0,
          quick: x.a.type === 'move' && G.Held.quick(this, x.bm) ? 1 : 0,          // Quick Claw
          spe: this.stat(x.bm, 'spe'), tie: this.rng.next()
        });
      }
      acts.sort((p, q) => (q.bracket - p.bracket) || (q.bracket ? p.n - q.n : 0) || (q.pri - p.pri) || (p.stall - q.stall) || (q.quick - p.quick)
                          || (this.trickRoom ? p.spe - q.spe : q.spe - p.spe) || (p.tie - q.tie));      // Trick Room (chapter 44)
      this.choices = [];
      this.queueTurn(acts);
    }

    doAction(side, a, bm = side.bm) {
      if (!this.alive(bm) || this.result) return;
      bm.moved = true;
      bm.vol.grudge = false;                     // Grudge (chapter 109) lasts until its user's next action (Emerald's AtkCanceler)
      if (bm.arena) bm.arena.hit = false;
      if (a.type === 'switch') this.switchIn(side, a.to, bm.slot || 0);
      else if (a.type === 'run') this.tryRun();
      else if (a.type === 'ball') this.throwBall(a.item);
      else if (a.type === 'item') G.BattleItems.use(this, side, a, bm);
      else if (a.type === 'flee') this.roamFlee(bm);
      else this.doMove(bm, a);
      this.afterAction();
    }

    /** A wild double battle with both wild Pokémon still out (chapter 102): no ball can be aimed. */
    twoFoes() { return this.kind === 'wild' && this.double && this.foe.bms.filter(bm => this.alive(bm)).length > 1; }

    /** Held in battle: it can neither switch out nor run (nor, roaming, flee). */
    held(bm) { return this.trapped(bm) || G.Abilities.traps(this, bm); }

    /** A roaming Pokémon flees (rules.roamer): not while asleep, frozen, flinching or fully paralysed, nor held. */
    roamFlee(bm) {
      const mon = bm.mon, say = why => this.emit('cantMove', { side: bm.side, uid: mon.uid, why });
      if (bm.vol.recharge) { bm.vol.recharge = false; return say('recharge'); }
      if (mon.status === 'slp') {
        if (mon.slp > 0) { mon.slp = Math.max(0, mon.slp - (G.Abilities.earlyBird(bm) ? 2 : 1)); return say('slp'); }
        mon.status = null; this.emit('wake', { side: bm.side, uid: mon.uid });
      }
      if (mon.status === 'frz') {
        if (!this.rng.pct(20)) return say('frz');
        mon.status = null; this.emit('thaw', { side: bm.side, uid: mon.uid });
      }
      if (bm.vol.flinch && !G.Abilities.blocksFlinch(bm)) return say('flinch');
      if (mon.status === 'par' && this.rng.pct(25)) return say('par');
      if (this.held(bm)) return this.emit('roamHeld', { side: bm.side, uid: mon.uid });
      this.emit('roamFled', { side: bm.side, uid: mon.uid });
      this.finish('fled');
    }

    /** Doubles: the chosen target, or the other foe when it is gone (Generation 3). */
    targetFor(bm, a) {
      const t = a.target && this.sides[a.target.side] ? this.sides[a.target.side].bms[a.target.slot] : null;
      if (t && this.alive(t)) return t;
      if (t && t.side === bm.side) return this.ally(bm) || this.other(bm);
      return this.other(bm);
    }

    /** Move with the checks that come before it (recharge, sleep, freeze, flinch, confusion, paralysis, love). */
    doMove(bm, a) {
      const target = this.double ? this.targetFor(bm, a) : this.other(bm);
      const say = why => this.emit('cantMove', { side: bm.side, uid: bm.mon.uid, why });
      // An interrupted move ends its charge, its time in the sky / underground and its rampage.
      const stop = () => { bm.vol.charging = null; bm.vol.invuln = null; bm.vol.rampage = null; };
      if (bm.vol.recharge) { bm.vol.recharge = false; return say('recharge'); }
      if (G.Abilities.truant(this, bm)) { stop(); return; }
      let id = a.id || bm.mon.moves[a.slot].id;
      // Encored after choosing this turn: it repeats the encored move instead.
      if (bm.vol.encore && id !== bm.vol.encore.move && id !== 'struggle' && !a.locked) id = bm.vol.encore.move;
      const sp = G.SpecialMoves[id] || {};
      const mon = bm.mon;
      if (mon.status === 'slp') {
        if (mon.slp > 0) {
          mon.slp = Math.max(0, mon.slp - (G.Abilities.earlyBird(bm) ? 2 : 1));      // Early Bird wakes twice as fast
          if (!sp.whileAsleep) { say('slp'); stop(); return; }
        } else { mon.status = null; this.emit('wake', { side: bm.side, uid: mon.uid }); }
      }
      if (mon.status === 'frz') {
        if (this.rng.pct(20) || sp.thawsUser) { mon.status = null; this.emit('thaw', { side: bm.side, uid: mon.uid }); }
        else { stop(); return say('frz'); }
      }
      if (bm.vol.disable && bm.vol.disable.move === id && !a.locked) { stop(); return say('disabled'); }
      // Taunt (chapter 110): no status move while it lasts.
      if (bm.vol.taunt && G.MOVES[id] && G.MOVES[id].cat === 'status') { stop(); return this.emit('tauntBlocked', { side: bm.side, uid: mon.uid, move: id }); }
      if (bm.vol.flinch && !G.Abilities.blocksFlinch(bm)) { stop(); say('flinch'); return G.Abilities.steadfast(this, bm); }   // Inner Focus; Steadfast
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
        // Pressure: a move aimed at it uses two PP.
        const ppCost = G.Abilities.pressure(target) && this.alive(target) && G.MOVES[id] && !G.BattleFx.isSelf(G.MOVES[id]) ? 2 : 1;
        if (slot) slot.pp = Math.max(0, slot.pp - ppCost);
      }
      if (id !== 'rage') bm.vol.rage = false;
      if (id !== 'destiny-bond') bm.vol.destinyBond = false;
      if (a.hesitate) { stop(); return say('palace'); }                    // the Battle Palace (chapter 80)
      if (!['protect', 'detect', 'endure'].includes(id)) bm.vol.protectCount = 0;
      if (id !== bm.lastMoveHit) bm.lastMoveHit = null;
      // Focus Punch (chapter 110, effect script 0170): hit by a move this turn, it loses its focus (the PP is spent).
      if (id === 'focus-punch' && bm.lastHit && bm.lastHit.amt > 0) { stop(); return this.emit('lostFocus', { side: bm.side, uid: mon.uid }); }
      if (!a.locked) G.Held.beforeMove(bm, id);                            // Choice items, Metronome (chapter 93)
      G.BattleFx.useMove(this, bm, target, id, { locked: a.locked || null });
      G.Held.afterMove(this, bm);                                          // the Life Orb
    }

    /** After every action: berries, faints, experience, and whether the battle is over. */
    afterAction() {
      for (const bm of this.allActive()) { G.Held.berry(this, bm); G.Held.herb(this, bm); }
      const steps = [];
      for (const bm of this.allActive()) {
        const s = this.sides[bm.side];
        if (bm.mon.hp <= 0 && !bm.fainted) {
          bm.fainted = true;
          bm.mon.status = null; bm.mon.slp = 0; bm.mon.tox = 0;
          this.emit('faint', { side: s.side, uid: bm.mon.uid });
          if (s.side === 1 && !this.rules.noExp) steps.push(...this.expSteps(bm));
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
      const foeOut = this.double ? this.healthyLeft(this.foe) === 0 : this.foe.bm.fainted;
      if (foeOut && (this.kind === 'wild' || this.healthyLeft(this.foe) === 0)) {
        let money = 0;
        if (this.kind === 'trainer') {
          const t = this.foe.trainer || {};
          const last = this.foe.party[this.foe.party.length - 1];
          money = G.Exp.prize(t.prize == null ? 20 : t.prize, last.lvl) * (this.amulet ? 2 : 1);   // Amulet Coin
          this.emit('defeated', { trainer: t.id || null });
        }
        return this.finish('win', { money });
      }
    }

    endOfTurn() {
      if (this.result) return;
      const order = this.allActive().filter(bm => this.alive(bm))
        .sort((p, q) => this.stat(q, 'spe') - this.stat(p, 'spe'));
      // Weather
      if (this.weather) {
        this.weather.turns--;
        if (this.weather.turns <= 0) { this.emit('weatherEnd', { w: this.weather.w }); this.weather = null; G.Abilities.forecast(this); }
        else if (this.weatherNow() === 'sand' || this.weatherNow() === 'hail') {
          this.emit('weatherTick', { w: this.weather.w });
          for (const bm of order) {
            const safe = this.weather.w === 'sand' ? ['rock', 'ground', 'steel'] : ['ice'];
            const shelter = this.weather.w === 'hail' && (bm.ability === 'ice-body' || bm.ability === 'snow-cloak');   // (chapter 44)
            if (this.alive(bm) && !bm.types.some(t => safe.includes(t)) && !bm.vol.invuln && !shelter)
              this.hurt(bm, Math.max(1, Math.floor(this.maxHp(bm) / 16)), { why: this.weather.w });
          }
        }
      }
      // Wish (chapter 110, FIELD_COND_CHECK_STATE_WISH): the one in that place gets half of its own max HP.
      for (const k of Object.keys(this.wishes)) {
        const w = this.wishes[k];
        if (--w.turns > 0) continue;
        delete this.wishes[k];
        const [sd, sl] = k.split(':').map(Number), bm = this.sides[sd].bms[sl];
        if (!this.alive(bm)) continue;
        this.emit('wish', { side: bm.side, uid: bm.mon.uid, from: w.from });
        if (bm.mon.hp >= this.maxHp(bm)) this.emit('hpFull', { side: bm.side, uid: bm.mon.uid });
        else this.heal(bm, this.maxHp(bm) / 2, 'wish');
      }
      for (const bm of order) {
        if (!this.alive(bm)) continue;
        const max = this.maxHp(bm), uid = bm.mon.uid;
        if (bm.vol.seeded) {
          // Doubles: the seeds feed whoever stands where the seeder stood.
          const by = bm.vol.seededBy;
          const foe = this.double && by ? this.sides[by.side].bms[by.slot] : this.other(bm);
          const d = this.hurt(bm, Math.max(1, Math.floor(max / 8)), { why: 'seed' });
          if (this.alive(foe) && G.Abilities.liquidOoze(bm)) this.hurt(foe, d, { why: 'ooze' });
          else if (this.alive(foe)) this.heal(foe, G.Held.is(foe.mon, 'big-root') ? Math.floor(d * 1.3) : d, 'leech');   // Big Root (chapter 93)
        }
        if (this.alive(bm) && bm.vol.ingrain) this.heal(bm, max / 16 * G.Held.drainMult(bm), 'ingrain');
        G.Held.endOfTurn(this, bm);
        G.Abilities.endOfTurn(this, bm);
        const st = bm.mon.status;
        // Poison Heal (chapter 44): poison heals it by an eighth instead; Heatproof halves a burn's damage.
        if (this.alive(bm) && (st === 'psn' || st === 'tox') && G.Abilities.poisonHeal(bm)) {
          if (st === 'tox') bm.mon.tox = Math.min(15, bm.mon.tox + 1);
          if (bm.mon.hp < max) this.heal(bm, max / 8, 'ability', { ability: bm.ability });
        } else {
          if (this.alive(bm) && (st === 'psn' || st === 'brn')) this.hurt(bm, Math.max(1, Math.floor(max / (st === 'psn' ? 8 : G.Abilities.heatproof(bm) ? 32 : 16))), { why: st });
          if (this.alive(bm) && st === 'tox') { bm.mon.tox = Math.min(15, bm.mon.tox + 1); this.hurt(bm, Math.max(1, Math.floor(max * bm.mon.tox / 16)), { why: 'tox' }); }
        }
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
        // Embargo (chapter 104): five turns.
        if (bm.vol.embargo && --bm.vol.embargo === 0) { delete bm.mon.embargo; this.emit('embargoEnd', { side: bm.side, uid }); }
        if (this.alive(bm) && bm.vol.yawn && --bm.vol.yawn === 0) {
          bm.vol.yawn = 0;
          this.inflict(bm, 'slp', { silent: false });
        }
        if (this.alive(bm) && bm.vol.perish) {
          bm.vol.perish--;
          this.emit('perish', { side: bm.side, uid, n: bm.vol.perish });
          if (bm.vol.perish <= 0) { bm.mon.hp = 0; this.emit('damage', { side: bm.side, uid, amt: 0, hp: 0, max, why: 'perish' }); }
        }
        G.Held.orbs(this, bm);                                               // Toxic Orb, Flame Orb (chapter 93)
        if (bm.vol.disable && --bm.vol.disable.turns <= 0) { bm.vol.disable = null; this.emit('disableEnd', { side: bm.side, uid }); }
        if (bm.vol.taunt && --bm.vol.taunt <= 0) { bm.vol.taunt = 0; this.emit('tauntEnd', { side: bm.side, uid }); }      // chapter 110
        if (bm.vol.encore && (--bm.vol.encore.turns <= 0 || !bm.mon.moves.some(m => m.id === bm.vol.encore.move && m.pp > 0))) {
          bm.vol.encore = null;
          this.emit('encoreEnd', { side: bm.side, uid });
        }
        bm.turns++;
      }
      // Future Sight and Doom Desire (chapter 110): the damage reckoned when used, on whoever stands there now.
      for (const k of Object.keys(this.futures)) {
        const f = this.futures[k];
        if (--f.turns > 0) continue;
        delete this.futures[k];
        const [sd, sl] = k.split(':').map(Number), bm = this.sides[sd].bms[sl];
        if (!this.alive(bm) || this.result) continue;
        this.emit('futureHit', { side: bm.side, uid: bm.mon.uid, move: f.move });
        const acc = f.acc;
        if (acc != null && !this.rng.pct(acc)) { this.emit('miss', { side: bm.side, uid: bm.mon.uid, target: bm.mon.uid, tside: bm.side }); continue; }
        this.hurt(bm, f.dmg, { why: 'future', user: { side: f.side, mon: {} }, move: G.MOVES[f.move] });
      }
      // Trick Room and Gravity (chapter 44) wear off after five turns.
      if (this.trickRoom && --this.trickRoom === 0) this.emit('trickRoomEnd', {});
      if (this.gravity && --this.gravity === 0) this.emit('gravityEnd', {});
      // Reflect, Light Screen, Mist, Safeguard
      for (const s of this.sides) {
        for (const k of Object.keys(s.field)) {
          if (s.field[k] > 0 && --s.field[k] === 0) { delete s.field[k]; this.emit('fieldEnd', { side: s.side, effect: k }); }
        }
      }
      this.afterAction();
      if (this.arena) this.queue.push(() => this.arenaJudge());
      this.queue.push(() => this.replacements());
    }

    // ================= the Battle Palace (rules.palace, chapter 80) =================

    /** The foe's action in singles: a locked one, else its own choice in the Battle Palace, else the AI's. */
    foeAction() {
      return this.lockedAction(this.foe.bm) || (this.palace ? this.palaceAction(this.foe.bm) : G.BattleAI.choose(this, this.foe));
    }
    /** The move a Pokémon chooses by itself in the Battle Palace (see the header). */
    palaceAction(bm) {
      const lock = this.lockedAction(bm);
      if (lock) return lock;
      const usable = bm.mon.moves.map((m, slot) => ({ slot, id: m.id, pp: m.pp }))
        .filter(x => x.pp > 0 && !(bm.vol.disable && bm.vol.disable.move === x.id) && !(bm.vol.encore && bm.vol.encore.move !== x.id)
          && !(G.Held.locked(bm) && G.Held.locked(bm) !== x.id));
      if (!usable.length) return { type: 'move', id: 'struggle' };
      const row = PALACE[bm.mon.nature] || PALACE.hardy;
      const [atk, def] = bm.mon.hp * 2 < this.maxHp(bm) ? row.slice(2) : row.slice(0, 2);
      const r = this.rng.int(1, 100);
      const group = r <= atk ? 'attack' : r <= atk + def ? 'defense' : 'support';
      const mine = usable.filter(x => palaceGroup(x.id) === group);
      if (mine.length) return this.palaceAim(bm, { type: 'move', slot: this.rng.pick(mine).slot });
      if (this.rng.next() < 0.5) return { type: 'move', slot: usable[0].slot, hesitate: true };
      return this.palaceAim(bm, { type: 'move', slot: this.rng.pick(usable).slot });
    }
    /** Chapter 108, Emerald's GetBattlePalaceTarget: in doubles, a move for one target (and a Ghost's Curse) goes at the foe
     *  with more HP, less HP or either, by the user's nature (PALACE_TARGET); equal HP, either. A fainted foe counts as 0 HP
     *  (targetFor then turns the move to the other). Singles: unchanged. */
    palaceAim(bm, a) {
      if (!this.double) return a;
      const id = (bm.mon.moves[a.slot] || {}).id, M = G.MOVES[id];
      const one = M && (M.tgt === 'selected-pokemon' || (id === 'curse' && G.Mon.types(bm.mon).includes('ghost')));
      if (!one) return a;
      const side = this.sides[1 - bm.side], hp = k => { const t = side.bms[k]; return t && this.alive(t) ? t.mon.hp : 0; };
      const pref = PALACE_TARGET[bm.mon.nature] != null ? PALACE_TARGET[bm.mon.nature] : 1;
      let slot;
      if (hp(0) === hp(1) || pref === 0) slot = this.rng.int(0, 1);
      else slot = (pref > 0) === (hp(0) > hp(1)) ? 0 : 1;
      return Object.assign(a, { target: { side: side.side, slot } });
    }

    // ================= the Battle Arena (rules.arena, chapter 79) =================

    /** Mind: an attacking move chosen counts for it, Protect, Detect and Endure against it (paralysed or not). */
    arenaMind(bm, a) {
      if (!bm || !bm.arena || a.type !== 'move') return;
      const id = a.id || (bm.mon.moves[a.slot] || {}).id, M = G.MOVES[id];
      if (['protect', 'detect', 'endure'].includes(id)) bm.arena.mind--;
      else if (id === 'struggle' || (M && M.cat !== 'status')) bm.arena.mind++;
    }
    /** Skill: once per move that lands (or has no effect): by how well it hits. */
    arenaSkill(bm, eff) {
      if (!this.arena || !bm || !bm.arena || bm.arena.hit) return;
      bm.arena.hit = true;
      bm.arena.skill += eff > 1 ? 2 : eff === 1 ? 1 : -1;
    }
    /** A new match-up: both battlers start from nothing. */
    arenaStart() {
      for (const bm of this.allActive()) bm.arena = { mind: 0, skill: 0, start: Math.max(1, bm.mon.hp), hit: false };
      this.arenaTurns = 0;
    }
    /** After the third turn of a match-up with both still standing: the judge's decision; the loser faints. */
    arenaJudge() {
      if (this.result) return;
      const p = this.player.bm, f = this.foe.bm;
      if (!this.alive(p) || !this.alive(f) || !p.arena || !f.arena) return;
      if (++this.arenaTurns < 3) return;
      const rate = (x, y) => (x > y ? [2, 0] : x < y ? [0, 2] : [1, 1]);
      const body = bm => bm.mon.hp / bm.arena.start;
      const marks = { mind: rate(p.arena.mind, f.arena.mind), skill: rate(p.arena.skill, f.arena.skill), body: rate(body(p), body(f)) };
      const points = [0, 1].map(k => marks.mind[k] + marks.skill[k] + marks.body[k]);
      const winner = points[0] > points[1] ? 0 : points[0] < points[1] ? 1 : null;
      this.emit('judgeStart', {});
      this.emit('judge', { marks, uids: [p.mon.uid, f.mon.uid] });
      this.emit('judgeResult', { points, winner, uids: [p.mon.uid, f.mon.uid] });
      for (const bm of [p, f]) {
        if (winner === bm.side) continue;
        const amt = bm.mon.hp;
        bm.mon.hp = 0;
        this.emit('damage', { side: bm.side, uid: bm.mon.uid, amt, hp: 0, max: this.maxHp(bm), why: 'judge' });
      }
      this.afterAction();
    }

    /** Fainted Pokémon are replaced at the end of the turn. */
    replacements() {
      if (this.result) return;
      if (this.double) return this.replaceDouble();
      // The Battle Arena: the next in party order comes in by itself, on both sides.
      if (this.arena) {
        const next = s => () => { const i = this.firstHealthy(s); if (i >= 0) this.sendOut(s, i); };
        return this.insert(...[this.player, this.foe].filter(s => s.bm.fainted).map(next));
      }
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

    /** Doubles: each fainted slot is refilled (the player chooses), or stays empty. */
    replaceDouble() {
      const steps = [];
      this.player.bms.forEach((bm, slot) => {
        if (!bm || !bm.fainted) return;
        steps.push(() => {
          if (this.partner && slot === 1) {                     // the partner's next Pokémon comes in by itself
            const next = this.player.party.findIndex((m, i) => !this.mine(i) && m.hp > 0);
            if (next >= 0) this.sendOut(this.player, next, { slot });
            return;
          }
          const free = this.player.party.some((m, i) => this.mine(i) && m.hp > 0 && !this.player.actives.includes(i));
          if (free) this.ask({ kind: 'switch', forced: true, slot }, ans => this.switchIn(this.player, ans.switchTo, slot));
        });
      });
      this.foe.bms.forEach((bm, slot) => {
        if (!bm || !bm.fainted) return;
        steps.push(() => {
          const next = this.foe.party.findIndex((m, i) => m.hp > 0 && !this.foe.actives.includes(i) && (!this.rules.tag || i % 2 === slot));
          if (next >= 0) this.sendOut(this.foe, next, { slot });
        });
      });
      this.insert(...steps);
    }

    // ================= switching =================

    makeBM(side, mon, slot = 0) {
      return { mon, side: side.side, slot, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, vol: {},
               types: G.Held.multitype(mon) || G.SPECIES[mon.sp].types.slice(), moved: false, turns: 0, lastMove: null, lastHit: null,   // Multitype (94)
               fainted: false, participants: new Set(), ability: G.Abilities.of(mon), entered: this.turn };
    }

    /** o.noEntry: its entry ability waits (the caller runs it after its own line). */
    /** o.noEntry: its entry ability waits (the caller runs it after its own line). o.slot: doubles. */
    sendOut(side, i, o = {}) {
      const slot = o.slot || 0;
      // The one leaving this place: its Embargo ends (chapter 104).
      if (side.bms[slot] && side.bms[slot].mon) delete side.bms[slot].mon.embargo;
      side.actives[slot] = i;
      const mon = side.party[i];
      const bm = side.bms[slot] = this.makeBM(side, mon, slot);
      if (this.arena) this.arenaStart();
      if (side.side === 1) this.seen.add(mon.sp);
      if (side.side === 0 && G.Held.is(mon, 'amulet-coin')) this.amulet = true;
      this.emit('send', Object.assign({ side: side.side, uid: mon.uid, sp: mon.sp, lvl: mon.lvl, hp: mon.hp, max: G.Mon.maxHp(mon),
                          shiny: !!mon.shiny, gender: mon.gender, status: mon.status }, this.double ? { slot } : {}));
      // Those who faced a foe share its experience.
      for (const fo of this.foe.bms) for (const pl of this.player.bms) if (pl && fo && this.alive(pl) && this.alive(fo)) fo.participants.add(pl.mon.uid);
      // Chapter 110, Baton Pass: what the one before it passes on.
      if (o.baton) {
        Object.assign(bm.stages, o.baton.stages);
        Object.assign(bm.vol, o.baton.vol);
        if (o.baton.embargo) mon.embargo = o.baton.embargo;
      }
      // Hazards (Stealth Rock: chapter 44; Spikes and Toxic Spikes: chapter 110).
      if (this.started && this.alive(bm) && this.hazards(side, bm)) { this.afterAction(); return; }
      if (this.started && !o.noEntry) G.Abilities.switchIn(this, bm);
    }

    /** Chapter 110, Platinum's subscript_hazards_check: Toxic Spikes, Spikes, then Stealth Rock on the one coming in. Magic
     *  Guard: none; a Flying type or Levitate: no Spikes of either kind (unless Gravity or an Iron Ball holds it down); a
     *  grounded Poison type takes Toxic Spikes away. -> it fainted */
    hazards(side, bm) {
      if (bm.ability === 'magic-guard') return false;
      const grounded = !!this.gravity || G.Held.is(bm.mon, 'iron-ball') || !(bm.types.includes('flying') || bm.ability === 'levitate');
      if (grounded && side.toxicSpikes) {
        if (bm.types.includes('poison')) { side.toxicSpikes = 0; this.emit('toxicSpikesGone', { side: side.side, uid: bm.mon.uid }); }
        else if (!side.field.safeguard) this.inflict(bm, side.toxicSpikes >= 2 ? 'tox' : 'psn', { silent: true });
      }
      if (grounded && side.spikes && this.alive(bm)) this.hurt(bm, Math.max(1, Math.floor(this.maxHp(bm) / ((5 - side.spikes) * 2))), { why: 'spikes' });
      if (side.rocks && this.alive(bm)) this.hurt(bm, Math.max(1, Math.floor(this.maxHp(bm) * G.Types.eff('rock', bm.types) / 8)), { why: 'rocks' });
      return bm.mon.hp <= 0;
    }

    /** Chapter 110: who could come in for the one in this place (Baton Pass): the healthy ones not out, of its own Trainer. */
    bench(side, slot = 0) {
      return side.party.map((m, i) => i).filter(i => side.party[i].hp > 0 && !side.actives.includes(i)
        && (side !== this.player || (this.partner && slot === 1 ? !this.mine(i) : this.mine(i)))
        && !(side === this.foe && this.rules.tag && this.double && i % 2 !== slot));
    }

    /** Chapter 110, Baton Pass (subscript_baton_pass; battle_lib.c keeps these on the switch): its stat stages, Focus Energy,
     *  confusion, being held by Mean Look, its Substitute, Leech Seed, Lock-On, Perish Song, Ingrain and Embargo go to the one
     *  coming in. The player chooses (not for the partner); the foe sends its next one. */
    batonPass(bm) {
      if (this.result || !this.alive(bm)) return;
      const side = this.sideOf(bm), slot = bm.slot || 0, list = this.bench(side, slot);
      if (!list.length) return;
      const vol = {};
      for (const k of ['focusEnergy', 'confusion', 'cantEscape', 'substitute', 'seeded', 'seededBy', 'lockOn', 'perish', 'ingrain', 'embargo']) if (bm.vol[k]) vol[k] = bm.vol[k];
      const baton = { stages: Object.assign({}, bm.stages), vol, embargo: bm.mon.embargo || null };
      const go = i => this.switchIn(side, i, slot, { baton });
      if (side === this.player && !(this.partner && slot === 1)) this.ask(Object.assign({ kind: 'switch', forced: true, baton: true }, this.double ? { slot } : {}), ans => go(ans.switchTo));
      else go(list[0]);
    }

    switchIn(side, i, slot = 0, o = {}) {
      const old = side.bms[slot];
      if (old && !old.fainted) {
        old.mon.tox = 0;
        G.Abilities.switchOut(this, old);                   // Natural Cure
        this.emit('withdraw', { side: side.side, uid: old.mon.uid });
        // The foe's trap and seeds on it stay with the battler that leaves.
        for (const foe of this.double ? this.foes(old) : [this.other(old)]) if (foe && foe.vol.attract) foe.vol.attract = false;
      }
      this.sendOut(side, i, { slot, baton: o.baton });
    }

    // ================= running and catching =================

    tryRun() {
      this.runs++;
      const ps = G.Mon.stats(this.player.bm.mon)[5], fs = G.Mon.stats(this.foe.bm.mon)[5];
      let ok = ps >= fs || G.Held.is(this.player.bm.mon, 'smoke-ball') || G.Abilities.runAway(this.player.bm);
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
      // A wild double battle (chapter 102): the one still out.
      const fo = this.double ? this.foe.bms.find(bm => this.alive(bm)) || this.foe.bm : this.foe.bm, mon = fo.mon;
      // rules.forceCatch: debug only (F7), the next ball catches. rules.fishing: a Pokémon hooked with a rod (Lure Ball).
      // Chapter 105: the turns already over (Platinum's totalTurns), the place, the night and the Pokédex (rules from field.js).
      const m = G.Capture.ballMod(item, { foe: mon, mine: this.player.bm && this.player.bm.mon, fishing: !!this.rules.fishing,
        turns: Math.max(0, this.turn - 1), terrain: this.rules.terrain || null, night: !!this.rules.night,
        caught: !!(this.rules.caught && this.rules.caught[mon.sp]) });
      if (this.rules.forceCatch) m.ball = 255;
      this.rules.forceCatch = false;
      const r = G.Capture.roll({ max: G.Mon.maxHp(mon), hp: mon.hp, rate: m.rate, ball: m.ball,
                                 status: mon.status, rng: this.rng });
      this.emit('ball', { item, shakes: r.shakes, caught: r.caught, uid: mon.uid });
      if (!r.caught) return;
      mon.ball = item;
      if (item === 'friend-ball') mon.friendship = Math.max(mon.friendship || 0, 200);
      // The Heal Ball (chapter 105, Platinum's): full HP and no status.
      if (item === 'heal-ball') { mon.hp = G.Mon.maxHp(mon); mon.status = null; mon.slp = 0; mon.tox = 0; }
      mon.ot = { name: this.player.name, id: this.player.id };
      mon.met = { map: this.rules.where, lvl: mon.lvl };
      const toBox = this.ownParty.length >= 6;
      if (!toBox) this.ownParty.push(mon);
      this.finish('caught', { caught: mon.uid, toBox, mon });
    }

    // ================= experience =================

    /** Experience for a fainted foe: those who fought share it; with Exp. Share holders, they get half
     *  and the holders the other half (Generation 2-4). A Lucky Egg gives its holder 1.5×. With rules.expAll
     *  (the setting), every other Pokémon of the team that can fight gets half of what one fighter alone would,
     *  shown as one line ('teamExp') instead of a line each. */
    expSteps(foeBm) {
      const party = this.player.party.filter((m, i) => this.mine(i));
      const parts = party.filter(m => m.hp > 0 && foeBm.participants.has(m.uid));
      if (!parts.length) return [];
      const sharers = party.filter(m => m.hp > 0 && G.Held.is(m, 'exp-share'));
      const S = G.SPECIES[foeBm.mon.sp], gain = n => G.Exp.gain(S.bx, foeBm.mon.lvl, this.kind === 'trainer', n);
      const amt = new Map();
      if (!sharers.length) for (const m of parts) amt.set(m, gain(parts.length));
      else {
        for (const m of parts) amt.set(m, Math.max(1, Math.floor(gain(parts.length) / 2)));
        for (const m of sharers) amt.set(m, (amt.get(m) || 0) + Math.max(1, Math.floor(gain(sharers.length) / 2)));
      }
      const team = this.rules.expAll ? party.filter(m => m.hp > 0 && !m.egg && !amt.has(m)) : [];
      for (const m of team) amt.set(m, Math.max(1, Math.floor(gain(1) / 2)));
      const steps = party.filter(m => amt.has(m) && !team.includes(m)).map(m => () => this.giveExp(m, Math.floor(amt.get(m) * G.Held.expMult(m)), S.ev));
      if (team.length) {
        steps.push(() => this.emit('teamExp', { n: team.length }));
        for (const m of team) steps.push(() => this.giveExp(m, Math.floor(amt.get(m) * G.Held.expMult(m)), S.ev, true));
      }
      return steps;
    }

    giveExp(mon, amt, evs, quiet = false) {
      const gr = G.SPECIES[mon.sp].gr;
      const cap = G.Stats.expAt(gr, 100);
      if (mon.lvl >= 100) return;
      mon.exp = Math.min(cap, mon.exp + amt);
      G.Exp.addEvs(mon, evs);
      this.emit('exp', { uid: mon.uid, amt, exp: mon.exp, lvl: mon.lvl, quiet,
                         from: G.Stats.expAt(gr, mon.lvl), to: G.Stats.expAt(gr, Math.min(100, mon.lvl + 1)) });
      this.insert(() => this.levelStep(mon));
    }

    levelStep(mon) {
      const gr = G.SPECIES[mon.sp].gr;
      if (mon.lvl >= 100 || mon.exp < G.Stats.expAt(gr, mon.lvl + 1)) return;
      const before = G.Mon.stats(mon), oldMax = before[0];
      mon.lvl++;
      G.Mon.recalc(mon, oldMax);
      // The Soothe Bell (chapter 104): x1.5.
      mon.friendship = Math.min(255, (mon.friendship || 0) + G.Held.friendship(mon, mon.friendship < 100 ? 5 : mon.friendship < 200 ? 3 : 2));
      this.leveled.add(mon.uid);
      this.emit('levelup', { uid: mon.uid, lvl: mon.lvl, before, after: G.Mon.stats(mon), hp: mon.hp,
                             from: G.Stats.expAt(gr, mon.lvl), to: G.Stats.expAt(gr, Math.min(100, mon.lvl + 1)) });
      const bm = this.bmOf(mon);
      if (bm && bm.side === 0) bm.types = G.SPECIES[mon.sp].types.slice();
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

  return { create: o => new Battle(o), Battle, STAGES, PALACE, PALACE_TARGET, palaceGroup };
})();
