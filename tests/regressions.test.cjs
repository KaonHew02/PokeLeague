// Bugs found by the read-only review of the battle engine (2026-10-22), one test each.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel } = require('./helpers.cjs');
const G = battleBoot();
const act = (b, slot = 0) => b.act({ type: 'move', slot });
const turns = (b, n) => { const all = []; for (let i = 0; i < n && b.prompt && b.prompt.kind === 'action'; i++) all.push(...act(b)); return all; };

test('an interrupted Fly / Dig does not leave the user out of reach forever', () => {
  for (let s = 1; s <= 40; s++) {
    for (const [sp, mv] of [['pidgey', 'fly'], ['diglett', 'dig']]) {
      const { b } = duel(G, { me: [sp, 30, [mv], { status: 'par' }], foe: ['rattata', 30, ['tackle']], seed: s });
      for (let i = 0; i < 8 && b.prompt && b.prompt.kind === 'action'; i++) {
        act(b);
        const v = b.player.bm.vol;
        assert.ok(v.charging || !v.invuln, `${sp} seed ${s}: invulnerable without charging`);
      }
    }
  }
});

test('weather changes damage: Sunny Day powers up Ember', () => {
  let sun = 0, none = 0;
  for (let s = 1; s <= 30; s++) {
    for (const w of [null, 'sun']) {
      const { b } = duel(G, { me: ['charmander', 30, ['ember']], foe: ['rattata', 30, ['splash']], seed: s });
      if (w) b.weather = { w, turns: 5 };
      const d = act(b).find(e => e.type === 'damage' && e.side === 1);
      if (d) { if (w) sun += d.amt; else none += d.amt; }
    }
  }
  assert.ok(sun > none * 1.3, `sun ${sun} vs none ${none}`);
});

test('both last Pokémon fainting at once is a loss for the player', () => {
  let checked = 0;
  for (let s = 1; s <= 20; s++) {
    const { b } = duel(G, { me: ['geodude', 30, ['explosion']], foe: ['rattata', 5, ['splash']], seed: s });
    const ev = act(b);
    if (!ev.some(e => e.type === 'faint' && e.side === 1)) continue;
    checked++;
    assert.equal(b.result.outcome, 'lose');
  }
  assert.ok(checked > 10);
});

test('Thunder only hits a flying target; Gust and Twister double against it', () => {
  assert.ok(!G.SpecialMoves.thunder.doubleVsInvuln);
  assert.ok(G.SpecialMoves.gust.doubleVsInvuln && G.SpecialMoves.earthquake.doubleVsInvuln && G.SpecialMoves.surf.doubleVsInvuln);
  assert.ok(G.SpecialMoves['sky-uppercut'].hitsInvuln.includes('fly'));
});

test('Tri Attack sometimes burns, paralyses or freezes', () => {
  let st = 0;
  for (let s = 1; s <= 200; s++) {
    const { b } = duel(G, { me: ['porygon', 50, ['tri-attack']], foe: ['snorlax', 50, ['splash']], seed: s });
    if (act(b).some(e => e.type === 'status' && e.side === 1)) st++;
  }
  assert.ok(st > 20 && st < 70, `statuses ${st}/200`);
});

test('Bounce and Dive take two turns; Brick Break breaks Reflect and Light Screen', () => {
  for (const mv of ['bounce', 'dive']) {
    const { b } = duel(G, { me: [mv === 'dive' ? 'seel' : 'magikarp', 40, [mv]], foe: ['chansey', 40, ['splash']] });
    const ev = act(b);
    const c = ev.findIndex(e => e.type === 'charge'), u = ev.findIndex(e => e.type === 'move' && e.move === mv);
    assert.ok(c >= 0 && u > c, mv);
  }
  const { b } = duel(G, { me: ['machop', 40, ['brick-break']], foe: ['chansey', 40, ['splash']] });
  b.foe.field.reflect = 5; b.foe.field.lightScreen = 5;
  const ev = act(b);
  if (ev.some(e => e.type === 'damage' && e.side === 1)) {
    assert.ok(ev.some(e => e.type === 'screensBroken'));
    assert.ok(!b.foe.field.reflect && !b.foe.field.lightScreen);
  }
});

