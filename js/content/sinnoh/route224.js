/* ============ route224.js — the inner Victory Road, Marley and Route 224 ============
 * Chapter 67. Once you have the National Pokédex (flag national-dex) the Ace Trainer before the second mouth in the League's
 * plaza (victory.js) steps aside: the inner Victory Road (`victory-inside`, `victory-exit`) goes east to Route 224. In the
 * first hall Marley comes up and asks to go with you to the stone at the end of Route 224 (flags marley-met, marley-along):
 * she walks behind you (`companion`), fights beside you with Arcanine against the pairs of Trainers (`ally`) and heals the
 * team after each battle (`afterBattle`). Route 224 is in fog (`fog`: only how it looks) along the shore and north to the
 * stone, where she says goodbye (flag marley-done) and the chapter ends (`ending(67)`); then she comes to the Battleground
 * (battleground.js). Platinum's Trainers and wild Pokémon; the pairs are mine (Serebii only marks Micah as a partner).
 * Left out: Seabreak Path and Shaymin (Platinum's event item, Oak's Letter), Victory Road's inner B1F, the Dowsing Machine's
 * items, berries, the Destiny Knot and the Repeat Ball (not in the game), double wild battles with a partner.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const CAVE = { loc: 'sinnoh-victory-road', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true };
  const MARLEY = { name: 'Marley' };
  const MARLEY_TEAM = [['arcanine', 59, ['extreme-speed', 'fire-fang', 'helping-hand', 'agility']]];
  const WITH = {
    ally: { if: 'marley-along', name: 'Marley', team: MARLEY_TEAM },
    companion: { if: 'marley-along', who: 'marley', name: 'Marley', say: 'Arcanine knows the way by smell. I just follow Arcanine. And you.' },
    afterBattle: { if: 'marley-along', script: 'r224.heal' }
  };
  const PAIR = { cls: 'double-team', double: true };

  // ---------------- Victory Road, the inside ----------------
  G.Maps.def(Object.assign({
    id: 'victory-inside', rows: [
      '##################O#################',
      '##############.........#############',
      '##############.........#############',
      '##############.........#############',
      '##############.........#############',
      '##############.........#############',
      '#################...################',
      '#################...################',
      '#################...################',
      '#################...################',
      '###..............................###',
      '###..............................###',
      '###..........###.....###.........###',
      '###..........###.....###.........###',
      '###..............................###',
      '###..............................###',
      '###...########################...###',
      '###...########################...###',
      '###...########################...###',
      '###...########################...###',
      '###...########################...###',
      '###...########################...###',
      '###..............................###',
      '###..............................O##',
      '###..............................###',
      '####################################'
    ],
    encounters: { walk: '@sinnoh-victory-road-inside' },
    warps: [{ x: 18, y: 0, to: 'sinnoh-league', spot: 'inside' }, { x: 33, y: 23, to: 'victory-exit', spot: 'west' }],
    spots: { mouth: [18, 1, 'down'], east: [32, 23, 'left'] },
    triggers: [{ x: 14, y: 2, w: 9, h: 1, if: '!marley-met', script: 'r224.marley' }],
    items: [{ x: 32, y: 10, item: 'nugget', flag: 'vinside-nugget' }, { x: 3, y: 24, item: 'full-restore', flag: 'vinside-restore' },
            { x: 14, y: 1, item: 'leftovers', flag: 'vinside-leftovers' }],
    npcs: [{ id: 'marley', who: 'marley', x: 18, y: 4, dir: 'up', if: '!marley-met' }],
    trainers: [
      Object.assign({ id: 'micah-brandi', who: 'cooltrainerm', name: 'Micah & Brandi', x: 8, y: 11, dir: 'right', sight: 4, partner: { who: 'cooltrainer', x: 8, y: 12, dir: 'right' },
        before: 'Only Champions come this way. Let us see if you two deserve to!',
        defeat: 'You deserve it. Both of you.',
        after: 'The road east comes out by the sea. It is always foggy there.',
        team: [['metang', 55, ['bullet-punch', 'zen-headbutt', 'pursuit', 'meteor-mash']], ['marowak', 54, ['bone-rush', 'stone-edge', 'swords-dance', 'endeavor']],
               ['ludicolo', 56, ['water-pulse', 'zen-headbutt', 'energy-ball', 'fake-out']], ['kangaskhan', 57, ['dizzy-punch', 'crunch', 'outrage', 'earthquake']]] }, PAIR),
      { id: 'terrell', who: 'gentleman', cls: 'veteran', name: 'Terrell', x: 27, y: 10, dir: 'down', sight: 4,
        before: 'I have walked these caves since before the League was built. Show me what the new Champion can do.',
        defeat: 'The new Champion can do a great deal.',
        after: 'There is a stone at the end of Route 224. Nobody knows who carved it.',
        team: [['parasect', 53, ['x-scissor', 'giga-drain', 'spore', 'slash']], ['rhydon', 54, ['hammer-arm', 'stone-edge', 'earthquake', 'megahorn']],
               ['magmar', 55, ['fire-blast', 'confuse-ray', 'iron-tail', 'focus-blast']]] },
      Object.assign({ id: 'desiree-landon', who: 'psychic', name: 'Desiree & Landon', x: 16, y: 22, dir: 'down', sight: 2, partner: { who: 'psychic', x: 17, y: 22, dir: 'down' },
        before: 'We saw two Trainers coming in our dreams. Here you are!',
        defeat: 'Our dreams did not show us losing.',
        after: 'The girl with you has a gentle mind. She worries more than she says.',
        team: [['mr-mime', 54, ['psychic', 'reflect', 'light-screen', 'drain-punch']], ['shuppet', 53, ['shadow-ball', 'will-o-wisp', 'sucker-punch', 'confuse-ray']],
               ['mismagius', 54, ['shadow-ball', 'magical-leaf', 'aerial-ace', 'shock-wave']], ['alakazam', 55, ['psychic', 'future-sight', 'recover', 'focus-blast']]] }, PAIR),
      { id: 'arthur', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Arthur', x: 29, y: 24, dir: 'left', sight: 3,
        before: 'I train here because nobody bothers me. You are bothering me. Battle!',
        defeat: 'Fine. Go on. Stop bothering me.',
        after: 'The exit area is ahead. More Trainers who want to be left alone.',
        team: [['gastrodon', 54, ['muddy-water', 'recover', 'toxic', 'water-pulse']], ['beedrill', 54, ['poison-jab', 'u-turn', 'aerial-ace', 'swords-dance']],
               ['electrode', 55, ['thunderbolt', 'hyper-beam', 'endure', 'explosion']]] },
      { id: 'clarice', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Clarice', x: 31, y: 18, dir: 'down', sight: 3,
        before: 'A Champion in my training spot? Then it is a good day for a hard battle.',
        defeat: 'Hard, and short.',
        after: 'Magnezone loves this cave. All this metal in the rocks.',
        team: [['swalot', 53, ['gunk-shot', 'yawn', 'body-slam', 'protect']], ['ninetales', 54, ['will-o-wisp', 'flamethrower', 'dark-pulse', 'extrasensory']],
               ['magnezone', 56, ['flash-cannon', 'mirror-coat', 'discharge', 'hyper-beam']]] }
    ]
  }, CAVE, WITH, SINNOH));

  // ---------------- Victory Road, the exit area ----------------
  G.Maps.def(Object.assign({
    id: 'victory-exit', rows: [
      '####################################',
      '####################################',
      '####################################',
      '#############..........#############',
      '#############..........#############',
      '#############..........#############',
      '#############..........####........#',
      '#############...####...####........#',
      '#############...####...####........#',
      '#........####...####...####........#',
      '#...............####...............#',
      'O...............####...............O',
      '#...............####...............#',
      '#........####...####...####........#',
      '#############...####...####........#',
      '#############..........####........#',
      '#############..........####........#',
      '#############..........#############',
      '#############..........#############',
      '####################################',
      '####################################',
      '####################################'
    ],
    encounters: { walk: '@sinnoh-victory-road-inside-exit' },
    warps: [{ x: 0, y: 11, to: 'victory-inside', spot: 'east' }, { x: 35, y: 11, to: 'route224', spot: 'cave' }],
    spots: { west: [1, 11, 'right'], east: [34, 11, 'left'] },
    items: [{ x: 34, y: 6, item: 'dusk-stone', flag: 'vexit-dusk' }, { x: 13, y: 3, item: 'big-pearl', flag: 'vexit-pearl' },
            { x: 13, y: 18, item: 'elixir', flag: 'vexit-elixir' }],
    trainers: [
      Object.assign({ id: 'deandre-kendra', who: 'psychic', name: 'Deandre & Kendra', x: 14, y: 6, dir: 'right', sight: 4, partner: { who: 'psychic', x: 14, y: 5, dir: 'right' },
        before: 'Ghosts love the dark at the end of a cave. So do we.',
        defeat: 'The ghosts fled. So will we.',
        after: 'Outside, the fog will feel like home to our Pokémon.',
        team: [['dusknoir', 56, ['shadow-punch', 'fire-punch', 'ice-punch', 'thunder-punch']], ['chimecho', 52, ['extrasensory', 'shadow-ball', 'energy-ball', 'charge-beam']],
               ['haunter', 52, ['shadow-punch', 'dark-pulse', 'confuse-ray', 'toxic']], ['gengar', 55, ['shadow-ball', 'dark-pulse', 'frustration', 'sludge-bomb']]] }, PAIR),
      Object.assign({ id: 'eddie-willie', who: 'blackbelt', name: 'Eddie & Willie', x: 21, y: 16, dir: 'left', sight: 4, partner: { who: 'blackbelt', x: 21, y: 17, dir: 'left' },
        before: 'Two fists, two Trainers, two Pokémon! Hyah!',
        defeat: 'Two losses. Hyah...',
        after: 'We train in the dark so we can fight blind. It is harder than it sounds.',
        team: [['mankey', 51, ['cross-chop', 'thrash', 'punishment', 'close-combat']], ['heracross', 54, ['take-down', 'close-combat', 'reversal', 'feint']],
               ['machoke', 53, ['wake-up-slap', 'cross-chop', 'scary-face', 'dynamic-punch']], ['machamp', 54, ['wake-up-slap', 'cross-chop', 'scary-face', 'dynamic-punch']],
               ['infernape', 55, ['punishment', 'close-combat', 'fire-spin', 'calm-mind']]] }, PAIR),
      { id: 'autumn', who: 'birdkeeper', cls: 'bird-keeper', name: 'Autumn', x: 25, y: 10, dir: 'down', sight: 2,
        before: 'My birds flew in here and will not fly out. So I battle whoever comes by!',
        defeat: 'Maybe they stay because of Trainers like you.',
        after: 'Murkrow likes shiny things. Watch your Badges.',
        team: [['murkrow', 54, ['taunt', 'feint-attack', 'mean-look', 'sucker-punch']], ['xatu', 54, ['future-sight', 'ominous-wind', 'power-swap', 'guard-swap']]] },
      { id: 'joe', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Joe', x: 30, y: 7, dir: 'down', sight: 3,
        before: 'Dragons grow up in caves like this one. Mine are nearly grown!',
        defeat: 'Nearly is not enough, it seems.',
        after: 'One day my Gabite will be a Garchomp. Then we will talk again.',
        team: [['dratini', 52, ['dragon-rush', 'safeguard', 'dragon-dance', 'outrage']], ['gabite', 56, ['slash', 'dragon-claw', 'dig', 'dragon-rush']]] },
      { id: 'brenden', who: 'gentleman', cls: 'veteran', name: 'Brenden', x: 32, y: 15, dir: 'up', sight: 3,
        before: 'The last Trainer before the sea. Let me be a good memory of this cave.',
        defeat: 'A good memory indeed.',
        after: 'Out there it is Route 224. Mind the fog, and mind the edge of the water.',
        team: [['forretress', 54, ['flash-cannon', 'rock-slide', 'stealth-rock', 'toxic-spikes']], ['gyarados', 54, ['earthquake', 'aqua-tail', 'ice-fang', 'dragon-pulse']],
               ['hippowdon', 54, ['dig', 'crunch', 'protect', 'rest']]] }
    ]
  }, CAVE, WITH, SINNOH));

  // ---------------- Route 224 ----------------
  G.Maps.def(Object.assign({
    id: 'route224', loc: 'sinnoh-route-224', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    fog: true,
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T######.............S........:~~~~~~~~~T',
      'T######......................:~~~~~~~~~T',
      'T######...........,,,,,,,,,..:~~~~~~~~~T',
      'T######...........,,,,,,,,,..:~~~~~~~~~T',
      'T######..................,,..:~~~~~~~~~T',
      'T######.."""""""".T......,,..:~~~~~~~~~T',
      'T######..""""""""..T.....,,..:~~~~~~~~~T',
      'T######..""""""""........,,..:~~~~~~~~~T',
      'T######..""""""""........,,..:~~~~~~~~~T',
      'T######..""""""""........,,..:~~~~~~~~~T',
      'T######..""""""""........,,..:~~~~~~~~~T',
      'T######..""""""""........,,..:~~~~~~~~~T',
      'T######..................,,..:~~~~~~~~~T',
      'T######...............T..,,..:~~~~~~~~~T',
      'T######..""""""""""""..T.,,..:~~~~~~~~~T',
      'T######..""""""""""""....,,..:~~~~~~~~~T',
      'T######..""""""""""""....,,..:~~~~~~~~~T',
      'T######..""""""""""""....,,..:~~~~~~~~~T',
      'T######..""""""""""""....,,..:~~~~~~~~~T',
      'T######..................,,..:~~~~~~~~~T',
      'T######,,,,,,,,,,,,,,,,,,,,..:~~~~~~~~~T',
      'T#####O,,,,,,,,,,,,,,,,,,,,..:~~~~~~~~~T',
      'T######.....T................:~~~~~~~~~T',
      'T######......................:~~~~~~~~~T',
      'T######::::::::::::::::::::::::::::::::T',
      'T######:::~~~~~~~~~~~~~::::::::::::::::T',
      'T######:::~~~~~~~~~~~~~::::::::::::::::T',
      'T######::::::::::::::::::::::::::::::::T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    encounters: { walk: '@sinnoh-route-224-area', water: '@sinnoh-route-224-area' },
    warps: [{ x: 6, y: 22, to: 'victory-exit', spot: 'east' }],
    spots: { cave: [7, 22, 'right'] },
    signs: { '20,1': 'A great white stone stands at the end of the road. Words are carved into it, worn almost smooth: "Give thanks to the land, and the land gives back."' },
    triggers: [{ x: 18, y: 2, w: 5, h: 1, if: 'marley-along', script: 'r224.stone' }],
    npcs: [{ id: 'marley', who: 'marley', x: 20, y: 3, dir: 'up', if: 'scripted' }],     // only the stone shows her
    items: [{ x: 10, y: 13, item: 'up-grade', flag: 'route224-upgrade' }, { x: 37, y: 28, item: 'pp-max', flag: 'route224-ppmax' },
            { x: 8, y: 1, item: 'ultra-ball', flag: 'route224-ball' }, { x: 14, y: 24, item: 'razor-claw', flag: 'route224-claw' }],
    trainers: [
      { id: 'ruben', who: 'cooltrainerm', cls: 'cooltrainer', name: 'Ruben', x: 15, y: 20, dir: 'down', sight: 2,
        before: 'I came out here to see the stone, and got lost in the fog. A battle will clear my head!',
        defeat: 'My head is clear. My team is not.',
        after: 'Follow the road north. The stone is at the very end.',
        team: [['nuzleaf', 56, ['extrasensory', 'fake-out', 'feint-attack', 'razor-leaf']], ['gyarados', 57, ['aqua-tail', 'hydro-pump', 'dragon-dance', 'ice-fang']]] },
      { id: 'maxwell', who: 'psychic', cls: 'psychic', name: 'Maxwell', x: 24, y: 17, dir: 'right', sight: 1,
        before: 'I can see through the fog with my mind. I saw you coming!',
        defeat: 'I did not see that, though.',
        after: 'Something gentle lives beyond the stone. I can feel it, but I cannot reach it.',
        team: [['misdreavus', 58, ['shadow-ball', 'perish-song', 'grudge', 'power-gem']], ['haunter', 54, ['shadow-ball', 'dream-eater', 'dark-pulse', 'destiny-bond']]] },
      { id: 'armando', who: 'gentleman', cls: 'veteran', name: 'Armando', x: 27, y: 12, dir: 'left', sight: 1,
        before: 'I come here every year to read the stone. Every year someone challenges me on the way.',
        defeat: 'And every year I lose. It is a tradition now.',
        after: 'The words on the stone are about thanks. Thanks for what, nobody agrees.',
        team: [['muk', 53, ['acid-armor', 'toxic', 'sludge-bomb', 'dark-pulse']], ['mightyena', 53, ['sucker-punch', 'taunt', 'assurance', 'take-down']],
               ['lickitung', 56, ['power-whip', 'giga-impact', 'surf', 'fire-blast']]] },
      { id: 'larry', who: 'hiker', cls: 'ruin-maniac', name: 'Larry', x: 24, y: 7, dir: 'right', sight: 1,
        before: 'That stone is older than the League! I have been studying it for years!',
        defeat: 'Years of study, and one battle undoes me.',
        after: 'My Aerodactyl came out of an old Fossil. Old things are the best things.',
        team: [['aerodactyl', 57, ['crunch', 'take-down', 'iron-head', 'hyper-beam']]] },
      { id: 'hayden', who: 'cooltrainerm', cls: 'dragon-tamer', name: 'Hayden', x: 22, y: 5, dir: 'up', sight: 2,
        before: 'The last stretch to the stone. A Dragon Tamer guards it, at least today!',
        defeat: 'Go on, then. The stone is all yours.',
        after: 'Read the stone, then go home. That is how it works out here.',
        team: [['altaria', 56, ['dragon-breath', 'dragon-dance', 'refresh', 'dragon-pulse']], ['seadra', 56, ['twister', 'brine', 'hydro-pump', 'dragon-dance']]] }
    ]
  }, WITH, SINNOH));

  // ---------------- Marley ----------------
  async function marley(h) {
    const F = G.Field, W = G.World, me = W.player;
    if (F.flag('marley-met')) return;
    if (me) await h.walkTo('marley', me.x, me.y + 1);
    h.face('marley', 'player');
    await h.say(T('...You are the Champion. I am Marley. I want to see the stone at the end of Route 224.'), MARLEY);
    await h.say(T('The fog out there is thick, and my Arcanine cannot clear it. I would rather not go alone. May I come with you?'), MARLEY);
    await h.say(T('The Trainers in here like to battle in pairs. Arcanine and I will fight beside you, and I will see to your team.'), MARLEY);
    h.hide('marley');
    F.setFlag('marley-met');
    F.setFlag('marley-along');
    if (W.makeFollower) W.makeFollower();
  }

  async function stone(h) {
    const F = G.Field, W = G.World, me = W.player;
    if (!F.flag('marley-along')) return;
    if (me) { h.place('marley', me.x + (me.x < 20 ? 1 : -1), me.y, me.x < 20 ? 'left' : 'right'); h.show('marley'); }
    F.clearFlag('marley-along');
    if (W.makeFollower) W.makeFollower();
    await h.say(T('So this is the stone. They say a Pokémon covered in flowers comes here to give thanks.'), MARLEY);
    await h.say(T('I do not see it. Maybe it only comes when nobody is looking. ...That is all right.'), MARLEY);
    await h.say(T('Thank you for walking with me. Sometimes I battle at the Battleground in the Survival Area. Come and find me.'), MARLEY);
    await h.fade('out', 0.3);
    h.hide('marley');
    await h.fade('in', 0.3);
    F.setFlag('marley-done');
    if (F.flag('chapter-67-done')) return;
    // The end of the sixty-seventh chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(67); else F.setFlag('chapter-67-done');
  }

  G.Route224 = { MARLEY_TEAM };
  G.Script.def({
    'r224.marley': [['js', marley]],
    'r224.stone': [['js', stone]],
    'r224.heal': [['healAnim'], ['heal'], ['say', 'Marley looked after your Pokémon. They are fully healed!']]
  });
})();
