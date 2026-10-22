/* ============ forest.js — Viridian Forest and the northern half of Route 2 ============
 * A maze of trees and tall grass (Caterpie, Weedle, their evolutions and the odd
 * Pikachu: the games' table) with five Bug Catchers, three item balls and a hidden one.
 * The way: in from Route 2 at the bottom, west along the bottom, north up the left side,
 * east along the top to the exit; the middle and right branches are side paths.
 * Beyond it, the north half of Route 2 leads to Pewter City (pewter.js).
 */
G.Maps.def({
  id: 'viridian-forest', loc: 'viridian-forest', tileset: 'outdoor', palette: 'forest', music: 'forest', battleBg: 'forest', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTT,,TTT',
    'TTTTTTTTTTTTTTTTTTTTT,,TTT',
    'T....."""""""".......,,..T',
    'T.....""""""""......S,,..T',
    'T....................,,..T',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T""""TTTTTTTTTTTTTTTTTTTTT',
    'T""""TTTTTTTTTTTTTTTTTTTTT',
    'T""""TTTTTTTTTTTTTTTTTTTTT',
    'T""""TTTTTTTTTTTTTTTTTTTTT',
    'T""""TTTTTTTTTTTTTTTTTTTTT',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T......."""""........TTTTT',
    'T......."""""........TTTTT',
    'T......."""""..........TTT',
    'T....TTTTTTTTTTTTTT....TTT',
    'T....TTTTTTTTTTTTTT....TTT',
    'T....TTTTTTTTTTTTTT....TTT',
    'T""""TTTTTTTTTTTTTT....TTT',
    'T""""TTTTTTTTTTTTTT""""TTT',
    'T""""TTTTTTTTTTTTTT""""TTT',
    'T""""TTTTTTTTTTTTTT""""TTT',
    'T""""TTTTTTTTTTTTTT""""TTT',
    'T""""TTTTTTTTTTTTTT....TTT',
    'T....TTTTTTTTTTTTTT....TTT',
    'T....TTTTTTTTTTTTTT....TTT',
    'T....TTTTTTTTTTTTTT....TTT',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T....TTTTTTTTTTTTTTTTTTTTT',
    'T............."""""..TTTTT',
    'T............."""""..TTTTT',
    'T...........,,.......TTTTT',
    'T...........,,.......TTTTT',
    'TTTTTTTTTTTS,,TTTTTTTTTTTT',
    'TTTTTTTTTTTT,,TTTTTTTTTTTT',
    'TTTTTTTTTTTT,,TTTTTTTTTTTT'
  ],
  connect: { south: { map: 'route2', offset: 8 }, north: { map: 'route2-north', offset: 12 } },
  spots: { south: [12, 38, 'up'], north: [21, 1, 'down'] },
  signs: {
    '11,37': 'Viridian Forest. Wild Bug Pokémon everywhere, and Bug Catchers too!',
    '20,3': 'Leaving Viridian Forest. Pewter City lies to the north.'
  },
  npcs: [
    { id: 'kid', who: 'youngster', x: 16, y: 36, move: 'look',
      say: "I'm hoping to catch a Pikachu. They're really rare in here!" }
  ],
  trainers: [
    { id: 'doug', who: 'bugcatcher', cls: 'bug-catcher', name: 'Doug', x: 9, y: 33, dir: 'down', sight: 3,
      team: [['weedle', 7], ['kakuna', 7], ['weedle', 7]],
      before: 'Hey, wait up! I just caught some great bugs. Let me show you!',
      defeat: 'Huh? I ran out of Pokémon!',
      after: "Kakuna can't do much yet, but one day it'll be a Beedrill!" },
    { id: 'rick', who: 'bugcatcher', cls: 'bug-catcher', name: 'Rick', x: 3, y: 26, dir: 'down', sight: 4,
      team: [['weedle', 6], ['caterpie', 6]],
      before: "Whoa, a Trainer! Let's see what your Pokémon can do!",
      defeat: 'No way! My bugs got beaten!',
      after: 'Bug Pokémon grow up fast. Mine will be stronger next time!' },
    { id: 'anthony', who: 'bugcatcher', cls: 'bug-catcher', name: 'Anthony', x: 16, y: 14, dir: 'left', sight: 3,
      team: [['caterpie', 7], ['caterpie', 8]],
      before: "I've been raising my Caterpie for ages. Battle me!",
      defeat: 'My Caterpie! Noooo...',
      after: "Caterpie becomes Metapod, then Butterfree. I can't wait!" },
    { id: 'charlie', who: 'bugcatcher', cls: 'bug-catcher', name: 'Charlie', x: 1, y: 6, dir: 'right', sight: 3,
      team: [['metapod', 7], ['caterpie', 7], ['metapod', 7]],
      before: "Metapod only knows Harden... but it's really tough! Let's battle!",
      defeat: "Even Harden wasn't enough...",
      after: "Metapod is like a shell. It's quietly waiting to evolve." },
    { id: 'sammy', who: 'bugcatcher', cls: 'bug-catcher', name: 'Sammy', x: 18, y: 3, dir: 'left', sight: 4,
      team: [['weedle', 9]],
      before: "This forest is my training ground! You won't get past me!",
      defeat: 'I lost to a beginner?!',
      after: 'Pewter City is just past the forest. Its Gym uses Rock-type Pokémon.' }
  ],
  items: [
    { x: 1, y: 36, item: 'poke-ball', flag: 'forest-ball' },
    { x: 22, y: 16, item: 'antidote', flag: 'forest-antidote' },
    { x: 21, y: 28, item: 'potion', flag: 'forest-potion' },
    { x: 24, y: 2, item: 'potion', flag: 'forest-hidden-potion', hidden: true }
  ],
  encounters: { walk: '@viridian-forest-area' }
});

G.Maps.def({
  id: 'route2-north', loc: 'kanto-route-2', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTT,,TTTTTTTTT',
    'T........,,........T',
    'T.ff.....,,....S...T',
    'T.ff.....,,........T',
    'T........,,..TT....T',
    'TTvvvvvvv,,vvvvvvvTT',
    'T........,,........T',
    'T..TT....,,....TT..T',
    'T........,,........T',
    'T..ff....,,........T',
    'T........,,........T',
    'TTTTTTTTT,,TTTTTTTTT'
  ],
  connect: { south: { map: 'viridian-forest', offset: -12 }, north: { map: 'pewter', offset: -5 } },
  spots: { south: [9, 10, 'up'], north: [9, 1, 'down'] },
  signs: { '15,2': 'Route 2. North: Pewter City. South: Viridian Forest.' },
  npcs: [
    { id: 'hiker', who: 'camper', x: 13, y: 8, move: 'look',
      say: "Made it through the forest? Nice! Pewter City's Gym Leader is said to be as hard as a rock." }
  ]
});
