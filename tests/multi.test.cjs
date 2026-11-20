// Sinnoh's Battle Tower, multi battles (chapter 95): G.SinnohMulti in js/content/sinnoh/smulti.js. The partners' sets (Platinum's,
// from the decompilation), the two Pokémon each partner brings, the two Trainers of each battle, the battle itself (a partner
// beside you, rules.tag against two), the Multi Ability Ribbon.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/data/trainer-classes.js', 'js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/tower.js',
  'js/world/ribbons.js', 'js/script/script.js', 'js/content/hoenn/tower.js', 'js/content/sinnoh/frontier.js', 'js/content/sinnoh/smulti.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const M = G.SinnohMulti;
const id = slug => G.Maps.species(slug);
const mon = (sp, item, o = {}) => Object.assign(G.Mon.create(id(sp), 50, Object.assign({ rng: G.RNG(7), nature: 'hardy' }, o)), { item });

test('the partners\' sets: Platinum\'s lists without the items this game lacks; every species, move, item and nature known', () => {
  assert.deepEqual(plain(M.PARTNERS), ['cheryl', 'mira', 'riley', 'marley', 'buck']);
  assert.deepEqual(plain(Object.fromEntries(M.PARTNERS.map(p => [p, M.LISTS[p].length]))), { cheryl: 52, mira: 57, riley: 69, marley: 57, buck: 64 });
  assert.equal(Object.keys(M.SETS).length, 273);
  for (const p of M.PARTNERS) for (const k of M.LISTS[p]) assert.ok(M.SETS[k], p + ': ' + k);
  for (const [k, [sp, moves, item, nature]] of Object.entries(M.SETS)) {
    assert.ok(id(sp) != null, k);
    assert.equal(moves.length, 4, k);
    assert.equal(new Set(moves).size, 4, k);
    for (const m of moves) assert.ok(G.MOVES[m], k + ': ' + m);
    assert.ok(item === null || G.ITEMS[item], k + ': ' + item);
    assert.ok(G.NATURES[nature], k + ': ' + nature);
  }
  // A few of Platinum's sets as the decompilation has them.
  assert.deepEqual(plain(M.SETS['snorlax-1']), ['snorlax', ['return', 'rock-slide', 'curse', 'yawn'], 'leftovers', 'adamant']);
  assert.ok(M.LISTS.cheryl.includes('blissey-1') && M.LISTS.buck.includes('claydol-1') && M.LISTS.riley.includes('lucario-1'));
  // Chapter 96: the sets with Draco Meteor and Hydro Cannon are back (Platinum's tutors).
  assert.deepEqual(plain(M.SETS['empoleon-4']), ['empoleon', ['hydro-cannon', 'flash-cannon', 'drill-peck', 'earthquake'], 'quick-claw', 'brave']);
  assert.ok(M.LISTS.riley.includes('garchomp-2') && M.LISTS.mira.includes('latios-4'));
  assert.ok(!Object.values(M.SETS).some(([, , item]) => ['damp-rock', 'heat-rock', 'icy-rock'].includes(item)));
  // Chapter 97: the sets with the Lax and Wave Incense are back.
  assert.deepEqual(plain(M.SETS['floatzel-3'].slice(2)), ['wave-incense', M.SETS['floatzel-3'][3]]);
  assert.equal(Object.values(M.SETS).filter(([, , item]) => item === 'lax-incense').length, 10);
});

test('a partner\'s two: from their own list, at level 50 with IVs of 31, two species, never yours, no item twice nor one of yours; the same challenge, the same two', () => {
  const mine = [mon('blissey', 'leftovers'), mon('snorlax', 'sitrus-berry')];
  for (const p of M.PARTNERS) {
    const seen = new Set();
    for (let run = 1; run <= 40; run++) {
      const t = M.partnerTeam(p, run, mine);
      assert.equal(t.length, 2, p);
      const [a, b] = t;
      for (const r of t) {
        assert.equal(r[1], 50);
        assert.deepEqual(plain(r[4].ivs), [31, 31, 31, 31, 31, 31]);
        assert.ok(M.LISTS[p].some(k => M.SETS[k][0] === r[0] && M.SETS[k][3] === r[4].nature && M.SETS[k][2] === r[3]), p + ' ' + r[0]);
        assert.ok(!mine.some(m => m.sp === id(r[0])), 'not one of yours: ' + r[0]);
        assert.ok(!r[3] || !mine.some(m => m.item === r[3]), 'not your item: ' + r[3]);
      }
      assert.notEqual(a[0], b[0]);
      assert.ok(!a[3] || a[3] !== b[3], 'no item twice');
      assert.deepEqual(plain(M.partnerTeam(p, run, mine)), plain(t), 'the same draw');
      seen.add(a[0] + '+' + b[0]);
    }
    assert.ok(seen.size > 10, p + ' brings different Pokémon to other challenges');
  }
});

