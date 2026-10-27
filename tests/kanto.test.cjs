// The Kanto content (js/content/kanto/): one connected world from the bedroom to Brock.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/map_check.js');
const { plain } = require('./helpers.cjs');

const G = load();
const kanto = G.Maps.all().filter(id => !id.startsWith('sandbox') && !/^t\d+$/.test(id));

/** Maps a locked door's script warps to (the hideout's lift: ['warp', map, spot]). */
const scriptWarps = name => [...JSON.stringify(G.Script.get(name) || []).matchAll(/\["warp","([\w-]+)"/g)].map(m => m[1]);

/** Maps reachable from one map through doors, mats, stairs and edges (and the warps of locked doors' scripts). */
function reachable(from) {
  const seen = new Set([from]), todo = [from];
  while (todo.length) {
    const m = G.Maps.get(todo.pop());
    const next = m.warps.filter(w => w.to).map(w => w.to).concat(Object.values(m.def.connect || {}).map(c => c.map),
      m.warps.filter(w => typeof w.locked === 'string').flatMap(w => scriptWarps(w.locked)));
    for (const id of next) if (!seen.has(id)) { seen.add(id); todo.push(id); }
  }
  return seen;
}

test('a new game starts in the bedroom, and every Kanto map can be reached from there', () => {
  assert.ok(G.Maps.has('player-2f'));
  assert.ok(G.Maps.get('player-2f').spots.start, 'player-2f has the spot "start"');
  const r = reachable('player-2f');
  for (const id of kanto) assert.ok(r.has(id), id + ' cannot be reached');
});

test('the way north follows the games: Pallet, Route 1, Viridian, Route 2, the forest, Pewter', () => {
  const north = id => (G.Maps.get(id).def.connect || {}).north;
  const chain = ['pallet', 'route1', 'viridian', 'route2', 'viridian-forest', 'route2-north', 'pewter'];
  for (let i = 0; i < chain.length - 1; i++) assert.equal(north(chain[i]).map, chain[i + 1], chain[i]);
});

test('Brock: a leader with Geodude and Onix whose win script gives badge 1 and TM39', () => {
  const brock = G.Maps.get('pewter-gym').trainers.find(t => t.id === 'brock');
  assert.ok(brock.leader);
  assert.deepEqual(plain(brock.team.map(m => [m[0], m[1]])), [['geodude', 12], ['onix', 14]]);
  const win = JSON.stringify(G.Script.get(brock.win));
  assert.match(win, /\["badge",1\]/);
  assert.match(win, /"tm39"/);
  assert.equal(G.TRAINER_CLASSES[brock.cls].prize * 14, 1400);
});

test('every trainer class used on a map exists, and story flags that maps wait for get set somewhere', () => {
  const fs = require('node:fs'), path = require('node:path');
  const dir = path.join(__dirname, '..', 'js', 'content', 'kanto');
  const src = fs.readdirSync(dir).map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  for (const id of kanto) {
    for (const t of G.Maps.get(id).trainers) if (t.cls) assert.ok(G.TRAINER_CLASSES[t.cls], `${id}:${t.id} class ${t.cls}`);
  }
  // Flags in `if` conditions of people and triggers must be set by some script ('has-pokedex' by the parcel scene).
  const flags = new Set();
  for (const id of kanto) {
    const m = G.Maps.get(id);
    for (const p of [...m.npcs, ...m.trainers, ...m.triggers]) {
      for (const c of [].concat(p.if || [])) { const f = String(c).replace(/^!/, ''); if (/^[a-z][\w-]*$/.test(f)) flags.add(f); }
    }
  }
  flags.delete('scripted');                          // never set: people only scripts show (Oak in town, the rival on Route 22)
  for (const f of flags) assert.ok(src.includes(`'${f}'`) && (src.includes(`setFlag', '${f}'`) || src.includes(`setFlag('${f}'`)), 'flag never set: ' + f);
});

test('Vermilion City: only Cut opens the way to the Gym (as in the games)', () => {
  const m = G.Maps.get('vermilion');
  // Tiles a player can walk from the north entrance; doors count once you stand in front of them.
  const walk = cut => {
    const seen = new Set(), todo = [[16, 1]];
    while (todo.length) {
      const [x, y] = todo.pop(), k = x + ',' + y;
      if (seen.has(k) || !G.Maps.inside(m, x, y)) continue;
      const kind = m.kind[y * m.w + x];
      if (m.solid[y * m.w + x] && !(cut && kind === 'cuttree')) continue;
      seen.add(k);
      if (kind !== 'door') todo.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return seen;
  };
  assert.equal(m.kind[19 * m.w + 11], 'cuttree');
  assert.ok(!walk(false).has('6,17'), 'the Gym door can be reached without Cut');
  assert.ok(walk(true).has('6,17'), 'Cut does not open the way to the Gym');
  for (const door of ['5,5', '23,4', '27,13', '16,22']) assert.ok(walk(false).has(door), door);
});
