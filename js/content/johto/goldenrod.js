/* ============ goldenrod.js — Goldenrod City and Whitney ============
 * Chapter 13, the end of the chapter. Johto's big city: a Pokémon Center, the Department Store
 * (three floors), the Radio Tower (only the lobby: staff only upstairs), the Bike Shop, the Flower
 * Shop, the Name Rater (a new nickname for a Pokémon you raised from the start), Bill's family
 * (Bill, home for a visit, gives you an Eevee: flag bill-eevee) and a house. The gate north to
 * Route 35 and the Magnet Train are closed for now.
 * Whitney's Gym (palette `pink`, hedges): two Lasses, two Beauties, then Whitney (Clefairy 16,
 * Miltank 17 with Rollout, Attract and Milk Drink). Beaten, she bursts into tears (flag whitney-cried) and
 * only gives the badge when you talk to her again: badge 11, the Plain Badge (Pokémon up to
 * Lv. 35 obey), TM45 Attract (flag whitney-beaten), and the chapter ends (`ending(13)`).
 */
G.Maps.def({
  id: 'goldenrod', loc: 'goldenrod-city', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTBBBBBBTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTT...........BBBBBB..............TTTTTT',
    'TTTTTTT...........BBBBBB......YYYYYYYYTTTTTT',
    'TTTTTTT...........BBDBBB......YYYYYYYYTTTTTT',
    'TTTTTTT.............,,........YYYYYYYYTTTTTT',
    'TTTTTTT.EEEEEEEE...S,,........YYYYYYYYTTTTTT',
    'TTTTTTT.EEEEEEEE....,,........YYYYYYYYTTTTTT',
    'TTTTTTT.EEEEEEEE....,,........YYYDYYYYTTTTTT',
    'TTTTTTT.EEEEEEEE....,,...........,....TTTTTT',
    'TTTTTTT.EEEDEEEE....,,...........,........TT',
    'TTTTTTT....,........,,...........,........TT',
    'TTTTTTT....,........,,..CCCCC....,..HHHH..TT',
    'TTTTTTT....,....ff..,,..CCCCC....,..HHHH..TT',
    'TTTTTTT....,....ff..,,..CCCCC....,..HDHH..TT',
    'TTTTTTT....,........,,..CCDCC....,...,....TT',
    'TT.........,........,,....,S.....,...,....TT',
    'TT.........,........,,....,......,...,....TT',
    'TT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TT',
    'TT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TT',
    'TT..................,,....................TT',
    'TT......ff..HHHH....,,...HHHH...HHHH...ff.TT',
    'TT..........HHHH....,,...HHHH...HHHH...ff.TT',
    'TT..........HDHH....,,...HDHH...HDHH......TT',
    'TT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TT',
    'TT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TT',
    'TT..................,,.......S............TT',
    'TT..GGGGGG..........,,........BBBBBB......TT',
    'TT..GGGGGG..HHHH....,,..ff....BBBBBB......TT',
    'TT..GGGGGG..HHHH....,,......ffBBBBBB......TT',
    'TT..GGGGGG..HDHH....,,........BBDBBB......TT',
    'TT..GGDGGG...,......,,..........,.........TT',
    'TT....,.S....,......,,S.........,.........TT',
    'TT....,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,......TT',
    'TTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'route34', offset: 10 } },
  warps: [
    { x: 20, y: 4, to: 'goldenrod', spot: 'gate-door', if: 'route35-open', locked: 'goldenrod.gate-closed' },
    { x: 33, y: 8, to: 'radio-tower-1f', spot: 'door' },
    { x: 11, y: 10, to: 'goldenrod-dept-1f', spot: 'door' },
    { x: 26, y: 15, to: 'goldenrod-center', spot: 'door' },
    { x: 37, y: 14, to: 'bill-family', spot: 'door' },
    { x: 13, y: 23, to: 'bike-shop', spot: 'door' },
    { x: 26, y: 23, to: 'flower-shop', spot: 'door' },
    { x: 33, y: 23, to: 'name-rater', spot: 'door' },
    { x: 6, y: 31, to: 'goldenrod-gym', spot: 'door' },
    { x: 13, y: 30, to: 'goldenrod-house', spot: 'door' },
    { x: 32, y: 30, to: 'goldenrod', spot: 'magnet-door', if: 'magnet-train', locked: 'goldenrod.magnet-closed' }
  ],
  spots: {
    'gate-door': [20, 5, 'down'], 'radio-door': [33, 9, 'down'], 'dept-door': [11, 11, 'down'], 'center-door': [26, 16, 'down'],
    'bill-door': [37, 15, 'down'], 'bike-door': [13, 24, 'down'], 'flower-door': [26, 24, 'down'], 'rater-door': [33, 24, 'down'],
    'gym-door': [6, 32, 'down'], 'house-door': [13, 31, 'down'], 'magnet-door': [32, 31, 'down']
  },
  signs: {
    '22,32': 'Goldenrod City. Johto\'s great city, busy and bright from morning to night.',
    '19,6': 'North: Route 35. The gate is closed while the road to the National Park is being repaired.',
    '8,32': 'Goldenrod City Pokémon Gym. Leader: Whitney, the cheerful queen of Normal types!',
    '27,16': 'The Goldenrod Department Store, the biggest shop in Johto, is on the west side of the city.',
    '29,26': 'Magnet Train Station. The fastest way to Kanto, once it runs again.'
  },
  npcs: [
    { id: 'kid', who: 'youngster', x: 24, y: 20, move: 'wander', r: 2,
      say: 'Whitney\'s Miltank knows Rollout. Once it starts rolling, it just keeps going, faster and faster!' },
    { id: 'beauty', who: 'beauty', x: 16, y: 26, move: 'look',
      say: 'The Radio Tower plays music all day long. My favourite is the lullaby they play at night.' },
    { id: 'man', who: 'gentleman', x: 39, y: 16, move: 'look',
      say: 'Did you know Bill, the man who made the PC storage system, grew up here? His family still lives in that house.' },
    { id: 'girl', who: 'lass', x: 9, y: 15, move: 'wander', r: 2,
      say: 'The Department Store has everything! I always end up buying far too much.' },
    { id: 'fan', who: 'pokefan', x: 36, y: 33, move: 'look',
      say: 'The Magnet Train runs to Saffron City in Kanto. Right now the power supply has a problem, so it is stopped.' }
  ]
});

