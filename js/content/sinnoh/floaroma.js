/* ============ floaroma.js — Route 204, the Ravaged Path, Floaroma Town, Route 205 and the Valley Windworks ============
 * Chapter 46. Route 204 runs north from Jubilife City (open with the Coal Badge, jubilife.js) through
 * the Ravaged Path, a small cave (a cracked rock hides an item), to Floaroma Town; on its north part
 * twins battle two at a time. Floaroma: a Pokémon Center, a Mart, the flower shop (two Oran Berries),
 * a house; a girl's father is trapped at the Valley Windworks by Team Galactic. In Floaroma Meadow two
 * grunts are taking a man's Honey: beat both and they drop the windworks' key (flag windworks-key).
 * Route 205 crosses the river east of town: south to the windworks (locked without the key), north to
 * Eterna Forest (eterna.js). Inside, a grunt and Commander Mars (Zubat 15, Purugly 17; flag
 * mars-windworks). Afterwards a wild Drifloon floats by the windworks every Friday, as in Platinum (chapter 73:
 * G.Clock.weekday(); met, it is gone until the next Friday, var drifloon-day; caught, for good, flag drifloon-caught;
 * flag drifloon-met as before). Floaroma Meadow's north path leads to Fuego Ironworks (fuego.js, chapter 73).
 * Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const GRUNT = { name: 'Team Galactic Grunt' }, MARS = { name: 'Mars' }, HONEY = { name: 'Honey Seller' };
  const SINNOH = { region: 'sinnoh' };
  // The Drifloon of the windworks: every Friday once Mars is gone, until it is caught (chapter 73). An old save whose
  // Pokédex already has Drifloon caught after meeting it there does not see it again.
  const DRIFLOON = S => G.Field.flag('mars-windworks') && G.Clock.weekday() === 5 && !G.Field.flag('drifloon-caught')
    && !(G.Field.flag('drifloon-met') && S.dex.caught[425]) && S.vars['drifloon-day'] !== G.Clock.day();
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 204 ----------------
  G.Maps.def(Object.assign({
    id: 'route204s', loc: 'sinnoh-route-204', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T##################T',
      'T########O#########T',
      'T........,,........T',
      'T........,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,........T',
      'T........,,....TT..T',
      'T........,,........T',
      'T........,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T........,,........T',
      'T..TT....,,S.......T',
      'T..TT....,,."""""..T',
      'T........,.."""""..T',
      'T........,.........T',
      'TTTTTTTTT,TTTTTTTTTT'
    ],
    connect: { south: { map: 'jubilife', offset: -8 } },
    warps: [{ x: 9, y: 2, to: 'ravaged-path', spot: 'south' }],
    spots: { cave: [9, 3, 'down'] },
    signs: { '11,17': 'Route 204. North: the Ravaged Path and Floaroma Town. South: Jubilife City.' },
    trainers: [
      { id: 'sarah', who: 'lass', cls: 'lass', name: 'Sarah', x: 8, y: 11, dir: 'right', sight: 1, team: [['bidoof', 8], ['starly', 8]],
        before: 'The road north was blocked for days. Now that it is open, I want a battle!',
        defeat: 'I waited all that time for this?',
        after: 'Past the cave is Floaroma Town. It smells of flowers all year round.' },
      { id: 'tyler', who: 'youngster', cls: 'youngster', name: 'Tyler', x: 11, y: 6, dir: 'left', sight: 1, team: [['wurmple', 7], ['shinx', 9]],
        before: 'My Wurmple might become a Beautifly or a Dustox. Help it grow!',
        defeat: 'It grew a little, I think.',
        after: 'Nobody knows which one a Wurmple will become. That is the fun of it!' }
    ],
    encounters: { walk: '@sinnoh-route-204-south-towards-jubilife-city' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'ravaged-path', loc: 'ravaged-path', rows: [
      '########################',
      '##################O#####',
      '####....##............##',
      '####....##.....~~~~~..##',
      '##......##.....~~~~~..##',
      '##......##.....~~~~~..##',
      '##......##.....~~~~~..##',
      '##....................##',
      '#######......##.......##',
      '##....k......##.......##',
      '##....#......##.......##',
      '##....#......##.......##',
      '#########O##############',
      '########################'
    ],
    warps: [{ x: 9, y: 12, to: 'route204s', spot: 'cave' }, { x: 18, y: 1, to: 'route204n', spot: 'cave' }],
    spots: { south: [9, 11, 'up'], north: [18, 2, 'down'] },
    npcs: [{ id: 'hiker', who: 'hiker', x: 11, y: 4, move: 'look',
             say: 'This tunnel was dug to carry flowers from Floaroma to the city. Now it is mostly Zubat.' }],
    items: [{ x: 3, y: 10, item: 'tm39', flag: 'ravaged-path-tm39' }],
    encounters: { walk: '@ravaged-path-area', water: '@ravaged-path-area' }
  }, CAVE));

  G.Maps.def(Object.assign({
    id: 'route204n', loc: 'sinnoh-route-204', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTT,,TTTTTTTTT',
      'T........,,........T',
      'T."""""".,,........T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T........,,."""""".T',
      'T...TT...,,........T',
      'T........,,........T',
      'T."""""..,,..TT....T',
      'T."""""..,,..TT....T',
      'T."""""..,,........T',
      'T."""""..,,........T',
      'T."""""..,,..""""".T',
      'T........,,..""""".T',
      'T........,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,........T',
      'T."""""..,,S.......T',
      'T........,,........T',
      'T########O#########T',
      'T##################T',
      'TTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'floaroma', offset: -5 } },
    warps: [{ x: 9, y: 21, to: 'ravaged-path', spot: 'north' }],
    spots: { cave: [9, 20, 'up'] },
    signs: { '11,19': 'Route 204. North: Floaroma Town. South: the Ravaged Path.' },
    trainers: [
      { id: 'liv-liz', who: 'twin', cls: 'twins', name: 'Liv & Liz', x: 11, y: 9, dir: 'left', sight: 1, double: true,
        partner: { who: 'twin', x: 12, y: 9 }, team: [['pachirisu', 9], ['pachirisu', 9]],
        before: 'We are twins, and so are our Pachirisu! Two against two!',
        defeat: 'Two of us, and we still lost...',
        after: 'In a double battle, pick a move that hits both foes at once. We learned that the hard way.' },
      { id: 'jeff', who: 'camper', cls: 'camper', name: 'Jeff', x: 8, y: 14, dir: 'right', sight: 1, team: [['budew', 9], ['bidoof', 10]],
        before: 'I am camping by the flowers tonight. First, a battle!',
        defeat: 'Time to pitch my tent...',
        after: 'Budew close up at night and open again in the morning sun.' }
    ],
    encounters: { walk: '@sinnoh-route-204-north-towards-floaroma-town' }
  }, SINNOH));

  // ---------------- Floaroma Town ----------------
  G.Maps.def(Object.assign({
    id: 'floaroma', loc: 'floaroma-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT',
      'T.............,,.............T',
      'T.............,,.............T',
      'T...CCCCC.....,,...HHHH......T',
      'T...CCCCC.MMMM,,...HHHH.ffff.T',
      'T...CCCCC.MMMM,,...HDHH.ffff.T',
      'T...CCDCC.MDMM,,....,...ffff.T',
      'T.....,....,..,,.fffff..ffff.T',
      'T.fff.,....,..,,.fffff..ffff.T',
      'T.fff.,....,.S,,.fffff.......T',
      'T.....,....,..,,....,........T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.............,,.............T',
      'T.ffffff......,,.............T',
      'T.ffffff......,,....HHHH.....T',
      'T.ffffffffff..,,....HHHH.....T',
      'T.ffffffffff..,,....HDHH.....T',
      'T.ffffffffff..,,,,,,,,.......T',
      'T.ffffffffff..,,........ffff.T',
      'T.ffffffffff..,,........ffff.T',
      'T.............,,........ffff.T',
      'T.............,,.............T',
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route204n', offset: 5 }, north: { map: 'floaroma-meadow', offset: 3 }, east: { map: 'route205s', offset: 0 } },
    warps: [
      { x: 6, y: 6, to: 'floaroma-center', spot: 'door' },
      { x: 11, y: 6, to: 'floaroma-mart', spot: 'door' },
      { x: 20, y: 5, to: 'floaroma-shop', spot: 'door' },
      { x: 21, y: 17, to: 'floaroma-house', spot: 'door' }
    ],
    spots: { 'center-door': [6, 7, 'down'], 'mart-door': [11, 7, 'down'], 'shop-door': [20, 6, 'down'], 'house-door': [21, 18, 'down'] },
    signs: { '13,9': 'Floaroma Town. A town of flowers, where the air always smells sweet.' },
    npcs: [
      { id: 'girl', who: 'lass', x: 8, y: 10, dir: 'down', script: 'floaroma.girl' },
      { id: 'man', who: 'gentleman', x: 22, y: 13, move: 'look',
        say: 'North of town is Floaroma Meadow, where the man who sells Honey keeps his flowers.' },
      { id: 'boy', who: 'youngster', x: 5, y: 17, move: 'wander', r: 2,
        say: 'The flowers here bloom all year. Grandpa says it is because the people who live here care for them so much.' }
    ]
  }, SINNOH));

  G.Maps.center('floaroma-center', {
    loc: 'floaroma-town', exit: { map: 'floaroma', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'East of town, Route 205 crosses the river. Its south side leads to the Valley Windworks.' }]
  }).region = 'sinnoh';

  G.Maps.mart('floaroma-mart', {
    loc: 'floaroma-town', exit: { map: 'floaroma', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'escape-rope', 'repel'],
    npcs: [{ id: 'shopper', who: 'granny', x: 6, y: 5, move: 'look',
             say: 'Eterna Forest is long and dark. Take plenty of Potions, dear.' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'floaroma-shop', loc: 'floaroma-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'pp_pp_pp_pp', '___________', '_p_______p_', '___________', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'floaroma', spot: 'shop-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'florist', who: 'beauty', x: 5, y: 3, dir: 'down', script: 'floaroma.florist' },
           { id: 'girl', who: 'lass', x: 8, y: 5, move: 'look',
             say: 'Berries grow on plants, too. Here we grow them for Trainers and their Pokémon.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'floaroma-house', loc: 'floaroma-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'floaroma', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'oldman', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'Long ago this land was all bare rock. One person planted a single flower, and Floaroma grew from it.' }]
  }, SINNOH));

  // ---------------- Floaroma Meadow ----------------
  G.Maps.def(Object.assign({
    id: 'floaroma-meadow', loc: 'floaroma-meadow', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTT,,TTTTTTTTTTT',
      'TffffffffffffffffffffffT',
      'Tfffffff........fffffffT',
      'Tfffffff........fffffffT',
      'Tfffffff........fffffffT',
      'Tffffffffff,,ffffffffffT',
      'Tff....ffff,,ffffffffffT',
      'Tff....ffff,,ffff....ffT',
      'Tff....ffff,,ffff....ffT',
      'Tff....ffff,,ffff....ffT',
      'Tffffffffff,,ffff....ffT',
      'Tffffffffff,,ffffffffffT',
      'Tffffffffff,,ffffffffffT',
      'Tffffffffff,,ffffffffffT',
      'Tffffffffff,,ffffffffffT',
      'Tffffffffff,,SfffffffffT',
      'Tffffffffff,,ffffffffffT',
      'TTTTTTTTTTT,,TTTTTTTTTTT'
    ],
    connect: { south: { map: 'floaroma', offset: -3 }, north: { map: 'fuego-ironworks', offset: -3 } },
    signs: { '13,15': 'Floaroma Meadow. Please do not pick the flowers.' },
    triggers: [{ x: 1, y: 7, w: 22, h: 1, if: '!windworks-key', script: 'floaroma.meadow' }],
    npcs: [
      { id: 'honey', who: 'gentleman', x: 12, y: 2, dir: 'down', script: 'floaroma.honey' },
      { id: 'grunt1', who: 'galactic', x: 10, y: 3, dir: 'right', if: '!windworks-key', script: 'floaroma.meadow' },
      { id: 'grunt2', who: 'galactic', x: 14, y: 3, dir: 'left', if: '!windworks-key', script: 'floaroma.meadow' }
    ]
  }, SINNOH));

  // ---------------- Route 205, south ----------------
  G.Maps.def(Object.assign({
    id: 'route205s', loc: 'sinnoh-route-205', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTT,,TTTTTT',
      'T.............~~~.........,,.....T',
      'T.............~~~.........,,.....T',
      'T.""""""".....~~~.."""""..,,.....T',
      'T.""""""".TT..~~~.."""""..,,.""".T',
      'T.""""""".TT..~~~.."""""..,,.""".T',
      'T.""""""".....~~~.."""""..,,.""".T',
      'T.""""""".....~~~.."""""..,,.""".T',
      'T.............~~~.."""""..,,.""".T',
      'T.............~~~.........,,.""".T',
      'T.............~~~........S,,.....T',
      ',,,,,,,,,,,,,,===,,,,,,,,,,,.....T',
      ',,,,,,,,,,,,,,===,,,,,,,,,,,.....T',
      'T.............~~~.........,,.....T',
      'T.."""""""....~~~.."""""".,,.TT..T',
      'T.."""""""....~~~.."""""".,,.TT..T',
      'T.."""""""....~~~.."""""".,,.....T',
      'T.."""""""....~~~.."""""".,,.....T',
      'T.............~~~.........,,.....T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTT,,TTTTTT'
    ],
    connect: { west: { map: 'floaroma', offset: 0 }, north: { map: 'eterna-forest', offset: 21 }, south: { map: 'valley-windworks', offset: 14 } },
    signs: { '25,10': 'Route 205. North: Eterna Forest. South: the Valley Windworks. West: Floaroma Town.' },
    trainers: [
      { id: 'erick', who: 'fisherman', cls: 'fisherman', name: 'Erick', x: 13, y: 10, dir: 'down', sight: 1, team: [['magikarp', 12], ['shellos', 13]],
        before: 'Shh! You will scare the fish! ...Oh well, they are gone. Battle me instead!',
        defeat: 'Even the Magikarp swam away...',
        after: 'The Shellos in this river are pink. In the east of Sinnoh they are blue, they say.' },
      { id: 'daniel', who: 'hiker', cls: 'hiker', name: 'Daniel', x: 20, y: 13, dir: 'up', sight: 2, team: [['geodude', 13], ['onix', 14]],
        before: 'I hiked here all the way from Oreburgh. My legs are tired, but my Pokémon are not!',
        defeat: 'Now my Pokémon are tired too.',
        after: 'The windworks to the south makes power from the wind that blows down the valley.' },
      { id: 'siena', who: 'lass', cls: 'picnicker', name: 'Siena', x: 25, y: 5, dir: 'right', sight: 1, team: [['buneary', 14], ['shellos', 14]],
        before: 'A picnic by the river, and then a battle. Perfect day!',
        defeat: 'Well, the picnic was nice.',
        after: 'People say Eterna Forest is full of Trainers. Be careful in there.' }
    ],
    encounters: { walk: '@sinnoh-route-205-south-towards-floaroma-town', water: '@sinnoh-route-205-south-towards-floaroma-town' }
  }, SINNOH));

  // ---------------- Valley Windworks ----------------
  G.Maps.def(Object.assign({
    id: 'valley-windworks', loc: 'valley-windworks', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTT,,TTTTTTTTTTTT',
      'T...........,,.....~~~~~~T',
      'T...........,,.....~~~~~~T',
      'T."""""...BBBBBB...~~~~~~T',
      'T."""""...BBBBBB..~~~~~~~T',
      'T."""""...BBBBBB..~~~~~~~T',
      'T."""""...BBDBBB..~~~~~~~T',
      'T.""""".....,,....~~~~~~~T',
      'T...........,,....~~~~~~~T',
      'T...........,,S...~~~~~~~T',
      'T...........,,....~~~~~~~T',
      'T."""""""...,,....~~~~~~~T',
      'T."""""""...,,."""~~~~~~~T',
      'T."""""""...,,."""~~~~~~~T',
      'T."""""""...,,.""".~~~~~~T',
      'T."""""""...,,.""".~~~~~~T',
      'T...........,,.....~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'route205s', offset: -14 } },
    warps: [{ x: 12, y: 6, to: 'windworks-inside', spot: 'door', if: 'windworks-key', locked: 'windworks.locked' }],
    spots: { door: [12, 7, 'down'] },
    signs: { '14,9': 'Valley Windworks. The wind of the valley turns into power for all of Sinnoh.' },
    npcs: [
      // After Team Galactic leaves, a Drifloon floats by (once).
      { id: 'drifloon', who: 'drifloon', mon: 'drifloon', x: 16, y: 8, dir: 'down', fixed: true, if: DRIFLOON, script: 'windworks.drifloon' }
    ],
    trainers: [
      { id: 'grunt-door', who: 'galactic', cls: 'team-galactic', name: '', x: 13, y: 8, dir: 'down', sight: 3, if: '!mars-windworks', team: [['zubat', 12], ['glameow', 13]],
        before: 'This windworks belongs to Team Galactic now. Go home, kid!',
        defeat: 'Hey! That was not supposed to happen!',
        after: 'Even if you get in, the Commander will deal with you.' }
    ],
    encounters: { walk: '@valley-windworks-area', water: '@valley-windworks-area' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'windworks-inside', loc: 'valley-windworks', tileset: 'indoor', palette: 'lab', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'jj+++++++++jj', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 9, to: 'valley-windworks', spot: 'door' }],
    spots: { door: [6, 9, 'up'] },
    npcs: [{ id: 'dad', who: 'engineer', x: 10, y: 3, dir: 'down', script: 'windworks.dad' }],
    trainers: [
      { id: 'grunt-in', who: 'galactic', cls: 'team-galactic', name: '', x: 3, y: 6, dir: 'right', sight: 3, if: '!mars-windworks', team: [['stunky', 14]],
        before: 'An intruder? The Commander will not be happy. I will stop you right here!',
        defeat: 'I am going to be in so much trouble...',
        after: 'Commander Mars is not someone you want to make angry.' },
      { id: 'mars', who: 'mars', cls: 'galactic-commander', name: 'Mars', x: 6, y: 3, dir: 'down', sight: 0, ai: 'leader', if: '!mars-windworks',
        items: { 'super-potion': 1 },
        team: [['zubat', 15, ['leech-life', 'supersonic', 'astonish', 'bite']], ['purugly', 17, ['fake-out', 'scratch', 'fury-swipes', 'charm']]],
        before: 'Huh? A kid made it all the way in here? I am Mars, one of Team Galactic\'s Commanders. We are borrowing this place\'s power for a little project. Want to stop me? Go ahead and try!',
        defeat: 'Ugh! I lost to a kid?',
        win: 'windworks.mars-win' }
    ]
  }, SINNOH));

  // ---------------- Team Galactic in Floaroma Meadow ----------------
  async function meadow(h) {
    const F = G.Field;
    if (F.flag('windworks-key')) return;
    h.emote('grunt1', '!');
    await h.say(T('Come on, old man! Hand over all your Honey. Team Galactic needs it!'), GRUNT);
    await h.say(T('{player}! Help! These people want every jar of Honey I have!'), HONEY);
    h.face('grunt1', 'down'); h.face('grunt2', 'down');
    await h.say(T('Who is this, a Trainer? Get lost, kid! ...No? Then you can battle us both, one after the other!'), GRUNT);
    for (const [id, team] of [['grunt-meadow1', [['stunky', 11]]], ['grunt-meadow2', [['glameow', 12]]]]) {
      const out = await h.battle({ id, who: 'galactic', cls: 'team-galactic', name: '', team }, {});
      if (out !== 'win') return;
    }
    await h.say(T('This kid is too strong! Back to the windworks, quick!'), GRUNT);
    await h.fade('out', 0.4);
    h.hide('grunt1'); h.hide('grunt2');
    await h.fade('in', 0.4);
    const j = h.jingle('item');
    await h.say(T('In their hurry, the grunts dropped a key. It is the key to the Valley Windworks!'));
    await j;
    F.setFlag('windworks-key');
    await h.say(T('Thank you! They wanted my Honey to lure Pokémon. And they were talking about the windworks, south-east of town across Route 205.'), HONEY);
  }

  G.Script.def({
    'floaroma.meadow': [['js', meadow]],
    'floaroma.honey': [
      ['if', 'windworks-key', [
        ['say', 'Pokémon love sweet Honey. Spread some on a tree and they come from all around!', HONEY]
      ], [
        ['say', 'Please, help me! Those two will not leave me alone!', HONEY]
      ]]
    ],
    'floaroma.girl': [
      ['if', 'mars-windworks', [
        ['say', 'My dad came home from the windworks! He says a Trainer chased the bad people away. Was it you? Thank you!']
      ], [
        ['say', 'My dad works at the Valley Windworks. People in strange space suits took it over, and now he cannot come home...'],
        ['say', 'I saw some of them in Floaroma Meadow, north of town, too.']
      ]]
    ],
    'floaroma.florist': [
      ['if', 'floaroma-berries', [
        ['say', 'An Oran Berry heals a Pokémon a little when its HP runs low. Let your Pokémon hold one!']
      ], [
        ['say', 'Welcome to our flower shop! We grow Berries as well as flowers.'],
        ['say', 'A Trainer passing through? Then take these, with our compliments.'],
        ['giveItem', 'oran-berry', 2],
        ['setFlag', 'floaroma-berries']
      ]]
    ],
    'windworks.locked': [
      ['say', 'The door is locked. A Team Galactic sign says: "Keep out!"']
    ],
    'windworks.dad': [
      ['if', 'mars-windworks', [
        ['say', 'Thank you! I am going home to my daughter in Floaroma. She must be so worried.']
      ], [
        ['say', 'Help! Those people in strange suits locked me in. They want the windworks\' power for something.']
      ]]
    ],
    'windworks.mars-win': [
      ['say', 'Hmph. So you are the real thing. Fine: we got the readings we came for anyway.', MARS],
      ['say', 'Team Galactic is going to make a brand-new world, and nobody will get in our way. Bye-bye!', MARS],
      ['fade', 'out', 0.4], ['setFlag', 'mars-windworks'], ['fade', 'in', 0.4],
      ['say', 'Team Galactic left the Valley Windworks.']
    ],
    'windworks.drifloon': [['js', async h => {
      const F = G.Field;
      await h.say(T('A Drifloon is drifting by the windworks, riding the valley wind...'));
      await h.wild('drifloon', 15, {});
      const r = F.lastBattle;
      F.setFlag('drifloon-met');
      if (r === 'caught') F.setFlag('drifloon-caught');
      else if (r !== 'run' && r !== 'lose') { F.save.vars['drifloon-day'] = G.Clock.day(); h.hide('drifloon'); }   // back next Friday
    }]]
  });
})();
