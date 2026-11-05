/* ============ sunyshore.js — Route 222, Sunyshore City, Vista Lighthouse and Volkner's Gym ============
 * Chapter 57. Professor Rowan hears the story (sandgem.js, flag rowan-report) and the guards at the east end of Valor Lakefront
 * (lakefront.js) step aside. Route 222 runs along the coast to Sunyshore City, where Flint of the Elite Four stops you at the
 * gate (flag flint-met): Volkner has lost interest in battles and sits at the top of Vista Lighthouse. Talking to him there
 * (flag volkner-met) opens the Gym. Platinum's Gym turns its walkways with switches; here nine rooms are joined by gates (`bars`) and
 * five plates (`o`) flip the flags sun-red, sun-blue and sun-yellow, which open some gates and shut others. Every move can be undone,
 * so nobody gets shut in (the map generator solves it: 16 moves, 5 presses, through all nine rooms). Volkner's Beacon Badge is
 * badge 32, the last in Sinnoh: every Pokémon obeys. Jasmine waits on the beach to the north (flag jasmine-beach), then `ending(57)`.
 * Platinum's Trainers, teams and wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const VOLKNER = { name: 'Volkner' }, FLINT = { name: 'Elite Four Flint' }, JASMINE = { name: 'Jasmine' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const LIGHT = { loc: 'sunyshore-city', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor', region: 'sinnoh' };

  // ---------------- Route 222 ----------------
  G.Maps.def(Object.assign({
    id: 'route222', loc: 'sinnoh-route-222', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTT......................................TTT..............TTTTT',
      'TTTT....""""""""""............""""""""""".TTT."""""""""""".TTTTT',
      'TTTT....""""""""""....HHHH....""""""""""".TTT."""""""""""".....T',
      'T.......""""""""""....HHHH....""""""""""".TTT."""""""""""".....T',
      'T.......""""""""""....HDHH...."""""""""""....."""""""""""".....T',
      'T....S.................,....................................S..T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T..............................................................T',
      'T::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::T',
      'T::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::T',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { west: { map: 'valor-lakefront', offset: -5 }, east: { map: 'sunyshore', offset: -7 } },
    warps: [{ x: 23, y: 5, to: 'pikachu-club', spot: 'door' }],
    spots: { 'club-door': [23, 6, 'down'] },
    signs: {
      '5,6': 'Route 222. West: Valor Lakefront. East: Sunyshore City.',
      '60,6': 'Sunyshore City ahead. The city that runs on the light of the sun.'
    },
    trainers: [
      { id: 'brett', who: 'fisherman', cls: 'fisherman', name: 'Brett', x: 10, y: 11, dir: 'up', sight: 3, team: [['magikarp', 43], ['finneon', 42], ['feebas', 42]],
        before: 'A level 43 Magikarp! Yes, I know. I have been fishing a long time.',
        defeat: 'It splashed very well.',
        after: 'The sea here is the best in Sinnoh. Everybody who fishes says so.' },
      { id: 'alec', who: 'fisherman', cls: 'fisherman', name: 'Alec', x: 18, y: 11, dir: 'up', sight: 3, team: [['gyarados', 45]],
        before: 'One Gyarados is all a real fisherman needs!',
        defeat: 'Maybe two would be better.',
        after: 'I started with a Magikarp too. Everybody does.' },
      { id: 'george', who: 'fisherman', cls: 'fisherman', name: 'George', x: 30, y: 11, dir: 'up', sight: 3, team: [['magikarp', 41], ['finneon', 41], ['remoraid', 41], ['gyarados', 42]],
        before: 'Everything I caught today is in this battle!',
        defeat: 'Now I have to catch them all again.',
        after: 'The fish do not care who wins.' },
      { id: 'cole', who: 'fisherman', cls: 'fisherman', name: 'Cole', x: 50, y: 11, dir: 'up', sight: 3, team: [['gyarados', 43], ['remoraid', 40], ['gyarados', 43]],
        before: 'You scared off a bite! You will pay for that!',
        defeat: 'I think I scared it off myself.',
        after: 'Patience is the whole of fishing. I am working on it.' },
      { id: 'nicola', who: 'beauty', cls: 'beauty', name: 'Nicola', x: 14, y: 6, dir: 'down', sight: 2, team: [['lopunny', 45]],
        before: 'My Lopunny and I walk this road every day to stay beautiful.',
        defeat: 'At least we still look good.',
        after: 'The sea air does wonders for fur.' },
      { id: 'trey', who: 'gentleman', cls: 'rich-boy', name: 'Trey', x: 27, y: 6, dir: 'down', sight: 2, team: [['luxray', 45]], items: { 'full-restore': 1 },
        before: 'My Luxray cost more than your whole team, I expect. Shall we see?',
        defeat: 'I shall have to buy a better one.',
        after: 'Money cannot buy everything, Father says. He says it from his yacht.' },
      { id: 'luther', who: 'sailor', cls: 'sailor', name: 'Luther', x: 36, y: 9, dir: 'up', sight: 1, team: [['wingull', 41], ['machoke', 42], ['gastrodon', 43]],
        before: 'I just came ashore, and I have not had a good fight in weeks!',
        defeat: 'That was worth the wait.',
        after: 'Ships from Sunyshore sail all over the world.' },
      { id: 'thomas', who: 'officer', cls: 'policeman', name: 'Thomas', x: 44, y: 6, dir: 'down', sight: 2, team: [['noctowl', 43], ['machoke', 43]],
        before: 'This road was closed until today. Let me check that you are up to it.',
        defeat: 'You may pass. Drive safely. Or walk safely.',
        after: 'I heard a rumor that a great detective passed through here. Nobody saw him.' },
      { id: 'marc', who: 'sailor', cls: 'sailor', name: 'Marc', x: 54, y: 9, dir: 'up', sight: 1, team: [['mantyke', 45]],
        before: 'My Mantyke rode on my ship all the way from the far side of the sea!',
        defeat: 'It is still only little.',
        after: 'It will be a Mantine one day, when there is a Remoraid around.' },
      { id: 'conner', who: 'youngster', cls: 'tuber', name: 'Conner', x: 24, y: 13, dir: 'up', sight: 2, swim: true, team: [['remoraid', 44]],
        before: 'I can swim as far as this ring lets me!',
        defeat: 'The ring is losing air.',
        after: 'Do not tell my mum I came out this far.' },
      { id: 'holly', who: 'lass', cls: 'tuber-f', name: 'Holly', x: 40, y: 13, dir: 'up', sight: 2, swim: true, team: [['remoraid', 44]],
        before: 'My Remoraid squirts better than anybody\'s!',
        defeat: 'It got water in my eyes.',
        after: 'I am going to swim to Sunyshore. One day.' }
    ],
    items: [
      { x: 4, y: 4, item: 'tm56', flag: 'route222-tm56' },
      { x: 61, y: 4, item: 'full-restore', flag: 'route222-full-restore' },
      { x: 43, y: 5, item: 'carbos', flag: 'route222-carbos' },
      { x: 20, y: 11, item: 'pearl', flag: 'route222-pearl', hidden: true },
      { x: 46, y: 10, item: 'ultra-ball', flag: 'route222-ultra-ball', hidden: true },
      { x: 27, y: 2, item: 'tiny-mushroom', flag: 'route222-tiny-mushroom', hidden: true },
      { x: 58, y: 3, item: 'big-mushroom', flag: 'route222-big-mushroom', hidden: true },
      { x: 6, y: 10, item: 'pp-up', flag: 'route222-pp-up', hidden: true }
    ],
    encounters: { walk: '@sinnoh-route-222-area', water: '@sinnoh-route-222-area' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'pikachu-club', loc: 'sinnoh-route-222', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'route222', spot: 'club-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'chairman', who: 'gentleman', x: 8, y: 3, dir: 'left', move: 'look', say: 'Welcome to the Pikachu Fan Club! We meet every day, and we talk about Pikachu. That is the whole club.' }],
    trainers: [
      { id: 'janet', who: 'lass', cls: 'poke-kid', name: 'Janet', x: 2, y: 5, dir: 'right', sight: 2, team: [['pikachu', 42], ['pikachu', 42]],
        before: 'One Pikachu is cute. Two Pikachu is twice as cute!',
        defeat: 'They are still cute.',
        after: 'Do you like Pikachu? You have to say yes in here.' }
    ]
  }, SINNOH));

  // ---------------- Sunyshore City ----------------
  G.Maps.def(Object.assign({
    id: 'sunyshore', loc: 'sunyshore-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      'T::::::::::::::::::::::::::::::::::::~~~~~~~',
      'T::::::::::::::::::::::::::::::::::::~~~~~~~',
      'T...................,................~~~~~~~',
      'T...................,................~~~~~~~',
      'T...................,................~~~~~~~',
      'T...................,.....GGGGGG.....~~~~~~~',
      'T...................,.....GGGGGG.....~~~~~~~',
      'T.....CCCCC.........,.....GGGGGG.....~~~~~~~',
      'T.....CCCCC..MMMM...,.....GGGGGG.....~~~~~~~',
      'T.....CCCCC..MMMM...,.....GGDGGG.....~~~~~~~',
      'T.....CCDCC..MDMM...,.......,........~~~~~~~',
      'T...S...,.....,....S,....S..,........~~~~~~~',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..~~~~~~~',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..~~~~~~~',
      'T...................,.............,..~~~~~~~',
      'T...................,.............,..~~~~~~~',
      'T.....BBBBBB........,.............,..~~~~~~~',
      'T.....BBBBBB..HHHH..,......KKKKK..,..~~~~~~~',
      'T.....BBBBBB..HHHH..,......KKKKK..,..~~~~~~~',
      'T.....BBDBBB..HDHH..,......KKKKK..,..~~~~~~~',
      'T.......,......,....,......KKKKK..,..~~~~~~~',
      'T.......,,,,,,,,,,,,,......KKDKK..,..~~~~~~~',
      'T...................,........,,,,S,..~~~~~~~',
      'T::::::::::::::::::::::::::::::::::::~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { west: { map: 'route222', offset: 7 }, north: { map: 'route223', offset: 10 } },
    warps: [
      { x: 8, y: 12, to: 'sunyshore-center', spot: 'door' },
      { x: 14, y: 12, to: 'sunyshore-mart', spot: 'door' },
      { x: 28, y: 11, to: 'sunyshore-gym', spot: 'door', if: 'volkner-met', locked: 'sunyshore.gym-locked' },
      { x: 8, y: 21, to: 'sunyshore-market', spot: 'door' },
      { x: 15, y: 21, to: 'sunyshore-house', spot: 'door' },
      { x: 29, y: 23, to: 'vista-lighthouse', spot: 'door' }
    ],
    spots: { 'center-door': [8, 13, 'down'], 'mart-door': [14, 13, 'down'], 'gym-door': [28, 12, 'down'],
             'market-door': [8, 22, 'down'], 'house-door': [15, 22, 'down'], 'light-door': [29, 24, 'down'] },
    signs: {
      '4,13': 'Sunyshore City. The city that runs on the light of the sun.',
      '19,13': 'Sunyshore Market, to the south. The beach is to the north.',
      '25,13': 'Sunyshore City Pokémon Gym. Leader: Volkner. The shining star that lights the way.',
      '33,24': 'Vista Lighthouse. On a clear day you can see the Pokémon League from the top.'
    },
    triggers: [
      { x: 3, y: 14, w: 1, h: 2, if: '!flint-met', script: 'sunyshore.flint' },
      { x: 1, y: 3, w: 36, h: 1, if: ['badge:32', '!jasmine-beach'], script: 'sunyshore.jasmine' }
    ],
    npcs: [
      { id: 'flint', who: 'flint', x: 6, y: 14, dir: 'left', if: '!flint-met', script: 'sunyshore.flint' },
      { id: 'jasmine', who: 'jasmine', x: 20, y: 2, dir: 'down', if: ['badge:32', '!jasmine-beach'], script: 'sunyshore.jasmine' },
      { id: 'girl', who: 'lass', x: 12, y: 16, move: 'wander', r: 2, say: 'Our streets and rooftops are covered in solar panels. The whole city runs on sunshine.' },
      { id: 'man', who: 'gentleman', x: 24, y: 18, move: 'look', say: 'Volkner used to battle everybody who came. These days the lighthouse sees more of him than the Gym.' },
      { id: 'sailor', who: 'sailor', x: 35, y: 2, dir: 'right', move: 'look', say: 'Past this water lies Route 223, and at the end of it the Pokémon League. It is a long way, and the current is strong.' }
    ],
    items: [{ x: 33, y: 21, item: 'thunder-stone', flag: 'sunyshore-thunder-stone' }, { x: 3, y: 23, item: 'carbos', flag: 'sunyshore-carbos', hidden: true }],
    encounters: { water: '@sunyshore-city-area' }
  }, SINNOH));

  G.Maps.center('sunyshore-center', {
    loc: 'sunyshore-city', exit: { map: 'sunyshore', spot: 'center-door' },
    npcs: [{ id: 'boy', who: 'youngster', x: 3, y: 5, move: 'look', say: 'Volkner\'s Gym is the last one in Sinnoh. If you can beat him, the League is the only thing left.' }]
  }).region = 'sinnoh';

  G.Maps.mart('sunyshore-mart', {
    loc: 'sunyshore-city', exit: { map: 'sunyshore', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'max-potion', 'revive', 'antidote', 'paralyze-heal', 'awakening',
            'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel', 'max-repel'],
    npcs: [{ id: 'shopper', who: 'beauty', x: 6, y: 5, move: 'look', say: 'Paralyze Heal sells very well here. I wonder why.' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'sunyshore-market', loc: 'sunyshore-market', tileset: 'indoor', palette: 'mart', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'sunyshore', spot: 'market-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'clerk', who: 'beauty', x: 7, y: 3, dir: 'down', move: 'look', say: 'Welcome to the Sunyshore Market! The stalls are shut today. Everybody has gone to look at the sea.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'sunyshore-house', loc: 'sunyshore-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'sunyshore', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'gran', who: 'granny', x: 8, y: 3, dir: 'left', move: 'look', say: 'When I was young, you could see every star from here. Then we lit up the city, and now the stars are in the streets.' }]
  }, SINNOH));

  // ---------------- Vista Lighthouse ----------------
  G.Maps.def(Object.assign({}, LIGHT, {
    id: 'vista-lighthouse',
    rows: ['WWWWWWWWWWW', 'WWWWWeWWWWW', '+++++++++++', '+++++++++++', '+++++++++++', '+++++++++++', '+++++++++++', '+++++X+++++'],
    warps: [{ x: 5, y: 7, to: 'sunyshore', spot: 'light-door' }, { x: 5, y: 1, to: 'vista-lighthouse-top', spot: 'lift' }],
    spots: { door: [5, 7, 'up'], lift: [5, 2, 'down'] },
    npcs: [{ id: 'keeper', who: 'sailor', x: 8, y: 4, dir: 'left', move: 'look', say: 'The lift goes to the top. Volkner is up there. He comes here to look at the sea and say nothing.' }]
  }));

  G.Maps.def(Object.assign({}, LIGHT, {
    id: 'vista-lighthouse-top',
    rows: ['WWWWWWWWWWW', 'WWWWWeWWWWW', '+P+++++++P+', '+++++++++++', '+++++++++++', '+++++++++++', '+++++++++++', '+++++++++++'],
    warps: [{ x: 5, y: 1, to: 'vista-lighthouse', spot: 'lift' }],
    spots: { lift: [5, 2, 'down'] },
    signs: { '1,2': 'Through the viewer you can just see the Pokémon League, far across the sea.', '9,2': 'Through the viewer you can see the whole of Sunyshore City shining in the sun.' },
    npcs: [{ id: 'volkner', who: 'volkner', x: 5, y: 5, dir: 'down', if: '!volkner-met', script: 'sunyshore.volkner-top' }]
  }));

  // ---------------- Sunyshore Gym ----------------
  G.Maps.def(Object.assign({
    id: 'sunyshore-gym', loc: 'sunyshore-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWW',
      'W+++++++++++++++++W',
      'W+++++++++++++++++W',
      'W+++++++++++++++++W',
      'WWWWWWWWWyWWWWWWWWW',
      'W+++++W+++++W+++++W',
      'W++o++y+++++y++o++W',
      'W+++++W+++++W+++++W',
      'WWWyWWWWWyWWWWWyWWW',
      'W+++++W+++++W+++++W',
      'W+++++y++o++y+++++W',
      'W+++++W+++++W+++++W',
      'WWWyWWWWWyWWWWWyWWW',
      'W+++++W+++++W+++++W',
      'W++o++y+++++y++o++W',
      'W+++++W+++++W+++++W',
      'WWWWWWWWW+WWWWWWWWW',
      'WWWWWWWWWXWWWWWWWWW'
    ],
    warps: [{ x: 9, y: 18, to: 'sunyshore', spot: 'gym-door' }],
    spots: { door: [9, 18, 'up'] },
    bars: [
      { x: 6, y: 15, if: '!sun-blue' },
      { x: 12, y: 15, if: 'sun-blue' },
      { x: 3, y: 13, if: 'sun-blue' },
      { x: 9, y: 13, if: 'sun-blue' },
      { x: 15, y: 13, if: '!sun-yellow' },
      { x: 6, y: 11, if: 'sun-red' },
      { x: 12, y: 11, if: 'sun-yellow' },
      { x: 3, y: 9, if: '!sun-red' },
      { x: 9, y: 9, if: '!sun-blue' },
      { x: 15, y: 9, if: 'sun-red' },
      { x: 6, y: 7, if: '!sun-yellow' },
      { x: 12, y: 7, if: 'sun-yellow' },
      { x: 9, y: 5, if: ['sun-yellow', 'sun-blue'] }
    ],
    triggers: [
      { x: 3, y: 15, w: 1, h: 1, script: 'sunyshore.blue' },
      { x: 15, y: 15, w: 1, h: 1, script: 'sunyshore.red' },
      { x: 9, y: 11, w: 1, h: 1, script: 'sunyshore.blue' },
      { x: 3, y: 7, w: 1, h: 1, script: 'sunyshore.blue' },
      { x: 15, y: 7, w: 1, h: 1, script: 'sunyshore.yellow' }
    ],
    npcs: [{ id: 'guide', who: 'guide', x: 7, y: 16, dir: 'right', script: 'sunyshore.gym-guide' }],
    trainers: [
      { id: 'tiera', who: 'lass', cls: 'school-kid-f', name: 'Tiera', x: 11, y: 14, dir: 'left', sight: 3, team: [['pachirisu', 47]], items: { 'hyper-potion': 1 },
        before: 'I read all about Electric types, and now I will show you!',
        defeat: 'That was not in the book.',
        after: 'The plates on the floor open some gates and shut others. Keep trying!' },
      { id: 'forrest', who: 'youngster', cls: 'school-kid', name: 'Forrest', x: 1, y: 16, dir: 'right', sight: 3, team: [['magneton', 47]],
        before: 'Three Magnemite are stronger than one. That is simple mathematics!',
        defeat: 'I forgot to carry the one.',
        after: 'A gate that is open now may be shut when you come back.' },
      { id: 'jerry', who: 'rocker', cls: 'guitarist', name: 'Jerry', x: 17, y: 16, dir: 'left', sight: 3, team: [['magnemite', 44], ['luxio', 44], ['luxio', 44]],
        before: 'This next one is called "Shock to the System"!',
        defeat: 'My amp blew.',
        after: 'Volkner played guitar with us once. He was bored by the second song.' },
      { id: 'meghan', who: 'lass', cls: 'poke-kid', name: 'Meghan', x: 1, y: 10, dir: 'right', sight: 3, team: [['pikachu', 42], ['pikachu', 42], ['pikachu', 42], ['pikachu', 42]],
        before: 'I have four Pikachu, and they are all my favorite!',
        defeat: 'They all did their best.',
        after: 'I named them all Pikachu. It is easier.' },
      { id: 'lonnie', who: 'rocker', cls: 'guitarist', name: 'Lonnie', x: 11, y: 12, dir: 'left', sight: 3, team: [['raichu', 47]],
        before: 'One Raichu, one chord, and that is all I need!',
        defeat: 'That was the wrong chord.',
        after: 'The lights in here are powered by the Leader\'s Pokémon. That is what he tells us.' },
      { id: 'preston', who: 'rocker', cls: 'guitarist', name: 'Preston', x: 17, y: 10, dir: 'left', sight: 3, team: [['luxio', 45], ['luxio', 45]],
        before: 'Two Luxio, in perfect harmony!',
        defeat: 'We fell out of tune.',
        after: 'Volkner has been smiling since he came back. It is a little frightening.' },
      { id: 'destiny', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Destiny', x: 1, y: 6, dir: 'right', sight: 3, team: [['electabuzz', 47], ['raichu', 48]],
        before: 'You have come a long way through these gates. It ends here.',
        defeat: 'I see why Volkner came back.',
        after: 'The Leader is behind the last gate. You will need the right plates down to open it.' },
      { id: 'zachery', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Zachery', x: 17, y: 6, dir: 'left', sight: 3, team: [['electabuzz', 47], ['magneton', 48]],
        before: 'Nobody has reached this room in a long time. Let me welcome you.',
        defeat: 'You are the real thing.',
        after: 'He will give you the battle he has been waiting for. Be ready for that.' },
      { id: 'volkner', who: 'volkner', cls: 'leader', name: 'Volkner', x: 9, y: 3, dir: 'down', sight: 0, leader: true,
        team: [['jolteon', 44, ['thunder-wave', 'charge-beam', 'iron-tail', 'quick-attack']],
               ['raichu', 44, ['charge-beam', 'focus-blast', 'signal-beam', 'quick-attack']],
               ['luxray', 46, ['ice-fang', 'thunder-fang', 'crunch', 'fire-fang']],
               ['electivire', 48, ['thunder-punch', 'fire-punch', 'quick-attack', 'giga-impact'], 'sitrus-berry']],
        items: { 'super-potion': 1 },
        before: 'So you made it through. I built those gates because nobody was giving me a fight. Now show me that spark.',
        defeat: 'There it is. That is the spark I was missing!',
        win: 'sunyshore.volkner-win',
        afterScript: [['say', 'I had forgotten how good this feels. Thank you. Now go on, somebody on the beach was asking for you.', VOLKNER]] }
    ]
  }, SINNOH));

  /** At the gate of the city: Flint of the Elite Four. */
  async function flint(h) {
    const F = G.Field;
    if (F.flag('flint-met')) return;
    await h.say(T('Hey, you there! You look like you have been through something. Are you here for the Gym?'), FLINT);
    await h.say(T('I am Flint, one of the Elite Four. Volkner is my friend, so let me warn you: he is not at his Gym.'), FLINT);
    await h.say(T('He says nobody gives him a real battle any more, and he has stopped caring. He sits at the top of the lighthouse all day.'), FLINT);
    await h.say(T('Go up there and light a fire under him. I would do it myself, but he stopped listening to me a long time ago.'), FLINT);
    await h.fade('out', 0.3);
    h.hide('flint');
    F.setFlag('flint-met');
    await h.fade('in', 0.3);
  }

  /** The top of the lighthouse. */
  async function volknerTop(h) {
    const F = G.Field;
    await h.say(T('So Flint sent you. He does that.'), VOLKNER);
    await h.say(T('I have beaten everybody who came to my Gym, so I rebuilt it to make it harder, and then nobody came at all. I got bored of winning.'), VOLKNER);
    await h.say(T('But people say you went up against Team Galactic and came back. Your Pokémon do look like they have seen something.'), VOLKNER);
    await h.say(T('All right. If you can get through my gates, I will give you a battle. Let us see if you can make me feel anything.'), VOLKNER);
    await h.fade('out', 0.3);
    h.hide('volkner');
    F.setFlag('volkner-met');
    await h.fade('in', 0.3);
    await h.say(T('Volkner went back to his Gym.'));
  }

  /** A plate flips its colour: some gates open, others shut. */
  const flip = name => [
    ['sfx', 'click'],
    ['if', name, [['clearFlag', name]], [['setFlag', name]]]
  ];

  /** On the beach: Jasmine, and the end of the chapter. */
  async function jasmine(h) {
    const F = G.Field;
    if (F.flag('jasmine-beach')) return;
    await h.say(T('Oh... {player}. It has been a long time since Olivine City. I came to see this sea with my own eyes.'), JASMINE);
    await h.say(T('You have all eight badges of Sinnoh now? I can tell. Your Pokémon stand differently.'), JASMINE);
    if (!F.flag('got-hm07')) {
      await h.say(T('Then you will need this. There is a great waterfall on the way to the League.'), JASMINE);
      F.giveItem('hm07', 1);
      F.setFlag('got-hm07');
      await h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('hm07') } });
    } else await h.say(T('You already know the way of the Waterfall, I am sure. You will need it on the road to the League.'), JASMINE);
    await h.say(T('Route 223 starts across this water, and the Pokémon League is at the end of it. Whenever you are ready.'), JASMINE);
    await h.say(T('I will go back and watch the sea a little longer. Good luck, {player}.'), JASMINE);
    await h.fade('out', 0.3);
    h.hide('jasmine');
    F.setFlag('jasmine-beach');
    await h.fade('in', 0.3);
    // The end of the fifty-seventh chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(57); else F.setFlag('chapter-57-done');
  }

  G.Script.def({
    'sunyshore.flint': [['js', flint]],
    'sunyshore.volkner-top': [['js', volknerTop]],
    'sunyshore.jasmine': [['js', jasmine]],
    'sunyshore.gym-locked': [['say', 'The doors are shut. A note says: "Gone out. Do not wait." It is signed by Volkner.']],
    'sunyshore.red': flip('sun-red'),
    'sunyshore.blue': flip('sun-blue'),
    'sunyshore.yellow': flip('sun-yellow'),
    'sunyshore.gym-guide': [
      ['say', 'Hey there, future Champion! Volkner uses Electric Pokémon, and this is the last Gym in Sinnoh.'],
      ['say', 'Each plate on the floor opens some gates and shuts others. Plates of the same power work the same gates, so watch what changes.'],
      ['say', 'Ground moves are what you want. His Pokémon know a few surprises, so do not bring only one type!']
    ],
    'sunyshore.volkner-win': [
      ['say', 'That is the best battle I have had in years. The Beacon Badge is yours.', VOLKNER],
      ['badge', 32],
      ['jingle', 'badge'],
      ['say', '{player} received the Beacon Badge from Volkner!'],
      ['say', 'That is all eight. Every Pokémon will obey you now, wherever it comes from.', VOLKNER],
      ['say', 'And take TM57, Charge Beam. It can raise the user\'s Sp. Atk as it hits.', VOLKNER],
      ['giveItem', 'tm57', 1],
      ['say', 'Somebody on the beach to the north was asking about you. Go and see.', VOLKNER]
    ]
  });
})();
