/* ============ saffron.js — Saffron City, its gates, the Fighting Dojo ============
 * Chapter 6, part 2. The city in the middle of Kanto. Its four gates were shut: a thirsty
 * guard lets you through for a drink from the Celadon rooftop (script celadon.saffron-gate,
 * flag saffron-open; Routes 7 and 8 have gate houses, Routes 5 and 6 a guard on the road).
 * Team Rocket holds Silph Co. (silph.js): Grunts stand in the streets and in front of the Gym
 * until Giovanni is beaten there (flag silph-cleared). Pokémon Center, Mart, Mr. Psychic (TM29
 * Psychic), a house, the Fighting Dojo (four Black Belts and their master; then Hitmonlee or
 * Hitmonchan, one of the two) and Sabrina's Gym (sabrina.js).
 */
G.Maps.def({
  id: 'saffron', loc: 'saffron-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door', if: 'badge:6' },
  rows: [
    'TTTTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTTTTTT',
    'T..................,...................T',
    'T..................,.......GGGGGG......T',
    'T..HHHH............,BBBBBB.GGGGGG......T',
    'T..HHHH............,BBBBBB.GGGGGG......T',
    'T..HDHH............,BBBBBB.GGGGGG......T',
    'T...,..............,BBDBBB.GGGDGG......T',
    'T...,..............,..,.S.....,..S.....T',
    'T...,............S.,..,.......,........T',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
    'T..........,,..YYYYYYYY...,,...........T',
    'T..........,,..YYYYYYYY...,,...........T',
    'T..CCCCC...,,..YYYYYYYY...,,..MMMM.....T',
    'T..CCCCC...,,..YYYYYYYY...,,..MMMM.....T',
    'T..CCCCC...,,..YYYYYYYY...,,..MMDM.....T',
    'T..CCDCC...,,..YYYDYYYY...,,....,......T',
    'T....,,,,,,,,.S...,,......,,....,......T',
    'T..........,,......,......,,....,......T',
    'T..........,,......,......,,....,......T',
    'T..........,,......,......,,....,......T',
    'BBBBBB.....,,......,......,,....,.BBBBBB',
    'BBBBBB.....,,......,......,,....,.BBBBBB',
    'BBBBBB.....,,......,......,,....,.BBBBBB',
    'BBDBBB.....,,......,......,,....,.BBBDBB',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
    'T..................,....,..............T',
    'T..................,...HHHH............T',
    'T.......TT....TT...,...HHHH............T',
    'T..................,...HDHH....TT......T',
    'T..................,...................T',
    'T..................,...................T',
    'TTTTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { north: { map: 'route5', offset: 11 }, south: { map: 'route6', offset: 11 } },
  warps: [
    { x: 30, y: 6, to: 'saffron-gym', spot: 'door' },
    { x: 22, y: 6, to: 'saffron-dojo', spot: 'door' },
    { x: 4, y: 5, to: 'saffron-psychic', spot: 'door' },
    { x: 5, y: 16, to: 'saffron-center', spot: 'door' },
    { x: 18, y: 16, to: 'silph-1f', spot: 'door' },
    { x: 32, y: 15, to: 'saffron-mart', spot: 'door' },
    { x: 2, y: 24, to: 'saffron-gate-west', spot: 'east' },
    { x: 37, y: 24, to: 'saffron-gate-east', spot: 'west' },
    { x: 24, y: 30, to: 'saffron-house', spot: 'door' }
  ],
  spots: {
    north: [19, 1, 'down'], south: [19, 32, 'up'], 'gym-door': [30, 7, 'down'], 'dojo-door': [22, 7, 'down'],
    'psychic-door': [4, 6, 'down'], 'center-door': [5, 17, 'down'], 'silph-door': [18, 17, 'down'], 'mart-door': [32, 16, 'down'],
    'west-gate': [2, 25, 'down'], 'east-gate': [37, 25, 'down'], 'house-door': [24, 31, 'down']
  },
  signs: {
    '17,8': 'Saffron City. A shining city of gold, at the heart of Kanto.',
    '14,17': 'Silph Co. Head Office. Makers of Poké Balls and much more.',
    '33,7': 'Saffron City Pokémon Gym. Leader: Sabrina, the mistress of Psychic Pokémon!',
    '24,7': 'Fighting Dojo. Everyone is welcome to train!'
  },
  npcs: [
    { id: 'gymguard', who: 'rocket', x: 30, y: 7, dir: 'down', if: '!silph-cleared',
      say: 'The Gym? Nobody goes in or out until the Boss is done with Silph Co. Beat it, kid!' },
    { id: 'grunt1', who: 'rocket', x: 14, y: 21, move: 'wander', r: 2, if: '!silph-cleared',
      say: 'Saffron belongs to Team Rocket now. Get used to it!' },
    { id: 'grunt2', who: 'rocket', x: 29, y: 20, move: 'wander', r: 2, if: '!silph-cleared',
      say: 'Silph Co. makes the best Poké Balls in the world. Soon they will make them only for us!' },
    { id: 'woman', who: 'mom', x: 9, y: 20, move: 'look', if: '!silph-cleared',
      say: 'Those men in black took over the Silph Co. building. Everyone is too scared to go outside.' },
    { id: 'woman2', who: 'mom', x: 9, y: 20, move: 'look', if: 'silph-cleared',
      say: 'Team Rocket is gone! You did it? Thank you! The whole city can breathe again.' },
    { id: 'boy', who: 'youngster', x: 24, y: 19, move: 'wander', r: 2, if: 'silph-cleared',
      say: 'Silph Co. is open again. I want to see where they make Master Balls!' }
  ],
  encounters: {}
});

