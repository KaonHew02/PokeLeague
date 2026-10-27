/* ============ safari.js — the Safari Zone ============
 * Chapter 6, part 1. North of Fuchsia City. At the gate, ₽500 buys a Safari Game: 30 Safari
 * Balls and 600 steps (flag safari-on, var safari-steps). In the zone (maps with `safari: true`)
 * every step counts down, and wild Pokémon meet you in a Safari battle: no fighting, you throw
 * Safari Balls, Bait or Rocks (js/battle/safari.js). The game ends when the steps or the balls
 * run out (back to the gate) or when you walk out; the balls left are given back.
 * Four areas, as in the games: the center (a pond, a rest house), the east, the north and the
 * west, where the Secret House gives HM03 Surf (flag got-hm03) and the warden's Gold Teeth lie
 * near the water (fuchsia.js: he gives HM04 Strength for them).
 */
const SAFARI = { loc: 'kanto-safari-zone', tileset: 'outdoor', palette: 'forest', music: 'route', battleBg: 'grass', border: 'T', safari: true };

G.Maps.def({
  id: 'safari-gate', loc: 'kanto-safari-zone', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWW',
    'WWWWWeWWWW',
    'p++++++++p',
    '++++++++++',
    '++++++++++',
    '++++X+++++'
  ],
  warps: [
    { x: 4, y: 5, to: 'fuchsia', spot: 'safari-door' },
    // Into the zone: only with a Safari Game (the attendant sells one).
    { x: 5, y: 1, to: 'safari-center', spot: 'gate', if: 'safari-on', locked: 'safari.attendant' }
  ],
  spots: { door: [4, 5, 'up'], inside: [5, 2, 'down'] },
  enter: 'safari.gate-enter',
  npcs: [
    { id: 'attendant', who: 'clerk', x: 3, y: 3, dir: 'down', script: 'safari.attendant' },
    { id: 'boy', who: 'camper', x: 8, y: 4, dir: 'left', move: 'look',
      say: 'Bait makes a Pokémon calm, so it stays longer, but it is harder to catch. A Rock makes it easier to catch... and quicker to run away!' }
  ]
});

