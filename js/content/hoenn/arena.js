/* ============ arena.js — the Battle Arena ============
 * Chapter 79, Hoenn after the League: a third building on the Battle Tower's island (js/content/hoenn/tower.js), shaped
 * like a Gym. Single battles only. The player enters three of their own Pokémon (G.TowerHall.pickEntrants, as at the
 * Battle Tower: one of each species, no two holding the same item, no banned legend; level 50 at most; copies that never
 * change the party; no Bag, no Exp. Points) in the order they will come out. The battle rule rules.arena
 * (js/battle/battle.js): one on one with no switching; if neither has fainted after three turns, the referee judges
 * Mind, Skill and Body and the loser is out, while the winner battles on with the HP it has left. Opponents are the
 * Battle Tower's (G.TowerHall.trainerFor with the Arena's seed and lines), stronger every seven. Seven wins in a row
 * finish a set: Battle Points (G.Tower.bpFor), shared with the Tower's Exchange Service Corner. Greta, the Arena Tycoon,
 * is the 28th (the Silver Guts Symbol) and the 56th (the Gold) opponent with her teams from Emerald. Streaks:
 * G.Tower.streak('single', 'arena'). The first set of seven once chapter 78 is done ends the chapter: `ending(79)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const HALL = 'arena';
  const SALT = 130363;                         // the Arena's seeds differ from the Tower's and the Factory's

  // ---------------- The lobby: the counter and a Black Belt who explains the judging ----------------
  G.Maps.def(Object.assign({
    id: 'battle-arena-lobby', loc: 'battle-arena', tileset: 'indoor', palette: 'gym', music: 'center', battleBg: 'indoor',
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
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'arena-door' },
            { x: 13, y: 1, to: 'battle-arena-room', spot: 'player', if: 'scripted', locked: 'arena.door' }],
    spots: { door: [7, 8, 'up'], single: [7, 4, 'up'] },
    signs: { '13,1': { script: 'arena.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'arena.single' },
      { id: 'guide', who: 'blackbelt', x: 2, y: 6, dir: 'right', script: 'arena.guide' }
    ]
  }, HOENN));

  // ---------------- The battle room: a dojo with the referee at the side ----------------
  G.Maps.def(Object.assign({
    id: 'battle-arena-room', loc: 'battle-arena', tileset: 'indoor', palette: 'gym', music: 'center', battleBg: 'indoor',
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
    warps: [{ x: 4, y: 7, to: 'battle-arena-lobby', spot: 'single' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [
      { id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' },
      { id: 'referee', who: 'gentleman', x: 1, y: 4, dir: 'right', script: 'arena.referee' }
    ]
  }, HOENN));

  // ---------------- The opponents ----------------
  const BEFORE = () => [T('Three turns are all I need!'), T('The referee is watching. Let us give them a good show!'),
    T('In here, nobody switches out. It is all guts!'), T('I will win on points if I have to!'), T('My Pokémon never back down. Do yours?')];
  const DEFEAT = () => [T('Beaten fair and square...'), T('Even the referee could see you were better.'),
    T('No regrets. That was a real fight!'), T('My guts were not enough this time...')];

  /** Greta, the Arena Tycoon: her teams at the 28th and 56th battle (Emerald's, from 52poke). */
  const TYCOON = {
    28: { print: 'silver', bp: 10, team: [
      ['heracross', 50, ['megahorn', 'rock-tomb', 'endure', 'reversal'], 'salac-berry'],
      ['umbreon', 50, ['body-slam', 'confuse-ray', 'psychic', 'feint-attack'], 'leftovers'],
      ['shedinja', 50, ['shadow-ball', 'return', 'confuse-ray', 'aerial-ace'], 'bright-powder']] },
    56: { print: 'gold', bp: 20, team: [
      ['umbreon', 50, ['double-edge', 'confuse-ray', 'rest', 'psychic'], 'chesto-berry'],
      ['gengar', 50, ['psychic', 'hypnosis', 'dream-eater', 'destiny-bond'], 'leftovers'],
      ['breloom', 50, ['spore', 'focus-punch', 'giga-drain', 'headbutt'], 'lum-berry']] }
  };

  /** The opponent of battle No. n (the same one for the same run): a trainer def for G.World.battle. */
  function trainerFor(n, run) {
    const t = TYCOON[n];
    if (t) {
      const silver = t.print === 'silver';
      return { id: 'greta', who: 'greta', cls: 'arena-tycoon', name: 'Greta', ai: 'leader', prize: 0, items: {}, music: 'league',
               team: t.team, tycoon: t,
               before: silver ? T('So you are the one everybody is talking about! I am Greta, the Arena Tycoon. In my Arena, guts beat everything. Show me yours!')
                 : T('You again! Good, I have been waiting. This time I am giving it everything I have got!'),
               defeat: silver ? T('Whoa, you have got guts! Fine, this is yours.') : T('Ha ha! That was the best battle I have had in ages. You earned it!') };
    }
    return G.TowerHall.trainerFor(n, 'single', run, { salt: SALT, before: BEFORE(), defeat: DEFEAT() });
  }

  // ---------------- The counter ----------------
  async function counter(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('Welcome to the Battle Arena! Here, Pokémon battle one on one, three turns at a time.'));
    if (!F.flag('arena-rules')) {
      F.setFlag('arena-rules');
      await h.say(T('Enter three Pokémon. They come out in the order you choose them, and they cannot be switched out.'));
      await h.say(T('If neither Pokémon has fainted after three turns, the referee judges Mind, Skill and Body. The loser is out, and the winner battles on with the HP it has left.'));
      await h.say(T('Win seven in a row to finish a set and earn Battle Points. Pokémon above level 50 battle at level 50, items from the Bag cannot be used, and your Pokémon will be just as they were.'));
    }
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak('single', HALL), best: Tw.best('single', HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const team = await G.TowerHall.pickEntrants(h, 3);
    if (!team) return;
    const run = (+F.getVar('arena-runs') || 0) + 1;
    F.setVar('arena-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'battle-arena-room', 'player']], h);
    let set = false;
    for (;;) {
      const no = Tw.streak('single', HALL) + 1, d = trainerFor(no, run);
      const foe = G.World && G.World.actor && G.World.actor('foe');
      if (foe) foe.who = d.who;
      h.show('foe');
      await h.say(d.tycoon ? T('The Arena Tycoon has come to battle you herself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
      await h.say(d.before, G.TowerHall.speaker(d));
      const out = await h.battle(d, { canLose: true, record: false, party: team.map(m => Tw.copy(m)),
                                       rules: { arena: true, noExp: true, noBag: true, shift: false } });
      if (out === 'lose') {
        h.hide('foe');
        Tw.setStreak('single', 0, HALL);
        await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
        break;
      }
      await h.say(d.defeat, G.TowerHall.speaker(d));
      h.hide('foe');
      Tw.setStreak('single', no, HALL);
      if (d.tycoon) {
        if (d.tycoon.print === 'silver') F.setFlag('arena-silver'); else F.setFlag('arena-gold');
        Tw.addBp(d.tycoon.bp);
        await h.say(d.tycoon.print === 'silver' ? T('Greta recognizes your guts. You earned the Silver Guts Symbol!')
          : T('Greta recognizes your guts. You earned the Gold Guts Symbol!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: d.tycoon.bp } });
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
    await G.Script.exec([['warp', 'battle-arena-lobby', 'single']], h);
    if (set) {
      await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: Tw.streak('single', HALL) + 1 } });
      // The end of the seventy-ninth chapter (credits-ui.js), once the seventy-eighth is done.
      if (F.flag('chapter-78-done') && !F.flag('chapter-79-done')) {
        if (G.CreditsUI) G.CreditsUI.ending(79); else F.setFlag('chapter-79-done');
      }
    }
  }

  G.Script.def({
    'arena.single': [['js', counter]],
    'arena.door': [['say', 'The door to the battle room. Challengers must register at the counter first.']],
    'arena.guide': [
      ['say', 'Mind is about attacking without holding back. Hiding behind Protect costs you points.'],
      ['say', 'Skill is about hitting where it hurts. Moves that do not work well count against you.'],
      ['say', 'Body is about the HP your Pokémon keeps. Think about the order: a winner stays in with the HP it has left.'],
      ['say', 'They say the Arena Tycoon herself comes out for Trainers who win twenty-eight battles in a row.']
    ],
    'arena.referee': [['say', 'Mind, Skill and Body. After three turns, I judge every match-up fairly.']]
  });
  G.ArenaHall = { TYCOON, trainerFor };
})();
