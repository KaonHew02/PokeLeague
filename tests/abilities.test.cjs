// Abilities (chapter 28): the Generation 3 abilities in battle (js/battle/abilities.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel } = require('./helpers.cjs');
const G = battleBoot();

const ab = ability => ({ ability });
const hits = (ev, side) => ev.filter(e => e.type === 'damage' && e.side === side && e.why === 'hit').map(e => e.amt);
const said = (ev, why, side) => ev.some(e => e.type === 'ability' && e.why === why && (side == null || e.side === side));
/** Fraction of `n` seeded one-turn duels for which `fn(duel, events)` is true. */
const often = (n, o, fn) => {
  let k = 0;
  for (let s = 1; s <= n; s++) { const d = duel(G, Object.assign({ seed: s, monSeed: s }, o)); if (fn(d, d.b.act({ type: 'move', slot: 0 }))) k++; }
  return k / n;
};

test('every species has one or two abilities (Generation 3; Generation 4 from 387), each one named and known to the engine', () => {
  for (const [d, S] of Object.entries(G.SPECIES)) {
    assert.ok(Array.isArray(S.ab) && S.ab.length >= 1 && S.ab.length <= 2, d);
    for (const a of S.ab) {
      assert.ok(G.Abilities.KNOWN.has(a), d + ' ' + a);
      assert.ok(G.NAMES.ability[a], 'a name for ' + a);
    }
  }
  assert.equal(G.Abilities.KNOWN.size, 123);
  assert.equal(G.SPECIES[94].ab[0], 'levitate', 'Gengar floats in Generation 3');
});

test('a Pokémon\'s ability follows its uid (no extra random draw); mon.ability forces one', () => {
  const rng = G.RNG(5);
  const seen = new Set();
  for (let i = 0; i < 40; i++) {
    const m = G.Mon.create(54, 20, { rng });             // Psyduck: Damp or Cloud Nine
    assert.equal(G.Abilities.of(m), G.Abilities.of(JSON.parse(JSON.stringify(m))), 'the same after a save');
    seen.add(G.Abilities.of(m));
  }
  assert.deepEqual([...seen].sort(), ['cloud-nine', 'damp'], 'both slots occur');
  assert.equal(G.Abilities.of(Object.assign(G.Mon.create(54, 20, { rng }), ab('swift-swim'))), 'swift-swim');
  // Creating a Pokémon draws the same numbers as before abilities: the next draw is unchanged.
  const a = G.RNG(9), b = G.RNG(9);
  G.Mon.create(54, 20, { rng: a }); G.Mon.create(54, 20, { rng: b });
  assert.equal(a.next(), b.next());
});

test('abilities with no effect in a single battle change nothing: the same battle, event for event', () => {
  const run = a => {
    const { b, events } = duel(G, { me: ['pikachu', 20, ['thunder-shock', 'quick-attack'], ab(a)], foe: ['rattata', 20, ['tackle', 'quick-attack'], ab(a)], seed: 7 });
    const all = events.slice();
    for (let i = 0; i < 6 && b.prompt && b.prompt.kind === 'action'; i++) all.push(...b.act({ type: 'move', slot: i % 2 }));
    return JSON.stringify(all);
  };
  assert.equal(run('illuminate'), run('stench'));
  assert.equal(run('pickup'), run('run-away'), 'Run Away only matters when running');
});

test('Intimidate cuts the foe\'s Attack when it comes in; Clear Body and Hyper Cutter stop it', () => {
  const { b, events } = duel(G, { me: ['gyarados', 30, ['splash']], foe: ['rattata', 30, ['tackle'], ab('run-away')] });
  assert.ok(said(events, 'show', 0) && events.some(e => e.type === 'stage' && e.side === 1 && e.stat === 'atk' && e.delta === -1));
  assert.equal(b.foe.bm.stages.atk, -1);
  const c = duel(G, { me: ['gyarados', 30, ['splash']], foe: ['tentacool', 30, ['splash'], ab('clear-body')] });
  assert.equal(c.b.foe.bm.stages.atk, 0);
  assert.ok(said(c.events, 'protect', 1), 'Clear Body says so');
  const k = duel(G, { me: ['gyarados', 30, ['splash']], foe: ['krabby', 30, ['splash'], ab('hyper-cutter')] });
  assert.equal(k.b.foe.bm.stages.atk, 0);
  // Coming in later: a switch.
  const s = duel(G, { me: ['pidgey', 30, ['splash']], mine: [['gyarados', 30, ['splash']]], foe: ['rattata', 30, ['tackle'], ab('run-away')] });
  assert.equal(s.b.foe.bm.stages.atk, 0);
  s.b.act({ type: 'switch', to: 1 });
  assert.equal(s.b.foe.bm.stages.atk, -1);
});

