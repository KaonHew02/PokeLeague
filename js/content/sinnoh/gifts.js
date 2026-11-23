/* ============ gifts.js — G.SinnohGifts: Platinum's held items given in Sinnoh that were missing (chapter 104) ============
 * Platinum's map scripts (github.com/pret/pokeplatinum: res/field/maps/<map>/scripts.s), the people placed in this game's
 * maps (their places and words are my own):
 *   - Route 221's house (route_221_house; `r221-house`, its door on route221, route219.js): an expert names a level each day
 *     (Platinum's daily random level, 2-99: here from the date and the Trainer ID, `dailyLevel()`); a Pokémon of that level in
 *     the party earns one item a day, in turn a Black Belt, an Expert Belt, a Focus Sash, then again (var `r221-next`,
 *     `r221-day`). The first one once chapter 103 is done ends the chapter: `ending(104)`.
 *   - Celestic Town's house (celestic_town_northwest_house; `celestic-house`): a man gives glasses by the hour, each once:
 *     4:00-9:59 Choice Specs, 10:00-19:59 BlackGlasses, 20:00-3:59 Wise Glasses.
 *   - Jubilife's condominium (jubilife-condo): a Quick Claw. Hearthome's house (hearthome-house): a Shell Bell.
 *   - Pastoria's house (pastoria-house): a Bug Catcher asks for Combee of both genders in the party: a Macho Brace.
 *   - The Pokémon Mansion (pokemon-mansion): a maid gives a Soothe Bell (Platinum's maids' room). Cheryl gives one too at
 *     Eterna Forest's exit (eterna.js).
 *   - Eterna City, by the way down to Cycling Road (Platinum's gate is not in the game): an aide gives an Exp. Share once 35
 *     kinds of Pokémon have been seen.
 *   - Iron Island's house (iron_island_house; `iron-house`, its door on iron-island, ironisland.js): with the National
 *     Pokédex, Byron waits there and gives a Metal Coat.
 *   G.SinnohGifts.dailyLevel(day?) -> 2..99 · REWARDS (Route 221's three) · glassesFor(hour) -> item
 */
