// Platinum's Poké Radar (chapter 106, G.Radar in js/world/radar.js; pret/pokeplatinum src/pokeradar.c, wild_encounters.c,
// encounter.c): the patches on the four rings, the battery, which patches keep the chain (after a win, after a catch), the
// shiny chance, a step into a patch, what a battle does to the chain, patches out of sight; the radar's tables in the data.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, plain, CORE, DATA, BATTLE } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, ['js/data/encounters.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/script/script.js', 'js/world/radar.js'])).G;
const R = G.Radar, F = G.Field;
const AREA = 'sinnoh-route-210-west-towards-celestic-town';

// A field of tall grass (17 x 17 tiles, from 2 to 18) inside a path; a map of path only.
G.Maps.def({ id: 'rd-field', tileset: 'outdoor', palette: 'kanto', border: 'T', region: 'sinnoh',
  rows: Array.from({ length: 21 }, (_, y) => (y === 0 || y === 20 ? 'T'.repeat(21) : y === 1 || y === 19 ? 'T' + '.'.repeat(19) + 'T' : 'T.' + '"'.repeat(17) + '.T')),
  encounters: { walk: '@' + AREA }, spots: { mid: [10, 10, 'down'] } });
G.Maps.def({ id: 'rd-path', tileset: 'outdoor', palette: 'kanto', border: 'T', region: 'sinnoh',
  rows: Array.from({ length: 11 }, () => '.'.repeat(11)), spots: { mid: [5, 5, 'down'] } });
const field = G.Maps.get('rd-field'), path = G.Maps.get('rd-path');

/** A stand-in for G.RNG: int(a, b) gives the next queued value (kept between a and b), then a; every call is recorded. */
function fixed(...vals) {
  const calls = [];
  return { calls, int: (a, b) => { calls.push([a, b]); return vals.length ? Math.min(b, Math.max(a, vals.shift())) : a; }, next: () => 0 };
}
/** Uses the radar on the field with a full battery. */
function shake(x, y, rng, map = field) {
  R.clear();
  F.setVar('radar-charge', R.STEPS);
  return R.use(map, x, y, rng);
}
const draws = [];
/** The field's draw: Bidoof (or `sp`) at level 28; the table it was given is recorded. */
const draw = (sp = 399) => table => { draws.push(table); return { sp, lvl: 28 }; };
const cheb = (p, x, y) => Math.max(Math.abs(p.x - x), Math.abs(p.y - y));

test('the data: the Poké Radar is a key item used in the field; Platinum\'s areas have a `radar` table, `walk` stays without its slots', () => {
  assert.ok(G.ITEMS['poke-radar'] && G.ITEMS['poke-radar'].pocket === 'key' && G.ITEM_FX['poke-radar'].key && G.ITEM_FX['poke-radar'].field);
  assert.notEqual(G.Names.item('poke-radar'), 'poke-radar');
  const a = G.ENCOUNTERS[AREA];
  const sum = t => t.reduce((s, r) => s + r[3], 0);
  assert.equal(sum(a.radar.mons), 100);
  assert.ok(a.radar.mons.some(r => r[0] === 371) && !a.walk.mons.some(r => r[0] === 371), 'Bagon only with the radar (Route 210)');
  assert.equal(a.radar.rate, a.walk.rate);
  assert.deepEqual(plain(G.Maps.encounters(field, 'radar')), plain(a.radar), 'a map finds it in its walking area');
  assert.ok(Object.values(G.ENCOUNTERS).filter(e => e.radar).length >= 40);
  assert.ok(Object.values(G.ENCOUNTERS).every(e => !e.radar || e.ver === 'platinum' || e.ver === 'diamond' || e.ver === 'pearl'));
});

test('the battery: a step counts only with the radar in the Bag, up to 50; an empty battery says how many steps are left; using it empties it', () => {
  F.setVar('radar-charge', 0);
  R.step();
  assert.equal(R.charge(), 0, 'no radar, no charge');
  F.giveItem('poke-radar', 1);
  for (let i = 0; i < 49; i++) R.step();
  assert.equal(R.charge(), 49);
  assert.deepEqual(plain(R.use(field, 10, 10, fixed())), { res: 'dry', left: 1 });
  assert.equal(R.charge(), 49, 'still 49');
  R.step(); R.step();
  assert.equal(R.charge(), 50, 'never more than 50');
  assert.equal(R.use(field, 10, 10, fixed()).res, 'shake');
  assert.equal(R.charge(), 0);
  // No tall grass around: the grass stays quiet, the battery is used all the same, nothing is left of a chain.
  assert.equal(shake(5, 5, fixed(), path).res, 'quiet');
  assert.equal(R.charge(), 0);
  assert.ok(!R.active());
});

