// Generation 4 (chapter 44): the abilities of Pokémon 387-493 (js/battle/abilities.js), the new moves
// (moves-special.js, battle.js) and the new evolution rules (evolution.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel, plain } = require('./helpers.cjs');
const G = battleBoot();

const ab = (ability, more) => Object.assign({ ability }, more);
const said = (ev, why) => ev.some(e => e.type === 'ability' && e.why === why);
/** What G.Damage.calc was asked during fn(). */
function calcs(fn) {
  const real = G.Damage.calc, seen = [];
  G.Damage.calc = o => { seen.push(o); return real(o); };
  try { fn(); } finally { G.Damage.calc = real; }
  return seen;
}
/** The player's first hit: { d, c } (the foe only splashes). */
function hit(me, foe, o = {}) {
  const d = duel(G, Object.assign({ me, foe: foe || ['snorlax', 50, ['splash']], seed: 3 }, o));
  const c = calcs(() => d.b.act({ type: 'move', slot: 0 }))[0];
  return { d, c };
}

test('every Generation 4 ability of the data is known, Pokémon 387 and up have them, the older ones keep Generation 3', () => {
  for (let d = 387; d <= 493; d++) for (const a of G.SPECIES[d].ab) assert.ok(G.Abilities.KNOWN.has(a), d + ' ' + a);
  assert.deepEqual(plain(G.SPECIES[399].ab), ['simple', 'unaware'], 'Bidoof');
  assert.deepEqual(plain(G.SPECIES[35].ab), ['cute-charm'], 'Clefairy as in Generation 3');
  assert.equal(G.SPECIES[94].ab[0], 'levitate');
});

test('power: Technician, Iron Fist, Reckless, Adaptability, Rivalry; Heatproof and Dry Skin against fire', () => {
  const pow = id => G.MOVES[id].pow;
  assert.equal(hit(['meowth', 50, ['tackle'], ab('technician')]).c.pow, Math.floor(pow('tackle') * 1.5));
  assert.equal(hit(['meowth', 50, ['body-slam'], ab('technician')]).c.pow, pow('body-slam'), 'not above 60');
  assert.equal(hit(['hitmonchan', 50, ['mach-punch'], ab('iron-fist')]).c.pow, Math.floor(pow('mach-punch') * 1.2));
  assert.equal(hit(['tauros', 50, ['double-edge'], ab('reckless')]).c.pow, Math.floor(pow('double-edge') * 1.2));
  assert.equal(hit(['tauros', 50, ['body-slam'], ab('adaptability')]).c.stab, 2);
  assert.equal(hit(['tauros', 50, ['body-slam']]).c.stab, 1.5);
  assert.equal(hit(['tauros', 50, ['body-slam'], ab('rivalry', { gender: 'm' })], ['snorlax', 50, ['splash'], { gender: 'm' }]).c.pow, Math.floor(pow('body-slam') * 1.25));
  assert.equal(hit(['tauros', 50, ['body-slam'], ab('rivalry', { gender: 'm' })], ['snorlax', 50, ['splash'], { gender: 'f' }]).c.pow, Math.floor(pow('body-slam') * 0.75));
  assert.equal(hit(['charmander', 50, ['ember']], ['snorlax', 50, ['splash'], ab('heatproof')]).c.pow, Math.floor(pow('ember') * 0.5));
  assert.equal(hit(['charmander', 50, ['ember']], ['snorlax', 50, ['splash'], ab('dry-skin')]).c.pow, Math.floor(pow('ember') * 1.25));
});

test('critical hits and the last factor: Super Luck, Sniper, Tinted Lens, Filter and Solid Rock', () => {
  const mk = a => ({ ability: a });
  assert.deepEqual([G.Abilities.critBonus(mk('super-luck')), G.Abilities.critBonus(mk(null))], [1, 0]);
  assert.deepEqual([G.Abilities.critMult(mk('sniper')), G.Abilities.critMult(mk(null))], [2.25, 1.5]);
  assert.equal(hit(['butterfree', 50, ['ember'], ab('tinted-lens')], ['squirtle', 50, ['splash']]).c.final, 2);
  assert.equal(hit(['squirtle', 50, ['water-gun']], ['charmander', 50, ['splash'], ab('filter')]).c.final, 0.75);
  assert.equal(hit(['squirtle', 50, ['water-gun']], ['charmander', 50, ['splash'], ab('solid-rock')]).c.final, 0.75);
  assert.equal(hit(['squirtle', 50, ['water-gun']], ['charmander', 50, ['splash']]).c.final, 1);
});

