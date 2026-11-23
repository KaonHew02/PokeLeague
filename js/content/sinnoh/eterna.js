/* ============ eterna.js — Eterna Forest, Route 205 (east), Eterna City and Gardenia's Gym ============
 * Chapter 46, the end of the chapter. At the edge of Eterna Forest, north of Route 205, Cheryl asks to
 * come along (flag cheryl-met; yes: cheryl-with): while she does, her Chansey heals the team after every
 * battle in the forest (the map's afterBattle), and at the east exit she gives two Sitrus Berries and
 * goes (flag cheryl-done). Chapter 101 (Platinum's, from the pret/pokeplatinum decompilation: eterna_forest,
 * res/trainers/data): she walks behind you (`companion`) and fights beside you (`ally`, Chansey Lv. 20) against the
 * forest's Trainers, Platinum's eight in four pairs (without her, plain double battles; their places and words are my
 * own). The forest: a long way round with a loop and a dead end. Route 205 east of the forest leads to Eterna City: a Pokémon Center, a Mart, a
 * house, the statue of a Pokémon from Sinnoh's oldest stories, Team Galactic's building (guarded) and
 * the cycle shop (closed); Route 211 is closed until the Forest Badge (route211.js; Route 206 and the building open in chapter 47, tgeterna.js). Gardenia uses Grass types
 * (Cherubi, Turtwig, Roserade); beating her gives the Forest Badge (badge 26: Pokémon up to Lv. 30 obey
 * in Sinnoh) and TM86 (Grass Knot), then `ending(46)`. Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const CHERYL = { name: 'Cheryl' }, GARDENIA = { name: 'Gardenia' }, BARRY = { name: 'Barry' };
  // Chapter 101: Cheryl behind you, and beside you against the pairs (Platinum's cheryl_eterna_forest).
  const CHERYL_TEAM = [['chansey', 20, ['egg-bomb', 'soft-boiled', 'refresh']]];
  const WITH_CHERYL = ['cheryl-with', '!cheryl-done'];
  const PAIR = { cls: 'double-team', double: true };
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Eterna Forest ----------------
  G.Maps.def(Object.assign({
    id: 'eterna-forest', loc: 'eterna-forest', tileset: 'outdoor', palette: 'forest', music: 'forest', battleBg: 'forest', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTRRRRRRT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTRRRRRRT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTRRRRRRT',
      'TTTTTTTTTTTTTTTTTTTTTTT,,,,,,,,,,RRRRRRT',
      'TT,,,,,,,,TTTTT""""""TT,,,,,,,,,,RRDRRRT',
      'TT,,,,,,,,TTTTT""""""TT,,TTTTTTT,,c,TTTT',
      'TT,,TTTTTTTTTTT""""""TT,,T"""""",,""""TT',
      'TT,"""TTTTTTTTT""""""TT,,T"""""",,""""TT',
      'TT,"""TT"""""TT""""""TT,,T"""""",,""""TT',
      'TT,"""TT""""",,,,,,,,,,,,T"""""",,""""TT',
      'TT,"""TT""""",,,,,,,,,,,,T"""""",,""""TT',
      'TT,,TTTT""""",,TTTTTTTTTTTTTTTTT,,TTTTTT',
      'TT,,,,,T""""",,TTTTTTTTTTTTTTTTT,,,,,,,,',
      'TT,,,,,T""""",,TTTTTTTTTTTTTTTTT,,,,,,,,',
      'TTTTT,,TTTTTT,,,,,,,,,,,,,,TTTTTTTTTTTTT',
      'TTTTT,,TTTTTT,,,,,,,,,,,,,,TTTTTTTTTTTTT',
      'TTTTT,,TTTTTT,,TTTTTTTTTT,,TTTTTTTTTTTTT',
      'TTTTT,,,,,,,,,,TTT""""""",,TTTTTTTTTTTTT',
      'TTTTT,,,,,,,,,,TTT""""""",,TTTTTTTTTTTTT',
      'TTTTT,,"""""TTTTTTTTTTTTu,,TTTTTTTTTTTTT',
      'TTTTT,,"""""TTTTTT,,,,,,,,,TTTTTTTTTTTTT',
      'TTTTT,,"""""TTTTTT,,,,,,,,,TTTTTTTTTTTTT',
      'TTTTT,,"""""TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route205s', offset: -21 }, east: { map: 'route205e', offset: 6 } },
    warps: [{ x: 35, y: 4, to: 'old-chateau', spot: 'door' }],          // the Old Chateau (chateau.js, chapter 69)
    spots: { chateau: [35, 5, 'down'] },
    // Cheryl's Chansey heals the team after each battle while she walks with you.
    afterBattle: { if: ['cheryl-with', '!cheryl-done'], script: 'eterna.cheryl-heal' },
    companion: { if: WITH_CHERYL, who: 'cheryl', name: 'Cheryl', say: 'Stay close! If Trainers come at us two at a time, Chansey and I will battle beside you.' },
    ally: { if: WITH_CHERYL, name: 'Cheryl', team: CHERYL_TEAM }, cherylTeam: CHERYL_TEAM,
    triggers: [
      { x: 5, y: 24, w: 2, h: 1, if: '!cheryl-met', script: 'eterna.cheryl' },
      { x: 37, y: 12, w: 1, h: 2, if: ['cheryl-with', '!cheryl-done'], script: 'eterna.cheryl-bye' }
    ],
    npcs: [
      { id: 'cheryl', who: 'cheryl', x: 6, y: 22, dir: 'down', if: ['!cheryl-with', '!cheryl-done'], script: 'eterna.cheryl' },
      { id: 'cheryl2', who: 'cheryl', x: 36, y: 13, dir: 'left', if: 'scripted' }
    ],
    // Chapter 101: Platinum's eight Trainers of the forest in four pairs (their teams alternate: rules.tag beside Cheryl).
    trainers: [
      Object.assign({ id: 'phillip-donald', who: 'bugcatcher', name: 'Phillip & Donald', x: 9, y: 19, dir: 'up', sight: 2, partner: { who: 'bugcatcher', x: 10, y: 19, dir: 'up' },
        team: [['wurmple', 11, ['tackle', 'string-shot', 'poison-sting']], ['burmy', 14], ['cascoon', 13, ['tackle', 'string-shot', 'poison-sting', 'harden']], ['burmy', 14],
               ['dustox', 15, ['tackle', 'poison-sting', 'confusion', 'gust']]],
        before: 'We are bug hunting in pairs today. Want to see what we caught?',
        defeat: 'Our bugs got squashed...',
        after: 'Wurmple evolve into Silcoon or Cascoon. Nobody can tell which until it happens.' }, PAIR),
      Object.assign({ id: 'jack-briana', who: 'bugcatcher', name: 'Jack & Briana', x: 19, y: 8, dir: 'down', sight: 2, partner: { who: 'lass', x: 20, y: 8, dir: 'down' },
        team: [['wurmple', 11, ['tackle', 'string-shot', 'poison-sting']], ['pachirisu', 16], ['silcoon', 13, ['tackle', 'string-shot', 'poison-sting', 'harden']],
               ['beautifly', 15, ['tackle', 'poison-sting', 'absorb', 'gust']]],
        before: 'The forest is our bug paradise! Two of you? Then two of us!',
        defeat: 'My collection got squashed, and her Pachirisu too...',
        after: 'Pachirisu are not bugs, but Briana says it can come along anyway.' }, PAIR),
      Object.assign({ id: 'kody-rachael', who: 'psychic', name: 'Kody & Rachael', x: 25, y: 3, dir: 'down', sight: 1, partner: { who: 'psychic', x: 26, y: 3, dir: 'down' },
        team: [['meditite', 17, ['confusion', 'bide', 'meditate']], ['psyduck', 17, ['confusion', 'water-gun', 'scratch']]],
        before: 'We saw the two of you coming in a dream. In the dream, we won!',
        defeat: 'The dream was wrong...',
        after: 'The old house deep in the forest? Even we cannot see what waits inside.' }, PAIR),
      Object.assign({ id: 'lindsey-elijah', who: 'psychic', name: 'Lindsey & Elijah', x: 31, y: 8, dir: 'right', sight: 2, partner: { who: 'psychic', x: 31, y: 9, dir: 'right' },
        team: [['abra', 17, ['hidden-power']], ['abra', 17, ['hidden-power']]],
        before: 'We sensed you coming from far away. We also sense that you will lose!',
        defeat: 'Our senses failed us...',
        after: 'This forest is full of strange feelings. Some come from the Pokémon, some from somewhere older.' }, PAIR)
    ],
    items: [{ x: 37, y: 7, item: 'insect-plate', flag: 'eterna-forest-insect-plate', then: 'sitems.found' },   // chapter 94
            { x: 21, y: 20, item: 'super-potion', flag: 'eterna-forest-potion' }, { x: 2, y: 4, item: 'great-ball', flag: 'eterna-forest-ball' }],
    encounters: { walk: '@eterna-forest-area' }
  }, SINNOH));

  // ---------------- Route 205, east ----------------
  G.Maps.def(Object.assign({
    id: 'route205e', loc: 'sinnoh-route-205', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T.."""""".TT...."""""..T',
      'T.."""""".uT...."""""..T',
      'T..""""""......."""""..T',
      'T....................S.T',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,',
      'T......................T',
      'T."""""....""""""".....T',
      'T."""""....""""""".....T',
      'T."""""....""""""".....T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'eterna-forest', offset: -6 }, east: { map: 'eterna', offset: -7 } },
    signs: { '21,5': 'Route 205. East: Eterna City. West: Eterna Forest.' },
    trainers: [
      { id: 'zackary', who: 'camper', cls: 'camper', name: 'Zackary', x: 8, y: 5, dir: 'down', sight: 1, team: [['starly', 15], ['shinx', 16]],
        before: 'I finally made it out of the forest. I need a battle to celebrate!',
        defeat: 'Some celebration that was.',
        after: 'Eterna City is the oldest city in Sinnoh. People say its statue is older than the city itself.' },
      { id: 'sharon', who: 'lass', cls: 'picnicker', name: 'Sharon', x: 15, y: 8, dir: 'up', sight: 1, team: [['shellos', 16], ['cherubi', 17]],
        before: 'Going to Eterna? Then test your team on mine first!',
        defeat: 'Your team passed the test.',
        after: 'Gardenia, the Eterna Gym Leader, sometimes walks in the forest to talk to the trees.' }
    ],
    encounters: { walk: '@sinnoh-route-205-east-towards-eterna-city' }
  }, SINNOH));

  // ---------------- Eterna City ----------------
  G.Maps.def(Object.assign({
    id: 'eterna', items: [{ x: 33, y: 2, item: 'draco-plate', flag: 'eterna-draco-plate', then: 'sitems.found' }],   // chapter 94
    loc: 'eterna-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
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
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TT',
      'T................,,................T',
      'T..YYYYYYYY......,,................T',
      'T..YYYYYYYY......,,....BBBBBB......T',
      'T..YYYYYYYY......,,....BBBBBB......T',
      'T..YYYYYYYY......,,....BBBBBB......T',
      'T..YYYYYYYY......,,....BBDBBB......T',
      'T..YYYDYYYY.HHHH.,,,,,,,,,.........T',
      'T.....,.....HHHH.,,.........~~~~~..T',
      'T.....,.....HDHH.,,.........~~~~~..T',
      'T.....,......,,,,,,.........~~~~~..T',
      'T.....,,,,,,,,,,,,,.........~~~~~..T',
      'T................,T................T',
      'TTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'route205e', offset: 7 }, south: { map: 'route206', offset: 8 }, east: { map: 'route211w', offset: 3 } },
    warps: [
      { x: 6, y: 7, to: 'eterna-center', spot: 'door' },
      { x: 11, y: 7, to: 'eterna-mart', spot: 'door' },
      { x: 25, y: 7, to: 'eterna-gym', spot: 'door' },
      // Chapter 47: the building opens with the Forest Badge, the cycle shop once Team Galactic has gone.
      { x: 6, y: 21, to: 'tg-eterna-1f', spot: 'door', if: 'badge:26', locked: 'eterna.galactic-door' },
      { x: 25, y: 20, to: 'eterna-cycle', spot: 'door', if: 'tg-eterna-done', locked: 'eterna.cycle-closed' },
      { x: 13, y: 23, to: 'eterna-house', spot: 'door' }
    ],
    spots: { 'center-door': [6, 8, 'down'], 'mart-door': [11, 8, 'down'], 'gym-door': [25, 8, 'down'], 'house-door': [13, 24, 'down'],
             'tg-door': [6, 22, 'down'], 'cycle-door': [25, 21, 'down'] },
    signs: { '16,10': 'An ancient statue of a Pokémon. The plaque says it stood here long before the city, and that it shows a Pokémon from the oldest stories of Sinnoh.' },
    npcs: [
      // Route 211 (east) opens with the Forest Badge (route211.js, chapter 66); Route 206 (south) in chapter 47;
      // Team Galactic's building is guarded.
      { id: 'hiker', who: 'hiker', x: 34, y: 13, dir: 'left', if: '!badge:26',
        say: 'Rocks fell on the path to Mt. Coronet. Nobody gets through until they are cleared!' },
      { id: 'aide', who: 'aide', x: 16, y: 26, dir: 'right', script: 'gifts.exp-share' },              // chapter 104 (gifts.js)
      { id: 'worker', who: 'engineer', x: 17, y: 26, dir: 'up', if: '!tg-eterna-done',
        say: 'Cycling Road is closed for repairs. Come back when it is finished!' },
      { id: 'grunt', who: 'galactic', x: 6, y: 22, dir: 'down', if: '!badge:26',
        say: 'This is the Team Galactic Eterna Building. Members only. Scram, kid!' },
      // Chapter 47: with the Forest Badge, the cycle shop's owner asks for help and Gardenia keeps watch.
      { id: 'owner', who: 'gentleman', x: 27, y: 21, dir: 'left', if: ['badge:26', '!tg-eterna-done'], script: 'eterna.owner' },
      { id: 'gardenia', who: 'gardenia', x: 5, y: 22, dir: 'right', if: ['badge:26', '!tg-eterna-done'], script: 'eterna.gardenia-door' },
      { id: 'barry', who: 'barry', x: 20, y: 12, dir: 'down', if: '!badge:26', script: 'eterna.barry' },
      { id: 'lady', who: 'beauty', x: 28, y: 15, move: 'wander', r: 2,
        say: 'Gardenia\'s Gym is full of plants. Some days you cannot even see the Trainers for the leaves!' }
    ],
    encounters: { water: '@eterna-city-area' }
  }, SINNOH));

  G.Maps.center('eterna-center', {
    loc: 'eterna-city', exit: { map: 'eterna', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'Eterna is a city of old things: old stories, old trees, and a statue nobody can date.' }]
  }).region = 'sinnoh';

  G.Maps.mart('eterna-mart', {
    loc: 'eterna-city', exit: { map: 'eterna', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'Grass types can put you to sleep or paralyze you with their powders. Bring Awakenings and Paralyze Heals!' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'eterna-house', loc: 'eterna-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'eterna', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
             say: 'The statue in the square? My grandmother said it shows a Pokémon that rules over time itself. Who knows!' }]
  }, SINNOH));

  // ---------------- Gardenia's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'eterna-gym', loc: 'eterna-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+p+p+++p+p+p', '+++++++++++++', 'pp+++++++++pp', '+++++++++++++', '++p+++++++p++', '+++++++++++++',
           'pp+++++++++pp', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'eterna', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'eterna.gym-guide' }],
    trainers: [
      { id: 'jenna', who: 'beauty', cls: 'aroma-lady', name: 'Jenna', x: 3, y: 9, dir: 'right', sight: 3, team: [['budew', 17], ['cherubi', 17]],
        before: 'Breathe in. Smell that? That is the scent of your defeat!',
        defeat: 'My perfume did not work...',
        after: 'Gardenia says every plant has its own scent, and every Pokémon its own strength.' },
      { id: 'caroline', who: 'lass', cls: 'lass', name: 'Caroline', x: 9, y: 7, dir: 'left', sight: 3, team: [['cherubi', 18]],
        before: 'This Gym is like a jungle! I love it here.',
        defeat: 'Lost in the jungle...',
        after: 'Fire burns, Flying pecks, Bug bites: Grass types have lots of weak spots!' },
      { id: 'angela', who: 'beauty', cls: 'aroma-lady', name: 'Angela', x: 3, y: 5, dir: 'right', sight: 3, team: [['roselia', 18], ['budew', 18]],
        before: 'My Roselia\'s roses are lovely, but they have thorns!',
        defeat: 'Pricked by my own thorns.',
        after: 'Gardenia\'s Roserade is the most elegant Pokémon I have ever seen.' },
      { id: 'mariah', who: 'lass', cls: 'lass', name: 'Mariah', x: 9, y: 4, dir: 'left', sight: 2, team: [['turtwig', 19]],
        before: 'Gardenia is right behind me. You will not reach her!',
        defeat: 'Go on, then. She is waiting.',
        after: 'Gardenia\'s Turtwig is so cute. Do not let that fool you!' },
      { id: 'gardenia', who: 'gardenia', cls: 'leader', name: 'Gardenia', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 2 },
        team: [['cherubi', 20, ['grass-knot', 'leech-seed', 'safeguard', 'growth']],
               ['turtwig', 20, ['razor-leaf', 'grass-knot', 'sunny-day', 'reflect']],
               ['roserade', 22, ['magical-leaf', 'grass-knot', 'stun-spore', 'poison-sting']]],
        before: 'Welcome to the Eterna Gym! I am Gardenia, the Gym Leader, and I just love Grass-type Pokémon. A Champion of three regions? My Grass Pokémon will not wilt for anybody!',
        defeat: 'Amazing... You made my garden bloom in a whole new way!',
        win: 'eterna.gardenia-win',
        afterScript: [['say', 'The next Gym is in Hearthome City, on the far side of Mt. Coronet. Its Leader, Fantina, uses Ghost types. Spooky!', GARDENIA]] }
    ]
  }, SINNOH));

  // ---------------- Cheryl in Eterna Forest ----------------
  async function cheryl(h) {
    const F = G.Field;
    if (F.flag('cheryl-with') || F.flag('cheryl-done')) return;
    h.emote('cheryl', '!');
    await h.say(T('Excuse me! Are you going through Eterna Forest? It is dark and full of Trainers, and I am a little nervous on my own.'), CHERYL);
    const yes = await h.choice(T('May I come along with you? My Chansey can heal your Pokémon after every battle.'), { options: ['Yes', 'No'], name: CHERYL.name });
    F.setFlag('cheryl-met');
    if (yes === 0) {
      await h.say(T('Thank you! I will stay right behind you.'), CHERYL);
      await h.say(T('The Trainers here like to battle two at a time. If they do, Chansey and I will battle beside you!'), CHERYL);
      F.setFlag('cheryl-with');
      h.hide('cheryl');
      if (G.World.makeFollower) G.World.makeFollower();
    } else {
      await h.say(T('Oh... Then I will wait here a little longer. Tell me if you change your mind!'), CHERYL);
    }
  }

  async function cherylBye(h) {
    const F = G.Field, me = G.World.player;
    if (!F.flag('cheryl-with') || F.flag('cheryl-done')) return;
    F.setFlag('cheryl-done');
    if (G.World.makeFollower) G.World.makeFollower();
    if (me) h.place('cheryl2', me.x - 1, me.y, 'right');
    h.show('cheryl2');
    await h.say(T('We made it out of the forest! Thank you so much for letting me come along.'), CHERYL);
    // Chapter 104: a Soothe Bell, as in Platinum (eterna_forest/scripts.s).
    await h.say(T('Please take this as a token of my thanks. A Pokémon wearing it grows fond of you faster.'), CHERYL);
    await G.Script.exec([['giveItem', 'soothe-bell', 1]], h);
    await h.say(T('Eterna City is just ahead. Good luck at the Gym!'), CHERYL);
    F.setFlag('cheryl-done');
    h.hide('cheryl2');
  }

  G.Script.def({
    'eterna.cheryl': [['js', cheryl]],
    'eterna.cheryl-bye': [['js', cherylBye]],
    'eterna.cheryl-heal': [
      ['healAnim'], ['heal'],
      ['say', 'Cheryl\'s Chansey looked after your Pokémon. They are fully healed!']
    ],
    'eterna.galactic-door': [['say', 'The door is locked. A sign says: "Team Galactic Eterna Building. Staff only."']],
    'eterna.cycle-closed': [['say', 'The cycle shop is closed. A note on the door says: "Back soon!"']],
    'eterna.owner': [
      ['say', 'Team Galactic grabbed my Clefairy right out of my shop and took it into that building!', { name: 'Cycle Shop Owner' }],
      ['say', 'I cannot fight them on my own. Please, help my Clefairy!', { name: 'Cycle Shop Owner' }]
    ],
    'eterna.gardenia-door': [
      ['say', "Oh, {player}! Team Galactic took the cycle shop owner's Clefairy into their building.", GARDENIA],
      ['say', 'You beat me, so I know you are strong. Go on in! I will stay out here and make sure none of them sneak away.', GARDENIA]
    ],
    'eterna.barry': [
      ['say', 'Hey, {player}! I went through the forest in no time. Did you get lost?', BARRY],
      ['say', 'I am off to challenge Gardenia right now! Grass types do not stand a chance against my Starly!', BARRY]
    ],
    'eterna.gym-guide': [
      ['say', 'Hey, Champion! Gardenia uses Grass-type Pokémon.'],
      ['say', 'Fire, Flying, Bug, Poison and Ice moves work great on them. Water, Ground and Rock moves barely tickle them.'],
      ['say', 'Picked Piplup? Bring a Starly, or a Pokémon from home with the right moves. Up to level 25, they will listen to you here.']
    ],
    'eterna.gardenia-win': [
      ['say', 'This is the Forest Badge. You earned it!', GARDENIA],
      ['badge', 26],
      ['jingle', 'badge'],
      ['say', '{player} received the Forest Badge from Gardenia!'],
      ['say', 'With it, Pokémon up to level 30 will obey you here in Sinnoh, even ones from other regions.', GARDENIA],
      ['say', 'And take this. TM86 is Grass Knot: the heavier the foe, the harder it trips!', GARDENIA],
      ['giveItem', 'tm86', 1],
      // The end of the forty-sixth chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(46) : G.Field.setFlag('chapter-46-done'))]
    ]
  });
})();
