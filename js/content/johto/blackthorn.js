/* ============ blackthorn.js — Blackthorn City, Clair, the Dragon's Den ============
 * Chapter 18, the end of the chapter. Blackthorn City, out of the Ice Path: a Center, a Mart,
 * the Move Deleter (any move, HMs too, as long as one is left), a house, and Clair's Gym. The
 * road south (Route 45) is closed. The Gym floor has chasms (`a`: you land back at the door)
 * crossed only where a boulder pushed with Strength fills a hole (`O`); three Cool Trainers, then
 * Clair (Gyarados, two Dragonair, Kingdra). She will not hand over the badge after losing (flag
 * clair-battled): the Elder of the dragon clan must test you first. The Dragon's Den is north of
 * the Gym, across the pond (Surf): two Cool Trainers, items, and the rival, who came to see where
 * Lance trained (flag den-rival). In the Dragon Shrine the Elder asks four questions (var
 * elder-quiz = how many answered from the heart), Clair comes in and gives badge 16, the Rising
 * Badge (every Pokémon obeys), and TM02 Dragon Claw (flag clair-beaten); the Elder gives a Dratini
 * (Lv. 15, Extreme Speed if every answer was right; flag got-dratini), and the chapter ends
 * (`ending(18)`). Chapter 19: the road south is open (Route 45, johto/route45.js).
 */
G.Maps.def({
  id: 'blackthorn', loc: 'blackthorn-city', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T########TTT############TTTTTTTTTTTT',
    'T########TTT#####O######TTTTTTTTTTTT',
    'T########TTT~~~~:::~~~~~TTTTTTTTTTTT',
    'T########TTT~~~~~~~~~~~~TTTTTTTTTTTT',
    'T########...~~~~~~~~~~~~..TTTTTTTTTT',
    'T####O###...~~~~~~~~~~~~..TTTTTTTTTT',
    'T....,,.....~~~~~~~~~~~~..TTTTTTTTTT',
    'T....,,..S.S~~~~~~~~~~~~...........T',
    'T....,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
    'T....,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
    'T........ff....GGGGGG.,,...........T',
    'T..............GGGGGG.,,.HHHH.HHHH.T',
    'T...CCCCC.MMMM.GGGGGG.,,.HHHH.HHHH.T',
    'T...CCCCC.MMMM.GGGGGG.,,.HDHH.HDHH.T',
    'T...CCCCC.MDMM.GGDGGG.,,,,,,,,,,...T',
    'T...CCDCC..,..S..,....,,,,,,,,,,...T',
    'T.....,,,,,,,,,,,,,,,,,,...........T',
    'T.....,,,,,,,,,,,,,,,,,,........ff.T',
    'T.....................,,..ff.......T',
    'TTTTT........ff.......,,...........T',
    'TTTTT.................,,......TTTTTT',
    'TTTTT.................,,......TTTTTT',
    'TTTTT.................,,......TTTTTT',
    'TTTTT.................,,S.....TTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { south: { map: 'route45', offset: 10 } },
  warps: [
    { x: 5, y: 6, to: 'ice-path-1f', spot: 'east' },
    { x: 17, y: 2, to: 'dragons-den', spot: 'entrance' },
    { x: 6, y: 16, to: 'blackthorn-center', spot: 'door' },
    { x: 11, y: 15, to: 'blackthorn-mart', spot: 'door' },
    { x: 17, y: 15, to: 'blackthorn-gym', spot: 'door' },
    { x: 26, y: 14, to: 'move-deleter-house', spot: 'door' },
    { x: 31, y: 14, to: 'blackthorn-house', spot: 'door' }
  ],
  spots: { 'icepath-door': [5, 7, 'down'], 'den-door': [17, 3, 'down'], 'center-door': [6, 17, 'down'], 'mart-door': [11, 16, 'down'],
           'gym-door': [17, 16, 'down'], 'deleter-door': [26, 15, 'down'], 'house-door': [31, 15, 'down'] },
  signs: {
    '9,8': 'Blackthorn City. A quiet town in the mountains, home of the dragon clan.',
    '11,8': 'North, across the water: the Dragon\'s Den. Sacred ground of the dragon clan. Do not disturb.',
    '14,16': 'Blackthorn City Pokémon Gym. Leader: Clair, the proud Dragon Trainer.',
    '24,24': 'South: Route 45, a steep road down the mountains to Route 46.'
  },
  npcs: [
    { id: 'oldman', who: 'oldman', x: 13, y: 9, move: 'look',
      say: 'Across the pond is the Dragon\'s Den. The Elder of the dragon clan keeps the shrine inside. Lance trained there as a boy.' },
    { id: 'girl', who: 'lass', x: 28, y: 18, move: 'wander', r: 2,
      say: 'Clair wears a cape just like her cousin Lance. Everyone in town knows they are family.' },
    { id: 'kid', who: 'youngster', x: 9, y: 20, move: 'look',
      say: 'You came through the Ice Path? Brr! The Pokémon Center is the place to warm up.' },
    { id: 'trainer', who: 'cooltrainerm', x: 19, y: 20, move: 'look', if: '!clair-beaten',
      say: 'Clair\'s dragons shrug off Fire, Water, Grass and Electric moves. Ice and Dragon moves are what hurt them.' },
    { id: 'trainer2', who: 'cooltrainerm', x: 19, y: 20, move: 'look', if: 'clair-beaten',
      say: 'You have all eight Johto badges? Then the Pokémon League is next. Victory Road waits for you!' }
  ]
});