test('stats: Slow Start for five turns, Quick Feet, Unburden after its berry, Solar Power and Flower Gift in the sun', () => {
  let { b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('slow-start')], foe: ['snorlax', 50, ['splash']] });
  const me = b.player.bm, base = G.Mon.stats(me.mon)[1];
  assert.equal(b.stat(me, 'atk'), Math.floor(base * 0.5));
  for (let i = 0; i < 5; i++) b.act({ type: 'move', slot: 0 });
  assert.equal(b.stat(me, 'atk'), base, 'after five turns');
  ({ b } = duel(G, { me: ['raticate', 50, ['splash'], ab('quick-feet', { status: 'par' })], foe: ['snorlax', 50, ['splash']] }));
  assert.equal(b.stat(b.player.bm, 'spe'), Math.floor(G.Mon.stats(b.player.bm.mon)[5] * 1.5), 'Quick Feet: no paralysis slowdown, ×1.5');
  ({ b } = duel(G, { me: ['raticate', 50, ['splash'], ab('unburden', { item: 'sitrus-berry', hp: 20 })], foe: ['snorlax', 50, ['splash']] }));
  const spe = b.stat(b.player.bm, 'spe');
  b.act({ type: 'move', slot: 0 });
  assert.ok(!b.player.bm.mon.item && b.stat(b.player.bm, 'spe') === spe * 2, 'the berry eaten: Speed ×2');
  ({ b } = duel(G, { me: ['charizard', 50, ['splash'], ab('solar-power')], foe: ['snorlax', 50, ['splash']] }));
  const spa = b.stat(b.player.bm, 'spa');
  b.weather = { w: 'sun', turns: Infinity };
  assert.equal(b.stat(b.player.bm, 'spa'), Math.floor(G.Mon.stats(b.player.bm.mon)[3] * 1.5));
  const hp = b.player.bm.mon.hp;
  b.act({ type: 'move', slot: 0 });
  assert.ok(spa < b.stat(b.player.bm, 'spa') && b.player.bm.mon.hp < hp, 'it loses HP in the sun');
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('flower-gift')], foe: ['snorlax', 50, ['splash']] }));
  b.weather = { w: 'sun', turns: Infinity };
  assert.equal(b.stat(b.player.bm, 'atk'), Math.floor(G.Mon.stats(b.player.bm.mon)[1] * 1.5));
});

test("accuracy and stages: No Guard always hits, Unaware ignores the foe's stages, Simple doubles its own", () => {
  for (let s = 1; s <= 12; s++) {
    const { b } = duel(G, { me: ['machamp', 50, ['dynamic-punch'], ab('no-guard')], foe: ['snorlax', 50, ['splash']], seed: s });
    assert.ok(!b.act({ type: 'move', slot: 0 }).some(e => e.type === 'miss'), 'seed ' + s);
  }
  let { d, c } = (() => { const d = duel(G, { me: ['tauros', 50, ['body-slam'], ab('unaware')], foe: ['snorlax', 50, ['splash']], seed: 3 }); d.b.foe.bm.stages.def = 6;
    return { d, c: calcs(() => d.b.act({ type: 'move', slot: 0 }))[0] }; })();
  assert.equal(c.def, d.b.stat(d.b.foe.bm, 'def', { noStages: true }), 'the +6 Defense does not count');
  ({ d } = { d: duel(G, { me: ['snorlax', 50, ['swords-dance'], ab('simple')], foe: ['snorlax', 50, ['splash']] }) });
  d.b.act({ type: 'move', slot: 0 });
  assert.equal(d.b.player.bm.stages.atk, 4);
});

