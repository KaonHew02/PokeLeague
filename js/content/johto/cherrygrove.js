/* ============ cherrygrove.js — Cherrygrove City, Route 30 and Mr. Pokémon, Route 31 ============
 * Chapter 11. Cherrygrove City by the sea (Center, Mart, a house). North of it, Route 30 (two
 * Youngsters, a Bug Catcher) ends at Mr. Pokémon's house: he gives you his discovery, the Mystery
 * Egg (flag got-mystery-egg), and Professor Oak, visiting, hears that Elm's lab was robbed (flag
 * johto-theft; the stolen starter's ball is gone). On the way back the thief ambushes you at
 * Cherrygrove's north entrance (flag rival2-battle; losing is allowed). Route 31 leads west to
 * Violet City (violet.js).
 */
G.Maps.def({
  id: 'cherrygrove', loc: 'cherrygrove-city', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTT,,TTTTTTTTTTTTTTTTTTTTTT',
    'T.....,,.....................T',
    'T.....,,.....................T',
    'T.....,,.....................T',
    'T.....,,.CCCCC...............T',
    'T.....,,.CCCCC..MMMM..HHHH...T',
    'T.....,,.CCCCC..MMMM..HHHH...T',
    'T.....,,.CCDCC..MDMM..HDHH...T',
    'T.....,,...,.....,.....,.....T',
    'T.....,,...,..S..,.....,.....T',
    'T.....,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.....,,,,,,,,,,,,,,,,,,,,,,,,',
    'T............................T',
    'T.ff.....................ff..T',
    'T............................T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route29', offset: 4 }, north: { map: 'route30', offset: -3 } },
  warps: [
    { x: 11, y: 7, to: 'cherrygrove-center', spot: 'door' },
    { x: 17, y: 7, to: 'cherrygrove-mart', spot: 'door' },
    { x: 23, y: 7, to: 'cherrygrove-house', spot: 'door' }
  ],
  spots: { 'center-door': [11, 8, 'down'], 'mart-door': [17, 8, 'down'], 'house-door': [23, 8, 'down'] },
  signs: { '14,9': 'Cherrygrove City. Sweet-smelling flowers on every street.' },
  npcs: [
    { id: 'rival', who: 'silver', x: 6, y: 6, dir: 'up', if: 'scripted' },
    { id: 'guide', who: 'oldman', x: 20, y: 12, move: 'wander', r: 2,
      say: 'Welcome to Cherrygrove! The Pokémon Center heals for free, the Mart sells Poké Balls, and the sea is lovely at sunset.' },
    { id: 'fisher', who: 'fisherman', x: 25, y: 14, dir: 'down', move: 'look',
      say: 'Johto Pokémon swim out there too. Got a rod? Give it a try!' }
  ],
  triggers: [{ x: 6, y: 2, w: 2, h: 1, if: ['johto-theft', '!rival2-battle'], script: 'cherrygrove.rival' }],
  encounters: { water: '@cherrygrove-city-area' }
});

G.Maps.center('cherrygrove-center', {
  loc: 'cherrygrove-city', exit: { map: 'cherrygrove', spot: 'center-door' },
  npcs: [{ id: 'boy', who: 'youngster', x: 3, y: 5, move: 'look',
           say: 'My Pidgey was tired, so I brought it here. Pokémon Centers are the same in Kanto and Johto!' }]
}).region = 'johto';

G.Maps.mart('cherrygrove-mart', {
  loc: 'cherrygrove-city', exit: { map: 'cherrygrove', spot: 'mart-door' },
  stock: ['poke-ball', 'potion', 'antidote', 'paralyze-heal', 'awakening', 'repel'],
  npcs: [{ id: 'shopper', who: 'lass', x: 6, y: 5, move: 'look',
           say: 'Antidotes are a must. Bug Pokémon on Route 30 love to poison you!' }]
}).region = 'johto';

G.Maps.def({
  id: 'cherrygrove-house', loc: 'cherrygrove-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'cherrygrove', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [{ id: 'girl', who: 'lass', x: 7, y: 4, dir: 'left',
           say: 'Some Pokémon evolve once they really love their Trainer. Battle together, walk together, and see!' }]
});

