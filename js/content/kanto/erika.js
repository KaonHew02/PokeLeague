/* ============ erika.js — Celadon City Gym: Erika ============
 * The end of chapter 4. The Gym is a greenhouse behind a small tree in Celadon City
 * (celadon.js): hedges, flower beds and five Trainers (Lass Kay, Beauty Bridget, Cool Trainer
 * Mary, Picnicker Tina, Beauty Lori), then Erika (Victreebel Lv. 27, Tangela Lv. 24,
 * Vileplume Lv. 27: two levels below the original games, because modern moves and stats hit
 * harder; tests/story.test.cjs prints the balance): the Rainbow Badge (badge 4) and TM19 Giga Drain.
 */
G.Maps.def({
  id: 'celadon-gym', loc: 'celadon-city', tileset: 'indoor', palette: 'garden', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWW',
    'kkkkkk+++kkkkkk',
    'k+++++++++++++k',
    'k+kkkkk+kkkkk+k',
    'k+++++k+k+++++k',
    'kkkk++k+k++kkkk',
    'k+++++k+k+++++k',
    'k+kkkkk+kkkkk+k',
    'k+++++++++++++k',
    'kkkkk+kkk+kkkkk',
    'k+++++++++++++k',
    'k+rrr+kkk+rrr+k',
    'k+rrr+++++rrr+k',
    'k+++++++++++++k',
    'k++++++X++++++k'
  ],
  warps: [{ x: 7, y: 15, to: 'celadon', spot: 'gym-door' }],
  spots: { door: [7, 15, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 12, y: 14, dir: 'left', script: 'erika.gym-guide' }],
  trainers: [
    { id: 'kay', who: 'lass', cls: 'lass', name: 'Kay', x: 9, y: 11, dir: 'left', sight: 3,
      team: [['bellsprout', 23], ['weepinbell', 23]],
      before: 'Shh! You are stepping on the flower beds! ...Just kidding. Let us battle!',
      defeat: 'My flowers are wilting...',
      after: 'Erika waters every plant in this Gym herself. Every single one!' },
    { id: 'bridget', who: 'beauty', cls: 'beauty', name: 'Bridget', x: 2, y: 9, dir: 'right', sight: 3,
      team: [['oddish', 21], ['bellsprout', 21], ['oddish', 21], ['bellsprout', 21]],
      before: 'A Gym full of flowers suits a beauty like me. Let me show you my garden!',
      defeat: 'Even a beauty can lose...',
      after: 'Grass-type Pokémon love sunlight. That is why this Gym has a glass roof.' },
    { id: 'mary', who: 'cooltrainer', cls: 'cooltrainer', name: 'Mary', x: 12, y: 9, dir: 'left', sight: 3,
      team: [['bulbasaur', 23], ['ivysaur', 23]],
      before: 'I train here to become as calm and strong as Erika. Do not expect an easy battle!',
      defeat: 'I still have a lot to learn.',
      after: 'Erika never raises her voice. Her Pokémon do all the talking.' },
    { id: 'tina', who: 'lass', cls: 'picnicker', name: 'Tina', x: 3, y: 5, dir: 'right', sight: 2,
      team: [['oddish', 24], ['gloom', 24]],
      before: 'Do you smell that? That is my Gloom. Sorry in advance!',
      defeat: 'Ugh, even I cannot stand the smell now...',
      after: 'Gloom evolves with a Leaf Stone. Erika has a very strong one!' },
    { id: 'lori', who: 'beauty', cls: 'beauty', name: 'Lori', x: 11, y: 5, dir: 'left', sight: 2,
      team: [['exeggcute', 24]],
      before: 'You made it this far? Then you must be good. Let us see how good!',
      defeat: 'Very good, it seems.',
      after: 'Erika is just ahead. Be careful: her Pokémon can put yours to sleep.' },
    { id: 'erika', who: 'erika', cls: 'leader', name: 'Erika', x: 7, y: 2, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['victreebel', 27, ['razor-leaf', 'acid', 'stun-spore', 'wrap']],
             ['tangela', 24, ['mega-drain', 'bind', 'poison-powder', 'ingrain']],
             ['vileplume', 27, ['mega-drain', 'acid', 'sleep-powder', 'stun-spore']]],
      before: 'Welcome. I am Erika, the Leader of this Gym. I spend my days caring for flowers with my Grass-type Pokémon. Shall we battle? I will not hold back.',
      defeat: 'Oh my... I have lost. You are very strong.',
      win: 'erika.win',
      afterScript: [
        ['say', 'Giga Drain drains your foe\'s energy and heals your Pokémon. A gentle move, in its own way.', { name: 'Erika' }],
        ['say', 'Please come back and visit my garden whenever you like.', { name: 'Erika' }]
      ] }
  ]
});

G.Script.def({
  'erika.gym-guide': [
    ['if', 'badge:4', [
      ['say', 'You beat Erika! Four badges. You are halfway to the Pokémon League!']
    ], [
      ['say', 'Hey, future Champion! Erika uses Grass-type Pokémon.'],
      ['say', 'Fire, Flying, Ice and Psychic moves work well against her Pokémon. And an Eevee that touches a Fire Stone becomes a Flareon!'],
      ['say', 'Watch out for Sleep Powder and Stun Spore. Bring Awakening and Paralyze Heal!']
    ]]
  ],
  'erika.win': [
    ['say', 'You have earned the Rainbow Badge. Please take it.', { name: 'Erika' }],
    ['badge', 4],
    ['jingle', 'badge'],
    ['say', '{player} received the Rainbow Badge from Erika!'],
    ['say', 'And this is TM19, Giga Drain. It takes energy from the foe to heal the user.', { name: 'Erika' }],
    ['giveItem', 'tm19', 1],
    // The end of the fourth chapter (credits-ui.js).
    ['js', () => (G.CreditsUI ? G.CreditsUI.ending(4) : G.Field.setFlag('chapter-4-done'))]
  ]
});
