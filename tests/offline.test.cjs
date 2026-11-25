// Home Screen app and offline play: manifest.json, the icons, sw.js and G.Offline.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, source, boot } = require('./helpers.cjs');

const exists = f => fs.existsSync(path.join(ROOT, f));
/** Width and height of a PNG (from its IHDR chunk). */
function pngSize(f) {
  const b = fs.readFileSync(path.join(ROOT, f));
  assert.equal(b.toString('latin1', 1, 4), 'PNG', f + ' is not a PNG');
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

test('dev.html links the manifest and the Home Screen icon, and they exist', () => {
  const dev = source('dev.html');
  for (const m of dev.matchAll(/<link rel="(?:manifest|icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)) {
    assert.ok(exists(m[1]), 'missing ' + m[1]);
  }
  assert.match(dev, /<link rel="manifest" href="manifest\.json">/);
  assert.match(dev, /<link rel="apple-touch-icon" href="([^"]+)">/);
  assert.deepEqual(pngSize(/<link rel="apple-touch-icon" href="([^"]+)">/.exec(dev)[1]), [180, 180]);
});

test('manifest.json: an installable app whose icons have the sizes it says', () => {
  const m = JSON.parse(source('manifest.json'));
  assert.equal(m.start_url, './');
  assert.ok(['fullscreen', 'standalone'].includes(m.display));
  assert.ok(m.icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable'));
  for (const i of m.icons) assert.deepEqual(pngSize(i.src), i.sizes.split('x').map(Number), i.src);
});

test('sw.js keeps files that exist, from the same build as index.html', () => {
  const sw = source('sw.js');
  const shell = JSON.parse(/const SHELL = (\[[\s\S]*?\]);/.exec(sw)[1]);
  assert.ok(shell.length > 5, 'sw.js has no file list: run node tools/build.js');
  for (const f of shell) if (f !== './') assert.ok(exists(f.replace(/\?.*$/, '')), 'sw.js keeps a missing file: ' + f);
  const index = source('index.html');
  for (const f of [/js\/app\.min\.js\?v=\w+/, /css\/app\.css\?v=\w+/, /js\/core\/locales\.js\?v=\w+/]) {
    assert.ok(shell.includes(f.exec(index)[0]), 'sw.js and index.html come from different builds: run node tools/build.js');
  }
  // The regions and the dictionaries are not downloaded with the shell: sw.js knows them all and keeps those asked for.
  assert.ok(!shell.some(s => /^js\/(pack|lang)\//.test(s)));
  const parts = JSON.parse(/const PARTS = (\[[\s\S]*?\]);/.exec(sw)[1]);
  for (const l of fs.readdirSync(path.join(ROOT, 'js', 'lang'))) {
    for (const f of fs.readdirSync(path.join(ROOT, 'js', 'lang', l))) assert.ok(parts.some(s => s.startsWith(`js/lang/${l}/${f}?v=`)), l + '/' + f);
  }
  for (const r of ['johto', 'hoenn', 'sinnoh']) assert.ok(parts.some(s => s.startsWith(`js/pack/${r}.js?v=`)), r);
  const app = source('js/app.min.js');
  for (const p of parts.filter(s => s.startsWith('js/pack/'))) assert.ok(app.includes(p), p + ' is not the one app.min.js asks for: run node tools/build.js');
  // Its caches must not touch PokéGo's (same GitHub Pages origin).
  assert.match(sw, /if \(k\.startsWith\('pokeleague-'\) && [^\n]*\) await caches\.delete\(k\);/);
});

test('sw.js leaves dev.html and its files to the browser, and answers for the published page', () => {
  const vm = require('node:vm');
  const handlers = {};
  const BASE = 'http://localhost:8130/';
  const ctx = {
    URL, Promise, setTimeout, console,
    location: new URL(BASE + 'sw.js'),
    caches: { open: async () => ({ match: async () => null, put: async () => {}, addAll: async () => {} }), match: async () => null, keys: async () => [] },
    fetch: async () => ({ ok: true, clone() { return this; } })
  };
  ctx.self = { registration: { scope: BASE }, clients: { get: async () => null, claim: async () => {} }, skipWaiting: async () => {},
    addEventListener: (type, fn) => { handlers[type] = fn; } };
  vm.runInNewContext(source('sw.js'), ctx);
  /** Does the worker answer (respondWith) a GET request? */
  const answers = (url, o = {}) => {
    let took = false;
    handlers.fetch({ request: Object.assign({ method: 'GET', url: BASE + url, mode: 'no-cors', referrer: '' }, o), clientId: 'c1',
      respondWith: p => { took = true; Promise.resolve(p).catch(() => {}); } });
    return took;
  };
  assert.ok(!answers('dev.html?debug', { mode: 'navigate' }), 'dev.html itself');
  assert.ok(!answers('js/world/field.js', { referrer: BASE + 'dev.html?debug&map=sandgem' }), 'a script of dev.html');
  assert.ok(!answers('assets/pokemon/25/Idle.png', { referrer: BASE + 'dev.html' }), 'a sprite dev.html asks for');
  assert.ok(answers('', { mode: 'navigate' }), 'the published page');
  assert.ok(answers('js/app.min.js?v=1', { referrer: BASE }), 'a file of the published page');
  assert.ok(answers('assets/pokemon/25/Idle.png', { referrer: BASE + 'index.html' }), 'a sprite the published page asks for');
  assert.ok(!answers('x', { method: 'POST' }), 'not a GET');
});

test('G.Offline lists sprite files that exist, and says about how big they are', () => {
  const G = boot(['js/core/util.js', 'js/data/sprites-meta.js', 'js/core/offline.js']).G;
  const urls = G.Offline.spriteUrls();
  assert.ok(urls.length > 2000);
  assert.equal(new Set(urls).size, urls.length);
  // Settings shows these numbers (the regions reached): keep them close when a region adds sprites.
  const TOP = [151, 251, 386, 493], mb = [0, 0, 0, 0];
  for (const u of urls) {
    assert.ok(exists(u), 'G.Offline would download a missing file: ' + u);
    mb[TOP.findIndex(t => +u.split('/')[2] <= t)] += fs.statSync(path.join(ROOT, u)).size / 1048576;
  }
  mb.forEach((x, i) => assert.ok(Math.abs(x - G.Offline.SIZES[i]) < 1, `G.Offline.SIZES[${i}] is ${G.Offline.SIZES[i]}, the sprites take ${x.toFixed(1)} MB`));
  // Kanto alone: 1-151 and what they evolve into (Golbat's Crobat), no other later Pokémon.
  const K = boot(['js/core/util.js', 'js/data/species.js', 'js/data/sprites-meta.js', 'js/core/offline.js']).G;
  const kanto = new Set(K.Offline.spriteUrls(151).map(u => +u.split('/')[2]));
  for (let sp = 1; sp <= 151; sp++) assert.ok(kanto.has(sp), 'sprite ' + sp);
  assert.ok(kanto.has(169) && !kanto.has(152) && !kanto.has(387));
  assert.ok(K.Offline.spriteUrls(151).length < urls.length * 0.4);
  assert.equal(K.Offline.spriteUrls(493).length, urls.length);
  // Not in tests or on file://: no service worker there.
  assert.equal(G.Offline.status(), null);
});

test('the generation pages (js/core/gen.js): gen<k>/index.html is index.html from the folder above, with its own title and manifest', () => {
  const sw = source('sw.js');
  const shell = JSON.parse(/const SHELL = (\[[\s\S]*?\]);/.exec(sw)[1]);
  const index = source('index.html');
  const published = boot(['js/core/util.js', 'js/core/gen.js']).G.Gen.PUBLISHED;
  assert.ok(published.length >= 1);
  for (const k of published) {
    const page = source(`gen${k}/index.html`);
    assert.match(page, new RegExp(`<html lang="en" data-gen="${k}">`));
    // <base> comes before any relative address of the page (the CSP's base-uri 'self' allows it).
    const base = page.indexOf('<base href="../">');
    assert.ok(base > 0 && base < page.indexOf('<link') && base < page.indexOf('<script'), '<base> first');
    assert.ok(page.includes(`<link rel="manifest" href="gen${k}/manifest.json">`), 'its own manifest');
    assert.ok(page.includes(`<title>PokeLeague (Generation ${k})</title>`), 'its own title');
    for (const f of [/js\/app\.min\.js\?v=\w+/, /css\/app\.css\?v=\w+/, /js\/core\/locales\.js\?v=\w+/]) {
      assert.equal(f.exec(page)[0], f.exec(index)[0], 'the same build as index.html');
    }
    // The page's body is index.html's.
    assert.equal(page.slice(page.indexOf('<body>')), index.slice(index.indexOf('<body>')));
    const m = JSON.parse(source(`gen${k}/manifest.json`));
    assert.equal(m.start_url, './');
    assert.equal(m.scope, './');
    assert.equal(m.id, undefined, 'its id is its start_url, apart from the whole journey\'s app');
    assert.equal(m.name, `PokeLeague (Generation ${k})`);
    for (const i of m.icons) {
      assert.ok(i.src.startsWith('../'));
      assert.deepEqual(pngSize(i.src.slice(3)), i.sizes.split('x').map(Number), i.src);
    }
    assert.ok(shell.includes(`gen${k}/`) && shell.includes(`gen${k}/manifest.json`), 'kept for offline play');
  }
});

test('sw.js offline: each page opens its own cached copy, the whole journey\'s when it has none', async () => {
  const vm = require('node:vm');
  const handlers = {};
  const BASE = 'http://localhost:8130/';
  const cached = { [BASE]: 'journey', [BASE + 'gen1/']: 'gen1' };
  const shellCache = { match: async (u, o) => (o && o.ignoreSearch ? cached[String(u).replace(/\?.*$/, '')] : cached[u]) || null };
  const ctx = {
    URL, Promise, setTimeout: f => f(), console,
    location: new URL(BASE + 'sw.js'),
    caches: { open: async () => shellCache, match: async () => null, keys: async () => [] },
    fetch: () => Promise.reject(new Error('offline'))
  };
  ctx.self = { registration: { scope: BASE }, clients: { get: async () => null, claim: async () => {} }, skipWaiting: async () => {},
    addEventListener: (type, fn) => { handlers[type] = fn; } };
  vm.runInNewContext(source('sw.js'), ctx);
  const open = url => new Promise(res => handlers.fetch({ request: { method: 'GET', url: BASE + url, mode: 'navigate', referrer: '' }, respondWith: res }));
  assert.equal(await open(''), 'journey');
  assert.equal(await open('gen1/'), 'gen1');
  assert.equal(await open('gen1/index.html'), 'gen1');
  assert.equal(await open('gen1/?x=1'), 'gen1');
  assert.equal(await open('gen3/'), 'journey', 'a page it does not keep: the whole journey');
});

test('sw.js installing: the regions and dictionaries the build before had kept come in the new build\'s version, the others do not', async () => {
  const vm = require('node:vm');
  const handlers = {}, added = [], BASE = 'http://localhost:8130/';
  const sw = source('sw.js');
  const parts = JSON.parse(/const PARTS = (\[[\s\S]*?\]);/.exec(sw)[1]);
  const old = [{ url: BASE + 'js/pack/johto.js?v=old' }, { url: BASE + 'js/lang/fr/main.js?v=old' }, { url: BASE + 'js/app.min.js?v=old' }];
  const ctx = {
    URL, Promise, Set, setTimeout, console, location: new URL(BASE + 'sw.js'),
    Request: function (u) { this.u = u; },
    caches: {
      keys: async () => ['pokeleague-shell-before', 'ps-other'],
      open: async k => ({ keys: async () => (k === 'pokeleague-shell-before' ? old : []), addAll: async () => {},
        add: async r => { added.push(r.u); if (/fr/.test(r.u)) throw new Error('one that fails does not stop the others'); } }),
      match: async () => null
    }
  };
  ctx.self = { registration: { scope: BASE }, clients: {}, skipWaiting: async () => {}, addEventListener: (t, f) => { handlers[t] = f; } };
  vm.runInNewContext(sw, ctx);
  let done;
  handlers.install({ waitUntil: p => { done = p; } });
  await done;
  assert.deepEqual(added.sort(), parts.filter(p => p.startsWith('js/pack/johto.js?') || p.startsWith('js/lang/fr/main.js?')).sort());
});
