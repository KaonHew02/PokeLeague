/* ============ pewter.js — Pewter City and Brock's Gym ============
 * The end of the first slice: Pewter City (Center, Mart, the museum, two houses) and
 * its Gym: Camper Liam, then Leader Brock (Geodude Lv. 12, Onix Lv. 14). Beating him
 * gives the Boulder Badge (badge 1) and TM39 Rock Tomb. The road east to Route 3 and
 * Mt. Moon is closed for now. (The texts are our own; the events follow the games.)
 */
G.Maps.def({
  id: 'pewter', loc: 'pewter-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T............................T',
    'T..LLLLLL.........GGGGGG.....T',
    'T..LLLLLL.........GGGGGG.....T',
    'T..LLLLLL.........GGGGGG.....T',
    'T..LLLDLL.........GGGGGG.....T',
    'T.....,......S....GGGDGG.....T',
    'T.....,..............,.......T',
    'T.....,,,,,,,,,,,,,,,,.......T',
    'T.............,,,,,,,,,,,,,,,T',
    'T..HHHH.......,,.....CCCCC...T',
    'T..HHHH.......,,.....CCCCC...T',
    'T..HDHH.......,,.....CCCCC...T',
    'T...,.........,,.....CCDCC...T',
    'T...,,,,,,,,,,,,,,,,,,,,.....T',
    'T.............,,.............T',
    'T..MMMM.......,,.....HHHH....T',
    'T..MMMM.......,,.....HHHH....T',
    'T..MMDM.......,,.....HHDH....T',
    'T....,........,,.......,.....T',
    'T....,,,,,,,,,,,,,,,,,,,.....T',
    'T.........S...,,.............T',
    'T.ff..........,,..........ff.T',
    'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'route2-north', offset: 5 } },
  warps: [
    { x: 6, y: 5, to: 'pewter-museum', spot: 'door' },
    { x: 21, y: 6, to: 'pewter-gym', spot: 'door' },
    { x: 4, y: 12, to: 'pewter-house', spot: 'door' },
    { x: 23, y: 13, to: 'pewter-center', spot: 'door' },
    { x: 5, y: 18, to: 'pewter-mart', spot: 'door' },
    { x: 23, y: 18, to: 'pewter-house2', spot: 'door' }
  ],
  spots: {
    south: [14, 22, 'up'],
    'museum-door': [6, 6, 'down'], 'gym-door': [21, 7, 'down'], 'house-door': [4, 13, 'down'],
    'center-door': [23, 14, 'down'], 'mart-door': [5, 19, 'down'], 'house2-door': [23, 19, 'down']
  },
  signs: {
    '13,6': 'Pewter City Pokémon Gym. Leader: Brock, the rock-solid Pokémon Trainer!',
    '10,21': 'Pewter City. A stone-grey city between the mountains.'
  },
  npcs: [
    { id: 'worker', who: 'guide', x: 28, y: 9, dir: 'left',
      say: 'Sorry, the road east to Route 3 is closed. A rockslide near Mt. Moon blocked it.' },
    { id: 'kid', who: 'youngster', x: 16, y: 7, move: 'wander', r: 1,
      say: "Brock is the Gym Leader here. He's super tough: Rock-type Pokémon shrug off Normal-type moves!" },
    { id: 'girl', who: 'lass', x: 9, y: 16, move: 'look',
      say: 'Have you been to the museum? The fossils of ancient Pokémon are amazing!' },
    { id: 'oldman', who: 'oldman', x: 18, y: 15, move: 'look',
      say: 'Water and Grass moves wear down rocks. Remember that when you face Brock!' }
  ]
});

G.Maps.def({
  id: 'pewter-gym', loc: 'pewter-city', tileset: 'indoor', palette: 'gym', music: 'town', battleBg: 'cave',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    '+++++++++++',
    '++++rrr++++',
    '++++rrr++++',
    'p+++rrr+++p',
    '++++rrr++++',
    '++++rrr++++',
    '++++rrr++++',
    'p+++rrr+++p',
    '++++rrr++++',
    '+t++rrr++t+',
    '++++rrr++++',
    '+++++X+++++'
  ],
  warps: [{ x: 5, y: 13, to: 'pewter', spot: 'gym-door' }],
  spots: { door: [5, 13, 'up'] },
  signs: {
    '1,11': 'Pewter City Pokémon Gym. Leader: Brock. Winning Trainers: {rival}',
    '9,11': 'Pewter City Pokémon Gym. Leader: Brock. Winning Trainers: {rival}'
  },
  npcs: [
    { id: 'guide', who: 'guide', x: 7, y: 12, dir: 'left', script: 'pewter.gym-guide' }
  ],
  trainers: [
    { id: 'liam', who: 'camper', cls: 'camper', name: 'Liam', x: 3, y: 7, dir: 'right', sight: 3,
      team: [['geodude', 10], ['sandshrew', 11]],
      before: "Not so fast! You'll have to beat me before you can even think about Brock!",
      defeat: "Argh! You're better than I thought!",
      after: "Brock is on another level. Normal-type moves barely scratch his Rock-type Pokémon!" },
    { id: 'brock', who: 'brock', cls: 'leader', name: 'Brock', x: 5, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['geodude', 12, ['tackle', 'defense-curl']], ['onix', 14, ['tackle', 'bind', 'rock-tomb', 'harden']]],
      before: "So you've come. I'm Brock, Leader of the Pewter Gym. My Pokémon are Rock types: hard as stone and just as stubborn. You still want to challenge me? Then show me what you've got!",
      defeat: 'Well done. I underestimated you, and it cost me.',
      win: 'pewter.brock-win',
      afterScript: [
        ['say', 'The next Gym is in Cerulean City, past Mt. Moon. Its Leader uses Water-type Pokémon.', { name: 'Brock' }],
        ['say', 'Keep training, {player}. There are many strong Trainers out there!', { name: 'Brock' }]
      ] }
  ]
});

