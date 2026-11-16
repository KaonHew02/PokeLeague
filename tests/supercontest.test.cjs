// The Super Contest's rules (chapter 85): js/world/supercontest.js. Visual from condition, the dances on the beat, the
// Acting round's voltage, judges and every one of the 22 move effects, the order, the standings, the rivals.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, plain } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, ['js/core/store.js', 'js/world/maps.js', 'js/world/field.js', 'js/world/poffin.js', 'js/world/supercontest.js'])).G;
G.Field.bind(G.Store.newSave({ name: 'Dawn', id: 4321 }));
const SC = G.SuperContest;
/** A move with this Super Contest effect (and category). */
const mv = (sce, ct) => Object.keys(G.MOVES).find(k => G.MOVES[k].sce === sce && (!ct || G.MOVES[k].ct === ct));
const entrant = (moves, o = {}) => Object.assign({ name: 'X', mon: { sp: 25, moves, cond: {}, sheen: 0, nature: 'hardy' } }, o);
/** One Acting turn: four entrants each with its move, to its judge; in `order`, with the judges' voltage. */
function turn(cat, moves, judges, o = {}) {
  const st = SC.create({ cat, rank: 'normal', seed: o.seed || 1, entrants: moves.map(m => entrant([m, 'tackle'])) });
  st.order = o.order || [0, 1, 2, 3];
  st.voltage = (o.voltage || [0, 0, 0]).slice();
  if (o.turn) st.turn = o.turn;
  if (o.prep) o.prep(st);
  const r = SC.playTurn(st, moves.map((m, i) => ({ move: m, judge: judges[i] })));
  const ev = i => r.events.find(e => e.i === i);
  return { st, r, ev };
}
const BASE = mv(5, 'cool'), BEAUTY = mv(5, 'beauty'), CUTE = mv(5, 'cute');

test('the categories: two related neighbours and two that clash, on a circle', () => {
  assert.deepEqual(plain(SC.near('cool')), ['tough', 'beauty']);
  assert.deepEqual(plain(SC.clash('cool')), ['cute', 'smart']);
  assert.deepEqual(plain(SC.clash('tough')), ['beauty', 'cute']);
  for (const c of SC.CATS) assert.equal(new Set([c, ...SC.near(c), ...SC.clash(c)]).size, 5, c);
  assert.ok(Object.values(G.MOVES).every(m => SC.CATS.includes(m.ct) && G.SUPER_CONTEST[m.sce]), 'every move has a category and an effect');
});

test('Visual: the matching condition and half of the related ones and the sheen, in hearts by rank', () => {
  const mon = { cond: { cool: 100, beauty: 40, tough: 20, cute: 200, smart: 0 }, sheen: 60 };
  assert.equal(SC.visualPoints(mon, 'cool'), 100 + Math.floor((40 + 20 + 60) / 2));
  const st = SC.create({ cat: 'cool', rank: 'great', seed: 1, entrants: [entrant(['tackle']), entrant(['tackle']), entrant(['tackle']), entrant(['tackle'])] });
  st.entrants[0].mon = Object.assign(st.entrants[0].mon, mon);
  SC.visual(st);
  assert.equal(st.entrants[0].visual, Math.floor(160 / 30));
  assert.equal(st.entrants[1].visual, 0, 'no condition, no hearts');
});