test('trapping moves hurt 4–5 times, and stop when the one holding on leaves', () => {
  const counts = new Set();
  for (let s = 1; s <= 30; s++) {
    const { b } = duel(G, { me: ['ekans', 40, ['wrap'], { hp: 999 }], foe: ['snorlax', 40, ['splash']], seed: s });
    const ev = act(b);
    if (!ev.some(e => e.type === 'trap')) continue;
    b.player.bm.mon.moves[0].id = 'splash';                 // stop using Wrap
    const rest = turns(b, 8);
    counts.add(ev.concat(rest).filter(e => e.type === 'damage' && e.why === 'trap').length);
  }
  assert.ok([...counts].every(n => n === 4 || n === 5), [...counts].join());
  // Switching the trapper out frees the target.
  for (let s = 1; s <= 10; s++) {
    const { b } = duel(G, { me: ['ekans', 40, ['wrap']], mine: [['pidgey', 40, ['splash']]], foe: ['snorlax', 40, ['splash']], seed: s });
    if (!act(b).some(e => e.type === 'trap')) continue;
    const ev = b.act({ type: 'switch', to: 1 });
    assert.ok(!ev.some(e => e.type === 'damage' && e.why === 'trap'));
    assert.equal(b.foe.bm.vol.trap, null);
    break;
  }
});

test('Mean Look ends when its user leaves', () => {
  const { b } = duel(G, { me: ['pikachu', 30, ['tackle']], foe: ['gastly', 30, ['mean-look']], foes: [['zubat', 30, ['splash']]], kind: 'trainer' });
  act(b);
  assert.ok(b.options().trapped);
  b.foe.party[0].hp = 0; b.foe.bm.mon.hp = 0;
  b.sendOut(b.foe, 1);
  assert.ok(!b.options().trapped);
});

test('trainer AI does not waste turns on statuses the target is immune to', () => {
  const { b } = duel(G, { me: ['charmander', 20, ['scratch']], foe: ['vulpix', 20, ['will-o-wisp']] });
  assert.equal(G.BattleAI.score(b, b.player.bm, b.foe.bm, 'will-o-wisp'), 0);   // Vulpix is Fire
  const p = duel(G, { me: ['pikachu', 20, ['tackle']], foe: ['grimer', 20, ['thunder-wave', 'poison-powder']] });
  assert.equal(G.BattleAI.score(p.b, p.b.foe.bm, p.b.player.bm, 'thunder-wave'), 0);    // Pikachu is Electric
  assert.equal(G.BattleAI.score(p.b, p.b.player.bm, p.b.foe.bm, 'poison-powder'), 0);   // Grimer is Poison
});

test('Explosion against Protect still knocks out the user; High Jump Kick on a Ghost crashes', () => {
  const { b } = duel(G, { me: ['geodude', 30, ['explosion']], mine: [['pidgey', 30, ['tackle']]], foe: ['rattata', 30, ['protect']] });
  const ev = act(b);
  assert.ok(ev.some(e => e.type === 'protected'));
  assert.ok(ev.some(e => e.type === 'faint' && e.side === 0));
  const h = duel(G, { me: ['hitmonlee', 30, ['high-jump-kick']], foe: ['gastly', 30, ['splash']] });
  const hv = act(h.b);
  assert.ok(hv.some(e => e.type === 'noEffect') || hv.some(e => e.type === 'miss'));
  assert.ok(hv.some(e => e.type === 'damage' && e.side === 0 && e.why === 'crash'));
});

test('learning a fifth move without a slot changes nothing', () => {
  const m = G.Mon.create(25, 20, { rng: G.RNG(1), moves: ['thunder-shock', 'growl', 'tail-whip', 'quick-attack'] });
  assert.equal(G.Mon.learn(m, 'thunderbolt'), false);
  assert.equal(m.moves.map(x => x.id).join(), 'thunder-shock,growl,tail-whip,quick-attack');
});
