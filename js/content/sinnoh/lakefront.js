/* ============ lakefront.js — Route 214, Valor Lakefront and Route 213 ============
 * Chapter 49. Route 214 opens south of Veilstone City with the Cobble Badge (veilstone.js): a PI, Collectors,
 * a Ruin Maniac whose tunnel is blocked, two Psychics. Valor Lakefront: the Hotel Grand Lake's lobby and the
 * Seven Stars restaurant; a guard closes the way to Lake Valor. After the bomb at the Great Marsh (pastoria.js,
 * flag marsh-bomb) the grunt stands before the hotel: Croagunk 31 (flag lakefront-grunt), then Crasher Wake
 * sends you back to Barry. Once he is beaten too, Cynthia waits here with a Secret Potion for the Psyduck on Route 210
 * (chapter 50, flag cynthia-potion). Route 213 is a beach, with the hotel's locked cottages, down to Pastoria City.
 * Platinum's Trainers and wild Pokémon.
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
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
      'TTT,,,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
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
    connect: { north: { map: 'route214', offset: 6 }, south: { map: 'route213', offset: -24 }, west: { map: 'lake-valor', offset: 2 } },
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

  G.Maps.def(Object.assign({
    id: 'seven-stars', loc: 'valor-lakefront', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p___bbb___p', '___________', '_tt_____tt_', '_tt_____tt_', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'valor-lakefront', spot: 'restaurant-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'chef', who: 'gentleman', x: 5, y: 3, dir: 'down',
        say: 'Tonight we are fully booked, I am afraid. Come back when you have a reservation!' },
      { id: 'diner', who: 'beauty', x: 3, y: 6, dir: 'up',
        say: 'They say the chef here once cooked for the Champion of Sinnoh.' }
    ]
  }, SINNOH));

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
