// The Battle Pyramid's floors (chapter 83): js/content/hoenn/pyramid.js. Dark mazes of 4 x 4 sections, all one piece, with
// the start and the ladder in two sections, four Trainers of one Pokémon, three items and the challenge's wild Pokémon.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/field.js', 'js/world/tower.js', 'js/script/script.js',
   'js/content/hoenn/tower.js', 'js/content/hoenn/pyramid.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'May', id: 1234 }));
const P = G.PyramidHall;
const section = ([x, y]) => Math.floor((x - 1) / 8) + 4 * Math.floor((y - 1) / 8);

/** Every tile one can walk to from (x, y): sand and the ladder. */
function reach(rows, [x0, y0]) {
  const seen = new Set([x0 + ',' + y0]), todo = [[x0, y0]];
  while (todo.length) {
    const [x, y] = todo.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const X = x + dx, Y = y + dy, k = X + ',' + Y;
      if (seen.has(k) || !rows[Y] || !':%'.includes(rows[Y][X] || '#')) continue;
      seen.add(k);
      todo.push([X, Y]);
    }
  }
  return seen;
}

test('every section is open in the middle of each side and all its sand is one piece', () => {
  for (const s of P.SECTIONS) {
    assert.equal(s.length, 8);
    assert.ok(s.every(r => r.length === 8));
    for (const i of [3, 4]) assert.ok(s[0][i] !== '#' && s[7][i] !== '#' && s[i][0] !== '#' && s[i][7] !== '#');
    const rows = s.map(r => r.replace(/[tic]/g, ':'));
    let first = null, sand = 0;
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === ':') { sand++; first = first || [x, y]; } }));
    assert.equal(reach(rows, first).size, sand);
    assert.ok(/t/.test(s.join('')) && /i/.test(s.join('')) && /c/.test(s.join('')), 'a place for a Trainer, an item, the start');
  }
});

test('a floor: walled in, one piece, the start and the ladder in two sections, every Trainer and item reachable; the same each time', () => {
  for (let run = 1; run <= 12; run++) for (const round of [1, 2, 4]) for (let floor = 1; floor <= 7; floor++) {
    const p = P.floorPlan(round, floor, run);
    assert.equal(p.rows.length, P.SIZE);
    assert.ok(p.rows.every(r => r.length === P.SIZE));
    assert.ok(p.rows[0] === '#'.repeat(P.SIZE) && p.rows[P.SIZE - 1] === '#'.repeat(P.SIZE) && p.rows.every(r => r[0] === '#' && r[P.SIZE - 1] === '#'));
    assert.equal(p.rows[p.exit[1]][p.exit[0]], '%');
    assert.notEqual(section(p.start), section(p.exit));
    const seen = reach(p.rows, p.start);
    assert.ok(seen.has(p.exit.join(',')), 'the ladder can be reached');
    assert.equal(p.trainers.length, 4);
    assert.equal(p.items.length, 3);
    const spots = [p.start, p.exit, ...p.trainers.map(t => [t.x, t.y]), ...p.items.map(i => [i.x, i.y])].map(s => s.join(','));
    assert.equal(new Set(spots).size, spots.length, 'nothing on top of anything else');
    for (const t of p.trainers) {
      assert.ok(seen.has(t.x + ',' + t.y) && p.rows[t.y][t.x] === ':');
      assert.equal(t.team.length, 1, 'one Pokémon');
      assert.equal(t.team[0][1], P.TRAINER_LEVEL, 'at the Pyramid\'s level (normal difficulty)');
      assert.ok(G.Tower.pool(Math.min(3, round - 1)).includes(t.team[0][0]));
      assert.ok(t.sight >= 2 && t.sight <= 3);
    }
    for (const i of p.items) assert.ok(seen.has(i.x + ',' + i.y) && p.rows[i.y][i.x] === ':' && G.ITEMS[i.item] && G.ITEM_FX[i.item], i.item);
  }
  assert.deepEqual(plain(P.floorPlan(2, 3, 9)), plain(P.floorPlan(2, 3, 9)));
  assert.notDeepEqual(plain(P.floorPlan(2, 3, 9).rows), plain(P.floorPlan(2, 4, 9).rows));
});

test('the floor as a map validates; the wild Pokémon of each challenge, three themes in turn', () => {
  for (let floor = 1; floor <= 7; floor++) {
    P.defineFloor(P.floorPlan(1, floor, 3));
    assert.deepEqual(plain(G.Maps.validate('battle-pyramid-floor')), []);
    const d = G.Maps.get('battle-pyramid-floor').def;
    assert.ok(d.dark && d.cave && d.noSave && d.noExp && d.onLose === 'pyramid.lost');
  }
  for (const round of [1, 2, 3]) {
    const t = P.wildTable(round);
    assert.equal(t.mons.reduce((a, m) => a + m[3], 0), 100);
    assert.ok(t.rate > 0);
  }
  assert.deepEqual(plain(P.wildTable(1).mons[0]), ['plusle', 30, 40, 20]);
  assert.equal(P.wildTable(2).mons[0][0], 'gulpin');
  assert.equal(P.wildTable(3).mons[0][0], 'growlithe');
  assert.deepEqual(plain(P.wildTable(4)), plain(P.wildTable(1)), 'then paralysis again');
  for (const th of P.THEMES) for (const [sp] of th) assert.ok(G.Maps.species(sp), sp);
  for (const [id] of P.FINDS) assert.ok(G.ITEMS[id] && G.ITEM_FX[id], id);
});
