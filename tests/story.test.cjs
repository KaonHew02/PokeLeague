// The story without a screen, chapter by chapter: from the bedroom to the Hall of Fame, Mewtwo and Johto.
// The real scripts, maps, save and battle engine run in the node sandbox; a stand-in
// host answers the dialog (Yes, no nickname) and an auto-player fights every battle
// with its strongest move. Wild battles in the tall grass raise the party on the way,
// like a player would.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, plain, CORE, DATA, BATTLE, source } = require('./helpers.cjs');

const dev = source('dev.html');
const CONTENT = [...dev.matchAll(/<script[^>]*src="(js\/content\/[^"]+\.js)"/g)].map(m => m[1]);
const FILES = CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/field.js', 'js/world/field-items.js', 'js/world/daycare.js', 'js/world/contest.js', 'js/script/script.js'], CONTENT);

function world(seed = 1) {
  const ctx = boot(FILES);
  const G = ctx.G;
  const errors = [];
  ctx.console = Object.assign(Object.create(console), { error: (...a) => errors.push(a.map(String).join(' ')), warn() {} });
  // A stand-in for the overworld: where the player is, and a seeded RNG for new Pokémon.
  const W = { map: 'player-2f', player: { x: 9, y: 1, dir: 'up' }, rng: G.RNG(seed), refresh() {}, seed };
  G.World = W;
  G.Audio = { sfx() {}, cry() {}, music() {}, jingle: () => Promise.resolve() };
  const save = G.Store.newSave({ name: 'Red', rival: 'Blue', id: 4242 });
  save.player.lastHeal = { map: 'player-1f', spot: 'mom' };
  G.Field.bind(save);
  return { G, W, S: save, errors, log: [], answers: [], picks: [], battles: [] };
}

// ---------------- the auto-player ----------------

function bestMove(G, b) {
  const o = b.options();
  const usable = o.moves.filter(m => m.usable);
  if (o.struggle || !usable.length) return { type: 'move', slot: 0 };
  const me = b.player.bm.mon, foe = b.foe.bm.mon;
  let best = usable[0].slot, score = -1;
  for (const m of usable) {
    const M = G.MOVES[m.id], sm = G.SpecialMoves[m.id];
    const pow = sm && typeof sm.power === 'function' ? sm.power(b, b.player.bm, b.foe.bm, M) || 0 : M.pow || 0;   // Low Kick: by weight
    const s = pow * G.Types.eff(M.type, G.Mon.types(foe)) * (G.Mon.types(me).includes(M.type) ? 1.5 : 1) * ((M.acc || 100) / 100);
    if (s > score) { score = s; best = m.slot; }
  }
  return { type: 'move', slot: best };
}

function autoplay(G, b) {
  for (let i = 0; i < 500 && !b.result && b.prompt; i++) {
    const p = b.prompt;
    if (p.kind === 'action') b.act(bestMove(G, b));
    else if (p.kind === 'switch') { const s = b.options().switchable; b.answer({ switchTo: s.length ? s[0] : -1 }); }
    else if (p.kind === 'shift') b.answer({ switchTo: -1 });
    else if (p.kind === 'learn') {
      // Keep the strongest four: forget the weakest move if the new one hits harder.
      const mon = b.player.party.find(m => m.uid === p.uid);
      const pow = id => G.MOVES[id].pow || 0;
      let slot = -1, low = pow(p.move);
      mon.moves.forEach((m, j) => { if (pow(m.id) < low) { low = pow(m.id); slot = j; } });
      b.answer({ learnSlot: slot });
    } else break;
  }
  return b.result;
}

/** Evolutions after a battle (the battle screen does them in the game). */
function evolve(G, S, r) {
  for (const uid of (r && r.evolve) || []) {
    const mon = S.party.find(m => m.uid === uid);
    const to = mon && G.Evolution.candidates(mon, { trigger: 'level' })[0];
    if (!to) continue;
    for (const id of G.Evolution.evolve(mon, to)) if (mon.moves.length < 4) G.Mon.learn(mon, id);
    S.dex.seen[to] = 1; S.dex.caught[to] = 1;
  }
}

/** A trainer battle as the overworld runs it: prize, done key, the trainer's win script. */
async function fight(st, ref, o, h) {
  const { G, S, W } = st;
  let d = ref, key;
  if (typeof ref === 'string') {
    const [mid, tid] = ref.includes(':') ? ref.split(':') : [W.map, ref];
    d = G.Maps.get(mid).trainers.find(t => t.id === tid);
    key = mid + ':' + tid;
  } else key = W.map + ':' + d.id;
  const cls = G.TRAINER_CLASSES[d.cls] || {};
  const rng = G.RNG(W.seed * 977 + st.battles.length);
  const party = d.team.map(([sp, lvl, moves]) => G.Mon.create(G.Maps.species(sp), lvl, { rng, moves }));
  const b = G.Battle.create({ kind: 'trainer', seed: W.seed * 31 + st.battles.length,
    player: { name: S.player.name, id: S.player.id, party: S.party, bag: S.bag },
    foe: { party, trainer: { id: key, name: d.name || '', ai: d.ai || (d.leader ? 'leader' : 'basic'), items: d.items || {}, prize: d.prize != null ? d.prize : cls.prize } },
    rules: { canLose: !!(o && o.canLose), obeyCap: obeyCap(st) } });
  b.start();
  const r = autoplay(G, b);
  st.battles.push({ key, outcome: r.outcome, levels: S.party.map(m => m.lvl) });
  G.Field.lastBattle = r.outcome;
  for (const sp of r.seen || []) S.dex.seen[sp] = 1;
  if (r.outcome === 'win' && r.money > 0) G.Field.money(r.money);
  evolve(G, S, r);
  if (r.outcome !== 'lose') {
    G.Field.markDone(key);
    if (d.win) await G.Script.run(typeof d.win === 'string' ? G.Script.get(d.win) : d.win, h);
  } else if (!(o && o.canLose)) {
    // Blacked out: half the money, healed at the last Pokémon Center (or at home).
    G.Field.money(-G.Exp.blackoutLoss(S.player.money));
    G.Field.healAll();
  }
  return r.outcome;
}

/** Johto (chapter 11): above the badges' level cap the player's Pokémon may not obey. */
const obeyCap = st => st.G.Field.obeyCap((st.G.Maps.get(st.W.map) || { def: {} }).def.region);

/** A scripted wild battle (['wild', sp, lvl, { noCatch }]): the auto-player fights it. */
function wildFight(st, sp, lvl, o = {}) {
  const { G, S, W } = st;
  const rng = G.RNG(W.seed * 389 + st.battles.length);
  const foe = G.Mon.create(G.Maps.species(sp), lvl, { rng, wild: true });
  S.dex.seen[foe.sp] = 1;
  const b = G.Battle.create({ kind: 'wild', seed: W.seed * 53 + st.battles.length, player: { name: S.player.name, id: S.player.id, party: S.party, bag: S.bag },
    foe: { party: [foe] }, rules: { noCatch: !!o.noCatch, obeyCap: obeyCap(st) } });
  b.start();
  const r = autoplay(G, b);
  st.battles.push({ key: 'wild:' + sp, outcome: r.outcome, levels: S.party.map(m => m.lvl) });
  G.Field.lastBattle = r.outcome;
  evolve(G, S, r);
  if (r.outcome === 'lose') { G.Field.money(-G.Exp.blackoutLoss(S.player.money)); G.Field.healAll(); }
  return Promise.resolve(r.outcome);
}

/** Wild battles in a map's tall grass until the lead reaches a level (healing in between, as at a Center). */
function grind(st, mapId, level, max = 60) {
  const { G, S } = st;
  const table = G.Maps.encounters(G.Maps.get(mapId), 'walk');
  const rng = G.RNG(st.W.seed * 7 + level);
  G.Field.healAll();
  for (let n = 0; n < max && S.party[0].lvl < level; n++) {
    let r = rng.next() * 100, pick = table.mons[table.mons.length - 1];
    for (const row of table.mons) if ((r -= row[3]) < 0) { pick = row; break; }
    const foe = G.Mon.create(pick[0], rng.int(pick[1], pick[2]), { rng, wild: true });
    S.dex.seen[foe.sp] = 1;
    const b = G.Battle.create({ kind: 'wild', seed: rng.int(1, 1e9), player: { name: 'Red', party: S.party, bag: S.bag }, foe: { party: [foe] },
      rules: { obeyCap: G.Field.obeyCap(G.Maps.get(mapId).def.region) } });
    b.start();
    evolve(G, S, autoplay(G, b));
    G.Field.healAll();
  }
}

function host(st) {
  const { G, W } = st;
  const P = () => Promise.resolve();
  const h = {
    ctx: {}, lock() {}, unlock() {},
    vars: () => G.Field.vars(),
    say(text, o = {}) {
      const v = Object.assign(G.Field.vars(), o.vars || {});
      for (const t of [].concat(text)) st.log.push(G.I18n.fmt(t, v));
      return P();
    },
    choice(text, o = {}) {
      st.log.push('? ' + G.I18n.fmt(text, Object.assign(G.Field.vars(), o.vars || {})));
      return Promise.resolve(st.answers.length ? st.answers.shift() : 0);
    },
    actor: () => null, move: P, walkTo: P, face() {}, emote: P, show() {}, hide() {}, place() {},
    async warp(m, spot) {
      W.map = m;
      G.Field.save.player.map = m;
      const d = G.Maps.get(m).def;
      if (d.enter) await G.Script.run(typeof d.enter === 'string' ? G.Script.get(d.enter) : d.enter, h);
    },
    fade: P, wait: P,
    battle: (ref, o) => fight(st, ref, o, h),
    wild: (sp, lvl, o) => wildFight(st, sp, lvl, o), heal: () => G.Field.healAll(), healAnim: P,
    lastHeal(spot) { G.Field.save.player.lastHeal = { map: W.map, spot }; },
    shop: P, pc: P, music() {}, sfx() {}, jingle: P, nickname: P,
    pickMon: () => Promise.resolve(st.picks.length ? st.picks.shift() : null),
    itemName: id => G.Names.item(id), monName: sp => G.Names.mon(G.Maps.species(sp))
  };
  return h;
}

/** Runs a named script (or a person's script) as if the player were on that map. */
async function run(st, mapId, script, answers = [], ctx = {}) {
  st.W.map = mapId;
  st.S.player.map = mapId;
  st.answers.push(...answers);
  const cmds = typeof script === 'string' ? st.G.Script.get(script) : script;
  assert.ok(cmds, 'no script ' + script);
  const h = host(st);
  h.ctx = ctx;
  await st.G.Script.run(cmds, h);
}
const npc = (st, mapId, id) => st.G.Maps.get(mapId).npcs.find(p => p.id === id).script;

