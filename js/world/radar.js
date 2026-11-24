/* ============ radar.js — G.Radar: Platinum's Poké Radar (chapter 106) ============
 * From the pret/pokeplatinum decompilation: src/pokeradar.c (the patches, the chain, the shiny chance, the battery),
 * src/overlay006/wild_encounters.c (TryGenerateGrassEncounter_WithRadar and the two CreateWildMon_FromRadar...),
 * src/encounter.c (what a battle does to the chain), src/item_use_functions.c (CanUsePokeRadar: field.js and the Bag).
 *
 * Used in tall grass with a full battery (50 steps, counted while the radar is in the Bag), it makes up to four patches
 * shake, one on each ring around you (4, 3, 2 and 1 tiles away), only on tall grass. Stepping into one starts a battle:
 * the first starts the chain with a Pokémon drawn from the table (a patch shaking hard draws from the map's `radar`
 * table, which has the Pokémon only the radar finds). After a battle won or a Pokémon caught, new patches shake around
 * you; each one continues the chain (the same species at the same level, the chain one longer) with a chance that falls
 * with the ring (88, 68, 48, 28 % after a win; 98, 78, 58, 38 % after a catch); one that does not draws again, and
 * another species ends the chain. A patch that continues it may hold a shiny Pokémon: 1 in (8200 - 200 x chain), at
 * best 1 in 200. Running away, the foe fleeing, a black-out, another battle, the Bicycle, another map, or every patch out
 * of sight (Platinum's screen: 8 tiles across, 6 up or down) end the chain. The chain is not saved (Platinum keeps it in
 * memory); the battery is (var radar-charge).
 *   G.Radar.STEPS · has() · charge() · step() · use(map, x, y, rng) -> { res: 'dry', left } | { res: 'quiet' } | { res: 'shake' }
 *   enter(map, x, y, rng, draw) -> a wild Pokémon { sp, lvl, shiny, radar: true } or null · after(out, rng, radar)
 *   view(x, y) · clear() · active(mapId) · count() · species() · patches() · tick(dt) · shinyChance(count, rng)
 */
