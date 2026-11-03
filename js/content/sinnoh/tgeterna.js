/* ============ tgeterna.js — Team Galactic's Eterna Building, the cycle shop, Route 206 (Cycling Road), Route 207 ============
 * Chapter 47. With the Forest Badge, the guard leaves the door of Team Galactic's building in Eterna City
 * (eterna.js): the cycle shop's owner says they took his Clefairy, and Gardenia keeps watch outside.
 * 1F: two grunts and the stairs; 2F: a grunt and Commander Jupiter (Zubat 18, Skuntank 20). Beating her
 * frees the Clefairy (flag tg-eterna-done): the cycle shop opens (the owner gives a Moon Stone: you
 * already ride the Bicycle from Kanto), Cycling Road (Route 206, south of Eterna) opens, and so does the
 * muddy way north of Oreburgh City. Cycling Road runs downhill to the south (`bike: true`, `slope`), with
 * Cyclists on it; at its foot Route 207 joins Oreburgh City (south-west) and Mt. Coronet (east,
 * hearthome.js). Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const JUPITER = { name: 'Jupiter' }, OWNER = { name: 'Cycle Shop Owner' };
  const SINNOH = { region: 'sinnoh' };
  const TG_FLOOR = ['WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW', 'PP+++++++++++^+', '+++++++++++++++', '+tt+++++++++tt+', '+++++++++++++++',
                    '+++++++++++++++', '+tt+++++++++tt+', '+++++++++++++++'];

  // ---------------- Team Galactic's Eterna Building ----------------
  G.Maps.def(Object.assign({
    id: 'tg-eterna-1f', loc: 'tg-eterna-bldg', tileset: 'indoor', palette: 'lab', music: 'gym', battleBg: 'indoor',
    rows: TG_FLOOR.concat(['+++++++X+++++++']),
    warps: [{ x: 7, y: 9, to: 'eterna', spot: 'tg-door' }, { x: 13, y: 2, to: 'tg-eterna-2f', spot: 'stairs' }],
    spots: { door: [7, 9, 'up'], stairs: [13, 3, 'down'] },
    trainers: [
      { id: 'grunt-a', who: 'galactic', cls: 'team-galactic', x: 3, y: 6, dir: 'right', sight: 4, team: [['stunky', 16], ['glameow', 16]],
        before: 'A kid in our building? You must be lost. Let me show you the way out!',
        defeat: 'You found the way in instead...',
        after: 'Commander Jupiter is upstairs. She is much scarier than me.' },
      { id: 'grunt-b', who: 'galactic', cls: 'team-galactic', x: 11, y: 4, dir: 'left', sight: 4, team: [['zubat', 15], ['croagunk', 17]],
        before: 'This is a Team Galactic building. Trespassers get battled!',
        defeat: 'Trespasser one, Team Galactic zero.',
        after: 'We are only borrowing that Clefairy. It is for science! ...Probably.' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'tg-eterna-2f', loc: 'tg-eterna-bldg', tileset: 'indoor', palette: 'lab', music: 'gym', battleBg: 'indoor',
    rows: TG_FLOOR.concat(['+++++++++++++++']),
    warps: [{ x: 13, y: 2, to: 'tg-eterna-1f', spot: 'stairs' }],
    spots: { stairs: [13, 3, 'down'] },
    npcs: [{ id: 'clefairy', who: 'clefairy', mon: 'clefairy', x: 3, y: 3, dir: 'down', fixed: true, if: '!tg-eterna-done',
             say: 'Clefairy is shaking in the corner. It looks like it wants to go home.' }],
    trainers: [
      { id: 'grunt-c', who: 'galactic', cls: 'team-galactic', x: 10, y: 6, dir: 'left', sight: 4, if: '!tg-eterna-done', team: [['glameow', 17], ['bronzor', 17]],
        before: 'The Commander is busy. Nobody gets past me!',
        defeat: 'Somebody got past me...',
        after: 'Go on, then. Do not say I did not warn you.' },
      { id: 'jupiter', who: 'jupiter', cls: 'galactic-commander', name: 'Jupiter', x: 7, y: 3, dir: 'down', sight: 0, ai: 'leader', if: '!tg-eterna-done',
        items: { 'super-potion': 1 },
        team: [['zubat', 18, ['bite', 'wing-attack', 'confuse-ray', 'leech-life']], ['skuntank', 20, ['poison-gas', 'screech', 'smokescreen', 'fury-swipes']]],
        before: 'So you are the Trainer Mars told me about. I am Jupiter, a Commander of Team Galactic. That Clefairy is part of our research, and research does not stop for children.',
        defeat: 'Hmph. Mars was right about you.',
        win: 'tgeterna.jupiter-win' }
    ]
  }, SINNOH));

  // ---------------- the cycle shop ----------------
  G.Maps.def(Object.assign({
    id: 'eterna-cycle', loc: 'eterna-city', tileset: 'indoor', palette: 'mart', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p__bb__', '___________', '_tt_____tt_', '___________', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'eterna', spot: 'cycle-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'owner', who: 'gentleman', x: 5, y: 3, dir: 'down', script: 'tgeterna.owner' },
      { id: 'clefairy', who: 'clefairy', mon: 'clefairy', x: 7, y: 3, dir: 'down', fixed: true,
        say: 'Clefairy is twirling happily around the shop.' }
    ]
  }, SINNOH));

  // ---------------- Route 206: Cycling Road ----------------
  G.Maps.def(Object.assign({
    id: 'route206', loc: 'sinnoh-route-206', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    bike: true, slope: 'down',
    rows: [
      'TTTTTTTTT,TTTTTTTTTT',
      'TTTTTTTT,,,,TTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'TTTTTTTF,,,,FTTTTTTT',
      'T.......,,,,.S.....T',
      'T.""""".,,,,.......T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.""""".,,,,.""""".T',
      'T.......,,,,.""""".T',
      'T.......,,,,.......T',
      'T.......,,,,.......T',
      'TTTTTTTT,,,,TTTTTTTT'
    ],
    connect: { north: { map: 'eterna', offset: -8 }, south: { map: 'route207', offset: 0 } },
    signs: { '13,33': 'Route 206: Cycling Road. North: Eterna City. South: Route 207.' },
    trainers: [
      { id: 'axel', who: 'cyclist', cls: 'cyclist', name: 'Axel', x: 8, y: 8, dir: 'right', sight: 3, team: [['staravia', 18], ['ponyta', 18]],
        before: 'Downhill all the way! Can you keep up?',
        defeat: 'You were faster...',
        after: 'Let go of the pedals and the slope does the rest. Best road in Sinnoh!' },
      { id: 'kayla', who: 'cyclist', cls: 'cyclist', name: 'Kayla', x: 11, y: 15, dir: 'left', sight: 3, team: [['luxio', 19]],
        before: 'My Luxio and I race down this road every morning!',
        defeat: 'We lost the race...',
        after: 'At the bottom of the road is Route 207. Oreburgh City is to the west of it.' },
      { id: 'brad', who: 'cyclist', cls: 'cyclist', name: 'Brad', x: 8, y: 22, dir: 'right', sight: 3, team: [['geodude', 18], ['machop', 18], ['ponyta', 19]],
        before: 'Brakes? Who needs brakes? Battle!',
        defeat: 'Okay, maybe I need brakes.',
        after: 'Mt. Coronet is east of Route 207. It splits Sinnoh right down the middle.' },
      { id: 'megan', who: 'cyclist', cls: 'cyclist', name: 'Megan', x: 11, y: 28, dir: 'left', sight: 3, team: [['staravia', 19], ['buneary', 20]],
        before: 'Last stop before the bottom. Let me see what you have got!',
        defeat: 'You have got a lot.',
        after: 'Hearthome City is on the other side of Mt. Coronet. Its Gym Leader uses Ghost types.' }
    ],
    encounters: { walk: '@sinnoh-route-206-area' }
  }, SINNOH));

  // ---------------- Route 207 ----------------
  G.Maps.def(Object.assign({
    id: 'route207', loc: 'sinnoh-route-207', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTT,,,,TTTTTTTTTTTTTTTTTT',
      'T.......,,,,...............###',
      'T"""""..,,,,.""""""."""""".###',
      'T"""""..,,,,.""""""."""""".###',
      'T"""""..,,,,.""""""."""""".###',
      'T"""""..,,,,.""""""."""""".###',
      'T"""""..,,,,.""""""."""""".###',
      'T.......,,,,...............###',
      'T....,,,,,,,,,,,,,,,,,,,,,,O##',
      'T....,..................S..###',
      'T###.,........"""""""".....###',
      'T###.,.####..."""""""".....###',
      'T###.,.####..."""""""".....###',
      'T###.,.####..."""""""".....###',
      'T....,.....................###',
      'TTTTT,TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'route206', offset: 0 }, south: { map: 'oreburgh', offset: -12 } },
    warps: [{ x: 27, y: 8, to: 'mt-coronet-1f', spot: 'west' }],
    spots: { coronet: [26, 8, 'left'] },
    signs: { '24,9': 'Route 207. East: Mt. Coronet. North: Cycling Road. South-west: Oreburgh City.' },
    trainers: [
      { id: 'justin', who: 'hiker', cls: 'hiker', name: 'Justin', x: 16, y: 9, dir: 'up', sight: 1, team: [['geodude', 18], ['machop', 19]],
        before: 'I am heading into Mt. Coronet. First, a warm-up battle!',
        defeat: 'Warmed up and worn out.',
        after: 'Inside the mountain the air is cold and still. Strange people go in there, too.' },
      { id: 'maria', who: 'lass', cls: 'picnicker', name: 'Maria', x: 22, y: 7, dir: 'down', sight: 1, team: [['ponyta', 19], ['shinx', 19]],
        before: 'My Ponyta loves running along this route. Let us run you over, too!',
        defeat: 'Oops, we tripped.',
        after: 'Ponyta\'s mane is made of fire, but it does not burn people it trusts.' }
    ],
    encounters: { walk: '@sinnoh-route-207-area' }
  }, SINNOH));

  G.Script.def({
    'tgeterna.jupiter-win': [
      ['say', 'The Clefairy is not worth this much trouble. Take it back, then.', JUPITER],
      ['say', 'But remember this: Team Galactic is working toward a new world, and the boss does not like being kept waiting.', JUPITER],
      ['fade', 'out', 0.4], ['setFlag', 'tg-eterna-done'], ['fade', 'in', 0.4],
      ['say', 'Team Galactic left the Eterna Building, and the Clefairy ran straight home to the cycle shop.']
    ],
    'tgeterna.owner': [
      ['if', 'got-moon-stone-cycle', [
        ['say', 'Cycling Road starts at the south of town. Enjoy the ride, and watch the corners!', OWNER]
      ], [
        ['say', 'You brought my Clefairy back! Thank you, thank you!', OWNER],
        ['say', 'I wanted to give you a bike, but you already ride one from Kanto? Then take this. Clefairy loved to play with it.', OWNER],
        ['giveItem', 'moon-stone', 1],
        ['setFlag', 'got-moon-stone-cycle'],
        ['say', 'A Moon Stone makes some Pokémon evolve. And with Team Galactic gone, Cycling Road is open again!', OWNER]
      ]]
    ]
  });
})();
