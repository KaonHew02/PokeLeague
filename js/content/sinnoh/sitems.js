/* ============ sitems.js — the items chapter 94 put back where Platinum has them ============
 * Chapter 94 (the moves that move items, js/battle/moves-special.js; the items, js/battle/held.js). Thirteen plates, the Shed
 * Shell, the Mental Herb and the Destiny Knot lie in the maps of their own chapters (each map's `items`, with `then: 'sitems.found'`):
 * the places are Platinum's (guidestrats' list of the plates, Serebii's item pages), the tiles my own. The Icicle Plate, a
 * Hiker's gift in Platinum once HM08 Rock Climb is back with him, lies on Route 217 (this game has no Rock Climb).
 * The first of them picked up once chapter 93 is done ends the chapter: `ending(94)`.
 *
 *   G.SinnohItems.PLACES: [map, x, y, item, flag] for each
 */
(() => {
  const PLACES = [
    ['eterna', 33, 2, 'draco-plate', 'eterna-draco-plate'], ['oreburgh-gate', 2, 8, 'earth-plate', 'oreburgh-gate-earth-plate'],
    ['route215', 8, 9, 'fist-plate', 'route215-fist-plate'], ['stark-inside', 3, 24, 'flame-plate', 'stark-flame-plate'],
    ['route217', 25, 25, 'icicle-plate', 'route217-icicle-plate'], ['eterna-forest', 37, 7, 'insect-plate', 'eterna-forest-insect-plate'],
    ['iron-b2f', 30, 13, 'iron-plate', 'iron-b2f-iron-plate'], ['route210n', 18, 1, 'meadow-plate', 'route210-meadow-plate'],
    ['solaceon-ruins', 1, 8, 'mind-plate', 'solaceon-ruins-mind-plate'], ['sinnoh-league', 4, 15, 'sky-plate', 'sinnoh-league-sky-plate'],
    ['coronet-b1f', 7, 3, 'stone-plate', 'coronetb1f-stone-plate'], ['great-marsh-2', 8, 15, 'toxic-plate', 'great-marsh-toxic-plate'],
    ['sunyshore', 32, 23, 'zap-plate', 'sunyshore-zap-plate'], ['route228', 28, 12, 'shed-shell', 'route228-shed-shell'],
    ['route216', 41, 12, 'mental-herb', 'route216-mental-herb'], ['route224', 26, 24, 'destiny-knot', 'route224-destiny-knot']
  ];

  async function found(h) {
    const F = G.Field;
    // The end of the ninety-fourth chapter (credits-ui.js), once the ninety-third is done.
    if (F.flag('chapter-93-done') && !F.flag('chapter-94-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(94); else F.setFlag('chapter-94-done');
    }
  }

  G.Script.def({ 'sitems.found': [['js', found]] });
  G.SinnohItems = { PLACES };
})();
