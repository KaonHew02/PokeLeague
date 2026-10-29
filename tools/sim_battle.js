/* Runs a battle in the terminal with the real engine and data:
 *   node tools/sim_battle.js charmander:5 bulbasaur:5 --seed 1
 *   node tools/sim_battle.js pikachu:12,pidgey:10 onix:14,geodude:12 --trainer --seed 7
 *   node tools/sim_battle.js squirtle:6 pidgey:3 --ball poke-ball:5     (try to catch it)
 *   options: --lang es   --wild (default) | --trainer   --events (print raw events too)
 * Your side picks moves like a 'basic' trainer; the foe uses 'random' (wild) or 'basic'.
 * Forgetting moves: never; switching after a faint: the first healthy Pokémon.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');

const FILES = ['js/core/locales.js', 'js/core/util.js', 'js/core/rng.js', 'js/core/i18n.js', 'js/core/names.js',
  'js/data/types.js', 'js/data/species.js', 'js/data/moves.js', 'js/data/items.js', 'js/data/growth.js', 'js/data/names.js',
  'js/data/natures.js', 'js/data/item-effects.js',
  'js/battle/stats.js', 'js/battle/mon.js', 'js/battle/damage.js', 'js/battle/effects.js', 'js/battle/moves-special.js',
  'js/battle/ai.js', 'js/battle/capture.js', 'js/battle/exp.js', 'js/battle/evolution.js', 'js/battle/items.js', 'js/battle/held.js',
  'js/battle/battle.js', 'js/battle/text.js'];

function load(lang = 'en') {
  const store = new Map(lang !== 'en' ? [['pl.lang', lang]] : []);
  const ctx = { console, Math, JSON, Date, navigator: { language: lang, languages: [lang] },
    localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) } };
  ctx.window = ctx;
  vm.createContext(ctx);
  if (lang !== 'en') {
    const { capture } = require('./build_langs');
    ctx.PL_LANG_Q = capture().filter(([, l]) => l === lang).map(([d, l, c]) => [d, l, c]);
  }
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  return ctx.G;
}

function team(G, spec, rng) {
  return spec.split(',').map(s => {
    const [name, lvl] = s.split(':');
    const sp = /^\d+$/.test(name) ? +name : +Object.keys(G.SPECIES).find(d => G.SPECIES[d].slug === name);
    if (!G.SPECIES[sp]) throw new Error('Unknown Pokémon: ' + name);
    return G.Mon.create(sp, +(lvl || 5), { rng });
  });
}

function main() {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const flag = k => args.includes('--' + k);
  const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--seed', '--lang', '--ball'].includes(args[i - 1])));
  if (pos.length < 2) { console.log('usage: node tools/sim_battle.js <mine> <foe> [--seed n] [--trainer] [--ball item:n] [--lang xx]'); process.exit(1); }
  const G = load(opt('lang', 'en'));
  const seed = +opt('seed', 1);
  const rng = G.RNG(seed * 7919 + 1);
  const mine = team(G, pos[0], rng), foes = team(G, pos[1], rng);
  const trainer = flag('trainer') ? { id: 'sim', name: 'Sim', title: 'Youngster', ai: 'basic', prize: 16 } : null;
  const ball = opt('ball');
  const bag = ball ? { [ball.split(':')[0]]: +(ball.split(':')[1] || 5) } : {};
  const b = G.Battle.create({ kind: trainer ? 'trainer' : 'wild', seed, player: { name: 'Red', party: mine, bag },
                              foe: { party: foes, trainer }, rules: { where: 'sim' } });
  const show = evs => {
    for (const e of evs) {
      if (flag('events')) console.log('   ', JSON.stringify(e));
      const t = G.BattleText.line(e, b);
      if (t) console.log(t);
      if (e.type === 'damage' && e.amt) console.log(`    [${e.side ? 'foe' : 'you'} ${e.hp}/${e.max} HP${e.crit ? ', critical' : ''}]`);
    }
  };
  show(b.start());
  const me = () => Object.assign(Object.create(b.player), { trainer: { ai: 'basic' }, items: {} });
  for (let n = 0; n < 300 && !b.result; n++) {
    const p = b.prompt;
    if (p.kind === 'action') {
      const a = ball && (bag[ball.split(':')[0]] || 0) > 0 && b.foe.bm.mon.hp / G.Mon.maxHp(b.foe.bm.mon) < 0.6
        ? { type: 'ball', item: ball.split(':')[0] } : G.BattleAI.choose(b, me());
      console.log('--- turn ' + (b.turn + 1));
      show(b.act(a.type === 'move' && a.id === 'struggle' ? { type: 'move', slot: 0 } : a));
    } else if (p.kind === 'switch') show(b.answer({ switchTo: b.options().switchable[0] }));
    else show(b.answer({ switchTo: -1, learnSlot: -1 }));
  }
  console.log('\nResult:', JSON.stringify(Object.assign({}, b.result, { mon: undefined })));
}

main();
