/* ============ buttons.js — logical buttons (keyboard + mouse + controller) ============
 * The game never reads keys directly: it asks for Game Boy style buttons.
 *
 *   button   keyboard / mouse                 controller
 *   up...    WASD / arrows                    D-pad / stick
 *   a        Space · Enter · E · Z            A
 *   b        X · Backspace · right click      B
 *   start    Esc · C                          Start · X
 *   select   V                                Back · Y   (the Bicycle, on and off)
 *   run      (held B or Shift)
 *
 * Walking by clicking the map and clicking menus are pointer things, read
 * elsewhere (G.Input.clicks(), ordinary DOM clicks). There are no on-screen
 * buttons: on a phone you tap where you want to go.
 *
 *   G.Btn.held('a') · G.Btn.pressed('start') (this frame only)
 *   G.Btn.repeat('down')   true on press, then every REPEAT s while held (menus)
 *   G.Btn.dir4()           the most recently pressed direction still held, or null
 *   G.Btn.set(source, button, on)   used by gamepad.js
 *
 * update() runs at the start of every frame (game.js), endFrame() at the end.
 */
G.Btn = (() => {
  const KEYS = {
    up: ['arrowup', 'keyw'], down: ['arrowdown', 'keys'], left: ['arrowleft', 'keya'], right: ['arrowright', 'keyd'],
    a: ['space', 'enter', 'numpadenter', 'keye', 'keyz'], b: ['keyx', 'backspace', 'mouseright'],
    start: ['escape', 'keyc'], select: ['keyv'], shift: ['shiftleft', 'shiftright']
  };
  const NAMES = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];
  const DIRS = ['up', 'down', 'left', 'right'];
  const DELAY = 0.38, REPEAT = 0.12;
  const sources = { pad: new Set() };
  let held = new Set(), prev = new Set(), pressed = new Set();
  const order = [];                         // held directions, oldest first
  const rep = {};                           // button -> seconds until it repeats
  const repHit = new Set();
  const muted = new Set();                  // held during swallow(): ignored until released

  function set(source, b, on) { if (sources[source]) sources[source][on ? 'add' : 'delete'](b); }
  function clearSource(source) { if (sources[source]) sources[source].clear(); }
  const isDown = b => KEYS[b].some(k => G.Input.held(k)) || sources.pad.has(b);

  function update(dt) {
    prev = held;
    held = new Set();
    pressed = new Set();
    repHit.clear();
    for (const b of NAMES) {
      const down = isDown(b);
      if (muted.has(b)) { if (!down) muted.delete(b); continue; }
      const tapped = KEYS[b].some(k => G.Input.tap(k));      // pressed and released within one frame
      if (down) held.add(b);
      if ((down && !prev.has(b)) || tapped) pressed.add(b);
    }
    for (const d of DIRS) {
      const i = order.indexOf(d);
      if (held.has(d) && i < 0) order.push(d);
      else if (!held.has(d) && i >= 0) order.splice(i, 1);
    }
    for (const b of NAMES) {
      if (pressed.has(b)) { rep[b] = DELAY; repHit.add(b); }
      else if (held.has(b)) { rep[b] -= dt; if (rep[b] <= 0) { rep[b] += REPEAT; repHit.add(b); } }
    }
  }

  return {
    update, set, clearSource,
    held: b => b === 'run' ? held.has('b') || KEYS.shift.some(k => G.Input.held(k)) : held.has(b),
    pressed: b => pressed.has(b),
    repeat: b => repHit.has(b),
    dir4: () => order.length ? order[order.length - 1] : null,
    /** Any button pressed this frame? (skip intros, "press any button") */
    any: () => pressed.size > 0,
    /** After a screen change: this frame's presses are used up, and A/B/Start/Select
     *  still held down count again only once released (a press is never used twice).
     *  Directions keep working, so you can keep walking through a door. */
    swallow() {
      pressed.clear(); repHit.clear();
      for (const b of ['a', 'b', 'start', 'select']) if (isDown(b) || held.has(b)) { muted.add(b); held.delete(b); }
    }
  };
})();
