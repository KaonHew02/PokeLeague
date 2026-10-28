/* ============ route38.js — Routes 38 and 39 and Moomoo Farm ============
 * Chapter 15. West of Ecruteak City, Route 38 (four Trainers, berry trees) turns south into
 * Route 39 and Moomoo Farm: its Miltank in the barn is sick. Feed it five healing Berries (Oran
 * or Sitrus, var miltank-fed) and it gets well (flag miltank-healthy); the farmer then gives TM44
 * Rest (flag got-tm44) and sells Moomoo Milk. Route 39 goes on south to Olivine City.
 */
G.Maps.def({
  id: 'route38', loc: 'johto-route-38', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T.......TTTTTTT........................T',
    'T.......TTTTTTT."""""""""""""""........T',
    'T.h.....TTTTTTT."""""""""""""""........T',
    'T.......TTTTTTT."""""""""""""""........T',
    'T.......TTTTTTT."""""""""""""""...y.y..T',
    'T..............."""""""""""""""........T',
    'T....................................S.T',
    'T...,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T...,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T...,,.................................T',
    'T...,,S."""""""""""""...TTTTTTTTT......T',
    'T...,,.."""""""""""""...TTTTTTTTT......T',
    'T...,,.."""""""""""""...TTTTTTTTT......T',
    'T...,,.."""""""""""""...TTTTTTTTT......T',
    'TTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'ecruteak', offset: -10 }, south: { map: 'route39', offset: -6 } },
  berries: [[34, 5, 'oran-berry'], [36, 5, 'pecha-berry']],
  signs: {
    '37,7': 'Route 38. Ecruteak City is to the east.',
    '6,11': 'Route 38. Route 39 and Olivine City are to the south.'
  },
  trainers: [
    { id: 'toby', who: 'birdkeeper', cls: 'bird-keeper', name: 'Toby', x: 22, y: 7, dir: 'down', sight: 2,
      team: [['doduo', 24], ['doduo', 24], ['dodrio', 26]],
      before: 'My Doduo have two heads, so they think twice as fast. Battle!',
      defeat: 'Both heads lost...',
      after: 'Dodrio has three heads now. It argues with itself all day.' },
    { id: 'dana', who: 'lass', cls: 'lass', name: 'Dana', x: 12, y: 10, dir: 'up', sight: 2,
      team: [['flaaffy', 24], ['psyduck', 25]],
      before: 'I was on my way to buy Moomoo Milk. A battle first!',
      defeat: 'I think I need some milk now...',
      after: 'Moomoo Milk is the best drink for tired Pokémon. Everyone in Olivine buys it.' },
    { id: 'chad', who: 'youngster', cls: 'youngster', name: 'Chad', x: 30, y: 10, dir: 'up', sight: 2,
      team: [['mr-mime', 26]],
      before: 'Mr. Mime can build invisible walls. Can you break through?',
      defeat: 'The wall broke...',
      after: 'Mr. Mime\'s walls are made of the air itself. I still do not understand how.' },
    { id: 'harry', who: 'sailor', cls: 'sailor', name: 'Harry', x: 6, y: 13, dir: 'left', sight: 2,
      team: [['wooper', 24], ['quagsire', 26]],
      before: 'I am on shore leave, but a sailor never stops battling!',
      defeat: 'Sunk on dry land...',
      after: 'My ship is docked in Olivine. The sea air there is the best.' }
  ],
  encounters: { walk: '@johto-route-38-area' }
});

G.Maps.def({
  id: 'route39', loc: 'johto-route-39', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTT,,TTTTTTTTTTTT',
    'T.........,,...........T',
    'T.........,,S..........T',
    'T.........,,.FFFFFFFFF.T',
    'T.........,,.F.......F.T',
    'T.........,,.F.......F.T',
    'T.HHHH....,,.F.......F.T',
    'T.HHHH....,,.F.......F.T',
    'T.HDHH....,,.F.......F.T',
    'T..,,,,,,,,,.F.......F.T',
    'T.........,,.F.......F.T',
    'T.........,,.F.......F.T',
    'T.HHHH....,,.F.......F.T',
    'T.HHHH....,,.FFFFFFFFF.T',
    'T.HDHH....,,...........T',
    'T..,,,,,,,,,........h..T',
    'T........S,,...........T',
    'T.........,,.""""""""".T',
    'T.y.....y.,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.""""""".,,.""""""""".T',
    'T.""""""".,,.""""""""".T',
    'T.""""""".,,.""""""""".T',
    'T.""""""".,,.""""""""".T',
    'T.""""""".,,.""""""""".T',
    'T.""""""".,,.""""""""".T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.........,,..TTTTTTTT.T',
    'T.........,,..TTTTTTTT.T',
    'T.........,,..TTTTTTTT.T',
    'T.........,,..TTTTTTTT.T',
    'T.........,,..TTTTTTTT.T',
    'T.........,,...........T',
    'TTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { north: { map: 'route38', offset: 6 }, south: { map: 'olivine', offset: -10 } },
  warps: [{ x: 3, y: 8, to: 'moomoo-house', spot: 'door' }, { x: 3, y: 14, to: 'moomoo-barn', spot: 'door' }],
  spots: { 'house-door': [3, 9, 'down'], 'barn-door': [3, 15, 'down'] },
  berries: [[2, 18, 'oran-berry'], [8, 18, 'oran-berry']],
  signs: {
    '12,2': 'Route 39. Olivine City is to the south.',
    '9,16': 'Moomoo Farm. Enjoy our fresh Moomoo Milk!'
  },
  npcs: [
    { id: 'miltank1', who: 'miltank', mon: 'miltank', x: 15, y: 6, dir: 'down', fixed: true, say: 'Moo! The Miltank is chewing grass happily.' },
    { id: 'miltank2', who: 'miltank', mon: 'miltank', x: 18, y: 9, dir: 'left', fixed: true, say: 'Moooo!' },
    { id: 'miltank3', who: 'miltank', mon: 'miltank', x: 16, y: 11, dir: 'right', fixed: true, say: 'The Miltank looks at you sleepily.' }
  ],
  trainers: [
    { id: 'derek', who: 'pokefan', cls: 'pokefan', name: 'Derek', x: 12, y: 22, dir: 'left', sight: 2,
      team: [['pikachu', 27]],
      before: 'Look at my Pikachu\'s little cheeks! Aren\'t they the cutest?',
      defeat: 'Even losing, it is so cute...',
      after: 'I came all the way here to show my Pikachu to the Miltank. They did not care.' },
    { id: 'eugene', who: 'sailor', cls: 'sailor', name: 'Eugene', x: 9, y: 27, dir: 'right', sight: 2,
      team: [['poliwhirl', 25], ['raticate', 25], ['krabby', 26]],
      before: 'Ahoy! A sailor\'s Pokémon are tough as old rope!',
      defeat: 'My rope snapped...',
      after: 'At Olivine harbour, the ships come and go all day long.' },
    { id: 'norman', who: 'psychic', cls: 'psychic', name: 'Norman', x: 12, y: 30, dir: 'left', sight: 2,
      team: [['slowpoke', 26], ['slowbro', 28]],
      before: 'My Slowpoke is thinking very hard. About what, nobody knows.',
      defeat: 'Still thinking...',
      after: 'A Slowpoke bitten by a Shellder becomes a Slowbro. Lucky, or unlucky?' }
  ],
  encounters: { walk: '@johto-route-39-area' }
});

