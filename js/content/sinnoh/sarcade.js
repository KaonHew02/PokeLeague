/* ============ sarcade.js — Sinnoh's Battle Arcade and G.Arcade, its rules ============
 * Chapter 92 (Platinum's Battle Arcade, at the Battle Frontier: frontier.js). Three Pokémon of your own (not two of one species,
 * Platinum's banned list), level 50 at most and without their held items, in single or double battles against teams of three at
 * level 50 that hold nothing. Everyone is healed after every battle. Before each battle a roulette of 16 panels spins
 * (G.ArcadeUI.spin; without a screen, `land`), and the panel it stops on changes that battle:
 *   - yours or the opponent's (`who`): Lower HP (20% of each one's HP), Poison / Paralyze / Burn (the whole team, but not the
 *     immune: poison and steel types and Immunity; ground types and Limber; fire types and Water Veil), Sleep (one, not Insomnia or
 *     Vital Spirit) / Freeze (one, not ice types or Magma Armor), Berries / Items (one each from the battle's group, held until
 *     the round ends unless used or replaced), Level Up (three levels);
 *   - the field: Sunny / Rain / Sandstorm / Hail / Fog (the whole battle, rules.weather) and Trick Room (five turns, rules.trickRoom);
 *   - special: Swap (you battle with their three, they with yours), Speed Up / Slow Down (the roulette, until the round ends),
 *     Random (the cursor jumps about next time), 1 BP, 3 BP, No Battle, No Event.
 * The panels a battle allows (`allowed`) come from its round and its place in the round; how the board's 16 panels are drawn
 * (`board`): first whose they are, by the round's performance points (`IMPACT`), then one of that kind. Performance points
 * (`performance`): turns, fainted Pokémon and statuses after each win, from 0 when a round starts. The cursor's speed in frames a
 * panel (`frames`, 30 frames a second). Battle Points by the round (`bpFor`: 2, 2, 2, 2, 4, 4, 5, then 6) and 20 for a round with
 * Dahlia, the Arcade Star, at the 21st and 49th single battle (Platinum's two teams, in any order, IVs of 31; at levels 48 and 47
 * here, Platinum's 50 being too hard for normal difficulty): the Silver / Gold Print
 * (flags sarcade-silver, sarcade-gold). Source: altissimo's Platinum Battle Arcade page.
 * My own reading where the source says nothing: a new board for every battle, a kind with no panel in that battle drawn again,
 * the panels of one kind equally likely, the cursor stops where it is, Level Up and Swap last one battle, Sleep and Freeze hit one at
 * random of those they can, paralysis also spares electric types (this game's rule), No Battle skips the battle as won (no
 * performance points), three opponents in doubles too, Dahlia in single battles only. The item groups are Platinum's (complete
 * since chapter 93). The first round won once chapter 91 is done ends the chapter: `ending(92)`. The words are my own.
 *
 *   G.Arcade.allowed(no) · board(no, points, rng) · land(board, rng) · frames(no, speed) · performance(team, turns) · impact(points)
 *   afflict(mon, s, rng) · apply(tile, mine, theirs, no, rng) · items(no) · bpFor(round) · dahlia(no) · label(tile)
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const SALT = 61150019;
  const N = 3, HALL = 'sarcade', SPINS = 16;

  // ---------------- the lobby and the battle room ----------------
  G.Maps.def(Object.assign({
    id: 'sarcade-lobby', loc: 'fight-area', tileset: 'indoor', palette: 'gym', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++===========++',
      '+++++++++++++++',
      '+rrrrrrrrrrrrr+',
      '+rrrrrrrrrrrrr+',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'sinnoh-frontier', spot: 'arcade-door' },
            { x: 13, y: 1, to: 'sarcade-room', spot: 'player', if: 'scripted', locked: 'sarcade.door' }],
    spots: { door: [7, 8, 'up'], single: [3, 4, 'up'], double: [7, 4, 'up'], guide: [11, 4, 'up'] },
    signs: { '13,1': { script: 'sarcade.door' } },
    npcs: [
      { id: 'single', who: 'maid', x: 3, y: 2, dir: 'down', script: 'sarcade.single' },
      { id: 'double', who: 'maid', x: 7, y: 2, dir: 'down', script: 'sarcade.double' },
      { id: 'guide', who: 'socialite', x: 11, y: 2, dir: 'down', script: 'sarcade.guide' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'sarcade-room', loc: 'fight-area', tileset: 'indoor', palette: 'gym', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWW', 'WWWWWWWWW', '+rrrrrrr+', '+rrrrrrr+', '+++++++++', '+++++++++', '+++++++++', '++++X++++'],
    warps: [{ x: 4, y: 7, to: 'sarcade-lobby', spot: 'single' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, SINNOH));

  // ---------------- the panels ----------------
  /** Each panel: its kind ('side': yours or the opponent's, 'field', 'special'). */
  const PANELS = {
    hp: 'side', psn: 'side', par: 'side', brn: 'side', slp: 'side', frz: 'side', berry: 'side', item: 'side', level: 'side',
    sun: 'field', rain: 'field', sand: 'field', hail: 'field', fog: 'field', trick: 'field',
    swap: 'special', fast: 'special', slow: 'special', random: 'special', bp: 'special', bp3: 'special', skip: 'special', none: 'special'
  };
  const ALL = Object.keys(PANELS);
  /** The panels of each round (battles 1-7, 8-14, ... 36-42; from the 43rd, all of them). */
  const ROUNDS = [
    ['psn', 'par', 'brn', 'berry', 'swap', 'fast', 'slow', 'none'],
    ['hp', 'berry', 'level', 'sun', 'rain', 'sand', 'hail', 'swap', 'fast', 'slow', 'none'],
    ['hp', 'psn', 'par', 'brn', 'berry', 'level', 'sun', 'rain', 'sand', 'hail', 'swap', 'fast', 'slow', 'none'],
    ['hp', 'item', 'level', 'fog', 'trick', 'swap', 'slow', 'bp', 'none'],
    ['hp', 'slp', 'frz', 'item', 'level', 'swap', 'slow', 'random', 'bp', 'skip', 'none'],
    ['hp', 'slp', 'frz', 'item', 'level', 'fog', 'trick', 'swap', 'slow', 'random', 'bp', 'skip', 'none']
  ];
  /** The special panels a battle's place in its round allows: the 1st, 3rd and 5th; the 2nd, 4th and 6th; the 7th. */
  const PLACE = {
    odd: ['swap', 'fast', 'slow', 'random', 'bp', 'none'],
    even: ['swap', 'fast', 'slow', 'random', 'skip', 'bp3', 'none'],
    last: ['none']
  };
  /** Whose the panels are, by the round's performance points: [up to, yours, the opponent's, the field's, special] in %. */
  const IMPACT = [[4, 75, 10, 10, 5], [10, 40, 25, 30, 5], [15, 30, 30, 35, 5], [20, 20, 35, 30, 15], [Infinity, 15, 15, 40, 30]];
  const KINDS = ['me', 'foe', 'field', 'special'];
  /** Frames a panel, by battle (1-28, 29-49, 50+) and speed (-3 ... +3). */
  const FRAMES = [[20, 16, 8, 4, 3, 2, 1], [16, 8, 4, 3, 2, 1, 1], [8, 4, 3, 2, 1, 1, 1]];
  /** The items the Berries and Items panels give, by battle (1-21, 22-49, 50+): Platinum's groups (complete since chapter 93). */
  const ITEMS = [
    { berry: ['cheri-berry', 'chesto-berry', 'pecha-berry', 'rawst-berry', 'aspear-berry', 'persim-berry', 'sitrus-berry', 'lum-berry'],
      item: ['kings-rock', 'quick-claw', 'bright-powder', 'metronome', 'big-root', 'focus-band', 'focus-sash', 'leftovers', 'iron-ball',
             'lagging-tail', 'black-sludge'] },
    { berry: ['persim-berry', 'sitrus-berry', 'lum-berry', 'occa-berry', 'passho-berry', 'wacan-berry', 'rindo-berry', 'yache-berry', 'chople-berry', 'kebia-berry', 'shuca-berry', 'coba-berry', 'payapa-berry', 'tanga-berry', 'charti-berry', 'kasib-berry', 'haban-berry', 'colbur-berry', 'babiri-berry', 'chilan-berry'],
      item: ['iron-ball', 'lagging-tail', 'black-sludge', 'white-herb', 'power-herb', 'muscle-band', 'wise-glasses', 'shell-bell', 'scope-lens',
             'wide-lens', 'zoom-lens', 'expert-belt', 'life-orb'] },
    { berry: ['persim-berry', 'sitrus-berry', 'lum-berry', 'liechi-berry', 'ganlon-berry', 'salac-berry', 'petaya-berry', 'apicot-berry',
              'lansat-berry', 'starf-berry'],
      item: ['focus-band', 'focus-sash', 'leftovers', 'scope-lens', 'wide-lens', 'zoom-lens', 'expert-belt', 'life-orb', 'choice-band',
             'choice-scarf', 'choice-specs'] }
  ];
  const items = no => ITEMS[no <= 21 ? 0 : no <= 49 ? 1 : 2];
  const BP = [2, 2, 2, 2, 4, 4, 5, 6];
  const bpFor = round => BP[Math.min(round, BP.length) - 1];

  /** The panels battle No. no allows, by kind: { side, field, special }. */
  function allowed(no) {
    const r = Math.floor((no - 1) / 7), place = (no - 1) % 7 + 1;
    const list = r < ROUNDS.length ? ROUNDS[r] : ALL;
    const sp = PLACE[place === 7 ? 'last' : place % 2 ? 'odd' : 'even'];
    return { side: list.filter(p => PANELS[p] === 'side'), field: list.filter(p => PANELS[p] === 'field'),
             special: list.filter(p => PANELS[p] === 'special' && sp.includes(p)) };
  }
  const impact = points => IMPACT.find(r => points <= r[0]).slice(1);
  /** The 16 panels of the board: { p, who: 'me' | 'foe' | null } each. */
  function board(no, points, rng) {
    const a = allowed(no), odds = impact(points);
    const of = k => (k === 'me' || k === 'foe' ? a.side : a[k]);
    const kinds = KINDS.map((k, i) => [k, of(k).length ? odds[i] : 0]).filter(([, w]) => w > 0);
    const total = kinds.reduce((s, [, w]) => s + w, 0);
    const out = [];
    for (let i = 0; i < SPINS; i++) {
      let roll = rng.int(1, total), k = kinds[0][0];
      for (const [kind, w] of kinds) { if (roll <= w) { k = kind; break; } roll -= w; }
      out.push({ p: rng.pick(of(k)), who: k === 'me' || k === 'foe' ? k : null });
    }
    return out;
  }
  /** Where the roulette stops without a screen (the tests, the story): a panel at random. */
  const land = (b, rng) => rng.int(0, b.length - 1);
  const frames = (no, speed = 0) => FRAMES[no <= 28 ? 0 : no <= 49 ? 1 : 2][Math.max(-3, Math.min(3, speed)) + 3];
  /** Performance points for a win: by its turns (unknown: 4, my own), the fainted and those with a status. */
  function performance(team, turns) {
    const t = turns == null ? 4 : turns <= 2 ? 10 : turns <= 4 ? 6 : turns <= 6 ? 4 : turns <= 8 ? 2 : 0;
    const f = team.filter(m => m.hp <= 0).length, s = team.filter(m => m.hp > 0 && m.status).length;
    return t + ([8, 6, 4][f] || 0) + ([6, 4, 2][s] || 0);
  }

  /** Statuses: the types and abilities they spare (the Arcade's list; paralysis also electric types, this game's rule). */
  const SPARED = { psn: ['poison', 'steel'], par: ['ground', 'electric'], brn: ['fire'], slp: [], frz: ['ice'] };
  function canHave(mon, s) {
    if (mon.hp <= 0 || mon.status) return false;
    if (G.Mon.types(mon).some(t => SPARED[s].includes(t))) return false;
    return !G.Abilities.blocksStatus({ ability: G.Abilities.of(mon) }, s);
  }
  /** Gives a status, if it can have it: -> true if it did. */
  function afflict(mon, s, rng) {
    if (!canHave(mon, s)) return false;
    mon.status = s;
    if (s === 'slp') mon.slp = rng.int(1, 3);
    return true;
  }
  const raise = (m, n) => { m.lvl += n; m.exp = G.Stats.expAt(G.SPECIES[m.sp].gr, m.lvl); m.hp = G.Mon.maxHp(m); };

  /** A panel's name on the board. */
  function label(tile) {
    const name = { hp: T('Lower HP'), psn: T('Poison'), par: T('Paralyze'), brn: T('Burn'), slp: T('Sleep'), frz: T('Freeze'),
      berry: T('Get Berries'), item: T('Get Items'), level: T('Level Up'), sun: T('Sunny'), rain: T('Rain'), sand: T('Sandstorm'), hail: T('Hail'),
      fog: T('Fog'), trick: T('Trick Room'), swap: T('Swap Teams'), fast: T('Speed Up'), slow: T('Slow Down'), random: T('Random'),
      bp: T('Get 1 BP'), bp3: T('Get 3 BP'), skip: T('No Battle'), none: T('No Event') }[tile.p];
    return { name, who: tile.who === 'me' ? T('Yours') : tile.who === 'foe' ? T('Foe') : '' };
  }

  /**
   * What a panel does before battle No. no: changes `mine` and `theirs` (the battle's Pokémon) and returns
   * { lines: [text], rules: {weather | trickRoom}, swap, skip, speed: -1 | 0 | 1, random, bp }.
   */
  function apply(tile, mine, theirs, no, rng) {
    const out = { lines: [], rules: {}, swap: false, skip: false, speed: 0, random: false, bp: 0 };
    const me = tile.who === 'me', team = me ? mine : theirs, say = s => out.lines.push(s);
    const nothing = () => say(T('Nothing happened.'));
    switch (tile.p) {
      case 'hp':
        for (const m of team) m.hp = Math.max(1, m.hp - Math.floor(G.Mon.maxHp(m) / 5));
        say(me ? T('Your Pokémon lost some HP!') : T('The opponent\'s Pokémon lost some HP!'));
        break;
      case 'psn': case 'par': case 'brn': {
        const hit = team.filter(m => afflict(m, tile.p, rng)).length;
        if (!hit) { nothing(); break; }
        say({ psn: me ? T('Your Pokémon were poisoned!') : T('The opponent\'s Pokémon were poisoned!'),
              par: me ? T('Your Pokémon were paralyzed!') : T('The opponent\'s Pokémon were paralyzed!'),
              brn: me ? T('Your Pokémon were burned!') : T('The opponent\'s Pokémon were burned!') }[tile.p]);
        break;
      }
      case 'slp': case 'frz': {
        const can = team.filter(m => canHave(m, tile.p));
        if (!can.length) { nothing(); break; }
        const m = rng.pick(can);
        afflict(m, tile.p, rng);
        const mon = G.Names.mon(m.sp);
        say(tile.p === 'slp' ? (me ? fmt('{mon} fell asleep!', { mon }) : T('One of the opponent\'s Pokémon fell asleep!'))
          : (me ? fmt('{mon} was frozen solid!', { mon }) : T('One of the opponent\'s Pokémon was frozen solid!')));
        break;
      }
      case 'berry': case 'item': {
        const list = items(no)[tile.p];
        for (const m of team) {
          m.item = rng.pick(list);
          if (me) say(fmt('{mon} is holding the {item}.', { mon: G.Names.mon(m.sp), item: G.Names.item(m.item) }));
        }
        if (!me) say(tile.p === 'berry' ? T('The opponent\'s Pokémon got Berries to hold!') : T('The opponent\'s Pokémon got items to hold!'));
        break;
      }
      case 'level':
        for (const m of team) raise(m, 3);
        say(me ? T('Your Pokémon grew three levels for this battle!') : T('The opponent\'s Pokémon grew three levels for this battle!'));
        break;
      case 'sun': case 'rain': case 'sand': case 'hail': case 'fog':
        out.rules.weather = tile.p;
        say({ sun: T('The sunlight will be harsh in this battle!'), rain: T('It will rain in this battle!'),
              sand: T('A sandstorm will rage in this battle!'), hail: T('It will hail in this battle!'),
              fog: T('A deep fog will cover this battle!') }[tile.p]);
        break;
      case 'trick':
        out.rules.trickRoom = true;
        say(T('The dimensions will be twisted at the start of this battle!'));
        break;
      case 'swap':
        out.swap = true;
        say(T('Swap! You will battle with the opponent\'s Pokémon, and the opponent with yours!'));
        break;
      case 'fast': out.speed = 1; say(T('The roulette will spin faster!')); break;
      case 'slow': out.speed = -1; say(T('The roulette will spin slower!')); break;
      case 'random': out.random = true; say(T('Next time, the roulette will move at random!')); break;
      case 'bp': case 'bp3':
        out.bp = tile.p === 'bp' ? 1 : 3;
        say(fmt('{player} earned {n} BP!', { player: G.Field.save.player.name, n: out.bp }));
        break;
      case 'skip': out.skip = true; say(fmt('No battle! Battle No. {n} counts as won.', { n: no })); break;
      default: say(T('No event this time.'));
    }
    return out;
  }

  /** Dahlia, the Arcade Star: Platinum's teams for the 21st (silver) and 49th (gold) single battle (any order; IVs of 31). Platinum
   *  has them at level 50; here the silver team is at 48 and the gold at 47 (normal difficulty: about 0.7 against the Battle
   *  Tower's typical three holding nothing, tests/story.test.cjs). */
  const IV = [31, 31, 31, 31, 31, 31];
  const DAHLIA = {
    21: { print: 'silver', team: [
      ['dusknoir', 48, ['shadow-punch', 'fling', 'will-o-wisp', 'trick-room'], null, { nature: 'brave', ivs: IV }],
      ['medicham', 48, ['zen-headbutt', 'reversal', 'endure', 'fake-out'], null, { nature: 'jolly', ivs: IV }],
      ['ludicolo', 48, ['waterfall', 'razor-leaf', 'drain-punch', 'swords-dance'], null, { nature: 'adamant', ivs: IV }]] },
    49: { print: 'gold', team: [
      ['zapdos', 47, ['thunderbolt', 'air-cutter', 'heat-wave', 'signal-beam'], null, { nature: 'modest', ivs: IV }],
      ['blaziken', 47, ['flare-blitz', 'superpower', 'thunder-punch', 'night-slash'], null, { nature: 'adamant', ivs: IV }],
      ['togekiss', 47, ['hyper-beam', 'air-slash', 'aura-sphere', 'psychic'], null, { nature: 'modest', ivs: IV }]] }
  };
  const dahlia = no => DAHLIA[no] || null;

  G.Arcade = { N, SPINS, PANELS, ROUNDS, PLACE, IMPACT, FRAMES, ITEMS, BP, items, bpFor, allowed, impact, board, land, frames,
               performance, canHave, afflict, apply, label, DAHLIA, dahlia };

  // ---------------- the challenge ----------------
  const seed = (run, n, k) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + n * 7919 + SALT * k) >>> 0));
  const BEFORE = () => [T('Let\'s see what the roulette has in store for us!'), T('Luck is part of skill. That\'s what I tell myself.'),
    T('Whatever the panel says, I\'m ready!'), T('Round and round it goes. Let\'s battle!')];
  const DEFEAT = () => [T('The roulette was on your side.'), T('Luck had nothing to do with it, did it?'), T('Spun out...'), T('Not my lucky day.')];

  /** The opponent of battle No. n: Dahlia at the 21st and 49th single battle; otherwise three at level 50, holding nothing. */
  function trainerFor(n, mode, run) {
    const D = mode === 'single' && DAHLIA[n];
    if (D) {
      const silver = D.print === 'silver', team = D.team.map(r => r.slice());
      const rng = seed(run, n, 2);
      for (let i = team.length - 1; i > 0; i--) { const j = rng.int(0, i); [team[i], team[j]] = [team[j], team[i]]; }
      return { id: 'dahlia', who: 'dahlia', cls: 'arcade-star', name: 'Dahlia', ai: 'leader', prize: 0, items: {}, music: 'league', brain: D, team,
               before: silver ? T('Twenty wins in a row! I\'m Dahlia, the Arcade Star. Shall we see whose luck burns brighter?')
                 : T('Forty-eight wins! You really know how to ride your luck. Let\'s make this one count!'),
               defeat: silver ? T('What a thrill! Fortune smiles on those who battle with heart.') : T('Amazing! Nobody has ever spun my roulette like that.') };
    }
    const d = G.TowerHall.trainerFor(n, mode, run, { salt: SALT, before: BEFORE(), defeat: DEFEAT() });
    d.team = d.team.slice(0, N).map(r => [r[0], r[1], r[2], null]);
    return d;
  }
  /** The opponents as Pokémon (the panels change them before the battle). */
  const make = (rows, rng) => rows.map(([sp, lvl, moves, item, o]) => Object.assign(G.Mon.create(G.Maps.species(sp), lvl, Object.assign({ rng, moves }, o)),
    item ? { item } : {}));
  /** A fresh copy for a round: level 50 at most, full HP and PP, no held item. */
  const fresh = m => { const c = G.Tower.copy(m); c.item = null; return c; };

  /** Spins the roulette: -> the panel's index. */
  async function spin(no, b, st, rng) {
    const o = { board: b, frames: frames(no, st.speed), random: st.random, rng,
                title: fmt('Battle No. {n}: stop the roulette!', { n: no }) };
    st.random = false;
    if (G.ArcadeUI && G.ArcadeUI.spin) {
      const k = await G.ArcadeUI.spin(o);
      if (Number.isInteger(k) && k >= 0 && k < b.length) return k;
    }
    return land(b, rng);
  }

  async function counter(h, mode) {
    const F = G.Field, Tw = G.Tower;
    await h.say(mode === 'double' ? T('Welcome to the Battle Arcade! This counter is for double battles.') : T('Welcome to the Battle Arcade! This counter is for single battles.'));
    if (!F.flag('sarcade-rules')) {
      F.setFlag('sarcade-rules');
      await h.say(T('Enter three Pokémon. Here they do not hold their own items, and they are healed after every battle.'));
      await h.say(T('Before each battle the roulette spins. Stop it, and the panel it lands on changes the battle: for you, for your opponent, or for both.'));
      await h.say(T('Battle well and the panels favor your opponent more often. Win seven in a row to finish a round and earn Battle Points.'));
    }
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak(mode, HALL), best: Tw.best(mode, HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const party = await G.SinnohCastleHall.pickEntrants(h);
    if (!party) return;
    const team = party.map(fresh), base = team.map(m => m.lvl);
    const run = (+F.getVar('sarcade-runs') || 0) + 1;
    F.setVar('sarcade-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'sarcade-room', 'player']], h);
    const st = { points: 0, speed: 0, random: false };
    let set = false, brainRound = false;
    for (;;) {
      const no = Tw.streak(mode, HALL) + 1, d = trainerFor(no, mode, run);
      const foes = make(d.team, seed(run, no, 3));
      const b = board(no, st.points, seed(run, no, 4));
      await h.say(d.brain ? T('The Arcade Star has come to battle you herself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
      const k = await spin(no, b, st, seed(run, no, 5));
      const tile = b[k], name = label(tile);
      await h.say(name.who ? fmt('The roulette stopped on {panel} ({who})!', { panel: name.name, who: name.who }) : fmt('The roulette stopped on {panel}!', { panel: name.name }));
      const fx = apply(tile, team, foes, no, seed(run, no, 6));
      for (const line of fx.lines) await h.say(line);
      if (fx.bp) Tw.addBp(fx.bp);
      st.speed = Math.max(-3, Math.min(3, st.speed + fx.speed));
      if (fx.random) st.random = true;
      if (fx.skip) Tw.setStreak(mode, no, HALL);
      else {
        const foe = G.World && G.World.actor && G.World.actor('foe');
        if (foe) foe.who = d.who;
        h.show('foe');
        await h.say(d.before, G.TowerHall.speaker(d));
        const mine = fx.swap ? foes : team;
        d.mons = fx.swap ? team : foes;
        F.lastTurns = null;
        const out = await h.battle(d, { canLose: true, record: false, party: mine, rules: Object.assign({ noExp: true, noBag: true, shift: false }, fx.rules) });
        if (out === 'lose') {
          h.hide('foe');
          Tw.setStreak(mode, 0, HALL);
          await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
          break;
        }
        await h.say(d.defeat, G.TowerHall.speaker(d));
        h.hide('foe');
        Tw.setStreak(mode, no, HALL);
        st.points += performance(mine, F.lastTurns);
        if (d.brain) {
          brainRound = true;
          if (d.brain.print === 'silver') F.setFlag('sarcade-silver'); else F.setFlag('sarcade-gold');
          await h.say(d.brain.print === 'silver' ? T('Dahlia recognizes your skill. You earned the Silver Print!') : T('Dahlia recognizes your skill. You earned the Gold Print!'));
        }
      }
      // Healed after every battle: the levels back, the items they still hold kept.
      team.forEach((m, i) => { if (m.lvl !== base[i]) raise(m, base[i] - m.lvl); G.Mon.heal(m); });
      if (no % 7 === 0) {
        const bp = brainRound ? 20 : bpFor(no / 7);
        Tw.addBp(bp);
        await h.say(T('Congratulations! You won seven battles in a row!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
        set = true;
        break;
      }
      const go = await h.choice(T('Battle No. {n} is next. Will you keep going?'), { options: [T('Keep going'), T('Retire')], vars: { n: no + 1 } });
      if (go !== 0) {
        Tw.setStreak(mode, 0, HALL);
        await h.say(T('You retired. Wins in a row: {n}.'), { vars: { n: no } });
        break;
      }
    }
    await G.Script.exec([['warp', 'sarcade-lobby', mode]], h);
    if (set) {
      await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: Tw.streak(mode, HALL) + 1 } });
      // The end of the ninety-second chapter (credits-ui.js), once the ninety-first is done.
      if (F.flag('chapter-91-done') && !F.flag('chapter-92-done')) {
        if (G.CreditsUI) await G.CreditsUI.ending(92); else F.setFlag('chapter-92-done');
      }
    }
  }

  async function guide(h) {
    const F = G.Field;
    await h.say(T('The Arcade Star, Dahlia, battles Trainers who reach the 21st and the 49th single battle in a row. The roulette spins for her too!'));
    await h.say(T('The better you battle, the more panels land on your opponent and the field. Battle slowly, and they land on you.'));
    await h.say(T('Silver Print: {s}. Gold Print: {g}. Battle Points: {n}.'), { vars: {
      s: F.flag('sarcade-silver') ? T('Yes') : T('No'), g: F.flag('sarcade-gold') ? T('Yes') : T('No'), n: G.Tower.bp() } });
  }

  G.Script.def({
    'sarcade.single': [['js', h => counter(h, 'single')]],
    'sarcade.double': [['js', h => counter(h, 'double')]],
    'sarcade.guide': [['js', guide]],
    'sarcade.door': [['say', 'The door to the battle room. Challengers must register at one of the counters first.']]
  });
  G.SinnohArcadeHall = { trainerFor, make };
})();