test('immunities: Motor Drive, Dry Skin, Scrappy, Normalize; Mold Breaker gets past Levitate and Sturdy', () => {
  let { b } = duel(G, { me: ['pikachu', 50, ['thunder-shock']], foe: ['snorlax', 50, ['splash'], ab('motor-drive')] });
  let ev = b.act({ type: 'move', slot: 0 });
  assert.ok(!ev.some(e => e.type === 'damage' && e.side === 1) && b.foe.bm.stages.spe === 1);
  ({ b } = duel(G, { me: ['squirtle', 50, ['water-gun']], foe: ['snorlax', 50, ['splash'], ab('dry-skin', { hp: 20 })] }));
  b.act({ type: 'move', slot: 0 });
  assert.ok(b.foe.bm.mon.hp > 20, 'Dry Skin drinks the water');
  ({ b } = duel(G, { me: ['tauros', 50, ['tackle'], ab('scrappy')], foe: ['gengar', 50, ['splash']] }));
  assert.ok(b.act({ type: 'move', slot: 0 }).some(e => e.type === 'damage' && e.side === 1), 'Scrappy hits a Ghost');
  ({ b } = duel(G, { me: ['charmander', 50, ['ember'], ab('normalize')], foe: ['gengar', 50, ['splash']] }));
  assert.ok(b.act({ type: 'move', slot: 0 }).some(e => e.type === 'noEffect'), 'Normalize: Ember is Normal');
  ({ b } = duel(G, { me: ['dugtrio', 50, ['earthquake']], foe: ['gengar', 50, ['splash']] }));
  assert.ok(b.act({ type: 'move', slot: 0 }).some(e => e.type === 'noEffect'));
  ({ b } = duel(G, { me: ['dugtrio', 50, ['earthquake'], ab('mold-breaker')], foe: ['gengar', 50, ['splash']] }));
  ev = b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'damage' && e.side === 1), 'Mold Breaker: Levitate does not help');
  ({ b } = duel(G, { me: ['dugtrio', 70, ['fissure'], ab('mold-breaker')], foe: ['golem', 50, ['splash'], ab('sturdy')] }));
  assert.ok(b.act({ type: 'move', slot: 0 }).some(e => e.type === 'ohko' || e.type === 'miss'));
});

test('the end of the turn: Poison Heal, Magic Guard, Heatproof burns, Hydration, Ice Body, Bad Dreams; Leaf Guard; Snow Warning', () => {
  let { b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('poison-heal', { status: 'psn', hp: 50 })], foe: ['snorlax', 50, ['splash']] });
  b.act({ type: 'move', slot: 0 });
  assert.ok(b.player.bm.mon.hp > 50);
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('magic-guard', { status: 'psn' })], foe: ['snorlax', 50, ['splash']] }));
  const full = b.player.bm.mon.hp;
  b.act({ type: 'move', slot: 0 });
  assert.equal(b.player.bm.mon.hp, full, 'no poison damage');
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('heatproof', { status: 'brn' })], foe: ['snorlax', 50, ['splash']] }));
  const max = b.maxHp(b.player.bm);
  b.act({ type: 'move', slot: 0 });
  assert.equal(max - b.player.bm.mon.hp, Math.floor(max / 32));
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('hydration', { status: 'par' })], foe: ['snorlax', 50, ['splash']] }));
  b.weather = { w: 'rain', turns: Infinity };
  for (let i = 0; i < 3 && b.player.bm.mon.status; i++) b.act({ type: 'move', slot: 0 });
  assert.equal(b.player.bm.mon.status, null);
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('ice-body', { hp: 40 })], foe: ['snorlax', 50, ['splash']] }));
  b.weather = { w: 'hail', turns: Infinity };
  b.act({ type: 'move', slot: 0 });
  assert.ok(b.player.bm.mon.hp > 40, 'healed in hail, not hurt');
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('bad-dreams')], foe: ['snorlax', 50, ['splash'], { status: 'slp', slp: 5 }] }));
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(said(ev, 'show') && b.foe.bm.mon.hp < b.maxHp(b.foe.bm));
  ({ b } = duel(G, { me: ['pikachu', 50, ['thunder-wave']], foe: ['snorlax', 50, ['splash'], ab('leaf-guard')] }));
  b.weather = { w: 'sun', turns: Infinity };
  b.act({ type: 'move', slot: 0 });
  assert.equal(b.foe.bm.mon.status, null, 'Leaf Guard in the sun');
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash']], foe: ['snorlax', 50, ['splash'], ab('snow-warning')] }));
  assert.equal(b.weather && b.weather.w, 'hail');
});

