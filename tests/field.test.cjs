// The overworld's rules without a screen (field.js): boulders and Strength, pits, gates, fast
// water, fishing, trainers who see across water, Johto's clock, obedience and Egg, Headbutt, the Day Care,
// the Bug-Catching Contest, Morty's floor of darkness, berry trees, Pryce's ice, waterfalls, whirlpools (the Whirl Islands),
// cracked rocks and Apricorn trees (the Dark Cave, Azalea Town), the stone panels and Unown of the Ruins of Alph,
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

/** Pushes the boulder in front n times (Strength on), following it after each push but the last. */
function shove(W, later, dir, n) {
  for (let i = 0; i < n; i++) {
    later(1000);
    assert.equal(step(W, dir), 'blocked', dir + ' push ' + (i + 1));
    if (i < n - 1) assert.equal(step(W, dir), 'moved');
  }
}
const walk = (W, dirs) => { for (const d of dirs) assert.equal(step(W, d), 'moved', d); };

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
