/* ============ puzzle.js — the stone panels of the Ruins of Alph (rules, no screen) ============
 * Chapter 24. A 4×4 picture cut into 16 pieces, on a 6×6 board: the picture goes in the middle
 * (cells x, y = 1..4), and the pieces start on the outer ring of 20 cells (4 of them empty).
 * A move takes a piece to an empty cell, or swaps it with the piece there. The board is a list
 * of 36 cells, each a piece number (0..15, piece i belongs at x = 1 + i % 4, y = 1 + i / 4) or -1.
 *
 *   G.Puzzle.fresh(seed)             -> a scrambled board (the same seed, the same scramble)
 *   G.Puzzle.move(board, from, to)   -> the board after the move (a new list), or null if it is not one
 *   G.Puzzle.solved(board, same)     -> every cell of the middle holds its piece, or one that looks
 *                                       the same (`same[i]`: a class number per piece, from the drawing:
 *                                       two blank pieces of stone are interchangeable)
 *   G.Puzzle.home(i) -> the cell of piece i · G.Puzzle.RING: the 20 cells of the outer ring
 *   G.Puzzle.encode(board) / decode(text) -> a short text for the save (var puzzle:<id>), or null
 */
G.Puzzle = (() => {
  const N = 6;
  const home = i => (1 + Math.floor(i / 4)) * N + 1 + (i % 4);
  const RING = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (x === 0 || y === 0 || x === N - 1 || y === N - 1) RING.push(y * N + x);

  function fresh(seed) {
    const rng = G.RNG(seed);
    const cells = RING.slice();
    for (let i = cells.length - 1; i > 0; i--) { const j = rng.int(0, i); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    const board = new Array(N * N).fill(-1);
    for (let p = 0; p < 16; p++) board[cells[p]] = p;
    return board;
  }

  function move(board, from, to) {
    if (from === to || !(from >= 0 && from < N * N && to >= 0 && to < N * N) || board[from] < 0) return null;
    const b = board.slice();
    [b[from], b[to]] = [b[to], b[from]];
    return b;
  }

  function solved(board, same) {
    const cls = i => (same ? same[i] : i);
    for (let i = 0; i < 16; i++) {
      const p = board[home(i)];
      if (p < 0 || cls(p) !== cls(i)) return false;
    }
    return true;
  }

  const encode = board => board.map(p => (p < 0 ? '.' : p.toString(16))).join('');
  function decode(text) {
    if (typeof text !== 'string' || text.length !== N * N) return null;
    const b = [...text].map(c => (c === '.' ? -1 : parseInt(c, 16)));
    const seen = b.filter(p => p >= 0);
    return seen.length === 16 && new Set(seen).size === 16 && seen.every(p => p >= 0 && p < 16) ? b : null;
  }

  return { N, RING, home, fresh, move, solved, encode, decode };
})();
