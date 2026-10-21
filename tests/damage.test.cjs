// The damage formula and how the battle feeds it.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel } = require('./helpers.cjs');
const G = battleBoot();

test('the formula, step by step', () => {
  const base = { lvl: 50, pow: 80, atk: 100, def: 100, roll: 100 };
  assert.equal(G.Damage.base(50, 80, 100, 100), 37);
  assert.equal(G.Damage.calc(base), 37);
  assert.equal(G.Damage.calc({ ...base, stab: true }), 55);
  assert.equal(G.Damage.calc({ ...base, stab: true, eff: 2 }), 110);
  assert.equal(G.Damage.calc({ ...base, crit: true }), 55);
  assert.equal(G.Damage.calc({ ...base, crit: true, stab: true, eff: 2 }), 164);
  assert.equal(G.Damage.calc({ ...base, roll: 85 }), 31);
  assert.equal(G.Damage.calc({ ...base, burn: true }), 18);
  assert.equal(G.Damage.calc({ ...base, eff: 0.25 }), 9);
  assert.equal(G.Damage.calc({ ...base, eff: 0 }), 0);
  assert.equal(G.Damage.calc({ lvl: 2, pow: 10, atk: 5, def: 500, roll: 85, eff: 0.25 }), 1);   // never below 1
});

test('STAB and type effectiveness reach the battle', () => {
  const hitOf = (me, foe, seed) => {
    const { b } = duel(G, { me, foe, seed });
    const ev = b.act({ type: 'move', slot: 0 });
    return ev.find(e => e.type === 'damage' && e.side === 1);
  };
  // Water Gun on Geodude (rock / ground): ×4 and a "super effective" line
  const { b } = duel(G, { me: ['squirtle', 20, ['water-gun']], foe: ['geodude', 20, ['splash']], seed: 4 });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'effective' && e.eff === 4));
  // Ember on Squirtle: not very effective; the same seed with Bulbasaur hits much harder
  let sq = 0, bu = 0;
  for (let s = 1; s <= 30; s++) {
    const h1 = hitOf(['charmander', 30, ['ember']], ['squirtle', 30, ['splash']], s);
    const h2 = hitOf(['charmander', 30, ['ember']], ['bulbasaur', 30, ['splash']], s);
    if (h1) sq += h1.amt; if (h2) bu += h2.amt;
  }
  assert.ok(bu > sq * 3, `${bu} vs ${sq}`);
});

test('immunities: Normal on Ghost, Electric on Ground do nothing', () => {
  for (let s = 1; s <= 20; s++) {
    const { b } = duel(G, { me: ['rattata', 20, ['tackle']], foe: ['gastly', 20, ['splash']], seed: s });
    const ev = b.act({ type: 'move', slot: 0 });
    assert.ok(!ev.some(e => e.type === 'damage' && e.side === 1), 'tackle hit a ghost');
    assert.ok(ev.some(e => e.type === 'noEffect' || e.type === 'miss'));
  }
  const { b } = duel(G, { me: ['pikachu', 20, ['thunder-shock']], foe: ['diglett', 20, ['splash']] });
  assert.ok(b.act({ type: 'move', slot: 0 }).some(e => e.type === 'noEffect'));
});

test('a burned attacker deals half physical damage, but full special damage', () => {
  let phys = [0, 0], spec = [0, 0];
  for (let s = 1; s <= 40; s++) {
    for (const burned of [0, 1]) {
      const st = burned ? { status: 'brn' } : {};
      const p = duel(G, { me: ['charmander', 40, ['scratch'], st], foe: ['rattata', 40, ['splash']], seed: s });
      const q = duel(G, { me: ['charmander', 40, ['ember'], st], foe: ['rattata', 40, ['splash']], seed: s });
      const dp = p.b.act({ type: 'move', slot: 0 }).find(e => e.type === 'damage' && e.side === 1);
      const dq = q.b.act({ type: 'move', slot: 0 }).find(e => e.type === 'damage' && e.side === 1);
      if (dp) phys[burned] += dp.amt;
      if (dq) spec[burned] += dq.amt;
    }
  }
  assert.ok(phys[1] < phys[0] * 0.6 && phys[1] > phys[0] * 0.4, `physical ${phys}`);
  assert.equal(spec[1], spec[0]);
});

test('critical hits happen about 1 time in 24 and do more damage', () => {
  let crits = 0, n = 0;
  for (let s = 1; s <= 1200; s++) {
    const { b } = duel(G, { me: ['rattata', 30, ['tackle']], foe: ['onix', 30, ['splash']], seed: s });
    const d = b.act({ type: 'move', slot: 0 }).find(e => e.type === 'damage' && e.side === 1);
    if (!d) continue;
    n++; if (d.crit) crits++;
  }
  const rate = crits / n;
  assert.ok(rate > 1 / 40 && rate < 1 / 15, `crit rate ${rate}`);
});
