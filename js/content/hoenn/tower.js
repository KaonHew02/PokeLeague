/* ============ tower.js — the Battle Tower ============
 * Chapter 43, Hoenn after the League. The ferry in Lilycove City sails to the Battle Tower. At its
 * counters the player enters three Pokémon for single battles or four for double battles (G.Tower,
 * js/world/tower.js: one of each species, no two holding the same item, no banned legends; level 50 at
 * most, copies that never change the party; no Bag, no Exp. Points). Trainers come one after another in
 * the battle room (teams by G.Tower.team, stronger every seven); after each win the player keeps going or
 * retires (the streak is lost). Seven wins in a row finish a set: Battle Points (G.Tower.bpFor), and the
 * streak goes on next time. In single battles Anabel, the Salon Maiden, is the 21st (Silver Print) and the
 * 49th (Gold Print) opponent. The Exchange Service Corner trades BP for vitamins and held items. The first
 * set of seven ends the chapter: `ending(43)`.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const SAILOR = { name: 'Sailor' };

  // ---------------- The island ----------------
  G.Maps.def(Object.assign({
    id: 'battle-tower', loc: 'hoenn-battle-tower', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~',
      '~~~TTTTTTTTTTTTTT~~~',
      '~~TT............TT~~',
      '~~T...YYYYYYYY...T~~',
      '~~T...YYYYYYYY...T~~',
      '~~T...YYYYYYYY...T~~',
      '~~T...YYYYYYYY...T~~',
      '~~T...YYYYYYYY...T~~',
      '~~T...YYYDYYYY...T~~',
      '~~T.....,,.......T~~',
      '~~TT....,,......TT~~',
      '~~~TTT..,,..TTTTT~~~',
      '~~~~~~~~==~~~~~~~~~~',
      '~~~~~~~~==~~~~~~~~~~'
    ],
    warps: [{ x: 9, y: 8, to: 'battle-tower-lobby', spot: 'door' }],
    spots: { pier: [8, 12, 'up'], 'tower-door': [9, 9, 'down'] },
    npcs: [{ id: 'sailor', who: 'sailor', x: 9, y: 13, dir: 'up', script: 'tower.ferry-back' }]
  }, HOENN));

  // ---------------- The lobby: two counters and the Exchange Service Corner ----------------
  G.Maps.def(Object.assign({
    id: 'battle-tower-lobby', loc: 'hoenn-battle-tower', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
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
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'tower-door' },
            { x: 13, y: 1, to: 'battle-tower-room', spot: 'player', if: 'scripted', locked: 'tower.door' }],
    spots: { door: [7, 8, 'up'], single: [3, 4, 'up'], double: [7, 4, 'up'], exchange: [11, 4, 'up'] },
    signs: { '13,1': { script: 'tower.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 3, y: 2, dir: 'down', script: 'tower.single' },
      { id: 'double', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'tower.double' },
      { id: 'exchange', who: 'clerk', x: 11, y: 2, dir: 'down', script: 'tower.exchange' }
    ]
  }, HOENN));

  // ---------------- The battle room ----------------
  G.Maps.def(Object.assign({
    id: 'battle-tower-room', loc: 'hoenn-battle-tower', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
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
    warps: [{ x: 4, y: 7, to: 'battle-tower-lobby', spot: 'double' }],
    spots: { player: [4, 5, 'up'] },
    // The opponent of each battle: shown with the trainer's own look, then gone.
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, HOENN));

  // ---------------- The opponents ----------------
  const CLASSES = [['cooltrainer', 0], ['cooltrainer-f', 1], ['psychic', 0], ['black-belt', 0], ['battle-girl', 1],
                   ['gentleman', 0], ['beauty', 1], ['bird-keeper', 0]];
  const MEN = () => [T('Gilbert'), T('Franklin'), T('Jack'), T('Dominik'), T('Colin'), T('Travis'), T('Hayden'), T('Kai'), T('Lucas'), T('Ned')];
  const WOMEN = () => [T('Dana'), T('Kelsey'), T('Imani'), T('Beverly'), T('Jennifer'), T('Irene'), T('Nancy'), T('Haley')];
  const BEFORE = () => [T('I have trained for this tower for years. Let us see what you have!'),
    T('Only the strongest climb this tower. Show me you belong here!'), T('My team is ready. Is yours?'),
    T('A new challenger? Do not expect me to go easy on you.'), T('Every battle here is a test, and I intend to pass mine!'),
    T('I heard about your streak. It ends with me!')];
  const DEFEAT = () => [T('I see... You really are strong.'), T('My training was not enough...'), T('What a battle! Keep climbing.'),
    T('Beaten... but I learned something today.'), T('Your streak goes on. Impressive.')];

  /** Anabel, the Salon Maiden: her teams at the 21st and 49th single battle. */
  const BRAIN = {
    21: { print: 'silver', bp: 10, team: [
      ['alakazam', 50, ['psychic', 'thunder-punch', 'ice-punch', 'calm-mind'], 'bright-powder'],
      ['entei', 50, ['fire-blast', 'crunch', 'calm-mind', 'extreme-speed'], 'quick-claw'],
      ['snorlax', 50, ['body-slam', 'earthquake', 'curse', 'rest'], 'chesto-berry']] },
    49: { print: 'gold', bp: 20, team: [
      ['raikou', 50, ['thunderbolt', 'crunch', 'calm-mind', 'reflect'], 'leftovers'],
      ['latios', 50, ['dragon-claw', 'psychic', 'recover', 'calm-mind'], 'scope-lens'],
      ['snorlax', 50, ['body-slam', 'shadow-ball', 'curse', 'rest'], 'chesto-berry']] }
  };

  /** The opponent of battle No. n (the same one for the same run): a trainer def for G.World.battle. */
  function trainerFor(n, mode, run) {
    const brain = mode === 'single' && BRAIN[n];
    if (brain) {
      return { id: 'anabel', who: 'anabel', cls: 'salon-maiden', name: 'Anabel', ai: 'leader', prize: 0, items: {}, music: 'league',
               team: brain.team, brain,
               before: brain.print === 'silver' ? T('So you are the one climbing my tower. I am Anabel, the Salon Maiden. Let me see how deep your bond with your Pokémon runs.')
                 : T('You came back. This time I will not hold anything back.'),
               defeat: brain.print === 'silver' ? T('...Impressive. Your Pokémon trust you completely.') : T('There is nothing left for me to test. You are truly strong.') };
    }
    const id = (G.Field.save.player.id | 0) * 131 + run * 977 + n * 7919 + (mode === 'double' ? 3 : 0);
    const rng = G.RNG(id >>> 0);
    const [cls, woman] = rng.pick(CLASSES);
    return { id: 'tower', who: G.TRAINER_CLASSES[cls].who, cls, name: rng.pick(woman ? WOMEN() : MEN()), ai: 'leader', prize: 0, items: {},
             double: mode === 'double', team: G.Tower.team(rng, Math.floor((n - 1) / 7), mode === 'double' ? 4 : 3),
             before: rng.pick(BEFORE()), defeat: rng.pick(DEFEAT()) };
  }

  /** The trainer's name as the dialogue box shows it ("Cool Trainer Dana"). */
  function speaker(d) {
    const c = G.TRAINER_CLASSES[d.cls] || {};
    return { name: G.I18n.t(c.title || '', c.ctx || 'trainer') + ' ' + G.T(d.name) };
  }

  // ---------------- The counters ----------------
  async function counter(h, mode) {
    const F = G.Field, Tw = G.Tower, n = mode === 'double' ? 4 : 3;
    await h.say(mode === 'double' ? T('Welcome to the Battle Tower! This counter is for double battles.')
      : T('Welcome to the Battle Tower! This counter is for single battles.'));
    if (!F.flag('tower-rules')) {
      F.setFlag('tower-rules');
      await h.say(T('In the Battle Tower, you battle Trainers one after another. Win seven in a row to finish a set and earn Battle Points.'));
      await h.say(T('Enter three Pokémon for single battles, or four for double battles. They must all be different species holding different items, and some legendary Pokémon cannot enter.'));
      await h.say(T('Here, Pokémon above level 50 battle at level 50, and items from the Bag cannot be used. Win or lose, your Pokémon will be just as they were.'));
    }
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak(mode), best: Tw.best(mode) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const party = F.party();
    if (party.filter(m => !G.Tower.BANNED.includes(m.sp)).length < n) {
      await h.say(T('You need at least {n} Pokémon that can enter.'), { vars: { n } });
      return;
    }
    // The Pokémon to enter, one by one.
    const pick = h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
    const picks = [], NOTE = { banned: T('Cannot enter'), species: T('Same species'), item: T('Same item') };
    while (picks.length < n) {
      const chosen = picks.map(i => party[i]);
      const i = await pick({ title: fmt('Choose Pokémon {k} of {n}.', { k: picks.length + 1, n }),
        note: (m, j) => (picks.includes(j) ? fmt('No. {k}', { k: picks.indexOf(j) + 1 }) : NOTE[Tw.why(m, chosen)] || null),
        disabled: (m, j) => picks.includes(j) || !!Tw.why(m, chosen) });
      if (i == null || i < 0 || picks.includes(i) || Tw.why(party[i], chosen)) { await h.say(T('Please come again!')); return; }
      picks.push(i);
    }
    const team = picks.map(i => party[i]);
    const run = (+F.getVar('tower-runs') || 0) + 1;
    F.setVar('tower-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'battle-tower-room', 'player']], h);
    let set = false;
    for (;;) {
      const no = Tw.streak(mode) + 1, d = trainerFor(no, mode, run);
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      await h.say(d.brain ? T('The Salon Maiden has come to battle you herself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
      await h.say(d.before, speaker(d));
      const out = await h.battle(d, { canLose: true, record: false, party: team.map(m => Tw.copy(m)),
                                       rules: { noExp: true, noBag: true, shift: false } });
      if (out === 'lose') {
        h.hide('foe');
        Tw.setStreak(mode, 0);
        await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
        break;
      }
      await h.say(d.defeat, speaker(d));
      h.hide('foe');
      Tw.setStreak(mode, no);
      if (d.brain) {
        if (d.brain.print === 'silver') F.setFlag('tower-silver'); else F.setFlag('tower-gold');
        Tw.addBp(d.brain.bp);
        await h.say(d.brain.print === 'silver' ? T('Anabel recognizes your strength. You earned the Silver Print!') : T('Anabel recognizes your strength. You earned the Gold Print!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: d.brain.bp } });
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
        Tw.setStreak(mode, 0);
        await h.say(T('You retired. Wins in a row: {n}.'), { vars: { n: no } });
        break;
      }
    }
    await G.Script.exec([['warp', 'battle-tower-lobby', mode]], h);
    if (set && !F.flag('chapter-43-done')) {
      await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: Tw.streak(mode) + 1 } });
      // The end of the forty-third chapter (credits-ui.js).
      if (G.CreditsUI) G.CreditsUI.ending(43); else F.setFlag('chapter-43-done');
    }
  }

  // ---------------- The Exchange Service Corner ----------------
  const VITAMINS = [['hp-up', 1], ['protein', 1], ['iron', 1], ['calcium', 1], ['zinc', 1], ['carbos', 1]];
  const HELD = [['leftovers', 48], ['bright-powder', 32], ['focus-band', 32], ['scope-lens', 32], ['quick-claw', 32], ['kings-rock', 32], ['shell-bell', 32]];
  async function exchange(h) {
    const Tw = G.Tower;
    await h.say(T('This is the Exchange Service Corner. Your Battle Points can be traded for prizes here.'));
    for (;;) {
      const c = await h.choice(T('You have {n} BP. What would you like?'), { options: [T('Vitamins'), T('Held items'), T('See you!')], vars: { n: Tw.bp() } });
      if (c !== 0 && c !== 1) break;
      const list = c === 0 ? VITAMINS : HELD;
      const i = await h.choice(T('Which one would you like?'), { options: list.map(([id, p]) => fmt('{item} · {n} BP', { item: G.Names.item(id), n: p })).concat([T('Cancel')]) });
      if (!(i >= 0 && i < list.length)) continue;
      const [id, p] = list[i];
      if (Tw.bp() < p) { await h.say(T('You do not have enough BP.')); continue; }
      Tw.addBp(-p);
      await G.Script.exec([['giveItem', id, 1]], h);
    }
    await h.say(T('Please come again!'));
  }

  G.Script.def({
    'tower.single': [['js', h => counter(h, 'single')]],
    'tower.double': [['js', h => counter(h, 'double')]],
    'tower.exchange': [['js', exchange]],
    'tower.door': [['say', 'The door to the battle room. Challengers must register at one of the counters first.']],
    'tower.ferry-back': [
      ['choice', 'Ready to sail back to Lilycove City?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The ship sailed back north to Lilycove City.'],
        ['warp', 'lilycove', 'harbor']
      ], [], SAILOR]
    ]
  });
  G.TowerHall = { BRAIN, trainerFor };
})();
