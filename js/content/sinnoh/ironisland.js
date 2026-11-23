/* ============ ironisland.js — Iron Island ============
 * Chapter 51. The boat from Canalave City (canalave.js) lands at a pier; the old mine goes down three floors.
 * On B1F Riley stands in a one-tile way: he comes along (flag riley-with) and his Lucario heals your team after each
 * battle (`afterBattle`, as Cheryl does in Eterna Forest). Chapter 101 (Platinum's, from the pret/pokeplatinum
 * decompilation: iron_island_b2f_left_room, res/trainers/data): he walks behind you (`companion`) and fights beside you
 * (`ally`, Lucario Lv. 41) against B2F's four pairs (Platinum's eight Trainers of that room, paired as there) and the two
 * grunts at the bottom, who battle you both together (flag riley-done). Then Riley gives a Riolu Egg (G.DayCare.egg, flag
 * riolu-egg; with six Eggs carried he waits, flag riley-egg-wait), and Byron is back in his Gym. Platinum's Trainers, teams
 * and wild Pokémon; the pairs' places and words are my own.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const RILEY = { name: 'Riley' };
  const GRUNT = { name: 'Team Galactic Grunt' };
  const SAILOR = { name: 'Sailor' };
  const WITH_RILEY = { if: ['riley-with', '!riley-done'], script: 'iron.riley-heal' };
  // Chapter 101: Riley behind you, and beside you against the pairs (Platinum's riley_iron_island).
  const RILEY_TEAM = [['lucario', 41, ['metal-claw', 'force-palm', 'quick-attack', 'bone-rush']]];
  const RILEY_ALONG = { if: ['riley-with', '!riley-done'], who: 'riley', name: 'Riley', say: 'Lucario can feel the Pokémon of this mine. They are frightened. Let us hurry.' };
  const PAIR = { cls: 'double-team', double: true };

  // ---------------- The island ----------------
  G.Maps.def(Object.assign({
    id: 'iron-island', loc: 'iron-island', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: '~',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~..############..~~~~',
      '~~~~..############..~~~~',
      '~~~~..############..~~~~',
      '~~~~..############..~~~~',
      '~~~~..############..~~~~',
      '~~~~..######O#####..~~~~',
      '~~~~..HHHH.,,.......~~~~',
      '~~~~..HHHH.,,.......~~~~',
      '~~~~..HHDH.,,.......~~~~',
      '~~~~TTTT...,,.S.TTTT~~~~',
      '~~~~TTTT...,,...TTTT~~~~',
      '~~~~TTTT...,,...TTTT~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    warps: [{ x: 12, y: 8, to: 'iron-1f', spot: 'door' }, { x: 8, y: 11, to: 'iron-house', spot: 'door' }],   // the house: chapter 104 (gifts.js)
    spots: { pier: [11, 17, 'up'], mouth: [12, 9, 'down'], 'house-door': [8, 12, 'down'] },
    signs: { '14,12': 'Iron Island. The mine has been closed for years. Enter at your own risk.' },
    npcs: [{ id: 'sailor', who: 'sailor', x: 12, y: 17, dir: 'left', script: 'iron.sailor' }],
    encounters: { water: '@iron-island-area' }
  }, SINNOH));

  // ---------------- The mine ----------------
  G.Maps.def(Object.assign({
    id: 'iron-1f', loc: 'iron-island', rows: [
      '######################',
      '######################',
      '##..................##',
      '##................%.##',
      '##....###...........##',
      '##....###....###....##',
      '##....###....###....##',
      '##...........###....##',
      '##...........###....##',
      '##..................##',
      '##..................##',
      '##########O###########',
      '######################'
    ],
    warps: [{ x: 10, y: 11, to: 'iron-island', spot: 'mouth' }, { x: 18, y: 3, to: 'iron-b1f', spot: 'up' }],
    spots: { door: [10, 10, 'up'], ladder: [18, 4, 'down'] },
    encounters: { walk: '@iron-island-1f' }
  }, CAVE));

  G.Maps.def(Object.assign({
    id: 'iron-b1f', loc: 'iron-island', rows: [
      '##############################',
      '##############################',
      '##............##............##',
      '##.%..........##............##',
      '##............##....###.....##',
      '##............##....###.....##',
      '##............##....###.....##',
      '##............##............##',
      '##..........................##',
      '##............##............##',
      '##...###......##............##',
      '##...###......##............##',
      '##...###......##............##',
      '##............##............##',
      '##............##..........%.##',
      '##............##............##',
      '##############################',
      '##############################'
    ],
    warps: [{ x: 3, y: 3, to: 'iron-1f', spot: 'ladder' }, { x: 26, y: 14, to: 'iron-b2f', spot: 'up' }],
    spots: { up: [3, 4, 'down'], down: [26, 13, 'up'] },
    afterBattle: WITH_RILEY, companion: RILEY_ALONG,
    ally: { if: ['riley-with', '!riley-done'], name: 'Riley', team: RILEY_TEAM },      // chapter 102: beside you against wild Pokémon
    npcs: [{ id: 'riley', who: 'riley', x: 14, y: 8, dir: 'left', if: '!riley-with', script: 'iron.riley' }],
    trainers: [
      { id: 'lawrence', who: 'camper', cls: 'camper', name: 'Lawrence', x: 8, y: 6, dir: 'down', sight: 3, team: [['aipom', 34], ['floatzel', 36]],
        before: 'I came to camp in the old mine. It is quiet. Too quiet. Battle me!',
        defeat: 'At least that was not quiet.',
        after: 'I heard people in strange suits on the floor below.' },
      { id: 'summer-iron', who: 'lass', cls: 'picnicker', name: 'Summer', x: 22, y: 10, dir: 'left', sight: 3, team: [['raichu', 37]],
        before: 'A picnic in a mine is not as nice as I thought. A battle will cheer me up!',
        defeat: 'Not cheered up.',
        after: 'Raichu lights up the tunnels for me. It is very handy.' }
    ],
    encounters: { walk: '@iron-island-b1f-left' }
  }, CAVE));

  G.Maps.def(Object.assign({
    id: 'iron-b2f', loc: 'iron-island', rows: [
      '####################################',
      '####################################',
      '##..................###...........##',
      '##.%......###.......###...........##',
      '##........###.....................##',
      '##........###.....................##',
      '##############################....##',
      '##############################....##',
      '##############################....##',
      '##############################....##',
      '##................................##',
      '##............###.................##',
      '##............###.................##',
      '##............###.................##',
      '###.################################',
      '##.................#################',
      '##.................#################',
      '##.................#################',
      '####################################',
      '####################################'
    ],
    warps: [{ x: 3, y: 3, to: 'iron-b1f', spot: 'down' }],
    spots: { up: [3, 4, 'down'] },
    afterBattle: WITH_RILEY, companion: RILEY_ALONG,
    ally: { if: ['riley-with', '!riley-done'], name: 'Riley', team: RILEY_TEAM }, rileyTeam: RILEY_TEAM,
    items: [{ x: 30, y: 13, item: 'iron-plate', flag: 'iron-b2f-iron-plate', then: 'sitems.found' },   // chapter 94
            { x: 33, y: 2, item: 'max-potion', flag: 'iron-potion' }, { x: 32, y: 13, item: 'ultra-ball', flag: 'iron-ball' }],
    npcs: [
      { id: 'riley2', who: 'riley', x: 12, y: 16, dir: 'left', if: 'scripted' },
      { id: 'riley3', who: 'riley', x: 14, y: 16, dir: 'left', if: ['riley-egg-wait', '!riolu-egg'], script: 'iron.riley-egg' }
    ],
    // Chapter 101: Platinum's eight Trainers of this room in four pairs (their teams alternate: rules.tag beside Riley).
    trainers: [
      Object.assign({ id: 'damon-maurice', who: 'hiker', name: 'Damon & Maurice', x: 14, y: 3, dir: 'down', sight: 2, partner: { who: 'hiker', x: 15, y: 3, dir: 'down' },
        team: [['nosepass', 35], ['graveler', 35], ['onix', 33], ['rhyhorn', 35], ['steelix', 34]],
        before: 'Two Hikers, two of you. This mine made our Pokémon as hard as its steel!',
        defeat: 'Solid... but not solid enough.',
        after: 'Onix evolve with a Metal Coat. This island is full of old steel.' }, PAIR),
      Object.assign({ id: 'jonah-brenda', who: 'cooltrainerm', name: 'Jonah & Brenda', x: 26, y: 4, dir: 'left', sight: 3, partner: { who: 'cooltrainer', x: 26, y: 5, dir: 'left' },
        team: [['quagsire', 35], ['lopunny', 38], ['staraptor', 36], ['kirlia', 36], ['hippopotas', 38], ['medicham', 35]],
        before: 'We came down here to train in peace, and here you are with Riley. Fine: two against two!',
        defeat: 'All right, all right. You two work well together.',
        after: 'Riley trains here with his Lucario. They read each other\'s minds.' }, PAIR),
      Object.assign({ id: 'tyler-kendal', who: 'battlegirl', name: 'Tyler & Kendal', x: 30, y: 8, dir: 'right', sight: 3, partner: { who: 'blackbelt', x: 30, y: 9, dir: 'right' },
        team: [['medicham', 38], ['toxicroak', 38]],
        before: 'We train in the dark so we can fight anywhere. Hiyah!',
        defeat: 'We need more light... and more training.',
        after: 'Those people in the space suits went that way. Be careful.' }, PAIR),
      Object.assign({ id: 'brendon-quentin', who: 'engineer', name: 'Brendon & Quentin', x: 3, y: 11, dir: 'down', sight: 2, partner: { who: 'engineer', x: 2, y: 11, dir: 'down' },
        team: [['geodude', 33], ['magnemite', 34], ['geodude', 33], ['machop', 34], ['machoke', 36], ['graveler', 34]],
        before: 'We dig this mine, and those strange people scared off every Pokémon in it. You look like trouble too!',
        defeat: 'Sorry! You are the good kind of trouble.',
        after: 'The people in space suits went down that narrow way.' }, PAIR),
      // Platinum's two grunts (galactic_grunt_iron_island_1 and _2), together against you and Riley.
      Object.assign({ id: 'grunts-iron', who: 'galactic', cls: 'team-galactic', name: '', x: 10, y: 16, dir: 'left', sight: 3, if: '!riley-done',
        partner: { who: 'galactic', x: 10, y: 17, dir: 'left' },
        team: [['zubat', 34], ['glameow', 34], ['houndour', 34], ['stunky', 34], ['golbat', 34], ['croagunk', 34]],
        before: 'Two of you? Then two of us! The steel in this mine belongs to Team Galactic!',
        defeat: 'Time to run!',
        win: 'iron.riley-bye' }, { double: true })
    ],
    encounters: { walk: '@iron-island-b2f-left' }
  }, CAVE));

  /** Riley in the way: he comes along. */
  async function riley(h) {
    const F = G.Field;
    if (F.flag('riley-with')) return;
    await h.say(T('Hello. I am Riley. I come here to train with my Lucario, but today Team Galactic is on the floors below, frightening the Pokémon.'), RILEY);
    await h.say(T('Let us go down together. My Lucario can look after your team after each battle.'), RILEY);
    await h.say(T('The Trainers below battle in pairs, so we will face them as a pair too.'), RILEY);
    await h.fade('out', 0.3);
    F.setFlag('riley-with');
    if (G.World.makeFollower) G.World.makeFollower();
    await h.fade('in', 0.3);
    await h.say(T('Riley will come along with you!'));
  }

  /** The Riolu Egg, if there is room for it. -> given */
  async function egg(h) {
    const F = G.Field, D = G.DayCare;
    if (D.eggs().length >= D.MAX_EGGS) {
      await h.say(T('I have an Egg for you, but you are carrying six already. Hatch a few, and come back for it.'), RILEY);
      F.setFlag('riley-egg-wait');
      return false;
    }
    D.eggs().push(D.egg(447));
    F.setFlag('riolu-egg');
    const j = h.jingle('item');
    await h.say(T('{player} received an Egg from Riley!'));
    await j;
    await h.say(T('Riolu will hatch from it. It can sense what you feel, so raise it with care.'), RILEY);
    return true;
  }

  /** The last grunt beaten: Riley thanks you, the Gym opens. */
  async function rileyBye(h) {
    const F = G.Field, me = G.World.player;
    await h.say(T('We are getting out of here. There is plenty of steel elsewhere!'), GRUNT);
    await h.fade('out', 0.3);
    F.setFlag('riley-done');
    if (G.World.makeFollower) G.World.makeFollower();
    await h.fade('in', 0.3);
    if (me) h.place('riley2', me.x + 2, me.y, 'left');
    h.show('riley2');
    if (me) { await h.walkTo('riley2', me.x + 1, me.y); h.face('riley2', 'left'); h.face('player', 'right'); }
    await h.say(T('That is the last of them. Thank you, {player}. The Pokémon here can rest now.'), RILEY);
    await h.say(T('Byron was looking into the trouble here. He has gone back to his Gym in Canalave, so you can challenge him now.'), RILEY);
    await h.say(T('Before you go, I want you to have this.'), RILEY);
    await egg(h);
    h.hide('riley2');
  }

  G.Script.def({
    'iron.sailor': [
      ['choice', 'Ready to head back to Canalave?', [
        ['fade', 'out', 0.6], ['sfx', 'horn'],
        ['say', 'The boat sailed back to Canalave City...'],
        ['warp', 'canalave', 'harbor']
      ], [
        ['say', 'I will wait right here.', SAILOR]
      ], SAILOR]
    ],
    'iron.riley': [['js', riley]],
    'iron.riley-heal': [
      ['healAnim'], ['heal'],
      ['say', 'Riley\'s Lucario looked after your Pokémon. They are fully healed!']
    ],
    'iron.riley-bye': [['js', rileyBye]],
    'iron.riley-egg': [['js', async h => { await egg(h); }]]
  });
})();
