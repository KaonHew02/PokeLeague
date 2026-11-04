/* ============ pastoria.js — Pastoria City, Crasher Wake's Gym and the Great Marsh ============
 * Chapter 49, the end of the chapter. Pastoria City: a Pokémon Center, a Mart, a house, the Croagunk statue and the
 * Gym; Route 212 to the west is flooded. Crasher Wake uses Water types (Gyarados, Quagsire, Floatzel); his pool is
 * crossed on walkways, and Trainers stand beside them, so nobody can be walked around. He gives the Fen Badge (badge
 * 28, the fifth Sinnoh badge: Pokémon up to Lv. 50 obey in Sinnoh) and TM55 (Brine). Then Barry tells you of a man
 * at the Great Marsh gate: a grunt sets off a test bomb and runs (flag marsh-bomb) to Valor Lakefront (lakefront.js,
 * flag lakefront-grunt). Back in town Barry battles you, his team set by his starter, then `ending(49)`.
 * The Great Marsh is a Safari Zone (`safari: true`, `safariScripts: 'marsh'`; G.BattleUI.safari): ₽500 for 30 Safari
 * Balls and 500 steps, three areas. PokeAPI's tables add up to 260%, which would leave the rare Pokémon out, so the
 * areas have their own: Platinum's regulars and, 3% each, the Pokémon the game rotates day by day.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const WAKE = { name: 'Crasher Wake' };
  const BARRY = { name: 'Barry' };
  const GRUNT = { name: 'Team Galactic Grunt' };
  const ATTENDANT = { name: 'Great Marsh attendant' };

  // ---------------- Pastoria City ----------------
  G.Maps.def(Object.assign({
    id: 'pastoria', loc: 'pastoria-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..............BBBBBB................T',
      'T..............BBBBBB......ffffffff..T',
      'T..............BBBBBB......ffffffff..T',
      'T..............BBDBBB......ffffffff..T',
      'T................,.........ffffffff..T',
      'T................,.S.................T',
      'T................,..GGGGGG...........T',
      'T...CCCCC........,..GGGGGG...........T',
      'T...CCCCC..MMMM..,..GGGGGG...........T',
      'T...CCCCC..MMMM..,..GGGGGG...........T',
      'T...CCDCC..MDMM..,..GGDGGG...........T',
      'T.....,.....,....,....,......S.......T',
      'T.....,..S..,....,....,..............T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T...............,....................T',
      'T...............,.......~~~~~~~~~~~~~T',
      'T.....HHHH......,.......~~~~~~~~~~~~~T',
      'T.....HHHH......,.......~~~~~~~~~~~~~T',
      'T.....HDHH......,.......~~~~~~~~~~~~~T',
      'T......,,,,,,,,,,.......~~~~~~~~~~~~~T',
      'T.......................~~~~~~~~~~~~~T',
      'T.......................~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route213', offset: 8 } },
    warps: [
      { x: 6, y: 11, to: 'pastoria-center', spot: 'door' },
      { x: 12, y: 11, to: 'pastoria-mart', spot: 'door' },
      { x: 22, y: 11, to: 'pastoria-gym', spot: 'door' },
      { x: 17, y: 4, to: 'marsh-gate', spot: 'door' },
      { x: 7, y: 20, to: 'pastoria-house', spot: 'door' }
    ],
    spots: { 'center-door': [6, 12, 'down'], 'mart-door': [12, 12, 'down'], 'gym-door': [22, 12, 'down'], 'gate-door': [17, 5, 'down'], 'house-door': [7, 21, 'down'] },
    signs: {
      '9,13': 'Pastoria City. Home of the Great Marsh, where the mud runs deep.',
      '29,12': 'A big statue of Croagunk. People here say it brings good luck.',
      '19,6': 'The Great Marsh. A Safari Game at the gate: ₽500 for 30 Safari Balls and 500 steps.'
    },
    npcs: [
      // Route 212 opens in a later chapter.
      { id: 'west', who: 'gentleman', x: 1, y: 14, dir: 'right',
        say: 'Route 212 is flooded after all this rain. Better wait until the water goes down.' },
      { id: 'barry', who: 'barry', x: 22, y: 13, dir: 'up', if: ['badge:28', '!marsh-bomb'], script: 'pastoria.barry-bomb' },
      { id: 'grunt', who: 'galactic', x: 17, y: 5, dir: 'down', if: ['badge:28', '!marsh-bomb'], script: 'pastoria.bomb' },
      { id: 'barry2', who: 'barry', x: 30, y: 14, dir: 'left', if: ['lakefront-grunt', '!barry-pastoria'], script: 'pastoria.barry' },
      { id: 'wake', who: 'wake', x: 17, y: 9, dir: 'up', if: 'scripted' },
      { id: 'girl', who: 'lass', x: 27, y: 15, move: 'look',
        say: 'Crasher Wake loves this town. He wrestles in the mud with the children every morning!' },
      { id: 'man', who: 'fisherman', x: 12, y: 22, move: 'wander', r: 2,
        say: 'Nothing beats a walk in the marsh. You lose a boot now and then, that is all.' }
    ]
  }, SINNOH));

  G.Maps.center('pastoria-center', {
    loc: 'pastoria-city', exit: { map: 'pastoria', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'Electric moves are great against Water types, but they cannot touch a Pokémon that is part Ground!' }]
  }).region = 'sinnoh';

  G.Maps.mart('pastoria-mart', {
    loc: 'pastoria-city', exit: { map: 'pastoria', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'revive', 'antidote', 'paralyze-heal', 'awakening',
            'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel', 'max-repel'],
    npcs: [{ id: 'shopper', who: 'sailor', x: 6, y: 5, move: 'look',
             say: 'Stock up before the marsh. You cannot use your own items in a Safari Game, though!' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'pastoria-house', loc: 'pastoria-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'pastoria', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
             say: 'Different Pokémon show up in the marsh every day. Nobody has ever seen all of them in one visit.' }]
  }, SINNOH));

  // ---------------- Crasher Wake's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'pastoria-gym', loc: 'pastoria-city', tileset: 'indoor', palette: 'pool', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW', 'p+++++++++++++p', '+++++++++++++++', '+++++++++++++++', '~+~~~~~~+~~~~~~', '~+++++++++++++~', '~~~~~+~~~~~~~+~',
           '~+++++++++++++~', '~+~~~~~~+~+~~~~', '~+++++++++++++~', '~~~~+~~~~~+~~+~', '+++++++++++++++', '+++++++X+++++++'],
    warps: [{ x: 7, y: 13, to: 'pastoria', spot: 'gym-door' }],
    spots: { door: [7, 13, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 9, y: 13, dir: 'left', script: 'pastoria.gym-guide' }],
    trainers: [
      { id: 'jacky', who: 'youngster', cls: 'tuber', name: 'Jacky', x: 10, y: 11, dir: 'down', sight: 2, team: [['bibarel', 32]],
        before: 'My Bibarel paddles faster than I do. Splash!',
        defeat: 'I got water up my nose!',
        after: 'The walkways go back and forth. Keep going and you will reach Wake.' },
      { id: 'damian', who: 'sailor', cls: 'sailor', name: 'Damian', x: 8, y: 9, dir: 'down', sight: 1, team: [['wingull', 31], ['pelipper', 31]],
        before: 'Ahoy! No one crosses this pool without a battle!',
        defeat: 'Man overboard!',
        after: 'Flying types help you stay out of the water, but Electric moves hit them hard.' },
      { id: 'caitlyn', who: 'lass', cls: 'tuber-f', name: 'Caitlyn', x: 4, y: 11, dir: 'up', sight: 1, team: [['azurill', 27], ['marill', 29], ['azumarill', 31]],
        before: 'All three of us are from the same family. Look!',
        defeat: 'We all lost together...',
        after: 'Azumarill looks soft, but it hits really hard.' },
      { id: 'samson', who: 'sailor', cls: 'sailor', name: 'Samson', x: 5, y: 7, dir: 'down', sight: 1, team: [['wingull', 29], ['shellos', 30], ['golduck', 31]],
        before: 'I sailed all seven seas to train with Crasher Wake!',
        defeat: 'Back to port, then.',
        after: 'Wake never stops smiling, even under that mask.' },
      { id: 'erick', who: 'fisherman', cls: 'fisherman', name: 'Erick', x: 10, y: 9, dir: 'up', sight: 1, team: [['goldeen', 28], ['seaking', 31], ['gyarados', 31]],
        before: 'Fishing in a Gym pool? Wake says it is fine!',
        defeat: 'The big one got away.',
        after: 'Gyarados is part Flying. Ground moves will not reach it.' },
      { id: 'walter', who: 'fisherman', cls: 'fisherman', name: 'Walter', x: 8, y: 5, dir: 'down', sight: 1, team: [['whiscash', 33]],
        before: 'Wake is just past me. My Whiscash will not let you by!',
        defeat: 'Go on. He is waiting for you.',
        after: 'Whiscash is part Ground, like Wake\'s Quagsire. Grass moves are what you want.' },
      { id: 'wake', who: 'wake', cls: 'leader', name: 'Crasher Wake', x: 7, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 2 },
        team: [['gyarados', 31, ['waterfall', 'brine', 'bite', 'twister']],
               ['quagsire', 32, ['mud-shot', 'rock-tomb', 'water-pulse', 'yawn']],
               ['floatzel', 34, ['brine', 'ice-fang', 'crunch', 'aqua-jet'], 'sitrus-berry']],
        before: 'Ha ha! Welcome! I am Crasher Wake, the masked Leader of the Pastoria Gym! Even a Champion of three regions gets soaked by my waves. Here I come!',
        defeat: 'What a wave! You rode it all the way to the shore!',
        win: 'pastoria.wake-win',
        afterScript: [['say', 'The next Gym is in Canalave City, far to the west past Jubilife. Its Leader, Byron, knows everything about Steel!', WAKE]] }
    ]
  }, SINNOH));

  // ---------------- The Great Marsh ----------------
  G.Maps.def(Object.assign({
    id: 'marsh-gate', loc: 'great-marsh', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWW', 'WWWWWeWWWW', 'p++++++++p', '++++++++++', '++++++++++', '++++X+++++'],
    warps: [
      { x: 4, y: 5, to: 'pastoria', spot: 'gate-door' },
      // Into the marsh: only with a Safari Game (the attendant sells one).
      { x: 5, y: 1, to: 'great-marsh-1', spot: 'gate', if: 'safari-on', locked: 'marsh.attendant' }
    ],
    spots: { door: [4, 5, 'up'], inside: [5, 2, 'down'] },
    enter: 'marsh.gate-enter',
    npcs: [
      { id: 'attendant', who: 'clerk', x: 3, y: 3, dir: 'down', script: 'marsh.attendant' },
      { id: 'boy', who: 'camper', x: 8, y: 4, dir: 'left', move: 'look',
        say: 'The Pokémon deep in the marsh are the hardest to find. Save your steps for the far side!' }
    ]
  }, SINNOH));

  const DAILY = ['paras', 'exeggcute', 'kangaskhan', 'shroomish', 'gulpin', 'kecleon', 'tropius', 'skorupi', 'drapion', 'croagunk', 'toxicroak', 'carnivine'];
  /** An area's table: its regulars (adding up to 64%) and the daily Pokémon, 3% each. */
  const table = (lvl, regulars) => ({ rate: 35, mons: regulars.map(([sp, pct]) => [sp, lvl, lvl + 2, pct]).concat(DAILY.map(sp => [sp, lvl, lvl + 2, 3])) });
  const MARSH = { loc: 'great-marsh', tileset: 'outdoor', palette: 'forest', music: 'route', battleBg: 'grass', border: 'T', region: 'sinnoh',
                  safari: true, safariScripts: 'marsh' };

  G.Maps.def(Object.assign({
    id: 'great-marsh-1',
    rows: [
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT',
      'T.............,,.............T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.............,,.............T',
      'T.............,,.............T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,S."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.............,,.............T',
      'T..~~~~~~~~..HHHH..~~~~~~~~..T',
      'T..~~~~~~~~..HHHH..~~~~~~~~..T',
      'T..~~~~~~~~..HDHH..~~~~~~~~..T',
      'T............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'great-marsh-2', offset: 0 } },
    warps: [{ x: 14, y: 21, to: 'marsh-gate', spot: 'inside' }],
    spots: { gate: [14, 22, 'down'] },
    signs: { '16,16': 'The Great Marsh. Throw Bait to calm a Pokémon, or a Rock to rile it up!' },
    encounters: { walk: table(28, [['wooper', 26], ['bibarel', 16], ['quagsire', 12], ['tangela', 5], ['yanma', 5]]) }
  }, MARSH));

  G.Maps.def(Object.assign({
    id: 'great-marsh-2',
    rows: [
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT',
      'T.............,,.............T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.............,,.............T',
      'T.....~~~~~~~~==~~~~~~~~.....T',
      'T.....~~~~~~~~==~~~~~~~~.....T',
      'T.....~~~~~~~~==~~~~~~~~.....T',
      'T.....~~~~~~~~==~~~~~~~~.....T',
      'T.....~~~~~~~~==~~~~~~~~.....T',
      'T.....~~~~~~~~==~~~~~~~~.....T',
      'T.............,,.............T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.............,,.............T',
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'great-marsh-1', offset: 0 }, north: { map: 'great-marsh-3', offset: 0 } },
    encounters: { walk: table(27, [['wooper', 20], ['bibarel', 16], ['tangela', 16], ['quagsire', 12]]) }
  }, MARSH));

  G.Maps.def(Object.assign({
    id: 'great-marsh-3',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T............................T',
      'T."""""""""""""""""""""""""".T',
      'T."""""""""~~~~~~~~""""""""".T',
      'T."""""""""~~~~~~~~""""""""".T',
      'T."""""""""~~~~~~~~""""""""".T',
      'T."""""""""~~~~~~~~""""""""".T',
      'T."""""""""""""""""""""""""".T',
      'T."""""""""""""""""""""""""".T',
      'T.............,,.............T',
      'T.............,,.............T',
      'T.............,,.............T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.............,,.............T',
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'great-marsh-2', offset: 0 } },
    items: [{ x: 26, y: 20, item: 'max-revive', flag: 'marsh-revive' }],
    encounters: { walk: table(26, [['wooper', 20], ['yanma', 16], ['bibarel', 16], ['quagsire', 12]]) }
  }, MARSH));

  /** The test bomb: the grunt sets it off, Wake comes running, the grunt runs. */
  async function bomb(h) {
    const F = G.Field, me = G.World.player;
    await h.say(T('Huh? A kid? Beat it! This is Team Galactic business.'), GRUNT);
    await h.say(T('Well, since you are here, watch this. Our new Galactic Bomb needs a field test!'), GRUNT);
    await h.fade('out', 0.15);
    await h.fade('in', 0.15);
    await h.say(T('A dull boom rolled across the marsh, and the ground shook!'));
    await h.say(T('Ha ha! That was a small one. Imagine what a big one could do to a lake!'), GRUNT);
    if (me) h.place('wake', me.x, me.y + 3, 'up');
    h.show('wake');
    if (me) { await h.walkTo('wake', me.x, me.y + 1); h.face('wake', 'up'); h.face('player', 'down'); }
    await h.say(T('What was that noise? You there! Hold it right there!'), WAKE);
    await h.say(T('Crasher Wake?! I am out of here!'), GRUNT);
    await h.fade('out', 0.3);
    F.setFlag('marsh-bomb');
    await h.fade('in', 0.3);
    await h.say(T('He ran east, toward Route 213 and the lakefront! I will check on the marsh. You go after him!'), WAKE);
    h.hide('wake');
  }

  /** Barry, once the grunt is beaten: his team depends on the starter he took. */
  const BARRY_TEAMS = {
    387: [['staravia', 34], ['buizel', 32], ['ponyta', 32], ['grotle', 36]],
    390: [['staravia', 34], ['buizel', 32], ['roselia', 32], ['monferno', 36]],
    393: [['staravia', 34], ['roselia', 32], ['ponyta', 32], ['prinplup', 36]]
  };
  async function barry(h) {
    const F = G.Field;
    await h.say(T('There you are, {player}! Wake told me you ran that guy off. Not bad!'), BARRY);
    await h.say(T('But I spent all day training in the marsh mud. Time to find out who is stronger!'), BARRY);
    const out = await h.battle({ id: 'barry-pastoria', who: 'barry', name: 'Barry', prize: 70, ai: 'leader',
      team: BARRY_TEAMS[F.getVar('barry-starter')] || BARRY_TEAMS[390] });
    if (out !== 'win') return;
    await h.say(T('Argh! Again?! Okay, okay. I will just have to get even stronger!'), BARRY);
    await h.say(T('Next time I will not lose! And I am going to catch something amazing, too. See you!'), BARRY);
    F.setFlag('barry-pastoria');
    // The end of the forty-ninth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(49); else F.setFlag('chapter-49-done');
  }

  G.Script.def({
    'pastoria.gym-guide': [
      ['say', 'Hey, Champion! Crasher Wake uses Water-type Pokémon.'],
      ['say', 'Electric moves hit Gyarados four times as hard, but they do nothing to his Quagsire, which is part Ground. Grass moves hit Quagsire four times as hard!'],
      ['say', 'His Floatzel is fast, and it holds a Sitrus Berry. Up to level 40, your Pokémon from home will listen to you here.']
    ],
    'pastoria.wake-win': [
      ['say', 'Take the Fen Badge! You earned every drop of it.', WAKE],
      ['badge', 28],
      ['jingle', 'badge'],
      ['say', '{player} received the Fen Badge from Crasher Wake!'],
      ['say', 'With it, Pokémon up to level 50 will obey you here in Sinnoh, even ones from other regions.', WAKE],
      ['say', 'And this is TM55, Brine. It hits twice as hard when the foe is down to half its HP or less!', WAKE],
      ['giveItem', 'tm55', 1]
    ],
    'pastoria.barry-bomb': [
      ['say', 'Hey, {player}! You beat Wake too? Nice, but listen!', BARRY],
      ['say', 'There is a guy in a space suit outside the Great Marsh gate, and he keeps talking about a bomb! That has to be Team Galactic!', BARRY],
      ['say', 'Go and check it out! I will keep people away from the marsh!', BARRY]
    ],
    'pastoria.bomb': [['js', bomb]],
    'pastoria.barry': [['js', barry]],
    'marsh.attendant': [
      ['say', 'Welcome to the Great Marsh!', ATTENDANT],
      ['choice', 'For ₽500 you get 30 Safari Balls and 500 steps to catch whatever you can. Would you like to go in?', [
        ['if', 'money>=500', [
          ['money', -500],
          ['setFlag', 'safari-on'],
          ['setVar', 'safari-steps', 500],
          ['giveItem', 'safari-ball', 30],
          ['say', 'We will call you when your steps or your Safari Balls run out. Mind the mud!', ATTENDANT],
          ['warp', 'great-marsh-1', 'gate']
        ], [
          ['say', 'Oh dear, you do not have enough money. Please come again!', ATTENDANT]
        ]]
      ], [
        ['say', 'Please come again!', ATTENDANT]
      ], ATTENDANT]
    ],
    'marsh.gate-enter': [
      ['if', 'safari-on', [
        ['call', 'safari.end'],
        ['say', 'Your Safari Game is over. Did you catch anything good? Please come again!', ATTENDANT]
      ]]
    ],
    'marsh.timeup': [
      ['say', 'Ding-dong! Your time is up!'],
      ['call', 'safari.end'],
      ['warp', 'marsh-gate', 'inside'],
      ['say', 'Your Safari Game is over. Did you catch anything good? Please come again!', ATTENDANT]
    ],
    'marsh.out-of-balls': [
      ['say', 'Ding-dong! You have no Safari Balls left!'],
      ['call', 'safari.end'],
      ['warp', 'marsh-gate', 'inside'],
      ['say', 'Your Safari Game is over. Did you catch anything good? Please come again!', ATTENDANT]
    ]
  });
})();
