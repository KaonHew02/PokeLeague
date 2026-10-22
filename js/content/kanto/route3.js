/* ============ route3.js — Route 3: Pewter City to Mt. Moon ============
 * A road lined with young Trainers (two Bug Catchers, two Youngsters, three Lasses) and
 * patches of tall grass (Spearow, Nidoran, Jigglypuff, Mankey: the games' table). Pewter
 * City lets you through once you have the Boulder Badge. Route 4 and Mt. Moon lie east.
 */
G.Maps.def({
  id: 'route3', loc: 'kanto-route-3', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T..........."""""""".....TTTT....."""""""..T',
    'T..........."""""""".....TTTT....."""""""..T',
    'T..........."""""""",,,,,,,,,,,,,,,,,,,,,,,,',
    'T..S................,......................T',
    ',,,,,,,,,,,,,,,,,,,,,......................T',
    'T................................."""""""..T',
    'T..........vvvvvvvvvvvv..........."""""""..T',
    'T......................."""""""".."""""""..T',
    'T....""""""............."""""""".."""""""..T',
    'T....""""""...TTT.......""""""""...........T',
    'T.ff.""""""...TTT.......""""""""...........T',
    'T.............TTT.....................S..f.T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'pewter', offset: -4 }, east: { map: 'route4', offset: 0 } },
  spots: { west: [1, 5, 'right'], east: [42, 3, 'left'] },
  signs: {
    '3,4': 'Route 3. West: Pewter City. East: Mt. Moon.',
    '38,12': 'Trainer Tips: a Trainer who sees you will come over to battle. Walk past their line of sight if you are not ready!'
  },
  trainers: [
    { id: 'ben', who: 'youngster', cls: 'youngster', name: 'Ben', x: 8, y: 4, dir: 'down', sight: 1,
      team: [['rattata', 11], ['ekans', 11]],
      before: "Hey! You're the one who beat Brock? Prove it!",
      defeat: 'Wow, you really are strong.',
      after: 'I wear shorts all year round. Keeps me fast!' },
    { id: 'colton', who: 'bugcatcher', cls: 'bug-catcher', name: 'Colton', x: 14, y: 6, dir: 'up', sight: 1,
      team: [['caterpie', 10], ['weedle', 10], ['caterpie', 10]],
      before: 'My bugs are fresh from Viridian Forest. Battle!',
      defeat: 'Squashed again...',
      after: 'Bug Pokémon evolve early. That is why I love them.' },
    { id: 'janice', who: 'lass', cls: 'lass', name: 'Janice', x: 18, y: 4, dir: 'down', sight: 1,
      team: [['pidgey', 9], ['pidgey', 9]],
      before: 'You looked at me, so now we battle!',
      defeat: 'That was not fair...',
      after: 'I like Pidgey because they are cute and easy to raise.' },
    { id: 'calvin', who: 'youngster', cls: 'youngster', name: 'Calvin', x: 24, y: 2, dir: 'down', sight: 1,
      team: [['spearow', 14]],
      before: 'My Spearow is the fiercest bird on this road!',
      defeat: 'It got plucked...',
      after: 'Spearow evolves into Fearow. Then nobody will beat me!' },
    { id: 'sally', who: 'lass', cls: 'lass', name: 'Sally', x: 29, y: 4, dir: 'up', sight: 1,
      team: [['rattata', 10], ['nidoran-f', 10]],
      before: "Going to Mt. Moon? Let's warm up first!",
      defeat: "You're tough!",
      after: 'Lots of people go to Mt. Moon to look for Moon Stones.' },
    { id: 'greg', who: 'bugcatcher', cls: 'bug-catcher', name: 'Greg', x: 33, y: 2, dir: 'down', sight: 1,
      team: [['weedle', 9], ['kakuna', 9], ['caterpie', 9], ['metapod', 9]],
      before: 'Four bugs! Can you handle them all?',
      defeat: 'You handled them all...',
      after: 'Next time I will bring five!' },
    { id: 'robin', who: 'lass', cls: 'lass', name: 'Robin', x: 38, y: 4, dir: 'up', sight: 1,
      team: [['jigglypuff', 14]],
      before: 'My Jigglypuff sings so well, you will fall asleep!',
      defeat: 'Jigglypuff, are you all right?',
      after: 'Jigglypuff live on this route. Have you caught one?' }
  ],
  encounters: { walk: '@kanto-route-3-area' }
});