test('Levitate: Ground moves do not touch it (and the AI knows it)', () => {
  const { b, foes } = duel(G, { me: ['dugtrio', 30, ['earthquake']], foe: ['gastly', 30, ['splash']], kind: 'trainer' });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'noEffect' && e.side === 1));
  assert.equal(foes[0].hp, G.Mon.maxHp(foes[0]));
  assert.equal(G.BattleAI.score(b, b.foe.bm, b.player.bm, 'earthquake') > 0, true, 'the Dugtrio is not floating');
  assert.equal(G.BattleAI.score(b, b.player.bm, b.foe.bm, 'earthquake'), 0);
});

test('Water Absorb and Volt Absorb heal instead; Flash Fire powers up; Wonder Guard; Soundproof', () => {
  const w = duel(G, { me: ['squirtle', 30, ['water-gun']], foe: ['vaporeon', 30, ['splash'], ab('water-absorb')] });
  w.foes[0].hp = 10;
  const ev = w.b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'heal' && e.side === 1 && e.why === 'ability' && e.amt === Math.floor(G.Mon.maxHp(w.foes[0]) / 4)));
  assert.equal(hits(ev, 1).length, 0);
  const v = duel(G, { me: ['pikachu', 30, ['thunder-wave']], foe: ['jolteon', 30, ['splash'], ab('volt-absorb')] });
  v.b.player.bm.vol.lockOn = true;
  v.b.act({ type: 'move', slot: 0 });
  assert.equal(v.foes[0].status, null, 'no paralysis');
  const f = duel(G, { me: ['charmander', 30, ['ember']], foe: ['ponyta', 30, ['splash'], ab('flash-fire')] });
  const fe = f.b.act({ type: 'move', slot: 0 });
  assert.ok(said(fe, 'flash-fire', 1) && f.b.foe.bm.vol.flashFire);
  assert.equal(G.Abilities.powerMult(f.b, f.b.foe.bm, f.b.player.bm, 'fire'), 1.5);
  // Wonder Guard: only super-effective moves hit Shedinja.
  const sh = () => duel(G, { me: ['charmander', 30, ['water-gun', 'ember']], foe: ['shedinja', 30, ['splash']] });
  const a = sh(), ea = a.b.act({ type: 'move', slot: 0 });
  assert.ok(said(ea, 'protect', 1) && a.foes[0].hp === 1);
  const c = sh(), ec = c.b.act({ type: 'move', slot: 1 });
  assert.ok(hits(ec, 1).length === 1 && c.foes[0].hp === 0, 'Fire is super effective');
  const sp = duel(G, { me: ['jigglypuff', 30, ['sing']], foe: ['voltorb', 30, ['splash'], ab('soundproof')] });
  sp.b.act({ type: 'move', slot: 0 });
  assert.notEqual(sp.foes[0].status, 'slp');
});

test('abilities that keep a status away: Limber, Insomnia (and Rest), Own Tempo, Oblivious', () => {
  const l = duel(G, { me: ['pikachu', 30, ['thunder-wave']], foe: ['persian', 30, ['splash'], ab('limber')] });
  l.b.player.bm.vol.lockOn = true;                       // Thunder Wave cannot miss
  const el = l.b.act({ type: 'move', slot: 0 });
  assert.ok(l.foes[0].status === null && said(el, 'protect', 1));
  const i = duel(G, { me: ['oddish', 30, ['sleep-powder']], foe: ['drowzee', 30, ['splash'], ab('insomnia')] });
  i.b.act({ type: 'move', slot: 0 });
  assert.equal(i.foes[0].status, null);
  const r = duel(G, { me: ['drowzee', 30, ['rest'], ab('insomnia')], foe: ['magikarp', 5, ['splash']] });
  r.party[0].hp = 5;
  assert.ok(r.b.act({ type: 'move', slot: 0 }).some(e => e.type === 'fail'), 'it cannot Rest');
  const o = duel(G, { me: ['zubat', 30, ['confuse-ray']], foe: ['slowpoke', 30, ['splash'], ab('own-tempo')] });
  o.b.act({ type: 'move', slot: 0 });
  assert.ok(!o.b.foe.bm.vol.confusion);
  const at = duel(G, { me: ['clefairy', 30, ['attract'], { gender: 'f' }], foe: ['slowpoke', 30, ['splash'], { ability: 'oblivious', gender: 'm' }] });
  at.b.act({ type: 'move', slot: 0 });
  assert.ok(!at.b.foe.bm.vol.attract);
  assert.equal(G.BattleAI.score(at.b, at.b.player.bm, at.b.foe.bm, 'attract'), 0, 'the AI does not try');
});

