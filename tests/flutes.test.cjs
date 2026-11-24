// Emerald's glass flutes (chapter 107; pret/pokeemerald src/party_menu.c ItemUseCB_Medicine and IsItemFlute,
// src/data/pokemon/item_effects.h, src/item_use.c ItemUseOutOfBattle_BlackWhiteFlute): the data, the Blue, Yellow and Red
// Flutes in battle (never used up), the Blue Flute outside battle, the White and Black Flutes from the Bag.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/field-items.js', 'js/script/script.js'])).G;
const FLUTES = ['blue-flute', 'yellow-flute', 'red-flute', 'white-flute', 'black-flute'];

test('the data: the five flutes and the Soot Sack, with their names; Emerald\'s prices (sold for half); never used up', () => {
  for (const id of FLUTES.concat(['soot-sack'])) {
    assert.ok(G.ITEMS[id] && G.ITEM_FX[id], id);
    assert.notEqual(G.Names.item(id), id);
  }
  assert.deepEqual(FLUTES.map(id => G.ITEM_FX[id].price), [100, 200, 300, 500, 400]);
  assert.ok(FLUTES.every(id => G.ITEM_FX[id].flute));
  assert.equal(G.ITEMS['soot-sack'].pocket, 'key');
  assert.ok(G.ITEM_FX['soot-sack'].key);
});

test('in battle: the Blue Flute wakes, the Yellow Flute ends confusion, the Red Flute infatuation; never used up; not without the status, not on a Pokémon on the bench', () => {
  const bag = { 'blue-flute': 1, 'yellow-flute': 1, 'red-flute': 1 };
  const d = duel(G, { seed: 3, me: ['pikachu', 30, ['splash'], { status: 'slp', slp: 3 }], mine: [['pidgey', 20, ['splash']]], foe: ['pidgey', 5, ['splash']], bag });
  const B = G.BattleItems, side = d.b.player, can = (item, target = 0) => B.canUse(d.b, side, { item, target });
  assert.ok(can('blue-flute'));
  assert.ok(!can('yellow-flute') && !can('red-flute'), 'neither confused nor in love');
  d.b.act({ type: 'item', item: 'blue-flute', target: 0 });
  assert.equal(d.party[0].status, null, 'awake');
  assert.ok(!can('blue-flute'));
  side.bm.vol.confusion = 3;
  side.bm.vol.attract = true;
  assert.ok(can('yellow-flute') && can('red-flute'));
  assert.ok(!can('yellow-flute', 1) && !can('red-flute', 1), 'not on the bench');
  let ev = d.b.act({ type: 'item', item: 'yellow-flute', target: 0 });
  assert.equal(side.bm.vol.confusion, 0);
  assert.ok(ev.some(e => e.type === 'confusionEnd'));
  ev = d.b.act({ type: 'item', item: 'red-flute', target: 0 });
  assert.equal(side.bm.vol.attract, false);
  const end = ev.find(e => e.type === 'attractEnd');
  assert.ok(end && G.BattleText.line(end, d.b).length > 0, 'its message');
  assert.deepEqual(Object.assign({}, side.bag), bag, 'not one used up');
  // A Full Heal-like item is still used up, as before.
  side.bag.awakening = 1;
  d.party[0].status = 'slp'; d.party[0].slp = 2;
  d.b.act({ type: 'item', item: 'awakening', target: 0 });
  assert.equal(side.bag.awakening, undefined);
});

test('outside battle: the Blue Flute wakes a Pokémon and stays; the Yellow and Red Flutes only in battle; the White and Black Flutes from the Bag', () => {
  const FI = G.FieldItems;
  const mon = G.Mon.create(25, 20, { rng: G.RNG(1) });
  mon.status = 'slp'; mon.slp = 3;
  assert.equal(FI.kind('blue-flute'), 'mon');
  assert.ok(FI.canUse('blue-flute', mon));
  assert.ok(FI.use('blue-flute', mon).ok);
  assert.equal(mon.status, null);
  assert.ok(!FI.canUse('blue-flute', mon), 'awake already');
  assert.equal(FI.kind('yellow-flute'), null);
  assert.equal(FI.kind('red-flute'), null);
  assert.equal(FI.kind('white-flute'), 'field');
  assert.equal(FI.kind('black-flute'), 'field');
  assert.deepEqual([G.ITEM_FX['white-flute'].encounter, G.ITEM_FX['black-flute'].encounter], [1.5, 0.5]);
});
