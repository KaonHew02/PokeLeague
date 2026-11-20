/* ============ incense.js — the incenses, where Platinum has them ============
 * Chapter 97. Generation 4's nine incenses (their held effects in js/data/item-effects.js, on the kinds held.js already had:
 * the Sea and Wave Incense power Water moves, the Rock, Odd and Rose Incense Rock, Psychic and Grass moves (x1.2); the Lax
 * Incense makes moves against its holder a tenth less accurate, the Full Incense moves its holder last, the Luck Incense doubles
 * the prize money, the Pure Incense keeps wild Pokémon away as the Cleanse Tag does). Held by either parent at the Day Care, an
 * incense makes the Egg its baby (daycare.js). Each lies in an item ball where Platinum has it (the decompilation,
 * github.com/pret/pokeplatinum: res/field/scripts/visible_items.s; the tiles my own): the Sea Incense on Route 204, the Luck
 * Incense in the Ravaged Path, the Rose Incense on Route 212, the Odd Incense in the Solaceon Ruins, the Pure Incense on Route
 * 221, the Full Incense in Veilstone City, the Wave Incense on Route 210, the Rock Incense inside Fuego Ironworks, the Lax
 * Incense on Route 225 (each map's `items`, with `then: 'incense.found'`). Platinum's shops sell none.
 * The first of them picked up once chapter 96 is done ends the chapter: `ending(97)`.
 *
 *   G.SinnohIncense.PLACES: [map, x, y, item, flag] for each
 */
(() => {
  const PLACES = [
    ['route204s', 18, 17, 'sea-incense', 'route204-sea-incense'], ['ravaged-path', 21, 10, 'luck-incense', 'ravaged-path-luck-incense'],
    ['route212n', 33, 20, 'rose-incense', 'route212-rose-incense'], ['solaceon-ruins', 11, 8, 'odd-incense', 'solaceon-ruins-odd-incense'],
    ['route221', 26, 10, 'pure-incense', 'route221-pure-incense'], ['veilstone', 33, 16, 'full-incense', 'veilstone-full-incense'],
    ['route210n', 44, 15, 'wave-incense', 'route210-wave-incense'], ['fuego-inside', 18, 12, 'rock-incense', 'fuego-rock-incense'],
    ['route225', 4, 23, 'lax-incense', 'route225-lax-incense']
  ];

  async function found() {
    const F = G.Field;
    // The end of the ninety-seventh chapter (credits-ui.js), once the ninety-sixth is done.
    if (F.flag('chapter-96-done') && !F.flag('chapter-97-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(97); else F.setFlag('chapter-97-done');
    }
  }

  G.Script.def({ 'incense.found': [['js', found]] });
  G.SinnohIncense = { PLACES };
})();
