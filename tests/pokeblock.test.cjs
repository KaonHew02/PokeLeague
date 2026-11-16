// Pokéblocks (chapter 86): js/world/pokeblock.js (Generation 3's Berry Blender rule, feeding, the case), the save's checks
// (js/core/store.js), and Feebas evolving by its Beauty (js/battle/evolution.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/poffin.js', 'js/world/pokeblock.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'May', id: 4321 }));
const B = G.Pokeblock;
const fl = (spicy, dry, sweet, bitter, sour) => ({ spicy, dry, sweet, bitter, sour });

test('blending: each flavor less the next, less the flavors below 0, x1.30; the level, the feel, the color', () => {
  // A Cheri Berry: spicy 10. Spicy 10 - 0, sour 0 - 10 (one below 0): spicy (10 - 1) x 1.3 = 11.7 -> 12; feel 25 / 1 - 1.
  assert.deepEqual(plain(B.blend(['cheri-berry'])), { flavors: fl(12, 0, 0, 0, 0), level: 12, feel: 24, color: 'red' });
  // Chesto (dry 10) and Oran (spicy, dry, bitter, sour 10): spicy -10, dry 20, sweet -10, bitter 0, sour 0; two below 0:
  // dry 18 x 1.3 = 23.4 -> 23; feel (25 + 20) / 2 - 2 = 20.5 -> 20.
  assert.deepEqual(plain(B.blend(['chesto-berry', 'oran-berry'])), { flavors: fl(0, 23, 0, 0, 0), level: 23, feel: 20, color: 'blue' });
  // Four berries: dry and bitter left, dry the stronger: Indigo; feel (25 + 20 + 20 + 20) / 4 - 4 = 17.25 -> 17.
  assert.deepEqual(plain(B.blend(['chesto-berry', 'oran-berry', 'lum-berry', 'sitrus-berry'])), { flavors: fl(0, 23, 0, 10, 0), level: 23, feel: 17, color: 'indigo' });
  assert.equal(B.blend(['chesto-berry', 'rawst-berry']).color, 'indigo', 'two flavors equal: the first round the circle');
  assert.equal(B.blend(['liechi-berry', 'salac-berry']).color, 'gold', 'level 51 or more');
  assert.equal(B.blend(['liechi-berry', 'salac-berry']).level, 62);
  assert.equal(B.color(fl(5, 5, 5, 0, 0)), 'gray');
  assert.equal(B.color(fl(5, 5, 5, 5, 0)), 'white');
  assert.equal(B.color(fl(0, 0, 4, 0, 9)), 'olive');
  assert.equal(B.color(fl(0, 0, 0, 0, 0)), 'black');
  assert.equal(B.blend([]), null);
  assert.equal(B.blend(['cheri-berry', 'chesto-berry', 'pecha-berry', 'rawst-berry', 'aspear-berry']), null, 'four at most');
  assert.equal(B.blend(['potion']), null, 'only berries');
  assert.equal(B.name(B.blend(['chesto-berry', 'oran-berry'])), 'Blue Pokéblock');
  assert.equal(B.name({ color: 'lightblue' }), 'Light Blue Pokéblock');
});

test('a Black Pokéblock: two berries of one kind, or more than three flavors below 0; three random flavors at 2', () => {
  const p = B.blend(['cheri-berry', 'cheri-berry'], { rng: G.RNG(9) });
  assert.equal(p.color, 'black');
  assert.deepEqual(Object.values(p.flavors).sort(), [0, 0, 2, 2, 2]);
  assert.equal(p.level, 2);
  assert.deepEqual(plain(B.blend(['cheri-berry', 'cheri-berry'], { rng: G.RNG(9) })), plain(p), 'the same for the same seed');
  G.BERRY_FLAVORS['test-berry2'] = { spicy: 0, dry: 0, sweet: 0, bitter: 0, sour: 0, smooth: 20 };
  assert.equal(B.blend(['test-berry2']).color, 'black', 'no flavor at all');
  G.BERRY_FLAVORS['test-berry3'] = { spicy: 10, dry: 30, sweet: 50, bitter: 70, sour: 0, smooth: 20 };   // -20, -20, -20, 70, -10
  assert.equal(B.blend(['test-berry3']).color, 'black', 'four flavors below 0');
  delete G.BERRY_FLAVORS['test-berry2']; delete G.BERRY_FLAVORS['test-berry3'];
});

