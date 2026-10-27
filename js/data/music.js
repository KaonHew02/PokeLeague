/* ============ music.js — scores of the game's themes ============
 * Original compositions (not Nintendo's), carried over from PokéSurvivor.
 * New themes must be original too. Played by the synth in core/audio.js.
 *
 * melody: bars like "A4:4 C5:2 -:2" — note:length in 16ths (16 per bar), "-" = rest;
 *         "C4+E4+G4:8" plays several notes at once. Instruments: flute, bell, pluck,
 *         bass, pad, lead, brass, keys (see core/audio.js).
 * parts:  generated from `chords` with a 16-character pattern per bar:
 *           R root (the chord's bass with useBass) · F fifth · O octave · T third
 *           0-5 chord notes (0 root, 1 third, 2 fifth, 3 octave...)
 *           C whole chord · "-" holds the previous note · "." rest
 * drums:  X loud · x medium · o soft · . nothing. kick, snare, hat, shaker, tom, crash.
 *         16 characters repeat every bar; 32, 48... cover several bars.
 * once:   true for a jingle: it plays one time through (G.Audio.jingle), then the
 *         theme that was playing comes back. A song without chords is all melody.
 *
 * Which theme plays where is decided in js/data/music-map.js.
 */
G.MUSIC = {
  // ---------------- A quiet village (towns) ----------------
  village: {
    bpm: 100, swing: 0.18,
    chords: ['F', 'C/E', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C',
             'Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F', 'F'],
    melody: [{ inst: 'flute', vel: 1, bars: [
      'A4:4 C5:2 A4:2 G4:4 F4:4', 'G4:6 A4:2 C5:4 -:4', 'D5:4 C5:2 A4:2 F4:4 A4:4', 'G4:12 -:4',
      'A4:4 C5:2 F5:2 E5:4 D5:4', 'C5:6 A4:2 G4:4 E4:4', 'F4:4 G4:2 A4:2 D5:4 C5:4', 'C5:12 -:4',
      'D5:2 D5:2 F5:4 D5:4 Bb4:4', 'C5:2 C5:2 E5:4 G5:4 E5:4', 'A5:6 G5:2 E5:4 C5:4', 'D5:8 C5:4 A4:4',
      'Bb4:4 D5:4 G5:4 F5:2 D5:2', 'E5:4 G5:2 E5:2 C5:4 Bb4:4', 'A4:4 C5:4 F5:6 E5:2', 'F5:12 -:4'] }],
    parts: [
      { inst: 'bass', octave: 2, useBass: true, vel: 0.9, pattern: 'R--F--O-R--F--T-' },
      { inst: 'bell', octave: 4, vel: 0.5, pattern: '0.1.2.1.3.2.1.2.' },
      { inst: 'pad', octave: 3, vel: 0.9, pattern: 'C---------------' }
    ],
    drums: { kick: 'x.......x.......', snare: '....o.......o...', shaker: 'o.x.o.x.o.x.o.x.' }
  },

  // ---------------- Through the woods (routes) ----------------
  forest: {
    bpm: 122,
    chords: ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Bb', 'A',
             'Bb', 'C', 'Dm', 'Dm', 'Bb', 'C', 'A', 'A'],
    melody: [{ inst: 'flute', vel: 1, bars: [
      'D5:3 E5:1 F5:4 A5:4 G5:2 F5:2', 'E5:6 D5:2 C5:4 E5:4', 'F5:4 D5:4 Bb4:4 D5:4', 'C#5:8 E5:4 A4:4',
      'D5:2 F5:2 A5:4 D6:4 C6:2 A5:2', 'G5:4 E5:4 C5:4 E5:4', 'F5:3 G5:1 F5:4 D5:4 Bb4:4', 'A4:4 C#5:4 E5:4 A5:4',
      'D5:8 F5:8', 'E5:8 G5:8', 'A5:12 F5:4', 'D5:16',
      'F5:4 E5:4 D5:4 C5:4', 'E5:4 D5:4 C5:4 G4:4', 'A4:8 C#5:8', 'E5:16'] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 0.9, pattern: 'R.R.R.R.F.F.O.F.' },
      { inst: 'pluck', octave: 4, vel: 0.6, pattern: '0.2.1.2.3.2.1.2.' },
      { inst: 'pad', octave: 3, vel: 0.6, pattern: 'C-------C-------' }
    ],
    drums: { kick: 'X.....x.X.......', snare: '....X.......X...', hat: 'x.o.x.o.x.o.x.o.' }
  },

  // ---------------- Crystal cave (forests, caves) ----------------
  cave: {
    bpm: 92, swing: 0.1,
    chords: ['Am', 'F', 'G', 'Em', 'Am', 'F', 'Dm', 'E',
             'F', 'G', 'Em', 'Am', 'Dm', 'Em', 'F', 'E'],
    melody: [{ inst: 'flute', vel: 0.85, bars: [
      'E5:6 A5:2 G5:4 E5:4', 'F5:8 C5:4 A4:4', 'D5:6 G5:2 F5:4 D5:4', 'E5:12 -:4',
      'C6:4 B5:2 A5:2 E5:4 C5:4', 'A5:6 G5:2 F5:4 C5:4', 'D5:4 F5:4 A5:4 G5:2 F5:2', 'E5:4 G#5:4 B5:8',
      'A5:4 C6:4 A5:4 F5:4', 'B5:4 D6:4 B5:4 G5:4', 'G5:6 E5:2 B4:8', 'C5:4 E5:4 A5:8',
      'F5:4 A5:4 D6:4 C6:4', 'B5:6 G5:2 E5:8', 'A5:4 G5:4 F5:4 E5:4', 'E5:8 -:8'] }],
    parts: [
      { inst: 'bell', octave: 4, vel: 0.5, pattern: '0.2.4.2.3.2.4.2.' },
      { inst: 'bass', octave: 2, vel: 0.8, pattern: 'R-------F-------' },
      { inst: 'pad', octave: 3, vel: 1, pattern: 'C---------------' }
    ],
    drums: { kick: 'o.......o.......', hat: '..o...o...o...o.' }
  },

  // ---------------- Ash volcano (wild battles) ----------------
  volcano: {
    bpm: 132,
    chords: ['Em', 'F', 'Em', 'D', 'Em', 'F', 'G', 'F'],
    melody: [{ inst: 'lead', vel: 0.9, bars: [
      'E5:2 -:2 E5:2 F5:2 G5:4 F5:2 E5:2', 'F5:2 -:2 F5:2 G5:2 A5:4 G5:2 F5:2',
      'G5:4 B5:4 A5:2 G5:2 F5:2 E5:2', 'D5:8 F#5:4 A5:4',
      'B5:4 A5:2 G5:2 E5:4 G5:4', 'C6:4 B5:2 A5:2 F5:4 A5:4',
      'B5:2 D6:2 B5:2 G5:2 D5:4 G5:4', 'A5:4 G5:4 F5:4 E5:4'] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.R.R.R.R.R.F.O.' },
      { inst: 'pluck', octave: 3, vel: 0.5, pattern: '0.0.1.0.2.0.1.0.' },
      { inst: 'pad', octave: 3, vel: 0.5, pattern: 'C-------C-------' }
    ],
    drums: { kick: 'X..x..X.X..x..X.', snare: '....X.......X..x', hat: 'xoxoxoxoxoxoxoxo' }
  },

  // ---------------- Boss fight (trainer battles) ----------------
  boss: {
    bpm: 150,
    chords: ['Em', 'C', 'D', 'B', 'Em', 'C', 'D', 'B'],
    melody: [{ inst: 'lead', vel: 1, bars: [
      'E5:2 E5:2 G5:2 E5:2 B5:4 A5:2 G5:2', 'E5:2 E5:2 G5:2 E5:2 C6:4 B5:2 A5:2',
      'F#5:4 A5:4 D6:4 C6:2 B5:2', 'D#5:8 F#5:4 B5:4',
      'G5:2 F#5:2 E5:2 F#5:2 G5:4 B5:4', 'A5:2 G5:2 E5:2 G5:2 A5:4 C6:4',
      'B5:4 A5:4 F#5:4 D5:4', 'D#5:4 F#5:4 A5:4 B5:4'] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RR.RR.R.RR.RF.' },
      { inst: 'pluck', octave: 4, vel: 0.5, pattern: '0.1.2.1.0.1.2.3.' }
    ],
    drums: { kick: 'X.x.X.x.X.x.X.x.', snare: '....X.......X.X.', hat: 'oooooooooooooooo' }
  }
};

/* ---------------- Rift duel (gym leaders) ----------------
 * Faster and tenser than the boss theme: A minor, galloping bass and the
 * melody climbing to the high octave in the second half. */
G.MUSIC.rift = {
  bpm: 164,
  chords: ['Am', 'F', 'G', 'E', 'Am', 'F', 'Dm', 'E',
           'F', 'G', 'Am', 'Am', 'Dm', 'E', 'Am', 'E'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'A5:2 C6:2 E6:4 D6:2 C6:2 B5:4', 'A5:2 F5:2 A5:4 C6:4 F6:4',
    'G5:2 B5:2 D6:4 C6:2 B5:2 G5:4', 'G#5:8 B5:4 E6:4',
    'A5:2 A5:2 C6:2 A5:2 E6:4 D6:2 C6:2', 'F6:4 E6:2 D6:2 C6:4 A5:4',
    'D6:4 C6:2 A5:2 F5:4 A5:4', 'G#5:4 B5:4 D6:4 E6:4',
    'F6:2 E6:2 C6:4 A5:4 C6:4', 'G6:2 F6:2 D6:4 B5:4 D6:4',
    'E6:4 C6:2 A5:2 E6:4 A6:4', 'A6:12 -:4',
    'F6:4 D6:2 A5:2 F6:4 E6:2 D6:2', 'E6:2 G#6:2 B6:4 G#6:4 E6:4',
    'A6:4 E6:2 C6:2 A5:4 C6:4', 'B5:4 G#5:4 E5:4 -:4'] }],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RRR.RRF.FFO.OF' },
    { inst: 'pluck', octave: 4, vel: 0.5, pattern: '0.2.3.2.1.2.3.4.' },
    { inst: 'pad', octave: 3, vel: 0.55, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'X.x.X.x.X.x.X.xx', snare: '....X.......X..X', hat: 'xoxoxoxoxoxoxoxo' }
};