test('Dance: steps graded on the beat (Excellent 2, Good 1), the lead sets the way, the backups copy it', () => {
  const B = SC.BEAT.normal, [ex, gd] = SC.WIN.normal;
  assert.equal(SC.STEPS.normal, 3);
  assert.equal(SC.STEPS.great, 4);
  assert.deepEqual([SC.grade(0, 'normal'), SC.grade(ex, 'normal'), SC.grade(ex + 1, 'normal'), SC.grade(gd, 'normal'), SC.grade(gd + 1, 'normal')], [2, 2, 1, 1, 0]);
  // The lead: beats 1-3; the second step is late (Good), the third missed.
  const lead = SC.danceLead([{ dir: 'up', t: B + 5 }, { dir: 'left', t: 2 * B + ex + 20 }, { dir: 'down', t: 5 * B }], 'normal');
  assert.deepEqual(plain(lead), { points: 3, seq: ['up', 'left', null] });
  // A backup on beats 4-6: the right way on time; the wrong way scores nothing; any way where the lead missed.
  assert.equal(SC.danceBack([{ dir: 'up', t: 4 * B }, { dir: 'left', t: 5 * B }, { dir: 'right', t: 6 * B - 10 }], lead.seq, 'normal'), 6);
  assert.equal(SC.danceBack([{ dir: 'down', t: 4 * B }, { dir: 'left', t: 5 * B }], lead.seq, 'normal'), 2);
  assert.equal(SC.danceBack([{ dir: 'up', t: B }], lead.seq, 'normal'), 0, 'too early: not on its beats');
  assert.equal(SC.danceBack([{ dir: 'up', t: 4 * B }], ['up', 'up', 'up'], 'normal'), 2, 'one input counts once');
  // The computers: the same steps for the same contest; a perfect one scores everything.
  const st = SC.create({ cat: 'cool', rank: 'normal', seed: 9, entrants: [0, 1, 2, 3].map(() => entrant(['tackle'], { skill: 1 })) });
  const a = SC.npcSteps(st, 1, null);
  assert.equal(SC.danceLead(a, 'normal').points, 6);
  const again = SC.create({ cat: 'cool', rank: 'normal', seed: 9, entrants: [0, 1, 2, 3].map(() => entrant(['tackle'], { skill: 1 })) });
  assert.deepEqual(plain(SC.npcSteps(again, 1, null)), plain(a));
  assert.equal(SC.danceBack(SC.npcSteps(st, 2, SC.danceLead(a, 'normal').seq), SC.danceLead(a, 'normal').seq, 'normal'), 6);
  // Who leads: the lowest after Visual first.
  st.entrants.forEach((e, i) => { e.visual = [5, 9, 1, 7][i]; });
  assert.deepEqual([0, 1, 2, 3].map(r => SC.leadOf(st, r)), [2, 0, 3, 1]);
});

test('Acting: voltage up for the category, down for a clash; filled at five for +5 (+8 the head judge) and back to 0; the judges\' hearts by how many chose them', () => {
  let t = turn('cool', [BASE, BEAUTY, CUTE, BASE], [0, 1, 1, 2], { voltage: [0, 2, 0] });
  assert.deepEqual(plain(t.st.voltage), [1, 1, 1], 'cool +1; beauty nothing; cute (a clash) -1; cool +1');
  assert.deepEqual(plain(t.r.share), [3, 2, 2, 3]);
  assert.equal(t.ev(0).hearts, 3);
  t = turn('cool', [BASE, BASE, BASE, BASE], [1, 1, 0, 2], { voltage: [4, 4, 0] });
  assert.equal(t.ev(0).hearts, 3 + 8, 'the head judge: +8');
  assert.ok(t.ev(0).filled && t.st.voltage[1] === 1, 'back to 0, then the next one raises it');
  assert.equal(t.ev(2).hearts, 3 + 5);
  assert.deepEqual(plain(t.r.share), [2, 2, 3, 3]);
  t = turn('cool', [CUTE, BASE, BASE, BASE], [0, 0, 0, 0]);
  assert.deepEqual(plain(t.r.share), [0, 0, 0, 0], 'all four to one judge: nothing');
  assert.equal(t.st.voltage[0], 3, 'never below 0');
});

