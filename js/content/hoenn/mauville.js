/* ============ mauville.js — Mauville City and Wattson's Gym ============
 * Chapter 31, the end of the chapter. Mauville City, north of Route 110: Wattson's Gym (Electric
 * types), a Pokémon Center, a Mart, Rydel's Cycles, the Game Corner (closed for now) and a house. Outside
 * the Gym, Wally and his uncle: Wally wants to challenge Wattson, his uncle says he must beat you first;
 * you battle his Ralts (flag wally-battle). Beating Wattson gives the Dynamo Badge (badge 19:
 * Pokémon up to Lv. 35 obey in Hoenn) and TM34 Shock Wave, then `ending(31)`. The road north (Route 111)
 * opens in chapter 32, the roads west (Route 117) and east (Route 118) in chapter 33.
 */
(() => {
  const T = s => G.T(s);
  const WALLY = { name: 'Wally' }, UNCLE = { name: "Wally's Uncle" }, WATTSON = { name: 'Wattson' };
  const HOENN = { region: 'hoenn' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  G.Maps.def(Object.assign({
    id: 'mauville', loc: 'mauville-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT,,TT',
      'T...........................,,.T',
      'T...........................,,.T',
      'T............GGGGGG.........,,.T',
      'T..CCCCC.....GGGGGG....MMMM.,,.T',
      'T..CCCCC.....GGGGGG....MMMM.,,.T',
      'T..CCCCC.....GGGGGG....MDMM.,,.T',
      'T..CCDCC.....GGDGGG.....,...,,ST',
      'T....,......S.,,,,.S........,,.T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.S...........,,,,...........S.T',
      'T.............,,,,.............T',
      'T..HHHH.BBBBBB,,,,......HHHH...T',
      'T..HHHH.BBBBBB,,,,......HHHH...T',
      'T..HDHH.BBBBBB,,,,......HDHH...T',
      'T...,...BBDBBB,,,,.......,.....T',
      'T.........,...,,,,.............T',
      'T.............,,,,.............T',
      'T.............,,,,..fff........T',
      'T.............,,,,.............T',
      'T.............,,,,.............T',
      'T.............,,,,.............T',
      'TTTTTTTTTTTTTT,,,,TTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route110', offset: 4 }, north: { map: 'route111', offset: 18 },
               west: { map: 'route117', offset: 3 }, east: { map: 'route118', offset: 0 } },
    warps: [
      { x: 15, y: 7, to: 'mauville-gym', spot: 'door' },
      { x: 5, y: 7, to: 'mauville-center', spot: 'door' },
      { x: 24, y: 6, to: 'mauville-mart', spot: 'door' },
      { x: 4, y: 15, to: 'rydel-cycles', spot: 'door' },
      { x: 25, y: 15, to: 'mauville-house', spot: 'door' },
      { x: 10, y: 16, locked: 'mauville.game-corner' }
    ],
    spots: { 'gym-door': [15, 8, 'down'], 'center-door': [5, 8, 'down'], 'mart-door': [24, 7, 'down'], 'rydel-door': [4, 16, 'down'],
             'house-door': [25, 16, 'down'] },
    signs: {
      '12,8': 'Mauville City. The bright and shining city of fun!',
      '19,8': 'Mauville City Pokémon Gym. Leader: Wattson, the cheerfully electrifying man!',
      '2,11': 'West: Route 117 and Verdanturf Town.',
      '29,11': 'East: Route 118. You will need a Pokémon that can Surf to cross it.',
      '30,7': 'North: Route 111, to Route 112 and Mt. Chimney.'
    },
    triggers: [{ x: 14, y: 11, w: 4, h: 1, if: ['badge:18', '!wally-battle'], script: 'mauville.wally' }],
    npcs: [
      { id: 'wally', who: 'wally', x: 15, y: 9, dir: 'down', if: ['badge:18', '!wally-battle'], script: 'mauville.wally' },
      { id: 'uncle', who: 'gentleman', x: 16, y: 9, dir: 'down', if: ['badge:18', '!wally-battle'], script: 'mauville.wally' },
      { id: 'boy', who: 'youngster', x: 9, y: 19, move: 'wander', r: 2,
        say: 'Mauville is the crossroads of Hoenn. Roads go out in every direction from here!' },
      { id: 'woman', who: 'lass', x: 28, y: 18, move: 'look',
        say: 'Wattson built a lot of this city himself. He laughs so loud you can hear him from the Pokémon Center!' },
      { id: 'man', who: 'gentleman', x: 21, y: 12, move: 'look',
        say: 'The Game Corner is closed while they rebuild it. Shame, I was on a lucky streak!' }
    ]
  }, HOENN));

  G.Maps.center('mauville-center', {
    loc: 'mauville-city', exit: { map: 'mauville', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'Ground types cannot be hurt by Electric moves at all. Wattson hates seeing them walk into his Gym!' }]
  }).region = 'hoenn';

  G.Maps.mart('mauville-mart', {
    loc: 'mauville-city', exit: { map: 'mauville', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'escape-rope', 'repel', 'x-speed', 'x-attack', 'x-defense', 'guard-spec'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'Paralyze Heal is a must against Electric types. Being paralyzed is the worst!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'rydel-cycles', loc: 'mauville-city', tileset: 'indoor', palette: 'mart', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbbb__bbbbb', '___________', '__ttt______', '___________', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'mauville', spot: 'rydel-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'rydel', who: 'biker', x: 7, y: 3, dir: 'down', script: 'mauville.rydel' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'mauville-house', loc: 'mauville-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'mauville', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'When I was young, Mauville was just a few houses at a crossroads. Then Wattson came, and the city lit up!' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'mauville-gym', loc: 'mauville-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'mauville', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'mauville.gym-guide' }],
    trainers: [
      { id: 'kirk', who: 'rocker', cls: 'guitarist', name: 'Kirk', x: 3, y: 8, dir: 'right', sight: 3, team: [['electrike', 19], ['voltorb', 19]],
        before: 'My guitar and my Pokémon run on the same thing: pure electricity! Rock on!',
        defeat: 'My strings snapped...',
        after: 'Wattson laughs every time he battles. Win or lose, he just loves it.' },
      { id: 'vivian', who: 'battlegirl', cls: 'battle-girl', name: 'Vivian', x: 9, y: 5, dir: 'left', sight: 3, team: [['meditite', 19], ['magnemite', 19]],
        before: 'I came to this Gym to learn to fight against electricity. Let me show you what I learned!',
        defeat: 'Shocking...',
        after: 'Magneton is three Magnemite stuck together. Its Electric and Steel types make it tough to hurt.' },
      { id: 'wattson', who: 'wattson', cls: 'leader', name: 'Wattson', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 1 },
        team: [['voltorb', 20, ['rollout', 'spark', 'self-destruct', 'shock-wave']],
               ['electrike', 20, ['shock-wave', 'quick-attack', 'howl', 'thunder-wave']],
               ['magneton', 22, ['supersonic', 'shock-wave', 'thunder-wave', 'sonic-boom']],
               ['manectric', 24, ['quick-attack', 'shock-wave', 'thunder-wave', 'howl']]],
        before: 'Wahahahah! So you are the Champion everyone is talking about! I am Wattson, the Leader of the Mauville Gym. I will electrify you good!',
        defeat: 'Wahahahah! Well, I was the one who got electrified! You are the real deal!',
        win: 'mauville.wattson-win',
        afterScript: [['say', 'Wahahahah! Come back any time. My Gym and I will always have a jolt for you!', WATTSON]] }
    ]
  }, HOENN));

  // ---------------- Wally ----------------
  async function wally(h) {
    const F = G.Field;
    if (F.flag('wally-battle')) return;
    h.face('player', 'up');
    await h.say(T('Uncle, please! I want to challenge the Gym! Ralts and I have been training every day!'), WALLY);
    await h.say(T('Wally, you only just caught your first Pokémon. A Gym Leader is a different matter.'), UNCLE);
    h.emote('wally', '!');
    await h.say(T('Oh! {player}! You are the one who helped me catch Ralts!'), WALLY);
    await h.say(T('Then this is the deal, Wally: battle {player}. If you can hold your own, we will talk about the Gym.'), UNCLE);
    await h.say(T('All right... {player}, please battle me! I want to see how strong Ralts has become!'), WALLY);
    const out = await h.battle({ id: 'wally-mauville', who: 'wally', name: 'Wally', prize: 30, ai: 'basic', team: [['ralts', 16]] }, {});
    if (out === 'lose') return;
    F.setFlag('wally-battle');
    await h.say(T('I lost... But Ralts did its best. I will train more, and one day I will catch up with you!'), WALLY);
    await h.say(T('That was a good battle, Wally. Come, let us go home to Verdanturf. {player}, thank you for being so kind to him.'), UNCLE);
    h.hide('wally'); h.hide('uncle');
  }

  G.Script.def({
    'mauville.wally': [['js', wally]],
    'mauville.game-corner': [['say', 'The Game Corner is closed for renovations. "Reopening soon!" says a sign on the door.']],
    'mauville.rydel': [
      ['say', 'Welcome to Rydel\'s Cycles! The best bikes in Hoenn, made right here!'],
      ['if', 'has:bicycle', [
        ['say', 'Oh, you already have a Bicycle from Kanto? Then you are all set. Ride safely, and come back when you want to talk bikes!']
      ], [
        ['say', 'Hmm, we are all sold out today. Come back another time!']
      ]]
    ],
    'mauville.gym-guide': [
      ['say', 'Yo, Champion! Wattson uses Electric-type Pokémon. Water and Flying types should stay away!'],
      ['say', 'Ground types do not take any damage from Electric moves. A Geodude from Granite Cave, or a Marshtomp, would laugh at this Gym!'],
      ['say', 'Watch out for paralysis, too. Bring Paralyze Heals!']
    ],
    'mauville.wattson-win': [
      ['say', 'Wahahahah! Take the Dynamo Badge. You earned every spark of it!', WATTSON],
      ['badge', 19],
      ['jingle', 'badge'],
      ['say', '{player} received the Dynamo Badge from Wattson!'],
      ['say', 'With three Hoenn badges, Pokémon up to level 35 will obey you, wherever they come from.', WATTSON],
      ['say', 'And this one is on me: TM34, Shock Wave. An electric jolt that never misses! Wahahahah!', WATTSON],
      ['giveItem', 'tm34', 1],
      // The end of the thirty-first chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(31) : G.Field.setFlag('chapter-31-done'))]
    ]
  });
})();
