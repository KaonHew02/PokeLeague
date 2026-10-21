// Loads game files into a node:vm sandbox with just enough of a browser for
// the logic to run: a fake window, localStorage and navigator. No DOM.
//
//   const { boot } = require('./helpers.cjs');
//   const G = boot(['js/core/util.js', 'js/core/rng.js']).G;
//   boot(files, { lang: 'es', dictionaries: true })   loads js/i18n/es/*.js first
//
// Objects created inside the sandbox come from another realm: compare them
// with plain() (a JSON round trip) when using deepStrictEqual.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const source = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const plain = v => JSON.parse(JSON.stringify(v));

function fakeStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    key: i => [...m.keys()][i] ?? null,
    get length() { return m.size; },
    _map: m
  };
}

/** The core files every test needs, in dev.html order. */
const CORE = ['js/core/locales.js', 'js/core/util.js', 'js/core/rng.js', 'js/core/i18n.js', 'js/core/names.js'];

function boot(files, opts = {}) {
  const lang = opts.lang || 'en';
  const noop = () => {};
  const ctx = {
    console, Math, JSON, Date, setTimeout, clearTimeout, setInterval: noop, clearInterval: noop,
    performance: { now: () => 0 }, addEventListener: noop, removeEventListener: noop,
    navigator: { language: lang, languages: [lang] },
    localStorage: opts.storage || fakeStorage(lang !== 'en' ? { 'pl.lang': lang } : {}),
    location: { pathname: '/', search: opts.search || '', protocol: 'file:', reload: noop },
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: noop
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  if (opts.dictionaries) {
    const { capture } = require('../tools/build_langs.js');
    ctx.PL_LANG_Q = capture().filter(([, l]) => l === lang).map(([d, l, c]) => [d, l, c]);
  }
  for (const f of files) vm.runInContext(source(f), ctx, { filename: f });
  return ctx;
}

module.exports = { ROOT, source, plain, fakeStorage, boot, CORE };
