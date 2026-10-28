/* ============ ecruteak.js — Ecruteak City, the Burned Tower and Morty ============
 * Chapter 14, the end of the chapter. Ecruteak: a Pokémon Center, a Mart, the Dance Theater
 * (five Kimono Girls, each with an Eevee evolution; beat them all and the old man gives a Rare
 * Candy, flag kimono-gift), the elder's house (the legend of the two towers), a house, the Bell
 * Tower (closed) and the Burned Tower. Morty's Gym is empty: he went to the Burned Tower.
 * The Burned Tower 1F (`cave`): Morty, and the thief, who battles you (losing allowed, flag
 * burned-rival); a hole in the floor drops you to B1F, where three Pokémon sleep. They wake and
 * run off (Raikou, Entei, Suicune; flag beasts-awake), and Eusine, who chases Suicune, tells
 * you about them. Morty goes back to his Gym. The Gym: a dim path over darkness (tiles `abyss`:
 * step off it and you are back at the door, `fall`), two Sages, two Mediums, then Morty
 * (Gastly, Haunter, Haunter, Gengar): badge 12, the Fog Badge (Pokémon up to Lv. 40 obey),
 * TM30 Shadow Ball (flag morty-beaten), and the chapter ends (`ending(14)`).
 */
G.Maps.def({
  id: 'ecruteak', loc: 'ecruteak-city', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTT........TTTTTTTT............KKKKK.TT',
    'TTTT........TTTTTTTT....GGGGGG..KKKKK.TT',
    'TTTT.RRRRRR.TTTTTTTT....GGGGGG..KKKKK.TT',
    'TTTT.RRRRRR.TTTTTTTT....GGGGGG..KKKKK.TT',
    'TTTT.RRRRRR.............GGGGGG..KKDKK.TT',
    'TTTT.RRRRRR.............GGDGGG....,...TT',
    'TTTT.RRDRRR.........,,....,S......,S..TT',
    'TTTT...,S........ff.,,....,.......,...TT',
    'TTTT...,............,,....,..ff...,...TT',
    'TTTT...,............,,....,.......,...TT',
    'TTTT...,.....CCCCC..,,....,.......,...TT',
    'TT.....,.....CCCCC..,,..MMMM......,...TT',
    'TT.....,.....CCCCC..,,..MMMM......,...TT',
    'TT..ff.,.....CCDCC..,,..MDMM......,...TT',
    'TT.....,.......,....,,...,,.......,...TT',
    'TT.....,.......,....,,...,,.......,...TT',
    'TT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TT',
    'TT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TT',
    'TT..................,,................TT',
    'TT..................,,.........TTTTTTTTT',
    'TT...BBBBBB..HHHH...,,....HHHH.TTTTTTTTT',
    'TT...BBBBBB..HHHH...,,....HHHH.TTTTTTTTT',
    'TT...BBBBBB..HDHH...,,....HDHH.TTTTTTTTT',
    'TT...BBDBBBS..,.....,,.....,...TTTTTTTTT',
    'TT...,,,,,,,,,,,,,,,,,,,,,,,,,,TTTTTTTTT',
    'TT..................,,.........TTTTTTTTT',
    'TT.........ff.......,,..ff.....TTTTTTTTT',
    'TT..................,,S........TTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'route37', offset: 10 } },
  warps: [
    { x: 7, y: 8, to: 'burned-tower-1f', spot: 'door' },
    { x: 26, y: 7, to: 'ecruteak-gym', spot: 'door', if: 'beasts-awake', locked: 'ecruteak.gym-closed' },
    { x: 34, y: 6, to: 'ecruteak', spot: 'bell-door', if: 'clear-bell', locked: 'ecruteak.bell-closed' },
    { x: 15, y: 15, to: 'ecruteak-center', spot: 'door' },
    { x: 25, y: 15, to: 'ecruteak-mart', spot: 'door' },
    { x: 7, y: 25, to: 'dance-theater', spot: 'door' },
    { x: 14, y: 24, to: 'elder-house', spot: 'door' },
    { x: 27, y: 24, to: 'ecruteak-house', spot: 'door' }
  ],
  spots: {
    'tower-door': [7, 9, 'down'], 'gym-door': [26, 8, 'down'], 'bell-door': [34, 7, 'down'], 'center-door': [15, 16, 'down'],
    'mart-door': [25, 16, 'down'], 'theater-door': [7, 26, 'down'], 'elder-door': [14, 25, 'down'], 'house-door': [27, 25, 'down']
  },
  signs: {
    '22,29': 'Ecruteak City. A city of history, where the past still lives.',
    '8,9': 'The Burned Tower. It burned down in a great fire long ago. Keep out: it is not safe.',
    '27,8': 'Ecruteak City Pokémon Gym. Leader: Morty, the mystic who sees what is yet to come.',
    '35,8': 'The Bell Tower. Only those the tower accepts may climb it.',
    '11,25': 'The Dance Theater. The Kimono Girls dance every day.'
  },
  npcs: [
    { id: 'sage', who: 'sage', x: 33, y: 8, dir: 'down',
      say: 'Long ago, a rainbow-coloured Pokémon perched on top of the Bell Tower. We still wait for it to come back.' },
    { id: 'kid', who: 'youngster', x: 18, y: 20, move: 'wander', r: 2,
      say: 'The Burned Tower was struck by lightning, and it burned for three days! My grandpa told me.' },
    { id: 'kimono', who: 'kimono', x: 10, y: 27, move: 'look',
      say: 'We Kimono Girls dance at the theater. Come and watch us, and maybe battle us too!' },
    { id: 'man', who: 'gentleman', x: 30, y: 17, move: 'look', if: '!beasts-awake',
      say: 'Morty, our Gym Leader, went to the Burned Tower. He says something sleeps beneath it.' },
    { id: 'man2', who: 'gentleman', x: 30, y: 17, move: 'look', if: 'beasts-awake',
      say: 'Three Pokémon ran out of the Burned Tower! They were gone before I could even blink.' }
  ]
});

