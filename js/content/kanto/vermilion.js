/* ============ vermilion.js — Route 5, the Underground Path, Route 6 and Vermilion City ============
 * South of Cerulean City (the texts are our own; the events follow the games):
 *   - The road south opens once the thief hiding in the robbed house is beaten (cerulean.js,
 *     flag caught-burglar). Route 5 leads to the Underground Path, a tunnel under Saffron
 *     City, and Route 6 to Vermilion City. Guards stand on both roads into Saffron until one
 *     of them gets a drink (saffron.js, flag saffron-open).
 *   - Vermilion: the Pokémon Center, the Mart, the Pokémon Fan Club, the harbour where the
 *     S.S. Anne is docked (ssanne.js; a sailor checks the ticket) and Lt. Surge's Gym, behind
 *     a tree that only Cut clears (the captain of the S.S. Anne teaches it).
 */
G.Maps.def({
  id: 'route5', loc: 'kanto-route-5', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTT,,TTTTTTTTTTTTTT',
    'T.......,,.............T',
    'T.......,,.............T',
    'T.""""".,,...."""""""..T',
    'T.""""".,,...."""""""..T',
    'T.""""".,,...."""""""..T',
    'T.""""".,,...."""""""..T',
    'T.""""".,,...."""""""..T',
    'T.......,,...."""""""..T',
    'T.......,,.............T',
    'T.......,,.............T',
    'T.""""".,,.S...........T',
    'T.""""".,,..HHHH.TTTTT.T',
    'T.""""".,,..HHHH.TTTTT.T',
    'T.""""".,,..HDHH.TTTTT.T',
    'T.""""".,,,,,,...TTTTT.T',
    'T."""""S.........TTTTT.T',
    'T.........FFFFFF.TTTTT.T',
    'T.........FFFFFF.......T',
    'TTTTTTTT,TTTTTTTTTTTTTTT'
  ],
  connect: { north: { map: 'cerulean', offset: -8 }, south: { map: 'saffron', offset: -11 } },
  warps: [{ x: 13, y: 14, to: 'underground-north', spot: 'door' }],
  spots: { north: [8, 1, 'down'], 'under-door': [13, 15, 'down'] },
  signs: {
    '11,11': 'Underground Path. Route 5 to Route 6, under Saffron City.',
    '7,16': 'South: Saffron City.'
  },
  npcs: [
    { id: 'girl', who: 'lass', x: 4, y: 9, move: 'look',
      say: "Saffron City's gates are all shut. People use the Underground Path to get around it." },
    { id: 'guard', who: 'officer', x: 8, y: 19, dir: 'up', if: '!saffron-open', script: 'celadon.saffron-gate' }
  ],
  encounters: { walk: '@kanto-route-5-area' }
});

G.Maps.def({
  id: 'underground-north', loc: 'kanto-underground-path', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWW', 'WWWWWWWWW', 'b____^___', '_________', '_________', '____X____'],
  warps: [{ x: 4, y: 5, to: 'route5', spot: 'under-door' }, { x: 5, y: 2, to: 'underground-path', spot: 'north' }],
  spots: { door: [4, 5, 'up'], stairs: [5, 3, 'down'] },
  signs: { '0,2': 'Maps of the Underground Path, and a sign: Mind your step on the stairs!' },
  npcs: [{ id: 'guard', who: 'officer', x: 2, y: 3, dir: 'right', say: 'The Underground Path takes you all the way to Route 6. It is quite a walk!' }]
});

G.Maps.def({
  id: 'underground-path', loc: 'kanto-underground-path', tileset: 'indoor', palette: 'gym', music: 'cave', battleBg: 'indoor',
  rows: [
    'WWWWWWW', 'WWWWWWW', 'WW+^+WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+++WW',
    'WW+^+WW', 'WWWWWWW'
  ],
  warps: [{ x: 3, y: 2, to: 'underground-north', spot: 'stairs' }, { x: 3, y: 33, to: 'underground-south', spot: 'stairs' }],
  spots: { north: [3, 3, 'down'], south: [3, 32, 'up'] },
  npcs: [{ id: 'walker', who: 'gentleman', x: 4, y: 18, dir: 'up', say: 'I walk this tunnel every day. Good exercise, and no rain!' }],
  items: [
    { x: 2, y: 11, item: 'elixir', flag: 'underground-elixir', hidden: true },
    { x: 4, y: 26, item: 'super-potion', flag: 'underground-super-potion', hidden: true }
  ]
});

