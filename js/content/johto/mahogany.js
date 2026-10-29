/* ============ mahogany.js — Mahogany Town, the Lake of Rage, the Rocket hideout and Pryce ============
 * Chapter 16, the end of the chapter. Mahogany Town: a Center, a house, the souvenir shop (its
 * clerk never smiles) and Pryce's Gym, locked: strange signals have the town on edge. The road
 * east (Route 44) is closed. Route 43 (four Trainers) leads north to the Lake of Rage, where a red
 * Gyarados rages on the water: a wild battle, Lv. 30, shiny (flag red-gyarados; it leaves a Red
 * Scale). Lance, on the shore, says a radio signal from Mahogany forced it to evolve (flag
 * lance-mahogany) and goes ahead. In the souvenir shop he has dealt with the clerk, a Grunt; the
 * stairs behind lead to the Rocket hideout: B1F (three Grunts), B2F (Petrel, flag petrel-beaten;
 * Lance heals your Pokémon), and three Electrode powering the transmitter (wild battles, Lv. 30,
 * flags hq-electrode1..3). Then the signal stops (flag hideout-cleared), Lance gives HM07 Waterfall
 * (flag got-hm07) and Pryce opens his Gym: ice to slide on (`I`), two Skiers, two Boarders, then
 * Pryce (Seel, Dewgong, Piloswine): badge 15, the Glacier Badge (Pokémon up to Lv. 70 obey), TM07
 * Hail (flag pryce-beaten), and the chapter ends (`ending(16)`).
 */
G.Maps.def({
  id: 'mahogany', loc: 'mahogany-town', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTT',
    'TTTTTTT........,,........TTTTTTT',
    'TTTTTTT........,,........TTTTTTT',
    'TTTTTTT........,,........TTTTTTT',
    'TTTTTTT........,,........TTTTTTT',
    'TTTTTTT........,,..............T',
    'TTTTTTT........,,...CCCCC......T',
    'T.......MMMM...,,...CCCCC......T',
    'T.......MMMM...,,...CCCCC......T',
    'T...ff..MDMM...,,...CCDCC......T',
    'T........,....S,,.....,.....S..T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
    'T...........S..,,........ff....T',
    'T.......GGGGGG.,,..............T',
    'T.......GGGGGG.,,..............T',
    'T.......GGGGGG.,,...HHHH.......T',
    'T.......GGGGGG.,,...HHHH.......T',
    'T.......GGDGGG.,,...HDHH.......T',
    'T....,,,,,,,,,,,,,,,,,,,,,,....T',
    'T..........................TTTTT',
    'T.ff.......................TTTTT',
    'T..........................TTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'route42', offset: 2 }, north: { map: 'route43', offset: 5 } },
  triggers: [{ x: 1, y: 19, w: 30, h: 4, if: ['pryce-beaten', '!rocket-broadcast'], script: 'radio.broadcast' }],
  warps: [
    { x: 9, y: 9, to: 'souvenir-shop', spot: 'door' },
    { x: 22, y: 9, to: 'mahogany-center', spot: 'door' },
    { x: 10, y: 18, to: 'mahogany-gym', spot: 'door', if: 'hideout-cleared', locked: 'mahogany.gym-closed' },
    { x: 21, y: 18, to: 'mahogany-house', spot: 'door' }
  ],
  spots: { 'shop-door': [9, 10, 'down'], 'center-door': [22, 10, 'down'], 'gym-door': [10, 19, 'down'], 'house-door': [21, 19, 'down'] },
  signs: {
    '14,10': 'Mahogany Town. Home of the ninja, it is said.',
    '28,10': 'East: Route 44. Closed: a rockfall blocks the way to the Ice Path.',
    '12,13': 'Mahogany Town Pokémon Gym. Leader: Pryce, the winter master who has trained for fifty years.'
  },
  npcs: [
    { id: 'kid', who: 'youngster', x: 18, y: 14, move: 'wander', r: 2,
      say: 'Have you heard? A red Gyarados was seen at the Lake of Rage, north of town!' },
    { id: 'man', who: 'gentleman', x: 5, y: 13, move: 'look', if: '!hideout-cleared',
      say: 'That souvenir shop is odd. The clerk never smiles, and men in black go in and never come out.' },
    { id: 'man2', who: 'gentleman', x: 5, y: 13, move: 'look', if: 'hideout-cleared',
      say: 'The men in black are gone! And Pryce has opened his Gym again.' }
  ]
});

