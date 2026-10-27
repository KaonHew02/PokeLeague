/* ============ tower.js — the Pokémon Tower, 3F to 7F ============
 * Chapter 5, part 2. With the Silph Scope (hideout.js) the stairs on 2F open (lavender.js).
 * Channelers possessed by the restless spirits battle on every floor; wild Gastly, Haunter and
 * Cubone haunt it (the games' tables). 5F has a purified zone that heals your Pokémon. On 6F
 * the spirit of a Marowak blocks the stairs: a battle you cannot catch it in (rules.noCatch);
 * calmed, it goes to rest (flag marowak-calm). On 7F three Team Rocket Grunts hold Mr. Fuji;
 * he takes you home and gives you the Poké Flute (flags fuji-saved, got-poke-flute), which
 * wakes the Snorlax on Route 12.
 */
const TOWER = { loc: 'pokemon-tower', tileset: 'indoor', palette: 'tower', music: 'cave', battleBg: 'indoor' };

G.Maps.def(Object.assign({
  id: 'tower-3f',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    '+^+g+g+g++^+',
    '++++++++++++',
    '+g+g+g++++g+',
    '++++++++++++',
    '+g++++g+g+g+',
    '++++++++++++',
    '+++g+g+g++++',
    '++++++++++++'
  ],
  warps: [{ x: 1, y: 2, to: 'tower-2f', spot: 'from-above' }, { x: 10, y: 2, to: 'tower-4f', spot: 'from-below' }],
  spots: { 'from-below': [1, 3, 'down'], 'from-above': [10, 3, 'down'] },
  signs: { '3,4': 'A gravestone: "To Pidgey, who loved to fly. Fly high, little one."' },
  trainers: [
    { id: 'hope', who: 'channeler', cls: 'channeler', name: 'Hope', x: 8, y: 3, dir: 'left', sight: 4,
      team: [['gastly', 24]],
      before: 'Go... away... This is... our place...',
      defeat: 'Huh? What was I saying? My head feels so light...',
      after: 'A spirit spoke through me. I felt so cold...' },
    { id: 'patricia', who: 'channeler', cls: 'channeler', name: 'Patricia', x: 2, y: 5, dir: 'right', sight: 3,
      team: [['gastly', 23], ['gastly', 23]],
      before: 'Leave... the living... do not belong here...',
      defeat: 'Oh! Where am I? Why is everyone staring?',
      after: 'The spirits are angry about something. Or someone.' },
    { id: 'carly', who: 'channeler', cls: 'channeler', name: 'Carly', x: 9, y: 7, dir: 'left', sight: 3,
      team: [['haunter', 25]],
      before: 'Ke... ke... ke... Stay... forever...',
      defeat: 'Brrr. I came to pray and ended up battling. How strange.',
      after: 'Ghost-type Pokémon do not mind Normal or Fighting moves at all. Be careful.' }
  ],
  items: [{ x: 11, y: 9, item: 'escape-rope', flag: 'rope' }],
  encounters: { walk: '@pokemon-tower-3f' }
}, TOWER));

G.Maps.def(Object.assign({
  id: 'tower-4f',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    '+^+g+g+g++^+',
    '++++++++++++',
    '+g+g++g+g+g+',
    '++++++++++++',
    '++g+g+g+g+++',
    '++++++++++++',
    '+g+g++++g+g+',
    '++++++++++++'
  ],
  warps: [{ x: 10, y: 2, to: 'tower-3f', spot: 'from-above' }, { x: 1, y: 2, to: 'tower-5f', spot: 'from-below' }],
  spots: { 'from-below': [10, 3, 'down'], 'from-above': [1, 3, 'down'] },
  signs: { '6,4': 'A gravestone: "Rest well, Rapidash. You were the fastest of us all."' },
  trainers: [
    { id: 'paula', who: 'channeler', cls: 'channeler', name: 'Paula', x: 3, y: 3, dir: 'right', sight: 4,
      team: [['gastly', 24], ['gastly', 24]],
      before: 'Who... disturbs... our rest...?',
      defeat: 'Ah! I was only here to light a candle!',
      after: 'Something on the floors above keeps the spirits from sleeping.' },
    { id: 'laurel', who: 'channeler', cls: 'channeler', name: 'Laurel', x: 8, y: 5, dir: 'left', sight: 4,
      team: [['gastly', 22], ['gastly', 22], ['gastly', 22]],
      before: 'Join us... Stay... with us...',
      defeat: 'No thank you, I would rather go home.',
      after: 'I heard men in black went upstairs. They did not look like mourners.' },
    { id: 'jody', who: 'channeler', cls: 'channeler', name: 'Jody', x: 2, y: 9, dir: 'right', sight: 4,
      team: [['haunter', 26]],
      before: 'Grr... Give... it... back...',
      defeat: 'Give what back? I do not remember a thing.',
      after: 'I feel a sadness here, like a mother looking for her child.' }
  ],
  items: [
    { x: 11, y: 9, item: 'elixir', flag: 'elixir' },
    { x: 0, y: 7, item: 'awakening', flag: 'awakening' },
    { x: 5, y: 9, item: 'great-ball', flag: 'hidden-ball', hidden: true }
  ],
  encounters: { walk: '@pokemon-tower-4f' }
}, TOWER));

