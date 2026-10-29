/* ============ cianwood.js — Sea Routes 40 and 41, Cianwood City and Chuck ============
 * Chapter 15. West of Olivine, Sea Route 40 (a sandbank, three Swimmers) and Sea Route 41 with
 * the Whirl Islands (their caves are behind whirlpools: chapter 22, whirl.js; three Swimmers) lead to
 * Cianwood City. On its beach Suicune appears and runs off over the sea (flag
 * cianwood-suicune; Eusine comes after it). The pharmacy gives the Secret Potion for Jasmine's
 * Amphy once she has asked for it (flag amphy-sick). Chuck's wife gives TM08 Bulk Up (flag
 * got-tm08). Chuck's Gym: rocks, three boulders (Strength), four Black Belts, then Chuck
 * (Primeape, Poliwrath): badge 13, the Storm Badge (Pokémon up to Lv. 50 obey), TM01 Focus Punch
 * (flag chuck-beaten).
 * Chapter 22: an old sailor on the beach teaches Whirlpool (script whirl.sailor), which calms the
 * whirlpools in front of the Whirl Islands' four caves.
 */
G.Maps.def({
  id: 'route40', loc: 'johto-sea-route-40', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
  rows: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~#~~~~~~~',
    '~~~~##~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~::S::~~~~~~~~~~~~~',
    '~~~~~~~~~~~~:::::~~~~~~~~##~~~',
    '~~~~~~~~~~~~:::::~~~~~~~~~~~~~',
    '~~~~~~~~~~~~:::::~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~#~~~~~~~~~~~~##~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
  ],
  connect: { east: { map: 'olivine', offset: -12 }, west: { map: 'route41', offset: -2 } },
  signs: { '14,8': 'Sea Route 40. Olivine City to the east, Cianwood City far to the west.' },
  npcs: [{ id: 'girl', who: 'lass', x: 13, y: 10, move: 'look',
           say: 'I swam all the way out to this sandbank. Now I am too tired to swim back!' }],
  trainers: [
    { id: 'simon', who: 'swimmer', cls: 'swimmer', name: 'Simon', x: 20, y: 5, dir: 'left', sight: 4, swim: true,
      team: [['tentacool', 25], ['tentacool', 25]],
      before: 'The sea is my training ground. Let\'s make waves!',
      defeat: 'Washed out...',
      after: 'Watch out for Tentacool. They sting!' },
    { id: 'elaine', who: 'swimmerf', cls: 'swimmer-f', name: 'Elaine', x: 8, y: 14, dir: 'right', sight: 4, swim: true,
      team: [['staryu', 27]],
      before: 'Staryu shines like a jewel in the water. Isn\'t it pretty?',
      defeat: 'My jewel lost its shine...',
      after: 'At night the Lighthouse light reaches all the way out here.' },
    { id: 'paula', who: 'swimmerf', cls: 'swimmer-f', name: 'Paula', x: 24, y: 15, dir: 'up', sight: 4, swim: true,
      team: [['staryu', 25], ['shellder', 26]],
      before: 'Swimming is good for you, and so is battling!',
      defeat: 'I need a rest on the sand...',
      after: 'Cianwood is a long swim west. Take a break on the sandbank!' }
  ],
  encounters: { water: '@johto-sea-route-40-area' }
});

