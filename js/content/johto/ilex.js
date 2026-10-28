/* ============ ilex.js — Ilex Forest ============
 * Chapter 13. West of Azalea Town, a dark forest of tall trees (wild Pokémon in the grass and in
 * the trees: Headbutt). The charcoal maker's apprentice has lost his Farfetch'd: it hops away
 * each time you come close (var farfetchd 0-3, four places), and the fourth time it runs back
 * to him (var farfetchd 4). The charcoal maker comes looking for him and gives TM35 Flamethrower
 * (flag charcoal-gift; then they go home to the kiln in Azalea). A man by the shrine teaches
 * Headbutt (any Pokémon of the species that can learn it from the tutor, species field `tu`).
 * A small tree blocks the way north to Route 34: Cut clears it.
 */
G.Maps.def({
  id: 'ilex-forest', loc: 'ilex-forest', region: 'johto', tileset: 'outdoor', palette: 'forest', music: 'forest', battleBg: 'forest', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTT,,TTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTT,,TTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTcTTTTTTTTTTT',
    'TT...................TTTTTTTTT',
    'TT......."""""".....hTTTTTTTTT',
    'TT.......""""""......TTTTTTTTT',
    'TT.......""""""......TTTTTTTTT',
    'TT...................TTTTTTTTT',
    'TT.....TTTTTTTT.TTTTTT.....TTT',
    'TT....hTTTTTTTT.TTTTTT.....TTT',
    'TT.....TTT...........T.....TTT',
    'TT.....TTT.....S.....T....hTTT',
    'TT"""""TTT....f.f..........TTT',
    'TT"""""TTT....f.f..........TTT',
    'TT"""""TTT...........T"""""TTT',
    'TT"""""TTTh..........T"""""TTT',
    'TT"""""TTT...........T"""""TTT',
    'TT"""""TTTTTTTTTTTTTTT"""""TTT',
    'TT.....TTTTTTTTTTTTTTT"""""TTT',
    'TT......~~~~TTTTTTTTTT.....TTT',
    'TT......~~~~TTTTTTTTTT.....TTT',
    'TT......~~~~TTTTTT...........T',
    'TT......~~~~TTTTTT...........T',
    'TT...........TTTTT.........S.T',
    'TT...........TTTTT........,,,,',
    'TT...........TTTTT........,,,,',
    'TT......""""""...............T',
    'TT......""""""...............T',
    'TT................h..........T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'azalea', offset: 13 }, north: { map: 'route34', offset: 8 } },
  signs: {
    '27,23': 'Ilex Forest. The trees grow so close together that it is dim here even at noon.',
    '15,11': { script: 'ilex.shrine' }
  },
  npcs: [
    { id: 'apprentice', who: 'youngster', x: 22, y: 24, dir: 'right', if: 'farfetchd<4', script: 'ilex.apprentice' },
    { id: 'apprentice2', who: 'youngster', x: 22, y: 24, dir: 'right', if: ['farfetchd>=4', '!charcoal-gift'],
      say: 'Farfetch\'d, you are back! I am never letting go of you again. Thank you so much!' },
    { id: 'maker', who: 'gentleman', x: 23, y: 23, dir: 'down', if: ['farfetchd>=4', '!charcoal-gift'], script: 'ilex.maker' },
    // The lost Farfetch'd, one place after the other.
    { id: 'farfetchd0', who: 'farfetchd', mon: 'farfetchd', x: 15, y: 27, dir: 'left', fixed: true, if: 'farfetchd=0', script: 'ilex.farfetchd' },
    { id: 'farfetchd1', who: 'farfetchd', mon: 'farfetchd', x: 3, y: 5, dir: 'down', fixed: true, if: 'farfetchd=1', script: 'ilex.farfetchd' },
    { id: 'farfetchd2', who: 'farfetchd', mon: 'farfetchd', x: 24, y: 9, dir: 'down', fixed: true, if: 'farfetchd=2', script: 'ilex.farfetchd' },
    { id: 'farfetchd3', who: 'farfetchd', mon: 'farfetchd', x: 12, y: 14, dir: 'right', fixed: true, if: 'farfetchd=3', script: 'ilex.farfetchd-last' },
    { id: 'farfetchd4', who: 'farfetchd', mon: 'farfetchd', x: 22, y: 25, dir: 'up', fixed: true, if: ['farfetchd>=4', '!charcoal-gift'],
      say: 'Farfetch\'d is hugging its leek. It looks tired from all that running.' },
    { id: 'tutor', who: 'hiker', x: 17, y: 14, dir: 'left', script: 'ilex.tutor' },
    { id: 'girl', who: 'lass', x: 4, y: 24, move: 'look',
      say: 'Some Pokémon sleep up in the trees. Give a tree a good knock, and one might fall right on your head!' }
  ],
  trainers: [
    { id: 'wayne', who: 'bugcatcher', cls: 'bug-catcher', name: 'Wayne', x: 6, y: 22, dir: 'left', sight: 4,
      team: [['ledyba', 8], ['paras', 10]],
      before: 'This forest is the best place in Johto for bugs. Let me show you mine!',
      defeat: 'My bugs crawled away...',
      after: 'Paras like the damp ground by the pond. You can find them there at night.' }
  ],
  items: [
    { x: 2, y: 28, item: 'revive', flag: 'ilex-revive' },
    { x: 10, y: 10, item: 'ether', flag: 'ilex-ether' },
    { x: 26, y: 8, item: 'x-attack', flag: 'ilex-x-attack' },
    { x: 12, y: 24, item: 'super-potion', flag: 'ilex-hidden-potion', hidden: true }
  ],
  // The games' table, more often: the forest has little grass.
  encounters: { walk: Object.assign({}, G.ENCOUNTERS['ilex-forest-area'].walk, { rate: 20 }), water: '@ilex-forest-area', headbutt: '@ilex-forest-area' }
});

