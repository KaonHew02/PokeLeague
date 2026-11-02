/* ============ route101.js — Route 101, Oldale Town, Route 103 ============
 * Chapter 28. Route 101, north of Littleroot Town: the first time you walk in, Professor Birch is
 * being chased by a wild Zigzagoon; you send out Treecko, Torchic or Mudkip (Lv. 5) from his bag
 * and battle it alone (flag birch-saved), then he takes you to his lab (littleroot.js:
 * G.Hoenn.giveStarter). Oldale Town: a Pokémon Center, a Mart, a house; the way west to Route 102
 * is blocked by a man sketching footprints until the Pokédex can record Hoenn (flag hoenn-dex). Route 103, north of Oldale:
 * grass, a pond (Surf), and the rival (May or Brendan, Lv. 5, the starter strong against yours;
 * losing is allowed, flag rival3-met), then back to the lab for the Pokédex (G.Hoenn.dex).
 * Emerald's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const BIRCH = { name: 'Prof. Birch' }, RIVAL3 = { name: '{rival3}' };
  const HOENN = { region: 'hoenn' };
  const STARTERS = [252, 255, 258];

  // ---------------- Route 101 ----------------
  G.Maps.def(Object.assign({
    id: 'route101', loc: 'hoenn-route-101', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTT,,,,TTTTTTTT',
      'T.......,,,,.......T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.......,,,,.......T',
      'Tvvvvvv.,,,,.vvvvvvT',
      'T.......,,,,.......T',
      'T.""""".,,,,.......T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.......,,,,.""""".T',
      'T..TTT..,,,,.......T',
      'T..TTT..,,,,...TTT.T',
      'T..TTT.S,,,,...TTT.T',
      'T.......,,,,.......T',
      'TTTTTTTT,,,,TTTTTTTT'
    ],
    connect: { south: { map: 'littleroot', offset: -2 }, north: { map: 'oldale', offset: -1 } },
    signs: { '7,15': 'Route 101. North: Oldale Town. South: Littleroot Town.' },
    triggers: [{ x: 1, y: 16, w: 18, h: 1, if: '!birch-saved', script: 'hoenn.birch-chase' }],
    npcs: [
      { id: 'birch', who: 'birch', x: 9, y: 13, dir: 'down', if: '!birch-saved', script: 'hoenn.birch-chase' },
      { id: 'zigzagoon', who: 'zigzagoon', mon: 'zigzagoon', x: 10, y: 13, dir: 'left', fixed: true, if: '!birch-saved', script: 'hoenn.birch-chase' }
    ],
    encounters: { walk: '@hoenn-route-101-area' }
  }, HOENN));

  // ---------------- Oldale Town ----------------
  G.Maps.def(Object.assign({
    id: 'oldale', loc: 'oldale-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTT,,,,TTTTTTTTT',
      'T........,,,,........T',
      'T..CCCCC.,,,,........T',
      'T..CCCCC.,,,,.MMMM...T',
      'T..CCCCC.,,,,.MMMM...T',
      'T..CCDCC.,,,,.MDMM...T',
      'T....,...,,,,..,.....T',
      'T,,,,,,,,,,,,,,,,,,,,T',
      'T........,,,,S.......T',
      'T........,,,,.....ff.T',
      ',,,,,,,,,,,,,........T',
      'T........,,,,.HHHH...T',
      'T.ff..ff.,,,,.HHHH...T',
      'T........,,,,.HDHH...T',
      'T,,,,,,,,,,,,,,,,,,,,T',
      'T........,,,,........T',
      'T........,,,,........T',
      'TTTTTTTTT,,,,TTTTTTTTT'
    ],
    connect: { south: { map: 'route101', offset: 1 }, north: { map: 'route103', offset: 0 }, west: { map: 'route102', offset: 3 } },
    warps: [
      { x: 5, y: 5, to: 'oldale-center', spot: 'door' },
      { x: 15, y: 5, to: 'oldale-mart', spot: 'door' },
      { x: 15, y: 13, to: 'oldale-house', spot: 'door' }
    ],
    spots: { 'center-door': [5, 6, 'down'], 'mart-door': [15, 6, 'down'], 'house-door': [15, 14, 'down'] },
    signs: { '13,8': 'Oldale Town. A town where things begin, and where they come back to.' },
    npcs: [
      // Route 102 opens with the Pokédex for Hoenn (the end of chapter 28): then he has finished his drawing.
      { id: 'sketcher', who: 'supernerd', x: 1, y: 10, dir: 'right', if: '!hoenn-dex', script: 'hoenn.sketcher' },
      { id: 'sketcher2', who: 'supernerd', x: 2, y: 9, dir: 'down', if: 'hoenn-dex',
        say: 'My sketch is finished! The road west to Petalburg City is all yours. Mind the footprints!' },
      { id: 'boy', who: 'youngster', x: 11, y: 4, move: 'look',
        say: 'Professor Birch says Hoenn has more water than land. Pokémon that swim must love it here!' },
      { id: 'girl', who: 'lass', x: 5, y: 9, move: 'wander', r: 2,
        say: 'The Pokémon Center heals your Pokémon for free. Pokémon Centers are the same in every region!' },
      { id: 'man', who: 'gentleman', x: 17, y: 16, move: 'look',
        say: 'Route 103 is north of here. Its pond is full of Pokémon, if you can cross the water.' }
    ]
  }, HOENN));

  G.Maps.center('oldale-center', {
    loc: 'oldale-town', exit: { map: 'oldale', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'The PC here connects to the same storage system as the ones in Kanto and Johto. Handy, isn\'t it?' }]
  }).region = 'hoenn';

  G.Maps.mart('oldale-mart', {
    loc: 'oldale-town', exit: { map: 'oldale', spot: 'mart-door' },
    stock: ['poke-ball', 'potion', 'antidote', 'paralyze-heal', 'awakening'],
    npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
             say: 'Potions and Poké Balls: that is all a new Trainer needs. Well, and a little courage!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'oldale-house', loc: 'oldale-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'oldale', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'oldman', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'Zigzagoon zigzag through the grass, picking things up as they go. Sometimes they bring back something nice!' }]
  }, HOENN));

  // ---------------- Route 103 ----------------
  G.Maps.def(Object.assign({
    id: 'route103', loc: 'hoenn-route-103', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T.."""""".......~~~~~~~T',
      'T.."""""".......~~~~~~~T',
      'T..""""""......~~~~~~~~T',
      'T..""""""......~~~~~~~~T',
      'T..............~~~~~~~~T',
      'T,,,,,,,,,,,,,,~~~~~~~~T',
      'T........,,,,..~~~~~~~~T',
      'T."""""".,,,,S.~~~~~~~~T',
      'T."""""".,,,,..~~~~~~~~T',
      'T."""""".,,,,..~~~~~~~~T',
      'T."""""".,,,,..~~~~~~~~T',
      'T."""""".,,,,..........T',
      'T........,,,,..........T',
      'TTTTTTTTT,,,,TTTTTTTTTTT'
    ],
    connect: { south: { map: 'oldale', offset: 0 } },
    signs: { '13,9': 'Route 103. South: Oldale Town.' },
    triggers: [{ x: 1, y: 7, w: 14, h: 1, if: ['hoenn-start', '!rival3-met'], script: 'hoenn.rival103' }],
    npcs: [
      { id: 'may', who: 'may', x: 10, y: 4, dir: 'down', if: ['hoenn-start', '!rival3-met', 'rival3=may'], script: 'hoenn.rival103' },
      { id: 'brendan', who: 'brendan', x: 10, y: 4, dir: 'down', if: ['hoenn-start', '!rival3-met', 'rival3=brendan'], script: 'hoenn.rival103' }
    ],
    items: [{ x: 3, y: 2, item: 'potion', flag: 'route103-potion' }, { x: 22, y: 14, item: 'poke-ball', flag: 'route103-pokeball' }],
    encounters: { walk: '@hoenn-route-103-area', water: '@hoenn-route-103-area' }
  }, HOENN));

  // ---------------- Professor Birch and the Zigzagoon ----------------
  async function birchChase(h) {
    const F = G.Field;
    if (F.flag('birch-saved')) return;
    h.emote('birch', '!');
    await h.say(T('H-help! Somebody, help me!'), BIRCH);
    await h.say(T('You there! This Zigzagoon will not leave me alone! My bag, there on the ground: take a Poké Ball and send out the Pokémon in it!'), BIRCH);
    let k = -1;
    while (!(k >= 0 && k < STARTERS.length)) k = await h.choice(T('Which Pokémon will you send out?'), { options: STARTERS.map(sp => G.Names.mon(sp)) });
    const mon = F.makeMon(STARTERS[k], 5);
    // Only the Pokémon from the bag battles (the player's own team stays in its Poké Balls).
    const out = await h.wild('zigzagoon', 2, { party: [mon], noCatch: true });
    if (out === 'win') await h.say(T('Whew... You saved me! Thank you so much.'), BIRCH);
    else await h.say(T('Whew... It ran off. Thank you for standing up to it!'), BIRCH);
    await h.say(T('I am Professor Birch. And you must be {player}, the Trainer Professor Oak wrote to me about! Come to my lab: we can talk there.'), BIRCH);
    F.setFlag('birch-saved');
    h.hide('birch'); h.hide('zigzagoon');
    await h.warp('birch-lab', 'birch');
    await G.Hoenn.giveStarter(h, mon);
  }

  // ---------------- the rival on Route 103 ----------------
  async function rival103(h) {
    const F = G.Field, S = F.save, who = F.getVar('rival3') || 'may';
    if (F.flag('rival3-met')) return;
    const me = G.World.player;
    h.emote(who, '!');
    if (me) { await h.walkTo(who, me.x, me.y - 1); h.face(who, 'down'); h.face('player', 'up'); }
    await h.say(T('Oh! You must be {player}! Dad told me all about you. I am {rival3}.'), RIVAL3);
    await h.say(T("I am helping my dad keep track of Hoenn's Pokémon. You are the Champion from far away, right?"), RIVAL3);
    await h.say(T('Then let me see how you battle! My Pokémon and I will not go easy on you!'), RIVAL3);
    const out = await h.battle({ id: 'rival3-103', who, name: who === 'brendan' ? 'Brendan' : 'May', prize: 60, ai: 'basic',
      team: [[S.rival3.starter || 255, 5]] }, { canLose: true });
    F.setFlag('rival3-met');
    if (out === 'win') await h.say(T('Wow... You really are strong! Now I see why Dad wanted your help.'), RIVAL3);
    else await h.say(T("I won? Your Pokémon from home did not want to listen, did they? Hoenn's badges will fix that!"), RIVAL3);
    await h.say(T("Let's head back to the lab. Dad will want to hear about this!"), RIVAL3);
    h.hide(who);
    await h.warp('birch-lab', 'birch');
    await G.Hoenn.dex(h);
  }

  G.Script.def({
    'hoenn.birch-chase': [['js', birchChase]],
    'hoenn.rival103': [['js', rival103]],
    'hoenn.sketcher': [
      ['say', 'Shh! Do not step there! I am sketching the footprints of a rare Pokémon.'],
      ['say', 'Route 102 and Petalburg City are that way, but you will have to wait until I am done. It may take a while...']
    ]
  });
})();