test('Acting: a move cannot be used twice in a row unless it says so', () => {
  const st = SC.create({ cat: 'cool', rank: 'normal', seed: 1, entrants: [0, 1, 2, 3].map(() => entrant([BASE, mv(7, 'cool')])) });
  st.entrants[0].last = BASE;
  st.entrants[1].last = mv(7, 'cool');
  assert.deepEqual(plain(SC.choices(st, 0).map(o => o.ok)), [false, true]);
  assert.deepEqual(plain(SC.choices(st, 1).map(o => o.ok)), [true, true], 'effect 7 repeats');
  const r = SC.playTurn(st, [{ move: BASE, judge: 0 }, { move: mv(7, 'cool'), judge: 1 }, { move: BASE, judge: 2 }, { move: BASE, judge: 2 }]);
  const e0 = r.events.find(e => e.i === 0);
  assert.deepEqual([e0.ok, e0.hearts, e0.dv], [false, 0, 0], 'a repeat earns nothing and moves no voltage');
  assert.equal(r.events.find(e => e.i === 1).hearts, 2);
});

test('Acting: every effect does what it says', () => {
  const cool = (sce) => mv(sce, 'cool');
  // 1 / 2: first / last next turn, whatever the hearts.
  let t = turn('cool', [BASE, BASE, BASE, mv(1)], [0, 1, 2, 0]);
  assert.equal(t.st.order[0], 3);
  t = turn('cool', [mv(2, 'cool'), CUTE, CUTE, CUTE], [0, 1, 2, 1]);
  assert.equal(t.st.order[3], 0);
  // 4: +2 if the voltage rises.
  assert.equal(turn('cool', [mv(4, 'cool'), BASE, BASE, BASE], [0, 1, 2, 1]).ev(0).hearts, 4);
  assert.equal(turn('cool', [mv(4, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1]).ev(0).hearts, 2);
  // 6: +3 alone at its judge.
  assert.equal(turn('cool', [mv(6), BASE, BASE, BASE], [0, 1, 2, 1]).ev(0).hearts, 4);
  assert.equal(turn('cool', [mv(6), BASE, BASE, BASE], [0, 0, 2, 1]).ev(0).hearts, 1);
  // 8: the voltage it raises to.
  assert.equal(turn('cool', [cool(8), BASE, BASE, BASE], [0, 1, 2, 1], { voltage: [2, 0, 0] }).ev(0).hearts, 3);
  assert.equal(turn('cool', [mv(8, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1], { voltage: [2, 0, 0] }).ev(0).hearts, 0);
  // 9: +15 when all four pick the same judge.
  assert.equal(turn('cool', [mv(9), BASE, BASE, BASE], [1, 1, 1, 1]).ev(0).hearts, 15);
  assert.equal(turn('cool', [mv(9), BASE, BASE, BASE], [1, 1, 1, 0]).ev(0).hearts, 0);
  // 10: every judge's voltage down by one.
  assert.deepEqual(plain(turn('cool', [mv(10, 'beauty'), CUTE, CUTE, CUTE], [0, 2, 2, 2], { voltage: [2, 2, 2], order: [1, 2, 3, 0] }).st.voltage), [1, 1, 0]);
  // 11: double the next turn.
  t = turn('cool', [mv(11), BASE, BASE, BASE], [0, 1, 2, 1]);
  const r2 = SC.playTurn(t.st, [{ move: BASE, judge: 0 }, { move: CUTE, judge: 1 }, { move: CUTE, judge: 2 }, { move: CUTE, judge: 1 }]);
  assert.equal(r2.events.find(e => e.i === 0).hearts, 6);
  // 12: the voltage the one before left.
  assert.equal(turn('cool', [BASE, mv(12), BASE, BASE], [0, 1, 2, 2], { voltage: [2, 0, 0] }).ev(1).hearts, 3);
  // 13 / 19: no voltage up (down) for the rest of the turn.
  assert.equal(turn('cool', [mv(13, 'beauty'), BASE, BASE, BASE], [0, 0, 1, 2]).st.voltage[0], 0);
  assert.equal(turn('cool', [mv(19, 'beauty'), CUTE, BASE, BASE], [0, 0, 1, 2], { voltage: [2, 0, 0] }).st.voltage[0], 2);
  // 14: the next order shuffled (the same for the same seed).
  const s1 = turn('cool', [mv(14), BASE, BASE, BASE], [0, 1, 2, 1], { seed: 3 }).st.order, s2 = turn('cool', [mv(14), BASE, BASE, BASE], [0, 1, 2, 1], { seed: 3 }).st.order;
  assert.deepEqual(plain(s1), plain(s2));
  assert.deepEqual(plain(s1.slice().sort()), [0, 1, 2, 3]);
  // 15: double in the last turn.
  assert.equal(turn('cool', [mv(15), CUTE, CUTE, CUTE], [0, 1, 2, 1], { turn: 3 }).ev(0).hearts, 4);
  assert.equal(turn('cool', [mv(15), CUTE, CUTE, CUTE], [0, 1, 2, 1]).ev(0).hearts, 2);
  // 16: more the lower the judge's voltage.
  assert.equal(turn('cool', [mv(16, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1]).ev(0).hearts, 4);
  assert.equal(turn('cool', [mv(16, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1], { voltage: [3, 0, 0] }).ev(0).hearts, 1);
  // 17 / 18: first / last.
  assert.equal(turn('cool', [mv(17, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1]).ev(0).hearts, 4);
  assert.equal(turn('cool', [mv(17, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1], { order: [1, 0, 2, 3] }).ev(0).hearts, 2);
  assert.equal(turn('cool', [mv(18, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1], { order: [1, 2, 3, 0] }).ev(0).hearts, 4);
  // 20: +3 raising the voltage right after another did (a Smart contest: no Cool move has it).
  const SMART = mv(5, 'smart');
  assert.equal(turn('smart', [SMART, mv(20, 'smart'), SMART, SMART], [0, 1, 2, 2]).ev(1).hearts, 4);
  assert.equal(turn('smart', [mv(5, 'tough'), mv(20, 'smart'), SMART, SMART], [0, 1, 2, 2]).ev(1).hearts, 1);
  // 21: its place in the order.
  assert.equal(turn('cool', [mv(21, 'beauty'), BASE, BASE, BASE], [0, 1, 2, 1], { order: [1, 2, 0, 3] }).ev(0).hearts, 3);
  // 22: +3 after the one before filled a voltage.
  assert.equal(turn('cool', [BASE, mv(22, 'beauty'), BASE, BASE], [0, 1, 2, 2], { voltage: [4, 0, 0] }).ev(1).hearts, 5);
  // 23: +3 for the lowest score of the turn.
  assert.equal(turn('cool', [mv(23), BASE, BASE, BASE], [0, 1, 2, 1]).ev(0).hearts, 4);
});

test('the order: the first turn by the Visual and Dance totals, then by the hearts of the turn before; the standings', () => {
  const st = SC.create({ cat: 'cool', rank: 'normal', seed: 1, entrants: [0, 1, 2, 3].map(() => entrant([BASE, CUTE])) });
  st.entrants.forEach((e, i) => { e.visual = [2, 9, 4, 4][i]; e.dance = [1, 0, 6, 2][i]; });
  assert.deepEqual(plain(SC.startTurn(st)), [2, 1, 3, 0]);
  SC.playTurn(st, [{ move: BASE, judge: 0 }, { move: CUTE, judge: 1 }, { move: CUTE, judge: 1 }, { move: BASE, judge: 2 }]);
  assert.deepEqual(plain(st.order.slice(0, 2).sort()), [0, 3], 'the two who scored most go first');
  st.entrants.forEach((e, i) => { e.acting = [10, 10, 3, 12][i]; e.visual = [3, 4, 0, 0][i]; e.dance = [5, 4, 0, 0][i]; });
  const s = SC.standings(st);
  assert.deepEqual(plain(s.map(x => [x.i, x.place])), [[1, 1], [0, 2], [3, 3], [2, 4]], 'ties by Acting, then Visual');
});

test('rivals: from the category\'s list, its moves first, stronger with the rank, the same for the same seed; a whole contest without a screen', () => {
  const a = SC.rivals('cute', 'normal', 77), b = SC.rivals('cute', 'normal', 77);
  assert.deepEqual(plain(a), plain(b));
  assert.equal(a.length, 3);
  for (const r of a) {
    assert.ok(SC.ROSTER.cute.map(s => G.Maps.species(s)).includes(r.mon.sp));
    assert.ok(r.mon.moves.length >= 1 && r.mon.moves.length <= 4);
    assert.ok(G.MOVES[r.mon.moves[0]].ct === 'cute' || SC.near('cute').includes(G.MOVES[r.mon.moves[0]].ct));
    assert.ok(Math.abs(r.mon.cond.cute - SC.COND.normal) <= 20);
  }
  assert.ok(SC.rivals('cute', 'master', 77).every(r => r.mon.cond.cute >= SC.COND.master - 20 && r.skill === SC.SKILL.master));
  const play = () => { const st = SC.create({ cat: 'cute', rank: 'normal', seed: 77, entrants: [entrant(['charm', 'sweet-kiss', 'attract', 'tackle'], { player: true })].concat(SC.rivals('cute', 'normal', 77)) }); return [SC.auto(st), st]; };
  const [s1, st] = play(), [s2] = play();
  assert.deepEqual(plain(s1), plain(s2), 'the same contest each time');
  assert.equal(st.turn, 4);
  assert.ok(st.entrants.every(e => e.dance > 0 && e.acting > 0));
  assert.ok(SC.ribbonName('cool-normal') && SC.ribbonName('cute-master') !== SC.ribbonName('cute-normal'));
});

test('Hoenn (chapter 86): its ranks play as Sinnoh\'s of the same place, its rivals from the Hoenn lists, its ribbons and the label', () => {
  assert.deepEqual(plain(SC.HOENN_RANKS), ['normal', 'super', 'hyper', 'master']);
  assert.deepEqual(plain(SC.HOENN_RANKS.map(r => SC.TIER[r])), plain(SC.RANKS));
  for (const cat of SC.CATS) {
    const list = SC.ROSTERS.hoenn[cat];
    assert.equal(list.length, 8, cat);
    for (const slug of list) {
      const sp = G.Maps.species(slug);
      assert.ok(sp && sp <= 386, slug + ' is from the first three generations');
      const moves = SC.movesFor(sp, cat, SC.LEVEL.normal, G.RNG(1));
      assert.ok(moves.some(id => G.MOVES[id].ct === cat), slug + ' has a move of its category');
    }
    for (const rank of SC.RANKS) {
      const r = SC.rivals(cat, rank, 5, 'hoenn');
      assert.ok(r.every(x => list.map(s => G.Maps.species(s)).includes(x.mon.sp)), cat + ' ' + rank);
      assert.deepEqual(plain(r), plain(SC.rivals(cat, rank, 5, 'hoenn')), 'the same for the same seed');
    }
  }
  assert.ok(SC.rivals('cool', 'normal', 5).every(x => SC.ROSTER.cool.map(s => G.Maps.species(s)).includes(x.mon.sp)), 'Sinnoh by default');
  assert.equal(SC.ribbonName('hoenn-cool-normal'), 'Cool Ribbon');
  assert.equal(SC.ribbonName('hoenn-cool-super'), 'Cool Ribbon Super');
  assert.equal(SC.ribbonName('hoenn-beauty-hyper'), 'Beauty Ribbon Hyper');
  assert.equal(SC.ribbonName('hoenn-smart-master'), 'Smart Ribbon Master');
  assert.equal(SC.hoennRankName('hyper'), 'Hyper Rank');
  const st = SC.create({ cat: 'cool', rank: 'great', seed: 3, label: 'Super Rank', entrants: [entrant(['tackle'])] });
  assert.equal(st.label, 'Super Rank');
  assert.equal(SC.create({ cat: 'cool', rank: 'great', seed: 3, entrants: [entrant(['tackle'])] }).label, null);
});
