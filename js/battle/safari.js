/* ============ safari.js — a battle in the Safari Zone ============
 * No Pokémon of yours fights: you throw Safari Balls, Bait or Rocks, or run.
 *
 *   const b = G.Safari.create({ seed, player: { name, id, party, bag }, foe: { party: [mon] } })
 *   b.start() -> events                     like G.Battle (the battle screen plays them)
 *   b.act({ type: 'ball' | 'bait' | 'rock' | 'run' }) -> events
 *   b.prompt { kind: 'action' } until b.result { outcome: 'caught' | 'run' | 'fled', mon, caught, toBox, seen }
 *   b.options() -> { balls }               Safari Balls left in the bag
 *
 * The rules (after the handheld games, simplified):
 *   - catch: the Generation 3 formula (capture.js) with a Safari Ball (×1.5), full HP, no status;
 *     the species' catch rate is halved while it eats (bait) and doubled while it is angry (rock)
 *   - every turn it stays, it may flee: speed / 300 (at most 50%), ×2 angry (at most 90%),
 *     ×¼ eating; bait and rocks last 1 to 5 turns (a new throw replaces the old mood)
 *   - running always works; with no Safari Ball left the battle ends ('run')
 * Events: start, ball, bait, rock, eating, angry, watching, safariFled, noBalls, end.
 */
G.Safari = (() => {
  const BALL = 'safari-ball';

  class SafariBattle {
    constructor(o) {
      this.kind = 'safari';
      this.rng = G.RNG(o.seed == null ? 1 : o.seed);
      this.rules = Object.assign({ where: null }, o.rules);
      const mon = o.foe.party[0];
      this.player = { side: 0, name: o.player.name || '', id: o.player.id, party: o.player.party, bag: o.player.bag || {}, active: -1, bm: null };
      this.foe = { side: 1, party: [mon], active: 0, bm: { mon, side: 1, vol: {} }, trainer: null };
      this.sides = [this.player, this.foe];
      this.mood = null;                  // { kind: 'eating' | 'angry', turns }
      this.events = [];
      this.prompt = null;
      this.result = null;
      this.seen = [mon.sp];
    }

    emit(type, data = {}) { this.events.push(Object.assign({ type }, data)); }

    start() {
      this.events = [];
      this.emit('start', { kind: 'safari', trainer: null });
      this.prompt = { kind: 'action' };
      return this.events;
    }

    options() { return { balls: this.player.bag[BALL] | 0 }; }

    act(a) {
      if (!this.prompt || this.prompt.kind !== 'action') return [{ type: 'error', reason: 'not-now' }];
      this.events = [];
      const mon = this.foe.bm.mon;
      if (a.type === 'run') { this.emit('run', { ok: true }); this.finish('run'); return this.events; }
      if (a.type === 'ball') {
        if (!(this.player.bag[BALL] > 0)) return [{ type: 'error', reason: 'no-balls' }];
        if (--this.player.bag[BALL] <= 0) delete this.player.bag[BALL];
        const rate = Math.max(1, Math.min(255, Math.floor(G.SPECIES[mon.sp].cr * this.catchMod())));
        const r = G.Capture.roll({ max: G.Mon.maxHp(mon), hp: mon.hp, rate, ball: G.ITEM_FX[BALL].ball, status: null, rng: this.rng });
        this.emit('ball', { item: BALL, shakes: r.shakes, caught: r.caught, uid: mon.uid });
        if (r.caught) {
          mon.ball = BALL;
          mon.ot = { name: this.player.name, id: this.player.id };
          mon.met = { map: this.rules.where, lvl: mon.lvl };
          const toBox = this.player.party.length >= 6;
          if (!toBox) this.player.party.push(mon);
          this.finish('caught', { caught: mon.uid, toBox, mon });
          return this.events;
        }
      } else if (a.type === 'bait' || a.type === 'rock') {
        this.emit(a.type, { player: this.player.name });
        this.mood = { kind: a.type === 'bait' ? 'eating' : 'angry', turns: this.rng.int(1, 5) };
      } else return [{ type: 'error', reason: 'bad-action' }];
      this.endOfTurn();
      return this.events;
    }

    catchMod() { return !this.mood ? 1 : this.mood.kind === 'eating' ? 0.5 : 2; }

    fleeChance() {
      const spd = G.SPECIES[this.foe.bm.mon.sp].base[5];
      let p = Math.min(0.5, spd / 300);
      if (this.mood && this.mood.kind === 'angry') p = Math.min(0.9, p * 2);
      else if (this.mood && this.mood.kind === 'eating') p *= 0.25;
      return p;
    }

    endOfTurn() {
      const mon = this.foe.bm.mon;
      if (this.rng.next() < this.fleeChance()) { this.emit('safariFled', { uid: mon.uid }); this.finish('fled'); return; }
      this.emit(this.mood ? this.mood.kind : 'watching', { uid: mon.uid });
      if (this.mood && --this.mood.turns <= 0) this.mood = null;
      if (!(this.player.bag[BALL] > 0)) { this.emit('noBalls', {}); this.finish('run'); }
    }

    finish(outcome, extra = {}) {
      this.prompt = null;
      this.result = Object.assign({ outcome, money: 0, leveled: [], evolve: [], seen: [...this.seen], caught: null, toBox: false }, extra);
      this.emit('end', { outcome });
    }
  }

  const create = o => new SafariBattle(o);
  return { create, BALL };
})();
