// The overworld's data and logic: maps (legend, footprints, warps, spots,
// connections, people, signs, triggers, encounters), scripts, paths, sprites.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, plain } = require('./helpers.cjs');
const { load } = require('../tools/map_check.js');

const G = load();
let n = 0;
/** Defines a throwaway map and returns its validation errors. */
function errors(d) {
  const id = 't' + (++n);
  G.Maps.def(Object.assign({ id, tileset: 'outdoor', border: 'T' }, d));
  return G.Maps.validate(id);
}
const has = (errs, re) => errs.some(e => re.test(e));

test('every map in the game validates (warps, spots, connections, legend, footprints, scripts, encounters)', () => {
  const ids = G.Maps.all().filter(id => !/^t\d+$/.test(id));
  assert.ok(ids.includes('sandbox'), 'the sandbox map is loaded');
  for (const id of ids) assert.deepEqual(plain(G.Maps.validate(id)), [], id);
});

test('legend: unknown tiles and ragged rows are errors; indoor and outdoor tiles do not mix', () => {
  assert.ok(has(errors({ rows: ['..Z.', '....'] }), /unknown tile "Z"/));
  assert.ok(has(errors({ rows: ['....', '...'] }), /row 1 is 3 wide/));
  assert.ok(has(errors({ rows: ['W_', '__'] }), /unknown tile "W"/), 'W is an indoor tile');
  assert.ok(has(errors({ tileset: 'indoor', rows: ['WW', '.,'] }), /unknown tile "\."/));
  assert.deepEqual(plain(errors({ rows: ['.,:"fT#~F', 'v<>......'] })), []);
});

test('buildings: exact footprints, one door on the bottom row, every door has a warp', () => {
  const ok = { rows: ['HHHH.', 'HHHH.', 'HDHH.', '.....'], warps: [{ x: 1, y: 2, to: 'sandbox', spot: 'start' }] };
  assert.deepEqual(plain(errors(ok)), []);
  assert.ok(has(errors({ rows: ['HHH.', 'HHH.', 'HDH.'] }), /house at 0,0: "H" must fill a 4×3 block/));
  assert.ok(has(errors({ rows: ['HHHH', 'HHHH', 'HHHH'] }), /house at 0,0 has no door/));
  assert.ok(has(errors({ rows: ['HHHH', 'HDHH', 'HHHH'], warps: [{ x: 1, y: 1, to: 'sandbox', spot: 'start' }] }), /door must be on its bottom row/));
  assert.ok(has(errors({ rows: ['HHHH', 'HHHH', 'DDHH'] }), /two doors/));
  assert.ok(has(errors({ rows: ['....', '.D..'] }), /door D at 1,1 is not part of a building/));
  assert.ok(has(errors({ rows: ['HHHH', 'HHHH', 'HDHH'] }), /door at 1,2 has no warp/));
  // Two houses side by side, a Center and a Gym: one stamp each, the right sizes.
  const id = 't' + (++n);
  G.Maps.def({ id, rows: ['HHHHHHHH', 'HHHHHHHH', 'HDHHHHDH'] });
  assert.deepEqual(plain(G.Maps.get(id).stamps.map(s => [s.type, s.x, s.y, s.door])), [['house', 0, 0, [1, 2]], ['house', 4, 0, [2, 2]]]);
  const st = G.Maps.parse({ rows: ['CCCCC.GGGGGG', 'CCCCC.GGGGGG', 'CCCCC.GGGGGG', 'CCDCC.GGGGGG', '......GGGDGG'] }).stamps;
  assert.deepEqual(plain(st.map(s => [s.type, s.w, s.h, s.door])), [['center', 5, 4, [2, 3]], ['gym', 6, 5, [3, 4]]]);
  // The footprint blocks, the door does not.
  const m = G.Maps.get(id);
  assert.equal(G.Maps.open(m, 0, 0), false);
  assert.equal(G.Maps.open(m, 1, 2), true);
});