G.Maps.center('ecruteak-center', {
  loc: 'ecruteak-city', exit: { map: 'ecruteak', spot: 'center-door' },
  npcs: [{ id: 'man', who: 'hiker', x: 9, y: 5, move: 'look',
           say: 'The road north of Ecruteak leads to Mahogany Town and the Lake of Rage. I heard there is a red Gyarados up there!' }]
}).region = 'johto';

G.Maps.mart('ecruteak-mart', {
  loc: 'ecruteak-city', exit: { map: 'ecruteak', spot: 'mart-door' },
  stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'revive', 'super-repel'],
  npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
           say: 'Ghost Pokémon put you to sleep and then eat your dreams. Bring Awakenings to Morty\'s Gym!' }]
}).region = 'johto';

const ECR_HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
G.Maps.def({
  id: 'elder-house', loc: 'ecruteak-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ECR_HOUSE, warps: [{ x: 4, y: 7, to: 'ecruteak', spot: 'elder-door' }], spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'elder', who: 'oldman', x: 7, y: 4, dir: 'left', script: 'ecruteak.elder' },
    { id: 'girl', who: 'lass', x: 2, y: 5, move: 'look',
      say: 'Grandpa tells that old story every night. I know it by heart!' }
  ]
});
G.Maps.def({
  id: 'ecruteak-house', loc: 'ecruteak-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ECR_HOUSE, warps: [{ x: 4, y: 7, to: 'ecruteak', spot: 'house-door' }], spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'woman', who: 'beauty', x: 7, y: 4, dir: 'left',
      say: 'My son wants to be a Kimono Girl. I told him they are all girls... He said he will just be the first boy!' },
    { id: 'boy', who: 'youngster', x: 2, y: 5, move: 'look',
      say: 'I can already dance as well as an Espeon. Look! ...Okay, maybe as well as a Slowpoke.' }
  ]
});