test('feeding: each flavor its condition, x1.1 liked and x0.9 disliked, only the stronger of the two when both; the sheen by the feel', () => {
  const mon = G.Mon.create(G.Maps.species('feebas'), 20, { rng: G.RNG(1) });
  mon.nature = 'modest';                                           // likes dry, dislikes spicy
  assert.deepEqual(plain(B.feed(mon, { flavors: fl(0, 23, 0, 0, 0), level: 23, feel: 20, color: 'blue' }).gained), { beauty: 25 });
  assert.equal(B.sheen(mon), 20);
  mon.cond = {}; mon.sheen = 0;
  assert.deepEqual(plain(B.feed(mon, { flavors: fl(20, 0, 10, 0, 0), level: 20, feel: 5, color: 'purple' }).gained), { cool: 18, cute: 10 }, 'disliked only');
  mon.cond = {};
  assert.deepEqual(plain(B.feed(mon, { flavors: fl(10, 20, 0, 0, 0), level: 20, feel: 5, color: 'indigo' }).gained), { cool: 10, beauty: 22 }, 'liked stronger: x1.1, the other x1');
  mon.cond = {};
  assert.deepEqual(plain(B.feed(mon, { flavors: fl(20, 10, 0, 0, 0), level: 20, feel: 5, color: 'purple' }).gained), { cool: 18, beauty: 10 }, 'disliked stronger: x0.9, the other x1');
  mon.cond = {};
  assert.deepEqual(plain(B.feed(mon, { flavors: fl(10, 10, 0, 0, 0), level: 10, feel: 5, color: 'purple' }).gained), { cool: 10, beauty: 10 }, 'equal: neither');
  mon.sheen = 250;
  assert.ok(B.canEat(mon));
  B.feed(mon, B.blend(['cheri-berry']));
  assert.equal(B.sheen(mon), 255);
  assert.ok(!B.canEat(mon) && B.feed(mon, B.blend(['cheri-berry'])) === null, 'full: eats no more');
});

test('the Pokéblock Case holds 40; the save keeps them within bounds, an old save has none', () => {
  for (let i = 0; i < 40; i++) assert.ok(B.add(B.blend(['cheri-berry'])));
  assert.equal(B.add(B.blend(['cheri-berry'])), false);
  assert.equal(B.take(0).color, 'red');
  assert.equal(B.list().length, 39);
  const s = G.Store.newSave({ name: 'May', id: 1 });
  s.pokeblocks = [{ flavors: { spicy: 40, dry: 999 }, level: 40, feel: -3, color: 'red' }, { flavors: {}, color: 'plaid' }, 'junk'];
  s.paintings = { cool: { sp: 25, nick: 'Sparky', ot: 'May' }, beauty: { sp: 99999 }, nope: { sp: 25 }, cute: 'x' };
  const out = G.Store.sanitize(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(plain(out.pokeblocks), [{ flavors: fl(40, 255, 0, 0, 0), level: 40, feel: 0, color: 'red' }]);
  assert.deepEqual(plain(out.paintings), { cool: { sp: 25, nick: 'Sparky', ot: 'May' } });
  const old = G.Store.newSave({ name: 'May', id: 1 });
  delete old.pokeblocks; delete old.paintings;
  const o2 = G.Store.sanitize(JSON.parse(JSON.stringify(old)));
  assert.deepEqual([plain(o2.pokeblocks), plain(o2.paintings)], [[], {}]);
});

test('Feebas evolves on a level-up with Beauty 170 or more, at any level (Generations 3 and 4)', () => {
  const E = G.Evolution, f = G.Mon.create(G.Maps.species('feebas'), 12, { rng: G.RNG(2) });
  assert.deepEqual(plain(E.candidates(f, { trigger: 'level' })), [], 'no Beauty');
  f.lvl = 60;
  assert.deepEqual(plain(E.candidates(f, { trigger: 'level' })), [], 'its level alone does nothing');
  f.cond = { cool: 0, beauty: 169, cute: 0, smart: 0, tough: 0 };
  assert.deepEqual(plain(E.candidates(f, { trigger: 'level' })), []);
  f.cond.beauty = 170;
  f.lvl = 12;
  assert.deepEqual(plain(E.candidates(f, { trigger: 'level' })), [G.Maps.species('milotic')]);
  f.item = 'everstone';
  assert.deepEqual(plain(E.candidates(f, { trigger: 'level' })), [], 'an Everstone stops it');
  // Eight blue Pokéblocks of a Chesto and an Oran Berry are enough, with room to spare.
  const g = G.Mon.create(G.Maps.species('feebas'), 20, { rng: G.RNG(3) });
  g.nature = 'hardy';
  for (let i = 0; i < 8; i++) B.feed(g, B.blend(['chesto-berry', 'oran-berry']));
  assert.ok(B.read(g).beauty >= 170 && B.sheen(g) === 160, JSON.stringify([B.read(g), B.sheen(g)]));
});
