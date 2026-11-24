// Chapter 110: common moves made real, Platinum's rules (pret/pokeplatinum: effect scripts 0112, 0249, 0175, 0170, 0128, 0127,
// 0179, 0148, 0225; battle_script.c BtlCmd_TrySpikes, CheckSpikes, TryToxicSpikes, CheckToxicSpikes, RapidSpin, TryWish,
// TryFutureSight, TryPursuit; subscript_hazards_check; battle_controller_player.c's turn start and end of turn).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, duel } = require('./helpers.cjs');

const G = boot(CORE.concat(DATA, BATTLE)).G;
const types = evs => evs.map(e => e.type);
const pp = (mon, id) => mon.moves.find(m => m.id === id).pp;
const max = mon => G.Mon.maxHp(mon);

test('Spikes: three layers at most; 1/8, 1/6, 1/4 of the max HP on the one coming in; not Flying types or Levitate (unless Gravity), not Magic Guard', () => {
  const d = duel(G, { seed: 1, me: ['skarmory', 50, ['spikes']], foe: ['snorlax', 50, ['splash']],
    foes: [['rattata', 50, ['splash']], ['pidgey', 50, ['splash']], ['gastly', 50, ['splash']], ['clefable', 50, ['splash'], { ability: 'magic-guard' }],
           ['raticate', 50, ['splash']], ['sentret', 50, ['splash']]] });
  const b = d.b, foe = b.foe;
  const comeIn = i => { const m = foe.party[i], before = m.hp; b.switchIn(foe, i); return before - m.hp; };
  b.act({ type: 'move', slot: 0 });
  assert.equal(foe.spikes, 1);
  assert.equal(comeIn(1), Math.floor(max(foe.party[1]) / 8), 'one layer: 1/8');
  assert.equal(comeIn(2), 0, 'Flying');
  assert.equal(comeIn(3), 0, 'Levitate');
  assert.equal(comeIn(4), 0, 'Magic Guard');
  b.gravity = 5;
  b.switchIn(foe, 0);
  assert.equal(comeIn(2) > 0, true, 'Gravity brings it down');
  b.gravity = 0;
  b.switchIn(foe, 0);
  b.act({ type: 'move', slot: 0 });
  assert.equal(comeIn(5), Math.floor(max(foe.party[5]) / 6), 'two layers: 1/6');
  b.switchIn(foe, 0);
  b.act({ type: 'move', slot: 0 });
  assert.equal(comeIn(6), Math.floor(max(foe.party[6]) / 4), 'three layers: 1/4');
  b.switchIn(foe, 0);
  assert.ok(types(b.act({ type: 'move', slot: 0 })).includes('fail'), 'a fourth fails');
  assert.equal(foe.spikes, 3);
});

test('Toxic Spikes: poison with one layer, bad poison with two; a grounded Poison type takes them away; Steel and Flying types untouched', () => {
  const d = duel(G, { seed: 1, me: ['roserade', 50, ['toxic-spikes']], foe: ['snorlax', 50, ['splash']],
    foes: [['rattata', 50, ['splash']], ['raticate', 50, ['splash']], ['magnemite', 50, ['splash']], ['zubat', 50, ['splash']], ['grimer', 50, ['splash']], ['sentret', 50, ['splash']]] });
  const b = d.b, foe = b.foe, P = foe.party;
  b.act({ type: 'move', slot: 0 });
  b.switchIn(foe, 1);
  assert.equal(P[1].status, 'psn');
  b.act({ type: 'move', slot: 0 });
  assert.equal(foe.toxicSpikes, 2);
  b.switchIn(foe, 2);
  assert.equal(P[2].status, 'tox');
  b.switchIn(foe, 3);
  assert.equal(P[3].status, null, 'Steel');
  b.switchIn(foe, 4);
  assert.ok(P[4].status == null && foe.toxicSpikes === 2, 'Poison and Flying: not grounded, nothing taken away');
  const ev = (b.switchIn(foe, 5), b.events);
  assert.ok(ev.some(e => e.type === 'toxicSpikesGone') && foe.toxicSpikes === 0 && P[5].status == null, 'a grounded Poison type');
  b.switchIn(foe, 6);
  assert.equal(P[6].status, null);
});

test('Rapid Spin blows away the hazards on its own side; Defog those on the foe\'s', () => {
  const d = duel(G, { seed: 1, me: ['forretress', 50, ['rapid-spin', 'defog']], foe: ['snorlax', 50, ['splash']] });
  const b = d.b;
  Object.assign(b.player, { spikes: 2, toxicSpikes: 1, rocks: true });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.deepEqual([b.player.spikes, b.player.toxicSpikes, b.player.rocks], [0, 0, false]);
  assert.equal(ev.filter(e => e.type === 'hazardGone').length, 3);
  Object.assign(b.foe, { spikes: 3, toxicSpikes: 2 });
  b.act({ type: 'move', slot: 1 });
  assert.deepEqual([b.foe.spikes, b.foe.toxicSpikes], [0, 0]);
});

