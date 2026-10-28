/* ============ contest.js — G.Contest: the Bug-Catching Contest (chapter 14) ============
 * Held in the National Park (once a day, by the device's date). Your first Pokémon able to
 * battle takes part alone; you get 20 Sport Balls and 500 steps in the contest park (a map with
 * `contest: true` while flag contest-on: its own wild table, battles with that one Pokémon and
 * the Sport Balls only, no black-out). You keep one Pokémon you caught: a new catch may take its
 * place. At the end the judge scores it against three other entrants; the prize goes by place,
 * and the Pokémon is yours.
 *   save.contest = { uid, balls, steps, mon } while it runs (null otherwise)
 *   G.Contest.begin() · on() · entrant() · battler() (for the battle screen) · after(result) -> the mon caught, or null
 *   step() -> steps left · balls() · steps() · keep(mon) · kept() · score(mon)
 *   judge(rng, names, table) -> { all: [{ name, mon, score, me }] best first, place, mine }: the
 *       others catch from `table` (the contest park's [species, min, max, weight]) · finish() -> the kept mon
 * The scripts that talk (joining, a catch, the end, the prizes) are in content/johto/park.js.
 */
G.Contest = (() => {
  const BALL = 'sport-ball', BALLS = 20, STEPS = 500;
  /** Points for a rare find (Scyther and Pinsir most). */
  const RARE = { 123: 40, 127: 40, 12: 25, 15: 25, 49: 25, 48: 15, 46: 15, 11: 5, 14: 5 };

  const S = () => G.Field.save;
  const state = () => S().contest || null;
  const on = () => !!state() && G.Field.flag('contest-on');

  function begin() {
    const lead = G.Field.lead();
    if (!lead) return false;
    S().contest = { uid: lead.uid, balls: BALLS, steps: STEPS, mon: null };
    G.Field.setFlag('contest-on');
    return true;
  }
  const entrant = () => { const c = state(); return (c && G.Field.party().find(m => m.uid === c.uid)) || null; };

  // The bag the battle screen gets: only the Sport Balls (read back after the battle).
  let bag = null;
  function battler() {
    const c = state(), P = S().player, m = entrant();
    bag = { [BALL]: c.balls };
    return { name: P.name, id: P.id, party: m ? [m] : [], bag };
  }
  function after(r) {
    const c = state();
    if (c && bag) c.balls = bag[BALL] | 0;
    bag = null;
    return r && typeof r === 'object' && r.outcome === 'caught' ? r.mon || null : null;
  }

  function step() { const c = state(); c.steps = Math.max(0, (c.steps | 0) - 1); return c.steps; }
  const balls = () => (state() ? state().balls : 0);
  const steps = () => (state() ? state().steps : 0);
  const kept = () => (state() ? state().mon : null);
  function keep(mon) { state().mon = mon; }

  /** Level ×4, the IVs (up to 46), the HP left (up to 20) and how rare it is (up to 40). */
  function score(mon) {
    if (!mon) return 0;
    const iv = (mon.ivs || []).reduce((n, v) => n + v, 0);
    return mon.lvl * 4 + Math.floor(iv / 4) + Math.floor(20 * mon.hp / G.Mon.maxHp(mon)) + (RARE[mon.sp] || 0);
  }

  /** The other entrants catch a Pokémon of the same table; ties go to the player. */
  function judge(rng, names, table) {
    const mine = { name: S().player.name, mon: kept(), score: score(kept()), me: true };
    const total = table.reduce((n, r) => n + r[3], 0);
    const others = names.map(name => {
      let r = rng.int(1, total), row = table[table.length - 1];
      for (const t of table) { if ((r -= t[3]) <= 0) { row = t; break; } }
      const mon = G.Mon.create(row[0], rng.int(row[1], row[2]), { rng, wild: true });
      mon.hp = Math.max(1, Math.floor(G.Mon.maxHp(mon) * rng.int(30, 100) / 100));
      return { name, mon, score: score(mon), me: false };
    });
    const all = others.concat([mine]).sort((a, b) => b.score - a.score || (a.me ? -1 : b.me ? 1 : 0));
    return { all, place: all.indexOf(mine) + 1, mine };
  }

  function finish() {
    const c = state();
    S().contest = null;
    G.Field.clearFlag('contest-on');
    return c ? c.mon : null;
  }

  return { BALL, BALLS, STEPS, on, begin, entrant, battler, after, step, balls, steps, kept, keep, score, judge, finish };
})();
