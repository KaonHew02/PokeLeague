/* ============ viridian.js — Viridian City ============
 * The errand that opens the way north (the texts are our own, the events follow the games):
 *   1. The Poké Mart clerk hands you Oak's Parcel (flag got-parcel); the shop stays
 *      closed until it is delivered.
 *   2. Oak, in Pallet Town, swaps it for the Pokédex and five Poké Balls (pallet.js:
 *      parcel-delivered, has-pokedex); Daisy then gives you a Town Map.
 *   3. An old man and his granddaughter block the road to Route 2 until you have a
 *      Pokédex; afterwards he gives catching tips.
 * The Gym is locked: its leader is away (he comes back at the end of Kanto).
 */
G.Maps.def({
  id: 'viridian', loc: 'viridian-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTT',
    'T................,,..........T',
    'T..GGGGGG........,,..........T',
    'T..GGGGGG........,,..MMMM....T',
    'T..GGGGGG........,,..MMMM....T',
    'T..GGGGGG........,,..MMDM....T',
    'T..GGGDGG..S.....,,....,.....T',
    'T.....,..........,,....,.....T',
    'T.....,,,,,,,,,,,,,,,,,,.....T',
    'T................,,..........T',
    'T..~~~~~.........,,..CCCCC...T',
    'T.~~~~~~~........,,..CCCCC...T',
    'T.~~~~~~~........,,..CCCCC...T',
    'T..~~~~~.........,,..CCDCC...T',
    'T................,,,,,,,.....T',
    'T......HHHH......,,..........T',
    'T......HHHH......,,..HHHH....T',
    'T......HDHH......,,..HHHH....T',
    'T.......,........,,..HHDH....T',
    'T.......,,,,,,,,,,,,,,,,.....T',
    'T........S.......,,..........T',
    'T................,,..........T',
    'TT..ff...........,,.......ffTT',
    'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTT'
  ],
  connect: { south: { map: 'route1', offset: 8 }, north: { map: 'route2', offset: 8 } },
  warps: [
    { x: 6, y: 6, locked: 'viridian.gym-locked' },
    { x: 23, y: 5, to: 'viridian-mart', spot: 'door' },
    { x: 23, y: 13, to: 'viridian-center', spot: 'door' },
    { x: 8, y: 17, to: 'viridian-school', spot: 'door' },
    { x: 23, y: 18, to: 'viridian-house', spot: 'door' }
  ],
  spots: {
    south: [17, 22, 'up'], north: [17, 1, 'down'],
    'mart-door': [23, 6, 'down'], 'center-door': [23, 14, 'down'],
    'school-door': [8, 18, 'down'], 'house-door': [23, 19, 'down']
  },
  signs: {
    '11,6': 'Viridian City Pokémon Gym',
    '9,20': 'Viridian City. A city where the trees stay green all year round.'
  },
  npcs: [
    { id: 'oldman', who: 'oldman', x: 17, y: 2, dir: 'down', if: '!has-pokedex', script: 'viridian.oldman-grumpy' },
    { id: 'granddaughter', who: 'lass', x: 18, y: 2, dir: 'down', if: '!has-pokedex', script: 'viridian.girl-sorry' },
    { id: 'oldman-tips', who: 'oldman', x: 15, y: 3, dir: 'right', if: 'has-pokedex', script: 'viridian.oldman-tips' },
    { id: 'girl-happy', who: 'lass', x: 20, y: 3, dir: 'left', if: 'has-pokedex',
      say: "Grandpa's in a much better mood now. He finally had his morning coffee!" },
    { id: 'kid', who: 'youngster', x: 13, y: 6, move: 'wander', r: 1,
      say: "The Gym here is always shut. I wonder who the leader even is..." },
    { id: 'lady', who: 'lass', x: 10, y: 12, move: 'look',
      say: 'When your Pokémon get hurt, take them to the Pokémon Center. It costs nothing!' }
  ]
});

G.Maps.center('viridian-center', {
  loc: 'viridian-city', exit: { map: 'viridian', spot: 'center-door' },
  npcs: [{ id: 'boy', who: 'youngster', x: 3, y: 5, move: 'look',
           say: 'The PC in the corner connects to the Pokémon Storage System. Handy when your party is full!' }]
});

