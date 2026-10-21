/* ============ ui.js — shared interface helpers ============
 * - Screens: any <section class="scr"> inside #frame. They stack: the last
 *   one opened is drawn on top and is the one G.Nav controls.
 *       G.UI.open('scr-party', { onBack })   G.UI.close('scr-party')   G.UI.closeAll()
 *   B (or Esc) on a screen presses its [data-back] button, else calls onBack.
 * - Animated PMD sprites inside DOM <canvas> elements (party, Pokédex...):
 *   registered here, animated by tick() from the game loop.
 * - Interface sounds by delegation: every .btn / .menu-item clicks by itself.
 * - toast(), typeChips().
 */
G.UI = (() => {
  const $ = id => document.getElementById(id);
  const stack = [];

  function open(id, opts = {}) {
    const el = typeof id === 'string' ? $(id) : id;
    const i = stack.indexOf(el);
    if (i >= 0) stack.splice(i, 1);
    stack.push(el);
    el.classList.remove('hidden');
    el.style.zIndex = String(20 + stack.length);
    if (opts.onBack !== undefined) el.onBack = opts.onBack;
    G.I18n.walk(el);
    // Wait for layout so the first item can be found and focused.
    requestAnimationFrame(() => { if (!el.classList.contains('hidden')) G.Nav.focusFirst(opts.focus); });
    return el;
  }
  function close(id) {
    const el = typeof id === 'string' ? $(id) : id;
    if (!el) return;
    el.classList.add('hidden');
    const i = stack.indexOf(el);
    if (i >= 0) stack.splice(i, 1);
    const top = stack[stack.length - 1];
    if (top) requestAnimationFrame(() => G.Nav.focusFirst(top.__lastFocus));
  }
  function closeAll() { while (stack.length) close(stack[stack.length - 1]); }
  function isOpen(id) { const el = $(id); return !!el && !el.classList.contains('hidden'); }
  /** Is any screen open? (the game world does not react to buttons then) */
  const anyOpen = () => stack.length > 0;

  // Remember the focused item of a screen when another one opens over it.
  document.addEventListener('click', e => {
    const scr = e.target.closest && e.target.closest('.scr');
    const it = e.target.closest && e.target.closest('button, .menu-item, [data-pad]');
    if (scr && it) scr.__lastFocus = it;
  }, true);

  let toastEl = null, toastT = 0;
  function toast(msg, ms = 2200) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('translate', 'no');
      ($('frame') || document.body).appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    clearTimeout(toastT);
    toastT = setTimeout(() => { toastEl.style.display = 'none'; }, ms);
  }

  /** Coloured type chips with the official type names. */
  function typeChips(types) {
    return types.map(t => `<span class="type" style="background:${G.U.TYPE_COLOR[t]}">${G.U.esc(G.Names.type(t))}</span>`).join('');
  }

  // ---------------- interface sounds ----------------

  const CLICKABLE = '.btn, .menu-item, [data-sfx]';
  function wireSounds() {
    document.addEventListener('click', e => {
      const el = e.target.closest && e.target.closest(CLICKABLE);
      if (!el) return;
      if (el.disabled) { G.Audio.sfx('error'); return; }
      if (el.dataset.sfx === 'none') return;
      G.Audio.sfx(el.matches('[data-back]') ? 'back' : el.dataset.sfx || 'click');
    }, true);
  }

  // ---------------- sprites in DOM canvases ----------------

  const live = new Set();
  const byCanvas = new WeakMap();
  // Only canvases on screen are animated.
  const seen = new WeakMap();
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => seen.set(e.target, e.isIntersecting)), { rootMargin: '80px' })
    : null;

  /**
   * Animates a Pokémon inside a <canvas>.
   * opts: { anim='Idle', dir=0, shiny, silhouette, shadow=true,
   *         scale=2  FIXED art pixel size, so every Pokémon in a view shares it
   *         hero     single-Pokémon view: may shrink the scale so it fits }
   */
  function sprite(cv, dex, opts = {}) {
    const prev = byCanvas.get(cv);
    if (prev) live.delete(prev);
    const a = new G.Sprites.Animator(dex, 1, !!opts.shiny);
    a.dir = opts.dir || 0;
    a.loop(opts.anim || 'Idle');
    const s = { cv, ctx: cv.getContext('2d'), a, dex, opts };
    live.add(s);
    byCanvas.set(cv, s);
    if (io) io.observe(cv);
    return s;
  }

  function tick(dt) {
    for (const s of live) {
      if (!s.cv.isConnected) { live.delete(s); if (io) io.unobserve(s.cv); continue; }
      if (s.cv.offsetParent === null) continue;            // hidden screen
      if (io && seen.get(s.cv) === false) continue;         // scrolled away
      s.a.update(dt);
      const { cv, ctx } = s;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.imageSmoothingEnabled = false;
      // Integer scale keeps the pixels crisp.
      const m = G.Sprites.animMeta(s.dex, 'Idle');
      const ay = m ? m.ay : 24;
      let k = s.opts.scale || 2;
      if (s.opts.hero) k = Math.max(1, Math.min(k, Math.floor(cv.height * 0.8 / ay)));
      s.a.scale = k / G.Sprites.PX;
      const big = ay * k > cv.height * 0.8;
      const fx = cv.width / 2, fy = big ? cv.height / 2 + ay * k * 0.45 : cv.height * 0.88;
      if (s.opts.shadow !== false && !s.opts.silhouette) {
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        ctx.beginPath(); ctx.ellipse(fx, fy, 9 * k, 3.4 * k, 0, 0, 6.2832); ctx.fill();
      }
      if (s.opts.silhouette) {
        ctx.save(); ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.55;
        s.a.draw(ctx, fx, fy);
        ctx.restore();
      } else s.a.draw(ctx, fx, fy);
    }
  }

  /** Creates a <canvas> with an animated sprite (for lists and grids). */
  function spriteCanvas(dex, w, h, opts) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    sprite(cv, dex, opts);
    return cv;
  }

  function init() { wireSounds(); }

  return { $, open, close, closeAll, isOpen, anyOpen, toast, typeChips, sprite, spriteCanvas, tick, init,
           get top() { return stack[stack.length - 1] || null; } };
})();
