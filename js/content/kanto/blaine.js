/* ============ blaine.js — Cinnabar Island Gym: Blaine ============
 * Chapter 7, part 5, the end of the chapter. Six rooms in two rows, joined by gates (indoor tile
 * `y`, map `bars`); a quiz machine (`z`) stands before each gate. A right answer opens the gate
 * (flag blaine-q<n>); a wrong one, and the Trainer in that room battles you first (once beaten,
 * he lets you through). The door from town opens with the Secret Key (cinnabar.js). Blaine
 * (Growlithe 40, Ponyta 38, Rapidash 40, Arcanine 43: the games' 40-47, lowered as for the other
 * Leaders; tests/story.test.cjs prints the balance) gives the Volcano Badge (badge 7) and TM38
 * Fire Blast.
 */
G.Maps.def({
  id: 'cinnabar-gym', loc: 'cinnabar-island', tileset: 'indoor', palette: 'volcano', music: 'gym', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWW',
    'W++++z+W+++z++W++++++W',
    'W++++++y++++++y++++++W',
    'W++++++W++++++W++++++W',
    'W++++++W++++++W++++++W',
    'WWWyWWWWWWWWWWWWWWWWWW',
    'W++++z+W++z+++W+z++++W',
    'W++++++y++++++y++++++W',
    'W++++++W++++++W++++++W',
    'W++++++W++++++W++++++W',
    'WWWWWWWWWWWWWWWWWWXWWW'
  ],
  warps: [{ x: 18, y: 11, to: 'cinnabar', spot: 'gym-door' }],
  spots: { door: [18, 11, 'up'] },
  bars: [
    { x: 14, y: 8, if: 'blaine-q1' },
    { x: 7, y: 8, if: 'blaine-q2' },
    { x: 3, y: 6, if: 'blaine-q3' },
    { x: 7, y: 3, if: 'blaine-q4' },
    { x: 14, y: 3, if: 'blaine-q5' }
  ],
  signs: {
    '16,7': { script: 'blaine.q1' },
    '10,7': { script: 'blaine.q2' },
    '5,7': { script: 'blaine.q3' },
    '5,2': { script: 'blaine.q4' },
    '11,2': { script: 'blaine.q5' }
  },
  npcs: [{ id: 'guide', who: 'guide', x: 16, y: 10, dir: 'right', script: 'blaine.gym-guide' }],
  trainers: [
    { id: 'erik', who: 'supernerd', cls: 'super-nerd', name: 'Erik', x: 19, y: 9, dir: 'left', sight: 0,
      team: [['vulpix', 36], ['ponyta', 36], ['vulpix', 36]],
      before: 'Wrong answers get burned! Let me show you how!',
      defeat: 'I got scorched instead...',
      after: 'Every machine asks something different. Think before you answer!' },
    { id: 'ramon', who: 'burglar', cls: 'burglar', name: 'Ramon', x: 9, y: 10, dir: 'up', sight: 0,
      team: [['growlithe', 37], ['ponyta', 37]],
      before: 'I used to steal, but Blaine set me straight. Now I just steal wins!',
      defeat: 'You stole this one from me.',
      after: 'Blaine says a Trainer needs a sharp mind as well as strong Pokémon.' },
    { id: 'avery', who: 'supernerd', cls: 'super-nerd', name: 'Avery', x: 2, y: 9, dir: 'right', sight: 0,
      team: [['magmar', 38]],
      before: 'My Magmar breathes fire hot enough to melt rock!',
      defeat: 'Cooled right down...',
      after: 'Magmar lives near volcanoes. There is one right under this island!' },
    { id: 'dusty', who: 'burglar', cls: 'burglar', name: 'Dusty', x: 2, y: 4, dir: 'right', sight: 0,
      team: [['growlithe', 37], ['vulpix', 37], ['ninetales', 38]],
      before: 'Halfway there? Not if I can help it!',
      defeat: 'I lost my spark.',
      after: 'Water, Ground and Rock moves put out fire best.' },
    { id: 'zac', who: 'supernerd', cls: 'super-nerd', name: 'Zac', x: 12, y: 5, dir: 'left', sight: 0,
      team: [['ponyta', 38], ['rapidash', 39]],
      before: 'Last question, last Trainer! After me, only Blaine is left!',
      defeat: 'My flame went out...',
      after: 'Blaine is waiting in the next room. He is hotter than any of us.' },
    { id: 'blaine', who: 'blaine', cls: 'leader', name: 'Blaine', x: 18, y: 3, dir: 'left', sight: 0, leader: true, ai: 'leader',
      team: [['growlithe', 40, ['flamethrower', 'bite', 'take-down', 'roar']],
             ['ponyta', 38, ['fire-spin', 'stomp', 'take-down', 'agility']],
             ['rapidash', 40, ['fire-spin', 'stomp', 'bounce', 'take-down']],
             ['arcanine', 43, ['fire-blast', 'take-down', 'bite', 'roar']]],
      before: 'Hah! You found my key! I am Blaine, the fiery master of quizzes and flames! My Pokémon burn hotter than the volcano beneath us. Can you stand the heat?',
      defeat: 'I have burned out! You are the real thing.',
      win: 'blaine.win',
      afterScript: [
        ['say', 'Fire Blast is mighty, but it does not always hit. A true fire master accepts that!', { name: 'Blaine' }],
        ['say', 'One badge left. The last Gym is in Viridian City, where your journey began. Its Leader is a mystery even to me.', { name: 'Blaine' }]
      ] }
  ]
});

