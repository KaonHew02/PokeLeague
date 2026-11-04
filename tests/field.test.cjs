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
    Camera: { snap() {}, w: 480, h: 320, scale: 1, left: () => 0, top: () => 0 },
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
  G.Field.save.player.badges = [1, 2, 3];
  W.load('t-cave', 'start');
  assert.equal(W.flyBlock(), 'here', 'not from a cave');
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
