/* Packs the game for publishing: one minified JS and one CSS instead of ~90 files.
 *   node tools/build.js            (also writes js/lang/*.js through build_langs.js)
 *   node tools/build.js --expose   without the closure wrap (G stays on window; for tests)
 *
 * - dev.html is the SOURCE page: it loads each script and stylesheet on its
 *   own, for comfortable programming and debugging. EDIT dev.html, never index.html.
 * - index.html is generated from dev.html: the script block becomes
 *   js/app.min.js and the stylesheet block css/app.css, each with a content
 *   fingerprint in its URL so browsers do not keep a stale copy.
 * - <script data-dev> files (debug.js) are left out of the published build.
 */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const DEV = path.join(ROOT, 'dev.html'), OUT = path.join(ROOT, 'index.html');

const dev = fs.readFileSync(DEV, 'utf8');
function block(begin, end) {
  const i = dev.indexOf(begin), j = dev.indexOf(end);
  if (i < 0 || j < 0) throw new Error('dev.html lacks the markers ' + begin + ' / ' + end);
  return { i, j: j + end.length, text: dev.slice(i, j + end.length) };
}
const sha = (...bufs) => { const h = crypto.createHash('sha1'); bufs.forEach(b => h.update(b)); return h.digest('hex').slice(0, 10); };

// ---- scripts ----
const S = block('<!-- scripts:begin -->', '<!-- scripts:end -->');
const files = [...S.text.matchAll(/<script([^>]*)src="(js\/[^"]+\.js)"/g)].filter(m => !/\bdata-dev\b/.test(m[1])).map(m => m[2]);
let joined = files.map(f => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
const EXPOSE = process.argv.includes('--expose');
if (!EXPOSE) {
  // Published: the game runs inside a closure, so G is not reachable from the console.
  const WIN_G = 'window.G = window.G || {};';
  if (!joined.includes(WIN_G)) throw new Error('util.js no longer creates G as expected: check build.js');
  joined = '(() => {\n' + joined.replace(WIN_G, 'var G = {};') + '\n})();\n';
}
const tmp = path.join(ROOT, 'tools', 'cache', 'build', 'app.js');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, joined);
const outJs = path.join(ROOT, 'js', 'app.min.js');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['--yes', 'terser@5', tmp, '--compress', 'passes=1', '--mangle', '--comments', 'false', '--ecma', '2020', '-o', outJs],
  { stdio: 'inherit', shell: process.platform === 'win32' });
const min = fs.readFileSync(outJs);

// ---- styles ----
const C = block('<!-- css:begin -->', '<!-- css:end -->');
const sheets = [...C.text.matchAll(/<link[^>]*href="(css\/[^"]+\.css)"/g)].map(m => m[1]);
const css = sheets.map(f => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(ROOT, 'css', 'app.css'), css);

// ---- dictionaries: one per language (js/lang/), fetched by locales.js with its own fingerprint ----
const { build: buildLangs } = require('./build_langs');
const langSizes = buildLangs();
const LOC = '<script src="js/core/locales.js"></script>';
if (!dev.includes(LOC)) throw new Error('dev.html does not load ' + LOC + ' as expected: check build.js');
const locBufs = [fs.readFileSync(path.join(ROOT, 'js', 'core', 'locales.js'))];
for (const f of fs.readdirSync(path.join(ROOT, 'js', 'lang')).sort()) locBufs.push(fs.readFileSync(path.join(ROOT, 'js', 'lang', f)));

const hash = sha(min, css);
let html = dev.slice(0, C.i) + `<link rel="stylesheet" href="css/app.css?v=${sha(css)}">` + dev.slice(C.j, S.i)
  + `<script defer src="js/app.min.js?v=${hash}"></script>` + dev.slice(S.j);
html = html.replace(LOC, `<script src="js/core/locales.js?v=${sha(...locBufs)}"></script>`);
html = html.replace(/<meta name="robots" content="noindex">\s*/, '');
html = html.replace(/<!-- dev\.html: the source page[^>]*-->/, '<!-- GENERATED from dev.html by tools/build.js: do not edit by hand (edit dev.html). -->');
fs.writeFileSync(OUT, html);
// Published version (for a future "update available" notice).
fs.writeFileSync(path.join(ROOT, 'version.json'), JSON.stringify({ v: hash, at: new Date().toISOString() }) + '\n');
console.log('ok: dictionaries ' + langSizes.join(' · '));
console.log(`${EXPOSE ? '[EXPOSED, tests only] ' : ''}ok: ${files.length} scripts · ${(joined.length / 1024).toFixed(0)} KB -> ${(min.length / 1024).toFixed(0)} KB · ${sheets.length} stylesheets (app.min.js?v=${hash})`);
