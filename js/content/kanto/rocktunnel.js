/* ============ rocktunnel.js — Route 9, Route 10 and Rock Tunnel ============
 * East of Cerulean City, behind a small tree that Cut clears: Route 9 (five Trainers),
 * Route 10 with the Rock Tunnel Pokémon Center, and Rock Tunnel itself: 1F (a north part
 * and a south part), joined by B1F. The tunnel is dark (`dark: true`): Flash (HM05, from
 * Professor Oak's aide on Route 2) lights it up, but you can also feel your way through.
 * The south part of Route 10 leads down to Lavender Town (lavender.js).
 */
G.Maps.def({
  id: 'route9', loc: 'kanto-route-9', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T....""""""""........##########....""""""""....T',
    'T....""""""""........##########....""""""""....T',
    'T............S.......##########................T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T......vvvvvvvvvv..............vvvvvvvv........T',
    'T..............................................T',
    'T...""""""""".........."""""""""......"""""""..T',
    'T...""""""""".........."""""""""......"""""""..T',
    'T..............................................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'cerulean', offset: -3 }, east: { map: 'route10', offset: 0 } },
  spots: { west: [1, 4, 'right'] },
  signs: { '13,3': 'Route 9. West: Cerulean City. East: Route 10 and Rock Tunnel.' },
  trainers: [
    { id: 'chris', who: 'camper', cls: 'camper', name: 'Chris', x: 8, y: 3, dir: 'down', sight: 1,
      team: [['growlithe', 21], ['charmander', 21]],
      before: 'My Fire-type Pokémon and I are on a camping trip. Let us warm up with a battle!',
      defeat: 'Our campfire went out...',
      after: 'Rock Tunnel is really dark. I always get lost in there.' },
    { id: 'alicia', who: 'lass', cls: 'picnicker', name: 'Alicia', x: 18, y: 7, dir: 'up', sight: 2,
      team: [['oddish', 18], ['bellsprout', 18], ['oddish', 18]],
      before: 'I grow Grass-type Pokémon in my garden. Want to see them?',
      defeat: 'My garden needs more sunshine...',
      after: 'Grass types are calm and kind. Just like me!' },
    { id: 'jeremy', who: 'hiker', cls: 'hiker', name: 'Jeremy', x: 32, y: 3, dir: 'down', sight: 1,
      team: [['machop', 20], ['onix', 20]],
      before: 'I have hiked every mountain in Kanto. You are just a pebble on my path!',
      defeat: 'I tripped over the pebble!',
      after: 'Inside Rock Tunnel, stick to the walls. That is how hikers find the way out.' },
    { id: 'brent', who: 'bugcatcher', cls: 'bug-catcher', name: 'Brent', x: 26, y: 7, dir: 'up', sight: 2,
      team: [['beedrill', 19], ['beedrill', 19]],
      before: 'My Beedrill are angry today. Watch out for their stingers!',
      defeat: 'Bzzz... buzz off...',
      after: 'Beedrill fly in swarms. Two is a small swarm, I know.' },
    { id: 'drew', who: 'camper', cls: 'camper', name: 'Drew', x: 42, y: 7, dir: 'up', sight: 2,
      team: [['sandshrew', 21], ['ekans', 21]],
      before: 'Hey! You look tough. Let us see if you are as tough as you look!',
      defeat: 'You are even tougher!',
      after: 'The Pokémon Center is just past the corner, next to Rock Tunnel.' }
  ],
  items: [
    { x: 45, y: 9, item: 'tm40', flag: 'route9-tm40' },
    { x: 3, y: 10, item: 'ether', flag: 'route9-hidden-ether', hidden: true }
  ],
  encounters: { walk: '@kanto-route-9-area' }
});

