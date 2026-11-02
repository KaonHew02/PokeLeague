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
  assert.ok(Math.abs(mb - G.Offline.SIZE_MB) < mb * 0.25, `G.Offline.SIZE_MB is ${G.Offline.SIZE_MB}, the sprites take ${mb.toFixed(1)} MB`);
  // Not in tests or on file://: no service worker there.
  assert.equal(G.Offline.status(), null);
});
