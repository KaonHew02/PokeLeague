// Held items (chapter 26): what each one does in battle (js/battle/held.js), giving and taking them,
// the Everstone (evolution and the Day Care).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel } = require('./helpers.cjs');
const G = battleBoot();

const hold = item => ({ item });
/** The damage events of one exchange of moves. */
const damage = (ev, side) => ev.filter(e => e.type === 'damage' && e.side === side && e.why === 'hit').map(e => e.amt);

test('a type item makes that type 1.2× stronger; other types and holders of nothing are unchanged', () => {
  const hit = (item, move) => {
    const { b } = duel(G, { me: ['charizard', 60, [move], hold(item)], foe: ['snorlax', 60, ['splash']], seed: 4 });
    return damage(b.act({ type: 'move', slot: 0 }), 1)[0];
  };
  const plain = hit(null, 'flamethrower'), boosted = hit('charcoal', 'flamethrower');
  assert.ok(boosted > plain && boosted <= Math.ceil(plain * 1.25), `${plain} -> ${boosted}`);
  assert.equal(hit('mystic-water', 'flamethrower'), plain, 'not a water move');
  assert.equal(hit('charcoal', 'scratch'), hit(null, 'scratch'), 'only Fire moves');
});

test("the Adamant Orb and the Lustrous Orb (chapter 60): 1.2× two types, in the hands of Dialga and Palkia only", () => {
  const hit = (sp, item, move) => {
    const { b } = duel(G, { me: [sp, 70, [move], hold(item)], foe: ['snorlax', 70, ['splash']], seed: 4 });
    return damage(b.act({ type: 'move', slot: 0 }), 1)[0];
  };
  for (const [sp, item, moves, other] of [['dialga', 'adamant-orb', ['dragon-claw', 'flash-cannon'], 'surf'], ['palkia', 'lustrous-orb', ['dragon-claw', 'surf'], 'flash-cannon']]) {
    for (const m of moves) {
      const plain = hit(sp, null, m), boosted = hit(sp, item, m);
      assert.ok(boosted > plain && boosted <= Math.ceil(plain * 1.25), `${sp}, ${m}: ${plain} -> ${boosted}`);
    }
    assert.equal(hit(sp, item, other), hit(sp, null, other), 'not the other type');
  }
  assert.equal(hit('dialga', 'lustrous-orb', 'dragon-claw'), hit('dialga', null, 'dragon-claw'), "not in another Pokémon's hands");
});

test('berries are eaten when needed: HP at half or less, or the status they cure', () => {
  // Oran Berry: below half after the hit, it heals 10 and is gone.
  const { b, party } = duel(G, { me: ['pidgey', 10, ['splash'], hold('oran-berry')], foe: ['rattata', 10, ['tackle']], seed: 2 });
  const mon = party[0];
  mon.hp = Math.floor(G.Mon.maxHp(mon) / 2) + 3;
  const ev = b.act({ type: 'move', slot: 0 });
  const heal = ev.find(e => e.type === 'heal' && e.why === 'held');
  assert.ok(heal && heal.item === 'oran-berry' && heal.amt <= 10, 'ate it');
  assert.equal(mon.item, null, 'used up');
  // Cheri Berry: paralysed, then cured at once.
  const t = duel(G, { me: ['pidgey', 10, ['splash'], hold('cheri-berry')], foe: ['pikachu', 10, ['thunder-wave']], seed: 3 });
  const ev2 = t.b.act({ type: 'move', slot: 0 });
  assert.ok(ev2.some(e => e.type === 'status' && e.s === 'par') && ev2.some(e => e.type === 'cure' && e.item === 'cheri-berry'));
  assert.ok(t.party[0].status === null && t.party[0].item === null);
  // A berry that does not match stays.
  const u = duel(G, { me: ['pidgey', 10, ['splash'], hold('rawst-berry')], foe: ['pikachu', 10, ['thunder-wave']], seed: 3 });
  u.b.act({ type: 'move', slot: 0 });
  assert.ok(u.party[0].status === 'par' && u.party[0].item === 'rawst-berry');
});