test('contact abilities: Static about 3 times in 10 on a touch, never on a special move; Rough Skin always', () => {
  const touch = often(300, { me: ['rattata', 10, ['tackle']], foe: ['pikachu', 50, ['splash'], ab('static')] }, d => d.party[0].status === 'par');
  assert.ok(touch > 0.2 && touch < 0.4, String(touch));
  assert.equal(often(60, { me: ['rattata', 10, ['swift']], foe: ['pikachu', 50, ['splash'], ab('static')] }, d => d.party[0].status === 'par'), 0);
  const { b, party } = duel(G, { me: ['rattata', 30, ['tackle']], foe: ['carvanha', 50, ['splash']] });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'damage' && e.side === 0 && e.why === 'ability' && e.amt === Math.floor(G.Mon.maxHp(party[0]) / 16)));
});

test('weather abilities: Drizzle\'s rain lasts, Cloud Nine cancels the weather, Swift Swim, Forecast', () => {
  const { b } = duel(G, { me: ['kyogre', 50, ['splash']], foe: ['magikarp', 5, ['splash']] });
  assert.ok(b.weather.w === 'rain' && b.weather.turns === Infinity);
  for (let i = 0; i < 8; i++) b.act({ type: 'move', slot: 0 });
  assert.equal(b.weatherNow(), 'rain', 'still raining');
  const c = duel(G, { me: ['kyogre', 50, ['splash']], foe: ['golduck', 50, ['splash'], ab('cloud-nine')] });
  assert.equal(c.b.weather.w, 'rain');
  assert.equal(c.b.weatherNow(), null, 'no effect while Golduck is out');
  const s = duel(G, { me: ['lotad', 30, ['splash'], ab('swift-swim')], foe: ['magikarp', 5, ['splash']] });
  const dry = s.b.stat(s.b.player.bm, 'spe');
  s.b.weather = { w: 'rain', turns: 5 };
  assert.equal(s.b.stat(s.b.player.bm, 'spe'), dry * 2);
  const f = duel(G, { me: ['castform', 30, ['sunny-day']], foe: ['magikarp', 5, ['splash']] });
  const ev = f.b.act({ type: 'move', slot: 0 });
  assert.equal(f.b.player.bm.types.join(), 'fire');
  assert.ok(said(ev, 'type', 0));
});

test('stat and power abilities: Huge Power, Guts, Thick Fat, Blaze at a third of its HP', () => {
  const dmg = (me, foe, move, prep) => {
    const d = duel(G, { me: [me[0], 40, [move], me[1]], foe: [foe[0], 60, ['splash'], foe[1]], seed: 3 });
    if (prep) prep(d);
    return hits(d.b.act({ type: 'move', slot: 0 }), 1)[0];
  };
  const hp = dmg(['azumarill', ab('huge-power')], ['snorlax', ab('immunity')], 'tackle'), tf = dmg(['azumarill', ab('thick-fat')], ['snorlax', ab('immunity')], 'tackle');
  assert.ok(hp > tf * 1.7 && hp < tf * 2.3, `${tf} -> ${hp}`);
  const burnt = d => { d.party[0].status = 'brn'; };
  const guts = dmg(['heracross', ab('guts')], ['snorlax', ab('immunity')], 'tackle', burnt), swarm = dmg(['heracross', ab('swarm')], ['snorlax', ab('immunity')], 'tackle', burnt);
  assert.ok(guts > swarm * 2.5, `burnt: ${swarm}, with Guts: ${guts}`);
  const fat = dmg(['charmander', ab('blaze')], ['snorlax', ab('thick-fat')], 'ember'), lean = dmg(['charmander', ab('blaze')], ['snorlax', ab('immunity')], 'ember');
  assert.ok(fat < lean * 0.6, `${lean} -> ${fat}`);
  const low = dmg(['charmander', ab('blaze')], ['snorlax', ab('immunity')], 'ember', d => { d.party[0].hp = Math.floor(G.Mon.maxHp(d.party[0]) / 3); });
  assert.ok(low > lean * 1.3, `${lean} -> ${low}`);
});

