/* ============ belltower.js — the Bell Tower, Suicune and Ho-Oh ============
 * Chapter 21, after Johto's League. The elder gives Johto's Champion the Clear Bell (ecruteak.js,
 * flag clear-bell) and the Sage lets you into the Bell Tower. On 1F Eusine is waiting, and so is
 * Suicune (flag bell-scene): a wild battle, Lv. 40. Met (caught or beaten; running keeps it there,
 * as in Kanto), it sends Raikou and Entei back to the Burned Tower (flag beasts-return). When all
 * three have answered the bell (flags suicune-met, raikou-met, entei-met → beasts-answered) the
 * stairs open: 2F, 3F (two ways up: one to a closed corner of 4F, one on), 4F, with four Sages,
 * then the top, where Ho-Oh comes down (Lv. 45, flag ho-oh-met) and the chapter ends (`ending(21)`).
 * Chapter 22: Eusine then sends you to the elder in Ecruteak (the Silver Wing, johto/whirl.js).
 */
(() => {
  const T = s => G.T(s);
  const BELL = { loc: 'bell-tower', region: 'johto', tileset: 'indoor', palette: 'dojo', music: 'cave', battleBg: 'indoor' };
  const EUSINE = { name: 'Eusine' };

  G.Maps.def(Object.assign({
    id: 'bell-tower-1f',
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      'p______^_______p',
      '________________',
      '__j____rr____j__',
      '_______rr_______',
      '__j____rr____j__',
      '_______rr_______',
      '__j____rr____j__',
      '_______rr_______',
      '________________',
      '________________',
      'p______________p',
      '_______X________'
    ],
    warps: [
      { x: 7, y: 13, to: 'ecruteak', spot: 'bell-door' },
      { x: 7, y: 2, to: 'bell-tower-2f', spot: 'from-below', if: 'beasts-answered', locked: 'bell.stairs-closed' }
    ],
    spots: { door: [7, 13, 'up'], 'from-above': [7, 2, 'down'] },
    triggers: [{ x: 1, y: 10, w: 14, h: 2, if: '!bell-scene', script: 'bell.scene' }],
    npcs: [
      { id: 'suicune', who: 'suicune', mon: 'suicune', x: 7, y: 5, dir: 'down', fixed: true, if: '!suicune-met', script: 'bell.suicune' },
      { id: 'eusine', who: 'eusine', x: 4, y: 11, dir: 'right', script: 'bell.eusine' },
      { id: 'sage', who: 'sage', x: 10, y: 3, dir: 'down', if: '!beasts-answered',
        say: 'Three Pokémon were reborn in the fire of the Burned Tower. Until all three answer the bell, the stairs stay closed.' },
      { id: 'sage2', who: 'sage', x: 10, y: 3, dir: 'down', if: 'beasts-answered',
        say: 'All three have answered the bell. The stairs are open: climb, and the rainbow Pokémon will judge you at the top.' }
    ]
  }, BELL));

  G.Maps.def(Object.assign({
    id: 'bell-tower-2f', cave: true,
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      '^______j_______^',
      '_______j________',
      '_______j________',
      '_______j________',
      '__j____j____j___',
      '_______j________',
      '_______j________',
      '________________',
      '________________',
      '___j________j___',
      '________________',
      '________________'
    ],
    warps: [{ x: 0, y: 2, to: 'bell-tower-1f', spot: 'from-above' }, { x: 15, y: 2, to: 'bell-tower-3f', spot: 'from-below' }],
    spots: { 'from-below': [0, 2, 'down'], 'from-above': [15, 2, 'down'] },
    trainers: [
      { id: 'gaku', who: 'sage', cls: 'sage', name: 'Gaku', x: 11, y: 9, dir: 'left', sight: 3,
        team: [['hoothoot', 45], ['noctowl', 47]],
        before: 'The tower tests everyone who climbs it. I am the first test!',
        defeat: 'You may pass...',
        after: 'Every floor of this tower is built without a single nail. Our ancestors were wise.' }
    ],
    items: [{ x: 14, y: 13, item: 'full-restore', flag: 'bell-2f-fullrestore' }],
    encounters: { walk: '@bell-tower-2f' }
  }, BELL));

  G.Maps.def(Object.assign({
    id: 'bell-tower-3f', cave: true,
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      '^______^j______^',
      '________j_______',
      '________j_______',
      '_jjjjjjjjjjjjjj_',
      '________________',
      '________________',
      '____j_____j_____',
      '________________',
      '________________',
      '________________',
      '________________',
      '________________'
    ],
    warps: [
      { x: 15, y: 2, to: 'bell-tower-2f', spot: 'from-above' },
      { x: 0, y: 2, to: 'bell-tower-4f', spot: 'west' },
      { x: 7, y: 2, to: 'bell-tower-4f', spot: 'east' }
    ],
    spots: { 'from-below': [15, 2, 'down'], 'west-down': [0, 2, 'down'], 'east-down': [7, 2, 'down'] },
    trainers: [
      { id: 'masa', who: 'sage', cls: 'sage', name: 'Masa', x: 10, y: 10, dir: 'left', sight: 4,
        team: [['gastly', 45], ['haunter', 46], ['gengar', 48]],
        before: 'Spirits drift through this tower at night. Mine will drift through you!',
        defeat: 'My spirits have scattered...',
        after: 'Two stairs lead up from here. Only one of them takes you higher.' }
    ],
    items: [{ x: 13, y: 13, item: 'max-revive', flag: 'bell-3f-maxrevive' }],
    encounters: { walk: '@bell-tower-3f' }
  }, BELL));

  G.Maps.def(Object.assign({
    id: 'bell-tower-4f', cave: true,
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      '^____j__^jjjjj_^',
      '_____j___jjjjj__',
      '_____j___jjjjj__',
      '_____j___jjjjj__',
      '_____j___jjjjj__',
      '_____j___jjjjj__',
      '_____j___jjjjj__',
      '_____j___jjjjj__',
      '_____j___jjjjj__',
      '_____j__________',
      '_____j__________',
      '_____j__________'
    ],
    warps: [
      { x: 0, y: 2, to: 'bell-tower-3f', spot: 'west-down' },
      { x: 15, y: 2, to: 'bell-tower-3f', spot: 'east-down' },
      { x: 8, y: 2, to: 'bell-tower-roof', spot: 'from-below' }
    ],
    spots: { west: [0, 2, 'down'], east: [15, 2, 'down'], 'from-above': [8, 2, 'down'] },
    trainers: [
      { id: 'koji', who: 'sage', cls: 'sage', name: 'Koji', x: 14, y: 6, dir: 'down', sight: 4,
        team: [['bellsprout', 45], ['weepinbell', 46], ['victreebel', 48]],
        before: 'Bellsprout sway like the tower in the wind. Bend, but never break!',
        defeat: 'I bent... and broke.',
        after: 'The tower sways a little in strong winds. That is why it has never fallen.' },
      { id: 'sohei', who: 'sage', cls: 'sage', name: 'Sohei', x: 6, y: 6, dir: 'right', sight: 2,
        team: [['natu', 46], ['xatu', 48]],
        before: 'My Xatu sees the past and the future. In both, I see myself winning!',
        defeat: 'I saw it wrong...',
        after: 'The top is just above. Be still, and the rainbow Pokémon may come to you.' }
    ],
    items: [{ x: 2, y: 12, item: 'pp-max', flag: 'bell-4f-ppmax' }],
    encounters: { walk: '@bell-tower-4f' }
  }, BELL));

  G.Maps.def(Object.assign({
    id: 'bell-tower-roof', palette: 'champion',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWWWWWWWW',
      'j___________j',
      '_____rrr_____',
      '_____rrr_____',
      '_____rrr_____',
      '_____rrr_____',
      '_____rrr_____',
      '_____rrr_____',
      'j___________j',
      '______^______',
      '_____________'
    ],
    warps: [{ x: 6, y: 10, to: 'bell-tower-4f', spot: 'from-above' }],
    spots: { 'from-below': [6, 10, 'up'] },
    triggers: [{ x: 0, y: 6, w: 13, h: 2, if: '!ho-oh-met', script: 'bell.ho-oh' }],
    npcs: [{ id: 'ho-oh', who: 'ho-oh', mon: 'ho-oh', x: 6, y: 4, dir: 'down', fixed: true, if: ['bell-ho-oh', '!ho-oh-met'] }]
  }, BELL));

  /** All three Pokémon of the Burned Tower have answered the bell: the stairs open. */
  function answered() {
    const F = G.Field;
    if (['suicune-met', 'raikou-met', 'entei-met'].every(f => F.flag(f))) F.setFlag('beasts-answered');
  }

  async function suicune(h) {
    const F = G.Field;
    await h.say(T('Suicune stands before you, as calm as clear water.'));
    h.sfx('cry');
    await h.wild('suicune', 40, {});
    const r = F.lastBattle;
    if (r === 'run') { await h.say(T('Suicune is still there, waiting for you.')); return; }
    if (r === 'lose') return;
    F.setFlag('suicune-met');
    h.hide('suicune');
    F.setFlag('beasts-return');
    answered();
    await h.say(T('So Suicune chose you... I am a little jealous. But I saw it up close, and that is enough for me.'), EUSINE);
    await h.say(T('Listen! Roars from the west, from the Burned Tower. The bell has called Raikou and Entei back too!'), EUSINE);
  }

  async function scene(h) {
    const F = G.Field;
    F.setFlag('bell-scene');
    h.face('eusine', 'player'); h.face('player', 'eusine');
    await h.say(T('{player}! You have the Clear Bell too? Then look, over there!'), EUSINE);
    h.face('player', 'up');
    h.emote('suicune', '!');
    await h.say(T('Suicune... It came here, as if the bell had called it. And it is looking at you, not at me.'), EUSINE);
    await h.say(T('Go on. I have chased it for ten years; the least I can do now is watch.'), EUSINE);
    await suicune(h);
  }

  async function eusine(h) {
    const F = G.Field;
    if (!F.flag('suicune-met')) { await h.say(T('Suicune is waiting for you. Go on, I will watch from here.'), EUSINE); return; }
    if (!F.flag('beasts-answered')) { await h.say(T('Raikou and Entei went back to the Burned Tower, where they were reborn. They are waiting too.'), EUSINE); return; }
    if (!F.flag('ho-oh-met')) { await h.say(T('All three have answered. Now climb! I have a feeling the rainbow Pokémon is close.'), EUSINE); return; }
    if (!F.flag('silver-wing')) { await h.say(T('The elder of Ecruteak must hear about this. Go and tell him what you saw!'), EUSINE); return; }
    await h.say(T('Ho-Oh, Suicune, Raikou, Entei... I will remember this tower for the rest of my life.'), EUSINE);
  }

  async function hoOh(h) {
    const F = G.Field;
    F.setFlag('bell-ho-oh');
    h.face('player', 'up');
    await h.say(T('The Clear Bell rings by itself, high and clear...'));
    h.show('ho-oh');
    h.emote('ho-oh', '!');
    await h.say(T('A great rainbow-coloured Pokémon comes down onto the top of the tower!'));
    h.sfx('cry');
    await h.wild('ho-oh', 45, {});
    const r = F.lastBattle;
    if (r === 'run') { await h.say(T('Ho-Oh is still there, its wings shining like a rainbow.')); return; }
    if (r === 'lose') return;
    F.setFlag('ho-oh-met');
    h.hide('ho-oh');
    await h.say(T('A rainbow spreads over Ecruteak City. The legend of the two towers has come full circle.'));
    if (G.CreditsUI) await G.CreditsUI.ending(21); else F.setFlag('chapter-21-done');
  }

  G.Script.def({
    'bell.scene': [['js', scene]],
    'bell.suicune': [['js', suicune]],
    'bell.eusine': [['js', eusine]],
    'bell.answered': [['js', answered]],
    'bell.ho-oh': [['js', hoOh]],
    'bell.stairs-closed': [['say', 'A Sage stands by the stairs: Three Pokémon must answer the bell before anyone may climb.']]
  });
})();