test('Leftovers heal 1/16 at the end of each turn; Shell Bell 1/8 of the damage dealt', () => {
  const { b, party } = duel(G, { me: ['snorlax', 50, ['splash'], hold('leftovers')], foe: ['magikarp', 5, ['splash']], seed: 1 });
  party[0].hp = 100;
  const ev = b.act({ type: 'move', slot: 0 });
  const h = ev.find(e => e.type === 'heal' && e.held === 'leftovers');
  assert.equal(h.amt, Math.floor(G.Mon.maxHp(party[0]) / 16));
  assert.equal(party[0].item, 'leftovers', 'never used up');
  const s = duel(G, { me: ['machamp', 50, ['karate-chop'], hold('shell-bell')], foe: ['snorlax', 60, ['splash']], seed: 5 });
  s.party[0].hp = 50;
  const ev2 = s.b.act({ type: 'move', slot: 0 });
  const dealt = damage(ev2, 1)[0], bell = ev2.find(e => e.type === 'heal' && e.held === 'shell-bell');
  assert.equal(bell.amt, Math.max(1, Math.floor(dealt / 8)));
});

test('Quick Claw, King\'s Rock and Focus Band about as often as the games say', () => {
  const N = 600;
  let first = 0, flinch = 0, band = 0;
  for (let s = 1; s <= N; s++) {
    // Quick Claw: the slower Pokémon moves first about one time in five.
    const q = duel(G, { me: ['slowpoke', 30, ['tackle'], hold('quick-claw')], foe: ['jolteon', 30, ['tackle']], seed: s });
    const ev = q.b.act({ type: 'move', slot: 0 });
    if (ev.find(e => e.type === 'move').side === 0) first++;
    // King's Rock: the faster Pokémon's hit makes the foe flinch about one time in ten.
    const k = duel(G, { me: ['jolteon', 50, ['tackle'], hold('kings-rock')], foe: ['snorlax', 60, ['tackle']], seed: s });
    if (k.b.act({ type: 'move', slot: 0 }).some(e => e.type === 'cantMove' && e.why === 'flinch')) flinch++;
    // Focus Band: holding on with 1 HP against a hit that would knock it out, one time in ten.
    const f = duel(G, { me: ['pidgey', 5, ['splash'], hold('focus-band')], foe: ['machamp', 60, ['karate-chop']], seed: s });
    const ev3 = f.b.act({ type: 'move', slot: 0 });
    if (ev3.some(e => e.type === 'held' && e.why === 'focus-band')) { band++; assert.equal(f.party[0].hp, 1); }
  }
  assert.ok(first > N * 0.13 && first < N * 0.28, 'Quick Claw ' + first);
  assert.ok(flinch > N * 0.05 && flinch < N * 0.16, "King's Rock " + flinch);
  assert.ok(band > N * 0.05 && band < N * 0.16, 'Focus Band ' + band);
});

test('Scope Lens, Bright Powder and the items made for one Pokémon', () => {
  const N = 500;
  const crits = item => {
    let n = 0;
    for (let s = 1; s <= N; s++) {
      const { b } = duel(G, { me: ['chansey', 50, ['pound'], hold(item)], foe: ['snorlax', 70, ['splash']], seed: s });
      if (b.act({ type: 'move', slot: 0 }).some(e => e.type === 'damage' && e.side === 1 && e.crit)) n++;
    }
    return n;
  };
  const base = crits(null), lens = crits('scope-lens'), punch = crits('lucky-punch');
  assert.ok(lens > base * 1.6 && punch > lens * 1.6, `crits ${base} / ${lens} / ${punch}`);
  let miss = 0;
  for (let s = 1; s <= N; s++) {
    const { b } = duel(G, { me: ['snorlax', 50, ['splash'], hold('bright-powder')], foe: ['rattata', 30, ['tackle']], seed: s });
    if (b.act({ type: 'move', slot: 0 }).some(e => e.type === 'miss')) miss++;
  }
  assert.ok(miss > N * 0.05 && miss < N * 0.16, 'Bright Powder ' + miss);
  // Light Ball (Pikachu), Thick Club (Marowak), Metal Powder (Ditto): the stat doubles, for them only.
  const stat = (sp, item, key) => { const { b } = duel(G, { me: [sp, 30, null, hold(item)], foe: ['rattata', 5, null] }); return b.stat(b.player.bm, key); };
  assert.equal(stat('pikachu', 'light-ball', 'spa'), 2 * stat('pikachu', null, 'spa'));
  assert.equal(stat('raichu', 'light-ball', 'spa'), stat('raichu', null, 'spa'), 'only Pikachu');
  assert.equal(stat('marowak', 'thick-club', 'atk'), 2 * stat('marowak', null, 'atk'));
  assert.equal(stat('ditto', 'metal-powder', 'def'), 2 * stat('ditto', null, 'def'));
});