test('Taunt: three to five turns without status moves (the menu, a move chosen before it, the AI); then it wears off; twice fails', () => {
  // Sableye is faster and taunts; Snorlax had chosen Growl.
  const d = duel(G, { seed: 3, me: ['snorlax', 50, ['growl', 'tackle']], foe: ['sableye', 70, ['taunt']] });
  const b = d.b;
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(types(ev).includes('taunt') && types(ev).includes('tauntBlocked'), 'Growl, chosen before the taunt, is stopped');
  const n = b.player.bm.vol.taunt;
  assert.ok(n >= 2 && n <= 4, 'three to five turns, one already over');
  assert.equal(b.options().moves[0].usable, false);
  assert.equal(b.options().moves[1].usable, true);
  let ended = false;
  for (let i = 0; i < 5 && !ended; i++) ended = types(b.act({ type: 'move', slot: 1 })).includes('tauntEnd');
  assert.ok(ended && b.options().moves[0].usable);
  // The AI leaves status moves alone while taunted; and a second Taunt fails.
  const e = duel(G, { seed: 3, me: ['sableye', 70, ['taunt']], foe: ['snorlax', 50, ['growl', 'tackle']] });
  e.b.act({ type: 'move', slot: 0 });
  assert.ok(e.b.foe.bm.vol.taunt > 0);
  for (let i = 0; i < 6; i++) assert.ok(G.BattleAI.choose(e.b, e.b.foe).slot !== 0 || !e.b.foe.bm.vol.taunt);
  assert.ok(types(e.b.act({ type: 'move', slot: 0 })).includes('fail'));
});

test('Focus Punch: it tightens its focus as the turn begins; hit before it moves, it loses its focus (the PP spent); else it hits', () => {
  const d = duel(G, { seed: 1, me: ['machamp', 50, ['focus-punch']], foe: ['jolteon', 50, ['thunderbolt']] });
  const ev = d.b.act({ type: 'move', slot: 0 });
  assert.equal(types(ev)[0], 'focusPunch');
  assert.ok(types(ev).includes('lostFocus'));
  assert.equal(pp(d.party[0], 'focus-punch'), G.Mon.ppMax('focus-punch') - 1);
  const e = duel(G, { seed: 1, me: ['machamp', 50, ['focus-punch']], foe: ['jolteon', 50, ['splash']] });
  const ev2 = e.b.act({ type: 'move', slot: 0 });
  assert.ok(!types(ev2).includes('lostFocus') && ev2.some(x => x.type === 'damage' && x.side === 1 && x.amt > 0));
});

test('Pursuit: a foe switching out is hit first, at double power; that was its action', () => {
  const d = duel(G, { seed: 1, me: ['alakazam', 50, ['psychic']], mine: [['snorlax', 50, ['tackle']]], foe: ['houndoom', 30, ['pursuit']] });
  const powers = [], real = G.SpecialMoves.pursuit.power;
  G.SpecialMoves.pursuit.power = (b, u, t, M) => { const v = real(b, u, t, M); powers.push(v); return v; };
  let ev;
  try { ev = d.b.act({ type: 'switch', to: 1 }); } finally { G.SpecialMoves.pursuit.power = real; }
  const iMove = ev.findIndex(e => e.type === 'move' && e.move === 'pursuit'), iOut = ev.findIndex(e => e.type === 'withdraw');
  assert.ok(iMove >= 0 && iMove < iOut, 'before it leaves');
  assert.ok(powers.length && powers.every(v => v === 80), 'double power');
  assert.equal(ev.filter(e => e.type === 'move' && e.move === 'pursuit').length, 1, 'once: its action');
  assert.equal(pp(d.foes[0], 'pursuit'), G.Mon.ppMax('pursuit') - 1);
});

test('Baton Pass: its stat stages and Substitute go to the one the player sends in; with no one to send, it fails', () => {
  const d = duel(G, { seed: 1, me: ['ninjask', 50, ['swords-dance', 'baton-pass']], mine: [['snorlax', 50, ['tackle']]], foe: ['pidgey', 5, ['splash']] });
  const b = d.b;
  b.act({ type: 'move', slot: 0 });
  b.player.bm.vol.substitute = 30;
  b.act({ type: 'move', slot: 1 });
  assert.ok(b.prompt && b.prompt.kind === 'switch' && b.prompt.baton);
  b.answer({ switchTo: 1 });
  const bm = b.player.bm;
  assert.equal(G.Names.mon(bm.mon.sp), G.Names.mon(d.party[1].sp));
  assert.deepEqual([bm.stages.atk, bm.vol.substitute], [2, 30]);
  const e = duel(G, { seed: 1, me: ['ninjask', 50, ['baton-pass']], foe: ['pidgey', 5, ['splash']] });
  assert.ok(types(e.b.act({ type: 'move', slot: 0 })).includes('fail'));
});

