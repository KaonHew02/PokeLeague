/* ============ pyramid.js — the Battle Pyramid ============
 * Chapter 83, Hoenn after the League: the last building on the Battle Tower's island (js/content/hoenn/tower.js), a
 * pyramid (the stamp `Z`). The player enters three of their own Pokémon (G.TowerHall.pickEntrants) and climbs seven
 * floors of dark mazes. While a challenge is on, the save's party is three copies (level 50 at most, holding nothing:
 * the originals keep their items) and its Bag is the Battle Bag (var `pyramid-bag`: a Hyper Potion and an Ether to begin
 * with, then whatever was found, kept from one challenge to the next, ten kinds at most); the real party and Bag wait
 * aside (swapIn / swapOut). So the party screen, the Bag and the items used in battle are the challenge's own; besides
 * those items, only a rest on each landing heals (rest: PP back, and the fainted up with half their HP). The floor maps
 * forbid saving (`noSave`), give no Exp. Points (`noExp`) and send a lost
 * battle to `pyramid.lost` (`onLose`) instead of a black-out (js/world/field.js).
 * Each floor (floorPlan) is a 34 x 34 cave, dark, of 4 x 4 sections of 8 x 8 drawn from SECTIONS (every section open in
 * the middle of each side, so the floor is all one piece): the start and the ladder up in two different sections, four
 * Trainers of one Pokémon each (the Battle Tower's, by round, at TRAINER_LEVEL), three items from the round's list, and wild Pokémon of
 * the challenge's theme (THEMES: Emerald's twenty, in turn, with their moves: chapter 109; a fortune-teller in the lobby tells the next one). Every battle won lights a tile more around the
 * player (G.World.brighten, back to dark on the next floor); a beaten Trainer tells how many Trainers and items are
 * left. The ladder leads to a landing: on up, or retire. Seven floors make a round: Battle Points (G.Tower.bpFor),
 * shared with the Tower's Exchange Service Corner, and the streak (rounds in a row, G.Tower.streak('single', 'pyramid')).
 * All three down ends the challenge. Brandon, the Pyramid King, waits at the top of the 3rd round (the Silver Brave
 * Symbol) and the 10th (the Gold) with his teams from Emerald, a little below level 50, and restores your team first.
 * The first round climbed once chapter 82 is done ends the chapter: `ending(83)`.
 * Chapter 109: Emerald's twenty themes with their moves and abilities (THEMES; field.js drawWild), even IVs from round 21; a
 * fortune-teller in the lobby (pyramid.fortune, Emerald's hint giver: GetBattlePyramidHint) tells the coming round's theme;
 * the first round climbed once chapter 108 is done ends the chapter: `ending(109)`.
 * Normal difficulty (after chapter 83): Emerald's Pyramid, with Trainers at 50 and no rest, let the typical team climb
 * round 1 two times in five and round 2 never; hence TRAINER_LEVEL, the rest and Brandon's levels.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const HALL = 'pyramid', FLOOR = 'battle-pyramid-floor', FLOORS = 7;
  const SALT = 239017;                         // the Pyramid's seeds differ from the other halls'
  const TRAINER_LEVEL = 47;                    // the Trainers' one Pokémon (the Tower's are 50): normal difficulty

  // ---------------- The lobby, the landing between floors, the top ----------------
  G.Maps.def(Object.assign({
    id: 'battle-pyramid-lobby', loc: 'battle-pyramid', tileset: 'indoor', palette: 'gym', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++++=======++++',
      '+++++++++++++++',
      '+++++++++++++++',
      't+++++++++++++t',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'pyramid-door' },
            { x: 13, y: 1, to: 'battle-pyramid-landing', spot: 'up', if: 'scripted', locked: 'pyramid.door' }],
    spots: { door: [7, 8, 'up'], single: [7, 4, 'up'] },
    signs: { '13,1': { script: 'pyramid.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'pyramid.single' },
      { id: 'guide', who: 'ranger', x: 2, y: 6, dir: 'right', script: 'pyramid.guide' },
      { id: 'fortune', who: 'granny', x: 12, y: 6, dir: 'left', script: 'pyramid.fortune' }                // chapter 109
    ]
  }, HOENN));

  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', noSave: true, noExp: true, onLose: 'pyramid.lost' };
  G.Maps.def(Object.assign({
    id: 'battle-pyramid-landing', loc: 'battle-pyramid',
    rows: [
      '#######',
      '#:%:%:#',
      '#:::::#',
      '#:::::#',
      '#######'
    ],
    // The ladders up, to the next floor and to the top: the landing's script takes the player up (`enter`), never a step.
    warps: [{ x: 2, y: 1, to: FLOOR, spot: 'start', if: 'scripted', locked: 'pyramid.ladder' },
            { x: 4, y: 1, to: 'battle-pyramid-top', spot: 'player', if: 'scripted', locked: 'pyramid.ladder' }],
    spots: { up: [3, 2, 'up'] },
    enter: 'pyramid.landing'
  }, CAVE, HOENN));

  G.Maps.def(Object.assign({
    id: 'battle-pyramid-top', loc: 'battle-pyramid',
    rows: [
      '#########',
      '#:::::::#',
      '#:::::::#',
      '#:::::::#',
      '#:::::::#',
      '#########'
    ],
    spots: { player: [4, 4, 'up'] },
    npcs: [{ id: 'king', who: 'brandon', x: 4, y: 2, dir: 'down', if: 'scripted' }]
  }, CAVE, HOENN));

  // ---------------- The mazes ----------------
  // Sections of 8 x 8: '#' rock, ':' sand; t a Trainer's place, i an item's, c the start or the ladder. Each is open in the
  // middle of each side (rows or columns 3 and 4), and all its sand is one piece.
  const SECTIONS = [
    ['###::###', '##:::i##', '#t:::::#', ':::::c::', '::::::::', '#::::::#', '##i::::#', '###::###'],
    ['###::###', '#::::::#', '#:#::#:#', ':::ic:::', '::::::::', '#:#::#:#', '#t::::i#', '###::###'],
    ['###::###', '###:::##', '#t::#:##', '::::#:::', ':::#::::', '##:#::i#', '##:::c##', '###::###'],
    ['###::###', '#::::::#', '#:####:#', '::#ci#::', '::#::#::', '#:##:#:#', '#t:::::#', '###::###'],
    ['###::###', '#i:::###', '#:##:::#', '::#::#::', '::#c:#::', '#:::##:#', '###::t:#', '###::###'],
    ['###::###', '#::::::#', '#:t:::i#', '::::c:::', '::::::::', '#::::::#', '#::::::#', '###::###']
  ];
  const SIZE = 34;                             // 4 x 4 sections and a wall all round

  // The wild Pokémon of a challenge, by theme: Emerald's twenty (src/data/battle_frontier/battle_pyramid_level_50_wild_mons.h,
  // chapter 109; the first three since chapter 83): [species, level value (-5 to +5), moves, ability slot when set], the first two
  // most often. Round 21 on (twenty rounds in a row) starts again with even IVs of 15 to 31 (GenerateBattlePyramidWildMon).
  const THEMES = [
    // 1: paralysis
    [['plusle', 35, ['thunder-wave', 'spark', 'encore']],
     ['minun', 35, ['thunder-wave', 'thunderbolt', 'quick-attack']],
     ['pikachu', 37, ['thunder-wave', 'thunderbolt', 'slam']],
     ['electabuzz', 37, ['thunder-punch', 'swift', 'screech']],
     ['vileplume', 39, ['stun-spore', 'giga-drain', 'protect']],
     ['manectric', 39, ['thunder-wave', 'thunder', 'quick-attack']],
     ['breloom', 40, ['stun-spore', 'focus-punch', 'giga-drain', 'mach-punch']],
     ['jolteon', 40, ['thunder-wave', 'thunder', 'pin-missile', 'quick-attack']]],
    // 2: poison
    [['gulpin', 36, ['toxic', 'sludge', 'protect']],
     ['roselia', 36, ['toxic', 'giga-drain', 'magical-leaf', 'petal-dance']],
     ['butterfree', 38, ['poison-powder', 'gust', 'psybeam']],
     ['seviper', 38, ['poison-fang', 'swagger', 'crunch', 'poison-tail']],
     ['skarmory', 40, ['toxic', 'fly', 'steel-wing']],
     ['ludicolo', 40, ['toxic', 'protect', 'dive', 'rain-dance'], 1],
     ['crobat', 41, ['toxic', 'confuse-ray', 'mean-look', 'bite']],
     ['gengar', 41, ['toxic', 'shadow-punch', 'night-shade']]],
    // 3: burn
    [['growlithe', 37, ['flame-wheel', 'take-down']],
     ['vulpix', 37, ['will-o-wisp', 'flamethrower']],
     ['magcargo', 39, ['flamethrower', 'rock-slide', 'protect'], 1],
     ['ninetales', 39, ['will-o-wisp', 'quick-attack', 'flamethrower']],
     ['medicham', 41, ['fire-punch', 'high-jump-kick']],
     ['weezing', 41, ['will-o-wisp', 'flamethrower', 'protect']],
     ['dusclops', 42, ['will-o-wisp', 'confuse-ray', 'mean-look', 'shadow-punch']],
     ['houndoom', 42, ['flamethrower', 'bite', 'solar-beam', 'overheat']]],
    // 4: PP drained (Spite, Grudge)
    [['dunsparce', 42, ['spite', 'toxic', 'protect']],
     ['banette', 41, ['grudge', 'will-o-wisp', 'night-shade']],
     ['misdreavus', 42, ['grudge', 'spite', 'shadow-ball']],
     ['ninetales', 42, ['grudge', 'will-o-wisp', 'overheat']],
     ['absol', 44, ['bite', 'aerial-ace', 'shadow-ball', 'protect']],
     ['dusclops', 44, ['will-o-wisp', 'protect', 'toxic', 'shadow-ball']],
     ['shedinja', 45, ['grudge', 'toxic', 'spite']],
     ['gengar', 45, ['grudge', 'spite', 'night-shade']]],
    // 5: Levitate
    [['haunter', 41, ['night-shade', 'thunderbolt', 'sludge-bomb']],
     ['chimecho', 41, ['double-edge', 'toxic', 'psychic', 'protect']],
     ['solrock', 42, ['earthquake', 'rock-slide', 'fire-blast', 'toxic']],
     ['misdreavus', 42, ['psychic', 'spite', 'shadow-ball', 'pain-split']],
     ['claydol', 44, ['earthquake', 'ancient-power', 'self-destruct', 'psychic']],
     ['weezing', 44, ['sludge-bomb', 'self-destruct', 'protect']],
     ['flygon', 45, ['earthquake', 'crunch', 'dragon-claw', 'dragon-breath']],
     ['gengar', 45, ['thunderbolt', 'psychic', 'giga-drain', 'night-shade']]],
    // 6: abilities that trap (Arena Trap, Shadow Tag)
    [['diglett', 41, ['rock-slide', 'slash', 'dig']],
     ['trapinch', 41, ['rock-slide', 'earthquake', 'giga-drain']],
     ['wynaut', 42, ['destiny-bond', 'splash', 'counter', 'mirror-coat'], 0],
     ['diglett', 42, ['earthquake', 'rock-slide', 'magnitude', 'toxic']],
     ['trapinch', 44, ['rock-slide', 'earthquake', 'giga-drain', 'protect']],
     ['wynaut', 44, ['counter', 'mirror-coat', 'destiny-bond'], 0],
     ['wobbuffet', 45, ['counter', 'mirror-coat', 'destiny-bond'], 0],
     ['dugtrio', 45, ['rock-slide', 'sludge-bomb', 'earthquake', 'protect'], 1]],
    // 7: ice
    [['glalie', 41, ['ice-beam', 'crunch', 'protect']],
     ['sneasel', 41, ['ice-beam', 'crush-claw', 'spite']],
     ['dewgong', 42, ['blizzard', 'double-edge', 'surf']],
     ['piloswine', 42, ['ice-beam', 'earthquake', 'toxic']],
     ['jynx', 44, ['blizzard', 'lovely-kiss', 'psychic']],
     ['cloyster', 44, ['ice-beam', 'surf', 'protect']],
     ['walrein', 45, ['blizzard', 'body-slam', 'surf']],
     ['lapras', 45, ['sing', 'body-slam', 'ice-beam', 'psychic']]],
    // 8: Self-Destruct and Explosion
    [['weezing', 41, ['self-destruct', 'sludge-bomb', 'fire-blast']],
     ['electrode', 41, ['self-destruct', 'thunderbolt', 'rollout']],
     ['gengar', 42, ['destiny-bond', 'lick', 'shadow-ball']],
     ['golem', 42, ['self-destruct', 'protect', 'earthquake']],
     ['pineco', 44, ['explosion', 'double-edge', 'giga-drain']],
     ['solrock', 44, ['explosion', 'fire-spin', 'psywave']],
     ['forretress', 45, ['explosion', 'toxic', 'rock-slide']],
     ['shiftry', 45, ['explosion', 'giga-drain', 'solar-beam', 'protect']]],
    // 9: Psychic
    [['wobbuffet', 41, ['counter', 'mirror-coat', 'safeguard', 'destiny-bond']],
     ['metang', 41, ['earthquake', 'toxic', 'sludge-bomb', 'psychic']],
     ['exeggutor', 42, ['egg-bomb', 'psychic', 'hypnosis']],
     ['slowking', 42, ['shadow-ball', 'surf', 'ice-beam', 'flamethrower']],
     ['xatu', 44, ['confuse-ray', 'shadow-ball', 'psychic', 'steel-wing']],
     ['alakazam', 44, ['psychic', 'fire-punch', 'ice-punch', 'toxic']],
     ['starmie', 45, ['psychic', 'thunderbolt', 'surf', 'ice-beam']],
     ['espeon', 45, ['psychic', 'dig', 'shadow-ball']]],
    // 10: Rock
    [['golem', 41, ['self-destruct', 'earthquake', 'protect']],
     ['steelix', 41, ['iron-tail', 'crunch', 'earthquake']],
     ['omastar', 42, ['surf', 'mud-shot', 'ancient-power']],
     ['lunatone', 42, ['hypnosis', 'psywave', 'explosion']],
     ['shuckle', 44, ['toxic', 'protect', 'wrap']],
     ['armaldo', 44, ['ancient-power', 'protect', 'aerial-ace']],
     ['cradily', 45, ['sludge-bomb', 'giga-drain', 'confuse-ray']],
     ['aerodactyl', 45, ['hyper-beam', 'rock-slide', 'bite']]],
    // 11: Fighting
    [['poliwrath', 41, ['submission', 'focus-punch', 'surf']],
     ['hariyama', 41, ['fake-out', 'surf', 'focus-punch']],
     ['breloom', 42, ['spore', 'focus-punch', 'protect']],
     ['medicham', 42, ['thunder-punch', 'fire-punch', 'ice-punch', 'focus-punch']],
     ['hitmonchan', 44, ['thunder-punch', 'fire-punch', 'ice-punch', 'focus-punch']],
     ['hitmonlee', 44, ['mega-kick', 'focus-punch']],
     ['heracross', 45, ['megahorn', 'earthquake', 'focus-punch', 'rock-slide']],
     ['machamp', 50, ['rock-slide', 'earthquake', 'focus-punch', 'seismic-toss']]],
    // 12: weather
    [['quagsire', 41, ['rain-dance', 'surf', 'protect']],
     ['tropius', 41, ['sunny-day', 'solar-beam']],
     ['pupitar', 42, ['sandstorm', 'earthquake', 'rock-slide']],
     ['lapras', 42, ['hail', 'ice-beam']],
     ['cacturne', 44, ['sandstorm', 'giga-drain', 'solar-beam']],
     ['flareon', 44, ['sunny-day', 'flamethrower', 'protect']],
     ['walrein', 45, ['hail', 'ice-beam']],
     ['gyarados', 50, ['rain-dance', 'thunder', 'hydro-pump']]],
    // 13: Bug
    [['pineco', 42, ['explosion', 'take-down']],
     ['shuckle', 42, ['toxic', 'earthquake', 'protect']],
     ['venomoth', 46, ['silver-wind', 'poison-powder', 'sleep-powder', 'psychic']],
     ['scizor', 46, ['quick-attack', 'metal-claw', 'fury-cutter', 'pursuit']],
     ['heracross', 48, ['megahorn', 'brick-break', 'earthquake', 'rock-slide']],
     ['forretress', 48, ['explosion', 'earthquake', 'protect']],
     ['armaldo', 50, ['water-pulse', 'protect', 'rock-slide']],
     ['shedinja', 50, ['shadow-ball', 'toxic', 'spite', 'grudge']]],
    // 14: Dark
    [['sableye', 42, ['night-shade', 'psychic', 'aerial-ace']],
     ['sneasel', 42, ['ice-beam', 'taunt', 'feint-attack', 'quick-attack']],
     ['crawdaunt', 46, ['crabhammer', 'ice-beam', 'surf']],
     ['shiftry', 46, ['explosion', 'shadow-ball', 'aerial-ace', 'giga-drain']],
     ['cacturne', 48, ['toxic', 'giga-drain', 'needle-arm']],
     ['absol', 48, ['bite', 'protect', 'slash']],
     ['houndoom', 50, ['overheat', 'crunch', 'shadow-ball', 'protect']],
     ['umbreon', 50, ['psychic', 'shadow-ball', 'iron-tail', 'quick-attack']]],
    // 15: Water
    [['octillery', 42, ['octazooka', 'ice-beam', 'fire-blast']],
     ['dewgong', 42, ['water-pulse', 'ice-beam', 'headbutt']],
     ['pelipper', 46, ['protect', 'supersonic', 'surf']],
     ['quagsire', 46, ['earthquake', 'rock-tomb', 'surf']],
     ['ludicolo', 48, ['protect', 'solar-beam', 'toxic', 'ice-beam']],
     ['slowking', 48, ['psychic', 'headbutt', 'swagger']],
     ['starmie', 50, ['water-pulse', 'thunderbolt', 'confuse-ray', 'blizzard']],
     ['blastoise', 50, ['hydro-pump', 'bite', 'ice-beam']]],
    // 16: Ghost
    [['duskull', 42, ['night-shade', 'will-o-wisp', 'shadow-ball', 'protect']],
     ['haunter', 42, ['toxic', 'spite', 'hypnosis', 'shadow-ball']],
     ['banette', 46, ['shadow-ball', 'spite', 'will-o-wisp']],
     ['misdreavus', 46, ['perish-song', 'spite', 'mean-look']],
     ['sableye', 48, ['shadow-ball', 'mean-look', 'dig', 'night-shade']],
     ['dusclops', 48, ['will-o-wisp', 'toxic', 'shadow-ball']],
     ['shedinja', 50, ['shadow-ball', 'spite', 'grudge', 'protect']],
     ['gengar', 50, ['psychic', 'destiny-bond', 'spite', 'night-shade']]],
    // 17: Steel
    [['mawile', 42, ['crunch', 'toxic', 'ice-beam']],
     ['magneton', 42, ['thunderbolt', 'thunder-wave']],
     ['steelix', 46, ['rock-throw', 'double-edge', 'earthquake']],
     ['scizor', 46, ['metal-claw', 'slash']],
     ['forretress', 48, ['explosion', 'toxic']],
     ['skarmory', 48, ['steel-wing', 'toxic', 'fly', 'protect']],
     ['aggron', 50, ['earthquake', 'take-down', 'surf', 'ice-beam']],
     ['metagross', 50, ['earthquake', 'psychic', 'shadow-ball', 'brick-break']]],
    // 18: Flying and Dragon
    [['dragonair', 42, ['thunder-wave', 'toxic', 'ice-beam']],
     ['vibrava', 42, ['earthquake', 'dragon-breath', 'crunch', 'steel-wing']],
     ['altaria', 46, ['earthquake', 'dragon-claw', 'sing', 'protect']],
     ['flygon', 46, ['earthquake', 'dragon-claw', 'fire-blast']],
     ['aerodactyl', 48, ['earthquake', 'rock-slide', 'dragon-claw']],
     ['gyarados', 48, ['earthquake', 'surf', 'thrash', 'bite']],
     ['kingdra', 50, ['hydro-pump', 'ice-beam', 'protect']],
     ['charizard', 50, ['flamethrower', 'focus-punch', 'fire-blast', 'iron-tail']]],
    // 19: evolved by a stone
    [['arcanine', 42, ['fire-blast', 'take-down']],
     ['poliwrath', 42, ['hydro-pump', 'ice-beam']],
     ['raichu', 46, ['thunder', 'thunder-wave', 'slam']],
     ['vaporeon', 46, ['surf', 'ice-beam']],
     ['jolteon', 48, ['thunderbolt', 'pin-missile']],
     ['flareon', 48, ['flamethrower', 'bite']],
     ['ninetales', 50, ['flamethrower', 'will-o-wisp', 'protect']],
     ['starmie', 50, ['ice-beam', 'surf', 'thunderbolt', 'psychic']]],
    // 20: Normal
    [['kangaskhan', 42, ['hyper-beam', 'flamethrower', 'surf', 'dizzy-punch']],
     ['swellow', 42, ['aerial-ace', 'hyper-beam', 'toxic']],
     ['ursaring', 46, ['hyper-beam', 'earthquake', 'focus-punch', 'protect']],
     ['porygon2', 46, ['psybeam', 'hyper-beam', 'shadow-ball', 'ice-beam']],
     ['tauros', 48, ['earthquake', 'hyper-beam', 'surf', 'thunderbolt']],
     ['fearow', 48, ['hyper-beam', 'fly', 'mirror-move', 'protect']],
     ['snorlax', 50, ['hyper-beam', 'body-slam', 'shadow-ball', 'earthquake']],
     ['slaking', 50, ['hyper-beam', 'earthquake', 'shadow-ball', 'ice-beam']]]
  ];
  const CHANCE = [20, 20, 15, 15, 10, 10, 5, 5];
  const themeOf = round => THEMES[(round - 1) % THEMES.length];
  /** The encounter table of a round's floors: [sp, min, max, chance %, moves, ability slot] (field.js drawWild gives the wild
   *  Pokémon those moves and that ability); round 21 on, `evenIvs` (all six IVs one value of 15 to 31). */
  const wildTable = round => Object.assign({ rate: 7, mons: themeOf(round).map(([sp, v, moves, slot], i) => [sp, v - 5, v + 5, CHANCE[i], moves, slot == null ? null : slot]) },
    round > THEMES.length ? { evenIvs: [15, 31] } : {});

  // What lies on the floors (Emerald's kinds, only those the game has), by weight.
  const FINDS = [['hyper-potion', 24], ['x-attack', 4], ['x-defense', 4], ['x-speed', 4], ['x-sp-atk', 4], ['x-accuracy', 3], ['dire-hit', 3],
    ['guard-spec', 3], ['cheri-berry', 3], ['pecha-berry', 3], ['rawst-berry', 3], ['chesto-berry', 3], ['ether', 9], ['lum-berry', 6],
    ['revive', 8], ['bright-powder', 2], ['leftovers', 2], ['scope-lens', 2], ['quick-claw', 2], ['shell-bell', 1], ['focus-band', 1],
    ['kings-rock', 1], ['max-revive', 2], ['full-restore', 2], ['max-elixir', 1]];
  const weighted = (rng, list) => { let r = rng.int(1, list.reduce((a, [, w]) => a + w, 0)); for (const [k, w] of list) if ((r -= w) <= 0) return k; return list[0][0]; };

  const seed = (run, round, floor, n = 0) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + round * 7919 + floor * 104729 + n * 15485863 + SALT) >>> 0));
  const BEFORE = () => [T('It is dark in here, but I saw you coming!'), T('You will not reach the top past me!'),
    T('One Pokémon is all I need for you.'), T('Lost in the dark? Then let us battle!')];
  const DEFEAT = () => [T('Beaten in the dark...'), T('Go on, the top is still far.'), T('Your Pokémon see better than mine in here.')];

  /** Floor `floor` (1-7) of a round: { rows, start: [x, y], exit: [x, y], trainers, items, encounters }; the same for the same run. */
  function floorPlan(round, floor, run) {
    const rng = seed(run, round, floor);
    const rows = Array.from({ length: SIZE }, () => Array(SIZE).fill('#'));
    const marks = [];                          // per section: { t: [x, y], i: [...], c: [x, y] }
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      const tpl = rng.pick(SECTIONS), m = { i: [] };
      tpl.forEach((line, y) => [...line].forEach((ch, x) => {
        const X = 1 + sx * 8 + x, Y = 1 + sy * 8 + y;
        rows[Y][X] = ch === '#' ? '#' : ':';
        if (ch === 't') m.t = [X, Y];
        else if (ch === 'i') m.i.push([X, Y]);
        else if (ch === 'c') m.c = [X, Y];
      }));
      marks.push(m);
    }
    const order = [...Array(16).keys()];
    for (let i = 15; i > 0; i--) { const j = rng.int(0, i); [order[i], order[j]] = [order[j], order[i]]; }
    const [s0, s1] = order;
    const start = marks[s0].c, exit = marks[s1].c;
    rows[exit[1]][exit[0]] = '%';
    const trainerRound = Math.min(3, round - 1);
    const trainers = order.slice(1, 5).map((s, k) => {
      const d = G.TowerHall.trainerFor(trainerRound * 7 + 1, 'single', run * 53 + round * 11 + floor, { salt: SALT + 1009 * (k + 1), before: BEFORE(), defeat: DEFEAT() });
      const [x, y] = marks[s].t;
      return { id: 'f' + floor + 't' + k, who: d.who, cls: d.cls, name: d.name, x, y, dir: rng.pick(['up', 'down', 'left', 'right']), sight: rng.int(2, 3),
               team: d.team.slice(0, 1).map(r => [r[0], TRAINER_LEVEL, ...r.slice(2)]), before: d.before, defeat: d.defeat, afterScript: 'pyramid.hint', prize: 0, ai: 'leader' };
    });
    const items = order.slice(5, 8).map((s, k) => {
      const [x, y] = rng.pick(marks[s].i);
      return { x, y, item: weighted(rng, FINDS), flag: 'f' + floor + 'i' + k };
    });
    return { rows: rows.map(r => r.join('')), start, exit, trainers, items, encounters: { walk: wildTable(round) } };
  }

  /** The floor as a map: the plan, dark, and every rule of the challenge. */
  function defineFloor(plan) {
    // A new floor: what was beaten or picked up on the last one is forgotten.
    const done = G.Field && G.Field.save && G.Field.save.done;
    if (done) for (const k of Object.keys(done)) if (k.startsWith(FLOOR + ':')) delete done[k];
    G.Maps.def(Object.assign({
      id: FLOOR, loc: 'battle-pyramid', cave: true, dark: true, noFly: true,
      rows: plan.rows, spots: { start: [plan.start[0], plan.start[1], 'down'] },
      warps: [{ x: plan.exit[0], y: plan.exit[1], to: 'battle-pyramid-landing', spot: 'up' }],
      trainers: plan.trainers, items: plan.items, encounters: plan.encounters,
      afterBattle: { script: 'pyramid.won' }
    }, CAVE, HOENN));
  }
  // The floor as it is when nobody is climbing (a save is never made on it, but it must exist).
  defineFloor({ rows: Array.from({ length: SIZE }, (_, y) => (y === 0 || y === SIZE - 1 ? '#'.repeat(SIZE) : y === 5 ? '#::::%' + ':'.repeat(SIZE - 7) + '#'
                : '#' + ':'.repeat(SIZE - 2) + '#')), start: [2, 2], exit: [5, 5], trainers: [], items: [], encounters: { walk: wildTable(1) } });

  // ---------------- The challenge: the party and the Bag swapped ----------------
  const S = () => G.Field.save;
  let stash = null;                            // { party, bag } while a challenge is on
  let state = null;                            // { round, floor, run }
  const START_BAG = { 'hyper-potion': 1, ether: 1 };
  function loadBag() {
    try { const b = JSON.parse(G.Field.getVar('pyramid-bag') || 'null'); if (b && typeof b === 'object') return b; } catch (e) { /* a fresh bag */ }
    return Object.assign({}, START_BAG);
  }
  /** Keeps the Battle Bag for next time, ten kinds at most: -> the kinds left behind. */
  function keepBag(bag) {
    const kinds = Object.keys(bag).filter(k => bag[k] > 0);
    const kept = {};
    kinds.slice(0, 10).forEach(k => { kept[k] = bag[k]; });
    G.Field.setVar('pyramid-bag', JSON.stringify(kept));
    return kinds.slice(10);
  }
  function swapIn(team) {
    stash = { party: S().party, bag: S().bag };
    S().party = team.map(m => Object.assign(G.Tower.copy(m), { item: null }));
    S().bag = loadBag();
  }
  /** The real party and Bag back; what the copies held goes into the Battle Bag. -> the kinds left behind */
  function swapOut() {
    if (!stash) return [];
    const bag = S().bag;
    for (const m of S().party) if (m.item) { bag[m.item] = (bag[m.item] || 0) + 1; m.item = null; }
    const dropped = keepBag(bag);
    S().party = stash.party;
    S().bag = stash.bag;
    stash = null;
    state = null;
    return dropped;
  }
  async function leave(h, dropped) {
    await G.Script.exec([['warp', 'battle-pyramid-lobby', 'single']], h);
    if (dropped.length) await h.say(T('Your Battle Bag holds ten kinds of items at most. Left behind: {items}.'), { vars: { items: dropped.map(id => G.Names.item(id)).join(', ') } });
  }

  async function counter(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('Welcome to the Battle Pyramid! Climb seven dark floors to reach the top.'));
    if (!F.flag('pyramid-rules')) {
      F.setFlag('pyramid-rules');
      await h.say(T('Enter three Pokémon. Inside, your own Bag stays here: you get the Battle Bag, and whatever you find goes into it and stays there for next time.'));
      await h.say(T('In there, your Pokémon heal only with the items you find, and with a short rest on each landing between floors. Every battle you win lets you see a little farther in the dark.'));
      await h.say(T('Pokémon above level 50 battle at level 50, and held items stay with your own Pokémon. You cannot save inside.'));
    }
    await h.say(T('Rounds in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak('single', HALL), best: Tw.best('single', HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const team = await G.TowerHall.pickEntrants(h, 3);
    if (!team) return;
    const run = (+F.getVar('pyramid-runs') || 0) + 1;
    F.setVar('pyramid-runs', run);
    state = { round: Tw.streak('single', HALL) + 1, floor: 0, run };
    swapIn(team);
    await h.say(T('Here is your Battle Bag. Good luck in the dark!'));
    await G.Script.exec([['warp', 'battle-pyramid-landing', 'up']], h);
  }

  /** A rest on a landing (normal difficulty): every move's PP back, the fainted up with half their HP; the others keep
   *  their HP and status. */
  function rest() {
    for (const m of S().party) {
      for (const mv of m.moves) mv.pp = G.Mon.ppMax(mv.id, mv.ppUp);
      if (m.hp <= 0) { m.hp = Math.max(1, Math.floor(G.Mon.maxHp(m) / 2)); m.status = null; m.slp = 0; m.tox = 0; }
    }
  }

  /** The landing (its enter script): the first floor, the next one, or the end of a round at the top. */
  async function landing(h) {
    if (!state || !stash) {                    // nobody is climbing (a reload): back down
      await G.Script.exec([['warp', 'battle-pyramid-lobby', 'single']], h);
      return;
    }
    if (state.floor >= 1) {
      rest();
      await h.say(T('You rest on the landing. Your Pokémon get their PP back, and any that fainted get up with half their HP.'));
      if (state.floor >= FLOORS) return top(h);
      await h.say(T('Floor {n} cleared.'), { vars: { n: state.floor } });
      if (await h.choice(T('Floor {n} is next. Will you keep climbing?'), { options: [T('Keep climbing'), T('Retire')], vars: { n: state.floor + 1 } }) !== 0) {
        G.Tower.setStreak('single', 0, HALL);
        const dropped = swapOut();
        await h.say(T('You retired from the Pyramid.'));
        return leave(h, dropped);
      }
    }
    state.floor++;
    G.PyramidHall.plan = floorPlan(state.round, state.floor, state.run);
    defineFloor(G.PyramidHall.plan);
    await G.Script.exec([['warp', FLOOR, 'start']], h);
    await h.say(T('Floor {n}. It is pitch-dark...'), { vars: { n: state.floor } });
  }

  // ---------------- The top: Brandon, Battle Points ----------------
  // Emerald's teams at level 50 won about half (silver) and a third (gold) of the time against a typical team at full
  // HP: lowered for a normal difficulty (about 0.78 each at these levels; the gold team is the stronger one).
  const KING = {
    3: { print: 'silver', bp: 10, team: [
      ['regirock', 48, ['explosion', 'superpower', 'earthquake', 'ancient-power'], 'quick-claw', { nature: 'adamant' }],
      ['regice', 48, ['ice-beam', 'amnesia', 'thunder', 'rest'], 'chesto-berry', { nature: 'modest' }],
      ['registeel', 48, ['earthquake', 'metal-claw', 'toxic', 'iron-defense'], 'leftovers', { nature: 'adamant' }]] },
    10: { print: 'gold', bp: 20, team: [
      ['articuno', 47, ['blizzard', 'water-pulse', 'aerial-ace', 'reflect'], 'scope-lens', { nature: 'mild' }],
      ['zapdos', 47, ['thunder', 'detect', 'drill-peck', 'light-screen'], 'lum-berry', { nature: 'mild' }],
      ['moltres', 47, ['fire-blast', 'hyper-beam', 'aerial-ace', 'safeguard'], 'bright-powder', { nature: 'mild' }]] }
  };
  function king(k) {
    const silver = k.print === 'silver';
    return { id: 'brandon', who: 'brandon', cls: 'pyramid-king', name: G.T('Brandon', 'pyramid-king'), ai: 'leader', prize: 0, items: {}, music: 'league', team: k.team, king: k,
             before: silver ? T('Ha! You made it to the top! I am Brandon, the Pyramid King. You climbed in the dark; now show me your courage in the light!')
               : T('Back at the top again! Then the time for holding back is over!'),
             defeat: silver ? T('What courage! You have earned this.') : T('Splendid! Nobody has climbed like you.') };
  }

  async function top(h) {
    const F = G.Field, Tw = G.Tower, { round } = state;
    const k = KING[round];
    if (k) {
      await G.Script.exec([['warp', 'battle-pyramid-top', 'player']], h);
      const d = king(k);
      h.show('king');
      await h.say(T('The Pyramid King is waiting at the top!'));
      await h.say(d.before, G.TowerHall.speaker(d));
      // A fair fight in the light (normal difficulty): the team climbed worn down, he restores it first.
      for (const m of S().party) G.Mon.heal(m);
      await h.say(T('Brandon restored your Pokémon to full health.'));
      const out = await h.battle(d, { canLose: true, record: false, rules: { noExp: true, shift: false } });
      if (out === 'lose') return lose(h);
      await h.say(d.defeat, G.TowerHall.speaker(d));
      h.hide('king');
      if (k.print === 'silver') F.setFlag('pyramid-silver'); else F.setFlag('pyramid-gold');
      Tw.addBp(k.bp);
      await h.say(k.print === 'silver' ? T('Brandon recognizes your courage. You earned the Silver Brave Symbol!') : T('Brandon recognizes your courage. You earned the Gold Brave Symbol!'));
      await h.say(T('{player} earned {n} BP!'), { vars: { n: k.bp } });
    }
    Tw.setStreak('single', round, HALL);
    const bp = Tw.bpFor(round);
    Tw.addBp(bp);
    await h.say(T('Congratulations! You reached the top of the Pyramid!'));
    await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
    const dropped = swapOut();
    await leave(h, dropped);
    // The end of the eighty-third chapter (credits-ui.js), once the eighty-second is done; of the 109th, once the 108th is.
    if (F.flag('chapter-82-done') && !F.flag('chapter-83-done')) {
      if (G.CreditsUI) G.CreditsUI.ending(83); else F.setFlag('chapter-83-done');
    } else if (F.flag('chapter-108-done') && !F.flag('chapter-109-done')) {
      if (G.CreditsUI) G.CreditsUI.ending(109); else F.setFlag('chapter-109-done');
    }
  }

  /** Chapter 109, Emerald's hint giver: the theme of the round about to be climbed (rounds in a row, of twenty). */
  const ty = id => G.Names.type(id);
  const FORTUNES = () => [
    T('A tingling, a crackle... The wild Pokémon ahead will try to leave yours unable to move. Paralysis!'),
    T('A sickly purple haze... The wild Pokémon ahead carry poison. Beware!'),
    T('Flames, so many flames... The wild Pokémon ahead will try to burn yours.'),
    T('I see moves running dry... The wild Pokémon ahead love to drain your moves of their PP.'),
    fmt('Something floating, never touching the ground... The wild Pokémon ahead do not fear {type}-type moves.', { type: ty('ground') }),
    T('A trap that will not let go... Some wild Pokémon ahead will not let yours run away.'),
    T('A bitter chill... The wild Pokémon ahead bring the cold, and may freeze yours solid.'),
    T('A flash, a roar... Some wild Pokémon ahead would rather blow themselves up than lose.'),
    T('A mind reaching into yours... The wild Pokémon ahead wield psychic power.'),
    fmt('Hard, heavy stone... {type}-type Pokémon wait in the dark ahead.', { type: ty('rock') }),
    fmt('Fists and fury... {type}-type Pokémon wait in the dark ahead.', { type: ty('fighting') }),
    T('Rain, sun, sand, hail... The wild Pokémon ahead will change the weather to suit themselves.'),
    fmt('A buzzing, a skittering... {type}-type Pokémon wait in the dark ahead.', { type: ty('bug') }),
    fmt('A shadow within the shadows... {type}-type Pokémon wait ahead.', { type: ty('dark') }),
    fmt('The sound of waves, deep in the desert... {type}-type Pokémon wait ahead.', { type: ty('water') }),
    fmt('Cold breath on your neck... {type}-type Pokémon haunt the dark ahead.', { type: ty('ghost') }),
    fmt('The gleam of metal... {type}-type Pokémon wait ahead.', { type: ty('steel') }),
    fmt('Wings, and scales... {a}- and {b}-type Pokémon wait ahead.', { a: ty('flying'), b: ty('dragon') }),
    T('I see stones that changed the ones who touched them... The wild Pokémon ahead evolved by a stone.'),
    fmt('Nothing strange at all... Plain {type}-type Pokémon wait ahead. Do not let your guard down!', { type: ty('normal') })
  ];
  async function fortune(h) {
    const k = G.Tower.streak('single', HALL) % THEMES.length, who = { name: 'Fortune-teller' };
    await h.say(T('Let me read what waits for you in the Pyramid...'), who);
    await h.say(FORTUNES()[k], who);
    await h.say(T('Believe it or not, as you like. The dark keeps its own secrets.'), who);
  }

  /** All three down (the floors' onLose, or at the top). */
  async function lose(h) {
    G.Tower.setStreak('single', 0, HALL);
    const dropped = swapOut();
    await h.say(T('All your Pokémon fainted in the dark. Your challenge is over.'));
    await leave(h, dropped);
  }

  /** A beaten Trainer: how many Trainers and items are left on this floor. */
  async function hint(h) {
    const def = G.Maps.get(FLOOR).def, F = G.Field;
    const t = def.trainers.filter(x => !F.isDone(FLOOR + ':' + x.id)).length, i = def.items.filter(x => !F.isDone(FLOOR + ':' + x.flag)).length;
    await h.say(T('On this floor there are still {t} Trainers and {i} items. The ladder up is somewhere in the dark...'), { vars: { t, i } });
  }

  G.Script.def({
    'pyramid.single': [['js', counter]],
    'pyramid.landing': [['js', landing]],
    'pyramid.lost': [['js', lose]],
    'pyramid.won': [['js', () => { if (G.World && G.World.brighten) G.World.brighten(1); }]],
    'pyramid.hint': [['js', hint]],
    'pyramid.fortune': [['js', fortune]],
    'pyramid.door': [['say', 'The door to the battle room. Challengers must register at the counter first.']],
    'pyramid.ladder': [['say', 'The ladder leads up into the dark.']],
    'pyramid.guide': [
      ['say', 'Every win lights up the dark a little. Beat the Trainers and you will see the way up more easily.'],
      ['say', 'Talk to a Trainer you have beaten: they will tell you how many Trainers and items are left on that floor.'],
      ['say', 'They say the Pyramid King waits at the very top for Trainers who climb three times in a row.']
    ]
  });
  G.PyramidHall = { SECTIONS, THEMES, FINDS, KING, SIZE, FLOORS, TRAINER_LEVEL, rest, floorPlan, defineFloor, wildTable, themeOf, loadBag, keepBag, FORTUNES,
                    get state() { return state; }, get on() { return !!stash; }, plan: null };
})();
