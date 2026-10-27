/* ============ cycling.js — Routes 16, 17 (Cycling Road) and 18 ============
 * Chapter 8, part 1. West of Celadon City, Route 16: a second Snorlax sleeps where the trees close
 * in on the road (the Poké Flute wakes it: flag route16-snorlax); behind a small tree only Cut
 * clears, a meadow and a hidden house, where a girl gives HM02 Fly (flag got-hm02). Past Snorlax,
 * Bikers and Cue Balls, and the gate to Cycling Road (Route 17): Bicycles only (the guards stop
 * you without one; with one you ride from the gate on and cannot get off). The road runs downhill
 * to the south (`slope`): let go and you roll. Its gate at the bottom opens on Route 18 (three
 * Bird Keepers), which joins Fuchsia City from the west. The Bicycle comes from the Bike Shop in
 * Cerulean City for the Bike Voucher of the Fan Club chairman in Vermilion City.
 */
G.Maps.def({
  id: 'route16', loc: 'kanto-route-16', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TT.........."""""""".........""""""...TT',
    'TT.HHHH.....""""""""...f.....""""""...TT',
    'TT.HHHH....."""""""".....f...""""""...TT',
    'TT.HDHH..............f.....f..........TT',
    'TT..,.................................TT',
    'TT..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..TT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTcTTTT',
    'T.BBBBBB......"""""""......TTT.........T',
    'T.BBBBBB...................TTT......S..T',
    'T.BBBBBB,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.BBDBBB,,,,,,,,,,,,,,,,,,,TTT,,,,,,,,,,',
    'T...,,,,,S.................TTT.""""""..T',
    'T........."""""""""""""""..TTT.""""""..T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'celadon', offset: 2 } },
  warps: [
    { x: 4, y: 11, to: 'route16-gate', spot: 'east' },
    { x: 4, y: 4, to: 'route16-house', spot: 'door' }
  ],
  spots: { 'gate-door': [4, 12, 'down'], 'house-door': [4, 5, 'down'] },
  signs: {
    '36,9': 'Route 16. Celadon City to the east, Cycling Road to the west.',
    '9,12': 'Cycling Road gate. Bicycles only beyond this point!'
  },
  npcs: [
    { id: 'snorlax', who: 'snorlax', mon: 'snorlax', x: 28, y: 10, dir: 'down', fixed: true, if: '!route16-snorlax', script: 'route16.snorlax' },
    { id: 'man', who: 'gentleman', x: 33, y: 9, dir: 'left', move: 'look', if: '!route16-snorlax',
      say: 'Another Snorlax! It has been snoring on this road for days. Nobody can get to Cycling Road.' },
    { id: 'girl', who: 'lass', x: 33, y: 12, move: 'wander', r: 1,
      say: 'I saw someone slip through a gap in the trees up there. Is there something behind them?' }
  ],
  trainers: [
    { id: 'brutus', who: 'cueball', cls: 'cue-ball', name: 'Brutus', x: 12, y: 9, dir: 'down', sight: 2,
      team: [['machop', 39], ['mankey', 39], ['machoke', 40]],
      before: 'You woke the big guy up? Then you can deal with me next!',
      defeat: 'Ouch. My head is shining with shame.',
      after: 'We shave our heads to go faster on the bike. Wind resistance, kid.' },
    { id: 'jax', who: 'biker', cls: 'biker', name: 'Jax', x: 17, y: 12, dir: 'up', sight: 2,
      team: [['grimer', 39], ['koffing', 39], ['muk', 41]],
      before: 'This road belongs to our gang! Pay the toll with a battle!',
      defeat: 'Fine, fine. No toll today.',
      after: 'Our gang rides down Cycling Road every night. The faster the better!' },
    { id: 'tank', who: 'cueball', cls: 'cue-ball', name: 'Tank', x: 22, y: 9, dir: 'down', sight: 2,
      team: [['primeape', 41], ['machoke', 41]],
      before: 'They call me Tank because nothing gets past me!',
      defeat: 'Something got past me...',
      after: 'You hit like a truck. Respect.' },
    { id: 'dex', who: 'biker', cls: 'biker', name: 'Dex', x: 25, y: 12, dir: 'up', sight: 2,
      team: [['weezing', 42]],
      before: 'Smell that? That is Weezing. Breathe it in!',
      defeat: 'Cough... cough... You win.',
      after: 'You need a Bicycle for Cycling Road. Walking is for losers. No offence.' }
  ],
  items: [
    { x: 36, y: 2, item: 'max-ether', flag: 'route16-ether' },
    { x: 22, y: 5, item: 'ultra-ball', flag: 'route16-hidden', hidden: true }
  ],
  encounters: { walk: '@kanto-route-16-area' }
});