G.SinnohGifts = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];
  const F = () => G.Field;
  const REWARDS = ['black-belt', 'expert-belt', 'focus-sash'];
  const EXPERT = { name: 'Expert' }, BYRON = { name: 'Byron' };

  /** A string's 32-bit hash (FNV-1a). */
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /** The level of the day (Platinum's daily random level, 2 to 99): the date and the Trainer ID. */
  function dailyLevel(day = G.Clock.day()) {
    const r = G.RNG(hash('daily-level ' + day) ^ ((F().save.player.id | 0) * 2654435761));
    return r.int(2, 99);
  }
  /** Platinum's glasses by the hour (celestic_town_northwest_house). */
  const glassesFor = hour => (hour >= 4 && hour < 10 ? 'choice-specs' : hour >= 10 && hour < 20 ? 'black-glasses' : 'wise-glasses');

  const give = (h, item) => G.Script.exec([['giveItem', item, 1]], h);

  /** Route 221's expert: a Pokémon of today's level earns the next of the three, once a day. */
  async function levelExpert(h) {
    const S = F().save, V = S.vars, day = G.Clock.day();
    if (V['r221-day'] === day) { await h.say(T('Come back tomorrow. I will think of another level for you.'), EXPERT); return; }
    const lvl = dailyLevel(day), mon = F().party().find(m => !m.egg && m.lvl === lvl);
    if (!mon) {
      await h.say(fmt('I collect sightings of Pokémon at just the right level. Today, show me a Pokémon at level {n}.', { n: lvl }), EXPERT);
      return;
    }
    const item = REWARDS[(+V['r221-next'] || 0) % REWARDS.length];
    await h.say(fmt('Your {mon} is level {n}, exactly what I was looking for! Here, a little thank-you.', { mon: G.Mon.name(mon), n: lvl }), EXPERT);
    await give(h, item);
    V['r221-day'] = day;
    V['r221-next'] = ((+V['r221-next'] || 0) + 1) % REWARDS.length;
    // The end of the hundred and fourth chapter (credits-ui.js), once the hundred and third is done.
    if (F().flag('chapter-103-done') && !F().flag('chapter-104-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(104); else F().setFlag('chapter-104-done');
    }
  }

  /** Celestic Town: glasses for the hour, each once. */
  async function glasses(h) {
    const item = glassesFor(G.Clock.hour()), flag = 'gift-' + item;
    await h.say(T('Glasses change the way the world looks. And a Pokémon wearing them sees things differently too.'), { name: 'Gentleman' });
    if (!F().flag(flag)) { await give(h, item); F().setFlag(flag); }
    const why = { 'choice-specs': T('Choice Specs make special moves stronger, but the holder can only use the first move it picks.'),
      'black-glasses': T('BlackGlasses make Dark-type moves stronger.'), 'wise-glasses': T('Wise Glasses make special moves a little stronger.') }[item];
    await h.say(why, { name: 'Gentleman' });
  }

  /** A gift once (flag gift-<item>), with a line before it and one after (functions giving the texts, translated when said). */
  function once(item, before, after, who) {
    return async h => {
      const flag = 'gift-' + item;
      if (!F().flag(flag)) {
        await h.say(before(), who);
        await give(h, item);
        F().setFlag(flag);
      }
      await h.say(after(), who);
    };
  }

  /** Pastoria: Combee of both genders in the party earn a Macho Brace. */
  async function combee(h) {
    const who = { name: 'Bug Catcher' };
    if (F().flag('gift-macho-brace')) { await h.say(T('You have Combee of both kinds. You are a real bug expert!'), who); return; }
    if (!F().flag('combee-asked')) {
      F().setFlag('combee-asked');
      await h.say(T('Did you know a Combee can be a boy or a girl? Show me both kinds in your party, and I will give you something good!'), who);
      return;
    }
    const g = new Set(F().party().filter(m => !m.egg && m.sp === 415).map(m => m.gender));
    if (!g.size) { await h.say(T('Not a single Combee with you? Look for them in the sweet-smelling trees.'), who); return; }
    if (g.size < 2) { await h.say(T('That is a Combee, all right! Now show me one of the other kind too.'), who); return; }
    await h.say(T('A boy Combee and a girl Combee! Amazing. This is for you: it makes a Pokémon grow strong from every battle.'), who);
    await give(h, 'macho-brace');
    F().setFlag('gift-macho-brace');
  }

  /** Eterna: an Exp. Share once 35 kinds of Pokémon have been seen. */
  async function expShare(h) {
    const who = { name: 'Aide' }, seen = Object.keys(F().save.dex.seen || {}).filter(k => F().save.dex.seen[k]).length;
    if (F().flag('gift-exp-share')) { await h.say(T('A Pokémon holding the Exp. Share gets some of the Exp. Points without battling.'), who); return; }
    await h.say(fmt('I am one of Professor Rowan\'s aides. How many kinds of Pokémon have you seen? {n}, it says here.', { n: seen }), who);
    if (seen < 35) { await h.say(T('Come back when you have seen at least 35 kinds. Then I will have something for you.'), who); return; }
    await h.say(T('That is plenty! The professor asked me to give you this.'), who);
    await give(h, 'exp-share');
    F().setFlag('gift-exp-share');
  }

  /** Iron Island: Byron, with the National Pokédex, gives a Metal Coat. */
  async function byron(h) {
    if (F().flag('gift-metal-coat')) { await h.say(T('Some Pokémon evolve when traded holding a Metal Coat. Steel suits them.'), BYRON); return; }
    await h.say(T('Ah, the Trainer who helped Riley on this island. My apologies for leaving my Gym back then. Take this as thanks.'), BYRON);
    await give(h, 'metal-coat');
    F().setFlag('gift-metal-coat');
    await h.say(T('Some Pokémon evolve when traded holding a Metal Coat. Steel suits them.'), BYRON);
  }

  // ---------------- the two houses ----------------
  G.Maps.def(Object.assign({
    id: 'r221-house', loc: 'sinnoh-route-221', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'route221', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'expert', who: 'oldman', x: 7, y: 4, dir: 'left', script: 'gifts.level' }]
  }, SINNOH));
  G.Maps.def(Object.assign({
    id: 'iron-house', loc: 'iron-island', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'iron-island', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'byron', who: 'byron', x: 7, y: 4, dir: 'left', if: ['national-dex', '!gift-metal-coat'], script: 'gifts.byron' },
      { id: 'sailor', who: 'sailor', x: 2, y: 3, dir: 'down', say: 'The steel from this island goes all over Sinnoh. Byron works the mine himself, you know.' }
    ]
  }, SINNOH));

  G.Script.def({
    'gifts.level': [['js', levelExpert]],
    'gifts.glasses': [['js', glasses]],
    'gifts.quick-claw': [['js', once('quick-claw', () => T('Your Pokémon looks like it wants to go first. Let it hold this!'),
      () => T('A Pokémon holding a Quick Claw sometimes moves first.'), { name: 'Beauty' })]],
    'gifts.shell-bell': [['js', once('shell-bell', () => T('I have something for your Pokémon. Here!'),
      () => T('A Shell Bell gives its holder back some HP each time it deals damage.'), { name: 'Ace Trainer' })]],
    'gifts.soothe-bell': [['js', once('soothe-bell', () => T('Please let one of your Pokémon wear this. It will be fond of you in no time.'),
      () => T('A Pokémon with a Soothe Bell grows fond of you faster.'), { name: 'Maid' })]],
    'gifts.combee': [['js', combee]],
    'gifts.exp-share': [['js', expShare]],
    'gifts.byron': [['js', byron]]
  });
  return { REWARDS, dailyLevel, glassesFor };
})();
