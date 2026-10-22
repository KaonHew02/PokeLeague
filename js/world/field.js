/* ============ field.js — the overworld: state, rules, people, the 'overworld' mode ============
 *
 * G.Field: the game state the overworld reads and writes, shaped like the save
 * (docs/DESIGN.md section 6). Until store.js (M5) exists it is an in-memory
 * object with a fake party; M5 calls G.Field.bind(save) with the real one.
 *   flag(f) setFlag(f) clearFlag(f) · getVar(k) setVar(k, v) · isDone('map:id') markDone(key)
 *   party() lead() giveMon(sp, lvl) · count(item) giveItem(item, n) takeItem(item, n) · money(delta)
 *   healAll() · test(cond) (script conditions) · vars() ({player}, {rival} for texts)
 *
 * G.World: the overworld.
 *   G.World.start({ map, spot } | { map, x, y, dir })    enters the overworld
 *   G.World.warp(map, spot)                               fade, load, fade (Promise)
 *   G.World.onEncounter = async ({ sp, lvl, method, map, area }) => 'win'|'lose'|'run'|'caught'
 *   G.World.onTrainer   = async (trainer, { map, key, canLose }) => 'win'|'lose'
 *       hooks for the battle UI (M4). It switches to its own mode and back with
 *       G.Game.setMode('overworld') (no argument: the world resumes as it was),
 *       then resolves. 'lose' without canLose blacks out (back to the last heal).
 *   G.World.map / player / follower / actor(id) / locked
 *   G.World.debug = { noEnc, noclip }                     (debug.js)
 *
 * The rules: tiles from maps.js, people block, ledges hop downhill, doors and
 * stairs warp when stepped on, an exit mat when you walk down onto it or
 * press down on it, map edges cross into connected maps, tall grass rolls
 * rate/180 for an encounter on each step, trainers look along their sight
 * after each step, triggers run their script when stepped into.
 */
G.Field = (() => {
  function fresh() {
    return {
      v: 1, app: 'PokeLeague', created: Date.now(), playTime: 0,
      player: { name: 'Red', gender: 'm', id: 12345, money: 3000, badges: [], map: null, x: 0, y: 0, dir: 'down', lastHeal: null },
      rival: { name: 'Blue', starter: null },
      party: [], boxes: [], box: 0, bag: {}, dex: { seen: {}, caught: {} }, flags: {}, vars: {}, done: {}
    };
  }
  let S = fresh();
  let fake = true;

  const bind = save => { S = save; fake = false; };
  const reset = () => { S = fresh(); fake = true; };

  const flag = f => !!S.flags[f];
  const setFlag = (f, on = true) => { if (on) S.flags[f] = 1; else delete S.flags[f]; };
  const clearFlag = f => { delete S.flags[f]; };
  const getVar = k => S.vars[k];
  const setVar = (k, v) => { S.vars[k] = v; };
  const isDone = k => !!S.done[k];
  const markDone = k => { S.done[k] = 1; };

  const party = () => S.party;
  /** The first Pokémon that can still fight (the follower). */
  const lead = () => S.party.find(m => m && m.hp > 0) || null;

  function makeMon(sp, lvl, o = {}) {
    const id = G.Maps.species(sp);
    if (id == null) throw new Error('Unknown Pokémon ' + sp);
    const rng = o.rng || G.World.rng;
    if (G.Mon && G.Mon.create) {
      return G.Mon.create(id, lvl, Object.assign({ rng, ot: { name: S.player.name, id: S.player.id }, met: { map: S.player.map, lvl } }, o));
    }
    return { uid: rng.int(0, 1e9).toString(36), sp: id, nick: null, lvl, exp: 0, hp: 20, status: null, moves: [], shiny: false };
  }
  /** Adds a Pokémon to the party (or the PC when the party is full). -> the mon */
  function giveMon(sp, lvl, o = {}) {
    const mon = makeMon(sp, lvl, o);
    if (S.party.length < 6) S.party.push(mon);
    else {
      if (!S.boxes.length) for (let i = 0; i < 8; i++) S.boxes.push(new Array(30).fill(null));
      for (const box of S.boxes) { const i = box.indexOf(null); if (i >= 0) { box[i] = mon; break; } }
    }
    S.dex.seen[mon.sp] = 1; S.dex.caught[mon.sp] = 1;
    return mon;
  }

  const count = item => S.bag[item] | 0;
  function giveItem(item, n = 1) { S.bag[item] = count(item) + n; }
  function takeItem(item, n = 1) {
    if (count(item) < n) return false;
    S.bag[item] -= n;
    if (S.bag[item] <= 0) delete S.bag[item];
    return true;
  }
  function money(delta = 0) { S.player.money = Math.max(0, Math.min(999999, (S.player.money | 0) + delta)); return S.player.money; }
  function healAll() {
    for (const m of S.party) {
      if (G.Mon && G.Mon.heal) G.Mon.heal(m);
      else { m.hp = m.maxHp || m.hp || 20; m.status = null; }
    }
  }
  function badge(n) { if (!S.player.badges.includes(n)) S.player.badges.push(n); S.player.badges.sort((a, b) => a - b); }

  /**
   * Script conditions: 'flag', '!flag', 'var=v', 'var!=v', 'var>=n' (also <= > <),
   * 'has:item', 'badge:n', 'done:map:id'; 'party', 'money' and 'badges' are numbers
   * you can compare. A list means all of them; a function gets the state.
   */
  function test(c) {
    if (c == null || c === true) return true;
    if (Array.isArray(c)) return c.every(test);
    if (typeof c === 'function') return !!c(S);
    let s = String(c).trim();
    if (s[0] === '!' && s[1] !== '=') return !test(s.slice(1));
    if (s.startsWith('has:')) return count(s.slice(4)) > 0;
    if (s.startsWith('badge:')) return S.player.badges.includes(+s.slice(6));
    if (s.startsWith('done:')) return isDone(s.slice(5));
    const m = /^([\w.-]+?)\s*(>=|<=|!=|=|>|<)\s*(.+)$/.exec(s);
    if (!m) return flag(s);
    const [, k, op, rhs] = m;
    const lv = k === 'party' ? S.party.length : k === 'money' ? S.player.money : k === 'badges' ? S.player.badges.length : S.vars[k];
    const num = rhs !== '' && !isNaN(+rhs);
    const rv = num ? +rhs : rhs;
    const l = num ? +(lv || 0) : lv;
    switch (op) {
      case '=': return l == rv;            // eslint-disable-line eqeqeq
      case '!=': return l != rv;           // eslint-disable-line eqeqeq
      case '>=': return l >= rv;
      case '<=': return l <= rv;
      case '>': return l > rv;
      case '<': return l < rv;
    }
    return false;
  }

  const vars = () => ({ player: S.player.name, rival: S.rival.name });

  return { get save() { return S; }, get fake() { return fake; }, bind, reset,
           flag, setFlag, clearFlag, getVar, setVar, isDone, markDone,
           party, lead, makeMon, giveMon, count, giveItem, takeItem, money, healAll, badge, test, vars };
})();