G.Maps.def({
  id: 'route16-house', loc: 'kanto-route-16', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bb__p____bb',
    '___________',
    '___ttt_____',
    '___ttt_____',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'route16', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: {
    '0,2': 'A shelf of books about bird Pokémon and the winds they ride.', '1,2': 'A shelf of books about bird Pokémon and the winds they ride.',
    '9,2': 'A shelf of maps of Kanto, seen from the sky.', '10,2': 'A shelf of maps of Kanto, seen from the sky.'
  },
  npcs: [
    { id: 'girl', who: 'lass', x: 7, y: 4, dir: 'left', script: 'route16.fly-girl' },
    { id: 'fearow', who: 'fearow', mon: 'fearow', x: 8, y: 6, dir: 'left', move: 'look', say: 'Fearow spreads its wings proudly.' }
  ]
});

G.Maps.def({
  id: 'route16-gate', loc: 'kanto-route-16', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'p++++++p',
    '++++++++',
    '++++++++',
    'X++++++X'
  ],
  warps: [{ x: 0, y: 5, to: 'route17', spot: 'top-door' }, { x: 7, y: 5, to: 'route16', spot: 'gate-door' }],
  spots: { west: [0, 5, 'up'], east: [7, 5, 'up'] },
  npcs: [{ id: 'guard', who: 'officer', x: 4, y: 2, dir: 'down',
           say: 'Cycling Road runs downhill all the way south. Hold on tight and enjoy the ride!' }],
  // No Bicycle, no Cycling Road.
  triggers: [{ x: 0, y: 2, w: 3, h: 4, if: '!has:bicycle', script: 'cycling.no-bike' }]
});

