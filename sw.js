/* ============ sw.js — offline play (the service worker) ============
 * Registered by js/core/offline.js from the published index.html only; dev.html
 * always loads fresh files, so this worker stays out of its way.
 *
 * - The shell (index.html, app.min.js, app.css, the dictionaries, the fonts,
 *   the icons) is downloaded when the worker installs, in a cache named after
 *   the build. A new build installs a new worker, which replaces the old cache.
 * - Files under assets/ (the Pokémon sprites) go into a second cache the first
 *   time they are seen; G.Offline.download() asks for all of them at once.
 *   That cache is named after js/data/sprites-meta.js, so new sprites refill it.
 * - The page itself comes from the network when there is one (an update shows
 *   at once); without a connection, or a very slow one, the cached copy opens.
 *
 * Its caches start with "pokeleague-": PokéGo shares the GitHub Pages origin.
 * tools/build.js rewrites the lines between build:begin and build:end.
 */
/* build:begin */
const VERSION = '15baadeebd';
const SPRITES = '8c074d4a9e';
const SHELL = [
  "./",
  "css/app.css?v=6dadf3b697",
  "js/app.min.js?v=15b9657cb7",
  "js/core/locales.js?v=d36f6280bc",
  "js/lang/es.js?v=d36f6280bc",
  "js/lang/fr.js?v=d36f6280bc",
  "js/lang/it.js?v=d36f6280bc",
  "js/lang/pt-BR.js?v=d36f6280bc",
  "js/lang/zh-Hans.js?v=d36f6280bc",
  "js/lang/zh-Hant.js?v=d36f6280bc",
  "assets/icons/icon-32.png",
  "assets/icons/icon-180.png",
  "assets/fonts/PixelifyPS-400.ttf",
  "assets/fonts/PixelifyPS-700.ttf",
  "manifest.json",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png"
];
/* build:end */
const SHELL_CACHE = 'pokeleague-shell-' + VERSION, ASSET_CACHE = 'pokeleague-sprites-' + SPRITES;
const HOME = new URL('./', self.registration.scope).href;
const DEV = /\/dev\.html$/;
const SLOW_PAGE_MS = 4000;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL_CACHE);
    // 'reload': past the browser's HTTP cache, so the copy matches this build.
    await c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if (k.startsWith('pokeleague-') && k !== SHELL_CACHE && k !== ASSET_CACHE) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.href.startsWith(HOME)) return;
  if (req.mode === 'navigate') {
    if (!DEV.test(url.pathname)) e.respondWith(page(req));
    return;
  }
  e.respondWith(file(e, url));
});

/** The page: from the network, or the cached one when offline or too slow. */
async function page(req) {
  const net = fetch(req);
  try {
    return await Promise.race([net, new Promise((ok, no) => setTimeout(no, SLOW_PAGE_MS))]);
  } catch (err) {
    const shell = await caches.open(SHELL_CACHE);
    return (await shell.match(HOME)) || net;
  }
}

/** Any other file: the cached copy, otherwise the network (and sprites are kept). */
async function file(e, url) {
  const client = e.clientId && await self.clients.get(e.clientId);
  if (client && DEV.test(new URL(client.url).pathname)) return fetch(e.request);
  // Sprites are kept without their query: sprites.js retries a failed one with ?r=N.
  const asset = url.pathname.includes('/assets/');
  const key = asset ? url.origin + url.pathname : e.request;
  const hit = await caches.match(key);
  if (hit) return hit;
  const res = await fetch(e.request);
  if (asset && res.ok) {
    // Kept before answering: once G.Offline.download() has its answer, the file is in the cache.
    try { await (await caches.open(ASSET_CACHE)).put(key, res.clone()); } catch (err) { /* full: still answer */ }
  }
  return res;
}
