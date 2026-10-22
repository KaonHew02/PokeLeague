// The Kanto content (js/content/kanto/): one connected world from the bedroom to Brock.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/map_check.js');
const { plain } = require('./helpers.cjs');

const G = load();
const kanto = G.Maps.all().filter(id => !id.startsWith('sandbox') && !/^t\d+$/.test(id));

/** Maps reachable from one map through doors, mats, stairs and edges (locked doors excluded). */
function reachable(from) {
  const seen = new Set([from]), todo = [from];
  while (todo.length) {
    const m = G.Maps.get(todo.pop());
    const next = m.warps.filter(w => w.to).map(w => w.to).concat(Object.values(m.def.connect || {}).map(c => c.map));
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
  flags.delete('oak-in-town');                       // never set: Oak only appears in town by script
  for (const f of flags) assert.ok(src.includes(`'${f}'`) && (src.includes(`setFlag', '${f}'`) || src.includes(`setFlag('${f}'`)), 'flag never set: ' + f);
});
