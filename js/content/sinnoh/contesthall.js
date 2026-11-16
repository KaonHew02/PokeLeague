/* ============ contesthall.js — Hearthome's Contest Hall and Poffin House ============
 * Chapter 85 (Platinum's Super Contest, mid-game in Sinnoh). The Contest Hall in Hearthome City (closed since chapter 47)
 * opens: at the desk you pick a category, one of your Pokémon (not a fainted one) and a rank. Normal Rank is always
 * open; a higher one only to a Pokémon with the ribbon of the rank below in that category. Three rivals
 * (G.SuperContest.rivals) and the three rounds: on screen (G.SuperContestUI) or, without one (the tests, the story
 * harness: h.pickMon), played through by G.SuperContest.auto. First place earns that category's ribbon of that rank
 * (mon.ribbons: 'cool-normal'...; Sinnoh's twenty: 神奥帅气奖章...), shown on the summary's Contest page. The first
 * ribbon won once chapter 84 is done ends the chapter: `ending(85)`.
 * The Poffin House (a new house east of the road): the chef gives the Poffin Case the first time (flag poffin-case),
 * cooks Poffins from up to four berries and feeds them to your Pokémon (G.Poffin); the clerk sells the five plain
 * berries. The words are my own.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const CLERK = { name: 'Receptionist' }, CHEF = { name: 'Poffin chef' };
  const SC = () => G.SuperContest;
  const BERRIES = ['cheri-berry', 'chesto-berry', 'pecha-berry', 'rawst-berry', 'aspear-berry'];

  // ---------------- The Contest Hall ----------------
  G.Maps.def(Object.assign({
    id: 'hearthome-contest', loc: 'hearthome-city', tileset: 'indoor', palette: 'pink', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWqWWWWWWWWWqWW',
      'p+++++++++++++p',
      '++++=======++++',
      '+++++++++++++++',
      'rrrrrrrrrrrrrrr',
      'rrrrrrrrrrrrrrr',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'hearthome', spot: 'contest-door' }],
    spots: { door: [7, 8, 'up'], desk: [7, 4, 'up'] },
    signs: { '2,1': 'A poster: "Cool, Beauty, Cute, Smart, Tough. Which will your Pokémon be?"',
             '12,1': 'A poster: "Win a ribbon at every rank! Normal, Great, Ultra, Master."' },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'scontest.desk' },
      { id: 'fan', who: 'lass', x: 2, y: 6, dir: 'right', say: 'The dance is my favourite part! You have to step right on the beat.' },
      { id: 'coach', who: 'gentleman', x: 12, y: 6, dir: 'left',
        say: "In the Acting round, watch the judges. A judge nobody else picks gives the most hearts, and filling a judge's voltage is worth even more." },
      { id: 'cook', who: 'beauty', x: 4, y: 4, dir: 'down', say: 'A Pokémon in good condition shines in the Visual round. The Poffin House east of the road can help with that.' }
    ]
  }, SINNOH));

  // ---------------- The Poffin House ----------------
  G.Maps.def(Object.assign({
    id: 'hearthome-poffin', loc: 'hearthome-city', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWW',
      'WWWWWWWWWW',
      'p________p',
      '__====____',                     // the cooking counter: the chef behind it
      '__________',
      'b________b',
      '__________',
      '____X_____'
    ],
    warps: [{ x: 4, y: 7, to: 'hearthome', spot: 'poffin-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'chef', who: 'gentleman', x: 3, y: 2, dir: 'down', script: 'poffin.chef' },
      { id: 'clerk', who: 'clerk', x: 7, y: 3, dir: 'left', script: 'poffin.shop' },
      { id: 'kid', who: 'youngster', x: 6, y: 5, dir: 'left', say: 'Four berries in one Poffin make it much stronger. But a Pokémon can only eat so many!' }
    ]
  }, SINNOH));

  // ---------------- choosing ----------------
  /** A list to pick from: the pop-up on screen, the dialog's choices without one. -> the chosen option's value */
  async function choose(h, title, opts) {
    if (G.Popup && G.Popup.choose) return G.Popup.choose(title, opts);
    const k = await h.choice(title, { options: opts.map(o => o.label) });
    return (opts[k] || {}).value;
  }
  const pickMon = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));

  // ---------------- the desk ----------------
  const ribbonId = (cat, rank) => cat + '-' + rank;
  const hasRibbon = (m, id) => (m.ribbons || []).includes(id);
  /** The ranks this Pokémon may enter in a category: Normal, then each whose rank below it it has won. */
  const ranksFor = (m, cat) => SC().RANKS.filter((r, k) => k === 0 || hasRibbon(m, ribbonId(cat, SC().RANKS[k - 1])));

  async function desk(h) {
    const F = G.Field, S = SC();
    const bye = () => h.say(T('We hope to see you on stage soon!'), CLERK);
    await h.say(T('Welcome to the Contest Hall! Here Pokémon show how fine they look, how well they dance and how they perform.'), CLERK);
    if (!F.flag('scontest-rules')) {
      F.setFlag('scontest-rules');
      await h.say(T('There are three rounds. In the Visual round, the judges look at your Pokémon\'s condition: Poffins help.'), CLERK);
      await h.say(T('In the Dance round, each Pokémon leads one dance and copies the others: step in time with the beat.'), CLERK);
      await h.say(T('In the Acting round, your Pokémon performs its moves for one of three judges, four times. The most hearts in all wins a ribbon.'), CLERK);
    }
    if (await h.choice(T('Would you like to enter a contest?'), { options: [T('Yes'), T('No')] }) !== 0) return bye();
    const ci = await h.choice(T('Which category?'), { options: S.CATS.map(c => S.catName(c)).concat([T('Cancel')]) });
    if (!(ci >= 0 && ci < S.CATS.length)) return bye();
    const cat = S.CATS[ci], party = F.party();
    const i = await pickMon(h)({ title: T('Which Pokémon will enter?'), note: m => (m.hp <= 0 ? T('Fainted') : null), disabled: m => m.hp <= 0 });
    if (i == null || i < 0 || !party[i] || party[i].hp <= 0) return bye();
    const mon = party[i], ranks = ranksFor(mon, cat);
    const ri = await h.choice(T('Which rank?'), { options: ranks.map(r => S.rankName(r)).concat([T('Cancel')]) });
    if (!(ri >= 0 && ri < ranks.length)) return bye();
    const rank = ranks[ri];
    // The contest: three rivals and the rounds, from a seed of its own.
    const run = (+F.getVar('scontest-runs') || 0) + 1;
    F.setVar('scontest-runs', run);
    const seed = ((F.save.player.id | 0) * 7919 + run * 104729 + S.CATS.indexOf(cat) * 131 + S.RANKS.indexOf(rank) * 17) >>> 0;
    const me = { name: F.save.player.name, player: true, skill: 0.6,
                 mon: { sp: mon.sp, nick: mon.nick || null, moves: mon.moves.map(x => x.id), cond: G.Poffin.read(mon), sheen: G.Poffin.sheen(mon), nature: mon.nature } };
    const state = S.create({ cat, rank, seed, entrants: [me].concat(S.rivals(cat, rank, seed)) });
    await h.say(T('Thank you! Please go on stage. The contest begins now!'), CLERK);
    const st = G.SuperContestUI && !h.pickMon ? await G.SuperContestUI.run(state) : S.auto(state);
    const place = st.find(x => x.i === 0).place;
    G.SuperContestHall.last = { cat, rank, place, standings: st, state };
    if (place !== 1) {
      await h.say(fmt('{mon} came in at number {n}. Train hard and try again!', { mon: G.Mon.name(mon), n: place }), CLERK);
      return;
    }
    const id = ribbonId(cat, rank);
    if (!hasRibbon(mon, id)) {
      mon.ribbons = (mon.ribbons || []).concat(id);
      const j = h.jingle('badge');
      await h.say(fmt('Congratulations! {mon} won the {ribbon}!', { mon: G.Mon.name(mon), ribbon: S.ribbonName(id) }));
      await j;
      const up = S.RANKS[S.RANKS.indexOf(rank) + 1];
      if (up) await h.say(fmt('{mon} may now enter the {rank} of the {cat} contest.', { mon: G.Mon.name(mon), rank: S.rankName(up), cat: S.catName(cat) }), CLERK);
    } else await h.say(fmt('Congratulations! {mon} won again!', { mon: G.Mon.name(mon) }), CLERK);
    // The end of the eighty-fifth chapter (credits-ui.js), once the eighty-fourth is done.
    if (F.flag('chapter-84-done') && !F.flag('chapter-85-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(85); else F.setFlag('chapter-85-done');
    }
  }

  // ---------------- the Poffin House ----------------
  async function chef(h) {
    const F = G.Field;
    if (!F.flag('poffin-case')) {
      await h.say(T('Welcome to the Poffin House! We cook Poffins from berries. Pokémon love them, and they make them shine in contests.'), CHEF);
      F.setFlag('poffin-case');
      const j = h.jingle('item');
      await h.say(T('{player} received a Poffin Case!'));
      await j;
      await h.say(T('Each flavor brings out one quality: spicy for Cool, dry for Beauty, sweet for Cute, bitter for Smart, sour for Tough.'), CHEF);
    }
    for (;;) {
      const k = await h.choice(T('What would you like to do?'), { options: [T('Cook Poffins'), T('Feed a Poffin'), T('Nothing')] });
      if (k === 0) await cook(h);
      else if (k === 1) await feed(h);
      else { await h.say(T('Come back any time. The pot is always warm!'), CHEF); return; }
    }
  }

  async function cook(h) {
    const F = G.Field, P = G.Poffin, bag = F.save.bag, chosen = [];
    const left = b => (bag[b] | 0) - chosen.filter(x => x === b).length;
    for (;;) {
      const have = Object.keys(G.BERRY_FLAVORS || {}).filter(b => left(b) > 0);
      if (!have.length && !chosen.length) { await h.say(T('You have no berries to cook with. The clerk sells some.'), CHEF); return; }
      const opts = (chosen.length < P.MOST ? have.map(b => ({ label: G.Names.item(b) + ' ×' + left(b), value: b })) : [])
        .concat(chosen.length ? [{ label: T('Cook!'), value: '#cook' }] : [], [{ label: T('Cancel'), value: null, back: true }]);
      const title = chosen.length ? fmt('In the pot: {list}', { list: chosen.map(b => G.Names.item(b)).join(', ') }) : fmt('Choose up to {n} berries.', { n: P.MOST });
      const v = await choose(h, title, opts);
      if (!v) return;
      if (v === '#cook') break;
      chosen.push(v);
    }
    if (P.list().length >= P.CASE) { await h.say(T('Your Poffin Case is full.'), CHEF); return; }
    const p = P.cook(chosen);
    for (const b of chosen) F.takeItem(b, 1);
    P.add(p);
    const j = h.jingle('item');
    await h.say(fmt('{player} made a {poffin}! Level {n}, smoothness {s}.', { poffin: P.name(p), n: p.level, s: p.smooth }));
    await j;
  }

  async function feed(h) {
    const F = G.Field, P = G.Poffin, list = P.list(), S = SC();
    if (!list.length) { await h.say(T('Your Poffin Case is empty. Cook some first!'), CHEF); return; }
    const opts = list.map((p, k) => ({ label: fmt('{poffin} Lv. {n}', { poffin: P.name(p), n: p.level }), value: 'p' + k }))
      .concat([{ label: T('Cancel'), value: null, back: true }]);
    const v = await choose(h, T('Which Poffin?'), opts);
    if (!v) return;
    const party = F.party();
    const i = await pickMon(h)({ title: T('Feed it to which Pokémon?'), note: m => (P.canEat(m) ? null : T('Full')), disabled: m => !P.canEat(m) });
    if (i == null || i < 0 || !party[i]) return;
    const mon = party[i];
    if (!P.canEat(mon)) { await h.say(fmt("{mon} can't eat any more Poffins.", { mon: G.Mon.name(mon) })); return; }
    const p = P.take(+v.slice(1)), r = P.feed(mon, p);
    await h.say(fmt('{mon} ate the {poffin}!', { mon: G.Mon.name(mon), poffin: P.name(p) }));
    const rose = Object.keys(r.gained).map(k => S.catName(k));
    if (rose.length) await h.say(fmt("{mon}'s {list} went up!", { mon: G.Mon.name(mon), list: rose.join(', ') }));
    if (!P.canEat(mon)) await h.say(fmt('{mon} looks completely full.', { mon: G.Mon.name(mon) }));
  }

  G.Script.def({
    'scontest.desk': [['js', desk]],
    'poffin.chef': [['js', chef]],
    'poffin.shop': [['say', 'Plain berries, perfect for Poffins!'], ['shop', BERRIES]]
  });
  G.SuperContestHall = { ranksFor, ribbonId, BERRIES, last: null };
})();
