/* ============ diglett.js — Route 11 and Diglett's Cave ============
 * East of Vermilion City: Route 11 (five Trainers; its gate leads to Route 12, route12.js)
 * and the mouth of Diglett's Cave, a long tunnel dug by wild Diglett that comes out on the
 * east side of Route 2 (route2.js), where Professor Oak's aide gives HM05 Flash to Trainers
 * who have caught ten kinds of Pokémon. The texts are our own; the places follow the games.
 */
G.Maps.def({
  id: 'route11', loc: 'kanto-route-11', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T#######..........""""""""......"""""..T',
    'T#######..........""""""""......"""""..T',
    'T###O###..........""""""""......"""""..T',
    'T.......................S..........HHHHT',
    'T..................................HHHHT',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,HDHHT',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
    'T......................................T',
    'T..."""""""""..........""""""""".......T',
    'T..."""""""""..........""""""""".......T',
    'T..."""""""""..........""""""""".......T',
    'T......................................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'vermilion', offset: -3 } },
  warps: [{ x: 4, y: 3, to: 'digletts-cave', spot: 'south' }, { x: 36, y: 6, to: 'route11-gate', spot: 'west' }],
  spots: { west: [1, 6, 'right'], cave: [4, 4, 'down'], 'gate-door': [36, 7, 'down'] },
  signs: { '24,4': "Route 11. West: Vermilion City. North-west: Diglett's Cave. East: the gate to Route 12." },
  trainers: [
    { id: 'hugo', who: 'gambler', cls: 'gambler', name: 'Hugo', x: 10, y: 5, dir: 'down', sight: 2,
      team: [['poliwag', 18], ['horsea', 18]],
      before: 'Win or lose, I always bet on a battle. Let us see where luck takes us!',
      defeat: 'My luck ran out...',
      after: 'Luck is nice, but training is better. Do not tell my friends I said that.' },
    { id: 'eddie', who: 'youngster', cls: 'youngster', name: 'Eddie', x: 16, y: 8, dir: 'up', sight: 2,
      team: [['ekans', 21]],
      before: 'My Ekans is longer than yours! Probably! Battle!',
      defeat: 'Ekans curled up in a knot...',
      after: "The cave over there is full of Diglett. They pop out of the ground when you least expect it!" },
    { id: 'bernie', who: 'engineer', cls: 'engineer', name: 'Bernie', x: 21, y: 5, dir: 'down', sight: 2,
      team: [['magnemite', 20], ['magnemite', 20]],
      before: 'I check the power lines along this road. My Magnemite help me. Want to see?',
      defeat: 'Power failure!',
      after: 'Magnemite stick to anything made of metal. Even my lunch box.' },
    { id: 'dillon', who: 'youngster', cls: 'youngster', name: 'Dillon', x: 27, y: 8, dir: 'up', sight: 2,
      team: [['sandshrew', 19], ['zubat', 19]],
      before: 'I caught these two in caves! I am a cave expert!',
      defeat: 'Maybe I should stick to the grass...',
      after: 'Rock Tunnel, east of Cerulean, is so dark you can hardly see your own feet.' },
    { id: 'dirk', who: 'gambler', cls: 'gambler', name: 'Dirk', x: 32, y: 5, dir: 'down', sight: 2,
      team: [['voltorb', 20], ['magnemite', 20]],
      before: 'Heads or tails? Never mind, let us just battle!',
      defeat: 'Tails. I always pick tails, and it is always heads.',
      after: 'The road east is closed. Something huge is sleeping on Route 12, they say.' }
  ],
  items: [
    { x: 38, y: 12, item: 'great-ball', flag: 'route11-ball' },
    { x: 13, y: 8, item: 'escape-rope', flag: 'route11-hidden-rope', hidden: true }
  ],
  encounters: { walk: '@kanto-route-11-area' }
});

G.Maps.def({
  id: 'digletts-cave', loc: 'digletts-cave', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true,
  rows: [
    '##############################',
    '##O###########################',
    '##....########.........#######',
    '##.....######...........######',
    '###.....####......##.....#####',
    '####.....##......####.....####',
    '#####...........######.....###',
    '######.........########.....##',
    '#######.......##########....##',
    '########....############....##',
    '#########..#############....##',
    '##########...##########.....##',
    '###########.....######.....###',
    '############......##......####',
    '#############............#####',
    '##############..........######',
    '###############....O##########',
    '##############################'
  ],
  warps: [{ x: 2, y: 1, to: 'route2', spot: 'cave' }, { x: 19, y: 16, to: 'route11', spot: 'cave' }],
  spots: { north: [2, 2, 'down'], south: [19, 15, 'up'] },
  items: [
    { x: 26, y: 10, item: 'super-repel', flag: 'digletts-repel' },
    { x: 8, y: 6, item: 'max-potion', flag: 'digletts-hidden-potion', hidden: true }
  ],
  encounters: { walk: '@digletts-cave-area' }
});

G.Maps.def({
  id: 'route2-house', loc: 'kanto-route-2', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'bb_P___p',
    '________',
    '__rr____',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'route2', spot: 'house-door' }],
  spots: { door: [3, 5, 'up'] },
  signs: {
    '0,2': "Research notes on how many kinds of Pokémon live in Kanto. The number is crossed out and rewritten many times.",
    '1,2': "Research notes on how many kinds of Pokémon live in Kanto. The number is crossed out and rewritten many times."
  },
  npcs: [{ id: 'aide', who: 'aide', x: 5, y: 3, dir: 'down', script: 'route2.aide' }]
});

(() => {
  const T = s => G.T(s);
  const AIDE = { name: "Prof. Oak's Aide" };
  const NEED = 10;

  /** Oak's aide: HM05 Flash for a Trainer who has caught ten kinds of Pokémon. */
  async function aide(h) {
    const F = G.Field, S = F.save;
    if (F.flag('got-hm05')) {
      await h.say(T('Flash lights up dark places, like Rock Tunnel east of Cerulean City. Good luck in there!'), AIDE);
      return;
    }
    const n = Object.values(S.dex.caught || {}).filter(Boolean).length;
    await h.say(T("Hello! I'm one of Professor Oak's aides. I check on Trainers who are filling in the Pokédex."), AIDE);
    await h.say(T("If you've caught at least ten kinds of Pokémon, I have something useful for you."), AIDE);
    if (n < NEED) {
      await h.say(T("Your Pokédex shows {n} caught so far. Come back when it reaches ten!"), Object.assign({ vars: { n } }, AIDE));
      return;
    }
    await h.say(T('{n} kinds! The Professor will be thrilled. Here, he wants you to have this.'), Object.assign({ vars: { n } }, AIDE));
    F.giveItem('hm05', 1);
    F.setFlag('got-hm05');
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('hm05') } });
    await j;
    await h.say(T('HM05 is Flash. It lights up dark caves. You need the Boulder Badge to use it outside of battle.'), AIDE);
  }

  G.Script.def({
    'route2.aide': [['js', aide]]
  });
})();
