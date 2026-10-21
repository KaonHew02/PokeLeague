// Experience, effort values, levelling up and learning moves in battle.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel, plain } = require('./helpers.cjs');
const G = battleBoot();

/** Wins one turn with a sure knock-out (the foe has 1 HP). */
function oneKo(o) {
  const d = duel(G, Object.assign({ foe: ['bulbasaur', 5, ['splash'], { hp: 1 }] }, o));
  return Object.assign(d, { ev: d.b.act({ type: 'move', slot: 0 }) });
}

test('the formula: floor(b·L/7), ×1.5 from trainers, split between participants', () => {
  assert.equal(G.Exp.gain(64, 5, false, 1), 45);
  assert.equal(G.Exp.gain(64, 5, true, 1), 67);
  assert.equal(G.Exp.gain(64, 5, false, 2), 22);
  assert.equal(G.Exp.gain(1, 1, false, 6), 1);
  assert.equal(G.Exp.prize(36, 14), 504);
  assert.equal(G.Exp.blackoutLoss(1001), 500);
});

test('effort values: 252 per stat, 510 in all', () => {
  const m = G.Mon.create(1, 5, { rng: G.RNG(1) });
  for (let i = 0; i < 300; i++) G.Exp.addEvs(m, [0, 3, 0, 0, 0, 0]);
  assert.equal(m.evs[1], 252);
  for (let i = 0; i < 300; i++) G.Exp.addEvs(m, [0, 0, 3, 0, 0, 3]);
  assert.equal(m.evs.reduce((s, v) => s + v, 0), 510);
});

test('winning gives EXP and EVs to the Pokémon that fought', () => {
  const { ev, party } = oneKo({ me: ['charmander', 5, ['scratch']], seed: 3 });
  const e = ev.find(x => x.type === 'exp');
  assert.equal(e.amt, 45);
  assert.equal(party[0].evs[3], 1);                     // Bulbasaur yields 1 Sp. Atk EV
});

test('levelling up: stats grow, HP rises with max HP, the new move is learned', () => {
  const gr = G.SPECIES[4].gr;
  const { ev, party, b } = oneKo({ me: ['charmander', 6, ['scratch', 'growl'], { exp: G.Stats.expAt(gr, 7) - 1 }], seed: 5 });
  const lv = ev.find(x => x.type === 'levelup');
  assert.equal(lv.lvl, 7);
  assert.ok(lv.after[0] >= lv.before[0]);
  assert.ok(ev.some(x => x.type === 'learned' && x.move === 'ember'));
  assert.deepEqual(party[0].moves.map(m => m.id).join(), 'scratch,growl,ember');
  assert.deepEqual(plain(b.result.leveled), [party[0].uid]);
});

test('with four moves, a new one asks which to forget (or none)', () => {
  const gr = G.SPECIES[4].gr;
  const four = ['scratch', 'growl', 'ember', 'smokescreen'];
  for (const slot of [1, -1]) {
    const { ev, b, party } = oneKo({ me: ['charmander', 12, four, { exp: G.Stats.expAt(gr, 13) - 1 }], seed: 2 });
    assert.ok(ev.some(x => x.type === 'learnPrompt' && x.move === 'metal-claw'));
    assert.equal(b.prompt.kind, 'learn');
    const after = b.answer({ learnSlot: slot });
    if (slot === 1) {
      assert.ok(after.some(x => x.type === 'forgot' && x.move === 'growl'));
      assert.equal(party[0].moves[1].id, 'metal-claw');
    } else {
      assert.ok(after.some(x => x.type === 'notLearned'));
      assert.deepEqual(party[0].moves.map(m => m.id).join(), four.join());
    }
    assert.equal(b.result.outcome, 'win');            // the battle ends after the answer
  }
});

test('a Pokémon gaining several levels learns each level\'s moves in order', () => {
  const gr = G.SPECIES[7].gr;
  const { ev } = oneKo({ me: ['squirtle', 5, ['tackle'], { exp: G.Stats.expAt(gr, 10) }],
                         foe: ['onix', 40, ['splash'], { hp: 1 }], seed: 1 });
  const lv = ev.filter(x => x.type === 'levelup').map(x => x.lvl);
  assert.ok(lv.length >= 2 && lv.every((l, i) => !i || l === lv[i - 1] + 1), lv.join());
  const learned = ev.filter(x => x.type === 'learned').map(x => x.move);
  assert.ok(learned.length >= 2, learned.join());
});
