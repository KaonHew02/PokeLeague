/* ============ league.js — Sinnoh's Pokémon League: the Elite Four, Cynthia and the Hall of Fame ============
 * Chapter 59, the end of Sinnoh's story. The great doors of `sinnoh-league` (victory.js) lead to a lobby with a nurse, a shop and a guard.
 * Four rooms in a row: Aaron (Bug), Bertha (Ground), Flint (Fire), Lucian (Psychic). The door at the back of each opens after its win
 * (flags se4-*); the first room's `enter` clears them, so every run starts over. Cynthia waits in the last room and has never told
 * you she is the Champion. After her Professor Rowan comes in, and both walk you to the Hall of Fame (flag sinnoh-champion, `save.fame`),
 * then home to Twinleaf Town and `ending(59)`. Once you are Sinnoh's Champion everybody battles with a team ten levels up.
 * The teams and moves are Platinum's; Aaron, Bertha and Flint keep its levels, Lucian is three levels lower (his Gallade two) and
 * Cynthia six (her Garchomp five, and one Full Restore where Platinum has four), so that a sensible team of six wins six times in ten.
 * The Elite Four are named in the dictionaries as "Elite Four Aaron" and so on, with no class:
 * the plain keys "Aaron" and "Flint" already belong to people in Kanto.
 */
