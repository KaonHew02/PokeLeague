/* ============ route34.js — Route 34 and the Day Care ============
 * Chapter 13. North of Ilex Forest, Route 34 runs up to Goldenrod City: five Trainers and the
 * Day Care. The Day-Care Lady raises up to two of your Pokémon while you walk (G.DayCare,
 * daycare.js: 1 Exp. point a step, ₽100 + ₽100 a level to take one back); her husband waits
 * outside by the yard and tells you how they are doing.
 */
G.Maps.def({
  id: 'route34', loc: 'johto-route-34', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTT,,TTTTTTTTTTTT',
    'T.........,,...........T',
    'TTTTTTT...,,S..........T',
    'TTTTTTT...,,...........T',
    'TTTTTTT...,,...........T',
    'TTTTTTT...,,...........T',
    'TTTTTTT...,,...........T',
    'TTTTTTT...,,...........T',
    'T.........,,...........T',
    'T.........,,...........T',
    'T.........,,.."""""""..T',
    'T.........,,.."""""""..T',
    'T..h......,,.."""""""..T',
    'T.........,,.."""""""..T',
    'T.........,,.."""""""..T',
    'T.........,,.."""""""..T',
    'T.........,,.."""""""..T',
    'T.........,,...........T',
    'T..HHHH...,,...........T',
    'T..HHHH...,,...........T',
    'T..HDHHS..,,...........T',
    'T...,,,,,,,,.....h.....T',
    'T.........,,...........T',
    'T.FFFFFFFF,,...........T',
    'T.F......F,,...........T',
    'T.F......F,,...........T',
    'T.F......F,,...........T',
    'T.F......F,,...........T',
    'T.F......F,,...........T',
    'T.F......F,,.""""""""..T',
    'T.FFFFFFFF,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.........,,.""""""""..T',
    'T.""""""".,,.""""""""..T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.""""""".,,..TTTTTTTT.T',
    'T.........,,..TTTTTTTT.T',
    'T.........,,..TTTTTTTT.T',
    'T.........,,S..........T',
    'T.........,,...........T',
    'TTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { south: { map: 'ilex-forest', offset: -8 }, north: { map: 'goldenrod', offset: -10 } },
  warps: [{ x: 4, y: 20, to: 'daycare', spot: 'door' }],
  spots: { 'daycare-door': [4, 21, 'down'] },
  signs: {
    '12,45': 'Route 34. Ilex Forest to the south, Goldenrod City to the north.',
    '12,2': 'Route 34. Goldenrod City is just ahead.',
    '7,20': 'The Day Care. Let us raise your Pokémon for you!'
  },
  npcs: [
    { id: 'oldman', who: 'oldman', x: 8, y: 22, dir: 'down', script: 'daycare.man' }
  ],
  trainers: [
    { id: 'samuel', who: 'youngster', cls: 'youngster', name: 'Samuel', x: 12, y: 39, dir: 'left', sight: 3,
      team: [['rattata', 9], ['sandshrew', 11], ['spearow', 10]],
      before: 'I have been training on this road all day. Battle me!',
      defeat: 'All that training for nothing...',
      after: 'Goldenrod City is the biggest city in Johto. You could get lost in there!' },
    { id: 'ian', who: 'youngster', cls: 'youngster', name: 'Ian', x: 9, y: 33, dir: 'right', sight: 3,
      team: [['mankey', 11], ['diglett', 12]],
      before: 'My Pokémon are fast and fierce. Ready?',
      defeat: 'Not fast enough...',
      after: 'I want to beat Whitney one day. Everyone says her Miltank is a monster.' },
    { id: 'gina', who: 'lass', cls: 'picnicker', name: 'Gina', x: 13, y: 25, dir: 'left', sight: 4,
      team: [['hoppip', 11], ['hoppip', 11], ['bulbasaur', 14]],
      before: 'A picnic is more fun with a battle! Come on!',
      defeat: 'My picnic blew away...',
      after: 'Hoppip float away on the wind if they do not hold on tight to something.' },
    { id: 'todd', who: 'camper', cls: 'camper', name: 'Todd', x: 8, y: 12, dir: 'right', sight: 3,
      team: [['psyduck', 14]],
      before: 'Camping on Route 34 is great. Battling on Route 34 is even better!',
      defeat: 'I should go back to my tent...',
      after: 'Psyduck always has a headache. Maybe that is why it is so grumpy.' },
    { id: 'brandon', who: 'pokefan', cls: 'pokefan', name: 'Brandon', x: 13, y: 8, dir: 'left', sight: 3,
      team: [['snubbull', 14]],
      before: 'My Snubbull is the cutest in all of Johto! Look how cute it is when it battles!',
      defeat: 'Even when it loses, it is so cute...',
      after: 'Snubbull looks scary, but it is really a big softy. Just like me!' }
  ],
  items: [
    { x: 1, y: 46, item: 'nugget', flag: 'route34-nugget', hidden: true },
    { x: 21, y: 39, item: 'super-potion', flag: 'route34-potion' }
  ],
  encounters: { walk: '@johto-route-34-area' }
});

