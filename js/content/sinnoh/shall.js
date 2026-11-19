/* ============ shall.js — Sinnoh's Battle Hall (对战舞台) and G.Hall, its rules ============
 * Chapter 90 (Platinum's Battle Hall, at the Battle Frontier: frontier.js). One Pokémon of your own, level 30 or more (not one of
 * Platinum's banned: G.Tower.SINNOH_BANNED), at its own level (G.Tower.copy(mon, 100)), healed after every battle. Before each
 * battle you pick a type; the opponent is one Pokémon of that type. Each type has ten ranks: a win raises it one; a win at rank 10
 * closes the type until every type is closed, and then all of them start again. The streak belongs to one species (its Pokédex
 * number): another Pokémon starts it over, and so does a loss. Ten battles a round, no leaving halfway; Battle Points by the
 * round (bpFor: 1 up to the 30th battle, 2 to the 60th, 3 to the 90th, 4 to the 110th, 6 to the 130th, 8 to the 150th, 10 to
 * the 170th, then 12) and 20 for a round with Argenta, the Hall Matron, at the 50th battle (the Silver Print: a Pokémon of the
 * upper middle by base stats, any type) and the 170th (the Gold Print: one of the strongest), at your Pokémon's level (flags
 * shall-silver, shall-gold).
 * The opponents' level (Bulbapedia, ludo.guide): min(L, ceil(L - 3 sqrt(L) + others / 2 + (rank - 1) sqrt(L) / 5)), L your
 * Pokémon's level and `others` the other types at rank 2 or more (my reading of "types/2"). Their species: the type's
 * non-legendary Pokémon sorted by base stat total, a stronger slice each rank (my own); moves and held items as the Battle
 * Tower's (G.Tower.moveset). This game has 18 types (Fairy too), so a full turn is 180 battles; Argenta stays at the 50th and
 * 170th. Left out: double and multi battles, the one-time bonuses for total wins. The first round of ten won once chapter 89 is
 * done ends the chapter: `ending(90)`. The words are my own.
 *
 *   G.Hall.level(lp, rank, others) · opponent(type, rank, lvl, rng) -> [sp, lvl, moves, item] · state() · win(type) · reset()
 *   bpFor(lastBattle) · TYPES · can(mon) -> null | 'level' | 'banned'
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const SALT = 32452843;
  const ROUND = 10, MIN_LEVEL = 30;
  const BRAIN = { 50: { print: 'silver' }, 170: { print: 'gold' } }, BRAIN_BP = 20;

  // ---------------- the lobby and the stage ----------------
  G.Maps.def(Object.assign({
    id: 'shall-lobby', loc: 'fight-area', tileset: 'indoor', palette: 'pink', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++===========++',
      '+++++++++++++++',
      '+rrrrrrrrrrrrr+',
      '+rrrrrrrrrrrrr+',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'sinnoh-frontier', spot: 'hall-door' },
            { x: 13, y: 1, to: 'shall-room', spot: 'player', if: 'scripted', locked: 'shall.door' }],
    spots: { door: [7, 8, 'up'], counter: [5, 4, 'up'], guide: [9, 4, 'up'] },
    signs: { '13,1': { script: 'shall.door' } },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 5, y: 2, dir: 'down', script: 'shall.counter' },
      { id: 'guide', who: 'lady', x: 9, y: 2, dir: 'down', script: 'shall.guide' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'shall-room', loc: 'fight-area', tileset: 'indoor', palette: 'pink', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWW', 'WWWWWWWWW', '+rrrrrrr+', '+rrrrrrr+', '+rrrrrrr+', '+++++++++', '+++++++++', '++++X++++'],
    warps: [{ x: 4, y: 7, to: 'shall-lobby', spot: 'counter' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, SINNOH));

  // ---------------- the rules ----------------
  const TYPES = () => G.Types.LIST;
  const NO_FOE = new Set([292, 132, 235, 201, 202]);        // as the Battle Tower: Shedinja, Ditto, Smeargle, Unown, Wobbuffet
  const ITEMS = ['leftovers', 'sitrus-berry', 'quick-claw', 'scope-lens', 'bright-powder', 'focus-band', 'shell-bell', 'kings-rock', 'lum-berry', 'white-herb'];
  const total = sp => G.SPECIES[sp].base.reduce((a, b) => a + b, 0);

  /** The opponents' level. */
  function level(lp, rank, others) {
    const r = Math.sqrt(lp);
    return Math.max(1, Math.min(lp, Math.ceil(lp - 3 * r + others / 2 + (rank - 1) * r / 5)));
  }
  /** Who may enter: level 30 or more, not on Platinum's banned list. */
  const can = mon => (!mon || mon.lvl < MIN_LEVEL ? 'level' : G.Tower.SINNOH_BANNED.includes(mon.sp) ? 'banned' : null);

  const byType = {};
  /** The type's opponents, weakest first. */
  function speciesOf(type) {
    if (!byType[type]) {
      byType[type] = Object.keys(G.SPECIES).map(Number).filter(sp => {
        const S = G.SPECIES[sp];
        return S.types.includes(type) && !S.leg && !G.Tower.SINNOH_BANNED.includes(sp) && !NO_FOE.has(sp);
      }).sort((a, b) => total(a) - total(b) || a - b);
    }
    return byType[type];
  }
  /** One opponent: [sp, lvl, moves, item]. Rank r draws from a slice of the type's list, stronger each rank. */
  function opponent(type, rank, lvl, rng) {
    const list = speciesOf(type), n = list.length;
    const lo = Math.floor((rank - 1) * n / 10), hi = Math.max(lo + 1, Math.min(n, Math.ceil((rank + 2) * n / 10)));
    for (let guard = 0; guard < 50; guard++) {
      const sp = list[lo + rng.int(0, hi - lo - 1)], moves = G.Tower.moveset(sp, rng);
      if (moves.length) return [G.SPECIES[sp].slug || sp, lvl, moves, rng.pick(ITEMS)];
    }
    return ['pikachu', lvl, ['thunderbolt'], 'leftovers'];
  }
  /** Argenta's Pokémon: the upper middle by base stats (silver) or the strongest (gold), any type, no legends. */
  const brainPool = gold => Object.keys(G.SPECIES).map(Number).filter(sp => {
    const S = G.SPECIES[sp], t = total(sp);
    return !S.leg && !G.Tower.SINNOH_BANNED.includes(sp) && !NO_FOE.has(sp) && !(S.evo && S.evo.length) && (gold ? t >= 520 : t >= 450 && t < 520);
  });
  function brainMon(gold, lvl, rng) {
    const p = brainPool(gold);
    for (let guard = 0; guard < 50; guard++) {
      const sp = rng.pick(p), moves = G.Tower.moveset(sp, rng);
      if (moves.length) return [G.SPECIES[sp].slug || sp, lvl, moves, rng.pick(ITEMS)];
    }
    return ['dragonite', lvl, ['dragon-claw'], 'leftovers'];
  }

  // The state, in vars: the streak (G.Tower hall 'shall'), the species it belongs to, and one character a type: '1'-'9', '0' for
  // rank 10, 'x' for a closed type.
  const V = () => G.Field;
  const ranksStr = () => { const s = String(V().getVar('shall-ranks') || ''); return s.length === TYPES().length ? s : '1'.repeat(TYPES().length); };
  /** -> { streak, sp, ranks: { type: 1-10 }, closed: [types] } */
  function state() {
    const s = ranksStr(), ranks = {}, closed = [];
    TYPES().forEach((t, i) => { const c = s[i]; if (c === 'x') { closed.push(t); ranks[t] = 10; } else ranks[t] = c === '0' ? 10 : +c; });
    return { streak: G.Tower.streak('single', 'shall'), sp: +V().getVar('shall-sp') || 0, ranks, closed };
  }
  function save(ranks, closed) {
    V().setVar('shall-ranks', TYPES().map(t => (closed.includes(t) ? 'x' : ranks[t] === 10 ? '0' : String(ranks[t]))).join(''));
  }
  /** A win against a type: up a rank; a win at rank 10 closes it; when all are closed they open again at rank 1. */
  function win(type) {
    const st = state();
    if (st.ranks[type] >= 10) st.closed.push(type); else st.ranks[type]++;
    if (st.closed.length === TYPES().length) { TYPES().forEach(t => { st.ranks[t] = 1; }); st.closed = []; }
    save(st.ranks, st.closed);
    G.Tower.setStreak('single', st.streak + 1, 'shall');
  }
  /** A loss, or another Pokémon: everything starts over. */
  function reset(sp = 0) {
    V().setVar('shall-ranks', '1'.repeat(TYPES().length));
    V().setVar('shall-sp', sp);
    G.Tower.setStreak('single', 0, 'shall');
  }
  /** How many other types are at rank 2 or more (or closed). */
  const others = (st, type) => TYPES().filter(t => t !== type && (st.ranks[t] >= 2 || st.closed.includes(t))).length;
  /** Battle Points for the round ending at battle No. `last`. */
  const bpFor = last => (last <= 30 ? 1 : last <= 60 ? 2 : last <= 90 ? 3 : last <= 110 ? 4 : last <= 130 ? 6 : last <= 150 ? 8 : last <= 170 ? 10 : 12);

  G.Hall = { TYPES, ROUND, MIN_LEVEL, BRAIN, BRAIN_BP, level, can, speciesOf, opponent, brainMon, state, win, reset, others, bpFor };

  // ---------------- the challenge ----------------
  const seed = (run, n, k) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + n * 7919 + SALT * k) >>> 0));
  const BEFORE = () => [T('I specialize in exactly this type. You chose well... or very badly.'), T('Every Pokémon here is a star. Mine is about to shine.'),
    T('A one-on-one on this stage? Let the audience decide!'), T('Pick a type, pick a fight. You picked me!')];
  const DEFEAT = () => [T('The spotlight is yours.'), T('Bravo... even if it hurts to say so.'), T('That was a performance.'), T('Encore? Not for me, I am afraid.')];

  /** The opponent of battle No. n with the type chosen: Argenta at the 50th and 170th. */
  function trainerFor(n, type, run, mon) {
    const st = state(), brain = BRAIN[n];
    if (brain) {
      const silver = brain.print === 'silver';
      return { id: 'argenta', who: 'argenta', cls: 'hall-matron', name: 'Argenta', ai: 'leader', prize: 0, items: {}, music: 'league', brain,
               team: [brainMon(!silver, mon.lvl, seed(run, n, 2))],
               before: silver ? T('Fifty wins with the same Pokémon! You and your partner make a fine pair. I am Argenta, the Hall Matron. Show me how it shines on my stage!')
                 : T('One hundred and seventy wins. You came back to my stage, and so did I. Let us give them a finale!'),
               defeat: silver ? T('Splendid! I can see how much it trusts you.') : T('A standing ovation! Nobody has ever performed like that on my stage.') };
    }
    const d = G.TowerHall.trainerFor(n, 'single', run, { salt: SALT, before: BEFORE(), defeat: DEFEAT() });
    d.team = [opponent(type, st.ranks[type], level(mon.lvl, st.ranks[type], others(st, type)), seed(run, n, 3))];
    return d;
  }

  /** A list to pick from: the pop-up on screen, the dialog's choices without one. -> the chosen option's value */
  async function choose(h, title, opts) {
    if (G.Popup && G.Popup.choose) return G.Popup.choose(title, opts);
    const k = await h.choice(title, { options: opts.map(o => o.label) });
    return (opts[k] || {}).value;
  }
  const pickFrom = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));

  async function counter(h) {
    const F = G.Field, Tw = G.Tower, H = G.Hall;
    await h.say(T('Welcome to the Battle Hall! On this stage, one Pokémon takes on one opponent at a time.'));
    if (!F.flag('shall-rules')) {
      F.setFlag('shall-rules');
      await h.say(T('Before each battle, you choose the type of your opponent. Every type has ten ranks: each win raises it one, and a win at rank 10 closes it until every type is done.'));
      await h.say(T('Enter one Pokémon of level 30 or more. Your opponents\' levels follow its level and the ranks. A round is ten battles, and you cannot leave before the end.'));
      await h.say(T('Your streak belongs to the Pokémon you enter. Enter another, and it starts over.'));
    }
    let st = state();
    if (st.streak) await h.say(fmt('Wins in a row with {mon}: {n}.', { mon: G.Names.mon(st.sp), n: st.streak }));
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const party = F.party();
    const NOTE = { level: T('Below level 30'), banned: T('Cannot enter') };
    const i = await pickFrom(h)({ title: T('Which Pokémon will take the stage?'), note: m => NOTE[can(m)] || null, disabled: m => !!can(m) });
    const mon = party[i];
    if (i == null || i < 0 || !mon || can(mon)) { await h.say(T('Please come again!')); return; }
    if (st.streak && st.sp !== mon.sp) {
      if (await h.choice(fmt('Your streak belongs to {old}. With {mon}, it starts over. Is that all right?', { old: G.Names.mon(st.sp), mon: G.Names.mon(mon.sp) }), {}) !== 0) {
        await h.say(T('Please come again!'));
        return;
      }
    }
    if (st.sp !== mon.sp) reset(mon.sp);
    const run = (+F.getVar('shall-runs') || 0) + 1;
    F.setVar('shall-runs', run);
    await h.say(T('Thank you. Please follow me to the stage.'));
    await G.Script.exec([['warp', 'shall-room', 'player']], h);
    let done = false, brainRound = false;
    for (;;) {
      st = state();
      const no = st.streak + 1;
      const open = H.TYPES().filter(t => !st.closed.includes(t));
      let type = null;
      while (!type) {
        type = await choose(h, fmt('Battle No. {n}. Which type will you face?', { n: no }),
          open.map(t => ({ label: fmt('{type} · Rank {r}', { type: G.Names.type(t), r: st.ranks[t] }), value: t })));
      }
      const d = trainerFor(no, type, run, mon);
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      await h.say(d.brain ? T('The Hall Matron has come to the stage herself!') : fmt('Battle No. {n}! A {type}-type challenger takes the stage.', { n: no, type: G.Names.type(type) }));
      await h.say(d.before, G.TowerHall.speaker(d));
      const out = await h.battle(d, { canLose: true, record: false, party: [Tw.copy(mon, 100)], rules: { noExp: true, noBag: true, shift: false } });
      if (out === 'lose') {
        h.hide('foe');
        reset(mon.sp);
        await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
        break;
      }
      await h.say(d.defeat, G.TowerHall.speaker(d));
      h.hide('foe');
      win(type);
      if (d.brain) {
        brainRound = true;
        if (d.brain.print === 'silver') F.setFlag('shall-silver'); else F.setFlag('shall-gold');
        await h.say(d.brain.print === 'silver' ? T('Argenta recognizes your bond. You earned the Silver Print!') : T('Argenta recognizes your bond. You earned the Gold Print!'));
      }
      if (no % ROUND === 0) {
        const bp = brainRound ? BRAIN_BP : bpFor(no);
        Tw.addBp(bp);
        await h.say(T('Congratulations! You won ten battles in a row!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
        done = true;
        break;
      }
      await h.say(fmt('{mon} was healed. On to battle No. {n}!', { mon: G.Mon.name(mon), n: no + 1 }));
    }
    await G.Script.exec([['warp', 'shall-lobby', 'counter']], h);
    if (done) {
      await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: state().streak + 1 } });
      // The end of the ninetieth chapter (credits-ui.js), once the eighty-ninth is done.
      if (F.flag('chapter-89-done') && !F.flag('chapter-90-done')) {
        if (G.CreditsUI) await G.CreditsUI.ending(90); else F.setFlag('chapter-90-done');
      }
    }
  }

  async function guide(h) {
    const F = G.Field, st = state();
    await h.say(T('The Hall Matron, Argenta, takes the stage against Trainers who reach the 50th and the 170th battle in a row.'));
    if (st.sp) {
      const top = G.Hall.TYPES().filter(t => st.ranks[t] >= 2 || st.closed.includes(t)).map(t => G.Names.type(t) + ' ' + (st.closed.includes(t) ? '✓' : st.ranks[t]));
      await h.say(fmt('{mon}: {n} wins in a row. Ranks: {list}.', { mon: G.Names.mon(st.sp), n: st.streak, list: top.length ? top.join(', ') : T('all at rank 1') }));
    }
    await h.say(T('Silver Print: {s}. Gold Print: {g}. Battle Points: {n}.'), { vars: {
      s: F.flag('shall-silver') ? T('Yes') : T('No'), g: F.flag('shall-gold') ? T('Yes') : T('No'), n: G.Tower.bp() } });
  }

  G.Script.def({
    'shall.counter': [['js', counter]],
    'shall.guide': [['js', guide]],
    'shall.door': [['say', 'The door to the stage. Challengers must register at the counter first.']]
  });
  G.SinnohHallHall = { trainerFor };
})();
