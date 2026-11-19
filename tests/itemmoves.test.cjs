// The moves that move items (chapter 94, Generation 4): Fling, Trick, Switcheroo, Thief, Covet, Knock Off, Natural Gift, Pluck,
// Bug Bite; Sticky Hold and Multitype; the player's items given back after a battle; the plates, Shed Shell, Mental Herb and
// Destiny Knot.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { battleBoot, duel } = require('./helpers.cjs');
const G = battleBoot();
const hold = (item, more) => Object.assign({ item }, more);
const turn = (o, slot = 0) => { const d = duel(G, Object.assign({ seed: 4 }, o)); return { d, ev: d.b.act({ type: 'move', slot }) }; };
const dmg = (ev, side) => ev.filter(e => e.type === 'damage' && e.side === side && e.why === 'hit').map(e => e.amt);
const line = (d, type) => G.BattleText.line(d.ev.find(e => e.type === type), d.d.b);
const who = (d, side, k = 0) => G.BattleText.who(d.d.b, (side ? d.d.foes : d.d.party)[k].uid, side);

test('Fling: its own item thrown, its power and effect from the item; nothing to throw: it fails', () => {
  let t = turn({ me: ['garchomp', 50, ['fling'], hold('iron-plate')], foe: ['snorlax', 60, ['splash']] });
  assert.ok(dmg(t.ev, 1)[0] > 0 && t.d.party[0].item === null, 'thrown and gone');
  assert.equal(line(t, 'flung'), G.I18n.fmt('{mon} flung its {item}!', { mon: who(t, 0), item: G.Names.item('iron-plate') }));
  const heavy = dmg(t.ev, 1)[0];
  const light = dmg(turn({ me: ['garchomp', 50, ['fling'], hold('choice-scarf')], foe: ['snorlax', 60, ['splash']] }).ev, 1)[0];
  assert.ok(heavy > light * 4, `90 power against 10: ${heavy} / ${light}`);
  t = turn({ me: ['garchomp', 50, ['fling']], foe: ['snorlax', 60, ['splash']] });
  assert.ok(t.ev.some(e => e.type === 'fail') && !dmg(t.ev, 1).length, 'no item');
  // King's Rock: the target flinches (the user moved first); Flame Orb: a burn; a Sitrus Berry: the target eats it.
  t = turn({ me: ['jolteon', 50, ['fling'], hold('kings-rock')], foe: ['snorlax', 50, ['tackle']] });
  assert.ok(!t.ev.some(e => e.type === 'move' && e.side === 1), 'Snorlax flinched');
  t = turn({ me: ['jolteon', 50, ['fling'], hold('flame-orb')], foe: ['snorlax', 50, ['splash']] });
  assert.equal(t.d.foes[0].status, 'brn');
  t = turn({ me: ['jolteon', 50, ['fling'], hold('sitrus-berry')], foe: ['snorlax', 50, ['splash'], { hp: 40 }] });
  assert.ok(t.ev.some(e => e.type === 'heal' && e.side === 1), 'the berry heals the target');
});

test('Trick and Switcheroo: the items swapped; nothing to swap, Sticky Hold, Multitype or a substitute: no swap; a Choice item holds its new owner', () => {
  let t = turn({ me: ['alakazam', 50, ['trick', 'psychic'], hold('choice-scarf')], foe: ['snorlax', 50, ['tackle', 'body-slam'], hold('leftovers')], kind: 'trainer' });
  assert.deepEqual([t.d.party[0].item, t.d.foes[0].item], ['leftovers', 'choice-scarf']);
  assert.equal(line(t, 'trick'), G.I18n.fmt('{mon} switched items with its target!', { mon: who(t, 0) }));
  assert.ok(t.ev.some(e => e.type === 'obtain' && e.side === 1 && e.item === 'choice-scarf'));
  // The foe moves once more, then it is held to that move.
  t.d.b.act({ type: 'move', slot: 1 });
  const fbm = t.d.b.foe.bm;
  assert.ok(G.Held.locked(fbm), 'held to ' + G.Held.locked(fbm));
  t = turn({ me: ['alakazam', 50, ['trick']], foe: ['snorlax', 50, ['splash'], hold('leftovers')] });
  assert.equal(t.d.party[0].item, 'leftovers', 'from empty hands');
  assert.ok(G.SpecialMoves.switcheroo, 'Switcheroo works the same way (no Pokémon of this game learns it)');
  t = turn({ me: ['alakazam', 50, ['trick']], foe: ['snorlax', 50, ['splash']] });
  assert.ok(t.ev.some(e => e.type === 'fail'), 'nothing to swap');
  t = turn({ me: ['alakazam', 50, ['trick'], hold('choice-scarf')], foe: ['muk', 50, ['splash'], hold('leftovers', { ability: 'sticky-hold' })] });
  assert.deepEqual([t.d.party[0].item, t.d.foes[0].item], ['choice-scarf', 'leftovers'], 'Sticky Hold');
  assert.ok(t.ev.some(e => e.type === 'ability' && e.ability === 'sticky-hold'));
  const sub = duel(G, { me: ['alakazam', 50, ['trick'], hold('choice-scarf')], foe: ['snorlax', 50, ['splash'], hold('leftovers')], seed: 4 });
  sub.b.foe.bm.vol.substitute = 30;
  sub.b.act({ type: 'move', slot: 0 });
  assert.equal(sub.party[0].item, 'choice-scarf', 'not through a substitute');
});

