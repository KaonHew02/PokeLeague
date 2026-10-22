/* ============ stamps.js — buildings painted in code ============
 *   G.Stamps.get(type, door, { x, y }) -> { canvas, w, h, door:[dx, dy], solid, up }
 *     type   house | center | mart | gym | lab (footprints in G.Maps.STAMPS)
 *     door   the door's column inside the footprint (it is always on the bottom row)
 *     x, y   where the building stands: picks the roof colour of a house
 *   canvas is 16 px per tile; it is `up` px taller than the footprint (the
 *   roof sticks out above it). render.js draws it Y-sorted with the people,
 *   so walking behind a building hides you under the roof. solid[j][i] says
 *   which footprint tiles block (all but the door).
 *
 * The Center and the Mart carry icons (a Poké Ball, a shop bag), not letters,
 * so they read the same in every language.
 */
G.Stamps = (() => {
  const T = 16;
  const cache = {};
  const ROOFS = [['#c8584c', '#e0786a', '#8e3a34'], ['#4c74c4', '#6e94de', '#30508e'],
                 ['#5c9a54', '#7cb872', '#3c6c38'], ['#a8744c', '#c69466', '#74502e']];

  function spec(type) {
    switch (type) {
      case 'house': return { up: 10, roofH: 22, chimney: true, wall: ['#f2e8cc', '#d8ccae', '#a89a7c'], windows: 'house' };
      case 'center': return { up: 8, roofH: 22, roof: ['#e05058', '#f47a7a', '#a8323c'], wall: ['#f8f4ec', '#e0d8cc', '#b0a898'], windows: 'wide', emblem: 'ball', glass: true };
      case 'mart': return { up: 8, roofH: 18, roof: ['#4c78d0', '#7098ea', '#30529c'], wall: ['#f6f6f2', '#dcdcd8', '#a8a8a4'], windows: 'wide', emblem: 'bag', glass: true };
      case 'gym': return { up: 8, roofH: 30, roof: ['#8a7a68', '#a89886', '#5a4c40'], wall: ['#d4c8b4', '#b8ac96', '#887c68'], windows: 'none', emblem: 'badge', double: true };
      case 'lab': return { up: 10, roofH: 22, roof: ['#8c96a6', '#aab4c2', '#5e6878'], wall: ['#f4f6f6', '#dce0e2', '#a8aeb2'], windows: 'row' };
      default: return null;
    }
  }

  function get(type, door = 0, o = {}) {
    const S = G.Maps.STAMPS[Object.keys(G.Maps.STAMPS).find(k => G.Maps.STAMPS[k].type === type)];
    const sp = spec(type);
    if (!S || !sp) throw new Error('G.Stamps: unknown building ' + type);
    let roof = sp.roof;
    let ri = 0;
    if (!roof) { ri = Math.floor(G.U.hash(o.x | 0, o.y | 0, 77) * ROOFS.length); roof = ROOFS[ri]; }
    const k = type + '/' + door + '/' + ri;
    if (cache[k]) return cache[k];
    const canvas = paint(S, sp, roof, door);
    const solid = [];
    for (let j = 0; j < S.h; j++) { solid.push([]); for (let i = 0; i < S.w; i++) solid[j].push(!(i === door && j === S.h - 1)); }
    return (cache[k] = { canvas, w: S.w, h: S.h, door: [door, S.h - 1], solid, up: sp.up });
  }

  function paint(S, sp, roofCols, door) {
    const { pack, Pix } = G.Tiles;
    const W = S.w * T, CH = S.h * T + sp.up;
    const P = Pix(W, CH);
    const ink = pack('#202024');
    const R = roofCols.map(c => pack(c));
    const Wl = sp.wall.map(c => pack(c));
    const rh = sp.up + sp.roofH;                 // roof bottom (canvas y)

    // Walls, then the foundation.
    for (let y = rh; y < CH; y++) for (let x = 1; x < W - 1; x++) {
      let c = Wl[0];
      if (y >= CH - 3) c = Wl[2];
      else if (y >= CH - 5) c = Wl[1];
      else if (y < rh + 2) c = Wl[1];                    // shadow under the eaves
      P.set(x, y, c);
    }
    for (let y = rh; y < CH; y++) { P.set(0, y, ink); P.set(W - 1, y, ink); }
    for (let x = 0; x < W; x++) P.set(x, CH - 1, ink);

    // Roof: a hipped roof with rows of shingles.
    for (let y = 0; y < rh; y++) {
      const inset = Math.round(6 * (1 - y / (rh - 1)));
      for (let x = inset; x < W - inset; x++) {
        let c = (Math.floor((y + 1) / 3) % 2) ? R[0] : R[1];
        if ((y + 1) % 3 === 0) c = R[2];
        if (x === inset || x === W - inset - 1 || y === 0) c = ink;
        else if (y === rh - 1) c = ink;
        else if (y === rh - 2) c = R[2];
        else if (y === 1) c = R[1];
        P.set(x, y, c);
      }
    }
    if (sp.chimney) {
      const cx = W - 18;
      for (let y = 0; y < 9; y++) for (let x = cx; x < cx + 7; x++) {
        const c = x === cx || x === cx + 6 || y === 0 ? ink : (y % 3 === 2 ? pack('#8a5040') : pack('#b86a50'));
        P.set(x, y, c);
      }
    }

    // Windows.
    const glass = pack('#7ec4f0'), glassL = pack('#c8ecff'), frame = pack('#7a6044');
    const win = (x0, y0, w, h) => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let c = (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? frame : (x + y < 5 ? glassL : glass);
        if (x === (w >> 1) && y > 0 && y < h - 1) c = frame;
        P.set(x0 + x, y0 + y, c);
      }
    };
    const wy = rh + 4, wh = Math.min(10, CH - rh - 10);
    const cols = [];
    for (let i = 0; i < S.w; i++) if (i !== door) cols.push(i);
    if (sp.windows === 'house') for (const i of cols) win(i * T + 3, wy, 10, wh);
    else if (sp.windows === 'wide') {
      for (const i of cols) if (Math.abs(i - door) >= 1) win(i * T + 2, wy + 2, 12, wh - 2);
    } else if (sp.windows === 'row') for (const i of cols) win(i * T + 2, wy, 12, 8);

    // Door.
    const dx = door * T, dy = CH - T - 3, dh = T + 1;
    const dark = pack('#3a2a24'), wood = pack('#8a5a36'), woodL = pack('#a87448');
    if (sp.glass || sp.double) {
      const gl = sp.glass ? pack('#8ed0f4') : wood, gd = sp.glass ? pack('#5aa4d8') : dark;
      for (let y = 0; y < dh; y++) for (let x = 1; x < T - 1; x++) {
        let c = (x === 1 || x === T - 2 || y === 0) ? ink : x === 8 ? ink : (y < 4 ? gd : gl);
        if (sp.glass && x + y < 7 && x > 1) c = pack('#d4f0ff');
        P.set(dx + x, dy + y, c);
      }
    } else {
      for (let y = 0; y < dh; y++) for (let x = 3; x < 13; x++) {
        let c = (x === 3 || x === 12 || y === 0) ? ink : x < 6 ? woodL : wood;
        if (x === 10 && y === 9) c = pack('#f0d060');
        P.set(dx + x, dy + y, c);
      }
    }
    // Step in front of the door.
    for (let x = dx + 2; x < dx + 14; x++) { P.set(x, CH - 2, pack('#b0a898')); P.set(x, CH - 1, ink); }

    // Icons (no letters): Poké Ball for the Center, a bag for the Mart, a badge for gyms.
    const ex = dx + T / 2, ey = rh - (sp.emblem === 'badge' ? 16 : 12);
    if (sp.emblem === 'ball') ball(P, ex, ey + 3, 6);
    else if (sp.emblem === 'bag') bag(P, ex, rh + 1);
    else if (sp.emblem === 'badge') { ball(P, W / 2, ey + 2, 8); }
    return P.canvas();
  }

  function ball(P, cx, cy, r) {
    const { pack, disc } = G.Tiles;
    const red = pack('#f04848'), white = pack('#f8f8f8'), ink = pack('#202024');
    disc(P, cx - 0.5, cy - 0.5, r + 1, () => ink);
    disc(P, cx - 0.5, cy - 0.5, r, (x, y) => (y < cy - 1 ? red : y === cy - 1 ? ink : white));
    disc(P, cx - 0.5, cy - 0.5, 1.6, () => ink);
    P.set(cx - 1, cy - 1, white); P.set(cx, cy - 1, white);
  }

  /** The Mart's sign: a blue panel with a white shopping bag. */
  function bag(P, cx, top) {
    const { pack } = G.Tiles;
    const ink = pack('#202024'), blue = pack('#3c64c0'), white = pack('#f8f8f8');
    for (let y = 0; y < 11; y++) for (let x = -9; x <= 8; x++) P.set(cx + x, top + y, (y === 0 || y === 10 || x === -9 || x === 8) ? ink : blue);
    for (let y = 4; y < 9; y++) for (let x = -3; x <= 2; x++) P.set(cx + x, top + y, white);
    P.set(cx - 2, top + 3, white); P.set(cx + 1, top + 3, white); P.set(cx - 1, top + 2, white); P.set(cx, top + 2, white);
  }

  return { get };
})();
