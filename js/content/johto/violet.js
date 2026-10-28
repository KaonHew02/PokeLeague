/* ============ violet.js — Violet City, Sprout Tower, Falkner ============
 * Chapter 11, the end of the chapter. Violet City: Center, Mart, the Pokémon Academy, and Sprout
 * Tower, three floors of Sages around a swaying pillar (wild Pokémon on every step of 2F and 3F);
 * Elder Li at the top gives TM27 Return (stronger the more a Pokémon trusts you). Falkner's Gym:
 * two Bird Keepers, then Falkner (Pidgey 7, Pidgeotto 11): badge 9, the Zephyr Badge (the first
 * of Johto: Pokémon up to Lv. 25 obey you now), TM40 Aerial Ace. The road south leads to Route 32
 * (chapter 12, route32.js); the one west is still blocked.
 */
G.Maps.def({
  id: 'violet', loc: 'violet-city', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T..................................T',
    'T...............KKKKK..............T',
    'T...............KKKKK..............T',
    'T...............KKKKK..............T',
    'T...............KKKKK..............T',
    'T...............KKDKK..............T',
    'T...GGGGGG........,................T',
    'T...GGGGGGHHHH....,.....CCCCC......T',
    'T...GGGGGGHHHH....,.....CCCCC.MMMM.T',
    'T...GGGGGGHDHH....,.....CCCCC.MMMM.T',
    'T...GGDGGG.,......,.....CCDCC.MDMM.T',
    'T.....,.S..,......,..S....,....,...T',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.....................,,...........T',
    'T.....................,,...........T',
    'T..ff.................,,...........T',
    'T.........~~~~~~~~~~~.,,ff.........T',
    'T.........~~~~~~~~~~~.,,ff.........T',
    'T.........~~~~~~~~~~~.,,...........T',
    'T.........~~~~~~~~~~~.,,...........T',
    'T.TTTTT...~~~~~~~~~~~.,,.....ff....T',
    'T.TTTTT...~~~~~~~~~~~.,,...........T',
    'T.TTTTT...............,,...TTTTTTT.T',
    'T.TTTTT...............,,...TTTTTTT.T',
    'T.....................,,...........T',
    'TTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route31', offset: 7 }, south: { map: 'route32', offset: 12 } },
  warps: [
    { x: 18, y: 6, to: 'sprout-1f', spot: 'door' },
    { x: 6, y: 11, to: 'violet-gym', spot: 'door' },
    { x: 11, y: 10, to: 'violet-academy', spot: 'door' },
    { x: 26, y: 11, to: 'violet-center', spot: 'door' },
    { x: 31, y: 11, to: 'violet-mart', spot: 'door' }
  ],
  spots: { 'tower-door': [18, 7, 'down'], 'gym-door': [6, 12, 'down'], 'academy-door': [11, 11, 'down'],
           'center-door': [26, 12, 'down'], 'mart-door': [31, 12, 'down'] },
  signs: {
    '21,12': 'Violet City. An old town of quiet scents, with Sprout Tower at its heart.',
    '8,12': 'Violet City Pokémon Gym. Leader: Falkner, who soars with Flying-type Pokémon!'
  },
  npcs: [
    { id: 'oldman', who: 'oldman', x: 20, y: 9, move: 'look',
      say: 'Sprout Tower was built around a great swaying pillar. It is said to come from a Bellsprout a hundred feet tall!' },
    { id: 'kid', who: 'youngster', x: 14, y: 16, move: 'wander', r: 2,
      say: 'Falkner uses bird Pokémon. Electric and Rock moves hit them hard. Do you have any?' },
    { id: 'lass', who: 'lass', x: 29, y: 16, move: 'look',
      say: 'A strange tree blocks the road west of the city. It wiggles when nobody is looking! South of here, Route 32 leads to Union Cave.' }
  ],
  encounters: { water: '@violet-city-area' }
});

G.Maps.center('violet-center', {
  loc: 'violet-city', exit: { map: 'violet', spot: 'center-door' },
  npcs: [{ id: 'trainer', who: 'cooltrainer', x: 9, y: 5, move: 'look',
           say: 'My strong Pokémon from Kanto just would not listen in Falkner\'s Gym. I had to win with the ones I raised here!' }]
}).region = 'johto';

G.Maps.mart('violet-mart', {
  loc: 'violet-city', exit: { map: 'violet', spot: 'mart-door' },
  stock: ['poke-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'escape-rope', 'repel'],
  npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
           say: 'A Super Potion heals twice as much as a Potion. Worth every coin!' }]
}).region = 'johto';

