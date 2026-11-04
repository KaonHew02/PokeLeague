/* ============ canalave.js — Route 218, Canalave City and Byron's Gym ============
 * Chapter 51, the end of the chapter. Route 218 opens west of Jubilife City after chapter 50 (a person stands there
 * before that, so nobody reaches this story early): land at both ends and the sea between, crossed with Surf.
 * Canalave City: a canal and its bridge, a Pokémon Center, a Mart and a house to the east, the Gym, the library and
 * the harbour to the west. Barry stops you at the bridge (his team by `barry-starter`, flag barry-canalave). The Gym
 * is shut while Byron is away on Iron Island (ironisland.js, flag riley-done opens it); the sailor at the harbour
 * takes you there. Byron uses Steel types; he gives the Mine Badge (badge 30, the sixth Sinnoh badge: Pokémon up to
 * Lv. 60 obey in Sinnoh) and TM91 (Flash Cannon), then `ending(51)`. Platinum's Trainers and wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const BARRY = { name: 'Barry' };
  const BYRON = { name: 'Byron' };
  const SAILOR = { name: 'Sailor' };

  // ---------------- Route 218 ----------------
  G.Maps.def(Object.assign({
    id: 'route218', loc: 'sinnoh-route-218', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T.......~~~~~~~~~~~~~~~~~~~~~~.........T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.......~~~~~~~~~~~~~~~~~~~~~~.......S.T',
      ',,,,,,,,~~~~~~~~~~~~~~~~~~~~~~,,,,,,,,,,',
      ',,,,,,,,~~~~~~~~~~~~~~~~~~~~~~,,,,,,,,,T',
      'T.......~~~~~~~~~~~~~~~~~~~~~~.........T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.""""".~~~~~~~~~~~~~~~~~~~~~~.."""""".T',
      'T.......~~~~~~~~~~~~~~~~~~~~~~.........T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'jubilife', offset: -6 }, west: { map: 'canalave', offset: -7 } },
    signs: { '37,6': 'Route 218. West: Canalave City, across the water. East: Jubilife City.' },
    items: [{ x: 36, y: 3, item: 'hyper-potion', flag: 'route218-potion' }],
    trainers: [
      { id: 'miguel', who: 'fisherman', cls: 'fisherman', name: 'Miguel', x: 31, y: 6, dir: 'down', sight: 1, team: [['gyarados', 33], ['gyarados', 33]],
        before: 'Two lines, two Gyarados. Today is my lucky day!',
        defeat: 'Not so lucky after all.',
        after: 'You need Surf to get across. There is no other way to Canalave from here.' },
      { id: 'tony', who: 'rocker', cls: 'guitarist', name: 'Tony', x: 5, y: 9, dir: 'up', sight: 1, team: [['kricketune', 33], ['magnemite', 33]],
        before: 'The sea is my stage! Listen to this!',
        defeat: 'My strings broke...',
        after: 'Kricketune and I play for the ships in Canalave harbour.' }
    ],
    encounters: { walk: '@sinnoh-route-218-area', water: '@sinnoh-route-218-area' }
  }, SINNOH));

  // ---------------- Canalave City ----------------
  G.Maps.def(Object.assign({
    id: 'canalave', loc: 'canalave-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T.................~~~~.................T',
      'T.................~~~~.................T',
      'T.............fff.~~~~.................T',
      'T.............fff.~~~~.................T',
      'T.............fff.~~~~.................T',
      'T......GGGGGG.....~~~~.................T',
      'T......GGGGGG.....~~~~.................T',
      'T......GGGGGG.....~~~~...CCCCC.........T',
      'T......GGGGGG.....~~~~...CCCCC..MMMM...T',
      'T......GGDGGG.....~~~~...CCCCC..MMMM...T',
      'T........,.S......~~~~...CCDCC..MDMM...T',
      'T........,........~~~~.....,.....,.....T',
      'T........,........~~~~..S..,.....,.....T',
      'T.,,,,,,,,,,,,,,,,====,,,,,,,,,,,,,,,,,,',
      'T.,,,,,,,,,,,,,,,,====,,,,,,,,,,,,,,,,,,',
      'T.........,.......~~~~.,...............T',
      'T.BBBBBB..,.......~~~~.,...............T',
      'T.BBBBBB..,.......~~~~.,..HHHH..fffff..T',
      'T.BBBBBB..,.......~~~~.,..HHHH..fffff..T',
      'T.BBDBBB..,.......~~~~.,..HDHH..fffff..T',
      'T...,,,,,,,.......~~~~.,,,,,....fffff..T',
      'T.........,...S...~~~~.................T',
      'T.........,,,,....~~~~.................T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route218', offset: 7 } },
    warps: [
      { x: 27, y: 11, to: 'canalave-center', spot: 'door' },
      { x: 33, y: 11, to: 'canalave-mart', spot: 'door' },
      { x: 27, y: 20, to: 'canalave-house', spot: 'door' },
      { x: 4, y: 20, to: 'canalave-library', spot: 'door' },
      { x: 9, y: 10, to: 'canalave-gym', spot: 'door', if: 'riley-done', locked: 'canalave.gym-closed' }
    ],
    spots: { 'center-door': [27, 12, 'down'], 'mart-door': [33, 12, 'down'], 'house-door': [27, 21, 'down'], 'library-door': [4, 21, 'down'], 'gym-door': [9, 11, 'down'],
             harbor: [12, 23, 'up'] },
    signs: {
      '24,13': 'Canalave City. A port town, split in two by its canal.',
      '11,11': 'Canalave City Gym. Leader: Byron, the Steel man.',
      '14,22': 'Canalave Harbour. Ask the sailor about the boat to Iron Island.'
    },
    triggers: [{ x: 22, y: 14, w: 1, h: 2, if: '!barry-canalave', script: 'canalave.barry' }],
    npcs: [
      { id: 'barry', who: 'barry', x: 16, y: 14, dir: 'right', if: 'scripted' },
      { id: 'sailor', who: 'sailor', x: 11, y: 23, dir: 'right', script: 'canalave.sailor' },
      { id: 'boy', who: 'youngster', x: 30, y: 15, move: 'look',
        say: 'The bridge goes up when big ships come through the canal. It is the best thing in town!' },
      { id: 'man', who: 'sailor', x: 14, y: 13, move: 'wander', r: 2,
        say: 'Our Gym Leader built his Gym with his own hands, and he has a son who leads a Gym too.' }
    ],
    encounters: { water: '@canalave-city-area' }
  }, SINNOH));

  G.Maps.center('canalave-center', {
    loc: 'canalave-city', exit: { map: 'canalave', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'Fire, Fighting and Ground moves are the answer to Steel. Almost nothing else hurts it much!' }]
  }).region = 'sinnoh';

  G.Maps.mart('canalave-mart', {
    loc: 'canalave-city', exit: { map: 'canalave', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'revive', 'antidote', 'paralyze-heal', 'awakening',
            'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel', 'max-repel'],
    npcs: [{ id: 'shopper', who: 'sailor', x: 6, y: 5, move: 'look',
             say: 'A sailor always stocks up before going to sea. Iron Island has no shop!' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'canalave-house', loc: 'canalave-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'canalave', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
             say: 'My husband worked the mines on Iron Island. The steel of Sinnoh came from there.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'canalave-library', loc: 'canalave-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbbb___bbbb', '___________', 'bbb_____bbb', '___________', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'canalave', spot: 'library-door' }],
    spots: { door: [4, 7, 'up'] },
    signs: {
      '0,2': 'A book of old stories: "When the world began, there was only one egg. From it came the first Pokémon, and the first Pokémon made time and space."',
      '10,2': 'A book of old stories: "Three spirits sleep in Sinnoh\'s three lakes. They gave people knowledge, feeling and will."'
    },
    npcs: [{ id: 'reader', who: 'gentleman', x: 5, y: 3, dir: 'down',
             say: 'Every story in this library starts in Sinnoh. Strange, is it not?' }]
  }, SINNOH));

  // ---------------- Byron's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'canalave-gym', loc: 'canalave-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW', 'p+++++++++++++p', '+++++++++++++++', '+++++++++++++++', 'W+WWWWWW+WWWWWW', 'W+++++++++++++W', 'WWWWW+WWWWWWW+W',
           'W+++++++++++++W', 'W+WWWWWW+W+WWWW', 'W+++++++++++++W', 'WWWW+WWWWW+WW+W', '+++++++++++++++', '+++++++X+++++++'],
    warps: [{ x: 7, y: 13, to: 'canalave', spot: 'gym-door' }],
    spots: { door: [7, 13, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 9, y: 13, dir: 'left', script: 'canalave.gym-guide' }],
    trainers: [
      { id: 'jackson', who: 'engineer', cls: 'worker', name: 'Jackson', x: 10, y: 11, dir: 'down', sight: 2, team: [['magnemite', 34], ['magnemite', 34], ['magnemite', 34]],
        before: 'We built this Gym with Byron, one steel beam at a time!',
        defeat: 'Needs more welding.',
        after: 'Steel types resist nearly everything. Do not waste your time on weak moves.' },
      { id: 'david', who: 'blackbelt', cls: 'black-belt', name: 'David', x: 8, y: 9, dir: 'down', sight: 1, team: [['steelix', 35], ['steelix', 37]],
        before: 'Two Steelix, hard as the island they came from!',
        defeat: 'Even steel can bend.',
        after: 'Steelix are part Ground, so Water moves work on them too.' },
      { id: 'gary', who: 'engineer', cls: 'worker', name: 'Gary', x: 4, y: 11, dir: 'up', sight: 1, team: [['magnemite', 37]],
        before: 'This Magnemite keeps my tools sharp. And it bites!',
        defeat: 'Back to the workshop.',
        after: 'Magnemite are part Electric. Ground moves hit them four times as hard.' },
      { id: 'ricky-gym', who: 'blackbelt', cls: 'black-belt', name: 'Ricky', x: 5, y: 7, dir: 'down', sight: 1, team: [['steelix', 38]],
        before: 'You have to get past my Steelix first!',
        defeat: 'You did it.',
        after: 'Byron and his son Roark argue about whose Pokémon are tougher. Every single day.' },
      { id: 'breanna', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Breanna', x: 10, y: 9, dir: 'up', sight: 1, team: [['bronzor', 35], ['bronzor', 36], ['bronzor', 38]],
        before: 'Bronzor can be Levitate or Heatproof. Do you know which is which?',
        defeat: 'You worked it out.',
        after: 'Steel and Psychic together have very few weak spots. Fire is one of them.' },
      { id: 'cesar', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Cesar', x: 8, y: 5, dir: 'down', sight: 1, team: [['scizor', 40]],
        before: 'I am the last one before Byron. My Scizor will end this!',
        defeat: 'Go on. Byron is ready.',
        after: 'Scizor has only one weak spot: Fire. It is a big one.' },
      { id: 'byron', who: 'byron', cls: 'leader', name: 'Byron', x: 7, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'hyper-potion': 1, 'full-restore': 1 },
        team: [['magneton', 37, ['flash-cannon', 'thunderbolt', 'tri-attack', 'metal-sound']],
               ['steelix', 38, ['flash-cannon', 'ice-fang', 'earthquake', 'sandstorm']],
               ['bastiodon', 41, ['metal-burst', 'stone-edge', 'iron-defense', 'taunt'], 'sitrus-berry']],
        before: 'Ha! So you are the one who chased Team Galactic out of my island! I am Byron, and my Steel Pokémon are the hardest in Sinnoh. A Champion of three regions? Then hit me as hard as you can!',
        defeat: 'Ha ha! What a blow! Even steel rings when it is struck like that.',
        win: 'canalave.byron-win',
        afterScript: [['say', 'The next Gym is in Snowpoint City, far to the north. Its Leader, Candice, trains in the snow!', BYRON]] }
    ]
  }, SINNOH));

  /** Barry on the bridge: his team depends on the starter he took. */
  const BARRY_TEAMS = {
    387: [['staraptor', 36], ['floatzel', 35], ['heracross', 37], ['rapidash', 35], ['torterra', 38]],
    390: [['staraptor', 36], ['floatzel', 35], ['heracross', 37], ['roserade', 35], ['infernape', 38]],
    393: [['staraptor', 36], ['roserade', 35], ['heracross', 37], ['rapidash', 35], ['empoleon', 38]]
  };
  async function barry(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('barry-canalave')) return;
    if (me) h.place('barry', me.x - 4, me.y, 'right');
    h.show('barry');
    h.emote('barry', '!');
    if (me) { await h.walkTo('barry', me.x - 1, me.y); h.face('barry', 'right'); h.face('player', 'left'); }
    await h.say(T('{player}! Perfect timing! I went to challenge Byron, but his Gym is shut. So I will take it out on you!'), BARRY);
    await h.say(T('My team has all grown up since Pastoria. Look!'), BARRY);
    const out = await h.battle({ id: 'barry-canalave', who: 'barry', name: 'Barry', prize: 70, ai: 'leader',
      team: BARRY_TEAMS[F.getVar('barry-starter')] || BARRY_TEAMS[390] });
    if (out !== 'win') return;
    F.setFlag('barry-canalave');
    await h.say(T('No way! I trained so hard!'), BARRY);
    await h.say(T('Byron went off to Iron Island, by the way. Ask the sailor at the harbour. I am going to train some more. See you!'), BARRY);
    h.hide('barry');
  }

  G.Script.def({
    'canalave.barry': [['js', barry]],
    'canalave.gym-closed': [['say', 'The Gym is shut. A note on the door says: "Gone to Iron Island. Back soon! Byron"']],
    'canalave.sailor': [
      ['choice', 'Ahoy! Shall I take you out to Iron Island?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The boat sailed out to Iron Island...'],
        ['warp', 'iron-island', 'pier']
      ], [
        ['say', 'Any time. The sea is not going anywhere.', SAILOR]
      ], SAILOR]
    ],
    'canalave.gym-guide': [
      ['say', 'Hey, Champion! Byron uses Steel-type Pokémon.'],
      ['say', 'Fire, Fighting and Ground moves are what you want. His Bastiodon is part Rock, so Fighting and Ground moves hit it four times as hard!'],
      ['say', 'Careful with Metal Burst: it hits back harder than it was hit. Up to level 50, your Pokémon from home will listen to you here.']
    ],
    'canalave.byron-win': [
      ['say', 'Take the Mine Badge! It is as hard as the one who earned it.', BYRON],
      ['badge', 30],
      ['jingle', 'badge'],
      ['say', '{player} received the Mine Badge from Byron!'],
      ['say', 'With it, Pokémon up to level 60 will obey you here in Sinnoh, even ones from other regions.', BYRON],
      ['say', 'And take TM91, Flash Cannon. A blast of steel light that may lower the foe\'s Special Defense!', BYRON],
      ['giveItem', 'tm91', 1],
      // The end of the fifty-first chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(51) : G.Field.setFlag('chapter-51-done'))]
    ]
  });
})();
