/* ============ ssanne.js — the S.S. Anne ============
 * Docked at Vermilion Harbor; Bill's ticket lets you aboard (vermilion.js). Two decks with
 * Trainers; the rival waits outside the captain's cabin; the seasick captain gives HM01 Cut
 * once you rub his back (flag got-hm01). Back at the harbour with Cut, the ship sails away
 * (flag ss-anne-left). The texts are our own; the events follow the games.
 */
G.Maps.def({
  id: 'ssanne-1f', loc: 'ss-anne', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWW',
    '_____b_____b___^_',
    '_________________',
    '_________________',
    '_rr_____rr_____rr',
    '_________________',
    '________X________'
  ],
  warps: [{ x: 8, y: 7, to: 'vermilion-harbor', spot: 'gangway' }, { x: 15, y: 2, to: 'ssanne-2f', spot: 'stairs' }],
  spots: { gangway: [8, 7, 'up'], stairs: [15, 3, 'down'] },
  signs: {
    '5,2': 'A shelf of travel books. One of them is about faraway regions full of Pokémon.',
    '11,2': 'A shelf of travel books. One of them is about faraway regions full of Pokémon.'
  },
  npcs: [{ id: 'waiter', who: 'clerk', x: 14, y: 6, dir: 'left', say: 'Welcome aboard! The captain is resting in his cabin on the upper deck.' }],
  trainers: [
    { id: 'trevor', who: 'sailor', cls: 'sailor', name: 'Trevor', x: 4, y: 3, dir: 'down', sight: 2,
      team: [['machop', 17], ['tentacool', 17]],
      before: 'Ahoy! A battle at sea is the best kind of battle!',
      defeat: 'Sunk like an anchor!',
      after: 'Sailors and Pokémon battles go together like waves and wind.' },
    { id: 'ann', who: 'lass', cls: 'lass', name: 'Ann', x: 2, y: 6, dir: 'right', sight: 3,
      team: [['pidgey', 18], ['nidoran-f', 18]],
      before: 'I came on this cruise to meet strong Trainers. Are you one?',
      defeat: 'You are! You really are!',
      after: 'The party on the upper deck is lovely. You should go!' },
    { id: 'arthur', who: 'gentleman', cls: 'gentleman', name: 'Arthur', x: 12, y: 6, dir: 'up', sight: 2,
      team: [['growlithe', 18], ['ponyta', 18]],
      before: 'A young Trainer on a luxury cruise? Show me your manners in battle!',
      defeat: 'Well played, young one.',
      after: 'My Pokémon and I travel the world together on ships like this one.' }
  ]
});

G.Maps.def({
  id: 'ssanne-2f', loc: 'ss-anne', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWW',
    '^_______WW___t_b_',
    '________WW_______',
    '________WW_______',
    '_________________',
    '________WW_______',
    '________WW__rr___',
    '________WW_______',
    '________WW_______'
  ],
  warps: [{ x: 0, y: 2, to: 'ssanne-1f', spot: 'stairs' }],
  spots: { stairs: [0, 3, 'down'] },
  signs: {
    '13,2': "The captain's desk. Charts of the sea are spread all over it.",
    '15,2': "The captain's books: How to Keep Your Sea Legs, and How to Get Them Back."
  },
  npcs: [
    { id: 'captain', who: 'captain', x: 13, y: 3, dir: 'down', script: 'ssanne.captain' },
    { id: 'rival', who: 'rival', x: 11, y: 8, dir: 'left', if: 'scripted' }
  ],
  trainers: [
    { id: 'leonard', who: 'sailor', cls: 'sailor', name: 'Leonard', x: 3, y: 7, dir: 'right', sight: 3,
      team: [['shellder', 21]],
      before: 'Hey! This deck is for the crew! ...Oh, a passenger. Battle anyway!',
      defeat: "You're tougher than a storm at sea!",
      after: 'The captain gets seasick. On a ship! Can you believe it?' },
    { id: 'tyler', who: 'youngster', cls: 'youngster', name: 'Tyler', x: 5, y: 3, dir: 'down', sight: 2,
      team: [['nidoran-m', 21]],
      before: 'My dad bought me a ticket for this cruise. Battle me!',
      defeat: 'Dad is going to hear about this...',
      after: "The captain's cabin is through the door on the right." }
  ],
  // The only way into the captain's cabin is the doorway on row 5.
  triggers: [{ x: 7, y: 5, w: 1, h: 1, if: '!ssanne-rival', script: 'ssanne.rival' }]
});

(() => {
  const T = s => G.T(s);
  const RIVAL = { name: '{rival}' };
  const EVOLVED = { 1: 2, 4: 5, 7: 8 };

  /** The rival leaving the captain's cabin. */
  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('ssanne-rival');
    await h.say(T('Hey, {player}! What are you doing on the S.S. Anne?'), RIVAL);
    h.place('rival', 10, 5, 'left');
    h.show('rival');
    await h.walkTo('rival', me.x + 1, me.y);
    h.face('player', 'right');
    await h.say(T("I've been training on board. Let me show you how much stronger I've got!"), RIVAL);
    const out = await h.battle({ id: 'rival-ssanne', who: 'rival', name: S.rival.name, prize: 35, ai: 'basic',
      team: [['pidgeotto', 19], ['raticate', 16], ['kadabra', 18], [EVOLVED[S.rival.starter] || 8, 20]] }, {});
    if (out === 'lose') return;
    await h.say(T("Tch! I let my guard down. Anyway, I met the captain. He's got a great move to teach, if you can help him."), RIVAL);
    await h.say(T("See you around, slowpoke!"), RIVAL);
    h.hide('rival');
  }

  /** The seasick captain: rub his back and he gives you HM01 Cut. */
  async function captain(h) {
    const F = G.Field;
    if (F.flag('got-hm01')) { await h.say(T('Ah, the sea breeze! I feel like a new man. Thank you again!'), { name: 'Captain' }); return; }
    await h.say(T("Ugh... I'm so seasick... I can barely stand..."), { name: 'Captain' });
    if (await h.choice(T("Rub the captain's back?"), {}) !== 0) { await h.say(T('Ugh...'), { name: 'Captain' }); return; }
    await h.say(T("{player} rubbed the captain's back. Rub, rub... rub, rub..."));
    await h.say(T('Oh! Oh my! I feel much better! Thank you, young Trainer!'), { name: 'Captain' });
    await h.say(T('Please, take this. It is HM01, Cut: it teaches a Pokémon to cut down small trees in your way.'), { name: 'Captain' });
    F.giveItem('hm01', 1);
    F.setFlag('got-hm01');
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('hm01') } });
    await j;
    await h.say(T('Teach it from your Bag. To use it outside of battle, you need the Cascade Badge.'), { name: 'Captain' });
  }

  G.Script.def({
    'ssanne.rival': [['js', rival]],
    'ssanne.captain': [['js', captain]]
  });
})();
