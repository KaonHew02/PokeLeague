/* ============ sprites.js — Mystery Dungeon style Pokémon sprites (local files) ============
 * SpriteCollab sheets in assets/pokemon/{dex}/{Anim}.png (shiny: {dex}/s/),
 * geometry in G.SPRITE_META (js/data/sprites-meta.js, by tools/fetch_sprites.py).
 *
 *   columns = frames · rows = 8 directions
 *   0 Down · 1 DownRight · 2 Right · 3 UpRight · 4 Up · 5 UpLeft · 6 Left · 7 DownLeft
 *
 * In battle the foe faces 7 (DownLeft, its front) and your Pokémon 3
 * (UpRight, its back), like the classic games' layout.
 *
 * Each animation has its own frame size, so they are aligned by the ground
 * anchor (ax, ay): that pixel always lands on the entity's feet, and the
 * sprite does not jump when it switches from Walk to Attack.
 */
G.Sprites = (() => {
  /** World units per art pixel. Tiles and sprites share this scale. */
  const PX = 2;
  const sheets = new Map();          // "dex/Anim[/s]" -> {img, ready, failed}

  function meta(dex) { return (G.SPRITE_META && G.SPRITE_META[dex]) || null; }

  /**
   * White version of a sheet (hit flash). Built once per sheet with the
   * "source-in" composite: much cheaper than ctx.filter on every draw.
   */
  const whites = new WeakMap();
  function white(img) {
    let c = whites.get(img);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, c.width, c.height);
    whites.set(img, c);
    return c;
  }

  /** Is there a shiny version? (assets/pokemon/{dex}/s/) */
  function hasShiny(dex) { const m = meta(dex); return !!(m && m.sh); }

  function has(m, anim, shiny) { return !!m.a[anim] && !(shiny && m.sm && m.sm.includes(anim)); }

  function animName(dex, anim, shiny = false) {
    const m = meta(dex);
    if (!m) return null;
    shiny = shiny && !!m.sh;
    if (has(m, anim, shiny)) return anim;
    return has(m, 'Idle', shiny) ? 'Idle' : 'Walk';
  }

  /** Geometry of one animation (the shiny one only differs in rare cases). */
  function animMeta(dex, anim, shiny = false) {
    const m = meta(dex);
    if (!m) return null;
    const name = animName(dex, anim, shiny);
    if (shiny && m.sh && m.sa && m.sa[name]) return m.sa[name];
    return m.a[name] || null;
  }

  // At most this many sheets in memory: idle ones are released.
  const MAX_SHEETS = 160, IDLE_MS = 30000;
  function evict(now) {
    const old = [...sheets].filter(([, s]) => now - s.at > IDLE_MS).sort((a, b) => a[1].at - b[1].at);
    const drop = old.slice(0, Math.max(sheets.size - Math.floor(MAX_SHEETS * 0.75), 0));
    for (const [k, s] of drop) {
      sheets.delete(k);
      s.img.onload = s.img.onerror = null;
      s.img.src = '';                 // frees the decoded image
    }
  }

  function sheet(dex, anim, shiny = false) {
    const m = meta(dex);
    shiny = shiny && !!(m && m.sh);
    const name = animName(dex, anim, shiny);
    if (!name) return null;
    const k = dex + '/' + name + (shiny ? '/s' : '');
    let s = sheets.get(k);
    const now = Date.now();
    if (s) {
      s.at = now;
      // A failed download (bad connection) is retried later, with backoff.
      if (s.failed && performance.now() > s.retryAt) { s.failed = false; s.img.src = s.src + '?r=' + s.tries; }
      return s;
    }
    if (sheets.size >= MAX_SHEETS) evict(now);
    s = { ready: false, failed: false, img: new Image(), tries: 0, retryAt: 0, at: now,
          src: `assets/pokemon/${dex}/${shiny ? 's/' : ''}${name}.png` };
    s.img.onload = () => { s.ready = true; };
    s.img.onerror = () => { s.failed = true; s.retryAt = performance.now() + 1000 * Math.min(8, 2 ** s.tries++); };
    s.img.src = s.src;
    sheets.set(k, s);
    return s;
  }

  const ANIMS = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint'];

  /** Preloads every animation of these Pokémon (before a battle starts). */
  function preload(dexes, timeout = 8000, shiny = false) {
    const hs = [];
    for (const d of dexes) for (const a of ANIMS) { const s = sheet(d, a, shiny); if (s) hs.push(s); }
    return new Promise(res => {
      const t0 = performance.now();
      (function check() {
        if (hs.every(h => h.ready || h.failed) || performance.now() - t0 > timeout) return res();
        setTimeout(check, 50);
      })();
    });
  }

  /** Screen angle (atan2(dy,dx)) -> direction row 0..7. */
  function dirFromAngle(a) {
    return ((Math.round((Math.PI / 2 - a) / (Math.PI / 4)) % 8) + 8) % 8;
  }
  /** 'down' | 'right' | 'up' | 'left' -> direction row. */
  const DIR4 = { down: 0, right: 2, up: 4, left: 6 };

  /** Approximate visual height (to place things above the head). */
  function bodyHeight(dex, scale = 1) {
    const m = animMeta(dex, 'Idle');
    return (m ? m.ay : 24) * PX * scale;
  }

  /** Elliptical shadow under the feet, sized by PMD's ShadowSize. */
  function drawShadow(ctx, dex, x, y, scale = 1) {
    const m = meta(dex);
    const s = m ? m.s : 1;
    const rx = [5, 8, 12][G.U.clamp(s, 0, 2)] * PX * scale;
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, rx * 0.42, 0, 0, 6.2832);
    ctx.fill();
  }

  // ---------------- Animator ----------------

  /**
   * Plays one Pokémon's animations.
   *   loop(anim)        background animation (Idle / Walk); does not restart if already playing
   *   play(anim, opts)  one-shot animation (Attack, Shoot, Hurt...) shown over the
   *                     background one until it ends. opts: { speed, hold }
   *                     hold: stay on the last frame (Faint)
   */
  class Animator {
    constructor(dex, scale = 1, shiny = false) {
      this.dex = dex;
      this.shiny = shiny && hasShiny(dex);
      this.scale = scale;
      this.base = 'Idle';
      this.cur = 'Idle';
      this.frame = 0;
      this.t = 0;              // time inside the frame, in 1/60 s
      this.speed = 1;
      this.once = false;
      this.hold = false;
      this.done = false;
      this.dir = 0;
    }

    loop(anim, speed = 1) {
      this.base = anim;
      if (!this.once && this.cur !== anim) this._start(anim, false);
      if (!this.once) this.speed = speed;
    }

    play(anim, opts = {}) {
      this._start(anim, true);
      this.speed = opts.speed || 1;
      this.hold = !!opts.hold;
    }

    /** Is a one-shot animation still playing? */
    busy() { return this.once && !this.done; }

    /** Progress 0..1 of the current animation. */
    progress() {
      const m = animMeta(this.dex, this.cur, this.shiny);
      if (!m) return 1;
      let total = 0, before = 0;
      for (let i = 0; i < m.n; i++) { if (i < this.frame) before += m.d[i]; total += m.d[i]; }
      return total ? (before + this.t) / total : 1;
    }

    _start(anim, once) {
      this.cur = animName(this.dex, anim, this.shiny) || 'Idle';
      this.frame = 0; this.t = 0;
      this.once = once; this.done = false;
    }

    update(dt) {
      const m = animMeta(this.dex, this.cur, this.shiny);
      if (!m || this.done) return;
      this.t += dt * 60 * this.speed;
      while (this.t >= m.d[this.frame]) {
        this.t -= m.d[this.frame];
        this.frame++;
        if (this.frame >= m.n) {
          if (this.once) {
            if (this.hold) { this.frame = m.n - 1; this.done = true; return; }
            this._start(this.base, false);      // back to the background animation
            this.speed = 1;
            return;
          }
          this.frame = 0;
        }
      }
    }

    /** Draws with the feet at (x, y). opts: { flash, softFlash, alpha, color } */
    draw(ctx, x, y, opts = {}) {
      let m = animMeta(this.dex, this.cur, this.shiny);
      let s = sheet(this.dex, this.cur, this.shiny);
      const k = PX * this.scale;
      if (s && !s.ready) {
        // While this animation loads, show Idle if that one is ready.
        const idle = sheet(this.dex, 'Idle', this.shiny);
        if (idle && idle.ready) { s = idle; m = animMeta(this.dex, 'Idle', this.shiny); }
      }
      const frame = s === sheet(this.dex, this.cur, this.shiny) ? this.frame : 0;
      if (!m || !s || !s.ready) {
        // Fallback dot, in case the file is missing.
        ctx.fillStyle = opts.color || '#6b7a94';
        ctx.beginPath(); ctx.arc(x, y - 12 * k, 8 * k, 0, 6.2832); ctx.fill();
        return;
      }
      const row = Math.min(this.dir, m.r - 1);
      const alpha = opts.alpha == null ? 1 : opts.alpha;
      if (alpha <= 0) return;
      const sx = Math.min(frame, m.n - 1) * m.w, sy = row * m.h;
      const dx = Math.round(x - m.ax * k), dy = Math.round(y - m.ay * k);
      const prev = ctx.globalAlpha;
      if (alpha < 1) ctx.globalAlpha = prev * alpha;
      // Flash: fully white, or half white over the sprite (softFlash).
      if (!opts.flash || opts.softFlash) ctx.drawImage(s.img, sx, sy, m.w, m.h, dx, dy, m.w * k, m.h * k);
      if (opts.flash) {
        if (opts.softFlash) ctx.globalAlpha = prev * alpha * 0.55;
        ctx.drawImage(white(s.img), sx, sy, m.w, m.h, dx, dy, m.w * k, m.h * k);
      }
      ctx.globalAlpha = prev;
    }
  }

  return { PX, meta, hasShiny, white, animMeta, sheet, preload, dirFromAngle, DIR4, bodyHeight,
           drawShadow, Animator, ANIMS, get sheetCount() { return sheets.size; } };
})();
