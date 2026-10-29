/* ============ icepath.js — Route 44 and the Ice Path ============
 * Chapter 18. Once Team Rocket has left the Radio Tower, the rockfall east of Mahogany Town is
 * cleared: Route 44 (six Trainers, a pond, a berry tree) runs east to the Ice Path, a frozen cave.
 * 1F: slide across the ice to the ladder down. B1F: four boulders and four holes; pushed in with
 * Strength, each boulder falls through to B2F (flags pit:ice-path-b1f:x,y) and lands on its ice.
 * B2F: the ice can only be crossed with all four boulders in place to stop you (whoever falls
 * through a hole lands where its boulder would, and can always get back to the ladder). The ladder
 * in the pocket below leads up through the east halves of B1F and 1F, out to Blackthorn City.
 * The layouts were searched by a solver (scratchpad icepath_search.py, b2f_search.py).
 */
G.Maps.def({
  id: 'route44', loc: 'johto-route-44', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT#########',
    'T..........................................#########',
    'T.."""""""""......~~~~~~~~~~~..TTTTTT......#########',
    'T.."""""""""......~~~~~~~~~~~..TTTTTT.h....#########',
    'T.."""""""""......~~~~~~~~~~~..TTTTTT......#########',
    'T.."""""""""......~~~~~~~~~~~..TTTTTT......#########',
    'T.."""""""""......~~~~~~~~~~~..............####O####',
    'T.............................................,,...T',
    'T.S.........................................S.,,...T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,...T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,...T',
    'T..................................................T',
    'T..."""""""""".....TTTTTTT...."""""""""""..........T',
    'T...""""""""""..y..TTTTTTT...."""""""""""..........T',
    'T..."""""""""".....TTTTTTT...."""""""""""..........T',
    'T..."""""""""".....TTTTTTT...."""""""""""..........T',
    'T..................TTTTTTT.........................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'mahogany', offset: -2 } },
  warps: [{ x: 47, y: 6, to: 'ice-path-1f', spot: 'west' }],
  spots: { 'icepath-door': [47, 7, 'down'] },
  berries: [[16, 13, 'sitrus-berry']],
  signs: {
    '2,8': 'Route 44. West: Mahogany Town. East: the Ice Path.',
    '44,8': 'The Ice Path. Its floors are frozen solid all year round. Blackthorn City lies on the other side.'
  },
  trainers: [
    { id: 'vance', who: 'birdkeeper', cls: 'bird-keeper', name: 'Vance', x: 8, y: 8, dir: 'down', sight: 2,
      team: [['pidgeotto', 33], ['pidgeotto', 33]],
      before: 'My Pidgeotto can fly over the mountains. Can yours?',
      defeat: 'Grounded...',
      after: 'Flying types have it easy on mountain roads. No ice to slip on!' },
    { id: 'phil', who: 'psychic', cls: 'psychic', name: 'Phil', x: 14, y: 11, dir: 'up', sight: 1,
      team: [['natu', 33], ['kadabra', 35]],
      before: 'I foresaw that you would come this way. I did not foresee who would win, though.',
      defeat: 'Even my future sight was clouded...',
      after: 'The future is never fixed. That is what makes it worth training for.' },
    { id: 'edgar', who: 'fisherman', cls: 'fisherman', name: 'Edgar', x: 24, y: 7, dir: 'down', sight: 2,
      team: [['remoraid', 33], ['remoraid', 33], ['octillery', 35]],
      before: 'Shh! You are scaring the fish. Fine, a battle it is!',
      defeat: 'My line snapped...',
      after: 'Remoraid shoot water like a jet. When they grow up, they latch on to things.' },
    { id: 'cybil', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Cybil', x: 34, y: 8, dir: 'down', sight: 2,
      team: [['butterfree', 34], ['bellossom', 34]],
      before: 'Pretty Pokémon can be strong too. Let me show you!',
      defeat: 'Beaten, but beautifully.',
      after: 'Clair of Blackthorn is the strongest Gym Leader in Johto. Are you heading her way?' },
    { id: 'zach', who: 'pokemaniac', cls: 'pokemaniac', name: 'Zach', x: 38, y: 11, dir: 'up', sight: 1,
      team: [['rhyhorn', 35], ['rhydon', 37]],
      before: 'My Rhyhorn grew a drill on its head! Want to see what it can do?',
      defeat: 'The drill could not break through...',
      after: 'I would love a Pokémon from the Dragon\'s Den. Only the dragon clan may go in, though.' },
    { id: 'allen', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Allen', x: 41, y: 13, dir: 'left', sight: 4,
      team: [['charmeleon', 36], ['ivysaur', 36]],
      before: 'A Trainer on the way to Blackthorn? Then you must be good. Prove it!',
      defeat: 'You really are good.',
      after: 'The Ice Path is slippery. Think before every step, or you will slide right past where you wanted to go.' }
  ],
  encounters: { walk: '@johto-route-44-area' }
});

const ICE_CAVE = { loc: 'ice-path', region: 'johto', tileset: 'outdoor', palette: 'seafoam', music: 'cave', battleBg: 'ice', border: '#', cave: true, escape: true };