/** Chapter 1 as a player would play it (Squirtle), with checks along the way. */
async function chapter1(st) {
  // (st = world(seed))
  const { G, S } = st;
  const F = G.Field;
  await run(st, 'player-1f', 'pallet.mom');
  await run(st, 'pallet', 'pallet.oak-stops-you');
  assert.ok(F.flag('oak-escort') && F.flag('lab-intro'), 'Oak took the player to the lab');
  await run(st, 'oak-lab', 'lab.ball-squirtle', [0]);            // "So you want Squirtle?" Yes
  assert.equal(S.party.length, 1);
  assert.equal(S.party[0].sp, 7);
  assert.equal(S.rival.starter, 1, 'the rival takes Bulbasaur, strong against Squirtle');
  assert.ok(F.isDone('oak-lab:ball-squirtle') && F.isDone('oak-lab:ball-bulbasaur') && !F.isDone('oak-lab:ball-charmander'));
  await run(st, 'oak-lab', 'lab.rival-battle');
  assert.ok(F.flag('lab-rival-battle') && F.flag('rival-left-lab'));
  assert.equal(S.party[0].hp, G.Mon.maxHp(S.party[0]), 'Oak healed the party');

  await run(st, 'route1', 'route1.clerk');
  assert.equal(F.count('potion'), 1);
  grind(st, 'route1', 7);
  await run(st, 'viridian-mart', 'viridian.mart-enter');
  assert.equal(F.count('oaks-parcel'), 1);
  await run(st, 'viridian-mart', npc(st, 'viridian-mart', 'clerk'));
  assert.match(st.log[st.log.length - 1], /Professor Oak/);
  await run(st, 'oak-lab', 'lab.oak');
  assert.ok(F.flag('parcel-delivered') && F.flag('has-pokedex'));
  assert.equal(F.count('oaks-parcel'), 0);
  assert.equal(F.count('poke-ball'), 5);
  await run(st, 'rival-house', 'pallet.daisy');
  assert.equal(F.count('town-map'), 1);
  await run(st, 'viridian', 'viridian.oldman-tips');
  grind(st, 'route22', 10);
  await run(st, 'route22', 'route22.rival');
  assert.ok(F.flag('route22-rival'));
  assert.equal(st.battles[st.battles.length - 1].key, 'route22:rival-22');

  grind(st, 'route2', 9);
  grind(st, 'viridian-forest', 11);
  for (const t of G.Maps.get('viridian-forest').trainers) {
    F.healAll();
    await run(st, 'viridian-forest', [['battle', 'viridian-forest:' + t.id]]);
  }
  const forest = st.battles.filter(b => b.key.startsWith('viridian-forest:'));
  assert.equal(forest.length, 5);
  assert.ok(forest.every(b => b.outcome === 'win'), JSON.stringify(forest));

  await run(st, 'pewter-center', npc(st, 'pewter-center', 'nurse'), [0]);
  assert.equal(S.player.lastHeal.map, 'pewter-center');
  grind(st, 'viridian-forest', 14);
  await run(st, 'pewter-gym', [['battle', 'pewter-gym:liam']]);
  F.healAll();
  const money = S.player.money;
  await run(st, 'pewter-gym', [['battle', 'pewter-gym:brock']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.key, 'pewter-gym:brock');
  assert.equal(last.outcome, 'win', 'Brock beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1]);
  assert.equal(F.count('tm39'), 1);
  assert.equal(S.player.money - money, 1400);
  assert.ok(st.log.some(l => /Boulder Badge/.test(l)));
  assert.deepEqual(st.errors, [], 'no script errors');
  // The save still passes its own checks.
  const back = G.Store.sanitize(JSON.parse(JSON.stringify(S)));
  assert.deepEqual([...back.player.badges], [1]);
  assert.equal(back.party[0].sp, S.party[0].sp);
}

test('the slice: bedroom, starter, parcel, Pokédex, forest, Brock and the Boulder Badge', async () => {
  await chapter1(world(3));
});

test('every trainer on the Kanto maps can be battled to the end by the engine', () => {
  const st = world(9);
  const { G, S } = st;
  for (const id of G.Maps.all()) {
    for (const t of G.Maps.get(id).trainers) {
      // (A Mewtwo well above the team: this checks that every battle ends, not the balance.)
      S.party.length = 0;
      const top = Math.max(...t.team.map(m => m[1]));
      S.party.push(G.Mon.create(150, Math.max(40, top + 15), { rng: G.RNG(1), moves: ['psychic', 'recover', 'shadow-ball', 'ice-beam'] }));
      const rng = G.RNG(2);
      const party = t.team.map(([sp, lvl, moves]) => G.Mon.create(G.Maps.species(sp), lvl, { rng, moves }));
      for (const m of party) for (const mv of m.moves) assert.ok(G.MOVES[mv.id], `${id}:${t.id} move ${mv.id}`);
      const b = G.Battle.create({ kind: 'trainer', seed: 5, player: { name: 'Red', party: S.party, bag: {} },
        foe: { party, trainer: { id: t.id, name: t.name || '', ai: t.ai || 'basic', items: t.items || {}, prize: 10 } } });
      b.start();
      const r = autoplay(G, b);
      assert.equal(r && r.outcome, 'win', `${id}:${t.id}`);
    }
  }
});

test('balance: Brock can be beaten with every starter (Charmander with a Route 22 Mankey); win rates are printed', () => {
  const { G } = world(1);
  const brock = G.Maps.get('pewter-gym').trainers.find(t => t.id === 'brock');
  const rate = (sp, lvl, extra) => {
    let wins = 0;
    for (let s = 1; s <= 40; s++) {
      const rng = G.RNG(s * 13);
      const me = [G.Mon.create(sp, lvl, { rng })];
      if (extra) me.push(G.Mon.create(extra[0], extra[1], { rng }));
      const foes = brock.team.map(([x, l, moves]) => G.Mon.create(G.Maps.species(x), l, { rng, moves }));
      const b = G.Battle.create({ kind: 'trainer', seed: s, player: { name: 'Red', party: me, bag: { potion: 2 } },
        foe: { party: foes, trainer: { id: 'brock', name: 'Brock', ai: 'leader', items: brock.items, prize: 100 } } });
      b.start();
      if ((autoplay(G, b) || {}).outcome === 'win') wins++;
    }
    return wins / 40;
  };
  const table = {};
  for (const [name, sp] of [['bulbasaur', 1], ['charmander', 4], ['squirtle', 7]]) {
    table[name] = {};
    for (const lvl of [10, 12, 14, 16]) table[name][lvl] = rate(sp, lvl);
  }
  // Charmander with a Butterfree from Viridian Forest (Confusion), as many players do.
  table['charmander+butterfree'] = {};
  for (const lvl of [12, 14]) table['charmander+butterfree'][lvl] = rate(4, lvl, [12, 12]);
  // ...or with a Mankey from Route 22 (Low Kick hits heavy Pokémon like Onix hard).
  table['charmander+mankey'] = {};
  for (const lvl of [12, 14]) table['charmander+mankey'][lvl] = rate(4, lvl, [56, 10]);
  console.log('[balance] starter alone vs Brock, win rate by level:', JSON.stringify(table));
  // Squirtle is the easy pick, Bulbasaur needs a couple of levels (Vine Whip is physical now and Onix's
  // Defense is huge), Charmander needs help: a Mankey from Route 22 with Low Kick, as in the games.
  assert.ok(table.squirtle[12] >= 0.8, 'Squirtle Lv 12');
  assert.ok(table.bulbasaur[14] >= 0.5, 'Bulbasaur Lv 14');
  assert.ok(table['charmander+mankey'][12] >= 0.6, 'Charmander Lv 12 with a Mankey Lv 10');
  assert.ok(table.charmander[14] < 0.5, 'Brock is a real test for a lone Charmander');
});

test('balance: Misty (chapter 2), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const misty = G.Maps.get('cerulean-gym').trainers.find(t => t.id === 'misty');
  /** team: [[species, level], ...] -> share of 40 battles won */
  const rate = team => {
    let wins = 0;
    for (let s = 1; s <= 40; s++) {
      const rng = G.RNG(s * 17);
      const me = team.map(([sp, lvl]) => G.Mon.create(sp, lvl, { rng }));
      const foes = misty.team.map(([x, l, moves]) => G.Mon.create(G.Maps.species(x), l, { rng, moves }));
      const b = G.Battle.create({ kind: 'trainer', seed: s, player: { name: 'Red', party: me, bag: {} },
        foe: { party: foes, trainer: { id: 'misty', name: 'Misty', ai: 'leader', items: misty.items || {}, prize: 100 } } });
      b.start();
      if ((autoplay(G, b) || {}).outcome === 'win') wins++;
    }
    return wins / 40;
  };
  const table = {
    'ivysaur 22': rate([[2, 22]]),
    'wartortle 22': rate([[8, 22]]),
    'wartortle 24': rate([[8, 24]]),
    'charmeleon 22': rate([[5, 22]]),
    'charmeleon 24': rate([[5, 24]]),
    'charmeleon 22 + pikachu 18': rate([[5, 22], [25, 18]]),
    'wartortle 22 + pikachu 18': rate([[8, 22], [25, 18]]),
    'charmeleon 22 + butterfree 20': rate([[5, 22], [12, 20]]),
    'charmeleon 22 + paras 20': rate([[5, 22], [46, 20]])
  };
  console.log('[balance] vs Misty:', JSON.stringify(table));
  assert.ok(table['ivysaur 22'] >= 0.8, 'Ivysaur Lv 22');
  assert.ok(table['wartortle 24'] >= 0.5, 'Wartortle Lv 24');
  // Charmander's answer, as in the games: a Paras from Mt. Moon (Bug hits Starmie's Psychic type).
  assert.ok(table['charmeleon 22 + paras 20'] >= 0.8, 'Charmeleon with a Paras');
  assert.ok(table['charmeleon 24'] < 0.5, 'Misty is a real wall for a lone Charmeleon');
});

/** Puts party member i first (the one wild battles raise). */
function lead(st, sp) {
  const p = st.S.party, i = p.findIndex(m => m.sp === sp);
  if (i > 0) p.unshift(p.splice(i, 1)[0]);
}

/** Chapter 2 after chapter 1: Route 3, Mt. Moon, Cerulean City, Misty. */
async function chapter2(st) {
  const { G, S } = st;
  const F = G.Field;
  await run(st, 'pewter', 'pewter.east-kid');
  assert.match(st.log[st.log.length - 1], /Route 3/);
  for (const t of G.Maps.get('route3').trainers) {
    F.healAll();
    await run(st, 'route3', [['battle', 'route3:' + t.id]]);
  }
  grind(st, 'route3', 18);
  // The Magikarp salesman at the Mt. Moon Pokémon Center.
  const money = S.player.money;
  await run(st, 'mtmoon-center', 'route4.magikarp', [0]);
  assert.equal(S.player.money, money - 500);
  assert.ok(S.party.some(m => m.sp === 129) && F.flag('bought-magikarp'));
  for (const id of ['mtmoon-1f', 'mtmoon-b2f']) {
    for (const t of G.Maps.get(id).trainers.filter(t => t.id !== 'miguel')) {
      F.healAll();
      await run(st, id, [['battle', id + ':' + t.id]]);
    }
  }
  // The fossils: Miguel battles first, then you keep one and he takes the other.
  F.healAll();
  await run(st, 'mtmoon-b2f', 'mtmoon.fossil-helix', [0]);
  assert.ok(F.isDone('mtmoon-b2f:miguel'), 'Miguel was beaten');
  assert.equal(F.count('helix-fossil'), 1);
  assert.equal(F.count('dome-fossil'), 0);
  assert.ok(F.isDone('mtmoon-b2f:fossil-dome') && F.flag('got-fossil'), 'Miguel took the Dome Fossil');
  await run(st, 'mtmoon-b2f', 'mtmoon.fossil-dome');
  assert.equal(F.count('dome-fossil'), 0, 'no second fossil');
  // A Paras caught in the cave, raised along with the starter.
  F.giveMon('paras', 10);
  lead(st, 46);
  grind(st, 'mtmoon-b1f', 14);
  grind(st, 'route4', 20, 120);
  lead(st, 8);
  grind(st, 'route4', 23);
  const rocket = st.battles.filter(b => /grunt/.test(b.key));
  assert.equal(rocket.length, 4);

  await run(st, 'cerulean-center', npc(st, 'cerulean-center', 'nurse'), [0]);
  for (const id of ['luis', 'diana']) { F.healAll(); await run(st, 'cerulean-gym', [['battle', 'cerulean-gym:' + id]]); }
  F.healAll();
  lead(st, 46);                                  // Paras first: Bug hits Starmie hard
  const before = S.player.money;
  await run(st, 'cerulean-gym', [['battle', 'cerulean-gym:misty']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.key, 'cerulean-gym:misty');
  assert.equal(last.outcome, 'win', 'Misty beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1, 2]);
  assert.equal(F.count('tm03'), 1);
  assert.equal(S.player.money - before, 2100);
  assert.ok(F.flag('chapter-2-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

test('chapter 2: Route 3, Mt. Moon and its fossils, Cerulean City and the Cascade Badge', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
});

/** Win rate of a team ([[species, level], ...]) against a Gym Leader, over 40 seeded battles. */
function leaderRate(G, mapId, id) {
  const L = G.Maps.get(mapId).trainers.find(t => t.id === id);
  return team => {
    let wins = 0;
    for (let s = 1; s <= 40; s++) {
      const rng = G.RNG(s * 19);
      const me = team.map(([sp, lvl, moves]) => G.Mon.create(sp, lvl, { rng, moves }));
      const foes = L.team.map(([x, l, moves]) => G.Mon.create(G.Maps.species(x), l, { rng, moves }));
      const b = G.Battle.create({ kind: 'trainer', seed: s, player: { name: 'Red', party: me, bag: {} },
        foe: { party: foes, trainer: { id, name: L.name, ai: 'leader', items: L.items || {}, prize: 100 } } });
      b.start();
      if ((autoplay(G, b) || {}).outcome === 'win') wins++;
    }
    return wins / 40;
  };
}

test('balance: Lt. Surge (chapter 3), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'vermilion-gym', 'surge');
  const table = {
    'ivysaur 26': rate([[2, 26]]),
    'charmeleon 26': rate([[5, 26]]),
    'wartortle 26': rate([[8, 26]]),
    'wartortle 26 + geodude 22': rate([[8, 26], [74, 22]]),
    'charmeleon 26 + geodude 22': rate([[5, 26], [74, 22]]),
    'wartortle 26 + paras 24': rate([[8, 26], [46, 24]]),
    'charmeleon 26 + gloom 24': rate([[5, 26], [44, 24]])
  };
  console.log('[balance] vs Lt. Surge:', JSON.stringify(table));
  // Surge is the hardest wall so far (Raichu's Double Team, Voltorb's Self-Destruct); Grass types
  // (Paras from Mt. Moon, Oddish/Gloom from Routes 24 and 25) take Electric moves well. The auto-player
  // never switches or heals, so a player with a team does better.
  assert.ok(table['wartortle 26 + paras 24'] >= 0.7, 'Wartortle with a Paras');
  assert.ok(table['charmeleon 26 + gloom 24'] >= 0.6, 'Charmeleon with a Gloom');
  assert.ok(table['wartortle 26'] < 0.3, 'a lone Wartortle should struggle');
});

test('balance: Erika (chapter 4), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'celadon-gym', 'erika');
  const table = {
    'ivysaur 31': rate([[2, 31]]),
    'charmeleon 32': rate([[5, 32]]),
    'wartortle 31': rate([[8, 31]]),
    'parasect 30 + wartortle 31': rate([[47, 30], [8, 31]]),
    'kadabra 28 + wartortle 31': rate([[64, 28], [8, 31]]),
    'flareon 28 + wartortle 31': rate([[136, 28], [8, 31]]),
    'charmeleon 31 + pidgeotto 29': rate([[5, 31], [17, 29]])
  };
  console.log('[balance] vs Erika:', JSON.stringify(table));
  // Sleep Powder and Stun Spore hurt a lone Pokémon that never heals (the auto-player); the
  // answers the game offers do well: Paras from Mt. Moon, Abra from Route 24/25, Celadon's
  // Eevee with a Fire Stone, a bird.
  assert.ok(table['parasect 30 + wartortle 31'] >= 0.8, 'Parasect leading a Wartortle');
  assert.ok(table['charmeleon 31 + pidgeotto 29'] >= 0.8, 'Charmeleon with a Pidgeotto');
  assert.ok(table['kadabra 28 + wartortle 31'] >= 0.6, 'Kadabra leading a Wartortle');
  assert.ok(table['wartortle 31'] < 0.3, 'a lone Wartortle should struggle');
});

test('balance: Koga (chapter 5), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'fuchsia-gym', 'koga');
  const table = {
    'blastoise 38': rate([[9, 38]]),
    'charizard 38': rate([[6, 38]]),
    'wartortle 36': rate([[8, 36]]),
    'parasect 36 + wartortle 36': rate([[47, 36], [8, 36]]),
    'dugtrio 34 + wartortle 36': rate([[51, 34], [8, 36]]),
    'kadabra 34 + wartortle 36': rate([[64, 34], [8, 36]]),
    'blastoise 38 + dugtrio 34': rate([[9, 38], [51, 34]]),
    'charmeleon 35 + pidgeotto 34 + dugtrio 33': rate([[5, 35], [17, 34], [51, 33]])
  };
  console.log('[balance] vs Koga:', JSON.stringify(table));
  // Four Pokémon with Poison Gas, Toxic and Smokescreen wear down a small team that never heals
  // (the auto-player); Ground and Psychic types (Diglett's Cave, Abra from Route 24/25) answer them,
  // as the Gym guide says.
  assert.ok(table['kadabra 34 + wartortle 36'] >= 0.8, 'Kadabra leading a Wartortle');
  assert.ok(table['charmeleon 35 + pidgeotto 34 + dugtrio 33'] >= 0.8, 'a team of three with a Dugtrio');
  assert.ok(table['blastoise 38 + dugtrio 34'] >= 0.4, 'Blastoise with a Dugtrio');
  assert.ok(table['blastoise 38'] < 0.3, 'a lone Blastoise should struggle');
});

test('balance: Sabrina (chapter 6), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'saffron-gym', 'sabrina');
  const SURF = ['surf', 'bite', 'skull-bash', 'rapid-spin'];
  const table = {
    'blastoise 42': rate([[9, 42]]),
    'blastoise 42 (Surf)': rate([[9, 42, SURF]]),
    'charizard 42': rate([[6, 42]]),
    'snorlax 40': rate([[143, 40]]),
    'parasect 42 + dugtrio 40': rate([[47, 42], [51, 40]]),
    'blastoise 42 (Surf) + parasect 42': rate([[9, 42, SURF], [47, 42]]),
    'snorlax 40 + scyther 38': rate([[143, 40], [123, 38]]),
    'charizard 42 + snorlax 40': rate([[6, 42], [143, 40]])
  };
  console.log('[balance] vs Sabrina:', JSON.stringify(table));
  // Four Psychic Pokémon against a small team that never heals (the auto-player): a lone starter
  // loses, Snorlax from Route 12, a Scyther or Parasect (Bug) and Surf from the Safari Zone help.
  assert.ok(table['charizard 42 + snorlax 40'] >= 0.8, 'Charizard with a Snorlax');
  assert.ok(table['blastoise 42 (Surf) + parasect 42'] >= 0.4, 'Blastoise with Surf and a Parasect');
  assert.ok(table['snorlax 40 + scyther 38'] >= 0.4, 'Snorlax with a Scyther');
  assert.ok(table['blastoise 42'] < 0.3, 'a lone Blastoise should struggle');
});

test('balance: Blaine (chapter 7), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'cinnabar-gym', 'blaine');
  const SURF = ['surf', 'bite', 'skull-bash', 'rapid-spin'];
  const DIG = ['dig', 'slash', 'sand-tomb', 'mud-slap'];
  const table = {
    'venusaur 45': rate([[3, 45]]),
    'charizard 45': rate([[6, 45]]),
    'blastoise 42 (Surf)': rate([[9, 42, SURF]]),
    'golduck 42 (Surf)': rate([[55, 42, ['surf', 'confusion', 'disable', 'fury-swipes']]]),
    'lapras 40 (Surf)': rate([[131, 40, ['surf', 'ice-beam', 'body-slam', 'confuse-ray']]]),
    'charizard 45 + dugtrio 42 (Dig)': rate([[6, 45], [51, 42, DIG]]),
    'venusaur 45 + blastoise 42 (Surf)': rate([[3, 45], [9, 42, SURF]]),
    'charizard 45 + snorlax 42': rate([[6, 45], [143, 42]])
  };
  console.log('[balance] vs Blaine:', JSON.stringify(table));
  // Four Fire types against a small team that never heals (the auto-player): Surf (needed to reach
  // Cinnabar at all) and Dig (TM28 from Cerulean) answer them, as the Gym guide says.
  assert.ok(table['blastoise 42 (Surf)'] >= 0.6, 'Blastoise with Surf');
  assert.ok(table['charizard 45 + dugtrio 42 (Dig)'] >= 0.75, 'Charizard with a Dugtrio that knows Dig');
  assert.ok(table['venusaur 45 + blastoise 42 (Surf)'] >= 0.5, 'Venusaur with a Surfer');
  assert.ok(table['venusaur 45'] < 0.3, 'a lone Venusaur should struggle');
  assert.ok(table['charizard 45'] < 0.3, 'a lone Charizard should struggle');
});

