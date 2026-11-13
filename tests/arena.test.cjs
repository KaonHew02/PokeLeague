// The Battle Arena's rule (chapter 79): rules.arena in js/battle/battle.js. One on one, no switching, three turns a
// match-up, then the judge (mind, skill, body); the loser faints and the next comes in by itself.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, duel, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE)).G;
const arena = o => duel(G, Object.assign({ kind: 'trainer', rules: { arena: true } }, o));
const types = evs => evs.map(e => e.type);
const move = b => b.act({ type: 'move', slot: 0 });

test('the Battle Arena: no switching, no Shift question, Roar and Whirlwind fail; without the rule they work', () => {
  const { b } = arena({ me: ['snorlax', 50, ['roar']], mine: [['pikachu', 50, ['thunderbolt']]], foe: ['snorlax', 50, ['growl']], foes: [['geodude', 50, ['tackle']]] });
  assert.ok(b.arena && !b.rules.shift);
  assert.equal(b.options().canSwitch, false);
  assert.equal(b.act({ type: 'switch', to: 1 })[0].reason, 'bad-switch');
  const ev = move(b);
  assert.ok(types(ev).includes('fail') && !types(ev).includes('draggedOut'), 'Roar fails');
  assert.equal(b.foe.bm.mon.sp, 143);
  const two = duel(G, { kind: 'trainer', me: ['snorlax', 50, ['roar']], foe: ['snorlax', 50, ['growl']], foes: [['geodude', 50, ['tackle']]] }).b;
  assert.equal(two.options().canSwitch, true);
  assert.ok(types(move(two)).includes('draggedOut'), 'Roar works in other battles');
});

test('three turns, then the judge: all three marks to the attacker; the loser faints, the next comes in by itself, the winner keeps its HP', () => {
  const { b, foes } = arena({ me: ['snorlax', 50, ['tackle']], foe: ['snorlax', 50, ['growl']], foes: [['geodude', 50, ['tackle']]] });
  move(b); move(b);
  assert.equal(b.arenaTurns, 2);
  assert.deepEqual([b.player.bm.arena.mind, b.foe.bm.arena.mind, b.player.bm.arena.skill, b.foe.bm.arena.skill], [2, 0, 2, 0]);
  const hp = b.player.bm.mon.hp;
  const ev = move(b);
  const judge = ev.find(e => e.type === 'judge'), result = ev.find(e => e.type === 'judgeResult');
  assert.ok(types(ev).indexOf('judgeStart') < types(ev).indexOf('judge'));
  assert.deepEqual(plain(judge.marks), { mind: [2, 0], skill: [2, 0], body: [2, 0] });
  assert.deepEqual([plain(result.points), result.winner], [[6, 0], 0]);
  assert.equal(foes[0].hp, 0);
  assert.ok(ev.some(e => e.type === 'damage' && e.why === 'judge' && e.side === 1));
  assert.ok(ev.some(e => e.type === 'faint' && e.side === 1));
  assert.ok(ev.some(e => e.type === 'send' && e.side === 1 && e.sp === 74), 'Geodude comes in by itself');
  assert.equal(b.prompt.kind, 'action', 'no question asked');
  assert.equal(b.player.bm.mon.hp, hp, 'the winner stays with its HP');
  // A new match-up: the turns and both scores start again.
  assert.deepEqual([b.arenaTurns, b.player.bm.arena.mind, b.player.bm.arena.skill, b.player.bm.arena.start], [0, 0, 0, hp]);
  // The text of the decision.
  assert.equal(G.BattleText.line(judge, b), 'Mind ○ : × · Skill ○ : × · Body ○ : ×');
  assert.equal(G.BattleText.line(result, b), 'Score: Snorlax 6, Foe Snorlax 0. Snorlax wins!');
  assert.equal(G.BattleText.line(ev.find(e => e.type === 'judgeStart'), b), 'Three turns are up! The referee will decide.');
});

