// Generations 3 and 4's special balls (chapter 105): their rates (G.Capture.ballMod, Platinum's battle_script.c), the Heal Ball,
// the Luxury Ball, the Premier Ball given with ten Poké Balls (G.FieldItems.purchaseBonus), the data.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/field-items.js', 'js/script/script.js',
  'js/content/sinnoh/balls.js'])).G;
const mk = (sp, lvl) => G.Mon.create(+Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === sp), lvl, { rng: G.RNG(3) });
const mod = (item, foe, ctx = {}) => G.Capture.ballMod(item, Object.assign({ foe, mine: null }, ctx)).ball;

test('the ten balls are in the data, with their names; sold for Platinum\'s prices but the Premier Ball', () => {
  assert.equal(G.SpecialBalls.NEW.length, 10);
  for (const b of G.SpecialBalls.NEW) {
    assert.ok(G.ITEMS[b] && G.ITEMS[b].pocket === 'balls' && G.ITEM_FX[b].ball && G.ITEM_FX[b].battle, b);
    assert.notEqual(G.Names.item(b), b);
  }
  assert.equal(G.ITEM_FX['heal-ball'].price, 300);
  assert.equal(G.ITEM_FX['dusk-ball'].price, 1000);
  assert.ok(!G.ITEM_FX['premier-ball'].price, 'not sold');
});

test('each ball\'s rate (Platinum\'s): Net, Dive, Nest, Repeat, Timer, Dusk, Quick; the Heal, Luxury and Premier Balls x1', () => {
  const magikarp = mk('magikarp', 10), caterpie = mk('caterpie', 10), pidgey = mk('pidgey', 10);
  assert.deepEqual([mod('net-ball', magikarp), mod('net-ball', caterpie), mod('net-ball', pidgey)], [3, 3, 1]);
  assert.deepEqual([mod('dive-ball', pidgey, { terrain: 'water' }), mod('dive-ball', pidgey, { terrain: 'cave' }), mod('dive-ball', pidgey)], [3.5, 1, 1]);
  assert.deepEqual([5, 20, 30, 39, 40, 60].map(l => mod('nest-ball', mk('pidgey', l))), [3.5, 2, 1, 1, 1, 1]);
  assert.deepEqual([mod('repeat-ball', pidgey, { caught: true }), mod('repeat-ball', pidgey, { caught: false })], [3, 1]);
  assert.deepEqual([0, 1, 5, 10, 29, 30, 50].map(t => mod('timer-ball', pidgey, { turns: t })), [1, 1.1, 1.5, 2, 3.9, 4, 4]);
  assert.deepEqual([mod('dusk-ball', pidgey, { night: true }), mod('dusk-ball', pidgey, { terrain: 'cave' }), mod('dusk-ball', pidgey)], [3.5, 3.5, 1]);
  assert.deepEqual([mod('quick-ball', pidgey, { turns: 0 }), mod('quick-ball', pidgey, { turns: 1 })], [4, 1]);
  for (const b of ['heal-ball', 'luxury-ball', 'premier-ball']) assert.equal(mod(b, pidgey, { night: true, terrain: 'water', turns: 0, caught: true }), 1, b);
});

test('in battle: the turns already over (the Quick Ball on the first turn only), the place, the night and the Pokédex come from the rules', () => {
  const ballOn = (rules, before = 0) => {
    const d = duel(G, { seed: 5, me: ['pikachu', 30, ['splash']], foe: ['pidgey', 30, ['splash']], bag: { 'quick-ball': 3, 'dive-ball': 1, 'repeat-ball': 1 }, rules });
    for (let i = 0; i < before; i++) d.b.act({ type: 'move', slot: 0 });
    const real = G.Capture.ballMod, seen = [];
    G.Capture.ballMod = (item, ctx) => { seen.push(ctx); return real(item, ctx); };
    try { d.b.act({ type: 'ball', item: 'quick-ball' }); } finally { G.Capture.ballMod = real; }
    return seen[0];
  };
  assert.equal(ballOn({}).turns, 0, 'the first turn');
  assert.equal(ballOn({}, 2).turns, 2, 'after two turns');
  const ctx = ballOn({ terrain: 'water', night: true, caught: { 16: 1 } });
  assert.ok(ctx.terrain === 'water' && ctx.night && ctx.caught, 'Pidgey is caught already');
  assert.ok(!ballOn({ caught: { 25: 1 } }).caught);
});

test('the Heal Ball heals what it catches; the Luxury Ball adds one to each friendship gain, before the Soothe Bell', () => {
  const d = duel(G, { seed: 5, me: ['pikachu', 30, ['splash']], foe: ['caterpie', 2, ['splash'], { hp: 3, status: 'par' }], bag: { 'heal-ball': 5 } });
  let n = 0;
  while (!d.b.result && n++ < 5) d.b.act({ type: 'ball', item: 'heal-ball' });
  assert.equal(d.b.result.outcome, 'caught');
  const mon = d.party[1];
  assert.ok(mon.ball === 'heal-ball' && mon.hp === G.Mon.maxHp(mon) && !mon.status);
  const m = mk('pidgey', 10);
  m.ball = 'luxury-ball';
  assert.deepEqual([5, 1, -5].map(k => G.Held.friendship(m, k)), [6, 2, -5]);
  m.item = 'soothe-bell';
  assert.equal(G.Held.friendship(m, 5), 9, '(5 + 1) x 1.5');
});

test('ten Poké Balls or more bought at once: a Premier Ball free (Platinum\'s and Emerald\'s shops)', () => {
  const B = G.FieldItems.purchaseBonus;
  assert.deepEqual([B('poke-ball', 9), B('poke-ball', 10), B('poke-ball', 25), B('great-ball', 10)], [null, 'premier-ball', 'premier-ball', null]);
});
