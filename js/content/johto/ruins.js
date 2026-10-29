/* ============ ruins.js — the Ruins of Alph ============
 * Chapter 24. South of Route 36 (route36.js: a researcher keeps the way closed until Kurt has made
 * his seven balls, flag kurt-seven). The last earthquake (chapter 23) opened four chambers sealed
 * for ages: Kabuto's (open), Omanyte's (on an island: Surf), Aerodactyl's (past a cracked rock:
 * Rock Smash) and Ho-Oh's (its door opens once the other three are solved). In each, a stone panel
 * in the north wall (a `secret` tile drawn as a tablet in palette `ruins`) is a picture puzzle
 * (G.PuzzleUI, rules G.Puzzle). Solved (flag solved:<chamber>), it slides aside: a fossil was set
 * behind it (Dome Fossil, Helix Fossil, Old Amber), and stairs lead down to the inner chamber,
 * where Unown appear on every step (G.World.wildForm gives their letter: A-K once Kabuto's panel is
 * solved, L-R Omanyte's, S-W Aerodactyl's, X-Z Ho-Oh's, as in Gold and Silver; a caught one sets
 * flag form:201:<letter>). The researcher gives the Unown Report once a panel is solved. With all
 * four solved, the Unown gather in the inner chamber and the chapter ends (`ending(24)`).
 */
