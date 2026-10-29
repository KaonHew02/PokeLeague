/* ============ league.js (Johto) — Johto's Elite Four and its Champion, Lance ============
 * Chapter 20, the end of the Johto journey. With all eight Johto badges the guard in the Indigo
 * Plateau's lobby (kanto/league.js, script league.guard) offers two challenges: Kanto's Elite Four
 * (as before) or Johto's: Will (Psychic), Koga (Poison), Bruno (Fighting) and Karen (Dark) in four
 * rooms of their own (`will-room` → `koga-room` → `jbruno-room` → `karen-room` → `jchampion-room`;
 * flags je4-*, cleared by the first room's `enter` like Kanto's run), then the Champion: Lance,
 * who is one of the Elite Four in the Kanto challenge and the last opponent in Johto's. Losing sends
 * you back to the lobby. Beating Lance: he takes you to the Hall of Fame (save.fame, flag
 * johto-champion), then home and `ending(20)`. Once you are Johto's Champion every member and
 * Lance battle ten levels up (the `2` trainers, as in Kanto), and a win goes straight to the Hall
 * of Fame. The teams are the games' (HeartGold and SoulSilver), three levels lower and Lance's six,
 * as in Kanto: the auto-player of tests/story.test.cjs never heals or switches.
 */
(() => {
  const T = s => G.T(s);
  // The rooms: the same hall as Kanto's, in their own colours, the member at the far end.
  const ROOM = [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'jjj++^++jjj',
    '+++++++++++',
    '+++++++++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    'WWWWWWWWWWW'
  ];
  const room = (id, palette, next, flag, o) => G.Maps.def(Object.assign({
    id, loc: 'indigo-plateau', region: 'johto', tileset: 'indoor', palette, music: 'gym', battleBg: 'indoor', rows: ROOM,
    warps: [{ x: 5, y: 2, to: next, spot: 'door', if: flag, locked: 'league.door-shut' }],
    spots: { door: [5, 10, 'up'] }
  }, o));
  const member = (id, who, name, team, lines) => Object.assign({
    id, who, cls: 'elite-four', name, x: 5, y: 4, dir: 'down', sight: 5, leader: true, ai: 'leader', music: 'league',
    team, win: 'jleague.' + id + '-win'
  }, lines);
  /** The member's team, and the one ten levels up once you are Johto's Champion. */
  const members = (id, who, name, team, lines, again) => [
    Object.assign(member(id, who, name, team, lines), { if: '!johto-champion' }),
    Object.assign(member(id + '2', who, name, team.map(([sp, lvl, moves]) => [sp, lvl + 10, moves]), Object.assign({}, lines, again)),
      { if: 'johto-champion', win: 'jleague.' + id + '-win' })
  ];

  room('will-room', 'pink', 'koga-room', 'je4-will', {
    enter: 'jleague.start',
    trainers: members('will', 'will', 'Will', [
      ['xatu', 37, ['psychic', 'night-shade', 'confuse-ray', 'quick-attack']],
      ['jynx', 38, ['ice-punch', 'psychic', 'lovely-kiss', 'double-slap']],
      ['exeggutor', 38, ['psychic', 'egg-bomb', 'hypnosis', 'reflect']],
      ['slowbro', 38, ['psychic', 'surf', 'curse', 'amnesia']],
      ['xatu', 39, ['psychic', 'night-shade', 'confuse-ray', 'future-sight']]], {
      before: 'So you are the one who gathered all of Johto\'s badges. I am Will. I traveled the world to sharpen my Psychic Pokémon, and I will not lose to anyone now!',
      defeat: 'My mind... did not see this coming.',
      afterScript: [['say', 'Losing will not stop me. Go on: the next room holds someone far more cunning than I am.', { name: 'Will' }]]
    }, { before: 'Back again, Champion? My mind has grown sharper since our battle. This time I have foreseen my victory!' })
  });
  room('koga-room', 'dojo', 'jbruno-room', 'je4-koga', {
    trainers: members('koga', 'koga', 'Koga', [
      ['ariados', 37, ['spider-web', 'sludge-bomb', 'night-shade', 'pin-missile']],
      ['venomoth', 38, ['psychic', 'supersonic', 'toxic', 'leech-life']],
      ['forretress', 40, ['rapid-spin', 'swift', 'protect', 'toxic']],
      ['muk', 39, ['sludge-bomb', 'minimize', 'acid-armor', 'toxic']],
      ['crobat', 41, ['wing-attack', 'bite', 'double-team', 'toxic']]], {
      before: 'Fwahahaha! We meet again. I am Koga, master of the ninja arts, and now of the Elite Four. Poison, confusion and patience: no foe escapes my techniques!',
      defeat: 'My techniques... seen through once more.',
      afterScript: [['say', 'A ninja knows when he is beaten. Go. The next of us fights with fists, not tricks.', { name: 'Koga' }]]
    }, { before: 'You return, Champion. I have refined my poisons since our last battle. Let us see if you can still slip through them!' })
  });
  room('jbruno-room', 'earth', 'karen-room', 'je4-bruno', {
    trainers: members('bruno', 'bruno', 'Bruno', [
      ['hitmontop', 39, ['triple-kick', 'quick-attack', 'pursuit', 'dig']],
      ['hitmonlee', 39, ['high-jump-kick', 'mega-kick', 'foresight', 'rolling-kick']],
      ['hitmonchan', 39, ['thunder-punch', 'ice-punch', 'fire-punch', 'mach-punch']],
      ['onix', 40, ['rock-slide', 'bind', 'sandstorm', 'screech']],
      ['machamp', 43, ['cross-chop', 'rock-slide', 'foresight', 'scary-face']]], {
      before: 'You again! Champion of Kanto, and now Johto\'s badges too. My Pokémon and I have trained in Johto\'s mountains since then. Hoo hah! Show me your strength once more!',
      defeat: 'Again... my training still falls short.',
      afterScript: [['say', 'Go on. Karen is next, and she does not go easy on anyone.', { name: 'Bruno' }]]
    }, { before: 'Champion! I have not missed a single day of training. Hoo hah! This time my fists will reach you!' })
  });
  room('karen-room', 'ghost', 'jchampion-room', 'je4-karen', {
    trainers: members('karen', 'karen', 'Karen', [
      ['umbreon', 39, ['feint-attack', 'confuse-ray', 'mean-look', 'sand-attack']],
      ['vileplume', 39, ['petal-dance', 'stun-spore', 'acid', 'moonlight']],
      ['gengar', 42, ['shadow-ball', 'hypnosis', 'dream-eater', 'confuse-ray']],
      ['murkrow', 41, ['feint-attack', 'pursuit', 'night-shade', 'quick-attack']],
      ['houndoom', 44, ['flamethrower', 'crunch', 'roar', 'feint-attack']]], {
      before: 'I am Karen of the Elite Four. My favourite? Dark Pokémon: tough, clever and misunderstood. People call some Pokémon strong and others weak, but that is only their opinion. A real Trainer wins with the Pokémon they believe in.',
      defeat: 'I like your style. You battle with your heart.',
      afterScript: [['say', 'The Champion waits beyond this door. You have met him before, I think.', { name: 'Karen' }]]
    }, { before: 'You came back, Champion. Good. My Dark Pokémon have been looking forward to this.' })
  });
  room('jchampion-room', 'champion', 'hall-of-fame', 'je4-champion', {
    npcs: [{ id: 'lance', who: 'lance', x: 5, y: 4, dir: 'down', if: '!je4-champion' }],
    triggers: [{ x: 0, y: 8, w: 11, h: 1, if: '!je4-champion', script: 'jleague.champion' }]
  });

  const LANCE = { name: 'Lance' };
  /** Lance's team as Johto's Champion, six levels below the games' (exported for the balance test); ten levels up in the rematches. */
  const lanceTeam = again => {
    const up = again ? 10 : 0;
    return [['gyarados', 38 + up, ['hydro-pump', 'crunch', 'twister', 'ice-fang']],
      ['dragonite', 41 + up, ['dragon-breath', 'thunderbolt', 'slam', 'thunder-wave']],
      ['dragonite', 41 + up, ['dragon-breath', 'fire-blast', 'slam', 'agility']],
      ['aerodactyl', 40 + up, ['rock-slide', 'wing-attack', 'bite', 'ancient-power']],
      ['charizard', 40 + up, ['flamethrower', 'wing-attack', 'slash', 'scary-face']],
      ['dragonite', 44 + up, ['outrage', 'hyper-beam', 'thunderbolt', 'ice-beam']]];
  };
  G.JohtoLeague = { lanceTeam };
  const RUN = [['will-room', 'will'], ['koga-room', 'koga'], ['jbruno-room', 'bruno'], ['karen-room', 'karen']];

  /** A new run through Johto's Elite Four: everybody battles again. */
  function start() {
    const F = G.Field;
    for (const [m, id] of RUN) { F.clearFlag('je4-' + id); delete F.save.done[m + ':' + id]; delete F.save.done[m + ':' + id + '2']; }
    F.clearFlag('je4-champion');
  }

  /** The Champion: Lance, then the Hall of Fame. */
  async function champion(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    h.face('player', 'up');
    if (F.flag('johto-champion')) { await rematch(h); return; }
    await h.say(T('I have been waiting for you, {player}. The Champion of Kanto, and now the holder of all eight of Johto\'s badges.'), LANCE);
    await h.say(T('For the Trainers of Johto, I am the last one standing in this League: its Champion. We fought together against Team Rocket. Today we fight each other, and I will hold nothing back.'), LANCE);
    await h.walkTo('lance', me.x, me.y - 1);
    h.face('lance', 'player'); h.face('player', 'lance');
    const out = await h.battle({ id: 'lance-champion', who: 'lance', cls: 'champion', name: 'Lance', leader: true, ai: 'leader', music: 'league',
      team: lanceTeam(false) }, {});
    if (out === 'lose') return;
    F.setFlag('je4-champion');
    await h.say(T('...It is over. You have beaten me once more, and this time as Johto\'s Champion.'), LANCE);
    await h.say(T('Your Pokémon fought for you with everything they had. That is a bond no dragon can break.'), LANCE);
    await h.say(T('Come with me. Johto\'s Hall of Fame is waiting for you and your team.'), LANCE);
    await h.warp('hall-of-fame', 'door');
    await hallOfFame(h);
  }

  /** Once you are Johto's Champion: Lance with his team ten levels up; a win, the Hall of Fame again. */
  async function rematch(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    await h.say(T('So you have come to face me again, Champion. My dragons have grown stronger. Let us see how far you have come!'), LANCE);
    await h.walkTo('lance', me.x, me.y - 1);
    h.face('lance', 'player'); h.face('player', 'lance');
    const out = await h.battle({ id: 'lance-champion2', who: 'lance', cls: 'champion', name: 'Lance', leader: true, ai: 'leader', music: 'league',
      team: lanceTeam(true) }, {});
    if (out === 'lose') return;
    F.setFlag('je4-champion');
    await h.say(T('Still the Champion. I will be waiting for the next time.'), LANCE);
    await h.warp('hall-of-fame', 'door');
    await h.move('player', ['up', 'up', 'up']);
    S.fame.push({ at: Date.now(), party: S.party.map(m => ({ sp: m.sp, lvl: m.lvl, nick: m.nick || null, shiny: !!m.shiny })) });
    await h.jingle('fame');
    await h.say(T("{player}'s team has entered the Hall of Fame!"));
    await h.warp('player-2f', 'start');
  }

  /** Johto's Hall of Fame: the team is remembered, then home and the credits. */
  async function hallOfFame(h) {
    const F = G.Field, S = F.save;
    h.place('lance', 5, 7, 'up');
    h.show('lance');
    await h.move('player', ['up', 'up', 'up']);
    await h.move('lance', ['up', 'up', 'up']);
    h.face('lance', 'player'); h.face('player', 'lance');
    await h.say(T('Your team\'s names are written here once already, for Kanto. Today the Hall of Fame remembers them again, as the Champions of Johto.'), LANCE);
    S.fame = S.fame || [];
    S.fame.push({ at: Date.now(), party: S.party.map(m => ({ sp: m.sp, lvl: m.lvl, nick: m.nick || null, shiny: !!m.shiny })) });
    F.setFlag('johto-champion');
    h.face('player', 'up');
    await h.jingle('fame');
    await h.say(T("{player}'s team has entered the Hall of Fame!"));
    h.face('player', 'lance');
    await h.say(T('Team Rocket is gone, the Gyarados of the lake are calm, and Johto\'s Pokémon trust you. Go home and rest, Champion. You have earned it.'), LANCE);
    h.hide('lance');
    await h.warp('player-2f', 'start');
    if (G.CreditsUI) await G.CreditsUI.ending(20);
    else F.setFlag('chapter-20-done');
  }

  G.Script.def({
    'jleague.start': [['js', start]],
    // The lobby's guard, once you hold Johto's eight badges: which Elite Four? (Warps written out, so
    // tests/kanto.test.cjs can follow them.)
    'jleague.guard': [
      ['say', 'Two challenges meet at the Indigo Plateau: Kanto\'s Elite Four, and the Elite Four that Johto\'s Trainers face, with their own Champion.'],
      ['choice', 'Which challenge will you take?', [['call', 'jleague.ready-johto']], [['call', 'jleague.ready-kanto']],
        { options: ['Johto\'s Elite Four', 'Kanto\'s Elite Four'] }]
    ],
    'jleague.ready-johto': [
      ['say', 'Once you go in, there is no coming back until you win or lose.'],
      ['choice', 'Are you ready?', [['say', 'Then go, and good luck!'], ['warp', 'will-room', 'door']], [['say', 'Take your time. Heal up and get ready.']]]
    ],
    'jleague.ready-kanto': [
      ['say', 'Once you go in, there is no coming back until you win or lose.'],
      ['choice', 'Are you ready?', [['say', 'Then go, and good luck!'], ['warp', 'lorelei-room', 'door']], [['say', 'Take your time. Heal up and get ready.']]]
    ],
    'jleague.champion': [['js', champion]],
    'jleague.will-win': [['setFlag', 'je4-will'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'jleague.koga-win': [['setFlag', 'je4-koga'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'jleague.bruno-win': [['setFlag', 'je4-bruno'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'jleague.karen-win': [['setFlag', 'je4-karen'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']]
  });
})();