(() => {
  const T = s => G.T(s);
  const APPRENTICE = { name: 'Apprentice' }, MAKER = { name: 'Charcoal Maker' };

  /** The move tutor: Headbutt for any Pokémon of a species that can learn it. */
  async function tutor(h) {
    const F = G.Field;
    await h.say(T('I teach Headbutt. Knock it into a tree, and sleeping Pokémon come tumbling down!'));
    if (await h.choice(T('Shall I teach Headbutt to one of your Pokémon?'), {}) !== 0) { await h.say(T('Come back any time.')); return; }
    const can = m => !!(G.SPECIES[m.sp].tu || []).includes('headbutt');
    const pick = h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
    const i = await pick({ title: T('Teach which Pokémon?'), note: m => (G.Mon.knows(m, 'headbutt') ? T('Learned') : can(m) ? T('Able') : T('Unable')),
                           disabled: m => !can(m) || G.Mon.knows(m, 'headbutt') });
    const mon = i == null ? null : F.party()[i];
    if (!mon) { await h.say(T('Come back any time.')); return; }
    if (!can(mon) || G.Mon.knows(mon, 'headbutt')) { await h.say(T('That Pokémon cannot learn it. Sorry!')); return; }
    // With four moves already, the player picks one to forget (learn-ui.js).
    if (G.LearnUI) { if (!(await G.LearnUI.teach(mon, 'headbutt', t => h.say(t)))) return; }
    else {
      G.Mon.learn(mon, 'headbutt', mon.moves.length < 4 ? null : 0);
      await h.say(T('{mon} learned {move}!'), { vars: { mon: G.Mon.name(mon), move: G.Names.move('headbutt') } });
    }
    await h.say(T('Now try it on a tree. Look for the ones with lighter leaves.'));
  }

  G.Script.def({
    'ilex.apprentice': [
      ['say', 'Oh no, oh no... I was cutting wood with our Farfetch\'d, and it ran off into the forest!', APPRENTICE],
      ['say', 'My master will be so angry. If you see a Farfetch\'d, could you chase it back this way?', APPRENTICE]
    ],
    'ilex.farfetchd': [
      ['emote', 'self', '!'],
      ['say', 'Kwaa! Farfetch\'d hopped away into the trees!'],
      ['hide', 'self'],
      ['addVar', 'farfetchd', 1]
    ],
    'ilex.farfetchd-last': [
      ['emote', 'self', '!'],
      ['say', 'Kwaa! Farfetch\'d ran off... back toward the forest entrance!'],
      ['hide', 'self'],
      ['setVar', 'farfetchd', 4]
    ],
    'ilex.maker': [
      ['say', 'So this is where my apprentice ran off to... and our Farfetch\'d is back, too. You found it for him?', MAKER],
      ['say', 'Thank you, young Trainer. Please, take this. It is the heat of my kiln, packed into a disc.', MAKER],
      ['giveItem', 'tm35', 1],
      ['say', 'That is TM35, Flamethrower. Fire moves are tough on bugs and grass, and a strong fire never goes out!', MAKER],
      ['say', 'Come on, you two. Back to the kiln!', MAKER],
      ['setFlag', 'charcoal-gift']
    ],
    'ilex.shrine': [
      ['say', 'A small wooden shrine. It honours the guardian of the forest, said to travel through time.'],
      ['say', 'Someone has left fresh berries in front of it.']
    ],
    'ilex.tutor': [['js', tutor]]
  });
})();