G.Maps.def({
  id: 'route41', loc: 'johto-sea-route-41', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
  rows: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~#####~~~~~~~~~~~~~#####~~~~~~~~~',
    '~~~~~~~~#####~~~~~~~~~~~~~#####~~~~~~~~~',
    '~~~~~~~~##O##~~~~~~~~~~~~~##O##~~~~~~~~~',
    '~~~~~~~~##:##~~~~~~~~~~~~~##:##~~~~~~~~~',
    '~~~~~~~~~~w~~~~~~~~~~~~~~~~~w~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~::S:::~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~::::::~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~::::::~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~::::::~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~w~~~~~~~~~~~~~~~~~w~~~~~~~~~~~',
    '~~~~~~~~##:##~~~~~~~~~~~~~##:##~~~~~~~~~',
    '~~~~~~~~##O##~~~~~~~~~~~~~##O##~~~~~~~~~',
    '~~~~~~~~#####~~~~~~~~~~~~~#####~~~~~~~~~',
    '~~~~~~~~#####~~~~~~~~~~~~~#####~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
  ],
  connect: { east: { map: 'route40', offset: 2 }, west: { map: 'cianwood', offset: -4 } },
  warps: [
    { x: 10, y: 5, to: 'whirl-islands-nw', spot: 'mouth' },
    { x: 28, y: 5, to: 'whirl-islands-ne', spot: 'mouth' },
    { x: 10, y: 17, to: 'whirl-islands-sw', spot: 'mouth' },
    { x: 28, y: 17, to: 'whirl-islands-se', spot: 'mouth' }
  ],
  spots: { 'whirl-nw': [10, 6, 'down'], 'whirl-ne': [28, 6, 'down'], 'whirl-sw': [10, 16, 'up'], 'whirl-se': [28, 16, 'up'] },
  signs: { '19,10': 'Whirl Islands. Fierce whirlpools swirl in front of the caves. Only a Pokémon that knows Whirlpool can calm them.' },
  trainers: [
    { id: 'randall', who: 'swimmer', cls: 'swimmer', name: 'Randall', x: 15, y: 6, dir: 'down', sight: 4, swim: true,
      team: [['shellder', 27], ['wartortle', 28]],
      before: 'The currents around the islands are fierce. Only the strong swim here!',
      defeat: 'Swept away...',
      after: 'A huge Pokémon is said to sleep deep inside the Whirl Islands.' },
    { id: 'kaylee', who: 'swimmerf', cls: 'swimmer-f', name: 'Kaylee', x: 33, y: 12, dir: 'left', sight: 4, swim: true,
      team: [['goldeen', 26], ['seaking', 28]],
      before: 'Seaking swims as gracefully as a dancer. Watch!',
      defeat: 'Out of step...',
      after: 'Seaking fight over the best spots in the river. Even in the sea, they are proud.' },
    { id: 'charlie', who: 'swimmer', cls: 'swimmer', name: 'Charlie', x: 22, y: 19, dir: 'up', sight: 4, swim: true,
      team: [['tentacruel', 28]],
      before: 'I have swum around all four islands today. One more battle!',
      defeat: 'Out of breath...',
      after: 'Cianwood is just west of here. Its Gym Leader trains under a waterfall!' }
  ],
  encounters: { water: '@johto-sea-route-41-area' }
});

