/* ============ cinnabar.js — Cinnabar Island ============
 * Chapter 7, part 3. A volcanic island at the south of Kanto, reached over the sea: Route 21 from
 * Pallet Town in the north, Route 20 from the Seafoam Islands in the east (sea.js). Pokémon Center,
 * Mart, the burnt Pokémon Mansion (mansion.js), the Pokémon Lab and Blaine's Gym (blaine.js), whose
 * door stays locked until you hold the Secret Key from the mansion's basement.
 * The Pokémon Lab brings fossils back to life: hand one in (Helix Fossil, Dome Fossil, or the Old
 * Amber from the Pewter Museum), leave the lab and come back: Omanyte, Kabuto or Aerodactyl at
 * Lv. 30 (as in the first games; flags fossil-waiting, fossil-ready, var fossil-mon).
 */
G.Maps.def({
  id: 'cinnabar', loc: 'cinnabar-island', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'sea', border: '~',
  fly: { spot: 'center-door', if: 'badge:7' },
  rows: [
    '~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~:::::::::::::::::::~~~',
    '~:.RRRRRR...LLLLLL...:~~',
    '~:.RRRRRR...LLLLLL...:~~',
    '~:.RRRRRR...LLLLLL...:~~',
    '~:.RRRRRR...LLDLLL...:~~',
    '~:.RRDRRR.....,......:~~',
    '~:...,....S...,.....S:~~',
    '~:...,,,,,,,,,,,,,,,,:~~',
    '~:..........,........:~~',
    '~:.CCCCC....,.GGGGGG.:~~',
    '~:.CCCCC.MMMM.GGGGGG.:~~',
    '~:.CCCCC.MMMM.GGGGGG.:~~',
    '~:.CCDCC.MMDM.GGGGGG.:~~',
    '~:...,.....,,.GGGDGGS:~~',
    '~:...,,,,,,,,,,,,,...:~~',
    '~:ff....ff...........:~~',
    '~:...................:~~',
    '~~:::::::::::::::::::~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~'
  ],
  connect: { north: { map: 'route21', offset: 0 }, east: { map: 'route20', offset: 2 } },
  warps: [
    { x: 5, y: 8, to: 'pokemon-mansion-1f', spot: 'door' },
    { x: 14, y: 7, to: 'cinnabar-lab', spot: 'door' },
    { x: 5, y: 15, to: 'cinnabar-center', spot: 'door' },
    { x: 11, y: 15, to: 'cinnabar-mart', spot: 'door' },
    { x: 17, y: 16, to: 'cinnabar-gym', spot: 'door', if: 'has:secret-key', locked: 'cinnabar.gym-locked' }
  ],
  spots: { 'mansion-door': [5, 9, 'down'], 'lab-door': [14, 8, 'down'], 'center-door': [5, 16, 'down'],
           'mart-door': [11, 16, 'down'], 'gym-door': [17, 17, 'down'] },
  signs: {
    '10,9': 'Cinnabar Island. An island town on a sleeping volcano, as hot-blooded as its Gym Leader.',
    '20,9': 'The Cinnabar dock. North across the sea: Pallet Town. East: the Seafoam Islands and Fuchsia City.',
    '20,16': 'Cinnabar Island Pokémon Gym. Leader: Blaine, the fiery quiz master!'
  },
  npcs: [
    { id: 'scientist', who: 'scientist', x: 9, y: 11, move: 'wander', r: 2,
      say: 'The Pokémon Lab here can bring fossils back to life. Have you found one?' },
    { id: 'girl', who: 'lass', x: 18, y: 18, move: 'look',
      say: 'Blaine lost the key to his own Gym in the old mansion! Nobody has been brave enough to look for it.' },
    { id: 'oldman', who: 'oldman', x: 3, y: 10, dir: 'right', move: 'look',
      say: 'That mansion burned down long ago. Researchers lived there. Strange Pokémon roam its halls now.' }
  ],
  encounters: { water: '@cinnabar-island-area' }
});

G.Maps.center('cinnabar-center', {
  loc: 'cinnabar-island', exit: { map: 'cinnabar', spot: 'center-door' },
  npcs: [{ id: 'trainer', who: 'cooltrainer', x: 9, y: 5, move: 'look',
           say: 'Blaine asks quiz questions in his Gym. Get one wrong and a Trainer jumps out to battle you!' }]
});

G.Maps.mart('cinnabar-mart', {
  loc: 'cinnabar-island', exit: { map: 'cinnabar', spot: 'mart-door' },
  stock: ['ultra-ball', 'great-ball', 'hyper-potion', 'max-repel', 'escape-rope', 'full-heal', 'revive']
});