G.Maps.def({
  id: 'route10', loc: 'kanto-route-10', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTT',
    'T..........#########.T',
    'T..........#########.T',
    'T..........####O####.T',
    ',,,,,,,,,,,,,,,,.....T',
    ',,...................T',
    'T...""""""...........T',
    'T...""""""...CCCCC...T',
    'T...""""""...CCCCC...T',
    'T............CCCCC.S.T',
    'T............CCDCC...T',
    'T..............,.....T',
    'T..................~~T',
    'TTTTTTTTTTTTTTTTTTT~~T',
    'TTTTTTTTTTTTTTTTTTT~~T',
    'TTTTTTTTTT.........~~T',
    'TTTTTTTTTT.BBBBBB..~~T',
    'TTTTTTTTTT.BBBBBB..~~T',
    'TTTTTTTTTT.BBBBBB..~~T',
    'TTTTTTTTTT.BBDBBB..~~T',
    'TTTTTTTTTT...,...S.~~T',
    'TTTTTTTTTT.........~~T',
    'TTTTTTTTTT.........~~T',
    'TTTTTTTTTTTTTTTTTTT~~T',
    'TTTTTTTTTTTTTTTTTTT~~T',
    'T.........#########..T',
    'T.........#########..T',
    'T.........####O####..T',
    'T.............,......T',
    'T...""""""....,......T',
    'T...""""""....,...S..T',
    'T...""""""....,......T',
    'T.............,......T',
    'T.............,,,,,..T',
    'T................,,..T',
    'T................,,..T',
    'T................,,..T',
    'TTTTTTTTTTTTTTTTT,,TTT'
  ],
  connect: { west: { map: 'route9', offset: 0 }, south: { map: 'lavender', offset: 7 } },
  warps: [
    { x: 13, y: 19, to: 'power-plant', spot: 'door' },
    { x: 15, y: 10, to: 'route10-center', spot: 'door' },
    { x: 15, y: 3, to: 'rocktunnel-1f', spot: 'north' },
    { x: 14, y: 27, to: 'rocktunnel-1f', spot: 'south' }
  ],
  spots: { 'center-door': [15, 11, 'down'], 'tunnel-north': [15, 4, 'down'], 'tunnel-south': [14, 28, 'down'], south: [17, 36, 'up'],
           'plant-door': [13, 20, 'down'] },
  signs: {
    '17,20': 'Kanto Power Plant. Closed. Electric Pokémon have moved in since the staff left.',
    '19,9': "Rock Tunnel ahead. It is pitch-dark inside: a Pokémon that knows Flash will light the way.",
    '18,30': 'Route 10. North: Rock Tunnel. South: Lavender Town.'
  },
  trainers: [
    { id: 'mark', who: 'pokemaniac', cls: 'pokemaniac', name: 'Mark', x: 12, y: 6, dir: 'up', sight: 1,
      team: [['cubone', 20], ['slowpoke', 20]],
      before: 'I collect rare Pokémon! Have you ever seen a Cubone up close? Now you will!',
      defeat: 'My collection lost...',
      after: 'Cubone wears the skull of its mother. It makes me sad every time I think about it.' },
    { id: 'clark', who: 'hiker', cls: 'hiker', name: 'Clark', x: 12, y: 30, dir: 'right', sight: 2,
      team: [['geodude', 21], ['onix', 21]],
      before: 'Made it through the tunnel? Then let us see if you can make it past me!',
      defeat: 'You rolled right over me!',
      after: 'Lavender Town is just south of here. It is a quiet, sad sort of place.' },
    { id: 'heidi', who: 'lass', cls: 'picnicker', name: 'Heidi', x: 16, y: 34, dir: 'right', sight: 2,
      team: [['pikachu', 20], ['clefairy', 20]],
      before: 'I came to see the Pokémon Tower, but I am too scared to go in. Battle me instead!',
      defeat: 'Even more scared now...',
      after: 'They say ghosts live at the top of the Pokémon Tower. Brrr!' }
  ],
  encounters: { walk: '@kanto-route-10-area' }
});

G.Maps.center('route10-center', {
  loc: 'kanto-route-10', exit: { map: 'route10', spot: 'center-door' },
  npcs: [{ id: 'hiker', who: 'hiker', x: 9, y: 5, move: 'look',
           say: "Without Flash, Rock Tunnel is darker than the inside of a Poké Ball. I've seen grown hikers cry in there." }]
});

