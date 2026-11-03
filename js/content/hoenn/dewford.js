/* ============ dewford.js — Mr. Briney's boat, Dewford Town, Granite Cave, Brawly's Gym ============
 * Chapter 30, the end of the chapter. Once Peeko is safe (flag peeko-saved), Mr. Briney sails you
 * from his cottage on Route 104 to Dewford Town, a small island, and back (hoenn.briney,
 * hoenn.briney-dewford). Dewford: Brawly's Gym (Fighting types: Machop, Meditite, Makuhita), a
 * Pokémon Center, Dewford Hall, a fisherman's house (an Old Rod), Briney's pier. West along the
 * beach of Route 106 is Granite Cave: 1F and a dark B1F (Flash) where Steven, the president's son,
 * studies rare stones; he takes the Letter and gives TM47 Steel Wing (flag steven-letter). Beating
 * Brawly gives the Knuckle Badge (badge 18: Pokémon up to Lv. 30 obey in Hoenn) and TM08 Bulk Up,
 * then `ending(30)`. Emerald's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const BRINEY = { name: 'Mr. Briney' }, STEVEN = { name: 'Steven' }, BRAWLY = { name: 'Brawly' };
  const HOENN = { region: 'hoenn' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const CAVE = { loc: 'granite-cave', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true };

  // ---------------- Dewford Town ----------------
  G.Maps.def(Object.assign({
    id: 'dewford', loc: 'dewford-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: '~',
    fly: { spot: 'center-door' },
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~......................~~',
      '~~........TT...GGGGGG.T.~~',
      '~~..CCCCC......GGGGGG...~~',
      '~~..CCCCC......GGGGGG...~~',
      '~~..CCCCC......GGGGGG...~~',
      '~~..CCDCC......GGDGGG...~~',
      '~~....,.....S....,.S....~~',
      ',,,,,,,,,,,,,,,,,,,,,,,,~~',
      '~~......................~~',
      '~~..HHHH.......HHHH.....~~',
      '~~..HHHH.......HHHH..T..~~',
      '~~..HDHH.......HDHH.....~~',
      '~~...,..........,.......~~',
      '~~........TT............~~',
      '~~......................~~',
      '~~......................~~',
      '~~::::::::::::::::::==::~~',
      '~~::::::::::::::::::==::~~',
      '~~~~~~~~~~~~~~~~~~~~==~~~~',
      '~~~~~~~~~~~~~~~~~~~~==~~~~'
    ],
    connect: { west: { map: 'route106', offset: 6 } },
    warps: [
      { x: 17, y: 7, to: 'dewford-gym', spot: 'door' },
      { x: 6, y: 7, to: 'dewford-center', spot: 'door' },
      { x: 5, y: 13, to: 'dewford-hall', spot: 'door' },
      { x: 16, y: 13, to: 'dewford-house', spot: 'door' }
    ],
    spots: { 'gym-door': [17, 8, 'down'], 'center-door': [6, 8, 'down'], 'hall-door': [5, 14, 'down'], 'house-door': [16, 14, 'down'],
             pier: [20, 20, 'up'] },
    signs: {
      '12,8': 'Dewford Town. A tiny island in the rough sea, with a big Gym.',
      '19,8': 'Dewford Town Pokémon Gym. Leader: Brawly, a big wave of fighting spirit.'
    },
    npcs: [
      { id: 'briney', who: 'captain', x: 21, y: 21, dir: 'left', script: 'hoenn.briney-dewford' },
      { id: 'boy', who: 'youngster', x: 9, y: 12, move: 'wander', r: 2,
        say: 'Brawly surfs the big waves around the island every morning. That is how he trains!' },
      { id: 'man', who: 'fisherman', x: 12, y: 16, move: 'look',
        say: 'West along the beach is Granite Cave. A young man in a fancy suit went in there to look at rocks.' },
      { id: 'girl', who: 'lass', x: 3, y: 17, move: 'look',
        say: 'Everyone in Dewford Hall is always talking about the newest trend. I can never keep up!' }
    ],
    encounters: { water: '@dewford-town-area' }
  }, HOENN));

  G.Maps.center('dewford-center', {
    loc: 'dewford-town', exit: { map: 'dewford', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 5, move: 'look',
             say: 'There is no Mart on this island. Stock up on Potions before you take a boat over!' }]
  }).region = 'hoenn';

  G.Maps.def(Object.assign({
    id: 'dewford-hall', loc: 'dewford-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'dewford', spot: 'hall-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'man', who: 'pokefan', x: 7, y: 4, dir: 'left',
        say: 'Welcome to Dewford Hall! Here we talk about whatever is popular. This week? Rare stones, of all things!' },
      { id: 'girl', who: 'beauty', x: 2, y: 5, move: 'look',
        say: 'They say the walls of Granite Cave hold an ancient picture of a huge Pokémon. Spooky!' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'dewford-house', loc: 'dewford-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'dewford', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'fisherman', who: 'fisherman', x: 7, y: 4, dir: 'left', script: 'dewford.fisherman' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'dewford-gym', loc: 'dewford-town', tileset: 'indoor', palette: 'dojo', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'dewford', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'dewford.gym-guide' }],
    trainers: [
      { id: 'laura', who: 'battlegirl', cls: 'battle-girl', name: 'Laura', x: 3, y: 8, dir: 'right', sight: 3, team: [['meditite', 15]],
        before: 'Body and mind, trained as one! That is how we fight in Brawly\'s Gym!',
        defeat: 'My focus slipped...',
        after: 'Meditite trains its mind by meditating. Its strength comes from inside.' },
      { id: 'takao', who: 'blackbelt', cls: 'black-belt', name: 'Takao', x: 9, y: 5, dir: 'left', sight: 3, team: [['machop', 15], ['makuhita', 15]],
        before: 'Hoo-hah! My fists are ready! Are yours?',
        defeat: 'Hoo... hah...',
        after: 'Brawly learned his moves riding the big waves. His Pokémon never give up.' },
      { id: 'brawly', who: 'brawly', cls: 'leader', name: 'Brawly', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { 'super-potion': 1 },
        team: [['machop', 16, ['karate-chop', 'low-kick', 'seismic-toss', 'bulk-up']],
               ['meditite', 16, ['confusion', 'detect', 'reversal', 'bulk-up']],
               ['makuhita', 19, ['arm-thrust', 'vital-throw', 'reversal', 'bulk-up']]],
        before: 'Yo! I am Brawly, Dewford\'s Gym Leader. I have ridden the roughest waves around this island, and they made me strong. A Champion from Kanto, huh? Let us see if you can handle a big swell!',
        defeat: 'Whoa, you swallowed my wave whole! You really are something.',
        win: 'dewford.brawly-win',
        afterScript: [['say', 'Slateport City is to the north, across the sea. Mr. Briney can take you there, I bet.', BRAWLY]] }
    ]
  }, HOENN));

  // ---------------- Route 106 and Granite Cave ----------------
  G.Maps.def(Object.assign({
    id: 'route106', loc: 'hoenn-route-106', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '##############################',
      '####O#########################',
      '~##::::S::::::::::::::::::::::',
      '~##:::::::::::::::::::::::::::',
      '~##:::::::::::::::::::::::::::',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'dewford', offset: -6 }, west: { map: 'route105', offset: -28 } },
    warps: [{ x: 4, y: 1, to: 'granite-cave-1f', spot: 'mouth' }],
    spots: { mouth: [4, 2, 'down'] },
    signs: { '7,2': 'Granite Cave. Visitors must watch their step in the dark.' },
    trainers: [
      { id: 'ned', who: 'fisherman', cls: 'fisherman', name: 'Ned', x: 15, y: 4, dir: 'down', sight: 1, team: [['tentacool', 14]],
        before: 'Shh! You will scare the fish. ...Too late. Battle me, then!',
        defeat: 'The one that got away...',
        after: 'The sea around Dewford is rough. Only strong Pokémon live out there.' }
    ],
    npcs: [{ id: 'hiker', who: 'hiker', x: 26, y: 2, dir: 'down',
             say: 'Granite Cave is dark inside, deeper down. A Pokémon that knows Flash will light your way.' }],
    encounters: { water: '@hoenn-route-106-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'granite-cave-1f',
    rows: [
      '####################',
      '####################',
      '##############.%.###',
      '##############...###',
      '###......#####...###',
      '###......#####...###',
      '###..........#...###',
      '###..........#...###',
      '#######..........###',
      '#######..........###',
      '#######......#######',
      '#######......#######',
      '#######......#######',
      '#########O##########'
    ],
    warps: [{ x: 9, y: 13, to: 'route106', spot: 'mouth' }, { x: 15, y: 2, to: 'granite-cave-b1f', spot: 'ladder' }],
    spots: { mouth: [9, 12, 'up'], ladder: [15, 3, 'down'] },
    npcs: [{ id: 'hiker', who: 'hiker', x: 10, y: 9, move: 'look',
             say: 'The ladder there goes down into the dark. Somebody went down earlier, muttering about stones...' }],
    trainers: [
      { id: 'dennis', who: 'hiker', cls: 'hiker', name: 'Dennis', x: 12, y: 8, dir: 'left', sight: 2, team: [['geodude', 13], ['aron', 13]],
        before: 'Granite Cave is my favourite place in all of Hoenn! Battle me in its honour!',
        defeat: 'My Pokémon are as hard as granite... but you are harder.',
        after: 'Aron eats iron ore from the cave walls. Do not let it near your bike!' }
    ],
    items: [{ x: 4, y: 4, item: 'escape-rope', flag: 'granite-1f-rope' }],
    encounters: { walk: '@granite-cave-1f' }
  }, CAVE));

  G.Maps.def(Object.assign({
    id: 'granite-cave-b1f', dark: true,
    rows: [
      '########################',
      '########################',
      '##.%...#.....###########',
      '##.....#.....###########',
      '##...........###########',
      '##.......####.......####',
      '####..#######.........##',
      '####..#######..###....##',
      '####..#######..###....##',
      '####..#######..###....##',
      '####..#######..###....##',
      '####...........###....##',
      '####...........###....##',
      '##################....##',
      '########################',
      '########################'
    ],
    warps: [{ x: 3, y: 2, to: 'granite-cave-1f', spot: 'ladder' }],
    spots: { ladder: [3, 3, 'down'] },
    npcs: [{ id: 'steven', who: 'steven', x: 20, y: 9, dir: 'left', if: '!steven-letter', script: 'dewford.steven' }],
    trainers: [
      { id: 'joyce', who: 'battlegirl', cls: 'battle-girl', name: 'Joyce', x: 17, y: 5, dir: 'left', sight: 3, team: [['meditite', 14], ['makuhita', 14]],
        before: 'I train down here in the dark to sharpen my senses. Hyah!',
        defeat: 'I did not see that coming...',
        after: 'Brawly\'s Gym is my goal. I will beat him one day!' }
    ],
    items: [{ x: 8, y: 2, item: 'great-ball', flag: 'granite-b1f-greatball' }],
    encounters: { walk: '@granite-cave-b1f' }
  }, CAVE));

  // ---------------- Mr. Briney's boat ----------------
  const PLACES = [['route104', 'hoenn-route-104', null], ['dewford', 'dewford-town', null], ['slateport', 'slateport-city', 'visited:dewford']];
  /** His boat from `here` to any of the other places he sails to. */
  const boat = here => [
    ['menu', 'Ahoy! Peeko and I owe you one. Where shall we sail?',
      PLACES.filter(([map]) => map !== here).map(([map, loc, cond]) => [{ loc }, [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', "Mr. Briney's boat cut through the waves, with Peeko flying beside it..."],
        ['warp', map, 'pier'],
        ['say', 'Here we are! Just say the word when you want to sail again.', BRINEY]
      ], here === 'dewford' && map === 'slateport' ? null : cond]),
      BRINEY]
  ];

  // ---------------- Steven ----------------
  async function steven(h) {
    const F = G.Field;
    if (!F.count('letter')) {
      await h.say(T('My name is Steven. I am interested in rare stones, so I travel all over looking for them.'), STEVEN);
      await h.say(T('These caves hold stones you will not find anywhere else. Is that not wonderful?'), STEVEN);
      return;
    }
    await h.say(T('My name is Steven. I am interested in rare stones... Oh? A letter for me?'), STEVEN);
    F.takeItem('letter', 1);
    await h.say(T('{player} handed over the Letter.'));
    await h.say(T('From my father? ...Thank you for bringing it all this way. And I hear you got the Devon Goods back, too.'), STEVEN);
    await h.say(T('You seem like a Trainer who will go far. Please take this TM. Steel Wing: hard wings that strike like steel.'), STEVEN);
    F.giveItem('tm47', 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('tm47') } });
    await j;
    await h.say(T('I have more stones to look for. Maybe we will meet again somewhere. Take care.'), STEVEN);
    F.setFlag('steven-letter');
    h.hide('steven');
  }

  G.Script.def({
    'dewford.steven': [['js', steven]],
    // Mr. Briney's boat (chapter 30; Slateport City in chapter 31, once you have been to Dewford Town).
    'hoenn.briney': boat('route104'),
    'hoenn.briney-dewford': boat('dewford'),
    'hoenn.briney-slateport': boat('slateport'),
    'dewford.fisherman': [
      ['if', 'has:old-rod', [
        ['say', 'You already have a fishing rod! Cast it in any water and see what bites.']
      ], [
        ['say', 'Fishing is the best! Here, take this Old Rod and see for yourself.'],
        ['giveItem', 'old-rod', 1],
        ['say', 'Face the water, use the rod, and wait for a bite!']
      ]]
    ],
    'dewford.gym-guide': [
      ['say', 'Yo, Champion! Brawly uses Fighting-type Pokémon. They hit Normal and Rock types hard.'],
      ['say', 'Flying and Psychic moves are the way to go. A Taillow from Route 104 or a Wingull from the beach would do great!'],
      ['say', 'With one Hoenn badge, your Pokémon from home listen up to level 25. Win this one and it goes up to 30!']
    ],
    'dewford.brawly-win': [
      ['say', 'Here you go: the Knuckle Badge. You earned it, no question.', BRAWLY],
      ['badge', 18],
      ['jingle', 'badge'],
      ['say', '{player} received the Knuckle Badge from Brawly!'],
      ['say', 'With two Hoenn badges, Pokémon up to level 30 will obey you, even ones from far away.', BRAWLY],
      ['say', 'Take this too. TM08 is Bulk Up: it raises your Pokémon\'s Attack and Defense. Great for riding out a storm!', BRAWLY],
      ['giveItem', 'tm08', 1],
      // The end of the thirtieth chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(30) : G.Field.setFlag('chapter-30-done'))]
    ]
  });
})();
