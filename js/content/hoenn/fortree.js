/* ============ fortree.js — Route 119, the Weather Institute, Fortree City, Route 120 ============
 * Chapter 34. North of Route 118, Route 119 runs through tall grass beside a river to Fortree City.
 * Team Aqua has taken over the Weather Institute on its way: two grunts on 1F, one on 2F and the Admin
 * Shelly, who leaves once beaten; the institute's chief gives you a Castform (flags institute-saved,
 * got-castform). Further north the rival battles you (flag rival3-119). In Fortree City something you
 * cannot see stands in the Gym's doorway (a locked warp). On Route 120 Steven shows you a hidden
 * Kecleon with the Devon Scope, then gives you the Scope (flag got-devon-scope); with it the Kecleon at
 * the Gym shows itself and you battle it (flag kecleon-gone). Winona's Gym: the Feather Badge (badge 22:
 * Pokémon up to Lv. 60 obey in Hoenn) and TM40 Aerial Ace, then `ending(34)`. Route 121, south of
 * Route 120, is closed for now.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const SHELLY = { name: 'Shelly' }, CHIEF = { name: 'Institute Chief' }, STEVEN = { name: 'Steven' }, WINONA = { name: 'Winona' };
  const RIVAL3 = { name: '{rival3}' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 119 ----------------
  G.Maps.def(Object.assign({
    id: 'route119', loc: 'hoenn-route-119', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTT,,TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.........,,...................TTTTT',
      'T.........,,...................TTTTT',
      'T.........,,...................TTTTT',
      'T.........,,...................TTTTT',
      'T.........,,,,,,...............TTTTT',
      'T.........,,,,,,...............TTTTT',
      'T.............,,...............TTTTT',
      'T.............,,........~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.""""""""....,,."""""".~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'T..BBBBBB.....,,........~~~~~~~....T',
      'T..BBBBBB.....,,........~~~~~~~....T',
      'T..BBBBBB.....,,........~~~~~~~....T',
      'T..BBDBBBS....,,........~~~~~~~....T',
      'T....,,,,,,,,,,,........~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'T.............,,."""""".~~~~~~~....T',
      'T.............,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.""""""""""".,,."""""".~~~~~~~....T',
      'T.............,,S.......~~~~~~~....T',
      'T.............,,........~~~~~~~....T',
      'TTTTTTTTTTTTTT,,TTTTTTTT~~~~~~~TTTTT'
    ],
    connect: { south: { map: 'route118', offset: -14 }, north: { map: 'fortree', offset: -4 } },
    warps: [{ x: 5, y: 33, to: 'institute-1f', spot: 'door' }],
    spots: { 'institute-door': [5, 34, 'down'] },
    signs: {
      '16,53': 'Route 119. South: Route 118. North: Fortree City.',
      '9,33': 'Weather Institute. Studying the skies of Hoenn, rain or shine.'
    },
    triggers: [{ x: 14, y: 8, w: 2, h: 1, if: ['institute-saved', '!rival3-119'], script: 'route119.rival' }],
    trainers: [
      { id: 'hugh', who: 'birdkeeper', cls: 'bird-keeper', name: 'Hugh', x: 12, y: 46, dir: 'right', sight: 2, team: [['wingull', 27], ['tropius', 28]],
        before: 'The rain hardly ever stops on Route 119. My birds do not mind one bit!',
        defeat: 'Soaked through...',
        after: 'Tropius grows fruit around its neck. Children in the south love to eat it!' },
      { id: 'brent', who: 'camper', cls: 'camper', name: 'Brent', x: 17, y: 30, dir: 'left', sight: 2, team: [['zangoose', 28]],
        before: 'This grass is so tall I can barely see you. Good thing my Zangoose can!',
        defeat: 'Lost in the grass...',
        after: 'Zangoose and Seviper have been enemies forever. They fight whenever they meet.' },
      { id: 'eugene', who: 'fisherman', cls: 'fisherman', name: 'Eugene', x: 23, y: 30, dir: 'right', sight: 0,
        team: [['magikarp', 26], ['tentacool', 27], ['carvanha', 28]],
        before: 'Shh! The fish are biting... Oh, all right, a battle first.',
        defeat: 'They all got away...',
        after: 'They say a rare fish hides in this river. It only bites in a few special spots.' },
      { id: 'gwen', who: 'lass', cls: 'picnicker', name: 'Gwen', x: 16, y: 14, dir: 'left', sight: 1, team: [['oddish', 27], ['marill', 27], ['roselia', 28]],
        before: 'I came to see the Weather Institute. Want to battle in the rain?',
        defeat: 'My umbrella blew away...',
        after: 'The scientists at the Weather Institute can tell you what the weather will be tomorrow!' }
    ],
    npcs: [
      { id: 'may', who: 'may', x: 11, y: 3, dir: 'down', if: ['institute-saved', '!rival3-119', 'rival3=may'], script: 'route119.rival' },
      { id: 'brendan', who: 'brendan', x: 11, y: 3, dir: 'down', if: ['institute-saved', '!rival3-119', 'rival3=brendan'], script: 'route119.rival' }
    ],
    items: [{ x: 1, y: 54, item: 'super-repel', flag: 'route119-superrepel' }, { x: 1, y: 28, item: 'full-heal', flag: 'route119-fullheal' },
            { x: 34, y: 54, item: 'ultra-ball', flag: 'route119-ultraball' }],
    encounters: { walk: '@hoenn-route-119-area', water: '@hoenn-route-119-area' }
  }, HOENN));

  // ---------------- the Weather Institute ----------------
  G.Maps.def(Object.assign({
    id: 'institute-1f', loc: 'hoenn-route-119', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbb+++++++^bb', '+++++++++++++', '++===+++===++', '+++++++++++++', '+++++++++++++', '+++++++++++++',
           '++++++X++++++'],
    warps: [{ x: 6, y: 8, to: 'route119', spot: 'institute-door' }, { x: 10, y: 2, to: 'institute-2f', spot: 'stairs' }],
    spots: { door: [6, 8, 'up'], stairs: [10, 3, 'down'] },
    trainers: [
      { id: 'grunt1', who: 'aqua', cls: 'team-aqua', x: 2, y: 6, dir: 'right', sight: 4, if: '!institute-saved', team: [['carvanha', 27], ['poochyena', 27]],
        before: 'Team Aqua is borrowing this place. Scram!',
        defeat: 'Washed out...',
        after: 'Our Admin is upstairs. She will deal with you!' },
      { id: 'grunt2', who: 'aqua', cls: 'team-aqua', x: 11, y: 5, dir: 'left', sight: 4, if: '!institute-saved', team: [['zubat', 27], ['carvanha', 28]],
        before: 'The weather data in here is just what our boss needs. Keep out!',
        defeat: 'Tch...',
        after: 'With the sea and the rain on our side, Team Aqua cannot lose!' }
    ],
    npcs: [{ id: 'scientist', who: 'scientist', x: 3, y: 3, dir: 'down', script: 'institute.scientist' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'institute-2f', loc: 'hoenn-route-119', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bb++++++++^bb', '+++++++++++++', '++ttt++++ttt+', '+++++++++++++', '+++++++++++++', '+++++++++++++'],
    warps: [{ x: 10, y: 2, to: 'institute-1f', spot: 'stairs' }],
    spots: { stairs: [10, 3, 'down'] },
    trainers: [
      { id: 'grunt3', who: 'aqua', cls: 'team-aqua', x: 2, y: 6, dir: 'right', sight: 3, if: '!institute-saved', team: [['poochyena', 27], ['zubat', 28]],
        before: 'You made it up here? Then you will have to get past me!',
        defeat: 'Swept away...',
        after: 'Shelly will not go easy on you. She never does.' },
      { id: 'shelly', who: 'shelly', cls: 'aqua-admin', name: 'Shelly', x: 6, y: 4, dir: 'down', sight: 2, if: '!institute-saved', ai: 'leader',
        team: [['carvanha', 28], ['mightyena', 28]],
        before: 'Ahaha! So you are the brat who keeps getting in Team Aqua\'s way. The research in this place is ours now: we need to know how to bring the rain!',
        defeat: 'Ahaha... I lost? Fine. We have what we came for anyway.',
        win: 'institute.shelly-win' }
    ],
    npcs: [{ id: 'chief', who: 'scientist', x: 1, y: 3, dir: 'right', script: 'institute.chief' }]
  }, HOENN));

  // ---------------- Fortree City ----------------
  G.Maps.def(Object.assign({
    id: 'fortree', loc: 'fortree-city', tileset: 'outdoor', palette: 'forest', music: 'town', battleBg: 'forest', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T...............TTTT...........T',
      'T...............TTTT...........T',
      'T...............TTTT..GGGGGG...T',
      'T..CCCCC..............GGGGGG...T',
      'T..CCCCC..MMMM........GGGGGG...T',
      'T..CCCCC..MMMM........GGGGGG...T',
      'T..CCDCC..MDMM........GGDGGG...T',
      'T....,.....,............,...S..T',
      'T....,.....,.S..........,......T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T.............,,...............T',
      'T.............,,...............T',
      'T........TTTT.,,.........TTTTT.T',
      'T...HHHH.TTTT.,,....HHHH.TTTTT.T',
      'T...HHHH.TTTT.,,....HHHH.TTTTT.T',
      'T...HDHH.TTTT.,,....HDHH.TTTTT.T',
      'T....,...TTTT.,,.....,...TTTTT.T',
      'T........TTTT.,,.TT......TTTTT.T',
      'T........TTTT.,,.TT......TTTTT.T',
      'T.............,,.TT............T',
      'T.............,,.TT............T',
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route119', offset: 4 }, east: { map: 'route120', offset: 0 } },
    warps: [
      { x: 5, y: 7, to: 'fortree-center', spot: 'door' },
      { x: 11, y: 7, to: 'fortree-mart', spot: 'door' },
      // Something unseeable stands in the Gym's doorway until the Devon Scope shows it (kecleon-gone).
      { x: 24, y: 7, to: 'fortree-gym', spot: 'door', locked: 'fortree.unseen', if: 'kecleon-gone' },
      { x: 5, y: 17, to: 'fortree-house', spot: 'door' },
      { x: 21, y: 17, to: 'fortree-house2', spot: 'door' }
    ],
    spots: { 'center-door': [5, 8, 'down'], 'mart-door': [11, 8, 'down'], 'gym-door': [24, 8, 'down'], 'house-door': [5, 18, 'down'],
             'house2-door': [21, 18, 'down'] },
    signs: {
      '13,9': 'Fortree City. A city of homes built high up among the trees.',
      '28,8': 'Fortree City Pokémon Gym. Leader: Winona, who rides the wind with her bird Pokémon.'
    },
    npcs: [
      { id: 'boy', who: 'youngster', x: 8, y: 12, move: 'wander', r: 2,
        say: 'Everyone in Fortree lives up in the trees. The view from my window is amazing!' },
      { id: 'girl', who: 'lass', x: 19, y: 6, move: 'look',
        say: 'Something is wrong with the Gym. Whenever I try to go in, I bump into thin air!' },
      { id: 'man', who: 'gentleman', x: 27, y: 12, move: 'look',
        say: 'East of town, Route 120 crosses a river on a long bridge. A young man with silver hair went that way.' },
      { id: 'granny', who: 'granny', x: 5, y: 20, move: 'look',
        say: 'Winona flies with her bird Pokémon every morning. She looks so free up there.' }
    ]
  }, HOENN));

  G.Maps.center('fortree-center', {
    loc: 'fortree-city', exit: { map: 'fortree', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'Flying types are weak to Electric, Ice and Rock moves. Keep that in mind before you visit the Gym!' }]
  }).region = 'hoenn';

  G.Maps.mart('fortree-mart', {
    loc: 'fortree-city', exit: { map: 'fortree', spot: 'mart-door' },
    stock: ['great-ball', 'ultra-ball', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'awakening', 'full-heal', 'revive', 'escape-rope',
            'super-repel', 'x-sp-def'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'Revive brings a fainted Pokémon back to the fight. Do not leave home without one!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'fortree-house', loc: 'fortree-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'fortree', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'This house is built around the trunk of a great tree. When the wind blows, the whole house sways a little.' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'fortree-house2', loc: 'fortree-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'fortree', spot: 'house2-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'girl', who: 'lass', x: 2, y: 5, move: 'wander', r: 1,
             say: 'Kecleon can change colours to blend into anything around it. Some say they hide right in the middle of town!' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'fortree-gym', loc: 'fortree-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'fortree', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'fortree.gym-guide' }],
    trainers: [
      { id: 'jared', who: 'birdkeeper', cls: 'bird-keeper', name: 'Jared', x: 3, y: 8, dir: 'right', sight: 3, team: [['swellow', 30], ['pelipper', 29]],
        before: 'Winona taught us to battle like the wind. Let me show you!',
        defeat: 'Blown off course...',
        after: 'Winona never loses her calm, even when her Pokémon are in trouble. That is what makes her strong.' },
      { id: 'darius', who: 'birdkeeper', cls: 'bird-keeper', name: 'Darius', x: 3, y: 5, dir: 'right', sight: 3, team: [['tropius', 30], ['xatu', 29]],
        before: 'My Pokémon read the wind before they take off. Can you read it too?',
        defeat: 'The wind turned...',
        after: 'Xatu stares at the sun all day. They say it can see the future in it.' },
      { id: 'humberto', who: 'birdkeeper', cls: 'bird-keeper', name: 'Humberto', x: 9, y: 5, dir: 'left', sight: 3, team: [['skarmory', 30]],
        before: 'Skarmory\'s wings are as hard as steel. Your attacks will just bounce off!',
        defeat: 'Feathers of steel, and still...',
        after: 'Skarmory is part Steel. Fire and Electric moves are what it fears most.' },
      { id: 'winona', who: 'winona', cls: 'leader', name: 'Winona', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 1 },
        team: [['swablu', 29, ['perish-song', 'mirror-move', 'safeguard', 'aerial-ace']],
               ['tropius', 29, ['sunny-day', 'aerial-ace', 'solar-beam', 'synthesis']],
               ['pelipper', 30, ['water-gun', 'supersonic', 'protect', 'aerial-ace']],
               ['skarmory', 31, ['sand-attack', 'fury-attack', 'steel-wing', 'aerial-ace']],
               ['altaria', 33, ['earthquake', 'dragon-breath', 'dragon-dance', 'aerial-ace']]],
        before: 'I am Winona, the Leader of the Fortree Gym. My bird Pokémon and I have soared through the skies together for years. Let us see if you can keep up!',
        defeat: 'You flew higher than I ever imagined. I have never seen a Trainer guide their Pokémon so gracefully.',
        win: 'fortree.winona-win',
        afterScript: [['say', 'The sky over Hoenn is wide. I hope you keep flying higher, {player}.', WINONA]] }
    ]
  }, HOENN));

  // ---------------- Route 120 ----------------
  G.Maps.def(Object.assign({
    id: 'route120', loc: 'hoenn-route-120', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T............~~~~~~..........T',
      'T............~~~~~~."""""""".T',
      'T............~~~~~~."""""""".T',
      'T............~~~~~~."""""""".T',
      'T............~~~~~~."""""""".T',
      'T............~~~~~~."""""""".T',
      'T............~~~~~~."""""""".T',
      'T............~~~~~~..........T',
      'T..........S.~~~~~~..........T',
      ',,,,,,,,,,,,,======,,,,......T',
      ',,,,,,,,,,,,,======,,,,......T',
      'T............~~~~~~..,,......T',
      'T."""""""""..~~~~~~..,,."""".T',
      'T."""""""""..~~~~~~..,,."""".T',
      'T."""""""""..~~~~~~..,,."""".T',
      'T."""""""""..~~~~~~..,,."""".T',
      'T."""""""""..~~~~~~..,,S"""".T',
      'T............~~~~~~..,,......T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'fortree', offset: 0 } },
    signs: {
      '11,9': 'Route 120. West: Fortree City. Over the bridge, the road turns south.',
      '23,17': 'South: Route 121, to Lilycove City. The road is closed for now.'
    },
    trainers: [
      { id: 'jennifer', who: 'lass', cls: 'lass', name: 'Jennifer', x: 5, y: 8, dir: 'down', sight: 2, team: [['marill', 28], ['plusle', 28]],
        before: 'I love the river under this bridge. Let us battle beside it!',
        defeat: 'Splash...',
        after: 'If you look closely at the bridge, sometimes it looks like the air is shimmering...' },
      { id: 'colin', who: 'birdkeeper', cls: 'bird-keeper', name: 'Colin', x: 24, y: 9, dir: 'down', sight: 1, team: [['natu', 28], ['swellow', 29]],
        before: 'My birds saw you coming from all the way across the river!',
        defeat: 'Grounded again...',
        after: 'Natu cannot fly very well yet. It hops from branch to branch instead.' }
    ],
    npcs: [{ id: 'steven', who: 'steven', x: 13, y: 10, dir: 'left', if: '!got-devon-scope', script: 'route120.steven' }],
    items: [{ x: 1, y: 1, item: 'great-ball', flag: 'route120-greatball' }, { x: 28, y: 18, item: 'hyper-potion', flag: 'route120-hyperpotion' }],
    encounters: { walk: '@hoenn-route-120-area', water: '@hoenn-route-120-area' }
  }, HOENN));

  // ---------------- the rival on Route 119 ----------------
  // Their team keeps growing: a Pelipper or Lombre, a Numel, the starter at Lv. 31.
  const RIVAL_TEAM = {
    252: [['pelipper', 29], ['numel', 29], ['grovyle', 31]],
    255: [['pelipper', 29], ['lombre', 29], ['combusken', 31]],
    258: [['lombre', 29], ['numel', 29], ['marshtomp', 31]]
  };
  async function rival(h) {
    const F = G.Field, S = F.save, who = F.getVar('rival3') || 'may';
    if (F.flag('rival3-119')) return;
    const me = G.World.player;
    h.emote(who, '!');
    if (me) { await h.walkTo(who, me.x, me.y - 1); h.face(who, 'down'); h.face('player', 'up'); }
    await h.say(T('{player}! I heard you chased Team Aqua out of the Weather Institute. Dad will be so impressed!'), RIVAL3);
    await h.say(T('I have been training hard since Route 110. This time I am going to win for real!'), RIVAL3);
    const out = await h.battle({ id: 'rival3-119', who, name: who === 'brendan' ? 'Brendan' : 'May', prize: 60, ai: 'basic',
      team: RIVAL_TEAM[S.rival3.starter] || RIVAL_TEAM[255] }, { canLose: true });
    F.setFlag('rival3-119');
    if (out === 'win') await h.say(T('Still not enough... You and your Pokémon really are a team.'), RIVAL3);
    else await h.say(T('I won! I knew all that training would pay off!'), RIVAL3);
    await h.say(T('Fortree City is just up ahead. Its Gym Leader, Winona, flies like the wind. Good luck!'), RIVAL3);
    h.hide(who);
  }

  // ---------------- the Weather Institute: Shelly, Castform ----------------
  async function shellyLeaves(h) {
    const F = G.Field;
    await h.say(T('Team Aqua does not need this place any more. We know how to call the rain now... Let\'s go!'), SHELLY);
    for (const id of ['shelly', 'grunt3']) h.hide(id);
    F.setFlag('institute-saved');
    h.face('chief', 'player');
    await h.say(T('Thank you! They wanted our research on rain and storms... I dread to think what they mean to do with it.'), CHIEF);
    await h.say(T('Please, take this Pokémon as thanks. It is Castform: its form changes with the weather!'), CHIEF);
  }

  // ---------------- Route 120: Steven and the Devon Scope ----------------
  async function steven(h) {
    const F = G.Field;
    h.face('steven', 'player');
    await h.say(T('{player}! Good timing. Something I cannot see is blocking this bridge. Watch...'), STEVEN);
    await h.say(T('Steven held up the Devon Scope. An invisible Pokémon appeared on the bridge!'));
    const out = await h.wild('kecleon', 30);
    if (out === 'lose') return;
    F.setFlag('steven-kecleon');
    await h.say(T('That was a Kecleon. It changes the colour of its body to blend into whatever is around it.'), STEVEN);
    await h.say(T('This Devon Scope was made by my father\'s company. I have a feeling you will need it more than I do. Take it.'), STEVEN);
  }
  async function stevenLeaves(h) {
    await h.say(T('Use it on anything that blocks your way but cannot be seen. Until next time, {player}!'), STEVEN);
    await h.walkTo('steven', 21, 10);
    h.hide('steven');
  }

  // ---------------- Fortree: the Kecleon at the Gym ----------------
  async function unseen(h) {
    const F = G.Field;
    if (!F.count('devon-scope')) { await h.say(T('Something you cannot see is standing in the doorway. You cannot get past it.')); return; }
    await h.say(T('{player} used the Devon Scope! A Kecleon was hiding in the doorway!'));
    const out = await h.wild('kecleon', 30);
    if (out === 'lose') return;
    F.setFlag('kecleon-gone');
    await h.say(T('The way into the Gym is clear now.'));
  }

  G.Script.def({
    'route119.rival': [['js', rival]],
    'institute.scientist': [
      ['if', 'institute-saved', [
        ['say', 'Thank you for saving the institute! We can get back to our forecasts now.']
      ], [
        ['say', 'Team Aqua burst in and took over! They want our research on rain and storms... The chief is upstairs!']
      ]]
    ],
    'institute.chief': [
      ['if', 'got-castform', [
        ['say', 'Castform changes its form with the weather: sunshine, rain or hail. It is a weather forecast with a face!', CHIEF]
      ], [['if', 'institute-saved', [
        ['say', 'Please, take this Pokémon as thanks. It is Castform: its form changes with the weather!', CHIEF],
        ['giveMon', 'castform', 25], ['setFlag', 'got-castform']
      ], [
        ['say', 'Help! That woman says Team Aqua will use our research to bring endless rain!', CHIEF]
      ]]]]
    ],
    'institute.shelly-win': [['js', shellyLeaves], ['giveMon', 'castform', 25], ['setFlag', 'got-castform']],
    'route120.steven': [
      ['if', '!steven-kecleon', [['js', steven]]],
      ['if', ['steven-kecleon', '!got-devon-scope'], [
        ['giveItem', 'devon-scope', 1],
        ['setFlag', 'got-devon-scope'],
        ['js', stevenLeaves]
      ]]
    ],
    'fortree.unseen': [['js', unseen]],
    'fortree.gym-guide': [
      ['say', 'Yo, Champion! Winona uses Flying-type Pokémon. Electric, Ice and Rock moves will bring them back down to earth!'],
      ['say', 'Careful with her Altaria: it is part Dragon, and it knows Earthquake!']
    ],
    'fortree.winona-win': [
      ['say', 'Please take the Feather Badge. You earned it in the most beautiful battle I have had in a long time.', WINONA],
      ['badge', 22],
      ['jingle', 'badge'],
      ['say', '{player} received the Feather Badge from Winona!'],
      ['say', 'With six Hoenn badges, Pokémon up to level 60 will obey you, wherever they come from.', WINONA],
      ['say', 'And this is TM40, Aerial Ace. It strikes so fast that it never misses.', WINONA],
      ['giveItem', 'tm40', 1],
      // The end of the thirty-fourth chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(34) : G.Field.setFlag('chapter-34-done'))]
    ]
  });
  G.Hoenn.RIVAL_TEAM_119 = RIVAL_TEAM;
})();
