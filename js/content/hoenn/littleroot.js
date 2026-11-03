/* ============ littleroot.js — the S.S. Aqua to Hoenn, Littleroot Town, Professor Birch ============
 * Chapter 28, the start of Hoenn. After Mt. Silver (flag silver-beaten) Professor Oak has a letter
 * from Professor Birch, who studies Pokémon in the wild in Hoenn: he puts you on the list of the
 * S.S. Aqua (flag hoenn-invite), which now sails from Olivine City's pier (olivine.js) to a pier
 * south of Littleroot Town, and back (flag hoenn-arrived the first time). Littleroot: Birch's lab
 * (he is out in the field until you save him on Route 101, route101.js), his house (his wife heals
 * you and you stay upstairs, next to the room of their child, the rival: May for a boy, Brendan for
 * a girl, var rival3 and {rival3}), two more houses. On Route 101 you battle a wild Zigzagoon with
 * one of the three Pokémon in Birch's bag (flag birch-saved); at the lab he explains that old
 * Pokémon only obey up to the level of your Hoenn badges (flag hoenn-start: G.Field.obeyCap) and
 * gives it to you; the rival takes the one strong against it (save.rival3.starter). After the
 * battle on Route 103 Birch upgrades the Pokédex for Hoenn and the rival gives five Poké Balls
 * (flag hoenn-dex), then `ending(28)`. Chapter 44: once you are Hoenn's Champion, Birch passes on an
 * invitation from Professor Rowan in Sinnoh (flag sinnoh-invite; the ferry from Lilycove, sinnoh/sandgem.js).
 */
