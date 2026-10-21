/* ============ camera.js — view and world<->screen transform ============
 * The visible world is at least VIEW_W × VIEW_H world units whatever the
 * window size (15 × 10 tiles of 32 units), so every screen shows the same
 * amount of map. The overworld snaps the camera to the player each frame
 * (snap); follow() is the smoothed version, for cutscenes.
 */
G.Camera = {
  x: 0, y: 0,
  scale: 1,
  VIEW_W: 480,
  VIEW_H: 320,
  shake: 0,
  _sx: 0, _sy: 0,
  dpr: 1,
  w: 480, h: 320,

  /** Recomputes the scale for the canvas size (CSS pixels). */
  resize(cssW, cssH, dpr = 1) {
    this.dpr = dpr;
    this.scale = Math.min(cssW / this.VIEW_W, cssH / this.VIEW_H);
    this.w = cssW / this.scale;
    this.h = cssH / this.scale;
  },

  snap(x, y) { this.x = x; this.y = y; this._tickShake(1 / 60); },

  follow(tx, ty, dt) {
    this.x = G.U.damp(this.x, tx, 9, dt);
    this.y = G.U.damp(this.y, ty, 9, dt);
    this._tickShake(dt);
  },

  _tickShake(dt) {
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 2.4);
      const a = this.shake * 7;
      this._sx = G.U.rand(-a, a);
      this._sy = G.U.rand(-a, a);
    } else { this._sx = this._sy = 0; }
  },

  kick(amount) {
    if (G.Settings.get('calm')) amount *= 0.25;
    this.shake = Math.min(1.2, this.shake + amount);
  },

  /** Applies the camera transform to the context. */
  apply(ctx) {
    // Rounded to physical screen pixels: otherwise tiles show 1 px seams and
    // sprites shimmer while moving.
    const k = this.scale * this.dpr;
    ctx.translate(Math.round((-this.left() + this._sx) * k) / k,
                  Math.round((-this.top() + this._sy) * k) / k);
  },

  left() { return this.x - this.w / 2; },
  top() { return this.y - this.h / 2; },

  /** Is the point inside the view (with a margin)? */
  sees(x, y, pad = 60) {
    return x > this.left() - pad && x < this.left() + this.w + pad &&
           y > this.top() - pad && y < this.top() + this.h + pad;
  }
};
