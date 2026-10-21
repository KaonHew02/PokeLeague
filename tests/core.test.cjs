// Core helpers: seeded RNG, type chart, i18n formatting and official names.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE } = require('./helpers.cjs');

test('the same seed gives the same sequence; int() stays inside its bounds', () => {
  const { G } = boot(CORE);
  const a = G.RNG(42), b = G.RNG(42), c = G.RNG(43);
  const sa = Array.from({ length: 20 }, () => a.next());
  const sb = Array.from({ length: 20 }, () => b.next());
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, Array.from({ length: 20 }, () => c.next()));
  const r = G.RNG(7), seen = new Set();
  for (let i = 0; i < 2000; i++) { const v = r.int(1, 6); assert.ok(v >= 1 && v <= 6); seen.add(v); }
  assert.equal(seen.size, 6);
  for (let i = 0; i < 2000; i++) { const v = r.u16(); assert.ok(v >= 0 && v <= 65535 && Number.isInteger(v)); }
});

test('an RNG resumes from its saved state', () => {
  const { G } = boot(CORE);
  const a = G.RNG(99);
  a.next(); a.next();
  const b = G.RNG(a.state);
  assert.equal(b.next(), a.next());
});

test('type chart: the games\' multipliers, multiplied for two types', () => {
  const { G } = boot(CORE.concat('js/data/types.js'));
  assert.equal(G.Types.eff('fire', ['grass', 'steel']), 4);
  assert.equal(G.Types.eff('electric', ['ground']), 0);
  assert.equal(G.Types.eff('normal', ['ghost']), 0);
  assert.equal(G.Types.eff('water', ['fire', 'ground']), 4);
  assert.equal(G.Types.eff('grass', ['fire', 'flying']), 0.25);
  assert.equal(G.Types.eff('fighting', ['normal']), 2);
  assert.equal(G.Types.eff('dragon', ['fairy']), 0);
  assert.equal(G.Types.eff('psychic', ['water']), 1);
  assert.equal(G.Types.LIST.length, 18);
  assert.equal(G.Types.label(0), 'immune');
  assert.equal(G.Types.label(2), 'super');
  assert.equal(G.Types.label(0.5), 'weak');
  assert.equal(G.Types.label(1), null);
});

test('fmt fills named slots, in any order the translation needs', () => {
  const { G } = boot(CORE);
  assert.equal(G.I18n.fmt('Lv. {n}', { n: 5 }), 'Lv. 5');
  assert.equal(G.I18n.fmt('{mon} used {move}!', { mon: 'Pikachu', move: 'Thunder Shock' }), 'Pikachu used Thunder Shock!');
  assert.equal(G.I18n.fmt('{a} {missing}', { a: 1 }), '1 {missing}');
  G.I18n.add({ '{mon} used {move}!': '{move}! dijo {mon}' }, 'en');          // English has no dictionary
  assert.equal(G.T('{mon} used {move}!'), '{mon} used {move}!');
});

test('other languages translate from their dictionaries; unknown text stays English', () => {
  const es = boot(CORE, { lang: 'es', dictionaries: true }).G;
  assert.equal(es.I18n.lang, 'es');
  assert.equal(es.T('Continue'), 'Continuar');
  assert.equal(es.T('Some text nobody translated'), 'Some text nobody translated');
  const zh = boot(CORE, { lang: 'zh-Hant', dictionaries: true }).G;
  assert.equal(zh.T('New game'), '新遊戲');
  // A context tells apart the same English word.
  zh.I18n.add({ Psychic: '超能力' }, 'zh-Hant', 'type');
  assert.equal(zh.T('Psychic', 'type'), '超能力');
  assert.equal(zh.T('Psychic'), 'Psychic');
});

test('names come from the data in the player\'s language; pt-BR uses English; ids as a last resort', () => {
  const NAMES = { langs: ['en', 'es', 'fr', 'it', 'zh-Hans', 'zh-Hant'],
    mon: { 25: ['Pikachu', 'Pikachu', 'Pikachu', 'Pikachu', '皮卡丘', '皮卡丘'] },
    loc: { 'viridian-city': ['Viridian City', 'Ciudad Verde', 'Jadielle', 'Smeraldopoli', '常青市', '常青市'] } };
  const withData = lang => { const c = boot(CORE, { lang }); c.G.NAMES = NAMES; return c.G; };
  assert.equal(withData('fr').Names.loc('viridian-city'), 'Jadielle');
  assert.equal(withData('zh-Hans').Names.mon(25), '皮卡丘');
  assert.equal(withData('pt-BR').Names.loc('viridian-city'), 'Viridian City');
  const bare = boot(CORE).G;
  assert.equal(bare.Names.loc('pewter-city'), 'Pewter City');
  assert.equal(bare.Names.mon(4), '#4');
  bare.SPECIES = { 4: { slug: 'charmander' } };
  assert.equal(bare.Names.mon(4), 'Charmander');
});

test('buttons: a press counts once, repeats while held, and swallow() needs a release', () => {
  const { G } = boot(CORE.concat('js/core/input.js', 'js/core/buttons.js'));
  const B = G.Btn, f = (dt = 1 / 60) => { B.update(dt); G.Input.endFrame(); };
  B.set('pad', 'a', true); f();
  assert.equal(B.pressed('a'), true);
  f();
  assert.equal(B.pressed('a'), false);
  assert.equal(B.held('a'), true);
  B.set('pad', 'a', false); f();
  // Repeat: on the press, then after 0.38 s, then every 0.12 s.
  B.set('touch', 'down', true); f(0.01);
  assert.equal(B.repeat('down'), true);
  let hits = 0;
  for (let i = 0; i < 100; i++) { f(0.01); if (B.repeat('down')) hits++; }   // 1 s held
  assert.equal(hits, 6);
  // The most recent direction wins.
  B.set('touch', 'left', true); f();
  assert.equal(B.dir4(), 'left');
  B.set('touch', 'left', false); f();
  assert.equal(B.dir4(), 'down');
  B.set('touch', 'down', false); f();
  assert.equal(B.dir4(), null);
  // swallow(): A held across a screen change does not press again until released.
  B.set('pad', 'a', true); f();
  B.swallow(); f();
  assert.equal(B.pressed('a'), false);
  assert.equal(B.held('a'), false);
  B.set('pad', 'a', false); f();
  B.set('pad', 'a', true); f();
  assert.equal(B.pressed('a'), true);
});

test('locales: saved choice first, then the browser, then English', () => {
  const { fakeStorage } = require('./helpers.cjs');
  assert.equal(boot(['js/core/locales.js'], { lang: 'fr' }).PL_LOCALES.lang, 'fr');
  const c = boot(['js/core/locales.js'], { lang: 'de-DE', storage: fakeStorage() });
  assert.equal(c.PL_LOCALES.lang, 'en');
  assert.equal(c.PL_LOCALES.normalize('zh-TW'), 'zh-Hant');
  assert.equal(c.PL_LOCALES.normalize('zh'), 'zh-Hans');
  assert.equal(c.PL_LOCALES.normalize('pt-PT'), 'pt-BR');
  assert.equal(c.PL_LOCALES.normalize('es-MX'), 'es');
});
