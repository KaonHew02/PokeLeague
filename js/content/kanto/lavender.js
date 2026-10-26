/* ============ lavender.js — Lavender Town and the Pokémon Tower ============
 * A small, quiet town south of Rock Tunnel: Pokémon Center, Mart, the Pokémon House (its
 * owner, Mr. Fuji, has gone to the tower and not come back), a house with a Cubone, and the
 * Pokémon Tower, where people lay their Pokémon to rest. On the tower's second floor the rival
 * battles you (flag tower-rival); the stairs further up are blocked by something you cannot
 * see (a later chapter brings the Silph Scope). The road west leads to Route 8 and Celadon.
 */
G.Maps.def({
  id: 'lavender', loc: 'lavender-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTT,,TTTTTTTTTTTT',
    'T.........,,...........T',
    'T..CCCCC..,,...MMMM....T',
    'T..CCCCC..,,...MMMM....T',
    'T..CCCCC..,,...MMDM....T',
    'T..CCDCC..,,.....,.....T',
    'T....,....,,.....,.....T',
    'T....,,,,,,,,,,,,,.....T',
    'T,,,,,,,,,,,,,,,,,,,...T',
    'T,,,,,,,,,,,,,,,,,,,...T',
    'T.........,,...........T',
    'T.HHHH....,,...KKKKK...T',
    'T.HHHH....,,...KKKKK...T',
    'T.HDHH....,,...KKKKK...T',
    'T..,......,,...KKKKK...T',
    'T..,,,,,,,,,...KKDKK...T',
    'T.HHHH....,,,,,,,,.....T',
    'T.HHHH....,,...........T',
    'T.HHDH....,,.S.........T',
    'T...,.....,,...........T',
    'TTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { north: { map: 'route10', offset: -7 } },
  warps: [
    { x: 5, y: 5, to: 'lavender-center', spot: 'door' },
    { x: 17, y: 4, to: 'lavender-mart', spot: 'door' },
    { x: 3, y: 13, to: 'lavender-house', spot: 'door' },
    { x: 17, y: 15, to: 'tower-1f', spot: 'door' },
    { x: 4, y: 18, to: 'lavender-house2', spot: 'door' }
  ],
  spots: {
    north: [10, 1, 'down'], 'center-door': [5, 6, 'down'], 'mart-door': [17, 5, 'down'], 'house-door': [3, 14, 'down'],
    'tower-door': [17, 16, 'down'], 'house2-door': [4, 19, 'down']
  },
  signs: { '13,18': 'Lavender Town. A quiet town where Pokémon are remembered with love.' },
  npcs: [
    { id: 'girl', who: 'lass', x: 20, y: 16, move: 'look',
      say: 'The Pokémon Tower is where people say goodbye to their Pokémon. It is sad... and a little spooky at night.' },
    { id: 'oldman', who: 'oldman', x: 16, y: 10, move: 'wander', r: 2,
      say: 'Lately, strange things happen in the tower. People hear voices on the upper floors, but nobody is there.' }
  ],
  encounters: {}
});

G.Maps.center('lavender-center', {
  loc: 'lavender-town', exit: { map: 'lavender', spot: 'center-door' },
  npcs: [{ id: 'channeler', who: 'channeler', x: 9, y: 5, move: 'look',
           say: 'Mr. Fuji looks after Pokémon that have lost their Trainers. He is the kindest man in town.' }]
});

G.Maps.mart('lavender-mart', {
  loc: 'lavender-town', exit: { map: 'lavender', spot: 'mart-door' },
  stock: ['great-ball', 'super-potion', 'revive', 'escape-rope', 'super-repel', 'antidote', 'burn-heal', 'ice-heal', 'awakening', 'paralyze-heal']
});

G.Maps.def({
  id: 'lavender-house', loc: 'lavender-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWW',
    'WWWWWWWWW',
    'bb____tpb',
    '_________',
    '___rr____',
    '_________',
    '___X_____'
  ],
  warps: [{ x: 3, y: 6, to: 'lavender', spot: 'house-door' }],
  spots: { door: [3, 6, 'up'] },
  signs: { '0,2': 'Pokémon House: a home for Pokémon that have lost their Trainers. Run by Mr. Fuji.', '1,2': 'Pokémon House: a home for Pokémon that have lost their Trainers. Run by Mr. Fuji.' },
  npcs: [
    { id: 'girl', who: 'lass', x: 5, y: 3, dir: 'down', move: 'look',
      say: 'Mr. Fuji went to the Pokémon Tower to pray for the Pokémon there. He has not come back... I hope he is all right.' },
    { id: 'psyduck', who: 'psyduck', mon: 'psyduck', x: 2, y: 4, dir: 'right', move: 'look',
      say: 'Psyduck tilts its head. It seems to be waiting for someone to come home.' },
    { id: 'nidorino', who: 'nidorino', mon: 'nidorino', x: 7, y: 5, dir: 'left', move: 'look',
      say: 'Nidorino keeps looking at the door.' }
  ]
});

