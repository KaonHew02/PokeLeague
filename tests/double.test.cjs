// Double battles (chapter 40): two Pokémon a side (js/battle/battle.js with rules.double, effects.js targets, ai.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel, plain } = require('./helpers.cjs');
const G = battleBoot();

const T = { id: 't', name: 'T', ai: 'basic', prize: 20 };
/** A double battle: me = [a, b], foes = [c, d] (more in the back). */
const dbl = (me, foes, o = {}) => duel(G, Object.assign({ me: me[0], mine: me.slice(1), foe: foes[0], foes: foes.slice(1), trainer: T,
                                                          rules: { double: true }, seed: 3 }, o));
const uidOf = (b, side, slot) => b.sides[side].bms[slot].mon.uid;
const at = (side, slot) => ({ side, slot });
const moves = ev => ev.filter(e => e.type === 'move').map(e => e.uid);
const dmgOn = (ev, uid) => ev.filter(e => e.type === 'damage' && e.uid === uid && e.why === 'hit');
/** Records what G.Damage.calc was asked during fn(). */
function calcs(fn) {
  const real = G.Damage.calc, seen = [];
  G.Damage.calc = o => { seen.push(o); return real(o); };
  try { fn(); } finally { G.Damage.calc = real; }
  return seen;
}

test('a double battle sends out two a side and asks for each of the player\'s Pokémon in turn', () => {
  const { b, events } = dbl([['pikachu', 30, ['tackle']], ['eevee', 30, ['tackle']]], [['rattata', 30, ['tackle']], ['zubat', 30, ['tackle']]]);
  assert.ok(b.double);
  const sends = events.filter(e => e.type === 'send');
  assert.deepEqual(plain(sends.map(e => [e.side, e.slot])), [[1, 0], [1, 1], [0, 0], [0, 1]]);
  assert.deepEqual(plain(b.prompt), { kind: 'action', slot: 0 });
  assert.deepEqual(plain(b.act({ type: 'move', slot: 0, target: at(1, 0) })), []);
  assert.deepEqual(plain(b.prompt), { kind: 'action', slot: 1 });
  // Back: the first one chooses again.
  assert.deepEqual(plain(b.back()), []);
  assert.deepEqual(plain(b.prompt), { kind: 'action', slot: 0 });
  b.act({ type: 'move', slot: 0, target: at(1, 0) });
  const ev = b.act({ type: 'move', slot: 0, target: at(1, 1) });
  assert.equal(moves(ev).length, 4, 'all four acted');
  assert.equal(b.prompt.kind, 'action');
  // A wild battle is never a double battle.
  assert.ok(!duel(G, { me: ['pikachu', 10, ['tackle']], foe: ['rattata', 3, ['tackle']], rules: { double: true } }).b.double);
});

test('all four act in one order: priority, then Speed', () => {
  const { b } = dbl([['electrode', 40, ['splash']], ['slowpoke', 40, ['splash']]], [['ninjask', 40, ['splash']], ['snorlax', 40, ['splash']]]);
  b.act({ type: 'move', slot: 0 });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.deepEqual(plain(moves(ev)), [uidOf(b, 1, 0), uidOf(b, 0, 0), uidOf(b, 1, 1), uidOf(b, 0, 1)]);
});

test('a move on both foes hits each for half (Rock Slide); Earthquake hits the partner too, at full power', () => {
  const me = [['golem', 40, ['rock-slide', 'earthquake']], ['geodude', 40, ['splash']]];
  const foes = [['rattata', 40, ['splash']], ['raticate', 40, ['splash']]];
  let d = dbl(me, foes);
  let ev;
  const rs = calcs(() => { d.b.act({ type: 'move', slot: 0 }); ev = d.b.act({ type: 'move', slot: 0 }); });
  assert.ok(dmgOn(ev, uidOf(d.b, 1, 0)).length && dmgOn(ev, uidOf(d.b, 1, 1)).length, 'both foes hit');
  assert.ok(rs.length >= 2 && rs.every(o => o.spread === 0.5));
  d = dbl(me, foes);
  const eq = calcs(() => { d.b.act({ type: 'move', slot: 1 }); ev = d.b.act({ type: 'move', slot: 0 }); });
  assert.ok(dmgOn(ev, uidOf(d.b, 0, 1)).length || ev.some(e => e.type === 'noEffect' && e.uid === uidOf(d.b, 0, 1)), 'the partner too');
  assert.ok(eq.every(o => !o.spread), 'no half damage');
  // With one foe left, Rock Slide is a full hit.
  d = dbl(me, foes);
  d.foes[1].hp = 0;
  d.b.foe.bms[1].fainted = true;
  const one = calcs(() => { d.b.act({ type: 'move', slot: 0 }); d.b.act({ type: 'move', slot: 0 }); });
  assert.ok(one.length && one.every(o => !o.spread));
});

