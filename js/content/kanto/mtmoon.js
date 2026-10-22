/* ============ mtmoon.js — Route 4 and Mt. Moon ============
 * Route 4 is cut in two by the mountain: the west side has the Pokémon Center (and a
 * man selling a Magikarp), the east side leads down to Cerulean City. The only way
 * through is Mt. Moon: 1F, a ladder to B1F, a ladder to B2F where Team Rocket is digging
 * for fossils and a Super Nerd guards two of them (you keep one, he takes the other),
 * then a ladder up to the east half of B1F and out. Wild Pokémon (Zubat, Geodude, Paras,
 * a rare Clefairy) appear on any step in the cave.
 */
G.Maps.def({
  id: 'route4', loc: 'kanto-route-4', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T.................####################...................T',
    'T.........S.......####################.."""""""..........T',
    ',,,,,,,,,,,,,.....####################.."""""""..""""""".T',
    'T...........,.....####################.."""""""..""""""".T',
    'T..CCCCC....,.....####################.."""""""..""""""".T',
    'T..CCCCC....,.....####################...................T',
    'T..CCCCC....,.....####################.vvvvvv..vvvvvvvvvvT',
    'T..CCDCC....,.....####################............TTTTT..T',
    'T....,......,.....##O##############O##..""""".....TTTTT..T',
    'T....,,,,,,,,.......,..##########..,....""""".....TTTTT..T',
    'T.""""""""..,,,,,,,,,,,##########..,,,,,,,,,,,,,,,,,,,,,,,',
    'T."""""""".............##########.......S................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'route3', offset: 0 }, east: { map: 'cerulean', offset: 4 } },
  warps: [
    { x: 5, y: 8, to: 'mtmoon-center', spot: 'door' },
    { x: 20, y: 9, to: 'mtmoon-1f', spot: 'entrance' },
    { x: 35, y: 9, to: 'mtmoon-b1f', spot: 'exit' }
  ],
  spots: {
    west: [1, 3, 'right'], 'center-door': [5, 9, 'down'],
    'moon-entrance': [20, 10, 'down'], 'moon-exit': [35, 10, 'down'], east: [56, 11, 'left']
  },
  signs: {
    '10,2': 'Route 4. Mt. Moon Pokémon Center ahead. East: Mt. Moon.',
    '40,12': 'Route 4. East: Cerulean City.'
  },
  npcs: [
    { id: 'hiker', who: 'hiker', x: 15, y: 9, move: 'look',
      say: "Mt. Moon is full of Zubat. Stock up on Potions at the Pokémon Center before you go in!" },
    { id: 'girl', who: 'lass', x: 46, y: 12, move: 'look',
      say: "You made it through Mt. Moon? Cerulean City is right over there. Its Gym Leader loves Water-type Pokémon." }
  ],
  encounters: { walk: '@kanto-route-4-area' }
});

G.Maps.center('mtmoon-center', {
  loc: 'kanto-route-4', exit: { map: 'route4', spot: 'center-door' },
  npcs: [
    { id: 'salesman', who: 'guide', x: 9, y: 5, dir: 'left', script: 'route4.magikarp' },
    { id: 'kid', who: 'youngster', x: 3, y: 5, move: 'look',
      say: 'Clefairy live deep inside Mt. Moon. They say they dance under the full moon!' }
  ]
});