test('the two Trainers of a battle: different people, two Pokémon each from one team of four of the round, alternating for rules.tag', () => {
  for (const n of [1, 7, 8, 22, 50]) {
    const d = M.foesFor(n, 3);
    assert.ok(d.double && d.a && d.b);
    assert.ok(d.a.cls !== d.b.cls || d.a.name !== d.b.name);
    assert.deepEqual(plain(d.partner), { cls: d.b.cls, name: d.b.name, who: d.b.who });
    assert.deepEqual(plain(d.team), plain([d.a.team[0], d.b.team[0], d.a.team[1], d.b.team[1]]));
    assert.equal(new Set(d.team.map(r => r[0])).size, 4, 'four species');
    assert.equal(new Set(d.team.map(r => r[3])).size, 4, 'four items');
    assert.ok(d.team.every(r => r[1] === 50));
    assert.ok(d.a.before && d.b.defeat);
    assert.deepEqual(plain(M.foesFor(n, 3)), plain(d), 'the same battle for the same challenge');
  }
  // A later round draws from a stronger pool.
  const bst = r => G.SPECIES[id(r[0])].base.reduce((a, b) => a + b, 0);
  const avg = n => { let s = 0; for (let run = 1; run <= 10; run++) s += M.foesFor(n, run).team.reduce((a, r) => a + bst(r), 0) / 4; return s / 10; };
  assert.ok(avg(29) > avg(1));
});

test('the battle: you in slot 0 with your partner beside you (their nature kept), the two Trainers\' first Pokémon out', () => {
  const d = M.foesFor(1, 1), rows = M.partnerTeam('cheryl', 1, []);
  const make = list => list.map(([sp, lvl, moves, item, o]) => Object.assign(G.Mon.create(id(sp), lvl, Object.assign({ rng: G.RNG(3), moves }, o)), item ? { item } : {}));
  const me = [mon('garchomp', 'leftovers', { moves: ['earthquake', 'dragon-claw'] }), mon('lucario', 'life-orb', { moves: ['aura-sphere'] })];
  const b = G.Battle.create({ kind: 'trainer', seed: 9, player: { name: 'Dawn', party: me, bag: {} }, partner: { name: 'Cheryl', party: make(rows) },
    foe: { party: make(d.team), trainer: { id: 'tower', name: 'T', ai: 'leader', items: {}, prize: 0 } },
    rules: { double: true, tag: true, noExp: true, noBag: true, shift: false, canLose: true } });
  b.start();
  assert.equal(b.player.bms[0].mon.sp, me[0].sp);
  assert.equal(b.player.bms[1].mon.sp, id(rows[0][0]), 'the partner\'s first');
  assert.deepEqual(plain(b.foe.bms.map(x => x.mon.sp)), [id(d.a.team[0][0]), id(d.b.team[0][0])]);
  assert.equal(b.player.bms[1].mon.nature, rows[0][4].nature);
});

test('the Multi Ability Ribbon (Sinnoh\'s)', () => {
  assert.equal(G.Ribbons.name('multi-ability'), 'Multi Ability Ribbon');
  assert.equal(G.Ribbons.region('multi-ability'), 'sinnoh');
  const m = mon('garchomp', null);
  assert.ok(G.Ribbons.give(m, 'multi-ability') && !G.Ribbons.give(m, 'multi-ability'));
});

test('who waits in the salon: the Trainers you have traveled with (the Battleground\'s flags)', () => {
  assert.deepEqual(plain(M.met()), []);
  G.Field.setFlag('cheryl-with');
  G.Field.setFlag('magma-stone-back');
  assert.deepEqual(plain(M.met()), ['cheryl', 'buck']);
  const salon = G.Maps.get('sinnoh-tower-salon');
  for (const p of M.PARTNERS) assert.equal(salon.npcs.find(n => n.id === p).if, M.MET[p]);
  assert.deepEqual(plain(G.Maps.validate('sinnoh-tower-salon')), []);
  assert.deepEqual(plain(G.Maps.validate('sinnoh-tower-multi')), []);
});
