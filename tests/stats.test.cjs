// Stat formulas, experience curves and creating Pokémon.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, plain } = require('./helpers.cjs');
const G = battleBoot();

test("stats match Bulbapedia's Garchomp example (Lv 78, Adamant)", () => {
  const base = [108, 130, 95, 80, 85, 102];
  const ivs = [24, 12, 30, 16, 23, 5], evs = [74, 190, 91, 48, 84, 23];
  assert.deepEqual(plain(G.Stats.calc(base, 78, ivs, evs, 'adamant')), [289, 278, 193, 135, 171, 171]);
});

test('stage multipliers', () => {
  assert.equal(G.Stats.stage(0), 1);
  assert.equal(G.Stats.stage(1), 1.5);
  assert.equal(G.Stats.stage(6), 4);
  assert.equal(G.Stats.stage(-1), 2 / 3);
  assert.equal(G.Stats.stage(-6), 0.25);
  assert.equal(G.Stats.accStage(1), 4 / 3);
  assert.equal(G.Stats.accStage(-6), 1 / 3);
});

test('experience: level from total EXP and back', () => {
  for (const gr of Object.keys(G.GROWTH)) {
    for (const l of [1, 2, 5, 16, 50, 99, 100]) {
      assert.equal(G.Stats.levelFor(gr, G.Stats.expAt(gr, l)), l, `${gr} ${l}`);
      if (l > 1) assert.equal(G.Stats.levelFor(gr, G.Stats.expAt(gr, l) - 1), l - 1, `${gr} ${l} - 1`);
    }
  }
});

test('a new Pokémon: deterministic with the same seed, full HP, the right moves and EXP', () => {
  const a = G.Mon.create(4, 7, { rng: G.RNG(5) }), b = G.Mon.create(4, 7, { rng: G.RNG(5) });
  assert.deepEqual(plain(a), plain(b));
  assert.equal(a.hp, G.Mon.maxHp(a));
  assert.deepEqual(plain(a.moves.map(m => m.id)), ['scratch', 'growl', 'ember']);
  assert.equal(a.exp, G.Stats.expAt('medium-slow', 7));
  assert.ok(a.ivs.every(v => v >= 0 && v <= 31));
  assert.ok(['m', 'f'].includes(a.gender));
  assert.equal(G.Mon.create(81, 10, { rng: G.RNG(1) }).gender, null);         // Magnemite: genderless
});

test('default moves are the last four, a move learned twice counts once', () => {
  // Kadabra learns Confusion at 1 and again at 16.
  const ids = G.Mon.defaultMoves(64, 20);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length <= 4);
  assert.equal(ids[ids.length - 1], G.SPECIES[64].learn.filter(([l]) => l <= 20).slice(-1)[0][1]);
  assert.deepEqual(plain(G.Mon.defaultMoves(1, 30)), ['poison-powder', 'sleep-powder', 'razor-leaf', 'sweet-scent']);
  assert.deepEqual(plain(G.Mon.defaultMoves(1, 32)), ['sleep-powder', 'razor-leaf', 'sweet-scent', 'growth']);
});

test('PP Up and learning moves', () => {
  assert.equal(G.Mon.ppMax('tackle'), 35);
  assert.equal(G.Mon.ppMax('tackle', 3), 56);
  const m = G.Mon.create(25, 5, { rng: G.RNG(2), moves: ['thunder-shock'] });
  assert.equal(G.Mon.learn(m, 'growl'), null);
  assert.equal(m.moves.length, 2);
  m.moves.push({ id: 'tail-whip', pp: 30, ppUp: 0 }, { id: 'quick-attack', pp: 30, ppUp: 0 });
  assert.equal(G.Mon.learn(m, 'thunder-wave', 1), 'growl');
  assert.equal(m.moves[1].id, 'thunder-wave');
  m.hp = 1; m.status = 'par'; m.moves[0].pp = 0;
  G.Mon.heal(m);
  assert.equal(m.hp, G.Mon.maxHp(m));
  assert.equal(m.status, null);
  assert.equal(m.moves[0].pp, 30);
});