G.Maps.def({
  id: 'mtmoon-1f', loc: 'mt-moon', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true,
  rows: [
    '##################################',
    '##################################',
    '######.........................###',
    '######....:::::..............%.###',
    '######....:::::................###',
    '######.........................###',
    '######.........................###',
    '##################....############',
    '########.....#####....############',
    '########.....#####....############',
    '########..............############',
    '########.....#####....############',
    '########.....#####....############',
    '##################....############',
    '##...................#############',
    '##...................#############',
    '##...................#############',
    '##....##########...............###',
    '##....##########...............###',
    '##....##########.......####....###',
    '##....##########.......#::::...###',
    '##....##########.......#::::...###',
    '##....##########........::::...###',
    '##....##########...............###',
    '###O##############################',
    '##################################'
  ],
  warps: [
    { x: 3, y: 24, to: 'route4', spot: 'moon-entrance' },
    { x: 29, y: 3, to: 'mtmoon-b1f', spot: 'from-1f' }
  ],
  spots: { entrance: [3, 23, 'up'], ladder: [29, 3, 'down'] },
  trainers: [
    { id: 'kent', who: 'bugcatcher', cls: 'bug-catcher', name: 'Kent', x: 5, y: 20, dir: 'left', sight: 3,
      team: [['weedle', 11], ['kakuna', 11]],
      before: 'Are you here for the Moon Stones too? Not before you beat my bugs!',
      defeat: 'Stung by my own mistake...',
      after: 'A Moon Stone makes some Pokémon evolve. Nidorino, for one!' },
    { id: 'iris', who: 'lass', cls: 'lass', name: 'Iris', x: 10, y: 14, dir: 'down', sight: 2,
      team: [['clefairy', 14]],
      before: 'I caught a Clefairy in here! Want to see how strong it is?',
      defeat: 'Oh no, Clefairy!',
      after: 'Clefairy are so rare. I was really lucky.' },
    { id: 'jovan', who: 'supernerd', cls: 'super-nerd', name: 'Jovan', x: 21, y: 9, dir: 'left', sight: 3,
      team: [['magnemite', 11], ['voltorb', 11]],
      before: 'This cave is perfect for my research. Do not disturb it!',
      defeat: 'My calculations were wrong...',
      after: 'Electric Pokémon need no light at all. Fascinating.' },
    { id: 'marcos', who: 'hiker', cls: 'hiker', name: 'Marcos', x: 16, y: 4, dir: 'down', sight: 2,
      team: [['geodude', 10], ['geodude', 10], ['onix', 10]],
      before: "Hah! A climber like you should know the mountain's rules. We battle!",
      defeat: 'You rock... I mean, you rule!',
      after: 'I come here to climb, but the cave is more fun.' },
    { id: 'josh', who: 'youngster', cls: 'youngster', name: 'Josh', x: 26, y: 18, dir: 'left', sight: 4,
      team: [['rattata', 10], ['rattata', 10], ['zubat', 10]],
      before: 'I got lost in here... so I might as well battle!',
      defeat: 'Still lost. And now I lost again.',
      after: 'Which way is the exit? Oh, the ladder goes deeper.' }
  ],
  items: [
    { x: 9, y: 8, item: 'tm09', flag: 'mtmoon-tm09' },
    { x: 29, y: 22, item: 'potion', flag: 'mtmoon-potion-1' },
    { x: 11, y: 12, item: 'rare-candy', flag: 'mtmoon-candy' },
    { x: 6, y: 2, item: 'escape-rope', flag: 'mtmoon-rope' },
    { x: 30, y: 17, item: 'paralyze-heal', flag: 'mtmoon-parlyz' },
    { x: 14, y: 3, item: 'moon-stone', flag: 'mtmoon-moonstone-1', hidden: true }
  ],
  encounters: { walk: '@mt-moon-1f' }
});

G.Maps.def({
  id: 'mtmoon-b1f', loc: 'mt-moon', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true,
  rows: [
    '########################',
    '####################O###',
    '##........####........##',
    '##.%......####........##',
    '##........####........##',
    '##..###...####........##',
    '##..###...####..###...##',
    '##..###...####..###...##',
    '##........####..###...##',
    '##........####........##',
    '##......%.####......%.##',
    '##........####........##',
    '########################',
    '########################'
  ],
  warps: [
    { x: 3, y: 3, to: 'mtmoon-1f', spot: 'ladder' },
    { x: 8, y: 10, to: 'mtmoon-b2f', spot: 'from-b1f' },
    { x: 20, y: 10, to: 'mtmoon-b2f', spot: 'ladder-east' },
    { x: 20, y: 1, to: 'route4', spot: 'moon-exit' }
  ],
  spots: { 'from-1f': [3, 3, 'down'], 'to-b2f': [8, 10, 'up'], 'from-b2f': [20, 10, 'up'], exit: [20, 2, 'down'] },
  items: [
    { x: 2, y: 11, item: 'potion', flag: 'mtmoon-potion-2' },
    { x: 21, y: 4, item: 'star-piece', flag: 'mtmoon-star-piece', hidden: true }
  ],
  encounters: { walk: '@mt-moon-b1f' }
});