G.Radar = (() => {
  const STEPS = 50;                          // RADAR_BATTERY_STEPS
  const RING_TILES = [32, 24, 16, 8];        // the tiles of each ring, the outermost (4 tiles away) first
  const NORMAL = [88, 68, 48, 28];           // CheckPatchContinueChain: after a win
  const BOOSTED = [98, 78, 58, 38];          // after a catch
  const SHAKE_TIME = 2;                      // seconds the patches shake (Platinum's field effect plays once)
  const VIEW = [8, 6];                       // PokeRadar_ClearIfAllOutOfView: the screen around you, in tiles
  const MAX = 999;                           // IncWithCap

  const blank = () => ({ map: null, active: false, started: false, count: 0, sp: 0, lvl: 0, shake: 'soft', radarBattle: false, patches: [], t: 0 });
  let chain = blank();

  const F = () => G.Field;
  const has = () => F().count('poke-radar') > 0;
  const charge = () => Math.max(0, Math.min(STEPS, +F().getVar('radar-charge') || 0));
  /** RadarChargeStep: one step more while the radar is in the Bag, up to 50. */
  function step() { if (has() && charge() < STEPS) F().setVar('radar-charge', charge() + 1); }
  /** RadarChain_Clear. */
  function clear() { chain = blank(); }
  const grass = (map, x, y) => !map.def.underwater && G.Maps.inside(map, x, y) && G.Maps.kindAt(map, x, y) === 'tall';

  /** RadarSpawnPatches: one tile on each ring, picked as Platinum picks it; a patch only on tall grass. None: the end. */
  function spawn(map, x, y, rng) {
    chain.map = map.id;
    chain.patches = [];
    for (let ring = 0; ring < 4; ring++) {
      const n = rng.int(0, RING_TILES[ring] - 1), side = 9 - 2 * ring, row = Math.floor(n / side);
      let dx, dy;
      if (row === 0) { dx = ring + n % side; dy = ring; }
      else if (row === 1) { dx = ring + n % side; dy = ring + side - 1; }
      else { const k = n - 2 * side; dy = ring + (k >> 1) + 1; dx = k % 2 === 0 ? ring : ring + side - 1; }
      const px = x - 4 + dx, py = y - 4 + dy;
      if (grass(map, px, py)) chain.patches.push({ ring, x: px, y: py, cont: false, shake: 'soft', shiny: false });
    }
    if (!chain.patches.length) { clear(); return false; }
    chain.active = true;
    return true;
  }

  /** CheckPatchShiny: none before the chain has begun; 1 in (8200 - 200 x chain), 1 in 200 at best. */
  function shinyChance(count, rng) {
    if (!count) return false;
    return rng.int(0, Math.max(200, 8200 - count * 200) - 1) === 0;
  }

  /** SetupGrassPatches: which patches continue the chain (by ring, after a win or a catch), how each one shakes. */
  function setup(result, rng) {
    const rates = result === 'caught' ? BOOSTED : NORMAL;
    for (const p of chain.patches) {
      p.cont = rng.int(0, 99) < rates[p.ring];
      if (!p.cont) { p.shake = rng.int(0, 99) < 50 ? 'soft' : 'hard'; p.shiny = false; }
      else { p.shake = chain.shake; p.shiny = shinyChance(chain.count, rng); }
    }
    chain.t = SHAKE_TIME;
  }

  /** RefreshRadarChain: the battery full, the patches shake (a chain already going goes on); else why not. */
  function use(map, x, y, rng) {
    const c = charge();
    if (c < STEPS) return { res: 'dry', left: STEPS - c };
    F().setVar('radar-charge', 0);
    if (!spawn(map, x, y, rng)) return { res: 'quiet' };
    setup('win', rng);
    return { res: 'shake' };
  }

  /**
   * A step onto tile (x, y) (PokeRadar_ShouldDoRadarEncounter, TryGenerateGrassEncounter_WithRadar). In a patch: the wild
   * Pokémon it holds, then the next patches around you (they shake after the battle). draw(table): the field's own draw
   * from a table (Magnet Pull and Static as on any step). -> { sp, lvl, shiny, radar: true }, or null (no patch here)
   */
  function enter(map, x, y, rng, draw) {
    if (!chain.active || chain.map !== map.id) return null;
    const p = chain.patches.find(q => q.x === x && q.y === y);
    if (!p) return null;
    chain.radarBattle = true;
    let keep = false;
    if (chain.started && p.cont) { chain.count = Math.min(MAX, chain.count + 1); keep = true; }
    else { chain.started = true; chain.shake = p.shake; }
    let wild;
    if (keep) wild = { sp: chain.sp, lvl: chain.lvl, shiny: p.shiny };       // CreateWildMon_FromRadarKeepChain
    else {
      // CreateWildMon_FromRadarNoChain: drawn again (a patch shaking hard from the radar's table); the same species goes on.
      const table = (p.shake === 'hard' && G.Maps.encounters(map, 'radar')) || G.Maps.encounters(map, 'walk');
      wild = Object.assign({}, draw(table), { shiny: false });
      if (!chain.sp) { chain.sp = wild.sp; chain.lvl = wild.lvl; chain.count = Math.min(MAX, chain.count + 1); }
      else if (wild.sp === chain.sp) { wild.lvl = chain.lvl; chain.count = Math.min(MAX, chain.count + 1); }
      else clear();                       // another species: the chain ends (with the battle: nothing shakes after it)
    }
    if (chain.active) spawn(map, x, y, rng);
    return Object.assign(wild, { radar: true });
  }

  /**
   * After a wild battle (encounter.c): a radar battle won or a Pokémon caught keeps the chain and the new patches shake;
   * running away, losing, the foe fleeing, or a battle that was not the radar's end it.
   */
  function after(out, rng, radar) {
    if (!chain.active) return;
    if (radar && chain.radarBattle && (out === 'win' || out === 'caught')) setup(out, rng);
    else clear();
  }

  /** PokeRadar_ClearIfAllOutOfView: a patch out of sight is gone; all of them gone, the chain ends. */
  function view(x, y) {
    if (!chain.active) return;
    chain.patches = chain.patches.filter(p => Math.abs(p.x - x) <= VIEW[0] && Math.abs(p.y - y) <= VIEW[1]);
    if (!chain.patches.length) clear();
  }

  const active = mapId => chain.active && (mapId == null || chain.map === mapId);
  /** The patches while they shake, to draw: { x, y, kind: 'soft' | 'hard' | 'shiny', t (seconds left) }. */
  const patches = () => (chain.active && chain.t > 0 ? chain.patches.map(p => ({ x: p.x, y: p.y, kind: p.shiny ? 'shiny' : p.shake, t: chain.t })) : []);
  function tick(dt) { if (chain.t > 0) chain.t = Math.max(0, chain.t - dt); }

  return {
    STEPS, has, charge, step, use, enter, after, view, clear, active, patches, tick, shinyChance,
    count: () => chain.count, species: () => chain.sp,
    /** For tests: the patches and the chain as they are. */
    get state() { return chain; }
  };
})();
