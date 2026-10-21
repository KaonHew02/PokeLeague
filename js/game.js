/* ============ game.js — main loop and game modes ============
 * One full-frame <canvas id="game"> inside #frame; menus are DOM screens on
 * top of it (ui.js).
 *
 * The game is always in one MODE, registered by the module that owns it:
 *
 *   G.Game.define('overworld', { enter(arg), exit(), update(dt), render(ctx, view) })
 *   G.Game.setMode('overworld', arg)
 *
 * Modes: 'title' (here), 'overworld' (world/), 'battle' (ui/battle-ui.js),
 * 'evolve' (ui/evolve-ui.js)... While a DOM screen is open the buttons move
 * through it (G.Nav) and the mode's update() is called with { ui: true }
 * so it can keep animating without reacting to input.
 *
 * Each frame: controller poll → buttons → menus or mode update → render →
 * DOM sprites → end of input frame. Variable time step, capped at 1/30 s.
 */
G.Game = (() => {
  let cv, ctx, w = 0, h = 0, dpr = 1, last = 0;
  const modes = {};
  let modeName = null, mode = null;
  const view = { get w() { return w; }, get h() { return h; }, get dpr() { return dpr; } };

  function define(name, handler) { modes[name] = handler; }

  function setMode(name, arg) {
    if (!modes[name]) throw new Error('Unknown mode: ' + name);
    const prev = mode;
    if (prev && prev.exit) prev.exit();
    modeName = name; mode = modes[name];
    G.Btn.swallow();
    if (mode.enter) mode.enter(arg);
  }

  // ---------------- start-up ----------------

  function init() {
    cv = document.getElementById('game');
    ctx = cv.getContext('2d');
    resize();
    addEventListener('resize', resizeSoon);
    // iPhone reports rotation BEFORE relaying out the page: measure again
    // when the canvas really changes, and a little after each notice.
    addEventListener('orientationchange', resizeSoon);
    if (window.visualViewport) visualViewport.addEventListener('resize', resizeSoon);
    if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(cv);
    G.UI.init();
    last = performance.now();
    requestAnimationFrame(loop);
  }

  function resize() {
    // Internal resolution at most ×1.5: pixel art does not need more, and it
    // halves the work on ×2 and ×3 phone screens.
    const d = Math.min(1.5, window.devicePixelRatio || 1);
    const cw = cv.clientWidth, ch = cv.clientHeight;
    if (!cw || !ch) return;
    if (cw === w && ch === h && d === dpr && cv.width === Math.round(cw * d)) return;
    dpr = d; w = cw; h = ch;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    G.Camera.resize(w, h, dpr);
  }
  let resizeTs = [];
  function resizeSoon() {
    resize();
    resizeTs.forEach(clearTimeout);
    resizeTs = [100, 350, 800].map(ms => setTimeout(resize, ms));
  }

  // ---------------- loop ----------------

  let loopErrs = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    try { frame(ts); }
    catch (e) {
      if (loopErrs++ < 5) console.error('[Game] frame failed:', e);
      G.Input.endFrame();
    }
  }

  /** Buttons drive the top DOM screen, if there is one. -> true if a screen took them. */
  function menuInput() {
    const top = G.Nav.topScreen();
    if (!top || top.hasAttribute('data-noinput')) return false;
    for (const d of ['up', 'down', 'left', 'right']) if (G.Btn.repeat(d)) G.Nav.step(d);
    if (G.Btn.pressed('a')) G.Nav.press();
    else if (G.Btn.pressed('b') || G.Btn.pressed('start')) G.Nav.back();
    return true;
  }

  function frame(ts) {
    const real = (ts - last) / 1000 || 0;
    const dt = Math.min(1 / 30, real);
    last = ts;

    G.Pad.poll();
    G.Btn.update(dt);
    const ui = menuInput();
    if (mode && mode.update) mode.update(dt, { ui });

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (mode && mode.render) mode.render(ctx, view, dt);
    else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); }
    G.UI.tick(dt);

    G.Input.endFrame();
  }

  // ---------------- title backdrop ----------------
  // A strip of grass under a sky, with a few Pokémon strolling across.

  const Title = (() => {
    let walkers = [];
    const CAST = [1, 4, 7, 25, 16, 19, 133, 52, 39, 35];
    function enter() {
      walkers = [];
      for (let i = 0; i < 5; i++) spawn(G.U.rand(0, 1));
    }
    function spawn(at) {
      const dex = G.U.pick(CAST), right = Math.random() < 0.5;
      const a = new G.Sprites.Animator(dex, 1, Math.random() < 0.03);
      a.dir = right ? 2 : 6;
      a.loop('Walk');
      walkers.push({ a, right, x: at, y: G.U.rand(0.72, 0.9), v: G.U.rand(0.035, 0.06) });
    }
    function update(dt) {
      for (const k of walkers) {
        k.x += (k.right ? 1 : -1) * k.v * dt;
        k.a.update(dt);
      }
      const before = walkers.length;
      walkers = walkers.filter(k => k.x > -0.15 && k.x < 1.15);
      for (let i = walkers.length; i < before; i++) spawn(Math.random() < 0.5 ? -0.1 : 1.1);
    }
    function render(c, v) {
      const sky = c.createLinearGradient(0, 0, 0, v.h);
      sky.addColorStop(0, '#2c5fb8'); sky.addColorStop(0.55, '#8fc2f0'); sky.addColorStop(0.62, '#5aa84a'); sky.addColorStop(1, '#2f6e2f');
      c.fillStyle = sky; c.fillRect(0, 0, v.w, v.h);
      const k = Math.max(1, Math.round(G.Camera.scale));
      walkers.sort((p, q) => p.y - q.y);
      for (const m of walkers) {
        const x = m.x * v.w, y = m.y * v.h;
        m.a.scale = k / G.Sprites.PX * 1.5;
        G.Sprites.drawShadow(c, m.a.dex, x, y, m.a.scale);
        m.a.draw(c, x, y);
      }
    }
    return { enter, update, render };
  })();
  define('title', Title);

  return { init, define, setMode, view,
           get mode() { return modeName; }, get canvas() { return cv; }, get ctx() { return ctx; } };
})();
