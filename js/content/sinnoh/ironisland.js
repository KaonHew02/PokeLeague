/* ============ ironisland.js — Iron Island ============
 * Chapter 51. The boat from Canalave City (canalave.js) lands at a pier; the old mine goes down three floors.
 * On B1F Riley stands in a one-tile way: he comes along (flag riley-with) and his Lucario heals your team after each
 * battle (`afterBattle`, as Cheryl does in Eterna Forest; Platinum's battles beside him need multi battles, which the
 * engine does not have). Two grunts wait at the bottom of B2F, one behind the other (flags iron-grunt1, riley-done).
 * Then Riley gives a Riolu Egg (G.DayCare.egg, flag riolu-egg; with six Eggs carried he waits, flag riley-egg-wait), and Byron
 * is back in his Gym. Platinum's Trainers and wild Pokémon; the grunts' teams are Diamond and Pearl's.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };
  const RILEY = { name: 'Riley' };
  const GRUNT = { name: 'Team Galactic Grunt' };
  const SAILOR = { name: 'Sailor' };
  const WITH_RILEY = { if: ['riley-with', '!riley-done'], script: 'iron.riley-heal' };

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
      '~~~~.......,,.......~~~~',
      '~~~~.......,,.......~~~~',
      '~~~~.......,,.......~~~~',
      '~~~~TTTT...,,.S.TTTT~~~~',
      '~~~~TTTT...,,...TTTT~~~~',
      '~~~~TTTT...,,...TTTT~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~==~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    warps: [{ x: 12, y: 8, to: 'iron-1f', spot: 'door' }],
    spots: { pier: [11, 17, 'up'], mouth: [12, 9, 'down'] },
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
    afterBattle: WITH_RILEY,
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
    afterBattle: WITH_RILEY,
    items: [{ x: 33, y: 2, item: 'max-potion', flag: 'iron-potion' }, { x: 32, y: 13, item: 'ultra-ball', flag: 'iron-ball' }],
    npcs: [
      { id: 'riley2', who: 'riley', x: 12, y: 16, dir: 'left', if: 'scripted' },
      { id: 'riley3', who: 'riley', x: 14, y: 16, dir: 'left', if: ['riley-egg-wait', '!riolu-egg'], script: 'iron.riley-egg' }
    ],
    trainers: [
      { id: 'damon', who: 'hiker', cls: 'hiker', name: 'Damon', x: 14, y: 3, dir: 'down', sight: 2, team: [['nosepass', 35], ['onix', 33], ['steelix', 34]],
        before: 'This mine made my Onix strong. Now it can be a Steelix!',
        defeat: 'Solid.',
        after: 'Onix evolve with a Metal Coat. This island is full of old steel.' },
      { id: 'jonah', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Jonah', x: 26, y: 4, dir: 'left', sight: 3, team: [['quagsire', 35], ['staraptor', 36], ['hippopotas', 38]],
        before: 'I came to train where no one would bother me. You are bothering me!',
        defeat: 'All right, all right.',
        after: 'Riley trains here with his Lucario. They read each other\'s minds.' },
      { id: 'tyler', who: 'battlegirl', cls: 'battle-girl', name: 'Tyler', x: 30, y: 8, dir: 'right', sight: 3, team: [['medicham', 38]],
        before: 'Train in the dark, and you can fight anywhere!',
        defeat: 'I need more light.',
        after: 'Those people in the space suits went that way. Be careful.' },
      { id: 'kendal', who: 'blackbelt', cls: 'black-belt', name: 'Kendal', x: 18, y: 12, dir: 'up', sight: 1, team: [['toxicroak', 38]],
        before: 'Toxicroak and I do not back down. Hiyah!',
        defeat: 'I backed down.',
        after: 'Toxicroak fears Psychic moves more than anything.' },
      { id: 'grunt-iron1', who: 'galactic', cls: 'team-galactic', x: 3, y: 14, dir: 'up', sight: 2, if: '!iron-grunt1', team: [['zubat', 31], ['zubat', 31], ['golbat', 34]],
        before: 'This island belongs to Team Galactic now! Get lost!',
        defeat: 'Hey, that is not fair!',
        win: 'iron.grunt1-win' },
      { id: 'grunt-iron2', who: 'galactic', cls: 'team-galactic', x: 10, y: 16, dir: 'left', sight: 3, if: '!riley-done', team: [['glameow', 32], ['stunky', 32], ['croagunk', 32]],
        before: 'You again? The steel in this mine is ours!',
        defeat: 'Time to run!',
        win: 'iron.riley-bye' }
    ],
    encounters: { walk: '@iron-island-b2f-left' }
  }, CAVE));

  /** Riley in the way: he comes along. */
  async function riley(h) {
    const F = G.Field;
    if (F.flag('riley-with')) return;
    await h.say(T('Hello. I am Riley. I come here to train with my Lucario, but today Team Galactic is on the floors below, frightening the Pokémon.'), RILEY);
    await h.say(T('Let us go down together. My Lucario can look after your team after each battle.'), RILEY);
    await h.fade('out', 0.3);
    F.setFlag('riley-with');
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
    'iron.grunt1-win': [
      ['say', 'My partner is further in. You will not get past him!', GRUNT],
      ['fade', 'out', 0.3], ['setFlag', 'iron-grunt1'], ['fade', 'in', 0.3]
    ],
    'iron.riley-bye': [['js', rileyBye]],
    'iron.riley-egg': [['js', async h => { await egg(h); }]]
  });
})();
