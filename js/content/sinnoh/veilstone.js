/* ============ veilstone.js — Route 215, Veilstone City and Maylene's Gym ============
 * Chapter 48, the end of the chapter. Route 215, east of Route 210 (solaceon.js): it rains all the time
 * (`storm: true`: rain on the map and in its battles); Black Belts, a Battle Girl, a Cool Trainer.
 * Veilstone City, walled in by cliffs and dotted with meteorites: a Pokémon Center, the Veilstone Store
 * (a Mart with more on its shelves), a house and Maylene's Gym; Team Galactic's HQ and warehouse (galactichq.js) and the
 * Game Corner are closed; Route 214 to the south (lakefront.js) opens with the Cobble Badge. Maylene uses Fighting types
 * (Meditite, Machoke, Lucario); beating her gives the Cobble Badge (badge 27, the fourth Sinnoh badge:
 * Pokémon up to Lv. 40 obey in Sinnoh) and TM60 (Drain Punch), then `ending(48)`. Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const MAYLENE = { name: 'Maylene' };
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 215 ----------------
  G.Maps.def(Object.assign({
    id: 'route215', loc: 'sinnoh-route-215', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    storm: true,
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................................T',
      'T.""""""".###........."""""""..""""""..T',
      'T.""""""".###........."""""""..""""""..T',
      'T.""""""".###........."""""""..""""""..T',
      'T.""""""".###........."""""""..........T',
      'T.............vvvvv..................S.T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................................T',
      'T..""""""...""""""""###........""""""".T',
      'T..""""""...""""""""###........""""""".T',
      'T..""""""...""""""""###........""""""".T',
      'T..""""""...""""""""###........""""""".T',
      'T......................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'route210s', offset: -5 }, east: { map: 'veilstone', offset: -6 } },
    signs: { '37,6': 'Route 215. East: Veilstone City. West: Route 210.' },
    trainers: [
      { id: 'kirby', who: 'blackbelt', cls: 'black-belt', name: 'Kirby', x: 10, y: 6, dir: 'down', sight: 1, team: [['machop', 23], ['machoke', 25]],
        before: 'Rain or shine, I train! Today it is rain. As always!',
        defeat: 'I am soaked and beaten.',
        after: 'Maylene trains in this rain too. She says it toughens the spirit.' },
      { id: 'ella', who: 'battlegirl', cls: 'battle-girl', name: 'Ella', x: 24, y: 9, dir: 'up', sight: 1, team: [['meditite', 25]],
        before: 'My Meditite meditates under the falling rain. Its focus is perfect!',
        defeat: 'Our focus slipped.',
        after: 'Meditite are part Psychic, so Psychic moves only hit them normally. Flying moves are what they fear.' },
      { id: 'dennis', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Dennis', x: 30, y: 6, dir: 'down', sight: 1, team: [['staravia', 25], ['ponyta', 25], ['luxio', 25]],
        before: 'A Cool Trainer never lets a little rain stop a battle!',
        defeat: 'Washed out...',
        after: 'Fire moves are weaker in the rain, and Water moves are stronger. Use that!' },
      { id: 'ricky', who: 'blackbelt', cls: 'black-belt', name: 'Ricky', x: 33, y: 9, dir: 'up', sight: 1, team: [['machoke', 24], ['meditite', 24]],
        before: 'Veilstone is just ahead. Get past my fists first!',
        defeat: 'My fists are tired.',
        after: 'Maylene\'s Lucario reads the aura of its foes. You cannot hide anything from it.' }
    ],
    encounters: { walk: '@sinnoh-route-215-area' }
  }, SINNOH));

  // ---------------- Veilstone City ----------------
  G.Maps.def(Object.assign({
    id: 'veilstone', loc: 'veilstone-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T##............................####T',
      'T##..............,,............####T',
      'T.......EEEEEEEE.,,....GGGGGG.HHHH.T',
      'T.CCCCC.EEEEEEEE.,,....GGGGGG.HHHH.T',
      'T.CCCCC.EEEEEEEE.,,....GGGGGG.HDHH.T',
      'T.CCCCC.EEEEEEEE.,,....GGGGGGS.....T',
      'T.CCDCC.EEEDEEEE.,,....GGDGGG......T',
      'T...,......,.....,,......,.........T',
      'T...,......,.....,,.##...,......###T',
      'T...,......,.....,,.##S..,......###T',
      'T...,......,...S.,,......,......###T',
      'T...,......,.....,,......,.........T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
      'T................,,................T',
      'T...........##...,,................T',
      'T..BBBBBB...##S..,,....YYYYYYYY....T',
      'T..BBBBBB........,,....YYYYYYYY....T',
      'T..BBBBBB........,,....YYYYYYYY....T',
      'T..BBDBBB........,,....YYYYYYYY....T',
      'T....,.....HHHH..,,....YYYYYYYY....T',
      'T....,.....HHHH..,,....YYYDYYYY....T',
      'T....,.....HDHH..,,,,,,,,,,........T',
      'T....,......,,,,,,,................T',
      'T....,,,,,,,,,,,,,,................T',
      'T................,,................T',
      'TTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'route215', offset: 6 }, south: { map: 'route214', offset: 3 } },
    warps: [
      { x: 4, y: 7, to: 'veilstone-center', spot: 'door' },
      { x: 11, y: 7, to: 'veilstone-store', spot: 'door' },
      { x: 25, y: 7, to: 'veilstone-gym', spot: 'door' },
      { x: 26, y: 22, to: 'galactic-hq-1f', spot: 'door', if: 'has:galactic-key', locked: 'veilstone.galactic-hq' },
      { x: 31, y: 5, to: 'galactic-warehouse', spot: 'door', if: 'looker-key', locked: 'veilstone.warehouse' },
      { x: 5, y: 20, locked: 'veilstone.game-corner' },
      { x: 12, y: 23, to: 'veilstone-house', spot: 'door' }
    ],
    spots: { 'center-door': [4, 8, 'down'], 'store-door': [11, 8, 'down'], 'gym-door': [25, 8, 'down'], 'house-door': [12, 24, 'down'],
             'warehouse-door': [31, 6, 'down'], 'hq-door': [26, 23, 'down'] },
    signs: {
      '15,11': 'Veilstone City. A city carved out of the rock, where stones fell from the sky.',
      '29,6': 'Team Galactic Warehouse. Authorized members only.',
      '14,17': 'A meteorite. Long ago stones fell from the sky here, and the city grew up around them.',
      '22,10': 'A meteorite. Some say these stones came from a world beyond our own.'
    },
    npcs: [
      // Route 214 opens with the Cobble Badge (chapter 49); Team Galactic's HQ is guarded until chapter 54.
      { id: 'south', who: 'hiker', x: 17, y: 26, dir: 'up', if: '!badge:27',
        say: 'Rocks slid onto Route 214 in the rain. The way south is closed for now.' },
      { id: 'grunt', who: 'galactic', x: 26, y: 23, dir: 'down', if: '!looker-key', script: 'veilstone.grunt' },
      { id: 'looker', who: 'looker', x: 26, y: 23, dir: 'down', if: 'scripted' },
      { id: 'lady', who: 'beauty', x: 28, y: 14, move: 'wander', r: 2,
        say: 'Team Galactic built their headquarters right here in town. Nobody knows what they do in there.' },
      { id: 'boy', who: 'youngster', x: 9, y: 11, move: 'look',
        say: 'Maylene trains in the mountains around the city. She is strong, but very kind.' }
    ]
  }, SINNOH));

  G.Maps.center('veilstone-center', {
    loc: 'veilstone-city', exit: { map: 'veilstone', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'blackbelt', x: 3, y: 5, move: 'look',
             say: 'Fighting types hit hard, but Flying and Psychic moves send them flying. Remember that in the Gym.' }]
  }).region = 'sinnoh';

  G.Maps.mart('veilstone-store', {
    loc: 'veilstone-city', exit: { map: 'veilstone', spot: 'store-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'revive', 'antidote', 'paralyze-heal', 'awakening',
            'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel', 'max-repel', 'x-attack', 'dire-hit', 'guard-spec'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'The Veilstone Store has everything a Trainer needs, all on one floor!' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'veilstone-house', loc: 'veilstone-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'veilstone', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'oldman', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'When I was young, the meteorites glowed on clear nights. Or maybe I only dreamed it.' }]
  }, SINNOH));

  // ---------------- Maylene's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'veilstone-gym', loc: 'veilstone-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'veilstone', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'veilstone.gym-guide' }],
    trainers: [
      { id: 'colby', who: 'blackbelt', cls: 'black-belt', name: 'Colby', x: 3, y: 9, dir: 'right', sight: 3, team: [['machoke', 27], ['meditite', 26]],
        before: 'In this Gym we train body and spirit. Show me yours!',
        defeat: 'My spirit needs more training.',
        after: 'Maylene once broke a boulder with one punch. I have seen it!' },
      { id: 'darcy', who: 'battlegirl', cls: 'battle-girl', name: 'Darcy', x: 9, y: 8, dir: 'left', sight: 3, team: [['croagunk', 27], ['meditite', 27]],
        before: 'I train every day with Maylene. Let me see what you have got!',
        defeat: 'You have got a lot!',
        after: 'Croagunk is Poison and Fighting. Psychic moves hit it four times as hard!' },
      { id: 'jeffery', who: 'blackbelt', cls: 'black-belt', name: 'Jeffery', x: 3, y: 5, dir: 'right', sight: 3, team: [['machop', 28], ['machoke', 28]],
        before: 'Hiyah! A battle is the best training there is!',
        defeat: 'Hiyah... ow.',
        after: 'Flying moves come from above. Fighting types hate that.' },
      { id: 'kelsey', who: 'battlegirl', cls: 'battle-girl', name: 'Kelsey', x: 9, y: 4, dir: 'left', sight: 2, team: [['riolu', 28], ['meditite', 29]],
        before: 'Maylene is right behind me. You will have to beat me first!',
        defeat: 'Go on. She is ready for you.',
        after: 'Riolu can sense feelings. Mine knew I was going to lose before I did.' },
      { id: 'maylene', who: 'maylene', cls: 'leader', name: 'Maylene', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 2 },
        team: [['meditite', 27, ['drain-punch', 'confusion', 'meditate', 'fake-out']],
               ['machoke', 28, ['karate-chop', 'strength', 'focus-energy', 'rock-tomb']],
               ['lucario', 29, ['drain-punch', 'metal-claw', 'force-palm', 'bone-rush']]],
        before: 'Welcome to the Veilstone Gym. I am Maylene, the Gym Leader. I train with my Pokémon, side by side, every single day. A Champion of three regions... Then I will give you everything I have!',
        defeat: 'I lost... But I am not sad. That battle made me stronger, too.',
        win: 'veilstone.maylene-win',
        afterScript: [['say', 'The next Gym is in Pastoria City, south past Route 214. Its Leader, Crasher Wake, splashes around with Water types!', MAYLENE]] }
    ]
  }, SINNOH));

  G.Script.def({
    'veilstone.galactic-hq': [['say', 'The door is locked. A sign says: "Team Galactic HQ. Members only."']],
    'veilstone.warehouse': [['say', 'The door of the warehouse is locked.']],
    'veilstone.grunt': [['if', 'jupiter-acuity', [['call', 'galactic.key-drop']], [['say', 'This is the headquarters of Team Galactic. Members only. Go away, kid!']]]],
    'veilstone.game-corner': [['say', 'The Game Corner. A sign says: "Closed for renovations."']],
    'veilstone.gym-guide': [
      ['say', 'Hey, Champion! Maylene uses Fighting-type Pokémon.'],
      ['say', 'Flying and Psychic moves work great on them. And their Fighting moves cannot touch Ghost-type Pokémon!'],
      ['say', 'Watch out for her Lucario: it is part Steel, so Fire, Fighting and Ground moves are what you want. Up to level 35, your Pokémon from home will listen to you here.']
    ],
    'veilstone.maylene-win': [
      ['say', 'This is the Cobble Badge. You earned it, fair and square.', MAYLENE],
      ['badge', 27],
      ['jingle', 'badge'],
      ['say', '{player} received the Cobble Badge from Maylene!'],
      ['say', 'With it, Pokémon up to level 40 will obey you here in Sinnoh, even ones from other regions.', MAYLENE],
      ['say', 'And take this. TM60 is Drain Punch: it hits the foe and heals the user by half the damage.', MAYLENE],
      ['giveItem', 'tm60', 1],
      // The end of the forty-eighth chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(48) : G.Field.setFlag('chapter-48-done'))]
    ]
  });
})();