(() => {
  const T = s => G.T(s);
  const BIRCH = { name: 'Prof. Birch' }, RIVAL3 = { name: '{rival3}' }, SAILOR = { name: 'Sailor' }, OAK = { name: 'Prof. Oak' };
  const HOENN = { region: 'hoenn' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Littleroot Town ----------------
  G.Maps.def(Object.assign({
    id: 'littleroot', loc: 'littleroot-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'lab-door' },
    rows: [
      'TTTTTTTTTT,,,,TTTTTTTTTT',
      'T.........,,,,.........T',
      'T..HHHH...,,,,...HHHH..T',
      'T..HHHH...,,,,...HHHH..T',
      'T..HDHH...,,,,...HDHH..T',
      'T...,.....,,,,....,....T',
      'T,,,,,,,,,,,,,,,,,,,,,,T',
      'T.......,,.............T',
      'T..ff...,,..LLLLLL..ff.T',
      'T.......,,..LLLLLL.....T',
      'T.S.....,,..LLLLLL.....T',
      'T.......,,..LLLDLLS....T',
      'T,,,,,,,,,,,,,,,,,,,,,,T',
      'T......,,..............T',
      'T......,,....HHHH..ff..T',
      'T..ff..,,....HHHH......T',
      'T......,,....HDHH......T',
      'T......,,.....,........T',
      'T~~~~~~==~~~~~~~~~~~~~~T',
      'T~~~~~~==~~~~~~~~~~~~~~T',
      'T~~~~~~==~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~T'
    ],
    connect: { north: { map: 'route101', offset: 2 } },
    warps: [
      { x: 4, y: 4, to: 'birch-house', spot: 'door' },
      { x: 18, y: 4, to: 'littleroot-house', spot: 'door' },
      { x: 15, y: 11, to: 'birch-lab', spot: 'door' },
      { x: 14, y: 16, to: 'littleroot-house2', spot: 'door' }
    ],
    spots: { 'birch-door': [4, 5, 'down'], 'house-door': [18, 5, 'down'], 'lab-door': [15, 12, 'down'], 'house2-door': [14, 17, 'down'],
             pier: [7, 20, 'up'] },
    signs: {
      '2,10': 'Littleroot Town. A small town where new journeys take root.',
      '18,11': "Professor Birch's Pokémon Lab."
    },
    npcs: [
      { id: 'girl', who: 'lass', x: 6, y: 8, move: 'wander', r: 2,
        say: 'Professor Birch is never in his lab. He would rather be out in the grass with the Pokémon!' },
      { id: 'man', who: 'gentleman', x: 20, y: 13, move: 'look',
        say: 'The S.S. Aqua docks at our little pier now. Imagine, a ship from Johto stopping in Littleroot!' },
      { id: 'sailor', who: 'sailor', x: 8, y: 20, dir: 'up', script: 'hoenn.ferry-littleroot' }
    ],
    encounters: { water: '@hoenn-route-103-area' }
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'birch-lab', loc: 'littleroot-town', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbP++++++bbbb', '+++++++++++++', '+++++++++++++', '++++++++ttt++',
           '+++++++++++++', 'bbbb+++++bbbb', '+++++++++++++', '+++++++++++++', 'p+++++++++++p', '++++++X++++++'],
    warps: [{ x: 6, y: 11, to: 'littleroot', spot: 'lab-door' }],
    spots: { door: [6, 11, 'up'], birch: [6, 4, 'up'], heal: [10, 4, 'up'] },
    signs: { '0,7': 'Field notes: "Many of Hoenn\'s Pokémon live nowhere else. Others came from far away, like the Trainers who follow them..."',
             '1,7': 'Field notes: "Many of Hoenn\'s Pokémon live nowhere else. Others came from far away, like the Trainers who follow them..."' },
    npcs: [
      { id: 'birch', who: 'birch', x: 6, y: 3, dir: 'down', if: 'birch-saved', script: 'hoenn.birch' },
      { id: 'aide', who: 'aide', x: 10, y: 3, dir: 'down', script: 'hoenn.aide' },
      // The rival comes along after Route 103 (shown by the script).
      { id: 'may', who: 'may', x: 7, y: 4, dir: 'left', if: 'scripted' },
      { id: 'brendan', who: 'brendan', x: 7, y: 4, dir: 'left', if: 'scripted' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'birch-house', loc: 'littleroot-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p____^_', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'littleroot', spot: 'birch-door' }, { x: 9, y: 2, to: 'birch-house-2f', spot: 'stairs' }],
    spots: { door: [4, 7, 'up'], stairs: [9, 3, 'down'], mom: [7, 5, 'up'] },
    npcs: [{ id: 'mom', who: 'mom', x: 7, y: 4, dir: 'left', script: 'hoenn.mrs-birch' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'birch-house-2f', loc: 'littleroot-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbP______^_', '___________', '__ttt______', '___________', '_______p___', '___________'],
    warps: [{ x: 9, y: 2, to: 'birch-house', spot: 'stairs' }],
    spots: { stairs: [9, 3, 'down'] },
    signs: { '0,2': 'Notebooks full of drawings of Pokémon, and the places where they were seen.',
             '1,2': 'Notebooks full of drawings of Pokémon, and the places where they were seen.' },
    npcs: [
      { id: 'may', who: 'may', x: 6, y: 4, dir: 'down', if: ['hoenn-dex', 'rival3=may'], script: 'hoenn.rival-home' },
      { id: 'brendan', who: 'brendan', x: 6, y: 4, dir: 'down', if: ['hoenn-dex', 'rival3=brendan'], script: 'hoenn.rival-home' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'littleroot-house', loc: 'littleroot-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'littleroot', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'granny', who: 'granny', x: 7, y: 4, dir: 'left',
             say: 'An old tale says Hoenn\'s land and sea were shaped long ago, when two great Pokémon fought over them.' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'littleroot-house2', loc: 'littleroot-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'littleroot', spot: 'house2-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'boy', who: 'youngster', x: 2, y: 5, move: 'wander', r: 1,
             say: 'Some Pokémon here are from Kanto and Johto, but lots of them live only in Hoenn. I want to see them all!' }]
  }, HOENN));

  // ---------------- Professor Oak's letter ----------------
  async function oak(h) {
    const F = G.Field;
    if (!F.flag('hoenn-invite')) {
      await h.say(T('{player}! I hear you climbed Mt. Silver and beat {rival} at the top. Ho ho! My grandson talks of nothing else.'), OAK);
      await h.say(T('Now, I have a letter from an old friend: Professor Birch. He studies Pokémon in the wild in Hoenn, a region far to the south.'), OAK);
      await h.say(T('He is looking for a strong Trainer to help with his research, and I told him I know just the one!'), OAK);
      await h.say(T('The S.S. Aqua sails from Olivine City to Hoenn now. I have put your name on her list of passengers.'), OAK);
      F.setFlag('hoenn-invite');
    }
    await h.say(T("Take the S.S. Aqua from Olivine City's pier. Professor Birch will be waiting for you in Littleroot Town."), OAK);
  }

  // ---------------- Professor Birch ----------------
  /** After Route 101: the Pokémon from his bag becomes yours. */
  async function giveStarter(h, mon) {
    const F = G.Field, S = F.save;
    const name = G.Names.mon(mon.sp);
    G.Mon.heal(mon);
    await h.say(T('Professor Oak says you are the Champion of Kanto and Johto! Here in Hoenn, though, things work a little differently.'), BIRCH);
    await h.say(T("A Pokémon trained to a high level in another region only listens to a Trainer who has earned Hoenn's Gym badges. The more badges, the stronger the Pokémon that obey."), BIRCH);
    await h.say(T('So you will want a new partner. The Pokémon you battled with seems to like you: please, take it with you!'), BIRCH);
    const full = S.party.length >= 6;
    if (full) F.toBox(mon); else S.party.push(mon);
    S.dex.seen[mon.sp] = 1; S.dex.caught[mon.sp] = 1;
    F.setFlag('hoenn-start');
    F.setVar('rival3', S.player.gender === 'f' ? 'brendan' : 'may');
    S.rival3.starter = COUNTER[mon.sp];
    const j = h.jingle('item');
    await h.say(T('{player} received {mon} from Prof. Birch!'), { vars: { mon: name } });
    await j;
    if (full) await h.say(T('Your party was full, so {mon} went to your PC. Use the PC here to swap your team.'), { vars: { mon: name } });
    await h.nickname(mon);
    await h.say(T('My child, {rival3}, is out on Route 103, north of Oldale Town, studying Pokémon. Why not go and say hello?'), BIRCH);
  }
  /** The rival's starter: the one strong against yours. */
  const COUNTER = { 252: 255, 255: 258, 258: 252 };

  /** After Route 103: a Pokédex for Hoenn and five Poké Balls, and the end of the chapter. */
  async function dex(h) {
    const F = G.Field, who = F.getVar('rival3') || 'may';
    h.place(who, 7, 4, 'left'); h.show(who);
    h.face('player', 'up');
    await h.say(T('So you two have met! {rival3} has been looking forward to it for days.'), BIRCH);
    await h.say(T('{player}, may I have your Pokédex for a moment? ...There! Now it can record the Pokémon of Hoenn as well.'), BIRCH);
    F.setFlag('hoenn-dex');
    let j = h.jingle('item');
    await h.say(T("{player}'s Pokédex was upgraded!"));
    await j;
    await h.say(T('And these are from me! You will need them to catch the Pokémon of Hoenn.'), RIVAL3);
    F.giveItem('poke-ball', 5);
    j = h.jingle('item');
    await h.say(T('{player} received {item} ×{n}!'), { vars: { item: G.Names.item('poke-ball'), n: 5 } });
    await j;
    await h.say(T('West of Oldale Town, Route 102 leads on to Petalburg City. Your journey through Hoenn starts there!'), BIRCH);
    h.hide(who);
    if (G.CreditsUI) await G.CreditsUI.ending(28); else F.setFlag('chapter-28-done');
  }

  async function birch(h) {
    const F = G.Field;
    if (!F.flag('hoenn-start')) return;
    // Chapter 44: the Champion is invited to Sinnoh.
    if (F.flag('hoenn-champion')) {
      if (!F.flag('sinnoh-invite')) {
        await h.say(T('{player}! The Champion of Hoenn, and a friend of my family. I could not be prouder!'), BIRCH);
        await h.say(T('Now, an old friend of mine, Professor Rowan, studies how Pokémon evolve. He lives in Sandgem Town, in the Sinnoh region, far to the north.'), BIRCH);
        await h.say(T('He wrote that he would like to meet a Trainer who knows Kanto, Johto and Hoenn. I told him I know just the one!'), BIRCH);
        F.setFlag('sinnoh-invite');
      }
      await h.say(T("The ferry in Lilycove City's harbor sails to Sinnoh now. Professor Rowan's lab is in Sandgem Town, right by the pier."), BIRCH);
      return;
    }
    if (!F.flag('rival3-met')) {
      await h.say(T('{rival3} is on Route 103, north of Oldale Town. Go on, say hello!'), BIRCH);
      return;
    }
    await h.say(T('Hoenn has Pokémon you know from Kanto and Johto, and many that live only here. Fill that Pokédex for me!'), BIRCH);
    await h.say(T('Remember: the more Hoenn badges you earn, the more of your Pokémon from home will listen to you.'), BIRCH);
  }

  G.Script.def({
    'oak.hoenn': [['js', oak]],
    // The S.S. Aqua between Olivine City's pier and Littleroot Town's.
    'hoenn.ferry-olivine': [
      ['if', '!hoenn-invite', [
        ['say', 'The S.S. Aqua is fixed at last! She sails south to the Hoenn region now.', SAILOR],
        ['say', 'Only passengers on the list may board, though. Professor Oak in Kanto sends us their names.', SAILOR],
        ['end']
      ]],
      ['choice', 'All aboard for Hoenn! Would you like to set sail?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The S.S. Aqua sounded her horn and put out to sea.'],
        ['say', 'The ship sailed south through the night...'],
        ['warp', 'littleroot', 'pier'],
        ['if', '!hoenn-arrived', [
          ['setFlag', 'hoenn-arrived'],
          ['say', 'Land ho! Welcome to Littleroot Town, in the Hoenn region.', SAILOR],
          ['say', "Professor Birch's lab is just up the path. His family lives in the house by the north road, and they love having guests.", SAILOR]
        ]]
      ], [
        ['say', 'Come back whenever you are ready.', SAILOR]
      ], SAILOR]
    ],
    'hoenn.ferry-littleroot': [
      ['choice', 'The S.S. Aqua sails north to Olivine City in Johto. Would you like to go back?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The S.S. Aqua sounded her horn and put out to sea.'],
        ['say', 'The ship sailed north through the night...'],
        ['warp', 'olivine', 'pier']
      ], [], SAILOR]
    ],
    'hoenn.birch': [['js', birch]],
    'hoenn.aide': [
      ['if', 'birch-saved', [
        ['say', 'Your Pokémon look tired. Let me use the lab\'s machine on them.'],
        ['healAnim'], ['heal'], ['lastHeal', 'heal'],
        ['say', 'All better! Come back any time.']
      ], [
        ['say', 'Professor Birch? He went out to do fieldwork on Route 101, north of town. He always forgets that the wild Pokémon bite!']
      ]]
    ],
    'hoenn.mrs-birch': [
      // Chapter 42: back home as the Champion, the news of a red or blue Pokémon (legends.js).
      ['if', ['hoenn-champion', '!lati-chosen'], [['call', 'legends.tv'], ['end']]],
      ['if', 'hoenn-start', [
        ['say', '{player}, you look tired. Have a little rest.'],
        ['heal'], ['lastHeal', 'mom'],
        ['jingle', 'heal'],
        ['say', 'There! Off you go, and come home safe.']
      ], [
        ['say', 'Oh! You must be {player}. Professor Oak wrote that you would be coming. Welcome to Littleroot!'],
        ['say', 'You will stay with us while you are in Hoenn. Your room is upstairs, next to {rival3}\'s.'],
        ['say', 'My husband? Out in the field, as always. Try Route 101, north of town.']
      ]]
    ],
    'hoenn.rival-home': [
      ['say', 'Dad says you can stay with us as long as you like. Let\'s both fill our Pokédex, okay?', { name: '{rival3}' }]
    ]
  });
  G.Hoenn = { giveStarter, dex, COUNTER };
})();
