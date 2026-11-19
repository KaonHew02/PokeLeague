// Sinnoh's Battle Hall (chapter 90): G.Hall in js/content/sinnoh/shall.js. The opponents' level, the opponents by type and rank,
// the ranks (up, closed at 10, all open again), the streak's species, the Battle Points.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/tower.js', 'js/script/script.js',
  'js/content/sinnoh/shall.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const H = G.Hall;

test('the opponents\' level: L - 3 sqrt(L) + others / 2 + (rank - 1) sqrt(L) / 5, rounded up, never above L', () => {
  assert.equal(H.level(100, 1, 0), 70);                    // 100 - 30
  assert.equal(H.level(100, 10, 0), 88);                   // 70 + 9 x 2
  assert.equal(H.level(100, 10, 17), 97);                  // + 8.5
  assert.equal(H.level(30, 1, 0), 14);                     // 30 - 16.43 = 13.57, up
  assert.equal(H.level(50, 10, 17), 50, 'capped at your level');
  for (let lv = 30; lv <= 100; lv += 7) for (let r = 1; r <= 10; r++) assert.ok(H.level(lv, r, 0) <= H.level(lv, Math.min(10, r + 1), 0));
});

test('who may enter; the opponents: one Pokémon of the type, stronger with the rank, never a legend', () => {
  const mon = (sp, lvl) => G.Mon.create(sp, lvl, { rng: G.RNG(1) });
  assert.equal(H.can(mon(445, 29)), 'level');
  assert.equal(H.can(mon(483, 70)), 'banned', 'Dialga');
  assert.equal(H.can(mon(445, 30)), null);
  const total = sp => G.SPECIES[sp].base.reduce((a, b) => a + b, 0);
  for (const type of H.TYPES()) {
    const list = H.speciesOf(type);
    assert.ok(list.length >= 10 && list.every(sp => G.SPECIES[sp].types.includes(type) && !G.SPECIES[sp].leg), type);
    const avg = rank => { let s = 0; for (let k = 0; k < 20; k++) s += total(G.Maps.species(H.opponent(type, rank, 50, G.RNG(k * 13 + rank))[0])); return s / 20; };
    assert.ok(avg(10) > avg(1), type + ': rank 10 is stronger than rank 1');
    const [sp, lvl, moves, item] = H.opponent(type, 5, 44, G.RNG(7));
    assert.ok(G.SPECIES[G.Maps.species(sp)].types.includes(type) && lvl === 44 && moves.length >= 1 && G.ITEMS[item], type);
  }
  assert.equal(H.TYPES().length, 18, 'this game\'s 18 types, Fairy too');
  const b = H.brainMon(true, 63, G.RNG(3));
  assert.ok(b[1] === 63 && total(G.Maps.species(b[0])) >= 520 && !G.SPECIES[G.Maps.species(b[0])].leg, 'Argenta\'s gold: one of the strongest, at your level');
});

test('the ranks: up one a win, closed after a win at 10, all open again when every type is closed; a loss starts over', () => {
  H.reset(445);
  let st = H.state();
  assert.deepEqual([st.streak, st.sp, st.ranks.fire, st.closed.length], [0, 445, 1, 0]);
  H.win('fire'); H.win('fire');
  st = H.state();
  assert.deepEqual([st.streak, st.ranks.fire, H.others(st, 'water'), H.others(st, 'fire')], [2, 3, 1, 0]);
  for (let k = 0; k < 8; k++) H.win('fire');
  st = H.state();
  assert.deepEqual([st.ranks.fire, st.closed.length], [10, 1], 'closed after the win at rank 10');
  assert.ok(st.closed.includes('fire'));
  for (const t of H.TYPES()) if (t !== 'fire') for (let k = 0; k < 10; k++) H.win(t);
  st = H.state();
  assert.deepEqual([st.streak, st.closed.length, st.ranks.fire, st.ranks.dragon], [180, 0, 1, 1], 'a full turn: everything open again');
  H.reset(445);
  assert.deepEqual([H.state().streak, H.state().ranks.fire], [0, 1]);
});

test('Battle Points by the round', () => {
  assert.deepEqual([10, 30, 40, 60, 70, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 300].map(H.bpFor), [1, 1, 2, 2, 3, 3, 4, 4, 6, 6, 8, 8, 10, 10, 12, 12]);
  assert.deepEqual(plain(Object.keys(H.BRAIN).map(Number)), [50, 170]);
  assert.equal(H.BRAIN_BP, 20);
});
