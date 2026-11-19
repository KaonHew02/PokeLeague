/* ============ scastle.js — Sinnoh's Battle Castle and G.Castle, its rules ============
 * Chapter 91 (Platinum's Battle Castle, at the Battle Frontier: frontier.js). Three Pokémon of your own (not two of one species,
 * Platinum's banned list), level 50 at most and without their held items, in single or double battles against teams of three at
 * level 50. Nothing heals between battles: HP and PP stay as the last battle left them (a fainted Pokémon comes back with 1 HP,
 * status is cured). Castle Points (CP) pay for everything: 10 when a streak starts, kept through the streak, back to 10 after a
 * loss; after each win (earn): 3 for each Pokémon still standing, 3 / 2 / 1 for each at full HP / above half / below half, 1
 * for each without a status, 8 / 6 / 4 for using 5 / 10 / 15 PP or fewer, 7 for each opponent raised to level 55.
 * Before each battle (the menu): Recover (HP 10, PP 8 at rank 2, both 12 at rank 3, a Pokémon), Rent (a held item for one of
 * yours, by the Items rank), the opponents (their names and HP 1, their summary 2, their moves 5 at rank 2, level +5 for 1 or
 * -5 for 15: each per Pokémon, here for the whole team at once, my own), the ranks (Info to 2 for 50; Recovery 100 a rank to 3;
 * Items 100 to 2 and 150 to 3), Pass (from the 21st win, 50: the next battle is skipped and counted won). Battle Points by the
 * round (G.Tower.bpFor) and 20 for a round with Darach, the Castle Valet, at the 21st and 49th single battle (Platinum's two
 * teams for each, A or B at random a challenge; Houndoom's Focus Sash a Focus Band and Entei's Shuca Berry a Lum Berry, the
 * game having neither): the Silver / Gold Print (flags scastle-silver, scastle-gold).
 * Each round starts with the three at full HP and PP and without rented items (my own reading); the CP and the ranks go on.
 * The rentals are the items of Platinum's lists this game has. The first round won once chapter 90 is done ends the chapter:
 * `ending(91)`. The words are my own.
 *
 *   G.Castle.earn(team, ppUsed, raised) · state() · start() · lose() · spend(n) -> bool · rank(kind) · rankUp(kind) -> bool
 *   PRICES · ITEMS · RANK_COST · items(rank) · darach(n, k)
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const SALT = 49979687;
  const N = 3, START_CP = 10, PASS_AFTER = 21;

  // ---------------- the lobby and the battle room ----------------
  G.Maps.def(Object.assign({
    id: 'scastle-lobby', loc: 'fight-area', tileset: 'indoor', palette: 'villa', music: 'center', battleBg: 'indoor',
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
    warps: [{ x: 7, y: 8, to: 'sinnoh-frontier', spot: 'castle-door' },
            { x: 13, y: 1, to: 'scastle-room', spot: 'player', if: 'scripted', locked: 'scastle.door' }],
    spots: { door: [7, 8, 'up'], single: [3, 4, 'up'], double: [7, 4, 'up'], guide: [11, 4, 'up'] },
    signs: { '13,1': { script: 'scastle.door' } },
    npcs: [
      { id: 'single', who: 'maid', x: 3, y: 2, dir: 'down', script: 'scastle.single' },
      { id: 'double', who: 'maid', x: 7, y: 2, dir: 'down', script: 'scastle.double' },
      { id: 'guide', who: 'gentleman', x: 11, y: 2, dir: 'down', script: 'scastle.guide' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'scastle-room', loc: 'fight-area', tileset: 'indoor', palette: 'villa', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWW', 'WWWWWWWWW', '+rrrrrrr+', '+rrrrrrr+', '+++++++++', '+++++++++', '+++++++++', '++++X++++'],
    warps: [{ x: 4, y: 7, to: 'scastle-lobby', spot: 'single' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [{ id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' }]
  }, SINNOH));

  // ---------------- the rules ----------------
  const PRICES = { identify: 1, summary: 2, moves: 5, up: 1, down: 15, hp: 10, pp: 8, full: 12, pass: 50 };
  const RANK_COST = { info: [50], rec: [100, 100], item: [100, 150] };        // to rank 2, then to rank 3
  const MAX_RANK = { info: 2, rec: 3, item: 3 };
  /** The rentals by Items rank: [item, CP] (the ones of Platinum's lists this game has). */
  const ITEMS = [
    [['cheri-berry', 2], ['chesto-berry', 2], ['pecha-berry', 2], ['rawst-berry', 2], ['aspear-berry', 2], ['lum-berry', 5], ['sitrus-berry', 5]],
    [['kings-rock', 10], ['light-clay', 10], ['quick-claw', 15], ['shell-bell', 15], ['light-ball', 15], ['thick-club', 15]],
    [['white-herb', 5], ['focus-band', 15], ['leftovers', 20], ['bright-powder', 20], ['scope-lens', 20]]
  ];
  const items = rank => ITEMS.slice(0, rank).flat();

  /** CP for a win: `team` the three after the battle, `ppUsed` the PP they used in it, `raised` the opponents at level 55. */
  function earn(team, ppUsed, raised = 0) {
    let cp = 0;
    for (const m of team) {
      if (m.hp <= 0) continue;
      const max = G.Mon.maxHp(m);
      cp += 3;
      cp += m.hp >= max ? 3 : m.hp * 2 > max ? 2 : 1;
      if (!m.status) cp += 1;
    }
    cp += ppUsed <= 5 ? 8 : ppUsed <= 10 ? 6 : ppUsed <= 15 ? 4 : 0;
    return cp + 7 * raised;
  }

  // The state, in vars: the CP and the three ranks.
  const F = () => G.Field;
  const num = (k, d) => { const v = F().getVar(k); return v == null || v === '' || !Number.isFinite(+v) ? d : +v; };
  const state = () => ({ cp: num('scastle-cp', START_CP), info: num('scastle-info', 1), rec: num('scastle-rec', 1), item: num('scastle-item', 1) });
  const rank = kind => state()[kind];
  /** A new streak: 10 CP, every rank 1. */
  function start() { F().setVar('scastle-cp', START_CP); for (const k of ['info', 'rec', 'item']) F().setVar('scastle-' + k, 1); }
  const lose = start;
  const addCp = n => F().setVar('scastle-cp', state().cp + n);
  /** Pays n CP: false (nothing paid) if there are not enough. */
  function spend(n) { const c = state().cp; if (c < n) return false; F().setVar('scastle-cp', c - n); return true; }
  /** The cost of the next rank of a kind, or null at the top. */
  const nextCost = kind => (rank(kind) >= MAX_RANK[kind] ? null : RANK_COST[kind][rank(kind) - 1]);
  function rankUp(kind) {
    const c = nextCost(kind);
    if (c == null || !spend(c)) return false;
    F().setVar('scastle-' + kind, rank(kind) + 1);
    return true;
  }

  /** Darach, the Castle Valet: Platinum's teams A and B for the 21st (silver) and 49th (gold) single battle. */
  const DARACH = {
    21: { print: 'silver', teams: [
      [['staraptor', 50, ['return', 'aerial-ace', 'double-team', 'roost'], 'kings-rock'],
       ['empoleon', 50, ['waterfall', 'metal-claw', 'brick-break', 'knock-off'], 'razor-claw'],
       ['houndoom', 50, ['fire-fang', 'crunch', 'roar', 'payback'], 'focus-band']],
      [['staraptor', 50, ['close-combat', 'aerial-ace', 'endure', 'quick-attack'], 'kings-rock'],
       ['empoleon', 50, ['drill-peck', 'aqua-jet', 'shadow-claw', 'rock-slide'], 'razor-claw'],
       ['houndoom', 50, ['fire-fang', 'thunder-fang', 'reversal', 'endure'], 'focus-band']]] },
    49: { print: 'gold', teams: [
      [['entei', 50, ['fire-blast', 'solar-beam', 'hyper-beam', 'sunny-day'], 'lum-berry'],
       ['empoleon', 50, ['surf', 'earthquake', 'blizzard', 'signal-beam'], 'quick-claw'],
       ['gallade', 50, ['psycho-cut', 'stone-edge', 'aerial-ace', 'x-scissor'], 'scope-lens']],
      [['entei', 50, ['overheat', 'extrasensory', 'shadow-ball', 'calm-mind'], 'lum-berry'],
       ['empoleon', 50, ['hydro-pump', 'flash-cannon', 'drill-peck', 'earthquake'], 'quick-claw'],
       ['gallade', 50, ['psycho-cut', 'close-combat', 'leaf-blade', 'sucker-punch'], 'scope-lens']]] }
  };
  const darach = (n, k) => DARACH[n] && DARACH[n].teams[k];

  G.Castle = { N, START_CP, PASS_AFTER, PRICES, RANK_COST, MAX_RANK, ITEMS, items, earn, state, rank, start, lose, spend, nextCost, rankUp, addCp, DARACH, darach };

  // ---------------- the challenge ----------------
  const seed = (run, n, k) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + n * 7919 + SALT * k) >>> 0));
  const BEFORE = () => [T('Welcome to the castle, challenger. Allow me to show you how we battle here.'), T('Your Pokémon look tired. Good.'),
    T('Every point you spend is a point you do not have. Did you spend wisely?'), T('A noble battle, then!')];
  const DEFEAT = () => [T('A royal performance.'), T('I should have saved my points...'), T('You are welcome at court any time.'), T('Defeated with grace, at least.')];

  /** The opponent of battle No. n: Darach at the 21st and 49th single battle; otherwise three at level 50. */
  function trainerFor(n, mode, run) {
    const D = mode === 'single' && DARACH[n];
    if (D) {
      const silver = D.print === 'silver';
      return { id: 'darach', who: 'darach', cls: 'castle-valet', name: 'Darach', ai: 'leader', prize: 0, items: {}, music: 'league', brain: D,
               team: D.teams[seed(run, n, 2).int(0, 1)].map(r => r.slice()),
               before: silver ? T('Twenty wins in my lady\'s castle! I am Darach, the Castle Valet. Allow me to battle you in her place.')
                 : T('Forty-eight wins. My lady would be delighted. I, however, intend to stop you here.'),
               defeat: silver ? T('Magnificent. I shall report your victory to my lady at once.') : T('Splendid... I have served the castle many years, and seen nothing finer.') };
    }
    const d = G.TowerHall.trainerFor(n, mode, run, { salt: SALT, before: BEFORE(), defeat: DEFEAT() });
    d.team = d.team.slice(0, N);
    return d;
  }

  async function choose(h, title, opts) {
    if (G.Popup && G.Popup.choose) return G.Popup.choose(title, opts);
    const k = await h.choice(title, { options: opts.map(o => o.label) });
    return (opts[k] || {}).value;
  }
  const pickFrom = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
  const cpLine = () => fmt('Castle Points: {n}.', { n: state().cp });
  const hpText = m => fmt('{mon} HP {hp}/{max}', { mon: G.Names.mon(m.sp), hp: Math.max(0, m.hp), max: G.Mon.maxHp(m) });

  /** Picks the three to enter: one by one, not two of one species. -> them, or null */
  async function pickEntrants(h) {
    const F = G.Field, Tw = G.Tower, party = F.party(), pick = pickFrom(h), picks = [];
    if (party.filter(m => !Tw.SINNOH_BANNED.includes(m.sp)).length < N) { await h.say(T('You need at least {n} Pokémon that can enter.'), { vars: { n: N } }); return null; }
    const why = (m, chosen) => (Tw.SINNOH_BANNED.includes(m.sp) ? 'banned' : chosen.some(c => c.sp === m.sp) ? 'species' : null);
    const NOTE = { banned: T('Cannot enter'), species: T('Same species') };
    while (picks.length < N) {
      const chosen = picks.map(i => party[i]);
      const i = await pick({ title: fmt('Choose Pokémon {k} of {n}.', { k: picks.length + 1, n: N }),
        note: (m, j) => (picks.includes(j) ? fmt('No. {k}', { k: picks.indexOf(j) + 1 }) : NOTE[why(m, chosen)] || null),
        disabled: (m, j) => picks.includes(j) || !!why(m, chosen) });
      if (i == null || i < 0 || picks.includes(i) || !party[i] || why(party[i], chosen)) { await h.say(T('Please come again!')); return null; }
      picks.push(i);
    }
    return picks.map(i => party[i]);
  }

  /** A fresh copy for a round: level 50 at most, full HP and PP, no held item. */
  const fresh = m => { const c = G.Tower.copy(m); c.item = null; return c; };

  // The menu before a battle: -> 'battle' | 'pass'
  async function menu(h, team, d, no, look) {
    for (;;) {
      const st = state();
      const opts = [T('Battle!'), T('Recover'), T('Rent an item'), T('The opponents'), T('Ranks')];
      const canPass = no > PASS_AFTER && !d.brain;
      if (canPass) opts.push(T('Pass'));
      const k = await h.choice(fmt('Battle No. {n}. Castle Points: {cp}. What will you do?', { n: no, cp: st.cp }), { options: opts });
      if (k === 0 || k == null || k < 0) return 'battle';
      if (k === 1) await recover(h, team);
      else if (k === 2) await rent(h, team);
      else if (k === 3) await info(h, d, look);
      else if (k === 4) await ranks(h);
      else if (k === 5 && canPass) {
        if (await h.choice(fmt('Skip battle No. {n} for {cp} CP?', { n: no, cp: PRICES.pass }), {}) !== 0) continue;
        if (!spend(PRICES.pass)) { await h.say(T('You do not have enough Castle Points.')); continue; }
        return 'pass';
      }
    }
  }
  async function whose(h, team, title) {
    const v = await choose(h, title, team.map((m, i) => ({ label: hpText(m), value: 'm' + i })).concat([{ label: T('Cancel'), value: null, back: true }]));
    return v ? team[+v.slice(1)] : null;
  }
  async function recover(h, team) {
    const m = await whose(h, team, T('Which Pokémon?'));
    if (!m) return;
    const r = rank('rec');
    const opts = [{ label: fmt('HP · {cp} CP', { cp: PRICES.hp }), value: 'hp' }];
    if (r >= 2) opts.push({ label: fmt('PP · {cp} CP', { cp: PRICES.pp }), value: 'pp' });
    if (r >= 3) opts.push({ label: fmt('HP and PP · {cp} CP', { cp: PRICES.full }), value: 'full' });
    const v = await choose(h, cpLine(), opts.concat([{ label: T('Cancel'), value: null, back: true }]));
    if (!v) return;
    if (!spend(PRICES[v])) { await h.say(T('You do not have enough Castle Points.')); return; }
    if (v !== 'pp') m.hp = G.Mon.maxHp(m);
    if (v !== 'hp') for (const x of m.moves) x.pp = G.Mon.ppMax(x.id, x.ppUp);
    await h.say(fmt('{mon} recovered!', { mon: G.Names.mon(m.sp) }));
  }
  async function rent(h, team) {
    const m = await whose(h, team, T('Which Pokémon will hold it?'));
    if (!m) return;
    const list = items(rank('item'));
    const v = await choose(h, cpLine(), list.map(([id, cp]) => ({ label: fmt('{item} · {cp} CP', { item: G.Names.item(id), cp }), value: id }))
      .concat([{ label: T('Cancel'), value: null, back: true }]));
    if (!v) return;
    if (!spend(list.find(([id]) => id === v)[1])) { await h.say(T('You do not have enough Castle Points.')); return; }
    m.item = v;
    await h.say(fmt('{mon} is holding the {item}.', { mon: G.Names.mon(m.sp), item: G.Names.item(v) }));
  }
  /** The opponents, for the whole team: names and HP, summaries, moves (Info rank 2), the level up or down for this battle. */
  async function info(h, d, look) {
    const n = d.team.length, opts = [
      { label: fmt('Who they are · {cp} CP', { cp: PRICES.identify * n }), value: 'identify' },
      { label: fmt('Their summary · {cp} CP', { cp: PRICES.summary * n }), value: 'summary' }];
    if (rank('info') >= 2) opts.push({ label: fmt('Their moves · {cp} CP', { cp: PRICES.moves * n }), value: 'moves' });
    if (!look.level) {
      opts.push({ label: fmt('Their level +5 · {cp} CP', { cp: PRICES.up * n }), value: 'up' });
      opts.push({ label: fmt('Their level -5 · {cp} CP', { cp: PRICES.down * n }), value: 'down' });
    }
    const v = await choose(h, cpLine(), opts.concat([{ label: T('Cancel'), value: null, back: true }]));
    if (!v) return;
    if (!spend(PRICES[v] * n)) { await h.say(T('You do not have enough Castle Points.')); return; }
    if (v === 'up' || v === 'down') {
      look.level = v === 'up' ? 5 : -5;
      for (const r of d.team) r[1] += look.level;
      await h.say(fmt('Your opponents will battle at level {n}.', { n: d.team[0][1] }));
      return;
    }
    for (const [sp, lvl, moves, item] of d.team) {
      const name = G.Names.mon(G.Maps.species(sp));
      if (v === 'identify') await h.say(fmt('{mon}, level {lvl}, at full HP.', { mon: name, lvl }));
      else if (v === 'summary') await h.say(fmt('{mon}, level {lvl}, holding {item}.', { mon: name, lvl, item: item ? G.Names.item(item) : T('nothing') }));
      else await h.say(fmt('{mon}: {moves}.', { mon: name, moves: moves.map(x => G.Names.move(x)).join(' / ') }));
    }
  }
  async function ranks(h) {
    const name = { info: T('Info'), rec: T('Recovery'), item: T('Items') };
    const opts = ['info', 'rec', 'item'].map(k => {
      const c = nextCost(k);
      return { label: c == null ? fmt('{kind}: rank {r} (the top)', { kind: name[k], r: rank(k) }) : fmt('{kind}: rank {r} → {next} · {cp} CP', { kind: name[k], r: rank(k), next: rank(k) + 1, cp: c }), value: k };
    });
    const v = await choose(h, cpLine(), opts.concat([{ label: T('Cancel'), value: null, back: true }]));
    if (!v || nextCost(v) == null) return;
    if (!rankUp(v)) { await h.say(T('You do not have enough Castle Points.')); return; }
    await h.say(fmt('{kind} rank up! It is now rank {r}.', { kind: name[v], r: rank(v) }));
  }

  async function counter(h, mode) {
    const F = G.Field, Tw = G.Tower, HALL = 'scastle';
    await h.say(mode === 'double' ? T('Welcome to the Battle Castle! This counter is for double battles.') : T('Welcome to the Battle Castle! This counter is for single battles.'));
    if (!F.flag('scastle-rules')) {
      F.setFlag('scastle-rules');
      await h.say(T('Enter three Pokémon. Here they do not hold their own items, and nothing heals them between battles.'));
      await h.say(T('Castle Points pay for everything: healing, items to hold, a look at your opponents. You earn them by winning well.'));
      await h.say(T('Win seven in a row to finish a round and earn Battle Points. Your Castle Points last as long as your streak.'));
    }
    if (!Tw.streak(mode, HALL)) start();
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak(mode, HALL), best: Tw.best(mode, HALL) } });
    await h.say(cpLine());
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const party = await pickEntrants(h);
    if (!party) return;
    const team = party.map(fresh);
    const run = (+F.getVar('scastle-runs') || 0) + 1;
    F.setVar('scastle-runs', run);
    await h.say(T('Thank you. Please follow me to the battle room.'));
    await G.Script.exec([['warp', 'scastle-room', 'player']], h);
    let set = false, brainRound = false;
    for (;;) {
      const no = Tw.streak(mode, HALL) + 1, d = trainerFor(no, mode, run), look = { level: 0 };
      const choice = await menu(h, team, d, no, look);
      if (choice === 'pass') {
        Tw.setStreak(mode, no, HALL);
        await h.say(fmt('Battle No. {n} was skipped.', { n: no }));
      } else {
        const foe = G.World && G.World.actor && G.World.actor('foe');
        if (foe) foe.who = d.who;
        h.show('foe');
        await h.say(d.brain ? T('The Castle Valet has come to battle you himself!') : T('Battle No. {n}! Here comes your opponent.'), { vars: { n: no } });
        await h.say(d.before, G.TowerHall.speaker(d));
        const ppBefore = team.reduce((a, m) => a + m.moves.reduce((b, x) => b + x.pp, 0), 0);
        const out = await h.battle(d, { canLose: true, record: false, party: team, rules: { noExp: true, noBag: true, shift: false } });
        if (out === 'lose') {
          h.hide('foe');
          Tw.setStreak(mode, 0, HALL);
          lose();
          await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
          break;
        }
        await h.say(d.defeat, G.TowerHall.speaker(d));
        h.hide('foe');
        Tw.setStreak(mode, no, HALL);
        const ppUsed = Math.max(0, ppBefore - team.reduce((a, m) => a + m.moves.reduce((b, x) => b + x.pp, 0), 0));
        const got = earn(team, ppUsed, look.level > 0 ? d.team.length : 0);
        addCp(got);
        for (const m of team) { if (m.hp <= 0) m.hp = 1; m.status = null; m.slp = 0; m.tox = 0; }
        await h.say(fmt('{player} earned {n} CP! Castle Points: {cp}.', { n: got, cp: state().cp }));
        if (d.brain) {
          brainRound = true;
          if (d.brain.print === 'silver') F.setFlag('scastle-silver'); else F.setFlag('scastle-gold');
          await h.say(d.brain.print === 'silver' ? T('Darach recognizes your skill. You earned the Silver Print!') : T('Darach recognizes your skill. You earned the Gold Print!'));
        }
      }
      if (no % 7 === 0) {
        const bp = brainRound ? 20 : Tw.bpFor(no / 7);
        Tw.addBp(bp);
        await h.say(T('Congratulations! You won seven battles in a row!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
        set = true;
        break;
      }
      const go = await h.choice(T('Battle No. {n} is next. Will you keep going?'), { options: [T('Keep going'), T('Retire')], vars: { n: no + 1 } });
      if (go !== 0) {
        Tw.setStreak(mode, 0, HALL);
        lose();
        await h.say(T('You retired. Wins in a row: {n}.'), { vars: { n: no } });
        break;
      }
    }
    await G.Script.exec([['warp', 'scastle-lobby', mode]], h);
    if (set) {
      await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: Tw.streak(mode, HALL) + 1 } });
      // The end of the ninety-first chapter (credits-ui.js), once the ninetieth is done.
      if (F.flag('chapter-90-done') && !F.flag('chapter-91-done')) {
        if (G.CreditsUI) await G.CreditsUI.ending(91); else F.setFlag('chapter-91-done');
      }
    }
  }

  async function guide(h) {
    const F = G.Field, st = state();
    await h.say(T('The Castle Valet, Darach, battles in his lady\'s place against Trainers who reach the 21st and the 49th single battle in a row.'));
    await h.say(fmt('Castle Points: {cp}. Ranks: Info {i}, Recovery {r}, Items {t}.', { cp: st.cp, i: st.info, r: st.rec, t: st.item }));
    await h.say(T('Silver Print: {s}. Gold Print: {g}. Battle Points: {n}.'), { vars: {
      s: F.flag('scastle-silver') ? T('Yes') : T('No'), g: F.flag('scastle-gold') ? T('Yes') : T('No'), n: G.Tower.bp() } });
  }

  G.Script.def({
    'scastle.single': [['js', h => counter(h, 'single')]],
    'scastle.double': [['js', h => counter(h, 'double')]],
    'scastle.guide': [['js', guide]],
    'scastle.door': [['say', 'The door to the battle room. Challengers must register at one of the counters first.']]
  });
  G.SinnohCastleHall = { trainerFor, pickEntrants };          // pickEntrants: the Battle Arcade's too (chapter 92)
})();
