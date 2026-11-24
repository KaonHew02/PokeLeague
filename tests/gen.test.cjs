// The generation pages (js/core/gen.js; docs/DESIGN.md "Generation pages"): which game a page is, its own saves,
// and Generation 1's rules: Pokémon 1-151 only (wild tables, evolution), Kanto only (the road to Johto is closed),
// and its last chapter's ending. The whole journey (generation 0) must stay exactly as it was.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, plain, fakeStorage, CORE, DATA, BATTLE } = require('./helpers.cjs');

const FILES = CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/player.js', 'js/world/field.js', 'js/script/script.js']);

function el() {
  return { classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, appendChild() {}, style: {}, offsetWidth: 0 };
}
const tick = () => new Promise(r => setImmediate(r));

/** A world without a screen (as tests/field.test.cjs), as generation `gen` (set before any map is read). */
function world(gen, extra = []) {
  const ctx = boot(FILES.concat(extra));
  const G = ctx.G;
  G.Gen.set(gen);
  let now = 0;
  ctx.performance.now = () => now;
  ctx.setTimeout = f => { setImmediate(f); return 0; };
  ctx.requestAnimationFrame = f => setImmediate(() => { now += 50; f(); });
  ctx.document = { getElementById: () => el(), createElement: () => el() };
  const said = [];
  Object.assign(G, {
    WorldRender: { prepare() {}, draw() {} },
    Camera: { snap() {}, fitRoom() {}, w: 480, h: 320, scale: 1, left: () => 0, top: () => 0 },
    Audio: { sfx() {}, music() {}, jingle: () => Promise.resolve() },
    Dialog: { open: false, tick() {}, say: t => { said.push(t); return Promise.resolve(); }, ask: () => Promise.resolve(0) },
    UI: { toast() {}, anyOpen: () => false, closeAll() {} },
    Settings: { get: () => false, on() {} },
    Input: { clicks: () => [] },
    Btn: { dir4: () => null, pressed: () => false, held: () => false }
  });
  return { G, W: G.World, said };
}

