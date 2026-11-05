/* ============ victory.js — Route 223, Victory Road and the gates of the Sinnoh League ============
 * Chapter 58. North of Sunyshore City (sunyshore.js) the sea becomes Route 223, with swimmers and small islands, up to a waterfall
 * (Waterfall). Above it the south side of the League: a Center, and the mouth of Victory Road, which only opens with the Beacon
 * Badge (32), so nobody can surf past Volkner. Platinum's Victory Road needs Rock Climb, which this game does not have: here it is three
 * caves. 1F south, 2F (a boulder on a plate opens the rock wall), B1F (a lake to Surf over), then 1F north and the way out to the League.
 * Its Trainers and items are Platinum's, with two double battles. In front of the League Barry stops you for a last battle
 * (team by `barry-starter`, flag barry-league), then `ending(58)`. The doors of the League stay shut until the next chapter.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const BARRY = { name: 'Barry' };
  const CAVE = { loc: 'sinnoh-victory-road', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const LEAGUE = { loc: 'sinnoh-pokemon-league', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', region: 'sinnoh' };

  // Barry in front of the League, by the starter he chose (the variable barry-starter).
  const BARRY_TEAMS = {
    387: [['staraptor', 44], ['floatzel', 43], ['heracross', 44], ['rapidash', 43], ['snorlax', 45], ['torterra', 47]],
    390: [['staraptor', 44], ['floatzel', 43], ['heracross', 44], ['roserade', 43], ['snorlax', 45], ['infernape', 47]],
    393: [['staraptor', 44], ['roserade', 43], ['heracross', 44], ['rapidash', 43], ['snorlax', 45], ['empoleon', 47]]
  };

  // ---------------- Route 223 ----------------
  G.Maps.def(Object.assign({
    id: 'route223', loc: 'sinnoh-sea-route-223', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '#',
    rows: [
      '#.............,,.............#',
      '#.............,,.............#',
      '#.............,,.............#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '##############||##############',
      '##############||##############',
      '##############||##############',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~:::::~~~#',
      '#~~~~~~~~~~~~~~~~~~~~:::::~~~#',
      '#~~~~~~~~~~~~~~~~~~~~:::::~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~::::::~~~~~~~~~~~~~~~~~~#',
      '#~~~~::..::~~~~~~~~~~~~~~~~~~#',
      '#~~~~::..::~~~~~~~~~~~~~~~~~~#',
      '#~~~~::::::~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~::::::~~~#',
      '#~~~~~~~~~~~~~~~~~~~::..::~~~#',
      '#~~~~~~~~~~~~~~~~~~~::..::~~~#',
      '#~~~~~~~~~~~~~~~~~~~::..::~~~#',
      '#~~~~~~~~~~~~~~~~~~~::::::~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~::::::~~~~~~~~~~~~~~~~~~~#',
      '#~~~::..::~~~~~~~~~~~~~~~~~~~#',
      '#~~~::..::~~~~~~~~~~~~~~~~~~~#',
      '#~~~::::::~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#'
    ],
    connect: { south: { map: 'sunyshore', offset: -10 }, north: { map: 'league-south', offset: -1 } },
    trainers: [
      { id: 'wesley', who: 'swimmer', cls: 'swimmer', name: 'Wesley', x: 12, y: 50, dir: 'right', sight: 3, swim: true, team: [['floatzel', 43], ['tentacruel', 43]],
        before: 'The League is a long swim from here. Are you sure you can make it?',
        defeat: 'You swim better than I thought.',
        after: 'I swim this way every morning, and I have never once reached the waterfall.' },
      { id: 'ricardo', who: 'swimmer', cls: 'swimmer', name: 'Ricardo', x: 22, y: 47, dir: 'left', sight: 3, swim: true, team: [['tentacruel', 45]],
        before: 'Nobody crosses my stretch of water for free!',
        defeat: 'Fine. It is free.' },
      { id: 'francisco', who: 'swimmer', cls: 'swimmer', name: 'Francisco', x: 8, y: 40, dir: 'right', sight: 3, swim: true, team: [['tentacool', 41], ['golduck', 45]],
        before: 'The current gets stronger from here on. So do I!',
        defeat: 'The current was not on my side.' },
      { id: 'troy', who: 'swimmer', cls: 'swimmer', name: 'Troy', x: 18, y: 31, dir: 'left', sight: 3, swim: true, team: [['gyarados', 45]],
        before: 'I do not swim with this Gyarados. I swim away from it.',
        defeat: 'It is not happy with either of us now.' },
      { id: 'oscar', who: 'swimmer', cls: 'swimmer', name: 'Oscar', x: 14, y: 20, dir: 'left', sight: 3, swim: true, team: [['mantyke', 41], ['remoraid', 42], ['mantine', 43]],
        before: 'We all travel together. It saves on swimming!',
        defeat: 'We will drift home.' },
      { id: 'miranda', who: 'swimmerf', cls: 'swimmer-f', name: 'Miranda', x: 24, y: 51, dir: 'left', sight: 3, swim: true, team: [['lumineon', 45]],
        before: 'My Lumineon lights up the deep water. Look at it glow!',
        defeat: 'It glowed so nicely.',
        after: 'They say the League can be seen from the top of the waterfall.' },
      { id: 'aubree', who: 'swimmerf', cls: 'swimmer-f', name: 'Aubree', x: 13, y: 42, dir: 'right', sight: 3, swim: true, team: [['bibarel', 43], ['azumarill', 43]],
        before: 'A swimmer needs friends who can float!',
        defeat: 'They floated very well.' },
      { id: 'paige', who: 'swimmerf', cls: 'swimmer-f', name: 'Paige', x: 16, y: 27, dir: 'down', sight: 3, swim: true, team: [['marill', 41], ['wingull', 42], ['golduck', 43]],
        before: 'I came all this way to get away from people, and here you are!',
        defeat: 'Well, now you can go.' },
      { id: 'crystal', who: 'swimmerf', cls: 'swimmer-f', name: 'Crystal', x: 25, y: 26, dir: 'left', sight: 3, swim: true, team: [['wingull', 42], ['seaking', 44]],
        before: 'Seaking is the queen of the water, and I am her friend!',
        defeat: 'Her horn was not enough.' },
      { id: 'cassandra', who: 'swimmerf', cls: 'swimmer-f', name: 'Cassandra', x: 5, y: 30, dir: 'right', sight: 3, swim: true, team: [['lumineon', 44], ['pelipper', 42]],
        before: 'I can see a very long way from out here. I saw you coming!',
        defeat: 'I did not see that coming.' },
      { id: 'gabrielle', who: 'swimmerf', cls: 'swimmer-f', name: 'Gabrielle', x: 18, y: 13, dir: 'down', sight: 3, swim: true, team: [['golduck', 45]],
        before: 'The waterfall is right behind me. You will have to get past me first!',
        defeat: 'Go on, climb it.',
        after: 'You will need Waterfall to get up there, and a strong Pokémon that knows it.' },
      { id: 'zachariah', who: 'sailor', cls: 'sailor', name: 'Zachariah', x: 22, y: 36, dir: 'left', sight: 3, team: [['pelipper', 40], ['machoke', 42], ['gastrodon', 44]],
        before: 'I live on this island, and I do not get many visitors. Let us battle!',
        defeat: 'I should get out more.',
        after: 'Every Trainer who goes to the League goes past my island. Few of them stop to talk.' }
    ],
    items: [{ x: 8, y: 46, item: 'tm18', flag: 'route223-tm18' }, { x: 24, y: 37, item: 'rare-candy', flag: 'route223-rare-candy' }, { x: 9, y: 24, item: 'ultra-ball', flag: 'route223-ultra-ball' }],
    encounters: { water: '@sinnoh-sea-route-223-area' }
  }, SINNOH));

  // ---------------- The south side of the League ----------------
  G.Maps.def(Object.assign({}, LEAGUE, {
    id: 'league-south', border: '#',
    rows: [
      '################################',
      '################################',
      '################O###############',
      '##.............,,.............##',
      '##.............,,.............##',
      '##...........S.,,.............##',
      '##.............,,.............##',
      '##....CCCCC....,,.............##',
      '##....CCCCC....,,.............##',
      '##....CCCCC....,,.............##',
      '##....CCDCC....,,.............##',
      '##......,......,,.............##',
      '##......,,,,,,,,,.............##',
      '##.............,,.............##',
      '##.............,,.............##',
      '##.............,,.............##',
      '##.............,,.............##',
      '###############,,###############'
    ],
    connect: { south: { map: 'route223', offset: 1 } },
    warps: [
      { x: 8, y: 10, to: 'league-south-center', spot: 'door' },
      { x: 16, y: 2, to: 'sinnoh-victory-1f', spot: 'mouth', if: 'badge:32', locked: 'victory.shut' }
    ],
    spots: { 'center-door': [8, 11, 'down'], road: [16, 3, 'down'] },
    signs: { '13,5': 'Victory Road. Only Trainers with all eight badges of Sinnoh may enter.' },
    npcs: [{ id: 'officer', who: 'officer', x: 18, y: 3, dir: 'left', move: 'look', say: 'Beyond this cave stands the Pokémon League of Sinnoh. It has turned back more Trainers than I can count.' }]
  }));

  G.Maps.center('league-south-center', {
    loc: 'sinnoh-pokemon-league', exit: { map: 'league-south', spot: 'center-door' },
    npcs: [{ id: 'man', who: 'cooltrainerm', x: 3, y: 5, move: 'look', say: 'I got as far as the second floor of Victory Road. Bring strong Pokémon, and something that can push boulders.' }]
  }).region = 'sinnoh';

  // ---------------- Victory Road ----------------
  G.Maps.def(Object.assign({}, CAVE, {
    id: 'sinnoh-victory-1f',
    rows: [
      '##################################',
      '############################O#####',
      '##..............................##',
      '##........####..................##',
      '##........####..................##',
      '##........####........#####.....##',
      '##........####........#####.....##',
      '##....................#####.....##',
      '##.%..................#####.....##',
      '##################################',
      '##################################',
      '##################################',
      '##..........###...............%.##',
      '##....####..###.................##',
      '##....####..###.................##',
      '##....####..###......#####......##',
      '##....####...........#####......##',
      '##...................#####......##',
      '##...................#####......##',
      '##..............................##',
      '##..............................##',
      '################O#################',
      '##################################'
    ],
    warps: [
      { x: 16, y: 21, to: 'league-south', spot: 'road' },
      { x: 30, y: 12, to: 'sinnoh-victory-2f', spot: 'from-below' },
      { x: 3, y: 8, to: 'sinnoh-victory-b1f', spot: 'east' },
      { x: 28, y: 1, to: 'sinnoh-league', spot: 'road' }
    ],
    spots: { mouth: [16, 20, 'up'], 'from-above': [30, 13, 'down'], 'from-below': [3, 7, 'up'], exit: [28, 2, 'down'] },
    trainers: [
      { id: 'bryce', who: 'psychic', cls: 'psychic', name: 'Bryce', x: 5, y: 18, dir: 'right', sight: 4, team: [['haunter', 43], ['gardevoir', 46], ['gengar', 46]],
        before: 'I saw you coming in a vision. In the vision, I won.',
        defeat: 'I must have been looking at it upside down.',
        after: 'Up the ladder and over the rocks. That much I can see.' },
      { id: 'miles', who: 'blackbelt', cls: 'black-belt', name: 'Miles', x: 18, y: 13, dir: 'down', sight: 4, team: [['machamp', 48]],
        before: 'One Pokémon, four arms, no mercy!',
        defeat: 'All four arms are tired.',
        after: 'I have been training in this cave for a year. I still have not found the way out.' },
      { id: 'mariah', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Mariah', x: 27, y: 19, dir: 'left', sight: 4, team: [['blissey', 45], ['glalie', 46], ['magnezone', 48]],
        before: 'If you cannot beat me, you have no business at the League.',
        defeat: 'You have business at the League.',
        after: 'The Elite Four are stronger than anybody in this cave. Remember that.' },
      { id: 'hana', who: 'birdkeeper', cls: 'bird-keeper', name: 'Hana', x: 8, y: 4, dir: 'down', sight: 3, team: [['noctowl', 45], ['togetic', 47]],
        before: 'My birds do not like caves, and neither do I. So let us be quick!',
        defeat: 'That was quick.',
        after: 'There is daylight at the end of this passage. We are nearly out.' },
      { id: 'edgar', who: 'gentleman', cls: 'veteran', name: 'Edgar', x: 17, y: 7, dir: 'up', sight: 3, team: [['porygon-z', 46], ['tangrowth', 46], ['empoleon', 46]],
        before: 'I have walked this road more times than you have years. Show me what you have learned.',
        defeat: 'You have learned a great deal.',
        after: 'Every Trainer walks this road alone, in the end. Or with their Pokémon, which is the same.' },
      { id: 'clinton', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Clinton', x: 29, y: 6, dir: 'left', sight: 4, team: [['gible', 43], ['swablu', 45], ['gabite', 47]],
        before: 'The Champion trains Dragons. I mean to be ready for her, and so should you!',
        defeat: 'I am not ready.',
        after: 'If you think my Gabite is frightening, wait until you see what it grows into.' }
    ],
    items: [
      { x: 3, y: 13, item: 'tm41', flag: 'svictory-tm41' }, { x: 31, y: 19, item: 'max-repel', flag: 'svictory-max-repel' },
      { x: 8, y: 7, item: 'rare-candy', flag: 'svictory-rare-candy' }, { x: 30, y: 3, item: 'razor-claw', flag: 'svictory-razor-claw' },
      { x: 20, y: 2, item: 'zinc', flag: 'svictory-zinc' }, { x: 25, y: 20, item: 'nugget', flag: 'svictory-nugget' },
      { x: 3, y: 2, item: 'ultra-ball', flag: 'svictory-ultra-ball' }, { x: 31, y: 7, item: 'max-revive', flag: 'svictory-max-revive' }
    ],
    encounters: { walk: '@sinnoh-victory-road-1f' }
  }));

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'sinnoh-victory-2f',
    rows: [
      '##################################',
      '##################################',
      '##################################',
      '##.%..............##............##',
      '##................##............##',
      '##................##............##',
      '##....####........##....x.......##',
      '##....####........##............##',
      '##....####........##............##',
      '##....####........bb............##',
      '##................bb..#####.....##',
      '##................##..#####.....##',
      '##.........####...##..#####.....##',
      '##.........####...##............##',
      '##.........####...##............##',
      '##................##............##',
      '##................##............##',
      '##................##..........%.##',
      '##################################',
      '##################################'
    ],
    warps: [{ x: 30, y: 17, to: 'sinnoh-victory-1f', spot: 'from-above' }, { x: 3, y: 3, to: 'sinnoh-victory-b1f', spot: 'west' }],
    spots: { 'from-below': [30, 16, 'up'], 'from-above': [3, 4, 'down'] },
    boulders: [{ id: 'east', x: 27, y: 6 }],
    bars: [{ x: 18, y: 9, w: 2, h: 2, if: 'plate:sinnoh-victory-2f:24,6' }],
    trainers: [
      { id: 'omar', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Omar', x: 28, y: 14, dir: 'left', sight: 4, team: [['mamoswine', 45], ['mothim', 46], ['rampardos', 48]],
        before: 'That rock wall has stopped better Trainers than you!',
        defeat: 'Maybe not better.',
        after: 'There is a plate in the floor. Something heavy on it might do something.' },
      { id: 'sydney', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Sydney', x: 14, y: 4, dir: 'down', sight: 4, team: [['clefable', 47], ['torterra', 48]],
        before: 'You got through the wall? Then you are worth my time.',
        defeat: 'You are worth more than that.',
        after: 'Rest when you can. The League will not wait for you to be ready.' },
      { id: 'clayton', who: 'gentleman', cls: 'veteran', name: 'Clayton', x: 4, y: 13, dir: 'right', sight: 4, team: [['staraptor', 47], ['lickilicky', 47]],
        before: 'At my age you stop trying to reach the League. You just enjoy the road.',
        defeat: 'I enjoyed that.',
        after: 'I hope you enjoy the road as well. It goes by quickly.' },
      { id: 'al-kay', who: 'cooltrainerm', cls: 'double-team', name: 'Al & Kay', x: 9, y: 16, dir: 'up', sight: 3, double: true, partner: { who: 'cooltrainer', x: 10, y: 16, dir: 'up' },
        team: [['staraptor', 50], ['ambipom', 50]],
        before: 'We came to the League together, and we fight together. Two against two!',
        defeat: 'We lost together, too.',
        after: 'If one of us goes through those doors, we both do.' }
    ],
    items: [
      { x: 31, y: 4, item: 'max-elixir', flag: 'svictory-max-elixir' }, { x: 2, y: 16, item: 'tm79', flag: 'svictory-tm79' },
      { x: 16, y: 16, item: 'full-restore', flag: 'svictory-full-restore' }, { x: 20, y: 16, item: 'tm71', flag: 'svictory-tm71' },
      { x: 7, y: 4, item: 'rare-candy', flag: 'svictory-rare-candy2', hidden: true }
    ],
    encounters: { walk: '@sinnoh-victory-road-2f' }
  }));

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'sinnoh-victory-b1f',
    rows: [
      '##################################',
      '##################################',
      '##################################',
      '##.%........~~~~~~~~~~~.......%.##',
      '##..........~~~~~~~~~~~.........##',
      '##..........~~~~~~~~~~~.........##',
      '##..........~~~~~~~~~~~.........##',
      '##...####...~~~~~~~~~~~.........##',
      '##...####...~~~~~~~~~~~..####...##',
      '##...####...~~~~~~~~~~~..####...##',
      '##..........~~~~~~~~~~~..####...##',
      '##..........~~~~~~~~~~~..####...##',
      '##..........~~~~~~~~~~~.........##',
      '##..........~~~~~~~~~~~.........##',
      '##..........~~~~~~~~~~~.........##',
      '##..........~~~~~~~~~~~.........##',
      '##..........~~~~~~~~~~~.........##',
      '##..........~~~~~~~~~~~.........##',
      '##################################',
      '##################################'
    ],
    warps: [{ x: 3, y: 3, to: 'sinnoh-victory-2f', spot: 'from-above' }, { x: 30, y: 3, to: 'sinnoh-victory-1f', spot: 'from-below' }],
    spots: { west: [3, 4, 'down'], east: [30, 4, 'down'] },
    trainers: [
      { id: 'jo-pat', who: 'cooltrainer', cls: 'double-team', name: 'Jo & Pat', x: 7, y: 13, dir: 'up', sight: 3, double: true, partner: { who: 'cooltrainerm', x: 8, y: 13, dir: 'up' },
        team: [['lumineon', 50], ['rapidash', 50]],
        before: 'Water and fire, side by side. Nobody expects that!',
        defeat: 'You expected that.',
        after: 'You will have to Surf across the lake. The ladder is on the far side.' },
      { id: 'ondrej', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Ondrej', x: 26, y: 14, dir: 'left', sight: 3, team: [['altaria', 45], ['gabite', 47]],
        before: 'You crossed the lake for this? I admire that. I will still beat you.',
        defeat: 'I admire that as well.',
        after: 'I trained in Blackthorn City once. Dragons are the same everywhere: they do not listen.' },
      { id: 'valencia', who: 'psychic', cls: 'psychic', name: 'Valencia', x: 24, y: 5, dir: 'down', sight: 3, team: [['chimecho', 44], ['absol', 45], ['dusknoir', 46]],
        before: 'My Absol feels a disaster coming. I think it means you.',
        defeat: 'It meant me.',
        after: 'The ladder behind me goes up to the last part of the cave.' },
      { id: 'henry', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Henry', x: 29, y: 13, dir: 'left', sight: 3, team: [['rhydon', 47], ['carnivine', 48]],
        before: 'Nobody has made it this far today. Let me fix that.',
        defeat: 'Somebody has.',
        after: 'You are nearly there. I can almost smell the fresh air from here.' }
    ],
    items: [
      { x: 30, y: 17, item: 'ultra-ball', flag: 'svictory-ultra-ball2' }, { x: 3, y: 16, item: 'calcium', flag: 'svictory-calcium' },
      { x: 25, y: 4, item: 'tm59', flag: 'svictory-tm59' }, { x: 31, y: 16, item: 'max-elixir', flag: 'svictory-max-elixir2' }
    ],
    encounters: { walk: '@sinnoh-victory-road-b1f', water: '@sinnoh-victory-road-b1f' }
  }));

  // ---------------- The Pokémon League ----------------
  G.Maps.def(Object.assign({}, LEAGUE, {
    id: 'sinnoh-league', border: 'T', fly: { spot: 'center-door' }, barryTeams: BARRY_TEAMS,
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..............................T',
      'T..............................T',
      'T...........IIIIIIII...........T',
      'T...........IIIIIIII...........T',
      'T...........IIIIIIII...........T',
      'T...........IIIIIIII...CCCCC...T',
      'T...........IIIIIIII...CCCCC...T',
      'T...........IIIDIIII...CCCCC...T',
      'T..............,.......CCDCC...T',
      'T............S.,.........,.....T',
      'T..............,.........,.....T',
      'T..............,,,,,,,,,,,.....T',
      'T..............,...............T',
      'T..............,...............T',
      'T..............,...............T',
      'T..............,...............T',
      'T..............,...............T',
      'T..............,...............T',
      'T##############O###############T',
      'T##############################T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    warps: [
      { x: 15, y: 8, locked: 'sleague.closed' },
      { x: 25, y: 9, to: 'sinnoh-league-center', spot: 'door' },
      { x: 15, y: 19, to: 'sinnoh-victory-1f', spot: 'exit' }
    ],
    spots: { 'center-door': [25, 10, 'down'], road: [15, 18, 'up'], door: [15, 9, 'down'] },
    signs: { '13,10': 'The Pokémon League of Sinnoh. Trainers who reach this place have already come a long way.' },
    triggers: [{ x: 1, y: 13, w: 30, h: 1, if: '!barry-league', script: 'sleague.barry' }],
    npcs: [{ id: 'barry', who: 'barry', x: 15, y: 10, dir: 'down', if: '!barry-league', script: 'sleague.barry' }]
  }));

  G.Maps.center('sinnoh-league-center', {
    loc: 'sinnoh-pokemon-league', exit: { map: 'sinnoh-league', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'cooltrainer', x: 3, y: 5, move: 'look', say: 'Five battles in a row, and no way back once you start. That is the League. I am just here to look at it.' }]
  }).region = 'sinnoh';

  /** In front of the League: Barry's last battle. */
  async function barry(h) {
    const F = G.Field;
    if (F.flag('barry-league')) return;
    await h.say(T('There you are, {player}! I got here first! I got lost twice in Victory Road, but I still got here first!'), BARRY);
    await h.say(T('Since the Spear Pillar I have thought about nothing else. If I cannot beat you, I have no business going through those doors.'), BARRY);
    await h.say(T('All six of them are ready. This is the real one, {player}. Here we go!'), BARRY);
    const out = await h.battle({ id: 'barry-league', who: 'barry', name: 'Barry', prize: 100, ai: 'leader',
      team: BARRY_TEAMS[F.getVar('barry-starter')] || BARRY_TEAMS[390] });
    if (out !== 'win') return;
    await h.say(T('...That was everything I had. And you are still standing.'), BARRY);
    await h.say(T('All right. I get it. You are the one who goes first through those doors, and I will be right behind you. You had better not lose in there!'), BARRY);
    await h.fade('out', 0.3);
    F.setFlag('barry-league');
    await h.fade('in', 0.3);
    // The end of the fifty-eighth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(58); else F.setFlag('chapter-58-done');
  }

  G.Script.def({
    'victory.shut': [['say', 'An officer stands in the way. "Only Trainers with all eight badges of Sinnoh may enter Victory Road."']],
    'sleague.barry': [['js', barry]],
    'sleague.closed': [['say', 'The great doors are shut. A notice says they will open when the Elite Four are ready.']]
  });
})();