G.Maps.def({
  id: 'cinnabar-lab', loc: 'cinnabar-island', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWW',
    'WWWWWWWWWWWWW',
    'bb+++P+++++bb',
    '+++++++++++++',
    '++tt+++++tt++',
    '++tt+++++tt++',
    '+++++++++++++',
    'p+++++++++++p',
    '++++++X++++++'
  ],
  warps: [{ x: 6, y: 8, to: 'cinnabar', spot: 'lab-door' }],
  spots: { door: [6, 8, 'up'] },
  enter: 'cinnabar.lab-enter',
  signs: {
    '0,2': 'Research notes on fossils: some ancient Pokémon can be brought back from what they left behind.',
    '12,2': 'A thick report about a Pokémon found in a faraway jungle. Most of the pages are missing.'
  },
  npcs: [
    { id: 'fossil', who: 'scientist', x: 7, y: 3, dir: 'down', script: 'cinnabar.fossil' },
    { id: 'aide', who: 'aide', x: 10, y: 6, move: 'look',
      say: 'The people who lived in the mansion studied a very rare Pokémon. We still do not know what became of it.' },
    { id: 'boy', who: 'youngster', x: 3, y: 6, move: 'wander', r: 1,
      say: 'I want to see a living fossil Pokémon one day! They lived millions of years ago!' }
  ]
});

G.Script.def({
  'cinnabar.gym-locked': [
    ['say', 'The Gym door is locked. A note is stuck to it.'],
    ['say', '"I lost the key somewhere in the old mansion. Bring it to me if you want a battle! —Blaine"']
  ],
  // Leaving the lab and coming back finishes the work on a fossil.
  'cinnabar.lab-enter': [
    ['if', 'fossil-waiting', [['setFlag', 'fossil-ready']]]
  ],
  'cinnabar.fossil': [
    ['if', 'fossil-waiting', [
      ['if', '!fossil-ready', [
        ['say', 'Bringing a fossil back to life takes a little while. Take a walk outside and come back.', { name: 'Scientist' }]
      ], [
        ['say', 'Ah, there you are! The fossil you gave me has come back to life!', { name: 'Scientist' }],
        ['js', async h => {
          const j = h.jingle('caught');
          await h.say(G.T('{player} received {mon}!'), { vars: { mon: h.monName(G.Field.getVar('fossil-mon')) } });
          await j;
        }],
        ['if', 'fossil-mon=omanyte', [['giveMon', 'omanyte', 30, { nickname: true }]]],
        ['if', 'fossil-mon=kabuto', [['giveMon', 'kabuto', 30, { nickname: true }]]],
        ['if', 'fossil-mon=aerodactyl', [['giveMon', 'aerodactyl', 30, { nickname: true }]]],
        ['clearFlag', 'fossil-waiting'], ['clearFlag', 'fossil-ready'], ['setVar', 'fossil-mon', ''],
        ['say', 'Take good care of it. It has a lot of catching up to do!', { name: 'Scientist' }]
      ]]
    ], [
      ['if', 'has:helix-fossil', [['call', 'cinnabar.fossil-helix']], [
        ['if', 'has:dome-fossil', [['call', 'cinnabar.fossil-dome']], [
          ['if', 'has:old-amber', [['call', 'cinnabar.fossil-amber']], [
            ['say', 'I study fossils. With our machine, a fossil can become a living Pokémon again!', { name: 'Scientist' }],
            ['say', 'If you ever find one, bring it to me.', { name: 'Scientist' }]
          ]]
        ]]
      ]]
    ]]
  ],
  'cinnabar.fossil-helix': [
    ['choice', 'Oh! That is a Helix Fossil! Shall I bring it back to life?', [
      ['takeItem', 'helix-fossil', 1], ['setVar', 'fossil-mon', 'omanyte'], ['setFlag', 'fossil-waiting'], ['call', 'cinnabar.fossil-taken']
    ], [['call', 'cinnabar.fossil-no']], { name: 'Scientist' }]
  ],
  'cinnabar.fossil-dome': [
    ['choice', 'Oh! That is a Dome Fossil! Shall I bring it back to life?', [
      ['takeItem', 'dome-fossil', 1], ['setVar', 'fossil-mon', 'kabuto'], ['setFlag', 'fossil-waiting'], ['call', 'cinnabar.fossil-taken']
    ], [['call', 'cinnabar.fossil-no']], { name: 'Scientist' }]
  ],
  'cinnabar.fossil-amber': [
    ['choice', 'Oh! Old Amber, with something trapped inside! Shall I bring it back to life?', [
      ['takeItem', 'old-amber', 1], ['setVar', 'fossil-mon', 'aerodactyl'], ['setFlag', 'fossil-waiting'], ['call', 'cinnabar.fossil-taken']
    ], [['call', 'cinnabar.fossil-no']], { name: 'Scientist' }]
  ],
  'cinnabar.fossil-taken': [
    ['say', 'Leave it with me. Go for a walk, and when you come back it should be ready.', { name: 'Scientist' }]
  ],
  'cinnabar.fossil-no': [
    ['say', 'I see. Come back if you change your mind.', { name: 'Scientist' }]
  ]
});