test('Steadfast, Anger Point, Download; entry lines: Frisk, Forewarn, Anticipation, Mold Breaker, Slow Start', () => {
  let { b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('steadfast')], foe: ['jolteon', 50, ['fake-out']] });
  b.act({ type: 'move', slot: 0 });
  assert.equal(b.player.bm.stages.spe, 1);
  let angry = false;
  for (let s = 1; s <= 60 && !angry; s++) {
    const d = duel(G, { me: ['farfetchd', 50, ['slash'], { item: 'stick' }], foe: ['tauros', 50, ['splash'], ab('anger-point')], seed: s });
    const ev = d.b.act({ type: 'move', slot: 0 });
    if (ev.some(e => e.type === 'damage' && e.crit)) { angry = d.b.foe.bm.stages.atk === 6 && said(ev, 'anger-point'); assert.ok(angry, 'seed ' + s); }
  }
  assert.ok(angry, 'a critical hit was found');
  ({ b } = duel(G, { me: ['porygon2', 50, ['splash'], ab('download')], foe: ['snorlax', 50, ['splash']] }));
  const up = b.stat(b.foe.bm, 'def') < b.stat(b.foe.bm, 'spd') ? 'atk' : 'spa';
  assert.equal(b.player.bm.stages[up], 1);
  const ev = duel(G, { me: ['snorlax', 50, ['splash'], ab('frisk')], foe: ['charizard', 50, ['flamethrower', 'tackle'], { item: 'leftovers' }] }).events;
  assert.ok(ev.some(e => e.type === 'ability' && e.why === 'frisk' && e.item === 'leftovers'));
  const ev2 = duel(G, { me: ['snorlax', 50, ['splash'], ab('forewarn')], foe: ['charizard', 50, ['flamethrower', 'tackle']] }).events;
  assert.ok(ev2.some(e => e.type === 'ability' && e.why === 'forewarn' && e.move === 'flamethrower'));
  assert.ok(said(duel(G, { me: ['venusaur', 50, ['splash'], ab('anticipation')], foe: ['charizard', 50, ['flamethrower']] }).events, 'anticipation'));
  assert.ok(!said(duel(G, { me: ['venusaur', 50, ['splash'], ab('anticipation')], foe: ['charizard', 50, ['tackle']] }).events, 'anticipation'));
  assert.ok(said(duel(G, { me: ['snorlax', 50, ['splash'], ab('mold-breaker')], foe: ['snorlax', 50, ['splash']] }).events, 'mold-breaker'));
  assert.ok(said(duel(G, { me: ['snorlax', 50, ['splash'], ab('slow-start')], foe: ['snorlax', 50, ['splash']] }).events, 'slow-start'));
});

