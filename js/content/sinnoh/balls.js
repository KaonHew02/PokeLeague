/* ============ balls.js — G.SpecialBalls: Generations 3 and 4's special balls (chapter 105) ============
 * The balls themselves: data (tools/fetch_data.py), G.ITEM_FX, G.Capture.ballMod (capture.js, Platinum's rates), the Heal Ball
 * in battle.js, the Luxury Ball in held.js. Where they are sold: Sinnoh's Poké Marts' specialties counters (`special` in
 * G.Maps.mart, Platinum's mart_items.h) and the League's shop; in Hoenn, Emerald's Rustboro (once Devon's goods are back),
 * Mossdeep and Verdanturf Marts. The Premier Ball comes free with ten Poké Balls bought at once (G.FieldItems.purchaseBonus).
 * The first Pokémon caught in one of them once chapter 104 is done ends the chapter: `ending(105)` (field.js runs the script
 * 'balls.caught' after a wild Pokémon is caught).
 *   G.SpecialBalls.NEW (the ten) · isNew(item)
 */
G.SpecialBalls = (() => {
  const NEW = ['net-ball', 'dive-ball', 'nest-ball', 'repeat-ball', 'timer-ball', 'luxury-ball', 'premier-ball', 'dusk-ball', 'heal-ball', 'quick-ball'];
  const isNew = item => NEW.includes(item);

  /** After a wild Pokémon is caught (h.ctx.mon): in one of the new balls, once chapter 104 is done, the end of the chapter. */
  async function caught(h) {
    const F = G.Field, mon = h.ctx && h.ctx.mon;
    if (!mon || !isNew(mon.ball)) return;
    if (F.flag('chapter-104-done') && !F.flag('chapter-105-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(105); else F.setFlag('chapter-105-done');
    }
  }

  G.Script.def({ 'balls.caught': [['js', caught]] });
  return { NEW, isNew };
})();