/* ---------------- Judgment (solemn; for the League later) ----------------
 * D minor with a darkening E flat (Phrygian), low bells every bar and the
 * melody climbing to the end. */
G.MUSIC.judgment = {
  bpm: 140,
  chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Eb', 'C', 'A',
           'Bb', 'C', 'Dm', 'Dm', 'Gm', 'A', 'Dm', 'A'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'D5:4 F5:4 A5:6 G5:2', 'F5:4 D5:4 Bb4:8',
    'G5:4 Bb5:4 D6:4 C6:2 Bb5:2', 'A5:8 C#6:4 E6:4',
    'D6:6 C6:2 A5:4 F5:4', 'G5:4 Eb5:4 G5:4 Bb5:4',
    'C6:4 E5:2 G5:2 C6:4 E6:4', 'C#6:12 -:4',
    'D6:2 D6:2 F6:4 D6:4 Bb5:4', 'C6:2 C6:2 E6:4 C6:4 G5:4',
    'A5:4 D6:4 F6:4 E6:2 D6:2', 'D6:12 -:4',
    'Bb5:4 D6:4 G6:4 F6:2 D6:2', 'E6:4 C#6:4 A5:4 E6:4',
    'F6:4 E6:2 D6:2 A5:4 F5:4', 'E5:4 A5:4 C#6:4 E6:4'] }],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RRR.RRR.RRF.OF' },
    { inst: 'bell', octave: 4, vel: 0.6, pattern: '0.......2.......' },
    { inst: 'pad', octave: 3, vel: 0.8, pattern: 'C---------------' }
  ],
  drums: { kick: 'X..xX..xX..xX.xx', snare: '....X.......X..X', hat: 'x.x.x.x.x.x.x.x.' }
};