const FARM_HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
G.Maps.def({
  id: 'moomoo-house', loc: 'johto-route-39', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: FARM_HOUSE, warps: [{ x: 4, y: 7, to: 'route39', spot: 'house-door' }], spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'farmer', who: 'oldman', x: 7, y: 4, dir: 'left', script: 'moomoo.farmer' },
    { id: 'wife', who: 'granny', x: 2, y: 5, dir: 'right',
      say: 'Our Miltank give the richest milk in Johto. When one of them is sick, the whole farm worries.' }
  ]
});
G.Maps.def({
  id: 'moomoo-barn', loc: 'johto-route-39', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p_________p', '___________', '___________', '___________', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'route39', spot: 'barn-door' }], spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'miltank', who: 'miltank', mon: 'miltank', x: 5, y: 3, dir: 'down', fixed: true, if: '!miltank-healthy', script: 'moomoo.miltank' },
    { id: 'miltank2', who: 'miltank', mon: 'miltank', x: 5, y: 3, dir: 'down', fixed: true, if: 'miltank-healthy',
      say: 'Moo! The Miltank is full of energy again.' },
    { id: 'girl', who: 'lass', x: 2, y: 4, dir: 'right', if: '!miltank-healthy',
      say: 'Our Miltank is sick and will not eat its grass. Grandpa says healing Berries would help, lots of them.' },
    { id: 'girl2', who: 'lass', x: 2, y: 4, dir: 'right', if: 'miltank-healthy',
      say: 'Look how well our Miltank is doing! Thank you for feeding it all those Berries.' }
  ]
});

(() => {
  const T = s => G.T(s);
  const FARMER = { name: 'Farmer' };
  const NEED = 5, BERRIES = ['oran-berry', 'sitrus-berry'];

  async function miltank(h) {
    const F = G.Field;
    const berry = BERRIES.find(b => F.count(b) > 0);
    if (!berry) { await h.say(T('The Miltank looks weak. A healing Berry might give it its strength back.')); return; }
    const vars = { item: G.Names.item(berry) };
    if (await h.choice(T('The Miltank looks weak. Give it an {item}?'), { vars }) !== 0) return;
    F.takeItem(berry, 1);
    const n = (+F.getVar('miltank-fed') || 0) + 1;
    F.setVar('miltank-fed', n);
    if (n < NEED) { await h.say(T('The Miltank ate the {item}. It looks a little better... and it wants more.'), { vars }); return; }
    F.setFlag('miltank-healthy');
    await h.jingle('heal');
    await h.say(T('The Miltank ate the {item}... Moooo! It jumped to its feet, full of energy!'), { vars });
  }

  async function farmer(h) {
    const F = G.Field;
    if (!F.flag('miltank-healthy')) {
      await h.say(T('Our Miltank in the barn is sick. When a Miltank is weak, it needs lots of healing Berries.'), FARMER);
      await h.say(T('Berry trees grow along the roads around here. Would you help us out?'), FARMER);
      return;
    }
    if (!F.flag('got-tm44')) {
      await h.say(T('You fed our Miltank back to health! Thank you, young one. Take this as our thanks.'), FARMER);
      F.giveItem('tm44', 1);
      F.setFlag('got-tm44');
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('tm44') } });
      await j;
      await h.say(T('That is TM44, Rest. The Pokémon sleeps and wakes up healed. Just like our Miltank, eh?'), FARMER);
    }
    await h.say(T('Our Moomoo Milk is the best in Johto. Want some?'), FARMER);
    await h.shop(['moomoo-milk']);
  }

  G.Script.def({
    'moomoo.miltank': [['js', miltank]],
    'moomoo.farmer': [['js', farmer]]
  });
})();
