/* ============ woods.js — Route 104, Petalburg Woods ============
 * Chapter 29. Route 104 leaves Petalburg City to the west: a beach, Mr. Briney's cottage (he has
 * given up the sea and lives with his Wingull, Peeko) and Trainers, then north into Petalburg
 * Woods. In the woods a Team Aqua grunt corners a researcher from the Devon Corporation for his
 * papers, in the narrow way north: you battle the grunt (Poochyena), who runs off, and the
 * researcher gives you a Great Ball (flag woods-aqua). A girl gives a Miracle Seed. North of the
 * woods, Route 104 crosses a river by a bridge, past the Pretty Petal flower shop (two Oran
 * Berries), to Rustboro City (rustboro.js). Emerald's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const GRUNT = { name: 'Team Aqua Grunt' }, RESEARCHER = { name: 'Devon Researcher' };
  const HOENN = { region: 'hoenn' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 104, the south ----------------
  G.Maps.def(Object.assign({
    id: 'route104', loc: 'hoenn-route-104', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTT,,TTTTTTTTTTTT',
      '~~~~~~~~~:::....,,...........T',
      '~~~~~~~~~:::....,,...........T',
      '~~~~~~~~~:::....,,.."""""""..T',
      '~~~~~~~~~:::....,,.."""""""..T',
      '~~~~~~~~~:::....,,.."""""""..T',
      '~~~~~~~~~:::....,,.."""""""..T',
      '~~~~~~~~~:::....,,.."""""""..T',
      '~~~~~~~~~:::....,,...........T',
      '~~~~~~~~~:::....,,....TTT....T',
      '~~~~~~~~~:::....,,....TTT....T',
      '~~~~~~~~~:::....,,....TTT....T',
      '~~~~~~~~~:::"""",,...........T',
      '~~~~~~~~~:::"""",,...........T',
      '~~~~~~~~~:::"""",,...........T',
      '~~~~~~~~~:::"""",,.."""""""".T',
      '~~~~~~~~~:::"""",,.."""""""".T',
      '~~~~~~~~~:::"""",,.."""""""".T',
      '~~~~~~~~~:::....,,.."""""""".T',
      '~~~~~~~~~:::....,,.."""""""".T',
      '~~~~~~~~~:::TTT.,,.."""""""".T',
      '~~~~~~~~~:::TTT.,,...........T',
      '~~~~~~~~~:::TTT.,,...........T',
      '~~~~~~~~~:::TTT.,,...........T',
      '~~~~~~~~~:::....,,S..........T',
      '~~~~~~~~~:::....,,...........T',
      '~~~~~~~~~:::....,,,,,,,,,,,,,,',
      '~~~~~~~~~:::.HHHH............T',
      '~~~~~~~~~:::.HHHH............T',
      '~~~~~~~~~:::.HDHH............T',
      '~~~~~~===:::.::::............T',
      '~~~~~~===:::.::::............T',
      '~~~~~~~~~:::.::::............T',
      '~~~~~~~~~TTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'petalburg', offset: 18 }, north: { map: 'petalburg-woods', offset: 0 } },
    warps: [{ x: 14, y: 29, to: 'briney-house', spot: 'door' }],
    spots: { 'briney-door': [14, 30, 'down'], pier: [9, 30, 'left'] },
    signs: { '18,24': 'Route 104. North: Petalburg Woods. East: Petalburg City.' },
    trainers: [
      { id: 'haley', who: 'lass', cls: 'lass', name: 'Haley', x: 19, y: 10, dir: 'left', sight: 3, team: [['lotad', 7], ['shroomish', 7]],
        before: 'The sea breeze makes my Pokémon so lively! Let me show you!',
        defeat: 'Oh, the wind changed...',
        after: 'Lotad loves the rain. When it rains, it moves twice as fast!' },
      { id: 'billy', who: 'youngster', cls: 'youngster', name: 'Billy', x: 14, y: 9, dir: 'right', sight: 2, team: [['zigzagoon', 7], ['seedot', 7]],
        before: 'I have been waiting for a strong Trainer to walk by. That is you, right?',
        defeat: 'You really were strong!',
        after: 'Seedot looks just like an acorn. Sometimes I forget it is a Pokémon!' },
      { id: 'darian', who: 'fisherman', cls: 'fisherman', name: 'Darian', x: 10, y: 30, dir: 'up', sight: 2, team: [['magikarp', 9]],
        before: 'The fish are not biting. A battle will pass the time!',
        defeat: 'Even my Magikarp gave it everything...',
        after: 'One day this Magikarp will be a Gyarados. I just have to be patient.' }
    ],
    npcs: [{ id: 'oldman', who: 'oldman', x: 21, y: 22, move: 'look',
             say: 'That cottage on the beach belongs to Mr. Briney. He was a famous sailor once. Now he just watches the waves with his Wingull.' }],
    items: [{ x: 10, y: 3, item: 'poke-ball', flag: 'route104-pokeball' }, { x: 27, y: 31, item: 'potion', flag: 'route104-potion' }],
    encounters: { walk: '@hoenn-route-104-area', water: '@hoenn-route-104-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'briney-house', loc: 'hoenn-route-104', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'route104', spot: 'briney-door' }],
    spots: { door: [4, 7, 'up'] },
    // Chapter 30: while Peeko is missing they are out on Route 116 (rusturf.js); after it, his boat (dewford.js).
    npcs: [
      { id: 'briney', who: 'captain', x: 7, y: 4, dir: 'left', if: '!goods-stolen',
        say: 'Ahoy! I am Briney. I sailed every sea in Hoenn in my day, but these old bones have hung up their sea legs. Now Peeko and I just enjoy the view.' },
      { id: 'peeko', who: 'wingull', mon: 'wingull', x: 8, y: 5, dir: 'left', fixed: true, if: '!goods-stolen',
        say: 'Peeko the Wingull flaps its wings and cries happily.' },
      { id: 'briney2', who: 'captain', x: 7, y: 4, dir: 'left', if: 'peeko-saved', script: 'hoenn.briney' },
      { id: 'peeko2', who: 'wingull', mon: 'wingull', x: 8, y: 5, dir: 'left', fixed: true, if: 'peeko-saved',
        say: 'Peeko the Wingull flaps its wings and cries happily.' }
    ]
  }, HOENN));

  // ---------------- Petalburg Woods ----------------
  G.Maps.def(Object.assign({
    id: 'petalburg-woods', loc: 'petalburg-woods', tileset: 'outdoor', palette: 'forest', music: 'forest', battleBg: 'forest', border: 'T',
    rows: [
      'TTTTTT,,TTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTT,,TTTTTTTTTTTTTTTTTTTTTT',
      'TTTTT.,,.............TTTTTTTTT',
      'TTTTT.,,.........""".TTTTTTTTT',
      'TTTTT.,,.........""".TTTTTTTTT',
      'TTTTTTTTTT....TTTTTTTTTTTTTTTT',
      'TTTTTTTTTT....TTTTTTTTTTTTTTTT',
      'TTTTTTTTTT....TTTTTTTTTTTTTTTT',
      'TTTTTTTTTT....TTTTTTTTTTTTTTTT',
      'TTT........."""""".........TTT',
      'TTT........."""""".........TTT',
      'TTT........."""""".........TTT',
      'TTT....TTTTTTTTTTTTTTTT....TTT',
      'TTT....TTTTTTTTTTTTTTTT."".TTT',
      'TTT."".TTTTTTTTTTTTTTTT."".TTT',
      'TTT."".TTTTTTTTTTTTTTTT."".TTT',
      'TTT."".TTTTTTTTTTTTTTTT."".TTT',
      'TTT."".TTTTTTTTTTTTTTTT."".TTT',
      'TTT."".TTTTTTTTTTTTTTTT."".TTT',
      'TTT."".TTTTTTTTTTTTTTTT....TTT',
      'TTT....TTTTTTTTTTTTTTTT....TTT',
      'TTT....TTTTTTTTTTTTTTTT....TTT',
      'TTT............,,,,........TTT',
      'TTT""""""".....,,,,."""""".TTT',
      'TTT""""""".....,,,,."""""".TTT',
      'TTT""""""".....,,,,."""""".TTT',
      'TTTTTTTTTTTTTTT,,,,TTTTTTTTTTT',
      'TTTTTTTTTTTTTTT,,,,TTTTTTTTTTT',
      'TTTTTTTTTTTTTTT,,,,TTTTTTTTTTT',
      'TTTTTTTTTTTTTTT,,,,TTTTTTTTTTT'
    ],
    connect: { south: { map: 'route104', offset: 0 }, north: { map: 'route104n', offset: 0 } },
    triggers: [{ x: 10, y: 8, w: 4, h: 1, if: '!woods-aqua', script: 'woods.aqua' }],
    trainers: [
      { id: 'lyle', who: 'bugcatcher', cls: 'bug-catcher', name: 'Lyle', x: 22, y: 23, dir: 'left', sight: 3, team: [['wurmple', 6], ['wurmple', 6]],
        before: 'The woods are full of Bug Pokémon. And I have caught the best ones!',
        defeat: 'Bugs are still the best!',
        after: 'Wurmple turns into Silcoon or Cascoon. Which one? That is the big mystery!' }
    ],
    npcs: [
      { id: 'researcher', who: 'scientist', x: 11, y: 5, dir: 'down', if: '!woods-aqua', script: 'woods.aqua' },
      { id: 'grunt', who: 'aqua', x: 12, y: 5, dir: 'left', if: '!woods-aqua', script: 'woods.aqua' },
      { id: 'girl', who: 'lass', x: 5, y: 11, dir: 'right', script: 'woods.seed-girl' }
    ],
    items: [{ x: 25, y: 12, item: 'ether', flag: 'woods-ether' }, { x: 14, y: 2, item: 'paralyze-heal', flag: 'woods-parlyz' },
            { x: 3, y: 12, item: 'potion', flag: 'woods-potion' }],
    encounters: { walk: '@petalburg-woods-area' }
  }, HOENN));

  // ---------------- Route 104, the north ----------------
  G.Maps.def(Object.assign({
    id: 'route104n', loc: 'hoenn-route-104', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTT,,,,TTTTTTTTTTTTTT',
      'T...........,,,,.............T',
      'T."""""""...,,..."""""""""...T',
      'T."""""""...,,..."""""""""...T',
      'T."""""""...,,..."""""""""...T',
      'T."""""""...,,..."""""""""...T',
      'T."""""""...,,...............T',
      'T...........,,...............T',
      'T~~~~~~~~~~~==~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~==~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~==~~~~~~~~~~~~~~~T',
      'T...........,,...............T',
      'T.""".......,,.........""""".T',
      'T.""".....S.,,.........""""".T',
      'T.""".,,,,,,,,.........""""".T',
      'T.""".,,..........HHHH.......T',
      'T.""".,,..........HHHH.......T',
      'T.""".,,..........HDHH.......T',
      'T.""".,,...........,.........T',
      'T.""".,,........ffffffff.....T',
      'T.""".,,.....................T',
      'T.....,,.....................T',
      'T.....,,.....................T',
      'TTTTTT,,TTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'petalburg-woods', offset: 0 }, north: { map: 'rustboro', offset: -2 } },
    warps: [{ x: 19, y: 17, to: 'pretty-petal', spot: 'door' }],
    spots: { 'shop-door': [19, 18, 'down'] },
    signs: { '10,13': 'Route 104. North: Rustboro City. South: Petalburg Woods.' },
    trainers: [
      { id: 'cindy', who: 'lass', cls: 'lass', name: 'Cindy', x: 9, y: 4, dir: 'right', sight: 2, team: [['zigzagoon', 7]],
        before: 'Rustboro is just across the bridge! But first, a battle!',
        defeat: 'Hmph, you are good.',
        after: 'There is a school for Trainers in Rustboro. I learned everything there!' },
      { id: 'ivan', who: 'fisherman', cls: 'fisherman', name: 'Ivan', x: 20, y: 6, dir: 'down', sight: 2, team: [['magikarp', 6], ['magikarp', 6], ['magikarp', 6]],
        before: 'Three Magikarp, three times the fun!',
        defeat: 'Splash, splash, splash...',
        after: 'This river is full of Magikarp. Where do they all come from?' },
      { id: 'kent', who: 'bugcatcher', cls: 'bug-catcher', name: 'Kent', x: 22, y: 12, dir: 'left', sight: 3, team: [['wurmple', 6], ['taillow', 7]],
        before: 'I caught a Taillow in the woods! Well, it caught me first...',
        defeat: 'Ow, ow, ow!',
        after: 'Taillow is small, but it never gives up, even against a bigger foe.' }
    ],
    items: [{ x: 27, y: 21, item: 'potion', flag: 'route104n-potion' }, { x: 1, y: 1, item: 'poke-ball', flag: 'route104n-pokeball' }],
    encounters: { walk: '@hoenn-route-104-area', water: '@hoenn-route-104-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'pretty-petal', loc: 'hoenn-route-104', tileset: 'indoor', palette: 'garden', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'pp_pp_pp_pp', '___________', '___ttt_____', '___________', 'p_________p', '____X______'],
    warps: [{ x: 4, y: 7, to: 'route104n', spot: 'shop-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'florist', who: 'lass', x: 7, y: 3, dir: 'down', script: 'woods.florist' },
      { id: 'sister', who: 'daisy', x: 2, y: 5, move: 'look',
        say: 'Berries grow on trees all over Hoenn. Pick them, and a new crop grows the next day!' }
    ]
  }, HOENN));

  // ---------------- Team Aqua in the woods ----------------
  async function aqua(h) {
    const F = G.Field;
    if (F.flag('woods-aqua')) return;
    await h.say(T('Hmm... No Shroomish here either. I was so sure they lived in these woods...'), RESEARCHER);
    h.emote('grunt', '!');
    await h.say(T('There you are, Devon researcher! Hand over the papers you are carrying, nice and easy.'), GRUNT);
    await h.say(T('N-no! These are important! You there, please help me!'), RESEARCHER);
    h.face('grunt', 'down');
    await h.say(T('What? A kid wants to get in the way of Team Aqua? You asked for it!'), GRUNT);
    const out = await h.battle({ id: 'aqua-woods', who: 'aqua', cls: 'team-aqua', name: '', team: [['poochyena', 9]] }, {});
    if (out === 'lose') return;
    await h.say(T('Grr... You are tougher than you look. Fine, keep the papers. Team Aqua will not forget your face!'), GRUNT);
    h.hide('grunt');
    F.setFlag('woods-aqua');
    await h.say(T('Thank you! Those papers are very important to the Devon Corporation. Please, take this.'), RESEARCHER);
    F.giveItem('great-ball', 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('great-ball') } });
    await j;
    await h.say(T('Team Aqua... I must warn the company. I will hurry back to Rustboro City!'), RESEARCHER);
    h.hide('researcher');
  }

  G.Script.def({
    'woods.aqua': [['js', aqua]],
    'woods.seed-girl': [
      ['if', 'got-miracle-seed', [
        ['say', 'A Miracle Seed makes Grass-type moves stronger. Let your Pokémon hold it!']
      ], [
        ['say', 'Oh, you are a Trainer? I found this in the woods, but I do not have any Grass-type Pokémon. Here, you have it!'],
        ['giveItem', 'miracle-seed', 1],
        ['setFlag', 'got-miracle-seed']
      ]]
    ],
    'woods.florist': [
      ['if', 'got-flower-berries', [
        ['say', 'Welcome to the Pretty Petal flower shop! Flowers and berries make everybody smile.']
      ], [
        ['say', 'Welcome to the Pretty Petal flower shop! Our berries grow right outside. Here, a little gift for your Pokémon!'],
        ['giveItem', 'oran-berry', 2],
        ['setFlag', 'got-flower-berries'],
        ['say', 'Let a Pokémon hold an Oran Berry, and it will eat it in battle when its HP runs low.']
      ]]
    ]
  });
})();
