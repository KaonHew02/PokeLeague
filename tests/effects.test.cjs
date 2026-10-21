// Move effects: stats, statuses, immunities, priority, flinching, multi-hit,
// drain and recoil, Struggle, and that every move of the game is accounted for.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel, plain } = require('./helpers.cjs');
const G = battleBoot();

const act = (b, slot = 0) => b.act({ type: 'move', slot });
const types = ev => ev.map(e => e.type);

test('Growl lowers Attack one stage at a time, down to −6', () => {
  const { b } = duel(G, { me: ['bulbasaur', 50, ['growl']], foe: ['rattata', 50, ['splash']] });
  for (let i = 1; i <= 6; i++) {
    const ev = act(b);
    const st = ev.find(e => e.type === 'stage');
    assert.ok(st && !st.capped && st.delta === -1 && st.stat === 'atk', `use ${i}`);
    assert.equal(b.foe.bm.stages.atk, -i);
  }
  const ev = act(b);
  assert.ok(ev.find(e => e.type === 'stage').capped);
});

test('Thunder Wave: Ground types are immune, Electric types cannot be paralysed, others can', () => {
  for (let s = 1; s <= 15; s++) {
    for (const foe of ['geodude', 'pikachu']) {
      const { b } = duel(G, { me: ['pikachu', 30, ['thunder-wave']], foe: [foe, 30, ['splash']], seed: s });
      const ev = act(b);
      assert.ok(!ev.some(e => e.type === 'status'), `${foe} got paralysed`);
    }
  }
  let par = 0;
  for (let s = 1; s <= 15; s++) {
    const { b } = duel(G, { me: ['pikachu', 30, ['thunder-wave']], foe: ['pidgey', 30, ['splash']], seed: s });
    if (act(b).some(e => e.type === 'status' && e.s === 'par')) par++;
  }
  assert.ok(par >= 10, `paralysed ${par}/15`);
});

test('powder moves fail on Grass types; Poison types cannot be poisoned', () => {
  for (let s = 1; s <= 10; s++) {
    const a = duel(G, { me: ['oddish', 30, ['sleep-powder']], foe: ['bellsprout', 30, ['splash']], seed: s });
    assert.ok(!act(a.b).some(e => e.type === 'status'));
    const p = duel(G, { me: ['weedle', 30, ['poison-sting']], foe: ['ekans', 30, ['splash']], seed: s });
    assert.ok(!act(p.b).some(e => e.type === 'status'));
  }
});

test('Leech Seed drains 1/8 at the end of each turn and fails on Grass types', () => {
  let ok = false;
  for (let s = 1; s <= 10 && !ok; s++) {
    const { b } = duel(G, { me: ['bulbasaur', 30, ['leech-seed']], foe: ['rattata', 30, ['splash']], seed: s });
    const ev = act(b);
    if (!ev.some(e => e.type === 'seeded')) continue;
    ok = true;
    const tick = ev.find(e => e.type === 'damage' && e.why === 'seed');
    assert.equal(tick.amt, Math.floor(tick.max / 8));
  }
  assert.ok(ok);
  let immune = 0;
  for (let s = 1; s <= 10; s++) {
    const g = duel(G, { me: ['bulbasaur', 30, ['leech-seed']], foe: ['oddish', 30, ['splash']], seed: s });
    const ev = types(act(g.b));
    assert.ok(!ev.includes('seeded'));
    if (ev.includes('noEffect')) immune++;
  }
  assert.ok(immune >= 7, `noEffect ${immune}/10`);
});

test('priority beats speed: Quick Attack goes first even from a slow Pokémon', () => {
  const order = (moves) => {
    const { b } = duel(G, { me: ['geodude', 50, moves], foe: ['pikachu', 50, ['splash']] });
    return plain(act(b).filter(e => e.type === 'move').map(e => e.side));
  };
  assert.deepEqual(order(['quick-attack']), [0, 1]);
  assert.deepEqual(order(['tackle']), [1, 0]);
});

test('flinching only works when the user moves first', () => {
  let fastFlinch = 0, slowFlinch = 0;
  for (let s = 1; s <= 60; s++) {
    const f = duel(G, { me: ['pikachu', 50, ['headbutt']], foe: ['geodude', 50, ['splash']], seed: s });
    if (act(f.b).some(e => e.type === 'cantMove' && e.why === 'flinch')) fastFlinch++;
    const w = duel(G, { me: ['geodude', 50, ['headbutt']], foe: ['pikachu', 50, ['splash']], seed: s });
    if (act(w.b).some(e => e.type === 'cantMove' && e.why === 'flinch')) slowFlinch++;
  }
  assert.ok(fastFlinch > 5, `fast ${fastFlinch}`);
  assert.equal(slowFlinch, 0);
});

