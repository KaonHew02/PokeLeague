/* ============ cerulean.js — Cerulean City and Misty's Gym ============
 * The end of chapter 2: Cerulean City (Center, Mart, the Bike Shop, two houses) and its
 * Gym, a swimming pool: Swimmer Luis, Picnicker Diana, then Leader Misty (Staryu Lv. 18,
 * Starmie Lv. 21). Beating her gives the Cascade Badge (badge 2) and TM03 Water Pulse.
 * North: Nugget Bridge (nugget.js). South: Route 5, once the thief who robbed a house is
 * caught (vermilion.js). East: Route 9 (later).
 */
G.Maps.def({
  id: 'cerulean', loc: 'cerulean-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door', if: 'badge:2' },
  rows: [
    'TTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTT',
    'TTT.............,,.............TTT',
    'TTT.GGGGGG......,,...CCCCC.....TTT',
    'TTT.GGGGGG......,,...CCCCC.....TTT',
    'TTT.GGGGGG......,,...CCCCC.....TTT',
    'T...GGGGGG......,,...CCDCC.....TTT',
    'T...GGGDGG.S....,,.....,.......TTT',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.c,',
    'T.............S.,,...............T',
    'T...............,,.........MMMM..T',
    'T...HHHH.HHHH...,,.........MMMM..T',
    'T...HHHH.HHHH...,,.........MMDM..T',
    'T...HDHH.HDHH...,,...........,...T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
    'T.......S.......,,...............T',
    'T...............,,...............T',
    'T...............,,...HHHH.~~~~~~~T',
    'T...............,,...HHHH.~~~~~~~T',
    'T.ffffffff......,,...HDHH.~~~~~~~T',
    'T.ff....ff......,,,,,,,...~~~~~~~T',
    'T.ff....ff......,,........~~~~~~~T',
    'T.ff....ff......,,........~~~~~~~T',
    'T.ffffffff......,,........~~~~~~~T',
    'T...............,,...............T',
    'T...............,,...............T',
    'TTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'route4', offset: -4 }, north: { map: 'route24', offset: 8 }, south: { map: 'route5', offset: 8 }, east: { map: 'route9', offset: 3 } },
  warps: [
    { x: 7, y: 6, to: 'cerulean-gym', spot: 'door' },
    { x: 23, y: 5, to: 'cerulean-center', spot: 'door' },
    { x: 29, y: 11, to: 'cerulean-mart', spot: 'door' },
    { x: 5, y: 12, to: 'cerulean-bikeshop', spot: 'door' },
    { x: 10, y: 12, to: 'cerulean-house', spot: 'door' },
    { x: 22, y: 18, to: 'cerulean-house2', spot: 'door' }
  ],
  spots: {
    west: [1, 7, 'right'], 'gym-door': [7, 7, 'down'], 'center-door': [23, 6, 'down'], 'mart-door': [29, 12, 'down'],
    'bike-door': [5, 13, 'down'], 'house-door': [10, 13, 'down'], 'house2-door': [22, 19, 'down']
  },
  signs: {
    '11,6': 'Cerulean City Pokémon Gym. Leader: Misty, the fearless Water-type Trainer!',
    '14,8': 'Cerulean City. A calm blue city where the river begins.',
    '8,14': 'Bike Shop: Bicycles for everyone!'
  },
  npcs: [
    { id: 'officer', who: 'officer', x: 16, y: 23, dir: 'up', if: '!caught-burglar', script: 'cerulean.officer' },
    { id: 'girl', who: 'lass', x: 25, y: 20, move: 'look',
      say: 'Misty trains her Pokémon in the Gym pool every day. Water types are tough to beat!' },
    { id: 'kid', who: 'youngster', x: 12, y: 15, move: 'wander', r: 2,
      say: 'Grass and Electric moves work great against Water-type Pokémon. Do you have any?' }
  ]
});

