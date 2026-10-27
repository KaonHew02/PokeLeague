/* ============ player.js — people on the grid, and the player's controls ============
 * G.Actor: anyone who stands on a tile and steps between tiles (the player,
 * NPCs, trainers, the follower Pokémon). (x, y) is the tile it occupies; while
 * stepping, (fx, fy) is the tile it comes from. Drawn with people.js, or with
 * a PMD sprite when it is a Pokémon (mon: dex).
 *
 * G.Player: reads the buttons and the clicks and moves the player's actor:
 *   - 4-direction steps at 4 tiles/s, 8 when running (B or Shift held), 11 on the Bicycle
 *     (Select gets on and off it); on Cycling Road's slope you roll downhill when you let go
 *   - a short press turns on the spot; holding it walks
 *   - bumping into something plays the bump sound and walks in place
 *   - ledges: a 2-tile hop with a shadow, only in the ledge's direction
 *   - click / tap on the map: walk there along a G.Path4 path (the same rules
 *     on every step); on a person, sign or item: walk next to it, face it, press A.
 *     Any key or a new click cancels the walk.
 * The rules of the world (what blocks, warps, encounters, trainers) are G.World's.
 */
G.Actor = class Actor {
  constructor(o = {}) {
    this.id = o.id || null;
    this.who = o.who || null;          // people.js archetype
    this.mon = o.mon || 0;             // dex number: drawn with a PMD sprite
    this.ride = 0;                     // dex number of the Pokémon carrying it over water (Surf)
    this.rideAnim = null;
    this.bike = 0;                     // on a Bicycle: 1 (red frame) or 2 (pink frame)
    this.shiny = !!o.shiny;
    this.x = o.x | 0; this.y = o.y | 0;
    this.fx = this.x; this.fy = this.y;
    this.dir = o.dir || 'down';
    this.t = 1;                        // step progress 0..1 (1 = standing)
    this.dur = 0.25;
    this.hop = false;
    this.steps = 0;
    this.bumpT = 0;                    // walking in place (bumping into a wall)
    this.visible = o.visible !== false;
    this.emote = null;                 // { ch, t }
    this.def = o.def || null;          // its map entry (npcs / trainers)
    this.queue = [];                   // scripted steps
    this.anim = null;
    this.home = { x: this.x, y: this.y };
    this.wait = 1 + Math.random() * 2;
  }

  get moving() { return this.t < 1; }
  /** World position of the feet (centre of the tile, lerped while stepping). */
  get wx() { const T = G.Maps.TS; return (G.U.lerp(this.fx, this.x, this.ease()) + 0.5) * T; }
  get wy() { const T = G.Maps.TS; return (G.U.lerp(this.fy, this.y, this.ease()) + 0.5) * T; }
  ease() { return this.t >= 1 ? 1 : this.t; }

  face(dir) { if (dir) this.dir = dir; }

  /** Starts one step (or a 2-tile hop) towards dir; speed in tiles per second. */
  step(dir, speed = 4, hop = false) {
    const [dx, dy] = G.Maps.DIRS[dir];
    this.dir = dir;
    this.fx = this.x; this.fy = this.y;
    const n = hop ? 2 : 1;
    this.x += dx * n; this.y += dy * n;
    this.t = 0;
    this.hop = hop;
    this.dur = hop ? 0.5 : 1 / speed;
    this.steps++;
    this.bumpT = 0;
  }

  /** Puts it on a tile at once. */
  place(x, y, dir) {
    this.x = this.fx = x; this.y = this.fy = y;
    this.t = 1; this.hop = false;
    if (dir) this.dir = dir;
  }

  /** Advances the step. -> true on the frame it arrives. */
  update(dt) {
    if (this.emote && (this.emote.t -= dt) <= 0) { const e = this.emote; this.emote = null; if (e.done) e.done(); }
    if (this.anim) this.anim.update(dt);
    if (this.rideAnim) this.rideAnim.update(dt);
    if (this.t >= 1) return false;
    this.t = Math.min(1, this.t + dt / this.dur);
    if (this.t >= 1) { this.fx = this.x; this.fy = this.y; this.hop = false; return true; }
    return false;
  }

  /** Walking frame: 0 standing, 1 / 2 a foot forward (they alternate step by step). */
  frame() {
    if (this.bumpT > 0) return Math.floor(this.bumpT * 4) % 2 ? (Math.floor(this.bumpT * 2) % 2 ? 1 : 2) : 0;
    if (this.t >= 1 || this.hop) return 0;
    return this.t < 0.6 ? (this.steps % 2 ? 1 : 2) : 0;
  }

  /** Height of a ledge hop in world units. */
  lift() { return this.hop ? Math.sin(Math.PI * this.t) * 12 * G.Sprites.PX : 0; }

  draw(ctx) {
    if (!this.visible) return;
    const PX = G.Sprites.PX;
    const x = Math.round(this.wx), y = Math.round(this.wy);
    const lift = this.lift();
    if (this.mon) {
      if (!this.anim || this.anim.dex !== this.mon) { this.anim = new G.Sprites.Animator(this.mon, 1, this.shiny); this.anim.loop('Idle'); }
      const a = this.anim;
      a.dir = G.Sprites.DIR4[this.dir];
      a.loop(this.moving || this.bumpT > 0 ? 'Walk' : 'Idle');
      const fy = y + 8;
      G.Sprites.drawShadow(ctx, this.mon, x, fy, 1);
      a.draw(ctx, x, fy - lift);
      return;
    }
    const fy = y + G.Maps.TS / 2 - PX;
    // Surfing: the Pokémon swims under the player, who sits on its back.
    if (this.ride) {
      if (!this.rideAnim || this.rideAnim.dex !== this.ride) { this.rideAnim = new G.Sprites.Animator(this.ride, 1); this.rideAnim.loop('Idle'); }
      const r = this.rideAnim;
      r.dir = G.Sprites.DIR4[this.dir];
      r.loop(this.moving ? 'Walk' : 'Idle');
      const bob = Math.sin(performance.now() / 260) * PX;
      r.draw(ctx, x, y + 10 + bob);
      G.People.draw(ctx, this.who, this.dir, 0, x, fy - 9 * PX + bob, PX);
      return;
    }
    // A swimmer (npc / trainer `swim`): only the head and shoulders show above the water.
    if (this.def && this.def.swim) {
      const bob = Math.sin(performance.now() / 300 + this.x * 1.7) * PX * 0.6;
      const line = Math.round(fy - 4 * PX + bob);
      ctx.save();
      ctx.beginPath(); ctx.rect(x - 10 * PX, line - 24 * PX, 20 * PX, 24 * PX); ctx.clip();
      G.People.draw(ctx, this.who, this.dir, 0, x, line + 10 * PX, PX);
      ctx.restore();
      ctx.strokeStyle = 'rgba(232,248,255,.85)'; ctx.lineWidth = PX;
      ctx.beginPath(); ctx.ellipse(x, line, 7 * PX, 1.8 * PX, 0, 0, 6.2832); ctx.stroke();
      return;
    }
    if (this.bike) { this.drawBike(ctx, x, fy - lift, PX, lift); return; }
    ctx.fillStyle = lift ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(x, fy - 1, (lift ? 6 : 7) * PX, 2.2 * PX, 0, 0, 6.2832); ctx.fill();
    G.People.draw(ctx, this.who, this.dir, this.frame(), x, fy - lift, PX);
  }

  /** On the Bicycle: wheels and frame under the rider, who pedals while moving. */
  drawBike(ctx, x, fy, PX, lift) {
    const side = this.dir === 'left' || this.dir === 'right', s = this.dir === 'left' ? -1 : 1;
    const tyre = '#26262e', rim = '#c4c8d2', frame = this.bike === 2 ? '#e2629e' : '#d63838';
    const pedal = this.moving ? (this.steps % 2 ? 1 : 2) : 0;
    ctx.fillStyle = lift ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(x, fy + lift - 1, (side ? 9 : 4) * PX, 2 * PX, 0, 0, 6.2832); ctx.fill();
    const wheel = (cx, cy, rx, ry) => {
      ctx.fillStyle = tyre; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = rim; ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(0.5 * PX, rx - 1.2 * PX), Math.max(0.5 * PX, ry - 1.2 * PX), 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = tyre; ctx.fillRect(cx - PX / 2, cy - PX / 2, PX, PX);
    };
    const line = (pts, color, w) => {
      ctx.strokeStyle = color; ctx.lineWidth = w * PX; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(x + px * PX, fy + py * PX) : ctx.moveTo(x + px * PX, fy + py * PX))); ctx.stroke();
    };
    if (side) {
      wheel(x - s * 5 * PX, fy - 3.5 * PX, 3.5 * PX, 3.5 * PX);
      wheel(x + s * 5 * PX, fy - 3.5 * PX, 3.5 * PX, 3.5 * PX);
      line([[-s * 5, -3.5], [-s * 1, -8.5], [s * 4, -8.5], [s * 5, -3.5]], frame, 1.4);
      line([[-s * 1, -8.5], [0, -3.5], [-s * 5, -3.5]], frame, 1.4);
      G.People.draw(ctx, this.who, this.dir, pedal, x - s * PX, fy - 3 * PX, PX);
      line([[s * 4, -8.5], [s * 3, -12.5], [s * 1.5, -12.5]], tyre, 1);
      return;
    }
    // From the front or the back: the far wheel and the handlebar hide behind the rider.
    const bar = () => { line([[-5, -12], [5, -12]], tyre, 1); line([[0, -12], [0, -6]], frame, 1.4); };
    if (this.dir === 'up') {
      bar();
      G.People.draw(ctx, this.who, this.dir, pedal, x, fy - 3 * PX, PX);
      wheel(x, fy - 3.5 * PX, 1.6 * PX, 3.8 * PX);
      line([[0, -7.5], [0, -10]], frame, 1.4);
      return;
    }
    wheel(x, fy - 6 * PX, 1.4 * PX, 3 * PX);
    G.People.draw(ctx, this.who, this.dir, pedal, x, fy - 3 * PX, PX);
    wheel(x, fy - 3.5 * PX, 1.6 * PX, 3.8 * PX);
    bar();
  }

  /** The top of the head (for emotes). */
  get headY() {
    const sunk = this.def && this.def.swim ? 6 * G.Sprites.PX : 0;
    return this.wy + G.Maps.TS / 2 - (this.mon ? G.Sprites.bodyHeight(this.mon) : G.People.H * G.Sprites.PX) - this.lift() + sunk;
  }
};

