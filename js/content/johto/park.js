/* ============ park.js — Route 35, the National Park and the Bug-Catching Contest ============
 * Chapter 14. North of Goldenrod City, Route 35 (five Trainers, a pond) leads to the National
 * Park: a fountain, flower beds and tall grass; the way east is Route 36. The officer by the
 * entrance runs the Bug-Catching Contest (G.Contest, contest.js), once a day (var contest-day):
 * the player goes into `contest-park`, a copy of the park with only Bug Pokémon, catches one,
 * and at the end the judge ranks it against three other entrants. Prizes: a Sun Stone, a Moon
 * Stone, a Hyper Potion, else a Super Potion; the Pokémon caught is yours to keep.
 */
G.Maps.def({
  id: 'route35', loc: 'johto-route-35', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTT,,TTTTTTTTTTTT',
    'T.........,,...........T',
    'T.........,,S..........T',
    'T.........,,...........T',
    'T..h......,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.""""""".,,.""""""""..T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.........,,...........T',
    'T.........,,...........T',
    'T.........,,...........T',
    'T.~~~~~~..,,........h..T',
    'T.~~~~~~..,,...........T',
    'T.~~~~~~..,,...........T',
    'T.~~~~~~..,,...........T',
    'T.~~~~~~..,,.""""""""..T',
    'T.~~~~~~..,,.""""""""..T',
    'T.~~~~~~..,,.""""""""..T',
    'T.~~~~~~..,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'TTTTTTT...,,.""""""""..T',
    'TTTTTTT...,,.""""""""..T',
    'TTTTTTT...,,.""""""""..T',
    'TTTTTTT...,,...........T',
    'TTTTTTT...,,..TTTTTTTT.T',
    'TTTTTTT...,,..TTTTTTTT.T',
    'TTTTTTT...,,..TTTTTTTT.T',
    'T.........,,S.TTTTTTTT.T',
    'T.........,,...........T',
    'TTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { south: { map: 'goldenrod', offset: -10 }, north: { map: 'national-park', offset: -6 } },
  signs: {
    '12,37': 'Route 35. Goldenrod City to the south, the National Park to the north.',
    '12,2': 'The National Park is just ahead. The Bug-Catching Contest is held there every day!'
  },
  trainers: [
    { id: 'ivan', who: 'camper', cls: 'camper', name: 'Ivan', x: 9, y: 30, dir: 'right', sight: 3,
      team: [['diglett', 15], ['zubat', 16]],
      before: 'I dug a hole to sleep in last night. Now I am wide awake. Battle!',
      defeat: 'Back into my hole I go...',
      after: 'Diglett pop out of the ground anywhere. You never know where.' },
    { id: 'brooke', who: 'lass', cls: 'picnicker', name: 'Brooke', x: 12, y: 24, dir: 'left', sight: 3,
      team: [['pikachu', 18]],
      before: 'My Pikachu is full of energy today. Let\'s see how much!',
      defeat: 'All that energy, gone in a flash...',
      after: 'Pikachu stores electricity in its cheeks. Do not pinch them!' },
    { id: 'kim', who: 'lass', cls: 'picnicker', name: 'Kim', x: 9, y: 17, dir: 'right', sight: 3,
      team: [['vulpix', 18]],
      before: 'Vulpix\'s tails are so soft. Its fire is not, though!',
      defeat: 'My Vulpix\'s fire went out...',
      after: 'Vulpix grows more tails as it gets older. Six of them!' },
    { id: 'bryan', who: 'birdkeeper', cls: 'bird-keeper', name: 'Bryan', x: 12, y: 11, dir: 'left', sight: 3,
      team: [['pidgey', 16], ['pidgeotto', 18]],
      before: 'My birds fly faster than the wind. Try and keep up!',
      defeat: 'My birds came down to earth...',
      after: 'Pidgey flocks fly over the National Park at dawn. It is a beautiful sight.' },
    { id: 'arnie', who: 'bugcatcher', cls: 'bug-catcher', name: 'Arnie', x: 9, y: 6, dir: 'right', sight: 3,
      team: [['venonat', 19]],
      before: 'I am training for the Bug-Catching Contest. You can be my practice!',
      defeat: 'I need more practice...',
      after: 'In the contest, a high-level Pokémon with lots of HP left scores best. A rare one too!' }
  ],
  items: [
    { x: 21, y: 2, item: 'super-repel', flag: 'route35-repel' },
    { x: 2, y: 28, item: 'nugget', flag: 'route35-nugget', hidden: true }
  ],
  encounters: { walk: '@johto-route-35-area' }
});

