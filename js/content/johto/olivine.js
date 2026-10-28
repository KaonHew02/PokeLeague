/* ============ olivine.js — Olivine City, the Lighthouse and Jasmine ============
 * Chapter 15, the end of the chapter. Olivine: a harbour (the S.S. Aqua is not sailing), a
 * Pokémon Center, a Mart, the café, two houses, the Lighthouse and Jasmine's Gym, which is empty:
 * Jasmine stays at the top of the Lighthouse with Amphy, the Ampharos that lights the sea, which
 * is sick (flag amphy-sick). The medicine is at the pharmacy in Cianwood City, across the sea
 * (cianwood.js). Bring her the Secret Potion and Amphy shines again (flag amphy-cured); Jasmine
 * goes back to her Gym: no Trainers, then Jasmine (Magnemite, Magnemite, Steelix): badge 14, the
 * Mineral Badge (Pokémon up to Lv. 60 obey), TM23 Iron Tail (flag jasmine-beaten), `ending(15)`.
 * The harbour west is Sea Route 40 (Surf).
 */
G.Maps.def({
  id: 'olivine', loc: 'olivine-city', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTT',
    'TTTTTTTTT...........,,.........TTTTTTTTT',
    'TTTTTTTTT...........,,S........TTTTTTTTT',
    'TTTTTTTTT.KKKKK.....,,..GGGGGG.TTTTTTTTT',
    'TTTTTTTTT.KKKKK.....,,..GGGGGG.TTTTTTTTT',
    'TTTTTTTTT.KKKKK.....,,..GGGGGG.TTTTTTTTT',
    'TTTTTTTTT.KKKKK.....,,..GGGGGG.TTTTTTTTT',
    'TTTTTTTTT.KKDKK.....,,..GGDGGG.TTTTTTTTT',
    'TTTTTTTTT...,S......,,....,S...TTTTTTTTT',
    'TTTTTTTTT...,.......,,....,............T',
    'TTTTTTTTT.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
    'TTTTTTTTT.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
    '~~~~~~~~~.......ff..,,..............ff.T',
    '~~~~~~~~~...........,,........CCCCC....T',
    '~~~~~~~~~....HHHH...,,..MMMM..CCCCC....T',
    '~~~~~~~~~....HHHH...,,..MMMM..CCCCC....T',
    '~~~~~~~~~....HDHH...,,..MDMM..CCDCC....T',
    '~~~~~~~~~.....,.....,,...,......,......T',
    '~~~~~~~~~.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
    '~~~~~~~~~.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.T',
    '~~~~~~~~~.ff........,,.................T',
    '~~~~~~~~~....HHHH...,,......HHHH...y...T',
    '~~~~~~~~~....HHHH...,,......HHHH.......T',
    '~~~~~~~~~....HDHH...,,......HDHH.......T',
    '~~~~~~~~~.....,,,,,,,,,,,,,,,,.........T',
    '~~~~~~~~~...........,,S..........ff....T',
    '~~~~~~~~~...........,,.................T',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
  ],
  connect: { north: { map: 'route39', offset: 10 }, west: { map: 'route40', offset: 12 } },
  warps: [
    { x: 12, y: 7, to: 'lighthouse-1f', spot: 'door' },
    { x: 26, y: 7, to: 'olivine-gym', spot: 'door', if: 'amphy-cured', locked: 'olivine.gym-closed' },
    { x: 32, y: 16, to: 'olivine-center', spot: 'door' },
    { x: 25, y: 16, to: 'olivine-mart', spot: 'door' },
    { x: 14, y: 16, to: 'olivine-cafe', spot: 'door' },
    { x: 14, y: 23, to: 'olivine-house', spot: 'door' },
    { x: 29, y: 23, to: 'olivine-house2', spot: 'door' }
  ],
  spots: {
    'lighthouse-door': [12, 8, 'down'], 'gym-door': [26, 8, 'down'], 'center-door': [32, 17, 'down'], 'mart-door': [25, 17, 'down'],
    'cafe-door': [14, 17, 'down'], 'house-door': [14, 24, 'down'], 'house2-door': [29, 24, 'down']
  },
  berries: [[35, 21, 'sitrus-berry']],
  signs: {
    '22,2': 'Olivine City. A port town that smells of the sea breeze.',
    '13,8': 'Olivine Lighthouse. Its light guides the ships at night.',
    '27,8': 'Olivine City Pokémon Gym. Leader: Jasmine, the girl of steel and gentle heart.',
    '22,25': 'Olivine Port. The S.S. Aqua is in the dock for repairs. Sailings will resume soon.'
  },
  npcs: [
    { id: 'sailor', who: 'sailor', x: 17, y: 26, move: 'look',
      say: 'The sea west of here leads to Cianwood City. You will need a Pokémon that can Surf.' },
    { id: 'kid', who: 'youngster', x: 23, y: 9, move: 'wander', r: 2, if: '!amphy-cured',
      say: 'Jasmine, our Gym Leader, has not left the Lighthouse for days. Her Pokémon up there is sick.' },
    { id: 'kid2', who: 'youngster', x: 23, y: 9, move: 'wander', r: 2, if: 'amphy-cured',
      say: 'The Lighthouse is shining again! Jasmine is back at her Gym.' },
    { id: 'lass', who: 'lass', x: 34, y: 18, move: 'look',
      say: 'Moomoo Milk from the farm up north is sold at the café. It is delicious!' }
  ]
});

