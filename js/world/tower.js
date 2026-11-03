/* ============ tower.js — G.Tower: the Battle Tower's rules and opponents (chapter 43) ============
 * The challenge itself (the counters, the battle room, the exchange) is in js/content/hoenn/tower.js.
 *   G.Tower.BANNED               species that cannot enter (Mewtwo, Mew, Lugia, Ho-Oh, Celebi, Kyogre,
 *                                Groudon, Rayquaza, Jirachi, Deoxys)
 *   G.Tower.why(mon, chosen)     -> null, or why it cannot join the Pokémon chosen so far:
 *                                'banned' | 'species' (one of each) | 'item' (no two hold the same item)
 *   G.Tower.copy(mon)            a copy for one battle: level 50 at most (a higher one is brought down to
 *                                50), HP, PP and status restored; the party itself never changes
 *   G.Tower.pool(round)          the species opponents use in a round of seven (0, 1, 2, 3+): fully
 *                                evolved, not legendary, base stat total rising with the round
 *   G.Tower.moveset(sp, rng)     four moves it can learn by level 50, by TM or tutor: the strongest
 *                                attacks of different types (its own types and its better attacking
 *                                stat first), and one move from a list of useful status moves
 *   G.Tower.team(rng, round, n)  -> [[sp, 50, moves, item], ...]: n different species, n different items
 *   G.Tower.bpFor(set)           Battle Points for the set of seven just won (the first is set 1)
 *   G.Tower.streak(mode) / setStreak(mode, n) / best(mode) / bp() / addBp(n)   the vars that keep them
 *                                (mode 'single' | 'double'; vars tower-single, tower-single-best, bp...)
 * Every roll uses the RNG it is given (seeded by the content).
 */