G.Maps.center('mahogany-center', {
  loc: 'mahogany-town', exit: { map: 'mahogany', spot: 'center-door' },
  npcs: [{ id: 'man', who: 'hiker', x: 9, y: 5, move: 'look',
           say: 'The Gyarados in the Lake of Rage have been angry for days. Something is stirring them up.' }]
}).region = 'johto';

G.Maps.def({
  id: 'mahogany-house', loc: 'mahogany-town', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'mahogany', spot: 'house-door' }], spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
      say: 'Pryce has trained Ice Pokémon for fifty years. He says the cold makes the heart strong.' },
    { id: 'boy', who: 'youngster', x: 2, y: 5, move: 'look',
      say: 'Pryce\'s Gym floor is all ice. You slide until you hit something! It is so much fun.' }
  ]
});

G.Maps.def({
  id: 'souvenir-shop', loc: 'mahogany-town', region: 'johto', tileset: 'indoor', palette: 'mart', music: 'mart', battleBg: 'indoor',
  rows: ['WWWWWWWWWW', 'WWWWWWWWWW', 'b+b+b+++^p', '++++++++++', '+===++++++', '++++++++++', 'p+++++++++', '++++X+++++'],
  warps: [{ x: 4, y: 7, to: 'mahogany', spot: 'shop-door' },
          { x: 8, y: 2, to: 'rocket-hq-b1f', spot: 'from-above', if: 'lance-mahogany', locked: 'mahogany.shop-back' }],
  spots: { door: [4, 7, 'up'], 'from-below': [8, 3, 'down'] },
  npcs: [
    { id: 'clerk', who: 'gentleman', x: 2, y: 3, dir: 'down', if: '!lance-mahogany', script: [
      ['say', 'Welcome... Souvenirs of the Lake of Rage. Buy something, or move along.'],
      ['shop', ['tiny-mushroom', 'super-potion', 'hyper-potion']]
    ] },
    { id: 'lance', who: 'lance', x: 6, y: 4, dir: 'down', if: ['lance-mahogany', '!hideout-cleared'], script: 'mahogany.lance-shop' },
    { id: 'granny', who: 'granny', x: 2, y: 3, dir: 'down', if: 'hideout-cleared', script: [
      ['say', 'The shop is mine again! Those men pushed me out. Thank you, dear. Buy something nice!'],
      ['shop', ['tiny-mushroom', 'super-potion', 'hyper-potion', 'full-heal']]
    ] }
  ]
});

