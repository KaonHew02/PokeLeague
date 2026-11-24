/* ============ glass.js — G.GlassWorkshop: Route 113's glass workshop (chapter 107) ============
 * Emerald's, from the pret/pokeemerald decompilation (data/maps/Route113_GlassWorkshop/scripts.inc; the ash: src/field_tasks.c
 * AshGrassPerStepCallback, field.js ashStep; the flutes: G.ITEM_FX, js/battle/items.js, bag-ui.js, field.js flute).
 * Route 113's tall grass is ash grass (map `ash`, fallarbor.js): walking through it with the Soot Sack collects the ash (var
 * ash, one per tile, the tile green again until the map loads again). The glassblower gives the Soot Sack the first time
 * (flag got-soot-sack), then makes a flute from the ash, at Emerald's prices: Blue 250, Yellow 500, Red 500, White 1000,
 * Black 1000 (Emerald's Pretty Chair and Pretty Desk are not in this game: no Secret Base). The first flute made once chapter
 * 106 is done ends the chapter: `ending(107)`.
 *   G.GlassWorkshop.PRICES ([[item, ash]]) · LOWEST
 */
G.GlassWorkshop = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const WORKER = { name: 'Glassblower' };
  const PRICES = [['blue-flute', 250], ['yellow-flute', 500], ['red-flute', 500], ['white-flute', 1000], ['black-flute', 1000]];
  const LOWEST = 250;
  const F = () => G.Field;
  const ash = () => +F().getVar('ash') || 0;
  const said = vars => Object.assign({}, WORKER, { vars });

  G.Maps.def(Object.assign({
    id: 'glass-workshop', loc: 'hoenn-route-113', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
    warps: [{ x: 4, y: 7, to: 'route113', spot: 'workshop-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [
      { id: 'glassblower', who: 'oldman', x: 7, y: 3, dir: 'down', script: 'glass.worker' },
      { id: 'kid', who: 'youngster', x: 2, y: 5, dir: 'right', move: 'wander', r: 1, script: 'glass.kid' }
    ]
  }, HOENN));

  /** The glassblower: the Soot Sack the first time, then a flute for the ash collected. */
  async function worker(h) {
    if (!F().flag('got-soot-sack')) {
      await h.say(T('Mt. Chimney drops its ash on this road every single day. Everyone else sweeps it away. I melt it down and blow it into glass!'), WORKER);
      await h.say(T('If you want something made, bring me ash. Here, collect it in this.'), WORKER);
      F().setFlag('got-soot-sack');
      await G.Script.exec([['giveItem', 'soot-sack', 1]], h);
      await h.say(T('Walk through the ashy grass outside and the ash drops right into the sack. Come back when it feels heavy.'), WORKER);
      return;
    }
    if (F().count('soot-sack') <= 0) { await h.say(T('No Soot Sack, no ash. And no ash, no glass!'), WORKER); return; }
    await h.say(T('Let me have a look in that sack of yours...'), WORKER);
    if (ash() < LOWEST) {
      await h.say(T('Hardly any ash in here yet. Walk {n} more steps through the ashy grass and I can make you a {item}.'),
        said({ n: LOWEST - ash(), item: G.Names.item('blue-flute') }));
      return;
    }
    await h.say(T('Now that is a fine heap of ash!'), WORKER);
    for (;;) {
      const options = PRICES.map(([id, n]) => fmt('{item} ({n} steps of ash)', { item: G.Names.item(id), n })).concat([T('Cancel')]);
      const i = await h.choice(T('What shall I make for you?'), { options, name: WORKER.name });
      if (i == null || i < 0 || i >= PRICES.length) {
        await h.say(T('Nothing? Your ash will keep. Come back when you have made up your mind.'), WORKER);
        return;
      }
      const [item, n] = PRICES[i], vars = { item: G.Names.item(item), n, left: n - ash() };
      if (ash() < n) { await h.say(T('A {item} takes the ash of {n} steps. You need {left} more. Pick something else?'), said(vars)); continue; }
      const yes = await h.choice(T('A {item}, for the ash of {n} steps. Shall I make it?'), { options: [T('Yes'), T('No')], vars, name: WORKER.name });
      if (yes !== 0) continue;
      F().setVar('ash', ash() - n);
      await h.say(T('Leave it to me!'), WORKER);
      await G.Script.exec([['fade', 'out', 0.5], ['sfx', 'glassFlute'], ['wait', 500], ['fade', 'in', 0.5]], h);
      await h.say(T('There! Freshly blown, still warm from the fire.'), WORKER);
      await G.Script.exec([['giveItem', item, 1]], h);
      if (F().flag('chapter-106-done') && !F().flag('chapter-107-done')) {
        if (G.CreditsUI) await G.CreditsUI.ending(107); else F().setFlag('chapter-107-done');
      }
      return;
    }
  }

  G.Script.def({
    'glass.worker': [['js', worker]],
    'glass.kid': [['say', 'Blowing into a glass flute makes the clearest sound you ever heard. One day I will make my own!']]
  });
  return { PRICES, LOWEST };
})();
