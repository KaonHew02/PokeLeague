/* ============ giovanni.js — the Viridian Gym and Giovanni ============
 * Chapter 8, the end of the chapter. The Viridian Gym opens once you hold seven badges: its
 * Leader is back, and he is Giovanni, the Boss of Team Rocket. The floor is full of spin tiles
 * (an arrow sends you sliding until a stop tile or a wall), in three rooms joined by arrows
 * through gaps in the walls; a second arrow beside each one takes you back down. Eight Trainers
 * (Tamers, Black Belts, Cool Trainers), then Giovanni (Rhyhorn 45, Dugtrio 42, Nidoqueen 44,
 * Nidoking 45, Rhydon 50, as in the games): prize ₽5000, badge 8 (the Earth Badge), TM26
 * Earthquake. Beaten, he says he will break up Team Rocket and leaves (flag giovanni-left).
 * The layout was checked with a simulator of the spin rules: Giovanni can be reached, no slide
 * loops forever, and the door can be reached again from everywhere.
 */
G.Maps.def({
  id: 'viridian-gym', loc: 'viridian-city', tileset: 'indoor', palette: 'earth', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWW',
    'W+++++++j+j++++++++W',
    'W++++++++++++++++++W',
    'W++oLLLLLLLLLLLL+++W',
    'WWWUWWWWWWWWWWWWDWWW',
    'W++++++++++++++++++W',
    'W++++++++++++++++++W',
    'WDDDDDDDDUDDDDDDDDDW',
    'W+++++++++++++++o++W',
    'W++++++++++++++++++W',
    'WWWDWWWWWWWWWWWWUWWW',
    'W++++++++++++++++++W',
    'W++oLLLLLLLLLLLLLL+W',
    'W++++++++++++++++++W',
    'W++++++++++++++++++W',
    'W++++++++++++++++++W',
    'WWWWWWWWWWXWWWWWWWWW'
  ],
  warps: [{ x: 10, y: 17, to: 'viridian', spot: 'gym-door' }],
  spots: { door: [10, 17, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 12, y: 16, dir: 'left', script: 'giovanni.gym-guide' }],
  trainers: [
    { id: 'jasper', who: 'tamer', cls: 'tamer', name: 'Jasper', x: 2, y: 15, dir: 'right', sight: 4,
      team: [['arbok', 41], ['tauros', 41]],
      before: 'Our Leader is back at last! You will not get anywhere near him!',
      defeat: 'Tamed by a kid...',
      after: 'The arrows on the floor carry you along. Watch where they point before you step on them.' },
    { id: 'kenta', who: 'blackbelt', cls: 'black-belt', name: 'Kenta', x: 17, y: 15, dir: 'left', sight: 4,
      team: [['machop', 40], ['machoke', 41], ['machoke', 41]],
      before: 'Hoo-hah! My fists are ready! Are yours?',
      defeat: 'My fists were not ready enough...',
      after: 'The arrow at the top of this room takes you to the next one.' },
    { id: 'dalton', who: 'cooltrainer', cls: 'cooltrainer', name: 'Dalton', x: 15, y: 12, dir: 'right', sight: 1,
      team: [['sandslash', 42], ['dugtrio', 42]],
      before: 'I guard the way up. Beat me first!',
      defeat: 'Go on, then. The way is yours.',
      after: 'Ground-type Pokémon shrug off Electric moves. Remember that in there.' },
    { id: 'hiro', who: 'blackbelt', cls: 'black-belt', name: 'Hiro', x: 6, y: 10, dir: 'right', sight: 3,
      team: [['machop', 42], ['machoke', 43]],
      before: 'Training in the Leader\'s Gym makes us stronger every day! Watch this!',
      defeat: 'More training! I need more training!',
      after: 'Only one arrow in that row points up. Find it!' },
    { id: 'colby', who: 'tamer', cls: 'tamer', name: 'Colby', x: 12, y: 9, dir: 'left', sight: 2,
      team: [['persian', 42], ['dewgong', 42]],
      before: 'My Pokémon do exactly what I tell them. Do yours?',
      defeat: 'They listened... and still lost.',
      after: 'The Leader rarely shows his face. Something about other business.' },
    { id: 'reid', who: 'cooltrainer', cls: 'cooltrainer', name: 'Reid', x: 14, y: 7, dir: 'left', sight: 4,
      team: [['rhyhorn', 42], ['nidorino', 43]],
      before: 'You came up the arrow? Impressive. Now try me!',
      defeat: 'You are the real deal.',
      after: 'Our Leader\'s Pokémon shake the ground itself. Fly or float, or get hit hard.' },
    { id: 'goro', who: 'blackbelt', cls: 'black-belt', name: 'Goro', x: 6, y: 6, dir: 'left', sight: 2,
      team: [['primeape', 43], ['machoke', 43]],
      before: 'The last room is just past me. You will not see it!',
      defeat: 'I see... you will see it after all.',
      after: 'Step on the arrow in the corner. It takes you to the Leader.' },
    { id: 'marco', who: 'cooltrainer', cls: 'cooltrainer', name: 'Marco', x: 5, y: 3, dir: 'right', sight: 3,
      team: [['nidoking', 43], ['sandslash', 43]],
      before: 'This is as far as you go. The Leader does not battle just anyone!',
      defeat: 'Maybe you are not just anyone.',
      after: 'Go ahead. He is waiting for you. He has been waiting for a long time, I think.' },
    { id: 'giovanni', who: 'giovanni', cls: 'leader', name: 'Giovanni', x: 9, y: 2, dir: 'down', sight: 0, leader: true, ai: 'leader',
      if: '!giovanni-left',
      team: [['rhyhorn', 45, ['take-down', 'stomp', 'fury-attack', 'scary-face']],
             ['dugtrio', 42, ['dig', 'slash', 'sand-tomb', 'mud-slap']],
             ['nidoqueen', 44, ['body-slam', 'double-kick', 'poison-sting', 'tail-whip']],
             ['nidoking', 45, ['thrash', 'double-kick', 'poison-sting', 'horn-attack']],
             ['rhydon', 50, ['earthquake', 'rock-tomb', 'take-down', 'stomp']]],
      before: 'So. You have come this far. I am Giovanni, the Leader of this Gym... and the Boss of Team Rocket. Twice you ruined my plans. There will not be a third time. Show me your strength!',
      defeat: 'Ha! That was a truly intense fight. You have won. I see I have lost more than a battle.',
      win: 'giovanni.win' }
  ]
});