test('the patches: one on each ring (4, 3, 2 and 1 tiles away), every tile of a ring reachable, as Platinum picks them', () => {
  const RING = [32, 24, 16, 8];
  for (let ring = 0; ring < 4; ring++) {
    const seen = new Set();
    for (let n = 0; n < RING[ring]; n++) {
      const vals = [0, 0, 0, 0]; vals[ring] = n;
      shake(10, 10, fixed(...vals));
      const p = R.state.patches.find(q => q.ring === ring);
      assert.equal(cheb(p, 10, 10), 4 - ring, 'ring ' + ring + ' index ' + n);
      seen.add(p.x + ',' + p.y);
    }
    assert.equal(seen.size, 8 * (4 - ring), 'ring ' + ring + ': all its tiles');
  }
  // Index 0 is the top left corner of each ring; only tall grass holds a patch.
  shake(10, 10, fixed(0, 0, 0, 0));
  assert.deepEqual(plain(R.state.patches.map(p => [p.x, p.y])), [[6, 6], [7, 7], [8, 8], [9, 9]]);
  shake(5, 5, fixed(0, 0, 0, 0));
  assert.deepEqual(plain(R.state.patches.map(p => p.ring)), [1, 2, 3], 'the outer ring falls on the path');
});

test('which patches keep the chain (Platinum\'s rates by ring: 88/68/48/28 after a win, 98/78/58/38 after a catch), how they shake, the shiny ones', () => {
  // Used: as after a win. Ring 0: 87 < 88 keeps; ring 1: 68 does not (then 49: soft); ring 2: 47 keeps; ring 3: 28 does not (50: hard).
  shake(10, 10, fixed(0, 0, 0, 0, 87, 68, 49, 47, 28, 50));
  assert.deepEqual(plain(R.state.patches.map(p => [p.cont, p.shake, p.shiny])),
    [[true, 'soft', false], [false, 'soft', false], [true, 'soft', false], [false, 'hard', false]]);
  // The first patch (ring 0, at 6,6) begins the chain: Bidoof drawn, chain 1; the next patches around it.
  draws.length = 0;
  const w = R.enter(field, 6, 6, fixed(0, 0, 0, 0), draw());
  assert.deepEqual(plain(w), { sp: 399, lvl: 28, shiny: false, radar: true });
  assert.equal(R.count(), 1);
  assert.deepEqual(plain(R.state.patches.map(p => [p.x, p.y])), [[2, 2], [3, 3], [4, 4], [5, 5]]);
  // Caught: ring 0: 97 keeps (shiny roll 1 of 8000: no); ring 1: 78 does not (10: soft); ring 2: 57 keeps (0: shiny); ring 3: 38 does not (99: hard).
  const rng = fixed(97, 1, 78, 10, 57, 0, 38, 99);
  R.after('caught', rng, true);
  assert.deepEqual(plain(R.state.patches.map(p => [p.cont, p.shake, p.shiny])),
    [[true, 'soft', false], [false, 'soft', false], [true, 'soft', true], [false, 'hard', false]]);
  assert.deepEqual(plain(rng.calls.filter(c => c[1] > 99)), [[0, 7999], [0, 7999]], 'chain 1: 1 in 8000');
  // The shiny patch keeps the chain: the same Bidoof at the same level, shiny.
  draws.length = 0;
  assert.deepEqual(plain(R.enter(field, 4, 4, fixed(), draw())), { sp: 399, lvl: 28, shiny: true, radar: true });
  assert.equal(R.count(), 2);
  assert.equal(draws.length, 0, 'not drawn again');
});

