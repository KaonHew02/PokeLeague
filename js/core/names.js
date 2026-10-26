/* ============ names.js — official names in the player's language ============
 * Pokémon, moves, items, types, places, natures and Pokédex categories are
 * not translated with dictionaries: tools/fetch_data.py downloads their
 * official names from PokeAPI into G.NAMES (js/data/names.js):
 *
 *   G.NAMES = { langs: ['en','es','fr','it','zh-Hans','zh-Hant'],
 *               mon: { 1: ['Bulbasaur', 'Bulbasaur', 'Bulbizarre', ...] }, move: {...}, ... }
 *
 * Brazilian Portuguese uses the English names (as the games do). A missing
 * name falls back to English, then to a readable version of the id.
 *
 *   G.Names.mon(25) · G.Names.move('thunder-shock') · G.Names.item('potion')
 *   G.Names.type('fire') · G.Names.loc('viridian-city') · G.Names.nature('adamant')
 *   G.Names.desc('mon' | 'move' | 'item', id)   the Pokédex entry / description (G.DEX_TEXT)
 */
G.Names = (() => {
  let col = -1;
  function column() {
    if (col >= 0) return col;
    const N = G.NAMES;
    if (!N) return 0;
    const l = G.I18n.lang === 'pt-BR' ? 'en' : G.I18n.lang;
    col = Math.max(0, N.langs.indexOf(l));
    return col;
  }
  /** 'viridian-city' -> 'Viridian City' (only used when the data has no name). */
  const pretty = id => String(id).split('-').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');

  // Official names PokeAPI does not have yet (same columns as G.NAMES.langs).
  const FIX = {
    loc: {
      'kanto-underground-path': ['Underground Path', 'Paso Subterráneo', 'Souterrain', 'Sotterraneo', '地下通道', '地下通道'],
      'ss-anne': ['S.S. Anne', 'S.S. Anne', "L'Océane", 'S.S. Anne', '圣特安努号', '聖特安努號'],
      'rock-tunnel': ['Rock Tunnel', 'Túnel Roca', 'Grotte', 'Tunnel Roccioso', '岩山隧道', '岩山隧道']
    }
  };

  function get(kind, id) {
    const row = (FIX[kind] && FIX[kind][id]) || (G.NAMES && G.NAMES[kind] && G.NAMES[kind][id]);
    if (row) return row[column()] || row[0];
    if (kind === 'mon') {
      const sp = G.SPECIES && G.SPECIES[id];
      return sp ? pretty(sp.slug) : '#' + id;
    }
    return pretty(id);
  }

  /** Pokédex entry, move or item description (G.DEX_TEXT) in the player's language, else English, else ''. */
  function desc(kind, id) {
    const row = G.DEX_TEXT && G.DEX_TEXT[kind] && G.DEX_TEXT[kind][id];
    return row ? row[column()] || row[0] || '' : '';
  }

  const api = { get, pretty, desc };
  for (const k of ['mon', 'move', 'item', 'type', 'loc', 'nature', 'genus', 'stat']) api[k] = id => get(k, id);
  return api;
})();
