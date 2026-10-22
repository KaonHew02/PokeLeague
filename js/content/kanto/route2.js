/* ============ route2.js — Route 2: Viridian City to Viridian Forest ============
 * The southern half of Route 2: tall grass (Pidgey, Rattata, Caterpie, Weedle), ledges
 * down towards Viridian City, an item ball. The path in the top-left corner enters
 * Viridian Forest (forest.js); Pewter City lies beyond it.
 */
G.Maps.def({
  id: 'route2', loc: 'kanto-route-2', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTT,,TTTTTTTTTTTTTT',
    'TT..,,.............T',
    'T...,,..""""""....TT',
    'T...,,..""""""....TT',
    'T...,,..""""""....TT',
    'T...,,............TT',
    'T...,,,,,,,,,,....TT',
    'T............,,...TT',
    'TTvvvvvvvvvv.,,vvvTT',
    'T............,,....T',
    'T..""""""....,,..S.T',
    'T..""""""....,,....T',
    'T..""""""....,,....T',
    'T............,,....T',
    'T....,,,,,,,,,,....T',
    'T....,,............T',
    'TTTvv,,vvvvvvvvvvvTT',
    'T....,,............T',
    'T....,,..""""""....T',
    'T....,,..""""""....T',
    'T....,,..""""""....T',
    'T....,,............T',
    'T....,,,,,,........T',
    'T........,,........T',
    'T..TT....,,....TT..T',
    'TTvvvvvvv,,vvvvvvvTT',
    'T........,,........T',
    'TTTTTTTTT,,TTTTTTTTT'
  ],
  connect: { south: { map: 'viridian', offset: -8 } },
  spots: { south: [9, 26, 'up'], north: [4, 1, 'down'] },
  signs: { '17,10': 'Route 2. North: Viridian Forest and Pewter City. South: Viridian City.' },
  npcs: [
    { id: 'kid', who: 'youngster', x: 15, y: 15, move: 'look',
      say: "Viridian Forest is a maze of trees, and it's full of Bug Catchers. Bring some Potions!" }
  ],
  items: [
    { x: 2, y: 13, item: 'potion', flag: 'route2-potion' },
    { x: 16, y: 12, item: 'poke-ball', flag: 'route2-ball' }
  ],
  encounters: { walk: '@kanto-route-2-south-towards-viridian-city' }
});
