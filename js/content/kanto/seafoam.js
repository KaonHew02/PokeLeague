/* ============ seafoam.js — the Seafoam Islands ============
 * Chapter 7, part 2. Two icy caves in the middle of Sea Route 20 (sea.js), joined deep down: the
 * way from the east shore to the west shore goes down to B3F, where a fast current (outdoor tile
 * `r`) cuts the underground lake in two. Strength (with the Rainbow Badge) moves the boulders: on
 * B1F one blocks the way down; on B2F two of them are pushed into pits (`o`): they fall to B3F,
 * dam the current, and the lake calms down (map `calm`: flags pit:seafoam-b2f:12,8 and 12,11;
 * field.js). Then you can Surf across to the west caves and their ladders up to the west shore.
 * Articuno rests on a ledge in the lake (Lv. 50, flag seafoam-articuno).
 */
G.Maps.def({
  id: 'seafoam-1f', loc: 'seafoam-islands', tileset: 'outdoor', palette: 'seafoam', music: 'cave', battleBg: 'ice', border: '#', cave: true, escape: true,
  rows: [
    '########################',
    '##O################O####',
    '#....############.....##',
    '#.....##########......##',
    '#......########.......##',
    '##.....########...##..##',
    '##....##########..##...#',
    '###...##########.......#',
    '##....###########......#',
    '##.....##########...####',
    '#......#########.....###',
    '#.....##########......##',
    '#..%...##########.%...##',
    '##....############....##',
    '###..##############..###',
    '########################'
  ],
  warps: [
    { x: 19, y: 1, to: 'route20', spot: 'seafoam-east' },
    { x: 2, y: 1, to: 'route20', spot: 'seafoam-west' },
    { x: 18, y: 12, to: 'seafoam-b1f', spot: 'ladder-east' },
    { x: 3, y: 12, to: 'seafoam-b1f', spot: 'west-up' }
  ],
  spots: { east: [19, 2, 'down'], west: [2, 2, 'down'], 'ladder-east': [18, 12, 'down'], 'ladder-west': [3, 12, 'down'] },
  boulders: [{ id: 'nook', x: 21, y: 7 }],
  items: [
    { x: 22, y: 6, item: 'ice-heal', flag: 'seafoam-1f-iceheal' },
    { x: 1, y: 10, item: 'max-potion', flag: 'seafoam-1f-maxpotion' }
  ],
  encounters: { walk: '@seafoam-islands-1f' }
});

G.Maps.def({
  id: 'seafoam-b1f', loc: 'seafoam-islands', tileset: 'outdoor', palette: 'seafoam', music: 'cave', battleBg: 'ice', border: '#', cave: true, escape: true,
  rows: [
    '########################',
    '########################',
    '#.....#############...##',
    '#..%..#############.%.##',
    '#.....#############...##',
    '##...###############.###',
    '##...#############....##',
    '#.....############.#.###',
    '#......#####.........###',
    '#......#####.........###',
    '##.....#####.........###',
    '#......#####.........###',
    '#..%...#####......%..###',
    '##....######.........###',
    '###..###########....####',
    '########################'
  ],
  warps: [
    { x: 18, y: 12, to: 'seafoam-1f', spot: 'ladder-east' },
    { x: 20, y: 3, to: 'seafoam-b2f', spot: 'ladder-up' },
    { x: 3, y: 12, to: 'seafoam-1f', spot: 'ladder-west' },
    { x: 3, y: 3, to: 'seafoam-b2f', spot: 'west-up' }
  ],
  spots: { 'ladder-east': [18, 12, 'up'], 'ladder-down': [20, 3, 'down'], 'west-up': [3, 12, 'up'], 'west-down': [3, 3, 'down'] },
  // The boulder in the narrow way up: push it right into the side pocket (from the left of it).
  boulders: [{ id: 'gate', x: 20, y: 6 }],
  items: [
    { x: 12, y: 8, item: 'water-stone', flag: 'seafoam-b1f-waterstone' }
  ],
  encounters: { walk: '@seafoam-islands-b1f' }
});

