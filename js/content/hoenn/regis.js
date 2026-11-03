/* ============ regis.js — Route 105, the desert, the Sealed Chamber and the three Regis ============
 * Chapter 41, Hoenn after the League. Three ruins have walls of braille (G.U.braille): the Island Cave on
 * Route 105 (a new sea route from Route 104 down to Route 106), the Desert Ruins in the desert north of
 * Route 111 (its sandstorm calms once you are the Champion: map `desert`) and the Ancient Tomb on Route 120.
 * Their doors answer to the Sealed Chamber under Route 134 (Dive): Dig opens its far wall, and with
 * Wailord leading the party and Relicanth last, the braille inside unseals them (flag regis-unsealed).
 * Then each door opens its own way: Strength two steps right and two down from the braille (map
 * `moveSpots`), a walk once around the room's edge (`walkAround`), Flash in the middle of the tomb.
 * Behind them Regirock, Regice and Registeel (level 40) wait; once all three are met, `ending(41)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const RUINS = { tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', escape: true, region: 'hoenn' };
  const SEA = { tileset: 'outdoor', palette: 'underwater', music: 'cave', battleBg: 'underwater', border: '#', underwater: true, region: 'hoenn' };
  const OPEN = ['regis-unsealed'];

  // ---------------- Route 105 ----------------
  G.Maps.def(Object.assign({
    id: 'route105', loc: 'hoenn-route-105', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~',
    rows: [
      '~~~~~~~~~###############',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~##~~~####',
      '~~~~~~~~~~~~~~~##~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~##~~~~~~~~~~~~~~~####',
      '~~~##~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~::####::~~~~~####',
      '~~~~~~~::####::~~~~~####',
      '~~~~~~~::#O##::~~~~~####',
      '~~~~~~~::::::::~~~~~####',
      '~~~~~~~::::::::~~~~~####',
      '~~~~~~~::::::::~~~~~####',
      '~~~~~~~::::::::~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~##~~~~~~~~~~~~~~~~####',
      '~~##~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~####',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~##~~~~~~',
      '~~~~~~~~~~~~~~~~##~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { north: { map: 'route104', offset: 0 }, east: { map: 'route106', offset: 28 } },
    warps: [{ x: 10, y: 17, to: 'island-cave', spot: 'door' }],
    spots: { cave: [10, 18, 'down'] },
    trainers: [
      { id: 'imani', who: 'swimmerf', cls: 'swimmer-f', name: 'Imani', x: 4, y: 5, dir: 'down', sight: 4, swim: true, team: [['marill', 30], ['tentacool', 30]],
        before: 'The sea between Petalburg and Dewford is my swimming pool. Race you to a battle!',
        defeat: 'I swallowed some seawater...',
        after: 'There is a little island to the south with a cave on it. Nobody I know has seen the back of it.' },
      { id: 'dominik', who: 'swimmer', cls: 'swimmer', name: 'Dominik', x: 17, y: 12, dir: 'left', sight: 4, swim: true, team: [['tentacool', 29], ['wailmer', 31]],
        before: 'A Trainer out at sea! You will not get past without a battle.',
        defeat: 'Washed up...',
        after: 'Wailmer grows up into Wailord, the biggest Pokémon in the sea. Can you imagine riding one?' },
      { id: 'beverly', who: 'swimmerf', cls: 'swimmer-f', name: 'Beverly', x: 5, y: 31, dir: 'right', sight: 4, swim: true, team: [['luvdisc', 30], ['goldeen', 30], ['corsola', 31]],
        before: 'My Pokémon and I swim here every day. Let us see how strong you are!',
        defeat: 'You were too strong for us...',
        after: 'Dewford is just east of here. Swim along Route 106 and you are there.' }
    ],
    npcs: [{ id: 'maniac', who: 'hiker', x: 8, y: 19, dir: 'right', script: 'regis.maniac-island' }],
    items: [{ x: 13, y: 20, item: 'iron', flag: 'route105-iron' }, { x: 2, y: 36, item: 'pearl', flag: 'route105-pearl', hidden: true }],
    encounters: { water: '@hoenn-route-105-area' }
  }, HOENN));

  // ---------------- The Island Cave (Regice): walk once around the room ----------------
  G.Maps.def(Object.assign({
    id: 'island-cave', loc: 'island-cave',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWQWWWWWW',
      '+++++++++++++',
      '+++++++++++++',
      '+++W+++++W+++',
      '+++++++++++++',
      '+++++++++++++',
      '+++W+++++W+++',
      '+++++++++++++',
      '+++++++++++++',
      '++++++X++++++'
    ],
    warps: [{ x: 6, y: 10, to: 'route105', spot: 'cave' },
            { x: 6, y: 1, to: 'island-cave-inner', spot: 'stairs', if: 'island-cave-open', locked: 'regis.island-wall' }],
    spots: { door: [6, 10, 'up'], below: [6, 2, 'down'] },
    signs: { '6,1': { script: 'regis.island-wall' }, '2,1': { script: 'regis.lore-ice' }, '10,1': { script: 'regis.lore-sea' } },
    walkAround: { x: 0, y: 2, w: 13, h: 9, if: OPEN.concat('!island-cave-open'), script: 'regis.island-open' }
  }, RUINS));
  G.Maps.def(Object.assign({
    id: 'island-cave-inner', loc: 'island-cave',
    rows: [
      'WWWWWWWWW',
      'WWWWWWWWW',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '++++^++++'
    ],
    warps: [{ x: 4, y: 7, to: 'island-cave', spot: 'below' }],
    spots: { stairs: [4, 6, 'up'] },
    npcs: [{ id: 'regice', who: 'regice', mon: 'regice', x: 4, y: 3, dir: 'down', fixed: true, if: '!regice-met', script: 'regis.regice' }]
  }, RUINS));

  // ---------------- The desert (Route 111, north) and the Desert Ruins (Regirock) ----------------
  G.Maps.def(Object.assign({
    id: 'route111-desert', loc: 'hoenn-route-111', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'desert', border: '#',
    desert: true,
    rows: [
      '########################',
      '#::::::::::::::::::::::#',
      '#::::::::::::::::::::::#',
      '#:::###::::::::###:::::#',
      '#:::###::::::::###:::::#',
      '#::::::::::::::::::::::#',
      '#::::::::::::::::::::::#',
      '#::::::::::::::::::::::#',
      '#::::::::::##::::::::::#',
      '#:#####::::##::::::::::#',
      '#:#####::::::::::::::::#',
      '#:##O##::::::::::::::::#',
      '#:::::::::::::::::###::#',
      '#:::::::::::::::::###::#',
      '#::::::::::::::::::::::#',
      '#::::::::::::::::::::::#',
      '#::::::::::::::::::::::#',
      '#:::::##:::::::::::::::#',
      '#:::::##:::::::::::::::#',
      '#::::::::::::::##::::::#',
      '#::::::::::::::##::::::#',
      '#::::::::::::::::::::::#',
      '#::::::::::::::::::::::#',
      '##########:#############'
    ],
    connect: { south: { map: 'route111', offset: 0 } },
    warps: [{ x: 4, y: 11, to: 'desert-ruins', spot: 'door' }],
    spots: { ruins: [4, 12, 'down'] },
    npcs: [{ id: 'maniac', who: 'hiker', x: 7, y: 12, dir: 'left', script: 'regis.maniac-desert' }],
    items: [{ x: 20, y: 6, item: 'stardust', flag: 'desert-stardust' }, { x: 3, y: 20, item: 'protein', flag: 'desert-protein' }],
    encounters: { walk: '@hoenn-route-111-area' }
  }, HOENN));
  G.Maps.def(Object.assign({
    id: 'desert-ruins', loc: 'desert-ruins',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWQWWWWWW',
      '+++++++++++++',
      '+++++++++++++',
      '+++++++++++++',
      '+++++++++++++',
      '+++++++++++++',
      '+++W+++++W+++',
      '+++++++++++++',
      '+++++++++++++',
      '++++++X++++++'
    ],
    warps: [{ x: 6, y: 10, to: 'route111-desert', spot: 'ruins' },
            { x: 6, y: 1, to: 'desert-ruins-inner', spot: 'stairs', if: 'desert-ruins-open', locked: 'regis.desert-wall' }],
    spots: { door: [6, 10, 'up'], below: [6, 2, 'down'] },
    signs: { '6,1': { script: 'regis.desert-wall' }, '2,1': { script: 'regis.lore-rock' } },
    // Two steps right and two down from the braille, then Strength.
    moveSpots: [{ move: 'strength', x: 8, y: 4, if: OPEN.concat('!desert-ruins-open'), script: 'regis.desert-open' }]
  }, RUINS));
  G.Maps.def(Object.assign({
    id: 'desert-ruins-inner', loc: 'desert-ruins',
    rows: [
      'WWWWWWWWW',
      'WWWWWWWWW',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '++++^++++'
    ],
    warps: [{ x: 4, y: 7, to: 'desert-ruins', spot: 'below' }],
    spots: { stairs: [4, 6, 'up'] },
    npcs: [{ id: 'regirock', who: 'regirock', mon: 'regirock', x: 4, y: 3, dir: 'down', fixed: true, if: '!regirock-met', script: 'regis.regirock' }]
  }, RUINS));

  // ---------------- The Ancient Tomb (Route 120; Registeel): Flash in the middle ----------------
  G.Maps.def(Object.assign({
    id: 'ancient-tomb', loc: 'ancient-tomb',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWQWWWWWW',
      '+++++++++++++',
      '+++++++++++++',
      '++W+++++++W++',
      '+++++++++++++',
      '+++++++++++++',
      '+++++++++++++',
      '++W+++++++W++',
      '+++++++++++++',
      '++++++X++++++'
    ],
    warps: [{ x: 6, y: 10, to: 'route120', spot: 'tomb' },
            { x: 6, y: 1, to: 'ancient-tomb-inner', spot: 'stairs', if: 'ancient-tomb-open', locked: 'regis.tomb-wall' }],
    spots: { door: [6, 10, 'up'], below: [6, 2, 'down'] },
    signs: { '6,1': { script: 'regis.tomb-wall' }, '10,1': { script: 'regis.lore-steel' } },
    moveSpots: [{ move: 'flash', x: 6, y: 6, if: OPEN.concat('!ancient-tomb-open'), script: 'regis.tomb-open' }]
  }, RUINS));
  G.Maps.def(Object.assign({
    id: 'ancient-tomb-inner', loc: 'ancient-tomb',
    rows: [
      'WWWWWWWWW',
      'WWWWWWWWW',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '++++^++++'
    ],
    warps: [{ x: 4, y: 7, to: 'ancient-tomb', spot: 'below' }],
    spots: { stairs: [4, 6, 'up'] },
    npcs: [{ id: 'registeel', who: 'registeel', mon: 'registeel', x: 4, y: 3, dir: 'down', fixed: true, if: '!registeel-met', script: 'regis.registeel' }]
  }, RUINS));

  // ---------------- Under Route 134, and the Sealed Chamber ----------------
  G.Maps.def(Object.assign({
    id: 'route134-uw', loc: 'hoenn-route-134', surface: 'route134',
    rows: [
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '########################################',
      '######O#################################',
      '###........#############################',
      '###""......#############################',
      '###""......#############################',
      '###..,,,,..#############################',
      '###..,,,,..#############################',
      '###..,,,,""#############################',
      '###..,,,,""#############################',
      '###........#############################'
    ],
    warps: [{ x: 6, y: 11, to: 'sealed-chamber', spot: 'door' }],
    spots: { mouth: [6, 12, 'up'] },
    signs: { '5,11': 'A doorway of carved stone is set into the rock. Rows of little dots run around its frame.' },
    encounters: { seaweed: '@hoenn-route-124-underwater' }
  }, SEA));
  G.Maps.def(Object.assign({
    id: 'sealed-chamber', loc: 'sealed-chamber',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWQWWWWWW',
      '+++++++++++++',
      '+++++++++++++',
      '+++++++++++++',
      '+++W+++++W+++',
      '+++++++++++++',
      '+++++++++++++',
      '+++W+++++W+++',
      '+++++++++++++',
      '+++++++++++++',
      '++++++X++++++'
    ],
    warps: [{ x: 6, y: 11, to: 'route134-uw', spot: 'mouth' },
            { x: 6, y: 1, to: 'sealed-chamber-inner', spot: 'stairs', if: 'sealed-chamber-dug', locked: 'regis.sealed-wall' }],
    spots: { door: [6, 11, 'up'], below: [6, 2, 'down'] },
    signs: { '6,1': { script: 'regis.sealed-wall' }, '2,1': { script: 'regis.lore-people' }, '10,1': { script: 'regis.lore-fear' } },
    moveSpots: [{ move: 'dig', x: 6, y: 2, if: '!sealed-chamber-dug', script: 'regis.sealed-dig' }]
  }, RUINS));
  G.Maps.def(Object.assign({
    id: 'sealed-chamber-inner', loc: 'sealed-chamber',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWWWWWWWW',
      '+++++++++++++',
      '+++++++++++++',
      '+++++++++++++',
      '+++W+++++W+++',
      '+++++++++++++',
      '+++++++++++++',
      '+++++++++++++',
      '++++++^++++++'
    ],
    warps: [{ x: 6, y: 9, to: 'sealed-chamber', spot: 'below' }],
    spots: { stairs: [6, 8, 'up'] },
    signs: { '6,1': { script: 'regis.sealed-key' }, '2,1': { script: 'regis.lore-three' }, '10,1': { script: 'regis.lore-sea' } }
  }, RUINS));

  // ---------------- The braille ----------------
  /** A wall of braille: the dots, then what they say. */
  async function wall(h, dots, meaning) {
    await h.say(T('Raised dots are carved into the wall: {braille}'), { vars: { braille: G.U.braille(dots) } });
    await h.say(meaning);
  }
  /** A ruin's door: its braille, and whether it can answer yet. */
  async function door(h, flag, dots, meaning) {
    const F = G.Field;
    if (F.flag(flag)) { await h.say(T('The panel has slid aside. Stone steps lead down into the dark.')); return; }
    await wall(h, dots, meaning);
    if (!F.flag('regis-unsealed')) await h.say(T('Nothing stirs. The wall feels lifeless, as if something far away still holds it shut.'));
  }
  /** The door opens. */
  async function opens(h, flag, mon, move) {
    G.Field.setFlag(flag);
    if (mon) await h.say(T('{mon} used {move}!'), { vars: { mon: G.Mon.name(mon), move: G.Names.move(move) } });
    h.sfx('strength');
    await h.say(T('With a deep rumble, the wall at the back of the room slides aside!'));
    await h.say(T('Stone steps lead down into the dark.'));
  }

  /** The key, in the Sealed Chamber: Wailord leading the party, Relicanth last. */
  async function sealedKey(h) {
    const F = G.Field;
    await wall(h, 'WAILORD FIRST RELICANTH LAST', T('Let Wailord lead the way, and let Relicanth follow at the very end.'));
    if (F.flag('regis-unsealed')) return;
    const p = F.party();
    if (p.length < 2 || p[0].sp !== 321 || p[p.length - 1].sp !== 369) return;
    F.setFlag('regis-unsealed');
    h.sfx('strength');
    await h.say(T('The whole chamber trembles! Far away, something heavy groans and shifts...'));
    await h.say(T('It sounded like three great doors opening, somewhere across Hoenn.'));
  }

  // ---------------- The three ----------------
  const REGIS = ['regirock', 'regice', 'registeel'];
  /** Met (caught or beaten): it is gone from its chamber. */
  const MET = { regirock: () => G.Field.setFlag('regirock-met'), regice: () => G.Field.setFlag('regice-met'),
                registeel: () => G.Field.setFlag('registeel-met') };
  async function regi(h, id) {
    const F = G.Field;
    await h.say(T('Lights flicker across the ancient body. The Pokémon stirs and rises!'));
    h.sfx('cry');
    await h.wild(id, 40, {});
    const r = F.lastBattle;
    if (r === 'run' || r === 'lose') return;
    MET[id]();
    h.hide(id);
    if (!REGIS.every(x => F.flag(x + '-met'))) return;
    await h.say(T('All three ancient Pokémon are awake. A deep silence settles over the old ruins of Hoenn.'));
    // The end of the forty-first chapter (credits-ui.js).
    if (G.CreditsUI) G.CreditsUI.ending(41); else F.setFlag('chapter-41-done');
  }

  G.Script.def({
    'regis.maniac-island': [
      ['if', 'regis-unsealed', [
        ['say', 'Did you feel that rumble? The walls with the dots... something behind them is awake now!']
      ], [
        ['say', 'Ruins with dotted writing hide all over Hoenn: in this cave, in the desert north of Route 111, and in a tomb on Route 120.'],
        ['say', 'The dots are braille. I can read them, but the doors never open. They say the key sleeps in a chamber under the sea of Route 134.']
      ]]
    ],
    'regis.maniac-desert': [
      ['if', 'regis-unsealed', [
        ['say', 'These ruins have woken up! Read the wall inside again: it tells you how to open the door.']
      ], [
        ['say', 'An old book says the three ruins answer to one chamber under the sea. Dive where the water turns deep on Route 134.'],
        ['say', 'Inside, they say, you need the two great Pokémon of the sea: Wailord and Relicanth.']
      ]]
    ],
    'regis.island-wall': [['js', h => door(h, 'island-cave-open', 'WALK ONCE AROUND THE EDGE OF THIS ROOM', T('Walk once all the way around the edge of this room.'))]],
    'regis.desert-wall': [['js', h => door(h, 'desert-ruins-open', 'RIGHT TWO DOWN TWO THEN STRENGTH', T('From here, two steps right and two steps down. Then show your Strength.'))]],
    'regis.tomb-wall': [['js', h => door(h, 'ancient-tomb-open', 'SHINE IN THE MIDDLE', T('Let a light shine in the very middle of this room.'))]],
    'regis.sealed-wall': [['js', h => door(h, 'sealed-chamber-dug', 'DIG HERE', T('Dig here.'))]],
    'regis.island-open': [['js', h => opens(h, 'island-cave-open', null, null)]],
    'regis.desert-open': [['js', h => opens(h, 'desert-ruins-open', h.ctx.mon, 'strength')]],
    'regis.tomb-open': [['js', h => opens(h, 'ancient-tomb-open', h.ctx.mon, 'flash')]],
    'regis.sealed-dig': [['js', h => opens(h, 'sealed-chamber-dug', h.ctx.mon, 'dig')]],
    'regis.sealed-key': [['js', sealedKey]],
    'regis.lore-people': [['js', h => wall(h, 'WE LIVED HERE WITH POKEMON', T('Long ago our people lived here by the sea, side by side with Pokémon.'))]],
    'regis.lore-fear': [['js', h => wall(h, 'WE FEARED THREE GIANTS', T('We feared the power of three great Pokémon, so we shut them away in three far places.'))]],
    'regis.lore-three': [['js', h => wall(h, 'ROCK ICE AND STEEL SLEEP', T('Rock, ice and steel: the three sleep until the giants of the sea call them.'))]],
    'regis.lore-sea': [['js', h => wall(h, 'THE SEA HOLDS THE KEY', T('The key to every door lies under the sea.'))]],
    'regis.lore-rock': [['js', h => wall(h, 'ROCK SLEEPS IN THE SAND', T('Here, in the sand, sleeps the one made of rock.'))]],
    'regis.lore-ice': [['js', h => wall(h, 'ICE SLEEPS BY THE SEA', T('Here, by the sea, sleeps the one made of ice.'))]],
    'regis.lore-steel': [['js', h => wall(h, 'STEEL SLEEPS IN THE TOMB', T('Here, in the tomb, sleeps the one made of steel.'))]],
    'regis.regirock': [['js', h => regi(h, 'regirock')]],
    'regis.regice': [['js', h => regi(h, 'regice')]],
    'regis.registeel': [['js', h => regi(h, 'registeel')]]
  });
  G.Regis = { REGIS };
})();
