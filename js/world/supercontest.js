/* ============ supercontest.js — G.SuperContest: the rules of Sinnoh's Super Contest (chapter 85) ============
 * Platinum's Super Contest in Hearthome City: four Pokémon, one category (CATS) and one rank (RANKS), three rounds.
 * (Not G.Contest: that is Johto's Bug-Catching Contest, contest.js.) Only rules here, no screen: supercontest-ui.js
 * plays it, the tests drive it directly.
 * - Categories sit on a circle (cool, beauty, cute, smart, tough): the two neighbours are related (`near`), the other two
 *   clash (`clash`). A move's category is its `ct` (G.MOVES, PokeAPI).
 * - Visual (`visual`): Platinum scores accessories and condition; here condition only (no dress-up). The points are the
 *   matching condition plus half of the two related ones and the sheen (after 52poke's description), in hearts by rank
 *   (VDIV, my own).
 * - Dance (`danceLead`, `danceBack`, `npcSteps`): four dances, each Pokémon leading one (`leadOf`). The lead steps
 *   on beats 1..N (N = STEPS: Platinum's 3 / 4 / 4 / 4), the three others copy on beats N+1..2N. A step is graded by its
 *   distance from the beat (WIN, my own): Excellent 2, Good 1, else nothing (52poke's points); a backup's step must
 *   also go the lead's way. Inputs are { dir, t } in ms from the dance's start; BEAT is the tempo (my own).
 * - Acting (`startTurn`, `choices`, `playTurn`): four turns. Each picks a move (not the one it used last turn, unless its
 *   effect allows it) and one of three judges (JUDGES; Dexter in the middle is the head). Hearts: the move's Super Contest
 *   effect (G.SUPER_CONTEST appeal, then its rule in `effect`; numbers no source gives are my own: effect 12 earns the
 *   voltage of the previous performer's judge, 16 earns 4 less the judge's voltage, 21 earns its place in the order).
 *   A move of the contest's category raises that judge's voltage by one, a clashing one lowers it; the one who fills it
 *   to five earns +5 (+8 from the head judge) and it goes back to 0. At the end of the turn each judge adds hearts by
 *   how many chose them: alone +3, two +2 each, three +1 each, four nothing (Serebii, Smogon). The first turn's order
 *   follows the Visual and Dance totals, then each turn's hearts, highest first; effects move one first, last, or shuffle.
 * - The result (`standings`): Visual + Dance + Acting (my own sum), ties by Acting, then Visual.
 * - Rivals (`rivals`): three per contest from a list per category, their condition, dance and choices by rank (my own),
 *   all from the contest's seed.
 * - Chapter 86, Hoenn's Contest Halls (js/content/hoenn/contesthalls.js): the same rules. Hoenn's ranks (HOENN_RANKS:
 *   Normal, Super, Hyper, Master) play as Sinnoh's of the same place (TIER: Super as Great, Hyper as Ultra); the rivals
 *   come from Hoenn's lists (ROSTERS.hoenn: Pokémon of the Hoenn Pokédex); `label` is the rank shown on screen. Hoenn's
 *   ribbons are 'hoenn-<category>-<rank>' (帅气奖章, 帅气超级奖章...: the names in the context "hoenn").
 *
 *   G.SuperContest.create({ cat, rank, entrants, seed }) -> state; visual(state); leadOf(state, round);
 *   danceLead(inputs, rank) -> { points, seq }; danceBack(inputs, seq, rank) -> points; npcSteps(state, i, seq) -> inputs;
 *   startTurn(state); choices(state, i) -> [{ id, ok }]; pick(state, i, skill) -> { move, judge };
 *   playTurn(state, picks) -> { events, share, hearts }; standings(state) -> [{ i, total, place }]
 */
