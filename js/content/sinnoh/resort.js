/* ============ resort.js — Routes 228, 229 and 230, and the Resort Area ============
 * Chapter 63. From the far shore of Route 226 a road runs south: Route 228 through sand and rock in a sandstorm that never
 * stops (`sandstorm`: blowing sand on the screen, a sandstorm in battles), Route 229 green and warm with the sea to the west,
 * and the Resort Area by the beach, where a guide welcomes you the first time (`ending(63)`). Route 230 is the sea from
 * Route 229 west to Fight Area, with an island in the middle. Platinum needs Rock Climb nowhere here; Surf, Cut and Rock
 * Smash open the side ways. Platinum's Trainers and wild Pokémon. Left out: the villa and the Ribbon Syndicate (their doors
 * stay shut), Pokémon Kid Ariel, Rock Peak Ruins, the tutor of the strongest moves, berries, the Dowsing Machine's items.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const GUIDE = { name: 'Resort guide' };

  // ---------------- Route 228 ----------------
  G.Maps.def(Object.assign({
    id: 'route228', loc: 'sinnoh-route-228', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: '#',
    sandstorm: true,
    rows: [
      '##############,,################',
      '#:::::::::::::,,S::::::::::::::#',
      '#:::::::::::::,,:::::::::::::::#',
      '#:::::::::::::,,:::::::::::::::#',
      '#:::::::::::::,,:::::::::::::::#',
      '#:::::::::::::,,:::::::::::::::#',
      '#:::::::::::::,,:::::::::::::::#',
      '#:::::::::::::,,:::::::::::::::#',
      '#:::::::::::::,,,,,,,,,,,,:::::#',
      '#:::::::::::::,,,,,,,,,,,,:::::#',
      '########################,,######',
      '########################,,######',
      '#:::::::::::::::::::::::,,:::::#',
      '#::~~~~~~~~:::::"""""""",,"":::#',
      '#::~~~~~~~~:::::"""""""",,"":::#',
      '#::~~~::~~~:::::"""""""",,"":::#',
      '#::~~~::~~~:::::"""""""",,"":::#',
      '#::~~~~~~~~:::::"""""""",,"":::#',
      '#::~~~~~~~~:::::"""""""",,"":::#',
      '#::~~~~~~~~:::::"""""""",,"":::#',
      '#::::,,,,,,,,,,,,,,,,,,,,,:::::#',
      '#::::,,,,,,,,,,,,,,,,,,,,,:::::#',
      '#####,,#########################',
      '#####,,#########################',
      '#::::,,::::::::::::::::::::::::#',
      '#::":,,:""""""::"""""":#########',
      '#::":,,:""""""::"""""":#::::::##',
      '#::":,,:""""""::"""""":#::::::##',
      '#::":,,:""""""::"""""":k::::::##',
      '#::":,,:""""""::"""""":#::::::##',
      '#::":,,:""""""::"""""":#::::::##',
      '#::":,,:""""""::"""""":#::::::##',
      '#::::,,::::::::::::::::#########',
      '#::::,,,,,,,,,,,:::::::::::::::#',
      '#::::,,,,,,,,,,,:::::::::::::::#',
      '##############,,################',
      '##############,,################',
      '#:::::::::::::,,:::::::::::::::#',
      '#::"""""""""::,,::"""""""""":::#',
      '#::"""""""""::,,::"""""""""":::#',
      '#::"""""""""::,,::"""""""""":::#',
      '#::"""""""""::,,::"""""""""":::#',
      '#::"""""""""::,,::"""""""""":::#',
      '#::"""""""""::,,::"""""""""":::#',
      '#:::::::::::::,,:::::::::::::::#',
      '##############,,################'
    ],
    connect: { north: { map: 'route226', offset: -36 }, south: { map: 'route229', offset: 0 } },
    encounters: { walk: '@sinnoh-route-228-area', water: '@sinnoh-route-228-area' },
    signs: { '16,1': 'Route 228. South: Route 229 and the Resort Area. The sand never stops blowing.' },
    items: [{ x: 26, y: 28, item: 'rare-candy', flag: 'route228-candy' }, { x: 2, y: 2, item: 'protector', flag: 'route228-protector' },
            { x: 29, y: 2, item: 'tm37', flag: 'route228-tm37' }, { x: 2, y: 44, item: 'iron', flag: 'route228-iron' },
            { x: 6, y: 15, item: 'shiny-stone', flag: 'route228-shiny' }],
    trainers: [
      { id: 'jose', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Jose', x: 12, y: 5, dir: 'right', sight: 2,
        before: 'Sand in my eyes, sand in my teeth. A battle is the only thing that takes my mind off it!',
        defeat: 'Now I have sand in my pride, too.',
        after: 'Keep your eyes half shut and keep walking. That is the only way through.',
        team: [['golduck', 56, ['hydro-pump', 'brick-break', 'zen-headbutt', 'screech']], ['sandslash', 56, ['earthquake', 'crush-claw', 'poison-jab', 'sand-tomb']],
               ['manectric', 57, ['thunder-fang', 'fire-fang', 'quick-attack', 'giga-impact']]] },
      { id: 'moira', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Moira', x: 20, y: 7, dir: 'down', sight: 2,
        before: 'My team loves the sandstorm. Yours, I am not so sure.',
        defeat: 'Yours does not seem to mind it either.',
        after: 'Ground types do not feel the sand at all. Lucky them.',
        team: [['sandslash', 56, ['slash', 'gyro-ball', 'dig', 'x-scissor']], ['gastrodon', 56, ['muddy-water', 'recover', 'body-slam', 'protect']],
               ['claydol', 57, ['earthquake', 'psychic', 'ancient-power', 'cosmic-power']]] },
      { id: 'kyler', who: 'ranger', cls: 'ranger', name: 'Kyler', x: 26, y: 15, dir: 'left', sight: 2,
        before: 'A ranger never gets lost, even in a sandstorm. You, on the other hand...',
        defeat: 'You know exactly where you are going. Good.',
        after: 'The road goes south to the coast. The air gets clearer the further you go.',
        team: [['exeggcute', 55, ['worry-seed', 'natural-gift', 'solar-beam', 'psychic']], ['zangoose', 55, ['detect', 'false-swipe', 'x-scissor', 'close-combat']],
               ['empoleon', 58, ['aqua-jet', 'whirlpool', 'mist', 'drill-peck']]] },
      { id: 'krista', who: 'rangerf', cls: 'ranger-f', name: 'Krista', x: 23, y: 18, dir: 'right', sight: 2,
        before: 'I patrol this road every day. Today, I patrol you!',
        defeat: 'Patrol over. You win.',
        after: 'There is a pond to the west. Nobody knows how it stays full in all this sand.',
        team: [['lairon', 57, ['metal-sound', 'iron-tail', 'double-edge', 'metal-burst']], ['marowak', 57, ['fling', 'bone-rush', 'endeavor', 'double-edge']]] },
      { id: 'keegan', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Keegan', x: 12, y: 19, dir: 'down', sight: 2,
        before: 'In the desert, dragons are born from the sand. Let me show you!',
        defeat: 'Mine still has some growing to do.',
        after: 'One day my Vibrava will be a Flygon, and then the sandstorm will be ours.',
        team: [['trapinch', 55, ['sand-tomb', 'crunch', 'dig', 'sandstorm']], ['vibrava', 57, ['dragon-breath', 'screech', 'sandstorm', 'hyper-beam']]] },
      { id: 'corbin', who: 'psychic', cls: 'psychic', name: 'Corbin', x: 7, y: 27, dir: 'left', sight: 2,
        before: 'I cannot see a thing in this storm. So I see with my mind instead.',
        defeat: 'My mind did not see that one coming.',
        after: 'Close your eyes and listen. The sand sings.',
        team: [['xatu', 56, ['future-sight', 'ominous-wind', 'power-swap', 'guard-swap']], ['gallade', 56, ['feint', 'false-swipe', 'protect', 'close-combat']]] },
      { id: 'meagan', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Meagan', x: 12, y: 32, dir: 'down', sight: 2,
        before: 'I brought an Ice type to the desert. Do not laugh. Battle!',
        defeat: 'Fine. You may laugh now.',
        after: 'My Abomasnow keeps me cool. It is better than a parasol.',
        team: [['delcatty', 57, ['fake-out', 'captivate', 'feint-attack', 'double-edge']], ['abomasnow', 58, ['ice-shard', 'avalanche', 'razor-leaf', 'water-pulse']]] },
      { id: 'davon', who: 'blackbelt', cls: 'black-belt', name: 'Davon', x: 16, y: 40, dir: 'left', sight: 2,
        before: 'Training in the sand makes the legs strong! Hyah!',
        defeat: 'My legs are strong. My Pokémon, less so.',
        after: 'Route 229 is just ahead. Then the sea. Then a nap.',
        team: [['tyrogue', 54, ['tackle', 'helping-hand', 'fake-out', 'foresight']], ['makuhita', 54, ['wake-up-slap', 'endure', 'close-combat', 'reversal']],
               ['machamp', 57, ['wake-up-slap', 'cross-chop', 'scary-face', 'dynamic-punch']]] }
    ]
  }, SINNOH));

  // ---------------- Route 229 ----------------
  G.Maps.def(Object.assign({
    id: 'route229', loc: 'sinnoh-route-229', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.............,,S......................T',
      'T.......fffff.,,...........""""""""""..T',
      'T.TT....fffff.,,...........""""""""""..T',
      'T.......fffff.,,....TT.....""""""""""..T',
      'T.......fffff.,,...........""""""""""..T',
      'T.......fffff.,,...........""""""""""..T',
      'T.............,,...........""""""""""..T',
      '~~~~~~:.......,,.......................T',
      '~~~~~~:.......,,,,,,,,,,,,.............T',
      '~~~~~~:.......,,,,,,,,,,,,....TT.......T',
      '~~~~~~:.................,,.............T',
      '~~~~~~:."""""""""""""...,,.............T',
      '~~~~~~:."""""""""""""...,,.."""""""""".T',
      '~~~~~~:."""""""""""""...,,.."""""""""".T',
      '~~~~~~:."""""""""""""...,,.."""""""""".T',
      '~~~~~~:."""""""""""""...,,.."""""""""".T',
      '~~~~~~:."""""""""""""...,,.."""""""""".T',
      '~~~~~~:."""""""""""""...,,.."""""""""".T',
      '~~~~~~:."""""""""""""...,,.."""""""""".T',
      '~~~~~~:.................,,.."""""""""".T',
      '~~~~~~:TTTTcTTTTfffffff.,,.."""""""""".T',
      '~~~~~~:T.......Tfffffff.,,.."""""""""".T',
      '~~~~~~:T.......T........,,.."""""""""".T',
      '~~~~~~:T.......T........,,.."""""""""".T',
      '~~~~~~:T.......T..T.....,,.............T',
      '~~~~~~:T.......T...T....,,.............T',
      '~~~~~~:T.......T........,,..........T..T',
      'T......TTTTTTTTT........,,.............T',
      'TTTTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'route228', offset: 0 }, south: { map: 'resort-area', offset: 0 }, west: { map: 'route230', offset: 8 } },
    encounters: { walk: '@sinnoh-route-229-area', water: '@sinnoh-route-229-area' },
    signs: { '16,1': 'Route 229. South: the Resort Area. West: the sea.' },
    items: [{ x: 9, y: 23, item: 'full-restore', flag: 'route229-restore' }, { x: 13, y: 26, item: 'reaper-cloth', flag: 'route229-cloth' },
            { x: 37, y: 1, item: 'nugget', flag: 'route229-nugget' }, { x: 37, y: 27, item: 'protein', flag: 'route229-protein' },
            { x: 6, y: 9, item: 'thunder-stone', flag: 'route229-thunder' }],
    trainers: [
      { id: 'deshawn', who: 'ranger', cls: 'ranger', name: 'Deshawn', x: 16, y: 5, dir: 'left', sight: 2,
        before: 'After the sandstorm, this road feels like paradise. Let us celebrate with a battle!',
        defeat: 'Some celebration. Well done.',
        after: 'Those flowers grow nowhere else in the Battle Zone. Please do not step on them.',
        team: [['spinda', 54, ['teeter-dance', 'psych-up', 'double-edge', 'flail']], ['kecleon', 54, ['screech', 'substitute', 'sucker-punch', 'shadow-claw']],
               ['granbull', 54, ['roar', 'rage', 'take-down', 'payback']]] },
      { id: 'felix', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Felix', x: 20, y: 8, dir: 'down', sight: 2,
        before: 'I came here to rest. Then I saw you, and I forgot all about resting.',
        defeat: 'Now I really do need a rest.',
        after: 'The Resort Area is just south. Everybody there is on holiday, all the time.',
        team: [['dusclops', 55, ['shadow-sneak', 'payback', 'curse', 'will-o-wisp']], ['salamence', 56, ['dragon-claw', 'aerial-ace', 'zen-headbutt', 'crunch']]] },
      { id: 'dana', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Dana', x: 26, y: 16, dir: 'left', sight: 2,
        before: 'A Champion on my road? Then I get to see what a Champion can do!',
        defeat: 'So that is what a Champion can do.',
        after: 'I will be a Champion one day, too. Just you wait.',
        team: [['mightyena', 55, ['crunch', 'sucker-punch', 'iron-tail', 'scary-face']], ['kirlia', 56, ['psychic', 'magical-leaf', 'shock-wave', 'shadow-ball']]] },
      { id: 'sandra', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Sandra', x: 23, y: 23, dir: 'right', sight: 2,
        before: 'My team is a little bit of everything. Let us see if you can handle it!',
        defeat: 'You handled it, all right.',
        after: 'There is a grove behind the trees to the west. You need to cut your way in.',
        team: [['dugtrio', 55, ['mud-bomb', 'slash', 'earthquake', 'fissure']], ['raichu', 54, ['thunder-shock', 'tail-whip', 'quick-attack', 'thunderbolt']],
               ['ninetales', 54, ['ember', 'quick-attack', 'confuse-ray', 'safeguard']]] }
    ]
  }, SINNOH));

  // ---------------- Route 230 ----------------
  G.Maps.def(Object.assign({
    id: 'route230', loc: 'sinnoh-sea-route-230', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~::::::::::::::~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:S...........:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:..""""""""..:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:..""""""""..:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:..""""""""..:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:..""""""""..:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:...TTkTTT...:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:...T....T...:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:...T....T...:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:...T....T...:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~:...TTTTTT...:~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~::::::::::::::~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { west: { map: 'fight-area', offset: -2 }, east: { map: 'route229', offset: -8 } },
    encounters: { walk: '@sinnoh-sea-route-230-area', water: '@sinnoh-sea-route-230-area' },
    signs: { '24,6': 'Route 230. West: Fight Area. East: Route 229.' },
    items: [{ x: 30, y: 13, item: 'rare-candy', flag: 'route230-candy' }],
    trainers: [
      { id: 'glenn', who: 'swimmer', cls: 'swimmer', name: 'Glenn', x: 8, y: 6, dir: 'down', sight: 4, swim: true,
        before: 'I swim from Fight Area and back every day. Today I will beat a Champion on the way!',
        defeat: 'Or not. Back to swimming.',
        after: 'The island in the middle is a good place to rest your arms.',
        team: [['octillery', 53, ['bullet-seed', 'wring-out', 'signal-beam', 'ice-beam']], ['poliwhirl', 53, ['belly-drum', 'wake-up-slap', 'hydro-pump', 'mud-bomb']]] },
      { id: 'kurt', who: 'swimmer', cls: 'swimmer', name: 'Kurt', x: 14, y: 15, dir: 'up', sight: 4, swim: true,
        before: 'Pinch, pinch! My crabs are hungry!',
        defeat: 'Ouch. They pinched me instead.',
        after: 'Kingler can cut through anything. Except you, it seems.',
        team: [['krabby', 51, ['slam', 'brine', 'crabhammer', 'flail']], ['corphish', 51, ['night-slash', 'crabhammer', 'swords-dance', 'crunch']],
               ['kingler', 54, ['protect', 'guillotine', 'slam', 'brine']]] },
      { id: 'joanna', who: 'swimmerf', cls: 'swimmer-f', name: 'Joanna', x: 19, y: 10, dir: 'right', sight: 3, swim: true,
        before: 'I followed a Lapras out here, and now I cannot find my way back. Battle me while I think!',
        defeat: 'I think I know the way now. That way. Probably.',
        after: 'Lapras carries people across the sea. Mine just carries me.',
        team: [['luvdisc', 52, ['aqua-ring', 'captivate', 'flail', 'safeguard']], ['lapras', 54, ['ice-beam', 'brine', 'safeguard', 'hydro-pump']]] },
      { id: 'sophia', who: 'swimmerf', cls: 'swimmer-f', name: 'Sophia', x: 42, y: 4, dir: 'down', sight: 4, swim: true,
        before: 'Delibird has a present for you! It might be a nice one. It might not.',
        defeat: 'Not a nice one, then. For me.',
        after: 'Mantine glides over the waves. I wish I could.',
        team: [['delibird', 53, ['present']], ['mantine', 53, ['confuse-ray', 'bounce', 'aqua-ring', 'hydro-pump']]] },
      { id: 'sam', who: 'swimmer', cls: 'swimmer', name: 'Sam', x: 46, y: 16, dir: 'up', sight: 4, swim: true,
        before: 'The water is cold out here. A battle will warm us up!',
        defeat: 'I am warm now. Warm and beaten.',
        after: 'Sealeo loves cold water. It is the only one of us who does.',
        team: [['sealeo', 53, ['swagger', 'rest', 'snore', 'blizzard']], ['gastrodon', 53, ['hidden-power', 'rain-dance', 'body-slam', 'muddy-water']]] },
      { id: 'mallory', who: 'swimmerf', cls: 'swimmer-f', name: 'Mallory', x: 52, y: 9, dir: 'left', sight: 4, swim: true,
        before: 'My Surskit walks on water. I have to swim. It is not fair!',
        defeat: 'This is not fair either!',
        after: 'Route 229 is right there. You can see the flowers from the water.',
        team: [['surskit', 52, ['agility', 'mist', 'haze', 'baton-pass']], ['lombre', 54, ['bubble-beam', 'zen-headbutt', 'uproar', 'hydro-pump']]] }
    ]
  }, SINNOH));

  // ---------------- The Resort Area ----------------
  G.Maps.def(Object.assign({
    id: 'resort-area', loc: 'resort-area', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'north' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTT',
      'TTT.....................,,.......T',
      'T.......................,,S......T',
      'T..YYYYYYYY.............,,...TT..T',
      'T..YYYYYYYY..EEEEEEEE...,,.......T',
      'T..YYYYYYYY..EEEEEEEE...,,.......T',
      'T..YYYYYYYY..EEEEEEEE...,,.......T',
      'T..YYYYYYYY..EEEEEEEE...,,...T.T.T',
      'T..YYYDYYYY..EEEDEEEES..,,.......T',
      'T.....,....S....,.......,,.......T',
      'T.....,.........,.......,,.......T',
      'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T................................T',
      'T..fffffff......ffffff...........T',
      'T..fffffff......ffffff...........T',
      'T................................T',
      'T::::::::::::::::::::::::::::::::T',
      'T::::::::::::::::::::::::::::::::T',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route229', offset: 0 } },
    encounters: { water: '@resort-area-area' },
    warps: [{ x: 6, y: 8, locked: 'resort.villa' }, { x: 16, y: 8, locked: 'resort.club' }],
    spots: { north: [25, 2, 'down'] },
    signs: { '11,9': 'A villa by the sea. It has stood empty all season.',
             '21,8': 'The Ribbon Syndicate. Members only.',
             '26,2': 'The Resort Area. Rest, relax, and leave your battles at the door.' },
    items: [{ x: 31, y: 16, item: 'nugget', flag: 'resort-nugget' }],
    triggers: [{ x: 24, y: 1, w: 2, h: 1, if: '!resort-welcome', script: 'resort.arrive' }],
    npcs: [
      { id: 'guide', who: 'gentleman', x: 27, y: 4, dir: 'left', say: 'The villa over there has stood empty all season. Someone will move in one day, I am sure of it.' },
      { id: 'tourist', who: 'beauty', x: 10, y: 13, move: 'look', say: 'I came for one night and stayed three weeks. Nobody here is ever in a hurry.' },
      { id: 'bather', who: 'swimmer', x: 20, y: 17, dir: 'down', say: 'The water here is warm all year. The swimmers on Route 230 are less friendly, though.' }
    ]
  }, SINNOH));

  /** The first time you come into the Resort Area: a welcome, the end of the chapter. */
  async function arrive(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('resort-welcome')) return;
    h.emote('guide', '!');
    // Up beside you (on a phone the bottom of the screen is under the text box).
    if (me) await h.walkTo('guide', me.x + 1, me.y);
    h.face('guide', 'player');
    h.face('player', 'guide');
    await h.say(T('Welcome, welcome! You came all the way from the Survival Area? Then you have seen the whole Battle Zone.'), GUIDE);
    await h.say(T('This is the Resort Area. People come here to rest after their battles: the villas, the beach, the sound of the sea.'), GUIDE);
    await h.say(T('Stay as long as you like. The sea will still be here tomorrow.'), GUIDE);
    F.setFlag('resort-welcome');
    if (F.flag('chapter-63-done')) return;
    // The end of the sixty-third chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(63); else F.setFlag('chapter-63-done');
  }

  G.Script.def({
    'resort.arrive': [['js', arrive]],
    'resort.villa': [['say', 'The door is locked. A note says the villa is waiting for its owner.']],
    'resort.club': [['say', 'The door is locked. A sign says: "Members only. Trainers whose Pokémon have earned ten ribbons or more."']]
  });
})();
