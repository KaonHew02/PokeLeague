/* ============ stick.js — the on-screen joystick (phones and tablets) ============
 * A round base with a knob, drawn over the bottom-left corner of the game (upright: under the 3:2 frame).
 * Dragging the knob gives G.Btn a direction from the source 'touch' (buttons.js), the way a controller does,
 * so everything a direction does works with it: walking, doors, Surf, the Bicycle, menus. Four directions:
 * the larger of the two axes; nothing inside the dead zone (DEAD of the radius); dragged past the ring (RUN
 * times the radius) it also holds 'run', and the ring lights up (there is no B button on screen).
 * Its pointer events stop at it: they are never a tap on the map (G.Input) nor a tap on a dialog.
 * Shown only on a touch screen (G.Settings.touch), with the setting `stick` on (the default), while you walk:
 * the overworld, no screen open, no dialog or scene (G.World.locked). Hidden, it lets go of its direction.
 *
 *   G.Stick.init()      builds it (game.js)
 *   G.Stick.tick()      every frame: shown or hidden (game.js)
 *   G.Stick.dirOf(dx, dy, r) -> { dir: 'up' | 'down' | 'left' | 'right' | null, run }   (from the middle, radius r)
 */
G.Stick = (() => {
  const DEAD = 0.3, RUN = 1.3;

  /** The finger at (dx, dy) from the middle of a base of radius r. */
  function dirOf(dx, dy, r) {
    const d = Math.hypot(dx, dy);
    if (!(r > 0) || d < DEAD * r) return { dir: null, run: false };
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    return { dir, run: d > RUN * r };
  }

  let el = null, knob = null, shown = false;
  let finger = null;                          // { id, cx, cy, r } while a finger holds it
  let cur = { dir: null, run: false };

  /** What G.Btn gets from the joystick. */
  function apply(s) {
    if (s.dir === cur.dir && s.run === cur.run) return;
    G.Btn.clearSource('touch');
    if (s.dir) G.Btn.set('touch', s.dir, true);
    if (s.dir && s.run) G.Btn.set('touch', 'run', true);
    cur = s;
    if (el) el.classList.toggle('run', !!(s.dir && s.run));
  }
  function release() {
    finger = null;
    apply({ dir: null, run: false });
    if (knob) knob.style.transform = '';
  }
  function follow(e) {
    if (!finger || e.pointerId !== finger.id) return;
    const dx = e.clientX - finger.cx, dy = e.clientY - finger.cy, d = Math.hypot(dx, dy);
    const k = d > finger.r ? finger.r / d : 1;          // the knob stays inside the ring
    knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    apply(dirOf(dx, dy, finger.r));
  }

  function init() {
    if (el || typeof document === 'undefined') return;
    el = document.createElement('div');
    el.className = 'stick hidden';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('translate', 'no');
    knob = document.createElement('div');
    knob.className = 'stick-knob';
    el.appendChild(knob);
    document.body.appendChild(el);
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      const b = el.getBoundingClientRect();
      finger = { id: e.pointerId, cx: b.left + b.width / 2, cy: b.top + b.height / 2, r: b.width / 2 };
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* an old browser: it still follows inside the base */ }
      follow(e);
    });
    el.addEventListener('pointermove', e => { e.stopPropagation(); follow(e); });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      el.addEventListener(t, e => { e.stopPropagation(); if (finger && e.pointerId === finger.id) release(); });
    }
  }

  /** On a touch screen, with the setting on, while you walk (no screen, dialog or scene). */
  function wanted() {
    return !!(G.Settings && G.Settings.touch && G.Settings.get('stick') !== false
      && G.Game && G.Game.mode === 'overworld'
      && !(G.UI && G.UI.anyOpen && G.UI.anyOpen()) && !(G.World && G.World.locked));
  }
  function tick() {
    if (!el) return;
    const on = wanted();
    if (on === shown) return;
    shown = on;
    el.classList.toggle('hidden', !on);
    document.body.classList.toggle('has-stick', on);
    if (!on) release();
  }

  return { init, tick, dirOf, get shown() { return shown; } };
})();
