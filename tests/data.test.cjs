// Generated game data (tools/fetch_data.py) and the hand-written tables that
// depend on it: everything one milestone may rely on is checked here.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, plain } = require('./helpers.cjs');

const DATA = ['js/data/types.js', 'js/data/species.js', 'js/data/moves.js', 'js/data/items.js', 'js/data/growth.js',
              'js/data/names.js', 'js/data/encounters.js', 'js/data/dex-text.js', 'js/data/natures.js', 'js/data/item-effects.js'];
const { G } = boot(CORE.concat(DATA));
const STATS6 = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

test('all 251 species of Kanto and Johto, with six base stats, valid types and a known growth rate', () => {
  const dex = Object.keys(G.SPECIES).map(Number).sort((a, b) => a - b);
  assert.equal(dex.length, 251);
  assert.equal(dex[0], 1); assert.equal(dex[250], 251);
  for (const [d, s] of Object.entries(G.SPECIES)) {
    assert.equal(s.base.length, 6, d);
    assert.ok(s.base.every(v => Number.isInteger(v) && v > 0), d);
    assert.equal(s.ev.length, 6, d);
    assert.ok(s.types.length >= 1 && s.types.length <= 2 && s.types.every(t => G.Types.LIST.includes(t)), d);
    assert.ok(G.GROWTH[s.gr], `${d} growth ${s.gr}`);
    assert.ok(s.cr >= 3 && s.cr <= 255, d);
    assert.ok(s.bx > 0, d);
    assert.ok(s.gf >= -1 && s.gf <= 8, d);
  }
  assert.deepEqual(plain(G.SPECIES[1].base), [45, 49, 49, 65, 65, 45]);
  assert.deepEqual(plain(G.SPECIES[25].types), ['electric']);
  assert.deepEqual(plain(G.SPECIES[35].types), ['fairy']);          // modern types
});

test('learnsets: every move exists, each species knows something at level 1', () => {
  for (const [d, s] of Object.entries(G.SPECIES)) {
    assert.ok(s.learn.length > 0, d);
    assert.equal(s.learn[0][0], 1, `${d} first move at level ${s.learn[0][0]}`);
    for (let i = 1; i < s.learn.length; i++) assert.ok(s.learn[i][0] >= s.learn[i - 1][0], `${d} learnset is sorted`);
    for (const [, m] of s.learn) assert.ok(G.MOVES[m], `${d} learns unknown ${m}`);
    for (const tm of s.tm) {
      assert.ok(G.TMS[tm], `${d} unknown machine ${tm}`);
      assert.ok(G.ITEMS[tm], `${d} machine ${tm} is not an item`);
    }
  }
  assert.deepEqual(plain(G.SPECIES[4].learn.slice(0, 3)), [[1, 'scratch'], [1, 'growl'], [7, 'ember']]);
  assert.equal(G.TMS.tm39, 'rock-tomb');                            // Brock's prize
  assert.equal(G.ITEMS.tm39.move, 'rock-tomb');
});

