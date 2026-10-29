/* ============ silver.js — Route 28 and Mt. Silver ============
 * Chapter 27, the end of the journey through Kanto and Johto. Once Mr. Pokémon has the Red Scale
 * (flag got-exp-share), the Pokémon League Front Gate (victory.js) opens its south door to Route 28
 * (`silver.closed` before). Route 28 runs west to the foot of Mt. Silver: a Pokémon Center, then a
 * river (Surf) and falls (Waterfall) up to the cave. 1F: cracked rocks (Rock Smash) on the way to
 * the ladder, a boulder (Strength) before a corner with an item. 2F: dark (Flash), an underground
 * lake (Surf). 3F: falls (Waterfall) up to the way out. The summit: snow, no wild Pokémon, and the
 * rival from Kanto, who left the League after you beat him and has trained up here ever since
 * (flag silver-met; his strongest team, holding items, Lv. 71-76; flag silver-beaten, then
 * `ending(27)`). He stays for a battle whenever you come back. The games' wild Pokémon all the way
 * (Larvitar among them). Eleven items.
 */
(() => {
  const T = s => G.T(s);
  const RIVAL = { name: '{rival}' };
  const CAVE = { loc: 'mt-silver', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true };

  // ---------------- Route 28 ----------------
  G.Maps.def({
    id: 'route28', loc: 'kanto-route-28', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..............................T',
      'T.."""""""".TTTT.........HHHH..T',
      'T.."""""""".TTTT.........HHHH..T',
      'T.."""""""".TTTT.........HDHH..T',
      'T..""""""""...............,....T',
      'T.........................,S...T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
      'T..............................T',
      'T.............""""""""..~~~~~~.T',
      'T...TTTTT.....""""""""..~~~~~~.T',
      'T...TTTTT.....""""""""..~~~~~~.T',
      'T...TTTTT.....""""""""..~~~~~~.T',
      'T..............................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'mt-silver', offset: -11 } },
    warps: [{ x: 26, y: 4, to: 'route22-gate', spot: 'south' }],
    spots: { gate: [26, 5, 'down'] },
    signs: { '27,6': 'Route 28. West: Mt. Silver. Only Trainers who have proven themselves may climb it.' },
    items: [{ x: 9, y: 13, item: 'ultra-ball', flag: 'route28-ultraball' }, { x: 29, y: 2, item: 'hyper-potion', flag: 'route28-hyperpotion' }],
    encounters: { walk: '@kanto-route-28-area' }
  });

  // ---------------- the foot of Mt. Silver ----------------
  G.Maps.def({
    id: 'mt-silver', loc: 'mt-silver', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: '#',
    rows: [
      '##############################',
      '##############################',
      '###############O##############',
      '##########...........~~~~#####',
      '##########...........~~~~#####',
      '##########...........~~~~#####',
      '#######################|######',
      '#######################|######',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#............................#',
      '#.TT................"""""""..#',
      '#.T.........TT......"""""""..#',
      '#...CCCCC..........."""""""..#',
      '#...CCCCC..........."""""""..#',
      '#...CCCCC....................#',
      '#...CCDCC....................#',
      '#.....,,,,,,,,,,,,,,,,,,,,,,,,',
      '#.....,,,,,,,,,,,,,,,,,,,,,,,,',
      '#............................#',
      '#............."""""""""......#',
      '#............."""""""""...TT.#',
      '#............."""""""""...TT.#',
      '#............................#',
      '##############################'
    ],
    connect: { east: { map: 'route28', offset: 11 } },
    warps: [{ x: 6, y: 17, to: 'mt-silver-center', spot: 'door' }, { x: 15, y: 2, to: 'mt-silver-1f', spot: 'mouth' }],
    spots: { 'center-door': [6, 18, 'down'], mouth: [15, 3, 'down'] },
    items: [{ x: 1, y: 24, item: 'max-revive', flag: 'silver-foot-maxrevive' }, { x: 11, y: 3, item: 'pp-up', flag: 'silver-foot-ppup' }],
    encounters: { walk: '@mt-silver-outside', water: '@mt-silver-outside' }
  });

  G.Maps.center('mt-silver-center', {
    loc: 'mt-silver', exit: { map: 'mt-silver', spot: 'center-door' },
    npcs: [{ id: 'oldman', who: 'oldman', x: 9, y: 5, move: 'look',
             say: 'Only the strongest Trainers come this far. They say someone has been living at the top of the mountain for months.' }]
  });

  // ---------------- the cave ----------------
  G.Maps.def(Object.assign({
    id: 'mt-silver-1f',
    rows: [
      '############################',
      '############################',
      '###.........%.##############',
      '###....#......##############',
      '###...........##############',
      '###...#################...##',
      '###...#################...##',
      '###...#################...##',
      '###...#################...##',
      '###.k.#################...##',
      '###...#################...##',
      '###...#################...##',
      '###...#################...##',
      '###...#####.......#####...##',
      '###...####.........####...##',
      '###......#....#....####...##',
      '###......k................##',
      '###......#.........####...##',
      '##########.........#########',
      '##############O#############'
    ],
    warps: [{ x: 14, y: 19, to: 'mt-silver', spot: 'mouth' }, { x: 12, y: 2, to: 'mt-silver-2f', spot: 'ladder' }],
    spots: { mouth: [14, 18, 'up'], ladder: [12, 2, 'down'] },
    boulders: [{ id: 'east', x: 20, y: 16 }],
    items: [{ x: 24, y: 5, item: 'full-restore', flag: 'silver-1f-fullrestore' }, { x: 3, y: 2, item: 'ultra-ball', flag: 'silver-1f-ultraball' }],
    encounters: { walk: '@mt-silver-1f' }
  }, CAVE));

  G.Maps.def(Object.assign({
    id: 'mt-silver-2f', dark: true,
    rows: [
      '############################',
      '############################',
      '############################',
      '###############.........%.##',
      '##############............##',
      '##############............##',
      '##############~~~~~~~~~~~~##',
      '##############~~~~~~~~~~~~##',
      '##############~~~~~~~~~~~~##',
      '##############~~~~~~~~~~~~##',
      '##############~~~~...~~~~~##',
      '##############~~~~...~~~~~##',
      '##############~~~~...~~~~~##',
      '##############~~~~~~~~~~~~##',
      '##############~~~~~~~~~~~~##',
      '###.......####~~~~~~~~~~~~##',
      '##............~~~~~~~~~~~~##',
      '##............~~~~~~~~~~~~##',
      '##.%..........~~~~~~~~~~~~##',
      '##.......#####~~~~~~~~~~~~##',
      '############################',
      '############################'
    ],
    warps: [{ x: 3, y: 18, to: 'mt-silver-1f', spot: 'ladder' }, { x: 24, y: 3, to: 'mt-silver-3f', spot: 'ladder' }],
    spots: { ladder: [3, 18, 'down'], up: [24, 3, 'down'] },
    items: [{ x: 19, y: 11, item: 'max-elixir', flag: 'silver-2f-maxelixir' }, { x: 25, y: 3, item: 'rare-candy', flag: 'silver-2f-rarecandy' }],
    encounters: { walk: '@mt-silver-2f' }
  }, CAVE));

  G.Maps.def(Object.assign({
    id: 'mt-silver-3f',
    rows: [
      '##########################',
      '##########################',
      '############O#############',
      '########...............###',
      '########...............###',
      '########...............###',
      '###....######~~~~~~~~~~###',
      '###....######~~~~~~~~~~###',
      '###....######~~~~~~~~~~###',
      '###....######~~~~~~~~~~###',
      '###....##########|########',
      '###....##########|########',
      '###....######~~~~~~~~~~###',
      '###....######~~~~~~~~~~###',
      '###..........~~~~~~~~~~###',
      '##...........~~~~~~~~~~###',
      '##...........~~~~~~~~~~###',
      '##.%.........~~~~~~~~~~###',
      '##..........##############',
      '##########################'
    ],
    warps: [{ x: 3, y: 17, to: 'mt-silver-2f', spot: 'up' }, { x: 12, y: 2, to: 'mt-silver-summit', spot: 'mouth' }],
    spots: { ladder: [3, 17, 'down'], mouth: [12, 3, 'down'] },
    items: [{ x: 3, y: 6, item: 'pp-max', flag: 'silver-3f-ppmax' }, { x: 22, y: 3, item: 'max-revive', flag: 'silver-3f-maxrevive' }],
    encounters: { walk: '@mt-silver-3f' }
  }, CAVE));

  // ---------------- the summit ----------------
  G.Maps.def({
    id: 'mt-silver-summit', loc: 'mt-silver', tileset: 'outdoor', palette: 'snow', music: 'cave', battleBg: 'cave', border: '#',
    snow: true, escape: true,
    rows: [
      '################',
      '################',
      '#####......#####',
      '####.........###',
      '###..........###',
      '###..........###',
      '###.......T..###',
      '###..T.......###',
      '###..........###',
      '###.T........###',
      '###..........###',
      '####........####',
      '#######O########',
      '################'
    ],
    warps: [{ x: 7, y: 12, to: 'mt-silver-3f', spot: 'mouth' }],
    spots: { mouth: [7, 11, 'up'] },
    triggers: [{ x: 3, y: 5, w: 10, h: 1, if: '!silver-met', script: 'silver.rival' }],
    npcs: [{ id: 'rival', who: 'rival', x: 7, y: 3, dir: 'down', script: 'silver.rival' }]
  });

  // ---------------- the rival at the summit ----------------
  const MV = {
    pidgeot: ['aerial-ace', 'wing-attack', 'quick-attack', 'feather-dance'], alakazam: ['psychic', 'shadow-ball', 'calm-mind', 'recover'],
    tyranitar: ['crunch', 'earthquake', 'rock-slide', 'dragon-dance'], gyarados: ['hydro-pump', 'crunch', 'dragon-dance', 'earthquake'],
    arcanine: ['flamethrower', 'extreme-speed', 'crunch', 'roar'], exeggutor: ['psychic', 'giga-drain', 'stomp', 'sleep-powder'],
    venusaur: ['solar-beam', 'sludge-bomb', 'earthquake', 'growth'], charizard: ['flamethrower', 'aerial-ace', 'earthquake', 'dragon-claw'],
    blastoise: ['hydro-pump', 'ice-beam', 'crunch', 'rapid-spin']
  };
  // What each one holds (chapter 26's held items).
  const HELD = {
    pidgeot: 'sharp-beak', alakazam: 'twisted-spoon', tyranitar: 'leftovers', gyarados: 'sitrus-berry', arcanine: 'charcoal',
    exeggutor: 'miracle-seed', venusaur: 'miracle-seed', charizard: 'charcoal', blastoise: 'mystic-water'
  };
  const FINAL = { 1: 'venusaur', 4: 'charizard', 7: 'blastoise' };
  const MIDDLE = { 1: ['gyarados', 'arcanine'], 4: ['exeggutor', 'gyarados'], 7: ['arcanine', 'exeggutor'] };
  const mon = (sp, lvl) => [sp, lvl, MV[sp], HELD[sp]];
  /** His team at the summit, by the starter he chose in Pallet Town. */
  const silverTeam = st => [mon('pidgeot', 71), mon('alakazam', 72), mon('tyranitar', 72),
    ...(MIDDLE[st] || MIDDLE[1]).map(sp => mon(sp, 71)), mon(FINAL[st] || 'venusaur', 76)];
  G.Silver = { silverTeam };

  const battle = (h, S) => h.battle({ id: 'rival-silver', who: 'rival', cls: 'champion', name: S.rival.name, leader: true, ai: 'leader',
    music: 'league', team: silverTeam(S.rival.starter) }, {});

  async function rival(h) {
    const F = G.Field, S = F.save;
    h.face('player', 'up');
    h.face('rival', 'down');
    if (F.flag('silver-beaten')) {
      await h.say(T('{player}. I have trained every day since our last battle. Ready for another one?'), RIVAL);
      if (await h.choice(T('Battle {rival} again?'), {}) !== 0) return;
      if (await battle(h, S) === 'win') await h.say(T('Still you, huh? Next time, then.'), RIVAL);
      return;
    }
    if (!F.flag('silver-met')) {
      F.setFlag('silver-met');
      h.emote('rival', '!');
      await h.say(T('{player}... So you climbed all the way up here.'), RIVAL);
      await h.say(T('After you beat me, I left the League and came up this mountain. Just me and my Pokémon, the wind and the snow.'), RIVAL);
      await h.say(T('I wanted to find out what you have that I do not. Up here, I think I finally understand.'), RIVAL);
    }
    await h.say(T('Enough talk. Show me everything you have, Champion of Kanto and Johto!'), RIVAL);
    if (await battle(h, S) !== 'win') return;
    F.setFlag('silver-beaten');
    await h.say(T('...Ha. You beat me again. But it was close this time. I could feel it.'), RIVAL);
    await h.say(T('I am staying up here a while longer. Come back whenever you want a real battle.'), RIVAL);
    if (G.CreditsUI) await G.CreditsUI.ending(27); else F.setFlag('chapter-27-done');
  }

  G.Script.def({
    'silver.rival': [['js', rival]],
    'silver.closed': [['say', 'The way to Route 28 and Mt. Silver. Closed while the rangers check the mountain paths after the earthquake.']]
  });
})();
