// Arceus and the Hall of Origin (chapter 100): Judgment's type by its user's plate (js/battle/moves-special.js), the sixteen plates
// and how the Celestic elder counts them (G.HallOfOrigin in js/content/sinnoh/origin.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/script/script.js', 'js/content/sinnoh/origin.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const O = G.HallOfOrigin;

test('the sixteen plates: every plate item of the data, one of each type but Normal and Fairy', () => {
  assert.equal(O.PLATES.length, 16);
  const plates = Object.keys(G.ITEM_FX).filter(k => G.ITEM_FX[k].plate);
  assert.deepEqual(plain(plates.slice().sort()), plain(O.PLATES.slice().sort()));
  const types = O.PLATES.map(p => G.ITEM_FX[p].type);
  assert.equal(new Set(types).size, 16);
  assert.ok(!types.includes('normal') && !types.includes('fairy'));
  for (const p of O.PLATES) assert.ok(G.ITEMS[p] && G.Names.item(p) !== p, p);
  assert.equal(G.ITEMS['azure-flute'].pocket, 'key');
});

test('Judgment takes the type of its user\'s plate (Normal without one): the matchups follow it', () => {
  const MS = G.SpecialMoves.judgment;
  for (const p of O.PLATES) assert.equal(MS.moveType(null, { mon: { item: p } }), G.ITEM_FX[p].type, p);
  assert.equal(MS.moveType(null, { mon: { item: null } }), 'normal');
  assert.equal(MS.moveType(null, { mon: { item: 'leftovers' } }), 'normal');
  // Against a Gengar: Normal does nothing; with the Spooky Plate it is super effective. Against a Charizard, the Splash Plate.
  const hit = (foe, item) => {
    const { b } = duel(G, { me: ['arceus', 80, ['judgment'], item ? { item, ability: 'multitype' } : { ability: 'multitype' }], foe: [foe, 60, ['splash']], seed: 3 });
    const ev = b.act({ type: 'move', slot: 0 });
    const d = ev.find(e => e.type === 'damage' && e.side === 1);
    return d ? d.eff : 0;
  };
  assert.equal(hit('gengar', null), 0, 'Normal on a Ghost');
  assert.equal(hit('gengar', 'spooky-plate'), 2);
  assert.equal(hit('charizard', 'splash-plate'), 2);
  assert.equal(hit('charizard', 'meadow-plate'), 0.25, 'Grass on Fire and Flying');
});

test('the plates the elder counts: in the Bag, held by the team, held by a Pokémon in the PC', () => {
  const F = G.Field, S = F.save;
  assert.equal(O.platesOwned().size, 0);
  F.giveItem('flame-plate', 1);
  const a = F.giveMon('bidoof', 10);
  a.item = 'splash-plate';
  const b = G.Mon.create(G.Maps.species('starly'), 10, { rng: G.RNG(1) });
  b.item = 'zap-plate';
  S.boxes[2][5] = b;
  assert.deepEqual(plain([...O.platesOwned()].sort()), ['flame-plate', 'splash-plate', 'zap-plate']);
  for (const p of O.PLATES) F.giveItem(p, 1);
  assert.equal(O.platesOwned().size, 16);
});
