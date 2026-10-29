/* ============ tiles.js — pixel-art tiles painted in code (from PokéGo tiles.js) ============
 * Everything is painted at ART resolution (16 px per tile) into an ImageData
 * and drawn ×G.Sprites.PX without smoothing, so tiles share their pixel size
 * with the Mystery Dungeon sprites and the trainers of people.js.
 *
 *   G.Tiles.bakeMap(map)  -> { ground:[canvas, canvas], strips:{ row: { canvas, up } }, tuft }
 *       the whole map painted once. ground[1] is the second frame of water and
 *       flowers (same canvas when the map has neither). strips are the tall
 *       things whose base is on that row (trees, buildings): render.js draws
 *       them Y-sorted with the people, so you can walk behind a tree top or a roof.
 *   G.Tiles.border(map)   a small canvas that tiles the outside of the map (border kind)
 *   G.Tiles.sprite(name)  props: 'tree', 'tuft' (front of the tall grass), 'ball' (item)
 *
 * Palettes (PALETTES) replace PokéGo's noise-driven biomes. Autotiling: each
 * tile looks at its 8 neighbours (cliff faces, water shores, path edges,
 * fence rails, rug borders...). Outside the map a tile sees the map's border.
 */
G.Tiles = (() => {
  const T = 16;
  const H = (x, y, s) => G.U.hash(x, y, s);

  const PALETTES = {
    kanto: {
      grass: ['#88d070', '#80c868', '#90d878'], speck: '#68b050', light: '#a8e488',
      path: ['#ecd4a4', '#e4cc9c', '#f2dcae'], pathEdge: '#c8a870', pathSpeck: '#d4b484',
      sand: ['#f2e8bc', '#eae0b2', '#f8f0c8'], sandEdge: '#d8c890', sandSpeck: '#dcd09c',
      tall: ['#3c9838', '#58b450', '#80d068'], tallEdge: '#24642a',
      petals: ['#f86058', '#f8f8f8'], petalCenter: '#f8d040',
      leaf: ['#1f5a2c', '#2e7a38', '#47a046', '#76c65c'], trunk: ['#6a4020', '#8a5a30'], treeEdge: '#163018',
      cliffTop: ['#c9a878', '#d2b282', '#c2a070'], cliffLight: '#e2ca9a', cliffEdge: '#5a4028',
      cliffFace: ['#a47a50', '#946c44'], cliffFaceDark: '#644830',
      liq: '#6aa8f8', liqDeep: '#4a88e8', foam: '#e0f4ff', shore: '#68b050',
      wood: ['#c89060', '#e2b47c', '#8a5a34'], woodEdge: '#4e3420',
      ledge: ['#5aa448', '#3f8a36', '#2c6c26']
    },
    forest: {
      grass: ['#5ea850', '#58a04a', '#64b058'], speck: '#45883c', light: '#7cc064',
      path: ['#cdb78c', '#c4ae84', '#d4c096'], pathEdge: '#a48a5a', pathSpeck: '#b49c70',
      sand: ['#e2d8ac', '#dad0a4', '#eae0b8'], sandEdge: '#c8b880', sandSpeck: '#ccc08c',
      tall: ['#2c7c2c', '#409a3c', '#62b854'], tallEdge: '#1a4a1e',
      petals: ['#f8a0c0', '#f8f8f8'], petalCenter: '#f8d040',
      leaf: ['#123e1e', '#1d5a28', '#2f7c34', '#56a048'], trunk: ['#4e3018', '#6a4424'], treeEdge: '#0c2010',
      cliffTop: ['#9c8c6c', '#a49474', '#948464'], cliffLight: '#bcac8a', cliffEdge: '#3e3424',
      cliffFace: ['#7c6c50', '#6e6046'], cliffFaceDark: '#4a4030',
      liq: '#4c90d8', liqDeep: '#3472c0', foam: '#c8ecff', shore: '#45883c',
      wood: ['#a8784c', '#c89a68', '#6e4828'], woodEdge: '#3a2616',
      ledge: ['#46903c', '#33782e', '#225a20']
    },
    // Caves (Mt. Moon): an outdoor-style map whose "grass" is the cave floor and cliffs are rock walls.
    cave: {
      grass: ['#b49670', '#ac8e68', '#bc9e78'], speck: '#927454', light: '#c8ac86',
      path: ['#c4a87e', '#bca076', '#ccb088'], pathEdge: '#987a54', pathSpeck: '#a88a62',
      sand: ['#c8b494', '#c0ac8c', '#d0bc9c'], sandEdge: '#a08a68', sandSpeck: '#ac9878',
      tall: ['#7a6448', '#8a7254', '#9c8460'], tallEdge: '#4e3c28',
      petals: ['#e8d8a0', '#f8f0d0'], petalCenter: '#f8d040',
      leaf: ['#3a2c20', '#4e3c2c', '#66503a', '#80684c'], trunk: ['#3e2c1e', '#54402c'], treeEdge: '#1e140c',
      cliffTop: ['#5e4a38', '#664f3c', '#584434'], cliffLight: '#7a644c', cliffEdge: '#241810',
      cliffFace: ['#5e4836', '#56402e'], cliffFaceDark: '#34261a',
      liq: '#3a6ab0', liqDeep: '#2a5296', foam: '#a8c8f0', shore: '#866a4c',
      wood: ['#8a6a48', '#a88660', '#5e4630'], woodEdge: '#2e2016',
      ledge: ['#8a7052', '#6e563e', '#52402c']
    },
    // Interiors: walls, floors and furniture. `floor` is what lies under furniture.
    house: { floor: 'wood', wallTop: ['#5c5450', '#6a625c'], paper: ['#f2e6c8', '#e8dab8'], trim: '#b08a60', base: '#7a5a3c',
      wood: ['#d8a868', '#cc9a5c', '#e2b478'], woodLine: '#a07040', tile: ['#eeeee6', '#d8d8d0'], grout: '#c2c2ba',
      rug: ['#c84848', '#e46c64', '#962c2c'], counter: ['#e8d6b4', '#c8ac88', '#987858'],
      mat: ['#4c9a4c', '#74bc6c'], screen: '#58b8f0' },
    center: { floor: 'tile', wallTop: ['#6a5058', '#7a6068'], paper: ['#fae4e4', '#f2d4d4'], trim: '#e08c8c', base: '#b86464',
      wood: ['#d8a868', '#cc9a5c', '#e2b478'], woodLine: '#a07040', tile: ['#faf2e2', '#efe2c8'], grout: '#dccdb2',
      rug: ['#e05a5a', '#f28282', '#b03c3c'], counter: ['#fafafa', '#e2d8d4', '#c49a9a'],
      mat: ['#e05050', '#f48a80'], screen: '#68d0f8' },
    mart: { floor: 'tile', wallTop: ['#4c5a70', '#5a6880'], paper: ['#dcebfa', '#cadcf0'], trim: '#7094c4', base: '#4c6a9c',
      wood: ['#d8a868', '#cc9a5c', '#e2b478'], woodLine: '#a07040', tile: ['#f2f2f2', '#e0e0ea'], grout: '#cacad6',
      rug: ['#4c70c8', '#7092e2', '#30509c'], counter: ['#f0f4fa', '#c8d4e6', '#8ea0bc'],
      mat: ['#4c6cc0', '#7090e0'], screen: '#68d0f8' },
    lab: { floor: 'tile', wallTop: ['#585c64', '#666a72'], paper: ['#f2f2f2', '#e4e4e6'], trim: '#a0a4ac', base: '#7c8088',
      wood: ['#d8a868', '#cc9a5c', '#e2b478'], woodLine: '#a07040', tile: ['#eaf2f2', '#d8e2e2'], grout: '#c4d0d0',
      rug: ['#58a060', '#7cc080', '#3c7c44'], counter: ['#f4f4f4', '#d0d4da', '#9aa0aa'],
      mat: ['#58a060', '#7cc080'], screen: '#68d0f8' },
    gym: { floor: 'tile', wallTop: ['#4a4440', '#56504a'], paper: ['#cac2b2', '#bab2a2'], trim: '#8c8270', base: '#6a6050',
      wood: ['#b88c5c', '#a87c50', '#c89c6c'], woodLine: '#806040', tile: ['#c8b898', '#b8a888'], grout: '#a09070',
      rug: ['#b84040', '#d86060', '#882828'], counter: ['#d8d0c0', '#b0a690', '#807660'],
      mat: ['#b84040', '#d86060'], screen: '#68d0f8' },
    // A Gym with a swimming pool (Cerulean): the water's corners take the floor colours.
    pool: { floor: 'tile', wallTop: ['#3a5a7a', '#466888'], paper: ['#d8e8f4', '#c8dcec'], trim: '#7aa0c0', base: '#4a7090',
      wood: ['#b88c5c', '#a87c50', '#c89c6c'], woodLine: '#806040', tile: ['#e8eef4', '#d8e2ea'], grout: '#b8c8d4',
      rug: ['#3a8ad0', '#5aa8e8', '#2a6aa8'], counter: ['#e8eef4', '#c4d0dc', '#8a9cae'],
      mat: ['#3a8ad0', '#5aa8e8'], screen: '#68d0f8',
      grass: ['#e8eef4', '#e4eaf0', '#e8eef4'], speck: '#d8e2ea', light: '#eef2f6', shore: '#c8d6e2',
      liq: '#5ab4f4', liqDeep: '#3a94e4', foam: '#e6f6ff' }
  };
  // The Pokémon Tower: cold purple stone.
  PALETTES.tower = { floor: 'tile', wallTop: ['#3e344c', '#4a3e5a'], paper: ['#bcb2cc', '#aca2bc'], trim: '#7a6c90', base: '#4e4262',
    wood: ['#8c7a9a', '#7c6a8a', '#9c8aaa'], woodLine: '#5c4c6a', tile: ['#a89cb8', '#9a8eaa'], grout: '#84789a',
    rug: ['#6a4a8a', '#8a6aaa', '#4a3068'], counter: ['#c8c0d4', '#a49cb4', '#746a88'],
    mat: ['#6a4a8a', '#8a6aaa'], screen: '#68d0f8' };
  // A greenhouse Gym (Celadon): pale green tiles and hedges.
  PALETTES.garden = { floor: 'tile', wallTop: ['#3e5a3e', '#4a684a'], paper: ['#dcecd4', '#cce0c4'], trim: '#7aa070', base: '#4e7448',
    wood: ['#b88c5c', '#a87c50', '#c89c6c'], woodLine: '#806040', tile: ['#d8e8c8', '#c8dcb8'], grout: '#b0c8a0',
    rug: ['#e070a0', '#f094bc', '#b04c7c'], counter: ['#e8f0e0', '#c4d4b8', '#8aa080'],
    mat: ['#5aa04a', '#7cc06c'], screen: '#68d0f8' };
  // Whitney's Gym (Goldenrod): soft pink tiles.
  PALETTES.pink = { floor: 'tile', wallTop: ['#6a4a5a', '#7a5668'], paper: ['#fbe4ee', '#f4d4e2'], trim: '#e890b4', base: '#b85a84',
    wood: ['#d8a868', '#cc9a5c', '#e2b478'], woodLine: '#a07040', tile: ['#f8dce8', '#f0ccdc'], grout: '#dcaec2',
    rug: ['#e05a96', '#f282b4', '#b03c72'], counter: ['#fdf4f8', '#ecd0dc', '#c49aae'],
    mat: ['#e05a96', '#f282b4'], screen: '#68d0f8' };
  // Morty's Gym (Ecruteak): a dim path over darkness.
  PALETTES.ghost = { floor: 'tile', wallTop: ['#1c1824', '#24202e'], paper: ['#3e3450', '#362c46'], trim: '#5c4c78', base: '#241c30',
    wood: ['#4a3e5a', '#42364e', '#524664'], woodLine: '#2a2236', tile: ['#3c3250', '#352c48'], grout: '#2a2238',
    rug: ['#5a3a7a', '#7a5a9a', '#3a2458'], counter: ['#5a5070', '#463c5a', '#2e2640'],
    mat: ['#5a3a7a', '#7a5a9a'], screen: '#68d0f8' };
  // The Rocket Hideout: cold grey metal.
  PALETTES.hideout = { floor: 'tile', wallTop: ['#262a32', '#30343e'], paper: ['#7a8292', '#707888'], trim: '#a2aab8', base: '#3a404c',
    wood: ['#8a8e98', '#7a7e88', '#9a9ea8'], woodLine: '#5a5e68', tile: ['#b2bac6', '#a6aeba'], grout: '#8a92a0',
    rug: ['#b83a3a', '#d85a5a', '#882626'], counter: ['#d0d4dc', '#a8aeb8', '#7a808c'],
    mat: ['#b83a3a', '#d85a5a'], screen: '#68d0f8' };
  // The Game Corner: a loud red carpet and gold.
  PALETTES.corner = { floor: 'tile', wallTop: ['#3c2a3c', '#4a344a'], paper: ['#e8c868', '#dcbc5c'], trim: '#f4e0a0', base: '#8a3c3c',
    wood: ['#b88c5c', '#a87c50', '#c89c6c'], woodLine: '#806040', tile: ['#c84c4c', '#bc4444'], grout: '#9c3434',
    rug: ['#3c5cc8', '#5c7ce0', '#2a4498'], counter: ['#f0e2c0', '#d0bc90', '#9c8458'],
    mat: ['#e8c868', '#f4e0a0'], screen: '#68d0f8' };
  // Koga's Gym: a dark wooden dojo floor.
  PALETTES.dojo = { floor: 'wood', wallTop: ['#3a3030', '#463a3a'], paper: ['#e4dcc8', '#d8d0bc'], trim: '#8a6a4a', base: '#5a4030',
    wood: ['#a07848', '#94703e', '#ac8454'], woodLine: '#6c4c2c', tile: ['#d8d0bc', '#ccc4b0'], grout: '#b0a890',
    rug: ['#7a3a8a', '#9a5aaa', '#562868'], counter: ['#e0d4bc', '#bca888', '#8a7458'],
    mat: ['#7a3a8a', '#9a5aaa'], screen: '#68d0f8' };
  // The Seafoam Islands: an icy cave (outdoor-style, like Mt. Moon).
  PALETTES.seafoam = {
    grass: ['#b4ccd8', '#acc4d2', '#bcd4e0'], speck: '#8eaabc', light: '#d4e6ee',
    path: ['#c4d4dc', '#bccdd6', '#ccdce4'], pathEdge: '#90a8b8', pathSpeck: '#a2b8c6',
    sand: ['#d4dee2', '#ccd6dc', '#dce6ea'], sandEdge: '#a4b4bc', sandSpeck: '#b4c2ca',
    tall: ['#7a96a8', '#8aa6b8', '#9cb6c6'], tallEdge: '#4a6272',
    petals: ['#e8f4ff', '#f8f8f8'], petalCenter: '#a8d8f8',
    leaf: ['#2a3c4a', '#3a5060', '#4e687a', '#688494'], trunk: ['#2e3a44', '#3e4c58'], treeEdge: '#141c24',
    cliffTop: ['#6e8ea8', '#7898b2', '#6686a0'], cliffLight: '#a4c4dc', cliffEdge: '#24344a',
    cliffFace: ['#587a96', '#50708c'], cliffFaceDark: '#34506a',
    liq: '#3a7ccc', liqDeep: '#2a62b4', foam: '#e0f4ff', shore: '#8eaabc',
    wood: ['#8a7a6a', '#a89888', '#5e5046'], woodEdge: '#2e2620',
    ledge: ['#8aa4b4', '#6e8a9c', '#526c7e']
  };
  // The Pokémon Mansion: scorched wood and old wallpaper.
  PALETTES.mansion = { floor: 'wood', wallTop: ['#3a302c', '#463a34'], paper: ['#cdbd9e', '#c0b090'], trim: '#6e5442', base: '#4a382a',
    wood: ['#9a7654', '#8c6a4a', '#a8825e'], woodLine: '#5e4430', tile: ['#bcae98', '#ae9f88'], grout: '#8e806a',
    rug: ['#7c3c2c', '#9c5a46', '#5c2a1c'], counter: ['#d8c8ac', '#b4a284', '#806e54'],
    mat: ['#7c3c2c', '#9c5a46'], screen: '#68d0f8' };
  // Blaine's Gym: warm red tiles by the volcano.
  PALETTES.volcano = { floor: 'tile', wallTop: ['#4a2a24', '#56322a'], paper: ['#ecd0b0', '#e0c4a4'], trim: '#c86a3a', base: '#8a3a24',
    wood: ['#b88c5c', '#a87c50', '#c89c6c'], woodLine: '#806040', tile: ['#dca684', '#cf9876'], grout: '#ae7050',
    rug: ['#d84a2a', '#f06a4a', '#a83218'], counter: ['#f0dcc4', '#d4b694', '#a07a58'],
    mat: ['#d84a2a', '#f06a4a'], screen: '#f8a058' };
  // The Viridian Gym: packed earth and sandstone.
  PALETTES.earth = { floor: 'tile', wallTop: ['#3a3024', '#463a2c'], paper: ['#d6c49c', '#cab890'], trim: '#8c7448', base: '#5c4a2e',
    wood: ['#b88c5c', '#a87c50', '#c89c6c'], woodLine: '#806040', tile: ['#c8b080', '#bca474'], grout: '#9a8458',
    rug: ['#6a8a3a', '#8aaa5a', '#4a6a24'], counter: ['#e4d6b4', '#c4b088', '#8e7a54'],
    mat: ['#6a8a3a', '#8aaa5a'], screen: '#68d0f8' };
  // The Elite Four: Lorelei's ice-blue hall, Lance's dragon den, the Champion's golden room.
  PALETTES.ice = { floor: 'tile', wallTop: ['#2a3a52', '#344662'], paper: ['#d4e8f6', '#c4dcee'], trim: '#7aaed4', base: '#3e6a94',
    wood: ['#b8d0e0', '#a8c0d4', '#c8deec'], woodLine: '#7896ae', tile: ['#dceef8', '#cce2f2'], grout: '#a6c6dc',
    rug: ['#3a8ad0', '#5aa8e8', '#2a6aa8'], counter: ['#eef6fc', '#c4d8e8', '#8aa4bc'],
    mat: ['#3a8ad0', '#5aa8e8'], screen: '#a8e8ff' };
  PALETTES.dragon = { floor: 'tile', wallTop: ['#2a1e26', '#36262e'], paper: ['#8a4a4a', '#7c4040'], trim: '#c89040', base: '#4a2a2a',
    wood: ['#7a5a4a', '#6a4c3e', '#8a6a58'], woodLine: '#4a3228', tile: ['#6c5a64', '#605058'], grout: '#4a3c44',
    rug: ['#a83232', '#c85050', '#7a2020'], counter: ['#c8b8a8', '#a08a7a', '#6a5448'],
    mat: ['#a83232', '#c85050'], screen: '#f8a058' };
  PALETTES.champion = { floor: 'tile', wallTop: ['#3a3020', '#463a28'], paper: ['#f2e2b0', '#e6d4a0'], trim: '#c8a040', base: '#7a5a24',
    wood: ['#c8a46c', '#b8945c', '#d8b47c'], woodLine: '#8a6a3c', tile: ['#f4ead0', '#e8dcbc'], grout: '#c8b890',
    rug: ['#c83a3a', '#e05a5a', '#982828'], counter: ['#fff4d8', '#e0cc9c', '#a88c54'],
    mat: ['#c83a3a', '#e05a5a'], screen: '#68d0f8' };
  const OUT = 'kanto';

  // ---------------- colour and pixel helpers ----------------

  function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  /** ABGR (little-endian) packing, to write a whole pixel into a Uint32Array. */
  function pack(hex, a = 255) {
    const [r, g, b] = rgb(hex);
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }
  function mixPack(h1, h2, t) {
    const a = rgb(h1), b = rgb(h2);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return ((255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;
  }
  /** Lighter (k > 0) or darker (k < 0) colour. */
  function shade(hex, k) {
    const c = rgb(hex).map(v => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }

  /** Pixel canvas: set(x, y, colour), get, canvas() at the end. */
  function Pix(w, h) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    const img = c.createImageData(w, h);
    const buf = new Uint32Array(img.data.buffer);
    return {
      w, h, buf,
      set(x, y, col) { if (x >= 0 && y >= 0 && x < w && y < h) buf[y * w + x] = col; },
      get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? buf[y * w + x] : 0; },
      rect(x, y, rw, rh, col) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) this.set(x + i, y + j, col); },
      canvas() { c.putImageData(img, 0, 0); return cv; }
    };
  }

  function disc(P, cx, cy, r, colFn) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r) { const c = colFn(x, y, d / r); if (c != null) P.set(x, y, c); }
      }
  }

  /** 1 px outline around everything opaque. */
  function outline(P, col) {
    const marks = [];
    for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) {
      if (P.get(x, y) >>> 24) continue;
      if ((P.get(x + 1, y) | P.get(x - 1, y) | P.get(x, y + 1) | P.get(x, y - 1)) >>> 24) marks.push(x, y);
    }
    for (let i = 0; i < marks.length; i += 2) P.set(marks[i], marks[i + 1], col);
  }

  /** Paints an ASCII picture: each character looks up its packed colour in `cols` ('.' / ' ' = clear). */
  function ascii(P, ox, oy, rows, cols, flip = false) {
    for (let y = 0; y < rows.length; y++) {
      const r = rows[y];
      for (let x = 0; x < r.length; x++) {
        const c = cols[r[x]];
        if (c != null) P.set(ox + (flip ? r.length - 1 - x : x), oy + y, c);
      }
    }
  }

  const packed = {};
  /** The palette with every colour packed (cached). */
  function colors(name) {
    if (packed[name]) return packed[name];
    const src = Object.assign({}, PALETTES[OUT], PALETTES[name] || {});
    const C = {};
    for (const [k, v] of Object.entries(src)) {
      if (Array.isArray(v)) C[k] = v.map(h => pack(h));
      else if (typeof v === 'string' && v[0] === '#') C[k] = pack(v);
      else C[k] = v;
    }
    C.src = src;
    C.liqLight = mixPack(src.liq, src.foam, 0.3);
    C.black = pack('#101018');
    C.white = pack('#ffffff');
    C.clear = 0;
    packed[name] = C;
    return C;
  }

  // ---------------- autotiling helpers ----------------

  /** Which family a kind belongs to, for the edges between tiles. */
  const FAMILY = {
    grass: 'grass', tall: 'grass', flowers: 'grass', tree: 'grass', 'sign': 'grass', fence: 'grass',
    'ledge-down': 'grass', 'ledge-left': 'grass', 'ledge-right': 'grass',
    path: 'path', door: 'path', stamp: 'path', sand: 'sand', water: 'water', rapids: 'water', cliff: 'cliff'
  };
  const fam = k => FAMILY[k] || k;

  /**
   * Distance from (x, y) inside a tile to the edge of its own area, counting the
   * sides and the inner corners whose neighbour is different (from the water painter).
   */
  function edgeDist(x, y, same) {
    const n = same(0, -1), s = same(0, 1), w = same(-1, 0), e = same(1, 0);
    const BIG = 99;
    let d = Math.min(n ? BIG : y, s ? BIG : T - 1 - y, w ? BIG : x, e ? BIG : T - 1 - x);
    if (n && w && !same(-1, -1)) d = Math.min(d, Math.hypot(x, y) - 0.5);
    if (n && e && !same(1, -1)) d = Math.min(d, Math.hypot(T - 1 - x, y) - 0.5);
    if (s && w && !same(-1, 1)) d = Math.min(d, Math.hypot(x, T - 1 - y) - 0.5);
    if (s && e && !same(1, 1)) d = Math.min(d, Math.hypot(T - 1 - x, T - 1 - y) - 0.5);
    // Rounded outer corners (radius R).
    const R = 3, X = T - 1 - x, Y = T - 1 - y;
    if (!n && !w && x < R && y < R) d = Math.min(d, R - Math.hypot(R - x, R - y));
    if (!n && !e && X < R && y < R) d = Math.min(d, R - Math.hypot(R - X, R - y));
    if (!s && !w && x < R && Y < R) d = Math.min(d, R - Math.hypot(R - x, R - Y));
    if (!s && !e && X < R && Y < R) d = Math.min(d, R - Math.hypot(R - X, R - Y));
    return d;
  }

  // ---------------- ground painters (outdoor) ----------------

  function grass(P, C, ox, oy, tx, ty) {
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const gx = tx * T + x, gy = ty * T + y;
      const band = H(gx >> 2, gy >> 2, 11) * 0.6 + H(gx, gy, 12) * 0.5;
      let col = C.grass[band > 0.82 ? 2 : band > 0.5 ? 1 : 0];
      if (H(gx, gy, 13) < 0.02) col = C.speck;
      P.set(ox + x, oy + y, col);
    }
    // Two little tufts per tile, like the classic games' grass.
    for (let i = 0; i < 2; i++) {
      if (H(tx, ty, 20 + i) < 0.35) continue;
      const dx = ox + 2 + Math.floor(H(tx, ty, 22 + i) * 10) + (i ? 0 : 0), dy = oy + 3 + i * 7 + Math.floor(H(tx, ty, 24 + i) * 3);
      P.set(dx, dy, C.speck); P.set(dx + 2, dy, C.speck); P.set(dx + 1, dy + 1, C.speck);
      P.set(dx, dy - 1, C.light); P.set(dx + 2, dy - 1, C.light);
    }
  }

  /** Path and sand: soft edges where they meet grass. */
  function ground(P, C, ox, oy, tx, ty, at, which) {
    const base = which === 'sand' ? C.sand : C.path;
    const edge = which === 'sand' ? C.sandEdge : C.pathEdge;
    const speck = which === 'sand' ? C.sandSpeck : C.pathSpeck;
    const me = fam(which);
    const same = (dx, dy) => { const f = fam(at(tx + dx, ty + dy)); return f === me || (me === 'path' && f === 'path'); };
    grass(P, C, ox, oy, tx, ty);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const gx = tx * T + x, gy = ty * T + y;
      const d = edgeDist(x, y, same) + (H(gx, gy, 31) - 0.5) * 0.9;
      if (d < 0.6) continue;                                 // grass shows through
      let col = base[Math.floor(H(gx >> 1, gy >> 1, 32) * 2.4 + H(gx, gy, 33) * 0.6) % 3];
      if (d < 1.6) col = edge;
      else if (H(gx, gy, 34) < 0.05) col = speck;
      P.set(ox + x, oy + y, col);
    }
  }

  // Tall grass: an 8×8 tuft repeated 2×2 (0 dark base, 1 outline, 2 mid, 3 light).
  const TUFT = [
    '..1...1.',
    '.121.121',
    '.1221231',
    '12332332',
    '12333332',
    '.233332.',
    '.122221.',
    '..1111..'
  ];
  function tall(P, C, ox, oy) {
    const cols = { 0: C.tall[0], 1: C.tallEdge, 2: C.tall[1], 3: C.tall[2] };
    P.rect(ox, oy, T, T, C.tall[0]);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) ascii(P, ox + i * 8, oy + j * 8, TUFT, cols);
  }

  function flowers(P, C, ox, oy, tx, ty, frame) {
    grass(P, C, ox, oy, tx, ty);
    const pts = [[4, 4], [11, 11], [12, 3], [3, 12]];
    pts.forEach(([x, y], i) => {
      const big = i < 2;
      const pc = C.petals[(i + tx + ty) % 2];
      const cx = ox + x + (frame && big ? (i ? 1 : -1) : 0), cy = oy + y;
      if (big) {
        P.set(cx, cy - 1, pc); P.set(cx - 1, cy, pc); P.set(cx + 1, cy, pc); P.set(cx, cy + 1, pc);
        P.set(cx, cy, C.petalCenter);
        P.set(cx - 1, cy + 2, C.speck); P.set(cx + 1, cy + 2, C.speck);
      } else {
        P.set(cx, cy, pc); P.set(cx, cy + 1, C.speck);
      }
    });
  }

  /** Cliff (the wall painter of PokéGo): top face, front face where nothing is below. */
  function cliff(P, C, ox, oy, tx, ty, at) {
    const W = (x, y) => at(x, y) === 'cliff';
    const n = W(tx, ty - 1), s = W(tx, ty + 1), w = W(tx - 1, ty), e = W(tx + 1, ty);
    const FACE = s ? 0 : 7;
    grass(P, C, ox, oy, tx, ty);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      if (!n && !w && x + y < 3) continue;
      if (!n && !e && (T - 1 - x) + y < 3) continue;
      if (!s && !w && x + (T - 1 - y) < 2) continue;
      if (!s && !e && (T - 1 - x) + (T - 1 - y) < 2) continue;
      const gx = tx * T + x, gy = ty * T + y;
      let col;
      if (y >= T - FACE) {
        const fy = y - (T - FACE);
        col = C.cliffFace[(x + (H(gx, 0, 21) < 0.5 ? 0 : 1)) % 3 === 0 ? 1 : 0];
        if (fy === 0) col = C.cliffEdge;
        else if (y === T - 1) col = C.cliffFaceDark;
        else if (H(gx, gy, 22) < 0.1) col = C.cliffFaceDark;
      } else {
        col = C.cliffTop[Math.floor(H(gx >> 1, gy >> 1, 23) * 2.2 + H(gx, gy, 24) * 0.8) % 3];
        if (H(gx, gy, 25) < 0.05) col = C.cliffLight;
        if (!n && y === 0) col = C.cliffEdge;
        else if (!n && y === 1) col = C.cliffLight;
        if (!w && x === 0) col = C.cliffEdge;
        if (!e && x === T - 1) col = C.cliffEdge;
      }
      P.set(ox + x, oy + y, col);
    }
  }

  /** Water with shore, foam and a few waves; frame 1 moves the waves. */
  function water(P, C, ox, oy, tx, ty, at, frame) {
    const same = (dx, dy) => { const k = at(tx + dx, ty + dy); return k === 'water' || k === 'void' || k === 'bridge' || k === 'rapids'; };
    const n = same(0, -1), s = same(0, 1), w = same(-1, 0), e = same(1, 0);
    grass(P, C, ox, oy, tx, ty);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      if (!n && !w && x + y < 3) continue;
      if (!n && !e && (T - 1 - x) + y < 3) continue;
      if (!s && !w && x + (T - 1 - y) < 3) continue;
      if (!s && !e && (T - 1 - x) + (T - 1 - y) < 3) continue;
      const d = edgeDist(x, y, same);
      const gx = tx * T + x + frame * 2, gy = ty * T + y;
      const r = H(gx, gy, 31);
      let col;
      if (d < 1) col = C.shore;
      else if (d < 2) col = C.foam;
      else if (d < 4) col = C.liqLight;
      else if (d < 6) col = r < 0.5 ? C.liq : C.liqLight;
      else col = d < 8 && r < 0.5 ? C.liq : C.liqDeep;
      if (d >= 6 && d < 99 && r < 0.08) col = C.liq;
      if (d >= 3 && H(gx >> 2, gy, 33) < 0.06 && (gx & 3) !== 3) col = C.liqLight;
      if (d >= 3 && H(gx, gy, 34 + frame) < 0.006) col = C.foam;
      P.set(ox + x, oy + y, col);
    }
  }

  /** A wooden bridge over water (Route 12's Silence Bridge): planks across it, rails on its open sides. */
  function bridge(P, C, ox, oy, tx, ty, at, frame) {
    water(P, C, ox, oy, tx, ty, at, frame);
    const B = (dx, dy) => at(tx + dx, ty + dy) === 'bridge';
    const vertical = B(0, -1) || B(0, 1) || !(B(-1, 0) || B(1, 0));
    const [mid, lite, dark] = C.wood, edge = C.woodEdge;
    const railA = vertical ? !B(-1, 0) : !B(0, -1), railB = vertical ? !B(1, 0) : !B(0, 1);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const a = vertical ? y : x, b = vertical ? x : y;
      let col = (a & 3) === 3 ? dark : (a & 3) === 0 ? lite : mid;
      if ((railA && b < 2) || (railB && b > T - 3)) col = (b === 0 || b === T - 1) ? edge : dark;
      P.set(ox + x, oy + y, col);
    }
  }

  /** Wooden fence: posts, with rails towards the fences next to it. */
  function fence(P, C, ox, oy, tx, ty, at) {
    grass(P, C, ox, oy, tx, ty);
    const F = (dx, dy) => at(tx + dx, ty + dy) === 'fence';
    const [mid, lite, dark] = C.wood, edge = C.woodEdge;
    const rail = (x0, x1, y) => {
      for (let x = x0; x <= x1; x++) { P.set(ox + x, oy + y - 1, edge); P.set(ox + x, oy + y, lite); P.set(ox + x, oy + y + 1, mid); P.set(ox + x, oy + y + 2, edge); }
    };
    const l = F(-1, 0), r = F(1, 0), u = F(0, -1), d = F(0, 1);
    if (l || (!r && !u && !d)) { rail(0, 7, 5); rail(0, 7, 10); }
    if (r || (!l && !u && !d)) { rail(8, 15, 5); rail(8, 15, 10); }
    if (u || d) {
      for (let y = u ? 0 : 3; y <= (d ? 15 : 14); y++) { P.set(ox + 6, oy + y, edge); P.set(ox + 7, oy + y, lite); P.set(ox + 8, oy + y, mid); P.set(ox + 9, oy + y, edge); }
    }
    // The post itself.
    for (let y = 2; y <= 14; y++) for (let x = 5; x <= 10; x++) {
      const c = x === 5 || x === 10 || y === 2 ? edge : y === 14 ? dark : x <= 6 ? lite : x >= 9 ? dark : mid;
      P.set(ox + x, oy + y, c);
    }
    P.set(ox + 5, oy + 2, 0); P.set(ox + 10, oy + 2, 0);
    for (let x = 6; x <= 9; x++) P.set(ox + x, oy + 3, lite);
    P.set(ox + 4, oy + 15, C.speck); P.set(ox + 11, oy + 15, C.speck);
  }

  const SIGN = [
    '..oooooooooooo..',
    '.ollllllllllllo.',
    '.olmmmmmmmmmmdo.',
    '.olm.dd.ddd.mdo.',
    '.olmmmmmmmmmmdo.',
    '.olm.ddd.dd.mdo.',
    '.olmmmmmmmmmmdo.',
    '.oddddddddddddo.',
    '..oooooooooooo..',
    '......oldo......',
    '......oldo......',
    '......oldo......',
    '......oldo......',
    '.....ooddoo.....'
  ];
  function sign(P, C, ox, oy, tx, ty) {
    grass(P, C, ox, oy, tx, ty);
    const [mid, lite, dark] = C.wood;
    ascii(P, ox, oy + 1, SIGN, { o: C.woodEdge, l: lite, m: mid, d: dark, '.': null });
  }

  /** Ledge: a grassy drop you can only jump down (or sideways for < and >). */
  function ledge(P, C, ox, oy, tx, ty, at, dir) {
    grass(P, C, ox, oy, tx, ty);
    const k = at(tx, ty);
    const [lip, face, dark] = C.ledge;
    if (dir === 'down') {
      const l = at(tx - 1, ty) === k, r = at(tx + 1, ty) === k;
      for (let x = 0; x < T; x++) {
        if ((!l && x < 2) || (!r && x > 13)) continue;
        const wav = H(tx * T + x, ty, 41) < 0.3 ? 1 : 0;
        P.set(ox + x, oy + 8 + wav, C.light);
        P.set(ox + x, oy + 9 + wav, lip);
        for (let y = 10 + wav; y <= 12; y++) P.set(ox + x, oy + y, face);
        P.set(ox + x, oy + 13, dark);
        if (x % 4 === 1) P.set(ox + x, oy + 11, dark);
        P.set(ox + x, oy + 14, C.speck);
      }
      if (!l) for (let y = 9; y <= 13; y++) P.set(ox + 2, oy + y, dark);
      if (!r) for (let y = 9; y <= 13; y++) P.set(ox + 13, oy + y, dark);
    } else {
      const u = at(tx, ty - 1) === k, d = at(tx, ty + 1) === k;
      const right = dir === 'right';
      for (let y = 0; y < T; y++) {
        if ((!u && y < 2) || (!d && y > 13)) continue;
        const b = right ? 9 : 6, s = right ? 1 : -1;
        P.set(ox + b - s, oy + y, C.light);
        P.set(ox + b, oy + y, lip);
        P.set(ox + b + s, oy + y, face);
        P.set(ox + b + 2 * s, oy + y, face);
        P.set(ox + b + 3 * s, oy + y, dark);
        P.set(ox + b + 4 * s, oy + y, C.speck);
      }
    }
  }

  // ---------------- indoor painters ----------------

  function floor(P, C, ox, oy, tx, ty, kind) {
    if (kind === 'wood') {
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
        const row = (ty * T + y) >> 2, seam = (x + tx * T + (row % 2) * 7) % 16 === 0;
        let col = C.wood[(row + Math.floor(H(tx * 4 + ((x + (row % 2) * 7) >> 4), row, 51) * 3)) % 3];
        if ((y & 3) === 3) col = C.woodLine;
        else if (seam) col = C.woodLine;
        P.set(ox + x, oy + y, col);
      }
    } else {
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
        let col = C.tile[((x >> 3) + (y >> 3)) & 1];
        if (x === 0 || y === 0) col = C.grout;
        P.set(ox + x, oy + y, col);
      }
    }
  }

  // Tiles that are part of a wall (a poster, lift doors): the wall above them has no face.
  const WALLISH = new Set(['wall', 'void', 'secret', 'poster', 'lift']);
  function wall(P, C, ox, oy, tx, ty, at) {
    const below = at(tx, ty + 1);
    const face = !WALLISH.has(below);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      let col;
      if (!face) col = C.wallTop[(H(tx * T + x, ty * T + y, 61) < 0.15) ? 1 : 0];
      else if (y >= 13) col = y === 13 ? C.trim : C.base;
      else if (y === 0) col = C.trim;
      else col = C.paper[((tx * T + x) >> 2) & 1];
      P.set(ox + x, oy + y, col);
    }
    if (!face && below === 'void') for (let x = 0; x < T; x++) P.set(ox + x, oy + T - 1, C.base);
  }

  // Furniture standing on a rug keeps the rug under it.
  const FURN = new Set(['shelf', 'table', 'plant', 'pc', 'healer']);
  const rugCount = (at, x, y) => [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([a, b]) => at(x + a, y + b) === 'rug').length;
  const isRug = (at, x, y) => at(x, y) === 'rug' || (FURN.has(at(x, y)) && rugCount(at, x, y) >= 2);

  function rug(P, C, ox, oy, tx, ty, at) {
    const same = (dx, dy) => isRug(at, tx + dx, ty + dy);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const d = edgeDist(x, y, same);
      let col = d < 1 ? C.rug[2] : d < 3 ? C.rug[1] : C.rug[0];
      if (d >= 3 && ((x + y + tx + ty) & 7) === 0) col = C.rug[1];
      P.set(ox + x, oy + y, col);
    }
  }

  function counter(P, C, ox, oy, tx, ty, at) {
    const l = at(tx - 1, ty) === 'counter', r = at(tx + 1, ty) === 'counter';
    const u = at(tx, ty - 1) === 'counter', d = at(tx, ty + 1) === 'counter';
    const [top, face, edge] = C.counter;
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      if ((!l && x === 0) || (!r && x === T - 1)) { P.set(ox + x, oy + y, edge); continue; }
      let col = (d || y < 10) ? top : face;
      if (!u && y === 0) col = edge;
      if (!d && (y === 9 || y === T - 1)) col = edge;
      if (col === top && (x + y) % 9 === 0) col = face;
      P.set(ox + x, oy + y, col);
    }
  }

  const SHELF = [
    'oooooooooooooooo',
    'owwwwwwwwwwwwwwo',
    'owrrbbggyyrrbbwo',
    'owrrbbggyyrrbbwo',
    'owrrbbggyyrrbbwo',
    'owddddddddddddwo',
    'owggyyrrbbggyywo',
    'owggyyrrbbggyywo',
    'owggyyrrbbggyywo',
    'owddddddddddddwo',
    'owbbrrggyybbrrwo',
    'owbbrrggyybbrrwo',
    'owbbrrggyybbrrwo',
    'owddddddddddddwo',
    'owwwwwwwwwwwwwwo',
    'oooooooooooooooo'
  ];
  const BOOKS = { r: '#c84848', b: '#4870c8', g: '#48a058', y: '#e8c048' };

  const TABLE = [
    '................',
    '.oooooooooooooo.',
    'olllllllllllllll',
    'olmmmmmmmmmmmmml',
    'olmmmmmmmmmmmmml',
    'olmmmmmmmmmmmmml',
    'olmmmmmmmmmmmmml',
    'olmmmmmmmmmmmmml',
    'oddddddddddddddo',
    'oddddddddddddddo',
    '.oooooooooooooo.',
    '..od........do..',
    '..od........do..',
    '..od........do..',
    '..oo........oo..',
    '................'
  ];
  const PLANT = [
    '.....o..o.......',
    '....olo.olo.....',
    '..ooglgoolgoo...',
    '.olggllgglggo...',
    '.oglgggglgglo...',
    '..oggolglggo....',
    '.olglgggggglo...',
    '..ogggoggggo....',
    '...oooggoooo....',
    '....oppppppo....',
    '...oPPPPPPPPo...',
    '...oppppppppo...',
    '...oppppppppo...',
    '....oppppppo....',
    '.....oooooo.....',
    '................'
  ];
  const PC = [
    '................',
    '..oooooooooooo..',
    '..owwwwwwwwwwo..',
    '..owsssssssswo..',
    '..owsSsssssswo..',
    '..owsssssssswo..',
    '..owsssssssswo..',
    '..owwwwwwwwwwo..',
    '..oooooooooooo..',
    '.ooggggggggggoo.',
    'oggwgwgwgwgwggo.',
    'ogggggggggggggo.',
    'oddddddddddddddo',
    'oddddddddddddddo',
    'oooooooooooooooo',
    '................'
  ];
  const HEALER = [
    'oooooooooooooooo',
    'owwwwwwwwwwwwwwo',
    'owocco.occo.ccow',
    'owocco.occo.ccow',
    'owwwwwwwwwwwwwwo',
    'owocco.occo.ccow',
    'owocco.occo.ccow',
    'owwwwwwwwwwwwwwo',
    'oggggggggggggggo',
    'ogsssssssssssggo',
    'ogsssssssssssggo',
    'oggggggggggggggo',
    'oddddddddddddddo',
    'oddddddddddddddo',
    'oooooooooooooooo',
    '................'
  ];
  // Caves: a wooden ladder, and a cave mouth (a dark opening in the rock).
  const LADDER = [
    '................',
    '...o........o...',
    '...ol......ol...',
    '...oooooooooo...',
    '...oddddddddo...',
    '...ol......ol...',
    '...oooooooooo...',
    '...oddddddddo...',
    '...ol......ol...',
    '...oooooooooo...',
    '...oddddddddo...',
    '...ol......ol...',
    '...oooooooooo...',
    '...oddddddddo...',
    '...ol......ol...',
    '...o........o...'
  ];
  const HOLE = [
    '................',
    '.....rrrrrr.....',
    '...rrkkkkkkrr...',
    '..rkkkkkkkkkkr..',
    '.rkkkkkkkkkkkkr.',
    '.rkkkkkkkkkkkkr.',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rrkkkkkkkkkkkkrr'
  ];
  const CAN = [
    '................',
    '....oooooooo....',
    '...oLLLLLLLLo...',
    '...oLwwwwwwLo...',
    '...oLLLLLLLLo...',
    '....oggggggo....',
    '....ogGggggo....',
    '....ogGggdgo....',
    '....ogGggdgo....',
    '....ogGggdgo....',
    '....ogGggdgo....',
    '....ogGggdgo....',
    '....ogGggdgo....',
    '....oddddddo....',
    '.....oooooo.....',
    '................'
  ];
  const GRAVE = [
    '................',
    '................',
    '.....oooooo.....',
    '....oLLLLLLo....',
    '...oLwwLLLLgo...',
    '...oLwLLLLLgo...',
    '...oLLdLLdLgo...',
    '...oLLLddLLgo...',
    '...oLLdLLdLgo...',
    '...oLLLLLLLgo...',
    '...oLLLLLLLgo...',
    '...oggggggggo...',
    '..oddddddddddo..',
    '..oddddddddddo..',
    '...oooooooooo...',
    '................'
  ];
  /** A gravestone (the Pokémon Tower). */
  function grave(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, GRAVE, { o: pack('#2a2630'), L: pack('#a8a4b0'), w: pack('#d4d0dc'), g: pack('#86828e'), d: pack('#6a6672') });
  }
  const HEDGE = [
    '................',
    '....oooooooo....',
    '..ooLLLlLLLLoo..',
    '.oLLlLLLLLlLLLo.',
    '.oLLLLLlLLLLLLo.',
    'oLlLLLLLLLLlLLLo',
    'oLLLLlLLLLLLLLgo',
    'oLLLLLLLLlLLLLgo',
    'oLlLLLLLLLLLLggo',
    'oLLLLLLlLLLLLLgo',
    '.oLLLLLLLLLLLgo.',
    '.ogLLLLLLLLLggo.',
    '..ogggLLLggggo..',
    '...oooggggooo...',
    '.....oooooo.....',
    '................'
  ];
  /** A trimmed hedge (Erika's greenhouse Gym). */
  function hedge(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, HEDGE, { o: pack('#1e3a1e'), L: pack('#4c9a44'), l: pack('#7cc46c'), g: pack('#357030') });
  }

  /** A metal trash can (Lt. Surge's Gym). */
  // Rubble: charred beams and stones (the Burned Tower).
  const RUBBLE = [
    '................',
    '................',
    '..........oo....',
    '.........oLLo...',
    '...ooo..oLwLo...',
    '..oLLLo.oLLgo...',
    '..oLwLLooggo....',
    '.oLLLLggbbbbbo..',
    '.oLLLgobBBBBBbo.',
    '..ogggobbbbbbbo.',
    '.oooooobbbbbbo..',
    'oLLLLgoooooooo..',
    'oLwLLLgo.ooo....',
    '.oggggo.oLLgo...',
    '..oooo..oggo....',
    '.........oo.....'
  ];
  function rubble(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, RUBBLE, { o: pack('#1c1612'), L: pack('#7a7068'), w: pack('#9a9088'), g: pack('#4e463e'), b: pack('#3a2a20'), B: pack('#5a4232') });
  }

  // Ice: pale blue, with streaks of light (Pryce's Gym).
  const ICE = [
    'aaaaaaaaaaaaaaab',
    'aaaawaaaaaaaaaab',
    'aaawaaaaaaaaaaab',
    'aawaaaaaaaaaaaab',
    'awaaaaaaaaawaaab',
    'aaaaaaaaaawaaaab',
    'aaaaaaaaawaaaaab',
    'aaaaaaaaaaaaaaab',
    'aaaaaaaaaaaaaaab',
    'aaaaawaaaaaaaaab',
    'aaaawaaaaaaaaaab',
    'aaawaaaaaaawaaab',
    'aaaaaaaaaawaaaab',
    'aaaaaaaaaaaaaaab',
    'aaaaaaaaaaaaaaab',
    'bbbbbbbbbbbbbbbb'
  ];
  function ice(P, C, ox, oy) {
    ascii(P, ox, oy, ICE, { a: pack('#c6e8f8'), w: pack('#f4fcff'), b: pack('#a8d4ec') });
  }

  function can(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, CAN, { o: pack('#202830'), L: pack('#a8b4c0'), w: pack('#d8e0e8'), g: pack('#8894a0'), G: pack('#b8c4d0'), d: pack('#5c6874') });
  }

  function ladder(P, C, ox, oy, tx, ty) {
    grass(P, C, ox, oy, tx, ty);
    ascii(P, ox, oy, LADDER, { o: C.woodEdge, l: C.wood[1], d: C.wood[2] });
  }
  function hole(P, C, ox, oy, tx, ty, at) {
    cliff(P, C, ox, oy, tx, ty, (x, y) => (x === tx && y === ty ? 'cliff' : at(x, y)));
    ascii(P, ox, oy, HOLE, { r: C.cliffEdge, k: C.black });
  }

  const STAIRS = [
    'oooooooooooooooo',
    'ollllllllllllllo',
    'ommmmmmmmmmmmmmo',
    'oddddddddddddddo',
    'ollllllllllllllo',
    'ommmmmmmmmmmmmmo',
    'oddddddddddddddo',
    'ollllllllllllllo',
    'ommmmmmmmmmmmmmo',
    'oddddddddddddddo',
    'ollllllllllllllo',
    'ommmmmmmmmmmmmmo',
    'oddddddddddddddo',
    'ollllllllllllllo',
    'ommmmmmmmmmmmmmo',
    'oooooooooooooooo'
  ];

  // ---------------- chapter 5: the Game Corner, the Rocket Hideout, Koga's Gym ----------------

  const POSTER = [
    '................',
    '...oooooooooo...',
    '...oRRRRRRRRo...',
    '...oRRwwwwRRo...',
    '...oRRwRRwwRo...',
    '...oRRwRRwwRo...',
    '...oRRwwwwRRo...',
    '...oRRwRwRRRo...',
    '...oRRwRRwRRo...',
    '...oRRwRRRwRo...',
    '...oRRRRRRRRo...',
    '...oddddddddo...',
    '...oooooooooo...',
    '................',
    '................',
    '................'
  ];
  /** A poster on the wall (in the Game Corner one hides a switch). */
  function poster(P, C, ox, oy, tx, ty, at) {
    wall(P, C, ox, oy, tx, ty, at);
    ascii(P, ox, oy, POSTER, { o: pack('#201820'), R: pack('#d83838'), w: pack('#f8f0f0'), d: pack('#9a2626') });
  }

  const SLOTS = [
    '...oooooooooo...',
    '..oyYYYYYYYYyo..',
    '..oYoooooooYo...',
    '..oYowowowoYo...',
    '..oYorocowoYo...',
    '..oYowowowoYo...',
    '..oYoooooooYo...',
    '..oyYYYYYYYYyo..',
    '..oggggggggggo..',
    '..ogGGGGGGGGgo..',
    '..ogGllllllGgo..',
    '..ogGGGGGGGGgo..',
    '..oggggggggggo..',
    '..oddddddddddo..',
    '...oooooooooo...',
    '................'
  ];
  /** A slot machine (the Game Corner). */
  function slots(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, SLOTS, { o: pack('#201820'), y: pack('#c89a20'), Y: pack('#f0c838'), w: pack('#f8f8f8'), r: pack('#e04040'),
                              c: pack('#4070e0'), g: pack('#5a5a6a'), G: pack('#7a7a8a'), l: pack('#f8e070'), d: pack('#3a3a46') });
  }

  const LIFT = [
    'tttttttttttttttt',
    'ppoooooooooooopp',
    'ppoMMMMMMMMMMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'ppoMmmmmommmMopp',
    'tttMddddoddddMtt',
    'bbbMddddoddddMbb',
    'bbbbbbbbbbbbbbbb'
  ];
  /** Lift doors in a wall (the Rocket Hideout). */
  function lift(P, C, ox, oy, tx, ty, at) {
    wall(P, C, ox, oy, tx, ty, at);
    ascii(P, ox, oy, LIFT, { o: pack('#20242c'), M: pack('#5a6070'), m: pack('#a8b0bc'), d: pack('#7a8290'), t: C.trim, b: C.base });
  }

  // A spin tile: an arrow on a metal plate, drawn pointing up and turned for the other directions.
  const ARROW = [
    '................',
    '.oooooooooooooo.',
    '.oggggggggggggo.',
    '.ogggggYYgggggo.',
    '.oggggYYYYggggo.',
    '.ogggYYYYYYgggo.',
    '.oggYYYYYYYYggo.',
    '.ogYYYYYYYYYYgo.',
    '.ogggggYYgggggo.',
    '.ogggggYYgggggo.',
    '.ogggggYYgggggo.',
    '.ogggggYYgggggo.',
    '.ogggggYYgggggo.',
    '.oggggggggggggo.',
    '.oooooooooooooo.',
    '................'
  ];
  const turn = rows => rows[0].split('').map((_, x) => rows.map(r => r[x]).reverse().join(''));   // 90° clockwise
  const ARROWS = { up: ARROW };
  ARROWS.right = turn(ARROWS.up); ARROWS.down = turn(ARROWS.right); ARROWS.left = turn(ARROWS.down);
  function spin(P, C, ox, oy, tx, ty, dir) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, ARROWS[dir], { o: pack('#20242c'), g: pack('#5a6272'), Y: pack('#f0d040') });
  }
  const STOP = [
    '................',
    '.....oooooo.....',
    '...ooRRRRRRoo...',
    '..oRRrrrrrrRRo..',
    '..oRrrrrrrrrRo..',
    '.oRrrwwwwwwrrRo.',
    '.oRrrwRRRRwrrRo.',
    '.oRrrwRRRRwrrRo.',
    '.oRrrwRRRRwrrRo.',
    '.oRrrwRRRRwrrRo.',
    '.oRrrwwwwwwrrRo.',
    '..oRrrrrrrrrRo..',
    '..oRRrrrrrrRRo..',
    '...ooRRRRRRoo...',
    '.....oooooo.....',
    '................'
  ];
  const PAD = [
    '................',
    '..oooooooooooo..',
    '.obbbbbbbbbbbbo.',
    '.obccccccccccbo.',
    '.obcwwwwwwwwcbo.',
    '.obcwccccccwcbo.',
    '.obcwcwwwwcwcbo.',
    '.obcwcwccwcwcbo.',
    '.obcwcwccwcwcbo.',
    '.obcwcwwwwcwcbo.',
    '.obcwccccccwcbo.',
    '.obcwwwwwwwwcbo.',
    '.obccccccccccbo.',
    '.obbbbbbbbbbbbo.',
    '..oooooooooooo..',
    '................'
  ];
  /** A teleport pad (Silph Co., Sabrina's Gym): step on it to be sent elsewhere. */
  function pad(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, PAD, { o: pack('#202430'), b: pack('#4a5068'), c: pack('#6a78a8'), w: pack('#a8e0f8') });
  }

  // ---------------- chapter 7: the Seafoam Islands, the Pokémon Mansion, Blaine's Gym ----------------

  const PIT = [
    '................',
    '................',
    '....rrrrrrrr....',
    '..rrkkkkkkkkrr..',
    '.rkkkkkkkkkkkkr.',
    '.rkkkkkkkkkkkkr.',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    'rkkkkkkkkkkkkkkr',
    '.rkkkkkkkkkkkkr.',
    '.rkkkkkkkkkkkkr.',
    '..rrkkkkkkkkrr..',
    '....llllllll....',
    '................',
    '................'
  ];
  /** A hole in the floor: you fall to the floor below (a boulder fills it: a prop in render.js). */
  function pit(P, C, ox, oy, tx, ty) {
    if (C.floor) floor(P, C, ox, oy, tx, ty, C.floor);
    else grass(P, C, ox, oy, tx, ty);
    ascii(P, ox, oy, PIT, { r: C.floor ? C.base : C.cliffEdge, k: C.black, l: C.floor ? C.trim : C.light });
  }
  // A floor switch (Victory Road): a round stone plate with a groove.
  const PLATE = [
    '................',
    '................',
    '.....oooooo.....',
    '...ooLLLLLLoo...',
    '..oLLwwwwwwLLo..',
    '..oLwLLLLLLgLo..',
    '.oLwLLoooooLgLo.',
    '.oLwLoggggoLgLo.',
    '.oLwLoggggoLgLo.',
    '.oLwLLoooooLgLo.',
    '..oLLggggggLLo..',
    '..oLLLLLLLLLLo..',
    '...ooLLLLLLoo...',
    '.....oooooo.....',
    '................',
    '................'
  ];
  function plate(P, C, ox, oy, tx, ty) {
    grass(P, C, ox, oy, tx, ty);
    const S = C.src;
    ascii(P, ox, oy, PLATE, { o: pack('#1e1a18'), L: pack(S.cliffTop[0]), w: pack(S.cliffLight), g: pack(S.cliffFaceDark) });
  }
  const STATUE = [
    '.....oooooo.....',
    '....oLLLLLLo....',
    '...oLwLLLLLgo...',
    '...oLLoLLoLgo...',
    '...oLLLLLLLgo...',
    '....oLLggLgo....',
    '.....oLLLgo.....',
    '....oLLLLLgo....',
    '...oLLLLLLLgo...',
    '...oggggggggo...',
    '..oddddddddddo..',
    '..odDDDDDDDDdo..',
    '..odDDDDDDDDdo..',
    '..oddddddddddo..',
    '...oooooooooo...',
    '................'
  ];
  /** A statue on a pedestal (the Pokémon Mansion: some hide a switch). */
  function statue(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, STATUE, { o: pack('#22201e'), L: pack('#b4aca2'), w: pack('#e0dad2'), g: pack('#8a8278'), d: pack('#6a5a4a'), D: pack('#8a7864') });
  }
  const QUIZ = [
    '..oooooooooooo..',
    '.oMMMMMMMMMMMMo.',
    '.oMooooooooooMo.',
    '.oMossYYYsssoMo.',
    '.oMosYsssYssoMo.',
    '.oMosssssYssoMo.',
    '.oMossssYsssoMo.',
    '.oMosssYssssoMo.',
    '.oMossssssssoMo.',
    '.oMosssYssssoMo.',
    '.oMooooooooooMo.',
    '.oMMMMMMMMMMMMo.',
    '.oddrrddggddddo.',
    '.oddddddddddddo.',
    '..oooooooooooo..',
    '................'
  ];
  /** A quiz machine (Blaine's Gym): a screen with a question mark. */
  function quiz(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, QUIZ, { o: pack('#1c1c22'), M: pack('#8a8e9a'), s: pack('#2a5aa8'), Y: pack('#f8e070'), d: pack('#5a5e6a'), r: pack('#e04848'), g: pack('#48c060') });
  }

  /** The tile a spin stops on. */
  function stop(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    ascii(P, ox, oy, STOP, { o: pack('#20242c'), R: pack('#a82c2c'), r: pack('#d84a4a'), w: pack('#f0e0e0') });
  }

  function furniture(P, C, ox, oy, tx, ty, kind, at) {
    if (isRug(at, tx, ty)) rug(P, C, ox, oy, tx, ty, at);
    else floor(P, C, ox, oy, tx, ty, C.floor);
    const o = C.black;
    if (kind === 'shelf') ascii(P, ox, oy, SHELF, { o, w: C.wood[2], d: C.woodLine, r: pack(BOOKS.r), b: pack(BOOKS.b), g: pack(BOOKS.g), y: pack(BOOKS.y) });
    else if (kind === 'table') {
      const rows = TABLE.map(r => r);
      if (at(tx - 1, ty) === 'table') for (let i = 0; i < rows.length; i++) rows[i] = rows[i][2] + rows[i][2] + rows[i].slice(2);
      if (at(tx + 1, ty) === 'table') for (let i = 0; i < rows.length; i++) rows[i] = rows[i].slice(0, 14) + rows[i][13] + rows[i][13];
      ascii(P, ox, oy, rows, { o, l: C.wood[2], m: C.wood[0], d: C.woodLine });
    } else if (kind === 'plant') ascii(P, ox, oy, PLANT, { o: pack('#1c3a1c'), g: pack('#3c9c44'), l: pack('#7cd070'), p: pack('#c06a3c'), P: pack('#e08c54') });
    else if (kind === 'pc') ascii(P, ox, oy, PC, { o, w: pack('#d8dce4'), s: C.screen, S: C.white, g: pack('#b0b6c4'), d: pack('#8a90a0') });
    else if (kind === 'healer') ascii(P, ox, oy, HEALER, { o, w: pack('#e8e8f0'), c: pack('#a8acb8'), g: pack('#c8ccd8'), s: pack('#68d0f8'), d: pack('#9098a8') });
  }

  function mat(P, C, ox, oy, tx, ty) {
    floor(P, C, ox, oy, tx, ty, C.floor);
    for (let y = 2; y < 14; y++) for (let x = 1; x < 15; x++) {
      const edge = y === 2 || y === 13 || x === 1 || x === 14;
      P.set(ox + x, oy + y, edge ? C.mat[0] : ((x + y) & 1 ? C.mat[1] : C.mat[0]));
    }
  }

  function stairs(P, C, ox, oy) {
    ascii(P, ox, oy, STAIRS, { o: C.black, l: C.wood[2], m: C.wood[0], d: C.woodLine });
  }

  // ---------------- props (Y-sorted sprites) ----------------

  const sprites = {};
  function sprite(name, palette = OUT) {
    const k = name + '/' + palette;
    if (!sprites[k]) sprites[k] = PROPS[name](colors(palette));
    return sprites[k];
  }

  /** The round tree, 16×28; `lift` lightens its leaves by that many shades (a Headbutt tree). */
  function roundTree(C, lift) {
    const P = Pix(T, 28);
    const L = C.leaf, Tr = C.trunk;
    for (let y = 19; y < 27; y++) for (let x = 6; x < 10; x++) P.set(x, y, Tr[x === 6 ? 0 : 1]);
    P.set(5, 26, Tr[0]); P.set(10, 26, Tr[0]);
    const blobs = [[7.5, 9, 6.6], [4.4, 13.5, 4], [10.6, 13.5, 4], [7.5, 15.5, 4.6], [7.5, 5.5, 4.5]];
    for (const [bx, by, br] of blobs) {
      disc(P, bx, by, br, (x, y) => {
        if (x < 1 || x > 14 || y < 1) return null;
        const lit = ((x - 7.5) * -0.55 + (y - 9) * -0.85) / 7;
        const idx = Math.min(3, (lit > 0.42 ? 3 : lit > 0.02 ? 2 : lit > -0.5 ? 1 : 0) + lift);
        return (H(x, y, 41) < 0.1 && idx > 0) ? L[idx - 1] : L[idx];
      });
    }
    outline(P, C.treeEdge);
    return P.canvas();
  }

  const PROPS = {
    /** A round tree: 16×28, the canopy reaches 12 px into the tile above. */
    tree(C) { return roundTree(C, 0); },
    /** A tree Headbutt can shake (Johto): the same tree, lighter leaves. */
    htree(C) { return roundTree(C, 1); },
    /** A berry tree: a low round bush hung with berries, 16×20. */
    btree(C) {
      const P = Pix(T, 20);
      const L = C.leaf, Tr = C.trunk;
      for (let y = 15; y < 19; y++) for (let x = 7; x < 9; x++) P.set(x, y, Tr[x === 7 ? 0 : 1]);
      for (const [bx, by, br] of [[7.5, 9, 6.4], [4.4, 11.5, 3.8], [10.6, 11.5, 3.8]]) {
        disc(P, bx, by, br, (x, y) => {
          if (x < 1 || x > 14 || y < 1) return null;
          const lit = ((x - 7.5) * -0.55 + (y - 9) * -0.85) / 6;
          return L[lit > 0.42 ? 3 : lit > 0.02 ? 2 : lit > -0.5 ? 1 : 0];
        });
      }
      outline(P, C.treeEdge);
      const red = pack('#d83a48'), shine = pack('#ff8a90'), blue = pack('#3a6ad8'), bshine = pack('#8ab0ff');
      for (const [x, y, c] of [[4, 8, 0], [10, 6, 1], [7, 12, 0], [12, 11, 1], [3, 13, 1], [8, 4, 0]]) {
        P.set(x, y, c ? blue : red); P.set(x + 1, y, c ? blue : red); P.set(x, y + 1, c ? blue : red); P.set(x + 1, y + 1, c ? blue : red);
        P.set(x, y, c ? bshine : shine);
      }
      return P.canvas();
    },
    /** The front of the tall grass: the bottom row of tufts, drawn over feet. */
    tuft(C) {
      const P = Pix(T, 8);
      const cols = { 1: C.tallEdge, 2: C.tall[1], 3: C.tall[2] };
      for (let i = 0; i < 2; i++) ascii(P, i * 8, 0, TUFT, cols);
      return P.canvas();
    },
    /** A small tree that Cut clears: 16×18, round and low. */
    shrub(C) {
      const P = Pix(T, 18);
      const L = C.leaf, Tr = C.trunk;
      for (let y = 13; y < 17; y++) for (let x = 7; x < 9; x++) P.set(x, y, Tr[x === 7 ? 0 : 1]);
      for (const [bx, by, br] of [[7.5, 8, 6], [4.6, 10.5, 3.6], [10.4, 10.5, 3.6]]) {
        disc(P, bx, by, br, (x, y) => {
          if (x < 1 || x > 14 || y < 1) return null;
          const lit = ((x - 7.5) * -0.55 + (y - 8) * -0.85) / 6;
          const idx = lit > 0.42 ? 3 : lit > 0.02 ? 2 : lit > -0.5 ? 1 : 0;
          return L[idx];
        });
      }
      outline(P, C.treeEdge);
      return P.canvas();
    },
    /** Stairs that open behind a poster (the Game Corner): drawn over the wall once open. */
    passage(C) {
      const P = Pix(T, T);
      P.rect(0, 0, T, T, C.black);
      for (let x = 0; x < T; x++) { P.set(x, 0, C.trim); P.set(x, 1, C.trim); }
      for (let y = 0; y < T; y++) { P.set(0, y, C.trim); P.set(1, y, C.trim); P.set(T - 1, y, C.trim); P.set(T - 2, y, C.trim); }
      // Three steps going down into the dark.
      for (const [y, col] of [[13, C.tile[0]], [10, C.tile[1]], [7, C.grout]]) for (let x = 2; x < T - 2; x++) { P.set(x, y, col); P.set(x, y + 1, col); }
      return P.canvas();
    },
    /** A door that opens with the Card Key (Silph Co.): metal, with a card slot. */
    keydoor() {
      const P = Pix(T, T);
      const o = pack('#202430'), m = pack('#8a94a8'), l = pack('#b4bccc'), d = pack('#5a6478'), r = pack('#e05050'), g = pack('#303848');
      P.rect(0, 0, T, T, o);
      P.rect(1, 1, T - 2, T - 2, d);
      P.rect(2, 2, 5, 12, m); P.rect(9, 2, 5, 12, m);
      P.rect(2, 2, 5, 1, l); P.rect(9, 2, 5, 1, l);
      P.rect(7, 2, 2, 12, g);
      P.rect(11, 7, 2, 3, r);
      return P.canvas();
    },
    /** A boulder Strength can push: 16×17, a round rock. */
    boulder(C) {
      const P = Pix(T, 17);
      const S = C.src, rock = C.floor ? ['#5e5650', '#7a726a', '#9a928a', '#bab2a8'] : [S.cliffFaceDark, S.cliffFace[0], S.cliffTop[0], S.cliffLight];
      const cols = rock.map(c => pack(c));
      disc(P, 7.5, 9, 7.2, (x, y) => {
        const lit = ((x - 7.5) * -0.5 + (y - 9) * -0.85) / 7;
        return cols[lit > 0.45 ? 3 : lit > 0.05 ? 2 : lit > -0.45 ? 1 : 0];
      });
      for (const [x, y] of [[5, 11], [6, 12], [10, 7], [11, 8], [9, 13]]) P.set(x, y, cols[0]);
      outline(P, pack('#1e1a18'));
      return P.canvas();
    },
    /** A pit a boulder fell into: the top of the boulder, flush with the floor. */
    plug(C) {
      const P = Pix(T, T);
      const S = C.src, rock = C.floor ? ['#5e5650', '#7a726a', '#9a928a'] : [S.cliffFaceDark, S.cliffFace[0], S.cliffTop[0]];
      const cols = rock.map(c => pack(c));
      disc(P, 7.5, 7.5, 6.5, (x, y) => cols[((x + y) & 3) === 0 ? 0 : (x - 7.5) * -0.6 + (y - 7.5) * -0.8 > 1 ? 2 : 1]);
      outline(P, pack('#1e1a18'));
      return P.canvas();
    },
    /** A closed gate: iron bars across the tile (open: not drawn); in a cave, a pile of rocks. */
    bars(C) {
      const P = Pix(T, T);
      if (!C.floor) {
        const S = C.src, rock = [S.cliffFaceDark, S.cliffFace[0], S.cliffTop[0], S.cliffLight].map(c => pack(c));
        for (const [cx, cy, r] of [[4.5, 10, 4.2], [11, 10.5, 4.4], [7.8, 5, 4.3]]) {
          disc(P, cx, cy, r, (x, y) => {
            const lit = ((x - cx) * -0.5 + (y - cy) * -0.85) / r;
            return rock[lit > 0.45 ? 3 : lit > 0.05 ? 2 : lit > -0.45 ? 1 : 0];
          });
        }
        outline(P, pack('#1e1a18'));
        return P.canvas();
      }
      const o = pack('#1c1c22'), m = pack('#7a7e8a'), l = pack('#b0b4c0');
      for (let x = 0; x < T; x++) { P.set(x, 1, o); P.set(x, 2, l); P.set(x, 3, m); P.set(x, 4, o); P.set(x, 12, o); P.set(x, 13, m); P.set(x, 14, o); }
      for (const bx of [1, 5, 9, 13]) for (let y = 0; y < T; y++) { P.set(bx, y, o); P.set(bx + 1, y, y < 2 ? l : m); P.set(bx + 2, y, o); }
      return P.canvas();
    },
    /** An item on the ground: a Poké Ball. */
    ball() {
      const P = Pix(12, 12);
      const r = pack('#f04848'), rl = pack('#ff8c80'), w = pack('#f8f8f8'), g = pack('#c8c8d0'), o = pack('#202028');
      disc(P, 5.5, 5.5, 5, (x, y) => (y < 5 ? ((x < 5 && y < 3) ? rl : r) : y === 5 ? o : (x > 7 ? g : w)));
      P.set(5, 5, w); P.set(6, 5, w); P.set(5, 6, o); P.set(6, 6, o); P.set(5, 4, o); P.set(6, 4, o);
      outline(P, o);
      return P.canvas();
    }
  };

  // ---------------- baking ----------------

  function paintTile(P, C, ox, oy, tx, ty, kind, at, frame, m) {
    switch (kind) {
      case 'grass': case 'tree': case 'stamp': grass(P, C, ox, oy, tx, ty); break;
      case 'path': case 'door': ground(P, C, ox, oy, tx, ty, at, 'path'); break;
      case 'sand': ground(P, C, ox, oy, tx, ty, at, 'sand'); break;
      case 'tall': tall(P, C, ox, oy); break;
      case 'flowers': flowers(P, C, ox, oy, tx, ty, frame); break;
      case 'cliff': cliff(P, C, ox, oy, tx, ty, at); break;
      case 'water': water(P, C, ox, oy, tx, ty, at, frame); break;
      case 'bridge': bridge(P, C, ox, oy, tx, ty, at, frame); break;
      case 'fence': fence(P, C, ox, oy, tx, ty, at); break;
      case 'sign': sign(P, C, ox, oy, tx, ty); break;
      case 'ledge-down': ledge(P, C, ox, oy, tx, ty, at, 'down'); break;
      case 'ledge-left': ledge(P, C, ox, oy, tx, ty, at, 'left'); break;
      case 'ledge-right': ledge(P, C, ox, oy, tx, ty, at, 'right'); break;
      case 'wall': wall(P, C, ox, oy, tx, ty, at); break;
      case 'wood': case 'tile': floor(P, C, ox, oy, tx, ty, kind); break;
      case 'rug': rug(P, C, ox, oy, tx, ty, at); break;
      case 'counter': counter(P, C, ox, oy, tx, ty, at); break;
      case 'shelf': case 'table': case 'plant': case 'pc': case 'healer': furniture(P, C, ox, oy, tx, ty, kind, at); break;
      case 'mat': mat(P, C, ox, oy, tx, ty); break;
      case 'stairs': stairs(P, C, ox, oy); break;
      case 'ladder': ladder(P, C, ox, oy, tx, ty); break;
      case 'cuttree': grass(P, C, ox, oy, tx, ty); break;   // the tree itself is a prop (render.js)
      case 'headtree': grass(P, C, ox, oy, tx, ty); break;  // a tree to Headbutt: baked like the others
      case 'berrytree': grass(P, C, ox, oy, tx, ty); break; // a berry tree: baked as a prop
      case 'can': can(P, C, ox, oy, tx, ty); break;
      case 'rubble': rubble(P, C, ox, oy, tx, ty); break;
      case 'ice': ice(P, C, ox, oy); break;
      case 'grave': grave(P, C, ox, oy, tx, ty); break;
      case 'hedge': hedge(P, C, ox, oy, tx, ty); break;
      case 'hole': hole(P, C, ox, oy, tx, ty, at); break;
      case 'secret': case 'poster': poster(P, C, ox, oy, tx, ty, at); break;   // open stairs: a prop (render.js)
      case 'slots': slots(P, C, ox, oy, tx, ty); break;
      case 'lift': lift(P, C, ox, oy, tx, ty, at); break;
      case 'spin-up': case 'spin-down': case 'spin-left': case 'spin-right': spin(P, C, ox, oy, tx, ty, kind.slice(5)); break;
      case 'spin-stop': stop(P, C, ox, oy, tx, ty); break;
      case 'invisible': case 'keydoor': floor(P, C, ox, oy, tx, ty, C.floor); break;   // a closed key door: a prop (render.js)
      case 'pad': pad(P, C, ox, oy, tx, ty); break;
      case 'pit': pit(P, C, ox, oy, tx, ty); break;
      case 'abyss': P.rect(ox, oy, T, T, C.black); break;   // nothing to stand on (Morty's Gym)
      case 'rapids': water(P, C, ox, oy, tx, ty, at, frame); break;   // its foam streaks: render.js
      case 'bars': if (C.floor) floor(P, C, ox, oy, tx, ty, C.floor); else grass(P, C, ox, oy, tx, ty); break;   // closed: a prop (render.js)
      case 'plate': plate(P, C, ox, oy, tx, ty); break;
      case 'statue': statue(P, C, ox, oy, tx, ty); break;
      case 'quiz': quiz(P, C, ox, oy, tx, ty); break;
      default: P.rect(ox, oy, T, T, C.black);
    }
    // Under a building: whatever is around it (path in front of the door).
    if (kind === 'stamp' && m) {
      const below = G.Maps.kindAt(m, tx, ty + 1);
      if (below === 'path' || below === 'door') ground(P, C, ox, oy, tx, ty, at, 'path');
    }
  }

  function bakeGround(m, frame) {
    const C = colors(m.palette);
    const P = Pix(m.w * T, m.h * T);
    const at = (x, y) => G.Maps.kindNear(m, x, y);
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      paintTile(P, C, tx * T, ty * T, tx, ty, at(tx, ty), at, frame, m);
    }
    return P.canvas();
  }

  /** The whole map, once: two ground frames and the Y-sorted strips. */
  function bakeMap(m) {
    const animated = m.kind.some(k => k === 'water' || k === 'flowers' || k === 'rapids');
    const g0 = bakeGround(m, 0);
    const ground = [g0, animated ? bakeGround(m, 1) : g0];
    const strips = {};
    const add = (row, up) => {
      const s = strips[row];
      if (s && s.up >= up) return s;
      return (strips[row] = { up, items: (s && s.items) || [] });
    };
    const pal = m.palette in PALETTES && !PALETTES[m.palette].floor ? m.palette : OUT;
    const tree = sprite('tree', pal), htree = sprite('htree', pal), btree = sprite('btree', pal);
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      const k = m.kind[ty * m.w + tx];
      if (k === 'tree') add(ty, tree.height - T).items.push({ img: tree, x: tx * T, bottom: 0 });
      else if (k === 'headtree') add(ty, htree.height - T).items.push({ img: htree, x: tx * T, bottom: 0 });
      else if (k === 'berrytree') add(ty, btree.height - T).items.push({ img: btree, x: tx * T, bottom: 0 });
    }
    for (const st of m.stamps) {
      const s = G.Stamps.get(st.type, st.door ? st.door[0] : 0, { x: st.x, y: st.y, palette: m.palette });
      const row = st.y + st.h - 1;
      add(row, s.canvas.height - T).items.push({ img: s.canvas, x: st.x * T, bottom: 0 });
    }
    // Paint each strip: its canvas covers the row and `up` px above it.
    for (const [row, s] of Object.entries(strips)) {
      const cv = document.createElement('canvas');
      cv.width = m.w * T; cv.height = s.up + T;
      const c = cv.getContext('2d');
      for (const it of s.items) c.drawImage(it.img, it.x, cv.height - it.img.height);
      strips[row] = { canvas: cv, up: s.up };
    }
    // A row of border trees just below the map: their tops cover the last row.
    let below = null;
    if (m.border === 'tree') {
      const cv = document.createElement('canvas');
      cv.width = (m.w + 2) * T; cv.height = tree.height;
      const c = cv.getContext('2d');
      for (let x = 0; x < m.w + 2; x++) c.drawImage(tree, x * T, 0);
      below = { canvas: cv, up: tree.height - T };
    }
    return { ground, strips, below };
  }

  /** A canvas that repeats outside the map (its border kind), aligned with the tile grid. */
  const borders = {};
  function border(m) {
    const k = m.border + '/' + m.palette;
    if (borders[k] !== undefined) return borders[k];
    if (m.border === 'void') return (borders[k] = null);
    const C = colors(m.palette);
    // Paint 2×3 tiles of the border kind and keep the middle row (its neighbours are real).
    const P = Pix(2 * T, 3 * T);
    const at = () => m.border;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) paintTile(P, C, i * T, j * T, i + 1000, j + 1000, m.border, at, 0, null);
    const full = P.canvas();
    const c = full.getContext('2d');
    if (m.border === 'tree') {
      const tree = sprite('tree', PALETTES[m.palette] && !PALETTES[m.palette].floor ? m.palette : OUT);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) c.drawImage(tree, i * T, j * T - (tree.height - T));
    }
    const cv = document.createElement('canvas');
    cv.width = 2 * T; cv.height = T;
    cv.getContext('2d').drawImage(full, 0, T, 2 * T, T, 0, 0, 2 * T, T);
    return (borders[k] = cv);
  }

  return { T, PALETTES, rgb, pack, mixPack, shade, Pix, disc, outline, ascii, colors, sprite, bakeMap, border };
})();
