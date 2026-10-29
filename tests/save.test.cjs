// Save slots (js/core/store.js), the bag outside battle (js/world/field-items.js) and the PC boxes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, DATA, BATTLE, fakeStorage, plain } = require('./helpers.cjs');

const FILES = CORE.concat(DATA, BATTLE, ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/field.js', 'js/world/field-items.js']);
function fresh(storage) {
  const st = storage || fakeStorage();
  const G = boot(FILES, { storage: st }).G;
  return { G, st };
}
const { G } = fresh();
const mon = (sp, lvl, o) => G.Mon.create(sp, lvl, Object.assign({ rng: G.RNG(7), nature: 'hardy' }, o));

test('the Day Care keeps at most two Pokémon, each with the level it was left at', () => {
  const rng = G.RNG(5);
  const a = G.Mon.create(25, 12, { rng }), b = G.Mon.create(16, 9, { rng }), c = G.Mon.create(19, 4, { rng });
  const s = G.Store.sanitize({ daycare: [{ mon: a, lvl: 10 }, { mon: b, lvl: 30 }, { mon: c, lvl: 4 }, { mon: { sp: 9999 }, lvl: 3 }, 'x'] });
  assert.equal(s.daycare.length, 2);
  assert.equal(s.daycare[0].mon.sp, 25);
  assert.equal(s.daycare[0].lvl, 10);
  assert.equal(s.daycare[1].lvl, 9, 'never above its level now');
  assert.equal(G.Store.sanitize({}).daycare.length, 0);
});

test('Eggs: at most six carried, each with its steps left; an Egg waiting at the Day Care is kept', () => {
  const rng = G.RNG(3);
  const egg = steps => ({ mon: G.Mon.create(172, 5, { rng }), steps });
  const s = G.Store.sanitize({ daycareEgg: true, eggs: [egg(640), egg(-5), { mon: { sp: 9999 }, steps: 3 }, 'x', egg(1), egg(2), egg(3), egg(4), egg(5)] });
  assert.equal(s.eggs.length, 6);
  assert.equal(s.eggs[0].steps, 640);
  assert.equal(s.eggs[1].steps, 0);
  assert.equal(s.eggs[0].mon.sp, 172);
  assert.equal(s.daycareEgg, true);
  const e = G.Store.sanitize({});
  assert.ok(e.daycareEgg === false && e.eggs.length === 0);
});

test('a Bug-Catching Contest saved halfway keeps its entrant, balls, steps and catch', () => {
  const mon = G.Mon.create(123, 14, { rng: G.RNG(2) });
  const s = G.Store.sanitize({ contest: { uid: 'abc', balls: 300, steps: 120, mon } });
  assert.equal(s.contest.uid, 'abc');
  assert.equal(s.contest.balls, 99);
  assert.equal(s.contest.steps, 120);
  assert.equal(s.contest.mon.sp, 123);
  assert.equal(G.Store.sanitize({ contest: { balls: 3 } }).contest, null);
  assert.equal(G.Store.newSave().contest, null);
});

test('a new save has the documented shape', () => {
  const s = G.Store.newSave({ name: 'Ash', gender: 'f', rival: 'Gary', id: 70000 });
  assert.deepEqual(Object.keys(s).sort(), ['app', 'bag', 'box', 'boxes', 'contest', 'created', 'daycare', 'daycareEgg', 'dex', 'done', 'eggs', 'fame', 'flags', 'party', 'player', 'playTime',
    'repel', 'rival', 'rival2', 'savedAt', 'v', 'vars'].sort());
  assert.equal(s.app, 'PokeLeague');
  assert.equal(s.player.name, 'Ash');
  assert.equal(s.player.gender, 'f');
  assert.equal(s.player.id, 70000 % 65536);
  assert.equal(s.rival.name, 'Gary');
  assert.equal(s.boxes.length, 8);
  assert.ok(s.boxes.every(b => b.length === 30 && b.every(x => x === null)));
});

test('names are cleaned: no control characters, single spaces, ten characters at most', () => {
  assert.equal(G.Store.cleanName('  Red\u0007  \n Fire  '), 'Red Fire');
  assert.equal(G.Store.cleanName('ABCDEFGHIJKLMNOP'), 'ABCDEFGHIJ');
  assert.equal([...G.Store.cleanName('😀😀😀😀😀😀😀😀😀😀😀😀')].length, 10);
  assert.equal(G.Store.cleanName(42), '');
});

test('write and load: pl. keys, a .bak of the previous save, the last slot', () => {
  const { G, st } = fresh();
  const s = G.Store.newSave({ name: 'Red' });
  s.party.push(mon(4, 5));
  s.player.money = 1234;
  assert.equal(G.Store.write(2, s), true);
  assert.deepEqual([...st._map.keys()].sort(), ['pl.save.2', 'pl.slot']);
  assert.equal(G.Store.lastSlot(), 2);
  s.player.money = 99;
  G.Store.write(2, s);
  assert.equal(JSON.parse(st.getItem('pl.save.2.bak')).player.money, 1234);
  const back = G.Store.load(2);
  assert.equal(back.player.money, 99);
  assert.equal(back.party[0].sp, 4);
  assert.ok(back.savedAt > 0);
  for (const k of st._map.keys()) assert.ok(k.startsWith('pl.'), k);
});

test('a damaged slot loads its backup; a missing one is null', () => {
  const { G, st } = fresh();
  const s = G.Store.newSave({ name: 'Leaf' });
  G.Store.write(1, s);
  G.Store.write(1, s);
  st.setItem('pl.save.1', '{"app":"PokeLeague","player":');      // cut off
  const back = G.Store.load(1);
  assert.equal(back.player.name, 'Leaf');
  assert.equal(G.Store.usedBackup, true);
  assert.equal(G.Store.load(3), null);
  assert.equal(G.Store.load(9), null);
});

test('slots() summarises each slot; remove() clears it', () => {
  const { G, st } = fresh();
  const s = G.Store.newSave({ name: 'Blue' });
  s.party.push(mon(25, 5), mon(16, 3));
  s.player.badges = [1, 2];
  s.dex.caught = { 25: 1, 16: 1, 19: 1 };
  s.playTime = 3725;
  G.Store.write(3, s);
  st.setItem('pl.save.1', 'not json');
  const [a, b, c] = G.Store.slots();
  assert.deepEqual(plain(a), { slot: 1, broken: true });
  assert.equal(b, null);
  assert.equal(c.name, 'Blue');
  assert.equal(c.badges, 2);
  assert.equal(c.dex, 3);
  assert.equal(c.playTime, 3725);
  assert.deepEqual(plain(c.party), [25, 16]);
  G.Store.remove(3);
  assert.equal(G.Store.slots()[2], null);
  assert.equal(st.getItem('pl.save.3.bak'), null);
  assert.equal(G.Store.lastSlot(), null);
});

test('blocked storage: saving fails politely, nothing to load', () => {
  const bad = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); }, removeItem() { throw new Error('blocked'); } };
  const G2 = boot(FILES, { storage: bad }).G;
  assert.equal(G2.Store.write(1, G2.Store.newSave()), false);
  assert.equal(G2.Store.load(1), null);
  assert.deepEqual(plain(G2.Store.slots()), [null, null, null]);
});

