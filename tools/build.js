/* Packs the game for publishing: one minified JS and one CSS instead of ~90 files.
 *   node tools/build.js            (also writes js/lang/<lang>/*.js through build_langs.js)
 *   node tools/build.js --expose   without the closure wrap (G stays on window; for tests)
 *
 * - dev.html is the SOURCE page: it loads each script and stylesheet on its
 *   own, for comfortable programming and debugging. EDIT dev.html, never index.html.
 * - index.html is generated from dev.html: the script block becomes
 *   js/app.min.js and the stylesheet block css/app.css, each with a content
 *   fingerprint in its URL so browsers do not keep a stale copy.
 * - <script data-dev> files (debug.js) are left out of the published build.
 * - The content of Johto, Hoenn and Sinnoh goes into js/pack/<region>.js, not into app.min.js:
 *   the game downloads a region when it is reached (js/core/packs.js; G.PACKS, written here, says what there is).
 * - sw.js (offline play) gets the list of files it keeps, with the same fingerprints.
 * - The generation pages (js/core/gen.js PUBLISHED): gen<k>/index.html, the same page with <html data-gen="k">
 *   and <base href="../"> (every file comes from the folder above, shared with index.html), its own title and
 *   gen<k>/manifest.json (its own Home Screen app).
 */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const DEV = path.join(ROOT, 'dev.html'), OUT = path.join(ROOT, 'index.html');

const dev = fs.readFileSync(DEV, 'utf8');
// The sprite artists for the credits screen, from CREDITS.md.
require('./credits_js').write();
function block(begin, end) {
  const i = dev.indexOf(begin), j = dev.indexOf(end);
  if (i < 0 || j < 0) throw new Error('dev.html lacks the markers ' + begin + ' / ' + end);
  return { i, j: j + end.length, text: dev.slice(i, j + end.length) };
}
const sha = (...bufs) => { const h = crypto.createHash('sha1'); bufs.forEach(b => h.update(b)); return h.digest('hex').slice(0, 10); };

