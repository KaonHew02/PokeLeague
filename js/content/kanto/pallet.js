/* ============ pallet.js — Pallet Town, the player's house, the rival's house and Oak's lab ============
 * The story of the first minutes (the texts are our own, the events follow the games):
 *   1. A new game starts upstairs at home. Mom, downstairs, says the professor wants you.
 *   2. Stepping towards Route 1 without a Pokémon: Oak stops you and takes you to his lab.
 *   3. In the lab: three Poké Balls on the table. You choose one; the rival takes the one
 *      strong against it.
 *   4. Leaving the lab, the rival challenges you (you may lose); then he leaves and Oak
 *      heals your Pokémon.
 *   5. Mom heals your party whenever you talk to her afterwards.
 *   6. Back from Viridian City with Oak's Parcel: Oak gives the rival and you a Pokédex
 *      and you five Poké Balls; Daisy then gives you a Town Map.
 * Flags: oak-escort, lab-intro, got-starter, lab-rival-battle, rival-left-lab,
 * parcel-delivered, has-pokedex, got-town-map.
 */
G.Maps.def({
  id: 'pallet', loc: 'pallet-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTT,,TTTTTTTTT',
    'T........,,........T',
    'T..HHHH..,,..HHHH..T',
    'T..HHHH..,,..HHHH..T',
    'T..HDHH..,,..HDHH..T',
    'T.S.,....,,.S.,....T',
    'T...,,,,,,,,,,,....T',
    'T........,,........T',
    'T........,,........T',
    'T.ffff...,,.LLLLLL.T',
    'T.ffff...,,.LLLLLL.T',
    'T........,,.LLLLLL.T',
    'T.FFFF...,,.LLLDLL.T',
    'T........,,..S.,...T',
    'T....S...,,,,,,,...T',
    'T........,,........T',
    'T~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~T'
  ],
  connect: { north: { map: 'route1', offset: 0 }, south: { map: 'route21', offset: 0 } },
  encounters: { water: '@pallet-town-area' },
  warps: [
    { x: 4, y: 4, to: 'player-1f', spot: 'door' },
    { x: 14, y: 4, to: 'rival-house', spot: 'door' },
    { x: 15, y: 12, to: 'oak-lab', spot: 'door' }
  ],
  spots: {
    'player-door': [4, 5, 'down'],
    'rival-door': [14, 5, 'down'],
    'lab-door': [15, 13, 'down'],
    north: [9, 1, 'down']
  },
  signs: {
    '2,5': "{player}'s House",
    '12,5': "{rival}'s House",
    '13,13': 'Oak Pokémon Research Lab',
    '5,14': 'Pallet Town. A quiet little town where great journeys begin.'
  },
  npcs: [
    { id: 'oak', who: 'oak', x: 9, y: 8, dir: 'up', if: 'scripted' },
    { id: 'girl', who: 'lass', x: 6, y: 8, move: 'wander', r: 2,
      say: "I'm training Pokémon too! Once they're strong, they'll keep me safe." },
    { id: 'techie', who: 'oldman', x: 16, y: 7, move: 'look',
      say: 'With a PC you can keep Pokémon and items as data and call them back later. Technology is amazing!' }
  ],
  triggers: [
    { x: 9, y: 1, w: 2, h: 1, if: ['!got-starter'], script: 'pallet.oak-stops-you' }
  ]
});

G.Maps.def({
  id: 'player-1f', loc: 'pallet-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bb_p____^__',
    '___________',
    '____ttt____',
    '____ttt____',
    '___________',
    '___X_______'
  ],
  warps: [
    { x: 3, y: 7, to: 'pallet', spot: 'player-door' },
    { x: 8, y: 2, to: 'player-2f', spot: 'stairs' }
  ],
  spots: { door: [3, 7, 'up'], stairs: [8, 3, 'down'], mom: [7, 5, 'up'] },
  signs: {
    '0,2': 'Cookbooks and a pile of Pokémon magazines.',
    '1,2': 'Cookbooks and a pile of Pokémon magazines.'
  },
  npcs: [{ id: 'mom', who: 'mom', x: 7, y: 4, dir: 'left', script: 'pallet.mom' }]
});

