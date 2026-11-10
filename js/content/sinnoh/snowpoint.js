/* ============ snowpoint.js — Route 211 East, Mt. Coronet north, the snow, Snowpoint City and Lake Acuity ============
 * Chapter 53, the end of the chapter. After chapter 52 the hiker leaves Celestic Town's west exit: Route 211 East, then a
 * room of Mt. Coronet, Routes 216 and 217 in the snow (`snow: true`, and `hail: true`: Hail in every battle there) and
 * Acuity Lakefront, where Barry stands in the slope up to the lake (flag barry-lakefront: he says what it takes). East,
 * Snowpoint City and Candice's Gym: three sheets of ice. With the Icicle Badge (31) Barry has gone up; at Lake Acuity he
 * has just lost to Commander Jupiter, who leaves with Uxie (flag jupiter-acuity), and `ending(53)`. No battle with her
 * here: that waits for Team Galactic's headquarters. Rock Climb does not exist in this game, so the slope is a story gate.
 * Platinum's Trainers and wild Pokémon, but Candice is one level lower with a Super Potion, and Isaiah and Anton one level
 * lower too (a normal difficulty; her ace stays the highest level in the Gym).
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const SAILOR = { name: 'Sailor' };
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const SNOW = { tileset: 'outdoor', palette: 'snow', music: 'route', battleBg: 'ice', border: 'T', snow: true, hail: true, region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const BARRY = { name: 'Barry' };
  const JUPITER = { name: 'Jupiter' };
  const CANDICE = { name: 'Candice' };

  // ---------------- Route 211 East ----------------
  G.Maps.def(Object.assign({
    id: 'route211e', loc: 'sinnoh-route-211', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T###########.................T',
      'T###########.."""""""".......T',
      'T###########.."""""""".......T',
      'T###########.."""""""".......T',
      'T###########.."""""""".......T',
      'T#O###O#####.."""""""".......T',
      'T.....,......................T',
      'T.....,....................S.T',
      'T.....,,,,,,,,,,,,,,,,,,,,,,,,',
      'T............................T',
      'T.......""""""".TTT."""""""".T',
      'T.......""""""".TTT."""""""".T',
      'T.......""""""".TTT."""""""".T',
      'T.......""""""".TTT."""""""".T',
      'T.......""""""".TTT."""""""".T',
      'T............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'celestic', offset: -1 } },
    warps: [{ x: 6, y: 6, to: 'mt-coronet-north', spot: 'east' }, { x: 2, y: 6, to: 'coronet-211', spot: 'east' }],   // the tunnel (chapter 66)
    spots: { coronet: [6, 7, 'down'], tunnel: [2, 7, 'down'] },
    signs: { '27,8': 'Route 211. West: Mt. Coronet. East: Celestic Town.' },
    items: [{ x: 18, y: 3, item: 'tm29', flag: 'route211-tm29' }, { x: 26, y: 14, item: 'zinc', flag: 'route211-zinc' }],
    npcs: [{ id: 'thinker', who: 'psychic', x: 3, y: 9, dir: 'right', script: 'route211.psych-up' }],
    trainers: [
      { id: 'katherine', who: 'birdkeeper', cls: 'bird-keeper', name: 'Katherine', x: 22, y: 7, dir: 'down', sight: 2, team: [['noctowl', 34]],
        before: 'My Noctowl sees everything on this road, day or night!',
        defeat: 'It did not see that coming.',
        after: 'The birds here will not fly over the mountain. It is too high, even for them.' },
      { id: 'nick', who: 'youngster', cls: 'ninja-boy', name: 'Nick', x: 16, y: 10, dir: 'up', sight: 1, team: [['skorupi', 32], ['croagunk', 30]],
        before: 'You did not see me! That is the whole point of being a ninja!',
        defeat: 'I should have stayed hidden.',
        after: 'Poison is the ninja way. Nobody sees it coming.' },
      { id: 'sean', who: 'blackbelt', cls: 'black-belt', name: 'Sean', x: 12, y: 8, dir: 'down', sight: 1, team: [['croagunk', 31], ['meditite', 31], ['machoke', 31]],
        before: 'I climb this road every morning. It builds strong legs!',
        defeat: 'My legs were fine. It was the rest of me.',
        after: 'The cold on the far side of the mountain is good training, too.' },
      { id: 'harry', who: 'hiker', cls: 'ruin-maniac', name: 'Harry', x: 9, y: 7, dir: 'left', sight: 3, team: [['bronzor', 28], ['bronzor', 30], ['bronzor', 32]],
        before: 'Bronzor were found in old tombs. I want to know why!',
        defeat: 'History repeats itself. So do my losses.',
        after: 'The ruins in Celestic Town are the oldest I have ever seen.' }
    ],
    encounters: { walk: '@sinnoh-route-211-east-towards-celestic-town' }
  }, SINNOH));

  // ---------------- Mt. Coronet, the way north ----------------
  G.Maps.def(Object.assign({
    id: 'mt-coronet-north', loc: 'mt-coronet', rows: [
      '################################',
      '################################',
      '################################',
      '###....###..........###......###',
      '##.....###..........###.......##',
      '##.....###..........###.......##',
      '##.....###..........###.......##',
      '##.....###..........###.......##',
      '##.....###...###....###.......##',
      '##...........###.........###..##',
      '##...........###.........###..##',
      '##...........###.........###..##',
      '##...........###.........###..##',
      '###O########################O###',
      '################################',
      '################################'
    ],
    warps: [{ x: 3, y: 13, to: 'route216', spot: 'coronet' }, { x: 28, y: 13, to: 'route211e', spot: 'coronet' }],
    spots: { west: [3, 12, 'up'], east: [28, 12, 'up'] },
    items: [{ x: 5, y: 4, item: 'stardust', flag: 'coronet-north-stardust' }, { x: 24, y: 4, item: 'max-repel', flag: 'coronet-north-repel' }],
    encounters: { walk: '@mt-coronet-1f-route-216' }
  }, CAVE));

  // ---------------- Route 216 ----------------
  G.Maps.def(Object.assign({
    id: 'route216', loc: 'sinnoh-route-216',
    rows: [
      'TTTTTT,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T.....,...........................#########T',
      'T.....,........"""""""""..TTTT....#########T',
      'T.....,........"""""""""..TTTT....#########T',
      'T.....,........"""""""""..TTTT....#########T',
      'T.....,........"""""""""..TTTT....#########T',
      'T.....,..HHHH.."""""""""..TTTT....#########T',
      'T.....,..HHHH.."""""""""..........####O####T',
      'T.....,..HDHH.........................,....T',
      'T.....,.S.,...........................,....T',
      'T.....,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
      'T...................................S......T',
      'T..........."""""""""....""""""""".........T',
      'T.TTTTTT...."""""""""....""""""""".........T',
      'T.TTTTTT...."""""""""...."""""""""..TTTTTT.T',
      'T.TTTTTT...."""""""""...."""""""""..TTTTTT.T',
      'T.TTTTTT...."""""""""...."""""""""..TTTTTT.T',
      'T.TTTTTT................."""""""""..TTTTTT.T',
      'T..........................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'route217', offset: -8 } },
    warps: [{ x: 38, y: 7, to: 'mt-coronet-north', spot: 'west' }, { x: 10, y: 8, to: 'route216-lodge', spot: 'door' }],
    spots: { coronet: [38, 8, 'down'], 'lodge-door': [10, 9, 'down'] },
    signs: {
      '36,11': 'Route 216. West, then north: Route 217. Hail is falling, so take care in battle!',
      '8,9': 'A lodge for travellers. Come in and get warm!'
    },
    items: [
      { x: 17, y: 3, item: 'ultra-ball', flag: 'route216-ball' }, { x: 30, y: 15, item: 'tm13', flag: 'route216-tm13' },
      { x: 40, y: 9, item: 'revive', flag: 'route216-revive' }, { x: 3, y: 18, item: 'max-potion', flag: 'route216-potion' }
    ],
    trainers: [
      { id: 'bradley', who: 'boarder', cls: 'skier-m', name: 'Bradley', x: 30, y: 9, dir: 'down', sight: 1, team: [['snorunt', 36], ['swinub', 36], ['snover', 36]],
        before: 'Fresh snow, and nobody on the slope but me!',
        defeat: 'I hit a tree. A very strong tree.',
        after: 'All three of my Pokémon love the hail. Yours? Not so much.' },
      { id: 'kaitlyn', who: 'skier', cls: 'skier', name: 'Kaitlyn', x: 24, y: 11, dir: 'up', sight: 1, team: [['swinub', 36], ['snover', 38]],
        before: 'I can ski and battle at the same time. Watch!',
        defeat: 'Maybe not at the same time.',
        after: 'Snover grow tall on the snowfields around here.' },
      { id: 'philip', who: 'blackbelt', cls: 'black-belt', name: 'Philip', x: 20, y: 9, dir: 'down', sight: 1, team: [['machoke', 40]],
        before: 'I train in the snow with bare feet. Feel my spirit!',
        defeat: 'My spirit is fine. My feet are not.',
        after: 'There is a lodge to the west, if you are cold. I am not. Not at all.' },
      { id: 'blake', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Blake', x: 18, y: 11, dir: 'up', sight: 1, team: [['ambipom', 39], ['porygon2', 40]],
        before: 'Only strong Trainers come this far north. Let us see about you.',
        defeat: 'You are the real thing.',
        after: 'The Gym in Snowpoint is no easier than this road.' },
      { id: 'laura', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Laura', x: 13, y: 9, dir: 'down', sight: 1, team: [['tropius', 42]],
        before: 'My Tropius came from somewhere warm. It has grown tough here!',
        defeat: 'It will want some fruit after that.',
        after: 'Tropius has never once complained about the snow.' },
      { id: 'garrett', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Garrett', x: 8, y: 5, dir: 'left', sight: 2, team: [['mr-mime', 37], ['dusclops', 39], ['scyther', 39]],
        before: 'A team with no weak point. Go on, try and find one!',
        defeat: 'You found three.',
        after: 'North of here the snow gets so thick you can hardly see.' },
      { id: 'maria', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Maria', x: 3, y: 3, dir: 'right', sight: 3, team: [['golduck', 38], ['rapidash', 39], ['sudowoodo', 38]],
        before: 'Fire, water and rock, right here in the snow. Ready?',
        defeat: 'You were ready.',
        after: 'A balanced team is the best way to get through the north.' }
    ],
    encounters: { walk: '@sinnoh-route-216-area' }
  }, SNOW));

  G.Maps.def(Object.assign({
    id: 'route216-lodge', loc: 'sinnoh-route-216', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'route216', spot: 'lodge-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'keeper', who: 'granny', x: 7, y: 3, dir: 'down', script: 'route216.lodge' }]
  }, SINNOH));

  // ---------------- Route 217 ----------------
  G.Maps.def(Object.assign({
    id: 'route217', loc: 'sinnoh-route-217',
    rows: [
      'TTTTTTTTTTTTTTTTTT,TTTTTTTTT',
      'TTTTTTTTTTT.......,........T',
      'TTTTTTTTTTT......S,........T',
      'TTTTTTTTTTT.......,........T',
      'TTTTTTTTTTT.......,........T',
      'TTTTTTTTTTT.......,........T',
      'TTTTTTTTTTT.......,........T',
      'TTTTTTTTTTT.......,........T',
      'TTTTTTTTTTT.......,........T',
      'T.................,.....TTTT',
      'T.................,.....TTTT',
      'T.................,.....TTTT',
      'T.......,,,,,,,,,,,.....TTTT',
      'T.""""".,...............TTTT',
      'T.""""".,...TTTTTTT.""""TTTT',
      'T.""""".,...TTTTTTT.""""TTTT',
      'T.""""".,...TTTTTTT.""""TTTT',
      'T.""""".,...TTTTTTT.""""TTTT',
      'T.""""".,...TTTTTTT.""""TTTT',
      'T.......,...TTTTTTT.""""TTTT',
      'T.......,...TTTTTTT.""""TTTT',
      'T.......,...TTTTTTT.....TTTT',
      'T.......,...............TTTT',
      'T.......,..................T',
      'T.......,,,,,,,............T',
      'T.............,............T',
      'TTTTTTTTT.....,.....TTTTTTTT',
      'TTTTTTTTT.....,.....TTTTTTTT',
      'TTTTTTTTT.....,.....TTTTTTTT',
      'TTTTTTTTT.....,.....TTTTTTTT',
      'TTTTTTTTT.....,.....TTTTTTTT',
      'TTTTTTTTT.....,.....TTTTTTTT',
      'TTTTTTTTT.....,.....TTTTTTTT',
      'TTTTTTTTTTTTTT,TTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route216', offset: 8 }, north: { map: 'acuity-lakefront', offset: 4 } },
    signs: { '17,2': 'Route 217. North: Acuity Lakefront. South: Route 216.' },
    items: [
      { x: 25, y: 2, item: 'nugget', flag: 'route217-nugget' }, { x: 3, y: 24, item: 'iron', flag: 'route217-iron' },
      { x: 18, y: 30, item: 'tm07', flag: 'route217-tm07' }
    ],
    trainers: [
      { id: 'shawn', who: 'boarder', cls: 'skier-m', name: 'Shawn', x: 11, y: 10, dir: 'down', sight: 2, team: [['snover', 35], ['snover', 36], ['snover', 37]],
        before: 'Three Snover! I named them Left, Right and Down the Hill!',
        defeat: 'All three went down the hill.',
        after: 'On a good day you can ski from here all the way to the lake.' },
      { id: 'lexie', who: 'skier', cls: 'skier', name: 'Lexie', x: 5, y: 22, dir: 'right', sight: 3, team: [['piloswine', 37], ['glaceon', 37]],
        before: 'This is my mountain. Lost in the snow? Too bad!',
        defeat: 'Now I am the one who is lost.',
        after: 'Glaceon can freeze the air around it. It is the perfect friend for a long winter.' },
      { id: 'bjorn', who: 'boarder', cls: 'skier-m', name: 'Bjorn', x: 21, y: 5, dir: 'left', sight: 3, team: [['swinub', 36], ['sneasel', 38]],
        before: 'Nobody comes up here! Finally, somebody to battle!',
        defeat: 'I should have asked you to wait a bit.',
        after: 'Snowpoint City is just past the lakefront. You are nearly there.' }
    ],
    encounters: { walk: '@sinnoh-route-217-area' }
  }, SNOW));

  // ---------------- Acuity Lakefront ----------------
  G.Maps.def(Object.assign({
    id: 'acuity-lakefront', loc: 'acuity-lakefront',
    rows: [
      'TTTTTTTTTTTTTT,TTTTTTTTTTTTTTT',
      'TTTTTT........,.........TTTTTT',
      'TTTTTT........,.........TTTTTT',
      'T.""""""""....,....""""""""".T',
      'T.""""""""....,....""""""""".T',
      'T.""""""""....,....""""""""".T',
      'T.""""""""....,....""""""""".T',
      'T.""""""""....,....""""""""".T',
      'T#############,##############T',
      'T#############,##############T',
      'T............S,..............T',
      'T.............,,,,,,,,,,,,,,,,',
      'T.............,..""""""""""".T',
      'T.............,..""""""""""".T',
      'T.............,..""""""""""".T',
      'T.TTTTTTT.....,.....TTTTTTTT.T',
      'T.TTTTTTT.....,.....TTTTTTTT.T',
      'T.TTTTTTT.....,.....TTTTTTTT.T',
      'T.TTTTTTT.....,.....TTTTTTTT.T',
      'T.TTTTTTT.....,.....TTTTTTTT.T',
      'T.............,..............T',
      'TTTTTTTTTTTTTT,TTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route217', offset: -4 }, east: { map: 'snowpoint', offset: -4 }, north: { map: 'lake-acuity', offset: 1 } },
    signs: { '13,10': 'North: Lake Acuity. East: Snowpoint City.' },
    items: [{ x: 4, y: 4, item: 'ultra-ball', flag: 'acuity-ball' }, { x: 25, y: 5, item: 'reaper-cloth', flag: 'acuity-cloth' }],
    triggers: [{ x: 1, y: 12, w: 28, h: 1, if: '!barry-lakefront', script: 'snowpoint.barry-slope' }],
    npcs: [{ id: 'barry', who: 'barry', x: 14, y: 9, dir: 'down', if: '!badge:31', script: 'snowpoint.barry-wait' }],
    encounters: { walk: '@acuity-lakefront-area' }
  }, SNOW));

  // ---------------- Lake Acuity ----------------
  G.Maps.def(Object.assign({
    id: 'lake-acuity', loc: 'lake-acuity',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..........................T',
      'T....~~~~~~~~~~~~~~~~~~....T',
      'T....~~~~~~~~~~~~~~~~~~....T',
      'T....~~~~~~~~~~~~~~~~~~....T',
      'T....~~~~~~~~~~~~~~~~~~....T',
      'T....~~~~~~~####~~~~~~~....T',
      'T....~~~~~~~####~~~~~~~....T',
      'T....~~~~~~~#O##~~~~~~~....T',
      'T....~~~~~~~:::~~~~~~~~....T',
      'T....~~~~~~~~~~~~~~~~~~....T',
      'T....~~~~~~~~~~~~~~~~~~....T',
      'T....~~~~~~~~~~~~~~~~~~....T',
      'T............,.............T',
      'T............,.............T',
      'T.""""""""...,...""""""""".T',
      'T.""""""""...,...""""""""".T',
      'T.""""""""...,...""""""""".T',
      'T.""""""""...,...""""""""".T',
      'T.""""""""...,S..""""""""".T',
      'T............,.............T',
      'TTTTTTTTTTTTT,TTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'acuity-lakefront', offset: -1 } },
    warps: [{ x: 13, y: 8, to: 'acuity-cavern', spot: 'door', if: 'sinnoh-champion', locked: 'slegends.cave-shut' }],
    spots: { cave: [13, 9, 'down'] },
    signs: { '14,19': 'Lake Acuity. Its waters are said to be the home of a spirit of knowledge.' },
    items: [{ x: 24, y: 3, item: 'tm14', flag: 'acuity-tm14' }],
    triggers: [{ x: 1, y: 18, w: 26, h: 1, if: ['badge:31', '!jupiter-acuity'], script: 'acuity.jupiter' }],
    npcs: [
      { id: 'jupiter', who: 'jupiter', x: 13, y: 14, dir: 'down', if: ['badge:31', '!jupiter-acuity'], script: 'acuity.jupiter' },
      { id: 'grunt1', who: 'galactic', x: 11, y: 14, dir: 'down', if: ['badge:31', '!jupiter-acuity'], script: 'acuity.jupiter' },
      { id: 'grunt2', who: 'galactic', x: 15, y: 14, dir: 'down', if: ['badge:31', '!jupiter-acuity'], script: 'acuity.jupiter' },
      { id: 'barry', who: 'barry', x: 13, y: 16, dir: 'up', if: ['badge:31', '!barry-acuity'], script: 'acuity.jupiter' }
    ],
    encounters: { walk: '@lake-acuity-area', water: '@lake-acuity-area' }
  }, SNOW));

  // ---------------- Snowpoint City ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint', loc: 'snowpoint-city', tileset: 'outdoor', palette: 'snow', music: 'town', battleBg: 'ice', border: 'T', snow: true,
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T...........................#######T',
      'T...........................###O###T',
      'T.............................S,...T',
      'T..............................,...T',
      'T..............................,...T',
      'T..............GGGGGG..........,...T',
      'T....CCCCC.....GGGGGG..........,...T',
      'T....CCCCC.....GGGGGG...MMMM...,...T',
      'T....CCCCC.....GGGGGG...MMMM...,...T',
      'T....CCDCC.....GGDGGG...MDMM...,...T',
      'T......,.........,.......,.....,...T',
      'T......,.........,.S.....,.....,...T',
      'T......,.........,.......,.....,...T',
      'T..S...,.........,.......,.....,...T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
      'T................,.................T',
      'T................,.................T',
      'T........HHHH....,......HHHH.......T',
      'T........HHHH....,......HHHH.......T',
      'T........HDHH....,......HDHH.......T',
      'T.........,,,,,,,,,,,,,,,,.........T',
      'T................,.S...............T',
      'T~~~~~~~~~~~~~~~~=~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~=~~~~~~~~~~~~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'acuity-lakefront', offset: 4 } },
    warps: [
      { x: 7, y: 10, to: 'snowpoint-center', spot: 'door' },
      { x: 25, y: 10, to: 'snowpoint-mart', spot: 'door' },
      { x: 17, y: 10, to: 'snowpoint-gym', spot: 'door' },
      { x: 10, y: 20, to: 'snowpoint-house', spot: 'door' },
      { x: 25, y: 20, to: 'snowpoint-house2', spot: 'door' },
      { x: 31, y: 2, to: 'snowpoint-temple-1f', spot: 'door' }       // Snowpoint Temple (temple.js, chapter 68)
    ],
    spots: { harbor: [17, 23, 'down'], 'center-door': [7, 11, 'down'], 'mart-door': [25, 11, 'down'], 'gym-door': [17, 11, 'down'], 'house-door': [10, 21, 'down'], 'house2-door': [25, 21, 'down'], temple: [31, 3, 'down'] },
    signs: {
      '3,14': 'Snowpoint City. The town where the snow never melts.',
      '19,12': 'Snowpoint City Gym. Leader: Candice, who never lets the cold win.',
      '30,3': 'North: Snowpoint Temple. No entry.',
      '19,22': 'Snowpoint Harbor. The ship sails to the Battle Zone.'
    },
    npcs: [
      { id: 'sailor', who: 'sailor', x: 17, y: 24, dir: 'up', script: 'snowpoint.sailor' },
      { id: 'temple', who: 'gentleman', x: 31, y: 3, dir: 'down', if: '!national-dex',
        say: 'Snowpoint Temple lies beyond this point. It is older than the town, and only the Gym Leader may go inside.' },
      { id: 'temple-open', who: 'gentleman', x: 32, y: 3, dir: 'left', if: 'national-dex',
        say: 'Candice told me a Trainer filling in the National Pokédex may enter the temple. Every floor below is ice, so mind your step.' },
      { id: 'boy', who: 'youngster', x: 13, y: 13, move: 'look',
        say: 'Our Gym Leader is the coolest person in Sinnoh. Get it? Coolest?' },
      { id: 'girl', who: 'lass', x: 21, y: 17, move: 'look',
        say: 'Up the slope from the lakefront there is a lake. Nobody goes up without the Gym badge.' }
    ]
  }, SINNOH));

  G.Maps.center('snowpoint-center', {
    loc: 'snowpoint-city', exit: { map: 'snowpoint', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'In hail, every Pokémon that is not an Ice type loses a little HP each turn. Ice types do not mind it at all!' }]
  }).region = 'sinnoh';

  G.Maps.mart('snowpoint-mart', {
    loc: 'snowpoint-city', exit: { map: 'snowpoint', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'revive', 'antidote', 'paralyze-heal', 'awakening',
            'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel', 'max-repel'],
    npcs: [{ id: 'shopper', who: 'hiker', x: 6, y: 5, move: 'look',
             say: 'Ice Heal is the best seller up here, for some reason.' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'snowpoint-house', loc: 'snowpoint-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'snowpoint', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'gentleman', x: 7, y: 3, dir: 'down',
             say: 'Ships from here go to a far island, but only for the very strongest Trainers.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'snowpoint-house2', loc: 'snowpoint-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'snowpoint', spot: 'house2-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'gran', who: 'granny', x: 3, y: 3, dir: 'down',
             say: 'My grandchildren have never seen the ground in this town. Only snow.' }]
  }, SINNOH));

  // ---------------- Candice's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint-gym', loc: 'snowpoint-city', tileset: 'indoor', palette: 'ice', music: 'gym', battleBg: 'ice',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWW',
      'p+++++++++++++p',
      '+++++++++++++++',
      'ccccccccccc+ccc',
      'IIIIIIIIIIcIIII',
      'IIIIIIIIIIIIIII',
      'IIIIIIIIIIIIIII',
      'IIcIIIIIIIIIIII',
      'ccc+ccccccccccc',
      '+++++++++++++++',
      '+++++++++++++++',
      'ccccccc+ccccccc',
      'IIIIIIIIcIIIIII',
      'IIIIIIIIIIIcIII',
      'IIIIIcIIIIIIIII',
      'IIIIIIIIIIIIcII',
      'ccccccccccc+ccc',
      '+++++++++++++++',
      '+++++++++++++++',
      'ccc+ccccccccccc',
      'IIIIcIIIIIIIIII',
      'IIIIIIIcIIIIIII',
      'IIIIIIIIIIIIIII',
      'IIIIIIIIcIIIIII',
      'ccccccc+ccccccc',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 26, to: 'snowpoint', spot: 'gym-door' }],
    spots: { door: [7, 26, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 9, y: 26, dir: 'left', script: 'snowpoint.gym-guide' }],
    trainers: [
      { id: 'sergio', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Sergio', x: 9, y: 19, dir: 'up', sight: 1, team: [['snover', 41], ['sneasel', 42]],
        before: 'Sliding on the ice is the easy part. Now try me!',
        defeat: 'I slipped up.',
        after: 'Rocks stop you on the ice. Look for the one you need before you move.' },
      { id: 'brenna', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Brenna', x: 6, y: 18, dir: 'down', sight: 1, team: [['sneasel', 40], ['snorunt', 40], ['snover', 41]],
        before: 'Candice told me to focus, so I am focusing on you!',
        defeat: 'I lost my focus.',
        after: 'Every morning we all polish the ice for Candice.' },
      { id: 'alicia', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Alicia', x: 6, y: 10, dir: 'down', sight: 1, team: [['sneasel', 40], ['sneasel', 43]],
        before: 'My Sneasel are quick on the ice. Can you keep up?',
        defeat: 'You kept up.',
        after: 'If you fall back down, just climb up again. Nobody stays stuck here.' },
      { id: 'savannah', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Savannah', x: 9, y: 11, dir: 'up', sight: 1, team: [['snorunt', 39], ['snorunt', 40], ['glalie', 42]],
        before: 'Snorunt, Snorunt and Glalie: my frozen family!',
        defeat: 'The family has melted.',
        after: 'Snorunt live in caves full of snow. They are shy, but mine are not.' },
      { id: 'isaiah', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Isaiah', x: 9, y: 2, dir: 'down', sight: 1, team: [['piloswine', 43]],
        before: 'You crossed all the ice. But Candice is behind me!',
        defeat: 'My tusks were not enough.',
        after: 'Candice is ready for you. Good luck!' },
      { id: 'anton', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Anton', x: 5, y: 2, dir: 'down', sight: 1, team: [['glalie', 43]],
        before: 'Glalie froze a whole lake once. Well, a pond. A puddle!',
        defeat: 'Not even a puddle.',
        after: 'Ice is weak to Fire, Fighting, Rock and Steel, but it hits Grass, Ground, Flying and Dragon hard.' },
      { id: 'candice', who: 'candice', cls: 'leader', name: 'Candice', x: 7, y: 2, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 1 },
        team: [['sneasel', 39, ['slash', 'aerial-ace', 'feint-attack', 'ice-shard']],
               ['piloswine', 39, ['avalanche', 'stone-edge', 'earthquake', 'hail']],
               ['abomasnow', 41, ['avalanche', 'wood-hammer', 'water-pulse', 'focus-blast']],
               ['froslass', 43, ['blizzard', 'double-team', 'shadow-ball', 'psychic'], 'sitrus-berry']],
        before: 'Welcome to the coldest Gym in Sinnoh! I am Candice. I put my whole heart into everything: the ice, my Pokémon, even my scarf! Focus, now. Here we go!',
        defeat: 'Wow! You kept your head the whole way through!',
        win: 'snowpoint.candice-win',
        afterScript: [['say', 'When you focus with your whole heart, even a blizzard feels warm. Now go and see what is going on at the lake!', CANDICE]] }
    ]
  }, SINNOH));

  /** Lake Acuity: Barry has lost, Jupiter leaves with Uxie, and the chapter ends. */
  async function jupiter(h) {
    const F = G.Field;
    if (F.flag('jupiter-acuity')) return;
    await h.say(T('Is that all? You talk a lot for somebody so easy to beat.'), JUPITER);
    await h.say(T('Oh, it is you. I remember you from our building in Eterna. You have come all this way for nothing.'), JUPITER);
    await h.say(T('Uxie is already ours, the last of the three. Our boss will be very pleased.'), JUPITER);
    await h.say(T('If you want to complain, you know where Veilstone is. I would not bother, if I were you.'), JUPITER);
    await h.fade('out', 0.4);
    F.setFlag('jupiter-acuity');
    await h.fade('in', 0.4);
    await h.say(T('Team Galactic left Lake Acuity, and took Uxie with them.'));
    await h.say(T('I could not wait for you, so I climbed the slope the hard way and ran straight into her.'), BARRY);
    await h.say(T('And I lost. I said I would protect this lake, and I lost.'), BARRY);
    await h.say(T('I am not strong enough yet. I am going away to train, {player}. Next time I see that Commander, I will win!'), BARRY);
    await h.fade('out', 0.3);
    F.setFlag('barry-acuity');
    await h.fade('in', 0.3);
    // The end of the fifty-third chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(53); else F.setFlag('chapter-53-done');
  }

  G.Script.def({
    'route211.psych-up': [
      ['if', 'route211-tm77', [
        ['say', 'A clear mind can copy any good idea. That is all Psych Up is.']
      ], [
        ['say', 'I came here to clear my mind, and I have found that I do not need this any more. Take it.'],
        ['giveItem', 'tm77', 1],
        ['setFlag', 'route211-tm77'],
        ['say', 'TM77 is Psych Up. It copies every stat change the foe has made.']
      ]]
    ],
    'route216.lodge': [
      ['say', 'You look frozen, dear! Sit by the fire for a while.'],
      ['healAnim'], ['heal'],
      ['say', 'There, all warm again. Come back whenever the cold gets to you.']
    ],
    'snowpoint.barry-slope': [
      ['say', 'There you are, {player}! Took you long enough! Look at this slope: Lake Acuity is right up there!', BARRY],
      ['say', 'But the people around here say nobody gets up without the badge from the Snowpoint Gym. The town is just east of here.', BARRY],
      ['say', 'So go and win it! I will keep watch here. Nobody gets past me!', BARRY],
      ['setFlag', 'barry-lakefront']
    ],
    'snowpoint.barry-wait': [['say', 'The Gym is just east of here! Go on, I will keep watch on the slope.', BARRY]],
    'snowpoint.gym-guide': [
      ['say', 'Hey there, future Champion! Candice uses Ice Pokémon, and her Gym is all ice.'],
      ['say', 'On the ice you slide until something stops you. Use the rocks to stop in the right place.'],
      ['say', 'Fire, Fighting, Rock and Steel moves are what you want. Her Froslass is part Ghost, though, so Normal and Fighting moves do nothing to it.'],
      ['say', 'Up to level 60, your Pokémon from home will listen to you here.']
    ],
    'snowpoint.candice-win': [
      ['say', 'What focus! The Icicle Badge is yours.', CANDICE],
      ['badge', 31],
      ['jingle', 'badge'],
      ['say', '{player} received the Icicle Badge from Candice!'],
      ['say', 'With it, Pokémon up to level 70 will obey you here in Sinnoh, even ones from other regions.', CANDICE],
      ['say', 'And take TM72, Avalanche. It hits twice as hard when the foe has already hurt the user that turn!', CANDICE],
      ['giveItem', 'tm72', 1],
      ['say', 'With that badge you can go up the slope to Lake Acuity. People say they have seen strange grey uniforms up there.', CANDICE]
    ],
    'acuity.jupiter': [['js', jupiter]],
    // Chapter 61: the ship to the Battle Zone (battlezone.js).
    'snowpoint.sailor': [
      ['if', 'sinnoh-champion', [
        ['choice', 'Ahoy, Champion! Shall I take you to the Battle Zone?', [
          ['fade', 'out', 0.6], ['sfx', 'horn'],
          ['say', 'The ship sailed out across the northern sea...'],
          ['warp', 'fight-area', 'pier']
        ], [
          ['say', 'Any time. The sea is not going anywhere.', SAILOR]
        ], SAILOR]
      ], [
        ['say', 'This ship goes to the Battle Zone, and only Trainers who have beaten the Pokémon League may board.', SAILOR]
      ]]
    ]
  });
})();
