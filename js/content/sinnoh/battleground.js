/* ============ battleground.js — the Battleground in the Survival Area ============
 * Chapter 63. Once Buck has put the Magma Stone back (flag magma-stone-back) his grandfather's Battleground is open:
 * Sinnoh's eight Gym Leaders and the partners you have walked with (Cheryl, if she came along in Eterna Forest; Riley;
 * Buck) come to battle, four of them each day. The day's four are drawn with a G.RNG seeded by the device's date and the
 * save's player id, so they stay the same all day (flags bg-<id>, var bg-day); each battles you once a day (their
 * `done` mark is cleared when a new day's four are drawn). On the first day Buck and Cheryl are always there (var bg-first).
 * Talk to them to battle (no line of sight). Platinum's teams and items, at Platinum's levels (61-66) but for three a little lower (see TEAMS). Mira and Marley, met in places
 * this game does not have yet, do not come.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const FR2 = { 'full-restore': 2 };
  const LEADER = { cls: 'leader', leader: true, ai: 'leader', sight: 0, prize: 120 };
  const PARTNER = { leader: true, ai: 'leader', sight: 0, prize: 120 };

  /** Platinum's Battleground teams (exported for the balance test). At a normal difficulty (a sensible team of six wins each
   *  battle 60% or more) Crasher Wake and Riley are two levels lower than Platinum's, Candice four. */
  const TEAMS = {
    roark: [['aerodactyl', 62, ['stone-edge', 'aerial-ace', 'earthquake', 'dragon-claw']], ['probopass', 61, ['earth-power', 'stealth-rock', 'discharge', 'stone-edge']],
            ['golem', 61, ['stone-edge', 'earthquake', 'brick-break', 'flamethrower']], ['rampardos', 63, ['head-smash', 'zen-headbutt', 'avalanche', 'earthquake']],
            ['tyranitar', 65, ['stone-edge', 'crunch', 'aerial-ace', 'fire-fang'], 'sitrus-berry']],
    gardenia: [['jumpluff', 61, ['silver-wind', 'toxic', 'sunny-day', 'bounce']], ['cherrim', 62, ['solar-beam', 'toxic', 'sunny-day', 'leech-seed']],
               ['bellossom', 61, ['drain-punch', 'giga-drain', 'ingrain', 'sunny-day']], ['torterra', 63, ['wood-hammer', 'crunch', 'earthquake', 'stone-edge']],
               ['roserade', 65, ['shadow-ball', 'leaf-storm', 'sludge-bomb', 'hyper-beam'], 'sitrus-berry']],
    maylene: [['hitmontop', 62, ['triple-kick', 'aerial-ace', 'quick-attack', 'fake-out']], ['medicham', 63, ['fire-punch', 'ice-punch', 'thunder-punch', 'high-jump-kick']],
              ['breloom', 62, ['stone-edge', 'spore', 'mach-punch', 'seed-bomb']], ['machamp', 64, ['cross-chop', 'rock-climb', 'earthquake', 'stone-edge']],
              ['lucario', 66, ['drain-punch', 'close-combat', 'extreme-speed', 'bone-rush']]],
    wake: [['sharpedo', 59, ['aqua-jet', 'night-slash', 'slash', 'endure']], ['quagsire', 59, ['earthquake', 'stone-edge', 'yawn', 'surf']],
           ['gyarados', 60, ['aqua-tail', 'avalanche', 'bite', 'giga-impact']], ['floatzel', 61, ['brine', 'ice-fang', 'crunch', 'aqua-jet']],
           ['ludicolo', 63, ['surf', 'ice-beam', 'energy-ball', 'focus-blast'], 'sitrus-berry']],
    fantina: [['banette', 61, ['shadow-claw', 'feint-attack', 'thunderbolt', 'will-o-wisp']], ['drifblim', 61, ['ominous-wind', 'psychic', 'silver-wind', 'baton-pass']],
              ['dusknoir', 62, ['rock-slide', 'shadow-punch', 'double-team', 'protect']], ['mismagius', 63, ['shadow-ball', 'psychic', 'magical-leaf', 'thunderbolt']],
              ['gengar', 65, ['shadow-ball', 'psychic', 'focus-blast', 'thunder'], 'sitrus-berry']],
    byron: [['skarmory', 61, ['night-slash', 'drill-peck', 'rock-tomb', 'stealth-rock']], ['steelix', 61, ['gyro-ball', 'ice-fang', 'dragon-breath', 'sandstorm']],
            ['magnezone', 62, ['flash-cannon', 'thunderbolt', 'supersonic', 'thunder-wave']], ['bastiodon', 63, ['metal-burst', 'ancient-power', 'iron-defense', 'rest']],
            ['aggron', 65, ['metal-burst', 'stone-edge', 'earthquake', 'avalanche'], 'sitrus-berry']],
    candice: [['weavile', 58, ['avalanche', 'slash', 'feint-attack', 'taunt']], ['mamoswine', 57, ['avalanche', 'ancient-power', 'earthquake', 'hail']],
              ['abomasnow', 57, ['avalanche', 'wood-hammer', 'grass-whistle', 'ingrain']], ['froslass', 59, ['blizzard', 'confuse-ray', 'ominous-wind', 'hail']],
              ['glaceon', 61, ['blizzard', 'mirror-coat', 'shadow-ball', 'water-pulse'], 'sitrus-berry']],
    volkner: [['jolteon', 61, ['pin-missile', 'charge-beam', 'double-kick', 'quick-attack']], ['raichu', 61, ['charge-beam', 'brick-break', 'thunder-wave', 'light-screen']],
              ['luxray', 62, ['ice-fang', 'thunder-fang', 'crunch', 'fire-fang']], ['lanturn', 63, ['discharge', 'signal-beam', 'surf', 'ice-beam']],
              ['electivire', 65, ['thunder-punch', 'fire-punch', 'brick-break', 'giga-impact'], 'sitrus-berry']],
    cheryl: [['wobbuffet', 61, ['counter', 'mirror-coat', 'safeguard', 'encore']], ['drifblim', 61, ['toxic', 'ominous-wind', 'fly', 'protect']],
             ['hariyama', 62, ['close-combat', 'earthquake', 'bullet-punch', 'stone-edge']], ['wailord', 63, ['water-spout', 'brine', 'earthquake', 'avalanche']],
             ['blissey', 65, ['soft-boiled', 'counter', 'psychic', 'toxic'], 'sitrus-berry']],
    riley: [['absol', 59, ['psycho-cut', 'night-slash', 'swords-dance', 'quick-attack']], ['ursaring', 59, ['avalanche', 'slash', 'aerial-ace', 'shadow-claw']],
            ['metagross', 60, ['meteor-mash', 'zen-headbutt', 'hammer-arm', 'bullet-punch']], ['salamence', 61, ['dragon-claw', 'crunch', 'fire-fang', 'thunder-fang']],
            ['lucario', 63, ['extreme-speed', 'close-combat', 'bone-rush', 'blaze-kick'], 'sitrus-berry']],
    buck: [['shuckle', 61, ['rest', 'toxic', 'protect', 'sandstorm']], ['umbreon', 62, ['dark-pulse', 'psychic', 'confuse-ray', 'double-team']],
           ['torkoal', 61, ['earthquake', 'will-o-wisp', 'eruption', 'protect']], ['dusknoir', 63, ['fire-punch', 'ice-punch', 'thunder-punch', 'shadow-ball']],
           ['claydol', 65, ['earth-power', 'psychic', 'ancient-power', 'calm-mind'], 'sitrus-berry']]
  };
  const POOL = Object.keys(TEAMS);
  // Who may come: the Gym Leaders (all beaten on the way to the League) and the partners you have walked with.
  const MET = { cheryl: 'cheryl-with', riley: 'riley-done', buck: 'magma-stone-back' };
  const NAME = { roark: 'Roark', gardenia: 'Gardenia', maylene: 'Maylene', wake: 'Crasher Wake', fantina: 'Fantina', byron: 'Byron', candice: 'Candice',
                 volkner: 'Volkner', cheryl: 'Cheryl', riley: 'Riley', buck: 'Buck' };

  // The day's flags, one per Trainer, written out (tests/kanto.test.cjs looks for the script that sets each flag).
  const ON = {
    roark: () => G.Field.setFlag('bg-roark'), gardenia: () => G.Field.setFlag('bg-gardenia'), maylene: () => G.Field.setFlag('bg-maylene'),
    wake: () => G.Field.setFlag('bg-wake'), fantina: () => G.Field.setFlag('bg-fantina'), byron: () => G.Field.setFlag('bg-byron'),
    candice: () => G.Field.setFlag('bg-candice'), volkner: () => G.Field.setFlag('bg-volkner'), cheryl: () => G.Field.setFlag('bg-cheryl'),
    riley: () => G.Field.setFlag('bg-riley'), buck: () => G.Field.setFlag('bg-buck')
  };
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const roster = () => POOL.filter(id => G.Field.flag('bg-' + id));
  /** The day's four: drawn once a day (and their battles of the day before forgotten). -> their ids, in POOL order */
  function today() {
    const F = G.Field, day = G.Clock.day();
    if (!F.flag('magma-stone-back') || F.getVar('bg-day') === day) return roster();
    for (const id of POOL) { F.clearFlag('bg-' + id); delete F.save.done['survival-ground:' + id]; }
    const rng = G.RNG(hash(day) ^ (F.save.player.id | 0));
    const can = POOL.filter(id => !MET[id] || F.flag(MET[id]));
    const pick = F.getVar('bg-first') ? [] : ['buck', 'cheryl'].filter(id => can.includes(id));
    const rest = can.filter(id => !pick.includes(id));
    while (pick.length < 4 && rest.length) pick.push(rest.splice(rng.int(0, rest.length - 1), 1)[0]);
    for (const id of pick) ON[id]();
    F.setVar('bg-day', day);
    F.setVar('bg-first', 1);
    return roster();
  }

  const at = (id, x, y, more) => Object.assign({ id, who: id, name: NAME[id], x, y, dir: 'down', if: 'bg-' + id, team: TEAMS[id] }, more);
  G.Maps.def(Object.assign({
    id: 'survival-ground', loc: 'survival-area', tileset: 'indoor', palette: 'gym', music: 'gym', battleBg: 'indoor',
    enter: 'bground.enter',
    rows: ['WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWW', '_______________', '_______________', '_______________', '___rrrrrrrrr___',
           '___rrrrrrrrr___', '_______________', '_______________', '_______________', '_______X_______'],
    warps: [{ x: 7, y: 10, to: 'survival-area', spot: 'ground-door' }],
    spots: { door: [7, 10, 'up'] },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 1, y: 9, dir: 'right', script: 'bground.clerk' },
      { id: 'fan', who: 'youngster', x: 13, y: 9, dir: 'left', if: '!magma-stone-back',
        say: 'I came all this way to see Roark battle, and he is not here! I can wait. I have sandwiches.' },
      { id: 'fan2', who: 'youngster', x: 13, y: 9, dir: 'left', if: 'magma-stone-back',
        say: 'Every morning I run over here to see who has come. It is better than anything on TV!' }
    ],
    trainers: [
      at('roark', 2, 3, Object.assign({ items: FR2,
        before: 'I left the mine in good hands for the day. My Pokémon have been digging deeper than ever. Want to see?',
        defeat: 'Ha! You dug right through us again.',
        after: 'The mine will still be there tomorrow, and so will I. Probably.' }, LEADER)),
      at('gardenia', 4, 3, Object.assign({ items: FR2,
        before: 'The flowers here are tough, like the Trainers. Let us see how much you have grown!',
        defeat: 'You have grown more than my whole garden.',
        after: 'I bring seeds from Eterna every time I come. Nothing grows in the Survival Area yet, but I will not give up.' }, LEADER)),
      at('maylene', 6, 3, Object.assign({
        before: 'I walked here barefoot from Veilstone to toughen my feet. Now let me toughen my fists on you!',
        defeat: 'My feet are tough. My fists still have work to do.',
        after: 'Lucario and I train on the rocks out back every morning. You are welcome to join us.' }, LEADER)),
      at('wake', 8, 3, Object.assign({
        before: 'WAHAHAHA! Crasher Wake makes a splash even in a dry town like this one! Ready?',
        defeat: 'WAHAHA! Soaked through, and loving it!',
        after: 'There is no sea here, but there is a sea in my heart! Also, Route 226 is right there.' }, LEADER)),
      at('fantina', 10, 3, Object.assign({ items: FR2,
        before: 'Ah, the Champion! My ghosts have been dancing all morning. Will you dance with them?',
        defeat: 'Magnifique! You lead the dance now.',
        after: 'The Battleground has a wonderful echo. My ghosts adore it.' }, LEADER)),
      at('byron', 12, 3, Object.assign({ items: FR2,
        before: 'BWAHAHAHA! I left a note on the Gym door and sailed straight here. Let us see if you are still made of steel!',
        defeat: 'BWAHAHA! Steel bends, but it does not break. Neither do I!',
        after: 'Do not tell Roark I said so, but you are the best Trainer I have ever faced.' }, LEADER)),
      at('candice', 3, 7, Object.assign({ items: FR2,
        before: 'It is so hot here! My team is about to melt, so I need to cool off with a battle!',
        defeat: 'I feel much cooler now. Beaten, but cooler!',
        after: 'Snowpoint misses you, you know. Come and have a snowball fight sometime.' }, LEADER)),
      at('volkner', 5, 7, Object.assign({ items: FR2,
        before: 'I heard you would be here. That is the only reason I came. Do not hold back.',
        defeat: 'That woke me up. Thank you.',
        after: 'Flint dragged me here the first time. Now I come on my own.' }, LEADER)),
      at('cheryl', 9, 7, Object.assign({ items: FR2,
        before: 'We walked through Eterna Forest together, remember? I have trained so much since then!',
        defeat: 'You are still so strong. I am happy for you.',
        after: 'My Blissey looks after everyone here. Even the people who beat me.' }, PARTNER)),
      at('riley', 11, 7, Object.assign({ items: FR2,
        before: 'The aura in this room is fierce today. Mine and Lucario\'s, against yours.',
        defeat: 'Your aura has grown. I can feel it from here.',
        after: 'Byron says hello. He always says hello. Loudly.' }, PARTNER)),
      at('buck', 13, 7, Object.assign({ items: FR2,
        before: 'Welcome to Grandfather\'s Battleground! On the mountain we fought side by side. Today, we fight each other!',
        defeat: 'Wow! Grandfather was watching, too. Now I will never hear the end of it!',
        after: 'Heatran still sleeps under the mountain. I go and say hello sometimes. From far away.' }, PARTNER))
    ]
  }, SINNOH));

  /** The clerk: not ready yet, then who has come today. */
  async function clerk(h) {
    const F = G.Field;
    if (!F.flag('magma-stone-back')) {
      await h.say(T('This is the Battleground. One day the Gym Leaders of Sinnoh will meet here to battle anyone who asks. We are not quite ready for them yet.'));
      return;
    }
    const [a, b, c, d] = today().map(id => T(NAME[id]));
    await h.say(T('Welcome to the Battleground! Gym Leaders and strong Trainers from all over Sinnoh come here to battle, a few of them each day.'));
    if (d) await h.say(G.I18n.fmt('Here today: {a}, {b}, {c} and {d}. Talk to whoever you like. Each of them battles you once a day.', { a, b, c, d }));
  }

  G.Battleground = { POOL, TEAMS, today, roster };
  G.Script.def({
    'bground.enter': [['js', () => { today(); }]],
    'bground.clerk': [['js', clerk]]
  });
})();