G.Maps.center('goldenrod-center', {
  loc: 'goldenrod-city', exit: { map: 'goldenrod', spot: 'center-door' },
  npcs: [{ id: 'man', who: 'pokefan', x: 9, y: 5, move: 'look',
           say: 'With so many Trainers in Goldenrod, this Pokémon Center is busy all day.' }]
}).region = 'johto';

// ---------------- the Department Store ----------------
const GDEPT = { loc: 'goldenrod-city', region: 'johto', tileset: 'indoor', palette: 'mart', music: 'mart', battleBg: 'indoor' };
G.Maps.def(Object.assign({
  id: 'goldenrod-dept-1f',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', 'b+b+b++++++^+p', '++++++++++++++', '+===++++++++++', '++++++++++++++', 'p++++++++++++p', '++++++X+++++++'],
  warps: [{ x: 6, y: 7, to: 'goldenrod', spot: 'dept-door' }, { x: 11, y: 2, to: 'goldenrod-dept-2f', spot: 'from-below' }],
  spots: { door: [6, 7, 'up'], 'from-above': [11, 3, 'down'] },
  signs: { '0,2': 'Floor guide. 1F: Information. 2F: Trainer\'s Market. 3F: TMs, battle items and vitamins.' },
  npcs: [{ id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'down',
           say: 'Welcome to the Goldenrod Department Store! The stairs to the upper floors are on the right.' }]
}, GDEPT));

G.Maps.def(Object.assign({
  id: 'goldenrod-dept-2f',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '^+b+b+b++++^+p', '++++++++++++++', '+===+++++===++', '++++++++++++++', 'p++++++++++++p', '++++++++++++++'],
  warps: [{ x: 11, y: 2, to: 'goldenrod-dept-1f', spot: 'from-above' }, { x: 0, y: 2, to: 'goldenrod-dept-3f', spot: 'from-below' }],
  spots: { 'from-below': [11, 3, 'down'], 'from-above': [0, 3, 'down'] },
  npcs: [
    { id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'down', script: [
      ['say', 'Welcome to the Trainer\'s Market! Everything you need for the road.'],
      ['shop', ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'escape-rope', 'repel', 'super-repel']]
    ] },
    { id: 'clerk2', who: 'clerk', x: 10, y: 3, dir: 'down', script: [
      ['say', 'Here we have the strongest medicine in Johto.'],
      ['shop', ['hyper-potion', 'full-heal', 'revive', 'ether']]
    ] },
    { id: 'shopper', who: 'lass', x: 6, y: 6, move: 'wander', r: 2,
      say: 'I came to buy one Potion, and now my bag is full. How does that always happen?' }
  ]
}, GDEPT));

