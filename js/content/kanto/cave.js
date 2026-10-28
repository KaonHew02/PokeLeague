/* ============ cave.js — Cerulean Cave and Mewtwo ============
 * Chapter 10, after the League. Across the pond in Cerulean City a cave mouth opens in the rocks;
 * a guard keeps everyone out until they are the Champion (flag champion). Inside, the strongest
 * wild Pokémon of Kanto (the games' tables, Lv. 46 to 67) on three floors: 1F, a river to Surf
 * across to the ladder up; 2F, a winding way to the ladder back down into a closed part of 1F;
 * B1F, an underground lake to Surf across, and Mewtwo (Lv. 70, flag cave-mewtwo). Meeting it
 * ends the chapter (G.CreditsUI.ending(10)).
 */
const CAVE = { loc: 'cerulean-cave', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true };

G.Maps.def(Object.assign({
  id: 'cave-1f',
  rows: [
    '################################',
    '################################',
    '##...........###################',
    '##.%......%..###################',
    '##...........###################',
    '##...........###################',
    '##....###....###################',
    '##....###....###################',
    '##...........###################',
    '##...........###################',
    '##...........###################',
    '################################',
    '#############~~~..............##',
    '#############~~~...........%..##',
    '#############~~~..............##',
    '##...........~~~....###.......##',
    '##...........~~~....###.......##',
    '##...##......~~~..............##',
    '##...##......~~~.~~...........##',
    '##...........~~~.~~......##...##',
    '##...........~~~.~~......##...##',
    '##...........~~~..............##',
    '##...........~~~..............##',
    '#####O##########################'
  ],
  warps: [
    { x: 5, y: 23, to: 'cerulean', spot: 'cave-door' },
    { x: 27, y: 13, to: 'cave-2f', spot: 'from-1f' },
    { x: 10, y: 3, to: 'cave-2f', spot: 'to-1f' },
    { x: 3, y: 3, to: 'cave-b1f', spot: 'from-1f' }
  ],
  spots: { entrance: [5, 22, 'up'], 'ladder-east': [27, 13, 'down'], 'ladder-north': [10, 3, 'down'], 'ladder-down': [3, 3, 'down'] },
  items: [
    { x: 3, y: 16, item: 'ultra-ball', flag: 'cave-1f-ball' },
    { x: 28, y: 21, item: 'max-revive', flag: 'cave-1f-revive' },
    { x: 11, y: 2, item: 'full-restore', flag: 'cave-1f-restore' },
    { x: 29, y: 12, item: 'pp-up', flag: 'cave-1f-hidden', hidden: true }
  ],
  encounters: { walk: '@cerulean-cave-1f' }
}, CAVE));

G.Maps.def(Object.assign({
  id: 'cave-2f',
  rows: [
    '############################',
    '############################',
    '##......##................##',
    '##..%...##..........###...##',
    '##......##..........###...##',
    '##......##................##',
    '##......##.~~~~.##........##',
    '##......##.~~~~.##........##',
    '##......##.~~~~.##........##',
    '##......##.~~~~.##........##',
    '##......##......##........##',
    '##......##......##........##',
    '##.###..........##........##',
    '##.###..........##........##',
    '##..............##........##',
    '##..............##......%.##',
    '############################',
    '############################'
  ],
  warps: [{ x: 24, y: 15, to: 'cave-1f', spot: 'ladder-east' }, { x: 4, y: 3, to: 'cave-1f', spot: 'ladder-north' }],
  spots: { 'from-1f': [24, 15, 'up'], 'to-1f': [4, 3, 'down'] },
  items: [
    { x: 12, y: 3, item: 'rare-candy', flag: 'cave-2f-candy' },
    { x: 2, y: 15, item: 'max-elixir', flag: 'cave-2f-elixir' },
    { x: 25, y: 2, item: 'ultra-ball', flag: 'cave-2f-ball' }
  ],
  encounters: { walk: '@cerulean-cave-2f' }
}, CAVE));

G.Maps.def(Object.assign({
  id: 'cave-b1f',
  rows: [
    '##############################',
    '##############################',
    '#########.............########',
    '#########.............########',
    '#########.............########',
    '#########.............########',
    '#########.............########',
    '##~~~~~~~.............~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~###~~~~~~~~~~~~##',
    '##~~~~~~~~~~~###~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##..........................##',
    '##...................##.....##',
    '##.......##..........##.....##',
    '##.......##.................##',
    '##.%........................##',
    '##..........................##',
    '##############################'
  ],
  warps: [{ x: 3, y: 19, to: 'cave-1f', spot: 'ladder-down' }],
  spots: { 'from-1f': [3, 19, 'up'] },
  npcs: [
    { id: 'mewtwo', who: 'mewtwo', mon: 'mewtwo', x: 15, y: 3, dir: 'down', fixed: true, if: '!cave-mewtwo', script: 'cave.mewtwo' }
  ],
  items: [
    { x: 26, y: 19, item: 'max-elixir', flag: 'cave-b1f-elixir' },
    { x: 20, y: 6, item: 'ultra-ball', flag: 'cave-b1f-ball' },
    { x: 10, y: 2, item: 'max-revive', flag: 'cave-b1f-hidden', hidden: true }
  ],
  encounters: { walk: '@cerulean-cave-b1f', water: '@cerulean-cave-b1f' }
}, CAVE));

G.Script.def({
  'cerulean.cave-guard': [
    ['say', 'Whoa, stop right there! This cave is full of terrifyingly strong Pokémon.'],
    ['say', 'Only the Champion of the Pokémon League may go in. Rules of the League, sorry!']
  ],
  'cave.mewtwo': [
    ['say', 'The air grows heavy. A Pokémon born from science opens its eyes and stares straight into your mind...'],
    ['sfx', 'cry'],
    ['wild', 'mewtwo', 70],
    ['if', ['battle!=run', 'battle!=lose'], [
      ['setFlag', 'cave-mewtwo'],
      ['hide', 'mewtwo'],
      ['if', '!chapter-10-done', [
        // The end of the tenth chapter (credits-ui.js).
        ['js', () => (G.CreditsUI ? G.CreditsUI.ending(10) : G.Field.setFlag('chapter-10-done'))]
      ]]
    ], [
      ['if', 'battle=run', [['say', 'Mewtwo is still there, silent, waiting for you.']]]
    ]]
  ]
});
