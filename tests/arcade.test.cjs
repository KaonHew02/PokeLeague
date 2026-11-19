// Sinnoh's Battle Arcade (chapter 92): G.Arcade in js/content/sinnoh/sarcade.js. The panels each battle allows, the board, the
// cursor's speed, performance points, the statuses and who they spare, what each panel does, Battle Points, Dahlia's teams; and
// the engine's parts it uses: fog, the field's weather lines, rules.trickRoom, a result's turns.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, plain, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/tower.js', 'js/script/script.js',
  'js/content/sinnoh/scastle.js', 'js/content/sinnoh/sarcade.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const A = G.Arcade;
const id = slug => +Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === slug);
const mon = (sp, lvl = 50, o = {}) => G.Mon.create(id(sp), lvl, Object.assign({ rng: G.RNG(lvl), nature: 'hardy' }, o));
const kindOf = p => A.PANELS[p];

test('the panels each battle allows: its round, and the special ones by its place in the round', () => {
  const a = A.allowed(1);
  assert.deepEqual(plain(a.side), ['psn', 'par', 'brn', 'berry']);
  assert.deepEqual(plain(a.field), [], 'no field panels in the first round');
  assert.deepEqual(plain(a.special), ['swap', 'fast', 'slow', 'none']);
  assert.deepEqual(plain(A.allowed(7).special), ['none'], 'the seventh battle: No Event only');
  assert.deepEqual(plain(A.allowed(8).field), ['sun', 'rain', 'sand', 'hail']);
  assert.deepEqual(plain(A.allowed(22).special), ['swap', 'slow', 'bp', 'none'], 'battle 22, the first of its round: 1 BP');
  assert.deepEqual(plain(A.allowed(23).special), ['swap', 'slow', 'none'], 'battle 23, the second: no 1 BP');
  assert.deepEqual(plain(A.allowed(30).special), ['swap', 'slow', 'random', 'skip', 'none'], 'No Battle on the even ones');
  assert.ok(!A.allowed(29).special.includes('skip'));
  const late = A.allowed(44);
  assert.deepEqual(plain(late.side), ['hp', 'psn', 'par', 'brn', 'slp', 'frz', 'berry', 'item', 'level']);
  assert.deepEqual(plain(late.field), ['sun', 'rain', 'sand', 'hail', 'fog', 'trick']);
  assert.deepEqual(plain(late.special), ['swap', 'fast', 'slow', 'random', 'bp3', 'skip', 'none']);
  assert.ok(A.allowed(43).special.includes('bp') && !A.allowed(43).special.includes('bp3'));
  assert.deepEqual(plain(A.allowed(99)), plain(A.allowed(43)), 'from the 43rd: all of them, by the place in the round');
});

test('the board: sixteen panels the battle allows; whose they are follows the performance points', () => {
  for (const no of [1, 2, 7, 9, 22, 30, 36, 45, 50]) {
    for (const pts of [0, 12, 30]) {
      const b = A.board(no, pts, G.RNG(no * 100 + pts)), a = A.allowed(no);
      assert.equal(b.length, 16);
      for (const t of b) {
        assert.ok([].concat(a.side, a.field, a.special).includes(t.p), `battle ${no}: ${t.p}`);
        assert.equal(t.who != null, kindOf(t.p) === 'side');
        if (t.who) assert.ok(['me', 'foe'].includes(t.who));
      }
    }
  }
  assert.ok(A.board(7, 0, G.RNG(1)).every(t => t.p !== 'none' ? kindOf(t.p) === 'side' : true));
  assert.deepEqual(plain(A.impact(0)), [75, 10, 10, 5]);
  assert.deepEqual(plain(A.impact(5)), [40, 25, 30, 5]);
  assert.deepEqual(plain(A.impact(15)), [30, 30, 35, 5]);
  assert.deepEqual(plain(A.impact(16)), [20, 35, 30, 15]);
  assert.deepEqual(plain(A.impact(21)), [15, 15, 40, 30]);
  // Many boards: few points put most panels on your side, many points on the field and the opponent's.
  const share = (pts, k) => { let n = 0; for (let s = 0; s < 40; s++) n += A.board(44, pts, G.RNG(s)).filter(t => (t.who || kindOf(t.p)) === k).length; return n / 640; };
  assert.ok(share(0, 'me') > 0.65 && share(30, 'me') < 0.25, 'yours: ' + share(0, 'me') + ' / ' + share(30, 'me'));
  assert.ok(share(30, 'field') > 0.3 && share(30, 'special') > 0.2);
  assert.equal(A.land(A.board(1, 0, G.RNG(1)), G.RNG(2)) >= 0, true);
});

