/* ============ battlezone.js — the Battle Zone: Fight Area, Route 225 and the Survival Area ============
 * Chapter 61. Once you are Sinnoh's Champion the sailor on Snowpoint City's pier (snowpoint.js) sails to Fight Area. Barry runs up as you
 * come off the pier and takes you to the Battle Frontier, shut for now, where Flint and Volkner want a battle: a multi battle beside Barry
 * (flag fight-zone-met; lost, it all happens again). Platinum's teams for all four. Route 225 goes north over a river and through a gap in a cliff,
 * where Platinum needs Rock Climb, to the Survival Area: a Center, a mart, the Battleground (no battles yet), a house, the shard tutor's house
 * (he is out). The road east to Route 226 is closed by a rockfall until the next chapter. Barry waits in town (flag survival-barry), then `ending(61)`.
 * Left out: Route 230, the reporter and the cameraman, Lax Incense and the Green Shard (not in the game), the Super Rod (you have had one since Kanto).
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const BARRY = { name: 'Barry' }, FLINT = { name: 'Elite Four Flint' }, VOLKNER = { name: 'Volkner' }, SAILOR = { name: 'Sailor' };

  /** Flint and Volkner, Platinum's teams, one Pokémon of each in turn (a multi battle: exported for the balance test). */
  const FLINT_VOLKNER = { id: 'flint-volkner', name: 'Flint and Volkner', who: 'volkner', ai: 'leader', double: true, prize: 100, music: 'league', items: { 'full-restore': 4 },
    team: [['luxray', 56, ['ice-fang', 'thunder-fang', 'crunch', 'fire-fang']], ['houndoom', 56, ['flamethrower', 'sludge-bomb', 'dark-pulse', 'sunny-day']],
           ['jolteon', 56, ['pin-missile', 'charge-beam', 'double-kick', 'quick-attack']], ['flareon', 56, ['overheat', 'giga-impact', 'quick-attack', 'will-o-wisp']],
           ['electivire', 58, ['thunder-punch', 'fire-punch', 'brick-break', 'giga-impact'], 'sitrus-berry'], ['magmortar', 58, ['flamethrower', 'thunderbolt', 'solar-beam', 'hyper-beam'], 'sitrus-berry']] };
  const STARAPTOR = ['staraptor', 53, ['close-combat', 'aerial-ace', 'steel-wing', 'u-turn']], FLOATZEL = ['floatzel', 52, ['aqua-jet', 'crunch', 'ice-fang', 'brick-break']];
  const HERACROSS = ['heracross', 53, ['close-combat', 'rock-slide', 'night-slash', 'aerial-ace']], RAPIDASH = ['rapidash', 52, ['fire-blast', 'sunny-day', 'bounce', 'will-o-wisp']];
  const ROSERADE = ['roserade', 52, ['poison-jab', 'giga-drain', 'shadow-ball', 'grass-whistle']], SNORLAX = ['snorlax', 54, ['body-slam', 'crunch', 'earthquake', 'rest']];
  /** Barry beside you, by his starter (Platinum's). */
  const BARRY_TEAMS = {
    387: [STARAPTOR, FLOATZEL, HERACROSS, RAPIDASH, SNORLAX, ['torterra', 56, ['leaf-storm', 'earthquake', 'crunch', 'synthesis']]],
    390: [STARAPTOR, FLOATZEL, HERACROSS, ROSERADE, SNORLAX, ['infernape', 56, ['flamethrower', 'focus-blast', 'shadow-claw', 'aerial-ace']]],
    393: [STARAPTOR, ROSERADE, HERACROSS, RAPIDASH, SNORLAX, ['empoleon', 56, ['brine', 'aerial-ace', 'metal-claw', 'shadow-claw']]]
  };

  // ---------------- Fight Area ----------------
  G.Maps.def(Object.assign({
    id: 'fight-area', loc: 'fight-area', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: '~',
    fly: { spot: 'center-door' }, flintVolkner: FLINT_VOLKNER, barryTeams: BARRY_TEAMS,
    rows: [
      'TTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTT',
      'T..............,,..........TT.~~~~',
      'T.T.EEEEEEEE...,,.............~~~~',
      'T.T.EEEEEEEE...,,.....HHHH....~~~~',
      'T...EEEEEEEE...,,.....HHHH....~~~~',
      'T...EEEEEEEE...,,.....HDHH....~~~~',
      'T...EEEDEEEE...,,......,......~~~~',
      'T......,..S....,,......,......~~~~',
      'T......,,,,,,,,,,,,,,,,,,.....~~~~',
      'T..............,,.............~~~~',
      'T..............,,.............~~~~',
      'T....CCCCC.....,,.....MMMM....~~~~',
      'T....CCCCC.....,,.....MMMM....~~~~',
      'T....CCCCC.....,,.....MDMM....~~~~',
      'T....CCDCC.....,,......,......~~~~',
      'T......,.......,,......,......~~~~',
      'T......,,,,,,,,,,,,,,,,,......~~~~',
      'T..............,,.............~~~~',
      'TTT..........S.,,.............~~~~',
      'T..............,,.............~~~~',
      'T~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~',
      'T~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~',
      'T~~~~~~~~~~~~~~==~~~~~~~~~~~~~~~~~',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route225', offset: 0 } },
    warps: [
      { x: 7, y: 6, locked: 'bzone.frontier' },
      { x: 7, y: 14, to: 'fight-center', spot: 'door' },
      { x: 23, y: 13, to: 'fight-mart', spot: 'door' },
      { x: 23, y: 5, to: 'fight-house', spot: 'door' }
    ],
    spots: { pier: [15, 22, 'up'], frontier: [7, 9, 'up'], 'center-door': [7, 15, 'down'], 'mart-door': [23, 14, 'down'], 'house-door': [23, 6, 'down'] },
    signs: { '13,18': 'Fight Area. North: Route 225 to the Survival Area.',
             '10,7': 'The Battle Frontier. Opening soon. Trainers, keep training!' },
    triggers: [{ x: 15, y: 19, w: 2, h: 1, if: '!fight-zone-met', script: 'bzone.arrival' }],
    npcs: [
      { id: 'sailor', who: 'sailor', x: 16, y: 22, dir: 'left', script: 'bzone.sailor' },
      { id: 'barry', who: 'barry', x: 15, y: 16, dir: 'down', if: 'scripted' },
      { id: 'flint', who: 'flint', x: 6, y: 8, dir: 'down', script: 'bzone.flint' },
      { id: 'volkner', who: 'volkner', x: 8, y: 8, dir: 'down', script: 'bzone.volkner' },
      { id: 'man', who: 'fisherman', x: 20, y: 18, dir: 'down',
        say: 'They say the fishing is better on the far side of the island, past the volcano. I am too old to find out.' }
    ]
  }, SINNOH));

  G.Maps.center('fight-center', {
    loc: 'fight-area', exit: { map: 'fight-area', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'cooltrainer', x: 3, y: 5, move: 'look',
             say: 'I came to the Battle Zone with a team of six and a suitcase. I have been here for a year.' }]
  }).region = 'sinnoh';

  G.Maps.mart('fight-mart', {
    loc: 'fight-area', exit: { map: 'fight-area', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'max-potion', 'full-restore', 'revive', 'antidote', 'paralyze-heal', 'awakening',
            'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel', 'max-repel'],
    npcs: [{ id: 'granny', who: 'granny', x: 6, y: 5, dir: 'left', script: 'bzone.granny' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'fight-house', loc: 'fight-area', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor', rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'fight-area', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'gentleman', x: 7, y: 4, dir: 'left',
             say: 'This island was all fishermen and wind, once. Now every ship brings another Trainer.' }]
  }, SINNOH));

  // ---------------- Route 225 ----------------
  G.Maps.def(Object.assign({
    id: 'route225', loc: 'sinnoh-route-225', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T########............########T',
      'T########............########T',
      'T########............########T',
      'T########....................T',
      'T..............,,,,,,,,,,,,,,,',
      'T..............,,,,,,,,,,,,,,,',
      'T.........T....,,............T',
      'T..............,,......######T',
      'T.....TT.......,,......c....#T',
      'T..............,,......#....#T',
      'T..............,,......######T',
      'T##############,,############T',
      'T##############,,############T',
      'T..............,,............T',
      'T..............,,..""""""""..T',
      'T..."""""""""..,,.."T""""""..T',
      'T..."""""""""..,,..""""""""..T',
      'T..."""""""""..,,..""""""""..T',
      'T..."""""""""..,,..""""""""..T',
      'T..."""""""""..,,..""""""""..T',
      'T..."""""""""..,,..""""""""..T',
      'T..............,,............T',
      'T..............,,............T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T..............,,............T',
      'T..............,,............T',
      'T..............,,......TT....T',
      'T...TT.........,,............T',
      'T..............,,............T',
      'Tvvvvvvvvvvv,,,,,vvvvvvvvvvvvT',
      'T..............,,..."""""""..T',
      'T..............,,..."""""""..T',
      'T..""""""""....,,..."""""""..T',
      'T..""""""""....,,..."""""""..T',
      'T..""""""""....,,..."""""""..T',
      'T..""""""""....,,..."""""""..T',
      'T..""""""""....,,..."""""""..T',
      'T..""""""""....,,............T',
      'T..............,,............T',
      'T..............,,S...........T',
      'T..............,,............T',
      'TTTTTTTTTTTTTTT,,TTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'fight-area', offset: 0 }, east: { map: 'survival-area', offset: -4 } },
    signs: { '17,43': 'Route 225. North: Survival Area. South: Fight Area.' },
    items: [
      { x: 3, y: 43, item: 'hp-up', flag: 'route225-hp-up' }, { x: 27, y: 43, item: 'revive', flag: 'route225-revive' },
      { x: 27, y: 31, item: 'fresh-water', flag: 'route225-water' }, { x: 2, y: 29, item: 'dubious-disc', flag: 'route225-disc' },
      { x: 27, y: 23, item: 'dawn-stone', flag: 'route225-stone' }, { x: 26, y: 9, item: 'rare-candy', flag: 'route225-candy' },
      { x: 2, y: 6, item: 'razor-fang', flag: 'route225-fang' }
    ],
    trainers: [
      { id: 'rodolfo', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Rodolfo', x: 13, y: 40, dir: 'right', sight: 3,
        team: [['starmie', 55, ['water-pulse', 'recover', 'psychic', 'swift']], ['vibrava', 56, ['dragon-breath', 'earthquake', 'feint-attack', 'screech']]],
        before: 'Only the strongest Trainers come to this island. Let me see if you are one of them.',
        defeat: 'Yes. You are.',
        after: 'This road gets harder the further north you go.' },
      { id: 'ashlee', who: 'rangerf', cls: 'ranger-f', name: 'Ashlee', x: 18, y: 37, dir: 'left', sight: 2,
        team: [['linoone', 55, ['covet', 'slash', 'rest', 'belly-drum']], ['arbok', 55, ['spit-up', 'mud-bomb', 'gastro-acid', 'haze']]],
        before: 'I look after the wild Pokémon on this road. You look like you need a lesson in respect!',
        defeat: 'Well, they respect you now.',
        after: 'Keep to the path, please, and leave the berries for the Pokémon.' },
      { id: 'audrey', who: 'birdkeeper', cls: 'bird-keeper', name: 'Audrey', x: 9, y: 34, dir: 'right', sight: 4,
        team: [['taillow', 51, ['agility', 'wing-attack', 'roost', 'tailwind']], ['farfetchd', 53, ['night-slash', 'air-slash', 'feint', 'false-swipe']], ['pidgeot', 55, ['double-team', 'endeavor', 'aerial-ace', 'agility']]],
        before: 'My birds have flown over every inch of this island. Have you ever seen it from the air?',
        defeat: 'Grounded.',
        after: 'From up there, the volcano in the east looks close enough to touch.' },
      { id: 'daisy', who: 'psychic', cls: 'psychic', name: 'Daisy', x: 18, y: 30, dir: 'left', sight: 3,
        team: [['slowpoke', 52, ['zen-headbutt', 'slack-off', 'amnesia', 'psychic']], ['slowbro', 56, ['withdraw', 'slack-off', 'amnesia', 'psychic']]],
        before: 'Slowpoke and I knew you were coming. It took us a while, but we knew.',
        defeat: 'We did not know that, though.',
        after: 'Give it a few minutes. Slowpoke is still thinking about the battle.' },
      { id: 'geoffrey', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Geoffrey', x: 13, y: 19, dir: 'right', sight: 3,
        team: [['gabite', 53, ['slash', 'dragon-claw', 'dig', 'dragon-rush']], ['altaria', 55, ['dragon-breath', 'dragon-dance', 'refresh', 'dragon-pulse']]],
        before: 'So you crossed the river. Now try crossing me!',
        defeat: 'My dragons will want a word with you next time.',
        after: 'Some Trainers stay on this road for years before they dare go any further.' },
      { id: 'deanna', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Deanna', x: 18, y: 22, dir: 'left', sight: 2,
        team: [['flaaffy', 55, ['discharge', 'power-gem', 'signal-beam', 'light-screen']], ['tropius', 56, ['solar-beam', 'air-slash', 'synthesis', 'sunny-day']]],
        before: 'Everything grows bigger and stronger out here. Even the fruit on my Tropius!',
        defeat: 'You have grown bigger and stronger too, it seems.',
        after: 'Tropius grows its fruit all year. Nobody goes hungry on this road.' },
      { id: 'dwayne', who: 'ranger', cls: 'ranger', name: 'Dwayne', x: 13, y: 15, dir: 'right', sight: 3,
        team: [['skarmory', 54, ['steel-wing', 'air-slash', 'slash', 'night-slash']], ['golduck', 54, ['screech', 'psych-up', 'zen-headbutt', 'amnesia']], ['donphan', 54, ['assurance', 'scary-face', 'earthquake', 'giga-impact']]],
        before: 'Three Pokémon, three different ways to lose. Pick one!',
        defeat: 'I had not thought of that one.',
        after: 'A ranger has to know the land. The Survival Area is at the top of this road, then east.' },
      { id: 'quinn', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Quinn', x: 18, y: 8, dir: 'left', sight: 3,
        team: [['pinsir', 55, ['superpower', 'x-scissor', 'swords-dance', 'rock-tomb']], ['lanturn', 56, ['discharge', 'signal-beam', 'surf', 'confuse-ray']]],
        before: 'The Survival Area is just ahead. If you cannot get past me, you will not last a day there!',
        defeat: 'You will last.',
        after: 'Go on. The town is just east of here.' }
    ],
    encounters: { walk: '@sinnoh-route-225-area' }
  }, SINNOH));

  // ---------------- The Survival Area ----------------
  G.Maps.def(Object.assign({
    id: 'survival-area', loc: 'survival-area', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T................................T',
      'T................................T',
      'T.....CCCCC...........BBBBBB.....T',
      'T.....CCCCC...MMMM....BBBBBB.....T',
      'T.....CCCCC...MMMM....BBBBBB.....T',
      'T.....CCDCC...MDMM....BBDBBB.....T',
      'T.......,......,........,......###',
      'T...S...,......,........,....S.###',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,###',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,###',
      'T..............................###',
      'T..............................###',
      'T......HHHH....HHHH..............T',
      'T......HHHH....HHHH..............T',
      'T......HDHH....HDHH..............T',
      'T................................T',
      'T................................T',
      'T................................T',
      'T................................T',
      'T................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'route225', offset: 4 } },
    warps: [
      { x: 8, y: 6, to: 'survival-center', spot: 'door' },
      { x: 15, y: 6, to: 'survival-mart', spot: 'door' },
      { x: 24, y: 6, to: 'survival-ground', spot: 'door' },
      { x: 8, y: 15, to: 'survival-house', spot: 'door' },
      { x: 16, y: 15, to: 'survival-tutor', spot: 'door' }
    ],
    spots: { 'center-door': [8, 7, 'down'], 'mart-door': [15, 7, 'down'], 'ground-door': [24, 7, 'down'],
             'house-door': [8, 16, 'down'], 'tutor-door': [16, 16, 'down'] },
    signs: { '4,8': 'Survival Area. A town for Trainers who want to find their limits.',
             '29,8': 'Route 226 is closed. A rockfall has blocked the road east.' },
    items: [{ x: 30, y: 18, item: 'rare-candy', flag: 'survival-candy' }, { x: 3, y: 18, item: 'tm42', flag: 'survival-tm42' }],
    triggers: [{ x: 2, y: 9, w: 1, h: 2, if: '!survival-barry', script: 'bzone.barry' }],
    npcs: [
      { id: 'barry', who: 'barry', x: 12, y: 8, dir: 'left', script: 'bzone.barry' },
      { id: 'worker', who: 'engineer', x: 28, y: 10, dir: 'right',
        say: 'It will take a while to clear these rocks. There is a lot of mountain up there, and it keeps moving.' }
    ]
  }, SINNOH));

  G.Maps.center('survival-center', {
    loc: 'survival-area', exit: { map: 'survival-area', spot: 'center-door' },
    npcs: [{ id: 'boy', who: 'cooltrainerm', x: 3, y: 5, move: 'look',
             say: 'Everyone here is training for something. Nobody can quite remember what.' }]
  }).region = 'sinnoh';

  G.Maps.mart('survival-mart', {
    loc: 'survival-area', exit: { map: 'survival-area', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'max-potion', 'revive', 'antidote', 'paralyze-heal', 'awakening',
            'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel', 'max-repel'],
    npcs: [{ id: 'shopper', who: 'hiker', x: 6, y: 5, move: 'look', say: 'I buy Full Heals by the crate. You never know what is living on that volcano.' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'survival-ground', loc: 'survival-area', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', '___________', '___rrrrr___', '___rrrrr___', '___rrrrr___', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'survival-area', spot: 'ground-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 2, y: 3, dir: 'right',
        say: 'This is the Battleground. One day the Gym Leaders of Sinnoh will meet here to battle anyone who asks. We are not quite ready for them yet.' },
      { id: 'fan', who: 'youngster', x: 8, y: 5, dir: 'left',
        say: 'I came all this way to see Roark battle, and he is not here! I can wait. I have sandwiches.' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'survival-house', loc: 'survival-area', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor', rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'survival-area', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'man', who: 'gentleman', x: 7, y: 4, dir: 'left',
             say: 'My grandson has gone off to the volcano again. He says the mountain talks to him. It only ever says one thing to me: stay away.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'survival-tutor', loc: 'survival-area', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor', rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'survival-area', spot: 'tutor-door' }],
    spots: { door: [4, 7, 'up'] },
    signs: { '4,4': 'A note on the table says: "Gone to look for shards. Back when I have enough."',
             '5,4': 'A note on the table says: "Gone to look for shards. Back when I have enough."',
             '6,4': 'A note on the table says: "Gone to look for shards. Back when I have enough."',
             '4,5': 'A note on the table says: "Gone to look for shards. Back when I have enough."',
             '5,5': 'A note on the table says: "Gone to look for shards. Back when I have enough."',
             '6,5': 'A note on the table says: "Gone to look for shards. Back when I have enough."' }
  }, SINNOH));

  /** Off the pier: Barry, the Battle Frontier, Flint and Volkner, a multi battle. */
  async function arrival(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('fight-zone-met')) return;
    h.show('barry');
    h.place('barry', me.x, me.y - 3, 'down');
    h.emote('barry', '!');
    await h.walkTo('barry', me.x, me.y - 1);
    h.face('barry', 'player'); h.face('player', 'barry');
    await h.say(T('{player}! I knew you would get on that ship! Welcome to the Battle Zone!'), BARRY);
    await h.say(T('This whole island is for Trainers who want to get stronger. Come on, come on! There is something you have to see!'), BARRY);
    await h.warp('fight-area', 'frontier');
    h.show('barry');
    h.place('barry', 8, 9, 'up');
    await h.say(T('So the Champion found us. I thought you might turn up, {player}.'), VOLKNER);
    await h.say(T('They are building a Battle Frontier behind us. It is not open yet, so there is nothing to do. You know what happens when he has nothing to do.'), FLINT);
    await h.say(T('I get bored.'), VOLKNER);
    await h.say(T('Wait! Two against two! {player} and me against you two, right now! You will never be bored again!'), BARRY);
    await h.say(T('...That might keep me awake.'), VOLKNER);
    await h.say(T('Ha! That is the spirit! Let us burn!'), FLINT);
    await h.say(T('Hold on, let me fix up your team first. No excuses!'), BARRY);
    h.heal();
    await h.jingle('heal');
    const team = BARRY_TEAMS[F.getVar('barry-starter')] || BARRY_TEAMS[390];
    const out = await h.battle(FLINT_VOLKNER, { partner: { name: T('Barry'), team }, rules: { tag: true } });
    if (out === 'lose') return;
    h.heal();
    await h.say(T('Not bad. You two make a strange pair, and a dangerous one.'), VOLKNER);
    await h.say(T('We are going to want a rematch! Past Route 225 there is a town called the Survival Area, with a Battleground for Trainers like us. Look for us there one day.'), FLINT);
    await h.say(T('We did it, {player}! I am going on ahead to the Survival Area. Do not be late, or I am fining you!'), BARRY);
    h.hide('barry');
    F.setFlag('fight-zone-met');
  }

  /** The Survival Area: Barry is already there; the end of the chapter. */
  async function barry(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('survival-barry')) {
      h.face('barry', 'player');
      await h.say(T('I am training here until that road opens. Next time we meet, I will be the one fighting you, not beside you!'), BARRY);
      return;
    }
    h.emote('barry', '!');
    await h.walkTo('barry', me.x + 1, me.y);
    h.face('barry', 'player'); h.face('player', 'barry');
    await h.say(T('There you are, {player}! What took you so long? I have already been all over town!'), BARRY);
    await h.say(T('They call this the Survival Area, and only the toughest Trainers come here. So I am staying, obviously!'), BARRY);
    await h.say(T('That big building is the Battleground. When it opens, every Gym Leader in Sinnoh is going to come here to battle.'), BARRY);
    await h.say(T('And the road east goes to a volcano, but a rockfall has closed it. As soon as they clear it, I am going up there. You had better come too!'), BARRY);
    await h.walkTo('barry', 12, 8);
    h.face('barry', 'left');
    F.setFlag('survival-barry');
    // The end of the sixty-first chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(61); else F.setFlag('chapter-61-done');
  }

  G.Script.def({
    'bzone.arrival': [['js', arrival]],
    'bzone.barry': [['js', barry]],
    'bzone.frontier': [['say', 'The doors are shut. Through the glass you can see ladders and buckets of paint.']],
    'bzone.flint': [['if', 'fight-zone-met', [['say', 'That was a good fire. Come and find us at the Battleground when it opens.', FLINT]], [['say', 'Let us burn!', FLINT]]]],
    'bzone.volkner': [['if', 'fight-zone-met', [['say', 'I am not bored. It is a strange feeling.', VOLKNER]], [['say', 'I get bored.', VOLKNER]]]],
    'bzone.sailor': [
      ['choice', 'Ready to go back to Snowpoint City?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The ship sailed back across the northern sea...'],
        ['warp', 'snowpoint', 'harbor']
      ], [
        ['say', 'Any time. The sea is not going anywhere.', SAILOR]
      ], SAILOR]
    ],
    'bzone.granny': [
      ['if', 'fight-scope-lens', [
        ['say', 'A good Trainer aims for the weak spot. I never hit anything else.']
      ], [
        ['say', 'A young Trainer, all the way out here! When I was your age I carried this lens into every battle. It is yours now.'],
        ['giveItem', 'scope-lens', 1],
        ['setFlag', 'fight-scope-lens'],
        ['say', 'Give it to a Pokémon to hold. It helps it land critical hits.']
      ]]
    ]
  });
})();