test('Skill Link, Stall, Aftermath, Klutz, Tangled Feet; Storm Drain draws Water moves in a double battle', () => {
  let { b } = duel(G, { me: ['cloyster', 50, ['spike-cannon'], ab('skill-link')], foe: ['snorlax', 70, ['splash']] });
  assert.ok(b.act({ type: 'move', slot: 0 }).some(e => e.type === 'hits' && e.n === 5));
  ({ b } = duel(G, { me: ['jolteon', 50, ['tackle'], ab('stall')], foe: ['snorlax', 50, ['tackle']] }));
  let moves = b.act({ type: 'move', slot: 0 }).filter(e => e.type === 'move').map(e => e.side);
  assert.deepEqual(plain(moves), [1, 0], 'Stall: the faster one moves last');
  ({ b } = duel(G, { me: ['snorlax', 90, ['body-slam']], foe: ['caterpie', 5, ['splash'], ab('aftermath')] }));
  const max = b.maxHp(b.player.bm);
  b.act({ type: 'move', slot: 0 });
  assert.equal(max - b.player.bm.mon.hp, Math.floor(max / 4), 'Aftermath');
  ({ b } = duel(G, { me: ['snorlax', 50, ['splash'], ab('klutz', { item: 'leftovers', hp: 50 })], foe: ['snorlax', 50, ['splash']] }));
  b.act({ type: 'move', slot: 0 });
  assert.equal(b.player.bm.mon.hp, 50, 'Klutz: the Leftovers do nothing');
  assert.equal(G.Abilities.accMult(b, b.player.bm, Object.assign(b.foe.bm, { ability: 'tangled-feet', vol: Object.assign(b.foe.bm.vol, { confusion: 2 }) }), G.MOVES.tackle), 0.5);
  const d = duel(G, { me: ['squirtle', 50, ['water-gun']], mine: [['pidgey', 50, ['splash']]], foe: ['snorlax', 50, ['splash']],
                      foes: [['snorlax', 50, ['splash'], ab('storm-drain')]], trainer: { id: 't', name: 'T', ai: 'basic', prize: 0 }, rules: { double: true } });
  d.b.act({ type: 'move', slot: 0, target: { side: 1, slot: 0 } });
  const ev = d.b.act({ type: 'move', slot: 0, target: { side: 1, slot: 0 } });
  assert.ok(ev.some(e => e.type === 'ability' && e.why === 'rod' && e.ability === 'storm-drain'));
});

test('moves: Stealth Rock on coming in, Trick Room, Gravity, Defog, Acupressure, Heart Swap, Metal Burst, Crush Grip, Grass Knot', () => {
  let d = duel(G, { me: ['golem', 50, ['stealth-rock', 'roar']], foe: ['snorlax', 50, ['splash']], foes: [['charizard', 50, ['splash']]],
                    trainer: { id: 't', name: 'T', ai: 'basic', prize: 0 } });
  let ev = d.b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'rocks' && e.side === 1) && d.b.foe.rocks);
  ev = d.b.act({ type: 'move', slot: 1 });
  const zard = ev.find(e => e.type === 'damage' && e.why === 'rocks');
  assert.ok(zard && zard.amt === Math.floor(zard.max / 2), 'Charizard takes a half (Rock ×4)');
  d = duel(G, { me: ['slowpoke', 50, ['trick-room', 'tackle']], foe: ['jolteon', 50, ['tackle']] });
  d.b.act({ type: 'move', slot: 0 });
  assert.equal(d.b.trickRoom, 4);
  const order = d.b.act({ type: 'move', slot: 1 }).filter(e => e.type === 'move').map(e => e.side);
  assert.deepEqual(plain(order), [0, 1], 'the slower one first');
  d = duel(G, { me: ['dugtrio', 50, ['gravity', 'earthquake']], foe: ['pidgeot', 50, ['fly']] });
  d.b.act({ type: 'move', slot: 0 });
  assert.ok(d.b.gravity > 0);
  ev = d.b.act({ type: 'move', slot: 1 });
  assert.ok(ev.some(e => e.type === 'damage' && e.side === 1), 'Earthquake hits a Flying type');
  d = duel(G, { me: ['pidgeot', 50, ['defog']], foe: ['snorlax', 50, ['splash']] });
  d.b.foe.field.reflect = 3; d.b.foe.rocks = true;
  d.b.act({ type: 'move', slot: 0 });
  assert.ok(!d.b.foe.field.reflect && !d.b.foe.rocks && d.b.foe.bm.stages.eva === -1);
  d = duel(G, { me: ['snorlax', 50, ['acupressure']], foe: ['snorlax', 50, ['splash']] });
  d.b.act({ type: 'move', slot: 0 });
  assert.equal(Object.values(d.b.player.bm.stages).filter(v => v === 2).length, 1);
  d = duel(G, { me: ['snorlax', 50, ['heart-swap']], foe: ['snorlax', 50, ['splash']] });
  d.b.foe.bm.stages.atk = 3;
  d.b.act({ type: 'move', slot: 0 });
  assert.deepEqual([d.b.player.bm.stages.atk, d.b.foe.bm.stages.atk], [3, 0]);
  d = duel(G, { me: ['snorlax', 50, ['metal-burst']], foe: ['jolteon', 50, ['tackle']] });
  ev = d.b.act({ type: 'move', slot: 0 });
  const took = ev.find(e => e.type === 'damage' && e.side === 0), gave = ev.find(e => e.type === 'damage' && e.side === 1);
  assert.ok(took && gave && gave.amt === Math.min(Math.floor(took.amt * 3 / 2), gave.hp + gave.amt));
  const S = G.SpecialMoves;
  const t = { mon: { sp: 143, hp: 10 } }, full = G.Mon.maxHp;
  assert.equal(S['grass-knot'].power(null, null, { mon: { sp: 143 } }), 120, 'Snorlax weighs 460 kg');
  assert.ok(S['crush-grip'].power(null, null, Object.assign(d.b.foe.bm)) >= 1 && t && full);
});