test('Thief and Covet take the item if the user holds none; Knock Off knocks it away; Sticky Hold keeps it', () => {
  let t = turn({ me: ['weavile', 50, ['thief']], foe: ['snorlax', 60, ['splash'], hold('leftovers')] });
  assert.deepEqual([t.d.party[0].item, t.d.foes[0].item], ['leftovers', null]);
  assert.equal(line(t, 'steal'), G.I18n.fmt("{mon} stole {target}'s {item}!", { mon: who(t, 0), target: who(t, 1), item: G.Names.item('leftovers') }));
  t = turn({ me: ['snorlax', 50, ['covet']], foe: ['blissey', 60, ['splash'], hold('leftovers')] });
  assert.equal(t.d.party[0].item, 'leftovers', 'Covet');
  t = turn({ me: ['weavile', 50, ['thief'], hold('quick-claw')], foe: ['snorlax', 60, ['splash'], hold('leftovers')] });
  assert.deepEqual([t.d.party[0].item, t.d.foes[0].item], ['quick-claw', 'leftovers'], 'the user already holds one');
  t = turn({ me: ['weavile', 50, ['thief']], foe: ['muk', 60, ['splash'], hold('leftovers', { ability: 'sticky-hold' })] });
  assert.equal(t.d.foes[0].item, 'leftovers', 'Sticky Hold');
  t = turn({ me: ['weavile', 50, ['knock-off']], foe: ['snorlax', 60, ['splash'], hold('leftovers')] });
  assert.deepEqual([t.d.party[0].item, t.d.foes[0].item], [null, null]);
  assert.equal(line(t, 'knockOff'), G.I18n.fmt("{mon} knocked off {target}'s {item}!", { mon: who(t, 0), target: who(t, 1), item: G.Names.item('leftovers') }));
  t = turn({ me: ['weavile', 50, ['knock-off']], foe: ['muk', 60, ['splash'], hold('leftovers', { ability: 'sticky-hold' })] });
  assert.equal(t.d.foes[0].item, 'leftovers');
});

test('Natural Gift uses its own berry (its type and power, Klutz stops it); Pluck and Bug Bite eat the target\'s berry', () => {
  let t = turn({ me: ['snorlax', 50, ['natural-gift'], hold('sitrus-berry')], foe: ['machamp', 50, ['splash']] });
  assert.equal(G.NATURAL_GIFT['sitrus-berry'][0], 'psychic');
  assert.ok(t.ev.some(e => e.type === 'effective' && e.eff > 1), 'Psychic against Machamp');
  assert.equal(t.d.party[0].item, null);
  t = turn({ me: ['lopunny', 50, ['natural-gift'], hold('sitrus-berry', { ability: 'klutz' })], foe: ['machamp', 50, ['splash']] });
  assert.ok(t.ev.some(e => e.type === 'fail') && t.d.party[0].item === 'sitrus-berry', 'Klutz');
  t = turn({ me: ['staraptor', 50, ['pluck'], { hp: 30 }], foe: ['snorlax', 60, ['splash'], hold('sitrus-berry')] });
  assert.equal(t.d.foes[0].item, null);
  assert.ok(t.ev.some(e => e.type === 'heal' && e.side === 0), 'the user eats it');
  assert.equal(line(t, 'pluck'), G.I18n.fmt("{mon} stole and ate its target's {item}!", { mon: who(t, 0), item: G.Names.item('sitrus-berry') }));
  t = turn({ me: ['heracross', 50, ['bug-bite'], { hp: 30 }], foe: ['snorlax', 60, ['splash'], hold('sitrus-berry')] });
  assert.ok(t.d.foes[0].item === null && t.ev.some(e => e.type === 'heal' && e.side === 0), 'Bug Bite');
  t = turn({ me: ['staraptor', 50, ['pluck'], { hp: 30 }], foe: ['snorlax', 60, ['splash'], hold('leftovers')] });
  assert.equal(t.d.foes[0].item, 'leftovers', 'only berries');
});

