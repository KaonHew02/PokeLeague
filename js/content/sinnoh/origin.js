/* ============ origin.js — G.HallOfOrigin: the Azure Flute, the Hall of Origin and Arceus (chapter 100) ============
 * Platinum's event, from its decompilation (github.com/pret/pokeplatinum: res/field/maps/spear_pillar, hall_of_origin): with
 * the game beaten (`sinnoh-champion`), the National Pokédex and the Azure Flute, and Arceus not caught, the flute plays by
 * itself on the first step into the Spear Pillar (a trigger by its entrance, coronet.js) and stairs of light appear (the map's
 * `changes`: the stairs at its center while `origin-stairs` holds and Arceus is not caught). Up them, the Hall of Origin
 * (`hall-of-origin`): Arceus, level 80. Beaten, it vanishes and comes back the next time; lost, a black-out; caught, it is
 * gone, and so are the stairs (`arceus-caught`).
 * Platinum gave the Azure Flute only at events, and none was ever held, so how to get it is my own: the Celestic elder, who
 * keeps the old stories (celestic.js calls `elder(h, who)` after her own lines), gives it to the Champion who brings her all
 * sixteen plates (`platesOwned`: in the Bag, held by the team or by a Pokémon in the PC), once chapter 60 is done; with fewer
 * she says how many. Judgment takes the type of its user's plate (moves-special.js).
 * The first meeting with Arceus that ends in a catch or a win, once chapter 99 is done, ends the chapter: `ending(100)`.
 * The hall's layout and the words are my own.
 *   G.HallOfOrigin.PLATES · platesOwned() -> Set · elder(h, who) -> handled
 */
G.HallOfOrigin = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const PLATES = ['flame-plate', 'splash-plate', 'zap-plate', 'meadow-plate', 'icicle-plate', 'fist-plate', 'toxic-plate', 'earth-plate',
                  'sky-plate', 'mind-plate', 'insect-plate', 'stone-plate', 'spooky-plate', 'draco-plate', 'dread-plate', 'iron-plate'];
  const ARCEUS = 493, LEVEL = 80;

  /** The plates you have: in the Bag, held by your team, or held by a Pokémon in the PC. */
  function platesOwned() {
    const F = G.Field, S = F.save, have = new Set();
    for (const p of PLATES) if (F.count(p) > 0) have.add(p);
    const held = m => { if (m && PLATES.includes(m.item)) have.add(m.item); };
    for (const m of S.party || []) held(m);
    for (const box of S.boxes || []) for (const m of (Array.isArray(box) ? box : (box && box.mons) || [])) held(m);
    return have;
  }

  /** The Celestic elder, after her own lines: the plates, the flute. -> true when she said something here */
  async function elder(h, who) {
    const F = G.Field, flute = G.Names.item('azure-flute');
    if (!F.flag('sinnoh-champion') || !F.flag('chapter-60-done') || F.flag('arceus-caught')) return false;
    if (F.count('azure-flute')) {
      if (F.flag('arceus-met')) return false;
      await h.say(fmt('Play the {item} at the Spear Pillar. If the old songs are true, the way to the Original One will open.', { item: flute }), who);
      return true;
    }
    const n = platesOwned().size;
    if (n === 0) return false;
    if (n < PLATES.length) {
      await h.say(fmt('Those stone plates you carry... {n} of them. The old songs speak of sixteen, one for every power in the world.', { n }), who);
      return true;
    }
    await h.say(T('All sixteen plates... I never thought I would live to see them gathered in one place.'), who);
    await h.say(fmt('The oldest of our songs tell of the Original One, {mon}, who shaped the world and gave each power its plate.', { mon: G.Names.mon(ARCEUS) }), who);
    await h.say(fmt('My family has kept this {item} for longer than anyone remembers, waiting for one the plates would answer. I think that one is you.', { item: flute }), who);
    await G.Script.exec([['giveItem', 'azure-flute', 1]], h);
    await h.say(T('Take it to the Spear Pillar, where Cyrus once tried to remake the world. Play it there, and see what answers.'), who);
    return true;
  }

  /** The first step into the Spear Pillar with the flute: it plays, and stairs of light appear. */
  async function flute(h) {
    const F = G.Field;
    await h.say(fmt('{player} took out the {item}. Its clear note rang out between the pillars...', { item: G.Names.item('azure-flute') }));
    h.sfx('cry');
    await h.say(T('Steps of light formed above the center of the Spear Pillar, climbing up into the sky!'));
    F.setFlag('origin-stairs');
    await G.Script.exec([['warp', 'spear-pillar', 'from-below']], h);
  }

  async function arceus(h) {
    const F = G.Field, mon = G.Names.mon(ARCEUS);
    await h.say(fmt('{mon} looks down from the top of the hall. The whole place seems to breathe with it.', { mon }));
    h.sfx('cry');
    await h.wild(ARCEUS, LEVEL, {});
    const r = F.lastBattle;
    if (r === 'run' || r === 'lose') return;
    F.setFlag('arceus-met');
    h.hide('arceus');
    if (r === 'caught') F.setFlag('arceus-caught');
    else await h.say(fmt('{mon} vanished in a burst of light. It may appear before you again.', { mon }));
    // The end of the hundredth chapter (credits-ui.js), once the ninety-ninth is done.
    if (F.flag('chapter-99-done') && !F.flag('chapter-100-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(100); else F.setFlag('chapter-100-done');
    }
  }

  // ---------------- the Hall of Origin ----------------
  G.Maps.def({
    id: 'hall-of-origin', loc: 'sinnoh-hall-of-origin-1', tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', region: 'sinnoh', escape: true,
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWW',
      'W+++++++++++++W',
      'W+j+++++++++j+W',
      'W+++++++++++++W',
      'W+j+++++++++j+W',
      'W+++++++++++++W',
      'W+j+++++++++j+W',
      'W+++++++++++++W',
      'W+++++++++++++W',
      'WWWWWWW^WWWWWWW'
    ],
    warps: [{ x: 7, y: 10, to: 'spear-pillar', spot: 'origin' }],
    spots: { stairs: [7, 9, 'up'] },
    npcs: [{ id: 'arceus', who: 'arceus', mon: 'arceus', x: 7, y: 3, dir: 'down', fixed: true, if: '!arceus-caught', script: 'origin.arceus' }]
  });

  G.Script.def({ 'origin.flute': [['js', flute]], 'origin.arceus': [['js', arceus]] });
  return { PLATES, ARCEUS, LEVEL, platesOwned, elder };
})();