// ---------------- the Dance Theater ----------------
G.Maps.def({
  id: 'dance-theater', loc: 'ecruteak-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW', 'rrrrrrrrrrrrrrr', 'rrrrrrrrrrrrrrr', '_______________', '__ttt_____ttt__',
         '_______________', '__ttt_____ttt__', '_______________', 'p______X______p'],
  warps: [{ x: 7, y: 9, to: 'ecruteak', spot: 'theater-door' }],
  spots: { door: [7, 9, 'up'] },
  npcs: [
    { id: 'gentleman', who: 'gentleman', x: 12, y: 6, dir: 'left', script: 'theater.gentleman' },
    { id: 'fan', who: 'pokefan', x: 6, y: 6, move: 'look',
      say: 'The Kimono Girls dance with their Pokémon as if they were one. It gives me goosebumps every time!' }
  ],
  trainers: [
    { id: 'naoko', who: 'kimono', cls: 'kimono-girl', name: 'Naoko', x: 3, y: 2, dir: 'down', sight: 0,
      team: [['flareon', 20]],
      before: 'You want to battle on the stage? Then let us dance! Flareon, show them your flames.',
      defeat: 'Our dance burned out...',
      after: 'Flareon\'s fur is warm, like a little sun.' },
    { id: 'sayo', who: 'kimono', cls: 'kimono-girl', name: 'Sayo', x: 5, y: 2, dir: 'down', sight: 0,
      team: [['espeon', 20]],
      before: 'Espeon can sense your next move before you make it. Let us see!',
      defeat: 'It sensed it... and still lost.',
      after: 'Espeon evolves from an Eevee that loves its Trainer, in the daytime.' },
    { id: 'zuki', who: 'kimono', cls: 'kimono-girl', name: 'Zuki', x: 7, y: 2, dir: 'down', sight: 0,
      team: [['umbreon', 20]],
      before: 'Umbreon shines in the moonlight. Our dance is for the night!',
      defeat: 'The moon went behind a cloud...',
      after: 'Umbreon evolves from an Eevee that loves its Trainer, at night.' },
    { id: 'kuni', who: 'kimono', cls: 'kimono-girl', name: 'Kuni', x: 9, y: 2, dir: 'down', sight: 0,
      team: [['vaporeon', 20]],
      before: 'Vaporeon\'s dance flows like water. Can you keep up?',
      defeat: 'We were washed away...',
      after: 'A Water Stone turns Eevee into Vaporeon. Simple, but so beautiful.' },
    { id: 'miki', who: 'kimono', cls: 'kimono-girl', name: 'Miki', x: 11, y: 2, dir: 'down', sight: 0,
      team: [['jolteon', 20]],
      before: 'Jolteon dances fast as lightning. Ready for a shock?',
      defeat: 'Short-circuited...',
      after: 'Every one of us has a different Eevee evolution. Which one do you like best?' }
  ]
});

// ---------------- the Burned Tower ----------------
G.Maps.def({
  id: 'burned-tower-1f', loc: 'burned-tower', region: 'johto', tileset: 'indoor', palette: 'mansion', music: 'cave', battleBg: 'indoor', cave: true, escape: true,
  rows: [
    'WWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWW',
    '__c____cc_____c___',
    '__c___________c___',
    '______cccc________',
    '_c______________c_',
    '_c___cc____cc___c_',
    '_____cc____cc_____',
    '__________________',
    'ccc____________ccc',
    '_____________O____',
    '__cc______________',
    '__cc____ccc____c__',
    '_______________c__',
    '__________________',
    '________X_________'
  ],
  warps: [{ x: 8, y: 15, to: 'ecruteak', spot: 'tower-door' }, { x: 13, y: 10, to: 'burned-tower-b1f', spot: 'drop' }],
  spots: { door: [8, 15, 'up'], 'from-below': [14, 9, 'down'] },
  npcs: [
    { id: 'morty', who: 'morty', x: 11, y: 8, dir: 'down', if: '!beasts-awake', script: 'burned.morty' },
    { id: 'rival', who: 'silver', x: 8, y: 6, dir: 'down', if: 'scripted' }
  ],
  triggers: [{ x: 4, y: 11, w: 8, h: 2, if: '!burned-rival', script: 'burned.rival' }],
  items: [
    { x: 17, y: 2, item: 'full-heal', flag: 'burned-full-heal' },
    { x: 0, y: 13, item: 'x-speed', flag: 'burned-x-speed' }
  ],
  encounters: { walk: '@burned-tower-1f' }
});