// The park: the same ground twice, the everyday park and the contest's (Bug Pokémon only).
const PARK_ROWS = [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T................................T',
    'T."""""""""""TTTTTTTT..."""""""".T',
    'T."""""""""""TTTTTTTT..."""""""".T',
    'T."""""""""""TTTTTTTT..."""""""".T',
    'T."""""""""""TTTTTTTT..."""""""".T',
    'T."""""""""""TTTTTTTT..."""""""".T',
    'T.""""""""""".f....f...."""""""".T',
    'T."""""""""""..........."""""""".T',
    'T..........ff........ff."""""""".T',
    'T..........,,,,,,,,,,,,."""""""".T',
    'T."""""""".,,,,,,,,,,,,..........T',
    'T."""""""".,,,,,,,,,,,,.........hT',
    'T."""""""".,,,,~~~~,,,,..........T',
    'T."""""""".,,,,~~~~,,,,,,,,,,,,,,,',
    'T."""""""".,,,,~~~~,,,,,,,,,,,,,,,',
    'T."""""""".,,,,~~~~,,,,..........T',
    'T."""""""".,,,,,,,,,,,,..........T',
    'Th.........,,,S,,,,,,,,."""""""".T',
    'T..........,,,,,,,,,,,,."""""""".T',
    'T."""""""""ff...,,...ff."""""""".T',
    'T."""""""""""...,,......"""""""".T',
    'T."""""""""""...,,......"""""""".T',
    'T."""""""""""...,,......"""""""".T',
    'T."""""""""""...,,S....."""""""".T',
    'T."""""""""""...,,......"""""""".T',
    'T."""""""""""...,,......"""""""".T',
    'T...............,,...............T',
    'T...............,,...............T',
    'TTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTT'
  ];
const CONTEST_BUGS = [[10, 7, 18, 20], [13, 7, 18, 20], [11, 9, 18, 10], [14, 9, 18, 10], [46, 10, 17, 10], [48, 10, 16, 10],
                      [12, 12, 15, 5], [15, 12, 15, 5], [123, 13, 14, 5], [127, 13, 14, 5]];

G.Maps.def({
  id: 'national-park', loc: 'national-park', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: PARK_ROWS,
  connect: { south: { map: 'route35', offset: 6 }, east: { map: 'route36', offset: 4 } },
  spots: { desk: [15, 24, 'left'] },
  signs: {
    '18,24': 'The National Park. A place for people and Pokémon to relax. Please keep it clean!',
    '14,18': 'The fountain is fed by a spring deep under the park.'
  },
  npcs: [
    { id: 'officer', who: 'officer', x: 14, y: 24, dir: 'right', script: 'contest.desk' },
    { id: 'girl', who: 'lass', x: 20, y: 12, move: 'wander', r: 2,
      say: 'I come here every day to play with my Pokémon. The grass is so soft!' },
    { id: 'man', who: 'gentleman', x: 12, y: 17, move: 'look',
      say: 'Scyther and Pinsir are the stars of the contest. Catch one, and you are sure to win!' },
    { id: 'fan', who: 'pokefan', x: 27, y: 13, move: 'look',
      say: 'East of here, Route 36 runs to Violet City. They say a tree on that road moves by itself!' },
    { id: 'kid', who: 'youngster', x: 6, y: 18, move: 'wander', r: 2,
      say: 'Bug Pokémon are easier to catch when they are weak. But a Pokémon with more HP left scores more in the contest!' }
  ],
  items: [{ x: 31, y: 27, item: 'tm28', flag: 'park-tm28' }],
  encounters: {
    walk: { rate: 25, mons: [[10, 10, 12, 25], [13, 10, 12, 25], [191, 10, 12, 20], [16, 12, 14, 15], [11, 12, 12, 10], [14, 12, 12, 5]],
            night: [[163, 10, 12, 50], [10, 10, 12, 20], [13, 10, 12, 20], [48, 12, 14, 10]] },
    headbutt: '@national-park-area'
  }
});

G.Maps.def({
  id: 'contest-park', loc: 'national-park', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  contest: true,
  rows: PARK_ROWS,
  spots: { start: [16, 22, 'up'] },
  signs: { '18,24': 'The Bug-Catching Contest is on! Catch the best Bug Pokémon you can.', '14,18': 'The fountain is fed by a spring deep under the park.' },
  npcs: [{ id: 'officer', who: 'officer', x: 14, y: 24, dir: 'right', script: 'contest.officer' }],
  encounters: { walk: { rate: 30, mons: CONTEST_BUGS } }
});

