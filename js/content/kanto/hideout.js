/* ============ hideout.js — the Celadon Game Corner and the Rocket Hideout ============
 * Chapter 5, part 1. The Game Corner opens (its slot machines are switched off for repairs);
 * a Team Rocket Grunt guards a poster with a switch behind it that opens a hidden staircase
 * (flag hideout-switch). Under it, the Rocket Hideout: B1F (four Grunts), B2F and B3F (spin
 * tiles: an arrow sends you sliding until a stop tile or a wall; a conveyor along the bottom
 * always takes you back to the stairs), B4F in two halves: the Grunt by the stairs drops the
 * Lift Key, and only the lift reaches the other half, where two guards and Giovanni wait.
 * Giovanni (Onix 25, Rhyhorn 24, Kangaskhan 29, as in the games) leaves the Silph Scope behind
 * (flag hideout-boss), which lets you see the spirits in the Pokémon Tower (tower.js).
 * The spin mazes come from a seeded generator, checked to be solvable without endless loops.
 */
G.Maps.def({
  id: 'celadon-gamecorner', loc: 'celadon-city', tileset: 'indoor', palette: 'corner', music: 'mart', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWQWW',
    'p+++++++++++++++++++',
    '===+++++++++++++++++',
    '++++++++++++++++++++',
    '++sssss++sssss++++++',
    '++++++++++++++++++++',
    '++sssss++sssss++++++',
    '++++++++++++++++++++',
    '++sssss++sssss++++++',
    '++++++++++++++++++++',
    'p++++++++X+++++++++p'
  ],
  warps: [
    { x: 9, y: 11, to: 'celadon', spot: 'gamecorner-door' },
    // The stairs behind the poster: closed until the switch is pressed.
    { x: 17, y: 1, to: 'hideout-b1f', spot: 'stairs', if: 'hideout-switch', locked: 'gamecorner.wall' }
  ],
  spots: { door: [9, 11, 'up'], stairs: [17, 2, 'down'] },
  signs: Object.assign({ '17,1': { script: 'gamecorner.poster' } },
    // Every slot machine says the same.
    ...[5, 7, 9].flatMap(y => [2, 3, 4, 5, 6, 9, 10, 11, 12, 13].map(x => ({ [x + ',' + y]: { script: 'gamecorner.slots' } })))),
  npcs: [
    { id: 'clerk', who: 'clerk', x: 1, y: 2, dir: 'down',
      say: 'Welcome to the Celadon Game Corner! The slot machines are being repaired today, I am afraid. Please come again!' },
    { id: 'gambler', who: 'gambler', x: 3, y: 6, dir: 'up', move: 'look',
      say: 'The man by the poster at the back never plays. He just stands there all day, glaring at people.' },
    { id: 'gambler2', who: 'gambler', x: 10, y: 8, dir: 'up',
      say: 'This machine is switched off, but I am keeping my seat. It is my lucky one!' },
    { id: 'lass', who: 'lass', x: 15, y: 8, move: 'wander', r: 2,
      say: 'People say Team Rocket runs this place. That cannot be true... can it?' }
  ],
  trainers: [
    { id: 'grunt', who: 'rocket', cls: 'team-rocket', x: 17, y: 2, dir: 'down', sight: 0, if: '!done:celadon-gamecorner:grunt',
      team: [['raticate', 20], ['zubat', 20]],
      before: 'What do you want, kid? This poster is none of your business. Beat it!',
      defeat: 'Tch! You are tougher than you look!',
      win: 'gamecorner.grunt-win' }
  ]
});

const HIDEOUT = { loc: 'celadon-city', tileset: 'indoor', palette: 'hideout', music: 'cave', battleBg: 'indoor' };