G.Maps.def({
  id: 'underground-south', loc: 'kanto-underground-path', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWW', 'WWWWWWWWW', 'b____^___', '_________', '_________', '____X____'],
  warps: [{ x: 4, y: 5, to: 'route6', spot: 'under-door' }, { x: 5, y: 2, to: 'underground-path', spot: 'south' }],
  spots: { door: [4, 5, 'up'], stairs: [5, 3, 'down'] },
  signs: { '0,2': 'Maps of the Underground Path. Vermilion City is just south of here.' }
});

G.Maps.def({
  id: 'route6', loc: 'kanto-route-6', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTT,TTTTTTTTTTTTTTT',
    'T......................T',
    'TTTTT..HHHH..TTTTTTTT..T',
    'TTTTT..HHHH..TTTTTTTT..T',
    'TTTTT..HDHH............T',
    'T.......,,.............T',
    'T.......,,.............T',
    'T.""""".,,..."""""""...T',
    'T.""""".,,..."""""""...T',
    'T.""""".,,..."""""""...T',
    'T.""""".,,..."""""""...T',
    'T.""""".,,.............T',
    'T.......,,.............T',
    'T.......,,.............T',
    'T.......,,...~~~~~~~~..T',
    'T.......,,...~~~~~~~~..T',
    'T.""""".,,...~~~~~~~~..T',
    'T.""""".,,...~~~~~~~~..T',
    'T.""""".,,...~~~~~~~~..T',
    'T.""""".,,...~~~~~~~~..T',
    'T.""""".,,.............T',
    'T.......,,S............T',
    'T.......,,.............T',
    'TTTTTTTT,,TTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'vermilion', offset: -8 }, north: { map: 'saffron', offset: -11 } },
  warps: [{ x: 8, y: 4, to: 'underground-south', spot: 'door' }],
  spots: { 'under-door': [8, 5, 'down'], south: [8, 22, 'up'] },
  signs: { '10,21': 'Route 6. South: Vermilion City. North: Saffron City.' },
  trainers: [
    { id: 'ricky', who: 'camper', cls: 'camper', name: 'Ricky', x: 7, y: 8, dir: 'right', sight: 1,
      team: [['squirtle', 20]],
      before: "My Squirtle and I have been training by the pond. Let's battle!",
      defeat: 'We need more training...',
      after: 'Water Pokémon love this pond. So do I!' },
    { id: 'nancy', who: 'lass', cls: 'picnicker', name: 'Nancy', x: 10, y: 11, dir: 'left', sight: 1,
      team: [['rattata', 16], ['pikachu', 16]],
      before: "A picnic is more fun after a battle! Let's go!",
      defeat: 'My picnic is ruined...',
      after: 'Want a sandwich? Just kidding, I ate them all.' },
    { id: 'keigo', who: 'bugcatcher', cls: 'bug-catcher', name: 'Keigo', x: 7, y: 15, dir: 'right', sight: 1,
      team: [['weedle', 16], ['caterpie', 16], ['weedle', 16]],
      before: 'I came all the way from Viridian Forest to find new bugs!',
      defeat: 'My bugs were not ready for the big city.',
      after: 'Vermilion is a port town. Lots of sailors there.' },
    { id: 'jeff', who: 'camper', cls: 'camper', name: 'Jeff', x: 10, y: 18, dir: 'left', sight: 1,
      team: [['spearow', 16], ['raticate', 16]],
      before: 'Are you going to see the big ship in Vermilion? Battle first!',
      defeat: 'You win! Go and see the ship.',
      after: 'The S.S. Anne only stops here once a year. Lucky!' }
  ],
  npcs: [{ id: 'guard', who: 'officer', x: 8, y: 0, dir: 'down', if: '!saffron-open', script: 'celadon.saffron-gate' }],
  encounters: { walk: '@kanto-route-6-area' }
});

