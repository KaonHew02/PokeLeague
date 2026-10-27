/* ============ fuchsia.js — Fuchsia City and Koga ============
 * Chapter 5, part 3, the end of the chapter. Fuchsia City at the end of Route 15: Pokémon
 * Center, Mart, the Safari Zone's little zoo (Chansey, Kangaskhan, Slowpoke, Voltorb behind
 * fences), the Safari Zone's gate (safari.js), the warden's house (he lost his Gold Teeth in the
 * Safari Zone and gives HM04 Strength for them, flag got-hm04) and another house. Koga's Gym is a dojo whose walls cannot be seen
 * (indoor tile `i`): the maze comes from a seeded generator, its six Trainers stand in dead
 * ends beside the way. Koga (Koffing 33, Muk 35, Koffing 33, Weezing 37: well below the games'
 * 37-43, because the auto-player of tests/story.test.cjs never heals and Toxic and Poison Gas
 * wear down a small team; only Weezing keeps Smokescreen) gives the Soul Badge (badge 5) and
 * TM06 Toxic.
 */
G.Maps.def({
  id: 'fuchsia', loc: 'fuchsia-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door', if: 'badge:5' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................................T',
    'T.FFFFFFFFFFF....BBBBBB....FFFFFFFFFFF.T',
    'T.F.........F....BBBBBB....F.........F.T',
    'T.F.........F....BBBBBB....F.........F.T',
    'T.F.........F....BBBDBB....F.........F.T',
    'T.F.........F.......,......F.........F.T',
    'T.FFFFFFFFFFF.......,......FFFFFFFFFFF.T',
    'T...................,..................T',
    'T...................,.S................T',
    'T...................,..................T',
    'T........MMMM.......,....CCCCC.........T',
    'T........MMMM.......,....CCCCC.........T',
    'T........MMDM.......,....CCCCC.........T',
    'T..........,........,....CCDCC.........T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T...................,..................T',
    'T.HHHH..............,..........HHHH....T',
    'T.HHHH..............,..........HHHH....T',
    'T.HDHH..............,..........HDHH....T',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,......T',
    'T............GGGGGG.,..................T',
    'T............GGGGGG.,..................T',
    'T............GGGGGG.,..................T',
    'T............GGGGGG.,..................T',
    'T............GGGDGG.,..................T',
    'T..........S....,,,,,..................T',
    'T...............,,,,,..................T',
    'T..................,,,,................T',
    'TTTTTTTTTTTTTTTTTTT,,,,TTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route15', offset: 10 }, south: { map: 'route19', offset: 12 }, west: { map: 'route18', offset: 8 } },
  warps: [
    { x: 20, y: 5, to: 'safari-gate', spot: 'door' },
    { x: 11, y: 13, to: 'fuchsia-mart', spot: 'door' },
    { x: 27, y: 14, to: 'fuchsia-center', spot: 'door' },
    { x: 3, y: 20, to: 'fuchsia-house', spot: 'door' },
    { x: 32, y: 20, to: 'warden-house', spot: 'door' },
    { x: 16, y: 26, to: 'fuchsia-gym', spot: 'door' }
  ],
  spots: {
    east: [38, 15, 'left'], 'safari-door': [20, 6, 'down'], 'mart-door': [11, 14, 'down'], 'center-door': [27, 15, 'down'], 'house-door': [3, 21, 'down'],
    'warden-door': [32, 21, 'down'], 'gym-door': [16, 27, 'down']
  },
  signs: {
    '22,9': 'Fuchsia City. A bright pink town by the sea, home of the Safari Zone.',
    '11,27': 'Fuchsia City Pokémon Gym. Leader: Koga, the ninja who strikes with poison!',
    '7,7': 'The Safari Zone\'s little zoo. These Pokémon came from the Safari Zone. Please do not feed them!',
    '32,7': 'The Safari Zone\'s little zoo. These Pokémon came from the Safari Zone. Please do not feed them!'
  },
  npcs: [
    { id: 'chansey', who: 'chansey', mon: 'chansey', x: 5, y: 4, dir: 'down', move: 'look', say: 'Chansey hums happily.' },
    { id: 'kangaskhan', who: 'kangaskhan', mon: 'kangaskhan', x: 9, y: 5, dir: 'left', move: 'look', say: 'Kangaskhan keeps a careful eye on its baby.' },
    { id: 'slowpoke', who: 'slowpoke', mon: 'slowpoke', x: 30, y: 4, dir: 'down', say: 'Slowpoke is staring into space.' },
    { id: 'voltorb', who: 'voltorb', mon: 'voltorb', x: 34, y: 5, dir: 'left', move: 'look', say: 'Voltorb rolls around a little.' },
    { id: 'boy', who: 'youngster', x: 14, y: 9, move: 'wander', r: 2,
      say: 'In the Safari Zone you only get Safari Balls, Bait and Rocks. No battling! I love it.' },
    { id: 'fisher', who: 'fisherman', x: 24, y: 18, move: 'wander', r: 2, script: 'fuchsia.good-rod' },
    { id: 'girl', who: 'lass', x: 8, y: 23, dir: 'right', move: 'look',
      say: 'Koga\'s Gym is full of walls you cannot see. Bump into them to find the way!' }
  ],
  encounters: {}
});

