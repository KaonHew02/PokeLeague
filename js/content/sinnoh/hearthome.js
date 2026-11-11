/* ============ hearthome.js — Mt. Coronet 1F, Route 208, Hearthome City and Fantina's Gym ============
 * Chapter 47, the end of the chapter. Mt. Coronet's first floor, from Route 207 (tgeterna.js) to Route
 * 208: a Hiker, and the first meeting with Cyrus, Team Galactic's boss, who talks of a new world and
 * walks on (flag cyrus-coronet; no battle). Route 208 crosses a river to Hearthome City; the Berry
 * Master gives two Sitrus Berries (flag berry-master). Hearthome: a Pokémon Center, a Mart, a house and
 * Fantina's Gym; the Contest Hall and Amity Square are closed, and so is Route 212 (south) until the Fen Badge; Route 209
 * (east, solaceon.js) opens with the Relic Badge. Fantina uses Ghost types (Duskull, Haunter, Mismagius); beating her gives the
 * Relic Badge (badge 29, the third in Platinum's order: Pokémon up to Lv. 35 obey in Sinnoh) and TM65
 * (Shadow Claw), then `ending(47)`. Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const CYRUS = { name: 'Cyrus' }, FANTINA = { name: 'Fantina' }, BARRY = { name: 'Barry' }, BERRY = { name: 'Berry Master' };
  const SINNOH = { region: 'sinnoh' };
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Mt. Coronet ----------------
  G.Maps.def(Object.assign({
    id: 'mt-coronet-1f', loc: 'mt-coronet', rows: [
      '################################',
      '################################',
      '################################',
      '###....###....%.....###......###',
      '##.....###..........###.......##',
      '##.....###..........###.......##',
      '##.....###..........###.......##',
      '##.....###....................##',
      '##............................##',
      '##...........###.........###..##',
      '##...........###.........###..##',
      '##...........###.........###..##',
      '##...........###.........###.###',
      '###O########################O###',
      '################################',
      '################################'
    ],
    warps: [{ x: 3, y: 13, to: 'route207', spot: 'coronet' }, { x: 28, y: 13, to: 'route208', spot: 'coronet' },
            { x: 14, y: 3, to: 'coronet-2f', spot: 'from-below', if: 'trio-free', locked: 'coronet.way-up' }],
    spots: { west: [3, 12, 'up'], east: [28, 12, 'up'], ladder: [14, 4, 'down'] },
    triggers: [{ x: 16, y: 3, w: 1, h: 10, if: '!cyrus-coronet', script: 'coronet.cyrus' }],
    npcs: [{ id: 'cyrus', who: 'cyrus', x: 19, y: 8, dir: 'left', if: '!cyrus-coronet', script: 'coronet.cyrus' },
           { id: 'climber', who: 'hiker', x: 12, y: 4, dir: 'right', script: 'coronet.climber' }],
    trainers: [
      { id: 'kevin', who: 'hiker', cls: 'hiker', name: 'Kevin', x: 24, y: 7, dir: 'down', sight: 3, team: [['geodude', 19], ['onix', 20]],
        before: 'Mt. Coronet is the heart of Sinnoh. Show me you have the heart to cross it!',
        defeat: 'You have plenty of heart.',
        after: 'The mountain goes up and up, to a peak nobody I know has climbed.' }
    ],
    items: [{ x: 4, y: 4, item: 'escape-rope', flag: 'coronet-1f-rope' }],
    encounters: { walk: '@mt-coronet-1f-route-207' }
  }, CAVE));

  // ---------------- Route 208 ----------------
  G.Maps.def(Object.assign({
    id: 'route208', loc: 'sinnoh-route-208', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T###........~~~....................T',
      'T###."""""".~~~.....HHHH.."""""""..T',
      'T###."""""".~~~.....HHHH.."""""""..T',
      'T###."""""".~~~.....HDHH.."""""""..T',
      'T###."""""".~~~......,...."""""""..T',
      'T###........~~~......,...........S.T',
      'T##O,,,,,,,,===,,,,,,,,,,,,,,,,,,,,,',
      'T###,,,,,,,,===,,,,,,,,,,,,,,,,,,,,,',
      'T###........~~~....................T',
      'T###."""""".~~~."""""""....""""""..T',
      'T###."""""".~~~."""""""....""""""..T',
      'T###."""""".~~~."""""""....""""""..T',
      'T###."""""".~~~."""""""....""""""..T',
      'T###........~~~....................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'hearthome', offset: -6 } },
    warps: [{ x: 3, y: 7, to: 'mt-coronet-1f', spot: 'east' }, { x: 21, y: 4, to: 'berry-house', spot: 'door' }],
    spots: { coronet: [4, 7, 'right'], 'berry-door': [21, 5, 'down'] },
    signs: { '33,6': 'Route 208. East: Hearthome City. West: Mt. Coronet.' },
    trainers: [
      { id: 'kenji', who: 'blackbelt', cls: 'black-belt', name: 'Kenji', x: 9, y: 6, dir: 'down', sight: 1, team: [['machop', 20], ['meditite', 21]],
        before: 'I train by the mountain every day. Today I train on you!',
        defeat: 'My training is not over.',
        after: 'Meditite meditate for hours. I can barely sit still for a minute.' },
      { id: 'rodney', who: 'psychic', cls: 'psychic', name: 'Rodney', x: 18, y: 9, dir: 'up', sight: 1, team: [['bronzor', 21], ['kadabra', 21]],
        before: 'I foresaw this battle. I did not foresee who would win, though.',
        defeat: 'Now I see it clearly.',
        after: 'Bronzor were found in ancient tombs. Some say they were made, not born.' },
      { id: 'tara', who: 'beauty', cls: 'aroma-lady', name: 'Tara', x: 28, y: 6, dir: 'down', sight: 1, team: [['roselia', 21], ['bibarel', 22]],
        before: 'The Berry Master\'s flowers smell wonderful. Battle me while you breathe them in!',
        defeat: 'Ah, I lost my breath.',
        after: 'Hearthome is just ahead. It is the city where people and Pokémon meet in friendship.' }
    ],
    encounters: { walk: '@sinnoh-route-208-area', water: '@sinnoh-route-208-area' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'berry-house', loc: 'sinnoh-route-208', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'pp__p__pp__', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'route208', spot: 'berry-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'master', who: 'oldman', x: 7, y: 4, dir: 'left', script: 'route208.berry-master' }]
  }, SINNOH));

  // ---------------- Hearthome City ----------------
  G.Maps.def(Object.assign({
    id: 'hearthome', loc: 'hearthome-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..................................T',
      'T................,,................T',
      'T................,,....GGGGGG......T',
      'T...CCCCC........,,....GGGGGG......T',
      'T...CCCCC.MMMM...,,....GGGGGG......T',
      'T...CCCCC.MMMM...,,....GGGGGG......T',
      'T...CCDCC.MDMM...,,....GGDGGG......T',
      'T.....,....,.....,,......,.........T',
      'T.....,....,.fff.,,.fff..,.........T',
      'T.....,....,.fffS,,.fff..,.........T',
      'T.....,....,.fff.,,.fff..,.........T',
      'T.....,....,.....,,......,.........T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
      'T................,,................T',
      'T..EEEEEEEE......,,................T',
      'T..EEEEEEEE......,,....BBBBBB......T',
      'T..EEEEEEEE......,,....BBBBBB......T',
      'T..EEEEEEEE......,,....BBBBBB......T',
      'T..EEEDEEEE......,,....BBDBBB......T',
      'T.....,.....HHHH.,,,,,,,,,.........T',
      'T.....,.....HHHH.,,.........fffff..T',
      'T.....,.....HDHH.,,.........fffff..T',
      'T.....,......,,,,,,.........fffff..T',
      'T.....,,,,,,,,,,,,,.........fffff..T',
      'T................,,................T',
      'TTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'route208', offset: 6 }, east: { map: 'route209', offset: 3 }, south: { map: 'route212n', offset: 0 } },
    warps: [
      { x: 6, y: 7, to: 'hearthome-center', spot: 'door' },
      { x: 11, y: 7, to: 'hearthome-mart', spot: 'door' },
      { x: 25, y: 7, to: 'hearthome-gym', spot: 'door' },
      { x: 6, y: 20, locked: 'hearthome.contest-hall' },
      { x: 25, y: 20, to: 'amity-gate', spot: 'door' },          // Amity Square (amity.js, chapter 72)
      { x: 13, y: 23, to: 'hearthome-house', spot: 'door' }
    ],
    spots: { 'center-door': [6, 8, 'down'], 'mart-door': [11, 8, 'down'], 'gym-door': [25, 8, 'down'], 'house-door': [13, 24, 'down'], 'amity-door': [25, 21, 'down'] },
    signs: { '16,10': 'Hearthome City. The warm-hearted city, where people and Pokémon come together.' },
    npcs: [
      // Route 209 (east) opens with the Relic Badge (chapter 48); Route 212 (south) with the Fen Badge (chapter 64).
      { id: 'east', who: 'engineer', x: 34, y: 13, dir: 'left', if: '!badge:29',
        say: 'The bridge on Route 209 is being repaired. You will have to wait a little!' },
      { id: 'south', who: 'gentleman', x: 17, y: 26, dir: 'up', if: '!badge:28',
        say: 'Route 212 is flooded after all this rain. Better wait until the water goes down.' },
      { id: 'barry', who: 'barry', x: 20, y: 12, dir: 'down', if: '!badge:29', script: 'hearthome.barry' },
      { id: 'lady', who: 'beauty', x: 28, y: 15, move: 'wander', r: 2,
        say: 'In Amity Square, people walk with their Pokémon. It is closed for gardening today, sadly.' },
      { id: 'boy', who: 'youngster', x: 9, y: 11, move: 'look',
        say: 'Fantina, our Gym Leader, travelled the world before coming here. Her Ghost Pokémon are amazing!' }
    ]
  }, SINNOH));

  G.Maps.center('hearthome-center', {
    loc: 'hearthome-city', exit: { map: 'hearthome', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'Normal and Fighting moves pass right through Ghost-type Pokémon. Bring something else to the Gym!' }]
  }).region = 'sinnoh';

  G.Maps.mart('hearthome-mart', {
    loc: 'hearthome-city', exit: { map: 'hearthome', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'Ghost types like to put you to sleep or confuse you. Awakenings are a must!' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'hearthome-house', loc: 'hearthome-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'hearthome', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
             say: 'Long ago, people from all over came to Hearthome to share what they had. That is how it got its name.' }]
  }, SINNOH));

  // ---------------- Fantina's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'hearthome-gym', loc: 'hearthome-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'g+g+g+++g+g+g', '+++++++++++++', 'gg+++++++++gg', '+++++++++++++', '++g+++++++g++', '+++++++++++++',
           'gg+++++++++gg', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'hearthome', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'hearthome.gym-guide' }],
    trainers: [
      { id: 'anna', who: 'channeler', cls: 'medium', name: 'Anna', x: 3, y: 9, dir: 'right', sight: 3, team: [['gastly', 21], ['misdreavus', 22]],
        before: 'The spirits whisper your name... and they are laughing!',
        defeat: 'The spirits went quiet.',
        after: 'Fantina says Ghost Pokémon are only scary if you do not understand them.' },
      { id: 'kendall', who: 'psychic', cls: 'psychic', name: 'Kendall', x: 9, y: 7, dir: 'left', sight: 3, team: [['drifloon', 22], ['shuppet', 22]],
        before: 'I sense your fear. Or is it mine? Battle!',
        defeat: 'It was mine.',
        after: 'Drifloon float toward children at dusk. Hold your balloons tight!' },
      { id: 'martha', who: 'channeler', cls: 'medium', name: 'Martha', x: 3, y: 5, dir: 'right', sight: 3, team: [['haunter', 23]],
        before: 'Do you feel a chill? That is my Haunter, right behind you.',
        defeat: 'Even my Haunter has had enough.',
        after: 'Haunter can slip through walls. Watch your back in here!' },
      { id: 'desmond', who: 'psychic', cls: 'psychic', name: 'Desmond', x: 9, y: 4, dir: 'left', sight: 2, team: [['duskull', 23], ['misdreavus', 24]],
        before: 'Fantina is right behind me, and you will not reach her!',
        defeat: 'Go on, then. She is waiting in the dark.',
        after: 'Fantina\'s Mismagius sings a song that can curse its foes. Be ready!' },
      { id: 'fantina', who: 'fantina', cls: 'leader', name: 'Fantina', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 2 },
        team: [['duskull', 24, ['will-o-wisp', 'future-sight', 'pursuit', 'night-shade']],
               ['haunter', 24, ['shadow-claw', 'sucker-punch', 'confuse-ray', 'hypnosis']],
               ['mismagius', 26, ['shadow-ball', 'psybeam', 'magical-leaf', 'confuse-ray']]],
        before: 'Welcome to the Hearthome Gym! I am Fantina, the Gym Leader. I came from far away to learn about Ghost Pokémon, and now I share them with you! A Champion of three regions? How wonderful. Let us dance!',
        defeat: 'Ah, magnifique! You are truly strong, mon ami.',
        win: 'hearthome.fantina-win',
        afterScript: [['say', 'The next Gym is in Veilstone City, east past Route 209 and Solaceon Town. Its Leader, Maylene, uses Fighting types!', FANTINA]] }
    ]
  }, SINNOH));

  // ---------------- Cyrus on Mt. Coronet ----------------
  async function cyrus(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('cyrus-coronet')) return;
    h.emote('player', '!');
    if (me) { await h.walkTo('cyrus', me.x + 2, me.y); h.face('cyrus', 'left'); h.face('player', 'right'); }
    await h.say(T('...You there. Do you know where you are standing? This mountain is said to be where Sinnoh began.'), CYRUS);
    await h.say(T('My name is Cyrus. I have been thinking about this world. The land, the people, even the heart: everything in it wears away. It is all incomplete.'), CYRUS);
    await h.say(T('I intend to make a new world, one without that weakness. Remember my name. We will meet again.'), CYRUS);
    await h.fade('out', 0.4);
    h.hide('cyrus');
    F.setFlag('cyrus-coronet');
    await h.fade('in', 0.4);
    await h.say(T('The man in the grey coat walked off into the dark of the mountain.'));
  }

  G.Script.def({
    'coronet.cyrus': [['js', cyrus]],
    'route208.berry-master': [
      ['if', 'berry-master', [
        ['say', 'Berries grow best with patience. Come back when you have planted some of your own!', BERRY]
      ], [
        ['say', 'I am the Berry Master! I grow Berries of every kind behind this house.', BERRY],
        ['say', 'A traveling Trainer, eh? Take these. A Sitrus Berry heals a good deal of HP when a Pokémon needs it.', BERRY],
        ['giveItem', 'sitrus-berry', 2],
        ['setFlag', 'berry-master']
      ]]
    ],
    'hearthome.contest-hall': [['say', 'The Contest Hall. A sign says: "No contests today. Please come again!"']],
    'hearthome.barry': [
      ['say', 'Hey, {player}! I crossed Mt. Coronet ahead of you. I bumped into a weird guy in a grey coat in there...', BARRY],
      ['say', 'Anyway! Fantina\'s Ghost types are tough, so I am training first. Do not you dare beat her before me!', BARRY]
    ],
    'hearthome.gym-guide': [
      ['say', 'Hey, Champion! Fantina uses Ghost-type Pokémon.'],
      ['say', 'Ghost and Dark moves work great on them. Normal and Fighting moves pass right through them!'],
      ['say', 'Bring a team! A Pokémon that knows Bite, like a Luxio, is a big help, and Awakenings for when they put you to sleep. Up to level 30, your Pokémon from home will listen to you here.']
    ],
    'hearthome.fantina-win': [
      ['say', 'This is the Relic Badge. Take it, with my compliments!', FANTINA],
      ['badge', 29],
      ['jingle', 'badge'],
      ['say', '{player} received the Relic Badge from Fantina!'],
      ['say', 'With it, Pokémon up to level 35 will obey you here in Sinnoh, even ones from other regions.', FANTINA],
      ['say', 'And this is for you: TM65, Shadow Claw. A slash from the shadows that often hits a weak spot!', FANTINA],
      ['giveItem', 'tm65', 1],
      // The end of the forty-seventh chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(47) : G.Field.setFlag('chapter-47-done'))]
    ]
  });
})();