G.Maps.def({
  id: 'cianwood', loc: 'cianwood-city', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT~~~~~~~~',
    'T#######################~~~~~~~~',
    'T#######################~~~~~~~~',
    'T...................::::~~~~~~~~',
    'T...................::::~~~~~~~~',
    'T.........GGGGGG....::::~~~~~~~~',
    'T..CCCCC..GGGGGG.MMMM:#:~~~~~~~~',
    'T..CCCCC..GGGGGG.MMMM:#:~~~~~~~~',
    'T..CCCCC..GGGGGG.MDMM:::~~~~~~~~',
    'T..CCDCC.SGGDGGGS.,.::::~~~~~~~~',
    'T,,,,,,,,,,,,,,,,,,,,,,,~~~~~~~~',
    'T,,,,,,,,,,,,,,,,,,,,,,,~~~~~~~~',
    'T.......ff....,,....::::~~~~~~~~',
    'T.............,,....::::~~~~~~~~',
    'T..HHHH..HHHH.,,....::::~~~~~~~~',
    'T..HHHH..HHHH.,,....::::~~~~~~~~',
    'T..HDHH..HDHH.,,....::::~~~~~~~~',
    'T,,,,,,,,,,,,,,,,,,,,,,,~~~~~~~~',
    'T,,,,,,,,,,,,,,,,,,,,,,,~~~~~~~~',
    'T..................S::::~~~~~~~~',
    'T..................y::::~~~~~~~~',
    'TTTTTTTTT.......ff..::::~~~~~~~~',
    'TTTTTTTTT...........:#::~~~~~~~~',
    'TTTTTTTTT...........::::~~~~~~~~',
    'TTTTTTTTT...........::::~~~~~~~~',
    'TTTTTTTTT.""""""""".::::~~~~~~~~',
    'TTTTTTTTT.""""""""".::#:~~~~~~~~',
    'TTTTTTTTT.""""""""".:::#~~~~~~~~',
    'TTTTTTTTT.""""""""".::::~~~~~~~~',
    'TTTTTTTTT.""""""""".::::~~~~~~~~',
    'T...................::::~~~~~~~~',
    'TTTTTTTTTTTTTTTTTTTTTTTT~~~~~~~~'
  ],
  connect: { east: { map: 'route41', offset: 4 } },
  warps: [
    { x: 5, y: 9, to: 'cianwood-center', spot: 'door' },
    { x: 12, y: 9, to: 'cianwood-gym', spot: 'door' },
    { x: 18, y: 8, to: 'pharmacy', spot: 'door' },
    { x: 4, y: 16, to: 'chuck-house', spot: 'door' },
    { x: 10, y: 16, to: 'cianwood-house', spot: 'door' }
  ],
  spots: { 'center-door': [5, 10, 'down'], 'gym-door': [12, 10, 'down'], 'pharmacy-door': [18, 9, 'down'], 'chuck-door': [4, 17, 'down'], 'house-door': [10, 17, 'down'] },
  berries: [[19, 20, 'oran-berry']],
  signs: {
    '9,9': 'Cianwood City Pokémon Gym. Leader: Chuck, whose fists do the talking.',
    '16,9': 'Cianwood Pharmacy. Our secret recipes have healed Pokémon for five hundred years.',
    '19,19': 'Cianwood City. A port town of rough seas and rough rocks.'
  },
  npcs: [
    { id: 'suicune', who: 'suicune', mon: 'suicune', x: 22, y: 12, dir: 'left', fixed: true, if: 'scripted' },
    { id: 'eusine', who: 'eusine', x: 18, y: 13, dir: 'right', if: 'cianwood-suicune',
      say: 'Suicune was right here! It ran off over the waves before I could get close. But I will catch up with it, you will see!' },
    { id: 'sailor', who: 'sailor', x: 19, y: 14, dir: 'right', script: 'whirl.sailor' },
    { id: 'kid', who: 'youngster', x: 8, y: 20, move: 'wander', r: 2,
      say: 'Chuck trains under a waterfall every morning. He shouts so loud you can hear him across town!' },
    { id: 'man', who: 'hiker', x: 16, y: 23, move: 'look',
      say: 'The rocks here are full of Shuckle. They keep Berries in their shells until they turn to juice.' }
  ],
  triggers: [{ x: 20, y: 3, w: 4, h: 25, if: '!cianwood-suicune', script: 'cianwood.suicune' }]
});

G.Maps.center('cianwood-center', {
  loc: 'cianwood-city', exit: { map: 'cianwood', spot: 'center-door' },
  npcs: [{ id: 'man', who: 'blackbelt', x: 9, y: 5, move: 'look',
           say: 'I came to train with Chuck. Three days in, I can barely lift my arms!' }]
}).region = 'johto';