test('the scores: Protect costs mind; skill counts once per move by how well it hits; body is the HP kept', () => {
  // Protect three times against Growl: mind ×, the rest even; the protecting one loses and the next comes in.
  let { b, party } = arena({ me: ['snorlax', 50, ['protect']], mine: [['pikachu', 50, ['thunderbolt']]], foe: ['snorlax', 50, ['growl']] });
  let ev = [].concat(move(b), move(b), move(b));
  assert.deepEqual(plain(ev.find(e => e.type === 'judge').marks), { mind: [0, 2], skill: [1, 1], body: [1, 1] });
  assert.equal(ev.find(e => e.type === 'judgeResult').winner, 1);
  assert.equal(party[0].hp, 0);
  assert.equal(b.player.bm.mon.sp, 25, 'Pikachu comes in by itself');
  assert.equal(b.prompt.kind, 'action');
  // Skill: super effective +2 (a two-hit move counts once), neutral +1, not very effective -1, no effect -1.
  const skill = (me, foe) => { const r = arena({ me, foe }); move(r.b); return r.b.player.bm.arena.skill; };
  assert.equal(skill(['machop', 10, ['double-kick']], ['snorlax', 50, ['growl']]), 2);
  assert.equal(skill(['rattata', 10, ['tackle']], ['snorlax', 50, ['growl']]), 1);
  assert.equal(skill(['pikachu', 10, ['thunder-shock']], ['bulbasaur', 50, ['growl']]), -1);
  assert.equal(skill(['pikachu', 10, ['thunder-shock']], ['geodude', 50, ['growl']]), -1);
  // Asleep, it still chose to attack: mind +1, skill nothing.
  ({ b } = arena({ me: ['snorlax', 50, ['tackle'], { status: 'slp', slp: 5 }], foe: ['snorlax', 50, ['growl']] }));
  move(b);
  assert.deepEqual([b.player.bm.arena.mind, b.player.bm.arena.skill], [1, 0]);
  // Body: the one that lost less of its HP (from where the match-up began) gets ○.
  ({ b } = arena({ me: ['snorlax', 50, ['growl']], foe: ['snorlax', 50, ['tackle']] }));
  ev = [].concat(move(b), move(b), move(b));
  assert.deepEqual(plain(ev.find(e => e.type === 'judge').marks), { mind: [0, 2], skill: [0, 2], body: [0, 2] });
});

test('a draw: both faint and both send the next; with the last on both sides, the challenger loses', () => {
  let { b, party, foes } = arena({ me: ['snorlax', 50, ['growl']], mine: [['pikachu', 50, ['growl']]], foe: ['snorlax', 50, ['growl']], foes: [['geodude', 50, ['growl']]] });
  let ev = [].concat(move(b), move(b), move(b));
  const r = ev.find(e => e.type === 'judgeResult');
  assert.deepEqual([plain(r.points), r.winner], [[3, 3], null]);
  assert.equal(G.BattleText.line(r, b), "Score: Snorlax 3, Foe Snorlax 3. It's a draw: both are out!");
  assert.deepEqual([party[0].hp, foes[0].hp], [0, 0]);
  assert.deepEqual([b.player.bm.mon.sp, b.foe.bm.mon.sp], [25, 74]);
  assert.equal(b.result, null);
  ev = [].concat(move(b), move(b), move(b));
  assert.equal(b.result.outcome, 'lose', 'the last ones tie: the challenger loses');
  assert.ok(types(ev).includes('outOfPokemon'));
});

test('a knock-out before the third turn ends the match-up as usual; the next match-up counts its own three turns', () => {
  const { b } = arena({ me: ['mewtwo', 70, ['psychic']], mine: [['snorlax', 50, ['growl']]], foe: ['machop', 10, ['growl']], foes: [['snorlax', 50, ['growl']]] });
  const ev = move(b);
  assert.ok(ev.some(e => e.type === 'faint' && e.side === 1) && !types(ev).includes('judge'));
  assert.equal(b.foe.bm.mon.sp, 143);
  assert.equal(b.arenaTurns, 0);
  b.player.bm.mon.moves = [{ id: 'growl', pp: 40, ppUp: 0 }];
  const more = [].concat(move(b), move(b));
  assert.ok(!types(more).includes('judge'), 'two turns: not yet');
  assert.ok(types(move(b)).includes('judge'), 'the third');
});
