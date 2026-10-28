// Whole battles: determinism, switching, trainers, running, losing, items, and text.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { battleBoot, duel } = require('./helpers.cjs');
const { LANGS } = require('../tools/build_langs.js');
const G = battleBoot();

/** Plays a battle to the end with simple choices; returns all events. */
function play(b, choose = () => ({ type: 'move', slot: 0 })) {
  const all = [];
  for (let i = 0; i < 400 && !b.result; i++) {
    const p = b.prompt;
    if (p.kind === 'action') all.push(...b.act(choose(b)));
    else if (p.kind === 'switch') all.push(...b.answer({ switchTo: b.options().switchable[0] }));
    else all.push(...b.answer({ switchTo: -1, learnSlot: -1 }));
  }
  return all;
}
const hash = v => crypto.createHash('sha1').update(JSON.stringify(v)).digest('hex');

test('the same seed and the same choices give exactly the same battle', () => {
  const run = seed => {
    const { b, events } = duel(G, { me: ['pikachu', 20, null], mine: [['pidgeotto', 20, null]],
                                    foe: ['raticate', 20, null], foes: [['ivysaur', 20, null]], kind: 'trainer', seed });
    return hash(events.concat(play(b)));
  };
  assert.equal(run(11), run(11));
  assert.equal(run(3), run(3));
  const distinct = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(run));
  assert.ok(distinct.size >= 6, `only ${distinct.size} different battles`);
});

test('a fainted Pokémon must be replaced; with none left, the battle is lost', () => {
  const { b } = duel(G, { me: ['magikarp', 5, ['splash'], { hp: 1 }], mine: [['pidgey', 5, ['tackle']]],
                          foe: ['rattata', 30, ['tackle']] });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'faint' && e.side === 0));
  assert.deepEqual({ ...b.prompt }, { kind: 'switch', forced: true });
  assert.equal(b.answer({ switchTo: -1 })[0].type, 'error');      // must choose someone
  const sw = b.answer({ switchTo: 1 });
  assert.ok(sw.some(e => e.type === 'send' && e.side === 0));
  play(b);
  assert.equal(b.result.outcome, 'lose');
});

test('trainers: no running, no balls; the next Pokémon comes out (and you may switch); prize money', () => {
  const { b } = duel(G, { me: ['squirtle', 30, ['water-gun']], mine: [['pidgey', 20, ['gust']]],
                          foe: ['geodude', 10, ['splash']], foes: [['onix', 10, ['splash']]],
                          trainer: { id: 'brock', name: 'Brock', title: 'Leader', ai: 'leader', prize: 99 } });
  assert.equal(b.act({ type: 'run' })[0].type, 'noRunTrainer');
  assert.equal(b.prompt.kind, 'action');
  b.act({ type: 'move', slot: 0 });
  assert.equal(b.prompt.kind, 'shift');                        // "Brock is about to send in Onix..."
  const next = b.answer({ switchTo: -1 });
  assert.ok(next.some(e => e.type === 'send' && e.side === 1 && e.sp === 95));
  play(b);
  assert.equal(b.result.outcome, 'win');
  assert.equal(b.result.money, 99 * 10);
});

test('running from a wild Pokémon: always works when faster', () => {
  const { b } = duel(G, { me: ['pikachu', 30, ['tackle']], foe: ['slowpoke', 30, ['splash']] });
  const ev = b.act({ type: 'run' });
  assert.ok(ev.some(e => e.type === 'run' && e.ok));
  assert.equal(b.result.outcome, 'run');
});

test('items in battle: a Potion heals and is used up; it cannot be used at full HP', () => {
  const { b, party } = duel(G, { me: ['pidgey', 20, ['tackle'], { hp: 5 }], foe: ['magikarp', 5, ['splash']], bag: { potion: 1 } });
  assert.equal(b.act({ type: 'item', item: 'potion', target: 0 })[0].type !== 'error', true);
  assert.equal(party[0].hp, 25);
  assert.equal(b.player.bag.potion, undefined);
  const full = duel(G, { me: ['pidgey', 20, ['tackle']], foe: ['magikarp', 5, ['splash']], bag: { potion: 1 } });
  assert.equal(full.b.act({ type: 'item', item: 'potion', target: 0 })[0].type, 'error');
});

test('leaders heal with their items when low', () => {
  const { b } = duel(G, { me: ['squirtle', 14, ['tackle']], foe: ['onix', 14, ['tackle'], { hp: 3 }],
                          trainer: { id: 'brock', name: 'Brock', title: 'Leader', ai: 'leader', items: { 'super-potion': 1 } } });
  const ev = b.act({ type: 'move', slot: 0 });
  assert.ok(ev.some(e => e.type === 'item' && e.side === 1 && e.item === 'super-potion'));
  assert.equal(b.foe.items['super-potion'], undefined);
});

test('every event of many battles turns into text in every language, with all slots filled', () => {
  for (const lang of ['en'].concat(LANGS)) {
    const L = battleBoot({ lang, dictionaries: true });
    for (let s = 1; s <= 12; s++) {
      const { b, events } = duel(L, { me: ['charmander', 14, null], mine: [['bulbasaur', 12, null], ['pidgey', 9, null]],
                                      foe: ['geodude', 13, null], foes: [['onix', 14, null], ['zubat', 10, null]],
                                      kind: s % 3 ? 'trainer' : 'wild', seed: s, bag: { potion: 2 } });
      for (const e of events.concat(play(b))) {
        const t = L.BattleText.line(e, b);
        if (t != null) assert.ok(!/\{\w+\}/.test(t) && !t.includes('undefined'), `${lang}: ${e.type} -> ${t}`);
      }
    }
  }
});

test('Johto obedience (rules.obeyCap): above the cap a Pokémon sometimes naps, loafs or does its own thing', () => {
  const count = (lvl, cap) => {
    const why = {};
    for (let s = 1; s <= 20; s++) {
      const { b, events } = duel(G, { me: ['charizard', lvl, ['scratch', 'ember']], foe: ['snorlax', 60, ['splash']], seed: s,
                                      rules: cap ? { obeyCap: cap } : undefined });
      for (const e of events.concat(play(b))) if (e.type === 'disobey') why[e.why] = (why[e.why] || 0) + 1;
    }
    return why;
  };
  const wild = count(60, 20);
  assert.ok(wild.nap && wild.loaf && wild.other, 'all kinds of disobedience: ' + JSON.stringify(wild));
  assert.deepEqual(count(60, null), {}, 'no cap: always obeys');
  assert.deepEqual(count(20, 20), {}, 'at the cap: always obeys');
  // Every line has text in every language.
  for (const lang of ['en'].concat(LANGS)) {
    const L = battleBoot({ lang, dictionaries: true });
    const { b } = duel(L, { me: ['charizard', 60, null], foe: ['pidgey', 5, null] });
    for (const e of [{ why: 'nap' }, { why: 'other' }, ...[0, 1, 2, 3].map(n => ({ why: 'loaf', n }))]) {
      const t = L.BattleText.line(Object.assign({ type: 'disobey', side: 0, uid: b.player.bm.mon.uid }, e), b);
      assert.ok(t && !/\{\w+\}/.test(t), `${lang}: ${JSON.stringify(e)} -> ${t}`);
    }
  }
});
