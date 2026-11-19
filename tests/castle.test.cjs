// Sinnoh's Battle Castle (chapter 91): G.Castle in js/content/sinnoh/scastle.js. Castle Points earned by a win, the prices and the
// ranks, a new streak and a loss, Darach's teams.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/tower.js', 'js/script/script.js',
  'js/content/sinnoh/scastle.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const C = G.Castle;
const mon = (sp, lvl) => G.Mon.create(sp, lvl, { rng: G.RNG(sp), nature: 'hardy' });

test('Castle Points for a win: standing, HP, no status, few PP used, opponents at 55', () => {
  const a = mon(445, 50), b = mon(448, 50), c = mon(468, 50);
  // All three standing at full HP without a status, 4 PP used: 3 x (3 + 3 + 1) + 8.
  assert.equal(C.earn([a, b, c], 4), 29);
  b.hp = Math.floor(G.Mon.maxHp(b) * 0.6);                  // above half: 2
  c.hp = 1; c.status = 'par';                                 // below half: 1, a status: nothing
  assert.equal(C.earn([a, b, c], 4), 7 + 6 + 4 + 8);
  a.hp = 0;                                                   // fainted: nothing at all
  assert.equal(C.earn([a, b, c], 4), 6 + 4 + 8);
  assert.deepEqual([6, 10, 11, 15, 16].map(pp => C.earn([], pp)), [6, 6, 4, 4, 0]);
  assert.equal(C.earn([], 20, 3), 21, 'three opponents raised to 55: 7 each');
});

test('the state: 10 CP and rank 1 at a new streak; spending; the ranks and their costs; a loss starts over', () => {
  C.start();
  assert.deepEqual(plain(C.state()), { cp: 10, info: 1, rec: 1, item: 1 });
  assert.ok(C.spend(4) && !C.spend(7), 'not enough: nothing paid');
  assert.equal(C.state().cp, 6);
  assert.equal(C.rankUp('info'), false);
  C.addCp(494);
  assert.ok(C.rankUp('info') && C.state().cp === 450 && C.nextCost('info') === null, 'Info: rank 2 for 50, the top');
  assert.ok(C.rankUp('rec') && C.rankUp('rec') && C.state().cp === 250 && C.rank('rec') === 3);
  assert.ok(C.rankUp('item') && C.rankUp('item') && C.state().cp === 0 && C.rank('item') === 3, 'Items: 100 then 150');
  assert.equal(C.rankUp('item'), false);
  C.lose();
  assert.deepEqual(plain(C.state()), { cp: 10, info: 1, rec: 1, item: 1 });
  assert.deepEqual(plain(C.PRICES), { identify: 1, summary: 2, moves: 5, up: 1, down: 15, hp: 10, pp: 8, full: 12, pass: 50 });
});

test('the rentals by rank are items the game has; Darach\'s two teams for each print', () => {
  assert.deepEqual([C.items(1).length, C.items(2).length, C.items(3).length], [7, 13, 18]);
  for (const [id, cp] of C.items(3)) assert.ok(G.ITEMS[id] && G.ITEM_FX[id] && cp >= 2 && cp <= 20, id);
  for (const n of [21, 49]) {
    for (const k of [0, 1]) {
      const team = C.darach(n, k);
      assert.equal(team.length, 3);
      for (const [sp, lvl, moves, item] of team) {
        assert.ok(G.Maps.species(sp) && lvl === 50 && moves.length === 4 && moves.every(m => G.MOVES[m]) && G.ITEMS[item], sp);
      }
    }
  }
  assert.deepEqual(plain(C.darach(21, 0).map(r => r[0])), ['staraptor', 'empoleon', 'houndoom']);
  assert.deepEqual(plain(C.darach(49, 1).map(r => r[0])), ['entei', 'empoleon', 'gallade']);
});