G.Maps.def(Object.assign({
  id: 'tower-5f',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    '+^+g+g+g++^+',
    '++++++++++++',
    '+g+g++++g+g+',
    '+++++rrr++++',
    '+g+++rrr+++g',
    '+++++rrr++++',
    '+g+g++++g+g+',
    '++++++++++++'
  ],
  warps: [{ x: 1, y: 2, to: 'tower-4f', spot: 'from-above' }, { x: 10, y: 2, to: 'tower-6f', spot: 'from-below' }],
  spots: { 'from-below': [1, 3, 'down'], 'from-above': [10, 3, 'down'] },
  // The purified zone: a holy rug in the middle of the floor that heals your Pokémon.
  triggers: [{ x: 6, y: 6, script: 'tower.purified' }],
  trainers: [
    { id: 'tammy', who: 'channeler', cls: 'channeler', name: 'Tammy', x: 8, y: 3, dir: 'left', sight: 3,
      team: [['haunter', 25]],
      before: 'So... cold... Warm me... with a battle...',
      defeat: 'Oh, that did warm me up. Thank you?',
      after: 'The rug in the middle is a purified zone. Stand on its centre to rest your Pokémon.' },
    { id: 'ruth', who: 'channeler', cls: 'channeler', name: 'Ruth', x: 1, y: 7, dir: 'right', sight: 3,
      team: [['gastly', 24], ['gastly', 24]],
      before: 'You... cannot... see us... can you...?',
      defeat: 'You can! You have the scope from Silph Co.!',
      after: 'Without that scope, the spirits look like shadows with no face.' },
    { id: 'karina', who: 'channeler', cls: 'channeler', name: 'Karina', x: 10, y: 9, dir: 'left', sight: 4,
      team: [['gastly', 26]],
      before: 'Turn... back... Nothing up there... but sorrow...',
      defeat: 'Sorrow? I was thinking about lunch.',
      after: 'The top floor is where Mr. Fuji went. He has not come down in days.' }
  ],
  items: [{ x: 11, y: 7, item: 'nugget', flag: 'nugget' }],
  encounters: { walk: '@pokemon-tower-5f' }
}, TOWER));

G.Maps.def(Object.assign({
  id: 'tower-6f',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    'g^g+g+g+g+^+',
    'g+g+++++++++',
    '++g+g+g+g+g+',
    '++++++++++++',
    '+g+g++g+g+g+',
    '++++++++++++',
    '+++g+g+g+g++',
    '++++++++++++'
  ],
  warps: [{ x: 10, y: 2, to: 'tower-5f', spot: 'from-above' }, { x: 1, y: 2, to: 'tower-7f', spot: 'from-below' }],
  spots: { 'from-below': [10, 3, 'down'], 'from-above': [1, 3, 'down'] },
  npcs: [{ id: 'ghost', who: 'marowak', mon: 'marowak', x: 1, y: 3, dir: 'down', if: '!marowak-calm', script: 'tower.marowak' }],
  // The spirit of a Marowak stands before the stairs up: stepping close starts the battle.
  triggers: [{ x: 1, y: 4, if: '!marowak-calm', script: 'tower.marowak' }],
  trainers: [
    { id: 'janae', who: 'channeler', cls: 'channeler', name: 'Janae', x: 6, y: 5, dir: 'left', sight: 4,
      team: [['gastly', 25], ['gastly', 25]],
      before: 'Mother... Where... is my child...?',
      defeat: 'What? I do not have children. Who was that?',
      after: 'A Marowak lost its life near this tower, defending its baby. Its spirit is still here.' },
    { id: 'angelica', who: 'channeler', cls: 'channeler', name: 'Angelica', x: 9, y: 7, dir: 'left', sight: 4,
      team: [['haunter', 26]],
      before: 'Leave... before... it... sees you...',
      defeat: 'I think I fainted for a moment. Is it gone?',
      after: 'The stairs to the top floor are guarded by something no ordinary eye can see.' }
  ],
  items: [
    { x: 11, y: 9, item: 'rare-candy', flag: 'rare-candy' },
    { x: 0, y: 5, item: 'x-accuracy', flag: 'x-accuracy' }
  ],
  encounters: { walk: '@pokemon-tower-6f' }
}, TOWER));