G.Maps.def(Object.assign({
  id: 'goldenrod-dept-3f',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '^+b+b+b++++b+p', '++++++++++++++', '+===+++++===++', '++++++++++++++', 'p++++++++++++p', '++++++++++++++'],
  warps: [{ x: 0, y: 2, to: 'goldenrod-dept-2f', spot: 'from-above' }],
  spots: { 'from-below': [0, 3, 'down'] },
  npcs: [
    { id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'down', script: [
      ['say', 'Technical Machines! One disc, and your Pokémon learns a new move.'],
      ['shop', ['tm10', 'tm11', 'tm16', 'tm17', 'tm18', 'tm20', 'tm33']]
    ] },
    { id: 'clerk2', who: 'clerk', x: 10, y: 3, dir: 'down', script: [
      ['say', 'Battle items and vitamins! Make your Pokémon stronger, for a battle or for good.'],
      ['shop', ['x-attack', 'x-defense', 'x-speed', 'x-accuracy', 'guard-spec', 'dire-hit', 'protein', 'iron', 'carbos', 'calcium', 'hp-up', 'zinc']]
    ] },
    { id: 'kid', who: 'youngster', x: 6, y: 6, move: 'look',
      say: 'A vitamin makes a Pokémon stronger for good. They are expensive, but they work!' }
  ]
}, GDEPT));

// ---------------- the Radio Tower and the houses ----------------
const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
const ghouse = (id, spot, o) => G.Maps.def(Object.assign({
  id, loc: 'goldenrod-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: HOUSE, warps: [{ x: 4, y: 7, to: 'goldenrod', spot }], spots: { door: [4, 7, 'up'] }
}, o));

G.Maps.def({
  id: 'radio-tower-1f', loc: 'radio-tower', region: 'johto', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', 'p+bb+++++++b+^', '++++++++++++++', '++++===+++++++', '++++++++++++++', 'p++++++++++++p', '++++++X+++++++'],
  warps: [{ x: 6, y: 7, to: 'goldenrod', spot: 'radio-door' }, { x: 13, y: 2, to: 'radio-tower-1f', spot: 'door', if: 'radio-upstairs', locked: 'radio.staff-only' }],
  spots: { door: [6, 7, 'up'] },
  npcs: [
    { id: 'clerk', who: 'clerk', x: 5, y: 3, dir: 'down',
      say: 'Welcome to the Radio Tower! I am sorry, but the floors upstairs are for staff only.' },
    { id: 'man', who: 'gentleman', x: 10, y: 5, move: 'look',
      say: 'Our shows reach every town in Johto. On a clear day, they can even hear us in Kanto!' },
    { id: 'girl', who: 'lass', x: 2, y: 5, move: 'look',
      say: 'I listen to the Pokémon Talk show every day. The host chats with Professor Oak!' }
  ]
});

ghouse('bike-shop', 'bike-door', {
  npcs: [
    { id: 'owner', who: 'gentleman', x: 7, y: 4, dir: 'left',
      say: 'Welcome to the Bike Shop! ...Oh, you already have a Bicycle from Kanto? Good choice. Take care of it, and it will take care of you.' },
    { id: 'kid', who: 'youngster', x: 2, y: 5, move: 'look',
      say: 'With a Bicycle you can ride all over Johto. I am saving up my pocket money for one!' }
  ]
});

ghouse('flower-shop', 'flower-door', {
  npcs: [
    { id: 'florist', who: 'lass', x: 7, y: 4, dir: 'left',
      say: 'Welcome! Our flowers come from every corner of Johto.' },
    { id: 'sister', who: 'beauty', x: 2, y: 5, dir: 'right',
      say: 'Have you heard about the strange tree west of Violet City? They say it wiggles when you water it. A tree that moves... how odd!' }
  ]
});

ghouse('name-rater', 'rater-door', {
  npcs: [{ id: 'rater', who: 'gentleman', x: 7, y: 4, dir: 'left', script: 'goldenrod.name-rater' }]
});

ghouse('bill-family', 'bill-door', {
  npcs: [
    { id: 'bill', who: 'bill', x: 7, y: 3, dir: 'down', if: '!bill-eevee', script: 'goldenrod.bill' },
    { id: 'bill2', who: 'bill', x: 7, y: 3, dir: 'down', if: 'bill-eevee',
      say: 'How is your Eevee doing? I hope you two are getting along.' },
    { id: 'mom', who: 'mom', x: 2, y: 5, dir: 'right',
      say: 'Bill came home for a few days. He spends the whole time talking to his PC... Some things never change.' }
  ]
});

