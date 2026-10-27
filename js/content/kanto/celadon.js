/* ============ celadon.js — Route 8, the Underground Path (west-east), Route 7, Celadon City ============
 * West of Lavender Town: Route 8 (five Trainers), the gates to Saffron City (closed: the guards
 * are thirsty and let nobody through), the Underground Path to Route 7, and Celadon City:
 * Pokémon Center, the Department Store (1F to the rooftop: items and TMs, evolution stones,
 * vitamins and battle items, drinks; a girl on the roof trades TMs for drinks), Celadon Mansion
 * (an Eevee waits in a room on its roof), a restaurant, a house, the Game Corner (hideout.js)
 * and, behind a small tree, Erika's Gym (erika.js).
 */
G.Maps.def({
  id: 'route8', loc: 'kanto-route-8', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TBBBBBB...HHHH......""""""""......"""".T',
    'TBBBBBB...HHHH......""""""""......"""".T',
    'TBBBBBB...HDHH......""""""""......"""".T',
    'TBBDBBB....,...........................T',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.....vvvvvvvvvvvv........vvvvvvvvvv...T',
    'T......................................T',
    'T...""""""""""......"""""""""".........T',
    'T...""""""""""......"""""""""".........T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'lavender', offset: -3 } },
  warps: [{ x: 11, y: 3, to: 'underground-east', spot: 'door' }, { x: 3, y: 4, locked: 'celadon.saffron-gate' }],
  spots: { east: [38, 5, 'left'], 'under-door': [11, 4, 'down'] },
  trainers: [
    { id: 'aidan', who: 'supernerd', cls: 'super-nerd', name: 'Aidan', x: 16, y: 4, dir: 'down', sight: 2,
      team: [['koffing', 23], ['grimer', 23]],
      before: 'I study Pokémon that live in garbage. They are fascinating! Let me show you!',
      defeat: 'My research needs more data...',
      after: 'Grimer was born from sludge. Science is beautiful, isn\'t it?' },
    { id: 'julia', who: 'lass', cls: 'lass', name: 'Julia', x: 22, y: 8, dir: 'up', sight: 2,
      team: [['clefairy', 23], ['jigglypuff', 23]],
      before: 'Aren\'t my Pokémon the cutest? Battle me and see for yourself!',
      defeat: 'Cute is not enough, I guess...',
      after: 'The Celadon Department Store sells the cutest things. And useful ones too!' },
    { id: 'rich', who: 'gambler', cls: 'gambler', name: 'Rich', x: 28, y: 4, dir: 'down', sight: 2,
      team: [['growlithe', 22], ['vulpix', 22]],
      before: 'I am on my way to the Game Corner in Celadon. A warm-up battle first!',
      defeat: 'Not a lucky day...',
      after: 'The slot machines at the Game Corner are broken, they say. Shady people hang around it lately.' },
    { id: 'jaren', who: 'biker', cls: 'biker', name: 'Jaren', x: 37, y: 8, dir: 'up', sight: 2,
      team: [['koffing', 24], ['grimer', 24]],
      before: 'Out of my way, kid! Or battle me, if you dare!',
      defeat: 'You have guts, kid.',
      after: 'Saffron City is shut tight. The guards won\'t let anyone through.' },
    { id: 'paige', who: 'lass', cls: 'lass', name: 'Paige', x: 4, y: 8, dir: 'up', sight: 2,
      team: [['nidoran-f', 24], ['nidorina', 24]],
      before: 'I trained my Nidoran all the way from Route 22! Battle!',
      defeat: 'Back to Route 22 for more training...',
      after: 'The Underground Path is the only way to Celadon from here.' }
  ],
  items: [{ x: 33, y: 10, item: 'great-ball', flag: 'route8-ball' }],
  encounters: { walk: '@kanto-route-8-area' }
});

G.Maps.def({
  id: 'underground-east', loc: 'kanto-underground-path', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWW', 'WWWWWWWWW', 'b____^___', '_________', '_________', '____X____'],
  warps: [{ x: 4, y: 5, to: 'route8', spot: 'under-door' }, { x: 5, y: 2, to: 'underground-ew', spot: 'east' }],
  spots: { door: [4, 5, 'up'], stairs: [5, 3, 'down'] },
  signs: { '0,2': 'Underground Path. Route 8 to Route 7, under Saffron City.' }
});

