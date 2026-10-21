/* ============ rng.js — seeded random numbers ============
 * Everything that changes the game state (battles, encounters, IVs, shiny
 * rolls) draws from one of these, never from Math.random: the same seed and
 * the same choices always give the same result, so battles can be tested in
 * node and replayed.
 *
 *   const r = G.RNG(1234)
 *   r.next()          float in [0, 1)
 *   r.int(a, b)       integer in [a, b]
 *   r.chance(p)       true with probability p (0..1)
 *   r.pct(n)          true with probability n % (0..100)
 *   r.pick(list)      one element
 *   r.u16()           integer in [0, 65535] (capture shake checks)
 *   r.state / G.RNG(saved.state)   resume where it left off
 *
 * Algorithm: mulberry32 (32-bit state, fast, good enough for a game).
 */
G.RNG = function (seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    int(a, b) { return a + Math.floor(next() * (b - a + 1)); },
    chance(p) { return next() < p; },
    pct(n) { return next() * 100 < n; },
    pick(list) { return list[Math.floor(next() * list.length)]; },
    u16() { return Math.floor(next() * 65536); },
    get state() { return s; }
  };
};

/** A fresh seed for a new game or battle (the only place that may use Math.random). */
G.RNG.seed = () => (Math.random() * 4294967296) >>> 0;
