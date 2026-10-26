/* ============ surge.js — Vermilion City Gym: Lt. Surge ============
 * The end of chapter 3. The Gym is behind a tree that only Cut clears (vermilion.js).
 * Inside, an electric barrier blocks the way to Lt. Surge. Two switches are hidden in the
 * fifteen trash cans: the first in a random can, the second in a can right next to it
 * (left, right, above or below). A wrong can after finding the first resets the puzzle.
 * Both found: the barrier opens for good (flag surge-locks-open).
 * Engineer Baily, Sailor Dwayne, Gentleman Tucker, then Lt. Surge (Voltorb Lv. 21,
 * Pikachu Lv. 18, Raichu Lv. 24): the Thunder Badge (badge 3) and TM34 Shock Wave.
 */
G.Maps.def({
  id: 'vermilion-gym', loc: 'vermilion-city', tileset: 'indoor', palette: 'gym', music: 'town', battleBg: 'indoor', enter: 'surge.enter',
  rows: [
    'WWWWWWWWWWWWW',
    'WWWWWWWWWWWWW',
    '+++++++++++++',
    '+++++++++++++',
    '+++++++++++++',
    '+++++++++++++',
    '======+======',
    '+++++++++++++',
    '++u+u+u+u+u++',
    '+++++++++++++',
    '++u+u+u+u+u++',
    '+++++++++++++',
    '++u+u+u+u+u++',
    '+++++++++++++',
    'p+++t+++t+++p',
    '++++++X++++++'
  ],
  warps: [{ x: 6, y: 15, to: 'vermilion', spot: 'gym-door' }],
  spots: { door: [6, 15, 'up'] },
  signs: {
    '2,8': { script: 'surge.can' }, '4,8': { script: 'surge.can' }, '6,8': { script: 'surge.can' }, '8,8': { script: 'surge.can' }, '10,8': { script: 'surge.can' },
    '2,10': { script: 'surge.can' }, '4,10': { script: 'surge.can' }, '6,10': { script: 'surge.can' }, '8,10': { script: 'surge.can' }, '10,10': { script: 'surge.can' },
    '2,12': { script: 'surge.can' }, '4,12': { script: 'surge.can' }, '6,12': { script: 'surge.can' }, '8,12': { script: 'surge.can' }, '10,12': { script: 'surge.can' },
    '4,14': 'Vermilion City Pokémon Gym. Leader: Lt. Surge. Winning Trainers: {rival}',
    '8,14': 'Vermilion City Pokémon Gym. Leader: Lt. Surge. Winning Trainers: {rival}'
  },
  npcs: [{ id: 'guide', who: 'guide', x: 9, y: 13, dir: 'left', script: 'surge.gym-guide' }],
  trainers: [
    { id: 'baily', who: 'engineer', cls: 'engineer', name: 'Baily', x: 1, y: 9, dir: 'right', sight: 4,
      team: [['voltorb', 21], ['magnemite', 21]],
      before: 'I built half the machines in this Gym. Let me show you what electricity can do!',
      defeat: 'Short circuit!',
      after: 'The switches are hidden in the trash cans. Do not tell anyone I told you!' },
    { id: 'dwayne', who: 'sailor', cls: 'sailor', name: 'Dwayne', x: 11, y: 11, dir: 'left', sight: 4,
      team: [['pikachu', 21], ['pikachu', 21]],
      before: 'I sailed the seas with Lt. Surge! Two Pikachu, double the sparks!',
      defeat: 'Zapped and sunk!',
      after: 'Lt. Surge is the toughest man I know. Good luck!' },
    { id: 'tucker', who: 'gentleman', cls: 'gentleman', name: 'Tucker', x: 2, y: 4, dir: 'right', sight: 3,
      team: [['pikachu', 23]],
      before: 'You opened the barrier? Impressive. But my Pikachu will not be so easy.',
      defeat: 'A gentleman knows when he is beaten.',
      after: 'Ground-type Pokémon shrug off Electric moves. Remember that against Lt. Surge.' },
    { id: 'surge', who: 'surge', cls: 'leader', name: 'Lt. Surge', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['voltorb', 21, ['tackle', 'screech', 'sonic-boom', 'self-destruct']],
             ['pikachu', 18, ['thunder-shock', 'growl', 'thunder-wave', 'quick-attack']],
             ['raichu', 24, ['shock-wave', 'thunder-wave', 'quick-attack', 'double-team']]],
      before: "Well, look who made it past my switches! I'm Lt. Surge. My Electric Pokémon hit fast and hit hard. Let's see if you can take the shock!",
      defeat: 'Whoa! You really are something, kid!',
      win: 'surge.win',
      afterScript: [
        ['say', "Shock Wave never misses. Keep that in mind, kid!", { name: 'Lt. Surge' }],
        ['say', "You've got real guts. I can't wait to see how far you go!", { name: 'Lt. Surge' }]
      ] }
  ],
  triggers: [{ x: 6, y: 6, w: 1, h: 1, if: '!surge-locks-open', script: 'surge.barrier' }]
});

