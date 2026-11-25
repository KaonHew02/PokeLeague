// The published game in parts (js/core/packs.js, tools/build.js, tools/build_langs.js): a region's content and texts are
// downloaded when it is reached. Which packs a save needs, the order they run in, a warp or a script into a region not
// there yet, a download that fails, the generation pages; the dictionaries' parts; and that nothing which is always
// there uses a later region without asking for it.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { boot, plain, source, ROOT, CORE, DATA, BATTLE } = require('./helpers.cjs');
const { mapsByFile } = require('../tools/map_check.js');

const ORDER = ['johto', 'hoenn', 'sinnoh'];
const scripts = [...source('dev.html').matchAll(/<script([^>]*)src="(js\/[^"]+\.js)"/g)].filter(m => !/data-dev/.test(m[1])).map(m => m[2]);
const regionOf = f => ORDER.find(r => f.startsWith(`js/content/${r}/`)) || null;
const content = r => scripts.filter(f => f.startsWith(`js/content/${r}/`));
const BYFILE = mapsByFile();

/** What tools/build.js writes into G.PACKS. */
function packInfo() {
  const P = { main: 'js/lang/{lang}/main.js?v=1', text: 'js/lang/{lang}/text.js?v=1' };
  for (const r of ORDER) {
    P[r] = { js: `js/pack/${r}.js?v=1`, lang: `js/lang/{lang}/${r}.js?v=1`, maps: {} };
    for (const f of content(r)) for (const [id, loc] of Object.entries(BYFILE[f])) P[r].maps[id] = loc || 0;
  }
  return P;
}

const tick = () => new Promise(r => setImmediate(r));
const el = () => ({ classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, appendChild() {}, style: {}, offsetWidth: 0 });

/** The always-there part of the game without a screen, and a network that serves the packs. net.down: it fails. */
function game(o = {}) {
  const ctx = boot(CORE.concat(['js/core/packs.js'], DATA, ['js/data/encounters.js', 'js/data/trainer-classes.js'], BATTLE,
    ['js/core/store.js', 'js/world/maps.js', 'js/world/path4.js', 'js/world/player.js', 'js/world/field.js', 'js/world/daycare.js',
     'js/world/contest.js', 'js/script/script.js'], content('kanto')), { lang: o.lang });
  const G = ctx.G, net = { down: false, asked: [], ran: [] }, popups = [], toasts = [];
  G.PACKS = packInfo();
  if (o.gen) G.Gen.set(o.gen);
  let now = 0;
  ctx.performance.now = () => now;
  ctx.setTimeout = () => 0;
  ctx.clearTimeout = () => {};
  ctx.requestAnimationFrame = f => setImmediate(() => { now += 50; f(); });
  ctx.document = {
    getElementById: () => el(),
    createElement: t => (t === 'script' ? { remove() {} } : el()),
    head: { appendChild(s) {
      net.asked.push(s.src);
      setImmediate(() => {
        if (net.down) { s.onerror(); return; }
        const m = /js\/pack\/(\w+)\.js/.exec(s.src);
        if (m) {
          const body = content(m[1]).map(source).join('\n;\n');
          vm.runInContext(`PL_PACK('${m[1]}', function (G) { RAN('${m[1]}');\n${body}\n});`, ctx);
        }
        s.onload();
      });
    } }
  };
  ctx.RAN = n => net.ran.push(n);
  Object.assign(G, {
    WorldRender: { prepare() {}, draw() {} },
    Camera: { snap() {}, fitRoom() {}, w: 480, h: 320, scale: 1, left: () => 0, top: () => 0 },
    Audio: { sfx() {}, music() {}, jingle: () => Promise.resolve() },
    Dialog: { open: false, tick() {}, say: () => Promise.resolve(), ask: () => Promise.resolve(0) },
    UI: { toast: t => toasts.push(t), anyOpen: () => false, closeAll() {} },
    Popup: { choose: t => { popups.push(t); return Promise.resolve(net.answer ? net.answer() : false); } },
    Settings: { get: () => false, on() {} },
    Input: { clicks: () => [] },
    Btn: { dir4: () => null, pressed: () => false, held: () => false }
  });
  return { ctx, G, W: G.World, net, popups, toasts };
}