test('Brine doubles against a target at half its HP or less', () => {
  const pow = G.MOVES.brine.pow;
  assert.equal(hit(['floatzel', 50, ['brine']]).c.pow, pow, 'full HP');
  const low = (hp, want) => {
    const d = duel(G, { me: ['floatzel', 50, ['brine']], foe: ['snorlax', 50, ['splash']], seed: 3 });
    d.foes[0].hp = hp(G.Mon.maxHp(d.foes[0]));
    assert.equal(calcs(() => d.b.act({ type: 'move', slot: 0 }))[0].pow, want);
  };
  low(m => Math.floor(m / 2), pow * 2);
  low(m => Math.floor(m / 2) + 1, pow);
});

test('Avalanche doubles after a hit this turn, and Blizzard never misses in hail', () => {
  const pow = G.MOVES.avalanche.pow;
  assert.equal(hit(['abomasnow', 50, ['avalanche']]).c.pow, pow, 'nobody hit it');
  const d = duel(G, { me: ['abomasnow', 50, ['avalanche']], foe: ['snorlax', 50, ['tackle']], seed: 3 });
  const both = calcs(() => d.b.act({ type: 'move', slot: 0 }));
  assert.equal(both[both.length - 1].pow, pow * 2, 'it moved after the hit');
  const hits = w => {
    let n = 0;
    for (let s = 1; s <= 40; s++) {
      const { b } = duel(G, { me: ['dewgong', 50, ['blizzard']], foe: ['snorlax', 50, ['splash']], seed: s });
      if (w) b.weather = { w, turns: Infinity };
      n += calcs(() => b.act({ type: 'move', slot: 0 })).length;
    }
    return n;
  };
  assert.ok(hits(null) < 40, 'it can miss');
  assert.equal(hits('hail'), 40, 'not in hail');
});

test('Giga Impact, Rock Wrecker and Roar of Time leave the user resting, as Hyper Beam does (chapter 60)', () => {
  for (const [sp, id] of [['garchomp', 'giga-impact'], ['rhyperior', 'rock-wrecker'], ['dialga', 'roar-of-time']]) {
    // Some seed makes it hit; the turn after a hit plays on its own, resting.
    let rested = false;
    for (let seed = 1; seed <= 6 && !rested; seed++) {
      const { b } = duel(G, { me: [sp, 60, [id, 'tackle']], foe: ['blissey', 100, ['splash']], seed });
      const ev = b.act({ type: 'move', slot: 0 });
      if (!ev.some(e => e.type === 'damage' && e.side === 1)) continue;
      rested = ev.some(e => e.type === 'cantMove' && e.why === 'recharge');
    }
    assert.ok(rested, id);
  }
});