// ---------------- Route 43 and the Lake of Rage ----------------
G.Maps.def({
  id: 'route43', loc: 'johto-route-43', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTT,,TTTTTTTTTTTT',
    'T.........,,...........T',
    'T.........,,S..........T',
    'T.........,,...........T',
    'T.........,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T..y......,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.........,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.........,,...........T',
    'T.........,,.""""""""".T',
    'T.........,,.""""""""".T',
    'T.~~~~~~..,,.""""""""".T',
    'T.~~~~~~..,,.""""""""".T',
    'T.~~~~~~..,,.""""""""".T',
    'T.~~~~~~..,,.""""""""".T',
    'T.~~~~~~..,,.""""""""".T',
    'T.~~~~~~..,,.""""""""".T',
    'T.~~~~~~..,,...........T',
    'T.........,,........h..T',
    'T.........,,...........T',
    'T.........,,S..........T',
    'T.........,,...........T',
    'TTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { south: { map: 'mahogany', offset: -5 }, north: { map: 'lake-of-rage', offset: -7 } },
  berries: [[3, 8, 'sitrus-berry']],
  signs: {
    '12,37': 'Route 43. Mahogany Town to the south, the Lake of Rage to the north.',
    '12,2': 'The Lake of Rage is just ahead. Mind the Gyarados!'
  },
  trainers: [
    { id: 'ben', who: 'pokemaniac', cls: 'pokemaniac', name: 'Ben', x: 12, y: 30, dir: 'left', sight: 2,
      team: [['slowbro', 33]],
      before: 'I came to see the red Gyarados, but I will settle for a battle!',
      defeat: 'Not even a red Gyarados could save me...',
      after: 'They say the Gyarados in the lake were Magikarp only a week ago.' },
    { id: 'marvin', who: 'fisherman', cls: 'fisherman', name: 'Marvin', x: 9, y: 27, dir: 'right', sight: 2,
      team: [['magikarp', 30], ['magikarp', 30], ['gyarados', 34]],
      before: 'My Magikarp are ready to flop! And my Gyarados is ready to bite!',
      defeat: 'Flop...',
      after: 'All the Magikarp in the lake turned into Gyarados overnight. It is not natural.' },
    { id: 'spencer', who: 'camper', cls: 'camper', name: 'Spencer', x: 9, y: 12, dir: 'right', sight: 2,
      team: [['sandshrew', 32], ['sandslash', 34]],
      before: 'I am camping by the lake to see the red Gyarados. Battle me while I wait!',
      defeat: 'Rolled up and lost...',
      after: 'At night the lake is so quiet. Then suddenly: splash! A Gyarados!' },
    { id: 'tiffany', who: 'lass', cls: 'picnicker', name: 'Tiffany', x: 12, y: 18, dir: 'left', sight: 2,
      team: [['clefairy', 34]],
      before: 'A picnic by the lake! And a battle for dessert!',
      defeat: 'Dessert is over...',
      after: 'Clefairy love the moonlight over the lake. It is so pretty.' }
  ],
  encounters: { walk: '@johto-route-43-area' }
});

G.Maps.def({
  id: 'lake-of-rage', loc: 'lake-of-rage', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T..................................T',
    'T.""""".......................TTTTTT',
    'T.""""".......................TTTTTT',
    'T.""""".......................TTTTTT',
    'T."""""~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
    'T."""""~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
    'T."""""~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
    'T."""""~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
    'T.....~~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
    'T.....~~~~~~~~~~~~~~~~~~~~~~~~TTTTTT',
    'T.....~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'TTTT..~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'TTTT..~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'TTTT..~~~~~~~~~~~~~~~~~~~~~~~~..y..T',
    'TTTT..~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'TTTT..~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'TTTT..~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'TTTT..~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'T.....~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'T.....~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'T.....~~~~~~~~~~~~~~~~~~~~~~~~.....T',
    'T."""""""....................""""".T',
    'T."""""""....................""""".T',
    'T."""""""........,,..........""""".T',
    'T."""""""......S.,,..........""""".T',
    'T."""""""........,,..........""""".T',
    'T."""""""........,,..........""""".T',
    'T................,,................T',
    'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'route43', offset: 7 } },
  berries: [[32, 14, 'aspear-berry']],
  signs: { '15,25': 'The Lake of Rage. They say it was made by a Gyarados in a rage, long ago.' },
  npcs: [
    { id: 'gyarados', who: 'gyarados', mon: 'gyarados', x: 17, y: 13, dir: 'down', fixed: true, swim: true, shiny: true,
      if: '!red-gyarados', script: 'lake.gyarados' },
    { id: 'lance', who: 'lance', x: 16, y: 23, dir: 'up', if: ['red-gyarados', '!lance-mahogany'], script: 'lake.lance' },
    { id: 'fisher', who: 'fisherman', x: 25, y: 23, dir: 'up',
      say: 'The lake has been full of angry Gyarados for a week. There is a red one out in the middle!' }
  ],
  encounters: { walk: '@johto-route-43-area', water: '@lake-of-rage-area', headbutt: '@lake-of-rage-area' }
});