test('multi-hit moves hit 2–5 times, about 35/35/15/15 %', () => {
  const n = { 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (let s = 1; s <= 800; s++) {
    const { b } = duel(G, { me: ['spearow', 60, ['fury-attack']], foe: ['onix', 60, ['splash']], seed: s });
    const h = act(b).find(e => e.type === 'hits');
    if (h) { n[h.n]++; total++; }
  }
  assert.ok(Math.abs(n[2] / total - 0.35) < 0.06 && Math.abs(n[3] / total - 0.35) < 0.06, JSON.stringify(n));
  assert.ok(Math.abs(n[4] / total - 0.15) < 0.05 && Math.abs(n[5] / total - 0.15) < 0.05, JSON.stringify(n));
});

test('drain heals the user by half the damage; recoil hurts by a quarter', () => {
  for (let s = 1; s <= 10; s++) {
    const { b } = duel(G, { me: ['oddish', 30, ['absorb'], { hp: 10 }], foe: ['squirtle', 30, ['splash']], seed: s });
    const ev = act(b);
    const d = ev.find(e => e.type === 'damage' && e.side === 1), h = ev.find(e => e.type === 'heal' && e.why === 'drain');
    if (d) assert.equal(h.amt, Math.max(1, Math.floor(d.amt / 2)));
    const r = duel(G, { me: ['rattata', 30, ['take-down']], foe: ['onix', 30, ['splash']], seed: s });
    const rv = act(r.b);
    const rd = rv.find(e => e.type === 'damage' && e.side === 1), rr = rv.find(e => e.type === 'damage' && e.why === 'recoil');
    if (rd) assert.equal(rr.amt, Math.max(1, Math.floor(rd.amt / 4)));
  }
});

test('with no PP left, the Pokémon uses Struggle and takes recoil', () => {
  const { b } = duel(G, { me: ['charmander', 20, ['scratch']], foe: ['onix', 20, ['splash']] });
  b.player.bm.mon.moves[0].pp = 0;
  assert.ok(b.options().struggle);
  const ev = act(b);
  assert.ok(ev.some(e => e.type === 'move' && e.move === 'struggle'));
  assert.ok(ev.some(e => e.type === 'damage' && e.why === 'recoil' && e.side === 0));
});

test('sleep stops a Pokémon for 1–3 turns, then it wakes up', () => {
  const { b } = duel(G, { me: ['geodude', 30, ['tackle']], foe: ['jigglypuff', 30, ['splash']] });
  b.player.bm.mon.status = 'slp'; b.player.bm.mon.slp = 2;
  assert.ok(act(b).some(e => e.type === 'cantMove' && e.why === 'slp'));
  assert.ok(act(b).some(e => e.type === 'cantMove' && e.why === 'slp'));
  const ev = act(b);
  assert.ok(ev.some(e => e.type === 'wake') && ev.some(e => e.type === 'move' && e.side === 0));
});

test('two-turn moves charge first; Hyper Beam must recharge', () => {
  const { b } = duel(G, { me: ['bulbasaur', 50, ['solar-beam']], foe: ['chansey', 50, ['splash']] });
  // The second turn needs no choice: the same act() plays both turns.
  const t1 = act(b);
  const charge = t1.findIndex(e => e.type === 'charge'), fire = t1.findIndex(e => e.type === 'move' && e.move === 'solar-beam');
  assert.ok(charge >= 0 && fire > charge, types(t1).join(','));
  assert.equal(t1.filter(e => e.type === 'move' && e.side === 1).length, 2);   // the foe acted on both turns
  assert.equal(b.prompt.kind, 'action');
  const h = duel(G, { me: ['rattata', 50, ['hyper-beam', 'tackle']], foe: ['onix', 70, ['splash']] });
  const ev = act(h.b);
  if (ev.some(e => e.type === 'damage' && e.side === 1)) {
    assert.ok(ev.some(e => e.type === 'cantMove' && e.why === 'recharge'), 'recharged on its own the next turn');
  }
});

test('every move is generic, special-cased or a deliberate fallback', () => {
  const GENERIC_STATUS = new Set(['ailment', 'net-good-stats', 'heal', 'swagger', 'force-switch']);
  const SUPPORTED_AIL = new Set(['paralysis', 'sleep', 'poison', 'burn', 'freeze', 'confusion', 'leech-seed', 'infatuation',
                                 'yawn', 'nightmare', 'perish-song', 'ingrain', 'no-type-immunity', 'disable', 'trap']);
  const missing = [];
  for (const [id, M] of Object.entries(G.MOVES)) {
    const S = G.SpecialMoves[id];
    if (S || G.SpecialMoves.FALLBACK.has(id)) continue;
    if (M.cat !== 'status' && (M.pow || M.meta.k === 'ohko')) continue;   // plain damage (with generic secondaries), one-hit KOs
    if (M.cat === 'status' && GENERIC_STATUS.has(M.meta.k) && (M.meta.k !== 'ailment' || SUPPORTED_AIL.has(M.meta.ail))) continue;
    missing.push(`${id} (${M.cat}, ${M.meta.k}${M.meta.ail ? ', ' + M.meta.ail : ''})`);
  }
  assert.deepEqual(missing, []);
});

test('every move can be used without throwing', () => {
  const ids = Object.keys(G.MOVES);
  ids.forEach((id, i) => {
    const { b } = duel(G, { me: ['mew', 50, [id]], foe: ['snorlax', 50, ['tackle']], seed: i + 1 });
    for (let t = 0; t < 3 && b.prompt && b.prompt.kind === 'action'; t++) b.act({ type: 'move', slot: 0 });
  });
});