test('a move aimed at a foe that already fainted goes to the other foe', () => {
  const { b, foes } = dbl([['slowpoke', 40, ['tackle']], ['jolteon', 40, ['quick-attack']]], [['rattata', 40, ['splash']], ['raticate', 40, ['splash']]]);
  foes[0].hp = 1;
  b.act({ type: 'move', slot: 0, target: at(1, 0) });
  const ev = b.act({ type: 'move', slot: 0, target: at(1, 0) });
  assert.ok(ev.some(e => e.type === 'faint' && e.uid === foes[0].uid), 'Jolteon knocks it out first');
  assert.ok(dmgOn(ev, foes[1].uid).length, 'Slowpoke\'s Tackle hits the other one');
});

test('a fainted slot is refilled on its own; the battle ends when one side has nobody left', () => {
  const { b, party } = dbl([['pikachu', 10, ['splash']], ['eevee', 30, ['splash']], ['pidgey', 30, ['splash']]],
                           [['onix', 50, ['rock-throw']], ['zubat', 5, ['splash']]], { trainer: Object.assign({}, T, { ai: 'basic' }) });
  b.act({ type: 'move', slot: 0 });
  b.act({ type: 'move', slot: 0 });
  for (let i = 0; i < 6 && b.prompt && b.prompt.kind === 'action'; i++) b.act({ type: 'move', slot: 0 });
  assert.equal(b.prompt.kind, 'switch');
  assert.equal(b.prompt.forced, true);
  const slot = b.prompt.slot;
  assert.equal(b.player.bms[slot].fainted, true);
  const ev = b.answer({ switchTo: 2 });
  assert.ok(ev.some(e => e.type === 'send' && e.uid === party[2].uid && e.slot === slot));
  assert.equal(b.player.actives[slot], 2);
});

test('with one Pokémon able to fight, the player has one slot against two', () => {
  const { b } = dbl([['blastoise', 60, ['surf']]], [['rattata', 20, ['tackle']], ['zubat', 20, ['tackle']]]);
  assert.equal(b.player.bms.length, 1);
  assert.equal(b.foe.bms.length, 2);
  const ev = b.act({ type: 'move', slot: 0 });
  assert.equal(b.result && b.result.outcome, 'win', 'Surf hits both foes');
  assert.ok(ev.some(e => e.type === 'defeated'));
});

test('Intimidate cuts both foes\' Attack; Follow Me draws the foes\' moves; Helping Hand powers up the partner', () => {
  const g = dbl([['gyarados', 30, ['splash']], ['eevee', 30, ['splash']]], [['rattata', 30, ['splash']], ['zubat', 30, ['splash']]]);
  assert.deepEqual(plain(g.b.foe.bms.map(bm => bm.stages.atk)), [-1, -1]);
  // Follow Me: Pikachu aims at Rattata, Clefairy takes it.
  const f = dbl([['pikachu', 30, ['thunder-shock']], ['eevee', 30, ['splash']]], [['rattata', 30, ['splash']], ['clefairy', 30, ['follow-me']]]);
  f.b.act({ type: 'move', slot: 0, target: at(1, 0) });
  const ev = f.b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'followMe'));
  assert.ok(dmgOn(ev, uidOf(f.b, 1, 1)).length && !dmgOn(ev, uidOf(f.b, 1, 0)).length);
  // Helping Hand (+5 priority): the partner's Tackle at 1.5× power.
  const run = help => {
    const d = dbl([['rattata', 30, ['tackle']], ['eevee', 30, ['helping-hand', 'splash']]], [['snorlax', 50, ['splash']], ['snorlax', 50, ['splash']]], { seed: 9 });
    return calcs(() => { d.b.act({ type: 'move', slot: 0, target: at(1, 0) }); d.b.act({ type: 'move', slot: help ? 0 : 1 }); })[0].pow;
  };
  assert.equal(run(true), Math.floor(run(false) * 1.5));
});