ghouse('goldenrod-house', 'house-door', {
  npcs: [
    { id: 'fan', who: 'pokefan', x: 7, y: 4, dir: 'left',
      say: 'Pokémon left at the Day Care on Route 34 come back stronger. They grow a little with every step you take!' },
    { id: 'kid', who: 'lass', x: 2, y: 5, move: 'look',
      say: 'Whitney cried when she lost to my big brother. She is really strong, but she is a crybaby!' }
  ]
});

// ---------------- Whitney's Gym ----------------
G.Maps.def({
  id: 'goldenrod-gym', loc: 'goldenrod-city', region: 'johto', tileset: 'indoor', palette: 'pink', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    'p+++++++++++++p',
    '+++++++++++++++',
    '++kkkk+++kkkk++',
    '++k+++++++++k++',
    '++k+++++++++k++',
    '++k+kkkkkkk+k++',
    '++k++++k++++k++',
    '+++++++k+++++++',
    '++kkkk+k+kkkk++',
    '+++++++++++++++',
    '++++k+++++k++++',
    '++++k+++++k++++',
    '+++++++++++++++',
    '+++++++X+++++++'
  ],
  warps: [{ x: 7, y: 15, to: 'goldenrod', spot: 'gym-door' }],
  spots: { door: [7, 15, 'up'] },
  npcs: [
    { id: 'guide', who: 'guide', x: 9, y: 14, dir: 'left', script: 'goldenrod.gym-guide' },
    { id: 'lass', who: 'lass', x: 9, y: 3, dir: 'left', if: ['whitney-cried', '!whitney-beaten'],
      say: 'Oh, Whitney is crying again... She always cries when she loses. Talk to her once more, she will cheer up soon.' }
  ],
  trainers: [
    { id: 'victoria', who: 'beauty', cls: 'beauty', name: 'Victoria', x: 1, y: 8, dir: 'down', sight: 3,
      team: [['sentret', 11], ['sentret', 13], ['sentret', 15]],
      before: 'Whitney is so cute. Everyone wants to be like her! Me too!',
      defeat: 'Not cute enough...',
      after: 'Whitney\'s Miltank gives the best milk. It also hits the hardest.' },
    { id: 'samantha', who: 'beauty', cls: 'beauty', name: 'Samantha', x: 13, y: 8, dir: 'down', sight: 3,
      team: [['meowth', 15], ['meowth', 15]],
      before: 'My Meowth and I will scratch you up!',
      defeat: 'My Meowth lost its claws...',
      after: 'Normal types have no weaknesses... except for Fighting moves.' },
    { id: 'carrie', who: 'lass', cls: 'lass', name: 'Carrie', x: 6, y: 11, dir: 'down', sight: 3,
      team: [['snubbull', 16]],
      before: 'Snubbull may look tough, but it is really sweet. Unlike me in battle!',
      defeat: 'So mean...',
      after: 'When Miltank uses Attract, a Pokémon of the other gender falls for it and forgets to fight.' },
    { id: 'bridget', who: 'lass', cls: 'lass', name: 'Bridget', x: 8, y: 6, dir: 'down', sight: 2,
      team: [['jigglypuff', 14], ['jigglypuff', 14], ['jigglypuff', 14]],
      before: 'Three Jigglypuff, three times the fun!',
      defeat: 'They all fell asleep...',
      after: 'Whitney\'s Clefairy can use Encore. Then your Pokémon has to repeat the same move again and again.' },
    { id: 'whitney', who: 'whitney', cls: 'leader', name: 'Whitney', x: 7, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['clefairy', 16, ['double-slap', 'encore', 'metronome']], ['miltank', 17, ['rollout', 'attract', 'stomp', 'milk-drink']]],
      before: 'Hi! I am Whitney! Everybody was into Pokémon, so I got into them too. They are just so cute! You want to battle? Okay, but I am warning you, I am good!',
      defeat: 'No way... I lost...',
      win: 'goldenrod.whitney-win',
      afterScript: 'goldenrod.whitney' }
  ]
});

