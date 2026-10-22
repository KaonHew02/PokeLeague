/* ============ nav.js — moving through DOM menus with arrows, controller or D-pad ============
 * Every menu is ordinary HTML (buttons, .menu-item...). Nav keeps one of the
 * clickable elements of the screen on top "focused" (class pad-focus) and
 * moves that focus spatially: the nearest element in the pressed direction.
 * So no screen has to write its own keyboard handling.
 *
 *   G.Nav.step('down')     move the focus
 *   G.Nav.press()          click the focused element (A)
 *   G.Nav.back()           the screen's [data-back] button, else the onBack handler (B)
 *   G.Nav.focusFirst(el?)  focus el, or the screen's [data-first] / first element
 *   G.Nav.hide()           drop the focus ring (when the mouse or a finger is used)
 *
 * A screen is any visible `.scr` element; the one with the highest z-index
 * (the last one if tied) is the one being controlled.
 * Focus starts on [data-first], else the first .menu-item or button that is
 * not a back button. [data-pad] makes anything focusable.
 */
G.Nav = (() => {
  const NATIVE = 'button, a[href], input, select, textarea, [data-pad], .menu-item';
  let focus = null, focusScope = null, showing = false;

  // Back to the mouse or a finger: hide the ring (the focus stays for A).
  for (const ev of ['mousemove', 'pointerdown']) addEventListener(ev, e => {
    if (e.isTrusted && (ev === 'pointerdown' || e.movementX || e.movementY)) hide();
  });

  function topScreen() {
    let top = null, tz = -Infinity;
    for (const s of document.querySelectorAll('.scr:not(.hidden)')) {
      const z = parseInt(getComputedStyle(s).zIndex, 10) || 0;
      if (z >= tz) { tz = z; top = s; }
    }
    return top;
  }

  /** What can be pressed now on the top screen. */
  function candidates() {
    const top = topScreen();
    if (!top) return [];
    const out = [];
    const W = innerWidth, H = innerHeight;
    for (const el of top.querySelectorAll(NATIVE)) {
      if (el.disabled || el.closest('.hidden') || el.closest('[data-nonav]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.right < 0 || r.bottom < 0 || r.left > W || r.top > H) continue;
      if (out.some(o => o.contains(el))) continue;
      out.push(el);
    }
    return out;
  }

  const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const isBack = el => el.hasAttribute('data-back');

  function setFocus(el, ring = true) {
    if (focus) focus.classList.remove('pad-focus');
    focus = el;
    focusScope = topScreen();
    if (!el) return;
    if (ring) { el.classList.add('pad-focus'); showing = true; }
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
  }
  function hide() {
    if (focus) focus.classList.remove('pad-focus');
    showing = false;
  }

  function firstOf(list, scope) {
    const marked = scope && scope.querySelector('[data-first]');
    if (marked && list.includes(marked)) return marked;
    const rest = list.filter(el => !isBack(el));
    return (rest.length ? rest : list)[0] || null;
  }

  function valid() {
    return focus && focus.isConnected && focusScope === topScreen() && candidates().includes(focus);
  }

  function focusFirst(el) {
    const list = candidates();
    setFocus(el && list.includes(el) ? el : firstOf(list, topScreen()), showing);
  }

  function step(dir) {
    const [dx, dy] = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] }[dir];
    if (slide(dir)) return;
    // A screen may take a direction itself (an amount, a page): screen.onNavStep(dir, focused) -> true.
    const top = topScreen();
    if (top && typeof top.onNavStep === 'function' && top.onNavStep(dir, focus)) return;
    const list = candidates();
    if (!list.length) { hide(); return; }
    if (!valid()) { setFocus(firstOf(list, topScreen())); G.Audio.sfx('select'); return; }
    if (!showing) { setFocus(focus); return; }      // the first press only shows where you are
    const [fx, fy] = center(focus);
    let best = null, bs = Infinity;
    for (const el of list) {
      if (el === focus) continue;
      const [x, y] = center(el);
      const ax = x - fx, ay = y - fy;
      const main = ax * dx + ay * dy;              // progress in the pressed direction
      if (main <= 4) continue;
      const side = Math.abs(ax * dy - ay * dx);    // drift to the sides
      const s = main + side * 2.5;
      if (s < bs) { bs = s; best = el; }
    }
    // Vertical lists wrap around (bottom -> top), like the games' menus.
    if (!best && dy && focus.closest('.menu-list, [data-wrap]')) {
      const same = list.filter(el => el.parentElement === focus.parentElement);
      best = dy > 0 ? same[0] : same[same.length - 1];
      if (best === focus) best = null;
    }
    if (best) { setFocus(best); G.Audio.sfx('select'); }
  }

  /** Sliders (volume): left / right change the value. -> true if it did. */
  function slide(dir) {
    if (!valid() || !focus.matches('input[type=range]') || (dir !== 'left' && dir !== 'right')) return false;
    const r = focus, min = +r.min || 0, max = r.max === '' ? 100 : +r.max;
    const st = (+r.step || 1) * Math.max(1, Math.round((max - min) / 20 / (+r.step || 1)));
    const v = Math.max(min, Math.min(max, +r.value + (dir === 'right' ? st : -st)));
    if (v !== +r.value) {
      r.value = v;
      r.dispatchEvent(new Event('input', { bubbles: true }));
      r.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return true;
  }

  function press() {
    if (!valid()) { const list = candidates(); if (list.length) setFocus(firstOf(list, topScreen())); return; }
    const el = focus;
    if (el.matches('input[type=range]')) return;
    if (el.matches('input, textarea, select')) { el.focus(); return; }
    el.click();
  }

  /** B: the screen's back button; else its onBack handler (G.UI.onBack). */
  function back() {
    const top = topScreen();
    if (!top) return false;
    const btn = [...top.querySelectorAll('[data-back]')].find(b => b.getBoundingClientRect().width > 0 && !b.disabled);
    if (btn) { btn.click(); return true; }
    if (typeof top.onBack === 'function') { top.onBack(); return true; }
    return false;
  }

  return { step, press, back, focusFirst, hide, topScreen, candidates,
           get focused() { return valid() ? focus : null; }, get showing() { return showing; } };
})();
