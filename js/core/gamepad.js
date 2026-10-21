/* ============ gamepad.js — controllers (Xbox, PlayStation, Switch...) ============
 * Gamepad API with the "standard" mapping (almost every controller). The
 * buttons feed G.Btn (buttons.js) as source 'pad', so the controller does
 * everything the keyboard does:
 *
 *   D-pad / left stick  directions      A  a      B  b (hold to run)
 *   Start / X           start           Back / Y   select
 *
 * Turned on or off in Options ('gamepad'); rumble with 'padRumble'.
 */
G.Pad = (() => {
  const DEAD = 0.45;
  const BT = { A: 0, B: 1, X: 2, Y: 3, BACK: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
  let name = '';

  const enabled = () => G.Settings.get('gamepad') !== false;
  function pad() {
    if (!navigator.getGamepads) return null;
    for (const p of navigator.getGamepads()) if (p && p.connected) return p;
    return null;
  }

  addEventListener('gamepadconnected', e => {
    name = e.gamepad.id || '';
    if (enabled() && G.UI && G.UI.toast) G.UI.toast(G.T('Controller connected'), 2200);
  });
  addEventListener('gamepaddisconnected', () => { if (!pad()) { name = ''; G.Btn.clearSource('pad'); } });

  /** Called by the game loop before G.Btn.update(). */
  function poll() {
    const p = enabled() ? pad() : null;
    G.Btn.clearSource('pad');
    if (!p) return;
    if (!name) name = p.id || '';
    const on = i => { const b = p.buttons[i]; return !!(b && (b.pressed || b.value > 0.5)); };
    const x = p.axes[0] || 0, y = p.axes[1] || 0;
    // The stick picks one of four directions (the stronger axis).
    const ax = Math.abs(x) > Math.abs(y);
    if (on(BT.UP) || (!ax && y < -DEAD)) G.Btn.set('pad', 'up', true);
    if (on(BT.DOWN) || (!ax && y > DEAD)) G.Btn.set('pad', 'down', true);
    if (on(BT.LEFT) || (ax && x < -DEAD)) G.Btn.set('pad', 'left', true);
    if (on(BT.RIGHT) || (ax && x > DEAD)) G.Btn.set('pad', 'right', true);
    if (on(BT.A)) G.Btn.set('pad', 'a', true);
    if (on(BT.B)) G.Btn.set('pad', 'b', true);
    if (on(BT.START) || on(BT.X)) G.Btn.set('pad', 'start', true);
    if (on(BT.BACK) || on(BT.Y)) G.Btn.set('pad', 'select', true);
  }

  /** Rumble (0..1 strength, ms), if the controller and the setting allow it. */
  function rumble(k, ms = 120) {
    if (!enabled() || G.Settings.get('padRumble') === false) return;
    const p = pad(), a = p && p.vibrationActuator;
    if (!a || !a.playEffect) return;
    k = Math.max(0, Math.min(1, k));
    a.playEffect('dual-rumble', { duration: ms, strongMagnitude: k, weakMagnitude: Math.min(1, k * 1.3) }).catch(() => {});
  }

  return { poll, rumble, get name() { return pad() ? name || 'Controller' : ''; } };
})();
