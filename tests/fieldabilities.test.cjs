// Abilities outside battle (chapter 98): G.FieldAbilities in js/world/field-abilities.js, Platinum's rules from its decompilation.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/field-abilities.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const FA = G.FieldAbilities;
const id = slug => G.Maps.species(slug);
const mon = (sp, lvl, o = {}) => Object.assign(G.Mon.create(id(sp), lvl, { rng: G.RNG(lvl), nature: o.nature || 'hardy', gender: o.gender }), o.extra || {});
const share = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };

test('the encounter rate: Illuminate and Arena Trap x2; Stench and White Smoke x1/2; Sand Veil in a sandstorm, Snow Cloak in the snow; never when fishing', () => {
  assert.equal(FA.rate('illuminate', 'walk'), 2);
  assert.equal(FA.rate('arena-trap', 'surf'), 2);
  assert.equal(FA.rate('stench', 'walk'), 0.5);
  assert.equal(FA.rate('white-smoke', 'walk'), 0.5);
  assert.equal(FA.rate('sand-veil', 'walk', 'sand'), 0.5);
  assert.equal(FA.rate('sand-veil', 'walk', null), 1);
  assert.equal(FA.rate('snow-cloak', 'walk', 'hail'), 0.5);
  assert.equal(FA.rate('snow-cloak', 'walk', 'sand'), 1);
  assert.equal(FA.rate('illuminate', 'good-rod'), 1, 'not when fishing');
  assert.equal(FA.rate('blaze', 'walk'), 1);
  assert.equal(FA.rate(null, 'walk'), 1);
  // The first Pokémon is slot 0, fainted or not; an Egg has no ability.
  const a = mon('staryu', 20, { extra: { ability: 'illuminate', hp: 0 } });
  assert.equal(FA.ab(FA.lead([a, mon('pikachu', 20)])), 'illuminate');
  assert.equal(FA.ab(Object.assign({}, a, { egg: true })), null);
});

test('Magnet Pull and Static: half the time a Steel or Electric row; not when none or every row is of that type', () => {
  const mons = [['bidoof', 3, 5, 40], ['starly', 3, 5, 40], ['magnemite', 3, 5, 10], ['shinx', 3, 5, 10]];
  const rng = G.RNG(1);
  const steel = share(400, () => { const r = FA.slot('magnet-pull', mons, rng); return r && r[0] === 'magnemite'; });
  assert.ok(steel > 0.4 && steel < 0.6, 'about half: ' + steel);
  const r2 = G.RNG(2);
  for (let i = 0; i < 100; i++) { const r = FA.slot('static', mons, r2); assert.ok(!r || G.SPECIES[id(r[0])].types.includes('electric')); }
  assert.equal(FA.slot('magnet-pull', [['bidoof', 3, 5, 100]], G.RNG(3)), null, 'none of that type');
  assert.equal(FA.slot('static', [['shinx', 3, 5, 50], ['pikachu', 3, 5, 50]], G.RNG(3)), null, 'all of that type');
  assert.equal(FA.slot('blaze', mons, G.RNG(3)), null);
});

test('Hustle, Vital Spirit and Pressure: the highest level half the time; Keen Eye and Intimidate keep much weaker ones away half the time', () => {
  const rng = G.RNG(4);
  const top = share(400, () => FA.level('pressure', ['geodude', 10, 20, 100], rng) === 20);
  assert.ok(top > 0.5 && top < 0.6, 'about half plus a random 20: ' + top);
  const plainTop = share(400, () => FA.level(null, ['geodude', 10, 20, 100], rng) === 20);
  assert.ok(plainTop < 0.15);
  const lead = mon('arbok', 30);
  const r2 = G.RNG(5);
  const kept = share(400, () => FA.blocks('intimidate', lead, 25, r2));
  assert.ok(kept > 0.4 && kept < 0.6, kept);
  assert.ok(!FA.blocks('intimidate', lead, 26, G.RNG(6)), 'only 5 or more levels below');
  assert.ok(!FA.blocks('keen-eye', mon('pidgey', 5), 1, G.RNG(6)), 'a lead of level 5 or below: never');
  assert.ok(!FA.blocks('blaze', lead, 2, G.RNG(6)));
});