/* ======================= Themes added for PokeLeague (M7) =======================
 * Original compositions like the ones above. */

/* ---------------- Title (title screen) ----------------
 * B flat major, heroic: the melody opens with a leap to the sixth and rises
 * to the high octave in the last phrase; brass on a 3+3+2 rhythm. */
G.MUSIC.title = {
  bpm: 128,
  chords: ['Bb', 'F/A', 'Gm', 'Eb', 'Bb', 'F', 'Eb', 'F',
           'Gm', 'Eb', 'Bb', 'F', 'Eb', 'F', 'Bb', 'Bb'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'F5:4 Bb5:4 D6:6 C6:2', 'C6:4 A5:2 F5:2 A5:4 C6:4', 'D6:4 Bb5:2 G5:2 D5:4 G5:4', 'Bb5:6 C6:2 Bb5:4 G5:4',
    'F5:4 Bb5:4 F6:6 Eb6:2', 'D6:4 C6:2 Bb5:2 A5:4 F5:4', 'G5:4 Bb5:2 Eb6:2 D6:4 C6:4', 'C6:12 -:4',
    'D6:2 D6:2 Bb5:4 G5:4 Bb5:4', 'Eb6:2 Eb6:2 Bb5:4 G5:4 Eb5:4', 'F5:4 Bb5:4 D6:4 F6:4', 'C6:6 A5:2 F5:8',
    'G5:4 Bb5:4 Eb6:4 G6:4', 'F6:4 Eb6:2 D6:2 C6:4 A5:4', 'Bb5:4 D6:4 F6:4 D6:4', 'Bb5:12 -:4'] }],
  parts: [
    { inst: 'bass', octave: 2, useBass: true, vel: 0.95, pattern: 'R.R.R.O.R.R.F.O.' },
    { inst: 'brass', octave: 4, vel: 0.5, pattern: 'C-----C-----C---' },
    { inst: 'pluck', octave: 4, vel: 0.4, pattern: '0.2.3.2.1.2.3.4.' },
    { inst: 'pad', octave: 3, vel: 0.8, pattern: 'C---------------' }
  ],
  drums: { kick: 'X.....x.X.......', hat: 'x.x.x.x.x.x.x.x.',
           snare: '....X.......X...'.repeat(3) + '....X...x.X.xxXX' }
};