G.Maps.center('blackthorn-center', {
  loc: 'blackthorn-city', exit: { map: 'blackthorn', spot: 'center-door' },
  npcs: [{ id: 'man', who: 'gentleman', x: 9, y: 5, move: 'look',
           say: 'The dragon clan has lived in Blackthorn for generations. Clair and Lance are its most famous Trainers.' }]
}).region = 'johto';

G.Maps.mart('blackthorn-mart', {
  loc: 'blackthorn-city', exit: { map: 'blackthorn', spot: 'mart-door' },
  stock: ['great-ball', 'ultra-ball', 'hyper-potion', 'max-potion', 'full-heal', 'revive', 'max-repel', 'x-attack', 'x-defense'],
  npcs: [{ id: 'shopper', who: 'hiker', x: 6, y: 5, move: 'look',
           say: 'Dragons are strong, but they hate the cold. I always carry Ice moves when I visit Blackthorn.' }]
}).region = 'johto';

G.Maps.def({
  id: 'move-deleter-house', loc: 'blackthorn-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'blackthorn', spot: 'deleter-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [{ id: 'deleter', who: 'gentleman', x: 7, y: 3, dir: 'down', script: 'blackthorn.deleter' }]
});

G.Maps.def({
  id: 'blackthorn-house', loc: 'blackthorn-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'blackthorn', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'granny', who: 'granny', x: 2, y: 4, dir: 'right',
      say: 'Clair\'s Gym is the last one in Johto. Trainers who win there go on to the Pokémon League.' },
    { id: 'boy', who: 'youngster', x: 8, y: 5, move: 'look',
      say: 'Lance is from Blackthorn, you know. He has a Dragonite! When I grow up I want one too.' }
  ]
});

