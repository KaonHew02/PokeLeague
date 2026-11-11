/* ============ chateau.js — the Old Chateau ============
 * Chapter 69. In the north-east of Eterna Forest (eterna.js) a small tree (Cut) stands before the door of an old
 * mansion nobody lives in. 1F: the hall and the dining room, where a little girl stands at the far end of the table
 * the first time and is gone when you look again (flag chateau-girl). 2F: a corridor with a painting whose eyes
 * follow you, and five rooms. In the second one an old TV: at night (G.Clock) it switches itself on and Rotom
 * comes out (wild, level 20, as in Platinum, no National Pokédex needed). Caught, it is gone (flag rotom-caught);
 * beaten, it comes back. Gastly on every step (Platinum's tables); the Old Gateau, TM90, the Dread Plate and a Big
 * Pearl lie on the floors. The rooms and the words are mine. Left out: Rotom's forms (Platinum's event Secret Key),
 * Gengar from a Game Boy Advance game, the butler, the Dowsing Machine's Rare Candy and Honey.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const CHATEAU = { loc: 'old-chateau', tileset: 'indoor', palette: 'mansion', music: 'cave', battleBg: 'indoor', cave: true, escape: true };

  // ---------------- 1F: the hall and the dining room ----------------
  G.Maps.def(Object.assign({
    id: 'old-chateau', rows: [
      'WWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWW',
      'p^__bb__bb__pWpbbbbbbp',
      '_____________W________',
      '_____________W________',
      '____rrrrr____W_tttttt_',
      '____rrrrr____W_tttttt_',
      '____rrrrr______tttttt_',
      '____rrrrr____W________',
      '____rrrrr____W________',
      '_____________W________',
      'p_____X_____pWu______u'
    ],
    encounters: { walk: '@old-chateau-entrance' },
    warps: [{ x: 6, y: 11, to: 'eterna-forest', spot: 'chateau' }, { x: 1, y: 2, to: 'old-chateau-2f', spot: 'stairs' }],
    spots: { door: [6, 11, 'up'], stairs: [1, 3, 'down'] },
    items: [{ x: 20, y: 10, item: 'big-pearl', flag: 'chateau-pearl' }],
    triggers: [{ x: 14, y: 2, w: 1, h: 10, if: '!chateau-girl', script: 'chateau.girl' }],
    npcs: [{ id: 'girl', who: 'twin', x: 21, y: 6, dir: 'left', fixed: true, if: 'scripted' }]
  }, CHATEAU, SINNOH));

  // ---------------- 2F: the corridor and five rooms ----------------
  G.Maps.def(Object.assign({
    id: 'old-chateau-2f', rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'Wbb__W_P_pWbb__Wp__pWbb__W',
      'W____W____W____W_tt_W____W',
      'W__ttWrrrrW____W_tt_W____W',
      'W____WrrrrW____W____W____W',
      'W____W____Wu___W____Wu___W',
      'WWW_WWWW_WWWW_WqWW_WWWW_WW',
      '_________________________p',
      '^_________________________',
      '_________________________p',
      'WWWWWWWWWWWWWWWWWWWWWWWWWW'
    ],
    encounters: { walk: '@old-chateau-2f' },
    warps: [{ x: 0, y: 9, to: 'old-chateau', spot: 'stairs' }],
    spots: { stairs: [1, 9, 'right'] },
    signs: {
      '15,7': 'A painting of a Pokémon and its Trainer. Wherever you stand, its eyes seem to be looking right at you...',
      '7,2': { script: 'chateau.tv' }
    },
    items: [{ x: 1, y: 5, item: 'old-gateau', flag: 'chateau-gateau' }, { x: 14, y: 3, item: 'dread-plate', flag: 'chateau-plate' },
            { x: 24, y: 2, item: 'tm90', flag: 'chateau-tm90' }]
  }, CHATEAU, SINNOH));

  // ---------------- The little girl in the dining room ----------------
  async function girl(h) {
    const F = G.Field;
    if (F.flag('chateau-girl')) return;
    F.setFlag('chateau-girl');
    h.show('girl');
    await h.say(T('A little girl is standing at the far end of the table, looking at you without a word...'));
    await h.fade('out', 0.3);
    h.hide('girl');
    await h.fade('in', 0.3);
    await h.say(T('You blink, and she is gone. There is no other door in the room.'));
  }

  // ---------------- The old TV and Rotom ----------------
  async function tv(h) {
    const F = G.Field, vars = { mon: G.Names.mon(479) };
    if (F.flag('rotom-caught')) { await h.say(T('An old TV. Its screen stays dark.')); return; }
    if (G.Clock.period() !== 'night') {
      await h.say(T('An old TV. It is not even plugged in. People say it switches itself on at night, though.'));
      return;
    }
    await h.say(T('The unplugged TV flickers on by itself! Something is moving inside the screen...'));
    h.sfx('cry');
    await h.wild(479, 20, {});
    const r = F.lastBattle;
    if (r === 'caught') F.setFlag('rotom-caught');
    else if (r === 'win') await h.say(T('{mon} slipped back into the wires, and the screen went dark.'), { vars });
  }

  G.Script.def({ 'chateau.girl': [['js', girl]], 'chateau.tv': [['js', tv]] });
})();