G.Maps.def({
  id: 'lavender-house2', loc: 'lavender-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWW',
    'WWWWWWWW',
    'b___t__p',
    '________',
    '__rr____',
    '___X____'
  ],
  warps: [{ x: 3, y: 5, to: 'lavender', spot: 'house2-door' }],
  spots: { door: [3, 5, 'up'] },
  npcs: [
    { id: 'woman', who: 'mom', x: 5, y: 3, dir: 'down', move: 'look',
      say: 'I found this Cubone alone near the tower. It never takes off the skull it wears. I let it stay with me as long as it likes.' },
    { id: 'cubone', who: 'cubone', mon: 'cubone', x: 2, y: 3, dir: 'right', move: 'look',
      say: 'Cubone hugs its bone tightly and looks away.' }
  ]
});

G.Maps.def({
  id: 'tower-1f', loc: 'pokemon-tower', tileset: 'indoor', palette: 'tower', music: 'cave', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    '+g+g+g+g++^+',
    '++++++++++++',
    '+g+g+g+g++++',
    '++++++++++++',
    '+g+g+g++++++',
    '++++++++++++',
    '++++++++++++',
    '+++++X++++++'
  ],
  warps: [{ x: 5, y: 9, to: 'lavender', spot: 'tower-door' }, { x: 10, y: 2, to: 'tower-2f', spot: 'stairs' }],
  spots: { door: [5, 9, 'up'], stairs: [10, 3, 'down'] },
  signs: {
    '1,2': 'A gravestone with fresh flowers. "Rest well, my friend."',
    '3,2': 'A small gravestone. Someone has left a Poké Ball-shaped stone on it.'
  },
  npcs: [
    { id: 'channeler', who: 'channeler', x: 2, y: 7, dir: 'right', move: 'look',
      say: 'The spirits upstairs are restless. Nobody can see them... They say only a special scope made by Silph Co. can.' },
    { id: 'mourner', who: 'lass', x: 8, y: 5, dir: 'up', move: 'look',
      say: 'I came to visit my Growlithe. It always loved running in the sun. I hope it can run free now.' }
  ]
});

G.Maps.def({
  id: 'tower-2f', loc: 'pokemon-tower', tileset: 'indoor', palette: 'tower', music: 'cave', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    '+^+g+g+g++^+',
    '++++++++++++',
    '+++g+g+g++++',
    '++++++++++++',
    '+++g+g+g++++',
    '++++++++++++',
    '+g+g++++g+g+',
    '++++++++++++'
  ],
  warps: [{ x: 10, y: 2, to: 'tower-1f', spot: 'stairs' }, { x: 1, y: 2, locked: 'tower.upstairs' }],
  spots: { stairs: [10, 3, 'down'] },
  npcs: [{ id: 'rival', who: 'rival', x: 1, y: 3, dir: 'down', if: 'scripted' }],
  // Every way to the stairs up crosses column 4: the rival meets you there once.
  triggers: [{ x: 4, y: 3, w: 1, h: 7, if: '!tower-rival', script: 'tower.rival' }]
});

(() => {
  const T = s => G.T(s);
  const RIVAL = { name: '{rival}' };
  const EVOLVED = { 1: 2, 4: 5, 7: 8 };
  // The rival's team after the starter he picked, as in the games.
  const MIDDLE = { 1: [['gyarados', 23], ['growlithe', 22]], 4: [['exeggcute', 23], ['gyarados', 22]], 7: [['growlithe', 23], ['exeggcute', 22]] };

  /** The rival on the tower's second floor. */
  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('tower-rival');
    h.place('rival', 1, 3, 'down');
    h.show('rival');
    await h.say(T("Hey, {player}! What are you doing in the Pokémon Tower? Don't tell me one of your Pokémon..."), RIVAL);
    await h.walkTo('rival', me.x - 1, me.y);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T("Oh, they're all fine? Good. Then let's see how strong they've gotten!"), RIVAL);
    const st = S.rival.starter;
    const out = await h.battle({ id: 'rival-tower', who: 'rival', name: S.rival.name, prize: 35, ai: 'basic',
      team: [['pidgeotto', 25], ...(MIDDLE[st] || MIDDLE[1]), ['kadabra', 20], [EVOLVED[st] || 2, 25]] }, {});
    if (out === 'lose') return;
    await h.say(T("Hmph. You're not bad. But listen: people say there are ghosts upstairs that nobody can see."), RIVAL);
    await h.say(T("I'm going to find a way to see them before you do. Later!"), RIVAL);
    h.hide('rival');
  }

  G.Script.def({
    'tower.rival': [['js', rival]],
    'tower.upstairs': [
      ['say', 'An icy chill fills the stairway. Something you cannot see blocks the way up.'],
      ['say', 'Without some way to see the spirits, you cannot go any further.'],
      ['move', 'player', 'D']
    ]
  });
})();
