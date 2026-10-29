/* ============ maps.js — G.Maps: map format, parsing, validation ============
 * A map is ASCII rows plus objects (docs/DESIGN.md section 4):
 *
 *   G.Maps.def({ id:'pallet', loc:'pallet-town', tileset:'outdoor', palette:'kanto', music:'town',
 *     border:'T', rows:[ 'TTTT..TTTT', … ], connect:{ north:{ map:'route1', offset:0 } },
 *     warps:[{ x, y, to, spot }], spots:{ name:[x, y, dir] }, signs:{ 'x,y':'text' | { script } },
 *     npcs:[…], trainers:[…], items:[…], triggers:[…], encounters:{ walk:'@area-key' }, enter:'script' })
 *   Chapter 7: boulders:[{ id, x, y, if, fixed }] (Strength), bars:[{ x, y, w, h, if }] (gates),
 *   calm: cond (fast water becomes water), flow: 'down', encounters.water: '@area' (Surf and rods),
 *   and people with swim: true (standing in water).
 *   Chapter 8: fly: { spot, if } (a town you can fly to), bike: true (Cycling Road: on the Bicycle
 *   only), slope: 'down' (you roll that way while riding), noBike: true (an outdoor map without it).
 *   Chapter 9: outdoor `x` a floor switch (a boulder pushed onto it stays there for good: flag
 *   plate:<map>:<x>,<y>), outdoor `b` a rock barrier (a `bars` gate: open while its rule holds),
 *   stamp `I` the Pokémon League.
 *   Chapter 11: region: 'johto' (the time of day, obedience; Kanto maps leave it out).
 *
 *   G.Maps.get(id)      the parsed map (cached): kind grid, solid mask, stamps, lookups
 *   G.Maps.parse(def)   { w, h, kind[], solid, stamps[], stampAt, errors[] }
 *   G.Maps.validate(id) every error of one map (also checks the maps it points to)
 *   G.Maps.center(id, { exit:{ map, spot }, loc, npcs })               standard Pokémon Center interior
 *   G.Maps.mart(id, { exit:{ map, spot }, loc, stock, clerk, npcs })   standard Poké Mart interior
 *       (npcs: extra people; clerk: the clerk's own script instead of just the shop)
 *
 * Warps: a door (D) or stairs (^) warp when you step on them; an exit mat (X)
 * when you walk down onto it or press down while standing on it. Arrival
 * spots never warp, so a spot can be on a mat. A locked door:
 * { x, y, to?, spot?, if: cond, locked: script } — while there is no `to` or `if`
 * fails, walking into it runs `locked` instead (the Viridian Gym).
 *
 * Pure logic: runs in node (tests, tools/map_check.js). Painting is tiles.js.
 */
