/* ============ verdanturf.js — Route 117, Verdanturf Town, Route 118 ============
 * Chapter 33. West of Mauville City, Route 117 (flowers, a pond) leads to Verdanturf Town, where the
 * mountains keep Mt. Chimney's ash away: Wally lives there now with his aunt, and Wanda waits for her
 * boyfriend, who is digging the Rusturf Tunnel from Rustboro's side (rusturf.js: its last rock needs
 * Rock Smash). East of Mauville, Route 118 is cut by a sea channel: with Surf, the far bank, where
 * Steven waits (flag steven-118) and talks of the strange weather and of Route 119 and Fortree City,
 * then `ending(33)`. Route 119 is closed for now. Norman's Gym is in petalburg.js.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const WALLY = { name: 'Wally' }, AUNT = { name: 'Wally\'s Aunt' }, STEVEN = { name: 'Steven' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 117 ----------------
  G.Maps.def(Object.assign({
    id: 'route117', loc: 'hoenn-route-117', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..................................T',
      'T...""""""""...fffff......""""""...T',
      'T...""""""""...fffff......""""""...T',
      'T...""""""""..............""""""...T',
      'T...............................S..T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T..................................T',
      'T...ffffff...~~~~~~~.."""""""""....T',
      'T...ffffff...~~~~~~~.."""""""""....T',
      'T...ffffff...~~~~~~~.."""""""""....T',
      'T..................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'mauville', offset: -3 }, west: { map: 'verdanturf', offset: -4 } },
    signs: { '32,5': 'Route 117. West: Verdanturf Town. East: Mauville City.' },
    trainers: [
      { id: 'lydia', who: 'lass', cls: 'picnicker', name: 'Lydia', x: 8, y: 5, dir: 'down', sight: 1, team: [['roselia', 24], ['marill', 24]],
        before: 'The flowers along Route 117 are my favourite. My Pokémon love them too!',
        defeat: 'My petals fell...',
        after: 'Roselia has a red rose on one hand and a blue one on the other. Their scent can make you sleepy!' },
      { id: 'dylan', who: 'camper', cls: 'camper', name: 'Dylan', x: 21, y: 8, dir: 'up', sight: 1, team: [['linoone', 25]],
        before: 'I run along this road every morning with Linoone. Keep up if you can!',
        defeat: 'Out of breath...',
        after: 'Linoone runs very fast, but only in straight lines. Corners are its weak spot!' },
      { id: 'isaac', who: 'bugcatcher', cls: 'bug-catcher', name: 'Isaac', x: 28, y: 5, dir: 'down', sight: 1, team: [['volbeat', 24], ['illumise', 24]],
        before: 'Volbeat and Illumise light up the night together. Want to see?',
        defeat: 'The lights went out...',
        after: 'Volbeat follows the sweet scent of Illumise. At night they draw shapes in the sky with their lights.' }
    ],
    npcs: [{ id: 'man', who: 'gentleman', x: 24, y: 2, move: 'look',
             say: 'Some people come all the way to Route 117 just for the flowers. I come for the quiet.' }],
    items: [{ x: 1, y: 12, item: 'great-ball', flag: 'route117-greatball' }, { x: 34, y: 1, item: 'super-repel', flag: 'route117-superrepel' }],
    encounters: { walk: '@hoenn-route-117-area', water: '@hoenn-route-117-area' }
  }, HOENN));

  // ---------------- Verdanturf Town ----------------
  G.Maps.def(Object.assign({
    id: 'verdanturf', loc: 'verdanturf-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T#######...............ffffT',
      'T#######...............ffffT',
      'T###O###..CCCCC........ffffT',
      'T...,.....CCCCC....MMMM....T',
      'T...,.....CCCCC....MMMM....T',
      'T...,.....CCDCC....MDMM....T',
      'T...,.......,.......,......T',
      'T...,.......,.......,......T',
      'T...,...S...,.......,......T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T..........................T',
      'T..........................T',
      'T..HHHH..HHHH....BBBBBB....T',
      'T..HHHH..HHHH....BBBBBB....T',
      'T..HDHH..HDHH....BBBBBB....T',
      'T...,.....,......BBDBBBS...T',
      'T............fff...,.......T',
      'T............fff...........T',
      'T..........................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route117', offset: 4 } },
    warps: [
      { x: 4, y: 3, to: 'rusturf-tunnel', spot: 'verdanturf' },
      { x: 12, y: 6, to: 'verdanturf-center', spot: 'door' },
      { x: 20, y: 6, to: 'verdanturf-mart', spot: 'door' },
      { x: 4, y: 16, to: 'wally-home', spot: 'door' },
      { x: 10, y: 16, to: 'wanda-house', spot: 'door' },
      { x: 19, y: 17, locked: 'verdanturf.contest' }
    ],
    spots: { tunnel: [4, 4, 'down'], 'center-door': [12, 7, 'down'], 'mart-door': [20, 7, 'down'], 'wally-door': [4, 17, 'down'],
             'wanda-door': [10, 17, 'down'] },
    signs: {
      '8,9': 'Verdanturf Town. A town of fresh air, sheltered from the ash of Mt. Chimney.',
      '23,17': 'Pokémon Contest Hall. The stage where Pokémon show off their charm.'
    },
    npcs: [
      { id: 'boy', who: 'youngster', x: 14, y: 12, move: 'wander', r: 2,
        say: 'The mountains around Verdanturf keep the ash from Mt. Chimney away. That is why our air is so clean!' },
      { id: 'woman', who: 'lass', x: 24, y: 13, move: 'look',
        say: 'A sickly boy moved here not long ago. He walks with his Ralts every morning, and he looks better every day.' },
      { id: 'man', who: 'gentleman', x: 2, y: 12, move: 'look',
        say: 'The Rusturf Tunnel goes west to Route 116 and Rustboro City. They stopped digging when they hit a rock too hard to break.' }
    ]
  }, HOENN));

  G.Maps.center('verdanturf-center', {
    loc: 'verdanturf-town', exit: { map: 'verdanturf', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'People come to Verdanturf to rest and get well. Even the Pokémon here seem calmer.' }]
  }).region = 'hoenn';

  G.Maps.mart('verdanturf-mart', {
    loc: 'verdanturf-town', exit: { map: 'verdanturf', spot: 'mart-door' },
    stock: ['great-ball', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'escape-rope', 'super-repel', 'x-sp-atk'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'Escape Rope takes you straight out of a cave. Handy in the Rusturf Tunnel!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'wally-home', loc: 'verdanturf-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'verdanturf', spot: 'wally-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'wally', who: 'wally', x: 7, y: 4, dir: 'left', script: 'verdanturf.wally' },
      { id: 'aunt', who: 'beauty', x: 2, y: 4, dir: 'right', script: 'verdanturf.aunt' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'wanda-house', loc: 'verdanturf-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'verdanturf', spot: 'wanda-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'wanda', who: 'lass', x: 7, y: 4, dir: 'left', script: 'verdanturf.wanda' }]
  }, HOENN));

  // ---------------- Route 118 ----------------
  G.Maps.def(Object.assign({
    id: 'route118', loc: 'hoenn-route-118', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTT~~~~~~~TTTTTTTTTTTTTTTTTT',
      'T............::~~~~~~~::.......S..TTTTTT',
      'T.."""""""...::~~~~~~~::..........TTTTTT',
      'T.."""""""...::~~~~~~~::.."""""""".....T',
      'T.."""""""...::~~~~~~~::.."""""""".....T',
      'T.."""""""...::~~~~~~~::.."""""""".....T',
      'T.."""""""...::~~~~~~~::.."""""""".....T',
      'T............::~~~~~~~::.."""""""".....T',
      'T..........S.::~~~~~~~::...............T',
      ',,,,,,,,,,,,,::~~~~~~~::...............T',
      ',,,,,,,,,,,,,::~~~~~~~::...............T',
      'T............::~~~~~~~::...............T',
      'T............::~~~~~~~::...""""""""""..T',
      'T..""""""""..::~~~~~~~::...""""""""""..T',
      'T..""""""""..::~~~~~~~::...""""""""""..T',
      'T..""""""""..::~~~~~~~::...""""""""""..T',
      'T..""""""""..::~~~~~~~::...""""""""""..T',
      'T..""""""""..::~~~~~~~::...............T',
      'T............::~~~~~~~::...............T',
      'TTTTTTTTTTTTTTT~~~~~~~TTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'mauville', offset: 0 } },
    signs: {
      '11,8': 'Route 118. West: Mauville City. The road goes on across the water.',
      '31,1': 'North: Route 119, to Fortree City. The road is closed for now.'
    },
    triggers: [{ x: 22, y: 1, w: 1, h: 18, if: '!steven-118', script: 'route118.steven' }],
    trainers: [
      { id: 'deandre', who: 'youngster', cls: 'youngster', name: 'Deandre', x: 7, y: 8, dir: 'down', sight: 1, team: [['zigzagoon', 25], ['electrike', 26]],
        before: 'Mauville is right behind me. Show me what a Trainer from the big city can do!',
        defeat: 'I should have stayed in town...',
        after: 'You need a Pokémon that can Surf to cross the water. Then the whole road is yours.' },
      { id: 'barny', who: 'fisherman', cls: 'fisherman', name: 'Barny', x: 11, y: 13, dir: 'up', sight: 3, team: [['carvanha', 26], ['wingull', 26]],
        before: 'This channel is full of fish that bite. So are my Pokémon!',
        defeat: 'Snapped my line...',
        after: 'Carvanha swim in packs and bite anything that comes too close. Mind your fingers when you Surf!' },
      { id: 'chester', who: 'birdkeeper', cls: 'bird-keeper', name: 'Chester', x: 30, y: 9, dir: 'left', sight: 4, team: [['taillow', 26], ['swellow', 27]],
        before: 'My birds watched you Surf all the way across. Now let us see how you battle!',
        defeat: 'Feathers everywhere...',
        after: 'Swellow fly south when the seasons change. They always come back to the same nest.' },
      { id: 'kelly', who: 'lass', cls: 'picnicker', name: 'Kelly', x: 35, y: 11, dir: 'left', sight: 3, team: [['oddish', 26], ['wingull', 26]],
        before: 'I came over on a boat to have lunch on this side. Nobody bothers me here... until now!',
        defeat: 'Lunch is ruined...',
        after: 'They say Route 119 gets so much rain that the grass grows taller than a person!' },
      { id: 'rose', who: 'lass', cls: 'lass', name: 'Rose', x: 25, y: 14, dir: 'right', sight: 2, team: [['roselia', 26], ['shroomish', 26]],
        before: 'Do you like flowers? My Pokémon smell wonderful. Let me show you!',
        defeat: 'Wilted...',
        after: 'Roselia\'s thorns are poisonous. Look, but do not touch!' }
    ],
    npcs: [{ id: 'steven', who: 'steven', x: 30, y: 7, dir: 'left', if: 'scripted' }],
    items: [{ x: 1, y: 17, item: 'hyper-potion', flag: 'route118-hyperpotion' }, { x: 38, y: 17, item: 'great-ball', flag: 'route118-greatball' }],
    encounters: { walk: '@hoenn-route-118-area', water: '@hoenn-route-118-area' }
  }, HOENN));

  // ---------------- Route 118: Steven ----------------
  async function steven(h) {
    const F = G.Field;
    if (F.flag('steven-118')) return;
    const me = G.World.player;
    h.place('steven', 30, 7, 'left'); h.show('steven');
    // Next to the player: east of them, else above or below, never on the follower's tile.
    const f = h.actor('follower');
    const free = ([x, y]) => !(f && f.visible !== false && f.x === x && f.y === y);
    for (const [x, y] of (me ? [[me.x + 1, me.y], [me.x, me.y - 1], [me.x, me.y + 1]] : [[23, 9]]).filter(free)) {
      await h.walkTo('steven', x, y);
      const a = h.actor('steven');
      if (!a || (a.x === x && a.y === y)) break;
    }
    h.face('steven', 'player');
    h.face('player', 'steven');
    await h.say(T('{player}! We meet again. I came to look at the stones along this shore.'), STEVEN);
    await h.say(T('I heard what happened on Mt. Chimney. Team Magma wants more land, Team Aqua wants more sea... Either way, Hoenn would never be the same.'), STEVEN);
    await h.say(T('The weather has been strange lately, too: sudden droughts, sudden storms. North of here, Route 119 leads to the Weather Institute, where they study exactly that.'), STEVEN);
    await h.say(T('Fortree City lies beyond it. Its Gym Leader, Winona, soars through the sky with her bird Pokémon. I am sure you will meet her soon.'), STEVEN);
    await h.say(T('Until next time, {player}. Take good care of your Pokémon.'), STEVEN);
    await h.walkTo('steven', 30, 7);
    h.hide('steven');
    F.setFlag('steven-118');
    // The end of the thirty-third chapter (credits-ui.js).
    if (G.CreditsUI) G.CreditsUI.ending(33); else F.setFlag('chapter-33-done');
  }

  G.Script.def({
    'route118.steven': [['js', steven]],
    'verdanturf.contest': [['say', 'The Contest Hall is closed. A note on the door says the stage is being repaired.']],
    'verdanturf.wally': [
      ['if', 'wally-battle', [
        ['say', '{player}! You came to visit? The air here is so clean, I already feel stronger.', WALLY],
        ['say', 'Ralts and I train every day. One day we will battle you again, and that time we will not lose!', WALLY]
      ], [
        ['say', 'Oh, {player}! The air in Verdanturf is so clean. Ralts and I go for a walk every morning.', WALLY]
      ]]
    ],
    'verdanturf.aunt': [['say', 'Wally talks about you all the time. Thank you for being such a good friend to him.', AUNT]],
    'verdanturf.wanda': [
      ['say', 'My boyfriend is digging a tunnel all the way from Rustboro, just so he can come and see me.'],
      ['say', 'But they hit a rock nobody can break. He says only a Pokémon could smash it... I hope someone helps him.']
    ]
  });
})();