G.Maps.def({
  id: 'underground-ew', loc: 'kanto-underground-path', tileset: 'indoor', palette: 'gym', music: 'cave', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW^WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW^WW',
    'WW++++++++++++++++++++++++++++++++WW',
    'WW++++++++++++++++++++++++++++++++WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [{ x: 2, y: 2, to: 'underground-west', spot: 'stairs' }, { x: 33, y: 2, to: 'underground-east', spot: 'stairs' }],
  spots: { west: [2, 3, 'down'], east: [33, 3, 'down'] },
  items: [
    { x: 18, y: 4, item: 'elixir', flag: 'underground-ew-hidden-elixir', hidden: true },
    { x: 9, y: 3, item: 'nugget', flag: 'underground-ew-hidden-nugget', hidden: true }
  ]
});

G.Maps.def({
  id: 'underground-west', loc: 'kanto-underground-path', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWW', 'WWWWWWWWW', 'b____^___', '_________', '_________', '____X____'],
  warps: [{ x: 4, y: 5, to: 'route7', spot: 'under-door' }, { x: 5, y: 2, to: 'underground-ew', spot: 'west' }],
  spots: { door: [4, 5, 'up'], stairs: [5, 3, 'down'] },
  signs: { '0,2': 'Underground Path. Celadon City is just west of here.' },
  npcs: [{ id: 'guard', who: 'officer', x: 2, y: 3, dir: 'right', say: 'Saffron City is closed, so everybody walks underneath it. Good for the legs!' }]
});

G.Maps.def({
  id: 'route7', loc: 'kanto-route-7', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTT',
    'T....HHHH........T',
    'T....HHHH...BBBBBB',
    'T....HDHH...BBBBBB',
    'T.....,.....BBBBBB',
    'T.....,.....BBDBBB',
    'T.....,.......,..T',
    ',,,,,,,,,,,,,,,..T',
    ',,,,,,,,,,,,,,,..T',
    'T..""""""""""""..T',
    'T..""""""""""""..T',
    'TTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'celadon', offset: -1 } },
  warps: [{ x: 6, y: 3, to: 'underground-west', spot: 'door' }, { x: 14, y: 5, locked: 'celadon.saffron-gate' }],
  spots: { west: [1, 7, 'right'], 'under-door': [6, 4, 'down'] },
  encounters: { walk: '@kanto-route-7-area' }
});

G.Maps.def({
  id: 'celadon', loc: 'celadon-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................................T',
    'T..EEEEEEEE.....BBBBBB.......CCCCC.....T',
    'T..EEEEEEEE.....BBBBBB.......CCCCC.....T',
    'T..EEEEEEEE.....BBBBBB.......CCCCC.....T',
    'T..EEEEEEEE.....BBBDBB.......CCDCC.....T',
    'T..EEEDEEEE........,...........,.......T',
    'T.....,............,...........,.......T',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.....~~~~~~.....,.....................T',
    'T.....~~~~~~.....,.....BBBBBB...HHHH...T',
    'T.....~~~~~~.....,.....BBBBBB...HHHH...T',
    'T........S.......,.....BBBBBB...HDHH...T',
    'T................,.....BBDBBB....,.....T',
    'TTTTTTTTTT.......,.......,.......,.....T',
    'T........T.......,,,,,,,,,,,,,,,,,.....T',
    'T.GGGGGG.T.......,.....................T',
    'T.GGGGGG.T.......,.....HHHH............T',
    'T.GGGGGG.T.......,.....HHHH............T',
    'T.GGGGGG.T.......,.....HDHH............T',
    'T.GGGDGG.T.......,......,..............T',
    'T....,...T.S.....,......,..............T',
    'T....,,,,c,,,,,,,,,,,,,,,..............T',
    'T........T.............................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route7', offset: 1 } },
  warps: [
    { x: 6, y: 6, to: 'dept-1f', spot: 'door' },
    { x: 19, y: 5, to: 'mansion-1f', spot: 'door' },
    { x: 31, y: 5, to: 'celadon-center', spot: 'door' },
    { x: 25, y: 14, to: 'celadon-gamecorner', spot: 'door' },
    { x: 33, y: 13, to: 'celadon-restaurant', spot: 'door' },
    { x: 24, y: 20, to: 'celadon-house', spot: 'door' },
    { x: 5, y: 21, to: 'celadon-gym', spot: 'door' }
  ],
  spots: {
    east: [38, 8, 'left'], 'dept-door': [6, 7, 'down'], 'mansion-door': [19, 6, 'down'], 'center-door': [31, 6, 'down'],
    'restaurant-door': [33, 14, 'down'], 'gamecorner-door': [25, 15, 'down'], 'house-door': [24, 21, 'down'], 'gym-door': [5, 22, 'down']
  },
  signs: {
    '9,13': 'Celadon City. A big, bright city where dreams come in every color.',
    '11,22': 'Celadon City Pokémon Gym. Leader: Erika, the gentle lover of nature!'
  },
  npcs: [
    { id: 'girl', who: 'lass', x: 13, y: 11, move: 'look',
      say: 'Erika grows flowers in her Gym. It smells wonderful in there, but her Grass-type Pokémon are no joke!' },
    { id: 'man', who: 'gentleman', x: 28, y: 17, move: 'wander', r: 2,
      say: 'The Department Store has everything a Trainer could want. Even evolution stones!' },
    { id: 'rocket', who: 'rocket', x: 27, y: 15, dir: 'up', move: 'look', if: '!hideout-boss',
      say: 'What are you looking at? Nothing is going on in the Game Corner. Nothing at all. Move along, kid.' }
  ],
  encounters: {}
});

