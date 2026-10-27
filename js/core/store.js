/* ============ store.js — save slots in localStorage (docs/DESIGN.md §6) ============
 * Three slots, pl.save.1 to pl.save.3, each a JSON save. Before a slot is
 * written its old save is copied to pl.save.N.bak, and a slot that no longer
 * parses loads its .bak instead. pl.slot is the slot used last.
 *
 *   G.Store.newSave({ name, gender, rival, id })   a fresh game
 *   G.Store.slots()         -> [summary | null] × 3   { slot, name, gender, badges, dex, playTime, savedAt, map, party: [sp] }
 *   G.Store.load(n)         -> save (migrated and sanitised) | null    G.Store.usedBackup: it came from the .bak
 *   G.Store.write(n, save)  -> true | false (storage full or blocked)
 *   G.Store.remove(n)       the slot and its .bak
 *   G.Store.lastSlot()      -> 1..3 | null
 *   G.Store.exportText(save)   JSON text of { app: 'PokeLeague', kind: 'save', v, at, save }
 *   G.Store.importText(text)   -> { save } | { error: 'not-json' | 'other-app' | 'newer' | 'bad' }
 *   G.Store.migrate(s) · sanitize(s)    (also used by tests)
 *   G.Store.use(storage)    another storage (tests)
 *
 * G.Session, below, is the game being played: its slot, the play time, save().
 */
