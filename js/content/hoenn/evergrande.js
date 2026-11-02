/* ============ evergrande.js — Ever Grande City, Victory Road, Hoenn's Elite Four and the Champion Wallace ============
 * Chapter 39, the end of the journey through Hoenn. Route 128's east end is Ever Grande City's sea: a
 * waterfall (Waterfall) climbs to the plateau with the Pokémon Center and Victory Road's mouth (open with
 * all eight Hoenn badges). Victory Road: the south hall of 1F (two Cool Trainers), B1F with an underground
 * river (Surf; two Cool Trainers), the north hall of 1F (a Cool Trainer, and Wally: a battle, flag
 * wally-vroad) and the way out to the League on the top of the city. The League's lobby (a nurse, a shop,
 * the guard), then Sidney (Dark), Phoebe (Ghost), Glacia (Ice) and Drake (Dragon) in four rooms (flags
 * he4-*, cleared by the first room's `enter`), and the Champion: Wallace. Beating him: the Hall of Fame
 * (save.fame, flag hoenn-champion), home to Littleroot and `ending(39)`. As in Kanto and Johto, the teams
 * are Emerald's three levels lower (Wallace six), and once you are Hoenn's Champion everyone battles ten
 * levels up.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const WALLY = { name: 'Wally' }, WALLACE = { name: 'Wallace' };
  const LEAGUE = { loc: 'hoenn-pokemon-league', tileset: 'indoor', music: 'gym', battleBg: 'indoor', region: 'hoenn' };
  const ROAD = { loc: 'hoenn-victory-road', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, region: 'hoenn' };

  // ---------------- Ever Grande City ----------------
  G.Maps.def(Object.assign({
    id: 'ever-grande', loc: 'ever-grande-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TT..........IIIIIIII..........TT',
      'TT...####...IIIIIIII..........TT',
      'TT...####...IIIIIIII..........TT',
      'TT...#O##...IIIIIIII..........TT',
      'TT..........IIIIIIII..........TT',
      'TT..fff.....IIIDIIII...ffff...TT',
      'TT..fff........,.......ffff...TT',
      'TT..fff........,.......ffff...TT',
      'TT...........###..............TT',
      'T#############O#########vvv####T',
      'TT............,...............TT',
      'TT..CCCCC.....,...............TT',
      'TT..CCCCC..S..,...............TT',
      'TT..CCCCC.....,...............TT',
      'TT..CCDCC.....,...............TT',
      'TT....,.......,...............TT',
      'TT....,,,,,,,,,,,,,,,,,,,,....TT',
      'TT...........~~~~~~~..........TT',
      'TT...........~~~~~~~..........TT',
      'TT...........~~~~~~~..........TT',
      'TT...........~~~~~~~..........TT',
      'T###############|##############T',
      'T###############|##############T',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~::::::~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~:####:~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~:####:~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~::::::~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { west: { map: 'route128', offset: 10 } },
    warps: [
      { x: 6, y: 15, to: 'ever-grande-center', spot: 'door' },
      { x: 14, y: 10, to: 'hoenn-victory-1f', spot: 'mouth', if: 'badge:24', locked: 'evergrande.road-shut' },
      { x: 6, y: 4, to: 'hoenn-victory-1f', spot: 'exit' },
      { x: 15, y: 6, to: 'hoenn-league', spot: 'door' }
    ],
    spots: { 'center-door': [6, 16, 'down'], 'road-door': [14, 11, 'down'], 'road-exit': [6, 5, 'down'], 'league-door': [15, 7, 'down'] },
    signs: { '11,13': 'Ever Grande City. The city of flowers and sea, where the best Trainers of Hoenn come to challenge the League.' },
    npcs: [
      { id: 'trainer', who: 'cooltrainerm', x: 20, y: 14, move: 'look',
        say: 'Victory Road is a maze of rock and water. You will need Strength, Surf and a lot of nerve.' },
      { id: 'girl', who: 'cooltrainer', x: 22, y: 4, move: 'look',
        say: 'You made it through Victory Road? Then the League is right there. Good luck!' }
    ],
    encounters: { water: '@ever-grande-city-area' }
  }, HOENN));

  G.Maps.center('ever-grande-center', {
    loc: 'ever-grande-city', exit: { map: 'ever-grande', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'Only Trainers with all eight of Hoenn\'s badges may enter Victory Road. The guards check every one.' }]
  }).region = 'hoenn';

  // ---------------- Victory Road ----------------
  G.Maps.def(Object.assign({
    id: 'hoenn-victory-1f',
    rows: [
      '##############################',
      '####O#########################',
      '##....................###...##',
      '##....................###...##',
      '##......###.................##',
      '##......###.....####........##',
      '##......###.....####........##',
      '##..............####........##',
      '##.......................%..##',
      '##..........................##',
      '##############################',
      '##############################',
      '##############################',
      '##................##........##',
      '##................##.....%..##',
      '##........###.....##........##',
      '##........###.....##........##',
      '##........###...............##',
      '##..##......................##',
      '##..##......................##',
      '##..........................##',
      '##..........................##',
      '########O#####################',
      '##############################'
    ],
    warps: [
      { x: 8, y: 22, to: 'ever-grande', spot: 'road-door' },
      { x: 25, y: 14, to: 'hoenn-victory-b1f', spot: 'south' },
      { x: 25, y: 8, to: 'hoenn-victory-b1f', spot: 'north' },
      { x: 4, y: 1, to: 'ever-grande', spot: 'road-exit' }
    ],
    spots: { mouth: [8, 21, 'up'], 'south-ladder': [25, 14, 'down'], 'north-ladder': [25, 8, 'down'], exit: [4, 2, 'down'] },
    triggers: [{ x: 7, y: 2, w: 1, h: 8, if: '!wally-vroad', script: 'vroad.wally' }],
    npcs: [{ id: 'wally', who: 'wally', x: 4, y: 4, dir: 'right', if: '!hoenn-champion', script: 'vroad.wally' }],
    trainers: [
      { id: 'albert', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Albert', x: 14, y: 18, dir: 'left', sight: 4, team: [['magneton', 42], ['muk', 42]],
        before: 'Only the strongest Trainers make it through Victory Road. Are you one of them?',
        defeat: 'You are the real thing.',
        after: 'The road goes down and across an underground river. Keep going!' },
      { id: 'hope', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Hope', x: 20, y: 19, dir: 'up', sight: 4, team: [['roselia', 43], ['altaria', 42]],
        before: 'I have come so far, and I am not turning back now!',
        defeat: 'I will have to try again next year...',
        after: 'Altaria\'s cotton wings are softer than clouds. Its Dragon moves are not, though.' },
      { id: 'edgar', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Edgar', x: 12, y: 6, dir: 'down', sight: 3, team: [['cacturne', 43], ['pelipper', 43]],
        before: 'The exit is right there, but you will have to get past me first!',
        defeat: 'So close to the League, and I lost...',
        after: 'The League is just outside. Heal up before you go in.' }
    ],
    items: [{ x: 26, y: 20, item: 'full-restore', flag: 'hvroad-fullrestore' }, { x: 3, y: 9, item: 'max-revive', flag: 'hvroad-maxrevive' }],
    encounters: { walk: '@hoenn-victory-road-1f' }
  }, ROAD));

  G.Maps.def(Object.assign({
    id: 'hoenn-victory-b1f',
    rows: [
      '##############################',
      '##############################',
      '###........................###',
      '##..##......................##',
      '##..##........###........%..##',
      '##..##........###...........##',
      '##............###...........##',
      '##..........................##',
      '##..........................##',
      '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
      '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
      '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
      '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
      '##..........................##',
      '##..........................##',
      '##....###................%..##',
      '##....###...................##',
      '##....###.........###.......##',
      '##................###.......##',
      '##................###.......##',
      '##..........................##',
      '###........................###',
      '##############################',
      '##############################'
    ],
    warps: [{ x: 25, y: 15, to: 'hoenn-victory-1f', spot: 'south-ladder' }, { x: 25, y: 4, to: 'hoenn-victory-1f', spot: 'north-ladder' }],
    spots: { south: [25, 15, 'up'], north: [25, 4, 'down'] },
    trainers: [
      { id: 'caroline', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Caroline', x: 10, y: 19, dir: 'up', sight: 4, team: [['skarmory', 42], ['sableye', 42], ['manectric', 43]],
        before: 'The river below Victory Road is the last test. And I am the test before it!',
        defeat: 'You passed. With flying colours.',
        after: 'Surf across the river. The ladder up to the exit is on the other side.' },
      { id: 'owen', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Owen', x: 20, y: 6, dir: 'down', sight: 3, team: [['kecleon', 42], ['graveler', 42], ['wailord', 43]],
        before: 'You crossed the river? Impressive. But can you get past me?',
        defeat: 'Washed away...',
        after: 'The ladder up leads to the last stretch of Victory Road.' }
    ],
    items: [{ x: 3, y: 20, item: 'ultra-ball', flag: 'hvroad-ultraball' }],
    encounters: { walk: '@hoenn-victory-road-b1f', water: '@hoenn-victory-road-b2f' }
  }, ROAD));

  // ---------------- The Pokémon League ----------------
  G.Maps.def(Object.assign({
    id: 'hoenn-league', palette: 'center', music: 'center',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWW',
      'p+h++++^++b+++P',
      'p======+======p',
      '+++++++++++++++',
      '+++++++++++++++',
      't+++++++++++++t',
      't+++++++++++++t',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 9, to: 'ever-grande', spot: 'league-door' }, { x: 7, y: 2, to: 'sidney-room', spot: 'door' }],
    spots: { door: [7, 9, 'up'], heal: [3, 4, 'up'], guard: [7, 4, 'up'] },
    signs: { '10,2': 'A shelf of records: the names of every Champion of Hoenn\'s Pokémon League.' },
    npcs: [
      { id: 'nurse', who: 'nurse', x: 3, y: 2, dir: 'down', script: [
        ['say', 'Welcome to the Pokémon League! We take care of the Pokémon of every Trainer who comes this far.'],
        ['choice', 'Shall I take care of your Pokémon for a moment?', [
          ['say', 'Leave them with me. This will only take a moment.'],
          ['healAnim'], ['heal'], ['lastHeal', 'heal'],
          ['say', 'All done! Your Pokémon are full of energy again.'],
          ['say', 'Good luck against the Elite Four!']
        ], [
          ['say', 'Good luck against the Elite Four!']
        ]]
      ] },
      { id: 'clerk', who: 'clerk', x: 11, y: 2, dir: 'down', script: [
        ['say', 'The last shop before the Elite Four. Stock up well!'],
        ['shop', ['ultra-ball', 'great-ball', 'full-restore', 'max-potion', 'hyper-potion', 'revive', 'full-heal', 'max-repel']]
      ] },
      { id: 'guard', who: 'officer', x: 7, y: 3, dir: 'down', script: 'hleague.guard' },
      { id: 'trainer', who: 'cooltrainer', x: 12, y: 6, move: 'look',
        say: 'Hoenn\'s Elite Four use Dark, Ghost, Ice and Dragon Pokémon. And the Champion? Nobody ever says.' }
    ]
  }, LEAGUE));

  // The rooms: the same hall as Kanto's and Johto's, in their own colours, the member at the far end.
  const ROOM = [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'jjj++^++jjj',
    '+++++++++++',
    '+++++++++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    'WWWWWWWWWWW'
  ];
  const room = (id, palette, next, flag, o) => G.Maps.def(Object.assign({}, LEAGUE, {
    id, palette, rows: ROOM,
    warps: [{ x: 5, y: 2, to: next, spot: 'door', if: flag, locked: 'league.door-shut' }],
    spots: { door: [5, 10, 'up'] }
  }, o));
  const member = (id, who, name, team, lines) => Object.assign({
    id, who, cls: 'elite-four', name, x: 5, y: 4, dir: 'down', sight: 5, leader: true, ai: 'leader', music: 'league',
    team, win: 'hleague.' + id + '-win'
  }, lines);
  /** The member's team, and the one ten levels up once you are Hoenn's Champion. */
  const members = (id, who, name, team, lines, again) => [
    Object.assign(member(id, who, name, team, lines), { if: '!hoenn-champion' }),
    Object.assign(member(id + '2', who, name, team.map(([sp, lvl, moves]) => [sp, lvl + 10, moves]), Object.assign({}, lines, again)),
      { if: 'hoenn-champion', win: 'hleague.' + id + '-win' })
  ];

  room('sidney-room', 'hideout', 'phoebe-room', 'he4-sidney', {
    enter: 'hleague.start',
    trainers: members('sidney', 'sidney', 'Sidney', [
      ['mightyena', 43, ['roar', 'double-edge', 'sand-attack', 'crunch']],
      ['shiftry', 45, ['fake-out', 'extrasensory', 'double-team', 'swagger']],
      ['cacturne', 43, ['leech-seed', 'feint-attack', 'needle-arm', 'cotton-spore']],
      ['crawdaunt', 45, ['surf', 'swords-dance', 'strength', 'facade']],
      ['absol', 46, ['aerial-ace', 'rock-slide', 'swords-dance', 'slash']]], {
      before: 'Sidney of the Elite Four, at your service. You have got a fire in your eyes. Good! Let us have a battle nobody here will ever forget!',
      defeat: 'Well, look at that. You beat me fair and square.',
      afterScript: [['say', 'Go on. Phoebe is next, and she has a few spooky friends waiting for you.', { name: 'Sidney' }]]
    }, { before: 'Back again, Champion? My Dark Pokémon have been itching for a rematch!' })
  });
  room('phoebe-room', 'ghost', 'glacia-room', 'he4-phoebe', {
    trainers: members('phoebe', 'phoebe', 'Phoebe', [
      ['dusclops', 45, ['shadow-punch', 'confuse-ray', 'curse', 'protect']],
      ['banette', 46, ['shadow-ball', 'grudge', 'will-o-wisp', 'feint-attack']],
      ['sableye', 47, ['shadow-ball', 'double-team', 'night-shade', 'feint-attack']],
      ['banette', 46, ['shadow-ball', 'psychic', 'thunderbolt', 'facade']],
      ['dusclops', 48, ['shadow-ball', 'ice-beam', 'rock-slide', 'earthquake']]], {
      before: 'I am Phoebe of the Elite Four. I trained on Mt. Pyre, where the spirits rest, and my Ghost Pokémon and I share a bond deeper than words. Can you feel it?',
      defeat: 'Oh... I lost. The bond between you and your Pokémon is strong too.',
      afterScript: [['say', 'Glacia waits in the next room. Wrap up warm!', { name: 'Phoebe' }]]
    }, { before: 'Welcome back, Champion. My Ghost Pokémon remember you well...' })
  });
  room('glacia-room', 'ice', 'drake-room', 'he4-glacia', {
    trainers: members('glacia', 'glacia', 'Glacia', [
      ['sealeo', 47, ['encore', 'body-slam', 'hail', 'ice-ball']],
      ['glalie', 47, ['light-screen', 'crunch', 'icy-wind', 'ice-beam']],
      ['sealeo', 49, ['attract', 'double-edge', 'hail', 'blizzard']],
      ['glalie', 49, ['shadow-ball', 'icy-wind', 'explosion', 'hail']],
      ['walrein', 50, ['surf', 'body-slam', 'ice-beam', 'rest']]], {
      before: 'I am Glacia of the Elite Four. I came to Hoenn looking for a Trainer whose fire could melt my ice. So far, none has. Will you be the first?',
      defeat: 'Such passion... Your fire melted my ice after all.',
      afterScript: [['say', 'The last of the Elite Four is Drake. He sailed the seas for many years. Be ready.', { name: 'Glacia' }]]
    }, { before: 'Champion. Has your fire grown hotter? My ice has only grown colder.' })
  });
  room('drake-room', 'dragon', 'wallace-room', 'he4-drake', {
    trainers: members('drake', 'drake', 'Drake', [
      ['shelgon', 49, ['rock-tomb', 'dragon-claw', 'protect', 'double-edge']],
      ['altaria', 51, ['double-edge', 'dragon-dance', 'earthquake', 'aerial-ace']],
      ['kingdra', 50, ['smokescreen', 'double-team', 'body-slam', 'dragon-breath']],
      ['flygon', 50, ['flamethrower', 'crunch', 'dragon-breath', 'earthquake']],
      ['salamence', 52, ['flamethrower', 'dragon-claw', 'rock-slide', 'crunch']]], {
      before: 'I am Drake, the last of the Elite Four. To command Dragons, a Trainer needs a heart that is both strong and kind. Do you have one? Show me!',
      defeat: 'Superb! You have earned the right to face the Champion.',
      afterScript: [['say', 'Go on. The Champion is waiting beyond that door.', { name: 'Drake' }]]
    }, { before: 'So, the Champion returns. My Dragons have grown fiercer. Show me your heart once again!' })
  });
  room('wallace-room', 'pool', 'hoenn-fame', 'he4-champion', {
    npcs: [{ id: 'wallace', who: 'wallace', x: 5, y: 4, dir: 'down', if: '!he4-champion' }],
    triggers: [{ x: 0, y: 8, w: 11, h: 1, if: '!he4-champion', script: 'hleague.champion' }]
  });

  G.Maps.def(Object.assign({}, LEAGUE, {
    id: 'hoenn-fame', palette: 'champion', music: 'center',
    rows: [
      'WWWWWWWWWWW',
      'WWWWWWWWWWW',
      'jj+++j+++jj',
      '+++++++++++',
      '+++++++++++',
      '++++rrr++++',
      '++++rrr++++',
      '++++rrr++++',
      'WWWWWWWWWWW'
    ],
    spots: { door: [5, 7, 'up'] },
    signs: { '5,2': 'The Hall of Fame. Hoenn\'s Champions and their Pokémon are remembered here forever.' },
    npcs: [{ id: 'wallace', who: 'wallace', x: 5, y: 7, dir: 'up', if: 'scripted' }]
  }));

  /** Wallace's team as Hoenn's Champion: Emerald's six levels lower (exported for the balance test); ten levels up in the rematches. */
  const wallaceTeam = again => {
    const up = again ? 10 : 0;
    return [['wailord', 51 + up, ['rain-dance', 'water-spout', 'double-edge', 'blizzard']],
      ['tentacruel', 49 + up, ['toxic', 'hydro-pump', 'sludge-bomb', 'ice-beam']],
      ['ludicolo', 50 + up, ['giga-drain', 'surf', 'leech-seed', 'double-team']],
      ['whiscash', 50 + up, ['earthquake', 'surf', 'amnesia', 'hyper-beam']],
      ['gyarados', 50 + up, ['dragon-dance', 'earthquake', 'hyper-beam', 'surf']],
      ['milotic', 52 + up, ['recover', 'surf', 'ice-beam', 'toxic']]];
  };
  /** Wally's team on Victory Road: Emerald's three levels lower (exported for the balance test). */
  const WALLY_TEAM = [['altaria', 41, ['aerial-ace', 'safeguard', 'dragon-breath', 'dragon-dance']],
    ['delcatty', 40, ['sing', 'assist', 'charm', 'feint-attack']],
    ['roselia', 41, ['magical-leaf', 'leech-seed', 'giga-drain', 'toxic']],
    ['magneton', 38, ['supersonic', 'thunderbolt', 'tri-attack', 'screech']],
    ['gardevoir', 42, ['double-team', 'calm-mind', 'psychic', 'future-sight']]];
  G.HoennLeague = { wallaceTeam, WALLY_TEAM };
  const RUN = [['sidney-room', 'sidney'], ['phoebe-room', 'phoebe'], ['glacia-room', 'glacia'], ['drake-room', 'drake']];

  /** A new run through Hoenn's Elite Four: everybody battles again. */
  function start() {
    const F = G.Field;
    for (const [m, id] of RUN) { F.clearFlag('he4-' + id); delete F.save.done[m + ':' + id]; delete F.save.done[m + ':' + id + '2']; }
    F.clearFlag('he4-champion');
  }

  /** Wally, at the end of Victory Road. */
  async function wally(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('wally-vroad')) {
      h.face('wally', 'player');
      await h.say(T('Go on, {player}. I will keep training here. Someday I will make it to the Champion too!'), WALLY);
      return;
    }
    h.emote('wally', '!');
    if (me) await h.walkTo('wally', me.x - 1, me.y);
    h.face('wally', 'player'); h.face('player', 'wally');
    await h.say(T('{player}! I knew I would catch up with you here.'), WALLY);
    await h.say(T('Since our battle in Mauville, I have trained every single day. My body is stronger now, and so are my Pokémon. We came through all of Victory Road!'), WALLY);
    await h.say(T('Before you challenge the League, I want to know how far I have come. {player}, please battle me!'), WALLY);
    const out = await h.battle({ id: 'wally-vroad', who: 'wally', name: 'Wally', prize: 60, ai: 'leader', team: WALLY_TEAM }, {});
    if (out === 'lose') return;
    F.setFlag('wally-vroad');
    await h.say(T('...I lost. But I am not sad. I can see now how strong you really are.'), WALLY);
    await h.say(T('Go on, {player}. The League is right outside. I will cheer for you!'), WALLY);
  }

  /** The Champion: Wallace, then the Hall of Fame. */
  async function champion(h) {
    const F = G.Field, me = G.World.player;
    h.face('player', 'up');
    if (F.flag('hoenn-champion')) { await rematch(h); return; }
    await h.say(T('Welcome, {player}. I have been waiting for you since that day in Sootopolis.'), WALLACE);
    await h.say(T('I am Wallace, the Champion of the Hoenn region. The bond you share with your Pokémon was enough to calm the sky itself. Now let me see it with my own eyes, here at the summit!'), WALLACE);
    if (me) await h.walkTo('wallace', me.x, me.y - 1);
    h.face('wallace', 'player'); h.face('player', 'wallace');
    const out = await h.battle({ id: 'wallace-champion', who: 'wallace', cls: 'champion', name: 'Wallace', leader: true, ai: 'leader', music: 'league',
      team: wallaceTeam(false) }, {});
    if (out === 'lose') return;
    F.setFlag('he4-champion');
    await h.say(T('...It is over. You and your Pokémon are truly beautiful together. From today, you are Hoenn\'s Champion.'), WALLACE);
    await h.say(T('Come with me. The Hall of Fame is waiting to remember you and your team.'), WALLACE);
    await h.warp('hoenn-fame', 'door');
    await hallOfFame(h);
  }

  /** Once you are Hoenn's Champion: Wallace with his team ten levels up; a win, the Hall of Fame again. */
  async function rematch(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    await h.say(T('Back again, Champion? My Pokémon have grown even more graceful. Let us dance once more!'), WALLACE);
    if (me) await h.walkTo('wallace', me.x, me.y - 1);
    h.face('wallace', 'player'); h.face('player', 'wallace');
    const out = await h.battle({ id: 'wallace-champion2', who: 'wallace', cls: 'champion', name: 'Wallace', leader: true, ai: 'leader', music: 'league',
      team: wallaceTeam(true) }, {});
    if (out === 'lose') return;
    F.setFlag('he4-champion');
    await h.say(T('Still the Champion, and still beautiful. I will be waiting for the next time.'), WALLACE);
    await h.warp('hoenn-fame', 'door');
    await h.move('player', ['up', 'up', 'up']);
    S.fame.push({ at: Date.now(), party: S.party.map(m => ({ sp: m.sp, lvl: m.lvl, nick: m.nick || null, shiny: !!m.shiny })) });
    await h.jingle('fame');
    await h.say(T("{player}'s team has entered the Hall of Fame!"));
    await h.warp('birch-house-2f', 'stairs');
  }

  /** Hoenn's Hall of Fame: the team is remembered, then home to Littleroot and the credits. */
  async function hallOfFame(h) {
    const F = G.Field, S = F.save;
    h.place('wallace', 5, 7, 'up');
    h.show('wallace');
    await h.move('player', ['up', 'up', 'up']);
    await h.move('wallace', ['up', 'up', 'up']);
    h.face('wallace', 'player'); h.face('player', 'wallace');
    await h.say(T('The names of Hoenn\'s Champions and their Pokémon are kept here forever. Today, yours join them.'), WALLACE);
    S.fame = S.fame || [];
    S.fame.push({ at: Date.now(), party: S.party.map(m => ({ sp: m.sp, lvl: m.lvl, nick: m.nick || null, shiny: !!m.shiny })) });
    F.setFlag('hoenn-champion');
    h.face('player', 'up');
    await h.jingle('fame');
    await h.say(T("{player}'s team has entered the Hall of Fame!"));
    h.face('player', 'wallace');
    await h.say(T('The land, the sea and the sky of Hoenn are at peace, thanks to you. Go home and rest, Champion. You have earned it.'), WALLACE);
    h.hide('wallace');
    await h.warp('birch-house-2f', 'stairs');
    if (G.CreditsUI) await G.CreditsUI.ending(39);
    else F.setFlag('chapter-39-done');
  }

  G.Script.def({
    'hleague.start': [['js', start]],
    'hleague.guard': [
      ['say', 'Beyond this door are the Elite Four of Hoenn. You battle all four in a row, and then the Champion.'],
      ['say', 'Once you go in, there is no coming back until you win or lose.'],
      ['choice', 'Are you ready?', [['say', 'Then go, and good luck!'], ['warp', 'sidney-room', 'door']], [['say', 'Take your time. Heal up and get ready.']]]
    ],
    'hleague.champion': [['js', champion]],
    'hleague.sidney-win': [['setFlag', 'he4-sidney'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'hleague.phoebe-win': [['setFlag', 'he4-phoebe'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'hleague.glacia-win': [['setFlag', 'he4-glacia'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'hleague.drake-win': [['setFlag', 'he4-drake'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'vroad.wally': [['js', wally]],
    'evergrande.road-shut': [['say', 'A guard blocks the mouth of the cave: "Only Trainers with all eight of Hoenn\'s badges may enter Victory Road."']]
  });
})();
