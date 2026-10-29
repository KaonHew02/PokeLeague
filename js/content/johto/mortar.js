/* ============ mortar.js — Route 42 and Mt. Mortar ============
 * Chapter 16. East of Ecruteak City, Route 42 (two Trainers, a pond, berry trees) runs into
 * Mt. Mortar: the road goes in by the west cave mouth and out by the east one (Mt. Mortar 1F,
 * `cave`, two Trainers). A ladder leads down to B1F, where the Karate King, Kiyo, trains alone:
 * beat him and he gives you a Tyrogue (Lv. 10, flag got-tyrogue). East of the mountain the road
 * goes on to Mahogany Town.
 */
G.Maps.def({
  id: 'route42', loc: 'johto-route-42', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTT####################TTTTTTTTTTTTTT',
    'T...........y.####################.y...........T',
    'T."""""""""...####################.."""""""""..T',
    'T.""""""""".h.####################.."""""""""..T',
    'T."""""""""...####################.."""""""""..T',
    'T."""""""""...####################.."""""""""..T',
    'T."""""""""...####################.."""""""""..T',
    'T.............####################.............T',
    'T.S...........##O##############O##......y....S.T',
    ',,,,,,,,,,,,,,,,,,############,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,############,,,,,,,,,,,,,,,,,,',
    'T.................############.................T',
    'T..~~~~~~~........############.....""""""""""..T',
    'T..~~~~~~~..y.....############.....""""""""""..T',
    'T..~~~~~~~........############.....""""""""""..T',
    'T..~~~~~~~........############.....""""""""""..T',
    'T.................############.................T',
    'TTTTTTTTTTTTTTTTTT############TTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'ecruteak', offset: -9 }, east: { map: 'mahogany', offset: -2 } },
  warps: [{ x: 16, y: 8, to: 'mt-mortar-1f', spot: 'west' }, { x: 31, y: 8, to: 'mt-mortar-1f', spot: 'east' }],
  spots: { 'mortar-west': [16, 9, 'down'], 'mortar-east': [31, 9, 'down'] },
  berries: [[12, 13, 'cheri-berry'], [40, 8, 'oran-berry'], [12, 1, 'green-apricorn'], [35, 1, 'yellow-apricorn']],
  signs: {
    '2,8': 'Route 42. Ecruteak City to the west, Mahogany Town to the east, through Mt. Mortar.',
    '45,8': 'Route 42. Mahogany Town is just to the east.'
  },
  trainers: [
    { id: 'tully', who: 'fisherman', cls: 'fisherman', name: 'Tully', x: 10, y: 13, dir: 'left', sight: 2,
      team: [['goldeen', 31], ['goldeen', 31], ['seaking', 33]],
      before: 'This pond is full of Goldeen. And so is my team!',
      defeat: 'The big one got away...',
      after: 'Fish bite best in the early morning. Remember that.' },
    { id: 'shane', who: 'pokemaniac', cls: 'pokemaniac', name: 'Shane', x: 38, y: 11, dir: 'up', sight: 2,
      team: [['nidorina', 32], ['nidorino', 32]],
      before: 'A Nidorina and a Nidorino! Aren\'t they a perfect pair?',
      defeat: 'My perfect pair...',
      after: 'A Moon Stone makes them evolve. I have been saving up for one.' }
  ],
  encounters: { walk: '@johto-route-42-area' }
});