G.Maps.def({
  id: 'pewter-museum', loc: 'pewter-city', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWW',
    'WWWWWWWWWWWWW',
    '+++++++++++++',
    '+++t++t++t+++',
    '+++++++++++++',
    '+++++++++++++',
    'b+++++++++++b',
    'p+++++++++++p',
    '++++++X++++++'
  ],
  warps: [{ x: 6, y: 8, to: 'pewter', spot: 'museum-door' }],
  spots: { door: [6, 8, 'up'] },
  signs: {
    '3,3': 'A fossil of Kabutops, an ancient Pokémon that hunted in the seas long ago.',
    '6,3': 'A fossil of Aerodactyl, a Pokémon that once ruled the ancient skies.',
    '9,3': 'A strange glowing stone that fell from the sky. Some say it came from the moon.',
    '0,6': 'Books about fossils and the history of Pokémon.',
    '12,6': 'Books about fossils and the history of Pokémon.'
  },
  npcs: [
    { id: 'curator', who: 'aide', x: 10, y: 5, dir: 'left',
      say: 'Welcome to the Pewter Museum of Science! Fossils are what remains of Pokémon that lived ages ago.' },
    { id: 'visitor', who: 'oldman', x: 4, y: 4, dir: 'up',
      say: 'They say scientists can bring Pokémon back from fossils. Imagine that!' }
  ]
});

G.Maps.def({
  id: 'pewter-house', loc: 'pewter-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bb__p______',
    '___________',
    '____ttt____',
    '____ttt____',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'pewter', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: { '0,2': 'Rock collections, neatly labelled.', '1,2': 'Rock collections, neatly labelled.' },
  npcs: [
    { id: 'grandpa', who: 'oldman', x: 7, y: 4, dir: 'left',
      say: "Brock has been raising Rock-type Pokémon since he was a boy. He works hard, that one." }
  ]
});

G.Maps.def({
  id: 'pewter-house2', loc: 'pewter-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bbb_p____bb',
    '___________',
    '___ttt_____',
    '___ttt_____',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'pewter', spot: 'house2-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'boy', who: 'youngster', x: 7, y: 4, dir: 'left',
      say: "A Pokémon's type matters a lot! Water beats Rock, Rock beats Flying, and Flying beats Bug." },
    { id: 'mother', who: 'mom', x: 2, y: 5, move: 'wander', r: 1,
      say: 'My son wants to challenge the Gym one day. I hope he studies as hard as he plays!' }
  ]
});

G.Maps.center('pewter-center', {
  loc: 'pewter-city', exit: { map: 'pewter', spot: 'center-door' },
  npcs: [{ id: 'trainer', who: 'camper', x: 9, y: 5, move: 'look',
           say: 'If a Pokémon faints in battle, the others can keep going. Lose them all, though, and you black out!' }]
});

G.Maps.mart('pewter-mart', {
  loc: 'pewter-city', exit: { map: 'pewter', spot: 'mart-door' },
  stock: ['poke-ball', 'potion', 'escape-rope', 'antidote', 'burn-heal', 'awakening', 'paralyze-heal']
});

G.Script.def({
  'pewter.brock-win': [
    ['say', 'As proof of your victory, take this: the Boulder Badge, an official Pokémon League badge!', { name: 'Brock' }],
    ['badge', 1],
    ['jingle', 'badge'],
    ['say', '{player} received the Boulder Badge from Brock!'],
    ['say', 'Take this as well. It is TM39: it teaches Rock Tomb, which hurts the foe and lowers its Speed.', { name: 'Brock' }],
    ['giveItem', 'tm39', 1],
    ['say', 'Keep training, {player}. There are many strong Trainers out there!', { name: 'Brock' }]
  ],
  'pewter.gym-guide': [
    ['if', 'badge:1', [
      ['say', 'You beat Brock! That was incredible. The Pokémon League is waiting for you!']
    ], [
      ['say', "Hey there, future Champion! Let me give you some advice."],
      ['say', 'Brock uses Rock-type Pokémon. Water and Grass moves hit them hard, but Normal moves barely do a thing.'],
      ['say', "If your starter isn't a good match, catch a few more Pokémon to help out. A Mankey from Route 22 knows Low Kick, and big, heavy Onix really feels it!"],
      ['say', 'Good luck!']
    ]]
  ]
});
