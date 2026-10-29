/* ============ newbark.js — Routes 26 and 27, New Bark Town, Professor Elm, Route 29 ============
 * Chapter 11, the start of Johto. South of the Indigo Plateau, Route 26 runs down the coast (a
 * rest house where a lady heals your Pokémon); Route 27 turns west across a strait (Surf) to New
 * Bark Town, at the eastern edge of Johto. Professor Elm has heard of the Champion of Kanto: he
 * explains that in Johto a Pokémon trained to a high level elsewhere only obeys a Trainer who has
 * earned Johto's badges (flag johto-start: G.Field.obeyCap), and gives you one of Johto's three
 * starters. His errand: see what Mr. Pokémon found, north of Cherrygrove City (cherrygrove.js).
 * Meanwhile a boy steals the starter that is strong against yours (flag johto-theft); back at the
 * lab a police officer asks for the thief's name (save.rival2.name), and Elm hands the Mystery Egg
 * back to you to hatch by walking (var egg-steps, script egg.hatch: Togepi). Route 29 leads west.
 * Chapter 25: once the Ruins of Alph are done, Elm asks you to hatch an Egg from the Day Care
 * (flag egg-research); showing him what hatched (flag daycare-hatched) ends the chapter (egg-report).
 * Chapter 19: Route 26 starts at Victory Road's mouth (johto/victoryroad.js; a guard keeps Johto's
 * Trainers out until they hold all eight Johto badges, flag clair-beaten); Route 27 crosses the
 * falls (down them with Surf, up them with Waterfall); Route 29 has a way north to Route 46; with
 * eight Johto badges Elm gives the Master Ball (flag got-master-ball).
 */
G.Maps.def({
  id: 'route26', loc: 'kanto-route-26', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TT##############TTTTTT',
    'TT##############TTTTTT',
    'TT#######O######~~~~~T',
    'TT.......,,.....~~~~~T',
    'TT.""""S.,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.......,,.....~~~~~T',
    'TT.......,,"""".~~~~~T',
    'TT.HHHH..,,"""".~~~~~T',
    'TT.HHHH..,,"""".~~~~~T',
    'TT.HDHH..,,"""".~~~~~T',
    'TT..,,,,,,,"""".~~~~~T',
    'TT.......,,"""".~~~~~T',
    'TT.......,,.....~~~~~T',
    'TT.......,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.""""".,,.....~~~~~T',
    'TT.......,,"""".~~~~~T',
    'TT.......,,"""".~~~~~T',
    'TT.......,,"""".~~~~~T',
    'TT.......,,"""".~~~~~T',
    'TT.......,,"""".~~~~~T',
    'TT.......,,.....~~~~~T',
    'TT.......,,.....~~~~~T',
    ',,,,,,,,,,,.....~~~~~T',
    ',,,,,,,,,,,.....~~~~~T',
    'TT..........TTTT~~~~~T',
    'TT..........TTTT~~~~~T',
    'TTTTTTT.....TTTT~~~~~T',
    'TTTTTTT.....TTTT~~~~~T',
    'TTTTTTT.....TTTT~~~~~T',
    'TTTTTTT.....TTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'route27', offset: 25 } },
  warps: [{ x: 4, y: 13, to: 'route26-house', spot: 'door' },
          { x: 9, y: 2, to: 'johto-victory-1f', spot: 'south', if: 'clair-beaten', locked: 'route26.vr-closed' }],
  spots: { 'house-door': [4, 14, 'down'], 'vr-door': [9, 3, 'down'] },
  signs: { '7,4': 'Route 26. North: the Pokémon League. South and then west: Route 27 and New Bark Town in Johto.' },
  npcs: [
    { id: 'guard', who: 'officer', x: 11, y: 3, dir: 'left', if: '!clair-beaten', script: 'route26.vr-closed' },
    { id: 'guard2', who: 'officer', x: 11, y: 3, dir: 'left', if: 'clair-beaten',
      say: 'All eight Johto badges! Victory Road is open to you. The Pokémon League waits at the other end.' }
  ],
  encounters: { walk: '@kanto-route-26-area', water: '@kanto-route-26-area' }
});

