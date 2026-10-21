/* ============ util.js — shared helpers ============
 * Creates the global G namespace. tools/build.js looks for the exact line
 * below and swaps it for a local `var G` when it wraps the published bundle.
 */
window.G = window.G || {};

G.U = {
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  /* Values read back from saves or imported files are cleaned with these
   * before use: a number is always a number and a text always a text. */
  int(v, max = 1e12) { return Number.isFinite(+v) && +v > 0 ? Math.min(max, Math.floor(+v)) : 0; },
  str(v, max = 64) { return typeof v === 'string' ? v.slice(0, max) : ''; },
  list(v, max = 50) { return Array.isArray(v) ? v.slice(0, max) : []; },
  lerp(a, b, t) { return a + (b - a) * t; },
  // Cosmetic randomness only (menus, sparkles). Anything that affects the
  // game state uses a seeded G.RNG instead (see rng.js).
  rand(a, b) { return a + Math.random() * (b - a); },
  randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); },
  /** Normalises a vector; returns [0,0] for a null one. */
  norm(x, y) { const m = Math.hypot(x, y); return m > 1e-6 ? [x / m, y / m] : [0, 0]; },
  /** Frame-rate independent smoothing. */
  damp(a, b, rate, dt) { return b + (a - b) * Math.exp(-rate * dt); },

  /** Deterministic 2D hash -> [0,1). Used to paint the same tile details every time. */
  hash(x, y, seed = 0) {
    // 32-bit integer maths with Math.imul: it is called for every pixel while
    // baking a map, and this keeps V8 on its fast path.
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  },

  /** "3:07" from seconds; "12:03:07" past an hour (play time). */
  hms(s) {
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
    const mm = String(m).padStart(h ? 2 : 1, '0'), ss = String(sec).padStart(2, '0');
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  },

  /** Escapes text for innerHTML. */
  esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); },

  /** Pokémon type colours (chips, HP of type icons, battle effects). */
  TYPE_COLOR: {
    normal: '#b0a99f', fire: '#ff7b3d', water: '#4b9bff', grass: '#5fcb6a',
    electric: '#ffd33d', ice: '#7fe0e0', fighting: '#e0533d', poison: '#b45ec4',
    ground: '#d6b25c', flying: '#9bb8ff', psychic: '#ff5f9e', bug: '#a3c43d',
    rock: '#bfa96b', ghost: '#7a6bc4', dragon: '#6b58ff', dark: '#6b5c52',
    steel: '#a8b8c4', fairy: '#ff9ed8'
  }
};