G.Maps.center('celadon-center', {
  loc: 'celadon-city', exit: { map: 'celadon', spot: 'center-door' },
  npcs: [{ id: 'beauty', who: 'beauty', x: 9, y: 5, move: 'look',
           say: 'Some Pokémon evolve when they touch a special stone. Eevee can turn into three different Pokémon that way!' }]
});

// ---------------- the Department Store ----------------
const DEPT = { loc: 'celadon-city', tileset: 'indoor', palette: 'mart', music: 'mart', battleBg: 'indoor' };
G.Maps.def(Object.assign({
  id: 'dept-1f',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    'b+b+b++++++^+p',
    '++++++++++++++',
    '+===++++++++++',
    '++++++++++++++',
    'p++++++++++++p',
    '++++++X+++++++'
  ],
  warps: [{ x: 6, y: 7, to: 'celadon', spot: 'dept-door' }, { x: 11, y: 2, to: 'dept-2f', spot: 'from-below' }],
  spots: { door: [6, 7, 'up'], 'from-above': [11, 3, 'down'] },
  signs: { '0,2': 'Floor guide. 1F: Service Counter. 2F: Trainer\'s Market. 3F: Evolution stones. 4F: Battle items and vitamins. Rooftop: Vending machines.' },
  npcs: [{ id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'down',
           say: 'Welcome to the Celadon Department Store! The stairs to the upper floors are on the right.' }]
}, DEPT));

G.Maps.def(Object.assign({
  id: 'dept-2f',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    '^+b+b+b++++^+p',
    '++++++++++++++',
    '+===+++++===++',
    '++++++++++++++',
    'p++++++++++++p',
    '++++++++++++++'
  ],
  warps: [{ x: 11, y: 2, to: 'dept-1f', spot: 'from-above' }, { x: 0, y: 2, to: 'dept-3f', spot: 'from-below' }],
  spots: { 'from-below': [11, 3, 'down'], 'from-above': [0, 3, 'down'] },
  npcs: [
    { id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'down', script: [
      ['say', 'Welcome to the Trainer\'s Market! Everything you need on the road.'],
      ['shop', ['great-ball', 'super-potion', 'revive', 'super-repel', 'antidote', 'burn-heal', 'ice-heal', 'awakening', 'paralyze-heal']]
    ] },
    { id: 'tm-clerk', who: 'clerk', x: 10, y: 3, dir: 'down', script: [
      ['say', 'Technical Machines! Teach your Pokémon a new move in an instant.'],
      ['shop', ['tm05', 'tm15', 'tm28', 'tm31', 'tm43', 'tm45']]
    ] },
    { id: 'shopper', who: 'youngster', x: 6, y: 6, move: 'wander', r: 2,
      say: 'A TM teaches its move as many times as you like. Great value, right?' }
  ]
}, DEPT));

