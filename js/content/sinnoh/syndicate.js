/* ============ syndicate.js — the Ribbon Syndicate, Julia, Dr. Footstep and the Effort Ribbon ============
 * Chapter 87 (Platinum's ribbons beyond the contests; G.Ribbons, js/world/ribbons.js). The Ribbon Syndicate in the Resort
 * Area (resort.js: its door, shut since chapter 63) lets in a Trainer once any Pokémon in the party has ten ribbons or more
 * (52poke); otherwise the doorman says how many the best one has. 1F: the butler sells its three ribbons to a Pokémon of
 * your choice, in order (Gorgeous ₽10,000, Royal ₽100,000, Gorgeous Royal ₽999,999). 2F: the spa, a massage once a day
 * (var syndicate-spa), friendship +20 (my own number), 255 at most. The first visit once chapter 86 is done ends the
 * chapter: `ending(87)`.
 * In Sunyshore City (sunyshore.js) Julia gives the day's ribbon once a day (var julia-day: Alert on Monday ... Smile on
 * Sunday) to a Pokémon that has not got it, and a lady at the Market gives the Effort Ribbon to a Pokémon with all 510 EVs.
 * On Route 213 (lakefront.js) the first cottage is Dr. Footstep's house: he reads how a Pokémon feels about you from its
 * friendship, and gives the Footprint Ribbon at 255. The words are my own.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const DOORMAN = { name: 'Doorman' }, BUTLER = { name: 'Butler' }, MASSEUSE = { name: 'Masseuse' }, FOOTSTEP = { name: 'Dr. Footstep' };
  // "Julia" alone is a Lass in Celadon City (茱莉亚): this one is named in the context "ribbons" (文子).
  const JULIA = { get name() { return G.T('Julia', 'ribbons'); } };
  const R = () => G.Ribbons;
  const SPA = 20;

  // ---------------- the Ribbon Syndicate ----------------
  G.Maps.def(Object.assign({
    id: 'syndicate-1f', loc: 'resort-area', tileset: 'indoor', palette: 'villa', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWWWWWWWW',
      'p++++++++++^p',
      '+++=====+++++',
      '+++++++++++++',
      '+rrrrrrrrrrr+',
      '+rrrrrrrrrrr+',
      '+++++++++++++',
      '++++++X++++++'
    ],
    warps: [{ x: 6, y: 8, to: 'resort-area', spot: 'syndicate' }, { x: 11, y: 2, to: 'syndicate-2f', spot: 'stairs' }],
    spots: { door: [6, 8, 'up'], counter: [5, 4, 'up'], stairs: [11, 3, 'down'] },
    npcs: [
      { id: 'butler', who: 'gentleman', x: 5, y: 2, dir: 'down', script: 'syndicate.butler' },
      { id: 'maid', who: 'maid', x: 9, y: 4, dir: 'left', say: 'The spa is upstairs. A massage there leaves any Pokémon glowing with happiness.' },
      { id: 'member', who: 'socialite', x: 2, y: 6, dir: 'right',
        say: 'Hearthome\'s Gym Leader is one of us, you know. She says the ribbons on her Pokémon are her proudest decorations.' },
      { id: 'member2', who: 'richboy', x: 10, y: 6, dir: 'left', say: 'A Pokémon\'s ribbons tell its story. The Gorgeous Royal Ribbon tells everyone it is very, very rich.' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'syndicate-2f', loc: 'resort-area', tileset: 'indoor', palette: 'villa', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWWWWWWWWWW',
      'p++++++++++^p',
      '+++++++++++++',
      '+++rrrrrrr+++',
      '+++rrrrrrr+++',
      'p+++++++++++p'
    ],
    warps: [{ x: 11, y: 2, to: 'syndicate-1f', spot: 'stairs' }],
    spots: { stairs: [11, 3, 'down'], spa: [5, 4, 'up'] },
    npcs: [
      { id: 'masseuse', who: 'beauty', x: 5, y: 3, dir: 'down', script: 'syndicate.spa' },
      { id: 'guest', who: 'lady', x: 9, y: 5, dir: 'left', say: 'They say the oils here are made with crushed pearls. My Pokémon has never been so calm.' }
    ]
  }, SINNOH));

  // ---------------- Dr. Footstep's house (Route 213) ----------------
  G.Maps.def(Object.assign({
    id: 'footstep-house', loc: 'sinnoh-route-213', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'route213', spot: 'footstep-door' }],
    spots: { door: [4, 7, 'up'], doctor: [8, 4, 'up'] },
    npcs: [{ id: 'doctor', who: 'scientist', x: 8, y: 3, dir: 'down', script: 'footstep.doctor' }]
  }, SINNOH));

  // ---------------- choosing ----------------
  const pickMon = h => h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
  async function choose(h, o) {
    const party = G.Field.party(), i = await pickMon(h)(o);
    return i == null || i < 0 || !party[i] ? null : party[i];
  }
  const got = async (h, mon, id) => {
    const j = h.jingle('item');
    await h.say(fmt('{mon} received the {ribbon}!', { mon: G.Mon.name(mon), ribbon: R().name(id) }));
    await j;
  };

  // ---------------- the door, the butler, the spa ----------------
  /** The door in the Resort Area: in with a Pokémon of ten ribbons or more in the party. */
  async function door(h) {
    const F = G.Field, party = F.party();
    const best = party.reduce((b, m) => (!b || R().count(m) > R().count(b) ? m : b), null);
    const n = best ? R().count(best) : 0;
    if (n < 10) {
      await h.say(T('Good day. The Ribbon Syndicate is for members only.'), DOORMAN);
      await h.say(best ? fmt('A Trainer may join once one of their Pokémon has earned ten ribbons. The most any of yours has is {n}.', { n })
        : T('A Trainer may join once one of their Pokémon has earned ten ribbons.'), DOORMAN);
      return;
    }
    if (!F.flag('syndicate-member')) {
      F.setFlag('syndicate-member');
      await h.say(fmt('Ten ribbons and more on {mon}! A Pokémon of such standing is always welcome. Please, come in.', { mon: G.Mon.name(best) }), DOORMAN);
    } else await h.say(T('Welcome back to the Ribbon Syndicate.'), DOORMAN);
    await h.warp('syndicate-1f', 'door');
    // The end of the eighty-seventh chapter (credits-ui.js), once the eighty-sixth is done.
    if (F.flag('chapter-86-done') && !F.flag('chapter-87-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(87); else F.setFlag('chapter-87-done');
    }
  }

  /** The butler: the Syndicate's next ribbon for a Pokémon, in order. */
  async function butler(h) {
    const F = G.Field;
    await h.say(T('Welcome to the Ribbon Syndicate. We offer ribbons of the finest make, for Pokémon of the finest standing.'), BUTLER);
    const mon = await choose(h, { title: T('Which Pokémon will wear it?'), note: m => (R().next(m) ? null : T('Has them all')) });
    if (!mon) { await h.say(T('Do come again.'), BUTLER); return; }
    const nx = R().next(mon);
    if (!nx) { await h.say(fmt('{mon} already wears every ribbon we offer. Splendid!', { mon: G.Mon.name(mon) }), BUTLER); return; }
    const [id, price] = nx;
    const k = await h.choice(fmt('For {mon}, the {ribbon}, at ₽{price}. Shall I wrap it?', { mon: G.Mon.name(mon), ribbon: R().name(id), price: G.I18n.num(price) }),
      { options: [T('Yes'), T('No')], name: BUTLER.name });
    if (k !== 0) { await h.say(T('Of course. Take all the time you need.'), BUTLER); return; }
    if (F.money() < price) { await h.say(T('I am afraid that is beyond your means today.'), BUTLER); return; }
    F.money(-price);
    R().give(mon, id);
    await got(h, mon, id);
  }

  /** The spa: a massage once a day, friendship +20. */
  async function spa(h) {
    const F = G.Field, today = G.Clock.day();
    if (F.getVar('syndicate-spa') === today) { await h.say(T('Our oils need a full day to warm. Please come back tomorrow.'), MASSEUSE); return; }
    await h.say(T('Welcome to the spa. A massage with our special oils makes a Pokémon feel loved.'), MASSEUSE);
    if (await h.choice(T('Shall I give one of your Pokémon a massage?'), { options: [T('Yes'), T('No')] }) !== 0) {
      await h.say(T('Do come again.'), MASSEUSE);
      return;
    }
    const mon = await choose(h, { title: T('Which Pokémon?') });
    if (!mon) { await h.say(T('Do come again.'), MASSEUSE); return; }
    mon.friendship = Math.min(255, (mon.friendship | 0) + SPA);
    F.setVar('syndicate-spa', today);
    await h.say(fmt('{mon} looks wonderfully relaxed. It seems even fonder of you now.', { mon: G.Mon.name(mon) }), MASSEUSE);
  }

  // ---------------- Julia, the Market, Dr. Footstep ----------------
  const MEANING = id => ({
    alert: T('The Alert Ribbon, for waking up the week with a bright face.'),
    shock: T('The Shock Ribbon, for a heart that still races at surprises.'),
    downcast: T('The Downcast Ribbon, to remember a sad day and grow from it.'),
    careless: T('The Careless Ribbon, a reminder to slow down and look around.'),
    relax: T('The Relax Ribbon, for the easy calm at the end of the week.'),
    snooze: T('The Snooze Ribbon, for the deep, happy sleep of a weekend.'),
    smile: T('The Smile Ribbon, for a smile that lights up everyone nearby.')
  })[id];

  /** Julia: the ribbon of the day of the week, once a day, to a Pokémon that has not got it. */
  async function julia(h) {
    const F = G.Field, id = R().today(), today = G.Clock.day();
    if (!F.flag('julia-met')) {
      F.setFlag('julia-met');
      await h.say(T('Hello! I am Julia. I can tell how a Pokémon feels just by looking at it, and every day of the week has a feeling of its own.'), JULIA);
      await h.say(T('So I made a ribbon for each day. Come by every day, and your Pokémon can collect all seven!'), JULIA);
    }
    if (F.getVar('julia-day') === today) { await h.say(T('I have given away today\'s ribbon already. Come and see me tomorrow!'), JULIA); return; }
    await h.say(MEANING(id), JULIA);
    const mon = await choose(h, { title: fmt('Who will wear the {ribbon}?', { ribbon: R().name(id) }), note: m => (R().has(m, id) ? T('Has it') : null) });
    if (!mon) { await h.say(T('Come back any time today!'), JULIA); return; }
    if (R().has(mon, id)) { await h.say(fmt('{mon} already has the {ribbon}. Maybe another of your Pokémon?', { mon: G.Mon.name(mon), ribbon: R().name(id) }), JULIA); return; }
    R().give(mon, id);
    F.setVar('julia-day', today);
    await got(h, mon, id);
  }

  /** The lady at the Sunyshore Market: the Effort Ribbon for a Pokémon with all 510 EVs. */
  async function effort(h) {
    await h.say(T('Hard work deserves a reward. Show me a Pokémon you have trained with all your heart!'));
    const mon = await choose(h, { title: T('Which Pokémon?') });
    if (!mon) return;
    if (R().has(mon, 'effort')) { await h.say(fmt('{mon} wears the Effort Ribbon already, and it shows!', { mon: G.Mon.name(mon) })); return; }
    const total = (mon.evs || []).reduce((a, v) => a + (v | 0), 0);
    if (total < 510) { await h.say(fmt('{mon} has trained well, but it could grow stronger still. Keep at it!', { mon: G.Mon.name(mon) })); return; }
    await h.say(fmt('Oh! {mon} has trained as hard as any Pokémon can. This is for it!', { mon: G.Mon.name(mon) }));
    R().give(mon, 'effort');
    await got(h, mon, 'effort');
  }

  /** Dr. Footstep: how a Pokémon feels about you, from its friendship; the Footprint Ribbon at 255. */
  async function doctor(h) {
    await h.say(T('I am Dr. Footstep! One look at a Pokémon\'s footprints, and I know how it feels about its Trainer.'), FOOTSTEP);
    const mon = await choose(h, { title: T('Which Pokémon\'s footprints?') });
    if (!mon) { await h.say(T('Come back with footprints to show me!'), FOOTSTEP); return; }
    const f = mon.friendship | 0, name = G.Mon.name(mon);
    if (f >= 255) {
      await h.say(fmt('These footprints dance! {mon} loves you more than anything in the world.', { mon: name }), FOOTSTEP);
      if (R().give(mon, 'footprint')) {
        await h.say(T('Such footprints deserve a ribbon of their own.'), FOOTSTEP);
        await got(h, mon, 'footprint');
      }
    } else if (f >= 200) await h.say(fmt('Light, happy steps. {mon} loves being with you.', { mon: name }), FOOTSTEP);
    else if (f >= 150) await h.say(fmt('Steady steps. {mon} is fond of you, and growing fonder.', { mon: name }), FOOTSTEP);
    else if (f >= 70) await h.say(fmt('Careful steps. {mon} is still getting to know you.', { mon: name }), FOOTSTEP);
    else await h.say(fmt('Heavy steps... {mon} keeps its distance. Be kind to it.', { mon: name }), FOOTSTEP);
  }

  G.Script.def({
    'syndicate.door': [['js', door]],
    'syndicate.butler': [['js', butler]],
    'syndicate.spa': [['js', spa]],
    'julia.ribbon': [['js', julia]],
    'effort.ribbon': [['js', effort]],
    'footstep.doctor': [['js', doctor]]
  });
  G.SyndicateHall = { SPA };
})();
