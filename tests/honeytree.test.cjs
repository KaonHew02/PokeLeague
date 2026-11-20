// Sinnoh's Honey trees (chapter 99): G.HoneyTrees in js/content/sinnoh/honeytree.js, Platinum's rules from its decompilation.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain, source } = require('./helpers.cjs');

const CONTENT = [...source('dev.html').matchAll(/<script[^>]*src="(js\/content\/[^"]+\.js)"/g)].map(m => m[1]);
const G = boot(CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js',
  'js/world/field.js', 'js/world/field-abilities.js', 'js/world/field-items.js', 'js/world/daycare.js', 'js/world/contest.js', 'js/world/roam.js',
  'js/world/tower.js', 'js/world/poffin.js', 'js/world/pokeblock.js', 'js/world/supercontest.js', 'js/world/ribbons.js', 'js/script/script.js'], CONTENT)).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const H = G.HoneyTrees;
const share = (n, f) => { let k = 0; for (let i = 0; i < n; i++) if (f(i)) k++; return k / n; };
const near = (a, b, tol = 0.02) => Math.abs(a - b) < tol;

test('the 21 trees: on Platinum\'s maps in its order, a Honey tree tile with open ground below', () => {
  assert.equal(H.TREES.length, 21);
  assert.deepEqual(plain(H.TREES.map(t => t[0])), ['route205s', 'route205e', 'route206', 'route207', 'route208', 'route209', 'route210s', 'route210n',
    'route211e', 'route212n', 'route212s', 'route213', 'route214', 'route215', 'route218', 'route221', 'route222', 'valley-windworks', 'eterna-forest',
    'fuego-ironworks', 'floaroma-meadow']);
  for (const [i, [map, x, y]] of H.TREES.entries()) {
    const m = G.Maps.get(map);
    assert.equal(G.Maps.kindAt(m, x, y), 'honeytree', map);
    assert.ok(!G.Maps.info(G.Maps.kindAt(m, x, y + 1)).solid, map + ': open below');
    assert.equal(H.treeOf(map), i);
  }
  assert.equal(H.treeOf('route201'), -1);
  assert.deepEqual(plain(H.GROUPS), { a: ['combee', 'wurmple', 'burmy', 'cherubi', 'aipom', 'aipom'], b: ['burmy', 'cherubi', 'combee', 'aipom', 'aipom', 'heracross'],
    c: ['munchlax', 'munchlax', 'munchlax', 'munchlax', 'munchlax', 'munchlax'] });
});

test('what comes: on most trees 10% nothing, 20% B, 70% A; on a Munchlax tree 1% C, 9% nothing, 20% A, 70% B; slots 40/20/20/10/5/5', () => {
  const rng = G.RNG(1), n = 20000;
  const plainT = { a: 0, b: 0, c: 0, none: 0 }, mun = { a: 0, b: 0, c: 0, none: 0 };
  for (let i = 0; i < n; i++) { plainT[H.group(false, rng) || 'none']++; mun[H.group(true, rng) || 'none']++; }
  assert.ok(near(plainT.none / n, 0.1) && near(plainT.b / n, 0.2) && near(plainT.a / n, 0.7) && plainT.c === 0, JSON.stringify(plainT));
  assert.ok(near(mun.c / n, 0.01, 0.005) && near(mun.none / n, 0.09) && near(mun.a / n, 0.2) && near(mun.b / n, 0.7), JSON.stringify(mun));
  const slots = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) slots[H.slot(rng)]++;
  H.SLOT_RATES.forEach((p, k) => assert.ok(near(slots[k] / n, p / 100), k + ': ' + slots[k] / n));
});

test('four Munchlax trees for every Trainer ID, all different', () => {
  for (let id = 0; id < 3000; id += 7) {
    const t = H.munchlaxTrees(id);
    assert.equal(new Set(t).size, 4, String(id));
    assert.ok(t.every(i => i >= 0 && i < 21));
  }
  assert.deepEqual(plain(H.munchlaxTrees(4321)), plain(H.munchlaxTrees(4321)));
});

test('the Honey stays a day: nothing for 6 hours, a Pokémon from 6 to 24 hours, bare after; nothing coming leaves the tree bare at once', () => {
  const F = G.Field;
  const tree = H.TREES.findIndex((t, i) => !H.isMunchlax(i));
  let st = null;
  for (let s = 1; !(st && st.group); s++) { F.setVar('honey-last', -1); st = H.spread(tree, G.RNG(s), 1000); }
  assert.deepEqual([H.status(tree, 1000), H.status(tree, 1359), H.status(tree, 1360), H.status(tree, 2439), H.status(tree, 2440)],
    ['waiting', 'waiting', 'ready', 'ready', 'bare']);
  // A draw of nothing: bare at once.
  let none = null;
  for (let s = 1; !none; s++) { F.setVar('honey-last', -1); const x = H.spread(tree, G.RNG(s), 5000); if (!x.group) none = x; }
  assert.equal(H.status(tree, 5000 + 400), 'bare');
  // The tree spread last keeps its group nine times in ten (and draws B or A again otherwise).
  const kept = share(2000, k => {
    F.setVar('honey:' + tree, '100|b|0');
    F.setVar('honey-last', tree);
    return H.spread(tree, G.RNG(k + 7), 200).group === 'b';
  });
  assert.ok(kept > 0.89 && kept < 0.95, 'about 0.9 + 0.1 x 0.2: ' + kept);
});

test('the Pokémon is level 5 to 15; Hustle, Vital Spirit or Pressure first: 15 half the time', () => {
  const rng = G.RNG(3);
  const lv = Array.from({ length: 2000 }, () => H.level(rng, null));
  assert.ok(lv.every(l => l >= 5 && l <= 15) && lv.includes(5) && lv.includes(15));
  assert.ok(share(2000, () => H.level(rng, null) === 15) < 0.12);
  const top = share(2000, () => H.level(rng, 'hustle') === 15);
  assert.ok(top > 0.5 && top < 0.6, String(top));
});