G.Maps.def({
  id: 'burned-tower-b1f', loc: 'burned-tower', region: 'johto', tileset: 'indoor', palette: 'mansion', music: 'cave', battleBg: 'indoor', cave: true, escape: true,
  rows: [
    'WWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWW',
    '^_______________c_',
    '________________c_',
    '___c__________c___',
    '___c__________c___',
    '__________________',
    '____cc______cc____',
    '__________________',
    '_c______________c_',
    '_c______________c_',
    '______cc__cc______',
    '__________________',
    '__________________'
  ],
  warps: [{ x: 0, y: 2, to: 'burned-tower-1f', spot: 'from-below' }],
  spots: { drop: [9, 9, 'up'] },
  npcs: [
    { id: 'raikou', who: 'raikou', mon: 'raikou', x: 6, y: 5, dir: 'down', fixed: true, if: '!beasts-awake', say: 'A Pokémon is sleeping here.' },
    { id: 'entei', who: 'entei', mon: 'entei', x: 9, y: 4, dir: 'down', fixed: true, if: '!beasts-awake', say: 'A Pokémon is sleeping here.' },
    { id: 'suicune', who: 'suicune', mon: 'suicune', x: 12, y: 5, dir: 'down', fixed: true, if: '!beasts-awake', say: 'A Pokémon is sleeping here.' },
    { id: 'eusine', who: 'eusine', x: 9, y: 7, dir: 'down', if: 'beasts-awake', script: 'burned.eusine' }
  ],
  triggers: [{ x: 4, y: 6, w: 10, h: 3, if: '!beasts-awake', script: 'burned.beasts' }],
  items: [{ x: 17, y: 13, item: 'tm42', flag: 'burned-tm42' }],
  encounters: { walk: '@burned-tower-b1f' }
});