G.Maps.def(Object.assign({
  id: 'hideout-b1f',
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWeWWW',
    '+^++++++WW+++++++++++++++b',
    '++++++++WW++++++++++++++++',
    '++++++++WW+++WWWWWWWW+++++',
    '+++++++++++++WWWWWWWW+++++',
    'WWWWW++++++++WWWWWWWW+++++',
    'WWWWW++++++++++++++++++WWW',
    '++++++WWWWWWWW+++++++++WWW',
    '++++++WWWWWWWW+++++++++++^',
    '++++++WWWWWWWW++++++++++++',
    '+++++++++++++++++++++++++p',
    'b++++++++++++++++++++++ppp'
  ],
  warps: [
    { x: 1, y: 2, to: 'celadon-gamecorner', spot: 'stairs' },
    { x: 25, y: 9, to: 'hideout-b2f', spot: 'stairs' },
    { x: 22, y: 1, locked: 'hideout.lift-b1f' }
  ],
  spots: { stairs: [1, 3, 'down'], 'from-below': [24, 9, 'left'], lift: [22, 2, 'down'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 4, y: 4, dir: 'right', sight: 3,
      team: [['rattata', 21], ['zubat', 21]],
      before: 'An intruder! How did you find the stairs?!',
      defeat: 'The guy upstairs is in so much trouble...',
      after: 'This hideout goes down a long way. Good luck finding the Boss!' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 21, y: 3, dir: 'left', sight: 4,
      team: [['drowzee', 22], ['machop', 22]],
      before: 'Kids are not allowed down here. I will show you the way out!',
      defeat: 'I am the one being shown out...',
      after: 'The lift needs a key. And no, I do not have it.' },
    { id: 'grunt3', who: 'rocket', cls: 'team-rocket', x: 17, y: 9, dir: 'down', sight: 3,
      team: [['koffing', 22], ['grimer', 22]],
      before: 'Smell that? That is the smell of your defeat!',
      defeat: 'Ugh... It was the smell of mine.',
      after: 'The floors below are full of spinning tiles. They make me dizzy.' },
    { id: 'grunt4', who: 'rocket', cls: 'team-rocket', x: 3, y: 10, dir: 'right', sight: 2,
      team: [['zubat', 21], ['ekans', 21], ['zubat', 21]],
      before: 'Team Rocket never sleeps! Neither do my Zubat!',
      defeat: 'Now they really want to sleep.',
      after: 'We make our money from the Game Corner upstairs. Do not tell anyone!' }
  ],
  items: [
    { x: 0, y: 9, item: 'escape-rope', flag: 'rope' },
    { x: 12, y: 11, item: 'hyper-potion', flag: 'hidden-potion', hidden: true }
  ]
}, HIDEOUT));

G.Maps.def(Object.assign({
  id: 'hideout-b2f',
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWeWWWWWWWWWWWWWWWWWWW',
    '+^++++WLoDoRRDWUDLooRRRW',
    '++++++WDUoLLRoLooUUWDUoW',
    '+++++++DoLRRDWUUWoRooRRW',
    '++++++WoRUoDoUooLDoooDDW',
    '++++++WLRoooWLUoDRUDRWRW',
    '++++++WUoRRRoRRooLooooRW',
    '++++++WDDLLLUDRooDoRDDRW',
    '+++++++ooRoLDoUUoWRoDoLW',
    '++++++WoURDUooooooLRWDDW',
    '++++++WURoLoLDRooULUWWo^',
    '++++++WDULDLDoDUDooWoDoW',
    '+++++++LLLLLLLLLLLLLLLLW',
    'WWWWWWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [
    { x: 1, y: 2, to: 'hideout-b1f', spot: 'from-below' },
    { x: 23, y: 11, to: 'hideout-b3f', spot: 'stairs' },
    { x: 4, y: 1, locked: 'hideout.lift-b2f' }
  ],
  spots: { stairs: [1, 3, 'down'], 'from-below': [22, 11, 'left'], lift: [4, 2, 'down'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 4, y: 6, dir: 'down', sight: 3,
      team: [['machop', 23], ['drowzee', 23]],
      before: 'You will never get through the spinning floor! I tried for an hour!',
      defeat: 'I cannot even beat a kid...',
      after: 'If you get lost on the arrows, the row at the bottom always brings you back here.' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 2, y: 11, dir: 'right', sight: 3,
      team: [['rattata', 22], ['raticate', 24]],
      before: 'Halt! Nobody goes further without beating me first!',
      defeat: 'Fine, fine. Go get dizzy.',
      after: 'The stop tiles are the red ones. Learn to love them.' }
  ],
  items: [
    { x: 22, y: 3, item: 'tm12', flag: 'tm12' },
    { x: 0, y: 12, item: 'moon-stone', flag: 'moon-stone' }
  ]
}, HIDEOUT));

