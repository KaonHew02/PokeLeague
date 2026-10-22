// The first slice without a screen: from the bedroom to the Boulder Badge.
// The real scripts, maps, save and battle engine run in the node sandbox; a stand-in
// host answers the dialog (Yes, no nickname) and an auto-player fights every battle
// with its strongest move. Wild battles in the tall grass raise the party on the way,
// like a player would.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, source } = require('./helpers.cjs');

const dev = source('dev.html');
const CONTENT = [...dev.matchAll(/<script[^>]*src="(js\/content\/kanto\/[^"]+\.js)"/g)].map(m => m[1]);
const FILES = CORE.concat(DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
  ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/field.js', 'js/world/field-items.js', 'js/script/script.js'], CONTENT);

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
  return { G, W, S: save, errors, log: [], answers: [], battles: [] };
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
    const pow = sm && typeof sm.power === 'function' ? sm.power(b, b.player.bm, b.foe.bm) || 0 : M.pow || 0;   // Low Kick: by weight
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
    rules: { canLose: !!(o && o.canLose) } });
  b.start();
  const r = autoplay(G, b);
  st.battles.push({ key, outcome: r.outcome, levels: S.party.map(m => m.lvl) });
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
    const b = G.Battle.create({ kind: 'wild', seed: rng.int(1, 1e9), player: { name: 'Red', party: S.party, bag: S.bag }, foe: { party: [foe] } });
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
    wild: P, heal: () => G.Field.healAll(), healAnim: P,
    lastHeal(spot) { G.Field.save.player.lastHeal = { map: W.map, spot }; },
    shop: P, pc: P, music() {}, sfx() {}, jingle: P, nickname: P,
    itemName: id => G.Names.item(id), monName: sp => G.Names.mon(G.Maps.species(sp))
  };
  return h;
}

/** Runs a named script (or a person's script) as if the player were on that map. */
async function run(st, mapId, script, answers = []) {
  st.W.map = mapId;
  st.S.player.map = mapId;
  st.answers.push(...answers);
  const cmds = typeof script === 'string' ? st.G.Script.get(script) : script;
  assert.ok(cmds, 'no script ' + script);
  await st.G.Script.run(cmds, host(st));
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
      S.party.length = 0;
      S.party.push(G.Mon.create(150, 40, { rng: G.RNG(1), moves: ['psychic', 'recover'] }));
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

test('chapter 2: Route 3, Mt. Moon and its fossils, Cerulean City and the Cascade Badge', async () => {
  const st = world(3);
  await chapter1(st);
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
});