G.Maps.def({
  id: 'cerulean-gym', loc: 'cerulean-city', tileset: 'indoor', palette: 'pool', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWW',
    'WWWWWWWWWWWWW',
    '+++++++++++++',
    '+++++++++++++',
    '+~~~~+++~~~~+',
    '+~~~~+++~~~~+',
    '+~~~~+++~~~~+',
    '+~~~~+++~~~~+',
    '+~~~~+++~~~~+',
    '+~~~~+++~~~~+',
    '+~~~~+++~~~~+',
    '+~~~~+++~~~~+',
    '+++++++++++++',
    'p+++t+++t+++p',
    '++++++X++++++'
  ],
  warps: [{ x: 6, y: 14, to: 'cerulean', spot: 'gym-door' }],
  spots: { door: [6, 14, 'up'] },
  signs: {
    '4,13': 'Cerulean City Pokémon Gym. Leader: Misty. Winning Trainers: {rival}',
    '8,13': 'Cerulean City Pokémon Gym. Leader: Misty. Winning Trainers: {rival}'
  },
  npcs: [{ id: 'guide', who: 'guide', x: 10, y: 12, dir: 'left', script: 'cerulean.gym-guide' }],
  trainers: [
    { id: 'diana', who: 'lass', cls: 'picnicker', name: 'Diana', x: 7, y: 10, dir: 'left', sight: 2,
      team: [['goldeen', 19]],
      before: "You're here for Misty? You'll have to swim past me first!",
      defeat: 'I sank...',
      after: 'Misty is a real water expert. She trains here every single day.' },
    { id: 'luis', who: 'swimmer', cls: 'swimmer', name: 'Luis', x: 5, y: 7, dir: 'right', sight: 2,
      team: [['horsea', 16], ['shellder', 16]],
      before: 'Splash! Ready for a battle in the pool?',
      defeat: 'I got washed out!',
      after: 'Water types are weak to Grass and Electric. Misty knows it, so she trains even harder.' },
    { id: 'misty', who: 'misty', cls: 'leader', name: 'Misty', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['staryu', 18, ['tackle', 'harden', 'water-gun', 'rapid-spin']], ['starmie', 21, ['swift', 'water-pulse', 'recover', 'rapid-spin']]],
      before: "So you made it here! I'm Misty, Leader of the Cerulean Gym. My Water-type Pokémon never hold back, and neither do I. Ready?",
      defeat: "Wow, you're really strong! All right, you win.",
      win: 'cerulean.misty-win',
      afterScript: [
        ['say', 'Water Pulse can confuse the target. Use it well!', { name: 'Misty' }],
        ['say', "I'll keep training too. Next time, I won't lose!", { name: 'Misty' }]
      ] }
  ]
});

G.Maps.center('cerulean-center', {
  loc: 'cerulean-city', exit: { map: 'cerulean', spot: 'center-door' },
  npcs: [{ id: 'trainer', who: 'camper', x: 9, y: 5, move: 'look',
           say: 'Some Pokémon evolve when you use a special stone on them. A Moon Stone, for example!' }]
});

G.Maps.mart('cerulean-mart', {
  loc: 'cerulean-city', exit: { map: 'cerulean', spot: 'mart-door' },
  stock: ['poke-ball', 'potion', 'super-potion', 'repel', 'antidote', 'burn-heal', 'awakening', 'paralyze-heal']
});

G.Maps.def({
  id: 'cerulean-bikeshop', loc: 'cerulean-city', tileset: 'indoor', palette: 'mart', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    '==++++bbb++',
    '+++++++++++',
    '+++t++t++t+',
    '+++++++++++',
    '+++++++++++',
    '++++X++++++'
  ],
  warps: [{ x: 4, y: 7, to: 'cerulean', spot: 'bike-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: {
    '3,4': 'A shiny new Bicycle. The price tag says ₽1,000,000!',
    '6,4': 'A shiny new Bicycle. The price tag says ₽1,000,000!',
    '9,4': 'A shiny new Bicycle. The price tag says ₽1,000,000!'
  },
  npcs: [
    { id: 'owner', who: 'clerk', x: 1, y: 3, dir: 'down', script: 'cerulean.bike-shop' },
    { id: 'customer', who: 'youngster', x: 8, y: 6, move: 'look',
      say: "A million? Who has that much money? I'll keep walking, I guess." }
  ]
});