G.Maps.def({
  id: 'pharmacy', loc: 'cianwood-city', region: 'johto', tileset: 'indoor', palette: 'mart', music: 'mart', battleBg: 'indoor',
  rows: ['WWWWWWWWWW', 'WWWWWWWWWW', 'b+b+b++++p', '++++++++++', '+===++++++', '++++++++++', 'p+++++++++', '++++X+++++'],
  warps: [{ x: 4, y: 7, to: 'cianwood', spot: 'pharmacy-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'pharmacist', who: 'gentleman', x: 2, y: 3, dir: 'down', script: 'cianwood.pharmacist' },
    { id: 'shopper', who: 'lass', x: 7, y: 5, move: 'look',
      say: 'People sail all the way from Olivine for the medicine here.' }
  ]
});

const CW_HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
G.Maps.def({
  id: 'chuck-house', loc: 'cianwood-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: CW_HOUSE, warps: [{ x: 4, y: 7, to: 'cianwood', spot: 'chuck-door' }], spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'wife', who: 'beauty', x: 7, y: 4, dir: 'left', script: 'cianwood.chucks-wife' },
    { id: 'poliwrath', who: 'poliwrath', mon: 'poliwrath', x: 2, y: 5, dir: 'right', fixed: true,
      say: 'A Poliwrath, flexing its arms. Even Chuck\'s house Pokémon trains.' }
  ]
});
G.Maps.def({
  id: 'cianwood-house', loc: 'cianwood-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: CW_HOUSE, warps: [{ x: 4, y: 7, to: 'cianwood', spot: 'house-door' }], spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
      say: 'A blue Pokémon with a long mane runs across the water as if it were land. They call it the north wind\'s spirit.' },
    { id: 'girl', who: 'lass', x: 2, y: 5, move: 'look',
      say: 'Chuck looks scary, but he is a big softy with his wife. She is the real boss of the house!' }
  ]
});

// ---------------- Chuck's Gym ----------------
G.Maps.def({
  id: 'cianwood-gym', loc: 'cianwood-city', region: 'johto', tileset: 'indoor', palette: 'dojo', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    'p+++++++++++++p',
    '+++++++++++++++',
    '+++++++++++++++',
    '+ccccc+++ccccc+',
    '+++++++++++++++',
    'cccccc+++cccccc',
    '+++++++++++++++',
    '+++++++++++++++',
    '+cccc++c++cccc+',
    '+++++++++++++++',
    '+++++++++++++++',
    '+++++++++++++++',
    '+++++++++++++++',
    '+++++++X+++++++'
  ],
  warps: [{ x: 7, y: 15, to: 'cianwood', spot: 'gym-door' }],
  spots: { door: [7, 15, 'up'] },
  boulders: [{ id: 'west', x: 6, y: 7 }, { id: 'mid', x: 7, y: 7 }, { id: 'east', x: 8, y: 7 }],
  npcs: [{ id: 'guide', who: 'guide', x: 9, y: 14, dir: 'left', script: 'cianwood.gym-guide' }],
  trainers: [
    { id: 'yoshi', who: 'blackbelt', cls: 'black-belt', name: 'Yoshi', x: 2, y: 8, dir: 'right', sight: 3,
      team: [['hitmonlee', 27]],
      before: 'Hyah! My kicks are sharper than any sword!',
      defeat: 'My legs gave out...',
      after: 'Chuck can punch a boulder out of the way. You will need Strength.' },
    { id: 'lao', who: 'blackbelt', cls: 'black-belt', name: 'Lao', x: 12, y: 8, dir: 'left', sight: 3,
      team: [['hitmonchan', 27]],
      before: 'Punch after punch! Can you keep up?',
      defeat: 'Out-punched...',
      after: 'Fighting types hate Psychic and Flying moves. Do not tell Chuck I said so.' },
    { id: 'nob', who: 'blackbelt', cls: 'black-belt', name: 'Nob', x: 3, y: 12, dir: 'right', sight: 3,
      team: [['machop', 25], ['machoke', 27]],
      before: 'I train every day with Chuck. Feel the power!',
      defeat: 'More training...',
      after: 'Machoke wears a belt to hold back its strength. Scary, right?' },
    { id: 'lung', who: 'blackbelt', cls: 'black-belt', name: 'Lung', x: 11, y: 12, dir: 'left', sight: 3,
      team: [['mankey', 24], ['mankey', 24], ['primeape', 26]],
      before: 'My Mankey get angry fast. And angry means strong!',
      defeat: 'They are even angrier now...',
      after: 'Chuck\'s Poliwrath can put you to sleep and then punch. Bring Awakenings!' },
    { id: 'chuck', who: 'chuck', cls: 'leader', name: 'Chuck', x: 7, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['primeape', 27, ['leer', 'rage', 'karate-chop', 'fury-swipes']],
             ['poliwrath', 29, ['hypnosis', 'mind-reader', 'surf', 'dynamic-punch']]],
      before: 'WAHAHAH! So you came all the way across the sea to battle me? I am Chuck! My Pokémon and I train under the waterfall every day. Come on, let us see your strength!',
      defeat: 'Hwaaah! You are strong! I am shocked!',
      win: 'cianwood.chuck-win',
      afterScript: [['say', 'WAHAHAH! I am going back under the waterfall. I will be even stronger next time!', { name: 'Chuck' }]] }
  ]
});

