// The overworld's rules without a screen (field.js): boulders and Strength, pits, gates, fast
// water, fishing, trainers who see across water, Johto's clock, obedience and Egg, Headbutt and the Day Care. Test maps are defined here; the drawing,
// the dialog box and the camera are stand-ins.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, plain, CORE, DATA, BATTLE } = require('./helpers.cjs');

const FILES = CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/player.js', 'js/world/field.js', 'js/world/daycare.js', 'js/script/script.js']);

function el() {
  return { classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, appendChild() {}, style: {}, offsetWidth: 0 };
}

function world() {
  const ctx = boot(FILES);
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