G.Maps.def(Object.assign({
  id: 'hideout-b3f',
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    '+^++++WDRDRRRDLooRDoooLW',
    '++++++WLUDoDDRDDUoooDUUW',
    '+++++++RDRRRoRWDoLRoLUoW',
    '++++++WDRRRooDoooWLDoLRW',
    '++++++WoLDLoRRUURWLDooLW',
    '++++++WLDRRooDRooLDWRRoW',
    '++++++WLWRoRWLDRoDoWURWW',
    '+++++++oUoDRDRoRUooDUDLW',
    '++++++WLRoooooUUDWRoDRRW',
    '++++++WURoUoRoULUDoLWoo^',
    '++++++WoDoUooRRDoRULDooW',
    '+++++++LLLLLLLLLLLLLLLLW',
    'WWWWWWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [
    { x: 1, y: 2, to: 'hideout-b2f', spot: 'from-below' },
    { x: 23, y: 11, to: 'hideout-b4f', spot: 'stairs' }
  ],
  spots: { stairs: [1, 3, 'down'], 'from-below': [22, 11, 'left'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 4, y: 6, dir: 'down', sight: 3,
      team: [['koffing', 23], ['golbat', 23]],
      before: 'You made it through the floor above? Then the next one will finish you!',
      defeat: 'Nothing finishes you, does it?',
      after: 'The Boss is on the lowest floor. You need the lift to reach his room.' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 3, y: 11, dir: 'right', sight: 3,
      team: [['sandshrew', 23], ['arbok', 24]],
      before: 'Our Boss is the strongest Trainer around. You will never even meet him!',
      defeat: 'Maybe you will meet him after all...',
      after: 'One of the guys downstairs carries the Lift Key. He is always losing things.' }
  ],
  items: [
    { x: 21, y: 12, item: 'tm21', flag: 'tm21' },
    { x: 0, y: 7, item: 'rare-candy', flag: 'rare-candy' }
  ]
}, HIDEOUT));

G.Maps.def(Object.assign({
  id: 'hideout-b4f',
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWeWWWWWWWWWWWWWWW',
    'b+++++++++++WW++++++++^b',
    '++++++++++++WW++++++++++',
    '++++++++++++WW++++++++++',
    'WWWWW++WWWWWWW++++WWWW++',
    'WWWWW++WWWWWWW++++WWWW++',
    'b++++++++++bWW++++++++++',
    '++++++++++++WW++++++++++',
    '++++++++++++WW+++++WWWWW',
    '++++++++++++WW+++++WWWWW',
    '++++++++++++WW++++++++++',
    'pp++++++++ppWW++++++++++',
    'WWWWWWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [
    { x: 22, y: 2, to: 'hideout-b3f', spot: 'from-below' },
    { x: 8, y: 1, locked: 'hideout.lift-b4f' }
  ],
  spots: { stairs: [22, 3, 'down'], lift: [8, 2, 'down'] },
  trainers: [
    // The east half, from the stairs: the Grunt who carries the Lift Key.
    { id: 'keyholder', who: 'rocket', cls: 'team-rocket', x: 16, y: 8, dir: 'right', sight: 3,
      team: [['grimer', 24], ['koffing', 25]],
      before: 'Hey! This floor is for Team Rocket only. Out!',
      defeat: 'Whoa! Something fell out of my pocket!',
      win: 'hideout.lift-key',
      after: 'Give back the Lift Key! ...Please?' },
    // The west half, from the lift: the guards and the Boss.
    { id: 'guard1', who: 'rocket', cls: 'team-rocket', x: 4, y: 4, dir: 'right', sight: 2,
      team: [['golbat', 25], ['raticate', 25]],
      before: 'You came down in the lift? Then you will go back up in pieces!',
      defeat: 'The Boss is going to be furious...',
      after: 'The Boss does not like visitors.' },
    { id: 'guard2', who: 'rocket', cls: 'team-rocket', x: 5, y: 8, dir: 'up', sight: 2,
      team: [['drowzee', 25], ['hypno', 26]],
      before: 'Nobody disturbs the Boss. Look into my Hypno\'s eyes and go to sleep!',
      defeat: 'I am the one seeing stars...',
      after: 'Go ahead, then. He is waiting.' },
    { id: 'giovanni', who: 'giovanni', cls: 'boss', name: 'Giovanni', x: 6, y: 10, dir: 'up', sight: 3, ai: 'leader', if: '!hideout-boss',
      team: [['onix', 25], ['rhyhorn', 24], ['kangaskhan', 29]],
      before: 'So a child has found our hideout. I am Giovanni, the leader of Team Rocket. People who meddle in our business always regret it. Let me show you why!',
      defeat: 'Hmph. Such strength, in one so young...',
      win: 'hideout.giovanni-win' }
  ],
  items: [
    { x: 23, y: 11, item: 'tm49', flag: 'tm49' },
    { x: 14, y: 12, item: 'super-potion', flag: 'hidden-potion', hidden: true },
    { x: 2, y: 8, item: 'hyper-potion', flag: 'hyper-potion' }
  ]
}, HIDEOUT));

