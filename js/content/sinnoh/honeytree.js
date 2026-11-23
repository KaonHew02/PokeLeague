/* ============ honeytree.js — G.HoneyTrees: Sinnoh's Honey trees (chapter 99) ============
 * Platinum's rules, from its decompilation (github.com/pret/pokeplatinum: src/overlay005/honey_tree.c,
 * res/field/maps/encounters_honey_tree.json, src/overlay006/wild_encounters.c's CreateWildMon_HoneyTree). One Honey tree (the
 * outdoor tile `u`, `honeytree`, only from below) on each of its 21 maps, in Platinum's order (TREES; the tiles my own). Honey
 * spread on one stays a day: from 6 to 24 hours after it, a Pokémon waits in the tree (6 to 24 hours of the device's clock,
 * G.Clock.minutes()). What comes is drawn when the Honey is spread: on most trees nothing one time in ten, group B two in ten,
 * group A seven in ten; on the save's four Munchlax trees group C (Munchlax) one time in a hundred, nothing nine, group A twenty,
 * group B seventy; within the group one of six slots, 40/20/20/10/5/5. Spreading Honey on the tree spread last keeps its group
 * nine times in ten (only the slot drawn again). With nothing coming the Honey is used and the tree is bare at once. The battle
 * takes the Honey off the tree. The Pokémon is level 5 to 15 (Hustle, Vital Spirit or Pressure first: 15 half the time;
 * Synchronize and Cute Charm work too, G.FieldAbilities).
 * The four Munchlax trees: Platinum takes them from the four bytes of the 32-bit Trainer ID (each mod 21, a repeat moved on
 * to the next tree); this game's IDs have 16 bits, so the ID is mixed into 32 bits first (my own).
 * A tree's state is a var, `honey:<tree>` = "minutes|group|slot" (minutes empty once the battle has taken the Honey); `honey-last`
 * the tree spread last. The first Pokémon met in a Honey tree once chapter 98 is done ends the chapter: `ending(99)`.
 * Chapter 103: Honey used from the Bag works as Sweet Scent (G.World.sweetScent, field.js); after the first battle it brings,
 * once chapter 102 is done, the script 'sweetscent.done' ends the chapter: `ending(103)`.
 * The words are my own.
 *   G.HoneyTrees.TREES [map, x, y] · GROUPS · SLOT_RATES · WAIT (360) · LAST (1440) · treeOf(map) · munchlaxTrees(id)
 *   group(isMunchlax, rng) · slot(rng) · state(i) · status(i, now) -> 'bare' | 'waiting' | 'ready' · spread(i, rng, now) · level(rng)
 */
