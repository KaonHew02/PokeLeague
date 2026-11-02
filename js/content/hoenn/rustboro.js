/* ============ rustboro.js — Rustboro City and Roxanne's Gym ============
 * Chapter 29, the end of the chapter. Rustboro City, north of Route 104: Roxanne's Gym (Rock types;
 * two Trainers and the Leader: Geodude, Geodude, Nosepass), the Devon Corporation (closed to
 * visitors for now), the Trainers' School (the teacher gives a Quick Claw), a Pokémon Center, a Mart
 * and a house. The roads east (Route 116) and north (Route 115) open in later chapters. Beating
 * Roxanne gives the Stone Badge (badge 17: Pokémon up to Lv. 25 obey in Hoenn) and TM39 (Rock
 * Tomb), then `ending(29)`.
 */
(() => {
  const T = s => G.T(s);
  const ROXANNE = { name: 'Roxanne' };
  const HOENN = { region: 'hoenn' };

  G.Maps.def(Object.assign({
    id: 'rustboro', loc: 'rustboro-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..................................T',
      'T.......................YYYYYYYY...T',
      'T...GGGGGG..............YYYYYYYY...T',
      'T...GGGGGG..............YYYYYYYY...T',
      'T...GGGGGG..............YYYYYYYY...T',
      'T...GGGGGG..............YYYYYYYY...T',
      'T...GGDGGG..............YYYDYYYY...T',
      'T.....,.S..................,..S....T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T...........S.,,,,...............S.T',
      'T.............,,,,.................T',
      'T...BBBBBB....,,,,..CCCCC..........T',
      'T...BBBBBB....,,,,..CCCCC..MMMM....T',
      'T...BBBBBB....,,,,..CCCCC..MMMM....T',
      'T...BBDBBB....,,,,..CCDCC..MDMM....T',
      'T.....,.......,,,,....,.....,......T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T.............,,,,.................T',
      'T.............,,,,.................T',
      'T..TTTTTTTT...,,,,.......HHHH......T',
      'T..TTTTTTTT...,,,,.......HHHH......T',
      'T..TTTTTTTT...,,,,.......HDHH......T',
      'T..TTTTTTTT...,,,,........,........T',
      'T..TTTTTTTT...,,,,..ffff...........T',
      'T..TTTTTTTT...,,,,..ffff...........T',
      'T.............,,,,..ffff...........T',
      'T.............,,,,.................T',
      'TTTTTTTTTTTTTT,,,,TTTTTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route104n', offset: 2 } },
    warps: [
      { x: 6, y: 7, to: 'rustboro-gym', spot: 'door' },
      { x: 27, y: 7, locked: 'rustboro.devon-closed' },
      { x: 6, y: 16, to: 'trainer-school', spot: 'door' },
      { x: 22, y: 16, to: 'rustboro-center', spot: 'door' },
      { x: 28, y: 16, to: 'rustboro-mart', spot: 'door' },
      { x: 26, y: 23, to: 'rustboro-house', spot: 'door' }
    ],
    spots: { 'gym-door': [6, 8, 'down'], 'devon-door': [27, 8, 'down'], 'school-door': [6, 17, 'down'], 'center-door': [22, 17, 'down'],
             'mart-door': [28, 17, 'down'], 'house-door': [26, 24, 'down'] },
    signs: {
      '12,11': 'Rustboro City. A city of stone, where nature and science go hand in hand.',
      '8,8': 'Rustboro City Pokémon Gym. Leader: Roxanne, the top student who loves rocks.',
      '30,8': 'Devon Corporation. From Poké Balls to the newest gadgets: technology for Trainers.',
      '33,11': 'East: Route 116. North: Route 115. Both roads are closed for now.'
    },
    npcs: [
      { id: 'man', who: 'gentleman', x: 18, y: 20, move: 'look',
        say: 'The Devon Corporation is the pride of Rustboro. Half the Poké Balls in Hoenn are made in that building!' },
      { id: 'girl', who: 'lass', x: 12, y: 22, move: 'wander', r: 2,
        say: 'Roxanne is the best student the Trainers\' School ever had. Now she teaches there when she is not at the Gym!' },
      { id: 'worker', who: 'engineer', x: 31, y: 11, move: 'look',
        say: 'They are digging a tunnel east of town, out on Route 116. Nobody gets through until it is safe.' }
    ]
  }, HOENN));

  G.Maps.center('rustboro-center', {
    loc: 'rustboro-city', exit: { map: 'rustboro', spot: 'center-door' },
    npcs: [{ id: 'boy', who: 'youngster', x: 3, y: 5, move: 'look',
             say: 'Roxanne\'s Rock types shrug off Normal and Fire moves. Water and Grass wash them away!' }]
  }).region = 'hoenn';

  G.Maps.mart('rustboro-mart', {
    loc: 'rustboro-city', exit: { map: 'rustboro', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'escape-rope', 'repel', 'x-speed', 'x-defense'],
    npcs: [{ id: 'shopper', who: 'gentleman', x: 6, y: 5, move: 'look',
             say: 'Great Balls catch Pokémon more easily than Poké Balls. They make them right here in Rustboro!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'rustboro-house', loc: 'rustboro-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'rustboro', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'scientist', x: 7, y: 4, dir: 'left',
             say: 'I work at Devon. Someone tried to steal our research papers in Petalburg Woods! Thank goodness a Trainer stepped in.' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'trainer-school', loc: 'rustboro-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'qq_____bbbbbb', '_____________', '_ttt___ttt___', '_____________', '_ttt___ttt___', '_____________',
           '______X______'],
    warps: [{ x: 6, y: 8, to: 'rustboro', spot: 'school-door' }],
    spots: { door: [6, 8, 'up'] },
    signs: { '0,2': 'The blackboard says: "A sleeping or frozen Pokémon cannot move. A paralyzed one is slower, and may not move."',
             '1,2': 'The blackboard says: "A sleeping or frozen Pokémon cannot move. A paralyzed one is slower, and may not move."' },
    npcs: [
      { id: 'teacher', who: 'lass', x: 5, y: 3, dir: 'down', script: 'rustboro.teacher' },
      { id: 'kid1', who: 'youngster', x: 2, y: 5, dir: 'up',
        say: 'Today we learned about type matchups. Water beats Fire, Fire beats Grass, Grass beats Water. Easy!' },
      { id: 'kid2', who: 'lass', x: 8, y: 7, dir: 'up',
        say: 'Did you know some Pokémon have abilities that help in battle? Gyarados scares the Pokémon in front of it!' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'rustboro-gym', loc: 'rustboro-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'rustboro', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'rustboro.gym-guide' }],
    trainers: [
      { id: 'josh', who: 'youngster', cls: 'youngster', name: 'Josh', x: 3, y: 8, dir: 'right', sight: 3, team: [['geodude', 10]],
        before: 'You have to get past me before you see Roxanne. My Geodude is solid as a rock!',
        defeat: 'Crumbled...',
        after: 'Roxanne studied everything about Rock types. She is really smart.' },
      { id: 'marc', who: 'hiker', cls: 'hiker', name: 'Marc', x: 9, y: 5, dir: 'left', sight: 3, team: [['geodude', 9], ['geodude', 9]],
        before: 'Rocks and mountains! That is what I love. Let me show you why!',
        defeat: 'Even a mountain can fall...',
        after: 'Roxanne is up ahead. Her Nosepass always points north, did you know?' },
      { id: 'roxanne', who: 'roxanne', cls: 'leader', name: 'Roxanne', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { potion: 2 },
        team: [['geodude', 12, ['tackle', 'defense-curl', 'rock-throw', 'rock-tomb']],
               ['geodude', 12, ['tackle', 'defense-curl', 'rock-throw', 'rock-tomb']],
               ['nosepass', 15, ['tackle', 'harden', 'rock-throw', 'block']]],
        before: 'Hello, I am Roxanne, the Leader of the Rustboro Gym. I became a Leader to put what I learned at school into practice. A Champion from Kanto? Then let me learn from you, too!',
        defeat: 'So... I lost. It seems I still have a great deal to learn.',
        win: 'rustboro.roxanne-win',
        afterScript: [['say', 'There are seven more Gyms in Hoenn. Each one will teach you something new, I am sure of it.', ROXANNE]] }
    ]
  }, HOENN));

  G.Script.def({
    'rustboro.devon-closed': [['say', 'Devon Corporation. The doors are locked: visitors by appointment only.']],
    'rustboro.gym-guide': [
      ['say', 'Hey, Champion! Welcome to Hoenn\'s first Gym. Roxanne uses Rock-type Pokémon.'],
      ['say', 'Water and Grass moves work great on them. Fire, Normal and Flying moves barely scratch them.'],
      ['say', "Picked Torchic? Train it until it evolves: Combusken's Fighting moves crack rocks. A Shroomish from Petalburg Woods helps, too."],
      ['say', 'And remember: above level 20, your Pokémon from home may not listen to you yet!']
    ],
    'rustboro.teacher': [
      ['if', 'got-school-claw', [
        ['say', 'A Quick Claw sometimes lets its holder move first. Let a slow Pokémon hold it!']
      ], [
        ['say', 'Welcome to the Trainers\' School! Here, everyone learns the basics of battling. Even a Champion can review them!'],
        ['say', 'Please take this. Our best students get one.'],
        ['giveItem', 'quick-claw', 1],
        ['setFlag', 'got-school-claw']
      ]]
    ],
    'rustboro.roxanne-win': [
      ['say', 'This is the Stone Badge. You have earned it.', ROXANNE],
      ['badge', 17],
      ['jingle', 'badge'],
      ['say', '{player} received the Stone Badge from Roxanne!'],
      ['say', 'With it, Pokémon up to level 25 will obey you here in Hoenn, even ones raised far away.', ROXANNE],
      ['say', 'And please take this, too. TM39 is Rock Tomb: it drops boulders on the foe and slows it down.', ROXANNE],
      ['giveItem', 'tm39', 1],
      // The end of the twenty-ninth chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(29) : G.Field.setFlag('chapter-29-done'))]
    ]
  });
})();