G.Maps.def({
  id: 'violet-academy', loc: 'violet-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', '__bbbbb____', '___________', '__t_t_t____', '___________', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'violet', spot: 'academy-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: Object.assign({}, ...[2, 3, 4, 5, 6].map(x => ({ [x + ',2']: 'The blackboard reads: Flying beats Grass, Bug and Fighting. Electric, Ice and Rock beat Flying.' }))),
  npcs: [
    { id: 'earl', who: 'gentleman', x: 8, y: 3, dir: 'left',
      say: 'Welcome to the Pokémon Academy! Lesson one: a Pokémon that trusts you fights harder. Lesson two: walk with your Pokémon!' },
    { id: 'student', who: 'youngster', x: 4, y: 5, dir: 'up',
      say: 'I am learning about the time of day. Some Pokémon only come out at night, and Eevee evolves differently by day and by night!' }
  ]
});

const SPROUT = { loc: 'sprout-tower', region: 'johto', tileset: 'indoor', palette: 'dojo', music: 'cave', battleBg: 'indoor' };

G.Maps.def(Object.assign({
  id: 'sprout-1f',
  rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', '+++++++++++^+', '+++++++++++++', '++++++j++++++', '++++++j++++++',
         '++++++j++++++', '++++++j++++++', '+++++++++++++', '+++++++++++++', 'p+++++++++++p', '++++++X++++++'],
  warps: [{ x: 6, y: 11, to: 'violet', spot: 'tower-door' }, { x: 11, y: 2, to: 'sprout-2f', spot: 'down' }],
  spots: { door: [6, 11, 'up'], up: [11, 2, 'down'] },
  signs: { '6,4': 'The great pillar sways gently, but it never falls. They say it is the trunk of a giant Bellsprout.' },
  npcs: [{ id: 'sage', who: 'sage', x: 3, y: 5, move: 'look',
           say: 'Sprout Tower is a place of training. The Sages upstairs battle with Bellsprout, as flexible as the pillar itself.' }]
}, SPROUT));

G.Maps.def(Object.assign({
  id: 'sprout-2f', cave: true,
  rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', '+^+++++++++^+', '+++++++++++++', '++++++j++++++', '++++++j++++++',
         '++++++j++++++', '++++++j++++++', '+++++++++++++', '+++++++++++++', '+++++++++++++', '+++++++++++++'],
  warps: [{ x: 11, y: 2, to: 'sprout-1f', spot: 'up' }, { x: 1, y: 2, to: 'sprout-3f', spot: 'down' }],
  spots: { down: [11, 2, 'down'], up: [1, 2, 'down'] },
  trainers: [
    { id: 'edmond', who: 'sage', cls: 'sage', name: 'Edmond', x: 3, y: 6, dir: 'right', sight: 2,
      team: [['bellsprout', 3], ['bellsprout', 3], ['bellsprout', 3]],
      before: 'The pillar sways, and so do my Bellsprout. Can you keep your balance?',
      defeat: 'I lost my balance...',
      after: 'Bend like the pillar, and nothing will break you.' },
    { id: 'jin', who: 'sage', cls: 'sage', name: 'Jin', x: 9, y: 8, dir: 'up', sight: 3,
      team: [['bellsprout', 6]],
      before: 'One Bellsprout, trained for many years. Let us battle!',
      defeat: 'Many years, and still not enough.',
      after: 'The Elder is at the top. He tests every Trainer who climbs this tower.' }
  ],
  items: [{ x: 11, y: 10, item: 'x-accuracy', flag: 'sprout-2f-item' }],
  encounters: { walk: '@sprout-tower-2f' }
}, SPROUT));

