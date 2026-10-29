/* ============ route36.js — Routes 36 and 37, and the strange tree ============
 * Chapter 14. Route 36 runs from the National Park east to Violet City; the road north to Route
 * 37 is blocked by a strange tree that shivers when touched. Watered with the Squirt Bottle
 * (from Goldenrod's Flower Shop, after the Plain Badge) it turns out to be a Sudowoodo and
 * attacks (a wild battle, Lv. 20; flag sudowoodo-gone unless you lose). The way south to the
 * Ruins of Alph is closed. Route 37 leads north to Ecruteak City.
 */
G.Maps.def({
  id: 'route36', loc: 'johto-route-36', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTTTTTTTT',
    'T.............TTTT,,TTTT...................T',
    'T.""""""""""".TTTT,,TTTT.""""""""""""""""..T',
    'T.""""""""""".TTTT,,TTTT.""""""""""""""""..T',
    'T.""""""""""".TTTT,,TTTT.""""""""""""""""..T',
    'T.""""""""""".TTTT,TTTTT.""""""""""""""""..T',
    'T.""""""""""".TTTT,,TTTT.""""""""""""""""..T',
    'T.""""""""""".TTTT,,TTTT.""""""""""""""""..T',
    'T.""""""""""".TTTT,,TTTT...................T',
    'T.S.............S.,,.....................S.T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.............................,,...........T',
    'T...""""""""""".........h.....,,S........h.T',
    'T..."""""""""""...............,,...........T',
    'T..."""""""""""...........TTTT,,TTTT.......T',
    'T..."""""""""""...........TTTT,TTTTT.......T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT,TTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'national-park', offset: -4 }, east: { map: 'violet', offset: -3 }, north: { map: 'route37', offset: 8 },
             south: { map: 'ruins-of-alph', offset: 14 } },
  signs: {
    '16,9': 'Route 36. North: Route 37 and Ecruteak City.',
    '2,9': 'The National Park is to the west.',
    '41,9': 'Violet City is to the east.',
    // Chapter 24: closed until Kurt has made his seven balls (johto/ruins.js).
    '32,13': { script: 'ruins.route36-sign' }
  },
  npcs: [
    { id: 'sudowoodo', who: 'sudowoodo', mon: 'sudowoodo', x: 18, y: 5, dir: 'down', fixed: true, if: '!sudowoodo-gone', script: 'route36.sudowoodo' },
    { id: 'girl', who: 'lass', x: 17, y: 9, dir: 'down', if: '!sudowoodo-gone',
      say: 'That tree up there... I am sure it moved when I looked away! And it is not even windy.' },
    { id: 'girl2', who: 'lass', x: 17, y: 9, dir: 'down', if: 'sudowoodo-gone',
      say: 'So the tree was a Pokémon all along! Sudowoodo hate water, I heard. Strange, for a tree.' },
    { id: 'researcher', who: 'scientist', x: 30, y: 16, dir: 'up', if: '!kurt-seven',
      say: 'Sorry, the Ruins of Alph are closed. Since the last earthquake, we have been making sure the chambers are safe.' }
  ],
  trainers: [
    { id: 'mark', who: 'psychic', cls: 'psychic', name: 'Mark', x: 26, y: 9, dir: 'down', sight: 2,
      team: [['abra', 17], ['kadabra', 18]],
      before: 'I already know how this battle ends. Shall we find out if I am right?',
      defeat: 'I did not see that coming...',
      after: 'Psychic Pokémon read minds. Dark and Ghost moves are what they fear.' },
    { id: 'alan', who: 'youngster', cls: 'youngster', name: 'Alan', x: 8, y: 12, dir: 'up', sight: 2,
      team: [['tangela', 18]],
      before: 'Tangela is a mystery! Nobody has ever seen what is under all those vines. Battle!',
      defeat: 'Still a mystery...',
      after: 'I like Pokémon that are hard to understand. Like that walking tree!' }
  ],
  items: [{ x: 41, y: 2, item: 'hyper-potion', flag: 'route36-potion' }],
  encounters: { walk: '@johto-route-36-area' }
});

G.Maps.def({
  id: 'route37', loc: 'johto-route-37', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTT,,TTTTTTTTTTTT',
    'T.........,,...........T',
    'T.........,,...TTTTTTT.T',
    'T.........,,...TTTTTTT.T',
    'T.""""""".,,...TTTTTTT.T',
    'T.""""""".,,...TTTTTTT.T',
    'T.""""""".,,...TTTTTTT.T',
    'T.""""""".,,...TTTTTTT.T',
    'T.""""""".,,...........T',
    'T.""""""".,,.....y.h.y.T',
    'T.""""""".,,...........T',
    'T.""""""".,,...........T',
    'T.""""""".,,.."""""""".T',
    'T.........,,.."""""""".T',
    'T...h.....,,.."""""""".T',
    'T.TTTTTT..,,.."""""""".T',
    'T.TTTTTT..,,.."""""""".T',
    'T.TTTTTT..,,.."""""""".T',
    'T.TTTTTT..,,.."""""""".T',
    'T.TTTTTT..,,S..........T',
    'T.........,,...........T',
    'TTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { south: { map: 'route36', offset: -8 }, north: { map: 'ecruteak', offset: -10 } },
  signs: { '12,19': 'Route 37. Ecruteak City is just to the north.' },
  berries: [[17, 9, 'red-apricorn'], [21, 9, 'blue-apricorn']],
  trainers: [
    { id: 'greg', who: 'psychic', cls: 'psychic', name: 'Greg', x: 9, y: 8, dir: 'right', sight: 2,
      team: [['drowzee', 20]],
      before: 'Drowzee eats dreams. I wonder what yours taste like?',
      defeat: 'A bad dream...',
      after: 'Ecruteak has two towers. One burned down long ago, and the other still stands.' },
    { id: 'ann', who: 'lass', cls: 'lass', name: 'Ann', x: 12, y: 14, dir: 'left', sight: 2,
      team: [['clefairy', 18], ['jigglypuff', 18]],
      before: 'Clefairy and Jigglypuff are best friends. Just like me and my sister!',
      defeat: 'We lost together...',
      after: 'My sister is in Ecruteak watching the Kimono Girls dance. I want to go too!' }
  ],
  encounters: { walk: '@johto-route-37-area' }
});

G.Script.def({
  'route36.sudowoodo': [['if', 'has:squirt-bottle', [
    ['choice', 'A strange tree blocks the way. Water it with the Squirt Bottle?', [
      ['say', '{player} watered the strange tree with the Squirt Bottle.'],
      ['emote', 'self', '!'],
      ['say', 'The tree did not like that at all! It shook itself and attacked!'],
      ['wild', 'sudowoodo', 20, { moves: ['rock-throw', 'flail', 'low-kick'] }],
      ['if', 'battle=lose', [], [['setFlag', 'sudowoodo-gone'], ['hide', 'self']]]
    ], []]
  ], [
    ['say', 'A strange tree blocks the way. When you touch it, it shivers... Is it really a tree?']
  ]]]
});