(() => {
  const T = s => G.T(s);
  const WHITNEY = { name: 'Whitney' }, BILL = { name: 'Bill' }, RATER = { name: 'Name Rater' };

  async function whitney(h) {
    const F = G.Field;
    if (F.flag('whitney-beaten')) {
      await h.say(T('I cried a little... okay, a lot. But I will get stronger, and next time I will win!'), WHITNEY);
      return;
    }
    await h.say(T('Sniff... I am sorry. I always cry when I lose. You won fair and square, so here you go.'), WHITNEY);
    F.badge(11);
    const j = h.jingle('badge');
    await h.say(T('{player} received the Plain Badge from Whitney!'));
    await j;
    await h.say(T('With the Plain Badge, Pokémon up to level 35 will listen to you.'), WHITNEY);
    await h.say(T('And take this too. It is TM45, Attract. If the other Pokémon is of the opposite gender, it may be too smitten to fight!'), WHITNEY);
    F.giveItem('tm45', 1);
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('tm45') } });
    F.setFlag('whitney-beaten');
    await h.say(T('I will train even harder now. And I will try not to cry so much... maybe.'), WHITNEY);
    // The end of the thirteenth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(13); else F.setFlag('chapter-13-done');
  }

  async function bill(h) {
    const F = G.Field;
    await h.say(T('{player}? Is that you? It is me, Bill! I am home in Goldenrod for a few days to see my family.'), BILL);
    await h.say(T('You helped me out back in Kanto, so let me return the favour. I have been looking after an Eevee, and I think it would love to travel with you.'), BILL);
    if (await h.choice(T('Will you take Eevee?'), BILL) !== 0) { await h.say(T('Okay. If you change your mind, I will be here.'), BILL); return; }
    const full = F.party().length >= 6;
    const mon = F.giveMon('eevee', 20);
    F.setFlag('bill-eevee');
    const j = h.jingle('item');
    await h.say(T('{player} received {mon}!'), { vars: { mon: G.Names.mon(mon.sp) } });
    await j;
    if (h.nickname && !full) await h.nickname(mon);
    if (full) await h.say(T('Your party is full, so I sent Eevee to your PC. My system at work!'), BILL);
    await h.say(T('Eevee can evolve in many different ways. A stone, the time of day, how much it loves you... I wonder which one yours will become?'), BILL);
  }

  async function nameRater(h) {
    const F = G.Field, S = F.save;
    await h.say(T('Hello, hello! I am the Name Rater. I judge the names of Pokémon.'), RATER);
    if (await h.choice(T('Shall I rate the name of one of your Pokémon?'), RATER) !== 0) { await h.say(T('Come back any time.'), RATER); return; }
    const pick = h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
    const i = await pick({ title: T('Rate which Pokémon?') });
    const mon = i == null ? null : F.party()[i];
    if (!mon) { await h.say(T('Come back any time.'), RATER); return; }
    const vars = { mon: G.Mon.name(mon) };
    if (!mon.ot || mon.ot.id !== S.player.id || mon.ot.name !== S.player.name) {
      await h.say(T('{mon}... A splendid name! Its first Trainer chose it with love. I would not dare change it.'), Object.assign({ vars }, RATER));
      return;
    }
    if (await h.choice(T('{mon}... A fine name, but it could be finer. Shall I give it a new one?'), Object.assign({ vars }, RATER)) !== 0) {
      await h.say(T('Come back any time.'), RATER);
      return;
    }
    const nick = G.NameUI ? await G.NameUI.ask({ kind: 'mon', mon }) : null;
    if (nick == null) { await h.say(T('Come back any time.'), RATER); return; }
    mon.nick = nick || null;
    await h.say(T('{mon} it is! Much better than before.'), Object.assign({ vars: { mon: G.Mon.name(mon) } }, RATER));
  }

  G.Script.def({
    'goldenrod.gate-closed': [['say', 'The gate is closed. A sign reads: "Road work on Route 35. Sorry for the trouble!"']],
    'goldenrod.magnet-closed': [['say', 'The station is closed. A note on the door reads: "The Magnet Train is not running. We are sorry!"']],
    'radio.staff-only': [['say', 'Staff only beyond this point.']],
    'goldenrod.gym-guide': [
      ['say', 'Yo, Champion! Whitney uses Normal types. Fighting moves hit them hard!'],
      ['say', 'Her Miltank\'s Rollout gets stronger every turn it keeps rolling. Switching Pokémon stops it, and so does a miss.'],
      ['say', 'With two Johto badges, Pokémon up to level 30 obey you. Win here, and it goes up to 35!']
    ],
    'goldenrod.whitney-win': [
      ['say', 'Waaaah! You meanie! I lost! Sob... sob...', { name: 'Whitney' }],
      ['setFlag', 'whitney-cried']
    ],
    'goldenrod.whitney': [['js', whitney]],
    'goldenrod.bill': [['js', bill]],
    'goldenrod.name-rater': [['js', nameRater]]
  });
})();