G.Maps.center('olivine-center', {
  loc: 'olivine-city', exit: { map: 'olivine', spot: 'center-door' },
  npcs: [{ id: 'man', who: 'sailor', x: 9, y: 5, move: 'look',
           say: 'Cianwood City is across the sea to the west. People say a Pokémon that runs on water was seen there!' }]
}).region = 'johto';

G.Maps.mart('olivine-mart', {
  loc: 'olivine-city', exit: { map: 'olivine', spot: 'mart-door' },
  stock: ['great-ball', 'ultra-ball', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'full-heal', 'revive', 'super-repel'],
  npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
           say: 'Steel types resist almost everything. Fire, Fighting and Ground moves get through, though.' }]
}).region = 'johto';

const OLV_HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___b', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
const olvHouse = (id, spot, o) => G.Maps.def(Object.assign({
  id, loc: 'olivine-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: OLV_HOUSE, warps: [{ x: 4, y: 7, to: 'olivine', spot }], spots: { door: [4, 7, 'up'] }
}, o));

olvHouse('olivine-cafe', 'cafe-door', {
  npcs: [
    { id: 'sailor', who: 'sailor', x: 7, y: 4, dir: 'left',
      say: 'When I was young, I pushed boulders around with Strength to train. They say the Gym in Cianwood is full of rocks like that.' },
    { id: 'cook', who: 'gentleman', x: 2, y: 5, dir: 'right',
      say: 'Welcome to the Olivine Café! Our Moomoo Milk comes fresh from the farm on Route 39.' }
  ]
});
olvHouse('olivine-house', 'house-door', {
  npcs: [
    { id: 'man', who: 'oldman', x: 7, y: 4, dir: 'left',
      say: 'The Lighthouse has guided ships for a hundred years. Its light is not a lamp: it is a Pokémon that shines.' },
    { id: 'girl', who: 'lass', x: 2, y: 5, move: 'look',
      say: 'Jasmine is so kind. She is shy, but when she battles, she is as hard as steel!' }
  ]
});
olvHouse('olivine-house2', 'house2-door', {
  npcs: [
    { id: 'woman', who: 'beauty', x: 7, y: 4, dir: 'left',
      say: 'My husband is a sailor on the S.S. Aqua. When it is fixed, it will sail to Vermilion City in Kanto.' }
  ]
});