G.Maps.def({
  id: 'blackthorn-gym', loc: 'blackthorn-city', region: 'johto', tileset: 'indoor', palette: 'dragon', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    'p+++++++++++++p',
    '+++++++++++++++',
    '+++++++++++++++',
    'aaaaaaaOaaaaaaa',
    '+++++++++++++++',
    '+++++++++++++++',
    '+++++++++++++++',
    'aaaaaaaaaaOaaaa',
    '+++++++++++++++',
    '+++++++++++++++',
    '+++++++++++++++',
    'aaaOaaaaaaaaaaa',
    '+++++++++++++++',
    '+++++++++++++++',
    '+++++++++++++++',
    '+++++++X+++++++'
  ],
  warps: [
    { x: 7, y: 17, to: 'blackthorn', spot: 'gym-door' },
    { x: 3, y: 13, to: 'blackthorn-gym', spot: 'door' },
    { x: 10, y: 9, to: 'blackthorn-gym', spot: 'door' },
    { x: 7, y: 5, to: 'blackthorn-gym', spot: 'door' }
  ],
  spots: { door: [7, 17, 'up'] },
  // Off the floor, into the chasm: back at the door.
  fall: { to: 'blackthorn-gym', spot: 'door' },
  // A boulder for each chasm: one straight up, one turned once, one pushed along the edge first.
  boulders: [{ id: 'low', x: 3, y: 15 }, { id: 'mid', x: 12, y: 10 }, { id: 'high', x: 4, y: 6 }],
  npcs: [{ id: 'guide', who: 'guide', x: 9, y: 17, dir: 'left', script: 'blackthorn.gym-guide' }],
  trainers: [
    { id: 'paul', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Paul', x: 12, y: 15, dir: 'left', sight: 4,
      team: [['dratini', 34], ['dratini', 34], ['dratini', 34]],
      before: 'Three Dratini, raised together. Can you handle all of them?',
      defeat: 'All three...',
      after: 'Dratini shed their skin as they grow. One day mine will be as big as Clair\'s.' },
    { id: 'lola', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Lola', x: 1, y: 11, dir: 'right', sight: 4,
      team: [['dratini', 35], ['dragonair', 37]],
      before: 'You pushed a boulder across the chasm? Not bad. But dragons do not need bridges!',
      defeat: 'My dragons came down to earth...',
      after: 'Clair trains harder than anyone in the clan. She cannot stand losing.' },
    { id: 'mike', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Mike', x: 13, y: 7, dir: 'left', sight: 4,
      team: [['dragonair', 37], ['seadra', 37]],
      before: 'Only one more chasm between you and Clair. I am the last wall!',
      defeat: 'The wall came down.',
      after: 'Clair will not go easy on you just because you made it this far.' },
    { id: 'clair', who: 'clair', cls: 'leader', name: 'Clair', x: 7, y: 2, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['gyarados', 37, ['bite', 'twister', 'ice-fang', 'leer']],
             ['dragonair', 37, ['thunder-wave', 'slam', 'surf', 'dragon-breath']],
             ['dragonair', 37, ['thunder-wave', 'slam', 'twister', 'agility']],
             ['kingdra', 40, ['smokescreen', 'surf', 'hyper-beam', 'dragon-breath']]],
      before: 'So you crossed the Ice Path and my chasms. I am Clair, and dragons answer to me. Not even the Elite Four take me lightly. Show me everything you have!',
      defeat: 'My dragons... beaten? That cannot be.',
      win: 'blackthorn.clair-win',
      afterScript: 'blackthorn.clair-after' }
  ]
});

