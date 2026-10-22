// Project rules that are easy to break without noticing.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, source } = require('./helpers.cjs');

function files(dir, ext, skip = []) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
      const rel = d + '/' + e.name;
      if (skip.some(s => rel === s || rel.startsWith(s + '/'))) continue;
      if (e.isDirectory()) walk(rel); else if (e.name.endsWith(ext)) out.push(rel);
    }
  })(dir);
  return out;
}
const dev = source('dev.html');
const scripts = [...dev.matchAll(/<script[^>]*src="(js\/[^"]+\.js)"/g)].map(m => m[1]);

test('dev.html loads files that exist, and every game file is loaded by dev.html', () => {
  for (const s of scripts) assert.ok(fs.existsSync(path.join(ROOT, s)), 'missing ' + s);
  const own = files('js', '.js', ['js/lang', 'js/i18n', 'js/app.min.js']);
  for (const f of own) assert.ok(scripts.includes(f), f + ' is not in dev.html');
  const sheets = [...dev.matchAll(/<link[^>]*href="(css\/[^"]+\.css)"/g)].map(m => m[1]);
  for (const f of files('css', '.css', ['css/app.css'])) assert.ok(sheets.includes(f), f + ' is not in dev.html');
});

test('util.js creates G with the exact line build.js wraps', () => {
  assert.ok(source('js/core/util.js').includes('window.G = window.G || {};'));
});

test('the battle engine never uses Math.random (seeded G.RNG only)', () => {
  for (const f of files('js/battle', '.js')) {
    const code = source(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.ok(!/Math\.random/.test(code), f + ' uses Math.random');
  }
});

test('localStorage keys start with "pl." (PokéGo shares the origin with "ps.")', () => {
  for (const f of files('js', '.js', ['js/lang', 'js/app.min.js'])) {
    const code = source(f);
    for (const m of code.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*(['"`])([^'"`]*)/g)) {
      assert.ok(m[2].startsWith('pl.'), `${f}: localStorage key ${JSON.stringify(m[2])}`);
    }
  }
});

test('the licence notice is kept', () => {
  assert.ok(source('LICENSE').includes('Required Notice: Copyright 2026 JPTER78 (https://github.com/JPTER78/pokesurvivor)'));
  assert.ok(fs.existsSync(path.join(ROOT, 'LICENSE-NONCOMMERCIAL.md')));
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/fonts/OFL.txt')));
  assert.ok(source('CREDITS.md').includes('SpriteCollab'));
});

test('js/data/credits.js lists the sprite artists of CREDITS.md (run node tools/credits_js.js)', () => {
  const { artists } = require('../tools/credits_js.js');
  const G = {};
  new Function('G', source('js/data/credits.js'))(G);
  assert.deepEqual(G.SPRITE_ARTISTS, artists());
  assert.ok(G.SPRITE_ARTISTS.length > 10);
});
