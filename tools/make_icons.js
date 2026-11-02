/* Draws the app icons (home screen, browser tab) as pixel art, with no image library.
 *   node tools/make_icons.js      writes assets/icons/*.png
 *
 * One 32x32 drawing, enlarged without smoothing so it keeps its pixels:
 * a ball on the night blue of the title screen, with a gold sparkle.
 * The "maskable" icon (Android crops it into a circle or a squircle) keeps
 * everything inside the middle 80%, so it leaves out the sparkle.
 */
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const OUT = path.join(__dirname, '..', 'assets', 'icons');

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];
const C = {
  sky0: hex('#0a1430'), sky1: hex('#1c3270'), star: hex('#8fa6e8'),
  ink: hex('#12121c'), red: hex('#e2402c'), redLit: hex('#ff7a5c'), redDark: hex('#a12416'),
  white: hex('#f4f4f8'), whiteDark: hex('#c3c8d8'), gold: hex('#ffd34a'), goldLit: hex('#fff3b0')
};
const STARS = [[4, 6], [7, 25], [27, 21], [24, 28], [3, 16]];

/** Colour of the drawing at cell (x, y), 0..31. */
function cell(x, y, sparkle) {
  const cx = x + 0.5 - 16, cy = y + 0.5 - 16, d = Math.hypot(cx, cy);
  if (d < 12.2) {
    if (d >= 10.9) return C.ink;                                   // outline
    if (d < 3.7) return d < 2 ? C.white : C.ink;                   // the button and its ring
    if (Math.abs(cy) < 1) return C.ink;                            // the band
    if (cy < 0) {
      if (Math.hypot(cx + 4.5, cy + 5.5) < 2.2) return C.redLit;   // shine, top left
      return cx + cy > 9.5 || d > 9.9 ? C.redDark : C.red;
    }
    return cx + cy > 7.5 || d > 9.9 ? C.whiteDark : C.white;
  }
  if (sparkle) {
    const sx = x - 26, sy = y - 5;
    if (sx === 0 && sy === 0) return C.goldLit;
    if ((sx === 0 && Math.abs(sy) <= 3) || (sy === 0 && Math.abs(sx) <= 3)) return C.gold;
  }
  if (STARS.some(([a, b]) => a === x && b === y)) return C.star;
  const t = y / 31;                                                // night sky, darker at the top
  return C.sky0.map((v, i) => i === 3 ? 255 : Math.round(v + (C.sky1[i] - v) * t));
}

/** size x size RGBA pixels; pad = share of the side left empty around the drawing. */
function render(size, { pad = 0, sparkle = true } = {}) {
  const px = Buffer.alloc(size * size * 4);
  const grid = 32 / (1 - 2 * pad), off = (grid - 32) / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const gx = Math.floor(x / size * grid - off), gy = Math.floor(y / size * grid - off);
    const c = cell(Math.min(31, Math.max(0, gx)), Math.min(31, Math.max(0, gy)), sparkle);
    c.forEach((v, i) => { px[(y * size + x) * 4 + i] = v; });
  }
  return px;
}

// ---- PNG (RGBA, 8 bits per channel) ----
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
function crc32(buf) { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4), crc = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type), data]);
  len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, px) {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(size, 0); head.writeUInt32BE(size, 4);
  head[8] = 8; head[9] = 6;                                        // 8 bits, RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const ICONS = [
  ['icon-32.png', 32], ['icon-180.png', 180], ['icon-192.png', 192], ['icon-512.png', 512],
  ['icon-maskable-512.png', 512, { pad: 0.1, sparkle: false }]
];
if (require.main === module) {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, size, opts] of ICONS) fs.writeFileSync(path.join(OUT, name), png(size, render(size, opts)));
  console.log('ok: ' + ICONS.map(i => i[0]).join(', ') + ' in assets/icons/');
}
module.exports = { ICONS };
