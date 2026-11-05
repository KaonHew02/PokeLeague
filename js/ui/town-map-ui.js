/* ============ town-map-ui.js — the Town Map, and where to Fly ============
 *   await G.TownMapUI.open()               the Town Map (from the Bag): where you are
 *   await G.TownMapUI.open({ fly: true })  -> the map id of a visited town to fly to, or null
 * A small drawing of a region (land, sea, the routes and the towns) beside a list of its towns.
 * The place under the cursor blinks; visited towns are red, the others grey. The towns are
 * the maps with a `fly` landing spot (G.World.flyTargets); a click on the drawing picks one too.
 * It shows the region you are in (map `region`, Kanto by default); once you have been to another
 * one, a button goes round the regions you have seen (Fly crosses between them).
 * A roaming Pokémon once met (chapter 42, G.Roam.where()) blinks on its route: red Latias, blue Latios.
 */
G.TownMapUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const CELL = 16, PAD = 12, COLS = 20, ROWS = 15;
  // Kanto. Where places sit on the drawing (grid cells), by location id.
  const AT = {
    'pallet-town': [4, 11], 'viridian-city': [4, 7], 'pewter-city': [4, 3], 'cerulean-city': [13, 2],
    'vermilion-city': [13, 10], 'lavender-town': [17, 6], 'celadon-city': [9, 6], 'saffron-city': [13, 6],
    'fuchsia-city': [11, 13], 'cinnabar-island': [4, 14], 'indigo-plateau': [1, 2],
    'viridian-forest': [4, 5], 'mt-moon': [8, 2], 'rock-tunnel': [17, 3], 'pokemon-tower': [17, 6],
    'digletts-cave': [15, 10], 'kanto-safari-zone': [11, 12], 'seafoam-islands': [8, 14],
    'pokemon-mansion': [4, 14], 'ss-anne': [13, 10.6], 'kanto-underground-path': [13, 8], 'kanto-victory-road-2': [1, 3.6]
  };
  // The roads (Route n: its line) and the sea routes.
  const ROADS = {
    1: [[4, 11], [4, 7]], 2: [[4, 7], [4, 3]], 3: [[4, 3], [8, 3]], 4: [[8, 3], [8, 2], [13, 2]],
    5: [[13, 2], [13, 6]], 6: [[13, 6], [13, 10]], 7: [[9, 6], [13, 6]], 8: [[13, 6], [17, 6]],
    9: [[13, 2], [17, 2]], 10: [[17, 2], [17, 6]], 11: [[13, 10], [17, 10]], 12: [[17, 6], [17, 11]],
    13: [[17, 11], [15, 11]], 14: [[15, 11], [15, 13]], 15: [[15, 13], [11, 13]],
    16: [[9, 6], [6, 6]], 17: [[6, 6], [6, 13]], 18: [[6, 13], [11, 13]],
    22: [[4, 7], [1, 7]], 23: [[1, 7], [1, 2]], 24: [[13, 2], [13, 0.8]], 25: [[13, 0.8], [16, 0.8]]
  };
  const SEA = { 19: [[11, 13], [11, 14]], 20: [[11, 14], [4, 14]], 21: [[4, 11], [4, 14]] };
  // Land: the mainland, the southern coast, Cinnabar and the Seafoam Islands.
  const LAND = [[-0.5, -0.5, 20, 12.4], [8.5, 11.5, 11, 2.4], [3.2, 13.3, 1.6, 1.4], [7.4, 13.4, 1.2, 1.2]];
  // Johto: New Bark Town in the east, the League's Routes 26 and 27 at the right edge.
  const JOHTO = {
    AT: {
      'new-bark-town': [17, 11], 'cherrygrove-city': [12, 11], 'violet-city': [9, 5], 'azalea-town': [5, 12],
      'goldenrod-city': [5, 8], 'ecruteak-city': [7, 3], 'olivine-city': [2.5, 4], 'cianwood-city': [0.6, 9],
      'mahogany-town': [13, 3], 'blackthorn-city': [17, 3], 'sprout-tower': [9, 3.9], 'dark-cave': [11, 5],
      'union-cave': [8.3, 12], 'slowpoke-well': [4.4, 12.6], 'ilex-forest': [4.2, 11], 'radio-tower': [5.6, 7.6],
      'national-park': [4.6, 5.6], 'burned-tower': [6.5, 2.7], 'bell-tower': [7.6, 2.6], 'ruins-of-alph': [7.2, 6.4],
      'johto-lighthouse': [2.1, 4.2], 'whirl-islands': [1.6, 7.4],
      'mt-mortar': [10, 3], 'team-rocket-hq': [13.4, 3.3], 'lake-of-rage': [13, 1.3],
      'ice-path': [15.4, 3], 'dragons-den': [17.6, 2.2]
    },
    ROADS: {
      29: [[17, 11], [12, 11]], 30: [[12, 11], [12, 6]], 31: [[12, 6], [9, 6], [9, 5]], 32: [[9, 5], [9, 12]],
      33: [[9, 12], [5, 12]], 34: [[5, 12], [5, 8]], 35: [[5, 8], [5, 5]], 36: [[5, 5], [9, 5]], 37: [[7, 5], [7, 3]],
      38: [[7, 3], [3, 3]], 39: [[3, 3], [2.5, 4]], 42: [[7, 3], [13, 3]], 43: [[13, 3], [13, 0.8]], 44: [[13, 3], [17, 3]],
      45: [[17, 3], [17, 8]], 46: [[17, 8], [14.5, 8], [14.5, 11]], 26: [[19.2, 0.8], [19.2, 9]], 27: [[19.2, 9], [19.2, 11], [17, 11]]
    },
    SEA: { 40: [[2.5, 4], [2.5, 7]], 41: [[2.5, 7], [0.6, 9]] },
    LAND: [[1.6, -0.5, 18.9, 12.8], [-0.5, 8, 1.8, 2.2], [3, 12, 7.5, 2]]
  };
  // Hoenn (chapter 28): Littleroot Town in the south-west; the towns of later chapters are already
  // placed, their roads come with them.
  const HOENN = {
    AT: {
      'littleroot-town': [4, 12], 'oldale-town': [4, 9.5], 'petalburg-city': [1.2, 9.5], 'rustboro-city': [1.2, 4.5],
      'dewford-town': [1.2, 13.8], 'slateport-city': [9, 12], 'mauville-city': [9, 6], 'verdanturf-town': [6, 6],
      'fallarbor-town': [3.5, 1.2], 'lavaridge-town': [6, 3.5], 'fortree-city': [11.5, 1.2], 'lilycove-city': [16, 3],
      'mossdeep-city': [18.6, 4.5], 'sootopolis-city': [16.4, 8], 'pacifidlog-town': [14.5, 12.4], 'ever-grande-city': [19, 11],
      'petalburg-woods': [0.4, 7], 'rusturf-tunnel': [3.6, 4.5], 'granite-cave': [0.4, 13.2],
      'fiery-path': [7.4, 3.2], 'mt-chimney': [6, 2.2], 'jagged-pass': [6, 2.9], 'meteor-falls': [1.4, 2.4], 'mt-pyre': [15, 5.4],
      'team-aqua-hideout': [16.6, 3.5], 'seafloor-cavern': [18, 9.2], 'cave-of-origin': [16.4, 7.4], 'sky-pillar': [15.4, 13.2],
      'hoenn-victory-road': [19.6, 10.2], 'hoenn-pokemon-league': [19.6, 9.4],
      'island-cave': [-0.2, 11.8], 'desert-ruins': [8.4, 2.2], 'ancient-tomb': [12.8, 1.8], 'sealed-chamber': [10, 12.8],
      'terra-cave': [2.4, 1.6], 'marine-cave': [19, 7.2], 'southern-island': [12.4, 14.6], 'hoenn-battle-tower': [17.6, 13.6]
    },
    ROADS: { 101: [[4, 12], [4, 9.5]], 102: [[4, 9.5], [1.2, 9.5]], 103: [[4, 9.5], [4, 8], [8, 8]], 104: [[1.2, 9.5], [0.4, 9.5], [0.4, 4.5], [1.2, 4.5]],
             116: [[1.2, 4.5], [3.6, 4.5]], 106: [[1.2, 13.8], [0.4, 13.8], [0.4, 13.2]], 110: [[9, 12], [9, 6]],
             111: [[9, 6], [9, 1.2]], 112: [[9, 4.4], [6.8, 4.4], [6, 3.5]], 113: [[9, 1.2], [3.5, 1.2]],
             114: [[3.5, 1.2], [1.4, 1.2], [1.4, 2.4]], 117: [[9, 6], [6, 6]], 118: [[9, 6], [12, 6]],
             119: [[12, 6], [12, 1.2], [11.5, 1.2]], 120: [[11.5, 1.2], [14, 1.2], [14, 3]],
             121: [[14, 3], [16, 3]] },
    SEA: { 122: [[15, 3], [15, 5.4]], 124: [[16, 3], [18.6, 3], [18.6, 4.5]], 127: [[18.6, 4.5], [18.6, 8.6]],
           128: [[17.4, 8.6], [19, 8.6], [19, 11]], 126: [[15.6, 5.6], [15.6, 9.2], [17.4, 9.2], [17.4, 5.6], [15.6, 5.6]],
           129: [[17.4, 8.6], [17.4, 12.4], [16.6, 12.4]], 130: [[16.6, 12.4], [15.8, 12.4]], 131: [[15.8, 12.4], [14.5, 12.4]],
           132: [[14.5, 12.4], [13, 12.4]], 133: [[13, 12.4], [11, 12.4]], 134: [[11, 12.4], [9, 12.4], [9, 12]],
           105: [[0.4, 9.5], [-0.2, 10], [-0.2, 13.8], [0.4, 13.8]] },
    LAND: [[-0.5, -0.5, 13, 13.2], [0.4, 13.2, 1.6, 1.2], [9.5, 0.2, 7.6, 4.2], [17.8, 3.6, 1.8, 1.8], [15.6, 7.2, 1.6, 1.6],
           [18.2, 9.8, 2.3, 2.6]]
  };
  // Sinnoh (chapter 44): Twinleaf Town and Sandgem Town on the south coast, Lake Verity west of Route 201,
  // Mt. Coronet down the middle; the towns of later chapters are already placed, their roads come with them.
  const SINNOH = {
    AT: {
      'twinleaf-town': [3.4, 13], 'sandgem-town': [5.5, 13], 'lake-verity': [2, 12], 'jubilife-city': [5.5, 10],
      'oreburgh-city': [8.4, 10], 'floaroma-town': [4.6, 6.5], 'eterna-city': [7.6, 4.4], 'hearthome-city': [12.4, 8.6],
      'solaceon-town': [13, 5.6], 'veilstone-city': [16, 5], 'pastoria-city': [13.6, 11.4], 'celestic-town': [11.4, 5],
      'canalave-city': [1.6, 8.4], 'snowpoint-city': [9.6, 0.8], 'sunyshore-city': [18.4, 11.6], 'sinnoh-pokemon-league': [18.6, 6.6],
      'mt-coronet': [10, 7], 'lake-valor': [15, 9.6], 'lake-acuity': [8, 1.6], 'acuity-lakefront': [8.8, 1.6], 'oreburgh-gate': [7.2, 10], 'oreburgh-mine': [8.4, 11],
      'ravaged-path': [5.5, 8.4], 'floaroma-meadow': [4.6, 5.6], 'valley-windworks': [6.4, 7.8], 'eterna-forest': [6.2, 4.4],
      'solaceon-ruins': [13.7, 6.2], 'valor-lakefront': [16, 10.6], 'great-marsh': [13.6, 10.6], 'iron-island': [1, 6.2],
      'sendoff-spring': [14.6, 8], 'spring-path': [14.6, 8.6], 'turnback-cave': [14.2, 7.6]
    },
    ROADS: { 222: [[16, 10.6], [18.4, 11.6]], 201: [[2, 12], [3.4, 12], [3.4, 13], [3.4, 12], [5.5, 12], [5.5, 13]], 202: [[5.5, 13], [5.5, 10]], 203: [[5.5, 10], [8.4, 10]],
             204: [[5.5, 10], [5.5, 7.6], [4.6, 7.6], [4.6, 6.5]],
             205: [[4.6, 6.5], [6.4, 6.5], [6.4, 7.8], [6.4, 6.5], [6.4, 4.4], [7.6, 4.4]],
             206: [[7.6, 4.4], [7.6, 8.6]], 207: [[8.4, 10], [8.4, 8.6], [7.6, 8.6], [10, 8.6], [10, 7]],
             208: [[10, 7], [10.6, 8.6], [12.4, 8.6]], 209: [[12.4, 8.6], [13, 8.6], [13, 5.6]], 210: [[13, 5.6], [13, 3.6], [11.4, 3.6], [11.4, 5]],
             215: [[13, 4.4], [16, 4.4], [16, 5]], 214: [[16, 5], [16, 10.6]], 213: [[16, 10.6], [16, 11.4], [13.6, 11.4]],
             218: [[5.5, 10], [1.6, 10], [1.6, 8.4]], lake: [[16, 10.6], [15, 10.6], [15, 9.6]],
             211: [[7.6, 4.4], [11.4, 4.4], [11.4, 5]], 216: [[10, 4.4], [10, 3.4], [8.8, 3.4]], 217: [[8.8, 3.4], [8.8, 1.6]],
             acuity: [[8, 1.6], [8.8, 1.6], [8.8, 0.8], [9.6, 0.8]] },
    SEA: {},
    LAND: [[0.6, -0.5, 19.6, 14.2]]
  };
  const MAPS = { kanto: { AT, ROADS, SEA, LAND }, johto: JOHTO, hoenn: HOENN, sinnoh: SINNOH };
  const REGION_NAME = { kanto: () => T('Kanto'), johto: () => T('Johto'), hoenn: () => T('Hoenn'), sinnoh: () => T('Sinnoh') };
  /** The regions you have seen, in order. */
  const seenRegions = () => Object.keys(MAPS).filter(r => r === st.region || st.towns.some(t => t.visited && regionOf(t.loc) === r));
  /** The next region on the button (null when you have seen only this one). */
  const nextRegion = () => { const all = seenRegions(); return all.length > 1 ? all[(all.indexOf(st.region) + 1) % all.length] : null; };
  /** The drawing being shown. */
  const R = () => MAPS[st.region];
  /** The region of a location id (by the drawing it is on). */
  const regionOf = loc => Object.keys(MAPS).find(r => MAPS[r].AT[loc]) || null;

  let el = null, st = null, raf = 0;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-townmap';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box tm-box"><div class="opt-head"><h3></h3><button class="btn small ghost hidden" data-region></button><button class="btn small ghost" data-back></button></div>'
      + '<div class="tm-main"><div class="tm-map"><canvas></canvas><p class="tm-place"></p></div><div class="menu-list tm-list"></div></div></div>';
    document.getElementById('frame').appendChild(el);
    const cv = el.querySelector('canvas');
    cv.width = COLS * CELL + PAD * 2; cv.height = ROWS * CELL + PAD * 2;
    cv.addEventListener('click', e => {
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height;
      let best = null, bd = 14;
      for (const t of shown()) {
        const [px, py] = pos(t.loc), d = Math.hypot(px - x, py - y);
        if (d < bd) { bd = d; best = t; }
      }
      if (!best) return;
      const b = el.querySelector(`[data-id="${best.id}"]`);
      if (b) G.Nav.focusFirst(b);
      st.sel = best.id;
      if (st.fly && best.visited) finish(best.id);
    });
    el.querySelector('[data-back]').onclick = () => finish(null);
    el.querySelector('[data-region]').onclick = () => {
      st.region = nextRegion() || st.region;
      const first = shown().find(t => t.visited) || shown()[0];
      st.sel = first ? first.id : null;
      render(); label();
      const b = st.sel && el.querySelector(`[data-id="${st.sel}"]:not(:disabled)`);
      if (b) G.Nav.focusFirst(b);
    };
  }

  /** The towns on the drawing being shown. */
  const shown = () => st.towns.filter(t => regionOf(t.loc) === st.region);
  const pos = loc => { const p = R().AT[loc] || [0, 0]; return [PAD + (p[0] + 0.5) * CELL, PAD + (p[1] + 0.5) * CELL]; };
  /** The route number of a location id ('kanto-route-16', 'kanto-sea-route-20'), or 0. */
  const routeNo = loc => { const m = /route-(\d+)$/.exec(loc || ''); return m ? +m[1] : 0; };
  /** Where the player is on the drawing (a town, a place, the middle of a route), or null. */
  function here() {
    const m = G.World && G.World.map;
    const loc = m && m.loc;
    if (!loc || (m.def.region || 'kanto') !== st.region) return null;
    if (R().AT[loc]) return pos(loc);
    return middle(loc);
  }
  /** The middle of a route on the drawing, or null. */
  function middle(loc) {
    const line = R().ROADS[routeNo(loc)] || R().SEA[routeNo(loc)];
    if (!line) return null;
    const [a, b] = [line[0], line[line.length - 1]];
    return [PAD + ((a[0] + b[0]) / 2 + 0.5) * CELL, PAD + ((a[1] + b[1]) / 2 + 0.5) * CELL];
  }
  /** The roaming Pokémon, once met: { at: [x, y], sp } on the Hoenn drawing, or null. */
  function roamer() {
    const id = st.region === 'hoenn' && G.Roam && G.Roam.where();
    const at = id && G.Maps.has(id) ? middle(G.Maps.get(id).loc) : null;
    return at ? { at, sp: G.Field.save.roamer.mon.sp } : null;
  }

  /** The drawing as large as its corner of the screen allows (the canvas keeps its own pixels). */
  function fit() {
    const cv = el.querySelector('canvas'), box = el.querySelector('.tm-map'), label = el.querySelector('.tm-place');
    const k = Math.min(box.clientWidth / cv.width, (box.clientHeight - label.offsetHeight - 8) / cv.height);
    if (!(k > 0)) return;
    const w = Math.floor(cv.width * k) + 'px', h = Math.floor(cv.height * k) + 'px';
    if (cv.style.width !== w) { cv.style.width = w; cv.style.height = h; }
  }

  function draw(now) {
    fit();
    const cv = el.querySelector('canvas'), c = cv.getContext('2d');
    const k = CELL, P = (x, y) => [PAD + (x + 0.5) * k, PAD + (y + 0.5) * k];
    c.fillStyle = '#2f6fbf'; c.fillRect(0, 0, cv.width, cv.height);
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1;
    for (let y = 10; y < cv.height; y += 14) for (let x = (y / 14 | 0) % 2 * 10; x < cv.width; x += 24) {
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y - 2); c.lineTo(x + 12, y); c.stroke();
    }
    for (const [x, y, w, h] of R().LAND) {
      c.fillStyle = '#3e7d34'; c.fillRect(PAD + x * k - 2, PAD + y * k - 2, w * k + 4, h * k + 4);
      c.fillStyle = '#74b84e'; c.fillRect(PAD + x * k, PAD + y * k, w * k, h * k);
    }
    const road = (pts, color, w, dash) => {
      c.strokeStyle = color; c.lineWidth = w; c.setLineDash(dash || []); c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); pts.forEach(([x, y], i) => { const [px, py] = P(x, y); if (i) c.lineTo(px, py); else c.moveTo(px, py); }); c.stroke();
    };
    for (const pts of Object.values(R().SEA)) road(pts, '#a8d4ff', 3, [4, 4]);
    for (const pts of Object.values(R().ROADS)) road(pts, '#3c5a2a', 6);
    for (const pts of Object.values(R().ROADS)) road(pts, '#f2dc8c', 3.5);
    c.setLineDash([]);
    const blink = Math.floor(now / 350) % 2 === 0;
    for (const t of shown()) {
      const [x, y] = pos(t.loc);
      const sel = t.id === st.sel;
      c.fillStyle = '#20242c'; c.fillRect(x - 6, y - 6, 12, 12);
      c.fillStyle = t.visited ? (sel && blink ? '#ffe070' : '#e04848') : (sel && blink ? '#e8e8e8' : '#9aa0a8');
      c.fillRect(x - 4.5, y - 4.5, 9, 9);
      if (sel) { c.strokeStyle = blink ? '#ffffff' : '#ffe070'; c.lineWidth = 2; c.strokeRect(x - 8.5, y - 8.5, 17, 17); }
    }
    const ro = roamer();
    if (ro && !blink) {
      c.fillStyle = '#20242c'; c.beginPath(); c.arc(ro.at[0], ro.at[1], 5.5, 0, 6.2832); c.fill();
      c.fillStyle = ro.sp === 380 ? '#f05068' : '#5080f0'; c.beginPath(); c.arc(ro.at[0], ro.at[1], 4, 0, 6.2832); c.fill();
    }
    const me = here();
    if (me && (!st.fly || blink)) {
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(me[0], me[1] - 9, 4.5, 0, 6.2832); c.fill();
      c.fillStyle = '#e03838'; c.beginPath(); c.arc(me[0], me[1] - 9, 3, Math.PI, 0); c.fill();
      c.fillStyle = '#20242c'; c.fillRect(me[0] - 3, me[1] - 9.5, 6, 1);
    }
  }

  function label() {
    const t = st.towns.find(x => x.id === st.sel);
    const m = G.World && G.World.map;
    const p = el.querySelector('.tm-place');
    if (t) p.textContent = G.Names.loc(t.loc) + (m && m.loc === t.loc ? ' · ' + T('You are here') : '');
    else p.textContent = m && m.loc ? G.Names.loc(m.loc) + ' · ' + T('You are here') : '';
    const ro = roamer();
    if (ro) p.textContent += ' · ' + fmt('{mon} roams near the blinking dot.', { mon: G.Names.mon(ro.sp) });
  }

  function render() {
    el.querySelector('h3').textContent = st.fly ? T('Where would you like to fly?') : G.Names.item('town-map');
    el.querySelector('[data-back]').textContent = st.fly ? T('Cancel') : T('Back');
    // The next region's drawing, once you have been there.
    const other = nextRegion();
    const rb = el.querySelector('[data-region]');
    rb.textContent = other ? REGION_NAME[other]() : '';
    rb.classList.toggle('hidden', !other);
    const list = el.querySelector('.tm-list');
    list.innerHTML = shown().map(t => `<button class="menu-item${t.visited ? '' : ' unseen'}" data-id="${esc(t.id)}"${st.fly && !t.visited ? ' disabled' : ''}>`
      + `${esc(t.visited || !st.fly ? G.Names.loc(t.loc) : '-----')}</button>`).join('');
    list.querySelectorAll('[data-id]').forEach(b => {
      b.onclick = () => { st.sel = b.dataset.id; label(); if (st.fly) finish(b.dataset.id); };
      b.onmouseenter = () => { st.sel = b.dataset.id; label(); };
    });
  }

  function finish(v) {
    if (!st) return;
    cancelAnimationFrame(raf);
    G.UI.close(el);
    const d = st.done;
    st = null;
    if (d) d(v);
  }

  function open(o = {}) {
    if (!el) build();
    return new Promise(res => {
      const ORDER = [...Object.keys(AT), ...Object.keys(JOHTO.AT), ...Object.keys(HOENN.AT), ...Object.keys(SINNOH.AT)];
      const towns = (G.World && G.World.flyTargets ? G.World.flyTargets() : [])
        .filter(t => regionOf(t.loc)).sort((a, b) => ORDER.indexOf(a.loc) - ORDER.indexOf(b.loc));
      const m = G.World && G.World.map;
      const region = (m && m.def.region) || 'kanto';
      const cur = towns.find(t => m && t.loc === m.loc);
      // Flying: the town you are in, else the first one you can fly to. The Town Map on a route: nothing
      // picked yet, so it says where you are.
      const pick = cur || (o.fly ? towns.find(t => t.visited && regionOf(t.loc) === region) : null);
      st = { fly: !!o.fly, towns, region, done: res, sel: pick ? pick.id : null };
      render();
      label();
      const first = st.sel ? el.querySelector(`[data-id="${st.sel}"]:not(:disabled)`) : st.fly ? null : el.querySelector('[data-back]');
      G.UI.open(el, { onBack: () => finish(null), focus: first });
      const loop = now => {
        if (!st || !G.UI.isOpen('scr-townmap')) return;
        const f = G.Nav.focused;
        if (f && f.dataset && f.dataset.id && f.dataset.id !== st.sel) { st.sel = f.dataset.id; label(); }
        draw(now);
        raf = requestAnimationFrame(loop);
      };
      draw(performance.now());
      raf = requestAnimationFrame(loop);
    });
  }

  return { open, AT, ROADS, JOHTO, HOENN, SINNOH };
})();
