/* ============ oreburgh.js — Route 203, Oreburgh Gate, Oreburgh City, its mine and Roark's Gym ============
 * Chapter 45, the end of the chapter. Route 203, east of Jubilife City: Barry is waiting as you come in
 * (Starly Lv. 7 and the starter strong against yours, Lv. 9; losing is allowed, flag barry-203), four Trainers, and the
 * mouth of Oreburgh Gate, a cave through to Oreburgh City. Oreburgh: a Pokémon Center, a Mart, the
 * Mining Museum, a house and Roark's Gym, locked until you have met him in the Oreburgh Mine south of
 * town (two floors with Workers; flag roark-met). Roark uses Rock types (Geodude, Onix, Cranidos);
 * beating him gives the Coal Badge (badge 25: Pokémon up to Lv. 25 obey in Sinnoh) and TM76 (Stealth
 * Rock), then `ending(45)`. Route 207 to the north opens in a later chapter. Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const BARRY = { name: 'Barry' }, ROARK = { name: 'Roark' };
  const SINNOH = { region: 'sinnoh' };
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 203 ----------------
  G.Maps.def(Object.assign({
    id: 'route203', loc: 'sinnoh-route-203', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..............................###',
      'T.."""""".."""""..TT.""""""..TT###',
      'T.."""""".."""""..TT.""""""..TT###',
      'T..""""""............""""""....###',
      'T.S............................###',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,###',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,O##',
      'T..............................###',
      'T..""""".TT."""""""....."""""..###',
      'T..""""".TT."""""""....."""""..###',
      'T.."""""...."""""""....."""""..###',
      'T..............................###',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'jubilife', offset: -7 } },
    warps: [{ x: 31, y: 7, to: 'oreburgh-gate', spot: 'west' }],
    spots: { gate: [30, 7, 'left'] },
    signs: { '2,5': 'Route 203. West: Jubilife City. East: Oreburgh Gate.' },
    triggers: [{ x: 2, y: 1, w: 1, h: 12, if: '!barry-203', script: 'oreburgh.barry' }],
    npcs: [{ id: 'barry', who: 'barry', x: 6, y: 6, dir: 'left', if: 'scripted' }],
    trainers: [
      { id: 'dallas', who: 'youngster', cls: 'youngster', name: 'Dallas', x: 7, y: 8, dir: 'up', sight: 2, team: [['bidoof', 7], ['starly', 8]],
        before: 'You are heading for the Oreburgh Gym? Then you need practice. Lucky you, I am here!',
        defeat: 'I was the one who needed practice...',
        after: 'Starly fly in big flocks around here. One of them is bound to be strong.' },
      { id: 'kaitlin', who: 'lass', cls: 'lass', name: 'Kaitlin', x: 13, y: 5, dir: 'down', sight: 2, team: [['shinx', 9]],
        before: 'My Shinx and I train on this route every day. Ready?',
        defeat: 'We will train some more tomorrow.',
        after: 'Shinx use their sparks to talk to each other. Cute, right?' },
      { id: 'sebastian', who: 'youngster', cls: 'youngster', name: 'Sebastian', x: 20, y: 8, dir: 'up', sight: 2, team: [['machop', 9]],
        before: 'My Machop lifts rocks from the mine to get strong. Want to see its muscles?',
        defeat: 'Its muscles were not enough...',
        after: 'Fighting moves are great against Rock types. Remember that in Oreburgh!' },
      { id: 'kyle', who: 'camper', cls: 'camper', name: 'Kyle', x: 26, y: 5, dir: 'down', sight: 2, team: [['zubat', 8], ['kricketot', 8]],
        before: 'I just came out of Oreburgh Gate. The Zubat in there would not leave me alone, so I caught one!',
        defeat: 'Should have caught two...',
        after: 'Bring something to light the way? No need: the gate is lit well enough.' }
    ],
    items: [{ x: 30, y: 12, item: 'super-potion', flag: 'route203-superpotion' }],
    encounters: { walk: '@sinnoh-route-203-area' }
  }, SINNOH));

  // ---------------- Oreburgh Gate ----------------
  G.Maps.def(Object.assign({
    id: 'oreburgh-gate', loc: 'oreburgh-gate', rows: [
      '##############################',
      '##############################',
      '##############################',
      '###.....##...........##.....##',
      '##......##...........##.....##',
      '##......##..................##',
      '##..........................##',
      '##.............##...........##',
      '##.............##...........##',
      '##.............##..........###',
      '###O######################O###',
      '##############################'
    ],
    warps: [{ x: 3, y: 10, to: 'route203', spot: 'gate' }, { x: 26, y: 10, to: 'oreburgh', spot: 'gate' }],
    spots: { west: [3, 9, 'up'], east: [26, 9, 'up'] },
    npcs: [{ id: 'hiker', who: 'hiker', x: 12, y: 6, move: 'look',
             say: 'This tunnel goes right under the mountain to Oreburgh City. The miners dug it long ago.' }],
    items: [{ x: 23, y: 3, item: 'escape-rope', flag: 'oreburgh-gate-rope' }],
    encounters: { walk: '@oreburgh-gate-1f' }
  }, CAVE));

  // ---------------- Oreburgh City ----------------
  G.Maps.def(Object.assign({
    id: 'oreburgh', loc: 'oreburgh-city', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..................................T',
      'T................,,...GGGGGG.......T',
      'T....CCCCC.......,,...GGGGGG..####.T',
      'T....CCCCC.MMMM..,,...GGGGGG..####.T',
      'T....CCCCC.MMMM..,,...GGGGGG..####.T',
      'T....CCDCC.MDMM..,,...GGDGGG..####.T',
      'T......,....,....,,.....,.....####.T',
      'T......,....,....,,.....,.....####.T',
      'T###...,....ff...,,..ff.,..........T',
      'T###...,....,..S.,,.....,..........T',
      'T###...,....,....,,.....,..........T',
      'T##O,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T###,,,,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T###.............,,................T',
      'T###.............,,................T',
      'T###.BBBBBB......,,................T',
      'T....BBBBBB......,,.....HHHH.#####.T',
      'T....BBBBBB......,,.....HHHH.#####.T',
      'T....BBDBBB......,,.....HDHH.#####.T',
      'T###...,,,,,,,,,,,,,,,,,,,...#####.T',
      'T###.............,,..........#####.T',
      'T###......ff.....,,................T',
      'T###.............,,.......ff.......T',
      'T###.............,,.S..............T',
      'T################O#################T',
      'T##################################T',
      'T##################################T',
      'T##################################T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    warps: [
      { x: 3, y: 12, to: 'oreburgh-gate', spot: 'east' },
      { x: 17, y: 25, to: 'oreburgh-mine', spot: 'mouth' },
      { x: 24, y: 6, to: 'oreburgh-gym', spot: 'door', if: 'roark-met', locked: 'oreburgh.gym-closed' },
      { x: 7, y: 6, to: 'oreburgh-center', spot: 'door' },
      { x: 12, y: 6, to: 'oreburgh-mart', spot: 'door' },
      { x: 7, y: 19, to: 'oreburgh-museum', spot: 'door' },
      { x: 25, y: 19, to: 'oreburgh-house', spot: 'door' }
    ],
    spots: { gate: [4, 12, 'right'], mine: [17, 24, 'up'], 'gym-door': [24, 7, 'down'], 'center-door': [7, 7, 'down'], 'mart-door': [12, 7, 'down'],
             'museum-door': [7, 20, 'down'], 'house-door': [25, 20, 'down'] },
    signs: { '15,10': 'Oreburgh City. A mining town whose coal warms all of Sinnoh.', '20,24': 'Oreburgh Mine. Mind your step!' },
    npcs: [
      { id: 'fan', who: 'youngster', x: 26, y: 8, dir: 'left', if: '!roark-met',
        say: 'Roark? He spends more time in the mine than in his Gym! Try the Oreburgh Mine, at the south end of town.' },
      { id: 'miner', who: 'engineer', x: 21, y: 15, move: 'wander', r: 2,
        say: 'Coal from the Oreburgh Mine goes all over Sinnoh. Trains, ships, the power plants: they all run on it.' },
      { id: 'girl', who: 'lass', x: 11, y: 15, move: 'look',
        say: 'A blond boy ran into town earlier, shouting that he would beat the Gym before anyone else. He came out looking very red.' }
    ]
  }, SINNOH));

  G.Maps.center('oreburgh-center', {
    loc: 'oreburgh-city', exit: { map: 'oreburgh', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'hiker', x: 3, y: 5, move: 'look',
             say: 'Roark\'s Rock types hit hard and take hits well. Do not forget to heal before you go in!' }]
  }).region = 'sinnoh';

  G.Maps.mart('oreburgh-mart', {
    loc: 'oreburgh-city', exit: { map: 'oreburgh', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'escape-rope', 'repel'],
    npcs: [{ id: 'shopper', who: 'engineer', x: 6, y: 5, move: 'look',
             say: 'Escape Ropes sell well in a mining town. Nobody wants to get lost underground!' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'oreburgh-museum', loc: 'oreburgh-city', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bb+j+++++j+bb', '+++++++++++++', '++ttt+++ttt++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 7, to: 'oreburgh', spot: 'museum-door' }],
    spots: { door: [6, 7, 'up'] },
    signs: { '3,2': 'A great lump of coal from the mine. Oreburgh\'s coal has kept Sinnoh warm for a hundred years.',
             '9,2': 'A fossil from deep in the mine. Long ago, very different Pokémon lived in Sinnoh.' },
    npcs: [{ id: 'curator', who: 'scientist', x: 6, y: 5, dir: 'down',
             say: 'Welcome to the Oreburgh Mining Museum! Fossils still turn up in the mine. One day we hope to wake the Pokémon inside them.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'oreburgh-house', loc: 'oreburgh-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'oreburgh', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
             say: 'Roark\'s father is a Gym Leader too, in a port city far to the west. Like father, like son!' }]
  }, SINNOH));

  // ---------------- Oreburgh Mine ----------------
  G.Maps.def(Object.assign({
    id: 'oreburgh-mine', loc: 'oreburgh-mine', rows: [
      '############################',
      '############################',
      '##......##..........##....##',
      '##......##..........##.%..##',
      '##......##..........##....##',
      '##......##..........##....##',
      '##......##................##',
      '##......##......##........##',
      '##......##......##........##',
      '##..............##........##',
      '##..............##........##',
      '##..........##..##........##',
      '##..........##..##........##',
      '##..........##..##........##',
      '####O#######################',
      '############################'
    ],
    warps: [{ x: 4, y: 14, to: 'oreburgh', spot: 'mine' }, { x: 23, y: 3, to: 'oreburgh-mine-b1f', spot: 'ladder' }],
    spots: { mouth: [4, 13, 'up'], ladder: [23, 4, 'down'] },
    trainers: [
      { id: 'colin', who: 'engineer', cls: 'worker', name: 'Colin', x: 12, y: 4, dir: 'down', sight: 3, team: [['geodude', 9]],
        before: 'Hey, this is a working mine! If you want to pass, you battle me first!',
        defeat: 'You dig hard, kid.',
        after: 'Roark? He was heading down the ladder at the back.' },
      { id: 'mason', who: 'engineer', cls: 'worker', name: 'Mason', x: 20, y: 9, dir: 'left', sight: 3, team: [['onix', 10]],
        before: 'My Onix tunnels faster than any machine. Let it show you!',
        defeat: 'Onix hit solid rock...',
        after: 'Onix eat soil as they dig. That is why their bodies are full of stones.' }
    ],
    items: [{ x: 2, y: 13, item: 'potion', flag: 'oreburgh-mine-potion' }],
    encounters: { walk: '@oreburgh-mine-1f' }
  }, CAVE));

  G.Maps.def(Object.assign({
    id: 'oreburgh-mine-b1f', loc: 'oreburgh-mine', rows: [
      '############################',
      '############################',
      '##........##..........######',
      '##........##..........######',
      '##........##..........######',
      '##........##..............##',
      '##........##..............##',
      '##........##..............##',
      '##................##......##',
      '##...###..........##......##',
      '##...###..........##......##',
      '##................##......##',
      '##................##...%..##',
      '##................##......##',
      '############################',
      '############################'
    ],
    warps: [{ x: 23, y: 12, to: 'oreburgh-mine', spot: 'ladder' }],
    spots: { ladder: [23, 11, 'up'] },
    npcs: [{ id: 'roark', who: 'roark', x: 4, y: 3, dir: 'up', if: '!roark-met', script: 'oreburgh.roark-mine' }],
    trainers: [
      { id: 'dennis', who: 'engineer', cls: 'worker', name: 'Dennis', x: 14, y: 9, dir: 'left', sight: 3, team: [['geodude', 9], ['machop', 10]],
        before: 'Watch out for falling rocks down here! And for me!',
        defeat: 'Ouch. That was a big rock.',
        after: 'The boss is checking the walls over there. He likes to do it himself.' }
    ],
    items: [{ x: 25, y: 13, item: 'super-potion', flag: 'oreburgh-mine-superpotion' }],
    encounters: { walk: '@oreburgh-mine-b1f' }
  }, CAVE));

  // ---------------- Roark's Gym ----------------
  G.Maps.def(Object.assign({
    id: 'oreburgh-gym', loc: 'oreburgh-city', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '++j+++++++j++', '+++++++++++++', '+++++++++++++', '++j+++++++j++',
           '+++++++++++++', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'oreburgh', spot: 'gym-door' }],
    spots: { door: [6, 11, 'up'] },
    npcs: [{ id: 'guide', who: 'guide', x: 8, y: 10, dir: 'left', script: 'oreburgh.gym-guide' }],
    trainers: [
      { id: 'jonathon', who: 'youngster', cls: 'youngster', name: 'Jonathon', x: 3, y: 8, dir: 'right', sight: 3, team: [['geodude', 10], ['onix', 11]],
        before: 'Roark taught me everything about Rock types. Now I will teach you!',
        defeat: 'I need more lessons...',
        after: 'Roark found his Cranidos as a fossil in the mine. Amazing, right?' },
      { id: 'darius', who: 'engineer', cls: 'worker', name: 'Darius', x: 9, y: 5, dir: 'left', sight: 3, team: [['geodude', 11], ['geodude', 11]],
        before: 'I work in the mine by day and train in the Gym by night. Rock solid!',
        defeat: 'Cracked...',
        after: 'Roark is right up ahead. His Stealth Rock hurts every Pokémon you switch in, so pick your first one well.' },
      { id: 'roark', who: 'roark', cls: 'leader', name: 'Roark', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
        items: { potion: 2 },
        team: [['geodude', 12, ['stealth-rock', 'rock-throw', 'tackle', 'defense-curl']],
               ['onix', 12, ['stealth-rock', 'rock-throw', 'screech', 'bind']],
               ['cranidos', 14, ['headbutt', 'pursuit', 'leer', 'focus-energy']]],
        before: 'Welcome to the Oreburgh Gym! I am Roark, the Gym Leader. A Champion of three regions, here in my Gym? Then my Rock types will give you everything they have!',
        defeat: 'Well, that settles it. Your Pokémon dug deeper than mine!',
        win: 'oreburgh.roark-win',
        afterScript: [['say', 'There are seven more Gyms in Sinnoh. The next one is in Eterna City, past Floaroma Town. Its Leader, Gardenia, loves Grass types.', ROARK]] }
    ]
  }, SINNOH));

  // ---------------- Barry on Route 203 ----------------
  async function barry(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('barry-203')) return;
    if (me) h.place('barry', me.x + 3, me.y, 'left');
    h.show('barry');
    h.emote('barry', '!');
    if (me) { await h.walkTo('barry', me.x + 1, me.y); h.face('barry', 'left'); h.face('player', 'right'); }
    await h.say(T('{player}! There you are! I heard about Jubilife. You took on Team Galactic without me? Not fair!'), BARRY);
    await h.say(T('I have been training on this route all morning. Let me show you how much stronger we got!'), BARRY);
    const out = await h.battle({ id: 'barry-203', who: 'barry', name: 'Barry', prize: 70, ai: 'basic',
      team: [['starly', 7], [F.getVar('barry-starter') || 390, 9]] }, { canLose: true });
    F.setFlag('barry-203');
    if (out === 'win') await h.say(T('Argh, again! Fine, fine, I will get you next time. The Oreburgh Gym is right past Oreburgh Gate, and I am getting there first!'), BARRY);
    else await h.say(T('Ha! Told you we got stronger! The Oreburgh Gym is right past Oreburgh Gate. See you there!'), BARRY);
    h.hide('barry');
  }

  G.Script.def({
    'oreburgh.barry': [['js', barry]],
    'oreburgh.gym-closed': [['say', 'The Gym is locked. A note on the door says: "Gone down the mine. Back soon! Roark"']],
    'oreburgh.roark-mine': [
      ['say', 'Hm? A visitor, all the way down here?', ROARK],
      ['say', 'I am Roark, the Gym Leader of Oreburgh. I come down here to check the walls and look for fossils. Old habits!', ROARK],
      ['say', 'A challenger, you say? A Champion of three regions, no less! Then I had better get back to my Gym. See you there!', ROARK],
      ['fade', 'out', 0.4], ['setFlag', 'roark-met'], ['fade', 'in', 0.4]
    ],
    'oreburgh.gym-guide': [
      ['say', 'Hey, Champion! Welcome to the first Gym of Sinnoh. Roark uses Rock-type Pokémon.'],
      ['say', 'Water, Grass, Fighting, Ground and Steel moves work great on them. Fire, Normal and Flying moves barely scratch them.'],
      ['say', 'Picked Chimchar? Train it until it evolves: Monferno\'s Mach Punch cracks rocks. Friends from home help too, as long as they are not above level 20.'],
      ['say', 'And remember: above level 20, your Pokémon from home may not listen to you yet!']
    ],
    'oreburgh.roark-win': [
      ['say', 'This is the Coal Badge. It shows you beat me, fair and square.', ROARK],
      ['badge', 25],
      ['jingle', 'badge'],
      ['say', '{player} received the Coal Badge from Roark!'],
      ['say', 'With it, Pokémon up to level 25 will obey you here in Sinnoh, even ones raised in other regions.', ROARK],
      ['say', 'Take this as well. TM76 is Stealth Rock: it scatters pointed stones that hurt every foe that comes into battle.', ROARK],
      ['giveItem', 'tm76', 1],
      // The end of the forty-fifth chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(45) : G.Field.setFlag('chapter-45-done'))]
    ]
  });
})();
