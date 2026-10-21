// Translations: right language per folder, same placeholders as the English
// key, no empty or conflicting entries. Missing and stale keys are reported
// (warnings only: run `node tools/build_langs.js --missing --all` for the list).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { capture, LANGS } = require('../tools/build_langs.js');
const { keys } = require('../tools/i18n_keys.js');
const { boot, CORE } = require('./helpers.cjs');

const slots = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');

test('every dictionary file declares the language of its folder', () => {
  for (const [, l, , file] of capture()) {
    assert.ok(LANGS.includes(l), `${file}: unknown language ${l}`);
    assert.ok(file.startsWith(`js/i18n/${l}/`), `${file} declares ${l}`);
  }
});

test('translations keep exactly the placeholders of their key, and are not empty', () => {
  for (const [d, l, , file] of capture()) {
    for (const [k, v] of Object.entries(d)) {
      assert.equal(typeof v, 'string', `${file} ${l}: ${k}`);
      assert.ok(v.trim(), `${file} ${l}: empty translation of ${JSON.stringify(k)}`);
      assert.equal(slots(v), slots(k), `${file} ${l}: ${JSON.stringify(k)} -> ${JSON.stringify(v)}`);
    }
  }
});

test('one text has one translation per language (no two files disagreeing)', () => {
  const seen = new Map();
  for (const [d, l, c, file] of capture()) {
    for (const [k, v] of Object.entries(d)) {
      const id = `${l}|${c}|${k}`;
      if (seen.has(id)) assert.equal(v, seen.get(id).v, `${JSON.stringify(k)} in ${file} and ${seen.get(id).file}`);
      else seen.set(id, { v, file });
    }
  }
});

test('all seven languages load and translate the title screen', () => {
  for (const lang of LANGS) {
    const { G } = boot(CORE, { lang, dictionaries: true });
    assert.equal(G.I18n.lang, lang);
    assert.notEqual(G.T('New game'), 'New game', lang);
  }
  assert.equal(boot(CORE).G.T('New game'), 'New game');
});

test('report: missing and stale translations', () => {
  const want = keys(), all = capture();
  const lines = [];
  for (const lang of LANGS) {
    const have = new Set();
    for (const [d, l, c] of all) if (l === lang && !c) Object.keys(d).forEach(k => have.add(k));
    const missing = [...want.keys()].filter(k => !have.has(k));
    const stale = [...have].filter(k => !want.has(k));
    if (missing.length || stale.length) lines.push(`${lang}: ${missing.length} missing, ${stale.length} not used`);
  }
  if (lines.length) console.log('[i18n] ' + lines.join(' · '));
  assert.ok(true);
});
