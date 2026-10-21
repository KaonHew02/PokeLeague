/* ============ capture.js — catching (Generation 3 / 4 formula) ============
 *   G.Capture.roll({ max, hp, rate, ball, status, rng }) -> { shakes: 0..3, caught }
 *
 *   a = floor(floor((3·M − 2·H) · rate · ball) / (3·M)) · status
 *       status ×2 asleep / frozen, ×1.5 poisoned / paralysed / burned
 *   a ≥ 255 catches; otherwise b = floor(1048560 / floor(√floor(√floor(16711680 / a))))
 *   and four checks of a random 0..65535 < b: all four pass = caught.
 *   The ball wobbles once per check passed (at most three times on screen).
 *   A Master Ball (ball ≥ 255) always catches.
 */
G.Capture = (() => {
  const STATUS = { slp: 2, frz: 2, psn: 1.5, tox: 1.5, par: 1.5, brn: 1.5 };

  function value({ max, hp, rate, ball, status }) {
    const a = Math.floor(Math.floor((3 * max - 2 * hp) * rate * ball) / (3 * max));
    return Math.floor(a * (STATUS[status] || 1));
  }

  function roll(o) {
    if (o.ball >= 255) return { shakes: 3, caught: true };
    const a = value(o);
    if (a >= 255) return { shakes: 3, caught: true };
    if (a <= 0) return { shakes: 0, caught: false };
    const b = Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680 / a))))));
    let n = 0;
    while (n < 4 && o.rng.u16() < b) n++;
    return { shakes: Math.min(3, n), caught: n === 4 };
  }

  /** Exact probability of a catch (for tests and a future "catch chance" hint). */
  function chance(o) {
    if (o.ball >= 255) return 1;
    const a = value(o);
    if (a >= 255) return 1;
    if (a <= 0) return 0;
    const b = Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680 / a))))));
    return Math.pow(Math.min(1, b / 65536), 4);
  }

  return { roll, chance, value, STATUS };
})();
