/* ============ battle-fx.js — move animations on the battle canvas ============
 * Generic by move category and type (the same few effects in the type's colour):
 *   physical  the attacker lunges, an impact burst on the target
 *   special   a glowing shot travels to the target, then bursts
 *   status    sparkles around whoever it affects
 *   stat up / down: arrows rising / falling; ball throw: an arc and the wobbles
 *
 *   G.BattleAnim.move({ from, to, cat, type, self }) -> Promise (resolves when it lands)
 *   G.BattleAnim.burst(pos, colour) · sparkle(pos, colour) · arrows(pos, up)
 *   G.BattleAnim.update(dt) · draw(ctx, unit)   (called by battle-ui.js)
 * Positions are canvas CSS pixels; `unit` scales sizes with the frame.
 * Cosmetic randomness only (Math.random is fine here: it never changes the battle).
 */
G.BattleAnim = (() => {
  let parts = [], shots = [];

  function colour(type) { return G.U.TYPE_COLOR[type] || '#ffffff'; }

  function burst(pos, col, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 120;
      parts.push({ x: pos.x, y: pos.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.35 + Math.random() * 0.2, t: 0, col, r: 2 + Math.random() * 3, kind: 'dot' });
    }
    parts.push({ x: pos.x, y: pos.y, vx: 0, vy: 0, life: 0.22, t: 0, col: '#ffffff', r: 18, kind: 'ring' });
  }

  function sparkle(pos, col, n = 10) {
    for (let i = 0; i < n; i++) {
      parts.push({ x: pos.x + (Math.random() - 0.5) * 60, y: pos.y - Math.random() * 60, vx: 0, vy: -20 - Math.random() * 30,
                   life: 0.5 + Math.random() * 0.4, t: -Math.random() * 0.3, col, r: 3 + Math.random() * 2, kind: 'star' });
    }
  }

  function arrows(pos, up) {
    for (let i = 0; i < 6; i++) {
      parts.push({ x: pos.x + (i - 2.5) * 12, y: pos.y - (up ? 0 : 50), vx: 0, vy: up ? -70 : 70, life: 0.6, t: -i * 0.05,
                   col: up ? '#7fd0ff' : '#ff7f7f', r: 6, kind: 'arrow', up });
    }
  }

  function move(o) {
    const col = colour(o.type);
    return new Promise(res => {
      if (o.cat === 'status' || o.self) { sparkle(o.self ? o.from : o.to, col); setTimeout(res, 380); return; }
      if (o.cat === 'physical') { setTimeout(() => { burst(o.to, col); res(); }, 140); return; }
      shots.push({ from: o.from, to: o.to, t: 0, dur: 0.32, col, done: () => { burst(o.to, col, 10); res(); } });
    });
  }

  function update(dt) {
    for (const p of parts) {
      p.t += dt;
      if (p.t < 0) continue;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'dot') { p.vx *= 0.9; p.vy *= 0.9; }
    }
    parts = parts.filter(p => p.t < p.life);
    for (const s of shots) {
      s.t += dt;
      if (s.t >= s.dur && !s.fired) { s.fired = true; s.done(); }
    }
    shots = shots.filter(s => !s.fired);
  }

  function draw(ctx, unit = 1) {
    ctx.save();
    for (const s of shots) {
      const k = Math.min(1, s.t / s.dur);
      const x = s.from.x + (s.to.x - s.from.x) * k, y = s.from.y + (s.to.y - s.from.y) * k - Math.sin(k * Math.PI) * 18 * unit;
      ctx.fillStyle = s.col; ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(x, y, 11 * unit, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(x, y, 5 * unit, 0, 6.2832); ctx.fill();
    }
    for (const p of parts) {
      if (p.t < 0) continue;
      const a = 1 - p.t / p.life;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.col; ctx.strokeStyle = p.col;
      if (p.kind === 'ring') {
        ctx.lineWidth = 3 * unit;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * unit * (1 + p.t / p.life * 1.5), 0, 6.2832); ctx.stroke();
      } else if (p.kind === 'arrow') {
        const s = p.r * unit;
        ctx.beginPath();
        if (p.up) { ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y); ctx.lineTo(p.x - s, p.y); }
        else { ctx.moveTo(p.x, p.y + s); ctx.lineTo(p.x + s, p.y); ctx.lineTo(p.x - s, p.y); }
        ctx.fill();
      } else if (p.kind === 'star') {
        const s = p.r * unit;
        ctx.fillRect(p.x - s / 2, p.y - s * 1.5, s, s * 3);
        ctx.fillRect(p.x - s * 1.5, p.y - s / 2, s * 3, s);
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * unit, 0, 6.2832); ctx.fill();
      }
    }
    ctx.restore();
  }

  function clear() { parts = []; shots = []; }

  return { move, burst, sparkle, arrows, update, draw, clear, colour };
})();