G.Maps.def({
  id: 'vermilion', loc: 'vermilion-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTT',
    'T...............,,...............T',
    'T..CCCCC........,,...MMMM........T',
    'T..CCCCC........,,...MMMM........T',
    'T..CCCCC........,,...MMDM........T',
    'T..CCDCC........,,.....,.........T',
    'T....,..........,,.....,.........T',
    'T....,..........,,.....,.........T',
    'T....,........S.,,.....,.........T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.................................',
    'TTT......TTTTTT.,,........HHHH...T',
    'TTT......TTTTTT.,,........HHHH...T',
    'TTTGGGGGGTTTTTT.,,........HDHH...T',
    'TTTGGGGGGTTTTTT.,,.........,.....T',
    'TTTGGGGGGTTTTTT.,,,,,,,,,,,,.....T',
    'TTTGGGGGGTTTTTT.,,...............T',
    'TTTGGGDGGTTTTTT.,,..ffffff.......T',
    'TTTTTT,TTTTTTTTS,,..ffffff.......T',
    'TTTTTT,,,,,c,,,,,,..ffffff.......T',
    'TTTTTTTTTTTTTTHHHH...............T',
    'T.............HHHH.S.............T',
    'T.............HHDH...............T',
    'T...............,,...............T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { north: { map: 'route6', offset: 8 }, east: { map: 'route11', offset: 3 } },
  warps: [
    { x: 5, y: 5, to: 'vermilion-center', spot: 'door' },
    { x: 23, y: 4, to: 'vermilion-mart', spot: 'door' },
    { x: 27, y: 13, to: 'vermilion-fanclub', spot: 'door' },
    { x: 6, y: 17, to: 'vermilion-gym', spot: 'door' },
    { x: 16, y: 22, to: 'vermilion-harbor', spot: 'door' }
  ],
  spots: {
    north: [16, 1, 'down'], 'center-door': [5, 6, 'down'], 'mart-door': [23, 5, 'down'], 'fanclub-door': [27, 14, 'down'],
    'gym-door': [6, 18, 'down'], 'harbor-door': [16, 23, 'down']
  },
  signs: {
    '14,8': 'Vermilion City. A port town where ships from all over the world come and go.',
    '15,18': 'Vermilion City Pokémon Gym. Leader: Lt. Surge, the thunder-loving soldier!',
    '19,21': 'Vermilion Harbor. The S.S. Anne is docked here.'
  },
  encounters: { water: '@vermilion-city-area' },
  npcs: [
    { id: 'sailor', who: 'sailor', x: 20, y: 12, move: 'look',
      say: 'The S.S. Anne is a famous cruise ship. Trainers from all over the world are aboard!' },
    { id: 'kid', who: 'youngster', x: 12, y: 10, move: 'wander', r: 2,
      say: "The Gym is behind that little tree. You'll need a Pokémon that knows Cut to get through." },
    { id: 'fisher', who: 'oldman', x: 28, y: 22, dir: 'down', script: 'vermilion.old-rod' }
  ]
});

G.Maps.center('vermilion-center', {
  loc: 'vermilion-city', exit: { map: 'vermilion', spot: 'center-door' },
  npcs: [{ id: 'trainer', who: 'sailor', x: 9, y: 5, move: 'look',
           say: 'An HM move can be used outside of battle, but you need the right Gym Badge first.' }]
});

G.Maps.mart('vermilion-mart', {
  loc: 'vermilion-city', exit: { map: 'vermilion', spot: 'mart-door' },
  stock: ['poke-ball', 'great-ball', 'super-potion', 'repel', 'antidote', 'paralyze-heal', 'ice-heal', 'escape-rope']
});