test('the cursor: frames a panel by battle and speed', () => {
  assert.deepEqual([-3, -2, -1, 0, 1, 2, 3].map(s => A.frames(1, s)), [20, 16, 8, 4, 3, 2, 1]);
  assert.deepEqual([-3, 0, 3].map(s => A.frames(29, s)), [16, 3, 1]);
  assert.deepEqual([-3, 0, 1].map(s => A.frames(50, s)), [8, 2, 1]);
  assert.equal(A.frames(1, 9), 1, 'no faster than +3');
});

test('performance points: turns, the fainted, those with a status', () => {
  const t = () => [mon('empoleon'), mon('infernape'), mon('torterra')];
  assert.equal(A.performance(t(), 2), 10 + 8 + 6);
  assert.deepEqual([3, 4, 5, 6, 7, 8, 9].map(n => A.performance(t(), n) - 14), [6, 6, 4, 4, 2, 2, 0]);
  const team = t();
  team[0].hp = 0; team[1].status = 'par';
  assert.equal(A.performance(team, 9), 6 + 4, 'one fainted, one with a status');
  team[1].hp = 0; team[2].status = 'brn';
  assert.equal(A.performance(team, 9), 4 + 4);
  team[2].hp = 0;
  assert.equal(A.performance(team, 9), 0 + 6, 'a fainted one\'s status does not count');
  assert.equal(A.performance(t(), null), 4 + 14, 'turns unknown: 4');
});

test('statuses: the types and abilities they spare', () => {
  const r = G.RNG(5);
  assert.ok(!A.afflict(mon('roserade'), 'psn', r) && !A.afflict(mon('bronzong'), 'psn', r), 'poison and steel types');
  assert.ok(!A.afflict(mon('garchomp'), 'par', r) && !A.afflict(mon('luxray'), 'par', r), 'ground (the Arcade), electric (this game)');
  assert.ok(!A.afflict(mon('infernape'), 'brn', r) && !A.afflict(mon('glaceon'), 'frz', r));
  const limber = mon('persian'); limber.ability = 'limber';
  const veil = mon('floatzel'); veil.ability = 'water-veil';
  const insom = mon('honchkrow'); insom.ability = 'insomnia';
  const vital = mon('electivire'); vital.ability = 'vital-spirit';
  const magma = mon('magmortar'); magma.ability = 'magma-armor';
  const imm = mon('snorlax'); imm.ability = 'immunity';
  assert.ok(![[limber, 'par'], [veil, 'brn'], [insom, 'slp'], [vital, 'slp'], [magma, 'frz'], [imm, 'psn']].some(([m, s]) => A.afflict(m, s, r)));
  const m = mon('empoleon');
  assert.ok(!A.afflict(m, 'psn', r), 'Empoleon is a steel type');
  const s = mon('staraptor');
  assert.ok(A.afflict(s, 'slp', r) && s.status === 'slp' && s.slp >= 1 && s.slp <= 3);
  assert.ok(!A.afflict(s, 'par', r), 'one status at a time');
});

test('what the panels do', () => {
  const r = G.RNG(7);
  const mine = [mon('staraptor'), mon('lucario'), mon('gastrodon')], theirs = [mon('rhyperior'), mon('togekiss'), mon('weavile')];
  const maxes = mine.map(m => G.Mon.maxHp(m));
  let fx = A.apply({ p: 'hp', who: 'me' }, mine, theirs, 1, r);
  assert.deepEqual(mine.map(m => m.hp), maxes.map(x => x - Math.floor(x / 5)), 'a fifth of their HP');
  assert.equal(fx.lines.length, 1);
  fx = A.apply({ p: 'psn', who: 'foe' }, mine, theirs, 1, r);
  assert.deepEqual(theirs.map(m => m.status), ['psn', 'psn', 'psn']);
  fx = A.apply({ p: 'par', who: 'foe' }, mine, theirs, 1, r);
  assert.equal(fx.lines[0], 'Nothing happened.', 'they already have a status');
  const two = [mon('staraptor'), mon('lucario'), mon('gastrodon')];
  A.apply({ p: 'slp', who: 'me' }, two, theirs, 30, r);
  assert.equal(two.filter(m => m.status === 'slp').length, 1, 'Sleep: one of them');
  A.apply({ p: 'berry', who: 'me' }, two, theirs, 5, r);
  assert.ok(two.every(m => A.ITEMS[0].berry.includes(m.item)));
  A.apply({ p: 'item', who: 'me' }, two, theirs, 30, r);
  assert.ok(two.every(m => A.ITEMS[1].item.includes(m.item)), 'battles 22-49: the second group');
  A.apply({ p: 'item', who: 'me' }, two, theirs, 60, r);
  assert.ok(two.every(m => A.ITEMS[2].item.includes(m.item)));
  const lv = [mon('staraptor')];
  A.apply({ p: 'level', who: 'me' }, lv, theirs, 9, r);
  assert.equal(lv[0].lvl, 53);
  assert.equal(lv[0].hp, G.Mon.maxHp(lv[0]));
  assert.deepEqual(plain(A.apply({ p: 'fog' }, mine, theirs, 40, r).rules), { weather: 'fog' });
  assert.deepEqual(plain(A.apply({ p: 'trick' }, mine, theirs, 40, r).rules), { trickRoom: true });
  assert.equal(A.apply({ p: 'swap' }, mine, theirs, 1, r).swap, true);
  assert.equal(A.apply({ p: 'fast' }, mine, theirs, 1, r).speed, 1);
  assert.equal(A.apply({ p: 'slow' }, mine, theirs, 1, r).speed, -1);
  assert.equal(A.apply({ p: 'random' }, mine, theirs, 30, r).random, true);
  assert.equal(A.apply({ p: 'bp' }, mine, theirs, 23, r).bp, 1);
  assert.equal(A.apply({ p: 'bp3' }, mine, theirs, 44, r).bp, 3);
  assert.equal(A.apply({ p: 'skip' }, mine, theirs, 30, r).skip, true);
  assert.equal(A.apply({ p: 'none' }, mine, theirs, 7, r).lines.length, 1);
  // Every item a panel gives works when held, and has a name.
  for (const g of A.ITEMS) for (const it of g.berry.concat(g.item)) assert.ok(G.Names.item(it) && G.Names.item(it) !== it, it);
  // Every panel has a name on the board.
  for (const p of Object.keys(A.PANELS)) assert.ok(A.label({ p, who: A.PANELS[p] === 'side' ? 'me' : null }).name, p);
});