G.Maps.def({
  id: 'mt-mortar-1f', loc: 'mt-mortar', region: 'johto', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true,
  rows: [
    '##############################',
    '####O####################O####',
    '##.......############.......##',
    '##.......############.......##',
    '##.......############.......##',
    '##..........................##',
    '##..........................##',
    '##.......####...#####.......##',
    '##.......####...#####.......##',
    '#####.#######...##############',
    '##.......####...##############',
    '##.~~~~~.####...######......##',
    '##.~~~~~.####...######......##',
    '##.~~~~~.#.........###......##',
    '##.~~~~~.#.........###......##',
    '##.......#..................##',
    '##.......#....%.............##',
    '##########.........###########',
    '##############################',
    '##############################'
  ],
  warps: [
    { x: 4, y: 1, to: 'route42', spot: 'mortar-west' },
    { x: 25, y: 1, to: 'route42', spot: 'mortar-east' },
    { x: 14, y: 16, to: 'mt-mortar-b1f', spot: 'ladder' }
  ],
  spots: { west: [4, 2, 'down'], east: [25, 2, 'down'], ladder: [14, 15, 'up'] },
  trainers: [
    { id: 'markus', who: 'supernerd', cls: 'super-nerd', name: 'Markus', x: 13, y: 7, dir: 'down', sight: 3,
      team: [['slowpoke', 30], ['slowbro', 32]],
      before: 'I am studying the rocks of Mt. Mortar. My Slowpoke helps by... sitting.',
      defeat: 'My research has been interrupted...',
      after: 'This mountain is hollow inside. Some say it is an old volcano.' },
    { id: 'benjamin', who: 'hiker', cls: 'hiker', name: 'Benjamin', x: 23, y: 12, dir: 'left', sight: 3,
      team: [['diglett', 30], ['geodude', 30], ['dugtrio', 32]],
      before: 'Mountains are for climbing, and Trainers are for battling!',
      defeat: 'I slipped...',
      after: 'There is a man training alone in the depths of this mountain. He never comes out.' }
  ],
  items: [
    { x: 2, y: 2, item: 'ultra-ball', flag: 'mortar-ultra-ball' },
    { x: 27, y: 16, item: 'max-ether', flag: 'mortar-max-ether' },
    { x: 2, y: 16, item: 'revive', flag: 'mortar-hidden-revive', hidden: true }
  ],
  encounters: { walk: '@mt-mortar-1f', water: '@mt-mortar-1f' }
});

G.Maps.def({
  id: 'mt-mortar-b1f', loc: 'mt-mortar', region: 'johto', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true,
  rows: [
    '####################',
    '####################',
    '##.%..............##',
    '##........~~~~~~~.##',
    '##........~~~~~~~.##',
    '##....###.........##',
    '##....###.........##',
    '##....###.........##',
    '##................##',
    '##..........###...##',
    '##..........###...##',
    '##..........###...##',
    '##................##',
    '##................##',
    '####################',
    '####################'
  ],
  warps: [{ x: 3, y: 2, to: 'mt-mortar-1f', spot: 'ladder' }],
  spots: { ladder: [3, 3, 'down'] },
  trainers: [
    { id: 'kiyo', who: 'blackbelt', cls: 'black-belt', name: 'Kiyo', x: 14, y: 7, dir: 'left', sight: 3,
      team: [['hitmonlee', 34], ['hitmonchan', 34]],
      before: 'Who dares to disturb my training? I am Kiyo, the Karate King! Show me your strength!',
      defeat: 'Waaargh! I am beaten!',
      win: 'mortar.kiyo',
      afterScript: 'mortar.kiyo' }
  ],
  items: [{ x: 16, y: 12, item: 'full-heal', flag: 'mortar-full-heal' }],
  encounters: { walk: '@mt-mortar-b1f' }
});

(() => {
  const T = s => G.T(s);
  const KIYO = { name: 'Kiyo' };

  async function kiyo(h) {
    const F = G.Field;
    if (F.flag('got-tyrogue')) {
      await h.say(T('I will stay in this mountain until I can beat you. Raise that Tyrogue well!'), KIYO);
      return;
    }
    await h.say(T('I have trained here for months... and still I lost. You are the real thing.'), KIYO);
    await h.say(T('Take this Pokémon. It is a Tyrogue: it can become a kicker, a puncher or a spinner, depending on how you raise it.'), KIYO);
    const full = F.party().length >= 6;
    const mon = F.giveMon('tyrogue', 10);
    F.setFlag('got-tyrogue');
    const j = h.jingle('item');
    await h.say(T('{player} received {mon}!'), { vars: { mon: G.Names.mon(mon.sp) } });
    await j;
    if (full) await h.say(T('{mon} was sent to the PC.'), { vars: { mon: G.Names.mon(mon.sp) } });
    else if (h.nickname) await h.nickname(mon);
  }

  G.Script.def({ 'mortar.kiyo': [['js', kiyo]] });
})();