/* ---------------- Pokémon Center (and Marts) ----------------
 * G major, unhurried and warm: an electric piano melody over offbeat plucks. */
G.MUSIC.center = {
  bpm: 104, swing: 0.15,
  chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am', 'D',
           'C', 'D', 'Bm', 'Em', 'Am', 'D', 'G', 'G'],
  melody: [{ inst: 'keys', vel: 1, bars: [
    'B4:4 D5:4 G5:6 F#5:2', 'E5:4 G5:2 E5:2 B4:8', 'C5:4 E5:2 G5:2 A5:4 G5:4', 'F#5:8 A5:4 D5:4',
    'B4:2 D5:2 G5:4 B5:4 A5:2 G5:2', 'G5:4 E5:4 B5:4 G5:4', 'A5:4 C6:2 A5:2 E5:4 C5:4', 'A5:4 F#5:4 D5:8',
    'E5:4 G5:4 C6:4 B5:2 A5:2', 'A5:4 F#5:4 D5:4 F#5:4', 'F#5:4 B5:4 D6:4 B5:2 A5:2', 'G5:8 E5:8',
    'C5:4 E5:4 A5:4 G5:2 F#5:2', 'F#5:4 A5:4 D6:4 C6:4', 'B5:6 A5:2 G5:4 D5:4', 'G5:12 -:4'] }],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R---....F---....' },
    { inst: 'pluck', octave: 4, vel: 0.55, pattern: '0..1..2.3..2..1.' },
    { inst: 'pad', octave: 3, vel: 0.9, pattern: 'C---------------' }
  ],
  drums: { kick: 'x.......x.......', shaker: '..o...o...o...o.' }
};

/* ---------------- Evolution (while it changes) ----------------
 * A held E in the bass under chords that slide up and down a step, rising
 * bells and a heartbeat kick: suspense that can loop as long as it takes. */
G.MUSIC.evolution = {
  bpm: 116,
  chords: ['Em', 'F/E', 'G/E', 'F/E', 'Em', 'F/E', 'Am/E', 'B/E'],
  melody: [{ inst: 'flute', vel: 0.9, bars: [
    'B4:8 E5:8', 'F5:8 A5:4 C6:4', 'B5:8 D6:4 B5:4', 'A5:12 F5:4',
    'G5:8 B5:8', 'C6:8 A5:8', 'E6:8 C6:4 A5:4', 'D#6:8 B5:8'] }],
  parts: [
    { inst: 'bass', octave: 2, useBass: true, vel: 0.85, pattern: 'R.R.R.R.R.R.R.R.' },
    { inst: 'bell', octave: 4, vel: 0.55, pattern: '0.1.2.3.4.3.2.1.' },
    { inst: 'pad', octave: 3, vel: 0.9, pattern: 'C---------------' }
  ],
  drums: { kick: 'X..x....X..x....', hat: '..o...o...o...o.' }
};

/* ---------------- Victory over a wild Pokémon ----------------
 * D major, bright and bouncing, while the EXP is handed out. */