G.Maps.def({
  id: 'route17', loc: 'kanto-route-17', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  bike: true, slope: 'down',
  rows: [
    'TTTTTTTTTTTTTTTTTTTT',
    'TT.....BBBBBB.....TT',
    'TT.....BBBBBB.....TT',
    'TT.....BBBBBB.....TT',
    'TT.....BBDBBB.....TT',
    'TT......,,,,......TT',
    'TT~~....,,,,.S...TTT',
    'TT~~...F,,,,F.....TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.....TT',
    'TT~~"".F,,,,F.....TT',
    'TT.."".F,,,,F.....TT',
    'TT.....F,,,,FT....TT',
    'TT.....F,,,,F...T.TT',
    'TT.....F,,,,F.....TT',
    'TT~~...F,,,,F....TTT',
    'TT~~...F,,,,F.....TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.....TT',
    'TT~~"".F,,,,F.....TT',
    'TT.."".F,,,,F.....TT',
    'TT.....F,,,,FT....TT',
    'TT.....F,,,,F...T.TT',
    'TT.....F,,,,F.....TT',
    'TT"""""F,,,,F....TTT',
    'TT""""".,,,,......TT',
    'TT""""".,,,,..""".TT',
    'TT""""".,,,,..""".TT',
    'TT""""".,,,,..""".TT',
    'TT"""""F,,,,F.""".TT',
    'TT~~"".F,,,,F.....TT',
    'TT~~"".F,,,,F.....TT',
    'TT.."".F,,,,F.....TT',
    'TT.....F,,,,FT....TT',
    'TT.....F,,,,F...T.TT',
    'TT.....F,,,,F.....TT',
    'TT~~...F,,,,F....TTT',
    'TT~~...F,,,,F.....TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.....TT',
    'TT~~"".F,,,,F.....TT',
    'TT.."".F,,,,F.....TT',
    'TT.....F,,,,FT....TT',
    'TT.....F,,,,F...T.TT',
    'TT.....F,,,,F.....TT',
    'TT~~...F,,,,F....TTT',
    'TT~~...F,,,,F.....TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~...F,,,,F"""""TT',
    'TT~~""..,,,,."""""TT',
    'TT~~""..,,,,."""""TT',
    'TT~~""..,,,,."""""TT',
    'TT~~""..,,,,."""""TT',
    'TT.."".F,,,,F"""""TT',
    'TT.....F,,,,FT....TT',
    'TT.....F,,,,F...T.TT',
    'TT.....F,,,,F.....TT',
    'TT~~...F,,,,F....TTT',
    'TT~~...F,,,,F.....TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~...F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.""".TT',
    'TT~~"".F,,,,F.....TT',
    'TT~~"".F,,,,F.....TT',
    'TT.."".F,,,,F.....TT',
    'TT.....F,,,,FT....TT',
    'TT.....F,,,,F...T.TT',
    'TT.....F,,,,F.....TT',
    'TT.....F,,,,F.....TT',
    'TT.....F,,,,F.....TT',
    'TT.....F,,,,F.....TT',
    'TT.....F,,,,F.....TT',
    'TT.....F,,,,F.....TT',
    'TT......,,,,......TT',
    'TTBBBBBB,,,,......TT',
    'TTBBBBBB,,,,.S....TT',
    'TTBBBBBB,,,,......TT',
    'TTBBDBBB,,,,......TT',
    'TT,,,,,,,,,,......TT',
    'TT,,,,,,,,,,......TT',
    'TTTTTTTTTTTTTTTTTTTT'
  ],
  warps: [
    { x: 9, y: 4, to: 'route16-gate', spot: 'west' },
    { x: 4, y: 87, to: 'route18-gate', spot: 'west' }
  ],
  spots: { 'top-door': [9, 5, 'down'], 'bottom-door': [4, 88, 'down'] },
  signs: {
    '13,6': 'Cycling Road. It runs downhill: let go and you will roll! No pedestrians.',
    '13,85': 'Route 17, Cycling Road. The gate to Route 18 and Fuchsia City is just ahead.'
  },
  trainers: [
    { id: 'virgil', who: 'biker', cls: 'biker', name: 'Virgil', x: 8, y: 14, dir: 'right', sight: 3,
      team: [['koffing', 41], ['weezing', 41]],
      before: 'Nobody rolls down my road without a battle!',
      defeat: 'You rolled right over me.',
      after: 'Brake? Bikers never brake.' },
    { id: 'rocco', who: 'cueball', cls: 'cue-ball', name: 'Rocco', x: 11, y: 22, dir: 'left', sight: 3,
      team: [['machop', 41], ['machoke', 42]],
      before: 'Halt! The Cue Balls rule this stretch of road!',
      defeat: 'We rule... a little less now.',
      after: 'Keep your eyes on the road. Some of us stand right in the middle of it.' },
    { id: 'hank', who: 'biker', cls: 'biker', name: 'Hank', x: 8, y: 30, dir: 'right', sight: 3,
      team: [['grimer', 41], ['muk', 42]],
      before: 'Fresh meat on the downhill! Let us see what you have!',
      defeat: 'Too fast for me...',
      after: 'The grass behind the fence is full of Pokémon. Watch out for Doduo.' },
    { id: 'isaiah', who: 'cueball', cls: 'cue-ball', name: 'Isaiah', x: 11, y: 40, dir: 'left', sight: 3,
      team: [['mankey', 42], ['primeape', 42]],
      before: 'My Primeape is angry today. Very angry. Battle!',
      defeat: 'Now it is angry at me...',
      after: 'Primeape gets angry for no reason at all. I like that about it.' },
    { id: 'zeke', who: 'biker', cls: 'biker', name: 'Zeke', x: 8, y: 50, dir: 'right', sight: 3,
      team: [['weezing', 42], ['koffing', 41], ['weezing', 42]],
      before: 'Three clouds of poison gas, coming right up!',
      defeat: 'The air cleared up... and so did my chances.',
      after: 'A Biker without poison Pokémon is just a guy on a bike.' },
    { id: 'marcus', who: 'cueball', cls: 'cue-ball', name: 'Marcus', x: 11, y: 60, dir: 'left', sight: 3,
      team: [['machoke', 43]],
      before: 'I lift weights. My Machoke lifts me. Battle!',
      defeat: 'Too heavy, this defeat.',
      after: 'Halfway down! The rest of the road is even steeper.' },
    { id: 'wes', who: 'biker', cls: 'biker', name: 'Wes', x: 8, y: 70, dir: 'right', sight: 3,
      team: [['muk', 43], ['grimer', 42]],
      before: 'You are going too fast, kid. Let me slow you down!',
      defeat: 'You did not even slow down.',
      after: 'Fuchsia City is at the end of the road. Koga lives there. Scary guy.' },
    { id: 'thor', who: 'cueball', cls: 'cue-ball', name: 'Thor', x: 11, y: 79, dir: 'left', sight: 3,
      team: [['primeape', 43], ['machoke', 43]],
      before: 'Last stop before the gate! Nobody passes the mighty Thor!',
      defeat: 'The mighty Thor has fallen...',
      after: 'Not bad, kid. Ride on. The gate is just below.' }
  ],
  items: [
    { x: 16, y: 33, item: 'pp-up', flag: 'route17-ppup' },
    { x: 5, y: 61, item: 'max-elixir', flag: 'route17-elixir' },
    { x: 16, y: 59, item: 'rare-candy', flag: 'route17-hidden', hidden: true }
  ],
  encounters: { walk: '@kanto-route-17-area' }
});