test('Lucky Egg and Exp. Share; Amulet Coin; Smoke Ball', () => {
  const exp = (me, mine) => {
    const { b, party } = duel(G, { me, mine, foe: ['magikarp', 20, ['splash']], seed: 1 });
    let ev = [];
    for (let i = 0; i < 10 && !b.result; i++) ev = ev.concat(b.prompt.kind === 'action' ? b.act({ type: 'move', slot: 0 }) : b.answer({ learnSlot: -1, switchTo: -1 }));
    return party.map(m => ev.filter(e => e.type === 'exp' && e.uid === m.uid).reduce((n, e) => n + e.amt, 0));
  };
  const [alone] = exp(['machamp', 50, ['karate-chop']]);
  const [egg] = exp(['machamp', 50, ['karate-chop'], hold('lucky-egg')]);
  assert.equal(egg, Math.floor(alone * 1.5), 'Lucky Egg');
  const [fought, shared] = exp(['machamp', 50, ['karate-chop']], [['pidgey', 5, ['splash'], hold('exp-share')]]);
  assert.equal(fought, Math.floor(alone / 2), 'half to the one that fought');
  assert.equal(shared, Math.floor(alone / 2), 'half to the holder, which never fought');
  const [, none] = exp(['machamp', 50, ['karate-chop']], [['pidgey', 5, ['splash']]]);
  assert.equal(none, 0, 'without the Exp. Share, nothing for the one that stayed out');
  // Amulet Coin: double prize money.
  const money = item => {
    const { b } = duel(G, { me: ['machamp', 60, ['karate-chop'], hold(item)], foe: ['rattata', 5, ['tackle']], kind: 'trainer', seed: 2 });
    for (let i = 0; i < 10 && !b.result; i++) b.prompt.kind === 'action' ? b.act({ type: 'move', slot: 0 }) : b.answer({ learnSlot: -1 });
    return b.result.money;
  };
  assert.equal(money('amulet-coin'), 2 * money(null));
  // Smoke Ball: a slow Pokémon always gets away.
  for (let s = 1; s <= 30; s++) {
    const { b } = duel(G, { me: ['slowpoke', 5, ['splash'], hold('smoke-ball')], foe: ['jolteon', 60, ['splash']], seed: s });
    assert.ok(b.act({ type: 'run' }).some(e => e.type === 'run' && e.ok), 'escaped ' + s);
  }
});

test('the Everstone: no evolution by level or friendship, but a stone still works', () => {
  const rng = G.RNG(1);
  const charmander = G.Mon.create(4, 20, { rng });
  assert.ok(G.Evolution.candidates(charmander, { trigger: 'level' }).length);
  charmander.item = 'everstone';
  assert.equal(G.Evolution.candidates(charmander, { trigger: 'level' }).length, 0);
  const pikachu = Object.assign(G.Mon.create(25, 20, { rng }), { item: 'everstone' });
  assert.deepEqual(G.Evolution.candidates(pikachu, { trigger: 'item', item: 'thunder-stone' }).join(), '26');
});

// ---------------- Chapter 93: Generation 4's held items ----------------

const hitWith = (o, slot = 0) => {
  const d = duel(G, Object.assign({ seed: 4 }, o));
  return { d, ev: d.b.act({ type: 'move', slot }) };
};
const H = G.Held;