// ---------------- the Lighthouse ----------------
const LIGHT = { loc: 'johto-lighthouse', region: 'johto', tileset: 'indoor', palette: 'gym', music: 'route', battleBg: 'indoor' };
G.Maps.def(Object.assign({
  id: 'lighthouse-1f',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    'p++++++++++^+p',
    '++++++++++++++',
    '++b++++++++b++',
    '++++++++++++++',
    '++++++++++++++',
    '++b++++++++b++',
    '++++++++++++++',
    '++++++X+++++++'
  ],
  warps: [{ x: 6, y: 9, to: 'olivine', spot: 'lighthouse-door' }, { x: 11, y: 2, to: 'lighthouse-2f', spot: 'from-below' }],
  spots: { door: [6, 9, 'up'], 'from-above': [11, 3, 'down'] },
  trainers: [
    { id: 'huey', who: 'sailor', cls: 'sailor', name: 'Huey', x: 3, y: 6, dir: 'right', sight: 3,
      team: [['poliwag', 24], ['poliwhirl', 25]],
      before: 'This Lighthouse is a sailor\'s best friend. Do not you dare disturb it!',
      defeat: 'I was only guarding it...',
      after: 'Without the light up top, ships could hit the rocks at night.' },
    { id: 'alfred', who: 'gentleman', cls: 'gentleman', name: 'Alfred', x: 10, y: 5, dir: 'left', sight: 3,
      team: [['noctowl', 26]],
      before: 'Noctowl sees in the dark as well as you see in daylight. Shall we?',
      defeat: 'I did not see that coming, even so.',
      after: 'Jasmine is at the very top, with the Pokémon that lights the sea.' }
  ]
}, LIGHT));
G.Maps.def(Object.assign({
  id: 'lighthouse-2f',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    '^++++++++++^+p',
    '++++++++++++++',
    '++b++++++++b++',
    '++++++++++++++',
    '++++++++++++++',
    '++b++++++++b++',
    '++++++++++++++',
    'p++++++++++++p'
  ],
  warps: [{ x: 11, y: 2, to: 'lighthouse-1f', spot: 'from-above' }, { x: 0, y: 2, to: 'lighthouse-3f', spot: 'from-below' }],
  spots: { 'from-below': [11, 3, 'down'], 'from-above': [0, 3, 'down'] },
  trainers: [
    { id: 'connie', who: 'lass', cls: 'lass', name: 'Connie', x: 3, y: 5, dir: 'right', sight: 3,
      team: [['marill', 26]],
      before: 'I came to see the light Pokémon, but it is sick... Let us battle to cheer up!',
      defeat: 'Not very cheerful...',
      after: 'Marill\'s tail floats like a ball. It never sinks in the water.' },
    { id: 'kent', who: 'sailor', cls: 'sailor', name: 'Kent', x: 9, y: 7, dir: 'left', sight: 3,
      team: [['krabby', 25], ['kingler', 27]],
      before: 'My Kingler\'s claw can crush rocks! Ready?',
      defeat: 'Pinched back...',
      after: 'A sick light means a dark sea. Every sailor in Olivine is worried.' }
  ]
}, LIGHT));
G.Maps.def(Object.assign({
  id: 'lighthouse-3f',
  rows: [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    '^+++++rr+++++p',
    '++++++rr++++++',
    '++++++++++++++',
    '++++++++++++++',
    '++b++++++++b++',
    '++++++++++++++',
    '++++++++++++++',
    'p++++++++++++p'
  ],
  warps: [{ x: 0, y: 2, to: 'lighthouse-2f', spot: 'from-above' }],
  spots: { 'from-below': [0, 3, 'down'] },
  npcs: [
    { id: 'jasmine', who: 'jasmine', x: 8, y: 4, dir: 'left', if: '!amphy-cured', script: 'lighthouse.jasmine' },
    { id: 'amphy', who: 'ampharos', mon: 'ampharos', x: 6, y: 3, dir: 'down', fixed: true, if: '!amphy-cured',
      say: 'Amphy, the Ampharos, is breathing weakly. The light on its tail has almost gone out.' },
    { id: 'amphy2', who: 'ampharos', mon: 'ampharos', x: 6, y: 3, dir: 'down', fixed: true, if: 'amphy-cured',
      say: 'Pa-paloo! Amphy\'s tail shines brightly over the sea.' }
  ]
}, LIGHT));