(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const OFFICER = { name: 'Officer' };
  const today = () => (G.Clock && G.Clock.day ? G.Clock.day() : '');
  const PRIZE = ['sun-stone', 'moon-stone', 'hyper-potion'];

  async function desk(h) {
    const F = G.Field, C = G.Contest;
    // A contest left halfway (the player flew away): it ends here.
    if (C.on()) { await end(h); return; }
    await h.say(T('Welcome to the National Park! Today we are holding the Bug-Catching Contest.'), OFFICER);
    if (F.getVar('contest-day') === today()) { await h.say(T('Today\'s contest is over. Come back tomorrow!'), OFFICER); return; }
    const lead = F.lead();
    if (!lead) { await h.say(T('You need a Pokémon that can battle to take part.'), OFFICER); return; }
    if (await h.choice(T('Would you like to take part?'), OFFICER) !== 0) { await h.say(T('Maybe next time, then!'), OFFICER); return; }
    await h.say(T('Only your first Pokémon may come with you: {mon}. The others will wait here.'), Object.assign({ vars: { mon: G.Mon.name(lead) } }, OFFICER));
    await h.say(T('Take these: {ball} ×{n}. You have {s} steps to catch the best Bug Pokémon you can!'),
      Object.assign({ vars: { n: C.BALLS, ball: G.Names.item(C.BALL), s: C.STEPS } }, OFFICER));
    C.begin();
    F.setVar('contest-day', today());
    await h.say(T('Ready? Go!'), OFFICER);
    await h.warp('contest-park', 'start');
  }

  async function caught(h) {
    const C = G.Contest, mon = h.ctx.mon, old = C.kept();
    if (!mon) return;
    if (!old) {
      C.keep(mon);
      await h.say(T('{mon} is your entry for the contest!'), { vars: { mon: G.Mon.name(mon) } });
      return;
    }
    const vars = { mon: G.Mon.name(mon), old: G.Mon.name(old) };
    if (await h.choice(T('You already have {old}. Keep {mon} instead?'), { vars }) === 0) {
      C.keep(mon);
      await h.say(T('{mon} is your entry now. {old} went back into the grass.'), { vars });
    } else await h.say(T('{mon} went back into the grass.'), { vars });
  }

  async function end(h) {
    const F = G.Field, C = G.Contest;
    await h.warp('national-park', 'desk');
    await h.say(T('The contest is over! The judges are looking at the Pokémon everyone caught...'), OFFICER);
    const res = C.judge(G.World.rng, [T('Bug Catcher Don'), T('Camper Ed'), T('Picnicker Cindy')], CONTEST_BUGS);
    const line = (text, e) => h.say(text, Object.assign({ vars: { name: e.name, mon: e.mon ? G.Names.mon(e.mon.sp) : '-', n: e.score } }, OFFICER));
    if (res.all[2]) await line(T('Third place: {name}, with {mon}! {n} points.'), res.all[2]);
    if (res.all[1]) await line(T('Second place: {name}, with {mon}! {n} points.'), res.all[1]);
    await line(T('And the winner is... {name}, with {mon}! {n} points!'), res.all[0]);
    const mon = C.finish();
    if (!mon) {
      await h.say(T('You did not catch anything this time. Better luck next time!'), OFFICER);
      return;
    }
    const prize = PRIZE[res.place - 1] || 'super-potion';
    if (res.place <= 3) await h.say(T('Congratulations! You came in place {n}. Here is your prize.'), Object.assign({ vars: { n: res.place } }, OFFICER));
    else await h.say(T('You came in place {n}. Thank you for taking part! Here is a little something.'), Object.assign({ vars: { n: res.place } }, OFFICER));
    F.giveItem(prize, 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item(prize) } });
    await j;
    const S = F.save;
    S.dex.seen[mon.sp] = 1; S.dex.caught[mon.sp] = 1;
    if (F.party().length < 6) F.party().push(mon); else F.toBox(mon);
    await h.say(T('And the {mon} you caught is yours to keep!'), Object.assign({ vars: { mon: G.Mon.name(mon) } }, OFFICER));
  }

  G.Script.def({
    'contest.desk': [['js', desk]],
    'contest.caught': [['js', caught]],
    'contest.officer': [['choice', 'Do you want to end the contest now?', [['call', 'contest.end']], [['say', 'Good luck! Catch a big one!', { name: 'Officer' }]], { name: 'Officer' }]],
    'contest.timeup': [['say', 'Time is up! The contest is over.', { name: 'Officer' }], ['call', 'contest.end']],
    'contest.out-of-balls': [['say', 'You have no Sport Balls left! The contest is over for you.', { name: 'Officer' }], ['call', 'contest.end']],
    'contest.fainted': [['say', 'Your Pokémon cannot battle any more. The contest is over for you.', { name: 'Officer' }], ['call', 'contest.end']],
    'contest.end': [['js', end]]
  });
})();