// ---------------- Morty's Gym ----------------
G.Maps.def({
  id: 'ecruteak-gym', loc: 'ecruteak-city', region: 'johto', tileset: 'indoor', palette: 'ghost', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    'aaaaaa+++aaaaaa',
    'aaaaaa+++aaaaaa',
    'aaaaaaa+aaaaaaa',
    'aa+++++++aaaaaa',
    'aa+aaaaaaaaaaaa',
    'a++aaaaa+++++aa',
    'aa++++a++aaa+aa',
    'aaaaa+aa+aaa+aa',
    'aaaaa++++aaa++a',
    'aaaaaaaaaaaa+aa',
    'aa+++++++++++aa',
    'aa+aaaaaaaaaaaa',
    'aa+++++++aaaaaa',
    'aaaaaa+++aaaaaa',
    'aaaaaa+++aaaaaa',
    'aaaaaaaXaaaaaaa'
  ],
  fall: { to: 'ecruteak-gym', spot: 'door' },
  warps: [{ x: 7, y: 17, to: 'ecruteak', spot: 'gym-door' }],
  spots: { door: [7, 17, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 8, y: 16, dir: 'left', script: 'ecruteak.gym-guide' }],
  trainers: [
    { id: 'ping', who: 'sage', cls: 'sage', name: 'Ping', x: 8, y: 14, dir: 'left', sight: 1,
      team: [['gastly', 16], ['gastly', 16], ['gastly', 18]],
      before: 'The path is there, even if you cannot see it. Can you feel it?',
      defeat: 'You felt it...',
      after: 'Keep to the path. One step off it, and you will be back at the door.' },
    { id: 'martha', who: 'channeler', cls: 'medium', name: 'Martha', x: 13, y: 10, dir: 'left', sight: 1,
      team: [['gastly', 18], ['haunter', 20]],
      before: 'The spirits whisper your name... and that you will lose!',
      defeat: 'The spirits lied to me...',
      after: 'Ghost Pokémon cannot be hit by Normal or Fighting moves. Remember that.' },
    { id: 'jeffrey', who: 'sage', cls: 'sage', name: 'Jeffrey', x: 7, y: 8, dir: 'right', sight: 1,
      team: [['haunter', 20]],
      before: 'In the dark, a Ghost Pokémon is at its strongest!',
      defeat: 'The light found me...',
      after: 'Morty trains here to see what others cannot. Like the path beneath your feet.' },
    { id: 'grace', who: 'channeler', cls: 'medium', name: 'Grace', x: 1, y: 7, dir: 'right', sight: 1,
      team: [['haunter', 19], ['haunter', 19]],
      before: 'Two Haunters, two curses! Are you scared yet?',
      defeat: 'I am the one who is scared now...',
      after: 'Dark moves and Ghost moves hit Ghost Pokémon hard.' },
    { id: 'morty', who: 'morty', cls: 'leader', name: 'Morty', x: 7, y: 2, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['gastly', 19, ['lick', 'spite', 'mean-look', 'curse']], ['haunter', 19, ['hypnosis', 'confuse-ray', 'curse', 'night-shade']],
             ['haunter', 21, ['spite', 'mean-look', 'confuse-ray', 'night-shade']], ['gengar', 23, ['hypnosis', 'shadow-ball', 'mean-look', 'dream-eater']]],
      before: 'So you made it across. Good. I am Morty. Here in Ecruteak, we have trained since long ago to see the legendary Pokémon, and I believe that day is near. Let me see if you have the strength for it!',
      defeat: 'I see... You are stronger than I thought.',
      win: 'ecruteak.morty-win',
      afterScript: [['say', 'The legendary Pokémon chose to run from us. But I believe one of them will appear before you, one day.', { name: 'Morty' }]] }
  ]
});

