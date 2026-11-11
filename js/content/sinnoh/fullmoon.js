/* ============ fullmoon.js — Fullmoon Island and Cresselia ============
 * Chapter 70. Once you have the National Pokédex, the sailor at Canalave Harbour (canalave.js) cannot get his son to
 * wake: the boy sleeps on, crying out in his dreams (flag nightmare-heard). The old folk say a Lunar Wing from
 * Fullmoon Island chases bad dreams away, and the sailor takes you there. North through the island's wood, in a
 * clearing by a pond, Cresselia looks at you and flies off (flag cresselia-met): it roams Sinnoh from then on (roam.js,
 * slot 'cresselia', level 50, as in Platinum) and the Lunar Wing glows where it stood. Held near the boy in his house in
 * Canalave, the feather wakes him (flag nightmare-done) and the chapter ends (`ending(70)`). No wild Pokémon live on the
 * island, as in Platinum. The island and the words are mine. Left out: Newmoon Island and Darkrai (Platinum's event
 * Member Card).
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const SAILOR = { name: 'Sailor' };

  G.Maps.def(Object.assign({
    id: 'fullmoon-island', loc: 'fullmoon-island', tileset: 'outdoor', palette: 'forest', music: 'forest', battleBg: 'forest', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~TTTTTTTTTTTTTTTTTT~~~',
      '~~~TTTTff.....~~~TTTT~~~',
      '~~~TTTTf......~~~TTTT~~~',
      '~~~TTTT..........TTTT~~~',
      '~~~TTTT..........TTTT~~~',
      '~~~TTTTf.......ffTTTT~~~',
      '~~~TTTTTTTT,TTTTTTTTT~~~',
      '~~~TTTT,,,,,TTTTTTTTT~~~',
      '~~~TTTT,TTTTTTTTTTTTT~~~',
      '~~~TTTT,TTTTTTTTTTTTT~~~',
      '~~~TTTT,TTSTTTTTTTTTT~~~',
      '~~~TTTT,,,,,TTTTTTTTT~~~',
      '~~~TTTTTTTT,TTTTTTTTT~~~',
      '~~~TTTTTTTT,TTTTTTTTT~~~',
      '~~~TTTTTTTT,TTTTTTTTT~~~',
      '~~~TTT::::::::::::TTT~~~',
      '~~~TTT::::::::::::TTT~~~',
      '~~~TTT::::::::::::TTT~~~',
      '~~~~~~~~~~~=~~~~~~~~~~~~',
      '~~~~~~~~~~~=~~~~~~~~~~~~'
    ],
    spots: { pier: [11, 18, 'up'] },
    signs: { '10,12': 'Fullmoon Island. They say a Pokémon that brings good dreams rests in the wood on nights of the full moon.' },
    triggers: [{ x: 9, y: 7, w: 5, h: 1, if: '!cresselia-met', script: 'fullmoon.cresselia' }],
    npcs: [
      { id: 'sailor', who: 'sailor', x: 13, y: 18, dir: 'left', script: 'fullmoon.sailor' },
      { id: 'cresselia', who: 'cresselia', mon: 'cresselia', x: 11, y: 4, dir: 'down', fixed: true, if: '!cresselia-met' }
    ]
  }, SINNOH));

  // ---------------- Cresselia ----------------
  async function cresselia(h) {
    const F = G.Field, vars = { mon: G.Names.mon(488) };
    if (F.flag('cresselia-met')) return;
    await h.say(T('In the pale light of the clearing, {mon} turns and looks at you. Its wings shimmer like thin clouds.'), { vars });
    h.sfx('cry');
    await h.say(T('{mon} gave a clear cry and rose into the sky!'), { vars });
    h.hide('cresselia');
    F.save.dex.seen[488] = 1;
    F.setFlag('cresselia-met');
    G.Roam.start(488, 50, G.RNG((F.save.player.id | 0) * 7919 + (F.save.playTime | 0) + 488), 'cresselia').seen = true;
    await h.say(T('It must be roaming somewhere in Sinnoh now. The Town Map will show where.'));
    await h.say(T('Something glows softly where {mon} was standing...'), { vars });
    F.giveItem('lunar-wing', 1);
    const j = h.jingle('item');
    await h.say(T('{player} found {item}!'), { vars: { item: G.Names.item('lunar-wing') } });
    await j;
  }

  G.Script.def({
    'fullmoon.cresselia': [['js', cresselia]],
    'fullmoon.sailor': [
      ['choice', 'Shall we head back to Canalave?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The boat sailed back to Canalave City...'],
        ['warp', 'canalave', 'harbor']
      ], [
        ['say', 'Take your time. I will wait here with the boat.', SAILOR]
      ], SAILOR]
    ]
  });
})();