G.Maps.def(Object.assign({
  id: 'tower-7f',
  rows: [
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    'ggg++++++ggg',
    'ggg++++++ggg',
    'gggggg+ggggg',
    '++++++++++++',
    '+ggg++++ggg+',
    '++++++++++++',
    '+g+g+gg+g+g+',
    '+^++++++++++'
  ],
  warps: [{ x: 1, y: 9, to: 'tower-6f', spot: 'from-above' }],
  spots: { 'from-below': [2, 9, 'right'] },
  npcs: [{ id: 'fuji', who: 'fuji', x: 6, y: 2, dir: 'down', if: '!fuji-saved', script: 'tower.fuji' }],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 2, y: 7, dir: 'right', sight: 4,
      team: [['zubat', 25], ['rattata', 25], ['raticate', 27]],
      before: 'What? A kid? This old man is our business. Get lost!',
      defeat: 'The old man was not worth this...',
      after: 'We only wanted him to give us some Pokémon. He refused!' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 10, y: 5, dir: 'left', sight: 4,
      team: [['koffing', 26], ['drowzee', 27]],
      before: 'Team Rocket does not leave until the old man listens to us!',
      defeat: 'Fine, fine. We are leaving soon anyway.',
      after: 'This tower gives me the creeps. Let us get out of here.' },
    { id: 'grunt3', who: 'rocket', cls: 'team-rocket', x: 4, y: 3, dir: 'right', sight: 3,
      team: [['zubat', 27], ['golbat', 28]],
      before: 'Stop right there! Nobody gets near the old man!',
      defeat: 'Argh! Everybody out! Back to the hideout!',
      after: 'The hideout? It is... Hey! What did you do to our hideout?!' }
  ],
  encounters: { walk: '@pokemon-tower-7f' }
}, TOWER));

(() => {
  const FUJI = { name: 'Mr. Fuji' };

  G.Script.def({
    'tower.purified': [
      ['say', 'You stepped into a purified, protected zone.'],
      ['heal'],
      ['jingle', 'heal'],
      ['say', 'Your Pokémon were fully healed!']
    ],
    'tower.marowak': [
      ['say', 'A ghostly shape blocks the stairs. "Go... away..."'],
      ['say', 'The Silph Scope revealed the ghost: it is the spirit of a Marowak!'],
      ['wild', 'marowak', 30, { noCatch: true }],
      ['if', 'battle=win', [
        ['setFlag', 'marowak-calm'],
        ['hide', 'ghost'],
        ['say', 'The spirit of the Marowak calmed down...'],
        ['say', 'It was the mother of the Cubone in Lavender Town. At peace at last, it faded away.']
      ]],
      ['if', 'battle=run', [
        ['say', 'The spirit still blocks the stairs.'],
        ['move', 'player', 'D']
      ]]
    ],
    // Mr. Fuji on the top floor: home, and the Poké Flute.
    'tower.fuji': [
      ['say', 'Oh... You came all the way up here? You made those men leave. Thank you, child.', FUJI],
      ['say', 'Those men from Team Rocket hurt the mother of a little Cubone while trying to take her. Her spirit could not rest...', FUJI],
      ['say', 'Thanks to you, she is at peace now. Come with me to my house. I would like to thank you properly.', FUJI],
      ['fade', 'out'],
      ['setFlag', 'fuji-saved'],
      ['warp', 'lavender-house', 'fuji'],
      ['say', 'This is the Pokémon House. I care for Pokémon that have lost their Trainers.', FUJI],
      ['say', 'Please take this. It is the Poké Flute. Its gentle melody wakes any Pokémon, even the deepest sleeper.', FUJI],
      ['setFlag', 'got-poke-flute'],
      ['giveItem', 'poke-flute', 1],
      ['say', 'They say a huge Pokémon has fallen asleep on the road south of town. The flute may help you there.', FUJI]
    ]
  });
})();
