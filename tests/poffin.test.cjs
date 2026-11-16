// Poffins and condition (chapter 85): js/world/poffin.js, and the save's checks of the new fields (js/core/store.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/poffin.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const P = G.Poffin;

test('cooking: the berries\' flavors add up, the strongest is the level, the smoothness is their average less one a berry', () => {
  assert.deepEqual(plain(P.cook(['cheri-berry'])), { flavors: { spicy: 10, dry: 0, sweet: 0, bitter: 0, sour: 0 }, level: 10, smooth: 24 });
  const p = P.cook(['cheri-berry', 'cheri-berry', 'cheri-berry', 'pecha-berry']);
  assert.deepEqual(plain(p), { flavors: { spicy: 30, dry: 0, sweet: 10, bitter: 0, sour: 0 }, level: 30, smooth: 21 });
  assert.equal(P.cook([]), null);
  assert.equal(P.cook(['cheri-berry', 'cheri-berry', 'cheri-berry', 'cheri-berry', 'cheri-berry']), null, 'four at most');
  assert.equal(P.cook(['potion']), null, 'only berries');
  assert.equal(P.name(P.cook(['cheri-berry'])), 'Spicy Poffin');
  assert.equal(P.name(p), 'Spicy-Sweet Poffin');
  assert.equal(P.name(P.cook(['oran-berry'])), 'Rich Poffin');
});

test('feeding: each flavor raises its condition (x1.1 liked, x0.9 disliked), the sheen by the smoothness; full at 255', () => {
  const mon = G.Mon.create(G.Maps.species('pikachu'), 20, { rng: G.RNG(1) });
  mon.nature = 'adamant';                                       // likes spicy, dislikes dry
  assert.deepEqual(plain(P.read(mon)), { cool: 0, beauty: 0, cute: 0, smart: 0, tough: 0 }, 'none yet');
  const r = P.feed(mon, { flavors: { spicy: 30, dry: 20, sweet: 10, bitter: 0, sour: 0 }, level: 30, smooth: 21 });
  assert.deepEqual(plain(r.gained), { cool: 33, beauty: 18, cute: 10 });
  assert.deepEqual([P.sheen(mon), P.read(mon).cool], [21, 33]);
  mon.sheen = 250;
  assert.ok(P.canEat(mon));
  P.feed(mon, P.cook(['cheri-berry']));
  assert.equal(P.sheen(mon), 255);
  assert.ok(!P.canEat(mon) && P.feed(mon, P.cook(['cheri-berry'])) === null, 'full: eats no more');
  mon.cond.cool = 250;
  mon.sheen = 0;
  P.feed(mon, P.cook(['cheri-berry', 'cheri-berry', 'cheri-berry', 'cheri-berry']));
  assert.equal(P.read(mon).cool, 255, 'at most 255');
});

test('the Poffin Case holds 100; the save keeps the Poffins, the condition, the sheen and the ribbons within bounds', () => {
  for (let i = 0; i < 100; i++) assert.ok(P.add(P.cook(['cheri-berry'])));
  assert.equal(P.add(P.cook(['cheri-berry'])), false);
  assert.equal(P.take(0).level, 10);
  assert.equal(P.list().length, 99);
  const s = G.Store.newSave({ name: 'Dawn', id: 1 });
  const mon = G.Mon.create(G.Maps.species('pikachu'), 20, { rng: G.RNG(2) });
  mon.cond = { cool: 300, beauty: -5, cute: 'x', smart: 12.7 };
  mon.sheen = 999;
  mon.ribbons = ['cool-normal', 'cool-normal', 42, 'bad ribbon', 'cute-master'];
  s.party = [mon];
  s.poffins = [{ flavors: { spicy: 40, dry: 999 }, level: 40, smooth: 0 }, 'junk', { level: 3 }];
  const out = G.Store.sanitize(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(plain(out.party[0].cond), { cool: 255, beauty: 0, cute: 0, smart: 12, tough: 0 });
  assert.equal(out.party[0].sheen, 255);
  assert.deepEqual(plain(out.party[0].ribbons), ['cool-normal', 'cute-master']);
  assert.deepEqual(plain(out.poffins), [{ flavors: { spicy: 40, dry: 255, sweet: 0, bitter: 0, sour: 0 }, level: 40, smooth: 1 }]);
  const old = G.Store.newSave({ name: 'Dawn', id: 1 });
  delete old.poffins;
  old.party = [G.Mon.create(G.Maps.species('pikachu'), 5, { rng: G.RNG(3) })];
  const o2 = G.Store.sanitize(JSON.parse(JSON.stringify(old)));
  assert.deepEqual(plain(o2.poffins), []);
  assert.ok(!('cond' in o2.party[0]) && !('ribbons' in o2.party[0]), 'an old save: nothing added');
  assert.deepEqual(plain(P.read(o2.party[0])), { cool: 0, beauty: 0, cute: 0, smart: 0, tough: 0 });
});
