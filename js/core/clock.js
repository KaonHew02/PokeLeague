/* ============ clock.js — the time of day (Johto) ============
 *   G.Clock.period() -> 'morning' | 'day' | 'night'   from the device's clock, as in the games:
 *                       morning 4:00-9:59, day 10:00-19:59, night 20:00-3:59
 *   G.Clock.isDay()  -> morning or day (an evolution "by day": Espeon)
 *   G.Clock.set(period | null)   pins the time (debug ?time=night, tests); null follows the clock
 * Johto's wild Pokémon change with it (encounter tables with `morning` / `night` slots), and so
 * does the light on its outdoor maps.
 */
G.Clock = (() => {
  const PERIODS = ['morning', 'day', 'night'];
  let forced = null;
  const hour = () => new Date().getHours();
  function period() {
    if (forced) return forced;
    const h = hour();
    return h >= 4 && h < 10 ? 'morning' : h >= 10 && h < 20 ? 'day' : 'night';
  }
  const isDay = () => period() !== 'night';
  function set(p) { forced = PERIODS.includes(p) ? p : null; }
  return { PERIODS, period, isDay, hour, set, get forced() { return forced; } };
})();
