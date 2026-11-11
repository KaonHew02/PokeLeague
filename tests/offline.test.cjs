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
  for (const f of fs.readdirSync(path.join(ROOT, 'js', 'lang'))) assert.ok(shell.some(s => s.startsWith('js/lang/' + f + '?v=')), f);
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
  let bytes = 0;
  for (const u of urls) {
    assert.ok(exists(u), 'G.Offline would download a missing file: ' + u);
    bytes += fs.statSync(path.join(ROOT, u)).size;
  }
  const mb = bytes / 1048576;
  // Settings shows this number: keep it close when a region adds sprites.
  assert.ok(Math.abs(mb - G.Offline.SIZE_MB) < mb * 0.1, `G.Offline.SIZE_MB is ${G.Offline.SIZE_MB}, the sprites take ${mb.toFixed(1)} MB`);
  // Not in tests or on file://: no service worker there.
  assert.equal(G.Offline.status(), null);
});
