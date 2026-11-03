/* ============ eterna.js — Eterna Forest, Route 205 (east), Eterna City and Gardenia's Gym ============
 * Chapter 46, the end of the chapter. At the edge of Eterna Forest, north of Route 205, Cheryl asks to
 * come along (flag cheryl-met; yes: cheryl-with): while she does, her Chansey heals the team after every
 * battle in the forest (the map's afterBattle), and at the east exit she gives two Sitrus Berries and
 * goes (flag cheryl-done). The forest: a long way round with a loop and a dead end, Trainers (one pair
 * battles two at a time). Route 205 east of the forest leads to Eterna City: a Pokémon Center, a Mart, a
 * house, the statue of a Pokémon from Sinnoh's oldest stories, Team Galactic's building (guarded) and
 * the cycle shop (closed); Routes 211 and 206 are closed in this chapter. Gardenia uses Grass types
 * (Cherubi, Turtwig, Roserade); beating her gives the Forest Badge (badge 26: Pokémon up to Lv. 30 obey
 * in Sinnoh) and TM86 (Grass Knot), then `ending(46)`. Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const CHERYL = { name: 'Cheryl' }, GARDENIA = { name: 'Gardenia' }, BARRY = { name: 'Barry' };
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Eterna Forest ----------------
  G.Maps.def(Object.assign({
    id: 'eterna-forest', loc: 'eterna-forest', tileset: 'outdoor', palette: 'forest', music: 'forest', battleBg: 'forest', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTT,,,,,,,,,,,TTTTTT',
      'TT,,,,,,,,TTTTT""""""TT,,,,,,,,,,,TTTTTT',
      'TT,,,,,,,,TTTTT""""""TT,,TTTTTTT,,TTTTTT',
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
      'TTTTT,,"""""TTTTTTTTTTTTT,,TTTTTTTTTTTTT',
      'TTTTT,,"""""TTTTTT,,,,,,,,,TTTTTTTTTTTTT',
      'TTTTT,,"""""TTTTTT,,,,,,,,,TTTTTTTTTTTTT',
      'TTTTT,,"""""TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route205s', offset: -21 }, east: { map: 'route205e', offset: 6 } },
    // Cheryl's Chansey heals the team after each battle while she walks with you.
    afterBattle: { if: ['cheryl-with', '!cheryl-done'], script: 'eterna.cheryl-heal' },
    triggers: [
      { x: 5, y: 24, w: 2, h: 1, if: '!cheryl-met', script: 'eterna.cheryl' },
      { x: 37, y: 12, w: 1, h: 2, if: ['cheryl-with', '!cheryl-done'], script: 'eterna.cheryl-bye' }
    ],
    npcs: [
      { id: 'cheryl', who: 'cheryl', x: 6, y: 22, dir: 'down', if: ['!cheryl-with', '!cheryl-done'], script: 'eterna.cheryl' },
      { id: 'cheryl2', who: 'cheryl', x: 36, y: 13, dir: 'left', if: 'scripted' }
    ],
    trainers: [
      { id: 'jack', who: 'bugcatcher', cls: 'bug-catcher', name: 'Jack', x: 18, y: 9, dir: 'left', sight: 3, team: [['wurmple', 13], ['silcoon', 14], ['beautifly', 15]],
        before: 'The forest is my bug paradise! Want to see my collection?',
        defeat: 'My collection got squashed...',
        after: 'Wurmple evolve into Silcoon or Cascoon. Nobody can tell which until it happens.' },
      { id: 'kody-sue', who: 'cooltrainerm', cls: 'young-couple', name: 'Kody & Sue', x: 25, y: 3, dir: 'down', sight: 1, double: true,
        partner: { who: 'beauty', x: 26, y: 3 }, team: [['buneary', 14], ['starly', 15]],
        before: 'A walk in the forest together, and now a double battle together!',
        defeat: 'At least we lost together.',
        after: 'The old house deep in the forest? We heard it is haunted. We are not going in!' },
      { id: 'lindsey', who: 'psychic', cls: 'psychic', name: 'Lindsey', x: 32, y: 8, dir: 'right', sight: 1, team: [['abra', 15], ['kadabra', 16]],
        before: 'I sensed you coming from far away. I also sense that you will lose!',
        defeat: 'My senses failed me...',
        after: 'This forest is full of strange feelings. Some come from the Pokémon, some from somewhere older.' },
      { id: 'caitlin', who: 'lass', cls: 'picnicker', name: 'Caitlin', x: 8, y: 4, dir: 'left', sight: 3, team: [['budew', 14], ['cherubi', 15]],
        before: 'I come to this quiet corner to pick berries. A battle is fine too!',
        defeat: 'Back to my berries, then.',
        after: 'Cherubi\'s little ball is full of nutrients. That is what it feeds on.' }
    ],
    items: [{ x: 21, y: 20, item: 'super-potion', flag: 'eterna-forest-potion' }, { x: 2, y: 4, item: 'great-ball', flag: 'eterna-forest-ball' }],
    encounters: { walk: '@eterna-forest-area' }
  }, SINNOH));

  // ---------------- Route 205, east ----------------
  G.Maps.def(Object.assign({
    id: 'route205e', loc: 'sinnoh-route-205', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T.."""""".TT...."""""..T',
      'T.."""""".TT...."""""..T',
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
    id: 'eterna', loc: 'eterna-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
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
    connect: { west: { map: 'route205e', offset: 7 } },
    warps: [
      { x: 6, y: 7, to: 'eterna-center', spot: 'door' },
      { x: 11, y: 7, to: 'eterna-mart', spot: 'door' },
      { x: 25, y: 7, to: 'eterna-gym', spot: 'door' },
      { x: 6, y: 21, locked: 'eterna.galactic-door' },
      { x: 25, y: 20, locked: 'eterna.cycle-closed' },
      { x: 13, y: 23, to: 'eterna-house', spot: 'door' }
    ],
    spots: { 'center-door': [6, 8, 'down'], 'mart-door': [11, 8, 'down'], 'gym-door': [25, 8, 'down'], 'house-door': [13, 24, 'down'] },
    signs: { '16,10': 'An ancient statue of a Pokémon. The plaque says it stood here long before the city, and that it shows a Pokémon from the oldest stories of Sinnoh.' },
    npcs: [
      // Route 211 (east) and Route 206 (south) open in later chapters; Team Galactic's building is guarded.
      { id: 'hiker', who: 'hiker', x: 34, y: 13, dir: 'left',
        say: 'Rocks fell on the path to Mt. Coronet. Nobody gets through until they are cleared!' },
      { id: 'worker', who: 'engineer', x: 17, y: 26, dir: 'up',
        say: 'Cycling Road is closed for repairs. Come back when it is finished!' },
      { id: 'grunt', who: 'galactic', x: 6, y: 22, dir: 'down',
        say: 'This is the Team Galactic Eterna Building. Members only. Scram, kid!' },
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
      F.setFlag('cheryl-with');
      h.hide('cheryl');
    } else {
      await h.say(T('Oh... Then I will wait here a little longer. Tell me if you change your mind!'), CHERYL);
    }
  }

  async function cherylBye(h) {
    const F = G.Field, me = G.World.player;
    if (!F.flag('cheryl-with') || F.flag('cheryl-done')) return;
    if (me) h.place('cheryl2', me.x - 1, me.y, 'right');
    h.show('cheryl2');
    await h.say(T('We made it out of the forest! Thank you so much for letting me come along.'), CHERYL);
    await h.say(T('Please take these. A Sitrus Berry heals a Pokémon when its HP runs low.'), CHERYL);
    F.giveItem('sitrus-berry', 2);
    const j = h.jingle('item');
    await h.say(T('{player} received {item} ×{n}!'), { vars: { item: G.Names.item('sitrus-berry'), n: 2 } });
    await j;
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