test('sanitize fixes bad fields and keeps the good ones', () => {
  const party = [];
  for (let i = 0; i < 8; i++) party.push(mon(19, 4));
  party[1] = Object.assign(mon(25, 5), { hp: 9999, moves: [{ id: 'thunder-shock', pp: 99 }, { id: 'no-such-move', pp: 3 }], nick: ' Sparky\u0000 ' });
  party[2] = { sp: 9999, lvl: 5, moves: [{ id: 'tackle', pp: 35 }] };      // unknown species: dropped
  const s = G.Store.sanitize({
    v: 1, app: 'PokeLeague', player: { name: '', gender: 'x', money: 5e9, badges: [3, 1, 3, 99], dir: 'north', x: 4.7 },
    party, boxes: 'nope', bag: { potion: 3, 'poke-ball': -1, 'not-an-item': 4, antidote: 1.5 },
    dex: { seen: { 1: 1 }, caught: { 4: 1, 999: 1 } }, flags: { a: 1, b: 0 }, vars: { n: 3, bad: { x: 1 } }, extra: 'ignored'
  });
  assert.equal(s.player.name, 'Red');
  assert.equal(s.player.gender, 'm');
  assert.equal(s.player.money, 999999);
  assert.deepEqual(plain(s.player.badges), [1, 3]);
  assert.equal(s.player.dir, 'down');
  assert.equal(s.player.x, 4);
  assert.equal(s.party.length, 6);
  const p = s.party[1];
  assert.equal(p.nick, 'Sparky');
  assert.equal(p.hp, G.Mon.maxHp(p));
  assert.deepEqual(p.moves.map(m => m.id), ['thunder-shock']);
  assert.equal(p.moves[0].pp, G.Mon.ppMax('thunder-shock', 0));
  assert.equal(s.boxes.length, 8);
  assert.equal(s.boxes[0].filter(Boolean).length, 1);         // 7 good Pokémon: 6 in the party, 1 in the PC
  assert.deepEqual(plain(s.bag), { potion: 3, antidote: 1 });
  assert.deepEqual(plain(s.dex.caught), { 4: 1 });
  assert.equal(s.dex.seen[4], 1);
  assert.deepEqual(plain(s.flags), { a: 1 });
  assert.deepEqual(plain(s.vars), { n: 3 });
  assert.equal(s.extra, undefined);
});