test('Sturdy stops one-hit KOs, Rock Head recoil, Battle Armor critical hits, Shield Dust added effects', () => {
  const s = duel(G, { me: ['rhydon', 100, ['horn-drill']], foe: ['geodude', 30, ['splash'], ab('sturdy')] });
  const es = s.b.act({ type: 'move', slot: 0 });
  assert.ok(s.foes[0].hp > 0 && said(es, 'protect', 1));
  const recoil = a => { const d = duel(G, { me: ['onix', 30, ['double-edge'], ab(a)], foe: ['snorlax', 50, ['splash']] });
    return d.b.act({ type: 'move', slot: 0 }).some(e => e.type === 'damage' && e.side === 0 && e.why === 'recoil'); };
  assert.ok(recoil('sturdy') && !recoil('rock-head'));
  const crits = a => often(200, { me: ['farfetchd', 30, ['slash']], foe: ['kabuto', 50, ['splash'], ab(a)] }, (d, ev) => ev.some(e => e.type === 'damage' && e.crit));
  assert.ok(crits('swift-swim') > 0.05 && crits('battle-armor') === 0);
  const acc = a => { const d = duel(G, { me: ['diglett', 30, ['mud-slap']], foe: ['venomoth', 50, ['splash'], ab(a)] });
    d.b.act({ type: 'move', slot: 0 }); return d.b.foe.bm.stages.acc; };
  assert.equal(acc('shield-dust'), 0);
});

test('Serene Grace doubles the chance of added effects', () => {
  const burn = a => often(400, { me: ['togepi', 30, ['ember'], ab(a)], foe: ['snorlax', 60, ['splash'], ab('immunity')] }, d => d.foes[0].status === 'brn');
  const plain = burn('hustle'), grace = burn('serene-grace');
  assert.ok(plain < 0.15 && grace > 0.15, `${plain} -> ${grace}`);
});

test('Speed Boost, Truant, Shed Skin, Natural Cure, Early Bird, Synchronize', () => {
  const sb = duel(G, { me: ['ninjask', 30, ['splash']], foe: ['magikarp', 5, ['splash']] });
  sb.b.act({ type: 'move', slot: 0 }); sb.b.act({ type: 'move', slot: 0 });
  assert.equal(sb.b.player.bm.stages.spe, 2);
  const t = duel(G, { me: ['slakoth', 30, ['tackle']], foe: ['snorlax', 60, ['splash']] });
  const moved = () => t.b.act({ type: 'move', slot: 0 }).some(e => e.type === 'move' && e.side === 0);
  assert.deepEqual([moved(), moved(), moved(), moved()], [true, false, true, false]);
  const shed = often(300, { me: ['dratini', 30, ['splash'], { ability: 'shed-skin', status: 'psn' }], foe: ['magikarp', 5, ['splash']] }, d => d.party[0].status === null);
  assert.ok(shed > 0.23 && shed < 0.43, String(shed));
  const nc = duel(G, { me: ['starmie', 30, ['splash'], { ability: 'natural-cure', status: 'par' }], mine: [['pidgey', 30, ['splash']]], foe: ['magikarp', 5, ['splash']] });
  nc.b.act({ type: 'switch', to: 1 });
  assert.equal(nc.party[0].status, null, 'cured as it left');
  const sleeper = a => { const d = duel(G, { me: ['natu', 30, ['peck'], { ability: a, status: 'slp', slp: 4 }], foe: ['snorlax', 60, ['splash']] });
    let n = 0; while (d.party[0].status === 'slp' && n < 9) { d.b.act({ type: 'move', slot: 0 }); n++; } return n; };
  assert.ok(sleeper('early-bird') < sleeper('synchronize'));
  const sy = duel(G, { me: ['abra', 30, ['splash'], ab('synchronize')], foe: ['jigglypuff', 30, ['thunder-wave']] });
  sy.b.foe.bm.vol.lockOn = true;
  sy.b.act({ type: 'move', slot: 0 });
  assert.ok(sy.party[0].status === 'par' && sy.foes[0].status === 'par', 'passed back');
});