test('the shiny chance: none before the chain; 1 in (8200 - 200 x chain), 1 in 200 at best', () => {
  const rec = fixed();
  assert.equal(R.shinyChance(0, rec), false);
  assert.equal(rec.calls.length, 0);
  for (const n of [1, 20, 39, 40, 100, 999]) R.shinyChance(n, rec);
  assert.deepEqual(plain(rec.calls.map(c => c[1] + 1)), [8000, 4200, 400, 200, 200, 200]);
  assert.equal(R.shinyChance(5, fixed(0)), true);
  assert.equal(R.shinyChance(5, fixed(1)), false);
});

test('a step into a patch: none there, nothing; a patch shaking hard draws from the radar\'s table; a patch that does not keep the chain draws again', () => {
  shake(10, 10, fixed(0, 0, 0, 0, 99, 50, 99, 50, 99, 50, 99, 50));          // no patch keeps the chain, all shake hard
  assert.equal(R.enter(field, 10, 10, fixed(), draw()), null, 'no patch underfoot');
  assert.equal(R.enter(path, 6, 6, fixed(), draw()), null, 'another map');
  draws.length = 0;
  R.enter(field, 6, 6, fixed(0, 0, 0, 0), draw(371));
  assert.equal(draws[0], G.Maps.encounters(field, 'radar'), 'hard: the radar\'s table');
  assert.deepEqual([R.count(), R.species(), R.state.shake], [1, 371, 'hard']);
  // After a win, a patch shaking softly that does not keep the chain: drawn from the walking table; the same species goes on at
  // the chain's level, another ends the chain (and nothing shakes after that battle).
  R.after('win', fixed(99, 0, 99, 0, 99, 0, 99, 0), true);
  assert.ok(R.state.patches.every(p => !p.cont && p.shake === 'soft'));
  draws.length = 0;
  const w = R.enter(field, 2, 2, fixed(17, 13, 9, 5), t => { draws.push(t); return { sp: 371, lvl: 30 }; });
  assert.equal(draws[0], G.Maps.encounters(field, 'walk'));
  assert.deepEqual([w.sp, w.lvl, R.count()], [371, 28, 2], 'the same species: the chain\'s level, one longer');
  assert.deepEqual(plain(R.state.patches.map(p => [p.x, p.y])), [[6, 6], [5, 5], [4, 4], [3, 3]], 'from (2, 2): the rings\' bottom right corners');
  R.after('win', fixed(99, 0, 99, 0, 99, 0, 99, 0), true);
  const q = R.state.patches[0];
  const w2 = R.enter(field, q.x, q.y, fixed(), draw(399));
  assert.equal(w2.sp, 399);
  assert.ok(!R.active() && R.count() === 0, 'another species ends the chain');
  R.after('win', fixed(), true);
  assert.ok(!R.active());
});

test('after a battle: a radar battle won or caught keeps the chain; running, losing, the foe fleeing or another battle end it; patches out of sight', () => {
  for (const out of ['run', 'fled', 'lose']) {
    shake(10, 10, fixed(0, 0, 0, 0));
    R.enter(field, 6, 6, fixed(0, 0, 0, 0), draw());
    R.after(out, fixed(), true);
    assert.ok(!R.active(), out);
  }
  shake(10, 10, fixed(0, 0, 0, 0));
  R.after('win', fixed(), false);
  assert.ok(!R.active(), 'a battle that was not the radar\'s');
  shake(10, 10, fixed(0, 0, 0, 0));
  R.after('win', fixed(), true);
  assert.ok(!R.active(), 'no radar battle yet: the patches were never stepped into');
  shake(10, 10, fixed(0, 0, 0, 0));
  R.enter(field, 6, 6, fixed(0, 0, 0, 0), draw());
  R.after('win', fixed(), true);
  assert.ok(R.active() && R.count() === 1, 'won: the chain goes on');
  assert.ok(R.patches().length === 4 && R.patches().every(p => p.t > 0), 'and the patches shake');
  R.tick(5);
  assert.deepEqual(plain(R.patches()), [], 'then they are still (but there)');
  assert.ok(R.active());
  // Out of sight (8 tiles across, 6 up or down): the patches (2,2)...(5,5) seen from (11, 5), then from (14, 12).
  R.view(11, 5);
  assert.equal(R.state.patches.length, 3);
  R.view(14, 12);
  assert.ok(!R.active(), 'none left: the chain ends');
});