test('Battle Points by the round; Dahlia\'s teams', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 20].map(A.bpFor), [2, 2, 2, 2, 4, 4, 5, 6, 6, 6]);
  assert.equal(A.dahlia(21).print, 'silver');
  assert.equal(A.dahlia(49).print, 'gold');
  assert.equal(A.dahlia(22), null);
  for (const no of [21, 49]) {
    for (const [sp, lvl, moves, item, o] of A.dahlia(no).team) {
      assert.ok(id(sp), sp);
      assert.equal(lvl, no === 21 ? 48 : 47, 'lowered from 50 for normal difficulty');
      assert.equal(item, null);
      assert.deepEqual(plain(o.ivs), [31, 31, 31, 31, 31, 31]);
      assert.ok(G.NATURES[o.nature], o.nature);
      for (const m of moves) assert.ok(G.MOVES[m], m);
    }
  }
});

test('the engine: fog, the field\'s weather lines, Trick Room from the start, a result\'s turns', () => {
  // Fog: accuracy x0.6 (a 100% move misses about four times in ten).
  let miss = 0;
  for (let s = 1; s <= 60; s++) {
    const d = duel(G, { me: ['lucario', 50, ['aura-sphere', 'tackle']], foe: ['blissey', 50, ['splash']], seed: s, rules: { weather: 'fog' } });
    const ev = d.b.act({ type: 'move', slot: 1 });
    if (ev.some(e => e.type === 'miss')) miss++;
  }
  assert.ok(miss > 12 && miss < 38, 'misses in fog: ' + miss);
  let clear = duel(G, { me: ['lucario', 50, ['tackle']], foe: ['blissey', 50, ['splash']], seed: 1 });
  let ev = clear.b.act({ type: 'move', slot: 0 });
  assert.ok(!ev.some(e => e.type === 'miss'));
  // The field's weather and Trick Room, said at the start.
  for (const [w, line] of [['rain', 'It is raining.'], ['sun', 'The sunlight is strong.'], ['sand', 'A sandstorm is raging.'], ['hail', 'It is hailing.'], ['fog', 'The fog is deep...']]) {
    const d = duel(G, { me: ['lucario', 50, ['tackle']], foe: ['blissey', 50, ['splash']], rules: { weather: w } });
    const e = d.events.find(x => x.type === 'weather');
    assert.equal(G.BattleText.line(e, d.b), line);
  }
  const tr = duel(G, { me: ['lucario', 50, ['tackle']], foe: ['blissey', 50, ['splash']], rules: { trickRoom: true } });
  assert.equal(tr.b.trickRoom, 5);
  assert.equal(G.BattleText.line(tr.events.find(x => x.type === 'trickRoom'), tr.b), 'The dimensions are twisted!');
  // Defog blows the fog away.
  const df = duel(G, { me: ['togekiss', 50, ['defog']], foe: ['blissey', 50, ['splash']], rules: { weather: 'fog' } });
  ev = df.b.act({ type: 'move', slot: 0 });
  assert.equal(df.b.weather, null);
  assert.equal(G.BattleText.line(ev.find(x => x.type === 'weatherEnd'), df.b), 'The fog lifted.');
  // A result says how many turns the battle took.
  const k = duel(G, { me: ['garchomp', 60, ['earthquake']], foe: ['pikachu', 5, ['splash']], kind: 'trainer' });
  k.b.act({ type: 'move', slot: 0 });
  assert.equal(k.b.result.outcome, 'win');
  assert.equal(k.b.result.turns, 1);
});
