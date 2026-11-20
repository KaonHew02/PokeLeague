/* ============ ribbons.js — G.Ribbons: every ribbon a Pokémon can win (chapter 87) ============
 * A Pokémon keeps its ribbons in mon.ribbons (ids, store.js checks them). The contest ribbons are Sinnoh's '<category>-<rank>'
 * (chapter 85) and Hoenn's 'hoenn-<category>-<rank>' (chapter 86), named by G.SuperContest.ribbonName. Chapter 87 adds the
 * others of Platinum and of Ruby, Sapphire and Emerald (52poke's ribbon list):
 *   Sinnoh: sinnoh-champion (the Hall of Fame, league.js), effort (all 510 EVs: Sunyshore Market), footprint (friendship
 *     255: Dr. Footstep on Route 213), Julia's seven in Sunyshore City, one a day of the week (DAILY: alert on Monday ...
 *     smile on Sunday), and the Ribbon Syndicate's three, bought in order (SHOP: gorgeous, royal, gorgeous-royal);
 *   Hoenn: champion (the Hall of Fame, evergrande.js), winning (56 wins in a row at the Battle Tower, hoenn/tower.js),
 *     artist (a painting in the Lilycove Museum, contesthalls.js).
 *   Chapter 88, Sinnoh's Battle Tower (frontier.js): ability (Palmer beaten at the 21st single battle), great-ability (at the
 *     49th), double-ability (50 double battles in a row); chapter 95 (smulti.js): multi-ability (50 multi battles in a row).
 * Left out: the Pair and World Ability ribbons, the Victory Ribbon (the Battle Tower's Open Level), the event ribbons.
 *
 *   G.Ribbons.name(id) · region(id) -> 'hoenn' | 'sinnoh' · has(mon, id) · give(mon, id) -> true if new · count(mon)
 *   G.Ribbons.today() -> Julia's ribbon of the day · SHOP: [[id, price]] · next(mon) -> the next one the Syndicate sells, or null
 */
G.Ribbons = (() => {
  const T = s => G.T(s);
  const LIST = {
    'sinnoh-champion': 'sinnoh', effort: 'sinnoh', footprint: 'sinnoh',
    alert: 'sinnoh', shock: 'sinnoh', downcast: 'sinnoh', careless: 'sinnoh', relax: 'sinnoh', snooze: 'sinnoh', smile: 'sinnoh',
    gorgeous: 'sinnoh', royal: 'sinnoh', 'gorgeous-royal': 'sinnoh',
    champion: 'hoenn', winning: 'hoenn', artist: 'hoenn',
    ability: 'sinnoh', 'great-ability': 'sinnoh', 'double-ability': 'sinnoh', 'multi-ability': 'sinnoh'
  };
  // Julia's ribbon by the day of the week (G.Clock.weekday(): 0 is Sunday).
  const DAILY = ['smile', 'alert', 'shock', 'downcast', 'careless', 'relax', 'snooze'];
  const SHOP = [['gorgeous', 10000], ['royal', 100000], ['gorgeous-royal', 999999]];

  const NAMES = () => ({
    'sinnoh-champion': T('Sinnoh Champ Ribbon'), effort: T('Effort Ribbon'), footprint: T('Footprint Ribbon'),
    alert: T('Alert Ribbon'), shock: T('Shock Ribbon'), downcast: T('Downcast Ribbon'), careless: T('Careless Ribbon'),
    relax: T('Relax Ribbon'), snooze: T('Snooze Ribbon'), smile: T('Smile Ribbon'),
    gorgeous: T('Gorgeous Ribbon'), royal: T('Royal Ribbon'), 'gorgeous-royal': T('Gorgeous Royal Ribbon'),
    champion: T('Champion Ribbon'), winning: T('Winning Ribbon'), artist: T('Artist Ribbon'),
    ability: T('Ability Ribbon'), 'great-ability': T('Great Ability Ribbon'), 'double-ability': T('Double Ability Ribbon'),
    'multi-ability': T('Multi Ability Ribbon')
  });
  /** A ribbon's name, the contest ones too. */
  const name = id => (LIST[id] ? NAMES()[id] : G.SuperContest ? G.SuperContest.ribbonName(id) : id);
  /** Where it was won: Hoenn's contest ribbons and its three others, else Sinnoh. */
  const region = id => (LIST[id] || (String(id).startsWith('hoenn-') ? 'hoenn' : 'sinnoh'));
  const has = (mon, id) => !!(mon && Array.isArray(mon.ribbons) && mon.ribbons.includes(id));
  /** Gives a ribbon: false if it has it already (or is an Egg). */
  function give(mon, id) {
    if (!mon || mon.egg || has(mon, id)) return false;
    mon.ribbons = (mon.ribbons || []).concat(id);
    return true;
  }
  const count = mon => (mon && Array.isArray(mon.ribbons) ? mon.ribbons.length : 0);
  const today = () => DAILY[G.Clock ? G.Clock.weekday() : 0];
  /** The Syndicate's next ribbon for this Pokémon ([id, price]), in order; null once it has all three. */
  const next = mon => SHOP.find(([id]) => !has(mon, id)) || null;

  return { LIST, DAILY, SHOP, name, region, has, give, count, today, next };
})();
