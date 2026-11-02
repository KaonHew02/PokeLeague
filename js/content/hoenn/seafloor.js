/* ============ seafloor.js — Routes 127 and 128, the sea floor, the Seafloor Cavern, Kyogre ============
 * Chapter 37. After the Space Center (mossdeep.js, flag space-center-saved), Steven waits at home in
 * Mossdeep and gives you HM08 Dive (flag got-hm08): with the Mind Badge, a Pokémon that knows it takes you
 * from deep water (`d`) down to the sea floor (field.js; maps with `dive` and `underwater`). South of
 * Mossdeep the sea is Route 127 (two islets, four trainers, two patches of deep water over sea-floor
 * pockets with seaweed and items), then Route 128 (three trainers): its deep water lies over the mouth of
 * the Seafloor Cavern. You come up in the cavern's pool, where Team Aqua's submarine is moored. Room 1 has
 * two grunts, a cracked rock and a boulder; room 2 a grunt and Shelly; in the deepest chamber Archie
 * battles you, then raises the Blue Orb: Kyogre wakes and vanishes into the depths. Maxie comes too
 * late (he woke Groudon in the mountain, and it is gone as well), the leaders hurry out, and you come up
 * on Route 128 under pouring rain (flag kyogre-awake), then `ending(37)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const ARCHIE = { name: 'Archie' }, MAXIE = { name: 'Maxie' }, GRUNT = { name: 'Team Aqua Grunt' }, STEVEN = { name: 'Steven' };
  // Chapter 38: the storm Kyogre brings, until Rayquaza calms it (sootopolis.js).
  const STORM = ['kyogre-awake', '!weather-calm'];
  // The sea floor: one map below each sea route, the same size (deep water above its lit floor).
  const SEA = { tileset: 'outdoor', palette: 'underwater', music: 'cave', battleBg: 'underwater', border: '#', underwater: true, region: 'hoenn' };
  const CAVERN = { loc: 'seafloor-cavern', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true,
                   region: 'hoenn', encounters: { walk: '@seafloor-cavern-area', water: '@seafloor-cavern-area' } };

  // ---------------- Route 124's sea floor ----------------
  G.Maps.def(Object.assign({
    id: 'route124-uw', loc: 'hoenn-route-124', surface: 'route124',
    rows: [
      '################################',
      '################################',
      '##########################,,,,##',
      '##########################,,,,##',
      '##########################,,,,##',
      '######################........##',
      '######################.""""....#',
      '######################.""""....#',
      '##################.....""""....#',
      '##################""".#........#',
      '##################""".##########',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################',
      '################################'
    ],
    items: [{ x: 19, y: 8, item: 'calcium', flag: 'route124-uw-calcium' }],
    encounters: { seaweed: '@hoenn-route-124-underwater' }
  }, SEA));

  // ---------------- Route 127 ----------------
  G.Maps.def(Object.assign({
    id: 'route127', loc: 'hoenn-route-127', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    dive: 'route127-uw', storm: STORM,
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~ddddd~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~ddddd~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~ddddd~~~~~~~',
      '~~~~~~~~:::::::::~~~~~~~ddddd~~~~~~~',
      '~~~~~~~~::#####::~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~::#####::~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~::#####::~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~:::::::::~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~:::::::::~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~ddddd~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~ddddd~~~~~~~~~~~:::::::::~~~~~~',
      '~~~~~ddddd~~~~~~~~~~~::#####::~~~~~~',
      '~~~~~ddddd~~~~~~~~~~~::#####::~~~~~~',
      '~~~~~ddddd~~~~~~~~~~~::#####::~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~:::::::::~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~:::::::::~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'mossdeep', offset: 0 }, south: { map: 'route128', offset: 0 }, west: { map: 'route126', offset: -4 } },
    trainers: [
      { id: 'koji', who: 'blackbelt', cls: 'black-belt', name: 'Koji', x: 12, y: 14, dir: 'down', sight: 4, team: [['machoke', 39], ['hariyama', 39]],
        before: 'I train on this islet where nobody bothers me. Nobody but you, it seems!',
        defeat: 'My fists hit nothing but sea spray...',
        after: 'Have you noticed the darker water around here? That is where the sea is deepest.' },
      { id: 'camden', who: 'swimmer', cls: 'swimmer', name: 'Camden', x: 18, y: 20, dir: 'left', sight: 4, swim: true, team: [['tentacruel', 39], ['staryu', 38]],
        before: 'The currents south of Mossdeep are the best workout there is!',
        defeat: 'I got swept off my rhythm...',
        after: 'I saw a submarine heading south the other day. Strange thing to see out here.' },
      { id: 'jonah', who: 'fisherman', cls: 'fisherman', name: 'Jonah', x: 25, y: 30, dir: 'down', sight: 4, team: [['wailmer', 38], ['tentacool', 37], ['sharpedo', 39]],
        before: 'Something big is biting today! Is it you?',
        defeat: 'The big one got away again.',
        after: 'With a Super Rod you can hook real monsters out here.' },
      { id: 'donna', who: 'swimmerf', cls: 'swimmer-f', name: 'Donna', x: 30, y: 34, dir: 'up', sight: 4, swim: true, team: [['marill', 38], ['luvdisc', 39]],
        before: 'Swimming this far from land? You must be good. Let us see!',
        defeat: 'I need to catch my breath...',
        after: 'Route 128 is just south. The water there turns dark over something under the sea.' }
    ],
    items: [{ x: 16, y: 9, item: 'carbos', flag: 'route127-carbos' }, { x: 21, y: 30, item: 'ultra-ball', flag: 'route127-ultraball' }],
    encounters: { water: '@hoenn-route-127-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'route127-uw', loc: 'hoenn-route-127', surface: 'route127',
    rows: [
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '########################,,,,,...####',
      '########################,,,,,...####',
      '########################,,,,,...####',
      '########################,,,,,...####',
      '######################...""""...####',
      '######################...""""...####',
      '######################...""""...####',
      '#######################........#####',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '###..........#######################',
      '###..........#######################',
      '#####,,,,,....######################',
      '#####,,,,,."""######################',
      '#####,,,,,."""######################',
      '#####,,,,,."""######################',
      '#####,,,,,."""######################',
      '###........"""######################',
      '###.""""".."""######################',
      '###.""""".....######################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################',
      '####################################'
    ],
    items: [{ x: 30, y: 8, item: 'big-pearl', flag: 'route127-uw-bigpearl' }, { x: 3, y: 22, item: 'zinc', flag: 'route127-uw-zinc' },
            { x: 4, y: 29, item: 'pearl', flag: 'route127-uw-pearl', hidden: true }],
    encounters: { seaweed: '@hoenn-route-126-underwater' }
  }, SEA));

  // ---------------- Route 128 ----------------
  G.Maps.def(Object.assign({
    id: 'route128', loc: 'hoenn-route-128', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    dive: 'route128-uw', storm: STORM,
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~::::::::~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~::####::~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~::####::~~~~~~~~~~~~~~~~~~~~~~~~###~~~',
      '~~~~~~::####::~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~::::::::~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~dddddd~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~dddddd~:::~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~dddddd~:::~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~dddddd~:::~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~dddddd~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~####~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~####~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~####~~~~~~~~~~~~~~~~####~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~####~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~####~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~####~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route127', offset: 0 }, west: { map: 'route129', offset: 4 } },
    // Chapter 38: Steven on the sandbar, once Kyogre is awake.
    triggers: [{ x: 25, y: 7, w: 9, h: 9, if: ['kyogre-awake', '!steven-128'], script: 'route128.steven' }],
    npcs: [{ id: 'steven', who: 'steven', x: 35, y: 11, dir: 'left', if: ['kyogre-awake', '!steven-128'], script: 'route128.steven' }],
    trainers: [
      { id: 'isaiah', who: 'fisherman', cls: 'fisherman', name: 'Isaiah', x: 9, y: 8, dir: 'down', sight: 4, team: [['wailmer', 40], ['tentacruel', 40]],
        before: 'This reef is my secret fishing spot. Now that you know, you have to battle me!',
        defeat: 'Reeled in and beaten...',
        after: 'Some days the sea goes quiet, as if something huge were sleeping under it.' },
      { id: 'kat', who: 'swimmerf', cls: 'swimmer-f', name: 'Kat', x: 22, y: 14, dir: 'right', sight: 4, swim: true, team: [['goldeen', 39], ['seaking', 40], ['marill', 39]],
        before: 'Dark water like this gives me the shivers. A battle will warm me up!',
        defeat: 'Brrr... I lost and I am still cold.',
        after: 'People say the dark water hides a way into a cave under the sea.' },
      { id: 'wayne', who: 'swimmer', cls: 'swimmer', name: 'Wayne', x: 38, y: 11, dir: 'left', sight: 4, swim: true, team: [['tentacruel', 40], ['pelipper', 40]],
        before: 'I swam all the way from Ever Grande City. Let us see if you can keep up!',
        defeat: 'You leave a big wake...',
        after: 'Ever Grande City is far to the east. The strongest Trainers in Hoenn gather there.' }
    ],
    encounters: { water: '@hoenn-route-128-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'route128-uw', loc: 'hoenn-route-128', surface: 'route128',
    rows: [
      '############################################',
      '############################################',
      '############################################',
      '############################################',
      '############################################',
      '############################################',
      '############################################',
      '############################################',
      '############################################',
      '###########################,,,,,,###########',
      '###########################,,,,,,###########',
      '###########################,,,,,,###########',
      '###########################,,,,,,###########',
      '###########################,,,,,,###########',
      '#########################..........#########',
      '#########################."""".....#########',
      '#########################."""".....#########',
      '#########################."""".....#########',
      '##############################.......#######',
      '##############################...."""#######',
      '##############################...."""#######',
      '##############################...###########',
      '###############################O############',
      '############################################',
      '############################################',
      '############################################'
    ],
    warps: [{ x: 31, y: 22, to: 'seafloor-entrance', spot: 'pool' }],
    spots: { mouth: [31, 21, 'up'] },
    signs: { '30,22': 'A dark opening in the rock. Bubbles rise from inside it.' },
    items: [{ x: 36, y: 18, item: 'protein', flag: 'route128-uw-protein' }],
    encounters: { seaweed: '@hoenn-route-126-underwater' }
  }, SEA));

  // ---------------- The Seafloor Cavern ----------------
  G.Maps.def(Object.assign({
    id: 'seafloor-entrance', dive: { to: 'route128-uw', spot: 'mouth' },
    rows: [
      '####################',
      '###......%.......###',
      '##................##',
      '##................##',
      '##................##',
      '##................##',
      '##................##',
      '##................##',
      '##...dddddddddd#####',
      '##...dddddddddd#####',
      '##...dddddddddd#####',
      '#####dddddddddd#####',
      '#####dddddddddd#####',
      '####################'
    ],
    warps: [{ x: 9, y: 1, to: 'seafloor-1', spot: 'ladder' }],
    spots: { pool: [9, 10, 'up'], ladder: [9, 1, 'down'] },
    signs: { '15,8': 'Team Aqua\'s submarine is moored at the rock. Its hatch is open, and nobody is aboard.' },
    npcs: [{ id: 'grunt', who: 'aqua', x: 13, y: 7, dir: 'down', if: '!kyogre-awake',
             say: 'Huh? How did you get down here without a submarine? ...Never mind, the boss went on ahead. You are too late!' }]
  }, CAVERN));

  G.Maps.def(Object.assign({
    id: 'seafloor-1',
    rows: [
      '########################',
      '########################',
      '#..............#########',
      '#..............#########',
      '#..............#########',
      '#..............#########',
      '#####.########.#########',
      '#####.########.#########',
      '#####.########.#########',
      '#####k########.........#',
      '#####.########.........#',
      '#####.########.........#',
      '#........#####.........#',
      '#........#########.#####',
      '#........#######.......#',
      '#........#######....%..#',
      '#..%.....#######.......#',
      '########################'
    ],
    warps: [{ x: 3, y: 16, to: 'seafloor-entrance', spot: 'ladder' }, { x: 20, y: 15, to: 'seafloor-2', spot: 'ladder' }],
    spots: { ladder: [3, 16, 'up'], down: [20, 15, 'up'] },
    boulders: [{ id: 'b1', x: 18, y: 13 }],
    trainers: [
      { id: 'grunt1', who: 'aqua', cls: 'team-aqua', x: 8, y: 3, dir: 'down', sight: 3, if: '!kyogre-awake', team: [['carvanha', 38], ['mightyena', 38]],
        before: 'This cavern is Team Aqua\'s now! Turn around and swim home!',
        defeat: 'Sunk like a stone...',
        after: 'The boss has the Blue Orb. Once he reaches the deepest chamber, it is all over.' },
      { id: 'grunt2', who: 'aqua', cls: 'team-aqua', x: 19, y: 10, dir: 'left', sight: 5, if: '!kyogre-awake', team: [['sharpedo', 39], ['golbat', 38]],
        before: 'You smashed your way through? Then I will smash you!',
        defeat: 'How are you this strong?',
        after: 'There is a boulder in the way down. Good luck moving it!' }
    ],
    items: [{ x: 1, y: 2, item: 'hyper-potion', flag: 'seafloor-hyperpotion' }]
  }, CAVERN));

  G.Maps.def(Object.assign({
    id: 'seafloor-2',
    rows: [
      '######################',
      '###.............%..###',
      '##..................##',
      '##..................##',
      '##..................##',
      '########......#...####',
      '########......#...####',
      '########......#...####',
      '########......#...####',
      '########......#...####',
      '##..................##',
      '##..................##',
      '##..................##',
      '##..................##',
      '##..%...............##',
      '######################'
    ],
    warps: [{ x: 4, y: 14, to: 'seafloor-1', spot: 'down' }, { x: 16, y: 1, to: 'seafloor-deep', spot: 'ladder' }],
    spots: { ladder: [4, 14, 'up'], up: [16, 1, 'down'] },
    trainers: [
      { id: 'grunt3', who: 'aqua', cls: 'team-aqua', x: 6, y: 12, dir: 'right', sight: 6, if: '!kyogre-awake', team: [['mightyena', 39], ['carvanha', 39], ['golbat', 39]],
        before: 'Down here, nobody can hear you call for help!',
        defeat: 'Nobody heard me lose either, I hope...',
        after: 'Shelly is waiting up ahead. She is still angry about the Weather Institute.' },
      { id: 'shelly', who: 'shelly', cls: 'aqua-admin', name: 'Shelly', x: 10, y: 6, dir: 'down', sight: 3, if: '!kyogre-awake', ai: 'leader',
        team: [['sharpedo', 41], ['mightyena', 41]],
        before: 'Ahaha! You again? You ruined my plans at the Weather Institute. Not this time: the boss is about to wake the master of the sea!',
        defeat: 'Ahaha... Beaten again. Go on, then. You will see what the boss is made of.',
        after: 'Go on. The boss is in the deepest chamber. Ahaha... I wonder what you will find there.' }
    ],
    items: [{ x: 18, y: 2, item: 'max-revive', flag: 'seafloor-maxrevive' }]
  }, CAVERN));

  G.Maps.def(Object.assign({
    id: 'seafloor-deep',
    rows: [
      '######################',
      '######################',
      '#####.~~~~~~~~~~.#####',
      '#####.~~~~~~~~~~.#####',
      '##....~~~~~~~~~~....##',
      '##....~~~~~~~~~~....##',
      '##....~~~~~~~~~~....##',
      '##....~~~~~~~~~~....##',
      '##..................##',
      '##..................##',
      '##..................##',
      '##..................##',
      '##..................##',
      '##..................##',
      '##........%.........##',
      '######################'
    ],
    warps: [{ x: 10, y: 14, to: 'seafloor-2', spot: 'up' }],
    spots: { ladder: [10, 14, 'up'] },
    triggers: [{ x: 2, y: 12, w: 18, h: 1, if: '!kyogre-awake', script: 'seafloor.archie' }],
    npcs: [
      { id: 'kyogre', who: 'kyogre', mon: 'kyogre', x: 10, y: 6, dir: 'down', fixed: true, swim: true, if: '!kyogre-awake',
        say: 'A huge Pokémon lies still at the bottom of the pool. It seems to be asleep.' },
      { id: 'archie', who: 'archie', x: 10, y: 8, dir: 'up', if: '!kyogre-awake', script: 'seafloor.archie' },
      { id: 'a1', who: 'aqua', x: 7, y: 8, dir: 'up', if: '!kyogre-awake', script: 'seafloor.archie' },
      { id: 'a2', who: 'aqua', x: 13, y: 8, dir: 'up', if: '!kyogre-awake', script: 'seafloor.archie' },
      { id: 'maxie', who: 'maxie', x: 10, y: 14, dir: 'up', if: 'scripted' }
    ]
  }, CAVERN));

  // ---------------- The deepest chamber: Archie, the Blue Orb, Kyogre ----------------
  async function archie(h) {
    const F = G.Field;
    if (F.flag('kyogre-awake')) return;
    await h.walkTo('player', 10, 10);
    h.face('player', 'up');
    await h.say(T('There it is... the master of the sea, asleep at the bottom of the world. Kyogre.'), ARCHIE);
    h.face('archie', 'player');
    await h.say(T('Well, well. The kid who keeps turning up. You followed us all the way to the sea floor?'), ARCHIE);
    await h.say(T('When Kyogre wakes, the seas will rise and every Pokémon of the sea will have room to live. That is Team Aqua\'s dream, and you will not sink it!'), ARCHIE);
    const out = await h.battle({ id: 'archie', who: 'archie', cls: 'aqua-leader', name: 'Archie', ai: 'leader', items: { 'hyper-potion': 1 },
      team: [['mightyena', 41], ['crobat', 41], ['sharpedo', 43]] }, {});
    if (out === 'lose') return;
    await h.say(T('Hah... You are tough, kid, I will give you that. But you are too late. The Blue Orb has been shining since we came down here.'), ARCHIE);
    h.face('archie', 'up');
    await h.say(T('Archie raises the Blue Orb. It glows with a deep blue light!'));
    h.sfx('cry');
    h.emote('kyogre', '!');
    await h.say(T('The water of the pool heaves. The huge Pokémon opens its eyes!'));
    await h.fade('out', 0.5);
    h.hide('kyogre');
    await h.fade('in', 0.5);
    await h.say(T('Kyogre dived into the depths and disappeared!'));
    h.emote('archie', '!');
    await h.say(T('Where are you going? Kyogre! I am the one who woke you!'), ARCHIE);
    h.emote('a1', '?');
    await h.say(T('Boss! The people on the surface are calling! A storm came out of nowhere, and the rain will not stop!'), GRUNT);
    // Maxie, too late.
    h.place('maxie', 10, 14, 'up'); h.show('maxie');
    await h.walkTo('maxie', 9, 11);
    h.face('maxie', 'archie');
    await h.say(T('Archie! Do you see what you have done? The rain up there is drowning the land!'), MAXIE);
    h.face('archie', 'maxie');
    await h.say(T('Maxie... You are one to talk. You took the Red Orb into the mountain, did you not?'), ARCHIE);
    await h.say(T('...I did. Groudon woke in the heart of the mountain, and then it was gone, just like your Kyogre. Neither of them obeys an orb, it seems.'), MAXIE);
    await h.say(T('If the master of the land and the master of the sea meet... Team Aqua, Team Magma, to the surface! We have to find them!'), ARCHIE);
    for (const id of ['archie', 'a1', 'a2', 'maxie']) h.hide(id);
    F.setFlag('kyogre-awake');
    await h.fade('out', 0.5);
    await h.warp('route128', { x: 29, y: 11, dir: 'down' });
    await h.say(T('Rain is pouring down from a sky as dark as night. Somewhere out at sea, Kyogre is awake.'));
    // The end of the thirty-seventh chapter (credits-ui.js).
    if (G.CreditsUI) G.CreditsUI.ending(37); else F.setFlag('chapter-37-done');
  }

  G.Script.def({
    'seafloor.archie': [['js', archie]],
    'route128.steven': [
      ['face', 'steven', 'player'],
      ['say', '{player}! You made it out of the cavern. I saw the sky turn black from Mossdeep and came as fast as I could.', STEVEN],
      ['say', 'Kyogre is not the only one awake. Groudon has risen too, and both of them are heading for Sootopolis City.', STEVEN],
      ['say', 'Sootopolis lies inside a crater on Route 126, west of Route 127. By sea, the only way in is under the water: Dive in the deep water south of the crater and you will come up in the city\'s lake.', STEVEN],
      ['say', 'I will fly ahead. Hurry, {player}!', STEVEN],
      ['setFlag', 'steven-128'],
      ['hide', 'steven']
    ]
  });
})();
