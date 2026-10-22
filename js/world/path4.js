/* ============ path4.js — grid paths with 4 neighbours (from PokéGo pathing.js) ============
 * Breadth-first search for click / tap to walk and for scripted walkTo.
 *
 *   G.Path4.find(from, goals, { open(x, y), ledge(x, y), max })
 *     from    { x, y }
 *     goals   [{ x, y, face? }]: any of them will do (the nearest one is taken)
 *     open    can someone stand on this tile? (may look past the map edge into a neighbour)
 *     ledge   the jump direction of a ledge tile, or null: a ledge is crossed in one
 *             2-tile hop, and only in its direction (downhill)
 *   -> { dirs:['up', 'up', 'left'...], goal, reached } or null if nothing is reachable.
 *   When no goal can be reached, `near: true` walks to the reachable tile closest
 *   to the first goal instead (reached = false).
 */
G.Path4 = (() => {
  const D4 = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];

  function find(from, goals, o = {}) {
    const open = o.open, ledge = o.ledge || (() => null);
    const max = o.max || 6000;
    const key = (x, y) => x + ',' + y;
    const want = new Map(goals.map(g => [key(g.x, g.y), g]));
    const prev = new Map([[key(from.x, from.y), null]]);
    const q = [[from.x, from.y]];
    let best = null, bestD = Infinity;
    const g0 = goals[0];
    for (let head = 0; head < q.length && head < max; head++) {
      const [x, y] = q[head];
      const k = key(x, y);
      if (want.has(k)) return { dirs: trace(prev, k), goal: want.get(k), reached: true };
      if (g0) {
        const d = Math.abs(x - g0.x) + Math.abs(y - g0.y);
        if (d < bestD) { bestD = d; best = k; }
      }
      for (const [dir, dx, dy] of D4) {
        let nx = x + dx, ny = y + dy;
        if (!open(nx, ny)) {
          // A ledge in this direction: hop over it.
          if (ledge(nx, ny) !== dir || !open(nx + dx, ny + dy)) continue;
          nx += dx; ny += dy;
        }
        const nk = key(nx, ny);
        if (prev.has(nk)) continue;
        prev.set(nk, [k, dir]);
        q.push([nx, ny]);
      }
    }
    if (o.near && best && best !== key(from.x, from.y)) {
      const [bx, by] = best.split(',').map(Number);
      return { dirs: trace(prev, best), goal: { x: bx, y: by }, reached: false };
    }
    return null;
  }

  function trace(prev, k) {
    const out = [];
    for (let p = prev.get(k); p; p = prev.get(p[0])) out.push(p[1]);
    return out.reverse();
  }

  /** 'UULLR' (script moves) -> ['up', 'up', 'left', 'left', 'right']. */
  function parse(s) {
    const M = { U: 'up', D: 'down', L: 'left', R: 'right' };
    return [...String(s).toUpperCase()].map(c => M[c]).filter(Boolean);
  }

  return { find, parse, D4 };
})();
