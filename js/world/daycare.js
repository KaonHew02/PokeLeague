/* ============ daycare.js — G.DayCare: the Day Care on Route 34 (chapter 13) ============
 * The Day-Care Lady raises up to two Pokémon while you travel: each step you take gives each of
 * them 1 Exp. point (G.Field's walked() calls step()). A level reached there teaches the moves of
 * that level, forgetting the oldest one when it already knows four (as in the games); it does not
 * evolve there. Taking one back costs ₽100, plus ₽100 for each level it grew.
 *   save.daycare = [{ mon, lvl }]          lvl: its level when it was left
 *   G.DayCare.list() · full() · deposit(partyIndex) -> false when it cannot be left
 *   withdraw(k) -> the mon, or a reason ('party-full' | 'money')
 *   grown(k) (levels) · price(k) · step(n) · gain(mon, n)
 *
 * Breeding (chapter 25, once the Ruins of Alph are done: flag ruins-done). Two Pokémon left here
 * that can breed (an egg group in common and one of each gender, or one of them Ditto with any
 * other; never one from the 'no-eggs' group) leave an Egg now and then: every 128 steps, a chance
 * by how well they get along (compat: 70 same species from other Trainers, 50 same species or
 * other Trainers, 20 otherwise, as in the games). The Day-Care Man keeps it (save.daycareEgg)
 * until you take it: the mother's species (with Ditto, the other one's) at its first stage, Lv. 5,
 * with three IVs from the parents, the egg moves the father knows, and Nidoran of either gender.
 * You carry Eggs apart from the party (save.eggs, at most six; the party screen shows them), like
 * the Mystery Egg: each step brings them closer, and one that is due hatches (hatch: to the party,
 * or the PC when it is full; flag daycare-hatched). The Day-Care Man's Odd Egg holds a baby
 * Pokémon, shiny one time in eight.
 *   save.eggs = [{ mon, steps }]
 *   canBreed(a, b) · compat(a, b) -> 0 | 20 | 50 | 70 · root(sp) · breed(a, b, rng) -> egg · odd(rng) -> egg
 *   breeding() · waiting() · collect() -> egg | 'full' | null · eggs() · eggSteps(n) -> index due or -1
 *   hatch(h, i) (a script step) · hint(egg) -> how close it is, as a text · seed(s)
 */