// ---------------- Jasmine's Gym ----------------
G.Maps.def({
  id: 'olivine-gym', loc: 'olivine-city', region: 'johto', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'p+++++++++p',
    '+++++++++++',
    '++rrrrrrr++',
    '++rrrrrrr++',
    '++rrrrrrr++',
    '++rrrrrrr++',
    '++rrrrrrr++',
    '+++++++++++',
    'p+++++++++p',
    '+++++X+++++'
  ],
  warps: [{ x: 5, y: 11, to: 'olivine', spot: 'gym-door' }],
  spots: { door: [5, 11, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 7, y: 10, dir: 'left', script: 'olivine.gym-guide' }],
  trainers: [
    { id: 'jasmine', who: 'jasmine', cls: 'leader', name: 'Jasmine', x: 5, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['magnemite', 28, ['thunder-shock', 'supersonic', 'sonic-boom', 'thunder-wave']],
             ['magnemite', 28, ['thunder-shock', 'supersonic', 'sonic-boom', 'thunder-wave']],
             ['steelix', 33, ['screech', 'rock-throw', 'iron-tail', 'sandstorm']]],
      before: 'Thank you again for saving Amphy. But in here, I am a Gym Leader. I use Steel-type Pokémon. They are hard and cold... but strong. Shall we begin?',
      defeat: '...Well done. You are as strong as steel yourself.',
      win: 'olivine.jasmine-win',
      afterScript: [['say', 'Amphy and I will keep the light shining. Please come back to Olivine any time.', { name: 'Jasmine' }]] }
  ]
});

(() => {
  const T = s => G.T(s);
  const JASMINE = { name: 'Jasmine' };

  async function jasmine(h) {
    const F = G.Field;
    if (F.count('secret-potion')) {
      await h.say(T('That is... the Secret Potion from Cianwood! Please, give it to Amphy.'), JASMINE);
      F.takeItem('secret-potion', 1);
      await h.say(T('{player} gave the Secret Potion to Amphy.'));
      h.emote('amphy', '!');
      await h.jingle('heal');
      await h.say(T('Pa... Pa-paloo!'), { name: 'Amphy' });
      F.setFlag('amphy-cured');
      await h.say(T('Amphy! Your light is back! Thank you so much. I could not leave it alone, not even for a moment.'), JASMINE);
      await h.say(T('I must go back to my Gym now. Come and challenge me there. I will be waiting.'), JASMINE);
      return;
    }
    F.setFlag('amphy-sick');
    await h.say(T('...This is Amphy. It lights the sea at night, so the ships do not get lost.'), JASMINE);
    await h.say(T('But Amphy fell ill, and its light is fading. I cannot leave its side.'), JASMINE);
    await h.say(T('They say the pharmacy in Cianwood City, across the sea, makes a medicine that cures anything. Would you... bring it here for me?'), JASMINE);
  }

  G.Script.def({
    'lighthouse.jasmine': [['js', jasmine]],
    'olivine.gym-closed': [['say', 'The Gym is empty. A sign on the door reads: "Jasmine is at the Lighthouse, caring for a sick Pokémon."']],
    'olivine.gym-guide': [
      ['say', 'Yo, Champion! Jasmine uses Steel types. They resist almost everything: hit them with Fire, Fighting or Ground moves.'],
      ['say', 'Her Magnemite are part Electric, so Ground moves are double trouble for them. Her Steelix is huge, but slow.'],
      ['say', 'With five Johto badges, Pokémon up to level 50 obey you. Win here, and it goes up to 60!']
    ],
    'olivine.jasmine-win': [
      ['say', 'This is the Mineral Badge. You have earned it.', { name: 'Jasmine' }],
      ['badge', 14],
      ['jingle', 'badge'],
      ['say', '{player} received the Mineral Badge from Jasmine!'],
      ['say', 'With the Mineral Badge, Pokémon up to level 60 will listen to you.', { name: 'Jasmine' }],
      ['say', 'And this, too: TM23, Iron Tail. A tail as hard as steel. It may even lower the target\'s Defence.', { name: 'Jasmine' }],
      ['giveItem', 'tm23', 1],
      ['setFlag', 'jasmine-beaten'],
      ['js', async () => { if (G.CreditsUI) await G.CreditsUI.ending(15); else G.Field.setFlag('chapter-15-done'); }]
    ]
  });
})();
