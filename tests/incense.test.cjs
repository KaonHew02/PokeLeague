// The incenses (chapter 97): their held effects (js/data/item-effects.js on held.js's kinds) and the babies they let two Pokémon
// at the Day Care leave (js/world/daycare.js, G.DayCare.breed, incenseFor).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/daycare.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const id = slug => +Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === slug);
const mon = (sp, o = {}) => Object.assign(G.Mon.create(id(sp), 40, { rng: G.RNG(3), nature: 'hardy', gender: o.gender }), o.item ? { item: o.item } : {});
const INCENSES = ['sea-incense', 'lax-incense', 'rock-incense', 'odd-incense', 'rose-incense', 'wave-incense', 'full-incense', 'luck-incense', 'pure-incense'];

test('the nine incenses: in the data with their names, held as Generation 4 has them, not sold', () => {
  for (const it of INCENSES) {
    assert.ok(G.ITEMS[it], it);
    assert.ok(G.Names.item(it) && G.Names.item(it) !== it, it);
    assert.ok(G.ITEM_FX[it] && G.ITEM_FX[it].held, it);
    assert.ok(!G.ITEM_FX[it].price, it + ' is not sold');
  }
  const kinds = Object.fromEntries(INCENSES.map(it => [it, G.ITEM_FX[it].held + (G.ITEM_FX[it].type ? ':' + G.ITEM_FX[it].type : '')]));
  assert.deepEqual(plain(kinds), { 'sea-incense': 'boost:water', 'lax-incense': 'bright-powder', 'rock-incense': 'boost:rock', 'odd-incense': 'boost:psychic',
    'rose-incense': 'boost:grass', 'wave-incense': 'boost:water', 'full-incense': 'lagging-tail', 'luck-incense': 'amulet-coin', 'pure-incense': 'cleanse-tag' });
});

test('the type incenses power their type 1.2x; the Lax Incense makes moves against its holder a tenth less accurate', () => {
  for (const [it, type] of [['sea-incense', 'water'], ['wave-incense', 'water'], ['rock-incense', 'rock'], ['odd-incense', 'psychic'], ['rose-incense', 'grass']]) {
    const m = mon('azumarill', { item: it });
    assert.equal(G.Held.power(m, type, G.MOVES.tackle), 1.2, it);
    assert.equal(G.Held.power(m, 'fire', G.MOVES.tackle), 1, it + ' only its type');
  }
  assert.equal(G.Held.accMult(mon('wobbuffet', { item: 'lax-incense' })), 0.9);
  assert.equal(G.Held.accMult(mon('wobbuffet')), 1);
});

test('the Full Incense moves its holder last; the Luck Incense doubles the prize money, not again with an Amulet Coin', () => {
  // A fast Jolteon holding it moves after a slow Slowpoke.
  const order = item => {
    const { b } = duel(G, { me: ['jolteon', 50, ['tackle'], item ? { item } : {}], foe: ['slowpoke', 50, ['tackle']], kind: 'trainer', seed: 4 });
    const ev = b.act({ type: 'move', slot: 0 });
    return ev.filter(e => e.type === 'move').map(e => e.side);
  };
  assert.deepEqual(plain(order(null)), [0, 1]);
  assert.deepEqual(plain(order('full-incense')), [1, 0]);
  // Prize money for the same win: x2 with the Luck Incense; with an Amulet Coin on the other one too, still x2.
  const prize = (lead, second) => {
    const { b } = duel(G, { me: ['machamp', 60, ['cross-chop', 'tackle'], lead ? { item: lead } : {}], mine: [['golem', 60, ['earthquake'], second ? { item: second } : {}]],
                            foe: ['pidgey', 5, ['growl']], kind: 'trainer', seed: 1 });
    if (second) b.act({ type: 'switch', index: 1 });
    for (let i = 0; i < 10 && !b.result; i++) b.act({ type: 'move', slot: 0 });
    return b.result.money;
  };
  const base = prize(null, null);
  assert.ok(base > 0);
  assert.equal(prize('luck-incense', null), base * 2);
  assert.equal(prize('luck-incense', 'amulet-coin'), base * 2, 'not x4');
});

test('breeding: with either parent holding its incense, the Egg is the baby; without it (or with another), the next stage', () => {
  const D = G.DayCare;
  const CASES = [['marill', 'sea-incense', 'azurill', 'marill'], ['azumarill', 'sea-incense', 'azurill', 'marill'],
    ['wobbuffet', 'lax-incense', 'wynaut', 'wobbuffet'], ['roselia', 'rose-incense', 'budew', 'roselia'], ['roserade', 'rose-incense', 'budew', 'roselia'],
    ['chimecho', 'pure-incense', 'chingling', 'chimecho'], ['sudowoodo', 'rock-incense', 'bonsly', 'sudowoodo'], ['mr-mime', 'odd-incense', 'mime-jr', 'mr-mime'],
    ['chansey', 'luck-incense', 'happiny', 'chansey'], ['blissey', 'luck-incense', 'happiny', 'chansey'], ['snorlax', 'full-incense', 'munchlax', 'snorlax'],
    ['mantine', 'wave-incense', 'mantyke', 'mantine']];
  const egg = (mother, father) => G.SPECIES[D.breed(mother, father, G.RNG(9)).mon.sp].slug;
  for (const [sp, it, baby, next] of CASES) {
    assert.equal(egg(mon(sp, { gender: 'f' }), mon('ditto')), next, sp + ' without an incense');
    assert.equal(egg(mon(sp, { gender: 'f', item: it }), mon('ditto')), baby, sp + ' holding ' + it);
    assert.equal(egg(mon(sp, { gender: 'f' }), mon('ditto', { item: it })), baby, 'the Ditto holding ' + it);
    assert.equal(egg(mon(sp, { gender: 'f', item: it === 'sea-incense' ? 'wave-incense' : 'sea-incense' }), mon('ditto')), next, sp + ' with another incense');
    assert.equal(D.incenseFor(id(baby)), it);
  }
  // A father of the same species holding it works too (Generation 4: either parent).
  assert.equal(egg(mon('snorlax', { gender: 'f' }), mon('snorlax', { gender: 'm', item: 'full-incense' })), 'munchlax');
  assert.equal(D.incenseFor(id('pichu')), null, 'Pichu needs none');
  assert.equal(egg(mon('pikachu', { gender: 'f' }), mon('ditto')), 'pichu');
});