(() => {
  const T = s => G.T(s);
  const RESEARCHER = { name: 'Researcher' };
  const CHAMBERS = [
    { id: 'kabuto', dex: 140, letters: 'ABCDEFGHIJK', fossil: 'dome-fossil' },
    { id: 'omanyte', dex: 138, letters: 'LMNOPQR', fossil: 'helix-fossil' },
    { id: 'aerodactyl', dex: 142, letters: 'STUVW', fossil: 'old-amber' },
    { id: 'hooh', dex: 250, letters: 'XYZ', fossil: null }
  ];
  const solved = c => G.Field.flag('solved:' + c.id);
  const RUINS = { loc: 'ruins-of-alph', region: 'johto' };

  // ---------------- outside ----------------
  G.Maps.def(Object.assign({
    id: 'ruins-of-alph', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTTT',
      'T..............S,.......T........T',
      'T...............,.......T........T',
      'T..######..TT...,.HHHH..T.######.T',
      'T..######..TT...,.HHHH..T.######.T',
      'T..##O###.......,.HDHH..T.##O###.T',
      'T....,..........,..,....T........T',
      'T....,..........,..,....k........T',
      'T....,..........,..,....T........T',
      'T....,..........,..,....TTTTTTTTTT',
      'T....,,,,,,,,,,,,,,,,,...........T',
      'T...........,,,,,,,,,,...........T',
      'T.."""""""..,,,,,,,,,,...""""""".T',
      'T.."""""""..,,,,,,,,,,...""""""".T',
      'T..""""""".......,.......""""""".T',
      'T..""""""".......,.......""""""".T',
      'T................,...............T',
      'T.~~~~~~~~~~~~...,...............T',
      'T.~~~~~~~~~~~~TT.,.....######....T',
      'T.~~~.####.~~~TT.,.....######....T',
      'T.~~~.#O##.~~~...,.....##O###....T',
      'T.~~~......~~~...,.......,.......T',
      'T.~~~......~~~...,,,,,,,,,...TT..T',
      'T.~~~......~~~...............TT..T',
      'T.~~~~~~~~~~~~......"""""""""....T',
      'T.~~~~~~~~~~~~......"""""""""....T',
      'T................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'route36', offset: -14 } },
    warps: [
      { x: 5, y: 5, to: 'ruins-kabuto', spot: 'door' },
      { x: 7, y: 20, to: 'ruins-omanyte', spot: 'door' },
      { x: 28, y: 5, to: 'ruins-aerodactyl', spot: 'door' },
      { x: 25, y: 20, to: 'ruins-hooh', spot: 'door', if: ['solved:kabuto', 'solved:omanyte', 'solved:aerodactyl'], locked: 'ruins.sealed' },
      { x: 19, y: 5, to: 'ruins-research', spot: 'door' }
    ],
    spots: { north: [16, 1, 'down'], kabuto: [5, 6, 'down'], omanyte: [7, 21, 'down'], aerodactyl: [28, 6, 'down'], hooh: [25, 21, 'down'],
             research: [19, 6, 'down'] },
    signs: { '15,1': 'Ruins of Alph. Stone chambers built long ago, by no one knows whom. The Research Center is just to the east.' },
    trainers: [
      { id: 'nelson', who: 'psychic', cls: 'psychic', name: 'Nelson', x: 14, y: 15, dir: 'right', sight: 3,
        team: [['xatu', 42], ['girafarig', 41], ['espeon', 43]],
        before: 'The ruins hum with a strange power. My Pokémon and I came here to feel it. Let me show you what we learned!',
        defeat: 'The power of the ruins was not with me today.',
        after: 'Xatu stand still all day, staring at the sun. Some say they can see both the past and the future.' },
      { id: 'ethan', who: 'pokemaniac', cls: 'pokemaniac', name: 'Ethan', x: 21, y: 21, dir: 'left', sight: 4,
        team: [['smeargle', 41], ['lickitung', 41], ['slowking', 43]],
        before: 'I came all this way to see Pokémon shaped like letters! While I wait, look at the ones I already have!',
        defeat: 'My collection was no match for yours...',
        after: 'Smeargle paint their marks all over these ruins. I wonder if they learned it from the old carvings.' }
    ],
    items: [
      { x: 31, y: 2, item: 'rare-candy', flag: 'ruins-rarecandy' },
      { x: 9, y: 23, item: 'pp-up', flag: 'ruins-ppup' },
      { x: 32, y: 25, item: 'ultra-ball', flag: 'ruins-ultraball' }
    ],
    encounters: { walk: '@ruins-of-alph-outside' }
  }, RUINS));

  // ---------------- the Research Center ----------------
  G.Maps.def(Object.assign({
    id: 'ruins-research', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___P___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'ruins-of-alph', spot: 'research' }],
    spots: { door: [4, 7, 'up'] },
    signs: { '0,2': 'Books about the ruins, full of drawings of strange letters.', '1,2': 'Books about the ruins, full of drawings of strange letters.',
             '2,2': 'Books about the ruins, full of drawings of strange letters.', '10,2': 'Books about the ruins, full of drawings of strange letters.' },
    npcs: [
      { id: 'researcher', who: 'scientist', x: 7, y: 4, dir: 'left', script: 'ruins.researcher' },
      { id: 'aide', who: 'scientist', x: 2, y: 5, dir: 'right',
        say: 'The people who built these ruins left no names, only carvings. We think they lived side by side with Pokémon.' }
    ]
  }, RUINS));

  // ---------------- the four chambers ----------------
  function chamber(c) {
    G.Maps.def(Object.assign({
      id: 'ruins-' + c.id, tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', escape: true,
      rows: [
      'WWWWWWWWW',
      'WWWWQWWWW',
      '+++++++++',
      '+++++++++',
      '+W+++++W+',
      '+++++++++',
      '+++++++++',
      '++++X++++'
    ],
      warps: [
        { x: 4, y: 7, to: 'ruins-of-alph', spot: c.id },
        // The panel: closed, walking into it is looking at it; solved, stairs down.
        { x: 4, y: 1, to: 'ruins-inner', spot: c.id, if: 'solved:' + c.id, locked: 'ruins.panel-' + c.id }
      ],
      spots: { door: [4, 7, 'up'], below: [4, 2, 'down'] },
      signs: { '4,1': { script: 'ruins.panel-' + c.id },
               '2,1': 'Rows of strange letters are carved into the wall, worn smooth by time.',
               '6,1': 'Rows of strange letters are carved into the wall, worn smooth by time.' }
    }, RUINS));
  }
  CHAMBERS.forEach(chamber);

  // ---------------- the inner chamber ----------------
  const UNOWN = [[6, 4], [10, 4], [5, 6], [11, 6], [7, 8], [9, 8]].map(([x, y], i) =>
    ({ id: 'unown' + i, who: 'unown', mon: 'unown', x, y, dir: 'down', fixed: true, if: 'scripted' }));
  G.Maps.def(Object.assign({
    id: 'ruins-inner', tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', cave: true, escape: true,
    enter: 'ruins.inner',
    rows: [
      'WWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWW',
      'W+^+++^+++^+++^+W',
      'W+++++++++++++++W',
      'W+++++++W+++++++W',
      'W+++W+++++++W+++W',
      'W+++++++++++++++W',
      'W+++W+++++++W+++W',
      'W+++++++++++++++W',
      'W+++++++++++++++W',
      'WWWWWWWWWWWWWWWWW'
    ],
    warps: CHAMBERS.map((c, i) => ({ x: 2 + 4 * i, y: 2, to: 'ruins-' + c.id, spot: 'below', if: 'solved:' + c.id, locked: 'ruins.slab' })),
    spots: { kabuto: [2, 3, 'down'], omanyte: [6, 3, 'down'], aerodactyl: [10, 3, 'down'], hooh: [14, 3, 'down'] },
    signs: { '8,1': 'Letters cover every wall of this chamber. They look a lot like the Pokémon that drift around in here.' },
    npcs: UNOWN,
    encounters: { walk: '@ruins-of-alph-interior-a' }
  }, RUINS));

  /** Wild Unown: a letter among those the solved panels set free (G.World.wildForm; also G.Ruins.wildForm). */
  function wildForm(sp, map, rng) {
    if (sp !== 201) return null;
    const ls = CHAMBERS.filter(solved).map(c => c.letters).join('');
    return ls ? ls[rng.int(0, ls.length - 1)] : null;
  }
  G.Ruins = { CHAMBERS, wildForm };
  if (G.World) G.World.wildForm = wildForm;

  /** A chamber's stone panel: the puzzle; solved, a fossil and the way down. */
  async function panel(h, c) {
    const F = G.Field;
    if (solved(c)) { await h.say(T('The panel has slid aside. Stone steps lead down into the dark.')); return; }
    await h.say(T('A stone panel, cut into square pieces that are all out of place. Something is carved on it...'));
    if (await h.choice(T('Put the pieces back together?'), {}) !== 0) return;
    const ok = G.PuzzleUI ? await G.PuzzleUI.open({ id: c.id, dex: c.dex }) : true;
    if (!ok) return;
    F.setFlag('solved:' + c.id);
    h.sfx('strength');
    await h.say(T('The last piece clicks into place: a carving of {mon}! With a deep rumble, the panel slides aside.'), { vars: { mon: G.Names.mon(c.dex) } });
    if (c.fossil) {
      F.giveItem(c.fossil, 1);
      const j = h.jingle('item');
      await h.say(T('Something was set in the rock behind it. {player} found {item}!'), { vars: { item: G.Names.item(c.fossil) } });
      await j;
    }
    await h.say(T('Stone steps lead down into the dark.'));
  }

  /** The researcher: the story of the chambers, then the Unown Report. */
  async function researcher(h) {
    const F = G.Field;
    const n = CHAMBERS.filter(solved).length;
    if (!n) {
      await h.say(T('Welcome to the Research Center! The last earthquake shook the ruins, and four chambers that had been sealed for ages opened.'), RESEARCHER);
      await h.say(T('In each one there is a stone panel, cut into pieces that are all out of place. We have tried for weeks, and none of us can put them back together.'), RESEARCHER);
      await h.say(T('Maybe a Trainer with fresh eyes could. The nearest chamber is just to the west. Will you try?'), RESEARCHER);
      return;
    }
    if (!F.count('unown-report')) {
      await h.say(T('You solved a panel? Then that explains the cries we heard from below! Strange Pokémon shaped like letters have appeared in the inner chamber.'), RESEARCHER);
      await h.say(T('We call them Unown. Every one has the shape of a letter. Please record the ones you catch in this.'), RESEARCHER);
      F.giveItem('unown-report', 1);
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('unown-report') } });
      await j;
      await h.say(T('Each panel seems to set other letters free. Solve them all, and who knows what we will find!'), RESEARCHER);
      return;
    }
    if (n < 4) {
      await h.say(T('Panels solved: {n} of 4. They say the door of the Ho-Oh chamber only opens once the other three are whole.'), Object.assign({ vars: { n } }, RESEARCHER));
      return;
    }
    const got = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l => F.flag('form:201:' + l)).length;
    if (got < 26) await h.say(T('All four panels, whole again! Now, can you catch every letter of the Unown? The report keeps count for you.'), RESEARCHER);
    else await h.say(T('All twenty-six letters of the Unown! Thanks to you, we can finally begin to read the walls of the ruins.'), RESEARCHER);
    // Chapter 25: Elm's Eggs (newbark.js).
    if (!F.flag('egg-research')) await h.say(T('Oh, and Professor Elm of New Bark Town called. He has news about Pokémon Eggs, and he would like to see you.'), RESEARCHER);
  }

  /** Into the inner chamber: the Unown; with all four panels solved, they gather and the chapter ends. */
  async function inner(h) {
    const F = G.Field;
    if (!F.flag('unown-seen')) {
      F.setFlag('unown-seen');
      await h.say(T('The air of the chamber stirs. Shapes like letters flit across the walls... Pokémon!'));
    }
    if (!CHAMBERS.every(solved) || F.flag('ruins-done')) return;
    F.setFlag('ruins-done');
    for (const u of UNOWN) h.show(u.id);
    h.sfx('cry');
    await h.say(T('From every corner of the chamber, Unown come gliding out of the stone...'));
    await h.say(T('They circle around you, letter after letter, then sink back into the walls one by one.'));
    for (const u of UNOWN) h.hide(u.id);
    await h.say(T('For a moment the carvings glow. The four panels are whole again, as they were long ago.'));
    if (G.CreditsUI) await G.CreditsUI.ending(24); else F.setFlag('chapter-24-done');
  }

  /** Route 36's sign at the way south: closed until Kurt has made his seven balls. */
  async function routeSign(h) {
    if (G.Field.flag('kurt-seven')) await h.say(T('Ruins of Alph, just to the south. Ancient stone chambers, and the Research Center.'));
    else await h.say(T('Ruins of Alph. Closed while the scientists study the ruins. Thank you for understanding.'));
  }

  const defs = {
    'ruins.researcher': [['js', researcher]],
    'ruins.inner': [['js', inner]],
    'ruins.route36-sign': [['js', routeSign]],
    'ruins.sealed': [['say', 'A great stone door, carved with a bird of many colours. It will not move.']],
    'ruins.slab': [['say', 'A stone slab blocks the stairs. The panel above must still be in pieces.']]
  };
  for (const c of CHAMBERS) defs['ruins.panel-' + c.id] = [['js', h => panel(h, c)]];
  G.Script.def(defs);
})();