G.Maps.def({
  id: 'cerulean-house', loc: 'cerulean-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
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
  warps: [{ x: 4, y: 7, to: 'cerulean', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: { '0,2': 'The shelves are a mess. Someone went through them in a hurry.', '1,2': 'The shelves are a mess. Someone went through them in a hurry.' },
  npcs: [
    { id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left', script: 'cerulean.robbed-man' }
  ],
  trainers: [
    { id: 'burglar', who: 'rocket', cls: 'team-rocket', x: 1, y: 5, dir: 'right', sight: 3, if: ['got-ss-ticket', '!caught-burglar'],
      team: [['machop', 16], ['drowzee', 16]],
      before: "Huh? Who let you in? Nobody's supposed to know I'm hiding here!",
      defeat: 'Argh! Caught by a kid!',
      win: 'cerulean.burglar-win',
      after: '…' }
  ]
});

G.Maps.def({
  id: 'cerulean-house2', loc: 'cerulean-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bbb_p____bb',
    '___________',
    '___ttt_____',
    '___ttt_____',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'cerulean', spot: 'house2-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'granny', who: 'mom', x: 7, y: 4, dir: 'left',
      say: "Cerulean's water is the cleanest in Kanto. Even Misty's pool is filled from the river." },
    { id: 'boy', who: 'swimmer', x: 2, y: 5, move: 'wander', r: 1,
      say: "I'm practising to swim in Misty's Gym someday!" }
  ]
});

G.Script.def({
  // The Bike Voucher from the Fan Club chairman in Vermilion City buys the Bicycle.
  'cerulean.bike-shop': [
    ['if', 'got-bicycle', [
      ['say', 'How do you like your Bicycle? Ride it outside, on the roads and in caves. Not indoors, please!']
    ], [
      ['say', 'Welcome to the Bike Shop! Our finest Bicycle is only ₽1,000,000. A bargain, really!'],
      ['if', 'has:bike-voucher', [
        ['say', "Oh? That's a Bike Voucher! The Fan Club chairman sent you? Then this Bicycle is yours, free!"],
        ['takeItem', 'bike-voucher', 1],
        ['giveItem', 'bicycle', 1],
        ['setFlag', 'got-bicycle'],
        ['say', 'Use it from your Bag, or press the Bicycle button. Ride safely!']
      ]]
    ]]
  ],
  'cerulean.misty-win': [
    ['say', 'This is the Cascade Badge. It proves you beat me, fair and square!', { name: 'Misty' }],
    ['badge', 2],
    ['jingle', 'badge'],
    ['say', '{player} received the Cascade Badge from Misty!'],
    ['say', 'And take this TM too. TM03 is Water Pulse: it hits with a wave of water, and it may confuse the target.', { name: 'Misty' }],
    ['giveItem', 'tm03', 1],
    // The end of the second chapter (credits-ui.js).
    ['js', () => (G.CreditsUI ? G.CreditsUI.ending(2) : G.Field.setFlag('chapter-2-done'))]
  ],
  'cerulean.officer': [
    ['if', 'got-ss-ticket', [
      ['say', 'We think the thief is still hiding in the house he robbed. Nobody leaves town by this road until he is caught!']
    ], [
      ['say', 'Thieves broke into a house in town last night. The road south stays closed until we catch them.']
    ]]
  ],
  'cerulean.robbed-man': [
    ['if', 'caught-burglar', [
      ['say', 'You caught the thief! Thank you! Keep that TM. You have earned it.']
    ], [
      ['say', 'Thieves broke in last night and stole a TM! They wore black uniforms with a big red R...']
    ]]
  ],
  'cerulean.burglar-win': [
    ['say', 'Fine, fine! Take the stupid TM. I was going to sell it anyway...'],
    ['giveItem', 'tm28', 1],
    ['setFlag', 'caught-burglar'],
    ['say', 'The thief ran out of the house. The police officer outside caught him!']
  ],
  'cerulean.gym-guide': [
    ['if', 'badge:2', [
      ['say', 'You beat Misty! Two badges already. You are on your way to the League!']
    ], [
      ['say', 'Hey, future Champion! Misty uses Water-type Pokémon.'],
      ['say', 'Grass and Electric moves hit them hard. A Paras from Mt. Moon or a Pikachu from Viridian Forest would help a lot!'],
      ['say', 'Her Starmie is fast and can heal itself. Bring plenty of Potions!']
    ]]
  ]
});