G.Maps.def({
  id: 'rocktunnel-1f', loc: 'rock-tunnel', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, dark: true,
  rows: [
    '##############################',
    '###O##########################',
    '##.......####.........########',
    '##........##...........#######',
    '###.....................######',
    '####.....####.............####',
    '#####...######............####',
    '######............##......####',
    '########.........####...%.####',
    '##############################',
    '##############################',
    '##############################',
    '###..........######......#####',
    '###...%......###.........#####',
    '###......................#####',
    '####......#####..........#####',
    '#####....#######.........#####',
    '######..........##.......#####',
    '########.................#####',
    '############.............#####',
    '##################........####',
    '######################O#######',
    '##############################'
  ],
  warps: [
    { x: 3, y: 1, to: 'route10', spot: 'tunnel-north' },
    { x: 24, y: 8, to: 'rocktunnel-b1f', spot: 'ladder-north' },
    { x: 6, y: 13, to: 'rocktunnel-b1f', spot: 'ladder-south' },
    { x: 22, y: 21, to: 'route10', spot: 'tunnel-south' }
  ],
  spots: { north: [3, 2, 'down'], 'ladder-north': [24, 8, 'down'], 'ladder-south': [6, 13, 'down'], south: [22, 20, 'up'] },
  trainers: [
    { id: 'lenny', who: 'hiker', cls: 'hiker', name: 'Lenny', x: 12, y: 4, dir: 'left', sight: 3,
      team: [['geodude', 19], ['machop', 19]],
      before: 'Who goes there? I cannot see a thing, but I can still battle!',
      defeat: 'Lost in the dark...',
      after: 'The ladder down is in the far corner. Feel along the walls!' },
    { id: 'ashton', who: 'pokemaniac', cls: 'pokemaniac', name: 'Ashton', x: 20, y: 7, dir: 'up', sight: 2,
      team: [['cubone', 22], ['slowpoke', 22]],
      before: 'I came here to find rare Pokémon in the dark. You will do for now!',
      defeat: 'I should have brought a flashlight.',
      after: 'Onix and Geodude love dark tunnels like this one.' },
    { id: 'dana', who: 'lass', cls: 'picnicker', name: 'Dana', x: 18, y: 15, dir: 'down', sight: 2,
      team: [['meowth', 20], ['oddish', 20], ['pidgey', 20]],
      before: 'Finally, someone else in here! Let us battle, I need the company!',
      defeat: 'At least I am not alone anymore...',
      after: 'The way out is to the south-east. I can almost smell the fresh air!' }
  ],
  items: [
    { x: 8, y: 2, item: 'escape-rope', flag: 'rocktunnel-rope' },
    { x: 24, y: 19, item: 'revive', flag: 'rocktunnel-revive' }
  ],
  encounters: { walk: '@rock-tunnel-1f' }
});

G.Maps.def({
  id: 'rocktunnel-b1f', loc: 'rock-tunnel', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, dark: true,
  rows: [
    '##############################',
    '##############################',
    '####################.......###',
    '##########......###....%...###',
    '#########........#.........###',
    '########....###............###',
    '#######....######........#####',
    '######....#########....#######',
    '#####.....####################',
    '####.......###################',
    '###....##...##################',
    '##....####....################',
    '##...######......#############',
    '##...########........#########',
    '##..%...####..........########',
    '##..................##########',
    '##############################',
    '##############################'
  ],
  warps: [{ x: 23, y: 3, to: 'rocktunnel-1f', spot: 'ladder-north' }, { x: 4, y: 14, to: 'rocktunnel-1f', spot: 'ladder-south' }],
  spots: { 'ladder-north': [23, 3, 'down'], 'ladder-south': [4, 14, 'up'] },
  trainers: [
    { id: 'dudley', who: 'hiker', cls: 'hiker', name: 'Dudley', x: 20, y: 5, dir: 'left', sight: 3,
      team: [['geodude', 21], ['geodude', 21], ['graveler', 21]],
      before: 'Rocks, rocks and more rocks! My Pokémon are made of them. Battle!',
      defeat: 'Crumbled to gravel...',
      after: 'Graveler evolves when it is traded, they say. Here, it evolves when it gets strong enough.' },
    { id: 'sofia', who: 'lass', cls: 'picnicker', name: 'Sofia', x: 8, y: 9, dir: 'left', sight: 2,
      team: [['jigglypuff', 22], ['pidgey', 22], ['meowth', 22]],
      before: 'Eek! Oh, you are a Trainer. You scared me! Let us battle so I calm down.',
      defeat: 'I am calm now. Defeated, but calm.',
      after: 'Jigglypuff sings when it is scared. It has been singing all day.' },
    { id: 'cooper', who: 'pokemaniac', cls: 'pokemaniac', name: 'Cooper', x: 15, y: 13, dir: 'left', sight: 2,
      team: [['slowpoke', 24], ['cubone', 24]],
      before: 'Shh! I am waiting for a rare Pokémon to show up. You will do instead!',
      defeat: 'Not rare enough!',
      after: 'Almost there. The ladder up to the exit is just to the west.' }
  ],
  items: [{ x: 26, y: 4, item: 'hp-up', flag: 'rocktunnel-hpup' }],
  encounters: { walk: '@rock-tunnel-b1f' }
});