test('Lightning Rod draws an Electric move aimed at its partner; Plus and Minus power each other up', () => {
  const { b } = dbl([['pikachu', 30, ['thunder-shock']], ['eevee', 30, ['splash']]],
                    [['rattata', 30, ['splash']], ['electrike', 30, ['splash'], { ability: 'lightning-rod' }]]);
  b.act({ type: 'move', slot: 0, target: at(1, 0) });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'ability' && e.why === 'rod' && e.side === 1));
  assert.ok(ev.some(e => e.type === 'damage' && e.uid === uidOf(b, 1, 1)) && !dmgOn(ev, uidOf(b, 1, 0)).length);
  const pm = dbl([['plusle', 30, ['splash'], { ability: 'plus' }], ['minun', 30, ['splash'], { ability: 'minus' }]], [['rattata', 30, ['splash']], ['zubat', 30, ['splash']]]);
  const raw = G.Mon.stats(pm.b.player.bms[0].mon)[3];
  assert.equal(pm.b.stat(pm.b.player.bms[0], 'spa'), Math.floor(raw * 1.5));
  const alone = duel(G, { me: ['plusle', 30, ['splash'], { ability: 'plus' }], foe: ['rattata', 30, ['splash']] });
  assert.equal(alone.b.stat(alone.b.player.bm, 'spa'), G.Mon.stats(alone.b.player.bm.mon)[3], 'no partner in a single battle');
});

test('the AI aims: each foe picks a target, and the strongest hit goes where it hurts most', () => {
  const { b } = dbl([['charizard', 40, ['splash']], ['onix', 40, ['splash']]], [['wartortle', 40, ['water-gun']], ['poliwhirl', 40, ['water-gun']]]);
  const a = G.BattleAI.choose(b, b.foe, 0);
  assert.deepEqual(plain(a.target), at(0, 1), 'Water Gun at Onix (4×) rather than Charizard (2×)');
  // It does not throw Earthquake at its own partner without reason.
  const q = dbl([['pikachu', 40, ['splash']], ['eevee', 40, ['splash']]], [['dugtrio', 40, ['earthquake', 'scratch']], ['magneton', 40, ['splash']]]);
  assert.equal(q.b.foe.bms[0].mon.moves[G.BattleAI.choose(q.b, q.b.foe, 0).slot].id, 'scratch');
});

test('both of the player\'s Pokémon that faced a foe share its experience; the same seed gives the same battle', () => {
  const { b, party } = dbl([['pikachu', 30, ['thunderbolt']], ['eevee', 30, ['quick-attack']]], [['magikarp', 5, ['splash']], ['magikarp', 5, ['splash']]]);
  b.act({ type: 'move', slot: 0, target: at(1, 0) });
  const ev = b.act({ type: 'move', slot: 0, target: at(1, 1) });
  for (const m of party) assert.ok(ev.some(e => e.type === 'exp' && e.uid === m.uid), 'experience for ' + G.Mon.name(m));
  const play = () => {
    const d = dbl([['pikachu', 30, ['thunderbolt', 'quick-attack']], ['eevee', 30, ['tackle', 'sand-attack']]],
                  [['raticate', 32, ['hyper-fang', 'quick-attack']], ['golbat', 32, ['wing-attack', 'bite']]], { seed: 11 });
    const all = d.events.slice();
    for (let i = 0; i < 20 && d.b.prompt; i++) {
      if (d.b.prompt.kind === 'action') all.push(...d.b.act({ type: 'move', slot: i % 2, target: at(1, i % 2) }));
      else if (d.b.prompt.kind === 'switch') all.push(...d.b.answer({ switchTo: d.b.options().switchable[0] }));
      else break;
    }
    return JSON.stringify(all);
  };
  assert.equal(play(), play());
});

// ---------------- Multi battles beside a partner (chapter 55) ----------------

const tag = (me, mate, foes, o = {}) => dbl(me, foes, Object.assign({ partner: mate, rules: { double: true, tag: true } }, o));
const faint = (b, side, slot) => { b.sides[side].bms[slot].mon.hp = 1; };

test('a partner fights in the second slot: only the first one is asked, the computer plays the other', () => {
  const { b, events, party } = tag([['pikachu', 30, ['tackle']], ['eevee', 30, ['tackle']]], [['staraptor', 30, ['aerial-ace']], ['heracross', 30, ['tackle']]],
    [['snorlax', 50, ['splash']], ['snorlax', 50, ['splash']]]);
  assert.equal(party.length, 2, 'the real party is left alone');
  assert.equal(b.player.party.length, 4);
  assert.deepEqual(plain(events.filter(e => e.type === 'send' && e.side === 0).map(e => e.sp)), [25, 398]);
  assert.deepEqual(plain(b.prompt), { kind: 'action', slot: 0 });
  const ev = b.act({ type: 'move', slot: 0, target: at(1, 0) });
  assert.equal(moves(ev).length, 4, 'all four acted after one choice');
  assert.ok(ev.some(e => e.type === 'move' && e.move === 'aerial-ace'), 'the partner chose its own move');
  assert.equal(b.prompt.kind, 'action');
  assert.equal(b.prompt.slot, 0);
});

