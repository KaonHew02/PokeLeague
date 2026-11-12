/* ============ minimap.js — the map you are on, in the top-left corner ============
 * A small drawing of the current map (one pixel a tile, by its kind: water, trees, grass, paths, buildings...)
 * with a blinking dot where you stand, and the place's name under it. Tapped, it opens the Town Map, where a
 * town you have been to can be teleported to (town-map-ui.js, G.World.teleportBlock / flyTo).
 * Shown while you walk (the overworld, no screen open), with the setting `minimap` on (the default); not in a
 * dark cave before Flash (it would give the way away). While it shows, the place banner is not needed (field.js).
 *
 *   G.Minimap.init()   builds it (game.js)
 *   G.Minimap.tick()   every frame: shown or hidden, the drawing of a new map, the dot (game.js)
 *   G.Minimap.colorOf(kind, solid) -> '#rrggbb'   (tests)
 *   G.Minimap.shown
 */
G.Minimap = (() => {
  // Colours by tile kind; anything else: by whether it can be walked on.
  const COLORS = {
    water: '#3f86d8', deep: '#2c62b0', rapids: '#5aa0e8', whirlpool: '#2c62b0', waterfall: '#7ab8f0',
    'current-left': '#3f86d8', 'current-right': '#3f86d8', 'current-up': '#3f86d8', 'current-down': '#3f86d8',
    tree: '#2a5c2a', cuttree: '#3c7a34', headtree: '#2a5c2a', berrytree: '#3c7a34', hedge: '#2a5c2a',
    cliff: '#7a6248', smashrock: '#8a7458', wall: '#5a5a66',
    tall: '#4f9a3c', grass: '#86c45c', flowers: '#9ccc68',
    path: '#d8c48a', sand: '#e2d29a', bridge: '#b08a58', ice: '#bfe6f2',
    stamp: '#b0503c', door: '#3a2a20', ladder: '#20242c', hole: '#20242c', pit: '#20242c', stairs: '#3a3440',
    wood: '#c8a070', tile: '#d8d8d0', rug: '#c86a5a', mat: '#a85a48'
  };
  const colorOf = (kind, solid) => COLORS[kind] || (solid ? '#4a4a52' : '#b8b8a8');

  let el = null, cv = null, dot = null, name = null, shown = false;
  let drawn = null, spot = '';

  function init() {
    if (el || typeof document === 'undefined') return;
    el = document.createElement('button');
    el.className = 'minimap hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<span class="mm-map"><canvas></canvas><i class="mm-dot"></i></span><span class="mm-name"></span>';
    cv = el.querySelector('canvas'); dot = el.querySelector('.mm-dot'); name = el.querySelector('.mm-name');
    const frame = document.getElementById('frame');
    (frame || document.body).appendChild(el);
    // A tap is never a tap on the map under it (G.Input), and opens the Town Map.
    el.addEventListener('pointerdown', e => e.stopPropagation());
    el.addEventListener('click', e => { e.stopPropagation(); openMap(); });
  }

  /** The Town Map; a visited town picked there is teleported to. */
  async function openMap() {
    if (!G.TownMapUI || !shown) return;
    if (G.Audio) G.Audio.sfx('menu');
    const id = await G.TownMapUI.open({ teleport: true });
    if (id && G.World && G.World.flyTo) { if (G.UI.closeAll) G.UI.closeAll(); G.World.flyTo(id); }
  }

  /** One pixel a tile, kept until the map changes. */
  function draw(m) {
    cv.width = m.w; cv.height = m.h;
    const c = cv.getContext('2d'), img = c.createImageData(m.w, m.h);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const k = G.Maps.kindAt(m, x, y), hex = colorOf(k, G.Maps.info(k).solid);
      const i = (y * m.w + x) * 4;
      img.data[i] = parseInt(hex.slice(1, 3), 16); img.data[i + 1] = parseInt(hex.slice(3, 5), 16);
      img.data[i + 2] = parseInt(hex.slice(5, 7), 16); img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    // As large as its corner allows, the same shape as the map.
    const frame = document.getElementById('frame');
    const fw = frame ? frame.clientWidth : innerWidth, fh = frame ? frame.clientHeight : innerHeight;
    const k = Math.max(1, Math.min(fw * 0.2 / m.w, fh * 0.26 / m.h));
    cv.style.width = Math.round(m.w * k) + 'px'; cv.style.height = Math.round(m.h * k) + 'px';
    name.textContent = m.loc ? G.Names.loc(m.loc) : '';
    drawn = m;
  }

  /** Will it show on this map (the setting on, not in the dark)? The place banner is not needed then (field.js). */
  const covers = (m, lit) => !!(m && G.Settings && G.Settings.get('minimap') !== false && !(m.def.dark && !lit));

  /** While you walk, with the setting on, and not in the dark. */
  function wanted() {
    const W = G.World, m = W && W.map;
    return !!(m && W.player && G.Game && G.Game.mode === 'overworld' && G.Settings && G.Settings.get('minimap') !== false
      && !(G.UI && G.UI.anyOpen && G.UI.anyOpen()) && !(m.def.dark && !W.lit));
  }

  function tick() {
    if (!el) return;
    const on = wanted();
    if (on !== shown) { shown = on; el.classList.toggle('hidden', !on); }
    if (!on) return;
    const m = G.World.map, me = G.World.player;
    if (m !== drawn) draw(m);
    const at = me.x + ',' + me.y + ',' + m.w + ',' + m.h;
    if (at !== spot) {
      spot = at;
      dot.style.left = ((me.x + 0.5) / m.w * 100) + '%';
      dot.style.top = ((me.y + 0.5) / m.h * 100) + '%';
    }
  }

  return { init, tick, colorOf, covers, openMap, get shown() { return shown; } };
})();