G.Maps.def(Object.assign({
  id: 'ice-path-1f',
  rows: [
    '##############################',
    '##O########################O##',
    '#................##..........#',
    '#................##..........#',
    '#i#ii#iiiii#iiii###...#......#',
    '#i#iiiiiii#ii#iii##......#...#',
    '##iiiiiiiiii#iiii##..........#',
    '##iii#iiiiiiiiiii##iiiiiiiiii#',
    '#iiiiiiii#iiiiii###iiiiiiiiii#',
    '#iiiiiiiiiii#iiii##iii#iiiiii#',
    '#iiiiiiiiiii#iiii##..........#',
    '#ii##iiiiii#iiiii##.#........#',
    '#iiiiiiii#iii#iii##..........#',
    '##.################.%......#.#',
    '#..............%.##..........#',
    '##############################'
  ],
  warps: [
    { x: 2, y: 1, to: 'route44', spot: 'icepath-door' },
    { x: 15, y: 14, to: 'ice-path-b1f', spot: 'from-above' },
    { x: 20, y: 13, to: 'ice-path-b1f', spot: 'east-ladder' },
    { x: 27, y: 1, to: 'blackthorn', spot: 'icepath-door' }
  ],
  spots: { west: [2, 2, 'down'], 'down-ladder': [15, 14, 'up'], 'east-ladder': [20, 13, 'down'], east: [27, 2, 'down'] },
  items: [
    { x: 1, y: 14, item: 'pp-up', flag: 'ice-path-1f-ppup' },
    { x: 27, y: 12, item: 'protein', flag: 'ice-path-1f-protein' }
  ],
  encounters: { walk: '@ice-path-1f' }
}, ICE_CAVE));

G.Maps.def(Object.assign({
  id: 'ice-path-b1f',
  rows: [
    '##############################',
    '##############################',
    '#%..............###.%.......##',
    '#...............###..........#',
    '#................##....#.....#',
    '#................##..........#',
    '##...............###.........#',
    '##...............###.........#',
    '#.........o......##..........#',
    '#...o............##..........#',
    '#.............o..##......##..#',
    '#................##..........#',
    '#......o.#......###..........#',
    '#................##...#....%.#',
    '#.....#....##..%.##..........#',
    '##############################'
  ],
  warps: [
    { x: 1, y: 2, to: 'ice-path-1f', spot: 'down-ladder' },
    { x: 15, y: 14, to: 'ice-path-b2f', spot: 'from-above' },
    { x: 4, y: 9, to: 'ice-path-b2f', spot: 'drop-1' },
    { x: 10, y: 8, to: 'ice-path-b2f', spot: 'drop-2' },
    { x: 14, y: 10, to: 'ice-path-b2f', spot: 'drop-3' },
    { x: 7, y: 12, to: 'ice-path-b2f', spot: 'drop-4' },
    { x: 20, y: 2, to: 'ice-path-1f', spot: 'east-ladder' },
    { x: 27, y: 13, to: 'ice-path-b2f', spot: 'pocket-ladder' }
  ],
  spots: { 'from-above': [1, 2, 'down'], 'down-ladder': [15, 14, 'up'], 'east-ladder': [20, 2, 'down'], 'pocket-ladder': [27, 13, 'up'] },
  // Four boulders, four holes: each one goes straight in, or turns one corner on the way.
  boulders: [{ id: 'a', x: 4, y: 5 }, { id: 'b', x: 7, y: 4 }, { id: 'c', x: 13, y: 4 }, { id: 'd', x: 3, y: 11 }],
  items: [
    { x: 1, y: 14, item: 'iron', flag: 'ice-path-b1f-iron' },
    { x: 24, y: 8, item: 'carbos', flag: 'ice-path-b1f-carbos' }
  ],
  encounters: { walk: '@ice-path-b1f' }
}, ICE_CAVE));

G.Maps.def(Object.assign({
  id: 'ice-path-b2f',
  rows: [
    '########################',
    '########################',
    '#%...###################',
    '#....###################',
    '#ii#iiiiiiiiiiiiiiii#ii#',
    '#ii#iiiiiiiiiiiiiiii#ii#',
    '#iiiiiii#iii#iiiiiii#ii#',
    '#iiii#iiiiiiiiiii#iiiii#',
    '#iiiiiiiiiiiiiiiiiiiiii#',
    '#iiii#iiiiiiiiii#iiiii##',
    '#iiiiii#iiiii#iiiiiiiii#',
    '#iiiiiiiiiiiii#iiiii#ii#',
    '#iiiiiiiiiii#iiiiiiiiii#',
    '#########.##############',
    '#.....................%#',
    '########################'
  ],
  warps: [
    { x: 1, y: 2, to: 'ice-path-b1f', spot: 'down-ladder' },
    { x: 22, y: 14, to: 'ice-path-b1f', spot: 'pocket-ladder' }
  ],
  spots: { 'from-above': [1, 2, 'down'], 'pocket-ladder': [22, 14, 'left'],
           'drop-1': [8, 5, 'down'], 'drop-2': [14, 6, 'down'], 'drop-3': [18, 4, 'down'], 'drop-4': [21, 8, 'down'] },
  // The boulders from B1F land on the ice and stay there: the only way across.
  boulders: [
    { id: 'fell-a', x: 8, y: 5, fixed: true, if: 'pit:ice-path-b1f:4,9' },
    { id: 'fell-b', x: 14, y: 6, fixed: true, if: 'pit:ice-path-b1f:10,8' },
    { id: 'fell-c', x: 18, y: 4, fixed: true, if: 'pit:ice-path-b1f:14,10' },
    { id: 'fell-d', x: 21, y: 8, fixed: true, if: 'pit:ice-path-b1f:7,12' }
  ],
  items: [{ x: 1, y: 14, item: 'max-potion', flag: 'ice-path-b2f-maxpotion' }],
  encounters: { walk: '@ice-path-b2f' }
}, ICE_CAVE));