G.Maps.center('fuchsia-center', {
  loc: 'fuchsia-city', exit: { map: 'fuchsia', spot: 'center-door' },
  npcs: [{ id: 'cooltrainer', who: 'cooltrainer', x: 9, y: 5, move: 'look',
           say: 'Poison-type Pokémon are weak to Ground and Psychic moves. Keep that in mind against Koga.' }]
});

G.Maps.mart('fuchsia-mart', {
  loc: 'fuchsia-city', exit: { map: 'fuchsia', spot: 'mart-door' },
  stock: ['ultra-ball', 'great-ball', 'super-potion', 'hyper-potion', 'revive', 'full-heal', 'antidote', 'super-repel']
});

G.Maps.def({
  id: 'fuchsia-house', loc: 'fuchsia-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'bb__t__p',
    '________',
    '__rr____',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'fuchsia', spot: 'house-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [
    { id: 'oldman', who: 'oldman', x: 5, y: 3, dir: 'left', move: 'look',
      say: 'In the Safari Zone you cannot use your own Pokémon. You throw bait and special balls instead. Quite a challenge!' },
    { id: 'girl', who: 'lass', x: 1, y: 4, dir: 'right', move: 'look',
      say: 'Grandpa has been to the Safari Zone a hundred times. He still has not caught a Kangaskhan.' }
  ]
});

G.Maps.def({
  id: 'warden-house', loc: 'fuchsia-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'bb____tb',
    '________',
    '___rr___',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'fuchsia', spot: 'warden-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [
    { id: 'warden', who: 'warden', x: 5, y: 3, dir: 'down', script: 'fuchsia.warden' }
  ]
});

G.Maps.def({
  id: 'fuchsia-gym', loc: 'fuchsia-city', tileset: 'indoor', palette: 'dojo', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    '_i_____i_i___i_',
    '_i_iii_i_iii_i_',
    '___i___________',
    'ii_iii_iii_iiii',
    '_____i_i_i_i___',
    '_iii_iii_iiiii_',
    '_i_____i___i_i_',
    'ii_iii_iii_i_i_',
    '_i_i_______i___',
    '_iii_i_iii_iii_',
    '_____i_i___i_i_',
    'iiiiiiiiii_i_i_',
    '_______________',
    'iiiiiiiiXiiiiii'
  ],
  warps: [{ x: 8, y: 15, to: 'fuchsia', spot: 'gym-door' }],
  spots: { door: [8, 15, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 6, y: 14, dir: 'right', script: 'koga.gym-guide' }],
  trainers: [
    { id: 'kayden', who: 'juggler', cls: 'juggler', name: 'Kayden', x: 12, y: 14, dir: 'left', sight: 2,
      team: [['drowzee', 33], ['kadabra', 33]],
      before: 'Now you see me, now you do not! Welcome to the ninja dojo!',
      defeat: 'I did not see that coming.',
      after: 'The walls here are real, even if your eyes say otherwise.' },
    { id: 'phil', who: 'tamer', cls: 'tamer', name: 'Phil', x: 10, y: 8, dir: 'down', sight: 2,
      team: [['sandslash', 34], ['arbok', 34]],
      before: 'My Pokémon obey every crack of my whip. Watch closely!',
      defeat: 'They obeyed... and still lost.',
      after: 'Koga trains his Pokémon to strike from the shadows.' },
    { id: 'nate', who: 'juggler', cls: 'juggler', name: 'Nate', x: 4, y: 10, dir: 'right', sight: 2,
      team: [['drowzee', 33], ['hypno', 34]],
      before: 'I juggle Poké Balls all day. Let me throw a few at you!',
      defeat: 'I dropped them all.',
      after: 'Psychic Pokémon see through Koga\'s tricks. Mine could not see through yours.' },
    { id: 'kirk', who: 'juggler', cls: 'juggler', name: 'Kirk', x: 2, y: 8, dir: 'right', sight: 2,
      team: [['kadabra', 35]],
      before: 'Lost already? Everyone gets lost in here. Except me!',
      defeat: 'Now I am the one who is lost.',
      after: 'Bumping into the walls is the only way to learn them. Koga calls it training.' },
    { id: 'edgar', who: 'tamer', cls: 'tamer', name: 'Edgar', x: 0, y: 6, dir: 'right', sight: 2,
      team: [['arbok', 35], ['sandslash', 35]],
      before: 'Arbok, coil and strike! Show this kid the way out!',
      defeat: 'Arbok is tied up in knots.',
      after: 'Koga\'s Weezing hides in a cloud of smoke. Hit it hard while you can.' },
    { id: 'shawn', who: 'juggler', cls: 'juggler', name: 'Shawn', x: 4, y: 4, dir: 'right', sight: 2,
      team: [['drowzee', 34], ['drowzee', 34], ['kadabra', 35]],
      before: 'Master Koga is right behind me. You will not reach him!',
      defeat: 'Well... you might reach him after all.',
      after: 'Master Koga\'s daughter trains here too. She wants to be a ninja just like him.' },
    { id: 'koga', who: 'koga', cls: 'leader', name: 'Koga', x: 8, y: 2, dir: 'down', sight: 1, leader: true, ai: 'leader',
      team: [['koffing', 33, ['sludge', 'tackle', 'smog', 'poison-gas']],
             ['muk', 35, ['sludge', 'disable', 'harden', 'poison-gas']],
             ['koffing', 33, ['sludge', 'tackle', 'smog', 'poison-gas']],
             ['weezing', 37, ['sludge', 'smokescreen', 'tackle', 'toxic']]],
      before: 'Fwahahaha! So you found your way through my walls. I am Koga. A ninja does not fight in the open: he fights with poison and patience. Prepare yourself!',
      defeat: 'Hmm! You have proven your worth.',
      win: 'koga.win',
      afterScript: [
        ['say', 'Toxic poisons the foe badly: the damage grows every turn. A ninja\'s favourite.', { name: 'Koga' }],
        ['say', 'They say the leader in Saffron City reads minds. Be ready for anything.', { name: 'Koga' }]
      ] }
  ]
});

