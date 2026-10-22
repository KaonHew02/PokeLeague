/* ============ route1.js — Route 1: Pallet Town to Viridian City ============
 * Tall grass with Pidgey and Rattata (the games' Route 1 table), ledges you can only
 * hop down (a quick way back to Pallet Town), and a Poké Mart clerk handing out a
 * free Potion. No trainers, as in the games. Viridian City connects north (viridian.js).
 */
G.Maps.def({
  id: 'route1', loc: 'kanto-route-1', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTT,,TTTTTTTTT',
    'TT.......,,.......TT',
    'T..""""..,,..""""..T',
    'T..""""..,,..""""..T',
    'T..""""..,,..""""..T',
    'T........,,........T',
    'TTvvvvvvv,,vvvvvvvTT',
    'T........,,........T',
    'T."""""".,,..TT....T',
    'T."""""".,,..TT....T',
    'T."""""".,,........T',
    'T........,,,,,,....T',
    'T....S.......,,....T',
    'T............,,..f.T',
    'TTvvvvvvvvvv.,,vvvTT',
    'T............,,....T',
    'T..""""".....,,""".T',
    'T..""""".....,,""".T',
    'T..""""".....,,""".T',
    'T............,,....T',
    'T....,,,,,,,,,,....T',
    'T....,,............T',
    'TTTvv,,vvvvvvvvvvvTT',
    'T....,,............T',
    'T.ff.,,..""""""....T',
    'T.ff.,,..""""""....T',
    'T....,,..""""""....T',
    'T....,,............T',
    'T....,,,,,,........T',
    'T........,,........T',
    'T..TT....,,....TT..T',
    'T..TT....,,....TT..T',
    'TTvvvvvvv,,vvvvvvvTT',
    'T.......S,,........T',
    'T........,,........T',
    'TTTTTTTTT,,TTTTTTTTT'
  ],
  connect: { south: { map: 'pallet', offset: 0 }, north: { map: 'viridian', offset: -8 } },
  spots: { south: [9, 34, 'up'], north: [9, 1, 'down'] },
  signs: {
    '5,12': 'Trainer Tips: wild Pokémon hide in tall grass. Weaken one in battle before you throw a Poké Ball!',
    '8,33': 'Route 1. North: Viridian City. South: Pallet Town.'
  },
  npcs: [
    { id: 'clerk', who: 'clerk', x: 11, y: 29, dir: 'left', script: 'route1.clerk' },
    { id: 'kid', who: 'youngster', x: 12, y: 7, dir: 'down', move: 'look',
      say: 'See those ledges? You can hop down them, but never back up. Handy for a quick trip home to Pallet Town!' }
  ],
  encounters: { walk: '@kanto-route-1-area' }
});

G.Script.def({
  'route1.clerk': [
    ['if', 'got-route1-potion', [
      ['say', 'Drop by the Poké Mart in Viridian City. We have everything a Trainer needs!']
    ], [
      ['say', 'Hi there! I work at the Poké Mart in Viridian City.'],
      ['say', "Here, have a free sample. It's on the house!"],
      ['giveItem', 'potion', 1],
      ['setFlag', 'got-route1-potion'],
      ['say', 'Drop by the Poké Mart in Viridian City. We have everything a Trainer needs!']
    ]]
  ]
});