(() => {
  const T = s => G.T(s);
  const EUSINE = { name: 'Eusine' };

  async function suicune(h) {
    const F = G.Field, me = G.World.player;
    F.setFlag('cianwood-suicune');
    h.place('suicune', 22, Math.max(4, Math.min(26, me.y)), 'left');
    h.show('suicune');
    h.emote('player', '!');
    await h.say(T('A blue Pokémon with a flowing mane stands on the beach, looking at you...'));
    await h.say(T('{mon} turned and ran off across the waves!'), { vars: { mon: h.monName('suicune') } });
    h.hide('suicune');
    h.show('eusine');
    await h.say(T('Suicune! I saw it! It was here, right here! Did it look at you? Lucky...'), EUSINE);
    await h.say(T('It ran off over the sea again. One day it will stop running, and I will be there.'), EUSINE);
  }

  async function pharmacist(h) {
    const F = G.Field;
    if (F.flag('amphy-sick') && !F.flag('amphy-cured') && !F.count('secret-potion')) {
      await h.say(T('The Pokémon that lights the Olivine Lighthouse is sick? Then this is what you need.'));
      F.giveItem('secret-potion', 1);
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('secret-potion') } });
      await j;
      await h.say(T('Our Secret Potion. One dose, and it will be shining again. Hurry back to Olivine!'));
      return;
    }
    await h.say(T('Welcome to the Cianwood Pharmacy. We have medicines you will not find in any Mart.'));
    await h.shop(['super-potion', 'hyper-potion', 'full-heal', 'revive']);
  }

  async function wife(h) {
    const F = G.Field;
    if (F.flag('got-tm08')) { await h.say(T('My husband trains too much. But I would not want him any other way.')); return; }
    await h.say(T('Oh, a Trainer! My husband is the Gym Leader, Chuck. He trains from dawn to dusk.'));
    await h.say(T('Here, take this. It is his favourite move: it makes a Pokémon stronger and tougher at once.'));
    F.giveItem('tm08', 1);
    F.setFlag('got-tm08');
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('tm08') } });
    await j;
  }

  G.Script.def({
    'cianwood.suicune': [['js', suicune]],
    'cianwood.pharmacist': [['js', pharmacist]],
    'cianwood.chucks-wife': [['js', wife]],
    'cianwood.gym-guide': [
      ['say', 'Yo, Champion! Chuck uses Fighting types. Flying and Psychic moves are what they fear.'],
      ['say', 'The boulders in here need Strength. And his Poliwrath can put you to sleep: bring Awakenings!'],
      ['say', 'With four Johto badges, Pokémon up to level 40 obey you. Win here, and it goes up to 50!']
    ],
    'cianwood.chuck-win': [
      ['say', 'WAHAHAH! Here! The Storm Badge! You have earned it!', { name: 'Chuck' }],
      ['badge', 13],
      ['jingle', 'badge'],
      ['say', '{player} received the Storm Badge from Chuck!'],
      ['say', 'With the Storm Badge, Pokémon up to level 50 will listen to you.', { name: 'Chuck' }],
      ['say', 'Take this too! TM01, Focus Punch! Gather all your power, then strike! Just do not get hit while you gather it!', { name: 'Chuck' }],
      ['giveItem', 'tm01', 1],
      ['setFlag', 'chuck-beaten']
    ]
  });
})();