G.Player = (() => {
  const WALK = 4, RUN = 8, BIKE = 11, TURN = 0.09;
  let turned = false, holdT = 0, chained = false;
  let path = null;                    // { dirs, then, goal } click / tap walk
  let bumpSfxT = 0;

  function reset() { turned = false; holdT = 0; chained = false; path = null; }

  /** Starts a click walk (or cancels it with null). */
  function walk(p) { path = p; }
  const walking = () => !!path;

  /** One frame of control. `me` is the player's actor; W is G.World. */
  function update(dt, me, W) {
    bumpSfxT -= dt;
    const anyKey = G.Btn.dir4() || G.Btn.pressed('a') || G.Btn.pressed('b') || G.Btn.pressed('start');
    if (path && anyKey && !path.fresh) path = null;
    if (path) path.fresh = false;

    if (me.moving) {
      me.bumpT = 0;
      if (me.update(dt)) {
        chained = true;
        W.arrived(me);
      }
      return;
    }
    me.update(dt);
    if (W.locked) { me.bumpT = 0; return; }

    if (G.Btn.pressed('start')) { path = null; W.openMenu(); return; }
    if (G.Btn.pressed('a')) { path = null; W.interact(); return; }
    if (G.Btn.pressed('select') && W.toggleBike) { path = null; W.toggleBike(); return; }

    // (A very quick tap is pressed without ever being held: it still turns.)
    let dir = G.Btn.dir4() || ['up', 'down', 'left', 'right'].find(d => G.Btn.pressed(d)) || null;
    let auto = false, roll = false;
    if (!dir && path) {
      if (!path.dirs.length) {
        const then = path.then; path = null;
        if (then) then();
        return;
      }
      dir = path.dirs[0];
      auto = true;
    }
    // Cycling Road: letting go on the slope rolls you downhill.
    const hill = W.slope ? W.slope() : null;
    if (!dir && hill) { dir = hill; roll = true; }
    if (!dir) { turned = false; chained = false; me.bumpT = 0; return; }
    if (roll) {
      const r = W.tryStep(me, dir, BIKE);
      if (r !== 'moved') me.bumpT = 0;
      return;
    }

    // A short press turns on the spot; holding it (or arriving from a step) walks.
    if (dir !== me.dir && !chained && !auto) {
      me.face(dir); turned = true; holdT = 0; me.bumpT = 0;
      return;
    }
    if (turned && !auto) {
      holdT += dt;
      if (holdT < TURN) return;
    }
    turned = false;
    chained = false;
    const run = G.Btn.held('run') && !auto ? true : (auto && path && path.run);
    // On the Bicycle: fast, but slow going up Cycling Road's slope.
    const speed = W.biking ? (hill && dir === G.Maps.OPP[hill] ? WALK : BIKE) : run ? RUN : WALK;
    const r = W.tryStep(me, dir, speed);
    if (r === 'moved') {
      if (auto) path.dirs.shift();
    } else if (r === 'blocked') {
      if (auto) { path = W.repath(path); if (!path) me.face(dir); return; }
      me.face(dir);
      me.bumpT += dt;
      if (bumpSfxT <= 0) { W.sfx('bump'); bumpSfxT = 0.4; }
    } else if (auto) path = null;            // warped, a script began...
  }

  return { update, reset, walk, walking, WALK, RUN, BIKE, get path() { return path; } };
})();