// ---------------- the Rocket hideout ----------------
const HQ = { loc: 'team-rocket-hq', region: 'johto', tileset: 'indoor', palette: 'hideout', music: 'cave', battleBg: 'indoor' };
G.Maps.def(Object.assign({
  id: 'rocket-hq-b1f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWW',
    '^+++++++++++++^+',
    '++++++++++++++++',
    '++==++++++++==++',
    '++++++++++++++++',
    '++++bbbb++++++++',
    '++++++++++++++++',
    '++++++++bbbb++++',
    '++++++++++++++++',
    '++==++++++++==++',
    '++++++++++++++++'
  ],
  warps: [{ x: 0, y: 2, to: 'souvenir-shop', spot: 'from-below' }, { x: 14, y: 2, to: 'rocket-hq-b2f', spot: 'from-above' }],
  spots: { 'from-above': [1, 3, 'down'], 'from-below': [14, 3, 'down'] },
  npcs: [{ id: 'lance', who: 'lance', x: 12, y: 3, dir: 'left', if: '!hideout-cleared',
           say: 'I will keep the guards here busy. Go on down the stairs!' }],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 2, y: 6, dir: 'right', sight: 2,
      team: [['rattata', 30], ['koffing', 31]],
      before: 'An intruder! How did you get past the shop?',
      defeat: 'Ugh, I let you in...',
      after: 'The boss is going to be so mad at me.' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 12, y: 7, dir: 'left', sight: 3,
      team: [['zubat', 30], ['grimer', 31], ['zubat', 30]],
      before: 'Our radio is making all the Magikarp evolve. Isn\'t it brilliant?',
      defeat: 'Not so brilliant after all...',
      after: 'We were going to sell all those Gyarados. Ruined!' },
    { id: 'grunt3', who: 'rocket', cls: 'team-rocket', x: 8, y: 10, dir: 'up', sight: 2,
      team: [['raticate', 32]],
      before: 'Team Rocket is back, and Johto is ours! Get out of here!',
      defeat: 'Johto is not ours yet...',
      after: 'Our executive is downstairs. He will deal with you.' }
  ],
  items: [{ x: 15, y: 11, item: 'hyper-potion', flag: 'hq-hyper-potion' }]
}, HQ));

G.Maps.def(Object.assign({
  id: 'rocket-hq-b2f',
  rows: [
    'WWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWW',
    '^+++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++PP++++++++++PP++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    'bbbbbbbbbbb+bbbbbb',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++'
  ],
  warps: [{ x: 0, y: 2, to: 'rocket-hq-b1f', spot: 'from-below' }],
  spots: { 'from-above': [1, 3, 'down'] },
  npcs: [
    { id: 'guard', who: 'rocket', x: 11, y: 8, dir: 'up', if: '!petrel-beaten',
      say: 'Nobody gets into the machine room without the executive\'s say-so!' },
    { id: 'lance', who: 'lance', x: 5, y: 5, dir: 'left', if: 'petrel-beaten', script: 'hideout.lance' },
    { id: 'electrode1', who: 'electrode', mon: 'electrode', x: 5, y: 11, dir: 'down', fixed: true, if: '!hq-electrode1', script: 'hideout.electrode' },
    { id: 'electrode2', who: 'electrode', mon: 'electrode', x: 9, y: 11, dir: 'down', fixed: true, if: '!hq-electrode2', script: 'hideout.electrode' },
    { id: 'electrode3', who: 'electrode', mon: 'electrode', x: 13, y: 11, dir: 'down', fixed: true, if: '!hq-electrode3', script: 'hideout.electrode' }
  ],
  trainers: [
    { id: 'petrel', who: 'rocket', cls: 'executive', name: 'Petrel', x: 9, y: 4, dir: 'down', sight: 3,
      team: [['zubat', 31], ['raticate', 32], ['koffing', 33]],
      before: 'So you are the brat who keeps getting in our way. I am Petrel, an executive of Team Rocket. Our radio signal will not be switched off by a child!',
      defeat: 'Hmph. Not bad, kid.',
      win: 'hideout.petrel-win' }
  ],
  items: [{ x: 16, y: 13, item: 'ultra-ball', flag: 'hq-ultra-ball' }]
}, HQ));