G.Maps.def(Object.assign({
  id: 'sprout-3f', cave: true,
  rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', '+^+++++++++++', '+++++++++++++', '+++++++++++++', '++++++j++++++',
         '++++++j++++++', '+++++++++++++', '+++++++++++++', '+++++++++++++', '+++++++++++++', '+++++++++++++'],
  warps: [{ x: 1, y: 2, to: 'sprout-2f', spot: 'up' }],
  spots: { down: [1, 2, 'down'] },
  trainers: [
    { id: 'troy', who: 'sage', cls: 'sage', name: 'Troy', x: 3, y: 8, dir: 'right', sight: 2,
      team: [['bellsprout', 7], ['hoothoot', 7]],
      before: 'Few reach the third floor. Show me why you did!',
      defeat: 'Now I see why.',
      after: 'The Elder is waiting. Go, and be humble.' },
    { id: 'neal', who: 'sage', cls: 'sage', name: 'Neal', x: 10, y: 6, dir: 'left', sight: 2,
      team: [['bellsprout', 6]],
      before: 'My Bellsprout and I have trained here since dawn!',
      defeat: 'And we will train here until dusk.',
      after: 'Hoothoot only stay awake at night. The Elder raised his own at midnight.' },
    { id: 'li', who: 'sage', cls: 'sage', name: 'Li', x: 6, y: 3, dir: 'down', sight: 0, ai: 'leader',
      team: [['bellsprout', 7], ['bellsprout', 7], ['hoothoot', 10]],
      before: 'I am Li, the Elder of this tower. The Champion of Kanto, here? Then show me the bond you share with your Pokémon.',
      defeat: 'Ah... your Pokémon trust you. That is the true strength.',
      win: 'sprout.li-win',
      afterScript: [['say', 'Falkner of the Violet Gym trained here too. Go and see him. He is waiting for a worthy challenger.', { name: 'Elder Li' }]] }
  ],
  items: [{ x: 11, y: 10, item: 'escape-rope', flag: 'sprout-3f-item' }],
  encounters: { walk: '@sprout-tower-3f' }
}, SPROUT));

G.Maps.def({
  id: 'violet-gym', loc: 'violet-city', region: 'johto', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
  rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
         '+++++++++++++', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '+++++++++++++',
         '+++++++++++++', '++++++X++++++'],
  warps: [{ x: 6, y: 13, to: 'violet', spot: 'gym-door' }],
  spots: { door: [6, 13, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 8, y: 12, dir: 'left', script: 'violet.gym-guide' }],
  trainers: [
    { id: 'rod', who: 'birdkeeper', cls: 'bird-keeper', name: 'Rod', x: 3, y: 9, dir: 'right', sight: 3,
      team: [['pidgey', 7], ['pidgey', 7]],
      before: 'Wings need guts! We train from dawn to dusk to master bird Pokémon. Here I come!',
      defeat: 'Aaaargh!',
      after: 'Falkner is not just strong. He is a true master of bird Pokémon.' },
    { id: 'abe', who: 'birdkeeper', cls: 'bird-keeper', name: 'Abe', x: 9, y: 6, dir: 'left', sight: 3,
      team: [['spearow', 9]],
      before: 'You want to face Falkner? Get past me first!',
      defeat: 'Beaten, just like that?',
      after: 'You have what it takes. Falkner is right ahead.' },
    { id: 'falkner', who: 'falkner', cls: 'leader', name: 'Falkner', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['pidgey', 7, ['tackle', 'mud-slap']], ['pidgeotto', 11, ['tackle', 'mud-slap', 'gust']]],
      before: 'I am Falkner, Leader of the Violet City Gym! Some say one jolt of electricity is enough to ground a bird. My father\'s birds and I will prove them wrong!',
      defeat: '...You win. My birds and I still have much to learn.',
      win: 'violet.falkner-win',
      afterScript: [['say', 'There are Gyms in cities and towns all over Johto. Keep going, and your strongest Pokémon will listen to you again.', { name: 'Falkner' }]] }
  ]
});

G.Script.def({
  'sprout.li-win': [
    ['say', 'You have passed my test. Take this. It grows stronger the more your Pokémon trusts you.', { name: 'Elder Li' }],
    ['giveItem', 'tm27', 1]
  ],
  'violet.gym-guide': [
    ['say', 'Yo, Champion of Kanto! Welcome to Johto\'s first Gym. Falkner uses Flying-type Pokémon.'],
    ['say', 'Electric, Ice and Rock moves will bring them down. And remember: here, Pokémon above level 20 might not listen until you win this badge.']
  ],
  'violet.falkner-win': [
    ['say', 'Here, take the Zephyr Badge. It is proof that you beat me.', { name: 'Falkner' }],
    ['badge', 9],
    ['jingle', 'badge'],
    ['say', '{player} received the Zephyr Badge from Falkner!'],
    ['say', 'With it, Pokémon up to level 25 will obey you, even ones raised far away.', { name: 'Falkner' }],
    ['say', 'And this: TM40, Aerial Ace. A move that never misses, like a bird diving on its prey.', { name: 'Falkner' }],
    ['giveItem', 'tm40', 1],
    // The end of the eleventh chapter (credits-ui.js).
    ['js', () => (G.CreditsUI ? G.CreditsUI.ending(11) : G.Field.setFlag('chapter-11-done'))]
  ]
});
