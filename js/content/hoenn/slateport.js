/* ============ slateport.js — Slateport City, the Oceanic Museum, Route 110 ============
 * Chapter 31. Mr. Briney's boat now sails to Slateport City too (dewford.js: once you have been to
 * Dewford Town). Slateport: the Oceanic Museum, its captain's shipyard, a Pokémon Center, a Mart, a
 * house, the beach and Briney's pier. On the museum's 2F the captain is waiting for the Devon Goods;
 * two Team Aqua grunts follow you up the stairs and want them: you battle both, then their leader,
 * Archie, turns up, says Team Aqua will make the sea bigger, and leads them away. The captain takes
 * the Goods (flag goods-delivered). Route 110 runs north to Mauville City (Trainers, a pond); on it,
 * once the Goods are delivered, the rival battles you (flag rival3-110; their team grows with them).
 */
(() => {
  const T = s => G.T(s);
  const GRUNT = { name: 'Team Aqua Grunt' }, ARCHIE = { name: 'Archie' }, CAPTAIN = { name: 'Captain' }, BRINEY = { name: 'Mr. Briney' };
  const RIVAL3 = { name: '{rival3}' };
  const HOENN = { region: 'hoenn' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Slateport City ----------------
  G.Maps.def(Object.assign({
    id: 'slateport', loc: 'slateport-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTT,,,,TTTTTTTTTTTTTTT',
      'T..............,,,,..............T',
      'T..............,,,,..............T',
      'T...CCCCC......,,,,...BBBBBB.....T',
      'T...CCCCC......,,,,...BBBBBB.....T',
      'T...CCCCC......,,,,...BBBBBB.....T',
      'T...CCDCC......,,,,...BBDBBB.....T',
      'T.....,........,,,,.....,...S....T',
      'T..............,,,,..............T',
      'T........ffff..,,,,..............T',
      'T..............,,,,..............T',
      'T.............S,,,,..............T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T..............,,,,..............T',
      'T...HHHH.MMMM..,,,,...HHHH.......T',
      'T...HHHH.MMMM..,,,,...HHHH.......T',
      'T...HDHH.MDMM..,,,,...HDHH.......T',
      'T....,....,....,,,,....,.........T',
      'T..............,,,,..............T',
      'T..............,,,,...ffffff.....T',
      'T..............,,,,..............T',
      'T..............,,,,..............T',
      'T..............,,,,..............T',
      'T::::::::::::::::::::::::::::::::T',
      'T::::::::::::::::::::::::::::::::T',
      'T:::::::::::::::::::==:::::::::::T',
      '~~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route110', offset: 5 } },
    warps: [
      { x: 24, y: 6, to: 'museum-1f', spot: 'door' },
      { x: 6, y: 6, to: 'slateport-center', spot: 'door' },
      { x: 10, y: 17, to: 'slateport-mart', spot: 'door' },
      { x: 23, y: 17, to: 'shipyard', spot: 'door' },
      { x: 5, y: 17, to: 'slateport-house', spot: 'door' }
    ],
    spots: { 'museum-door': [24, 7, 'down'], 'center-door': [6, 7, 'down'], 'mart-door': [10, 18, 'down'], 'shipyard-door': [23, 18, 'down'],
             'house-door': [5, 18, 'down'], pier: [20, 28, 'up'] },
    signs: {
      '14,11': 'Slateport City. The port where people and the sea meet.',
      '28,7': 'The Oceanic Museum. Learn all about the wonders of the sea!'
    },
    npcs: [
      { id: 'briney', who: 'captain', x: 21, y: 29, dir: 'left', script: 'hoenn.briney-slateport' },
      { id: 'sailor', who: 'sailor', x: 12, y: 21, move: 'look',
        say: 'Ships from all over the world dock in Slateport. You can smell the sea in every street!' },
      { id: 'girl', who: 'lass', x: 28, y: 14, move: 'wander', r: 2,
        say: 'The captain of the Oceanic Museum is building a submarine to explore the bottom of the sea. Imagine what lives down there!' },
      { id: 'man', who: 'gentleman', x: 3, y: 10, move: 'look',
        say: 'Route 110 is north of town. Follow it and you will reach Mauville City, the biggest city in Hoenn.' }
    ],
    encounters: { water: '@slateport-city-area' }
  }, HOENN));

  G.Maps.center('slateport-center', {
    loc: 'slateport-city', exit: { map: 'slateport', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'Some people wear blue bandanas around town lately. They say they want to give the land back to the sea. Strange...' }]
  }).region = 'hoenn';

  G.Maps.mart('slateport-mart', {
    loc: 'slateport-city', exit: { map: 'slateport', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'escape-rope', 'repel', 'x-sp-atk'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'Super Potions heal more than Potions. Worth every coin before a big battle!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'shipyard', loc: 'slateport-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbbb+++++bbbb', '+++++++++++++', '++ttt+++ttt++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 7, to: 'slateport', spot: 'shipyard-door' }],
    spots: { door: [6, 7, 'up'] },
    npcs: [
      { id: 'worker', who: 'engineer', x: 3, y: 3, dir: 'down',
        say: 'This is the museum\'s shipyard. We are building a submarine here! The captain is at the Oceanic Museum today.' },
      { id: 'designer', who: 'scientist', x: 9, y: 5, dir: 'left',
        say: 'With the parts from Devon, our submarine will be able to dive deeper than any before it.' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'slateport-house', loc: 'slateport-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'slateport', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'fisherman', x: 7, y: 4, dir: 'left',
             say: 'The sea gives us everything: fish, salt, the wind for our ships. I could never live anywhere else.' }]
  }, HOENN));

  // ---------------- the Oceanic Museum ----------------
  G.Maps.def(Object.assign({
    id: 'museum-1f', loc: 'slateport-city', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbb+++++++^bb', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++==++++++++', '+++++++++++++',
           '++++++X++++++'],
    warps: [{ x: 6, y: 8, to: 'slateport', spot: 'museum-door' }, { x: 10, y: 2, to: 'museum-2f', spot: 'stairs' }],
    spots: { door: [6, 8, 'up'], stairs: [10, 3, 'down'] },
    signs: { '2,4': 'A model of the deep sea floor. It is so dark down there that some Pokémon make their own light.',
             '10,4': 'A model of a sea current. Currents carry warm water from the south seas all the way to Hoenn.' },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 3, y: 5, dir: 'down',
        say: 'Welcome to the Oceanic Museum! The exhibits on the second floor are about the sea and the Pokémon that live in it.' },
      { id: 'grunt1', who: 'aqua', x: 7, y: 4, dir: 'up', if: '!goods-delivered',
        say: 'The boss told us to wait here. ...What? I am just looking at the exhibits!' },
      { id: 'grunt2', who: 'aqua', x: 8, y: 6, dir: 'left', if: '!goods-delivered',
        say: 'Hey, quit staring. Go and look at the fish or something.' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'museum-2f', loc: 'slateport-city', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor', enter: 'museum.enter',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bb++++++++^bb', '+++++++++++++', '++j++j++j++++', '+++++++++++++', '+++++++++++++', '+++++++++++++'],
    warps: [{ x: 10, y: 2, to: 'museum-1f', spot: 'stairs' }],
    spots: { stairs: [10, 3, 'down'] },
    signs: { '2,4': 'A model of a submarine. Below it, a note: "Built in Slateport. Diving soon."',
             '5,4': 'A model of a sea basin. Long ago, they say, the seas of Hoenn were wider than they are today.',
             '8,4': 'Fossils of ancient sea Pokémon. Some lived millions of years ago.' },
    npcs: [
      { id: 'captain', who: 'stern', x: 4, y: 6, dir: 'right', script: 'museum.captain' },
      { id: 'grunt1', who: 'aqua', x: 10, y: 3, dir: 'left', if: 'scripted' },
      { id: 'grunt2', who: 'aqua', x: 10, y: 3, dir: 'left', if: 'scripted' },
      { id: 'archie', who: 'archie', x: 10, y: 3, dir: 'left', if: 'scripted' }
    ]
  }, HOENN));

  // ---------------- Route 110 ----------------
  G.Maps.def(Object.assign({
    id: 'route110', loc: 'hoenn-route-110', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTT,,,,TTTTTTTTTT',
      'T.........,,,,.........T',
      'T.........,,,,S........T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.........T',
      'T.........,,,,.........T',
      'T.........,,,,.........T',
      'T.........,,,,.........T',
      'T.........,,,,.........T',
      'T.""""""..,,,,.........T',
      'T.""""""..,,,,.........T',
      'T.""""""..,,,,.~~~~~~~.T',
      'T.""""""..,,,,.~~~~~~~.T',
      'T.""""""..,,,,.~~~~~~~.T',
      'T.""""""..,,,,.~~~~~~~.T',
      'T.""""""..,,,,.~~~~~~~.T',
      'T.........,,,,.~~~~~~~.T',
      'T.........,,,,.~~~~~~~.T',
      'T.........,,,,.........T',
      'T.........,,,,.........T',
      'T.........,,,,.........T',
      'T.""""""..,,,,.........T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.."""""".T',
      'T.""""""..,,,,.."""""".T',
      'T.........,,,,.."""""".T',
      'T.........,,,,.."""""".T',
      'T.........,,,,.........T',
      'T..TTTT...,,,,.........T',
      'T..TTTT...,,,,...TTTT..T',
      'T..TTTT...,,,,...TTTT..T',
      'T.........,,,,...TTTT..T',
      'T........S,,,,.........T',
      'T.........,,,,.........T',
      'TTTTTTTTTT,,,,TTTTTTTTTT'
    ],
    connect: { south: { map: 'slateport', offset: -5 }, north: { map: 'mauville', offset: -4 } },
    signs: { '9,37': 'Route 110. North: Mauville City. South: Slateport City.', '14,2': 'Route 110. North: Mauville City.' },
    triggers: [{ x: 1, y: 8, w: 22, h: 1, if: ['goods-delivered', '!rival3-110'], script: 'route110.rival' }],
    trainers: [
      { id: 'isabel', who: 'lass', cls: 'lass', name: 'Isabel', x: 9, y: 30, dir: 'right', sight: 2, team: [['plusle', 15], ['minun', 15]],
        before: 'Plusle and Minun always cheer each other on. Watch them work together!',
        defeat: 'Even with all that cheering...',
        after: 'When Plusle and Minun fight side by side, they make each other stronger. One on one, not so much.' },
      { id: 'edward', who: 'psychic', cls: 'psychic', name: 'Edward', x: 14, y: 22, dir: 'left', sight: 2, team: [['abra', 16]],
        before: 'I saw you coming in my mind. I also saw myself winning!',
        defeat: 'I did not see that coming...',
        after: 'Abra teleports away when it senses danger. Catching one takes quick thinking.' },
      { id: 'dale', who: 'fisherman', cls: 'fisherman', name: 'Dale', x: 14, y: 17, dir: 'right', sight: 1, team: [['tentacool', 15], ['wailmer', 16]],
        before: 'This pond has the best fish this side of Slateport. Here, meet my catch!',
        defeat: 'Washed away...',
        after: 'Wailmer can blow water out of its nostrils. It is bigger than it looks, too!' },
      { id: 'ben', who: 'youngster', cls: 'youngster', name: 'Ben', x: 15, y: 10, dir: 'left', sight: 2, team: [['zigzagoon', 15], ['electrike', 16]],
        before: 'Mauville is just up the road! But you are not getting past me without a battle!',
        defeat: 'Zapped...',
        after: 'Wattson\'s Gym is full of Electric types. Something that can block electricity would help!' }
    ],
    npcs: [
      { id: 'may', who: 'may', x: 11, y: 4, dir: 'down', if: ['goods-delivered', '!rival3-110', 'rival3=may'], script: 'route110.rival' },
      { id: 'brendan', who: 'brendan', x: 11, y: 4, dir: 'down', if: ['goods-delivered', '!rival3-110', 'rival3=brendan'], script: 'route110.rival' }
    ],
    items: [{ x: 1, y: 1, item: 'great-ball', flag: 'route110-greatball' }, { x: 22, y: 38, item: 'super-potion', flag: 'route110-superpotion' }],
    encounters: { walk: '@hoenn-route-110-area', water: '@hoenn-route-110-area' }
  }, HOENN));

  // ---------------- the museum: Team Aqua and Archie ----------------
  async function museum(h) {
    const F = G.Field;
    if (F.flag('goods-delivered') || !F.count('devon-goods')) return;
    await h.walkTo('player', 5, 6);
    h.face('player', 'left');
    await h.say(T('Ah, those are the parts from Devon? Splendid! I am the captain of this museum\'s research ship. Thank you for bringing them all this way.'), CAPTAIN);
    h.place('grunt1', 10, 3, 'left'); h.show('grunt1');
    await h.walkTo('grunt1', 7, 5);
    h.place('grunt2', 10, 3, 'left'); h.show('grunt2');
    await h.walkTo('grunt2', 7, 7);
    h.face('player', 'right');
    await h.say(T('Hold it right there! Those Devon parts are coming with us. Team Aqua needs them more than some museum does!'), GRUNT);
    await h.say(T('Huh? You again, the kid from the tunnel? Fine. This time we are two!'), GRUNT);
    let out = await h.battle({ id: 'aqua-museum-1', who: 'aqua', cls: 'team-aqua', name: '', team: [['carvanha', 16]] }, {});
    if (out === 'lose') return;
    await h.say(T('No way... Hey, your turn! Do not let this kid get away with it!'), GRUNT);
    out = await h.battle({ id: 'aqua-museum-2', who: 'aqua', cls: 'team-aqua', name: '', team: [['poochyena', 15], ['carvanha', 15]] }, {});
    if (out === 'lose') return;
    h.place('archie', 10, 3, 'left'); h.show('archie');
    await h.walkTo('archie', 8, 6);
    await h.say(T('Enough. So you are the one who keeps getting in our way.'), ARCHIE);
    await h.say(T('I am Archie, the leader of Team Aqua. Every Pokémon, and every person, was born from the sea. We want to give it back the space it once had.'), ARCHIE);
    await h.say(T('Keep your parts, then. But know this: nobody stands between Team Aqua and the sea. Let us go!'), ARCHIE);
    h.hide('archie'); h.hide('grunt1'); h.hide('grunt2');
    F.takeItem('devon-goods', 1);
    F.setFlag('goods-delivered');
    h.face('player', 'left');
    await h.say(T('{player} handed over the {item}.'), { vars: { item: G.Names.item('devon-goods') } });
    await h.say(T('What a scare! Thank you. With these parts, our submarine will reach the bottom of the sea. Team Aqua must never get their hands on it.'), CAPTAIN);
    await h.say(T('If you are heading north, Route 110 leads to Mauville City. Its Gym Leader, Wattson, is a cheerful old man who loves electricity.'), CAPTAIN);
  }

  // ---------------- the rival on Route 110 ----------------
  // The rival's team grows: their starter's second stage, and two Pokémon met along the way.
  const RIVAL_TEAM = {
    252: [['wingull', 18], ['numel', 18], ['grovyle', 20]],
    255: [['wingull', 18], ['lombre', 18], ['combusken', 20]],
    258: [['lombre', 18], ['numel', 18], ['marshtomp', 20]]
  };
  async function rival(h) {
    const F = G.Field, S = F.save, who = F.getVar('rival3') || 'may';
    if (F.flag('rival3-110')) return;
    const me = G.World.player;
    h.emote(who, '!');
    if (me) { await h.walkTo(who, me.x, me.y - 1); h.face(who, 'down'); h.face('player', 'up'); }
    await h.say(T('{player}! I heard you got the Devon Goods to Slateport. Dad told me everything!'), RIVAL3);
    await h.say(T('My Pokémon and I have grown a lot since Route 103. Let\'s see whose team is stronger now!'), RIVAL3);
    const out = await h.battle({ id: 'rival3-110', who, name: who === 'brendan' ? 'Brendan' : 'May', prize: 60, ai: 'basic',
      team: RIVAL_TEAM[S.rival3.starter] || RIVAL_TEAM[255] }, { canLose: true });
    F.setFlag('rival3-110');
    if (out === 'win') await h.say(T('Wow... You are still way ahead of me. But I am catching up, just you wait!'), RIVAL3);
    else await h.say(T('Yes! I won! Your Pokémon from home still will not listen, will they?'), RIVAL3);
    await h.say(T('Mauville City is just up ahead. Good luck with Wattson. See you around!'), RIVAL3);
    h.hide(who);
  }

  G.Script.def({
    'museum.enter': [['if', ['!goods-delivered', 'has:devon-goods'], [['js', museum]]]],
    'museum.captain': [
      ['if', 'goods-delivered', [
        ['say', 'Thanks to you, our submarine will soon explore the deepest sea. Team Aqua will not get near it, I promise you that.', CAPTAIN]
      ], [['if', 'has:devon-goods', [['js', museum]], [
        ['say', 'I am waiting for some important parts from the Devon Corporation. Without them, our submarine cannot dive.', CAPTAIN]
      ]]]]
    ],
    'route110.rival': [['js', rival]]
  });
  G.Hoenn.RIVAL_TEAM_110 = RIVAL_TEAM;
})();
