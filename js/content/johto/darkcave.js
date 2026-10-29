/* ============ darkcave.js — the Dark Cave and its hollow ============
 * Chapter 23. Between Violet City and Blackthorn City: a mouth on Route 31 (cherrygrove.js) and
 * one on Route 45 (route45.js). The cave is dark (Flash). On the Violet side a hiker gives HM06
 * Rock Smash (flag got-hm06); cracked rocks (`k`, field.js) close its passages, and a wild Pokémon
 * may be under one (Dunsparce, the games' rock-smash table). Its lake climbs by a waterfall to a
 * ladder up to the Blackthorn side: a hall with two Trainers and the mouth to Route 45, and past
 * another cracked rock an underground river (Surf) to a hollow open to the sky, where the only
 * black Apricorn tree grows (kurt.js). Seven items in the cave, one in the hollow.
 */
(() => {
  const DARK = { loc: 'dark-cave', region: 'johto', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#',
                 cave: true, dark: true, escape: true };
  const HIKER = { name: 'Hiker' };
  const T = s => G.T(s);

  // ---------------- the Violet side ----------------
  G.Maps.def(Object.assign({
    id: 'dark-cave-violet',
    rows: [
      '############################',
      '###################.....%###',
      '##.......#...######~~~~~####',
      '##....#......######~~~~~####',
      '##...........######~~~~~####',
      '##..#######...#######|######',
      '##..#######.k.#######|######',
      '##.########...#......~....##',
      '##..#######......~~~~~~~~~.#',
      '##..#######......~~~~~~~~~.#',
      '##..##########...~~~~~~~~~.#',
      '##..##########...~~~~~..~~.#',
      '##k###########...~~~~~..~~.#',
      '##.......#####...~~~~~~~~~.#',
      '#......##.####...~~~~~~~~~.#',
      '#.........#..k...~~~~~~~~~.#',
      '#.........k................#',
      '#.........#..k.............#',
      '##........####............##',
      '####O#######################'
    ],
    warps: [{ x: 4, y: 19, to: 'route31', spot: 'dark-cave' }, { x: 24, y: 1, to: 'dark-cave-blackthorn', spot: 'ladder' }],
    spots: { mouth: [4, 18, 'up'], ladder: [24, 1, 'down'] },
    npcs: [{ id: 'hiker', who: 'hiker', x: 6, y: 16, dir: 'left', script: 'darkcave.hiker' }],
    items: [
      { x: 3, y: 5, item: 'full-heal', flag: 'darkcave-fullheal' },
      { x: 12, y: 2, item: 'ether', flag: 'darkcave-ether' },
      { x: 23, y: 11, item: 'revive', flag: 'darkcave-revive' },
      { x: 15, y: 17, item: 'hyper-potion', flag: 'darkcave-hyperpotion' }
    ],
    encounters: { walk: '@dark-cave-violet-city-entrance' }
  }, DARK));

  // ---------------- the Blackthorn side ----------------
  G.Maps.def(Object.assign({
    id: 'dark-cave-blackthorn',
    rows: [
      '##########################',
      '########O#################',
      '##..............##########',
      '#................#....####',
      '#..........#.....#.....###',
      '#....##....#.....k.....###',
      '#................#.....###',
      '#.............#..#.....###',
      '##..............##.....###',
      '####...############~~~####',
      '####...############~~~####',
      '#####..############~~~####',
      '####...############~~~####',
      '####...############~~~####',
      '####...############~~~####',
      '##......###########~~~####',
      '#........#########......##',
      '#........#########.......#',
      '#.....#..#########.......#',
      '#.%......##########......#',
      '#........############O####',
      '##########################'
    ],
    warps: [
      { x: 8, y: 1, to: 'route45', spot: 'dark-cave' },
      { x: 2, y: 19, to: 'dark-cave-violet', spot: 'ladder' },
      { x: 21, y: 20, to: 'dark-cave-hollow', spot: 'mouth' }
    ],
    spots: { mouth: [8, 2, 'down'], ladder: [2, 19, 'down'], hollow: [21, 19, 'up'] },
    trainers: [
      { id: 'gordon', who: 'hiker', cls: 'hiker', name: 'Gordon', x: 10, y: 7, dir: 'up', sight: 3,
        team: [['graveler', 40], ['onix', 41], ['golem', 42]],
        before: 'I come down here to train in the dark. My Pokémon can feel their way better than any light!',
        defeat: 'I did not see that coming. Then again, I see nothing down here.',
        after: 'The rocks here are all cracked from the last earthquake. A good Rock Smash clears them.' },
      { id: 'kaito', who: 'blackbelt', cls: 'black-belt', name: 'Kaito', x: 15, y: 5, dir: 'left', sight: 3,
        team: [['machoke', 41], ['primeape', 41], ['hitmonlee', 42]],
        before: 'Training in total darkness sharpens every sense. Let me test mine on you!',
        defeat: 'My senses were sharp, but your Pokémon were sharper.',
        after: 'Past that rock, the river runs to a place where light comes down from above. Strange, in a cave like this.' }
    ],
    items: [
      { x: 21, y: 4, item: 'max-revive', flag: 'darkcave-maxrevive' },
      { x: 1, y: 20, item: 'max-ether', flag: 'darkcave-maxether' },
      { x: 23, y: 18, item: 'ultra-ball', flag: 'darkcave-ultraball' }
    ],
    encounters: { walk: '@dark-cave-blackthorn-city-entrance' }
  }, DARK));

  // ---------------- the hollow: open to the sky ----------------
  G.Maps.def({
    id: 'dark-cave-hollow', loc: 'dark-cave', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass',
    border: '#', escape: true,
    rows: [
      '##############',
      '###.........##',
      '#........~~~##',
      '#.....y..~~~.#',
      '#............#',
      '#............#',
      '#.fff........#',
      '#.fff....fff.#',
      '#.fff....fff.#',
      '##..........##',
      '#######O######',
      '##############'
    ],
    warps: [{ x: 7, y: 10, to: 'dark-cave-blackthorn', spot: 'hollow' }],
    spots: { mouth: [7, 9, 'up'] },
    berries: [[6, 3, 'black-apricorn']],
    triggers: [{ x: 2, y: 8, w: 10, h: 1, if: '!hollow-seen', script: 'darkcave.hollow' }],
    items: [{ x: 2, y: 2, item: 'moon-stone', flag: 'darkcave-moonstone' }]
  });

  /** The hiker on the Violet side: HM06, Rock Smash. */
  async function hiker(h) {
    const F = G.Field;
    if (!F.flag('got-hm06')) {
      await h.say(T('Whoa, careful! It is so dark in here that I cannot even see my own boots.'), HIKER);
      await h.say(T('The last earthquake dropped rocks all over these passages. I have been smashing my way through them for days.'), HIKER);
      await h.say(T('You look like you need this more than I do. HM06 is Rock Smash: a Pokémon that knows it can break cracked rocks.'), HIKER);
      F.giveItem('hm06', 1);
      F.setFlag('got-hm06');
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('hm06') } });
      await j;
      await h.say(T('Sometimes a Pokémon is hiding under a rock. The Dunsparce here love the dark!'), HIKER);
      return;
    }
    await h.say(T('Smash the cracked rocks and keep going. They say there is a hollow somewhere in here where the sun comes in.'), HIKER);
  }

  G.Script.def({
    'darkcave.hiker': [['js', hiker]],
    'darkcave.hollow': [
      ['say', 'Light pours in through a crack high above. In the middle of the sunlit hollow, a lone tree is hung with black fruit.'],
      ['setFlag', 'hollow-seen']
    ]
  });
})();
