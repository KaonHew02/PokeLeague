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
const CORE = ['js/core/locales.js', 'js/core/util.js', 'js/core/rng.js', 'js/core/i18n.js', 'js/core/names.js', 'js/core/clock.js'];
/** Game data and the battle engine (also what tools/sim_battle.js loads). */
const DATA = ['js/data/types.js', 'js/data/species.js', 'js/data/moves.js', 'js/data/items.js', 'js/data/growth.js',
              'js/data/names.js', 'js/data/natures.js', 'js/data/item-effects.js'];
const BATTLE = ['js/battle/stats.js', 'js/battle/mon.js', 'js/battle/damage.js', 'js/battle/effects.js', 'js/battle/moves-special.js',
                'js/battle/ai.js', 'js/battle/capture.js', 'js/battle/exp.js', 'js/battle/evolution.js', 'js/battle/items.js', 'js/battle/held.js',
                'js/battle/battle.js', 'js/battle/safari.js', 'js/battle/text.js'];

/** The whole battle engine with real data: G. opts as boot() (lang, dictionaries). */
const battleBoot = (opts = {}) => boot(CORE.concat(DATA, BATTLE), opts).G;

/**
 * A one-on-one battle with chosen moves: duel(G, { me: ['charmander', 5, ['ember']], foe: ['bulbasaur', 5, ['splash']] })
 * Species by slug or dex number; extra: { seed, kind, trainer, bag, mine: [...more], foes: [...more] }.
 */
function duel(G, o) {
  const rng = G.RNG(o.monSeed || 99);
  const mk = ([sp, lvl, moves, extra]) => {
    const id = typeof sp === 'number' ? sp : +Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === sp);
    return Object.assign(G.Mon.create(id, lvl, { rng, moves, nature: 'hardy', ivs: [15, 15, 15, 15, 15, 15] }), extra);
  };
  const party = [o.me].concat(o.mine || []).map(mk);
  const foes = [o.foe].concat(o.foes || []).map(mk);
  const trainer = o.trainer || (o.kind === 'trainer' ? { id: 't', name: 'T', ai: 'basic', prize: 20 } : null);
  const b = G.Battle.create({ kind: trainer ? 'trainer' : 'wild', seed: o.seed == null ? 1 : o.seed,
                              player: { name: 'Red', party, bag: o.bag || {} }, foe: { party: foes, trainer }, rules: o.rules });
  const events = b.start();
  return { b, party, foes, events };
}

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

module.exports = { ROOT, source, plain, fakeStorage, boot, CORE, DATA, BATTLE, battleBoot, duel };