test('migrate runs every step in order, and refuses saves from a newer version', () => {
  const s = { v: 1, log: [] };
  G.Store.migrate(s, 3, { 1: x => x.log.push('1>2'), 2: x => x.log.push('2>3') });
  assert.equal(s.v, 3);
  assert.deepEqual(plain(s.log), ['1>2', '2>3']);
  assert.throws(() => G.Store.migrate({ v: G.Store.V + 1 }), /newer/);
  assert.throws(() => G.Store.migrate({ v: 1 }, 2, {}), /no migration/);
});

test('export and import: round trip, and other files are refused', () => {
  const s = G.Store.newSave({ name: 'Misty' });
  s.party.push(mon(120, 18));
  s.bag = { 'great-ball': 4 };
  const text = G.Store.exportText(s);
  const f = JSON.parse(text);
  assert.equal(f.app, 'PokeLeague');
  assert.equal(f.kind, 'save');
  const r = G.Store.importText(text);
  assert.ok(r.save);
  assert.equal(r.save.player.name, 'Misty');
  assert.equal(r.save.party[0].sp, 120);
  assert.equal(r.save.bag['great-ball'], 4);
  assert.ok(G.Store.importText(JSON.stringify(s)).save, 'a bare save is fine too');
  assert.equal(G.Store.importText('{oops').error, 'not-json');
  assert.equal(G.Store.importText(JSON.stringify({ app: 'PokeSurvivor', kind: 'save', save: { player: {} } })).error, 'other-app');
  assert.equal(G.Store.importText(JSON.stringify({ coins: 3 })).error, 'other-app');
  assert.equal(G.Store.importText(JSON.stringify({ app: 'PokeLeague', kind: 'save', v: 99, save: Object.assign({}, s, { v: 99 }) })).error, 'newer');
  assert.equal(G.Store.importText(JSON.stringify({ app: 'PokeLeague', kind: 'save', save: { app: 'PokeLeague', player: 3 } })).error, 'bad');
  assert.equal(G.Store.importText('"\ufeff"').error, 'bad');
});

test('the PC: caught Pokémon go to the current box first, healed', () => {
  const { G } = fresh();
  const s = G.Store.newSave();
  G.Field.bind(s);
  s.box = 2;
  const m = mon(19, 5);
  m.hp = 1; m.status = 'psn';
  assert.equal(G.Field.toBox(m), 2);
  assert.equal(s.boxes[2][0], m);
  assert.equal(m.hp, G.Mon.maxHp(m));
  assert.equal(m.status, null);
  for (let b = 0; b < 8; b++) s.boxes[b].fill(mon(16, 2));
  assert.equal(G.Field.toBox(mon(16, 2)), -1);
});

