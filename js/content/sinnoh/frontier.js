/* ============ frontier.js — Sinnoh's Battle Frontier: its gate, its plaza, the Battle Tower and the Battle Shops ============
 * Chapter 88 (Platinum's Battle Frontier, after the League). The building in Fight Area (battlezone.js), shut since chapter 61, is
 * the Battle Frontier's gate (`frontier-gate`): a door back to Fight Area, a door on to the plaza (`sinnoh-frontier`). On the
 * plaza: the Battle Tower and the Battle Shops are open (chapter 89: the Battle Factory, sfactory.js; chapter 90: the Battle Hall,
 * shall.js; chapter 91: the Battle Castle, scastle.js; chapter 92: the Battle Arcade, sarcade.js).
 * Chapter 95: the lobby's third counter, multi battles beside a partner (smulti.js).
 * The Battle Tower (`sinnoh-tower-lobby`, `sinnoh-tower-room`): Platinum's rules on G.Tower (js/world/tower.js) and the Hoenn
 * Tower's way of playing (G.TowerHall, js/content/hoenn/tower.js): three Pokémon for single battles, four for doubles, at level
 * 50 at most, seven battles a round, Battle Points by the round (G.Tower.bpFor: 3, 3, 4, 4, 5, 5, 7) and 20 for a round with
 * Palmer, the Tower Tycoon, at the 21st and 49th single battle (Platinum's teams, at level 50; Heatran's Focus Sash since
 * chapter 93, a Focus Band before). Its own streaks (G.Tower hall 'stower'); the Battle Points are the Hoenn Frontier's (one
 * save). Platinum's banned list (G.Tower.SINNOH_BANNED). Beating Palmer: the Silver or Gold Print (flags stower-silver,
 * stower-gold) and the Ability or Great Ability Ribbon for the three; the 50th double win in a row: the Double Ability Ribbon
 * for the four (G.Ribbons). The first round won once chapter 87 is done ends the chapter: `ending(88)`.
 * The Battle Shops (`frontier-shop`): Platinum's Training Stall and Move Stall at Platinum's prices (the Training Stall's
 * Generation 4 items since chapter 93: the first of them bought once chapter 92 is done ends that chapter, `ending(93)`).
 * The plaza's layout and the words are my own.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const HALL = 'stower';

  // ---------------- the gate ----------------
  G.Maps.def(Object.assign({
    id: 'frontier-gate', loc: 'fight-area', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p__bb_bb__p', '___________', '___=====___', '___________', '___________', '__X_____X__'],
    warps: [{ x: 2, y: 7, to: 'fight-area', spot: 'gate-door' }, { x: 8, y: 7, to: 'sinnoh-frontier', spot: 'gate' }],
    spots: { door: [2, 7, 'up'], plaza: [8, 7, 'up'] },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 5, y: 3, dir: 'down',
        say: 'Welcome to the Battle Frontier! Five facilities wait for the strongest Trainers.' },
      { id: 'fan', who: 'cooltrainer', x: 9, y: 5, dir: 'left',
        say: 'They say the Tower Tycoon is the father of a boy from Twinleaf Town. He waits at the top for anyone who wins twenty in a row.' }
    ]
  }, SINNOH));

  // ---------------- the plaza ----------------
  G.Maps.def(Object.assign({
    id: 'sinnoh-frontier', loc: 'fight-area', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................................T',
      'T..GGGGGG.......YYYYYYYY.......BBBBBB..T',
      'T..GGGGGG.......YYYYYYYY.......BBBBBB..T',
      'T..GGGGGG.......YYYYYYYY.......BBBBBB..T',
      'T..GGGGGG.......YYYYYYYY.......BBDBBB..T',
      'T..GGDGGG.......YYYYYYYY.........,.S...T',
      'T....,.S........YYYDYYYYS........,.....T',
      'T....,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.....T',
      'T..............,.......................T',
      'T..IIIIIIII....,........MMMM..EEEEEEEE.T',
      'T..IIIIIIII....,........MMMM..EEEEEEEE.T',
      'T..IIIIIIII....,........MDMMS.EEEEEEEE.T',
      'T..IIIIIIII....,.BBBBBB..,....EEEEEEEE.T',
      'T..IIIIIIII....,.BBBBBB..,....EEEDEEEE.T',
      'T..IIIDIIIIS...,.BBBBBB..,.......,.S...T',
      'T.....,,,,,,,,,,.BBDBBB..,.......,.....T',
      'T..............,,,,,,,,,,,,,,,,,,,.....T',
      'T......................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    warps: [
      { x: 19, y: 16, to: 'frontier-gate', spot: 'plaza' },
      { x: 19, y: 7, to: 'sinnoh-tower-lobby', spot: 'door' },
      { x: 25, y: 12, to: 'frontier-shop', spot: 'door' },
      { x: 33, y: 5, to: 'sfactory-lobby', spot: 'door' },                 // chapter 89 (sfactory.js)
      { x: 5, y: 6, to: 'shall-lobby', spot: 'door' },                     // chapter 90 (shall.js)
      { x: 6, y: 15, to: 'scastle-lobby', spot: 'door' },                  // chapter 91 (scastle.js)
      { x: 33, y: 14, to: 'sarcade-lobby', spot: 'door' }                  // chapter 92 (sarcade.js)
    ],
    spots: { gate: [19, 17, 'down'], 'tower-door': [19, 8, 'down'], 'shop-door': [25, 13, 'down'], 'factory-door': [33, 6, 'down'], 'hall-door': [5, 7, 'down'], 'castle-door': [6, 16, 'down'], 'arcade-door': [33, 15, 'down'] },
    signs: {
      '24,7': 'The Battle Tower. Single, double and multi battles, seven in a row, for Battle Points.',
      '28,12': 'The Battle Shops. Battle Points for items and TMs.',
      '35,6': 'The Battle Factory. Rental Pokémon, at level 50 or the Open Level.',
      '7,7': 'The Battle Hall. One Pokémon, a type of your choice for every battle.',
      '11,15': 'The Battle Castle. Castle Points pay for everything: win well to earn them.',
      '35,15': 'The Battle Arcade. A roulette before every battle: anything can happen!'
    },
    npcs: [
      { id: 'girl', who: 'lass', x: 27, y: 15, move: 'wander', r: 2, say: 'Battle Points from the Tower can be spent at the Battle Shops. I want a Scope Lens!' },
      { id: 'man', who: 'gentleman', x: 13, y: 12, dir: 'down', say: 'All five facilities are open at last. I hope I am still young enough to battle in every one of them.' }
    ]
  }, SINNOH));

  // ---------------- the Battle Tower ----------------
  G.Maps.def(Object.assign({
    id: 'sinnoh-tower-lobby', loc: 'fight-area', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WeWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++===========++',
      '+++++++++++++++',
      '+++++++++++++++',
      't+++++++++++++t',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'sinnoh-frontier', spot: 'tower-door' },
            { x: 13, y: 1, to: 'sinnoh-tower-room', spot: 'player', if: 'scripted', locked: 'stower.door' },
            { x: 1, y: 1, to: 'sinnoh-tower-salon', spot: 'player', if: 'scripted', locked: 'stower.door' }],   // chapter 95 (smulti.js)
    spots: { door: [7, 8, 'up'], single: [3, 4, 'up'], double: [6, 4, 'up'], multi: [9, 4, 'up'], guide: [12, 4, 'up'] },
    signs: { '13,1': { script: 'stower.door' }, '1,1': { script: 'stower.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 3, y: 2, dir: 'down', script: 'stower.single' },
      { id: 'double', who: 'clerk', x: 6, y: 2, dir: 'down', script: 'stower.double' },
      { id: 'multi', who: 'clerk', x: 9, y: 2, dir: 'down', script: 'stower.multi' },        // chapter 95 (smulti.js)
      { id: 'guide', who: 'clerk', x: 12, y: 2, dir: 'down', script: 'stower.guide' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'sinnoh-tower-room', loc: 'fight-area', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWW', 'WWWWWWWWW', '+++++++++', '+++++++++', '+++++++++', '+++++++++', '+++++++++', '++++X++++'],
    warps: [{ x: 4, y: 7, to: 'sinnoh-tower-lobby', spot: 'double' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, SINNOH));

  // ---------------- the Battle Shops ----------------
  G.Maps.def(Object.assign({
    id: 'frontier-shop', loc: 'fight-area', tileset: 'indoor', palette: 'mart', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p_________p', '__===_===__', '___________', '___________', '___________', '_____X_____'],
    warps: [{ x: 5, y: 7, to: 'sinnoh-frontier', spot: 'shop-door' }],
    spots: { door: [5, 7, 'up'], training: [3, 4, 'up'], moves: [7, 4, 'up'] },
    npcs: [
      { id: 'training', who: 'clerk', x: 3, y: 2, dir: 'down', script: 'sfrontier.training' },
      { id: 'moves', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'sfrontier.moves' }
    ]
  }, SINNOH));

  // ---------------- Palmer ----------------
  /** Palmer, the Tower Tycoon: his teams at the 21st and 49th single battle (Platinum's, at level 50). */
  const PALMER = {
    21: { print: 'silver', ribbon: 'ability', team: [
      ['milotic', 50, ['surf', 'ice-beam', 'attract', 'hypnosis'], 'shell-bell'],
      ['rhyperior', 50, ['rock-wrecker', 'earthquake', 'crunch', 'roar'], 'focus-band'],
      ['dragonite', 50, ['dragon-claw', 'aerial-ace', 'thunder-wave', 'dragon-dance'], 'lum-berry']] },
    49: { print: 'gold', ribbon: 'great-ability', team: [
      ['regigigas', 50, ['crush-grip', 'earthquake', 'stone-edge', 'drain-punch'], 'bright-powder'],
      ['heatran', 50, ['magma-storm', 'flash-cannon', 'earth-power', 'explosion'], 'focus-sash'],
      ['cresselia', 50, ['psychic', 'ice-beam', 'signal-beam', 'moonlight'], 'leftovers']] }
  };
  const BRAIN_BP = 20;
  const BEFORE = () => [T('This tower is the top of Sinnoh. Every Trainer here came to win. So did I.'),
    T('Twenty-one battles, forty-nine... the number means nothing until you win the next one.'), T('Show me the bond you built on your way up!'),
    T('I have watched your streak from the stands. Now I want to see it up close.'), T('No more warm-ups. Let us battle!')];
  const DEFEAT = () => [T('Ha! Not bad at all.'), T('That stung. Keep climbing.'), T('Your team clearly trusts you.'),
    T('I lost, but what a battle!'), T('All right, you earned that one.')];

  /** The opponent of battle No. n in Sinnoh's Battle Tower: Palmer at the 21st and 49th single battle, else a Trainer
   *  from the Hoenn Tower's roll (another seed, other lines). */
  function trainerFor(n, mode, run) {
    const brain = mode === 'single' && PALMER[n];
    if (brain) {
      return { id: 'palmer', who: 'palmer', cls: 'tower-tycoon', name: 'Palmer', ai: 'leader', prize: 0, items: {}, music: 'league',
               team: brain.team, brain,
               before: brain.print === 'silver' ? T('So you are the one who has won twenty in a row! I am Palmer, the Tower Tycoon. My son never stops talking about you. Now show me why!')
                 : T('Forty-eight wins! I have been waiting for you. This time I bring my strongest team. Hold nothing back!'),
               defeat: brain.print === 'silver' ? T('Ha ha! What a battle! I can see why my son calls you his rival.') : T('Wonderful! I have nothing left to show you. You are the true master of this tower!') };
    }
    return G.TowerHall.trainerFor(n, mode, run, { salt: 88, before: BEFORE(), defeat: DEFEAT() });
  }

  // ---------------- the counters ----------------
  async function counter(h, mode) {
    const F = G.Field, Tw = G.Tower, R = G.Ribbons, n = mode === 'double' ? 4 : 3;
    await h.say(mode === 'double' ? T('Welcome to the Battle Tower! This counter is for double battles.')
      : T('Welcome to the Battle Tower! This counter is for single battles.'));
    if (!F.flag('stower-rules')) {
      F.setFlag('stower-rules');
      await h.say(T('In the Battle Tower, you battle Trainers one after another. Win seven in a row to finish a set and earn Battle Points.'));
      await h.say(T('Enter three Pokémon for single battles, or four for double battles. They must all be different species holding different items, and some legendary Pokémon cannot enter.'));
      await h.say(T('Here, Pokémon above level 50 battle at level 50, and items from the Bag cannot be used. Win or lose, your Pokémon will be just as they were.'));
    }
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak(mode, HALL), best: Tw.best(mode, HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const team = await G.TowerHall.pickEntrants(h, n, Tw.SINNOH_BANNED);
    if (!team) return;
    const run = (+F.getVar('stower-runs') || 0) + 1;
    F.setVar('stower-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'sinnoh-tower-room', 'player']], h);
    let set = false, brainRound = false;
    for (;;) {
      const no = Tw.streak(mode, HALL) + 1, d = trainerFor(no, mode, run);
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      await h.say(d.brain ? T('The Tower Tycoon has come to battle you himself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
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
      if (d.brain) {
        brainRound = true;
        if (d.brain.print === 'silver') F.setFlag('stower-silver'); else F.setFlag('stower-gold');
        await h.say(d.brain.print === 'silver' ? T('Palmer recognizes your strength. You earned the Silver Print!') : T('Palmer recognizes your strength. You earned the Gold Print!'));
        if (R && team.map(m => R.give(m, d.brain.ribbon)).some(Boolean)) {
          await h.say(fmt('Your Pokémon received the {ribbon}!', { ribbon: R.name(d.brain.ribbon) }));
        }
      }
      // The 50th double battle in a row: the Double Ability Ribbon for the four.
      if (mode === 'double' && no === 50 && R && team.map(m => R.give(m, 'double-ability')).some(Boolean)) {
        await h.say(fmt('Fifty double battles in a row! Your Pokémon received the {ribbon}!', { ribbon: R.name('double-ability') }));
      }
      if (no % 7 === 0) {
        const bp = brainRound ? BRAIN_BP : Tw.bpFor(no / 7);
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
    }
    await G.Script.exec([['warp', 'sinnoh-tower-lobby', mode]], h);
    if (set) await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: Tw.streak(mode, HALL) + 1 } });
    // The end of the eighty-eighth chapter (credits-ui.js), once the eighty-seventh is done.
    if (set && F.flag('chapter-87-done') && !F.flag('chapter-88-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(88); else F.setFlag('chapter-88-done');
    }
  }

  async function guide(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('The Tower Tycoon, Palmer, battles challengers who reach the 21st and the 49th single battle in a row.'));
    await h.say(T('Beat him and you earn a Print, and your Pokémon earn a ribbon. Fifty double battles in a row earn a ribbon too.'));
    await h.say(T('In multi battles, a Trainer you have traveled with battles beside you. Fifty wins in a row earn a ribbon as well.'));
    await h.say(T('Silver Print: {s}. Gold Print: {g}. Battle Points: {n}.'), { vars: {
      s: F.flag('stower-silver') ? T('Yes') : T('No'), g: F.flag('stower-gold') ? T('Yes') : T('No'), n: Tw.bp() } });
  }

  // ---------------- the Battle Shops ----------------
  const TRAINING = [['hp-up', 1], ['protein', 1], ['iron', 1], ['calcium', 1], ['zinc', 1], ['carbos', 1],
                    ['power-bracer', 16], ['power-belt', 16], ['power-lens', 16], ['power-band', 16], ['power-anklet', 16], ['power-weight', 16],
                    ['toxic-orb', 16], ['flame-orb', 16], ['white-herb', 32], ['power-herb', 32],
                    ['bright-powder', 48], ['choice-band', 48], ['focus-band', 48], ['scope-lens', 48], ['muscle-band', 48], ['focus-sash', 48],
                    ['choice-scarf', 48], ['razor-claw', 48], ['razor-fang', 48], ['rare-candy', 48]];
  /** The Training Stall's items that came with chapter 93 (Generation 4's held items). */
  const GEN4 = new Set(['power-bracer', 'power-belt', 'power-lens', 'power-band', 'power-anklet', 'power-weight', 'toxic-orb', 'flame-orb',
                        'power-herb', 'choice-band', 'muscle-band', 'focus-sash', 'choice-scarf']);
  const MOVES = [['tm06', 32], ['tm73', 32], ['tm61', 32], ['tm45', 32], ['tm40', 40], ['tm31', 40], ['tm08', 48], ['tm04', 48],
                 ['tm81', 64], ['tm30', 64], ['tm53', 64], ['tm36', 80], ['tm59', 80], ['tm71', 80], ['tm26', 80]];
  /** A list to pick from: the pop-up on screen, the dialog's choices without one. -> the chosen option's value */
  async function choose(h, title, opts) {
    if (G.Popup && G.Popup.choose) return G.Popup.choose(title, opts);
    const k = await h.choice(title, { options: opts.map(o => o.label) });
    return (opts[k] || {}).value;
  }
  async function stall(h, list, hello) {
    const Tw = G.Tower, F = G.Field;
    let gen4 = false;
    await h.say(hello);
    for (;;) {
      const v = await choose(h, fmt('You have {n} BP. What would you like?', { n: Tw.bp() }),
        list.map(([id, p]) => ({ label: fmt('{item} · {n} BP', { item: G.Names.item(id), n: p }), value: id }))
          .concat([{ label: T('See you!'), value: null, back: true }]));
      if (!v) break;
      const p = list.find(([id]) => id === v)[1];
      if (Tw.bp() < p) { await h.say(T('You do not have enough BP.')); continue; }
      Tw.addBp(-p);
      await G.Script.exec([['giveItem', v, 1]], h);
      if (GEN4.has(v)) gen4 = true;
    }
    await h.say(T('Please come again!'));
    // The end of the ninety-third chapter (credits-ui.js): a Generation 4 item bought once the ninety-second is done.
    if (gen4 && F.flag('chapter-92-done') && !F.flag('chapter-93-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(93); else F.setFlag('chapter-93-done');
    }
  }

  G.Script.def({
    'stower.single': [['js', h => counter(h, 'single')]],
    'stower.double': [['js', h => counter(h, 'double')]],
    'stower.guide': [['js', guide]],
    'stower.door': [['say', 'The door to the battle room. Challengers must register at one of the counters first.']],
    'sfrontier.training': [['js', h => stall(h, TRAINING, T('Welcome to the Training Stall! Vitamins and held items, for Battle Points.'))]],
    'sfrontier.moves': [['js', h => stall(h, MOVES, T('Welcome to the Move Stall! Our TMs teach the moves the Battle Frontier\'s best Trainers use.'))]]
  });
  G.SinnohTowerHall = { PALMER, BRAIN_BP, HALL, trainerFor, TRAINING, MOVES, GEN4, BEFORE, DEFEAT };
})();
