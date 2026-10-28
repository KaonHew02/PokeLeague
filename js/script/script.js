/* ============ script.js — G.Script: event script interpreter ============
 * A script is a list of commands, each one an array: [name, ...args].
 *
 *   G.Script.def('pallet.oak-stops-you', [ ['say', 'Wait!'], ['move', 'oak', 'UUL'], … ])
 *   G.Script.def({ name: cmds, … })      several at once
 *   await G.Script.run(cmds, host)       host = G.World.host() by default; the
 *                                        player cannot move while a script runs
 *   G.Script.check(cmds)                 -> [errors] (tests, tools/map_check.js)
 *
 * Text (English keys, translated with G.I18n.fmt; {player} and {rival} are filled in):
 *   ['say', text | [texts], { name, vars }]      a dialog box (a list = one box after another)
 *   ['choice', text, [yes cmds], [no cmds], { options:['Yes','No'], name }]
 *   ['if', cond, [then], [else]]   cond: 'flag', '!flag', 'var>=3', 'has:potion', 'badge:1',
 *                                  'done:route2:rick', a list (all of them) — see G.Field.test
 *   ['call', 'script-name']        ['end']   stops the whole script
 * State:
 *   ['setFlag', f]  ['clearFlag', f]  ['setVar', k, v]  ['addVar', k, n]  ['badge', n]  ['dex', 'give']
 * Party and bag:
 *   ['giveMon', sp, lvl, opts]  opts.nickname: ask for a nickname afterwards (opts also go to G.Mon.create)
 *   ['giveItem', item, n, { quiet }]  ['takeItem', item, n]  ['money', delta]
 *   ['found', item, n, doneKey]    an item ball: "found", jingle, into the bag, marked as collected
 * Battles and services:
 *   ['battle', 'trainer-id' | 'map:trainer-id', { canLose }]  ['wild', sp, lvl, { noCatch, moves }]
 *   (then ['if', 'battle=win', …]: the outcome of the last battle: win, lose, run, caught)
 *   ['heal']  ['healAnim']  ['lastHeal', spot]  ['shop', [items]]  ['pc']
 * People and the map ('player', 'follower', 'self' or an npc / trainer id):
 *   ['move', who, 'UULL', speed]  ['walkTo', who, x, y]  ['face', who, dir | otherWho]
 *   ['emote', who, '!' | '?' | '…']  ['show', id]  ['hide', id]  ['place', who, x, y, dir]
 *   ['warp', map, spot]
 * Presentation:
 *   ['fade', 'out' | 'in', secs]  ['wait', ms]  ['music', name]  ['sfx', name]  ['jingle', name]
 *   ['js', fn]    escape hatch: await fn(host)
 */
