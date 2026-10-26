/* ============ route2.js — Route 2: Viridian City to Viridian Forest ============
 * The southern half of Route 2: tall grass (Pidgey, Rattata, Caterpie, Weedle), ledges
 * down towards Viridian City, an item ball. The path in the top-left corner enters
 * Viridian Forest (forest.js); Pewter City lies beyond it.
 */
G.Maps.def({
  id: 'route2', loc: 'kanto-route-2', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTT,,TTTTTTTTTTTTTTTTTTTTTT',
    'TT..,,.............TT#####TT',
    'T...,,..""""""....TTT##O##TT',
    'T...,,..""""""....TTT..,...T',
    'T...,,..""""""....TTT..,...T',
    'T...,,............TTT"","""T',
    'T...,,,,,,,,,,....TTT"","""T',
    'T............,,...TTT..,...T',
    'TTvvvvvvvvvv.,,vvvTTT..,..ST',
    'T............,,....TTHHHH..T',
    'T..""""""....,,..S.TTHHHH..T',
    'T..""""""....,,....TTHHDH..T',
    'T..""""""....,,....TT..,...T',
    'T............,,....TT..,...T',
    'T....,,,,,,,,,,....TT"","""T',
    'T....,,............TT"","""T',
    'TTTvv,,vvvvvvvvvvvTTT"","""T',
    'T....,,............TT..,...T',
    'T....,,..""""""....TT..,...T',
    'T....,,..""""""....TT..,...T',
    'T....,,..""""""....TT..,...T',
    'T....,,............c...,...T',
    'T....,,,,,,........TT......T',
    'T........,,........TT......T',
    'T..TT....,,....TT..TT......T',
    'TTvvvvvvv,,vvvvvvvTTTTTTTTTT',
    'T........,,........TTTTTTTTT',
    'TTTTTTTTT,,TTTTTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'viridian', offset: -8 }, north: { map: 'viridian-forest', offset: -8 } },
  warps: [{ x: 23, y: 2, to: 'digletts-cave', spot: 'north' }, { x: 23, y: 11, to: 'route2-house', spot: 'door' }],
  spots: { south: [9, 26, 'up'], north: [4, 1, 'down'], cave: [23, 3, 'down'], 'house-door': [23, 12, 'down'] },
  signs: {
    '17,10': 'Route 2. North: Viridian Forest and Pewter City. South: Viridian City.',
    '26,8': "Diglett's Cave. A tunnel dug by wild Diglett, all the way to Route 11 near Vermilion City."
  },
  npcs: [
    { id: 'kid', who: 'youngster', x: 15, y: 15, move: 'look',
      say: "Viridian Forest is a maze of trees, and it's full of Bug Catchers. Bring some Potions!" }
  ],
  items: [
    { x: 2, y: 13, item: 'potion', flag: 'route2-potion' },
    { x: 16, y: 12, item: 'poke-ball', flag: 'route2-ball' },
    { x: 25, y: 16, item: 'ether', flag: 'route2-ether' },
    { x: 21, y: 23, item: 'max-potion', flag: 'route2-hidden-potion', hidden: true }
  ],
  encounters: { walk: '@kanto-route-2-south-towards-viridian-city' }
});