G.Maps.def(Object.assign({
  id: 'dept-3f',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    '^+b+b+b++++^+p',
    '++++++++++++++',
    '+===++++++++++',
    '++++++++++++++',
    'p++++++++++++p',
    '++++++++++++++'
  ],
  warps: [{ x: 0, y: 2, to: 'dept-2f', spot: 'from-above' }, { x: 11, y: 2, to: 'dept-4f', spot: 'from-below' }],
  spots: { 'from-below': [0, 3, 'down'], 'from-above': [11, 3, 'down'] },
  npcs: [
    { id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'down', script: [
      ['say', 'Evolution stones! Some Pokémon only evolve when they touch one.'],
      ['shop', ['fire-stone', 'water-stone', 'thunder-stone', 'leaf-stone']]
    ] },
    { id: 'kid', who: 'youngster', x: 8, y: 5, move: 'look',
      say: 'A Water Stone, a Thunder Stone or a Fire Stone... Which one should my Eevee touch? I can\'t decide!' }
  ]
}, DEPT));

G.Maps.def(Object.assign({
  id: 'dept-4f',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    '^+b+b+b++++^+p',
    '++++++++++++++',
    '+===+++++===++',
    '++++++++++++++',
    'p++++++++++++p',
    '++++++++++++++'
  ],
  warps: [{ x: 11, y: 2, to: 'dept-3f', spot: 'from-above' }, { x: 0, y: 2, to: 'dept-roof', spot: 'from-below' }],
  spots: { 'from-below': [11, 3, 'down'], 'from-above': [0, 3, 'down'] },
  npcs: [
    { id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'down', script: [
      ['say', 'Battle items for the serious Trainer!'],
      ['shop', ['x-attack', 'x-defense', 'x-speed', 'x-sp-atk', 'x-accuracy', 'guard-spec', 'dire-hit']]
    ] },
    { id: 'vit-clerk', who: 'clerk', x: 10, y: 3, dir: 'down', script: [
      ['say', 'Vitamins make your Pokémon stronger, a little at a time.'],
      ['shop', ['hp-up', 'protein', 'iron', 'calcium', 'carbos']]
    ] }
  ]
}, DEPT));

G.Maps.def(Object.assign({
  id: 'dept-roof', palette: 'lab', music: 'town',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    '^+++bbb++++++p',
    '++++++++++++++',
    '+p++++++++++p+',
    '++++++++++++++',
    'p++++++++++++p',
    '++++++++++++++'
  ],
  warps: [{ x: 0, y: 2, to: 'dept-4f', spot: 'from-above' }],
  spots: { 'from-below': [0, 3, 'down'] },
  signs: { '4,2': { script: 'dept.vending' }, '5,2': { script: 'dept.vending' }, '6,2': { script: 'dept.vending' } },
  npcs: [
    { id: 'girl', who: 'lass', x: 10, y: 4, dir: 'down', script: 'dept.roof-girl' },
    { id: 'man', who: 'gentleman', x: 4, y: 6, move: 'look', say: 'The view from up here is wonderful. On a clear day you can see all the way to Saffron City.' }
  ]
}, DEPT));

// ---------------- Celadon Mansion ----------------
G.Maps.def({
  id: 'mansion-1f', loc: 'celadon-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    'bb_t_____^_p',
    '____________',
    '__rr________',
    '____________',
    '____________',
    '_____X______'
  ],
  warps: [{ x: 5, y: 7, to: 'celadon', spot: 'mansion-door' }, { x: 9, y: 2, to: 'mansion-roof', spot: 'stairs' }],
  spots: { door: [5, 7, 'up'], stairs: [9, 3, 'down'] },
  npcs: [
    { id: 'woman', who: 'mom', x: 2, y: 5, dir: 'right', move: 'look',
      say: 'Welcome to Celadon Mansion! All these Pokémon live here with me. There is a little room on the roof, but I never go up there.' },
    { id: 'meowth', who: 'meowth', mon: 'meowth', x: 4, y: 3, dir: 'down', move: 'look', say: 'Meowth purrs and rubs against your leg.' },
    { id: 'clefairy', who: 'clefairy', mon: 'clefairy', x: 7, y: 5, dir: 'left', move: 'look', say: 'Clefairy hops happily in a circle.' }
  ]
});

G.Maps.def({
  id: 'mansion-roof', loc: 'celadon-city', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWW',
    'WWWWWWWWWW',
    '^___t____p',
    '__________',
    '___rr_____',
    '__________'
  ],
  warps: [{ x: 0, y: 2, to: 'mansion-1f', spot: 'stairs' }],
  spots: { stairs: [0, 3, 'down'] },
  items: [{ x: 4, y: 2, item: 'poke-ball', flag: 'eevee', script: 'celadon.eevee' }]
});