test('warps and spots resolve', () => {
  const base = { rows: ['HHHH', 'HHHH', 'HDHH', '....'], spots: { out: [1, 3, 'down'] } };
  assert.ok(has(errors(Object.assign({ warps: [{ x: 1, y: 2, to: 'nowhere', spot: 'door' }] }, base)), /unknown map "nowhere"/));
  assert.ok(has(errors(Object.assign({ warps: [{ x: 1, y: 2, to: 'sandbox', spot: 'nope' }] }, base)), /sandbox, which has no spot "nope"/));
  assert.ok(has(errors(Object.assign({ warps: [{ x: 1, y: 2, to: 'sandbox', spot: 'start' }, { x: 0, y: 3, to: 'sandbox', spot: 'start' }] }, base)), /warp 0,3 is on a grass tile/));
  assert.ok(has(errors({ rows: ['.T.'], spots: { bad: [1, 0, 'up'] } }), /spot "bad" 1,0 is on a tree tile/));
  assert.ok(has(errors({ rows: ['...'], spots: { bad: [0, 0, 'north'] } }), /bad direction "north"/));
  assert.ok(has(errors({ rows: ['...'], spots: { far: [5, 0] } }), /outside the map/));
  // Spot lookups: by name, by 'x,y,dir', by array.
  const m = G.Maps.get('sandbox');
  assert.deepEqual(plain(G.Maps.spot(m, 'start')), { x: 12, y: 8, dir: 'down' });
  assert.deepEqual(plain(G.Maps.spot(m, '3,5,left')), { x: 3, y: 5, dir: 'left' });
  assert.deepEqual(plain(G.Maps.spot(m, [4, 4])), { x: 4, y: 4, dir: 'down' });
  assert.equal(G.Maps.spot(m, 'nope'), null);
});

test('interiors: mats and stairs need warps; the Center and Mart builders make valid maps', () => {
  assert.ok(has(errors({ tileset: 'indoor', rows: ['WWW', '_X_'] }), /mat at 1,1 has no warp/));
  assert.ok(has(errors({ tileset: 'indoor', rows: ['W^W', '___'] }), /stairs at 1,0 has no warp/));
  for (const id of ['sandbox-center', 'sandbox-mart']) {
    const m = G.Maps.get(id);
    assert.equal(m.tileset, 'indoor');
    assert.ok(m.spots.door && m.warps.length === 1, id);
  }
  assert.ok(G.Maps.get('sandbox-center').spots.heal);
});

test('connections: the other map exists, connects back with the opposite offset, and the edges line up', () => {
  const a = 't' + (++n), b = 't' + (++n);
  // b sits north of a, 2 tiles to the right: a's x = b's x + 2.
  G.Maps.def({ id: a, rows: ['T..T', '....'], connect: { north: { map: b, offset: 2 } } });
  G.Maps.def({ id: b, rows: ['......', '..TTTT'], connect: { south: { map: a, offset: -2 } } });
  assert.deepEqual(plain(G.Maps.validate(a)), []);
  assert.deepEqual(plain(G.Maps.validate(b)), []);
  const ma = G.Maps.get(a);
  const c = G.Maps.across(ma, 2, -1);
  assert.equal(c.map.id, b);
  assert.deepEqual([c.x, c.y], [0, 1]);
  assert.equal(G.Maps.across(ma, 1, -1), null, 'left of the neighbour: nothing there');
  assert.equal(G.Maps.kindNear(ma, 2, -1), 'grass', 'autotiling sees the neighbour');
  assert.equal(G.Maps.kindNear(ma, 1, -1), 'tree', 'elsewhere it sees the border');
  const nb = G.Maps.neighbour(ma, 'north');
  assert.deepEqual([nb.ox, nb.oy], [2, -2]);
  // Broken pairs
  const c1 = 't' + (++n), c2 = 't' + (++n);
  G.Maps.def({ id: c1, rows: ['....'], connect: { east: { map: c2, offset: 1 } } });
  G.Maps.def({ id: c2, rows: ['....', '....'], connect: { west: { map: c1, offset: 1 } } });
  assert.ok(has(G.Maps.validate(c1), /offsets 1 and 1 do not match/));
  assert.ok(has(errors({ rows: ['....'], connect: { north: { map: 'sandbox', offset: 0 } } }), /has no south connection back/));
  assert.ok(has(errors({ rows: ['....'], connect: { up: { map: 'sandbox' } } }), /unknown side "up"/));
  assert.ok(has(errors({ rows: ['....'], connect: { north: { map: 'nope' } } }), /unknown map "nope"/));
  // The sandbox pair works both ways.
  const sb = G.Maps.get('sandbox');
  assert.equal(G.Maps.across(sb, 12, -1).map.id, 'sandbox-north');
  assert.deepEqual([G.Maps.across(sb, 12, -1).x, G.Maps.across(sb, 12, -1).y], [7, 11]);
});