test('balance: Giovanni (chapter 8), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'viridian-gym', 'giovanni');
  const SURF = ['surf', 'bite', 'skull-bash', 'rapid-spin'];
  const table = {
    'blastoise 50 (Surf)': rate([[9, 50, SURF]]),
    'venusaur 50': rate([[3, 50]]),
    'charizard 50': rate([[6, 50]]),
    'charizard 50 + lapras 45 (Surf)': rate([[6, 50], [131, 45, ['surf', 'ice-beam', 'body-slam', 'confuse-ray']]]),
    'venusaur 50 + blastoise 47 (Surf)': rate([[3, 50], [9, 47, SURF]]),
    'charizard 50 + blastoise 47 (Surf)': rate([[6, 50], [9, 47, SURF]]),
    'pidgeot 48 + golduck 46 (Surf)': rate([[18, 48], [55, 46, ['surf', 'confusion', 'disable', 'fury-swipes']]])
  };
  console.log('[balance] vs Giovanni:', JSON.stringify(table));
  // Five Ground types (Rhydon's Earthquake, Nidoking's Thrash) against a team that never heals:
  // Water and Ice answer them, as the Gym guide says; a lone Fire or Grass starter does not last.
  assert.ok(table['blastoise 50 (Surf)'] >= 0.7, 'Blastoise with Surf');
  assert.ok(table['charizard 50 + lapras 45 (Surf)'] >= 0.8, 'Charizard with the Lapras from Silph Co.');
  assert.ok(table['venusaur 50 + blastoise 47 (Surf)'] >= 0.75, 'Venusaur with a Surfer');
  assert.ok(table['charizard 50'] < 0.3, 'a lone Charizard should struggle');
});

test('balance: the Elite Four and the Champion (chapter 9), win rates of typical teams are printed', () => {
  const { G } = world(1);
  // A full team of six, as a player would bring: its starter and five others a few levels lower.
  const team = (lead, l) => [lead, [131, l - 5, ['surf', 'ice-beam', 'body-slam', 'thunderbolt']], [143, l - 5, ['body-slam', 'earthquake', 'rest', 'headbutt']],
    [135, l - 5, ['thunderbolt', 'pin-missile', 'double-kick', 'quick-attack']], [51, l - 5, ['earthquake', 'slash', 'dig', 'sand-tomb']],
    [65, l - 5, ['psychic', 'recover', 'thunder-punch', 'fire-punch']]];
  const CHARIZARD = l => team([6, l, ['flamethrower', 'wing-attack', 'slash', 'earthquake']], l);
  const VENUSAUR = l => team([3, l, ['razor-leaf', 'sludge-bomb', 'earthquake', 'body-slam']], l);
  const fight = (foe, me) => {
    let wins = 0;
    for (let s = 1; s <= 30; s++) {
      const rng = G.RNG(s * 19);
      const mine = me.map(([sp, lvl, moves]) => G.Mon.create(sp, lvl, { rng, moves }));
      const foes = foe.map(([x, l, moves]) => G.Mon.create(G.Maps.species(x), l, { rng, moves }));
      const b = G.Battle.create({ kind: 'trainer', seed: s, player: { name: 'Red', party: mine, bag: {} },
        foe: { party: foes, trainer: { id: 'x', name: 'X', ai: 'leader', items: {}, prize: 100 } } });
      b.start();
      if ((autoplay(G, b) || {}).outcome === 'win') wins++;
    }
    return Math.round(wins / 30 * 100) / 100;
  };
  const member = (room, id) => G.Maps.get(room).trainers.find(t => t.id === id).team;
  const FOES = { lorelei: member('lorelei-room', 'lorelei'), bruno: member('bruno-room', 'bruno'), agatha: member('agatha-room', 'agatha'),
                 lance: member('lance-room', 'lance'), 'champion (Venusaur)': G.League.championTeam(1), 'champion (Blastoise)': G.League.championTeam(7) };
  const table = {};
  for (const [name, foe] of Object.entries(FOES)) {
    table[name] = { 'charizard team 55': fight(foe, CHARIZARD(55)), 'venusaur team 55': fight(foe, VENUSAUR(55)), 'charizard team 58': fight(foe, CHARIZARD(58)) };
  }
  console.log('[balance] vs the Elite Four:', JSON.stringify(table));
  // Each member alone, with a fresh team (in the League they come one after another, and a player
  // heals with items in between; the auto-player never does, nor switches).
  for (const id of ['lorelei', 'bruno', 'agatha']) assert.ok(table[id]['charizard team 55'] >= 0.8, id);
  assert.ok(table.lance['charizard team 55'] >= 0.5, 'Lance');
  assert.ok(table['champion (Venusaur)']['charizard team 58'] >= 0.6 && table['champion (Blastoise)']['charizard team 58'] >= 0.6, 'the Champion');
  assert.ok(table['champion (Venusaur)']['charizard team 55'] < table['champion (Venusaur)']['charizard team 58'], 'levels matter');
  // The rematches (chapter 10): every team ten levels up, against a team of the same ten levels more.
  const again = {
    lance: fight(member('lance-room', 'lance2'), CHARIZARD(65)),
    'champion (Venusaur)': fight(G.League.championTeam(1, true), CHARIZARD(68)),
    'champion (Blastoise)': fight(G.League.championTeam(7, true), CHARIZARD(68))
  };
  console.log('[balance] the rematches:', JSON.stringify(again));
  assert.ok(again.lance >= 0.5 && again['champion (Venusaur)'] >= 0.5 && again['champion (Blastoise)'] >= 0.5, 'the rematches');
});

test('balance: Falkner (chapter 11), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'violet-gym', 'falkner');
  const table = {
    'chikorita 13': rate([[152, 13]]),
    'cyndaquil 13': rate([[155, 13]]),
    'totodile 13': rate([[158, 13]]),
    'cyndaquil 12 + pidgey 9': rate([[155, 12], [16, 9]]),
    'chikorita 15 + hoothoot 11': rate([[152, 15], [163, 11]])
  };
  console.log('[balance] vs Falkner:', JSON.stringify(table));
  // Pidgey 7 and Pidgeotto 11 (Mud-Slap lowers accuracy): the wild Pokémon before Violet City are
  // Lv. 2 to 6, so a starter around Lv. 13 wins. Gust hits Chikorita hard: it needs a few more
  // levels and a friend, as in the games.
  assert.ok(table['cyndaquil 13'] >= 0.7 && table['totodile 13'] >= 0.5, 'Cyndaquil and Totodile');
  assert.ok(table['chikorita 15 + hoothoot 11'] >= 0.5, 'Chikorita with a Hoothoot');
  assert.ok(table['chikorita 13'] < 0.3, 'a lone Chikorita should struggle');
});