(() => {
  const T = s => G.T(s);
  // The fifteen cans, in reading order.
  const CANS = [];
  for (const y of [8, 10, 12]) for (const x of [2, 4, 6, 8, 10]) CANS.push([x, y]);
  const at = (x, y) => CANS.findIndex(c => c[0] === x && c[1] === y);
  const next = i => CANS.map((c, j) => j).filter(j => {
    const [a, b] = CANS[j], [x, y] = CANS[i];
    return (Math.abs(a - x) === 2 && b === y) || (Math.abs(b - y) === 2 && a === x);
  });
  const rng = () => G.World.rng;
  function shuffle() {
    const F = G.Field;
    F.setVar('surge-first', rng().int(0, CANS.length - 1));
    F.setVar('surge-found', 0);
    F.setVar('surge-second', -1);
  }

  async function can(h) {
    const F = G.Field;
    if (F.flag('surge-locks-open')) { await h.say(T('Nothing here but trash.')); return; }
    if (F.getVar('surge-first') == null) shuffle();
    const i = at(h.ctx.x, h.ctx.y);
    if (!F.getVar('surge-found')) {
      if (i !== F.getVar('surge-first')) { await h.say(T('Nope! There is only trash in here.')); return; }
      const near = next(i);
      F.setVar('surge-second', near[rng().int(0, near.length - 1)]);
      F.setVar('surge-found', 1);
      h.sfx('confirm');
      await h.say(T('Hey! There is a switch under the trash! {player} pressed it.'));
      await h.say(T('The first electric lock opened!'));
      return;
    }
    if (i === F.getVar('surge-second')) {
      F.setFlag('surge-locks-open');
      h.sfx('confirm');
      await h.say(T('There is another switch! {player} pressed it.'));
      await h.say(T('The second electric lock opened! The barrier is down!'));
      return;
    }
    shuffle();
    h.sfx('error');
    await h.say(T('Only trash here... Huh? The first electric lock closed again!'));
  }

  G.Script.def({
    'surge.can': [['js', can]],
    'surge.enter': [['js', () => { if (!G.Field.flag('surge-locks-open')) shuffle(); }]],
    'surge.barrier': [
      ['say', 'An electric barrier blocks the way! Two switches must be pressed to open it.'],
      ['move', 'player', 'D']
    ],
    'surge.gym-guide': [
      ['if', 'badge:3', [
        ['say', 'You beat Lt. Surge! Three badges. You are a real Trainer now!']
      ], [
        ['say', 'Hey, future Champion! Lt. Surge locked himself behind an electric barrier.'],
        ['say', 'The switches are hidden in the trash cans. Once you find the first, the second is always in a can right next to it!'],
        ['say', 'His Pokémon are Electric types. Ground types like Geodude from Mt. Moon are not hurt by Electric moves at all!'],
        ['say', 'Grass types take Electric moves well too. An Oddish from Route 24 or a Paras from Mt. Moon would be a big help!']
      ]]
    ],
    'surge.win': [
      ['say', 'Here, take the Thunder Badge. You earned it, kid!', { name: 'Lt. Surge' }],
      ['badge', 3],
      ['jingle', 'badge'],
      ['say', '{player} received the Thunder Badge from Lt. Surge!'],
      ['say', 'And take this TM too. TM34 is Shock Wave: an electric attack that never misses.', { name: 'Lt. Surge' }],
      ['giveItem', 'tm34', 1],
      // The end of the third chapter (credits-ui.js).
      ['js', () => (G.CreditsUI ? G.CreditsUI.ending(3) : G.Field.setFlag('chapter-3-done'))]
    ]
  });
})();
