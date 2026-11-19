/* ============ sfactory.js — Sinnoh's Battle Factory ============
 * Chapter 89 (Platinum's Battle Factory, at the Battle Frontier: frontier.js). Rented Pokémon only, as in Hoenn's Battle
 * Factory (js/content/hoenn/factory.js, G.FactoryHall: rent, rentalRound), with Platinum's rules: single and double battles,
 * each at level 50 or at the Open Level (level 100: rentals, opponents and the battle copies, G.Tower.copy's cap); six
 * offered, three chosen in both modes (and the opponents' teams are three in doubles too); after each win but the last of a
 * round, a swap for one of the Pokémon just beaten. Battle Points by the round (bpFor: 5, 5, 5, 5, 7, 7, 8, then 9) and 20 for
 * a round with Thorton, the Factory Head, at the 21st and 49th single battle: three at random from the strongest pool, at
 * the level of the challenge (Platinum's high tier; no legends here), the Silver / Gold Print (flags sfactory-silver,
 * sfactory-gold). Four streaks of its own (G.Tower halls 'sfactory' and 'sfactory100'); the Battle Points are everyone's.
 * Left out: Platinum's upgraded rentals for the swaps made, multi battles. The first round won once chapter 88 is done ends
 * the chapter: `ending(89)`. The words are my own.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const SALT = 15485863;                       // seeds of their own
  const N = 3;                                 // three rentals in singles and doubles (Platinum)

  // ---------------- the lobby and the battle room ----------------
  G.Maps.def(Object.assign({
    id: 'sfactory-lobby', loc: 'fight-area', tileset: 'indoor', palette: 'lab', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++===========++',
      '+++++++++++++++',
      '+++++++++++++++',
      't+++++++++++++t',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'sinnoh-frontier', spot: 'factory-door' },
            { x: 13, y: 1, to: 'sfactory-room', spot: 'player', if: 'scripted', locked: 'sfactory.door' }],
    spots: { door: [7, 8, 'up'], single: [3, 4, 'up'], double: [7, 4, 'up'], guide: [11, 4, 'up'] },
    signs: { '13,1': { script: 'sfactory.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 3, y: 2, dir: 'down', script: 'sfactory.single' },
      { id: 'double', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'sfactory.double' },
      { id: 'guide', who: 'scientist', x: 11, y: 2, dir: 'down', script: 'sfactory.guide' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'sfactory-room', loc: 'fight-area', tileset: 'indoor', palette: 'lab', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWW', 'WWWWWWWWW', '+++++++++', '+++++++++', '+++++++++', '+++++++++', '+++++++++', '++++X++++'],
    warps: [{ x: 4, y: 7, to: 'sfactory-lobby', spot: 'single' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, SINNOH));

  // ---------------- the rules ----------------
  /** Battle Points for round `set` (the first is 1): Platinum's Battle Factory. */
  const bpFor = set => (set <= 4 ? 5 : set <= 6 ? 7 : set === 7 ? 8 : 9);
  const HEAD = { 21: { print: 'silver' }, 49: { print: 'gold' } };
  const HEAD_BP = 20;
  const hallOf = lvl => (lvl === 100 ? 'sfactory100' : 'sfactory');
  const seed = (run, n, k, lvl) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + n * 7919 + SALT * k + lvl) >>> 0));
  const at = (rows, lvl) => rows.map(([sp, l, moves, item]) => [sp, lvl, moves, item]);

  const BEFORE = () => [T('Every rental in this building has a weakness. I know all of them. Do you?'),
    T('A team you have never trained, against a team you have never seen. That is the Factory!'),
    T('I spent all night reading the rental list. Let us see if it pays off.'), T('Choose well, battle better!')];
  const DEFEAT = () => [T('You used them better than I would have...'), T('I chose the wrong three. Again.'),
    T('Not bad! Want to trade one of mine?'), T('Rentals, but no luck at all on my side.')];

  /** The opponent of battle No. n (the same for the same run): Thorton at the 21st and 49th single battle. Each row of its team
   *  carries the Pokémon's gender, IVs and nature, so the one taken in a swap is the one that battled. */
  function trainerFor(n, mode, run, lvl = 50) {
    const d = opponent(n, mode, run, lvl), rng = seed(run, n, 6, lvl);
    d.team = d.team.map(([sp, l, moves, item]) => {
      const m = G.Mon.create(G.Maps.species(sp), l, { rng, moves });
      return [sp, l, moves, item, { gender: m.gender, ivs: m.ivs, nature: m.nature }];
    });
    return d;
  }
  function opponent(n, mode, run, lvl) {
    const head = mode === 'single' && HEAD[n];
    if (head) {
      const silver = head.print === 'silver';
      return { id: 'thorton', who: 'thorton', cls: 'factory-head', name: 'Thorton', ai: 'leader', prize: 0, items: {}, music: 'league',
               team: at(G.Tower.team(seed(run, n, 2, lvl), 3, N), lvl), head,
               before: silver ? T('Twenty wins with rentals? Then you can read a Pokémon at a glance. I am Thorton, the Factory Head. I can too. Let us compare!')
                 : T('You again! I have run every number since our last battle. This time the odds are mine.'),
               defeat: silver ? T('Hm. Your choices beat my calculations. Take this, you earned it.') : T('Unbelievable... No table I made predicted that. You are the real deal.') };
    }
    const d = G.TowerHall.trainerFor(n, mode, run, { salt: SALT + lvl, before: BEFORE(), defeat: DEFEAT() });
    d.team = at(d.team.slice(0, N), lvl);
    return d;
  }

  /** The six the counter offers for a run (the same six until that run starts). */
  const offerFor = (mode, run, round, lvl = 50) => at(G.Tower.team(seed(run, mode === 'double' ? 3 : 0, 3, lvl), G.FactoryHall.rentalRound(round), 6), lvl)
    .map((t, i) => G.FactoryHall.rent(t, seed(run, i, 4, lvl)));

  const pickFrom = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
  const describe = m => fmt('{mon} holding {item}: {moves}.', { mon: G.Names.mon(m.sp), item: G.Names.item(m.item), moves: m.moves.map(x => G.Names.move(x.id)).join(' / ') });

  /** Picks three of the six offered, then one look at them: -> the team, or null (backed out). */
  async function choose(h, offer) {
    const pick = pickFrom(h);
    for (;;) {
      const picks = [];
      while (picks.length < N) {
        const i = await pick({ mons: offer, action: T('Rent'), title: fmt('Choose rental Pokémon {k} of {n}.', { k: picks.length + 1, n: N }),
          note: (m, j) => (picks.includes(j) ? fmt('No. {k}', { k: picks.indexOf(j) + 1 }) : G.Names.item(m.item)),
          disabled: (m, j) => picks.includes(j) });
        if (i == null || !(i >= 0 && i < offer.length) || picks.includes(i)) return null;
        picks.push(i);
      }
      const team = picks.map(i => offer[i]);
      for (const m of team) await h.say(describe(m));
      if (await h.choice(T('Will you battle with these Pokémon?'), {}) === 0) return team;
    }
  }

  /** After a win: one of yours for one of the Pokémon the trainer just used (no two of the same species). */
  async function swap(h, team, d, run, no, lvl) {
    if (await h.choice(T('Would you like to swap one of your Pokémon for one your opponent used?'), { options: [T('Swap'), T('No thanks')] }) !== 0) return;
    const pick = pickFrom(h);
    const give = await pick({ mons: team, action: T('Give up'), title: T('Which Pokémon will you give up?'), note: m => G.Names.item(m.item) });
    if (give == null || !(give >= 0 && give < team.length)) return;
    const rng = seed(run, no, 5, lvl), theirs = d.team.map(t => G.FactoryHall.rent(t, rng));
    const others = team.filter((m, i) => i !== give);
    const same = m => others.some(o => o.sp === m.sp);
    const take = await pick({ mons: theirs, action: T('Take'), title: T('Which Pokémon will you take?'),
      note: m => (same(m) ? T('Same species') : G.Names.item(m.item)), disabled: m => same(m) });
    if (take == null || !(take >= 0 && take < theirs.length) || same(theirs[take])) return;
    const old = team[give];
    team[give] = theirs[take];
    await h.say(T('{old} went back to the Factory, and {mon} joined your team.'), { vars: { old: G.Names.mon(old.sp), mon: G.Names.mon(theirs[take].sp) } });
  }

  // ---------------- the counters ----------------
  async function counter(h, mode) {
    const F = G.Field, Tw = G.Tower;
    await h.say(mode === 'double' ? T('Welcome to the Battle Factory! This counter is for double battles.')
      : T('Welcome to the Battle Factory! This counter is for single battles.'));
    if (!F.flag('sfactory-rules')) {
      F.setFlag('sfactory-rules');
      await h.say(T('Here, you battle with rented Pokémon. Out of the six we offer, choose three, for single and for double battles alike.'));
      await h.say(T('After each win, you may swap one of your Pokémon for one that your opponent used.'));
      await h.say(T('At level 50, every Pokémon battles at level 50. At the Open Level, every Pokémon battles at level 100.'));
    }
    const lv = await h.choice(T('Which level will you challenge?'), { options: [T('Level 50'), T('Open Level'), T('Cancel')] });
    if (lv !== 0 && lv !== 1) { await h.say(T('Please come again!')); return; }
    const lvl = lv === 1 ? 100 : 50, HALL = hallOf(lvl);
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak(mode, HALL), best: Tw.best(mode, HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const run = (+F.getVar('sfactory-runs') || 0) + 1;
    await h.say(T('These are the six Pokémon we can rent to you.'));
    const team = await choose(h, offerFor(mode, run, Math.floor(Tw.streak(mode, HALL) / 7), lvl));
    if (!team) { await h.say(T('Please come again!')); return; }
    F.setVar('sfactory-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'sfactory-room', 'player']], h);
    let set = false, headRound = false;
    for (;;) {
      const no = Tw.streak(mode, HALL) + 1, d = trainerFor(no, mode, run, lvl);
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      await h.say(d.head ? T('The Factory Head has come to battle you himself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
      await h.say(d.before, G.TowerHall.speaker(d));
      const out = await h.battle(d, { canLose: true, record: false, party: team.map(m => Tw.copy(m, lvl)),
                                       rules: { noExp: true, noBag: true, shift: false } });
      if (out === 'lose') {
        h.hide('foe');
        Tw.setStreak(mode, 0, HALL);
        await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
        break;
      }
      await h.say(d.defeat, G.TowerHall.speaker(d));
      h.hide('foe');
      Tw.setStreak(mode, no, HALL);
      if (d.head) {
        headRound = true;
        if (d.head.print === 'silver') F.setFlag('sfactory-silver'); else F.setFlag('sfactory-gold');
        await h.say(d.head.print === 'silver' ? T('Thorton recognizes your knowledge. You earned the Silver Print!') : T('Thorton recognizes your knowledge. You earned the Gold Print!'));
      }
      if (no % 7 === 0) {
        const bp = headRound ? HEAD_BP : bpFor(no / 7);
        Tw.addBp(bp);
        await h.say(T('Congratulations! You won seven battles in a row!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
        set = true;
        break;
      }
      const go = await h.choice(T('Battle No. {n} is next. Will you keep going?'), { options: [T('Keep going'), T('Retire')], vars: { n: no + 1 } });
      if (go !== 0) {
        Tw.setStreak(mode, 0, HALL);
        await h.say(T('You retired. Wins in a row: {n}.'), { vars: { n: no } });
        break;
      }
      await swap(h, team, d, run, no, lvl);
    }
    await G.Script.exec([['warp', 'sfactory-lobby', mode]], h);
    if (set) {
      await h.say(T('Your rentals go back to the Factory. Next time, you will rent new ones and start from battle No. {n}.'), { vars: { n: Tw.streak(mode, HALL) + 1 } });
      // The end of the eighty-ninth chapter (credits-ui.js), once the eighty-eighth is done.
      if (F.flag('chapter-88-done') && !F.flag('chapter-89-done')) {
        if (G.CreditsUI) await G.CreditsUI.ending(89); else F.setFlag('chapter-89-done');
      }
    }
  }

  G.Script.def({
    'sfactory.single': [['js', h => counter(h, 'single')]],
    'sfactory.double': [['js', h => counter(h, 'double')]],
    'sfactory.door': [['say', 'The door to the battle room. Challengers must register at one of the counters first.']],
    'sfactory.guide': [
      ['say', 'Nobody here battles with their own Pokémon. Read the moves and the held item of each rental before you choose.'],
      ['say', 'The Factory Head, Thorton, battles Trainers who reach the 21st and the 49th single battle in a row. He knows every rental by heart.'],
      ['say', 'At the Open Level, everything battles at level 100. Only this Factory offers that.']
    ]
  });
  G.SinnohFactoryHall = { HEAD, HEAD_BP, N, bpFor, hallOf, trainerFor, offerFor };
})();
