/* ============ battle-ui.js — the battle screen ============
 *   G.BattleUI.start({ kind: 'wild' | 'trainer', player: { name, id, party, bag }, foe: { party, trainer },
 *                      seed, bg: 'grass' | 'cave' | 'indoor', rules, music, returnMode, returnArg })
 *     -> Promise<result>   (the engine's result; evolutions are already done)
 *
 * Canvas (mode 'battle'): background, two platforms, the foe facing you (row 7,
 * DownLeft) at the top right and your Pokémon from behind (row 3, UpRight) at the
 * bottom left, move effects (battle-fx.js). DOM (#battle-ui, inside #frame): the two
 * Pokémon boxes, the text box, Fight / Bag / Pokémon / Run, the move menu, lists.
 *
 * The engine (G.Battle) answers each choice with a list of events; play() turns
 * them into animations, sounds and text one after the other. While text plays the
 * screen has data-noinput (A / click / tap advance it); menus are driven by G.Nav.
 *
 *   G.BattleUI.wild(player, sp, lvl, opts)       a wild battle against one new Pokémon (sp: dex number or slug)
 *   G.BattleUI.trainer(player, trainer, opts)    trainer = { id, name, title, ai, prize, items, leader,
 *                                                            team: [[sp, lvl, moves?], ...] }
 *   (the overworld calls these from its encounter / trainer hooks; opts as for start())
 *
 * Debug: dev.html?debug&wild=pidgey:3[,rattata:4]&party=charmander:8&items=poke-ball:5,potion:3&seed=7
 *        or &vs=geodude:12,onix:14 for a trainer battle (G.BattleUI.debugFromUrl()).
 */
