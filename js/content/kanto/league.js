/* ============ league.js — the Indigo Plateau, the Elite Four and the Champion ============
 * Chapter 9, the end of Kanto. Victory Road comes out on the Indigo Plateau (a place to fly to):
 * the Pokémon League's lobby is a Pokémon Center and a Mart in one room, and a guard lets you
 * through to the Elite Four. Their rooms follow one another and there is no way back: Lorelei
 * (Ice), Bruno (Fighting), Agatha (Ghost), Lance (Dragon), then the Champion: the rival, who beat
 * them first. Losing sends you back to the lobby, and every run starts again with Lorelei (her
 * room's `enter` clears flags e4-*). The teams are those of the games, three to four levels lower
 * (the Champion six): the auto-player of tests/story.test.cjs never heals or switches, and the jump
 * from Victory Road is large.
 * After the Champion, Professor Oak takes you to the Hall of Fame (the team is written to
 * save.fame, flags champion and hall-of-fame), then you wake up at home and the credits roll
 * (G.CreditsUI.ending(9)).
 */
G.Maps.def({
  id: 'indigo', loc: 'indigo-plateau', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................T',
    'T.......IIIIIIII.......T',
    'T..f....IIIIIIII....f..T',
    'T.......IIIIIIII.......T',
    'T.......IIIIIIII.......T',
    'T.......IIIIIIII.......T',
    'T.......IIIDIIII.......T',
    'T..........,...........T',
    'T..........,.S.........T',
    'T..........,,,,,,,,,...T',
    'T################..,...T',
    'T####O###########..,...T',
    'T....,.............,...T',
    'T....,,,,,,,,,,,,,,,...T',
    'T..f...............f...T',
    'T......................T',
    'TTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  warps: [
    { x: 11, y: 7, to: 'indigo-lobby', spot: 'door' },
    { x: 5, y: 12, to: 'victory-2f', spot: 'exit' }
  ],
  spots: { door: [11, 8, 'down'], 'cave-door': [5, 13, 'down'] },
  signs: { '13,9': 'Indigo Plateau. The Pokémon League: where the best Trainers meet the Elite Four.' }
});

G.Maps.def({
  id: 'indigo-lobby', loc: 'indigo-plateau', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    'p+h++++^++b+++P',
    'p======+======p',
    '+++++++++++++++',
    '+++++++++++++++',
    't+++++++++++++t',
    't+++++++++++++t',
    '+++++++++++++++',
    '+++++++X+++++++'
  ],
  warps: [{ x: 7, y: 9, to: 'indigo', spot: 'door' }, { x: 7, y: 2, to: 'lorelei-room', spot: 'door' }],
  spots: { door: [7, 9, 'up'], heal: [3, 4, 'up'], guard: [7, 4, 'up'] },
  signs: { '10,2': 'A shelf of records: the names of every Champion of the Pokémon League.' },
  npcs: [
    { id: 'nurse', who: 'nurse', x: 3, y: 2, dir: 'down', script: [
      ['say', 'Welcome to the Pokémon League! We take care of the Pokémon of every Trainer who comes this far.'],
      ['choice', 'Shall I take care of your Pokémon for a moment?', [
        ['say', 'Leave them with me. This will only take a moment.'],
        ['healAnim'], ['heal'], ['lastHeal', 'heal'],
        ['say', 'All done! Your Pokémon are full of energy again.'],
        ['say', 'Good luck against the Elite Four!']
      ], [
        ['say', 'Good luck against the Elite Four!']
      ]]
    ] },
    { id: 'clerk', who: 'clerk', x: 11, y: 2, dir: 'down', script: [
      ['say', 'The last shop before the Elite Four. Stock up well!'],
      ['shop', ['ultra-ball', 'great-ball', 'full-restore', 'max-potion', 'hyper-potion', 'revive', 'full-heal', 'max-repel']]
    ] },
    { id: 'guard', who: 'officer', x: 7, y: 3, dir: 'down', script: 'league.guard' },
    { id: 'trainer', who: 'cooltrainer', x: 12, y: 6, move: 'look',
      say: 'The Elite Four battle one after another, with no break in between. Bring plenty of Full Restores!' }
  ]
});

