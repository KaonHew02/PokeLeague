/* ============ jubilife.js — Route 202, Jubilife City, Team Galactic ============
 * Chapter 45. Route 202, north of Sandgem Town (open once the Pokédex records Sinnoh, sandgem.js):
 * the first time you walk in, Professor Rowan's assistant ({assistant}) shows how a wild Bidoof is
 * caught in Sinnoh (flag route202-demo); three Trainers. Jubilife City: a Pokémon Center, a Mart, the
 * Trainers' School (the blackboard on Sinnoh's new ways to evolve; two School Kids), a condominium;
 * Jubilife TV and the Pokétch Company are closed; Route 204 to the north opens with the Coal Badge (chapter 46).
 * Coming in from Route 202, two Team Galactic grunts are pressing the assistant for Rowan's research
 * on evolution: you battle one, the assistant beats the other, they run (flag galactic-jubilife).
 * Route 203 to the east leads on to Oreburgh City (oreburgh.js). Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const ASSIST = { name: '{assistant}' }, GRUNT = { name: 'Team Galactic Grunt' };
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const asst = () => G.Sinnoh.asst();

  // ---------------- Route 202 ----------------
  G.Maps.def(Object.assign({
    id: 'route202', loc: 'sinnoh-route-202', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTT,,TTTTTTTTT',
      'T........,,........T',
      'T........,,........T',
      'T."""""..,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,..""""".T',
      'T."""""..,,........T',
      'T........,,........T',
      'T.ff.....,,.TT.....T',
      'T........,,.TT..TT.T',
      'T........,,.....TT.T',
      'T."""""".,,........T',
      'T."""""".,,........T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T........,,."""""".T',
      'T....TT..,,."""""".T',
      'T....TT..,,........T',
      'T........,,........T',
      'T..""""".,,........T',
      'T..""""".,,."""""..T',
      'T..""""".,,."""""..T',
      'T..""""".,,."""""..T',
      'T........,,S.......T',
      'T.f......,,.....ff.T',
      'TTTTTTTTT,,TTTTTTTTT'
    ],
    connect: { south: { map: 'sandgem', offset: -3 }, north: { map: 'jubilife', offset: -8 } },
    signs: { '11,25': 'Route 202. North: Jubilife City. South: Sandgem Town.' },
    triggers: [{ x: 1, y: 26, w: 18, h: 1, if: '!route202-demo', script: 'jubilife.demo' }],
    npcs: [
      // Shown by the catching demonstration.
      { id: 'dawn', who: 'dawn', x: 10, y: 24, dir: 'down', if: 'scripted' },
      { id: 'lucas', who: 'lucas', x: 10, y: 24, dir: 'down', if: 'scripted' },
      { id: 'bidoof', who: 'bidoof', mon: 'bidoof', x: 12, y: 23, dir: 'left', fixed: true, if: 'scripted' }
    ],
    trainers: [
      { id: 'tristan', who: 'youngster', cls: 'youngster', name: 'Tristan', x: 8, y: 9, dir: 'right', sight: 2, team: [['bidoof', 6], ['starly', 6]],
        before: 'You came up from Sandgem? Then you have to battle me. Those are the rules of Route 202!',
        defeat: 'I made the rules up anyway...',
        after: 'Bidoof look sleepy, but they are tougher than they seem.' },
      { id: 'logan', who: 'youngster', cls: 'youngster', name: 'Logan', x: 11, y: 7, dir: 'left', sight: 2, team: [['kricketot', 6], ['bidoof', 6]],
        before: 'Listen to my Kricketot! It knocks its antennae together like a little drum!',
        defeat: 'The song is over...',
        after: 'When Kricketot evolves, it plays a real melody. I cannot wait.' },
      { id: 'natalie', who: 'lass', cls: 'lass', name: 'Natalie', x: 11, y: 20, dir: 'left', sight: 2, team: [['shinx', 7]],
        before: 'My Shinx sparks when it is happy. Let me show you how happy it gets in a battle!',
        defeat: 'Oh, the sparks went out.',
        after: 'Shinx glow in the dark. At night the grass here twinkles with them.' }
    ],
    encounters: { walk: '@sinnoh-route-202-area' }
  }, SINNOH));

  // ---------------- Jubilife City ----------------
  G.Maps.def(Object.assign({
    id: 'jubilife', loc: 'jubilife-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTTTT',
      'T................,.................T',
      'T................,,................T',
      'T..BBBBBB........,,................T',
      'T..BBBBBB....ff..,,....BBBBBB......T',
      'T..BBBBBB....ff..,,....BBBBBB......T',
      'T..BBDBBB........,,....BBBBBB......T',
      'T....,...........,,....BBDBBB......T',
      'T....,...........,,......,.........T',
      'T....,...........,,......,.........T',
      'T....,...........,,......,.....ff..T',
      'T....,...........,,......,.........T',
      'T....,.........S.,,......,.........T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T................,,................T',
      'T..BBBBBB........,,..CCCCC.........T',
      'T..BBBBBB........,,..CCCCC..MMMM...T',
      'T..BBBBBB........,,..CCCCC..MMMM...T',
      'T..BBDBBB........,,..CCDCC..MDMM...T',
      'T....,,,,,,,,,,,,,,,,,,,,,,,,,.....T',
      'T................,,................T',
      'T.........HHHH...,,................T',
      'T.........HHHH...,,................T',
      'T.ff......HDHH...,,................T',
      'T..........,,,,,,,,.........fff....T',
      'T................,,................T',
      'T................,,.S..............T',
      'T................,,................T',
      'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route202', offset: 8 }, east: { map: 'route203', offset: 7 }, north: { map: 'route204s', offset: 8 } },
    warps: [
      { x: 5, y: 6, locked: 'jubilife.tv' },
      { x: 25, y: 7, locked: 'jubilife.poketch' },
      { x: 5, y: 19, to: 'jubilife-school', spot: 'door' },
      { x: 23, y: 19, to: 'jubilife-center', spot: 'door' },
      { x: 29, y: 19, to: 'jubilife-mart', spot: 'door' },
      { x: 11, y: 24, to: 'jubilife-condo', spot: 'door' }
    ],
    spots: { 'school-door': [5, 20, 'down'], 'center-door': [23, 20, 'down'], 'mart-door': [29, 20, 'down'], 'condo-door': [11, 25, 'down'] },
    signs: {
      '15,12': 'Jubilife City. The busiest city in Sinnoh, where people and Pokémon come together.',
      '20,27': 'Trainer Tips: the Oreburgh Gym is east of here, past Route 203 and Oreburgh Gate.'
    },
    triggers: [{ x: 1, y: 26, w: 34, h: 1, if: '!galactic-jubilife', script: 'jubilife.galactic' }],
    npcs: [
      // Route 204 opens with the Coal Badge (chapter 46, floaroma.js).
      { id: 'worker', who: 'engineer', x: 17, y: 1, dir: 'down', if: '!badge:25',
        say: 'Rocks came down on the path to Route 204. We are clearing them, but it will take a while!' },
      // Team Galactic and the assistant, until you step in.
      { id: 'dawn', who: 'dawn', x: 17, y: 22, dir: 'down', if: ['!galactic-jubilife', '!gender=f'], script: 'jubilife.galactic' },
      { id: 'lucas', who: 'lucas', x: 17, y: 22, dir: 'down', if: ['!galactic-jubilife', 'gender=f'], script: 'jubilife.galactic' },
      { id: 'grunt1', who: 'galactic', x: 16, y: 23, dir: 'up', if: '!galactic-jubilife', script: 'jubilife.galactic' },
      { id: 'grunt2', who: 'galactic', x: 18, y: 23, dir: 'up', if: '!galactic-jubilife', script: 'jubilife.galactic' },
      { id: 'boy', who: 'youngster', x: 12, y: 10, move: 'wander', r: 2,
        say: 'Jubilife has a TV station and the company that makes the Pokétch. It is the place to be in Sinnoh!' },
      { id: 'lady', who: 'beauty', x: 27, y: 12, move: 'look', if: 'galactic-jubilife',
        say: 'Team Galactic? They talk about making a brand-new world. Strange people, if you ask me.' },
      { id: 'man', who: 'gentleman', x: 30, y: 22, move: 'look',
        say: 'Route 203 is east of the city. Past it, a tunnel through the mountain leads to Oreburgh City.' }
    ]
  }, SINNOH));

  G.Maps.center('jubilife-center', {
    loc: 'jubilife-city', exit: { map: 'jubilife', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'The Gym Leader in Oreburgh uses Rock-type Pokémon. Water and Grass moves are the way to go!' }]
  }).region = 'sinnoh';

  G.Maps.mart('jubilife-mart', {
    loc: 'jubilife-city', exit: { map: 'jubilife', spot: 'mart-door' },
    stock: ['poke-ball', 'potion', 'antidote', 'paralyze-heal', 'awakening', 'escape-rope', 'repel'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'A Repel keeps weak wild Pokémon away for a while. Very handy in a long cave!' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'jubilife-school', loc: 'jubilife-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'qq_____bbbbbb', '_____________', '_ttt___ttt___', '_____________', '_ttt___ttt___', '_____________',
           '______X______'],
    warps: [{ x: 6, y: 8, to: 'jubilife', spot: 'school-door' }],
    spots: { door: [6, 8, 'up'] },
    signs: { '0,2': 'The blackboard says: "Some Pokémon evolve when they level up holding an item, some only by day or only by night, and some once they know a certain move."',
             '1,2': 'The blackboard says: "The Shiny Stone, the Dusk Stone and the Dawn Stone each make certain Pokémon evolve."' },
    npcs: [{ id: 'teacher', who: 'lass', x: 5, y: 2, dir: 'down', script: 'jubilife.teacher' }],
    trainers: [
      { id: 'harrison', who: 'youngster', cls: 'school-kid', name: 'Harrison', x: 4, y: 3, dir: 'down', sight: 1, team: [['bidoof', 7], ['kricketot', 7]],
        before: 'Today we are learning about battles. Will you be my homework?',
        defeat: 'I think I failed that test...',
        after: 'I will read the blackboard again. Twice!' },
      { id: 'christine', who: 'lass', cls: 'school-kid', name: 'Christine', x: 10, y: 5, dir: 'left', sight: 1, team: [['starly', 7], ['shinx', 8]],
        before: 'I got top marks in type matchups. Let me prove it!',
        defeat: 'Top marks are not everything, I guess.',
        after: 'Electric moves are great against Flying types. That part I got right!' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'jubilife-condo', loc: 'jubilife-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'jubilife', spot: 'condo-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'gentleman', x: 7, y: 4, dir: 'left',
             say: 'My neighbor works at the Pokétch Company. They are making a watch for Trainers, full of handy little apps.' }]
  }, SINNOH));

  // ---------------- the catching demonstration on Route 202 ----------------
  async function demo(h) {
    const F = G.Field, a = asst();
    if (F.flag('route202-demo')) return;
    h.show(a);
    h.emote(a, '!');
    await h.say(T('{player}! The professor asked me to see you off. Jubilife City is just north of here.'), ASSIST);
    h.show('bidoof');
    await h.say(T('Oh, a wild Bidoof! You have caught plenty of Pokémon, I know. But let me show you how we do it in Sinnoh!'), ASSIST);
    await h.say(T('{assistant} sent out a Pokémon and wore the Bidoof down, then threw a Poké Ball...'));
    h.hide('bidoof');
    const j = h.jingle('item');
    await h.say(T('Gotcha! The wild Bidoof was caught!'));
    await j;
    await h.say(T('Weaken it first, then throw. A sleeping or paralyzed Pokémon is even easier to catch!'), ASSIST);
    await h.say(T('I will go on ahead to Jubilife City. See you there!'), ASSIST);
    F.setFlag('route202-demo');
    h.hide(a);
  }

  // ---------------- Team Galactic in Jubilife ----------------
  async function galactic(h) {
    const F = G.Field, a = asst();
    if (F.flag('galactic-jubilife')) return;
    h.emote(a, '!');
    await h.say(T("Come on, hand it over! Professor Rowan's notes on evolution. Team Galactic has a use for them."), GRUNT);
    await h.say(T('{player}! Over here! These two will not leave me alone!'), ASSIST);
    h.face('grunt1', 'down'); h.face('grunt2', 'down');
    await h.say(T('Who are you, another Trainer? Then we will deal with you both. You are mine!'), GRUNT);
    const out = await h.battle({ id: 'grunt-jubilife', who: 'galactic', cls: 'team-galactic', name: '', team: [['glameow', 8]] }, {});
    if (out !== 'win') return;
    await h.say(T('At the same time, {assistant} beat the other grunt!'));
    await h.say(T('Beaten by two kids? This is not over. Team Galactic will remember you!'), GRUNT);
    await h.fade('out', 0.4);
    h.hide('grunt1'); h.hide('grunt2');
    F.setFlag('galactic-jubilife');
    await h.fade('in', 0.4);
    await h.say(T("Thank you, {player}! Why would anyone want the professor's research? I will tell him right away."), ASSIST);
    await h.say(T('Barry ran east to Route 203, looking for you. The first Gym of Sinnoh is in Oreburgh City, past Oreburgh Gate at the end of the route.'), ASSIST);
    h.hide(a);
  }

  G.Script.def({
    'jubilife.demo': [['js', demo]],
    'jubilife.galactic': [['js', galactic]],
    'jubilife.tv': [['say', 'Jubilife TV. The doors are shut: a show is being filmed inside.']],
    'jubilife.poketch': [['say', 'The Pokétch Company. A sign on the door says: "Our watch for Trainers is coming soon!"']],
    'jubilife.teacher': [
      ['say', 'Welcome to the Trainers\' School! In Sinnoh, even a Champion can learn something new.'],
      ['say', 'Here, Pokémon evolve in ways you may not have seen: holding an item at night, or once they know a certain move. Have a look at the blackboard!']
    ]
  });
})();