G.Maps.def(Object.assign({
  id: 'hideout-lift',
  rows: [
    'WWWWWW',
    'WWWWWW',
    '++++P+',
    '++++++',
    '++X+++'
  ],
  // The doors: back out at the floor the lift is on (var hideout-lift).
  warps: [{ x: 2, y: 4, locked: 'hideout.lift-exit' }],
  spots: { door: [2, 3, 'up'] },
  signs: { '4,2': { script: 'hideout.lift-panel' } }
}, HIDEOUT));

(() => {
  const T = s => G.T(s);
  const FLOORS = ['hideout-b1f', 'hideout-b2f', 'hideout-b4f'];

  /** The lift's buttons: B1F, B2F and B4F, with the Lift Key. */
  async function panel(h) {
    const F = G.Field;
    if (!F.count('lift-key')) {
      await h.say(T('The lift will not move. The panel has a keyhole: it needs a key.'));
      return;
    }
    const i = await h.choice(T('Which floor?'), { options: [T('B1F'), T('B2F'), T('B4F'), T('Cancel')] });
    if (!(i >= 0 && i < 3)) return;
    if (F.getVar('hideout-lift') === FLOORS[i]) { await h.say(T('The lift is already on this floor.')); return; }
    F.setVar('hideout-lift', FLOORS[i]);
    h.sfx('lift');
    await h.wait(600);
    await h.say(T('The lift rumbles and stops. The doors open.'));
  }

  /** Stepping into the lift from a floor. */
  const enter = floor => [['setVar', 'hideout-lift', floor], ['warp', 'hideout-lift', 'door']];

  G.Script.def({
    'gamecorner.wall': [],
    'gamecorner.slots': [['say', 'The slot machine is switched off. A sign on it reads: Under repair.']],
    'gamecorner.poster': [
      ['if', 'hideout-switch', [['say', 'Behind the poster, stairs lead down into the dark.']], [
        ['say', 'A big poster of the Game Corner. Hey... there is a switch hidden behind it!'],
        ['choice', 'Press the switch?', [
          ['sfx', 'click'],
          ['setFlag', 'hideout-switch'],
          ['say', 'Click! A hidden staircase opened behind the poster!']
        ], []]
      ]]
    ],
    'gamecorner.grunt-win': [
      ['say', 'Our hideout is in danger! I have to warn the Boss!'],
      ['hide', 'self']
    ],
    'hideout.lift-b1f': enter('hideout-b1f'),
    'hideout.lift-b2f': enter('hideout-b2f'),
    'hideout.lift-b4f': enter('hideout-b4f'),
    'hideout.lift-panel': [['js', panel]],
    'hideout.lift-exit': [['js', h => h.warp(G.Field.getVar('hideout-lift') || 'hideout-b1f', 'lift')]],
    'hideout.lift-key': [
      ['say', 'A key dropped from the Grunt\'s pocket!'],
      ['found', 'lift-key', 1]
    ],
    'hideout.giovanni-win': [
      ['say', 'I underestimated you. Very well: I will leave this hideout... for now.', { name: 'Giovanni' }],
      ['say', 'Keep the Silph Scope, then. It has served its purpose. But remember this: Team Rocket always comes back.', { name: 'Giovanni' }],
      ['fade', 'out'],
      ['setFlag', 'hideout-boss'],
      ['hide', 'giovanni'],
      ['fade', 'in'],
      ['say', 'Giovanni is gone. Something lies on the floor where he stood.'],
      ['found', 'silph-scope', 1]
    ]
  });
})();
