/* ============ pokeblock.js — G.Pokeblock: Hoenn's Pokéblocks (chapter 86) ============
 * Generation 3's way to raise a Pokémon's condition (mon.cond and mon.sheen, as Poffins do: poffin.js). Pokéblocks are
 * made in a Berry Blender at Hoenn's Contest Halls (js/content/hoenn/contesthalls.js). The rule is Ruby, Sapphire and
 * Emerald's, as 52poke gives it:
 *   1. the berries' five flavors add up (G.BERRY_FLAVORS);
 *   2. each flavor less the next one round the circle: spicy - dry, dry - sweet, sweet - bitter, bitter - sour,
 *      sour - spicy;
 *   3. each less the number of flavors below 0, times (the blender's top speed / 333 + 1), rounded; below 0 is 0;
 *   4. the level is the strongest flavor; the feel is INT(the berries' smoothness / berries - berries).
 * A Black Pokéblock (three random flavors at 2) comes from two berries of one kind, no flavor at all, or more than three
 * flavors below 0. Its color: Black; Gold at level 51 or more; White with four flavors or more, Gray with three; two by
 * the stronger (Purple spicy, Indigo dry, Brown sweet, Light Blue bitter, Olive sour); one: Red, Blue, Pink, Green,
 * Yellow.
 * In the games each player puts in one berry and the speed is a game of timing; here you put in one to four different
 * berries and the blender runs at RPM 100 (my own, x1.30).
 * Eating one raises each condition by its flavor (spicy -> cool ... sour -> tough), x1.1 for the flavor the nature likes
 * and x0.9 for the one it dislikes; with both in it only the stronger of the two counts (equal: neither). The sheen goes
 * up by the feel; a Pokémon whose sheen is 255 eats no more. The Pokéblock Case holds 40 (save.pokeblocks).
 *
 *   G.Pokeblock.blend([berry ids], { rng }) -> { flavors, level, feel, color } | null · name(p) · feed(mon, p) -> { gained, sheen } | null
 *   add(p) -> bool · list() · take(i) · canEat(mon)
 */
