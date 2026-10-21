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
