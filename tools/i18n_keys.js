/* Collects every English text the game shows, so translations can be checked:
 *   node tools/i18n_keys.js        prints them, with where each one comes from
 *
 *   - literal G.T('…') / G.I18n.fmt('…') / T('…') / fmt('…') calls in js/
 *   - text and translatable attributes of dev.html (not inside translate="no")
 *   - text fields of the content files (G.Maps.def / G.Scripts.def / trainers),
 *     collected by content.js-aware patterns once the content exists (M6)
 *
 * Used by tests/i18n.test.cjs and by build_langs.js --missing.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

function walkJs(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['lang', 'i18n', 'vendor'].includes(e.name)) walkJs(p, out); }
    else if (e.name.endsWith('.js') && e.name !== 'app.min.js') out.push(p);
  }
  return out;
}

/** JS string literal at s[i] (quote char at i) -> [value, end index] or null. */
function readString(s, i) {
  const q = s[i];
  if (q !== "'" && q !== '"' && q !== '`') return null;
  let v = '', j = i + 1;
  while (j < s.length && s[j] !== q) {
    if (s[j] === '\\') { const n = s[j + 1]; v += n === 'n' ? '\n' : n === 't' ? '\t' : n; j += 2; continue; }
    if (q === '`' && s[j] === '$' && s[j + 1] === '{') return null;     // template with code: not a key
    v += s[j++];
  }
  return j < s.length ? [v, j + 1] : null;
}

function fromJs(file, keys) {
  // Without comments (their examples are not texts of the game).
  const src = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const re = /(?:\bG\.T|\bG\.I18n\.fmt|(?<![\w.])T|(?<![\w.])fmt)\(\s*/g;
  let m;
  while ((m = re.exec(src))) {
    const r = readString(src, re.lastIndex);
    if (r && r[0].trim()) keys.has(r[0]) || keys.set(r[0], rel);
  }
  // Content: say / sign / dialogue text in [ 'say', '…' ] commands and text fields.
  const re2 = /\[\s*'(?:say|choice|sign)'\s*,\s*/g;
  while ((m = re2.exec(src))) {
    const r = readString(src, re2.lastIndex);
    if (r && r[0].trim()) keys.has(r[0]) || keys.set(r[0], rel);
  }
  const re3 = /\b(?:say|before|defeat|after|text|sign):\s*/g;
  while ((m = re3.exec(src))) {
    const r = readString(src, re3.lastIndex);
    if (r && r[0].trim() && /\p{L}/u.test(r[0])) keys.has(r[0]) || keys.set(r[0], rel);
  }
}

function fromHtml(keys) {
  let html = fs.readFileSync(path.join(ROOT, 'dev.html'), 'utf8');
  html = html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  // Drop elements marked translate="no" (simple elements without nesting of the same tag).
  html = html.replace(/<(\w+)[^>]*translate="no"[^>]*>[\s\S]*?<\/\1>/g, '');
  for (const m of html.matchAll(/>([^<>]+)</g)) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t && /\p{L}/u.test(t)) keys.has(t) || keys.set(t, 'dev.html');
  }
  for (const m of html.matchAll(/\b(?:placeholder|title|alt|aria-label)="([^"]+)"/g)) keys.has(m[1]) || keys.set(m[1], 'dev.html');
}

/** Texts that are the same in every language (names). */
const SAME = new Set(['PokeLeague']);

/** -> Map(text -> where it was found) */
function keys() {
  const k = new Map();
  fromHtml(k);
  for (const f of walkJs(path.join(ROOT, 'js'))) fromJs(f, k);
  for (const s of SAME) k.delete(s);
  return k;
}

module.exports = { keys };

if (require.main === module) for (const [k, where] of keys()) console.log(JSON.stringify(k).padEnd(60) + ' ' + where);
