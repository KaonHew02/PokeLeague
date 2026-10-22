/* Prints a map with its objects and checks it:
 *   node tools/map_check.js sandbox          one map (plus the errors of the maps it points to)
 *   node tools/map_check.js --all            every map: a line each, then the errors
 *   node tools/map_check.js --list           the ids of every map
 *
 * The grid shows people over the tiles: @ npc · ! trainer · $ item · ? hidden item.
 * Exit code 1 when there are errors (so it can run in a hook or CI).
 * Loads the game files in a node sandbox like the tests do (tests/helpers.cjs).
 */
const { boot, source } = require('../tests/helpers.cjs');

/** Game files the maps need, then every content file in dev.html order. */
function load() {
  const dev = source('dev.html');
  const content = [...dev.matchAll(/<script[^>]*src="(js\/content\/[^"]+\.js)"/g)].map(m => m[1]);
  const files = ['js/core/locales.js', 'js/core/util.js', 'js/core/rng.js', 'js/core/i18n.js', 'js/core/names.js',
    'js/data/species.js', 'js/data/moves.js', 'js/data/items.js', 'js/data/names.js', 'js/data/encounters.js', 'js/data/trainer-classes.js',
    'js/world/people.js', 'js/world/maps.js', 'js/world/path4.js', 'js/script/script.js', ...content];
  return boot(files).G;
}

function show(G, id) {
  const m = G.Maps.get(id);
  if (!m) { console.log(`no map "${id}". Maps: ${G.Maps.all().join(', ')}`); return 1; }
  const d = m.def;
  console.log(`${id}  ${m.w}×${m.h}  ${m.tileset}/${m.palette}  loc ${m.loc || '-'}  music ${m.music || '-'}  border ${m.borderCh || 'void'}`);
  const grid = m.def.rows.map(r => [...r]);
  for (const p of m.npcs) if (grid[p.y]) grid[p.y][p.x] = '@';
  for (const p of m.trainers) if (grid[p.y]) grid[p.y][p.x] = '!';
  for (const it of m.items) if (grid[it.y]) grid[it.y][it.x] = it.hidden ? '?' : '$';
  const pad = String(m.h).length + 2;
  const tens = [...Array(m.w).keys()].map(x => (x % 10 === 0 ? String(x / 10 % 10) : ' ')).join('');
  const ones = [...Array(m.w).keys()].map(x => x % 10).join('');
  console.log(' '.repeat(pad) + tens + '\n' + ' '.repeat(pad) + ones);
  grid.forEach((r, y) => console.log(String(y).padStart(pad - 2) + '  ' + r.join('')));
  const list = (label, items) => { if (items.length) console.log(label.padEnd(11) + items.join('\n' + ' '.repeat(11))); };
  const at = (x, y) => `${x},${y}`;
  const text = t => JSON.stringify(Array.isArray(t) ? t.join(' / ') : t);
  list('connect', Object.entries(m.connect).map(([s, c]) => `${s} -> ${c.map} (offset ${c.offset | 0})`));
  list('warps', m.warps.map(w => `${at(w.x, w.y)} -> ${w.to}:${w.spot}`));
  list('spots', Object.entries(m.spots).map(([k, v]) => `${k} ${at(v[0], v[1])} ${v[2] || ''}`));
  list('signs', Object.entries(m.signs).map(([k, v]) => `${k} ${text(v)}`));
  list('npcs', m.npcs.map(p => `${p.id} (${p.who}) ${at(p.x, p.y)} ${p.move || 'still'}${p.move === 'wander' ? ' r' + (p.r == null ? 2 : p.r) : ''} ${p.dir || ''}${p.if ? ' if ' + [].concat(p.if).join(' ') : ''} ${p.script ? '-> ' + (typeof p.script === 'string' ? p.script : '[script]') : text(p.say)}`));
  list('trainers', m.trainers.map(t => `${t.id} (${t.who}, ${t.cls}) ${at(t.x, t.y)} ${t.dir} sight ${t.sight}: ${(t.team || []).map(([s, l]) => s + ' ' + l).join(', ')}`));
  list('items', m.items.map(it => `${it.item}${it.n > 1 ? ' ×' + it.n : ''} at ${at(it.x, it.y)} [${it.flag}]${it.hidden ? ' hidden' : ''}`));
  list('triggers', m.triggers.map(t => `${at(t.x, t.y)} ${t.w || 1}×${t.h || 1}${t.if ? ' if ' + [].concat(t.if).join(' ') : ''} -> ${typeof t.script === 'string' ? t.script : '[script]'}`));
  if (d.enter) list('enter', [typeof d.enter === 'string' ? d.enter : '[script]']);
  list('encounters', Object.keys(m.encounters).map(k => {
    const e = G.Maps.encounters(m, k);
    const what = typeof m.encounters[k] === 'string' ? m.encounters[k] : 'inline';
    if (!e) return `${k} ${what}: MISSING`;
    return `${k} ${what}: rate ${e.rate}: ` + e.mons.map(([s, a, b, c]) => `${G.Names.mon(G.Maps.species(s))} ${a}-${b} ${c}%`).join(', ');
  }));
  const errs = G.Maps.validate(id);
  console.log(errs.length ? `\n${errs.length} error(s):\n  ` + errs.join('\n  ') : '\nno errors');
  return errs.length ? 1 : 0;
}

function all(G) {
  let bad = 0;
  for (const id of G.Maps.all()) {
    const m = G.Maps.get(id);
    const errs = G.Maps.validate(id);
    console.log(`${errs.length ? 'x' : 'ok'}  ${id.padEnd(24)} ${m.w}×${m.h} ${m.tileset}`);
    for (const e of errs) console.log('      ' + e);
    if (errs.length) bad++;
  }
  console.log(`${G.Maps.all().length} maps, ${bad} with errors`);
  return bad ? 1 : 0;
}

if (require.main === module) {
  const G = load();
  const arg = process.argv[2];
  if (!arg) { console.log('usage: node tools/map_check.js <map-id> | --all | --list'); process.exit(0); }
  if (arg === '--list') { console.log(G.Maps.all().join('\n')); process.exit(0); }
  process.exit(arg === '--all' ? all(G) : show(G, arg));
}

module.exports = { load };
