// Roaming Pokémon (chapter 42): rules.roamer in js/battle/battle.js and ai.js (Latias and Latios flee).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel, plain } = require('./helpers.cjs');
const G = battleBoot();

const LATIAS = ['latias', 40, ['dragon-breath', 'psychic', 'recover', 'charm']];
/** A wild battle against a roaming Latias (or `foe`). */
const roam = (me, o = {}) => duel(G, Object.assign({ me, foe: LATIAS, rules: { roamer: true }, seed: 5 }, o));
const types = ev => ev.map(e => e.type);

test('a roaming Pokémon flees on its turn, after a faster foe: the battle ends and the damage stays on it', () => {
  const { b, foes } = roam(['ninjask', 40, ['scratch']]);
  const ev = b.act({ type: 'move', slot: 0 });
  const t = types(ev);
  assert.ok(t.includes('roamFled'));
  assert.ok(t.indexOf('damage') < t.indexOf('roamFled'), 'Ninjask is faster: it hit first');
  assert.equal(b.result.outcome, 'fled');
  assert.equal(b.prompt, null);
  assert.ok(foes[0].hp < G.Mon.maxHp(foes[0]), 'its HP stays as the battle left it');
});

test('a slower Pokémon does not get to move; a ball goes first', () => {
  let { b, foes } = roam(['slakoth', 40, ['scratch']]);
  let t = types(b.act({ type: 'move', slot: 0 }));
  assert.ok(t.includes('roamFled') && !t.includes('damage'));
  assert.equal(foes[0].hp, G.Mon.maxHp(foes[0]));
  ({ b } = roam(['slakoth', 40, ['scratch']], { bag: { 'poke-ball': 5 } }));
  t = types(b.act({ type: 'ball', item: 'poke-ball' }));
  assert.ok(t.indexOf('ball') >= 0 && (b.result.outcome === 'caught' || t.indexOf('ball') < t.indexOf('roamFled')));
});

test('held, it cannot flee: Mean Look, Shadow Tag; Arena Trap does not hold a Pokémon with Levitate', () => {
  // Crobat is faster: Mean Look first, then Latias tries to flee and cannot.
  let { b } = roam(['crobat', 40, ['mean-look', 'wing-attack']]);
  let t = types(b.act({ type: 'move', slot: 0 }));
  assert.ok(t.includes('roamHeld') && !t.includes('roamFled'));
  assert.equal(b.result, null);
  // From then on it fights.
  t = types(b.act({ type: 'move', slot: 1 }));
  assert.ok(!t.includes('roamFled') && !t.includes('roamHeld'));
  assert.equal(b.result, null);
  // Shadow Tag: it never even tries.
  ({ b } = roam(['wobbuffet', 40, ['counter']]));
  t = types(b.act({ type: 'move', slot: 0 }));
  assert.ok(!t.includes('roamFled') && !t.includes('roamHeld'));
  assert.equal(b.result, null);
  // Arena Trap (Dugtrio): Latias floats out of it.
  ({ b } = roam(['dugtrio', 40, ['scratch']]));
  b.player.bm.ability = 'arena-trap';
  t = types(b.act({ type: 'move', slot: 0 }));
  assert.ok(t.includes('roamFled'));
});

test('asleep or flinching, it cannot flee that turn', () => {
  let { b } = roam(['slakoth', 40, ['scratch']], { foe: ['latias', 40, LATIAS[2], { status: 'slp', slp: 3 }] });
  let t = types(b.act({ type: 'move', slot: 0 }));
  assert.ok(!t.includes('roamFled') && t.includes('cantMove'));
  assert.equal(b.result, null);
  // Fake Out first: it flinches.
  ({ b } = roam(['jolteon', 40, ['fake-out']]));
  t = types(b.act({ type: 'move', slot: 0 }));
  assert.ok(!t.includes('roamFled'));
  assert.equal(b.result, null);
});

test('without rules.roamer, a wild Latias fights; the same seed gives the same battle', () => {
  const { b } = duel(G, { me: ['slakoth', 40, ['scratch']], foe: LATIAS, seed: 5 });
  assert.ok(!types(b.act({ type: 'move', slot: 0 })).includes('roamFled'));
  assert.equal(b.result, null);
  const run = () => { const { b } = roam(['ninjask', 40, ['scratch']]); return plain(b.act({ type: 'move', slot: 0 })); };
  assert.deepEqual(run(), run());
});