G.Maps.def({
  id: 'route18-gate', loc: 'kanto-route-18', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'p++++++p',
    '++++++++',
    '++++++++',
    'X++++++X'
  ],
  warps: [{ x: 0, y: 5, to: 'route17', spot: 'bottom-door' }, { x: 7, y: 5, to: 'route18', spot: 'gate-door' }],
  spots: { west: [0, 5, 'up'], east: [7, 5, 'up'] },
  npcs: [{ id: 'guard', who: 'officer', x: 4, y: 2, dir: 'down',
           say: 'Fuchsia City is east of here. Cycling Road is to the west, for Bicycles only.' }],
  triggers: [{ x: 0, y: 2, w: 3, h: 4, if: '!has:bicycle', script: 'cycling.no-bike' }]
});

G.Maps.def({
  id: 'route18', loc: 'kanto-route-18', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T........."""""""""""""...TTTTT..."""""T',
    'TBBBBBB..."""""""""""""...TTTTT..."""""T',
    'TBBBBBB..."""""""""""""..........."""""T',
    'TBBBBBB..."""""""""""""................T',
    'TBBDBBB................................T',
    'T..,....S..............................T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T...........""""""""".....""""""""""...T',
    'T...........""""""""".....""""""""""...T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'fuchsia', offset: -8 } },
  warps: [{ x: 3, y: 5, to: 'route18-gate', spot: 'east' }],
  spots: { 'gate-door': [3, 6, 'down'] },
  signs: { '8,6': 'Route 18. Fuchsia City to the east. Cycling Road starts at the gate to the west.' },
  trainers: [
    { id: 'jacob', who: 'birdkeeper', cls: 'bird-keeper', name: 'Jacob', x: 16, y: 6, dir: 'down', sight: 2,
      team: [['spearow', 40], ['fearow', 42]],
      before: 'My birds fly faster than your Bicycle! Battle!',
      defeat: 'Grounded...',
      after: 'Fearow can fly for a whole day. A Bicycle cannot.' },
    { id: 'ramiro', who: 'birdkeeper', cls: 'bird-keeper', name: 'Ramiro', x: 24, y: 9, dir: 'up', sight: 2,
      team: [['doduo', 41], ['dodrio', 42]],
      before: 'Three heads are better than one! Let me show you!',
      defeat: 'All three of them lost...',
      after: 'Dodrio cannot fly, but it runs like the wind.' },
    { id: 'wilton', who: 'birdkeeper', cls: 'bird-keeper', name: 'Wilton', x: 31, y: 6, dir: 'down', sight: 2,
      team: [['pidgeotto', 41], ['farfetchd', 41], ['pidgeot', 42]],
      before: 'A bird Pokémon that knows Fly can take you anywhere. Mine can take you down!',
      defeat: 'Shot down...',
      after: 'If your Pokémon knows Fly, choose it in your party and pick a town. Off you go!' }
  ],
  items: [{ x: 38, y: 2, item: 'ultra-ball', flag: 'route18-ball' }],
  encounters: { walk: '@kanto-route-18-area' }
});

G.Script.def({
  'route16.snorlax': [
    ['if', '!has:poke-flute', [
      ['say', 'A huge Pokémon is sleeping in the middle of the road, snoring loudly. It will not budge.']
    ], [
      ['say', 'A huge Pokémon is sleeping in the middle of the road, snoring loudly.'],
      ['choice', 'Play the Poké Flute?', [
        ['say', '{player} played the Poké Flute.'],
        ['jingle', 'flute'],
        ['say', 'The Pokémon woke up! It looks very grumpy...'],
        ['wild', 'snorlax', 30],
        ['if', 'battle!=lose', [
          ['setFlag', 'route16-snorlax'],
          ['hide', 'snorlax']
        ]],
        ['if', 'battle=run', [['say', 'Snorlax yawned and lumbered off into the trees.']]]
      ], []]
    ]]
  ],
  'route16.fly-girl': [
    ['if', 'got-hm02', [
      ['say', 'Fly takes you to any town you have been to. Choose the Pokémon that knows it in your party, then pick the town!']
    ], [
      ['say', 'Oh! You found our house behind the little tree. Hardly anybody does!'],
      ['say', 'My Fearow takes me anywhere I want to go. Over the trees, over the sea... It is the best way to travel!'],
      ['say', 'You look like someone who travels a lot. Here, this is for you.'],
      ['setFlag', 'got-hm02'],
      ['giveItem', 'hm02', 1],
      ['say', 'HM02 is Fly. Teach it to a bird Pokémon. With the Thunder Badge, it can fly you to any town you have visited!']
    ]]
  ],
  'cycling.no-bike': [
    ['face', 'guard', 'player'],
    ['say', 'Hold it! Cycling Road is for Bicycles only. Come back when you have one!'],
    ['move', 'player', 'RR']
  ]
});