test('evolutions: levels, stones, friendship, and trades turned into levels or items', () => {
  const evo = d => plain(G.SPECIES[d].evo);
  assert.deepEqual(evo(10), [{ to: 11, how: 'level', level: 7 }]);
  assert.deepEqual(evo(11), [{ to: 12, how: 'level', level: 10 }]);
  assert.deepEqual(evo(4), [{ to: 5, how: 'level', level: 16 }]);
  assert.deepEqual(evo(25), [{ to: 26, how: 'item', item: 'thunder-stone' }]);
  assert.deepEqual(evo(64), [{ to: 65, how: 'level', level: 36, via: 'trade' }]);
  assert.deepEqual(evo(67), [{ to: 68, how: 'level', level: 37, via: 'trade' }]);
  assert.equal(G.SPECIES[133].evo.length, 5);                        // Eevee: three stones, Espeon by day, Umbreon by night
  assert.deepEqual(plain(G.SPECIES[133].evo.filter(e => e.how === 'friendship').map(e => e.time)), ['day', 'night']);
  assert.deepEqual(evo(42), [{ to: 169, how: 'friendship', min: 160 }]);   // Golbat -> Crobat
  assert.deepEqual(evo(95), [{ to: 208, how: 'item', item: 'metal-coat', via: 'trade' }]);   // Onix -> Steelix
  assert.deepEqual(plain(G.SPECIES[236].evo.map(e => e.stats)), [1, -1, 0]);                  // Tyrogue by its stats
  assert.equal(G.SPECIES[151].evo.length, 0);
  for (const [d, s] of Object.entries(G.SPECIES)) {
    for (const e of s.evo) {
      assert.ok(G.SPECIES[e.to], `${d} evolves into unknown ${e.to}`);
      assert.ok(['level', 'item', 'friendship'].includes(e.how), `${d} ${e.how}`);
      if (e.how === 'item') assert.ok(G.ITEMS[e.item] && G.ITEM_FX[e.item] && G.ITEM_FX[e.item].evo, `${d} stone ${e.item}`);
      if (e.how === 'level') assert.ok(e.level >= 1 && e.level <= 100, d);
    }
  }
});

test('moves: category, type, power and PP make sense', () => {
  const KINDS = ['damage', 'ailment', 'net-good-stats', 'heal', 'damage-ailment', 'swagger', 'damage-lower', 'damage-raise',
                 'damage-heal', 'ohko', 'whole-field-effect', 'field-effect', 'force-switch', 'unique'];
  for (const [id, m] of Object.entries(G.MOVES)) {
    assert.ok(['physical', 'special', 'status'].includes(m.cat), id);
    assert.ok(G.Types.LIST.includes(m.type), `${id} ${m.type}`);
    assert.ok(m.pp > 0, id);
    if (m.cat === 'status') assert.equal(m.pow, null, id);
    assert.ok(m.acc === null || (m.acc > 0 && m.acc <= 100), id);
    assert.ok(KINDS.includes(m.meta.k), `${id} meta ${m.meta.k}`);
    for (const [s, n] of m.stats) assert.ok([...STATS6, 'acc', 'eva'].includes(s) && n !== 0, id);
  }
  assert.equal(G.MOVES.ember.cat, 'special');
  assert.equal(G.MOVES['quick-attack'].pri, 1);
  assert.equal(G.MOVES.struggle.acc, null);
});

test('growth tables match the games', () => {
  const g = G.GROWTH;
  assert.equal(g['medium-slow'][5], 135);
  assert.equal(g['medium-slow'][100], 1059860);
  assert.equal(g.medium[100], 1000000);
  assert.equal(g.fast[100], 800000);
  assert.equal(g.slow[100], 1250000);
  assert.equal(g['slow-then-very-fast'][100], 600000);              // "erratic"
  assert.equal(g['fast-then-very-slow'][100], 1640000);             // "fluctuating"
  for (const [k, t] of Object.entries(g)) {
    assert.equal(t.length, 101, k);
    assert.equal(t[1], 0, k);
    for (let i = 2; i <= 100; i++) assert.ok(t[i] > t[i - 1], `${k} ${i}`);
  }
});

test('items: every hand-written effect matches a real item; shop items have prices', () => {
  for (const [id, fx] of Object.entries(G.ITEM_FX)) {
    assert.ok(G.ITEMS[id], `ITEM_FX.${id} is not in G.ITEMS`);
    if (fx.price !== undefined) assert.ok(Number.isInteger(fx.price) && fx.price > 0, id);
    if (fx.ball) assert.equal(G.ITEMS[id].pocket, 'balls', id);
    if (fx.key) assert.equal(G.ITEMS[id].pocket, 'key', id);
  }
  // Every non-TM item has a known behaviour.
  for (const [id, it] of Object.entries(G.ITEMS)) if (it.pocket !== 'tms') assert.ok(G.ITEM_FX[id], `${id} has no ITEM_FX entry`);
  for (const id of ['poke-ball', 'potion', 'antidote', 'paralyze-heal', 'escape-rope', 'repel']) assert.ok(G.ITEM_FX[id].price, id);
});

