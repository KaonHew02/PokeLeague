/* ============ villa.js — the villa in the Resort Area ============
 * Chapter 84, Sinnoh after the League (Platinum's Villa). The villa by the beach in the Resort Area (resort.js) has stood
 * empty since chapter 63: now its owner waits at the door (richboy, `villa.owner`), a man who came to Sinnoh for its rare
 * stones and found them all, and gives it to you for nothing (flag villa-owned; the door opens). Inside (`villa`), a table
 * with Platinum's furniture catalog: nineteen pieces at Platinum's prices (altissimo; the Guest Set's from ludo.guide and
 * 52poke), some only once something is done (NEEDS). A piece bought is delivered at once (flag villa-<id>) and stands in
 * its own place: the map's `decor` (field.js, chapter 84), shown by its flag. Several do something: the bed heals your
 * team, the PC desk opens the PC (both my own), the TV has three programmes, the audio system, the music box and the
 * piano play one of the game's own tunes, the wall clock tells the time.
 * Visitors (Platinum's, as 52poke lists them; when they come is my own): one a day, drawn when you first come into the
 * Resort Area or the villa that day (seeded by the date and the save's player id, as the Battleground's four); about one
 * day in six, nobody. Four come only for a piece of furniture (the small sofa, the bookshelf, the houseplant, the piano)
 * and come first, the day after it arrives (flag villa-met-<id> once they have come). Outdoors (in front of the door):
 * Professor Rowan, Roark, Gardenia, Maylene, Byron; indoors: Barry, Dawn or Lucas, Mom, Volkner, Volkner with Flint,
 * Maylene with Candice, Fantina, Crasher Wake, Candice, Cynthia. They only talk.
 * The first time you walk in once chapter 83 is done: `ending(84)`.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const OWNER = { name: 'Villa owner' }, BARRY = { name: 'Barry' }, ASSIST = { name: '{assistant}' }, MOM = { name: 'Mom' },
        ROWAN = { name: 'Prof. Rowan' }, VOLKNER = { name: 'Volkner' }, FLINT = { name: 'Elite Four Flint' }, MAYLENE = { name: 'Maylene' },
        CANDICE = { name: 'Candice' }, FANTINA = { name: 'Fantina' }, WAKE = { name: 'Crasher Wake' }, CYNTHIA = { name: 'Cynthia' },
        ROARK = { name: 'Roark' }, GARDENIA = { name: 'Gardenia' }, BYRON = { name: 'Byron' };

  // ---------------- The furniture: Platinum's catalog, in its order, and where each piece stands ----------------
  const FURNITURE = [
    { id: 'big-sofa', price: 120000, x: 1, y: 4, w: 3 },
    { id: 'small-sofa', price: 90000, x: 1, y: 6, w: 2 },
    { id: 'bed', price: 187000, x: 13, y: 2, w: 2, h: 2 },
    { id: 'night-table', price: 58000, x: 12, y: 2 },
    { id: 'tv', price: 220000, x: 1, y: 2, w: 2 },
    { id: 'audio', price: 160000, x: 3, y: 2 },
    { id: 'bookshelf', price: 150000, x: 13, y: 5, w: 2 },
    { id: 'rack', price: 127000, x: 14, y: 7 },
    { id: 'houseplant', price: 120000, x: 14, y: 9 },
    { id: 'pc-desk', price: 168000, x: 10, y: 2, w: 2 },
    { id: 'music-box', price: 25300, x: 13, y: 7, need: 'rack' },
    { id: 'bust', price: 150000, x: 6, y: 9, need: 'frontier' },
    { id: 'silver-bust', price: 150000, x: 8, y: 9, need: 'silver' },
    { id: 'piano', price: 146700, x: 4, y: 2, w: 2, need: 'fame' },
    { id: 'guest-set', price: 208000, x: 1, y: 8, w: 2, need: 'battleground' },
    { id: 'wall-clock', price: 52000, x: 9, y: 1, wall: true, need: 'berries' },
    { id: 'masterpiece', price: 140000, x: 6, y: 1, w: 2, wall: true, need: 'eggs' },
    { id: 'tea-set', price: 108000, x: 1, y: 8, w: 2, over: true, lift: 8, need: 'guest-set' },
    { id: 'chandelier', price: 120000, x: 7, y: 4, w: 2, over: true, top: true, lift: 16, need: 'steps' }
  ];
  const BY_ID = Object.fromEntries(FURNITURE.map(f => [f.id, f]));
  const NAMES = () => ({ 'big-sofa': T('Big Sofa'), 'small-sofa': T('Small Sofa'), bed: T('Bed'), 'night-table': T('Night Table'), tv: T('TV'),
    audio: T('Audio System'), bookshelf: T('Bookshelf'), rack: T('Rack'), houseplant: T('Houseplant'), 'pc-desk': T('PC Desk'),
    'music-box': T('Music Box'), bust: T('Pokémon Bust'), 'silver-bust': T('Silver Pokémon Bust'), piano: T('Piano'), 'guest-set': T('Guest Set'),
    'wall-clock': T('Wall Clock'), masterpiece: T('Masterpiece'), 'tea-set': T('Tea Set'), chandelier: T('Chandelier') });
  const nameOf = id => NAMES()[id];
  // Each piece's flag, written out (tests/kanto.test.cjs looks for the setFlag of every flag a map waits for).
  const BUY = {
    'big-sofa': () => G.Field.setFlag('villa-big-sofa'), 'small-sofa': () => G.Field.setFlag('villa-small-sofa'), bed: () => G.Field.setFlag('villa-bed'),
    'night-table': () => G.Field.setFlag('villa-night-table'), tv: () => G.Field.setFlag('villa-tv'), audio: () => G.Field.setFlag('villa-audio'),
    bookshelf: () => G.Field.setFlag('villa-bookshelf'), rack: () => G.Field.setFlag('villa-rack'), houseplant: () => G.Field.setFlag('villa-houseplant'),
    'pc-desk': () => G.Field.setFlag('villa-pc-desk'), 'music-box': () => G.Field.setFlag('villa-music-box'), bust: () => G.Field.setFlag('villa-bust'),
    'silver-bust': () => G.Field.setFlag('villa-silver-bust'), piano: () => G.Field.setFlag('villa-piano'), 'guest-set': () => G.Field.setFlag('villa-guest-set'),
    'wall-clock': () => G.Field.setFlag('villa-wall-clock'), masterpiece: () => G.Field.setFlag('villa-masterpiece'), 'tea-set': () => G.Field.setFlag('villa-tea-set'),
    chandelier: () => G.Field.setFlag('villa-chandelier')
  };
  const owned = id => G.Field.flag('villa-' + id);

  // What some pieces wait for (Platinum's, matched to this game: no berry planting here, so berries picked; steps are
  // counted only from chapter 84 on, on smaller maps, so 100,000 rather than 300,000).
  const STEPS = 100000;
  const HALLS = ['tower', 'factory', 'arena', 'palace', 'dome', 'pike', 'pyramid'];
  const count = k => +G.Field.getVar(k) || 0;
  const num = n => (n | 0).toLocaleString(G.I18n.lang === 'pt-BR' ? 'pt-BR' : G.I18n.lang || 'en');
  const fame = () => (G.Field.save.fame || []).length;
  const halls = () => HALLS.filter(h => G.Tower && (G.Tower.best('single', h) >= 1 || G.Tower.best('double', h) >= 1)).length;
  const NEEDS = {
    rack: { ok: () => owned('rack'), text: () => T('Order the Rack first.') },
    'guest-set': { ok: () => owned('guest-set'), text: () => T('Order the Guest Set first.') },
    frontier: { ok: () => halls() >= HALLS.length, text: () => fmt('Win at least once at every facility of the Battle Frontier ({n} of {all} so far).', { n: halls(), all: HALLS.length }) },
    silver: { ok: () => HALLS.some(h => G.Field.flag(h + '-silver')), text: () => T('Earn a Silver Symbol at the Battle Frontier.') },
    fame: { ok: () => fame() >= 10, text: () => fmt('Enter the Hall of Fame 10 times ({n} so far).', { n: fame() }) },
    battleground: { ok: () => count('bg-wins') >= 50, text: () => fmt('Win 50 battles at the Battleground ({n} so far).', { n: count('bg-wins') }) },
    berries: { ok: () => count('berries-picked') >= 50, text: () => fmt('Pick berries from trees 50 times ({n} so far).', { n: count('berries-picked') }) },
    eggs: { ok: () => count('eggs-hatched') >= 30, text: () => fmt('Hatch 30 Eggs ({n} so far).', { n: count('eggs-hatched') }) },
    steps: { ok: () => count('steps') >= STEPS, text: () => fmt('Walk {max} steps ({n} so far).', { max: num(STEPS), n: num(count('steps')) }) }
  };
  const unlocked = f => !f.need || NEEDS[f.need].ok();
  const money = n => (G.Menus ? G.Menus.money(n) : '₽' + num(n));

  // ---------------- The villa ----------------
  G.Maps.def(Object.assign({
    id: 'villa', loc: 'resort-area', tileset: 'indoor', palette: 'villa', music: 'town', battleBg: 'indoor',
    enter: 'villa.enter',
    rows: [
      'WWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWW',
      '________________',
      '________________',
      '_____rrrrrr_____',
      '_____rrttrr_____',
      '_____rrrrrr_____',
      '________________',
      '________________',
      '________________',
      '_______X________'
    ],
    warps: [{ x: 7, y: 10, to: 'resort-area', spot: 'villa' }],
    spots: { door: [7, 10, 'up'] },
    signs: { '7,5': { script: 'villa.catalog' }, '8,5': { script: 'villa.catalog' } },
    decor: FURNITURE.map(f => ({ id: f.id, kind: f.id, x: f.x, y: f.y, w: f.w, h: f.h, wall: f.wall, over: f.over, top: f.top, lift: f.lift,
                                 if: 'villa-' + f.id, script: f.top ? undefined : 'villa.f.' + f.id })),
    npcs: [
      { id: 'barry', who: 'barry', x: 11, y: 6, dir: 'down', if: 'villa-v-barry', script: 'villa.v.barry' },
      { id: 'dawn', who: 'dawn', x: 3, y: 6, dir: 'left', if: ['villa-v-assistant', '!gender=f'], script: 'villa.v.assistant' },
      { id: 'lucas', who: 'lucas', x: 3, y: 6, dir: 'left', if: ['villa-v-assistant', 'gender=f'], script: 'villa.v.assistant' },
      { id: 'mom', who: 'mom', x: 5, y: 7, dir: 'down', if: 'villa-v-mom', script: 'villa.v.mom' },
      { id: 'volkner', who: 'volkner', x: 11, y: 4, dir: 'down', if: 'villa-v-volkner', script: 'villa.v.volkner' },
      { id: 'volkner2', who: 'volkner', x: 11, y: 4, dir: 'right', if: 'villa-v-volkner-flint', script: 'villa.v.volkner-flint' },
      { id: 'flint', who: 'flint', x: 12, y: 4, dir: 'left', if: 'villa-v-volkner-flint', script: 'villa.v.volkner-flint' },
      { id: 'maylene', who: 'maylene', x: 4, y: 7, dir: 'right', if: 'villa-v-maylene-candice', script: 'villa.v.maylene-candice' },
      { id: 'candice2', who: 'candice', x: 5, y: 7, dir: 'left', if: 'villa-v-maylene-candice', script: 'villa.v.maylene-candice' },
      { id: 'fantina', who: 'fantina', x: 10, y: 4, dir: 'down', if: 'villa-v-fantina', script: 'villa.v.fantina' },
      { id: 'wake', who: 'wake', x: 11, y: 8, dir: 'left', if: 'villa-v-wake', script: 'villa.v.wake' },
      { id: 'candice', who: 'candice', x: 10, y: 7, dir: 'down', if: 'villa-v-candice', script: 'villa.v.candice' },
      { id: 'cynthia', who: 'cynthia', x: 6, y: 2, dir: 'left', if: 'villa-v-cynthia', script: 'villa.v.cynthia' }
    ]
  }, SINNOH));

  // ---------------- Visitors: one a day ----------------
  // `needs`: the piece that brings them (they come first, the day after it arrives); `out`: in front of the door outside.
  const VISITORS = [
    { id: 'rowan', out: true, needs: 'bookshelf' }, { id: 'roark', out: true }, { id: 'gardenia', out: true, needs: 'houseplant' },
    { id: 'maylene', out: true }, { id: 'byron', out: true },
    { id: 'barry' }, { id: 'assistant', needs: 'small-sofa' }, { id: 'mom' }, { id: 'volkner' }, { id: 'volkner-flint' },
    { id: 'maylene-candice' }, { id: 'fantina' }, { id: 'wake' }, { id: 'candice' }, { id: 'cynthia', needs: 'piano' }
  ];
  // The day's flag of each, written out (as BUY).
  const COME = {
    rowan: () => G.Field.setFlag('villa-v-rowan'), roark: () => G.Field.setFlag('villa-v-roark'), gardenia: () => G.Field.setFlag('villa-v-gardenia'),
    maylene: () => G.Field.setFlag('villa-v-maylene'), byron: () => G.Field.setFlag('villa-v-byron'), barry: () => G.Field.setFlag('villa-v-barry'),
    assistant: () => G.Field.setFlag('villa-v-assistant'), mom: () => G.Field.setFlag('villa-v-mom'), volkner: () => G.Field.setFlag('villa-v-volkner'),
    'volkner-flint': () => G.Field.setFlag('villa-v-volkner-flint'), 'maylene-candice': () => G.Field.setFlag('villa-v-maylene-candice'),
    fantina: () => G.Field.setFlag('villa-v-fantina'), wake: () => G.Field.setFlag('villa-v-wake'), candice: () => G.Field.setFlag('villa-v-candice'),
    cynthia: () => G.Field.setFlag('villa-v-cynthia')
  };
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  /** Who comes today (drawn once a day, the first time you are in the Resort Area or the villa): -> their id, or null. */
  function today() {
    const F = G.Field, day = G.Clock.day();
    if (!F.flag('villa-owned')) return null;
    if (F.getVar('villa-day') !== day) {
      for (const v of VISITORS) F.clearFlag('villa-v-' + v.id);
      const can = VISITORS.filter(v => !v.needs || owned(v.needs));
      const rng = G.RNG(hash('villa:' + day) ^ (F.save.player.id | 0));
      const fresh = can.find(v => v.needs && !F.flag('villa-met-' + v.id));
      let pick = fresh || null;
      if (!pick && rng.int(1, 6) > 1) pick = can[rng.int(0, can.length - 1)];
      if (pick) { COME[pick.id](); F.setFlag('villa-met-' + pick.id); }
      F.setVar('villa-day', day);
      F.setVar('villa-visitor', pick ? pick.id : '');
    }
    if (G.World && G.World.refresh) G.World.refresh();
    return F.getVar('villa-visitor') || null;
  }

  // ---------------- The owner, the door, the guide ----------------
  async function owner(h) {
    const F = G.Field;
    if (F.flag('villa-owned')) return;
    await h.say(T('Ah, you must be the Trainer everyone in the Battle Zone talks about. I have been hoping you would come by.'), OWNER);
    await h.say(T('This villa is mine. I came to Sinnoh to look for rare stones, and now I have found every one I wanted.'), OWNER);
    await h.say(T('So I am going home, and the villa needs someone new. It should belong to a strong Trainer. Here: it is yours, and it costs you nothing!'), OWNER);
    F.setFlag('villa-owned');
    const j = h.jingle('item');
    await h.say(T('{player} became the owner of the villa!'));
    await j;
    await h.say(T('It is a little empty inside. There is a furniture catalog on the table; I am afraid nothing in it is cheap. Farewell!'), OWNER);
    if (h.fade) await h.fade('out');
    h.hide('owner');
    if (h.fade) await h.fade('in');
    today();
  }

  // ---------------- Inside ----------------
  async function enter(h) {
    const F = G.Field;
    today();
    if (!F.flag('villa-seen')) {
      F.setFlag('villa-seen');
      await h.say(T('A big, bright room that smells of the sea. Only a table stands in the middle, with a thick catalog on it.'));
    }
    // The end of the eighty-fourth chapter (credits-ui.js), once the eighty-third is done.
    if (F.flag('chapter-83-done') && !F.flag('chapter-84-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(84); else F.setFlag('chapter-84-done');
    }
  }

  /** The catalog on the table: every piece with its price; one not ready says what it waits for. */
  async function catalog(h) {
    const F = G.Field;
    await h.say(T('A thick furniture catalog. Whatever you order is delivered right away.'));
    for (;;) {
      const names = NAMES();
      const opts = FURNITURE.map(f => ({ label: names[f.id] + '  ' + (owned(f.id) ? '✓' : money(f.price)), value: f.id, disabled: owned(f.id) }));
      opts.push({ label: T('Close'), value: null, back: true });
      const id = G.Popup && G.Popup.choose ? await G.Popup.choose(T('Furniture catalog'), opts)
        : (opts[await h.choice(T('Furniture catalog'), { options: opts.map(o => o.label) })] || {}).value;
      if (!id || owned(id)) return;
      const f = BY_ID[id];
      if (!unlocked(f)) { await h.say(fmt('The {item} cannot be ordered yet. {need}', { item: names[id], need: NEEDS[f.need].text() })); continue; }
      if (await h.choice(fmt('Order the {item} for {price}?', { item: names[id], price: money(f.price) }), { options: [T('Yes'), T('No')] }) !== 0) continue;
      if (F.save.player.money < f.price) { await h.say(T("You don't have enough money.")); continue; }
      F.money(-f.price);
      if (h.fade) await h.fade('out');
      BUY[id]();
      if (G.World && G.World.refresh) G.World.refresh();
      if (h.fade) await h.fade('in');
      const j = h.jingle('item');
      await h.say(fmt('The {item} was delivered!', { item: names[id] }));
      await j;
    }
  }

  /** The bed (my own): a rest heals the team. */
  async function bed(h) {
    if (await h.choice(T('A big, soft bed. Will you rest for a while?'), { options: [T('Yes'), T('No')] }) !== 0) return;
    if (h.fade) await h.fade('out');
    G.Field.healAll();
    const j = h.jingle('heal');
    await j;
    if (h.fade) await h.fade('in');
    await h.say(T('{player} slept well. Your Pokémon are full of energy!'));
  }
  async function tv(h) {
    const shows = [T('A cooking show: today, a cake made with Oran Berries. It looks delicious.'),
      T('The news: a Trainer has been winning one battle after another in the Battle Zone.'),
      T('A nature programme about the Pokémon that live deep in the sea.')];
    await h.say(T('{player} turned on the TV.'));
    await h.say(shows[G.Clock.hour() % shows.length]);
  }
  async function clock(h) {
    const d = new Date();
    await h.say(fmt('The wall clock says {time}.', { time: G.Clock.hour() + ':' + String(d.getMinutes()).padStart(2, '0') }));
  }
  async function guestSet(h) {
    await h.say(owned('tea-set') ? T('A table for receiving guests. A tea set is laid out, ready for visitors.') : T('A table for receiving guests.'));
  }

  // ---------------- The visitors' words ----------------
  const talk = lines => async h => { for (const [text, who] of lines()) await h.say(text, who); };
  const VISIT = {
    rowan: talk(() => [[T('So this is the villa I have heard about. I came to see the Pokémon of the Resort Area.'), ROWAN],
                       [T('A fine bookshelf, too. Read about the Pokémon of other regions: there is always more to learn.'), ROWAN]]),
    roark: talk(() => [[T('The rocks along this beach are something else. Some of them came up from very deep down.'), ROARK]]),
    gardenia: talk(() => [[T('Your houseplant looks so happy! Plants can tell when someone takes care of them.'), GARDENIA]]),
    maylene: talk(() => [[T('I ran here from Veilstone this morning! The sand is great for training your legs.'), MAYLENE]]),
    byron: talk(() => [[T('Hah! My boy Roark told me about this villa. Sea air is good for an old fossil hunter like me!'), BYRON]]),
    barry: talk(() => [[T('Whoa, so this is your villa? It is huge! I am going to have an even bigger one someday, just you wait!'), BARRY],
                       [T('I only came to look. Next time we meet, we battle! Got it?'), BARRY]]),
    assistant: talk(() => [[T('Hi! I heard you got a villa, so I had to see it. This sofa is so comfortable!'), ASSIST],
                           [T('Professor Rowan says even a Champion needs somewhere to rest.'), ASSIST]]),
    mom: talk(() => [[T("So this is your villa! You really have grown up, haven't you?"), MOM],
                     [T('Eat properly, even on holiday. And come home to Twinleaf now and then!'), MOM]]),
    volkner: talk(() => [[T('Flint said I should get out of Sunyshore for a day... It is quiet here. Quiet is good.'), VOLKNER]]),
    'volkner-flint': talk(() => [[T('Ha! Some place you have here! I told Volkner a change of scenery would fire him up.'), FLINT],
                                 [T('...The sea is nice. I will give him that much.'), VOLKNER]]),
    'maylene-candice': talk(() => [[T('Maylene and I came to train on the beach! Focus, focus!'), CANDICE],
                                   [T('Candice says the sand is good for footwork. I think she just wanted to see the sea.'), MAYLENE]]),
    fantina: talk(() => [[T('Bonjour! What an elegant villa. It would be perfect for a dance party, non?'), FANTINA]]),
    wake: talk(() => [[T('WAHAHA! A villa right by the sea! Crasher Wake approves! The waves here are just right!'), WAKE]]),
    candice: talk(() => [[T('It is so warm here! Snowpoint is lovely, but a little sunshine is good for focus too.'), CANDICE]]),
    cynthia: talk(() => [[T('I thought I heard a piano... This villa suits you.'), CYNTHIA],
                         [T('When I want to forget about battles for a while, I play too. Not very well, I am afraid.'), CYNTHIA]])
  };

  G.Script.def(Object.assign({
    'villa.owner': [['js', owner]],
    'villa.today': [['js', () => { today(); }]],
    'villa.enter': [['js', enter]],
    'villa.catalog': [['js', catalog]],
    'villa.sign': [['js', async h => {
      await h.say(G.Field.flag('villa-owned') ? T("{player}'s villa. The sea is right outside the door.") : T('A villa by the sea. It has stood empty all season.'));
    }]],
    'villa.guide': [['js', async h => {
      await h.say(G.Field.flag('villa-owned') ? T('So the villa found its owner at last! I knew someone would come.')
        : T('The villa over there has stood empty all season. Someone will move in one day, I am sure of it.'), { name: 'Resort guide' });
    }]],
    // The furniture
    'villa.f.big-sofa': [['say', 'A big, soft sofa. From here you can hear the waves.']],
    'villa.f.small-sofa': [['say', 'A small sofa, just right for one. It is very comfortable.']],
    'villa.f.bed': [['js', bed]],
    'villa.f.night-table': [['say', 'A lamp glows softly on the night table.']],
    'villa.f.tv': [['js', tv]],
    'villa.f.audio': [['say', 'The audio system plays a lively tune.'], ['music', 'bike']],
    'villa.f.bookshelf': [['say', 'Books about Pokémon from every region. One of them is all about the Pokémon of the Resort Area.']],
    'villa.f.rack': [['say', 'A rack for bags and boxes. Everything has its place.']],
    'villa.f.houseplant': [['say', 'A big houseplant with glossy leaves.']],
    'villa.f.pc-desk': [['sfx', 'pc'], ['say', '{player} turned on the PC.'], ['pc']],
    'villa.f.music-box': [['say', 'The music box plays a gentle melody.'], ['music', 'title']],
    'villa.f.bust': [['say', 'A stone statue of a Pokémon. It looks proud of itself.']],
    'villa.f.silver-bust': [['say', 'A statue of a Pokémon, tinted silver. It shines in the light.']],
    'villa.f.piano': [['say', '{player} played a few notes on the piano.'], ['music', 'league']],
    'villa.f.guest-set': [['js', guestSet]],
    'villa.f.wall-clock': [['js', clock]],
    'villa.f.masterpiece': [['say', 'A famous painting of green hills under a bright sun. It must be worth a fortune.']],
    'villa.f.tea-set': [['js', guestSet]]
  }, Object.fromEntries(Object.entries(VISIT).map(([id, fn]) => ['villa.v.' + id, [['js', fn]]]))));

  G.VillaHall = { FURNITURE, VISITORS, NEEDS, STEPS, HALLS, today, unlocked, nameOf };
})();
