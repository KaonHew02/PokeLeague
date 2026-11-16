/* ============ poffin.js — G.Poffin: Poffins and a Pokémon's condition (chapter 85) ============
 * A Pokémon's condition is five values, 0-255 (mon.cond: cool, beauty, cute, smart, tough), plus its sheen (mon.sheen,
 * 0-255): what the Super Contest's Visual round looks at (supercontest.js). Missing fields count as 0.
 * Poffins are cooked from berries at the Poffin House in Hearthome City (js/content/sinnoh/contesthall.js). Platinum's
 * cooking is a stirring game with other players; here it is worked out from the berries alone (my own rule): the five
 * flavors of 1-4 berries (duplicates allowed, G.BERRY_FLAVORS) add up, the strongest flavor is the Poffin's level, and
 * its smoothness is the berries' average less one for each berry (so more berries make a stronger Poffin that leaves a
 * little more room). Eating one raises each condition by its flavor (spicy -> cool, dry -> beauty, sweet -> cute,
 * bitter -> smart, sour -> tough), x1.1 for the flavor the nature likes and x0.9 for the one it dislikes (G.NATURES
 * likes / hates), and the sheen by the smoothness. A Pokémon whose sheen is 255 eats no more. The Poffin Case holds 100
 * (save.poffins).
 *
 *   G.Poffin.cook([berry ids]) -> { flavors, level, smooth } | null · name(p) · feed(mon, p) -> { gained, sheen } | null
 *   read(mon) -> { cool, beauty, cute, smart, tough } · sheen(mon) · canEat(mon) · add(p) -> bool · list() · take(i)
 */
G.Poffin = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const FLAVORS = ['spicy', 'dry', 'sweet', 'bitter', 'sour'];
  const CONDS = ['cool', 'beauty', 'cute', 'smart', 'tough'];          // FLAVORS[i] raises CONDS[i]
  const MAX = 255, CASE = 100, MOST = 4;

  const read = mon => { const c = (mon && mon.cond) || {}; return Object.fromEntries(CONDS.map(k => [k, c[k] | 0])); };
  const sheen = mon => (mon && mon.sheen) | 0;
  const canEat = mon => sheen(mon) < MAX;

  /** A Poffin from 1-4 berries (null for none, more than four, or one that is not a berry with flavors). */
  function cook(berries) {
    const F = G.BERRY_FLAVORS || {};
    if (!Array.isArray(berries) || !berries.length || berries.length > MOST || berries.some(b => !F[b])) return null;
    const flavors = Object.fromEntries(FLAVORS.map(f => [f, berries.reduce((a, b) => a + (F[b][f] | 0), 0)]));
    const level = Math.max(...FLAVORS.map(f => flavors[f]));
    const smooth = Math.max(1, Math.floor(berries.reduce((a, b) => a + F[b].smooth, 0) / berries.length) - berries.length);
    return { flavors, level, smooth };
  }

  /** The flavor names, as the game says them. */
  const flavorName = f => ({ spicy: T('Spicy'), dry: T('Dry'), sweet: T('Sweet'), bitter: T('Bitter'), sour: T('Sour') })[f];
  /** "Spicy Poffin", "Spicy-Dry Poffin", or a Rich Poffin of three flavors or more (strongest first). */
  function name(p) {
    const fl = FLAVORS.filter(f => p.flavors[f] > 0).sort((a, b) => p.flavors[b] - p.flavors[a] || FLAVORS.indexOf(a) - FLAVORS.indexOf(b));
    if (fl.length >= 3) return T('Rich Poffin');
    if (fl.length === 2) return fmt('{a}-{b} Poffin', { a: flavorName(fl[0]), b: flavorName(fl[1]) });
    return fmt('{a} Poffin', { a: flavorName(fl[0] || 'spicy') });
  }

  /** Feeds a Poffin: -> { gained: { cool, ... }, sheen } (what rose, and the sheen now), or null if it eats no more. */
  function feed(mon, p) {
    if (!canEat(mon)) return null;
    const nat = (G.NATURES || {})[mon.nature] || {};
    const c = read(mon), gained = {};
    FLAVORS.forEach((f, i) => {
      const v = p.flavors[f] | 0;
      if (!v) return;
      const k = CONDS[i], up = Math.floor(v * (nat.likes === f ? 1.1 : nat.hates === f ? 0.9 : 1));
      const now = Math.min(MAX, c[k] + up);
      if (now > c[k]) gained[k] = now - c[k];
      c[k] = now;
    });
    mon.cond = c;
    mon.sheen = Math.min(MAX, sheen(mon) + (p.smooth | 0));
    return { gained, sheen: mon.sheen };
  }

  const list = () => { const S = G.Field.save; if (!Array.isArray(S.poffins)) S.poffins = []; return S.poffins; };
  /** Into the Poffin Case: false when it is full. */
  function add(p) { const l = list(); if (l.length >= CASE) return false; l.push(p); return true; }
  /** Out of the Poffin Case: -> the Poffin. */
  const take = i => list().splice(i, 1)[0] || null;

  return { FLAVORS, CONDS, MAX, CASE, MOST, read, sheen, canEat, cook, name, flavorName, feed, list, add, take };
})();