G.DayCare = (() => {
  const MAX = 2;
  const S = () => G.Field.save;
  const list = () => S().daycare || (S().daycare = []);
  const full = () => list().length >= MAX;

  /** A Pokémon can be left unless it is the last one in the party that can still fight. */
  function canLeave(i) {
    const party = G.Field.party(), m = party[i];
    return !!m && party.some((o, j) => j !== i && o.hp > 0);
  }
  function deposit(i) {
    if (full() || !canLeave(i)) return false;
    const [mon] = G.Field.party().splice(i, 1);
    list().push({ mon, lvl: mon.lvl });
    return true;
  }

  const grown = k => (list()[k] ? list()[k].mon.lvl - list()[k].lvl : 0);
  const price = k => 100 + 100 * grown(k);

  function withdraw(k) {
    const e = list()[k];
    if (!e) return null;
    if (G.Field.party().length >= 6) return 'party-full';
    if (S().player.money < price(k)) return 'money';
    G.Field.money(-price(k));
    list().splice(k, 1);
    G.Mon.heal(e.mon);
    G.Field.party().push(e.mon);
    return e.mon;
  }

  /** Experience for one Pokémon: levels and their moves (no evolution, no move prompts). */
  function gain(mon, n) {
    const gr = G.SPECIES[mon.sp].gr;
    mon.exp = Math.min(G.Stats.expAt(gr, 100), (mon.exp || 0) + n);
    while (mon.lvl < 100 && mon.exp >= G.Stats.expAt(gr, mon.lvl + 1)) {
      const old = G.Mon.maxHp(mon);
      mon.lvl++;
      G.Mon.recalc(mon, old);
      for (const id of G.Mon.movesAt(mon.sp, mon.lvl)) {
        if (G.Mon.knows(mon, id)) continue;
        if (mon.moves.length >= 4) mon.moves.shift();
        G.Mon.learn(mon, id);
      }
    }
  }

  function step(n = 1) {
    for (const e of list()) gain(e.mon, n);
    if (!breeding()) return;
    const V = G.Field.save.vars;
    V['daycare-steps'] = (V['daycare-steps'] || 0) + n;
    for (; V['daycare-steps'] >= EGG_EVERY; V['daycare-steps'] -= EGG_EVERY) {
      const [a, b] = list().map(e => e.mon);
      if (S().daycareEgg || !b) continue;
      const c = compat(a, b);
      if (c && rng.next() < c / 100) S().daycareEgg = true;
    }
  }

  // ---------------- breeding (chapter 25) ----------------

  const EGG_EVERY = 128, MAX_EGGS = 6, HATCH_LVL = 5, DITTO = 132, NIDORAN = [29, 32];
  // The Odd Egg: Pichu, Cleffa, Igglybuff, Smoochum, Elekid, Magby or Tyrogue.
  const BABIES = [172, 173, 174, 238, 239, 240, 236];
  let rng = G.RNG(G.RNG.seed());
  const seed = s => { rng = G.RNG(s); };
  const breeding = () => G.Field.flag('ruins-done');
  const eggs = () => S().eggs || (S().eggs = []);
  const waiting = () => !!S().daycareEgg;

  function canBreed(a, b) {
    if (!a || !b) return false;
    const A = G.SPECIES[a.sp].eg || [], B = G.SPECIES[b.sp].eg || [];
    if (A.includes('no-eggs') || B.includes('no-eggs')) return false;
    if (a.sp === DITTO || b.sp === DITTO) return a.sp !== b.sp;
    return !!a.gender && !!b.gender && a.gender !== b.gender && A.some(g => B.includes(g));
  }
  function compat(a, b) {
    if (!canBreed(a, b)) return 0;
    const same = a.sp === b.sp, otherOT = !!(a.ot && b.ot && a.ot.id !== b.ot.id);
    return same ? (otherOT ? 70 : 50) : (otherOT ? 50 : 20);
  }

  let prevo = null;
  /** The first stage of a species' family, among the game's species (Pikachu -> Pichu, Marill -> Marill). */
  function root(sp) {
    if (!prevo) {
      prevo = {};
      for (const d of Object.keys(G.SPECIES)) for (const e of G.SPECIES[d].evo || []) prevo[e.to] = +d;
    }
    while (prevo[sp]) sp = prevo[sp];
    return sp;
  }
  const stepsFor = sp => Math.max(320, (G.SPECIES[sp].hc || 20) * 64);

  /** A new Pokémon for an Egg: Lv. 5, yours, met at the Day Care. */
  function newborn(sp, r, o = {}) {
    const P = S().player;
    const mon = G.Mon.create(sp, HATCH_LVL, Object.assign({ rng: r, ball: 'poke-ball', ot: { name: P.name, id: P.id },
                                                            met: { map: 'daycare', lvl: HATCH_LVL } }, o));
    mon.friendship = 120;
    return mon;
  }

  /** The Egg two Pokémon leave: -> { mon, steps } */
  function breed(a, b, r = rng) {
    const mother = a.sp === DITTO ? b : b.sp === DITTO ? a : a.gender === 'f' ? a : b;
    const father = mother === a ? b : a;
    let sp = root(mother.sp);
    if (NIDORAN.includes(sp)) sp = NIDORAN[r.int(0, 1)];
    const mon = newborn(sp, r);
    // Three IVs from the parents, each from one of the two.
    const stats = [0, 1, 2, 3, 4, 5];
    for (let k = 0; k < 3; k++) {
      const st = stats.splice(r.int(0, stats.length - 1), 1)[0];
      mon.ivs[st] = (r.int(0, 1) ? mother : father).ivs[st];
    }
    // The egg moves the father knows (a Ditto teaches none), after the moves of its level.
    const em = G.SPECIES[sp].em || [];
    for (const m of father.sp === DITTO ? [] : father.moves) {
      if (!em.includes(m.id) || G.Mon.knows(mon, m.id)) continue;
      if (mon.moves.length >= 4) mon.moves.shift();
      G.Mon.learn(mon, m.id);
    }
    mon.hp = G.Mon.maxHp(mon);
    return { mon, steps: stepsFor(sp) };
  }

  /** The Day-Care Man's Odd Egg: a baby Pokémon, shiny one time in eight. */
  function odd(r = rng) {
    const sp = BABIES[r.int(0, BABIES.length - 1)];
    return { mon: newborn(sp, r, { shinyOdds: 8 }), steps: 640 };
  }

  /** The Egg the Day-Care Man found, into your hands. -> the egg, 'full' (six carried) or null (none) */
  function collect() {
    if (!waiting()) return null;
    if (eggs().length >= MAX_EGGS) return 'full';
    const [a, b] = list().map(e => e.mon);
    S().daycareEgg = false;
    if (!canBreed(a, b)) return null;
    const egg = breed(a, b);
    eggs().push(egg);
    return egg;
  }

  /** Steps for the Eggs you carry. -> the index of one that is ready to hatch, or -1 */
  function eggSteps(n = 1) {
    let due = -1;
    eggs().forEach((e, i) => { e.steps = Math.max(0, e.steps - n); if (!e.steps && due < 0) due = i; });
    return due;
  }

  /** How close an Egg is to hatching, as the games put it. */
  function hint(e) {
    const left = e.steps / stepsFor(e.mon.sp);
    if (left > 0.6) return G.T('It looks as if it will take a long time to hatch.');
    if (left > 0.25) return G.T('Something moves inside it now and then. It should hatch before long.');
    return G.T('Sounds are coming from inside! It is about to hatch!');
  }

  /** An Egg hatches (a script step: G.World runs it when one is due). */
  async function hatch(h, i) {
    const e = eggs()[i];
    if (!e || e.steps > 0) return;
    await h.say(G.T('Oh? The Egg is moving!'));
    eggs().splice(i, 1);
    const mon = e.mon, F = G.Field, party = F.party();
    F.save.dex.seen[mon.sp] = 1; F.save.dex.caught[mon.sp] = 1;
    const toBox = party.length >= 6;
    if (toBox) F.toBox(mon); else party.push(mon);
    F.setFlag('daycare-hatched');
    const j = h.jingle('caught');
    await h.say(G.T('{mon} hatched from the Egg!'), { vars: { mon: G.Names.mon(mon.sp) } });
    await j;
    if (toBox) await h.say(G.T('There is no room in your party, so {mon} was sent to the PC.'), { vars: { mon: G.Names.mon(mon.sp) } });
    if (h.nickname) await h.nickname(mon);
  }

  return { MAX, list, full, canLeave, deposit, withdraw, grown, price, gain, step,
           MAX_EGGS, EGG_EVERY, BABIES, breeding, eggs, waiting, canBreed, compat, root, breed, odd, collect, eggSteps, hint, hatch, seed };
})();
