// Grudge (chapter 109; Emerald's Cmd_trysetgrudge, the faint check in battle_script_commands.c, AtkCanceler_UnableToUseMove and
// HandleAction_UseItem in battle_util.c): until its user's next action, a foe's move that knocks it out loses all its PP.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE)).G;
const types = evs => evs.map(e => e.type);
const pp = (mon, id) => mon.moves.find(m => m.id === id).pp;

test('Grudge: knocked out by the foe\'s move, that move loses all its PP; without Grudge, as before; not by Struggle', () => {
  // Misdreavus (faster) uses Grudge, then Slowpoke's Water Gun knocks it out.
  const d = duel(G, { seed: 1, me: ['misdreavus', 30, ['grudge', 'night-shade']], mine: [['pidgey', 30, ['splash']]], foe: ['slowpoke', 30, ['water-gun']] });
  d.party[0].hp = 1;
  const ev = d.b.act({ type: 'move', slot: 0 });
  assert.ok(types(ev).includes('grudgeSet'));
  assert.equal(d.party[0].hp, 0);
  assert.equal(pp(d.foes[0], 'water-gun'), 0, 'all its PP');
  const g = ev.find(e => e.type === 'grudge');
  assert.ok(g && g.move === 'water-gun' && G.BattleText.line(g, d.b).includes(G.Names.move('water-gun')));
  // Without Grudge: one PP used, as always.
  const e = duel(G, { seed: 1, me: ['misdreavus', 30, ['night-shade']], mine: [['pidgey', 30, ['splash']]], foe: ['slowpoke', 30, ['water-gun']] });
  e.party[0].hp = 1;
  e.b.act({ type: 'move', slot: 0 });
  assert.equal(pp(e.foes[0], 'water-gun'), G.Mon.ppMax('water-gun') - 1);
  // Struggle never loses its PP to a grudge (and has none to lose): the knock-out goes on as usual, no grudge line.
  const s = duel(G, { seed: 1, me: ['misdreavus', 30, ['grudge']], mine: [['pidgey', 30, ['splash']]], foe: ['slowpoke', 30, ['water-gun']] });
  s.foes[0].moves[0].pp = 0;
  s.party[0].hp = 1;
  const ev2 = s.b.act({ type: 'move', slot: 0 });
  assert.ok(!types(ev2).includes('grudge'));
});

test('Grudge ends with its user\'s next action; a move of its own side does not count', () => {
  const d = duel(G, { seed: 1, me: ['misdreavus', 30, ['grudge', 'night-shade']], mine: [['pidgey', 30, ['splash']]], foe: ['slowpoke', 30, ['water-gun']] });
  d.b.act({ type: 'move', slot: 0 });                              // Grudge, and it survives Water Gun
  assert.ok(d.party[0].hp > 0 && d.b.player.bm.vol.grudge);
  d.party[0].hp = 1;
  d.b.act({ type: 'move', slot: 1 });                              // Night Shade first: the grudge is gone, then Water Gun
  assert.equal(d.party[0].hp, 0);
  assert.equal(pp(d.foes[0], 'water-gun'), G.Mon.ppMax('water-gun') - 2, 'no grudge any more');
  // Doubles: its ally's Discharge (it hits everyone else) knocks it out: the ally keeps its PP.
  const t = duel(G, { seed: 2, me: ['misdreavus', 50, ['grudge']], mine: [['jolteon', 20, ['discharge']]],
    foe: ['slowpoke', 50, ['splash']], foes: [['slowpoke', 50, ['splash']]], rules: { double: true } });
  t.party[0].hp = 1;
  t.b.act({ type: 'move', slot: 0 });
  const ev = t.b.act({ type: 'move', slot: 0 });
  assert.equal(t.party[0].hp, 0, 'knocked out by its ally');
  assert.ok(!types(ev).includes('grudge'));
  assert.equal(pp(t.party[1], 'discharge'), G.Mon.ppMax('discharge') - 1);
});