(() => {
  const STOCK = ['poke-ball', 'potion', 'antidote', 'paralyze-heal', 'burn-heal'];
  G.Maps.mart('viridian-mart', {
    loc: 'viridian-city', exit: { map: 'viridian', spot: 'mart-door' }, stock: STOCK, enter: 'viridian.mart-enter',
    clerk: [
      ['if', 'parcel-delivered', [
        ['say', 'Hi there! What can I get for you today?'],
        ['shop', STOCK]
      ], [
        ['say', 'Please take that parcel to Professor Oak in Pallet Town. Thanks so much!']
      ]]
    ],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'Potions heal your Pokémon anywhere. I always carry a few!' }]
  });
})();

G.Maps.def({
  id: 'viridian-school', loc: 'viridian-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    '__bbbbb____',
    '___________',
    '__t_t_t____',
    '___________',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'viridian', spot: 'school-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: {
    '2,2': "The blackboard reads: a Pokémon's status problems stay after battle. Heal them with items or at a Pokémon Center!",
    '3,2': "The blackboard reads: a Pokémon's status problems stay after battle. Heal them with items or at a Pokémon Center!",
    '4,2': "The blackboard reads: a Pokémon's status problems stay after battle. Heal them with items or at a Pokémon Center!",
    '5,2': "The blackboard reads: a Pokémon's status problems stay after battle. Heal them with items or at a Pokémon Center!",
    '6,2': "The blackboard reads: a Pokémon's status problems stay after battle. Heal them with items or at a Pokémon Center!"
  },
  npcs: [
    { id: 'student', who: 'youngster', x: 3, y: 5, dir: 'up',
      say: "I'm studying to be a great Trainer! Did you know you can switch Pokémon in the middle of a battle?" },
    { id: 'student2', who: 'lass', x: 7, y: 5, dir: 'up',
      say: 'A Pokémon that holds back its moves runs out of PP more slowly. Wait, is that right? I need to study more...' }
  ]
});

G.Maps.def({
  id: 'viridian-house', loc: 'viridian-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bb__p______',
    '___________',
    '____ttt____',
    '____ttt____',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'viridian', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: { '0,2': 'A shelf of books about raising Pokémon.', '1,2': 'A shelf of books about raising Pokémon.' },
  npcs: [
    { id: 'dad', who: 'guide', x: 7, y: 4, dir: 'left',
      say: 'Raise your Pokémon with care and they grow strong. Some even evolve into a whole new form!' },
    { id: 'girl', who: 'lass', x: 2, y: 5, move: 'wander', r: 1,
      say: 'You can give a Pokémon a nickname when you catch it. Mine is called Fluffy!' }
  ]
});

G.Script.def({
  'viridian.gym-locked': [
    ['say', "The Gym's doors are locked tight..."],
    ['say', 'A note on the door says the Gym Leader is away.']
  ],
  'viridian.oldman-grumpy': [
    ['say', "Hmph! I'm not moving from this spot. Go away!"]
  ],
  'viridian.girl-sorry': [
    ['say', "Sorry! Grandpa gets like this before his morning coffee. He won't let anyone pass."]
  ],
  'viridian.oldman-tips': [
    ['say', "Ah, you carry a Pokédex now? Then listen to an old man's advice."],
    ['say', 'First, battle a wild Pokémon to weaken it. Then throw a Poké Ball. The weaker it is, the easier it is to catch!'],
    ['say', 'A sleeping or paralysed Pokémon is easier still. Off you go now!']
  ],
  'viridian.mart-enter': [
    ['if', '!got-parcel', [
      ['say', 'Hey! You came from Pallet Town, right?', { name: 'Clerk' }],
      ['say', 'You know Professor Oak? His order just came in. Would you take it to him for me?', { name: 'Clerk' }],
      ['giveItem', 'oaks-parcel', 1],
      ['setFlag', 'got-parcel'],
      ['say', "Thanks! Say hello to the professor for me.", { name: 'Clerk' }]
    ]]
  ]
});