test('Choice Band, Specs and Scarf (chapter 93): x1.5 of their stat, one move until it switches out; the foe is held too; Klutz', () => {
  const { b, party } = duel(G, { me: ['garchomp', 50, ['earthquake', 'dragon-claw'], hold('choice-band')], foe: ['snorlax', 50, ['splash']],
    mine: [['lucario', 50, ['aura-sphere']]] });
  const bm = b.player.bm, raw = G.Mon.stats(party[0])[1];
  assert.equal(b.stat(bm, 'atk'), Math.floor(raw * 1.5));
  assert.equal(b.stat(bm, 'spa'), G.Mon.stats(party[0])[3], 'only its own stat');
  b.act({ type: 'move', slot: 0 });
  assert.deepEqual(b.options().moves.map(m => m.usable), [true, false], 'held to Earthquake');
  assert.equal(b.act({ type: 'move', slot: 1 })[0].reason, 'bad-move');
  b.act({ type: 'switch', to: 1 });
  b.act({ type: 'switch', to: 0 });
  assert.deepEqual(b.options().moves.map(m => m.usable), [true, true], 'switching out frees it');
  // Specs and Scarf.
  const s = duel(G, { me: ['alakazam', 50, ['psychic'], hold('choice-specs')], foe: ['snorlax', 50, ['splash']] });
  assert.equal(s.b.stat(s.b.player.bm, 'spa'), Math.floor(G.Mon.stats(s.party[0])[3] * 1.5));
  const c = duel(G, { me: ['alakazam', 50, ['psychic'], hold('choice-scarf')], foe: ['snorlax', 50, ['splash']] });
  assert.equal(c.b.stat(c.b.player.bm, 'spe'), Math.floor(G.Mon.stats(c.party[0])[5] * 1.5));
  // The foe keeps to its first move.
  const f = duel(G, { me: ['snorlax', 60, ['splash']], foe: ['garchomp', 50, ['dragon-claw', 'earthquake', 'crunch', 'fire-fang'], hold('choice-scarf')], kind: 'trainer', seed: 9 });
  const used = [];
  for (let t = 0; t < 4; t++) used.push(...f.b.act({ type: 'move', slot: 0 }).filter(e => e.type === 'move' && e.side === 1).map(e => e.move));
  assert.equal(new Set(used).size, 1, 'the foe always used ' + used.join());
  // Klutz: no boost, no lock.
  const k = duel(G, { me: ['lopunny', 50, ['return', 'quick-attack'], { item: 'choice-band', ability: 'klutz' }], foe: ['snorlax', 50, ['splash']] });
  assert.equal(k.b.stat(k.b.player.bm, 'atk'), G.Mon.stats(k.party[0])[1]);
  k.b.act({ type: 'move', slot: 0 });
  assert.deepEqual(k.b.options().moves.map(m => m.usable), [true, true]);
});

test('the Focus Sash: at full HP it holds on with 1 HP, once; not when hurt already; a second hit gets through', () => {
  const ko = o => hitWith(Object.assign({ me: ['garchomp', 70, ['earthquake', 'double-kick']], foe: ['pikachu', 20, ['splash'], hold('focus-sash')] }, o));
  let { d, ev } = ko({});
  assert.equal(d.foes[0].hp, 1);
  assert.equal(d.foes[0].item, null, 'used up');
  assert.ok(ev.some(e => e.type === 'held' && e.why === 'focus-sash' && e.item === 'focus-sash'));
  assert.equal(G.BattleText.line(ev.find(e => e.type === 'held'), d.b), G.I18n.fmt('{mon} hung on using its {item}!', { mon: G.BattleText.who(d.b, d.foes[0].uid, 1), item: G.Names.item('focus-sash') }));
  ({ d } = ko({ foe: ['pikachu', 20, ['splash'], { item: 'focus-sash', hp: 30 }] }));
  assert.equal(d.foes[0].hp, 0, 'not at full HP');
  ({ d } = hitWith({ me: ['garchomp', 70, ['double-kick']], foe: ['pikachu', 20, ['splash'], hold('focus-sash')] }));
  assert.equal(d.foes[0].hp, 0, 'the second kick knocks it out');
});

test('the Life Orb: x1.3 damage and a tenth of its HP after each move that hits (once for several hits; not with Magic Guard)', () => {
  const plain = hitWith({ me: ['garchomp', 50, ['dragon-claw']], foe: ['snorlax', 60, ['splash']] });
  const orb = hitWith({ me: ['garchomp', 50, ['dragon-claw'], hold('life-orb')], foe: ['snorlax', 60, ['splash']] });
  const a = damage(plain.ev, 1)[0], b2 = damage(orb.ev, 1)[0];
  assert.ok(b2 >= Math.floor(a * 1.25) && b2 <= Math.ceil(a * 1.35), `${a} -> ${b2}`);
  const max = G.Mon.maxHp(orb.d.party[0]);
  assert.equal(orb.d.party[0].hp, max - Math.floor(max / 10));
  const recoil = orb.ev.find(e => e.type === 'damage' && e.side === 0 && e.why === 'life-orb');
  assert.equal(G.BattleText.line(recoil, orb.d.b), G.I18n.fmt('{mon} lost some of its HP!', { mon: G.BattleText.who(orb.d.b, orb.d.party[0].uid, 0) }));
  const multi = hitWith({ me: ['hitmontop', 50, ['double-kick'], hold('life-orb')], foe: ['snorlax', 60, ['splash']] });
  assert.equal(multi.ev.filter(e => e.type === 'damage' && e.why === 'life-orb').length, 1, 'once a move');
  const guard = hitWith({ me: ['clefable', 50, ['return'], { item: 'life-orb', ability: 'magic-guard' }], foe: ['snorlax', 60, ['splash']] });
  assert.equal(guard.d.party[0].hp, G.Mon.maxHp(guard.d.party[0]), 'Magic Guard');
  const status = hitWith({ me: ['garchomp', 50, ['swords-dance'], hold('life-orb')], foe: ['snorlax', 60, ['splash']] });
  assert.equal(status.d.party[0].hp, G.Mon.maxHp(status.d.party[0]), 'a status move costs nothing');
});