test('people, items, signs and triggers', () => {
  assert.ok(has(errors({ rows: ['...'], npcs: [{ id: 'a', who: 'ghost', x: 0, y: 0 }] }), /unknown sprite "ghost"/));
  assert.ok(has(errors({ rows: ['T..'], npcs: [{ id: 'a', who: 'lass', x: 0, y: 0 }] }), /stands on a tree tile/));
  assert.ok(has(errors({ rows: ['...'], npcs: [{ id: 'a', who: 'lass', x: 0, y: 0 }, { id: 'a', who: 'lass', x: 1, y: 0 }] }), /two people with the id "a"/));
  assert.ok(has(errors({ rows: ['...'], npcs: [{ id: 'a', who: 'lass', x: 0, y: 0, move: 'dance' }] }), /move must be one of/));
  assert.ok(has(errors({ rows: ['...'], npcs: [{ id: 'a', who: 'lass', x: 0, y: 0, script: 'no.such' }] }), /unknown script "no.such"/));
  assert.ok(has(errors({ rows: ['...'], trainers: [{ id: 'a', who: 'lass', x: 0, y: 0, dir: 'left', sight: 3, team: [['missingno', 5]] }] }), /unknown Pokémon/));
  assert.ok(has(errors({ rows: ['...'], trainers: [{ id: 'a', who: 'lass', x: 0, y: 0, dir: 'left', sight: 3, team: [] }] }), /has no team/));
  assert.ok(has(errors({ rows: ['...'], items: [{ x: 1, y: 0, item: 'potion' }] }), /needs a flag/));
  assert.ok(has(errors({ rows: ['...'], items: [{ x: 1, y: 0, item: 'gold-bar', flag: 'x' }] }), /unknown item "gold-bar"/));
  assert.ok(has(errors({ rows: ['.S.'] }), /sign S at 1,0 has no text/));
  assert.deepEqual(plain(errors({ rows: ['.S.'], signs: { '1,0': 'Hello' } })), []);
  assert.ok(has(errors({ rows: ['...'], triggers: [{ x: 2, y: 0, w: 3, script: [['say', 'hi']] }] }), /outside the map/));
  assert.ok(has(errors({ rows: ['...'], triggers: [{ x: 0, y: 0, script: [['dance']] }] }), /unknown command "dance"/));
});

test('encounters: area keys resolve in G.ENCOUNTERS, inline tables add up to 100', () => {
  assert.ok(has(errors({ rows: ['"'], encounters: { walk: '@nowhere-area' } }), /"nowhere-area" has no walk encounters/));
  assert.ok(has(errors({ rows: ['"'], encounters: { walk: { rate: 20, mons: [['pidgey', 2, 3, 60]] } } }), /add up to 60/));
  assert.deepEqual(plain(errors({ rows: ['"'], encounters: { walk: { rate: 20, mons: [['pidgey', 2, 3, 60], [19, 2, 2, 40]] } } })), []);
  const t = G.Maps.encounters(G.Maps.get('sandbox'), 'walk');
  assert.ok(t.rate > 0 && t.mons.length);
  assert.equal(t.mons.reduce((a, r) => a + r[3], 0), 100);
  assert.equal(G.Maps.species('pidgey'), 16);
  assert.equal(G.Maps.species(16), 16);
  assert.equal(G.Maps.species('missingno'), null);
});

test('scripts: checking catches unknown commands, bad arguments and calls to missing scripts', () => {
  const E = G.Script.check([
    ['say', 'Hi'], ['say', ''], ['move', 'oak', 'UUX'], ['giveItem', 'gold-bar'], ['call', 'no.such'],
    ['choice', 'Ok?', [['setFlag', 'a']], [['bogus']]], ['if', 'flag', [['warp', 'sandbox', 'nope']]]
  ]);
  assert.ok(has(E, /\[1\] say: bad argument 1/));
  assert.ok(has(E, /\[2\] move: bad argument 2/));
  assert.ok(has(E, /\[3\] giveItem: bad argument 1/));
  assert.ok(has(E, /call to unknown script "no.such"/));
  assert.ok(has(E, /\[5\]\.no\[0\]: unknown command "bogus"/));
  assert.ok(has(E, /sandbox has no spot "nope"/));
  assert.equal(E.length, 6);
  for (const name of G.Script.all()) assert.deepEqual(plain(G.Script.check(G.Script.get(name))), [], name);
});

