/* ============ losttower.js — the Lost Tower ============
 * Chapter 69. In the south-east of Route 209 (solaceon.js) stands a tower of graves, five floors high. Platinum's
 * Trainers on 2F, 3F and 4F (two of the pairs are double battles), Platinum's items, and on 5F two old women who
 * tend the graves: one gives the Cleanse Tag, the other the Spell Tag (flags tower-cleanse, tower-spell). Once both
 * are given and chapter 68 is done, `ending(69)` (a player who came in the middle of the game sees it on a later
 * visit). Gastly and Zubat on every step, Duskull at night (Platinum's tables). The floors and the words are mine.
 * Left out: the fog of the upper floors (Defog is not in the game), the Dowsing Machine's Honey and Great Ball.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const TOWER = { loc: 'lost-tower', tileset: 'indoor', palette: 'tower', music: 'cave', battleBg: 'indoor', cave: true, escape: true };

  // ---------------- 1F ----------------
  G.Maps.def(Object.assign({
    id: 'lost-tower-1f', rows: [
      'WWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWW',
      '+g+g+g+g++++^+',
      '++++++++++++++',
      '+g+g+g+++++g+g',
      '++++++++++++++',
      '+g+g+g+g++g+g+',
      '++++++++++++++',
      '+g+g++++++g+g+',
      '++++++++++++++',
      '++++++++++++++',
      '++++++X+++++++'
    ],
    encounters: { walk: '@lost-tower-1f' },
    warps: [{ x: 6, y: 11, to: 'route209', spot: 'tower' }, { x: 12, y: 2, to: 'lost-tower-2f', spot: 'down' }],
    spots: { door: [6, 11, 'up'], up: [12, 3, 'down'] },
    signs: { '1,4': 'A gravestone, polished smooth by many hands. "For all the Pokémon who walked beside us."' },
    npcs: [{ id: 'mourner', who: 'lass', x: 9, y: 7, dir: 'up', move: 'look',
             say: 'I come every week to visit my Starly. The old women at the very top keep all the graves clean.' }]
  }, TOWER, SINNOH));

  // ---------------- 2F ----------------
  G.Maps.def(Object.assign({
    id: 'lost-tower-2f', rows: [
      'WWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWW',
      '+^g+g+g+g+++^+',
      '++++++++++++++',
      '+g+g+g++g+g+g+',
      '++++++++++++++',
      '+g+g+g++++++g+',
      '++++++++++++++',
      '+g+g+g++g+g+g+',
      '++++++++++++++',
      '++++++++++++++',
      '++++++++++++++'
    ],
    encounters: { walk: '@lost-tower-2f' },
    warps: [{ x: 12, y: 2, to: 'lost-tower-1f', spot: 'up' }, { x: 1, y: 2, to: 'lost-tower-3f', spot: 'down' }],
    spots: { down: [12, 3, 'down'], up: [1, 3, 'down'] },
    items: [{ x: 1, y: 10, item: 'oval-stone', flag: 'tower-oval-stone' }],
    trainers: [
      { id: 'oliver', who: 'youngster', cls: 'youngster', name: 'Oliver', x: 7, y: 6, dir: 'right', sight: 3,
        before: 'My friends dared me to climb to the top. Battle me, so I have an excuse to stop here!',
        defeat: 'Now I have to keep climbing...',
        after: 'Is it just me, or did that grave move?',
        team: [['mothim', 20, ['tackle', 'protect', 'bug-bite', 'hidden-power']], ['barboach', 19, ['water-sport', 'water-gun', 'mud-bomb', 'amnesia']],
               ['chatot', 21, ['mirror-move', 'sing', 'fury-attack', 'chatter']]] }
    ]
  }, TOWER, SINNOH));

  // ---------------- 3F ----------------
  G.Maps.def(Object.assign({
    id: 'lost-tower-3f', rows: [
      'WWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWW',
      '+^g+g+g+g+++^+',
      '++++++++++++++',
      '+g+g+g++g+g+g+',
      '++++++++++++++',
      '+g+g+g++g+++g+',
      '++++++++++++++',
      '+g+g+g++g+g+g+',
      '++++++++++++++',
      '++++++++++++++',
      '++++++++++++++'
    ],
    encounters: { walk: '@lost-tower-3f' },
    warps: [{ x: 1, y: 2, to: 'lost-tower-2f', spot: 'up' }, { x: 12, y: 2, to: 'lost-tower-4f', spot: 'down' }],
    spots: { down: [1, 3, 'down'], up: [12, 3, 'down'] },
    items: [{ x: 12, y: 10, item: 'revive', flag: 'tower-revive' }],
    trainers: [
      { id: 'leonard', who: 'pokefan', cls: 'pokefan', name: 'Leonard', x: 3, y: 7, dir: 'right', sight: 3, items: { 'full-heal': 1, 'super-potion': 1 },
        before: 'I bring my Pichu here so they are not scared of ghosts. It is not working yet!',
        defeat: 'Brave little things, all the same.',
        after: 'Pikachu was the bravest of them. It still is.',
        team: [['pichu', 19, ['tail-whip', 'thunder-wave', 'sweet-kiss', 'nasty-plot'], 'sitrus-berry'], ['pichu', 19, ['tail-whip', 'thunder-wave', 'sweet-kiss', 'nasty-plot'], 'sitrus-berry'],
               ['pikachu', 22, ['thunder-wave', 'quick-attack', 'double-team', 'slam'], 'sitrus-berry']] },
      { id: 'kirby', who: 'cueball', cls: 'roughneck', name: 'Kirby', x: 10, y: 5, dir: 'down', sight: 2,
        before: 'Do not laugh at my Cleffa. It is tougher than it looks. So am I!',
        defeat: 'You did not laugh. Respect.',
        after: 'I come up here to think. The quiet does me good.',
        team: [['cleffa', 23, ['sing', 'sweet-kiss', 'copycat', 'magical-leaf']]] }
    ]
  }, TOWER, SINNOH));

  // ---------------- 4F ----------------
  G.Maps.def(Object.assign({
    id: 'lost-tower-4f', rows: [
      'WWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWW',
      '+^g+g+g+g+++^+',
      '++++++++++++++',
      '+g+g+g++g+g+g+',
      '++++++++++++++',
      '+g+g+g++g+++g+',
      '++++++++++++++',
      '+g+g+g++g+g+g+',
      '++++++++++++++',
      '++++++++++++++',
      '++++++++++++++'
    ],
    encounters: { walk: '@lost-tower-4f' },
    warps: [{ x: 12, y: 2, to: 'lost-tower-3f', spot: 'up' }, { x: 1, y: 2, to: 'lost-tower-5f', spot: 'down' }],
    spots: { down: [12, 3, 'down'], up: [1, 3, 'down'] },
    items: [{ x: 7, y: 10, item: 'tm27', flag: 'tower-tm27' }],
    trainers: [
      { id: 'beth-bob', who: 'belle', cls: 'belle-pa', name: 'Beth & Bob', x: 10, y: 6, dir: 'left', sight: 3, double: true,
        partner: { who: 'pa', x: 10, y: 7, dir: 'left' }, team: [['ponyta', 23, ['tail-whip', 'ember', 'flame-wheel', 'stomp']], ['ponyta', 23, ['tail-whip', 'ember', 'flame-wheel', 'stomp']]],
        before: 'Pa and I raised these two Ponyta from foals. Let us show you how they run!',
        defeat: 'They ran their best. That is what counts.',
        after: 'We came to visit the old farm horse. Well, the old farm Rapidash.' },
      { id: 'rebekah', who: 'pokefan', cls: 'pokefan', name: 'Rebekah', x: 4, y: 5, dir: 'down', sight: 2, items: { 'full-heal': 1, 'super-potion': 1 },
        before: 'My Bonsly cries when it sees the graves. A battle cheers it up!',
        defeat: 'There, there. You did so well.',
        after: 'Bonsly is smiling again. Thank you.',
        team: [['bonsly', 23, ['low-kick', 'rock-throw', 'mimic', 'block'], 'sitrus-berry']] },
      { id: 'mike-nat', who: 'cooltrainerm', cls: 'young-couple', name: 'Mike & Nat', x: 3, y: 9, dir: 'right', sight: 3, double: true,
        partner: { who: 'beauty', x: 4, y: 9, dir: 'right' }, team: [['murkrow', 23, ['pursuit', 'haze', 'wing-attack', 'night-shade']], ['misdreavus', 23, ['astonish', 'confuse-ray', 'mean-look', 'psybeam']]],
        before: 'We came here on a dare. Now we are scared, so we will battle you instead!',
        defeat: 'Even our ghosts were scared of you.',
        after: 'Let us go home. Holding hands. Tightly.' }
    ]
  }, TOWER, SINNOH));

  // ---------------- 5F: the old women ----------------
  G.Maps.def(Object.assign({
    id: 'lost-tower-5f', rows: [
      'WWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWW',
      '+^+g+g+g+g+g++',
      '+++++++g++++++',
      '++++++++++++++',
      '++++++++++++++',
      '+g+g++++++g+g+',
      '++++++++++++++',
      '+g+g+g++g+g+g+',
      '++++++++++++++',
      '++++++++++++++',
      '++++++++++++++'
    ],
    encounters: { walk: '@lost-tower-5f' },
    warps: [{ x: 1, y: 2, to: 'lost-tower-4f', spot: 'up' }],
    spots: { down: [1, 3, 'down'] },
    signs: { '7,3': 'The biggest grave in the tower. Fresh flowers are laid before it every day.' },
    npcs: [
      { id: 'granny-l', who: 'granny', x: 5, y: 5, dir: 'down', script: 'tower.granny-l' },
      { id: 'granny-r', who: 'granny', x: 9, y: 5, dir: 'down', script: 'tower.granny-r' }
    ]
  }, TOWER, SINNOH));

  // ---------------- The old women's gifts; the end of the chapter ----------------
  async function give(h, item) {
    G.Field.giveItem(item, 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item(item) } });
    await j;
  }
  async function end(h) {
    const F = G.Field;
    if (!F.flag('tower-cleanse') || !F.flag('tower-spell') || !F.flag('chapter-68-done') || F.flag('chapter-69-done')) return;
    // The end of the sixty-ninth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(69); else F.setFlag('chapter-69-done');
  }
  async function grannyL(h) {
    const F = G.Field;
    if (!F.flag('tower-cleanse')) {
      await h.say(T('You climbed all the way up to pay your respects? Bless you. Take this. It keeps wild Pokémon from bothering you.'));
      await give(h, 'cleanse-tag');
      F.setFlag('tower-cleanse');
    } else await h.say(T('Let the Pokémon at the front of your team hold the Cleanse Tag, and fewer wild ones will come near.'));
    await end(h);
  }
  async function grannyR(h) {
    const F = G.Field;
    if (!F.flag('tower-spell')) {
      await h.say(T('The spirits here are gentle, but they like to play tricks. Here, a tag with their power in it.'));
      await give(h, 'spell-tag');
      F.setFlag('tower-spell');
    } else await h.say(T('A Pokémon holding the Spell Tag hits harder with Ghost-type moves. The spirits lend it a hand.'));
    await end(h);
  }

  G.Script.def({ 'tower.granny-l': [['js', grannyL]], 'tower.granny-r': [['js', grannyR]] });
})();