// ---------------- more of Celadon ----------------
G.Maps.def({
  id: 'celadon-restaurant', loc: 'celadon-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWW', 'WWWWWWWWWW', 'p____b___p', '_===______', '__________', '_t__t__t__', '____X_____'],
  warps: [{ x: 4, y: 6, to: 'celadon', spot: 'restaurant-door' }],
  spots: { door: [4, 6, 'up'] },
  npcs: [
    { id: 'chef', who: 'clerk', x: 2, y: 2, dir: 'down', say: 'Today\'s special: Berry stew! Sorry, the kitchen is closed for a private party.' },
    { id: 'gambler', who: 'gambler', x: 6, y: 4, dir: 'down', move: 'look',
      say: 'I lost every coin I had at the Game Corner... And now the machines are broken! Those men in black hang around it all day.' },
    { id: 'girl', who: 'beauty', x: 8, y: 5, dir: 'left', move: 'look', say: 'The food here is good, but I come for the gossip. Did you hear? Team Rocket might be hiding somewhere in this city!' }
  ]
});

G.Maps.def({
  id: 'celadon-house', loc: 'celadon-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWW', 'WWWWWWWW', 'bb__t__p', '________', '__rr____', '___X____'],
  warps: [{ x: 3, y: 5, to: 'celadon', spot: 'house-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [{ id: 'oldman', who: 'oldman', x: 5, y: 3, dir: 'down', move: 'look',
           say: 'Erika\'s Gym is south-west of here, behind a small tree. You need a Pokémon that knows Cut to get in.' }]
});

(() => {
  const T = s => G.T(s);
  // The girl on the roof gives a TM for each kind of drink.
  const DRINKS = [['fresh-water', 'tm16'], ['soda-pop', 'tm20'], ['lemonade', 'tm33']];

  async function roofGirl(h) {
    const F = G.Field;
    const left = DRINKS.filter(([d]) => !F.flag('roof-' + d));
    if (!left.length) { await h.say(T('Thank you for all the drinks! I am not thirsty anymore. Not even a little!')); return; }
    await h.say(T('I\'m so thirsty... It\'s really hot up here on the roof.'));
    const have = left.find(([d]) => F.count(d) > 0);
    if (!have) { await h.say(T('The vending machines sell drinks, but I spent all my money on stickers.')); return; }
    const [drink, tm] = have;
    const vars = { item: G.Names.item(drink) };
    if (await h.choice(T('Give her a {item}?'), { vars }) !== 0) return;
    F.takeItem(drink, 1);
    F.setFlag('roof-' + drink);
    await h.say(T('Yay, thank you! Here, take this. My big brother gave it to me, but I don\'t need it.'));
    F.giveItem(tm, 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item(tm) } });
    await j;
  }

  /** The Poké Ball on the table in the room on the roof: an Eevee. */
  async function eevee(h) {
    const F = G.Field;
    await h.say(T('A Poké Ball sits on the table. A note next to it says: For a Trainer who will love this Pokémon.'));
    if (await h.choice(T('Take the Poké Ball?'), {}) !== 0) return;
    F.markDone('mansion-roof:eevee');
    G.World.refresh();
    const got = F.giveMon('eevee', 25);
    F.setFlag('got-eevee');
    const j = h.jingle('item');
    await h.say(T('{player} received {mon}!'), { vars: { mon: G.Names.mon(got.sp) } });
    await j;
    if (!F.party().includes(got)) await h.say(T('{mon} was sent to the PC.'), { vars: { mon: G.Names.mon(got.sp) } });
    await h.nickname(got);
  }

  G.Script.def({
    'dept.roof-girl': [['js', roofGirl]],
    'dept.vending': [
      ['say', 'A vending machine. Cold drinks for thirsty Trainers!'],
      ['shop', ['fresh-water', 'soda-pop', 'lemonade']]
    ],
    'celadon.eevee': [['js', eevee]],
    'celadon.saffron-gate': [
      ['say', 'A guard blocks the gate: Saffron City is closed. Nobody gets through.'],
      ['say', 'Phew, it\'s hot... I\'d give anything for something to drink.', { name: 'Guard' }]
    ]
  });
})();
