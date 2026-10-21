/* ============ touchpad.js — on-screen D-pad and buttons for phones ============
 * Shown once the player touches the screen (body.touch). The buttons feed
 * G.Btn as source 'touch', so they work everywhere the keyboard does.
 *
 *   D-pad: one element split in four by the angle from its centre. The finger
 *          can slide from one direction to another without lifting.
 *   A / B: hold B to run.   START: opens the menu.
 *
 * Phone held upright: the game sits at the top and the controls below it,
 * like a Game Boy. Sideways: the controls go to the sides of the game.
 * The markup is #touchpad in dev.html; the layout lives in css/touch.css.
 */
G.TouchPad = (() => {
  let root = null;

  function init() {
    root = document.getElementById('touchpad');
    if (!root) return;
    addEventListener('pointerdown', e => { if (e.pointerType === 'touch') document.body.classList.add('touch'); }, { capture: true });
    if (G.Settings.touch) document.body.classList.add('touch');
    applySize();
    G.Settings.on(k => { if (k === 'touchSize') applySize(); });

    const dpad = root.querySelector('[data-dpad]');
    let dir = null;
    const setDir = d => {
      if (d === dir) return;
      if (dir) G.Btn.set('touch', dir, false);
      dir = d;
      if (dir) G.Btn.set('touch', dir, true);
      dpad.dataset.dir = dir || '';
    };
    const fromPoint = e => {
      const r = dpad.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(x, y) < r.width * 0.12) return null;      // dead centre
      return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
    };
    dpad.addEventListener('pointerdown', e => { e.preventDefault(); dpad.setPointerCapture(e.pointerId); setDir(fromPoint(e)); });
    dpad.addEventListener('pointermove', e => { if (dpad.hasPointerCapture(e.pointerId)) setDir(fromPoint(e)); });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) dpad.addEventListener(ev, () => setDir(null));

    for (const el of root.querySelectorAll('[data-btn]')) {
      const b = el.dataset.btn;
      const off = () => { G.Btn.set('touch', b, false); el.classList.remove('on'); };
      el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); G.Btn.set('touch', b, true); el.classList.add('on'); });
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, off);
    }
    // No long-press menus or double-tap zoom on the controls.
    root.addEventListener('contextmenu', e => e.preventDefault());
  }

  function applySize() {
    if (root) root.style.setProperty('--tp', String(G.Settings.get('touchSize') || 1));
  }

  /** Which controls make sense now: 'game' (overworld, battle text) or 'none' (DOM menus, which are tapped). */
  function show(mode) { if (root) root.dataset.mode = mode; }

  return { init, show };
})();
