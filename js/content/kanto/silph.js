/* ============ silph.js — Silph Co. ============
 * Chapter 6, part 2. Team Rocket holds the eleven floors of Silph Co.'s head office in Saffron
 * City. Stairs join every floor; the lift (with Silph's own panel) stops at 1F, 3F, 5F, 7F, 9F and
 * 11F. Doors marked with a card slot (indoor tile `n`) open with the Card Key from 5F (flags
 * door:<map>:<x>,<y>). On 7F the rival is waiting (flag silph-rival), a worker gives you a Lapras
 * (flag got-lapras), and a teleport pad behind a locked door (tile `w`) leads to the boardroom on
 * 11F, also behind a locked door from the hall. There Giovanni (Nidorino 35, Kangaskhan 34,
 * Rhyhorn 35, Nidoqueen 38; the games' levels minus two or three) battles you; beaten, he leaves
 * Saffron (flag silph-cleared) and the president gives you the Master Ball. 9F has a nurse.
 */
const SILPH = { loc: 'saffron-city', tileset: 'indoor', palette: 'lab', music: 'cave', battleBg: 'indoor' };

G.Maps.def(Object.assign({
  id: 'silph-1f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    'p+++++++++++++^p',
    '++++++++++++++++',
    '++++========++++',
    '++++++++++++++++',
    '++t++++++++++t++',
    '++++++++++++++++',
    '++++++++++++++++',
    '++++++++++++++++',
    'p++++++X+++++++p'
  ],
  warps: [
    { x: 7, y: 10, to: 'saffron', spot: 'silph-door' },
    { x: 7, y: 1, locked: 'silph.lift-1f' },
    { x: 14, y: 2, to: 'silph-2f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'door': [7, 10, 'up'], 'from-above': [14, 3, 'down'] },
  npcs: [
    { id: 'receptionist', who: 'clerk', x: 7, y: 3, dir: 'down', script: 'silph.receptionist' },
    { id: 'worker', who: 'scientist', x: 3, y: 8, move: 'wander', r: 2, if: 'silph-cleared', say: 'Silph Co. is ours again! Back to work... on a Monday, sadly.' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-2f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '++++ttt++ttt++++',
    '++++++++++++++++',
    '++++++++++++++++',
    '++++++++++++++++',
    '++++ttt++ttt++++',
    '++++++++++++++++',
    'P++++++++++++++b'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-2f' },
    { x: 14, y: 2, to: 'silph-1f', spot: 'from-above' },
    { x: 1, y: 2, to: 'silph-3f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [14, 3, 'down'], 'from-above': [1, 3, 'down'] },
  trainers: [
    { id: 'ted', who: 'scientist', cls: 'scientist', name: 'Ted', x: 3, y: 6, dir: 'right', sight: 4,
      team: [['magnemite', 32], ['voltorb', 32], ['magneton', 33]],
      before: 'Who let you in? This floor is for our research!',
      defeat: 'My calculations were wrong...',
      after: 'Team Rocket promised us a bigger lab. I am starting to have doubts.' },
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 12, y: 3, dir: 'left', sight: 4,
      team: [['ekans', 32], ['arbok', 33]],
      before: 'Silph Co. belongs to Team Rocket now. Turn around!',
      defeat: 'You will regret this!',
      after: 'The Boss is on the top floor. Not that you will ever get there.' }
  ],
  items: [
    { x: 15, y: 3, item: 'hp-up', flag: 'hp-up' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-3f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '+++++++++ttttt++',
    '++++++++++++++++',
    'WWWnWWWW++++++++',
    '+++++++W++++++++',
    '+++++++W++++++++',
    '+b+++b+W++++++++',
    '+++++++W++++++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-3f' },
    { x: 1, y: 2, to: 'silph-2f', spot: 'from-above' },
    { x: 14, y: 2, to: 'silph-4f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [1, 3, 'down'], 'from-above': [14, 3, 'down'] },
  trainers: [
    { id: 'jose', who: 'scientist', cls: 'scientist', name: 'Jose', x: 8, y: 5, dir: 'down', sight: 3,
      team: [['electrode', 33], ['weezing', 33]],
      before: 'Careful! Everything on this floor is highly explosive. Including my Pokémon!',
      defeat: 'Boom... no, wait, that was me.',
      after: 'The room behind the locked door needs a Card Key. They keep one on the fifth floor.' },
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 13, y: 7, dir: 'left', sight: 4,
      team: [['raticate', 33], ['hypno', 33]],
      before: 'Halt! Nobody walks these halls without our say-so!',
      defeat: 'Okay, okay, walk wherever you want.',
      after: 'The doors here only open with a Card Key. Good luck finding one!' }
  ],
  items: [
    { x: 3, y: 8, item: 'tm36', flag: 'tm36' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-4f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '++++++++++++++++',
    '+++bbbbbbbbbb+++',
    '++++++++++++++++',
    '++++++++++++++++',
    '+++bbbbbbbbbb+++',
    '++++++++++++++++',
    '++++++++++++++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-4f' },
    { x: 14, y: 2, to: 'silph-3f', spot: 'from-above' },
    { x: 1, y: 2, to: 'silph-5f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [14, 3, 'down'], 'from-above': [1, 3, 'down'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 1, y: 6, dir: 'right', sight: 5,
      team: [['machop', 32], ['drowzee', 32], ['machoke', 33]],
      before: 'We are moving everything out of here. Including you!',
      defeat: 'I will just move myself out, then.',
      after: 'The Boss wants a special Poké Ball they are making here. One that never misses.' },
    { id: 'rodney', who: 'scientist', cls: 'scientist', name: 'Rodney', x: 14, y: 9, dir: 'left', sight: 4,
      team: [['grimer', 32], ['muk', 33]],
      before: 'My research on sludge is almost complete. I need a test subject!',
      defeat: 'Experiment failed...',
      after: 'I only joined Team Rocket for the funding. Is that so wrong?' }
  ],
  items: [
    { x: 15, y: 10, item: 'max-revive', flag: 'max-revive' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-5f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '++tttt++++++++++',
    '++++++++++++++++',
    '+++++++++WWW+WWW',
    '++++++++++++++++',
    '++++++++++++++++',
    '++++++++++P+++++',
    '++++++++++++++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-5f' },
    { x: 1, y: 2, to: 'silph-4f', spot: 'from-above' },
    { x: 14, y: 2, to: 'silph-6f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [1, 3, 'down'], 'from-above': [14, 3, 'down'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 4, y: 5, dir: 'down', sight: 3,
      team: [['golbat', 33], ['arbok', 33]],
      before: 'You again? I mean, who are you? Get out!',
      defeat: 'Have we met? You beat me just the same.',
      after: 'That room has the Card Key. Do not tell anyone I told you.' },
    { id: 'beau', who: 'scientist', cls: 'scientist', name: 'Beau', x: 8, y: 8, dir: 'right', sight: 3,
      team: [['magneton', 34]],
      before: 'The Card Key opens every door in the building. You will never get it!',
      defeat: 'Fine, take it, then.',
      after: 'With the Card Key, try the lift too. It stops on every other floor.' }
  ],
  items: [
    { x: 14, y: 9, item: 'card-key', flag: 'card-key' },
    { x: 0, y: 10, item: 'tm01', flag: 'tm01' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-6f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '+++ttt++++ttt+++',
    '+++ttt++++ttt+++',
    '++++++++++++++++',
    '++++++++++++++++',
    '++++++tttt++++++',
    '++++++++++++++++',
    '++++++++++++++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-6f' },
    { x: 14, y: 2, to: 'silph-5f', spot: 'from-above' },
    { x: 1, y: 2, to: 'silph-7f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [14, 3, 'down'], 'from-above': [1, 3, 'down'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 7, y: 3, dir: 'down', sight: 3,
      team: [['rattata', 32], ['raticate', 33], ['golbat', 33]],
      before: 'This is a restricted area! Restricted by us!',
      defeat: 'Restriction lifted...',
      after: 'Silph Co. workers are locked in their offices. Not my idea, honest.' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 2, y: 9, dir: 'right', sight: 4,
      team: [['cubone', 33], ['marowak', 34]],
      before: 'My Marowak can knock out anybody with its bone. Want to see?',
      defeat: 'Its bone went flying...',
      after: 'Some of us took Pokémon from the Pokémon Tower. I did not like that job.' }
  ],
  items: [
    { x: 15, y: 10, item: 'hyper-potion', flag: 'hyper-potion' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-7f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '++++++++++++++++',
    '++++++++++++++++',
    'WWW+WWW+++WWnWWW',
    '++++++++++W+++++',
    '++++++++++W+++++',
    '++++++++++W++w++',
    '++++++++++W+++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-7f' },
    { x: 1, y: 2, to: 'silph-6f', spot: 'from-above' },
    { x: 14, y: 2, to: 'silph-8f', spot: 'from-below' },
    { x: 13, y: 9, to: 'silph-11f', spot: 'pad' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [1, 3, 'down'], 'from-above': [14, 3, 'down'], 'pad': [13, 9, 'down'] },
  npcs: [
    { id: 'rival', who: 'rival', x: 9, y: 3, dir: 'left', if: 'scripted' },
    { id: 'worker', who: 'scientist', x: 2, y: 9, dir: 'right', script: 'silph.lapras' }
  ],
  // Every way from the stairs to the rest of the floor crosses column 5: the rival meets you there once.
  triggers: [{ x: 5, y: 2, w: 1, h: 9, if: '!silph-rival', script: 'silph.rival' }],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 12, y: 4, dir: 'left', sight: 3,
      team: [['arbok', 34], ['weezing', 34]],
      before: 'The president is talking with the Boss right now. No interruptions!',
      defeat: 'That was an interruption...',
      after: 'There is a teleport pad behind that locked door. It goes somewhere important.' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-8f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '+++b+++++++b++++',
    '+++b+++b+++b++++',
    '+++b+++b+++b++++',
    '+++b+++b+++b++++',
    '+++b+++b+++b++++',
    '+++++++b++++++++',
    '+++++++b++++++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-8f' },
    { x: 14, y: 2, to: 'silph-7f', spot: 'from-above' },
    { x: 1, y: 2, to: 'silph-9f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [14, 3, 'down'], 'from-above': [1, 3, 'down'] },
  trainers: [
    { id: 'parker', who: 'scientist', cls: 'scientist', name: 'Parker', x: 5, y: 3, dir: 'down', sight: 3,
      team: [['koffing', 34], ['weezing', 35]],
      before: 'You found my lab! Now you must breathe my experiments!',
      defeat: 'Cough... cough...',
      after: 'Team Rocket wants the Master Ball. It catches any Pokémon without fail.' },
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 9, y: 9, dir: 'up', sight: 3,
      team: [['machoke', 35]],
      before: 'Lost in the shelves? Let me help you... lose!',
      defeat: 'I am the one who got lost.',
      after: 'The ninth floor has a bed. I nap there when the Boss is not looking.' }
  ],
  items: [
    { x: 0, y: 10, item: 'ultra-ball', flag: 'ultra-ball' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-9f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '++++++++++++++++',
    '+++++++++tttt+++',
    '++++++++++++++++',
    'WWW+WW++++++++++',
    '++++++++++++++++',
    '+h++++++++++++++',
    '++++++++++++++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-9f' },
    { x: 1, y: 2, to: 'silph-8f', spot: 'from-above' },
    { x: 14, y: 2, to: 'silph-10f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [1, 3, 'down'], 'from-above': [14, 3, 'down'] },
  npcs: [
    { id: 'nurse', who: 'nurse', x: 2, y: 9, dir: 'right', script: 'silph.nurse' }
  ],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 8, y: 4, dir: 'down', sight: 2,
      team: [['hypno', 35], ['golbat', 35]],
      before: 'You made it to the ninth floor? Impressive. Now go back down!',
      defeat: 'Going down... me, that is.',
      after: 'The nurse here heals anyone. Even Rockets. She is too kind.' },
    { id: 'ed', who: 'scientist', cls: 'scientist', name: 'Ed', x: 13, y: 8, dir: 'left', sight: 4,
      team: [['electrode', 35]],
      before: 'My Electrode is fully charged. Are you?',
      defeat: 'Fully discharged...',
      after: 'Two more floors and you will meet the Boss. Are you ready?' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-10f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++^+',
    '++++++++++++++++',
    '++++++++++++++++',
    '+++++W++++W+++++',
    '+++++W++++W+++++',
    '++++++++++++++++',
    '+++++W++++W+++++',
    '+++++W++++W+++++',
    '+++++W++++W+++++'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-10f' },
    { x: 14, y: 2, to: 'silph-9f', spot: 'from-above' },
    { x: 1, y: 2, to: 'silph-11f', spot: 'from-below' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [14, 3, 'down'], 'from-above': [1, 3, 'down'] },
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 7, y: 6, dir: 'down', sight: 3,
      team: [['sandslash', 35], ['arbok', 35]],
      before: 'This is the last floor before the Boss! You will go no further!',
      defeat: 'You went further...',
      after: 'The Boss is with the president in the boardroom. Behind a locked door, of course.' }
  ],
  items: [
    { x: 2, y: 9, item: 'tm41', flag: 'tm41' },
    { x: 13, y: 9, item: 'rare-candy', flag: 'rare-candy' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-11f',
  rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWeWWWWWWWW',
    '+^++++++++++++++',
    '++++++++++++++++',
    '++++++++++++++++',
    '++++++++++++++++',
    'WWWWWWWWnWWWWWWW',
    '++++++++++++++++',
    '++++tttttttt++++',
    '++++++++++++++++',
    '++++++++++++++w+'
  ],
  warps: [
    { x: 7, y: 1, locked: 'silph.lift-11f' },
    { x: 1, y: 2, to: 'silph-10f', spot: 'from-above' },
    { x: 14, y: 10, to: 'silph-7f', spot: 'pad' }
  ],
  spots: { 'lift': [7, 2, 'down'], 'from-below': [1, 3, 'down'], 'pad': [14, 10, 'up'] },
  npcs: [
    { id: 'president', who: 'gentleman', x: 2, y: 9, dir: 'right', script: 'silph.president' }
  ],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 6, y: 4, dir: 'right', sight: 3,
      team: [['koffing', 35], ['weezing', 36]],
      before: 'The Boss is busy. Leave a message after the beep! Beep!',
      defeat: 'Message received...',
      after: 'The Boss always gets what he wants. Well... almost always.' },
    { id: 'giovanni', who: 'giovanni', cls: 'boss', name: 'Giovanni', x: 8, y: 7, dir: 'up', sight: 1, ai: 'leader', if: '!silph-cleared',
      team: [['nidorino', 35], ['kangaskhan', 34], ['rhyhorn', 35], ['nidoqueen', 38]],
      before: 'You again. So you are the child who keeps ruining my plans. Silph Co. and its Master Ball will be mine. I will not lose to you twice!',
      defeat: 'Impossible... Beaten again by a child.',
      win: 'silph.giovanni-win' }
  ]
}, SILPH));

G.Maps.def(Object.assign({
  id: 'silph-lift',
  rows: [
    'WWWWWW',
    'WWWWWW',
    '++++P+',
    '++++++',
    '++X+++'
  ],
  warps: [{ x: 2, y: 4, locked: 'silph.lift-exit' }],
  spots: { door: [2, 3, 'up'] },
  signs: { '4,2': { script: 'silph.lift-panel' } }
}, SILPH));

(() => {
  const T = s => G.T(s);
  const RIVAL = { name: '{rival}' };
  const FINAL = { 1: 3, 4: 6, 7: 9 };
  // The rival's team after the starter he picked, as in the games.
  const MIDDLE = { 1: [['gyarados', 35], ['growlithe', 34]], 4: [['exeggcute', 35], ['gyarados', 34]], 7: [['growlithe', 35], ['exeggcute', 34]] };
  const FLOORS = [1, 3, 5, 7, 9, 11];

  /** The rival on 7F. */
  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('silph-rival');
    h.place('rival', 9, 3, 'left');
    h.show('rival');
    await h.say(T("{player}! I knew you'd show up here. Team Rocket? I already beat a bunch of them."), RIVAL);
    await h.walkTo('rival', me.x + 1, me.y);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T("The president is upstairs, but first, let's see who's stronger now!"), RIVAL);
    const st = S.rival.starter;
    const out = await h.battle({ id: 'rival-silph', who: 'rival', name: S.rival.name, prize: 35, ai: 'basic',
      team: [['pidgeot', 35], ...(MIDDLE[st] || MIDDLE[1]), ['alakazam', 33], [FINAL[st] || 3, 37]] }, {});
    if (out === 'lose') return;
    await h.say(T("Tch. Fine, you win this time. I'll leave the Rockets to you."), RIVAL);
    await h.say(T("I'm heading for the Pokémon League. Don't keep me waiting too long. Smell ya later!"), RIVAL);
    h.hide('rival');
  }

  /** The lift: 1F, 3F, 5F, 7F, 9F and 11F. */
  async function panel(h) {
    const F = G.Field;
    const labels = [T('1F'), T('3F'), T('5F'), T('7F'), T('9F'), T('11F'), T('Cancel')];
    const i = await h.choice(T('Which floor?'), { options: labels });
    if (!(i >= 0 && i < FLOORS.length)) return;
    const to = 'silph-' + FLOORS[i] + 'f';
    if (F.getVar('silph-lift') === to) { await h.say(T('The lift is already on this floor.')); return; }
    F.setVar('silph-lift', to);
    h.sfx('lift');
    await h.wait(600);
    await h.say(T('The lift rumbles and stops. The doors open.'));
  }

  const defs = {
    'silph.lift-panel': [['js', panel]],
    'silph.lift-exit': [['js', h => h.warp(G.Field.getVar('silph-lift') || 'silph-1f', 'lift')]],
    'silph.rival': [['js', rival]],
    'silph.receptionist': [
      ['if', 'silph-cleared', [
        ['say', 'Welcome to Silph Co.! Thanks to you, everything is back to normal. Have a lovely day!']
      ], [
        ['say', 'W-welcome to Silph Co... Men in black have taken over the building. The president is trapped upstairs!'],
        ['say', 'Please, if you are a Trainer, can you help us?']
      ]]
    ],
    'silph.lapras': [
      ['if', 'got-lapras', [
        ['say', 'Lapras is a gentle Pokémon. It loves to carry people across the sea. Take good care of it!']
      ], [
        ['say', 'You came to save us? Then please, take this Pokémon. It is safer with you than with Team Rocket.'],
        ['setFlag', 'got-lapras'],
        ['giveMon', 'lapras', 25, { nickname: true }]
      ]]
    ],
    'silph.nurse': [
      ['say', 'You look tired. Rest here a moment, and let me look after your Pokémon.'],
      ['heal'],
      ['jingle', 'heal'],
      ['say', 'There. Your Pokémon are fully healed. Good luck!']
    ],
    'silph.president': [
      ['if', '!silph-cleared', [
        ['say', 'Please... Team Rocket wants our Master Ball. I will never hand it over!', { name: 'Silph President' }]
      ], [
        ['if', 'got-master-ball', [
          ['say', 'The Master Ball catches any wild Pokémon without fail. Save it for a special one!', { name: 'Silph President' }]
        ], [
          ['say', 'You drove Team Rocket out of my company! I cannot thank you enough.', { name: 'Silph President' }],
          ['say', 'Please accept this. It is the only one of its kind: our Master Ball, the perfect Poké Ball.', { name: 'Silph President' }],
          ['setFlag', 'got-master-ball'],
          ['giveItem', 'master-ball', 1],
          ['say', 'It catches any wild Pokémon without fail. Use it wisely!', { name: 'Silph President' }]
        ]]
      ]]
    ],
    'silph.giovanni-win': [
      ['say', 'Hmph. Once again you stand in my way. Very well. Team Rocket will leave Silph Co.', { name: 'Giovanni' }],
      ['say', 'But do not think this is over. We will meet again, child.', { name: 'Giovanni' }],
      ['fade', 'out'],
      ['setFlag', 'silph-cleared'],
      ['hide', 'giovanni'],
      ['fade', 'in']
    ]
  };
  for (let n = 1; n <= 11; n++) defs['silph.lift-' + n + 'f'] = [['setVar', 'silph-lift', 'silph-' + n + 'f'], ['warp', 'silph-lift', 'door']];
  G.Script.def(defs);
})();
