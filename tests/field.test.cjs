// The overworld's rules without a screen (field.js): boulders and Strength, pits, gates, fast
// water, fishing, trainers who see across water, Johto's clock, obedience and Egg, Headbutt, the Day Care,
// the Bug-Catching Contest, Morty's floor of darkness, berry trees, Pryce's ice, waterfalls, whirlpools (the Whirl Islands),
// cracked rocks and Apricorn trees (the Dark Cave, Azalea Town), the stone panels and Unown of the Ruins of Alph, breeding and Eggs,
// the way to Mt. Silver,
// and the real Ice Path and Clair's Gym.
// Test maps are defined here (the last test loads the chapter 18 maps); the drawing, the dialog box and the camera are stand-ins.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, plain, CORE, DATA, BATTLE } = require('./helpers.cjs');

const FILES = CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/player.js', 'js/world/field.js', 'js/world/daycare.js', 'js/world/contest.js', 'js/script/script.js']);

function el() {
  return { classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, appendChild() {}, style: {}, offsetWidth: 0 };
}

function world(extra = []) {
  const ctx = boot(FILES.concat(extra));
  const G = ctx.G;
  let now = 0;
  ctx.performance.now = () => now;
  ctx.setTimeout = f => { setImmediate(f); return 0; };
  ctx.requestAnimationFrame = f => setImmediate(() => { now += 50; f(); });     // fades run in a few frames
  ctx.document = { getElementById: () => el(), createElement: () => el() };
  Object.assign(G, {
    WorldRender: { prepare() {}, draw() {} },
    Camera: { snap() {}, fitRoom() {}, w: 480, h: 320, scale: 1, left: () => 0, top: () => 0 },
    Audio: { sfx() {}, music() {}, jingle: () => Promise.resolve() },
    Dialog: { open: false, tick() {}, say: () => Promise.resolve(), ask: () => Promise.resolve(0) },
    UI: { toast() {}, anyOpen: () => false, closeAll() {} },
    Settings: { get: () => false, on() {} },
    Input: { clicks: () => [] },
    Btn: { dir4: () => null, pressed: () => false, held: () => false }
  });
  G.Field.save.player.badges = [1, 2, 3, 4, 5];
  return { G, W: G.World, later: ms => { now += ms; } };
}

/** One step of the player: -> what tryStep said; a step that moved is finished and arrives. */
function step(W, dir) {
  const me = W.player;
  const r = W.tryStep(me, dir, 4);
  if (r === 'moved') { me.update(1); W.arrived(me); }
  return r;
}
const tick = () => new Promise(r => setImmediate(r));
/** Runs the world (emotes, scripted steps) until a promise settles. */
async function pump(W, p) {
  let done = false;
  Promise.resolve(p).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++) { W.update(0.1); await tick(); }
  assert.ok(done, 'it finished');
}

test('boulders: Strength pushes them, a pit swallows one for good, and the pit is floor from then on', async () => {
  const { G, W, later } = world();
  G.Maps.def({ id: 't-rock', tileset: 'outdoor', palette: 'cave', border: '#', cave: true,
    rows: ['#########', '#.......#', '#...o...#', '#.......#', '#########'],
    warps: [{ x: 4, y: 2, to: 't-below', spot: 'drop' }],
    spots: { start: [1, 2, 'right'] },
    boulders: [{ id: 'b1', x: 3, y: 2 }] });
  G.Maps.def({ id: 't-below', tileset: 'outdoor', palette: 'cave', border: '#',
    rows: ['#####', '#...#', '#####'], spots: { drop: [2, 1, 'down'] },
    boulders: [{ id: 'fell', x: 1, y: 1, if: 'pit:t-rock:4,2', fixed: true }] });
  assert.deepEqual(plain(G.Maps.validate('t-rock')), []);
  assert.deepEqual(plain(G.Maps.validate('t-below')), []);
  G.Field.giveMon('machop', 30, { moves: ['strength', 'low-kick'] });
  W.load('t-rock', 'start');
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(step(W, 'right'), 'blocked', 'a boulder blocks without Strength');
  assert.equal(W.rocks[0].x, 3);
  W.strength = true;
  later(1000);
  assert.equal(step(W, 'right'), 'blocked', 'pushing does not move the player');
  assert.ok(G.Field.flag('rock:t-rock:b1') && G.Field.flag('pit:t-rock:4,2'), 'the boulder fell into the pit');
  assert.ok(W.pitFilled(4, 2));
  // Back on the map: the boulder is gone, and the filled pit no longer drops you.
  W.load('t-rock', 'start');
  assert.equal(W.rocks.length, 0);
  assert.ok(!W.strength, 'Strength wears off when you leave the map');
  for (let i = 0; i < 3; i++) assert.equal(step(W, 'right'), 'moved');
  assert.equal(W.map.id, 't-rock', 'no fall through a filled pit');
  // Downstairs the boulder has landed.
  W.load('t-below', 'drop');
  assert.equal(W.rocks.length, 1);
  assert.ok(W.rocks[0].fixed);
});

test('boulders stop at walls and other boulders; an open pit drops the player', async () => {
  const { G, W, later } = world();
  G.Maps.def({ id: 't-rock2', tileset: 'outdoor', palette: 'cave', border: '#',
    rows: ['#######', '#.....#', '#.....#', '#....o#', '#######'],
    warps: [{ x: 5, y: 3, to: 't-rock2', spot: 'start' }],
    spots: { start: [1, 1, 'right'] },
    boulders: [{ id: 'a', x: 4, y: 1 }, { id: 'b', x: 2, y: 2 }, { id: 'c', x: 2, y: 3 }] });
  assert.deepEqual(plain(G.Maps.validate('t-rock2')), []);
  W.load('t-rock2', 'start');
  W.strength = true;
  later(1000);
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(step(W, 'right'), 'blocked');
  assert.equal(W.rocks.find(r => r.id === 'a').x, 5, 'pushed once');
  later(1000);
  step(W, 'right');
  assert.equal(W.rocks.find(r => r.id === 'a').x, 5, 'a wall stops it');
  // A boulder against a boulder does not move.
  W.load('t-rock2', { x: 2, y: 1, dir: 'down' });
  W.strength = true;
  later(1000);
  step(W, 'down');
  assert.equal(W.rocks.find(r => r.id === 'b').y, 2);
  // Walking onto an open pit: down to where its warp goes.
  W.load('t-rock2', { x: 5, y: 2, dir: 'down' });
  step(W, 'down');
  for (let i = 0; i < 50 && W.player.x !== 1; i++) await tick();
  assert.deepEqual([W.player.x, W.player.y], [1, 1], 'fell and landed on the spot');
});

test('gates open while their rule holds; fast water is solid until the map is calm', () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-gate', tileset: 'indoor', palette: 'mansion',
    rows: ['WWWWW', '+y+++', '+++++'], spots: { start: [0, 1, 'right'] },
    bars: [{ x: 1, y: 1, if: 't-switch' }] });
  assert.deepEqual(plain(G.Maps.validate('t-gate')), []);
  W.load('t-gate', 'start');
  assert.equal(step(W, 'right'), 'blocked');
  G.Field.setFlag('t-switch');
  assert.equal(step(W, 'right'), 'moved');
  G.Maps.def({ id: 't-sea', tileset: 'outdoor', palette: 'seafoam', border: '#',
    rows: ['#####', '#.~r#', '#####'], spots: { start: [1, 1, 'right'] }, calm: 't-calm' });
  assert.deepEqual(plain(G.Maps.validate('t-sea')), []);
  W.load('t-sea', 'start');
  assert.ok(W.isWater(2, 1) && !W.isWater(3, 1), 'rapids are not water yet');
  G.Field.setFlag('t-calm');
  assert.ok(W.isWater(3, 1), 'calm rapids can be surfed');
});

test('a double-battle pair of two classes (partner: { cls, name }, chapter 76): named after both, their prizes add up', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-pair', tileset: 'indoor', palette: 'house',
    rows: ['WWWWWWW', '_______', '_______'], spots: { start: [1, 2, 'up'] },
    trainers: [
      { id: 'rk', who: 'gentleman', cls: 'rich-boy', name: 'Roman', x: 1, y: 1, dir: 'down', sight: 0, double: true,
        partner: { who: 'lady', cls: 'lady', name: 'Kylie', x: 2, y: 1 }, team: [['lickitung', 26], ['cleffa', 24]], before: 'Hi!', defeat: 'Oh.' },
      { id: 'jp', who: 'cooltrainer', cls: 'double-team', name: 'Jo & Pat', x: 4, y: 1, dir: 'down', sight: 0, double: true,
        partner: { who: 'cooltrainerm', x: 5, y: 1 }, team: [['lumineon', 50], ['rapidash', 50]], before: 'Hi!', defeat: 'Oh.' }
    ] });
  assert.deepEqual(plain(G.Maps.validate('t-pair')), []);
  G.Field.giveMon('squirtle', 30);
  G.Field.giveMon('pidgey', 30);
  const got = [];
  G.BattleUI = { trainer: async (me, t) => { got.push(t); return 'win'; } };
  W.load('t-pair', 'start');
  await pump(W, W.interact());
  assert.equal(got[0].name, 'Rich Boy Roman & Lady Kylie');
  assert.equal(got[0].title, '');
  assert.equal(got[0].prize, G.TRAINER_CLASSES['rich-boy'].prize + G.TRAINER_CLASSES.lady.prize, 'the two prizes');
  // A partner without a class of their own: as before.
  W.load('t-pair', { x: 4, y: 2, dir: 'up' });
  await pump(W, W.interact());
  assert.deepEqual([got[1].title, got[1].name, got[1].prize], ['Double Team', 'Jo & Pat', G.TRAINER_CLASSES['double-team'].prize]);
  // An unknown partner class, or a name without a class, is an error.
  G.Maps.def({ id: 't-pair2', tileset: 'indoor', palette: 'house', rows: ['WWWWWWW', '_______'], spots: { a: [0, 1, 'up'] },
    trainers: [
      { id: 'a', who: 'lass', cls: 'lass', name: 'A', x: 1, y: 1, sight: 0, double: true, partner: { who: 'lass', cls: 'nope', name: 'B', x: 2, y: 1 }, team: [['pichu', 5], ['pichu', 5]] },
      { id: 'c', who: 'lass', cls: 'lass', name: 'C', x: 4, y: 1, sight: 0, double: true, partner: { who: 'lass', name: 'D', x: 5, y: 1 }, team: [['pichu', 5], ['pichu', 5]] }
    ] });
  const e = G.Maps.validate('t-pair2');
  assert.ok(e.some(x => /unknown partner class "nope"/.test(x)) && e.some(x => /the partner has a name but no class/.test(x)), e.join('; '));
});

test('a map that changes with a flag (changes, chapter 75): both versions, the same size, standing on new water is surfing', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-lake', tileset: 'outdoor', palette: 'kanto', border: 'T',
    rows: ['TTTTTT', 'T....T', 'T.::.T', 'TTTTTT'], spots: { start: [1, 1, 'right'] },
    npcs: [{ id: 'karp', who: 'magikarp', mon: 'magikarp', x: 2, y: 2, dir: 'down', fixed: true, say: 'Flop.' }],
    changes: { if: 't-full', rows: ['TTTTTT', 'T....T', 'T.~~.T', 'TTTTTT'], npcs: [] } });
  assert.deepEqual(plain(G.Maps.validate('t-lake')), []);
  let m = G.Maps.get('t-lake');
  assert.ok(!m.changed && G.Maps.kindAt(m, 2, 2) === 'sand' && m.npcs.length === 1, 'as it was');
  G.Field.setFlag('t-full');
  m = G.Maps.get('t-lake');
  assert.ok(m.changed && m.id === 't-lake' && G.Maps.kindAt(m, 2, 2) === 'water' && m.npcs.length === 0, 'changed');
  assert.equal(G.Maps.get('t-lake'), m, 'cached');
  assert.ok(!G.Maps.get('t-lake', { changed: false }).changed && G.Maps.get('t-lake', { changed: true }) === m, 'either version when asked');
  // Standing where the bed was (a save made there): surfing.
  W.load('t-lake', { x: 2, y: 2, dir: 'down' });
  assert.ok(W.surfing && W.map.changed);
  G.Field.clearFlag('t-full');
  W.load('t-lake', { x: 2, y: 2, dir: 'down' });
  assert.ok(!W.surfing && !W.map.changed);
  // A changed map of another size, or without its `if`, is an error.
  G.Maps.def({ id: 't-bad', tileset: 'outdoor', palette: 'kanto', border: 'T', rows: ['TTT', 'T.T', 'TTT'], spots: { a: [1, 1, 'down'] },
    changes: { rows: ['TTTT', 'T..T', 'TTTT'] } });
  const e = G.Maps.validate('t-bad');
  assert.ok(e.some(x => /needs an `if`/.test(x)) && e.some(x => /changed map is 4×3, not 3×3/.test(x)), e.join('; '));
});

test('fishing: a rod at the water rolls its own table; the Bag cannot fish away from water', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-pond', tileset: 'outdoor', palette: 'kanto',
    rows: ['TTTTT', 'T..~T', 'TTTTT'], spots: { start: [2, 1, 'right'], away: [1, 1, 'left'] },
    encounters: { water: '@kanto-sea-route-19-area' } });
  assert.deepEqual(plain(G.Maps.validate('t-pond')), []);
  assert.ok(G.Maps.encounters(G.Maps.get('t-pond'), 'good-rod'), 'the water area gives the rod tables');
  G.Field.giveMon('squirtle', 20);
  G.Field.giveItem('old-rod');
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push(info); return 'run'; };
  W.load('t-pond', 'away');
  assert.equal(W.fish('old-rod'), false, 'no water in front');
  W.load('t-pond', 'start');
  W.seed(5);
  for (let i = 0; i < 12 && !got.length; i++) await pump(W, W.fish('old-rod'));
  assert.ok(got.length, 'something bit');
  assert.equal(got[0].method, 'old-rod');
  assert.equal(G.Maps.species(got[0].sp), 129, 'the Old Rod brings Magikarp');
  assert.equal(W.bestRod(), 'old-rod');
});

test('swimmers stand in the water, and a trainer sees a surfer across it', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-bay', tileset: 'outdoor', palette: 'kanto', border: '~',
    rows: ['~~~~~~', '.~~~~~', '~~~~~~'], spots: { start: [0, 1, 'right'] },
    trainers: [{ id: 'sam', who: 'swimmer', cls: 'swimmer', name: 'Sam', x: 4, y: 1, dir: 'left', sight: 4, swim: true,
                 team: [['tentacool', 20]], before: 'Hi!', defeat: 'Oh.' }] });
  assert.deepEqual(plain(G.Maps.validate('t-bay')), []);
  G.Maps.def({ id: 't-bay2', tileset: 'outdoor', palette: 'kanto', border: '~',
    rows: ['~~~', '...'], spots: { start: [0, 1, 'up'] },
    trainers: [{ id: 'bad', who: 'swimmer', x: 1, y: 1, dir: 'up', sight: 1, swim: true, team: [['tentacool', 20]] }] });
  assert.ok(G.Maps.validate('t-bay2').some(e => /swims on a grass tile/.test(e)), 'a swimmer must be in the water');
  G.Field.giveMon('squirtle', 30, { moves: ['surf'] });
  const seen = [];
  W.onTrainer = async d => { seen.push(d.id); return 'win'; };
  W.load('t-bay', 'start');
  assert.equal(W.tryStep(W.player, 'right', 4), 'blocked', 'water is solid while walking');
  // Surfing (the save remembers it): Sam is three tiles of water away and spots you.
  G.Field.save.player.surf = 1;
  W.load('t-bay', { x: 1, y: 1, dir: 'right' });
  assert.ok(W.surfing, 'on the water: surfing');
  W.arrived(W.player);
  for (let i = 0; i < 200 && !seen.length; i++) { W.update(0.1); await tick(); }
  assert.deepEqual(seen, ['sam']);
  const sam = W.actors.find(a => a.id === 'sam');
  assert.deepEqual([sam.x, sam.y], [2, 1], 'he swam up to the player');
});

test('the Bicycle: outdoors only, faster than running; Cycling Road keeps you on it and rolls you downhill', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-out', tileset: 'outdoor', palette: 'kanto', rows: ['TTTTT', 'T...T', 'TTTTT'], spots: { start: [1, 1, 'right'] } });
  G.Maps.def({ id: 't-in', tileset: 'indoor', rows: ['WWWW', '++++', '++++'], spots: { start: [0, 1, 'right'] } });
  G.Maps.def({ id: 't-road', tileset: 'outdoor', palette: 'kanto', bike: true, slope: 'down',
    rows: ['TTTTT', 'T...T', 'T...T', 'T...T', 'TTTTT'], spots: { top: [2, 1, 'down'] } });
  for (const id of ['t-out', 't-in', 't-road']) assert.deepEqual(plain(G.Maps.validate(id)), [], id);
  G.Field.giveMon('pidgey', 10);
  W.load('t-out', 'start');
  W.toggleBike();
  assert.ok(!W.biking, 'no Bicycle, no ride');
  G.Field.giveItem('bicycle');
  W.toggleBike();
  assert.ok(W.biking && W.player.bike, 'on the Bicycle');
  assert.equal(G.Field.save.player.bike, 1, 'the save remembers it');
  assert.equal(G.Store.sanitize(JSON.parse(JSON.stringify(G.Field.save))).player.bike, 1, 'and keeps it when loaded');
  // Indoors you walk; the Bicycle stays folded when you come out again.
  W.load('t-in', 'start');
  assert.ok(!W.biking && !G.Field.save.player.bike, 'off the Bicycle indoors');
  await pump(W, W.toggleBike());
  assert.ok(!W.biking, "can't ride indoors");
  W.load('t-out', 'start');
  assert.ok(!W.biking);
  // Cycling Road: on the Bicycle from the gate on, and no getting off.
  W.load('t-road', 'top');
  assert.ok(W.biking, 'Cycling Road puts you on the Bicycle');
  await pump(W, W.toggleBike());
  assert.ok(W.biking, "can't get off on Cycling Road");
  assert.equal(W.slope(), 'down');
  // Letting go on the slope: you roll downhill, fast, until something stops you.
  const me = W.player;
  G.Player.reset();
  G.Player.update(0.02, me, W);
  assert.ok(me.moving && me.dir === 'down', 'rolling down');
  assert.ok(Math.abs(me.dur - 1 / G.Player.BIKE) < 1e-9, 'at Bicycle speed');
  for (let i = 0; i < 6; i++) G.Player.update(0.5, me, W);
  assert.deepEqual([me.x, me.y], [2, 3], 'stopped at the trees');
  assert.equal(W.tryStep(me, 'up', 4), 'moved', 'you can still ride uphill');
});

test('Fly: towns you have visited (or that an older save had reached) are places to fly to', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-town1', tileset: 'outdoor', palette: 'kanto', fly: { spot: 'center', if: 'badge:1' },
    rows: ['TTTTT', 'T...T', 'TTTTT'], spots: { center: [3, 1, 'down'] } });
  G.Maps.def({ id: 't-town2', tileset: 'outdoor', palette: 'kanto', fly: { spot: 'center' },
    rows: ['TTTTT', 'T...T', 'TTTTT'], spots: { center: [1, 1, 'down'] } });
  G.Maps.def({ id: 't-cave', tileset: 'outdoor', palette: 'cave', cave: true, border: '#', rows: ['###', '#.#', '###'], spots: { start: [1, 1, 'down'] } });
  G.Maps.def({ id: 't-bad', tileset: 'outdoor', fly: { spot: 'nowhere' }, rows: ['TTT', 'T.T', 'TTT'], spots: { start: [1, 1, 'down'] } });
  assert.deepEqual(plain(G.Maps.validate('t-town1')), []);
  assert.ok(G.Maps.validate('t-bad').some(e => /fly: no spot/.test(e)), 'a landing spot must exist');
  G.Field.giveMon('pidgeotto', 30, { moves: ['fly', 'gust'] });
  const ids = W.flyTargets().map(t => t.id);
  assert.ok(ids.includes('t-town1') && ids.includes('t-town2'));
  assert.ok(W.visited('t-town1'), 'the Boulder Badge says you have been to this town');
  assert.ok(!W.visited('t-town2'));
  W.load('t-town2', 'center');
  assert.ok(W.visited('t-town2') && G.Field.flag('visited:t-town2'), 'arriving makes it a destination');
  assert.equal(W.flyBlock(), null);
  assert.ok(W.flier(), 'Pidgeotto can fly');
  G.Field.save.player.badges = [1, 2];
  assert.equal(W.flyBlock(), 'badge', 'Fly needs the Thunder Badge');
  assert.equal(W.flier(), null);
  assert.equal(W.teleportBlock(), null, 'teleporting from the Town Map needs no badge and no Pokémon');
  G.Field.save.player.badges = [1, 2, 3];
  W.load('t-cave', 'start');
  assert.equal(W.flyBlock(), 'here', 'not from a cave');
  assert.equal(W.teleportBlock(), 'here', 'no teleporting from a cave either');
  assert.equal(await W.flyTo('t-bad'), false, 'only to towns you have visited');
  await pump(W, W.flyTo('t-town1'));
  assert.equal(W.map.id, 't-town1');
  assert.deepEqual([W.player.x, W.player.y], [3, 1], 'landed on the spot');
});

test('floor switches: a boulder pushed onto one stays there for good and opens the rock barrier', () => {
  const { G, W, later } = world();
  G.Maps.def({ id: 't-plate', tileset: 'outdoor', palette: 'cave', border: '#', cave: true,
    rows: ['#######', '#.....#', '#....x#', '###b###', '#.....#', '#######'],
    spots: { start: [1, 2, 'right'] },
    boulders: [{ id: 'r', x: 2, y: 2 }],
    bars: [{ x: 3, y: 3, if: 'plate:t-plate:5,2' }] });
  assert.deepEqual(plain(G.Maps.validate('t-plate')), []);
  W.load('t-plate', { x: 3, y: 2, dir: 'down' });
  assert.equal(W.tryStep(W.player, 'down', 4), 'blocked', 'the rock barrier is closed');
  W.load('t-plate', 'start');
  W.strength = true;
  for (let i = 0; i < 3; i++) {
    later(1000);
    assert.equal(step(W, 'right'), 'blocked', 'a push');
    if (i < 2) assert.equal(step(W, 'right'), 'moved');
  }
  assert.ok(G.Field.flag('plate:t-plate:5,2'), 'the boulder is on the switch');
  assert.ok(W.rocks[0].fixed, 'and it stays there');
  assert.ok(W.barsOpen(3, 3), 'the barrier is open');
  W.load('t-plate', { x: 3, y: 2, dir: 'down' });
  assert.equal(W.tryStep(W.player, 'down', 4), 'moved', 'through the opened barrier');
  // Leaving and coming back: the boulder still sits on the switch, fixed.
  W.load('t-plate', 'start');
  assert.deepEqual([W.rocks[0].x, W.rocks[0].y, W.rocks[0].fixed], [5, 2, true]);
});

test("Johto: the clock picks the wild Pokémon, the badges set who obeys, walking hatches the Egg", async () => {
  const { G, W } = world();
  const F = G.Field, S = F.save;
  G.Maps.def({ id: 't-johto', region: 'johto', tileset: 'outdoor', palette: 'kanto',
    rows: ['TTTTTTTTT', 'T"""""""T', 'TTTTTTTTT'], spots: { start: [1, 1, 'right'] },
    encounters: { walk: { rate: 180, mons: [[16, 3, 3, 100]], night: [[163, 3, 3, 100]] } } });
  assert.deepEqual(plain(G.Maps.validate('t-johto')), []);
  F.giveMon('cyndaquil', 30);
  const got = [];
  W.onEncounter = async sp => { got.push(G.Maps.species(sp)); return 'run'; };
  const walk = async () => {
    got.length = 0;
    W.load('t-johto', 'start');
    await pump(W, (async () => { for (let i = 0; i < 6 && !got.length; i++) { step(W, i % 2 ? 'left' : 'right'); await tick(); } })());
    return got[0];
  };
  G.Clock.set('day');
  assert.equal(await walk(), 16, 'Pidgey by day');
  G.Clock.set('night');
  assert.equal(await walk(), 163, 'Hoothoot at night');
  G.Clock.set(null);
  // Obedience: none in Kanto, and in Johto only once the journey there began.
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8];
  assert.equal(F.obeyCap('johto'), null);
  F.setFlag('johto-start');
  assert.equal(F.obeyCap('johto'), 20);
  assert.equal(F.obeyCap('kanto'), null);
  S.player.badges.push(9, 10);
  assert.equal(F.obeyCap('johto'), 30, 'two Johto badges: Lv. 30');
  // The Egg: egg-steps counts down on each step, and runs egg.hatch at 0.
  let hatched = 0;
  G.Script.def({ 'egg.hatch': [['js', () => { hatched++; }]] });
  G.Maps.def({ id: 't-path', region: 'johto', tileset: 'outdoor', palette: 'kanto',
    rows: ['TTTTTTTTT', 'T.......T', 'TTTTTTTTT'], spots: { start: [1, 1, 'right'] } });
  W.load('t-path', 'start');
  S.vars['egg-steps'] = 3;
  for (let i = 0; i < 3; i++) step(W, 'right');
  await pump(W, tick());
  assert.equal(S.vars['egg-steps'], 0);
  assert.equal(hatched, 1, 'the Egg hatched once');
  step(W, 'right');
  assert.equal(hatched, 1);
});

test('Headbutt: a Pokémon that knows it shakes a tree, and sometimes a wild Pokémon falls out', async () => {
  const { G, W } = world();
  const F = G.Field;
  G.Maps.def({ id: 't-head', region: 'johto', tileset: 'outdoor', palette: 'kanto',
    rows: ['TTTTT', 'T.h.T', 'TTTTT'], spots: { start: [1, 1, 'right'] },
    encounters: { walk: { rate: 1, mons: [[16, 3, 3, 100]] }, headbutt: { rate: 1, mons: [[163, 5, 5, 60], [204, 6, 6, 40]] } } });
  assert.deepEqual(plain(G.Maps.validate('t-head')), []);
  assert.equal(G.Maps.get('t-head').kind[1 * 5 + 2], 'headtree');
  // A real area: Route 34 finds its trees' table in its walking area.
  assert.ok(G.Maps.encounters({ encounters: { walk: '@johto-route-34-area' } }, 'headbutt').mons.length > 0);
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), info.method]); return 'run'; };
  F.giveMon('rattata', 10, { moves: ['tackle'] });
  W.load('t-head', 'start');
  await pump(W, W.interact());
  assert.equal(got.length, 0, 'no Headbutt, nothing happens');
  F.party()[0].moves.push({ id: 'headbutt', pp: 15, ppUp: 0 });
  for (let i = 0; i < 12; i++) await pump(W, W.interact());
  assert.ok(got.length > 0 && got.length < 12, 'about half the time: ' + got.length);
  assert.ok(got.every(([sp, m]) => (sp === 163 || sp === 204) && m === 'headbutt'));
  // The tutor's list: the species that can learn Headbutt.
  assert.ok(G.SPECIES[155].tu.includes('headbutt') && !G.SPECIES[129].tu);
});

test('the Day Care: up to two Pokémon grow by the step and learn their moves; taking one back costs money', async () => {
  const { G, W } = world();
  const F = G.Field, S = F.save, D = G.DayCare;
  G.Maps.def({ id: 't-walk', region: 'johto', tileset: 'outdoor', palette: 'kanto',
    rows: ['TTTTTTTTT', 'T.......T', 'TTTTTTTTT'], spots: { start: [1, 1, 'right'] } });
  F.giveMon('cyndaquil', 5);
  assert.ok(!D.canLeave(0), 'not the last Pokémon that can fight');
  assert.equal(D.deposit(0), false);
  F.giveMon('pidgey', 5);
  F.giveMon('rattata', 3);
  assert.ok(D.deposit(1) && D.deposit(1));
  assert.ok(D.full() && !D.deposit(0), 'two at most');
  assert.equal(F.party().map(m => m.sp).join(), '155');
  const [pidgey, rattata] = D.list().map(e => e.mon);
  // Walking: 1 Exp. point per step for each.
  W.load('t-walk', 'start');
  const e0 = pidgey.exp;
  for (let i = 0; i < 6; i++) step(W, i % 2 ? 'left' : 'right');
  assert.equal(pidgey.exp, e0 + 6);
  // Levels and their moves (the oldest is forgotten when it knows four).
  D.gain(pidgey, G.Stats.expAt(G.SPECIES[16].gr, 13) - pidgey.exp);
  assert.equal(pidgey.lvl, 13);
  assert.ok(G.Mon.knows(pidgey, 'quick-attack') || G.Mon.knows(pidgey, 'gust'), 'learned on the way');
  assert.ok(pidgey.moves.length <= 4);
  assert.equal(D.grown(0), 8);
  assert.equal(D.price(0), 900);
  S.player.money = 500;
  assert.equal(D.withdraw(0), 'money');
  S.player.money = 5000;
  assert.equal(D.withdraw(0), pidgey);
  assert.equal(S.player.money, 4100);
  assert.equal(pidgey.hp, G.Mon.maxHp(pidgey), 'healed');
  assert.equal(D.list().length, 1);
  assert.equal(D.list()[0].mon, rattata);
  while (F.party().length < 6) F.giveMon('rattata', 2);
  assert.equal(D.withdraw(0), 'party-full');
});

test('breeding: who can breed and how well, the first stage, egg moves from the father, IVs from both', () => {
  const { G } = world();
  const D = G.DayCare;
  const rng = G.RNG(11);
  const mk = (sp, gender, o = {}) => Object.assign(G.Mon.create(sp, 30, Object.assign({ rng }, o)), { gender }, o.extra || {});
  const ot = id => ({ ot: { name: 'X', id } });
  // Who can breed: one of each gender in an egg group they share, or Ditto with anyone (but Ditto).
  assert.ok(D.canBreed(mk(25, 'f'), mk(25, 'm')));
  assert.ok(D.canBreed(mk(25, 'f'), mk(37, 'm')), 'Pikachu and Vulpix: the Field group');
  assert.ok(!D.canBreed(mk(25, 'f'), mk(25, 'f')), 'two females');
  assert.ok(!D.canBreed(mk(25, 'f'), mk(7, 'm')), 'no group in common');
  assert.ok(D.canBreed(mk(81, null), mk(132, null)), 'Magnemite with Ditto');
  assert.ok(!D.canBreed(mk(132, null), mk(132, null)), 'two Ditto');
  assert.ok(!D.canBreed(mk(172, 'f'), mk(25, 'm')), 'a baby cannot');
  assert.ok(!D.canBreed(mk(150, null), mk(132, null)), 'nor a legend');
  // How well they get along (the games' numbers).
  assert.equal(D.compat(mk(25, 'f', ot(1)), mk(25, 'm', ot(2))), 70);
  assert.equal(D.compat(mk(25, 'f', ot(1)), mk(25, 'm', ot(1))), 50);
  assert.equal(D.compat(mk(25, 'f', ot(1)), mk(37, 'm', ot(2))), 50);
  assert.equal(D.compat(mk(25, 'f', ot(1)), mk(37, 'm', ot(1))), 20);
  assert.equal(D.compat(mk(25, 'f'), mk(7, 'm')), 0);
  // The first stage of the family, among the game's Pokémon.
  assert.deepEqual([26, 25, 184, 3, 149, 143].map(D.root).join(), '172,172,183,1,147,143');
  // The mother's species; with Ditto, the other one's; Nidoran of either gender.
  const vulpix = mk(37, 'f'), pikachu = mk(25, 'm', { moves: ['thunder-shock', 'fake-out', 'encore', 'growl'] });
  const egg = D.breed(vulpix, pikachu, G.RNG(1));
  assert.equal(egg.mon.sp, 37, 'a Vulpix');
  assert.ok(egg.steps > 0 && egg.mon.lvl === 5 && egg.mon.friendship === 120);
  const pichu = D.breed(mk(26, 'f'), mk(26, 'm', { moves: ['thunder-shock', 'encore', 'fake-out', 'thunderbolt'] }), G.RNG(2)).mon;
  assert.equal(pichu.sp, 172, 'Raichu make a Pichu');
  assert.ok(G.Mon.knows(pichu, 'encore') && G.Mon.knows(pichu, 'fake-out'), 'egg moves from the father: ' + pichu.moves.map(m => m.id));
  assert.ok(!G.Mon.knows(pichu, 'thunderbolt'), 'not a move that is no egg move');
  assert.equal(D.breed(mk(132, null), mk(81, null), G.RNG(3)).mon.sp, 81, 'with Ditto: Magnemite');
  const nido = new Set();
  for (let s = 1; s < 30; s++) nido.add(D.breed(mk(34, 'm'), mk(132, null), G.RNG(s)).mon.sp);
  assert.deepEqual([...nido].sort().join(), '29,32', 'Nidoran of either gender');
  // Three IVs come from the parents.
  const ma = mk(25, 'f', { ivs: [31, 31, 31, 31, 31, 31] }), pa = mk(25, 'm', { ivs: [30, 30, 30, 30, 30, 30] });
  for (let s = 1; s < 20; s++) {
    const iv = D.breed(ma, pa, G.RNG(s)).mon.ivs;
    assert.ok(iv.filter(v => v >= 30).length >= 3, iv.join());
  }
  // An Everstone held by the mother passes on her nature about half the time (chapter 26).
  let same = 0;
  for (let s = 1; s <= 200; s++) {
    const mom = mk(37, 'f', { nature: 'modest' }), dad = mk(37, 'm', { nature: 'adamant' });
    mom.item = 'everstone';
    if (D.breed(mom, dad, G.RNG(s)).mon.nature === 'modest') same++;
  }
  assert.ok(same > 85 && same < 130, 'Everstone ' + same + ' of 200');
  // The Odd Egg: a baby, shiny one time in eight.
  let shiny = 0;
  for (let s = 1; s <= 400; s++) { const m = D.odd(G.RNG(s)).mon; assert.ok(D.BABIES.includes(m.sp)); if (m.shiny) shiny++; }
  assert.ok(shiny > 25 && shiny < 80, 'shiny ' + shiny + ' of 400');
});

test('Eggs: two Pokémon that get along leave one at the Day Care (after the ruins); carried, it hatches as you walk', async () => {
  const { G, W } = world();
  const F = G.Field, S = F.save, D = G.DayCare;
  G.Maps.def({ id: 't-walk', region: 'johto', tileset: 'outdoor', palette: 'kanto',
    rows: ['TTTTTTTTT', 'T.......T', 'TTTTTTTTT'], spots: { start: [1, 1, 'right'] } });
  F.giveMon('cyndaquil', 30);
  const a = F.giveMon('pikachu', 20), b = F.giveMon('pikachu', 20);
  a.gender = 'f'; b.gender = 'm';
  assert.ok(D.deposit(1) && D.deposit(1));
  D.seed(4);
  W.load('t-walk', 'start');
  const walk = n => { for (let i = 0; i < n; i++) step(W, i % 2 ? 'left' : 'right'); };
  walk(2000);
  assert.ok(!D.waiting(), 'no Eggs before the Ruins of Alph are done');
  F.setFlag('ruins-done');
  for (let k = 0; k < 20 && !D.waiting(); k++) walk(128);
  assert.ok(D.waiting(), 'an Egg at the Day Care');
  const egg = D.collect();
  assert.ok(egg && egg.mon.sp === 172 && D.eggs().length === 1 && !D.waiting(), 'a Pichu Egg, carried');
  assert.equal(F.party().length, 1, 'not in the party');
  // Walking hatches it: into the party.
  egg.steps = 3;
  for (let i = 0; i < 3; i++) step(W, i % 2 ? 'left' : 'right');
  await pump(W, (async () => { for (let i = 0; i < 40 && D.eggs().length; i++) await tick(); })());
  for (let i = 0; i < 60 && F.party().length < 2; i++) { W.update(0.1); await tick(); }
  assert.equal(D.eggs().length, 0, 'hatched');
  assert.equal(F.party()[1].sp, 172);
  assert.ok(F.flag('daycare-hatched') && S.dex.caught[172], 'in the Pokédex');
  // With a full party, the PC.
  while (F.party().length < 6) F.giveMon('rattata', 2);
  D.eggs().push(D.odd(G.RNG(9)));
  D.eggs()[0].steps = 1;
  step(W, 'right');
  for (let i = 0; i < 60 && D.eggs().length; i++) { W.update(0.1); await tick(); }
  assert.equal(D.eggs().length, 0);
  assert.equal(F.party().length, 6);
  assert.ok(S.boxes.some(bx => bx.some(m => m && D.BABIES.includes(m.sp))), 'to the PC');
});

test('the Bug-Catching Contest: the entrant alone with the Sport Balls, steps that run out, a catch kept, the judging', async () => {
  const { G, W } = world();
  const F = G.Field, C = G.Contest;
  const ran = [];
  G.Script.def({ 'contest.timeup': [['js', () => { ran.push('timeup'); }]], 'contest.caught': [['js', h => { ran.push('caught'); C.keep(h.ctx.mon); }]],
                 'contest.out-of-balls': [['js', () => { ran.push('balls'); }]], 'contest.fainted': [['js', () => { ran.push('fainted'); }]] });
  G.Maps.def({ id: 't-contest', region: 'johto', tileset: 'outdoor', palette: 'kanto', contest: true,
    rows: ['TTTTTTTTT', 'T"""""""T', 'TTTTTTTTT'], spots: { start: [1, 1, 'right'] },
    encounters: { walk: { rate: 180, mons: [[123, 14, 14, 100]] } } });
  assert.deepEqual(plain(G.Maps.validate('t-contest')), []);
  F.giveMon('quilava', 25);
  F.giveMon('geodude', 20);
  assert.ok(C.begin() && C.on());
  assert.equal(C.balls(), 20);
  // A battle in the contest: only the entrant, only the Sport Balls; the catch goes to the script.
  const rng = G.RNG(4);
  let seen = null;
  W.onEncounter = async (sp, lvl, area, info) => {
    seen = info;
    info.player.bag['sport-ball'] -= 2;
    return { outcome: 'caught', mon: G.Mon.create(sp, lvl, { rng, wild: true }), toBox: false, seen: [sp] };
  };
  W.load('t-contest', 'start');
  await pump(W, (async () => { step(W, 'right'); await tick(); })());
  await pump(W, (async () => { for (let i = 0; i < 20 && !ran.length; i++) await tick(); })());
  assert.ok(seen && seen.contest, 'a contest battle');
  assert.equal(seen.player.party.length, 1, 'the entrant alone');
  assert.deepEqual(Object.keys(seen.player.bag), ['sport-ball']);
  assert.deepEqual(ran.slice(), ['caught']);
  assert.equal(C.balls(), 18, 'the balls thrown are gone');
  assert.equal(C.kept().sp, 123);
  assert.equal(F.party().length, 2, 'the catch is not in the party yet');
  // The steps: the last one ends it.
  W.onEncounter = null;
  G.Maps.get('t-contest').def.encounters.walk.rate = 0;
  F.save.contest.steps = 2;
  W.load('t-contest', 'start');
  step(W, 'right'); step(W, 'right');
  await pump(W, tick());
  assert.equal(C.steps(), 0);
  assert.ok(ran.includes('timeup'));
  // Judging: three others from the same table; a Scyther at Lv. 14 with full HP scores well.
  const res = C.judge(G.RNG(9), ['A', 'B', 'C'], [[10, 7, 8, 100]]);
  assert.equal(res.all.length, 4);
  assert.equal(res.place, 1, 'a Scyther beats three Caterpie');
  assert.ok(C.score(C.kept()) > 14 * 4);
  const mon = C.finish();
  assert.equal(mon.sp, 123);
  assert.ok(!C.on() && !F.save.contest && !F.flag('contest-on'));
});

test("Morty's Gym: off the path is darkness, and you land back at the door", async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-dark', tileset: 'indoor', palette: 'ghost',
    rows: ['WWWWW', 'WWWWW', 'aa+aa', 'a+++a', 'aaXaa'], fall: { to: 't-dark', spot: 'door' },
    warps: [{ x: 2, y: 4, to: 't-dark', spot: 'door' }], spots: { door: [2, 4, 'up'] } });
  assert.deepEqual(plain(G.Maps.validate('t-dark')), []);
  G.Maps.def({ id: 't-dark2', tileset: 'indoor', palette: 'ghost', rows: ['WWW', 'WWW', 'a+a'], spots: { s: [1, 2, 'up'] } });
  assert.ok(plain(G.Maps.validate('t-dark2')).some(e => /fall/.test(e)), 'an abyss needs a place to land');
  G.Field.giveMon('quilava', 25);
  W.load('t-dark', 'door');
  assert.equal(step(W, 'up'), 'moved');
  assert.deepEqual([W.player.x, W.player.y], [2, 3]);
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(step(W, 'right'), 'moved', 'the darkness is not a wall');
  await pump(W, (async () => { for (let i = 0; i < 30 && W.player.x !== 2; i++) await tick(); })());
  assert.deepEqual([W.player.x, W.player.y], [2, 4], 'back at the door');
});

test('berry trees: one to three berries, once a day', async () => {
  const { G, W } = world();
  const F = G.Field;
  G.Maps.def({ id: 't-berry', region: 'johto', tileset: 'outdoor', palette: 'kanto',
    rows: ['TTTTT', 'T.yyT', 'TTTTT'], spots: { start: [1, 1, 'right'] }, berries: [[3, 1, 'pecha-berry']] });
  assert.deepEqual(plain(G.Maps.validate('t-berry')), []);
  assert.equal(G.Maps.get('t-berry').kind[1 * 5 + 2], 'berrytree');
  F.giveMon('quilava', 25);
  let day = '2026-01-01';
  G.Clock.day = () => day;
  W.load('t-berry', 'start');
  await pump(W, W.interact());
  const n = F.count('oran-berry');
  assert.ok(n >= 1 && n <= 3, 'picked ' + n);
  await pump(W, W.interact());
  assert.equal(F.count('oran-berry'), n, 'nothing more today');
  day = '2026-01-02';
  await pump(W, W.interact());
  assert.ok(F.count('oran-berry') > n, 'the next day, more');
  // Berries heal like medicine (no held items yet).
  assert.equal(G.ITEM_FX['oran-berry'].heal, 10);
  assert.deepEqual(plain(G.ITEM_FX['pecha-berry'].cure), ['psn', 'tox']);
});

test('ice: you slide the way you went until something is in the way; the first floor tile stops you', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-ice', tileset: 'indoor', palette: 'ice',
    rows: ['WWWWWWW', 'WWWWWWW', '+IIIc++', '+III+++', '+++++++'], spots: { s: [0, 2, 'right'], t: [0, 3, 'right'] } });
  assert.deepEqual(plain(G.Maps.validate('t-ice')), []);
  G.Field.giveMon('quilava', 25);
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  W.load('t-ice', 's');
  step(W, 'right');
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [3, 2], 'stopped by the rock, still on the ice');
  step(W, 'down');
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [3, 4], 'slid off the ice onto the floor and stopped');
  W.load('t-ice', 't');
  step(W, 'right');
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [4, 3], 'the first floor tile stops the slide');
  assert.equal(W.player.dir, 'right', 'no spinning on ice');
});

test('waterfalls: a surfer rides down one; Waterfall, with the Rising Badge, climbs it', async () => {
  const { G, W } = world();
  G.Maps.def({ id: 't-falls', tileset: 'outdoor', palette: 'kanto', border: '#',
    rows: ['~~~~~', '##|##', '##|##', '~~~~~', '.....'], spots: { shore: [2, 4, 'up'] } });
  assert.deepEqual(plain(G.Maps.validate('t-falls')), []);
  G.Field.giveMon('feraligatr', 40, { moves: ['surf', 'waterfall'] });
  const settle = async () => { for (let i = 0; i < 80; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  G.Field.save.player.surf = 1;
  W.load('t-falls', { x: 2, y: 0, dir: 'down' });
  assert.ok(W.surfing);
  step(W, 'down');
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [2, 3], 'down the waterfall into the pool below');
  assert.ok(W.surfing, 'still on the water');
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'not up it by surfing');
  W.player.face('up');
  await pump(W, W.interact());
  assert.deepEqual([W.player.x, W.player.y], [2, 3], 'not without the Rising Badge');
  G.Field.save.player.badges.push(16);
  await pump(W, W.interact());
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [2, 0], 'Waterfall climbed it to the top');
  assert.equal(W.tryStep(W.player, 'left', 4), 'moved', 'surfing on at the top');
});

test("Route 27's falls: up them with Waterfall to the east bank, back down them by Surf alone", async () => {
  const { G, W } = world(['js/content/johto/newbark.js']);
  W.debug.noEnc = true;
  G.Field.giveMon('feraligatr', 45, { moves: ['surf', 'waterfall'] });
  G.Field.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 16];
  const settle = async () => { for (let i = 0; i < 80; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  const go = async dirs => { for (const d of dirs) { assert.equal(W.tryStep(W.player, d, 4), 'moved', d + ' from ' + W.player.x + ',' + W.player.y); W.player.update(1); W.arrived(W.player); await settle(); } };
  G.Field.save.player.surf = 1;
  W.load('route27', { x: 22, y: 7, dir: 'up' });
  assert.ok(W.surfing, 'in the pool below the falls');
  await go(['up']);
  assert.deepEqual([W.player.x, W.player.y], [22, 6]);
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'the falls stop a surfer');
  await pump(W, W.interact());
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [22, 2], 'at the top of the falls');
  await go(['right', 'right', 'right', 'right', 'right', 'right']);
  assert.ok(!W.surfing && W.player.x === 28, 'ashore on the high ground');
  // Back: from the pool above, down the falls with Surf only.
  W.load('route27', { x: 23, y: 2, dir: 'down' });
  await go(['down']);
  assert.deepEqual([W.player.x, W.player.y], [23, 6], 'down the falls into the pool below');
});

test('the Whirl Islands: Whirlpool, with the Glacier Badge, calms the whirlpool before a cave until you leave; Waterfall climbs to the chamber', async () => {
  const { G, W } = world(['js/content/johto/cianwood.js', 'js/content/johto/whirl.js']);
  W.debug.noEnc = true;
  G.Field.giveMon('lapras', 40, { moves: ['surf', 'whirlpool', 'waterfall'] });
  G.Field.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const settle = async () => { for (let i = 0; i < 80; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 200 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const go = async dirs => { for (const d of dirs) { assert.equal(W.tryStep(W.player, d, 4), 'moved', d + ' from ' + W.player.x + ',' + W.player.y); W.player.update(1); W.arrived(W.player); await settle(); } };
  G.Field.save.player.surf = 1;
  W.load('route41', { x: 10, y: 8, dir: 'up' });
  assert.ok(W.surfing);
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'the whirlpool is in the way');
  await pump(W, W.interact());
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'not calmed without the Glacier Badge');
  G.Field.save.player.badges.push(15);
  await pump(W, W.interact());
  await go(['up', 'up']);
  assert.ok(!W.surfing && W.player.y === 6, 'ashore in front of the cave');
  await go(['up']);
  await until(() => W.map.id === 'whirl-islands-nw');
  // Out again: the whirlpool is back; calmed from the sand, Surf goes on from there.
  await go(['down']);
  await until(() => W.map.id === 'route41');
  assert.deepEqual([W.player.x, W.player.y], [10, 6], 'on the sand outside');
  assert.equal(W.tryStep(W.player, 'down', 4), 'blocked', 'the whirlpool came back');
  await pump(W, W.interact());
  await pump(W, W.interact());
  await settle();
  assert.ok(W.surfing && W.player.y === 7, 'surfing on the calmed whirlpool');
  // B2F: up the falls with Waterfall to the ledge, whose ladder needs the Silver Wing.
  G.Field.save.player.badges.push(16);
  W.load('whirl-islands-b2f', { x: 19, y: 6, dir: 'up' });
  assert.ok(W.surfing);
  await pump(W, W.interact());
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [19, 3], 'at the top of the falls');
  await go(['right', 'right', 'right', 'right', 'up', 'right']);
  assert.ok(!W.surfing && W.player.x === 24 && W.player.y === 2, 'on the ledge');
  assert.equal(W.tryStep(W.player, 'right', 4), 'blocked', 'closed without the Silver Wing');
  await settle();
  G.Field.setFlag('silver-wing');
  await go(['right']);
  await until(() => W.map.id === 'whirl-islands-b3f');
});

test('the Dark Cave: Rock Smash, with the Marsh Badge, breaks a cracked rock until you leave; Apricorn trees need the Apricorn Box', async () => {
  const { G, W } = world(['js/content/johto/cherrygrove.js', 'js/content/johto/darkcave.js', 'js/content/johto/azalea.js']);
  W.debug.noEnc = true;
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), info.method]); return 'run'; };
  G.Field.giveMon('geodude', 30, { moves: ['rock-smash', 'tackle'] });
  G.Field.save.player.badges = [1, 2, 3, 4, 5];
  const settle = async () => { for (let i = 0; i < 80; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 200 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const go = async dirs => { for (const d of dirs) { assert.equal(W.tryStep(W.player, d, 4), 'moved', d + ' from ' + W.player.x + ',' + W.player.y); W.player.update(1); W.arrived(W.player); await settle(); } };
  // Into the cave from Route 31; north, a cracked rock closes the way.
  W.load('route31', { x: 13, y: 2, dir: 'up' });
  await go(['up']);
  await until(() => W.map.id === 'dark-cave-violet');
  assert.deepEqual([W.player.x, W.player.y], [4, 18], 'inside the mouth');
  await go(['left', 'left', 'up', 'up', 'up', 'up', 'up']);
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'a cracked rock');
  await pump(W, W.interact());
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'not smashed without the Marsh Badge');
  G.Field.save.player.badges.push(6);
  await pump(W, W.interact());
  await settle();
  await go(['up', 'up']);
  assert.deepEqual([W.player.x, W.player.y], [2, 11], 'through where the rock was');
  // Out and back in: the rock is there again.
  await go(['down', 'down', 'down', 'down', 'down', 'down', 'right', 'right', 'down', 'down']);
  await until(() => W.map.id === 'route31');
  await go(['up']);
  await until(() => W.map.id === 'dark-cave-violet');
  await go(['left', 'left', 'up', 'up', 'up', 'up', 'up']);
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'the rock came back');
  // Now and then a wild Pokémon was under it (the games' rock-smash table: Dunsparce, Geodude).
  for (let s = 1; s <= 40 && !got.length; s++) {
    W.load('dark-cave-violet', { x: 2, y: 13, dir: 'up' });
    W.seed(s);
    await pump(W, W.interact());
  }
  assert.ok(got.length && got[0][1] === 'rock-smash' && [206, 74].includes(got[0][0]), JSON.stringify(got));
  // An Apricorn tree in Azalea Town: nothing without the Apricorn Box, then one a day.
  W.load('azalea', { x: 4, y: 14, dir: 'up' });
  await pump(W, W.interact());
  assert.equal(G.Field.count('white-apricorn'), 0, 'no box, no Apricorn');
  G.Field.giveItem('apricorn-box', 1);
  await pump(W, W.interact());
  assert.equal(G.Field.count('white-apricorn'), 1, 'one Apricorn');
  await pump(W, W.interact());
  assert.equal(G.Field.count('white-apricorn'), 1, 'one a day');
});

test('the stone panels (G.Puzzle): a scramble on the ring, moves and swaps, solved by look-alike pieces too', () => {
  const { G } = world(['js/world/puzzle.js']);
  const P = G.Puzzle;
  const b = P.fresh(7);
  assert.deepEqual(P.fresh(7), b, 'the same seed, the same scramble');
  assert.equal(b.filter(p => p >= 0).length, 16);
  assert.ok(b.every((p, i) => p < 0 || P.RING.includes(i)), 'every piece starts on the outer ring');
  assert.ok(!P.solved(b));
  // Put each piece home, one move at a time (into an empty cell, or swapping).
  let s = b;
  for (let i = 0; i < 16; i++) {
    const from = s.indexOf(i);
    if (from !== P.home(i)) s = P.move(s, from, P.home(i));
  }
  assert.ok(P.solved(s), 'solved');
  assert.equal(P.move(s, P.RING[0], P.RING[1]) === null, s[P.RING[0]] < 0, 'an empty cell has nothing to move');
  // Two pieces that look the same (class 0) may change places.
  const same = Array.from({ length: 16 }, (_, i) => (i === 3 || i === 12 ? 0 : i + 1));
  const sw = P.move(s, P.home(3), P.home(12));
  assert.ok(!P.solved(sw) && P.solved(sw, same));
  assert.deepEqual(P.decode(P.encode(b)), b);
  assert.equal(P.decode('nonsense'), null);
});

test('the Ruins of Alph: open after chapter 23; a panel slides aside, a fossil, stairs down to Unown with letters', async () => {
  const { G, W } = world(['js/world/puzzle.js', 'js/content/johto/route36.js', 'js/content/johto/ruins.js']);
  W.debug.noEnc = true;
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), info.form]); return 'run'; };
  G.Field.giveMon('xatu', 40, { moves: ['psychic'] });
  const settle = async () => { for (let i = 0; i < 80; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 200 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const go = async dirs => { for (const d of dirs) { assert.equal(W.tryStep(W.player, d, 4), 'moved', d + ' from ' + W.player.x + ',' + W.player.y); W.player.update(1); W.arrived(W.player); await settle(); } };
  // Route 36: a researcher keeps the way south closed until Kurt has made his seven balls.
  W.load('route36', { x: 30, y: 15, dir: 'down' });
  assert.equal(W.tryStep(W.player, 'down', 4), 'blocked', 'a researcher in the way');
  G.Field.setFlag('kurt-seven');
  W.refresh();
  await go(['down', 'down', 'down']);
  await until(() => W.map.id === 'ruins-of-alph');
  assert.deepEqual([W.player.x, W.player.y], [16, 0], 'into the ruins');
  // The Ho-Oh chamber is sealed.
  W.load('ruins-of-alph', 'hooh');
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'the door of the Ho-Oh chamber');
  await settle();
  // The Kabuto chamber: the panel (no puzzle screen here: solved at once), the fossil, the stairs.
  W.load('ruins-of-alph', 'kabuto');
  await go(['up']);
  await until(() => W.map.id === 'ruins-kabuto');
  await go(['up', 'up', 'up', 'up', 'up']);
  assert.deepEqual([W.player.x, W.player.y], [4, 2], 'in front of the panel');
  await pump(W, W.interact());
  assert.ok(G.Field.flag('solved:kabuto') && G.Field.count('dome-fossil') === 1, 'solved, with a Dome Fossil');
  await go(['up']);
  await until(() => W.map.id === 'ruins-inner');
  await settle();
  assert.deepEqual([W.player.x, W.player.y], [2, 3], 'down the stairs');
  assert.equal(W.tryStep(W.player, 'right', 4), 'moved');
  await settle();
  W.player.face('up');
  W.load('ruins-inner', { x: 6, y: 3, dir: 'up' });
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked', 'the stairs of an unsolved chamber');
  await settle();
  // Unown on every step, with the letters Kabuto's panel set free.
  W.debug.noEnc = false;
  W.load('ruins-inner', 'kabuto');
  W.seed(3);
  for (let i = 0; i < 300 && got.length < 4; i++) { step(W, i % 2 ? 'left' : 'right'); await settle(); }
  assert.ok(got.length >= 4, 'met some: ' + got.length);
  assert.ok(got.every(([sp, f]) => sp === 201 && 'ABCDEFGHIJK'.includes(f)), JSON.stringify(got));
});

test("Mt. Silver: the gate's south door opens after chapter 26; Route 28 runs west to the foot of the mountain; snow at the summit", async () => {
  const { G, W } = world(['js/content/kanto/victory.js', 'js/content/kanto/silver.js']);
  W.debug.noEnc = true;
  const settle = async () => { for (let i = 0; i < 80; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 200 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  // The gate: pressing down on the middle mat leaves only once Mr. Pokémon has the Red Scale.
  W.load('route22-gate', { x: 4, y: 5, dir: 'down' });
  assert.equal(W.tryStep(W.player, 'down', 4), 'blocked', 'closed');
  await settle();
  G.Field.setFlag('got-exp-share');
  assert.equal(W.tryStep(W.player, 'down', 4), 'warped');
  await until(() => W.map.id === 'route28');
  assert.deepEqual([W.player.x, W.player.y], [26, 5], 'out of the gate on Route 28');
  // West along the road: the foot of Mt. Silver.
  W.load('route28', { x: 0, y: 7, dir: 'left' });
  assert.equal(W.tryStep(W.player, 'left', 4), 'moved');
  W.player.update(1); W.arrived(W.player);
  await until(() => W.map.id === 'mt-silver');
  assert.deepEqual([W.player.x, W.player.y], [29, 18], 'at the foot of the mountain');
  W.load('mt-silver-summit', 'mouth');
  assert.ok(W.map.def.snow && W.map.palette === 'snow', 'snow at the summit');
});

test('Hoenn (chapter 28): the S.S. Aqua to Littleroot, Professor Birch on Route 101 with a Pokémon from his bag, Route 102 closed', async () => {
  const { G, W } = world(['js/content/johto/olivine.js', 'js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('typhlosion', 60, { moves: ['flamethrower'] });              // the Champion's own team
  const until = async ok => { for (let i = 0; i < 300 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  // Olivine's pier: before Professor Oak's letter the sailor only talks.
  W.load('olivine', { x: 19, y: 29, dir: 'down' });
  await pump(W, W.interact());
  assert.equal(W.map.id, 'olivine');
  F.setFlag('hoenn-invite');
  W.interact();
  await until(() => W.map.id === 'littleroot');
  assert.deepEqual([W.player.x, W.player.y], [7, 20], "on Littleroot's pier");
  await until(() => F.flag('hoenn-arrived'));
  for (let i = 0; i < 20; i++) { W.update(0.05); await tick(); }      // the sailor's last words
  // North to Route 101: Professor Birch and the Zigzagoon. Only the Pokémon from his bag battles.
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), lvl, info.player.party.map(m => m.sp)]); return 'win'; };
  W.load('littleroot', { x: 11, y: 0, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'route101');
  assert.deepEqual([W.player.x, W.player.y], [9, 17]);
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('hoenn-start'));
  assert.deepEqual(plain(got), [[263, 2, [252]]], 'Zigzagoon Lv. 2 against Treecko alone');
  assert.equal(W.map.id, 'birch-lab');
  assert.deepEqual(plain(F.party().map(m => m.sp)), [157, 252], 'Treecko joins the team');
  assert.equal(F.obeyCap('hoenn'), 20);
  assert.equal(G.Field.save.rival3.starter, 255, 'the rival takes Torchic');
  // Oldale Town: a man sketching footprints blocks the way west to Route 102.
  W.load('oldale', { x: 2, y: 10, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked');
  // Route 103 is north of Oldale, Route 101 south.
  W.load('oldale', { x: 10, y: 0, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'route103');
  assert.deepEqual([W.player.x, W.player.y], [10, 15]);
});

test("Hoenn (chapter 29): Route 102 opens after the Pokédex, Petalburg's west gate after Wally, the woods' grunt, the road to Rustboro", async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js',
                          'js/content/hoenn/woods.js', 'js/content/hoenn/rustboro.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('mudkip', 15, { moves: ['water-gun'] });
  const until = async ok => { for (let i = 0; i < 300 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  // Oldale Town: the sketcher blocks the way west until the Pokédex records Hoenn.
  W.load('oldale', { x: 2, y: 10, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked');
  F.setFlag('hoenn-dex');
  W.load('oldale', { x: 0, y: 10, dir: 'left' });
  await cross('left', 'route102');
  assert.deepEqual([W.player.x, W.player.y], [35, 7]);
  // Route 102 west into Petalburg City; its west gate waits for the Gym visit.
  W.load('route102', { x: 0, y: 7, dir: 'left' });
  await cross('left', 'petalburg');
  assert.deepEqual([W.player.x, W.player.y], [31, 8]);
  W.load('petalburg', { x: 2, y: 8, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'the man at the west gate');
  F.setFlag('wally-caught');
  W.load('petalburg', { x: 0, y: 8, dir: 'left' });
  await cross('left', 'route104');
  assert.deepEqual([W.player.x, W.player.y], [29, 26]);
  // North through Petalburg Woods: the grunt in the narrow way stops you (a battle, then a Great Ball).
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  W.load('route104', { x: 16, y: 0, dir: 'up' });
  await cross('up', 'petalburg-woods');
  assert.deepEqual([W.player.x, W.player.y], [16, 29]);
  W.load('petalburg-woods', { x: 11, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('woods-aqua'));
  assert.deepEqual(plain(got), ['petalburg-woods:aqua-woods']);
  assert.equal(F.count('great-ball'), 1);
  W.load('petalburg-woods', { x: 6, y: 0, dir: 'up' });
  await cross('up', 'route104n');
  W.load('route104n', { x: 12, y: 0, dir: 'up' });
  await cross('up', 'rustboro');
  assert.deepEqual([W.player.x, W.player.y], [14, 29], 'in Rustboro City');
  // Devon Corporation is locked.
  W.load('rustboro', { x: 27, y: 8, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked');
});

test("Hoenn (chapter 30): the Devon Goods are stolen on the way out of Roxanne's Gym; Route 116, the tunnel, Mr. Briney's boat, Granite Cave", async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js',
                          'js/content/hoenn/woods.js', 'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('marshtomp', 20, { moves: ['water-gun', 'mud-shot'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  // Rustboro: the road east is closed; with the Stone Badge, coming out of the Gym, the Goods are stolen.
  W.load('rustboro', { x: 33, y: 9, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the road east is closed');
  F.badge(17);
  W.load('rustboro-gym', 'door');
  assert.equal(step(W, 'down'), 'warped');
  await until(() => F.flag('goods-stolen'));
  assert.equal(W.map.id, 'rustboro');
  W.load('rustboro', { x: 35, y: 9, dir: 'right' });
  await cross('right', 'route116');
  assert.deepEqual([W.player.x, W.player.y], [0, 6]);
  // The tunnel: walking up to the grunt starts the battle; the Goods and Peeko come back.
  W.load('rusturf-tunnel', { x: 14, y: 4, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await until(() => F.flag('peeko-saved'));
  assert.deepEqual(plain(got), ['rusturf-tunnel:aqua-tunnel']);
  assert.ok(F.flag('goods-recovered') && F.count('devon-goods') === 1);
  // Devon's door is open now.
  W.load('rustboro', { x: 27, y: 8, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'devon-1f');
  // Mr. Briney's boat: Route 104 to Dewford Town and back.
  W.load('briney-house', { x: 6, y: 4, dir: 'right' });
  W.interact();
  await until(() => W.map.id === 'dewford');
  assert.deepEqual([W.player.x, W.player.y], [20, 20], "on Dewford's pier");
  for (let i = 0; i < 30; i++) { W.update(0.05); await tick(); }
  W.load('dewford', { x: 21, y: 20, dir: 'down' });
  W.interact();
  await until(() => W.map.id === 'route104');
  assert.deepEqual([W.player.x, W.player.y], [9, 30]);
  // Dewford's west road is Route 106; Granite Cave is in its cliff, its ladder goes down into the dark.
  W.load('dewford', { x: 0, y: 9, dir: 'left' });
  await cross('left', 'route106');
  assert.deepEqual([W.player.x, W.player.y], [29, 3]);
  W.load('route106', { x: 4, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'granite-cave-1f');
  assert.ok(G.Maps.get('granite-cave-b1f').def.dark, 'B1F is dark');
});

test('Hoenn (chapter 31): the boat to Slateport, Team Aqua in the museum, Route 110 to Mauville, Wally outside the Gym', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('marshtomp', 26, { moves: ['water-gun', 'mud-shot'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  // Mr. Briney's menu: Slateport only once you have been to Dewford.
  F.setFlag('goods-stolen'); F.setFlag('peeko-saved');
  const asked = [];
  G.Dialog.ask = (t, o) => { asked.push(plain(o.options || [])); return Promise.resolve(asked.length === 1 ? 1 : 1); };
  W.load('briney-house', { x: 6, y: 4, dir: 'right' });
  W.interact();
  await until(() => asked.length === 1);
  assert.deepEqual(asked[0], ['Dewford Town', 'Cancel'], 'before Dewford: only Dewford');
  for (let i = 0; i < 20; i++) { W.update(0.05); await tick(); }
  W.load('dewford', { x: 20, y: 20, dir: 'up' });                        // arriving makes it visited
  W.load('briney-house', { x: 6, y: 4, dir: 'right' });
  W.interact();
  await until(() => W.map.id === 'slateport');
  assert.deepEqual(asked[1], ['Dewford Town', 'Slateport City', 'Cancel']);
  assert.deepEqual([W.player.x, W.player.y], [20, 28], "on Slateport's pier");
  G.Dialog.ask = () => Promise.resolve(0);
  for (let i = 0; i < 30; i++) { W.update(0.05); await tick(); }
  // The museum: up the stairs with the Devon Goods, two grunts, then Archie.
  F.giveItem('devon-goods', 1);
  W.load('museum-1f', { x: 10, y: 3, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('goods-delivered'));
  assert.deepEqual(plain(got), ['museum-2f:aqua-museum-1', 'museum-2f:aqua-museum-2']);
  assert.equal(F.count('devon-goods'), 0);
  // North along Route 110 to Mauville City.
  W.load('slateport', { x: 16, y: 0, dir: 'up' });
  await cross('up', 'route110');
  assert.deepEqual([W.player.x, W.player.y], [11, 39]);
  W.load('route110', { x: 11, y: 0, dir: 'up' });
  await cross('up', 'mauville');
  assert.deepEqual([W.player.x, W.player.y], [15, 23]);
  // Wally and his uncle wait outside the Gym once you hold the Knuckle Badge.
  F.badge(17); F.badge(18);
  W.load('mauville', { x: 15, y: 12, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('wally-battle'));
  assert.equal(got[got.length - 1], 'mauville:wally-mauville');
});

test('Hoenn (chapter 32): Routes 111 and 112, Meteor Falls, the cable car, Maxie on Mt. Chimney, the Jagged Pass to Lavaridge', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('marshtomp', 30, { moves: ['water-gun', 'mud-shot'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // North out of Mauville onto Route 111, then west onto Route 112.
  W.load('mauville', { x: 28, y: 0, dir: 'up' });
  await cross('up', 'route111');
  assert.deepEqual([W.player.x, W.player.y], [10, 31]);
  W.load('route111', { x: 0, y: 14, dir: 'left' });
  await cross('left', 'route112');
  assert.deepEqual([W.player.x, W.player.y], [35, 14]);
  // The ledge down from Lavaridge cannot be climbed from Route 112.
  W.load('route112', { x: 3, y: 10, dir: 'left' });
  assert.notEqual(step(W, 'left'), 'moved', 'up the ledge');
  // Team Magma's grunts stand in front of the cable car's door.
  W.load('route112', { x: 15, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'a grunt is in the way');
  // Meteor Falls: Team Magma takes the meteorite as you come in.
  W.load('meteor-falls', { x: 21, y: 13, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('meteorite-stolen'));
  await settle();
  // The grunts are gone: up the cable car.
  W.load('route112', { x: 15, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'cable-car-112');
  W.load('cable-car-112', { x: 5, y: 4, dir: 'up' });
  W.interact();
  await until(() => W.map.id === 'cable-car-top');
  await settle();
  // Mt. Chimney: Tabitha, then Maxie, once you step up toward the crater.
  W.load('mt-chimney', { x: 13, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('maxie-beaten'));
  await until(() => F.count('meteorite') === 1);
  assert.deepEqual(plain(got.slice(-2)), ['mt-chimney:tabitha', 'mt-chimney:maxie-chimney']);
  await settle();
  // Down the Jagged Pass: its ledges go one way.
  W.load('mt-chimney', { x: 14, y: 21, dir: 'down' });
  await cross('down', 'jagged-pass');
  assert.deepEqual([W.player.x, W.player.y], [9, 0]);
  W.load('jagged-pass', { x: 9, y: 8, dir: 'down' });
  assert.equal(step(W, 'down'), 'moved', 'down the ledge');
  await settle();
  assert.equal(W.player.y, 10);
  assert.notEqual(step(W, 'up'), 'moved', 'no way back up');
  W.load('jagged-pass', { x: 9, y: 29, dir: 'down' });
  await cross('down', 'lavaridge');
  assert.deepEqual([W.player.x, W.player.y], [14, 0]);
  // Lavaridge's east road goes down onto Route 112.
  W.load('lavaridge', { x: 29, y: 12, dir: 'right' });
  await cross('right', 'route112');
  assert.deepEqual([W.player.x, W.player.y], [0, 10]);
  // The old woman's Egg, at the hot springs.
  W.load('lavaridge', { x: 11, y: 7, dir: 'up' });
  W.interact();
  await until(() => F.flag('lavaridge-egg'));
  assert.equal(G.DayCare.eggs()[G.DayCare.eggs().length - 1].mon.sp, 360);
  await settle();
  // With the Heat Badge, the rival waits outside the Gym with Go-Goggles.
  for (const n of [17, 18, 19, 20]) F.badge(n);
  W.load('lavaridge-gym', { x: 6, y: 11, dir: 'down' });
  step(W, 'down');
  await until(() => F.flag('chapter-32-done'));
  assert.equal(W.map.id, 'lavaridge');
  assert.ok(F.flag('rival3-goggles') && F.count('go-goggles') === 1);
});

test('Hoenn (chapter 33): Routes 117 and 118, Verdanturf and the Rusturf Tunnel, Steven across the water, Norman\'s students', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('marshtomp', 32, { moves: ['water-gun', 'mud-shot'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // West out of Mauville: Route 117, then Verdanturf Town.
  W.load('mauville', { x: 0, y: 9, dir: 'left' });
  await cross('left', 'route117');
  assert.deepEqual([W.player.x, W.player.y], [35, 6]);
  W.load('route117', { x: 0, y: 6, dir: 'left' });
  await cross('left', 'verdanturf');
  assert.deepEqual([W.player.x, W.player.y], [27, 10]);
  // Into the Rusturf Tunnel from Verdanturf: its last rock stops you without Rock Smash.
  W.load('verdanturf', { x: 4, y: 4, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'rusturf-tunnel');
  assert.deepEqual([W.player.x, W.player.y], [29, 10]);
  W.load('rusturf-tunnel', { x: 24, y: 4, dir: 'left' });
  assert.notEqual(step(W, 'left'), 'moved', 'the cracked rock');
  // East out of Mauville: Route 118, whose channel needs Surf.
  W.load('mauville', { x: 31, y: 9, dir: 'right' });
  await cross('right', 'route118');
  assert.deepEqual([W.player.x, W.player.y], [0, 9]);
  W.load('route118', { x: 14, y: 9, dir: 'right' });
  assert.notEqual(step(W, 'right'), 'moved', 'the water, without Surf');
  // Steven waits on the far bank.
  W.load('route118', { x: 23, y: 9, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await until(() => F.flag('chapter-33-done'));
  assert.ok(F.flag('steven-118'));
  await settle();
  // Norman's Gym: his students are only there with four Hoenn badges.
  F.setFlag('wally-caught');
  W.load('petalburg-gym', { x: 6, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await settle();
  assert.equal(got.length, 0, 'nobody stops you yet');
  for (const n of [17, 18, 19, 20]) F.badge(n);
  W.load('petalburg-gym', { x: 6, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => got.length === 1);
  assert.equal(got[0], 'petalburg-gym:randall');
});

test('Hoenn (chapter 34): Route 119 and the Weather Institute, the rival, Fortree\'s unseen doorway, the Devon Scope on Route 120', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('marshtomp', 35, { moves: ['water-gun', 'mud-shot'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  const got = [], wild = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  W.onEncounter = async (sp, lvl) => { wild.push(G.Maps.species(sp) + ':' + lvl); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // North from Route 118 to Route 119, on to Fortree City, east to Route 120.
  W.load('route118', { x: 28, y: 0, dir: 'up' });
  await cross('up', 'route119');
  assert.deepEqual([W.player.x, W.player.y], [14, 55]);
  W.load('route119', { x: 10, y: 0, dir: 'up' });
  await cross('up', 'fortree');
  assert.deepEqual([W.player.x, W.player.y], [14, 23]);
  W.load('fortree', { x: 31, y: 10, dir: 'right' });
  await cross('right', 'route120');
  assert.deepEqual([W.player.x, W.player.y], [0, 10]);
  // Into the Weather Institute.
  W.load('route119', { x: 5, y: 34, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'institute-1f');
  await settle();
  // With the institute saved, the rival waits on the way north.
  F.setFlag('institute-saved');
  W.load('route119', { x: 14, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('rival3-119'));
  assert.equal(got[got.length - 1], 'route119:rival3-119');
  await settle();
  // Fortree's Gym: something unseen stands in the doorway.
  W.load('fortree', { x: 24, y: 8, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked');
  await settle();
  assert.ok(!F.flag('kecleon-gone'));
  // Steven on Route 120 shows the hidden Kecleon there and gives you the Devon Scope.
  W.load('route120', { x: 12, y: 10, dir: 'right' });
  W.interact();
  await until(() => F.flag('got-devon-scope'));
  await settle();
  assert.equal(F.count('devon-scope'), 1);
  assert.deepEqual(wild, ['352:30']);
  // Back at the Gym, the Scope shows its Kecleon too; then the door opens.
  W.load('fortree', { x: 24, y: 8, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked');
  await until(() => F.flag('kecleon-gone'));
  assert.deepEqual(wild, ['352:30', '352:30']);
  await settle();
  W.load('fortree', { x: 24, y: 8, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'fortree-gym');
});

test('Hoenn (chapter 35): Route 121 to Lilycove, the rival, the Department Store, the cave, Mt. Pyre and the orbs', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('marshtomp', 36, { moves: ['water-gun', 'mud-shot'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // South from Route 120 to Route 121, east to Lilycove City.
  W.load('route120', { x: 21, y: 19, dir: 'down' });
  await cross('down', 'route121');
  assert.deepEqual([W.player.x, W.player.y], [8, 0]);
  W.load('route121', { x: 43, y: 9, dir: 'right' });
  await cross('right', 'lilycove');
  assert.deepEqual([W.player.x, W.player.y], [0, 9]);
  // The Safari Zone's door is closed.
  W.load('route121', { x: 22, y: 7, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked');
  await settle();
  // On Lilycove's main road, the rival stops you.
  W.load('lilycove', { x: 13, y: 9, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => F.flag('rival3-lilycove'));
  assert.equal(got[got.length - 1], 'lilycove:rival3-lilycove');
  await settle();
  // The Department Store, up its stairs; the cave in the cove is guarded.
  W.load('lilycove', { x: 19, y: 8, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'dept-store-1f');
  W.load('dept-store-1f', { x: 12, y: 3, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'dept-store-2f');
  W.load('lilycove', { x: 38, y: 22, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'a Team Aqua grunt is in the way');
  // Mt. Pyre, from its island on Route 122, up to the summit.
  W.load('route122', { x: 14, y: 17, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'mt-pyre-1f');
  W.load('mt-pyre-1f', { x: 7, y: 3, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'mt-pyre-summit');
  assert.deepEqual([W.player.x, W.player.y], [12, 20]);
  // At the altar, Archie and Maxie take the orbs.
  W.load('mt-pyre-summit', { x: 12, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('chapter-35-done'));
  assert.ok(F.flag('orbs-taken'));
});

test('Hoenn (chapter 36): Team Aqua\'s hideout, Route 124 to Mossdeep, the Gym, Team Magma at the Space Center', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('swampert', 42, { moves: ['surf', 'muddy-water'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // Before the orbs leave Mt. Pyre, a grunt guards the cove's cave.
  W.load('lilycove', { x: 38, y: 22, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked');
  await settle();
  // After, the grunt is gone and the cave leads into the hideout.
  F.setFlag('orbs-taken');
  W.load('lilycove', { x: 38, y: 22, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'aqua-hideout-1f');
  // Down to the dock: Matt.
  W.load('aqua-hideout-b1f', { x: 8, y: 6, dir: 'down' });
  assert.equal(step(W, 'down'), 'moved');
  await until(() => F.flag('aqua-hideout-done'));
  assert.equal(got[got.length - 1], 'aqua-hideout-b1f:matt');
  await settle();
  // The sea east of Lilycove is Route 124; Mossdeep is east of it.
  assert.equal(G.Maps.get('lilycove').def.connect.east.map, 'route124');
  assert.equal(G.Maps.get('route124').def.connect.east.map, 'mossdeep');
  // The Space Center: quiet before the Mind Badge, raided after it.
  W.load('space-center-1f', { x: 10, y: 3, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'space-center-2f');
  await settle();
  assert.ok(!F.flag('space-center-saved'), 'no raid before the badge');
  for (const n of [17, 18, 19, 20, 21, 22, 23]) F.badge(n);
  W.load('space-center-1f', { x: 10, y: 3, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('chapter-36-done'));
  assert.deepEqual(plain(got.slice(-2)), ['space-center-2f:tabitha', 'space-center-2f:maxie-space']);
  assert.ok(F.flag('space-center-saved'));
});

test('Dive: from deep water down to the sea floor (with the Mind Badge) and back up; seaweed has its own wild Pokémon', async () => {
  const { G, W } = world();
  const F = G.Field;
  G.Maps.def({ id: 't-sea', region: 'hoenn', tileset: 'outdoor', palette: 'kanto', border: '~', dive: 't-floor',
    rows: ['~~~~~', '~ddd~', '~~~~~', '~~~~~'], spots: { start: [2, 1, 'up'] } });
  G.Maps.def({ id: 't-floor', region: 'hoenn', tileset: 'outdoor', palette: 'underwater', border: '#', underwater: true, surface: 't-sea',
    rows: ['#####', '#,,,#', '#"""#', '#####'], spots: { start: [2, 1, 'down'] },
    encounters: { seaweed: { rate: 180, mons: [[366, 20, 20, 100]] } } });
  assert.deepEqual(plain(G.Maps.validate('t-sea').concat(G.Maps.validate('t-floor'))), []);
  // The sea floor must be open under every deep tile, and the same size.
  G.Maps.def({ id: 't-bad', tileset: 'outdoor', border: '~', dive: 't-floor', rows: ['~~~~~', '~dd~d', '~~~~~', '~~~~~'], spots: { start: [1, 1] } });
  assert.ok(G.Maps.validate('t-bad').some(e => e.includes('deep water at 4,1')), G.Maps.validate('t-bad').join('; '));
  G.Dialog.ask = () => Promise.resolve(0);
  F.giveMon('swampert', 45, { moves: ['surf', 'dive'] });
  F.badge(3); F.badge(5);
  W.load('t-sea', 'start');
  assert.ok(W.surfing, 'deep water is water to Surf on');
  // Without the Mind Badge, only a hint.
  await pump(W, W.interact());
  assert.equal(W.map.id, 't-sea');
  F.badge(23);
  await pump(W, W.interact());
  assert.equal(W.map.id, 't-floor', 'down with Dive');
  assert.deepEqual([W.player.x, W.player.y], [2, 1], 'on the same tile');
  assert.ok(!W.surfing && W.player.ride === 260 && !W.follower, 'riding Swampert over the sea floor');
  assert.ok(!W.canRide() && W.flyBlock() === 'here', 'no Bicycle, no Fly down here');
  // Seaweed: the map's 'seaweed' table.
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), info.method]); return 'run'; };
  assert.equal(step(W, 'down'), 'moved');
  for (let i = 0; i < 40 && !got.length; i++) { W.update(0.05); await tick(); }
  assert.deepEqual(got[0], [366, 'seaweed']);
  W.onEncounter = null;
  for (let i = 0; i < 40; i++) { W.update(0.05); await tick(); }
  // Under the seaweed there is no deep water: nothing to come up through.
  W.player.face('down');
  assert.equal(W.interact(), null);
  assert.equal(step(W, 'up'), 'moved');
  W.player.face('up');
  await pump(W, W.interact());
  assert.equal(W.map.id, 't-sea', 'back up');
  assert.deepEqual([W.player.x, W.player.y], [2, 1]);
  assert.ok(W.surfing && W.player.ride === 260, 'surfing again');
  // A save made on the sea floor loads there, riding.
  W.load('t-floor', 'start');
  assert.ok(!W.surfing && W.player.ride === 260);
});

test('Hoenn (chapter 37): Steven\'s HM08, Routes 127 and 128, the sea floor, the Seafloor Cavern and Archie', async () => {
  const { G, W, later } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                                 'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                                 'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                                 'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21, 22, 23];
  F.giveMon('swampert', 44, { moves: ['surf', 'dive', 'strength', 'rock-smash'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // Steven is home after the Space Center: HM08.
  W.load('steven-house', { x: 7, y: 4, dir: 'up' });
  assert.ok(!W.actors.some(a => a.id === 'steven' && a.visible), 'not home before the Space Center');
  F.setFlag('space-center-saved');
  W.load('steven-house', { x: 7, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('got-hm08') && F.count('hm08') === 1, 'HM08 Dive');
  // South of Mossdeep by sea: Route 127, then Route 128.
  W.load('mossdeep', { x: 2, y: 27, dir: 'down' });
  assert.ok(W.surfing);
  assert.equal(step(W, 'down'), 'moved');
  assert.equal(W.map.id, 'route127');
  assert.equal(G.Maps.get('route127').def.connect.south.map, 'route128');
  // Route 128's deep water: down to the sea floor, through the cavern's mouth, up in its pool.
  W.load('route128', { x: 29, y: 11, dir: 'down' });
  await pump(W, W.interact());
  assert.equal(W.map.id, 'route128-uw');
  W.load('route128-uw', 'mouth');
  W.player.face('down');
  assert.equal(step(W, 'down'), 'moved');
  await until(() => W.map.id === 'seafloor-entrance');
  assert.ok(W.surfing, 'up in the pool');
  await settle();
  // Dive in the pool goes back down to the mouth.
  await pump(W, W.interact());
  assert.equal(W.map.id, 'route128-uw');
  assert.deepEqual([W.player.x, W.player.y], [31, 21]);
  // Room 1: a cracked rock, then a boulder in the narrow way down.
  W.load('seafloor-1', { x: 5, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked');
  await pump(W, W.interact());
  await settle();
  assert.equal(step(W, 'up'), 'moved', 'the rock is smashed');
  W.load('seafloor-1', { x: 18, y: 12, dir: 'down' });
  W.strength = true;
  shove(W, later, 'down', 2);
  assert.equal(step(W, 'down'), 'moved');
  assert.equal(step(W, 'right'), 'moved', 'past the boulder');
  // The deepest chamber: Archie, then Kyogre wakes; you come up on Route 128.
  W.load('seafloor-deep', 'ladder');
  assert.equal(step(W, 'up'), 'moved');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('chapter-37-done'));
  assert.equal(got[got.length - 1], 'seafloor-deep:archie');
  assert.ok(F.flag('kyogre-awake'));
  assert.equal(W.map.id, 'route128');
  assert.ok(W.surfing, 'on the deep water of Route 128');
});

test('a storm: rain in battle for the whole battle (rules.weather)', () => {
  const { G } = world();
  const rng = G.RNG(3);
  const b = G.Battle.create({ kind: 'wild', seed: 1, player: { name: 'Red', party: [G.Mon.create(260, 40, { rng })], bag: {} },
    foe: { party: [G.Mon.create(129, 20, { rng, wild: true })] }, rules: { weather: 'rain' } });
  const ev = b.start();
  assert.ok(ev.some(e => e.type === 'weather' && e.w === 'rain' && e.field));
  assert.equal(b.weatherNow(), 'rain');
  assert.equal(b.weather.turns, Infinity);
  assert.equal(G.BattleText.line(ev.find(e => e.type === 'weather'), b), 'It is raining.');
});

test('Hoenn (chapter 38): Steven on Route 128, Sootopolis under the storm, Wallace, the Sky Pillar, Rayquaza, Juan', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21, 22, 23];
  F.giveMon('swampert', 46, { moves: ['surf', 'dive', 'strength', 'rock-smash'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const got = [], wild = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  W.onEncounter = async (sp, lvl, area, info) => { wild.push([G.Maps.species(sp), lvl]); return 'caught'; };
  G.Dialog.ask = () => Promise.resolve(0);
  F.setFlag('kyogre-awake');
  // Route 128: Steven waits on the sandbar; the storm rains on the sea.
  W.load('route128', { x: 29, y: 11, dir: 'right' });
  assert.ok(W.stormy(), 'a storm over Route 128');
  assert.equal(step(W, 'right'), 'moved');
  await until(() => F.flag('steven-128'));
  await settle();
  // The sea roads: Route 127 west to Route 126, Route 128 west to Route 129, Route 124 south to Route 126.
  assert.equal(G.Maps.get('route127').def.connect.west.map, 'route126');
  assert.equal(G.Maps.get('route124').def.connect.south.map, 'route126');
  assert.equal(G.Maps.get('route128').def.connect.west.map, 'route129');
  // Route 126: down south of the crater, up through the tunnel into Sootopolis's lake.
  W.load('route126', { x: 15, y: 35, dir: 'up' });
  await pump(W, W.interact());
  assert.equal(W.map.id, 'route126-uw');
  W.load('route126-uw', 'sootopolis');
  await pump(W, W.interact());
  await until(() => W.map.id === 'sootopolis' && F.flag('sootopolis-seen'));
  assert.ok(W.surfing && W.stormy());
  await settle();
  // The Gym is shut while the storm rages.
  W.load('sootopolis', 'gym-door');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'blocked');
  await settle();
  // Wallace, in the Cave of Origin.
  W.load('cave-of-origin', { x: 8, y: 5, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('wallace-sky-pillar'));
  // The Sky Pillar: its door opens; a hole on 2F drops you to 1F.
  W.load('route131', 'pillar-door');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'sky-pillar-1f');
  await settle();
  W.load('sky-pillar-2f', { x: 6, y: 2, dir: 'down' });
  assert.equal(step(W, 'down'), 'moved');
  await until(() => W.map.id === 'sky-pillar-1f');
  await settle();
  // The top: Rayquaza wakes and flies off; in Sootopolis it calms the two masters.
  W.load('sky-pillar-top', 'stairs');
  for (let i = 0; i < 3; i++) assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('rayquaza-awake'));
  await settle();
  await pump(W, W.flyTo('sootopolis'));
  await until(() => F.flag('weather-calm'));
  await settle();
  assert.ok(!W.stormy(), 'the storm is over');
  // Rayquaza is back on the pillar.
  W.load('sky-pillar-top', { x: 8, y: 6, dir: 'up' });
  await pump(W, W.interact());
  assert.deepEqual(wild, [[384, 70]]);
  assert.ok(F.flag('rayquaza-met'));
  // Juan.
  W.load('sootopolis-gym', { x: 7, y: 3, dir: 'up' });
  await pump(W, W.interact());
  await until(() => F.flag('chapter-38-done'));
  assert.equal(got[got.length - 1], 'sootopolis-gym:juan');
  assert.ok(F.save.player.badges.includes(24));
});

test('Hoenn (chapter 39): Ever Grande City, Victory Road and Wally, the Elite Four, Wallace and the Hall of Fame', async () => {
  const { G, W } = world(['js/content/kanto/league.js', 'js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js',
                          'js/content/hoenn/woods.js', 'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js',
                          'js/content/hoenn/slateport.js', 'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js',
                          'js/content/hoenn/verdanturf.js', 'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js',
                          'js/content/hoenn/seafloor.js', 'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  F.giveMon('swampert', 50, { moves: ['surf', 'waterfall', 'strength', 'rock-smash'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  F.setFlag('kyogre-awake'); F.setFlag('weather-calm'); F.setFlag('steven-128');
  // Route 128's east end is Ever Grande City's sea.
  W.load('route128', { x: 43, y: 20, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(W.map.id, 'ever-grande');
  assert.deepEqual([W.player.x, W.player.y], [0, 30]);
  // Up the waterfall to the plateau.
  W.load('ever-grande', { x: 16, y: 24, dir: 'up' });
  await pump(W, W.interact());
  await until(() => W.player.y === 21 && !W.player.moving);
  // Victory Road opens with all eight Hoenn badges.
  W.load('ever-grande', 'road-door');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'blocked');
  await settle();
  F.badge(24);
  W.load('ever-grande', 'road-door');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'hoenn-victory-1f');
  await settle();
  // Wally, at the end of Victory Road.
  W.load('hoenn-victory-1f', { x: 8, y: 3, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await until(() => F.flag('wally-vroad'));
  assert.equal(got[got.length - 1], 'hoenn-victory-1f:wally-vroad');
  await settle();
  // The lobby's guard sends you to Sidney's room.
  W.load('hoenn-league', 'guard');
  W.player.face('up');
  await pump(W, W.interact());
  await until(() => W.map.id === 'sidney-room');
  await settle();
  // The Elite Four, one room after another.
  for (const [room, id] of [['sidney-room', 'sidney'], ['phoebe-room', 'phoebe'], ['glacia-room', 'glacia'], ['drake-room', 'drake']]) {
    W.load(room, { x: 5, y: 5, dir: 'up' });
    await pump(W, W.interact());
    await until(() => F.flag('he4-' + id));
    await settle();
    W.load(room, { x: 5, y: 3, dir: 'up' });
    assert.equal(step(W, 'up'), 'moved', 'the door opens after ' + id);
    await until(() => W.map.id !== room);
    await settle();
  }
  assert.equal(W.map.id, 'wallace-room');
  // The Champion, the Hall of Fame and home.
  W.load('wallace-room', { x: 5, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('chapter-39-done'));
  assert.equal(got[got.length - 1], 'wallace-room:wallace-champion');
  assert.ok(F.flag('hoenn-champion'));
  assert.equal(W.map.id, 'birch-house-2f');
  assert.equal(F.save.fame.length, 1);
});

test('double battles (chapter 40): a pair needs two Pokémon able to fight; the partner speaks for them; Tate and Liza fight two at a time', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const got = [];
  W.onTrainer = async (d, info) => { got.push([info.key, !!d.double]); return 'win'; };
  F.giveMon('treecko', 10, { moves: ['pound'] });
  // Route 104's twins look along the path; with one Pokémon they let you pass.
  W.load('route104', { x: 17, y: 21, dir: 'down' });
  assert.ok(W.actors.some(a => a.id === 'gina-mia-partner' && a.visible), 'the partner stands there');
  assert.equal(step(W, 'down'), 'moved');
  await settle();
  assert.equal(got.length, 0, 'not spotted with one Pokémon');
  // Talking: they explain.
  W.load('route104', { x: 18, y: 22, dir: 'right' });
  await pump(W, W.interact());
  assert.equal(got.length, 0);
  // With two, they spot you; talking to the partner is talking to them.
  F.giveMon('wingull', 10, { moves: ['growl'] });
  W.load('route104', { x: 20, y: 23, dir: 'up' });
  await pump(W, W.interact());
  assert.deepEqual(plain(got), [['route104:gina-mia', true]]);
  // Tate and Liza: a double battle.
  W.load('mossdeep-gym', { x: 6, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.deepEqual(plain(got[got.length - 1]), ['mossdeep-gym:tate', true]);
});

test('currents (chapter 40): they carry a surfer their way until the water is calm, and you cannot swim against them', async () => {
  const { G, W } = world();
  const F = G.Field;
  G.Maps.def({ id: 't-flow', region: 'hoenn', tileset: 'outdoor', palette: 'kanto', border: '~',
    rows: ['~~~~~~~~', '~((((((~', '~~~~~~~~'], spots: { start: [0, 0, 'down'] } });
  F.giveMon('wingull', 30, { moves: ['surf'] });
  F.badge(5);
  W.debug.noEnc = true;
  W.load('t-flow', { x: 6, y: 0, dir: 'down' });
  assert.ok(W.surfing);
  assert.equal(step(W, 'down'), 'moved');
  for (let i = 0; i < 40; i++) { W.update(0.05); W.player.update(0.05); if (!W.player.moving) W.arrived(W.player); await tick(); if (W.player.x === 1) break; }
  assert.deepEqual([W.player.x, W.player.y], [1, 1], 'carried to the end of the current');
  // Against the current: no.
  W.load('t-flow', { x: 0, y: 1, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked');
  // Across it from the calm water: you can enter it sideways.
  W.load('t-flow', { x: 3, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
});

test('Hoenn (chapter 40): the currents west of Pacifidlog to Slateport, Steven behind Meteor Falls, and his gift', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  F.giveMon('swampert', 60, { moves: ['surf', 'waterfall', 'strength', 'rock-smash'] });
  F.giveMon('manectric', 55, { moves: ['thunderbolt'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const got = [];
  W.onTrainer = async (d, info) => { got.push(info.key); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  for (const f of ['kyogre-awake', 'weather-calm', 'hoenn-champion']) F.setFlag(f);
  // The roads: Pacifidlog -> 132 -> 133 -> 134 -> Slateport.
  assert.equal(G.Maps.get('pacifidlog').def.connect.west.map, 'route132');
  assert.equal(G.Maps.get('route134').def.connect.west.map, 'slateport');
  assert.equal(G.Maps.get('slateport').def.connect.east.map, 'route134');
  // Into the current west of Pacifidlog: carried across Routes 132, 133 and 134 to Slateport's sea.
  W.load('pacifidlog', { x: 1, y: 4, dir: 'left' });
  assert.ok(W.surfing);
  assert.equal(step(W, 'left'), 'moved');
  for (let i = 0; i < 3000 && !(W.map.id === 'slateport' && !W.player.moving); i++) { W.update(0.05); await tick(); }
  assert.equal(W.map.id, 'slateport', 'carried all the way');
  assert.deepEqual([W.player.x, W.player.y], [33, 27]);
  // Back east: the calm lanes.
  W.load('route134', { x: 0, y: 10, dir: 'right' });
  for (let i = 0; i < 39; i++) assert.equal(step(W, 'right'), 'moved');
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(W.map.id, 'route133');
  // Meteor Falls: up the waterfall, into Steven's cave.
  W.load('meteor-falls', { x: 6, y: 4, dir: 'up' });
  assert.ok(W.surfing);
  await pump(W, W.interact());
  await until(() => W.player.y === 2 && !W.player.moving);
  W.load('meteor-falls', 'steven');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'meteor-falls-steven');
  await settle();
  // Steven.
  W.load('meteor-falls-steven', { x: 8, y: 5, dir: 'up' });
  await pump(W, W.interact());
  await until(() => F.flag('chapter-40-done'));
  assert.equal(got[got.length - 1], 'meteor-falls-steven:steven');
  // His gift.
  const n = F.party().length;
  W.load('steven-house', { x: 5, y: 5, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('got-beldum') && F.party().length === n + 1 && F.party()[n].sp === 374);
  // The save's repair table (store.js): each entry is a gym leader whose win script gives that badge.
  for (const [key, n] of Object.entries(G.Store.HOENN_GYMS)) {
    const [mapId, id] = key.split(':');
    const t = G.Maps.get(mapId).trainers.find(x => x.id === id);
    assert.ok(t && t.leader && t.win, key);
    assert.ok(JSON.stringify(G.Script.get(t.win)).includes('["badge",' + n + ']'), key + ' gives badge ' + n);
  }
});

test('a move used at a place, a walk once around a room, braille (chapter 41)', async () => {
  const { G, W } = world();
  const F = G.Field;
  assert.equal(G.U.braille('Dig here'), '⠙⠊⠛ ⠓⠑⠗⠑');
  G.Script.def({ 't.spot': [['setFlag', 't-spot']], 't.around': [['setFlag', 't-around']] });
  G.Maps.def({ id: 't-ruin', tileset: 'indoor', palette: 'ruins', rows: ['WWWWW', '+++++', '+++W+', '+++++', '+++++'],
    spots: { start: [1, 2, 'up'] },
    moveSpots: [{ move: 'strength', x: 3, y: 1, if: '!t-spot', script: 't.spot' }],
    walkAround: { x: 0, y: 1, w: 5, h: 4, if: '!t-around', script: 't.around' } });
  assert.deepEqual(plain(G.Maps.validate('t-ruin')), []);
  G.Maps.def({ id: 't-bad', tileset: 'indoor', palette: 'ruins', rows: ['WWW', '+W+', '+++'], spots: { start: [0, 2] },
    moveSpots: [{ move: 'no-such-move', x: 9, y: 1, script: 't.spot' }], walkAround: { x: 0, y: 1, w: 3, h: 2, script: 'nope' } });
  const errs = plain(G.Maps.validate('t-bad')).join(' | ');
  assert.match(errs, /moveSpot 0 .* outside/); assert.match(errs, /unknown move "no-such-move"/);
  assert.match(errs, /edge tile 1,1 is a wall/); assert.match(errs, /walkAround: unknown script "nope"/);
  F.giveMon('machop', 30, { moves: ['strength'] });
  F.giveMon('zubat', 30, { moves: ['bite'] });
  const [machop, zubat] = F.party();
  W.debug.noEnc = true;
  W.load('t-ruin', 'start');
  assert.equal(W.moveSpots(machop).length, 0, 'not standing there');
  W.load('t-ruin', { x: 3, y: 1, dir: 'up' });
  assert.equal(W.moveSpots(machop).length, 1);
  assert.equal(W.moveSpots(zubat).length, 0, 'it has to know the move');
  machop.hp = 0;
  assert.equal(W.moveSpots(machop).length, 0, 'a fainted Pokémon cannot');
  machop.hp = 10;
  await pump(W, W.useMoveSpot(W.moveSpots(machop)[0], machop));
  assert.ok(F.flag('t-spot'));
  assert.equal(W.moveSpots(machop).length, 0, 'its if');
  // Once around the edge (14 tiles): nothing until the last one.
  W.load('t-ruin', { x: 0, y: 1, dir: 'right' });
  const path = ['right', 'right', 'right', 'right', 'down', 'down', 'down', 'left', 'left', 'left', 'left', 'up', 'up', 'up'];
  path.forEach((d, i) => {
    assert.equal(step(W, d), 'moved', 'step ' + i);
    if (i < path.length - 1) assert.ok(!F.flag('t-around'), 'not yet at step ' + i);
  });
  for (let i = 0; i < 20; i++) { W.update(0.05); await tick(); }
  assert.ok(F.flag('t-around'), 'once around');
  // Leaving the map forgets the tiles walked so far.
  F.clearFlag('t-around');
  W.load('t-ruin', { x: 0, y: 1, dir: 'right' });
  for (const d of path.slice(0, 10)) step(W, d);
  W.load('t-ruin', { x: 0, y: 4, dir: 'up' });
  for (const d of path.slice(11)) step(W, d);
  for (let i = 0; i < 20; i++) { W.update(0.05); await tick(); }
  assert.ok(!F.flag('t-around'), 'a new visit starts again');
});

test('Hoenn (chapter 41): Route 105, the desert, the Sealed Chamber under Route 134, the three ruins and the Regis', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js']);
  W.debug.noEnc = true;
  const F = G.Field;
  F.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  F.giveMon('wailord', 50, { moves: ['surf', 'dive', 'strength'] });
  F.giveMon('sandslash', 45, { moves: ['dig'] });
  F.giveMon('kadabra', 45, { moves: ['flash'] });
  F.giveMon('relicanth', 45, { moves: ['rock-smash'] });
  const [wailord, sandslash, kadabra] = F.party();
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const wild = [];
  W.onEncounter = async (sp, lvl) => { wild.push([G.Maps.species(sp), lvl]); return 'caught'; };
  G.Dialog.ask = () => Promise.resolve(0);
  for (const f of ['kyogre-awake', 'weather-calm']) F.setFlag(f);
  const conn = (a, side) => G.Maps.get(a).def.connect[side].map;
  assert.deepEqual([conn('route104', 'south'), conn('route105', 'north'), conn('route105', 'east'), conn('route106', 'west')],
    ['route105', 'route104', 'route106', 'route105']);
  assert.deepEqual([conn('route111', 'north'), conn('route111-desert', 'south')], ['route111-desert', 'route111']);
  // Route 111: the hiker keeps you out of the desert until you are the Champion.
  W.load('route111', { x: 10, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked');
  F.setFlag('hoenn-champion');
  W.load('route111', { x: 10, y: 2, dir: 'up' });
  for (let i = 0; i < 4 && W.map.id === 'route111'; i++) step(W, 'up');
  assert.equal(W.map.id, 'route111-desert');
  assert.ok(W.map.def.desert);
  W.load('route111-desert', 'ruins');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'desert-ruins');
  await settle();
  // Before the chamber is opened, the ruins do not answer.
  W.load('desert-ruins', { x: 8, y: 4, dir: 'down' });
  assert.equal(W.moveSpots(wailord).length, 0);
  // Under Route 134: Dive, swim to the doorway, into the Sealed Chamber.
  W.load('route134', { x: 6, y: 16, dir: 'up' });
  assert.ok(W.surfing);
  await pump(W, W.interact());
  assert.equal(W.map.id, 'route134-uw');
  W.load('route134-uw', 'mouth');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'sealed-chamber');
  await settle();
  // Dig at the far wall.
  W.load('sealed-chamber', { x: 6, y: 2, dir: 'up' });
  assert.equal(W.moveSpots(wailord).length, 0, 'Wailord does not know Dig');
  assert.equal(W.moveSpots(sandslash)[0].move, 'dig');
  await pump(W, W.useMoveSpot(W.moveSpots(sandslash)[0], sandslash));
  assert.ok(F.flag('sealed-chamber-dug'));
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'sealed-chamber-inner');
  await settle();
  // The key: Wailord first, Relicanth last.
  W.load('sealed-chamber-inner', { x: 6, y: 2, dir: 'up' });
  const p = F.party();
  [p[0], p[3]] = [p[3], p[0]];
  await pump(W, W.interact());
  assert.ok(!F.flag('regis-unsealed'), 'the wrong order');
  [p[0], p[3]] = [p[3], p[0]];
  await pump(W, W.interact());
  assert.ok(F.flag('regis-unsealed'));
  // The Desert Ruins: two steps right and two down from the braille, then Strength.
  W.load('desert-ruins', { x: 6, y: 2, dir: 'up' });
  for (const d of ['right', 'right', 'down', 'down']) assert.equal(step(W, d), 'moved');
  assert.deepEqual([W.player.x, W.player.y], [8, 4]);
  await pump(W, W.useMoveSpot(W.moveSpots(wailord)[0], wailord));
  assert.ok(F.flag('desert-ruins-open'));
  W.load('desert-ruins', 'below');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'desert-ruins-inner');
  await settle();
  W.load('desert-ruins-inner', { x: 4, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('regirock-met'));
  // Route 105: the islet's cave, and once around its hall.
  W.load('route105', 'cave');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'island-cave');
  await settle();
  W.load('island-cave', { x: 0, y: 2, dir: 'right' });
  const round = [].concat(Array(12).fill('right'), Array(8).fill('down'), Array(12).fill('left'), Array(8).fill('up'));
  for (const d of round) assert.equal(step(W, d), 'moved');
  await until(() => F.flag('island-cave-open'));
  await settle();
  W.load('island-cave-inner', { x: 4, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('regice-met'));
  // Route 120: the Ancient Tomb, and Flash in the middle.
  W.load('route120', 'tomb');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'ancient-tomb');
  await settle();
  W.load('ancient-tomb', { x: 6, y: 6, dir: 'up' });
  await pump(W, W.useMoveSpot(W.moveSpots(kadabra)[0], kadabra));
  assert.ok(F.flag('ancient-tomb-open'));
  W.load('ancient-tomb-inner', { x: 4, y: 4, dir: 'up' });
  await pump(W, W.interact());
  await until(() => F.flag('chapter-41-done'));
  assert.deepEqual(wild, [[377, 40], [378, 40], [379, 40]]);
});

test('Hoenn (chapter 42): the Weather Institute, the Terra and Marine Caves, the news, the roaming Latias, Southern Island', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/world/roam.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  F.giveMon('swampert', 70, { moves: ['surf', 'dive', 'strength'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 60; i++) { W.update(0.05); await tick(); } };
  const wild = [];
  let answer = 'caught';
  W.onEncounter = async (sp, lvl, area, info) => { wild.push([G.Maps.species(sp), lvl, !!info.roamer]); return answer; };
  G.Dialog.ask = () => Promise.resolve(0);
  for (const f of ['kyogre-awake', 'weather-calm', 'hoenn-champion']) F.setFlag(f);
  // Before the readings, the Terra Cave is only a crack.
  W.load('route114', 'terra');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'blocked');
  await settle();
  // The Weather Institute: nothing until Rayquaza is met.
  W.load('institute-1f', { x: 8, y: 7, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(!F.flag('weather-report'));
  F.setFlag('rayquaza-met');
  await pump(W, W.interact());
  assert.ok(F.flag('weather-report'));
  // The Terra Cave and Groudon.
  W.load('route114', 'terra');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'terra-cave');
  await settle();
  W.load('terra-cave', { x: 9, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('groudon-met'));
  // Under Route 127: the Marine Cave, up in its pool, and Kyogre.
  W.load('route127-uw', 'marine');
  W.player.face('up');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'marine-cave');
  assert.ok(W.surfing, 'up in the pool');
  await settle();
  W.load('marine-cave', { x: 9, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('kyogre-met'));
  assert.deepEqual(wild.slice(0, 2), [[383, 70, false], [382, 70, false]]);
  // Mrs. Birch: red, so Latias roams; the Eon Ticket.
  W.load('birch-house', { x: 7, y: 5, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('lati-red') && S.roamer.mon.sp === 380 && F.count('eon-ticket') === 1);
  const routes = G.Roam.routes();
  assert.ok(routes.includes('route118') && routes.includes('route105') && !routes.includes('route111-desert'));
  assert.ok(routes.includes(S.roamer.map));
  assert.equal(G.Roam.where(), null, 'not on the Town Map before it is met');
  // It moves each time the player changes maps, along the routes.
  const seen = new Set();
  for (let i = 0; i < 30; i++) { W.load(i % 2 ? 'route118' : 'route119', 'start'); seen.add(S.roamer.map); }
  assert.ok(seen.size > 3 && [...seen].every(r => routes.includes(r)), 'it roams: ' + [...seen].join());
  // On its route, one wild encounter in four is it: it flees and moves on, with the damage kept.
  W.load('route101', { x: 6, y: 9, dir: 'down' });
  S.roamer.map = 'route101';
  S.roamer.mon.hp = 50;
  W.debug.noEnc = false;
  answer = 'fled';
  const grass = (() => { const m = W.map; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w - 1; x++) if (G.Maps.kindAt(m, x, y) === 'tall' && G.Maps.kindAt(m, x + 1, y) === 'tall') return [x, y]; })();
  W.load('route101', { x: grass[0], y: grass[1], dir: 'right' });
  S.roamer.map = 'route101';
  for (let i = 0; i < 400 && !wild.some(w => w[2]); i++) {
    if (!W.locked && !W.player.moving) step(W, i % 2 ? 'left' : 'right');
    W.update(0.05); await tick();
  }
  W.debug.noEnc = true;
  const met = wild.find(w => w[2]);
  assert.deepEqual(met, [380, 40, true], 'Latias');
  await settle();
  assert.ok(S.roamer.seen && G.Roam.where(), 'the Town Map shows it now');
  assert.equal(S.roamer.mon.hp, 50, 'its HP stays');
  // Beaten, it recovers and goes far away; caught, it is gone for good.
  G.Roam.after('win', W.rng);
  assert.equal(S.roamer.mon.hp, G.Mon.maxHp(S.roamer.mon));
  // The save keeps it.
  assert.equal(G.Store.sanitize(JSON.parse(JSON.stringify(S))).roamer.mon.sp, 380);
  // Southern Island: the ferry, and Latios by the tree.
  W.load('lilycove', { x: 22, y: 21, dir: 'up' });
  await pump(W, W.interact());
  await until(() => W.map.id === 'southern-island');
  await settle();
  W.load('southern-island', { x: 9, y: 6, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('southern-met'));
  assert.deepEqual(wild[wild.length - 1], [381, 50, false]);
  // Latias caught on its route: the chapter ends.
  W.load('route101', { x: grass[0], y: grass[1], dir: 'right' });
  S.roamer.map = 'route101';
  answer = 'caught';
  W.debug.noEnc = false;
  const n = wild.length;
  for (let i = 0; i < 400 && !(wild.length > n && wild[wild.length - 1][2]); i++) {
    if (!W.locked && !W.player.moving) step(W, i % 2 ? 'left' : 'right');
    W.update(0.05); await tick();
  }
  W.debug.noEnc = true;
  await until(() => F.flag('chapter-42-done'));
  assert.equal(S.roamer, null);
  assert.ok(F.flag('roamer-caught'));
});

test('Hoenn (chapter 43): the Battle Tower: the ferry, entering, seven in a row, the streak, losing, retiring, doubles, Anabel, the exchange', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/content/hoenn/tower.js', 'js/world/roam.js', 'js/world/tower.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, Tw = G.Tower;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  F.setFlag('hoenn-champion');
  for (const [sp, lvl, item] of [['swampert', 72, 'leftovers'], ['gardevoir', 70, 'leftovers'], ['mewtwo', 70, null], ['manectric', 45, null], ['altaria', 60, null]]) {
    const m = F.giveMon(sp, lvl, { moves: ['tackle'] });
    if (item) m.item = item;
  }
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const answers = [], picks = [], asked = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  // What the party screen would show at each pick: greyed out, and the note on each card.
  G.PartyUI = { pick: o => { asked.push(F.party().map((m, i) => [o.disabled(m, i), o.note(m, i)])); return Promise.resolve(picks.shift()); } };
  const fights = [];
  let outcome = () => 'win';
  W.onTrainer = async (d, info) => { fights.push({ d, info }); return outcome(fights.length); };
  const counter = async mode => { W.load('battle-tower-lobby', mode); await pump(W, W.interact()); await until(() => W.map.id === 'battle-tower-lobby' && !W.locked); };
  // The ferry: (no Eon Ticket) the Battle Tower is the first choice.
  W.load('lilycove', { x: 22, y: 21, dir: 'up' });
  await pump(W, W.interact());
  await until(() => W.map.id === 'battle-tower');
  // Single battles: Swampert, then (Gardevoir holds the same item; Mewtwo is banned) Manectric and Altaria.
  picks.push(0, 3, 4);
  await counter('single');
  const party = F.party();
  assert.deepEqual(plain(asked[1]), [[true, 'No. 1'], [true, 'Same item'], [true, 'Cannot enter'], [false, null], [false, null]]);
  assert.equal(fights.length, 7, 'seven battles');
  for (const { d, info } of fights) {
    assert.deepEqual(plain(info.party.map(m => [m.sp, m.lvl])), [[260, 50], [310, 45], [334, 50]]);
    assert.ok(info.rules.noExp && info.rules.noBag && info.canLose && !info.rules.double);
    assert.equal(d.team.length, 3);
  }
  assert.equal(new Set(fights.map(f => f.d.team.map(x => x[0]).join())).size, 7, 'seven different teams');
  assert.deepEqual([Tw.streak('single'), Tw.bp()], [7, 3]);
  assert.ok(F.flag('chapter-43-done'));
  assert.deepEqual([party[0].lvl, party[0].item, party[0].hp], [72, 'leftovers', G.Mon.maxHp(party[0])], 'the party is as it was');
  assert.ok(!Object.keys(S.done).some(k => k.startsWith('battle-tower')));
  // The streak goes on from No. 8; losing No. 9 ends it.
  fights.length = 0;
  outcome = k => (k === 2 ? 'lose' : 'win');
  picks.push(0, 3, 4);
  await counter('single');
  assert.equal(fights.length, 2);
  assert.ok(fights[0].d.team.every(x => Tw.pool(1).includes(x[0])), 'battle 8 is in the second set');
  assert.deepEqual([Tw.streak('single'), Tw.best('single')], [0, 8]);
  // Retiring after one win ends the streak too.
  fights.length = 0;
  outcome = () => 'win';
  picks.push(0, 3, 4);
  answers.push(0, 1);
  await counter('single');
  assert.equal(fights.length, 1);
  assert.deepEqual([Tw.streak('single'), Tw.best('single')], [0, 8]);
  // Double battles: four Pokémon, the double rule, teams of four.
  fights.length = 0;
  outcome = () => 'lose';
  picks.push(0, 3, 4, 2);
  await counter('double');
  assert.equal(fights.length, 0, 'Mewtwo cannot enter: back out');
  picks.length = 0;
  F.giveMon('blaziken', 50, { moves: ['tackle'] });
  picks.push(0, 3, 4, 5);
  await counter('double');
  assert.equal(fights.length, 1);
  assert.ok(fights[0].info.rules.double && fights[0].d.double && fights[0].d.team.length === 4 && fights[0].info.party.length === 4);
  // Anabel is the 21st single battle.
  fights.length = 0;
  outcome = () => 'win';
  Tw.setStreak('single', 20);
  picks.push(0, 3, 4);
  await counter('single');
  assert.equal(fights.length, 1, 'battle 21 also ends the third set');
  assert.equal(fights[0].d.id, 'anabel');
  assert.deepEqual(plain(fights[0].d.team.map(x => x[0])), ['alakazam', 'entei', 'snorlax']);
  assert.ok(F.flag('tower-silver'));
  assert.equal(Tw.bp(), 3 + 10 + 4, 'the first set, Anabel, the third set');
  // The exchange: not enough for Leftovers; a Protein for 1 BP.
  W.load('battle-tower-lobby', 'exchange');
  answers.push(1, 0, 0, 1, 2);
  await pump(W, W.interact());
  assert.deepEqual([F.count('leftovers'), F.count('protein'), Tw.bp()], [0, 1, 16]);
  // Home: the ferry back to Lilycove.
  W.load('battle-tower', { x: 9, y: 12, dir: 'down' });
  await pump(W, W.interact());
  await until(() => W.map.id === 'lilycove');
});

/** Pushes the boulder in front n times (Strength on), following it after each push but the last. */
function shove(W, later, dir, n) {
  for (let i = 0; i < n; i++) {
    later(1000);
    assert.equal(step(W, dir), 'blocked', dir + ' push ' + (i + 1));
    if (i < n - 1) assert.equal(step(W, dir), 'moved');
  }
}
const walk = (W, dirs) => { for (const d of dirs) assert.equal(step(W, d), 'moved', d); };

test('Sinnoh (chapter 44): the ferry to Sandgem, the way to the lake, Barry in Twinleaf, the briefcase at Lake Verity, Route 202 closed', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/content/hoenn/tower.js', 'js/content/sinnoh/sandgem.js', 'js/content/sinnoh/twinleaf.js',
                          'js/world/roam.js', 'js/world/tower.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  F.setFlag('hoenn-champion');
  F.giveMon('typhlosion', 60, { moves: ['flamethrower'] });              // the Champion's own team
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to); };
  const answers = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  // The ferry in Lilycove, after Professor Birch's news: (no Eon Ticket) the Battle Tower, then Sandgem Town.
  F.setFlag('sinnoh-invite');
  answers.push(1);
  W.load('lilycove', { x: 22, y: 21, dir: 'up' });
  W.interact();
  await until(() => W.map.id === 'sandgem');
  assert.deepEqual([W.player.x, W.player.y], [14, 20], "on Sandgem's pier");
  await until(() => F.flag('sinnoh-arrived') && !W.locked);
  assert.equal(F.obeyCap('sinnoh'), null, 'everybody obeys until the journey begins');
  // The road north to Route 202 is closed; Route 201 is west of town.
  W.load('sandgem', { x: 12, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the worker on the road north');
  W.load('sandgem', { x: 0, y: 6, dir: 'left' });
  await cross('left', 'route201');
  assert.deepEqual([W.player.x, W.player.y], [29, 6]);
  // The assistant keeps the way to the lake; Twinleaf Town is south.
  W.load('route201', { x: 2, y: 6, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'Dawn stands on the way to the lake');
  W.load('route201', { x: 5, y: 13, dir: 'down' });
  await cross('down', 'twinleaf');
  assert.deepEqual([W.player.x, W.player.y], [10, 0]);
  // Barry, outside his house, runs off to the lake.
  W.load('twinleaf', { x: 6, y: 6, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('barry-met'));
  // Lake Verity: the scene starts a step in; Piplup from the briefcase against a Starly, then Barry on Route 201.
  const got = [], fights = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), lvl, info.player.party.map(m => m.sp)]); return 'win'; };
  W.onTrainer = async (d, info) => { fights.push([d.id, d.team.map(t => t[0]).join(), info.party.map(m => m.sp).join(), info.canLose]); return 'win'; };
  W.load('route201', { x: 2, y: 6, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved', 'the way to the lake is open');
  assert.equal(step(W, 'left'), 'moved');
  await cross('left', 'lake-verity');
  assert.deepEqual([W.player.x, W.player.y], [19, 10]);
  answers.push(2);
  assert.equal(step(W, 'left'), 'moved');
  await until(() => F.flag('chapter-44-done'));
  assert.deepEqual(plain(got), [[396, 2, [393]]], 'Starly Lv. 2 against Piplup alone');
  assert.deepEqual(plain(fights), [['barry-201', '387', '393', true]], "Barry's Turtwig against Piplup, losing allowed");
  assert.equal(W.map.id, 'rowan-lab');
  assert.deepEqual(plain(F.party().map(m => m.sp)), [157, 393], 'Piplup joins the team');
  assert.equal(F.getVar('barry-starter'), 387);
  assert.equal(F.obeyCap('sinnoh'), 20);
  assert.ok(F.flag('sinnoh-dex') && F.count('poke-ball') >= 5);
  // A girl meets Lucas instead of Dawn.
  S.player.gender = 'f';
  assert.equal(F.vars().assistant, 'Lucas');
  assert.ok(F.test(G.Maps.get('rowan-lab').npcs.find(p => p.id === 'lucas').if));
});

test('Sinnoh (chapter 45): Route 202 after the Pokédex, Team Galactic in Jubilife, Barry, Oreburgh Gate, the locked Gym, Roark in the mine', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  F.setFlag('sinnoh-start'); F.setVar('barry-starter', 387);
  F.giveMon('piplup', 15, { moves: ['bubble'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const fights = [];
  W.onTrainer = async (d, info) => { fights.push([d.id, d.team.map(t => t[0]).join(), !!info.canLose]); return 'win'; };
  // Sandgem's road north opens with the Pokédex for Sinnoh.
  W.load('sandgem', { x: 12, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the worker');
  F.setFlag('sinnoh-dex');
  W.load('sandgem', { x: 12, y: 0, dir: 'up' });
  await cross('up', 'route202');
  assert.deepEqual([W.player.x, W.player.y], [9, 27]);
  // Route 202: the assistant's demonstration the first time.
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('route202-demo') && !W.locked);
  W.load('route202', { x: 9, y: 0, dir: 'up' });
  await cross('up', 'jubilife');
  assert.deepEqual([W.player.x, W.player.y], [17, 29]);
  // Jubilife: Team Galactic, three steps in.
  for (let i = 0; i < 3; i++) { assert.equal(step(W, 'up'), 'moved'); await until(() => !W.locked); }
  await until(() => F.flag('galactic-jubilife') && !W.locked);
  assert.deepEqual(plain(fights.shift()), ['grunt-jubilife', 'glameow', false]);
  W.load('jubilife', { x: 17, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'Route 204 is closed');
  // East to Route 203: Barry, losing allowed.
  W.load('jubilife', { x: 35, y: 13, dir: 'right' });
  await cross('right', 'route203');
  assert.deepEqual([W.player.x, W.player.y], [0, 6]);
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(step(W, 'right'), 'moved');
  await until(() => F.flag('barry-203') && !W.locked);
  assert.deepEqual(plain(fights.shift()), ['barry-203', 'starly,387', true]);
  // Oreburgh Gate, then Oreburgh City.
  W.load('route203', { x: 30, y: 7, dir: 'right' });
  await cross('right', 'oreburgh-gate');
  assert.deepEqual([W.player.x, W.player.y], [3, 9]);
  W.load('oreburgh-gate', { x: 26, y: 9, dir: 'down' });
  await cross('down', 'oreburgh');
  assert.deepEqual([W.player.x, W.player.y], [4, 12]);
  // The Gym is locked until Roark is found in the mine.
  W.load('oreburgh', { x: 24, y: 7, dir: 'up' });
  step(W, 'up');
  await until(() => !W.locked);
  assert.equal(W.map.id, 'oreburgh', 'the door is locked');
  W.load('oreburgh', { x: 17, y: 24, dir: 'down' });
  await cross('down', 'oreburgh-mine');
  assert.deepEqual([W.player.x, W.player.y], [4, 13]);
  W.load('oreburgh-mine', { x: 23, y: 4, dir: 'up' });
  await cross('up', 'oreburgh-mine-b1f');
  assert.deepEqual([W.player.x, W.player.y], [23, 11]);
  W.load('oreburgh-mine-b1f', { x: 4, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.ok(F.flag('roark-met'));
  // Roark: the Coal Badge, TM76, the end of the chapter.
  W.load('oreburgh', { x: 24, y: 7, dir: 'up' });
  await cross('up', 'oreburgh-gym');
  W.load('oreburgh-gym', { x: 6, y: 4, dir: 'up' });
  fights.length = 0;
  W.interact();
  await until(() => F.flag('chapter-45-done') && !W.locked);
  assert.deepEqual(plain(fights), [['roark', 'geodude,onix,cranidos', false]]);
  assert.ok(S.player.badges.includes(25));
  assert.equal(F.obeyCap('sinnoh'), 25);
  assert.equal(F.count('tm76'), 1);
});

test('Sinnoh (chapter 46): Route 204, the twins, the meadow and the key, the windworks and Mars, Drifloon, Cheryl in Eterna Forest, Gardenia', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'galactic-jubilife', 'barry-203', 'roark-met']) F.setFlag(f);
  F.giveMon('monferno', 22, { moves: ['ember'] });
  F.giveMon('staravia', 20, { moves: ['wing-attack'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const walk = async (dir, n) => { for (let i = 0; i < n; i++) { assert.equal(step(W, dir), 'moved'); await until(() => !W.locked); } };
  const answers = [], fights = [], wild = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  W.onTrainer = async (d, info) => { fights.push([d.id, !!(info.rules && info.rules.double)]); return 'win'; };
  W.onEncounter = async (sp, lvl) => { wild.push([G.Maps.species(sp), lvl]); return 'win'; };
  // Jubilife's road north (the Coal Badge), Route 204, the Ravaged Path.
  W.load('jubilife', { x: 17, y: 0, dir: 'up' });
  await cross('up', 'route204s');
  assert.deepEqual([W.player.x, W.player.y], [9, 21]);
  W.load('route204s', { x: 9, y: 3, dir: 'up' });
  await cross('up', 'ravaged-path');
  W.load('ravaged-path', { x: 18, y: 2, dir: 'up' });
  await cross('up', 'route204n');
  assert.deepEqual([W.player.x, W.player.y], [9, 20]);
  // The twins see you and battle two at a time.
  W.load('route204n', { x: 10, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => fights.length === 1 && !W.locked);
  assert.deepEqual(plain(fights.shift()), ['liv-liz', true]);
  W.load('route204n', { x: 9, y: 0, dir: 'up' });
  await cross('up', 'floaroma');
  assert.deepEqual([W.player.x, W.player.y], [14, 23]);
  // The windworks is locked without its key; the meadow's grunts drop it.
  W.load('valley-windworks', { x: 12, y: 7, dir: 'up' });
  step(W, 'up');
  await until(() => !W.locked);
  assert.equal(W.map.id, 'valley-windworks', 'locked');
  W.load('floaroma', { x: 14, y: 0, dir: 'up' });
  await cross('up', 'floaroma-meadow');
  await walk('up', 10);
  await until(() => F.flag('windworks-key') && !W.locked);
  assert.deepEqual(plain(fights.splice(0)), [['grunt-meadow1', false], ['grunt-meadow2', false]]);
  // The windworks: Commander Mars; then a Drifloon, once.
  W.load('valley-windworks', { x: 12, y: 7, dir: 'up' });
  await cross('up', 'windworks-inside');
  W.load('windworks-inside', { x: 6, y: 4, dir: 'up' });
  W.interact();
  await until(() => F.flag('mars-windworks') && !W.locked);
  assert.deepEqual(plain(fights.splice(0)), [['mars', false]]);
  G.Clock.weekday = () => 5;                    // the Drifloon comes on Fridays (chapter 73)
  W.load('valley-windworks', { x: 16, y: 9, dir: 'up' });
  await pump(W, W.interact());
  assert.deepEqual(plain(wild.splice(0)), [[425, 15]]);
  assert.ok(F.flag('drifloon-met'));
  // Eterna Forest: Cheryl comes along, and her Chansey heals the team after each battle.
  W.load('route205s', { x: 26, y: 0, dir: 'up' });
  await cross('up', 'eterna-forest');
  assert.deepEqual([W.player.x, W.player.y], [5, 25]);
  answers.push(0);
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('cheryl-with') && !W.locked);
  const lead = F.party()[0];
  lead.hp = 1;
  W.load('eterna-forest', { x: 14, y: 9, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => fights.length === 1 && !W.locked);
  assert.equal(fights.shift()[0], 'jack');
  assert.equal(lead.hp, G.Mon.maxHp(lead), 'Cheryl healed the team');
  const sitrus = F.count('sitrus-berry');
  W.load('eterna-forest', { x: 36, y: 12, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => F.flag('cheryl-done') && !W.locked);
  assert.equal(F.count('sitrus-berry'), sitrus + 2);
  // Without Cheryl, no more healing.
  lead.hp = 1;
  W.load('eterna-forest', { x: 33, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => fights.length === 1 && !W.locked);
  assert.equal(fights.shift()[0], 'lindsey');
  assert.equal(lead.hp, 1);
  // Route 205 east to Eterna City; Routes 211 and 206 are closed.
  W.load('eterna-forest', { x: 39, y: 12, dir: 'right' });
  await cross('right', 'route205e');
  assert.deepEqual([W.player.x, W.player.y], [0, 6]);
  W.load('route205e', { x: 23, y: 6, dir: 'right' });
  await cross('right', 'eterna');
  assert.deepEqual([W.player.x, W.player.y], [0, 13]);
  W.load('eterna', { x: 33, y: 13, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'Route 211');
  W.load('eterna', { x: 17, y: 25, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'Route 206');
  // Gardenia: the Forest Badge, TM86, the end of the chapter.
  W.load('eterna-gym', { x: 6, y: 4, dir: 'up' });
  W.interact();
  await until(() => F.flag('chapter-46-done') && !W.locked);
  assert.equal(fights.shift()[0], 'gardenia');
  assert.ok(S.player.badges.includes(26));
  assert.equal(F.obeyCap('sinnoh'), 30);
  assert.equal(F.count('tm86'), 1);
});

test('Sinnoh (chapter 47): the Eterna Building and Jupiter, the cycle shop, Cycling Road, the way north of Oreburgh, Cyrus, Hearthome, Fantina', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'galactic-jubilife', 'barry-203', 'roark-met', 'mars-windworks', 'cheryl-done']) F.setFlag(f);
  F.giveMon('monferno', 30, { moves: ['flame-wheel'] });
  F.giveMon('luxio', 28, { moves: ['bite'] });
  F.giveItem('bicycle', 1);
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  // Eterna: the building opens with the Forest Badge.
  const door = G.Maps.get('eterna').warps.find(w => w.to === 'tg-eterna-1f');
  assert.ok(!F.test(door.if), 'locked before the Forest Badge');
  S.player.badges.push(26);
  assert.ok(F.test(door.if));
  W.load('eterna', { x: 6, y: 22, dir: 'up' });
  await cross('up', 'tg-eterna-1f');
  W.load('tg-eterna-1f', { x: 13, y: 3, dir: 'up' });
  await cross('up', 'tg-eterna-2f');
  W.load('tg-eterna-2f', { x: 7, y: 4, dir: 'up' });
  W.interact();
  await until(() => F.flag('tg-eterna-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['jupiter']);
  // The cycle shop opens: a Moon Stone.
  W.load('eterna', { x: 25, y: 21, dir: 'up' });
  await cross('up', 'eterna-cycle');
  W.load('eterna-cycle', { x: 5, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.equal(F.count('moon-stone'), 1);
  // Cycling Road: on the Bicycle, rolling south.
  W.load('eterna', { x: 17, y: 27, dir: 'down' });
  await cross('down', 'route206');
  assert.deepEqual([W.player.x, W.player.y], [9, 0]);
  assert.ok(W.biking, 'Cycling Road puts you on the Bicycle');
  const me = W.player;
  G.Player.reset();
  G.Player.update(0.02, me, W);
  assert.ok(me.moving && me.dir === 'down', 'rolling down');
  // The muddy way north of Oreburgh is open; Route 207 east to Mt. Coronet, and Cyrus.
  W.load('oreburgh', { x: 17, y: 0, dir: 'up' });
  await cross('up', 'route207');
  assert.deepEqual([W.player.x, W.player.y], [5, 15]);
  W.load('route207', { x: 26, y: 8, dir: 'right' });
  await cross('right', 'mt-coronet-1f');
  assert.deepEqual([W.player.x, W.player.y], [3, 12]);
  W.load('mt-coronet-1f', { x: 15, y: 8, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => F.flag('cyrus-coronet') && !W.locked);
  W.load('mt-coronet-1f', { x: 28, y: 12, dir: 'down' });
  await cross('down', 'route208');
  assert.deepEqual([W.player.x, W.player.y], [4, 7]);
  W.load('route208', { x: 35, y: 7, dir: 'right' });
  await cross('right', 'hearthome');
  assert.deepEqual([W.player.x, W.player.y], [0, 13]);
  // Hearthome: Routes 209 and 212 are closed.
  W.load('hearthome', { x: 33, y: 13, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'Route 209');
  W.load('hearthome', { x: 17, y: 25, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'Route 212');
  // Fantina: the Relic Badge, TM65, the end of the chapter.
  W.load('hearthome-gym', { x: 6, y: 4, dir: 'up' });
  W.interact();
  await until(() => F.flag('chapter-47-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['fantina']);
  assert.ok(S.player.badges.includes(29));
  assert.equal(F.obeyCap('sinnoh'), 35);
  assert.equal(F.count('tm65'), 1);
});

test('Sinnoh (chapter 48): Route 209 after the Relic Badge, the Day Care in Solaceon, the Unown of the ruins, the Psyduck, the rain on Route 215, Veilstone, Maylene', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js',
    'js/world/puzzle.js', 'js/content/johto/route36.js', 'js/content/johto/ruins.js', 'js/content/johto/route34.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, D = G.DayCare;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'galactic-jubilife', 'barry-203', 'roark-met', 'mars-windworks', 'cheryl-done', 'tg-eterna-done', 'cyrus-coronet']) F.setFlag(f);
  F.giveMon('monferno', 33, { moves: ['flame-wheel'] });
  F.giveMon('kadabra', 30, { moves: ['psybeam'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const fights = [], rules = [];
  W.onTrainer = async (d, info) => { fights.push(d.id); rules.push(info.rules); return 'win'; };
  // Hearthome: Route 209 opens with the Relic Badge.
  W.load('hearthome', { x: 33, y: 13, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'closed before the Relic Badge');
  S.player.badges.push(29);
  W.refresh();
  assert.equal(step(W, 'right'), 'moved');
  assert.equal(step(W, 'right'), 'moved');
  await cross('right', 'route209');
  assert.deepEqual([W.player.x, W.player.y], [0, 10]);
  W.load('route209', { x: 19, y: 0, dir: 'up' });
  await cross('up', 'solaceon');
  assert.deepEqual([W.player.x, W.player.y], [15, 25]);
  // Solaceon's Day Care: leave Kadabra with the lady; her husband outside looks after it.
  W.load('solaceon', 'daycare-door');
  await cross('up', 'solaceon-daycare');
  G.PartyUI = { pick: () => Promise.resolve(1) };
  W.load('solaceon-daycare', { x: 6, y: 4, dir: 'right' });
  await pump(W, W.interact());
  assert.equal(D.list().length, 1);
  assert.equal(D.list()[0].mon.sp, 64, 'Kadabra at the Day Care');
  const said = [];
  G.Dialog.say = t => { said.push(t); return Promise.resolve(); };
  W.load('solaceon', { x: 25, y: 5, dir: 'left' });
  await pump(W, W.interact());
  assert.ok(said.some(t => /doing fine/.test(t)), JSON.stringify(said));
  // Solaceon Ruins: Unown on every floor, any letter.
  W.load('solaceon', 'ruins');
  await cross('up', 'solaceon-ruins');
  assert.deepEqual([W.player.x, W.player.y], [6, 9]);
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), info.form]); return 'run'; };
  W.debug.noEnc = false;
  W.load('solaceon-ruins', { x: 6, y: 6, dir: 'right' });
  W.seed(3);
  for (let i = 0; i < 3000 && got.length < 20; i++) { step(W, i % 2 ? 'left' : 'right'); await until(() => !W.locked); }
  W.debug.noEnc = true;
  assert.ok(got.length >= 20, 'met some: ' + got.length);
  assert.ok(got.every(([sp, f]) => sp === 201 && /^[A-Z]$/.test(f)), JSON.stringify(got));
  assert.ok(got.some(([, f]) => f > 'K'), 'letters the Ruins of Alph keep behind their panels: ' + JSON.stringify(got));
  // Route 210: the Psyduck block the way north; Route 215 to the east, in the rain.
  W.load('solaceon', { x: 15, y: 0, dir: 'up' });
  await cross('up', 'route210s');
  assert.deepEqual([W.player.x, W.player.y], [9, 23]);
  W.load('route210s', { x: 9, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the Psyduck');
  W.load('route210s', { x: 19, y: 12, dir: 'right' });
  await cross('right', 'route215');
  assert.deepEqual([W.player.x, W.player.y], [0, 7]);
  assert.ok(W.stormy(), 'rain on Route 215');
  W.load('route215', { x: 9, y: 7, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => fights.includes('kirby') && !W.locked);
  assert.equal(rules[rules.length - 1].weather, 'rain', 'and in its battles');
  W.load('route215', { x: 39, y: 7, dir: 'right' });
  await cross('right', 'veilstone');
  assert.deepEqual([W.player.x, W.player.y], [0, 13]);
  assert.ok(!W.stormy(), 'no rain in Veilstone');
  // Veilstone: Route 214 is closed, the Galactic HQ guarded, the Game Corner shut.
  W.load('veilstone', { x: 17, y: 25, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'Route 214');
  W.load('veilstone', { x: 25, y: 23, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the grunt at the HQ');
  W.load('veilstone', { x: 5, y: 21, dir: 'up' });
  step(W, 'up');
  await until(() => !W.locked);
  assert.equal(W.map.id, 'veilstone', 'the Game Corner is shut');
  // Maylene: the Cobble Badge, TM60, the end of the chapter.
  W.load('veilstone', 'gym-door');
  await cross('up', 'veilstone-gym');
  W.load('veilstone-gym', { x: 6, y: 4, dir: 'up' });
  W.interact();
  await until(() => F.flag('chapter-48-done') && !W.locked);
  assert.ok(fights.includes('maylene'));
  assert.ok(S.player.badges.includes(27));
  assert.equal(F.obeyCap('sinnoh'), 40);
  assert.equal(F.count('tm60'), 1);
});

test('Sinnoh (chapter 49): Route 214 after the Cobble Badge, the lakefront, Route 213, Pastoria, a Safari Game in the Great Marsh, Wake, the bomb, the grunt, Barry', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 29];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'galactic-jubilife', 'barry-203', 'roark-met', 'mars-windworks', 'cheryl-done', 'tg-eterna-done', 'cyrus-coronet']) F.setFlag(f);
  F.setVar('barry-starter', 393);
  F.money(5000);
  F.giveMon('infernape', 38, { moves: ['flame-wheel'] });
  F.giveMon('luxray', 36, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  // Veilstone: Route 214 opens with the Cobble Badge.
  W.load('veilstone', { x: 17, y: 25, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'closed before the Cobble Badge');
  S.player.badges.push(27);
  W.refresh();
  assert.equal(step(W, 'down'), 'moved');
  assert.equal(step(W, 'down'), 'moved');
  await cross('down', 'route214');
  assert.deepEqual([W.player.x, W.player.y], [14, 0]);
  // The tunnel is blocked; south to Valor Lakefront.
  W.load('route214', { x: 5, y: 42, dir: 'up' });
  step(W, 'up');
  await until(() => !W.locked);
  assert.equal(W.map.id, 'route214', 'the tunnel is blocked');
  W.load('route214', { x: 14, y: 43, dir: 'down' });
  await cross('down', 'valor-lakefront');
  assert.deepEqual([W.player.x, W.player.y], [20, 0]);
  // Lake Valor is closed; the hotel and the restaurant are open; nobody stands before the hotel.
  W.load('valor-lakefront', { x: 3, y: 12, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'Lake Valor');
  W.load('valor-lakefront', { x: 11, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved', 'no grunt yet');
  assert.equal(step(W, 'up'), 'moved');
  await cross('up', 'hotel-grand-lake');
  W.load('valor-lakefront', 'restaurant-door');
  await cross('up', 'seven-stars');
  // Route 213: the locked cottages, west to Pastoria.
  W.load('valor-lakefront', { x: 20, y: 25, dir: 'down' });
  await cross('down', 'route213');
  assert.deepEqual([W.player.x, W.player.y], [44, 0]);
  W.load('route213', { x: 31, y: 5, dir: 'up' });
  step(W, 'up');
  await until(() => !W.locked);
  assert.equal(W.map.id, 'route213', 'the cottage is locked');
  W.load('route213', { x: 0, y: 6, dir: 'left' });
  await cross('left', 'pastoria');
  assert.deepEqual([W.player.x, W.player.y], [37, 14]);
  W.load('pastoria', { x: 2, y: 14, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'Route 212');
  // The Great Marsh: the gate sells a Safari Game.
  W.load('pastoria', 'gate-door');
  await cross('up', 'marsh-gate');
  const money = S.player.money;
  W.load('marsh-gate', { x: 3, y: 4, dir: 'up' });
  await pump(W, W.interact());
  await until(() => W.map.id === 'great-marsh-1' && !W.locked);
  assert.equal(S.player.money, money - 500);
  assert.equal(F.count('safari-ball'), 30);
  assert.equal(+F.getVar('safari-steps'), 500);
  // Every step counts, the areas join up, and the rare Pokémon turn up.
  W.load('great-marsh-1', { x: 14, y: 17, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  assert.equal(+F.getVar('safari-steps'), 499);
  W.load('great-marsh-1', { x: 14, y: 0, dir: 'up' });
  await cross('up', 'great-marsh-2');
  W.load('great-marsh-2', { x: 14, y: 0, dir: 'up' });
  await cross('up', 'great-marsh-3');
  const met = new Set();
  W.onEncounter = async sp => { met.add(G.Maps.species(sp)); return 'run'; };
  W.debug.noEnc = false;
  F.setVar('safari-steps', 99999);
  W.load('great-marsh-3', { x: 5, y: 15, dir: 'right' });
  W.seed(5);
  for (let i = 0; i < 6000 && met.size < 12; i++) { step(W, i % 2 ? 'left' : 'right'); await until(() => !W.locked); }
  W.debug.noEnc = true;
  assert.ok(met.size >= 12, 'met ' + met.size);
  // Out of steps: back at the marsh's own gate, not Kanto's.
  F.setVar('safari-steps', 1);
  W.load('great-marsh-1', { x: 14, y: 17, dir: 'up' });
  step(W, 'up');
  await until(() => W.map.id === 'marsh-gate' && !W.locked);
  assert.ok(!F.flag('safari-on') && !F.count('safari-ball'), 'the game is over');
  // Wake: the Fen Badge and TM55.
  W.load('pastoria-gym', { x: 7, y: 4, dir: 'up' });
  W.interact();
  await until(() => S.player.badges.includes(28) && !W.locked);
  assert.deepEqual(fights.splice(0).filter(id => id !== 'kirby'), ['wake']);
  assert.equal(F.obeyCap('sinnoh'), 50);
  assert.equal(F.count('tm55'), 1);
  assert.ok(!F.flag('chapter-49-done'), 'not the end of the chapter yet');
  // Barry at the Gym door; the grunt and his test bomb at the marsh gate.
  W.load('pastoria', { x: 22, y: 12, dir: 'down' });
  await pump(W, W.interact());
  W.load('pastoria', { x: 17, y: 6, dir: 'up' });
  W.interact();
  await until(() => F.flag('marsh-bomb') && !W.locked);
  // He is caught at the lakefront: Croagunk, and Wake sends you back.
  W.load('valor-lakefront', { x: 10, y: 12, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => F.flag('lakefront-grunt') && !W.locked);
  assert.deepEqual(fights.splice(0), ['grunt-lakefront']);
  W.load('valor-lakefront', { x: 11, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved', 'the grunt is gone');
  // Barry: the end of the chapter.
  W.load('pastoria', { x: 29, y: 14, dir: 'right' });
  W.interact();
  await until(() => F.flag('chapter-49-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['barry-pastoria']);
  assert.ok(F.flag('barry-pastoria'));
});

test('Sinnoh (chapter 50): the Psyduck and the SecretPotion, the fog on Route 210, Celestic Town, the grunt at the ruins, Cyrus, the elder', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'galactic-jubilife', 'barry-203', 'roark-met', 'mars-windworks', 'cheryl-done', 'tg-eterna-done', 'cyrus-coronet',
                   'marsh-bomb', 'lakefront-grunt', 'barry-pastoria']) F.setFlag(f);
  F.giveMon('infernape', 40, { moves: ['flame-wheel'] });
  F.giveMon('luxray', 38, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  // Without the SecretPotion the Psyduck stay.
  W.load('route210s', { x: 9, y: 2, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the Psyduck');
  await pump(W, W.interact());
  assert.ok(!F.flag('psyduck-cured'));
  assert.equal(step(W, 'up'), 'blocked', 'still there');
  // Wake sends you to the lakefront; Cynthia gives it.
  W.load('pastoria', { x: 23, y: 12, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'Wake outside his Gym');
  W.load('valor-lakefront', { x: 24, y: 12, dir: 'up' });
  await pump(W, W.interact());
  await until(() => F.flag('cynthia-potion') && !W.locked);
  assert.equal(F.count('secret-potion'), 1);
  assert.equal(step(W, 'up'), 'moved', 'Cynthia has gone');
  // Back on Route 210: yes, and the way is open; Cynthia gives the Old Charm.
  W.load('route210s', { x: 9, y: 2, dir: 'up' });
  W.interact();
  await until(() => F.flag('psyduck-cured') && F.count('old-charm') === 1 && !W.locked);
  assert.equal(F.count('secret-potion'), 0);
  W.load('route210s', { x: 9, y: 2, dir: 'up' });
  assert.ok(!W.foggy(), 'no fog south of the Psyduck');
  assert.equal(step(W, 'up'), 'moved');
  assert.equal(step(W, 'up'), 'moved');
  await cross('up', 'route210n');
  assert.deepEqual([W.player.x, W.player.y], [34, 29]);
  assert.ok(W.foggy(), 'fog on Route 210');
  // The Cafe Cabin; west over the bridge to Celestic Town, where Route 211 is closed.
  W.load('route210n', 'cafe-door');
  await cross('up', 'cafe-cabin');
  W.load('route210n', { x: 0, y: 8, dir: 'left' });
  await cross('left', 'celestic');
  assert.deepEqual([W.player.x, W.player.y], [33, 10]);
  assert.ok(!W.foggy(), 'no fog in town');
  W.load('celestic', { x: 2, y: 10, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'Route 211');
  // The elder cannot take the charm yet.
  W.load('celestic-elder', { x: 6, y: 4, dir: 'right' });
  await pump(W, W.interact());
  assert.equal(F.count('old-charm'), 1, 'not while they are in the ruins');
  // The grunt stands in the mouth of the ruins.
  W.load('celestic', { x: 15, y: 20, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the grunt');
  W.interact();
  await until(() => F.flag('celestic-grunt') && !W.locked);
  assert.deepEqual(fights.splice(0), ['grunt-celestic']);
  W.load('celestic', { x: 16, y: 20, dir: 'up' });
  await cross('up', 'celestic-ruins');
  assert.deepEqual([W.player.x, W.player.y], [6, 9]);
  // Cyrus before the mural.
  W.load('celestic-ruins', { x: 6, y: 4, dir: 'up' });
  W.interact();
  await until(() => F.flag('cyrus-celestic') && !W.locked);
  assert.deepEqual(fights.splice(0), ['cyrus']);
  // The elder: TM51, the end of the chapter.
  W.load('celestic-elder', { x: 6, y: 4, dir: 'right' });
  W.interact();
  await until(() => F.flag('chapter-50-done') && !W.locked);
  assert.equal(F.count('old-charm'), 0);
  assert.equal(F.count('tm51'), 1);
});

test('Sinnoh (chapter 51): Route 218 after chapter 50, Barry on the bridge, the shut Gym, the boat, Riley and his healing, the grunts, the Riolu Egg, Byron', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, D = G.DayCare;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'galactic-jubilife', 'barry-203', 'roark-met', 'mars-windworks', 'cheryl-done', 'tg-eterna-done', 'cyrus-coronet',
                   'marsh-bomb', 'lakefront-grunt', 'barry-pastoria', 'cynthia-potion', 'psyduck-cured', 'cyrus-celestic']) F.setFlag(f);
  F.setVar('barry-starter', 393);
  F.giveMon('infernape', 44, { moves: ['flame-wheel'] });
  F.giveMon('luxray', 42, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  // Jubilife: Route 218 is closed until chapter 50 is over.
  W.load('jubilife', { x: 2, y: 13, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'closed before the end of chapter 50');
  F.setFlag('chapter-50-done');
  W.refresh();
  assert.equal(step(W, 'left'), 'moved');
  assert.equal(step(W, 'left'), 'moved');
  await cross('left', 'route218');
  assert.deepEqual([W.player.x, W.player.y], [39, 7]);
  W.load('route218', { x: 0, y: 7, dir: 'left' });
  await cross('left', 'canalave');
  assert.deepEqual([W.player.x, W.player.y], [39, 14]);
  // Barry stops you at the bridge.
  W.load('canalave', { x: 23, y: 14, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await until(() => F.flag('barry-canalave') && !W.locked);
  assert.deepEqual(fights.splice(0), ['barry-canalave']);
  W.load('canalave', { x: 23, y: 15, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await until(() => !W.locked);
  assert.deepEqual(fights, [], 'only once');
  // The Gym is shut.
  W.load('canalave', { x: 9, y: 11, dir: 'up' });
  step(W, 'up');
  await until(() => !W.locked);
  assert.equal(W.map.id, 'canalave', 'Byron is away');
  // The boat to Iron Island, and down the mine.
  W.load('canalave', { x: 12, y: 23, dir: 'left' });
  W.interact();
  await until(() => W.map.id === 'iron-island' && !W.locked);
  assert.deepEqual([W.player.x, W.player.y], [11, 17]);
  W.load('iron-island', { x: 12, y: 9, dir: 'up' });
  await cross('up', 'iron-1f');
  assert.deepEqual([W.player.x, W.player.y], [10, 10]);
  W.load('iron-1f', { x: 18, y: 4, dir: 'up' });
  await cross('up', 'iron-b1f');
  assert.deepEqual([W.player.x, W.player.y], [3, 4]);
  // Before Riley comes along, nobody heals you.
  const mon = F.party()[0];
  mon.hp = 1;
  W.load('iron-b1f', { x: 7, y: 8, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => fights.includes('lawrence') && !W.locked);
  assert.equal(mon.hp, 1, 'no healing yet');
  fights.splice(0);
  // Riley stands in the way, and comes along.
  W.load('iron-b1f', { x: 13, y: 8, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'Riley');
  W.interact();
  await until(() => F.flag('riley-with') && !W.locked);
  assert.equal(step(W, 'right'), 'moved', 'he has joined you');
  // After each battle his Lucario heals the team.
  W.load('iron-b1f', { x: 18, y: 10, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => fights.includes('summer-iron') && !W.locked);
  assert.equal(mon.hp, G.Mon.maxHp(mon), 'healed');
  fights.splice(0);
  W.load('iron-b1f', { x: 26, y: 13, dir: 'down' });
  await cross('down', 'iron-b2f');
  assert.deepEqual([W.player.x, W.player.y], [3, 4]);
  // The first grunt blocks the way to the second.
  W.load('iron-b2f', { x: 3, y: 13, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'the first grunt');
  W.interact();
  await until(() => F.flag('iron-grunt1') && !W.locked);
  assert.equal(step(W, 'down'), 'moved', 'he has run');
  fights.splice(0);
  // With six Eggs carried, Riley waits; with room, he gives the Riolu Egg.
  const full = [];
  while (D.eggs().length < D.MAX_EGGS) { const e = D.egg(172); D.eggs().push(e); full.push(e); }
  W.load('iron-b2f', { x: 6, y: 16, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => F.flag('riley-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['grunt-iron2']);
  assert.ok(!F.flag('riolu-egg') && F.flag('riley-egg-wait'), 'no room for it');
  D.eggs().splice(0);
  W.load('iron-b2f', { x: 13, y: 16, dir: 'right' });
  W.interact();
  await until(() => F.flag('riolu-egg') && !W.locked);
  assert.equal(D.eggs().length, 1);
  assert.equal(D.eggs()[0].mon.sp, 447, 'Riolu');
  // Back by boat: the Gym is open, and Byron gives the Mine Badge.
  W.load('iron-island', { x: 11, y: 17, dir: 'right' });
  W.interact();
  await until(() => W.map.id === 'canalave' && !W.locked);
  assert.deepEqual([W.player.x, W.player.y], [12, 23]);
  W.load('canalave', 'gym-door');
  await cross('up', 'canalave-gym');
  W.load('canalave-gym', { x: 7, y: 4, dir: 'up' });
  W.interact();
  await until(() => F.flag('chapter-51-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['byron']);
  assert.ok(S.player.badges.includes(30));
  assert.equal(F.obeyCap('sinnoh'), 60);
  assert.equal(F.count('tm91'), 1);
});

test('Sinnoh (chapter 52): the meeting in the library, the bomb, Lake Valor and Saturn, Lake Verity and Mars', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'sinnoh-briefcase', 'galactic-jubilife', 'barry-203', 'roark-met', 'mars-windworks', 'cheryl-done', 'tg-eterna-done', 'cyrus-coronet',
                   'marsh-bomb', 'lakefront-grunt', 'barry-pastoria', 'cynthia-potion', 'psyduck-cured', 'cyrus-celestic', 'chapter-50-done', 'barry-canalave', 'riley-done']) F.setFlag(f);
  F.giveMon('infernape', 46, { moves: ['flame-wheel'] });
  F.giveMon('luxray', 44, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  // Before the Mine Badge nothing happens in the library, and nobody waits by the Gym.
  W.load('canalave-library', 'door');
  assert.ok(!seen('rowan'));
  assert.equal(step(W, 'up'), 'moved');
  await until(() => !W.locked);
  assert.ok(!F.flag('lake-blast'));
  W.load('canalave', { x: 9, y: 12, dir: 'down' });
  assert.equal(step(W, 'down'), 'moved', 'nobody there yet');
  // Lake Valor is still closed.
  W.load('valor-lakefront', { x: 3, y: 12, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'the guard');
  // With the badge Dawn waits by the Gym, Lucas for a girl.
  S.player.badges.push(30);
  W.load('canalave', { x: 9, y: 12, dir: 'down' });
  assert.ok(seen('dawn') && !seen('lucas'));
  assert.equal(step(W, 'down'), 'blocked', 'Dawn');
  S.player.gender = 'f';
  W.refresh();
  assert.ok(seen('lucas') && !seen('dawn'));
  await pump(W, W.interact());
  S.player.gender = 'm';
  W.refresh();
  // The meeting starts on the first step in, and the bomb ends it.
  W.load('canalave-library', 'door');
  assert.ok(seen('rowan') && seen('barry') && seen('dawn'));
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('lake-blast') && !W.locked);
  assert.ok(!seen('rowan') && !seen('barry'), 'they have all gone');
  // The guard has left: west to Lake Valor.
  W.load('valor-lakefront', { x: 1, y: 12, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await cross('left', 'lake-valor');
  assert.deepEqual([W.player.x, W.player.y], [29, 10]);
  // The grunt stands before the cavern until he is beaten.
  W.load('lake-valor', { x: 14, y: 13, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('valor-gate') && !W.locked);
  assert.deepEqual(fights.splice(0), ['grunt-valor3']);
  W.load('lake-valor', { x: 14, y: 11, dir: 'up' });
  await cross('up', 'valor-cavern');
  assert.deepEqual([W.player.x, W.player.y], [7, 8]);
  // Lake Verity is quiet until Saturn falls.
  W.load('lake-verity', { x: 9, y: 7, dir: 'up' });
  assert.ok(!seen('mars') && !seen('dawn2'), 'nobody at Lake Verity yet');
  assert.equal(step(W, 'up'), 'moved');
  // Saturn in the cavern.
  W.load('valor-cavern', { x: 7, y: 5, dir: 'up' });
  W.interact();
  await until(() => F.flag('saturn-valor') && !W.locked);
  assert.deepEqual(fights.splice(0), ['saturn']);
  assert.ok(!seen('saturn'), 'he has gone');
  // Lake Verity: Team Galactic and Dawn are there now.
  W.load('lake-verity', { x: 9, y: 7, dir: 'up' });
  assert.ok(seen('mars') && seen('dawn2') && !seen('lucas2'));
  assert.equal(step(W, 'up'), 'blocked', 'Mars');
  W.interact();
  await until(() => F.flag('chapter-52-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['mars']);
  // Everybody has left.
  W.load('lake-verity', { x: 9, y: 7, dir: 'up' });
  assert.ok(!seen('mars') && !seen('dawn2') && !seen('grunt-verity1'));
  assert.equal(step(W, 'up'), 'moved');
});

test('Sinnoh (chapter 53): Celestic to the snow, Hail in battle, Barry on the slope, the ice of the Gym, Candice, Lake Acuity', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint'].map(f => `js/content/sinnoh/${f}.js`);
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  for (const f of ['sinnoh-start', 'sinnoh-dex', 'sinnoh-briefcase', 'galactic-jubilife', 'barry-203', 'roark-met', 'mars-windworks', 'cheryl-done', 'tg-eterna-done', 'cyrus-coronet',
                   'marsh-bomb', 'lakefront-grunt', 'barry-pastoria', 'cynthia-potion', 'psyduck-cured', 'cyrus-celestic', 'chapter-50-done', 'barry-canalave', 'riley-done',
                   'lake-blast', 'valor-gate', 'saturn-valor', 'mars-verity']) F.setFlag(f);
  F.giveMon('infernape', 47, { moves: ['flame-wheel'] });
  F.giveMon('luxray', 45, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const cross = async (dir, to) => { assert.equal(step(W, dir), 'moved'); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const fights = [], weather = [];
  W.onTrainer = async (d, info) => { fights.push(d.id); weather.push(info.rules.weather); return 'win'; };
  // Celestic Town: the hiker stays until chapter 52 is over.
  W.load('celestic', { x: 2, y: 10, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'the hiker');
  F.setFlag('chapter-52-done');
  W.load('celestic', { x: 1, y: 10, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await cross('left', 'route211e');
  at(29, 9);
  // Route 211, Mt. Coronet, Routes 216 and 217 to the lakefront.
  W.load('route211e', { x: 6, y: 7, dir: 'up' });
  await cross('up', 'mt-coronet-north');
  at(28, 12);
  W.load('mt-coronet-north', { x: 3, y: 12, dir: 'down' });
  await cross('down', 'route216');
  at(38, 8);
  W.load('route216', { x: 6, y: 1, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await cross('up', 'route217');
  at(14, 33);
  W.load('route217', { x: 18, y: 1, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await cross('up', 'acuity-lakefront');
  at(14, 21);
  // Hail in a battle on Route 216, and the lodge heals.
  W.load('route216', { x: 29, y: 10, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await until(() => fights.length === 1 && !W.locked);
  assert.deepEqual([fights.splice(0), weather.splice(0)], [['bradley'], ['hail']]);
  for (const id of ['route216', 'route217', 'acuity-lakefront', 'lake-acuity']) assert.ok(G.Maps.get(id).def.hail && G.Maps.get(id).def.snow, id);
  assert.ok(G.Maps.get('snowpoint').def.snow && !G.Maps.get('snowpoint').def.hail, 'no Hail in town');
  F.party()[0].hp = 1;
  W.load('route216-lodge', { x: 7, y: 4, dir: 'up' });
  await pump(W, W.interact());
  assert.equal(F.party()[0].hp, G.Mon.maxHp(F.party()[0]));
  // Barry calls you on the way to the town, then stays in the slope.
  W.load('acuity-lakefront', { x: 14, y: 13, dir: 'up' });
  assert.ok(seen('barry'));
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('barry-lakefront') && !W.locked);
  W.load('acuity-lakefront', { x: 14, y: 10, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'Barry');
  W.load('acuity-lakefront', { x: 28, y: 11, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await cross('right', 'snowpoint');
  at(0, 15);
  // The Gym: the way over the ice, with real slides; the Trainers on the platforms stop you.
  W.load('snowpoint-gym', 'door');
  const way = 'up up left up right up up right right right right up right right right right up up left up right up up left left up left left up up right down right up left up up left left left left';
  for (const d of way.split(' ')) {
    step(W, d);
    for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; }
  }
  at(7, 3);
  assert.deepEqual(fights.splice(0).sort(), ['alicia', 'brenna', 'isaiah', 'sergio']);
  assert.equal(step(W, 'up'), 'blocked', 'Candice');
  W.player.dir = 'up';
  W.interact();
  await until(() => S.player.badges.includes(31) && !W.locked);
  assert.deepEqual(fights.splice(0), ['candice']);
  assert.equal(F.obeyCap('sinnoh'), 70);
  assert.equal(F.count('tm72'), 1);
  // Barry has gone up, and the slope is open.
  W.load('acuity-lakefront', { x: 14, y: 10, dir: 'up' });
  assert.ok(!seen('barry'));
  assert.equal(step(W, 'up'), 'moved');
  W.load('acuity-lakefront', { x: 14, y: 1, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await cross('up', 'lake-acuity');
  at(13, 21);
  // Lake Acuity: Jupiter leaves with Uxie, Barry goes to train, and the chapter ends.
  assert.ok(seen('jupiter') && seen('grunt1') && seen('barry'));
  W.load('lake-acuity', { x: 13, y: 19, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('chapter-53-done') && !W.locked);
  assert.ok(F.flag('jupiter-acuity') && F.flag('barry-acuity'));
  assert.deepEqual(fights, [], 'no battle at the lake');
  // Everybody has left.
  W.load('lake-acuity', { x: 13, y: 17, dir: 'up' });
  assert.ok(!seen('jupiter') && !seen('grunt1') && !seen('barry'));
  assert.equal(step(W, 'up'), 'moved');
});

test('Sinnoh (chapter 54): Looker, the warehouse, warp panels, the Galactic Key, the speech, Cyrus, Saturn and the three tanks', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 31 }, (_, i) => i + 1);
  F.giveMon('infernape', 49, { moves: ['flame-wheel'] });
  const until = async ok => { for (let i = 0; i < 600 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const walk = async dirs => { for (const d of dirs.split(' ')) { assert.equal(step(W, d), 'moved', d); await settle(); } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  // Before Lake Acuity the grunt keeps you out, and both doors are locked.
  W.load('veilstone', { x: 26, y: 24, dir: 'up' });
  await talk();
  assert.ok(!F.flag('looker-key') && seen('grunt'));
  W.load('veilstone', { x: 31, y: 6, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the warehouse is locked');
  await settle();
  // After it he runs off, and Looker has the key to the warehouse.
  F.setFlag('jupiter-acuity');
  W.load('veilstone', { x: 26, y: 24, dir: 'up' });
  await talk();
  assert.ok(F.flag('looker-key') && !seen('grunt') && !seen('looker'));
  W.load('veilstone', { x: 26, y: 23, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the front door needs the Galactic Key');
  await settle();
  W.load('veilstone', { x: 31, y: 6, dir: 'up' });
  await cross('up', 'galactic-warehouse');
  at(7, 10);
  // Looker opens the security door, and goes down first.
  await walk('up up up');
  at(7, 7);
  assert.ok(!F.flag('looker-door'));
  step(W, 'up');
  await until(() => F.flag('looker-door') && !W.locked);
  assert.ok(!seen('looker'));
  await walk('up up up');
  at(7, 3);
  W.load('galactic-warehouse', 'stairs');
  await cross('up', 'galactic-warehouse-b1f');
  at(1, 3);
  // Warp panels, there and back.
  const panel = async (mapId, x, y, tx, ty) => {
    W.load(mapId, { x, y: y - 1, dir: 'down' });
    step(W, 'down');
    await settle();
    at(tx, ty);
  };
  await panel('galactic-warehouse-b1f', 5, 7, 9, 7);
  await panel('galactic-warehouse-b1f', 9, 7, 5, 7);
  await panel('galactic-warehouse-b1f', 2, 7, 19, 7);
  await panel('galactic-warehouse-b1f', 19, 7, 2, 7);
  await panel('galactic-hq-2f', 10, 7, 15, 7);
  await panel('galactic-hq-2f', 15, 7, 10, 7);
  // The door up to the building: the Card Key does nothing here, the Galactic Key does.
  F.giveItem('card-key', 1);
  // (A map without `doorKey`, like Silph Co., still wants the Card Key.)
  G.Maps.def({ id: 't-door', tileset: 'indoor', palette: 'lab', rows: ['WWW', '+n+'], spots: { start: [0, 1, 'right'] } });
  W.load('t-door', 'start');
  await talk();
  assert.ok(F.flag('door:t-door:1,1'), 'the Card Key opens its own doors');
  W.load('galactic-warehouse-b1f', { x: 21, y: 5, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked');
  await settle();
  await talk();
  assert.ok(!F.flag('door:galactic-warehouse-b1f:22,5'));
  W.load('galactic-warehouse-b1f', { x: 21, y: 3, dir: 'up' });
  await talk();
  assert.equal(F.count('galactic-key'), 1, 'the key on the floor');
  W.load('galactic-warehouse-b1f', { x: 21, y: 5, dir: 'right' });
  await talk();
  assert.ok(F.flag('door:galactic-warehouse-b1f:22,5'));
  await walk('right right');
  W.load('galactic-warehouse-b1f', 'from-above');
  await cross('up', 'galactic-hq-1f');
  at(1, 3);
  // The front door opens from outside now.
  W.load('veilstone', { x: 26, y: 23, dir: 'up' });
  await cross('up', 'galactic-hq-1f');
  at(10, 9);
  W.load('galactic-hq-1f', 'from-above');
  await cross('up', 'galactic-hq-2f');
  at(1, 3);
  W.load('galactic-hq-2f', 'from-above');
  await cross('up', 'galactic-hq-3f');
  at(19, 3);
  // The speech, once.
  W.load('galactic-hq-3f', { x: 16, y: 4, dir: 'left' });
  await talk();
  assert.ok(F.flag('door:galactic-hq-3f:15,4'));
  assert.ok(seen('boss') && seen('crowd1'));
  await walk('left');
  step(W, 'left');
  await until(() => F.flag('cyrus-speech') && !W.locked);
  assert.ok(!seen('boss') && !seen('crowd1'));
  at(14, 4);
  await walk('right left');
  // The warp panel to the laboratory has no power yet.
  W.load('galactic-hq-4f', { x: 11, y: 5, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'switched off');
  await settle();
  W.load('galactic-hq-4f', { x: 7, y: 4, dir: 'up' });
  fights.length = 0;
  W.interact();
  await until(() => F.flag('cyrus-hq') && !W.locked);
  assert.deepEqual(fights.splice(0), ['cyrus']);
  assert.equal(F.count('master-ball'), 1);
  assert.ok(!seen('cyrus'));
  W.load('galactic-hq-4f', { x: 11, y: 5, dir: 'up' });
  await cross('up', 'galactic-hq-lab');
  at(10, 9);
  // Saturn stands in the one way through.
  assert.ok(seen('uxie') && seen('mesprit') && seen('azelf') && seen('saturn'));
  W.load('galactic-hq-lab', { x: 9, y: 7, dir: 'up' });
  W.interact();
  await until(() => F.flag('saturn-hq') && !W.locked);
  assert.deepEqual(fights.splice(0), ['saturn']);
  await walk('up up');
  at(9, 5);
  assert.ok(seen('saturn2'));
  // The switch frees the three, and the chapter ends.
  W.load('galactic-hq-lab', { x: 15, y: 5, dir: 'right' });
  await talk();
  assert.ok(F.flag('trio-free') && F.flag('chapter-54-done'));
  assert.ok(!seen('uxie') && !seen('mesprit') && !seen('azelf') && !seen('saturn2') && !seen('looker'));
  W.load('galactic-hq-lab', { x: 15, y: 5, dir: 'right' });
  assert.ok(!seen('uxie'));
  await talk();
  // The way out: the panel goes back to Cyrus's office.
  W.load('galactic-hq-lab', { x: 10, y: 8, dir: 'down' });
  await cross('down', 'galactic-hq-4f');
  at(11, 4);
});

test('Sinnoh (chapter 55): the ladder, the way up, Hail in the snow, the grunts at the Spear Pillar, the ritual, a loss and a win beside Barry', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 31 }, (_, i) => i + 1);
  S.player.lastHeal = { map: 'veilstone-center', spot: 'mat' };
  F.setFlag('cyrus-coronet');
  F.setVar('barry-starter', 393);
  F.giveMon('infernape', 51, { moves: ['flame-wheel'] });
  F.giveMon('luxray', 49, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 800 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [], infos = [];
  let result = 'win';
  W.onTrainer = async (d, info) => { fights.push(d.id); infos.push(info); return result; };
  // The ladder opens when the lake Pokémon are free.
  W.load('mt-coronet-1f', { x: 14, y: 4, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'fallen rocks');
  await settle();
  F.setFlag('trio-free');
  await cross('up', 'coronet-2f');
  at(2, 14);
  // Each way up, and back down.
  const link = async (from, x, y, dir, to, tx, ty) => { W.load(from, { x, y, dir }); await cross(dir, to); at(tx, ty); };
  await link('coronet-2f', 2, 14, 'down', 'mt-coronet-1f', 14, 4);
  await link('coronet-2f', 25, 3, 'up', 'coronet-4f', 3, 13);
  await link('coronet-4f', 3, 13, 'left', 'coronet-2f', 25, 3);
  await link('coronet-4f', 15, 3, 'up', 'coronet-snow', 6, 11);
  await link('coronet-snow', 6, 11, 'up', 'coronet-4f', 15, 3);
  await link('coronet-snow', 21, 3, 'up', 'coronet-5f', 10, 11);
  await link('coronet-5f', 10, 11, 'down', 'coronet-snow', 21, 3);
  await link('coronet-5f', 3, 3, 'up', 'coronet-6f', 3, 8);
  await link('coronet-6f', 3, 8, 'left', 'coronet-5f', 3, 3);
  await link('coronet-6f', 14, 3, 'up', 'coronet-top', 3, 9);
  await link('coronet-top', 3, 9, 'left', 'coronet-6f', 14, 3);
  await link('coronet-top', 22, 3, 'up', 'spear-pillar', 8, 15);
  await link('spear-pillar', 8, 15, 'down', 'coronet-top', 22, 3);
  // Hail outside.
  const snow = G.Maps.get('coronet-snow').def;
  assert.ok(snow.snow && snow.hail);
  // The two grunts fill the way, and fight two against two.
  W.load('spear-pillar', { x: 8, y: 15, dir: 'up' });
  assert.ok(seen('pair') && seen('cyrus') && seen('mars') && seen('jupiter') && !seen('dialga') && !seen('barry'));
  await settle();
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('pillar-grunts') && !W.locked);
  assert.deepEqual(fights.splice(0), ['pair']);
  assert.ok(infos.splice(0)[0].rules.double);
  assert.ok(!seen('pair'));
  // The ritual. A loss: back at the last place you healed, and it can all happen again.
  result = 'lose';
  W.load('spear-pillar', { x: 8, y: 11, dir: 'up' });
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'veilstone-center' && !W.locked);
  assert.deepEqual(fights.splice(0), ['commanders']);
  let info = infos.splice(0)[0];
  assert.ok(info.rules.double && info.rules.tag);
  assert.equal(info.partner.team.length, 6);
  assert.equal(info.partner.team[5][0], 'empoleon', "Barry's starter");
  assert.ok(!F.flag('pillar-done'));
  // A win.
  result = 'win';
  F.party()[0].hp = 1;
  W.load('spear-pillar', { x: 8, y: 11, dir: 'up' });
  assert.ok(seen('cyrus') && !seen('barry'));
  await settle();
  step(W, 'up');
  await until(() => F.flag('chapter-55-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['commanders']);
  assert.ok(F.party().every(m => m.hp === G.Mon.maxHp(m)), 'Barry healed the team');
  // Who is left.
  W.load('spear-pillar', { x: 8, y: 9, dir: 'up' });
  assert.ok(!seen('cyrus') && !seen('mars') && !seen('jupiter') && !seen('dialga') && !seen('palkia'));
  assert.ok(seen('barry') && seen('cynthia'));
  assert.deepEqual(fights, []);
  // Nobody stands in the way out.
  for (const x of [8, 9]) {
    W.load('spear-pillar', { x, y: 11, dir: 'down' });
    for (let i = 0; i < 3; i++) { assert.equal(step(W, 'down'), 'moved', 'row ' + (12 + i)); await settle(); }
    at(x, 14);
  }
});

test('Sinnoh (chapter 56): the rift, the islands, the boulders, Cyrus, Giratina, Sendoff Spring, Turnback Cave and the tunnel', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W, later } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 31 }, (_, i) => i + 1);
  S.player.lastHeal = { map: 'veilstone-center', spot: 'mat' };
  for (const f of ['pillar-grunts', 'pillar-done', 'chapter-55-done']) F.setFlag(f);
  F.giveMon('infernape', 52, { moves: ['flame-wheel', 'strength'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const wilds = [], fights = [];
  let wild = 'win';
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  W.onEncounter = async (sp, lvl) => { wilds.push([sp, lvl]); return wild; };
  // The rift, and the first island: Cynthia and the shadow, once.
  W.load('spear-pillar', { x: 8, y: 6, dir: 'up' });
  assert.ok(seen('cynthia') && seen('barry'));
  await cross('up', 'distortion-1');
  await until(() => F.flag('distortion-entered') && !W.locked);
  at(10, 9);
  assert.ok(!seen('cynthia'));
  // The void cannot be walked into, and the panel leads back out.
  W.load('distortion-1', { x: 8, y: 9, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked');
  W.load('distortion-1', { x: 10, y: 8, dir: 'down' });
  await cross('down', 'spear-pillar');
  at(8, 6);
  // Island to island.
  W.load('distortion-1', { x: 11, y: 3, dir: 'up' });
  await cross('up', 'distortion-2');
  await until(() => F.flag('distortion-guides') && !W.locked);
  at(3, 2);
  assert.ok(!seen('uxie') && !seen('cynthia'));
  const panel = async (x, y, dir, tx, ty) => {
    W.load('distortion-2', { x, y, dir });
    step(W, dir);
    await settle();
    at(tx, ty);
  };
  await panel(6, 3, 'down', 3, 8);
  await panel(3, 7, 'down', 6, 4);
  await panel(6, 9, 'down', 19, 2);
  await panel(19, 1, 'down', 6, 10);
  await panel(23, 3, 'down', 19, 8);
  await panel(19, 7, 'down', 23, 4);
  W.load('distortion-2', { x: 23, y: 9, dir: 'down' });
  await cross('down', 'distortion-3');
  at(20, 6);
  // The panel down stays dark until the three holes are full.
  assert.ok(seen('uxie') && seen('mesprit') && seen('azelf') && seen('cynthia'));
  W.load('distortion-3', { x: 10, y: 7, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'dark');
  await settle();
  // Walking into a hole drops you back to the start.
  W.load('distortion-3', { x: 3, y: 3, dir: 'up' });
  await cross('up', 'distortion-3');
  await settle();
  at(20, 6);
  // Real pushes with Strength.
  const push = async (dir, n) => {
    for (let i = 0; i < n; i++) {
      later(1000);
      assert.equal(step(W, dir), 'blocked', 'a push does not move the player');
      if (i < n - 1) { later(1000); assert.equal(step(W, dir), 'moved'); await settle(); }
    }
  };
  const walk = async dirs => { for (const d of dirs.split(' ')) { assert.equal(step(W, d), 'moved', d); await settle(); } };
  W.load('distortion-3', { x: 3, y: 5, dir: 'up' });
  W.strength = true;
  await settle();
  await push('up', 2);
  assert.ok(F.flag('pit:distortion-3:3,2'), 'the west pit');
  W.load('distortion-3', { x: 3, y: 3, dir: 'up' });
  assert.ok(!seen('uxie'), 'Uxie has gone');
  // Leaving the map puts a boulder back, so these two are pushed in one visit.
  W.load('distortion-3', { x: 7, y: 5, dir: 'right' });
  W.strength = true;
  await settle();
  await push('right', 2);
  await walk('down right right');
  await push('up', 3);
  assert.ok(F.flag('pit:distortion-3:10,2'), 'the middle pit');
  W.load('distortion-3', { x: 19, y: 5, dir: 'left' });
  W.strength = true;
  await settle();
  await push('left', 1);
  await walk('down left left');
  await push('up', 3);
  assert.ok(F.flag('pit:distortion-3:17,2'), 'the east pit');
  // A filled hole is floor.
  W.load('distortion-3', { x: 3, y: 3, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await settle();
  at(3, 2);
  // Cynthia heals the team at the bottom.
  F.party()[0].hp = 1;
  W.load('distortion-3', { x: 10, y: 7, dir: 'down' });
  await cross('down', 'distortion-4');
  await until(() => F.flag('distortion-heal') && !W.locked);
  assert.equal(F.party()[0].hp, G.Mon.maxHp(F.party()[0]));
  // Cyrus. A loss to Giratina leaves it there, and it can be faced again.
  wild = 'lose';
  W.load('distortion-4', { x: 8, y: 6, dir: 'up' });
  await settle();
  W.interact();
  await until(() => W.map.id === 'veilstone-center' && !W.locked);
  assert.deepEqual(fights.splice(0), ['cyrus']);
  assert.deepEqual(wilds.splice(0), [[487, 47]]);
  assert.ok(F.flag('cyrus-distortion') && !F.flag('giratina-met') && !F.flag('distortion-done'));
  // Beaten this time: on to Sendoff Spring, and it waits in Turnback Cave.
  wild = 'win';
  W.load('distortion-4', { x: 8, y: 4, dir: 'up' });
  assert.ok(seen('giratina') && !seen('cyrus'));
  await settle();
  W.interact();
  await until(() => W.map.id === 'sendoff-spring' && F.flag('chapter-56-done') && !W.locked);
  assert.deepEqual(wilds.splice(0), [[487, 47]]);
  assert.ok(F.flag('giratina-met') && !F.flag('giratina-caught'));
  at(15, 9);
  assert.ok(!seen('cynthia'));
  // The rift has closed, and nobody is left at the Spear Pillar.
  W.load('spear-pillar', { x: 8, y: 6, dir: 'up' });
  assert.ok(!seen('cynthia') && !seen('barry'));
  assert.equal(step(W, 'up'), 'blocked', 'closed');
  await settle();
  // Turnback Cave: as often as it takes.
  W.load('sendoff-spring', { x: 10, y: 3, dir: 'up' });
  await cross('up', 'turnback-cave');
  at(7, 7);
  assert.ok(seen('giratina'));
  W.load('turnback-cave', { x: 7, y: 4, dir: 'up' });
  await talk();
  assert.deepEqual(wilds.splice(0), [[487, 47]]);
  assert.ok(!seen('giratina') && !F.flag('giratina-caught'), 'it sank away');
  W.load('turnback-cave', { x: 7, y: 4, dir: 'up' });
  assert.ok(seen('giratina'), 'and came back');
  wild = 'caught';
  await talk();
  assert.ok(F.flag('giratina-caught'));
  W.load('turnback-cave', { x: 7, y: 4, dir: 'up' });
  assert.ok(!seen('giratina'), 'for good');
  // The way home: the spring, the path, the tunnel to Route 214 and back.
  W.load('sendoff-spring', { x: 15, y: 14, dir: 'down' });
  await cross('down', 'spring-path');
  at(10, 0);
  W.load('spring-path', { x: 10, y: 6, dir: 'down' });
  await cross('down', 'route214');
  at(5, 42);
  await cross('up', 'spring-path');
  at(10, 6);
});

test('Sinnoh (chapter 57): Rowan, the road east, Sunyshore City, Flint, the lighthouse, the gates of the Gym, Volkner, Jasmine', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 31 }, (_, i) => i + 1);
  for (const f of ['sinnoh-start', 'distortion-done', 'chapter-56-done']) F.setFlag(f);
  F.giveMon('infernape', 54, { moves: ['flame-wheel'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const walk = async dirs => { for (const d of dirs.split(' ')) { assert.equal(step(W, d), 'moved', d + ' at ' + W.player.x + ',' + W.player.y); await settle(); } };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  // The guards at the end of Valor Lakefront, before and after Professor Rowan hears the story.
  W.load('valor-lakefront', { x: 34, y: 12, dir: 'right' });
  assert.ok(seen('east1') && seen('east2'));
  assert.equal(step(W, 'right'), 'blocked', 'a guard');
  W.load('rowan-lab', { x: 6, y: 4, dir: 'up' });
  await talk();
  assert.ok(F.flag('rowan-report'));
  W.load('valor-lakefront', { x: 34, y: 12, dir: 'right' });
  assert.ok(!seen('east1') && !seen('east2'));
  await walk('right');
  await cross('right', 'route222');
  at(0, 7);
  // Back, and on to the city.
  await cross('left', 'valor-lakefront');
  at(35, 12);
  W.load('route222', { x: 63, y: 8, dir: 'right' });
  await cross('right', 'sunyshore');
  at(0, 15);
  await walk('right right');
  assert.ok(seen('flint'));
  // Flint, once.
  step(W, 'right');
  await until(() => F.flag('flint-met') && !W.locked);
  assert.ok(!seen('flint'));
  // The Gym is shut until Volkner has been found.
  W.load('sunyshore', 'gym-door');
  assert.equal(step(W, 'up'), 'blocked', 'gone out');
  await settle();
  W.load('sunyshore', 'light-door');
  await cross('up', 'vista-lighthouse');
  at(5, 7);
  W.load('vista-lighthouse', 'lift');
  await cross('up', 'vista-lighthouse-top');
  at(5, 2);
  assert.ok(seen('volkner'));
  W.load('vista-lighthouse-top', { x: 5, y: 4, dir: 'down' });
  await talk();
  assert.ok(F.flag('volkner-met') && !seen('volkner'));
  W.load('sunyshore', 'gym-door');
  await cross('up', 'sunyshore-gym');
  at(9, 18);
  // The gates, with real plates: the way the generator found, through all nine rooms.
  const gate = (x, y) => W.barsOpen(x, y);
  assert.ok(gate(6, 15) && !gate(12, 15) && !gate(9, 13), 'the start');
  assert.ok(!gate(9, 5), 'the Leader is shut away');
  await walk('up up up left left left');
  at(6, 15);
  await walk('left left');
  at(4, 15);
  await walk('left');
  assert.ok(F.flag('sun-blue'), 'a plate');
  await settle();
  assert.ok(!gate(6, 15) && gate(3, 13), 'the way back is shut, the way up is open');
  await walk('up up up up');
  at(3, 11);
  await walk('up up up');
  at(3, 8);
  await walk('up');
  assert.ok(!F.flag('sun-blue'), 'another plate of the same power');
  await settle();
  assert.ok(gate(9, 9) && !gate(3, 13));
  await walk('right right right right right right');
  at(9, 7);
  await walk('down down down');
  at(9, 10);
  await walk('down');
  assert.ok(F.flag('sun-blue'));
  await settle();
  await walk('down down down');
  at(9, 14);
  // (Tiera has stepped up to battle, so round her.)
  await walk('down right right right');
  at(12, 15);
  await walk('right right');
  at(14, 15);
  await walk('right');
  assert.ok(F.flag('sun-red'));
  await settle();
  await walk('up up up up');
  at(15, 11);
  await walk('up up up');
  at(15, 8);
  await walk('up');
  assert.ok(F.flag('sun-yellow'));
  await settle();
  assert.ok(gate(12, 7) && gate(9, 5), 'all the way to the Leader');
  await walk('left left left left left left');
  at(9, 7);
  await walk('up up up');
  at(9, 4);
  // Volkner, the badge, and every Pokémon obeys.
  W.player.dir = 'up';
  W.interact();
  await until(() => S.player.badges.includes(32) && !W.locked);
  assert.ok(fights.includes('volkner'));
  assert.equal(F.obeyCap('sinnoh'), null);
  assert.equal(F.count('tm57'), 1);
  await walk('down');
  at(9, 5);
  // Jasmine on the beach: the HM if you have none, then the end of the chapter.
  W.load('sunyshore', { x: 20, y: 4, dir: 'up' });
  assert.ok(seen('jasmine'));
  step(W, 'up');
  await until(() => F.flag('chapter-57-done') && !W.locked);
  assert.ok(F.flag('jasmine-beach') && F.flag('got-hm07'));
  assert.equal(F.count('hm07'), 1);
  assert.ok(!seen('jasmine'));
});

test('Sinnoh (chapter 58): the sea north of Sunyshore, the waterfall, the Beacon Badge, Victory Road with its boulder and lake, Barry', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W, later } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 31 }, (_, i) => i + 1);
  S.player.surf = 1;
  S.player.lastHeal = { map: 'veilstone-center', spot: 'mat' };
  F.setVar('barry-starter', 393);
  F.giveMon('empoleon', 56, { moves: ['surf', 'waterfall', 'strength'] });
  F.giveMon('luxray', 54, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [], infos = [];
  W.onTrainer = async (d, info) => { fights.push(d.id); infos.push(info); return 'win'; };
  // By sea from Sunyshore City.
  W.load('sunyshore', { x: 24, y: 0, dir: 'up' });
  assert.ok(W.surfing);
  await cross('up', 'route223');
  at(14, 55);
  // Up the waterfall.
  W.load('route223', { x: 14, y: 10, dir: 'up' });
  assert.ok(W.surfing);
  await settle();
  W.interact();
  await until(() => W.player.y === 6 && !W.locked && !W.player.moving);
  at(14, 6);
  // Onto the shore, and on to the south side of the League.
  W.load('route223', { x: 14, y: 0, dir: 'up' });
  await cross('up', 'league-south');
  at(15, 17);
  // No Beacon Badge, no Victory Road.
  W.load('league-south', { x: 16, y: 3, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the officer');
  await settle();
  S.player.badges.push(32);
  await cross('up', 'sinnoh-victory-1f');
  at(16, 20);
  // 1F to 2F: the rock wall stands until the boulder is on the plate.
  W.load('sinnoh-victory-1f', { x: 30, y: 13, dir: 'up' });
  await cross('up', 'sinnoh-victory-2f');
  at(30, 16);
  W.load('sinnoh-victory-2f', { x: 20, y: 9, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'the rock wall');
  await settle();
  W.load('sinnoh-victory-2f', { x: 28, y: 6, dir: 'left' });
  W.strength = true;
  await settle();
  for (let i = 0; i < 3; i++) {
    later(1000);
    assert.equal(step(W, 'left'), 'blocked', 'a push');
    if (i < 2) { later(1000); assert.equal(step(W, 'left'), 'moved'); await settle(); }
  }
  assert.ok(F.flag('plate:sinnoh-victory-2f:24,6'), 'the boulder is on the plate');
  W.load('sinnoh-victory-2f', { x: 20, y: 9, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved', 'the wall has gone');
  await settle();
  // Down to B1F: a double battle, and a lake to Surf over.
  W.load('sinnoh-victory-2f', { x: 3, y: 4, dir: 'up' });
  await cross('up', 'sinnoh-victory-b1f');
  at(3, 4);
  W.load('sinnoh-victory-b1f', { x: 7, y: 10, dir: 'down' });
  await settle();
  assert.equal(step(W, 'down'), 'moved');
  await settle();
  step(W, 'down');
  await until(() => fights.length === 1 && !W.locked);
  assert.deepEqual(fights.splice(0), ['jo-pat']);
  assert.ok(infos.splice(0)[0].rules.double, 'two against two');
  assert.ok(W.isWater(12, 5) && W.isWater(22, 5));
  W.load('sinnoh-victory-b1f', { x: 22, y: 5, dir: 'right' });
  assert.ok(W.surfing);
  await settle();
  assert.equal(step(W, 'right'), 'moved');
  await settle();
  assert.ok(!W.surfing, 'ashore');
  W.load('sinnoh-victory-b1f', { x: 30, y: 4, dir: 'up' });
  await cross('up', 'sinnoh-victory-1f');
  at(3, 7);
  W.load('sinnoh-victory-1f', { x: 28, y: 2, dir: 'up' });
  await cross('up', 'sinnoh-league');
  at(15, 18);
  // Barry stops you, and the doors stay shut.
  assert.ok(seen('barry'));
  W.load('sinnoh-league', { x: 15, y: 14, dir: 'up' });
  await settle();
  step(W, 'up');
  await until(() => F.flag('chapter-58-done') && !W.locked);
  assert.deepEqual(fights.splice(0), ['barry-league']);
  assert.equal(G.Maps.get('sinnoh-league').def.barryTeams[393][5][0], 'empoleon');
  assert.ok(F.flag('barry-league') && !seen('barry'));
  // Chapter 59 opens the doors behind him.
  W.load('sinnoh-league', { x: 15, y: 9, dir: 'up' });
  await cross('up', 'sinnoh-league-lobby');
  at(7, 9);
});

test("Sinnoh's League (chapter 59): the lobby and its guard, doors that open after a win, Cynthia, the Hall of Fame, home, then ten levels up", async () => {
  const { G, W } = world(['js/content/kanto/league.js', ...['twinleaf', 'victory', 'league'].map(f => 'js/content/sinnoh/' + f + '.js')]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.setFlag('barry-league');
  F.giveMon('empoleon', 58, { moves: ['surf'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const fights = [];
  W.onTrainer = async d => { fights.push([d.id, Math.max(...d.team.map(t => t[1]))]); return 'win'; };
  const ROOMS = [['aaron-room', 'aaron', 53], ['bertha-room', 'bertha', 55], ['flint-room', 'flint', 57], ['lucian-room', 'lucian', 57]];
  // The doors of the League lead to the lobby, and the lobby's mat leads back out.
  W.load('sinnoh-league', { x: 15, y: 9, dir: 'up' });
  step(W, 'up');
  await until(() => W.map.id === 'sinnoh-league-lobby' && !W.locked);
  W.load('sinnoh-league-lobby', { x: 7, y: 8, dir: 'down' });
  step(W, 'down');
  await until(() => W.map.id === 'sinnoh-league' && !W.locked);
  assert.deepEqual([W.player.x, W.player.y], [15, 9]);
  // The guard's question: Yes opens the way.
  W.load('sinnoh-league-lobby', 'guard');
  W.player.face('up');
  await pump(W, W.interact());
  await until(() => W.map.id === 'aaron-room');
  await settle();
  // Each room stays shut until its Trainer is beaten.
  for (const [room, id, top] of ROOMS) {
    W.load(room, { x: 5, y: 3, dir: 'up' });
    await settle();
    assert.equal(W.map.id, room);
    step(W, 'up');
    await settle();
    await settle();
    assert.equal(W.map.id, room, 'shut before ' + id);
    W.load(room, { x: 5, y: 5, dir: 'up' });
    await pump(W, W.interact());
    await until(() => F.flag('se4-' + id));
    await settle();
    assert.deepEqual(fights[fights.length - 1], [id, top]);
    W.load(room, { x: 5, y: 3, dir: 'up' });
    assert.equal(step(W, 'up'), 'moved', 'the door opens after ' + id);
    await until(() => W.map.id !== room);
    await settle();
  }
  assert.equal(W.map.id, 'cynthia-room');
  assert.ok(seen('cynthia') && !seen('rowan'));
  // Cynthia, then Professor Rowan, the Hall of Fame and home.
  W.load('cynthia-room', { x: 5, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'moved');
  await until(() => F.flag('chapter-59-done'));
  assert.deepEqual(fights[fights.length - 1], ['cynthia-champion', 57]);
  assert.ok(F.flag('sinnoh-champion'));
  assert.equal(W.map.id, 'barry-house-2f');
  assert.equal(S.fame.length, 1);
  assert.equal(S.fame[0].party[0].sp, 395);
  // Back in the first room everything starts over, ten levels up.
  fights.length = 0;
  W.load('sinnoh-league-lobby', 'guard');
  W.player.face('up');
  await pump(W, W.interact());
  await until(() => W.map.id === 'aaron-room' && !W.locked);
  await settle();
  assert.ok(!F.flag('se4-aaron') && !F.flag('se4-lucian') && !F.flag('se4-champion'));
  for (const [room, id, top] of ROOMS) {
    W.load(room, { x: 5, y: 5, dir: 'up' });
    await pump(W, W.interact());
    await until(() => F.flag('se4-' + id));
    await settle();
    assert.deepEqual(fights[fights.length - 1], [id + '2', top + 10]);
  }
  W.load('cynthia-room', { x: 5, y: 9, dir: 'up' });
  assert.ok(seen('cynthia'));
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'barry-house-2f' && !W.locked);
  assert.deepEqual(fights[fights.length - 1], ['cynthia-champion2', 67]);
  assert.equal(S.fame.length, 2);
});

test("Sinnoh after the League (chapter 60): the National Pokédex, three caves, a second roaming Pokémon, the orbs, Dialga and Palkia", async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  S.player.surf = 1;
  S.player.lastHeal = { map: 'veilstone-center', spot: 'mat' };
  for (const f of ['sinnoh-start', 'saturn-valor', 'pillar-done', 'distortion-done', 'rowan-report', 'chapter-50-done']) F.setFlag(f);
  F.giveMon('empoleon', 62, { moves: ['surf', 'strength'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const wild = [];
  let answer = 'win';
  W.onEncounter = async (sp, lvl, area, info) => { wild.push([G.Maps.species(sp), lvl, !!info.roamer]); return answer; };
  G.Dialog.ask = () => Promise.resolve(0);
  // Before the Hall of Fame the two caves are shut, and only a surfer reaches their islands.
  for (const [map, x, y] of [['lake-verity', 8, 4], ['lake-acuity', 13, 9]]) {
    W.load(map, { x, y, dir: 'up' });
    await settle();
    assert.equal(step(W, 'up'), 'blocked', map + ': shut');
    await settle();
  }
  W.load('lake-verity', { x: 8, y: 6, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'water');
  // Professor Rowan: the National Pokédex.
  F.setFlag('sinnoh-champion');
  W.load('rowan-lab', { x: 6, y: 4, dir: 'up' });
  await talk();
  assert.ok(F.flag('national-dex'));
  // Lake Verity: by Surf to the island, into the cave. Mesprit runs.
  W.load('lake-verity', { x: 8, y: 5, dir: 'up' });
  assert.ok(W.surfing);
  assert.equal(step(W, 'up'), 'moved');
  await settle();
  assert.ok(!W.surfing, 'ashore on the island');
  step(W, 'up');
  await until(() => W.map.id === 'verity-cavern' && !W.locked);
  assert.ok(seen('mesprit'));
  S.roamer = { mon: G.Mon.create(380, 40, { rng: G.RNG(1), wild: true }), map: 'route101', seen: false };
  W.load('verity-cavern', { x: 7, y: 5, dir: 'up' });
  await talk();
  assert.ok(F.flag('mesprit-met') && !seen('mesprit'));
  assert.equal(S.dex.seen[481], 1);
  const R = S.sinnohRoamer;
  assert.ok(R.mon.sp === 481 && R.mon.lvl === 50 && R.seen);
  const routes = G.Roam.routes('sinnoh');
  assert.ok(routes.includes(R.map) && routes.includes('route210n') && routes.includes('route201'));
  assert.ok(!routes.includes('route101'));
  assert.equal(G.Roam.where('sinnoh'), R.map);
  assert.equal(G.Roam.where(), null, 'Latias has not been met');
  assert.equal(G.Store.sanitize(JSON.parse(JSON.stringify(S))).sinnohRoamer.mon.sp, 481);
  // Out of the cave, back on the beach.
  W.load('verity-cavern', { x: 7, y: 8, dir: 'down' });
  step(W, 'down');
  await until(() => W.map.id === 'lake-verity' && !W.locked);
  assert.deepEqual([W.player.x, W.player.y], [8, 4]);
  // It moves with every change of map, only ever in Sinnoh; Latias stays in Hoenn.
  const went = new Set();
  for (let i = 0; i < 30; i++) { W.load(i % 2 ? 'route201' : 'route202', 'start'); went.add(S.sinnohRoamer.map); }
  assert.ok(went.size > 3 && [...went].every(m => routes.includes(m)));
  assert.ok(!routes.includes(S.roamer.map), 'Latias: ' + S.roamer.map);
  assert.ok(!seen('mesprit'));
  W.load('verity-cavern', 'door');
  assert.ok(!seen('mesprit'), 'it does not come back to the cave');
  // Met on a route: fled, then caught. Latias stays roaming, and Hoenn's chapter does not end.
  W.load('route201', 'start');
  const m = W.map;
  const grass = (() => { for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w - 1; x++) if (G.Maps.kindAt(m, x, y) === 'tall' && G.Maps.kindAt(m, x + 1, y) === 'tall') return [x, y]; })();
  const meet = async () => {
    W.load('route201', { x: grass[0], y: grass[1], dir: 'right' });
    S.sinnohRoamer.map = 'route201';
    W.debug.noEnc = false;
    const n = wild.length;
    for (let i = 0; i < 900 && !(wild.length > n && wild[wild.length - 1][2]); i++) {
      if (!W.locked && !W.player.moving) { step(W, i % 2 ? 'left' : 'right'); S.sinnohRoamer && (S.sinnohRoamer.map = 'route201'); }
      W.update(0.05); await tick();
    }
    W.debug.noEnc = true;
    await settle();
    assert.deepEqual(wild[wild.length - 1], [481, 50, true]);
  };
  answer = 'run';
  await meet();
  assert.ok(S.sinnohRoamer && !F.flag('mesprit-caught'));
  answer = 'caught';
  await meet();
  assert.equal(S.sinnohRoamer, null);
  assert.ok(F.flag('mesprit-caught') && !F.flag('roamer-caught') && !F.flag('chapter-42-done'));
  assert.equal(S.roamer.mon.sp, 380);
  // Lake Acuity: Uxie, beaten, comes back; caught, it is gone.
  W.load('lake-acuity', { x: 13, y: 10, dir: 'up' });
  assert.ok(W.surfing);
  step(W, 'up');
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'acuity-cavern' && !W.locked);
  for (const [id, map] of [['uxie', 'acuity-cavern'], ['azelf', 'valor-cavern']]) {
    answer = 'win';
    W.load(map, { x: 7, y: 5, dir: 'up' });
    assert.ok(seen(id));
    await talk();
    assert.deepEqual(wild[wild.length - 1], [id === 'uxie' ? 480 : 482, 50, false]);
    assert.ok(!seen(id) && !F.flag(id + '-caught'));
    W.load(map, { x: 7, y: 5, dir: 'up' });
    assert.ok(seen(id), 'it came back');
    answer = 'caught';
    await talk();
    assert.ok(F.flag(id + '-caught'));
    W.load(map, { x: 7, y: 5, dir: 'up' });
    assert.ok(!seen(id));
  }
  // Lake Valor's cave is a walk away.
  W.load('lake-valor', 'cave');
  step(W, 'up');
  await until(() => W.map.id === 'valor-cavern' && !W.locked);
  // No orb on the mountain until the elder has spoken, and nothing at the Spear Pillar.
  W.load('coronet-5f', { x: 22, y: 10, dir: 'down' });
  assert.equal(step(W, 'down'), 'moved', 'nothing there yet');
  await settle();
  W.load('spear-pillar', 'from-below');
  assert.ok(!seen('dialga2') && !seen('palkia2'));
  W.load('celestic-elder', { x: 6, y: 4, dir: 'right' });
  await talk();
  assert.ok(F.flag('elder-orbs'));
  for (const [map, x, y, item] of [['coronet-5f', 22, 10, 'adamant-orb'], ['coronet-6f', 3, 5, 'lustrous-orb']]) {
    W.load(map, { x, y, dir: 'down' });
    assert.equal(step(W, 'down'), 'blocked', item);
    await talk();
    assert.equal(F.count(item), 1, item);
  }
  // The Spear Pillar: beaten or caught, the second one ends the chapter.
  answer = 'win';
  W.load('spear-pillar', { x: 6, y: 4, dir: 'up' });
  assert.ok(seen('dialga2') && seen('palkia2'));
  await talk();
  assert.deepEqual(wild[wild.length - 1], [483, 70, false]);
  assert.ok(F.flag('dialga-met') && !F.flag('dialga-caught') && !seen('dialga2') && !F.flag('chapter-60-done'));
  answer = 'run';
  W.load('spear-pillar', { x: 11, y: 4, dir: 'up' });
  await talk();
  assert.ok(!F.flag('palkia-met') && seen('palkia2'), 'run from, it stays');
  answer = 'caught';
  await talk();
  assert.ok(F.flag('palkia-met') && F.flag('palkia-caught') && F.flag('chapter-60-done'));
  W.load('spear-pillar', { x: 6, y: 4, dir: 'up' });
  assert.ok(seen('dialga2') && !seen('palkia2'));
  await talk();
  assert.ok(F.flag('dialga-caught'));
  W.load('spear-pillar', { x: 6, y: 4, dir: 'up' });
  assert.ok(!seen('dialga2'));
});

test('the Battle Zone (chapter 61): the ship, Flint and Volkner beside Barry, Route 225 over the river, the Survival Area', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  S.player.surf = 1;
  S.player.lastHeal = { map: 'snowpoint-center', spot: 'mat' };
  F.setVar('barry-starter', 393);
  F.giveMon('empoleon', 62, { moves: ['surf', 'cut'] });
  F.giveMon('luxray', 60, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [], partners = [];
  let answer = 'win';
  W.onTrainer = async (d, info) => { fights.push(d.id); partners.push(info && info.partner && info.partner.team); return answer; };
  G.Dialog.ask = () => Promise.resolve(0);
  // The sailor waits for a Champion.
  W.load('snowpoint', 'harbor');
  W.player.face('down');
  await talk();
  assert.equal(W.map.id, 'snowpoint');
  F.setFlag('sinnoh-champion');
  await talk();
  await until(() => W.map.id === 'fight-area' && !W.locked);
  at(15, 22);
  // Off the pier: Barry, the Frontier, the multi battle.
  W.player.face('up');
  W.load('fight-area', { x: 15, y: 20, dir: 'up' });
  await settle();
  answer = 'lose';
  step(W, 'up');
  await until(() => fights.length === 1);
  await settle();
  assert.ok(!F.flag('fight-zone-met'), 'lost: it happens again');
  answer = 'win';
  W.load('fight-area', { x: 15, y: 20, dir: 'up' });
  await settle();
  step(W, 'up');
  await until(() => F.flag('fight-zone-met') && !W.locked);
  assert.deepEqual(fights.splice(0), ['flint-volkner', 'flint-volkner']);
  assert.equal(G.Maps.get('fight-area').def.barryTeams[393][5][0], 'empoleon');
  assert.ok(!seen('barry') && seen('flint') && seen('volkner'));
  // The Frontier stays shut; a gift in the mart; back to Snowpoint and over again.
  W.load('fight-area', { x: 7, y: 7, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'shut');
  await settle();
  W.load('fight-mart', { x: 5, y: 5, dir: 'right' });
  await talk();
  assert.equal(F.count('scope-lens'), 1);
  await talk();
  assert.equal(F.count('scope-lens'), 1, 'only once');
  W.load('fight-area', 'pier');
  W.player.face('right');
  await talk();
  await until(() => W.map.id === 'snowpoint' && !W.locked);
  at(17, 23);
  // Route 225: north from Fight Area; a walker stops at the river.
  W.load('fight-area', { x: 15, y: 0, dir: 'up' });
  await cross('up', 'route225');
  at(15, 45);
  W.load('route225', { x: 15, y: 28, dir: 'down' });
  await settle();
  W.player.face('up');
  W.load('route225', { x: 15, y: 28, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the river');
  W.load('route225', { x: 15, y: 24, dir: 'up' });
  assert.ok(W.surfing);
  assert.equal(step(W, 'up'), 'moved');
  await settle();
  assert.ok(!W.surfing, 'ashore');
  // The Trainers spot you on the road.
  W.load('route225', { x: 15, y: 9, dir: 'up' });
  await settle();
  step(W, 'up');
  await until(() => fights.includes('quinn') && !W.locked);
  // East into the Survival Area, and Barry.
  W.load('route225', { x: 29, y: 5, dir: 'right' });
  await cross('right', 'survival-area');
  at(0, 9);
  W.load('survival-area', { x: 1, y: 9, dir: 'right' });
  await settle();
  step(W, 'right');
  await until(() => F.flag('chapter-61-done') && !W.locked);
  assert.ok(F.flag('survival-barry') && seen('barry'));
  // The Battleground has nobody to fight yet.
  W.load('survival-ground', 'door');
  assert.ok(seen('clerk'));
  for (const id of ['fight-area', 'survival-area']) assert.ok(G.Maps.get(id).def.fly, id + ' can be flown to');
});

test('Stark Mountain (chapter 62): over the sea, Buck beside you, the end of Team Galactic, Heatran', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  S.player.surf = 1;
  S.player.lastHeal = { map: 'survival-center', spot: 'mat' };
  F.giveMon('empoleon', 62, { moves: ['surf', 'rock-smash', 'strength'] });
  F.giveMon('luxray', 60, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [], partners = [];
  let answer = 'win';
  W.onTrainer = async (d, info) => { fights.push(d.id); partners.push(info && info.partner); return answer; };
  G.Dialog.ask = () => Promise.resolve(0);
  // The Survival Area opens east; a walker stops at the sea, and cracked rock stops a walker in the hollow.
  W.load('survival-area', { x: 33, y: 9, dir: 'right' });
  await cross('right', 'route226');
  at(0, 12);
  W.load('route226', { x: 30, y: 12, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the sea');
  await settle();
  W.load('route226', { x: 25, y: 9, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the hollow');
  await settle();
  W.load('route226', { x: 45, y: 12, dir: 'right' });
  assert.ok(W.surfing);
  assert.equal(step(W, 'right'), 'moved');
  await settle();
  W.load('route226', { x: 46, y: 12, dir: 'right' });
  assert.equal(step(W, 'right'), 'moved');
  await settle();
  assert.ok(!W.surfing, 'ashore');
  // A swimmer on the sea, a Trainer on land.
  W.load('route226', { x: 32, y: 13, dir: 'up' });
  assert.ok(W.surfing);
  step(W, 'up');
  await until(() => fights.includes('lydia') && !W.locked);
  // North to the volcano.
  W.load('route226', { x: 50, y: 0, dir: 'up' });
  await cross('up', 'route227');
  at(14, 43);
  W.load('route227', { x: 14, y: 0, dir: 'up' });
  await cross('up', 'stark-mountain');
  at(14, 25);
  assert.ok(G.Maps.get('stark-mountain').def.fly, 'Stark Mountain can be flown to');
  W.load('stark-mountain', 'mouth');
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'stark-entrance' && !W.locked);
  at(14, 24);
  W.load('stark-entrance', { x: 15, y: 10, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the cracked rock');
  await settle();
  W.load('stark-entrance', 'north');
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'stark-inside' && !W.locked);
  at(22, 36);
  // Buck comes along: he walks behind you, fights beside you and heals the team.
  assert.ok(!F.flag('buck-along') && (W.follower || {}).who !== 'buck');
  step(W, 'up');
  await until(() => F.flag('buck-along') && !W.locked);
  assert.equal(W.follower.who, 'buck');
  const team = G.Maps.get('stark-inside').def.ally.team;
  W.load('stark-inside', { x: 26, y: 31, dir: 'right' });
  assert.equal(W.follower.who, 'buck');
  await settle();
  F.party()[0].hp = 1;
  step(W, 'right');
  await until(() => fights.includes('keenan-kassandra') && !W.locked);
  await settle();
  assert.deepEqual(partners.at(-1).team, team);
  assert.equal(partners.at(-1).name, 'Buck');
  assert.ok(F.party()[0].hp > 1, 'Buck saw to the team');
  // Mars and Jupiter: lost, it all happens again.
  answer = 'lose';
  W.load('stark-deep', { x: 10, y: 13, dir: 'up' });
  assert.equal(W.follower.who, 'buck');
  assert.ok(seen('mars') && seen('jupiter') && seen('charon'));
  await settle();
  step(W, 'up');
  await until(() => fights.includes('commanders') && !W.locked);
  await settle();
  assert.ok(!F.flag('charon-caught') && F.flag('buck-along'));
  assert.equal(W.map.id, 'survival-center');
  answer = 'win';
  fights.length = 0;
  W.load('stark-deep', { x: 10, y: 13, dir: 'up' });
  await settle();
  step(W, 'up');
  await until(() => F.flag('charon-caught') && !W.locked);
  assert.deepEqual(fights, ['commanders']);
  assert.ok(!F.flag('buck-along') && (W.follower || {}).who !== 'buck', 'Buck went home');
  assert.ok(!seen('mars') && !seen('jupiter') && !seen('charon') && !seen('looker'));
  assert.ok(!seen('heatran'), 'not yet');
  // Buck at home puts the stone back; only then Heatran waits.
  W.load('survival-house', { x: 4, y: 5, dir: 'left' });
  assert.ok(seen('buck') && seen('man2') && !seen('man'));
  await talk();
  assert.ok(F.flag('magma-stone-back'));
  W.load('stark-deep', { x: 10, y: 4, dir: 'up' });
  assert.ok(seen('heatran'));
  let outcome = 'run';
  W.onEncounter = async (sp, lvl) => { assert.deepEqual([G.Maps.species(sp), lvl], [485, 50]); return outcome; };
  await talk();
  assert.ok(!F.flag('chapter-62-done') && seen('heatran'), 'it stays when you run');
  outcome = 'win';
  await talk();
  assert.ok(F.flag('chapter-62-done') && !F.flag('heatran-caught'));
  W.load('stark-deep', { x: 10, y: 4, dir: 'up' });
  assert.ok(seen('heatran'), 'beaten, it comes back');
  outcome = 'caught';
  await talk();
  assert.ok(F.flag('heatran-caught'));
  W.load('stark-deep', { x: 10, y: 4, dir: 'up' });
  assert.ok(!seen('heatran'));
});

test('the end of the Battle Zone (chapter 63): Route 228 in a sandstorm, Route 229, the Resort Area, Route 230, the Battleground', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  S.player.surf = 1;
  S.player.lastHeal = { map: 'survival-center', spot: 'mat' };
  F.giveMon('empoleon', 66, { moves: ['surf', 'rock-smash', 'cut'] });
  F.giveMon('luxray', 64, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [], rules = [];
  W.onTrainer = async (d, info) => { fights.push(d.id); rules.push(info && info.rules); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // South from Route 226 into the sandstorm; its battles are in a sandstorm too.
  W.load('route226', { x: 50, y: 23, dir: 'down' });
  await cross('down', 'route228');
  at(14, 0);
  W.load('route228', { x: 14, y: 4, dir: 'down' });
  await settle();
  step(W, 'down');
  await until(() => fights.includes('jose') && !W.locked);
  assert.equal(rules.at(-1).weather, 'sand');
  W.load('route228', { x: 22, y: 28, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the cracked rock');
  await settle();
  // Route 229, the grove behind a tree, and the Resort Area.
  W.load('route228', { x: 14, y: 45, dir: 'down' });
  await cross('down', 'route229');
  at(14, 0);
  W.load('route229', { x: 11, y: 20, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'the tree');
  await settle();
  W.load('route229', { x: 24, y: 29, dir: 'down' });
  await cross('down', 'resort-area');
  at(24, 0);
  await settle();
  step(W, 'down');
  await until(() => F.flag('chapter-63-done') && !W.locked);
  assert.ok(F.flag('resort-welcome') && G.Maps.get('resort-area').def.fly);
  W.load('resort-area', { x: 6, y: 9, dir: 'up' });
  step(W, 'up');
  await settle();
  assert.equal(W.map.id, 'resort-area', 'the villa is shut');
  // West over the sea to Fight Area.
  W.load('route229', { x: 6, y: 12, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'the sea');
  await settle();
  W.load('route229', { x: 0, y: 12, dir: 'left' });
  assert.ok(W.surfing);
  await cross('left', 'route230');
  at(59, 4);
  W.load('route230', { x: 29, y: 10, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'the cracked rock on the island');
  await settle();
  W.load('route230', { x: 0, y: 10, dir: 'left' });
  await cross('left', 'fight-area');
  at(33, 12);
  // The Battleground: nobody before Buck has put the stone back.
  G.Clock.day = () => '2026-11-10';
  const enterGround = async () => { W.load('survival-area', 'ground-door'); W.player.face('up'); step(W, 'up'); await until(() => W.map.id === 'survival-ground' && !W.locked); };
  await enterGround();
  assert.equal(G.Battleground.roster().length, 0);
  assert.ok(!G.Battleground.POOL.some(seen) && seen('fan') && !seen('fan2'));
  F.setFlag('magma-stone-back');
  F.setFlag('cheryl-with');
  F.setFlag('riley-done');
  await enterGround();
  const first = G.Battleground.roster();
  assert.equal(first.length, 4);
  assert.ok(first.includes('buck') && first.includes('cheryl'), 'Buck and Cheryl on the first day');
  assert.deepEqual(G.Battleground.POOL.filter(seen), first);
  await enterGround();
  assert.deepEqual(G.Battleground.roster(), first, 'the same all day');
  // Each battles once a day.
  const def = id => G.Maps.get('survival-ground').trainers.find(t => t.id === id);
  const face = id => { const t = def(id); W.load('survival-ground', { x: t.x, y: t.y + 1, dir: 'up' }); };
  fights.length = 0;
  face('buck');
  await talk();
  await settle();
  await talk();
  await settle();
  assert.deepEqual(fights, ['buck'], 'once a day');
  assert.ok(F.isDone('survival-ground:buck'));
  // The next day: four more (not always Buck and Cheryl), and yesterday's battles are forgotten.
  const days = {};
  for (const d of ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14']) {
    G.Clock.day = () => d;
    await enterGround();
    days[d] = G.Battleground.roster();
    assert.equal(days[d].length, 4);
    assert.ok(!F.isDone('survival-ground:buck'), 'a new day');
  }
  assert.ok(Object.values(days).some(r => !(r.includes('buck') && r.includes('cheryl'))));
  assert.ok(new Set(Object.values(days).flat()).size > 4, 'different people on different days');
  // Without Cheryl's walk in Eterna Forest, she never comes.
  F.clearFlag('cheryl-with');
  for (const d of ['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19']) {
    G.Clock.day = () => d;
    await enterGround();
    assert.ok(!G.Battleground.roster().includes('cheryl'));
  }
  // The clerk names the day's four.
  W.load('survival-ground', { x: 2, y: 9, dir: 'left' });
  await talk();
});

test('Route 212 (chapter 64): closed until the Fen Badge, sun and rain, the Mansion, Mr. Backlot and his garden', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 27 }, (_, i) => i + 1);
  S.player.surf = 1;
  S.player.lastHeal = { map: 'pastoria-center', spot: 'mat' };
  F.giveMon('empoleon', 40, { moves: ['surf', 'cut'] });
  F.giveMon('luxray', 38, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [], rules = [];
  W.onTrainer = async (d, info) => { fights.push(d.id); rules.push(info && info.rules); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // Flooded until the Fen Badge, from both ends.
  W.load('hearthome', { x: 17, y: 25, dir: 'down' });
  assert.ok(seen('south'));
  assert.equal(step(W, 'down'), 'blocked', 'Hearthome City, before the badge');
  await settle();
  W.load('pastoria', { x: 2, y: 14, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'Pastoria City, before the badge');
  await settle();
  S.player.badges.push(28);
  W.load('hearthome', { x: 17, y: 26, dir: 'down' });
  assert.ok(!seen('south'));
  step(W, 'down');
  await settle();
  await cross('down', 'route212n');
  at(17, 0);
  // North to south, in the rain, then east to Pastoria City.
  W.load('route212n', { x: 17, y: 49, dir: 'down' });
  await cross('down', 'route212s');
  at(4, 0);
  W.load('route212s', { x: 5, y: 5, dir: 'down' });
  await settle();
  step(W, 'down');
  await until(() => fights.includes('jeffrey') && !W.locked);
  assert.equal(rules.at(-1).weather, 'rain');
  W.load('route212s', { x: 6, y: 17, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'the tree');
  await settle();
  W.load('route212s', { x: 11, y: 4, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the channel');
  await settle();
  W.load('route212s', { x: 51, y: 14, dir: 'right' });
  await cross('right', 'pastoria');
  at(0, 14);
  // The Mansion: five Maids, then the young master and the young lady.
  W.load('route212n', 'mansion-door');
  W.player.face('up');
  step(W, 'up');
  await until(() => W.map.id === 'pokemon-mansion' && !W.locked);
  at(10, 13);
  const maid = (id, x, y, dir) => { W.load('pokemon-mansion', { x, y, dir }); return talk(); };
  await maid('belinda', 3, 9, 'left');
  await maid('sophie', 5, 13, 'up');
  await maid('emily', 16, 4, 'up');
  assert.ok(!seen('liam') && !seen('celeste'), 'not yet');
  await maid('elena', 17, 5, 'right');
  await maid('clare', 17, 12, 'right');
  assert.deepEqual(fights.filter(f => ['belinda', 'sophie', 'emily', 'elena', 'clare'].includes(f)), ['belinda', 'sophie', 'emily', 'elena', 'clare']);
  W.load('pokemon-mansion', { x: 16, y: 9, dir: 'right' });
  assert.ok(seen('liam') && seen('celeste'));
  await talk();
  assert.equal(fights.at(-1), 'liam');
  // Mr. Backlot: today's Pokémon lives in the garden; no ending before chapter 63.
  G.Clock.day = () => '2026-11-10';
  const garden = () => G.Maps.encounters(G.Maps.get('trophy-garden'), 'walk').mons.map(m => m[0]);
  assert.ok(!garden().some(sp => G.Route212.DAILY.includes(sp)), 'nobody told you yet');
  W.load('pokemon-mansion', { x: 2, y: 4, dir: 'up' });
  await talk();
  const first = F.getVar('trophy-mon');
  assert.ok(G.Route212.DAILY.includes(first) && garden().includes(first));
  assert.equal(G.Maps.encounters(G.Maps.get('trophy-garden'), 'walk').mons.reduce((a, m) => a + m[3], 0), 100);
  assert.ok(F.flag('backlot-met') && !F.flag('chapter-64-done'), 'no ending in the middle of the game');
  F.setFlag('chapter-63-done');
  await talk();
  assert.ok(F.flag('chapter-64-done'));
  assert.equal(F.getVar('trophy-mon'), first, 'the same all day');
  const mons = new Set([first]);
  for (const d of ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']) {
    G.Clock.day = () => d;
    assert.ok(!garden().includes(F.getVar('trophy-mon')) || garden().filter(sp => G.Route212.DAILY.includes(sp)).length === 0, 'yesterday\'s is gone');
    await talk();
    mons.add(F.getVar('trophy-mon'));
    assert.ok(garden().includes(F.getVar('trophy-mon')));
  }
  assert.ok(mons.size > 1, 'a different Pokémon on other days');
  // Out of the back door into the garden, and back.
  W.load('pokemon-mansion', { x: 16, y: 12, dir: 'down' });
  step(W, 'down');
  await until(() => W.map.id === 'trophy-garden' && !W.locked);
  at(11, 5);
});

test('Wayward Cave (chapter 65): two mouths under the Cycling Road, Mira beside you, then at the Battleground', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  S.player.lastHeal = { map: 'eterna-center', spot: 'mat' };
  F.giveMon('empoleon', 40, { moves: ['surf', 'rock-smash', 'flash'] });
  F.giveMon('luxray', 38, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fights = [], partners = [];
  W.onTrainer = async (d, info) => { fights.push(d.id); partners.push(info && info.partner); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // The east mouth: the main cave, dark, a cracked rock on the short way down.
  W.load('route206', { x: 16, y: 33, dir: 'up' });
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'wayward-cave' && !W.locked);
  at(15, 1);
  assert.ok(W.map.def.dark);
  W.load('wayward-cave', { x: 15, y: 4, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'the cracked rock');
  await settle();
  // Mira: she comes along and walks behind you.
  W.load('wayward-cave', { x: 22, y: 23, dir: 'up' });
  assert.ok(seen('mira'));
  await talk();
  await settle();
  assert.ok(F.flag('mira-along') && !seen('mira'));
  assert.equal((W.follower || {}).who, 'mira');
  // The ledges cannot be climbed: the way back is past the Trainers.
  W.load('wayward-cave', { x: 15, y: 16, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the ledge');
  await settle();
  W.load('wayward-cave', { x: 26, y: 19, dir: 'up' });
  await settle();
  F.party()[0].hp = 1;
  step(W, 'up');
  await until(() => fights.includes('ana-parker') && !W.locked);
  await settle();
  assert.equal(partners.at(-1).name, 'Mira');
  assert.deepEqual(partners.at(-1).team, G.Wayward.MIRA_TEAM);
  assert.ok(F.party()[0].hp > 1, 'Mira saw to the team');
  // At the hall by the mouth she goes; no ending in the middle of the game.
  W.load('wayward-cave', { x: 21, y: 2, dir: 'left' });
  await settle();
  step(W, 'left');
  await until(() => F.flag('mira-done') && !W.locked);
  assert.ok(!F.flag('mira-along') && (W.follower || {}).who !== 'mira');
  assert.ok(!F.flag('chapter-65-done'));
  // Without her, a pair is a plain double battle.
  W.load('wayward-cave', { x: 7, y: 6, dir: 'down' });
  await settle();
  step(W, 'down');
  await until(() => fights.includes('tori-diego') && !W.locked);
  assert.equal(partners.at(-1), null);
  // The hidden cave in the west, where Gible lives; out again.
  W.load('route206', { x: 4, y: 33, dir: 'up' });
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'wayward-hidden' && !W.locked);
  at(11, 1);
  assert.ok(G.Maps.encounters(G.Maps.get('wayward-hidden'), 'walk').mons.some(m => m[0] === 443));
  W.load('wayward-hidden', 'mouth');
  W.player.face('up');
  step(W, 'up');
  await until(() => W.map.id === 'route206' && !W.locked);
  at(4, 33);
  // At the Battleground: Mira joins the days' draws; the clerk ends the chapter once chapter 64 is done.
  F.setFlag('magma-stone-back');
  F.setFlag('riley-done');
  const days = [];
  for (let d = 10; d < 30; d++) {
    G.Clock.day = () => '2026-11-' + d;
    G.Battleground.today();
    days.push(G.Battleground.roster());
  }
  assert.ok(days.some(r => r.includes('mira')), 'Mira comes some days');
  F.setFlag('chapter-64-done');
  W.load('survival-ground', { x: 2, y: 9, dir: 'left' });
  await talk();
  assert.ok(F.flag('chapter-65-done'));
  // After chapter 64, bringing her out ends the chapter at the mouth.
  F.clearFlag('chapter-65-done');
  F.setFlag('mira-along');
  W.load('wayward-cave', { x: 21, y: 2, dir: 'left' });
  await settle();
  step(W, 'left');
  await until(() => F.flag('chapter-65-done') && !W.locked);
});

test('Route 211 West and the tunnel (chapter 66): open with the Forest Badge, shut beyond until chapter 52, the ending after chapter 65', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 25 }, (_, i) => i + 1);
  S.player.lastHeal = { map: 'eterna-center', spot: 'mat' };
  F.giveMon('empoleon', 40, { moves: ['rock-smash', 'surf'] });
  F.giveMon('luxray', 38, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const cross = async (dir, to) => { step(W, dir); await until(() => W.map.id === to && !W.locked); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const fights = [];
  W.onTrainer = async d => { fights.push(d.id); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // Shut before the Forest Badge.
  W.load('eterna', { x: 33, y: 13, dir: 'right' });
  assert.ok(seen('hiker'));
  assert.equal(step(W, 'right'), 'blocked', 'before the badge');
  await settle();
  S.player.badges.push(26);
  W.load('eterna', { x: 34, y: 13, dir: 'right' });
  assert.ok(!seen('hiker'));
  assert.equal(step(W, 'right'), 'moved');
  await settle();
  await cross('right', 'route211w');
  at(0, 13 - 3);
  // A Trainer on the road, then the mountain.
  W.load('route211w', { x: 15, y: 10, dir: 'right' });
  await settle();
  step(W, 'right');
  await until(() => fights.includes('louis') && !W.locked);
  W.load('route211w', { x: 26, y: 10, dir: 'right' });
  await settle();
  step(W, 'right');
  await until(() => W.map.id === 'coronet-211' && !W.locked);
  at(1, 7);
  // The cracked rock; past it, rocks fell until chapter 52 is done.
  W.load('coronet-211', { x: 8, y: 7, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the cracked rock');
  await settle();
  W.load('coronet-211', { x: 19, y: 7, dir: 'right' });
  assert.ok(seen('hiker'));
  assert.equal(step(W, 'right'), 'blocked', 'shut until chapter 52');
  await settle();
  F.setFlag('chapter-52-done');
  W.load('coronet-211', { x: 19, y: 7, dir: 'right' });
  assert.ok(!seen('hiker'));
  assert.equal(step(W, 'right'), 'moved');
  await settle();
  assert.ok(!F.flag('chapter-66-done'), 'no ending in the middle of the game');
  // Out onto Route 211 East; its old mouth still climbs north.
  W.load('coronet-211', { x: 28, y: 7, dir: 'right' });
  await settle();
  step(W, 'right');
  await until(() => W.map.id === 'route211e' && !W.locked);
  at(2, 7);
  W.load('route211e', 'coronet');
  W.player.face('up');
  step(W, 'up');
  await until(() => W.map.id === 'mt-coronet-north' && !W.locked);
  at(28, 12);
  // After chapter 65, going through ends the chapter.
  F.setFlag('chapter-65-done');
  W.load('coronet-211', { x: 18, y: 7, dir: 'right' });
  await settle();
  step(W, 'right');
  await until(() => F.flag('chapter-66-done') && !W.locked);
});

test('the inner Victory Road and Route 224 (chapter 67): the National Pokédex, Marley beside you, the stone, the Battleground', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  S.player.lastHeal = { map: 'sinnoh-league-center', spot: 'mat' };
  F.setFlag('barry-league');
  F.setFlag('sinnoh-champion');
  F.giveMon('empoleon', 66, { moves: ['surf'] });
  F.giveMon('luxray', 64, { moves: ['spark'] });
  const until = async ok => { for (let i = 0; i < 900 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const fights = [], partners = [];
  W.onTrainer = async (d, info) => { fights.push(d.id); partners.push(info && info.partner); return 'win'; };
  G.Dialog.ask = () => Promise.resolve(0);
  // The second mouth in the League's plaza: shut without the National Pokédex.
  W.load('sinnoh-league', { x: 26, y: 17, dir: 'down' });
  assert.ok(seen('guard'));
  assert.equal(step(W, 'down'), 'blocked', 'without the National Pokédex');
  await settle();
  F.setFlag('national-dex');
  W.load('sinnoh-league', { x: 26, y: 18, dir: 'down' });
  assert.ok(!seen('guard'));
  step(W, 'down');
  await until(() => W.map.id === 'victory-inside' && !W.locked);
  at(18, 1);
  // Marley comes up and goes with you.
  assert.ok(seen('marley'));
  step(W, 'down');
  await until(() => F.flag('marley-along') && !W.locked);
  assert.equal((W.follower || {}).who, 'marley');
  // A pair beside her, and the healing.
  W.load('victory-inside', { x: 12, y: 10, dir: 'down' });
  await settle();
  F.party()[0].hp = 1;
  step(W, 'down');
  await until(() => fights.includes('micah-brandi') && !W.locked);
  await settle();
  assert.equal(partners.at(-1).name, 'Marley');
  assert.deepEqual(partners.at(-1).team, G.Route224.MARLEY_TEAM);
  assert.ok(F.party()[0].hp > 1, 'Marley saw to the team');
  // On through the exit area to Route 224, in fog.
  W.load('victory-inside', { x: 32, y: 23, dir: 'right' });
  await settle();
  step(W, 'right');
  await until(() => W.map.id === 'victory-exit' && !W.locked);
  at(1, 11);
  W.load('victory-exit', { x: 34, y: 11, dir: 'right' });
  await settle();
  step(W, 'right');
  await until(() => W.map.id === 'route224' && !W.locked);
  at(7, 22);
  assert.ok(W.map.def.fog);
  assert.ok(!W.follower.visible, 'the mouth is behind you: she waits under you');
  step(W, 'right');
  await settle();
  assert.equal((W.follower || {}).who, 'marley', 'Marley comes out onto Route 224 with you');
  assert.ok(W.follower.visible, 'after the first step');
  assert.deepEqual([W.follower.x, W.follower.y], [7, 22]);
  // The stone: Marley says goodbye; the end of the chapter.
  W.load('route224', { x: 20, y: 3, dir: 'up' });
  await settle();
  step(W, 'up');
  let shown = false;
  for (let i = 0; i < 900 && !F.flag('chapter-67-done'); i++) { W.update(0.05); await tick(); shown = shown || seen('marley'); }
  assert.ok(shown, 'Marley stands beside you at the stone');
  await until(() => F.flag('chapter-67-done') && !W.locked);
  assert.ok(F.flag('marley-done') && !F.flag('marley-along') && (W.follower || {}).who !== 'marley');
  // Back into the mountain.
  W.load('route224', 'cave');
  W.player.face('left');
  step(W, 'left');
  await until(() => W.map.id === 'victory-exit' && !W.locked);
  at(34, 11);
  // At the Battleground she joins the days' draws.
  F.setFlag('magma-stone-back');
  const days = [];
  for (let d = 10; d < 30; d++) {
    G.Clock.day = () => '2026-11-' + d;
    G.Battleground.today();
    days.push(G.Battleground.roster());
  }
  assert.ok(days.some(r => r.includes('marley')), 'Marley comes some days');
});

test('Snowpoint Temple (chapter 68): the door, the ice, the cracked rock, the hidden Full Restore, the boulder, Regigigas, the Regis back in Hoenn', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W, later } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.setFlag('sinnoh-champion');
  F.giveMon('machamp', 60, { moves: ['strength', 'rock-smash'] });
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const slide = async dirs => { for (const d of dirs) { step(W, d); await settle(); } };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  // Snowpoint City: the gentleman stands in the door until the National Pokédex.
  W.load('snowpoint', { x: 31, y: 4, dir: 'up' });
  assert.ok(seen('temple') && !seen('temple-open'));
  assert.equal(step(W, 'up'), 'blocked');
  F.setFlag('national-dex');
  W.load('snowpoint', { x: 31, y: 4, dir: 'up' });
  assert.ok(!seen('temple') && seen('temple-open'));
  step(W, 'up');
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'snowpoint-temple-1f' && !W.locked);
  at(9, 12);
  // 1F: the words in the wall; the ladder down.
  W.load('snowpoint-temple-1f', { x: 9, y: 2, dir: 'up' });
  await talk();
  assert.ok(said.some(s => s.includes('When the three come home')), 'the words in the wall');
  step(W, 'down');
  await until(() => W.map.id === 'snowpoint-temple-b1f' && !W.locked);
  at(1, 1);
  // B1F: the solver's way over the ice to the pocket; the Calcium; the ladder.
  await slide(['down', 'down', 'right', 'up', 'right', 'down', 'right', 'up', 'left', 'down', 'right', 'down', 'right', 'down', 'left', 'up', 'right', 'down', 'down', 'right']);
  at(17, 13);
  W.player.face('right');
  await talk();
  assert.ok(F.count('calcium') > 0, 'the Calcium');
  await slide(['left', 'left', 'left']);
  step(W, 'left');
  await until(() => W.map.id === 'snowpoint-temple-b2f' && !W.locked);
  at(18, 1);
  // B2F: the ice to the cracked rock; Rock Smash; on to the ladder.
  await slide(['down', 'left', 'down', 'left', 'up', 'left', 'up', 'left', 'down', 'right', 'down', 'left', 'up', 'left', 'down', 'right', 'down']);
  at(3, 11);
  assert.equal(W.tryStep(W.player, 'down', 4), 'blocked', 'the cracked rock');
  await talk();
  await settle();
  await slide(['down', 'down', 'left']);
  step(W, 'left');
  await until(() => W.map.id === 'snowpoint-temple-b3f' && !W.locked);
  at(1, 1);
  // B3F: the Full Restore hidden in the rock between the ladders; the ice round to the other ladder.
  step(W, 'right'); await settle(); step(W, 'right'); await settle(); step(W, 'right'); await settle();
  at(4, 1);
  W.player.face('right');
  await talk();
  assert.ok(F.count('full-restore') > 0, 'the hidden Full Restore');
  W.load('snowpoint-temple-b3f', 'up');
  await slide(['right', 'right', 'down', 'down', 'right', 'up', 'left', 'down', 'right', 'down', 'left', 'up', 'left', 'up', 'right', 'up', 'up', 'right']);
  step(W, 'right');
  await until(() => W.map.id === 'snowpoint-temple-b4f' && !W.locked);
  at(2, 1);
  // B4F: the boulder before the south alcove (Strength), and the Full Heal behind it.
  W.load('snowpoint-temple-b4f', { x: 6, y: 9, dir: 'down' });
  assert.equal(step(W, 'down'), 'blocked', 'the boulder, without Strength');
  W.strength = true;
  shove(W, later, 'down', 2);
  walk(W, ['down', 'left', 'left', 'left', 'left']);
  W.player.face('down');
  await talk();
  assert.ok(F.count('full-heal') > 0, 'the Full Heal');
  W.load('snowpoint-temple-b4f', 'up');
  step(W, 'right');
  await settle();
  step(W, 'left');
  await until(() => W.map.id === 'snowpoint-temple-b3f' && !W.locked);
  at(9, 1);
  W.load('snowpoint-temple-b4f', { x: 16, y: 8, dir: 'right' });
  step(W, 'right');
  await until(() => W.map.id === 'snowpoint-temple-b5f' && !W.locked);
  at(9, 13);
  // B5F: up the ice to the statue's feet.
  W.load('snowpoint-temple-b5f', { x: 9, y: 8, dir: 'up' });
  await slide(['up']);
  at(9, 6);
  assert.ok(seen('regigigas'));
  const fights = [];
  let outcome = 'run';
  W.onEncounter = async (sp, lvl) => { fights.push([G.Maps.species(sp), lvl]); return outcome; };
  await talk();
  assert.deepEqual(fights, [], 'without the three it does not move');
  F.giveMon('regirock', 40);
  F.giveMon('regice', 40);
  await talk();
  assert.deepEqual(fights, [], 'two are not enough');
  F.giveMon('registeel', 40);
  await talk();
  assert.deepEqual(fights, [[486, 1]], 'Regigigas, level 1');
  assert.ok(!F.flag('chapter-68-done') && seen('regigigas'), 'it stays when you run');
  outcome = 'win';
  await talk();
  assert.deepEqual(endings, [68]);
  assert.ok(seen('regigigas'), 'beaten, it is stone again');
  W.load('snowpoint-temple-b5f', { x: 9, y: 6, dir: 'up' });
  outcome = 'caught';
  await talk();
  assert.ok(F.flag('regigigas-caught') && !seen('regigigas'));
  assert.deepEqual(endings, [68], 'the ending once');
  W.load('snowpoint-temple-b5f', { x: 9, y: 6, dir: 'up' });
  assert.ok(!seen('regigigas'));
  // Hoenn: a Regi beaten and never caught waits again with the National Pokédex; a caught one does not; no second ending 41.
  const back = (mapId, id) => F.test(G.Maps.get(mapId).npcs.find(n => n.id === id).if);
  for (const id of ['regirock', 'regice', 'registeel']) F.setFlag(id + '-met');
  F.setFlag('chapter-41-done');
  F.clearFlag('national-dex');
  assert.ok(!back('island-cave-inner', 'regice'), 'gone before the National Pokédex');
  F.setFlag('national-dex');
  for (const sp of [377, 378, 379]) delete S.dex.caught[sp];     // (the three given for the statue counted as caught)
  S.dex.caught[377] = 1;
  assert.ok(back('island-cave-inner', 'regice') && back('ancient-tomb-inner', 'registeel') && !back('desert-ruins-inner', 'regirock'));
  W.load('island-cave-inner', 'stairs');
  assert.ok(seen('regice'));
  W.load('island-cave-inner', { x: 4, y: 4, dir: 'up' });
  fights.length = 0;
  outcome = 'win';
  await talk();
  assert.deepEqual(fights, [[378, 40]]);
  assert.deepEqual(endings, [68], 'no second ending 41');
});

test('the Old Chateau and the Lost Tower (chapter 69): the Cut tree, the girl, Rotom at night, the tower, the old women, the new items', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 26 }, (_, i) => i + 1);
  F.giveMon('bibarel', 30, { moves: ['cut', 'surf'] });
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const got = id => F.count(id) > 0;
  // Eterna Forest: a Cut tree on the way to the chateau's door.
  W.load('eterna-forest', { x: 33, y: 5, dir: 'right' });
  assert.equal(step(W, 'right'), 'blocked', 'the Cut tree');
  await talk();
  await settle();
  assert.equal(step(W, 'right'), 'moved');
  await settle();
  assert.equal(step(W, 'right'), 'moved');
  await settle();
  step(W, 'up');
  await until(() => W.map.id === 'old-chateau' && !W.locked);
  at(6, 11);
  // The dining room: the little girl, once.
  W.load('old-chateau', { x: 12, y: 7, dir: 'right' });
  step(W, 'right'); await settle();
  step(W, 'right');
  await until(() => F.flag('chateau-girl') && !W.locked);
  assert.ok(said.some(s => s.includes('little girl')) && !seen('girl'));
  const n0 = said.length;
  W.load('old-chateau', { x: 12, y: 7, dir: 'right' });
  step(W, 'right'); await settle(); step(W, 'right'); await settle();
  assert.equal(said.length, n0, 'only the first time');
  W.load('old-chateau', { x: 20, y: 9, dir: 'down' });
  await talk();
  assert.ok(got('big-pearl'));
  // Upstairs.
  W.load('old-chateau', 'stairs');
  step(W, 'up');
  await until(() => W.map.id === 'old-chateau-2f' && !W.locked);
  at(1, 9);
  for (const [x, y, dir, item] of [[1, 4, 'down', 'old-gateau'], [14, 4, 'up', 'dread-plate'], [24, 3, 'up', 'tm90']]) {
    W.load('old-chateau-2f', { x, y, dir });
    await talk();
    assert.ok(got(item), item);
  }
  W.load('old-chateau-2f', { x: 15, y: 8, dir: 'up' });
  await talk();
  assert.ok(said.at(-1).includes('its eyes'), 'the painting');
  // The old TV: nothing by day; Rotom at night.
  const fights = [];
  let outcome = 'run';
  W.onEncounter = async (sp, lvl) => { fights.push([G.Maps.species(sp), lvl]); return outcome; };
  W.load('old-chateau-2f', { x: 7, y: 3, dir: 'up' });
  G.Clock.set('day');
  await talk();
  assert.ok(said.at(-1).includes('not even plugged in') && !fights.length);
  G.Clock.set('night');
  await talk();
  assert.deepEqual(fights, [[479, 20]], 'Rotom, level 20');
  outcome = 'win';
  await talk();
  assert.ok(said.at(-1).includes('slipped back') && !F.flag('rotom-caught'));
  outcome = 'caught';
  await talk();
  assert.ok(F.flag('rotom-caught') && fights.length === 3);
  await talk();
  assert.ok(said.at(-1).includes('stays dark') && fights.length === 3);
  G.Clock.set(null);
  // The Lost Tower: in from Route 209, up all five floors.
  W.load('route209', { x: 27, y: 28, dir: 'up' });
  step(W, 'up');
  await until(() => W.map.id === 'lost-tower-1f' && !W.locked);
  at(6, 11);
  for (const [from, to, x] of [['lost-tower-1f', 'lost-tower-2f', 12], ['lost-tower-2f', 'lost-tower-3f', 1], ['lost-tower-3f', 'lost-tower-4f', 12], ['lost-tower-4f', 'lost-tower-5f', 1]]) {
    W.load(from, 'up');
    step(W, 'up');
    await until(() => W.map.id === to && !W.locked);
    at(x, 3);
  }
  const ids = m => JSON.stringify(G.Maps.get(m).trainers.map(t => [t.id, !!t.double]));
  assert.equal(ids('lost-tower-2f'), '[["oliver",false]]');
  assert.equal(ids('lost-tower-3f'), '[["leonard",false],["kirby",false]]');
  assert.equal(ids('lost-tower-4f'), '[["beth-bob",true],["rebekah",false],["mike-nat",true]]');
  const met = [];
  W.onTrainer = async d => { met.push(d.id); return 'win'; };
  W.load('lost-tower-2f', { x: 9, y: 5, dir: 'down' });
  step(W, 'down');
  await until(() => met.includes('oliver') && !W.locked);
  W.load('lost-tower-2f', { x: 1, y: 9, dir: 'down' });
  await talk();
  assert.ok(got('oval-stone'));
  W.load('lost-tower-4f', { x: 7, y: 9, dir: 'down' });
  await talk();
  assert.ok(got('tm27'));
  // 5F: the two old women; no ending before chapter 68 is done, then the next time you talk to them.
  W.load('lost-tower-5f', { x: 5, y: 6, dir: 'up' });
  await talk();
  assert.equal(F.count('cleanse-tag'), 1);
  W.load('lost-tower-5f', { x: 9, y: 6, dir: 'up' });
  await talk();
  assert.ok(F.flag('tower-spell') && got('spell-tag'));
  await talk();
  assert.deepEqual(endings, [], 'not in the middle of the game');
  F.setFlag('chapter-68-done');
  W.load('lost-tower-5f', { x: 5, y: 6, dir: 'up' });
  await talk();
  assert.equal(F.count('cleanse-tag'), 1, 'one Cleanse Tag');
  assert.deepEqual(endings, [69]);
  await talk();
  assert.deepEqual(endings, [69], 'once');
  // The new items: the Dread Plate, the Old Gateau, and the Cleanse Tag on the lead.
  const mon = G.Mon.create(G.Maps.species('umbreon'), 30, {});
  mon.item = 'dread-plate';
  assert.equal(G.Held.power(mon, 'dark'), 1.2);
  assert.equal(G.Held.power(mon, 'fire'), 1);
  assert.deepEqual([G.ITEM_FX['old-gateau'].cure, !!G.ITEM_FX['old-gateau'].field, !!G.ITEM_FX['old-gateau'].battle], ['all', true, true]);
  W.debug.noEnc = false;
  const count = async tag => {
    F.party()[0].item = tag || undefined;
    let n = 0;
    W.onEncounter = async () => { n++; return 'run'; };
    W.load('route209', { x: 3, y: 4, dir: 'right' });
    W.seed(69);
    for (let i = 0; i < 300; i++) { step(W, i % 2 ? 'left' : 'right'); await settle(); }
    return n;
  };
  const plain = await count(null), tagged = await count('cleanse-tag');
  assert.ok(plain > 30 && tagged < plain * 0.85, 'the Cleanse Tag keeps wild Pokémon away: ' + plain + ' -> ' + tagged);
});

test('Fullmoon Island (chapter 70): the sailor\'s son, the boat, Cresselia flies off to roam, the Lunar Wing, the boy wakes; two roamers in Sinnoh', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.setFlag('sinnoh-champion');
  F.giveMon('empoleon', 60, { moves: ['surf'] });
  const said = [], asked = [], answers = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  G.Dialog.ask = text => { asked.push(String(text)); return Promise.resolve(answers.length ? answers.shift() : 0); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const sailor = async (...a) => { answers.push(...a); W.load('canalave', { x: 12, y: 23, dir: 'left' }); asked.length = 0; await talk(); await settle(); };
  // Before the National Pokédex: only the boat to Iron Island, and the boy is awake.
  await sailor(1);
  assert.equal(asked.length, 1);
  assert.ok(asked[0].includes('Iron Island') && !F.flag('nightmare-heard'));
  W.load('canalave-house2', 'door');
  assert.ok(seen('boy') && !seen('sleeper'));
  // With it: the nightmares, then Fullmoon Island first.
  F.setFlag('national-dex');
  await sailor(1, 1);
  assert.ok(said.some(s => s.includes('will not wake')) && F.flag('nightmare-heard'));
  assert.ok(asked[0].includes('Fullmoon Island') && asked[1].includes('Iron Island'));
  W.load('canalave-house2', { x: 8, y: 4, dir: 'up' });
  assert.ok(seen('sleeper') && !seen('boy'));
  await talk();
  assert.ok(said.at(-1).includes('fast asleep'), 'no feather yet');
  await sailor(0);
  await until(() => W.map.id === 'fullmoon-island' && !W.locked);
  at(11, 18);
  // Up through the wood to the clearing: Cresselia flies off, the Lunar Wing.
  assert.equal(G.Maps.encounters(G.Maps.get('fullmoon-island'), 'walk'), null, 'no wild Pokémon on the island');
  W.load('fullmoon-island', { x: 11, y: 9, dir: 'up' });
  assert.ok(seen('cresselia'));
  step(W, 'up'); await settle();
  step(W, 'up');
  await until(() => F.flag('cresselia-met') && !W.locked);
  assert.ok(!seen('cresselia') && F.count('lunar-wing') === 1);
  const c = G.Roam.of('cresselia');
  assert.ok(c.mon.sp === 488 && c.mon.lvl === 50 && c.seen && G.Roam.routes('sinnoh').includes(G.Roam.where('cresselia')));
  // Back to Canalave; the feather wakes the boy; the chapter ends once.
  W.load('fullmoon-island', { x: 12, y: 18, dir: 'right' });
  answers.push(0);
  await talk();
  await until(() => W.map.id === 'canalave' && !W.locked);
  at(12, 23);
  W.load('canalave-house2', { x: 8, y: 4, dir: 'up' });
  await talk();
  assert.ok(F.flag('nightmare-done'));
  assert.deepEqual(endings, [70]);
  W.load('canalave-house2', { x: 8, y: 4, dir: 'up' });
  assert.ok(seen('woken') && !seen('sleeper'));
  await sailor(1);
  assert.ok(said.some(s => s.includes('running around again')));
  assert.equal(asked.length, 1, 'only Iron Island now');
  assert.deepEqual(endings, [70]);
  // Two roamers in Sinnoh: both on the Town Map, either one met on a shared route, each caught on its own.
  G.Roam.start(481, 50, G.RNG(5), 'sinnoh').seen = true;
  assert.equal(JSON.stringify(G.Roam.list('sinnoh').map(r => r.sp).sort()), '[481,488]');
  const route = G.Roam.routes('sinnoh')[0];
  S.sinnohRoamer.map = route;
  S.cresselia.map = route;
  const met = new Set();
  for (let s = 1; s <= 200; s++) { const m = G.Roam.meets(G.RNG(s), route); if (m) met.add(m.sp); }
  assert.equal(JSON.stringify([...met].sort()), '[481,488]', 'either one');
  const moved = [S.sinnohRoamer.map, S.cresselia.map];
  G.Roam.move(G.RNG(9));
  assert.ok(G.Roam.routes('sinnoh').includes(S.sinnohRoamer.map) && G.Roam.routes('sinnoh').includes(S.cresselia.map) && moved.length === 2);
  const saved = G.Store.sanitize(JSON.parse(JSON.stringify(S)));
  assert.ok(saved.cresselia.mon.sp === 488 && saved.cresselia.seen && saved.sinnohRoamer.mon.sp === 481, 'both kept in the save');
  assert.equal(G.Roam.after('caught', G.RNG(1), S.cresselia.mon), 'cresselia');
  assert.ok(S.cresselia === null && F.flag('cresselia-caught') && S.sinnohRoamer && !F.flag('mesprit-caught'));
  assert.equal(JSON.stringify(G.Roam.list('sinnoh').map(r => r.sp)), '[481]');
});

test('Route 219, Sea Route 220 and Route 221 (chapter 71): south from Sandgem by sea, the Trainers, the items, the grass, the gate of Pal Park', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.giveMon('empoleon', 60, { moves: ['surf'] });
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const talk = () => pump(W, W.interact());
  const met = [];
  W.onTrainer = async d => { met.push(d.id); return 'win'; };
  const ids = m => JSON.stringify(G.Maps.get(m).trainers.map(t => t.id));
  assert.equal(ids('route219'), '["trenton","mariel"]');
  assert.equal(ids('route220'), '["erik","vincent","jessica","erica","adrian","katelyn","claire"]');
  assert.equal(ids('route221'), '["dillon","vanessa","cory","ivan","jake","shannon"]');
  // Surfing south from Sandgem Town onto Route 219.
  S.player.surf = 1;
  W.load('sandgem', { x: 12, y: 25, dir: 'down' });
  assert.ok(W.surfing);
  step(W, 'down');
  await settle();
  assert.equal(W.map.id, 'route219');
  at(12, 0);
  // The sandbar: a Tuber spots you; the Antidote.
  W.load('route219', { x: 10, y: 10, dir: 'down' });
  assert.ok(!W.surfing, 'on the sand');
  step(W, 'down');
  await until(() => met.includes('trenton') && !W.locked);
  W.load('route219', { x: 16, y: 10, dir: 'right' });
  await talk();
  assert.ok(F.count('antidote') > 0);
  // On south to Sea Route 220: a Swimmer spots you; the Splash Plate on its island.
  W.load('route219', { x: 12, y: 27, dir: 'down' });
  step(W, 'down');
  await settle();
  assert.equal(W.map.id, 'route220');
  at(12, 0);
  W.load('route220', { x: 6, y: 3, dir: 'down' });
  assert.ok(W.surfing);
  step(W, 'down');
  await until(() => met.includes('erik') && !W.locked);
  W.load('route220', { x: 22, y: 14, dir: 'left' });
  await talk();
  assert.ok(F.count('splash-plate') > 0);
  // East to Route 221: its grass, the gate of Pal Park.
  W.load('route220', { x: 43, y: 10, dir: 'right' });
  step(W, 'right');
  await settle();
  assert.equal(W.map.id, 'route221');
  at(0, 10);
  assert.ok([185, 203, 315, 419].every(sp => G.Maps.encounters(G.Maps.get('route221'), 'walk').mons.some(m => m[0] === sp)), 'Sudowoodo, Girafarig, Roselia, Floatzel');
  W.load('route221', 'gate');
  step(W, 'up');
  await until(() => W.map.id === 'pal-park-gate' && !W.locked);
  at(5, 7);
  // The receptionist: the park is not open; the ending only once chapter 70 is done, and once.
  W.load('pal-park-gate', { x: 5, y: 5, dir: 'up' });
  await talk();
  assert.ok(said.at(-1).includes('not open'));
  assert.deepEqual(endings, [], 'not in the middle of the game');
  F.setFlag('chapter-70-done');
  await talk();
  assert.deepEqual(endings, [71]);
  await talk();
  assert.deepEqual(endings, [71]);
  W.load('pal-park-gate', 'door');
  step(W, 'right'); await settle(); step(W, 'left'); await settle();
  step(W, 'down');
  await until(() => W.map.id === 'route221' && !W.locked);
  at(30, 12);
});

test('Amity Square (chapter 72): only the twenty at the front, your lead always walks with you, berries every 100 steps, the gentleman\'s berry of the day', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field;
  F.giveMon('luxray', 30, {});
  F.giveMon('pikachu', 20, {});
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const talk = () => pump(W, W.interact());
  const BERRIES = ['oran-berry', 'pecha-berry', 'cheri-berry', 'chesto-berry', 'rawst-berry', 'aspear-berry', 'sitrus-berry'];
  const berries = () => BERRIES.reduce((n, id) => n + F.count(id), 0);
  assert.equal(G.Settings.get('follower'), false, '(following is off in this test world)');
  // Hearthome's gate building opens on Amity Square's gate.
  W.load('hearthome', { x: 25, y: 21, dir: 'up' });
  step(W, 'up');
  await until(() => W.map.id === 'amity-gate' && !W.locked);
  at(2, 7);
  W.load('amity-gate', { x: 5, y: 5, dir: 'up' });
  await talk();
  assert.ok(['Pikachu', 'Pachirisu', 'Happiny', 'Empoleon'].every(n => said.at(-1).includes(n)), 'the rules name the twenty: ' + said.at(-1));
  // Luxray at the front: the square's door stays shut.
  W.load('amity-gate', { x: 8, y: 6, dir: 'down' });
  step(W, 'down');
  await settle();
  assert.equal(W.map.id, 'amity-gate');
  assert.ok(said.at(-1).includes('cannot come into the square'));
  // Pikachu at the front: in, and it walks behind you though following is off.
  F.party().reverse();
  W.load('amity-gate', { x: 8, y: 6, dir: 'down' });
  step(W, 'down');
  await until(() => W.map.id === 'amity-square' && !W.locked);
  at(15, 4);
  assert.equal((W.follower || {}).mon, 25);
  step(W, 'down');
  await settle();
  assert.ok(W.follower.visible, 'Pikachu behind you');
  // A hundred steps: a berry.
  W.load('amity-square', { x: 5, y: 8, dir: 'right' });
  const b0 = berries();
  for (let i = 0; i < 100; i++) { step(W, i % 2 ? 'left' : 'right'); await settle(); }
  await settle();
  assert.equal(berries(), b0 + 1, 'found one');
  assert.ok(said.some(s => s.includes('found something in the grass')));
  // The gentleman: one berry a day; the ending once chapter 71 is done, once.
  let day = '2026-11-12';
  G.Clock.day = () => day;
  W.load('amity-square', { x: 25, y: 7, dir: 'up' });
  const b1 = berries();
  await talk();
  assert.equal(berries(), b1 + 1);
  await talk();
  assert.equal(berries(), b1 + 1, 'not twice in a day');
  assert.ok(said.at(-1).includes('Come back tomorrow'));
  assert.deepEqual(endings, [], 'not in the middle of the game');
  day = '2026-11-13';
  F.setFlag('chapter-71-done');
  await talk();
  assert.equal(berries(), b1 + 2, 'the next day');
  assert.deepEqual(endings, [72]);
  await talk();
  assert.deepEqual(endings, [72]);
  // The items: TM43 on the island, TM45 by the pond, the Spooky Plate, the Amulet Coin.
  for (const [x, y, dir, item] of [[14, 11, 'down', 'tm43'], [20, 8, 'right', 'tm45'], [27, 20, 'right', 'spooky-plate'], [4, 20, 'left', 'amulet-coin']]) {
    W.load('amity-square', { x, y, dir });
    await talk();
    assert.ok(F.count(item) > 0, item);
  }
  // Out through the gatehouse.
  W.load('amity-square', { x: 15, y: 4, dir: 'up' });
  step(W, 'up');
  await until(() => W.map.id === 'amity-gate' && !W.locked);
  at(8, 7);
});

test('Fuego Ironworks (chapter 73): north of the meadow, the river, the belts, the Workers, Mr. Fuego\'s Fire Stone; the Drifloon of Fridays', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.giveMon('empoleon', 40, { moves: ['surf'] });
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  // North out of Floaroma Meadow onto the grounds.
  W.load('floaroma-meadow', { x: 11, y: 0, dir: 'up' });
  step(W, 'up');
  await settle();
  assert.equal(W.map.id, 'fuego-ironworks');
  at(14, 23);
  // The river: walking stops at it; Surf takes you over.
  W.load('fuego-ironworks', { x: 14, y: 13, dir: 'up' });
  assert.equal(step(W, 'up'), 'blocked', 'the river');
  S.player.surf = 1;
  W.load('fuego-ironworks', { x: 14, y: 12, dir: 'up' });
  assert.ok(W.surfing);
  for (let i = 0; i < 4; i++) { step(W, 'up'); await settle(); }
  assert.ok(!W.surfing);
  at(14, 8);
  assert.ok([81, 126, 419, 423].every(sp => G.Maps.encounters(G.Maps.get('fuego-ironworks'), 'walk').mons.some(m => m[0] === sp)), 'Magnemite, Magmar, Floatzel, Gastrodon');
  for (const [x, y, dir, item] of [[20, 3, 'right', 'tm35'], [4, 16, 'down', 'calcium']]) {
    W.load('fuego-ironworks', { x, y, dir });
    await talk();
    assert.ok(F.count(item) > 0, item);
  }
  // Into the works; over the belts to Mr. Fuego.
  W.load('fuego-ironworks', 'door');
  step(W, 'up');
  await until(() => W.map.id === 'fuego-inside' && !W.locked);
  at(9, 13);
  const met = [];
  W.onTrainer = async d => { met.push(d.id); return 'win'; };
  for (const id of ['dillan', 'holden', 'conrad']) F.markDone('fuego-inside:' + id);
  W.load('fuego-inside', { x: 9, y: 12, dir: 'up' });
  // (The belts' route, found by the generator's solver, which agrees with field.js on every move: scratchpad c73.)
  for (const d of ['up', 'up', 'right', 'right', 'up', 'left', 'up', 'left', 'left', 'left', 'up', 'up', 'up', 'up', 'up']) {
    step(W, d);
    await settle();
  }
  at(8, 3);
  W.player.face('right');
  await talk();
  assert.equal(F.count('fire-stone'), 1);
  await talk();
  assert.equal(F.count('fire-stone'), 1, 'once');
  assert.deepEqual(endings, [], 'not in the middle of the game');
  F.setFlag('chapter-72-done');
  await talk();
  assert.deepEqual(endings, [73]);
  await talk();
  assert.deepEqual(endings, [73]);
  // A Worker who sees you.
  const fresh = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  fresh.W.debug.noEnc = true;
  fresh.G.Field.giveMon('empoleon', 40, {});
  const met2 = [];
  fresh.W.onTrainer = async d => { met2.push(d.id); return 'win'; };
  fresh.W.load('fuego-inside', { x: 4, y: 8, dir: 'down' });
  step(fresh.W, 'down');
  for (let i = 0; i < 200 && !met2.length; i++) { fresh.W.update(0.05); await tick(); }
  assert.equal(JSON.stringify(met2), '["dillan"]');
  // The Drifloon of the Valley Windworks: on Fridays only, once a Friday, until caught.
  let weekday = 4, day = '2026-11-12';
  G.Clock.weekday = () => weekday;
  G.Clock.day = () => day;
  F.setFlag('mars-windworks');
  const wild = [];
  let outcome = 'win';
  W.onEncounter = async (sp, lvl) => { wild.push([G.Maps.species(sp), lvl]); return outcome; };
  W.load('valley-windworks', { x: 16, y: 9, dir: 'up' });
  assert.ok(!seen('drifloon'), 'not on a Thursday');
  weekday = 5; day = '2026-11-13';
  W.load('valley-windworks', { x: 16, y: 9, dir: 'up' });
  assert.ok(seen('drifloon'), 'a Friday');
  await talk();
  assert.equal(JSON.stringify(wild), '[[425,15]]');
  assert.ok(F.flag('drifloon-met') && !seen('drifloon'));
  W.load('valley-windworks', { x: 16, y: 9, dir: 'up' });
  assert.ok(!seen('drifloon'), 'not again that Friday');
  day = '2026-11-20';
  W.load('valley-windworks', { x: 16, y: 9, dir: 'up' });
  assert.ok(seen('drifloon'), 'the next Friday');
  outcome = 'caught';
  await talk();
  assert.ok(F.flag('drifloon-caught'));
  day = '2026-11-27';
  W.load('valley-windworks', { x: 16, y: 9, dir: 'up' });
  assert.ok(!seen('drifloon'), 'caught: never again');
});

test('Mt. Coronet B1F and Victory Road\'s inner B1F (chapter 74): the boulder both ways, the fog, the items, Feebas\'s four tiles a day, the two shores and the ending', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const FILES74 = ['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh];
  const { G, W, later } = world(FILES74);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.giveMon('empoleon', 40, { moves: ['surf', 'strength', 'rock-smash'] });
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const talk = () => pump(W, W.interact());
  const walk = async dirs => { for (const d of dirs) { assert.equal(step(W, d), 'moved', d); await settle(); } };
  for (const id of ['coronet-211', 'coronet-b1f', 'victory-inside', 'victory-inside-b1f']) assert.deepEqual(plain(G.Maps.validate(id)), [], id);
  // The tunnel of Route 211: the boulder north of the east half, pushed into the room, then the ladder down.
  W.load('coronet-211', { x: 25, y: 6, dir: 'up' });
  await walk(['up']);
  assert.equal(step(W, 'up'), 'blocked', 'the boulder, without Strength');
  W.strength = true;
  for (let i = 0; i < 2; i++) {
    later(1000);
    assert.equal(step(W, 'up'), 'blocked', 'a push');
    await walk(['up']);
  }
  assert.equal(W.rocks[0].y, 2);
  await walk(['right', 'right', 'up']);
  step(W, 'up');
  await settle();
  assert.equal(W.map.id, 'coronet-b1f');
  at(2, 3);
  assert.ok(W.foggy(), 'fog over the lake');
  // Back up: the boulder is in its place again, and it goes back into the tunnel from the room.
  step(W, 'up');
  await settle();
  assert.equal(W.map.id, 'coronet-211');
  at(27, 2);
  assert.equal(W.rocks[0].y, 4);
  await walk(['down', 'left', 'left']);
  W.player.face('down');
  W.strength = true;
  for (let i = 0; i < 2; i++) {
    later(1000);
    assert.equal(step(W, 'down'), 'blocked', 'a push');
    await walk(['down']);
  }
  await walk(['left']);
  at(24, 5);
  // The shore of Mt. Coronet's lake: what it looks like, and where the other lake is; no ending.
  W.load('coronet-b1f', { x: 6, y: 4, dir: 'down' });
  await walk(['down']);
  await settle();
  assert.ok(F.flag('coronet-lake'));
  assert.ok(said.some(s => /still lake fills the cave under Mt\. Coronet/.test(s)) && said.some(s => /deep in Victory Road/.test(s)), 'the lake and the hint');
  assert.deepEqual(endings, []);
  await walk(['down']);
  assert.equal(step(W, 'down'), 'blocked', 'the lake: Surf');
  const table = (map, m) => G.Maps.encounters(G.Maps.get(map), m);
  assert.ok([75, 436, 307, 433].every(sp => table('coronet-b1f', 'walk').mons.some(m => m[0] === sp)), 'Graveler, Bronzor, Meditite, Chingling');
  assert.ok(table('coronet-b1f', 'surf').mons.some(m => m[0] === 41) && table('coronet-b1f', 'good-rod').mons.some(m => m[0] === 339), 'Zubat on the water, Barboach on the Good Rod');
  // The fisherman.
  W.load('coronet-b1f', { x: 4, y: 8, dir: 'left' });
  await talk();
  assert.ok(said.some(s => /only on a few spots of the water/.test(s)));
  // The items: eight on the floor (one behind a cracked rock), two hidden.
  for (const [x, y, dir, item] of [[9, 9, 'left', 'tm69'], [21, 7, 'right', 'ultra-ball'], [16, 17, 'right', 'revive'], [20, 12, 'right', 'full-restore'],
                                    [20, 15, 'right', 'max-elixir'], [3, 16, 'left', 'soft-sand'], [22, 9, 'right', 'star-piece']]) {
    W.load('coronet-b1f', { x, y, dir });
    await talk();
    assert.equal(F.count(item), 1, item);
  }
  for (const [x, y, dir] of [[14, 11, 'left'], [2, 15, 'left']]) { W.load('coronet-b1f', { x, y, dir }); await talk(); }
  assert.equal(F.count('rare-candy'), 2, 'one on an island, one hidden');
  W.load('coronet-b1f', { x: 2, y: 11, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'the cracked rock');
  await talk();
  await walk(['left']);
  W.player.face('up');
  await talk();
  assert.equal(F.count('light-clay'), 1, 'behind the rock');
  // Feebas: four water tiles a day, from the date and the save.
  const m = G.Maps.get('coronet-b1f');
  let day = '2026-11-11';
  G.Clock.day = () => day;
  const today = W.feebasTiles();
  assert.equal(today.length, 4);
  assert.ok(today.every(k => { const [x, y] = k.split(',').map(Number); return G.Maps.kindAt(m, x, y) === 'water'; }), 'all on the water');
  assert.equal(JSON.stringify(W.feebasTiles()), JSON.stringify(today), 'the same all day');
  day = '2026-11-12';
  assert.notEqual(JSON.stringify(W.feebasTiles()), JSON.stringify(today), 'other tiles the next day');
  day = '2026-11-11';
  const id = S.player.id;
  S.player.id = (id + 1) & 0xffff;
  assert.notEqual(JSON.stringify(W.feebasTiles()), JSON.stringify(today), 'other tiles in another game');
  S.player.id = id;
  assert.equal(JSON.stringify(W.feebasTiles(G.Maps.get('coronet-211'))), '[]', 'no Feebas tiles elsewhere');
  F.giveItem('good-rod');
  const got = [];
  W.onEncounter = async (sp, lvl, area, info) => { got.push([G.Maps.species(sp), lvl, info.method]); return 'run'; };
  /** Stands next to a water tile, facing it (on land or surfing), and casts n times. */
  const cast = async (k, n) => {
    const [x, y] = k.split(',').map(Number);
    const from = [['left', 1, 0], ['right', -1, 0], ['up', 0, 1], ['down', 0, -1]].map(([dir, dx, dy]) => ({ dir, x: x + dx, y: y + dy }))
      .find(p => ['water', 'grass'].includes(G.Maps.kindAt(m, p.x, p.y)));
    S.player.surf = G.Maps.kindAt(m, from.x, from.y) === 'water' ? 1 : 0;
    W.load('coronet-b1f', from);
    got.length = 0;
    for (let i = 0; i < n; i++) await pump(W, W.fish('good-rod'));
    return got.slice();
  };
  W.seed(74);
  const there = (await cast(today[0], 30)).filter(g => g[0] === 349);
  assert.ok(there.length >= 5, 'Feebas bites on its tile: ' + there.length);
  assert.ok(there.every(g => g[1] >= 10 && g[1] <= 20 && g[2] === 'good-rod'), 'Lv. 10-20');
  const other = ['6,7', '10,9', '17,13', '19,16'].find(k => !today.includes(k));
  const elsewhere = await cast(other, 30);
  assert.ok(elsewhere.length > 10 && !elsewhere.some(g => g[0] === 349), 'never on another tile');
  S.player.surf = 0;
  // Victory Road: the ladder in the west corridor of the inside, down and back up.
  W.load('victory-inside', { x: 3, y: 20, dir: 'left' });
  step(W, 'left');
  await settle();
  assert.equal(W.map.id, 'victory-inside-b1f');
  at(2, 3);
  step(W, 'up');
  await settle();
  assert.equal(W.map.id, 'victory-inside');
  at(3, 20);
  assert.ok([184, 87, 444].every(sp => table('victory-inside-b1f', 'walk').mons.some(m => m[0] === sp)) && table('victory-inside-b1f', 'surf').mons.some(m => m[0] === 131),
    'Azumarill, Dewgong, Gabite; Lapras on the water');
  for (const [x, y, dir, item] of [[15, 9, 'left', 'ultra-ball'], [5, 16, 'left', 'rare-candy'], [25, 16, 'right', 'hp-up']]) {
    const before = F.count(item);
    W.load('victory-inside-b1f', { x, y, dir });
    await talk();
    assert.equal(F.count(item), before + 1, item);
  }
  // Its shore: both lakes seen, but no ending before chapter 73; then once.
  said.length = 0;
  W.load('victory-inside-b1f', { x: 5, y: 3, dir: 'down' });
  await walk(['down']);
  await settle();
  assert.ok(F.flag('victory-lake') && said.some(s => /cold, dark lake/.test(s)) && !said.some(s => /Travelers say/.test(s)));
  assert.deepEqual(endings, [], 'chapter 73 is not done');
  await walk(['down']);
  assert.equal(step(W, 'down'), 'blocked', 'the lake: Surf');
  F.setFlag('chapter-73-done');
  await walk(['up']);
  await settle();
  assert.deepEqual(endings, [74]);
  await walk(['down', 'up']);
  await settle();
  assert.deepEqual(endings, [74], 'once');
  // The other way round: Victory Road first, then Mt. Coronet ends the chapter.
  const two = world(FILES74);
  two.W.debug.noEnc = true;
  const said2 = [], endings2 = [];
  two.G.Dialog.say = text => { said2.push(String(text)); return Promise.resolve(); };
  two.G.CreditsUI = { ending: async n => { endings2.push(n); two.G.Field.setFlag('chapter-' + n + '-done'); } };
  two.G.Field.giveMon('empoleon', 40, {});
  two.G.Field.setFlag('chapter-73-done');
  const go = async (map, x, y) => {
    two.W.load(map, { x, y, dir: 'down' });
    step(two.W, 'down');
    for (let i = 0; i < 100; i++) { two.W.update(0.05); await tick(); if (!two.W.player.moving && !two.W.locked && i > 4) break; }
  };
  await go('victory-inside-b1f', 5, 3);
  assert.ok(said2.some(s => /under Mt\. Coronet, below the tunnel of Route 211/.test(s)), 'the hint');
  assert.deepEqual(endings2, []);
  await go('coronet-b1f', 6, 4);
  assert.deepEqual(endings2, [74]);
});

test('Lake Valor full again (chapter 75): dry before the Distortion World, water after; the beach and the cavern, TM25, the hidden HP Up, the first words and the ending once', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.giveMon('empoleon', 50, { moves: ['surf'] });
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const at = (x, y) => assert.deepEqual([W.player.x, W.player.y], [x, y]);
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  const fromLakefront = async () => {
    W.load('valor-lakefront', { x: 0, y: 12, dir: 'left' });
    assert.equal(step(W, 'left'), 'moved');
    await until(() => W.map.id === 'lake-valor');
    for (let i = 0; i < 20; i++) { W.update(0.05); await tick(); }
    await until(() => !W.locked);
  };
  // Before the Distortion World: the dry bed, the Magikarp, the grunts.
  let m = G.Maps.get('lake-valor');
  assert.ok(!m.changed && G.Maps.kindAt(m, 10, 5) === 'sand' && m.npcs.some(p => p.id === 'karp1') && m.trainers.length === 3);
  // After it: water, a beach before the cavern, nobody of before.
  F.setFlag('distortion-done');
  m = G.Maps.get('lake-valor');
  assert.ok(m.changed && G.Maps.kindAt(m, 10, 5) === 'water' && G.Maps.kindAt(m, 14, 11) === 'sand');
  assert.ok(m.trainers.length === 0 && !m.npcs.some(p => p.id.startsWith('karp')));
  assert.deepEqual(plain(G.Maps.validate('lake-valor')), []);
  // In from Valor Lakefront: the first words, and no ending before chapter 74.
  await fromLakefront();
  at(29, 10);
  assert.ok(F.flag('valor-full') && said.some(s => /Lake Valor is full again/.test(s)) && said.some(s => /Magikarp leaps/.test(s)));
  assert.deepEqual(endings, []);
  assert.ok(seen('fisher') && seen('guest') && !seen('karp1'));
  said.length = 0;
  await fromLakefront();
  assert.deepEqual(said, [], 'only the first time');
  // The water stops walking; Surf to the beach, TM25, the cavern and back out onto the beach.
  W.load('lake-valor', { x: 24, y: 11, dir: 'left' });
  assert.equal(step(W, 'left'), 'blocked', 'the lake');
  S.player.surf = 1;
  W.load('lake-valor', { x: 16, y: 11, dir: 'left' });
  assert.ok(W.surfing);
  step(W, 'left');
  await settle();
  assert.ok(!W.surfing, 'on the beach');
  at(15, 11);
  step(W, 'left');
  await settle();
  W.player.face('left');
  await talk();
  assert.equal(F.count('tm25'), 1);
  step(W, 'up');
  await until(() => W.map.id === 'valor-cavern' && !W.locked);
  at(7, 8);
  step(W, 'down');
  await until(() => W.map.id === 'lake-valor' && !W.locked);
  at(14, 11);
  assert.ok(!W.surfing);
  // The HP Up hidden in the grass; the tables of the water.
  W.load('lake-valor', { x: 26, y: 18, dir: 'right' });
  await talk();
  assert.equal(F.count('hp-up'), 1);
  const table = k => G.Maps.encounters(m, k).mons.map(r => r[0]);
  assert.ok(table('surf').includes(54) && table('good-rod').includes(118) && table('super-rod').includes(119), 'Psyduck, Goldeen, Seaking');
  // Once chapter 74 is done, coming in ends the chapter, once.
  F.setFlag('chapter-74-done');
  await fromLakefront();
  assert.deepEqual(endings, [75]);
  assert.ok(said.some(s => /as if the Galactic Bomb had never fallen/.test(s)));
  await fromLakefront();
  assert.deepEqual(endings, [75], 'once');
  // A save made on the old bed: standing on the water is surfing.
  S.player.surf = 0;
  W.load('lake-valor', { x: 8, y: 7, dir: 'down' });
  assert.ok(W.surfing);
});

test('the Seven Stars restaurant (chapter 76): five pairs a day from 9:00 to 23:00, two Pokémon needed, once a day each, the chef, the ending once', async () => {
  const sinnoh = ['sandgem', 'twinleaf', 'jubilife', 'oreburgh', 'floaroma', 'eterna', 'tgeterna', 'hearthome', 'solaceon', 'veilstone', 'lakefront', 'pastoria', 'celestic', 'canalave', 'ironisland', 'lakes', 'snowpoint', 'galactichq', 'coronet', 'distortion', 'sunyshore', 'victory', 'league', 'legends', 'battlezone', 'stark', 'battleground', 'resort', 'route212', 'wayward', 'route211', 'route224', 'temple', 'chateau', 'losttower', 'fullmoon', 'route219', 'amity', 'fuego', 'b1f']
    .map(f => 'js/content/sinnoh/' + f + '.js');
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/legends.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/regis.js', 'js/content/kanto/safari.js', 'js/world/roam.js', ...sinnoh]);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 32 }, (_, i) => i + 1);
  F.giveMon('empoleon', 50, {});
  F.giveMon('staraptor', 50, {});
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const seen = id => W.actors.some(a => a.visible !== false && a.def && a.def.id === id);
  const talk = () => pump(W, W.interact());
  let day = '2026-11-12', hour = 12;
  G.Clock.day = () => day;
  G.Clock.hour = () => hour;
  const SS = G.SevenStars, m = G.Maps.get('seven-stars');
  assert.deepEqual(plain(G.Maps.validate('seven-stars')), []);
  assert.equal(SS.PAIRS.length, 9);
  for (const t of m.trainers) assert.ok(t.partner && t.partner.cls && t.partner.name && G.TRAINER_CLASSES[t.cls] && G.TRAINER_CLASSES[t.partner.cls], t.id);
  // The day's five: the same all day, others another day and in another game.
  const five = plain(SS.today());
  assert.equal(five.length, 5);
  assert.deepEqual(plain(SS.today()), five);
  day = '2026-11-13';
  assert.notDeepEqual(plain(SS.today()), five, 'another day');
  day = '2026-11-12';
  const id0 = S.player.id;
  S.player.id = (id0 + 7) & 0xffff;
  assert.notDeepEqual(plain(SS.today()), five, 'another game');
  S.player.id = id0;
  /** In through the door (its enter script runs). */
  const comeIn = async () => {
    W.load('valor-lakefront', { x: 28, y: 7, dir: 'up' });
    assert.equal(step(W, 'up'), 'moved');
    await until(() => W.map.id === 'seven-stars' && !W.locked);
    for (let i = 0; i < 10; i++) { W.update(0.05); await tick(); }
  };
  await comeIn();
  for (const id of SS.PAIRS) assert.equal(seen(id), five.includes(id), id);
  // Outside the hours nobody is there, and the chef says when to come.
  for (const h of [8, 23]) {
    hour = h;
    await comeIn();
    assert.ok(SS.PAIRS.every(id => !seen(id)), 'nobody at ' + h);
  }
  W.load('seven-stars', { x: 7, y: 4, dir: 'up' });
  said.length = 0;
  await talk();
  assert.ok(said.some(s => /from nine in the morning until eleven at night/.test(s)), 'the hours');
  hour = 12;
  await comeIn();
  /** Stands next to a pair's first Trainer, facing them. */
  const nextTo = t => {
    for (const [dx, dy, dir] of [[0, 1, 'up'], [0, -1, 'down'], [-1, 0, 'right']]) {
      const x = t.x + dx, y = t.y + dy;
      if (G.Maps.open(m, x, y) && !W.actors.some(a => a.visible !== false && a.x === x && a.y === y)) { W.load('seven-stars', { x, y, dir }); return; }
    }
    assert.fail('no place next to ' + t.id);
  };
  const met = [];
  W.onTrainer = async d => { met.push(d.id); return 'win'; };
  // With one Pokémon able to fight, nobody battles.
  const second = S.party.splice(1, 1);
  nextTo(m.trainers.find(t => t.id === five[0]));
  await talk();
  assert.deepEqual(met, [], 'two Pokémon are needed');
  S.party.push(...second);
  // The day's five, in turn: the chef comes over after the fifth; no ending before chapter 75.
  const beatAll = async () => {
    met.length = 0;
    said.length = 0;
    for (const id of SS.today()) {
      W.load('seven-stars', 'door');
      for (let i = 0; i < 4; i++) { W.update(0.05); await tick(); }
      nextTo(m.trainers.find(t => t.id === id));
      await talk();
    }
    assert.deepEqual(plain(met), plain(SS.today()));
    assert.ok(said.some(s => /Five double battles in one day/.test(s)), 'the chef');
  };
  await beatAll();
  assert.deepEqual(endings, []);
  nextTo(m.trainers.find(t => t.id === five[0]));
  met.length = 0;
  await talk();
  assert.deepEqual(met, [], 'once a day');
  // The next day, after chapter 75: again, and the ending once.
  day = '2026-11-13';
  F.setFlag('chapter-75-done');
  await comeIn();
  await beatAll();
  assert.deepEqual(endings, [76]);
  day = '2026-11-14';
  await comeIn();
  await beatAll();
  assert.deepEqual(endings, [76], 'once');
});

test("Mirage Island (chapter 77): on the days a Pokémon of the party is the sea's choice, all that day; the island, Wynaut, the Nugget, the Liechi Berry, the old man, the ending once", async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save;
  S.player.badges = Array.from({ length: 24 }, (_, i) => i + 1);
  F.giveMon('swampert', 50, { moves: ['surf', 'dive'] });
  const said = [];
  G.Dialog.say = text => { said.push(String(text)); return Promise.resolve(); };
  const endings = [];
  G.CreditsUI = { ending: async n => { endings.push(n); F.setFlag('chapter-' + n + '-done'); } };
  const settle = async () => { for (let i = 0; i < 100; i++) { W.update(0.05); await tick(); if (!W.player.moving && !W.locked && i > 4) break; } };
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const talk = () => pump(W, W.interact());
  const M = G.Mirage;
  const day1 = '2026-11-12', day2 = '2026-11-13';
  let day = day1;
  G.Clock.day = () => day;
  /** A uid the sea chooses (or not) on these days. */
  const uid = (want, days) => { for (let i = 0; i < 10000; i++) { const u = 'mirage-test-' + i; if (days.every(d => M.chosen({ uid: u }, d) === want)) return u; } assert.fail('no uid'); };
  S.party[0].uid = uid(false, [day1, day2]);
  assert.ok(!M.visible(), 'nobody chosen: no island');
  let m = G.Maps.get('route130');
  assert.ok(!m.changed && G.Maps.kindAt(m, 14, 9) === 'water' && m.items.length === 0, 'only the sea');
  assert.deepEqual(plain(G.Maps.validate('route130')), []);
  W.load('pacifidlog-house2', { x: 8, y: 4, dir: 'up' });
  await talk();
  assert.ok(said.some(s => /Not today, though/.test(s)), 'the old man: not today');
  // A chosen Pokémon joins: the island is there, and stays all day after it leaves.
  F.giveMon('wynaut', 5);
  S.party[1].uid = uid(true, [day1]);
  assert.ok(M.visible() && F.getVar('mirage-day') === day1);
  S.party.splice(1, 1);
  assert.ok(M.visible(), 'all day, whoever is in the party');
  m = G.Maps.get('route130');
  assert.ok(m.changed && G.Maps.kindAt(m, 14, 9) === 'tall' && m.items.length === 2, 'the island');
  assert.ok(G.Maps.encounters(m, 'walk').mons.every(r => r[0] === 360), 'Wynaut in the grass');
  said.length = 0;
  W.load('pacifidlog-house2', { x: 8, y: 4, dir: 'up' });
  await talk();
  assert.ok(said.some(s => /There is an island out on Route 130 today/.test(s)), 'the old man: today');
  // In across the edge from Route 129: the island is there.
  S.player.surf = 1;
  W.load('route129', { x: 0, y: 9, dir: 'left' });
  assert.equal(step(W, 'left'), 'moved');
  await until(() => W.map.id === 'route130');
  assert.ok(W.map.changed);
  // Landing: the first words; no ending before chapter 76.
  said.length = 0;
  W.load('route130', { x: 20, y: 9, dir: 'left' });
  assert.ok(W.surfing);
  step(W, 'left');
  await settle();
  assert.ok(!W.surfing && F.flag('mirage-landed') && said.some(s => /An island that is on no map/.test(s)));
  assert.deepEqual(endings, []);
  // The Nugget and the only Liechi Berry.
  for (const [x, y, item] of [[17, 7, 'nugget'], [17, 10, 'liechi-berry']]) {
    W.load('route130', { x, y, dir: 'right' });
    await talk();
    assert.equal(F.count(item), 1, item);
    await talk();
    assert.equal(F.count(item), 1, item + ' once');
  }
  // The next day it is gone (nobody chosen), and a save made on it loads surfing.
  day = day2;
  assert.ok(!M.visible() && !G.Maps.get('route130').changed, 'gone the next day');
  S.player.surf = 0;
  W.load('route130', { x: 14, y: 9, dir: 'down' });
  assert.ok(W.surfing, 'on the water where the island was');
  // Back on its day, after chapter 76: the ending, once.
  day = day1;
  F.setFlag('chapter-76-done');
  W.load('route130', { x: 20, y: 9, dir: 'left' });
  step(W, 'left');
  await settle();
  assert.deepEqual(endings, [77]);
  W.load('route130', { x: 20, y: 9, dir: 'left' });
  step(W, 'left');
  await settle();
  assert.deepEqual(endings, [77], 'once');
});

test("the Ice Path and Clair's Gym: boulders into the holes, ice you can only cross with them", async () => {
  const { G, W, later } = world(['js/content/johto/icepath.js', 'js/content/johto/blackthorn.js']);
  W.debug.noEnc = true;
  G.Field.save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8];
  G.Field.giveMon('machop', 40, { moves: ['strength', 'low-kick'] });
  const settle = async () => { for (let i = 0; i < 80; i++) { W.update(0.05); await tick(); if (!W.player.moving && i > 4) break; } };
  const slide = async dirs => { for (const d of dirs) { step(W, d); await settle(); } };
  // 1F: the solver's way down the ice to the ladder.
  W.load('ice-path-1f', 'west');
  await slide(['down', 'right', 'down', 'right', 'up', 'right', 'up', 'right', 'right', 'down', 'right', 'up', 'left',
               'down', 'left', 'down', 'left', 'up', 'left', 'down', 'down']);
  assert.deepEqual([W.player.x, W.player.y], [2, 14], 'through the gap into the pocket of the ladder');
  // B1F: each boulder into its hole.
  const load = (x, y, dir) => { W.load('ice-path-b1f', { x, y, dir }); W.strength = true; };
  load(4, 4, 'down'); shove(W, later, 'down', 4);
  load(6, 4, 'right'); shove(W, later, 'right', 3); walk(W, ['up', 'right', 'right']); W.player.face('down'); shove(W, later, 'down', 4);
  load(13, 3, 'down'); shove(W, later, 'down', 5); walk(W, ['left', 'down', 'down']); W.player.face('right'); shove(W, later, 'right', 1);
  walk(W, ['up', 'right', 'right']); W.player.face('down'); shove(W, later, 'down', 1);
  load(2, 11, 'right'); shove(W, later, 'right', 4); walk(W, ['up', 'right', 'right']); W.player.face('down'); shove(W, later, 'down', 1);
  for (const at of ['4,9', '10,8', '14,10', '7,12']) assert.ok(G.Field.flag('pit:ice-path-b1f:' + at), 'filled ' + at);
  // B2F: the four boulders have landed on the ice, and they make the way across.
  W.load('ice-path-b2f', 'from-above');
  assert.equal(W.rocks.filter(r => r.fixed).length, 4);
  await slide(['down', 'down', 'right', 'up', 'right', 'down', 'left', 'down', 'right', 'up', 'left', 'up', 'right',
               'down', 'right', 'up', 'left', 'up', 'left', 'down', 'down']);
  assert.deepEqual([W.player.x, W.player.y], [9, 14], 'down into the pocket');
  // Clair's Gym: a boulder never goes over the chasm, only into its hole.
  const gym = (x, y, dir) => { W.load('blackthorn-gym', { x, y, dir }); W.strength = true; };
  gym(12, 11, 'up');
  later(1000);
  step(W, 'up');
  assert.equal(W.rocks.find(r => r.id === 'mid').y, 10, 'not over the chasm');
  gym(3, 16, 'up'); shove(W, later, 'up', 2);
  gym(13, 10, 'left'); shove(W, later, 'left', 2); walk(W, ['down', 'left', 'left']); W.player.face('up'); shove(W, later, 'up', 1);
  gym(3, 6, 'right'); shove(W, later, 'right', 3); walk(W, ['down', 'right', 'right']); W.player.face('up'); shove(W, later, 'up', 1);
  for (const at of ['3,13', '10,9', '7,5']) assert.ok(G.Field.flag('pit:blackthorn-gym:' + at), 'filled ' + at);
  // From the door to Clair across the three filled holes (her Trainers already beaten).
  for (const id of ['paul', 'lola', 'mike']) G.Field.markDone('blackthorn-gym:' + id);
  W.load('blackthorn-gym', 'door');
  walk(W, ['left', 'left', 'left', 'left', 'up', 'up', 'up', 'up', 'up', 'right', 'right', 'right', 'right', 'right', 'right', 'right',
           'up', 'up', 'up', 'up', 'left', 'left', 'left', 'up', 'up', 'up', 'up', 'up']);
  assert.deepEqual([W.player.x, W.player.y], [7, 3], 'in front of Clair');
});

test('Hoenn (chapter 78): the Battle Factory: in from the island, six rentals, three picked, a swap, seven in a row, the ending after chapter 77, retiring, doubles, Noland', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/content/hoenn/tower.js', 'js/content/hoenn/factory.js', 'js/world/roam.js', 'js/world/tower.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, Tw = G.Tower;
  F.setFlag('hoenn-champion');
  F.giveMon('swampert', 72, { moves: ['tackle'] });
  const own = JSON.stringify(F.party());
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const answers = [], picks = [], asked = [], said = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  G.Dialog.say = t => { said.push([].concat(t).join(' ')); return Promise.resolve(); };
  // The party screen: what it was given (the list, the label, greyed-out cards, notes), and a queued answer.
  G.PartyUI = { pick: o => {
    asked.push({ o, mons: plain(o.mons.map(m => m.sp)), disabled: plain(o.mons.map((m, i) => !!(o.disabled && o.disabled(m, i)))),
                 notes: plain(o.mons.map((m, i) => (o.note && o.note(m, i)) || null)) });
    const p = picks.shift();
    return Promise.resolve(p == null ? null : p);
  } };
  const fights = [];
  let outcome = () => 'win';
  W.onTrainer = async (d, info) => { fights.push({ d, info }); return outcome(fights.length); };
  const counter = async mode => { W.load('battle-factory-lobby', mode); await pump(W, W.interact()); await until(() => W.map.id === 'battle-factory-lobby' && !W.locked); };
  const winAll = n => { for (let i = 1; i < n; i++) answers.push(0, 1); };          // keep going, no swap

  // In through the new door east of the Battle Tower; the tower's door still leads to the tower.
  W.load('battle-tower', 'factory-door');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'battle-factory-lobby' && !W.locked);
  assert.equal(W.map.def.loc, 'battle-factory');
  W.load('battle-tower', 'tower-door');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'battle-tower-lobby' && !W.locked);

  // Backing out of the rentals: no run starts, and the same six are offered again.
  picks.push(0, null);
  await counter('single');
  assert.ok(F.flag('factory-rules'));
  const six = asked[0].mons;
  assert.equal(six.length, 6);
  assert.equal(new Set(six).size, 6, 'six different species');
  assert.equal(asked[0].o.action, 'Rent');
  assert.deepEqual(asked[1].disabled, [true, false, false, false, false, false], 'the first pick is taken');
  assert.equal(asked[1].notes[0], 'No. 1');
  assert.equal(asked[0].notes[2], G.Names.item(asked[0].o.mons[2].item), 'each card shows the held item');
  assert.equal(new Set(asked[0].o.mons.map(m => m.item)).size, 6, 'six different items');
  assert.ok(asked[0].o.mons.every(m => m.lvl === 50 && m.hp === G.Mon.maxHp(m) && m.moves.length >= 1));
  assert.ok(six.every(sp => Tw.pool(G.FactoryHall.rentalRound(0)).includes(sp)), 'the first rentals come from the second pool');
  assert.equal(fights.length, 0);
  assert.equal(+F.getVar('factory-runs') || 0, 0);

  // A run: rent 0, 1, 2; after the first win swap No. 1 for the opponent's second Pokémon; seven wins.
  asked.length = 0;
  picks.push(0, 1, 2, 0, 1);
  answers.push(0, 0, 0, 0);           // the challenge, these three, keep going, swap
  winAll(6);
  await counter('single');
  assert.deepEqual(asked.slice(0, 3).map(a => a.mons), [six, six, six], 'the same six as before');
  assert.equal(fights.length, 7, 'seven battles');
  const first = fights[0], rented = asked[0].o.mons;
  assert.deepEqual(plain(first.info.party.map(m => [m.sp, m.lvl, m.item])), plain(rented.slice(0, 3).map(m => [m.sp, 50, m.item])));
  assert.ok(first.info.rules.noExp && first.info.rules.noBag && first.info.canLose && !first.info.rules.double);
  assert.ok(first.d.team.every(x => Tw.pool(0).includes(x[0])), 'the opponents of the first set come from the first pool');
  // The swap: give up No. 1, take the opponent's second; it comes at full HP with its item.
  assert.equal(asked[3].o.action, 'Give up');
  assert.equal(asked[4].o.action, 'Take');
  const taken = G.Maps.species(first.d.team[1][0]);
  assert.deepEqual(plain(fights[1].info.party.map(m => m.sp)), [taken, rented[1].sp, rented[2].sp]);
  assert.equal(fights[1].info.party[0].hp, G.Mon.maxHp(fights[1].info.party[0]));
  assert.equal(fights[1].info.party[0].item, first.d.team[1][3]);
  const sw = fights[1].info.party[0], row = first.d.team[1][4];
  assert.deepEqual(plain([sw.gender, sw.ivs, sw.nature]), plain([row.gender, row.ivs, row.nature]), 'the very Pokémon that battled');
  assert.ok(said.some(t => t.includes(' joined your team')));
  assert.deepEqual([Tw.streak('single', 'factory'), Tw.bp(), Tw.streak('single')], [7, 3, 0], 'the Battle Tower streak is its own');
  assert.ok(!F.flag('chapter-78-done'), 'no ending before chapter 77');
  assert.equal(JSON.stringify(F.party()), own, 'your own Pokémon never take part');
  assert.ok(!Object.keys(S.done).some(k => k.startsWith('battle-factory')));
  assert.equal(new Set(fights.map(f => f.d.team.map(x => x[0]).join())).size, 7, 'seven different teams');
  assert.ok(fights.every(f => f.d.id !== 'anabel' && !f.d.brain));

  // Once chapter 77 is done, the next set of seven (battles 8 to 14, new rentals from the third pool) ends chapter 78.
  F.setFlag('chapter-77-done');
  fights.length = 0; asked.length = 0;
  picks.push(0, 1, 2);
  answers.push(0, 0);
  winAll(7);
  await counter('single');
  assert.equal(fights.length, 7);
  assert.ok(asked[0].mons.every(sp => Tw.pool(2).includes(sp)) && asked[0].mons.join() !== six.join(), 'new rentals, a round stronger');
  assert.ok(fights[0].d.team.every(x => Tw.pool(1).includes(x[0])), 'battle 8 is in the second set');
  assert.deepEqual([Tw.streak('single', 'factory'), Tw.bp()], [14, 6]);
  assert.ok(F.flag('chapter-78-done'));

  // Losing ends the streak; so does retiring.
  fights.length = 0;
  outcome = k => (k === 2 ? 'lose' : 'win');
  picks.push(0, 1, 2);
  answers.push(0, 0, 0, 1);
  await counter('single');
  assert.equal(fights.length, 2);
  assert.deepEqual([Tw.streak('single', 'factory'), Tw.best('single', 'factory')], [0, 15]);
  fights.length = 0;
  outcome = () => 'win';
  picks.push(0, 1, 2);
  answers.push(0, 0, 1);
  await counter('single');
  assert.equal(fights.length, 1);
  assert.deepEqual([Tw.streak('single', 'factory'), Tw.best('single', 'factory')], [0, 15]);

  // Double battles: four rentals, the double rule, teams of four, never Noland.
  fights.length = 0; asked.length = 0;
  outcome = () => 'lose';
  picks.push(0, 1, 2, 3);
  answers.push(0, 0);
  await counter('double');
  assert.equal(asked.length, 4);
  assert.equal(fights.length, 1);
  assert.ok(fights[0].info.rules.double && fights[0].d.double && fights[0].d.team.length === 4 && fights[0].info.party.length === 4);
  Tw.setStreak('double', 20, 'factory');
  fights.length = 0;
  outcome = () => 'win';
  picks.push(0, 1, 2, 3);
  answers.push(0, 0);
  await counter('double');
  assert.equal(fights.length, 1, 'battle 21 ends the third set');
  assert.notEqual(fights[0].d.id, 'noland', 'Noland only takes single battles');
  assert.equal(answers.length, 0);

  // Noland is the 21st single battle: three from the top pool, different every challenge; the Silver Knowledge Symbol.
  const noland = async () => {
    fights.length = 0;
    Tw.setStreak('single', 20, 'factory');
    picks.push(0, 1, 2);
    answers.push(0, 0);
    await counter('single');
    assert.equal(fights.length, 1, 'battle 21 also ends the third set');
    return fights[0].d;
  };
  const bp = Tw.bp();
  const one = await noland();
  assert.deepEqual([one.id, one.cls, one.who], ['noland', 'factory-head', 'noland']);
  assert.ok(one.team.length === 3 && one.team.every(x => Tw.pool(3).includes(x[0])));
  assert.ok(F.flag('factory-silver') && !F.flag('factory-gold'));
  assert.equal(Tw.bp(), bp + 10 + Tw.bpFor(3));
  const two = await noland();
  assert.notEqual(two.team.map(x => x[0]).join(), one.team.map(x => x[0]).join(), 'a new team every challenge');
  assert.equal(JSON.stringify(F.party()), own);
});

test('Hoenn (chapter 79): the Battle Arena: in from the island, three entered in order, the arena rule, seven in a row, the ending after chapter 78, losing, retiring, Greta', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/content/hoenn/tower.js', 'js/content/hoenn/factory.js', 'js/content/hoenn/arena.js',
                          'js/world/roam.js', 'js/world/tower.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, Tw = G.Tower;
  F.setFlag('hoenn-champion');
  for (const [sp, lvl, item] of [['swampert', 72, 'leftovers'], ['gardevoir', 70, 'leftovers'], ['mewtwo', 70, null], ['manectric', 45, null], ['altaria', 60, null]]) {
    const m = F.giveMon(sp, lvl, { moves: ['tackle'] });
    if (item) m.item = item;
  }
  const own = JSON.stringify(F.party());
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const answers = [], picks = [], asked = [], said = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  G.Dialog.say = t => { said.push([].concat(t).join(' ')); return Promise.resolve(); };
  G.PartyUI = { pick: o => { asked.push(plain(F.party().map((m, i) => [o.disabled(m, i), o.note(m, i)]))); return Promise.resolve(picks.shift()); } };
  const fights = [];
  let outcome = () => 'win';
  W.onTrainer = async (d, info) => { fights.push({ d, info }); return outcome(fights.length); };
  const counter = async () => { W.load('battle-arena-lobby', 'single'); await pump(W, W.interact()); await until(() => W.map.id === 'battle-arena-lobby' && !W.locked); };
  const keepGoing = n => { for (let i = 1; i < n; i++) answers.push(0); };

  // In through the new door at the east end of the island, and out again onto the island.
  W.load('battle-tower', 'arena-door');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'battle-arena-lobby' && !W.locked);
  assert.equal(W.map.def.loc, 'battle-arena');
  assert.equal(G.Names.loc('battle-arena'), 'Battle Arena');

  // Three entered in the order picked (Gardevoir would hold the same item as Swampert; Mewtwo cannot enter): seven wins.
  picks.push(3, 0, 4);
  answers.push(0);
  keepGoing(7);
  await counter();
  assert.ok(F.flag('arena-rules'));
  assert.deepEqual(asked[1], [[false, null], [false, null], [true, 'Cannot enter'], [true, 'No. 1'], [false, null]]);
  assert.deepEqual(asked[2], [[true, 'No. 2'], [true, 'Same item'], [true, 'Cannot enter'], [true, 'No. 1'], [false, null]]);
  assert.equal(fights.length, 7, 'seven battles');
  for (const { d, info } of fights) {
    assert.deepEqual(plain(info.party.map(m => [m.sp, m.lvl])), [[310, 45], [260, 50], [334, 50]], 'in the order picked, level 50 at most');
    assert.ok(info.rules.arena && info.rules.noExp && info.rules.noBag && info.rules.shift === false && info.canLose);
    assert.equal(d.team.length, 3);
    assert.ok(!d.double);
  }
  assert.ok(fights[0].d.team.every(x => Tw.pool(0).includes(x[0])));
  assert.equal(new Set(fights.map(f => f.d.team.map(x => x[0]).join())).size, 7, 'seven different teams');
  assert.deepEqual([Tw.streak('single', 'arena'), Tw.bp(), Tw.streak('single'), Tw.streak('single', 'factory')], [7, 3, 0, 0], 'its own streak; the same BP');
  assert.ok(!F.flag('chapter-79-done'), 'no ending before chapter 78');
  assert.equal(JSON.stringify(F.party()), own, 'the party is as it was');
  assert.ok(!Object.keys(S.done).some(k => k.startsWith('battle-arena')));
  // Once chapter 78 is done, the next set of seven ends chapter 79.
  F.setFlag('chapter-78-done');
  fights.length = 0;
  picks.push(3, 0, 4);
  answers.push(0);
  keepGoing(7);
  await counter();
  assert.equal(fights.length, 7);
  assert.ok(fights[0].d.team.every(x => Tw.pool(1).includes(x[0])), 'battle 8 is in the second set');
  assert.deepEqual([Tw.streak('single', 'arena'), Tw.bp()], [14, 6]);
  assert.ok(F.flag('chapter-79-done'));
  // Losing ends the streak; so does retiring.
  fights.length = 0;
  outcome = k => (k === 2 ? 'lose' : 'win');
  picks.push(3, 0, 4);
  answers.push(0, 0);
  await counter();
  assert.equal(fights.length, 2);
  assert.deepEqual([Tw.streak('single', 'arena'), Tw.best('single', 'arena')], [0, 15]);
  fights.length = 0;
  outcome = () => 'win';
  picks.push(3, 0, 4);
  answers.push(0, 1);
  await counter();
  assert.equal(fights.length, 1);
  assert.equal(Tw.streak('single', 'arena'), 0);
  // Picking one that cannot enter backs out: nothing starts.
  fights.length = 0;
  picks.push(2);
  answers.push(0);
  await counter();
  assert.equal(fights.length, 0, 'Mewtwo cannot enter: back out');
  assert.ok(said.some(t => t.includes('Please come again!')));
  // Greta is the 28th: her silver team, the Silver Guts Symbol and 10 BP besides the fourth set's.
  fights.length = 0;
  Tw.setStreak('single', 27, 'arena');
  const bp = Tw.bp();
  picks.push(3, 0, 4);
  answers.push(0);
  await counter();
  assert.equal(fights.length, 1, 'battle 28 also ends the fourth set');
  const greta = fights[0].d;
  assert.deepEqual([greta.id, greta.cls, greta.who], ['greta', 'arena-tycoon', 'greta']);
  assert.deepEqual(plain(greta.team.map(x => [x[0], x[3]])), [['heracross', 'salac-berry'], ['umbreon', 'leftovers'], ['shedinja', 'bright-powder']]);
  assert.ok(fights[0].info.rules.arena);
  assert.ok(F.flag('arena-silver') && !F.flag('arena-gold'));
  assert.equal(Tw.bp(), bp + 10 + Tw.bpFor(4));
  assert.equal(G.ArenaHall.TYCOON[56].team.map(x => x[0]).join(), 'umbreon,gengar,breloom');
  // The guide and the referee.
  W.load('battle-arena-lobby', { x: 3, y: 6, dir: 'left' });
  said.length = 0;
  await pump(W, W.interact());
  assert.ok(said.some(t => /Mind/.test(t)) && said.some(t => /twenty-eight/.test(t)));
});

test('Hoenn (chapter 80): the Battle Palace: in from the island, three entered, the palace rule, seven in a row, the ending after chapter 79, losing, retiring, Spenser', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/content/hoenn/tower.js', 'js/content/hoenn/factory.js', 'js/content/hoenn/arena.js', 'js/content/hoenn/palace.js',
                          'js/world/roam.js', 'js/world/tower.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, Tw = G.Tower;
  F.setFlag('hoenn-champion');
  for (const [sp, lvl, item] of [['swampert', 72, 'leftovers'], ['gardevoir', 70, 'leftovers'], ['mewtwo', 70, null], ['manectric', 45, null], ['altaria', 60, null]]) {
    const m = F.giveMon(sp, lvl, { moves: ['tackle'] });
    if (item) m.item = item;
  }
  const own = JSON.stringify(F.party());
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const answers = [], picks = [], asked = [], said = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  G.Dialog.say = t => { said.push([].concat(t).join(' ')); return Promise.resolve(); };
  G.PartyUI = { pick: o => { asked.push(plain(F.party().map((m, i) => [o.disabled(m, i), o.note(m, i)]))); return Promise.resolve(picks.shift()); } };
  const fights = [];
  let outcome = () => 'win';
  W.onTrainer = async (d, info) => { fights.push({ d, info }); return outcome(fights.length); };
  const counter = async () => { W.load('battle-palace-lobby', 'single'); await pump(W, W.interact()); await until(() => W.map.id === 'battle-palace-lobby' && !W.locked); };
  const keepGoing = n => { for (let i = 1; i < n; i++) answers.push(0); };

  // In through the new door at the east end of the island.
  W.load('battle-tower', 'palace-door');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'battle-palace-lobby' && !W.locked);
  assert.equal(W.map.def.loc, 'battle-palace');
  assert.equal(G.Names.loc('battle-palace'), 'Battle Palace');

  // Three entered in the order picked (Gardevoir would hold the same item as Swampert; Mewtwo cannot enter): seven wins.
  picks.push(3, 0, 4);
  answers.push(0);
  keepGoing(7);
  await counter();
  assert.ok(F.flag('palace-rules'));
  assert.deepEqual(asked[1], [[false, null], [false, null], [true, 'Cannot enter'], [true, 'No. 1'], [false, null]]);
  assert.deepEqual(asked[2], [[true, 'No. 2'], [true, 'Same item'], [true, 'Cannot enter'], [true, 'No. 1'], [false, null]]);
  assert.equal(fights.length, 7, 'seven battles');
  for (const { d, info } of fights) {
    assert.deepEqual(plain(info.party.map(m => [m.sp, m.lvl])), [[310, 45], [260, 50], [334, 50]], 'in the order picked, level 50 at most');
    assert.ok(info.rules.palace && !info.rules.arena && info.rules.noExp && info.rules.noBag && info.rules.shift === false && info.canLose);
    assert.equal(d.team.length, 3);
    assert.ok(!d.double);
  }
  assert.ok(fights[0].d.team.every(x => Tw.pool(0).includes(x[0])));
  assert.equal(new Set(fights.map(f => f.d.team.map(x => x[0]).join())).size, 7, 'seven different teams');
  assert.deepEqual([Tw.streak('single', 'palace'), Tw.bp(), Tw.streak('single'), Tw.streak('single', 'factory'), Tw.streak('single', 'arena')], [7, 3, 0, 0, 0], 'its own streak; the same BP');
  assert.ok(!F.flag('chapter-80-done'), 'no ending before chapter 79');
  assert.equal(JSON.stringify(F.party()), own, 'the party is as it was');
  assert.ok(!Object.keys(S.done).some(k => k.startsWith('battle-palace')));
  // Once chapter 79 is done, the next set of seven ends chapter 80.
  F.setFlag('chapter-79-done');
  fights.length = 0;
  picks.push(3, 0, 4);
  answers.push(0);
  keepGoing(7);
  await counter();
  assert.equal(fights.length, 7);
  assert.ok(fights[0].d.team.every(x => Tw.pool(1).includes(x[0])), 'battle 8 is in the second set');
  assert.deepEqual([Tw.streak('single', 'palace'), Tw.bp()], [14, 6]);
  assert.ok(F.flag('chapter-80-done'));
  // Losing ends the streak; so does retiring.
  fights.length = 0;
  outcome = k => (k === 2 ? 'lose' : 'win');
  picks.push(3, 0, 4);
  answers.push(0, 0);
  await counter();
  assert.equal(fights.length, 2);
  assert.deepEqual([Tw.streak('single', 'palace'), Tw.best('single', 'palace')], [0, 15]);
  fights.length = 0;
  outcome = () => 'win';
  picks.push(3, 0, 4);
  answers.push(0, 1);
  await counter();
  assert.equal(fights.length, 1);
  assert.equal(Tw.streak('single', 'palace'), 0);
  // Picking one that cannot enter backs out: nothing starts.
  fights.length = 0;
  picks.push(2);
  answers.push(0);
  await counter();
  assert.equal(fights.length, 0, 'Mewtwo cannot enter: back out');
  assert.ok(said.some(t => t.includes('Please come again!')));
  // Spenser is the 21st: his silver team with its natures, the Silver Spirit Symbol and 10 BP besides the third set's.
  fights.length = 0;
  Tw.setStreak('single', 20, 'palace');
  const bp = Tw.bp();
  picks.push(3, 0, 4);
  answers.push(0);
  await counter();
  assert.equal(fights.length, 1, 'battle 21 also ends the third set');
  const sp = fights[0].d;
  assert.deepEqual([sp.id, sp.cls, sp.who], ['spenser', 'palace-maven', 'spenser']);
  assert.deepEqual(plain(sp.team.map(x => [x[0], x[3], x[4].nature])), [['crobat', 'bright-powder', 'adamant'], ['slaking', 'scope-lens', 'hardy'], ['lapras', 'quick-claw', 'quiet']]);
  assert.ok(fights[0].info.rules.palace);
  assert.ok(F.flag('palace-silver') && !F.flag('palace-gold'));
  assert.equal(Tw.bp(), bp + 10 + Tw.bpFor(3));
  assert.equal(G.PalaceHall.MAVEN[42].team.map(x => x[0] + ':' + x[4].nature).join(), 'arcanine:hasty,slaking:hardy,suicune:hasty');
  // The guide.
  W.load('battle-palace-lobby', { x: 3, y: 6, dir: 'left' });
  said.length = 0;
  await pump(W, W.interact());
  assert.ok(said.some(t => /nature/.test(t)) && said.some(t => /twenty-one/.test(t)));
});

test('Hoenn (chapter 81): the Battle Dome: in from the island, three entered, sixteen in a tree, the data and the tree, two of three each match, four wins, the ending after chapter 80, losing, retiring, Tucker', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/content/hoenn/tower.js', 'js/content/hoenn/factory.js', 'js/content/hoenn/arena.js',
                          'js/content/hoenn/palace.js', 'js/content/hoenn/dome.js', 'js/world/roam.js', 'js/world/tower.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, Tw = G.Tower, D = G.DomeHall;
  F.setFlag('hoenn-champion');
  for (const [sp, lvl, item] of [['swampert', 72, 'leftovers'], ['gardevoir', 70, 'leftovers'], ['mewtwo', 70, null], ['manectric', 45, null], ['altaria', 60, null]]) {
    const m = F.giveMon(sp, lvl, { moves: ['tackle'] });
    if (item) m.item = item;
  }
  const own = JSON.stringify(F.party());
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const answers = [], picks = [], views = [], trees = [], said = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  G.Dialog.say = t => { said.push([].concat(t).join(' ')); return Promise.resolve(); };
  G.PartyUI = { pick: o => {
    if (o.view) { views.push({ title: o.title, mons: plain(o.mons.map(m => [m.sp, m.lvl, m.item])), notes: plain(o.mons.map(m => o.note(m))) }); return Promise.resolve(null); }
    return Promise.resolve(picks.shift());
  } };
  G.DomeUI = { show: b => { trees.push(plain(b)); return Promise.resolve(); } };
  const fights = [];
  let outcome = () => 'win';
  W.onTrainer = async (d, info) => { fights.push({ d, info }); return outcome(fights.length); };
  const counter = async () => { W.load('battle-dome-lobby', 'single'); await pump(W, W.interact()); await until(() => W.map.id === 'battle-dome-lobby' && !W.locked); };
  const enter = () => picks.push(3, 0, 4);                 // Manectric, Swampert, Altaria
  const rounds = n => { for (let i = 0; i < n; i++) { answers.push(0); picks.push(0, 1); } };   // Battle, then two of three

  // In through the new door at the east end of the island.
  W.load('battle-tower', 'dome-door');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'battle-dome-lobby' && !W.locked);
  assert.equal(W.map.def.loc, 'battle-dome');
  assert.equal(G.Names.loc('battle-dome'), 'Battle Dome');

  // The first tournament: the data and the tree before the first match, then four wins.
  enter();
  answers.push(0, 1, 2);                                     // the challenge; the opponent's data; the tree
  rounds(4);
  await counter();
  assert.ok(F.flag('dome-rules'));
  const t = D.last;
  assert.equal(t.k, 1);
  assert.equal(t.slots.length, 16);
  assert.equal(t.slots[0], null);
  assert.deepEqual([...t.ranks].sort((a, b) => a - b), [...Array(16).keys()].map(i => i + 1), 'ranks 1 to 16');
  assert.equal(new Set(t.slots.slice(1).map(d => d.name).concat(S.player.name)).size, 16, 'sixteen different names');
  assert.ok(t.slots.slice(1, 8).every(d => d.team.length === 3 && d.team.every(x => Tw.pool(0).includes(x[0]))), 'the first half from the first pool');
  assert.ok(t.slots.slice(8).every(d => d.team.every(x => Tw.pool(1).includes(x[0]))), 'the final opponent\'s half one round stronger');
  // The data: the first-round opponent's three, with their items; rank, style, training in the title.
  assert.equal(views.length, 1);
  assert.deepEqual(views[0].mons.map(x => x[0]), plain(t.slots[1].team.map(x => G.Maps.species(x[0]))));
  assert.ok(views[0].title.startsWith('Rank ' + t.ranks[1] + '. ') && / Trained for [^.]+\.$/.test(views[0].title), views[0].title);
  assert.ok(views[0].notes.every(n => typeof n === 'string' && n.length > 0), 'each card shows its item');
  // The tree: sixteen names, the player first, before any result.
  assert.equal(trees.length, 1);
  assert.equal(trees[0].names.length, 16);
  assert.equal(trees[0].names[0], S.player.name);
  assert.equal(trees[0].me, 0);
  assert.deepEqual(trees[0].results[0].slice(1).filter(x => x != null).length, 7, 'the other first-round matches are decided first');
  // Four matches: two of three each, the opponent's best two, against the right one each round.
  assert.equal(fights.length, 4);
  const mine = [310, 260, 334];
  const foes = [1, t.results[0][1], t.results[1][1], t.results[2][1]];
  assert.ok([2, 3].includes(foes[1]) && [4, 5, 6, 7].includes(foes[2]) && foes[3] >= 8);
  fights.forEach(({ d, info }, r) => {
    assert.deepEqual(plain(info.party.map(m => [m.sp, m.lvl])), [[310, 45], [260, 50]], 'two of the three');
    assert.ok(info.rules.noExp && info.rules.noBag && info.rules.shift === false && info.canLose && !info.rules.arena && !info.rules.palace);
    assert.equal(d.team.length, 2);
    assert.deepEqual(plain(d.team), plain(D.pickTwo(t.slots[foes[r]].team, mine)), 'the two that hit hardest');
    assert.equal(d.name, t.slots[foes[r]].name);
  });
  assert.deepEqual(plain(t.results.map(r => r[0])), [0, 0, 0, 0]);
  assert.deepEqual([Tw.streak('single', 'dome'), Tw.bp(), Tw.streak('single'), Tw.streak('single', 'factory'), Tw.streak('single', 'arena'), Tw.streak('single', 'palace')],
                   [1, 3, 0, 0, 0, 0], 'a tournament won; the other halls\' streaks untouched');
  assert.ok(said.some(s => s.includes('You won the tournament')));
  assert.ok(!F.flag('chapter-81-done'), 'no ending before chapter 80');
  assert.equal(JSON.stringify(F.party()), own, 'the party is as it was');
  assert.ok(!Object.keys(S.done).some(k => k.startsWith('battle-dome')));
  // Once chapter 80 is done, the next tournament won ends chapter 81; it is the second, a round stronger.
  F.setFlag('chapter-80-done');
  fights.length = 0;
  enter();
  answers.push(0);
  rounds(4);
  await counter();
  assert.equal(fights.length, 4);
  assert.equal(D.last.k, 2);
  assert.ok(D.last.slots.slice(1, 8).every(d => d.team.every(x => Tw.pool(1).includes(x[0]))));
  assert.deepEqual([Tw.streak('single', 'dome'), Tw.bp()], [2, 6]);
  assert.ok(F.flag('chapter-81-done'));
  // Losing the second match ends the streak; so does retiring before one.
  fights.length = 0;
  outcome = k => (k === 2 ? 'lose' : 'win');
  enter();
  answers.push(0);
  rounds(2);
  await counter();
  assert.equal(fights.length, 2);
  assert.equal(D.last.results[1][0], D.last.results[0][1], 'the winner goes on in the tree');
  assert.deepEqual([Tw.streak('single', 'dome'), Tw.best('single', 'dome')], [0, 2]);
  fights.length = 0;
  outcome = () => 'win';
  Tw.setStreak('single', 1, 'dome');
  enter();
  answers.push(0, 3);
  await counter();
  assert.equal(fights.length, 0);
  assert.equal(Tw.streak('single', 'dome'), 0);
  assert.ok(said.some(s => s.includes('You retired from the tournament')));
  // Tucker waits in the final of the fifth tournament: two of his silver team, the Silver Tactics Symbol and BP.
  fights.length = 0;
  Tw.setStreak('single', 4, 'dome');
  const bp = Tw.bp();
  enter();
  answers.push(0);
  rounds(4);
  await counter();
  assert.equal(fights.length, 4);
  const ace = fights[3].d;
  assert.deepEqual([ace.id, ace.cls, ace.who], ['tucker', 'dome-ace', 'tucker']);
  assert.equal(D.last.results[2][1], D.ACE_SLOT, 'he always comes through his half');
  assert.ok(ace.team.length === 2 && ace.team.every(x => ['swampert', 'salamence', 'charizard'].includes(x[0])));
  assert.ok(F.flag('dome-silver') && !F.flag('dome-gold'));
  assert.equal(Tw.bp(), bp + 10 + Tw.bpFor(5));
  assert.equal(Tw.streak('single', 'dome'), 5);
  assert.equal(JSON.stringify(F.party()), own);
});

test('Hoenn (chapter 82): the Battle Pike: in from the island, the doors and the hint, every kind of room, HP that stays, a pass, the ending after chapter 81, losing, retiring, Lucy', async () => {
  const { G, W } = world(['js/content/hoenn/littleroot.js', 'js/content/hoenn/route101.js', 'js/content/hoenn/petalburg.js', 'js/content/hoenn/woods.js',
                          'js/content/hoenn/rustboro.js', 'js/content/hoenn/rusturf.js', 'js/content/hoenn/dewford.js', 'js/content/hoenn/slateport.js',
                          'js/content/hoenn/mauville.js', 'js/content/hoenn/fallarbor.js', 'js/content/hoenn/lavaridge.js', 'js/content/hoenn/verdanturf.js',
                          'js/content/hoenn/fortree.js', 'js/content/hoenn/lilycove.js', 'js/content/hoenn/mossdeep.js', 'js/content/hoenn/seafloor.js',
                          'js/content/hoenn/sootopolis.js', 'js/content/hoenn/evergrande.js', 'js/content/hoenn/postgame.js', 'js/content/hoenn/regis.js',
                          'js/content/hoenn/legends.js', 'js/content/hoenn/tower.js', 'js/content/hoenn/factory.js', 'js/content/hoenn/arena.js',
                          'js/content/hoenn/palace.js', 'js/content/hoenn/dome.js', 'js/content/hoenn/pike.js', 'js/world/roam.js', 'js/world/tower.js']);
  W.debug.noEnc = true;
  const F = G.Field, S = F.save, Tw = G.Tower, P = G.PikeHall;
  F.setFlag('hoenn-champion');
  for (const [sp, lvl, item] of [['swampert', 72, 'leftovers'], ['gardevoir', 70, 'leftovers'], ['mewtwo', 70, null], ['manectric', 45, null], ['altaria', 60, null]]) {
    const m = F.giveMon(sp, lvl, { moves: ['tackle'] });
    if (item) m.item = item;
  }
  const own = JSON.stringify(F.party());
  const until = async ok => { for (let i = 0; i < 400 && !ok(); i++) { W.update(0.05); await tick(); } assert.ok(ok(), 'waited too long'); };
  const answers = [], picks = [], said = [];
  G.Dialog.ask = () => Promise.resolve(answers.length ? answers.shift() : 0);
  G.Dialog.say = t => { said.push([].concat(t).join(' ')); return Promise.resolve(); };
  G.PartyUI = { pick: () => Promise.resolve(picks.shift()) };
  const fights = [], wilds = [];
  let outcome = () => 'win', hurt = () => {};
  // Each battle keeps the HP the three had when it began.
  W.onTrainer = async (d, info) => { fights.push({ d, info, hp: info.party.map(m => m.hp) }); hurt(info.party, fights.length); return outcome(fights.length); };
  W.onEncounter = async (sp, lvl, area, info) => { wilds.push({ sp: G.Maps.species(sp), lvl, info, full: info.party.every(m => m.hp === G.Mon.maxHp(m)) }); return 'win'; };
  const counter = async () => { W.load('battle-pike-lobby', 'single'); await pump(W, W.interact()); await until(() => W.map.id === 'battle-pike-lobby' && !W.locked); };
  const enter = () => picks.push(3, 0, 4);                 // Manectric, Swampert, Altaria
  const doors = n => { for (let i = 0; i < n; i++) answers.push(0); };

  // In through the new door at the east end of the island.
  W.load('battle-tower', 'pike-door');
  assert.equal(step(W, 'up'), 'moved');
  await until(() => W.map.id === 'battle-pike-lobby' && !W.locked);
  assert.equal(W.map.def.loc, 'battle-pike');
  assert.equal(G.Names.loc('battle-pike'), 'Battle Pike');

  // The doors: the same for the same pair; the hinted kinds never behind the other two; the limits.
  const mk = () => ['swampert', 'gardevoir', 'manectric'].map(sp => G.Mon.create(G.Maps.species(sp), 50, { rng: G.RNG(3) }));
  const fresh = mk();
  assert.deepEqual(plain(P.doorsFor(1, 0, 5, fresh)), plain(P.doorsFor(1, 0, 5, fresh)));
  const worn = mk(); worn[0].hp = 1; worn[1].status = 'psn';
  const one = mk(); one[1].hp = 0; one[2].hp = 0;
  const done = mk(); done[0].hp = 0; done[1].status = 'par'; done[2].status = 'slp';
  for (let run = 1; run <= 40; run++) for (let k = 0; k < 6; k++) {
    for (const team of [fresh, worn, one, done]) {
      const p = P.doorsFor(1, k, run, team);
      assert.equal(p.hint, P.catOf(p.doors[p.hinted]), 'the hint is about the hinted door');
      p.doors.forEach((d, i) => { if (i !== p.hinted) assert.notEqual(P.catOf(d), p.hint, 'the other doors are not of the hinted kind'); });
      assert.ok(p.doors.every(d => P.allowed(d, team)), JSON.stringify(p));
    }
    assert.ok(!P.doorsFor(1, k, run, fresh).doors.some(d => d === 'full' || d === 'partial'), 'no healing at full health');
    assert.ok(!P.doorsFor(1, k, run, one).doors.includes('double'), 'no double battle with one able');
    assert.ok(!P.doorsFor(1, k, run, done).doors.includes('status'), 'no status room with none left to take one');
  }
  assert.deepEqual(plain(P.doorsFor(2, 6, 1, fresh)), { doors: ['queen', 'queen', 'queen'], hinted: 1, hint: 'dread' });
  assert.notEqual(P.doorsFor(1, 6, 1, fresh).hint, 'dread', 'Lucy only in her passes');

  // A pass with one room of each kind behind the first door: HP stays from room to room; only healing heals.
  let team = null;
  hurt = (party, n) => { team = party; if (n === 1) party[0].hp = 1; if (n === 3) party.forEach(m => { m.hp = Math.max(1, m.hp >> 1); }); };
  P.force = ['single', 'double', 'hard', 'wild', 'status', 'partial', 'full'];
  enter();
  answers.push(0);
  doors(7);
  await counter();
  assert.ok(F.flag('pike-rules'));
  assert.equal(fights.length, 3, 'three Trainer rooms');
  const [single, double, hard] = fights;
  assert.equal(single.d.team.length, 1, 'a normal Trainer: one Pokémon');
  assert.equal(hard.d.team.length, 3, 'the hard one: three');
  assert.ok(single.d.team.every(x => Tw.pool(0).includes(x[0])), 'the first pass: the first pool');
  assert.ok(single.info.canLose && single.info.rules.noExp && single.info.rules.noBag && single.info.rules.shift === false);
  assert.deepEqual(plain(single.info.party.map(m => m.sp)), [310, 260, 334]);
  assert.equal(double.info.party, single.info.party, 'the same three all the way');
  assert.equal(double.hp[0], 1, 'the HP lost in the first room is still lost');
  assert.ok(double.d.double && double.info.rules.double && double.d.team.length === 2 && double.d.partner.cls && double.d.partner.name, 'two Trainers, one Pokémon each');
  assert.ok(hard.d.team.every(x => Tw.pool(1).includes(x[0])), 'the hard Trainer: the next round');
  assert.equal(wilds.length, 1);
  const w = wilds[0];
  assert.ok([['seviper', 46], ['milotic', 46], ['dusclops', 45]].some(([sp, l]) => G.Maps.species(sp) === w.sp && l === w.lvl), JSON.stringify([w.sp, w.lvl]));
  assert.ok(w.info.noCatch && w.info.canLose && w.info.rules.noBag && w.info.rules.noExp);
  assert.deepEqual(plain(w.info.party.map(m => m.sp)), [310, 260, 334]);
  assert.ok(w.full, 'healed after the hard Trainer');
  assert.ok(hard.hp.some((h, i) => h < G.Mon.maxHp(hard.info.party[i])), 'still hurt when the hard Trainer came');
  const status = said.findIndex(s => / jumped out and attacked!/.test(s));
  assert.ok(status > 0);
  assert.equal(said.slice(status + 1, status + 4).filter(s => / was poisoned!| was frozen solid!| is paralyzed!| fell asleep!| was burned!/.test(s)).length, 2, 'room 10: two of them');
  assert.ok(said.some(s => / was restored to full health!/.test(s)), 'one or two healed');
  assert.ok(said.some(s => /were all restored to full health/.test(s)));
  assert.ok(team.every(m => m.hp === G.Mon.maxHp(m) && !m.status), 'the full heal at the end');
  assert.ok(said.some(s => /I sense someone|strange nostalgia|whispering|scent of Pokémon/.test(s)), 'the maid hints');
  assert.deepEqual([Tw.streak('single', 'pike'), Tw.bp(), Tw.streak('single'), Tw.streak('single', 'dome')], [1, 3, 0, 0], 'a pass; the other halls untouched');
  assert.ok(!F.flag('chapter-82-done'), 'no ending before chapter 81');
  assert.equal(P.log.length, 7);
  assert.equal(JSON.stringify(F.party()), own, 'the party is as it was');
  assert.ok(!Object.keys(S.done).some(k => k.startsWith('battle-pike')));
  // Once chapter 81 is done, the next pass ends chapter 82 (here, seven quiet rooms).
  F.setFlag('chapter-81-done');
  Tw.setStreak('single', 2, 'pike');
  P.force = Array(7).fill('empty');
  fights.length = 0;
  enter();
  answers.push(0);
  doors(7);
  await counter();
  assert.equal(fights.length, 0);
  assert.deepEqual([Tw.streak('single', 'pike'), Tw.bp()], [3, 7]);
  assert.ok(F.flag('chapter-82-done'));
  // All three down ends it; so does retiring at a door.
  hurt = () => {};
  outcome = () => 'lose';
  P.force = ['single'];
  enter();
  answers.push(0);
  doors(1);
  await counter();
  assert.deepEqual([Tw.streak('single', 'pike'), Tw.best('single', 'pike')], [0, 3]);
  assert.ok(said.some(s => /All your Pokémon fainted/.test(s)));
  outcome = () => 'win';
  P.force = null;
  Tw.setStreak('single', 1, 'pike');
  enter();
  answers.push(0, 3);
  await counter();
  assert.equal(Tw.streak('single', 'pike'), 0);
  assert.ok(said.some(s => /You retired from the Pike/.test(s)));
  // Lucy: behind every door of the 7th pair of the 2nd pass; her silver team with its natures, the Silver Luck Symbol.
  fights.length = 0;
  Tw.setStreak('single', 1, 'pike');
  P.force = Array(6).fill('empty');
  const bp = Tw.bp();
  enter();
  answers.push(0);
  answers.push(0, 0, 0, 0, 0, 2);
  await counter();
  assert.equal(fights.length, 1);
  const q = fights[0].d;
  assert.deepEqual([q.id, q.cls, q.who], ['lucy', 'pike-queen', 'lucy']);
  assert.deepEqual(plain(q.team.map(x => [x[0], x[3], x[4].nature])), [['seviper', 'quick-claw', 'brave'], ['shuckle', 'chesto-berry', 'bold'], ['milotic', 'leftovers', 'modest']]);
  assert.ok(said.some(s => /something terrible waits behind every one/.test(s)));
  assert.ok(F.flag('pike-silver') && !F.flag('pike-gold'));
  assert.equal(Tw.bp(), bp + 10 + Tw.bpFor(2));
  assert.equal(Tw.streak('single', 'pike'), 2);
  assert.equal(JSON.stringify(F.party()), own);
});