// ---- scripts ----
const S = block('<!-- scripts:begin -->', '<!-- scripts:end -->');
const files = [...S.text.matchAll(/<script([^>]*)src="(js\/[^"]+\.js)"/g)].filter(m => !/\bdata-dev\b/.test(m[1])).map(m => m[2]);
const EXPOSE = process.argv.includes('--expose');
const bundle = list => list.map(f => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const CACHE = path.join(ROOT, 'tools', 'cache', 'build');
/** Minified with terser (--prefer-offline: from the npm cache when it is there; a slow network made npx hang). */
function minify(source, out) {
  const tmp = path.join(CACHE, path.basename(out));
  fs.mkdirSync(CACHE, { recursive: true });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(tmp, source);
  execFileSync(npx, ['--yes', '--prefer-offline', 'terser@5', tmp, '--compress', 'passes=1', '--mangle', '--comments', 'false', '--ecma', '2020', '-o', out],
    { stdio: 'inherit', shell: process.platform === 'win32' });
  return fs.readFileSync(out);
}

// ---- dictionaries (js/lang/<lang>/), one file per language and part; locales.js passes on its own fingerprint ----
const { build: buildLangs, REGIONS } = require('./build_langs');
const langSizes = buildLangs();
const LANG_DIR = path.join(ROOT, 'js', 'lang');
const langFiles = fs.readdirSync(LANG_DIR).sort().flatMap(l => fs.readdirSync(path.join(LANG_DIR, l)).sort().map(f => `js/lang/${l}/${f}`));
const locBufs = [fs.readFileSync(path.join(ROOT, 'js', 'core', 'locales.js')), ...langFiles.map(f => fs.readFileSync(path.join(ROOT, f)))];
const locV = sha(...locBufs);

// ---- region packs: js/pack/<region>.js, downloaded when the region is reached (js/core/packs.js) ----
const regionOf = f => REGIONS.find(r => f.startsWith(`js/content/${r}/`)) || null;
const PACKS = { main: `js/lang/{lang}/main.js?v=${locV}`, text: `js/lang/{lang}/text.js?v=${locV}` };
const maps = require('./map_check').mapsByFile();
const packSizes = [];
for (const r of REGIONS) {
  const own = files.filter(f => regionOf(f) === r);
  const js = minify(`PL_PACK(${JSON.stringify(r)},function(G){\n${bundle(own)}\n});\n`, path.join(ROOT, 'js', 'pack', r + '.js'));
  PACKS[r] = { js: `js/pack/${r}.js?v=${sha(js)}`, lang: `js/lang/{lang}/${r}.js?v=${locV}`, maps: {} };
  for (const f of own) for (const [id, loc] of Object.entries(maps[f] || {})) PACKS[r].maps[id] = loc || 0;
  packSizes.push(`${r} ${(js.length / 1024).toFixed(0)} KB`);
}

let joined = bundle(files.filter(f => !regionOf(f))) + '\n;\nG.PACKS = ' + JSON.stringify(PACKS) + ';\n';
if (!EXPOSE) {
  // Published: the game runs inside a closure, so G is not reachable from the console.
  const WIN_G = 'window.G = window.G || {};';
  if (!joined.includes(WIN_G)) throw new Error('util.js no longer creates G as expected: check build.js');
  joined = '(() => {\n' + joined.replace(WIN_G, 'var G = {};') + '\n})();\n';
}
const min = minify(joined, path.join(ROOT, 'js', 'app.min.js'));

// ---- styles ----
const C = block('<!-- css:begin -->', '<!-- css:end -->');
const sheets = [...C.text.matchAll(/<link[^>]*href="(css\/[^"]+\.css)"/g)].map(m => m[1]);
const css = sheets.map(f => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(ROOT, 'css', 'app.css'), css);

// ---- the page ----
const LOC = '<script src="js/core/locales.js"></script>';
if (!dev.includes(LOC)) throw new Error('dev.html does not load ' + LOC + ' as expected: check build.js');

const hash = sha(min, css);
let html = dev.slice(0, C.i) + `<link rel="stylesheet" href="css/app.css?v=${sha(css)}">` + dev.slice(C.j, S.i)
  + `<script defer src="js/app.min.js?v=${hash}"></script>` + dev.slice(S.j);
html = html.replace(LOC, `<script src="js/core/locales.js?v=${locV}"></script>`);
html = html.replace(/<meta name="robots" content="noindex">\s*/, '');
html = html.replace(/<!-- dev\.html: the source page[^>]*-->/, '<!-- GENERATED from dev.html by tools/build.js: do not edit by hand (edit dev.html). -->');
fs.writeFileSync(OUT, html);

// ---- the generation pages (js/core/gen.js): gen<k>/index.html and gen<k>/manifest.json ----
const Gen = (() => {
  const box = { G: {} };
  require('vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'core', 'gen.js'), 'utf8'), box);
  return box.G.Gen;
})();
const manifest = fs.readFileSync(path.join(ROOT, 'manifest.json'));
const genPages = Gen.PUBLISHED.map(k => {
  const name = `PokeLeague (${Gen.name(k)})`, short = 'PokeLeague ' + k;
  const swap = (s, a, b) => { if (!s.includes(a)) throw new Error('index.html lacks ' + a + ': check build.js'); return s.replace(a, b); };
  let page = swap(html, '<html lang="en">', `<html lang="en" data-gen="${k}">`);
  page = swap(page, '<meta charset="utf-8">',
    '<meta charset="utf-8">\n<!-- Every file comes from the folder above, shared with the whole journey\'s page. -->\n<base href="../">');
  page = swap(page, '<title>PokeLeague</title>', `<title>${name}</title>`);
  page = swap(page, '<meta name="apple-mobile-web-app-title" content="PokeLeague">', `<meta name="apple-mobile-web-app-title" content="${short}">`);
  page = swap(page, '<link rel="manifest" href="manifest.json">', `<link rel="manifest" href="gen${k}/manifest.json">`);
  page = page.replace(/<meta name="description" content="/, `$&${name}: ${Gen.region(k)} only, Pokémon 1 to ${Gen.INFO[k].maxDex}. `);
  const m = JSON.parse(manifest);
  delete m.id;                                       // its id is then its start_url: /PokeLeague/gen<k>/
  Object.assign(m, { name, short_name: short, start_url: './', scope: './' });
  m.icons = m.icons.map(i => Object.assign({}, i, { src: '../' + i.src }));
  const json = JSON.stringify(m, null, 2) + '\n';
  fs.mkdirSync(path.join(ROOT, 'gen' + k), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'gen' + k, 'index.html'), page);
  fs.writeFileSync(path.join(ROOT, 'gen' + k, 'manifest.json'), json);
  return { k, page, json };
});

// ---- service worker: the files sw.js keeps for offline play (between its build: markers) ----
const SW = path.join(ROOT, 'sw.js');
const shell = [...new Set(['./', `css/app.css?v=${sha(css)}`, `js/app.min.js?v=${hash}`, `js/core/locales.js?v=${locV}`,
  ...[...html.matchAll(/<link[^>]*href="(assets\/[^"?]+)"/g)].map(m => m[1]),     // fonts, icons
  'manifest.json', ...JSON.parse(manifest).icons.map(i => i.src),
  ...genPages.flatMap(g => [`gen${g.k}/`, `gen${g.k}/manifest.json`])])];
// Kept only once the game has asked for them: the regions' packs, every dictionary and text.
const parts = REGIONS.map(r => PACKS[r].js).concat(langFiles.map(f => `${f}?v=${locV}`));
const icons = shell.filter(f => f.startsWith('assets/icons/')).map(f => fs.readFileSync(path.join(ROOT, f)));
const swSrc = fs.readFileSync(SW, 'utf8'), B = '/* build:begin */', E = '/* build:end */';
const bi = swSrc.indexOf(B), bj = swSrc.indexOf(E);
if (bi < 0 || bj < 0) throw new Error('sw.js lacks the markers ' + B + ' / ' + E);
fs.writeFileSync(SW, swSrc.slice(0, bi + B.length)
  + `\nconst VERSION = '${sha(Buffer.from(html), manifest, ...icons, ...genPages.flatMap(g => [Buffer.from(g.page), Buffer.from(g.json)]))}';`
  + `\nconst SPRITES = '${sha(fs.readFileSync(path.join(ROOT, 'js', 'data', 'sprites-meta.js')))}';`
  + `\nconst SHELL = [\n${shell.map(f => '  ' + JSON.stringify(f)).join(',\n')}\n];`
  + `\nconst PARTS = [\n${parts.map(f => '  ' + JSON.stringify(f)).join(',\n')}\n];\n` + swSrc.slice(bj));

// Published version (for a future "update available" notice).
fs.writeFileSync(path.join(ROOT, 'version.json'), JSON.stringify({ v: hash, at: new Date().toISOString() }) + '\n');
console.log('ok: dictionaries (main+johto+hoenn+sinnoh) ' + langSizes.join(' · '));
console.log('ok: packs ' + packSizes.join(' · '));
console.log('ok: generation pages ' + (genPages.map(g => 'gen' + g.k + '/').join(' ') || 'none'));
console.log(`${EXPOSE ? '[EXPOSED, tests only] ' : ''}ok: ${files.length} scripts · ${(joined.length / 1024).toFixed(0)} KB -> ${(min.length / 1024).toFixed(0)} KB · ${sheets.length} stylesheets (app.min.js?v=${hash})`);
