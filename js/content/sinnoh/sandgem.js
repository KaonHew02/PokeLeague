/* ============ sandgem.js — the ferry to Sinnoh, Sandgem Town, Professor Rowan's lab ============
 * Chapter 44, the start of Sinnoh. After the Hoenn League (flag hoenn-champion) Professor Birch passes
 * on a letter from his friend Professor Rowan, who studies how Pokémon evolve (flag sinnoh-invite,
 * littleroot.js); the ferry in Lilycove City (legends.js) then also sails to the pier on Sandgem Town's
 * beach, and back (flag sinnoh-arrived the first time). Sandgem: Rowan's lab (he is out at Lake Verity
 * with his assistant: Dawn for a boy, Lucas for a girl, {assistant}), a Pokémon Center, a Mart, two
 * houses; the road north to Route 202 opens once the Pokédex records Sinnoh (chapter 45: jubilife.js). The lake, the
 * briefcase and Barry are in twinleaf.js; after the battle with Barry, Rowan upgrades the Pokédex for
 * Sinnoh and his assistant gives five Poké Balls (flag sinnoh-dex, G.Sinnoh.dex), then `ending(44)`.
 */
(() => {
  const T = s => G.T(s);
  const ROWAN = { name: 'Prof. Rowan' }, ASSIST = { name: '{assistant}' }, BARRY = { name: 'Barry' }, SAILOR = { name: 'Sailor' };
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  /** The assistant's person: Dawn for a boy, Lucas for a girl. */
  const asst = () => (G.Field.save.player.gender === 'f' ? 'lucas' : 'dawn');

  // ---------------- Sandgem Town ----------------
  G.Maps.def(Object.assign({
    id: 'sandgem', loc: 'sandgem-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTT,TTTTTTTTTTT',
      'T...........,..........T',
      'T..LLLLLL...,...CCCCC..T',
      'T..LLLLLL...,...CCCCC..T',
      'T..LLLLLL...,...CCCCC..T',
      'T..LLLDLL...,...CCDCC..T',
      ',,,,,,,,,,,,,,,,,,,,,,,T',
      ',,,,,,,,,,,,,,,,,,,,,,,T',
      'T......,.......,.......T',
      'T.HHHH.,..ff...,.MMMM..T',
      'T.HHHH.,..ff...,.MMMM..T',
      'T.HDHH.,.......,.MDMM..T',
      'T..,...,....S..,..,....T',
      'T,,,,,,,,,,,,,,,,,,,,..T',
      'T.......HHHH...,.......T',
      'T..ff...HHHH...,...ff..T',
      'T.......HDHH...,.......T',
      'T........,.....,.......T',
      'T::::::::::::::::::::::T',
      'T::::::::::::::::::::::T',
      '~~~~~~~~~~~~~~==~~~~~~~~',
      '~~~~~~~~~~~~~~==~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { west: { map: 'route201', offset: 0 }, north: { map: 'route202', offset: 3 } },
    warps: [
      { x: 6, y: 5, to: 'rowan-lab', spot: 'door' },
      { x: 18, y: 5, to: 'sandgem-center', spot: 'door' },
      { x: 3, y: 11, to: 'sandgem-house', spot: 'door' },
      { x: 18, y: 11, to: 'sandgem-mart', spot: 'door' },
      { x: 9, y: 16, to: 'sandgem-house2', spot: 'door' }
    ],
    spots: { 'lab-door': [6, 6, 'down'], 'center-door': [18, 6, 'down'], 'house-door': [3, 12, 'down'], 'mart-door': [18, 12, 'down'],
             'house2-door': [9, 17, 'down'], pier: [14, 20, 'up'] },
    signs: { '12,12': 'Sandgem Town. A town that smells of the sea and the sand.' },
    npcs: [
      // The road north to Route 202 and Jubilife City opens with the Pokédex for Sinnoh (chapter 45).
      { id: 'worker', who: 'engineer', x: 12, y: 1, dir: 'down', if: '!sinnoh-dex',
        say: 'A tree came down across the road to Jubilife City in last night\'s storm. We are clearing it as fast as we can!' },
      { id: 'girl', who: 'lass', x: 5, y: 8, move: 'wander', r: 2,
        say: 'Professor Rowan studies how Pokémon evolve. He looks stern, but nobody in Sinnoh cares more about Pokémon.' },
      { id: 'man', who: 'fisherman', x: 20, y: 17, move: 'look',
        say: 'The sea south of town is Route 219. The Pokémon that swim out there are a lot tougher than the ones on land.' },
      { id: 'sailor', who: 'sailor', x: 15, y: 20, dir: 'up', script: 'sinnoh.ferry-sandgem' }
    ],
    encounters: { water: '@sinnoh-route-219-area' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'rowan-lab', loc: 'sandgem-town', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbP++++++bbbb', '+++++++++++++', '+++++++++++++', '++++++++ttt++',
           '+++++++++++++', 'bbbb+++++bbbb', '+++++++++++++', '+++++++++++++', 'p+++++++++++p', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'sandgem', spot: 'lab-door' }],
    spots: { door: [6, 11, 'up'], rowan: [6, 4, 'up'], heal: [10, 4, 'up'] },
    signs: { '0,7': 'Research notes: "Some Pokémon evolve only beside a Trainer they trust. What is it that they feel?"',
             '1,7': 'Research notes: "Some Pokémon evolve only beside a Trainer they trust. What is it that they feel?"' },
    npcs: [
      { id: 'rowan', who: 'rowan', x: 6, y: 3, dir: 'down', if: 'sinnoh-start', script: 'sinnoh.rowan' },
      { id: 'aide', who: 'aide', x: 10, y: 3, dir: 'down', script: 'sinnoh.aide' },
      // The assistant and Barry come in with you after Route 201 (shown by the script); the assistant stays.
      { id: 'dawn', who: 'dawn', x: 7, y: 4, dir: 'left', if: ['sinnoh-dex', '!gender=f'], script: 'sinnoh.assistant' },
      { id: 'lucas', who: 'lucas', x: 7, y: 4, dir: 'left', if: ['sinnoh-dex', 'gender=f'], script: 'sinnoh.assistant' },
      { id: 'barry', who: 'barry', x: 5, y: 4, dir: 'right', if: 'scripted' }
    ]
  }, SINNOH));

  G.Maps.center('sandgem-center', {
    loc: 'sandgem-town', exit: { map: 'sandgem', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'The PCs in Sinnoh reach the same storage system as everywhere else. Your boxes are right where you left them.' }]
  }).region = 'sinnoh';

  G.Maps.mart('sandgem-mart', {
    loc: 'sandgem-town', exit: { map: 'sandgem', spot: 'mart-door' },
    stock: ['poke-ball', 'potion', 'antidote', 'paralyze-heal', 'awakening'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'With the road north closed, the whole town is in here stocking up while we wait.' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'sandgem-house', loc: 'sandgem-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'sandgem', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
             say: 'People in Sinnoh say three Pokémon sleep in three lakes. One of them is Lake Verity, just west of here.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'sandgem-house2', loc: 'sandgem-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'sandgem', spot: 'house2-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'boy', who: 'youngster', x: 2, y: 5, move: 'wander', r: 1,
             say: 'Professor Rowan frowns at everybody. But my Bidoof runs to him every time he walks past!' }]
  }, SINNOH));

  // ---------------- the Pokédex for Sinnoh ----------------
  /** After the battle with Barry on Route 201: the Pokédex records Sinnoh, five Poké Balls, the end of the chapter. */
  async function dex(h) {
    const F = G.Field, a = asst();
    h.place(a, 7, 4, 'left'); h.show(a);
    h.place('barry', 5, 4, 'right'); h.show('barry');
    h.face('player', 'up');
    await h.say(T('Now then, {player}. Your Pokédex, if you please.'), ROWAN);
    await h.say(T('...There. It will record the Pokémon of Sinnoh as well. Many of them evolve in ways you will not have seen before.'), ROWAN);
    F.setFlag('sinnoh-dex');
    let j = h.jingle('item');
    await h.say(T("{player}'s Pokédex was upgraded!"));
    await j;
    await h.say(T("Hi! I am {assistant}, the professor's assistant. I help him by studying Pokémon all over Sinnoh."), ASSIST);
    await h.say(T('These are for you. You will need them to catch the Pokémon of Sinnoh!'), ASSIST);
    F.giveItem('poke-ball', 5);
    j = h.jingle('item');
    await h.say(T('{player} received {item} ×{n}!'), { vars: { item: G.Names.item('poke-ball'), n: 5 } });
    await j;
    await h.say(T('And I am off! I am going to see everything in Sinnoh before you do, {player}!'), BARRY);
    h.hide('barry');
    await h.say(T('North of Sandgem, Route 202 leads to Jubilife City. Once the road is cleared, your journey through Sinnoh begins there.'), ROWAN);
    if (G.CreditsUI) await G.CreditsUI.ending(44); else F.setFlag('chapter-44-done');
  }

  async function rowan(h) {
    await h.say(T('Sinnoh has Pokémon found nowhere else, and many that evolve in ways seen nowhere else. Study them well.'), ROWAN);
    await h.say(T('And remember: Pokémon from other regions listen to you only up to the level your Sinnoh badges allow.'), ROWAN);
  }

  G.Script.def({
    // The ferry between Sandgem Town's pier and Lilycove City (the way there: legends.ferry).
    'sinnoh.ferry-sandgem': [
      ['choice', 'The ship sails back south to Lilycove City in Hoenn. Would you like to go?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The ship sounded its horn and put out to sea.'],
        ['say', 'The ship sailed south for days and nights...'],
        ['warp', 'lilycove', 'harbor']
      ], [], SAILOR]
    ],
    'sinnoh.aide': [
      ['if', 'sinnoh-start', [
        ['say', 'Your Pokémon look tired. Let me use the lab\'s machine on them.'],
        ['healAnim'], ['heal'], ['lastHeal', 'heal'],
        ['say', 'All better! Come back any time.']
      ], [
        ['say', 'Professor Rowan? He left for Lake Verity early this morning, with his assistant.'],
        ['say', 'Take Route 201 west out of town. The lake is at the far end of the route, past the way down to Twinleaf Town.'],
        ['say', 'Oh, and you will be staying in Twinleaf, with Barry\'s family. The professor arranged it all.']
      ]]
    ],
    'sinnoh.rowan': [['js', rowan]],
    'sinnoh.assistant': [
      ['say', 'The professor says a Pokédex is filled one meeting at a time. Let\'s both fill ours!', ASSIST]
    ]
  });
  G.Sinnoh = Object.assign(G.Sinnoh || {}, { dex, asst });
})();
