/* ============ route219.js — Route 219, Sea Route 220, Route 221 and the gate of Pal Park ============
 * Chapter 71. South of Sandgem Town's beach (sandgem.js) the sea: Route 219 (a sandbar and two Tubers), Sea Route 220
 * (seven Swimmers, small islands with a Max Repel, the Splash Plate and a Carbos) and Route 221 (a beach, a wood with
 * tall grass, a Fisherman, a Collector, two Ace Trainers and two more Swimmers; a Protein, an Ultra Ball, TM81 and a
 * Cleanse Tag). Surf opens it, as in Platinum. At the far end the gate of Pal Park: its receptionist explains that no
 * Pokémon from faraway lands have come yet. The roads can be taken in the middle of the game, so `ending(71)` comes from
 * the receptionist only once chapter 70 is done. Platinum's Trainers and teams (Serebii; the Tubers at the higher of the
 * two levels it lists), PokeAPI's tables. The maps and the words are mine. Left out: Pal Park itself (it needs Pokémon
 * from a Game Boy Advance game), the Dowsing Machine's items, berry trees, Route 221's gifts, the Poké Radar, swarms,
 * Honey trees, rematches.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };

  // ---------------- Route 219: a sandbar in the sea ----------------
  G.Maps.def(Object.assign({
    id: 'route219', loc: 'sinnoh-route-219', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~:::::~::::::~~~~~~',
      '~~~~~::::::::::::::~~~~~',
      '~~~~~:::::::::::#::~~~~~',
      '~~~~~::::::::::::::~~~~~',
      '~~~~~:#::::::::::::~~~~~',
      '~~~~~::::::::::::::~~~~~',
      '~~~~~~::::::~:::::~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'sandgem', offset: 0 }, south: { map: 'route220', offset: 0 } },
    encounters: { water: '@sinnoh-route-219-area' },
    items: [{ x: 17, y: 10, item: 'antidote', flag: 'route219-antidote' }],
    trainers: [
      { id: 'trenton', who: 'youngster', cls: 'tuber', name: 'Trenton', x: 8, y: 11, dir: 'right', sight: 3,
        before: 'My float and me can go anywhere! Even to a battle!',
        defeat: 'My float sprang a leak...',
        after: 'The sea goes on and on down there. Grown-ups swim all the way to the next beach.',
        team: [['shellos', 33, ['mud-bomb', 'hidden-power', 'rain-dance', 'body-slam']]] },
      { id: 'mariel', who: 'lass', cls: 'tuber-f', name: 'Mariel', x: 14, y: 13, dir: 'left', sight: 3,
        before: 'This sandbar is my secret island. You have to battle to visit!',
        defeat: 'Okay, you can visit. Just this once.',
        after: 'Marill and I build sandcastles here every day. The waves always win in the end.',
        team: [['marill', 33, ['bubble-beam', 'aqua-ring', 'double-edge', 'rain-dance']]] }
    ]
  }, SINNOH));

  // ---------------- Sea Route 220: open water and small islands ----------------
  G.Maps.def(Object.assign({
    id: 'route220', loc: 'sinnoh-sea-route-220', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~####################',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~:::#~~~~~~~~',
      '~~~~~~~~#:::~~~~~~~~~~~~~~~~~~~~::::~~~~~~~~',
      '~~~~~~~~::::~~~~~~~~~~~~~~~~~~~~::::~~~~~~~~',
      '~~~~~~~~::::~~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~##~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~::::~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~::::~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~:::#~~~~~~##~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '############################################'
    ],
    connect: { north: { map: 'route219', offset: 0 }, east: { map: 'route221', offset: 0 } },
    encounters: { water: '@sinnoh-sea-route-220-area' },
    items: [{ x: 9, y: 7, item: 'max-repel', flag: 'route220-repel' }, { x: 21, y: 14, item: 'splash-plate', flag: 'route220-plate' },
            { x: 34, y: 6, item: 'carbos', flag: 'route220-carbos' }],
    trainers: [
      { id: 'erik', who: 'swimmer', cls: 'swimmer', name: 'Erik', x: 4, y: 4, dir: 'right', sight: 4, swim: true,
        before: 'I swim from Sandgem to Route 221 and back every morning. Today you are my warm-up!',
        defeat: 'I need a longer warm-up.',
        after: 'Swim east, and you will reach land. Then you can rest your Pokémon.',
        team: [['tentacruel', 35, ['bubble-beam', 'wrap', 'barrier', 'water-pulse']]] },
      { id: 'vincent', who: 'swimmer', cls: 'swimmer', name: 'Vincent', x: 15, y: 3, dir: 'down', sight: 4, swim: true,
        before: 'Out here, nobody can hear you lose. Shall we?',
        defeat: 'Well, at least nobody heard that.',
        after: 'The islands out here are tiny, but people leave all kinds of things on them.',
        team: [['pelipper', 33, ['water-pulse', 'payback', 'protect', 'roost']], ['gastrodon', 33, ['mud-bomb', 'hidden-power', 'rain-dance', 'body-slam']]] },
      { id: 'jessica', who: 'swimmerf', cls: 'swimmer-f', name: 'Jessica', x: 12, y: 15, dir: 'right', sight: 4, swim: true,
        before: 'A whole school of Goldeen! Can you keep up with us?',
        defeat: 'We scattered like a school of fish.',
        after: 'Goldeen love the warm water around the islands.',
        team: [['goldeen', 30, ['horn-attack', 'water-pulse', 'flail', 'aqua-ring']], ['goldeen', 30, ['horn-attack', 'water-pulse', 'flail', 'aqua-ring']],
               ['goldeen', 31, ['water-pulse', 'flail', 'aqua-ring', 'fury-attack']], ['seaking', 33, ['water-pulse', 'flail', 'aqua-ring', 'fury-attack']]] },
      { id: 'erica', who: 'swimmerf', cls: 'swimmer-f', name: 'Erica', x: 27, y: 10, dir: 'left', sight: 4, swim: true,
        before: 'My Finneon glows at night. In the daytime, it battles!',
        defeat: 'Not even a glimmer of a chance.',
        after: 'Finneon swim in pairs. I am still looking for a second one.',
        team: [['finneon', 35, ['water-pulse', 'captivate', 'safeguard', 'aqua-ring']]] },
      { id: 'adrian', who: 'swimmer', cls: 'swimmer', name: 'Adrian', x: 26, y: 17, dir: 'up', sight: 4, swim: true,
        before: 'Remoraid can shoot water like a cannon. Want to see?',
        defeat: 'Missed every shot!',
        after: 'Octillery grabbed my leg once. We have been friends ever since.',
        team: [['remoraid', 32, ['bubble-beam', 'focus-energy', 'bullet-seed', 'water-pulse']], ['tentacool', 30, ['bubble-beam', 'wrap', 'barrier', 'water-pulse']],
               ['octillery', 34, ['bubble-beam', 'focus-energy', 'octazooka', 'bullet-seed']]] },
      { id: 'katelyn', who: 'swimmerf', cls: 'swimmer-f', name: 'Katelyn', x: 37, y: 13, dir: 'left', sight: 4, swim: true,
        before: 'My Medicham meditates on the waves. Do not break its focus!',
        defeat: 'Its focus broke. So did mine.',
        after: 'Medicham cannot swim, but it floats very calmly.',
        team: [['buizel', 32, ['aqua-jet', 'sonic-boom', 'quick-attack', 'attract']], ['medicham', 32, ['confusion', 'brick-break', 'meditate', 'light-screen']],
               ['seaking', 32, ['water-pulse', 'horn-attack', 'aqua-ring', 'captivate']]] },
      { id: 'claire', who: 'swimmerf', cls: 'swimmer-f', name: 'Claire', x: 39, y: 4, dir: 'down', sight: 4, swim: true,
        before: 'Floatzel and I race the boats out here. Race me instead!',
        defeat: 'You win the race. By a lot.',
        after: 'Route 221 is just ahead. There is a park at the end of it.',
        team: [['floatzel', 35, ['swift', 'aqua-jet', 'crunch', 'agility']]] }
    ]
  }, SINNOH));

  // ---------------- Route 221: a beach, a wood, the gate of Pal Park ----------------
  G.Maps.def(Object.assign({
    id: 'route221', loc: 'sinnoh-route-221', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      '~~~~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      '~~~~~~~~::.........TT..............T',
      '~~~~~~~~::.........TT........TTTTTTT',
      '~~~~~~~~::...................TTTTTTT',
      '~~~~~~~~::...........""""""".TTTTTTT',
      '~~~~~~~~::...........""""""".TTTTTTT',
      '~~~~~~~~::...........""""""".TTTTTTT',
      '~~~~~~~~::...........""""""".......T',
      '~~~~~~~~::..""""""".........BBBBBB.T',
      '~~~~~~~~::..""""""".........BBBBBB.T',
      '~~~~~~~~::..""""""".........BBBBBB.T',
      '~~~~~~~~::..""""""".........BBDBBB.T',
      '~~~~~~~~::,,,,,,,,,,,,,,,,,,,,,....T',
      '~~~~~~~~::TTTT.............S.......T',
      '~~~~~~~~::TTTT..............TTT....T',
      '~~~~~~~~::..................TTT....T',
      '~~~~~~~~::....."""""""""....TTT....T',
      '~~~~~~~~::....."""""""""...........T',
      '~~~~~~~~::....."""""""""...........T',
      '~~~~~~~~::....."""""""""...........T',
      '~~~~~~~~::.........................T',
      '~~~~~~~~TTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'route220', offset: 0 } },
    encounters: { walk: '@sinnoh-route-221-area', water: '@sinnoh-route-221-area' },
    warps: [{ x: 30, y: 11, to: 'pal-park-gate', spot: 'door' }],
    spots: { gate: [30, 12, 'down'] },
    signs: { '27,13': 'Route 221. East: Pal Park.' },
    items: [{ x: 12, y: 20, item: 'protein', flag: 'route221-protein' }, { x: 33, y: 20, item: 'ultra-ball', flag: 'route221-ball' },
            { x: 14, y: 2, item: 'tm81', flag: 'route221-tm81' }, { x: 26, y: 3, item: 'cleanse-tag', flag: 'route221-tag' }],
    trainers: [
      { id: 'dillon', who: 'swimmer', cls: 'swimmer', name: 'Dillon', x: 3, y: 6, dir: 'down', sight: 4, swim: true,
        before: 'Last stretch before the beach! Let us make it count!',
        defeat: 'I will float the rest of the way.',
        after: 'Fishermen line the beach here. Mind their lines.',
        team: [['remoraid', 33, ['bubble-beam', 'focus-energy', 'bullet-seed', 'water-pulse']], ['floatzel', 33, ['swift', 'aqua-jet', 'crunch', 'agility']]] },
      { id: 'vanessa', who: 'swimmerf', cls: 'swimmer-f', name: 'Vanessa', x: 4, y: 17, dir: 'up', sight: 4, swim: true,
        before: 'Golduck taught me to swim. Now it teaches Trainers to lose!',
        defeat: 'Golduck is holding its head. So am I.',
        after: 'Golduck always gets a headache when it battles. It still loves it.',
        team: [['golduck', 35, ['confusion', 'water-pulse', 'fury-swipes', 'screech']]] },
      { id: 'cory', who: 'fisherman', cls: 'fisherman', name: 'Cory', x: 9, y: 12, dir: 'left', sight: 3,
        before: 'Three Finneon on one line! Now watch them battle!',
        defeat: 'They all got away from me...',
        after: 'With a good rod you can catch Finneon here. With a super rod, something much bigger.',
        team: [['finneon', 30, ['gust', 'water-pulse', 'captivate', 'safeguard']], ['finneon', 32, ['gust', 'water-pulse', 'captivate', 'safeguard']],
               ['finneon', 34, ['water-pulse', 'captivate', 'safeguard', 'aqua-ring']]] },
      { id: 'ivan', who: 'pokemaniac', cls: 'collector', name: 'Ivan', x: 15, y: 6, dir: 'down', sight: 3,
        before: 'My Togetic is the rarest thing in my collection. Want a closer look?',
        defeat: 'A rare loss, too.',
        after: 'They say Pokémon from faraway lands come to the park at the end of this road. I am waiting at the gate!',
        team: [['togetic', 35, ['encore', 'follow-me', 'wish', 'ancient-power']]] },
      { id: 'jake', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Jake', x: 20, y: 14, dir: 'left', sight: 3,
        before: 'I came all this way to train where nobody bothers me. You will do, though!',
        defeat: 'That is the kind of battle I came for.',
        after: 'Staraptor and Girafarig make a strange pair. That is why they work.',
        team: [['staraptor', 35, ['take-down', 'aerial-ace', 'endeavor', 'quick-attack']], ['girafarig', 36, ['double-hit', 'psychic', 'assurance', 'double-hit']]] },
      { id: 'shannon', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Shannon', x: 25, y: 18, dir: 'up', sight: 3,
        before: 'The flowers here are lovely, and so is my team. Let me show you!',
        defeat: 'Lovely, and beaten.',
        after: 'Cherrim opens up whenever the sun comes out. Today it stayed shut.',
        team: [['cherrim', 34, ['petal-dance', 'magical-leaf', 'leech-seed', 'worry-seed']], ['azumarill', 34, ['double-edge', 'bubble-beam', 'aqua-ring', 'double-edge']],
               ['lopunny', 35, ['jump-kick', 'quick-attack', 'charm', 'agility']]] }
    ]
  }, SINNOH));

  // ---------------- The gate of Pal Park ----------------
  G.Maps.def(Object.assign({
    id: 'pal-park-gate', loc: 'pal-park', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'p__bb_bb__p', '___________', '___=====___', '___________', '___________', '_____X_____'],
    warps: [{ x: 5, y: 7, to: 'route221', spot: 'gate' }],
    spots: { door: [5, 7, 'up'] },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 5, y: 3, dir: 'down', fixed: true, script: 'r221.gate' },
      { id: 'visitor', who: 'gentleman', x: 8, y: 6, dir: 'left', move: 'look',
        say: 'I brought my Pokémon all the way from another land to see the park. It seems I am a little early.' }
    ]
  }, SINNOH));

  async function gate(h) {
    const F = G.Field;
    await h.say(T('Welcome to Pal Park! Pokémon brought here from faraway lands run free in the park, and Trainers may catch them.'));
    await h.say(T('...But no Pokémon from faraway lands have arrived yet, so the park is not open. We are very sorry!'));
    if (!F.flag('chapter-70-done') || F.flag('chapter-71-done')) return;
    // The end of the seventy-first chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(71); else F.setFlag('chapter-71-done');
  }

  G.Script.def({ 'r221.gate': [['js', gate]] });
})();