G.Script.def({
  'giovanni.gym-guide': [
    ['if', 'giovanni-left', [
      ['say', 'The Leader is gone... They say Team Rocket is finished. I still cannot believe who he was!']
    ], [
      ['say', 'Hey, champ in the making! This is the last Gym. Its Leader uses Ground-type Pokémon.'],
      ['say', 'Water and Grass moves hit them hard, and so does Ice. Electric moves do nothing at all. And Earthquake hits everyone on the ground!'],
      ['say', 'The arrows on the floor carry you along. Step on the ones that point where you want to go!']
    ]]
  ],
  'giovanni.win': [
    ['say', 'As proof of your victory, here is the Earth Badge.', { name: 'Giovanni' }],
    ['badge', 8],
    ['jingle', 'badge'],
    ['say', '{player} received the Earth Badge from Giovanni!'],
    ['say', 'And this: TM26, Earthquake. A Ground-type move that shakes everything around it. Use it well.', { name: 'Giovanni' }],
    ['giveItem', 'tm26', 1],
    ['setFlag', 'giovanni-gym'],
    ['say', 'With eight badges, the Pokémon League is open to you. Go west from here, past Route 22, to Victory Road.', { name: 'Giovanni' }],
    ['say', 'As for me... Having lost to you again, I cannot face my men. Team Rocket ends today.', { name: 'Giovanni' }],
    ['say', 'I will go away and train alone, until the day I can face you again. Farewell, child.', { name: 'Giovanni' }],
    ['fade', 'out'],
    ['setFlag', 'giovanni-left'],
    ['hide', 'giovanni'],
    ['fade', 'in'],
    // The end of the eighth chapter (credits-ui.js).
    ['js', () => (G.CreditsUI ? G.CreditsUI.ending(8) : G.Field.setFlag('chapter-8-done'))]
  ]
});