G.Store = (() => {
  const V = 1, APP = 'PokeLeague', SLOTS = 3, BOXES = 8, BOX_SIZE = 30;
  const KEY = n => 'pl.save.' + n;
  const MAX_NAME = 10;
  let storage = null;
  const st = () => storage || window.localStorage;

  /**
   * MIG[v] turns a version v save into a version v + 1 one, in place.
   * Nothing to do yet: version 1 is the first.
   */
  const MIG = {};

  /** A player or Pokémon name: no control characters, single spaces, at most `max` characters. */
  function cleanName(s, max = MAX_NAME) {
    if (typeof s !== 'string') return '';
    const t = s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim();
    return [...t].slice(0, max).join('').trim();
  }

  function emptyBoxes() {
    const out = [];
    for (let i = 0; i < BOXES; i++) out.push(new Array(BOX_SIZE).fill(null));
    return out;
  }

  function newSave(o = {}) {
    const now = Date.now();
    return {
      v: V, app: APP, created: now, savedAt: 0, playTime: 0,
      player: { name: cleanName(o.name) || 'Red', gender: o.gender === 'f' ? 'f' : 'm',
                id: o.id != null ? (o.id >>> 0) % 65536 : now % 65536,
                money: 3000, badges: [], map: null, x: 0, y: 0, dir: 'down', lastHeal: null },
      rival: { name: cleanName(o.rival) || 'Blue', starter: null },
      party: [], boxes: emptyBoxes(), box: 0, bag: {}, repel: 0,
      dex: { seen: {}, caught: {} }, flags: {}, vars: {}, done: {}, fame: []
    };
  }

  // ---------------- versions ----------------

  /** Runs the migrations up to `to` (default: this version). Throws 'newer' for a save of a later version. */
  function migrate(s, to = V, steps = MIG) {
    if (!s.v) s.v = 1;
    if (s.v > to) throw new Error('newer');
    while (s.v < to) {
      const f = steps[s.v];
      if (!f) throw new Error('no migration from v' + s.v);
      f(s);
      s.v++;
    }
    return s;
  }

  // ---------------- sanitising ----------------

  const obj = v => v && typeof v === 'object' && !Array.isArray(v);
  const int = (v, lo, hi, d) => (typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, Math.floor(v))) : d);
  const DIRS = ['up', 'down', 'left', 'right'];
  const STATUS = ['psn', 'tox', 'brn', 'par', 'slp', 'frz'];
  const knownSp = id => !G.SPECIES || !!G.SPECIES[id];
  const knownMove = id => typeof id === 'string' && (!G.MOVES || !!G.MOVES[id]);

  let fixed = 0;
  /** A Pokémon as the game can use it, or null when it cannot be saved (unknown species, no moves). */
  function fixMon(m) {
    if (!obj(m)) return null;
    const sp = +m.sp;
    if (!Number.isInteger(sp) || !knownSp(sp)) return null;
    const moves = (Array.isArray(m.moves) ? m.moves : []).filter(x => obj(x) && knownMove(x.id)).slice(0, 4)
      .map(x => ({ id: x.id, ppUp: int(x.ppUp, 0, 3, 0), pp: int(x.pp, 0, 64, 0) }));
    if (!moves.length) return null;
    const six = (a, hi) => (Array.isArray(a) && a.length === 6 ? a.map(v => int(v, 0, hi, 0)) : [0, 0, 0, 0, 0, 0]);
    const out = Object.assign({}, m, {
      uid: typeof m.uid === 'string' && m.uid ? m.uid.slice(0, 24) : 'fix' + (fixed++).toString(36) + Date.now().toString(36),
      sp, nick: cleanName(m.nick) || null, lvl: int(m.lvl, 1, 100, 5), moves,
      ivs: six(m.ivs, 31), evs: six(m.evs, 255),
      status: STATUS.includes(m.status) ? m.status : null,
      slp: int(m.slp, 0, 7, 0), tox: int(m.tox, 0, 15, 0),
      shiny: !!m.shiny, friendship: int(m.friendship, 0, 255, 70),
      gender: m.gender === 'm' || m.gender === 'f' ? m.gender : null
    });
    if (G.NATURES && !G.NATURES[out.nature]) out.nature = 'hardy';
    if (G.Mon && G.Stats && G.GROWTH) {
      const gr = G.SPECIES[sp].gr, lo = G.Stats.expAt(gr, out.lvl), hi = out.lvl < 100 ? G.Stats.expAt(gr, out.lvl + 1) - 1 : lo;
      out.exp = int(m.exp, lo, hi, lo);
      out.hp = int(m.hp, 0, G.Mon.maxHp(out), G.Mon.maxHp(out));
      for (const x of out.moves) x.pp = Math.min(x.pp, G.Mon.ppMax(x.id, x.ppUp));
    } else {
      out.exp = int(m.exp, 0, 2e6, 0);
      out.hp = int(m.hp, 0, 999, 1);
    }
    if (out.status !== 'slp') out.slp = 0;
    return out;
  }

  /** Every field of a save checked against newSave(): missing ones get their default, bad ones are fixed. */
  function sanitize(s) {
    const d = newSave();
    if (!obj(s)) return d;
    const out = d;
    out.v = V;
    out.created = int(s.created, 0, 1e15, d.created);
    out.savedAt = int(s.savedAt, 0, 1e15, 0);
    out.playTime = int(s.playTime, 0, 1e9, 0);
    const p = obj(s.player) ? s.player : {};
    Object.assign(out.player, {
      name: cleanName(p.name) || 'Red', gender: p.gender === 'f' ? 'f' : 'm',
      id: int(p.id, 0, 65535, d.player.id), money: int(p.money, 0, 999999, 3000),
      badges: [...new Set((Array.isArray(p.badges) ? p.badges : []).filter(b => Number.isInteger(b) && b >= 1 && b <= 8))].sort((a, b) => a - b),
      map: typeof p.map === 'string' ? p.map : null, x: int(p.x, -999, 9999, 0), y: int(p.y, -999, 9999, 0),
      dir: DIRS.includes(p.dir) ? p.dir : 'down',
      lastHeal: obj(p.lastHeal) && typeof p.lastHeal.map === 'string'
        ? { map: p.lastHeal.map, spot: typeof p.lastHeal.spot === 'string' || typeof p.lastHeal.spot === 'number' ? p.lastHeal.spot : null } : null
    });
    // Saved on the water or on the Bicycle.
    if (p.surf) out.player.surf = 1;
    if (p.bike) out.player.bike = 1;
    const r = obj(s.rival) ? s.rival : {};
    out.rival = { name: cleanName(r.name) || 'Blue', starter: Number.isInteger(r.starter) && knownSp(r.starter) ? r.starter : null };
    // Party: at most six; any extra goes to the PC.
    const party = (Array.isArray(s.party) ? s.party : []).map(fixMon).filter(Boolean);
    out.party = party.slice(0, 6);
    const boxes = Array.isArray(s.boxes) ? s.boxes : [];
    const spill = party.slice(6);
    for (let b = 0; b < BOXES; b++) {
      const src = Array.isArray(boxes[b]) ? boxes[b] : [];
      for (let i = 0; i < BOX_SIZE; i++) out.boxes[b][i] = fixMon(src[i]);
      for (let i = BOX_SIZE; i < src.length; i++) { const m = fixMon(src[i]); if (m) spill.push(m); }
    }
    for (const m of spill) {
      const box = out.boxes.find(bx => bx.includes(null));
      if (box) box[box.indexOf(null)] = m;
    }
    out.box = int(s.box, 0, BOXES - 1, 0);
    if (obj(s.bag)) {
      for (const [k, n] of Object.entries(s.bag)) {
        const c = int(n, 0, 999, 0);
        if (c > 0 && (!G.ITEMS || G.ITEMS[k])) out.bag[k] = c;
      }
    }
    out.repel = int(s.repel, 0, 999, 0);
    // The Hall of Fame: each entry is the team that beat the Champion (at most 50 kept).
    out.fame = (Array.isArray(s.fame) ? s.fame : []).filter(obj).slice(-50).map(e => ({
      at: int(e.at, 0, 1e15, 0),
      party: (Array.isArray(e.party) ? e.party : []).filter(m => obj(m) && Number.isInteger(m.sp) && knownSp(m.sp)).slice(0, 6)
        .map(m => ({ sp: m.sp, lvl: int(m.lvl, 1, 100, 1), nick: typeof m.nick === 'string' ? cleanName(m.nick) || null : null, shiny: !!m.shiny }))
    }));
    const dex = obj(s.dex) ? s.dex : {};
    for (const k of ['seen', 'caught']) {
      if (obj(dex[k])) for (const id of Object.keys(dex[k])) if (dex[k][id] && knownSp(+id)) out.dex[k][+id] = 1;
    }
    for (const id of Object.keys(out.dex.caught)) out.dex.seen[id] = 1;
    for (const k of ['flags', 'done']) {
      if (obj(s[k])) for (const [f, v] of Object.entries(s[k])) if (v) out[k][f] = 1;
    }
    if (obj(s.vars)) {
      for (const [k, v] of Object.entries(s.vars)) {
        if (typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && isFinite(v))) out.vars[k] = v;
      }
    }
    return out;
  }

  // ---------------- slots ----------------

  const okSlot = n => Number.isInteger(n) && n >= 1 && n <= SLOTS;
  function read(key) {
    try { return st().getItem(key); } catch (e) { return null; }
  }
  /** The parsed save of a key, or null (missing, not JSON, not ours). */
  function parse(text) {
    if (!text) return null;
    try {
      const s = JSON.parse(text);
      return obj(s) && s.app === APP && obj(s.player) ? s : null;
    } catch (e) { return null; }
  }

  let usedBackup = false;
  function load(n) {
    usedBackup = false;
    if (!okSlot(n)) return null;
    for (const key of [KEY(n), KEY(n) + '.bak']) {
      const s = parse(read(key));
      if (!s) continue;
      try {
        const out = sanitize(migrate(s));
        usedBackup = key.endsWith('.bak');
        if (usedBackup) console.warn('[Store] slot ' + n + ' was damaged: loaded its backup');
        return out;
      } catch (e) { console.warn('[Store] slot ' + n + ': ' + e.message); }
    }
    return null;
  }

  function write(n, save) {
    if (!okSlot(n) || !obj(save)) return false;
    const key = KEY(n);
    try {
      const old = st().getItem(key);
      if (old && parse(old)) st().setItem(key + '.bak', old);
      save.v = V; save.app = APP; save.savedAt = Date.now();
      st().setItem(key, JSON.stringify(save));
      st().setItem('pl.slot', String(n));
      return true;
    } catch (e) {
      console.warn('[Store] could not save', e);
      return false;
    }
  }

  function remove(n) {
    if (!okSlot(n)) return;
    try {
      st().removeItem(KEY(n)); st().removeItem(KEY(n) + '.bak');
      if (lastSlot() === n) st().removeItem('pl.slot');
    } catch (e) { /* blocked */ }
  }

  function lastSlot() {
    const n = +read('pl.slot');
    return okSlot(n) ? n : null;
  }

  function summary(n) {
    const s = parse(read(KEY(n))) || parse(read(KEY(n) + '.bak'));
    if (!s) return read(KEY(n)) ? { slot: n, broken: true } : null;
    const p = s.player;
    const count = o => (obj(o) ? Object.keys(o).length : 0);
    return {
      slot: n, name: cleanName(p.name) || '?', gender: p.gender === 'f' ? 'f' : 'm',
      badges: Array.isArray(p.badges) ? p.badges.length : 0, dex: count(s.dex && s.dex.caught),
      playTime: int(s.playTime, 0, 1e9, 0), savedAt: int(s.savedAt, 0, 1e15, 0), map: typeof p.map === 'string' ? p.map : null,
      party: (Array.isArray(s.party) ? s.party : []).slice(0, 6).map(m => obj(m) ? +m.sp : 0).filter(knownSp),
      newer: (s.v | 0) > V
    };
  }
  const slots = () => [1, 2, 3].map(summary);

  // ---------------- export and import ----------------

  function exportText(save) {
    return JSON.stringify({ app: APP, kind: 'save', v: V, at: new Date().toISOString(), save });
  }

  function importText(text) {
    let f;
    try { f = JSON.parse(String(text).replace(/^\uFEFF/, '')); } catch (e) { return { error: 'not-json' }; }
    if (!obj(f)) return { error: 'bad' };
    // The export wrapper, or a bare save.
    const s = f.kind === 'save' && obj(f.save) ? f.save : f;
    if (f.app !== APP && s.app !== APP) return { error: 'other-app' };
    if (!obj(s) || !obj(s.player) || !Array.isArray(s.party)) return { error: 'bad' };
    try { return { save: sanitize(migrate(Object.assign({}, s, { app: APP }))) }; }
    catch (e) { return { error: e.message === 'newer' ? 'newer' : 'bad' }; }
  }

  return { V, APP, SLOTS, BOXES, BOX_SIZE, MAX_NAME, newSave, migrate, sanitize, fixMon, cleanName,
           slots, load, write, remove, lastSlot, exportText, importText,
           get usedBackup() { return usedBackup; }, use(s) { storage = s; } };
})();

/**
 * G.Session: the game being played.
 *   G.Session.begin(slot, save)   binds the save to the world (G.Field) and remembers the slot
 *   G.Session.slot                1..3, or null (a debug game started from the URL)
 *   G.Session.save(slot?)         writes the current game -> true | false
 *   G.Session.dirty               something may have changed since the last save
 * Play time counts the seconds the page is visible while a game is on.
 */
G.Session = (() => {
  let slot = null, lastSaved = -1;
  function begin(n, save) {
    slot = n || null;
    G.Field.bind(save);
    lastSaved = save.playTime | 0;
  }
  function save(n) {
    const to = n || slot;
    if (!to) return false;
    const ok = G.Store.write(to, G.Field.save);
    if (ok) { slot = to; lastSaved = G.Field.save.playTime | 0; }
    return ok;
  }
  setInterval(() => {
    if (typeof document === 'undefined' || document.hidden || !G.Field || !G.Game) return;
    if (['overworld', 'battle', 'evolve'].includes(G.Game.mode)) G.Field.save.playTime = (G.Field.save.playTime | 0) + 1;
  }, 1000);
  return { begin, save, get slot() { return slot; }, get dirty() { return (G.Field.save.playTime | 0) !== lastSaved; } };
})();