G.Maps.def({
  id: 'seafoam-b2f', loc: 'seafoam-islands', tileset: 'outdoor', palette: 'seafoam', music: 'cave', battleBg: 'ice', border: '#', cave: true, escape: true,
  rows: [
    '########################',
    '########################',
    '#.....############....##',
    '#..%..############...%##',
    '#.....############....##',
    '##...##############.####',
    '##...##############.####',
    '#.....############...###',
    '#.....######o........###',
    '#.....##############.###',
    '##...###############.###',
    '#....#######o........###',
    '#..%..############....##',
    '#.....############...%##',
    '###..###################',
    '########################'
  ],
  warps: [
    { x: 21, y: 3, to: 'seafoam-b1f', spot: 'ladder-down' },
    { x: 21, y: 13, to: 'seafoam-b3f', spot: 'ladder-east' },
    { x: 12, y: 8, to: 'seafoam-b3f', spot: 'drop-1' },
    { x: 12, y: 11, to: 'seafoam-b3f', spot: 'drop-2' },
    { x: 3, y: 3, to: 'seafoam-b1f', spot: 'west-down' },
    { x: 3, y: 12, to: 'seafoam-b3f', spot: 'ladder-west' }
  ],
  spots: { 'ladder-up': [21, 3, 'down'], 'ladder-down': [21, 13, 'up'], 'west-up': [3, 3, 'down'], 'west-down': [3, 12, 'up'] },
  // Two boulders in two dead-end tunnels, each with a pit at its end: push them in (from the east).
  boulders: [{ id: 'north', x: 15, y: 8 }, { id: 'south', x: 15, y: 11 }],
  signs: {},
  items: [
    { x: 18, y: 13, item: 'big-pearl', flag: 'seafoam-b2f-bigpearl' },
    { x: 1, y: 8, item: 'ultra-ball', flag: 'seafoam-b2f-ultraball' }
  ],
  encounters: { walk: '@seafoam-islands-b2f' }
});

G.Maps.def({
  id: 'seafoam-b3f', loc: 'seafoam-islands', tileset: 'outdoor', palette: 'seafoam', music: 'cave', battleBg: 'ice', border: '#', cave: true, escape: true,
  rows: [
    '##########################',
    '##########################',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~..~~rrr~~~~~~~.....#',
    '#...~~..~~rrr~~~~~~~.....#',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~~~~~rrr~~~~~~......#',
    '#...~~~~~~rrr~~~~~~......#',
    '#.%.~~~~~~rrr~~~~~~...%..#',
    '#...~~~~~~rrr~~~~~~......#',
    '#....~~~~~rrr~~~~~~......#',
    '##########################',
    '##########################'
  ],
  warps: [
    { x: 22, y: 13, to: 'seafoam-b2f', spot: 'ladder-down' },
    { x: 2, y: 13, to: 'seafoam-b2f', spot: 'west-down' }
  ],
  spots: { 'ladder-east': [22, 13, 'up'], 'ladder-west': [2, 13, 'up'], 'drop-1': [21, 4, 'down'], 'drop-2': [21, 9, 'down'] },
  // The current runs down through the middle of the lake until two boulders from B2F dam it.
  calm: ['pit:seafoam-b2f:12,8', 'pit:seafoam-b2f:12,11'], flow: 'down',
  boulders: [
    { id: 'dam-1', x: 10, y: 2, fixed: true, if: 'pit:seafoam-b2f:12,8' },
    { id: 'dam-2', x: 12, y: 2, fixed: true, if: 'pit:seafoam-b2f:12,11' }
  ],
  npcs: [
    { id: 'articuno', who: 'articuno', mon: 'articuno', x: 6, y: 7, dir: 'right', fixed: true, if: '!seafoam-articuno', script: 'seafoam.articuno' }
  ],
  items: [
    { x: 24, y: 2, item: 'nugget', flag: 'seafoam-b3f-nugget' },
    { x: 1, y: 2, item: 'tm13', flag: 'seafoam-b3f-tm13' }
  ],
  encounters: { walk: '@seafoam-islands-b4f' }
});

G.Script.def({
  'seafoam.articuno': [
    ['say', 'The air turns bitterly cold. A great bird made of ice opens its eyes!'],
    ['sfx', 'cry'],
    ['wild', 'articuno', 50],
    ['if', ['battle!=run', 'battle!=lose'], [
      ['setFlag', 'seafoam-articuno'],
      ['hide', 'articuno']
    ], [
      ['if', 'battle=run', [['say', 'Articuno is still watching you from its icy ledge.']]]
    ]]
  ]
});