G.Tower = (() => {
  const BANNED = [150, 151, 249, 250, 251, 382, 383, 384, 385, 386];
  // Never as an opponent: one HP, Transform, Sketch, one move, only Counter and Mirror Coat.
  const NO_FOE = new Set([292, 132, 235, 201, 202]);
  const TIERS = [[400, 479], [450, 509], [480, 539], [500, 600]];
  // Charging, recharging, leaving the field, fainting on purpose, needing a set-up or luck: never chosen.
  const SKIP = new Set(['hyper-beam', 'blast-burn', 'hydro-cannon', 'frenzy-plant', 'solar-beam', 'sky-attack', 'razor-wind',
    'skull-bash', 'focus-punch', 'dream-eater', 'self-destruct', 'explosion', 'fly', 'dig', 'dive', 'bounce', 'future-sight',
    'doom-desire', 'snore', 'false-swipe', 'fake-out', 'spit-up', 'bide', 'counter', 'mirror-coat', 'present', 'magnitude',
    'endeavor', 'flail', 'reversal', 'beat-up', 'rage', 'feint', 'last-resort', 'natural-gift', 'trump-card', 'hidden-power']);
  const FIXED = { 'seismic-toss': 75, 'night-shade': 75 };          // level 50 damage, as strong as a 75-power move
  const STATUS = ['swords-dance', 'dragon-dance', 'calm-mind', 'bulk-up', 'curse', 'recover', 'soft-boiled', 'milk-drink',
    'slack-off', 'synthesis', 'moonlight', 'morning-sun', 'toxic', 'will-o-wisp', 'thunder-wave', 'spore', 'sleep-powder',
    'hypnosis', 'leech-seed', 'light-screen', 'reflect', 'protect', 'substitute', 'encore', 'yawn', 'rest'];
  const ITEMS = ['leftovers', 'sitrus-berry', 'quick-claw', 'scope-lens', 'bright-powder', 'focus-band', 'shell-bell', 'kings-rock', 'chesto-berry'];
  const BOOST = { fire: 'charcoal', water: 'mystic-water', electric: 'magnet', grass: 'miracle-seed', ice: 'never-melt-ice',
    fighting: 'black-belt', poison: 'poison-barb', ground: 'soft-sand', flying: 'sharp-beak', psychic: 'twisted-spoon',
    bug: 'silver-powder', rock: 'hard-stone', ghost: 'spell-tag', dragon: 'dragon-fang', dark: 'black-glasses', normal: 'silk-scarf' };

  function why(mon, chosen) {
    if (BANNED.includes(mon.sp)) return 'banned';
    if (chosen.some(c => c.sp === mon.sp)) return 'species';
    if (mon.item && chosen.some(c => c.item === mon.item)) return 'item';
    return null;
  }

  function copy(mon) {
    const c = JSON.parse(JSON.stringify(mon));
    c.uid = mon.uid + '-tower';
    if (c.lvl > 50) { c.lvl = 50; c.exp = G.Stats.expAt(G.SPECIES[c.sp].gr, 50); }
    c.status = null; c.slp = 0; c.tox = 0;
    c.hp = G.Mon.maxHp(c);
    for (const m of c.moves) m.pp = G.Mon.ppMax(m.id, m.ppUp);
    return c;
  }

  const total = sp => G.SPECIES[sp].base.reduce((a, b) => a + b, 0);
  const pools = {};
  function pool(round) {
    const t = Math.min(round, TIERS.length - 1);
    if (!pools[t]) {
      const [lo, hi] = TIERS[t];
      pools[t] = Object.keys(G.SPECIES).map(Number).filter(sp => {
        const S = G.SPECIES[sp];
        return !S.leg && !BANNED.includes(sp) && !NO_FOE.has(sp) && !(S.evo && S.evo.length) && total(sp) >= lo && total(sp) <= hi;
      });
    }
    return pools[t];
  }

  /** Every move it can know at level 50: by level, by TM, by tutor. */
  function learnable(sp) {
    const S = G.SPECIES[sp], out = new Set();
    for (const [lvl, id] of S.learn || []) if (lvl <= 50) out.add(id);
    for (const tm of S.tm || []) if (G.TMS && G.TMS[tm]) out.add(G.TMS[tm]);
    for (const id of S.tu || []) out.add(id);
    return [...out].filter(id => G.MOVES[id] && !SKIP.has(id));
  }

  function moveset(sp, rng) {
    const S = G.SPECIES[sp], ok = learnable(sp);
    const better = S.base[1] >= S.base[3] ? 'physical' : 'special';
    const power = id => {
      const M = G.MOVES[id];
      if (FIXED[id]) return FIXED[id];
      if (!M.pow || M.cat === 'status') return 0;
      const h = M.meta && M.meta.hits;
      return M.pow * (Array.isArray(h) ? (h[0] + h[1]) / 2 : h || 1);
    };
    const score = id => {
      const M = G.MOVES[id];
      return power(id) * (M.acc || 100) / 100 * (S.types.includes(M.type) ? 1.5 : 1) * (M.cat === better || FIXED[id] ? 1 : 0.6);
    };
    const attacks = ok.filter(id => power(id) >= 40).sort((a, b) => score(b) - score(a) || (a < b ? -1 : 1));
    const out = [];
    for (const id of attacks) {
      if (out.length >= 3) break;
      if (!out.some(o => G.MOVES[o].type === G.MOVES[id].type)) out.push(id);
    }
    const st = STATUS.filter(id => ok.includes(id)).slice(0, 3);
    if (st.length) out.push(st[rng.int(0, st.length - 1)]);
    for (const id of attacks) { if (out.length >= 4) break; if (!out.includes(id)) out.push(id); }
    return out.slice(0, 4);
  }

  function team(rng, round, n) {
    const p = pool(round), out = [], held = new Set();
    for (let guard = 0; out.length < n && guard < 500; guard++) {
      const sp = rng.pick(p);
      if (out.some(x => x[0] === sp)) continue;
      const moves = moveset(sp, rng);
      if (!moves.length) continue;
      // Half of them power up their first attack; the rest hold a berry or a battle item.
      const boost = BOOST[G.MOVES[moves[0]].type];
      const free = ITEMS.filter(x => !held.has(x) && G.ITEMS[x]);
      const item = boost && G.ITEMS[boost] && !held.has(boost) && rng.next() < 0.5 ? boost : rng.pick(free);
      held.add(item);
      out.push([sp, 50, moves, item]);
    }
    return out;
  }

  const bpFor = set => (set <= 2 ? 3 : set <= 4 ? 4 : set <= 6 ? 5 : 7);

  const num = k => +G.Field.getVar(k) || 0;
  const streak = mode => num('tower-' + mode);
  const best = mode => num('tower-' + mode + '-best');
  function setStreak(mode, n) {
    G.Field.setVar('tower-' + mode, n);
    if (n > best(mode)) G.Field.setVar('tower-' + mode + '-best', n);
  }
  const bp = () => num('bp');
  const addBp = n => G.Field.setVar('bp', Math.max(0, bp() + n));

  return { BANNED, why, copy, pool, learnable, moveset, team, bpFor, streak, setStreak, best, bp, addBp };
})();
