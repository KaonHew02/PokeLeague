/* ============ fuego.js — Fuego Ironworks ============
 * Chapter 73. North of Floaroma Meadow (floaroma.js) a path leads to the ironworks' grounds: a river to Surf across,
 * the works on the far bank, TM35 and a Calcium on the ground, Platinum's wild Pokémon (by time of day). Inside,
 * conveyor belts (the spin tiles of Kanto's Rocket Hideout: you ride until a stop tile) and three Workers with
 * Platinum's teams; the belts were searched so every place reaches Mr. Fuego, each Worker and the door (scratchpad
 * c73_maps.py). Mr. Fuego trades Star Pieces for shards in Platinum; the game has no shards, so he gives a Fire Stone, as
 * in Diamond and Pearl (flag fuego-stone). The works can be visited in the middle of the game, so `ending(73)` comes
 * from him only once chapter 72 is done. The grounds, the belts and the words are mine. Left out: the shards, the
 * Dowsing Machine's items, the Poké Radar, Honey trees, rematches; the way up the river from Route 205 (Route 205's
 * north edge already leads to Eterna Forest).
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const FUEGO = { name: 'Mr. Fuego' };

  // ---------------- The grounds ----------------
  G.Maps.def(Object.assign({
    id: 'fuego-ironworks', loc: 'fuego-ironworks', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T............................T',
      'T.""""""....BBBBBB..T........T',
      'T.""""""....BBBBBB......T....T',
      'T.""""""....BBBBBB...........T',
      'T.""""""....BBDBBB...."""""..T',
      'T.""""""......,..S...."""""..T',
      'T.............,......."""""..T',
      'T.............,..............T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
      'T.............,,.............T',
      'T.."""""""....,,..T..........T',
      'T.."""""""....,,...""""""""..T',
      'T..""""""".T..,,...""""""""..T',
      'T.."""""""....,,...""""""""..T',
      'T.."""""""....,,...""""""""..T',
      'T.........T...,,...""""""""..T',
      'T.............,,.............T',
      'T.............,,.............T',
      'T.............,,.............T',
      'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'floaroma-meadow', offset: 3 } },
    encounters: { walk: '@fuego-ironworks-area', water: '@fuego-ironworks-area' },
    warps: [{ x: 14, y: 5, to: 'fuego-inside', spot: 'door' }],
    spots: { door: [14, 6, 'down'] },
    signs: { '17,6': 'Fuego Ironworks. Iron goes in, wonders come out!' },
    items: [{ x: 21, y: 3, item: 'tm35', flag: 'fuego-tm35' }, { x: 4, y: 17, item: 'calcium', flag: 'fuego-calcium' }]
  }, SINNOH));

  // ---------------- The works: conveyor belts ----------------
  G.Maps.def(Object.assign({
    id: 'fuego-inside', loc: 'fuego-ironworks', tileset: 'indoor', palette: 'hideout', music: 'cave', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'bbbbbbb++++++bbbbbbb',
      'b++toDto+++++++++++b',
      'b+D++++t+++UU++L+U+b',
      'bDbU+++++tL++++L+oob',
      'b++++tR++++b++o++++b',
      'b+R++++++DLo+RDR+++b',
      'b+D++U+Lo+U++RDt+D+b',
      'b++++D+DbtDR++oDU+bb',
      'bLD+t+bL+++R+o+++++b',
      'b+++D+++o+++++++U+Db',
      'b++++++++++++++++++b',
      'b++++++++X+++++++++b'
    ],
    warps: [{ x: 9, y: 13, to: 'fuego-ironworks', spot: 'door' }],
    spots: { door: [9, 13, 'up'] },
    npcs: [{ id: 'fuego', who: 'hiker', x: 9, y: 3, dir: 'down', script: 'fuego.fuego' }],
    trainers: [
      { id: 'dillan', who: 'engineer', cls: 'worker', name: 'Dillan', x: 3, y: 9, dir: 'right', sight: 2,
        before: 'No visitors on the factory floor! Unless they can battle!',
        defeat: 'Back to the furnace for me.',
        after: 'Mind the belts. They do not stop for anyone.',
        team: [['machop', 33, ['seismic-toss', 'revenge', 'vital-throw', 'submission']], ['machoke', 33, ['seismic-toss', 'revenge', 'vital-throw', 'submission']]] },
      { id: 'holden', who: 'engineer', cls: 'worker', name: 'Holden', x: 16, y: 6, dir: 'left', sight: 2,
        before: 'These Magnemite keep the machines running. Want to feel the current?',
        defeat: 'Short circuit!',
        after: 'Magnemite stick to the iron here. Sometimes I have to peel them off.',
        team: [['magnemite', 32, ['thunder-wave', 'spark', 'lock-on', 'magnet-bomb']], ['magnemite', 32, ['thunder-wave', 'spark', 'lock-on', 'magnet-bomb']],
               ['magnemite', 32, ['thunder-wave', 'spark', 'lock-on', 'magnet-bomb']]] },
      { id: 'conrad', who: 'engineer', cls: 'worker', name: 'Conrad', x: 12, y: 11, dir: 'up', sight: 2,
        before: 'Magmar keeps the furnace hot. Let us see if you can take the heat!',
        defeat: 'You cooled us right down.',
        after: 'Mr. Fuego says the hottest iron makes the best steel. I think he means people too.',
        team: [['magmar', 35, ['feint-attack', 'fire-spin', 'confuse-ray', 'fire-punch']]] }
    ]
  }, SINNOH));

  // ---------------- Mr. Fuego ----------------
  async function fuego(h) {
    const F = G.Field;
    if (!F.flag('fuego-stone')) {
      await h.say(T('Ho! A visitor who rode my belts all the way here! I am Fuego, and this is my ironworks.'), FUEGO);
      await h.say(T('Anyone who makes it this far gets a present. Here: a stone with a fire burning inside it.'), FUEGO);
      F.giveItem('fire-stone', 1);
      F.setFlag('fuego-stone');
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('fire-stone') } });
      await j;
      await h.say(T('Some Pokémon change when they touch it. Find out which!'), FUEGO);
    } else await h.say(T('Fire and iron, that is all I need. Well, and my belts.'), FUEGO);
    if (!F.flag('chapter-72-done') || F.flag('chapter-73-done')) return;
    // The end of the seventy-third chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(73); else F.setFlag('chapter-73-done');
  }

  G.Script.def({ 'fuego.fuego': [['js', fuego]] });
})();