G.BattleUI = (() => {
  const $ = id => document.getElementById(id);
  const T = s => G.T(s);
  const esc = s => G.U.esc(s);
  const fmt = (k, v) => G.I18n.fmt(k, v);

  // ---------------- text box (also used by evolve-ui.js / learn-ui.js) ----------------

  /** A message box with typewriter text. say(text, {wait}) -> Promise when read. */
  function TextBox(el) {
    const msg = el.querySelector('.msg'), more = el.querySelector('.more');
    let full = [], shown = 0, done = null, hold = 0, clicked = false;
    el.addEventListener('pointerdown', e => { if (e.button === 0) clicked = true; });
    const cps = () => ({ slow: 35, mid: 70, fast: 160 })[G.Settings.get('textSpeed')] || 70;
    const holdFor = () => ({ slow: 1.4, mid: 0.9, fast: 0.5 })[G.Settings.get('textSpeed')] || 0.9;
    function draw() { msg.textContent = full.slice(0, Math.floor(shown)).join(''); }
    return {
      set(text) { full = Array.from(text || ''); shown = full.length; draw(); more.classList.add('hidden'); done = null; },
      say(text, o = {}) {
        full = Array.from(text || ''); shown = 0; hold = o.wait ? Infinity : holdFor() + (o.extra || 0); clicked = false;
        draw(); more.classList.add('hidden');
        return new Promise(r => { done = r; });
      },
      /** pressed: A / B this frame. */
      update(dt, pressed) {
        const go = pressed || clicked;
        clicked = false;
        if (!done) return;
        if (shown < full.length) {
          shown = go ? full.length : Math.min(full.length, shown + cps() * dt);
          draw();
          if (shown >= full.length && hold === Infinity) more.classList.remove('hidden');
          return;
        }
        if (hold === Infinity) more.classList.remove('hidden');
        hold -= dt;
        if (go || hold <= 0) { const r = done; done = null; more.classList.add('hidden'); r(); }
      },
      get busy() { return !!done; }
    };
  }

  // ---------------- state ----------------
  let root = null, box = null;
  let b = null, o = null, finishBattle = null;
  let phase = 'off';                     // 'off' | 'text' | 'menu'
  const timers = [];                     // { t, r }
  const tweens = [];                     // { t, dur, from, to, set, r }
  const sides = [null, null];            // display state of each side
  let ballFx = null, flash = 0, introT = 0;
  let scene = { bg: 'grass' };

  const wait = s => new Promise(r => timers.push({ t: s, r }));
  function tween(dur, from, to, set) {
    return new Promise(r => { if (dur <= 0) { set(to); r(); return; } tweens.push({ t: 0, dur, from, to, set, r }); });
  }
  const say = (text, opt) => text ? box.say(text, opt) : Promise.resolve();
  const animOn = () => G.Settings.get('battleAnim') !== false;

  // ---------------- DOM ----------------

  function build() {
    root = document.createElement('section');
    root.id = 'battle-ui';
    root.className = 'scr battle-scr hidden';
    root.setAttribute('translate', 'no');
    root.setAttribute('data-noinput', '');
    const monBox = (id, me) => `
      <div class="bt-box ${me ? 'bt-me' : 'bt-foe'} out" id="${id}">
        <div class="bt-name"><span class="nm"></span><span class="g"></span><span class="caught hidden"></span><span class="lv"></span></div>
        <div class="bt-row"><span class="lbl">HP</span><div class="bt-bar"><i></i></div><span class="bt-status hidden"></span></div>
        ${me ? '<div class="bt-hpnum"></div><div class="bt-exp"><i></i></div>' : ''}
      </div>`;
    root.innerHTML = monBox('bt-foe', false) + monBox('bt-me', true) + `
      <div class="bt-text" id="bt-text"><span class="msg"></span><i class="more hidden"></i></div>
      <div class="bt-menu hidden" id="bt-menu">
        <button class="menu-item" data-a="fight" data-first></button><button class="menu-item" data-a="bag"></button>
        <button class="menu-item" data-a="pokemon"></button><button class="menu-item" data-a="run"></button>
      </div>
      <div class="bt-moves hidden" id="bt-moves">
        <button class="menu-item" data-slot="0" data-first></button><button class="menu-item" data-slot="1"></button>
        <div class="info"><span class="pp"></span><span class="tp"></span><button class="btn small ghost" data-back></button></div>
        <button class="menu-item" data-slot="2"></button><button class="menu-item" data-slot="3"></button>
      </div>
      <div class="box bt-list hidden" id="bt-list"><h4></h4><div class="menu-list"></div>
        <div class="row end"><button class="btn small ghost" data-back></button></div></div>
      <div class="box bt-yesno hidden" id="bt-yesno"><div class="menu-list" data-wrap>
        <button class="menu-item" data-v="1" data-first></button><button class="menu-item" data-v="0"></button></div></div>`;
    $('frame').appendChild(root);
    box = TextBox($('bt-text'));
    root.querySelectorAll('#bt-menu [data-a]').forEach(btn => { btn.onclick = () => pick(btn.dataset.a); });
    $('bt-moves').querySelector('[data-back]').onclick = () => pick(null);
  }

  function labels() {
    const set = (sel, t) => { const el = root.querySelector(sel); if (el) el.textContent = t; };
    set('[data-a=fight]', T('Fight')); set('[data-a=bag]', T('Bag'));
    set('[data-a=pokemon]', T('Pokémon')); set('[data-a=run]', T('Run'));
    root.querySelectorAll('[data-back]').forEach(el => { el.textContent = T('Back'); });
    set('#bt-yesno [data-v="1"]', T('Yes')); set('#bt-yesno [data-v="0"]', T('No'));
  }

  function setPhase(p) {
    phase = p;
    if (p === 'menu') root.removeAttribute('data-noinput'); else root.setAttribute('data-noinput', '');
  }
  function hideMenus() { for (const id of ['bt-menu', 'bt-moves', 'bt-list', 'bt-yesno']) $(id).classList.add('hidden'); }

  // ---------------- the two Pokémon boxes ----------------

  const findMon = uid => b.player.party.find(m => m.uid === uid) || b.foe.party.find(m => m.uid === uid) || (b.result && b.result.mon);

  function barClass(f) { return f > 0.5 ? '' : f > 0.2 ? 'mid' : 'low'; }
  const statusLabel = s => ({ par: T('PAR'), slp: T('SLP'), psn: T('PSN'), tox: T('PSN'), brn: T('BRN'), frz: T('FRZ') })[s];

  function drawBox(side) {
    const s = sides[side], el = $(side ? 'bt-foe' : 'bt-me');
    if (!s) { el.classList.add('out'); return; }
    el.querySelector('.nm').textContent = s.name;
    const g = el.querySelector('.g');
    g.textContent = s.gender === 'm' ? '♂' : s.gender === 'f' ? '♀' : '';
    g.className = 'g ' + (s.gender ? 'g-' + s.gender : '');
    el.querySelector('.lv').textContent = fmt('Lv. {n}', { n: s.lvl });
    const f = Math.max(0, s.hp) / s.max;
    const bar = el.querySelector('.bt-bar i');
    bar.style.width = (f * 100).toFixed(1) + '%';
    bar.className = barClass(f);
    const st = el.querySelector('.bt-status');
    st.classList.toggle('hidden', !s.status);
    if (s.status) { st.textContent = statusLabel(s.status); st.className = 'bt-status st-' + s.status; }
    if (!side) {
      el.querySelector('.bt-hpnum').textContent = `${Math.max(0, Math.round(s.hp))}/${s.max}`;
      el.querySelector('.bt-exp i').style.width = (Math.max(0, Math.min(1, s.expF)) * 100).toFixed(1) + '%';
    } else {
      const caught = G.Dex && G.Dex.caught && G.Dex.caught(s.sp);
      el.querySelector('.caught').classList.toggle('hidden', !caught || b.kind !== 'wild');
    }
  }

  function expFraction(mon) {
    const gr = G.SPECIES[mon.sp].gr;
    const from = G.Stats.expAt(gr, mon.lvl), to = G.Stats.expAt(gr, Math.min(100, mon.lvl + 1));
    return mon.lvl >= 100 ? 1 : (mon.exp - from) / Math.max(1, to - from);
  }

  // ---------------- scene positions ----------------

  function view() { return G.Game.view; }
  function feet(side) {
    const v = view();
    return side ? { x: v.w * 0.70, y: v.h * 0.43 } : { x: v.w * 0.27, y: v.h * 0.72 };
  }
  function centre(side) {
    const s = sides[side], f = feet(side);
    const h = s && s.anim ? G.Sprites.bodyHeight(s.sp, s.anim.scale) : 40;
    return { x: f.x, y: f.y - h * 0.5 };
  }
  /** Sprite scale: art pixels follow the frame height; big Pokémon are shrunk to fit. */
  function scaleFor(sp, side) {
    const v = view(), unit = v.h / 320;
    let px = (side ? 2.3 : 3) * unit;
    const m = G.Sprites.animMeta(sp, 'Idle');
    const maxH = v.h * (side ? 0.34 : 0.42);
    if (m && m.ay * px > maxH) px = maxH / m.ay;
    return px / G.Sprites.PX;
  }

  // ---------------- playing events ----------------

  async function play(evs) {
    for (const e of evs) {
      if (e.type === 'error') continue;
      await show(e);
    }
  }

  async function show(e) {
    const line = G.BattleText.line(e, b);
    switch (e.type) {
      case 'start': return intro(line);
      case 'send': return sendIn(e, line);
      case 'withdraw': await say(line); return withdraw(e.side);
      case 'move': await say(line, { extra: -0.4 }); return moveAnim(e);
      case 'damage': await hpTo(e.side, e.hp, e.why === 'hit' ? e : null); return say(line);
      case 'heal': await hpTo(e.side, e.hp); return say(line);
      case 'revived': return say(line);
      case 'faint': return faint(e, line);
      case 'status': setStatus(e.side, e.s); return say(line);
      case 'cure': setStatus(e.side, null); return say(line);
      case 'stage':
        if (!e.capped && animOn()) G.BattleAnim.arrows(centre(e.side), e.delta > 0);
        G.Audio.sfx(e.delta > 0 ? 'select' : 'back');
        return say(line);
      case 'ball': return throwBall(e, line);
      case 'exp': await say(line); return expTo(e);
      case 'levelup': return levelUp(e, line);
      case 'learned': G.Audio.sfx('levelup'); return say(line);
      case 'learnPrompt': return say(line, { wait: true });
      case 'run': if (e.ok) G.Audio.sfx('back'); return say(line);
      case 'money': return say(line);
      case 'end': return;
      default: return say(line);
    }
  }

  async function intro(line) {
    flash = 1;
    G.Audio.sfx('confirm');
    introT = 1;
    await wait(0.5);
    if (b.kind === 'wild') {
      // The wild Pokémon is already there when the screen opens.
      const fo = b.foe.party[b.foe.active || 0];
      sides[1] = makeSide(1, fo);
      sides[1].alpha = 0;
      await tween(0.5, 0, 1, v => { sides[1].alpha = v; sides[1].dx = (1 - v) * -0.4; });
      if (G.Audio.cry) G.Audio.cry(fo.sp);
      drawBox(1);
      $('bt-foe').classList.remove('out');
    }
    await say(line);
  }

  function makeSide(side, mon) {
    const a = new G.Sprites.Animator(mon.sp, 1, !!mon.shiny);
    a.dir = side ? 7 : 3;
    a.loop('Idle');
    a.scale = scaleFor(mon.sp, side);
    G.Sprites.preload([mon.sp], 3000, !!mon.shiny);
    return { uid: mon.uid, sp: mon.sp, name: G.Mon.name(mon), lvl: mon.lvl, hp: mon.hp, max: G.Mon.maxHp(mon),
             gender: mon.gender, status: mon.status, shiny: !!mon.shiny, anim: a, alpha: 1, dx: 0, dy: 0, blink: 0,
             expF: side ? 0 : expFraction(mon), squash: 1 };
  }

  async function sendIn(e, line) {
    const mon = findMon(e.uid);
    if (e.side === 1 && b.kind === 'wild' && sides[1] && sides[1].uid === e.uid) return;    // shown by the intro
    if (line) await say(line);
    const s = makeSide(e.side, mon);
    s.hp = e.hp; s.max = e.max; s.status = e.status;
    s.squash = 0;
    sides[e.side] = s;
    G.Audio.sfx('ball');
    await tween(0.3, 0, 1, v => { s.squash = v; });
    if (G.Audio.cry) G.Audio.cry(mon.sp);
    drawBox(e.side);
    $(e.side ? 'bt-foe' : 'bt-me').classList.remove('out');
    if (mon.shiny && animOn()) { G.Audio.sfx('shiny'); G.BattleAnim.sparkle(centre(e.side), '#fff6a0', 14); await wait(0.5); }
    await wait(0.15);
  }

  async function withdraw(side) {
    const s = sides[side];
    if (!s) return;
    G.Audio.sfx('back');
    await tween(0.25, 1, 0, v => { s.squash = v; });
    sides[side] = null;
    drawBox(side);
  }

  async function moveAnim(e) {
    const s = sides[e.side], t = sides[1 - e.side];
    const M = G.MOVES[e.move];
    if (!s || !M) return;
    const self = G.BattleFx.isSelf(M);
    s.anim.play(M.cat === 'physical' ? 'Attack' : M.cat === 'special' ? 'Shoot' : 'Charge');
    if (!animOn()) { await wait(0.2); return; }
    if (M.cat === 'physical' && t && !self) {
      const dir = e.side ? -1 : 1;
      await tween(0.12, 0, 1, v => { s.dx = dir * v * 0.06; s.dy = -dir * v * 0.04; });
      tween(0.18, 1, 0, v => { s.dx = dir * v * 0.06; s.dy = -dir * v * 0.04; });
    }
    await G.BattleAnim.move({ from: centre(e.side), to: centre(1 - e.side), cat: M.cat, type: M.type, self: self || !t });
  }

  async function hpTo(side, hp, hit) {
    const s = sides[side];
    if (!s) return;
    if (hit) {
      s.anim.play('Hurt');
      s.blink = 0.45;
      G.Audio.sfx(hit.eff > 1 ? 'hitSuper' : hit.eff < 1 ? 'hitWeak' : 'hit');
      if (G.Pad && side === 0) G.Pad.rumble(Math.min(1, 0.3 + hit.amt / s.max), 140);
      if (hit.crit || hit.eff > 1) G.Camera.kick(0.35);
    }
    const from = s.hp;
    if (hp > from) G.Audio.sfx('heal');
    const dur = Math.min(0.9, 0.25 + Math.abs(hp - from) / s.max * 0.8);
    await tween(dur, from, hp, v => { s.hp = v; drawBox(side); });
    s.hp = hp;
    drawBox(side);
  }

  async function faint(e, line) {
    const s = sides[e.side];
    if (s) {
      s.anim.play('Faint', { hold: true });
      if (G.Audio.cry) G.Audio.cry(s.sp, { faint: true });
      G.Audio.sfx('faint');
      await wait(0.35);
      await tween(0.35, 0, 1, v => { s.dy = v * 0.12; s.alpha = 1 - v; });
      s.status = null;
      sides[e.side] = null;
    }
    $(e.side ? 'bt-foe' : 'bt-me').classList.add('out');
    await say(line);
  }

  function setStatus(side, st) { if (sides[side]) { sides[side].status = st; drawBox(side); } }

  async function expTo(e) {
    const s = sides[0];
    if (!s || s.uid !== e.uid) return;
    const to = Math.min(1, (e.exp - e.from) / Math.max(1, e.to - e.from));
    G.Audio.sfx('coin');
    await tween(0.6, s.expF, to, v => { s.expF = v; drawBox(0); });
  }

  async function levelUp(e, line) {
    const s = sides[0];
    G.Audio.jingle ? G.Audio.jingle('levelup') : G.Audio.sfx('levelup');
    if (s && s.uid === e.uid) {
      s.lvl = e.lvl; s.max = e.after[0]; s.hp = e.hp;
      s.expF = 0; drawBox(0);
      const mon = findMon(e.uid);
      await say(line);
      await tween(0.4, 0, expFraction(mon), v => { s.expF = Math.min(1, v); drawBox(0); });
      return;
    }
    await say(line);
  }

  async function throwBall(e, line) {
    const s = sides[1];
    const from = { x: view().w * 0.12, y: view().h * 0.7 }, to = centre(1), land = feet(1);
    ballFx = { x: from.x, y: from.y, item: e.item, wobble: 0, shown: true };
    G.Audio.sfx('ball');
    await tween(0.5, 0, 1, v => { ballFx.x = from.x + (to.x - from.x) * v; ballFx.y = from.y + (to.y - from.y) * v - Math.sin(v * Math.PI) * view().h * 0.25; });
    flash = 0.6;
    if (s) await tween(0.25, 1, 0, v => { s.squash = v; });
    await tween(0.3, to.y, land.y - 8, v => { ballFx.y = v; });
    for (let i = 0; i < e.shakes; i++) {
      await wait(0.35);
      G.Audio.sfx('shake');
      await tween(0.3, 0, 1, v => { ballFx.wobble = Math.sin(v * Math.PI * 2) * 0.5; });
    }
    await wait(0.4);
    if (e.caught) {
      G.BattleAnim.sparkle({ x: ballFx.x, y: ballFx.y }, '#fff6a0', 12);
      G.Audio.jingle ? G.Audio.jingle('caught') : G.Audio.sfx('confirm');
      ballFx.dark = true;
      await say(line, { extra: 0.6 });
      return;
    }
    ballFx = null;
    G.Audio.sfx('ball');
    if (s) { G.BattleAnim.burst(centre(1), '#ffffff', 10); await tween(0.2, 0, 1, v => { s.squash = v; }); }
    await say(line);
  }

  // ---------------- choosing ----------------

  let choice = null;                     // resolves the current menu
  const pick = v => { const c = choice; choice = null; if (c) c(v); };

  function menuWait(show) {
    return new Promise(r => {
      choice = r;
      hideMenus();
      show();
      setPhase('menu');
      requestAnimationFrame(() => G.Nav.focusFirst());
    });
  }

  /** Debug keys from js/debug.js: F6 wins the battle, F7 makes the next ball catch. */
  async function debugHooks() {
    const D = G.Debug;
    if (!D || !D.on) return false;
    if (D.catchNext) { D.catchNext = false; b.rules.forceCatch = true; G.UI.toast('[debug] next ball catches'); }
    if (!D.win) return false;
    D.win = false;
    for (const m of b.foe.party) m.hp = 0;
    b.events = [];
    b.afterAction();
    b.process();
    await play(b.events);
    return true;
  }

  async function chooseAction() {
    for (;;) {
      if (await debugHooks() && b.result) return null;
      const me = findMon(b.player.bm.mon.uid);
      box.set(fmt('What will {mon} do?', { mon: G.Mon.name(me) }));
      root.onBack = () => {};
      const a = await menuWait(() => $('bt-menu').classList.remove('hidden'));
      hideMenus(); setPhase('text');
      let act = null;
      if (a === 'fight') act = await chooseMove();
      else if (a === 'bag') act = await chooseItem();
      else if (a === 'pokemon') act = await choosePokemon({});
      else if (a === 'run') act = { type: 'run' };
      if (act) return act;
    }
  }

  async function chooseMove() {
    const opt = b.options();
    if (opt.struggle) return { type: 'move', slot: 0 };
    const mon = b.player.bm.mon;
    const info = $('bt-moves').querySelector('.info');
    const show = slot => {
      const m = mon.moves[slot]; if (!m) return;
      const M = G.MOVES[m.id];
      info.querySelector('.pp').textContent = `PP ${m.pp}/${G.Mon.ppMax(m.id, m.ppUp)}`;
      const tp = info.querySelector('.tp');
      tp.textContent = G.Names.type(M.type); tp.style.background = G.U.TYPE_COLOR[M.type];
    };
    $('bt-moves').querySelectorAll('[data-slot]').forEach(btn => {
      const slot = +btn.dataset.slot, m = mon.moves[slot];
      btn.textContent = m ? G.Names.move(m.id) : '—';
      btn.disabled = !m || !opt.moves[slot].usable;
      btn.style.setProperty('--t', m ? G.U.TYPE_COLOR[G.MOVES[m.id].type] : '#999');
      btn.onmouseenter = btn.onfocus = () => show(slot);
      btn.onclick = () => pick({ type: 'move', slot });
    });
    show(0);
    root.onBack = () => pick(null);
    const obs = new MutationObserver(() => { const f = $('bt-moves').querySelector('.pad-focus[data-slot]'); if (f) show(+f.dataset.slot); });
    obs.observe($('bt-moves'), { subtree: true, attributes: true, attributeFilter: ['class'] });
    const r = await menuWait(() => $('bt-moves').classList.remove('hidden'));
    obs.disconnect();
    hideMenus(); setPhase('text');
    return r;
  }

  /** A list over the scene: [{ html, value, disabled, cls }] -> chosen value, or null for Back. */
  async function list(title, items, { back = true } = {}) {
    const el = $('bt-list');
    el.querySelector('h4').textContent = title;
    const ml = el.querySelector('.menu-list');
    ml.innerHTML = '';
    items.forEach((it, i) => {
      const btn = document.createElement('button');
      btn.className = 'menu-item' + (it.cls ? ' ' + it.cls : '');
      btn.innerHTML = it.html;
      btn.disabled = !!it.disabled;
      if (i === 0) btn.dataset.first = '';
      btn.onclick = () => pick(it.value);
      ml.appendChild(btn);
    });
    el.querySelector('[data-back]').classList.toggle('hidden', !back);
    el.querySelector('[data-back]').onclick = () => pick(null);
    root.onBack = back ? () => pick(null) : () => {};
    const r = await menuWait(() => el.classList.remove('hidden'));
    hideMenus(); setPhase('text');
    return r;
  }

  function partyRows(filter) {
    return b.player.party.map((m, i) => {
      const max = G.Mon.maxHp(m), f = m.hp / max;
      return { value: i, cls: m.hp <= 0 ? 'fainted' : '', disabled: filter ? !filter(m, i) : false,
        html: `<span class="grow">${esc(G.Mon.name(m))}</span><span class="meta">${esc(fmt('Lv. {n}', { n: m.lvl }))}</span>`
            + `<span class="mini"><i class="${barClass(f)}" style="width:${(f * 100).toFixed(0)}%"></i></span>`
            + `<span class="meta">${m.hp}/${max}</span>` };
    });
  }

  async function choosePokemon({ forced }) {
    for (;;) {
      const i = await list(forced ? T('Choose a Pokémon.') : T('Switch to which Pokémon?'), partyRows(), { back: !forced });
      if (i == null) return null;
      const m = b.player.party[i];
      if (m.hp <= 0) { await say(fmt('{mon} has no energy left to battle!', { mon: G.Mon.name(m) })); continue; }
      if (i === b.player.active && !b.player.bm.fainted) { await say(fmt('{mon} is already in battle!', { mon: G.Mon.name(m) })); continue; }
      if (forced) return i;
      if (!b.options().canSwitch) { await say(fmt("{mon} can't be switched out!", { mon: G.Mon.name(b.player.bm.mon) })); return null; }
      return { type: 'switch', to: i };
    }
  }

  async function chooseItem() {
    const bag = b.player.bag;
    const order = id => { const fx = G.ITEM_FX[id]; return fx.ball ? 0 : fx.heal || fx.revive || fx.cure || fx.pp ? 1 : 2; };
    const ids = Object.keys(bag).filter(id => bag[id] > 0 && G.ITEM_FX[id] && G.ITEM_FX[id].battle).sort((p, q) => order(p) - order(q) || p.localeCompare(q));
    if (!ids.length) { await say(T('There is nothing you can use now.')); return null; }
    for (;;) {
      const id = await list(T('Use which item?'), ids.filter(x => bag[x] > 0).map(x => ({ value: x,
        html: `<span class="grow">${esc(G.Names.item(x))}</span><span class="meta">×${bag[x]}</span>` })));
      if (!id) return null;
      const fx = G.ITEM_FX[id];
      if (fx.ball) {
        if (b.kind !== 'wild') { await say(T("You can't use that on a trainer's Pokémon!")); continue; }
        return { type: 'ball', item: id };
      }
      if (fx.stage || fx.crit || fx.mist) return { type: 'item', item: id, target: b.player.active };
      const t = await list(fmt('Use {item} on which Pokémon?', { item: G.Names.item(id) }), partyRows());
      if (t == null) continue;
      let move;
      if (fx.pp && !fx.ppAll) {
        const mon = b.player.party[t];
        move = await list(T('Restore PP of which move?'), mon.moves.map((m, i) => ({ value: i,
          html: `<span class="grow">${esc(G.Names.move(m.id))}</span><span class="meta">${m.pp}/${G.Mon.ppMax(m.id, m.ppUp)}</span>` })));
        if (move == null) continue;
      }
      const a = { type: 'item', item: id, target: t, move };
      if (!G.BattleItems.canUse(b, b.player, a)) { await say(T("It won't have any effect.")); continue; }
      return a;
    }
  }

  async function yesNo(text) {
    box.set(text);
    root.onBack = () => pick(false);
    const v = await menuWait(() => {
      const el = $('bt-yesno');
      el.querySelectorAll('[data-v]').forEach(btn => { btn.onclick = () => pick(btn.dataset.v === '1'); });
      el.classList.remove('hidden');
    });
    hideMenus(); setPhase('text');
    return v;
  }

  async function forgetWhich(mon, move) {
    const rows = mon.moves.map((m, i) => ({ value: i,
      html: `<span class="grow">${esc(G.Names.move(m.id))}</span><span class="meta">${esc(G.Names.type(G.MOVES[m.id].type))} · PP ${m.pp}/${G.Mon.ppMax(m.id, m.ppUp)}</span>` }));
    rows.push({ value: -1, html: `<span class="grow">${esc(fmt("Don't learn {move}", { move: G.Names.move(move) }))}</span>` });
    const r = await list(fmt('Which move should {mon} forget?', { mon: G.Mon.name(mon) }), rows, { back: true });
    return r == null ? -1 : r;
  }

  // ---------------- the battle ----------------

  async function run() {
    await play(b.start());
    while (!b.result) {
      const p = b.prompt;
      let ev;
      if (p.kind === 'action') {
        const a = await chooseAction();
        // F6 / F7 pressed while the menu was open count before the action.
        if (await debugHooks() && b.result) break;
        if (!a) continue;                   // the battle ended meanwhile (debug win)
        ev = b.act(a);
        if (ev.length && ev[0].type === 'error') { await say(T("It won't have any effect.")); continue; }
      } else if (p.kind === 'switch') {
        ev = b.answer({ switchTo: await choosePokemon({ forced: true }) });
      } else if (p.kind === 'shift') {
        const want = await yesNo(fmt('{trainer} is about to send in {mon}. Will you switch your Pokémon?',
                                     { trainer: G.BattleText.trainerName(b), mon: G.Names.mon(p.next) }));
        let to = -1;
        if (want) { const i = await choosePokemon({ forced: true, cancel: true }); to = i == null ? -1 : i; }
        ev = b.answer({ switchTo: to });
      } else if (p.kind === 'learn') {
        ev = b.answer({ learnSlot: await forgetWhich(findMon(p.uid), p.move) });
      } else break;
      await play(ev);
    }
    return b.result;
  }

  /** A caught Pokémon: the Pokédex, a nickname, and the PC when the party is full. */
  async function afterCatch(r) {
    const mon = r.mon, name = G.Names.mon(mon.sp);
    if (G.Dex && !G.Dex.caught(mon.sp) && G.Field.flag('has-pokedex')) await say(fmt("{mon}'s data was added to the Pokédex.", { mon: name }));
    if (G.NameUI && await yesNo(fmt('Give a nickname to the caught {mon}?', { mon: name }))) {
      const nick = await G.NameUI.ask({ kind: 'mon', mon });
      if (nick) mon.nick = nick;
    }
    if (r.toBox) await say(fmt('{mon} was sent to the PC.', { mon: G.Mon.name(mon) }));
  }

  async function afterBattle(result) {
    if (result.outcome === 'caught' && result.mon) await afterCatch(result);
    if (result.outcome === 'win') {
      if (G.Audio.jingle) G.Audio.jingle(b.kind === 'trainer' ? 'victory-trainer' : 'victory-wild');
      await wait(0.4);
    }
    // Evolutions (cancel with B), then the moves the new forms learn. The battle screen steps aside.
    if ((result.evolve || []).length) { root.classList.add('hidden'); setPhase('off'); }
    for (const uid of result.evolve || []) {
      const mon = b.player.party.find(m => m.uid === uid);
      const to = mon && G.Evolution.candidates(mon, { trigger: 'level' })[0];
      if (to && G.EvolveUI) await G.EvolveUI.run(mon, to);
    }
  }

  function close() {
    hideMenus();
    G.UI.close('battle-ui');
    root.classList.add('hidden');
    $('bt-foe').classList.add('out'); $('bt-me').classList.add('out');
    sides[0] = sides[1] = null;
    ballFx = null; flash = 0;
    G.BattleAnim.clear();
    setPhase('off');
  }

  /** Starts a battle. Returns a Promise of the engine's result. */
  async function start(opts) {
    if (!root) build();
    labels();
    o = opts;
    scene = { bg: opts.bg || 'grass' };
    b = G.Battle.create({ kind: opts.kind, seed: opts.seed == null ? G.RNG.seed() : opts.seed,
                          player: opts.player, foe: opts.foe, rules: opts.rules });
    G.UI.closeAll();
    G.Game.setMode('battle');
    const t = opts.foe.trainer;
    const song = opts.music || (t ? (t.leader ? 'rift' : 'boss') : 'volcano');
    if (G.Audio.context && !opts.music) G.Audio.context(t ? (t.leader ? 'gym' : 'trainer') : 'wild');
    else G.Audio.music(song);
    G.UI.open('battle-ui');
    setPhase('text');
    box.set('');
    let result;
    try {
      result = await run();
      await afterBattle(result);
    } finally {
      close();
    }
    if (opts.returnMode) G.Game.setMode(opts.returnMode, opts.returnArg);
    return result;
  }

  // ---------------- mode: update and draw ----------------

  const Mode = {
    enter() { introT = 0; },
    exit() {},
    update(dt, { ui }) {
      for (let i = timers.length - 1; i >= 0; i--) { if ((timers[i].t -= dt) <= 0) { const r = timers[i].r; timers.splice(i, 1); r(); } }
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        tw.t += dt;
        const k = Math.min(1, tw.t / tw.dur);
        tw.set(tw.from + (tw.to - tw.from) * k);
        if (k >= 1) { tweens.splice(i, 1); tw.r(); }
      }
      for (const s of sides) if (s) { s.anim.update(dt); if (s.blink > 0) s.blink -= dt; }
      G.BattleAnim.update(dt);
      if (flash > 0) flash = Math.max(0, flash - dt * 2.5);
      if (introT > 0) introT = Math.max(0, introT - dt * 1.6);
      if (box) box.update(dt, !ui && phase === 'text' && (G.Btn.pressed('a') || G.Btn.pressed('b')));
    },
    render(ctx, v) {
      drawScene(ctx, v);
    }
  };

  const BG = {
    grass:  { sky: ['#8ccbf3', '#d9f0ff'], ground: ['#98d080', '#6aa858'], pad: '#b8e098', rim: '#78a858' },
    cave:   { sky: ['#2c2638', '#4a4058'], ground: ['#6a5a48', '#4e4234'], pad: '#8a7860', rim: '#5a4a38' },
    indoor: { sky: ['#e8e0d0', '#f4ecdc'], ground: ['#c8b8a0', '#b0a088'], pad: '#ddd0b8', rim: '#a09078' }
  };

  function drawScene(ctx, v) {
    const c = BG[scene.bg] || BG.grass, unit = v.h / 320;
    let g = ctx.createLinearGradient(0, 0, 0, v.h * 0.5);
    g.addColorStop(0, c.sky[0]); g.addColorStop(1, c.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, v.w, v.h * 0.5);
    g = ctx.createLinearGradient(0, v.h * 0.5, 0, v.h);
    g.addColorStop(0, c.ground[0]); g.addColorStop(1, c.ground[1]);
    ctx.fillStyle = g; ctx.fillRect(0, v.h * 0.5, v.w, v.h * 0.5);
    // platforms
    for (const side of [1, 0]) {
      const f = feet(side), rx = v.w * (side ? 0.17 : 0.2), ry = v.h * (side ? 0.045 : 0.055);
      ctx.fillStyle = c.rim; ctx.beginPath(); ctx.ellipse(f.x, f.y + ry * 0.25, rx, ry, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = c.pad; ctx.beginPath(); ctx.ellipse(f.x, f.y, rx * 0.94, ry * 0.8, 0, 0, 6.2832); ctx.fill();
    }
    // Pokémon (the foe first: it is further away)
    for (const side of [1, 0]) {
      const s = sides[side];
      if (!s || s.alpha <= 0) continue;
      const f = feet(side);
      const x = f.x + s.dx * v.w, y = f.y + s.dy * v.h;
      if (s.squash < 1) {
        ctx.save();
        ctx.translate(x, y); ctx.scale(Math.max(0.01, s.squash), Math.max(0.01, s.squash)); ctx.translate(-x, -y);
        s.anim.draw(ctx, x, y, { alpha: s.alpha, flash: s.squash < 0.9 });
        ctx.restore();
      } else {
        const hidden = s.blink > 0 && Math.floor(s.blink * 14) % 2 === 0;
        if (!hidden) s.anim.draw(ctx, x, y, { alpha: s.alpha });
      }
    }
    if (ballFx) drawBall(ctx, ballFx, unit);
    G.BattleAnim.draw(ctx, unit);
    if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, v.w, v.h); }
    if (introT > 0) {
      ctx.fillStyle = '#000';
      const k = introT;
      ctx.fillRect(0, 0, v.w, v.h * 0.5 * k);
      ctx.fillRect(0, v.h * (1 - 0.5 * k), v.w, v.h * 0.5 * k);
    }
  }

  function drawBall(ctx, f, unit) {
    const r = 7 * unit;
    ctx.save();
    ctx.translate(f.x, f.y); ctx.rotate(f.wobble || 0);
    ctx.fillStyle = f.dark ? '#8a2020' : '#e83a3a';
    ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.fill();
    ctx.fillStyle = f.dark ? '#a8a8a8' : '#f8f8f8';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI); ctx.fill();
    ctx.strokeStyle = '#222'; ctx.lineWidth = Math.max(1, unit);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, 6.2832); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---------------- debug entry ----------------

  function parseTeam(spec, rng) {
    return String(spec).split(',').filter(Boolean).map(s => {
      const [n, l] = s.split(':');
      const sp = /^\d+$/.test(n) ? +n : +Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === n);
      return G.SPECIES[sp] ? G.Mon.create(sp, +(l || 5), { rng }) : null;
    }).filter(Boolean);
  }

  /** dev.html?debug&wild=... or &vs=...: starts a test battle instead of the title. -> started? */
  function debugFromUrl() {
    const q = new URLSearchParams(location.search);
    if (!q.has('debug') || !(q.get('wild') || q.get('vs'))) return false;
    const seed = q.has('seed') ? +q.get('seed') : G.RNG.seed();
    const rng = G.RNG(seed * 31 + 7);
    const party = parseTeam(q.get('party') || 'charmander:8', rng);
    const bag = {};
    for (const s of (q.get('items') || 'poke-ball:5,great-ball:2,potion:3,antidote:1,x-attack:1').split(',')) {
      const [id, n] = s.split(':');
      if (G.ITEMS[id]) bag[id] = +(n || 1);
    }
    const trainer = q.get('vs') ? { id: 'debug', name: 'Debug', title: 'Youngster', ai: q.has('leader') ? 'leader' : 'basic',
                                    prize: 20, leader: q.has('leader'), items: { 'super-potion': 1 } } : null;
    const foes = parseTeam(q.get('wild') || q.get('vs'), rng);
    const again = () => start({ kind: trainer ? 'trainer' : 'wild', seed: seed + 1, bg: q.get('bg') || 'grass',
                                player: { name: q.get('name') || 'Red', id: 1, party, bag }, foe: { party: foes.map(m => Object.assign({}, m)), trainer } })
      .then(r => { console.log('[battle] result', r); G.UI.toast(r.outcome, 2500); G.TitleUI.open(); });
    again();
    return true;
  }

  const spId = sp => (typeof sp === 'number' || /^\d+$/.test(sp) ? +sp : +Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === sp));

  function wild(player, sp, lvl, opts = {}) {
    const rng = G.RNG(opts.seed == null ? G.RNG.seed() : opts.seed + 1);
    const mon = G.Mon.create(spId(sp), lvl, { rng, wild: true });
    return start(Object.assign({ kind: 'wild', player, foe: { party: [mon] } }, opts));
  }

  function trainer(player, t, opts = {}) {
    const rng = G.RNG(opts.seed == null ? G.RNG.seed() : opts.seed + 1);
    const party = t.team.map(([sp, lvl, moves]) => G.Mon.create(spId(sp), lvl, { rng, moves }));
    return start(Object.assign({ kind: 'trainer', player, foe: { party, trainer: t } }, opts));
  }

  function init() {
    G.Game.define('battle', Mode);
  }

  return { init, start, wild, trainer, debugFromUrl, TextBox, get battle() { return b; }, get busy() { return phase !== 'off'; } };
})();
