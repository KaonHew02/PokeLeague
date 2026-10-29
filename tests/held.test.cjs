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