G.Pokeblock = (() => {
  const T = s => G.T(s);
  const FLAVORS = ['spicy', 'dry', 'sweet', 'bitter', 'sour'];
  const CONDS = ['cool', 'beauty', 'cute', 'smart', 'tough'];
  const MAX = 255, CASE = 40, MOST = 4, RPM = 100;
  const ONE = { spicy: 'red', dry: 'blue', sweet: 'pink', bitter: 'green', sour: 'yellow' };
  const TWO = { spicy: 'purple', dry: 'indigo', sweet: 'brown', bitter: 'lightblue', sour: 'olive' };
  const COLORS = ['red', 'blue', 'pink', 'green', 'yellow', 'purple', 'indigo', 'brown', 'lightblue', 'olive', 'gray', 'white', 'black', 'gold'];

  /** Its color from its flavors (the black ones are known before: see blend). */
  function color(flavors) {
    const on = FLAVORS.filter(f => flavors[f] > 0);
    if (!on.length) return 'black';
    if (Math.max(...FLAVORS.map(f => flavors[f])) >= 51) return 'gold';
    if (on.length >= 4) return 'white';
    if (on.length === 3) return 'gray';
    const top = on.slice().sort((a, b) => flavors[b] - flavors[a] || FLAVORS.indexOf(a) - FLAVORS.indexOf(b))[0];
    return on.length === 2 ? TWO[top] : ONE[top];
  }

  /** A Pokéblock from 1-4 berries (null for none, more than four, or one that is not a berry with flavors). */
  function blend(berries, o = {}) {
    const F = G.BERRY_FLAVORS || {};
    if (!Array.isArray(berries) || !berries.length || berries.length > MOST || berries.some(b => !F[b])) return null;
    const n = berries.length;
    const sum = Object.fromEntries(FLAVORS.map(f => [f, berries.reduce((a, b) => a + (F[b][f] | 0), 0)]));
    const base = FLAVORS.map((f, i) => sum[f] - sum[FLAVORS[(i + 1) % 5]]);
    const neg = base.filter(v => v < 0).length;
    const feel = Math.max(0, Math.floor(berries.reduce((a, b) => a + F[b].smooth, 0) / n - n));
    const k = Math.round((RPM / 333 + 1) * 100) / 100;
    let flavors = Object.fromEntries(FLAVORS.map((f, i) => [f, Math.max(0, Math.round((base[i] - neg) * k))]));
    const black = new Set(berries).size < n || FLAVORS.every(f => !sum[f]) || neg > 3 || FLAVORS.every(f => !flavors[f]);
    if (black) {
      const r = o.rng || G.RNG(berries.join(',').length * 7919 + n), left = FLAVORS.slice();
      flavors = Object.fromEntries(FLAVORS.map(f => [f, 0]));
      for (let j = 0; j < 3; j++) flavors[left.splice(r.int(0, left.length - 1), 1)[0]] = 2;
    }
    const level = Math.max(...FLAVORS.map(f => flavors[f]));
    return { flavors, level, feel, color: black ? 'black' : color(flavors) };
  }

  /** "Blue Pokéblock" ... */
  const name = p => ({
    red: T('Red Pokéblock'), blue: T('Blue Pokéblock'), pink: T('Pink Pokéblock'), green: T('Green Pokéblock'), yellow: T('Yellow Pokéblock'),
    purple: T('Purple Pokéblock'), indigo: T('Indigo Pokéblock'), brown: T('Brown Pokéblock'), lightblue: T('Light Blue Pokéblock'),
    olive: T('Olive Pokéblock'), gray: T('Gray Pokéblock'), white: T('White Pokéblock'), black: T('Black Pokéblock'), gold: T('Gold Pokéblock')
  })[p && p.color] || T('Black Pokéblock');

  const read = mon => G.Poffin.read(mon), sheen = mon => G.Poffin.sheen(mon), canEat = mon => sheen(mon) < MAX;

  /** Feeds a Pokéblock: -> { gained: { cool, ... }, sheen } (what rose, and the sheen now), or null if it eats no more. */
  function feed(mon, p) {
    if (!canEat(mon)) return null;
    const nat = (G.NATURES || {})[mon.nature] || {}, fl = p.flavors || {};
    let up = nat.likes && fl[nat.likes] > 0 ? 1.1 : 1, down = nat.hates && fl[nat.hates] > 0 ? 0.9 : 1;
    if (up > 1 && down < 1) {                                    // both in it: only the stronger counts
      if (fl[nat.likes] > fl[nat.hates]) down = 1;
      else if (fl[nat.likes] < fl[nat.hates]) up = 1;
      else up = down = 1;
    }
    const c = read(mon), gained = {};
    FLAVORS.forEach((f, i) => {
      const v = fl[f] | 0;
      if (!v) return;
      const k = CONDS[i], add = Math.floor(v * (f === nat.likes ? up : f === nat.hates ? down : 1));
      const now = Math.min(MAX, c[k] + add);
      if (now > c[k]) gained[k] = now - c[k];
      c[k] = now;
    });
    mon.cond = c;
    mon.sheen = Math.min(MAX, sheen(mon) + (p.feel | 0));
    return { gained, sheen: mon.sheen };
  }

  const list = () => { const S = G.Field.save; if (!Array.isArray(S.pokeblocks)) S.pokeblocks = []; return S.pokeblocks; };
  /** Into the Pokéblock Case: false when it is full. */
  function add(p) { const l = list(); if (l.length >= CASE) return false; l.push(p); return true; }
  /** Out of the Pokéblock Case: -> the Pokéblock. */
  const take = i => list().splice(i, 1)[0] || null;

  return { FLAVORS, CONDS, COLORS, MAX, CASE, MOST, RPM, blend, color, name, feed, read, sheen, canEat, list, add, take };
})();
