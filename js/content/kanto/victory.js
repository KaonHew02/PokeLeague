/* ============ victory.js — the League gate, Route 23 and Victory Road ============
 * Chapter 9, part 1. With eight badges the Pokémon League Front Gate on Route 22 opens (the rival
 * waits in front of it: route22.js) on Route 23: guards who check the badges, a river to Surf
 * across, and Victory Road, a cave of Strength puzzles on three floors:
 *   1F  a boulder pushed onto the floor switch opens the rock barrier on the way to the ladder
 *       (flag plate:victory-1f:11,17);
 *   3F  a boulder pushed into the hole falls to 2F, onto its switch (flag pit:victory-3f:10,12);
 *   2F  that opens the barrier to the way out, to the Indigo Plateau (league.js). Moltres rests in
 *       a quiet corner of 2F (Lv. 50, flag victory-moltres).
 * Seven Trainers on the way (Cool Trainers, a Juggler, a Black Belt, a PokéManiac, a Tamer).
 */
G.Maps.def({
  id: 'route22-gate', loc: 'kanto-route-22', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'p++++++p',
    '++++++++',
    '++++++++',
    'X++++++X'
  ],
  warps: [{ x: 0, y: 5, to: 'route22', spot: 'gate-door' }, { x: 7, y: 5, to: 'route23', spot: 'gate-door' }],
  spots: { west: [0, 5, 'up'], east: [7, 5, 'up'] },
  npcs: [{ id: 'guard', who: 'officer', x: 4, y: 2, dir: 'down',
           say: 'All eight badges! You may pass. Route 23 and Victory Road lie ahead, and beyond them the Pokémon League.' }]
});

G.Maps.def({
  id: 'route23', loc: 'kanto-route-23', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T######################T',
    'T######################T',
    'T##########O###########T',
    'T..........,...........T',
    'T..........,.S.........T',
    'T..""""""..,...........T',
    'T..""""""..,...""""""..T',
    'T..""""""..,...""""""..T',
    'T..""""""..,...""""""..T',
    'T..""""""..,...""""""..T',
    'T..........,...""""""..T',
    'T..........,...........T',
    'TTTTT......,.......TTTTT',
    'TTTTT......,.......TTTTT',
    'TTTTT......,.......TTTTT',
    'T..........,...........T',
    'T..........,...........T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'T..........,...........T',
    'T..........,...........T',
    'T..""""""..,...........T',
    'T..""""""..,...""""""..T',
    'T..""""""..,...""""""..T',
    'T..""""""..,...""""""..T',
    'T..""""""..,...""""""..T',
    'T..........,...""""""..T',
    'T..........,...........T',
    'TTTTTT.....,......TTTTTT',
    'TTTTTT.....,,,,...TTTTTT',
    'TTTTTT..BBBBBB,...TTTTTT',
    'T.......BBBBBB,........T',
    'T.......BBBBBB,........T',
    'T.......BBDBBB,........T',
    'T.........,,,,,........T',
    'T......................T',
    'TTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  warps: [
    { x: 10, y: 36, to: 'route22-gate', spot: 'east' },
    { x: 11, y: 3, to: 'victory-1f', spot: 'entrance' }
  ],
  spots: { 'gate-door': [10, 37, 'down'], 'cave-door': [11, 4, 'down'] },
  signs: { '13,5': 'Victory Road. Only the strongest Trainers make it through to the Pokémon League.' },
  npcs: [
    { id: 'guard1', who: 'officer', x: 12, y: 30, dir: 'left', move: 'look',
      say: 'Badge check! Boulder, Cascade, Thunder, Rainbow... Soul, Marsh, Volcano, Earth. All eight. Go ahead!' },
    { id: 'guard2', who: 'officer', x: 12, y: 15, dir: 'left', move: 'look',
      say: 'You crossed the river, so you know Surf. Victory Road needs Strength too. Is your team ready?' }
  ],
  items: [{ x: 21, y: 4, item: 'full-restore', flag: 'route23-hidden', hidden: true }],
  encounters: { walk: '@kanto-route-23-area' }
});

const VICTORY = { loc: 'kanto-victory-road-2', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true };

