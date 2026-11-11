/* ============ amity.js — Amity Square ============
 * Chapter 72. The gate building in Hearthome City (hearthome.js) opens on Amity Square: its receptionist lets you in
 * only if your lead is one of Platinum's twenty (G.Amity.OK). In the square your lead always walks behind you (map
 * `follower: 'always'`) and every hundred steps it finds a berry (map `everySteps`, a seeded G.RNG). Platinum's Pokémon
 * found accessories and the nine Poffin berries; the game has neither dress-up nor Poffins, so they are the game's own
 * berries here. A gentleman gives one berry a day (the device's date and the player id); `ending(72)` comes from him
 * once chapter 71 is done (the square can be visited in the middle of the game). TM43, TM45, the Spooky Plate and an
 * Amulet Coin lie in the square, as in Platinum. No wild Pokémon, no battles. The square and the words are mine.
 * Left out: the accessories and the Poffin berries, the cave passages of Platinum's square.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  // Platinum's twenty: Pikachu, Clefairy, Jigglypuff, Psyduck, Torchic, Shroomish, Skitty, the three starters and their
  // evolutions, Pachirisu, Drifloon, Buneary, Happiny.
  const OK = [25, 35, 39, 54, 255, 285, 300, 387, 388, 389, 390, 391, 392, 393, 394, 395, 417, 425, 427, 440];
  const okLead = () => { const m = G.Field.lead(); return !!m && OK.includes(m.sp); };
  const BERRIES = [['oran-berry', 30], ['pecha-berry', 12], ['cheri-berry', 12], ['chesto-berry', 12], ['rawst-berry', 12], ['aspear-berry', 12], ['sitrus-berry', 10]];
  const pick = rng => { let r = rng.int(1, 100); for (const [id, w] of BERRIES) { if ((r -= w) <= 0) return id; } return 'oran-berry'; };
  const hash = s => { let x = 2166136261; for (const c of String(s)) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; };

  // ---------------- The gate ----------------
  G.Maps.def(Object.assign({
    id: 'amity-gate', loc: 'hearthome-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p__bb_bb__p', '___________', '___=====___', '___________', '___________', '__X_____X__'],
    warps: [{ x: 2, y: 7, to: 'hearthome', spot: 'amity-door' }, { x: 8, y: 7, to: 'amity-square', spot: 'gate', if: okLead, locked: 'amity.closed' }],
    spots: { door: [2, 7, 'up'], park: [8, 7, 'up'] },
    npcs: [{ id: 'clerk', who: 'clerk', x: 5, y: 3, dir: 'down', fixed: true, script: 'amity.rules' }]
  }, SINNOH));

  // ---------------- The square ----------------
  G.Maps.def(Object.assign({
    id: 'amity-square', loc: 'amity-square', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTT...........HHHH...........TTT',
      'TT...fffff....HHHH...ffffff...TT',
      'T....fffff....HDHH...ffffff....T',
      'T....fffff.....,.....ffffff....T',
      'T..........T...,.S.T...........T',
      'T..............,...............T',
      'T..............,...............T',
      'T..,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T..,........................,..T',
      'T..,....~~~~~~~~~~~~~.......,..T',
      'T..,....~~~~~...~~~~~.......,..T',
      'T..,,,,,=====...====,,,,,,,,,..T',
      'T..,....~~~~~...~~~~~.......,..T',
      'T..,....~~~~~~~~~~~~~.T.....,..T',
      'T..,....~~~~~~~~~~~~~.......,..T',
      'T..,...................ffff.,..T',
      'T..,.....T.............ffff.,..T',
      'T..,........................,..T',
      'T..,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T.....fffffff......fffffff.....T',
      'T.....fffffff......fffffff.....T',
      'TT............................TT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    follower: 'always',
    everySteps: { n: 100, if: okLead, script: 'amity.find' },
    warps: [{ x: 15, y: 3, to: 'amity-gate', spot: 'park' }],
    spots: { gate: [15, 4, 'down'] },
    signs: { '17,5': 'Amity Square. Walk with your Pokémon and enjoy the flowers. Please do not battle here.' },
    items: [{ x: 14, y: 12, item: 'tm43', flag: 'amity-tm43' }, { x: 21, y: 8, item: 'tm45', flag: 'amity-tm45' },
            { x: 28, y: 20, item: 'spooky-plate', flag: 'amity-plate' }, { x: 3, y: 20, item: 'amulet-coin', flag: 'amity-coin' }],
    npcs: [
      { id: 'gentleman', who: 'gentleman', x: 25, y: 6, dir: 'down', script: 'amity.gift' },
      { id: 'girl', who: 'lass', x: 5, y: 6, dir: 'right', move: 'look',
        say: 'My Pikachu and I come here every morning. It always finds something before I do!' },
      { id: 'pikachu', who: 'pikachu', mon: 'pikachu', x: 6, y: 6, dir: 'left', fixed: true, say: 'It flicks its ears and squeaks happily.' },
      { id: 'boy', who: 'youngster', x: 26, y: 15, dir: 'right', move: 'look',
        say: 'Buneary keeps one ear rolled up when it is happy. Today both ears are rolled up!' },
      { id: 'buneary', who: 'buneary', mon: 'buneary', x: 27, y: 15, dir: 'left', fixed: true, say: 'It bounces up and down on the spot.' },
      { id: 'granny', who: 'granny', x: 4, y: 16, dir: 'right', move: 'look',
        say: 'Happiny carries a round white stone everywhere. It thinks it is an Egg, bless it.' },
      { id: 'happiny', who: 'happiny', mon: 'happiny', x: 5, y: 16, dir: 'left', fixed: true, say: 'It hugs its round white stone and smiles at you.' }
    ]
  }, SINNOH));

  // ---------------- The receptionist ----------------
  async function rules(h) {
    const list = OK.map(sp => G.Names.mon(sp)).join(', ');
    await h.say(T('Welcome to Amity Square! In the square, the Pokémon at the front of your team walks with you.'));
    await h.say(T('So that everyone stays safe, only these Pokémon may come in: {list}.'), { vars: { list } });
  }
  async function closed(h) {
    const m = G.Field.lead();
    await h.say(T('I am sorry, {mon} cannot come into the square. Please put one of the Pokémon listed here at the front of your team.'),
      { vars: { mon: m ? G.Mon.name(m) : '' } });
  }

  // ---------------- What the walking Pokémon finds ----------------
  async function find(h) {
    const F = G.Field, V = F.save.vars, m = F.lead();
    V['amity-finds'] = (+V['amity-finds'] || 0) + 1;
    const item = pick(G.RNG(hash((F.save.player.id | 0) + ':' + V['amity-finds'])));
    await h.say(T('{mon} seems to have found something in the grass!'), { vars: { mon: m ? G.Mon.name(m) : '' } });
    F.giveItem(item, 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item(item) } });
    await j;
  }

  // ---------------- The gentleman's berry of the day ----------------
  async function gift(h) {
    const F = G.Field, V = F.save.vars, day = G.Clock.day();
    if (V['amity-gift'] !== day) {
      await h.say(T('Good day! I walk here every day, and every day I find more berries than I can carry. Here, have one.'));
      const item = pick(G.RNG(hash(day + ':' + (F.save.player.id | 0))));
      V['amity-gift'] = day;
      F.giveItem(item, 1);
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item(item) } });
      await j;
    } else await h.say(T('Come back tomorrow, and I will have another berry for you.'));
    if (!F.flag('chapter-71-done') || F.flag('chapter-72-done')) return;
    // The end of the seventy-second chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(72); else F.setFlag('chapter-72-done');
  }

  G.Amity = { OK, okLead };
  G.Script.def({
    'amity.rules': [['js', rules]],
    'amity.closed': [['js', closed]],
    'amity.find': [['js', find]],
    'amity.gift': [['js', gift]]
  });
})();