G.SuperContest = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const CATS = ['cool', 'beauty', 'cute', 'smart', 'tough'];
  const RANKS = ['normal', 'great', 'ultra', 'master'];
  const JUDGES = [{ id: 'jordan', bonus: 5 }, { id: 'dexter', bonus: 8, head: true }, { id: 'keira', bonus: 5 }];
  const TURNS = 4, VMAX = 5, ROUNDS = 4;
  const SHARE = [0, 3, 2, 1, 0];
  const STEPS = { normal: 3, great: 4, ultra: 4, master: 4 };
  const BEAT = { normal: 700, great: 640, ultra: 580, master: 520 };
  const WIN = { normal: [110, 240], great: [100, 220], ultra: [90, 200], master: [80, 180] };
  const VDIV = { normal: 20, great: 30, ultra: 40, master: 50 };
  const DIRS = ['up', 'down', 'left', 'right'];

  const at = c => CATS.indexOf(c);
  const near = c => [CATS[(at(c) + 4) % 5], CATS[(at(c) + 1) % 5]];
  const clash = c => [CATS[(at(c) + 2) % 5], CATS[(at(c) + 3) % 5]];
  const move = id => (G.MOVES || {})[id] || {};

  // ---------------- a contest ----------------
  /** entrants: [{ name, mon: { sp, moves: [ids], cond, sheen, nature }, player? , skill? }] (four; the player's first). */
  function create({ cat, rank, entrants, seed, label }) {
    return {
      cat, rank, seed, label: label || null, rng: G.RNG(seed >>> 0),
      entrants: entrants.map((e, i) => Object.assign({ i, visual: 0, dance: 0, acting: 0, last: null, double: false, next: null, skill: 0.5 }, e)),
      voltage: [0, 0, 0], turn: 0, order: null, shuffle: false
    };
  }

  // ---------------- Visual ----------------
  function visualPoints(mon, cat) {
    const c = (mon && mon.cond) || {}, [a, b] = near(cat);
    return (c[cat] | 0) + Math.floor(((c[a] | 0) + (c[b] | 0) + ((mon && mon.sheen) | 0)) / 2);
  }
  /** The Visual round: each one's hearts. */
  function visual(state) {
    for (const e of state.entrants) e.visual = Math.floor(visualPoints(e.mon, state.cat) / VDIV[state.rank]);
    return state.entrants.map(e => e.visual);
  }

  // ---------------- Dance ----------------
  /** Who leads dance `round` (0-3): the one placed lowest after the Visual round first, so the best dances last. */
  function leadOf(state, round) {
    const by = state.entrants.slice().sort((a, b) => a.visual - b.visual || b.i - a.i);
    return by[round].i;
  }
  const grade = (dt, rank) => { const [e, g] = WIN[rank], a = Math.abs(dt); return a <= e ? 2 : a <= g ? 1 : 0; };
  /** The inputs nearest each of `n` beats from beat `from` (each input used once), within the Good window. */
  function onBeats(inputs, from, n, rank) {
    const B = BEAT[rank], used = new Set(), out = [];
    for (let k = 0; k < n; k++) {
      const tb = (from + k + 1) * B;
      let best = -1;
      inputs.forEach((x, j) => { if (!used.has(j) && Math.abs(x.t - tb) <= WIN[rank][1] && (best < 0 || Math.abs(x.t - tb) < Math.abs(inputs[best].t - tb))) best = j; });
      if (best >= 0) { used.add(best); out.push({ dir: inputs[best].dir, pts: grade(inputs[best].t - tb, rank) }); } else out.push(null);
    }
    return out;
  }
  /** The lead's steps (beats 1..N): points for the timing, and the steps the others must copy (null for a missed one). */
  function danceLead(inputs, rank) {
    const hits = onBeats(inputs, 0, STEPS[rank], rank);
    return { points: hits.reduce((a, h) => a + (h ? h.pts : 0), 0), seq: hits.map(h => (h ? h.dir : null)) };
  }
  /** A backup's copy (beats N+1..2N): the timing points of each step that goes the lead's way (any way where the lead missed). */
  function danceBack(inputs, seq, rank) {
    const hits = onBeats(inputs, seq.length, seq.length, rank);
    return hits.reduce((a, h, k) => a + (h && (!seq[k] || h.dir === seq[k]) ? h.pts : 0), 0);
  }
  /** A computer dancer's inputs for one dance: as lead (seq null) or copying `seq`. Its skill (0-1) is how often it is Excellent. */
  function npcSteps(state, i, seq) {
    const e = state.entrants[i], r = state.rng, rank = state.rank, B = BEAT[rank], [ex, gd] = WIN[rank], n = STEPS[rank];
    const from = seq ? n : 0, out = [];
    for (let k = 0; k < n; k++) {
      const roll = r.next(), tb = (from + k + 1) * B;
      if (roll >= e.skill + (1 - e.skill) * 0.6) continue;                        // missed
      const dt = roll < e.skill ? r.int(-ex + 10, ex - 10) : (r.int(0, 1) ? 1 : -1) * r.int(ex + 10, gd - 10);
      out.push({ dir: seq ? seq[k] || DIRS[r.int(0, 3)] : DIRS[r.int(0, 3)], t: tb + dt });
    }
    return out;
  }

  // ---------------- Acting ----------------
  /** The order of this turn: the first from the Visual and Dance totals, then as the last turn left it. */
  function startTurn(state) {
    if (!state.order) state.order = state.entrants.slice().sort((a, b) => (b.visual + b.dance) - (a.visual + a.dance) || a.i - b.i).map(e => e.i);
    return state.order;
  }
  /** The moves one may use this turn: not the one used last turn, unless its effect allows a repeat (7). */
  const allowed = (e, id) => id !== e.last || move(id).sce === 7;
  const choices = (state, i) => state.entrants[i].mon.moves.map(id => ({ id, ok: allowed(state.entrants[i], id), ct: move(id).ct, sce: move(id).sce }));

  /** How much a move to a judge looks worth (the computers' guess; the auto-player uses it too). */
  function worth(state, i, id, j) {
    const m = move(id), v = state.voltage[j], cat = state.cat, up = m.ct === cat;
    let w = ((G.SUPER_CONTEST || {})[m.sce] || {}).appeal || 0;
    if (up) w += 0.6; else if (clash(cat).includes(m.ct)) w -= 0.6;
    if (up && v === VMAX - 1) w += JUDGES[j].bonus;
    const last = state.turn === TURNS - 1;
    w += ({ 4: up ? 2 : 0, 6: 1.2, 8: up ? v + 1 : 0, 11: last ? 0 : 2, 12: 1, 15: last ? 2 : 0, 16: Math.max(0, 4 - v), 17: 1, 18: 1, 20: up ? 1 : 0,
            21: 2, 22: 0.6, 23: 0.8, 1: 0.4, 2: 0.4 })[m.sce] || 0;
    return w;
  }
  /** A computer's (or the auto-player's) choice: the best guess most of the time, more often the higher its skill. */
  function pick(state, i, skill = state.entrants[i].skill) {
    const r = state.rng, opts = choices(state, i).filter(o => o.ok);
    const all = [];
    for (const o of opts) for (let j = 0; j < 3; j++) all.push({ move: o.id, judge: j, w: worth(state, i, o.id, j) + r.next() * (1.5 - skill) });
    if (r.next() > 0.35 + skill * 0.6) return all[r.int(0, all.length - 1)];
    all.sort((a, b) => b.w - a.w);
    return all[0];
  }

  /** One turn: picks[i] = { move, judge } for everyone. -> { events: per performer, share: per entrant, hearts: per entrant } */
  function playTurn(state, picks) {
    const order = startTurn(state), V = state.voltage, cat = state.cat, last = state.turn === TURNS - 1;
    const count = [0, 0, 0];
    picks.forEach(p => { count[p.judge]++; });
    let noUp = false, noDown = false, prev = null;
    const events = [], hearts = [0, 0, 0, 0], moved = [0, 0, 0, 0];
    const next = { first: [], last: [] };
    let shuffle = false;
    order.forEach((i, pos) => {
      const e = state.entrants[i], p = picks[i], m = move(p.move), j = p.judge, eff = m.sce;
      const ok = allowed(e, p.move);
      let h = ok ? (((G.SUPER_CONTEST || {})[eff] || {}).appeal || 0) : 0;
      const before = V[j];
      let dv = 0;
      if (ok && m.ct === cat && !noUp) dv = 1;
      else if (ok && clash(cat).includes(m.ct) && !noDown) dv = before > 0 ? -1 : 0;
      V[j] = before + dv;
      const up = dv > 0;
      if (ok) {
        if (eff === 4 && up) h += 2;
        if (eff === 6 && count[j] === 1) h += 3;
        if (eff === 8 && up) h += V[j];
        if (eff === 9 && count[j] === 4) h += 15;
        if (eff === 12 && prev) h += prev.v;
        if (eff === 15 && last) h *= 2;
        if (eff === 16) h += Math.max(0, 4 - before);
        if (eff === 17 && pos === 0) h += 2;
        if (eff === 18 && pos === order.length - 1) h += 2;
        if (eff === 20 && up && prev && prev.up) h += 3;
        if (eff === 21) h += pos + 1;
        if (eff === 22 && prev && prev.filled) h += 3;
      }
      if (e.double) h *= 2;
      let filled = false;
      if (V[j] >= VMAX) { filled = true; h += JUDGES[j].bonus; V[j] = 0; }
      if (ok) {
        if (eff === 10) for (let k = 0; k < 3; k++) V[k] = Math.max(0, V[k] - 1);
        if (eff === 13) noUp = true;
        if (eff === 19) noDown = true;
        if (eff === 1) next.first.push(i);
        if (eff === 2) next.last.push(i);
        if (eff === 14) shuffle = true;
      }
      hearts[i] = h;
      moved[i] = eff;
      events.push({ i, move: p.move, judge: j, ok, hearts: h, dv, voltage: V[j], volts: V.slice(), filled, eff });
      prev = { i, judge: j, up, filled, v: V[j] };
    });
    // Effect 23: the one with the lowest score this turn (ties all count).
    const low = Math.min(...hearts);
    state.entrants.forEach((e, i) => {
      if (moved[i] !== 23 || !picks[i] || !allowed(e, picks[i].move) || hearts[i] !== low) return;
      hearts[i] += 3;
      events.find(x => x.i === i).hearts += 3;
    });
    // The judges: by how many chose each.
    const share = picks.map(p => SHARE[count[p.judge]]);
    state.entrants.forEach((e, i) => {
      e.acting += hearts[i] + share[i];
      e.double = moved[i] === 11 && allowed(e, picks[i].move);
      e.last = picks[i].move;
    });
    // The next turn's order: this turn's hearts, then the effects.
    const total = state.entrants.map((e, i) => hearts[i] + share[i]);
    let o = order.slice().sort((a, b) => total[b] - total[a] || order.indexOf(a) - order.indexOf(b));
    if (shuffle) for (let k = o.length - 1; k > 0; k--) { const r = state.rng.int(0, k); [o[k], o[r]] = [o[r], o[k]]; }
    o = next.first.concat(o.filter(i => !next.first.includes(i) && !next.last.includes(i)), next.last);
    state.order = o;
    state.turn++;
    return { events, share, hearts: total };
  }

  /** The final standings: Visual + Dance + Acting, ties by Acting, then Visual. -> [{ i, total, place }], best first. */
  function standings(state) {
    const s = state.entrants.map(e => ({ i: e.i, total: e.visual + e.dance + e.acting, acting: e.acting, visual: e.visual }))
      .sort((a, b) => b.total - a.total || b.acting - a.acting || b.visual - a.visual || a.i - b.i);
    s.forEach((x, k) => { x.place = k + 1; });
    return s;
  }

  // ---------------- rivals ----------------
  const ROSTER = {
    cool: ['luxray', 'staraptor', 'infernape', 'gallade', 'rapidash', 'heracross', 'scizor', 'houndoom'],
    beauty: ['milotic', 'roserade', 'vespiquen', 'glaceon', 'lapras', 'gardevoir', 'ninetales', 'froslass'],
    cute: ['pachirisu', 'lopunny', 'togekiss', 'clefable', 'wigglytuff', 'delcatty', 'plusle', 'minun'],
    smart: ['alakazam', 'bronzong', 'chimecho', 'xatu', 'slowking', 'girafarig', 'espeon', 'porygon-z'],
    tough: ['machamp', 'golem', 'steelix', 'rhyperior', 'sudowoodo', 'rampardos', 'bastiodon', 'hariyama']
  };
  // Chapter 86: Hoenn's lists, Pokémon of the Hoenn Pokédex (my own picks, as Sinnoh's).
  const ROSTERS = {
    sinnoh: ROSTER,
    hoenn: {
      cool: ['blaziken', 'sceptile', 'swellow', 'manectric', 'absol', 'zangoose', 'ninjask', 'crawdaunt'],
      beauty: ['milotic', 'gardevoir', 'altaria', 'roselia', 'ninetales', 'beautifly', 'lanturn', 'starmie'],
      cute: ['delcatty', 'plusle', 'minun', 'azumarill', 'wigglytuff', 'spinda', 'castform', 'pikachu'],
      smart: ['alakazam', 'xatu', 'claydol', 'grumpig', 'chimecho', 'solrock', 'lunatone', 'medicham'],
      tough: ['hariyama', 'aggron', 'torkoal', 'camerupt', 'swampert', 'armaldo', 'cradily', 'breloom']
    }
  };
  const HOENN_RANKS = ['normal', 'super', 'hyper', 'master'];
  const TIER = { normal: 'normal', super: 'great', hyper: 'ultra', master: 'master' };
  const NAMES = ['Lena', 'Marco', 'Yuki', 'Sasha', 'Tomas', 'Ivy', 'Remy', 'Nadia', 'Lucio', 'Clara', 'Hugo', 'Mina', 'Oscar', 'Pia', 'Ravi', 'Selma'];
  const LEVEL = { normal: 25, great: 35, ultra: 45, master: 55 };
  // Set for a normal difficulty (tests/story.test.cjs prints it): a Pokémon fed 20 above the rivals' condition, played by an
  // average player (skill 0.5), wins about 0.6-0.7 at every rank.
  const COND = { normal: 60, great: 110, ultra: 160, master: 210 };
  const SKILL = { normal: 0.2, great: 0.25, ultra: 0.3, master: 0.35 };
  // Hoenn's rivals (chapter 86) dance and choose a little worse, set for a normal difficulty: with Sinnoh's skill the same
  // line (tests/story.test.cjs) gave 0.64 / 0.66 / 0.52 / 0.47 by rank, with these about 0.7 / 0.7 / 0.65 / 0.6.
  const SKILLS = { sinnoh: SKILL, hoenn: { normal: 0.15, great: 0.2, ultra: 0.2, master: 0.25 } };
  /** Four moves for a rival: of the category first (different effects first), then related ones, then any it knows. */
  function movesFor(spId, cat, lvl, rng) {
    const s = G.SPECIES[spId] || {}, known = new Set((s.learn || []).filter(([l]) => l <= lvl).map(([, m]) => m));
    for (const tm of s.tm || []) if (G.TMS && G.TMS[tm]) known.add(G.TMS[tm]);
    const all = [...known].filter(id => G.MOVES[id]);
    const out = [], seen = new Set();
    for (const group of [all.filter(id => move(id).ct === cat), all.filter(id => near(cat).includes(move(id).ct)), all]) {
      const g = group.slice();
      for (let k = g.length - 1; k > 0; k--) { const r = rng.int(0, k); [g[k], g[r]] = [g[r], g[k]]; }
      g.sort((a, b) => (seen.has(move(a).sce) ? 1 : 0) - (seen.has(move(b).sce) ? 1 : 0));
      for (const id of g) { if (out.length < 4 && !out.includes(id)) { out.push(id); seen.add(move(id).sce); } }
    }
    return out;
  }
  /** Three rivals for a contest (their names are dictionary keys: the screen translates them); `region` picks the lists. */
  function rivals(cat, rank, seed, region = 'sinnoh') {
    const rng = G.RNG((seed ^ 0x5c0e57) >>> 0), names = NAMES.slice(), list = (ROSTERS[region] || ROSTER)[cat].slice(), out = [];
    for (let k = 0; k < 3; k++) {
      const name = names.splice(rng.int(0, names.length - 1), 1)[0], slug = list.splice(rng.int(0, list.length - 1), 1)[0];
      const sp = G.Maps.species(slug), base = COND[rank] + rng.int(-20, 20), cond = {};
      for (const c of CATS) cond[c] = c === cat ? Math.min(255, base) : near(cat).includes(c) ? Math.floor(base / 2) : rng.int(0, 40);
      out.push({ name, skill: (SKILLS[region] || SKILL)[rank], mon: { sp, lvl: LEVEL[rank], moves: movesFor(sp, cat, LEVEL[rank], rng), cond, sheen: Math.min(255, COND[rank] + rng.int(-30, 10)), nature: 'hardy' } });
    }
    return out;
  }

  // ---------------- names ----------------
  // The categories in the context "contest" (files sinnoh-contest-cat): "Beauty" alone is the Trainer class.
  const catName = c => ({ cool: G.T('Cool', 'contest'), beauty: G.T('Beauty', 'contest'), cute: G.T('Cute', 'contest'),
                          smart: G.T('Smart', 'contest'), tough: G.T('Tough', 'contest') })[c] || c;
  const rankName = r => ({ normal: T('Normal Rank'), great: T('Great Rank'), ultra: T('Ultra Rank'), master: T('Master Rank') })[r] || r;
  /** Hoenn's ranks (chapter 86). */
  const hoennRankName = r => ({ normal: T('Normal Rank'), super: T('Super Rank'), hyper: T('Hyper Rank'), master: T('Master Rank') })[r] || r;
  /** A ribbon's name: 'cool-normal' -> "Cool Ribbon", 'cool-great' -> "Cool Ribbon Great" (Sinnoh's: 神奥帅气奖章, 神奥帅气高手奖章);
   *  Hoenn's 'hoenn-cool-normal' -> "Cool Ribbon", 'hoenn-cool-super' -> "Cool Ribbon Super" (帅气奖章, 帅气超级奖章). */
  function ribbonName(id) {
    const parts = String(id).split('-');
    if (parts[0] === 'hoenn') {
      const [, c, r] = parts, H = 'hoenn';
      return r === 'normal' ? G.I18n.fmt('{cat} Ribbon', { cat: catName(c) }, H)
        : G.I18n.fmt('{cat} Ribbon {rank}', { cat: catName(c), rank: ({ super: T('Super'), hyper: T('Hyper'), master: T('Master') })[r] || r }, H);
    }
    const [c, r] = parts;
    return r === 'normal' ? fmt('{cat} Ribbon', { cat: catName(c) })
      : fmt('{cat} Ribbon {rank}', { cat: catName(c), rank: ({ great: T('Great'), ultra: T('Ultra'), master: T('Master') })[r] || r });
  }

  /** A whole contest without a screen (the tests, the story harness): everyone dances and acts by their skill. -> standings */
  function auto(state) {
    visual(state);
    for (let r = 0; r < ROUNDS; r++) {
      const L = leadOf(state, r), lead = danceLead(npcSteps(state, L, null), state.rank);
      state.entrants[L].dance += lead.points;
      for (const e of state.entrants) if (e.i !== L) e.dance += danceBack(npcSteps(state, e.i, lead.seq), lead.seq, state.rank);
    }
    for (let t = 0; t < TURNS; t++) { startTurn(state); playTurn(state, state.entrants.map(e => pick(state, e.i))); }
    return standings(state);
  }

  return { CATS, RANKS, HOENN_RANKS, TIER, ROSTERS, JUDGES, catName, rankName, hoennRankName, ribbonName, auto, TURNS, VMAX, ROUNDS, SHARE, STEPS, BEAT, WIN, VDIV, DIRS, ROSTER, NAMES, COND, SKILL, SKILLS, LEVEL,
           near, clash, create, visualPoints, visual, leadOf, grade, danceLead, danceBack, npcSteps,
           startTurn, allowed, choices, worth, pick, playTurn, standings, movesFor, rivals };
})();
