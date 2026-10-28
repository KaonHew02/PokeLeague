/* ============ plant.js — the Power Plant and Zapdos ============
 * Chapter 10. A river now runs down the east side of Route 10, through the forest to a clearing
 * with the old Power Plant (Surf). Nobody works there any more: electric Pokémon roam the halls
 * (wild Pokémon on every step, the games' table), three of the "items" on the floor are Voltorb
 * and Electrode lying in wait (the item is gone once they jump out, flags power-plant:trap-*), and
 * Zapdos rests in the far hall (Lv. 50, flag plant-zapdos).
 */
G.Maps.def({
  id: 'power-plant', loc: 'kanto-power-plant', tileset: 'indoor', palette: 'hideout', music: 'cave', battleBg: 'indoor', cave: true, escape: true,
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWW',
    '+bb++P++++bbbP+W++bb+++++P',
    '+++++++W+++++++W++++++++++',
    '+++++++W+++++++W++++++++++',
    '+++++++W+++++++W++++++++++',
    '+++++++W+++++++W++++++++++',
    '+++++++W+++++++W++++++++++',
    '+++++++W+++++++W++++++++++',
    '+bb++++W++bb+++W++++++++b+',
    '+++++++W+++++++W++bb++++b+',
    '+++++++W+++++++W++++++++++',
    '+++++++W+++++++W++++++++++',
    '+++++++W+++++++W++++++++++',
    '+++++++W++++++++++++++++++',
    '+++++++W++++++++++++++++++',
    '+++++++W++++++++++++++++++',
    'WWWXWWWWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [{ x: 3, y: 17, to: 'route10', spot: 'plant-door' }],
  spots: { door: [3, 17, 'up'] },
  signs: {
    '5,2': 'A PC full of old power readings. The last entry is years old.',
    '13,2': 'A PC full of old power readings. The last entry is years old.',
    '25,2': 'A PC full of old power readings. The last entry is years old.'
  },
  npcs: [
    { id: 'zapdos', who: 'zapdos', mon: 'zapdos', x: 22, y: 3, dir: 'down', fixed: true, if: '!plant-zapdos', script: 'plant.zapdos' }
  ],
  items: [
    { x: 12, y: 5, item: 'thunder-stone', flag: 'plant-stone' },
    { x: 24, y: 15, item: 'tm25', flag: 'plant-tm25' },
    { x: 1, y: 12, item: 'carbos', flag: 'plant-carbos' },
    { x: 20, y: 13, item: 'max-elixir', flag: 'plant-elixir' },
    { x: 4, y: 8, item: 'poke-ball', flag: 'trap-1', script: 'plant.voltorb' },
    { x: 10, y: 13, item: 'poke-ball', flag: 'trap-2', script: 'plant.electrode' },
    { x: 19, y: 6, item: 'poke-ball', flag: 'trap-3', script: 'plant.electrode' }
  ],
  encounters: { walk: '@kanto-power-plant-area' }
});

(() => {
  /** An item that is really a Pokémon: it is gone once it jumps out, whatever happens next. */
  const trap = sp => [
    ['js', h => G.Field.markDone(h.ctx.item.key)],
    ['say', "It's not an item... It's a Pokémon!"],
    ['wild', sp, 34]
  ];
  G.Script.def({
    'plant.voltorb': trap('voltorb'),
    'plant.electrode': trap('electrode'),
    'plant.zapdos': [
      ['say', 'Sparks crackle in the air. A great bird of lightning spreads its wings!'],
      ['sfx', 'cry'],
      ['wild', 'zapdos', 50],
      ['if', ['battle!=run', 'battle!=lose'], [
        ['setFlag', 'plant-zapdos'],
        ['hide', 'zapdos']
      ], [
        ['if', 'battle=run', [['say', 'Zapdos is still watching you, crackling with electricity.']]]
      ]]
    ]
  });
})();
