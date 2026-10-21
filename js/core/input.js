/* ============ input.js — raw keyboard and pointer (mouse, finger) ============
 * Codes are the lowercased KeyboardEvent.code ('keyw', 'arrowup', 'space',
 * 'enter', 'escape', 'shiftleft'...), plus 'mouseleft' and 'mouseright' for the
 * pointer buttons (a finger tap counts as 'mouseleft'). The game reads logical
 * buttons through G.Btn (buttons.js), which merges this with the controller.
 *
 * Clicks on the map (walk there, talk to someone) are read by the overworld
 * with G.Input.clicks(): every left click / tap of this frame inside the game
 * canvas, in canvas CSS pixels. Clicks on DOM menus are ordinary clicks.
 */
G.Input = (() => {
  const down = new Set();
  const pressed = new Set();   // cleared every frame
  const clickList = [];        // canvas clicks of this frame
  let mx = 0, my = 0;

  function code(e) { return (e.code || e.key || '').toLowerCase(); }
  const typing = e => !!(e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]'));
  const inGame = e => !!(e.target && e.target.closest && e.target.closest('#frame'));

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

  const BTN = { 0: 'mouseleft', 2: 'mouseright' };
  addEventListener('pointerdown', e => {
    mx = e.clientX; my = e.clientY;
    const c = BTN[e.button];
    if (!c || !inGame(e)) return;
    pressed.add(c); down.add(c);
    if (c === 'mouseleft' && e.target.id === 'game') {
      const r = e.target.getBoundingClientRect();
      clickList.push({ x: e.clientX - r.left, y: e.clientY - r.top, touch: e.pointerType === 'touch' });
    }
  });
  addEventListener('pointerup', e => { const c = BTN[e.button]; if (c) down.delete(c); });
  addEventListener('pointercancel', () => { down.delete('mouseleft'); down.delete('mouseright'); });
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  // Right click inside the game is "back", not the browser's menu.
  addEventListener('contextmenu', e => { if (inGame(e) && !typing(e)) e.preventDefault(); });

  return {
    held(c) { return down.has(c); },
    /** true only on the frame the key went down. */
    tap(c) { return pressed.has(c); },
    /** A press that does not come from the keyboard (the controller): counts as a key this frame. */
    virtual(c) { pressed.add(c); },
    mouse() { return { x: mx, y: my }; },
    /** Left clicks / taps on the game canvas this frame: [{ x, y, touch }] in canvas CSS pixels. */
    clicks() { return clickList; },
    endFrame() { pressed.clear(); clickList.length = 0; }
  };
})();