(() => {
  const T = s => G.T(s);
  const LEAGUE = { loc: 'sinnoh-pokemon-league', tileset: 'indoor', music: 'gym', battleBg: 'indoor', region: 'sinnoh' };
  const CYNTHIA = { name: 'Cynthia' }, ROWAN = { name: 'Prof. Rowan' };

  // ---------------- The lobby ----------------
  G.Maps.def(Object.assign({}, LEAGUE, {
    id: 'sinnoh-league-lobby', palette: 'center', music: 'center',
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
    warps: [{ x: 7, y: 9, to: 'sinnoh-league', spot: 'door' }, { x: 7, y: 2, to: 'aaron-room', spot: 'door' }],
    spots: { door: [7, 9, 'up'], heal: [3, 4, 'up'], guard: [7, 4, 'up'] },
    signs: { '10,2': 'A shelf of records: the names of every Champion of Sinnoh\'s Pokémon League.' },
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
      { id: 'guard', who: 'officer', x: 7, y: 3, dir: 'down', script: 'sleague.guard' },
      { id: 'trainer', who: 'cooltrainer', x: 12, y: 6, move: 'look',
        say: 'Sinnoh\'s Elite Four use Bug, Ground, Fire and Psychic Pokémon. And the Champion? I hear she spends her days reading old stories.' }
    ]
  }));

  // The rooms: the hall of the other Leagues, each with something of its Trainer in it, the member at the far end.
  const room = (id, palette, rows, next, flag, o) => G.Maps.def(Object.assign({}, LEAGUE, {
    id, palette, rows,
    warps: [{ x: 5, y: 2, to: next, spot: 'door', if: flag, locked: 'league.door-shut' }],
    spots: { door: [5, 10, 'up'] }
  }, o));
  const member = (id, who, team, lines) => Object.assign({
    id, who, x: 5, y: 4, dir: 'down', sight: 5, prize: 100, leader: true, ai: 'leader', music: 'league',
    team, items: { 'full-restore': 2 }, win: 'sleague.' + id + '-win'
  }, lines);
  /** The member's team, and the one ten levels up once you are Sinnoh's Champion. */
  const members = (id, who, team, lines, again) => [
    Object.assign(member(id, who, team, lines), { if: '!sinnoh-champion' }),
    Object.assign(member(id + '2', who, team.map(([sp, lvl, moves, item]) => [sp, lvl + 10, moves, item]), Object.assign({}, lines, again)),
      { if: 'sinnoh-champion', win: 'sleague.' + id + '-win' })
  ];

  // Aaron among his plants.
  room('aaron-room', 'garden', [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'ppp++^++ppp',
    'p+++++++++p',
    '+++++++++++',
    'p+++rrr+++p',
    '++++rrr++++',
    'p+++rrr+++p',
    '++++rrr++++',
    'p+++rrr+++p',
    '++++rrr++++',
    'WWWWWWWWWWW'
  ], 'bertha-room', 'se4-aaron', {
    enter: 'sleague.start',
    trainers: members('aaron', 'aaron', [
      ['yanmega', 49, ['air-slash', 'bug-buzz', 'u-turn', 'double-team']],
      ['scizor', 49, ['iron-head', 'x-scissor', 'night-slash', 'quick-attack']],
      ['vespiquen', 50, ['attack-order', 'defend-order', 'heal-order', 'power-gem']],
      ['heracross', 51, ['megahorn', 'close-combat', 'night-slash', 'stone-edge']],
      ['drapion', 53, ['x-scissor', 'cross-poison', 'ice-fang', 'aerial-ace'], 'sitrus-berry']], {
      name: 'Elite Four Aaron',
      before: 'Welcome. I am Aaron of the Elite Four. Most people look at a Bug Pokémon and see something small and weak. I see something that never gives up. Let me show you how far that goes!',
      defeat: 'I lost... My Pokémon fought to the very end, and so did yours.',
      afterScript: [['say', 'Go on. Bertha is next, and she has been doing this for longer than any of us.', { name: 'Elite Four Aaron' }]]
    }, { before: 'Back again, Champion? My Bug Pokémon have shed their old shells. See what has grown underneath!' })
  });

  // Bertha on the rocks.
  room('bertha-room', 'earth', [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'ccc++^++ccc',
    '+++++++++++',
    'c+++++++++c',
    '++++rrr++++',
    'cc++rrr++cc',
    '++++rrr++++',
    '++++rrr++++',
    'c+++rrr+++c',
    '++++rrr++++',
    'WWWWWWWWWWW'
  ], 'flint-room', 'se4-bertha', {
    trainers: members('bertha', 'bertha', [
      ['whiscash', 50, ['earth-power', 'aqua-tail', 'zen-headbutt', 'sandstorm']],
      ['gliscor', 53, ['earthquake', 'ice-fang', 'fire-fang', 'thunder-fang']],
      ['hippowdon', 52, ['earthquake', 'stone-edge', 'crunch', 'yawn']],
      ['golem', 52, ['earthquake', 'fire-punch', 'thunder-punch', 'sandstorm']],
      ['rhyperior', 55, ['earthquake', 'rock-wrecker', 'megahorn', 'avalanche'], 'sitrus-berry']], {
      name: 'Elite Four Bertha',
      before: 'Well now, such a young face. I am Bertha of the Elite Four. My Pokémon and I are as patient as the ground under your feet. Come along, dear, and show this old woman what you can do.',
      defeat: 'Oh my. It has been years since anyone shook the ground under me.',
      afterScript: [['say', 'Flint is next. He may grin at you, but his fire is no joke. Take care, dear.', { name: 'Elite Four Bertha' }]]
    }, { before: 'Back to see me, Champion? How kind of you. The ground has not forgotten your footsteps.' })
  });

  // Flint between his statues.
  room('flint-room', 'volcano', [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'jjj++^++jjj',
    '+++++++++++',
    'j+++++++++j',
    '++++rrr++++',
    'j+++rrr+++j',
    '++++rrr++++',
    'j+++rrr+++j',
    '++++rrr++++',
    '++++rrr++++',
    'WWWWWWWWWWW'
  ], 'lucian-room', 'se4-flint', {
    trainers: members('flint', 'flint', [
      ['houndoom', 52, ['flamethrower', 'sludge-bomb', 'dark-pulse', 'sunny-day']],
      ['flareon', 55, ['overheat', 'giga-impact', 'quick-attack', 'will-o-wisp']],
      ['rapidash', 53, ['flare-blitz', 'solar-beam', 'bounce', 'sunny-day']],
      ['infernape', 55, ['flare-blitz', 'thunder-punch', 'mach-punch', 'earthquake']],
      ['magmortar', 57, ['flamethrower', 'thunderbolt', 'solar-beam', 'hyper-beam'], 'sitrus-berry']], {
      name: 'Elite Four Flint',
      before: 'There you are! Volkner has not stopped talking about you since Sunyshore. You woke him up, so now it is my turn. My team only knows one way to fight: all out. Let us burn!',
      defeat: 'Whew! Burned right down to the ashes. Now I see what got Volkner out of that lighthouse.',
      afterScript: [['say', 'Lucian is the last of us. Good luck getting him to put his book down.', { name: 'Elite Four Flint' }]]
    }, { before: 'Champion! Volkner says hello. He also says I will lose again. Let us prove him wrong!' })
  });

  // Lucian in his library.
  room('lucian-room', 'mansion', [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bbb++^++bbb',
    '+++++++++++',
    '+++++++++++',
    'bb++rrr++bb',
    '++++rrr++++',
    'bb++rrr++bb',
    '++++rrr++++',
    'bb++rrr++bb',
    '++++rrr++++',
    'WWWWWWWWWWW'
  ], 'cynthia-room', 'se4-lucian', {
    trainers: members('lucian', 'lucian', [
      ['mr-mime', 50, ['psychic', 'thunderbolt', 'reflect', 'light-screen']],
      ['espeon', 52, ['psychic', 'shadow-ball', 'quick-attack', 'signal-beam']],
      ['bronzong', 51, ['psychic', 'gyro-ball', 'earthquake', 'calm-mind']],
      ['alakazam', 53, ['psychic', 'energy-ball', 'focus-blast', 'recover']],
      ['gallade', 57, ['drain-punch', 'psycho-cut', 'leaf-blade', 'stone-edge'], 'sitrus-berry']], {
      name: 'Elite Four Lucian',
      before: 'One moment, please. I would like to finish this page... There. I am Lucian of the Elite Four. Books have taught me a great deal, but some things are only written in a battle. Shall we read each other?',
      defeat: 'Hm. I did not see that ending coming.',
      afterScript: [['say', 'The Champion is beyond that door. I believe you have met. Do not expect what you remember.', { name: 'Elite Four Lucian' }]]
    }, { before: 'Champion. I have read another whole shelf since we last met. Every book was about how to beat you.' })
  });

  room('cynthia-room', 'champion', [
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
  ], 'sinnoh-fame', 'se4-champion', {
    npcs: [
      { id: 'cynthia', who: 'cynthia', x: 5, y: 4, dir: 'down', if: '!se4-champion' },
      { id: 'rowan', who: 'rowan', x: 5, y: 10, dir: 'up', if: 'scripted' }
    ],
    triggers: [{ x: 0, y: 8, w: 11, h: 1, if: '!se4-champion', script: 'sleague.champion' }]
  });

  G.Maps.def(Object.assign({}, LEAGUE, {
    id: 'sinnoh-fame', palette: 'champion', music: 'center',
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
    signs: { '5,2': 'The Hall of Fame. Sinnoh\'s Champions and their Pokémon are remembered here forever.' },
    npcs: [
      { id: 'cynthia', who: 'cynthia', x: 4, y: 7, dir: 'up', if: 'scripted' },
      { id: 'rowan', who: 'rowan', x: 6, y: 7, dir: 'up', if: 'scripted' }
    ]
  }));

  /** Cynthia's team: Platinum's, six levels lower (exported for the balance test); ten levels up in the rematches. */
  const cynthiaTeam = again => {
    const up = again ? 10 : 0;
    return [['spiritomb', 52 + up, ['dark-pulse', 'psychic', 'silver-wind', 'shadow-ball']],
      ['roserade', 52 + up, ['energy-ball', 'sludge-bomb', 'toxic', 'extrasensory']],
      ['togekiss', 54 + up, ['air-slash', 'aura-sphere', 'water-pulse', 'shock-wave']],
      ['lucario', 54 + up, ['aura-sphere', 'extreme-speed', 'shadow-ball', 'stone-edge']],
      ['milotic', 52 + up, ['surf', 'ice-beam', 'mirror-coat', 'dragon-pulse']],
      ['garchomp', 57 + up, ['dragon-rush', 'earthquake', 'flamethrower', 'giga-impact'], 'sitrus-berry']];
  };
  const CYNTHIA_ITEMS = { 'full-restore': 1 };
  G.SinnohLeague = { cynthiaTeam, CYNTHIA_ITEMS };
  const RUN = [['aaron-room', 'aaron'], ['bertha-room', 'bertha'], ['flint-room', 'flint'], ['lucian-room', 'lucian']];

  /** A new run through Sinnoh's Elite Four: everybody battles again. */
  function start() {
    const F = G.Field;
    for (const [m, id] of RUN) { F.clearFlag('se4-' + id); delete F.save.done[m + ':' + id]; delete F.save.done[m + ':' + id + '2']; }
    F.clearFlag('se4-champion');
  }

  /** The team as it stands, for the Hall of Fame. */
  const remember = S => {
    S.fame = S.fame || [];
    S.fame.push({ at: Date.now(), party: S.party.map(m => ({ sp: m.sp, lvl: m.lvl, nick: m.nick || null, shiny: !!m.shiny })) });
  };

  /** The Champion: Cynthia, Professor Rowan, then the Hall of Fame. */
  async function champion(h) {
    const F = G.Field, me = G.World.player;
    h.face('player', 'up');
    if (F.flag('sinnoh-champion')) { await rematch(h); return; }
    await h.say(T('So you came, {player}. I hoped you would.'), CYNTHIA);
    await h.say(T('I told you I study the old stories of Sinnoh, and that is true. I did not tell you the rest: I am the Champion of this League.'), CYNTHIA);
    await h.say(T('We stood together at the Spear Pillar and in that broken world. Today there is nobody to stop, nothing to save. It is only you, me and our Pokémon.'), CYNTHIA);
    if (me) await h.walkTo('cynthia', me.x, me.y - 1);
    h.face('cynthia', 'player'); h.face('player', 'cynthia');
    await h.say(T('I have looked forward to this since the day we met. Come, and hold nothing back!'), CYNTHIA);
    const out = await h.battle({ id: 'cynthia-champion', who: 'cynthia', cls: 'champion', name: 'Cynthia', prize: 100, leader: true, ai: 'leader', music: 'league',
      team: cynthiaTeam(false), items: CYNTHIA_ITEMS }, {});
    if (out === 'lose') return;
    F.setFlag('se4-champion');
    await h.say(T('...That was the best battle I have had in a very long time. Thank you, {player}. From today, you are the Champion of Sinnoh.'), CYNTHIA);
    if (me) {
      h.place('rowan', 5, 10, 'up');
      h.show('rowan');
      await h.walkTo('rowan', me.x + (me.x < 10 ? 1 : -1), me.y);   // beside you: your Pokémon walks behind you
      h.face('rowan', 'player'); h.face('player', 'rowan');
    }
    await h.say(T('Hm. So it is done. I left my lab to see this with my own eyes, and I am glad I did.'), ROWAN);
    await h.say(T('You came to Sinnoh as a stranger and picked up a Pokémon from my briefcase. Look at what the two of you have done since.'), ROWAN);
    h.face('player', 'cynthia');
    await h.say(T('Come with us, {player}. There is one more room, and only a Champion may enter it.'), CYNTHIA);
    h.hide('rowan');
    await h.warp('sinnoh-fame', 'door');
    await hallOfFame(h);
  }

  /** Once you are Sinnoh's Champion: Cynthia with her team ten levels up; a win, the Hall of Fame again. */
  async function rematch(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    await h.say(T('Welcome back, Champion. I have found a few new stories, and my team has grown stronger. Shall we?'), CYNTHIA);
    if (me) await h.walkTo('cynthia', me.x, me.y - 1);
    h.face('cynthia', 'player'); h.face('player', 'cynthia');
    const out = await h.battle({ id: 'cynthia-champion2', who: 'cynthia', cls: 'champion', name: 'Cynthia', prize: 100, leader: true, ai: 'leader', music: 'league',
      team: cynthiaTeam(true), items: CYNTHIA_ITEMS }, {});
    if (out === 'lose') return;
    F.setFlag('se4-champion');
    await h.say(T('Still the Champion. I will never get tired of this. Come back whenever you like.'), CYNTHIA);
    await h.warp('sinnoh-fame', 'door');
    await h.move('player', ['up', 'up', 'up']);
    remember(S);
    await h.jingle('fame');
    await h.say(T("{player}'s team has entered the Hall of Fame!"));
    await h.warp('barry-house-2f', 'stairs');
  }

  /** Sinnoh's Hall of Fame: the team is remembered, then home to Twinleaf Town and the credits. */
  async function hallOfFame(h) {
    const F = G.Field, S = F.save;
    h.place('cynthia', 4, 7, 'up');
    h.place('rowan', 6, 7, 'up');
    h.show('cynthia');
    h.show('rowan');
    await h.move('player', ['up', 'up', 'up']);
    await h.walkTo('cynthia', 4, 4);
    await h.walkTo('rowan', 6, 4);
    h.face('cynthia', 'player'); h.face('rowan', 'player'); h.face('player', 'cynthia');
    await h.say(T('The names of Sinnoh\'s Champions and their Pokémon are kept in this room for as long as the League stands. Today, yours join them.'), CYNTHIA);
    remember(S);
    F.setFlag('sinnoh-champion');
    h.face('player', 'up');
    await h.jingle('fame');
    await h.say(T("{player}'s team has entered the Hall of Fame!"));
    h.face('player', 'rowan');
    await h.say(T('Sinnoh has its old stories, and now it has a new one. Be sure to write to Birch. He will want to hear all of it.'), ROWAN);
    h.face('player', 'cynthia');
    await h.say(T('Time, space and the lakes are all at peace, thanks to you. Go home and rest, Champion. I will be here when you want another battle.'), CYNTHIA);
    h.hide('cynthia');
    h.hide('rowan');
    await h.warp('barry-house-2f', 'stairs');
    if (G.CreditsUI) await G.CreditsUI.ending(59);
    else F.setFlag('chapter-59-done');
  }

  const WIN = [['sfx', 'door'], ['say', 'The door at the back of the room slid open.']];
  G.Script.def({
    'sleague.start': [['js', start]],
    'sleague.guard': [
      ['say', 'Beyond this door are the Elite Four of Sinnoh. You battle all four in a row, and then the Champion.'],
      ['say', 'Once you go in, there is no coming back until you win or lose.'],
      ['choice', 'Are you ready?', [['say', 'Then go, and good luck!'], ['warp', 'aaron-room', 'door']], [['say', 'Take your time. Heal up and get ready.']]]
    ],
    'sleague.champion': [['js', champion]],
    'sleague.aaron-win': [['setFlag', 'se4-aaron'], ...WIN],
    'sleague.bertha-win': [['setFlag', 'se4-bertha'], ...WIN],
    'sleague.flint-win': [['setFlag', 'se4-flint'], ...WIN],
    'sleague.lucian-win': [['setFlag', 'se4-lucian'], ...WIN]
  });
})();
