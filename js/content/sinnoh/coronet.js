/* ============ coronet.js — the way up Mt. Coronet and the Spear Pillar ============
 * Chapter 55. Once the lake Pokémon are free (flag trio-free) the ladder in Mt. Coronet 1F (hearthome.js) opens: 2F, 4F,
 * the snow outside (Hail in battle), 5F, 6F and the cave at the top, with Team Galactic's grunts all the way. Platinum's way
 * needs Rock Climb, which this game does not have, so the floors are plain caves and fewer of them; its Trainers and wild
 * Pokémon are kept. At the Spear Pillar two grunts stop you in a double battle (flag pillar-grunts). Then Cyrus calls Dialga
 * and Palkia with the Red Chain, Mars and Jupiter stand in the way, Barry runs in, heals your team and fights beside you (a
 * multi battle: `partner`, `rules.tag`). After it a great shadow shakes the pillars, Dialga and Palkia vanish, a rift
 * takes Cyrus, and Cynthia arrives (flag pillar-done), then `ending(55)`. The rift leads to the Distortion World (distortion.js).
 */
(() => {
  const T = s => G.T(s);
  const CYRUS = { name: 'Cyrus' }, MARS = { name: 'Mars' }, JUPITER = { name: 'Jupiter' }, BARRY = { name: 'Barry' }, CYNTHIA = { name: 'Cynthia' };
  const GRUNT = { name: 'Team Galactic Grunt' };
  const CAVE = { loc: 'mt-coronet', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const STUNKY = ['slash', 'toxic', 'night-slash', 'memento'], GOLBAT = ['confuse-ray', 'air-cutter', 'mean-look', 'poison-fang'];
  const HOUNDOUR = ['beat-up', 'fire-fang', 'feint-attack', 'embargo'], GLAMEOW = ['assist', 'captivate', 'slash', 'sucker-punch'];
  const MURKROW = ['assurance', 'taunt', 'feint-attack', 'mean-look'], CROAGUNK = ['mud-bomb', 'sucker-punch', 'nasty-plot', 'poison-jab'];
  const grunt = o => Object.assign({ who: 'galactic', cls: 'team-galactic', sight: 4 }, o);

  // Barry at the Spear Pillar, by the starter he chose (the variable barry-starter).
  const MUNCHLAX = ['munchlax', 40, ['body-slam', 'stockpile', 'swallow', 'screech']], STARAPTOR = ['staraptor', 42, ['close-combat', 'aerial-ace', 'take-down', 'quick-attack']];
  const FLOATZEL = ['floatzel', 40, ['aqua-jet', 'pursuit', 'brick-break', 'iron-tail']], HERACROSS = ['heracross', 42, ['close-combat', 'brick-break', 'night-slash', 'aerial-ace']];
  const RAPIDASH = ['rapidash', 40, ['fire-blast', 'will-o-wisp', 'stomp', 'take-down']], ROSERADE = ['roserade', 40, ['giga-drain', 'toxic', 'ingrain', 'grass-whistle']];
  const BARRY_TEAMS = {
    387: [MUNCHLAX, STARAPTOR, FLOATZEL, HERACROSS, RAPIDASH, ['torterra', 44, ['giga-drain', 'bite', 'leech-seed', 'synthesis']]],
    390: [MUNCHLAX, STARAPTOR, FLOATZEL, HERACROSS, ROSERADE, ['infernape', 44, ['close-combat', 'punishment', 'flame-wheel', 'will-o-wisp']]],
    393: [MUNCHLAX, STARAPTOR, ROSERADE, HERACROSS, RAPIDASH, ['empoleon', 44, ['aqua-jet', 'aerial-ace', 'metal-claw', 'swagger']]]
  };
  // Mars and Jupiter as one foe: their teams alternate, and each refills their own slot (rules.tag).
  const COMMANDERS = { id: 'commanders', cls: 'galactic-commanders', name: 'Mars and Jupiter', who: 'mars', ai: 'leader', double: true,
    team: [['bronzor', 44, ['gyro-ball', 'extrasensory', 'light-screen', 'confuse-ray']], ['bronzor', 44, ['gyro-ball', 'extrasensory', 'rock-slide', 'reflect']],
           ['golbat', 44, ['air-cutter', 'bite', 'poison-fang', 'confuse-ray']], ['golbat', 44, ['sludge-bomb', 'air-cutter', 'giga-drain', 'mean-look']],
           ['purugly', 46, ['slash', 'shadow-claw', 'aerial-ace', 'hypnosis'], 'sitrus-berry'], ['skuntank', 46, ['night-slash', 'poison-jab', 'flamethrower', 'smokescreen'], 'sitrus-berry']] };

  // ---------------- The floors ----------------
  G.Maps.def(Object.assign({}, CAVE, {
    id: 'coronet-2f',
    rows: [
      '##############################',
      '##############################',
      '###......#######.........%####',
      '###......#######.............#',
      '##.......#######.....####....#',
      '##.......#######.....####....#',
      '##...........###.....####....#',
      '##...........###.....####....#',
      '####.........###.............#',
      '####.........................#',
      '####......####...............#',
      '#######...####.......####....#',
      '#######...####.......####....#',
      '##...........................#',
      '##...........................#',
      '##%.......########........####',
      '##############################',
      '##############################'
    ],
    warps: [{ x: 2, y: 15, to: 'mt-coronet-1f', spot: 'ladder' }, { x: 25, y: 2, to: 'coronet-4f', spot: 'from-below' }],
    spots: { 'from-below': [2, 14, 'up'], 'from-above': [25, 3, 'down'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 11, y: 9, dir: 'right', team: [['stunky', 43, STUNKY]],
        before: 'The boss is going up to the peak, and nobody follows him. Nobody!',
        defeat: 'You followed him. I said nobody!',
        after: 'There are more of us higher up. Many more.' }),
      grunt({ id: 'grunt-b', x: 20, y: 3, dir: 'down', team: [['murkrow', 43, MURKROW]],
        before: 'I carried boxes all the way up this mountain. I am in no mood for you!',
        defeat: 'And now my arms hurt and I have lost.',
        after: 'I do not know what was in the boxes. I am not paid to know.' })
    ],
    items: [
      { x: 4, y: 3, item: 'max-repel', flag: 'coronet-2f-repel' },
      { x: 3, y: 7, item: 'max-revive', flag: 'coronet-2f-revive' },
      { x: 27, y: 13, item: 'tm80', flag: 'coronet-2f-tm80' }
    ],
    encounters: { walk: '@mt-coronet-2f' }
  }));

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'coronet-4f',
    rows: [
      '##########################',
      '##########################',
      '###############O##########',
      '####.....................#',
      '####.....................#',
      '##...####.......####.....#',
      '##...####.......####.....#',
      '##...####.......####.....#',
      '##..............####.....#',
      '##..............####.....#',
      '##.....####..............#',
      '##.....####..............#',
      '##.....####.........######',
      '##%.................######',
      '##########################',
      '##########################'
    ],
    warps: [{ x: 2, y: 13, to: 'coronet-2f', spot: 'from-above' }, { x: 15, y: 2, to: 'coronet-snow', spot: 'south' }],
    spots: { 'from-below': [3, 13, 'right'], snow: [15, 3, 'down'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 11, y: 8, dir: 'down', team: [['stunky', 42, STUNKY], ['golbat', 40, GOLBAT]],
        before: 'A kid, this high up? You should have stayed at the bottom!',
        defeat: 'I should have stayed at the bottom.',
        after: 'It gets cold outside. I hope you brought a coat.' }),
      grunt({ id: 'grunt-b', x: 21, y: 4, dir: 'left', team: [['houndour', 40, HOUNDOUR], ['golbat', 40, GOLBAT], ['houndour', 40, HOUNDOUR]],
        before: 'The way out to the snow is mine to guard. Turn around!',
        defeat: 'I was told this would be an easy post.',
        after: 'The boss walked past me without a word. He never even looked at me.' })
    ],
    items: [{ x: 23, y: 11, item: 'max-repel', flag: 'coronet-4f-repel' }],
    encounters: { walk: '@mt-coronet-4f' }
  }));

  // Outside, in the snow. Both cave mouths look south, so the way runs round the rock.
  G.Maps.def({
    id: 'coronet-snow', loc: 'mt-coronet', tileset: 'outdoor', palette: 'snow', music: 'cave', battleBg: 'ice', border: '#', region: 'sinnoh', snow: true, hail: true,
    rows: [
      '##############################',
      '##############################',
      '#####################O########',
      '####......................####',
      '####....""""""....""""""..####',
      '###.....""""""....""""""..####',
      '###.....""""""....""""""...###',
      '###..................####..###',
      '######.........##...####..####',
      '######.........##.........####',
      '######O######...##..""""..####',
      '####.........................#',
      '####....""""""....""""""....##',
      '####....""""""....""""""....##',
      '####.........................#',
      '##############################',
      '##############################'
    ],
    warps: [{ x: 6, y: 10, to: 'coronet-4f', spot: 'snow' }, { x: 21, y: 2, to: 'coronet-5f', spot: 'snow' }],
    spots: { south: [6, 11, 'down'], north: [21, 3, 'down'] },
    encounters: { walk: '@mt-coronet-exterior-snowfall' }
  });

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'coronet-5f',
    rows: [
      '##########################',
      '##########################',
      '###%......#####..........#',
      '###.......#####..........#',
      '###.......#####....###...#',
      '##........#####....###...#',
      '##.................###...#',
      '##.................###...#',
      '##....####...............#',
      '##....####...............#',
      '##....####.....#####.....#',
      '##.............#####.....#',
      '##########O###############',
      '##########################'
    ],
    warps: [{ x: 10, y: 12, to: 'coronet-snow', spot: 'north' }, { x: 3, y: 2, to: 'coronet-6f', spot: 'from-below' }],
    spots: { snow: [10, 11, 'up'], 'from-above': [3, 3, 'down'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 6, y: 6, dir: 'right', team: [['houndour', 40, HOUNDOUR], ['glameow', 42, GLAMEOW]],
        before: 'You came through the snow for this? You must really want to lose!',
        defeat: 'My feet are too cold to think straight.',
        after: 'The ladder goes on up. I would stay here if I were you.' }),
      grunt({ id: 'grunt-b', x: 15, y: 8, dir: 'down', team: [['glameow', 41, GLAMEOW], ['golbat', 41, GOLBAT]],
        before: 'A new world is about to begin, and you are spoiling it!',
        defeat: 'Spoiled.',
        after: 'What do you mean, a place for us? Of course there is a place for us. The boss said so.' })
    ],
    items: [{ x: 24, y: 2, item: 'tm02', flag: 'coronet-5f-tm02' }],
    encounters: { walk: '@mt-coronet-5f' }
  }));

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'coronet-6f',
    rows: [
      '######################',
      '######################',
      '###...........%#######',
      '###.............######',
      '###....##.......######',
      '##.....##.....########',
      '##.....##.....########',
      '##............########',
      '##%...........########',
      '######################',
      '######################'
    ],
    warps: [{ x: 2, y: 8, to: 'coronet-5f', spot: 'from-above' }, { x: 14, y: 2, to: 'coronet-top', spot: 'from-below' }],
    spots: { 'from-below': [3, 8, 'right'], 'from-above': [14, 3, 'down'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 10, y: 5, dir: 'down', team: [['golbat', 39, GOLBAT], ['croagunk', 40, CROAGUNK], ['murkrow', 41, MURKROW]],
        before: 'The air is thin up here. Let me take your breath away!',
        defeat: 'I think you took mine.',
        after: 'Can you feel the mountain shaking? It started when the boss went up.' })
    ],
    encounters: { walk: '@mt-coronet-6f' }
  }));

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'coronet-top',
    rows: [
      '############################',
      '############################',
      '######################O#####',
      '####.....................###',
      '####.....................###',
      '####....####....####.....###',
      '####....####....####.....###',
      '##......####....####.....###',
      '##...............###.....###',
      '##%..............###.....###',
      '############################',
      '############################'
    ],
    warps: [{ x: 2, y: 9, to: 'coronet-6f', spot: 'from-above' }, { x: 22, y: 2, to: 'spear-pillar', spot: 'from-below' }],
    spots: { 'from-below': [3, 9, 'right'], 'from-above': [22, 3, 'down'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 11, y: 8, dir: 'right', team: [['croagunk', 38, CROAGUNK], ['stunky', 40, STUNKY], ['croagunk', 42, CROAGUNK]],
        before: 'This is the last cave before the peak. You will not see the end of it!',
        defeat: 'You saw the end of it.',
        after: 'The ruins on the peak are older than anybody knows.' }),
      grunt({ id: 'grunt-b', x: 14, y: 4, dir: 'down', team: [['golbat', 43, GOLBAT]],
        before: 'My Golbat has been waiting in the dark for days. It is not in a good mood!',
        defeat: 'Now it is in a worse one.',
        after: 'Go on, then. The Commanders are up there.' }),
      grunt({ id: 'grunt-c', x: 23, y: 7, dir: 'up', team: [['murkrow', 39, MURKROW], ['glameow', 42, GLAMEOW], ['murkrow', 39, MURKROW]],
        before: 'Nobody reaches the Spear Pillar today!',
        defeat: 'Somebody just did.',
        after: 'I have never seen the boss look happy before today. It was not a nice thing to see.' })
    ],
    encounters: { walk: '@mt-coronet-1f-from-exterior' }
  }));

  // ---------------- The Spear Pillar ----------------
  G.Maps.def({
    id: 'spear-pillar', loc: 'spear-pillar', tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', region: 'sinnoh', escape: true,
    commanders: COMMANDERS, barryTeams: BARRY_TEAMS,
    rows: [
      'WWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWW',
      'W+j++++++++++++j+W',
      'W++++++++++++++++W',
      'W++++++++++++++++W',
      'W+j+++++w++++++j+W',
      'W++++++++++++++++W',
      'W++++++++++++++++W',
      'W+j++++++++++++j+W',
      'W++++++++++++++++W',
      'W++++++++++++++++W',
      'W+j++++++++++++j+W',
      'W++++++++++++++++W',
      'WWWWWWWW++WWWWWWWW',
      'W++++++++++++++++W',
      'W++++++++++++++++W',
      'WWWWWWWW^WWWWWWWWW'
    ],
    warps: [{ x: 8, y: 16, to: 'coronet-top', spot: 'from-above' }, { x: 8, y: 5, to: 'distortion-1', spot: 'start', if: '!distortion-done', locked: 'pillar.rift-closed' }],
    spots: { 'from-below': [8, 15, 'up'], rift: [8, 6, 'down'] },
    triggers: [{ x: 1, y: 10, w: 16, h: 1, if: ['pillar-grunts', '!pillar-done'], script: 'pillar.ritual' }],
    npcs: [
      { id: 'cyrus', who: 'cyrus', x: 8, y: 5, dir: 'up', if: '!pillar-done', script: 'pillar.ritual' },
      { id: 'mars', who: 'mars', x: 7, y: 7, dir: 'down', if: '!pillar-done', script: 'pillar.ritual' },
      { id: 'jupiter', who: 'jupiter', x: 10, y: 7, dir: 'down', if: '!pillar-done', script: 'pillar.ritual' },
      { id: 'dialga', who: 'dialga', mon: 'dialga', x: 6, y: 3, dir: 'down', fixed: true, if: 'scripted' },
      { id: 'palkia', who: 'palkia', mon: 'palkia', x: 11, y: 3, dir: 'down', fixed: true, if: 'scripted' },
      { id: 'barry', who: 'barry', x: 11, y: 12, dir: 'up', if: ['pillar-done', '!distortion-done'], say: 'Nothing is getting past me while I watch this place. Go on, you will be late!' },
      { id: 'cynthia', who: 'cynthia', x: 6, y: 12, dir: 'up', if: ['pillar-done', '!distortion-done'], say: 'Step into the rift when you are ready. I will be right behind you.' }
    ],
    trainers: [
      grunt({ id: 'pair', x: 8, y: 13, dir: 'down', sight: 2, double: true, partner: { who: 'galactic', x: 9, y: 13, dir: 'down' }, if: '!pillar-grunts',
        team: [['croagunk', 39, CROAGUNK], ['stunky', 41, STUNKY], ['croagunk', 43, ['sucker-punch', 'nasty-plot', 'poison-jab', 'sludge-bomb']], ['glameow', 41, GLAMEOW]],
        before: 'The boss has begun, and nobody is to disturb him. It will take both of us to make sure of that!',
        defeat: 'Both of us were not enough!',
        win: 'pillar.grunts-win' })
    ]
  });

  /** The Spear Pillar: the ritual, the multi battle with Barry, the shadow, and Cynthia. */
  async function ritual(h) {
    const F = G.Field;
    if (F.flag('pillar-done')) return;
    const names = { vars: { dialga: G.Names.mon(483), palkia: G.Names.mon(484) } };
    await h.say(T('So you climbed all this way. You are just in time to watch.'), CYRUS);
    await h.say(T('This is the Red Chain. With it, the masters of time and space must answer to me.'), CYRUS);
    h.sfx('cry');
    h.show('dialga'); h.show('palkia');
    await h.say(T('{dialga} and {palkia} appeared among the pillars!'), names);
    await h.say(T('The old world ends here. Mars. Jupiter. See that I am not disturbed.'), CYRUS);
    await h.say(T('You heard the boss. This is as far as you go.'), MARS);
    await h.say(T('I told you not to bother, did I not? Two Commanders at once. Good luck.'), JUPITER);
    h.show('barry');
    await h.say(T('Hold it right there! You are not doing this without me, {player}!'), BARRY);
    await h.say(T('I trained until I dropped, and then I ran all the way up here. That Commander owes me a rematch!'), BARRY);
    await h.say(T('Your team looks tired. Here, let me fix that.'), BARRY);
    h.heal();
    await h.jingle('heal');
    await h.say(T('Two against two, {player}! Let us show them!'), BARRY);
    const team = BARRY_TEAMS[F.getVar('barry-starter')] || BARRY_TEAMS[390];
    const out = await h.battle(COMMANDERS, { partner: { name: T('Barry'), team }, rules: { tag: true } });
    if (out === 'lose') return;
    h.heal();
    await h.say(T('No! We are Commanders of Team Galactic!'), MARS);
    await h.say(T('Stop now, if you like. It hardly matters. The boss has already won.'), JUPITER);
    await h.say(T('Yes. Watch closely. The chain holds, and the world begins again, with no spirit left to spoil it.'), CYRUS);
    h.sfx('cry');
    await h.say(T('Suddenly the ground shook. A huge shadow rose out of the stones and spread across the pillars.'));
    h.hide('dialga'); h.hide('palkia');
    await h.say(T('{dialga} and {palkia} were gone!'), names);
    await h.say(T('What is this? Something is tearing the air apart. This was no part of my world!'), CYRUS);
    await h.fade('out', 0.4);
    h.hide('cyrus');
    await h.fade('in', 0.4);
    await h.say(T('A rift split the air, and dark shapes dragged Cyrus inside!'));
    await h.say(T('Boss? Boss!'), MARS);
    await h.say(T('This is not what we were told would happen. Come on, Mars. We are leaving.'), JUPITER);
    await h.fade('out', 0.4);
    h.hide('mars'); h.hide('jupiter');
    h.show('cynthia');
    await h.fade('in', 0.4);
    await h.say(T('I came as fast as I could, and I see I am too late to stop it.'), CYNTHIA);
    await h.say(T('That shadow was Giratina. The old stories of Celestic Town tell of a Pokémon sent away for its violence, to a world behind our own.'), CYNTHIA);
    await h.say(T('Cyrus reached for time and space, and it came to answer him. Now the way is open, and that world is pressing against this one.'), CYNTHIA);
    await h.say(T('Somebody has to go in after him. I am going, and I would be glad to have you beside me, {player}.'), CYNTHIA);
    await h.say(T('I will stay and guard this place. Somebody has to, and I just ran up a mountain. Do not be late coming back!'), BARRY);
    F.setFlag('pillar-done');
    // The end of the fifty-fifth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(55); else F.setFlag('chapter-55-done');
  }

  G.Script.def({
    'coronet.way-up': [['say', 'Fallen rocks block the ladder. There is no way up for now.']],
    'coronet.climber': [
      ['if', 'trio-free', [
        ['say', 'People in white uniforms came through in a great hurry. They cleared the rocks and went up that ladder!']
      ], [
        ['say', 'The way up the mountain is closed by a rockfall. Nobody has been to the peak in years.']
      ]]
    ],
    'pillar.grunts-win': [
      ['say', 'The boss will not be pleased. Not that he is ever pleased.', GRUNT],
      ['fade', 'out', 0.3], ['setFlag', 'pillar-grunts'], ['fade', 'in', 0.3]
    ],
    'pillar.ritual': [['js', ritual]],
    'pillar.rift-closed': [['say', 'The rift has closed. Only a faint shimmer is left in the air.']]
  });
})();
