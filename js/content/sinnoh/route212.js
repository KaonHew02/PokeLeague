/* ============ route212.js — Route 212, the Pokémon Mansion and the Trophy Garden ============
 * Chapter 64. Route 212 was flooded until the Fen Badge (badge 28): then the people in Hearthome City's south exit and
 * Pastoria City's west exit leave (hearthome.js, pastoria.js). The north part (`route212n`) runs south from Hearthome under
 * a clear sky: Police, a Rich Boy, a Lady, a Gentleman, a Socialite, the Pokémon Mansion behind its fence. The south part
 * (`route212s`, `storm: true`) is rain and marsh, three channels with bridges, east to Pastoria. In the Mansion five Maids
 * battle you (talk to them); when all five are beaten, a Rich Boy and a Lady with Blissey come out (Platinum picks one of
 * them by the turns taken; here both). The Mansion's second door (bottom right) opens on the garden. Mr. Backlot tells you each day which Pokémon he saw in his Trophy Garden (one of
 * Platinum's sixteen, drawn with a G.RNG from the device's date and the player id; vars trophy-day, trophy-mon): that
 * day it lives in the garden too (10%). Platinum's Trainers (Lv. 23-35) and wild Pokémon. The chapter ends (`ending(64)`)
 * the first time you talk to Mr. Backlot after chapter 63, so a player passing through in the middle of the game never
 * sees it then. Left out: the mud that holds you, the bridges for Bicycles, the shard tutor, Honey trees, berries, the
 * Dowsing Machine's items, the Soothe Bell, the Luxury Ball, Rose Incense and the shards (not in the game), the Police
 * only being out at night, the Maids' turn limit.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const BACKLOT = { name: 'Mr. Backlot' };
  // The daily Pokémon of Platinum's Trophy Garden (Clefairy, Jigglypuff, Meowth, Chansey, Ditto, Eevee, Cleffa, Igglybuff,
  // Marill, Azurill, Plusle, Minun, Castform, Bonsly, Mime Jr., Happiny).
  const DAILY = [35, 39, 52, 113, 132, 133, 173, 174, 183, 298, 311, 312, 351, 438, 439, 440];
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  /** Today's Pokémon (Mr. Backlot saw it): drawn once a day. -> its dex number */
  function todays() {
    const F = G.Field, day = G.Clock.day();
    if (F.getVar('trophy-day') !== day) {
      const rng = G.RNG(hash('trophy ' + day) ^ (F.save.player.id | 0));
      F.setVar('trophy-day', day);
      F.setVar('trophy-mon', DAILY[rng.int(0, DAILY.length - 1)]);
    }
    return F.getVar('trophy-mon');
  }
  /** The garden's Pokémon by time of day (Platinum's), with today's when Mr. Backlot has told you about it. */
  const told = () => G.Field && G.Field.getVar('trophy-day') === G.Clock.day() && G.Field.getVar('trophy-mon');
  const garden = list => { const t = told(); return t ? [[172, 21, 22, 20], ...list.slice(1), [t, 16, 18, 10]] : list; };
  const GARDEN = {
    rate: 30,
    get mons() { return garden([[172, 21, 22, 30], [315, 22, 23, 30], [397, 22, 24, 30], [25, 22, 24, 10]]); },
    get morning() { return garden([[172, 21, 22, 30], [315, 22, 23, 30], [397, 22, 24, 20], [25, 22, 24, 10], [402, 23, 23, 10]]); },
    get night() { return garden([[172, 21, 22, 30], [315, 22, 23, 30], [402, 22, 23, 20], [25, 22, 24, 10], [397, 24, 24, 10]]); }
  };

  // ---------------- Route 212, north ----------------
  G.Maps.def(Object.assign({
    id: 'route212n', loc: 'sinnoh-route-212', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTT',
      'T................,,................T',
      'T...............S,,................T',
      'T................,,...""""""""""...T',
      'T................,,...""""""""""...T',
      'T................,,...""""""""""...T',
      'T................,,...""""""""""...T',
      'T..FFFFFFFFFFF...,,...""""""""""...T',
      'T..F.........F...,,...""""""""""...T',
      'T..F.BBBBBB..F...,,...""""""""""...T',
      'T..F.BBBBBB..F...,,...""""""""""...T',
      'T..F.BBBBBB..F...,,...""""""""""...T',
      'T..F.BBDBBB..F.T.,,................T',
      'T..F...,.....F...,,......TTTTTTTTT.T',
      'T..F...,.....F...,,......T.......T.T',
      'T..Ffff,..fffF...,,.T....c.......T.T',
      'T..Ffff,..fffF...,,......T.......T.T',
      'T..Ffff,..fffF...,,......T.......T.T',
      'T..FFFF,FFFFFF...,,......TTTTTTTTT.T',
      'T......,,,,,,,S,,,,................T',
      'T................,,................T',
      'T................,,.."""""""""""...T',
      'T................,,.."""""""""""...T',
      'T.~~~~~~~~~~.....,,.."""""""""""...T',
      'T.~~~~~~~~~~.....,,.."""""""""""...T',
      'T.~~~~~~~~~~.....,,.."""""""""""...T',
      'T.~~~~::~~~~.....,,.."""""""""""...T',
      'T.~~~~::~~~~.....,,.."""""""""""...T',
      'T.~~~~~~~~~~...T.,,.."""""""""""...T',
      'T.~~~~~~~~~~.....,,.."""""""""""...T',
      'T.~~~~~~~~~~.....,,.."""""""""""...T',
      'T................,,................T',
      'T................,,.T..............T',
      'T..""""""""""....,,................T',
      'T..""""""""""....,,................T',
      'T..""""""""""....,,..."""""""""""..T',
      'T..""""""""""....,,..."""""""""""..T',
      'T..""""""""""....,,..."""""""""""..T',
      'T..""""""""""....,,..."""""""""""..T',
      'T..""""""""""....,,..."""""""""""..T',
      'T..""""""""""....,,..."""""""""""..T',
      'T................,,..."""""""""""..T',
      'T................,,..."""""""""""..T',
      'T................,,..."""""""""""..T',
      'T................,,................T',
      'T.............T..,,................T',
      'T................,,..T.............T',
      'T................,,................T',
      'T................,,................T',
      'TTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'hearthome', offset: 0 }, south: { map: 'route212s', offset: 13 } },
    encounters: { walk: '@sinnoh-route-212-north-towards-hearthome-city', water: '@sinnoh-route-212-north-towards-hearthome-city' },
    warps: [{ x: 7, y: 12, to: 'pokemon-mansion', spot: 'door' }],
    spots: { 'mansion-door': [7, 13, 'down'] },
    signs: { '16,2': 'Route 212. North: Hearthome City. South: Pastoria City.',
             '14,19': 'The Pokémon Mansion. The home of Mr. Backlot. Visitors welcome, Pokémon most welcome.' },
    items: [{ x: 4, y: 8, item: 'pearl', flag: 'route212-pearl' }, { x: 33, y: 1, item: 'elixir', flag: 'route212-elixir' },
            { x: 6, y: 26, item: 'tm11', flag: 'route212-tm11' }, { x: 28, y: 15, item: 'iron', flag: 'route212-iron' },
            { x: 12, y: 8, item: 'ultra-ball', flag: 'route212-ball' }],
    trainers: [
      { id: 'jason', who: 'gentleman', cls: 'rich-boy', name: 'Jason', x: 15, y: 6, dir: 'right', sight: 2,
        before: 'My father owns half of Hearthome. I own this Prinplup. Battle me!',
        defeat: 'I shall tell my father about this.',
        after: 'The Mansion over there is bigger than ours. I do not like to talk about it.',
        team: [['prinplup', 27, ['peck', 'metal-claw', 'bubble-beam', 'bide']]] },
      { id: 'melissa', who: 'lady', cls: 'lady', name: 'Melissa', x: 20, y: 9, dir: 'left', sight: 2,
        before: 'I am out for a stroll with my Cherubi. Would you care for a little battle?',
        defeat: 'Oh my. That was not little at all.',
        after: 'Mr. Backlot invites everyone to tea. His garden is lovely in the morning.',
        team: [['cherubi', 27, ['leech-seed', 'helping-hand', 'magical-leaf', 'sunny-day']]] },
      { id: 'jeremy', who: 'gentleman', cls: 'gentleman', name: 'Jeremy', x: 15, y: 22, dir: 'right', sight: 2,
        before: 'My Chatot has learned to say "battle". It says it all day long. Very well, battle!',
        defeat: 'Now it is saying "lost". Clever bird.',
        after: 'A gentleman always walks this road before lunch. It is good for the digestion.',
        team: [['chatot', 27, ['sing', 'fury-attack', 'chatter', 'taunt']]] },
      { id: 'reina', who: 'socialite', cls: 'socialite', name: 'Reina', x: 20, y: 26, dir: 'left', sight: 2,
        before: 'My Roselia matches my dress. Do try to keep up!',
        defeat: 'You have ruined my dress. Well, my battle.',
        after: 'They say it rains all year to the south. I never go there. My shoes, you understand.',
        team: [['roselia', 27, ['leech-seed', 'magical-leaf', 'grass-whistle', 'giga-drain']]] },
      { id: 'bobby', who: 'officer', cls: 'policeman', name: 'Bobby', x: 15, y: 31, dir: 'right', sight: 2,
        before: 'Halt! Routine check. Show me your Pokémon!',
        defeat: 'Everything is in order. Very much in order.',
        after: 'We patrol this road for the Mansion. A lot of valuable things in there.',
        team: [['hoothoot', 24, ['peck', 'uproar', 'reflect', 'confusion']], ['machop', 26, ['foresight', 'seismic-toss', 'revenge', 'vital-throw']]] },
      { id: 'alex', who: 'officer', cls: 'policeman', name: 'Alex', x: 20, y: 34, dir: 'left', sight: 2,
        before: 'You look suspicious. That is, you look like a strong Trainer. Same thing!',
        defeat: 'Not suspicious at all. Strong, though.',
        after: 'If you see anything strange on this road, report it. Or battle it.',
        team: [['hoothoot', 25, ['uproar', 'reflect', 'confusion', 'take-down']], ['machop', 25, ['foresight', 'seismic-toss', 'revenge', 'vital-throw']]] },
      { id: 'dylan', who: 'officer', cls: 'policeman', name: 'Dylan', x: 15, y: 40, dir: 'right', sight: 2,
        before: 'Police! Stop right there. A battle is the fastest way to check your papers.',
        defeat: 'Your papers are fine. Your Pokémon are better.',
        after: 'My partner and I take turns. One battles, the other writes the report.',
        team: [['hoothoot', 26, ['uproar', 'reflect', 'confusion', 'take-down']], ['machop', 24, ['karate-chop', 'foresight', 'seismic-toss', 'revenge']]] },
      { id: 'caleb', who: 'officer', cls: 'policeman', name: 'Caleb', x: 20, y: 44, dir: 'left', sight: 2,
        before: 'The south road was underwater for weeks. Now that it is open, I check everyone!',
        defeat: 'Checked, and found strong.',
        after: 'Bring an umbrella. Further south, the rain never stops.',
        team: [['hoothoot', 23, ['peck', 'uproar', 'reflect', 'confusion']], ['machop', 27, ['foresight', 'seismic-toss', 'revenge', 'vital-throw']]] }
    ]
  }, SINNOH));

  // ---------------- Route 212, south ----------------
  G.Maps.def(Object.assign({
    id: 'route212s', loc: 'sinnoh-route-212', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    storm: true,
    rows: [
      'TTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T...,,......~~~~...........~~~~.........~~~........T',
      'T...,,."""".~~~~.""""""""".~~~~.........~~~........T',
      'T...,,."""".~~~~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~::~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~::~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~~~~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~~~~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~~~~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~~~~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~~~~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,."""".~~~~.""""""""".~~~~.""""""".~~~."""""".T',
      'T...,,......~~~~...........~~~~.........~~~........T',
      'T...,,.S....~~~~...........~~~~.........~~~......S.T',
      'T...,,,,,,,,====,,,,,,,,,,,====,,,,,,,,,===,,,,,,,,,',
      'T...,,,,,,,,====,,,,,,,,,,,====,,,,,,,,,===,,,,,,,,,',
      'T...........~~~~...........~~~~.........~~~........T',
      'T...........~~~~...........~~~~.........~~~........T',
      'TTTTTTcTTTT.~~~~.""""""""".~~~~.""""""".~~~.TTcTTT.T',
      'TT........T.~~~~.""""""""".~~~~.""""""".~~~.T....T.T',
      'TT........T.~~~~.""""""""".~~~~.""""""".~~~.T....T.T',
      'TT........T.~~~~.""""""""".~~~~.""""""".~~~.T....T.T',
      'TT........T.~~~~.""""""""".~::~.""""""".~~~.T....T.T',
      'TT........T.~~~~.""""""""".~::~.""""""".~~~.T....T.T',
      'TT........T.~~~~.""""""""".~~~~.""""""".~~~.T....T.T',
      'TT........T.~~~~.""""""""".~~~~.""""""".~~~.T....T.T',
      'TT........T.~~~~.""""""""".~~~~.""""""".~~~.TTTTTT.T',
      'TTTTTTTTTTT.~~~~.""""""""".~~~~.""""""".~~~........T',
      'T...........~~~~...........~~~~.........~~~........T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'route212n', offset: -13 }, east: { map: 'pastoria', offset: 0 } },
    encounters: { walk: '@sinnoh-route-212-east-towards-pastoria-city', water: '@sinnoh-route-212-east-towards-pastoria-city' },
    signs: { '7,13': 'Route 212. East: Pastoria City. Mind the rain, and the marsh.',
             '49,13': 'Route 212. West: Hearthome City, past the Pokémon Mansion.' },
    items: [{ x: 5, y: 22, item: 'big-mushroom', flag: 'route212-mushroom' }, { x: 8, y: 25, item: 'full-heal', flag: 'route212-heal1' },
            { x: 47, y: 24, item: 'full-heal', flag: 'route212-heal2' }, { x: 13, y: 4, item: 'tm62', flag: 'route212-tm62' },
            { x: 49, y: 27, item: 'tm06', flag: 'route212-tm06' }, { x: 28, y: 22, item: 'tm84', flag: 'route212-tm84' },
            { x: 46, y: 20, item: 'max-ether', flag: 'route212-ether' }, { x: 24, y: 28, item: 'hyper-potion', flag: 'route212-potion' }],
    trainers: [
      { id: 'jeffrey', who: 'ranger', cls: 'ranger', name: 'Jeffrey', x: 6, y: 6, dir: 'left', sight: 2,
        before: 'A ranger keeps going whatever the weather. Can you?',
        defeat: 'You can. Clearly.',
        after: 'My Monferno hates the rain. It battles twice as hard to get it over with.',
        team: [['monferno', 31, ['fury-swipes', 'flame-wheel', 'feint', 'torment']]] },
      { id: 'allison', who: 'rangerf', cls: 'ranger-f', name: 'Allison', x: 3, y: 10, dir: 'right', sight: 2,
        before: 'The marsh is full of Pokémon that love the rain. So are we!',
        defeat: 'You are not even wet. How?',
        after: 'Leafeon grows faster in the rain. So does the grass. So does everything here.',
        team: [['marill', 29, ['rollout', 'bubble-beam', 'aqua-ring', 'double-edge']], ['leafeon', 29, ['sand-attack', 'razor-leaf', 'quick-attack', 'synthesis']]] },
      { id: 'taylor', who: 'ranger', cls: 'ranger', name: 'Taylor', x: 20, y: 13, dir: 'down', sight: 2,
        before: 'Careful on the bridges! And careful of me!',
        defeat: 'You were careful. And strong.',
        after: 'Carnivine hang from the trees here and wait. Watch your head.',
        team: [['carnivine', 28, ['vine-whip', 'sweet-scent', 'ingrain', 'feint-attack']], ['luxio', 30, ['spark', 'bite', 'roar', 'swagger']]] },
      { id: 'danny', who: 'officer', cls: 'policeman', name: 'Danny', x: 23, y: 16, dir: 'up', sight: 2,
        before: 'Even in this weather, the law never sleeps. Battle!',
        defeat: 'The law is soaked. And beaten.',
        after: 'I am posted down here as a punishment. Do not ask what I did.',
        team: [['hoothoot', 26, ['uproar', 'reflect', 'confusion', 'take-down']], ['machop', 28, ['foresight', 'seismic-toss', 'revenge', 'vital-throw']]] },
      { id: 'alexa', who: 'parasol', cls: 'parasol-lady', name: 'Alexa', x: 16, y: 13, dir: 'down', sight: 2,
        before: 'My parasol keeps the rain off. Nothing keeps my Pokémon off you!',
        defeat: 'I stayed dry, but I lost.',
        after: 'A parasol in the rain? It works for both, you know.',
        team: [['goldeen', 27, ['horn-attack', 'water-pulse', 'flail', 'aqua-ring']], ['bibarel', 27, ['rollout', 'water-gun', 'headbutt', 'hyper-fang']]] },
      { id: 'juan', who: 'fisherman', cls: 'fisherman', name: 'Juan', x: 11, y: 16, dir: 'up', sight: 2,
        before: 'Nothing bites when it rains this hard. So I bite instead!',
        defeat: 'Not much bite left in me now.',
        after: 'Gyarados love the rain. I hooked this one on a day like today.',
        team: [['gyarados', 29, ['bite', 'dragon-rage', 'leer', 'twister']]] },
      { id: 'josh', who: 'fisherman', cls: 'fisherman', name: 'Josh', x: 26, y: 12, dir: 'down', sight: 2,
        before: 'Two Goldeen, two chances. Let us see!',
        defeat: 'Two chances, two losses.',
        after: 'The channels are deeper than they look. Surf carefully.',
        team: [['goldeen', 27, ['horn-attack', 'water-pulse', 'flail', 'aqua-ring']], ['goldeen', 27, ['horn-attack', 'water-pulse', 'flail', 'aqua-ring']]] },
      { id: 'sabrina', who: 'parasol', cls: 'parasol-lady', name: 'Sabrina', x: 31, y: 16, dir: 'up', sight: 2,
        before: 'Wooper loves puddles, and there are puddles everywhere. We are very happy here!',
        defeat: 'Still happy. A little less, maybe.',
        after: 'If you stand still long enough in the marsh, a Wooper will sit on your foot.',
        team: [['wooper', 26, ['mud-shot', 'slam', 'mud-bomb', 'amnesia']], ['quagsire', 28, ['mud-shot', 'slam', 'mud-bomb', 'amnesia']]] },
      { id: 'stefano', who: 'scientist', cls: 'scientist', name: 'Stefano', x: 34, y: 13, dir: 'down', sight: 2,
        before: 'I am measuring the rain. Your battle will make an interesting data point.',
        defeat: 'An outlier! Fascinating.',
        after: 'It has rained here every day for the last three hundred days. I have the numbers.',
        team: [['kadabra', 30, ['psybeam', 'disable', 'kinesis', 'ice-punch']]] },
      { id: 'shaun', who: 'scientist', cls: 'scientist', name: 'Shaun', x: 37, y: 16, dir: 'up', sight: 2,
        before: 'Electricity and water! Science says this is a bad idea. Let us test it!',
        defeat: 'The experiment failed. Science is satisfied.',
        after: 'Do not try what I just did at home.',
        team: [['magnemite', 30, ['spark', 'magnet-bomb', 'lock-on']], ['kadabra', 26, ['psybeam', 'disable', 'kinesis', 'thunder-punch']]] },
      { id: 'travis', who: 'fisherman', cls: 'fisherman', name: 'Travis', x: 39, y: 16, dir: 'up', sight: 2,
        before: 'Barboach! Barboach! Barboach! And one Gyarados, for luck!',
        defeat: 'Not so lucky, then.',
        after: 'Barboach live in the mud. That is why they like this place.',
        team: [['barboach', 24, ['water-gun', 'mud-bomb', 'amnesia', 'water-pulse']], ['barboach', 25, ['water-gun', 'mud-bomb', 'amnesia', 'water-pulse']],
               ['gyarados', 26, ['thrash', 'bite', 'dragon-rage', 'leer']], ['barboach', 25, ['water-gun', 'mud-bomb', 'amnesia', 'water-pulse']]] },
      { id: 'dean', who: 'pokemaniac', cls: 'collector', name: 'Dean', x: 46, y: 13, dir: 'down', sight: 2,
        before: 'One for the day and one for the night. A collector needs both!',
        defeat: 'My collection lost. It is still a very nice collection.',
        after: 'Eevee can become many things. I want them all. My wallet does not.',
        team: [['umbreon', 27, ['helping-hand', 'sand-attack', 'pursuit', 'quick-attack']], ['espeon', 27, ['helping-hand', 'sand-attack', 'confusion', 'quick-attack']]] }
    ]
  }, SINNOH));

  // ---------------- The Pokémon Mansion ----------------
  // A Maid: Clefairy with Metronome, Meteor Mash, Endure and one more move (the texts are written out, so the tools find them).
  const MAID = (d, lvl, move) => Object.assign({ who: 'maid', cls: 'maid', sight: 0, team: [['clefairy', lvl, ['metronome', move, 'meteor-mash', 'endure']]] }, d);
  const MAIDS = ['done:pokemon-mansion:belinda', 'done:pokemon-mansion:sophie', 'done:pokemon-mansion:emily', 'done:pokemon-mansion:elena', 'done:pokemon-mansion:clare'];
  G.Maps.def(Object.assign({
    id: 'pokemon-mansion', loc: 'pokemon-mansion', tileset: 'indoor', palette: 'mansion', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'bb_t__W_______W___bb', '______W_______W_____', '_tt___W_______W__tt_',
           '_tt_______r_________', '______W_______W_____', 'WWWWWWW_______WWWWWW', '___p______j_____p___', '____________________',
           '___rrrrrrrrrrrrr____', '___rrrrrrrrrrrrr____', '____________________', 'p_________X_____X__p'],
    warps: [{ x: 10, y: 13, to: 'route212n', spot: 'mansion-door' }, { x: 16, y: 13, to: 'trophy-garden', spot: 'back-door' }],
    spots: { door: [10, 13, 'up'], back: [16, 13, 'up'] },
    signs: { '10,8': 'A statue of a Pokémon nobody has ever seen. Mr. Backlot had it made from a picture in an old book.' },
    items: [{ x: 4, y: 2, item: 'tm87', flag: 'mansion-tm87' }],
    npcs: [
      { id: 'backlot', who: 'gentleman', x: 2, y: 3, dir: 'down', script: 'r212.backlot' },
      { id: 'officer', who: 'officer', x: 9, y: 8, dir: 'down', say: 'I guard this statue day and night. Mostly day. Nobody has tried to steal it yet.' },
      { id: 'butler', who: 'gentleman', x: 12, y: 12, dir: 'up', say: 'Welcome to the Pokémon Mansion. The maids enjoy a battle, if you have the time. The young master and the young lady prefer to watch.' }
    ],
    trainers: [
      MAID({ id: 'belinda', name: 'Belinda', x: 2, y: 9, dir: 'right',
        before: 'Welcome, Master Trainer! May I offer you a battle with your tea?',
        defeat: 'Thank you for the lesson.',
        after: 'Our Clefairy all know Metronome. Anything can happen!' }, 25, 'minimize'),
      MAID({ id: 'sophie', name: 'Sophie', x: 5, y: 12, dir: 'up',
        before: 'The second course is a battle. Please enjoy!',
        defeat: 'I hope it was to your taste.',
        after: 'The young master is watching from upstairs. He loves a good battle.' }, 27, 'sing'),
      MAID({ id: 'emily', name: 'Emily', x: 16, y: 3, dir: 'down',
        before: 'I have just finished the dusting. Now, a battle!',
        defeat: 'Everything is clean, and I am beaten.',
        after: 'Encore! That is what Clefairy says when it likes something.' }, 29, 'encore'),
      MAID({ id: 'elena', name: 'Elena', x: 18, y: 5, dir: 'left',
        before: 'Only the finest battles in this house. Shall we?',
        defeat: 'Very fine indeed.',
        after: 'There is one more of us. She is the strongest.' }, 31, 'swagger'),
      MAID({ id: 'clare', name: 'Clare', x: 18, y: 12, dir: 'left',
        before: 'I am the head maid. If you beat me, the young master and the young lady wish to meet you.',
        defeat: 'Splendid. I shall tell them at once.',
        after: 'They are waiting for you in the hall. Do go and see them.' }, 33, 'bounce'),
      { id: 'liam', who: 'gentleman', cls: 'rich-boy', name: 'Liam', x: 17, y: 9, dir: 'left', sight: 0, if: MAIDS, prize: 160, items: { 'full-restore': 1 },
        before: 'You beat all five of our maids! Now you must battle my Blissey. It is only fair.',
        defeat: 'My Blissey is the happiest Blissey in Sinnoh, even when it loses.',
        after: 'Come back any time. The maids always want another battle.',
        team: [['blissey', 35, ['sing', 'fling', 'defense-curl', 'light-screen'], 'rare-candy']] },
      { id: 'celeste', who: 'lady', cls: 'lady', name: 'Celeste', x: 2, y: 12, dir: 'right', sight: 0, if: MAIDS, prize: 160, items: { 'full-restore': 1 },
        before: 'The maids say you are very strong. My Blissey and I would like to see for ourselves.',
        defeat: 'How exciting! Nobody ever beats my Blissey.',
        after: 'Father says I may have a battle every day, as long as I finish my lessons.',
        team: [['blissey', 35, ['fling', 'soft-boiled', 'egg-bomb', 'psychic'], 'rare-candy']] }
    ]
  }, SINNOH));

  // ---------------- The Trophy Garden ----------------
  G.Maps.def(Object.assign({
    id: 'trophy-garden', loc: 'trophy-garden', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T........BBBBBB........T',
      'T.ffffff.BBBBBB.ffffff.T',
      'T.ffffff.BBBBBB.ffffff.T',
      'T.ffffff.BBDBBB.ffffff.T',
      'T.ffffff...,....ffffff.T',
      'T..........,...........T',
      'T..,,,,,,,,,,,,,,,,,,..T',
      'T......................T',
      'T..""""""""""""""""""..T',
      'T..""""""""""""""""""..T',
      'T.."""""""ffff"""""""..T',
      'T.."""""""ffff"""""""..T',
      'T.."""""""ffff"""""""..T',
      'T..""""""""""""""""""..T',
      'T..""""""""""""""""""..T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    encounters: { walk: GARDEN },
    warps: [{ x: 11, y: 4, to: 'pokemon-mansion', spot: 'back' }],
    spots: { 'back-door': [11, 5, 'down'] },
    npcs: [{ id: 'gardener', who: 'hiker', x: 5, y: 8, move: 'look', say: 'Mr. Backlot walks here every morning. Whatever he sees, he tells everyone about. Then it is my job to find it again.' }]
  }, SINNOH));

  /** Mr. Backlot: today's Pokémon in his garden; the end of the chapter, once you are past chapter 63. */
  async function backlot(h) {
    const F = G.Field, vars = { mon: G.Names.mon(todays()) };
    if (!F.flag('backlot-met')) {
      await h.say(T('Welcome, welcome! I am Backlot, and this is my Mansion, the finest house in all of Sinnoh.'), BACKLOT);
      await h.say(T('Behind it lies my Trophy Garden. I walk in it every morning, and every morning I see some Pokémon or other.'), BACKLOT);
      F.setFlag('backlot-met');
    }
    await h.say(T('This morning, {mon} was out in my Trophy Garden! A fine one. Go and look, if you like.'), Object.assign({ vars }, BACKLOT));
    if (!F.flag('chapter-63-done') || F.flag('chapter-64-done')) return;
    // The end of the sixty-fourth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(64); else F.setFlag('chapter-64-done');
  }

  G.Route212 = { DAILY, GARDEN, todays };
  G.Script.def({ 'r212.backlot': [['js', backlot]] });
})();
