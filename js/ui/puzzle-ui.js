/* ============ puzzle-ui.js — a stone panel of the Ruins of Alph on screen ============
 *   await G.PuzzleUI.open({ id: 'kabuto', dex: 140 }) -> true once the picture is whole, false if you leave
 * Chapter 24. The rules are G.Puzzle (js/world/puzzle.js). The picture is a stone carving made
 * from the Pokémon's sprite (its first idle frame, facing you): the shape cut into a slab of
 * sandstone, inside a carved frame, with a scatter of small marks so that most pieces differ;
 * pieces that still look the same are interchangeable (G.Puzzle.solved's `same`).
 * A click (or A) on a piece picks it up; on another cell it puts it there, or swaps the two.
 * Back (B) puts a picked-up piece down again, or leaves. The board is kept in var puzzle:<id>,
 * so the pieces stay where you left them.
 */
G.PuzzleUI = (() => {
  const T = s => G.T(s);
  const Z = () => G.Puzzle;
  const SIZE = 64, PIECE = 16;
  // Sandstone, from the deepest groove to the brightest edge.
  const STONE = ['#6e5a3c', '#8a7350', '#b39a70', '#c8b088', '#d2bb93', '#e6d2aa', '#f0dfba'];
  let el = null, st = null;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-puzzle';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box pz-box"><div class="opt-head"><h3></h3><button class="btn small ghost" data-back></button></div>'
      + '<div class="pz-main"><div class="pz-board"></div><p class="pz-hint sub"></p></div></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('[data-back]').onclick = back;
    const board = el.querySelector('.pz-board');
    for (let i = 0; i < 36; i++) {
      const b = document.createElement('button');
      const x = i % 6, y = Math.floor(i / 6);
      b.className = 'pz-cell' + (x > 0 && y > 0 && x < 5 && y < 5 ? ' mid' : '');
      b.dataset.i = i;
      const cv = document.createElement('canvas');
      cv.width = cv.height = PIECE;
      b.appendChild(cv);
      b.onclick = () => pick(i);
      board.appendChild(b);
    }
  }

  // ---------------- the carving ----------------

  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const waitFor = s => new Promise(res => {
    const t0 = performance.now();
    (function check() { if (!s || s.ready || s.failed || performance.now() - t0 > 4000) res(); else setTimeout(check, 50); })();
  });

  /** The 64×64 carving of a Pokémon: -> { pieces: 16 canvases, same: a class number per piece }. */
  async function carve(dex, seed) {
    const rng = G.RNG(seed);
    const px = new Array(SIZE * SIZE);
    for (let i = 0; i < px.length; i++) { const r = rng.next(); px[i] = r < 0.12 ? 2 : r < 0.3 ? 4 : 3; }
    const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) px[y * SIZE + x] = v; };
    // The frame: a groove 3 px in, lit on its inner side.
    for (let k = 3; k <= SIZE - 4; k++) { set(k, 3, 1); set(3, k, 1); set(k, SIZE - 4, 1); set(SIZE - 4, k, 1); }
    for (let k = 4; k <= SIZE - 5; k++) { set(k, 4, 5); set(4, k, 5); }
    // The Pokémon: its first idle frame, scaled to fit, light parts raised and dark parts cut deep.
    const mask = new Uint8Array(SIZE * SIZE);
    const s = G.Sprites && G.Sprites.sheet(dex, 'Idle');
    await waitFor(s);
    const m = G.Sprites && G.Sprites.animMeta(dex, 'Idle');
    if (s && s.ready && m) {
      const tmp = document.createElement('canvas');
      tmp.width = m.w; tmp.height = m.h;
      const c = tmp.getContext('2d');
      c.drawImage(s.img, 0, 0, m.w, m.h, 0, 0, m.w, m.h);
      const d = c.getImageData(0, 0, m.w, m.h).data;
      let x0 = m.w, y0 = m.h, x1 = -1, y1 = -1;
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (d[(y * m.w + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (x1 >= 0) {
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1, k = Math.min(46 / bw, 46 / bh);
        const ox = Math.round((SIZE - bw * k) / 2), oy = Math.round((SIZE - bh * k) / 2);
        for (let ty = 0; ty < Math.ceil(bh * k); ty++) for (let tx = 0; tx < Math.ceil(bw * k); tx++) {
          const sx = x0 + Math.floor(tx / k), sy = y0 + Math.floor(ty / k);
          if (sx > x1 || sy > y1) continue;
          const j = (sy * m.w + sx) * 4;
          if (d[j + 3] <= 40) continue;
          const lum = (0.3 * d[j] + 0.59 * d[j + 1] + 0.11 * d[j + 2]) / 255;
          const X = ox + tx, Y = oy + ty;
          mask[Y * SIZE + X] = 1;
          px[Y * SIZE + X] = lum > 0.62 ? 5 : lum > 0.3 ? 4 : 2;
        }
        // The relief: lit from the top left.
        for (let y = 1; y < SIZE - 1; y++) for (let x = 1; x < SIZE - 1; x++) {
          if (!mask[y * SIZE + x]) continue;
          if (!mask[(y - 1) * SIZE + x] || !mask[y * SIZE + x - 1]) px[y * SIZE + x] = 6;
          else if (!mask[(y + 1) * SIZE + x] || !mask[y * SIZE + x + 1]) px[y * SIZE + x] = 0;
        }
      }
    }
    // Small marks carved around it, so that pieces of bare stone are told apart.
    const GLYPHS = [[[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 1], [2, 2]], [[0, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [2, 1], [1, 2]]];
    for (let n = 0, tries = 0; n < 22 && tries < 400; tries++) {
      const x = rng.int(6, SIZE - 9), y = rng.int(6, SIZE - 9), g = GLYPHS[rng.int(0, GLYPHS.length - 1)];
      if (g.some(([dx, dy]) => mask[(y + dy) * SIZE + x + dx] || mask[(y + dy + 1) * SIZE + x + dx + 1])) continue;
      for (const [dx, dy] of g) { set(x + dx, y + dy, 1); set(x + dx + 1, y + dy + 1, 5); }
      n++;
    }
    // Paint, then cut.
    const cv = document.createElement('canvas');
    cv.width = cv.height = SIZE;
    const c = cv.getContext('2d');
    const img = c.createImageData(SIZE, SIZE);
    const cols = STONE.map(hex);
    px.forEach((v, i) => { const [r, g, b] = cols[v]; img.data.set([r, g, b, 255], i * 4); });
    c.putImageData(img, 0, 0);
    const pieces = [], sig = [];
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('canvas');
      p.width = p.height = PIECE;
      const sx = (i % 4) * PIECE, sy = Math.floor(i / 4) * PIECE;
      p.getContext('2d').drawImage(cv, sx, sy, PIECE, PIECE, 0, 0, PIECE, PIECE);
      pieces.push(p);
      let h = '';
      for (let y = 0; y < PIECE; y++) for (let x = 0; x < PIECE; x++) h += px[(sy + y) * SIZE + sx + x];
      sig.push(h);
    }
    return { pieces, same: sig.map(h => sig.indexOf(h)) };
  }

  // ---------------- the board ----------------

  function render() {
    const cells = el.querySelectorAll('.pz-cell');
    cells.forEach((b, i) => {
      const p = st.board[i];
      const c = b.firstChild.getContext('2d');
      c.clearRect(0, 0, PIECE, PIECE);
      if (p >= 0) c.drawImage(st.art.pieces[p], 0, 0);
      b.classList.toggle('held', st.held === i);
      b.classList.toggle('empty', p < 0);
    });
    el.querySelector('.pz-box').classList.toggle('solved', !!st.done);
  }

  function pick(i) {
    if (!st || st.done) return;
    if (st.held == null) {
      if (st.board[i] < 0) return;
      st.held = i;
      G.Audio.sfx('select');
      render();
      return;
    }
    const from = st.held;
    st.held = null;
    const b = from === i ? null : Z().move(st.board, from, i);
    if (b) {
      st.board = b;
      G.Audio.sfx('click');
      G.Field.setVar('puzzle:' + st.id, Z().encode(b));
    }
    render();
    if (b && Z().solved(st.board, st.art.same)) {
      st.done = true;
      render();
      G.Audio.sfx('shine');
      setTimeout(() => finish(true), 1100);
    }
  }

  function back() {
    if (!st || st.done) return;
    if (st.held != null) { st.held = null; render(); return; }
    finish(false);
  }

  function finish(v) {
    if (!st) return;
    G.UI.close(el);
    const done = st.res;
    st = null;
    done(v);
  }

  /** Opens the panel of chamber `id` with the carving of Pokémon `dex`. -> solved? */
  async function open(o) {
    if (!el) build();
    const seed = [...o.id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const art = await carve(o.dex, seed);
    return new Promise(res => {
      const board = Z().decode(G.Field.getVar('puzzle:' + o.id)) || Z().fresh(seed);
      st = { id: o.id, board, art, held: null, done: false, res };
      el.querySelector('h3').textContent = T('Stone Panel');
      el.querySelector('[data-back]').textContent = T('Back');
      el.querySelector('.pz-hint').textContent = T('Pick up a piece, then choose where it goes. Put the picture back together in the middle.');
      render();
      G.UI.open(el, { onBack: back, focus: el.querySelector('.pz-cell') });
      // Already whole (a save made just as it was finished): done.
      if (Z().solved(board, art.same)) { st.done = true; render(); setTimeout(() => finish(true), 600); }
    });
  }

  return { open, carve };
})();