G.Maps.center('saffron-center', {
  loc: 'saffron-city', exit: { map: 'saffron', spot: 'center-door' },
  npcs: [{ id: 'lass', who: 'lass', x: 9, y: 5, move: 'look',
           say: 'Sabrina can bend spoons with her mind, they say. Her Psychic Pokémon fear Bug, Ghost and Dark moves.' }]
});

G.Maps.mart('saffron-mart', {
  loc: 'saffron-city', exit: { map: 'saffron', spot: 'mart-door' },
  stock: ['ultra-ball', 'great-ball', 'hyper-potion', 'max-repel', 'escape-rope', 'full-heal', 'revive']
});

// The gates: two exit mats, west and east.
G.Maps.def({
  id: 'saffron-gate-west', loc: 'saffron-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'p++++++p',
    '++++++++',
    '++++++++',
    'X++++++X'
  ],
  warps: [{ x: 0, y: 5, to: 'route7', spot: 'gate-door' }, { x: 7, y: 5, to: 'saffron', spot: 'west-gate' }],
  spots: { west: [0, 5, 'up'], east: [7, 5, 'up'] },
  npcs: [{ id: 'guard', who: 'officer', x: 4, y: 3, dir: 'down',
           say: 'Thanks again for the drink! Saffron City is just through here. Watch out for Team Rocket.' }]
});

G.Maps.def({
  id: 'saffron-gate-east', loc: 'saffron-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'p++++++p',
    '++++++++',
    '++++++++',
    'X++++++X'
  ],
  warps: [{ x: 0, y: 5, to: 'saffron', spot: 'east-gate' }, { x: 7, y: 5, to: 'route8', spot: 'gate-door' }],
  spots: { west: [0, 5, 'up'], east: [7, 5, 'up'] },
  npcs: [{ id: 'guard', who: 'officer', x: 4, y: 3, dir: 'down',
           say: 'This gate joins Saffron City and Route 8. Lavender Town is further east.' }]
});

G.Maps.def({
  id: 'saffron-psychic', loc: 'saffron-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'bb__t__p',
    '________',
    '___rr___',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'saffron', spot: 'psychic-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [{ id: 'psychic', who: 'psychic', x: 5, y: 3, dir: 'down', script: 'saffron.mr-psychic' }]
});

G.Maps.def({
  id: 'saffron-house', loc: 'saffron-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'bb__t__p',
    '________',
    '___rr___',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'saffron', spot: 'house-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [
    { id: 'man', who: 'gentleman', x: 5, y: 3, dir: 'left', move: 'look',
      say: 'My son works at Silph Co. He says they were building a Poké Ball that catches any Pokémon. Any at all!' },
    { id: 'girl', who: 'lass', x: 1, y: 4, dir: 'right', move: 'look',
      say: 'The Gym used to be a karate dojo too, but the Psychic Gym won the right to be the official one.' }
  ]
});