G.HoneyTrees = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const TREES = [
    ['route205s', 10, 5], ['route205e', 10, 3], ['route206', 5, 32], ['route207', 12, 1], ['route208', 16, 1], ['route209', 13, 1],
    ['route210s', 8, 1], ['route210n', 33, 1], ['route211e', 17, 15], ['route212n', 28, 13], ['route212s', 5, 18], ['route213', 1, 1],
    ['route214', 13, 1], ['route215', 14, 1], ['route218', 31, 1], ['route221', 19, 2], ['route222', 60, 2], ['valley-windworks', 4, 1],
    ['eterna-forest', 24, 19], ['fuego-ironworks', 9, 1], ['floaroma-meadow', 5, 6]
  ];
  const GROUPS = {
    a: ['combee', 'wurmple', 'burmy', 'cherubi', 'aipom', 'aipom'],
    b: ['burmy', 'cherubi', 'combee', 'aipom', 'aipom', 'heracross'],
    c: ['munchlax', 'munchlax', 'munchlax', 'munchlax', 'munchlax', 'munchlax']
  };
  const SLOT_RATES = [40, 20, 20, 10, 5, 5];
  const WAIT = 6 * 60, LAST = 24 * 60;
  const F = () => G.Field;
  const treeOf = map => TREES.findIndex(t => t[0] === map);

  /** The save's four Munchlax trees (tree indexes), from its Trainer ID. */
  function munchlaxTrees(id) {
    const v = Math.imul(((id | 0) + 0x9e37) ^ 0x5bd1e995, 0x85ebca6b) >>> 0;
    const ids = [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].map(b => b % TREES.length);
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < i; j++) {
        if (ids[j] === ids[i]) { ids[i] = (ids[i] + 1) % TREES.length; j = -1; }
      }
    }
    return ids;
  }
  const isMunchlax = i => munchlaxTrees(F().save.player.id).includes(i);

  function group(munchlax, rng) {
    const r = rng.int(0, 99);
    if (munchlax) return r < 1 ? 'c' : r < 10 ? null : r < 30 ? 'a' : 'b';
    return r < 10 ? null : r < 30 ? 'b' : 'a';
  }
  function slot(rng) {
    const r = rng.int(0, 99);
    return r < 5 ? 5 : r < 10 ? 4 : r < 20 ? 3 : r < 40 ? 2 : r < 60 ? 1 : 0;
  }

  function state(i) {
    const v = F().getVar('honey:' + i);
    if (typeof v !== 'string') return null;
    const [at, g, s] = v.split('|');
    return { at: at === '' ? null : +at, group: GROUPS[g] ? g : null, slot: Math.max(0, Math.min(5, +s || 0)) };
  }
  const save = (i, st) => F().setVar('honey:' + i, (st.at == null ? '' : st.at) + '|' + (st.group || '') + '|' + st.slot);

  function status(i, now) {
    const s = state(i);
    if (!s || s.at == null || !s.group) return 'bare';
    const m = now - s.at;
    if (m < 0 || m >= LAST) return 'bare';
    return m < WAIT ? 'waiting' : 'ready';
  }

  /** Honey spread on tree i now: its group and slot drawn (or kept). -> the state */
  function spread(i, rng, now) {
    const old = state(i);
    let st;
    if (+F().getVar('honey-last') === i && old && old.group && rng.int(0, 99) < 90) st = { at: now, group: old.group, slot: slot(rng) };
    else {
      const g = group(isMunchlax(i), rng);
      st = g ? { at: now, group: g, slot: slot(rng) } : { at: null, group: null, slot: 0 };
    }
    save(i, st);
    F().setVar('honey-last', i);
    return st;
  }

  const level = (rng, ab) => (G.FieldAbilities ? G.FieldAbilities.level(ab, ['', 5, 15], rng) : rng.int(5, 15));
  const rngFor = (i, now) => G.RNG(((F().save.player.id | 0) * 131 + now * 7 + i * 977 + (+F().getVar('steps') || 0)) >>> 0);

  async function tree(h) {
    const m = G.World && G.World.map, i = treeOf(typeof m === 'string' ? m : m && m.id);
    if (i < 0) return;
    const now = G.Clock.minutes(), st = status(i, now), rng = rngFor(i, now);
    if (st === 'ready') {
      const s = state(i), sp = GROUPS[s.group][s.slot];
      await h.say(T('Something is clinging to the tree, licking the Honey!'));
      save(i, { at: null, group: s.group, slot: s.slot });            // the battle takes the Honey off the tree
      const FA = G.FieldAbilities, ab = FA ? FA.ab(FA.lead(F().party())) : null;
      const lvl = level(rng, ab), traits = FA ? FA.traits(ab, FA.lead(F().party()), G.Maps.species(sp), rng) : {};
      const out = await h.wild(sp, lvl, traits);
      // The end of the ninety-ninth chapter (credits-ui.js), once the ninety-eighth is done.
      if (out !== 'lose' && F().flag('chapter-98-done') && !F().flag('chapter-99-done')) {
        if (G.CreditsUI) await G.CreditsUI.ending(99); else F().setFlag('chapter-99-done');
      }
      return;
    }
    if (st === 'waiting') { await h.say(T('The tree is sticky with Honey, but nothing has come yet. Check back in a while.')); return; }
    await h.say(T('A tree with a faint, sweet smell. Pokémon that love sweet things might gather here.'));
    if (!F().count('honey')) return;
    if (await h.choice(T('Spread some Honey on the tree?'), {}) !== 0) return;
    F().takeItem('honey', 1);
    spread(i, rng, now);
    await h.say(T('{player} spread Honey on the tree. Something might come to lick it in a few hours.'));
  }

  /** Chapter 103: after a battle that Sweet Scent or Honey brought on (field.js), the end of the chapter, once. */
  async function scentDone() {
    if (F().flag('chapter-102-done') && !F().flag('chapter-103-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(103); else F().setFlag('chapter-103-done');
    }
  }

  G.Script.def({ 'honey.tree': [['js', tree]], 'sweetscent.done': [['js', scentDone]] });
  return { TREES, GROUPS, SLOT_RATES, WAIT, LAST, treeOf, munchlaxTrees, isMunchlax, group, slot, state, status, spread, level };
})();
