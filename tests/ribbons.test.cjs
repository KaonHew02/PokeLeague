// Ribbons (chapter 87): js/world/ribbons.js (names, regions, giving, Julia's days, the Ribbon Syndicate's order) and the save's
// check of ribbon ids (js/core/store.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/poffin.js', 'js/world/supercontest.js', 'js/world/ribbons.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const R = G.Ribbons;

test('every ribbon has a name and a region; the contest ones are named by the Super Contest', () => {
  assert.equal(Object.keys(R.LIST).length, 16);
  for (const id of Object.keys(R.LIST)) assert.ok(/ Ribbon$/.test(R.name(id)), id + ': ' + R.name(id));
  assert.equal(R.name('sinnoh-champion'), 'Sinnoh Champ Ribbon');
  assert.equal(R.name('gorgeous-royal'), 'Gorgeous Royal Ribbon');
  assert.equal(R.name('cool-great'), 'Cool Ribbon Great');
  assert.equal(R.name('hoenn-cute-super'), 'Cute Ribbon Super');
  assert.deepEqual(['champion', 'winning', 'artist', 'hoenn-cool-normal'].map(R.region), ['hoenn', 'hoenn', 'hoenn', 'hoenn']);
  assert.deepEqual(['sinnoh-champion', 'effort', 'smile', 'gorgeous', 'cool-normal'].map(R.region), ['sinnoh', 'sinnoh', 'sinnoh', 'sinnoh', 'sinnoh']);
});

test('giving: once each, counted; Julia\'s ribbon by the day of the week; the Syndicate\'s three in order', () => {
  const mon = G.Mon.create(G.Maps.species('pikachu'), 20, { rng: G.RNG(1) });
  assert.equal(R.count(mon), 0);
  assert.ok(R.give(mon, 'effort') && !R.give(mon, 'effort'), 'once');
  assert.ok(R.has(mon, 'effort') && !R.has(mon, 'smile'));
  assert.equal(R.count(mon), 1);
  const was = G.Clock.weekday;
  const days = [];
  for (let d = 0; d < 7; d++) { G.Clock.weekday = () => d; days.push(R.today()); }
  G.Clock.weekday = was;
  assert.deepEqual(days, ['smile', 'alert', 'shock', 'downcast', 'careless', 'relax', 'snooze'], 'Sunday to Saturday');
  assert.deepEqual(plain(R.SHOP), [['gorgeous', 10000], ['royal', 100000], ['gorgeous-royal', 999999]]);
  assert.deepEqual(plain(R.next(mon)), ['gorgeous', 10000]);
  R.give(mon, 'gorgeous');
  assert.deepEqual(plain(R.next(mon)), ['royal', 100000]);
  R.give(mon, 'royal'); R.give(mon, 'gorgeous-royal');
  assert.equal(R.next(mon), null, 'all three');
});

test('the save keeps ribbon ids of one to three words, as before', () => {
  const s = G.Store.newSave({ name: 'Dawn', id: 1 });
  const mon = G.Mon.create(G.Maps.species('pikachu'), 20, { rng: G.RNG(2) });
  mon.ribbons = ['effort', 'gorgeous-royal', 'cool-normal', 'hoenn-cool-master', 'a-b-c-d', 'Effort', 'two words', 7, 'effort'];
  s.party = [mon];
  const out = G.Store.sanitize(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(plain(out.party[0].ribbons), ['effort', 'gorgeous-royal', 'cool-normal', 'hoenn-cool-master']);
});