G.Maps.def({
  id: 'route30', loc: 'johto-route-30', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTT',
    'T.......HHHH.........T',
    'T.......HHHH.........T',
    'T.......HDHH.........T',
    'T........,,...TTTTT..T',
    'T........,,...TTTTT..T',
    'T........,,...TTTTT..T',
    'T........,,...TTTTT..T',
    ',,,,,,,,,,,...TTTTT..T',
    ',,,,,,,,,,,..........T',
    'T........,,..........T',
    'T........,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T........,,..""""""..T',
    'T........,,..""""""..T',
    'T........,,..""""""..T',
    'T........,,..""""""..T',
    'T........,,..""""""..T',
    'T........,,..""""""..T',
    'T........,,..""""""..T',
    'T........,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T."""""..,,..........T',
    'T........,,..........T',
    'T........,,..........T',
    'T........,,..""""""..T',
    'T........,,..""""""..T',
    'TTTTTT...,,..""""""..T',
    'TTTTTT...,,..""""""..T',
    'TTTTTT...,,..""""""..T',
    'TTTTTT...,,..........T',
    'TTTTTT...,,S.........T',
    'T........,,..........T',
    'T........,,..........T',
    'TTTTTTTTT,,TTTTTTTTTTT'
  ],
  connect: { south: { map: 'cherrygrove', offset: 3 }, west: { map: 'route31', offset: 2 } },
  warps: [{ x: 9, y: 3, to: 'mr-pokemon-house', spot: 'door' }],
  spots: { 'mrpoke-door': [9, 4, 'down'] },
  signs: { '11,40': "Route 30. North: Mr. Pokémon's house. West: Route 31 to Violet City." },
  trainers: [
    { id: 'joey', who: 'youngster', cls: 'youngster', name: 'Joey', x: 12, y: 30, dir: 'left', sight: 3,
      team: [['rattata', 4]],
      before: 'My Rattata is one in a million! Want to see? Battle!',
      defeat: 'What? My one-in-a-million Rattata!',
      after: 'I am going to make my Rattata even stronger. You will see!' },
    { id: 'mikey', who: 'youngster', cls: 'youngster', name: 'Mikey', x: 7, y: 22, dir: 'right', sight: 3,
      team: [['pidgey', 2], ['rattata', 4]],
      before: 'Hey, a Trainer! You know the rule: our eyes met, so we battle!',
      defeat: 'Wow. You are the real deal.',
      after: 'Pidgey and Rattata are everywhere. That makes them easy to train!' },
    { id: 'don', who: 'bugcatcher', cls: 'bug-catcher', name: 'Don', x: 12, y: 14, dir: 'left', sight: 3,
      team: [['caterpie', 3], ['caterpie', 3]],
      before: 'I caught a bunch of Caterpie! Want to see them?',
      defeat: 'My Caterpie need more training.',
      after: 'Caterpie evolve quickly. Soon they will be Butterfree!' }
  ],
  items: [{ x: 3, y: 33, item: 'potion', flag: 'route30-potion' }],
  encounters: { walk: '@johto-route-30-area' }
});

G.Maps.def({
  id: 'mr-pokemon-house', loc: 'johto-route-30', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb_p___bbb', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'route30', spot: 'mrpoke-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: { '0,2': 'Shelves full of curiosities from all over the world.', '1,2': 'Shelves full of curiosities from all over the world.',
           '2,2': 'Shelves full of curiosities from all over the world.' },
  npcs: [
    { id: 'mrpokemon', who: 'gentleman', x: 7, y: 4, dir: 'left', script: 'mrpoke.talk' },
    { id: 'oak', who: 'oak', x: 2, y: 5, dir: 'right', script: 'mrpoke.oak' }
  ]
});

