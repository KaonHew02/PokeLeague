// The Safari Zone battle (js/battle/safari.js): Safari Balls, Bait, Rocks, fleeing.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot } = require('./helpers.cjs');

const G = battleBoot();
const make = (sp, seed, balls = 30) => {
  const rng = G.RNG(seed);
  const mon = G.Mon.create(sp, 25, { rng, wild: true });
  return G.Safari.create({ seed, player: { name: 'Red', id: 1, party: [], bag: { 'safari-ball': balls } }, foe: { party: [mon] } });
};

test('a Safari battle: no Pokémon of yours, only Ball / Bait / Rock / Run', () => {
  const b = make(115, 3);
  const ev = b.start();
  assert.equal(b.kind, 'safari');
  assert.equal(ev[0].type, 'start');
  assert.equal(b.prompt.kind, 'action');
  assert.equal(b.options().balls, 30);
  const r = b.act({ type: 'rock' });
  assert.equal(r[0].type, 'rock');
  assert.ok(r.some(e => e.type === 'angry' || e.type === 'safariFled'));
  const bad = b.act({ type: 'move', slot: 0 });
  assert.equal(bad[0].type, 'error');
});

test('every Safari event has a line of text', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const b = make(113, seed);
    const all = [...b.start()];
    for (let i = 0; i < 60 && !b.result; i++) all.push(...b.act({ type: ['bait', 'rock', 'ball'][i % 3] }));
    for (const e of all) if (!['end', 'error'].includes(e.type)) assert.ok(G.BattleText.line(e, b), 'no text for ' + e.type);
  }
});

test('Bait halves the catch rate and calms it, a Rock doubles both; running always works', () => {
  const b = make(128, 5);
  b.start();
  const calm = b.fleeChance();
  b.mood = { kind: 'angry', turns: 3 };
  assert.equal(b.catchMod(), 2);
  assert.ok(b.fleeChance() > calm);
  b.mood = { kind: 'eating', turns: 3 };
  assert.equal(b.catchMod(), 0.5);
  assert.ok(b.fleeChance() < calm);
  b.mood = null;
  b.act({ type: 'run' });
  assert.equal(b.result.outcome, 'run');
});

test('the last Safari Ball ends the battle; a catch joins the party (or the PC)', () => {
  let caught = 0, ranOut = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const b = make(123, seed, 2);
    b.start();
    while (!b.result) b.act({ type: 'ball' });
    if (b.result.outcome === 'caught') {
      caught++;
      assert.equal(b.player.party.length, 1);
      assert.equal(b.result.mon.ball, 'safari-ball');
    } else if (b.result.outcome === 'run') {
      ranOut++;
      assert.ok(b.events.some(e => e.type === 'noBalls'));
      assert.equal(b.player.bag['safari-ball'] || 0, 0);
    }
  }
  assert.ok(caught > 0 && ranOut > 0, `caught ${caught}, ran out ${ranOut}`);
});

test('the same seed plays the same Safari battle', () => {
  const run = () => { const b = make(111, 9); const out = [...b.start()]; while (!b.result) out.push(...b.act({ type: 'ball' })); return JSON.stringify(out); };
  assert.equal(run(), run());
});
