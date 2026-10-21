/* ============ input.js — raw keyboard and mouse ============
 * Codes are the lowercased KeyboardEvent.code ('keyz', 'arrowup', 'space',
 * 'enter', 'escape', 'shiftleft'...). The game reads logical buttons through
 * G.Btn (buttons.js), which merges this with the gamepad and touch controls.
 */
G.Input = (() => {
  const down = new Set();
  const pressed = new Set();   // cleared every frame
  let mx = 0, my = 0;

  function code(e) { return (e.code || e.key || '').toLowerCase(); }
  const typing = e => !!(e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]'));

  addEventListener('keydown', e => {
    if (typing(e)) return;                       // name entry: let the field have the keys
    const c = code(e);
    if (!down.has(c)) pressed.add(c);
    down.add(c);
    // No page scrolling, and no native "click the focused button" on Space or
    // Enter: menus are driven by G.Nav, which would otherwise press twice.
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space', 'enter', 'numpadenter', 'tab', 'backspace'].includes(c)) e.preventDefault();
  });
  addEventListener('keyup', e => down.delete(code(e)));
  addEventListener('blur', () => down.clear());
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  return {
    held(c) { return down.has(c); },
    /** true only on the frame the key went down. */
    tap(c) { return pressed.has(c); },
    /** A press that does not come from the keyboard: counts as a key this frame. */
    virtual(c) { pressed.add(c); },
    mouse() { return { x: mx, y: my }; },
    endFrame() { pressed.clear(); }
  };
})();