G.Maps.def({
  id: 'player-2f', loc: 'pallet-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'P_b___^_',
    '________',
    '_rr_____',
    '_rr__t__',
    '________'
  ],
  warps: [{ x: 6, y: 2, to: 'player-1f', spot: 'stairs' }],
  spots: { start: [3, 4, 'down'], stairs: [6, 3, 'down'] },
  signs: {
    '2,2': 'Pokémon comics, every one of them read over and over.',
    '5,5': 'An adventure movie is playing on the TV. Time to go and start your own!'
  }
});

G.Maps.def({
  id: 'rival-house', loc: 'pallet-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
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
  warps: [{ x: 4, y: 7, to: 'pallet', spot: 'rival-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: {
    '0,2': 'Travel guides and town maps fill the shelves.',
    '1,2': 'Travel guides and town maps fill the shelves.',
    '2,2': 'Travel guides and town maps fill the shelves.',
    '9,2': 'Travel guides and town maps fill the shelves.',
    '10,2': 'Travel guides and town maps fill the shelves.'
  },
  npcs: [{ id: 'daisy', who: 'daisy', x: 7, y: 4, dir: 'left', script: 'pallet.daisy' }]
});

G.Maps.def({
  id: 'oak-lab', loc: 'pallet-town', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor', enter: 'lab.enter',
  rows: [
    'WWWWWWWWWWWWW',
    'WWWWWWWWWWWWW',
    'bbbP+++++pbbb',
    '+++++++++++++',
    '++++++++ttt++',
    '+++++++++++++',
    '+++++++++++++',
    'bbbb+++++bbbb',
    '+++++++++++++',
    '+++++++++++++',
    'p+++++++++++p',
    '++++++X++++++'
  ],
  warps: [{ x: 6, y: 11, to: 'pallet', spot: 'lab-door' }],
  spots: { door: [6, 11, 'up'], 'oak-intro': [7, 6, 'up'], heal: [7, 5, 'up'] },
  signs: {
    '0,2': 'The shelves are packed with Pokémon research papers.',
    '1,2': 'The shelves are packed with Pokémon research papers.',
    '2,2': 'The shelves are packed with Pokémon research papers.',
    '10,2': 'The shelves are packed with Pokémon research papers.',
    '11,2': 'The shelves are packed with Pokémon research papers.',
    '12,2': 'The shelves are packed with Pokémon research papers.',
    '0,7': 'Books about Pokémon from all over the world.',
    '1,7': 'Books about Pokémon from all over the world.',
    '2,7': 'Books about Pokémon from all over the world.',
    '3,7': 'Books about Pokémon from all over the world.',
    '9,7': 'Books about Pokémon from all over the world.',
    '10,7': 'Books about Pokémon from all over the world.',
    '11,7': 'Books about Pokémon from all over the world.',
    '12,7': 'Books about Pokémon from all over the world.'
  },
  npcs: [
    { id: 'oak', who: 'oak', x: 7, y: 4, dir: 'down', if: 'oak-escort', script: 'lab.oak' },
    { id: 'rival', who: 'rival', x: 5, y: 5, dir: 'right', if: '!rival-left-lab', script: 'lab.rival' },
    { id: 'aide', who: 'aide', x: 11, y: 9, dir: 'left', say: "I'm one of Professor Oak's aides. We study Pokémon from morning till night!" }
  ],
  items: [
    { x: 8, y: 4, item: 'poke-ball', flag: 'ball-bulbasaur', script: 'lab.ball-bulbasaur' },
    { x: 9, y: 4, item: 'poke-ball', flag: 'ball-charmander', script: 'lab.ball-charmander' },
    { x: 10, y: 4, item: 'poke-ball', flag: 'ball-squirtle', script: 'lab.ball-squirtle' }
  ],
  triggers: [
    { x: 0, y: 9, w: 13, h: 1, if: ['lab-intro', '!got-starter'], script: 'lab.not-yet' },
    { x: 0, y: 9, w: 13, h: 1, if: ['got-starter', '!lab-rival-battle'], script: 'lab.rival-battle' }
  ]
});

(() => {
  const T = s => G.T(s);
  const OAK = { name: 'Prof. Oak' }, RIVAL = { name: '{rival}' };
  const SLUG = { 1: 'bulbasaur', 4: 'charmander', 7: 'squirtle' };
  /** The rival takes the starter that is strong against yours. */
  const RIVAL_PICK = { 1: 4, 4: 7, 7: 1 };
  /** Where each starter's ball lies on Oak's table (row 4). */
  const BALL_X = { 1: 8, 4: 9, 7: 10 };
  const ballKey = sp => 'oak-lab:ball-' + SLUG[sp];

  /** A Poké Ball on Oak's table: look, choose, and the rival takes his. */
  function chooseBall(sp) {
    return async h => {
      const F = G.Field, S = F.save;
      const mon = G.Names.mon(sp);
      if (!F.flag('oak-escort')) { await h.say(T("Those are Prof. Oak's Pokémon. Better not touch them while he's out.")); return; }
      if (F.flag('got-starter')) { await h.say(T("Prof. Oak's last Pokémon is in this Poké Ball.")); return; }
      if (G.Audio.cry) G.Audio.cry(sp);
      const ask = { 1: T('So you want {mon}, the Grass Pokémon?'), 4: T('So you want {mon}, the Fire Pokémon?'), 7: T('So you want {mon}, the Water Pokémon?') }[sp];
      if (await h.choice(ask, Object.assign({ vars: { mon } }, OAK)) !== 0) return;
      await h.say(T('This Pokémon is full of energy. Take good care of it!'), OAK);
      F.markDone(ballKey(sp));
      G.World.refresh();
      const got = F.giveMon(sp, 5);
      const j = h.jingle('item');
      await h.say(T('{player} received {mon} from Prof. Oak!'), { vars: { mon } });
      await j;
      await h.nickname(got);
      F.setFlag('got-starter');
      // The rival's turn.
      const rsp = RIVAL_PICK[sp];
      S.rival.starter = rsp;
      S.dex.seen[rsp] = 1;
      await h.say(T("Then I'll take this one, Gramps!"), RIVAL);
      await h.walkTo('rival', BALL_X[rsp], 5);
      h.face('rival', 'up');
      F.markDone(ballKey(rsp));
      G.World.refresh();
      const j2 = h.jingle('item');
      await h.say(T('{rival} received {mon} from Prof. Oak!'), { vars: { mon: G.Names.mon(rsp) } });
      await j2;
      h.face('rival', 'player');
      await h.say(T('Heh. Mine looks way tougher than yours.'), RIVAL);
    };
  }

  /** Oak's Parcel: the Pokédex for both of you, then Poké Balls. */
  async function parcel(h) {
    const F = G.Field;
    await h.say(T("Oh, {player}! How is your Pokémon getting along?"), OAK);
    await h.say(T('Hm? A parcel for me, from the Viridian City Poké Mart? Thank you!'), OAK);
    F.takeItem('oaks-parcel', 1);
    F.setFlag('parcel-delivered');
    await h.say(T('Ah, the special Poké Ball I ordered! Splendid.'), OAK);
    h.sfx('door');
    h.place('rival', 6, 10, 'up');
    h.show('rival');
    await h.say(T('Gramps! You wanted to see me?'), RIVAL);
    await h.walkTo('rival', 6, 5);
    h.face('rival', 'up');
    await h.say(T('Ah, {rival}, perfect timing. I have a favour to ask of you both.'), OAK);
    await h.say(T('This is my newest invention: the Pokédex! It records every Pokémon you see or catch.'), OAK);
    await h.say(T('{player}, {rival}: take one each!'), OAK);
    F.setFlag('has-pokedex');
    const j = h.jingle('item');
    await h.say(T('{player} received the Pokédex!'));
    await j;
    await h.say(T("Meeting every kind of Pokémon in the world has been my dream for as long as I can remember. But I'm too old to travel far now."), OAK);
    await h.say(T("So I'm counting on you two. Fill those Pokédexes!"), OAK);
    await h.say(T("Leave it to me, Gramps! I'll find them all way before {player} does!"), RIVAL);
    await h.say(T("I'll borrow a Town Map from my sister. Don't bother asking her for one, {player}!"), RIVAL);
    await h.walkTo('rival', 6, 10);
    await h.move('rival', ['down'], 4);
    h.sfx('door');
    h.hide('rival');
    h.face('player', 'up');
    await h.say(T("You can't catch wild Pokémon without Poké Balls. Take these!"), OAK);
    F.giveItem('poke-ball', 5);
    const j2 = h.jingle('item');
    await h.say(T('{player} received {item} ×{n}!'), { vars: { item: G.Names.item('poke-ball'), n: 5 } });
    await j2;
    await h.say(T('Weaken a wild Pokémon first, then throw a Poké Ball. Good luck, {player}!'), OAK);
  }

  /** Leaving the lab with a Pokémon: the rival wants a battle. Losing is fine here. */
  async function rivalBattle(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    await h.say(T("Wait, {player}! Let's see whose Pokémon is stronger!"), RIVAL);
    h.face('player', 'up');
    await h.walkTo('rival', me.x, me.y - 1);
    h.face('rival', 'player');
    await h.say(T("Come on, I'll take you on!"), RIVAL);
    const out = await h.battle({ id: 'rival-lab', who: 'rival', name: S.rival.name, prize: 35, ai: 'basic',
                                 team: [[S.rival.starter || 7, 5]] }, { canLose: true });
    F.setFlag('lab-rival-battle');
    if (out === 'lose') await h.say(T('Ha! Did you see that? My Pokémon is the best!'), RIVAL);
    else await h.say(T('What? No way! I must have picked the wrong one!'), RIVAL);
    await h.say(T("Right, I'm off to make my Pokémon stronger. See you around, {player}!"), RIVAL);
    await h.walkTo('rival', 6, 10);
    await h.move('rival', ['down'], 4);
    h.sfx('door');
    h.hide('rival');
    F.setFlag('rival-left-lab');
    h.face('player', 'up');
    await h.say(T('Your Pokémon fought hard. Let me take care of it.'), OAK);
    h.heal();
    await h.jingle('heal');
    await h.say(T('There! Good as new.'), OAK);
  }

  G.Script.def({
    'pallet.oak-stops-you': [
      ['say', 'Hey! Hold it right there!', { name: 'Prof. Oak' }],
      ['face', 'player', 'down'],
      ['emote', 'player', '!'],
      ['place', 'oak', 9, 8, 'up'],
      ['show', 'oak'],
      ['js', h => { const me = G.World.player; return h.walkTo('oak', me.x, me.y + 1); }],
      ['face', 'oak', 'player'],
      ['face', 'player', 'oak'],
      ['say', 'Phew... Wild Pokémon live in the tall grass. Going in there without a Pokémon of your own is far too dangerous!', { name: 'Prof. Oak' }],
      ['say', 'Come with me to my lab.', { name: 'Prof. Oak' }],
      ['setFlag', 'oak-escort'],
      ['warp', 'oak-lab', 'oak-intro']
    ],
    'lab.enter': [
      ['if', ['oak-escort', '!lab-intro'], [
        ['say', "Gramps! I've been waiting forever!", { name: '{rival}' }],
        ['say', '{rival}? Ah, yes, I asked you to come by. Just a moment.', { name: 'Prof. Oak' }],
        ['say', '{player}, look at the table. There are three Pokémon in those Poké Balls.', { name: 'Prof. Oak' }],
        ['say', 'I used to be quite the Pokémon Trainer when I was young. Now these three are all I have left. You may have one. Go on, choose!', { name: 'Prof. Oak' }],
        ['say', 'Hey! Gramps! What about me?', { name: '{rival}' }],
        ['say', 'Be patient, {rival}. You may choose one too.', { name: 'Prof. Oak' }],
        ['setFlag', 'lab-intro']
      ]]
    ],
    'lab.parcel': [['js', parcel]],
    'lab.oak': [
      ['if', 'has:oaks-parcel', [['call', 'lab.parcel'], ['end']]],
      ['if', 'has-pokedex', [
        ['say', 'Fill that Pokédex, {player}! There are so many Pokémon waiting out there.', { name: 'Prof. Oak' }],
        ['end']
      ]],
      ['if', 'got-starter', [
        ['say', 'When a wild Pokémon jumps out, let your Pokémon battle it. Every win makes it stronger.', { name: 'Prof. Oak' }],
        ['say', 'Route 1, north of town, leads to Viridian City. Off you go!', { name: 'Prof. Oak' }]
      ], [
        ['say', 'Go on, {player}. Choose one of the three Poké Balls on the table.', { name: 'Prof. Oak' }]
      ]]
    ],
    'lab.rival': [
      ['if', 'oak-escort', [
        ['say', "Heh, go ahead and pick first. I'm generous like that.", { name: '{rival}' }]
      ], [
        ['say', "Yo, {player}! Gramps isn't here right now.", { name: '{rival}' }]
      ]]
    ],
    'lab.not-yet': [
      ['say', 'Wait, {player}! Where are you going? Choose a Pokémon first!', { name: 'Prof. Oak' }],
      ['move', 'player', 'U']
    ],
    'lab.rival-battle': [['js', rivalBattle]],
    'lab.ball-bulbasaur': [['js', chooseBall(1)]],
    'lab.ball-charmander': [['js', chooseBall(4)]],
    'lab.ball-squirtle': [['js', chooseBall(7)]],
    'pallet.mom': [
      ['if', 'got-starter', [
        ['say', '{player}! You and your Pokémon look tired. Have a little rest.', { name: 'Mom' }],
        ['heal'], ['lastHeal', 'mom'],
        ['jingle', 'heal'],
        ['say', "There! You're both full of energy again. Take care out there!", { name: 'Mom' }]
      ], [
        ['say', 'Good morning, {player}! Professor Oak stopped by earlier. He wants to see you at his lab.', { name: 'Mom' }],
        ['say', "It's the big building at the south end of town. Don't keep him waiting!", { name: 'Mom' }]
      ]]
    ],
    'pallet.daisy': [
      ['if', ['has-pokedex', '!got-town-map'], [
        ['say', "Grandpa asked you to help with his Pokédex? That's wonderful!", { name: 'Daisy' }],
        ['say', "Here, take this Town Map. It'll help you find your way.", { name: 'Daisy' }],
        ['giveItem', 'town-map', 1],
        ['setFlag', 'got-town-map'],
        ['end']
      ]],
      ['if', 'got-town-map', [
        ['say', "Good luck with Grandpa's research, {player}. Don't let my brother get too far ahead!", { name: 'Daisy' }],
        ['end']
      ]],
      ['if', 'got-starter', [
        ['say', '{rival} came home just to show off his new Pokémon. He can be so full of himself!', { name: 'Daisy' }]
      ], [
        ['say', "Hi, {player}! {rival} ran off to Grandpa's lab. Something about getting a Pokémon today.", { name: 'Daisy' }]
      ]]
    ]
  });
})();
