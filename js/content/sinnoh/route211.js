/* ============ route211.js — Route 211 West and the tunnel through Mt. Coronet ============
 * Chapter 66. With the Forest Badge (badge 26) the Hiker in Eterna City's east exit leaves (eterna.js): Route 211 West
 * climbs east to Mt. Coronet, as early as in Platinum (Lv. 13-18). The tunnel (`coronet-211`) goes through the mountain
 * past a cracked rock (Rock Smash) to a second mouth on Route 211 East (snowpoint.js), beside the one that climbs north to
 * Route 216. Its east half stays shut (a Hiker, rocks fell) until chapter 52 is done, the same as Celestic Town's west exit,
 * so nobody reaches Route 211 East, Route 216 or Snowpoint City before their chapter. The chapter ends (`ending(66)`) the
 * first time you go through the tunnel once chapter 65 is done. Platinum's Trainers and wild Pokémon. Left out: the
 * Dowsing Machine's items, Energypowder (not in the game), the Poké Radar; Platinum's tunnel and the way north are one
 * floor, here two maps, so chapter 53's way stays as it was.
 * Chapter 74: north of the tunnel's east half a boulder (Strength) opens a small room with the ladder down to Mt. Coronet
 * B1F (b1f.js), as on Platinum's Celestic Town side.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };

  // ---------------- Route 211 West ----------------
  G.Maps.def(Object.assign({
    id: 'route211w', loc: 'sinnoh-route-211', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T##############################T',
      'T##############################T',
      'T##############################T',
      'T..........................####T',
      'T...""""""""".TT...........####T',
      'T..."""""""""..............####T',
      'T..."""""""""..............####T',
      'T..."""""""""..............####T',
      'T.S........................####T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,O###T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,####T',
      'T..........................####T',
      'T...........T..""""""""""..####T',
      'T..###k####....""""""""""..####T',
      'T..#......#....""""""""""..####T',
      'T..#......#....""""""""""..####T',
      'T..#......#....""""""""""..####T',
      'T..#......#....""""""""""..####T',
      'T..########................####T',
      'T...................T......####T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'eterna', offset: -3 } },
    encounters: { walk: '@sinnoh-route-211-west-towards-eterna-city' },
    warps: [{ x: 27, y: 10, to: 'coronet-211', spot: 'west' }],
    spots: { coronet: [26, 10, 'left'] },
    signs: { '2,9': 'Route 211. East: Mt. Coronet, and through it Celestic Town. West: Eterna City.' },
    items: [{ x: 6, y: 16, item: 'tm12', flag: 'route211w-tm12' }],
    trainers: [
      { id: 'alexandra', who: 'birdkeeper', cls: 'bird-keeper', name: 'Alexandra', x: 8, y: 9, dir: 'down', sight: 2,
        before: 'My birds ride the wind that comes down off the mountain. Want to see them fly?',
        defeat: 'They flew, and they fell.',
        after: 'Birds cannot fly over Mt. Coronet. It is too tall, even for them.',
        team: [['starly', 17, ['quick-attack', 'wing-attack', 'double-team', 'endeavor']], ['hoothoot', 17, ['hypnosis', 'peck', 'uproar', 'reflect']]] },
      { id: 'louis', who: 'hiker', cls: 'hiker', name: 'Louis', x: 16, y: 12, dir: 'up', sight: 2,
        before: 'Every Hiker in Sinnoh comes to Mt. Coronet sooner or later. Let me test your legs first!',
        defeat: 'Strong legs. Strong Pokémon, too.',
        after: 'The tunnel goes right through the mountain. Bring something that can break rocks.',
        team: [['geodude', 14, ['defense-curl', 'mud-sport', 'rock-polish', 'rock-throw']], ['onix', 18, ['screech', 'rock-throw', 'rage', 'rock-tomb']]] },
      { id: 'zach', who: 'youngster', cls: 'ninja-boy', name: 'Zach', x: 22, y: 9, dir: 'down', sight: 1,
        before: 'You found my hiding place! A ninja never forgives that!',
        defeat: 'I will find a better hiding place.',
        after: 'I hide here because nobody ever comes this way. Well, nobody used to.',
        team: [['zubat', 14, ['leech-life', 'supersonic', 'astonish', 'bite']]] }
    ]
  }, SINNOH));

  // ---------------- The tunnel ----------------
  G.Maps.def(Object.assign({
    id: 'coronet-211', loc: 'mt-coronet', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#',
    cave: true, escape: true,
    rows: [
      '##############################',
      '#######################....%##',
      '#######################.....##',
      '#######################.....##',
      '##########.........######.####',
      '#........#.........###.......#',
      '#........#..##.....###.......#',
      'O........k..##...............O',
      '#........#.........###.......#',
      '#........#.........###.......#',
      '##########.........###########',
      '##############################',
      '##############################',
      '##############################'
    ],
    encounters: { walk: '@mt-coronet-1f-route-211' },
    warps: [{ x: 0, y: 7, to: 'route211w', spot: 'coronet' }, { x: 29, y: 7, to: 'route211e', spot: 'tunnel' },
            { x: 27, y: 1, to: 'coronet-b1f', spot: 'ladder' }],                 // Mt. Coronet B1F (b1f.js, chapter 74)
    spots: { west: [1, 7, 'right'], east: [28, 7, 'left'], ladder: [27, 2, 'down'] },
    // The boulder before the room with the ladder: pushed north from the tunnel, or south from the room.
    boulders: [{ id: 'b1f', x: 25, y: 4 }],
    triggers: [{ x: 19, y: 7, w: 3, h: 1, if: ['chapter-65-done', '!chapter-66-done'], script: 'r211.through' }],
    items: [{ x: 17, y: 4, item: 'stardust', flag: 'coronet211-stardust' }, { x: 11, y: 10, item: 'ice-heal', flag: 'coronet211-ice-heal' },
            { x: 27, y: 5, item: 'escape-rope', flag: 'coronet211-rope' }],
    npcs: [{ id: 'hiker', who: 'hiker', x: 20, y: 7, dir: 'left', if: '!chapter-52-done',
             say: 'Rocks have been falling up ahead all week. I would not go any further if I were you.' }]
  }, SINNOH));

  /** Through the tunnel, after chapter 65: the end of the chapter. */
  async function through(h) {
    const F = G.Field;
    if (!F.flag('chapter-65-done') || F.flag('chapter-66-done')) return;
    await h.say(T('A breeze blows through the tunnel. Eterna City and Celestic Town are joined again, under the mountain.'));
    // The end of the sixty-sixth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(66); else F.setFlag('chapter-66-done');
  }

  G.Script.def({ 'r211.through': [['js', through]] });
})();