G.Maps.def(Object.assign({
  id: 'victory-1f',
  rows: [
    '##############################',
    '##############################',
    '##..........................##',
    '##........................%.##',
    '##....##....................##',
    '##....##....................##',
    '##..............###.........##',
    '##..............###.........##',
    '##..........................##',
    '##..........................##',
    '##..........................##',
    '############..################',
    '############..################',
    '############bb##............##',
    '##.##.........##............##',
    '##.##.........##....##......##',
    '##............##....##......##',
    '##.........x................##',
    '##..........................##',
    '##............##............##',
    '##............##............##',
    '####O#########################'
  ],
  warps: [{ x: 4, y: 21, to: 'route23', spot: 'cave-door' }, { x: 26, y: 3, to: 'victory-2f', spot: 'from-1f' }],
  spots: { entrance: [4, 20, 'up'], ladder: [26, 3, 'down'] },
  boulders: [{ id: 'b1', x: 6, y: 17 }],
  bars: [{ x: 12, y: 13, w: 2, h: 1, if: 'plate:victory-1f:11,17' }],
  trainers: [
    { id: 'naomi', who: 'cooltrainer', cls: 'cooltrainer', name: 'Naomi', x: 20, y: 4, dir: 'down', sight: 3,
      team: [['ponyta', 44], ['rapidash', 45], ['ninetales', 45]],
      before: 'You moved that boulder? Then you might be strong enough for the League. Prove it!',
      defeat: 'You really are strong enough.',
      after: 'Every Trainer on Victory Road wants to reach the League. Only a few ever do.' },
    { id: 'rolando', who: 'cooltrainer', cls: 'cooltrainer', name: 'Rolando', x: 22, y: 18, dir: 'left', sight: 4,
      team: [['ivysaur', 44], ['wartortle', 44], ['charmeleon', 44], ['charizard', 46]],
      before: 'I raised all three of Professor Oak\'s favourites. Can you beat them all?',
      defeat: 'All three... beaten.',
      after: 'Push the boulder onto the round switch. The rocks in the way will move.' }
  ],
  items: [
    { x: 26, y: 19, item: 'tm37', flag: 'victory-1f-tm37' },
    { x: 3, y: 3, item: 'max-revive', flag: 'victory-1f-revive' },
    { x: 27, y: 14, item: 'full-heal', flag: 'victory-1f-hidden', hidden: true }
  ],
  encounters: { walk: '@kanto-victory-road-2-1f' }
}, VICTORY));

G.Maps.def(Object.assign({
  id: 'victory-2f',
  rows: [
    '################################',
    '########################O#######',
    '##...........####.............##',
    '##...........####.............##',
    '##............................##',
    '##............................##',
    '##...........####....###......##',
    '##...........####....###......##',
    '##...........####....###......##',
    '##...........####.............##',
    '#################.............##',
    '#################.............##',
    '#################........###..##',
    '##.............##........###..##',
    '##......x......##.............##',
    '##..........%..##.............##',
    '##.............b..............##',
    '##....##.......b..............##',
    '##....##.......##.............##',
    '##..%..........##.............##',
    '##.............##.............##',
    '################################'
  ],
  warps: [
    { x: 4, y: 19, to: 'victory-1f', spot: 'ladder' },
    { x: 12, y: 15, to: 'victory-3f', spot: 'from-2f' },
    { x: 24, y: 1, to: 'indigo', spot: 'cave-door' }
  ],
  spots: { 'from-1f': [4, 19, 'down'], 'from-3f': [12, 15, 'down'], drop: [6, 15, 'down'], exit: [24, 2, 'down'] },
  // The boulder from 3F lands on the switch and stays there; the barrier opens with it.
  boulders: [{ id: 'fell', x: 8, y: 14, if: 'pit:victory-3f:10,12', fixed: true }],
  bars: [{ x: 15, y: 16, w: 1, h: 2, if: 'pit:victory-3f:10,12' }],
  npcs: [
    { id: 'moltres', who: 'moltres', mon: 'moltres', x: 4, y: 4, dir: 'down', fixed: true, if: '!victory-moltres', script: 'victory.moltres' }
  ],
  trainers: [
    { id: 'nelson', who: 'juggler', cls: 'juggler', name: 'Nelson', x: 20, y: 9, dir: 'down', sight: 3,
      team: [['drowzee', 44], ['hypno', 45], ['kadabra', 45]],
      before: 'Watch closely! My Pokémon will make you fall asleep on your feet!',
      defeat: 'I am the one who feels sleepy now...',
      after: 'The way out is just above. The Pokémon League is so close!' },
    { id: 'daisuke', who: 'blackbelt', cls: 'black-belt', name: 'Daisuke', x: 26, y: 15, dir: 'left', sight: 3,
      team: [['machoke', 45], ['machamp', 46]],
      before: 'Ossu! I trained in this cave for a whole year. Show me your power!',
      defeat: 'Another year of training, then.',
      after: 'Something huge and burning lives in the corner of this cave. I can feel its heat.' },
    { id: 'dawson', who: 'pokemaniac', cls: 'pokemaniac', name: 'Dawson', x: 8, y: 6, dir: 'right', sight: 3,
      team: [['charmeleon', 44], ['lapras', 45], ['lickitung', 44]],
      before: 'Shh! A legendary Pokémon sleeps over there. Battle quietly!',
      defeat: 'I lost... quietly.',
      after: 'They say the fire bird Moltres only shows itself to the strongest Trainers.' }
  ],
  items: [
    { x: 28, y: 19, item: 'full-restore', flag: 'victory-2f-restore' },
    { x: 11, y: 2, item: 'tm50', flag: 'victory-2f-tm50' }
  ],
  encounters: { walk: '@kanto-victory-road-2-2f' }
}, VICTORY));