test('bag items on a Pokémon outside battle', () => {
  const FI = G.FieldItems;
  const p = mon(25, 30);
  const max = G.Mon.maxHp(p);
  assert.equal(FI.kind('potion'), 'mon');
  assert.equal(FI.kind('repel'), 'field');
  assert.equal(FI.kind('tm24'), 'tm');
  assert.equal(FI.kind('oaks-parcel'), 'key');
  assert.equal(FI.kind('nugget'), null);
  assert.equal(FI.canUse('potion', p), false, 'full HP');
  p.hp = max - 30;
  let r = FI.use('potion', p);
  assert.ok(r.ok);
  assert.equal(p.hp, max - 10);
  assert.match(r.lines[0], /20/);
  p.status = 'psn';
  assert.equal(FI.canUse('awakening', p), false);
  FI.use('antidote', p);
  assert.equal(p.status, null);
  assert.equal(FI.canUse('revive', p), false);
  p.hp = 0;
  assert.equal(FI.canUse('potion', p), false, 'fainted');
  FI.use('revive', p);
  assert.equal(p.hp, Math.floor(max / 2));
  // PP: Ether on one move, PP Up raises the maximum.
  p.moves[0].pp = 0;
  assert.ok(FI.needsMove('ether'));
  FI.use('ether', p, { move: 0 });
  assert.equal(p.moves[0].pp, Math.min(10, G.Mon.ppMax(p.moves[0].id, 0)));
  const before = G.Mon.ppMax(p.moves[0].id, 0);
  FI.use('pp-up', p, { move: 0 });
  assert.equal(p.moves[0].ppUp, 1);
  assert.ok(G.Mon.ppMax(p.moves[0].id, 1) > before);
  // Vitamins: up to 100 EVs in a stat from items.
  for (let i = 0; i < 12; i++) FI.use('protein', p);
  assert.equal(p.evs[1], 100);
  assert.equal(FI.canUse('protein', p), false);
});

test('Rare Candy: a level, the moves of that level, an evolution when due', () => {
  const FI = G.FieldItems;
  const c = mon(10, 6);                    // Caterpie evolves at 7
  const r = FI.use('rare-candy', c);
  assert.equal(c.lvl, 7);
  assert.equal(r.level, 7);
  assert.equal(c.exp, G.Stats.expAt(G.SPECIES[10].gr, 7));
  assert.equal(r.evolve, 11);
  const b = mon(1, 6);                     // Bulbasaur learns Leech Seed at 7
  const r2 = FI.use('rare-candy', b);
  assert.ok(r2.learn.includes('leech-seed'), r2.learn.join());
  assert.equal(r2.evolve, null);
  assert.equal(FI.canUse('rare-candy', Object.assign(mon(1, 5), { lvl: 100 })), false);
});

test('stones, TMs and Repel', () => {
  const FI = G.FieldItems;
  const pika = mon(25, 10), char = mon(4, 10);
  assert.equal(FI.canUse('thunder-stone', pika), true);
  assert.equal(FI.use('thunder-stone', pika).evolve, 26);
  assert.equal(FI.canUse('thunder-stone', char), false);
  const tm = Object.keys(G.ITEMS).find(id => G.ITEMS[id].pocket === 'tms' && (G.SPECIES[4].tm || []).includes(id));
  assert.equal(FI.tmFor(char, tm), 'able');
  G.Mon.learn(char, FI.tm(tm), 0);
  assert.equal(FI.tmFor(char, tm), 'learned');
  const never = Object.keys(G.ITEMS).find(id => G.ITEMS[id].pocket === 'tms' && !(G.SPECIES[10].tm || []).includes(id));
  assert.equal(FI.tmFor(mon(10, 5), never), 'unable');
  const s = { repel: 0 };
  assert.equal(FI.repel(s, 'super-repel'), 'ok');
  assert.equal(s.repel, 200);
  assert.equal(FI.repel(s, 'repel'), 'active');
});
