/* ============ tutors.js — Platinum's free move tutors: Draco Meteor and the ultimate moves ============
 * Chapter 96. Two houses Platinum has: an old woman on Route 210's north side (`wilma-house`, its door on route210n,
 * celestic.js) teaches Draco Meteor to a Dragon-type Pokémon, and an old man on Route 228 (`r228-house`, its door on route228,
 * resort.js) teaches Blast Burn, Hydro Cannon or Frenzy Plant to the last stage of a starter of any region: Charizard,
 * Typhlosion, Blaziken, Infernape (Blast Burn); Blastoise, Feraligatr, Swampert, Empoleon (Hydro Cannon); Venusaur, Meganium,
 * Sceptile, Torterra (Frenzy Plant). Both teach only a Pokémon whose friendship is full (255). Their order is Platinum's
 * (the decompilation, github.com/pret/pokeplatinum: res/field/maps/route_210_grandma_wilma_house and route_228_north_house):
 * the question first (the old woman then checks the team for a Dragon that does not know the move yet), a Pokémon chosen,
 * then an Egg, one that cannot learn it, one that knows it already, one that does not trust you enough; the move is taught as
 * the Ilex Forest tutor does it (G.LearnUI.teach: with four moves, one is forgotten). A Dragon-type is one by its species, or
 * an Arceus whose plate makes it one (G.Held.multitype). The first move taught once chapter 95 is done ends the chapter:
 * `ending(96)`. The rooms and the words are my own.
 *
 *   G.SinnohTutors.ULTIMATE {species id: move} · dragon(mon) · canDraco(mon) · ultimateFor(mon) · MAX (255)
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const MAX = 255;
  const ULTIMATE = {};
  for (const [move, list] of [['blast-burn', ['charizard', 'typhlosion', 'blaziken', 'infernape']],
                              ['hydro-cannon', ['blastoise', 'feraligatr', 'swampert', 'empoleon']],
                              ['frenzy-plant', ['venusaur', 'meganium', 'sceptile', 'torterra']]]) {
    for (const sp of list) ULTIMATE[G.Maps.species(sp)] = move;
  }
  /** A Dragon-type by its species, or by its plate (Arceus). */
  const dragon = mon => ((G.Held && G.Held.multitype(mon)) || G.SPECIES[mon.sp].types).includes('dragon');
  const canDraco = mon => !mon.egg && dragon(mon) && !G.Mon.knows(mon, 'draco-meteor');
  const ultimateFor = mon => (mon.egg ? null : ULTIMATE[mon.sp] || null);

  // ---------------- the houses ----------------
  G.Maps.def(Object.assign({
    id: 'wilma-house', loc: 'sinnoh-route-210', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWW', 'WWWWWWWWW', 'bb__p__bb', '_________', '__tt_____', '__tt_____', '_________', '____X____'],
    warps: [{ x: 4, y: 7, to: 'route210n', spot: 'wilma-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'granny', who: 'granny', x: 6, y: 3, dir: 'down', script: 'tutor.draco' },
      { id: 'tamer', who: 'cooltrainerm', x: 1, y: 5, dir: 'right',
        say: 'My grandmother raised dragons before I was born. Even now, a Dragon that loves its Trainer will listen to her.' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'r228-house', loc: 'sinnoh-route-228', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWW', 'WWWWWWWWW', 'bb_____bb', '_________', '_____tt__', '_____tt__', '_________', '____X____'],
    warps: [{ x: 4, y: 7, to: 'route228', spot: 'tutor-door' }],
    spots: { door: [4, 7, 'up'] },
    signs: { '1,2': { script: 'tutor.list' } },
    npcs: [{ id: 'expert', who: 'oldman', x: 3, y: 3, dir: 'down', script: 'tutor.ultimate' }]
  }, SINNOH));

  // ---------------- teaching ----------------
  const pickMon = (h, o) => (h.pickMon || (x => (G.PartyUI ? G.PartyUI.pick(x) : Promise.resolve(null))))(o);
  /** A Pokémon of the team, chosen; its card says whether it can learn the move. -> the Pokémon, or null */
  async function choose(h, title, can, knows) {
    const i = await pickMon(h, { title, note: m => (knows(m) ? T('Learned') : can(m) ? T('Able') : T('Unable')) });
    return i == null || i < 0 ? null : G.Field.party()[i] || null;
  }
  /** Teaches the move (with four, one forgotten: learn-ui.js). -> learned */
  async function teach(h, mon, move) {
    if (G.LearnUI) return G.LearnUI.teach(mon, move, t => h.say(t));
    G.Mon.learn(mon, move, mon.moves.length < 4 ? null : 0);
    await h.say(T('{mon} learned {move}!'), { vars: { mon: G.Mon.name(mon), move: G.Names.move(move) } });
    return true;
  }
  /** The end of the ninety-sixth chapter (credits-ui.js), once the ninety-fifth is done. */
  async function done() {
    const F = G.Field;
    if (F.flag('chapter-95-done') && !F.flag('chapter-96-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(96); else F.setFlag('chapter-96-done');
    }
  }

  /** The old woman of Route 210: Draco Meteor for a Dragon-type with full friendship. */
  async function draco(h) {
    const F = G.Field, move = G.Names.move('draco-meteor');
    if (!F.flag('tutor-draco-met')) {
      F.setFlag('tutor-draco-met');
      await h.say(T('In my day I raised more dragons than I can count. There is one move I learned from them that I still pass on.'));
      await h.say(fmt('It is called {move}: the dragon calls down stars from the sky. Only a Dragon-type that trusts its Trainer with all its heart can learn it.', { move }));
    }
    if (await h.choice(fmt('Shall I teach {move} to one of your Pokémon?', { move }), {}) !== 0) { await h.say(T('Do come back and see this old woman again.')); return; }
    if (!F.party().some(canDraco)) { await h.say(fmt('None of your Pokémon could learn {move} from me. Bring me a Dragon-type, dear.', { move })); return; }
    const mon = await choose(h, T('Teach which Pokémon?'), canDraco, m => !m.egg && G.Mon.knows(m, 'draco-meteor'));
    if (!mon) { await h.say(T('Do come back and see this old woman again.')); return; }
    if (mon.egg) { await h.say(T('An Egg cannot learn a move yet. Let it hatch first.')); return; }
    if (!dragon(mon)) { await h.say(fmt('Only a Dragon-type can learn {move}.', { move })); return; }
    if (G.Mon.knows(mon, 'draco-meteor')) { await h.say(fmt('{mon} already knows {move}.', { mon: G.Mon.name(mon), move })); return; }
    if ((mon.friendship | 0) < MAX) { await h.say(fmt('{mon} does not trust you with all its heart yet. Travel together a little longer.', { mon: G.Mon.name(mon) })); return; }
    if (!(await teach(h, mon, 'draco-meteor'))) return;
    await h.say(fmt('{move} is the strongest of dragon moves, but it takes so much out of the user that its Sp. Atk falls sharply. Use it wisely.', { move }));
    await done();
  }

  /** The old man of Route 228: an ultimate move for the last stage of a starter, with full friendship. */
  async function ultimate(h) {
    const F = G.Field;
    if (!F.flag('tutor-ultimate-met')) {
      F.setFlag('tutor-ultimate-met');
      await h.say(T('You came all the way across this sand? Then you have earned something. I teach the ultimate moves.'));
      await h.say(T('Only the Pokémon a professor gives to a new Trainer, fully grown and fully devoted to their Trainer, can learn them.'));
    }
    if (await h.choice(T('Shall I teach an ultimate move to one of your Pokémon?'), {}) !== 0) { await h.say(T('That is fine. The sand and I will wait.')); return; }
    const mon = await choose(h, T('Teach which Pokémon?'), m => !!ultimateFor(m) && !G.Mon.knows(m, ultimateFor(m)), m => !!ultimateFor(m) && G.Mon.knows(m, ultimateFor(m)));
    if (!mon) { await h.say(T('That is fine. The sand and I will wait.')); return; }
    if (mon.egg) { await h.say(T('An Egg cannot learn a move yet. Let it hatch first.')); return; }
    const id = ultimateFor(mon);
    if (!id) { await h.say(T('I am sorry, but that Pokémon cannot learn an ultimate move.')); return; }
    const vars = { mon: G.Mon.name(mon), move: G.Names.move(id) };
    if (G.Mon.knows(mon, id)) { await h.say(fmt('{mon} already knows {move}.', vars)); return; }
    if ((mon.friendship | 0) < MAX) { await h.say(fmt('{mon} and you are not close enough yet. The ultimate moves come only from a perfect bond.', { mon: vars.mon })); return; }
    if (await h.choice(fmt('Shall {mon} learn {move}?', vars), {}) !== 0) { await h.say(T('That is fine. The sand and I will wait.')); return; }
    if (!(await teach(h, mon, id))) return;
    await h.say(T('After such a move the user must rest for a turn. Choose the moment well.'));
    await done();
  }

  /** The list pinned to the shelf: who learns which ultimate move. */
  async function list(h) {
    await h.say(T('A list pinned to the shelf: the Pokémon who may learn an ultimate move.'));
    for (const move of ['blast-burn', 'hydro-cannon', 'frenzy-plant']) {
      const mons = Object.keys(ULTIMATE).filter(sp => ULTIMATE[sp] === move).map(sp => G.Names.mon(+sp));
      await h.say(fmt('{one}, {two}, {three} and {four}: {move}.', { one: mons[0], two: mons[1], three: mons[2], four: mons[3], move: G.Names.move(move) }));
    }
  }

  G.Script.def({ 'tutor.draco': [['js', draco]], 'tutor.ultimate': [['js', ultimate]], 'tutor.list': [['js', list]] });
  G.SinnohTutors = { ULTIMATE, MAX, dragon, canDraco, ultimateFor };
})();
