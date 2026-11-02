/* ============ lilycove.js — Route 121, Lilycove City, Route 122, Mt. Pyre ============
 * Chapter 35. South of Route 120, Route 121 passes the Safari Zone's gate (closed for now) and runs east
 * to Lilycove City: a Department Store over two floors, a Pokémon Center, the Contest Hall (closed),
 * the Museum, houses, a harbour, and a cave in the cove that a Team Aqua grunt guards. In front of the
 * Department Store the rival battles you (flag rival3-lilycove). The sea south of Route 121 is Route
 * 122, around Mt. Pyre's island: inside, graves and two Trainers; on the summit, a Team Aqua grunt and a
 * Team Magma grunt, then Archie and Maxie at the altar take the Blue Orb and the Red Orb (flag
 * orbs-taken) while its old guardians look on, then `ending(35)`. Once the orbs are gone, the grunt leaves
 * the cove and the cave leads into Team Aqua's hideout; the sea east of town is Route 124 (mossdeep.js).
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const ARCHIE = { name: 'Archie' }, MAXIE = { name: 'Maxie' }, OLDMAN = { name: 'Old Man' }, OLDWOMAN = { name: 'Old Woman' };
  const RIVAL3 = { name: '{rival3}' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 121 ----------------
  G.Maps.def(Object.assign({
    id: 'route121', loc: 'hoenn-route-121', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T.......,,............................TTTTTT',
      'T.""""".,,."""""""..........""""""""".TTTTTT',
      'T.""""".,,."""""""..BBBBBB..""""""""".TTTTTT',
      'T.""""".,,."""""""..BBBBBB..""""""""".TTTTTT',
      'T.""""".,,."""""""..BBBBBB.."""""""""......T',
      'T.""""".,,."""""""..BBDBBBS."""""""""......T',
      'T.""""".,,............,....................T',
      'T.......,,S...........,....................T',
      'T.......,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.......,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T............."""""""""""..................T',
      'T............."""""""""""..................T',
      'T............."""""""""""..................T',
      'T::::::::::::::::::::::::::::::::::::::::::T',
      'T::::::::::::::::::::::::::::::::::::::::::T',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route120', offset: -13 }, east: { map: 'lilycove', offset: 0 }, south: { map: 'route122', offset: 6 } },
    warps: [{ x: 22, y: 6, locked: 'route121.safari' }],
    signs: {
      '10,8': 'Route 121. North: Route 120. East: Lilycove City. South, across the sea: Route 122 and Mt. Pyre.',
      '26,6': 'Safari Zone. Meet the Pokémon of all Hoenn in one place!'
    },
    trainers: [
      { id: 'marcel', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Marcel', x: 12, y: 8, dir: 'down', sight: 1, team: [['manectric', 31], ['shiftry', 32]],
        before: 'I am training on my way to Lilycove. You will make a good warm-up!',
        defeat: 'Some warm-up that was...',
        after: 'Lilycove has the biggest Department Store in Hoenn. Stock up before you go anywhere dangerous.' },
      { id: 'cristin', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Cristin', x: 30, y: 8, dir: 'down', sight: 1, team: [['loudred', 31], ['linoone', 31]],
        before: 'My Loudred has the loudest voice on this road. Cover your ears!',
        defeat: 'Ears still ringing...',
        after: 'Loudred can knock over a truck with its shout. Or so it likes to think.' },
      { id: 'jessica', who: 'beauty', cls: 'beauty', name: 'Jessica', x: 5, y: 11, dir: 'up', sight: 1, team: [['kecleon', 30], ['seviper', 31]],
        before: 'Did you see my Kecleon? No? That is because it is right behind you!',
        defeat: 'Seen through...',
        after: 'Seviper\'s tail is as sharp as a blade. It keeps it polished on the rocks.' },
      { id: 'walter', who: 'gentleman', cls: 'gentleman', name: 'Walter', x: 35, y: 12, dir: 'up', sight: 2, team: [['manectric', 32]],
        before: 'A stroll by the sea is lovely, but a battle by the sea is even better.',
        defeat: 'A gentleman knows when he is beaten.',
        after: 'From the beach you can see Mt. Pyre out at sea. It always seems to be covered in mist.' }
    ],
    items: [{ x: 1, y: 1, item: 'ultra-ball', flag: 'route121-ultraball' }, { x: 42, y: 13, item: 'hyper-potion', flag: 'route121-hyperpotion' }],
    encounters: { walk: '@hoenn-route-121-area', water: '@hoenn-route-121-area' }
  }, HOENN));

  // ---------------- Lilycove City ----------------
  G.Maps.def(Object.assign({
    id: 'lilycove', loc: 'lilycove-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..........................................T',
      'T..........fff......................TTTTTT.T',
      'T..........fff..EEEEEEEE....BBBBBB..TTTTTT.T',
      'T...CCCCC..fff..EEEEEEEE....BBBBBB..TTTTTT.T',
      'T...CCCCC..fff..EEEEEEEE....BBBBBB..TTTTTT.T',
      'T...CCCCC.......EEEEEEEE....BBDBBB..TTTTTT.T',
      'T...CCDCC.......EEEDEEEE......,...S........T',
      'T.....,.....S......,....S.....,............T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T..........................................T',
      'T..........................................T',
      'T..........................................T',
      'T...BBBBBB.................................T',
      'T...BBBBBB....HHHH.......HHHH..............T',
      'T...BBBBBB....HHHH.......HHHH......########T',
      'T...BBDBBB....HDHH.......HDHH......########T',
      'T.....,........,..........,........########T',
      'T..................................########T',
      'T..................................###O####T',
      'T::::::::::::::::::::::::::::::::::::::::::T',
      'T::::::::::::::::::::::::::::::::::::::::::T',
      '~~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { west: { map: 'route121', offset: 0 }, east: { map: 'route124', offset: 23 } },
    warps: [
      { x: 19, y: 7, to: 'dept-store-1f', spot: 'door' },
      { x: 6, y: 7, to: 'lilycove-center', spot: 'door' },
      { x: 30, y: 6, locked: 'lilycove.contest' },
      { x: 6, y: 17, to: 'lilycove-museum', spot: 'door' },
      { x: 15, y: 17, to: 'lilycove-house', spot: 'door' },
      { x: 26, y: 17, to: 'lilycove-house2', spot: 'door' },
      { x: 38, y: 20, to: 'aqua-hideout-1f', spot: 'door', locked: 'lilycove.cave', if: 'orbs-taken' }
    ],
    spots: { 'center-door': [6, 8, 'down'], 'dept-door': [19, 8, 'down'], 'museum-door': [6, 18, 'down'], 'house-door': [15, 18, 'down'],
             'house2-door': [26, 18, 'down'], hideout: [38, 21, 'down'] },
    signs: {
      '12,8': 'Lilycove City. Where the land ends and the sea begins.',
      '24,8': 'Lilycove Department Store. Everything a Trainer could wish for, under one roof!',
      '34,7': 'Pokémon Contest Hall. The stage where Pokémon show off their charm.'
    },
    triggers: [{ x: 14, y: 9, w: 12, h: 2, if: '!rival3-lilycove', script: 'lilycove.rival' }],
    npcs: [
      { id: 'boy', who: 'youngster', x: 10, y: 12, move: 'wander', r: 2,
        say: 'The Department Store has five... no, two floors! It just feels like five when you are shopping with my mum.' },
      { id: 'girl', who: 'lass', x: 34, y: 13, move: 'look',
        say: 'Lilycove is where the land runs out. Past the beach, it is nothing but sea all the way to Mossdeep City.' },
      { id: 'sailor', who: 'sailor', x: 22, y: 20, move: 'look',
        say: 'The ferry is not running right now. Some trouble out at sea, they say. Sorry, kid.' },
      { id: 'fisher', who: 'fisherman', x: 20, y: 26, dir: 'down',
        say: 'Wailmer swim into the bay at dawn. One day I will see a Wailord too: they are as big as a ship!' },
      { id: 'grunt', who: 'aqua', x: 38, y: 21, dir: 'down', if: '!orbs-taken', script: 'lilycove.cave' },
      { id: 'may', who: 'may', x: 20, y: 12, dir: 'up', if: ['!rival3-lilycove', 'rival3=may'], script: 'lilycove.rival' },
      { id: 'brendan', who: 'brendan', x: 20, y: 12, dir: 'up', if: ['!rival3-lilycove', 'rival3=brendan'], script: 'lilycove.rival' }
    ],
    encounters: { water: '@lilycove-city-area' }
  }, HOENN));

  G.Maps.center('lilycove-center', {
    loc: 'lilycove-city', exit: { map: 'lilycove', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'Mt. Pyre is the island you can see from the beach. People go there to remember the Pokémon who have passed away.' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'dept-store-1f', loc: 'lilycove-city', tileset: 'indoor', palette: 'mart', music: 'mart', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', 'p+bb+++++bb+^+', '++++++++++++++', '++++++++++++++', '++++++++++++++', 'p++++++++++++p',
           '++++++X+++++++'],
    warps: [{ x: 6, y: 7, to: 'lilycove', spot: 'dept-door' }, { x: 12, y: 2, to: 'dept-store-2f', spot: 'from-below' }],
    spots: { door: [6, 7, 'up'], 'from-above': [12, 3, 'down'] },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 5, y: 3, dir: 'down', script: [
        ['say', 'Welcome to the Lilycove Department Store! Poké Balls and medicine are right here. TMs and more are upstairs.'],
        ['shop', ['poke-ball', 'great-ball', 'ultra-ball', 'super-potion', 'hyper-potion', 'max-potion', 'full-restore', 'revive', 'full-heal', 'escape-rope',
                  'max-repel']]
      ] },
      { id: 'lady', who: 'beauty', x: 9, y: 5, move: 'wander', r: 2,
        say: 'I come here every week. There is always something new on the shelves!' },
      { id: 'man', who: 'gentleman', x: 2, y: 5, move: 'look',
        say: 'Max Potions and Full Restores cost a lot, but a Trainer heading into danger should carry a few.' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'dept-store-2f', loc: 'lilycove-city', tileset: 'indoor', palette: 'mart', music: 'mart', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', 'p+bb+++++bb+^+', '++++++++++++++', '++++++++++++++', '++++++++++++++', 'p++++++++++++p'],
    warps: [{ x: 12, y: 2, to: 'dept-store-1f', spot: 'from-above' }],
    spots: { 'from-below': [12, 3, 'down'] },
    npcs: [
      { id: 'tm-clerk', who: 'clerk', x: 2, y: 3, dir: 'down', script: [
        ['say', 'The strongest TMs in Hoenn! Each one teaches its move as often as you like.'],
        ['shop', ['tm14', 'tm25', 'tm38', 'tm15']]
      ] },
      { id: 'x-clerk', who: 'clerk', x: 6, y: 3, dir: 'down', script: [
        ['say', 'X items raise your Pokémon\'s stats during a battle. Perfect for a tough opponent!'],
        ['shop', ['x-attack', 'x-defense', 'x-speed', 'x-sp-atk', 'x-accuracy', 'guard-spec', 'dire-hit']]
      ] },
      { id: 'vitamin-clerk', who: 'clerk', x: 9, y: 3, dir: 'down', script: [
        ['say', 'Vitamins make your Pokémon stronger for good. A little expensive, but worth it!'],
        ['shop', ['hp-up', 'protein', 'iron', 'calcium', 'zinc', 'carbos']]
      ] },
      { id: 'boy', who: 'youngster', x: 7, y: 5, move: 'wander', r: 2,
        say: 'TM15 is Hyper Beam! It is so strong, but my Pokémon has to rest after using it.' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'lilycove-museum', loc: 'lilycove-city', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', '+++++++++++++', '+j++j++j++j++', '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 7, to: 'lilycove', spot: 'museum-door' }],
    spots: { door: [6, 7, 'up'] },
    signs: {
      '1,3': 'A painting of a Wailord leaping out of a calm sea at sunset.',
      '4,3': 'A painting of Mt. Pyre in the morning mist. It feels peaceful, and a little sad.',
      '7,3': 'A painting of two huge Pokémon, one of the land and one of the sea, clashing under a stormy sky. The plate reads: "The Ancient Battle".',
      '10,3': 'A sculpture of a Pokémon made of bright, curving lines. The plate has not been filled in yet.'
    },
    npcs: [{ id: 'curator', who: 'gentleman', x: 6, y: 5, dir: 'down',
             say: 'Welcome to the Lilycove Museum. Our gallery shows Pokémon as artists have seen them through the ages.' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'lilycove-house', loc: 'lilycove-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'lilycove', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'woman', who: 'beauty', x: 7, y: 4, dir: 'left',
             say: 'Ships leave Lilycove\'s harbour for every corner of Hoenn. When the ferry runs again, you can sail anywhere!' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'lilycove-house2', loc: 'lilycove-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'lilycove', spot: 'house2-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'Long ago, they say, the sea and the land fought a terrible battle right here in Hoenn. The old folk on Mt. Pyre know the story.' }]
  }, HOENN));

  // ---------------- Route 122, Mt. Pyre ----------------
  G.Maps.def(Object.assign({
    id: 'route122', loc: 'hoenn-route-122', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~::::::::::::::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::##########::~~~~~~~~',
      '~~~~~~~~::####O#####::~~~~~~~~',
      '~~~~~~~~::::::::::::::~~~~~~~~',
      '~~~~~~~~::::::::::::::~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route121', offset: -6 } },
    warps: [{ x: 14, y: 16, to: 'mt-pyre-1f', spot: 'door' }],
    spots: { pyre: [14, 17, 'down'] },
    encounters: { water: '@hoenn-route-122-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'mt-pyre-1f', loc: 'mt-pyre', tileset: 'indoor', palette: 'ghost', music: 'cave', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW', '+++++++^+++++++', '+++++++++++++++', '+g+g+g+++g+g+g+', '+++++++++++++++', '+g+g+g+++g+g+g+',
           '+++++++++++++++', '+g+g+g+++g+g+g+', '+++++++++++++++', '+++++++++++++++', '+++++++X+++++++'],
    warps: [{ x: 7, y: 11, to: 'route122', spot: 'pyre' }, { x: 7, y: 2, to: 'mt-pyre-summit', spot: 'from-1f' }],
    spots: { door: [7, 11, 'up'], stairs: [7, 3, 'down'] },
    trainers: [
      { id: 'gabrielle', who: 'channeler', cls: 'channeler', name: 'Gabrielle', x: 0, y: 5, dir: 'right', sight: 7, team: [['shuppet', 30], ['duskull', 31]],
        before: 'The spirits here are restless today... Something is happening at the summit.',
        defeat: 'The spirits have gone quiet...',
        after: 'People in red and people in blue climbed to the summit today. The spirits did not like them at all.' },
      { id: 'william', who: 'psychic', cls: 'psychic', name: 'William', x: 14, y: 7, dir: 'left', sight: 7, team: [['spoink', 30], ['natu', 30], ['kirlia', 31]],
        before: 'I came here to meditate among the graves. My mind is clear... and ready for battle.',
        defeat: 'My concentration...',
        after: 'Kirlia can feel the happiness of its Trainer. When I am calm, it is calm too.' }
    ],
    npcs: [{ id: 'granny', who: 'granny', x: 12, y: 9, dir: 'left',
             say: 'Mt. Pyre is where people bring the Pokémon they have lost, so they can rest in peace. Walk quietly, please.' }],
    encounters: { walk: '@mt-pyre-1f' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'mt-pyre-summit', loc: 'mt-pyre', tileset: 'outdoor', palette: 'whirl', music: 'cave', battleBg: 'grass', border: '#',
    rows: [
      '########################',
      '########################',
      '##....................##',
      '##........##S##..####.##',
      '##.""""".........####.##',
      '##.""""".........####.##',
      '##.""""".........####.##',
      '##."""""..............##',
      '##."""""..............##',
      '##....................##',
      '##..............""""""##',
      '##..............""""""##',
      '##"""""".......##"""""##',
      '##"""""".......##"""""##',
      '##""""""........""""""##',
      '##""""""##......""""""##',
      '##""""""##......""""""##',
      '##""""""##......""""""##',
      '##""""""..............##',
      '##....................##',
      '##....................##',
      '############O###########'
    ],
    warps: [{ x: 12, y: 21, to: 'mt-pyre-1f', spot: 'stairs' }],
    spots: { 'from-1f': [12, 20, 'up'] },
    signs: { '12,3': 'A stone altar. Two hollows in it once held a red orb and a blue orb.' },
    triggers: [{ x: 8, y: 8, w: 8, h: 1, if: '!orbs-taken', script: 'pyre.orbs' }],
    trainers: [
      { id: 'aqua', who: 'aqua', cls: 'team-aqua', x: 10, y: 14, dir: 'right', sight: 3, if: '!orbs-taken', team: [['mightyena', 31], ['carvanha', 31]],
        before: 'Our boss is busy up at the altar. Turn around, kid!',
        defeat: 'Sunk again...',
        after: 'Once the boss has that orb, the sea will cover everything!' },
      { id: 'magma', who: 'magma', cls: 'team-magma', x: 14, y: 10, dir: 'left', sight: 3, if: '!orbs-taken', team: [['numel', 32], ['golbat', 31]],
        before: 'Team Magma got here first! Well, almost first. Out of the way!',
        defeat: 'Burned out...',
        after: 'Our leader says the orb will wake the master of the land. Then you will see!' }
    ],
    npcs: [
      { id: 'oldman', who: 'oldman', x: 11, y: 4, dir: 'down', script: 'pyre.oldman' },
      { id: 'oldwoman', who: 'granny', x: 13, y: 4, dir: 'down', script: 'pyre.oldwoman' },
      { id: 'archie', who: 'archie', x: 11, y: 5, dir: 'up', if: 'scripted' },
      { id: 'maxie', who: 'maxie', x: 13, y: 5, dir: 'up', if: 'scripted' }
    ],
    encounters: { walk: '@mt-pyre-summit' }
  }, HOENN));

  // ---------------- Lilycove: the rival ----------------
  const RIVAL_TEAM = {
    252: [['pelipper', 32], ['camerupt', 33], ['grovyle', 34]],
    255: [['pelipper', 32], ['lombre', 32], ['combusken', 34]],
    258: [['lombre', 32], ['camerupt', 33], ['marshtomp', 34]]
  };
  async function rival(h) {
    const F = G.Field, S = F.save, who = F.getVar('rival3') || 'may';
    if (F.flag('rival3-lilycove')) return;
    const me = G.World.player;
    h.emote(who, '!');
    if (me) { await h.walkTo(who, me.x, me.y + 1); h.face(who, 'up'); h.face('player', 'down'); }
    await h.say(T('{player}! I thought I might find you here. This store has everything, doesn\'t it?'), RIVAL3);
    await h.say(T('I came to buy supplies... but a battle first! I want to see how far we have both come.'), RIVAL3);
    const out = await h.battle({ id: 'rival3-lilycove', who, name: who === 'brendan' ? 'Brendan' : 'May', prize: 60, ai: 'basic',
      team: RIVAL_TEAM[S.rival3.starter] || RIVAL_TEAM[255] }, { canLose: true });
    F.setFlag('rival3-lilycove');
    if (out === 'win') await h.say(T('Wow... I really thought I had you this time. You never stop surprising me.'), RIVAL3);
    else await h.say(T('I did it! I finally beat you properly!'), RIVAL3);
    await h.say(T('Dad says Team Aqua and Team Magma were seen heading for Mt. Pyre, the island south of Route 121. Be careful, {player}.'), RIVAL3);
    h.hide(who);
  }

  // ---------------- Mt. Pyre: the orbs ----------------
  async function orbs(h) {
    const F = G.Field;
    if (F.flag('orbs-taken')) return;
    h.place('archie', 11, 5, 'up'); h.show('archie');
    h.place('maxie', 13, 5, 'up'); h.show('maxie');
    await h.walkTo('player', 12, 7);
    h.face('player', 'up');
    await h.say(T('Please, stop! Those orbs must never leave this mountain!'), OLDMAN);
    h.face('archie', 'player');
    await h.say(T('Oh, it is you again. Too late, kid. The Blue Orb is coming with me. With it, the master of the sea will wake from its long sleep.'), ARCHIE);
    h.face('maxie', 'player');
    await h.say(T('And the Red Orb is mine. The master of the land will rise, and the land will grow. This time, Archie, we shall see whose dream comes true.'), MAXIE);
    await h.say(T('Ha! We will see about that, Maxie. Team Aqua, move out!'), ARCHIE);
    h.hide('archie');
    await h.say(T('Team Magma, we are leaving.'), MAXIE);
    h.hide('maxie');
    F.setFlag('orbs-taken');
    h.face('oldwoman', 'player');
    await h.say(T('The Red Orb and the Blue Orb... they hold the hearts of the two ancient Pokémon of land and sea. Long ago, those two fought until the whole world shook.'), OLDWOMAN);
    await h.say(T('If they are woken... no one can say what will become of Hoenn. Young one, please, do whatever you can.'), OLDMAN);
    // The end of the thirty-fifth chapter (credits-ui.js).
    if (G.CreditsUI) G.CreditsUI.ending(35); else F.setFlag('chapter-35-done');
  }

  G.Script.def({
    'lilycove.rival': [['js', rival]],
    'lilycove.contest': [['say', 'The Contest Hall is closed. A note on the door says the stage is being repaired.']],
    'lilycove.cave': [['say', 'This cave belongs to Team Aqua! Nobody gets in. Now beat it, kid!', { name: 'Team Aqua Grunt' }]],
    'route121.safari': [['say', 'The Safari Zone is closed for repairs. Please come back another time.']],
    'pyre.orbs': [['js', orbs]],
    'pyre.oldman': [
      ['if', 'orbs-taken', [
        ['say', 'Without the orbs, the mountain feels empty. I fear what those people will do with them.', OLDMAN]
      ], [
        ['say', 'We have guarded these orbs all our lives. They must never leave this altar.', OLDMAN]
      ]]
    ],
    'pyre.oldwoman': [
      ['if', 'orbs-taken', [
        ['say', 'The two great Pokémon have slept for a very long time. Let us pray they stay asleep.', OLDWOMAN]
      ], [
        ['say', 'The Red Orb and the Blue Orb rest here, side by side, keeping the peace between land and sea.', OLDWOMAN]
      ]]
    ]
  });
  G.Hoenn.RIVAL_TEAM_LILYCOVE = RIVAL_TEAM;
})();
