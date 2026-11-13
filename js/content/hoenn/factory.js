/* ============ factory.js — the Battle Factory ============
 * Chapter 78, Hoenn after the League: a second building on the Battle Tower's island (js/content/hoenn/tower.js).
 * Nobody battles with their own Pokémon here. The counter rents out six at level 50 (G.Tower.team: different
 * species, different held items, four moves each) and the player picks three for single battles or four for
 * double battles (G.PartyUI.pick({ mons, action }): a tap shows the Summary first). Battles are as in the
 * Battle Tower (copies at full HP, no Bag, no Exp. Points, losing changes nothing), one after another in the
 * battle room. After each win but the last of a set, the player may swap one rental for one of the Pokémon the
 * beaten trainer used (a fresh one at full HP). Seven wins in a row finish a set: Battle Points
 * (G.Tower.bpFor), the same BP as the Battle Tower's Exchange Service Corner. Rentals and opponents grow
 * stronger every seven (G.Tower.pool); the rentals come from the next round's pool (rentalRound: like Emerald's
 * upgraded rentals, so a first set is mostly won), and from round 4 on both sides share the top one. In single battles Noland, the Factory Head, is the 21st (the Silver
 * Knowledge Symbol, 10 BP) and the 42nd (the Gold, 20 BP) opponent; as in Emerald his team is random: three
 * from the strongest pool, different each challenge. Streaks: G.Tower.streak(mode, 'factory') (vars
 * factory-single, factory-double and their -best). The first set of seven once chapter 77 is done ends the
 * chapter: `ending(78)`.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const HALL = 'factory';
  const SALT = 104729;                         // the Factory's seeds differ from the Battle Tower's

  // ---------------- The lobby: two counters and a guide ----------------
  G.Maps.def(Object.assign({
    id: 'battle-factory-lobby', loc: 'battle-factory', tileset: 'indoor', palette: 'lab', music: 'center', battleBg: 'indoor',
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
    // The battle room's door opens only for a challenger (the counters' script takes you through it).
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'factory-door' },
            { x: 13, y: 1, to: 'battle-factory-room', spot: 'player', if: 'scripted', locked: 'factory.door' }],
    spots: { door: [7, 8, 'up'], single: [4, 4, 'up'], double: [10, 4, 'up'] },
    signs: { '13,1': { script: 'factory.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 4, y: 2, dir: 'down', script: 'factory.single' },
      { id: 'double', who: 'clerk', x: 10, y: 2, dir: 'down', script: 'factory.double' },
      { id: 'guide', who: 'scientist', x: 2, y: 6, dir: 'right', script: 'factory.guide' }
    ]
  }, HOENN));

  // ---------------- The battle room ----------------
  G.Maps.def(Object.assign({
    id: 'battle-factory-room', loc: 'battle-factory', tileset: 'indoor', palette: 'lab', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWW',
      'WWWWWWWWW',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '++++X++++'
    ],
    warps: [{ x: 4, y: 7, to: 'battle-factory-lobby', spot: 'single' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, HOENN));

  // ---------------- The opponents ----------------
  const BEFORE = () => [T('Rented Pokémon, rented luck. Let us see whose choices were better!'),
    T('I picked my team in under a minute. That is all I needed!'), T('You do not know my Pokémon, and I do not know yours. Fair enough!'),
    T('A good Trainer can win with any Pokémon. Prove it!'), T('I have studied every rental in this place. Ready?')];
  const DEFEAT = () => [T('Your picks were better than mine...'), T('You made those rentals look like your own.'),
    T('I should have chosen differently...'), T('Well played. Maybe you would like one of mine?')];

  /** Noland, the Factory Head: the 21st and 42nd single battle. */
  const HEAD = { 21: { print: 'silver', bp: 10 }, 42: { print: 'gold', bp: 20 } };
  const seed = (run, n, k) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + n * 7919 + SALT * k) >>> 0));

  /** The opponent of battle No. n (the same one for the same run): a trainer def for G.World.battle. Each row of its
   *  team carries the Pokémon's gender, IVs and nature, so the one taken in a swap is the one that battled. */
  function trainerFor(n, mode, run) {
    const d = opponent(n, mode, run), rng = seed(run, n, 6);
    d.team = d.team.map(([sp, lvl, moves, item]) => {
      const m = G.Mon.create(G.Maps.species(sp), lvl, { rng, moves });
      return [sp, lvl, moves, item, { gender: m.gender, ivs: m.ivs, nature: m.nature }];
    });
    return d;
  }
  function opponent(n, mode, run) {
    const head = mode === 'single' && HEAD[n];
    if (head) {
      const silver = head.print === 'silver';
      return { id: 'noland', who: 'noland', cls: 'factory-head', name: 'Noland', ai: 'leader', prize: 0, items: {}, music: 'league',
               team: G.Tower.team(seed(run, n, 2), 3, 3), head,
               before: silver ? T('So you are the one winning with rentals! I am Noland, the Factory Head. Here, knowing Pokémon matters more than owning them. Let me see what you know!')
                 : T('Back again? This time I thought it all through. My rentals are ready for you!'),
               defeat: silver ? T('Ha! You really know your Pokémon. You earned this.') : T('Amazing... There is nothing left I can teach you about Pokémon.') };
    }
    return G.TowerHall.trainerFor(n, mode, run, { salt: SALT, before: BEFORE(), defeat: DEFEAT() });
  }

  /** A rented Pokémon from a team row [sp, 50, moves, item, { gender, ivs, nature }?]: level 50, full HP, holding the item. */
  function rent([sp, lvl, moves, item, o], rng) {
    const m = G.Mon.create(G.Maps.species(sp), lvl, Object.assign({ rng, moves }, o, o && o.ivs ? { ivs: o.ivs.slice() } : {}));
    m.item = item || null;
    return m;
  }
  /** The pool the rentals of a round come from: the next round's (the top pool from round 3 on). */
  const rentalRound = round => Math.min(3, round + 1);
  /** The six Pokémon the counter offers for a run (the same six until that run starts). */
  const offerFor = (mode, run, round) => G.Tower.team(seed(run, mode === 'double' ? 3 : 0, 3), rentalRound(round), 6).map((t, i) => rent(t, seed(run, i, 4)));

  const pickFrom = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
  const describe = m => fmt('{mon} holding {item}: {moves}.', { mon: G.Names.mon(m.sp), item: G.Names.item(m.item), moves: m.moves.map(x => G.Names.move(x.id)).join(' / ') });

  /** Picks n of the six offered, then one look at all of them: -> the team, or null (backed out). */
  async function choose(h, offer, n) {
    const pick = pickFrom(h);
    for (;;) {
      const picks = [];
      while (picks.length < n) {
        const i = await pick({ mons: offer, action: T('Rent'), title: fmt('Choose rental Pokémon {k} of {n}.', { k: picks.length + 1, n }),
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
  async function swap(h, team, d, run, no) {
    if (await h.choice(T('Would you like to swap one of your Pokémon for one your opponent used?'), { options: [T('Swap'), T('No thanks')] }) !== 0) return;
    const pick = pickFrom(h);
    const give = await pick({ mons: team, action: T('Give up'), title: T('Which Pokémon will you give up?'), note: m => G.Names.item(m.item) });
    if (give == null || !(give >= 0 && give < team.length)) return;
    const rng = seed(run, no, 5), theirs = d.team.map(t => rent(t, rng));     // the same gender, IVs and nature as in the battle
    const others = team.filter((m, i) => i !== give);
    const same = m => others.some(o => o.sp === m.sp);
    const take = await pick({ mons: theirs, action: T('Take'), title: T('Which Pokémon will you take?'),
      note: m => (same(m) ? T('Same species') : G.Names.item(m.item)), disabled: m => same(m) });
    if (take == null || !(take >= 0 && take < theirs.length) || same(theirs[take])) return;
    const old = team[give];
    team[give] = theirs[take];
    await h.say(T('{old} went back to the Factory, and {mon} joined your team.'), { vars: { old: G.Names.mon(old.sp), mon: G.Names.mon(theirs[take].sp) } });
  }

  // ---------------- The counters ----------------
  async function counter(h, mode) {
    const F = G.Field, Tw = G.Tower, n = mode === 'double' ? 4 : 3;
    await h.say(mode === 'double' ? T('Welcome to the Battle Factory! This counter is for double battles.')
      : T('Welcome to the Battle Factory! This counter is for single battles.'));
    if (!F.flag('factory-rules')) {
      F.setFlag('factory-rules');
      await h.say(T('Here, you battle with rented Pokémon. Out of the six we offer, choose three for single battles, or four for double battles.'));
      await h.say(T('After each win, you may swap one of your Pokémon for one that your opponent used.'));
      await h.say(T('Win seven in a row to finish a set and earn Battle Points. The more you win, the stronger the rentals and your opponents become.'));
    }
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak(mode, HALL), best: Tw.best(mode, HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    // The six on offer belong to the next run: backing out and coming back shows the same six.
    const run = (+F.getVar('factory-runs') || 0) + 1;
    await h.say(T('These are the six Pokémon we can rent to you.'));
    const team = await choose(h, offerFor(mode, run, Math.floor(Tw.streak(mode, HALL) / 7)), n);
    if (!team) { await h.say(T('Please come again!')); return; }
    F.setVar('factory-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'battle-factory-room', 'player']], h);
    let set = false;
    for (;;) {
      const no = Tw.streak(mode, HALL) + 1, d = trainerFor(no, mode, run);
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      await h.say(d.head ? T('The Factory Head has come to battle you himself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
      await h.say(d.before, G.TowerHall.speaker(d));
      const out = await h.battle(d, { canLose: true, record: false, party: team.map(m => Tw.copy(m)),
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
        if (d.head.print === 'silver') F.setFlag('factory-silver'); else F.setFlag('factory-gold');
        Tw.addBp(d.head.bp);
        await h.say(d.head.print === 'silver' ? T('Noland recognizes your knowledge. You earned the Silver Knowledge Symbol!')
          : T('Noland recognizes your knowledge. You earned the Gold Knowledge Symbol!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: d.head.bp } });
      }
      if (no % 7 === 0) {
        const bp = Tw.bpFor(no / 7);
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
      await swap(h, team, d, run, no);
    }
    await G.Script.exec([['warp', 'battle-factory-lobby', mode]], h);
    if (set) {
      await h.say(T('Your rentals go back to the Factory. Next time, you will rent new ones and start from battle No. {n}.'), { vars: { n: Tw.streak(mode, HALL) + 1 } });
      // The end of the seventy-eighth chapter (credits-ui.js), once the seventy-seventh is done.
      if (F.flag('chapter-77-done') && !F.flag('chapter-78-done')) {
        if (G.CreditsUI) G.CreditsUI.ending(78); else F.setFlag('chapter-78-done');
      }
    }
  }

  G.Script.def({
    'factory.single': [['js', h => counter(h, 'single')]],
    'factory.double': [['js', h => counter(h, 'double')]],
    'factory.door': [['say', 'The door to the battle room. Challengers must register at one of the counters first.']],
    'factory.guide': [
      ['say', 'Nobody here battles with their own Pokémon. What wins at the Battle Factory is knowing what each rental can do.'],
      ['say', 'Read the moves and the held item of each Pokémon before you rent it. And after a win, the Pokémon you just beat may be better than one of yours!'],
      ['say', 'They say the Factory Head battles in person against Trainers who win twenty-one single battles in a row.']
    ]
  });
  G.FactoryHall = { HEAD, trainerFor, offerFor, rentalRound, rent };
})();