test('after a battle the player\'s Pokémon get back what they held, unless they used it up themselves', () => {
  // Knocked off, then the battle is won: the Leftovers are back.
  const k = duel(G, { me: ['snorlax', 100, ['body-slam'], hold('leftovers')], foe: ['jolteon', 50, ['knock-off']], kind: 'trainer', seed: 4 });
  k.b.act({ type: 'move', slot: 0 });
  assert.equal(k.b.result && k.b.result.outcome, 'win');
  assert.equal(k.party[0].item, 'leftovers');
  // Its own berry eaten: gone. An item stolen from a Trainer's Pokémon: not kept.
  const e = duel(G, { me: ['snorlax', 50, ['splash'], hold('sitrus-berry', { hp: 20 })], foe: ['snorlax', 50, ['splash']], kind: 'trainer' });
  e.b.act({ type: 'move', slot: 0 });
  assert.equal(e.party[0].item, null);
  e.b.restoreItems();
  assert.equal(e.party[0].item, null, 'eaten');
  const s = duel(G, { me: ['weavile', 50, ['thief']], foe: ['snorlax', 60, ['splash'], hold('leftovers')], kind: 'trainer', seed: 4 });
  s.b.act({ type: 'move', slot: 0 });
  assert.equal(s.party[0].item, 'leftovers');
  s.b.restoreItems();
  assert.equal(s.party[0].item, null, 'not kept');
  // Swapped away by Trick: back.
  const t = duel(G, { me: ['snorlax', 50, ['splash'], hold('leftovers')], foe: ['alakazam', 50, ['trick'], hold('choice-scarf')], kind: 'trainer', seed: 4 });
  t.b.act({ type: 'move', slot: 0 });
  assert.equal(t.party[0].item, 'choice-scarf');
  t.b.restoreItems();
  assert.equal(t.party[0].item, 'leftovers');
});

test('the plates, Multitype, Shed Shell, Mental Herb, Destiny Knot', () => {
  const plain = dmg(turn({ me: ['raichu', 50, ['thunderbolt']], foe: ['snorlax', 60, ['splash']] }).ev, 1)[0];
  const plate = dmg(turn({ me: ['raichu', 50, ['thunderbolt'], hold('zap-plate')], foe: ['snorlax', 60, ['splash']] }).ev, 1)[0];
  assert.ok(plate > plain && plate <= Math.ceil(plain * 1.25), `${plain} -> ${plate}`);
  const arc = duel(G, { me: ['arceus', 80, ['judgment'], hold('zap-plate', { ability: 'multitype' })], foe: ['snorlax', 60, ['splash']] });
  assert.deepEqual([...arc.b.player.bm.types], ['electric'], 'Multitype');
  // Shed Shell: out even against Shadow Tag.
  const tag = (item) => duel(G, { me: ['snorlax', 50, ['splash'], hold(item)], mine: [['lucario', 50, ['aura-sphere']]], foe: ['wobbuffet', 50, ['splash'], { ability: 'shadow-tag' }] });
  assert.equal(tag(null).b.options().trapped, true);
  assert.equal(tag('shed-shell').b.options().trapped, false);
  const wild = duel(G, { me: ['snorlax', 50, ['splash'], hold('shed-shell')], foe: ['wobbuffet', 50, ['splash'], { ability: 'shadow-tag' }] });
  assert.equal(wild.b.options().canRun, false, 'it switches out, it does not flee');
  // Mental Herb: infatuation cured at once. Destiny Knot: the one who did it falls in love too.
  let t = turn({ me: ['lopunny', 50, ['splash'], hold('mental-herb', { gender: 'f' })], foe: ['lucario', 50, ['attract'], { gender: 'm' }] });
  assert.ok(!t.d.b.player.bm.vol.attract && t.d.party[0].item === null);
  assert.equal(line(t, 'mentalHerb'), G.I18n.fmt('{mon} used its {item} to come back to its senses!', { mon: who(t, 0), item: G.Names.item('mental-herb') }));
  t = turn({ me: ['lopunny', 50, ['splash'], hold('destiny-knot', { gender: 'f' })], foe: ['lucario', 50, ['attract'], { gender: 'm' }] });
  assert.ok(t.d.b.player.bm.vol.attract && t.d.b.foe.bm.vol.attract, 'both in love');
  const knot = t.ev.find(e => e.type === 'attract' && e.why === 'destiny-knot');
  assert.equal(G.BattleText.line(knot, t.d.b), G.I18n.fmt('{mon} fell in love because of the {item}!', { mon: who(t, 1), item: G.Names.item('destiny-knot') }));
  for (const id of ['flame-plate', 'zap-plate', 'iron-plate', 'shed-shell', 'mental-herb', 'destiny-knot']) assert.ok(G.ITEMS[id] && G.ITEM_FX[id] && G.Names.item(id) !== id, id);
  assert.equal(Object.keys(G.ITEM_FX).filter(id => G.ITEM_FX[id].plate).length, 16, 'sixteen plates');
  for (const id of Object.keys(G.ITEMS).filter(k => G.ITEMS[k].pocket === 'berries')) assert.ok(G.NATURAL_GIFT[id], id);
});
