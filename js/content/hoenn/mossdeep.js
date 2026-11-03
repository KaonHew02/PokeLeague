/* ============ mossdeep.js — Team Aqua's hideout, Route 124, Mossdeep City, the Space Center ============
 * Chapter 36. Once the orbs are gone from Mt. Pyre (lilycove.js, flag orbs-taken), the cave in Lilycove's
 * cove is open: Team Aqua's hideout. 1F has two grunts, B1F a grunt, the Master Ball, and the dock where
 * the Admin Matt waits: Archie has already left in the submarine taken from Slateport, carrying the Blue
 * Orb to the bottom of the sea; you battle Matt (flag aqua-hideout-done). East of Lilycove the sea is
 * Route 124 (islets, two swimmers) to Mossdeep City, an island town: a Center, a Mart, Steven's house
 * (a letter), a house, the Space Center, and Tate and Liza's Gym. The twins battle as one Trainer (a
 * double battle since chapter 40): the Mind Badge (badge 23: Pokémon up to Lv. 70 obey in Hoenn) and TM04 Calm
 * Mind. Then Team Magma raids the Space Center for its rocket fuel: two grunts on 1F; on 2F Steven heals
 * your team, Tabitha battles you, then Maxie (flag space-center-saved), then `ending(36)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const MATT = { name: 'Matt' }, MAXIE = { name: 'Maxie' }, TABITHA = { name: 'Tabitha' }, STEVEN = { name: 'Steven' };
  const TATE = { name: 'Tate' }, LIZA = { name: 'Liza' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const ATTACK = ['badge:23', '!space-center-saved'];

  // ---------------- Team Aqua's hideout ----------------
  G.Maps.def(Object.assign({
    id: 'aqua-hideout-1f', loc: 'team-aqua-hideout', tileset: 'indoor', palette: 'hideout', music: 'cave', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW', '+++++++++++++^+', '+bbb++++++bbb++', '+++++++++++++++', '++++~~~~~~~++++', '++++~~~~~~~++++',
           '+++++++++++++++', '+bbb+++++++bbb+', '+++++++++++++++', '+++++++++++++++', '+++++++X+++++++'],
    warps: [{ x: 7, y: 11, to: 'lilycove', spot: 'hideout' }, { x: 13, y: 2, to: 'aqua-hideout-b1f', spot: 'from-above' }],
    spots: { door: [7, 11, 'up'], 'from-below': [13, 3, 'down'] },
    trainers: [
      { id: 'grunt1', who: 'aqua', cls: 'team-aqua', x: 0, y: 4, dir: 'right', sight: 7, if: '!aqua-hideout-done', team: [['carvanha', 34], ['golbat', 34]],
        before: 'How did you find our hideout? Doesn\'t matter: you are not leaving!',
        defeat: 'Our hideout... breached...',
        after: 'The boss is not even here. You are too late, whatever you came for!' },
      { id: 'grunt2', who: 'aqua', cls: 'team-aqua', x: 14, y: 7, dir: 'left', sight: 7, if: '!aqua-hideout-done', team: [['mightyena', 35]],
        before: 'Intruder! Intruder in the hideout!',
        defeat: 'Somebody, help...',
        after: 'Downstairs is the dock. Matt is down there. He will flatten you!' }
    ],
    items: [{ x: 1, y: 10, item: 'ultra-ball', flag: 'hideout-ultraball' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'aqua-hideout-b1f', loc: 'team-aqua-hideout', tileset: 'indoor', palette: 'hideout', music: 'cave', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWW', '+^+++++++++++++bb', '+++++++++++++++++', '+++bbb+++++bbb+++', '+++++++++++++++++', '+++++++++++++++++',
           '+++++++++++++++++', '+++++++++++++++++', '~~~~~~~~~~~~~~~~~', '~~~~~~~~~~~~~~~~~', '~~~~~~~~~~~~~~~~~'],
    warps: [{ x: 1, y: 2, to: 'aqua-hideout-1f', spot: 'from-below' }],
    spots: { 'from-above': [1, 3, 'down'] },
    triggers: [{ x: 4, y: 7, w: 9, h: 1, if: '!aqua-hideout-done', script: 'hideout.matt' }],
    trainers: [
      { id: 'grunt3', who: 'aqua', cls: 'team-aqua', x: 16, y: 6, dir: 'left', sight: 6, if: '!aqua-hideout-done', team: [['sharpedo', 35], ['golbat', 34]],
        before: 'You came all the way down here? Then you can go swimming with my Sharpedo!',
        defeat: 'I got bitten instead...',
        after: 'The submarine was docked right here. Was.' }
    ],
    npcs: [{ id: 'matt', who: 'matt', x: 8, y: 8, dir: 'down', if: '!aqua-hideout-done', script: 'hideout.matt' }],
    items: [{ x: 16, y: 3, item: 'master-ball', flag: 'hideout-masterball' }]
  }, HOENN));

  // ---------------- Route 124 ----------------
  G.Maps.def(Object.assign({
    id: 'route124', loc: 'hoenn-route-124', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    dive: 'route124-uw',                       // (chapter 37: deep water in the north-east, its sea floor in seafloor.js)
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~dddd~~',
      '~~~~~::::::::~~~~~~~~~~~~~dddd~~',
      '~~~~~:######:~~~~~~~~~~~~~dddd~~',
      '~~~~~:######:~~~~~~~~~~~~~~~~~~~',
      '~~~~~:######:~~~~~~~~~~~~~~~~~~~',
      '~~~~~:######:~~~~~~~~~~~~~~~~~~~',
      '~~~~~:######:~~~~~~~~~~~~~~~~~~~',
      '~~~~~::::::::~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~::::::::~~~~~~',
      '~~~~~~~~~~~~~~~~~~:######:~~~~~~',
      '~~~~~~~~~~~~~~~~~~:######:~~~~~~',
      '~~~~~~~~~~~~~~~~~~:######:~~~~~~',
      '~~~~~~~~~~~~~~~~~~:######:~~~~~~',
      '~~~~~~~~~~~~~~~~~~:######:~~~~~~',
      '~~~~~~~~~~~~~~~~~~::::::::~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { west: { map: 'lilycove', offset: -23 }, east: { map: 'mossdeep', offset: 0 }, south: { map: 'route126', offset: 0 } },
    storm: ['kyogre-awake', '!weather-calm'],                // (chapter 38: the storm Kyogre brings)
    trainers: [
      { id: 'rita-sam', who: 'swimmerf', cls: 'sis-and-bro', name: 'Rita & Sam', x: 20, y: 11, dir: 'down', sight: 4, swim: true, double: true,
        partner: { who: 'swimmer', x: 21, y: 11 }, team: [['lanturn', 36], ['seadra', 36]],
        before: 'Big sister and me, against you! Ready?',
        defeat: 'Sis, we lost!',
        after: 'Some moves hit both foes at once. Surf is one of them!' },
      { id: 'reed', who: 'swimmer', cls: 'swimmer', name: 'Reed', x: 14, y: 6, dir: 'down', sight: 4, swim: true, team: [['tentacruel', 36], ['wailmer', 36]],
        before: 'The sea between Lilycove and Mossdeep is my training ground. Let me show you!',
        defeat: 'I swallowed some seawater...',
        after: 'Mossdeep City is straight east. Its Space Center sends rockets up into the sky!' },
      { id: 'grace', who: 'swimmerf', cls: 'swimmer-f', name: 'Grace', x: 24, y: 8, dir: 'left', sight: 4, swim: true, team: [['marill', 36], ['wingull', 35], ['horsea', 36]],
        before: 'Swimming all the way to Mossdeep? Let us race... I mean, battle!',
        defeat: 'Out of breath...',
        after: 'The water around here is deep and dark in places. Some people say there is a whole world down there.' }
    ],
    items: [{ x: 5, y: 3, item: 'pearl', flag: 'route124-pearl' }, { x: 25, y: 20, item: 'ultra-ball', flag: 'route124-ultraball' }],
    encounters: { water: '@hoenn-route-124-area' }
  }, HOENN));

  // ---------------- Mossdeep City ----------------
  G.Maps.def(Object.assign({
    id: 'mossdeep', loc: 'mossdeep-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' }, storm: ['kyogre-awake', '!weather-calm'],
    rows: [
      '~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      '~~~~~::.........................TTTT',
      '~~~~~::.........................TTTT',
      '~~~~~::...................GGGGGGTTTT',
      '~~~~~::..CCCCC............GGGGGGTTTT',
      '~~~~~::..CCCCC...MMMM.....GGGGGGTTTT',
      '~~~~~::..CCCCC...MMMM.....GGGGGG...T',
      '~~~~~::..CCDCC...MDMM.....GGDGGG...T',
      '~~~~~::....,......,.........,...S..T',
      '~~~~~::....,......,.........,......T',
      '~~~~~::....,......,.........,......T',
      '~~~~~::....,..S...,.........,......T',
      '~~~~~,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      '~~~~~,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      '~~~~~::............................T',
      '~~~~~::............................T',
      '~~~~~::............................T',
      '~~~~~::..HHHH...HHHH.....BBBBBB....T',
      '~~~~~::..HHHH...HHHH.....BBBBBB....T',
      '~~~~~::..HDHH...HDHH.....BBBBBB....T',
      '~~~~~::...,......,.......BBDBBB....T',
      '~~~~~::....................,...S...T',
      '~~~~~::......fff.....fff...........T',
      '~~~~~::......fff.....fff...........T',
      '~~~~~::......fff.....fff...........T',
      '~~~~~::............................T',
      '~~~~~::............................T',
      '~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'route124', offset: 0 }, south: { map: 'route127', offset: 0 } },
    warps: [
      { x: 11, y: 7, to: 'mossdeep-center', spot: 'door' },
      { x: 18, y: 7, to: 'mossdeep-mart', spot: 'door' },
      { x: 28, y: 7, to: 'mossdeep-gym', spot: 'door' },
      { x: 10, y: 19, to: 'steven-house', spot: 'door' },
      { x: 17, y: 19, to: 'mossdeep-house', spot: 'door' },
      { x: 27, y: 20, to: 'space-center-1f', spot: 'door' }
    ],
    spots: { 'center-door': [11, 8, 'down'], 'mart-door': [18, 8, 'down'], 'gym-door': [28, 8, 'down'], 'steven-door': [10, 20, 'down'],
             'house-door': [17, 20, 'down'], 'space-door': [27, 21, 'down'] },
    signs: {
      '14,11': 'Mossdeep City. An island town where the stars feel close enough to touch.',
      '32,8': 'Mossdeep City Pokémon Gym. Leaders: Tate and Liza, twins who think as one.',
      '31,21': 'Mossdeep Space Center. Our window on the stars.'
    },
    npcs: [
      { id: 'boy', who: 'youngster', x: 15, y: 15, move: 'wander', r: 2,
        say: 'The Space Center launches rockets from here! When one takes off, the whole island shakes.' },
      { id: 'girl', who: 'lass', x: 24, y: 10, move: 'look',
        say: 'The Gym Leaders are twins. They say they can read each other\'s minds in battle!' },
      { id: 'man', who: 'gentleman', x: 8, y: 22, move: 'look',
        say: 'A young man named Steven lives in that house. He is always away, looking for rare stones.' },
      { id: 'sailor', who: 'sailor', x: 30, y: 24, move: 'look',
        say: 'The sea around Mossdeep is full of currents. Only good swimmers come this far.' }
    ],
    encounters: { water: '@mossdeep-city-area' }
  }, HOENN));

  G.Maps.center('mossdeep-center', {
    loc: 'mossdeep-city', exit: { map: 'mossdeep', spot: 'center-door' },
    npcs: [{ id: 'woman', who: 'beauty', x: 3, y: 5, move: 'look',
             say: 'Psychic Pokémon are weak to Bug, Ghost and Dark moves. Rock types do not like Water or Grass, either.' }]
  }).region = 'hoenn';

  G.Maps.mart('mossdeep-mart', {
    loc: 'mossdeep-city', exit: { map: 'mossdeep', spot: 'mart-door' },
    stock: ['ultra-ball', 'great-ball', 'hyper-potion', 'max-potion', 'revive', 'full-heal', 'escape-rope', 'max-repel', 'x-attack', 'x-defense'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'Everything here comes over by boat. That is why I always buy a little extra.' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'steven-house', loc: 'mossdeep-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'mossdeep', spot: 'steven-door' }],
    spots: { door: [4, 7, 'up'] },
    signs: { '5,4': 'A letter lies on the table: "I am off on a journey again. Whoever finds this, feel free to rest here. - Steven"' },
    // Chapter 37: home after the Space Center, with HM08 Dive.
    npcs: [{ id: 'steven', who: 'steven', x: 7, y: 3, dir: 'down', if: ['space-center-saved', '!kyogre-awake'], script: 'mossdeep.steven' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'mossdeep-house', loc: 'mossdeep-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'mossdeep', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'On a clear night you can see every star from Mossdeep. The scientists say the sky is clearer here than anywhere in Hoenn.' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'mossdeep-gym', loc: 'mossdeep-city', tileset: 'indoor', palette: 'pink', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'mossdeep', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [
      { id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'mossdeep.gym-guide' },
      { id: 'liza', who: 'liza', x: 7, y: 3, dir: 'down', fixed: true, script: 'mossdeep.liza' }
    ],
    trainers: [
      { id: 'preston', who: 'psychic', cls: 'psychic', name: 'Preston', x: 3, y: 8, dir: 'right', sight: 3, team: [['kirlia', 38], ['grumpig', 39]],
        before: 'I can read your next move! ...Probably.',
        defeat: 'I did not see that coming. Literally.',
        after: 'Tate and Liza do not even need to talk. They just know what the other is thinking.' },
      { id: 'clifford', who: 'gentleman', cls: 'gentleman', name: 'Clifford', x: 3, y: 5, dir: 'right', sight: 3, team: [['girafarig', 39], ['lunatone', 39]],
        before: 'I come to this Gym to train my mind, not just my Pokémon. Shall we?',
        defeat: 'A clear mind, and still I lost.',
        after: 'Lunatone and Solrock: the moon and the sun. The twins keep one of each.' },
      { id: 'virgil', who: 'psychic', cls: 'psychic', name: 'Virgil', x: 9, y: 5, dir: 'left', sight: 3, team: [['solrock', 39], ['xatu', 39]],
        before: 'The twins are strong, but you will have to get past me first!',
        defeat: 'My vision was clouded...',
        after: 'Solrock shines brighter in the sunshine. Watch out if the twins call up the sun.' },
      // A double battle (chapter 40): the twins' Pokémon two at a time.
      { id: 'tate', who: 'tate', cls: 'leader', name: 'Tate & Liza', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader', double: true,
        items: { 'hyper-potion': 1 },
        team: [['claydol', 41, ['earthquake', 'ancient-power', 'psychic', 'light-screen']],
               ['xatu', 41, ['psychic', 'sunny-day', 'confuse-ray', 'calm-mind']],
               ['lunatone', 42, ['light-screen', 'psychic', 'hypnosis', 'calm-mind']],
               ['solrock', 42, ['sunny-day', 'solar-beam', 'psychic', 'flamethrower']]],
        before: 'We are Tate and Liza, the Leaders of this Gym! We knew you were coming: we could feel it. Our minds work as one, so you will have to beat both of us!',
        defeat: 'We lost... We could read every move our Pokémon would make, but we could not read yours!',
        win: 'mossdeep.twins-win',
        afterScript: [['say', 'Next time we will read your mind too! ...Probably.', TATE]] }
    ]
  }, HOENN));

  // ---------------- the Space Center ----------------
  G.Maps.def(Object.assign({
    id: 'space-center-1f', loc: 'mossdeep-city', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbb+++++++^bb', '+++++++++++++', '++==+++++==++', '+++++++++++++', '+++++++++++++', '+++++++++++++',
           '++++++X++++++'],
    warps: [{ x: 6, y: 8, to: 'mossdeep', spot: 'space-door' }, { x: 10, y: 2, to: 'space-center-2f', spot: 'stairs' }],
    spots: { door: [6, 8, 'up'], stairs: [10, 3, 'down'] },
    trainers: [
      { id: 'grunt1', who: 'magma', cls: 'team-magma', x: 0, y: 6, dir: 'right', sight: 7, if: ATTACK, team: [['mightyena', 39], ['numel', 39]],
        before: 'Team Magma is borrowing this place\'s rocket fuel. Stay out of it!',
        defeat: 'Fizzled out...',
        after: 'Our leader is upstairs. You cannot stop him now!' },
      { id: 'grunt2', who: 'magma', cls: 'team-magma', x: 12, y: 5, dir: 'left', sight: 7, if: ATTACK, team: [['golbat', 39], ['camerupt', 40]],
        before: 'Not one step further! The fuel is ours!',
        defeat: 'Burned out...',
        after: 'With enough fuel, the volcano will wake for good. Then the land will grow!' }
    ],
    npcs: [{ id: 'scientist', who: 'scientist', x: 3, y: 3, dir: 'down', script: 'space.scientist' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'space-center-2f', loc: 'mossdeep-city', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor', enter: 'space.enter',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbb+++++++^bb', '+++++++++++++', '++ttt++++ttt+', '+++++++++++++', '+++++++++++++', '+++++++++++++'],
    warps: [{ x: 10, y: 2, to: 'space-center-1f', spot: 'stairs' }],
    spots: { stairs: [10, 3, 'down'] },
    trainers: [
      { id: 'tabitha', who: 'tabitha', cls: 'magma-admin', name: 'Tabitha', x: 6, y: 5, dir: 'right', sight: 0, if: ATTACK, team: [['camerupt', 40], ['mightyena', 40], ['golbat', 41]],
        before: 'You again! This time I will not lose!',
        defeat: 'Hmph... The boss will handle you.',
        after: 'Go on, then.' }
    ],
    npcs: [
      { id: 'director', who: 'scientist', x: 1, y: 3, dir: 'down', script: 'space.director' },
      { id: 'maxie', who: 'maxie', x: 4, y: 6, dir: 'right', if: ATTACK, script: 'space.maxie' },
      { id: 'steven', who: 'steven', x: 9, y: 6, dir: 'left', if: ATTACK, script: 'space.steven' }
    ]
  }, HOENN));

  // ---------------- the hideout: Matt ----------------
  async function matt(h) {
    const F = G.Field;
    if (F.flag('aqua-hideout-done')) return;
    h.face('matt', 'player');
    h.face('player', 'matt');
    await h.say(T('Hahaha! You came all the way down here? Too late! The boss already left in the submarine we took from Slateport!'), MATT);
    await h.say(T('He is taking the Blue Orb to the bottom of the sea, to wake the master of the sea. Nothing can stop him now!'), MATT);
    const out = await h.battle({ id: 'matt', who: 'matt', cls: 'aqua-admin', name: 'Matt', ai: 'leader', team: [['mightyena', 36], ['golbat', 36], ['sharpedo', 37]] }, {});
    if (out === 'lose') return;
    await h.say(T('Hah... whatever. You cannot catch a submarine anyway. Team Aqua, clear out!'), MATT);
    for (const id of ['matt', 'grunt3']) h.hide(id);
    F.setFlag('aqua-hideout-done');
  }

  // ---------------- the Space Center: Steven, Tabitha, Maxie ----------------
  async function raid(h) {
    const F = G.Field;
    if (!F.test(ATTACK)) return;
    h.face('steven', 'player');
    await h.say(T('{player}, you came! Team Magma broke in. They want the rocket fuel to make Mt. Chimney erupt for good.'), STEVEN);
    await h.say(T('Here, let me heal your Pokémon first. Then let us stop them, together.'), STEVEN);
    G.Field.healAll();
    if (h.healAnim) await h.healAnim();
    await h.say(T('{player}\'s Pokémon were healed!'));
  }
  async function maxie(h) {
    const F = G.Field;
    if (!F.test(ATTACK)) return;
    h.face('maxie', 'player');
    await h.say(T('So, you again. Rocket fuel poured into Mt. Chimney would wake the volcano for good... and the Red Orb would do the rest.'), MAXIE);
    await h.say(T('I will not let a child stand in my way twice!'), MAXIE);
    const out = await h.battle({ id: 'maxie-space', who: 'maxie', cls: 'magma-leader', name: 'Maxie', ai: 'leader', items: { 'hyper-potion': 1 },
      team: [['mightyena', 42], ['crobat', 42], ['camerupt', 43]] }, {});
    if (out === 'lose') return;
    await h.say(T('...Even so, the Red Orb is mine. Team Magma, withdraw! We go where the master of the land sleeps.'), MAXIE);
    for (const id of ['maxie', 'tabitha']) h.hide(id);
    F.setFlag('space-center-saved');
    h.face('steven', 'player');
    await h.say(T('Thank you, {player}. The fuel is safe... but both teams now hold an orb. Something terrible is coming to Hoenn. Be ready.'), STEVEN);
    h.hide('steven');
    // The end of the thirty-sixth chapter (credits-ui.js).
    if (G.CreditsUI) G.CreditsUI.ending(36); else F.setFlag('chapter-36-done');
  }

  G.Script.def({
    'hideout.matt': [['js', matt]],
    'space.enter': [['if', ATTACK, [['js', raid], ['call', 'space.maxie']]]],
    // Tabitha first (unless already beaten, e.g. by talking to her), then Maxie.
    'space.maxie': [
      ['if', '!done:space-center-2f:tabitha', [
        ['face', 'tabitha', 'player'],
        ['say', 'You again! This time I will not lose!', TABITHA],
        ['battle', 'tabitha'],
        ['if', 'battle=lose', [['end']]],
        ['say', 'Hmph... The boss will handle you.', TABITHA]
      ]],
      ['js', maxie]
    ],
    'space.steven': [['say', 'Team Magma\'s leader is right there. Let us finish this, {player}!', STEVEN]],
    'mossdeep.steven': [
      ['face', 'steven', 'player'],
      ['if', '!got-hm08', [
        ['say', '{player}, welcome to my home. Thank you again for what you did at the Space Center.', STEVEN],
        ['say', 'While we were busy with Team Magma, Team Aqua\'s submarine slipped away to the south of Mossdeep. I think they mean to go under the sea.', STEVEN],
        ['say', 'Take this. With it, you can follow them.', STEVEN],
        ['giveItem', 'hm08', 1],
        ['setFlag', 'got-hm08'],
        ['say', 'HM08 is Dive. With the Mind Badge, a Pokémon that knows it can take you down from deep, dark water to the sea floor.', STEVEN]
      ]],
      ['say', 'The submarine was last seen over the dark water of Route 128, south of Route 127. Be careful down there, {player}.', STEVEN]
    ],
    'space.scientist': [
      ['if', ATTACK, [
        ['say', 'Team Magma stormed in! They are after our rocket fuel! The director is upstairs!']
      ], [
        ['say', 'We are getting ready for our next launch. The fuel for one rocket could light up a whole city!']
      ]]
    ],
    'space.director': [
      ['if', 'space-center-saved', [
        ['say', 'You saved our fuel, and our launch. The whole Space Center thanks you!']
      ], [['if', ATTACK, [
        ['say', 'Please, stop them! If that fuel ends up inside a volcano...']
      ], [
        ['say', 'Welcome to the Space Center. One day, we hope to send a Pokémon to the stars.']
      ]]]]
    ],
    'mossdeep.liza': [['say', 'We are two, but we battle as one. That is our strength!', LIZA]],
    'mossdeep.gym-guide': [
      ['say', 'Yo, Champion! Tate and Liza battle as a pair, and their Pokémon are Psychic and Rock types. Dark, Ghost and Water moves will serve you well!'],
      ['say', 'Watch out for Solrock\'s Solar Beam once the sun comes out. And Claydol knows Earthquake!']
    ],
    'mossdeep.twins-win': [
      ['say', 'You beat both of us at once! Here, the Mind Badge. You earned it.', LIZA],
      ['badge', 23],
      ['jingle', 'badge'],
      ['say', '{player} received the Mind Badge from Tate and Liza!'],
      ['say', 'With seven Hoenn badges, Pokémon up to level 70 will obey you, wherever they come from.', TATE],
      ['say', 'And take TM04, Calm Mind. It sharpens your Pokémon\'s mind: its Special Attack and Special Defense both go up.', LIZA],
      ['giveItem', 'tm04', 1],
      ['say', 'Oh! The Space Center... We can feel something is wrong there. Hurry!', TATE]
    ]
  });
})();
