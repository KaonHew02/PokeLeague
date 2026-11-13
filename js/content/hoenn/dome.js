/* ============ dome.js — the Battle Dome ============
 * Chapter 81, Hoenn after the League: a fifth building on the Battle Tower's island (js/content/hoenn/tower.js). Single
 * battles. The player enters three of their own Pokémon (G.TowerHall.pickEntrants, as at the Battle Tower) for a
 * tournament of sixteen: the first round, the quarterfinal, the semifinal and the final. Before each match the player may
 * look at the tournament tree (G.DomeUI) and at the opponent's data (their three Pokémon on the party screen, their rank,
 * their style, the stat they are trained for), then chooses two of the three to battle; the opponent chooses the two of
 * theirs that hit the player's three hardest (pickTwo). Battles are the Tower's: copies at full HP, no Bag, no Exp. Points.
 * Four wins make the champion: Battle Points (G.Tower.bpFor of that tournament), shared with the Tower's Exchange Service
 * Corner. A loss or retiring ends the streak, which counts tournaments won in a row (G.Tower.streak('single', 'dome')).
 * The other fifteen come from G.TowerHall.trainerFor with the Dome's seeds: tournament k uses round k's pool, one round
 * stronger in the half the final opponent comes from; ranks follow their teams' base stats (yours too), and in matches
 * between them the better ranked one wins seven times in ten. Tucker, the Dome Ace, waits in the final of the 5th
 * tournament (the Silver Tactics Symbol) and the 10th (the Gold) with his teams from Emerald, two of three. The first
 * tournament won once chapter 80 is done ends the chapter: `ending(81)`.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const HALL = 'dome';
  const SALT = 181081;                         // the Dome's seeds differ from the other halls'

  // ---------------- The lobby and the stage ----------------
  G.Maps.def(Object.assign({
    id: 'battle-dome-lobby', loc: 'battle-dome', tileset: 'indoor', palette: 'mart', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++++=======++++',
      '+++++++++++++++',
      '+++++++++++++++',
      't+++++++++++++t',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    // The stage's door opens only for a challenger (the counter's script takes you through it).
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'dome-door' },
            { x: 13, y: 1, to: 'battle-dome-room', spot: 'player', if: 'scripted', locked: 'dome.door' }],
    spots: { door: [7, 8, 'up'], single: [7, 4, 'up'] },
    signs: { '13,1': { script: 'dome.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'dome.single' },
      { id: 'guide', who: 'gentleman', x: 2, y: 6, dir: 'right', script: 'dome.guide' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'battle-dome-room', loc: 'battle-dome', tileset: 'indoor', palette: 'mart', music: 'center', battleBg: 'indoor',
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
    warps: [{ x: 4, y: 7, to: 'battle-dome-lobby', spot: 'single' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, HOENN));

  // ---------------- The entrants ----------------
  const ROUNDS = () => [T('First round'), T('Quarterfinal'), T('Semifinal'), T('Final')];
  const BEFORE = () => [T('The crowd is watching. Let us make it a match to remember!'), T('I read your data. I know what you will send out!'),
    T('Only one of us goes on to the next round!'), T('This tournament is mine!'), T('I have waited all season for this match.')];
  // More names, so no two of the sixteen share one (the Battle Tower's lists are shorter); women by their class.
  const MORE = () => ({ m: [T('Ross'), T('Owen'), T('Felix'), T('Hugo'), T('Vince'), T('Jamal')],
                        f: [T('Mia'), T('Paige'), T('Nora'), T('Ruth'), T('Tess'), T('Lena')] });
  const WOMEN = new Set(['cooltrainer-f', 'battle-girl', 'beauty']);
  const DEFEAT = () => [T('You go on to the next round. Good luck!'), T('So that is why you are ranked where you are...'),
    T('My tournament ends here...'), T('Win the whole thing for me, will you?')];

  /** Tucker, the Dome Ace: his teams in the final of the 5th and 10th tournaments (Emerald's, from Serebii). */
  const ACE = {
    5: { print: 'silver', bp: 10, team: [
      ['swampert', 50, ['surf', 'earthquake', 'ice-beam', 'counter'], 'focus-band'],
      ['salamence', 50, ['earthquake', 'brick-break', 'dragon-claw', 'aerial-ace'], 'lum-berry'],
      ['charizard', 50, ['overheat', 'rock-slide', 'aerial-ace', 'earthquake'], 'white-herb']] },
    10: { print: 'gold', bp: 20, team: [
      ['swampert', 50, ['surf', 'earthquake', 'ice-beam', 'mirror-coat'], 'leftovers'],
      ['latias', 50, ['thunderbolt', 'psychic', 'calm-mind', 'rest'], 'chesto-berry'],
      ['metagross', 50, ['psychic', 'meteor-mash', 'earthquake', 'protect'], 'quick-claw']] }
  };
  const ACE_SLOT = 8;                          // the top of the right half: he always comes through it

  const seed = (run, k, n) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + k * 7919 + n * 104729 + SALT) >>> 0));
  const total = sp => G.SPECIES[G.Maps.species(sp)].base.reduce((a, b) => a + b, 0);

  /** Each row of a team keeps its Pokémon's gender, IVs and nature, so the data sheet shows the very Pokémon that battle. */
  function settle(d, rng) {
    d.team = d.team.map(([sp, lvl, moves, item, o]) => {
      const m = G.Mon.create(G.Maps.species(sp), lvl, Object.assign({ rng, moves }, o));
      return [sp, lvl, moves, item, { gender: m.gender, ivs: m.ivs, nature: m.nature }];
    });
    return d;
  }

  function tucker(a) {
    const silver = a.print === 'silver';
    // Kanto's Gentleman Tucker (chapter 4) owns the plain key "Tucker"; the Dome Ace's name has its own context (石南 in Chinese).
    return { id: 'tucker', who: 'tucker', cls: 'dome-ace', name: G.T('Tucker', 'dome-ace'), ai: 'leader', prize: 0, items: {}, music: 'league',
             team: a.team, ace: a,
             before: silver ? T('Welcome to the stage, challenger! I am Tucker, the Dome Ace, and this crowd came to see a show. Let us give them one!')
               : T('The crowd is roaring for you this time! But the star of this Dome is still me!'),
             defeat: silver ? T('Bravo! The crowd loves you. This is yours, champion.') : T('What a finale! Today the Dome has a new star.') };
  }

  /** The k-th tournament of a streak (k = 1, 2...) for one challenge: sixteen entrants, the player in slot 0. */
  function tournament(k, run, mine) {
    const base = Math.min(3, k - 1), ace = ACE[k] || null, slots = [null];
    for (let s = 1; s < 16; s++) {
      if (ace && s === ACE_SLOT) { slots.push(settle(tucker(ace), seed(run, k, s))); continue; }
      const round = Math.min(3, base + (s >= 8 ? 1 : 0));
      const d = G.TowerHall.trainerFor(round * 7 + 1, 'single', run * 37 + k, { salt: SALT + s * 1009, before: BEFORE(), defeat: DEFEAT() });
      slots.push(settle(d, seed(run, k, s)));
    }
    // A name already taken goes to one of the others.
    const used = new Set([G.Field.save.player.name]), more = MORE();
    for (const d of slots.slice(1)) {
      if (used.has(d.name) && !d.ace) d.name = (WOMEN.has(d.cls) ? more.f : more.m).find(n => !used.has(n)) || d.name;
      used.add(d.name);
    }
    // Ranks: by the base stats of the three (the player's own too); the Dome Ace is always first.
    const score = s => (s === 0 ? mine.reduce((a, m) => a + total(m.sp), 0) : slots[s].ace ? Infinity : slots[s].team.reduce((a, t) => a + total(t[0]), 0));
    const ranks = [];
    [...Array(16).keys()].sort((a, b) => score(b) - score(a) || a - b).forEach((s, i) => { ranks[s] = i + 1; });
    return { k, run, slots, ranks, results: [[], [], [], []] };
  }

  /** The two slots of match j of round r (round 0: slots 2j and 2j + 1; later, the winners of the two matches before). */
  const match = (t, r, j) => (r === 0 ? [2 * j, 2 * j + 1] : [t.results[r - 1][2 * j], t.results[r - 1][2 * j + 1]]);

  /** Round r's other matches, between the other entrants: the better ranked wins seven times in ten (the Dome Ace always). */
  function simulate(t, r) {
    for (let j = 1; j < 8 >> r; j++) {
      const [a, b] = match(t, r, j), rng = seed(t.run, t.k, 100 + r * 8 + j);
      const fav = t.ranks[a] < t.ranks[b] ? a : b, other = fav === a ? b : a;
      t.results[r][j] = t.slots[fav].ace || (!t.slots[other].ace && rng.next() < 0.7) ? fav : other;
    }
  }

  /** How hard a team row's moves hit these species: the best move against each, added up. */
  function threat(row, targets) {
    const own = G.SPECIES[G.Maps.species(row[0])].types;
    let sum = 0;
    for (const sp of targets) {
      const types = G.SPECIES[sp].types;
      let best = 0;
      for (const id of row[2] || []) {
        const M = G.MOVES[id];
        if (M && M.pow) best = Math.max(best, M.pow * G.Types.eff(M.type, types) * (own.includes(M.type) ? 1.5 : 1));
      }
      sum += best;
    }
    return sum;
  }
  /** The two of a team that hit the player's three hardest, in the team's order. */
  const pickTwo = (team, targets) => team.map((row, i) => ({ row, i, s: threat(row, targets) }))
    .sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 2).sort((a, b) => a.i - b.i).map(x => x.row);

  /** The data sheet: their style by their status moves, and the stat their three are strongest in. */
  function style(d) {
    const moves = d.team.flatMap(t => t[2] || []), status = moves.filter(id => G.MOVES[id] && G.MOVES[id].cat === 'status').length;
    const share = moves.length ? status / moves.length : 0;
    return share >= 0.35 ? T('Favors tricky status moves.') : share <= 0.1 ? T('Favors all-out attacks.') : T('Mixes attacks and tricks.');
  }
  function trained(d) {
    const sums = [0, 0, 0, 0, 0, 0];
    for (const t of d.team) G.SPECIES[G.Maps.species(t[0])].base.forEach((v, i) => { sums[i] += v; });
    return G.Names.stat(['hp', 'atk', 'def', 'spa', 'spd', 'spe'][sums.indexOf(Math.max(...sums))]);
  }

  const speaker = d => G.TowerHall.speaker(d);
  const shortName = (t, s) => (s === 0 ? G.Field.save.player.name : G.T(t.slots[s].name));
  /** What the tree screen shows. */
  const tree = t => ({ names: [...Array(16).keys()].map(s => shortName(t, s)), ranks: t.ranks, me: 0, results: t.results });

  // ---------------- The counter ----------------
  const pickFrom = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));

  /** Two of the three for this match: -> them, or null (backed out). */
  async function chooseTwo(h, team) {
    const pick = pickFrom(h), picks = [];
    while (picks.length < 2) {
      const i = await pick({ mons: team, title: fmt('Choose Pokémon {k} of {n}.', { k: picks.length + 1, n: 2 }),
        note: (m, j) => (picks.includes(j) ? fmt('No. {k}', { k: picks.indexOf(j) + 1 }) : null), disabled: (m, j) => picks.includes(j) });
      if (i == null || !(i >= 0 && i < team.length) || picks.includes(i)) return null;
      picks.push(i);
    }
    return picks.map(i => team[i]);
  }

  /** The opponent's data: their three on the party screen (only to look at), their rank, style and training. */
  async function data(h, t, s) {
    const d = t.slots[s], rng = seed(t.run, t.k, 900 + s);
    const mons = d.team.map(([sp, lvl, moves, item, o]) => Object.assign(G.Mon.create(G.Maps.species(sp), lvl, Object.assign({ rng, moves }, o)), { item: item || null }));
    await pickFrom(h)({ mons, view: true, note: m => (m.item ? G.Names.item(m.item) : null),
      title: fmt('Rank {rank}. {style} Trained for {stat}.', { rank: t.ranks[s], style: style(d), stat: trained(d) }) });
  }

  async function counter(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('Welcome to the Battle Dome! Here, sixteen Trainers battle in a tournament.'));
    if (!F.flag('dome-rules')) {
      F.setFlag('dome-rules');
      await h.say(T('Enter three Pokémon. Before each match, you choose two of them to battle.'));
      await h.say(T('Win four matches in a row to become the champion and earn Battle Points. Before each match, you may look at the tournament tree and at your opponent\'s data.'));
      await h.say(T('Here, Pokémon above level 50 battle at level 50, and items from the Bag cannot be used. Win or lose, your Pokémon will be just as they were.'));
    }
    await h.say(T('Tournaments won in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak('single', HALL), best: Tw.best('single', HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const team = await G.TowerHall.pickEntrants(h, 3);
    if (!team) return;
    const run = (+F.getVar('dome-runs') || 0) + 1;
    F.setVar('dome-runs', run);
    const k = Tw.streak('single', HALL) + 1, t = tournament(k, run, team);
    G.DomeHall.last = t;
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'battle-dome-room', 'player']], h);
    let won = false;
    for (let r = 0; r < 4; r++) {
      simulate(t, r);
      const s = match(t, r, 0)[1], d = t.slots[s];
      let mine = null;
      for (;;) {
        await h.say(T('{round}: your opponent is {foe}.'), { vars: { round: ROUNDS()[r], foe: speaker(d).name } });
        const c = await h.choice(T('What will you do?'), { options: [T('Battle'), T('Opponent\'s data'), T('Tournament'), T('Retire')] });
        if (c === 1) { await data(h, t, s); continue; }
        if (c === 2) { if (G.DomeUI && !h.pickMon) await G.DomeUI.show(tree(t)); continue; }
        if (c === 3) break;
        mine = await chooseTwo(h, team);
        if (mine) break;
      }
      if (!mine) {
        Tw.setStreak('single', 0, HALL);
        await h.say(T('You retired from the tournament.'));
        break;
      }
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      if (d.ace) await h.say(T('In the final, the Dome Ace takes the stage himself!'));
      await h.say(d.before, speaker(d));
      const two = Object.assign({}, d, { team: pickTwo(d.team, team.map(m => m.sp)) });
      const out = await h.battle(two, { canLose: true, record: false, party: mine.map(m => Tw.copy(m)),
                                         rules: { noExp: true, noBag: true, shift: false } });
      if (out === 'lose') {
        h.hide('foe');
        t.results[r][0] = s;
        Tw.setStreak('single', 0, HALL);
        await h.say(T('You are out of the tournament. Please try again!'));
        break;
      }
      await h.say(d.defeat, speaker(d));
      h.hide('foe');
      t.results[r][0] = 0;
      if (r < 3) { await h.say(T('You won! On to the next round.')); continue; }
      won = true;
      Tw.setStreak('single', k, HALL);
      await h.say(T('Congratulations! You won the tournament!'));
      if (d.ace) {
        if (d.ace.print === 'silver') F.setFlag('dome-silver'); else F.setFlag('dome-gold');
        Tw.addBp(d.ace.bp);
        await h.say(d.ace.print === 'silver' ? T('Tucker recognizes your tactics. You earned the Silver Tactics Symbol!')
          : T('Tucker recognizes your tactics. You earned the Gold Tactics Symbol!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: d.ace.bp } });
      }
      const bp = Tw.bpFor(k);
      Tw.addBp(bp);
      await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
    }
    await G.Script.exec([['warp', 'battle-dome-lobby', 'single']], h);
    if (won) {
      await h.say(T('Tournaments won in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak('single', HALL), best: Tw.best('single', HALL) } });
      // The end of the eighty-first chapter (credits-ui.js), once the eightieth is done.
      if (F.flag('chapter-80-done') && !F.flag('chapter-81-done')) {
        if (G.CreditsUI) G.CreditsUI.ending(81); else F.setFlag('chapter-81-done');
      }
    }
  }

  G.Script.def({
    'dome.single': [['js', counter]],
    'dome.door': [['say', 'The door to the battle room. Challengers must register at the counter first.']],
    'dome.guide': [
      ['say', 'Look at the tournament tree before each match. The better ranked Trainers usually win their way through, but not always.'],
      ['say', 'Your opponent\'s data shows their three Pokémon. They will send out the two that do best against yours, so choose your two well.'],
      ['say', 'They say the Dome Ace himself waits in the final of every fifth tournament for a Trainer who keeps winning.']
    ]
  });
  G.DomeHall = { ACE, ACE_SLOT, tournament, simulate, match, pickTwo, threat, last: null };
})();
