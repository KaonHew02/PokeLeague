/* ============ petalburg.js — Route 102, Petalburg City, Norman and Wally ============
 * Chapter 29. Route 102 runs west from Oldale Town (open once the Pokédex records Hoenn, flag
 * hoenn-dex) to Petalburg City: four Trainers, a pond, a berry tree. Petalburg: Norman's Gym, a
 * Pokémon Center, a Mart, Wally's house, a house, a pond. The first time you step into the Gym,
 * Norman (who only battles Trainers with four Hoenn badges) meets you, and a frail boy, Wally, asks
 * for help catching his first Pokémon before he moves to Verdanturf Town: Norman lends him a
 * Zigzagoon and you go with him to Route 102, where he catches a Ralts (flag wally-caught). Until
 * then a man at the west gate sends new Trainers to the Gym; after it the road west to Route 104
 * (woods.js) is open.
 */
(() => {
  const T = s => G.T(s);
  const NORMAN = { name: 'Norman' }, WALLY = { name: 'Wally' };
  const HOENN = { region: 'hoenn' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 102 ----------------
  G.Maps.def(Object.assign({
    id: 'route102', loc: 'hoenn-route-102', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..................................T',
      'T."""""".~~~~~..TTT....."""""".....T',
      'T."""""".~~~~~..TTT....."""""".....T',
      'T."""""".~~~~~.........."""""".....T',
      'T........~~~~~.................y...T',
      'T................................S.T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.......S..........................T',
      'T."""""..........."""""""...TTT....T',
      'T."""""..........."""""""...TTT....T',
      'T."""""..........."""""""...TTT....T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'oldale', offset: -3 }, west: { map: 'petalburg', offset: -1 } },
    spots: { wally: [7, 10, 'down'] },
    berries: [[31, 5, 'oran-berry']],
    signs: {
      '33,6': 'Route 102. West: Petalburg City. East: Oldale Town.',
      '8,9': 'Trainer tips: a Pokémon that is badly hurt is easier to catch. Weaken it first, then throw!'
    },
    trainers: [
      { id: 'calvin', who: 'youngster', cls: 'youngster', name: 'Calvin', x: 15, y: 6, dir: 'down', sight: 3, team: [['poochyena', 5]],
        before: 'Hey, a new face! You have to battle me if our eyes meet. Those are the rules!',
        defeat: 'Aww, I lost!',
        after: 'If you get stronger, will you battle me again sometime?' },
      { id: 'rick', who: 'bugcatcher', cls: 'bug-catcher', name: 'Rick', x: 21, y: 9, dir: 'up', sight: 3, team: [['wurmple', 4], ['wurmple', 4]],
        before: 'My Wurmple are going to grow up into something amazing. Want to see them now?',
        defeat: 'They will be amazing someday, I promise!',
        after: 'A Wurmple can evolve into two different Pokémon. Nobody knows which one until it happens!' },
      { id: 'tiana', who: 'lass', cls: 'lass', name: 'Tiana', x: 27, y: 6, dir: 'down', sight: 3, team: [['zigzagoon', 4], ['shroomish', 4]],
        before: 'I caught these two all by myself! Let me show you how strong they are!',
        defeat: 'You are really good...',
        after: 'Shroomish spreads spores. If they touch your Pokémon, it might get poisoned or fall asleep!' },
      { id: 'allen', who: 'youngster', cls: 'youngster', name: 'Allen', x: 11, y: 9, dir: 'up', sight: 3, team: [['zigzagoon', 4], ['taillow', 3]],
        before: 'I just started my journey too! Let us both do our best... by battling!',
        defeat: 'Wow, you are strong!',
        after: 'I am going back to Oldale to heal my Pokémon. See you!' }
    ],
    npcs: [{ id: 'wally', who: 'wally', x: 7, y: 11, dir: 'left', if: 'scripted' }],
    items: [{ x: 1, y: 1, item: 'potion', flag: 'route102-potion' }, { x: 34, y: 12, item: 'poke-ball', flag: 'route102-pokeball' }],
    encounters: { walk: '@hoenn-route-102-area', water: '@hoenn-route-102-area' }
  }, HOENN));

  // ---------------- Petalburg City ----------------
  G.Maps.def(Object.assign({
    id: 'petalburg', loc: 'petalburg-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..............................T',
      'T...........GGGGGG.............T',
      'T...........GGGGGG.............T',
      'T........ff.GGGGGG...ff........T',
      'T...........GGGGGG.............T',
      'T...........GGDGGG.............T',
      'T..........S..,...S............T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T..............................T',
      'T..CCCCC...MMMM....HHHH..HHHH..T',
      'T..CCCCC...MMMM....HHHH..HHHH..T',
      'T..CCCCC...MDMM....HDHH..HDHH..T',
      'T..CCDCC....,.......,.....,....T',
      'T....,.........................T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T..............................T',
      'T.~~~~~~~~~....................T',
      'T.~~~~~~~~~...HHHH..ff.........T',
      'T.~~~~~~~~~...HHHH.............T',
      'T.~~~~~~~~~...HDHH.............T',
      'T.~~~~~~~~~....,........ff.....T',
      'T.~~~~~~~~~....................T',
      'T..............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route102', offset: 1 }, west: { map: 'route104', offset: -18 } },
    warps: [
      { x: 14, y: 6, to: 'petalburg-gym', spot: 'door' },
      { x: 5, y: 14, to: 'petalburg-center', spot: 'door' },
      { x: 12, y: 13, to: 'petalburg-mart', spot: 'door' },
      { x: 20, y: 13, to: 'wally-house', spot: 'door' },
      { x: 26, y: 13, to: 'petalburg-house', spot: 'door' },
      { x: 15, y: 21, to: 'petalburg-house2', spot: 'door' }
    ],
    spots: { 'gym-door': [14, 7, 'down'], 'center-door': [5, 15, 'down'], 'mart-door': [12, 14, 'down'], 'wally-door': [20, 14, 'down'],
             'house-door': [26, 14, 'down'], 'house2-door': [15, 22, 'down'] },
    signs: {
      '11,7': 'Petalburg City. Where people live in harmony with the green of nature.',
      '18,7': 'Petalburg City Pokémon Gym. Leader: Norman, a father who knows what real strength is.'
    },
    npcs: [
      { id: 'gate', who: 'gentleman', x: 1, y: 8, dir: 'right', if: '!wally-caught',
        say: 'Ah, a new Trainer! Norman, our Gym Leader, asks that every new Trainer drop by the Gym first. It is just up the road.' },
      { id: 'boy', who: 'youngster', x: 24, y: 15, move: 'wander', r: 2,
        say: 'Norman is really strong. Even Trainers with lots of badges lose to him!' },
      { id: 'woman', who: 'lass', x: 9, y: 10, move: 'look',
        say: 'West of town, Route 104 runs along the beach and up into Petalburg Woods. Rustboro City is on the other side.' }
    ],
    encounters: { water: '@petalburg-city-area' }
  }, HOENN));

  G.Maps.center('petalburg-center', {
    loc: 'petalburg-city', exit: { map: 'petalburg', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'Pokémon from far away often will not obey a Trainer with too few badges. Hoenn\'s Gyms fix that, one badge at a time!' }]
  }).region = 'hoenn';

  G.Maps.mart('petalburg-mart', {
    loc: 'petalburg-city', exit: { map: 'petalburg', spot: 'mart-door' },
    stock: ['poke-ball', 'potion', 'antidote', 'paralyze-heal', 'awakening', 'escape-rope', 'repel', 'x-speed', 'x-attack', 'x-defense'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'X items raise a stat for the rest of a battle. Very handy against a tough Gym Leader!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'petalburg-gym', loc: 'petalburg-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor', enter: 'petalburg.gym-enter',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '+++++++++++++', '++j+++++++j++', '+++++++++++++',
           '+++++++++++++', '++j+++++++j++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 10, to: 'petalburg', spot: 'gym-door' }],
    spots: { door: [6, 10, 'up'], front: [6, 5, 'up'] },
    npcs: [
      { id: 'norman', who: 'norman', x: 6, y: 4, dir: 'down', script: 'petalburg.norman' },
      { id: 'wally', who: 'wally', x: 5, y: 9, dir: 'up', if: 'scripted' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'wally-house', loc: 'petalburg-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'petalburg', spot: 'wally-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'mom', who: 'mom', x: 7, y: 4, dir: 'left', script: 'petalburg.wally-mom' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'petalburg-house', loc: 'petalburg-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'petalburg', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'gentleman', x: 7, y: 4, dir: 'left',
             say: 'They say Norman came to Petalburg from far away, a bit like you. Now nobody here can imagine the town without him.' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'petalburg-house2', loc: 'petalburg-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'petalburg', spot: 'house2-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'girl', who: 'lass', x: 2, y: 5, move: 'wander', r: 1,
             say: 'Some Pokémon only come out when you Surf on the water. The pond in town has a few!' }]
  }, HOENN));

  // ---------------- Norman and Wally ----------------
  async function gymEnter(h) {
    const F = G.Field;
    if (F.flag('wally-caught')) return;
    await h.move('player', ['up', 'up', 'up', 'up', 'up']);
    await h.say(T('Welcome to the Petalburg Gym. You must be the Trainer from Kanto that Professor Birch told me about.'), NORMAN);
    await h.say(T('I am Norman, the Leader of this Gym. I would gladly battle a Champion, but in Hoenn I only accept challengers who hold four badges.'), NORMAN);
    await h.say(T('Earn them, and come back. I will be waiting.'), NORMAN);
    h.place('wally', 6, 10, 'up'); h.show('wally');
    await h.walkTo('wally', 6, 6);
    await h.say(T('Um... excuse me...'), WALLY);
    h.face('player', 'down');
    await h.say(T('My name is Wally. I am not very strong, so I am going to live with my relatives in Verdanturf Town, where the air is cleaner.'), WALLY);
    await h.say(T('I would like a Pokémon to keep me company. But I have never caught one...'), WALLY);
    h.face('player', 'up');
    await h.say(T('Then take my Zigzagoon and this Poké Ball, Wally.'), NORMAN);
    await h.say(T('{player}, would you go with him to Route 102 and make sure he is all right?'), NORMAN);
    await h.warp('route102', 'wally');
    await catchRalts(h);
  }

  async function catchRalts(h) {
    const F = G.Field;
    h.show('wally');
    await h.say(T('Here I go... Go, Zigzagoon!'), WALLY);
    if (G.Audio && G.Audio.cry) G.Audio.cry(280);
    F.save.dex.seen[280] = 1;
    await h.say(T('A wild Ralts appeared! Wally\'s Zigzagoon battles it bravely...'));
    await h.say(T('Wally threw the Poké Ball! ...One, two, three... Gotcha!'));
    const j = h.jingle('caught');
    await h.say(T('Wally caught Ralts!'));
    await j;
    await h.say(T('I did it! A Pokémon of my very own! Thank you for coming with me, {player}.'), WALLY);
    await h.say(T('I will take Zigzagoon back to Norman. Maybe someday Ralts and I can battle you!'), WALLY);
    h.hide('wally');
    F.setFlag('wally-caught');
  }

  G.Script.def({
    'petalburg.gym-enter': [['js', gymEnter]],
    'petalburg.norman': [
      ['if', 'wally-caught', [
        ['say', 'Wally looked so happy with his Ralts. Thank you, {player}.', NORMAN],
        ['say', 'Rustboro City is north of here, past Route 104 and Petalburg Woods. Its Leader, Roxanne, is a fine first challenge in Hoenn.', NORMAN],
        ['say', 'Come back when you hold four badges. Then we will see what a Champion can do.', NORMAN]
      ], [['js', gymEnter]]]
    ],
    'petalburg.wally-mom': [
      ['if', 'wally-caught', [
        ['say', 'Wally caught a Pokémon with your help? Thank you! He has not smiled like that in a long time.']
      ], [
        ['say', 'My son Wally has always been sickly. He is leaving for Verdanturf Town soon, where the air is clean.'],
        ['say', 'I do hope he finds a friend to keep him company there.']
      ]]
    ]
  });
})();
