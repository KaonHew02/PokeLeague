/* ============ lakefront.js — Route 214, Valor Lakefront and Route 213 ============
 * Chapter 49. Route 214 opens south of Veilstone City with the Cobble Badge (veilstone.js): a PI, Collectors,
 * a Ruin Maniac whose tunnel is blocked, two Psychics. Valor Lakefront: the Hotel Grand Lake's lobby and the
 * Seven Stars restaurant; a guard closes the way to Lake Valor. After the bomb at the Great Marsh (pastoria.js,
 * flag marsh-bomb) the grunt stands before the hotel: Croagunk 31 (flag lakefront-grunt), then Crasher Wake
 * sends you back to Barry. Once he is beaten too, Cynthia waits here with a Secret Potion for the Psyduck on Route 210
 * (chapter 50, flag cynthia-potion). Route 213 is a beach, with the hotel's locked cottages, down to Pastoria City.
 * Platinum's Trainers and wild Pokémon.
 * Chapter 76: the Seven Stars restaurant's double battles, as in Platinum. Nine pairs of Trainers of two classes each
 * (`partner: { cls, name }`, field.js: "Rich Boy Roman & Lady Kylie"), five of them a day from 9:00 to 23:00, drawn from
 * the date and the save (G.SevenStars.today(), nothing stored); each pair battles you once a day (their `done` marks are
 * cleared on the first visit of a new day, var ss-day). Beating the day's five, the chef comes over; once chapter 75 is
 * done that ends the chapter (`ending(76)`). The pairs and their Pokémon are Platinum's (Guidestrats); the moves are the
 * game's default ones, the words mine. Left out: Lass Carrie (Serebii lists her three teams, but not her partner).
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const GRUNT = { name: 'Team Galactic Grunt' };
  const WAKE = { name: 'Crasher Wake' };
  const CYNTHIA = { name: 'Cynthia' };

  // ---------------- Route 214 ----------------
  G.Maps.def(Object.assign({
    id: 'route214', loc: 'sinnoh-route-214', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTT,TTTTTTTTTTTTTTT',
      'T.............,,.............T',
      'T.""""""""""..,,S............T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.""""""""""..,,.."""""""""".T',
      'T.............,,.."""""""""".T',
      'T.............,,.."""""""""".T',
      'T.......,,,,,,,,.............T',
      'T.......,,,,,,,,.............T',
      'T.......,,...................T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,."""""""...."""""".T',
      'T.""""".,,............"""""".T',
      'T.......,,...................T',
      'T.......,,,,,,,,,,,,,........T',
      'T.......,,,,,,,,,,,,,........T',
      'T..................,,........T',
      'T."""""""""""""""..,,."""""".T',
      'T."""""""""""""""..,,."""""".T',
      'T."""""""""""""""..,,."""""".T',
      'T."""""""""""""""..,,."""""".T',
      'T."""""""""""""""..,,."""""".T',
      'T."""""""""""""""..,,."""""".T',
      'T."""""""""""""""..,,."""""".T',
      'T..................,,."""""".T',
      'T..................,,."""""".T',
      'T.########....,,,,,,,."""""".T',
      'T.########....,,,,,,,."""""".T',
      'T.########....,,......"""""".T',
      'T.###O####....,,.............T',
      'T.............,,.............T',
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'veilstone', offset: -3 }, south: { map: 'valor-lakefront', offset: -6 } },
    warps: [{ x: 5, y: 41, to: 'spring-path', spot: 'tunnel', if: 'distortion-done', locked: 'route214.tunnel' }],
    spots: { spring: [5, 42, 'down'] },
    signs: { '16,2': 'Route 214. North: Veilstone City. South: Valor Lakefront.' },
    items: [{ x: 26, y: 4, item: 'max-repel', flag: 'route214-repel' }, { x: 3, y: 34, item: 'big-mushroom', flag: 'route214-mushroom' }],
    trainers: [
      { id: 'carlos', who: 'gentleman', cls: 'pi', name: 'Carlos', x: 13, y: 6, dir: 'right', sight: 1, team: [['goldeen', 30]],
        before: 'I am on a case. I followed this Goldeen all the way up the hill. Do not ask how.',
        defeat: 'Case closed... on me.',
        after: 'A good detective notices everything. Somebody has been digging in the cliff to the south.' },
      { id: 'douglas', who: 'pokemaniac', cls: 'collector', name: 'Douglas', x: 16, y: 9, dir: 'left', sight: 1, team: [['jolteon', 24], ['vaporeon', 24], ['flareon', 24]],
        before: 'I collected all the Eevee evolutions I could find. Want to see them up close?',
        defeat: 'My collection! Not a scratch, I hope.',
        after: 'They say Eevee can evolve in new ways here in Sinnoh. I am going to need a bigger shelf.' },
      { id: 'mitchell', who: 'psychic', cls: 'psychic', name: 'Mitchell', x: 10, y: 18, dir: 'left', sight: 1, team: [['duskull', 26], ['kadabra', 26]],
        before: 'I saw this battle in a dream. In the dream, I won.',
        defeat: 'Dreams are not what they used to be.',
        after: 'Something is stirring under Lake Valor. I can feel it in my spoons.' },
      { id: 'abigail', who: 'psychic', cls: 'psychic', name: 'Abigail', x: 7, y: 22, dir: 'right', sight: 1, team: [['chingling', 23], ['drifloon', 25], ['kirlia', 27]],
        before: 'My Pokémon whisper that you are strong. Prove them right!',
        defeat: 'They were right.',
        after: 'The wind from the lake smells strange today.' },
      { id: 'bryan', who: 'hiker', cls: 'ruin-maniac', name: 'Bryan', x: 18, y: 31, dir: 'right', sight: 1, team: [['bronzor', 24], ['cranidos', 26]],
        before: 'My Pokémon come from ruins and fossils. History hits hard!',
        defeat: 'Buried again.',
        after: 'That tunnel in the cliff is mine. I will not stop digging until I find what is down there.' },
      { id: 'brady', who: 'pokemaniac', cls: 'collector', name: 'Brady', x: 21, y: 35, dir: 'left', sight: 1,
        team: [['skorupi', 21], ['tangela', 21], ['yanma', 21], ['carnivine', 21], ['croagunk', 21], ['tropius', 21]],
        before: 'Six Pokémon from the Great Marsh, and every one of them a rare find!',
        defeat: 'All six of them...',
        after: 'I caught them in the Great Marsh at Pastoria. You pay at the gate and throw Safari Balls.' }
    ],
    encounters: { walk: '@sinnoh-route-214-area' }
  }, SINNOH));

  // ---------------- Valor Lakefront ----------------
  G.Maps.def(Object.assign({
    id: 'valor-lakefront', loc: 'valor-lakefront', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTT',
      'TTT.................,,.............T',
      'TTT.................,,S............T',
      'TTT.....EEEEEEEE....,,....BBBBBB...T',
      'TTT.....EEEEEEEE....,,....BBBBBB...T',
      'TTT.....EEEEEEEE....,,....BBBBBB...T',
      'TTT.....EEEEEEEE....,,....BBDBBB...T',
      'TTT.....EEEDEEEE....,,......,......T',
      'TTT........,........,,......,......T',
      'TTT........,.Sfffff.,,......,......T',
      'TTT........,..fffff.,,......,......T',
      'TTT........,........,,......,......T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'TTT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'TTT.................,,.............T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT."""""""""""""...,,.."""""""""".T',
      'TTT.................,,.............T',
      'TTT.................,,.............T',
      'TTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route222', offset: 5 }, north: { map: 'route214', offset: 6 }, south: { map: 'route213', offset: -24 }, west: { map: 'lake-valor', offset: 2 } },
    warps: [
      { x: 11, y: 7, to: 'hotel-grand-lake', spot: 'door' },
      { x: 28, y: 6, to: 'seven-stars', spot: 'door' }
    ],
    spots: { 'hotel-door': [11, 8, 'down'], 'restaurant-door': [28, 7, 'down'] },
    signs: {
      '22,2': 'Valor Lakefront. West: Lake Valor. South: Route 213.',
      '13,9': 'Hotel Grand Lake. Rest by the water, and leave your cares at the door.'
    },
    items: [{ x: 33, y: 2, item: 'tm85', flag: 'lakefront-tm85' }, { x: 5, y: 23, item: 'ultra-ball', flag: 'lakefront-ball' }],
    npcs: [
      // Lake Valor opens with the bomb (chapter 52, lakes.js).
      { id: 'guard', who: 'officer', x: 2, y: 12, dir: 'right', if: '!lake-blast',
        say: 'The way to Lake Valor is closed for now. Guests say something odd is going on at the shore.' },
      // The road east opens when Professor Rowan has heard the story (chapter 57, sunyshore.js).
      { id: 'east1', who: 'officer', x: 35, y: 12, dir: 'left', if: '!rowan-report',
        say: 'The road to Sunyshore City is closed. It will only open when Professor Rowan in Sandgem gives the word.' },
      { id: 'east2', who: 'officer', x: 35, y: 13, dir: 'left', if: '!rowan-report',
        say: 'The road to Sunyshore City is closed. It will only open when Professor Rowan in Sandgem gives the word.' },
      { id: 'lady', who: 'beauty', x: 16, y: 8, move: 'wander', r: 2,
        say: 'People come from all over Sinnoh to stay at the Hotel Grand Lake. The view is lovely.' },
      { id: 'boy', who: 'youngster', x: 24, y: 9, move: 'look',
        say: 'Seven Stars is the best restaurant in Sinnoh. I saved up for a whole year!' },
      { id: 'wake', who: 'wake', x: 16, y: 11, dir: 'left', if: 'scripted' },
      { id: 'cynthia', who: 'cynthia', x: 24, y: 11, dir: 'down', if: ['barry-pastoria', '!cynthia-potion'], script: 'lakefront.cynthia' }
    ],
    trainers: [
      { id: 'grunt-lakefront', who: 'galactic', cls: 'team-galactic', x: 11, y: 9, dir: 'down', sight: 3, if: ['marsh-bomb', '!lakefront-grunt'],
        team: [['croagunk', 31, ['revenge', 'swagger', 'mud-bomb', 'sucker-punch']]],
        before: 'You followed me all the way here? Too bad for you! That bomb was only the start.',
        defeat: 'No! The mission!',
        win: 'lakefront.grunt-win' }
    ],
    encounters: { walk: '@valor-lakefront-area' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'hotel-grand-lake', loc: 'valor-lakefront', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p___________p', '____=====____', '_____________', '__tt_____tt__', '__tt_____tt__', '_____________', '______X______'],
    warps: [{ x: 6, y: 8, to: 'valor-lakefront', spot: 'hotel-door' }],
    spots: { door: [6, 8, 'up'] },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 6, y: 2, dir: 'down',
        say: 'Welcome to the Hotel Grand Lake. I am sorry, every suite is booked this season.' },
      { id: 'guest', who: 'gentleman', x: 1, y: 5, dir: 'right',
        say: 'I come here every year for the lake. This year it looks... restless.' },
      { id: 'girl', who: 'lass', x: 11, y: 7, move: 'look',
        say: 'The cottages on the beach belong to the hotel too. You need a key to get in.' }
    ]
  }, SINNOH));

  // ---------------- The Seven Stars restaurant (chapter 76) ----------------
  const PAIRS = ['roman-kylie', 'eugene-alison', 'emanuel-blythe', 'kendrick-gabriella', 'emilio-kaylee',
                 'leonardo-rebecca', 'ismael-harley', 'darryl-valerie', 'esteban-meredith'];
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  /** Double battles from 9:00 to 23:00, by the device's clock. */
  const open = () => { const h = G.Clock.hour(); return h >= 9 && h < 23; };
  /** The day's five pairs (in PAIRS order), from the date and the save: the same all day. */
  function today() {
    const rng = G.RNG(hash('seven stars ' + G.Clock.day()) ^ (G.Field.save.player.id | 0));
    const pool = PAIRS.slice(), out = [];
    while (out.length < 5) out.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
    return PAIRS.filter(id => out.includes(id));
  }
  const here = id => () => open() && today().includes(id);
  const beaten = id => G.Field.isDone('seven-stars:' + id);
  G.SevenStars = { PAIRS, open, today };

  /** A pair at a table: the first Trainer and the partner beside them (talk to battle, as in Platinum). */
  const pair = (id, x, y, main, partner, team, words) => Object.assign({ id, x, y, dir: 'down', sight: 0, double: true, if: here(id), win: 'sevenstars.won',
    team, partner: Object.assign({ x: x + 1, y, dir: 'down' }, partner) }, main, words);

  G.Maps.def(Object.assign({
    id: 'seven-stars', loc: 'valor-lakefront', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWW',
      'p_bbb_____bbb_p',
      '___=========___',
      '_______________',
      '_tt___tt___tt__',
      '_tt___tt___tt__',
      '_______________',
      '_tt___tt___tt__',
      '_tt___tt___tt__',
      '_______________',
      '_______X_______'
    ],
    warps: [{ x: 7, y: 11, to: 'valor-lakefront', spot: 'restaurant-door' }],
    spots: { door: [7, 11, 'up'] },
    enter: 'sevenstars.enter',
    npcs: [
      { id: 'chef', who: 'gentleman', x: 7, y: 2, dir: 'down', script: 'sevenstars.chef' },
      { id: 'diner', who: 'beauty', x: 5, y: 9, dir: 'left',
        say: 'They say the chef here once cooked for the Champion of Sinnoh.' }
    ],
    trainers: [
      pair('roman-kylie', 3, 5, { who: 'richboy', cls: 'rich-boy', name: 'Roman' }, { who: 'lady', cls: 'lady', name: 'Kylie' },
        [['lickitung', 26], ['cleffa', 24], ['clefairy', 26]],
        { before: 'Our parents own half the hotels on this lake. Shall we see if we own this battle too?',
          defeat: 'Money cannot buy that kind of teamwork, it seems.',
          after: 'Kylie wants dessert now. She always wants dessert after losing.' }),
      pair('eugene-alison', 8, 5, { who: 'pokemaniac', cls: 'collector', name: 'Eugene' }, { who: 'beauty', cls: 'aroma-lady', name: 'Alison' },
        [['feebas', 28], ['roselia', 28]],
        { before: 'My Feebas is the rarest thing in this room. Well, after the soup. Let us battle!',
          defeat: 'My precious Feebas! You were not supposed to be so strong!',
          after: 'Alison says Roselia smells nicer than my Feebas. She is right, but do not tell Feebas.' }),
      pair('emanuel-blythe', 13, 5, { who: 'oldman', cls: 'veteran', name: 'Emanuel' }, { who: 'lass', cls: 'lass', name: 'Blythe' },
        [['machoke', 28], ['chingling', 25], ['bronzor', 28], ['buneary', 25]],
        { before: 'My granddaughter and I eat here every week. And every week we battle someone!',
          defeat: 'Ha! The young ones keep getting stronger.',
          after: 'Blythe is learning fast. One day she will beat me, and then I will retire.' }),
      pair('kendrick-gabriella', 3, 8, { who: 'gentleman', cls: 'pi', name: 'Kendrick' }, { who: 'beauty', cls: 'beauty', name: 'Gabriella' },
        [['rhyhorn', 31], ['finneon', 26]],
        { before: 'I have been watching you since you walked in. A detective notices these things. Battle!',
          defeat: 'I did not see that coming. Some detective I am.',
          after: 'Gabriella is not my partner on the case. Only at dinner.' }),
      pair('emilio-kaylee', 8, 8, { who: 'scientist', cls: 'scientist', name: 'Emilio' }, { who: 'breeder', cls: 'pokemon-breeder', name: 'Kaylee' },
        [['kadabra', 27], ['aipom', 26], ['marill', 26], ['swablu', 26]],
        { before: 'Kaylee raises them, I study them. Let us test our results on you!',
          defeat: 'Interesting. Your results are better than ours.',
          after: 'Kaylee says I think too much and play too little. My Kadabra agrees with her.' }),
      pair('leonardo-rebecca', 13, 8, { who: 'gentleman', cls: 'gentleman', name: 'Leonardo' }, { who: 'socialite', cls: 'socialite', name: 'Rebecca' },
        [['chatot', 27], ['purugly', 27]],
        { before: 'A double battle before the main course. How delightfully civilized!',
          defeat: 'A splendid battle. My compliments to the Trainer.',
          after: 'Chatot will be repeating your name all evening now, I fear.' }),
      pair('ismael-harley', 1, 4, { who: 'artist', cls: 'artist', name: 'Ismael' }, { who: 'beauty', cls: 'beauty', name: 'Harley' },
        [['kricketune', 28], ['psyduck', 26]],
        { before: 'I paint battles, you know. Give me a beautiful one to paint!',
          defeat: 'What colors! I will need a bigger canvas.',
          after: 'Harley thinks my paintings of Psyduck are too yellow. Psyduck is yellow!' }),
      pair('darryl-valerie', 11, 4, { who: 'cameraman', cls: 'cameraman', name: 'Darryl' }, { who: 'reporter', cls: 'reporter', name: 'Valerie' },
        [['magnemite', 26], ['kirlia', 26], ['mr-mime', 26]],
        { before: 'We are doing a story on the best Trainers at the lake. Show the camera what you can do!',
          defeat: 'Did you get that, Darryl? Tell me you got that!',
          after: 'The story will be on the evening news. You might want to comb your hair.' }),
      pair('esteban-meredith', 1, 10, { who: 'youngster', cls: 'school-kid', name: 'Esteban' }, { who: 'pokefan', cls: 'pokefan', name: 'Meredith' },
        [['quagsire', 26], ['pichu', 26], ['pachirisu', 26]],
        { before: 'Miss Meredith is teaching me about cute Pokémon. I am teaching her about battling!',
          defeat: 'I think we both have more to learn.',
          after: 'Meredith says Pichu is the cutest. I say Quagsire. We will never agree.' })
    ]
  }, SINNOH));

  /** The first visit of a new day: every pair can battle you again. */
  function sevenEnter() {
    const F = G.Field, day = G.Clock.day();
    if (F.getVar('ss-day') === day) return;
    for (const id of PAIRS) delete F.save.done['seven-stars:' + id];
    F.setVar('ss-day', day);
  }
  const CHEF = { name: 'Chef' };
  /** The chef: the hours, and the day's pairs. */
  async function chef(h) {
    if (!open()) {
      await h.say(T('Our double battles run from nine in the morning until eleven at night. Do come back then!'), CHEF);
      return;
    }
    const left = today().filter(id => !beaten(id)).length;
    if (!left) await h.say(T('You have battled every pair at our tables today. The whole kitchen is talking about you!'), CHEF);
    else await h.say(T('Welcome to the Seven Stars! Five pairs dine with us today, and each of them would love a double battle.'), CHEF);
    await h.say(T('The pairs change every day, so do come back tomorrow.'), CHEF);
  }
  /** A pair beaten: once all five of the day are, the chef comes over (and, after chapter 75, the chapter ends). */
  async function won(h) {
    const F = G.Field;
    if (today().some(id => !beaten(id))) return;
    await h.say(T('Five double battles in one day! Nobody has done that since we opened. The kitchen is cheering for you!'), CHEF);
    if (!F.flag('chapter-75-done') || F.flag('chapter-76-done')) return;
    // The end of the seventy-sixth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(76); else F.setFlag('chapter-76-done');
  }

  // ---------------- Route 213 ----------------
  G.Maps.def(Object.assign({
    id: 'route213', loc: 'sinnoh-route-213', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTT',
      'T:::::::::::::::::::::::::::::::::::::::::::,,:::::::::T',
      'T:""""":::""""""""""::::::::::HHHH::HHHH::::,,::"""""":T',
      'T:""""":::""""""""""::::::::::HHHH::HHHH::::,,S:"""""":T',
      'T:""""":::""""""""""::::::::::HDHH::HDHH::::,,::"""""":T',
      'T::::::::::::::::::::::::::::::,:::::,::::::,,::"""""":T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,::"""""":T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,::"""""":T',
      'T:::::::::::::::::::::::::::::::::::::::::::::::"""""":T',
      'T:::::::::::::::::::::::::::::::::::::::::::::::"""""":T',
      'T::::::::::::::::::::::::::::::::::::::::::::::::::::::T',
      'T::::::::::::::::::::::::::::::::::::::::::::::::::::::T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'valor-lakefront', offset: 24 }, west: { map: 'pastoria', offset: -8 } },
    warps: [{ x: 31, y: 4, locked: 'route213.cottage' }, { x: 37, y: 4, locked: 'route213.cottage' }],
    signs: { '46,3': 'Route 213. West: Pastoria City. North: Valor Lakefront.' },
    items: [{ x: 52, y: 10, item: 'water-stone', flag: 'route213-stone' }],
    trainers: [
      { id: 'paul', who: 'sailor', cls: 'sailor', name: 'Paul', x: 38, y: 5, dir: 'down', sight: 1, team: [['tentacool', 31], ['pelipper', 31], ['machoke', 34]],
        before: 'The sea air makes a sailor strong. Let me show you!',
        defeat: 'Sunk!',
        after: 'You never know what the tide will bring to this beach.' },
      { id: 'kenneth', who: 'fisherman', cls: 'fisherman', name: 'Kenneth', x: 28, y: 8, dir: 'up', sight: 1, team: [['remoraid', 25], ['remoraid', 25], ['gyarados', 28]],
        before: 'I fish from the beach. Today I caught a battle!',
        defeat: 'It got away...',
        after: 'A Gyarados on the line is no joke. Crasher Wake in Pastoria has one of his own.' },
      { id: 'cyndy', who: 'beauty', cls: 'beauty', name: 'Cyndy', x: 20, y: 5, dir: 'down', sight: 1, team: [['glameow', 29]],
        before: 'My Glameow and I came for the sun, but I never say no to a battle.',
        defeat: 'Oh, my nails!',
        after: 'The hotel cottages have the best view of the sea. If you can get in.' },
      { id: 'jared', who: 'youngster', cls: 'tuber', name: 'Jared', x: 14, y: 8, dir: 'up', sight: 1, team: [['shellos', 25], ['shellos', 25], ['shellos', 26]],
        before: 'I cannot swim without my float, but I can battle!',
        defeat: 'Waaah, my Shellos!',
        after: 'Shellos look different on the other side of the mountain, you know!' },
      { id: 'chelsea', who: 'lass', cls: 'tuber-f', name: 'Chelsea', x: 8, y: 5, dir: 'down', sight: 1, team: [['marill', 28]],
        before: 'Marill floats just like me! Battle!',
        defeat: 'We sank...',
        after: 'My big sister says the Great Marsh is all mud and rare Pokémon.' },
      { id: 'evan', who: 'swimmer', cls: 'swimmer', name: 'Evan', x: 24, y: 14, dir: 'up', sight: 2, swim: true, team: [['golduck', 32], ['golduck', 34]],
        before: 'Swimming clears the head. A battle clears it even more!',
        defeat: 'Glub...',
        after: 'The sea around Sinnoh runs deep. Swim with care.' },
      { id: 'mary', who: 'swimmerf', cls: 'swimmer-f', name: 'Mary', x: 34, y: 15, dir: 'up', sight: 2, swim: true, team: [['finneon', 33], ['pelipper', 33]],
        before: 'Finneon lights my way at night. By day, we battle!',
        defeat: 'Washed ashore!',
        after: 'From out here you can see Pastoria to the west.' }
    ],
    encounters: { walk: '@sinnoh-route-213-area', water: '@sinnoh-route-213-area' }
  }, SINNOH));

  /** The grunt beaten: he runs, and Crasher Wake sends you back to Barry. */
  async function gruntWin(h) {
    const F = G.Field, me = G.World.player;
    await h.say(T('Hmph. It does not matter. Soon the whole of Sinnoh will feel what we can do!'), GRUNT);
    await h.fade('out', 0.4);
    F.setFlag('lakefront-grunt');
    await h.fade('in', 0.4);
    await h.say(T('The grunt ran off toward the lake.'));
    if (me) h.place('wake', me.x + 3, me.y, 'left');
    h.show('wake');
    if (me) { await h.walkTo('wake', me.x + 1, me.y); h.face('wake', 'left'); h.face('player', 'right'); }
    await h.say(T('So that is where he was hiding! Well fought. The marsh is safe, thanks to you.'), WAKE);
    await h.say(T('Your friend Barry is back in Pastoria, and he is itching to see you. Off you go!'), WAKE);
    h.hide('wake');
  }

  G.Script.def({
    'route214.tunnel': [['say', 'Fresh rubble blocks the tunnel. A note says: "Still digging. Come back later!"']],
    'route213.cottage': [['say', 'The cottage is locked. A card on the door says: "Hotel Grand Lake guests only."']],
    'lakefront.grunt-win': [['js', gruntWin]],
    'sevenstars.enter': [['js', sevenEnter]],
    'sevenstars.chef': [['js', chef]],
    'sevenstars.won': [['js', won]],
    'lakefront.cynthia': [
      ['say', 'So you are {player}. I am Cynthia. I study the old stories of Sinnoh, and Professor Rowan told me about you.', CYNTHIA],
      ['say', 'I was heading north, but a crowd of Psyduck is blocking Route 210. Their heads ache so much that they cannot move.', CYNTHIA],
      ['say', 'This Secret Potion will cure them. I have something to see to here by the lake first. Could you take it to them?', CYNTHIA],
      ['fade', 'out', 0.3], ['setFlag', 'cynthia-potion'], ['fade', 'in', 0.3],
      ['giveItem', 'secret-potion', 1],
      ['say', 'Route 210 is north of Solaceon Town. I will meet you there!', CYNTHIA]
    ]
  });
})();
