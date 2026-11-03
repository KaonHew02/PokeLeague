/* ============ legends.js — Groudon, Kyogre, Latias and Latios ============
 * Chapter 42, Hoenn after the League. Once Rayquaza is met, the Weather Institute (Route 119) reads a
 * drought by Route 114 and endless rain over Route 127 (flag weather-report): the Terra Cave opens on
 * Route 114 (Groudon) and the Marine Cave under Route 127 (Dive; Kyogre), both at level 70. Back home in
 * Littleroot, Mrs. Birch has seen a red or blue Pokémon on the news: the colour the player names decides
 * which one roams Hoenn (G.Roam, roam.js: Latias for red, Latios for blue, level 40; flags lati-red or
 * lati-blue), and she hands over an Eon Ticket that came in the mail. With it, the ferry in Lilycove City
 * sails to Southern Island, where the other one waits by the great tree (level 50). Once all four are
 * met (the roaming one caught), `ending(42)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, region: 'hoenn' };
  const SAILOR = { name: 'Sailor' };

  // ---------------- The Terra Cave (Route 114) ----------------
  G.Maps.def(Object.assign({
    id: 'terra-cave', loc: 'terra-cave',
    rows: [
      '##################',
      '######......######',
      '#####........#####',
      '####..........####',
      '####..........####',
      '#####...##...#####',
      '####....##....####',
      '###............###',
      '###...#....#...###',
      '####..........####',
      '#####........#####',
      '######......######',
      '########..########',
      '########O#########'
    ],
    warps: [{ x: 8, y: 13, to: 'route114', spot: 'terra' }],
    spots: { door: [8, 12, 'up'] },
    npcs: [{ id: 'groudon', who: 'groudon', mon: 'groudon', x: 9, y: 3, dir: 'down', fixed: true, if: '!groudon-met', script: 'legends.groudon' }]
  }, CAVE));

  // ---------------- The Marine Cave (under Route 127) ----------------
  G.Maps.def(Object.assign({
    id: 'marine-cave', loc: 'marine-cave', dive: { to: 'route127-uw', spot: 'marine' },
    rows: [
      '##################',
      '#####~~~~~~~~#####',
      '####~~~~~~~~~~####',
      '####~~~~~~~~~~####',
      '####..........####',
      '###............###',
      '###....#..#....###',
      '###............###',
      '####..........####',
      '####...dddd...####',
      '####...dddd...####',
      '####...dddd...####',
      '#####........#####',
      '##################'
    ],
    spots: { pool: [8, 10, 'up'] },
    npcs: [{ id: 'kyogre', who: 'kyogre', mon: 'kyogre', x: 9, y: 3, dir: 'down', fixed: true, swim: true, if: '!kyogre-met', script: 'legends.kyogre' }]
  }, CAVE));

  // ---------------- Southern Island ----------------
  G.Maps.def(Object.assign({
    id: 'southern-island', loc: 'southern-island', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~',
      '~~~~~TTTTTTTTT~~~~~~',
      '~~~~TT.......TT~~~~~',
      '~~~TT....T....TT~~~~',
      '~~~T.....T.....T~~~~',
      '~~~T...........T~~~~',
      '~~~T...........T~~~~',
      '~~~T...........T~~~~',
      '~~~TT.........TT~~~~',
      '~~~~T:::::::::T~~~~~',
      '~~~~~:::::::::~~~~~~',
      '~~~~~~~::::~~~~~~~~~',
      '~~~~~~~~==~~~~~~~~~~',
      '~~~~~~~~==~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~'
    ],
    spots: { pier: [8, 12, 'up'] },
    npcs: [
      { id: 'sailor', who: 'sailor', x: 9, y: 13, dir: 'up', script: 'legends.ferry-back' },
      // The one that does not roam: Latios when the player saw red, Latias when blue.
      { id: 'latios', who: 'latios', mon: 'latios', x: 9, y: 5, dir: 'down', fixed: true, if: ['lati-red', '!southern-met'], script: 'legends.southern' },
      { id: 'latias', who: 'latias', mon: 'latias', x: 9, y: 5, dir: 'down', fixed: true, if: ['lati-blue', '!southern-met'], script: 'legends.southern' }
    ]
  }, HOENN));

  // ---------------- The story ----------------
  const DONE = ['groudon-met', 'kyogre-met', 'southern-met', 'roamer-caught'];
  /** All four met (the roaming one caught): the end of the forty-second chapter (credits-ui.js). */
  async function done(h) {
    const F = G.Field;
    if (!DONE.every(f => F.flag(f)) || F.flag('chapter-42-done')) return;
    await h.say(T('Groudon, Kyogre, Latias and Latios: every legend of Hoenn\'s land, sea and sky has met you now.'));
    if (G.CreditsUI) G.CreditsUI.ending(42); else F.setFlag('chapter-42-done');
  }

  /** Groudon or Kyogre at level 70: run or lose and it stays. */
  async function master(h, id, intro) {
    const F = G.Field;
    await h.say(intro);
    h.sfx('cry');
    await h.wild(id, 70, {});
    const r = F.lastBattle;
    if (r === 'run' || r === 'lose') return;
    if (id === 'groudon') F.setFlag('groudon-met'); else F.setFlag('kyogre-met');
    h.hide(id);
    await done(h);
  }

  async function forecast(h) {
    const F = G.Field;
    if (F.flag('groudon-met') && F.flag('kyogre-met')) {
      await h.say(T('Every reading is calm now. The land and the sea of Hoenn are at rest.'));
      return;
    }
    if (!F.flag('rayquaza-met')) {
      await h.say(T('The skies have been calm since Rayquaza came down. Our instruments say it is still up there, watching from the Sky Pillar.'));
      return;
    }
    await h.say(T('These readings are strange! A fierce drought around Route 114, and rain that never stops over Route 127.'));
    await h.say(T('It is just like the day Groudon and Kyogre woke. Could the two of them be resting somewhere near there?'));
    F.setFlag('weather-report');
  }

  /** Mrs. Birch and the news: the colour decides which one roams; and the Eon Ticket. */
  async function tv(h) {
    const F = G.Field;
    await h.say(T('{player}, welcome home, Champion! You have to hear this: the news just showed a Pokémon soaring over Hoenn, faster than a jet!'));
    await h.say(T('The picture was all a blur, but its color stood out. Did you see it on TV too?'));
    const blue = await h.choice(T('What color was the Pokémon?'), { options: [T('Red'), T('Blue')] }) === 1;
    const sp = blue ? 381 : 380;
    if (blue) F.setFlag('lati-blue'); else F.setFlag('lati-red');
    F.setFlag('lati-chosen');
    G.Roam.start(sp, 40, G.RNG((F.save.player.id | 0) * 7919 + (F.save.playTime | 0) + sp));
    if (blue) await h.say(T('A blue one? Then it must have been {mon}! They say it is still flying all over Hoenn. Keep your eyes open on the routes!'), { vars: { mon: G.Names.mon(sp) } });
    else await h.say(T('A red one? Then it must have been {mon}! They say it is still flying all over Hoenn. Keep your eyes open on the routes!'), { vars: { mon: G.Names.mon(sp) } });
    await h.say(T('Oh, and this came in the mail for you: a ticket with a picture of an island on it.'));
    await G.Script.exec([['giveItem', 'eon-ticket', 1]], h);
    await h.say(T('The sailors at the harbor in Lilycove City would know where it goes.'));
  }

  async function southern(h) {
    const F = G.Field;
    const id = F.flag('lati-red') ? 'latios' : 'latias';
    await h.say(T('The Pokémon by the great tree turns to look at you. It does not seem afraid.'));
    h.sfx('cry');
    await h.wild(id, 50, {});
    const r = F.lastBattle;
    if (r === 'run' || r === 'lose') return;
    F.setFlag('southern-met');
    h.hide(id);
    await done(h);
  }

  G.Script.def({
    'legends.forecast': [['js', forecast]],
    'legends.tv': [['js', tv]],
    'legends.groudon': [['js', h => master(h, 'groudon', T('Waves of heat roll off the rock. The ground itself seems to breathe... Groudon opens its eyes!'))]],
    'legends.kyogre': [['js', h => master(h, 'kyogre', T('The water of the pool swells and churns. Kyogre rises from the depths!'))]],
    'legends.southern': [['js', southern]],
    'legends.done': [['js', done]],
    'legends.terra-closed': [['say', 'A crack runs through the rock. Hot, dry air seeps out of it, but it is far too narrow to get through.']],
    'legends.marine-closed': [['say', 'A dark opening in the rock. A strong current pours out of it, too strong to swim against.']],
    'legends.ferry': [
      ['if', '!hoenn-champion', [
        ['say', 'The ferry is not running right now. Some trouble out at sea, they say. Sorry, kid.', SAILOR]
      ], [
        ['if', 'has:eon-ticket', [
          ['choice', 'The ferry is running again! An Eon Ticket, eh? That one sails to Southern Island, far to the south. Shall we go?', [
            ['fade', 'out', 0.6], ['sfx', 'horn'],
            ['say', 'The ship sailed south over the calm sea...'],
            ['warp', 'southern-island', 'pier']
          ], [], SAILOR]
        ], [
          ['say', 'The ferry is running again! But it only sails where you hold a ticket for, and you do not have one. Sorry, kid.', SAILOR]
        ]]
      ]]
    ],
    'legends.ferry-back': [
      ['choice', 'Ready to sail back to Lilycove City?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The ship sailed back north to Lilycove City.'],
        ['warp', 'lilycove', 'harbor']
      ], [], SAILOR]
    ]
  });
  G.Legends = { DONE };
})();