G.MUSIC['victory-wild'] = {
  bpm: 138,
  chords: ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'A5:2 F#5:2 A5:2 D6:2 C#6:2 D6:2 A5:4', 'B5:4 F#5:2 D5:2 F#5:4 B5:4',
    'D6:2 B5:2 G5:2 B5:2 D6:4 E6:4', 'C#6:8 A5:4 E5:4',
    'F#5:2 A5:2 D6:2 F#6:2 E6:4 D6:4', 'D6:4 B5:2 F#5:2 B5:4 D6:4',
    'E6:2 D6:2 B5:2 G5:2 B5:4 D6:4', 'C#6:4 E6:4 A5:8'] }],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R..R..O.R..R..F.' },
    { inst: 'pluck', octave: 4, vel: 0.6, pattern: '0.1.2.1.0.1.2.1.' },
    { inst: 'pad', octave: 3, vel: 0.75, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'X.....x.X.....x.', snare: '....X.......X...', hat: 'x.x.x.x.x.x.x.x.' }
};

/* ---------------- Victory over a trainer ----------------
 * C major, prouder: a stepping-down bass line and brass stabs on every beat. */
G.MUSIC['victory-trainer'] = {
  bpm: 146,
  chords: ['C', 'G/B', 'Am', 'F', 'C/G', 'F', 'D/F#', 'G'],
  melody: [{ inst: 'lead', vel: 0.9, bars: [
    'G5:2 C6:2 E6:4 D6:2 C6:2 G5:4', 'D6:4 B5:2 G5:2 D6:4 G6:4',
    'E6:4 C6:2 A5:2 E6:4 A6:4', 'F6:6 E6:2 D6:4 C6:4',
    'E6:2 G6:2 E6:2 C6:2 G5:4 C6:4', 'A6:4 F6:2 C6:2 A5:4 F6:4',
    'F#6:4 D6:2 A5:2 F#5:4 A5:4', 'G5:4 B5:4 D6:4 F6:4'] }],
  parts: [
    { inst: 'bass', octave: 2, useBass: true, vel: 1, pattern: 'R.R.O.R.R.R.O.R.' },
    { inst: 'brass', octave: 4, vel: 0.4, pattern: 'C-..C-..C-..C-..' },
    { inst: 'pad', octave: 3, vel: 0.5, pattern: 'C---------------' }
  ],
  drums: { kick: 'X.x.X...X.x.X...', snare: '....X.......X.xx', hat: 'xoxoxoxoxoxoxoxo' }
};

/* ======================= Jingles (once: true) =======================
 * Short original tunes for G.Audio.jingle(name): the theme pauses, the jingle
 * plays one time through, then the theme comes back. All melody, no chords. */

/* Healing at a Pokémon Center (about 3.3 s): bells rise and fall over D and A, then settle on D. */
G.MUSIC.heal = {
  once: true, bpm: 144,
  melody: [
    { inst: 'bell', vel: 0.9, bars: ['A4:2 D5:2 F#5:2 A5:2 G5:2 E5:2 C#5:2 E5:2', 'F#5:2 A5:2 D6:4 -:8'] },
    { inst: 'flute', vel: 0.7, bars: ['F#5:8 E5:8', 'A5:6 G5:2 F#5:8'] },
    { inst: 'bass', vel: 0.7, bars: ['D3:8 A2:8', 'D3:16'] },
    { inst: 'pad', vel: 0.7, bars: ['D4+F#4+A4:8 C#4+E4+A4:8', 'D4+F#4+A4:16'] }
  ]
};

/* A Pokémon grew a level (about 1.4 s): a quick run up the scale and a leap to the top. */
G.MUSIC.levelup = {
  once: true, bpm: 168,
  melody: [
    { inst: 'lead', vel: 0.9, bars: ['C5:1 D5:1 E5:1 F5:1 G5:2 E5:1 G5:1 C6:8'] },
    { inst: 'brass', vel: 0.55, bars: ['-:8 E4+G4+C5:8'] },
    { inst: 'bass', vel: 0.8, bars: ['C3:4 G2:4 C3:8'] }
  ],
  drums: { kick: 'X.......X.......', crash: '........x.......' }
};

/* Got an item (about 1.9 s): short-short-long twice, then the held third. */
G.MUSIC.item = {
  once: true, bpm: 128,
  melody: [
    { inst: 'lead', vel: 0.9, bars: ['A5:1 A5:1 C#6:2 B5:1 B5:1 D6:2 C#6:8'] },
    { inst: 'brass', vel: 0.5, bars: ['A4+C#5+E5:4 G#4+B4+E5:4 A4+C#5+E5:8'] },
    { inst: 'bass', vel: 0.8, bars: ['A2:4 E2:4 A2:8'] },
    { inst: 'bell', vel: 0.4, bars: ['-:8 E6:2 A6:6'] }
  ],
  drums: { kick: 'X...X...X.......' }
};