/**
 * A quiz machine: answer (0 = True, 1 = False) opens the gate; a wrong answer brings out the
 * Trainer of that room for a battle first (unless he was beaten already).
 */
function blaineQuiz(n, ask, answer, trainer) {
  return [
    ['if', 'blaine-q' + n, [['say', 'The quiz machine flashes: "Correct! The gate is open."']], [
      ['say', 'A Pokémon quiz! Answer right and the gate opens. Answer wrong and a Trainer will battle you!'],
      ['js', async h => {
        const q = ask();
        const i = await h.choice(q.text, { vars: q.vars, options: [G.T('True'), G.T('False')] });
        if (i === answer) {
          h.sfx('confirm');
          await h.say(G.T('Correct! The gate slides open.'));
          G.Field.setFlag('blaine-q' + n);
          return;
        }
        h.sfx('error');
        await h.say(G.T('Wrong! A Trainer steps up to battle you.'));
        if (!G.Field.isDone('cinnabar-gym:' + trainer)) {
          await h.emote(trainer, '!');
          h.face(trainer, 'player');
          if (await h.battle('cinnabar-gym:' + trainer) === 'lose') return;
        }
        await h.say(G.T('The gate slides open.'));
        G.Field.setFlag('blaine-q' + n);
      }]
    ]]
  ];
}

G.Script.def({
  'blaine.q1': blaineQuiz(1, () => ({ text: G.T('{a} moves are super effective against {b}-type Pokémon. True or false?'),
    vars: { a: G.Names.type('fire'), b: G.Names.type('grass') } }), 0, 'erik'),
  'blaine.q2': blaineQuiz(2, () => ({ text: G.T('A Fire Stone can make {mon} evolve. True or false?'),
    vars: { mon: G.Names.mon(37) } }), 0, 'ramon'),
  'blaine.q3': blaineQuiz(3, () => ({ text: G.T('{a} moves are not very effective against {b}-type Pokémon. True or false?'),
    vars: { a: G.Names.type('water'), b: G.Names.type('fire') } }), 1, 'avery'),
  'blaine.q4': blaineQuiz(4, () => ({ text: G.T('{mon} is number 001 in the Pokédex. True or false?'),
    vars: { mon: G.Names.mon(4) } }), 1, 'dusty'),
  'blaine.q5': blaineQuiz(5, () => ({ text: G.T('A frozen Pokémon can still use its moves. True or false?'), vars: {} }), 1, 'zac'),
  'blaine.gym-guide': [
    ['if', 'badge:7', [
      ['say', 'You beat Blaine! Seven badges! Only one more to go!']
    ], [
      ['say', 'Hey, future Champion! Blaine loves quizzes. Each machine asks a question before its gate.'],
      ['say', 'Get one wrong and the Trainer in that room will battle you. Get it right and you can walk straight through!'],
      ['say', 'Blaine\'s Pokémon are all Fire types. Water, Ground and Rock moves will put out his flames!']
    ]]
  ],
  'blaine.win': [
    ['say', 'You have earned the Volcano Badge. Wear it with pride!', { name: 'Blaine' }],
    ['badge', 7],
    ['jingle', 'badge'],
    ['say', '{player} received the Volcano Badge from Blaine!'],
    ['say', 'And take this: TM38, Fire Blast. The hottest move I know. It may even leave a burn!', { name: 'Blaine' }],
    ['giveItem', 'tm38', 1],
    // The end of the seventh chapter (credits-ui.js).
    ['js', () => (G.CreditsUI ? G.CreditsUI.ending(7) : G.Field.setFlag('chapter-7-done'))]
  ]
});