test('evolutions: a held item at night, a gender with a stone, a known move, a species in the party', () => {
  const mk = (sp, lvl, o) => Object.assign(G.Mon.create(sp, lvl, { rng: G.RNG(sp) }), o);
  const gligar = mk(207, 30, { item: 'razor-fang' });
  assert.deepEqual(plain(G.Evolution.candidates(gligar, { trigger: 'level', time: 'night' })), [472]);
  assert.deepEqual(plain(G.Evolution.candidates(gligar, { trigger: 'level', time: 'day' })), [], 'not by day');
  assert.deepEqual(plain(G.Evolution.candidates(mk(207, 30), { trigger: 'level', time: 'night' })), [], 'not without the item');
  G.Evolution.evolve(gligar, 472);
  assert.deepEqual([gligar.sp, gligar.item], [472, null], 'the Razor Fang is used up');
  assert.deepEqual(plain(G.Evolution.candidates(mk(281, 30, { gender: 'm' }), { trigger: 'item', item: 'dawn-stone' })), [475], 'Gallade');
  assert.deepEqual(plain(G.Evolution.candidates(mk(281, 30, { gender: 'f' }), { trigger: 'item', item: 'dawn-stone' })), []);
  assert.deepEqual(plain(G.Evolution.candidates(mk(361, 30, { gender: 'f' }), { trigger: 'item', item: 'dawn-stone' })), [478], 'Froslass');
  const aipom = mk(190, 20);
  assert.deepEqual(plain(G.Evolution.candidates(aipom, { trigger: 'level', party: [] })), []);
  aipom.moves[0] = { id: 'double-hit', pp: 10, ppUp: 0 };
  assert.deepEqual(plain(G.Evolution.candidates(aipom, { trigger: 'level', party: [] })), [424], 'Ambipom');
  const mantyke = mk(458, 20);
  assert.deepEqual(plain(G.Evolution.candidates(mantyke, { trigger: 'level', party: [mantyke] })), []);
  assert.deepEqual(plain(G.Evolution.candidates(mantyke, { trigger: 'level', party: [mantyke, mk(223, 20)] })), [226], 'Mantine with a Remoraid');
});

test("Light Clay: the holder's Reflect and Light Screen last 8 turns instead of 5 (chapter 74)", () => {
  /** How many turns the screen is up, counting the turn it went up. */
  const lasts = (move, item) => {
    const d = duel(G, { me: ['mr-mime', 50, [move, 'splash'], item ? { item } : {}], foe: ['snorlax', 50, ['splash']] });
    const k = move === 'reflect' ? 'reflect' : 'lightScreen';
    d.b.act({ type: 'move', slot: 0 });
    let turns = 1;
    while (d.b.player.field[k] && turns < 20) { d.b.act({ type: 'move', slot: 1 }); turns++; }
    return turns;
  };
  for (const move of ['reflect', 'light-screen']) {
    assert.equal(lasts(move), 5, move);
    assert.equal(lasts(move, 'light-clay'), 8, move + ' with Light Clay');
    assert.equal(lasts(move, 'leftovers'), 5, move + ' with another item');
  }
  assert.equal(G.ITEM_FX['light-clay'].held, 'light-clay');
});

test('the Liechi Berry (chapter 77): eaten at a quarter of its HP for +1 Attack; not above that, nor at +6', () => {
  const run = (frac, atk) => {
    const d = duel(G, { me: ['tauros', 50, ['splash'], { item: 'liechi-berry' }], foe: ['snorlax', 50, ['splash']] });
    const bm = d.b.player.bm;
    bm.mon.hp = Math.max(1, Math.floor(d.b.maxHp(bm) * frac));
    bm.stages.atk = atk;
    const ev = d.b.act({ type: 'move', slot: 0 });
    return { ev, bm, b: d.b };
  };
  let r = run(0.2, 0);
  assert.ok(r.ev.some(e => e.type === 'eat' && e.item === 'liechi-berry'), 'eaten');
  assert.equal(r.bm.stages.atk, 1);
  assert.equal(r.bm.mon.item, null);
  assert.match(G.BattleText.line(r.ev.find(e => e.type === 'eat'), r.b) || '', /Tauros ate its Liechi Berry!/);
  r = run(0.5, 0);
  assert.ok(!r.ev.some(e => e.type === 'eat') && r.bm.mon.item === 'liechi-berry' && r.bm.stages.atk === 0, 'not at half its HP');
  r = run(0.2, 6);
  assert.ok(!r.ev.some(e => e.type === 'eat') && r.bm.mon.item === 'liechi-berry', 'not at +6');
});

