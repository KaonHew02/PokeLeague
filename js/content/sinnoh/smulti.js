/* ============ smulti.js — Sinnoh's Battle Tower: multi battles beside a partner ============
 * Chapter 95 (Platinum's Battle Tower, after the League; the Tower itself is frontier.js). The lobby's third counter
 * (`stower.multi`): two Pokémon of your own (G.TowerHall.pickEntrants, Platinum's banned list), then the Battle Salon
 * (`sinnoh-tower-salon`), where the Trainers you have traveled with wait (the Battleground's flags: Cheryl, Mira, Riley,
 * Marley, Buck). Each brings two Pokémon drawn when the challenge starts (`partnerTeam`: Platinum's rule, from their own
 * list, two species, not yours, no item twice and none of yours while it can); talking to one tells which, and teams up.
 * In the multi battle room (`sinnoh-tower-multi`) two Trainers of the round battle you together (`foesFor`: the Tower's roll
 * with another seed, two Pokémon each, `rules.tag`), seven in a row for the same Battle Points as single battles
 * (G.Tower.bpFor), the streak its own (G.Tower hall 'stower', mode 'multi'). No Frontier Brain here (Platinum has none in
 * multi battles). The 50th win in a row gives the two the Multi Ability Ribbon (G.Ribbons). The first round of seven won
 * once chapter 94 is done ends the chapter: `ending(95)`.
 * Sources: Platinum's decompilation (github.com/pret/pokeplatinum): the partners' sets (res/trainers/frontier), how their
 * Pokémon are drawn and the multi battle's party size, BP and ribbon (src/battle_tower.c, battle_tower_helpers.c), who waits
 * in the salon (res/field/maps/battle_tower_battle_salon). Their IVs are 31, as the decompilation gives them; EVs are left
 * out (the Tower's opponents have none here either). Of their 280 sets the 18 with a weather rock or an incense (not in this
 * game) are left out; the 6 with Draco Meteor or Hydro Cannon came back with chapter 96 (Platinum's tutors, tutors.js). The
 * rooms and the words are my own.
 *
 *   G.SinnohMulti.SETS {id: [species, moves, item, nature]} · LISTS {partner: [set ids]} · PARTNERS · MET · NAME
 *   met() -> the partners you have traveled with · partnerTeam(id, run, mine) -> two team rows · foesFor(n, run) -> a trainer def
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const SINNOH = { region: 'sinnoh' };
  const HALL = 'stower', MODE = 'multi';

  // ---------------- the partners' sets (Platinum's, from the decompilation) ----------------
  const SETS = {
    'abomasnow-2': ['abomasnow', ['giga-drain', 'sheer-cold', 'ingrain', 'leech-seed'], 'big-root', 'bold'],
    'absol-1': ['absol', ['sucker-punch', 'facade', 'double-team', 'taunt'], 'chople-berry', 'jolly'],
    'absol-2': ['absol', ['punishment', 'swagger', 'attract', 'thunder-wave'], 'quick-claw', 'adamant'],
    'absol-3': ['absol', ['night-slash', 'psycho-cut', 'x-scissor', 'aerial-ace'], 'razor-claw', 'jolly'],
    'absol-4': ['absol', ['night-slash', 'superpower', 'giga-impact', 'zen-headbutt'], 'choice-band', 'adamant'],
    'aerodactyl-1': ['aerodactyl', ['rock-slide', 'aerial-ace', 'torment', 'taunt'], 'kings-rock', 'jolly'],
    'aerodactyl-2': ['aerodactyl', ['bite', 'fire-fang', 'thunder-fang', 'ice-fang'], 'razor-fang', 'jolly'],
    'aerodactyl-3': ['aerodactyl', ['giga-impact', 'earthquake', 'rock-slide', 'crunch'], 'yache-berry', 'adamant'],
    'aerodactyl-4': ['aerodactyl', ['stone-edge', 'aerial-ace', 'earthquake', 'dragon-claw'], 'choice-band', 'adamant'],
    'alakazam-1': ['alakazam', ['psychic', 'shadow-ball', 'calm-mind', 'future-sight'], 'bright-powder', 'timid'],
    'alakazam-2': ['alakazam', ['psychic', 'focus-blast', 'charge-beam', 'recover'], 'colbur-berry', 'modest'],
    'alakazam-3': ['alakazam', ['psychic', 'charge-beam', 'signal-beam', 'grass-knot'], 'wise-glasses', 'timid'],
    'alakazam-4': ['alakazam', ['psychic', 'shadow-ball', 'energy-ball', 'focus-blast'], 'expert-belt', 'modest'],
    'ambipom-1': ['ambipom', ['double-hit', 'shadow-claw', 'brick-break', 'knock-off'], 'muscle-band', 'jolly'],
    'ambipom-2': ['ambipom', ['last-resort', 'thunder-wave', 'protect', 'fake-out'], 'metronome', 'jolly'],
    'ambipom-3': ['ambipom', ['double-hit', 'gunk-shot', 'seed-bomb', 'aerial-ace'], 'life-orb', 'adamant'],
    'ambipom-4': ['ambipom', ['double-hit', 'fire-punch', 'thunder-punch', 'ice-punch'], 'life-orb', 'adamant'],
    'arcanine-1': ['arcanine', ['fire-fang', 'extreme-speed', 'crunch', 'will-o-wisp'], 'lum-berry', 'jolly'],
    'arcanine-2': ['arcanine', ['flare-blitz', 'thunder-fang', 'reversal', 'endure'], 'salac-berry', 'jolly'],
    'arcanine-3': ['arcanine', ['overheat', 'solar-beam', 'dragon-pulse', 'sunny-day'], 'white-herb', 'modest'],
    'arcanine-4': ['arcanine', ['flare-blitz', 'extreme-speed', 'crunch', 'thunder-fang'], 'focus-band', 'adamant'],
    'articuno-2': ['articuno', ['avalanche', 'aerial-ace', 'facade', 'reflect'], 'wacan-berry', 'brave'],
    'articuno-3': ['articuno', ['ice-beam', 'signal-beam', 'ominous-wind', 'water-pulse'], 'wise-glasses', 'modest'],
    'articuno-4': ['articuno', ['ice-beam', 'air-cutter', 'ancient-power', 'sheer-cold'], 'charti-berry', 'modest'],
    'bastiodon-1': ['bastiodon', ['iron-head', 'stone-edge', 'swagger', 'taunt'], 'focus-band', 'impish'],
    'bastiodon-2': ['bastiodon', ['ancient-power', 'flamethrower', 'thunderbolt', 'ice-beam'], 'persim-berry', 'modest'],
    'bastiodon-3': ['bastiodon', ['iron-head', 'fissure', 'double-team', 'iron-defense'], 'leftovers', 'careful'],
    'bastiodon-4': ['bastiodon', ['metal-burst', 'stone-edge', 'avalanche', 'curse'], 'focus-sash', 'adamant'],
    'blissey-1': ['blissey', ['hyper-beam', 'shadow-ball', 'water-pulse', 'sing'], 'chople-berry', 'modest'],
    'blissey-2': ['blissey', ['toxic', 'double-team', 'soft-boiled', 'counter'], 'chesto-berry', 'calm'],
    'blissey-3': ['blissey', ['flamethrower', 'thunderbolt', 'ice-beam', 'calm-mind'], 'bright-powder', 'modest'],
    'blissey-4': ['blissey', ['dream-eater', 'sing', 'soft-boiled', 'counter'], 'leftovers', 'calm'],
    'breloom-1': ['breloom', ['seed-bomb', 'sky-uppercut', 'rock-slide', 'counter'], 'focus-sash', 'impish'],
    'breloom-2': ['breloom', ['drain-punch', 'giga-drain', 'synthesis', 'leech-seed'], 'big-root', 'brave'],
    'breloom-3': ['breloom', ['dynamic-punch', 'thunder-punch', 'stone-edge', 'facade'], 'toxic-orb', 'adamant'],
    'breloom-4': ['breloom', ['focus-punch', 'seed-bomb', 'giga-impact', 'spore'], 'shell-bell', 'adamant'],
    'bronzong-1': ['bronzong', ['extrasensory', 'iron-head', 'rock-slide', 'trick-room'], 'kings-rock', 'impish'],
    'bronzong-2': ['bronzong', ['dream-eater', 'hypnosis', 'signal-beam', 'trick-room'], 'lum-berry', 'calm'],
    'bronzong-3': ['bronzong', ['psychic', 'shadow-ball', 'charge-beam', 'signal-beam'], 'leftovers', 'modest'],
    'claydol-1': ['claydol', ['earthquake', 'zen-headbutt', 'grass-knot', 'trick-room'], 'kasib-berry', 'brave'],
    'claydol-2': ['claydol', ['earth-power', 'ancient-power', 'signal-beam', 'shadow-ball'], 'rindo-berry', 'modest'],
    'claydol-3': ['claydol', ['earth-power', 'psychic', 'charge-beam', 'ice-beam'], 'wise-glasses', 'modest'],
    'cloyster-2': ['cloyster', ['avalanche', 'dive', 'toxic', 'protect'], 'leftovers', 'impish'],
    'cradily-2': ['cradily', ['toxic', 'stockpile', 'double-team', 'ingrain'], 'leftovers', 'impish'],
    'cradily-3': ['cradily', ['giga-drain', 'sludge-bomb', 'recover', 'ingrain'], 'big-root', 'calm'],
    'cresselia-2': ['cresselia', ['psychic', 'toxic', 'double-team', 'moonlight'], 'lum-berry', 'bold'],
    'cresselia-3': ['cresselia', ['psychic', 'shadow-ball', 'energy-ball', 'charge-beam'], 'wise-glasses', 'modest'],
    'cresselia-4': ['cresselia', ['psychic', 'ice-beam', 'signal-beam', 'moonlight'], 'leftovers', 'modest'],
    'crobat-1': ['crobat', ['cross-poison', 'aerial-ace', 'roost', 'hypnosis'], 'payapa-berry', 'jolly'],
    'crobat-2': ['crobat', ['air-slash', 'zen-headbutt', 'bite', 'twister'], 'razor-fang', 'docile'],
    'crobat-3': ['crobat', ['air-slash', 'sludge-bomb', 'heat-wave', 'dark-pulse'], 'kings-rock', 'modest'],
    'crobat-4': ['crobat', ['cross-poison', 'brave-bird', 'x-scissor', 'zen-headbutt'], 'razor-claw', 'adamant'],
    'dragonite-1': ['dragonite', ['dragon-claw', 'aerial-ace', 'thunder-wave', 'dragon-dance'], 'lum-berry', 'adamant'],
    'dragonite-2': ['dragonite', ['dragon-rush', 'fire-punch', 'thunder-punch', 'ice-punch'], 'razor-claw', 'adamant'],
    'dragonite-3': ['dragonite', ['draco-meteor', 'flamethrower', 'thunderbolt', 'surf'], 'expert-belt', 'modest'],
    'dragonite-4': ['dragonite', ['outrage', 'giga-impact', 'earthquake', 'superpower'], 'choice-band', 'adamant'],
    'dugtrio-1': ['dugtrio', ['earthquake', 'rock-slide', 'astonish', 'sand-tomb'], 'grip-claw', 'jolly'],
    'dugtrio-3': ['dugtrio', ['fissure', 'giga-impact', 'aerial-ace', 'night-slash'], 'razor-claw', 'jolly'],
    'dugtrio-4': ['dugtrio', ['earthquake', 'stone-edge', 'slash', 'shadow-claw'], 'muscle-band', 'adamant'],
    'dusknoir-1': ['dusknoir', ['shadow-punch', 'fling', 'will-o-wisp', 'trick-room'], 'iron-ball', 'brave'],
    'dusknoir-2': ['dusknoir', ['curse', 'pain-split', 'confuse-ray', 'attract'], 'leftovers', 'careful'],
    'dusknoir-3': ['dusknoir', ['shadow-punch', 'fire-punch', 'thunder-punch', 'ice-punch'], 'scope-lens', 'adamant'],
    'dusknoir-4': ['dusknoir', ['shadow-punch', 'earthquake', 'brick-break', 'rock-slide'], 'muscle-band', 'adamant'],
    'electrode-1': ['electrode', ['thunderbolt', 'swift', 'thunder-wave', 'light-screen'], 'chesto-berry', 'modest'],
    'electrode-2': ['electrode', ['charge-beam', 'thunder-wave', 'flash', 'swagger'], 'bright-powder', 'timid'],
    'empoleon-3': ['empoleon', ['surf', 'earthquake', 'blizzard', 'signal-beam'], 'quick-claw', 'brave'],
    'empoleon-4': ['empoleon', ['hydro-cannon', 'flash-cannon', 'drill-peck', 'earthquake'], 'quick-claw', 'brave'],
    'entei-1': ['entei', ['fire-fang', 'return', 'roar', 'reflect'], 'shuca-berry', 'jolly'],
    'entei-2': ['entei', ['fire-fang', 'bite', 'iron-head', 'stone-edge'], 'kings-rock', 'jolly'],
    'entei-3': ['entei', ['fire-blast', 'solar-beam', 'hyper-beam', 'sunny-day'], 'shuca-berry', 'modest'],
    'entei-4': ['entei', ['overheat', 'extrasensory', 'shadow-ball', 'calm-mind'], 'shuca-berry', 'modest'],
    'espeon-1': ['espeon', ['psychic', 'reflect', 'calm-mind', 'baton-pass'], 'lum-berry', 'timid'],
    'espeon-2': ['espeon', ['psychic', 'swift', 'charm', 'attract'], 'bright-powder', 'timid'],
    'espeon-3': ['espeon', ['psychic', 'shadow-ball', 'hyper-beam', 'grass-knot'], 'lum-berry', 'modest'],
    'espeon-4': ['espeon', ['psychic', 'shadow-ball', 'signal-beam', 'morning-sun'], 'wise-glasses', 'modest'],
    'exeggutor-1': ['exeggutor', ['solar-beam', 'psychic', 'synthesis', 'sunny-day'], 'bright-powder', 'modest'],
    'exeggutor-2': ['exeggutor', ['dream-eater', 'hypnosis', 'leech-seed', 'ingrain'], 'lum-berry', 'modest'],
    'exeggutor-4': ['exeggutor', ['leaf-storm', 'psychic', 'sludge-bomb', 'ancient-power'], 'expert-belt', 'modest'],
    'floatzel-1': ['floatzel', ['waterfall', 'ice-punch', 'quick-attack', 'rain-dance'], 'sitrus-berry', 'jolly'],
    'floatzel-2': ['floatzel', ['waterfall', 'focus-punch', 'double-team', 'attract'], 'chesto-berry', 'jolly'],
    'floatzel-4': ['floatzel', ['aqua-tail', 'ice-fang', 'crunch', 'brick-break'], 'razor-fang', 'adamant'],
    'gallade-1': ['gallade', ['zen-headbutt', 'brick-break', 'thunder-wave', 'confuse-ray'], 'kasib-berry', 'careful'],
    'gallade-2': ['gallade', ['drain-punch', 'fire-punch', 'thunder-punch', 'ice-punch'], 'bright-powder', 'jolly'],
    'gallade-3': ['gallade', ['psycho-cut', 'stone-edge', 'aerial-ace', 'x-scissor'], 'scope-lens', 'adamant'],
    'gallade-4': ['gallade', ['psycho-cut', 'close-combat', 'leaf-blade', 'night-slash'], 'scope-lens', 'adamant'],
    'garchomp-1': ['garchomp', ['dragon-claw', 'earthquake', 'double-team', 'sandstorm'], 'bright-powder', 'jolly'],
    'garchomp-2': ['garchomp', ['draco-meteor', 'earth-power', 'flamethrower', 'surf'], 'white-herb', 'modest'],
    'garchomp-3': ['garchomp', ['dragon-rush', 'stone-edge', 'aqua-tail', 'aerial-ace'], 'focus-sash', 'adamant'],
    'garchomp-4': ['garchomp', ['outrage', 'earthquake', 'crunch', 'fire-fang'], 'persim-berry', 'adamant'],
    'gardevoir-1': ['gardevoir', ['psychic', 'shadow-ball', 'thunder-wave', 'confuse-ray'], 'lum-berry', 'calm'],
    'gardevoir-2': ['gardevoir', ['psychic', 'thunderbolt', 'calm-mind', 'rest'], 'chesto-berry', 'modest'],
    'gardevoir-3': ['gardevoir', ['psychic', 'charge-beam', 'energy-ball', 'focus-blast'], 'bright-powder', 'modest'],
    'gardevoir-4': ['gardevoir', ['psychic', 'thunderbolt', 'shadow-ball', 'destiny-bond'], 'wise-glasses', 'timid'],
    'gastrodon-1': ['gastrodon', ['waterfall', 'earthquake', 'recover', 'mirror-coat'], 'focus-sash', 'careful'],
    'gastrodon-2': ['gastrodon', ['muddy-water', 'mud-bomb', 'recover', 'yawn'], 'zoom-lens', 'sassy'],
    'gengar-1': ['gengar', ['shadow-ball', 'sludge-bomb', 'spite', 'confuse-ray'], 'payapa-berry', 'timid'],
    'gengar-2': ['gengar', ['shadow-ball', 'dream-eater', 'hypnosis', 'substitute'], 'life-orb', 'modest'],
    'gengar-3': ['gengar', ['psychic', 'energy-ball', 'focus-blast', 'confuse-ray'], 'scope-lens', 'modest'],
    'gengar-4': ['gengar', ['shadow-ball', 'sludge-bomb', 'thunderbolt', 'destiny-bond'], 'lum-berry', 'modest'],
    'glaceon-2': ['glaceon', ['ice-beam', 'double-team', 'yawn', 'hail'], 'leftovers', 'calm'],
    'glaceon-3': ['glaceon', ['blizzard', 'hyper-beam', 'hail', 'mirror-coat'], 'focus-sash', 'modest'],
    'glaceon-4': ['glaceon', ['ice-beam', 'shadow-ball', 'signal-beam', 'water-pulse'], 'wise-glasses', 'modest'],
    'gyarados-1': ['gyarados', ['aqua-tail', 'ice-fang', 'bite', 'rain-dance'], 'razor-fang', 'careful'],
    'gyarados-2': ['gyarados', ['waterfall', 'ice-fang', 'iron-head', 'dragon-dance'], 'lum-berry', 'jolly'],
    'gyarados-3': ['gyarados', ['outrage', 'waterfall', 'stone-edge', 'giga-impact'], 'persim-berry', 'adamant'],
    'gyarados-4': ['gyarados', ['waterfall', 'earthquake', 'rest', 'dragon-dance'], 'chesto-berry', 'adamant'],
    'heatran-1': ['heatran', ['heat-wave', 'flash-cannon', 'ancient-power', 'scary-face'], 'shuca-berry', 'modest'],
    'heatran-3': ['heatran', ['flamethrower', 'earth-power', 'dragon-pulse', 'dark-pulse'], 'bright-powder', 'modest'],
    'heracross-1': ['heracross', ['megahorn', 'focus-punch', 'swagger', 'attract'], 'focus-band', 'jolly'],
    'heracross-2': ['heracross', ['close-combat', 'aerial-ace', 'night-slash', 'bulk-up'], 'scope-lens', 'adamant'],
    'heracross-3': ['heracross', ['megahorn', 'stone-edge', 'facade', 'shadow-claw'], 'coba-berry', 'adamant'],
    'heracross-4': ['heracross', ['megahorn', 'earthquake', 'reversal', 'endure'], 'salac-berry', 'jolly'],
    'hippowdon-1': ['hippowdon', ['earthquake', 'crunch', 'slack-off', 'curse'], 'persim-berry', 'impish'],
    'hippowdon-2': ['hippowdon', ['earthquake', 'swagger', 'sand-tomb', 'yawn'], 'sitrus-berry', 'impish'],
    'hippowdon-3': ['hippowdon', ['superpower', 'fire-fang', 'ice-fang', 'fissure'], 'white-herb', 'adamant'],
    'hippowdon-4': ['hippowdon', ['earthquake', 'stone-edge', 'crunch', 'thunder-fang'], 'quick-claw', 'adamant'],
    'jolteon-1': ['jolteon', ['thunderbolt', 'thunder-wave', 'agility', 'baton-pass'], 'focus-sash', 'timid'],
    'jolteon-2': ['jolteon', ['discharge', 'double-kick', 'dig', 'thunder-wave'], 'razor-claw', 'docile'],
    'jolteon-4': ['jolteon', ['thunderbolt', 'hyper-beam', 'shadow-ball', 'signal-beam'], 'razor-fang', 'modest'],
    'latias-1': ['latias', ['psychic', 'dragon-pulse', 'attract', 'calm-mind'], 'lum-berry', 'calm'],
    'latias-2': ['latias', ['dragon-claw', 'zen-headbutt', 'earthquake', 'aerial-ace'], 'expert-belt', 'adamant'],
    'latias-3': ['latias', ['psychic', 'ice-beam', 'energy-ball', 'shadow-ball'], 'bright-powder', 'timid'],
    'latias-4': ['latias', ['mist-ball', 'draco-meteor', 'thunderbolt', 'surf'], 'white-herb', 'modest'],
    'latios-1': ['latios', ['psychic', 'dragon-pulse', 'thunder-wave', 'calm-mind'], 'focus-band', 'calm'],
    'latios-2': ['latios', ['dragon-claw', 'shadow-claw', 'earthquake', 'dragon-dance'], 'lum-berry', 'adamant'],
    'latios-3': ['latios', ['psychic', 'thunderbolt', 'ice-beam', 'energy-ball'], 'bright-powder', 'timid'],
    'latios-4': ['latios', ['luster-purge', 'draco-meteor', 'hyper-beam', 'surf'], 'white-herb', 'modest'],
    'leafeon-1': ['leafeon', ['leaf-blade', 'aerial-ace', 'double-team', 'baton-pass'], 'scope-lens', 'jolly'],
    'leafeon-2': ['leafeon', ['leaf-blade', 'last-resort', 'curse', 'grass-whistle'], 'bright-powder', 'jolly'],
    'leafeon-4': ['leafeon', ['leaf-blade', 'x-scissor', 'aerial-ace', 'bite'], 'quick-claw', 'adamant'],
    'lucario-1': ['lucario', ['aura-sphere', 'flash-cannon', 'water-pulse', 'roar'], 'bright-powder', 'modest'],
    'lucario-2': ['lucario', ['cross-chop', 'stone-edge', 'thunder-punch', 'ice-punch'], 'scope-lens', 'adamant'],
    'lucario-3': ['lucario', ['close-combat', 'earthquake', 'blaze-kick', 'shadow-claw'], 'muscle-band', 'adamant'],
    'lucario-4': ['lucario', ['aura-sphere', 'psychic', 'shadow-ball', 'dragon-pulse'], 'expert-belt', 'modest'],
    'ludicolo-2': ['ludicolo', ['leech-seed', 'toxic', 'double-team', 'rain-dance'], 'leftovers', 'impish'],
    'machamp-1': ['machamp', ['cross-chop', 'earthquake', 'bullet-punch', 'foresight'], 'scope-lens', 'adamant'],
    'machamp-2': ['machamp', ['revenge', 'earthquake', 'payback', 'counter'], 'focus-sash', 'adamant'],
    'machamp-3': ['machamp', ['dynamic-punch', 'earthquake', 'stone-edge', 'ice-punch'], 'quick-claw', 'adamant'],
    'machamp-4': ['machamp', ['cross-chop', 'earthquake', 'thunder-punch', 'fire-punch'], 'quick-claw', 'adamant'],
    'magmortar-4': ['magmortar', ['overheat', 'psychic', 'focus-blast', 'confuse-ray'], 'white-herb', 'modest'],
    'magnezone-1': ['magnezone', ['thunderbolt', 'mirror-shot', 'light-screen', 'reflect'], 'light-clay', 'bold'],
    'magnezone-3': ['magnezone', ['charge-beam', 'flash-cannon', 'magnet-rise', 'thunder-wave'], 'chesto-berry', 'modest'],
    'magnezone-4': ['magnezone', ['thunderbolt', 'flash-cannon', 'tri-attack', 'signal-beam'], 'bright-powder', 'modest'],
    'medicham-2': ['medicham', ['drain-punch', 'poison-jab', 'detect', 'recover'], 'cheri-berry', 'jolly'],
    'meganium-2': ['meganium', ['giga-drain', 'leech-seed', 'toxic', 'substitute'], 'big-root', 'calm'],
    'metagross-1': ['metagross', ['zen-headbutt', 'bullet-punch', 'facade', 'light-screen'], 'bright-powder', 'adamant'],
    'metagross-2': ['metagross', ['psychic', 'flash-cannon', 'shadow-ball', 'sludge-bomb'], 'wise-glasses', 'modest'],
    'metagross-3': ['metagross', ['hammer-arm', 'thunder-punch', 'ice-punch', 'aerial-ace'], 'occa-berry', 'adamant'],
    'milotic-1': ['milotic', ['surf', 'ice-beam', 'attract', 'hypnosis'], 'shell-bell', 'modest'],
    'milotic-2': ['milotic', ['toxic', 'confuse-ray', 'double-team', 'aqua-ring'], 'leftovers', 'impish'],
    'milotic-3': ['milotic', ['hydro-pump', 'blizzard', 'mirror-coat', 'recover'], 'wide-lens', 'calm'],
    'milotic-4': ['milotic', ['surf', 'ice-beam', 'dragon-pulse', 'recover'], 'lum-berry', 'modest'],
    'miltank-1': ['miltank', ['return', 'iron-head', 'thunder-wave', 'milk-drink'], 'cheri-berry', 'impish'],
    'moltres-1': ['moltres', ['flamethrower', 'air-slash', 'ancient-power', 'roost'], 'passho-berry', 'timid'],
    'moltres-4': ['moltres', ['overheat', 'air-slash', 'ancient-power', 'ominous-wind'], 'white-herb', 'modest'],
    'ninjask-1': ['ninjask', ['bug-bite', 'aerial-ace', 'sand-attack', 'baton-pass'], 'chesto-berry', 'adamant'],
    'ninjask-2': ['ninjask', ['x-scissor', 'aerial-ace', 'night-slash', 'baton-pass'], 'razor-fang', 'adamant'],
    'pinsir-1': ['pinsir', ['x-scissor', 'earthquake', 'rock-slide', 'swords-dance'], 'coba-berry', 'adamant'],
    'pinsir-2': ['pinsir', ['x-scissor', 'revenge', 'flail', 'endure'], 'salac-berry', 'jolly'],
    'pinsir-4': ['pinsir', ['x-scissor', 'earthquake', 'close-combat', 'guillotine'], 'scope-lens', 'adamant'],
    'porygon2-2': ['porygon2', ['tri-attack', 'thunderbolt', 'recover', 'trick-room'], 'iron-ball', 'quiet'],
    'porygon-z-1': ['porygon-z', ['tri-attack', 'shadow-ball', 'recycle', 'conversion-2'], 'sitrus-berry', 'modest'],
    'porygon-z-2': ['porygon-z', ['tri-attack', 'thunder-wave', 'recover', 'trick'], 'choice-scarf', 'timid'],
    'porygon-z-3': ['porygon-z', ['psychic', 'ice-beam', 'signal-beam', 'charge-beam'], 'wise-glasses', 'modest'],
    'porygon-z-4': ['porygon-z', ['tri-attack', 'shadow-ball', 'thunderbolt', 'recover'], 'expert-belt', 'modest'],
    'probopass-1': ['probopass', ['ancient-power', 'magnet-bomb', 'thunder-wave', 'protect'], 'cheri-berry', 'brave'],
    'probopass-2': ['probopass', ['iron-head', 'fire-punch', 'thunder-punch', 'ice-punch'], 'chople-berry', 'adamant'],
    'probopass-4': ['probopass', ['flash-cannon', 'power-gem', 'earth-power', 'thunderbolt'], 'life-orb', 'modest'],
    'raikou-1': ['raikou', ['thunderbolt', 'shadow-ball', 'thunder-wave', 'light-screen'], 'lum-berry', 'timid'],
    'raikou-2': ['raikou', ['thunder-fang', 'crunch', 'iron-head', 'return'], 'kings-rock', 'jolly'],
    'raikou-3': ['raikou', ['thunder', 'extrasensory', 'signal-beam', 'rain-dance'], 'wise-glasses', 'modest'],
    'raikou-4': ['raikou', ['thunderbolt', 'extrasensory', 'shadow-ball', 'calm-mind'], 'shuca-berry', 'modest'],
    'rampardos-1': ['rampardos', ['rock-slide', 'facade', 'crunch', 'screech'], 'toxic-orb', 'adamant'],
    'rampardos-2': ['rampardos', ['stone-edge', 'payback', 'avalanche', 'fling'], 'iron-ball', 'brave'],
    'rampardos-3': ['rampardos', ['head-smash', 'zen-headbutt', 'fire-punch', 'thunder-punch'], 'life-orb', 'adamant'],
    'rampardos-4': ['rampardos', ['head-smash', 'earthquake', 'giga-impact', 'superpower'], 'choice-scarf', 'jolly'],
    'regice-1': ['regice', ['ice-beam', 'signal-beam', 'charge-beam', 'amnesia'], 'lum-berry', 'modest'],
    'regice-2': ['regice', ['avalanche', 'hammer-arm', 'double-team', 'curse'], 'leftovers', 'impish'],
    'regice-3': ['regice', ['ice-beam', 'flash-cannon', 'ancient-power', 'rest'], 'chesto-berry', 'bold'],
    'regice-4': ['regice', ['ice-beam', 'thunderbolt', 'hyper-beam', 'focus-blast'], 'shell-bell', 'modest'],
    'regirock-1': ['regirock', ['rock-slide', 'earthquake', 'brick-break', 'sandstorm'], 'leftovers', 'impish'],
    'regirock-2': ['regirock', ['fire-punch', 'thunder-punch', 'ice-punch', 'drain-punch'], 'razor-claw', 'adamant'],
    'regirock-3': ['regirock', ['stone-edge', 'hammer-arm', 'rest', 'curse'], 'chesto-berry', 'careful'],
    'registeel-1': ['registeel', ['flash-cannon', 'thunderbolt', 'thunder-wave', 'amnesia'], 'lum-berry', 'modest'],
    'registeel-2': ['registeel', ['iron-head', 'toxic', 'double-team', 'iron-defense'], 'leftovers', 'adamant'],
    'registeel-3': ['registeel', ['shadow-claw', 'aerial-ace', 'thunder-punch', 'ice-punch'], 'razor-claw', 'adamant'],
    'registeel-4': ['registeel', ['iron-head', 'hammer-arm', 'earthquake', 'curse'], 'shell-bell', 'adamant'],
    'rhyperior-1': ['rhyperior', ['rock-wrecker', 'earthquake', 'crunch', 'roar'], 'focus-band', 'adamant'],
    'rhyperior-2': ['rhyperior', ['fire-punch', 'thunder-punch', 'ice-punch', 'aqua-tail'], 'expert-belt', 'adamant'],
    'rhyperior-4': ['rhyperior', ['rock-wrecker', 'earthquake', 'hammer-arm', 'megahorn'], 'choice-band', 'adamant'],
    'roserade-1': ['roserade', ['sludge-bomb', 'magical-leaf', 'stun-spore', 'mud-slap'], 'coba-berry', 'calm'],
    'roserade-2': ['roserade', ['giga-drain', 'leech-seed', 'ingrain', 'synthesis'], 'big-root', 'calm'],
    'roserade-3': ['roserade', ['leaf-storm', 'sludge-bomb', 'hyper-beam', 'grass-whistle'], 'white-herb', 'modest'],
    'roserade-4': ['roserade', ['leaf-storm', 'sludge-bomb', 'shadow-ball', 'weather-ball'], 'white-herb', 'modest'],
    'salamence-1': ['salamence', ['dragon-claw', 'aerial-ace', 'aqua-tail', 'scary-face'], 'cheri-berry', 'adamant'],
    'salamence-2': ['salamence', ['dragon-claw', 'fire-fang', 'thunder-fang', 'dragon-dance'], 'razor-fang', 'jolly'],
    'salamence-3': ['salamence', ['draco-meteor', 'hydro-pump', 'flamethrower', 'ominous-wind'], 'wise-glasses', 'modest'],
    'salamence-4': ['salamence', ['outrage', 'crunch', 'earthquake', 'zen-headbutt'], 'lum-berry', 'adamant'],
    'sceptile-1': ['sceptile', ['leaf-blade', 'crunch', 'quick-attack', 'screech'], 'liechi-berry', 'jolly'],
    'sceptile-2': ['sceptile', ['giga-drain', 'leech-seed', 'toxic', 'double-team'], 'leftovers', 'timid'],
    'sceptile-3': ['sceptile', ['leaf-blade', 'x-scissor', 'night-slash', 'aerial-ace'], 'scope-lens', 'adamant'],
    'sceptile-4': ['sceptile', ['leaf-storm', 'dragon-pulse', 'focus-blast', 'hyper-beam'], 'occa-berry', 'timid'],
    'shiftry-2': ['shiftry', ['giga-drain', 'leech-seed', 'double-team', 'synthesis'], 'leftovers', 'calm'],
    'shuckle-2': ['shuckle', ['wrap', 'swagger', 'attract', 'toxic'], 'grip-claw', 'careful'],
    'shuckle-4': ['shuckle', ['toxic', 'substitute', 'double-team', 'sandstorm'], 'leftovers', 'calm'],
    'skarmory-1': ['skarmory', ['drill-peck', 'steel-wing', 'spikes', 'roar'], 'occa-berry', 'impish'],
    'skarmory-2': ['skarmory', ['fly', 'toxic', 'double-team', 'roost'], 'leftovers', 'careful'],
    'skarmory-3': ['skarmory', ['drill-peck', 'slash', 'payback', 'night-slash'], 'razor-claw', 'impish'],
    'skarmory-4': ['skarmory', ['brave-bird', 'steel-wing', 'x-scissor', 'rock-slide'], 'life-orb', 'adamant'],
    'slaking-2': ['slaking', ['crush-claw', 'fire-punch', 'thunder-punch', 'ice-punch'], 'lum-berry', 'adamant'],
    'slaking-3': ['slaking', ['return', 'night-slash', 'gunk-shot', 'aerial-ace'], 'life-orb', 'jolly'],
    'slaking-4': ['slaking', ['giga-impact', 'earthquake', 'hammer-arm', 'shadow-claw'], 'muscle-band', 'adamant'],
    'snorlax-1': ['snorlax', ['return', 'rock-slide', 'curse', 'yawn'], 'leftovers', 'adamant'],
    'snorlax-2': ['snorlax', ['fire-punch', 'thunder-punch', 'ice-punch', 'rest'], 'chesto-berry', 'adamant'],
    'snorlax-3': ['snorlax', ['outrage', 'superpower', 'gunk-shot', 'seed-bomb'], 'white-herb', 'adamant'],
    'snorlax-4': ['snorlax', ['double-edge', 'earthquake', 'zen-headbutt', 'crunch'], 'life-orb', 'adamant'],
    'starmie-1': ['starmie', ['surf', 'psychic', 'confuse-ray', 'thunder-wave'], 'lum-berry', 'timid'],
    'starmie-2': ['starmie', ['hydro-pump', 'blizzard', 'thunder', 'recover'], 'wide-lens', 'timid'],
    'starmie-3': ['starmie', ['surf', 'psychic', 'power-gem', 'signal-beam'], 'wise-glasses', 'modest'],
    'starmie-4': ['starmie', ['surf', 'psychic', 'thunderbolt', 'ice-beam'], 'expert-belt', 'modest'],
    'steelix-1': ['steelix', ['earthquake', 'iron-head', 'crunch', 'sandstorm'], 'passho-berry', 'impish'],
    'steelix-2': ['steelix', ['earthquake', 'fire-fang', 'thunder-fang', 'ice-fang'], 'shuca-berry', 'adamant'],
    'steelix-3': ['steelix', ['gyro-ball', 'payback', 'swagger', 'curse'], 'iron-ball', 'relaxed'],
    'suicune-1': ['suicune', ['surf', 'icy-wind', 'ominous-wind', 'mirror-coat'], 'focus-sash', 'calm'],
    'suicune-2': ['suicune', ['waterfall', 'ice-fang', 'iron-head', 'bite'], 'kings-rock', 'jolly'],
    'suicune-3': ['suicune', ['hydro-pump', 'blizzard', 'shadow-ball', 'hail'], 'lum-berry', 'bold'],
    'suicune-4': ['suicune', ['surf', 'ice-beam', 'extrasensory', 'calm-mind'], 'wacan-berry', 'modest'],
    'swellow-2': ['swellow', ['facade', 'aerial-ace', 'growl', 'u-turn'], 'toxic-orb', 'adamant'],
    'tangrowth-1': ['tangrowth', ['energy-ball', 'sludge-bomb', 'focus-blast', 'sleep-powder'], 'coba-berry', 'modest'],
    'tangrowth-2': ['tangrowth', ['giga-drain', 'leech-seed', 'toxic', 'double-team'], 'big-root', 'bold'],
    'togekiss-2': ['togekiss', ['air-slash', 'ominous-wind', 'silver-wind', 'ancient-power'], 'scope-lens', 'modest'],
    'togekiss-3': ['togekiss', ['air-slash', 'heat-wave', 'signal-beam', 'magical-leaf'], 'wise-glasses', 'modest'],
    'togekiss-4': ['togekiss', ['hyper-beam', 'air-slash', 'aura-sphere', 'psychic'], 'expert-belt', 'modest'],
    'torterra-2': ['torterra', ['giga-drain', 'leech-seed', 'synthesis', 'amnesia'], 'leftovers', 'sassy'],
    'tyranitar-1': ['tyranitar', ['rock-slide', 'payback', 'avalanche', 'curse'], 'focus-band', 'brave'],
    'tyranitar-2': ['tyranitar', ['fire-punch', 'thunder-punch', 'ice-punch', 'aerial-ace'], 'choice-scarf', 'jolly'],
    'tyranitar-3': ['tyranitar', ['superpower', 'dragon-claw', 'shadow-claw', 'aqua-tail'], 'white-herb', 'adamant'],
    'tyranitar-4': ['tyranitar', ['stone-edge', 'crunch', 'earthquake', 'dragon-dance'], 'chople-berry', 'adamant'],
    'umbreon-1': ['umbreon', ['payback', 'confuse-ray', 'curse', 'baton-pass'], 'leftovers', 'careful'],
    'umbreon-2': ['umbreon', ['toxic', 'mean-look', 'double-team', 'confuse-ray'], 'leftovers', 'impish'],
    'umbreon-4': ['umbreon', ['payback', 'trump-card', 'curse', 'moonlight'], 'bright-powder', 'impish'],
    'ursaring-1': ['ursaring', ['slash', 'payback', 'avalanche', 'counter'], 'focus-sash', 'brave'],
    'ursaring-2': ['ursaring', ['hammer-arm', 'fire-punch', 'thunder-punch', 'ice-punch'], 'life-orb', 'adamant'],
    'ursaring-3': ['ursaring', ['facade', 'superpower', 'crunch', 'protect'], 'toxic-orb', 'adamant'],
    'ursaring-4': ['ursaring', ['return', 'cross-chop', 'earthquake', 'aerial-ace'], 'quick-claw', 'adamant'],
    'venusaur-2': ['venusaur', ['giga-drain', 'ingrain', 'leech-seed', 'sleep-powder'], 'big-root', 'bold'],
    'vespiquen-2': ['vespiquen', ['x-scissor', 'toxic', 'heal-order', 'destiny-bond'], 'persim-berry', 'careful'],
    'vespiquen-4': ['vespiquen', ['attack-order', 'defend-order', 'heal-order', 'confuse-ray'], 'shell-bell', 'adamant'],
    'victreebel-2': ['victreebel', ['seed-bomb', 'spit-up', 'swallow', 'stockpile'], 'black-sludge', 'adamant'],
    'wailord-1': ['wailord', ['surf', 'ice-beam', 'attract', 'double-team'], 'sitrus-berry', 'modest'],
    'wailord-2': ['wailord', ['whirlpool', 'toxic', 'amnesia', 'rest'], 'chesto-berry', 'impish'],
    'wailord-3': ['wailord', ['waterfall', 'avalanche', 'earthquake', 'curse'], 'leftovers', 'adamant'],
    'wailord-4': ['wailord', ['hydro-pump', 'blizzard', 'hyper-beam', 'fissure'], 'quick-claw', 'modest'],
    'weavile-1': ['weavile', ['night-slash', 'ice-punch', 'screech', 'fake-out'], 'chople-berry', 'adamant'],
    'weavile-2': ['weavile', ['night-slash', 'attract', 'double-team', 'hail'], 'bright-powder', 'jolly'],
    'weavile-3': ['weavile', ['night-slash', 'x-scissor', 'metal-claw', 'counter'], 'focus-sash', 'adamant'],
    'weavile-4': ['weavile', ['night-slash', 'ice-punch', 'aerial-ace', 'brick-break'], 'razor-claw', 'jolly'],
    'yanmega-1': ['yanmega', ['signal-beam', 'air-cutter', 'detect', 'double-team'], 'coba-berry', 'timid'],
    'yanmega-3': ['yanmega', ['silver-wind', 'ancient-power', 'ominous-wind', 'giga-drain'], 'lum-berry', 'modest'],
    'yanmega-4': ['yanmega', ['bug-buzz', 'air-slash', 'psychic', 'shadow-ball'], 'wise-glasses', 'modest'],
    'zapdos-2': ['zapdos', ['thunderbolt', 'ancient-power', 'ominous-wind', 'light-screen'], 'focus-band', 'timid'],
    'zapdos-4': ['zapdos', ['thunderbolt', 'air-cutter', 'heat-wave', 'signal-beam'], 'bright-powder', 'modest']
  };
  const LISTS = {
    cheryl: [
      'gastrodon-1', 'miltank-1', 'wailord-1', 'hippowdon-1', 'snorlax-1', 'blissey-1', 'milotic-1', 'venusaur-2',
      'meganium-2', 'sceptile-2', 'torterra-2', 'medicham-2', 'breloom-2', 'vespiquen-2', 'gastrodon-2', 'victreebel-2',
      'ludicolo-2', 'shiftry-2', 'alakazam-2', 'abomasnow-2', 'cradily-2', 'wailord-2', 'roserade-2', 'porygon2-2',
      'exeggutor-2', 'starmie-2', 'dusknoir-2', 'tangrowth-2', 'porygon-z-2', 'snorlax-2', 'blissey-2', 'milotic-2',
      'cradily-3', 'wailord-3', 'snorlax-3', 'blissey-3', 'milotic-3', 'vespiquen-4', 'wailord-4', 'espeon-4',
      'umbreon-4', 'porygon-z-4', 'snorlax-4', 'blissey-4', 'milotic-4', 'cresselia-2', 'regirock-3', 'regice-3',
      'cresselia-3', 'cresselia-4'],
    mira: [
      'alakazam-1', 'gengar-1', 'roserade-1', 'yanmega-1', 'gardevoir-1', 'exeggutor-1', 'espeon-1', 'magnezone-1',
      'porygon-z-1', 'alakazam-2', 'gengar-2', 'roserade-2', 'gardevoir-2', 'exeggutor-2', 'espeon-2', 'glaceon-2',
      'porygon-z-2', 'togekiss-2', 'empoleon-3', 'alakazam-3', 'gengar-3', 'roserade-3', 'yanmega-3', 'gardevoir-3',
      'espeon-3', 'glaceon-3', 'magnezone-3', 'porygon-z-3', 'togekiss-3', 'empoleon-4', 'alakazam-4', 'gengar-4',
      'roserade-4', 'yanmega-4', 'gardevoir-4', 'exeggutor-4', 'espeon-4', 'glaceon-4', 'magnezone-4', 'porygon-z-4',
      'magmortar-4', 'togekiss-4', 'moltres-1', 'latias-1', 'latios-1', 'heatran-1', 'zapdos-2', 'latias-2',
      'latios-2', 'latias-3', 'latios-3', 'heatran-3', 'zapdos-4', 'moltres-4', 'latias-4', 'latios-4'],
    riley: [
      'breloom-1', 'absol-1', 'pinsir-1', 'heracross-1', 'ursaring-1', 'rampardos-1', 'machamp-1', 'gallade-1',
      'lucario-1', 'rhyperior-1', 'gyarados-1', 'dragonite-1', 'tyranitar-1', 'salamence-1', 'metagross-1', 'garchomp-1',
      'breloom-2', 'absol-2', 'pinsir-2', 'heracross-2', 'ursaring-2', 'rampardos-2', 'machamp-2', 'gallade-2',
      'lucario-2', 'rhyperior-2', 'gyarados-2', 'dragonite-2', 'tyranitar-2', 'salamence-2', 'garchomp-2', 'slaking-2',
      'breloom-3', 'absol-3', 'heracross-3', 'ursaring-3', 'rampardos-3', 'machamp-3', 'gallade-3', 'lucario-3',
      'gyarados-3', 'dragonite-3', 'tyranitar-3', 'salamence-3', 'metagross-3', 'garchomp-3', 'slaking-3', 'breloom-4',
      'absol-4', 'pinsir-4', 'heracross-4', 'ursaring-4', 'rampardos-4', 'machamp-4', 'gallade-4', 'lucario-4',
      'rhyperior-4', 'gyarados-4', 'dragonite-4', 'tyranitar-4', 'salamence-4', 'garchomp-4', 'slaking-4', 'entei-1',
      'entei-2', 'entei-3', 'entei-4'],
    marley: [
      'ninjask-1', 'swellow-2', 'ninjask-2', 'sceptile-1', 'dugtrio-1', 'electrode-1', 'ambipom-1', 'alakazam-1',
      'floatzel-1', 'pinsir-1', 'weavile-1', 'aerodactyl-1', 'starmie-1', 'jolteon-1', 'crobat-1', 'arcanine-1',
      'sceptile-2', 'electrode-2', 'ambipom-2', 'alakazam-2', 'floatzel-2', 'pinsir-2', 'weavile-2', 'aerodactyl-2',
      'starmie-2', 'jolteon-2', 'crobat-2', 'arcanine-2', 'sceptile-3', 'dugtrio-3', 'ambipom-3', 'alakazam-3',
      'weavile-3', 'aerodactyl-3', 'starmie-3', 'crobat-3', 'arcanine-3', 'sceptile-4', 'dugtrio-4', 'ambipom-4',
      'alakazam-4', 'floatzel-4', 'pinsir-4', 'weavile-4', 'aerodactyl-4', 'starmie-4', 'jolteon-4', 'crobat-4',
      'arcanine-4', 'raikou-1', 'raikou-2', 'raikou-3', 'raikou-4'],
    buck: [
      'cloyster-2', 'skarmory-1', 'bastiodon-1', 'claydol-1', 'bronzong-1', 'steelix-1', 'umbreon-1', 'leafeon-1',
      'hippowdon-1', 'probopass-1', 'dusknoir-1', 'tangrowth-1', 'metagross-1', 'skarmory-2', 'bastiodon-2', 'claydol-2',
      'bronzong-2', 'shuckle-2', 'steelix-2', 'umbreon-2', 'leafeon-2', 'hippowdon-2', 'probopass-2', 'dusknoir-2',
      'tangrowth-2', 'metagross-2', 'skarmory-3', 'bastiodon-3', 'claydol-3', 'bronzong-3', 'steelix-3', 'hippowdon-3',
      'dusknoir-3', 'metagross-3', 'skarmory-4', 'bastiodon-4', 'shuckle-4', 'umbreon-4', 'leafeon-4', 'hippowdon-4',
      'probopass-4', 'dusknoir-4', 'suicune-1', 'regirock-1', 'regice-1', 'registeel-1', 'articuno-2', 'suicune-2',
      'regirock-2', 'regice-2', 'registeel-2', 'articuno-3', 'suicune-3', 'regirock-3', 'regice-3', 'registeel-3',
      'articuno-4', 'suicune-4', 'regice-4', 'registeel-4']
  };
  const PARTNERS = ['cheryl', 'mira', 'riley', 'marley', 'buck'];
  // Who waits in the salon: the Trainers you have traveled with (the Battleground's flags, battleground.js).
  const MET = { cheryl: 'cheryl-with', mira: 'mira-done', riley: 'riley-done', marley: 'marley-done', buck: 'magma-stone-back' };
  const NAME = { cheryl: 'Cheryl', mira: 'Mira', riley: 'Riley', marley: 'Marley', buck: 'Buck' };
  const IV = [31, 31, 31, 31, 31, 31];
  const met = () => PARTNERS.filter(id => G.Field.flag(MET[id]));
  const nameOf = id => G.T(NAME[id], 'trainer-name');
  const seed = (run, k) => ((G.Field.save.player.id | 0) * 131 + run * 977 + k * 4099 + 95) >>> 0;

  /** A set as a trainer's team row: level 50, its moves, item and nature, IVs of 31. */
  function row(k) {
    const [sp, moves, item, nature] = SETS[k];
    return [sp, 50, moves.slice(), item, { nature, ivs: IV.slice() }];
  }

  /** The two Pokémon partner `id` brings to challenge `run` (Platinum's draw): from their list, two species, neither of yours
   *  (`mine`: the Pokémon you entered); no item twice nor one of yours, until fifty draws have failed on items. -> team rows */
  function partnerTeam(id, run, mine = []) {
    const rng = G.RNG(seed(run, PARTNERS.indexOf(id) + 1)), list = LISTS[id], picks = [];
    const sp = k => G.Maps.species(SETS[k][0]);
    let fails = 0;
    for (let guard = 0; picks.length < 2 && guard < 2000; guard++) {
      const k = rng.pick(list), item = SETS[k][2];
      if (picks.some(p => sp(p) === sp(k)) || mine.some(m => m.sp === sp(k))) continue;
      if (fails < 50 && item && (picks.some(p => SETS[p][2] === item) || mine.some(m => m.item === item))) { fails++; continue; }
      picks.push(k);
    }
    return picks.map(row);
  }

  /** The two Trainers of battle No. n: the Tower's roll with other seeds (their classes, names and lines), sharing one team
   *  of four of the round (no species or item twice), two each; their Pokémon alternate as rules.tag wants them. */
  function foesFor(n, run) {
    const H = G.SinnohTowerHall, lines = { before: H.BEFORE(), defeat: H.DEFEAT() };
    const a = G.TowerHall.trainerFor(n, 'single', run, Object.assign({ salt: 9500 }, lines));
    let b = null;
    for (let s = 9600; !b || (b.cls === a.cls && b.name === a.name); s += 100) b = G.TowerHall.trainerFor(n, 'single', run, Object.assign({ salt: s }, lines));
    const t = G.Tower.team(G.RNG(seed(run, 7 + n * 13)), Math.floor((n - 1) / 7), 4);
    a.team = [t[0], t[1]];
    b.team = [t[2], t[3]];
    return Object.assign({}, a, { double: true, team: [t[0], t[2], t[1], t[3]], partner: { cls: b.cls, name: b.name, who: b.who }, a, b });
  }

  // ---------------- what the partners say (my own words) ----------------
  const GREET = {
    cheryl: () => T('Oh, it is you! I would love to battle beside you again. My Pokémon are ready.'),
    mira: () => T('Mira remembers you! Mira and her Pokémon want to battle with you!'),
    riley: () => T('Your aura feels as steady as ever. I would be glad to fight at your side.'),
    marley: () => T('...You came. If it is you, I do not mind teaming up.'),
    buck: () => T('Hey, it is you! A tag team? Count me in, this is going to be a blast!')
  };
  const WON = {
    cheryl: () => T('Seven wins in a row! Battling beside you makes my Pokémon so happy.'),
    mira: () => T('We won! Mira had so much fun!'),
    riley: () => T('A fine set of battles. Your Pokémon and mine fought as one.'),
    marley: () => T('...We were good together. Let us do it again.'),
    buck: () => T('Ha ha! Did you see that? We were unstoppable!')
  };

  // ---------------- the Battle Salon and the multi battle room ----------------
  G.Maps.def(Object.assign({
    id: 'sinnoh-tower-salon', loc: 'fight-area', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWeWWWWWW', 'p+++++++++++p', '+++++++++++++', '+++++++++++++', 't+++++++++++t', '+++++++++++++', '+++++++++++++', '++++++X++++++'],
    // Leaving asks first: the challenge is called off (the exit mat's script). The door on to the multi battle room opens
    // only with a partner (the partner's script takes you both through it).
    warps: [{ x: 6, y: 8, to: 'sinnoh-tower-lobby', spot: 'multi', if: 'scripted', locked: 'smulti.leave' },
            { x: 6, y: 1, to: 'sinnoh-tower-multi', spot: 'player', if: 'scripted', locked: 'smulti.door' }],
    signs: { '6,1': { script: 'smulti.door' } },
    spots: { player: [6, 7, 'up'] },
    npcs: [
      { id: 'cheryl', who: 'cheryl', x: 2, y: 3, dir: 'down', if: MET.cheryl, script: 'smulti.cheryl' },
      { id: 'mira', who: 'mira', x: 4, y: 3, dir: 'down', if: MET.mira, script: 'smulti.mira' },
      { id: 'riley', who: 'riley', x: 6, y: 3, dir: 'down', if: MET.riley, script: 'smulti.riley' },
      { id: 'marley', who: 'marley', x: 8, y: 3, dir: 'down', if: MET.marley, script: 'smulti.marley' },
      { id: 'buck', who: 'buck', x: 10, y: 3, dir: 'down', if: MET.buck, script: 'smulti.buck' },
      { id: 'attendant', who: 'clerk', x: 8, y: 7, dir: 'left', script: 'smulti.leave' }
    ]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'sinnoh-tower-multi', loc: 'fight-area', tileset: 'indoor', palette: 'center', music: 'center', battleBg: 'indoor',
    rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', '+++++++++++', '+++++++++++', '+++++++++++', '+++++++++++', '+++++++++++', '+++++X+++++'],
    warps: [{ x: 5, y: 7, to: 'sinnoh-tower-lobby', spot: 'multi' }],
    spots: { player: [4, 5, 'up'] },
    npcs: [
      { id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' },
      { id: 'foe2', who: 'lass', x: 6, y: 3, dir: 'down', if: 'scripted' },
      { id: 'ally', who: 'cheryl', x: 6, y: 5, dir: 'up', if: 'scripted' }
    ]
  }, SINNOH));

  // ---------------- the counter ----------------
  /** The Pokémon entered for the challenge waiting in the salon (their uids in a var), or null. */
  function entrants() {
    const uids = String(G.Field.getVar('stower-multi-team') || '').split(',').filter(Boolean);
    const party = G.Field.party(), team = uids.map(u => party.find(m => m.uid === u));
    return uids.length === 2 && team.every(Boolean) ? team : null;
  }

  async function counter(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('Welcome to the Battle Tower! This counter is for multi battles.'));
    if (!F.flag('stower-multi-rules')) {
      F.setFlag('stower-multi-rules');
      await h.say(T('In a multi battle, you and a partner each enter two Pokémon and battle two Trainers at once. Win seven in a row to finish a set and earn Battle Points.'));
      await h.say(T('Your two must be different species holding different items. Your partner waits in the Battle Salon and brings two of their own.'));
      await h.say(T('Here, Pokémon above level 50 battle at level 50, and items from the Bag cannot be used. Win or lose, your Pokémon will be just as they were.'));
    }
    if (!met().length) {
      await h.say(T('Partners are Trainers you have traveled with on your journey. No one is waiting in the Battle Salon for you yet.'));
      return;
    }
    await h.say(T('Wins in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak(MODE, HALL), best: Tw.best(MODE, HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const team = await G.TowerHall.pickEntrants(h, 2, Tw.SINNOH_BANNED);
    if (!team) return;
    const run = (+F.getVar('stower-multi-runs') || 0) + 1;
    F.setVar('stower-multi-runs', run);
    F.setVar('stower-multi-team', team.map(m => m.uid).join(','));
    await h.say(T('Thank you. Please choose your partner in the Battle Salon.'));
    await G.Script.exec([['warp', 'sinnoh-tower-salon', 'player']], h);
  }

  /** The salon's attendant and its exit: the challenge is called off, back to the lobby. */
  async function leave(h) {
    const F = G.Field;
    if (entrants()) {
      await h.say(T('Talk to the Trainer you would like to battle beside.'));
      if (await h.choice(T('Would you like to call off your challenge?'), {}) !== 0) return;
      F.setVar('stower-multi-team', '');
      await h.say(T('Your challenge has been called off.'));
    }
    await G.Script.exec([['warp', 'sinnoh-tower-lobby', 'multi']], h);
  }

  // ---------------- a partner, and the challenge ----------------
  async function partner(h, id) {
    const F = G.Field, who = { name: nameOf(id) }, team = entrants();
    if (!team) { await h.say(T('Register at the multi battle counter first, and then we can team up.'), who); return; }
    const run = +F.getVar('stower-multi-runs') || 1, rows = partnerTeam(id, run, team);
    const [one, two] = rows.map(r => ({ mon: G.Names.mon(G.Maps.species(r[0])), move: G.Names.move(r[2][0]) }));
    await h.say(GREET[id](), who);
    await h.say(fmt('I will bring {one}, who knows {m1}, and {two}, who knows {m2}.', { one: one.mon, m1: one.move, two: two.mon, m2: two.move }), who);
    if (await h.choice(fmt('Team up with {name}?', { name: nameOf(id) }), {}) !== 0) return;
    await h.say(T('Let us do our best together!'), who);
    await challenge(h, id, team, rows, run);
  }

  async function challenge(h, id, team, rows, run) {
    const F = G.Field, Tw = G.Tower, R = G.Ribbons, who = { name: nameOf(id) };
    const actor = k => G.World && G.World.actor && G.World.actor(k);
    await G.Script.exec([['warp', 'sinnoh-tower-multi', 'player']], h);
    if (actor('ally')) actor('ally').who = id;
    h.show('ally');
    let set = false;
    for (;;) {
      const no = Tw.streak(MODE, HALL) + 1, d = foesFor(no, run);
      if (actor('foe')) actor('foe').who = d.a.who;
      if (actor('foe2')) actor('foe2').who = d.b.who;
      h.show('foe');
      h.show('foe2');
      await h.say(T('Battle No. {n}! Here come your opponents.'), { vars: { n: no } });
      await h.say(d.a.before, G.TowerHall.speaker(d.a));
      await h.say(d.b.before, G.TowerHall.speaker(d.b));
      const out = await h.battle(d, { canLose: true, record: false, party: team.map(m => Tw.copy(m)), partner: { name: nameOf(id), team: rows },
                                       rules: { noExp: true, noBag: true, shift: false, tag: true } });
      if (out === 'lose') {
        h.hide('foe');
        h.hide('foe2');
        Tw.setStreak(MODE, 0, HALL);
        await h.say(T('Your streak is over. Wins in a row: {n}. Please try again!'), { vars: { n: no - 1 } });
        break;
      }
      await h.say(d.a.defeat, G.TowerHall.speaker(d.a));
      await h.say(d.b.defeat, G.TowerHall.speaker(d.b));
      h.hide('foe');
      h.hide('foe2');
      Tw.setStreak(MODE, no, HALL);
      // The 50th multi battle in a row: the Multi Ability Ribbon for the two (Platinum gives it at 50).
      if (no === 50 && R && team.map(m => R.give(m, 'multi-ability')).some(Boolean)) {
        await h.say(fmt('Fifty multi battles in a row! Your Pokémon received the {ribbon}!', { ribbon: R.name('multi-ability') }));
      }
      if (no % 7 === 0) {
        const bp = Tw.bpFor(no / 7);
        Tw.addBp(bp);
        await h.say(T('Congratulations! You won seven battles in a row!'));
        await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
        await h.say(WON[id](), who);
        set = true;
        break;
      }
      const go = await h.choice(T('Battle No. {n} is next. Will you keep going?'), { options: [T('Keep going'), T('Retire')], vars: { n: no + 1 } });
      if (go !== 0) {
        Tw.setStreak(MODE, 0, HALL);
        await h.say(T('You retired. Wins in a row: {n}.'), { vars: { n: no } });
        break;
      }
    }
    if (!set) await h.say(T('That was a good try. Let us team up again some time.'), who);
    h.hide('ally');
    F.setVar('stower-multi-team', '');
    await G.Script.exec([['warp', 'sinnoh-tower-lobby', 'multi']], h);
    if (set) await h.say(T('Your streak goes on: next time, you will start from battle No. {n}.'), { vars: { n: Tw.streak(MODE, HALL) + 1 } });
    // The end of the ninety-fifth chapter (credits-ui.js), once the ninety-fourth is done.
    if (set && F.flag('chapter-94-done') && !F.flag('chapter-95-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(95); else F.setFlag('chapter-95-done');
    }
  }

  G.Script.def({
    'stower.multi': [['js', counter]],
    'smulti.leave': [['js', leave]],
    'smulti.door': [['say', 'The door to the multi battle room. Talk to the Trainer you would like to battle beside first.']],
    'smulti.cheryl': [['js', h => partner(h, 'cheryl')]],
    'smulti.mira': [['js', h => partner(h, 'mira')]],
    'smulti.riley': [['js', h => partner(h, 'riley')]],
    'smulti.marley': [['js', h => partner(h, 'marley')]],
    'smulti.buck': [['js', h => partner(h, 'buck')]]
  });
  G.SinnohMulti = { SETS, LISTS, PARTNERS, MET, NAME, HALL, MODE, met, partnerTeam, foesFor, entrants };
})();