test('G.Gen: the whole journey unless the page says otherwise; each generation its Pokémon, regions, chapters and keys', () => {
  const { G } = boot(CORE);
  const Gen = G.Gen;
  assert.equal(Gen.n, 0, 'no page attribute: the whole journey');
  assert.equal(Gen.maxDex, 493);
  assert.equal(Gen.key('save.1'), 'pl.save.1');
  assert.ok(Gen.allows(493) && Gen.mapOpen('anything'));
  assert.equal(Gen.title(), 'PokeLeague');
  assert.equal(Gen.subtitle(), null);
  assert.deepEqual(plain(Gen.PUBLISHED), [1]);
  Gen.set(1);
  assert.equal(Gen.maxDex, 151);
  assert.ok(Gen.allows(151) && !Gen.allows(152) && !Gen.allows(0));
  assert.deepEqual(plain(Gen.regions), ['kanto']);
  assert.deepEqual(plain(Gen.chapters), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(Gen.last, 10);
  assert.equal(Gen.key('save.1'), 'pl.g1.save.1');
  assert.equal(Gen.key('slot'), 'pl.g1.slot');
  assert.equal(Gen.title(), 'PokeLeague (Generation 1)');
  assert.equal(Gen.subtitle(), 'Generation 1 · Kanto');
  assert.equal(Gen.label(0), 'The whole journey: Kanto to Sinnoh');
  // Every chapter belongs to exactly one generation.
  const all = [1, 2, 3, 4].flatMap(k => Gen.INFO[k].chapters).sort((a, b) => a - b);
  assert.deepEqual(plain(all), Array.from({ length: 110 }, (_, i) => i + 1));
  assert.deepEqual([2, 3, 4].map(k => Gen.INFO[k].maxDex), [251, 386, 493]);
  Gen.set(9);
  assert.equal(Gen.n, 0, 'an unknown generation is the whole journey');
});

test('saves: a generation page has slots of its own and does not load the whole journey\'s (nor its files)', () => {
  const { G } = boot(CORE.concat(DATA, ['js/core/store.js']));
  const store = fakeStorage();
  G.Store.use(store);
  const full = G.Store.newSave({ name: 'Red' });
  assert.equal(full.gen, 0);
  assert.ok(G.Store.write(1, full));
  assert.ok(store.getItem('pl.save.1') && store.getItem('pl.slot') === '1');
  G.Gen.set(1);
  assert.deepEqual(plain(G.Store.slots()), [null, null, null], 'the whole journey\'s save is not shown');
  assert.equal(G.Store.load(1), null);
  assert.equal(G.Store.lastSlot(), null);
  const one = G.Store.newSave({ name: 'Leaf' });
  assert.equal(one.gen, 1);
  assert.ok(G.Store.write(2, one));
  assert.ok(store.getItem('pl.g1.save.2'), 'written under pl.g1.');
  assert.equal(store.getItem('pl.g1.slot'), '2');
  assert.equal(store.getItem('pl.slot'), '1', 'the whole journey\'s last slot is untouched');
  assert.equal(G.Store.load(2).player.name, 'Leaf');
  assert.equal(G.Store.load(2).gen, 1);
  assert.equal(G.Store.slots()[1].name, 'Leaf');
  // A file exported from the whole journey is refused here, and the other way round.
  assert.deepEqual(plain(G.Store.importText(G.Store.exportText(full))), { error: 'other-gen', gen: 0 });
  assert.equal(G.Store.importText(G.Store.exportText(one)).save.player.name, 'Leaf');
  G.Gen.set(0);
  assert.deepEqual(plain(G.Store.importText(G.Store.exportText(one))), { error: 'other-gen', gen: 1 });
  assert.equal(G.Store.slots()[1], null, 'the generation page\'s save is not shown in the whole journey');
  assert.equal(G.Store.load(1).player.name, 'Red');
  G.Store.remove(1);
  assert.equal(store.getItem('pl.g1.save.2') !== null, true, 'removing a slot of one game leaves the other');
});

test('Generation 1: Cerulean Cave has no Wobbuffet; the other chances keep their proportions; the whole journey is unchanged', () => {
  const full = world(0, ['js/content/kanto/cave.js']).G;
  const one = world(1, ['js/content/kanto/cave.js']).G;
  for (const id of ['cave-1f', 'cave-2f', 'cave-b1f']) {
    const a = full.Maps.encounters(full.Maps.get(id), 'walk'), b = one.Maps.encounters(one.Maps.get(id), 'walk');
    assert.ok(a.mons.some(r => r[0] === 202), id + ': Wobbuffet in the whole journey');
    assert.ok(b.mons.length && b.mons.every(r => r[0] <= 151), id + ': none above 151');
    const sum = t => t.mons.reduce((s, r) => s + r[3], 0);
    assert.ok(Math.abs(sum(a) - sum(b)) < 1e-9, id + ': the same total');
    const rest = a.mons.filter(r => r[0] !== 202), k = sum(a) / rest.reduce((s, r) => s + r[3], 0);
    b.mons.forEach((r, i) => assert.ok(Math.abs(r[3] - rest[i][3] * k) < 1e-9, 'in proportion'));
    // The very same table object in the whole journey (its draws are not touched).
    assert.equal(full.Maps.encounters(full.Maps.get(id), 'walk'), full.ENCOUNTERS[full.Maps.get(id).encounters.walk.slice(1)].walk);
  }
  // A table with none above 151 comes back as it is.
  const r1 = one.Maps.encounters(one.Maps.get('cave-1f'), 'surf');
  assert.ok(!r1 || r1.mons.every(r => r[0] <= 151));
  // A whole list above the limit is gone; a table with nothing left is none at all.
  assert.equal(one.Gen.table({ rate: 10, mons: [[202, 5, 5, 100]] }), null);
  const t = one.Gen.table({ rate: 10, mons: [[19, 2, 3, 50], [161, 2, 3, 50]], night: [[202, 2, 3, 100]] });
  assert.deepEqual(plain(t), { rate: 10, mons: [[19, 2, 3, 100]] });
});

test('Generation 1: no evolution into a later generation (Golbat, Chansey, Eevee, Magneton, Onix...); the whole journey keeps them', () => {
  const make = (G, sp, lvl, o = {}) => Object.assign(G.Mon.create(sp, lvl, { rng: G.RNG(1) }), o);
  const full = boot(CORE.concat(DATA, BATTLE)).G;
  const one = boot(CORE.concat(DATA, BATTLE)).G;
  one.Gen.set(1);
  const cases = [
    [42, 30, { friendship: 255 }, { trigger: 'level' }, 169],                  // Golbat -> Crobat
    [113, 30, { friendship: 255 }, { trigger: 'level' }, 242],                 // Chansey -> Blissey
    [133, 20, { friendship: 255 }, { trigger: 'level', time: 'day' }, 196],    // Eevee -> Espeon
    [133, 20, {}, { trigger: 'item', item: 'leaf-stone' }, 470],               // Eevee -> Leafeon
    [82, 40, {}, { trigger: 'item', item: 'thunder-stone' }, 462]              // Magneton -> Magnezone
  ];
  for (const [sp, lvl, extra, o, to] of cases) {
    assert.ok(plain(full.Evolution.candidates(make(full, sp, lvl, extra), o)).includes(to), sp + ' -> ' + to + ' in the whole journey');
    assert.deepEqual(plain(one.Evolution.candidates(make(one, sp, lvl, extra), o)), [], sp + ': none in Generation 1');
  }
  // Evolutions inside the generation stay: Eevee with a Water Stone, Charmeleon at 36.
  assert.deepEqual(plain(one.Evolution.candidates(make(one, 133, 20), { trigger: 'item', item: 'water-stone' })), [134]);
  assert.deepEqual(plain(one.Evolution.candidates(make(one, 5, 36), { trigger: 'level' })), [6]);
});

test('Generation 1: the Indigo Plateau\'s way down to Johto is closed (a locked door that says why); the whole journey goes', async () => {
  const files = ['js/content/kanto/league.js', 'js/content/johto/victoryroad.js'];
  {
    const { G, W, said } = world(1, files);
    W.debug.noEnc = true;
    W.load('indigo', 'johto-cave-door');
    assert.equal(W.tryStep(W.player, 'up', 4), 'blocked');
    for (let i = 0; i < 10; i++) await tick();
    assert.equal(W.map.id, 'indigo');
    assert.deepEqual(plain(said), ['This road leads to another region. In this game the journey stays in Kanto.']);
    // The plateau's other doors stay open (the lobby, Kanto's Victory Road).
    const w = G.Maps.get('indigo').warps.map(x => G.Maps.get('indigo').warpAt.get(G.Maps.key(x.x, x.y)));
    assert.deepEqual(plain(w.map(x => [x.to, !!x.locked])), [['indigo-lobby', false], ['victory-2f', false], ['johto-victory-2f', true]]);
  }
  {
    const { W, said } = world(0, files);
    W.debug.noEnc = true;
    W.load('indigo', 'johto-cave-door');
    assert.equal(W.tryStep(W.player, 'up', 4), 'moved');
    W.player.update(1); W.arrived(W.player);
    for (let i = 0; i < 200 && W.map.id !== 'johto-victory-2f'; i++) { W.update(0.05); await tick(); }
    assert.equal(W.map.id, 'johto-victory-2f', 'down to Johto in the whole journey');
    assert.deepEqual(plain(said), []);
  }
});

test('Generation 1: its last chapter (10) ends the game; other chapters as before', () => {
  const ctx = boot(CORE.concat(DATA, ['js/ui/credits-ui.js']));
  const G = ctx.G;
  const before = plain(G.CreditsUI.text(10, 'Red'));
  assert.match(before.next, /next region/);
  G.Gen.set(1);
  const after = plain(G.CreditsUI.text(10, 'Red'));
  assert.equal(after.title, before.title);
  assert.equal(after.next, 'The journey of Generation 1 · Kanto is complete! The other games have pages of their own: choose Generations on the title screen.');
  assert.deepEqual(plain(G.CreditsUI.text(9, 'Red')), plain((G.Gen.set(0), G.CreditsUI.text(9, 'Red'))));
});
