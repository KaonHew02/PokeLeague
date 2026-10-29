/* ============ capture.js — catching (Generation 3 / 4 formula) ============
 *   G.Capture.roll({ max, hp, rate, ball, status, rng }) -> { shakes: 0..3, caught }
 *
 *   a = floor(floor((3·M − 2·H) · rate · ball) / (3·M)) · status
 *       status ×2 asleep / frozen, ×1.5 poisoned / paralysed / burned
 *   a ≥ 255 catches; otherwise b = floor(1048560 / floor(√floor(√floor(16711680 / a))))
 *   and four checks of a random 0..65535 < b: all four pass = caught.
 *   The ball wobbles once per check passed (at most three times on screen).
 *   A Master Ball (ball ≥ 255) always catches.
 *
 *   G.Capture.ballMod(item, { foe, mine, fishing }) -> { ball, rate }: the multiplier and the catch
 *   rate of one throw. Kurt's Apricorn Balls (chapter 23) follow HeartGold and SoulSilver:
 *     Level Ball ×2 / ×4 / ×8 when your Pokémon's level is above / over twice / over four times the
 *     wild one's; Lure Ball ×3 on a Pokémon hooked with a rod; Moon Ball ×4 on one that evolves with
 *     a Moon Stone; Fast Ball ×4 on one whose base Speed is 100 or more; Love Ball ×8 on your
 *     Pokémon's species of the other gender; Heavy Ball: the catch rate −20 under 102.4 kg, +20 /
 *     +30 / +40 from 102.4 / 204.8 / 307.2 kg; Friend Ball ×1 (what it catches starts at 200
 *     friendship, battle.js). Every other ball: its `ball` in item-effects.js.
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

  function ballMod(item, ctx) {
    const foe = ctx.foe, mine = ctx.mine, S = G.SPECIES[foe.sp];
    let ball = ((G.ITEM_FX || {})[item] || {}).ball || 1, rate = S.cr;
    if (item === 'level-ball') {
      const a = mine ? mine.lvl : 0, b = foe.lvl;
      ball = a > 4 * b ? 8 : a > 2 * b ? 4 : a > b ? 2 : 1;
    }
    else if (item === 'lure-ball') ball = ctx.fishing ? 3 : 1;
    else if (item === 'moon-ball') ball = (S.evo || []).some(e => e.item === 'moon-stone') ? 4 : 1;
    else if (item === 'fast-ball') ball = S.base[5] >= 100 ? 4 : 1;
    else if (item === 'love-ball') ball = mine && mine.sp === foe.sp && mine.gender && foe.gender && mine.gender !== foe.gender ? 8 : 1;
    else if (item === 'heavy-ball') {
      const w = S.w || 0;   // hectograms
      rate = Math.max(1, Math.min(255, rate + (w >= 3072 ? 40 : w >= 2048 ? 30 : w >= 1024 ? 20 : -20)));
    }
    return { ball, rate };
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

  return { roll, chance, value, ballMod, STATUS };
})();