G.Maps.def({
  id: 'route26-house', loc: 'kanto-route-26', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'route26', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [{ id: 'lady', who: 'mom', x: 7, y: 4, dir: 'left', script: [
    ['say', 'Travelers between Kanto and Johto often stop here. Your Pokémon look tired. Let them rest a while.'],
    ['heal'], ['jingle', 'heal'],
    ['say', 'There! Good as new. Safe travels!']
  ] }]
});

G.Maps.def({
  id: 'route27', loc: 'kanto-route-27', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T.................##~~~~~~~~.....................T',
    'T...""""""""".....##~~~~~~~~......"""""""""""....T',
    'T...""""""""".....####||#####....."""""""""""....T',
    'T...""""""""".....####||#####....."""""""""""....T',
    'T...............S.####||#####.................S..T',
    ',,,,,,,,,,,,,,,,,,~~~~~~~~~~#,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,~~~~~~~~~~#,,,,,,,,,,,,,,,,,,,,,',
    'T.................~~~~~~~~~~#....................T',
    'T...""""""".......~~~~~~~~~~#..."""""""""........T',
    'T...""""""".......~~~~~~~~~~#..."""""""""........T',
    'T...""""""".......~~~~~~~~~~#..."""""""""........T',
    'T.................~~~~~~~~~~#....................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route26', offset: -25 }, west: { map: 'new-bark', offset: -2 } },
  signs: {
    '46,5': 'Route 27. West: New Bark Town, the first town of Johto.',
    '16,5': 'A great waterfall pours down from the cliffs. With Waterfall and the Rising Badge, a Pokémon could climb it.'
  },
  encounters: { walk: '@kanto-route-27-area', water: '@kanto-route-27-area' }
});

G.Maps.def({
  id: 'new-bark', loc: 'new-bark-town', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'lab-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................T',
    'T......................T',
    'T..LLLLLL....HHHH.HHHH.T',
    'T..LLLLLL....HHHH.HHHH.T',
    'T..LLLLLL....HDHH.HDHH.T',
    'T..LLLDLL.....,....,...T',
    'T.....,....S..,....,...T',
    ',,,,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,,,,,,,',
    'T......................T',
    'T..ff....ff.....ff.....T',
    'T......................T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'T~~~~~~~~~~~~~~~~~~~~~~T',
    'TTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route27', offset: 2 }, west: { map: 'route29', offset: 2 } },
  warps: [
    { x: 6, y: 6, to: 'elm-lab', spot: 'door' },
    { x: 14, y: 5, to: 'elm-house', spot: 'door' },
    { x: 19, y: 5, to: 'newbark-house', spot: 'door' }
  ],
  spots: { 'lab-door': [6, 7, 'down'], 'elm-door': [14, 6, 'down'], 'house-door': [19, 6, 'down'] },
  signs: { '11,7': 'New Bark Town. A fresh wind for every new start.' },
  npcs: [
    { id: 'boy', who: 'silver', x: 9, y: 5, dir: 'left', if: '!johto-theft',
      say: "...What are you looking at? This is Professor Elm's lab. They say he keeps rare Pokémon in there. ...Get lost." },
    { id: 'girl', who: 'lass', x: 12, y: 10, move: 'wander', r: 2,
      say: 'Professor Elm studies how Pokémon evolve. Pokémon from Kanto look a little different to him, I bet!' },
    { id: 'man', who: 'gentleman', x: 20, y: 10, move: 'look',
      say: 'West of town is Route 29. At night, different Pokémon come out in the grass. Hoothoot, for one!' }
  ],
  encounters: { water: '@new-bark-town-area' }
});