test('Muscle Band, Wise Glasses, Expert Belt, Metronome: their power and damage', () => {
  const dmg = (me, foe = ['snorlax', 60, ['splash']]) => damage(hitWith({ me, foe }).ev, 1)[0];
  const phys = dmg(['garchomp', 50, ['dragon-claw']]), band = dmg(['garchomp', 50, ['dragon-claw'], hold('muscle-band')]);
  assert.ok(band > phys && band <= Math.ceil(phys * 1.12), `${phys} -> ${band}`);
  assert.equal(dmg(['garchomp', 50, ['draco-meteor'], hold('muscle-band')]), dmg(['garchomp', 50, ['draco-meteor']]), 'not on special moves');
  const spec = dmg(['alakazam', 50, ['psychic']]), glasses = dmg(['alakazam', 50, ['psychic'], hold('wise-glasses')]);
  assert.ok(glasses > spec && glasses <= Math.ceil(spec * 1.12));
  const se = dmg(['lucario', 50, ['aura-sphere']]), belt = dmg(['lucario', 50, ['aura-sphere'], hold('expert-belt')]);
  assert.ok(belt >= Math.floor(se * 1.15) && belt <= Math.ceil(se * 1.25), `${se} -> ${belt}`);
  const neutral = ['lucario', 50, ['dark-pulse']];
  assert.equal(dmg(neutral.slice(0, 3).concat([hold('expert-belt')])), dmg(neutral), 'neutral hits unchanged');
  // Metronome: +10% a use in a row, x2 at most; another move starts over.
  const bm = { mon: { item: 'metronome', sp: 1 }, vol: {} }, M = G.MOVES.tackle;
  H.beforeMove(bm, 'tackle');
  assert.equal(H.power(bm.mon, 'normal', M, bm), 1);
  H.beforeMove(bm, 'tackle'); H.beforeMove(bm, 'tackle');
  assert.equal(H.power(bm.mon, 'normal', M, bm), 1.2);
  for (let i = 0; i < 12; i++) H.beforeMove(bm, 'tackle');
  assert.equal(H.power(bm.mon, 'normal', M, bm), 2);
  H.beforeMove(bm, 'growl');
  assert.equal(H.power(bm.mon, 'normal', M, bm), 1);
});

test('type-resist berries: half the damage of a super-effective hit of their type, once; the Chilan Berry any Normal hit', () => {
  const fire = item => hitWith({ me: ['infernape', 25, ['flamethrower']], foe: ['abomasnow', 60, ['splash'], hold(item)] });
  const a = damage(fire(null).ev, 1)[0], r = fire('occa-berry');
  const b2 = damage(r.ev, 1)[0];
  assert.ok(b2 >= Math.floor(a * 0.45) && b2 <= Math.ceil(a * 0.55), `${a} -> ${b2}`);
  assert.equal(r.d.foes[0].item, null);
  assert.equal(G.BattleText.line(r.ev.find(e => e.type === 'resist'), r.d.b),
    G.I18n.fmt('The {item} weakened the damage to {mon}!', { mon: G.BattleText.who(r.d.b, r.d.foes[0].uid, 1), item: G.Names.item('occa-berry') }));
  const neutral = hitWith({ me: ['infernape', 50, ['flamethrower']], foe: ['snorlax', 50, ['splash'], hold('occa-berry')] });
  assert.equal(neutral.d.foes[0].item, 'occa-berry', 'kept against a neutral hit');
  const chilan = hitWith({ me: ['snorlax', 50, ['body-slam']], foe: ['snorlax', 50, ['splash'], hold('chilan-berry')] });
  assert.equal(chilan.d.foes[0].item, null, 'the Chilan Berry: any Normal hit');
});