(() => {
  // The Elite Four's rooms: the same hall in their own colours, the member waiting at the far end.
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
  const room = (id, palette, bg, next, flag, o) => G.Maps.def(Object.assign({
    id, loc: 'indigo-plateau', tileset: 'indoor', palette, music: 'gym', battleBg: bg, rows: ROOM,
    warps: [{ x: 5, y: 2, to: next, spot: 'door', if: flag, locked: 'league.door-shut' }],
    spots: { door: [5, 10, 'up'] }
  }, o));
  const member = (id, name, team, lines) => Object.assign({
    id, who: id, cls: 'elite-four', name, x: 5, y: 4, dir: 'down', sight: 5, leader: true, ai: 'leader', music: 'league',
    team, win: 'league.' + id + '-win'
  }, lines);

  room('lorelei-room', 'ice', 'ice', 'bruno-room', 'e4-lorelei', {
    enter: 'league.start',
    trainers: [member('lorelei', 'Lorelei', [
      ['dewgong', 49, ['ice-beam', 'headbutt', 'take-down', 'aurora-beam']],
      ['cloyster', 48, ['spike-cannon', 'ice-beam', 'supersonic', 'clamp']],
      ['slowbro', 49, ['surf', 'psychic', 'headbutt', 'amnesia']],
      ['jynx', 51, ['ice-punch', 'psychic', 'body-slam', 'double-slap']],
      ['lapras', 51, ['body-slam', 'ice-beam', 'surf', 'confuse-ray']]], {
      before: 'Welcome to the Pokémon League. I am Lorelei of the Elite Four. My Ice Pokémon have frozen every challenger who came through that door. You will be no different!',
      defeat: 'How could I lose? Your Pokémon burn hotter than my ice is cold...',
      afterScript: [['say', 'Go on. The next room is waiting. But the Elite Four only get stronger from here.', { name: 'Lorelei' }]]
    })]
  });
  room('bruno-room', 'dojo', 'indoor', 'agatha-room', 'e4-bruno', {
    trainers: [member('bruno', 'Bruno', [
      ['onix', 48, ['rock-tomb', 'rock-throw', 'bind', 'screech']],
      ['hitmonchan', 50, ['sky-uppercut', 'mach-punch', 'thunder-punch', 'ice-punch']],
      ['hitmonlee', 50, ['mega-kick', 'rolling-kick', 'focus-energy', 'brick-break']],
      ['onix', 51, ['rock-tomb', 'iron-tail', 'bind', 'screech']],
      ['machamp', 53, ['cross-chop', 'bulk-up', 'scary-face', 'rock-tomb']]], {
      before: 'I am Bruno of the Elite Four! I have trained my body and my Pokémon to their limits. Hoo hah! Face our full strength!',
      defeat: 'Defeated? ...My training is still not enough.',
      afterScript: [['say', 'My loss is my lesson. Go, and face the next of the Elite Four.', { name: 'Bruno' }]]
    })]
  });
  room('agatha-room', 'tower', 'indoor', 'lance-room', 'e4-agatha', {
    trainers: [member('agatha', 'Agatha', [
      ['gengar', 51, ['shadow-ball', 'confuse-ray', 'hypnosis', 'dream-eater']],
      ['golbat', 51, ['wing-attack', 'bite', 'confuse-ray', 'poison-fang']],
      ['haunter', 50, ['lick', 'night-shade', 'confuse-ray', 'hypnosis']],
      ['arbok', 53, ['glare', 'bite', 'acid', 'screech']],
      ['gengar', 55, ['shadow-ball', 'sludge-bomb', 'hypnosis', 'confuse-ray']]], {
      before: 'I am Agatha of the Elite Four. Hmph! Oak takes an interest in you, does he? That old fool once was a fine Trainer. Now let me show you how a real Trainer battles!',
      defeat: 'Oh my! You are something special, child.',
      afterScript: [['say', 'You win. I see now what Oak sees in you. Go on, the last of us is waiting.', { name: 'Agatha' }]]
    })]
  });
  room('lance-room', 'dragon', 'indoor', 'champion-room', 'e4-lance', {
    trainers: [member('lance', 'Lance', [
      ['gyarados', 52, ['hydro-pump', 'bite', 'dragon-rage', 'thrash']],
      ['dragonair', 50, ['dragon-rage', 'slam', 'wrap', 'thunder-wave']],
      ['dragonair', 50, ['dragon-rage', 'slam', 'twister', 'agility']],
      ['aerodactyl', 53, ['wing-attack', 'ancient-power', 'bite', 'supersonic']],
      ['dragonite', 56, ['outrage', 'wing-attack', 'thunder-wave', 'slam']]], {
      before: 'Ah, you have made it this far. I am Lance, the leader of the Elite Four. Dragons are mythical Pokémon, hard to raise and harder still to master. Their power is unmatched!',
      defeat: 'That is it... I hate to admit it, but you are a Pokémon master.',
      afterScript: [['say', 'You beat all four of us. But there is one more Trainer you must face: the Champion. Go!', { name: 'Lance' }]]
    })]
  });
  room('champion-room', 'champion', 'indoor', 'hall-of-fame', 'e4-champion', {
    npcs: [
      { id: 'rival', who: 'rival', x: 5, y: 4, dir: 'down', if: '!e4-champion' },
      { id: 'oak', who: 'oak', x: 5, y: 10, dir: 'up', if: 'scripted' }
    ],
    triggers: [{ x: 0, y: 8, w: 11, h: 1, if: '!e4-champion', script: 'league.champion' }]
  });
})();

