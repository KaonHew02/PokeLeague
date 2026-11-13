/* ============ palace.js — the Battle Palace ============
 * Chapter 80, Hoenn after the League: a fourth building on the Battle Tower's island (js/content/hoenn/tower.js), under a
 * golden roof. Single battles. The player enters three of their own Pokémon (G.TowerHall.pickEntrants, as at the Battle
 * Tower: one of each species, no two holding the same item, no banned legend; level 50 at most; copies that never change
 * the party; no Bag, no Exp. Points). The battle rule rules.palace (js/battle/battle.js): nobody gives orders; each Pokémon
 * picks attacking, defending or supporting moves by its nature (other odds below half HP) and may hesitate when it lacks
 * the kind it wants; the player may only switch. Opponents are the Battle Tower's (G.TowerHall.trainerFor with the
 * Palace's seed and lines), stronger every seven. Seven wins in a row finish a set: Battle Points (G.Tower.bpFor), shared
 * with the Tower's Exchange Service Corner. Spenser, the Palace Maven, is the 21st (the Silver Spirit Symbol) and the 42nd
 * (the Gold) opponent with his teams and natures from Emerald. Streaks: G.Tower.streak('single', 'palace'). The first set
 * of seven once chapter 79 is done ends the chapter: `ending(80)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const HALL = 'palace';
  const SALT = 155921;                         // the Palace's seeds differ from the other halls'

  // ---------------- The lobby: the counter and a lady in a kimono who knows about natures ----------------
  G.Maps.def(Object.assign({
    id: 'battle-palace-lobby', loc: 'battle-palace', tileset: 'indoor', palette: 'house', music: 'center', battleBg: 'indoor',
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
    // The battle room's door opens only for a challenger (the counter's script takes you through it).
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'palace-door' },
            { x: 13, y: 1, to: 'battle-palace-room', spot: 'player', if: 'scripted', locked: 'palace.door' }],
    spots: { door: [7, 8, 'up'], single: [7, 4, 'up'] },
    signs: { '13,1': { script: 'palace.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'palace.single' },
      { id: 'guide', who: 'kimono', x: 2, y: 6, dir: 'right', script: 'palace.guide' }
    ]
  }, HOENN));

  // ---------------- The battle room ----------------
  G.Maps.def(Object.assign({
    id: 'battle-palace-room', loc: 'battle-palace', tileset: 'indoor', palette: 'house', music: 'center', battleBg: 'indoor',
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
    warps: [{ x: 4, y: 7, to: 'battle-palace-lobby', spot: 'single' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, HOENN));

  // ---------------- The opponents ----------------
  const BEFORE = () => [T('My Pokémon know what to do. I just watch!'), T('In the Palace, you find out who your Pokémon really are.'),
    T('I trust my Pokémon completely. Do you?'), T('No orders here. Only character!'), T('Let us see whose Pokémon have the stronger spirit!')];
  const DEFEAT = () => [T('Your Pokémon have a strong spirit...'), T('Mine did their best. I am proud of them.'),
    T('I should get to know my Pokémon better.'), T('Their natures beat mine today.')];

  /** Spenser, the Palace Maven: his teams at the 21st and 42nd battle (moves and items from Serebii, natures from altissimo). */
  const MAVEN = {
    21: { print: 'silver', bp: 10, team: [
      ['crobat', 50, ['confuse-ray', 'double-team', 'toxic', 'fly'], 'bright-powder', { nature: 'adamant' }],
      ['slaking', 50, ['earthquake', 'swagger', 'shadow-ball', 'brick-break'], 'scope-lens', { nature: 'hardy' }],
      ['lapras', 50, ['ice-beam', 'horn-drill', 'confuse-ray', 'protect'], 'quick-claw', { nature: 'quiet' }]] },
    42: { print: 'gold', bp: 20, team: [
      ['arcanine', 50, ['overheat', 'extreme-speed', 'roar', 'protect'], 'white-herb', { nature: 'hasty' }],
      ['slaking', 50, ['hyper-beam', 'earthquake', 'shadow-ball', 'yawn'], 'scope-lens', { nature: 'hardy' }],
      ['suicune', 50, ['blizzard', 'surf', 'bite', 'calm-mind'], 'kings-rock', { nature: 'hasty' }]] }
  };

  /** The opponent of battle No. n (the same one for the same run): a trainer def for G.World.battle. */
  function trainerFor(n, run) {
    const m = MAVEN[n];
    if (m) {
      const silver = m.print === 'silver';
      return { id: 'spenser', who: 'spenser', cls: 'palace-maven', name: 'Spenser', ai: 'leader', prize: 0, items: {}, music: 'league',
               team: m.team, maven: m,
               before: silver ? T('So you are the Trainer who keeps winning in my Palace. I am Spenser, the Palace Maven. Here, Pokémon show who they truly are. Let us see yours!')
                 : T('You have returned. Then let my Pokémon speak for me once more.'),
               defeat: silver ? T('Your Pokémon fight with heart, just as you do. Take this.') : T('I have nothing left to teach you. Your bond with your Pokémon is the real thing.') };
    }
    return G.TowerHall.trainerFor(n, 'single', run, { salt: SALT, before: BEFORE(), defeat: DEFEAT() });
  }

  // ---------------- The counter ----------------
  async function counter(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('Welcome to the Battle Palace! Here, Pokémon choose their own moves.'));
    if (!F.flag('palace-rules')) {
      F.setFlag('palace-rules');
      await h.say(T('Enter three Pokémon. In battle you cannot give them orders: each one picks its moves as its nature tells it. You may only switch them.'));
      await h.say(T('Win seven in a row to finish a set and earn Battle Points. Pokémon above level 50 battle at level 50, items from the Bag cannot be used, and your Pokémon will be just as they were.'));
    }
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak('single', HALL), best: Tw.best('single', HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const team = await G.TowerHall.pickEntrants(h, 3);
    if (!team) return;
    const run = (+F.getVar('palace-runs') || 0) + 1;
    F.setVar('palace-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'battle-palace-room', 'player']], h);
    let set = false;
    for (;;) {
      const no = Tw.streak('single', HALL) + 1, d = trainerFor(no, run);
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      await h.say(d.maven ? T('The Palace Maven has come to battle you himself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
      await h.say(d.before, G.TowerHall.speaker(d));
      const out = await h.battle(d, { canLose: true, record: false, party: team.map(m => Tw.copy(m)),
                                       rules: { palace: true, noExp: true, noBag: true, shift: false } });
      if (out === 'lose') {
        h.hide('foe');
        Tw.setStreak('single', 0, HALL);
        await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
        break;
      }
      await h.say(d.defeat, G.TowerHall.speaker(d));
      h.hide('foe');
      Tw.setStreak('single', no, HALL);
      if (d.maven) {
        if (d.maven.print === 'silver') F.setFlag('palace-silver'); else F.setFlag('palace-gold');
        Tw.addBp(d.maven.bp);
        await h.say(d.maven.print === 'silver' ? T('Spenser recognizes your spirit. You earned the Silver Spirit Symbol!')
          : T('Spenser recognizes your spirit. You earned the Gold Spirit Symbol!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: d.maven.bp } });
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
        Tw.setStreak('single', 0, HALL);
        await h.say(T('You retired. Wins in a row: {n}.'), { vars: { n: no } });
        break;
      }
    }
    await G.Script.exec([['warp', 'battle-palace-lobby', 'single']], h);
    if (set) {
      await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: Tw.streak('single', HALL) + 1 } });
      // The end of the eightieth chapter (credits-ui.js), once the seventy-ninth is done.
      if (F.flag('chapter-79-done') && !F.flag('chapter-80-done')) {
        if (G.CreditsUI) G.CreditsUI.ending(80); else F.setFlag('chapter-80-done');
      }
    }
  }

  G.Script.def({
    'palace.single': [['js', counter]],
    'palace.door': [['say', 'The door to the battle room. Challengers must register at the counter first.']],
    'palace.guide': [
      ['say', 'In the Palace, Pokémon choose their own moves. Each one goes for attacking, defending or supporting moves, as its nature makes it want to.'],
      ['say', 'When its HP falls below half, many a Pokémon changes its habits completely.'],
      ['say', 'A Pokémon that wants a kind of move it does not know may simply hesitate. Give each one moves its nature likes!'],
      ['say', 'They say the Palace Maven himself appears before Trainers who win twenty-one battles in a row.']
    ]
  });
  G.PalaceHall = { MAVEN, trainerFor };
})();