test('balance: Bugsy and the thief in Azalea (chapter 12), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'azalea-gym', 'bugsy');
  const table = {
    'bayleef 18': rate([[153, 18]]),
    'quilava 17': rate([[156, 17]]),
    'croconaw 18': rate([[159, 18]]),
    'bayleef 18 + geodude 15': rate([[153, 18], [74, 15]]),
    'croconaw 18 + geodude 15': rate([[159, 18], [74, 15]]),
    'bayleef 18 + pidgeotto 17': rate([[153, 18], [17, 17]])
  };
  console.log('[balance] vs Bugsy:', JSON.stringify(table));
  // Metapod and Kakuna only stall; Scyther 15 (Fury Cutter doubles up to 160) is the wall. Quilava
  // burns through; Bayleef and Croconaw need a Rock or Flying type from the way (Union Cave's
  // Geodude, a Pidgeotto), as in the games.
  assert.ok(table['quilava 17'] >= 0.8, 'Quilava');
  assert.ok(table['croconaw 18 + geodude 15'] >= 0.5, 'Croconaw with a Geodude');
  assert.ok(table['bayleef 18 + geodude 15'] >= 0.7 && table['bayleef 18 + pidgeotto 17'] >= 0.6, 'Bayleef with a friend');
  assert.ok(table['bayleef 18'] < 0.2, 'a lone Bayleef should struggle');
  // The thief at the Gym's door: Gastly 12, Zubat 14 and his starter, evolved, at 16.
  const thief = (mine, his) => {
    let wins = 0;
    for (let s = 1; s <= 40; s++) {
      const rng = G.RNG(s * 23);
      const me = mine.map(([sp, lvl]) => G.Mon.create(sp, lvl, { rng }));
      const foes = [[92, 12], [41, 14], [his, 16]].map(([sp, lvl]) => G.Mon.create(sp, lvl, { rng }));
      const b = G.Battle.create({ kind: 'trainer', seed: s, player: { name: 'Red', party: me, bag: {} },
        foe: { party: foes, trainer: { id: 'rival2-azalea', name: 'Silver', ai: 'basic', items: {}, prize: 40 } } });
      b.start();
      if ((autoplay(G, b) || {}).outcome === 'win') wins++;
    }
    return wins / 40;
  };
  const rival = {
    'quilava 18 vs croconaw': thief([[156, 18]], 159), 'quilava 18 + flaaffy 16 vs croconaw': thief([[156, 18], [180, 16]], 159),
    'croconaw 18 vs bayleef': thief([[159, 18]], 153), 'croconaw 18 + pidgeotto 17 vs bayleef': thief([[159, 18], [17, 17]], 153),
    'bayleef 18 vs quilava': thief([[153, 18]], 156), 'bayleef 18 + geodude 15 vs quilava': thief([[153, 18], [74, 15]], 156)
  };
  console.log('[balance] vs the thief in Azalea:', JSON.stringify(rival));
  // He took the starter strong against yours: alone it rarely wins (losing is allowed), with a
  // friend caught on the way it does.
  for (const k of Object.keys(rival).filter(k => k.includes('+'))) assert.ok(rival[k] >= 0.5, k);
});

test('balance: Whitney in Goldenrod (chapter 13), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'goldenrod-gym', 'whitney');
  const table = {
    'quilava 24': rate([[156, 24]]),
    'bayleef 24': rate([[153, 24]]),
    'croconaw 24': rate([[159, 24]]),
    'quilava 22 + geodude 18': rate([[156, 22], [74, 18]]),
    'bayleef 24 + geodude 20': rate([[153, 24], [74, 20]]),
    'croconaw 24 + geodude 20': rate([[159, 24], [74, 20]]),
    'bayleef 24 + pidgeotto 20 + geodude 20': rate([[153, 24], [17, 20], [74, 20]])
  };
  console.log('[balance] vs Whitney:', JSON.stringify(table));
  // Miltank is the wall: Rollout rolls on and doubles, Attract stops a Pokémon of the other gender,
  // Milk Drink heals. A Rock type (Geodude from Union Cave) takes Rollout and Stomp well.
  assert.ok(table['quilava 24'] >= 0.4, 'Quilava');
  assert.ok(table['quilava 22 + geodude 18'] >= 0.35, 'Quilava with a Geodude');
  assert.ok(table['bayleef 24 + geodude 20'] >= 0.6, 'Bayleef with a Geodude');
  assert.ok(table['croconaw 24 + geodude 20'] >= 0.4, 'Croconaw with a Geodude');
});

test('balance: Morty in Ecruteak (chapter 14), win rates of typical teams are printed', () => {
  const { G } = world(1);
  const rate = leaderRate(G, 'ecruteak-gym', 'morty');
  const table = {
    'quilava 28': rate([[156, 28]]),
    'croconaw 28': rate([[159, 28]]),
    'bayleef 28': rate([[153, 28]]),
    'quilava 28 + eevee 24 + geodude 24': rate([[156, 28], [133, 24], [74, 24]]),
    'bayleef 28 + eevee 24 + pidgeotto 26': rate([[153, 28], [133, 24], [17, 26]]),
    'croconaw 28 + umbreon 24 + flaaffy 24': rate([[159, 28], [197, 24], [180, 24]]),
    'bayleef 28 + espeon 24': rate([[153, 28], [196, 24]])
  };
  console.log('[balance] vs Morty:', JSON.stringify(table));
  // Four Ghost types that put you to sleep, confuse and curse you: one Pokémon alone rarely gets
  // through all four without healing. Grass moves do little to Ghost and Poison (Bayleef).
  assert.ok(table['quilava 28 + eevee 24 + geodude 24'] >= 0.35, 'Quilava, Eevee and Geodude');
  assert.ok(table['bayleef 28 + eevee 24 + pidgeotto 26'] >= 0.5, 'Bayleef, Eevee and Pidgeotto');
  assert.ok(table['croconaw 28 + umbreon 24 + flaaffy 24'] >= 0.6, 'Croconaw, Umbreon and Flaaffy');
  assert.ok(table['bayleef 28 + espeon 24'] >= 0.5, 'Bayleef and Espeon');
});

test('balance: Chuck and Jasmine (chapter 15), win rates of typical teams are printed', () => {
  const { G } = world(1);
  // Moves a player would have by now (TM35 Flamethrower from Ilex Forest, HM03 Surf, TM28 Dig).
  const TY = ['flamethrower', 'flame-wheel', 'swift', 'quick-attack'], FE = ['surf', 'crunch', 'ice-fang', 'agility'];
  const ME = ['razor-leaf', 'body-slam', 'poison-powder', 'reflect'], GR = ['dig', 'rock-throw', 'defense-curl', 'rollout'];
  const chuck = leaderRate(G, 'cianwood-gym', 'chuck'), jasmine = leaderRate(G, 'olivine-gym', 'jasmine');
  const c = {
    'typhlosion 32': chuck([[157, 32, TY]]),
    'feraligatr 32': chuck([[160, 32, FE]]),
    'meganium 32': chuck([[154, 32, ME]]),
    'typhlosion 32 + espeon 28': chuck([[157, 32, TY], [196, 28]]),
    'feraligatr 32 + umbreon 28': chuck([[160, 32, FE], [197, 28]]),
    'meganium 32 + pidgeotto 30': chuck([[154, 32, ME], [17, 30]])
  };
  const j = {
    'typhlosion 32': jasmine([[157, 32, TY]]),
    'feraligatr 32': jasmine([[160, 32, FE]]),
    'meganium 32': jasmine([[154, 32, ME]]),
    'feraligatr 32 + graveler 28': jasmine([[160, 32, FE], [75, 28, GR]]),
    'meganium 32 + flareon 28': jasmine([[154, 32, ME], [136, 28]])
  };
  console.log('[balance] vs Chuck:', JSON.stringify(c));
  console.log('[balance] vs Jasmine:', JSON.stringify(j));
  // Chuck's Poliwrath (Hypnosis, Surf, Mind Reader and Dynamic Punch) stops a lone Typhlosion;
  // Psychic and Flying types turn it around. Jasmine's Steel types shrug off Grass moves.
  assert.ok(c['meganium 32'] >= 0.5, 'Meganium vs Chuck');
  assert.ok(c['typhlosion 32 + espeon 28'] >= 0.8, 'Typhlosion and Espeon vs Chuck');
  assert.ok(c['meganium 32 + pidgeotto 30'] >= 0.8, 'Meganium and Pidgeotto vs Chuck');
  assert.ok(c['feraligatr 32 + umbreon 28'] >= 0.3, 'Feraligatr and Umbreon vs Chuck');
  assert.ok(j['typhlosion 32'] >= 0.8, 'Typhlosion vs Jasmine');
  assert.ok(j['feraligatr 32'] >= 0.5, 'Feraligatr vs Jasmine');
  assert.ok(j['meganium 32 + flareon 28'] >= 0.3, 'Meganium and Flareon vs Jasmine');
});