/* Caught a Pokémon (about 3.6 s): a brass call in F in two voices, a snare roll into the last chord. */
G.MUSIC.caught = {
  once: true, bpm: 132,
  melody: [
    { inst: 'brass', vel: 1, bars: ['C5:2 F5:2 A5:2 C6:4 A5:2 Bb5:2 G5:2', 'A5:2 F5:2 G5:2 E5:2 F5:8'] },
    { inst: 'brass', vel: 0.6, bars: ['A4:2 C5:2 F5:2 A5:4 F5:2 G5:2 E5:2', 'F5:2 C5:2 Bb4:2 G4:2 A4:8'] },
    { inst: 'bass', vel: 0.9, bars: ['F2:4 F2:4 F2:4 C3:4', 'F2:4 C3:4 F2:8'] }
  ],
  drums: { kick: 'X.......X.......',
           snare: '....x.......x...' + 'x.x.x.xxX.......',
           crash: '................' + '........X.......' }
};

/* Won a badge (about 5.7 s): an E flat fanfare with timpani, ending high with a sparkle. */
G.MUSIC.badge = {
  once: true, bpm: 126,
  melody: [
    { inst: 'brass', vel: 1, bars: ['Bb4:2 Eb5:2 G5:2 Bb5:6 Ab5:2 G5:2', 'F5:2 Ab5:2 C6:4 Bb5:2 G5:2 F5:4', 'G5:2 Bb5:2 Eb6:12'] },
    { inst: 'brass', vel: 0.6, bars: ['G4:2 Bb4:2 Eb5:2 G5:6 F5:2 Eb5:2', 'C5:2 F5:2 Ab5:4 F5:2 D5:2 D5:4', 'Eb5:2 G5:2 G5:12'] },
    { inst: 'bass', vel: 0.9, bars: ['Eb2:12 Bb1:4', 'F2:8 Bb1:8', 'Eb2:16'] },
    { inst: 'pad', vel: 0.6, bars: ['Eb4+G4+Bb4:16', 'F4+Ab4+C5:8 D4+F4+Bb4:8', 'Eb4+G4+Bb4:16'] },
    { inst: 'bell', vel: 0.45, bars: ['-:16', '-:16', '-:4 Eb6:2 G6:2 Bb6:2 Eb7:6'] }
  ],
  drums: { tom: 'X.......X.......' + 'X.......X.x.xxxx' + 'X...............',
           crash: 'X...............' + '................' + 'X...............' }
};

/* The Poké Flute (about 3.5 s): an original wake-up tune, a lilting flute phrase in F that climbs to a bright end. */
G.MUSIC.flute = {
  once: true, bpm: 112,
  melody: [
    { inst: 'flute', vel: 1, bars: ['C5:3 F5:1 A5:4 G5:2 F5:2 D5:4', 'E5:2 G5:2 C6:4 A5:2 F5:2 F5:4'] },
    { inst: 'bell', vel: 0.4, bars: ['F4:4 A4:4 Bb4:4 A4:4', 'C5:4 E5:4 F5:8'] },
    { inst: 'pad', vel: 0.6, bars: ['F3+A3+C4:8 Bb3+D4+F4:8', 'C4+E4+G4:8 F3+A3+C4:8'] }
  ]
};

/* A Pokémon evolved (about 4 s): a warm flute phrase in G over bells, home on the tonic. */
G.MUSIC.evolved = {
  once: true, bpm: 120,
  melody: [
    { inst: 'flute', vel: 1, bars: ['D5:2 G5:2 B5:4 A5:2 G5:2 E5:4', 'C6:2 B5:2 A5:2 F#5:2 G5:8'] },
    { inst: 'bell', vel: 0.5, bars: ['G4:2 B4:2 D5:2 B4:2 C5:2 E5:2 G5:2 E5:2', 'D5:2 F#5:2 A5:2 C6:2 B5:8'] },
    { inst: 'bass', vel: 0.8, bars: ['G2:8 C3:8', 'D3:8 G2:8'] },
    { inst: 'pad', vel: 0.7, bars: ['G3+B3+D4:8 C4+E4+G4:8', 'D4+F#4+A4:8 G3+B3+D4:8'] }
  ],
  drums: { kick: 'x.......x.......', shaker: 'o.x.o.x.o.x.o.x.' }
};

