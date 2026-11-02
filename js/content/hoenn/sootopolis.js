/* ============ sootopolis.js — Route 126, Sootopolis City, the Sky Pillar, Juan's Rain Badge ============
 * Chapter 38. Kyogre is awake (seafloor.js) and a storm covers the sea around Sootopolis (maps with
 * `storm: STORM`: rain on the map and in its battles). On Route 128 Steven tells you Groudon and Kyogre are
 * heading for Sootopolis, a town inside a crater on Route 126: the way in is under the sea (Route 126's
 * sea floor, `up` into the town's lake). In the town the two Pokémon face each other; Steven sends you to
 * Wallace in the Cave of Origin, who sends you to the Sky Pillar on Route 131 (west over Routes 129 and
 * 130, past Pacifidlog Town's currents) and unseals its door (flag wallace-sky-pillar). At its top Rayquaza
 * wakes and flies to Sootopolis (flag rayquaza-awake); arriving there, it calms Groudon and Kyogre and the
 * storm ends (flag weather-calm). Rayquaza comes back to the Sky Pillar (Lv. 70, flag rayquaza-met). Juan's
 * Gym (an ice floor, four Trainers) opens: the Rain Badge (badge 24: every Pokémon obeys) and TM03 Water
 * Pulse, then `ending(38)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const STEVEN = { name: 'Steven' }, WALLACE = { name: 'Wallace' }, JUAN = { name: 'Juan' };
  const STORM = ['kyogre-awake', '!weather-calm'];
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const house = (id, loc, exit, npcs) => G.Maps.def(Object.assign({
    id, loc, tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor', rows: HOUSE,
    warps: [{ x: 4, y: 7, to: exit.map, spot: exit.spot }], spots: { door: [4, 7, 'up'] }, npcs
  }, HOENN));
  const PILLAR = { loc: 'sky-pillar', tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', cave: true, region: 'hoenn' };

  // ---------------- Route 126 and its sea floor ----------------
  G.Maps.def(Object.assign({
    id: 'route126', loc: 'hoenn-route-126', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    dive: 'route126-uw', storm: STORM,
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~dddd~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~dddd~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~dddd~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~dddd~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~############~~~~~~~~~~',
      '~~~~~~~~################~~~~~~~~',
      '~~~~~~~~################~~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~##################~~~~~~~',
      '~~~~~~~~################~~~~~~~~',
      '~~~~~~~~################~~~~~~~~',
      '~~~~~~~~~~############~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~dddddd~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~dddddd~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~dddddd~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~dddddd~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~::::~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~:##:~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~:##:~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~::::~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route124', offset: 0 }, east: { map: 'route127', offset: 4 } },
    trainers: [
      { id: 'dean', who: 'swimmer', cls: 'swimmer', name: 'Dean', x: 26, y: 20, dir: 'left', sight: 4, swim: true, team: [['tentacruel', 41], ['carvanha', 41]],
        before: 'A storm like this is a swimmer\'s worst nightmare. Or best training!',
        defeat: 'I got pulled under...',
        after: 'Sootopolis City is inside that crater. You can only get in from under the water.' },
      { id: 'brenda', who: 'swimmerf', cls: 'swimmer-f', name: 'Brenda', x: 4, y: 24, dir: 'right', sight: 4, swim: true, team: [['goldeen', 41], ['wailmer', 42]],
        before: 'The rain will not stop! Let us battle while we wait for it to clear.',
        defeat: 'Washed away...',
        after: 'The dark water south of the crater is where the divers go down.' },
      { id: 'merle', who: 'fisherman', cls: 'fisherman', name: 'Merle', x: 27, y: 40, dir: 'left', sight: 4, team: [['magikarp', 38], ['gyarados', 42]],
        before: 'The fish bite like crazy before a storm. What did I hook this time?',
        defeat: 'Snapped my line!',
        after: 'My grandfather said the storms of legend came when the masters of land and sea fought.' }
    ],
    items: [{ x: 30, y: 39, item: 'pp-up', flag: 'route126-ppup' }],
    encounters: { water: '@hoenn-route-126-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'route126-uw', loc: 'hoenn-route-126', surface: 'route126', tileset: 'outdoor', palette: 'underwater', music: 'cave', battleBg: 'underwater',
    border: '#', underwater: true,
    rows: [
      '################################',
      '################################',
      '################################',
      '################################',
      '##,,,,##########################',
      '##,,,,##########################',
      '##,,,,##########################',
      '##,,,,##########################',
      '##......########################',
      '##."""".########################',
      '##."""".########################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '############........############',
      '############.,,,,,,.############',
      '############.,,,,,,.############',
      '############.,,,,,,.############',
      '############.,,,,,,.############',
      '############........############',
      '###############..###############',
      '###############..###############',
      '###############""###############',
      '###############""###############',
      '###############""###############',
      '###############""###############',
      '###############""###############',
      '###############""###############',
      '###############..###############',
      '###############..###############',
      '#############,,,,,,.....########',
      '#############,,,,,,.""""########',
      '#############,,,,,,.""""########',
      '#############,,,,,,.""""########',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################'
    ],
    // Under Sootopolis's lake: coming up there leads into the town.
    up: [{ x: 13, y: 19, w: 6, h: 4, to: 'sootopolis', spot: 'lake' }],
    spots: { sootopolis: [15, 21, 'down'] },
    items: [{ x: 6, y: 8, item: 'big-pearl', flag: 'route126-uw-bigpearl' }, { x: 23, y: 34, item: 'ultra-ball', flag: 'route126-uw-ultraball' }],
    encounters: { seaweed: '@hoenn-route-126-underwater' }
  }, HOENN));

  // ---------------- Sootopolis City ----------------
  G.Maps.def(Object.assign({
    id: 'sootopolis', loc: 'sootopolis-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'sea', border: '#',
    fly: { spot: 'center-door' }, storm: STORM, enter: 'sootopolis.enter',
    // The lake: Dive goes back down into the tunnel under the crater.
    dive: { to: 'route126-uw', spot: 'sootopolis' },
    rows: [
      '################################',
      '#####################O##########',
      '###..........GGGGGG..,......#.##',
      '##...........GGGGGG..,........##',
      '##.CCCCC.....GGGGGG..,..MMMM..##',
      '##.CCCCC.....GGGGGG..,..MMMM..##',
      '##.CCCCC.....GGDGGG..,..MDMM..##',
      '##.CCDCC.......,.....,...,....##',
      '##...,.........,.....,...,....##',
      '##...,,S,,,,,,,,,,,,,,,,,,....##',
      '##......,~~~~~~~~~~~~~~,......##',
      '##......,~~~~~~~~~~~~~~,......##',
      '##......,~~~~~~~~~~~~~~,......##',
      '##......,~~~~~dddd~~~~~,......##',
      '##......,~~~~~dddd~~~~~,......##',
      '##......,~~~~~dddd~~~~~,......##',
      '##......,~~~~~dddd~~~~~,......##',
      '##......,~~~~~~~~~~~~~~,......##',
      '##......,~~~~~~~~~~~~~~,......##',
      '##......,~~~~~~~~~~~~~~,......##',
      '##......,..............,......##',
      '##.HHHH.,..............,.HHHH.##',
      '##.HHHH.,..............,.HHHH.##',
      '##.HDHH.,..............,.HDHH.##',
      '##..,,,,,,,,,,,,,,,,,,,,,,,...##',
      '###..........................###',
      '################################',
      '################################'
    ],
    warps: [
      { x: 5, y: 7, to: 'sootopolis-center', spot: 'door' },
      { x: 25, y: 6, to: 'sootopolis-mart', spot: 'door' },
      { x: 15, y: 6, to: 'sootopolis-gym', spot: 'door', if: 'weather-calm', locked: 'sootopolis.gym-closed' },
      { x: 4, y: 23, to: 'sootopolis-house', spot: 'door' },
      { x: 26, y: 23, to: 'sootopolis-house2', spot: 'door' },
      { x: 21, y: 1, to: 'cave-of-origin', spot: 'mouth' }
    ],
    spots: { lake: [15, 14, 'down'], 'center-door': [5, 8, 'down'], 'mart-door': [25, 7, 'down'], 'gym-door': [15, 7, 'down'],
             'house-door': [4, 24, 'down'], 'house2-door': [26, 24, 'down'], 'cave-door': [21, 2, 'down'] },
    signs: { '7,9': 'Sootopolis City. A town of white stone in the heart of an old crater.' },
    npcs: [
      { id: 'steven', who: 'steven', x: 20, y: 3, dir: 'down', if: STORM, script: 'sootopolis.steven' },
      { id: 'wallace', who: 'wallace', x: 19, y: 3, dir: 'down', if: 'scripted' },
      { id: 'kyogre', who: 'kyogre', mon: 'kyogre', x: 11, y: 12, dir: 'right', fixed: true, swim: true, if: STORM,
        say: 'Kyogre glares across the lake, calling down the rain.' },
      { id: 'groudon', who: 'groudon', mon: 'groudon', x: 16, y: 22, dir: 'up', fixed: true, if: STORM,
        say: 'Groudon roars, and the air around it burns with heat.' },
      { id: 'rayquaza', who: 'rayquaza', mon: 'rayquaza', x: 15, y: 11, dir: 'down', fixed: true, swim: true, if: 'scripted' },
      { id: 'girl', who: 'lass', x: 12, y: 21, move: 'look', if: 'weather-calm',
        say: 'The sky is blue again! For a while I thought the sea and the land would swallow the whole city.' },
      { id: 'man', who: 'gentleman', x: 26, y: 12, move: 'look', if: 'weather-calm',
        say: 'They say a Pokémon that lives in the sky calmed the storm. Sootopolis has never seen anything like it.' }
    ],
    encounters: { water: '@sootopolis-city-area' }
  }, HOENN));

  G.Maps.center('sootopolis-center', {
    loc: 'sootopolis-city', exit: { map: 'sootopolis', spot: 'center-door' },
    npcs: [{ id: 'woman', who: 'beauty', x: 3, y: 5, move: 'look',
             say: 'Sootopolis is built inside a crater. Without a Pokémon that can Dive or Fly, you cannot even get here!' }]
  }).region = 'hoenn';

  G.Maps.mart('sootopolis-mart', {
    loc: 'sootopolis-city', exit: { map: 'sootopolis', spot: 'mart-door' },
    stock: ['ultra-ball', 'hyper-potion', 'max-potion', 'full-heal', 'revive', 'max-repel', 'x-attack', 'x-defense'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'Max Potions and Revives. In a city at the bottom of a crater, it pays to be ready.' }]
  }).region = 'hoenn';

  house('sootopolis-house', 'sootopolis-city', { map: 'sootopolis', spot: 'house-door' },
    [{ id: 'oldman', who: 'oldman', x: 7, y: 4, dir: 'left',
       say: 'The legends say the masters of land and sea once fought until the sky itself stepped in. I never thought I would see it.' }]);
  house('sootopolis-house2', 'sootopolis-city', { map: 'sootopolis', spot: 'house2-door' },
    [{ id: 'boy', who: 'youngster', x: 3, y: 4, dir: 'right',
       say: 'Juan is the best Gym Leader in Hoenn! He even taught Wallace, and Wallace is amazing.' }]);

  // ---------------- Juan's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'sootopolis-gym', loc: 'sootopolis-city', tileset: 'indoor', palette: 'pool', music: 'gym', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWW',
      'p+++++++++++++p',
      '+++++++++++++++',
      '+++++++++++++++',
      'IIIIIIIIIIIIIII',
      'IIIIIIIcIIIIIII',
      'IIIIcIIIIIIIIII',
      'IIcIIIIcIccIIIc',
      'cIIIIIIIcIIIIII',
      'IIIIIIIIIIIIIII',
      'IIIIIccccIIIIIc',
      'IIIIIIIIIcIIccI',
      'IIIIIIIIIIIIIII',
      'ccccc+++++ccccc',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 15, to: 'sootopolis', spot: 'gym-door' }],
    spots: { door: [7, 15, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 5, y: 14, dir: 'right', script: 'sootopolis.gym-guide' }],
    trainers: [
      { id: 'olivia', who: 'beauty', cls: 'beauty', name: 'Olivia', x: 2, y: 3, dir: 'right', sight: 3, team: [['clamperl', 41], ['corphish', 41], ['lombre', 42]],
        before: 'You crossed the ice without falling? How graceful. Let us see if your battling is as pretty.',
        defeat: 'Not a hair out of place, and still I lost...',
        after: 'Juan says a battle should flow like water. Beauty and strength, together.' },
      { id: 'bethany', who: 'pokefan', cls: 'pokefan', name: 'Bethany', x: 12, y: 3, dir: 'left', sight: 3, team: [['marill', 41], ['azumarill', 43]],
        before: 'My Azumarill is the cutest Water type in Hoenn! And the strongest!',
        defeat: 'My darlings...',
        after: 'Azumarill\'s ears can hear the smallest ripple. Juan\'s Pokémon are just as sharp.' },
      { id: 'connie', who: 'beauty', cls: 'beauty', name: 'Connie', x: 1, y: 15, dir: 'right', sight: 5, team: [['goldeen', 42], ['lanturn', 43]],
        before: 'Slipping on the ice already? A battle will help you find your feet.',
        defeat: 'I am the one who slipped...',
        after: 'Slide until something stops you. The rocks on the ice are your friends.' },
      { id: 'crissy', who: 'lass', cls: 'lass', name: 'Crissy', x: 13, y: 15, dir: 'left', sight: 5, team: [['wailmer', 42], ['seaking', 42], ['whiscash', 41]],
        before: 'I came to Juan\'s Gym to learn the art of Water types. Watch this!',
        defeat: 'I still have so much to learn.',
        after: 'Juan\'s Kingdra is part Dragon. Normal Water-type weaknesses do not work on it.' },
      { id: 'juan', who: 'juan', cls: 'leader', name: 'Juan', x: 7, y: 2, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'hyper-potion': 1 },
        team: [['luvdisc', 41, ['water-pulse', 'attract', 'sweet-kiss', 'flail']],
               ['whiscash', 41, ['rain-dance', 'water-pulse', 'amnesia', 'earthquake']],
               ['sealeo', 43, ['encore', 'body-slam', 'aurora-beam', 'water-pulse']],
               ['crawdaunt', 43, ['water-pulse', 'crabhammer', 'taunt', 'leer']],
               ['kingdra', 46, ['water-pulse', 'double-team', 'ice-beam', 'rest']]],
        before: 'Ah, so you are the Trainer who brought the sky\'s master to our city. I am Juan, the Leader of this Gym, and Wallace\'s teacher. Water and I move as one. Show me the elegance of the bond between you and your Pokémon!',
        defeat: 'Ahahaha! Splendid! Your battle washed over me like a great wave. I have nothing left to teach you.',
        win: 'sootopolis.juan-win',
        afterScript: [['say', 'The League awaits you at Ever Grande City. Go and show them the beauty I saw today.', JUAN]] }
    ]
  }, HOENN));

  // ---------------- The Cave of Origin ----------------
  G.Maps.def(Object.assign({
    id: 'cave-of-origin', loc: 'cave-of-origin', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true,
    rows: [
      '################',
      '################',
      '###..........###',
      '##............##',
      '##........##..##',
      '##...##...##..##',
      '##...##.......##',
      '##............##',
      '##............##',
      '##............##',
      '##............##',
      '########O#######'
    ],
    warps: [{ x: 8, y: 11, to: 'sootopolis', spot: 'cave-door' }],
    spots: { mouth: [8, 10, 'up'] },
    npcs: [{ id: 'wallace', who: 'wallace', x: 8, y: 4, dir: 'down', if: ['kyogre-awake', '!wallace-sky-pillar'], script: 'origin.wallace' }],
    encounters: { walk: '@cave-of-origin-entrance' }
  }, HOENN));

  // ---------------- Routes 129, 130 and 131 ----------------
  G.Maps.def(Object.assign({
    id: 'route129', loc: 'hoenn-route-129', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~', storm: STORM,
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~####~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~####~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~####~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'route128', offset: -4 }, west: { map: 'route130', offset: 0 } },
    trainers: [
      { id: 'reese', who: 'swimmer', cls: 'swimmer', name: 'Reese', x: 22, y: 6, dir: 'down', sight: 4, swim: true, team: [['wailmer', 42], ['tentacruel', 42]],
        before: 'Heading west? The storm thins out the farther you swim. Battle me first!',
        defeat: 'Out of the storm and out of luck...',
        after: 'Past Route 130 is Route 131. You can see the Sky Pillar from there on a clear day.' },
      { id: 'tara', who: 'swimmerf', cls: 'swimmer-f', name: 'Tara', x: 8, y: 14, dir: 'up', sight: 4, swim: true, team: [['staryu', 41], ['starmie', 43]],
        before: 'My Starmie\'s core shines like a star even in the rain!',
        defeat: 'My star went out...',
        after: 'A Starmie\'s core glows brighter the stronger it gets.' }
    ],
    encounters: { water: '@hoenn-route-129-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'route130', loc: 'hoenn-route-130', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~::::::::::~~~~~~~~~~~~',
      '~~~~~~~~~~:........:~~~~~~~~~~~~',
      '~~~~~~~~~~:..""""..:~~~~~~~~~~~~',
      '~~~~~~~~~~:..""""..:~~~~~~~~~~~~',
      '~~~~~~~~~~:..""""..:~~~~~~~~~~~~',
      '~~~~~~~~~~:........:~~~~~~~~~~~~',
      '~~~~~~~~~~::::::::::~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'route129', offset: 0 }, west: { map: 'route131', offset: -2 } },
    trainers: [
      { id: 'rodney', who: 'swimmer', cls: 'swimmer', name: 'Rodney', x: 24, y: 10, dir: 'left', sight: 4, swim: true, team: [['gyarados', 43]],
        before: 'This patch of sea is my training ground. Let us see what you have!',
        defeat: 'That was a real workout...',
        after: 'The islet here has grass on it. People say rare Pokémon hide there.' },
      { id: 'katie', who: 'swimmerf', cls: 'swimmer-f', name: 'Katie', x: 6, y: 16, dir: 'right', sight: 4, swim: true, team: [['goldeen', 41], ['horsea', 41], ['seadra', 43]],
        before: 'The sun is out over here! Perfect weather for a battle!',
        defeat: 'At least I have a nice tan...',
        after: 'Pacifidlog Town floats on the sea, just past Route 131.' }
    ],
    items: [{ x: 18, y: 7, item: 'nugget', flag: 'route130-nugget' }],
    encounters: { walk: '@hoenn-route-130-area', water: '@hoenn-route-130-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'route131', loc: 'hoenn-route-131', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~#############~~~~~~~~~~~~~',
      '~~~~~~~~~~:###########:~~~~~~~~~~~~~',
      '~~~~~~~~~~:###########:~~~~~~~~~~~~~',
      '~~~~~~~~~~:##:KKKKK:##:~~~~~~~~~~~~~',
      '~~~~~~~~~~:##:KKKKK:##:~~~~~~~~~~~~~',
      '~~~~~~~~~~:##:KKKKK:##:~~~~~~~~~~~~~',
      '~~~~~~~~~~:##:KKKKK:##:~~~~~~~~~~~~~',
      '~~~~~~~~~~:##:KKDKK:##:~~~~~~~~~~~~~',
      '~~~~~~~~~~:##:::::::##:~~~~~~~~~~~~~',
      '~~~~~~~~~~:::::::::::::~~~~~~~~~~~~~',
      '~~~~~~~~~~:::::::::::::~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'route130', offset: 2 }, west: { map: 'pacifidlog', offset: 2 } },
    warps: [{ x: 16, y: 21, to: 'sky-pillar-1f', spot: 'door', if: 'wallace-sky-pillar', locked: 'skypillar.sealed' }],
    spots: { 'pillar-door': [16, 22, 'down'] },
    npcs: [{ id: 'wallace', who: 'wallace', x: 17, y: 22, dir: 'down', if: ['wallace-sky-pillar', '!rayquaza-awake'],
             say: 'I have unsealed the door of the Sky Pillar. Rayquaza sleeps at the very top. Go, {player}!' }],
    trainers: [
      { id: 'kevin', who: 'swimmer', cls: 'swimmer', name: 'Kevin', x: 28, y: 14, dir: 'left', sight: 4, swim: true, team: [['sharpedo', 42], ['pelipper', 42]],
        before: 'That tower is the Sky Pillar. Nobody has opened its door in ages. But first, a battle!',
        defeat: 'You swim and battle like a pro.',
        after: 'They say a dragon of the sky sleeps at the top of the Sky Pillar.' },
      { id: 'talia', who: 'swimmerf', cls: 'swimmer-f', name: 'Talia', x: 4, y: 10, dir: 'right', sight: 4, swim: true, team: [['wailmer', 42], ['lanturn', 43]],
        before: 'Pacifidlog is just west of here. Show me how strong you are before you go!',
        defeat: 'Sunk!',
        after: 'Pacifidlog has a Pokémon Center. Rest there before you climb the Sky Pillar.' }
    ],
    encounters: { water: '@hoenn-route-131-area' }
  }, HOENN));

  // ---------------- Pacifidlog Town ----------------
  G.Maps.def(Object.assign({
    id: 'pacifidlog', loc: 'pacifidlog-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'sea', border: '~',
    fly: { spot: 'center-door' },
    rows: [
      'rr~~~~~~~~~~~~~~~~~~~~~~',
      'rr~~~~~~~~~~~~~~~~~~~~~~',
      'rr~~~~~~~~~~~~~~~~~~~~~~',
      'rr~~~~~~:::::::~~~~~~~~~',
      'rr~~~~~~:CCCCC:~~~~~~~~~',
      'rr~~~~~~:CCCCC:~~~~~~~~~',
      'rr~~~~~~:CCCCC:~~~~~~~~~',
      'rr~~~~~~:CCDCC:~~~~~~~~~',
      'rr~~~~~~::::::S~~~~~~~~~',
      'rr~~~~~~~~~=~~~~~~~~~~~~',
      'rr~~~~~~~~~=~~~~~~~~~~~~',
      'rr~~~~~~~~~=~~~~~~~~~~~~',
      'rr~~:HHHH:====:HHHH:~~~~',
      'rr~~:HHHH:~~~~:HHHH:~~~~',
      'rr~~:HDHH:~~~~:HDHH:~~~~',
      'rr~~::::::~~~~::::::~~~~',
      'rr~~::::::~~~~::::::~~~~',
      'rr~~~~~~~~~~~~~~~~~~~~~~',
      'rr~~~~~~~~~~~~~~~~~~~~~~',
      'rr~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'route131', offset: -2 } },
    warps: [
      { x: 11, y: 7, to: 'pacifidlog-center', spot: 'door' },
      { x: 6, y: 14, to: 'pacifidlog-house', spot: 'door' },
      { x: 16, y: 14, to: 'pacifidlog-house2', spot: 'door' }
    ],
    spots: { 'center-door': [11, 8, 'down'], 'house-door': [6, 15, 'down'], 'house2-door': [16, 15, 'down'] },
    signs: { '14,8': 'Pacifidlog Town. Where the morning sun shines on the floating logs.' },
    npcs: [{ id: 'sailor', who: 'sailor', x: 12, y: 8, move: 'look',
             say: 'West of here the currents run so strong that nobody can swim against them. Maybe someday...' }],
    encounters: { water: '@pacifidlog-town-area' }
  }, HOENN));

  G.Maps.center('pacifidlog-center', {
    loc: 'pacifidlog-town', exit: { map: 'pacifidlog', spot: 'center-door' },
    npcs: [{ id: 'swimmer', who: 'swimmerf', x: 3, y: 5, move: 'look',
             say: 'I swam here from Route 131. The Sky Pillar is just east, on the island in the south.' }]
  }).region = 'hoenn';

  house('pacifidlog-house', 'pacifidlog-town', { map: 'pacifidlog', spot: 'house-door' },
    [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
       say: 'Our town was built on the backs of Corsola long ago, or so my grandmother told me. Now we live on logs.' }]);
  house('pacifidlog-house2', 'pacifidlog-town', { map: 'pacifidlog', spot: 'house2-door' },
    [{ id: 'fisher', who: 'fisherman', x: 3, y: 4, dir: 'right',
       say: 'The Sky Pillar? My father said its door has been sealed since before anyone can remember.' }]);

  // ---------------- The Sky Pillar ----------------
  G.Maps.def(Object.assign({
    id: 'sky-pillar-1f',
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      '+++++++++++++^++',
      '++cc++++cc++++++',
      '++cc++++cc++++++',
      '++++++++++++cc++',
      '+++++cc+++++cc++',
      '+++++cc+++++++++',
      '++++++++++cc++++',
      '++cc++++++cc++++',
      '++cc++++++++++++',
      '++++++++++++++++',
      '++++++++++++++++',
      '+++++++X++++++++'
    ],
    warps: [{ x: 7, y: 13, to: 'route131', spot: 'pillar-door' }, { x: 13, y: 2, to: 'sky-pillar-2f', spot: 'from-1f' }],
    spots: { door: [7, 13, 'up'], 'from-2f': [13, 2, 'down'], fall: [7, 9, 'down'] },
    items: [{ x: 1, y: 12, item: 'full-heal', flag: 'skypillar-fullheal' }],
    encounters: { walk: '@sky-pillar-1f' }
  }, PILLAR));

  const PITS2 = [[6, 3], [7, 5], [8, 7], [2, 8], [12, 10], [6, 12]];
  G.Maps.def(Object.assign({
    id: 'sky-pillar-2f',
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      '++^++++++++++^++',
      '++++++O+++++++++',
      '++++cccccccc++++',
      '+++++++O++++++++',
      'cccccc++++cccc++',
      '++++++++O+++++++',
      '++O+++cccccc++++',
      '++++++++++++++++',
      '++cccccc++++O+++',
      '++++++++++++++++',
      '++++++O+++++++++',
      '++++++++++++++++'
    ],
    // The floor has crumbled away in places: step in a hole and you fall to 1F.
    warps: [{ x: 13, y: 2, to: 'sky-pillar-1f', spot: 'from-2f' }, { x: 2, y: 2, to: 'sky-pillar-3f', spot: 'from-2f' }]
      .concat(PITS2.map(([x, y]) => ({ x, y, to: 'sky-pillar-1f', spot: 'fall' }))),
    spots: { 'from-1f': [13, 2, 'down'], 'from-3f': [2, 2, 'down'], fall: [9, 9, 'down'] },
    items: [{ x: 15, y: 13, item: 'max-ether', flag: 'skypillar-maxether' }],
    encounters: { walk: '@sky-pillar-3f' }
  }, PILLAR));

  const PITS3 = [[11, 5], [2, 7], [12, 9]];
  G.Maps.def(Object.assign({
    id: 'sky-pillar-3f',
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      '++^+++++++++++++',
      '++++++++cc++++++',
      '+cccccc+cc++++++',
      '++++++c++++O++++',
      '++++++c+cccccc++',
      '++O+++c+++++++++',
      '++++++c+++++++++',
      '++cccccc++++O+++',
      '++++++++++++++++',
      '+++++++++cccc+++',
      '+++++++++++++^++',
      '++++++++++++++++'
    ],
    warps: [{ x: 2, y: 2, to: 'sky-pillar-2f', spot: 'from-3f' }, { x: 13, y: 12, to: 'sky-pillar-top', spot: 'stairs' }]
      .concat(PITS3.map(([x, y]) => ({ x, y, to: 'sky-pillar-2f', spot: 'fall' }))),
    spots: { 'from-2f': [2, 2, 'down'], 'from-top': [13, 12, 'up'] },
    encounters: { walk: '@sky-pillar-5f' }
  }, PILLAR));

  G.Maps.def(Object.assign({
    id: 'sky-pillar-top', loc: 'sky-pillar', tileset: 'outdoor', palette: 'whirl', music: 'cave', battleBg: 'cave', border: '#',
    rows: [
      '################',
      '################',
      '###..........###',
      '##............##',
      '##............##',
      '##............##',
      '##............##',
      '##............##',
      '##............##',
      '##............##',
      '##............##',
      '###.....%....###',
      '################',
      '################'
    ],
    warps: [{ x: 8, y: 11, to: 'sky-pillar-3f', spot: 'from-top' }],
    spots: { stairs: [8, 11, 'up'] },
    triggers: [{ x: 2, y: 8, w: 12, h: 1, if: '!rayquaza-awake', script: 'skypillar.rayquaza' }],
    npcs: [
      { id: 'rayquaza', who: 'rayquaza', mon: 'rayquaza', x: 8, y: 5, dir: 'down', fixed: true, if: '!rayquaza-awake', script: 'skypillar.rayquaza' },
      // Back on the pillar once the storm is over: a wild battle.
      { id: 'rayquaza2', who: 'rayquaza', mon: 'rayquaza', x: 8, y: 5, dir: 'down', fixed: true, if: ['weather-calm', '!rayquaza-met'],
        script: 'skypillar.rayquaza-battle' }
    ]
  }, HOENN));

  // ---------------- The story ----------------
  /** Arriving in Sootopolis: the two masters face each other; once Rayquaza is awake, it comes to calm them. */
  async function enter(h) {
    const F = G.Field;
    if (F.flag('rayquaza-awake') && !F.flag('weather-calm')) return calm(h);
    if (!F.test(STORM) || F.flag('sootopolis-seen')) return;
    F.setFlag('sootopolis-seen');
    h.sfx('cry');
    await h.say(T('Black clouds hang over the crater. In the middle of the city, two enormous Pokémon face each other!'));
    await h.say(T('Groudon, the master of the land, and Kyogre, the master of the sea. Rain and scorching sun battle over Sootopolis.'));
  }

  async function calm(h) {
    const F = G.Field;
    h.show('rayquaza');
    h.sfx('cry');
    await h.say(T('A roar splits the clouds. Rayquaza swoops down over the crater!'));
    h.emote('kyogre', '!');
    h.emote('groudon', '!');
    await h.say(T('Rayquaza roars again. Groudon and Kyogre fall still, and the fury goes out of them.'));
    await h.fade('out', 0.5);
    for (const id of ['kyogre', 'groudon', 'rayquaza']) h.hide(id);
    F.setFlag('weather-calm');
    await h.fade('in', 0.5);
    await h.say(T('Kyogre sank back into the sea, Groudon went back into the earth, and Rayquaza flew off into the sky. The clouds over Sootopolis break apart.'));
    h.show('wallace');
    h.show('steven');
    await h.say(T('It is over. You woke Rayquaza and brought it here, {player}. Hoenn owes you its skies and its seas.'), WALLACE);
    await h.say(T('My teacher Juan is back in the Gym. Go and earn the last badge. Then come to Ever Grande City: I will be waiting there.'), WALLACE);
    await h.say(T('I knew you could do it. Thank you, {player}. I will be watching your journey to the League.'), STEVEN);
    h.hide('wallace');
    h.hide('steven');
  }

  async function wallace(h) {
    const F = G.Field;
    h.face('wallace', 'player');
    await h.say(T('You must be {player}. Steven told me about you. I am Wallace. I used to lead this city\'s Gym.'), WALLACE);
    await h.say(T('Groudon and Kyogre will not stop until one of them falls, and Hoenn will fall with them. Long ago, only one Pokémon could end their fight: Rayquaza, who lives above the clouds.'), WALLACE);
    await h.say(T('Rayquaza rests at the top of the Sky Pillar, on Route 131. Sail west from Route 128, across Routes 129 and 130.'), WALLACE);
    await h.say(T('I will go ahead and unseal the tower\'s door. Meet me there, {player}!'), WALLACE);
    F.setFlag('wallace-sky-pillar');
    h.hide('wallace');
  }

  async function rayquaza(h) {
    const F = G.Field;
    if (F.flag('rayquaza-awake')) return;
    await h.walkTo('player', 8, 7);
    h.face('player', 'up');
    await h.say(T('A long green Pokémon lies coiled at the very top of the pillar, as if it had slept here for a thousand years.'));
    h.emote('rayquaza', '!');
    h.sfx('cry');
    await h.say(T('Rayquaza opened its eyes! It looked toward Sootopolis... and shot up into the clouds!'));
    await h.fade('out', 0.4);
    h.hide('rayquaza');
    F.setFlag('rayquaza-awake');
    await h.fade('in', 0.4);
    await h.say(T('It is flying to Sootopolis City. Hurry back!'));
  }

  async function rayquazaBattle(h) {
    const F = G.Field;
    await h.say(T('Rayquaza has come back to the top of the pillar. It looks down at you, waiting.'));
    h.sfx('cry');
    await h.wild('rayquaza', 70, {});
    const r = F.lastBattle;
    if (r === 'run') { await h.say(T('Rayquaza is still there, watching you.')); return; }
    if (r === 'lose') return;
    F.setFlag('rayquaza-met');
    h.hide('rayquaza2');
    await h.say(T('The wind at the top of the Sky Pillar falls quiet.'));
  }

  G.Script.def({
    'sootopolis.enter': [['js', enter]],
    'sootopolis.steven': [
      ['face', 'steven', 'player'],
      ['if', 'wallace-sky-pillar', [
        ['say', 'Wallace went to the Sky Pillar? Then go after him, {player}. I will keep watch over the city.', STEVEN]
      ], [
        ['say', '{player}! Look at them... If Groudon and Kyogre keep fighting, the rain and the drought will swallow all of Hoenn.', STEVEN],
        ['say', 'There is someone who knows the old legends: Wallace, who once led this city\'s Gym. He went into the Cave of Origin, just behind me. Please, talk to him.', STEVEN]
      ]]
    ],
    'sootopolis.gym-closed': [['say', 'The Gym\'s door is shut. A note on it says: "Closed until the storm passes."']],
    'sootopolis.gym-guide': [
      ['say', 'Yo, Champion! Juan uses Water-type Pokémon. Grass and Electric moves are your best friends here!'],
      ['say', 'Watch out for his Kingdra: it is part Dragon, so only Dragon moves hit it hard. And slide carefully on the ice!']
    ],
    'sootopolis.juan-win': [
      ['say', 'The Rain Badge is yours. It is the last of Hoenn\'s eight badges.', JUAN],
      ['badge', 24],
      ['jingle', 'badge'],
      ['say', '{player} received the Rain Badge from Juan!'],
      ['say', 'With all eight Hoenn badges, every Pokémon will obey you, whatever its level.', JUAN],
      ['say', 'And take TM03, Water Pulse. Its ripples can leave your opponent confused.', JUAN],
      ['giveItem', 'tm03', 1],
      ['say', 'Now go east along Route 128 to Ever Grande City. The Pokémon League waits for you beyond Victory Road.', JUAN],
      // The end of the thirty-eighth chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(38) : G.Field.setFlag('chapter-38-done'))]
    ],
    'origin.wallace': [['js', wallace]],
    'skypillar.sealed': [['say', 'The tower\'s door is sealed shut. Old letters are carved deep into the stone.']],
    'skypillar.rayquaza': [['js', rayquaza]],
    'skypillar.rayquaza-battle': [['js', rayquazaBattle]]
  });
})();
