// Catching: the formula, its statistics and the battle flow.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel } = require('./helpers.cjs');
const G = battleBoot();

test('a Master Ball always catches; a ≥ 255 always catches', () => {
  const rng = G.RNG(1);
  for (let i = 0; i < 50; i++) assert.ok(G.Capture.roll({ max: 200, hp: 200, rate: 3, ball: 255, status: null, rng }).caught);
  assert.ok(G.Capture.roll({ max: 20, hp: 1, rate: 255, ball: 2, status: 'slp', rng }).caught);
  assert.equal(G.Capture.chance({ max: 20, hp: 1, rate: 255, ball: 2, status: 'slp' }), 1);
});

test('the catch rate over many throws matches the formula', () => {
  for (const o of [{ max: 40, hp: 40, rate: 45, ball: 1, status: null }, { max: 40, hp: 10, rate: 45, ball: 1.5, status: null },
                   { max: 40, hp: 10, rate: 45, ball: 1, status: 'slp' }, { max: 100, hp: 100, rate: 3, ball: 2, status: null }]) {
    const rng = G.RNG(42);
    let ok = 0;
    const N = 6000;
    for (let i = 0; i < N; i++) if (G.Capture.roll(Object.assign({ rng }, o)).caught) ok++;
    const want = G.Capture.chance(o);
    assert.ok(Math.abs(ok / N - want) < 0.025, `${JSON.stringify(o)}: ${ok / N} vs ${want}`);
  }
});

test('weaker HP, better balls and sleep all raise the chance', () => {
  const c = o => G.Capture.chance(Object.assign({ max: 40, hp: 40, rate: 45, ball: 1, status: null }, o));
  assert.ok(c({ hp: 5 }) > c({}));
  assert.ok(c({ ball: 2 }) > c({ ball: 1.5 }) && c({ ball: 1.5 }) > c({}));
  assert.ok(c({ status: 'slp' }) > c({ status: 'par' }) && c({ status: 'par' }) > c({}));
});

test('in battle: a caught Pokémon joins the party with its ball; balls are not allowed against trainers', () => {
  let caught = null;
  for (let s = 1; s <= 30 && !caught; s++) {
    const { b, party } = duel(G, { me: ['squirtle', 10, ['splash']], foe: ['pidgey', 2, ['splash']], seed: s, bag: { 'poke-ball': 3 } });
    const ev = b.act({ type: 'ball', item: 'poke-ball' });
    const ball = ev.find(e => e.type === 'ball');
    assert.ok(ball && ball.shakes >= 0 && ball.shakes <= 3);
    assert.equal(b.player.bag['poke-ball'], 2);
    if (ball.caught) { caught = b.result; assert.equal(party.length, 2); assert.equal(party[1].ball, 'poke-ball'); }
  }
  assert.ok(caught && caught.outcome === 'caught');
  const t = duel(G, { me: ['squirtle', 10, ['splash']], foe: ['pidgey', 5, ['splash']], kind: 'trainer', bag: { 'poke-ball': 3 } });
  assert.equal(t.b.act({ type: 'ball', item: 'poke-ball' })[0].type, 'error');
  assert.equal(t.b.player.bag['poke-ball'], 3);
});

test("Kurt's Apricorn Balls: each one's rule, as in HeartGold and SoulSilver", () => {
  const sp = slug => +Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === slug);
  const mon = (slug, lvl, gender) => ({ sp: sp(slug), lvl, gender });
  const m = (item, foe, mine, fishing) => G.Capture.ballMod(item, { foe, mine, fishing });
  // Level Ball: above, over twice, over four times the wild one's level.
  const pidgey = mon('pidgey', 10, 'm');
  assert.deepEqual([10, 11, 21, 41].map(l => m('level-ball', pidgey, mon('pidgey', l, 'm')).ball).join(), '1,2,4,8');
  // Lure Ball: only on a Pokémon hooked with a rod.
  assert.equal(m('lure-ball', mon('magikarp', 10), null, false).ball, 1);
  assert.equal(m('lure-ball', mon('magikarp', 10), null, true).ball, 3);
  // Moon Ball: the Pokémon that evolve with a Moon Stone.
  assert.equal(m('moon-ball', mon('clefairy', 10)).ball, 4);
  assert.equal(m('moon-ball', mon('nidorina', 10)).ball, 4);
  assert.equal(m('moon-ball', mon('clefable', 10)).ball, 1);
  // Fast Ball: base Speed 100 or more.
  assert.equal(m('fast-ball', mon('ponyta', 10)).ball, 1);
  assert.equal(m('fast-ball', mon('jolteon', 10)).ball, 4);
  // Love Ball: your Pokémon's species, the other gender.
  assert.equal(m('love-ball', mon('nidoran-f', 10, 'f'), mon('nidoran-f', 10, 'f')).ball, 1);
  assert.equal(m('love-ball', mon('pidgey', 10, 'f'), mon('pidgey', 30, 'm')).ball, 8);
  assert.equal(m('love-ball', mon('rattata', 10, 'f'), mon('pidgey', 30, 'm')).ball, 1);
  // Heavy Ball: the catch rate moves with the weight (Pidgey 1.8 kg, Snorlax 460 kg, Onix 210 kg).
  assert.equal(m('heavy-ball', mon('pidgey', 5)).rate, G.SPECIES[sp('pidgey')].cr - 20);
  assert.equal(m('heavy-ball', mon('snorlax', 5)).rate, G.SPECIES[sp('snorlax')].cr + 40);
  assert.equal(m('heavy-ball', mon('onix', 5)).rate, G.SPECIES[sp('onix')].cr + 30);
  assert.equal(m('heavy-ball', mon('mewtwo', 5)).rate, 3 + 20);
  // The others keep their multiplier and the species' rate.
  const both = o => [o.ball, o.rate];
  assert.deepEqual(both(m('ultra-ball', pidgey)), [2, G.SPECIES[sp('pidgey')].cr]);
  assert.deepEqual(both(m('friend-ball', pidgey)), [1, G.SPECIES[sp('pidgey')].cr]);
});

test('in battle: a Friend Ball catch starts at 200 friendship; a hooked Pokémon makes the Lure Ball work', () => {
  let caught = null;
  for (let s = 1; s <= 40 && !caught; s++) {
    const { b, party } = duel(G, { me: ['squirtle', 30, ['splash']], foe: ['pidgey', 2, ['splash']], seed: s, bag: { 'friend-ball': 1 } });
    const ev = b.act({ type: 'ball', item: 'friend-ball' });
    if (ev.find(e => e.type === 'ball' && e.caught)) { caught = party[1]; }
  }
  assert.ok(caught && caught.ball === 'friend-ball' && caught.friendship === 200);
  // The same throws at a hooked Magikarp catch it more often with the Lure Ball.
  const rate = fishing => {
    let n = 0;
    for (let s = 1; s <= 200; s++) {
      const { b } = duel(G, { me: ['squirtle', 30, ['splash']], foe: ['gyarados', 30, ['splash']], seed: s, bag: { 'lure-ball': 1 }, rules: { fishing } });
      if (b.act({ type: 'ball', item: 'lure-ball' }).find(e => e.type === 'ball' && e.caught)) n++;
    }
    return n;
  };
  assert.ok(rate(true) > rate(false) * 2, `${rate(true)} vs ${rate(false)}`);
});