G.Maps.def({
  id: 'elm-lab', loc: 'new-bark-town', region: 'johto', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor', enter: 'elm.enter',
  rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbh++++++Pbbb', '+++++++++++++', '++++++++ttt++', '+++++++++++++',
         '+++++++++++++', 'bbbb+++++bbbb', '+++++++++++++', '+++++++++++++', 'p+++++++++++p', '++++++X++++++'],
  warps: [{ x: 6, y: 11, to: 'new-bark', spot: 'lab-door' }],
  spots: { door: [6, 11, 'up'], heal: [3, 4, 'up'] },
  signs: { '0,7': 'Research notes: "Some Pokémon evolve when they come to trust their Trainer..."',
           '1,7': 'Research notes: "Some Pokémon evolve when they come to trust their Trainer..."' },
  npcs: [
    { id: 'elm', who: 'elm', x: 7, y: 3, dir: 'down', script: 'elm.elm' },
    { id: 'aide', who: 'aide', x: 3, y: 3, dir: 'down', script: [
      ['say', 'Your Pokémon look tired. Let me use the lab\'s machine on them.'],
      ['healAnim'], ['heal'], ['lastHeal', 'heal'],
      ['say', 'All better! Come back any time.']
    ] },
    { id: 'officer', who: 'officer', x: 6, y: 8, dir: 'up', if: ['rival2-battle', '!rival2-named'], script: 'elm.officer' }
  ],
  items: [
    { x: 8, y: 4, item: 'poke-ball', flag: 'ball-chikorita', script: 'elm.ball-chikorita' },
    { x: 9, y: 4, item: 'poke-ball', flag: 'ball-cyndaquil', script: 'elm.ball-cyndaquil' },
    { x: 10, y: 4, item: 'poke-ball', flag: 'ball-totodile', script: 'elm.ball-totodile' }
  ]
});

G.Maps.def({
  id: 'elm-house', loc: 'new-bark-town', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'new-bark', spot: 'elm-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'wife', who: 'mom', x: 7, y: 4, dir: 'left',
      say: 'My husband forgets to eat when he is working. If you see him, tell him dinner is ready!' },
    { id: 'son', who: 'youngster', x: 2, y: 5, move: 'wander', r: 1,
      say: 'When I grow up, I want to help my dad with his research. Or be a Champion like you!' }
  ]
});

G.Maps.def({
  id: 'newbark-house', loc: 'new-bark-town', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'new-bark', spot: 'house-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [{ id: 'grandpa', who: 'oldman', x: 7, y: 4, dir: 'left',
           say: 'In Johto, morning, day and night each have their own Pokémon. Check your grass at every hour!' }]
});

G.Maps.def({
  id: 'route29', loc: 'johto-route-29', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTT,,TTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T...........,,.........................T',
    'T.."""""""..,,.""""""""....TTTT........T',
    'T.."""""""..,,.""""""""....TTTT........T',
    'T.."""""""..,,.""""""""................T',
    'T...........,,.......................S.T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T......................................T',
    'T....vvvvvvvvvv..TTT..vvvvvvvvv........T',
    'T....."""""""....TTT......"""""""""....T',
    'T....."""""""....TTT......"""""""""....T',
    'T......................................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'new-bark', offset: -2 }, west: { map: 'cherrygrove', offset: -4 }, north: { map: 'route46', offset: 4 } },
  signs: { '37,5': 'Route 29. West: Cherrygrove City. East: New Bark Town.' },
  npcs: [{ id: 'camper', who: 'camper', x: 24, y: 5, move: 'look',
           say: 'Sentret runs around here by day, and Hoothoot comes out at night. Same grass, different Pokémon!' }],
  items: [{ x: 33, y: 2, item: 'potion', flag: 'route29-potion' }],
  encounters: { walk: '@johto-route-29-area' }
});

