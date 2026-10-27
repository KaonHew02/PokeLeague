// The overworld's rules without a screen (field.js): boulders and Strength, pits, gates, fast
// water, fishing, and trainers who see across water. Test maps are defined here; the drawing,
// the dialog box and the camera are stand-ins.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, plain, CORE, DATA, BATTLE } = require('./helpers.cjs');

const FILES = CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/player.js', 'js/world/field.js', 'js/script/script.js']);

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