G.Maps.def({
  id: 'route31', loc: 'johto-route-31', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T...........#O#TTTT................T',
    'T....""""""""..TTTT....."""""""....T',
    'T....""""""""..TTTT....."""""""....T',
    'T....""""""""......................T',
    'T..S...............................T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T..................................T',
    'T...........TTTT...."""""""""""....T',
    'T...........TTTT...."""""""""""....T',
    'T...........TTTT...."""""""""""....T',
    'T...........TTTT...................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route30', offset: -2 }, west: { map: 'violet', offset: -7 } },
  warps: [{ x: 13, y: 1, to: 'dark-cave-violet', spot: 'mouth' }],
  spots: { 'dark-cave': [13, 2, 'down'] },
  signs: { '3,5': 'Route 31. West: Violet City.' },
  trainers: [
    { id: 'wade', who: 'bugcatcher', cls: 'bug-catcher', name: 'Wade', x: 18, y: 4, dir: 'down', sight: 2,
      team: [['caterpie', 2], ['caterpie', 2], ['weedle', 3], ['caterpie', 2]],
      before: 'My bag is full of bugs! Let them all have a go at you!',
      defeat: 'Not enough bugs, I guess.',
      after: 'At night, Spinarak come out in the grass. They are bugs too!' }
  ],
  items: [{ x: 32, y: 10, item: 'poke-ball', flag: 'route31-ball' }],
  encounters: { walk: '@johto-route-31-area' }
});

(() => {
  const T = s => G.T(s);
  const OAK = { name: 'Prof. Oak' }, MR = { name: 'Mr. Pokémon' }, RIVAL2 = { name: '???' };

  async function mrPokemon(h) {
    const F = G.Field;
    if (F.flag('got-mystery-egg')) {
      await h.say(T('Eggs are a mystery. Some say Pokémon find them, others that they appear by themselves. What do you think?'), MR);
      return;
    }
    await h.say(T('Ah, there you are! Professor Elm said a Trainer would come by. I am Mr. Pokémon. I travel and collect odd things.'), MR);
    await h.say(T('A friend of mine who runs the Day Care gave me this. Nobody knows what it is! Elm will want to study it.'), MR);
    F.giveItem('mystery-egg', 1);
    F.setFlag('got-mystery-egg');
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('mystery-egg') } });
    await j;
    await oakVisit(h);
  }

  /** Oak is visiting: he adds Johto's Pokémon to your Pokédex, then hears about Elm's lab. */
  async function oakVisit(h) {
    const F = G.Field, S = F.save;
    await h.say(T('{player}! What a surprise to see you here in Johto!'), OAK);
    await h.say(T('Mr. Pokémon and I are old friends. Let me see your Pokédex... There! Now it records the Pokémon of Johto too.'), OAK);
    F.setFlag('johto-dex');
    h.sfx('save');
    await h.say(T('Hm? A call from Elm... What! Someone broke into his lab and stole a Pokémon?'), OAK);
    await h.say(T('{player}, hurry back to New Bark Town! Elm needs you.'), OAK);
    F.setFlag('johto-theft');
    if (S.rival2.starter && G.Johto) F.markDone(G.Johto.ballKey(S.rival2.starter));
  }

  /** The thief, at Cherrygrove's north entrance. */
  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('rival2-battle');
    h.place('rival', me.x, me.y + 3, 'up');
    h.show('rival');
    await h.walkTo('rival', me.x, me.y + 1);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T('...So you got one from that lab too. Some people get everything handed to them.'), RIVAL2);
    await h.say(T("Let's see if you even deserve it. I'll knock you down!"), RIVAL2);
    const sp = S.rival2.starter || 155;
    await h.battle({ id: 'rival2-cherrygrove', who: 'silver', name: '???', prize: 30, ai: 'basic', team: [[sp, 5]] }, { canLose: true });
    await h.say(T("...Tch. One win means nothing. I'll be the strongest Trainer there is, and nobody will stand in my way."), RIVAL2);
    await h.walkTo('rival', me.x, me.y - 2);
    h.hide('rival');
  }

  G.Script.def({
    'mrpoke.talk': [['js', mrPokemon]],
    'mrpoke.oak': [['if', 'got-mystery-egg', [
      ['say', 'Johto has Pokémon I have never seen in Kanto. Fill that Pokédex, {player}!', { name: 'Prof. Oak' }]
    ], [
      ['say', 'Oh, {player}! Talk to Mr. Pokémon first. He has something to show you.', { name: 'Prof. Oak' }]
    ]]],
    'cherrygrove.rival': [['js', rival]]
  });
})();