test('what a save needs: its map, the place it heals at, the towns and trainers it has seen, the region\'s flags', () => {
  const { G } = game();
  const save = o => Object.assign(G.Store.newSave({ name: 'Red' }), o);
  const at = map => { const s = save({}); s.player.map = map; return s; };
  assert.equal(G.Packs.reach(at('pallet')), 0);
  assert.equal(G.Packs.reach(at('new-bark')), 1);
  assert.equal(G.Packs.reach(at('littleroot')), 2);
  assert.equal(G.Packs.reach(at('sandgem')), 3);
  // Back in Kanto after a journey.
  assert.equal(G.Packs.reach(Object.assign(at('pallet'), { flags: { 'visited:olivine': true } })), 1);
  assert.equal(G.Packs.reach(Object.assign(at('pallet'), { flags: { 'hoenn-start': true } })), 2);
  assert.equal(G.Packs.reach(Object.assign(at('pallet'), { done: { 'route201:tristan': 1 } })), G.PACKS.sinnoh.maps.route201 !== undefined ? 3 : 0);
  const s = at('pallet');
  s.player.lastHeal = { map: 'sandgem', spot: 'heal' };
  assert.equal(G.Packs.reach(s), 3);
  // Kanto's own flags and trainers need nothing.
  assert.equal(G.Packs.reach(Object.assign(at('indigo'), { flags: { 'visited:pallet': true, 'chapter-10-done': true }, done: { 'route3:ben': 1 } })), 0);
  // A map not there yet still has a name in the list of saves.
  assert.equal(G.Packs.loc('sandgem'), 'sandgem-town');
  assert.equal(G.Packs.loc('pallet'), null);
});

test('packs come in the order of the journey, each once, all that are needed at the same time', async () => {
  const { G, net } = game();
  assert.ok(!G.Maps.has('new-bark') && !G.Maps.has('sandgem'));
  const save = G.Store.newSave({ name: 'Red' });
  save.player.map = 'sandgem';
  assert.equal(await G.Packs.forSave(save), true);
  assert.deepEqual(plain(net.ran), ORDER);
  assert.deepEqual(plain(net.asked), ORDER.map(r => `js/pack/${r}.js?v=1`), 'English asks for no dictionary');
  for (const id of ['new-bark', 'littleroot', 'sandgem']) assert.ok(G.Maps.has(id), id);
  assert.equal(await G.Packs.forMap('sandgem'), true);
  assert.equal(net.asked.length, 3, 'not asked for again');
  assert.ok(!G.Packs.more());
  // Every map of the game is there, as when every file is loaded at once.
  const want = Object.entries(BYFILE).filter(([f]) => f !== 'js/content/sandbox.js').flatMap(([, o]) => Object.keys(o));
  assert.deepEqual([...G.Maps.all()].sort(), want.sort());
});

test('another language: a region\'s dictionary comes with it, before its content runs', async () => {
  const { G, net } = game({ lang: 'zh-Hans' });
  await G.Packs.load('hoenn');
  assert.deepEqual(plain(net.asked), ['js/pack/johto.js?v=1', 'js/lang/zh-Hans/johto.js?v=1', 'js/pack/hoenn.js?v=1', 'js/lang/zh-Hans/hoenn.js?v=1']);
  // What offline play keeps: the dictionary and texts of the language, and what has been reached.
  assert.deepEqual(plain(G.Packs.files()), ['js/lang/zh-Hans/text.js?v=1', 'js/lang/zh-Hans/main.js?v=1',
    'js/pack/johto.js?v=1', 'js/lang/zh-Hans/johto.js?v=1', 'js/pack/hoenn.js?v=1', 'js/lang/zh-Hans/hoenn.js?v=1']);
  // i18n.js takes a dictionary that arrives late.
  G.ctx = null;
});

test('a dictionary that arrives late is used, with its contexts', () => {
  const ctx = boot(CORE, { lang: 'fr' });
  assert.equal(ctx.G.T('A late text'), 'A late text');
  ctx.PL_LANG_Q.push([{ 'A late text': 'Un texte tardif' }, 'fr', ''], [{ Rich: 'Riche' }, 'fr', 'late'], [{ 'A late text': 'nein' }, 'de', '']);
  assert.equal(ctx.G.T('A late text'), 'Un texte tardif');
  assert.equal(ctx.G.T('Rich', 'late'), 'Riche');
});