test('Synchronize: the lead\'s nature half the time; Cute Charm: the other gender two times in three, for species with both', () => {
  const syn = mon('abra', 20, { nature: 'timid' });
  const rng = G.RNG(7);
  const same = share(400, () => FA.traits('synchronize', syn, id('bidoof'), rng).nature === 'timid');
  assert.ok(same > 0.4 && same < 0.6, same);
  const cc = mon('clefairy', 20, { gender: 'f' });
  const r2 = G.RNG(8);
  const other = share(600, () => FA.traits('cute-charm', cc, id('bidoof'), r2).gender === 'm');
  assert.ok(other > 0.6 && other < 0.73, other);
  assert.deepEqual(plain(FA.traits('cute-charm', cc, id('chansey'), G.RNG(9))), {}, 'female only');
  assert.deepEqual(plain(FA.traits('cute-charm', cc, id('magnemite'), G.RNG(9))), {}, 'no gender');
  assert.deepEqual(plain(FA.traits('blaze', cc, id('bidoof'), G.RNG(9))), {});
});

test('Pickup: one time in ten, Platinum\'s items by level; Honey Gather: Honey by level; nothing when holding an item', () => {
  const pk = lvl => mon('meowth', lvl, { extra: { ability: 'pickup' } });
  const rng = G.RNG(10);
  const found = [];
  for (let i = 0; i < 3000; i++) { const it = FA.pickup(pk(5), rng); if (it) found.push(it); }
  assert.ok(found.length > 240 && found.length < 360, 'about one in ten: ' + found.length);
  const allowed = FA.COMMON.slice(0, 9).concat(FA.RARE.slice(0, 2));
  assert.ok(found.every(it => allowed.includes(it)), 'level 1-10: the first window');
  assert.ok(found.includes('potion') && found.filter(x => x === 'potion').length > found.length * 0.2, 'Potion the most common');
  const high = [];
  const r2 = G.RNG(11);
  for (let i = 0; i < 4000; i++) { const it = FA.pickup(pk(100), r2); if (it) high.push(it); }
  assert.ok(high.every(it => FA.COMMON.slice(9).includes(it) || FA.RARE.slice(9).includes(it)), 'level 91-100: the last window');
  assert.equal(FA.pickup(Object.assign(pk(50), { item: 'potion' }), G.RNG(12)), null, 'holding an item');
  for (const it of FA.COMMON.concat(FA.RARE, ['honey'])) assert.ok(G.ITEMS[it], it);
  const hg = lvl => mon('combee', lvl, { extra: { ability: 'honey-gather' } });
  for (const [lvl, p] of [[5, 0.05], [50, 0.25], [100, 0.5]]) {
    const r = G.RNG(lvl);
    const s = share(4000, () => FA.pickup(hg(lvl), r) === 'honey');
    assert.ok(Math.abs(s - p) < 0.03, lvl + ': ' + s);
  }
  assert.equal(FA.pickup(mon('bidoof', 20), G.RNG(1)), null);
});

test('Flame Body or Magma Armor in the party: Eggs twice as fast', () => {
  assert.equal(FA.eggFactor([mon('bidoof', 5), mon('slugma', 20, { extra: { ability: 'magma-armor' } })]), 2);
  assert.equal(FA.eggFactor([mon('magmar', 30, { extra: { ability: 'flame-body' } })]), 2);
  assert.equal(FA.eggFactor([mon('bidoof', 5)]), 1);
  assert.equal(FA.eggFactor([Object.assign(mon('magmar', 30, { extra: { ability: 'flame-body' } }), { egg: true })]), 1);
});