// ---------------- Pryce's Gym ----------------
G.Maps.def({
  id: 'mahogany-gym', loc: 'mahogany-town', region: 'johto', tileset: 'indoor', palette: 'ice', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    'p+++++++++++++p',
    '+++++++++++++++',
    '+++++++++++++++',
    'IIIIIcIcIIIIIII',
    'IcIIcIIIIIIIIII',
    'IcIIIIIIIIIIIcI',
    'IcIcIIIcIIIIIcI',
    'IIIIIIIIcIIIIII',
    'IccIIIIIIIIIIIc',
    'IIcIIcIcIIIIIII',
    'IIIIIIIIcIIIIII',
    'IIIIIIccIIIIIII',
    'cccccc+++cccccc',
    '+++++++X+++++++'
  ],
  warps: [{ x: 7, y: 15, to: 'mahogany', spot: 'gym-door' }],
  spots: { door: [7, 15, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 9, y: 15, dir: 'left', script: 'mahogany.gym-guide' }],
  trainers: [
    { id: 'roxanne', who: 'skier', cls: 'skier', name: 'Roxanne', x: 2, y: 3, dir: 'right', sight: 4,
      team: [['jynx', 31]],
      before: 'You made it across the ice? Then let us see how you do against a Skier!',
      defeat: 'I slipped...',
      after: 'Pryce never slips on the ice. Not once in fifty years.' },
    { id: 'clarissa', who: 'skier', cls: 'skier', name: 'Clarissa', x: 12, y: 3, dir: 'left', sight: 4,
      team: [['dewgong', 32]],
      before: 'The cold makes my Dewgong stronger. Are you freezing yet?',
      defeat: 'I am the one who is frozen...',
      after: 'Fire, Fighting, Rock and Steel moves melt Ice types.' },
    { id: 'ronald', who: 'boarder', cls: 'boarder', name: 'Ronald', x: 2, y: 15, dir: 'right', sight: 4,
      team: [['seel', 30], ['dewgong', 32]],
      before: 'I board on the ice every day. Ready to wipe out?',
      defeat: 'Wiped out...',
      after: 'On ice you keep sliding until something stops you. Use the rocks!' },
    { id: 'brad', who: 'boarder', cls: 'boarder', name: 'Brad', x: 12, y: 15, dir: 'left', sight: 4,
      team: [['swinub', 30], ['piloswine', 32]],
      before: 'Swinub dig in the snow for food. And they dig into opponents too!',
      defeat: 'Buried in the snow...',
      after: 'Pryce\'s Piloswine is huge. Its tusks can break ice.' },
    { id: 'pryce', who: 'pryce', cls: 'leader', name: 'Pryce', x: 7, y: 2, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['seel', 30, ['headbutt', 'icy-wind', 'aurora-beam', 'rest']], ['dewgong', 32, ['headbutt', 'icy-wind', 'aurora-beam', 'rest']],
             ['piloswine', 34, ['ice-fang', 'fury-attack', 'mist', 'take-down']]],
      before: 'Fifty winters I have trained with Ice Pokémon, and every one of them taught me something. I am Pryce. Let us see whether you can endure the cold!',
      defeat: 'Hm... You are stronger than the winter wind. A heart like yours will see you through any hardship.',
      win: 'mahogany.pryce-win',
      afterScript: [['say', 'Ice teaches patience. Winter is hard, but spring always follows. Keep going, young one.', { name: 'Pryce' }]] }
  ]
});