test('accuracy, draining, speed and order: Wide Lens, Zoom Lens, Big Root, Iron Ball, Lagging Tail, the Power items', () => {
  const user = item => ({ mon: { item, sp: 1 } });
  assert.equal(H.userAcc(user('wide-lens'), { moved: false }), 1.1);
  assert.equal(H.userAcc(user('zoom-lens'), { moved: false }), 1);
  assert.equal(H.userAcc(user('zoom-lens'), { moved: true }), 1.2);
  // Big Root: Giga Drain's HP x1.3.
  const drain = item => hitWith({ me: ['roserade', 50, ['giga-drain'], { item, hp: 20 }], foe: ['swampert', 50, ['splash']] }).ev
    .find(e => e.type === 'heal' && e.side === 0).amt;
  const plainHeal = drain(null), rootHeal = drain('big-root');
  assert.ok(rootHeal >= Math.floor(plainHeal * 1.25) && rootHeal <= Math.ceil(plainHeal * 1.35), `${plainHeal} -> ${rootHeal}`);
  // Iron Ball: Speed halved; Earthquake hits a Flying holder.
  const iron = duel(G, { me: ['garchomp', 50, ['earthquake']], foe: ['staraptor', 50, ['splash'], hold('iron-ball')], seed: 4 });
  assert.equal(iron.b.stat(iron.b.foe.bm, 'spe'), Math.floor(G.Mon.stats(iron.foes[0])[5] * 0.5));
  assert.ok(damage(iron.b.act({ type: 'move', slot: 0 }), 1)[0] > 0, 'grounded');
  // Lagging Tail: the faster one moves last.
  const lag = duel(G, { me: ['jolteon', 50, ['tackle'], hold('lagging-tail')], foe: ['snorlax', 50, ['tackle']], seed: 4 });
  const order = lag.b.act({ type: 'move', slot: 0 }).filter(e => e.type === 'move').map(e => e.side);
  assert.deepEqual([...order], [1, 0]);
  // The Power items: Speed halved, four more EVs in their stat.
  const p = duel(G, { me: ['jolteon', 50, ['tackle'], hold('power-bracer')], foe: ['snorlax', 50, ['splash']] });
  assert.equal(p.b.stat(p.b.player.bm, 'spe'), Math.floor(G.Mon.stats(p.party[0])[5] * 0.5));
  const mon = Object.assign(G.Mon.create(135, 50, { rng: G.RNG(1) }), { item: 'power-bracer' });
  G.Exp.addEvs(mon, [0, 0, 0, 0, 0, 2]);
  assert.deepEqual([...mon.evs], [0, 4, 0, 0, 0, 2]);
});

test('Black Sludge, the Toxic Orb and the Flame Orb at the end of a turn (who is spared)', () => {
  const turn = (me, item) => { const d = duel(G, { me: me.concat([hold(item)]), foe: ['snorlax', 50, ['splash']] }); return { d, ev: d.b.act({ type: 'move', slot: 0 }) }; };
  let { d, ev } = turn(['jolteon', 50, ['splash']], 'black-sludge');
  const max = G.Mon.maxHp(d.party[0]);
  assert.equal(d.party[0].hp, max - Math.floor(max / 8));
  assert.equal(G.BattleText.line(ev.find(e => e.type === 'damage' && e.why === 'sludge'), d.b),
    G.I18n.fmt('{mon} is hurt by its {item}!', { mon: G.BattleText.who(d.b, d.party[0].uid, 0), item: G.Names.item('black-sludge') }));
  const muk = duel(G, { me: ['muk', 50, ['splash'], { item: 'black-sludge', hp: 10 }], foe: ['snorlax', 50, ['splash']] });
  muk.b.act({ type: 'move', slot: 0 });
  assert.equal(muk.party[0].hp, 10 + Math.floor(G.Mon.maxHp(muk.party[0]) / 16), 'a poison type gets HP back');
  ({ d, ev } = turn(['gliscor', 50, ['splash']], 'toxic-orb'));
  assert.equal(d.party[0].status, 'tox');
  assert.equal(d.party[0].hp, G.Mon.maxHp(d.party[0]), 'no poison damage on the turn it starts');
  assert.equal(G.BattleText.line(ev.find(e => e.type === 'status'), d.b),
    G.I18n.fmt('{mon} was badly poisoned by the {item}!', { mon: G.BattleText.who(d.b, d.party[0].uid, 0), item: G.Names.item('toxic-orb') }));
  ({ d } = turn(['heracross', 50, ['splash']], 'flame-orb'));
  assert.equal(d.party[0].status, 'brn');
  assert.equal(turn(['muk', 50, ['splash']], 'toxic-orb').d.party[0].status, null, 'a poison type is spared');
  assert.equal(turn(['infernape', 50, ['splash']], 'flame-orb').d.party[0].status, null, 'a fire type is spared');
});