G.Maps.def({
  id: 'daycare', loc: 'johto-route-34', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'route34', spot: 'daycare-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'lady', who: 'granny', x: 2, y: 4, dir: 'right', script: 'daycare.lady' },
    { id: 'kid', who: 'youngster', x: 8, y: 5, move: 'look',
      say: 'Grandma and Grandpa raise Pokémon for Trainers. When they come back, they are much stronger!' }
  ]
});

(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const LADY = { name: 'Day-Care Lady' }, MAN = { name: 'Day-Care Man' };

  async function leave(h) {
    const D = G.DayCare, F = G.Field;
    if (F.party().length < 2) { await h.say(T('Oh, you only have one Pokémon with you. You will need it on the road!'), LADY); return; }
    const pick = h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
    const i = await pick({ title: T('Leave which Pokémon?'), disabled: (m, k) => !D.canLeave(k) });
    if (i == null) return;
    if (!D.canLeave(i)) { await h.say(T('If you leave that one, you will have no Pokémon able to battle!'), LADY); return; }
    const mon = F.party()[i];
    D.deposit(i);
    await h.say(T('We will raise your {mon} for a while. Come back for it later.'), Object.assign({ vars: { mon: G.Mon.name(mon) } }, LADY));
  }

  async function takeBack(h) {
    const D = G.DayCare, F = G.Field, list = D.list();
    let k = 0;
    if (list.length > 1) {
      const names = list.map(e => G.Mon.name(e.mon) + ' ' + fmt('Lv. {lvl}', { lvl: e.mon.lvl }));
      k = await h.choice(T('Which one would you like back?'), { options: names.concat([T('Cancel')]), name: LADY.name });
      if (k == null || k >= list.length) return;
    }
    const e = list[k], vars = { mon: G.Mon.name(e.mon), n: D.grown(k), price: D.price(k) };
    if (D.grown(k) > 0) await h.say(T('Your {mon} has grown a lot. It went up by {n} levels!'), Object.assign({ vars }, LADY));
    else await h.say(T('Your {mon}? It has not grown much yet.'), Object.assign({ vars }, LADY));
    if (await h.choice(T('You owe us ₽{price}. Take it back?'), Object.assign({ vars }, LADY)) !== 0) return;
    const r = D.withdraw(k);
    if (r === 'party-full') { await h.say(T('You have no room for it in your party.'), LADY); return; }
    if (r === 'money') { await h.say(T('Oh dear, you do not have enough money.'), LADY); return; }
    h.sfx('buy');
    await h.say(T('{player} took back {mon}.'), { vars });
    await h.say(T('Come again!'), LADY);
  }

  async function lady(h) {
    const D = G.DayCare;
    await h.say(T('Hello, dear. My husband and I run the Day Care. We can raise your Pokémon for you.'), LADY);
    const has = D.list().length > 0, room = !D.full();
    const opts = [];
    if (room) opts.push('leave');
    if (has) opts.push('take');
    const label = { leave: T('Leave one'), take: T('Take one back') };
    const i = await h.choice(T('What would you like to do?'), { options: opts.map(o => label[o]).concat([T('Cancel')]), name: LADY.name });
    if (opts[i] === 'leave') await leave(h);
    else if (opts[i] === 'take') await takeBack(h);
    else await h.say(T('Come again!'), LADY);
  }

  async function man(h) {
    const list = G.DayCare.list();
    if (!list.length) { await h.say(T('My wife and I raise Pokémon in our yard. Talk to her inside if you want us to look after one.'), MAN); return; }
    for (const e of list) await h.say(T('Your {mon} is doing fine. It has been running all over the yard.'), Object.assign({ vars: { mon: G.Mon.name(e.mon) } }, MAN));
  }

  G.Script.def({
    'daycare.lady': [['js', lady]],
    'daycare.man': [['js', man]]
  });
})();
