// Platinum's free move tutors (chapter 96): Draco Meteor (Route 210) and the ultimate moves (Route 228), js/content/sinnoh/tutors.js
// (G.SinnohTutors). The moves in the data and who learns them; the Battle Tower's rolls kept as they were; the moves in battle.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/tower.js', 'js/script/script.js',
  'js/content/sinnoh/tutors.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const id = slug => G.Maps.species(slug);
const Tu = G.SinnohTutors;
const STARTERS = { 'blast-burn': ['charizard', 'typhlosion', 'blaziken', 'infernape'], 'hydro-cannon': ['blastoise', 'feraligatr', 'swampert', 'empoleon'],
                   'frenzy-plant': ['venusaur', 'meganium', 'sceptile', 'torterra'] };

test('the four moves are in the data; the twelve last-stage starters and the Dragon-types learn them from a tutor', () => {
  assert.deepEqual(plain(['draco-meteor', 'blast-burn', 'hydro-cannon', 'frenzy-plant'].map(m => [G.MOVES[m].type, G.MOVES[m].cat, G.MOVES[m].pow, G.MOVES[m].acc])),
    [['dragon', 'special', 130, 90], ['fire', 'special', 150, 90], ['water', 'special', 150, 90], ['grass', 'special', 150, 90]]);
  assert.deepEqual(plain(G.MOVES['draco-meteor'].stats), [['spa', -2]]);
  for (const [move, list] of Object.entries(STARTERS)) {
    for (const sp of list) {
      assert.ok(G.SPECIES[id(sp)].tu.includes(move), sp + ' learns ' + move);
      assert.equal(Tu.ULTIMATE[id(sp)], move, sp);
    }
  }
  assert.equal(Object.keys(Tu.ULTIMATE).length, 12);
  // Every Dragon-type may learn Draco Meteor; no one else but Arceus (by a plate).
  for (const sp of Object.keys(G.SPECIES).map(Number)) {
    const S = G.SPECIES[sp], has = (S.tu || []).includes('draco-meteor');
    if (S.types.includes('dragon')) assert.ok(has, S.slug);
    else assert.ok(!has || S.slug === 'arceus', S.slug);
  }
  assert.ok(!(G.SPECIES[id('charmander')].tu || []).includes('blast-burn'), 'only the last stage');
});

test('who the tutors teach: a Dragon-type (by its species, or Arceus by its plate), the last stage of a starter; never an Egg', () => {
  const mon = (sp, o) => Object.assign(G.Mon.create(id(sp), 60, { rng: G.RNG(1) }), o);
  assert.ok(Tu.dragon(mon('garchomp')) && Tu.dragon(mon('altaria')) && !Tu.dragon(mon('charizard')));
  assert.ok(Tu.canDraco(mon('dragonite')) && !Tu.canDraco(mon('dragonite', { egg: true })));
  const known = mon('salamence');
  G.Mon.learn(known, 'draco-meteor', 0);
  assert.ok(!Tu.canDraco(known), 'already knows it');
  const arceus = mon('arceus', { ability: 'multitype', item: 'draco-plate' });
  assert.ok(Tu.dragon(arceus) && !Tu.dragon(mon('arceus', { ability: 'multitype' })));
  assert.equal(Tu.ultimateFor(mon('empoleon')), 'hydro-cannon');
  assert.equal(Tu.ultimateFor(mon('torterra', { egg: true })), null);
  assert.equal(Tu.ultimateFor(mon('lucario')), null);
  assert.equal(Tu.MAX, 255);
});

test('the Battle Tower never rolls Draco Meteor (nor the ultimate moves): its rolls stay as they were', () => {
  for (const sp of ['dragonite', 'salamence', 'garchomp', 'kingdra', 'flygon', 'altaria', 'charizard', 'blastoise', 'venusaur']) {
    const ms = G.Tower.learnable(id(sp));
    for (const m of ['draco-meteor', 'blast-burn', 'hydro-cannon', 'frenzy-plant']) assert.ok(!ms.includes(m), sp + ' ' + m);
  }
  for (let round = 0; round < 4; round++) {
    for (let s = 1; s <= 20; s++) {
      for (const [, , moves] of G.Tower.team(G.RNG(s * 7 + round), round, 4)) assert.ok(!moves.includes('draco-meteor'));
    }
  }
});

test('Draco Meteor harshly lowers the user\'s Sp. Atk; the ultimate moves leave the user resting, as Hyper Beam does', () => {
  let { b } = duel(G, { me: ['garchomp', 60, ['draco-meteor', 'tackle']], foe: ['blissey', 100, ['splash']], seed: 1 });
  let dropped = false;
  for (let seed = 1; seed <= 6 && !dropped; seed++) {
    ({ b } = duel(G, { me: ['garchomp', 60, ['draco-meteor', 'tackle']], foe: ['blissey', 100, ['splash']], seed }));
    const ev = b.act({ type: 'move', slot: 0 });
    if (!ev.some(e => e.type === 'damage' && e.side === 1)) continue;
    dropped = ev.some(e => e.type === 'stage' && e.side === 0 && e.stat === 'spa' && e.delta === -2) && b.player.bm.stages.spa === -2;
  }
  assert.ok(dropped, 'Sp. Atk -2');
  for (const [move, list] of Object.entries(STARTERS)) {
    let rested = false;
    for (let seed = 1; seed <= 6 && !rested; seed++) {
      ({ b } = duel(G, { me: [list[3], 60, [move, 'tackle']], foe: ['blissey', 100, ['splash']], seed }));
      const ev = b.act({ type: 'move', slot: 0 });
      if (!ev.some(e => e.type === 'damage' && e.side === 1)) continue;
      rested = ev.some(e => e.type === 'cantMove' && e.why === 'recharge');
    }
    assert.ok(rested, move);
  }
});