test("the Salac Berry and the Lum Berry (chapter 79, Greta's): +1 Speed at a quarter of its HP; any status cured at once", () => {
  let d = duel(G, { me: ['heracross', 50, ['splash'], { item: 'salac-berry' }], foe: ['snorlax', 50, ['splash']] });
  let bm = d.b.player.bm;
  bm.mon.hp = Math.floor(d.b.maxHp(bm) / 5);
  let ev = d.b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'eat' && e.item === 'salac-berry'));
  assert.deepEqual([bm.stages.spe, bm.mon.item], [1, null]);
  for (const st of ['psn', 'tox', 'brn', 'par', 'slp', 'frz']) {
    d = duel(G, { me: ['breloom', 50, ['splash'], { item: 'lum-berry' }], foe: ['snorlax', 50, ['splash']] });
    bm = d.b.player.bm;
    d.b.inflict(bm, st, {});
    d.b.afterAction();
    d.b.process();
    assert.deepEqual([bm.mon.status, bm.mon.item], [null, null], st);
  }
  assert.equal(G.ITEM_FX['lum-berry'].field, 1, 'it also works from the Bag, like a Full Heal');
});

test("the White Herb (chapter 80, Spenser's): a stat lowered by its own move is put back at once, and the herb is gone; without a fall it stays", () => {
  let d = duel(G, { me: ['arcanine', 50, ['superpower'], { item: 'white-herb' }], foe: ['snorlax', 50, ['splash']] });
  const ev = d.b.act({ type: 'move', slot: 0 });
  const bm = d.b.player.bm;
  const herb = ev.find(e => e.type === 'herb');
  assert.ok(herb, 'used');
  assert.ok(ev.some(e => e.type === 'stage' && e.side === 0 && e.delta < 0), 'Superpower lowered its stats first');
  assert.deepEqual([bm.stages.atk, bm.stages.def, bm.mon.item], [0, 0, null]);
  assert.equal(G.BattleText.line(herb, d.b), 'Arcanine returned its stats to normal using its White Herb!');
  d = duel(G, { me: ['arcanine', 50, ['flamethrower'], { item: 'white-herb' }], foe: ['snorlax', 50, ['splash']] });
  d.b.act({ type: 'move', slot: 0 });
  assert.equal(d.b.player.bm.mon.item, 'white-herb', 'nothing lowered: kept');
});

test('every new battle line has text, in English and in Chinese', () => {
  for (const lang of ['en', 'zh-Hans']) {
    const H = battleBoot({ lang });
    const d = duel(H, { me: ['pikachu', 30, ['splash']], foe: ['gyarados', 30, ['splash']] });
    const base = { type: 'ability', side: 1, uid: d.foes[0].uid, ability: 'frisk', target: d.party[0].uid, tside: 0, item: 'leftovers', move: 'surf' };
    for (const why of ['mold-breaker', 'slow-start', 'frisk', 'forewarn', 'anticipation', 'anger-point']) {
      const line = H.BattleText.line(Object.assign({}, base, { why }), d.b);
      assert.ok(line && !/[{}]/.test(line), lang + ' ' + why + ': ' + line);
    }
    const ev = { side: 0, uid: d.party[0].uid, target: d.foes[0].uid, tside: 1 };
    for (const type of ['heartSwap', 'rocks', 'rocksGone', 'trickRoom', 'trickRoomEnd', 'gravity', 'gravityEnd']) {
      const line = H.BattleText.line(Object.assign({ type }, ev), d.b);
      assert.ok(line && !/[{}]/.test(line), lang + ' ' + type + ': ' + line);
    }
    assert.ok(H.BattleText.line({ type: 'damage', why: 'rocks', side: 0, uid: d.party[0].uid, amt: 5, hp: 10, max: 20 }, d.b));
  }
});