test('scripts run in order: say, choice, if, flags, vars, call and end', async () => {
  const W = boot(['js/core/locales.js', 'js/core/util.js', 'js/core/rng.js', 'js/core/i18n.js', 'js/core/names.js',
    'js/data/species.js', 'js/data/items.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/field.js', 'js/script/script.js']).G;
  const log = [];
  let answer = 0;
  const host = {
    say: async (t, o) => { log.push('say:' + [].concat(t).join('/') + (o.vars ? JSON.stringify(o.vars) : '')); },
    choice: async t => { log.push('ask:' + t); return answer; },
    itemName: id => 'N:' + id, jingle: async () => {},
    move: async (who, dirs) => { log.push('move:' + who + ':' + dirs.join('')); },
    lock() { log.push('lock'); }, unlock() { log.push('unlock'); }
  };
  W.Script.def('sub', [['say', 'in sub'], ['end'], ['say', 'never']]);
  const S = W.Field.save;
  await W.Script.run([
    ['setFlag', 'met'], ['setVar', 'count', 2], ['addVar', 'count', 3],
    ['if', 'met', [['say', 'flag on']], [['say', 'flag off']]],
    ['if', ['count>=5', '!other'], [['say', 'count ok']]],
    ['choice', 'Yes?', [['say', 'yes']], [['say', 'no']]],
    ['move', 'oak', 'UUL'],
    ['giveItem', 'potion', 2],
    ['call', 'sub'],
    ['say', 'not reached']
  ], host);
  assert.deepEqual(log, ['lock', 'say:flag on', 'say:count ok', 'ask:Yes?', 'say:yes', 'move:oak:upupleft',
    'say:{player} received {item} ×{n}!{"item":"N:potion","n":2}', 'say:in sub', 'unlock']);
  assert.equal(S.flags.met, 1);
  assert.equal(S.vars.count, 5);
  assert.equal(S.bag.potion, 2);
  answer = 1; log.length = 0;
  await W.Script.run([['choice', 'Again?', [['say', 'yes']], [['say', 'no']]], ['clearFlag', 'met'], ['if', 'met', [['say', 'x']], [['say', 'cleared']]]], host);
  assert.deepEqual(log, ['lock', 'ask:Again?', 'say:no', 'say:cleared', 'unlock']);
  // Conditions
  const T = W.Field.test;
  S.player.badges = [1]; S.bag.antidote = 1; S.done['r2:rick'] = 1;
  assert.ok(T('badge:1') && !T('badge:2') && T('has:antidote') && !T('has:repel') && T('done:r2:rick'));
  assert.ok(T('badges=1') && T('money>=0') && T('count!=4') && T('count<6') && !T('count>5'));
  assert.ok(T(null) && T([]) && T(s => s.vars.count === 5));
});

test('paths: 4 neighbours around obstacles; ledges only downhill', () => {
  const rows = ['.....', '.###.', '.....', 'vvvvv', '.....'];
  const open = (x, y) => y >= 0 && y < rows.length && x >= 0 && x < 5 && rows[y][x] === '.';
  const ledge = (x, y) => (rows[y] || '')[x] === 'v' ? 'down' : null;
  const p = G.Path4.find({ x: 2, y: 0 }, [{ x: 2, y: 2 }], { open, ledge });
  assert.equal(p.dirs.length, 6);              // around the wall
  const down = G.Path4.find({ x: 2, y: 2 }, [{ x: 2, y: 4 }], { open, ledge });
  assert.deepEqual(plain(down.dirs), ['down']);   // one hop
  assert.equal(G.Path4.find({ x: 2, y: 4 }, [{ x: 2, y: 2 }], { open, ledge }), null);   // never uphill
  // Unreachable goal: walk to the reachable tile closest to it.
  const near = G.Path4.find({ x: 0, y: 4 }, [{ x: 2, y: 0 }], { open, ledge, near: true });
  assert.equal(near.reached, false);
  assert.deepEqual(plain(near.goal), { x: 2, y: 4 });
  assert.deepEqual(plain(G.Path4.parse('uudlR')), ['up', 'up', 'down', 'left', 'right']);
});

test('trainer and NPC sprites: every archetype has well-formed templates', () => {
  assert.deepEqual(plain(G.People.check()), []);
  for (const who of ['player-boy', 'player-girl', 'rival', 'oak', 'mom', 'nurse', 'clerk', 'youngster', 'lass', 'bugcatcher', 'camper', 'brock', 'guide', 'oldman'])
    assert.ok(G.People.TYPES.includes(who), who);
});