(() => {
  const T = s => G.T(s);
  const LANCE = { name: 'Lance' };

  async function electrode(h) {
    const F = G.Field, id = (h.ctx && h.ctx.self && h.ctx.self.id) || 'electrode1';
    await h.say(T('An Electrode is wired into the machine. It is powering the radio signal!'));
    await h.wild('electrode', 30, {});
    if (F.lastBattle === 'lose') return;
    if (id === 'electrode1') F.setFlag('hq-electrode1');
    else if (id === 'electrode2') F.setFlag('hq-electrode2');
    else F.setFlag('hq-electrode3');
    h.hide(id);
    if (['electrode1', 'electrode2', 'electrode3'].every(e => F.flag('hq-' + e))) {
      F.setFlag('hideout-cleared');
      await h.say(T('The machine fell silent. The radio signal has stopped!'));
    }
  }

  async function lance(h) {
    const F = G.Field;
    if (!F.flag('hideout-cleared')) {
      await h.say(T('Your Pokémon look tired. Here, let me help.'), LANCE);
      h.heal();
      await h.jingle('heal');
      await h.say(T('The Electrode in that room are powering the signal. Stop them, and the Gyarados will calm down.'), LANCE);
      return;
    }
    if (!F.flag('got-hm07')) {
      await h.say(T('You did it. The signal is gone, and the Gyarados in the lake will calm down.'), LANCE);
      await h.say(T('You fight well. Take this: HM07, Waterfall. With it, a Pokémon can climb a waterfall.'), LANCE);
      F.giveItem('hm07', 1);
      F.setFlag('got-hm07');
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('hm07') } });
      await j;
      await h.say(T('Pryce has opened his Gym again. We will meet again, I am sure of it.'), LANCE);
      return;
    }
    await h.say(T('Team Rocket is not finished yet. Stay on your guard.'), LANCE);
  }

  G.Script.def({
    'lake.gyarados': [
      ['emote', 'self', '!'],
      ['say', 'A red Gyarados! It is thrashing about in a terrible rage!'],
      ['wild', 'gyarados', 30, { shiny: true }],
      ['if', 'battle=lose', [], [
        ['setFlag', 'red-gyarados'],
        ['hide', 'self'],
        ['say', 'Something red is floating on the water...'],
        ['giveItem', 'red-scale', 1]
      ]]
    ],
    'lake.lance': [
      ['say', 'That Gyarados was red... You handled it well.', { name: 'Lance' }],
      ['say', 'I am Lance. I came here because the Gyarados in this lake were forced to evolve. A strange radio signal is coming from Mahogany Town.', { name: 'Lance' }],
      ['say', 'Team Rocket is behind it, I am sure. Meet me at the souvenir shop in Mahogany.', { name: 'Lance' }],
      ['setFlag', 'lance-mahogany']
    ],
    'mahogany.lance-shop': [
      ['say', 'The clerk was a Team Rocket Grunt. My Dragonite took care of him.', { name: 'Lance' }],
      ['say', 'The stairs behind the shelf lead to their hideout. I will go ahead. Follow me!', { name: 'Lance' }]
    ],
    'mahogany.shop-back': [['say', 'Behind the shelf... a cold draft comes up from somewhere below. The clerk is watching you.']],
    'mahogany.gym-closed': [['say', 'The Gym is locked. A note reads: "Strange signals have the town on edge. The Gym is closed until further notice. Pryce"']],
    'hideout.petrel-win': [
      ['say', 'Fine, fine. You beat me. But the transmitter is powered by our Electrode, and you will never switch them all off!', { name: 'Petrel' }],
      ['setFlag', 'petrel-beaten']
    ],
    'hideout.electrode': [['js', electrode]],
    'hideout.lance': [['js', lance]],
    'mahogany.gym-guide': [
      ['say', 'Yo, Champion! Pryce uses Ice types. Fire, Fighting, Rock and Steel moves are what you want.'],
      ['say', 'The floor is ice: you slide until something stops you. Use the rocks to steer!'],
      ['say', 'With six Johto badges, Pokémon up to level 60 obey you. Win here, and it goes up to 70!']
    ],
    'mahogany.pryce-win': [
      ['say', 'Take this. The Glacier Badge.', { name: 'Pryce' }],
      ['badge', 15],
      ['jingle', 'badge'],
      ['say', '{player} received the Glacier Badge from Pryce!'],
      ['say', 'With the Glacier Badge, Pokémon up to level 70 will listen to you.', { name: 'Pryce' }],
      ['say', 'And this: TM07, Hail. It brings down a hailstorm that hurts every Pokémon but the Ice types.', { name: 'Pryce' }],
      ['giveItem', 'tm07', 1],
      ['setFlag', 'pryce-beaten'],
      ['js', async () => { if (G.CreditsUI) await G.CreditsUI.ending(16); else G.Field.setFlag('chapter-16-done'); }]
    ]
  });
})();
