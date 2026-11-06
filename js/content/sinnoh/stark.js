/* ============ stark.js — Route 226, Route 227 and Stark Mountain ============
 * Chapter 62. East of the Survival Area, Route 226 runs to the sea (Surf), and Route 227 climbs north over ash and old lava
 * to Stark Mountain. Where Platinum needs Rock Climb there are Surf, Rock Smash and Strength. Inside the cave Buck, Flint's
 * younger brother, comes along (flag buck-along): he walks behind you (the map's `companion`), fights beside you against the
 * pairs of Trainers (`ally`, a multi battle) and heals the team after each battle (`afterBattle`). In the deepest room Mars and
 * Jupiter fight you and Buck, then leave Team Galactic. Charon wants the Magma Stone to wake Heatran; one of his grunts is
 * Looker, who arrests him (flag charon-caught). Buck takes the stone home to the Survival Area; once you have seen him there
 * (flag magma-stone-back) Heatran waits in the deepest room at Platinum's level. Caught or beaten: `ending(62)`.
 * Platinum's Trainers and wild Pokémon. Left out: the island house and its trade, the Dowsing Machine's items, the Lagging Tail,
 * Life Orb, Iron Ball, Flame Plate and Yellow Shard (not in the game).
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const BUCK = { name: 'Buck' }, MARS = { name: 'Mars' }, JUPITER = { name: 'Jupiter' }, CHARON = { name: 'Charon' }, LOOKER = { name: 'Looker' }, GRUNT = { name: 'Team Galactic Grunt' };
  const BUCK_TEAM = [['claydol', 63, ['psychic', 'ancient-power', 'light-screen', 'reflect']]];
  // Mars and Jupiter as one foe: their teams alternate, and each refills their own slot (rules.tag). Exported for the balance test.
  const COMMANDERS = { id: 'commanders', cls: 'galactic-commanders', name: 'Mars and Jupiter', who: 'mars', ai: 'leader', double: true,
    team: [['bronzong', 58, ['gyro-ball', 'extrasensory', 'light-screen', 'confuse-ray']], ['bronzong', 58, ['gyro-ball', 'extrasensory', 'rock-slide', 'reflect']],
           ['golbat', 58, ['air-cutter', 'bite', 'poison-fang', 'confuse-ray']], ['golbat', 58, ['sludge-bomb', 'air-cutter', 'giga-drain', 'mean-look']],
           ['purugly', 60, ['slash', 'shadow-claw', 'aerial-ace', 'hypnosis'], 'sitrus-berry'], ['skuntank', 60, ['night-slash', 'poison-jab', 'flamethrower', 'smokescreen'], 'sitrus-berry']] };
  const WITH_BUCK = { if: 'buck-along', who: 'buck', name: 'Buck', say: 'Stay close! This mountain is hot, but my Claydol does not mind, and neither do I.' };

  // ---------------- Route 226 ----------------
  G.Maps.def(Object.assign({
    id: 'route226', loc: 'sinnoh-sea-route-226', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT,,TTTT',
      'T.........####................:~~~~~~~~~~~~~~~~:..,,...T',
      'T.""""""".####.""""""".######.:~~~~~~~~~~~~~~~~:..,,...T',
      'T.""""""".####.""""""".#....#.:~~~~~~~~~~~~~~~~:..,,.T.T',
      'T.""""""".####.""""""".#....#.:~~~~~~~~~~~~~~~~:..,,.T.T',
      'T.""""""".####.""""""".#....#.:~~~~~~::::~~~~~~:..,,...T',
      'T.""""""".####.""""""".#....#.:~~~~~~::::~~~~~~:..,,...T',
      'T.""""""".####.""""""".#....#.:~~~~~~::::~~~~~~:..,,...T',
      'T.""""""".####.""""""".##k###.:~~~~~~::::~~~~~~:..,,...T',
      'T.............................:~~~~~~~~~~~~~~~~:..,,...T',
      'T........T............T.......:~~~~~~~~~~~~~~~~:..,,...T',
      'T.S...........................:~~~~~~~~~~~~~~~~:.S,,...T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,:~~~~~~~~~~~~~~~~:,,,,...T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,:~~~~~~~~~~~~~~~~:,,,,...T',
      'T.............................:~~~~~~~~~~~~~~~~:.......T',
      'T........T............T.......:~~~~~~~~~~~~~~~~:"""""""T',
      'T."""""""......"""""""""""""..:~~~~~~~~~~~~~~~~:"""""""T',
      'T.""""""".####."""""""""""""..:~~~~~~~~~~~~~~~~:"""""""T',
      'T.""""""".####."""""""""""""..:~~~~~~~~~~~~~~~~:"""""""T',
      'T.""""""".####."""""""""""""..:~~~~~~~~~~~~~~~~:"""""""T',
      'T.""""""".####."""""""""""""..:~~~~~~~~~~~~~~~~:"""""""T',
      'T.""""""".####."""""""""""""..:~~~~~~~~~~~~~~~~:"""""""T',
      'T.........####................:~~~~~~~~~~~~~~~~:.......T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'survival-area', offset: 3 }, north: { map: 'route227', offset: 36 } },
    encounters: { walk: '@sinnoh-sea-route-226-area', water: '@sinnoh-sea-route-226-area' },
    signs: { '2,11': 'Route 226. East: the sea. Beyond it, the road to Stark Mountain.',
             '49,11': 'Route 226. North: Route 227 to Stark Mountain. West: the sea and the Survival Area.' },
    items: [{ x: 25, y: 5, item: 'carbos', flag: 'route226-carbos' }, { x: 38, y: 6, item: 'tm53', flag: 'route226-tm53' }],
    npcs: [{ id: 'hiker', who: 'hiker', x: 49, y: 3, move: 'look', say: 'See the smoke up north? That is Stark Mountain. People say it has not slept in a long time.' }],
    trainers: [
      { id: 'graham', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Graham', x: 14, y: 10, dir: 'down', sight: 3,
        before: 'The wind off the sea keeps me sharp. Let us see how sharp you are.',
        defeat: 'Not sharp enough, it seems.',
        after: 'Past this beach it is the sea, and after the sea, the volcano.',
        team: [['tyrogue', 55, ['tackle', 'helping-hand', 'fake-out', 'foresight']], ['hitmonchan', 59, ['mega-punch', 'detect', 'counter', 'close-combat']]] },
      { id: 'geneva', who: 'birdkeeper', cls: 'bird-keeper', name: 'Geneva', x: 20, y: 15, dir: 'up', sight: 3,
        before: 'My birds can see a Trainer coming from the other shore.',
        defeat: 'They did not see that coming.',
        after: 'Nothing flies over the volcano for long. The air is too hot.',
        team: [['fearow', 55, ['agility', 'assurance', 'roost', 'drill-peck']], ['xatu', 57, ['future-sight', 'ominous-wind', 'power-swap', 'guard-swap']]] },
      { id: 'stanley', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Stanley', x: 27, y: 10, dir: 'down', sight: 3,
        before: 'Only a Dragon Tamer comes this far out. So what are you?',
        defeat: 'A Champion. I should have asked first.',
        after: 'The dragons on Stark Mountain do not like visitors.',
        team: [['dratini', 55, ['safeguard', 'dragon-dance', 'outrage', 'hyper-beam']], ['altaria', 57, ['dragon-breath', 'dragon-dance', 'refresh', 'dragon-pulse']]] },
      { id: 'lydia', who: 'swimmerf', cls: 'swimmer-f', name: 'Lydia', x: 34, y: 12, dir: 'left', sight: 3, swim: true,
        before: 'I swim here every day. The current is the only thing that ever beats me.',
        defeat: 'Well, now there are two things.',
        after: 'There is a little island out here. Nobody ever goes there.',
        team: [['marill', 54, ['double-edge', 'rain-dance', 'aqua-tail', 'hydro-pump']], ['spheal', 54, ['rest', 'snore', 'blizzard', 'sheer-cold']],
               ['wailmer', 54, ['amnesia', 'dive', 'bounce', 'hydro-pump']]] },
      { id: 'wade', who: 'swimmer', cls: 'swimmer', name: 'Wade', x: 43, y: 13, dir: 'left', sight: 5, swim: true,
        before: 'These waters are mine! Any swimmer who comes through has to battle me!',
        defeat: 'Ow! I should have let you through!',
        after: 'The far shore is close. Follow the road north from there.',
        team: [['carvanha', 53, ['crunch', 'aqua-jet', 'agility', 'take-down']], ['carvanha', 53, ['crunch', 'aqua-jet', 'agility', 'take-down']],
               ['sharpedo', 56, ['taunt', 'agility', 'skull-bash', 'night-slash']]] }
    ]
  }, SINNOH));

  // ---------------- Route 227 ----------------
  G.Maps.def(Object.assign({
    id: 'route227', loc: 'sinnoh-route-227', tileset: 'outdoor', palette: 'fiery', music: 'route', battleBg: 'cave', border: '#',
    rows: [
      '##############,,##############',
      '#.............,,.............#',
      '#..""""""""...,,...""""""""..#',
      '#..""""""""...,,...""""""""..#',
      '#..""""""""...,,...""""""""..#',
      '#..""""""""...,,...""""""""..#',
      '#..""""""""...,,...""""""""..#',
      '#..""""""""...,,...""""""""..#',
      '#..""""""""...,,...""""""""..#',
      '#..""""""""...,,.............#',
      '#..""""""""...,,.............#',
      '#############.,,.............#',
      '#############.,,,,,,,,,,.....#',
      '#............k,,,,,,,,,,.....#',
      '######################,,######',
      '######################,,######',
      '#....,,,,,,,,,,,,,,,,,,,.....#',
      '#....,,,,,,,,,,,,,,,,,,,.....#',
      '#....,,......................#',
      '#....,,.........###########..#',
      '#..".,,.""""""..#~~~~~~~~~#..#',
      '#..".,,.""""""..#~~~~~~~~~#..#',
      '#..".,,.""""""..#~~~~~~~~~#..#',
      '#..".,,.""""""..#~~~~~~~~~#..#',
      '#..".,,.""""""..#~~~~~~~~~#..#',
      '#..".,,.""""""..#~~~~~~~~~#..#',
      '#..".,,.""""""..###########..#',
      '#....,,......................#',
      '#####,,#######################',
      '#####,,#######################',
      '#....,,,,,,,,,,,.............#',
      '#....,,,,,,,,,,,.............#',
      '#.............,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.."""""""""..,,.."""""""""..#',
      '#.............,,.............#',
      '#.............,,S............#',
      '##############,,##############'
    ],
    connect: { north: { map: 'stark-mountain', offset: 0 }, south: { map: 'route226', offset: -36 } },
    encounters: { walk: '@sinnoh-route-227-area' },
    signs: { '16,42': 'Route 227. North: Stark Mountain. Mind the ash.' },
    items: [{ x: 2, y: 13, item: 'zinc', flag: 'route227-zinc' }, { x: 27, y: 22, item: 'charcoal', flag: 'route227-charcoal' },
            { x: 27, y: 3, item: 'max-elixir', flag: 'route227-elixir' }, { x: 2, y: 19, item: 'full-heal', flag: 'route227-heal' }],
    trainers: [
      { id: 'mikayla', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Mikayla', x: 13, y: 35, dir: 'right', sight: 2,
        before: 'Ash in my hair, ash in my shoes. I am in a bad mood, so battle me.',
        defeat: 'Now I have ash in my pride.',
        after: 'The ash falls every day. You stop noticing, more or less.',
        team: [['seviper', 56, ['night-slash', 'poison-fang', 'wring-out', 'glare']], ['persian', 56, ['night-slash', 'power-gem', 'feint-attack', 'fake-out']],
               ['absol', 56, ['night-slash', 'psycho-cut', 'slash', 'quick-attack']]] },
      { id: 'griffin', who: 'blackbelt', cls: 'black-belt', name: 'Griffin', x: 7, y: 23, dir: 'left', sight: 2,
        before: 'I walk this road barefoot, for the heat! Hyah!',
        defeat: 'My feet are fine. My pride is burned.',
        after: 'Do not step off the rock. That is not water down there.',
        team: [['breloom', 58, ['spore', 'mach-punch', 'seed-bomb', 'sky-uppercut']], ['medicham', 58, ['detect', 'psychic', 'high-jump-kick', 'ice-punch']]] },
      { id: 'felicia', who: 'rangerf', cls: 'ranger-f', name: 'Felicia', x: 14, y: 18, dir: 'up', sight: 2,
        before: 'A ranger watches this road for rockfalls, lava and lost Trainers. Which are you?',
        defeat: 'Not lost at all. My mistake.',
        after: 'People in uniform went up the mountain last week. They did not say why.',
        team: [['skiploom', 59, ['worry-seed', 'giga-drain', 'bounce', 'memento']], ['lopunny', 59, ['dizzy-punch', 'charm', 'bounce', 'healing-wish']]] },
      { id: 'saul', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Saul', x: 16, y: 6, dir: 'left', sight: 2,
        before: 'One Pokémon. One battle. That is all I ever need.',
        defeat: 'One was not enough.',
        after: 'Stark Mountain is just ahead. It is hotter inside than you think.',
        team: [['tauros', 61, ['thrash', 'zen-headbutt', 'swagger', 'payback']]] }
    ]
  }, SINNOH));

  // ---------------- Stark Mountain, outside ----------------
  G.Maps.def(Object.assign({
    id: 'stark-mountain', loc: 'stark-mountain', tileset: 'outdoor', palette: 'fiery', music: 'route', battleBg: 'cave', border: '#',
    fly: { spot: 'mouth' },
    rows: [
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '###############O################',
      '############..,,..##############',
      '############..,,..##############',
      '############..,,..##############',
      '############..,,..##############',
      '##..######....,,.....#.......###',
      '##..#~~~~#....,,.....#.......###',
      '##..######....,,.....####k######',
      '##."""""""""..,,..""""""""""..##',
      '##."""""""""..,,..""""""""""..##',
      '##."""""""""..,,..""""""""""..##',
      '##."""""""""..,,..""""""""""..##',
      '##."""""""""..,,..""""""""""..##',
      '##."""""""""..,,..""""""""""..##',
      '##."""""""""..,,..""""""""""..##',
      '##."""""""""..,,..""""""""""..##',
      '##............,,..............##',
      '##............,,..............##',
      '##############,,################'
    ],
    connect: { south: { map: 'route227', offset: 0 } },
    encounters: { walk: '@stark-mountain-area' },
    warps: [{ x: 15, y: 7, to: 'stark-entrance', spot: 'south' }],
    spots: { mouth: [15, 8, 'down'] },
    items: [{ x: 28, y: 13, item: 'ether', flag: 'stark-ether' }],
    trainers: [
      { id: 'darien', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Darien', x: 25, y: 12, dir: 'down', sight: 1,
        before: 'My Dragonite and I keep watch on this slope. Nobody gets up here by accident.',
        defeat: 'Then you came on purpose. Good.',
        after: 'If you are going in, take Full Heals. And respect the mountain.',
        team: [['dragonite', 60, ['dragon-rush', 'safeguard', 'dragon-dance', 'wing-attack']]] }
    ]
  }, SINNOH));

  // ---------------- Inside the mountain ----------------
  G.Maps.def(Object.assign({
    id: 'stark-entrance', loc: 'stark-mountain', tileset: 'outdoor', palette: 'fiery', music: 'cave', battleBg: 'cave', border: '#',
    cave: true, escape: true,
    rows: [
      '####################O#########',
      '####################.#########',
      '#########..................###',
      '###.....#..................###',
      '###.....#..................###',
      '###.....#..................###',
      '###.....######.............###',
      '###.....##~~~###..........####',
      '###.....########..........####',
      '###.............k.........####',
      '###.............k.........####',
      '###.............k.........####',
      '###.............##############',
      '###..............#~~~~~~######',
      '############..####~~~~~~######',
      '############..####~~~~~~######',
      '############..####~~~~~~######',
      '############..################',
      '###########........###########',
      '###########................###',
      '###########................###',
      '###########................###',
      '###########................###',
      '###########................###',
      '###########........###########',
      '##############O###############'
    ],
    encounters: { walk: '@stark-mountain-entrance' },
    warps: [{ x: 14, y: 25, to: 'stark-mountain', spot: 'mouth' }, { x: 20, y: 0, to: 'stark-inside', spot: 'south' }],
    spots: { south: [14, 24, 'up'], north: [20, 1, 'down'] },
    items: [{ x: 4, y: 4, item: 'pp-up', flag: 'stark-pp-up' }, { x: 25, y: 21, item: 'full-heal', flag: 'stark-full-heal' },
            { x: 25, y: 3, item: 'full-restore', flag: 'stark-full-restore' }, { x: 12, y: 23, item: 'escape-rope', flag: 'stark-rope' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'stark-inside', loc: 'stark-mountain', tileset: 'outdoor', palette: 'fiery', music: 'cave', battleBg: 'cave', border: '#',
    cave: true, escape: true,
    ally: { if: 'buck-along', name: 'Buck', team: BUCK_TEAM }, companion: WITH_BUCK,
    afterBattle: { if: 'buck-along', script: 'stark.heal' },
    rows: [
      '#######################O######################',
      '#######################.######################',
      '###........................................###',
      '###.......#######.............#######......###',
      '###.......#~~~~~#.............#~~~~~#......###',
      '###.......#~~~~~#.............#~~~~~#......###',
      '###.......#######.............#######......###',
      '###........................................###',
      '####..########################################',
      '####kk########################################',
      '####..########################################',
      '###........................................###',
      '###.................######.................###',
      '###.................#~~~~#.................###',
      '###.................#~~~~#.................###',
      '###.................######.................###',
      '###........................................###',
      '#######################################.######',
      '#######################################.######',
      '#######################################.######',
      '###........................................###',
      '###............################............###',
      '###............#~~~~~~~~~~~~~~#............###',
      '###............#~~~~~~~~~~~~~~#............###',
      '###............################............###',
      '###........................................###',
      '####..########################################',
      '####..########################################',
      '####..########################################',
      '###........................................###',
      '###........................................###',
      '###........................................###',
      '###........................................###',
      '###........................................###',
      '###........................................###',
      '#####################...######################',
      '#####################...######################',
      '######################O#######################'
    ],
    encounters: { walk: '@stark-mountain-inside' },
    warps: [{ x: 22, y: 37, to: 'stark-entrance', spot: 'north' }, { x: 23, y: 0, to: 'stark-deep', spot: 'south' }],
    spots: { south: [22, 36, 'up'], north: [23, 1, 'down'] },
    boulders: [{ id: 'corridor', x: 39, y: 18 }],
    triggers: [{ x: 21, y: 35, w: 3, h: 1, if: '!buck-met', script: 'stark.buck' }],
    items: [{ x: 41, y: 33, item: 'max-revive', flag: 'stark-max-revive' }, { x: 3, y: 34, item: 'tm50', flag: 'stark-tm50' },
            { x: 41, y: 21, item: 'rare-candy', flag: 'stark-candy' }, { x: 41, y: 12, item: 'max-elixir', flag: 'stark-elixir' },
            { x: 3, y: 12, item: 'nugget', flag: 'stark-nugget' }, { x: 41, y: 3, item: 'ultra-ball', flag: 'stark-ball' }],
    npcs: [{ id: 'buck', who: 'buck', x: 22, y: 32, dir: 'down', if: 'scripted' }],
    trainers: [
      { id: 'keenan-kassandra', who: 'cooltrainerm', cls: 'double-team', name: 'Keenan & Kassandra', x: 32, y: 31, dir: 'left', sight: 5, double: true, partner: { who: 'cooltrainer', x: 32, y: 32, dir: 'left' },
        before: 'Two of us, and this heat. Whoever you are, you picked a bad day!',
        defeat: 'It was a bad day for us instead!',
        after: 'With Buck beside you? No wonder.',
        team: [['primeape', 58, ['swagger', 'cross-chop', 'thrash', 'punishment']], ['jumpluff', 58, ['memento', 'giga-drain', 'toxic', 'bounce']],
               ['electabuzz', 58, ['discharge', 'thunderbolt', 'screech', 'thunder']], ['onix', 58, ['stone-edge', 'earthquake', 'iron-tail', 'dragon-breath']],
               ['banette', 59, ['sucker-punch', 'embargo', 'snatch', 'grudge']], ['ampharos', 59, ['thunder-punch', 'power-gem', 'signal-beam', 'fire-punch']]] },
      { id: 'skylar-natasha', who: 'cooltrainerm', cls: 'double-team', name: 'Skylar & Natasha', x: 12, y: 31, dir: 'right', sight: 5, double: true, partner: { who: 'cooltrainer', x: 12, y: 32, dir: 'right' },
        before: 'We came here to train as a pair. You two will do nicely!',
        defeat: 'You two work well together.',
        after: 'Buck comes here every day. He knows this place better than anyone.',
        team: [['loudred', 58, ['hyper-voice', 'bite', 'supersonic', 'screech']], ['wigglytuff', 58, ['hyper-voice', 'reflect', 'light-screen', 'shadow-ball']],
               ['rampardos', 59, ['head-smash', 'zen-headbutt', 'ancient-power', 'screech']], ['gardevoir', 59, ['psychic', 'magical-leaf', 'calm-mind', 'focus-blast']],
               ['pelipper', 58, ['air-slash', 'water-pulse', 'roost', 'quick-attack']], ['medicham', 58, ['recover', 'force-palm', 'psychic', 'rock-slide']]] },
      { id: 'chelsey-sterling', who: 'psychic', cls: 'double-team', name: 'Chelsey & Sterling', x: 9, y: 22, dir: 'down', sight: 3, double: true, partner: { who: 'psychic', x: 10, y: 22, dir: 'down' },
        before: 'We saw this battle in our minds. We saw ourselves winning.',
        defeat: 'Our minds must have been a little hot.',
        after: 'Something sleeps under this mountain. We can feel it dreaming.',
        team: [['lunatone', 57, ['heal-block', 'psychic', 'future-sight', 'explosion']], ['solrock', 57, ['heal-block', 'rock-slide', 'solar-beam', 'explosion']],
               ['gardevoir', 59, ['psychic', 'imprison', 'future-sight', 'captivate']], ['gallade', 59, ['feint', 'false-swipe', 'protect', 'close-combat']]] },
      { id: 'krystal-ray', who: 'birdkeeper', cls: 'double-team', name: 'Krystal & Ray', x: 36, y: 23, dir: 'up', sight: 3, double: true, partner: { who: 'blackbelt', x: 37, y: 23, dir: 'up' },
        before: 'Wings and fists! Nothing gets past both!',
        defeat: 'You got past both.',
        after: 'Strange people in uniforms walked past here. Not even a hello.',
        team: [['staravia', 55, ['aerial-ace', 'take-down', 'agility', 'brave-bird']], ['breloom', 58, ['seed-bomb', 'mach-punch', 'sky-uppercut', 'spore']],
               ['fearow', 57, ['agility', 'assurance', 'roost', 'drill-peck']], ['toxicroak', 58, ['sludge-bomb', 'nasty-plot', 'focus-blast', 'dark-pulse']],
               ['noctowl', 59, ['extrasensory', 'psycho-shift', 'roost', 'dream-eater']]] },
      { id: 'stefan-jasmin', who: 'cooltrainerm', cls: 'double-team', name: 'Stefan & Jasmin', x: 31, y: 13, dir: 'down', sight: 3, double: true, partner: { who: 'cooltrainer', x: 32, y: 13, dir: 'down' },
        before: 'This is as far as most Trainers get.',
        defeat: 'But not you.',
        after: 'Keep going. It only gets hotter.',
        team: [['pupitar', 58, ['payback', 'crunch', 'earthquake', 'stone-edge']], ['drapion', 61, ['cross-poison', 'crunch', 'x-scissor', 'aerial-ace']],
               ['torterra', 61, ['synthesis', 'crunch', 'giga-drain', 'leaf-storm']]] },
      { id: 'drake-jarrett', who: 'cooltrainerm', cls: 'double-team', name: 'Drake & Jarrett', x: 14, y: 14, dir: 'up', sight: 3, double: true, partner: { who: 'blackbelt', x: 15, y: 14, dir: 'up' },
        before: 'A dragon and a fighter. We cover each other\'s weak points!',
        defeat: 'You found them anyway!',
        after: 'The way on is blocked by cracked rock. Break it, if you can.',
        team: [['gible', 57, ['slash', 'dragon-claw', 'dig', 'dragon-rush']], ['machamp', 60, ['cross-chop', 'fire-punch', 'ice-punch', 'thunder-punch']],
               ['gabite', 57, ['slash', 'dragon-claw', 'dig', 'dragon-rush']], ['dragonair', 57, ['aqua-tail', 'dragon-rush', 'safeguard', 'dragon-dance']]] },
      { id: 'abel-monique', who: 'cooltrainerm', cls: 'double-team', name: 'Abel & Monique', x: 18, y: 3, dir: 'down', sight: 4, double: true, partner: { who: 'cooltrainer', x: 19, y: 3, dir: 'down' },
        before: 'Ice in a volcano? Yes. That is how tough we are.',
        defeat: 'It melted.',
        after: 'The people in uniforms went through the last door. Watch out.',
        team: [['glalie', 59, ['hail', 'ice-beam', 'sheer-cold', 'crunch']], ['luxray', 58, ['discharge', 'crunch', 'thunder-wave', 'facade']],
               ['crobat', 60, ['air-slash', 'poison-fang', 'confuse-ray', 'shadow-ball']], ['ursaring', 59, ['hammer-arm', 'stone-edge', 'swords-dance', 'giga-impact']],
               ['gliscor', 58, ['aerial-ace', 'x-scissor', 'earthquake', 'quick-attack']]] },
      { id: 'harlan-kenny', who: 'gentleman', cls: 'double-team', name: 'Harlan & Kenny', x: 28, y: 4, dir: 'left', sight: 4, double: true, partner: { who: 'cooltrainerm', x: 28, y: 5, dir: 'left' },
        before: 'I have seen Trainers come and go from this mountain for forty years.',
        defeat: 'And there you go.',
        after: 'Go on, then. Whatever is at the bottom of this mountain, it has been waiting for a long time.',
        team: [['raticate', 57, ['endeavor', 'super-fang', 'crunch', 'quick-attack']], ['bagon', 57, ['scary-face', 'crunch', 'dragon-claw', 'double-edge']],
               ['drifblim', 58, ['explosion', 'shadow-ball', 'toxic', 'fly']], ['shelgon', 57, ['zen-headbutt', 'scary-face', 'crunch', 'dragon-claw']],
               ['shiftry', 59, ['leaf-storm', 'feint-attack', 'extrasensory', 'quick-attack']], ['vibrava', 57, ['dragon-breath', 'screech', 'sandstorm', 'hyper-beam']]] }
    ]
  }, SINNOH));

  // ---------------- The deepest room ----------------
  G.Maps.def(Object.assign({
    id: 'stark-deep', loc: 'stark-mountain', tileset: 'outdoor', palette: 'fiery', music: 'cave', battleBg: 'cave', border: '#',
    cave: true, escape: true, commanders: COMMANDERS, buckTeam: BUCK_TEAM, companion: WITH_BUCK,
    rows: [
      '#####################',
      '#####################',
      '#######.......#######',
      '####~~#.......#~~####',
      '####~~#.......#~~####',
      '#######.......#######',
      '###...............###',
      '###...............###',
      '###...............###',
      '###...............###',
      '###...............###',
      '###...............###',
      '######.........######',
      '######.........######',
      '######.........######',
      '######.........######',
      '###...............###',
      '##########O##########'
    ],
    warps: [{ x: 10, y: 17, to: 'stark-inside', spot: 'north' }],
    spots: { south: [10, 16, 'up'] },
    triggers: [{ x: 6, y: 12, w: 9, h: 1, if: '!charon-caught', script: 'stark.charon' }],
    npcs: [
      { id: 'mars', who: 'mars', x: 9, y: 9, dir: 'down', if: '!charon-caught' },
      { id: 'jupiter', who: 'jupiter', x: 11, y: 9, dir: 'down', if: '!charon-caught' },
      { id: 'charon', who: 'charon', x: 10, y: 6, dir: 'down', if: '!charon-caught' },
      { id: 'grunt1', who: 'galactic', x: 8, y: 6, dir: 'down', if: '!charon-caught' },
      { id: 'grunt2', who: 'galactic', x: 12, y: 6, dir: 'down', if: '!charon-caught' },
      { id: 'looker', who: 'looker', x: 12, y: 6, dir: 'left', if: 'scripted' },
      { id: 'officer1', who: 'officer', x: 9, y: 11, dir: 'up', if: 'scripted' },
      { id: 'officer2', who: 'officer', x: 11, y: 11, dir: 'up', if: 'scripted' },
      { id: 'heatran', who: 'heatran', mon: 'heatran', x: 10, y: 3, dir: 'down', fixed: true, if: ['magma-stone-back', '!heatran-caught'], script: 'stark.heatran' }
    ]
  }, SINNOH));

  // ---------------- Buck comes along ----------------
  async function buck(h) {
    const F = G.Field, W = G.World, me = W.player;
    if (F.flag('buck-met')) return;
    h.show('buck');
    h.emote('buck', '!');
    await h.walkTo('buck', me.x, me.y - 1);
    h.face('buck', 'player');
    await h.say(T('Hey! I know you, you are the Champion! My big brother Flint told me all about you. I am Buck.'), BUCK);
    await h.say(T('This mountain is where I train. But people in Team Galactic uniforms came through here, and they went straight for the deepest room.'), BUCK);
    await h.say(T('Nobody messes with my mountain! I am going after them, and you are coming too.'), BUCK);
    await h.say(T('The Trainers in here like to fight in pairs, so we will fight as a pair as well. And after each battle I will see to your team.'), BUCK);
    h.hide('buck');
    F.setFlag('buck-met');
    F.setFlag('buck-along');
    if (W.makeFollower) W.makeFollower();
  }

  // ---------------- The deepest room: Mars, Jupiter, Charon, Looker ----------------
  async function charon(h) {
    const F = G.Field, W = G.World, me = W.player;
    if (F.flag('charon-caught')) return;
    h.emote('mars', '!');
    await h.say(T('Oh, it is you again. Do you ever stop following Team Galactic around?'), MARS);
    await h.say(T('We only came to see what Charon has been doing with the name of our team.'), JUPITER);
    await h.say(T('Hey! This is my mountain! Whatever you are up to down here, it stops now!'), BUCK);
    await h.say(T('A friend of yours? Then two against two. We have been bored since the Spear Pillar.'), JUPITER);
    h.heal();
    await h.say(T('Wait, let me see to your team first. Right, {player}, together!'), BUCK);
    await h.jingle('heal');
    const out = await h.battle(COMMANDERS, { partner: { name: T('Buck'), team: BUCK_TEAM }, rules: { tag: true } });
    if (out === 'lose') return;
    h.heal();
    await h.say(T('Beaten again. Funny, I do not even mind this time.'), MARS);
    await h.say(T('Cyrus wanted a whole new world. Charon only wants money. That is not what we signed up for.'), JUPITER);
    await h.say(T('We are done. As of now, we have left Team Galactic.'), MARS);
    await h.say(T('Goodbye, Trainer. Try not to get burned.'), JUPITER);
    await h.fade('out', 0.4);
    h.hide('mars');
    h.hide('jupiter');
    await h.fade('in', 0.4);
    await h.walkTo('charon', 10, 9);
    await h.walkTo('grunt1', 8, 9);
    await h.walkTo('grunt2', 12, 9);
    await h.say(T('Fools! Who needs them? Look at this, children. The Magma Stone, the seal of this mountain!'), CHARON);
    await h.say(T('With it I shall wake what sleeps below, and the people of Sinnoh will pay anything to make the volcano sleep again!'), CHARON);
    await h.say(T('Excuse me, sir. One small question.'), GRUNT);
    await h.say(T('What is it now? Can you not see I am gloating?'), CHARON);
    await h.fade('out', 0.3);
    h.hide('grunt2');
    h.place('looker', 12, 9, 'left');
    h.show('looker');
    await h.fade('in', 0.3);
    await h.say(T('Do you have the right to carry that stone? No? Then you are under arrest!'), LOOKER);
    await h.say(T('You! You have been carrying my bags for a month!'), CHARON);
    await h.say(T('And they were very heavy. Looker of the International Police, at your service. A fine disguise, no?'), LOOKER);
    h.show('officer1');
    h.show('officer2');
    await h.say(T('Officers, take him away. And his friend.'), LOOKER);
    await h.fade('out', 0.4);
    h.hide('charon');
    h.hide('grunt1');
    h.hide('officer1');
    h.hide('officer2');
    await h.fade('in', 0.4);
    await h.say(T('He dropped it! So this is the Magma Stone. It is warm, and...'), BUCK);
    h.sfx('cry');
    await h.say(T('The whole room shook! Far below, something answered.'));
    await h.say(T('Whoa! I do not think it likes being moved! I am taking this to my grandfather, he will know what to do.'), BUCK);
    await h.say(T('Thanks for everything, {player}. Come and find me at home in the Survival Area!'), BUCK);
    await h.fade('out', 0.4);
    F.clearFlag('buck-along');
    F.setFlag('charon-caught');
    if (W.makeFollower) W.makeFollower();
    await h.fade('in', 0.4);
    await h.say(T('Team Galactic is finished, my friend, and you helped to finish it. Now, the paperwork. There is always paperwork.'), LOOKER);
    await h.fade('out', 0.3);
    h.hide('looker');
    await h.fade('in', 0.3);
  }

  // ---------------- At home in the Survival Area, and Heatran ----------------
  async function buckHome(h) {
    const F = G.Field;
    if (F.flag('magma-stone-back')) {
      await h.say(T('The mountain is quiet again, but something is awake down there. Be careful, {player}.'), BUCK);
      return;
    }
    await h.say(T('{player}! You made it. I showed the stone to Grandfather, and he went white.'), BUCK);
    await h.say(T('He says it holds down the heart of the mountain. So I ran all the way back and put it where it was.'), BUCK);
    await h.say(T('The shaking stopped. But I felt something looking at me from the lava, in the deepest room. Something huge.'), BUCK);
    await h.say(T('If anyone can face it, you can. Go and see!'), BUCK);
    F.setFlag('magma-stone-back');
  }

  async function heatran(h) {
    const F = G.Field, vars = { mon: G.Names.mon(485) };
    await h.say(T('Where the Magma Stone rests, {mon} rises from the lava. The air burns around it.'), { vars });
    h.sfx('cry');
    await h.wild(485, 50, {});
    const r = F.lastBattle;
    if (r === 'run' || r === 'lose') return;
    h.hide('heatran');
    if (r === 'caught') F.setFlag('heatran-caught');
    else await h.say(T('{mon} sank back into the lava. It may rise again.'), { vars });
    if (F.flag('chapter-62-done')) return;
    await h.say(T('Stark Mountain breathed out, and the rumbling stopped at last.'));
    // The end of the sixty-second chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(62); else F.setFlag('chapter-62-done');
  }

  G.Script.def({
    'stark.buck': [['js', buck]],
    'stark.heal': [['healAnim'], ['heal'], ['say', 'Buck\'s Claydol looked after your Pokémon. They are fully healed!']],
    'stark.charon': [['js', charon]],
    'stark.buck-home': [['js', buckHome]],
    'stark.heatran': [['js', heatran]]
  });
})();