G.Maps.def({
  id: 'hall-of-fame', loc: 'indigo-plateau', tileset: 'indoor', palette: 'champion', music: 'center', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'jj+++j+++jj',
    '+++++++++++',
    '+++++++++++',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    'WWWWWWWWWWW'
  ],
  spots: { door: [5, 7, 'up'] },
  signs: { '5,2': 'The Hall of Fame. The Champions of the Pokémon League and their Pokémon are remembered here forever.' },
  npcs: [{ id: 'oak', who: 'oak', x: 4, y: 7, dir: 'up', if: 'scripted' }]
});

(() => {
  const T = s => G.T(s);
  const RIVAL = { name: '{rival}' }, OAK = { name: 'Prof. Oak' };
  // The Champion's team after the starter he picked (the games' final teams, six levels lower; no
  // one-hit moves like Horn Drill).
  const MV = {
    pidgeot: ['aerial-ace', 'wing-attack', 'quick-attack', 'feather-dance'], alakazam: ['psychic', 'future-sight', 'reflect', 'disable'],
    rhydon: ['earthquake', 'rock-tomb', 'take-down', 'scary-face'], gyarados: ['hydro-pump', 'bite', 'dragon-rage', 'thrash'],
    arcanine: ['flamethrower', 'extreme-speed', 'bite', 'roar'], exeggutor: ['egg-bomb', 'psychic', 'stomp', 'confusion'],
    venusaur: ['solar-beam', 'sludge-bomb', 'body-slam', 'growth'], charizard: ['flamethrower', 'wing-attack', 'slash', 'scary-face'],
    blastoise: ['hydro-pump', 'bite', 'skull-bash', 'rapid-spin']
  };
  const mon = (sp, lvl) => [sp, lvl, MV[sp]];
  const FINAL = { 1: 'venusaur', 4: 'charizard', 7: 'blastoise' };
  const MIDDLE = { 1: ['gyarados', 'arcanine'], 4: ['exeggutor', 'gyarados'], 7: ['arcanine', 'exeggutor'] };
  /** The Champion's team (exported for the balance test). */
  const championTeam = st => [mon('pidgeot', 53), mon('alakazam', 51), mon('rhydon', 53),
    ...(MIDDLE[st] || MIDDLE[1]).map(sp => mon(sp, 53)), mon(FINAL[st] || 'venusaur', 57)];
  G.League = { championTeam };
  const RUN = ['lorelei', 'bruno', 'agatha', 'lance'];

  /** A new run through the Elite Four: everybody battles again. */
  function start() {
    const F = G.Field;
    for (const n of RUN) { F.clearFlag('e4-' + n); delete F.save.done[n + '-room:' + n]; }
    F.clearFlag('e4-champion');
  }

  /** The Champion: the rival, then Professor Oak, then the Hall of Fame. */
  async function champion(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    h.face('player', 'up');
    await h.say(T('Hey, {player}! I was hoping you would make it this far.'), RIVAL);
    await h.say(T("While you were working on your Pokédex, I beat the Elite Four. That's right: I'm the Champion of the Pokémon League now!"), RIVAL);
    await h.say(T('I trained my team to be the strongest in the world. And now I get to prove it. Against you!'), RIVAL);
    await h.walkTo('rival', me.x, me.y - 1);
    h.face('rival', 'player'); h.face('player', 'rival');
    const out = await h.battle({ id: 'rival-champion', who: 'rival', cls: 'champion', name: S.rival.name, leader: true, ai: 'leader', music: 'league',
      team: championTeam(S.rival.starter) }, {});
    if (out === 'lose') return;
    F.setFlag('e4-champion');
    await h.say(T('No way... I lost? After all that work, my time as Champion is already over?'), RIVAL);
    await h.say(T("...Fine. You're the Champion now, {player}. I'll admit it. This once."), RIVAL);
    // Professor Oak comes in.
    h.place('oak', 5, 10, 'up');
    h.show('oak');
    await h.say(T('{player}!'), OAK);
    await h.walkTo('oak', me.x, me.y + 1);
    h.face('oak', 'player'); h.face('player', 'oak');
    await h.say(T('You did it! Congratulations, {player}! You are the new Champion of the Pokémon League!'), OAK);
    await h.say(T('You have grown so much since you left Pallet Town. You and your Pokémon trusted each other every step of the way.'), OAK);
    h.face('oak', 'rival');
    await h.say(T('{rival}... You lost because you forgot to treat your Pokémon with trust and kindness. Remember that, and you will grow stronger too.'), OAK);
    h.face('oak', 'player');
    await h.say(T('{player}, come with me. It is time to enter you and your Pokémon in the Hall of Fame.'), OAK);
    await h.warp('hall-of-fame', 'door');
    await hallOfFame(h);
  }

  /** The Hall of Fame: the team is remembered, then home and the credits. */
  async function hallOfFame(h) {
    const F = G.Field, S = F.save;
    h.show('oak');
    await h.move('player', ['up', 'up', 'up']);
    await h.move('oak', ['up', 'up', 'up']);
    h.face('oak', 'player'); h.face('player', 'oak');
    await h.say(T('This is the Hall of Fame. Every Champion of the League is remembered here, with the Pokémon who stood beside them.'), OAK);
    await h.say(T("Let's record your team. These are the Pokémon who brought you here!"), OAK);
    S.fame = S.fame || [];
    S.fame.push({ at: Date.now(), party: S.party.map(m => ({ sp: m.sp, lvl: m.lvl, nick: m.nick || null, shiny: !!m.shiny })) });
    F.setFlag('champion');
    F.setFlag('hall-of-fame');
    h.face('player', 'up');
    await h.jingle('fame');
    await h.say(T("{player}'s team has entered the Hall of Fame!"));
    h.face('player', 'oak');
    await h.say(T('Now go home and rest. Your mother will be so proud. And your Pokédex is not finished yet, is it?'), OAK);
    await h.warp('player-2f', 'start');
    if (G.CreditsUI) await G.CreditsUI.ending(9);
    else F.setFlag('chapter-9-done');
  }

  G.Script.def({
    'league.start': [['js', start]],
    'league.champion': [['js', champion]],
    'league.door-shut': [['say', 'The door is shut tight. The Trainer of this room must be beaten first.']],
    'league.guard': [
      ['say', 'Beyond this door are the Elite Four. You battle all four in a row, and then the Champion.'],
      ['say', 'Once you go in, there is no coming back until you win or lose.'],
      ['choice', 'Are you ready?', [
        ['say', 'Then go, and good luck!'],
        ['warp', 'lorelei-room', 'door']
      ], [
        ['say', 'Take your time. Heal up and get ready.']
      ]]
    ],
    'league.lorelei-win': [['setFlag', 'e4-lorelei'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'league.bruno-win': [['setFlag', 'e4-bruno'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'league.agatha-win': [['setFlag', 'e4-agatha'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']],
    'league.lance-win': [['setFlag', 'e4-lance'], ['sfx', 'door'], ['say', 'The door at the back of the room slid open.']]
  });
})();