G.Maps.def(Object.assign({
  id: 'safari-center',
  rows: [
    'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTT',
    'T................,,................T',
    'T..""""""""......,,......""""""""..T',
    'T..""""""""......,,......""""""""..T',
    'T..""""""""......,,......""""""""..T',
    'T..""""""""......,,......""""""""..T',
    'T..""""""""......,,......""""""""..T',
    'T................,,................T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T..............S.,,........HHHH....T',
    'T...........~~~~~==~~~~~...HHHH....T',
    'T...........~~~~~==~~~~~...HDHH....T',
    'T.."""""""..~~~~~==~~~~~....,......T',
    'T.."""""""..~~~~~==~~~~~...........T',
    'T.."""""""..~~~~~==~~~~~...........T',
    'T.."""""""..~~~~~==~~~~~.."""""""..T',
    'T..""""""".......,,......."""""""..T',
    'T..""""""".......,,......."""""""..T',
    'T..""""""".......,,......."""""""..T',
    'T..""""""".TT....,,....TT."""""""..T',
    'T...............HHHH......"""""""..T',
    'T.............S.HHHH...............T',
    'T...............HDHH...............T',
    'T................,,................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { north: { map: 'safari-north', offset: 0 }, east: { map: 'safari-east', offset: 0 }, west: { map: 'safari-west', offset: 0 } },
  warps: [{ x: 17, y: 23, to: 'safari-gate', spot: 'inside' }, { x: 28, y: 12, to: 'safari-rest', spot: 'door' }],
  spots: { gate: [17, 24, 'down'], 'rest-door': [28, 13, 'down'] },
  signs: {
    '15,10': 'Safari Zone, center area. North, east and west: the other areas. East of the pond: a rest house.',
    '14,22': 'Throw Bait to calm a Pokémon, or a Rock to rile it up. A riled-up Pokémon is easier to catch, but it may run!'
  },
  encounters: { walk: '@kanto-safari-zone-middle' }
}, SAFARI));

G.Maps.def(Object.assign({
  id: 'safari-east',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................T',
    'T..""""""".............T',
    'T..""""""".."""""""""..T',
    'T..""""""".."""""""""..T',
    'T..""""""".."""""""""..T',
    'T..........."""""""""..T',
    'T..........."""""""""..T',
    ',,,,,,,....."""""""""..T',
    ',,,,,,,....."""""""""..T',
    'T..S..,....."""""""""..T',
    'T.....,................T',
    'T.....,................T',
    'T.....,.""""""""~~~~~~.T',
    'T.....,.""""""""~~~~~~.T',
    'T.....,.""""""""~~~~~~.T',
    'T."""",.""""""""~~~~~~.T',
    'T."""",.""""""""~~~~~~.T',
    'T."""",.""""""""~~~~~~.T',
    'T."""",.""""""""~~~~~~.T',
    'T."""",."""""""".......T',
    'T."""",................T',
    'T."""",......TTTTTTTTT.T',
    'T."""".................T',
    'T......................T',
    'TTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'safari-center', offset: 0 } },
  spots: { west: [1, 8, 'right'] },
  signs: { '3,10': 'Safari Zone, east area. Rare Pokémon hide in the tall grass. Look for them!' },
  items: [
    { x: 21, y: 23, item: 'tm11', flag: 'tm11' },
    { x: 21, y: 2, item: 'max-potion', flag: 'max-potion' },
    { x: 2, y: 12, item: 'leaf-stone', flag: 'hidden-stone', hidden: true }
  ],
  encounters: { walk: '@kanto-safari-zone-area-1-east' }
}, SAFARI));

G.Maps.def(Object.assign({
  id: 'safari-north',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T..................................T',
    'T..................................T',
    'T..""""""""""..~~~~~~..""""""""""..T',
    'T..""""""""""..~~~~~~..""""""""""..T',
    'T..""""""""""..~~~~~~..""""""""""..T',
    'T..""""""""""..~~~~~~..""""""""""..T',
    'T..""""""""""..~~~~~~..""""""""""..T',
    'T..""""""""""..~~~~~~..""""""""""..T',
    'T..""""""""""..........""""""""""..T',
    'T..................................T',
    'T.~~~~........................~~~~.T',
    'T.~~~~........................~~~~.T',
    'T...............S..................T',
    'T...,,,,,,,,,,,,,,,,,,,,,,,,,,,,...T',
    'T................,,................T',
    'T....."""""""""..,,..""""""""".....T',
    'T....."""""""""..,,..""""""""".....T',
    'T....."""""""""..,,..""""""""".....T',
    'T....."""""""""..,,..""""""""".....T',
    'T................,,................T',
    'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'safari-center', offset: 0 } },
  spots: { south: [17, 20, 'up'] },
  signs: { '16,13': 'Safari Zone, north area. The ponds here are deep: a Pokémon that can Surf could cross them.' },
  items: [
    { x: 2, y: 2, item: 'tm47', flag: 'tm47' },
    { x: 33, y: 2, item: 'max-revive', flag: 'max-revive' },
    { x: 34, y: 19, item: 'full-heal', flag: 'hidden-heal', hidden: true }
  ],
  encounters: { walk: '@kanto-safari-zone-area-2-north' }
}, SAFARI));

G.Maps.def(Object.assign({
  id: 'safari-west',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................T',
    'T..""""""""""..........T',
    'T..""""""""""..........T',
    'T..""""""""""..........T',
    'T..""""""""""..........T',
    'T..""""""""""..........T',
    'T.................S....T',
    'T..HHHH..........,,,,,,,',
    'T..HHHH..........,,,,,,,',
    'T..HDHH..........,.....T',
    'T...,..."""""""".,.....T',
    'T...,..."""""""".,.""""T',
    'T......."""""""".,.""""T',
    'T.~~~~~."""""""".,.""""T',
    'T.~~~~~."""""""".,.""""T',
    'T.~~~~~."""""""".,.""""T',
    'T.~~~~~."""""""".,.""""T',
    'T.~~~~~."""""""".,.""""T',
    'T.~~~~~..........,.""""T',
    'T.~~~~~..........,.""""T',
    'T................,.....T',
    'T.TTTTTTTTTTTTTT.......T',
    'T......................T',
    'T......................T',
    'TTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'safari-center', offset: 0 } },
  warps: [{ x: 4, y: 10, to: 'safari-house', spot: 'door' }],
  spots: { east: [22, 8, 'left'], 'house-door': [4, 11, 'down'] },
  signs: { '18,7': 'Safari Zone, west area. Find the Secret House and win a prize!' },
  items: [
    { x: 7, y: 20, item: 'gold-teeth', flag: 'gold-teeth' },
    { x: 20, y: 2, item: 'tm32', flag: 'tm32' },
    { x: 2, y: 23, item: 'max-potion', flag: 'hidden-potion', hidden: true }
  ],
  encounters: { walk: '@kanto-safari-zone-area-3-west' }
}, SAFARI));

G.Maps.def({
  id: 'safari-house', loc: 'kanto-safari-zone', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor', safari: true,
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'b__t___p',
    '________',
    '__rr____',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'safari-west', spot: 'house-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [{ id: 'host', who: 'gentleman', x: 5, y: 3, dir: 'down', script: 'safari.secret-house' }]
});

G.Maps.def({
  id: 'safari-rest', loc: 'kanto-safari-zone', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor', safari: true,
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'b____t_p',
    '________',
    '___rr___',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'safari-center', spot: 'rest-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [
    { id: 'man', who: 'hiker', x: 5, y: 3, dir: 'left', move: 'look',
      say: 'Some Pokémon only live in the Safari Zone: Kangaskhan, Tauros, Chansey... if you are lucky.' },
    { id: 'girl', who: 'lass', x: 1, y: 4, dir: 'right', move: 'look',
      say: 'I threw all my Safari Balls at a Chansey and it ran away anyway. Next time I will bring more patience.' }
  ]
});

