/* ============ lakes.js — the meeting in Canalave, Lake Valor and the end of Lake Verity ============
 * Chapter 52, the end of the chapter. With the Mine Badge, Dawn (Lucas for a girl) waits by the Gym, and Professor
 * Rowan tells the story of the three lakes in the Canalave library until an explosion cuts him short (flag lake-blast):
 * Barry goes to Lake Acuity, the assistant to Lake Verity, you to Lake Valor. The guard leaves Valor Lakefront
 * (lakefront.js): the lake is drained, Magikarp flop on its bed, three grunts stand there, the last before the
 * cavern (flag valor-gate). Commander Saturn waits inside, Azelf already taken (flag saturn-valor). At Lake Verity
 * (twinleaf.js) two grunts and Commander Mars (flag mars-verity); Mesprit is taken all the same, then `ending(52)`.
 * Platinum's Trainers and wild Pokémon.
 * Chapter 75: once the Distortion World is over (flag distortion-done) Lake Valor is full again, as in Platinum (map
 * `changes`, maps.js): water where the bed was, a little beach before the cavern (Surf there), the Magikarp and the grunts
 * gone, a fisherman and a hotel guest, TM25 on the beach and an HP Up hidden in the grass (Platinum's Dowsing Machine).
 * PokeAPI's table gives Surf and the rods. The first time you come in (flag valor-full) you are told; once chapter 74 is
 * done, coming in ends the chapter (`ending(75)`), so a player who saw it in the middle of the game gets it later.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const ROWAN = { name: 'Professor Rowan' };
  const BARRY = { name: 'Barry' };
  const SATURN = { name: 'Saturn' };
  const MARS = { name: 'Mars' };
  const GRUNT = { name: 'Team Galactic Grunt' };
  const assistant = () => ({ name: G.Field.save.player.gender === 'f' ? 'Lucas' : 'Dawn' });

  // ---------------- Lake Valor ----------------
  G.Maps.def(Object.assign({
    id: 'lake-valor', loc: 'lake-valor', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TT......................."""TT',
      'TT......................."""TT',
      'TT...:::::::::::::::::::."""TT',
      'TT...:::::::::::::::::::."""TT',
      'TT...::::::########:::::."""TT',
      'TT...::::::########:::::."""TT',
      'TT...::::::########:::::."""TT',
      'TT...::::::########:::::..S.TT',
      'TT...::::::###O####:::::,,,,,,',
      'TT...:::::::::::::::::::....TT',
      'TT"".:::::::::::::::::::."""TT',
      'TT"".:::::::::::::::::::."""TT',
      'TT"".:::::::::::::::::::."""TT',
      'TT"".:::::::::::::::::::."""TT',
      'TT"".:::::::::::::::::::."""TT',
      'TT"".:::::::::::::::::::."""TT',
      'TT""....................."""TT',
      'TT""....................."""TT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'valor-lakefront', offset: -2 } },
    warps: [{ x: 14, y: 10, to: 'valor-cavern', spot: 'door' }],
    spots: { cave: [14, 11, 'down'] },
    signs: { '26,9': 'Lake Valor. Its waters are said to be the home of a spirit of will.' },
    npcs: [
      { id: 'karp1', who: 'magikarp', mon: 'magikarp', x: 8, y: 7, dir: 'down', fixed: true, say: 'The Magikarp is flopping on the dry lake bed. It has nowhere to swim.' },
      { id: 'karp2', who: 'magikarp', mon: 'magikarp', x: 20, y: 14, dir: 'down', fixed: true, say: 'The Magikarp is flopping on the dry lake bed. It has nowhere to swim.' },
      { id: 'karp3', who: 'magikarp', mon: 'magikarp', x: 9, y: 15, dir: 'down', fixed: true, say: 'The Magikarp is flopping on the dry lake bed. It has nowhere to swim.' }
    ],
    trainers: [
      { id: 'grunt-valor1', who: 'galactic', cls: 'team-galactic', x: 21, y: 8, dir: 'down', sight: 3,
        team: [['golbat', 37, ['wing-attack', 'confuse-ray', 'air-cutter', 'mean-look']]],
        before: 'One Galactic Bomb, and the whole lake is gone. Impressive, right?',
        defeat: 'Hey! We are the ones who won here!',
        after: 'The Commander is in the cave. It is too late, anyway.' },
      { id: 'grunt-valor2', who: 'galactic', cls: 'team-galactic', x: 8, y: 11, dir: 'right', sight: 4,
        team: [['glameow', 35, ['fury-swipes', 'charm', 'assist', 'captivate']], ['murkrow', 35, ['night-shade', 'assurance', 'taunt', 'feint-attack']]],
        before: 'Those Magikarp will be fine. Probably. Who cares?',
        defeat: 'I care about that, at least.',
        after: 'The lake will fill up again. We got what we wanted.' },
      { id: 'grunt-valor3', who: 'galactic', cls: 'team-galactic', x: 14, y: 11, dir: 'down', sight: 2, if: '!valor-gate',
        team: [['croagunk', 33, ['revenge', 'swagger', 'mud-bomb', 'sucker-punch']], ['glameow', 33, ['fury-swipes', 'charm', 'assist', 'captivate']],
               ['stunky', 33, ['feint', 'slash', 'toxic', 'night-slash']], ['houndour', 33, ['bite', 'odor-sleuth', 'beat-up', 'fire-fang']]],
        before: 'Commander Saturn is busy. Nobody gets past me!',
        defeat: 'He is going to be so angry...',
        win: 'lakes.gate-win' }
    ],
    encounters: { walk: '@lake-valor-area' },
    // Full again after the Distortion World (chapter 75): the same size, the same warps and spots.
    changes: {
      if: 'distortion-done',
      rows: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TT......................."""TT',
        'TT......................."""TT',
        'TT...~~~~~~~~~~~~~~~~~~~."""TT',
        'TT...~~~~~~~~~~~~~~~~~~~."""TT',
        'TT...~~~~~~########~~~~~."""TT',
        'TT...~~~~~~########~~~~~."""TT',
        'TT...~~~~~~########~~~~~."""TT',
        'TT...~~~~~~########~~~~~..S.TT',
        'TT...~~~~~~###O####~~~~~,,,,,,',
        'TT...~~~~~~~~:::~~~~~~~~....TT',
        'TT"".~~~~~~~~~~~~~~~~~~~."""TT',
        'TT"".~~~~~~~~~~~~~~~~~~~."""TT',
        'TT"".~~~~~~~~~~~~~~~~~~~."""TT',
        'TT"".~~~~~~~~~~~~~~~~~~~."""TT',
        'TT"".~~~~~~~~~~~~~~~~~~~."""TT',
        'TT"".~~~~~~~~~~~~~~~~~~~."""TT',
        'TT""....................."""TT',
        'TT""....................."""TT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
      ],
      enter: 'lakes.valor-full',
      npcs: [
        { id: 'fisher', who: 'fisherman', x: 24, y: 14, dir: 'left',
          say: 'One morning the lake was simply full again, as if nothing had happened. The fish came back with the water.' },
        { id: 'guest', who: 'gentleman', x: 20, y: 3, dir: 'down',
          say: 'I walk over from the Hotel Grand Lake every morning. A lake without water was a sad thing to look at.' }
      ],
      trainers: [],
      items: [{ x: 13, y: 11, item: 'tm25', flag: 'valor-tm25' }, { x: 27, y: 18, item: 'hp-up', flag: 'valor-hp-up', hidden: true }]
    }
  }, SINNOH));

  /** Coming into Lake Valor full again (chapter 75): what you see the first time; once chapter 74 is done, the ending. */
  async function valorFull(h) {
    const F = G.Field;
    if (!F.flag('valor-full')) {
      F.setFlag('valor-full');
      await h.say(T('Lake Valor is full again! The water has come back, and the Pokémon of the lake with it.'));
      await h.say(T('Far out on the water a Magikarp leaps and splashes down. It has somewhere to swim again.'));
    }
    if (!F.flag('chapter-74-done') || F.flag('chapter-75-done')) return;
    await h.say(T('The lake shines in the sun, as if the Galactic Bomb had never fallen.'));
    // The end of the seventy-fifth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(75); else F.setFlag('chapter-75-done');
  }

  G.Maps.def(Object.assign({
    id: 'valor-cavern', loc: 'lake-valor', rows: [
      '################',
      '################',
      '################',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '###..........###',
      '#######O########',
      '################',
      '################'
    ],
    warps: [{ x: 7, y: 9, to: 'lake-valor', spot: 'cave' }],
    spots: { door: [7, 8, 'up'] },
    npcs: [{ id: 'azelf', who: 'azelf', mon: 'azelf', x: 7, y: 4, dir: 'down', fixed: true, if: ['sinnoh-champion', '!azelf-caught'], script: 'slegends.azelf' }],
    trainers: [
      { id: 'saturn', who: 'saturn', cls: 'galactic-commander-m', name: 'Saturn', x: 7, y: 4, dir: 'down', sight: 2, ai: 'leader', if: '!saturn-valor',
        team: [['golbat', 38, ['air-cutter', 'bite', 'toxic', 'supersonic']],
               ['bronzor', 38, ['gyro-ball', 'shadow-ball', 'rock-tomb', 'iron-defense']],
               ['toxicroak', 40, ['poison-jab', 'revenge', 'mud-bomb', 'feint-attack'], 'sitrus-berry']],
        before: 'So you found your way down here. I am Saturn, a Commander of Team Galactic. You are too late, but since you came all this way, let me show you what a Commander can do.',
        defeat: 'I see. The boss was right to take note of you.',
        win: 'lakes.saturn-win' }
    ]
  }, CAVE));

  /** The meeting in the library, cut short by the bomb at Lake Valor. */
  async function meeting(h) {
    const F = G.Field;
    if (F.flag('lake-blast')) return;
    await h.say(T('Ah, {player}. Good, you are here. Sit down and listen.'), ROWAN);
    await h.say(T('Sinnoh has three great lakes: Verity, Valor and Acuity. An old story says that a Pokémon sleeps in each of them.'), ROWAN);
    await h.say(T('They are said to have given people feeling, will and knowledge. And Team Galactic has been reading those same stories.'), ROWAN);
    await h.say(T('Then we stop them! Simple!'), BARRY);
    await h.fade('out', 0.1);
    await h.fade('in', 0.1);
    await h.fade('out', 0.1);
    await h.fade('in', 0.1);
    await h.say(T('A huge boom shook the library, and books fell from the shelves!'));
    await h.say(T('Professor! That came from the east. People are saying that something blew up at Lake Valor!'), assistant());
    await h.say(T('So it has begun. We must protect the lakes at once. Barry, you go to Lake Acuity. {assistant}, to Lake Verity.'), ROWAN);
    await h.say(T('{player}, Lake Valor is yours. It lies west of Valor Lakefront. Hurry!'), ROWAN);
    await h.say(T('Lake Acuity, got it! It is way up north, but I will be there before you know it!'), BARRY);
    await h.fade('out', 0.3);
    F.setFlag('lake-blast');
    await h.fade('in', 0.3);
  }

  /** Commander Mars beaten: Mesprit is gone all the same, and the chapter ends. */
  async function marsWin(h) {
    const F = G.Field;
    await h.say(T('You are strong, I will give you that. But I already have what I came for.'), MARS);
    await h.say(T('Mesprit is ours now, just like Azelf. Run along, and try to catch the boss if you dare!'), MARS);
    await h.fade('out', 0.4);
    F.setFlag('mars-verity');
    await h.fade('in', 0.4);
    await h.say(T('Team Galactic left Lake Verity, and took Mesprit with them.'));
    await h.say(T('They took it, and I could not stop them. I have to tell the Professor. Thank you for coming, {player}.'), assistant());
    await h.say(T('Barry went north to Lake Acuity, past Snowpoint City. I hope he is all right.'), assistant());
    // The end of the fifty-second chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(52); else F.setFlag('chapter-52-done');
  }

  G.Script.def({
    'lakes.meeting': [['js', meeting]],
    'lakes.valor-full': [['js', valorFull]],
    'lakes.to-library': [['js', h => h.say(T('There you are, {player}! Professor Rowan is in the library with Barry. He wants to see you right away!'), assistant())]],
    'lakes.gate-win': [
      ['say', 'Go on, then. It will not change anything!', GRUNT],
      ['fade', 'out', 0.3], ['setFlag', 'valor-gate'], ['fade', 'in', 0.3]
    ],
    'lakes.saturn-win': [
      ['say', 'It makes no difference. Azelf is already ours, and Mars has gone to Lake Verity for the next one.', SATURN],
      ['say', 'You might want to hurry. Not that it will help.', SATURN],
      ['fade', 'out', 0.4], ['setFlag', 'saturn-valor'], ['fade', 'in', 0.4],
      ['say', 'Saturn left the cavern.']
    ],
    'verity.mars-win': [['js', marsWin]]
  });
})();