(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const RIVAL2 = { name: '{rival2}' }, MORTY = { name: 'Morty' }, EUSINE = { name: 'Eusine' };
  /** The thief's starter, one stage up (Bayleef, Quilava, Croconaw). */
  const evolved = sp => ({ 152: 153, 155: 156, 158: 159 })[sp] || 156;

  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('burned-rival');
    h.place('rival', me.x, Math.max(me.y - 3, 3), 'down');
    h.show('rival');
    await h.walkTo('rival', me.x, me.y - 1);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T('...You again. I came here because people said a legendary Pokémon sleeps under this tower.'), RIVAL2);
    await h.say(T('If I catch a legendary Pokémon, nobody will ever beat me. Not even you. Starting now!'), RIVAL2);
    await h.battle({ id: 'rival2-burned', who: 'silver', name: S.rival2.name || '???', prize: 40, ai: 'basic',
                     team: [['haunter', 20], ['magnemite', 18], ['zubat', 20], [evolved(S.rival2.starter), 22]] }, { canLose: true });
    await h.say(T('...Hmph. This tower is a waste of time. Nothing here but rubble and old stories.'), RIVAL2);
    await h.walkTo('rival', me.x, 15);
    h.hide('rival');
  }

  async function beasts(h) {
    const F = G.Field;
    await h.say(T('Three Pokémon are sleeping in the dust. As you come closer, they open their eyes...'));
    for (const id of ['raikou', 'entei', 'suicune']) {
      h.emote(id, '!');
      await h.wait(300);
    }
    for (const id of ['raikou', 'entei', 'suicune']) {
      h.hide(id);
      await h.say(T('{mon} jumped out through the broken floor and ran off!'), { vars: { mon: h.monName(id) } });
    }
    F.setFlag('beasts-awake');
    h.show('eusine');
    await h.say(T('Did you see that? Suicune! The one I have chased for ten years!'), EUSINE);
    await h.say(T('I am Eusine. Legends say a great Pokémon brought three Pokémon back to life here, after the fire: Raikou, Entei and Suicune.'), EUSINE);
    await h.say(T('Now they are awake and running all over Johto. I will find Suicune before anyone else does!'), EUSINE);
  }

  async function elder(h) {
    await h.say(T('Long ago, Ecruteak had two towers. In the east, the Bell Tower; in the west, the Brass Tower.'));
    await h.say(T('One night, lightning struck the Brass Tower. It burned for three days, until rain from the sky put the fire out.'));
    await h.say(T('Three Pokémon died in the fire. But a great rainbow Pokémon came down from the sky and brought them back to life.'));
    await h.say(T('That is the story. The burned tower has stood empty ever since... or so they say.'));
  }

  async function gentleman(h) {
    const F = G.Field;
    const all = ['naoko', 'sayo', 'zuki', 'kuni', 'miki'].every(id => F.isDone('dance-theater:' + id));
    if (F.flag('kimono-gift')) { await h.say(T('What a show! The Kimono Girls dance even better after a good battle.')); return; }
    if (!all) { await h.say(T('Battle all five Kimono Girls, young one, and I will give you something special.')); return; }
    await h.say(T('Bravo! You beat all five Kimono Girls. Such battles deserve a reward. Here!'));
    F.giveItem('rare-candy', 1);
    F.setFlag('kimono-gift');
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('rare-candy') } });
    await j;
  }

  G.Script.def({
    'burned.rival': [['js', rival]],
    'burned.beasts': [['js', beasts]],
    'burned.eusine': [
      ['say', 'Suicune runs like the north wind and purifies dirty water. I have to see it again!', { name: 'Eusine' }],
      ['say', 'If you meet it before me, tell me everything!', { name: 'Eusine' }]
    ],
    'burned.morty': [
      ['say', 'I am Morty, the Gym Leader of Ecruteak. They say three Pokémon sleep under this tower, waiting for the right Trainer.', { name: 'Morty' }],
      ['say', 'The floor is broken in places. Careful you do not fall through... or maybe that is exactly what you should do.', { name: 'Morty' }]
    ],
    'ecruteak.elder': [['js', elder]],
    'theater.gentleman': [['js', gentleman]],
    'ecruteak.gym-closed': [['say', 'The Gym is empty. A note on the door reads: "At the Burned Tower. Morty"']],
    'ecruteak.bell-closed': [['say', 'A Sage blocks the way: Only those the Bell Tower accepts may enter. Please go back.']],
    'ecruteak.gym-guide': [
      ['say', 'Yo, Champion! Morty uses Ghost types. Normal and Fighting moves pass right through them, but Dark and Ghost moves hit hard.'],
      ['say', 'The floor here is hard to see. Step off the path and you will be back at the door. Watch where the Trainers stand!'],
      ['say', 'With three Johto badges, Pokémon up to level 35 obey you. Win here, and it goes up to 40!']
    ],
    'ecruteak.morty-win': [
      ['say', 'You have earned this. The Fog Badge.', { name: 'Morty' }],
      ['badge', 12],
      ['jingle', 'badge'],
      ['say', '{player} received the Fog Badge from Morty!'],
      ['say', 'With the Fog Badge, Pokémon up to level 40 will listen to you.', { name: 'Morty' }],
      ['say', 'And take this: TM30, Shadow Ball. A ball of shadow that can lower the target\'s defence against special moves.', { name: 'Morty' }],
      ['giveItem', 'tm30', 1],
      ['setFlag', 'morty-beaten'],
      ['js', async () => { if (G.CreditsUI) await G.CreditsUI.ending(14); else G.Field.setFlag('chapter-14-done'); }]
    ]
  });
})();