(() => {
  const ATTENDANT = { name: 'Safari Zone attendant' };
  const HOST = { name: 'Secret House host' };

  G.Script.def({
    'safari.attendant': [
      ['say', 'Welcome to the Safari Zone!', ATTENDANT],
      ['choice', 'For ₽500 you get 30 Safari Balls and 600 steps to catch whatever you can. Would you like to join the hunt?', [
        ['if', 'money>=500', [
          ['money', -500],
          ['setFlag', 'safari-on'],
          ['setVar', 'safari-steps', 600],
          ['giveItem', 'safari-ball', 30],
          ['say', 'We will call you on the speaker when your steps or your Safari Balls run out. Good luck!', ATTENDANT],
          ['warp', 'safari-center', 'gate']
        ], [
          ['say', 'Oh dear, you do not have enough money. Please come again!', ATTENDANT]
        ]]
      ], [
        ['say', 'Please come again!', ATTENDANT]
      ], ATTENDANT]
    ],
    // The game ends: the Safari Balls left go back to the attendant.
    'safari.end': [['js', () => {
      const F = G.Field;
      if (F.count('safari-ball')) F.takeItem('safari-ball', F.count('safari-ball'));
      F.clearFlag('safari-on');
      F.setVar('safari-steps', 0);
    }]],
    'safari.gate-enter': [
      ['if', 'safari-on', [
        ['call', 'safari.end'],
        ['say', 'Your Safari Game is over. Did you catch anything good? Please come again!', ATTENDANT]
      ]]
    ],
    'safari.timeup': [
      ['say', 'Ding-dong! Your time is up!'],
      ['call', 'safari.end'],
      ['warp', 'safari-gate', 'inside'],
      ['say', 'Your Safari Game is over. Did you catch anything good? Please come again!', ATTENDANT]
    ],
    'safari.out-of-balls': [
      ['say', 'Ding-dong! You have no Safari Balls left!'],
      ['call', 'safari.end'],
      ['warp', 'safari-gate', 'inside'],
      ['say', 'Your Safari Game is over. Did you catch anything good? Please come again!', ATTENDANT]
    ],
    'safari.secret-house': [
      ['if', 'got-hm03', [
        ['say', 'Surf lets one of your Pokémon carry you across the water. Lakes, rivers, even the sea!', HOST]
      ], [
        ['say', 'Well done! You found the Secret House. Hardly anyone makes it this far.', HOST],
        ['say', 'As your prize, please take this!', HOST],
        ['setFlag', 'got-hm03'],
        ['giveItem', 'hm03', 1],
        ['say', 'HM03 is Surf. With the Soul Badge, a Pokémon that knows it can carry you across water.', HOST]
      ]]
    ]
  });
})();
