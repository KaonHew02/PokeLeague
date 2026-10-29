/* ============ render.js — drawing the overworld ============
 * Per frame, in world units (a tile is 32; G.Camera scales to the screen):
 *   1. the border kind outside every map (a repeating canvas from G.Tiles.border)
 *   2. the baked ground of the connected maps, then of this map (2 frames: water, flowers)
 *   3. Y-sorted: the strips of tall things (trees, buildings) row by row, items,
 *      people and the follower; tall grass draws its front tuft over feet
 *   4. emotes, the healing machine, then the warp fade over everything
 *
 *   G.WorldRender.prepare(map)   bakes the map and its neighbours (cached)
 *   G.WorldRender.draw(ctx, view, scene)
 *   G.WorldRender.extra          functions (ctx, scene) drawn in world units at the end (debug.js)
 */
G.WorldRender = (() => {
  const TS = 32, T = 16;
  const cache = new Map();            // map id -> baked graphics (most recent last)
  const MAX = 10;
  const extra = [];

  function gfx(m) {
    let g = cache.get(m.id);
    if (g && g.src === m) { cache.delete(m.id); cache.set(m.id, g); return g; }
    g = G.Tiles.bakeMap(m);
    g.src = m;
    cache.set(m.id, g);
    while (cache.size > MAX) cache.delete(cache.keys().next().value);
    return g;
  }

  /** Bakes a map now and its neighbours a little later, one at a time (no hitch on slow phones). */
  let pending = [];
  function prepare(m) {
    gfx(m);
    pending = G.Maps.neighbours(m).map(nb => nb.map);
    const next = () => {
      const nm = pending.shift();
      if (!nm) return;
      gfx(nm);
      setTimeout(next, 30);
    };
    setTimeout(next, 120);
  }

  let patternFor = null, pattern = null;
  function drawBorder(ctx, m, L, Tp, W, H) {
    const cv = G.Tiles.border(m);
    if (!cv) return;
    if (patternFor !== cv) { pattern = ctx.createPattern(cv, 'repeat'); patternFor = cv; }
    const PX = G.Sprites.PX;
    ctx.save();
    ctx.scale(PX, PX);
    ctx.fillStyle = pattern;
    const x0 = Math.floor(L / TS) * T - T, y0 = Math.floor(Tp / TS) * T - T;
    ctx.fillRect(x0, y0, W / PX + 3 * T, H / PX + 3 * T);
    ctx.restore();
  }

  // Emote bubbles and the items' ball, painted once.
  const bubbles = {};
  function bubble(ch) {
    if (bubbles[ch]) return bubbles[ch];
    const { Pix, pack, ascii } = G.Tiles;
    const P = Pix(12, 13);
    const ART = {
      '!': ['.oooooooooo.', 'owwwwwwwwwwo', 'owwwwrrwwwwo', 'owwwwrrwwwwo', 'owwwwrrwwwwo', 'owwwwrrwwwwo', 'owwwwwwwwwwo', 'owwwwrrwwwwo', 'owwwwwwwwwwo', '.oooowwoooo.', '....owo.....', '....oo......'],
      '?': ['.oooooooooo.', 'owwwwwwwwwwo', 'owwwbbbbwwwo', 'owwbbwwbbwwo', 'owwwwwbbwwwo', 'owwwwbbwwwwo', 'owwwwwwwwwwo', 'owwwwbbwwwwo', 'owwwwwwwwwwo', '.oooowwoooo.', '....owo.....', '....oo......'],
      '…': ['.oooooooooo.', 'owwwwwwwwwwo', 'owwwwwwwwwwo', 'owwwwwwwwwwo', 'owwwwwwwwwwo', 'owbbwbbwbbwo', 'owwwwwwwwwwo', 'owwwwwwwwwwo', 'owwwwwwwwwwo', '.oooowwoooo.', '....owo.....', '....oo......']
    };
    ascii(P, 0, 0, ART[ch] || ART['!'], { o: pack('#202028'), w: pack('#ffffff'), r: pack('#e83838'), b: pack('#3048a8') });
    return (bubbles[ch] = P.canvas());
  }

  /** A tiny Poké Ball for the healing machine (lit: flashing white). */
  const healBalls = {};
  function healBall(lit) {
    if (healBalls[lit]) return healBalls[lit];
    const { Pix, pack, ascii } = G.Tiles;
    const P = Pix(4, 4);
    ascii(P, 0, 0, ['.rr.', 'rrrr', 'owwo', '.ww.'], lit ? { r: pack('#ffffff'), w: pack('#ffffff'), o: pack('#fff4a0') } : { r: pack('#f04848'), w: pack('#f8f8f8'), o: pack('#202028') });
    return (healBalls[lit] = P.canvas());
  }

  function tuftAt(list, m, x, y, after) {
    if (G.Maps.kindAt(m, x, y) !== 'tall') return;
    const tuft = G.Tiles.sprite('tuft', m.palette in G.Tiles.PALETTES && !G.Tiles.PALETTES[m.palette].floor ? m.palette : 'kanto');
    list.push({ y: after + 0.02, draw: c => c.drawImage(tuft, x * TS, (y + 1) * TS - tuft.height * G.Sprites.PX, TS, tuft.height * G.Sprites.PX) });
  }

  /** A whirlpool: a dark eye and two white arms turning around it, in art pixels. */
  function whirl(ctx, cx, cy, t) {
    const PX = G.Sprites.PX;
    ctx.fillStyle = 'rgba(16,44,72,.45)';
    ctx.beginPath(); ctx.arc(cx, cy, 7 * PX, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(10,30,52,.6)';
    ctx.beginPath(); ctx.arc(cx, cy, 2.5 * PX, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(236,250,255,.85)';
    for (let arm = 0; arm < 2; arm++) for (let j = 0; j < 14; j++) {
      const a = -t * 3 + arm * Math.PI + j * 0.45, r = (1.5 + j * 0.4) * PX;
      ctx.fillRect(Math.round(cx + Math.cos(a) * r - PX / 2), Math.round(cy + Math.sin(a) * r - PX / 2), PX, PX);
    }
  }

  function draw(ctx, view, S) {
    const m = S.map, PX = G.Sprites.PX;
    const g = gfx(m);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.save();
    ctx.scale(G.Camera.scale, G.Camera.scale);
    G.Camera.apply(ctx);
    const L = G.Camera.left(), Tp = G.Camera.top(), W = G.Camera.w, H = G.Camera.h;
    drawBorder(ctx, m, L, Tp, W, H);
    const frame = Math.floor(performance.now() / 650) % 2;
    const maps = [{ m, ox: 0, oy: 0, g }];
    // Neighbours only when they reach into the view (with room for tall strips): far ones are not baked yet.
    const near = 4 * TS;
    for (const nb of G.Maps.neighbours(m)) {
      const x = nb.ox * TS, y = nb.oy * TS, w = nb.map.w * TS, h = nb.map.h * TS;
      if (x > L + W + near || y > Tp + H + near || x + w < L - near || y + h < Tp - near) continue;
      maps.push({ m: nb.map, ox: nb.ox, oy: nb.oy, g: gfx(nb.map) });
    }
    for (const it of maps) {
      const x = it.ox * TS, y = it.oy * TS, w = it.m.w * TS, h = it.m.h * TS;
      if (x > L + W || y > Tp + H || x + w < L || y + h < Tp) continue;
      ctx.drawImage(it.g.ground[frame], x, y, w, h);
    }
    // Doors that open with the Card Key: drawn while closed.
    if (m.kind.includes('keydoor')) {
      const kd = G.Tiles.sprite('keydoor', m.palette);
      m.kind.forEach((k, i) => {
        const x = i % m.w, y = (i / m.w) | 0;
        if (k === 'keydoor' && !G.World.keyOpen(x, y, m)) ctx.drawImage(kd, x * TS, y * TS, TS, TS);
      });
    }
    // Closed gates, pits a boulder filled, and the foam of fast water that is not calm yet.
    if (m.kind.includes('bars')) {
      const bars = G.Tiles.sprite('bars', m.palette);
      m.kind.forEach((k, i) => {
        const x = i % m.w, y = (i / m.w) | 0;
        if (k === 'bars' && !G.World.barsOpen(x, y, m)) ctx.drawImage(bars, x * TS, y * TS, TS, TS);
      });
    }
    if (m.kind.includes('pit')) {
      const plug = G.Tiles.sprite('plug', m.palette);
      m.kind.forEach((k, i) => {
        const x = i % m.w, y = (i / m.w) | 0;
        if (k === 'pit' && G.World.pitFilled(x, y, m)) ctx.drawImage(plug, x * TS, y * TS, TS, TS);
      });
    }
    if (m.kind.includes('rapids') && !G.World.calm(m)) {
      const t = performance.now() / 1000, flow = G.Maps.DIRS[m.def.flow || 'down'];
      ctx.fillStyle = 'rgba(236,250,255,.75)';
      m.kind.forEach((k, i) => {
        if (k !== 'rapids') return;
        const x = i % m.w, y = (i / m.w) | 0;
        for (let j = 0; j < 3; j++) {
          const ph = (t * 1.8 + j / 3 + ((x * 7 + y * 13) % 10) / 10) % 1;
          const along = ph * TS, across = 4 + ((j * 11 + x * 5 + y * 3) % 7) * 4;
          const px = flow[0] ? along * flow[0] + (flow[0] < 0 ? TS : 0) : across, py = flow[1] ? along * flow[1] + (flow[1] < 0 ? TS : 0) : across;
          ctx.fillRect(x * TS + px - (flow[0] ? 5 : 1), y * TS + py - (flow[1] ? 5 : 1), flow[0] ? 10 : 2, flow[1] ? 10 : 2);
        }
      });
    }
    // Whirlpools (Sea Route 41): a turning swirl, gone while Whirlpool has calmed one.
    if (m.kind.includes('whirlpool')) {
      const t = performance.now() / 1000;
      m.kind.forEach((k, i) => {
        const x = i % m.w, y = (i / m.w) | 0;
        if (k === 'whirlpool' && !(S.cut && S.cut.has(x + ',' + y))) whirl(ctx, x * TS + TS / 2, y * TS + TS / 2, t);
      });
    }
    // Stairs behind a poster (`secret` tiles): drawn once their warp is open.
    if (m.kind.includes('secret')) {
      const pass = G.Tiles.sprite('passage', m.palette);
      m.kind.forEach((k, i) => {
        if (k !== 'secret') return;
        const x = i % m.w, y = (i / m.w) | 0, w = m.warpAt.get(x + ',' + y);
        if (w && w.to && G.Field.test(w.if)) ctx.drawImage(pass, x * TS, y * TS, TS, TS);
      });
    }

    // Y-sorted things.
    const list = [];
    const r0 = Math.floor(Tp / TS) - 1, r1 = Math.ceil((Tp + H) / TS) + 4;
    for (const it of maps) {
      for (const [row, s] of Object.entries(it.g.strips)) {
        const wr = +row + it.oy;
        if (wr < r0 || wr > r1) continue;
        const cv = s.canvas;
        list.push({ y: (wr + 0.5) * TS - 0.5, draw: c => c.drawImage(cv, it.ox * TS, (wr + 1) * TS - cv.height * PX, cv.width * PX, cv.height * PX) });
      }
    }
    if (g.below && !m.connect.south) {
      const cv = g.below.canvas;
      list.push({ y: (m.h + 0.5) * TS - 0.5, draw: c => c.drawImage(cv, -TS, (m.h + 1) * TS - cv.height * PX, cv.width * PX, cv.height * PX) });
    }
    // Small trees Cut can clear (drawn here, not baked: they disappear when cut).
    const shrub = G.Tiles.sprite('shrub', G.Tiles.PALETTES[m.palette] && !G.Tiles.PALETTES[m.palette].floor ? m.palette : 'kanto');
    for (let ty = Math.max(0, r0); ty <= Math.min(m.h - 1, r1); ty++) for (let tx = 0; tx < m.w; tx++) {
      if (m.kind[ty * m.w + tx] !== 'cuttree' || (S.cut && S.cut.has(tx + ',' + ty))) continue;
      list.push({ y: (ty + 0.5) * TS, draw: c => c.drawImage(shrub, tx * TS, (ty + 1) * TS - shrub.height * PX, shrub.width * PX, shrub.height * PX) });
    }
    // Boulders (Strength): slide to their new tile; one pushed into a pit sinks out of sight.
    if (S.rocks && S.rocks.length) {
      const rock = G.Tiles.sprite('boulder', m.palette), now = performance.now();
      for (const r of S.rocks) {
        const k = Math.min(1, (now - r.t0) / 220);
        let s = 1;
        if (r.fall && now > r.fall) { s = 1 - (now - r.fall) / 260; if (s <= 0) continue; }
        const x = (r.px + (r.x - r.px) * k) * TS, y = (r.py + (r.y - r.py) * k) * TS;
        const w = rock.width * PX * s, hh = rock.height * PX * s;
        list.push({ y: (r.y + 0.5) * TS - 1, draw: c => c.drawImage(rock, x + (TS - w) / 2, y + TS - hh - (1 - s) * TS * 0.3, w, hh) });
      }
    }
    const ball = G.Tiles.sprite('ball');
    for (const it of S.items) {
      if (it.got || it.def.hidden) continue;
      const x = it.def.x, y = it.def.y;
      list.push({ y: (y + 0.5) * TS, draw: c => c.drawImage(ball, x * TS + (TS - ball.width * PX) / 2, (y + 1) * TS - (ball.height + 2) * PX, ball.width * PX, ball.height * PX) });
    }
    const people = S.actors.filter(a => a.visible);
    if (S.follower && S.follower.visible) people.push(S.follower);
    if (S.me) people.push(S.me);
    for (const a of people) {
      const key = a.wy + (a === S.me ? 0.01 : 0);
      list.push({ y: key, draw: c => a.draw(c) });
      if (a.lift()) continue;
      tuftAt(list, m, a.x, a.y, key);
      if (a.moving && (a.fx !== a.x || a.fy !== a.y)) tuftAt(list, m, a.fx, a.fy, key);
    }
    list.sort((a, b) => a.y - b.y);
    for (const it of list) it.draw(ctx);

    // The healing machine: one ball per Pokémon, flashing at the end.
    if (S.healFx) {
      const h = S.healFx, SOCK = [[2, 1], [6, 1], [10, 1], [2, 4], [6, 4], [10, 4]];
      const lit = h.flash && Math.floor(performance.now() / 140) % 2;
      const img = healBall(lit);
      for (let i = 0; i < h.n; i++) {
        const [sx, sy] = SOCK[i];
        ctx.drawImage(img, h.x * TS + sx * PX, h.y * TS + sy * PX, img.width * PX, img.height * PX);
      }
    }

    for (const a of S.emotes) {
      const b = bubble(a.emote.ch);
      const k = Math.min(1, (0.7 - a.emote.t) / 0.12 + 0.3);
      const w = b.width * PX * k, hh = b.height * PX * k;
      ctx.drawImage(b, Math.round(a.wx - w / 2), Math.round(a.headY - hh - 2), w, hh);
    }
    // The time of day (Johto): a wash of colour over the whole map.
    if (S.tint) {
      ctx.fillStyle = S.tint;
      ctx.fillRect(L - TS, Tp - TS, W + 2 * TS, H + 2 * TS);
    }
    // A dark cave: a small circle of light around the player (Flash lights it all).
    if (S.dark && S.me) {
      const cx = S.me.wx, cy = S.me.wy - TS / 2;
      const grad = ctx.createRadialGradient(cx, cy, TS * 1.3, cx, cy, TS * 2.4);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.97)');
      ctx.fillStyle = grad;
      ctx.fillRect(L - TS, Tp - TS, W + 2 * TS, H + 2 * TS);
    }
    for (const fn of extra) fn(ctx, S);
    ctx.restore();

    if (S.fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, S.fade)})`;
      ctx.fillRect(0, 0, view.w, view.h);
    }
  }

  return { prepare, draw, gfx, extra, clear: () => cache.clear() };
})();
