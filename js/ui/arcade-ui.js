/* ============ arcade-ui.js — the Battle Arcade's roulette (chapter 92) ============
 *   await G.ArcadeUI.spin({ board, frames, random, rng, title })  -> the index of the panel it stopped on
 *     board    the 16 panels (G.Arcade.board): { p, who: 'me' | 'foe' | null }, drawn four by four
 *     frames   how many frames (30 a second) the cursor stays on a panel (G.Arcade.frames)
 *     random   the cursor jumps to a panel at random instead of moving on (the Random panel)
 *     rng      a seeded G.RNG: where the cursor starts, and where it jumps
 * Stop! (the button, A, B, or a tap on the board) stops the cursor where it is; after 30 seconds it stops by itself. The panel
 * it stopped on blinks, then the screen closes. game.js calls tick(dt) every frame, so G.Game.step drives it too.
 */
G.ArcadeUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s);
  const FPS = 30, AUTO = 900, BLINK = 1;
  let el = null, st = null;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-arcade';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box arc-box"><p class="arc-t"></p><div class="arc-grid"></div>'
      + '<div class="arc-foot"><span class="arc-key"></span><button class="btn arc-stop"></button></div></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('.arc-stop').onclick = stop;
    el.querySelector('.arc-grid').onclick = stop;
  }

  function render() {
    const cells = st.board.map((tile, i) => {
      const l = G.Arcade.label(tile), kind = tile.who || G.Arcade.PANELS[tile.p];
      return `<div class="arc-c k-${kind}" data-i="${i}"><b>${esc(l.name)}</b>${l.who ? `<i>${esc(l.who)}</i>` : ''}</div>`;
    });
    el.querySelector('.arc-grid').innerHTML = cells.join('');
    el.querySelector('.arc-t').textContent = st.title || '';
    el.querySelector('.arc-stop').textContent = T('Stop!');
    el.querySelector('.arc-key').innerHTML = [['me', T('Yours')], ['foe', T('Foe')], ['field', T('Field')], ['special', T('Special')]]
      .map(([k, s]) => `<span class="k-${k}">${esc(s)}</span>`).join('');
    mark();
  }
  function mark() {
    el.querySelectorAll('.arc-c').forEach((c, i) => {
      c.classList.toggle('on', i === st.at && !(st.stopped && Math.floor(st.blink * 8) % 2));
      c.classList.toggle('hit', st.stopped && i === st.at);
    });
  }

  function spin(o) {
    if (!el) build();
    st = { board: o.board, frames: Math.max(1, o.frames | 0), random: !!o.random, rng: o.rng, title: o.title,
           at: o.rng.int(0, o.board.length - 1), acc: 0, count: 0, total: 0, stopped: false, blink: 0, done: null };
    render();
    return new Promise(res => {
      st.done = res;
      G.UI.open(el, { onBack: stop, focus: el.querySelector('.arc-stop') });
    });
  }
  /** One frame: the cursor moves on (or jumps) every `frames` frames; once stopped, the panel blinks for a second. */
  function tick(dt) {
    if (!st || !st.done) return;
    if (st.stopped) {
      st.blink -= dt;
      if (st.blink <= 0) return finish();
      return mark();
    }
    st.acc += dt * FPS;
    while (st.acc >= 1 && !st.stopped) {
      st.acc -= 1;
      if (++st.count >= st.frames) { st.count = 0; st.at = st.random ? st.rng.int(0, st.board.length - 1) : (st.at + 1) % st.board.length; }
      if (++st.total >= AUTO) stop();
    }
    mark();
  }
  function stop() {
    if (!st || st.stopped) return;
    st.stopped = true;
    st.blink = BLINK;
    G.Audio.sfx('confirm');
    mark();
  }
  function finish() {
    const d = st.done, k = st.at;
    st = null;
    G.UI.close(el);
    if (d) d(k);
  }

  return { spin, tick, stop, get open() { return !!st; } };
})();