test('natures: 25, five of them neutral', () => {
  assert.equal(Object.keys(G.NATURES).length, 25);
  assert.equal(Object.values(G.NATURES).filter(n => !n.up && !n.down).length, 5);
  assert.deepEqual(plain(G.NATURES.adamant), { up: 'atk', down: 'spa' });
});

test('names: every species, move, item, type and stat has six names; Chinese is really Chinese', () => {
  const N = G.NAMES;
  assert.deepEqual(plain(N.langs), ['en', 'es', 'fr', 'it', 'zh-Hans', 'zh-Hant']);
  const six = (kind, ids) => { for (const id of ids) { const r = N[kind][id]; assert.ok(r && r.length === 6 && r.every(Boolean), `${kind} ${id}`); } };
  six('mon', Object.keys(G.SPECIES));
  six('move', Object.keys(G.MOVES));
  six('item', Object.keys(G.ITEMS));
  six('type', G.Types.LIST);
  six('stat', [...STATS6, 'acc', 'eva']);
  six('nature', Object.keys(G.NATURES));
  assert.equal(N.mon[25][4], '皮卡丘');
  assert.equal(N.loc['viridian-city'][1], 'Ciudad Verde');
  assert.equal(N.loc['pallet-town'][5], '真新鎮');
  const cjk = s => /[一-鿿]/.test(s);
  assert.ok(Object.values(N.mon).every(r => cjk(r[4]) && cjk(r[5])));
  // Places the first slice uses have every language.
  for (const loc of ['pallet-town', 'kanto-route-1', 'viridian-city', 'kanto-route-2', 'viridian-forest', 'pewter-city', 'kanto-route-22'])
    assert.ok(N.loc[loc] && N.loc[loc][3] !== N.loc[loc][0] && cjk(N.loc[loc][4]), loc);
});

test('texts: Pokédex entries for every species, without stray line breaks or spaces in Chinese', () => {
  for (const d of Object.keys(G.SPECIES)) {
    const t = G.DEX_TEXT.mon[d];
    assert.ok(t && t.length === 6 && t.every(Boolean), d);
    assert.ok(!/\n|\f/.test(t.join('')), d);
    assert.ok(!/[一-鿿] [一-鿿]/.test(t[4] + t[5]), `${d}: space inside Chinese text`);
    assert.ok(!/POKéMON/.test(t[0]), d);
  }
});

test('encounters: the slice\'s areas exist, use Kanto species and add up to 100 %', () => {
  for (const area of ['kanto-route-1-area', 'kanto-route-2-south-towards-viridian-city', 'kanto-route-22-area', 'viridian-forest-area']) {
    const e = G.ENCOUNTERS[area];
    assert.ok(e && e.walk, area);
    assert.ok(e.walk.rate > 0, area);
    assert.equal(e.walk.mons.reduce((s, m) => s + m[3], 0), 100, area);
  }
  for (const [area, e] of Object.entries(G.ENCOUNTERS)) {
    assert.ok(G.NAMES.loc[e.loc], `${area} -> ${e.loc}`);
    for (const [k, v] of Object.entries(e)) {
      if (k === 'loc' || k === 'ver') continue;
      for (const [d, mn, mx, ch] of v.mons) {
        assert.ok(G.SPECIES[d], `${area} ${d}`);
        assert.ok(mn >= 1 && mx >= mn && mx <= 100 && ch > 0, `${area} ${d}`);
      }
    }
  }
  const forest = new Set(G.ENCOUNTERS['viridian-forest-area'].walk.mons.map(m => m[0]));
  for (const d of [10, 13, 25]) assert.ok(forest.has(d), `Viridian Forest has ${d}`);
});