G.Maps.def({
  id: 'dragons-den', loc: 'dragons-den', region: 'johto', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true,
  rows: [
    '##############################',
    '###O##########################',
    '#...................##.......#',
    '#............................#',
    '#............................#',
    '###...~~~~~~~~~~~~~~~~~~~~...#',
    '#.....~~~~~~~~~~~~~~~~~~~~...#',
    '#.....~~~~~~~~~~~~~~~~~~~~...#',
    '#.....~~~~~~~~~~~~~~~~~~~~...#',
    '#.....~~~~~~........~~~~~~...#',
    '#.....~~~~~~..HHHH..~~~~~~...#',
    '#.....~~~~~~..HHHH..~~~~~~...#',
    '#.....~~~~~~..HDHH..~~~~~~...#',
    '#.....~~~~~~........~~~~~~...#',
    '#.....~~~~~~........~~~~~~..##',
    '#.....~~~~~~........~~~~~~.#.#',
    '#.....~~~~~~~~~~~~~~~~~~~~...#',
    '#.....~~~~~~~~~~~~~~~~~~~~...#',
    '#.....~~~~~~~~~~~~~~~~~~~~...#',
    '#.....~~~~~~~~~~~~~~~~~~~~...#',
    '#............................#',
    '#.........##.................#',
    '##############################',
    '##############################'
  ],
  warps: [{ x: 3, y: 1, to: 'blackthorn', spot: 'den-door' }, { x: 15, y: 12, to: 'dragon-shrine', spot: 'door' }],
  spots: { entrance: [3, 2, 'down'], 'shrine-door': [15, 13, 'down'] },
  triggers: [{ x: 1, y: 2, w: 5, h: 3, if: ['clair-battled', '!den-rival'], script: 'den.rival' }],
  npcs: [{ id: 'rival', who: 'silver', x: 7, y: 3, dir: 'left', if: 'scripted' }],
  trainers: [
    { id: 'darin', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Darin', x: 4, y: 11, dir: 'left', sight: 3,
      team: [['dragonair', 37], ['dragonair', 38]],
      before: 'Outsiders in the Dragon\'s Den? You will have to get past me first.',
      defeat: 'So you are the one Clair sent...',
      after: 'Only those the clan trusts may cross to the shrine. Go on, then.' },
    { id: 'cara', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Cara', x: 27, y: 8, dir: 'left', sight: 3,
      team: [['horsea', 36], ['seadra', 38]],
      before: 'The water here is home to dragons. Mine grew up in it!',
      defeat: 'Swept away...',
      after: 'Wild Dratini live in this water. If you are lucky, you might hook one.' }
  ],
  items: [
    { x: 27, y: 20, item: 'dragon-scale', flag: 'dragons-den-dragonscale' },
    { x: 2, y: 20, item: 'max-elixir', flag: 'dragons-den-maxelixir' },
    { x: 13, y: 14, item: 'calcium', flag: 'dragons-den-calcium' }
  ],
  encounters: { water: '@dragons-den-area' }
});

G.Maps.def({
  id: 'dragon-shrine', loc: 'dragons-den', region: 'johto', tileset: 'indoor', palette: 'dragon', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'j+++++++++j', '+++++++++++', '++rrrrrrr++', '++rrrrrrr++', '+++++++++++', 'j+++++++++j', '+++++X+++++'],
  warps: [{ x: 5, y: 8, to: 'dragons-den', spot: 'shrine-door' }],
  spots: { door: [5, 8, 'up'] },
  npcs: [
    { id: 'elder', who: 'oldman', x: 5, y: 3, dir: 'down', script: 'shrine.elder' },
    { id: 'sage1', who: 'sage', x: 1, y: 5, dir: 'right',
      say: 'The Elder sees into the hearts of Trainers. Nothing is hidden from him.' },
    { id: 'sage2', who: 'sage', x: 9, y: 5, dir: 'left',
      say: 'Clair and Lance both learned here. Lance passed the Elder\'s test on his first try, they say.' },
    { id: 'clair', who: 'clair', x: 5, y: 7, dir: 'up', if: 'scripted' }
  ]
});

