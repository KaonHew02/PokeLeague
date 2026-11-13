/* ============ pyramid.js — the Battle Pyramid ============
 * Chapter 83, Hoenn after the League: the last building on the Battle Tower's island (js/content/hoenn/tower.js), a
 * pyramid (the stamp `Z`). The player enters three of their own Pokémon (G.TowerHall.pickEntrants) and climbs seven
 * floors of dark mazes. While a challenge is on, the save's party is three copies (level 50 at most, holding nothing:
 * the originals keep their items) and its Bag is the Battle Bag (var `pyramid-bag`: a Hyper Potion and an Ether to begin
 * with, then whatever was found, kept from one challenge to the next, ten kinds at most); the real party and Bag wait
 * aside (swapIn / swapOut). So the party screen, the Bag and the items used in battle are the challenge's own; besides
 * those items, only a rest on each landing heals (rest: PP back, and the fainted up with half their HP). The floor maps
 * forbid saving (`noSave`), give no Exp. Points (`noExp`) and send a lost
 * battle to `pyramid.lost` (`onLose`) instead of a black-out (js/world/field.js).
 * Each floor (floorPlan) is a 34 x 34 cave, dark, of 4 x 4 sections of 8 x 8 drawn from SECTIONS (every section open in
 * the middle of each side, so the floor is all one piece): the start and the ladder up in two different sections, four
 * Trainers of one Pokémon each (the Battle Tower's, by round, at TRAINER_LEVEL), three items from the round's list, and wild Pokémon of
 * the challenge's theme (THEMES: paralysis, poison, burn, in turn). Every battle won lights a tile more around the
 * player (G.World.brighten, back to dark on the next floor); a beaten Trainer tells how many Trainers and items are
 * left. The ladder leads to a landing: on up, or retire. Seven floors make a round: Battle Points (G.Tower.bpFor),
 * shared with the Tower's Exchange Service Corner, and the streak (rounds in a row, G.Tower.streak('single', 'pyramid')).
 * All three down ends the challenge. Brandon, the Pyramid King, waits at the top of the 3rd round (the Silver Brave
 * Symbol) and the 10th (the Gold) with his teams from Emerald, a little below level 50, and restores your team first.
 * The first round climbed once chapter 82 is done ends the chapter: `ending(83)`.
 * Normal difficulty (after chapter 83): Emerald's Pyramid, with Trainers at 50 and no rest, let the typical team climb
 * round 1 two times in five and round 2 never; hence TRAINER_LEVEL, the rest and Brandon's levels.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const HALL = 'pyramid', FLOOR = 'battle-pyramid-floor', FLOORS = 7;
  const SALT = 239017;                         // the Pyramid's seeds differ from the other halls'
  const TRAINER_LEVEL = 47;                    // the Trainers' one Pokémon (the Tower's are 50): normal difficulty

  // ---------------- The lobby, the landing between floors, the top ----------------
  G.Maps.def(Object.assign({
    id: 'battle-pyramid-lobby', loc: 'battle-pyramid', tileset: 'indoor', palette: 'gym', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++++=======++++',
      '+++++++++++++++',
      '+++++++++++++++',
      't+++++++++++++t',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'pyramid-door' },
            { x: 13, y: 1, to: 'battle-pyramid-landing', spot: 'up', if: 'scripted', locked: 'pyramid.door' }],
    spots: { door: [7, 8, 'up'], single: [7, 4, 'up'] },
    signs: { '13,1': { script: 'pyramid.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'pyramid.single' },
      { id: 'guide', who: 'ranger', x: 2, y: 6, dir: 'right', script: 'pyramid.guide' }
    ]
  }, HOENN));

  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', noSave: true, noExp: true, onLose: 'pyramid.lost' };
  G.Maps.def(Object.assign({
    id: 'battle-pyramid-landing', loc: 'battle-pyramid',
    rows: [
      '#######',
      '#:%:%:#',
      '#:::::#',
      '#:::::#',
      '#######'
    ],
    // The ladders up, to the next floor and to the top: the landing's script takes the player up (`enter`), never a step.
    warps: [{ x: 2, y: 1, to: FLOOR, spot: 'start', if: 'scripted', locked: 'pyramid.ladder' },
            { x: 4, y: 1, to: 'battle-pyramid-top', spot: 'player', if: 'scripted', locked: 'pyramid.ladder' }],
    spots: { up: [3, 2, 'up'] },
    enter: 'pyramid.landing'
  }, CAVE, HOENN));

  G.Maps.def(Object.assign({
    id: 'battle-pyramid-top', loc: 'battle-pyramid',
    rows: [
      '#########',
      '#:::::::#',
      '#:::::::#',
      '#:::::::#',
      '#:::::::#',
      '#########'
    ],
    spots: { player: [4, 4, 'up'] },
    npcs: [{ id: 'king', who: 'brandon', x: 4, y: 2, dir: 'down', if: 'scripted' }]
  }, CAVE, HOENN));

  // ---------------- The mazes ----------------
  // Sections of 8 x 8: '#' rock, ':' sand; t a Trainer's place, i an item's, c the start or the ladder. Each is open in the
  // middle of each side (rows or columns 3 and 4), and all its sand is one piece.
  const SECTIONS = [
    ['###::###', '##:::i##', '#t:::::#', ':::::c::', '::::::::', '#::::::#', '##i::::#', '###::###'],
    ['###::###', '#::::::#', '#:#::#:#', ':::ic:::', '::::::::', '#:#::#:#', '#t::::i#', '###::###'],
    ['###::###', '###:::##', '#t::#:##', '::::#:::', ':::#::::', '##:#::i#', '##:::c##', '###::###'],
    ['###::###', '#::::::#', '#:####:#', '::#ci#::', '::#::#::', '#:##:#:#', '#t:::::#', '###::###'],
    ['###::###', '#i:::###', '#:##:::#', '::#::#::', '::#c:#::', '#:::##:#', '###::t:#', '###::###'],
    ['###::###', '#::::::#', '#:t:::i#', '::::c:::', '::::::::', '#::::::#', '#::::::#', '###::###']
  ];
  const SIZE = 34;                             // 4 x 4 sections and a wall all round

  // The wild Pokémon of a challenge, by theme (Emerald's first three; level value - 5 to + 5), the first two most often.
  const THEMES = [
    [['plusle', 35], ['minun', 35], ['pikachu', 37], ['electabuzz', 37], ['vileplume', 39], ['manectric', 39], ['breloom', 40], ['jolteon', 40]],
    [['gulpin', 36], ['roselia', 36], ['butterfree', 38], ['seviper', 38], ['skarmory', 40], ['ludicolo', 40], ['crobat', 41], ['gengar', 41]],
    [['growlithe', 37], ['vulpix', 37], ['magcargo', 39], ['ninetales', 39], ['medicham', 41], ['weezing', 41], ['dusclops', 42], ['houndoom', 42]]
  ];
  const CHANCE = [20, 20, 15, 15, 10, 10, 5, 5];
  const themeOf = round => THEMES[(round - 1) % THEMES.length];
  const wildTable = round => ({ rate: 7, mons: themeOf(round).map(([sp, v], i) => [sp, v - 5, v + 5, CHANCE[i]]) });

  // What lies on the floors (Emerald's kinds, only those the game has), by weight.
  const FINDS = [['hyper-potion', 24], ['x-attack', 4], ['x-defense', 4], ['x-speed', 4], ['x-sp-atk', 4], ['x-accuracy', 3], ['dire-hit', 3],
    ['guard-spec', 3], ['cheri-berry', 3], ['pecha-berry', 3], ['rawst-berry', 3], ['chesto-berry', 3], ['ether', 9], ['lum-berry', 6],
    ['revive', 8], ['bright-powder', 2], ['leftovers', 2], ['scope-lens', 2], ['quick-claw', 2], ['shell-bell', 1], ['focus-band', 1],
    ['kings-rock', 1], ['max-revive', 2], ['full-restore', 2], ['max-elixir', 1]];
  const weighted = (rng, list) => { let r = rng.int(1, list.reduce((a, [, w]) => a + w, 0)); for (const [k, w] of list) if ((r -= w) <= 0) return k; return list[0][0]; };

  const seed = (run, round, floor, n = 0) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + round * 7919 + floor * 104729 + n * 15485863 + SALT) >>> 0));
  const BEFORE = () => [T('It is dark in here, but I saw you coming!'), T('You will not reach the top past me!'),
    T('One Pokémon is all I need for you.'), T('Lost in the dark? Then let us battle!')];
  const DEFEAT = () => [T('Beaten in the dark...'), T('Go on, the top is still far.'), T('Your Pokémon see better than mine in here.')];

  /** Floor `floor` (1-7) of a round: { rows, start: [x, y], exit: [x, y], trainers, items, encounters }; the same for the same run. */
  function floorPlan(round, floor, run) {
    const rng = seed(run, round, floor);
    const rows = Array.from({ length: SIZE }, () => Array(SIZE).fill('#'));
    const marks = [];                          // per section: { t: [x, y], i: [...], c: [x, y] }
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      const tpl = rng.pick(SECTIONS), m = { i: [] };
      tpl.forEach((line, y) => [...line].forEach((ch, x) => {
        const X = 1 + sx * 8 + x, Y = 1 + sy * 8 + y;
        rows[Y][X] = ch === '#' ? '#' : ':';
        if (ch === 't') m.t = [X, Y];
        else if (ch === 'i') m.i.push([X, Y]);
        else if (ch === 'c') m.c = [X, Y];
      }));
      marks.push(m);
    }
    const order = [...Array(16).keys()];
    for (let i = 15; i > 0; i--) { const j = rng.int(0, i); [order[i], order[j]] = [order[j], order[i]]; }
    const [s0, s1] = order;
    const start = marks[s0].c, exit = marks[s1].c;
    rows[exit[1]][exit[0]] = '%';
    const trainerRound = Math.min(3, round - 1);
    const trainers = order.slice(1, 5).map((s, k) => {
      const d = G.TowerHall.trainerFor(trainerRound * 7 + 1, 'single', run * 53 + round * 11 + floor, { salt: SALT + 1009 * (k + 1), before: BEFORE(), defeat: DEFEAT() });
      const [x, y] = marks[s].t;
      return { id: 'f' + floor + 't' + k, who: d.who, cls: d.cls, name: d.name, x, y, dir: rng.pick(['up', 'down', 'left', 'right']), sight: rng.int(2, 3),
               team: d.team.slice(0, 1).map(r => [r[0], TRAINER_LEVEL, ...r.slice(2)]), before: d.before, defeat: d.defeat, afterScript: 'pyramid.hint', prize: 0, ai: 'leader' };
    });
    const items = order.slice(5, 8).map((s, k) => {
      const [x, y] = rng.pick(marks[s].i);
      return { x, y, item: weighted(rng, FINDS), flag: 'f' + floor + 'i' + k };
    });
    return { rows: rows.map(r => r.join('')), start, exit, trainers, items, encounters: { walk: wildTable(round) } };
  }

  /** The floor as a map: the plan, dark, and every rule of the challenge. */
  function defineFloor(plan) {
    // A new floor: what was beaten or picked up on the last one is forgotten.
    const done = G.Field && G.Field.save && G.Field.save.done;
    if (done) for (const k of Object.keys(done)) if (k.startsWith(FLOOR + ':')) delete done[k];
    G.Maps.def(Object.assign({
      id: FLOOR, loc: 'battle-pyramid', cave: true, dark: true, noFly: true,
      rows: plan.rows, spots: { start: [plan.start[0], plan.start[1], 'down'] },
      warps: [{ x: plan.exit[0], y: plan.exit[1], to: 'battle-pyramid-landing', spot: 'up' }],
      trainers: plan.trainers, items: plan.items, encounters: plan.encounters,
      afterBattle: { script: 'pyramid.won' }
    }, CAVE, HOENN));
  }
  // The floor as it is when nobody is climbing (a save is never made on it, but it must exist).
  defineFloor({ rows: Array.from({ length: SIZE }, (_, y) => (y === 0 || y === SIZE - 1 ? '#'.repeat(SIZE) : y === 5 ? '#::::%' + ':'.repeat(SIZE - 7) + '#'
                : '#' + ':'.repeat(SIZE - 2) + '#')), start: [2, 2], exit: [5, 5], trainers: [], items: [], encounters: { walk: wildTable(1) } });

  // ---------------- The challenge: the party and the Bag swapped ----------------
  const S = () => G.Field.save;
  let stash = null;                            // { party, bag } while a challenge is on
  let state = null;                            // { round, floor, run }
  const START_BAG = { 'hyper-potion': 1, ether: 1 };
  function loadBag() {
    try { const b = JSON.parse(G.Field.getVar('pyramid-bag') || 'null'); if (b && typeof b === 'object') return b; } catch (e) { /* a fresh bag */ }
    return Object.assign({}, START_BAG);
  }
  /** Keeps the Battle Bag for next time, ten kinds at most: -> the kinds left behind. */
  function keepBag(bag) {
    const kinds = Object.keys(bag).filter(k => bag[k] > 0);
    const kept = {};
    kinds.slice(0, 10).forEach(k => { kept[k] = bag[k]; });
    G.Field.setVar('pyramid-bag', JSON.stringify(kept));
    return kinds.slice(10);
  }
  function swapIn(team) {
    stash = { party: S().party, bag: S().bag };
    S().party = team.map(m => Object.assign(G.Tower.copy(m), { item: null }));
    S().bag = loadBag();
  }
  /** The real party and Bag back; what the copies held goes into the Battle Bag. -> the kinds left behind */
  function swapOut() {
    if (!stash) return [];
    const bag = S().bag;
    for (const m of S().party) if (m.item) { bag[m.item] = (bag[m.item] || 0) + 1; m.item = null; }
    const dropped = keepBag(bag);
    S().party = stash.party;
    S().bag = stash.bag;
    stash = null;
    state = null;
    return dropped;
  }
  async function leave(h, dropped) {
    await G.Script.exec([['warp', 'battle-pyramid-lobby', 'single']], h);
    if (dropped.length) await h.say(T('Your Battle Bag holds ten kinds of items at most. Left behind: {items}.'), { vars: { items: dropped.map(id => G.Names.item(id)).join(', ') } });
  }

  async function counter(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('Welcome to the Battle Pyramid! Climb seven dark floors to reach the top.'));
    if (!F.flag('pyramid-rules')) {
      F.setFlag('pyramid-rules');
      await h.say(T('Enter three Pokémon. Inside, your own Bag stays here: you get the Battle Bag, and whatever you find goes into it and stays there for next time.'));
      await h.say(T('In there, your Pokémon heal only with the items you find, and with a short rest on each landing between floors. Every battle you win lets you see a little farther in the dark.'));
      await h.say(T('Pokémon above level 50 battle at level 50, and held items stay with your own Pokémon. You cannot save inside.'));
    }
    await h.say(T('Rounds in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak('single', HALL), best: Tw.best('single', HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const team = await G.TowerHall.pickEntrants(h, 3);
    if (!team) return;
    const run = (+F.getVar('pyramid-runs') || 0) + 1;
    F.setVar('pyramid-runs', run);
    state = { round: Tw.streak('single', HALL) + 1, floor: 0, run };
    swapIn(team);
    await h.say(T('Here is your Battle Bag. Good luck in the dark!'));
    await G.Script.exec([['warp', 'battle-pyramid-landing', 'up']], h);
  }

  /** A rest on a landing (normal difficulty): every move's PP back, the fainted up with half their HP; the others keep
   *  their HP and status. */
  function rest() {
    for (const m of S().party) {
      for (const mv of m.moves) mv.pp = G.Mon.ppMax(mv.id, mv.ppUp);
      if (m.hp <= 0) { m.hp = Math.max(1, Math.floor(G.Mon.maxHp(m) / 2)); m.status = null; m.slp = 0; m.tox = 0; }
    }
  }

  /** The landing (its enter script): the first floor, the next one, or the end of a round at the top. */
  async function landing(h) {
    if (!state || !stash) {                    // nobody is climbing (a reload): back down
      await G.Script.exec([['warp', 'battle-pyramid-lobby', 'single']], h);
      return;
    }
    if (state.floor >= 1) {
      rest();
      await h.say(T('You rest on the landing. Your Pokémon get their PP back, and any that fainted get up with half their HP.'));
      if (state.floor >= FLOORS) return top(h);
      await h.say(T('Floor {n} cleared.'), { vars: { n: state.floor } });
      if (await h.choice(T('Floor {n} is next. Will you keep climbing?'), { options: [T('Keep climbing'), T('Retire')], vars: { n: state.floor + 1 } }) !== 0) {
        G.Tower.setStreak('single', 0, HALL);
        const dropped = swapOut();
        await h.say(T('You retired from the Pyramid.'));
        return leave(h, dropped);
      }
    }
    state.floor++;
    G.PyramidHall.plan = floorPlan(state.round, state.floor, state.run);
    defineFloor(G.PyramidHall.plan);
    await G.Script.exec([['warp', FLOOR, 'start']], h);
    await h.say(T('Floor {n}. It is pitch-dark...'), { vars: { n: state.floor } });
  }

  // ---------------- The top: Brandon, Battle Points ----------------
  // Emerald's teams at level 50 won about half (silver) and a third (gold) of the time against a typical team at full
  // HP: lowered for a normal difficulty (about 0.78 each at these levels; the gold team is the stronger one).
  const KING = {
    3: { print: 'silver', bp: 10, team: [
      ['regirock', 48, ['explosion', 'superpower', 'earthquake', 'ancient-power'], 'quick-claw', { nature: 'adamant' }],
      ['regice', 48, ['ice-beam', 'amnesia', 'thunder', 'rest'], 'chesto-berry', { nature: 'modest' }],
      ['registeel', 48, ['earthquake', 'metal-claw', 'toxic', 'iron-defense'], 'leftovers', { nature: 'adamant' }]] },
    10: { print: 'gold', bp: 20, team: [
      ['articuno', 47, ['blizzard', 'water-pulse', 'aerial-ace', 'reflect'], 'scope-lens', { nature: 'mild' }],
      ['zapdos', 47, ['thunder', 'detect', 'drill-peck', 'light-screen'], 'lum-berry', { nature: 'mild' }],
      ['moltres', 47, ['fire-blast', 'hyper-beam', 'aerial-ace', 'safeguard'], 'bright-powder', { nature: 'mild' }]] }
  };
  function king(k) {
    const silver = k.print === 'silver';
    return { id: 'brandon', who: 'brandon', cls: 'pyramid-king', name: G.T('Brandon', 'pyramid-king'), ai: 'leader', prize: 0, items: {}, music: 'league', team: k.team, king: k,
             before: silver ? T('Ha! You made it to the top! I am Brandon, the Pyramid King. You climbed in the dark; now show me your courage in the light!')
               : T('Back at the top again! Then the time for holding back is over!'),
             defeat: silver ? T('What courage! You have earned this.') : T('Splendid! Nobody has climbed like you.') };
  }

  async function top(h) {
    const F = G.Field, Tw = G.Tower, { round } = state;
    const k = KING[round];
    if (k) {
      await G.Script.exec([['warp', 'battle-pyramid-top', 'player']], h);
      const d = king(k);
      h.show('king');
      await h.say(T('The Pyramid King is waiting at the top!'));
      await h.say(d.before, G.TowerHall.speaker(d));
      // A fair fight in the light (normal difficulty): the team climbed worn down, he restores it first.
      for (const m of S().party) G.Mon.heal(m);
      await h.say(T('Brandon restored your Pokémon to full health.'));
      const out = await h.battle(d, { canLose: true, record: false, rules: { noExp: true, shift: false } });
      if (out === 'lose') return lose(h);
      await h.say(d.defeat, G.TowerHall.speaker(d));
      h.hide('king');
      if (k.print === 'silver') F.setFlag('pyramid-silver'); else F.setFlag('pyramid-gold');
      Tw.addBp(k.bp);
      await h.say(k.print === 'silver' ? T('Brandon recognizes your courage. You earned the Silver Brave Symbol!') : T('Brandon recognizes your courage. You earned the Gold Brave Symbol!'));
      await h.say(T('{player} earned {n} BP!'), { vars: { n: k.bp } });
    }
    Tw.setStreak('single', round, HALL);
    const bp = Tw.bpFor(round);
    Tw.addBp(bp);
    await h.say(T('Congratulations! You reached the top of the Pyramid!'));
    await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
    const dropped = swapOut();
    await leave(h, dropped);
    // The end of the eighty-third chapter (credits-ui.js), once the eighty-second is done.
    if (F.flag('chapter-82-done') && !F.flag('chapter-83-done')) {
      if (G.CreditsUI) G.CreditsUI.ending(83); else F.setFlag('chapter-83-done');
    }
  }

  /** All three down (the floors' onLose, or at the top). */
  async function lose(h) {
    G.Tower.setStreak('single', 0, HALL);
    const dropped = swapOut();
    await h.say(T('All your Pokémon fainted in the dark. Your challenge is over.'));
    await leave(h, dropped);
  }

  /** A beaten Trainer: how many Trainers and items are left on this floor. */
  async function hint(h) {
    const def = G.Maps.get(FLOOR).def, F = G.Field;
    const t = def.trainers.filter(x => !F.isDone(FLOOR + ':' + x.id)).length, i = def.items.filter(x => !F.isDone(FLOOR + ':' + x.flag)).length;
    await h.say(T('On this floor there are still {t} Trainers and {i} items. The ladder up is somewhere in the dark...'), { vars: { t, i } });
  }

  G.Script.def({
    'pyramid.single': [['js', counter]],
    'pyramid.landing': [['js', landing]],
    'pyramid.lost': [['js', lose]],
    'pyramid.won': [['js', () => { if (G.World && G.World.brighten) G.World.brighten(1); }]],
    'pyramid.hint': [['js', hint]],
    'pyramid.door': [['say', 'The door to the battle room. Challengers must register at the counter first.']],
    'pyramid.ladder': [['say', 'The ladder leads up into the dark.']],
    'pyramid.guide': [
      ['say', 'Every win lights up the dark a little. Beat the Trainers and you will see the way up more easily.'],
      ['say', 'Talk to a Trainer you have beaten: they will tell you how many Trainers and items are left on that floor.'],
      ['say', 'They say the Pyramid King waits at the very top for Trainers who climb three times in a row.']
    ]
  });
  G.PyramidHall = { SECTIONS, THEMES, FINDS, KING, SIZE, FLOORS, TRAINER_LEVEL, rest, floorPlan, defineFloor, wildTable, themeOf, loadBag, keepBag,
                    get state() { return state; }, get on() { return !!stash; }, plan: null };
})();