test('Wish: at the end of the next turn, half of the max HP of the one in its place; a second one waiting fails', () => {
  const d = duel(G, { seed: 1, me: ['blissey', 50, ['wish', 'splash']], foe: ['pidgey', 5, ['splash']] });
  const b = d.b, mon = d.party[0];
  mon.hp = 10;
  let ev = b.act({ type: 'move', slot: 0 });
  assert.ok(!types(ev).includes('wish'), 'not this turn');
  mon.hp = 10;
  ev = b.act({ type: 'move', slot: 0 });
  assert.ok(types(ev).includes('fail'), 'one waiting already');
  const w = ev.find(e => e.type === 'wish');
  assert.ok(w && G.BattleText.line(w, b).includes(G.Names.mon(mon.sp)), 'the end of the next turn');
  assert.equal(mon.hp, 10 + Math.floor(max(mon) / 2));
  ev = b.act({ type: 'move', slot: 1 });
  assert.ok(!types(ev).includes('wish'), 'once');
});

test('Future Sight and Doom Desire: the damage at the end of the turn after next; another waiting on the same place fails', () => {
  const d = duel(G, { seed: 1, me: ['alakazam', 50, ['future-sight', 'splash']], foe: ['snorlax', 50, ['splash']] });
  const b = d.b, foe = d.foes[0], hp0 = foe.hp;
  let ev = b.act({ type: 'move', slot: 0 });
  assert.ok(types(ev).includes('foresee') && foe.hp === hp0, 'nothing yet');
  ev = b.act({ type: 'move', slot: 0 });
  assert.ok(types(ev).includes('fail'), 'one waiting');
  ev = b.act({ type: 'move', slot: 1 });
  assert.ok(types(ev).includes('futureHit') && foe.hp < hp0, 'the turn after next');
  const e = duel(G, { seed: 1, me: ['jirachi', 50, ['doom-desire', 'splash']], foe: ['snorlax', 50, ['splash']] });
  const ev2 = e.b.act({ type: 'move', slot: 0 });
  assert.ok(G.BattleText.line(ev2.find(x => x.type === 'foresee'), e.b).includes(G.Names.move('doom-desire')));
});

test('Tailwind: Speed x2 on its side for three turns, this one included; while it blows, a second fails', () => {
  const d = duel(G, { seed: 1, me: ['pidgeot', 50, ['tailwind', 'splash']], foe: ['pidgey', 5, ['splash']] });
  const b = d.b, spe = b.stat(b.player.bm, 'spe');
  b.act({ type: 'move', slot: 0 });
  assert.equal(b.stat(b.player.bm, 'spe'), spe * 2);
  assert.ok(types(b.act({ type: 'move', slot: 0 })).includes('fail'));
  const ev = b.act({ type: 'move', slot: 1 });
  assert.ok(ev.some(e => e.type === 'fieldEnd' && e.effect === 'tailwind'), 'the third end of turn');
  assert.equal(b.stat(b.player.bm, 'spe'), spe);
});

test('the AI: Spikes only with someone left to come in; Wish below half HP; Baton Pass with stages to pass on; Taunt after a status move', () => {
  const S = G.BattleAI.score;
  const d = duel(G, { seed: 1, me: ['snorlax', 50, ['growl']], mine: [['pidgey', 50, ['splash']]], foe: ['ninjask', 50, ['spikes', 'wish', 'baton-pass', 'taunt']],
    foes: [['blissey', 50, ['wish']]] });
  const b = d.b, me = b.foe.bm, you = b.player.bm;
  assert.ok(S(b, me, you, 'spikes') > 0, 'the player has someone left');
  d.party[1].hp = 0;
  assert.equal(S(b, me, you, 'spikes'), 0, 'no one left to come in');
  assert.equal(S(b, me, you, 'wish'), 0, 'full HP');
  me.mon.hp = 10;
  assert.ok(S(b, me, you, 'wish') > 0);
  assert.equal(S(b, me, you, 'baton-pass'), 0);
  me.stages.atk = 2;
  assert.ok(S(b, me, you, 'baton-pass') > 0);
  you.lastMove = 'growl';
  assert.ok(S(b, me, you, 'taunt') > S(b, me, Object.assign({}, you, { lastMove: null }), 'taunt'));
});