test('Power Herb, Grip Claw, the Persim Berry and the pinch berries', () => {
  let { d, ev } = hitWith({ me: ['venusaur', 50, ['solar-beam'], hold('power-herb')], foe: ['snorlax', 50, ['splash']] });
  assert.ok(damage(ev, 1)[0] > 0 && d.party[0].item === null, 'Solar Beam at once');
  assert.equal(G.BattleText.line(ev.find(e => e.type === 'powerHerb'), d.b),
    G.I18n.fmt('{mon} became fully charged due to its {item}!', { mon: G.BattleText.who(d.b, d.party[0].uid, 0), item: G.Names.item('power-herb') }));
  ({ d } = hitWith({ me: ['dragonite', 50, ['wrap'], hold('grip-claw')], foe: ['snorlax', 50, ['splash']] }));
  assert.equal(d.b.foe.bm.vol.trap.turns, 4, 'five turns: one gone at the end of this one');
  ({ d, ev } = hitWith({ me: ['snorlax', 50, ['splash'], hold('persim-berry')], foe: ['gengar', 50, ['confuse-ray']] }));
  assert.ok(!d.b.player.bm.vol.confusion && d.party[0].item === null, 'confusion cured at once');
  for (const [item, stat, n] of [['ganlon-berry', 'def', 1], ['petaya-berry', 'spa', 1], ['apicot-berry', 'spd', 1]]) {
    ({ d } = hitWith({ me: ['snorlax', 50, ['splash'], { item, hp: 20 }], foe: ['snorlax', 50, ['splash']] }));
    assert.equal(d.b.player.bm.stages[stat], n, item);
  }
  ({ d } = hitWith({ me: ['snorlax', 50, ['splash'], { item: 'lansat-berry', hp: 20 }], foe: ['snorlax', 50, ['splash']] }));
  assert.ok(d.b.player.bm.vol.focusEnergy && d.party[0].item === null, 'Lansat: as Focus Energy');
  ({ d } = hitWith({ me: ['snorlax', 50, ['splash'], { item: 'starf-berry', hp: 20 }], foe: ['snorlax', 50, ['splash']] }));
  assert.equal(Object.values(d.b.player.bm.stages).filter(v => v === 2).length, 1, 'Starf: one stat +2');
});

test('every Generation 4 item of chapter 93 has a name, a description and an effect', () => {
  for (const id of ['choice-band', 'choice-specs', 'choice-scarf', 'focus-sash', 'life-orb', 'muscle-band', 'wise-glasses', 'expert-belt', 'metronome',
    'wide-lens', 'zoom-lens', 'big-root', 'black-sludge', 'iron-ball', 'lagging-tail', 'power-weight', 'power-bracer', 'power-belt', 'power-lens',
    'power-band', 'power-anklet', 'toxic-orb', 'flame-orb', 'power-herb', 'grip-claw', 'persim-berry', 'occa-berry', 'chilan-berry', 'ganlon-berry',
    'petaya-berry', 'apicot-berry', 'lansat-berry', 'starf-berry']) {
    assert.ok(G.ITEMS[id] && G.ITEM_FX[id] && G.ITEM_FX[id].held, id);
    assert.ok(G.Names.item(id) && G.Names.item(id) !== id, id);
  }
  const resist = Object.keys(G.ITEM_FX).filter(id => G.ITEM_FX[id].held === 'resist');
  assert.equal(resist.length, 17);
  assert.equal(new Set(resist.map(id => G.ITEM_FX[id].type)).size, 17, 'one for each type but Fairy');
});
