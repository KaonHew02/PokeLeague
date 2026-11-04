/* ============ celestic.js — Route 210 (north) and Celestic Town ============
 * Chapter 50, the end of the chapter. The Psyduck gone (solaceon.js, flag psyduck-cured), Route 210 goes on north
 * into the fog (`fog: true`: only how the map looks), past the Cafe Cabin and over a river, west to Celestic Town:
 * a Pokémon Center, the elder's house, a house and the old ruins; Route 211 to the west is closed. A grunt stands in
 * the mouth of the ruins (flag celestic-grunt); inside, before the mural, Cyrus (flag cyrus-celestic). The elder,
 * Cynthia's grandmother, takes the Old Charm back. In Platinum she gives HM03, which the player has carried since
 * Kanto, so here she gives TM51 (Roost); then `ending(50)`. Platinum's Trainers and wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const CYRUS = { name: 'Cyrus' };
  const GRUNT = { name: 'Team Galactic Grunt' };
  const ELDER = { name: 'Celestic Town Elder' };

  // ---------------- Route 210, north ----------------
  G.Maps.def(Object.assign({
    id: 'route210n', loc: 'sinnoh-route-210', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    fog: true,
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T...........~~~~~............................T',
      'T.""""""""".~~~~~."""""""""""""""....""""""".T',
      'T.""""""""".~~~~~."""""""""""""""....""""""".T',
      'T.""""""""".~~~~~."""""""""""""""....""""""".T',
      'T.""""""""".~~~~~."""""""""""""""....""""""".T',
      'T.""""""""".~~~~~."""""""""""""""....""""""".T',
      'T...........~~~~~............................T',
      ',,,,,,,,,,,,=====,,,,,,,,,,,,,,,,,,,.........T',
      ',,,,,,,,,,,,=====,,,,,,,,,,,,,,,,,,,.........T',
      'T...........~~~~~.................,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,..HHHH...T',
      'T.""""""""".~~~~~.""""""""""""""".,,..HHHH...T',
      'T.""""""""".~~~~~.""""""""""""""".,,..HDHH...T',
      'T.""""""""".~~~~~.""""""""""""""".,,,,,,.....T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.........T',
      'T.""""""""".~~~~~.""""""""""""""".,,.""""""".T',
      'T.""""""""".~~~~~.""""""""""""""".,,.""""""".T',
      'T.""""""""".~~~~~.""""""""""""""".,,S""""""".T',
      'T.""""""""".~~~~~.""""""""""""""".,,.""""""".T',
      'T...........~~~~~.................,,.""""""".T',
      'T...........~~~~~.................,,.........T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTT'
    ],
    connect: { south: { map: 'route210s', offset: 25 }, west: { map: 'celestic', offset: -2 } },
    warps: [{ x: 39, y: 19, to: 'cafe-cabin', spot: 'door' }],
    spots: { 'cafe-door': [39, 20, 'down'] },
    signs: { '36,25': 'Route 210. West: Celestic Town. South: Solaceon Town. Mind the fog!' },
    items: [{ x: 40, y: 4, item: 'max-repel', flag: 'route210-repel' }, { x: 3, y: 25, item: 'hyper-potion', flag: 'route210-potion' }],
    trainers: [
      { id: 'patrick', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Patrick', x: 33, y: 22, dir: 'right', sight: 1, team: [['gible', 34]],
        before: 'A Dragon Tamer fears nothing, not even fog. Come on!',
        defeat: 'Dragons are hard to raise, you know.',
        after: 'Gible loves caves, but I have to walk it through here to reach Celestic Town.' },
      { id: 'adam', who: 'blackbelt', cls: 'black-belt', name: 'Adam', x: 36, y: 14, dir: 'left', sight: 1, team: [['machoke', 34]],
        before: 'I cannot see a thing in this fog, but I can hear you. Hiyah!',
        defeat: 'I never saw that coming. Really.',
        after: 'Walking in fog trains your ears as well as your legs.' },
      { id: 'brianna', who: 'birdkeeper', cls: 'bird-keeper', name: 'Brianna', x: 28, y: 10, dir: 'up', sight: 1, team: [['hoothoot', 31], ['noctowl', 33]],
        before: 'My owls see through this fog as if it were night. And you?',
        defeat: 'They did not see that coming.',
        after: 'Noctowl never loses its way, fog or no fog.' },
      { id: 'ernest', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Ernest', x: 22, y: 7, dir: 'down', sight: 1, team: [['scyther', 32], ['probopass', 31], ['luxio', 34]],
        before: 'A battle on the bridge road, with the fog all around. Perfect!',
        defeat: 'Well fought.',
        after: 'A Nosepass evolves near Mt. Coronet. Mine became a Probopass right there.' },
      { id: 'alyssa', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Alyssa', x: 18, y: 10, dir: 'up', sight: 1, team: [['aipom', 32], ['girafarig', 32], ['grotle', 33]],
        before: 'If you got this far in the fog, you must be good. Show me!',
        defeat: 'I knew it.',
        after: 'Celestic Town is just over the bridge. It is quiet there, and very old.' },
      { id: 'nathan', who: 'youngster', cls: 'ninja-boy', name: 'Nathan', x: 6, y: 7, dir: 'down', sight: 1, team: [['stunky', 31], ['golbat', 31]],
        before: 'Ninja art: hiding in the fog! You found me? Then we battle!',
        defeat: 'I should have hidden better...',
        after: 'A true ninja needs no fog. I am still learning.' }
    ],
    encounters: { walk: '@sinnoh-route-210-west-towards-celestic-town', water: '@sinnoh-route-210-west-towards-celestic-town' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'cafe-cabin', loc: 'sinnoh-route-210', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb___p___bb', '___________', '_tt_____tt_', '_tt_____tt_', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'route210n', spot: 'cafe-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'waitress', who: 'lass', x: 4, y: 3, dir: 'down', script: 'cafe.waitress' },
      { id: 'guest', who: 'hiker', x: 8, y: 6, dir: 'up',
        say: 'Nothing warms you up after the fog like a glass of fresh milk.' }
    ]
  }, SINNOH));

  // ---------------- Celestic Town ----------------
  G.Maps.def(Object.assign({
    id: 'celestic', loc: 'celestic-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T................................T',
      'T................................T',
      'T...CCCCC........................T',
      'T...CCCCC...HHHH......HHHH.......T',
      'T...CCCCC...HHHH......HHHH.......T',
      'T...CCDCC...HDHH......HDHH.......T',
      'T.....,......,.........,.........T',
      'T.....,......,.........,.........T',
      'T.....,..S...,.........,.........T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.........,......................T',
      'T.........,S.....................T',
      'T..fffff..,.##########..~~~~~~~~.T',
      'T..fffff..,.##########..~~~~~~~~.T',
      'T..fffff..,.##########..~~~~~~~~.T',
      'T..fffff..,.##########..~~~~~~~~.T',
      'T..fffff..,.##########..~~~~~~~~.T',
      'T..fffff..,.####O#####..~~~~~~~~.T',
      'T..fffff..,,,,,,,.......~~~~~~~~.T',
      'T.........,,,,,,,.......~~~~~~~~.T',
      'T................................T',
      'T................................T',
      'T................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route210n', offset: 2 }, west: { map: 'route211e', offset: 1 } },
    warps: [
      { x: 6, y: 6, to: 'celestic-center', spot: 'door' },
      { x: 13, y: 6, to: 'celestic-elder', spot: 'door' },
      { x: 23, y: 6, to: 'celestic-house', spot: 'door' },
      { x: 16, y: 19, to: 'celestic-ruins', spot: 'door' }
    ],
    spots: { 'center-door': [6, 7, 'down'], 'elder-door': [13, 7, 'down'], 'house-door': [23, 7, 'down'], ruins: [16, 20, 'down'] },
    signs: {
      '9,9': 'Celestic Town. A quiet town that keeps the old stories of Sinnoh.',
      '11,13': 'The Celestic Ruins. Nobody remembers who built them.'
    },
    npcs: [
      // Route 211 opens after chapter 52 (snowpoint.js).
      { id: 'west', who: 'hiker', x: 1, y: 10, dir: 'right', if: '!chapter-52-done',
        say: 'Route 211 climbs into Mt. Coronet from here. The rocks are loose today, so you had better stay in town.' },
      { id: 'boy', who: 'youngster', x: 26, y: 12, move: 'look',
        say: 'Those people in the space suits showed up this morning. They want something in the ruins!' },
      { id: 'lady', who: 'granny', x: 6, y: 12, move: 'wander', r: 2,
        say: 'The elder looks after the ruins, as her family always has.' }
    ],
    trainers: [
      { id: 'grunt-celestic', who: 'galactic', cls: 'team-galactic', x: 16, y: 20, dir: 'down', sight: 1, if: '!celestic-grunt',
        team: [['houndour', 32, ['bite', 'odor-sleuth', 'beat-up', 'fire-fang']], ['golbat', 30, ['bite', 'wing-attack', 'confuse-ray', 'air-cutter']]],
        before: 'The boss is busy in there. Nobody goes in!',
        defeat: 'Ugh! Boss, I tried!',
        win: 'celestic.grunt-win' }
    ],
    encounters: { water: '@celestic-town-area' }
  }, SINNOH));

  G.Maps.center('celestic-center', {
    loc: 'celestic-town', exit: { map: 'celestic', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'Scholars come from all over Sinnoh to see the mural in the ruins. Nobody can agree on what it means.' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'celestic-elder', loc: 'celestic-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'celestic', spot: 'elder-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'elder', who: 'granny', x: 7, y: 4, dir: 'left', script: 'celestic.elder' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'celestic-house', loc: 'celestic-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'celestic', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'My grandfather told me that long ago, people and Pokémon were the same. I still wonder about that.' }]
  }, SINNOH));

  // ---------------- The ruins ----------------
  G.Maps.def(Object.assign({
    id: 'celestic-ruins', loc: 'celestic-town', tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', escape: true,
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', '+++++++++++++', '++W+++++++W++', '+++++++++++++', '+++++++++++++', '+++++++++++++', '++W+++++++W++',
           '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 9, to: 'celestic', spot: 'ruins' }],
    spots: { door: [6, 9, 'up'] },
    signs: { '6,1': 'A mural of two great Pokémon, face to face. One seems to hold back time, the other to bend space itself.' },
    trainers: [
      { id: 'cyrus', who: 'cyrus', cls: 'galactic-boss', name: 'Cyrus', x: 6, y: 3, dir: 'up', sight: 0, ai: 'leader', if: '!cyrus-celestic',
        items: { 'hyper-potion': 1 },
        team: [['sneasel', 34, ['slash', 'ice-punch', 'quick-attack', 'screech']],
               ['golbat', 34, ['poison-fang', 'air-cutter', 'bite', 'supersonic']],
               ['murkrow', 36, ['drill-peck', 'night-shade', 'astonish', 'feint-attack'], 'sitrus-berry']],
        before: 'So we meet again. This mural tells of the Pokémon that shaped time and space. With that power, a new world can begin. If you mean to stand in my way, then show me your strength.',
        defeat: 'I see. Your strength is real. It changes nothing.',
        win: 'celestic.cyrus-win' }
    ]
  }, SINNOH));

  /** The elder: the Old Charm comes home, and the chapter ends. */
  async function elder(h) {
    const F = G.Field;
    if (F.flag('chapter-50-done') || !F.count('old-charm')) {
      await h.say(T('The ruins have stood for longer than anyone can remember. We only look after them.'), ELDER);
      return;
    }
    if (!F.flag('cyrus-celestic')) {
      await h.say(T('Those people in the space suits have gone into the ruins. Please, can you stop them?'), ELDER);
      return;
    }
    await h.say(T('Thank you for driving them out of the ruins. And what is this? The Old Charm! So my Cynthia sent you.'), ELDER);
    F.takeItem('old-charm', 1);
    await h.say(T('This charm has been in our family for a very long time. Sinnoh\'s oldest stories are tied to it.'), ELDER);
    await h.say(T('I would give you HM03 for your trouble, but I see you carry Surf already. Take this instead.'), ELDER);
    F.giveItem('tm51', 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('tm51') } });
    await j;
    await h.say(T('TM51 is Roost. The user lands and rests, and gets back half its HP.'), ELDER);
    // The end of the fiftieth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(50); else F.setFlag('chapter-50-done');
  }

  G.Script.def({
    'cafe.waitress': [
      ['say', 'Welcome to the Cafe Cabin! Our Moomoo Milk is the best on Route 210.'],
      ['js', async h => { await h.shop(['moomoo-milk']); }]
    ],
    'celestic.grunt-win': [
      ['say', 'Go in if you want. The boss will finish you off!', GRUNT],
      ['fade', 'out', 0.3], ['setFlag', 'celestic-grunt'], ['fade', 'in', 0.3]
    ],
    'celestic.cyrus-win': [
      ['say', 'The spirit is a flaw in this world. One day I will remove it, and then you will understand.', CYRUS],
      ['fade', 'out', 0.4], ['setFlag', 'cyrus-celestic'], ['fade', 'in', 0.4],
      ['say', 'Cyrus left the ruins without another word.']
    ],
    'celestic.elder': [['js', elder]]
  });
})();
