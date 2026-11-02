/* ============ lavaridge.js — Mt. Chimney, the Jagged Pass, Lavaridge Town and Flannery's Gym ============
 * Chapter 32, the end of the chapter. Once Team Magma has left Meteor Falls (fallarbor.js, flag
 * meteorite-stolen), the cable car on Route 112 goes up to the summit of Mt. Chimney. There Team Aqua
 * keeps Team Magma's grunts busy; you battle two grunts, the Admin Tabitha, then Maxie at the machine
 * that holds the meteorite by the crater. Beaten, he gives it up and Team Magma leaves (flag
 * maxie-beaten, key item meteorite). The Jagged Pass goes down over ledges (one way) to Lavaridge Town:
 * hot springs (an old woman gives an Egg found in the warm sand), a Pokémon Center, a Mart, a house,
 * and Flannery's Gym (Fire types). The Heat Badge (badge 20: Pokémon up to Lv. 40 obey in Hoenn) and
 * TM50 Overheat; outside the Gym the rival brings Go-Goggles from Professor Birch (flag
 * rival3-goggles), then `ending(32)`. Lavaridge's east road goes down a ledge onto Route 112.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const MAXIE = { name: 'Maxie' }, ARCHIE = { name: 'Archie' }, TABITHA = { name: 'Tabitha' }, FLANNERY = { name: 'Flannery' };
  const RIVAL3 = { name: '{rival3}' }, GRANNY = { name: 'Old Woman' }, ATTENDANT = { name: 'Attendant' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const STATION = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p+++++++++p', '+++++++++++', '++t+++++t++', '+++++++++++', '+++++X+++++'];

  // ---------------- the cable car's top station, Mt. Chimney ----------------
  G.Maps.def(Object.assign({
    id: 'cable-car-top', loc: 'mt-chimney', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
    rows: STATION,
    warps: [{ x: 5, y: 6, to: 'mt-chimney', spot: 'station-door' }],
    spots: { door: [5, 6, 'up'], car: [5, 4, 'down'] },
    npcs: [{ id: 'attendant', who: 'clerk', x: 5, y: 3, dir: 'down', script: 'chimney.car-down' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'mt-chimney', loc: 'mt-chimney', tileset: 'outdoor', palette: 'fiery', music: 'route', battleBg: 'cave', border: '#',
    rows: [
      '##############################',
      '#........#~~~~~~~~~~#........#',
      '#........#~~~~~~~~~~#.######.#',
      '#........#~~~~~~~~~~#.######.#',
      '#........#~~~~~~~~~~#.######.#',
      '#........############.######.#',
      '#.BBBBBB...##..S###..........#',
      '#.BBBBBB...##...###..........#',
      '#.BBBBBB...##...###..........#',
      '#.BBDBBB...##...###..........#',
      '#............................#',
      '#............................#',
      '#............................#',
      '#............................#',
      '#............................#',
      '#............................#',
      '######.......................#',
      '######.................#######',
      '######...........S.....#######',
      '######.................#######',
      '######.................#######',
      '#############...##############'
    ],
    connect: { south: { map: 'jagged-pass', offset: 5 } },
    warps: [{ x: 4, y: 9, to: 'cable-car-top', spot: 'door' }],
    spots: { 'station-door': [4, 10, 'down'] },
    signs: {
      '15,6': 'A machine Team Magma left behind. There is an empty slot in it, just the size of a meteorite.',
      '17,18': 'Mt. Chimney. South: the Jagged Pass, down to Lavaridge Town.'
    },
    triggers: [{ x: 13, y: 9, w: 3, h: 1, if: '!maxie-beaten', script: 'chimney.maxie' }],
    trainers: [
      { id: 'grunt1', who: 'magma', cls: 'team-magma', x: 8, y: 13, dir: 'right', sight: 4, if: '!maxie-beaten', team: [['poochyena', 21], ['numel', 21]],
        before: 'You came up on the cable car? Too bad: Team Magma owns this mountain today!',
        defeat: 'Melted...',
        after: 'The boss says the meteorite will wake up the volcano. Then the land will grow and grow!' },
      { id: 'grunt2', who: 'magma', cls: 'team-magma', x: 21, y: 11, dir: 'left', sight: 4, if: '!maxie-beaten', team: [['zubat', 21], ['poochyena', 22]],
        before: 'Not one step closer to the crater! The boss is busy!',
        defeat: 'Too hot to handle...',
        after: 'Team Aqua thinks the sea should cover everything. We know better: people need land!' },
      { id: 'tabitha', who: 'tabitha', cls: 'magma-admin', name: 'Tabitha', x: 14, y: 10, dir: 'down', sight: 0, if: '!maxie-beaten',
        team: [['numel', 21], ['poochyena', 21], ['zubat', 23]],
        before: 'Hold it right there! The boss is busy, and I, Tabitha, will not let you near him!',
        defeat: 'Hmph... The boss will not go down so easily.',
        after: 'Go on, then. See what the boss thinks of you.' }
    ],
    npcs: [
      { id: 'maxie', who: 'maxie', x: 14, y: 6, dir: 'up', if: '!maxie-beaten', script: 'chimney.maxie' },
      { id: 'archie', who: 'archie', x: 24, y: 15, dir: 'left', if: '!maxie-beaten',
        say: 'Maxie is up by the crater with that meteorite. We will keep his grunts busy: go and stop him!' },
      { id: 'aqua', who: 'aqua', x: 23, y: 16, dir: 'left', if: '!maxie-beaten', say: 'Leave this one to me! Go!' },
      { id: 'magma3', who: 'magma', x: 22, y: 15, dir: 'right', if: '!maxie-beaten', say: 'Team Aqua, always in the way! ...Hey, you too?' },
      { id: 'hiker', who: 'hiker', x: 24, y: 8, move: 'look',
        say: 'On a clear day you can see half of Hoenn from up here. Lavaridge Town is down the Jagged Pass, to the south.' }
    ]
  }, HOENN));

  // ---------------- the Jagged Pass ----------------
  G.Maps.def(Object.assign({
    id: 'jagged-pass', loc: 'jagged-pass', tileset: 'outdoor', palette: 'fiery', music: 'route', battleBg: 'grass', border: '#',
    rows: [
      '########...#########',
      '#####......S..######',
      '#####.........######',
      '#####.....""""######',
      '#####.....""""######',
      '#####.....""""######',
      '#.........""""######',
      '#........."""".....#',
      '#..................#',
      '#vvvvvvvvvvvvvvvvvv#',
      '#..................#',
      '#..................#',
      '#..........""""""".#',
      '#.....####.""""""".#',
      '#.....####.""""""".#',
      '#.....####.""""""".#',
      '#..........""""""".#',
      '#..................#',
      '#..................#',
      '#vvvvvvvvvvvvvvvvvv#',
      '#..................#',
      '#....""""""........#',
      '#####""""""........#',
      '#####""""""..#######',
      '#####""""""..#######',
      '#####""""""..#######',
      '#####""""""..#######',
      '#####..............#',
      '#..................#',
      '#########..#########'
    ],
    connect: { north: { map: 'mt-chimney', offset: -5 }, south: { map: 'lavaridge', offset: -5 } },
    signs: { '11,1': 'The Jagged Pass. A steep, rocky path down to Lavaridge Town. There is no climbing back up!' },
    trainers: [
      { id: 'eric', who: 'hiker', cls: 'hiker', name: 'Eric', x: 3, y: 12, dir: 'right', sight: 3, team: [['machop', 22], ['geodude', 22]],
        before: 'Going down is harder on the knees than going up! Let me rest them with a battle.',
        defeat: 'My knees gave out...',
        after: 'Mind the ledges. Once you jump down, there is no climbing back up.' },
      { id: 'autumn', who: 'lass', cls: 'picnicker', name: 'Autumn', x: 15, y: 22, dir: 'left', sight: 3, team: [['spoink', 22], ['numel', 22]],
        before: 'The hot springs in Lavaridge are waiting for me, but you are in my way!',
        defeat: 'I need a long soak now...',
        after: 'Spoink bounces on its tail all day long. They say it never stops, not even to sleep!' }
    ],
    items: [{ x: 17, y: 28, item: 'full-heal', flag: 'jagged-fullheal' }, { x: 1, y: 8, item: 'burn-heal', flag: 'jagged-burnheal' }],
    encounters: { walk: '@jagged-pass-area' }
  }, HOENN));

  // ---------------- Lavaridge Town ----------------
  G.Maps.def(Object.assign({
    id: 'lavaridge', loc: 'lavaridge-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' }, enter: 'lavaridge.enter',
    rows: [
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT',
      'T.............,,.............T',
      'T.............,,.........TTT.T',
      'T.......:::::.,,.........TTT.T',
      'T..CCCCC:::::.,,...GGGGGG....T',
      'T..CCCCC:::::.,,...GGGGGG....T',
      'T..CCCCC:::::.,,...GGGGGG....T',
      'T..CCDCC:::::.,,...GGGGGG....T',
      'T....,..:::::.,,...GGDGGG....T',
      'T....,.......S,,.....,...S...T',
      'T....,........,,.....,.......T',
      'T....,........,,.....,.......T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T............................T',
      'T............................T',
      'T...HHHH...ffffff.....MMMM...T',
      'T...HHHH...ffffff.....MMMM...T',
      'T...HDHH...ffffff.....MDMM...T',
      'T....,.....ffffff......,.....T',
      'T............................T',
      'T............................T',
      'T............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'jagged-pass', offset: 5 }, east: { map: 'route112', offset: 2 } },
    warps: [
      { x: 5, y: 7, to: 'lavaridge-center', spot: 'door' },
      { x: 21, y: 8, to: 'lavaridge-gym', spot: 'door' },
      { x: 23, y: 18, to: 'lavaridge-mart', spot: 'door' },
      { x: 5, y: 18, to: 'lavaridge-house', spot: 'door' }
    ],
    spots: { 'center-door': [5, 8, 'down'], 'gym-door': [21, 9, 'down'], 'mart-door': [23, 19, 'down'], 'house-door': [5, 19, 'down'] },
    signs: {
      '13,9': 'Lavaridge Town. Hot springs bubble up at the foot of Mt. Chimney.',
      '25,9': 'Lavaridge Town Pokémon Gym. Leader: Flannery, whose battles are as hot as the springs!'
    },
    npcs: [
      { id: 'granny1', who: 'granny', x: 9, y: 5, dir: 'down',
        say: 'Ahh... Being buried in the warm sand does wonders for old bones. You should try it!' },
      { id: 'granny2', who: 'granny', x: 11, y: 6, dir: 'left', script: 'lavaridge.egg' },
      { id: 'man', who: 'gentleman', x: 10, y: 8, dir: 'down',
        say: 'People come from all over Hoenn for these hot springs. Even Pokémon love the warm sand!' },
      { id: 'boy', who: 'youngster', x: 17, y: 20, move: 'wander', r: 2,
        say: 'Flannery only just became the Gym Leader. Her grandfather was the Leader before her!' },
      { id: 'girl', who: 'lass', x: 26, y: 14, move: 'look',
        say: 'The road east goes down a ledge to Route 112. From there you can take the cable car up Mt. Chimney again.' },
      { id: 'may', who: 'may', x: 14, y: 12, dir: 'right', if: 'scripted' },
      { id: 'brendan', who: 'brendan', x: 14, y: 12, dir: 'right', if: 'scripted' }
    ]
  }, HOENN));

  G.Maps.center('lavaridge-center', {
    loc: 'lavaridge-town', exit: { map: 'lavaridge', spot: 'center-door' },
    npcs: [{ id: 'woman', who: 'beauty', x: 3, y: 5, move: 'look',
             say: 'After a battle, a soak in the hot springs and a rest at the Pokémon Center. That is the Lavaridge way!' }]
  }).region = 'hoenn';

  G.Maps.mart('lavaridge-mart', {
    loc: 'lavaridge-town', exit: { map: 'lavaridge', spot: 'mart-door' },
    stock: ['great-ball', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'burn-heal', 'awakening', 'full-heal', 'escape-rope', 'super-repel', 'x-sp-atk'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'Burn Heal is a must if you are going to battle Flannery. A burn saps your Pokémon\'s strength every turn!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'lavaridge-house', loc: 'lavaridge-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'lavaridge', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'My grandfather used to say Mt. Chimney sleeps with one eye open. As long as nobody pokes it, it stays quiet.' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'lavaridge-gym', loc: 'lavaridge-town', tileset: 'indoor', palette: 'volcano', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'lavaridge', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'lavaridge.gym-guide' }],
    trainers: [
      { id: 'cole', who: 'kindler', cls: 'kindler', name: 'Cole', x: 3, y: 8, dir: 'right', sight: 3, team: [['slugma', 22], ['slugma', 22]],
        before: 'Feel the heat? This Gym is hotter than the hot springs outside!',
        defeat: 'I got burned...',
        after: 'Flannery\'s Pokémon love the sunshine. When the sun is out, their Fire moves get even stronger.' },
      { id: 'gerald', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Gerald', x: 3, y: 5, dir: 'right', sight: 3, team: [['numel', 24], ['torkoal', 24]],
        before: 'I came here to train in the heat. Let us see if you can take it!',
        defeat: 'You kept your cool...',
        after: 'Torkoal puffs out black smoke when it is angry. It does not like having its stats lowered, either.' },
      { id: 'jace', who: 'kindler', cls: 'kindler', name: 'Jace', x: 9, y: 5, dir: 'left', sight: 3, team: [['numel', 23], ['slugma', 23]],
        before: 'Flannery is fired up today. You will have to get through me first!',
        defeat: 'Burned out...',
        after: 'Flannery tries to act tough, but she is really kind. She just took over the Gym from her grandfather.' },
      { id: 'flannery', who: 'flannery', cls: 'leader', name: 'Flannery', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 1 },
        team: [['numel', 24, ['ember', 'take-down', 'magnitude', 'sunny-day']],
               ['slugma', 24, ['ember', 'smog', 'light-screen', 'sunny-day']],
               ['camerupt', 26, ['overheat', 'tackle', 'sunny-day', 'attract']],
               ['torkoal', 29, ['overheat', 'sunny-day', 'body-slam', 'attract']]],
        before: 'Welcome! I am Flannery, the Leader of this Gym. I only just took over... but my Fire Pokémon and I will not hold back. Let us heat things up!',
        defeat: 'Oh... I tried so hard to act like a proper Leader. Maybe I should just be myself. You battled beautifully!',
        win: 'lavaridge.flannery-win',
        afterScript: [['say', 'I will keep training until I am a Leader everyone can count on. Come back and battle me again sometime!', FLANNERY]] }
    ]
  }, HOENN));

  // ---------------- Mt. Chimney: Tabitha, then Maxie ----------------
  async function maxie(h) {
    const F = G.Field;
    if (F.flag('maxie-beaten')) return;
    await h.walkTo('player', 14, 7);
    h.face('player', 'up');
    h.face('maxie', 'down');
    await h.say(T('So you followed us all the way up here. Look: the meteorite is already in the machine.'), MAXIE);
    await h.say(T('Its energy will stir the magma deep below. The volcano will pour new land into the sea, and people will finally have room to live!'), MAXIE);
    await h.say(T('I will not let a child stand in the way of that. Come!'), MAXIE);
    const out = await h.battle({ id: 'maxie-chimney', who: 'maxie', cls: 'magma-leader', name: 'Maxie', ai: 'leader', items: { 'super-potion': 1 },
      team: [['mightyena', 24], ['zubat', 24], ['camerupt', 25]] }, {});
    if (out === 'lose') return;
    await h.say(T('Beaten by a child... Perhaps our plan was not as ready as I believed.'), MAXIE);
    await h.say(T('Keep the meteorite. Team Magma has no use for it... for now. Team Magma, we are leaving!'), MAXIE);
    for (const id of ['maxie', 'tabitha', 'grunt1', 'grunt2', 'magma3']) h.hide(id);
    F.setFlag('maxie-beaten');
  }
  async function archie(h) {
    h.show('archie');
    await h.walkTo('archie', 15, 10);
    h.face('archie', 'player');
    h.face('player', 'archie');
    await h.say(T('You beat Maxie? Ha! Not bad at all, kid. Team Magma ran off down the mountain.'), ARCHIE);
    await h.say(T('But do not think Team Aqua owes you anything. The sea is our business. Stay out of it!'), ARCHIE);
    h.hide('archie');
    h.hide('aqua');
  }

  // ---------------- Lavaridge: the Egg, the rival ----------------
  async function egg(h) {
    const F = G.Field, D = G.DayCare;
    if (F.flag('lavaridge-egg')) { await h.say(T('Is the Egg keeping warm? The hot sand gave it a good start, I am sure.'), GRANNY); return; }
    await h.say(T('I found this Egg warming itself in the hot sand. I am too old to raise a Pokémon. Would you take it?'), GRANNY);
    if (await h.choice(T('Take the Egg?'), {}) !== 0) { await h.say(T('Oh well. It is quite cosy where it is.'), GRANNY); return; }
    if (D.eggs().length >= D.MAX_EGGS) { await h.say(T('Oh, but you are carrying six Eggs already! Hatch a few first, then come back.'), GRANNY); return; }
    D.eggs().push(D.egg(360));
    F.setFlag('lavaridge-egg');
    const j = h.jingle('item');
    await h.say(T('{player} received the Egg!'));
    await j;
    await h.say(T('Keep it with you as you travel, and it will hatch before long.'), GRANNY);
  }
  async function rivalMeets(h) {
    const F = G.Field, who = F.getVar('rival3') || 'may';
    const me = G.World.player;
    h.place(who, 14, 12, 'right'); h.show(who);
    await h.walkTo(who, me ? me.x : 21, me ? me.y + 1 : 10);
    h.face(who, 'up');
    h.face('player', 'down');
    await h.say(T('{player}! You beat Flannery? That makes four Hoenn badges already!'), RIVAL3);
    await h.say(T('Dad asked me to give you these. They are Go-Goggles: with them you can face the sandstorm in the desert on Route 111.'), RIVAL3);
  }
  async function rivalLeaves(h) {
    const F = G.Field, who = F.getVar('rival3') || 'may';
    F.setFlag('rival3-goggles');
    await h.say(T('Oh, and with four badges you can challenge Norman, the Gym Leader of Petalburg City. They say he is the toughest yet!'), RIVAL3);
    await h.say(T('I am off to look for more Pokémon. See you around, {player}!'), RIVAL3);
    await h.walkTo(who, 14, 12);
    h.hide(who);
    // The end of the thirty-second chapter (credits-ui.js).
    if (G.CreditsUI) G.CreditsUI.ending(32); else F.setFlag('chapter-32-done');
  }

  G.Script.def({
    'chimney.maxie': [
      ['if', 'maxie-beaten', [['end']]],
      ['if', '!done:mt-chimney:tabitha', [
        ['emote', 'tabitha', '!'],
        ['face', 'tabitha', 'player'],
        ['say', 'Hold it right there! The boss is busy, and I, Tabitha, will not let you near him!', TABITHA],
        ['battle', 'tabitha'],
        ['if', 'battle=lose', [['end']]],
        ['say', 'Hmph... The boss will not go down so easily.', TABITHA]
      ]],
      ['js', maxie],
      ['if', 'maxie-beaten', [
        ['giveItem', 'meteorite', 1],
        ['js', archie]
      ]]
    ],
    'chimney.car-down': [
      ['choice', 'Shall we take you back down to Route 112?', [
        ['fade', 'out', 0.6], ['sfx', 'lift'],
        ['say', 'The cable car glided down the side of the mountain...'],
        ['warp', 'cable-car-112', 'car'],
        ['say', 'We have arrived at the foot of Mt. Chimney. Please come again!', ATTENDANT]
      ], [
        ['say', 'Please enjoy the view from the summit!', ATTENDANT]
      ], ATTENDANT]
    ],
    'lavaridge.egg': [['js', egg]],
    'lavaridge.enter': [
      ['if', ['badge:20', '!rival3-goggles'], [
        ['js', rivalMeets],
        ['giveItem', 'go-goggles', 1],
        ['js', rivalLeaves]
      ]]
    ],
    'lavaridge.gym-guide': [
      ['say', 'Yo, Champion! Flannery\'s Gym is full of Fire types. Water, Ground and Rock types will keep you cool in here!'],
      ['say', 'Watch out for Sunny Day: in the sunshine, Fire moves burn even hotter and Water moves lose their punch.'],
      ['say', 'A Grass type would have a rough time here. If your partner is a Grovyle, bring a friend who can stand the heat!']
    ],
    'lavaridge.flannery-win': [
      ['say', 'Here, the Heat Badge. You earned it fair and square!', FLANNERY],
      ['badge', 20],
      ['jingle', 'badge'],
      ['say', '{player} received the Heat Badge from Flannery!'],
      ['say', 'With four Hoenn badges, Pokémon up to level 40 will obey you, wherever they come from.', FLANNERY],
      ['say', 'Take this too: TM50, Overheat. It is the hottest Fire move there is, but it leaves the user worn out afterwards.', FLANNERY],
      ['giveItem', 'tm50', 1]
    ]
  });
})();