G.Maps.def({
  id: 'vermilion-fanclub', loc: 'vermilion-city', tileset: 'indoor', palette: 'center', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bb__p__p_bb',
    '___________',
    '___ttttt___',
    '___ttttt___',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'vermilion', spot: 'fanclub-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: {
    '0,2': 'Pokémon Fan Club rule: talk about your favourite Pokémon as much as you like!',
    '1,2': 'Pokémon Fan Club rule: talk about your favourite Pokémon as much as you like!'
  },
  npcs: [
    { id: 'chairman', who: 'gentleman', x: 8, y: 3, dir: 'left', script: 'vermilion.chairman' },
    { id: 'member', who: 'lass', x: 2, y: 4, dir: 'right', say: 'Our chairman can talk about Pokémon for hours. Hours!' },
    { id: 'pikachu', mon: 'pikachu', x: 9, y: 6, dir: 'left', move: 'look', say: 'Pika pika!' }
  ]
});

G.Maps.def({
  id: 'vermilion-harbor', loc: 'vermilion-city', tileset: 'indoor', palette: 'mart', music: 'town', battleBg: 'indoor', enter: 'vermilion.harbor-enter',
  rows: [
    'WWWWWWWWWWWWW',
    'WWWWWWWWWWWWW',
    '++++++^++++++',
    '+++++++++++++',
    '+++++++++++++',
    'p+++++++++++p',
    '++++++X++++++'
  ],
  warps: [{ x: 6, y: 6, to: 'vermilion', spot: 'harbor-door' }, { x: 6, y: 2, to: 'ssanne-1f', spot: 'gangway' }],
  spots: { door: [6, 6, 'up'], gangway: [6, 3, 'down'] },
  npcs: [{ id: 'sailor', who: 'sailor', x: 7, y: 3, dir: 'left', script: 'vermilion.sailor' }],
  triggers: [
    { x: 6, y: 3, w: 1, h: 1, if: 'ss-anne-left', script: 'vermilion.ship-gone' },
    { x: 6, y: 3, w: 1, h: 1, if: '!has:ss-ticket', script: 'vermilion.no-ticket' }
  ]
});

G.Script.def({
  // The Old Rod (as in the games, from the old fisherman of Vermilion).
  'vermilion.old-rod': [
    ['if', 'got-old-rod', [
      ['say', 'How is the fishing? Even a Magikarp is a fine catch, if you ask me!']
    ], [
      ['say', "I've fished here for forty years. The sea air keeps me young!"],
      ['choice', 'Do you like fishing, young one?', [
        ['say', 'Ha! A kindred spirit! Take this old rod of mine. Face the water and give it a try.'],
        ['giveItem', 'old-rod', 1],
        ['setFlag', 'got-old-rod'],
        ['say', 'Use it from your Bag, or just press A at the water.']
      ], [
        ['say', 'Oh... If you change your mind, come back and see me.']
      ]]
    ]]
  ],
  'vermilion.chairman': [
    ['say', 'Welcome to the Pokémon Fan Club! I am the chairman.'],
    ['say', 'My favourite? Rapidash! So elegant, so fast. Its mane of fire is a work of art.'],
    ['say', "I could talk about it all day. And I often do! Come back any time you'd like to hear more."]
  ],
  'vermilion.sailor': [
    ['if', 'ss-anne-left', [
      ['say', 'The S.S. Anne has set sail. She will be back next year!']
    ], [
      ['if', 'has:ss-ticket', [
        ['say', 'Welcome aboard the S.S. Anne! Your ticket is in order. Up the gangway, please.']
      ], [
        ['say', 'Only passengers with a ticket may board the S.S. Anne.']
      ]]
    ]]
  ],
  'vermilion.no-ticket': [
    ['face', 'sailor', 'player'],
    ['say', 'Ahoy! May I see your ticket, please? ... No ticket? Sorry, only passengers may board.'],
    ['move', 'player', 'D']
  ],
  'vermilion.ship-gone': [
    ['say', 'The S.S. Anne has already set sail. She will be back next year!'],
    ['move', 'player', 'D']
  ],
  'vermilion.harbor-enter': [
    ['if', ['has:hm01', '!ss-anne-left'], [
      ['setFlag', 'ss-anne-left'],
      ['say', 'With a long blast of her horn, the S.S. Anne sets sail...']
    ]]
  ]
});
