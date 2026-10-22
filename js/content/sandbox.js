/* ============ sandbox.js — a small test area for the overworld (dev only) ============
 * dev.html?debug&map=sandbox — every tile, a house with an upstairs, a Center,
 * a Mart, ledges (down and sideways), tall grass, a pond, signs, people (one
 * wanders, one asks Yes/No), a trainer with a sight line, an item ball, a
 * hidden item, a trigger, and a connection north to a second map.
 * Not part of the story: the Kanto maps live in js/content/kanto/ (M6).
 */
G.Maps.def({
  id: 'sandbox', loc: 'pallet-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTT,,,,TTTTTTTTTTT',
    'T..........,,,,..........T',
    'T.HHHH.....,,,,....CCCCC.T',
    'T.HHHH.....,,,,....CCCCC.T',
    'T.HDHH..S..,,,,....CCCCC.T',
    'T..,,......,,,,....CCDCC.T',
    'T..,,,,,,,,,,,,,,,,,,,,,.T',
    'T..f.ff....,,,,......,...T',
    'T..ffff....,,,,..MMMM,...T',
    'T..........,,,,..MMMM,...T',
    'T.FFFFFF...,,,,..MDMM,...T',
    'T..........,,,,..,,,,....T',
    'Tvvvvvvvv..,,,,..........T',
    'T"""""""...,,,,...~~~~...T',
    'T"""""""...,,,,..~~~~~~..T',
    'T"""""""...,,,,..~~~~~~..T',
    'T..........,,,,...~~~~...T',
    'T......<.>.,,,,..........T',
    'T::::::::..,,,,..........T',
    'T::::::::..,,,,.....S....T',
    'T..........,,,,..........T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { north: { map: 'sandbox-north', offset: 5 } },
  warps: [
    { x: 3, y: 4, to: 'sandbox-house', spot: 'door' },
    { x: 21, y: 5, to: 'sandbox-center', spot: 'door' },
    { x: 18, y: 10, to: 'sandbox-mart', spot: 'door' }
  ],
  spots: {
    start: [12, 8, 'down'],
    'house-door': [3, 5, 'down'],
    'center-door': [21, 6, 'down'],
    'mart-door': [18, 11, 'down']
  },
  signs: {
    '8,4': 'Sandbox Town. A quiet place to try things out.',
    '20,19': 'Pond ahead. Wild Pokémon hide in the tall grass to the west.'
  },
  npcs: [
    { id: 'walker', who: 'lass', x: 8, y: 2, move: 'wander', r: 2, say: 'The first Pokémon in your party follows you around. Isn\'t that sweet?' },
    { id: 'guide', who: 'guide', x: 9, y: 8, dir: 'down', script: 'sandbox.guide' },
    { id: 'kid', who: 'youngster', x: 23, y: 11, move: 'look', say: 'I tried to jump back up that ledge. No luck!' }
  ],
  trainers: [
    { id: 'sam', who: 'bugcatcher', cls: 'bug-catcher', name: 'Sam', x: 16, y: 15, dir: 'left', sight: 4,
      team: [['caterpie', 4], ['weedle', 4]],
      before: 'Hey! You walked right into my bug net range! Let\'s battle!',
      defeat: 'My bugs got squashed...',
      after: 'I\'ll catch tougher bugs in the forest next time.' }
  ],
  items: [
    { x: 1, y: 16, item: 'potion', flag: 'potion-1' },
    { x: 24, y: 20, item: 'rare-candy', flag: 'hidden-candy', hidden: true }
  ],
  triggers: [
    { x: 11, y: 1, w: 4, h: 1, if: ['!sandbox-north-note'], script: 'sandbox.north-note' }
  ],
  encounters: { walk: '@kanto-route-1-area' }
});

G.Maps.def({
  id: 'sandbox-north', loc: 'kanto-route-1', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTT',
    'T..............T',
    'T..""""....f...T',
    'T..""""........T',
    'T......S.......T',
    'T.....,,,,.....T',
    'T.....,,,,..#..T',
    'T.....,,,,.###.T',
    'T.....,,,,.....T',
    'T.....,,,,.....T',
    'T.....,,,,.....T',
    'TTTTTT,,,,TTTTTT'
  ],
  connect: { south: { map: 'sandbox', offset: -5 } },
  spots: { start: [7, 9, 'up'] },
  signs: { '7,4': 'Sandbox Path. The town is just south.' },
  npcs: [{ id: 'camper', who: 'camper', x: 12, y: 3, dir: 'left', say: 'The grass up here has the same Pokémon as Route 1.' }],
  encounters: { walk: '@kanto-route-1-area' }
});

G.Maps.def({
  id: 'sandbox-house', loc: 'pallet-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWW',
    'WWWWWWWWW',
    'bb___p_^_',
    '_________',
    '__rrr____',
    '__rtr____',
    '__rrr____',
    '___X_____'
  ],
  warps: [
    { x: 3, y: 7, to: 'sandbox', spot: 'house-door' },
    { x: 7, y: 2, to: 'sandbox-house-2f', spot: 'stairs' }
  ],
  spots: { door: [3, 7, 'up'], stairs: [7, 3, 'down'] },
  signs: { '0,2': 'Books about Pokémon. One is titled "Raising Your First Partner".', '1,2': 'Books about Pokémon. One is titled "Raising Your First Partner".' },
  npcs: [{ id: 'mom', who: 'mom', x: 6, y: 4, dir: 'left', script: 'sandbox.mom' }]
});

G.Maps.def({
  id: 'sandbox-house-2f', loc: 'pallet-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWW',
    'WWWWWWW',
    'P__b_^_',
    '_______',
    '_rr____',
    '_rr____'
  ],
  warps: [{ x: 5, y: 2, to: 'sandbox-house', spot: 'stairs' }],
  spots: { stairs: [5, 3, 'down'] },
  signs: { '3,2': 'Old game magazines are piled up on the shelf.' }
});

G.Maps.center('sandbox-center', { loc: 'pallet-town', exit: { map: 'sandbox', spot: 'center-door' } });
G.Maps.mart('sandbox-mart', { loc: 'pallet-town', exit: { map: 'sandbox', spot: 'mart-door' }, stock: ['poke-ball', 'potion', 'antidote', 'paralyze-heal'] });

G.Script.def({
  'sandbox.guide': [
    ['choice', 'Hi! Want a tip about getting around faster?', [
      ['say', 'Hold B or Shift while you walk, and you\'ll run!'],
      ['say', 'On a phone, just tap where you want to go.']
    ], [
      ['say', 'All right. Have fun exploring!']
    ]]
  ],
  'sandbox.mom': [
    ['if', 'mom-gave-potion', [
      ['say', 'Take care out there, {player}!']
    ], [
      ['say', 'Oh, {player}! Going out again? Here, take this with you.'],
      ['giveItem', 'potion', 2],
      ['setFlag', 'mom-gave-potion'],
      ['say', 'Come home if your Pokémon get tired.']
    ]]
  ],
  'sandbox.north-note': [
    ['emote', 'player', '?'],
    ['say', 'A path leads north out of town.'],
    ['setFlag', 'sandbox-north-note']
  ]
});
