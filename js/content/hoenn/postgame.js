/* ============ postgame.js — Routes 132 to 134, and Steven at Meteor Falls ============
 * Chapter 40, Hoenn after the League. West of Pacifidlog Town, Routes 132, 133 and 134 lead to Slateport
 * City's sea: bands of current flow west (they carry a surfer along, field.js), calm lanes between them
 * lead back east. Swimmers, a fisherman and a Sis and Bro pair (a double battle). Behind Meteor Falls a
 * waterfall climbs to a pool and Steven's cave: once you are Hoenn's Champion (flag hoenn-champion) he
 * waits there and battles you with his team of Steel and Rock Pokémon (flag steven-beaten), then tells
 * you of the gift at his house in Mossdeep (a Beldum, mossdeep.js), and `ending(40)`.
 */
(() => {
  const T = s => G.T(s);
  const HOENN = { region: 'hoenn' };
  const STEVEN = { name: 'Steven' };
  const SEA = { tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'sea', border: '~' };

  // ---------------- Route 132 ----------------
  G.Maps.def(Object.assign({
    id: 'route132', loc: 'hoenn-route-132',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~###~~~~~~~~~~~###~~~~~~~',
      '~~~~~~~~###~~~~~~~~~~~###~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~###~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~###~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'pacifidlog', offset: 0 }, west: { map: 'route133', offset: 0 } },
    trainers: [
      { id: 'gilbert', who: 'swimmer', cls: 'swimmer', name: 'Gilbert', x: 16, y: 9, dir: 'left', sight: 4, swim: true, team: [['wailmer', 44], ['tentacruel', 45]],
        before: 'The currents here are a free ride west! Going east is the hard part. Let us battle!',
        defeat: 'I got carried away...',
        after: 'Stay in the calm water between the currents if you want to swim east.' },
      { id: 'dana', who: 'swimmerf', cls: 'swimmer-f', name: 'Dana', x: 26, y: 17, dir: 'up', sight: 4, swim: true, team: [['marill', 44], ['azumarill', 46]],
        before: 'I swim against the current every morning. A battle will be easy after that!',
        defeat: 'Swept away, for once...',
        after: 'The currents all flow toward Slateport. Pacifidlog is the hard way.' }
    ],
    encounters: { water: '@hoenn-route-132-area' }
  }, SEA, HOENN));

  // ---------------- Route 133 ----------------
  G.Maps.def(Object.assign({
    id: 'route133', loc: 'hoenn-route-133',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~:::::::~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~::###::~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~:::::::~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'route132', offset: 0 }, west: { map: 'route134', offset: 0 } },
    trainers: [
      { id: 'lisa-ray', who: 'swimmerf', cls: 'sis-and-bro', name: 'Lisa & Ray', x: 30, y: 9, dir: 'left', sight: 4, swim: true, double: true,
        partner: { who: 'swimmer', x: 31, y: 9 }, team: [['goldeen', 44], ['seaking', 45], ['lanturn', 45]],
        before: 'My little brother and I never lose in the water! Two against two!',
        defeat: 'We lost... even in the water.',
        after: 'Next time we will train in the currents. Then we will win!' },
      { id: 'franklin', who: 'fisherman', cls: 'fisherman', name: 'Franklin', x: 18, y: 10, dir: 'down', sight: 2, team: [['sharpedo', 45], ['wailord', 45]],
        before: 'Out here, the big ones bite. Like you!',
        defeat: 'The one that got away...',
        after: 'The currents bring the fish right to this islet. I never have to move.' }
    ],
    items: [{ x: 22, y: 8, item: 'star-piece', flag: 'route133-starpiece' }, { x: 16, y: 10, item: 'max-ether', flag: 'route133-maxether' }],
    encounters: { water: '@hoenn-route-133-area' }
  }, SEA, HOENN));

  // ---------------- Route 134 ----------------
  G.Maps.def(Object.assign({
    id: 'route134', loc: 'hoenn-route-134',
    rows: [
      '########################################',
      '########################################',
      '###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '~~~~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~###~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '((((((((((((((((((((((((((((((((((((((((',
      '###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '###~~~~~~~~~~~~~~~~~~~~~~~~####~~~~~~~~~',
      '###~~~~~~~~~~~~~~~~~~~~~~~~####~~~~~~~~~',
      '###~~~~~~~~~~~~~~~~~~~~~~~~####~~~~~~~~~',
      '###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    connect: { east: { map: 'route133', offset: 0 }, west: { map: 'slateport', offset: -23 } },
    trainers: [
      { id: 'kelsey', who: 'swimmerf', cls: 'swimmer-f', name: 'Kelsey', x: 22, y: 9, dir: 'right', sight: 4, swim: true, team: [['horsea', 44], ['seadra', 45], ['kingdra', 46]],
        before: 'Slateport is right there, but you will not get past me!',
        defeat: 'You swim like a Kingdra...',
        after: 'Slateport\'s beach is just west. The currents make the trip from Pacifidlog so fast!' },
      { id: 'jack', who: 'swimmer', cls: 'swimmer', name: 'Jack', x: 12, y: 16, dir: 'up', sight: 4, swim: true, team: [['tentacruel', 45], ['pelipper', 45]],
        before: 'I train where the currents meet the open sea. Ready?',
        defeat: 'Pulled under...',
        after: 'Some say a Pokémon as old as the sea itself sleeps somewhere around here.' }
    ],
    items: [{ x: 30, y: 15, item: 'big-pearl', flag: 'route134-bigpearl', hidden: true }],
    encounters: { water: '@hoenn-route-134-area' }
  }, SEA, HOENN));

  // ---------------- Steven's cave, behind Meteor Falls ----------------
  G.Maps.def(Object.assign({
    id: 'meteor-falls-steven', loc: 'meteor-falls', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true,
    rows: [
      '################',
      '################',
      '###..........###',
      '##..##........##',
      '##..##........##',
      '##............##',
      '##........##..##',
      '##........##..##',
      '##............##',
      '##............##',
      '##............##',
      '########O#######'
    ],
    warps: [{ x: 8, y: 11, to: 'meteor-falls', spot: 'steven' }],
    spots: { mouth: [8, 10, 'up'] },
    npcs: [{ id: 'steven', who: 'steven', x: 8, y: 4, dir: 'down', if: 'hoenn-champion', script: 'meteor.steven' }],
    items: [{ x: 12, y: 9, item: 'rare-candy', flag: 'meteor-steven-rarecandy' }],
    encounters: { walk: '@meteor-falls-area' }
  }, HOENN));

  /** Steven's team: Emerald's, at the level of the rival on Mt. Silver (exported for the balance test). */
  const STEVEN_TEAM = [['skarmory', 72, ['toxic', 'aerial-ace', 'agility', 'steel-wing'], 'sharp-beak'],
    ['claydol', 71, ['reflect', 'light-screen', 'ancient-power', 'earthquake'], 'hard-stone'],
    ['aggron', 72, ['thunder', 'earthquake', 'solar-beam', 'dragon-claw'], 'quick-claw'],
    ['cradily', 72, ['giga-drain', 'ancient-power', 'ingrain', 'confuse-ray'], 'shell-bell'],
    ['armaldo', 72, ['water-pulse', 'ancient-power', 'aerial-ace', 'slash'], 'hard-stone'],
    ['metagross', 75, ['earthquake', 'psychic', 'meteor-mash', 'shadow-ball'], 'leftovers']];
  G.Postgame = { STEVEN_TEAM };

  async function steven(h) {
    const F = G.Field;
    h.face('steven', 'player');
    if (F.flag('steven-beaten')) {
      await h.say(T('I will keep looking for rare stones here. If you find one on your travels, show me, {player}!'), STEVEN);
      return;
    }
    await h.say(T('{player}! So the new Champion of Hoenn found my hiding place.'), STEVEN);
    await h.say(T('I come to Meteor Falls to look for stones that fell from the sky. Every one of them has a story, like the meteorite Team Magma took.'), STEVEN);
    await h.say(T('Wallace told me how you battled him. I have wanted to see it for myself ever since we met in Granite Cave. Show me, {player}!'), STEVEN);
    const out = await h.battle({ id: 'steven', who: 'steven', cls: 'champion', name: 'Steven', leader: true, ai: 'leader', music: 'league',
      items: { 'full-restore': 1 }, team: STEVEN_TEAM }, {});
    if (out === 'lose') return;
    F.setFlag('steven-beaten');
    await h.say(T('...Magnificent. I knew you were strong, but this... You truly are the Champion of Hoenn.'), STEVEN);
    await h.say(T('I left something for you at my house in Mossdeep: a Pokémon I met on my travels. I think it would be happy with a Trainer like you.'), STEVEN);
    // The end of the fortieth chapter (credits-ui.js).
    if (G.CreditsUI) G.CreditsUI.ending(40); else F.setFlag('chapter-40-done');
  }

  G.Script.def({
    'meteor.steven': [['js', steven]]
  });
})();
