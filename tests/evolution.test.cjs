// Evolution: who can evolve, into what, and what changes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel, plain } = require('./helpers.cjs');
const G = battleBoot();
const mk = (sp, lvl) => G.Mon.create(sp, lvl, { rng: G.RNG(sp * 100 + lvl) });

test('level evolutions: Caterpie at 7, Metapod at 10, not before', () => {
  assert.deepEqual(plain(G.Evolution.candidates(mk(10, 6), { trigger: 'level' })), []);
  assert.deepEqual(plain(G.Evolution.candidates(mk(10, 7), { trigger: 'level' })), [11]);
  assert.deepEqual(plain(G.Evolution.candidates(mk(11, 10), { trigger: 'level' })), [12]);
  assert.deepEqual(plain(G.Evolution.candidates(mk(4, 15), { trigger: 'level' })), []);
  assert.deepEqual(plain(G.Evolution.candidates(mk(4, 16), { trigger: 'level' })), [5]);
});

test('trade evolutions became level evolutions', () => {
  assert.deepEqual(plain(G.Evolution.candidates(mk(64, 36), { trigger: 'level' })), [65]);
  assert.deepEqual(plain(G.Evolution.candidates(mk(67, 37), { trigger: 'level' })), [68]);
  assert.deepEqual(plain(G.Evolution.candidates(mk(67, 36), { trigger: 'level' })), []);
});

test('stones: Pikachu + Thunder Stone, Eevee by the stone it gets; no level evolution for them', () => {
  assert.deepEqual(plain(G.Evolution.candidates(mk(25, 40), { trigger: 'item', item: 'thunder-stone' })), [26]);
  assert.deepEqual(plain(G.Evolution.candidates(mk(25, 40), { trigger: 'level' })), []);
  assert.deepEqual(plain(G.Evolution.candidates(mk(133, 20), { trigger: 'item', item: 'fire-stone' })), [136]);
  assert.deepEqual(plain(G.Evolution.candidates(mk(133, 20), { trigger: 'item', item: 'moon-stone' })), []);
});

test('evolving changes the species, keeps damage taken, and lists the new moves at this level', () => {
  const m = mk(10, 7);
  m.hp -= 3;
  const lost = G.Mon.maxHp(m) - m.hp;
  const moves = G.Evolution.evolve(m, 11);
  assert.equal(m.sp, 11);
  assert.equal(G.Mon.maxHp(m) - m.hp, lost);
  assert.deepEqual(plain(moves), ['harden']);         // Metapod learns Harden at 7, as it evolves
  const c = mk(4, 16);
  G.Evolution.evolve(c, 5);
  assert.equal(c.sp, 5);
  // Not calling evolve() is cancelling: nothing changes.
  const k = mk(10, 7);
  G.Evolution.candidates(k, { trigger: 'level' });
  assert.equal(k.sp, 10);
});

test('the battle result says who can evolve after levelling up', () => {
  const gr = G.SPECIES[10].gr;
  const { b, party } = duel(G, { me: ['caterpie', 6, ['tackle'], { exp: G.Stats.expAt(gr, 7) - 1 }],
                                 foe: ['weedle', 5, ['splash'], { hp: 1 }], seed: 3 });
  b.act({ type: 'move', slot: 0 });
  assert.equal(b.result.outcome, 'win');
  assert.deepEqual(plain(b.result.evolve), [party[0].uid]);
});