G.World = (() => {
  const M = () => G.Maps;
  const TS = 32;
  let map = null;
  let me = null, follower = null;
  let actors = [];                       // npcs and trainers of this map
  let items = [];                        // { def, key, got }
  let locks = 0;
  let fadeA = 0;
  let healFx = null;
  let dom = null;
  let lastLoc = null;
  let started = false;
  let pendingClick = null;
  const debug = { noEnc: false, noclip: false };
  let rng = G.RNG(G.RNG.seed());

  // ---------------- sound and music ----------------

  function sfx(name, fallback) {
    const i = G.Audio._internals;
    if (fallback && i && i.SFX && !i.SFX[name]) name = fallback;
    G.Audio.sfx(name);
  }
  const SONG = { town: 'village', route: 'forest', forest: 'cave', cave: 'cave', center: 'village', mart: 'village',
                 house: 'village', lab: 'village', gym: 'boss' };
  function song(ctx) {
    if (!ctx) return null;
    const MM = G.MUSIC_MAP;
    if (MM) { const v = typeof MM.get === 'function' ? MM.get(ctx) : MM[ctx]; if (v) return v; }
    if (G.MUSIC && G.MUSIC[ctx]) return ctx;
    return SONG[ctx] || null;
  }

  // ---------------- DOM: menu button, place name ----------------

  function ensureDom() {
    if (dom) return dom;
    const frame = document.getElementById('frame');
    const btn = document.createElement('button');
    btn.className = 'ow-menu hidden';
    btn.title = G.T('Menu');
    btn.setAttribute('aria-label', G.T('Menu'));
    btn.setAttribute('translate', 'no');
    btn.innerHTML = '<span></span><span></span><span></span>';
    btn.addEventListener('click', e => { e.stopPropagation(); if (!locks && !G.UI.anyOpen()) openMenu(); });
    const banner = document.createElement('div');
    banner.className = 'ow-banner';
    banner.setAttribute('translate', 'no');
    frame.appendChild(btn); frame.appendChild(banner);
    dom = { btn, banner, bannerT: 0 };
    return dom;
  }

  function showBanner(text) {
    const d = ensureDom();
    d.banner.textContent = text;
    d.banner.classList.remove('show');
    void d.banner.offsetWidth;
    d.banner.classList.add('show');
    clearTimeout(d.bannerT);
    d.bannerT = setTimeout(() => d.banner.classList.remove('show'), 2400);
  }

  function openMenu() {
    if (G.StartMenu && G.StartMenu.open) { sfx('menu'); G.StartMenu.open(); }
    else if (G.OptionsUI) { sfx('menu'); G.OptionsUI.open(); }
  }

  // ---------------- loading maps ----------------

  function makeActors() {
    actors = [];
    const id = map.id;
    for (const d of map.npcs) actors.push(new G.Actor({ id: d.id, who: d.who, x: d.x, y: d.y, dir: d.dir || 'down', def: d }));
    for (const d of map.trainers) {
      const a = new G.Actor({ id: d.id, who: d.who, x: d.x, y: d.y, dir: d.dir || 'down', def: d });
      a.trainer = true; a.key = id + ':' + d.id;
      actors.push(a);
    }
    items = map.items.map(d => ({ def: d, key: id + ':' + d.flag }));
    refresh();
  }

  /** Who is on the map depends on flags (npc `if`); collected items disappear. */
  function refresh() {
    for (const a of actors) {
      if (a.forced != null) a.visible = a.forced;
      else a.visible = G.Field.test(a.def.if);
    }
    for (const it of items) it.got = G.Field.isDone(it.key);
  }

  function makeFollower() {
    const lead = G.Field.lead();
    if (!lead || G.Settings.get('follower') === false) { follower = null; return; }
    if (!follower || follower.mon !== lead.sp) follower = new G.Actor({ id: 'follower', mon: lead.sp, shiny: !!lead.shiny });
    // One tile behind the player, if there is room; else under the player (hidden) until the first step.
    const [dx, dy] = M().DIRS[M().OPP[me.dir]];
    const bx = me.x + dx, by = me.y + dy;
    if (openTile(bx, by) && !occupant(bx, by) && !M().info(M().kindAt(map, bx, by)).warp) { follower.place(bx, by, me.dir); follower.visible = true; }
    else { follower.place(me.x, me.y, me.dir); follower.visible = false; }
  }

  /** Loads a map and puts the player on a spot (name, 'x,y' or {x, y, dir}). */
  function load(id, where) {
    const m = M().get(id);
    if (!m) { console.error('[World] unknown map ' + id); G.UI.toast('Unknown map: ' + id); return false; }
    map = m;
    const s = (where && typeof where === 'object' && !Array.isArray(where)) ? { x: where.x | 0, y: where.y | 0, dir: where.dir || 'down' }
      : M().spot(m, where) || M().spot(m, Object.keys(m.spots)[0]) || { x: m.w >> 1, y: m.h >> 1, dir: 'down' };
    if (!me) me = new G.Actor({ id: 'player', who: playerSprite() });
    me.who = playerSprite();
    me.place(s.x, s.y, s.dir);
    me.queue.length = 0;
    makeActors();
    makeFollower();
    G.Player.reset();
    G.WorldRender.prepare(m);
    savePos();
    const tune = song(m.music);
    if (tune) G.Audio.music(tune);
    if (m.tileset === 'outdoor' && m.loc && m.loc !== lastLoc) showBanner(G.Names.loc(m.loc));
    if (m.loc) lastLoc = m.loc;
    snapCamera();
    return true;
  }

  function playerSprite() { return G.Field.save.player.gender === 'f' ? 'player-girl' : 'player-boy'; }

  function savePos() {
    const p = G.Field.save.player;
    p.map = map.id; p.x = me.x; p.y = me.y; p.dir = me.dir;
  }

  /** The camera follows the player; a small interior stays centred (no black above its walls). */
  function snapCamera() {
    if (!me) return;
    let x = me.wx, y = me.wy - 8;
    if (map && map.tileset !== 'outdoor') {
      const W = map.w * TS, H = map.h * TS, vw = G.Camera.w, vh = G.Camera.h;
      x = W <= vw ? W / 2 : G.U.clamp(x, vw / 2, W - vw / 2);
      y = H <= vh ? H / 2 : G.U.clamp(y, vh / 2, H - vh / 2);
    }
    G.Camera.snap(x, y);
  }

  /** Crossing into a connected map: everything is re-based on the new map. */
  function cross(a) {
    const nb = a.nb;
    const from = map;
    map = a.map;
    me.x -= nb.ox; me.y -= nb.oy; me.fx -= nb.ox; me.fy -= nb.oy;
    if (follower) { follower.x -= nb.ox; follower.y -= nb.oy; follower.fx -= nb.ox; follower.fy -= nb.oy; }
    makeActors();
    G.WorldRender.prepare(map);
    savePos();
    const tune = song(map.music);
    if (tune && song(from.music) !== tune) G.Audio.music(tune);
    if (map.loc && map.loc !== lastLoc) showBanner(G.Names.loc(map.loc));
    if (map.loc) lastLoc = map.loc;
    snapCamera();
  }

  function fadeTo(target, secs = 0.22) {
    return new Promise(res => {
      const from = fadeA, t0 = performance.now();
      (function tick() {
        const k = Math.min(1, (performance.now() - t0) / (secs * 1000));
        fadeA = from + (target - from) * k;
        if (k < 1) requestAnimationFrame(tick); else res();
      })();
    });
  }

  /** Fade out, load, fade in. Runs the map's `enter` script afterwards. */
  async function warp(id, spot, o = {}) {
    locks++;
    try {
      if (o.sfx !== false) sfx(o.sfx || 'door', 'click');
      await fadeTo(1, 0.2);
      load(id, spot);
      await fadeTo(0, 0.2);
    } finally { locks--; }
    if (map.def.enter && !o.noEnter) await runScript(map.def.enter, {});
  }

  // ---------------- tiles and people ----------------

  function openTile(x, y) {
    if (M().inside(map, x, y)) return !map.solid[y * map.w + x];
    const a = M().across(map, x, y);
    return !!a && M().open(a.map, a.x, a.y);
  }
  /** The visible person (or item) on a tile, else null. */
  function occupant(x, y, except) {
    for (const a of actors) if (a !== except && a.visible && a.x === x && a.y === y) return a;
    for (const it of items) if (!it.got && !it.def.hidden && it.def.x === x && it.def.y === y) return it;
    if (me && me !== except && me.x === x && me.y === y) return me;
    return null;
  }
  const itemAt = (x, y) => items.find(it => !it.got && it.def.x === x && it.def.y === y) || null;

  /**
   * The player asks to step: -> 'moved' | 'blocked' | 'warped'.
   * (Called by G.Player; it starts the step itself.)
   */
  function tryStep(a, dir, speed) {
    const [dx, dy] = M().DIRS[dir];
    const nx = a.x + dx, ny = a.y + dy;
    // Exit mats: pressing down on one leaves.
    if (dir === 'down' && M().kindAt(map, a.x, a.y) === 'mat' && !openTile(nx, ny)) {
      const w = map.warpAt.get(M().key(a.x, a.y));
      if (w) { a.face('down'); warp(w.to, w.spot); return 'warped'; }
    }
    if (debug.noclip && M().inside(map, nx, ny)) { stepActor(a, dir, speed, false); return 'moved'; }
    const k = M().kindAt(map, nx, ny);
    if (M().inside(map, nx, ny) && M().info(k).ledge === dir) {
      if (openTile(nx + dx, ny + dy) && !occupant(nx + dx, ny + dy, a)) {
        sfx('ledge', 'select');
        stepActor(a, dir, speed, true);
        return 'moved';
      }
      return 'blocked';
    }
    if (!openTile(nx, ny)) return 'blocked';
    if (occupant(nx, ny, a)) return 'blocked';
    if (!M().inside(map, nx, ny)) {
      // Into a connected map: its people (where they start) block too.
      const c = M().across(map, nx, ny);
      if (c.map.npcs.concat(c.map.trainers).some(p => p.x === c.x && p.y === c.y && G.Field.test(p.if))) return 'blocked';
    }
    stepActor(a, dir, speed, false);
    return 'moved';
  }

  /** Starts a step; the follower takes the tile the player leaves. */
  function stepActor(a, dir, speed, hop) {
    const ox = a.x, oy = a.y;
    a.step(dir, speed, hop);
    if (a === me && follower) {
      const fx = follower.x, fy = follower.y;
      const d = Math.abs(ox - fx) + Math.abs(oy - fy);
      if (d === 1) {
        const fdir = ox > fx ? 'right' : ox < fx ? 'left' : oy > fy ? 'down' : 'up';
        follower.step(fdir, speed);
        follower.dur = a.dur;
        follower.visible = true;
      } else if (d > 1) { follower.place(ox, oy, dir); follower.visible = true; }
    }
  }

  /** The player arrived on a tile: warps, connections, triggers, trainers, grass. */
  function arrived(a) {
    if (a !== me) return;
    if (!M().inside(map, me.x, me.y)) {
      const c = M().across(map, me.x, me.y);
      if (c) cross(c);
      return;
    }
    savePos();
    const k = M().kindAt(map, me.x, me.y);
    const w = map.warpAt.get(M().key(me.x, me.y));
    if (w && (k !== 'mat' || me.dir === 'down')) { warp(w.to, w.spot); return; }
    for (const t of map.triggers) {
      if (me.x >= t.x && me.y >= t.y && me.x < t.x + (t.w || 1) && me.y < t.y + (t.h || 1) && G.Field.test(t.if)) {
        G.Player.walk(null);
        runScript(t.script, { trigger: t });
        return;
      }
    }
    if (spotted()) return;
    if (k === 'tall') {
      sfx('grass');
      maybeEncounter('walk');
    }
  }

  // ---------------- encounters ----------------

  function rollWild(method) {
    const table = M().encounters(map, method);
    if (!table || !table.mons || !table.mons.length) return null;
    if (!(rng.next() < (table.rate || 0) / 180)) return null;
    let r = rng.next() * 100;
    let pick = table.mons[table.mons.length - 1];
    for (const row of table.mons) { if ((r -= row[3]) < 0) { pick = row; break; } }
    const sp = M().species(pick[0]);
    return { sp, lvl: rng.int(pick[1], pick[2]), method, map: map.id, area: typeof map.encounters[method] === 'string' ? map.encounters[method].slice(1) : null };
  }

  function maybeEncounter(method) {
    if (debug.noEnc || !G.Field.party().length) return false;
    const wild = rollWild(method);
    if (!wild) return false;
    G.Player.walk(null);
    wildBattle(wild);
    return true;
  }

  async function wildBattle(wild) {
    locks++;
    let out;
    try {
      G.Field.save.dex.seen[wild.sp] = 1;
      out = await (api.onEncounter ? api.onEncounter(wild) : fallbackBattle(G.I18n.fmt('Wild {mon} appeared!', { mon: G.Names.mon(wild.sp) })));
    } finally { locks--; }
    if (out === 'lose') await blackout();
    return out;
  }

  /** No battle screen yet (before M4): say what would happen and count it as won. */
  async function fallbackBattle(text) {
    G.UI.toast(text);
    await wait(700);
    return 'win';
  }

  // ---------------- trainers ----------------

  /** Is the player in the sight line of a trainer still waiting to battle? */
  function spotted() {
    for (const t of actors) {
      if (!t.trainer || !t.visible || G.Field.isDone(t.key) || t.moving) continue;
      const n = t.def.sight | 0;
      const [dx, dy] = M().DIRS[t.dir];
      for (let i = 1; i <= n; i++) {
        const x = t.x + dx * i, y = t.y + dy * i;
        if (me.x === x && me.y === y) {
          G.Player.walk(null);
          trainerBattle(t, true);
          return true;
        }
        if (!openTile(x, y) || occupant(x, y, t)) break;
      }
    }
    return false;
  }

  async function trainerBattle(t, seen) {
    locks++;
    try {
      if (seen) {
        sfx('exclaim', 'error');
        await emote(t, '!');
        // Walk up to the player.
        const [dx, dy] = M().DIRS[t.dir];
        const dist = Math.abs(me.x - t.x) + Math.abs(me.y - t.y);
        if (dist > 1 && (me.x - t.x) * dx + (me.y - t.y) * dy > 0) await moveActor(t, new Array(dist - 1).fill(t.dir), 4);
      }
      faceEachOther(t);
      if (t.def.before) await say(t.def.before, { name: trainerName(t.def) });
      const out = await battle(t.def, { key: t.key });
      if (out !== 'lose') {
        G.Field.markDone(t.key);
        if (!api.onTrainer && t.def.defeat) await say(t.def.defeat, { name: trainerName(t.def) });
      }
    } finally { locks--; }
  }

  function trainerName(d) {
    if (!d.name) return null;
    const cls = G.TRAINER_CLASSES && G.TRAINER_CLASSES[d.cls];
    const label = cls && cls.name ? G.T(cls.name) : d.cls ? G.Names.pretty(d.cls) : '';
    return label ? label + ' ' + G.T(d.name) : G.T(d.name);
  }

  /** A trainer battle through the M4 hook. ref: a trainer def, 'id' on this map or 'map:id'. */
  async function battle(ref, o = {}) {
    let d = ref, key = o.key;
    if (typeof ref === 'string') {
      const [mid, tid] = ref.includes(':') ? ref.split(':') : [map.id, ref];
      const m = M().get(mid);
      d = m && m.trainers.find(t => t.id === tid);
      key = mid + ':' + tid;
      if (!d) { console.error('[World] no trainer ' + ref); return 'win'; }
    }
    key = key || map.id + ':' + d.id;
    locks++;
    let out;
    try {
      out = await (api.onTrainer ? api.onTrainer(d, { map: map.id, key, canLose: !!o.canLose })
        : fallbackBattle(trainerName(d) || G.Names.pretty(d.id)));
    } finally { locks--; }
    if (out !== 'lose') G.Field.markDone(key);
    else if (!o.canLose) await blackout();
    return out;
  }

  /** Lost: back to the last place you healed, healed. */
  async function blackout() {
    const p = G.Field.save.player;
    const to = p.lastHeal || (map && { map: map.id, spot: Object.keys(map.spots)[0] });
    G.Field.healAll();
    if (to && M().has(to.map)) await warp(to.map, to.spot, { sfx: false, noEnter: true });
  }

  // ---------------- talking ----------------

  function faceEachOther(a) {
    const dx = me.x - a.x, dy = me.y - a.y;
    const toMe = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    if (!a.def || !a.def.fixed) a.face(toMe);
    me.face(M().OPP[toMe]);
  }

  /** A pressed: whatever is in front of the player. */
  function interact() {
    const [dx, dy] = M().DIRS[me.dir];
    const tx = me.x + dx, ty = me.y + dy;
    const who = occupant(tx, ty, me);
    if (who && who instanceof G.Actor) return talk(who);
    if (follower && follower.visible && follower.x === tx && follower.y === ty) return talkFollower();
    const it = itemAt(tx, ty);
    if (it) return pickUp(it);
    const k = M().kindAt(map, tx, ty);
    if (M().info(k).counter) {
      const beyond = occupant(tx + dx, ty + dy, me);
      if (beyond && beyond instanceof G.Actor) return talk(beyond);
    }
    const sign = map.signs[M().key(tx, ty)];
    if (sign) return runScript([['say', sign]], {});
    if (k === 'pc') return runScript([['sfx', 'pc'], ['say', '{player} turned on the PC.'], ['pc']], {});
    return null;
  }

  function talk(a) {
    if (a.trainer && !G.Field.isDone(a.key)) return trainerBattle(a, false);
    sfx('select');
    faceEachOther(a);
    const d = a.def || {};
    if (a.trainer) return runScript(d.afterScript || [['say', d.after || '…']], { self: a });
    if (d.script) return runScript(d.script, { self: a });
    if (d.say) return runScript([['say', d.say]], { self: a });
    return null;
  }

  const FOLLOW_LINES = [['say', '{mon} looks happy to be with you.'], ['say', '{mon} is enjoying the walk.'],
                        ['say', '{mon} sniffs the air curiously.'], ['say', '{mon} gives you a cheerful look.']];
  function talkFollower() {
    const lead = G.Field.lead();
    if (!lead) return null;
    follower.face(M().OPP[me.dir]);
    if (follower.anim) follower.anim.play('Hop');
    const line = FOLLOW_LINES[Math.floor(Math.random() * FOLLOW_LINES.length)];
    sfx('cry', 'select');
    return runScript([['say', line[1], { vars: { mon: lead.nick || G.Names.mon(lead.sp) } }]], {});
  }

  function pickUp(it) {
    const d = it.def;
    return runScript([['found', d.item, d.n || 1, it.key]], {});
  }

  // ---------------- scripts ----------------

  function runScript(s, ctx) {
    const cmds = Array.isArray(s) ? s : G.Script.get(s);
    if (!cmds) { console.error('[World] unknown script ' + s); return null; }
    return G.Script.run(cmds, host(ctx));
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function say(text, o = {}) {
    const lines = Array.isArray(text) ? text : [text];
    const v = Object.assign(G.Field.vars(), o.vars || {});
    return lines.reduce((p, t) => p.then(() => G.Dialog.say(G.I18n.fmt(t, v), { name: o.name })), Promise.resolve());
  }

  /** Looks up an actor for scripts: 'player', 'follower', 'self', or an npc / trainer id. */
  function actor(id, ctx) {
    if (id === 'player' || id === 'me') return me;
    if (id === 'follower') return follower;
    if ((id === 'self' || id === 'this' || id == null) && ctx && ctx.self) return ctx.self;
    return actors.find(a => a.id === id) || null;
  }

  /** Walks an actor along directions (scripts, trainers). Resolves when it stops. */
  function moveActor(a, dirs, speed = 4) {
    if (!a || !dirs.length) return Promise.resolve();
    return new Promise(res => {
      for (const d of dirs) a.queue.push({ dir: d, speed });
      a.queueDone = res;
    });
  }

  function emote(a, ch = '!', secs = 0.7) {
    if (!a) return Promise.resolve();
    return new Promise(res => { a.emote = { ch, t: secs, done: res }; });
  }

  async function healAnim(ctx) {
    const nurse = ctx && ctx.self || actors.find(a => a.who === 'nurse');
    let mx = -1, my = -1;
    for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) if (map.kind[y * map.w + x] === 'healer') { mx = x; my = y; }
    const back = nurse && nurse.dir;
    if (nurse && mx >= 0) nurse.face(mx < nurse.x ? 'left' : mx > nurse.x ? 'right' : 'up');
    const n = Math.max(1, Math.min(6, G.Field.party().length));
    healFx = mx >= 0 ? { x: mx, y: my, n: 0, flash: false } : null;
    for (let i = 0; i < n; i++) { if (healFx) healFx.n = i + 1; sfx('select'); await wait(260); }
    if (healFx) healFx.flash = true;
    if (G.Audio.jingle) { try { await G.Audio.jingle('heal'); } catch (e) { /* no jingles yet */ } }
    else { sfx('heal'); await wait(1400); }
    healFx = null;
    if (nurse && back) nurse.face(back);
  }

  /** What G.Script commands act on (script.js keeps flags and logic itself). */
  function host(ctx = {}) {
    return {
      ctx,
      lock() { locks++; },
      unlock() { locks = Math.max(0, locks - 1); refresh(); },
      vars: () => G.Field.vars(),
      say: (text, o) => say(text, o),
      choice: (text, o = {}) => G.Dialog.ask(G.I18n.fmt(text, Object.assign(G.Field.vars(), o.vars || {})),
        { options: o.options && o.options.map(s => G.T(s)), name: o.name }),
      actor: id => actor(id, ctx),
      move: (id, dirs, speed) => moveActor(actor(id, ctx), dirs, speed),
      walkTo(id, x, y) {
        const a = actor(id, ctx);
        if (!a) return Promise.resolve();
        const p = G.Path4.find(a, [{ x, y }], { open: (tx, ty) => openTile(tx, ty) && !occupant(tx, ty, a), ledge: (tx, ty) => M().ledge(map, tx, ty) });
        return p ? moveActor(a, p.dirs, 4) : Promise.resolve();
      },
      face(id, dir) {
        const a = actor(id, ctx);
        if (!a) return;
        const b = M().DIRS[dir] ? null : actor(dir, ctx);
        if (b) { const dx = b.x - a.x, dy = b.y - a.y; a.face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }
        else a.face(dir);
      },
      emote: (id, ch) => emote(actor(id, ctx), ch),
      show(id) { const a = actor(id, ctx); if (a) { a.forced = true; a.visible = true; } },
      hide(id) { const a = actor(id, ctx); if (a) { a.forced = false; a.visible = false; } },
      place(id, x, y, dir) { const a = actor(id, ctx); if (a) a.place(x, y, dir); },
      warp: (m, spot) => warp(m, spot),
      fade: (dir, secs) => fadeTo(dir === 'in' ? 0 : 1, secs || 0.3),
      wait,
      battle: (ref, o) => battle(ref, o),
      wild: (sp, lvl) => wildBattle({ sp: M().species(sp), lvl, method: 'scripted', map: map.id, area: null }),
      heal: () => G.Field.healAll(),
      healAnim: () => healAnim(ctx),
      lastHeal(spot) { G.Field.save.player.lastHeal = { map: map.id, spot }; },
      async shop(stock) {
        if (G.ShopUI && G.ShopUI.open) return G.ShopUI.open(stock);
        G.UI.toast(G.T('Coming soon'));
      },
      async pc() {
        if (G.PCUI && G.PCUI.open) return G.PCUI.open();
        G.UI.toast(G.T('Coming soon'));
      },
      music: name => G.Audio.music(song(name) || name),
      sfx: name => sfx(name),
      jingle: name => (G.Audio.jingle ? Promise.resolve(G.Audio.jingle(name)).catch(() => {}) : Promise.resolve()),
      itemName: id => G.Names.item(id),
      monName: sp => G.Names.mon(M().species(sp))
    };
  }

  // ---------------- clicks and taps on the map ----------------

  function onClick(c) {
    const k = G.Camera.scale;
    const wx = c.x / k + G.Camera.left(), wy = c.y / k + G.Camera.top();
    const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
    if (tx === me.x && ty === me.y) {
      if (M().kindAt(map, tx, ty) === 'mat') tryStep(me, 'down', 4);
      return;
    }
    const pathOpen = (x, y) => openTile(x, y) && !occupant(x, y, me);
    const ledge = (x, y) => M().inside(map, x, y) ? M().ledge(map, x, y) : null;
    const target = clickTarget(tx, ty);
    let goals;
    if (target) {
      goals = [];
      for (const [dir, dx, dy] of G.Path4.D4) {
        const ax = tx - dx, ay = ty - dy;
        if ((ax === me.x && ay === me.y) || pathOpen(ax, ay)) goals.push({ x: ax, y: ay, face: dir });
        else if (M().info(M().kindAt(map, ax, ay)).counter && (pathOpen(ax - dx, ay - dy) || (ax - dx === me.x && ay - dy === me.y))) goals.push({ x: ax - dx, y: ay - dy, face: dir });
      }
      if (!goals.length) return;
      const here = goals.find(g => g.x === me.x && g.y === me.y);
      if (here) { me.face(here.face); interact(); return; }
    } else goals = [{ x: tx, y: ty }];
    const p = G.Path4.find(me, goals, { open: pathOpen, ledge, near: !target, max: 5000 });
    if (!p || (!p.dirs.length && !target)) return;
    const goal = p.goal;
    G.Player.walk({
      dirs: p.dirs, goal, target: !!target, run: p.dirs.length > 10, fresh: true,
      then: target ? () => { me.face(goal.face); interact(); }
        : () => { if (M().kindAt(map, me.x, me.y) === 'mat' && me.x === tx && me.y === ty) tryStep(me, 'down', 4); }
    });
  }

  /** Something to talk to or read on this tile? */
  function clickTarget(tx, ty) {
    const who = occupant(tx, ty, me);
    if (who) return who;
    if (follower && follower.visible && follower.x === tx && follower.y === ty) return follower;
    if (itemAt(tx, ty)) return { item: true };
    if (map.signs[M().key(tx, ty)] || M().kindAt(map, tx, ty) === 'pc') return { sign: true };
    return null;
  }

  /** A click walk got blocked (someone stepped in the way): find a new way, or give up. */
  function repath(p) {
    if (!p || !p.goal) return null;
    const pathOpen = (x, y) => openTile(x, y) && !occupant(x, y, me);
    const np = G.Path4.find(me, [p.goal], { open: pathOpen, ledge: (x, y) => M().inside(map, x, y) ? M().ledge(map, x, y) : null, max: 5000 });
    if (!np || !np.dirs.length || p.retried) return null;
    return Object.assign({}, p, { dirs: np.dirs, retried: true });
  }

  // ---------------- people moving on their own ----------------

  function updateActor(a, dt) {
    if (a.update(dt) && a === me && !a.scripted) arrived(a);
    if (!a.moving && a.queue.length) {
      const q = a.queue.shift();
      if (a === me) { a.scripted = true; stepActor(a, q.dir, q.speed, false); }
      else a.step(q.dir, q.speed);
    } else if (!a.moving && !a.queue.length) {
      if (a === me) a.scripted = false;
      if (a.queueDone) { const d = a.queueDone; a.queueDone = null; d(); }
    }
  }

  function wander(a, dt) {
    const d = a.def;
    if (!d || !a.visible || a.moving || a.queue.length || a.emote) return;
    const mode = d.move || 'still';
    if (mode === 'still') return;
    a.wait -= dt;
    if (a.wait > 0) return;
    a.wait = G.U.rand(1.2, 3.6);
    if (mode === 'spin') { a.face({ down: 'left', left: 'up', up: 'right', right: 'down' }[a.dir]); return; }
    const dir = G.U.pick(['up', 'down', 'left', 'right']);
    if (mode === 'look') { a.face(dir); return; }
    const [dx, dy] = M().DIRS[dir];
    const nx = a.x + dx, ny = a.y + dy, r = d.r == null ? 2 : d.r;
    const near = Math.abs(nx - a.home.x) <= r && Math.abs(ny - a.home.y) <= r;
    const busy = (me.x === nx && me.y === ny) || (me.fx === nx && me.fy === ny) || (follower && follower.x === nx && follower.y === ny);
    if (near && M().open(map, nx, ny) && !occupant(nx, ny, a) && !busy && !M().info(M().kindAt(map, nx, ny)).warp) a.step(dir, 3);
    else a.face(dir);
  }

  // ---------------- the mode ----------------

  function start(o = {}) {
    register();
    started = true;
    // Until the real save exists (M5): a fake party, so the follower has someone to show.
    if (G.Field.fake && !G.Field.party().length) G.Field.giveMon(25, 5);
    G.UI.closeAll();
    G.Game.setMode('overworld', o);
  }

  function enter(arg) {
    ensureDom();
    if (arg && arg.map) {
      fadeA = 1;
      load(arg.map, arg.spot != null ? arg.spot : (arg.x != null ? { x: arg.x, y: arg.y, dir: arg.dir } : null));
      fadeTo(0, 0.3).then(() => { if (map.def.enter) runScript(map.def.enter, {}); });
    } else if (map) {
      refresh();
      makeFollower();
      const tune = song(map.music);
      if (tune) G.Audio.music(tune);
    }
    dom.btn.classList.remove('hidden');
  }

  function exit() {
    if (dom) { dom.btn.classList.add('hidden'); dom.banner.classList.remove('show'); }
    G.Player.walk(null);
  }

  function update(dt, o = {}) {
    if (!map || !me) return;
    const ui = !!o.ui || G.UI.anyOpen();
    const control = !ui && !locks && !G.Dialog.open;
    // A click during a step waits for the step to end (the newest click wins).
    if (control) {
      for (const c of G.Input.clicks()) pendingClick = c;
      if (pendingClick && !me.moving) { onClick(pendingClick); pendingClick = null; }
    } else pendingClick = null;
    if (control || (me.moving && !me.scripted && !me.queue.length)) G.Player.update(dt, me, api);
    else updateActor(me, dt);
    if (follower) {
      follower.update(dt);
      if (follower.x === me.x && follower.y === me.y && !follower.moving) follower.visible = false;
    }
    for (const a of actors) {
      updateActor(a, dt);
      if (!locks && !ui) {
        const before = a.dir;
        wander(a, dt);
        if (a.trainer && a.dir !== before && !me.moving) spotted();
      }
    }
    if (dom) dom.btn.classList.toggle('hidden', !!(locks || G.Dialog.open || ui));
    snapCamera();
  }

  function render(ctx, view) {
    if (!map) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, view.w, view.h); return; }
    G.WorldRender.draw(ctx, view, {
      map, me, follower, actors, items, fade: fadeA, healFx,
      emotes: [me, follower, ...actors].filter(a => a && a.emote && a.visible)
    });
  }

  const api = {
    start, warp, load, tryStep, arrived, interact, openMenu, repath, sfx, song, refresh, runScript, battle, blackout,
    actor: id => actor(id, {}), host, debug,
    onEncounter: null, onTrainer: null,
    get map() { return map; }, get player() { return me; }, get follower() { return follower; },
    get actors() { return actors; }, get items() { return items; },
    get locked() { return locks > 0 || (G.Dialog && G.Dialog.open); }, get started() { return started; },
    get rng() { return rng; }, seed(s) { rng = G.RNG(s); }
  };

  // The follower setting applies at once.
  if (G.Settings) G.Settings.on((k, v) => { if (k === 'follower' && map && me) { if (v === false) follower = null; else makeFollower(); } });

  // game.js loads after the world files: register the mode once it exists.
  let registered = false;
  function register() {
    if (registered || !G.Game) return;
    G.Game.define('overworld', { enter, exit, update, render });
    registered = true;
  }
  if (G.Game) register(); else addEventListener('DOMContentLoaded', register);
  return api;
})();