G.Script = (() => {
  const named = {};
  const END = { end: true };
  let busy = 0;

  function def(a, b) {
    if (typeof a === 'string') named[a] = b;
    else Object.assign(named, a);
  }
  const get = name => named[name] || null;
  const all = () => Object.keys(named);

  const list = v => Array.isArray(v) ? v : [];

  const CMDS = {
    say: (h, text, o) => h.say(text, o || {}),
    async choice(h, text, yes, no, o) {
      const i = await h.choice(text, o || {});
      return exec(i === 0 ? yes : no, h);
    },
    if: (h, cond, then, els) => exec(G.Field.test(cond) ? then : els, h),
    call(h, name) {
      const s = get(name);
      if (!s) throw new Error('unknown script ' + name);
      return exec(s, h);
    },
    end() { throw END; },

    setFlag: (h, f) => G.Field.setFlag(f),
    clearFlag: (h, f) => G.Field.clearFlag(f),
    setVar: (h, k, v) => G.Field.setVar(k, v),
    addVar: (h, k, n = 1) => G.Field.setVar(k, (+G.Field.getVar(k) || 0) + n),
    badge: (h, n) => G.Field.badge(n),
    dex: (h, what) => { if (what === 'give') G.Field.setFlag('has-pokedex'); },

    async giveMon(h, sp, lvl, o = {}) {
      const { nickname, ...opts } = o;
      const mon = G.Field.giveMon(sp, lvl, opts);
      if (nickname && h.nickname) await h.nickname(mon);
    },
    async giveItem(h, item, n = 1, o = {}) {
      G.Field.giveItem(item, n);
      if (o.quiet) return;
      const vars = { item: h.itemName(item), n };
      const j = h.jingle('item');
      await exec(n > 1 ? [['say', '{player} received {item} ×{n}!', { vars }]] : [['say', '{player} received {item}!', { vars }]], h);
      await j;
    },
    takeItem: (h, item, n = 1) => { G.Field.takeItem(item, n); },
    money: (h, d) => { G.Field.money(d); },
    async found(h, item, n = 1, key) {
      if (key) G.Field.markDone(key);
      G.Field.giveItem(item, n);
      const vars = { item: h.itemName(item), n };
      const j = h.jingle('item');
      await exec(n > 1 ? [['say', '{player} found {item} ×{n}!', { vars }]] : [['say', '{player} found {item}!', { vars }]], h);
      await j;
      await exec([['say', '{player} put it in the Bag.']], h);
    },

    battle: (h, ref, o) => h.battle(ref, o || {}),
    wild: (h, sp, lvl, o) => h.wild(sp, lvl, o || {}),
    heal: h => h.heal(),
    healAnim: h => h.healAnim(),
    lastHeal: (h, spot) => h.lastHeal(spot),
    shop: (h, items) => h.shop(items),
    pc: h => h.pc(),

    move: (h, who, path, speed) => h.move(who, G.Path4.parse(path), speed || 4),
    walkTo: (h, who, x, y) => h.walkTo(who, x, y),
    face: (h, who, dir) => h.face(who, dir),
    emote: (h, who, ch) => h.emote(who, ch || '!'),
    show: (h, id) => h.show(id),
    hide: (h, id) => h.hide(id),
    place: (h, who, x, y, dir) => h.place(who, x, y, dir),
    warp: (h, map, spot) => h.warp(map, spot),

    fade: (h, dir, secs) => h.fade(dir, secs),
    wait: (h, ms) => h.wait(ms),
    music: (h, name) => h.music(name),
    sfx: (h, name) => h.sfx(name),
    jingle: (h, name) => h.jingle(name),
    js: (h, fn) => fn(h)
  };

  async function exec(cmds, h) {
    for (const c of list(cmds)) {
      const [name, ...args] = c;
      const fn = CMDS[name];
      if (!fn) throw new Error('unknown command ' + name);
      await fn(h, ...args);
    }
  }

  /** Runs a script to the end (or to ['end']). Never throws: errors are logged. */
  async function run(cmds, host) {
    const h = host || (G.World && G.World.host());
    busy++;
    if (h.lock) h.lock();
    try { await exec(cmds, h); }
    catch (e) { if (e !== END) console.error('[Script]', e); }
    finally {
      busy--;
      if (h.unlock) h.unlock();
    }
  }

  // ---------------- checking ----------------

  const WHO = v => typeof v === 'string' && v.length > 0;
  const TEXT = v => (typeof v === 'string' && v.trim().length > 0) || (Array.isArray(v) && v.length > 0 && v.every(s => typeof s === 'string'));
  const NUM = v => typeof v === 'number' && isFinite(v);
  const COND = v => typeof v === 'string' || typeof v === 'function' || (Array.isArray(v) && v.every(c => typeof c === 'string'));
  /** Argument checks per command (null = anything goes). */
  const ARGS = {
    say: [TEXT], choice: [TEXT], if: [COND], call: [WHO], end: [],
    setFlag: [WHO], clearFlag: [WHO], setVar: [WHO], addVar: [WHO], badge: [NUM], dex: [WHO],
    giveMon: [v => G.Maps.species(v) != null, NUM], giveItem: [v => !G.ITEMS || !!G.ITEMS[v]], takeItem: [v => !G.ITEMS || !!G.ITEMS[v]], money: [NUM],
    found: [v => !G.ITEMS || !!G.ITEMS[v]],
    battle: [v => typeof v === 'string' || (v && typeof v === 'object')], wild: [v => G.Maps.species(v) != null, NUM],
    heal: [], healAnim: [], lastHeal: [WHO], shop: [v => Array.isArray(v)], pc: [],
    move: [WHO, v => typeof v === 'string' && /^[UDLR]+$/i.test(v)], walkTo: [WHO, NUM, NUM], face: [WHO, WHO], emote: [WHO],
    show: [WHO], hide: [WHO], place: [WHO, NUM, NUM],
    warp: [v => !G.Maps.has || G.Maps.has(v), WHO],
    fade: [v => v === 'in' || v === 'out'], wait: [NUM], music: [WHO], sfx: [WHO], jingle: [WHO], js: [v => typeof v === 'function']
  };

  function check(cmds, where = '') {
    const E = [];
    if (!Array.isArray(cmds)) return [`${where || 'script'} is not a list of commands`];
    cmds.forEach((c, i) => {
      const at = `${where}[${i}]`;
      if (!Array.isArray(c) || typeof c[0] !== 'string') { E.push(`${at}: a command is [name, ...args]`); return; }
      const [name, ...args] = c;
      const want = ARGS[name];
      if (!want || !CMDS[name]) { E.push(`${at}: unknown command "${name}"`); return; }
      want.forEach((ok, k) => { if (!ok(args[k])) E.push(`${at} ${name}: bad argument ${k + 1} ${JSON.stringify(args[k])}`); });
      if (name === 'choice') { E.push(...check(list(args[1]), at + '.yes'), ...check(list(args[2]), at + '.no')); }
      if (name === 'if') { E.push(...check(list(args[1]), at + '.then'), ...check(list(args[2]), at + '.else')); }
      if (name === 'call' && !get(args[0])) E.push(`${at}: call to unknown script "${args[0]}"`);
      if (name === 'warp' && G.Maps.get && G.Maps.get(args[0]) && !G.Maps.get(args[0]).spots[args[1]]) E.push(`${at}: ${args[0]} has no spot "${args[1]}"`);
    });
    return E;
  }

  return { def, get, all, run, exec, check, CMDS, END, get busy() { return busy > 0; } };
})();
