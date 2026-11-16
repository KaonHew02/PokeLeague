/* ============ contesthalls.js — Hoenn's Contest Halls, the Berry Blender, the Lilycove Museum's paintings ============
 * Chapter 86. The Contest Halls of Verdanturf Town, Fallarbor Town and Lilycove City (closed since their towns were
 * built) open, with the rules of Sinnoh's Super Contest (G.SuperContest, chapter 85: Visual, Dance, Acting). Hoenn's ranks
 * are held as in Ruby and Sapphire: Normal at Verdanturf, Super at Fallarbor, Hyper and Master at Lilycove (Slateport, where
 * Ruby and Sapphire hold the Hyper Rank, has no hall in this game; in Emerald every rank is at Lilycove). A rank opens with
 * the ribbon of the rank below in that category; first place earns that ribbon ('hoenn-<category>-<rank>': 帅气奖章,
 * 帅气超级奖章...). Hoenn's ribbons and Sinnoh's are apart. The first Hoenn ribbon won once chapter 85 is done ends the
 * chapter: `ending(86)`.
 * Each hall has a Berry Blender: its host gives the Pokéblock Case the first time (flag pokeblock-case), blends Pokéblocks
 * from one to four berries (G.Pokeblock: Generation 3's rule) and feeds them; a clerk sells the five plain berries.
 * The Lilycove Museum (lilycove.js) gets a second floor: after a Master Rank win at Lilycove an artist asks to paint the
 * winner; the painting hangs in that category's frame (save.paintings, flags painting-<category>; a later one takes its
 * place). With all five, the curator downstairs gives a Lucky Egg (flag museum-gift; Ruby and Sapphire's prize is a Glass
 * Ornament for a Secret Base, which this game does not have). The words and the paintings' titles are my own.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const CLERK = { name: 'Receptionist' }, HOST = { name: 'Blender host' }, ARTIST = { name: 'Artist' }, CURATOR = { name: 'Curator' };
  const SC = () => G.SuperContest;
  const CATS = ['cool', 'beauty', 'cute', 'smart', 'tough'];
  const BERRIES = ['cheri-berry', 'chesto-berry', 'pecha-berry', 'rawst-berry', 'aspear-berry'];
  // The ranks each hall holds, and where each rank is held.
  const HALLS = { verdanturf: ['normal'], fallarbor: ['super'], lilycove: ['hyper', 'master'] };
  const WHERE = { normal: 'verdanturf-town', super: 'fallarbor-town', hyper: 'lilycove-city', master: 'lilycove-city' };

  // ---------------- the three halls ----------------
  function hall(id, loc, town, signs, npcs) {
    G.Maps.def(Object.assign({
      id, loc, tileset: 'indoor', palette: 'pink', music: 'center', battleBg: 'indoor',
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
      warps: [{ x: 7, y: 8, to: town, spot: 'contest-door' }],
      spots: { door: [7, 8, 'up'], desk: [7, 4, 'up'], blender: [14, 4, 'up'] },
      signs,
      decor: [{ id: 'blender', kind: 'blender', x: 12, y: 3, w: 2, h: 1, script: 'hcontest.blender' }],
      npcs: [
        { id: 'clerk', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'hcontest.desk.' + town },
        { id: 'host', who: 'clerk', x: 14, y: 3, dir: 'left', script: 'hcontest.blender' },
        { id: 'berries', who: 'clerk', x: 1, y: 3, dir: 'right', script: 'hcontest.shop' }
      ].concat(npcs)
    }, HOENN));
  }
  hall('verdanturf-contest', 'verdanturf-town', 'verdanturf',
    { '2,1': 'A poster: "Normal Rank contests, every day! Show the judges what your Pokémon can do."',
      '12,1': 'A poster: "Cool, Beauty, Cute, Smart, Tough. Which will your Pokémon be?"' },
    [{ id: 'fan', who: 'lass', x: 3, y: 6, dir: 'right', say: 'My first contest was here! Win the Normal Rank, then try the Super Rank in Fallarbor Town.' },
     { id: 'kid', who: 'youngster', x: 11, y: 6, dir: 'left',
       say: 'Never put two of the same berry in the blender: the Pokéblock comes out black. For Beauty, a Chesto Berry with an Oran Berry makes a fine blue one.' }]);
  hall('fallarbor-contest', 'fallarbor-town', 'fallarbor',
    { '2,1': 'A poster: "Super Rank contests. Only Pokémon that won the Normal Rank may enter."',
      '12,1': 'A poster: "A Pokémon in fine condition shines from the very first round."' },
    [{ id: 'coach', who: 'gentleman', x: 11, y: 6, dir: 'left',
       say: "In the Acting round, watch the judges. A judge nobody else picks gives the most hearts, and filling a judge's voltage is worth even more." },
     { id: 'girl', who: 'beauty', x: 3, y: 6, dir: 'right', say: 'Pokéblocks raise a Pokémon\'s condition, but it can only eat so many. Make every one count!' }]);
  hall('lilycove-contest', 'lilycove-city', 'lilycove',
    { '2,1': 'A poster: "Hyper Rank and Master Rank contests. The best Pokémon in Hoenn compete here."',
      '12,1': 'A poster: "Master Rank champions are painted for the Lilycove Museum."' },
    [{ id: 'artist', who: 'artist', x: 3, y: 6, dir: 'right',
       say: 'I paint the champions of the Master Rank for the Lilycove Museum. Win one, and I will ask to paint your Pokémon!' },
     { id: 'fan', who: 'pokefan', x: 11, y: 6, dir: 'left', say: 'The Master Rank! Only Pokémon with a Hyper Rank ribbon in the same category may enter.' }]);

  // ---------------- the Lilycove Museum, 2F ----------------
  G.Maps.def(Object.assign({
    id: 'lilycove-museum-2f', loc: 'lilycove-city', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWW', '+++++++++++++++^+', '+++++++++++++++++', '+++++++++++++++++', '++++++rrrrr++++++', '+++++++++++++++++'],
    warps: [{ x: 15, y: 2, to: 'lilycove-museum', spot: 'stairs' }],
    spots: { stairs: [15, 3, 'down'] },
    decor: CATS.flatMap((c, k) => [
      { id: 'painting-' + c, kind: 'painting-' + c, x: 1 + 3 * k, y: 1, w: 2, wall: true, if: 'painting-' + c, script: 'museum.painting.' + c },
      { id: 'frame-' + c, kind: 'frame', x: 1 + 3 * k, y: 1, w: 2, wall: true, if: '!painting-' + c, script: 'museum.painting.' + c }
    ]),
    npcs: [{ id: 'guide', who: 'lady', x: 8, y: 4, dir: 'up',
             say: 'This floor shows paintings of Pokémon that won the Master Rank at the Contest Hall. One frame for each category.' }]
  }, HOENN));

  // ---------------- choosing ----------------
  /** A list to pick from: the pop-up on screen, the dialog's choices without one. -> the chosen option's value */
  async function choose(h, title, opts) {
    if (G.Popup && G.Popup.choose) return G.Popup.choose(title, opts);
    const k = await h.choice(title, { options: opts.map(o => o.label) });
    return (opts[k] || {}).value;
  }
  const pickMon = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));

  // ---------------- the desk ----------------
  const RANKS = () => SC().HOENN_RANKS;
  const ribbonId = (cat, rank) => 'hoenn-' + cat + '-' + rank;
  const hasRibbon = (m, id) => (m.ribbons || []).includes(id);
  /** The Hoenn ranks this Pokémon may enter in a category: Normal, then each whose rank below it it has won. */
  const ranksFor = (m, cat) => RANKS().filter((r, k) => k === 0 || hasRibbon(m, ribbonId(cat, RANKS()[k - 1])));
  const paintings = () => { const S = G.Field.save; if (!S.paintings || typeof S.paintings !== 'object') S.paintings = {}; return S.paintings; };

  async function desk(h, town) {
    const F = G.Field, S = SC(), here = HALLS[town];
    const bye = () => h.say(T('We hope to see you on stage soon!'), CLERK);
    await h.say(here.length > 1 ? fmt('Welcome to the Contest Hall! Here we hold the {a} and the {b}.', { a: S.hoennRankName(here[0]), b: S.hoennRankName(here[1]) })
      : fmt('Welcome to the Contest Hall! Here we hold the {a}.', { a: S.hoennRankName(here[0]) }), CLERK);
    if (!F.flag('hcontest-rules')) {
      F.setFlag('hcontest-rules');
      await h.say(T('There are three rounds. In the Visual round, the judges look at your Pokémon\'s condition: Pokéblocks help.'), CLERK);
      await h.say(T('In the Dance round, each Pokémon leads one dance and copies the others: step in time with the beat.'), CLERK);
      await h.say(T('In the Acting round, your Pokémon performs its moves for one of three judges, four times. The most hearts in all wins a ribbon.'), CLERK);
    }
    if (await h.choice(T('Would you like to enter a contest?'), { options: [T('Yes'), T('No')] }) !== 0) return bye();
    const ci = await h.choice(T('Which category?'), { options: S.CATS.map(c => S.catName(c)).concat([T('Cancel')]) });
    if (!(ci >= 0 && ci < S.CATS.length)) return bye();
    const cat = S.CATS[ci], party = F.party();
    const i = await pickMon(h)({ title: T('Which Pokémon will enter?'), note: m => (m.hp <= 0 ? T('Fainted') : null), disabled: m => m.hp <= 0 });
    if (i == null || i < 0 || !party[i] || party[i].hp <= 0) return bye();
    const mon = party[i], open = here.filter(r => ranksFor(mon, cat).includes(r));
    if (!open.length) {
      const need = RANKS()[RANKS().indexOf(here[0]) - 1];
      await h.say(fmt('{mon} needs the {ribbon} to enter here. It is won in the {rank} at {town}.',
        { mon: G.Mon.name(mon), ribbon: S.ribbonName(ribbonId(cat, need)), rank: S.hoennRankName(need), town: G.Names.loc(WHERE[need]) }), CLERK);
      return;
    }
    let rank = open[0];
    if (open.length > 1) {
      const ri = await h.choice(T('Which rank?'), { options: open.map(r => S.hoennRankName(r)).concat([T('Cancel')]) });
      if (!(ri >= 0 && ri < open.length)) return bye();
      rank = open[ri];
    }
    // The contest: Sinnoh's rules at the same place, Hoenn's rivals, a seed of its own.
    const tier = S.TIER[rank];
    const run = (+F.getVar('hcontest-runs') || 0) + 1;
    F.setVar('hcontest-runs', run);
    const seed = ((F.save.player.id | 0) * 6151 + run * 92821 + S.CATS.indexOf(cat) * 137 + RANKS().indexOf(rank) * 19 + 86) >>> 0;
    const me = { name: F.save.player.name, player: true, skill: 0.6,
                 mon: { sp: mon.sp, nick: mon.nick || null, moves: mon.moves.map(x => x.id), cond: G.Poffin.read(mon), sheen: G.Poffin.sheen(mon), nature: mon.nature } };
    const state = S.create({ cat, rank: tier, seed, label: S.hoennRankName(rank), entrants: [me].concat(S.rivals(cat, tier, seed, 'hoenn')) });
    await h.say(T('Thank you! Please go on stage. The contest begins now!'), CLERK);
    const st = G.SuperContestUI && !h.pickMon ? await G.SuperContestUI.run(state) : S.auto(state);
    const place = st.find(x => x.i === 0).place;
    G.HoennContestHall.last = { cat, rank, place, standings: st, state };
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
      const up = RANKS()[RANKS().indexOf(rank) + 1];
      if (up) await h.say(fmt('{mon} may now enter the {rank} of the {cat} contest, held in {town}.',
        { mon: G.Mon.name(mon), rank: S.hoennRankName(up), cat: S.catName(cat), town: G.Names.loc(WHERE[up]) }), CLERK);
    } else await h.say(fmt('Congratulations! {mon} won again!', { mon: G.Mon.name(mon) }), CLERK);
    if (rank === 'master' && town === 'lilycove') await artist(h, mon, cat);
    // The end of the eighty-sixth chapter (credits-ui.js), once the eighty-fifth is done.
    if (F.flag('chapter-85-done') && !F.flag('chapter-86-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(86); else F.setFlag('chapter-86-done');
    }
  }

  // ---------------- the artist and the museum ----------------
  // The flags that show each painting (literal, for the content checks).
  const HANG = { cool: () => G.Field.setFlag('painting-cool'), beauty: () => G.Field.setFlag('painting-beauty'), cute: () => G.Field.setFlag('painting-cute'),
                 smart: () => G.Field.setFlag('painting-smart'), tough: () => G.Field.setFlag('painting-tough') };
  const TITLE = c => ({ cool: T('The Fearless Stride'), beauty: T('Light on Still Water'), cute: T('A Smile for Everyone'),
                        smart: T('The Quiet Thinker'), tough: T('Strength That Stands Firm') })[c];
  const monLabel = p => p.nick || G.Names.mon(p.sp);

  async function artist(h, mon, cat) {
    const S = SC(), P = paintings();
    await h.say(fmt('What a performance! I paint for the Lilycove Museum. May I paint {mon} for its gallery?', { mon: G.Mon.name(mon) }), ARTIST);
    if (P[cat]) await h.say(fmt('The museum has a painting in its {cat} frame already. Mine would take its place.', { cat: S.catName(cat) }), ARTIST);
    if (await h.choice(T('Let the artist paint it?'), { options: [T('Yes'), T('No')] }) !== 0) {
      await h.say(T('I understand. Win again, and I will ask again!'), ARTIST);
      return;
    }
    P[cat] = { sp: mon.sp, nick: mon.nick || null, ot: G.Field.save.player.name };
    HANG[cat]();
    await h.say(fmt('There! "{title}". It will hang on the second floor of the Lilycove Museum.', { title: TITLE(cat) }), ARTIST);
  }

  /** A frame on the museum's second floor: its painting (on screen, G.SuperContestUI.painting), or the empty frame. */
  async function painting(h, cat) {
    const S = SC(), p = paintings()[cat];
    if (!p) { await h.say(fmt('An empty frame. Its plate reads: "{cat} Contest, Master Rank."', { cat: S.catName(cat) })); return; }
    const plate = fmt('{mon}, champion of the {cat} Contest, Master Rank. Given by {ot}.', { mon: monLabel(p), cat: S.catName(cat), ot: p.ot });
    if (G.SuperContestUI && G.SuperContestUI.painting && !h.pickMon) await G.SuperContestUI.painting({ cat, sp: p.sp, title: TITLE(cat), plate });
    else await h.say(fmt('A painting: "{title}". {plate}', { title: TITLE(cat), plate }));
  }

  /** The curator downstairs: the paintings so far, and a Lucky Egg once all five frames are filled. */
  async function curator(h) {
    const F = G.Field, n = CATS.filter(c => paintings()[c]).length;
    if (n === 5 && !F.flag('museum-gift')) {
      await h.say(T('Every frame upstairs holds a painting now, and every one of them is your Pokémon! Please, take this as our thanks.'), CURATOR);
      F.setFlag('museum-gift');
      F.giveItem('lucky-egg', 1);
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('lucky-egg') } });
      await j;
      return;
    }
    if (n === 5) { await h.say(T('Our second floor is complete, thanks to you. Visitors stand in front of those paintings for hours.'), CURATOR); return; }
    await h.say(T('Welcome to the Lilycove Museum. Our gallery shows Pokémon as artists have seen them through the ages.'), CURATOR);
    await h.say(n ? fmt('Upstairs, {n} of the five frames hold a painting of a Master Rank champion. We hope to fill them all.', { n })
      : T('Upstairs, five frames wait for paintings of the Master Rank champions of our Contest Hall.'), CURATOR);
  }

  // ---------------- the Berry Blender ----------------
  async function blender(h) {
    const F = G.Field;
    if (!F.flag('pokeblock-case')) {
      await h.say(T('This is the Berry Blender! Put berries in, and it makes Pokéblocks. Pokémon love them, and they make them shine in contests.'), HOST);
      F.setFlag('pokeblock-case');
      const j = h.jingle('item');
      await h.say(T('{player} received a Pokéblock Case!'));
      await j;
      await h.say(T('Each flavor brings out one quality: spicy for Cool, dry for Beauty, sweet for Cute, bitter for Smart, sour for Tough.'), HOST);
      await h.say(T('Use berries of different kinds. Flavors that clash cancel out, so think about what goes together!'), HOST);
    }
    for (;;) {
      const k = await h.choice(T('What would you like to do?'), { options: [T('Blend berries'), T('Feed a Pokéblock'), T('Nothing')] });
      if (k === 0) await blend(h);
      else if (k === 1) await feed(h);
      else { await h.say(T('Come back any time. The blender never sleeps!'), HOST); return; }
    }
  }

  async function blend(h) {
    const F = G.Field, B = G.Pokeblock, bag = F.save.bag, chosen = [];
    const left = b => (bag[b] | 0) - chosen.filter(x => x === b).length;
    for (;;) {
      const have = Object.keys(G.BERRY_FLAVORS || {}).filter(b => left(b) > 0);
      if (!have.length && !chosen.length) { await h.say(T('You have no berries to blend. The clerk sells some.'), HOST); return; }
      const opts = (chosen.length < B.MOST ? have.map(b => ({ label: G.Names.item(b) + ' ×' + left(b), value: b })) : [])
        .concat(chosen.length ? [{ label: T('Blend!'), value: '#blend' }] : [], [{ label: T('Cancel'), value: null, back: true }]);
      const title = chosen.length ? fmt('In the blender: {list}', { list: chosen.map(b => G.Names.item(b)).join(', ') }) : fmt('Choose up to {n} berries.', { n: B.MOST });
      const v = await choose(h, title, opts);
      if (!v) return;
      if (v === '#blend') break;
      chosen.push(v);
    }
    if (B.list().length >= B.CASE) { await h.say(T('Your Pokéblock Case is full.'), HOST); return; }
    const run = (+F.getVar('pokeblock-runs') || 0) + 1;
    F.setVar('pokeblock-runs', run);
    const p = B.blend(chosen, { rng: G.RNG(((F.save.player.id | 0) * 31 + run * 7919) >>> 0) });
    for (const b of chosen) F.takeItem(b, 1);
    B.add(p);
    const j = h.jingle('item');
    await h.say(fmt('{player} made a {block}! Level {n}, feel {f}.', { block: B.name(p), n: p.level, f: p.feel }));
    await j;
  }

  async function feed(h) {
    const F = G.Field, B = G.Pokeblock, list = B.list(), S = SC();
    if (!list.length) { await h.say(T('Your Pokéblock Case is empty. Blend some first!'), HOST); return; }
    const opts = list.map((p, k) => ({ label: fmt('{block} Lv. {n}', { block: B.name(p), n: p.level }), value: 'p' + k }))
      .concat([{ label: T('Cancel'), value: null, back: true }]);
    const v = await choose(h, T('Which Pokéblock?'), opts);
    if (!v) return;
    const party = F.party();
    const i = await pickMon(h)({ title: T('Feed it to which Pokémon?'), note: m => (B.canEat(m) ? null : T('Full')), disabled: m => !B.canEat(m) });
    if (i == null || i < 0 || !party[i]) return;
    const mon = party[i];
    if (!B.canEat(mon)) { await h.say(fmt("{mon} can't eat any more Pokéblocks.", { mon: G.Mon.name(mon) })); return; }
    const p = B.take(+v.slice(1)), r = B.feed(mon, p);
    await h.say(fmt('{mon} ate the {block}!', { mon: G.Mon.name(mon), block: B.name(p) }));
    const rose = Object.keys(r.gained).map(k => S.catName(k));
    if (rose.length) await h.say(fmt("{mon}'s {list} went up!", { mon: G.Mon.name(mon), list: rose.join(', ') }));
    if (!B.canEat(mon)) await h.say(fmt('{mon} looks completely full.', { mon: G.Mon.name(mon) }));
  }

  G.Script.def(Object.assign({
    'hcontest.desk.verdanturf': [['js', h => desk(h, 'verdanturf')]],
    'hcontest.desk.fallarbor': [['js', h => desk(h, 'fallarbor')]],
    'hcontest.desk.lilycove': [['js', h => desk(h, 'lilycove')]],
    'hcontest.blender': [['js', blender]],
    'hcontest.shop': [['say', 'Plain berries, perfect for the Berry Blender!'], ['shop', BERRIES]],
    'lilycove.curator': [['js', curator]]
  }, Object.fromEntries(CATS.map(c => ['museum.painting.' + c, [['js', h => painting(h, c)]]]))));
  G.HoennContestHall = { ranksFor, ribbonId, HALLS, WHERE, BERRIES, TITLE, last: null };
})();