/** Chapter 3 after chapter 2: Nugget Bridge, Bill, the thief, the S.S. Anne, Cut, Lt. Surge. */
async function chapter3(st) {
  const { G, S, W } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  // Nugget Bridge: the rival, five Trainers, then the recruiter.
  W.player = { x: 8, y: 23, dir: 'up' };
  F.healAll();
  await run(st, 'route24', 'route24.rival');
  assert.ok(F.flag('route24-rival'));
  W.player = { x: 8, y: 10, dir: 'up' };
  await run(st, 'route24', 'route24.recruiter');
  assert.match(st.log[st.log.length - 1], /five/i, 'the prize man wants all five beaten first');
  for (const id of ['cale', 'ali', 'timmy', 'reli', 'ethan']) await fight('route24', id);
  F.healAll();
  await run(st, 'route24', 'route24.recruiter', [0]);
  assert.equal(F.count('nugget'), 1);
  assert.ok(F.isDone('route24:recruiter'), 'the recruiter was beaten');
  for (const t of G.Maps.get('route25').trainers) await fight('route25', t.id);
  // Bill: the Clefairy, the machine, the S.S. Ticket.
  W.player = { x: 4, y: 3, dir: 'up' };
  await run(st, 'bill-house', 'bill.machine');
  assert.ok(!F.flag('bill-saved'), 'the machine does nothing before Bill asks');
  await run(st, 'bill-house', 'bill.clefairy');
  await run(st, 'bill-house', 'bill.machine');
  assert.ok(F.flag('bill-saved') && F.count('ss-ticket') === 1);
  // The thief in Cerulean: TM28, and the road south opens.
  await fight('cerulean-house', 'burglar');
  assert.ok(F.flag('caught-burglar') && F.count('tm28') === 1);
  for (const t of G.Maps.get('route6').trainers) await fight('route6', t.id);
  // The S.S. Anne.
  for (const id of ['trevor', 'ann', 'arthur']) await fight('ssanne-1f', id);
  for (const id of ['leonard', 'tyler']) await fight('ssanne-2f', id);
  W.player = { x: 7, y: 5, dir: 'right' };
  F.healAll();
  await run(st, 'ssanne-2f', 'ssanne.rival');
  await run(st, 'ssanne-2f', 'ssanne.captain', [0]);
  assert.ok(F.flag('got-hm01') && F.count('hm01') === 1);
  await run(st, 'vermilion-harbor', 'vermilion.harbor-enter');
  assert.ok(F.flag('ss-anne-left'), 'the ship sailed');
  // Cut, taught from the bag to a Pokémon that can learn it.
  const cutter = S.party.find(m => G.FieldItems.tmFor(m, 'hm01') === 'able');
  assert.ok(cutter, 'someone can learn Cut');
  // In place of its weakest move, as a player would (Poison Powder rather than Leech Life).
  const pow = m => G.MOVES[m.id].pow || 0;
  const weakest = cutter.moves.reduce((j, m, i, all) => pow(m) < pow(all[j]) ? i : j, 0);
  G.Mon.learn(cutter, 'cut', cutter.moves.length < 4 ? undefined : weakest);
  assert.ok(G.Mon.knows(cutter, 'cut'));
  // Lt. Surge's switches: a wrong can, the first, a wrong neighbour (reset), then both.
  const can = i => [[2, 4, 6, 8, 10][i % 5], [8, 10, 12][Math.floor(i / 5)]];
  await run(st, 'vermilion-gym', 'surge.enter');
  const first = F.getVar('surge-first');
  const [wx, wy] = can((first + 7) % 15);
  await run(st, 'vermilion-gym', 'surge.can', [], { x: wx, y: wy });
  assert.ok(!F.getVar('surge-found'));
  let [fx, fy] = can(F.getVar('surge-first'));
  await run(st, 'vermilion-gym', 'surge.can', [], { x: fx, y: fy });
  assert.equal(F.getVar('surge-found'), 1);
  const second = F.getVar('surge-second');
  const [sx, sy] = can(second);
  assert.equal(Math.abs(sx - fx) + Math.abs(sy - fy), 2, 'the second switch is next to the first');
  [fx, fy] = can(F.getVar('surge-first'));
  await run(st, 'vermilion-gym', 'surge.can', [], { x: fx, y: fy });     // the same can again: wrong, resets
  assert.ok(!F.getVar('surge-found') && !F.flag('surge-locks-open'));
  [fx, fy] = can(F.getVar('surge-first'));
  await run(st, 'vermilion-gym', 'surge.can', [], { x: fx, y: fy });
  const [tx, ty] = can(F.getVar('surge-second'));
  await run(st, 'vermilion-gym', 'surge.can', [], { x: tx, y: ty });
  assert.ok(F.flag('surge-locks-open'), 'the barrier is down');
  // The trainers and Lt. Surge, with Paras (Grass takes Electric moves well) in front.
  lead(st, 46);
  grind(st, 'route6', 26, 150);
  for (const id of ['baily', 'dwayne', 'tucker']) await fight('vermilion-gym', id);
  F.healAll();
  const before = S.player.money;
  await run(st, 'vermilion-gym', [['battle', 'vermilion-gym:surge']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.outcome, 'win', 'Lt. Surge beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1, 2, 3]);
  assert.equal(F.count('tm34'), 1);
  assert.equal(S.player.money - before, 2400);
  assert.ok(F.flag('chapter-3-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

test('chapter 3: Nugget Bridge, Bill, the thief, the S.S. Anne, Cut and the Thunder Badge', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
});

/** Chapter 4 after chapter 3: Diglett's Cave and Flash, Rock Tunnel, Lavender Town, Celadon City, Erika. */
async function chapter4(st) {
  const { G, S, W } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  // Route 11, Diglett's Cave and Oak's aide on Route 2 (ten kinds caught for HM05 Flash).
  await all('route11');
  const caught = () => Object.values(S.dex.caught).filter(Boolean).length;
  if (caught() < 10) {
    await run(st, 'route2-house', 'route2.aide');
    assert.match(st.log[st.log.length - 1], /ten/, 'the aide waits for ten kinds');
    assert.ok(!F.flag('got-hm05'));
    // A few more catches along the way (Route 11 and Diglett's Cave).
    for (const sp of [23, 27, 50, 21, 96, 19, 16, 10, 13, 41]) { if (caught() >= 10) break; S.dex.seen[sp] = 1; S.dex.caught[sp] = 1; }
  }
  await run(st, 'route2-house', 'route2.aide');
  assert.ok(F.flag('got-hm05') && F.count('hm05') === 1);
  // Route 9, Route 10, Rock Tunnel (dark: the auto-player feels its way through).
  assert.ok(G.Maps.get('rocktunnel-1f').def.dark && G.Maps.get('rocktunnel-b1f').def.dark);
  for (const id of ['route9', 'route10', 'rocktunnel-1f', 'rocktunnel-b1f']) await all(id);
  // Lavender Town: the rival on the tower's second floor; the stairs up stay blocked.
  W.player = { x: 4, y: 3, dir: 'left' };
  F.healAll();
  await run(st, 'tower-2f', 'tower.rival');
  assert.ok(F.flag('tower-rival'));
  assert.equal(st.battles[st.battles.length - 1].key, 'tower-2f:rival-tower');
  await run(st, 'tower-2f', 'tower.upstairs');
  // Route 8, the Underground Path, Celadon City.
  await all('route8');
  await run(st, 'route8', 'celadon.saffron-gate');
  // The Eevee on Celadon Mansion's roof, and a Fire Stone from the Department Store.
  await run(st, 'mansion-roof', 'celadon.eevee', [0]);
  assert.ok(F.flag('got-eevee') && F.isDone('mansion-roof:eevee'));
  const eevee = S.party.find(m => m.sp === 133);
  assert.ok(eevee && eevee.lvl === 25, 'Eevee joined the party');
  F.money(-2100); F.giveItem('fire-stone', 1);
  const use = G.FieldItems.use('fire-stone', eevee);
  assert.equal(use.evolve, 136, 'a Fire Stone makes Flareon');
  F.takeItem('fire-stone', 1);
  for (const id of G.Evolution.evolve(eevee, use.evolve)) if (eevee.moves.length < 4) G.Mon.learn(eevee, id);
  // A drink for the girl on the roof: a TM.
  F.money(-200); F.giveItem('fresh-water', 1);
  await run(st, 'dept-roof', 'dept.roof-girl', [0]);
  assert.equal(F.count('tm16'), 1);
  assert.equal(F.count('fresh-water'), 0);
  // Erika's Gym (behind a small tree Cut clears): the Trainers, then Erika with Parasect in front.
  lead(st, 47);
  grind(st, 'route8', 31, 200);
  await all('celadon-gym');
  F.healAll();
  const before = S.player.money;
  await run(st, 'celadon-gym', [['battle', 'celadon-gym:erika']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.outcome, 'win', 'Erika beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1, 2, 3, 4]);
  assert.equal(F.count('tm19'), 1);
  assert.equal(S.player.money - before, 2700);
  assert.ok(F.flag('chapter-4-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 5 after chapter 4: the Rocket Hideout, the Pokémon Tower, Snorlax, Fuchsia City and Koga. */
async function chapter5(st) {
  const { G, S, W } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const won = () => assert.equal(st.battles[st.battles.length - 1].outcome, 'win', st.battles[st.battles.length - 1].key);
  // The Game Corner: the Grunt by the poster, then the switch behind it.
  const stairs = G.Maps.get('celadon-gamecorner').warps.find(w => w.to === 'hideout-b1f');
  assert.ok(!F.test(stairs.if), 'the stairs are hidden at first');
  await fight('celadon-gamecorner', 'grunt');
  won();
  await run(st, 'celadon-gamecorner', 'gamecorner.poster', [0]);
  assert.ok(F.flag('hideout-switch') && F.test(stairs.if), 'the switch opens the stairs');
  // The Rocket Hideout: B1F to B3F, the Lift Key on B4F, the lift down to the Boss.
  for (const id of ['hideout-b1f', 'hideout-b2f', 'hideout-b3f']) await all(id);
  await fight('hideout-b4f', 'keyholder');
  assert.equal(F.count('lift-key'), 1, 'the Grunt drops the Lift Key');
  await run(st, 'hideout-b4f', 'hideout.lift-b4f');
  assert.equal(W.map, 'hideout-lift');
  await run(st, 'hideout-lift', 'hideout.lift-panel', [2]);
  assert.equal(F.getVar('hideout-lift'), 'hideout-b4f');
  await run(st, 'hideout-lift', 'hideout.lift-exit');
  assert.equal(W.map, 'hideout-b4f', 'the lift goes down to B4F');
  for (const id of ['guard1', 'guard2', 'giovanni']) { await fight('hideout-b4f', id); won(); }
  assert.ok(F.flag('hideout-boss') && F.count('silph-scope') === 1, 'Giovanni leaves the Silph Scope');
  // The Pokémon Tower: the Silph Scope opens the stairs on 2F.
  const up = G.Maps.get('tower-2f').warps.find(w => w.to === 'tower-3f');
  assert.ok(F.test(up.if), 'the stairs up open with the Silph Scope');
  for (const id of ['tower-3f', 'tower-4f', 'tower-5f']) await all(id);
  await run(st, 'tower-5f', 'tower.purified');
  await all('tower-6f');
  F.healAll();
  await run(st, 'tower-6f', 'tower.marowak');
  assert.equal(st.battles[st.battles.length - 1].key, 'wild:marowak');
  assert.ok(F.flag('marowak-calm'), 'the spirit of Marowak is at peace');
  await all('tower-7f');
  await run(st, 'tower-7f', 'tower.fuji');
  assert.ok(F.flag('fuji-saved') && F.count('poke-flute') === 1, 'Mr. Fuji gives the Poké Flute');
  assert.equal(W.map, 'lavender-house');
  // Route 12: the Fishermen on the Silence Bridge, then Snorlax and the Poké Flute.
  await all('route12');
  F.healAll();
  await run(st, 'route12', 'route12.snorlax', [0]);
  assert.equal(st.battles[st.battles.length - 1].key, 'wild:snorlax');
  assert.ok(F.flag('route12-snorlax'), 'Snorlax leaves the road');
  // Routes 13 to 15, then Fuchsia City.
  for (const id of ['route13', 'route14', 'route15']) await all(id);
  // A Diglett from Diglett's Cave, grown into a Dugtrio, leads against Koga (the guide says Ground).
  const dug = F.giveMon('dugtrio', 31);
  S.dex.seen[51] = 1; S.dex.caught[51] = 1;
  lead(st, 51);
  grind(st, 'route15', 37, 200);
  assert.equal(S.party[0], dug);
  await all('fuchsia-gym');
  F.healAll();
  const before = S.player.money;
  await run(st, 'fuchsia-gym', [['battle', 'fuchsia-gym:koga']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.outcome, 'win', 'Koga beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1, 2, 3, 4, 5]);
  assert.equal(F.count('tm06'), 1);
  assert.equal(S.player.money - before, 3700);
  assert.ok(F.flag('chapter-5-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 6 after chapter 5: the Safari Zone (Surf and Strength), Saffron City, Silph Co., Sabrina. */
async function chapter6(st) {
  const { G, S, W } = st;
  const F = G.Field;
  // The Safari Zone: ₽500 for 30 Safari Balls and 600 steps.
  const money = S.player.money;
  await run(st, 'safari-gate', 'safari.attendant', [0]);
  assert.ok(F.flag('safari-on'), 'a Safari Game is on');
  assert.equal(S.player.money, money - 500);
  assert.equal(F.count('safari-ball'), 30);
  assert.equal(F.getVar('safari-steps'), 600);
  assert.equal(W.map, 'safari-center');
  // A Safari battle: Safari Balls until it is caught, flees or the balls run out.
  const rng = G.RNG(W.seed * 11);
  const b = G.Safari.create({ seed: 7, player: { name: S.player.name, id: S.player.id, party: S.party, bag: S.bag },
                              foe: { party: [G.Mon.create(115, 25, { rng, wild: true })] } });
  b.start();
  while (!b.result) b.act({ type: 'ball' });
  assert.ok(['caught', 'fled', 'run'].includes(b.result.outcome));
  assert.ok(F.count('safari-ball') < 30, 'Safari Balls were thrown');
  // The west area: the Gold Teeth by the water, the Secret House and HM03 Surf.
  await run(st, 'safari-west', [['found', 'gold-teeth', 1, 'safari-west:gold-teeth']]);
  await run(st, 'safari-house', 'safari.secret-house');
  assert.ok(F.flag('got-hm03') && F.count('hm03') === 1, 'HM03 Surf');
  // Time is up: back at the gate, the Safari Balls go back.
  await run(st, 'safari-center', 'safari.timeup');
  assert.ok(!F.flag('safari-on') && F.count('safari-ball') === 0);
  assert.equal(W.map, 'safari-gate');
  // The warden gets his teeth back and gives HM04 Strength.
  await run(st, 'warden-house', 'fuchsia.warden');
  assert.ok(F.flag('got-hm04') && F.count('hm04') === 1 && F.count('gold-teeth') === 0, 'HM04 Strength');
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const won = () => assert.equal(st.battles[st.battles.length - 1].outcome, 'win', st.battles[st.battles.length - 1].key);
  // Saffron City: a drink from the Celadon rooftop for the thirsty guard opens every gate.
  await run(st, 'route8', 'celadon.saffron-gate');
  assert.ok(!F.flag('saffron-open'), 'no drink, no entry');
  F.money(-200); F.giveItem('soda-pop', 1);
  await run(st, 'route8', 'celadon.saffron-gate', [0]);
  assert.ok(F.flag('saffron-open') && F.count('soda-pop') === 0, 'the guard took the drink');
  assert.ok(F.test(G.Maps.get('route7').warps.find(w => w.to === 'saffron-gate-west').if), 'the west gate is open too');
  // The Fighting Dojo, then one of the master's Pokémon.
  await all('saffron-dojo');
  won();
  await run(st, 'saffron-dojo', 'dojo.chan', [0]);
  await run(st, 'saffron-dojo', 'dojo.lee');
  assert.ok(F.flag('got-hitmonchan') && !F.flag('got-hitmonlee'), 'only one of the two');
  await run(st, 'saffron-psychic', 'saffron.mr-psychic');
  assert.equal(F.count('tm29'), 1);
  // Silph Co.: the floors, the Card Key on 5F, the rival on 7F, Lapras, the lift, Giovanni.
  lead(st, 47);
  for (let n = 2; n <= 10; n++) await all('silph-' + n + 'f');
  await run(st, 'silph-5f', [['found', 'card-key', 1, 'silph-5f:card-key']]);
  assert.equal(F.count('card-key'), 1);
  W.player = { x: 5, y: 3, dir: 'right' };
  F.healAll();
  await run(st, 'silph-7f', 'silph.rival');
  assert.ok(F.flag('silph-rival'));
  assert.equal(st.battles[st.battles.length - 1].key, 'silph-7f:rival-silph');
  won();
  await run(st, 'silph-7f', 'silph.lapras');
  assert.ok(F.flag('got-lapras') && (S.party.concat(...S.boxes).some(m => m && m.sp === 131)), 'Lapras joined');
  await run(st, 'silph-9f', 'silph.nurse');
  await run(st, 'silph-9f', 'silph.lift-9f');
  await run(st, 'silph-lift', 'silph.lift-panel', [5]);
  await run(st, 'silph-lift', 'silph.lift-exit');
  assert.equal(W.map, 'silph-11f', 'the lift goes up to 11F');
  await fight('silph-11f', 'grunt1');
  F.setFlag('door:silph-11f:8,6');                     // the Card Key opens the boardroom (field.js)
  await fight('silph-11f', 'giovanni');
  won();
  assert.ok(F.flag('silph-cleared'), 'Team Rocket leaves Silph Co.');
  await run(st, 'silph-11f', 'silph.president');
  assert.ok(F.flag('got-master-ball') && F.count('master-ball') === 1, 'the Master Ball');
  // Sabrina's Gym: the Psychics and Channelers, then Sabrina: a Parasect (Bug) in front, a Dugtrio behind.
  lead(st, 51);
  grind(st, 'route15', 50, 400);
  lead(st, 47);
  grind(st, 'route15', 52, 200);
  await all('saffron-gym');
  F.healAll();
  const before = S.player.money;
  await run(st, 'saffron-gym', [['battle', 'saffron-gym:sabrina']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.outcome, 'win', 'Sabrina beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1, 2, 3, 4, 5, 6]);
  assert.equal(F.count('tm04'), 1);
  assert.equal(S.player.money - before, 3900);
  assert.ok(F.flag('chapter-6-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 7 after chapter 6: the rods, the sea routes, Cinnabar's lab, the Pokémon Mansion, Blaine. */
async function chapter7(st) {
  const { G, S } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const won = () => assert.equal(st.battles[st.battles.length - 1].outcome, 'win', st.battles[st.battles.length - 1].key);
  const has = sp => S.party.concat(...S.boxes).some(m => m && m.sp === sp && m.lvl === 30);
  // The rods: Vermilion's old fisherman, Fuchsia's fisherman, the angler by the Silence Bridge.
  await run(st, 'vermilion', 'vermilion.old-rod', [0]);
  await run(st, 'fuchsia', 'fuchsia.good-rod', [0]);
  await run(st, 'route12', 'route12.super-rod', [1]);
  assert.ok(!F.flag('got-super-rod'), 'no Super Rod for someone who does not love fishing');
  await run(st, 'route12', 'route12.super-rod', [0]);
  for (const rod of ['old-rod', 'good-rod', 'super-rod']) assert.equal(F.count(rod), 1, rod);
  assert.ok(G.Maps.encounters(G.Maps.get('vermilion'), 'super-rod'), 'Vermilion has fish to catch');
  // The Pewter Museum gives the Old Amber.
  await run(st, 'pewter-museum', 'pewter.old-amber');
  assert.equal(F.count('old-amber'), 1);
  // Surf the sea routes (Wartortle learns it from HM03): their Swimmers, Fishermen and the
  // Trainers on the sandbanks; Parasect leads.
  const weakest = mon => mon.moves.reduce((w, m, j) => ((G.MOVES[m.id].pow || 0) < (G.MOVES[mon.moves[w].id].pow || 0) ? j : w), 0);
  const wartortle = S.party.find(m => m.sp === 8);
  G.Mon.learn(wartortle, 'surf', weakest(wartortle));
  assert.ok(G.Mon.knows(wartortle, 'surf'));
  lead(st, 47);
  for (const m of ['route19', 'route20', 'route21']) { await all(m); won(); }
  // Cinnabar Island: the Gym is locked.
  const door = G.Maps.get('cinnabar').warps.find(w => w.to === 'cinnabar-gym');
  assert.ok(!F.test(door.if), 'no key, no Gym');
  // The Pokémon Lab: the Helix Fossil from Mt. Moon, then the Old Amber; each one after a walk outside.
  await run(st, 'cinnabar-lab', 'cinnabar.fossil', [0]);
  assert.ok(F.flag('fossil-waiting') && F.count('helix-fossil') === 0);
  await run(st, 'cinnabar-lab', 'cinnabar.fossil');
  assert.ok(!has(138), 'not ready before you leave the lab');
  await run(st, 'cinnabar-lab', 'cinnabar.lab-enter');
  await run(st, 'cinnabar-lab', 'cinnabar.fossil');
  assert.ok(has(138) && !F.flag('fossil-waiting'), 'Omanyte Lv. 30');
  await run(st, 'cinnabar-lab', 'cinnabar.fossil', [0]);
  await run(st, 'cinnabar-lab', 'cinnabar.lab-enter');
  await run(st, 'cinnabar-lab', 'cinnabar.fossil');
  assert.ok(has(142) && F.count('old-amber') === 0, 'Aerodactyl Lv. 30');
  // The Pokémon Mansion: its Trainers, the switches, and the Secret Key behind the basement gate.
  for (const m of ['pokemon-mansion-1f', 'pokemon-mansion-2f', 'pokemon-mansion-3f', 'pokemon-mansion-b1f']) await all(m);
  won();
  const gate = (m, i = 0) => F.test(G.Maps.get(m).def.bars[i].if);
  assert.ok(gate('pokemon-mansion-2f') && !gate('pokemon-mansion-3f'), 'switch off: the stairs to 3F open, the hole closed');
  await run(st, 'pokemon-mansion-3f', 'mansion.switch', [0]);
  assert.ok(gate('pokemon-mansion-3f') && gate('pokemon-mansion-1f') && !gate('pokemon-mansion-b1f'), 'switch on');
  await run(st, 'pokemon-mansion-b1f', 'mansion.switch', [0]);
  assert.ok(gate('pokemon-mansion-b1f'), 'switch off again: the key room opens');
  await run(st, 'pokemon-mansion-b1f', [['found', 'secret-key', 1, 'pokemon-mansion-b1f:mansion-b1f-secretkey']]);
  assert.ok(F.test(door.if), 'the Secret Key opens the Gym');
  // Blaine's Gym: two quizzes answered wrong (their Trainers battle), three right. Dugtrio
  // learns Dig (TM28, from the Cerulean thief) and leads.
  const dugtrio = S.party.find(m => m.sp === 51);
  assert.equal(F.count('tm28'), 1);
  G.Mon.learn(dugtrio, 'dig', weakest(dugtrio));
  lead(st, 51);
  grind(st, 'route21', 54, 300);
  const before = st.battles.length;
  for (const [n, answer] of [[1, 0], [2, 0], [3, 0], [4, 1], [5, 0]]) { F.healAll(); await run(st, 'cinnabar-gym', 'blaine.q' + n, [answer]); }
  for (let n = 1; n <= 5; n++) assert.ok(F.flag('blaine-q' + n), 'gate ' + n + ' open');
  assert.deepEqual(st.battles.slice(before).map(b => b.key), ['cinnabar-gym:avery', 'cinnabar-gym:zac'], 'only wrong answers bring out a Trainer');
  F.healAll();
  const money = S.player.money;
  await run(st, 'cinnabar-gym', [['battle', 'cinnabar-gym:blaine']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.outcome, 'win', 'Blaine beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(F.count('tm38'), 1);
  assert.equal(S.player.money - money, 4300);
  assert.ok(F.flag('chapter-7-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 8 after chapter 7: the Bicycle, Routes 16 to 18, Fly, the Viridian Gym and Giovanni. */
async function chapter8(st) {
  const { G, S } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const won = () => assert.equal(st.battles[st.battles.length - 1].outcome, 'win', st.battles[st.battles.length - 1].key);
  // The Bicycle: a million at the Bike Shop, or the Fan Club chairman's voucher for listening to him.
  await run(st, 'cerulean-bikeshop', 'cerulean.bike-shop');
  assert.equal(F.count('bicycle'), 0, 'nobody has a million');
  await run(st, 'vermilion-fanclub', 'vermilion.chairman', [1]);
  assert.ok(!F.flag('got-bike-voucher'), 'no story, no voucher');
  await run(st, 'vermilion-fanclub', 'vermilion.chairman', [0]);
  assert.equal(F.count('bike-voucher'), 1);
  await run(st, 'cerulean-bikeshop', 'cerulean.bike-shop');
  assert.ok(F.count('bicycle') === 1 && F.count('bike-voucher') === 0, 'the voucher bought the Bicycle');
  // Route 16: the second Snorlax (the Poké Flute), the house behind the small tree and HM02 Fly.
  await run(st, 'route16', 'route16.snorlax', [0]);
  assert.ok(F.flag('route16-snorlax'));
  await run(st, 'route16-house', 'route16.fly-girl');
  assert.equal(F.count('hm02'), 1);
  // Cycling Road: its guards stop you only without a Bicycle; Fly lands in the towns.
  for (const gate of ['route16-gate', 'route18-gate']) assert.ok(!F.test(G.Maps.get(gate).triggers[0].if), gate);
  assert.ok(G.Maps.get('route17').def.bike && G.Maps.get('route17').def.slope === 'down');
  for (const town of ['pallet', 'viridian', 'pewter', 'cerulean', 'vermilion', 'lavender', 'celadon', 'fuchsia', 'saffron', 'cinnabar']) {
    const fly = G.Maps.get(town).def.fly;
    assert.ok(fly && F.test(fly.if), town + ' is a place to fly to');
  }
  // Their Bikers, Cue Balls and Bird Keepers; Parasect leads.
  lead(st, 47);
  for (const m of ['route16', 'route17', 'route18']) { await all(m); won(); }
  // The Viridian Gym opens with seven badges: eight Trainers, then Giovanni (Parasect leads).
  const door = G.Maps.get('viridian').warps.find(w => w.to === 'viridian-gym');
  assert.ok(F.test(door.if), 'seven badges open the Gym');
  await all('viridian-gym');
  won();
  F.healAll();
  const money = S.player.money;
  await run(st, 'viridian-gym', [['battle', 'viridian-gym:giovanni']]);
  const last = st.battles[st.battles.length - 1];
  assert.equal(last.outcome, 'win', 'Giovanni beaten at levels ' + last.levels);
  assert.deepEqual([...S.player.badges], [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(F.count('tm26'), 1);
  assert.equal(S.player.money - money, 5000);
  assert.ok(F.flag('giovanni-gym') && F.flag('giovanni-left'), 'he leaves the Gym');
  assert.ok(F.flag('chapter-8-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 9 after chapter 8: Route 22's rival, Victory Road, the Elite Four, the Champion, the Hall of Fame. */
async function chapter9(st) {
  const { G, S } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader' && t.cls !== 'elite-four')) await fight(mapId, t.id); };
  const last = () => st.battles[st.battles.length - 1];
  const won = () => assert.equal(last().outcome, 'win', last().key + ' at levels ' + last().levels);
  // Like a player before the League: raise the rest of the team on the routes (Wartortle, Flareon,
  // Kangaskhan), Parasect and Dugtrio lead the way.
  for (const sp of [8, 136, 115]) { lead(st, sp); grind(st, 'route18', 42, 400); grind(st, 'route23', 54, 600); }
  console.log('[story] before the League:', S.party.map(m => G.Maps.species(m.sp) + ' ' + m.lvl).join(', '));
  // Route 22: eight badges, and the rival waits in front of the League gate.
  lead(st, 47);
  F.healAll();
  await run(st, 'route22', 'route22.rival2');
  won();
  assert.equal(last().key, 'route22:rival-22b');
  assert.ok(F.flag('route22-rival2'));
  assert.ok(F.test(G.Maps.get('route22').warps.find(w => w.to === 'route22-gate').if), 'the gate opens with eight badges');
  // Victory Road: its Trainers, and the boulders (pushed in tests/field.test.cjs: here the flags).
  for (const m of ['victory-1f', 'victory-2f', 'victory-3f']) { await all(m); won(); }
  const barrier = m => F.test(G.Maps.get(m).def.bars[0].if);
  assert.ok(!barrier('victory-1f') && !barrier('victory-2f'), 'the barriers start closed');
  F.setFlag('plate:victory-1f:11,17');
  F.setFlag('pit:victory-3f:10,12');
  assert.ok(barrier('victory-1f') && barrier('victory-2f'), 'the switches open them');
  F.healAll();
  await run(st, 'victory-2f', 'victory.moltres');
  assert.ok(F.flag('victory-moltres'), 'Moltres was battled');
  // The Indigo Plateau: heal in the lobby, then the Elite Four one after another.
  await run(st, 'indigo-lobby', G.Maps.get('indigo-lobby').npcs.find(n => n.id === 'nurse').script, [0]);
  assert.deepEqual(plain(S.player.lastHeal), { map: 'indigo-lobby', spot: 'heal' });
  await run(st, 'lorelei-room', 'league.start');
  const LEADS = { lorelei: 136, bruno: 47, agatha: 51, lance: 47 };
  for (const id of ['lorelei', 'bruno', 'agatha', 'lance']) {
    lead(st, LEADS[id]);
    await fight(id + '-room', id);              // (healed first: a player uses items between the rooms)
    won();
    assert.ok(F.flag('e4-' + id), id + ' opens the door');
  }
  // The Champion, then Professor Oak and the Hall of Fame.
  lead(st, 47);
  F.healAll();
  const money = S.player.money;
  await run(st, 'champion-room', 'league.champion');
  assert.equal(last().key, 'champion-room:rival-champion');
  won();
  assert.ok(S.player.money > money, 'prize money');
  assert.ok(F.flag('champion') && F.flag('hall-of-fame') && F.flag('chapter-9-done'));
  assert.equal(S.fame.length, 1);
  assert.deepEqual(S.fame[0].party.map(m => m.sp), S.party.map(m => m.sp), 'the team is in the Hall of Fame');
  assert.equal(st.W.map, 'player-2f', 'home again');
  const back = G.Store.sanitize(JSON.parse(JSON.stringify(S)));
  assert.equal(back.fame.length, 1, 'the save keeps the Hall of Fame');
  // A new run through the League starts again with Lorelei.
  await run(st, 'lorelei-room', 'league.start');
  assert.ok(!F.flag('e4-lorelei') && !F.isDone('lorelei-room:lorelei') && !F.flag('e4-champion'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 10 after chapter 9: Oak's rating, the Power Plant, the Elite Four again, Cerulean Cave and Mewtwo. */
async function chapter10(st) {
  const { G, S } = st;
  const F = G.Field;
  const last = () => st.battles[st.battles.length - 1];
  const won = () => assert.equal(last().outcome, 'win', last().key + ' at levels ' + last().levels);
  // Professor Oak rates the Pokédex.
  await run(st, 'oak-lab', 'lab.oak');
  const caught = Object.keys(S.dex.caught).length;
  assert.ok(st.log.some(l => l.includes(String(caught)) && /kinds of Pokémon/.test(l)), 'Oak counts the Pokédex');
  assert.ok(!F.flag('diploma'));
  // Cerulean Cave opens for the Champion.
  assert.ok(!F.test(G.Maps.get('cerulean').npcs.find(n => n.id === 'cave-guard').if), 'the guard has stepped aside');
  // The Power Plant: an "item" that is a Voltorb, then Zapdos.
  await run(st, 'power-plant', 'plant.voltorb', [], { item: { key: 'power-plant:trap-1' } });
  assert.ok(F.isDone('power-plant:trap-1') && last().key === 'wild:voltorb', 'the trap jumped out');
  F.healAll();
  await run(st, 'power-plant', 'plant.zapdos');
  assert.ok(F.flag('plant-zapdos'), 'Zapdos was battled');
  // The Elite Four again: ten levels stronger now that you are the Champion. The team trains in
  // Cerulean Cave first, as a player would.
  for (const sp of [9, 136, 115, 51]) { lead(st, sp); grind(st, 'cave-1f', 64, 400); }
  console.log('[story] before the rematches:', S.party.map(m => G.Maps.species(m.sp) + ' ' + m.lvl).join(', '));
  await run(st, 'lorelei-room', 'league.start');
  const lorelei = G.Maps.get('lorelei-room').trainers;
  assert.ok(F.test(lorelei.find(t => t.id === 'lorelei2').if) && !F.test(lorelei.find(t => t.id === 'lorelei').if), 'the rematch team battles now');
  const LEADS = { lorelei: 136, bruno: 47, agatha: 51, lance: 47 };
  for (const id of ['lorelei', 'bruno', 'agatha', 'lance']) {
    lead(st, LEADS[id]);
    F.healAll();
    await run(st, id + '-room', [['battle', id + '-room:' + id + '2']]);
    won();
    assert.ok(F.flag('e4-' + id));
  }
  lead(st, 136);
  F.healAll();
  const fame = S.fame.length;
  await run(st, 'champion-room', 'league.champion');
  assert.equal(last().key, 'champion-room:rival-champion2');
  won();
  assert.equal(S.fame.length, fame + 1, 'the Hall of Fame again');
  assert.equal(st.W.map, 'player-2f');
  // Mewtwo, deep in Cerulean Cave: the end of the chapter.
  F.healAll();
  await run(st, 'cave-b1f', 'cave.mewtwo');
  assert.ok(F.flag('cave-mewtwo') && F.flag('chapter-10-done'), 'Mewtwo was battled at levels ' + last().levels);
  // A complete Pokédex earns the Diploma.
  for (let sp = 1; sp <= 150; sp++) S.dex.caught[sp] = 1;
  await run(st, 'oak-lab', 'lab.oak');
  assert.ok(F.flag('diploma'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 11 after chapter 10: to Johto, Professor Elm, the thief, the Mystery Egg, Sprout Tower and Falkner. */
async function chapter11(st) {
  const { G, S } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const last = () => st.battles[st.battles.length - 1];
  const won = () => assert.equal(last().outcome, 'win', last().key + ' at levels ' + last().levels);
  // South of the Indigo Plateau, Routes 26 and 27 lead to New Bark Town in Johto.
  assert.equal(G.Maps.get('indigo').def.connect.south.map, 'route26');
  assert.equal(G.Maps.get('route27').def.connect.west.map, 'new-bark');
  assert.equal(F.obeyCap('johto'), null, 'everybody obeys before the Johto journey begins');
  // Professor Elm: Johto's rule, and a starter (the party is full: it goes to the PC, and the
  // player swaps it for Magikarp at the lab's PC).
  await run(st, 'elm-lab', 'elm.elm');
  assert.ok(F.flag('elm-intro'));
  await run(st, 'elm-lab', 'elm.ball-cyndaquil', [0]);
  assert.ok(F.flag('johto-start'));
  assert.equal(S.rival2.starter, 158, 'the thief will take Totodile, strong against Cyndaquil');
  const box = S.boxes.find(b => b.some(m => m && m.sp === 155));
  const i = box.findIndex(m => m && m.sp === 155), k = S.party.findIndex(m => m.sp === 129);
  [box[i], S.party[k]] = [S.party[k], box[i]];
  assert.equal(F.obeyCap('johto'), 20, 'no Johto badge: up to Lv. 20');
  assert.equal(F.obeyCap(undefined), null, 'Kanto has no such rule');
  // Route 29, Cherrygrove City and Route 30 (Cyndaquil leads), then Mr. Pokémon and Oak.
  lead(st, 155);
  grind(st, 'route29', 8, 200);
  await all('route30');
  won();
  await run(st, 'mr-pokemon-house', 'mrpoke.talk');
  assert.ok(F.count('mystery-egg') === 1 && F.flag('johto-dex') && F.flag('johto-theft'));
  assert.ok(F.isDone('elm-lab:ball-totodile'), "the thief's ball is gone from the lab");
  // The thief at Cherrygrove's north entrance.
  F.healAll();
  await run(st, 'cherrygrove', 'cherrygrove.rival');
  assert.equal(last().key, 'cherrygrove:rival2-cherrygrove');
  assert.ok(F.flag('rival2-battle'));
  // Back at the lab: the officer asks his name, Elm gives the Egg back to hatch.
  await run(st, 'elm-lab', 'elm.enter');
  assert.ok(F.flag('rival2-named') && S.rival2.name === 'Silver');
  const balls = F.count('poke-ball');
  await run(st, 'elm-lab', 'elm.elm');
  assert.ok(F.flag('elm-egg') && S.vars['egg-steps'] === 800 && F.count('poke-ball') === balls + 5);
  S.vars['egg-steps'] = 0;
  await run(st, 'route29', 'egg.hatch');
  assert.ok(F.flag('egg-hatched') && !F.count('mystery-egg'));
  assert.ok(S.party.concat(...S.boxes).some(m => m && m.sp === 175), 'Togepi hatched');
  // Route 31, Sprout Tower and its Elder (TM27 Return).
  grind(st, 'route31', 15, 300);
  await all('route31');
  for (const m of ['sprout-2f', 'sprout-3f']) { await all(m); won(); }
  assert.equal(F.count('tm27'), 1, 'Elder Li gives TM27');
  // Falkner.
  await all('violet-gym');
  won();
  F.healAll();
  await run(st, 'violet-gym', [['battle', 'violet-gym:falkner']]);
  assert.equal(last().outcome, 'win', 'Falkner beaten at levels ' + last().levels);
  assert.ok(S.player.badges.includes(9) && F.count('tm40') === 1 && F.flag('chapter-11-done'));
  assert.equal(F.obeyCap('johto'), 25, 'the Zephyr Badge: up to Lv. 25');
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 12 after chapter 11: Route 32, Union Cave, Azalea Town, the Slowpoke Well, Bugsy and the thief. */
async function chapter12(st) {
  const { G, S } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const last = () => st.battles[st.battles.length - 1];
  const won = () => assert.equal(last().outcome, 'win', last().key + ' at levels ' + last().levels);
  // Violet City's road south: Route 32, Union Cave and Route 33 to Azalea Town.
  assert.equal(G.Maps.get('violet').def.connect.south.map, 'route32');
  assert.equal(G.Maps.get('route33').def.connect.west.map, 'azalea');
  const starter = S.party.find(m => m.sp >= 155 && m.sp <= 157);
  assert.ok(starter, 'the Johto starter is in the party');
  lead(st, starter.sp);
  grind(st, 'route32', 17, 300);
  for (const m of ['route32', 'union-cave-1f', 'route33']) { await all(m); won(); }
  // Azalea Town: the Gym is locked, a Grunt guards the well; Kurt goes down himself.
  assert.ok(!F.test('well-cleared'), 'the Gym is closed');
  await run(st, 'kurt-house', npc(st, 'kurt-house', 'kurt'));
  assert.ok(F.flag('kurt-well'));
  await run(st, 'slowpoke-well', npc(st, 'slowpoke-well', 'kurt'));
  // The Slowpoke Well: four Grunts, the last one in charge.
  await all('slowpoke-well');
  won();
  assert.ok(F.flag('well-cleared'), 'Team Rocket left the well');
  await run(st, 'kurt-house', npc(st, 'kurt-house', 'kurt2'));
  // Bugsy's Gym.
  grind(st, 'route33', 19, 300);
  await all('azalea-gym');
  won();
  F.healAll();
  await run(st, 'azalea-gym', [['battle', 'azalea-gym:bugsy']]);
  assert.equal(last().outcome, 'win', 'Bugsy beaten at levels ' + last().levels);
  assert.ok(S.player.badges.includes(10) && F.count('tm17') === 1 && F.flag('bugsy-beaten'));
  assert.equal(F.obeyCap('johto'), 30, 'the Hive Badge: up to Lv. 30');
  // The thief waits outside, and the chapter ends.
  F.healAll();
  await run(st, 'azalea', 'azalea.rival');
  assert.equal(last().key, 'azalea:rival2-azalea');
  assert.ok(F.flag('azalea-rival') && F.flag('chapter-12-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 13 after chapter 12: Ilex Forest, Route 34 and the Day Care, Goldenrod City and Whitney. */
async function chapter13(st) {
  const { G, S } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const last = () => st.battles[st.battles.length - 1];
  const won = () => assert.equal(last().outcome, 'win', last().key + ' at levels ' + last().levels);
  // Azalea Town's road west: Ilex Forest, Route 34 north to Goldenrod City.
  assert.equal(G.Maps.get('azalea').def.connect.west.map, 'ilex-forest');
  assert.equal(G.Maps.get('ilex-forest').def.connect.north.map, 'route34');
  assert.equal(G.Maps.get('route34').def.connect.north.map, 'goldenrod');
  const starter = S.party.find(m => m.sp >= 155 && m.sp <= 157);
  lead(st, starter.sp);
  // Ilex Forest: the lost Farfetch'd hops from place to place, the fourth time back to the apprentice.
  await run(st, 'ilex-forest', npc(st, 'ilex-forest', 'apprentice'));
  for (let i = 0; i < 3; i++) {
    assert.equal(+F.getVar('farfetchd') || 0, i);
    await run(st, 'ilex-forest', npc(st, 'ilex-forest', 'farfetchd' + i));
  }
  await run(st, 'ilex-forest', npc(st, 'ilex-forest', 'farfetchd3'));
  assert.equal(F.getVar('farfetchd'), 4, 'Farfetch\'d ran back');
  await run(st, 'ilex-forest', npc(st, 'ilex-forest', 'maker'));
  assert.ok(F.flag('charcoal-gift') && F.count('tm35') === 1, 'the charcoal maker gives TM35');
  // The tutor teaches Headbutt to the starter.
  st.picks.push(0);
  await run(st, 'ilex-forest', npc(st, 'ilex-forest', 'tutor'), [0]);
  assert.ok(G.Mon.knows(S.party[0], 'headbutt'), 'learned Headbutt');
  await all('ilex-forest');
  won();
  // Route 34: its Trainers, and the Day Care (leave one, walk, take it back).
  grind(st, 'route34', 21, 400);
  await all('route34');
  won();
  const n = S.party.length, left = S.party[n - 1];
  st.picks.push(n - 1);
  await run(st, 'daycare', npc(st, 'daycare', 'lady'), [0]);
  assert.equal(S.party.length, n - 1);
  assert.equal(G.DayCare.list()[0].mon, left);
  G.DayCare.step(300);
  const money = S.player.money, price = G.DayCare.price(0);
  await run(st, 'daycare', npc(st, 'daycare', 'lady'), [1, 0]);
  assert.equal(S.party.length, n, 'taken back');
  assert.equal(S.player.money, money - price, 'paid');
  // Goldenrod City: Bill gives an Eevee; the Name Rater looks at the starter's name.
  await run(st, 'bill-family', npc(st, 'bill-family', 'bill'), [0]);
  assert.ok(F.flag('bill-eevee') && S.dex.caught[133], 'Eevee from Bill');
  st.picks.push(0);
  await run(st, 'name-rater', npc(st, 'name-rater', 'rater'), [0, 0]);
  // Whitney's Gym.
  grind(st, 'route34', 24, 400);
  await all('goldenrod-gym');
  won();
  F.healAll();
  const tms = F.count('tm45');
  await run(st, 'goldenrod-gym', [['battle', 'goldenrod-gym:whitney']]);
  assert.equal(last().outcome, 'win', 'Whitney beaten at levels ' + last().levels);
  assert.ok(F.flag('whitney-cried') && !S.player.badges.includes(11), 'she cries before she gives the badge');
  await run(st, 'goldenrod-gym', G.Maps.get('goldenrod-gym').trainers.find(t => t.id === 'whitney').afterScript);
  assert.ok(S.player.badges.includes(11) && F.count('tm45') === tms + 1 && F.flag('whitney-beaten'));
  assert.equal(F.obeyCap('johto'), 35, 'the Plain Badge: up to Lv. 35');
  assert.ok(F.flag('chapter-13-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 14 after chapter 13: Route 35, the Bug-Catching Contest, Routes 36 and 37, Ecruteak City and Morty. */
async function chapter14(st) {
  const { G, S } = st;
  const F = G.Field, C = G.Contest;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const last = () => st.battles[st.battles.length - 1];
  const won = () => assert.equal(last().outcome, 'win', last().key + ' at levels ' + last().levels);
  // Goldenrod's road north, the park, Route 36 to Violet City, Route 37 to Ecruteak.
  assert.equal(G.Maps.get('goldenrod').def.connect.north.map, 'route35');
  assert.equal(G.Maps.get('national-park').def.connect.east.map, 'route36');
  assert.equal(G.Maps.get('route36').def.connect.east.map, 'violet');
  assert.equal(G.Maps.get('route37').def.connect.north.map, 'ecruteak');
  const starter = S.party.find(m => m.sp >= 155 && m.sp <= 157);
  lead(st, starter.sp);
  // The Flower Shop gives the Squirt Bottle (after the Plain Badge).
  await run(st, 'flower-shop', npc(st, 'flower-shop', 'florist'));
  assert.ok(F.count('squirt-bottle') === 1 && F.flag('got-squirt-bottle'));
  grind(st, 'route35', 26, 400);
  await all('route35');
  won();
  // The Bug-Catching Contest: join, catch a Scyther, and the time runs out.
  await run(st, 'national-park', npc(st, 'national-park', 'officer'), [0]);
  assert.ok(C.on() && st.W.map === 'contest-park', 'in the contest');
  assert.equal(C.entrant(), S.party[0]);
  const bug = G.Mon.create(123, 14, { rng: G.RNG(5), wild: true });
  await run(st, 'contest-park', 'contest.caught', [], { mon: bug });
  assert.equal(C.kept(), bug);
  const n = S.party.length + S.boxes.flat().filter(Boolean).length;
  await run(st, 'contest-park', 'contest.timeup');
  assert.ok(!C.on() && st.W.map === 'national-park', 'the contest is over');
  assert.equal(S.party.length + S.boxes.flat().filter(Boolean).length, n + 1, 'the Scyther is yours');
  assert.ok(F.count('sun-stone') + F.count('moon-stone') + F.count('hyper-potion') + F.count('super-potion') > 0, 'a prize');
  await run(st, 'national-park', npc(st, 'national-park', 'officer'), [0]);
  assert.ok(!C.on(), 'once a day');
  // Route 36: the strange tree is a Sudowoodo.
  await all('route36');
  won();
  await run(st, 'route36', npc(st, 'route36', 'sudowoodo'), [0]);
  assert.ok(F.flag('sudowoodo-gone'), 'the way north is open');
  await all('route37');
  won();
  // Ecruteak: the Gym is empty until the Burned Tower.
  assert.ok(!F.test('beasts-awake'));
  await run(st, 'burned-tower-1f', 'burned.rival');
  assert.equal(last().key, 'burned-tower-1f:rival2-burned');
  assert.ok(F.flag('burned-rival'));
  await run(st, 'burned-tower-b1f', 'burned.beasts');
  assert.ok(F.flag('beasts-awake'), 'Raikou, Entei and Suicune ran off');
  // The Dance Theater: five Kimono Girls, then the old man's present.
  grind(st, 'route37', 28, 600);
  await all('dance-theater');
  won();
  await run(st, 'dance-theater', npc(st, 'dance-theater', 'gentleman'));
  assert.ok(F.flag('kimono-gift') && F.count('rare-candy') >= 1);
  // Morty's Gym.
  await all('ecruteak-gym');
  won();
  F.healAll();
  await run(st, 'ecruteak-gym', [['battle', 'ecruteak-gym:morty']]);
  assert.equal(last().outcome, 'win', 'Morty beaten at levels ' + last().levels);
  assert.ok(S.player.badges.includes(12) && F.count('tm30') >= 1 && F.flag('morty-beaten'));
  assert.equal(F.obeyCap('johto'), 40, 'the Fog Badge: up to Lv. 40');
  assert.ok(F.flag('chapter-14-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

/** Chapter 15 after chapter 14: Routes 38 and 39, Moomoo Farm, Olivine, the sea, Cianwood and Chuck, Jasmine. */
async function chapter15(st) {
  const { G, S } = st;
  const F = G.Field;
  const fight = async (mapId, id) => { F.healAll(); await run(st, mapId, [['battle', mapId + ':' + id]]); };
  const all = async mapId => { for (const t of G.Maps.get(mapId).trainers.filter(t => t.cls !== 'leader')) await fight(mapId, t.id); };
  const last = () => st.battles[st.battles.length - 1];
  const won = () => assert.equal(last().outcome, 'win', last().key + ' at levels ' + last().levels);
  // Ecruteak's road west, Route 39 south to Olivine, the sea west to Cianwood.
  assert.equal(G.Maps.get('ecruteak').def.connect.west.map, 'route38');
  assert.equal(G.Maps.get('route39').def.connect.south.map, 'olivine');
  assert.equal(G.Maps.get('olivine').def.connect.west.map, 'route40');
  assert.equal(G.Maps.get('route41').def.connect.west.map, 'cianwood');
  const starter = S.party.find(m => m.sp >= 155 && m.sp <= 160);
  lead(st, starter.sp);
  grind(st, 'route38', 31, 600);
  for (const m of ['route38', 'route39']) { await all(m); won(); }
  // Moomoo Farm: five healing Berries (from the berry trees; field.test.cjs picks them) for the sick Miltank.
  F.giveItem('oran-berry', 5);
  for (let i = 0; i < 5; i++) await run(st, 'moomoo-barn', npc(st, 'moomoo-barn', 'miltank'), [0]);
  assert.ok(F.flag('miltank-healthy') && !F.count('oran-berry'), 'the Miltank is well');
  await run(st, 'moomoo-house', npc(st, 'moomoo-house', 'farmer'));
  assert.ok(F.flag('got-tm44') && F.count('tm44') === 1);
  // Olivine: the Gym is empty; Jasmine is at the top of the Lighthouse with the sick Amphy.
  for (const m of ['lighthouse-1f', 'lighthouse-2f']) { await all(m); won(); }
  await run(st, 'lighthouse-3f', npc(st, 'lighthouse-3f', 'jasmine'));
  assert.ok(F.flag('amphy-sick') && !F.flag('amphy-cured'));
  // Over the sea to Cianwood.
  for (const m of ['route40', 'route41']) { await all(m); won(); }
  await run(st, 'cianwood', 'cianwood.suicune');
  assert.ok(F.flag('cianwood-suicune'));
  await run(st, 'pharmacy', npc(st, 'pharmacy', 'pharmacist'));
  assert.equal(F.count('secret-potion'), 1, 'the Secret Potion');
  await run(st, 'chuck-house', npc(st, 'chuck-house', 'wife'));
  assert.ok(F.flag('got-tm08'));
  grind(st, 'route39', 33, 600);
  await all('cianwood-gym');
  won();
  F.healAll();
  await run(st, 'cianwood-gym', [['battle', 'cianwood-gym:chuck']]);
  assert.equal(last().outcome, 'win', 'Chuck beaten at levels ' + last().levels);
  assert.ok(S.player.badges.includes(13) && F.flag('chuck-beaten'));
  assert.equal(F.obeyCap('johto'), 50, 'the Storm Badge: up to Lv. 50');
  // Back to the Lighthouse: Amphy shines again, Jasmine goes back to her Gym.
  await run(st, 'lighthouse-3f', npc(st, 'lighthouse-3f', 'jasmine'));
  assert.ok(F.flag('amphy-cured') && !F.count('secret-potion'));
  F.healAll();
  await run(st, 'olivine-gym', [['battle', 'olivine-gym:jasmine']]);
  assert.equal(last().outcome, 'win', 'Jasmine beaten at levels ' + last().levels);
  assert.ok(S.player.badges.includes(14) && F.count('tm23') >= 1 && F.flag('jasmine-beaten'));
  assert.equal(F.obeyCap('johto'), 60, 'the Mineral Badge: up to Lv. 60');
  assert.ok(F.flag('chapter-15-done'));
  assert.deepEqual(st.errors, [], 'no script errors');
}

test('chapter 4: Flash, Rock Tunnel, Lavender Town, Celadon City and the Rainbow Badge', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
});

test('chapter 5: the Rocket Hideout, the Pokémon Tower, Snorlax, Fuchsia City and the Soul Badge', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
  await chapter5(st);
  console.log('[story] after chapter 5:', st.S.party.map(m => st.G.Maps.species(m.sp) + ' ' + m.lvl).join(', '));
});

test('chapter 6: the Safari Zone, Saffron City, Silph Co. and the Marsh Badge', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
  await chapter5(st);
  await chapter6(st);
});

test('chapter 7: the sea routes, Cinnabar Island, the Pokémon Mansion and the Volcano Badge', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
  await chapter5(st);
  await chapter6(st);
  console.log('[story] after chapter 6:', st.S.party.map(m => st.G.Maps.species(m.sp) + ' ' + m.lvl).join(', '));
  await chapter7(st);
});

test('chapter 8: the Bicycle, Cycling Road, Fly, the Viridian Gym and the Earth Badge', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
  await chapter5(st);
  await chapter6(st);
  await chapter7(st);
  console.log('[story] after chapter 7:', st.S.party.map(m => st.G.Maps.species(m.sp) + ' ' + m.lvl).join(', '));
  await chapter8(st);
});

test('chapter 9: Victory Road, the Elite Four, the Champion and the Hall of Fame', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
  await chapter5(st);
  await chapter6(st);
  await chapter7(st);
  await chapter8(st);
  console.log('[story] after chapter 8:', st.S.party.map(m => st.G.Maps.species(m.sp) + ' ' + m.lvl).join(', '));
  await chapter9(st);
});

test('chapter 10: the Power Plant, the Elite Four again, Cerulean Cave and Mewtwo', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
  await chapter5(st);
  await chapter6(st);
  await chapter7(st);
  await chapter8(st);
  await chapter9(st);
  await chapter10(st);
});

test('chapters 11 to 15: Johto, from Professor Elm to Falkner, Bugsy, Whitney, Morty, Chuck and Jasmine', async () => {
  const st = world(3);
  await chapter1(st);
  await chapter2(st);
  await chapter3(st);
  await chapter4(st);
  await chapter5(st);
  await chapter6(st);
  await chapter7(st);
  await chapter8(st);
  await chapter9(st);
  await chapter10(st);
  await chapter11(st);
  await chapter12(st);
  await chapter13(st);
  await chapter14(st);
  await chapter15(st);
});