G.Maps.def({
  id: 'saffron-dojo', loc: 'saffron-city', tileset: 'indoor', palette: 'dojo', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    'p++++++++++p',
    '++++++++++++',
    '+rrrrrrrrrr+',
    '+rrrrrrrrrr+',
    '+rrrrrrrrrr+',
    '+rrrrrrrrrr+',
    '++++++++++++',
    '+++++X++++++'
  ],
  warps: [{ x: 5, y: 9, to: 'saffron', spot: 'dojo-door' }],
  spots: { door: [5, 9, 'up'] },
  npcs: [
    { id: 'lee', who: 'hitmonlee', mon: 'hitmonlee', x: 3, y: 3, dir: 'down', fixed: true, if: '!got-hitmonlee', script: 'dojo.lee' },
    { id: 'chan', who: 'hitmonchan', mon: 'hitmonchan', x: 8, y: 3, dir: 'down', fixed: true, if: '!got-hitmonchan', script: 'dojo.chan' }
  ],
  trainers: [
    { id: 'mike', who: 'blackbelt', cls: 'black-belt', name: 'Mike', x: 1, y: 7, dir: 'right', sight: 3,
      team: [['mankey', 33], ['primeape', 34]],
      before: 'Hyaah! Show me your fighting spirit!',
      defeat: 'Oof! My spirit is broken...',
      after: 'Our master trains from dawn until night. We can hardly keep up.' },
    { id: 'hitoshi', who: 'blackbelt', cls: 'black-belt', name: 'Hitoshi', x: 10, y: 6, dir: 'left', sight: 3,
      team: [['machop', 33], ['machoke', 34]],
      before: 'A challenger! Let our fists do the talking!',
      defeat: 'My fists have nothing more to say.',
      after: 'Fighting moves are strong against Normal and Rock types. Remember that.' },
    { id: 'aaron', who: 'blackbelt', cls: 'black-belt', name: 'Aaron', x: 1, y: 5, dir: 'right', sight: 3,
      team: [['primeape', 34], ['machoke', 34]],
      before: 'This dojo lost to the Psychic Gym, but we never stopped training!',
      defeat: 'We still have work to do.',
      after: 'Psychic Pokémon are our weakness. That is why we train twice as hard.' },
    { id: 'atsushi', who: 'blackbelt', cls: 'black-belt', name: 'Atsushi', x: 10, y: 4, dir: 'left', sight: 3,
      team: [['mankey', 34], ['machop', 34], ['primeape', 35]],
      before: 'Only the strongest may face our master. Prove yourself!',
      defeat: 'You are worthy. Go on.',
      after: 'If you beat the master, he may give you one of his prized Pokémon.' },
    { id: 'master', who: 'blackbelt', cls: 'black-belt', name: 'Hideki', x: 5, y: 2, dir: 'down', sight: 2, ai: 'leader',
      team: [['hitmonlee', 36], ['hitmonchan', 36]],
      before: 'I am Hideki, master of this dojo. My Pokémon and I have trained for twenty years. Face us!',
      defeat: 'Hwaah! You are stronger than I thought!',
      win: 'dojo.master-win',
      after: 'Take one of my prized Pokémon, and train it well.' }
  ]
});

(() => {
  const DRINKS = ['fresh-water', 'soda-pop', 'lemonade'];
  const MASTER = { name: 'Hideki' };

  /** A prized Pokémon of the dojo: only after beating the master, and only one of the two. */
  const gift = (sp, take) => [
    ['if', '!done:saffron-dojo:master', [
      ['say', 'One of the master\'s prized Pokémon. It is watching you closely.']
    ], [
      ['if', 'dojo-gift', [
        ['say', 'You already have one of the master\'s Pokémon. Do not be greedy!', MASTER]
      ], [
        ['choice', 'Will you take this Pokémon?', [
          ['setFlag', 'dojo-gift'],
          ...take,
          ['giveMon', sp, 25, { nickname: true }],
          ['hide', sp === 'hitmonlee' ? 'lee' : 'chan']
        ], []]
      ]]
    ]]
  ];

  G.Script.def({
    'celadon.saffron-gate': [
      ['say', 'A guard blocks the gate: Saffron City is closed. Nobody gets through.'],
      ['say', 'Phew, it\'s hot... I\'d give anything for something to drink.', { name: 'Guard' }],
      ['if', () => DRINKS.some(d => G.Field.count(d) > 0), [
        ['choice', 'Give the guard a drink?', [
          ['js', () => { const d = DRINKS.find(x => G.Field.count(x) > 0); G.Field.takeItem(d, 1); }],
          ['say', 'The guard gulped it down in one go.'],
          ['say', 'Ahh! That hit the spot. Thank you! You can go through. I will tell the other gates too.', { name: 'Guard' }],
          ['setFlag', 'saffron-open']
        ], []]
      ]]
    ],
    'saffron.mr-psychic': [
      ['if', 'got-tm29', [
        ['say', 'TM29 is Psychic. It may lower the foe\'s Special Defense. ...But you knew that already.', { name: 'Mr. Psychic' }]
      ], [
        ['say', 'Hmm... You came here for something. Yes, I know. I always know.', { name: 'Mr. Psychic' }],
        ['say', 'Take this. You wanted it, did you not?', { name: 'Mr. Psychic' }],
        ['setFlag', 'got-tm29'],
        ['giveItem', 'tm29', 1]
      ]]
    ],
    'dojo.master-win': [
      ['say', 'You have earned it. Take one of my prized Pokémon: Hitmonlee, the kicking fiend, or Hitmonchan, the punching fiend.', MASTER]
    ],
    'dojo.lee': gift('hitmonlee', [['setFlag', 'got-hitmonlee']]),
    'dojo.chan': gift('hitmonchan', [['setFlag', 'got-hitmonchan']])
  });
})();
