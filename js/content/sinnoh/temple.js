/* ============ temple.js — Snowpoint Temple and Regigigas ============
 * Chapter 68. Once you have the National Pokédex (flag national-dex) the gentleman at the top of Snowpoint City
 * (snowpoint.js) steps aside from the temple's door. Six floors down: 1F a hall with words carved in its wall; B1F,
 * B2F and B3F ice (you slide until something stops you; the rocks were searched so every floor reaches its ladder down
 * and nobody can get stuck: scratchpad temple_search.py); a cracked rock on B2F (Rock Smash) stands in the only way on;
 * on B3F a Full Restore is hidden in the rock between the two ladders; on B4F a boulder (Strength) shuts the south
 * alcove with a Full Heal. On B5F sits the statue of Regigigas: with Regirock, Regice and Registeel in the party it
 * wakes (wild, level 1 as in Platinum). Caught, it is gone (flag regigigas-caught); beaten, it turns back to stone and
 * can be woken again. The first time, `ending(68)`. A Regi beaten in Hoenn but never caught waits in its chamber
 * again once you have the National Pokédex (hoenn/regis.js), so everyone can bring the three.
 * Platinum's wild Pokémon (PokeAPI) and items; the floors and the words are mine.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const TEMPLE = { loc: 'snowpoint-temple', tileset: 'outdoor', palette: 'seafoam', music: 'cave', battleBg: 'ice', border: '#', cave: true, escape: true };

  // ---------------- 1F: the hall ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint-temple-1f', rows: [
      '####################',
      '####################',
      '##................##',
      '##.......%........##',
      '##..#..........#..##',
      '##................##',
      '##................##',
      '##................##',
      '##..#..........#..##',
      '##................##',
      '##................##',
      '##....#......#....##',
      '##................##',
      '#########O##########'
    ],
    encounters: { walk: '@snowpoint-temple-1f' },
    warps: [{ x: 9, y: 13, to: 'snowpoint', spot: 'temple' }, { x: 9, y: 3, to: 'snowpoint-temple-b1f', spot: 'up' }],
    spots: { door: [9, 12, 'up'], down: [9, 3, 'down'] },
    signs: { '9,1': 'Words are carved deep into the wall: "Far below sleeps the one that pulled the land into place. From rock, from ice and from iron it made three. When the three come home to it, it will stir."' }
  }, TEMPLE, SINNOH));

  // ---------------- B1F: ice ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint-temple-b1f', rows: [
      '####################',
      '#%...###############',
      '#....###############',
      '#iii#iiii#i#iiiiiii#',
      '#iiii#iiiiiiii##i###',
      '#iii#iii#iiiiii#i#i#',
      '#iiiiiiiiiii#iiii#i#',
      '#iiiiiii#iiiiiiiiii#',
      '#iiiiii#iiiiiiiiiii#',
      '##iiiii#iiiiiiiiiii#',
      '#iiiii#iii#iiiiiiii#',
      '#iiii#iiiiiiii#iiii#',
      '################.###',
      '#############%.....#',
      '####################'
    ],
    encounters: { walk: '@snowpoint-temple-b1f' },
    warps: [{ x: 1, y: 1, to: 'snowpoint-temple-1f', spot: 'down' }, { x: 13, y: 13, to: 'snowpoint-temple-b2f', spot: 'up' }],
    spots: { up: [1, 1, 'down'], down: [13, 13, 'right'] },
    items: [{ x: 18, y: 13, item: 'calcium', flag: 'temple-calcium' }]
  }, TEMPLE, SINNOH));

  // ---------------- B2F: ice, and a cracked rock in the only way on ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint-temple-b2f', rows: [
      '####################',
      '###############...%#',
      '###############....#',
      '#ii#iiiiiiiiii#iiii#',
      '#iiiii#i##iiiii#iii#',
      '##iiiiiii#iii##iiii#',
      '#i#i#iiiiiiiiiiiiii#',
      '#iiiiiiiiiiiiiiiiii#',
      '#iii#iiiiii#ii#iiii#',
      '#iii#iiiiiiiiiiiii##',
      '##iiiii#iiiiiiiiiii#',
      '#iiii#iiiiiiiiiiii##',
      '###k################',
      '#%.....#############',
      '####################'
    ],
    encounters: { walk: '@snowpoint-temple-b2f' },
    warps: [{ x: 18, y: 1, to: 'snowpoint-temple-b1f', spot: 'down' }, { x: 1, y: 13, to: 'snowpoint-temple-b3f', spot: 'up' }],
    spots: { up: [18, 1, 'down'], down: [1, 13, 'right'] }
  }, TEMPLE, SINNOH));

  // ---------------- B3F: ice between two ladders, a Full Restore in the rock between them ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint-temple-b3f', rows: [
      '####################',
      '#%...#...%##########',
      '###.###.############',
      '#iii#iii#iiiiiiiiii#',
      '#iiiiiiiiiiii#ii#ii#',
      '#iii#iiiiiiiiiii#ii#',
      '#iiiiiiiiiii#ii###i#',
      '#iiiiii##iii#iiiii##',
      '##iiiiii#iiiiiiiiii#',
      '#iiiiii#i#iiiiiiiii#',
      '#iiiiiiiiiiiii#iiii#',
      '##iiiii#iiiiiiiiiii#',
      '#iiiiiiiiiii#iiiiii#',
      '####################'
    ],
    encounters: { walk: '@snowpoint-temple-b3f' },
    warps: [{ x: 1, y: 1, to: 'snowpoint-temple-b2f', spot: 'down' }, { x: 9, y: 1, to: 'snowpoint-temple-b4f', spot: 'up' }],
    spots: { up: [1, 1, 'right'], down: [9, 1, 'left'] },
    items: [{ x: 5, y: 1, item: 'full-restore', flag: 'temple-full-restore', hidden: true }]
  }, TEMPLE, SINNOH));

  // ---------------- B4F: a boulder before the south alcove ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint-temple-b4f', rows: [
      '####################',
      '#.%................#',
      '#...........#......#',
      '#....#.............#',
      '#........iiiiii....#',
      '#........iiiiii....#',
      '#..#.....iiiiii....#',
      '#.....#........#...#',
      '#................%.#',
      '#..................#',
      '######.#############',
      '##.......###########',
      '##.......###########',
      '####################',
      '####################'
    ],
    encounters: { walk: '@snowpoint-temple-b4f' },
    warps: [{ x: 2, y: 1, to: 'snowpoint-temple-b3f', spot: 'down' }, { x: 17, y: 8, to: 'snowpoint-temple-b5f', spot: 'up' }],
    spots: { up: [2, 1, 'down'], down: [17, 8, 'left'] },
    boulders: [{ id: 'alcove', x: 6, y: 10 }],
    items: [{ x: 2, y: 12, item: 'full-heal', flag: 'temple-full-heal' }]
  }, TEMPLE, SINNOH));

  // ---------------- B5F: Regigigas ----------------
  G.Maps.def(Object.assign({
    id: 'snowpoint-temple-b5f', rows: [
      '####################',
      '####################',
      '##................##',
      '##..#..iiiii..#...##',
      '##.....iiiii......##',
      '##.....ii.ii......##',
      '##.....iiiii......##',
      '##..#..iiiii..#...##',
      '##................##',
      '##................##',
      '##................##',
      '##..#.........#...##',
      '##................##',
      '#########%##########',
      '####################'
    ],
    encounters: { walk: '@snowpoint-temple-b5f' },
    warps: [{ x: 9, y: 13, to: 'snowpoint-temple-b4f', spot: 'down' }],
    spots: { up: [9, 13, 'up'] },
    npcs: [{ id: 'regigigas', who: 'regigigas', mon: 'regigigas', x: 9, y: 5, dir: 'down', fixed: true, if: '!regigigas-caught', script: 'temple.regigigas' }]
  }, TEMPLE, SINNOH));

  // ---------------- Regigigas ----------------
  const THREE = [377, 378, 379];          // Regirock, Regice, Registeel
  async function regigigas(h) {
    const F = G.Field;
    const vars = { mon: G.Names.mon(486), rock: G.Names.mon(377), ice: G.Names.mon(378), steel: G.Names.mon(379) };
    if (!THREE.every(sp => F.party().some(m => m.sp === sp))) {
      await h.say(T('A colossal statue sits in the cold. Three marks are carved at its feet: one of rock, one of ice, one of iron. It does not move.'));
      return;
    }
    await h.say(T('{rock}, {ice} and {steel} stir in their Poké Balls, as if something were calling them home.'), { vars });
    await h.say(T('Light flickers in the statue\'s eyes. {mon} is moving!'), { vars });
    h.sfx('cry');
    await h.wild(486, 1, {});
    const r = F.lastBattle;
    if (r === 'run' || r === 'lose') return;
    if (r === 'caught') { F.setFlag('regigigas-caught'); h.hide('regigigas'); }
    else await h.say(T('The light went out of its eyes. {mon} sits as still as stone again.'), { vars });
    if (F.flag('chapter-68-done')) return;
    // The end of the sixty-eighth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(68); else F.setFlag('chapter-68-done');
  }

  G.Script.def({ 'temple.regigigas': [['js', regigigas]] });
})();