G.Script.def({
  // The Good Rod (as in the games, from a fisherman in Fuchsia City).
  'fuchsia.good-rod': [
    ['if', 'got-good-rod', [
      ['say', 'The Good Rod pulls up better Pokémon than the Old Rod. Try it in the sea south of town!']
    ], [
      ['say', 'Fuchsia is by the sea. Folks say there are islands far to the south, across the water.'],
      ['choice', 'Say, do you like fishing?', [
        ['say', 'I knew it! You have the look of an angler. Take this Good Rod and catch something big!'],
        ['giveItem', 'good-rod', 1],
        ['setFlag', 'got-good-rod']
      ], [
        ['say', 'No? Well, the fish will wait for you.']
      ]]
    ]]
  ],
  'fuchsia.warden': [
    ['if', 'got-hm04', [
      ['say', 'Strength lets a Pokémon push heavy boulders out of the way. With the Rainbow Badge it works outside battle too.', { name: 'Safari Zone Warden' }]
    ], [
      ['if', 'has:gold-teeth', [
        ['say', 'Mmf? Mmmf! (The old man stares at the Gold Teeth in your hand.)'],
        ['takeItem', 'gold-teeth', 1],
        ['say', '{player} gave the Gold Teeth to the old man. He popped them in.'],
        ['say', 'Ahh, that is much better! Thank you, thank you! I lost those in the Safari Zone weeks ago.', { name: 'Safari Zone Warden' }],
        ['say', 'Please take this as my thanks. It was a gift from an old friend.', { name: 'Safari Zone Warden' }],
        ['setFlag', 'got-hm04'],
        ['giveItem', 'hm04', 1],
        ['say', 'HM04 is Strength. A strong Pokémon can push boulders with it.', { name: 'Safari Zone Warden' }]
      ], [
        ['say', 'Hmmf... mmf fmm! (The old man is trying to tell you something, but he has lost his false teeth. You cannot understand a word.)']
      ]]
    ]]
  ],
  'koga.gym-guide': [
    ['if', 'badge:5', [
      ['say', 'You beat Koga! Five badges. Only three more to go!']
    ], [
      ['say', 'Hey, future Champion! Koga\'s Gym is full of walls you cannot see. Walk slowly and feel your way.'],
      ['say', 'Koga uses Poison-type Pokémon. Ground and Psychic moves work great against them.'],
      ['say', 'His Pokémon hide behind Smokescreen and poison yours. Bring Antidotes and an X Accuracy if you have one!']
    ]]
  ],
  'koga.win': [
    ['say', 'You have earned the Soul Badge. Take it, and wear it with pride.', { name: 'Koga' }],
    ['badge', 5],
    ['jingle', 'badge'],
    ['say', '{player} received the Soul Badge from Koga!'],
    ['say', 'And this is TM06, Toxic. Use it wisely.', { name: 'Koga' }],
    ['giveItem', 'tm06', 1],
    // The end of the fifth chapter (credits-ui.js).
    ['js', () => (G.CreditsUI ? G.CreditsUI.ending(5) : G.Field.setFlag('chapter-5-done'))]
  ]
});