test('walking into Johto: the pack is downloaded on the way, and the map is entered', async () => {
  const { G, W, net } = game();
  W.debug.noEnc = true;
  W.load('indigo', 'johto-cave-door');
  assert.equal(W.tryStep(W.player, 'up', 4), 'moved');
  W.player.update(1); W.arrived(W.player);
  for (let i = 0; i < 400 && W.map.id !== 'johto-victory-2f'; i++) { W.update(0.05); await tick(); }
  assert.equal(W.map.id, 'johto-victory-2f');
  assert.deepEqual(plain(net.ran), ['johto']);
  assert.ok(!G.Maps.has('littleroot'), 'only Johto');
});

test('no connection: the player is asked; giving up leaves them where they were, trying again goes on', async () => {
  const { G, W, net, popups } = game();
  W.load('indigo', 'johto-cave-door');
  net.down = true;
  W.tryStep(W.player, 'up', 4);
  W.player.update(1); W.arrived(W.player);
  for (let i = 0; i < 200 && !popups.length; i++) { W.update(0.05); await tick(); }
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(popups.length, 1);
  assert.equal(W.map.id, 'indigo');
  assert.ok(!W.locked, 'free to walk');
  // The connection is back on the second try.
  net.answer = () => { net.down = false; return true; };
  net.down = true;
  assert.equal(await G.Packs.forMap('new-bark'), true);
  assert.equal(popups.length, 2);
  assert.ok(G.Maps.has('new-bark'));
  // A save in a region that cannot be downloaded is not opened.
  const b = game();
  b.net.down = true;
  const save = b.G.Store.newSave({ name: 'Red' });
  save.player.map = 'littleroot';
  assert.equal(await b.G.Packs.forSave(save), false);
});

test('a script of a later region named by an earlier one brings its region', async () => {
  const { G, net } = game();
  assert.equal(G.Script.get('oak.hoenn'), null);
  let ran = false;
  await G.Script.exec([['if', () => true, [['call', 'jleague.guard']]]], { say: () => Promise.resolve(), choice: () => Promise.resolve(1), face() {}, lock() {}, unlock() {} }).catch(() => {});
  ran = !!G.Script.get('jleague.guard');
  assert.ok(ran);
  assert.deepEqual(plain(net.ran), ['johto']);
  assert.equal(await G.Packs.findScript('oak.hoenn'), true);
  assert.deepEqual(plain(net.ran), ['johto', 'hoenn']);
  assert.equal(await G.Packs.findScript('no.such-script'), false);
});

test('close to the next region, its files are fetched quietly and run only when needed', async () => {
  const { G, net } = game();
  const save = G.Store.newSave({ name: 'Red' });
  G.Packs.ahead(save);
  assert.equal(net.asked.length, 0, 'a new game fetches nothing');
  save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8];
  G.Packs.ahead(save);
  for (let i = 0; i < 5; i++) await tick();
  assert.deepEqual(plain(net.asked), ['js/pack/johto.js?v=1']);
  assert.deepEqual(plain(net.ran), []);
  assert.equal(await G.Packs.forMap('new-bark'), true);
  assert.deepEqual(plain(net.ran), ['johto']);
  assert.equal(net.asked.length, 1);
});

test('a generation page never downloads another region: its roads stay closed, its scripts unknown', async () => {
  const { G, W, net } = game({ gen: 1 });
  assert.ok(!G.Packs.more());
  assert.equal(await G.Packs.forMap('new-bark'), false);
  assert.ok(!G.Gen.mapOpen('johto-victory-2f'), 'a map that is not loaded is not open');
  W.load('indigo', 'johto-cave-door');
  assert.equal(W.tryStep(W.player, 'up', 4), 'blocked');
  const save = G.Store.newSave({ name: 'Red' });
  save.player.badges = [1, 2, 3, 4, 5, 6, 7, 8];
  G.Packs.ahead(save);
  assert.equal(net.asked.length, 0);
});