(() => {
  const T = s => G.T(s);
  const ELM = { name: 'Prof. Elm' };
  const SLUG = { 152: 'chikorita', 155: 'cyndaquil', 158: 'totodile' };
  /** The boy takes the starter strong against yours. */
  const THIEF_PICK = { 152: 155, 155: 158, 158: 152 };
  const ballKey = sp => 'elm-lab:ball-' + SLUG[sp];

  async function elm(h) {
    const F = G.Field;
    if (!F.flag('johto-start')) {
      if (!F.flag('elm-intro')) {
        await h.say(T('Oh! You must be {player}, the Champion from Kanto! Professor Oak told me all about you. I am Professor Elm.'), ELM);
        await h.say(T('I study how Pokémon evolve, and how they hatch from Eggs. Johto is full of things to discover!'), ELM);
        await h.say(T('One thing you should know: here in Johto, a Pokémon only follows a Trainer it respects. And respect is earned with Johto\'s Gym badges.'), ELM);
        await h.say(T('Your Pokémon from Kanto are very strong, so they may ignore your orders until you earn badges here. Each badge makes more of them listen.'), ELM);
        await h.say(T('So why not start fresh? I would like you to raise one of my Pokémon. They are in the Poké Balls on the machine.'), ELM);
        F.setFlag('elm-intro');
      } else await h.say(T('Go on, choose one of the three Pokémon on the machine!'), ELM);
      return;
    }
    if (!F.flag('got-mystery-egg')) {
      await h.say(T('Mr. Pokémon lives north of Cherrygrove City, at the end of Route 30. He said he found something amazing!'), ELM);
      return;
    }
    if (!F.flag('rival2-battle')) {
      await h.say(T('{player}! While you were away, someone broke in and stole one of my Pokémon! The police are searching for him.'), ELM);
      return;
    }
    if (!F.flag('rival2-named')) { await h.say(T('Please, tell the officer everything you saw!'), ELM); return; }
    if (!F.flag('elm-egg')) {
      await h.say(T('So this is what Mr. Pokémon found... A Pokémon Egg! Nobody knows how Eggs come to be. What a mystery!'), ELM);
      await h.say(T('Eggs hatch when they are kept warm and on the move. Would you carry it with you? Walk with it, and it should hatch before long.'), ELM);
      F.setFlag('elm-egg');
      F.save.vars['egg-steps'] = 800;
      await h.say(T('And take these. You will want to catch Johto\'s Pokémon too.'), ELM);
      F.giveItem('poke-ball', 5);
      const j = h.jingle('item');
      await h.say(T('{player} received {item} ×{n}!'), { vars: { item: G.Names.item('poke-ball'), n: 5 } });
      await j;
      await h.say(T('The nearest Gym is in Violet City: west through Route 29 to Cherrygrove City, then north and west along Routes 30 and 31.'), ELM);
      return;
    }
    // Chapter 25: Eggs from the Day Care (route34.js, daycare.js).
    if (F.flag('ruins-done') && !F.flag('egg-report')) {
      if (!F.flag('daycare-hatched')) {
        if (!F.flag('egg-research')) {
          await h.say(T('There you are, {player}! I heard about the Ruins of Alph. Pokémon shaped like letters... the world is full of mysteries!'), ELM);
          await h.say(T('I have a mystery of my own. Remember the Egg Mr. Pokémon found? Since then, the Day Care on Route 34 has been finding Eggs in its yard!'), ELM);
          await h.say(T('They say an Egg sometimes turns up when two Pokémon there get along. Would you find out for me? Hatch an Egg from the Day Care, and show me what comes out!'), ELM);
          F.setFlag('egg-research');
        } else await h.say(T('The Day Care is on Route 34, just south of Goldenrod City. Hatch an Egg from there and bring me the Pokémon!'), ELM);
        return;
      }
      await h.say(T('You hatched an Egg from the Day Care? Let me see...'), ELM);
      await h.say(T('A Pokémon at the very first stage of its family, only just born! So Pokémon really do come from Eggs, and parents pass things on to their young.'), ELM);
      await h.say(T('Thank you, {player}. This is a big step for my research. Keep leaving Pokémon at the Day Care: who knows what will hatch next!'), ELM);
      F.setFlag('egg-report');
      if (G.CreditsUI) await G.CreditsUI.ending(25); else F.setFlag('chapter-25-done');
      return;
    }
    // Chapter 26: held items, at Mr. Pokémon's (cherrygrove.js).
    if (F.flag('egg-report') && !F.flag('held-items')) {
      await h.say(T('Mr. Pokémon called. He heard about your Egg, and he would like to show you something from his collection. His house is at the end of Route 30.'), ELM);
      return;
    }
    if (F.flag('clair-beaten')) {
      if (!F.flag('got-master-ball')) {
        await h.say(T('{player}! All eight of Johto\'s badges! I knew you could do it!'), ELM);
        await h.say(T('This is for you. It is the Master Ball, the finest Poké Ball there is: it catches any wild Pokémon without fail.'), ELM);
        F.giveItem('master-ball', 1);
        F.setFlag('got-master-ball');
        const j = h.jingle('item');
        await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('master-ball') } });
        await j;
        await h.say(T('Oh, and the officer called. The boy who stole my Pokémon was seen heading for Victory Road. He seems to have changed...'), ELM);
      }
      await h.say(T('The Pokémon League is beyond Victory Road: east across Route 27, then north on Route 26. Good luck, {player}!'), ELM);
      return;
    }
    await h.say(T('The Gym in Violet City is waiting. Remember: each badge makes your stronger Pokémon listen a little more.'), ELM);
  }

  /** A Poké Ball on the machine: one Johto starter, and the journey begins. */
  function chooseBall(sp) {
    return async h => {
      const F = G.Field;
      const mon = G.Names.mon(sp);
      if (!F.flag('elm-intro')) { await h.say(T("Those are Professor Elm's Pokémon. Better ask him first.")); return; }
      if (F.flag('johto-start')) { await h.say(T("Professor Elm's Pokémon is resting in this Poké Ball.")); return; }
      if (G.Audio.cry) G.Audio.cry(sp);
      const ask = { 152: T('So you want {mon}, the Grass Pokémon?'), 155: T('So you want {mon}, the Fire Pokémon?'), 158: T('So you want {mon}, the Water Pokémon?') }[sp];
      if (await h.choice(ask, Object.assign({ vars: { mon } }, ELM)) !== 0) return;
      await h.say(T('Wonderful! I think it likes you already.'), ELM);
      F.markDone(ballKey(sp));
      if (G.World.refresh) G.World.refresh();
      const full = F.party().length >= 6;
      const got = F.giveMon(sp, 5);
      const j = h.jingle('item');
      await h.say(T('{player} received {mon} from Prof. Elm!'), { vars: { mon } });
      await j;
      if (full) await h.say(T('Your party was full, so {mon} went to your PC. Use the PC here to swap your team.'), { vars: { mon } });
      await h.nickname(got);
      F.setFlag('johto-start');
      F.save.rival2.starter = THIEF_PICK[sp];
      await h.say(T('Now, I have a favour to ask. My friend Mr. Pokémon says he found something amazing. He lives north of Cherrygrove City, on Route 30.'), ELM);
      await h.say(T('Would you go and see what it is? Your new partner will grow strong on the way!'), ELM);
    };
  }

  /** Back at the lab after the theft: the officer asks for the thief's name. */
  async function officer(h) {
    const F = G.Field, S = F.save;
    await h.say(T('Police! A Pokémon was stolen from this lab. You there, did you see anything?'), { name: 'Officer' });
    await h.say(T('A red-haired boy battled you with it in Cherrygrove? Did he say his name?'), { name: 'Officer' });
    let name = null;
    if (G.NameUI && G.NameUI.ask) name = await G.NameUI.ask({ kind: 'rival2' });
    S.rival2.name = name || 'Silver';
    F.setFlag('rival2-named');
    await h.say(T('{rival2}, you say? Thank you. We will find him!'), { name: 'Officer' });
    h.hide('officer');
    await h.say(T('Thank you, {player}. At least the Pokémon is with a Trainer... I hope he treats it well.'), ELM);
  }

  G.Script.def({
    'elm.elm': [['js', elm]],
    'route26.vr-closed': [['say', 'Victory Road leads to the Pokémon League. Trainers from Johto may only go on once they hold all eight of Johto\'s badges.']],
    'elm.ball-chikorita': [['js', chooseBall(152)]],
    'elm.ball-cyndaquil': [['js', chooseBall(155)]],
    'elm.ball-totodile': [['js', chooseBall(158)]],
    'elm.officer': [['js', officer]],
    'elm.enter': [['if', ['rival2-battle', '!rival2-named'], [['js', officer]]]],
    // The Mystery Egg hatches after var egg-steps steps (field.js).
    'egg.hatch': [['js', async h => {
      const F = G.Field;
      if (!F.count('mystery-egg')) return;
      await h.say(T('Huh? The Mystery Egg is moving!'));
      F.takeItem('mystery-egg', 1);
      const mon = F.giveMon('togepi', 5);
      F.setFlag('egg-hatched');
      const j = h.jingle('caught');
      await h.say(T('{mon} hatched from the Egg!'), { vars: { mon: G.Names.mon(175) } });
      await j;
      await h.nickname(mon);
    }]]
  });
  /** The thief's pick, for the battle in Cherrygrove City (cherrygrove.js). */
  G.Johto = { ballKey };
})();