(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const CLAIR = { name: 'Clair' }, ELDER = { name: 'Elder' }, RIVAL2 = { name: '{rival2}' }, DELETER = { name: 'Move Deleter' };

  async function rival(h) {
    const F = G.Field, me = G.World.player;
    F.setFlag('den-rival');
    h.place('rival', me.x + 3, me.y, 'left');
    h.show('rival');
    await h.walkTo('rival', me.x + 1, me.y);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T('...You. So you made it to Blackthorn too.'), RIVAL2);
    await h.say(T('Lance trained in this cave. I came to see what made him so strong. All I found was an old man asking questions.'), RIVAL2);
    await h.say(T('He told me to come back when I understand my Pokémon. They battle, I win. What else is there to understand?'), RIVAL2);
    await h.say(T('...Forget it. Stay out of my way.'), RIVAL2);
    await h.walkTo('rival', me.x + 3, me.y);
    h.hide('rival');
  }

  /** The Elder's four questions: -> how many were answered from the heart. */
  async function quiz(h) {
    const Q = [
      [T('Your Pokémon fainted after a hard battle. What do you do first?'),
       [T('Rush it to a Pokémon Center'), T('Send out the next one'), T('Scold it for losing')], 0],
      [T('A Pokémon you just caught will not listen to you. What do you do?'),
       [T('Train it until it obeys'), T('Spend time with it until it trusts me'), T('Let it go')], 1],
      [T('What makes a Trainer truly strong?'),
       [T('Rare Pokémon'), T('Never losing'), T('Growing together with their Pokémon')], 2],
      [T('Is a weak Pokémon worth raising?'),
       [T('Every Pokémon can grow strong'), T('No, only the strong ones matter'), T('Only if it evolves')], 0]
    ];
    let good = 0;
    for (const [q, options, right] of Q) {
      const i = await h.choice(q, { options, name: ELDER.name });
      if (i === right) good++;
      await h.say(T('Hmm... I see.'), ELDER);
    }
    return good;
  }

  async function elder(h) {
    const F = G.Field;
    if (F.flag('clair-beaten')) { await h.say(T('May the dragons watch over you on the road to the Pokémon League.'), ELDER); return; }
    if (!F.flag('clair-battled')) {
      await h.say(T('Welcome to the Dragon Shrine. The dragon clan has trained here for generations.'), ELDER);
      await h.say(T('The shrine\'s test is only for those Clair sends to me. Go and face her first.'), ELDER);
      return;
    }
    await h.say(T('Ah, a Trainer Clair sent. She sends me everyone who beats her. She never could admit a defeat.'), ELDER);
    await h.say(T('I will ask you a few questions. There is no trick to them: answer as you truly feel.'), ELDER);
    const good = await quiz(h);
    F.setVar('elder-quiz', good);
    if (good === 4) await h.say(T('Every answer came from the heart. Your Pokémon are lucky to have you.'), ELDER);
    else await h.say(T('Some of your answers surprised me. But I can see that your Pokémon trust you, and that is what matters most.'), ELDER);
    await h.say(T('Clair! Come in. This Trainer has passed.'), ELDER);
    h.show('clair');
    await h.move('clair', G.Path4.parse('UU'), 4);
    h.face('player', 'clair'); h.face('clair', 'player');
    await h.say(T('...So the Elder approves of you. Fine. I keep my word.'), CLAIR);
    await h.say(T('I was wrong to keep the badge from you. Here: the Rising Badge.'), CLAIR);
    F.badge(16);
    const j = h.jingle('badge');
    await h.say(T('{player} received the Rising Badge from Clair!'));
    await j;
    await h.say(T('With the Rising Badge, Pokémon of every level will obey you.'), CLAIR);
    await h.say(T('And take this: TM02, Dragon Claw. It slashes with claws as sharp as a dragon\'s.'), CLAIR);
    F.giveItem('tm02', 1);
    const k = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('tm02') } });
    await k;
    F.setFlag('clair-beaten');
    await h.say(T('With eight badges you may enter the Pokémon League. Surf east from New Bark Town along Route 27, and Victory Road will lead you there.'), CLAIR);
    await h.say(T('Next time we battle, I will not lose. Remember that!'), CLAIR);
    await h.move('clair', G.Path4.parse('DD'), 4);
    h.hide('clair');
    h.face('player', 'elder');
    await dratini(h, good === 4);
    if (G.CreditsUI) await G.CreditsUI.ending(18); else F.setFlag('chapter-18-done');
  }

  /** The Elder's gift: a Dratini from the shrine, with Extreme Speed for a perfect test. */
  async function dratini(h, perfect) {
    const F = G.Field;
    await h.say(T('Before you go, take this Dratini. It hatched here at the shrine, and it should see the world with a Trainer like you.'), ELDER);
    const full = F.party().length >= 6;
    const moves = perfect ? ['wrap', 'thunder-wave', 'twister', 'extreme-speed'] : ['wrap', 'leer', 'thunder-wave', 'twister'];
    const mon = F.giveMon('dratini', 15, { moves });
    F.setFlag('got-dratini');
    const j = h.jingle('item');
    await h.say(T('{player} received {mon}!'), { vars: { mon: G.Names.mon(mon.sp) } });
    await j;
    if (full) await h.say(T('{mon} was sent to the PC.'), { vars: { mon: G.Names.mon(mon.sp) } });
    else if (h.nickname) await h.nickname(mon);
    if (perfect) await h.say(fmt('It knows {move}, a move no Dratini learns by itself. A gift for one who answered so well.', { move: G.Names.move('extreme-speed') }), ELDER);
  }

  /** The Move Deleter: any move, HM moves too, as long as the Pokémon keeps one. */
  async function deleter(h) {
    const F = G.Field;
    if (await h.choice(T('I am the Move Deleter. I can make a Pokémon forget a move, even one from an HM. Shall I?'), DELETER) !== 0) {
      await h.say(T('Come again if you need me.'), DELETER);
      return;
    }
    const pick = h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
    const i = await pick({ title: T('Forget a move: which Pokémon?') });
    const mon = i == null ? null : F.party()[i];
    if (!mon) { await h.say(T('Come again if you need me.'), DELETER); return; }
    const vars = { mon: G.Mon.name(mon) };
    if (mon.moves.length < 2) { await h.say(T('{mon} knows only one move. I cannot take it away.'), Object.assign({ vars }, DELETER)); return; }
    const names = mon.moves.map(m => G.Names.move(m.id));
    const k = await h.choice(T('Which move should it forget?'), { options: names.concat([T('Cancel')]), name: DELETER.name });
    if (k == null || k >= mon.moves.length) { await h.say(T('Come again if you need me.'), DELETER); return; }
    vars.move = names[k];
    if (await h.choice(T('Make {mon} forget {move}?'), Object.assign({ vars }, DELETER)) !== 0) { await h.say(T('Come again if you need me.'), DELETER); return; }
    mon.moves.splice(k, 1);
    await h.say(T('Done! {mon} forgot {move}.'), Object.assign({ vars }, DELETER));
    await h.say(T('Come again if you need me.'), DELETER);
  }

  G.Script.def({
    'blackthorn.gym-guide': [
      ['say', 'Yo, Champion! The last Johto Gym! Clair uses Dragon types. Ice and Dragon moves hit them hard.'],
      ['say', 'See the chasms? Push the boulders into the holes with Strength and walk across. Fall, and you start over from here!'],
      ['say', 'With seven Johto badges, Pokémon up to level 70 obey you. Win here, and they all will!']
    ],
    'blackthorn.clair-win': [
      ['say', 'Hmph. You won, I admit it. But my badge is not something I hand over for one battle.', { name: 'Clair' }],
      ['say', 'North of this Gym, across the water, is the Dragon\'s Den. The Elder of our clan lives in its shrine. If he says you are worthy, the badge is yours.', { name: 'Clair' }],
      ['setFlag', 'clair-battled']
    ],
    'blackthorn.clair-after': [
      ['if', 'clair-beaten',
        [['say', 'The Pokémon League is at the end of Victory Road. Surf east from New Bark Town along Route 27. Do not lose before you get there!', { name: 'Clair' }]],
        [['say', 'What are you waiting for? The Dragon\'s Den is north of the Gym, across the water. Go and face the Elder.', { name: 'Clair' }]]]
    ],
    'den.rival': [['js', rival]],
    'shrine.elder': [['js', elder]],
    'blackthorn.deleter': [['js', deleter]]
  });
})();