G.Maps.def(Object.assign({
  id: 'victory-3f',
  rows: [
    '############################',
    '############################',
    '##........................##',
    '##..................##....##',
    '##..................##....##',
    '##..................##....##',
    '##...##...................##',
    '##...##........###........##',
    '##...##........###........##',
    '##.............###........##',
    '##........................##',
    '##......##.##.............##',
    '##......##o##.............##',
    '##......##.##.............##',
    '##........................##',
    '##..%.....................##',
    '##........................##',
    '############################'
  ],
  warps: [{ x: 4, y: 15, to: 'victory-2f', spot: 'from-3f' }, { x: 10, y: 12, to: 'victory-2f', spot: 'drop' }],
  spots: { 'from-2f': [4, 15, 'down'] },
  boulders: [{ id: 'b3', x: 10, y: 9 }],
  trainers: [
    { id: 'vera', who: 'cooltrainer', cls: 'cooltrainer', name: 'Vera', x: 14, y: 4, dir: 'down', sight: 4,
      team: [['bellsprout', 44], ['weepinbell', 45], ['victreebel', 46]],
      before: 'This is the top of Victory Road. Turn back while you still can!',
      defeat: 'You will not turn back, will you?',
      after: 'A boulder dropped through that hole lands on the floor below. Think about where.' },
    { id: 'brice', who: 'tamer', cls: 'tamer', name: 'Brice', x: 20, y: 12, dir: 'left', sight: 4,
      team: [['arbok', 46], ['tauros', 46]],
      before: 'My Pokémon are wild at heart, but they obey me. Let us see if yours do!',
      defeat: 'They obeyed you better than mine obeyed me.',
      after: 'The Elite Four are waiting at the Indigo Plateau. Heal up before you face them.' }
  ],
  items: [
    { x: 24, y: 3, item: 'max-elixir', flag: 'victory-3f-elixir' },
    { x: 3, y: 3, item: 'rare-candy', flag: 'victory-3f-hidden', hidden: true }
  ],
  encounters: { walk: '@kanto-victory-road-2-3f' }
}, VICTORY));

G.Script.def({
  'victory.moltres': [
    ['say', 'The air ripples with heat. A great bird wreathed in flames spreads its wings!'],
    ['sfx', 'cry'],
    ['wild', 'moltres', 50],
    ['if', ['battle!=run', 'battle!=lose'], [
      ['setFlag', 'victory-moltres'],
      ['hide', 'moltres']
    ], [
      ['if', 'battle=run', [['say', 'Moltres is still watching you, its flames flickering.']]]
    ]]
  ]
});