test('the dictionaries\' parts hold every text once, and a text that is not only a later region\'s is in main', () => {
  const { capture, LANGS, REGIONS, partSources } = require('../tools/build_langs.js');
  const src = partSources(), all = capture();
  const read = (lang, part) => {
    const ctx = vm.createContext({});
    ctx.window = ctx;
    vm.runInContext(source(`js/lang/${lang}/${part}.js`), ctx);
    return plain(ctx.PL_LANG_Q);
  };
  for (const lang of LANGS) {
    const full = {}, got = {};
    for (const [d, l, c] of all) if (l === lang) for (const [k, v] of Object.entries(d)) full[c + '|' + k] = v;
    for (const part of ['main', ...REGIONS]) {
      for (const [d, l, c] of read(lang, part)) {
        assert.equal(l, lang);
        for (const [k, v] of Object.entries(d)) {
          assert.ok(!(c + '|' + k in got), 'twice: ' + k);
          got[c + '|' + k] = v;
          if (part !== 'main' && lang === 'fr') assert.ok(!src.main.includes(k), `${part}: "${k}" is also used outside the later regions`);
        }
      }
    }
    assert.deepEqual(Object.keys(got).length, Object.keys(full).length, lang);
    for (const k of Object.keys(full)) assert.equal(got[k], full[k], lang + ' ' + k);
  }
});

test('the Pokédex texts of one language: the same as the whole table\'s, English where it has none', () => {
  const G = boot(CORE.concat(['js/data/species.js', 'js/data/names.js', 'js/data/dex-text.js'])).G;
  const langs = plain(G.NAMES.langs);
  for (const lang of langs) {
    const ctx = vm.createContext({});
    ctx.window = ctx;
    vm.runInContext(source(`js/lang/${lang}/text.js`), ctx);
    const i = langs.indexOf(lang);
    for (const [kind, rows] of Object.entries(G.DEX_TEXT)) {
      assert.equal(Object.keys(ctx.PL_TEXT[kind]).length, Object.keys(rows).length);
      for (const [id, row] of Object.entries(rows)) assert.equal(ctx.PL_TEXT[kind][id], row[i] || row[0] || '');
    }
  }
  // names.js reads either.
  const t = G.Names.desc('mon', 25);
  const whole = G.DEX_TEXT;
  G.DEX_TEXT = { mon: { 25: 'A text.' } };
  assert.equal(G.Names.desc('mon', 25), 'A text.');
  assert.equal(G.Names.desc('mon', 26), '');
  G.DEX_TEXT = whole;
  assert.ok(t.length > 10);
});

test('nothing that is always there leans on a later region, and no region on one after it', () => {
  const code = f => source(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const rank = f => { const r = regionOf(f); return r ? ORDER.indexOf(r) + 1 : 0; };
  const defined = {};
  for (const f of scripts) for (const m of code(f).matchAll(/(?<![\w.])G\.([A-Z]\w*)\s*=(?!=)/g)) defined[m[1]] = Math.min(rank(f), defined[m[1]] === undefined ? 9 : defined[m[1]]);
  // The Battle Arcade's screen (Sinnoh's) is opened by Sinnoh's own scripts only.
  const FINE = new Set(['js/ui/arcade-ui.js Arcade']);
  const bad = [];
  for (const f of scripts) for (const m of code(f).matchAll(/(?<![\w.])G\.([A-Z]\w*)/g)) {
    if (defined[m[1]] > rank(f) && !FINE.has(f + ' ' + m[1])) bad.push(`${f} uses G.${m[1]}`);
  }
  assert.deepEqual(bad, []);
});

test('the build: the packs hold what dev.html loads, and app.min.js does not', () => {
  const app = source('js/app.min.js');
  assert.ok(app.includes('js/pack/johto.js?v='), 'run node tools/build.js');
  for (const [r, id] of [['johto', 'new-bark'], ['hoenn', 'littleroot'], ['sinnoh', 'sandgem']]) {
    const js = source(`js/pack/${r}.js`);
    assert.ok(js.startsWith('PL_PACK('), r);
    assert.ok(new RegExp(`id:"${id}"`).test(js), r + ' has its maps');
    assert.ok(!new RegExp(`id:"${id}"`).test(app), 'app.min.js has no ' + r);
    for (const f of content(r)) assert.ok(fs.existsSync(path.join(ROOT, f)));
  }
  assert.ok(app.length < 2.3e6, 'the first download: ' + app.length);
});
