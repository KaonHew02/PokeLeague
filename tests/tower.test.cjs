// The Battle Tower (chapter 43): js/world/tower.js (G.Tower) and the battle rules noExp and noBag.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, duel, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/field.js', 'js/world/tower.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'May' }));
const T = G.Tower;
const mon = (sp, lvl, o) => G.Mon.create(sp, lvl, Object.assign({ rng: G.RNG(5), nature: 'hardy' }, o));

test('a copy for the tower: level 50 at most, everything restored, the party untouched', () => {
  const m = mon(260, 72, { moves: ['surf', 'earthquake'] });
  m.hp = 3; m.status = 'par'; m.moves[0].pp = 1; m.item = 'leftovers';
  const c = T.copy(m);
  assert.equal(c.lvl, 50);
  assert.equal(c.hp, G.Mon.maxHp(c));
  assert.ok(G.Mon.maxHp(c) < G.Mon.maxHp(m));
  assert.equal(c.status, null);
  assert.equal(c.moves[0].pp, G.Mon.ppMax('surf', 0));
  assert.equal(c.item, 'leftovers');
  assert.notEqual(c.uid, m.uid);
  assert.deepEqual([m.lvl, m.hp, m.status, m.moves[0].pp], [72, 3, 'par', 1], 'the party is untouched');
  assert.equal(T.copy(mon(25, 30)).lvl, 30, 'a lower level stays');
});

test('who can join: no banned legend, one of each species, no two holding the same item', () => {
  const a = Object.assign(mon(260, 50), { item: 'leftovers' });
  assert.equal(T.why(mon(150, 70), []), 'banned');
  assert.equal(T.why(mon(384, 70), []), 'banned');
  assert.equal(T.why(mon(260, 40), [a]), 'species');
  assert.equal(T.why(Object.assign(mon(282, 50), { item: 'leftovers' }), [a]), 'item');
  assert.equal(T.why(mon(282, 50), [a]), null);
  assert.equal(T.why(mon(243, 50), []), null, 'Raikou may join');
});

test('movesets: four different moves the species can learn; the strongest attacks of its types come first', () => {
  for (const sp of [248, 373, 376, 282, 260, 142, 6]) {
    const ms = T.moveset(sp, G.RNG(sp));
    assert.equal(ms.length, 4, G.SPECIES[sp].slug);
    assert.equal(new Set(ms).size, 4);
    const can = new Set(T.learnable(sp));
    for (const id of ms) assert.ok(can.has(id), G.SPECIES[sp].slug + ' ' + id);
    assert.ok(ms.some(id => G.SPECIES[sp].types.includes(G.MOVES[id].type) && G.MOVES[id].pow), G.SPECIES[sp].slug + ' attacks with its own type: ' + ms);
    assert.ok(!ms.some(id => ['hyper-beam', 'solar-beam', 'explosion', 'fly', 'dig'].includes(id)));
  }
});

test('teams: different species and items from the round\'s pool, stronger each round; the same seed, the same team', () => {
  const sum = sp => G.SPECIES[sp].base.reduce((a, b) => a + b, 0);
  for (let round = 0; round < 5; round++) {
    const p = T.pool(round);
    assert.ok(p.length >= 12, 'pool ' + round + ': ' + p.length);
    assert.ok(p.every(sp => !G.SPECIES[sp].leg && !(G.SPECIES[sp].evo || []).length && !T.BANNED.includes(sp)));
    const t = T.team(G.RNG(round + 1), round, 4);
    assert.equal(t.length, 4);
    assert.equal(new Set(t.map(x => x[0])).size, 4);
    assert.equal(new Set(t.map(x => x[3])).size, 4, 'item clause');
    assert.ok(t.every(([sp, lvl, moves, item]) => p.includes(sp) && lvl === 50 && moves.length === 4 && G.ITEMS[item]));
  }
  const avg = round => { const p = T.pool(round); return p.reduce((a, sp) => a + sum(sp), 0) / p.length; };
  assert.ok(avg(0) < avg(1) && avg(1) < avg(2) && avg(2) < avg(3));
  assert.deepEqual(plain(T.team(G.RNG(9), 2, 3)), plain(T.team(G.RNG(9), 2, 3)));
});

test('Battle Points for each set of seven; streaks and records are kept in vars', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 10].map(T.bpFor), [3, 3, 4, 4, 5, 5, 7, 7]);
  T.setStreak('single', 7);
  T.setStreak('single', 0);
  assert.deepEqual([T.streak('single'), T.best('single'), T.streak('double')], [0, 7, 0]);
  T.addBp(5); T.addBp(-2);
  assert.equal(T.bp(), 3);
  assert.equal(G.Field.getVar('bp'), 3);
});

test('battle rules: noExp gives no Exp. Points; noBag refuses items and balls', () => {
  let { b, party } = duel(G, { me: ['charizard', 50, ['flamethrower']], foe: ['bulbasaur', 10, ['growl']], kind: 'trainer', rules: { noExp: true } });
  const exp = party[0].exp;
  const ev = b.act({ type: 'move', slot: 0 });
  assert.equal(b.result.outcome, 'win');
  assert.ok(!ev.some(e => e.type === 'exp'));
  assert.equal(party[0].exp, exp);
  ({ b } = duel(G, { me: ['charizard', 50, ['flamethrower']], foe: ['bulbasaur', 10, ['growl']], kind: 'trainer', bag: { potion: 3 }, rules: { noBag: true } }));
  assert.equal(b.act({ type: 'item', item: 'potion' })[0].reason, 'no-bag');
  ({ b } = duel(G, { me: ['charizard', 50, ['flamethrower']], foe: ['bulbasaur', 10, ['growl']], bag: { 'poke-ball': 3 }, rules: { noBag: true } }));
  assert.equal(b.act({ type: 'ball', item: 'poke-ball' })[0].reason, 'no-bag');
});
