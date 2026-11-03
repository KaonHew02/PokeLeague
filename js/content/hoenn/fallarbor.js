/* ============ fallarbor.js — Routes 111 to 114, the Fiery Path, Fallarbor Town, Meteor Falls ============
 * Chapter 32. North of Mauville City, Route 111 reaches the edge of the desert (a sandstorm: closed for
 * now) and turns west onto Route 112, at the foot of Mt. Chimney, where two Team Magma grunts keep
 * everyone off the cable car. The Fiery Path runs through the mountain to Route 113, where volcanic ash
 * falls, and Fallarbor Town: Professor Cozmo, who studies meteorites, has gone off with Team Magma.
 * Route 114 leads to Meteor Falls, where Maxie, Team Magma's leader, takes Cozmo's meteorite; Archie and
 * Team Aqua come after them, and both teams leave for Mt. Chimney (flag meteorite-stolen): the cable car
 * is free (lavaridge.js). Back home, Cozmo gives TM27 Return for his Meteorite (flag meteorite-returned).
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const MAXIE = { name: 'Maxie' }, ARCHIE = { name: 'Archie' }, COZMO = { name: 'Professor Cozmo' };
  const GRUNT = { name: 'Team Magma Grunt' }, WIFE = { name: 'Cozmo\'s Wife' }, ATTENDANT = { name: 'Attendant' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const STATION = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p+++++++++p', '+++++++++++', '++t+++++t++', '+++++++++++', '+++++X+++++'];

  // ---------------- Route 111 ----------------
  G.Maps.def(Object.assign({
    id: 'route111', loc: 'hoenn-route-111', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTT:TTTTTTTTTTTTT',
      'T::::::::::::::::::::::T',
      'T::::::::::::::::::::::T',
      'T::::::::::::::::::::::T',
      'T::::::::::::::::::::::T',
      'T.........,,S..........T',
      'T.TTTT....,,.."""""""..T',
      'T.TTTT....,,.."""""""..T',
      'T.TTTT....,,.."""""""..T',
      'T.TTTT....,,.."""""""..T',
      'T.........,,.."""""""..T',
      'T.........,,...........T',
      'T.........,,...........T',
      'T.........,,...........T',
      ',,,,,,,,,,,,...........T',
      ',,,,,,,,,,,,...........T',
      'T.........,,.....TTTT..T',
      'T.........,,.....TTTT..T',
      'T.""""""..,,.....TTTT..T',
      'T.""""""..,,.....TTTT..T',
      'T.""""""..,,...........T',
      'T.""""""..,,...........T',
      'T.""""""..,,...........T',
      'T.""""""..,,...........T',
      'T.........,,.."""""""..T',
      'T.........,,.."""""""..T',
      'T.........,,.."""""""..T',
      'T.........,,.."""""""..T',
      'T.........,,.."""""""..T',
      'T.........,,S..........T',
      'T.........,,...........T',
      'TTTTTTTTTT,,TTTTTTTTTTTT'
    ],
    connect: { south: { map: 'mauville', offset: -18 }, west: { map: 'route112', offset: 0 }, north: { map: 'route111-desert', offset: 0 } },
    signs: {
      '12,5': 'North: the desert. A sandstorm blows there day and night, so the road is closed for now.',
      '12,29': 'Route 111. South: Mauville City. West: Route 112 and Mt. Chimney.'
    },
    trainers: [
      { id: 'travis', who: 'camper', cls: 'camper', name: 'Travis', x: 12, y: 12, dir: 'left', sight: 2, team: [['sandshrew', 20], ['marill', 20]],
        before: 'I camped right by the desert last night. Sand got into everything, even my battle plans!',
        defeat: 'Buried in the sand...',
        after: 'Sandshrew loves the desert. It curls up into a ball when the sandstorm gets too strong.' },
      { id: 'irene', who: 'lass', cls: 'picnicker', name: 'Irene', x: 8, y: 25, dir: 'right', sight: 2, team: [['shroomish', 20], ['marill', 21]],
        before: 'A picnic is no fun without a battle first!',
        defeat: 'My sandwiches went flat...',
        after: 'Mt. Chimney is to the west. I would love a picnic at the top, but they say the cable car is closed.' },
      { id: 'hayden', who: 'kindler', cls: 'kindler', name: 'Hayden', x: 13, y: 20, dir: 'left', sight: 2, team: [['slugma', 21], ['numel', 21]],
        before: 'My flames burn hotter than the desert sun!',
        defeat: 'Snuffed out...',
        after: 'Fire types love the heat around Mt. Chimney. Lavaridge Town, at its foot, has the hottest Gym in Hoenn.' }
    ],
    // Chapter 41: once you are the Champion, the sandstorm calms and the hiker lets you into the desert (regis.js).
    npcs: [{ id: 'traveller', who: 'hiker', x: 10, y: 1, dir: 'up', if: '!hoenn-champion', script: 'route111.desert' },
           { id: 'traveller2', who: 'hiker', x: 12, y: 2, dir: 'left', if: 'hoenn-champion',
             say: 'The sandstorm died down when the weather went back to normal. With goggles on, you can cross the desert now.' }],
    items: [{ x: 22, y: 29, item: 'hyper-potion', flag: 'route111-hyperpotion' }, { x: 1, y: 10, item: 'great-ball', flag: 'route111-greatball' }],
    encounters: { walk: '@hoenn-route-111-area' }
  }, HOENN));

  // ---------------- Route 112, the cable car's station ----------------
  G.Maps.def(Object.assign({
    id: 'route112', loc: 'hoenn-route-112', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T##################################T',
      'T##################################T',
      'T##################################T',
      'TTTT.........BBBBBB......#######...T',
      'TTTT.."""""".BBBBBB......###O###...T',
      'TTTT.."""""".BBBBBB""""""...,,.....T',
      'TTTT.."""""".BBDBBB""""""...,,S....T',
      'TTTT..""""""...,,S.""""""...,,.....T',
      'TTTT...........,,..""""""...,,.....T',
      ',,>,,..........,,..""""""...,,.....T',
      ',,>,,..........,,...........,,.....T',
      'TTT,,..........,,...........,,.....T',
      'TTT,,..........,,...........,,...S.T',
      'TTT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'TTT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'TTT................................T',
      'TTT...""""""""......"""""""""""....T',
      'TTT...""""""""......"""""""""""....T',
      'TTT...""""""""......"""""""""""....T',
      'TTT...""""""""......"""""""""""....T',
      'TTT...""""""""......"""""""""""....T',
      'TTT................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route111', offset: 0 }, west: { map: 'lavaridge', offset: -2 } },
    warps: [{ x: 15, y: 7, to: 'cable-car-112', spot: 'door' }, { x: 28, y: 5, to: 'fiery-path', spot: 'south' }],
    spots: { 'station-door': [15, 8, 'down'], 'fiery-path': [28, 6, 'down'] },
    signs: {
      '33,13': 'Route 112. East: Route 111. North: the Mt. Chimney Cable Car and the Fiery Path.',
      '17,8': 'Mt. Chimney Cable Car. To the summit in a few minutes!',
      '30,7': 'The Fiery Path. It is hot inside: mind your step!'
    },
    trainers: [
      { id: 'brice', who: 'hiker', cls: 'hiker', name: 'Brice', x: 22, y: 12, dir: 'down', sight: 2, team: [['numel', 21], ['machop', 21]],
        before: 'Mountains are for climbing, and Trainers are for battling!',
        defeat: 'Slipped off the trail...',
        after: 'Mt. Chimney is a volcano, you know. The Fiery Path goes right through it to the other side.' },
      { id: 'trent', who: 'hiker', cls: 'hiker', name: 'Trent', x: 9, y: 12, dir: 'down', sight: 2, team: [['geodude', 20], ['geodude', 20], ['graveler', 21]],
        before: 'I carried these Pokémon up a hundred mountains. Now they can carry me to victory!',
        defeat: 'What a rockslide...',
        after: 'The ledge to the west comes down from Lavaridge Town. You cannot climb back up that way.' }
    ],
    npcs: [
      { id: 'grunt1', who: 'magma', x: 15, y: 8, dir: 'down', if: '!meteorite-stolen',
        say: 'Team Magma is using the cable car today. Nobody else goes up the mountain!' },
      { id: 'grunt2', who: 'magma', x: 16, y: 8, dir: 'down', if: '!meteorite-stolen',
        say: 'Our boss went off to Meteor Falls with some professor... Hey, forget I said that!' }
    ],
    items: [{ x: 34, y: 5, item: 'super-potion', flag: 'route112-superpotion' }],
    encounters: { walk: '@hoenn-route-112-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'cable-car-112', loc: 'hoenn-route-112', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
    rows: STATION,
    warps: [{ x: 5, y: 6, to: 'route112', spot: 'station-door' }],
    spots: { door: [5, 6, 'up'], car: [5, 4, 'down'] },
    npcs: [{ id: 'attendant', who: 'clerk', x: 5, y: 3, dir: 'down', script: 'chimney.car-up' }]
  }, HOENN));

  // ---------------- the Fiery Path ----------------
  G.Maps.def(Object.assign({
    id: 'fiery-path', loc: 'fiery-path', tileset: 'outdoor', palette: 'fiery', music: 'cave', battleBg: 'cave', border: '#',
    cave: true, escape: true,
    rows: [
      '############O#############',
      '###########....###########',
      '###########....###########',
      '###########....###########',
      '###............###~~~~####',
      '###............###~~~~####',
      '###............###~~~~####',
      '###............###~~~~####',
      '###.....######.###~~~~####',
      '###.....#~~~~#.###~~~~####',
      '###.....#~~~~#.###########',
      '###.....######.###########',
      '###............###########',
      '###.............##########',
      '###.............#......###',
      '###.............#......###',
      '##########.............###',
      '##########.............###',
      '##########......#......###',
      '##########......#......###',
      '##########......##########',
      '############O#############'
    ],
    warps: [{ x: 12, y: 21, to: 'route112', spot: 'fiery-path' }, { x: 12, y: 0, to: 'route113', spot: 'fiery-path' }],
    spots: { south: [12, 20, 'up'], north: [12, 1, 'down'] },
    npcs: [{ id: 'hiker', who: 'hiker', x: 5, y: 9, move: 'look',
             say: 'Phew, it is hot! Steam comes up through the rock everywhere. Grimer and Koffing love the fumes in here.' }],
    items: [{ x: 21, y: 15, item: 'fire-stone', flag: 'fiery-firestone' }, { x: 21, y: 19, item: 'super-repel', flag: 'fiery-superrepel' }],
    encounters: { walk: '@fiery-path-area' }
  }, HOENN));

  // ---------------- Route 113 ----------------
  G.Maps.def(Object.assign({
    id: 'route113', loc: 'hoenn-route-113', tileset: 'outdoor', palette: 'ash', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T................................######T',
      'T..."""""""""..........."""""""..######T',
      'T..."""""""""..........."""""""..###O##T',
      'T..."""""""""...........""""""".....,..T',
      'T...................................,..T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T.................................S....T',
      'T.."""""""......"""""""""""............T',
      'T.."""""""......"""""""""""............T',
      'T.."""""""......"""""""""""............T',
      'T......................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'fallarbor', offset: -4 } },
    warps: [{ x: 36, y: 3, to: 'fiery-path', spot: 'north' }],
    spots: { 'fiery-path': [36, 4, 'down'] },
    signs: { '34,8': 'Route 113. West: Fallarbor Town. Ash from Mt. Chimney falls on this road all year round.' },
    trainers: [
      { id: 'lawrence', who: 'camper', cls: 'camper', name: 'Lawrence', x: 20, y: 4, dir: 'down', sight: 2, team: [['spinda', 21], ['sandshrew', 21]],
        before: 'The ash on this road is warm and soft. Perfect for a battle!',
        defeat: 'Covered in ash...',
        after: 'Spinda\'s spots are different on every single one. No two are alike!' },
      { id: 'sophie', who: 'lass', cls: 'picnicker', name: 'Sophie', x: 13, y: 9, dir: 'up', sight: 2, team: [['marill', 21], ['skitty', 22]],
        before: 'Ash fell in my lunch box again. Now I am in a bad mood. Battle!',
        defeat: 'Not my day at all...',
        after: 'Fallarbor Town is just west of here. Its Pokémon Center is a good place to shake off the ash.' },
      { id: 'jaylen', who: 'birdkeeper', cls: 'bird-keeper', name: 'Jaylen', x: 30, y: 9, dir: 'up', sight: 2, team: [['taillow', 21], ['swablu', 22]],
        before: 'My bird Pokémon fly right through the falling ash!',
        defeat: 'Grounded...',
        after: 'Swablu\'s wings are as soft as cotton. It loves to sit on people\'s heads.' }
    ],
    items: [{ x: 1, y: 12, item: 'super-repel', flag: 'route113-superrepel' }, { x: 38, y: 12, item: 'max-ether', flag: 'route113-maxether' }],
    encounters: { walk: '@hoenn-route-113-area' }
  }, HOENN));

  // ---------------- Fallarbor Town ----------------
  G.Maps.def(Object.assign({
    id: 'fallarbor', loc: 'fallarbor-town', tileset: 'outdoor', palette: 'ash', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..........................T',
      'T..........................T',
      'T..........BBBBBB..........T',
      'T..CCCCC...BBBBBB..........T',
      'T..CCCCC...BBBBBB...MMMM...T',
      'T..CCCCC...BBDBBB...MMMM...T',
      'T..CCDCC.....,...S..MDMM...T',
      'T....,.......,.......,.....T',
      'T....,...S...,.......,.....T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T..........................T',
      'T..........................T',
      'T....HHHH..ffffff..HHHH....T',
      'T....HHHH..ffffff..HHHH....T',
      'T....HDHH..ffffff..HDHH....T',
      'T.....,....ffffff...,......T',
      'T..........ffffff..........T',
      'T..........................T',
      'T..........................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route113', offset: 4 }, west: { map: 'route114', offset: -14 } },
    warps: [
      { x: 5, y: 7, to: 'fallarbor-center', spot: 'door' },
      { x: 21, y: 7, to: 'fallarbor-mart', spot: 'door' },
      { x: 6, y: 16, to: 'cozmo-house', spot: 'door' },
      { x: 20, y: 16, to: 'fallarbor-house', spot: 'door' },
      { x: 13, y: 6, locked: 'fallarbor.contest' }
    ],
    spots: { 'center-door': [5, 8, 'down'], 'mart-door': [21, 8, 'down'], 'cozmo-door': [6, 17, 'down'], 'house-door': [20, 17, 'down'] },
    signs: {
      '9,9': 'Fallarbor Town. A quiet farming town where the ash falls like soft snow.',
      '17,7': 'Pokémon Contest Hall. The stage where Pokémon show off their charm.'
    },
    npcs: [
      { id: 'boy', who: 'youngster', x: 14, y: 12, move: 'wander', r: 2,
        say: 'The ash from Mt. Chimney makes our fields rich. Everything grows well here!' },
      { id: 'woman', who: 'lass', x: 24, y: 18, move: 'look',
        say: 'Professor Cozmo lives in the house by the fields. He studies meteorites: stones that fell from the sky!' },
      { id: 'man', who: 'gentleman', x: 3, y: 13, move: 'look',
        say: 'West of town, Route 114 leads to Meteor Falls. They say a shower of falling stars made the falls long ago.' }
    ]
  }, HOENN));

  G.Maps.center('fallarbor-center', {
    loc: 'fallarbor-town', exit: { map: 'fallarbor', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'hiker', x: 3, y: 5, move: 'look',
             say: 'Travellers pass through Fallarbor on their way to Meteor Falls. Everyone wants to see the place where the stars fell.' }]
  }).region = 'hoenn';

  G.Maps.mart('fallarbor-mart', {
    loc: 'fallarbor-town', exit: { map: 'fallarbor', spot: 'mart-door' },
    stock: ['great-ball', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'escape-rope', 'super-repel', 'x-sp-atk'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'Ash gets in everywhere here, even inside the Mart. They sweep three times a day!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'cozmo-house', loc: 'fallarbor-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'fallarbor', spot: 'cozmo-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'wife', who: 'beauty', x: 2, y: 4, dir: 'right', script: 'fallarbor.cozmo-wife' },
      { id: 'cozmo', who: 'scientist', x: 7, y: 4, dir: 'left', if: 'meteorite-stolen', script: 'fallarbor.cozmo' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'fallarbor-house', loc: 'fallarbor-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'fallarbor', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'girl', who: 'lass', x: 7, y: 4, dir: 'left',
             say: 'Pokémon Contests are held in the hall across the road: Pokémon show off how cool or cute they are. It is closed for now, though.' }]
  }, HOENN));

  // ---------------- Route 114 ----------------
  G.Maps.def(Object.assign({
    id: 'route114', loc: 'hoenn-route-114', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T########.......#####..T',
      'T########.......#####..T',
      'T###O####.......##O##..T',
      'T...,,.................T',
      'T...,,...."""""""""....T',
      'T...,,...."""""""""....T',
      'T...,,...."""""""""....T',
      'T...,,...."""""""""....T',
      'T...,,...."""""""""....T',
      'T...,,...."""""""""....T',
      'T...,,.................T',
      'T...,,.................T',
      'T...,,.................T',
      'T~~~==~~~~~~~~~~~~~~~~~T',
      'T~~~==~~~~~~~~~~~~~~~~~T',
      'T~~~==~~~~~~~~~~~~~~~~~T',
      'T...,,.................T',
      'T...,,.."""""""""."""".T',
      'T...,,.."""""""""."""".T',
      'T...,,.."""""""""."""".T',
      'T...,,.."""""""""."""".T',
      'T...,,.."""""""""."""".T',
      'T...,,..............S..T',
      'T...,,,,,,,,,,,,,,,,,,,,',
      'T...,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T......................T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'fallarbor', offset: 14 } },
    // Chapter 42: the Terra Cave opens once the Weather Institute has read the drought (legends.js).
    warps: [{ x: 4, y: 3, to: 'meteor-falls', spot: 'mouth' },
            { x: 18, y: 3, to: 'terra-cave', spot: 'door', if: 'weather-report', locked: 'legends.terra-closed' }],
    spots: { falls: [4, 4, 'down'], terra: [18, 4, 'down'] },
    signs: { '20,23': 'Route 114. East: Fallarbor Town. North-west: Meteor Falls.' },
    trainers: [
      { id: 'kai', who: 'fisherman', cls: 'fisherman', name: 'Kai', x: 7, y: 12, dir: 'left', sight: 2, team: [['barboach', 21], ['carvanha', 22]],
        before: 'The river here is full of fish, and my Pokémon are full of fight!',
        defeat: 'The one that got away...',
        after: 'Barboach hides in the mud at the bottom of the river. They say it can feel an earthquake before it comes.' },
      { id: 'lucas', who: 'hiker', cls: 'hiker', name: 'Lucas', x: 12, y: 23, dir: 'down', sight: 1, team: [['geodude', 21], ['nosepass', 22]],
        before: 'I am on my way to Meteor Falls, to see where the stars came down!',
        defeat: 'I am seeing stars...',
        after: 'Meteor Falls is through the cave mouth to the north-west. Bring sturdy boots!' },
      { id: 'nancy', who: 'lass', cls: 'picnicker', name: 'Nancy', x: 6, y: 8, dir: 'left', sight: 1, team: [['lotad', 21], ['seedot', 21]],
        before: 'I was picking flowers by the river. A battle first, though!',
        defeat: 'My flowers got trampled...',
        after: 'Lotad likes to float down the river and nap in the sun.' }
    ],
    items: [{ x: 21, y: 27, item: 'hyper-potion', flag: 'route114-hyperpotion' }],
    encounters: { walk: '@hoenn-route-114-area', water: '@hoenn-route-114-area' }
  }, HOENN));

  // ---------------- Meteor Falls ----------------
  G.Maps.def(Object.assign({
    id: 'meteor-falls', loc: 'meteor-falls', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#',
    cave: true, escape: true,
    rows: [
      '##########O#################',
      '####~~~~~...################',
      '####~~~~~...################',
      '######|#####################',
      '###~~~~~~~...............###',
      '###~~~~~~~...............###',
      '###~~~~~~~...............###',
      '###~~~~~~~...............###',
      '###~~~~~~~.........##....###',
      '###................##....###',
      '###......................###',
      '###..........##..........###',
      '###..........##..........###',
      '###......................###',
      '###......................###',
      '###...##.................###',
      '###...##.................###',
      '###......................###',
      '###......................###',
      '###......................###',
      '####################...#####',
      '#####################O######'
    ],
    // Chapter 40: up the waterfall, Steven's cave (postgame.js).
    warps: [{ x: 21, y: 21, to: 'route114', spot: 'falls' }, { x: 10, y: 0, to: 'meteor-falls-steven', spot: 'mouth' }],
    spots: { mouth: [21, 20, 'up'], steven: [10, 1, 'down'] },
    triggers: [{ x: 3, y: 12, w: 22, h: 1, if: '!meteorite-stolen', script: 'meteor.magma' }],
    npcs: [
      { id: 'cozmo', who: 'scientist', x: 14, y: 5, dir: 'down', if: '!meteorite-stolen', script: 'meteor.magma' },
      { id: 'maxie', who: 'maxie', x: 14, y: 6, dir: 'up', if: '!meteorite-stolen', script: 'meteor.magma' },
      { id: 'm1', who: 'magma', x: 13, y: 7, dir: 'up', if: '!meteorite-stolen', script: 'meteor.magma' },
      { id: 'm2', who: 'magma', x: 15, y: 7, dir: 'up', if: '!meteorite-stolen', script: 'meteor.magma' },
      { id: 'archie', who: 'archie', x: 21, y: 20, dir: 'up', if: 'scripted' },
      { id: 'aqua', who: 'aqua', x: 21, y: 20, dir: 'up', if: 'scripted' }
    ],
    items: [{ x: 24, y: 4, item: 'moon-stone', flag: 'meteor-moonstone' }, { x: 3, y: 19, item: 'full-heal', flag: 'meteor-fullheal' }],
    encounters: { walk: '@meteor-falls-area', water: '@meteor-falls-area' }
  }, HOENN));

  // ---------------- Meteor Falls: Team Magma takes the meteorite ----------------
  /** Someone walks out toward the cave's mouth (a team leaves together). */
  async function leave(h, id, x) {
    await h.walkTo(id, x, 19);
    h.hide(id);
  }
  async function magma(h) {
    const F = G.Field;
    if (F.flag('meteorite-stolen')) return;
    await h.walkTo('player', 14, 9);
    h.face('player', 'up');
    await h.say(T('Please, give it back! That meteorite is the fruit of years of my research!'), COZMO);
    await h.say(T('Research? Professor, this stone holds more power than you know. Poured into the volcano, it will make the land grow, and people need more land to live on.'), MAXIE);
    h.face('m1', 'down');
    h.emote('m1', '!');
    await h.say(T('Boss! A kid followed us in here!'), GRUNT);
    h.face('maxie', 'down');
    await h.say(T('So you are the child who keeps meddling with Team Aqua. I am Maxie, the leader of Team Magma. The land will grow, and nobody will stop it.'), MAXIE);
    // Team Aqua, hard on Team Magma's heels.
    h.place('archie', 21, 20, 'up'); h.show('archie');
    await h.walkTo('archie', 15, 10);
    h.place('aqua', 21, 20, 'up'); h.show('aqua');
    await h.walkTo('aqua', 16, 10);
    h.face('archie', 'up');
    await h.say(T('Maxie! I knew we would find you here.'), ARCHIE);
    await h.say(T('Archie. Late, as always. The meteorite is ours. Team Magma, to Mt. Chimney!'), MAXIE);
    await Promise.all([leave(h, 'maxie', 21), leave(h, 'm1', 20), leave(h, 'm2', 22)]);
    h.face('archie', 'player');
    await h.say(T('Team Magma wants to make the land bigger by heating up the volcano. If they get their way, the sea will shrink! That I will never allow.'), ARCHIE);
    await h.say(T('Kid, they are heading for the top of Mt. Chimney. Their grunts will not be guarding the cable car on Route 112 any more. We are going too!'), ARCHIE);
    await Promise.all([leave(h, 'archie', 21), leave(h, 'aqua', 22)]);
    F.setFlag('meteorite-stolen');
    h.face('player', 'up');
    await h.say(T('My meteorite... I thought they wanted to help with my research. I will go home to Fallarbor and wait. I hope somebody can get it back...'), COZMO);
    h.hide('cozmo');
  }

  G.Script.def({
    'meteor.magma': [['js', magma]],
    'route111.desert': [
      ['if', 'has:go-goggles', [
        ['say', 'Go-Goggles! Those would keep the sand out of your eyes. But the storm is so wild today that nobody can even find the path. Better wait until it dies down.']
      ], [
        ['say', 'A sandstorm rages in the desert ahead. Without goggles, the sand would blind you after a few steps.']
      ]]
    ],
    'fallarbor.contest': [['say', 'The Contest Hall is closed. A note on the door says the stage is being repaired.']],
    'fallarbor.cozmo-wife': [
      ['if', 'meteorite-stolen', [
        ['say', 'My husband came home looking so sad. Those people in red took his precious meteorite...', WIFE]
      ], [
        ['say', 'Some people in red hoods asked my husband to take them to Meteor Falls. He was so happy that someone cared about his research...', WIFE],
        ['say', 'Meteor Falls is north-west of town, past Route 114.', WIFE]
      ]]
    ],
    'fallarbor.cozmo': [
      ['if', 'meteorite-returned', [
        ['say', 'Thank you again. I will keep studying this meteorite, and one day I will learn where it came from.', COZMO]
      ], [['if', 'has:meteorite', [
        ['say', 'Is that... my meteorite? You brought it back from Mt. Chimney!', COZMO],
        ['takeItem', 'meteorite', 1],
        ['say', '{player} gave the meteorite back to Professor Cozmo.'],
        ['setFlag', 'meteorite-returned'],
        ['say', 'Thank you! Please, take this. It is TM27, Return: the more a Pokémon loves its Trainer, the harder it hits.', COZMO],
        ['giveItem', 'tm27', 1]
      ], [
        ['say', 'They took my meteorite up Mt. Chimney... What could they want with it? I study the sky, not volcanoes...', COZMO]
      ]]]]
    ],
    // The cable car (the station at the top is in lavaridge.js).
    'chimney.car-up': [
      ['choice', 'Welcome to the Mt. Chimney Cable Car! Shall we take you up to the summit?', [
        ['fade', 'out', 0.6], ['sfx', 'lift'],
        ['say', 'The cable car swayed gently as it climbed the steep side of Mt. Chimney...'],
        ['warp', 'cable-car-top', 'car'],
        ['say', 'This is the summit of Mt. Chimney. Please watch your step: the ground is hot!', ATTENDANT]
      ], [
        ['say', 'Please come again!', ATTENDANT]
      ], ATTENDANT]
    ]
  });
})();
