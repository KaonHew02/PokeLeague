/* ============ legends.js — Sinnoh after the League: the lake Pokémon, Dialga and Palkia ============
 * Chapter 60. Once you are Sinnoh's Champion, Barry's mother sends you to Professor Rowan (twinleaf.js), who turns your Pokédex into
 * the National Pokédex (sandgem.js, flag national-dex: the list runs to the last number). The caves of the three lakes open:
 * Uxie in `acuity-cavern` and Azelf in `valor-cavern` (lakes.js) at level 50; Mesprit in `verity-cavern` gives a cry and flees,
 * then roams Sinnoh's routes at level 50 (G.Roam, region 'sinnoh', flag mesprit-met; caught, mesprit-caught), and the Town Map shows it.
 * The elder of Celestic Town (celestic.js, flag elder-orbs) tells of the two orbs; the Adamant Orb lies on Mt. Coronet 5F and
 * the Lustrous Orb on 6F, on the way up (the guides differ on where Platinum has them). At the Spear Pillar (coronet.js) each brings its Pokémon, at level 70.
 * Platinum gives one chance at each. Here one that is beaten or run from comes back when you come back, until it is caught.
 * When Dialga and Palkia have both been caught or beaten (flags dialga-met, palkia-met): `ending(60)`. The lakes need not come first.
 */
(() => {
  const T = s => G.T(s);
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, region: 'sinnoh' };
  const ROOM = [
    '################',
    '################',
    '################',
    '###..........###',
    '###..........###',
    '###..........###',
    '###..........###',
    '###..........###',
    '###..........###',
    '#######O########',
    '################',
    '################'
  ];

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'verity-cavern', loc: 'lake-verity', rows: ROOM,
    warps: [{ x: 7, y: 9, to: 'lake-verity', spot: 'cave' }],
    spots: { door: [7, 8, 'up'] },
    npcs: [{ id: 'mesprit', who: 'mesprit', mon: 'mesprit', x: 7, y: 4, dir: 'down', fixed: true, if: '!mesprit-met', script: 'slegends.mesprit' }]
  }));

  G.Maps.def(Object.assign({}, CAVE, {
    id: 'acuity-cavern', loc: 'lake-acuity', rows: ROOM,
    warps: [{ x: 7, y: 9, to: 'lake-acuity', spot: 'cave' }],
    spots: { door: [7, 8, 'up'] },
    npcs: [{ id: 'uxie', who: 'uxie', mon: 'uxie', x: 7, y: 4, dir: 'down', fixed: true, if: '!uxie-caught', script: 'slegends.uxie' }]
  }));

  /** Uxie or Azelf at level 50: caught, it is gone; beaten or run from, it is back when you come back. */
  async function spirit(h, id, sp, intro) {
    const F = G.Field;
    await h.say(intro);
    h.sfx('cry');
    await h.wild(sp, 50, {});
    const r = F.lastBattle;
    if (r === 'lose') return;
    if (r === 'caught') {
      if (id === 'uxie') F.setFlag('uxie-caught'); else F.setFlag('azelf-caught');
      h.hide(id);
      return;
    }
    h.hide(id);
    await h.say(T('{mon} faded away into the dark. It may come back when the cave is quiet.'), { vars: { mon: G.Names.mon(sp) } });
  }

  /** Mesprit: a cry, and it is off across Sinnoh. */
  async function mesprit(h) {
    const F = G.Field, vars = { mon: G.Names.mon(481) };
    await h.say(T('{mon} floats in the dim light and looks straight at you.'), { vars });
    h.sfx('cry');
    await h.say(T('{mon} gave a soft cry and vanished!'), { vars });
    h.hide('mesprit');
    F.save.dex.seen[481] = 1;
    F.setFlag('mesprit-met');
    G.Roam.start(481, 50, G.RNG((F.save.player.id | 0) * 7919 + (F.save.playTime | 0) + 481), 'sinnoh').seen = true;
    await h.say(T('It must be roaming somewhere in Sinnoh now. The Town Map will show where.'));
  }

  /** Dialga or Palkia at level 70: run or lose and it stays; caught, it is gone; beaten, it is back when you come back. */
  async function master(h, id, sp, intro, item) {
    const F = G.Field, mon = G.Names.mon(sp);
    await h.say(intro, { vars: { mon, item: G.Names.item(item) } });
    h.sfx('cry');
    await h.wild(sp, 70, {});
    const r = F.lastBattle;
    if (r === 'run' || r === 'lose') return;
    if (id === 'dialga2') F.setFlag('dialga-met'); else F.setFlag('palkia-met');
    h.hide(id);
    if (r === 'caught') {
      if (id === 'dialga2') F.setFlag('dialga-caught'); else F.setFlag('palkia-caught');
    } else await h.say(T('{mon} faded in among the pillars. It may answer you again.'), { vars: { mon } });
    if (F.flag('dialga-met') && F.flag('palkia-met') && !F.flag('chapter-60-done')) {
      await h.say(T('The air over the Spear Pillar grew still. Time and space are flowing as they should.'));
      // The end of the sixtieth chapter (credits-ui.js).
      if (G.CreditsUI) await G.CreditsUI.ending(60); else F.setFlag('chapter-60-done');
    }
  }

  G.Script.def({
    'slegends.cave-shut': [['say', 'A cave opens in the rock of the island. A strange pressure turns you back.']],
    'slegends.uxie': [['js', h => spirit(h, 'uxie', 480, G.I18n.fmt('{mon} sits with its eyes closed. As you come near, they begin to open.', { mon: G.Names.mon(480) }))]],
    'slegends.azelf': [['js', h => spirit(h, 'azelf', 482, G.I18n.fmt('{mon} hovers in the middle of the cave. It seems to have been waiting for you.', { mon: G.Names.mon(482) }))]],
    'slegends.mesprit': [['js', mesprit]],
    'slegends.dialga': [['js', h => master(h, 'dialga2', 483, T('The {item} grows warm in your bag, and {mon} looks down at you. Time itself seems to hold its breath.'), 'adamant-orb')]],
    'slegends.palkia': [['js', h => master(h, 'palkia2', 484, T('The {item} shines in your bag, and {mon} looks down at you. The air between the pillars begins to bend.'), 'lustrous-orb')]]
  });
})();