test('trapping abilities, Run Away, Damp, Pressure, Suction Cups, Liquid Ooze, Inner Focus', () => {
  const tr = duel(G, { me: ['rattata', 30, ['tackle'], ab('guts')], foe: ['diglett', 30, ['splash'], ab('arena-trap')] });
  assert.ok(tr.b.options().trapped && !tr.b.options().canRun);
  assert.ok(!duel(G, { me: ['pidgey', 30, ['tackle']], foe: ['diglett', 30, ['splash'], ab('arena-trap')] }).b.options().trapped, 'not a flying Pokémon');
  assert.ok(duel(G, { me: ['pidgey', 30, ['tackle']], foe: ['wobbuffet', 30, ['splash']] }).b.options().trapped, 'Shadow Tag');
  assert.ok(duel(G, { me: ['skarmory', 30, ['tackle']], foe: ['magnemite', 30, ['splash'], ab('magnet-pull')] }).b.options().trapped, 'Magnet Pull');
  const ra = duel(G, { me: ['rattata', 5, ['tackle'], ab('run-away')], foe: ['diglett', 60, ['splash'], ab('arena-trap')] });
  assert.ok(ra.b.options().canRun);
  ra.b.act({ type: 'run' });
  assert.equal(ra.b.result.outcome, 'run');
  const dp = duel(G, { me: ['geodude', 30, ['explosion']], foe: ['psyduck', 30, ['splash'], ab('damp')] });
  const ed = dp.b.act({ type: 'move', slot: 0 });
  assert.ok(said(ed, 'damp', 1) && dp.party[0].hp > 0);
  const pr = duel(G, { me: ['rattata', 30, ['tackle']], foe: ['snorlax', 60, ['splash'], ab('pressure')] });
  const pp = pr.party[0].moves[0].pp;
  pr.b.act({ type: 'move', slot: 0 });
  assert.equal(pr.party[0].moves[0].pp, pp - 2);
  const sc = duel(G, { me: ['pidgey', 30, ['roar']], foe: ['octillery', 30, ['splash']], foes: [['magikarp', 10, ['splash']]], kind: 'trainer' });
  sc.b.act({ type: 'move', slot: 0 });
  assert.equal(sc.b.foe.bm.mon, sc.foes[0], 'it stays');
  const lo = duel(G, { me: ['oddish', 30, ['giga-drain']], foe: ['tentacool', 50, ['splash'], ab('liquid-ooze')] });
  lo.party[0].hp = 40;
  const el = lo.b.act({ type: 'move', slot: 0 });
  assert.ok(el.some(e => e.type === 'damage' && e.side === 0 && e.why === 'ooze') && !el.some(e => e.type === 'heal' && e.side === 0));
  const flinch = a => { const d = duel(G, { me: ['dragonite', 30, ['splash'], ab(a)], foe: ['persian', 60, ['fake-out']] });
    return d.b.act({ type: 'move', slot: 0 }).some(e => e.type === 'cantMove' && e.why === 'flinch'); };
  assert.ok(flinch('shed-skin') && !flinch('inner-focus'));
});

test('Trace copies the foe\'s ability (and uses it); Color Change takes the type of the move that hit', () => {
  const t = duel(G, { me: ['porygon', 30, ['splash']], foe: ['gyarados', 30, ['splash']] });
  assert.equal(t.b.player.bm.ability, 'intimidate');
  assert.ok(said(t.events, 'trace', 0));
  assert.equal(t.b.foe.bm.stages.atk, -1, 'the traced Intimidate works');
  assert.equal(G.Abilities.of(t.party[0]), 'trace', 'the Pokémon keeps its own ability');
  const c = duel(G, { me: ['charmander', 30, ['ember']], foe: ['kecleon', 50, ['splash']] });
  c.b.act({ type: 'move', slot: 0 });
  assert.equal(c.b.foe.bm.types.join(), 'fire');
});

test('every ability line has text that names the ability, in English and in Chinese', () => {
  for (const lang of ['en', 'zh-Hans']) {
    const H = battleBoot({ lang });
    const d = duel(H, { me: ['pikachu', 30, ['splash']], foe: ['gyarados', 30, ['splash']] });
    const base = { type: 'ability', side: 1, uid: d.foes[0].uid, ability: 'intimidate', target: d.party[0].uid, tside: 0, to: 'fire', move: 'explosion' };
    for (const why of ['show', 'protect', 'trace', 'flash-fire', 'type', 'pressure', 'damp']) {
      const line = H.BattleText.line(Object.assign({}, base, { why }), d.b);
      assert.ok(line && line.includes(H.Names.ability('intimidate')), lang + ' ' + why + ': ' + line);
    }
    assert.ok(H.BattleText.line({ type: 'ability', why: 'truant', side: 1, uid: d.foes[0].uid, ability: 'truant' }, d.b));
    assert.ok(H.BattleText.line({ type: 'heal', why: 'ability', side: 1, uid: d.foes[0].uid, ability: 'rain-dish', amt: 3 }, d.b).includes(H.Names.ability('rain-dish')));
  }
});
