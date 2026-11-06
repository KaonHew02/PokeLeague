/* ============ twinleaf.js — Twinleaf Town, Route 201, Lake Verity, Barry and the briefcase ============
 * Chapter 44. Twinleaf Town, south of Route 201: Barry's house (his mother puts you up: your room is
 * upstairs, and once the journey has begun she heals you), two more houses. Barry waits outside: he
 * has heard that a legendary Pokémon lives in Lake Verity and runs off to see it (flag barry-met).
 * Route 201 runs from Sandgem Town in the east to the lake in the west; until you have met Barry,
 * Professor Rowan's assistant stands on the way to the lake. At the lakefront Rowan leaves without
 * his briefcase, and a wild Starly attacks: you send out Turtwig, Chimchar or Piplup (Lv. 5) from it
 * and battle alone (flag sinnoh-briefcase); Barry takes the one strong against yours (var
 * barry-starter). Back on Route 201 Rowan explains that Pokémon from other regions only obey up to
 * the level of your Sinnoh badges (flag sinnoh-start: G.Field.obeyCap) and lets you keep it; Barry
 * battles you, just the two new partners (Lv. 5, losing is allowed, flag barry-battled), then
 * Rowan's lab (sandgem.js: G.Sinnoh.dex). Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const ROWAN = { name: 'Prof. Rowan' }, ASSIST = { name: '{assistant}' }, BARRY = { name: 'Barry' };
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const STARTERS = [387, 390, 393];
  /** Barry's starter: the one strong against yours. */
  const COUNTER = { 387: 390, 390: 393, 393: 387 };
  const asst = () => (G.Field.save.player.gender === 'f' ? 'lucas' : 'dawn');

  // ---------------- Twinleaf Town ----------------
  G.Maps.def(Object.assign({
    id: 'twinleaf', loc: 'twinleaf-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'barry-door' },
    rows: [
      'TTTTTTTTTT,,TTTTTTTTTT',
      'T.........,,.........T',
      'T..HHHH...,,...HHHH..T',
      'T..HHHH...,,...HHHH..T',
      'T..HDHH...,,...HDHH..T',
      'T...,.....,,....,....T',
      'T,,,,,,,,,,,,,,,,,,,,T',
      'T.........,,.........T',
      'T..ff.....,,....ff...T',
      'T.........,,...S.....T',
      'T..HHHH...,,.........T',
      'T..HHHH...,,....~~~~.T',
      'T..HDHH...,,....~~~~.T',
      'T...,.....,,....~~~~.T',
      'T,,,,,,,,,,,.........T',
      'T....ff..........ff..T',
      'T....................T',
      'TTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { north: { map: 'route201', offset: 5 } },
    warps: [
      { x: 4, y: 4, to: 'barry-house', spot: 'door' },
      { x: 16, y: 4, to: 'twinleaf-house', spot: 'door' },
      { x: 4, y: 12, to: 'twinleaf-house2', spot: 'door' }
    ],
    spots: { 'barry-door': [4, 5, 'down'], 'house-door': [16, 5, 'down'], 'house2-door': [4, 13, 'down'] },
    signs: { '15,9': 'Twinleaf Town. Where new leaves open, two by two.' },
    npcs: [
      { id: 'barry', who: 'barry', x: 6, y: 5, dir: 'down', if: '!barry-met', script: 'sinnoh.barry' },
      { id: 'girl', who: 'lass', x: 7, y: 8, move: 'wander', r: 2,
        say: 'Barry runs everywhere. Once he ran so fast he went right past his own front door!' },
      { id: 'man', who: 'gentleman', x: 14, y: 15, move: 'look',
        say: 'Our pond is small, but Psyduck still come to swim in it. Bring a Pokémon that can Surf and see for yourself.' }
    ],
    encounters: { water: '@twinleaf-town-area' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'barry-house', loc: 'twinleaf-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p____^_', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'twinleaf', spot: 'barry-door' }, { x: 9, y: 2, to: 'barry-house-2f', spot: 'stairs' }],
    spots: { door: [4, 7, 'up'], stairs: [9, 3, 'down'], mom: [7, 5, 'up'] },
    npcs: [{ id: 'mom', who: 'mom', x: 7, y: 4, dir: 'left', script: 'sinnoh.barry-mom' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'barry-house-2f', loc: 'twinleaf-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbP______^_', '___________', '__ttt______', '___________', '_______p___', '___________'],
    warps: [{ x: 9, y: 2, to: 'barry-house', spot: 'stairs' }],
    spots: { stairs: [9, 3, 'down'] },
    signs: { '0,2': 'A tidy guest room. A note on the shelf says: "Welcome to Sinnoh!"',
             '1,2': 'A tidy guest room. A note on the shelf says: "Welcome to Sinnoh!"' }
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'twinleaf-house', loc: 'twinleaf-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'twinleaf', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'oldman', who: 'oldman', x: 7, y: 4, dir: 'left',
             say: 'Lake Verity is a quiet place. They say a Pokémon lives deep under its water, though no one I know has ever seen it.' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'twinleaf-house2', loc: 'twinleaf-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'twinleaf', spot: 'house2-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'girl', who: 'lass', x: 2, y: 5, move: 'wander', r: 1,
             say: 'My big brother set out on his journey from Twinleaf last spring. Every Trainer in Sinnoh starts somewhere!' }]
  }, SINNOH));

  // ---------------- Route 201 ----------------
  G.Maps.def(Object.assign({
    id: 'route201', loc: 'sinnoh-route-201', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T........TTTT.........TTT....T',
      'T.""""""..TT...""""""...T....T',
      'T."""""".......""""""........T',
      'T."""""".......""""""..."""".T',
      'T......................."""".T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
      'T....,,......""""""....S.....T',
      'T....,,......""""""..........T',
      'T....,,......""""""....""""..T',
      'T.ff.,,................""""..T',
      'T....,,..........ff..........T',
      'TTTTT,,TTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'sandgem', offset: 0 }, south: { map: 'twinleaf', offset: -5 }, west: { map: 'lake-verity', offset: -4 } },
    spots: { 'lake-gate': [1, 6, 'right'] },
    signs: { '23,8': 'Route 201. East: Sandgem Town. South: Twinleaf Town. West: Lake Verity.' },
    npcs: [
      // Professor Rowan's assistant keeps the way to the lake until you have met Barry.
      { id: 'dawn', who: 'dawn', x: 1, y: 6, dir: 'right', if: ['!barry-met', '!gender=f'], script: 'sinnoh.lake-gate' },
      { id: 'lucas', who: 'lucas', x: 1, y: 6, dir: 'right', if: ['!barry-met', 'gender=f'], script: 'sinnoh.lake-gate' },
      { id: 'barry', who: 'barry', x: 3, y: 5, dir: 'left', if: ['barry-met', '!sinnoh-briefcase'], script: 'sinnoh.barry-wait' },
      { id: 'rowan', who: 'rowan', x: 4, y: 6, dir: 'left', if: 'scripted' }
    ],
    items: [{ x: 28, y: 1, item: 'potion', flag: 'route201-potion' }],
    encounters: { walk: '@sinnoh-route-201-area' }
  }, SINNOH));

  // ---------------- Lake Verity ----------------
  G.Maps.def(Object.assign({
    id: 'lake-verity', loc: 'lake-verity', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTT',
      'TTT~~~~####~~~TTTTTT',
      'TT~~~~~####~~~~TTTTT',
      'TT~~~~~#O##~~~~~TTTT',
      'TT~~~~~:::~~~~~~TTTT',
      'TT::~~~~~~~~~~~::TTT',
      'TT::::::::::::::::TT',
      'TT................TT',
      'TT.""""..,..""""..TT',
      'TT.""""..,..""""..TT',
      'TT.......,,,,,,,,,,,',
      'TT.""""......""".TTT',
      'TT...............TTT',
      'TTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { east: { map: 'route201', offset: 4 } },
    warps: [{ x: 8, y: 3, to: 'verity-cavern', spot: 'door', if: 'sinnoh-champion', locked: 'slegends.cave-shut' }],
    spots: { cave: [8, 4, 'down'] },
    triggers: [{ x: 18, y: 10, w: 1, h: 1, if: ['barry-met', '!sinnoh-briefcase'], script: 'sinnoh.lake' }],
    npcs: [
      { id: 'rowan', who: 'rowan', x: 9, y: 6, dir: 'up', if: ['barry-met', '!sinnoh-briefcase'], script: 'sinnoh.lake' },
      { id: 'dawn', who: 'dawn', x: 10, y: 6, dir: 'up', if: ['barry-met', '!sinnoh-briefcase', '!gender=f'], script: 'sinnoh.lake' },
      { id: 'lucas', who: 'lucas', x: 10, y: 6, dir: 'up', if: ['barry-met', '!sinnoh-briefcase', 'gender=f'], script: 'sinnoh.lake' },
      { id: 'barry', who: 'barry', x: 17, y: 10, dir: 'left', if: 'scripted' },
      { id: 'starly', who: 'starly', mon: 'starly', x: 15, y: 10, dir: 'right', fixed: true, if: 'scripted' },
      // Chapter 52: the assistant, facing Team Galactic (lakes.js).
      { id: 'dawn2', who: 'dawn', x: 8, y: 7, dir: 'right', if: ['saturn-valor', '!chapter-52-done', '!gender=f'],
        say: 'Team Galactic got here first! I cannot get past them on my own.' },
      { id: 'lucas2', who: 'lucas', x: 8, y: 7, dir: 'right', if: ['saturn-valor', '!chapter-52-done', 'gender=f'],
        say: 'Team Galactic got here first! I cannot get past them on my own.' }
    ],
    trainers: [
      { id: 'grunt-verity1', who: 'galactic', cls: 'team-galactic', x: 14, y: 7, dir: 'down', sight: 3, if: ['saturn-valor', '!mars-verity'],
        team: [['croagunk', 37, ['swagger', 'mud-bomb', 'sucker-punch', 'nasty-plot']]],
        before: 'Commander Mars said nobody comes through here!',
        defeat: 'She will not be happy...',
        after: 'The lake is ours now.' },
      { id: 'grunt-verity2', who: 'galactic', cls: 'team-galactic', x: 9, y: 8, dir: 'down', sight: 2, if: ['saturn-valor', '!mars-verity'],
        team: [['stunky', 35, ['feint', 'slash', 'toxic', 'night-slash']], ['houndour', 35, ['odor-sleuth', 'beat-up', 'fire-fang', 'feint-attack']]],
        before: 'You again? Commander Mars will take care of you!',
        defeat: 'Commander, help!',
        after: 'Fine. Go and see how far you get.' },
      { id: 'mars', who: 'mars', cls: 'galactic-commander', name: 'Mars', x: 9, y: 6, dir: 'down', sight: 1, ai: 'leader', if: ['saturn-valor', '!mars-verity'],
        team: [['golbat', 38, ['air-cutter', 'bite', 'toxic', 'supersonic']],
               ['bronzor', 38, ['gyro-ball', 'extrasensory', 'iron-defense', 'confuse-ray']],
               ['purugly', 40, ['slash', 'feint-attack', 'hypnosis', 'fake-out'], 'sitrus-berry']],
        before: 'You again? I remember you from the windworks. This time I have a real reason to win. Let us see if you can stop me!',
        defeat: 'Not again!',
        win: 'verity.mars-win' }
    ],
    encounters: { walk: '@lake-verity-before-galactic-intervention', water: '@lake-verity-before-galactic-intervention' }
  }, SINNOH));

  // ---------------- Barry ----------------
  async function barry(h) {
    const F = G.Field;
    if (F.flag('barry-met')) return;
    h.emote('barry', '!');
    await h.say(T('Hey, hey! Are you {player}? The Champion from Hoenn? My mom said you were coming! I am Barry!'), BARRY);
    await h.say(T('Listen! Professor Rowan went to Lake Verity today. And they say a legendary Pokémon lives in that lake!'), BARRY);
    await h.say(T('If we go now, maybe we will see it! The lake is at the west end of Route 201, north of town. Race you there!'), BARRY);
    F.setFlag('barry-met');
    await h.walkTo('barry', 10, 1);
    h.hide('barry');
  }

  // ---------------- the briefcase at Lake Verity ----------------
  async function lake(h) {
    const F = G.Field, a = asst(), me = G.World.player;
    if (F.flag('sinnoh-briefcase')) return;
    // Barry catches up beside you (not behind: your Pokémon follows there).
    if (me) { h.place('barry', me.x - 1, me.y - 1, 'down'); h.face('player', 'left'); }
    h.show('barry');
    await h.say(T('So this is Lake Verity... I do not see any legendary Pokémon. Hey, there are people down by the water!'), BARRY);
    if (me) { await h.walkTo('rowan', me.x - 2, me.y); h.face('rowan', 'right'); await h.walkTo(a, me.x - 3, me.y); h.face(a, 'right'); }
    await h.say(T('So. You must be {player}, the Trainer Birch wrote to me about. I am Rowan.'), ROWAN);
    await h.say(T('I came to watch for the Pokémon of this lake today, but it would not show itself. Perhaps it does not care for visitors.'), ROWAN);
    await h.say(T('...We will talk another time. {assistant}, we are going back to the lab.'), ROWAN);
    await h.fade('out', 0.4);
    h.hide('rowan'); h.hide(a);
    await h.fade('in', 0.4);
    await h.say(T('He is kind of scary... Hey, look! He left his briefcase behind!'), BARRY);
    if (me) h.place('starly', me.x - 2, me.y, 'right');
    h.show('starly');
    h.emote('starly', '!');
    await h.say(T('A wild Starly swooped down on you!'));
    await h.say(T('Whoa, it wants a fight! There are Poké Balls in the briefcase... Quick, take one!'), BARRY);
    let k = -1;
    while (!(k >= 0 && k < STARTERS.length)) k = await h.choice(T('Which Pokémon will you send out?'), { options: STARTERS.map(sp => G.Names.mon(sp)) });
    const mon = F.makeMon(STARTERS[k], 5);
    F.setVar('barry-starter', COUNTER[mon.sp]);
    await h.say(fmt('Then I will take {mon}! You keep that Starly busy!', { mon: G.Names.mon(COUNTER[mon.sp]) }), BARRY);
    // Only the Pokémon from the briefcase battles (the player's own team stays in its Poké Balls).
    const out = await h.wild('starly', 2, { party: [mon], noCatch: true });
    if (out === 'win') await h.say(T('You did it! That Pokémon of yours is pretty good!'), BARRY);
    else await h.say(T('Phew, it flew off. That was close!'), BARRY);
    await h.say(T('Uh-oh... We used the professor\'s Pokémon without asking. We had better take his briefcase back to him!'), BARRY);
    F.setFlag('sinnoh-briefcase');
    h.hide('starly'); h.hide('barry');
    await h.warp('route201', 'lake-gate');
    await giveStarter(h, mon);
  }

  // ---------------- Professor Rowan on Route 201, and Barry's battle ----------------
  async function giveStarter(h, mon) {
    const F = G.Field, S = F.save, a = asst(), me = G.World.player;
    const name = G.Names.mon(mon.sp);
    G.Mon.heal(mon);
    if (me) { h.place('rowan', me.x + 3, me.y, 'left'); h.place(a, me.x + 4, me.y, 'left'); h.place('barry', me.x + 1, me.y + 1, 'up'); }
    h.show('rowan'); h.show(a); h.show('barry');
    await h.say(T('There you are. I came back for my briefcase... and I see you have opened it.'), ROWAN);
    await h.say(T('Hmm. That Pokémon fought for you, and it seems at ease by your side. A Pokémon knows a good Trainer.'), ROWAN);
    await h.say(T('Birch tells me you are the Champion of three regions. But Sinnoh is new to you, and so are its ways.'), ROWAN);
    await h.say(T("A Pokémon trained to a high level in another region only listens to a Trainer who has earned Sinnoh's Gym badges. The more badges, the stronger the Pokémon that obey."), ROWAN);
    await h.say(T('So keep that Pokémon, and raise it here. It will be your partner in Sinnoh.'), ROWAN);
    const full = S.party.length >= 6;
    if (full) F.toBox(mon); else S.party.push(mon);
    S.dex.seen[mon.sp] = 1; S.dex.caught[mon.sp] = 1;
    F.setFlag('sinnoh-start');
    const j = h.jingle('item');
    await h.say(T('{player} received {mon} from Prof. Rowan!'), { vars: { mon: name } });
    await j;
    if (full) await h.say(T('Your party was full, so {mon} went to your PC.'), { vars: { mon: name } });
    await h.nickname(mon);
    await h.say(T('Barry, you may keep yours as well. Now, both of you: come to my lab in Sandgem Town.'), ROWAN);
    await h.fade('out', 0.4);
    h.hide('rowan'); h.hide(a);
    await h.fade('in', 0.4);
    h.face('player', 'down');
    await h.say(T('{player}! Let us battle, right here! Just our new partners, one on one!'), BARRY);
    const out = await h.battle({ id: 'barry-201', who: 'barry', name: 'Barry', prize: 60, ai: 'basic',
      team: [[F.getVar('barry-starter') || 390, 5]] }, { canLose: true, party: [mon] });
    F.setFlag('barry-battled');
    if (out === 'win') await h.say(T('Argh, I lost! I am going to train until I am the strongest Trainer in Sinnoh, you will see!'), BARRY);
    else await h.say(T('I won! I beat a Champion! Well... a Champion with a brand-new Pokémon. It still counts!'), BARRY);
    await h.say(T('Come on, the professor is waiting! Race you to Sandgem!'), BARRY);
    h.hide('barry');
    await h.warp('rowan-lab', 'rowan');
    await G.Sinnoh.dex(h);
  }

  G.Script.def({
    'sinnoh.barry': [['js', barry]],
    'sinnoh.barry-wait': [
      ['say', 'There you are! The lake is just through here. Come on, come on!', BARRY]
    ],
    'sinnoh.lake-gate': [
      ['say', 'Oh, hello! I am {assistant}, Professor Rowan\'s assistant.', ASSIST],
      ['say', 'The professor is studying Lake Verity right now, and he asked not to be disturbed.', ASSIST],
      ['say', 'Are you the Trainer from Hoenn? You are staying with Barry\'s family in Twinleaf Town, just south of here. Barry is dying to meet you!', ASSIST]
    ],
    'sinnoh.lake': [['js', lake]],
    'sinnoh.barry-mom': [
      ['if', 'sinnoh-start', [
        ['say', '{player}, you look worn out. Sit down and rest a while.'],
        ['heal'], ['lastHeal', 'mom'],
        ['jingle', 'heal'],
        ['say', 'There you go! Off with you, and keep an eye on Barry for me, will you?'],
        ['if', ['sinnoh-champion', '!national-dex'], [
          ['say', 'Oh, and Professor Rowan called for you, Champion. He says to come to his lab in Sandgem Town when you have rested.']
        ]],
        ['if', ['national-dex', '!fight-zone-met'], [
          ['say', 'Barry ran off to some place called the Battle Zone. There is a ship from Snowpoint City, he says. He left without his lunch, of course.']
        ]]
      ], [
        ['say', 'Oh! You must be {player}. Professor Rowan asked us to put you up while you are in Sinnoh. Welcome to Twinleaf!'],
        ['say', 'Your room is upstairs. Make yourself at home.'],
        ['if', '!barry-met', [['say', 'Barry has been waiting for you all morning. He is outside somewhere... That boy never sits still!']]]
      ]]
    ]
  });
  G.Sinnoh = Object.assign(G.Sinnoh || {}, { STARTERS, COUNTER, giveStarter });
})();
