// The Battle Palace's rule (chapter 80): rules.palace in js/battle/battle.js. Pokémon choose their own moves by their
// nature (attack, defense or support, other odds below half HP); the player may only switch.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, duel, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE)).G;
const palace = o => duel(G, Object.assign({ kind: 'trainer', rules: { palace: true } }, o));
const types = evs => evs.map(e => e.type);

test('the table: every nature, odds that fit in 100 above and below half HP; the groups of moves', () => {
  const P = G.Battle.PALACE;
  assert.deepEqual(Object.keys(P).sort(), Object.keys(G.NATURES).sort());
  for (const [n, [a, d, la, ld]] of Object.entries(P)) assert.ok(a + d <= 100 && la + ld <= 100 && Math.min(a, d, la, ld) >= 0, n);
  assert.deepEqual(plain(P.adamant), [38, 31, 70, 15]);
  assert.deepEqual(plain(P.timid), [62, 10, 30, 20]);
  const g = G.Battle.palaceGroup;
  for (const id of ['swords-dance', 'protect', 'reflect', 'calm-mind', 'rest']) assert.equal(g(id), 'defense', id);
  for (const id of ['toxic', 'growl', 'spikes', 'confuse-ray', 'counter', 'mirror-coat']) assert.equal(g(id), 'support', id);
  for (const id of ['surf', 'tackle', 'horn-drill', 'hyper-beam']) assert.equal(g(id), 'attack', id);
});

test('the move is the Pokémon\'s own: the odds of its nature, other odds below half HP; the same seed, the same battle', () => {
  const { b } = palace({ me: ['snorlax', 50, ['tackle', 'swords-dance', 'growl'], { nature: 'adamant' }], foe: ['snorlax', 50, ['splash']] });
  const bm = b.player.bm;
  const count = n => {
    const c = { attack: 0, defense: 0, support: 0 };
    for (let i = 0; i < n; i++) c[G.Battle.palaceGroup(bm.mon.moves[b.palaceAction(bm).slot].id)]++;
    return c;
  };
  let c = count(3000);
  assert.ok(Math.abs(c.attack / 3000 - 0.38) < 0.04 && Math.abs(c.defense / 3000 - 0.31) < 0.04 && Math.abs(c.support / 3000 - 0.31) < 0.04, JSON.stringify(c));
  bm.mon.hp = Math.floor(b.maxHp(bm) * 0.4);
  c = count(3000);
  assert.ok(Math.abs(c.attack / 3000 - 0.70) < 0.04 && Math.abs(c.defense / 3000 - 0.15) < 0.04, 'below half: ' + JSON.stringify(c));
  // Whatever slot the player names, the Pokémon decides; two battles from the same seed are the same.
  const run = () => {
    const d = palace({ me: ['snorlax', 50, ['tackle', 'swords-dance', 'growl'], { nature: 'adamant' }], foe: ['snorlax', 50, ['tackle', 'growl'], { nature: 'lax' }], seed: 7 });
    const ev = [];
    for (let i = 0; i < 6 && !d.b.result; i++) ev.push(...d.b.act({ type: 'move', slot: 2 }));
    return ev.filter(e => e.type === 'move').map(e => e.side + ':' + e.move);
  };
  const one = run();
  assert.deepEqual(run(), one);
  assert.ok(one.some(x => x.startsWith('0:') && x !== '0:growl'), 'not always the slot asked for: ' + one);
  assert.ok(new Set(one.filter(x => x.startsWith('1:'))).size > 1, 'the foe chooses by its nature too: ' + one);
});

test('no move of the group drawn: half the time it hesitates (a line, no move, no PP), else a random move; with nothing usable, Struggle', () => {
  const { b } = palace({ me: ['snorlax', 50, ['tackle'], { nature: 'bashful' }], foe: ['snorlax', 50, ['splash']] });
  const bm = b.player.bm;
  let hes = 0;
  for (let i = 0; i < 3000; i++) if (b.palaceAction(bm).hesitate) hes++;
  assert.ok(Math.abs(hes / 3000 - 0.35) < 0.04, 'Bashful with only an attack: 70% no group, half of that hesitates: ' + hes);
  // In a real turn: the line, and no PP spent.
  let ev = [];
  const mine = e => e.type === 'cantMove' && e.why === 'palace' && e.side === 0;
  for (let i = 0; i < 12 && !ev.some(mine); i++) ev = b.act({ type: 'move', slot: 0 });
  const line = ev.find(mine);
  assert.ok(line, 'it hesitated once in twelve turns');
  assert.equal(G.BattleText.line(line, b), 'Snorlax hesitated and did nothing!');
  assert.ok(!ev.some(e => e.type === 'move' && e.side === 0), 'no move that turn');
  bm.mon.moves[0].pp = 0;
  assert.deepEqual(plain(b.palaceAction(bm)), { type: 'move', id: 'struggle' });
});

test('switching is the player\'s one choice: it works, no Shift question; without the rule the slot asked for is used', () => {
  const { b } = palace({ me: ['snorlax', 50, ['tackle']], mine: [['pikachu', 50, ['thunderbolt']]], foe: ['geodude', 50, ['tackle']] });
  assert.ok(b.palace && !b.rules.shift);
  assert.equal(b.options().canSwitch, true);
  const ev = b.act({ type: 'switch', to: 1 });
  assert.ok(types(ev).includes('withdraw') && b.player.bm.mon.sp === 25);
  // Without the rule nothing changes: the move asked for is the one used.
  const n = duel(G, { kind: 'trainer', me: ['snorlax', 50, ['tackle', 'growl']], foe: ['snorlax', 50, ['splash']] }).b;
  assert.ok(!n.palace);
  for (let i = 0; i < 4; i++) assert.equal(n.act({ type: 'move', slot: 1 }).find(e => e.type === 'move' && e.side === 0).move, 'growl');
});
