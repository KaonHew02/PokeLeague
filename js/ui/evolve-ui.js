/* ============ evolve-ui.js — "What? Caterpie is evolving!" ============
 *   G.EvolveUI.run(mon, to) -> Promise<boolean evolved>
 * Mode 'evolve': a dark stage with light rays; the Pokémon glows white and
 * flickers between its old and new shape, faster and faster. B cancels it
 * before the end ("Huh? Caterpie stopped evolving!"). Afterwards the new form
 * learns the moves it gets at this level (learn-ui.js).
 * The caller switches back to its own mode afterwards (the battle screen does).
 */
G.EvolveUI = (() => {
  const fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null, box = null, st = null;

  function build() {
    el = document.createElement('div');
    el.className = 'evo-text hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<span class="msg"></span><i class="more hidden"></i>';
    el.style.cursor = 'pointer';
    document.getElementById('frame').appendChild(el);
    box = G.BattleUI.TextBox(el);
  }

  const Mode = {
    enter() {},
    exit() {},
    update(dt) {
      if (!st) return;
      st.t += dt;
      if (st.anim) st.anim.update(dt);
      if (st.anim2) st.anim2.update(dt);
      if (st.morphing && G.Btn.pressed('b')) st.cancel = true;
      box.update(dt, G.Btn.pressed('a') || (!st.morphing && G.Btn.pressed('b')));
    },
    render(ctx, v) {
      ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, v.w, v.h);
      if (!st) return;
      const cx = v.w / 2, cy = v.h * 0.55;
      // light rays
      ctx.save();
      ctx.translate(cx, cy - v.h * 0.12);
      ctx.rotate(st.t * 0.4);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = `rgba(150,190,255,${st.morphing ? 0.12 : 0.05})`;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(v.w, -v.h * 0.08); ctx.lineTo(v.w, v.h * 0.08); ctx.fill();
      }
      ctx.restore();
      // the Pokémon: during the morph it flickers between both shapes, all white
      let a = st.anim;
      if (st.morphing) {
        const k = Math.min(1, (st.t - st.t0) / st.dur);
        const freq = 2 + k * 14;
        a = Math.floor((st.t - st.t0) * freq) % 2 ? st.anim2 : st.anim;
      } else if (st.evolved) a = st.anim2;
      a.draw(ctx, cx, cy, { flash: st.morphing });
      if (st.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${st.flash})`; ctx.fillRect(0, 0, v.w, v.h); st.flash -= 0.03; }
    }
  };

  const wait = s => new Promise(r => { const t0 = st.t; const id = setInterval(() => { if (st.t - t0 >= s) { clearInterval(id); r(); } }, 30); });

  async function run(mon, to) {
    if (!el) build();
    G.Game.define('evolve', Mode);
    const scaleFor = sp => {
      const m = G.Sprites.animMeta(sp, 'Idle'), v = G.Game.view;
      let px = v.h / 320 * 3.2;
      if (m && m.ay * px > v.h * 0.45) px = v.h * 0.45 / m.ay;
      return px / G.Sprites.PX;
    };
    const mk = sp => { const a = new G.Sprites.Animator(sp, 1, !!mon.shiny); a.dir = 0; a.loop('Idle'); a.scale = scaleFor(sp); return a; };
    G.Sprites.preload([mon.sp, to], 3000, !!mon.shiny);
    st = { t: 0, anim: mk(mon.sp), anim2: mk(to), morphing: false, evolved: false, cancel: false, flash: 0, t0: 0, dur: 4 };
    G.Game.setMode('evolve');
    el.classList.remove('hidden');
    G.Audio.music(G.MUSIC.evolution ? 'evolution' : 'cave');
    const name = G.Mon.name(mon);
    const say = (t, o) => box.say(t, o);
    await say(fmt('What? {mon} is evolving!', { mon: name }), { wait: true });
    st.morphing = true; st.t0 = st.t;
    while (st.t - st.t0 < st.dur && !st.cancel) await wait(0.05);
    st.morphing = false;
    if (st.cancel) {
      await say(fmt('Huh? {mon} stopped evolving!', { mon: name }), { wait: true });
      el.classList.add('hidden'); st = null;
      return false;
    }
    st.flash = 1; st.evolved = true;
    if (G.Audio.cry) G.Audio.cry(to);
    const oldName = name;
    const newMoves = G.Evolution.evolve(mon, to);
    if (G.Audio.jingle) G.Audio.jingle('evolved'); else G.Audio.sfx('levelup');
    await say(fmt('Congratulations! Your {mon} evolved into {to}!', { mon: oldName, to: G.Names.mon(to) }), { wait: true });
    for (const id of newMoves) await G.LearnUI.teach(mon, id, say);
    el.classList.add('hidden'); st = null;
    return true;
  }

  return { run };
})();
