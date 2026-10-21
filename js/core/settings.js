/* ============ settings.js — settings of this device ============
 * Stored in the browser, not in the save file: every PC or phone has its own.
 * The volume is stored separately by audio.js.
 *
 *   textSpeed    'slow' | 'mid' | 'fast'         dialog typewriter speed
 *   battleAnim   true/false                      move animations in battle
 *   battleStyle  'shift' | 'set'                 offer to switch after a foe faints
 *   follower     true/false                      lead Pokémon walks behind you
 *   gamepad      true/false                      play with a controller (gamepad.js)
 *   padRumble    true/false                      controller rumble
 *   calm         true/false                      less screen shake and flashing
 *
 *   G.Settings.get('textSpeed') · G.Settings.set('follower', false) · G.Settings.on(fn)
 */
G.Settings = (() => {
  const KEY = 'pl.settings';
  const DEF = { textSpeed: 'mid', battleAnim: true, battleStyle: 'shift', follower: true,
                gamepad: true, padRumble: true, calm: false };
  const s = Object.assign({}, DEF);
  try { Object.assign(s, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage can be blocked */ }
  const fns = new Set();
  const touchy = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage can be blocked */ } }
  function get(k) { return s[k]; }
  function set(k, v) { s[k] = v; save(); fns.forEach(fn => { try { fn(k, v); } catch (e) { console.error(e); } }); }

  return {
    get, set, DEF,
    on(fn) { fns.add(fn); },
    get all() { return Object.assign({}, s); },
    /** Is this a touch-first device (phone, tablet)? */
    get touch() { return touchy; }
  };
})();