G.Maps.def({
  id: 'mtmoon-b2f', loc: 'mt-moon', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true,
  rows: [
    '##################################',
    '##################################',
    '##......##########################',
    '##.%....####.....#################',
    '##.:::..####.....###...........###',
    '##.:::..####.....###.::::......###',
    '##.:::..####.....###.::::.##...###',
    '##......####.....###......##...###',
    '##......####.....###......##...###',
    '##......####.....###...........###',
    '##.............................###',
    '##.............................###',
    '##.............................###',
    '#######################........###',
    '#######################........###',
    '#######################........###',
    '#######################........###',
    '#######################..........#',
    '#######################..........#',
    '#######################.........%#',
    '##################################',
    '##################################'
  ],
  warps: [
    { x: 3, y: 3, to: 'mtmoon-b1f', spot: 'to-b2f' },
    { x: 32, y: 19, to: 'mtmoon-b1f', spot: 'from-b2f' }
  ],
  spots: { 'from-b1f': [3, 3, 'down'], 'ladder-east': [32, 19, 'up'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 6, y: 8, dir: 'down', sight: 3,
      team: [['rattata', 13], ['zubat', 13]],
      before: 'Team Rocket owns this mountain now! Get lost, kid!',
      defeat: 'Hey! Not fair!',
      after: 'We are digging for fossils. They sell for a fortune!' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 14, y: 9, dir: 'down', sight: 2,
      team: [['sandshrew', 11], ['rattata', 11], ['zubat', 11]],
      before: "What's a kid doing down here? Team Rocket business only!",
      defeat: 'The boss will hear about this...',
      after: "Team Rocket will be back. You'll see!" },
    { id: 'grunt3', who: 'rocket', cls: 'team-rocket', x: 22, y: 8, dir: 'down', sight: 3,
      team: [['zubat', 12], ['ekans', 12]],
      before: 'Stop right there! The fossils ahead are ours!',
      defeat: 'Argh, you got lucky!',
      after: 'There is a nerd guarding the fossils. Even we could not shake him off.' },
    { id: 'grunt4', who: 'rocket', cls: 'team-rocket', x: 29, y: 5, dir: 'left', sight: 4,
      team: [['rattata', 16]],
      before: "You've got guts coming this far. Too bad it ends here!",
      defeat: 'How can this be?',
      after: "We'll find other fossils somewhere else!" },
    { id: 'miguel', who: 'supernerd', cls: 'super-nerd', name: 'Miguel', x: 26, y: 15, dir: 'up', sight: 0,
      team: [['grimer', 12], ['voltorb', 12], ['koffing', 12]],
      before: 'Hey! Stop! I found these fossils first! They are mine, all mine!',
      defeat: 'All right, all right! We will share!',
      after: 'Fossils can be brought back to life in a lab, they say. Somewhere far away...' }
  ],
  items: [
    { x: 25, y: 17, item: 'dome-fossil', flag: 'fossil-dome', script: 'mtmoon.fossil-dome' },
    { x: 27, y: 17, item: 'helix-fossil', flag: 'fossil-helix', script: 'mtmoon.fossil-helix' },
    { x: 16, y: 3, item: 'moon-stone', flag: 'mtmoon-moonstone-2' },
    { x: 3, y: 12, item: 'super-potion', flag: 'mtmoon-super-potion' },
    { x: 30, y: 4, item: 'hp-up', flag: 'mtmoon-hp-up', hidden: true }
  ],
  encounters: { walk: '@mt-moon-b2f' }
});

(() => {
  const T = s => G.T(s);
  const MIGUEL = 'mtmoon-b2f:miguel';
  const KEYS = { 'dome-fossil': 'mtmoon-b2f:fossil-dome', 'helix-fossil': 'mtmoon-b2f:fossil-helix' };
  const OTHER = { 'dome-fossil': 'helix-fossil', 'helix-fossil': 'dome-fossil' };

  /** One of the two fossils: Miguel battles you first, then you keep one and he takes the other. */
  function fossil(item) {
    return async h => {
      const F = G.Field;
      if (!F.isDone(MIGUEL)) {
        h.face('miguel', 'player');
        const out = await h.battle(MIGUEL, {});
        if (out === 'lose') return;
      }
      if (F.flag('got-fossil')) return;
      const vars = { item: G.Names.item(item) };
      if (await h.choice(T('Take the {item}?'), { vars }) !== 0) return;
      F.markDone(KEYS[item]);
      F.giveItem(item, 1);
      G.World.refresh();
      const j = h.jingle('item');
      await h.say(T('{player} got the {item}!'), { vars });
      await j;
      F.markDone(KEYS[OTHER[item]]);
      F.setFlag('got-fossil');
      G.World.refresh();
      await h.say(T('Then the {item} is mine! Fair is fair.'), { name: 'Miguel', vars: { item: G.Names.item(OTHER[item]) } });
    };
  }

  G.Script.def({
    'mtmoon.fossil-dome': [['js', fossil('dome-fossil')]],
    'mtmoon.fossil-helix': [['js', fossil('helix-fossil')]],
    'route4.magikarp': [
      ['if', 'bought-magikarp', [
        ['say', 'A deal is a deal. No refunds!']
      ], [
        ['say', "Psst, kid! I've got a secret Pokémon for you. A real bargain!"],
        ['choice', 'Only ₽500 for a Magikarp! Want it?', [
          ['if', 'money>=500', [
            ['money', -500],
            ['setFlag', 'bought-magikarp'],
            ['js', h => h.say(G.T('{player} received {mon}!'), { vars: { mon: G.Names.mon(129) } })],
            ['giveMon', 'magikarp', 5, { nickname: true }],
            ['say', 'Pleasure doing business! Raise it well. Who knows what it might become?']
          ], [
            ['say', "You don't have enough money? Come back when you do!"]
          ]]
        ], [
          ['say', "Your loss! You won't find a deal like this anywhere else."]
        ]]
      ]]
    ]
  });
})();