G.Maps = (() => {
  const TS = 32;                         // world units per tile (16 art px × G.Sprites.PX)

  /** Tile kinds and what they do. */
  const KINDS = {
    grass: {}, path: {}, sand: {}, tall: { enc: 1 }, flowers: {},
    tree: { solid: 1 }, cliff: { solid: 1 }, water: { solid: 1 }, fence: { solid: 1 }, sign: { solid: 1 },
    'ledge-down': { solid: 1, ledge: 'down' }, 'ledge-left': { solid: 1, ledge: 'left' }, 'ledge-right': { solid: 1, ledge: 'right' },
    door: { warp: 1 }, stamp: { solid: 1 },
    wall: { solid: 1 }, wood: {}, tile: {}, rug: {}, counter: { solid: 1, counter: 1 }, shelf: { solid: 1 },
    table: { solid: 1 }, plant: { solid: 1 }, pc: { solid: 1 }, healer: { solid: 1 },
    mat: { warp: 1 }, stairs: { warp: 1 }, ladder: { warp: 1 }, hole: { warp: 1 }, void: { solid: 1 },
    cuttree: { solid: 1, cut: 1 }, can: { solid: 1 }, grave: { solid: 1 }, hedge: { solid: 1 },
    // Chapter 5: a poster hiding stairs (a warp that opens with its `if`), a wall poster, slot
    // machines, lift doors, spin tiles (an arrow sends you sliding until a stop tile or a wall)
    // and walls you cannot see (Koga's Gym).
    secret: { warp: 1 }, poster: { solid: 1 }, slots: { solid: 1 }, lift: { warp: 1 },
    'spin-up': { spin: 'up' }, 'spin-down': { spin: 'down' }, 'spin-left': { spin: 'left' }, 'spin-right': { spin: 'right' },
    'spin-stop': { stop: 1 }, invisible: { solid: 1 }, bridge: {},
    // Chapter 6: doors that open with the Card Key (Silph Co.) and teleport pads (warps).
    keydoor: { solid: 1 }, pad: { warp: 1 },
    // Chapter 7: a hole in the floor (a warp you fall through, until a boulder fills it), fast
    // water (solid until the map's `calm` holds), gates (open while their `bars` rule holds),
    // statues (switches in the Pokémon Mansion) and quiz machines (Blaine's Gym).
    pit: { warp: 1 }, rapids: { solid: 1 }, bars: { solid: 1 }, statue: { solid: 1 }, quiz: { solid: 1 },
    // Chapter 9: a floor switch a boulder can be pushed onto (Victory Road).
    plate: {},
    // Chapter 13: a tree that Headbutt can shake (Johto); its wild Pokémon are the area's 'headbutt' table.
    headtree: { solid: 1 },
    // Chapter 14: a floor that is not there (Morty's Gym): you fall back to the map's `fall` spot.
    abyss: { fall: 1 }, rubble: { solid: 1 },
    // Chapter 15: a berry tree (a berry or more once a day; map `berries: [[x, y, item]]`, else Oran).
    berrytree: { solid: 1 },
    // Chapter 16: ice (Pryce's Gym; in caves too, chapter 18): you slide on it (field.js).
    ice: { ice: 1 },
    // Chapter 19: a waterfall (Route 27): a surfer rides down it, and climbs it with Waterfall (field.js).
    waterfall: { solid: 1 },
    // Chapter 22: a whirlpool (Sea Route 41): Whirlpool calms it into water until you leave the map (field.js).
    whirlpool: { solid: 1 },
    // Chapter 23: a cracked rock (the Dark Cave): Rock Smash breaks it until you leave the map (field.js).
    smashrock: { solid: 1 }
  };
  const LEGEND = {
    outdoor: {
      '.': 'grass', ',': 'path', ':': 'sand', '"': 'tall', f: 'flowers',
      T: 'tree', '#': 'cliff', '~': 'water', F: 'fence', S: 'sign',
      v: 'ledge-down', '<': 'ledge-left', '>': 'ledge-right',
      H: 'stamp', C: 'stamp', M: 'stamp', G: 'stamp', L: 'stamp', K: 'stamp', E: 'stamp', B: 'stamp', Y: 'stamp', D: 'door',
      '%': 'ladder', O: 'hole',                      // caves: a ladder, a cave mouth (both warps)
      c: 'cuttree',                                  // a small tree that Cut clears (until you leave the map)
      '=': 'bridge',                                 // a wooden bridge over water
      R: 'stamp',                                    // the burnt Pokémon Mansion
      o: 'pit', r: 'rapids',                         // a hole in a cave floor, fast water (the Seafoam Islands)
      x: 'plate', b: 'bars',                         // a floor switch, a rock barrier (Victory Road)
      I: 'stamp',                                    // the Pokémon League
      h: 'headtree',                                 // a tree to Headbutt (Johto)
      y: 'berrytree',                                // a berry tree (Johto)
      i: 'ice',                                      // ice on a cave floor (the Ice Path)
      '|': 'waterfall',                              // a waterfall: ride down it, climb it with Waterfall
      w: 'whirlpool',                                // a whirlpool: Whirlpool calms it (until you leave the map)
      k: 'smashrock'                                 // a cracked rock: Rock Smash breaks it (until you leave the map)
    },
    indoor: {
      W: 'wall', _: 'wood', '+': 'tile', r: 'rug',
      '=': 'counter', b: 'shelf', t: 'table', p: 'plant', P: 'pc', h: 'healer',
      X: 'mat', '^': 'stairs', '~': 'water', u: 'can', g: 'grave', k: 'hedge',
      Q: 'secret', q: 'poster', s: 'slots', e: 'lift',
      U: 'spin-up', D: 'spin-down', L: 'spin-left', R: 'spin-right', o: 'spin-stop', i: 'invisible',
      n: 'keydoor', w: 'pad',
      O: 'pit', y: 'bars', j: 'statue', z: 'quiz',
      a: 'abyss', c: 'rubble', I: 'ice'
    }
  };
  /** Buildings drawn as stamps: footprint in tiles (stamps.js paints them). */
  const STAMPS = {
    H: { type: 'house', w: 4, h: 3 },
    C: { type: 'center', w: 5, h: 4 },
    M: { type: 'mart', w: 4, h: 3 },
    G: { type: 'gym', w: 6, h: 5 },
    L: { type: 'lab', w: 6, h: 4 },
    K: { type: 'tower', w: 5, h: 5 },          // the Pokémon Tower
    E: { type: 'store', w: 8, h: 5 },          // a department store
    B: { type: 'building', w: 6, h: 4 },       // a big building (a mansion, a game corner, a gate)
    Y: { type: 'office', w: 8, h: 6 },         // an office tower (Silph Co.)
    R: { type: 'ruin', w: 6, h: 5 },           // a burnt mansion (Cinnabar Island)
    I: { type: 'league', w: 8, h: 6 }          // the Pokémon League (Indigo Plateau)
  };
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const SIDES = { north: 'up', south: 'down', west: 'left', east: 'right' };
  const SIDE_OPP = { north: 'south', south: 'north', west: 'east', east: 'west' };
  const MOVES = ['still', 'look', 'wander', 'spin'];

  const defs = {};
  const cache = {};

  function def(d) {
    if (!d || !d.id) throw new Error('G.Maps.def: a map needs an id');
    if (defs[d.id]) console.warn('[Maps] map defined twice: ' + d.id);
    defs[d.id] = d;
    delete cache[d.id];
    return d;
  }
  const all = () => Object.keys(defs);
  const has = id => !!defs[id];

  const legendOf = d => LEGEND[d.tileset || 'outdoor'] || LEGEND.outdoor;

  /**
   * Rows -> kind grid, solid mask and stamps (with their footprint checks).
   * -> { w, h, ch[], kind[], solid: Uint8Array, stamps[], stampAt: Int16Array, errors[] }
   */
  function parse(d) {
    const errors = [];
    const rows = Array.isArray(d.rows) ? d.rows : [];
    const h = rows.length, w = h ? Math.max(...rows.map(r => r.length)) : 0;
    if (!h || !w) errors.push('the map has no rows');
    rows.forEach((r, y) => { if (r.length !== w) errors.push(`row ${y} is ${r.length} wide, the map is ${w}`); });
    const legend = legendOf(d);
    if (!LEGEND[d.tileset || 'outdoor']) errors.push(`unknown tileset "${d.tileset}"`);
    const n = w * h;
    const ch = new Array(n), kind = new Array(n);
    const solid = new Uint8Array(n);
    const stampAt = new Int16Array(n).fill(-1);
    const bad = new Set();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = rows[y][x] === undefined ? ' ' : rows[y][x];
      const k = legend[c];
      ch[y * w + x] = c;
      if (!k) { if (!bad.has(c)) errors.push(`unknown tile "${c}" at ${x},${y} (tileset ${d.tileset || 'outdoor'})`); bad.add(c); }
      kind[y * w + x] = k || 'void';
      solid[y * w + x] = KINDS[k || 'void'].solid ? 1 : 0;
    }
    // Buildings: every letter block must be exactly its footprint, with one door on the bottom row.
    const stamps = [];
    const seen = new Uint8Array(n);
    if (legend === LEGEND.outdoor) {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const c = ch[y * w + x];
        if (!STAMPS[c] || seen[y * w + x]) continue;
        const S = STAMPS[c];
        const st = { type: S.type, letter: c, x, y, w: S.w, h: S.h, door: null };
        let fits = true;
        for (let j = 0; j < S.h; j++) for (let i = 0; i < S.w; i++) {
          const cx = x + i, cy = y + j;
          if (cx >= w || cy >= h) { fits = false; continue; }
          const k = cy * w + cx, cc = ch[k];
          if (seen[k] || (cc !== c && cc !== 'D')) { fits = false; continue; }
          seen[k] = 1;
          stampAt[k] = stamps.length;
          if (cc === 'D') {
            if (st.door) errors.push(`${S.type} at ${x},${y} has two doors`);
            else st.door = [i, j];
          }
        }
        if (!fits) errors.push(`${S.type} at ${x},${y}: "${c}" must fill a ${S.w}×${S.h} block (with its door D)`);
        if (!st.door) errors.push(`${S.type} at ${x},${y} has no door D`);
        else if (st.door[1] !== S.h - 1) errors.push(`${S.type} at ${x},${y}: the door must be on its bottom row`);
        stamps.push(st);
      }
      for (let k = 0; k < n; k++) if (ch[k] === 'D' && !seen[k]) errors.push(`door D at ${k % w},${(k / w) | 0} is not part of a building`);
    }
    return { w, h, ch, kind, solid, stamps, stampAt, errors };
  }

  const key = (x, y) => x + ',' + y;

  /** The parsed map with its lookups (cached). null if there is no such map. */
  function get(id) {
    if (cache[id]) return cache[id];
    const d = defs[id];
    if (!d) return null;
    const p = parse(d);
    const outdoor = (d.tileset || 'outdoor') === 'outdoor';
    const borderCh = d.border === undefined ? (outdoor ? 'T' : null) : d.border;
    const m = Object.assign(p, {
      id, def: d, tileset: d.tileset || 'outdoor', palette: d.palette || (outdoor ? 'kanto' : 'house'),
      loc: d.loc || null, music: d.music || null,
      border: borderCh ? legendOf(d)[borderCh] || 'void' : 'void',
      borderCh,
      connect: d.connect || {},
      spots: d.spots || {},
      signs: d.signs || {},
      npcs: d.npcs || [], trainers: d.trainers || [], items: d.items || [], triggers: d.triggers || [],
      encounters: d.encounters || {},
      warps: d.warps || [],
      warpAt: new Map((d.warps || []).map(w => [key(w.x, w.y), w]))
    });
    cache[id] = m;
    return m;
  }

  // ---------------- tile queries ----------------

  const inside = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;
  /** Kind at (x, y); outside the map: the border kind. */
  function kindAt(m, x, y) { return inside(m, x, y) ? m.kind[y * m.w + x] : m.border; }
  /** Like kindAt, but outside the map it looks into the connected maps first (autotiling across edges). */
  function kindNear(m, x, y) {
    if (inside(m, x, y)) return m.kind[y * m.w + x];
    const a = across(m, x, y);
    return a ? a.map.kind[a.y * a.map.w + a.x] : m.border;
  }
  function chAt(m, x, y) { return inside(m, x, y) ? m.ch[y * m.w + x] : m.borderCh; }
  /** Can something stand here? (tiles only: people are checked by field.js) */
  function open(m, x, y) { return inside(m, x, y) && !m.solid[y * m.w + x]; }
  /** Ledge jump direction of this tile, or null. */
  function ledge(m, x, y) { const k = KINDS[kindAt(m, x, y)]; return k && k.ledge || null; }
  const info = kind => KINDS[kind] || KINDS.void;

  /**
   * A spot as { x, y, dir }: a name from the map's spots, 'x,y' or 'x,y,dir',
   * or [x, y, dir]. null when it does not resolve.
   */
  function spot(m, s) {
    if (!m || s == null) return null;
    let v = typeof s === 'string' && m.spots[s] ? m.spots[s] : s;
    if (typeof v === 'string' && /^\d+,\d+(,\w+)?$/.test(v)) v = v.split(',').map((p, i) => i < 2 ? +p : p);
    if (!Array.isArray(v) || v.length < 2) return null;
    return { x: v[0] | 0, y: v[1] | 0, dir: DIRS[v[2]] ? v[2] : 'down' };
  }

  /** Where a connected map sits, in this map's tile coordinates: { map, side, ox, oy } or null. */
  function neighbour(m, side) {
    const c = m.connect[side];
    const n = c && get(c.map);
    if (!n) return null;
    const off = c.offset | 0;
    if (side === 'north') return { map: n, side, ox: off, oy: -n.h };
    if (side === 'south') return { map: n, side, ox: off, oy: m.h };
    if (side === 'west') return { map: n, side, ox: -n.w, oy: off };
    if (side === 'east') return { map: n, side, ox: m.w, oy: off };
    return null;
  }
  function neighbours(m) {
    return Object.keys(SIDES).map(s => neighbour(m, s)).filter(Boolean);
  }
  /** The neighbour that covers tile (x, y) outside this map, with the tile in its own coordinates. */
  function across(m, x, y) {
    let side = null;
    if (y < 0 && x >= 0 && x < m.w) side = 'north';
    else if (y >= m.h && x >= 0 && x < m.w) side = 'south';
    else if (x < 0 && y >= 0 && y < m.h) side = 'west';
    else if (x >= m.w && y >= 0 && y < m.h) side = 'east';
    const nb = side && neighbour(m, side);
    if (!nb) return null;
    const lx = x - nb.ox, ly = y - nb.oy;
    return inside(nb.map, lx, ly) ? { map: nb.map, x: lx, y: ly, nb } : null;
  }

  /** Species id from a slug ('pidgey') or a dex number. */
  function species(s) {
    if (typeof s === 'number') return G.SPECIES && G.SPECIES[s] ? s : null;
    if (/^\d+$/.test(String(s))) return species(+s);
    if (!G.SPECIES) return null;
    for (const id in G.SPECIES) if (G.SPECIES[id].slug === s) return +id;
    return null;
  }

  /** Methods on the water: a map's `water` area gives them all (and so does the area of its grass). */
  const WATERY = ['surf', 'old-rod', 'good-rod', 'super-rod'];
  /** Tables a map finds in its walking area when it names none of its own. */
  const FROM_AREA = WATERY.concat(['headbutt', 'rock-smash']);
  /** Encounter table { rate, mons } of one method ('walk', 'surf', 'old-rod'...), or null. */
  function encounters(m, method = 'walk') {
    let e = m.encounters && m.encounters[method];
    if (!e && FROM_AREA.includes(method) && m.encounters) {
      const area = [m.encounters.water, m.encounters.walk].find(a => typeof a === 'string' && G.ENCOUNTERS && G.ENCOUNTERS[a.slice(1)] && G.ENCOUNTERS[a.slice(1)][method]);
      e = area || null;
    }
    if (!e) return null;
    if (typeof e === 'string' && e[0] === '@') {
      const area = G.ENCOUNTERS && G.ENCOUNTERS[e.slice(1)];
      return area && area[method] || null;
    }
    return e && Array.isArray(e.mons) ? e : null;
  }

  // ---------------- validation ----------------

  function validate(id) {
    const m = get(id);
    if (!m) return [`no map "${id}"`];
    const E = m.errors.slice();
    const d = m.def;
    const where = (x, y) => `${x},${y}`;
    const tileOk = (x, y) => inside(m, x, y);
    if (d.border !== undefined && d.border !== null && !legendOf(d)[d.border]) E.push(`border "${d.border}" is not a tile of this tileset`);

    // Spots
    for (const [name, v] of Object.entries(m.spots)) {
      const s = spot(m, v);
      if (!s) { E.push(`spot "${name}" is not [x, y, dir]`); continue; }
      if (!tileOk(s.x, s.y)) E.push(`spot "${name}" ${where(s.x, s.y)} is outside the map`);
      else if (!open(m, s.x, s.y)) E.push(`spot "${name}" ${where(s.x, s.y)} is on a ${kindAt(m, s.x, s.y)} tile`);
      if (Array.isArray(v) && v[2] !== undefined && !DIRS[v[2]]) E.push(`spot "${name}": bad direction "${v[2]}"`);
    }

    // Warps: every door, mat and stairs has one, and each one lands on a spot.
    const seenWarp = new Set();
    for (const w of m.warps) {
      const at = where(w.x, w.y);
      if (seenWarp.has(at)) E.push(`two warps at ${at}`);
      seenWarp.add(at);
      if (!tileOk(w.x, w.y)) { E.push(`warp ${at} is outside the map`); continue; }
      if (!info(kindAt(m, w.x, w.y)).warp) E.push(`warp ${at} is on a ${kindAt(m, w.x, w.y)} tile (doors D, mats X, stairs ^)`);
      if (typeof w.locked === 'string' && G.Script && !G.Script.get(w.locked)) E.push(`locked door ${at}: unknown script "${w.locked}"`);
      if (!w.to && w.locked) continue;                 // a door that stays locked (for now)
      const t = get(w.to);
      if (!t) { E.push(`warp ${at} goes to the unknown map "${w.to}"`); continue; }
      const s = t.spots[w.spot];
      if (!s) E.push(`warp ${at} goes to ${w.to}, which has no spot "${w.spot}"`);
    }
    let fallChecked = false;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const k = kindAt(m, x, y);
      if (info(k).warp && !m.warpAt.has(key(x, y))) E.push(`${k} at ${where(x, y)} has no warp`);
      if (info(k).fall && !fallChecked) {
        fallChecked = true;
        const f = d.fall, t = f && get(f.to || id);
        if (!t || !t.spots[f.spot]) E.push(`an abyss needs fall: { to, spot } (a spot to land on)`);
      }
    }

    // Connections: the other map exists and connects back.
    for (const [side, c] of Object.entries(m.connect)) {
      if (!SIDES[side]) { E.push(`connect: unknown side "${side}" (north, south, west, east)`); continue; }
      const t = get(c && c.map);
      if (!t) { E.push(`connect ${side}: unknown map "${c && c.map}"`); continue; }
      const back = t.connect[SIDE_OPP[side]];
      if (!back || back.map !== m.id) E.push(`connect ${side} -> ${t.id}: ${t.id} has no ${SIDE_OPP[side]} connection back to ${m.id}`);
      else if ((back.offset | 0) !== -(c.offset | 0)) E.push(`connect ${side} -> ${t.id}: offsets ${c.offset | 0} and ${back.offset | 0} do not match (one must be minus the other)`);
      // The shared edge needs at least one open tile on both sides (or water on both: the sea routes).
      const nb = neighbour(m, side);
      const wet = (mm, x, y) => inside(mm, x, y) && kindAt(mm, x, y) === 'water';
      const both = (x, y, tx, ty) => (open(m, x, y) && open(t, tx, ty)) || (wet(m, x, y) && wet(t, tx, ty));
      let pass = 0;
      if (side === 'north' || side === 'south') {
        const y = side === 'north' ? 0 : m.h - 1, ty = side === 'north' ? t.h - 1 : 0;
        for (let x = 0; x < m.w; x++) if (both(x, y, x - nb.ox, ty)) pass++;
      } else {
        const x = side === 'west' ? 0 : m.w - 1, tx = side === 'west' ? t.w - 1 : 0;
        for (let y = 0; y < m.h; y++) if (both(x, y, tx, y - nb.oy)) pass++;
      }
      if (!pass) E.push(`connect ${side} -> ${t.id}: no open tile lines up on both sides of the edge`);
    }

    // People and objects
    const ids = new Set();
    const known = G.People && G.People.TYPES;
    const person = (p, what) => {
      const at = where(p.x, p.y);
      if (!p.id) E.push(`${what} at ${at} has no id`);
      else if (ids.has(p.id)) E.push(`two people with the id "${p.id}"`);
      ids.add(p.id);
      if (!tileOk(p.x, p.y)) E.push(`${what} "${p.id}" ${at} is outside the map`);
      else if (p.swim ? kindAt(m, p.x, p.y) !== 'water' : !open(m, p.x, p.y)) E.push(`${what} "${p.id}" ${p.swim ? 'swims' : 'stands'} on a ${kindAt(m, p.x, p.y)} tile at ${at}`);
      if (p.mon != null) { if (species(p.mon) == null) E.push(`${what} "${p.id}": unknown Pokémon "${p.mon}"`); }
      else if (known && !known.includes(p.who)) E.push(`${what} "${p.id}": unknown sprite "${p.who}"`);
      if (p.dir && !DIRS[p.dir]) E.push(`${what} "${p.id}": bad direction "${p.dir}"`);
      if (p.move && !MOVES.includes(p.move)) E.push(`${what} "${p.id}": move must be one of ${MOVES.join(', ')}`);
      if (p.script) scriptRef(p.script, `${what} "${p.id}"`);
    };
    const scriptRef = (s, what) => {
      if (Array.isArray(s)) { if (G.Script) G.Script.check(s).forEach(e => E.push(`${what}: ${e}`)); }
      else if (typeof s !== 'string') E.push(`${what}: the script must be a name or a command list`);
      else if (G.Script && !G.Script.get(s)) E.push(`${what}: unknown script "${s}"`);
    };
    for (const p of m.npcs) person(p, 'npc');
    for (const t of m.trainers) {
      person(t, 'trainer');
      if (!(t.sight >= 0 && t.sight <= 8)) E.push(`trainer "${t.id}": sight must be 0..8`);
      if (!t.dir) E.push(`trainer "${t.id}" needs a dir to look along`);
      if (t.win) scriptRef(t.win, `trainer "${t.id}" win`);
      if (t.afterScript) scriptRef(t.afterScript, `trainer "${t.id}" afterScript`);
      if (!Array.isArray(t.team) || !t.team.length) E.push(`trainer "${t.id}" has no team`);
      else for (const mon of t.team) {
        if (!Array.isArray(mon) || species(mon[0]) == null) E.push(`trainer "${t.id}": unknown Pokémon ${JSON.stringify(mon)}`);
        else if (!(mon[1] >= 1 && mon[1] <= 100)) E.push(`trainer "${t.id}": bad level ${mon[1]}`);
      }
    }
    for (const it of m.items) {
      const at = where(it.x, it.y);
      if (!tileOk(it.x, it.y)) E.push(`item at ${at} is outside the map`);
      // (An item with a script may lie on a table: the starter balls in Oak's lab.)
      else if (!it.hidden && !it.script && !open(m, it.x, it.y)) E.push(`item at ${at} is on a ${kindAt(m, it.x, it.y)} tile`);
      if (!it.flag) E.push(`item at ${at} needs a flag (its id once collected)`);
      if (it.script && typeof it.script === 'string' && !G.Script.get(it.script)) E.push(`item at ${at}: unknown script "${it.script}"`);
      if (G.ITEMS && !G.ITEMS[it.item]) E.push(`item at ${at}: unknown item "${it.item}"`);
    }
    // Boulders (Strength): on open ground, unless `fixed` (one that fell into the water from above).
    for (const b of m.def.boulders || []) {
      const at = where(b.x, b.y);
      if (!b.id) E.push(`boulder at ${at} has no id`);
      else if (ids.has(b.id)) E.push(`two things with the id "${b.id}"`);
      ids.add(b.id);
      if (!tileOk(b.x, b.y)) E.push(`boulder "${b.id}" ${at} is outside the map`);
      else if (!b.fixed && (!open(m, b.x, b.y) || info(kindAt(m, b.x, b.y)).warp)) E.push(`boulder "${b.id}" is on a ${kindAt(m, b.x, b.y)} tile at ${at}`);
    }
    // Gates: `bars` rules are rectangles inside the map, over gate tiles.
    for (const [i, r] of (m.def.bars || []).entries()) {
      const w = r.w || 1, h = r.h || 1;
      if (!tileOk(r.x, r.y) || !tileOk(r.x + w - 1, r.y + h - 1)) { E.push(`bars ${i} is outside the map`); continue; }
      for (let y = r.y; y < r.y + h; y++) for (let x = r.x; x < r.x + w; x++) if (kindAt(m, x, y) !== 'bars') E.push(`bars ${i} covers a ${kindAt(m, x, y)} tile at ${where(x, y)}`);
    }
    // Two things on one tile
    const taken = new Map();
    for (const p of [...m.npcs, ...m.trainers, ...m.items.filter(i => !i.hidden), ...(m.def.boulders || [])]) {
      const at = where(p.x, p.y);
      if (taken.has(at) && !(p.if || taken.get(at).if)) E.push(`${taken.get(at).id || taken.get(at).item} and ${p.id || p.item} are both at ${at}`);
      taken.set(at, p);
    }

    // Signs: every S has a text; texts sit on solid tiles you can face.
    for (const [k, text] of Object.entries(m.signs)) {
      const [x, y] = k.split(',').map(Number);
      if (!tileOk(x, y)) E.push(`sign ${k} is outside the map`);
      if (text && typeof text === 'object' && !Array.isArray(text)) { scriptRef(text.script, `sign ${k}`); continue; }
      if (typeof text !== 'string' && !Array.isArray(text)) E.push(`sign ${k}: the text must be a string, a list or { script }`);
    }
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (kindAt(m, x, y) === 'sign' && !m.signs[key(x, y)]) E.push(`sign S at ${where(x, y)} has no text in signs`);
    }

    // Triggers
    m.triggers.forEach((t, i) => {
      const w = t.w || 1, h = t.h || 1;
      if (!tileOk(t.x, t.y) || !tileOk(t.x + w - 1, t.y + h - 1)) E.push(`trigger ${i} (${where(t.x, t.y)} ${w}×${h}) is outside the map`);
      if (!t.script) E.push(`trigger ${i} has no script`);
      else scriptRef(t.script, `trigger ${i}`);
    });
    if (d.enter) scriptRef(d.enter, 'enter');
    // Fly: a town's landing spot.
    if (d.fly && !spot(m, d.fly.spot)) E.push(`fly: no spot "${d.fly.spot}"`);
    if (d.slope && !DIRS[d.slope]) E.push(`slope: bad direction "${d.slope}"`);

    // Encounters
    for (const [method, e] of Object.entries(m.encounters)) {
      if (method === 'water') {
        const a = typeof e === 'string' && e[0] === '@' && G.ENCOUNTERS && G.ENCOUNTERS[e.slice(1)];
        if (G.ENCOUNTERS && !(a && WATERY.some(k => a[k]))) E.push(`encounters.water: "${e}" names no area with water encounters`);
        continue;
      }
      if (typeof e === 'string') {
        if (e[0] !== '@') E.push(`encounters.${method}: use "@area-key" or { rate, mons }`);
        else if (G.ENCOUNTERS && !(G.ENCOUNTERS[e.slice(1)] && G.ENCOUNTERS[e.slice(1)][method]))
          E.push(`encounters.${method}: "${e.slice(1)}" has no ${method} encounters in G.ENCOUNTERS`);
        continue;
      }
      if (!e || !Array.isArray(e.mons) || !(e.rate > 0)) { E.push(`encounters.${method}: needs { rate, mons }`); continue; }
      const sum = e.mons.reduce((a, r) => a + (r[3] || 0), 0);
      if (sum !== 100) E.push(`encounters.${method}: chances add up to ${sum}, not 100`);
      for (const r of e.mons) if (species(r[0]) == null) E.push(`encounters.${method}: unknown Pokémon ${r[0]}`);
    }
    if (m.loc && G.NAMES && G.NAMES.loc && !G.NAMES.loc[m.loc]) E.push(`loc "${m.loc}" has no name in G.NAMES.loc`);
    return E;
  }

  // ---------------- standard interiors ----------------

  /**
   * Pokémon Center: the nurse heals, the PC is on the right.
   * Spots: door (on the mat), heal (in front of the nurse: where you wake up after blacking out).
   */
  function center(id, o = {}) {
    const exit = o.exit || {};
    return def({
      id, loc: o.loc, tileset: 'indoor', palette: 'center', music: o.music || 'center', battleBg: 'indoor',
      rows: [
        'WWWWWWWWWWWWW',
        'WWWWWWWWWWWWW',
        'p++++h+++++P+',
        '++=========++',
        '+++++++++++++',
        '+++++++++++++',
        't+++++++++++t',
        't+++++++++++t',
        '++++++X++++++'
      ],
      warps: [{ x: 6, y: 8, to: exit.map, spot: exit.spot }],
      spots: { door: [6, 8, 'up'], heal: [6, 4, 'up'] },
      npcs: [{ id: 'nurse', who: 'nurse', x: 6, y: 2, dir: 'down', script: [
        ['say', 'Hello, and welcome to the Pokémon Center! We help tired Pokémon get back on their feet.'],
        ['choice', 'Shall I take care of your Pokémon for a moment?', [
          ['say', 'Leave them with me. This will only take a moment.'],
          ['healAnim'], ['heal'], ['lastHeal', 'heal'],
          ['say', 'All done! Your Pokémon are full of energy again.'],
          ['say', 'Come back any time you need us!']
        ], [
          ['say', 'Come back any time you need us!']
        ]]
      ] }].concat(o.npcs || []),
      enter: o.enter
    });
  }

  /** Poké Mart: the clerk behind the counter on the left sells `stock`. Spots: door, shop. */
  function mart(id, o = {}) {
    const exit = o.exit || {};
    return def({
      id, loc: o.loc, tileset: 'indoor', palette: 'mart', music: o.music || 'mart', battleBg: 'indoor',
      rows: [
        'WWWWWWWWWW',
        'WWWWWWWWWW',
        '+=+b+b+b+p',
        '+=+b+b+b++',
        '+=++++++++',
        '+=++++++++',
        'p+++++++++',
        '++++X+++++'
      ],
      warps: [{ x: 4, y: 7, to: exit.map, spot: exit.spot }],
      spots: { door: [4, 7, 'up'], shop: [2, 4, 'left'] },
      npcs: [{ id: 'clerk', who: 'clerk', x: 0, y: 4, dir: 'right', script: o.clerk || [
        ['say', 'Hi there! What can I get for you today?'],
        ['shop', o.stock || ['poke-ball', 'potion', 'antidote', 'paralyze-heal']]
      ] }].concat(o.npcs || []),
      enter: o.enter
    });
  }

  return { TS, KINDS, LEGEND, STAMPS, DIRS, OPP, SIDES, MOVES, WATERY, def, get, all, has, parse, validate,
           inside, kindAt, kindNear, chAt, open, ledge, info, spot, neighbour, neighbours, across, species, encounters, key,
           center, mart, get defs() { return defs; } };
})();