test("a partner's Pokémon cannot be switched in by the player, and items only reach the player's own", () => {
  const { b } = tag([['pikachu', 30, ['tackle']], ['eevee', 30, ['tackle']]], [['staraptor', 30, ['splash']], ['heracross', 30, ['splash']]],
    [['rattata', 30, ['splash']], ['zubat', 30, ['splash']]], { bag: { potion: 2 } });
  assert.deepEqual(plain(b.options(0).switchable), [1]);
  assert.equal(b.act({ type: 'switch', to: 3 })[0].reason, 'bad-switch');
  b.player.party[3].hp = 1;
  assert.equal(b.act({ type: 'item', item: 'potion', target: 3 })[0].reason, 'bad-item');
  assert.deepEqual(plain(b.prompt), { kind: 'action', slot: 0 }, 'still the same choice');
});

test("the partner's next Pokémon comes in by itself; the player chooses their own, from their own", () => {
  const { b } = tag([['pikachu', 30, ['memento']], ['eevee', 30, ['tackle']]], [['stunky', 30, ['memento']], ['heracross', 30, ['splash']]],
    [['snorlax', 90, ['splash']], ['snorlax', 90, ['splash']]]);
  b.act({ type: 'move', slot: 0, target: at(1, 0) });
  assert.equal(b.prompt.kind, 'switch');
  assert.equal(b.prompt.slot, 0);
  assert.equal(b.answer({ switchTo: 3 })[0].reason, 'bad-switch', "the partner's are refused");
  const ev = b.answer({ switchTo: 1 });
  assert.deepEqual(plain(ev.filter(e => e.type === 'send' && e.side === 0).map(e => [e.sp, e.slot])), [[133, 0], [214, 1]], 'Heracross, with nobody asked');
  assert.deepEqual(plain(b.prompt), { kind: 'action', slot: 0 });
});

test('only the player gets experience, and the partner fights on when the team is down; both down is a loss', () => {
  // The foe falls to the partner: the player's Pokémon shares it, the partner's get nothing.
  let d = tag([['pikachu', 30, ['splash']]], [['machamp', 80, ['karate-chop']]], [['rattata', 5, ['splash']], ['rattata', 5, ['splash']]]);
  const mate = d.b.player.party[1], exp = mate.exp;
  const ev = d.b.act({ type: 'move', slot: 0, target: at(1, 0) });
  assert.ok(ev.some(e => e.type === 'exp' && e.uid === d.party[0].uid));
  assert.ok(!ev.some(e => e.type === 'exp' && e.uid === mate.uid));
  assert.equal(mate.exp, exp);
  // The player's team falls: no more questions, and the partner wins alone.
  d = tag([['pikachu', 30, ['splash']]], [['machamp', 80, ['karate-chop']]], [['golem', 60, ['earthquake']], ['rattata', 5, ['splash']]]);
  faint(d.b, 0, 0);
  d.b.act({ type: 'move', slot: 0 });
  assert.ok(d.party[0].hp <= 0);
  assert.equal(d.b.result && d.b.result.outcome, 'win', 'the partner finished it');
  // Both down.
  d = tag([['pikachu', 30, ['splash']]], [['caterpie', 2, ['splash']]], [['golem', 90, ['earthquake']], ['golem', 90, ['earthquake']]]);
  faint(d.b, 0, 0);
  d.b.act({ type: 'move', slot: 0 });
  assert.equal(d.b.result && d.b.result.outcome, 'lose');
});

test('two foes (rules.tag) each refill their own slot, and a slot stays empty when its trainer is out', () => {
  const { b } = tag([['machamp', 90, ['karate-chop']]], [['machamp', 90, ['splash']]],
    [['rattata', 5, ['splash']], ['zubat', 5, ['splash']], ['raticate', 5, ['splash']], ['golbat', 5, ['splash']], ['pidgey', 5, ['splash']]]);
  assert.deepEqual(plain(b.foe.bms.map(x => x.mon.sp)), [19, 41]);
  // Slot 1 falls first: it takes the second trainer's next one (Golbat), not the first free one in the party.
  let ev = b.act({ type: 'move', slot: 0, target: at(1, 1) });
  assert.deepEqual(plain(ev.filter(e => e.type === 'send' && e.side === 1).map(e => [e.sp, e.slot])), [[42, 1]]);
  // Its trainer is out after that: the slot stays empty, and the other one goes on.
  ev = b.act({ type: 'move', slot: 0, target: at(1, 1) });
  assert.deepEqual(plain(ev.filter(e => e.type === 'send' && e.side === 1)), []);
  assert.ok(!b.result);
  assert.ok(!b.alive(b.foe.bms[1]));
  ev = b.act({ type: 'move', slot: 0, target: at(1, 0) });
  assert.deepEqual(plain(ev.filter(e => e.type === 'send' && e.side === 1).map(e => [e.sp, e.slot])), [[20, 0]]);
});
