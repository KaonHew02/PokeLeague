/* ============ distortion.js — the Distortion World, Sendoff Spring and Turnback Cave ============
 * Chapter 56. The rift at the Spear Pillar (coronet.js) leads to the Distortion World. Platinum's floors turn over and you walk
 * on walls: a game seen from above cannot do that, so here it is islands floating in the dark (`v`, solid), joined by warp panels.
 * distortion-1: Cynthia and the shadow of Giratina (flag distortion-entered); a panel leads back, for a team with no Strength.
 * distortion-2: four islands, and Uxie, Mesprit and Azelf come to show the way (flag distortion-guides). distortion-3: three
 * boulders go into the three pits by the lake Pokémon (Strength, the flags of the pits), which opens the panel down.
 * distortion-4: Cynthia heals the team (flag distortion-heal), Cyrus's last battle (flag cyrus-distortion), then Giratina at level 47
 * (flags giratina-met, giratina-caught): catching it, beating it or running all go on. Cyrus stays behind, the way out leads
 * to Sendoff Spring (flag distortion-done: the rift closes and the tunnel of Route 214 opens), then `ending(56)`.
 * A Giratina not caught waits in Turnback Cave, one room here, until it is. Giratina is drawn and fights in its only form in the
 * game's data (Altered), where Platinum has its Origin Forme.
 */
(() => {
  const T = s => G.T(s);
  const CYNTHIA = { name: 'Cynthia' }, CYRUS = { name: 'Cyrus' };
  const WORLD = { loc: 'distortion-world', tileset: 'indoor', palette: 'distortion', music: 'cave', battleBg: 'distortion', region: 'sinnoh' };
  const PITS = ['pit:distortion-3:3,2', 'pit:distortion-3:10,2', 'pit:distortion-3:17,2'];

  // ---------------- The Distortion World ----------------
  G.Maps.def(Object.assign({}, WORLD, {
    id: 'distortion-1', enter: 'distortion.enter',
    rows: [
      'vvvvvvvvvvvvvvvvvvvvvv',
      'vvvvvvvvv++++vvvvvvvvv',
      'vvvvvvv++++w+++vvvvvvv',
      'vvvvv+++++++++++vvvvvv',
      'vvvv+++cc+++++++++vvvv',
      'vvv++++cc++++cc++++vvv',
      'vvv++++++++++cc++++vvv',
      'vvvv++++++++++++++vvvv',
      'vvvvvv+++++++++++vvvvv',
      'vvvvvvvv++w++++vvvvvvv',
      'vvvvvvvvvvvvvvvvvvvvvv'
    ],
    warps: [{ x: 10, y: 9, to: 'spear-pillar', spot: 'rift' }, { x: 11, y: 2, to: 'distortion-2', spot: 'a1' }],
    spots: { start: [10, 9, 'up'], down: [11, 2, 'down'] },
    npcs: [{ id: 'cynthia', who: 'cynthia', x: 11, y: 8, dir: 'left', if: 'scripted' }]
  }));

  // Four islands, a panel at each end of a way: a1 (back up), a2-c1, c2-b1, b2-d1, d2 (down).
  G.Maps.def(Object.assign({}, WORLD, {
    id: 'distortion-2', enter: 'distortion.guides',
    rows: [
      'vvvvvvvvvvvvvvvvvvvvvvvvvvvv',
      'vv++++++vvvvvvvvvv+++++++vvv',
      'vv+w++++vvvvvvvvvv+w+++++vvv',
      'vv++++++vvvvvvvvvv+++++++vvv',
      'vv++++w+vvvvvvvvvv+++++w+vvv',
      'vvvvvvvvvvvvvvvvvvvvvvvvvvvv',
      'vvvvvvvvvvvvvvvvvvvvvvvvvvvv',
      'vv++++++vvvvvvvvvv+++++++vvv',
      'vv+w++++vvvvvvvvvv+w+++++vvv',
      'vv++++++vvvvvvvvvv+++++++vvv',
      'vv++++w+vvvvvvvvvv+++++w+vvv',
      'vvvvvvvvvvvvvvvvvvvvvvvvvvvv'
    ],
    warps: [
      { x: 3, y: 2, to: 'distortion-1', spot: 'down' },
      { x: 6, y: 4, to: 'distortion-2', spot: 'c1' },
      { x: 3, y: 8, to: 'distortion-2', spot: 'a2' },
      { x: 6, y: 10, to: 'distortion-2', spot: 'b1' },
      { x: 19, y: 2, to: 'distortion-2', spot: 'c2' },
      { x: 23, y: 4, to: 'distortion-2', spot: 'd1' },
      { x: 19, y: 8, to: 'distortion-2', spot: 'b2' },
      { x: 23, y: 10, to: 'distortion-3', spot: 'start' }
    ],
    spots: { a1: [3, 2, 'down'], a2: [6, 4, 'up'], c1: [3, 8, 'down'], c2: [6, 10, 'up'], b1: [19, 2, 'down'], b2: [23, 4, 'up'], d1: [19, 8, 'down'], d2: [23, 10, 'up'] },
    npcs: [
      { id: 'cynthia', who: 'cynthia', x: 4, y: 3, dir: 'up', if: 'scripted' },
      { id: 'uxie', who: 'uxie', mon: 'uxie', x: 6, y: 1, dir: 'down', fixed: true, if: 'scripted' },
      { id: 'mesprit', who: 'mesprit', mon: 'mesprit', x: 7, y: 2, dir: 'down', fixed: true, if: 'scripted' },
      { id: 'azelf', who: 'azelf', mon: 'azelf', x: 6, y: 3, dir: 'down', fixed: true, if: 'scripted' }
    ]
  }));

  // Three boulders, three pits: one straight up, one to the right first, one to the left first.
  G.Maps.def(Object.assign({}, WORLD, {
    id: 'distortion-3',
    rows: [
      'vvvvvvvvvvvvvvvvvvvvvvvv',
      'vv+++vvvv+++vvvv+++vvvvv',
      'vv+O+vvvv+O+vvvv+O+vvvvv',
      'vv+++vvvv+++vvvv+++vvvvv',
      'vv+++vvvv+++vvvv+++vvvvv',
      'vv+++++++++++++++++++vvv',
      'vv++++++++++++++++++wvvv',
      'vvvvvvvvv+++vvvvvvvvvvvv',
      'vvvvvvvvv+w+vvvvvvvvvvvv',
      'vvvvvvvvvvvvvvvvvvvvvvvv'
    ],
    warps: [
      { x: 20, y: 6, to: 'distortion-2', spot: 'd2' },
      { x: 10, y: 8, to: 'distortion-4', spot: 'start', if: PITS, locked: 'distortion.pad-off' },
      { x: 3, y: 2, to: 'distortion-3', spot: 'start' }, { x: 10, y: 2, to: 'distortion-3', spot: 'start' }, { x: 17, y: 2, to: 'distortion-3', spot: 'start' }
    ],
    spots: { start: [20, 6, 'left'], down: [10, 8, 'up'] },
    boulders: [{ id: 'west', x: 3, y: 4 }, { id: 'mid', x: 8, y: 5 }, { id: 'east', x: 18, y: 5 }],
    npcs: [
      { id: 'uxie', who: 'uxie', mon: 'uxie', x: 3, y: 1, dir: 'down', fixed: true, if: '!' + PITS[0], say: 'Uxie is watching the hole beside it, and it does not blink.' },
      { id: 'mesprit', who: 'mesprit', mon: 'mesprit', x: 10, y: 1, dir: 'down', fixed: true, if: '!' + PITS[1], say: 'Mesprit looks from you to the hole, and back again.' },
      { id: 'azelf', who: 'azelf', mon: 'azelf', x: 17, y: 1, dir: 'down', fixed: true, if: '!' + PITS[2], say: 'Azelf hovers over the hole, waiting.' },
      { id: 'cynthia', who: 'cynthia', x: 9, y: 7, dir: 'right', say: 'Those three are showing us something. A strong Pokémon could fill those holes, and I think that is what this panel is waiting for.' }
    ]
  }));

  G.Maps.def(Object.assign({}, WORLD, {
    id: 'distortion-4', enter: 'distortion.heal',
    rows: [
      'vvvvvvvvvvvvvvvvv',
      'vvvvvv+++++vvvvvv',
      'vvvv+++++++++vvvv',
      'vvv+++++++++++vvv',
      'vv+++++++++++++vv',
      'vv+++++++++++++vv',
      'vv+++++++++++++vv',
      'vv+++++++++++++vv',
      'vvv+++++++++++vvv',
      'vvvv+++++++++vvvv',
      'vvvvvv++w++vvvvvv',
      'vvvvvvvvvvvvvvvvv'
    ],
    warps: [{ x: 8, y: 10, to: 'distortion-3', spot: 'down' }],
    spots: { start: [8, 10, 'up'] },
    npcs: [
      { id: 'cynthia', who: 'cynthia', x: 9, y: 9, dir: 'left', if: 'scripted' },
      { id: 'giratina', who: 'giratina', mon: 'giratina-altered', x: 8, y: 3, dir: 'down', fixed: true, if: ['cyrus-distortion', '!giratina-met'], script: 'distortion.giratina' },
      { id: 'cyrus2', who: 'cyrus', x: 11, y: 5, dir: 'left', if: 'scripted' }
    ],
    trainers: [
      { id: 'cyrus', who: 'cyrus', cls: 'galactic-boss', name: 'Cyrus', x: 8, y: 5, dir: 'down', sight: 3, ai: 'leader', if: '!cyrus-distortion',
        team: [['houndoom', 43, ['flamethrower', 'dark-pulse', 'will-o-wisp', 'thunder-fang']],
               ['honchkrow', 45, ['drill-peck', 'night-slash', 'heat-wave', 'psychic']],
               ['crobat', 44, ['cross-poison', 'air-slash', 'toxic', 'confuse-ray']],
               ['gyarados', 44, ['giga-impact', 'waterfall', 'ice-fang', 'earthquake']],
               ['weavile', 46, ['night-slash', 'ice-punch', 'fake-out', 'x-scissor'], 'sitrus-berry']],
        items: { 'super-potion': 1 },
        before: 'So you followed me, even here. Look around you. There is no spirit in this world, and that makes it perfect. I need nothing from yours. If you came to drag me back, you will have to defeat me.',
        defeat: 'Even here. Even now.',
        win: 'distortion.cyrus-win' }
    ]
  }));

  // ---------------- Sendoff Spring ----------------
  G.Maps.def({
    id: 'sendoff-spring', loc: 'sendoff-spring', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: '#', region: 'sinnoh', fog: true,
    rows: [
      '##############################',
      '##############################',
      '##########O###################',
      '##..........................##',
      '##...~~~~~~~~~~~~~~~~~~.....##',
      '##..~~~~~~~~~~~~~~~~~~~~....##',
      '##..~~~~~~~~~~~~~~~~~~~~....##',
      '##..~~~~~~~~~~~~~~~~~~~~....##',
      '##...~~~~~~~~~~~~~~~~~~.....##',
      '##..........................##',
      '##...""""""....,,....""""""..#',
      '##...""""""....,,....""""""..#',
      '##...""""""....,,....""""""..#',
      '##.............,,............#',
      '###############,,#############'
    ],
    connect: { south: { map: 'spring-path', offset: 5 } },
    warps: [{ x: 10, y: 2, to: 'turnback-cave', spot: 'door' }],
    spots: { rift: [15, 9, 'down'], cave: [10, 3, 'down'] },
    npcs: [{ id: 'cynthia', who: 'cynthia', x: 16, y: 9, dir: 'left', if: 'scripted' }],
    encounters: { walk: '@sendoff-spring-area', water: '@sendoff-spring-area' }
  });

  G.Maps.def({
    id: 'spring-path', loc: 'spring-path', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: '#', region: 'sinnoh',
    rows: [
      '##########,,##########',
      '####......,,......####',
      '###.......,,.......###',
      '###...""""..""""...###',
      '###...""""..""""...###',
      '###.......,,.......###',
      '####......,,......####',
      '##########O###########',
      '######################'
    ],
    connect: { north: { map: 'sendoff-spring', offset: -5 } },
    warps: [{ x: 10, y: 7, to: 'route214', spot: 'spring' }],
    spots: { tunnel: [10, 6, 'up'] },
    encounters: { walk: '@sendoff-spring-area' }
  });

  // ---------------- Turnback Cave ----------------
  G.Maps.def({
    id: 'turnback-cave', loc: 'turnback-cave', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh',
    rows: [
      '################',
      '################',
      '####........####',
      '###..........###',
      '##............##',
      '##............##',
      '###..........###',
      '####........####',
      '#######O########',
      '################'
    ],
    warps: [{ x: 7, y: 8, to: 'sendoff-spring', spot: 'cave' }],
    spots: { door: [7, 7, 'up'] },
    npcs: [{ id: 'giratina', who: 'giratina', mon: 'giratina-altered', x: 7, y: 3, dir: 'down', fixed: true, if: ['giratina-met', '!giratina-caught'], script: 'distortion.giratina-again' }],
    encounters: { walk: '@turnback-cave-pillar-3' }
  });

  /** The first step into the other world. */
  async function enter(h) {
    const F = G.Field;
    if (F.flag('distortion-entered')) return;
    h.show('cynthia');
    await h.say(T('So this is the world behind our own. Nothing here keeps still, not even the ground.'), CYNTHIA);
    h.sfx('cry');
    await h.say(T('A vast shadow slid across the dark overhead, and sank away below.'));
    await h.say(T('Giratina. It went down, and Cyrus must be down there too. If this distortion keeps growing, it will swallow our world as well.'), CYNTHIA);
    await h.say(T('Those panels must lead deeper. I will go on ahead and look for the way. Do not stop for long.'), CYNTHIA);
    await h.fade('out', 0.3);
    h.hide('cynthia');
    F.setFlag('distortion-entered');
    await h.fade('in', 0.3);
  }

  /** The three from the lakes come to show the way. */
  async function guides(h) {
    const F = G.Field;
    if (F.flag('distortion-guides')) return;
    h.show('cynthia'); h.show('uxie'); h.show('mesprit'); h.show('azelf');
    h.sfx('cry');
    await h.say(T('{uxie}, {mesprit} and {azelf} are here! They came after us.'),
      Object.assign({}, CYNTHIA, { vars: { uxie: G.Names.mon(480), mesprit: G.Names.mon(481), azelf: G.Names.mon(482) } }));
    await h.say(T('You set them free, and now they want to help. They know this place. Follow the panels, and they will meet us further down.'), CYNTHIA);
    await h.fade('out', 0.3);
    h.hide('cynthia'); h.hide('uxie'); h.hide('mesprit'); h.hide('azelf');
    F.setFlag('distortion-guides');
    await h.fade('in', 0.3);
  }

  /** At the bottom, before Cyrus. */
  async function heal(h) {
    const F = G.Field;
    if (F.flag('distortion-heal')) return;
    h.show('cynthia');
    await h.say(T('He is just ahead. Your team has come a long way, so let me see to them first.'), CYNTHIA);
    h.heal();
    await h.jingle('heal');
    await h.say(T('I will stay close, but this is your fight. He has never once listened to me.'), CYNTHIA);
    await h.fade('out', 0.3);
    h.hide('cynthia');
    F.setFlag('distortion-heal');
    await h.fade('in', 0.3);
  }

  /** Giratina: caught, beaten or fled from, the story goes on; lost to, it stays. */
  async function giratina(h) {
    const F = G.Field;
    h.sfx('cry');
    await h.wild(487, 47, {});
    const r = F.lastBattle;
    if (r === 'lose') return;
    F.setFlag('giratina-met');
    if (r === 'caught') F.setFlag('giratina-caught');
    h.hide('giratina');
    if (r !== 'caught') await h.say(T('Giratina sank away into the shadows.'));
    await h.say(T('Do you feel that? The ground has stopped shaking. Time and space are settling again.'), CYNTHIA);
    h.show('cyrus2');
    await h.say(T('So you have taken my new world from me as well. It makes no difference. I will stay here. In this place, at least, nobody feels anything.'), CYRUS);
    await h.say(T('Cyrus...'), CYNTHIA);
    await h.fade('out', 0.4);
    h.hide('cyrus2');
    await h.fade('in', 0.4);
    await h.say(T('Cyrus turned and walked away into the dark.'));
    await h.say(T('We cannot make him come back. Over here, {player}. There is a way out, and I think it was left open for us.'), CYNTHIA);
    await h.fade('out', 0.4);
    F.setFlag('distortion-done');
    await h.warp('sendoff-spring', 'rift');
    h.show('cynthia');
    await h.say(T('We are back. The air smells of water. I have only read about this place: it is Sendoff Spring, a lake hidden in the mountains.'), CYNTHIA);
    await h.say(T('The way we came has closed behind us. You did well in there, {player}. Better than I could have done alone.'), CYNTHIA);
    await h.say(T('They say the cave over there leads back towards that world. If anything is left unfinished, that is where it will be.'), CYNTHIA);
    await h.say(T('Professor Rowan needs to hear about this. Rest for a while first. You have earned it.'), CYNTHIA);
    await h.fade('out', 0.3);
    h.hide('cynthia');
    await h.fade('in', 0.3);
    // The end of the fifty-sixth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(56); else F.setFlag('chapter-56-done');
  }

  /** After Cyrus: Cynthia heals the team, and Giratina comes. */
  async function cyrusWin(h) {
    const F = G.Field;
    await h.say(T('I do not understand. Why can a heart as weak as yours not be broken?'), CYRUS);
    await h.fade('out', 0.3);
    F.setFlag('cyrus-distortion');
    h.show('cyrus2'); h.show('cynthia');
    await h.fade('in', 0.3);
    await h.say(T('You did it. Quickly, let me help your team.'), CYNTHIA);
    h.heal();
    await h.jingle('heal');
    h.show('giratina');
    await h.say(T('Giratina came down out of the dark, and the whole island shook!'));
    await h.say(T('It is furious. It will tear both worlds apart unless somebody stops it. {player}, it is looking at you!'), CYNTHIA);
    await giratina(h);
  }

  /** Turnback Cave: as often as it takes. */
  async function again(h) {
    const F = G.Field;
    await h.say(T('Giratina is waiting in the dark of the cave.'));
    h.sfx('cry');
    await h.wild(487, 47, {});
    const r = F.lastBattle;
    if (r === 'lose') return;
    if (r === 'caught') F.setFlag('giratina-caught');
    else await h.say(T('Giratina sank away into the shadows. It may come back if you leave the cave.'));
    h.hide('giratina');
  }

  G.Script.def({
    'distortion.enter': [['js', enter]],
    'distortion.guides': [['js', guides]],
    'distortion.heal': [['js', heal]],
    'distortion.pad-off': [['say', 'The warp panel is dark. Something is keeping it from working.']],
    'distortion.cyrus-win': [['js', cyrusWin]],
    'distortion.giratina': [['js', giratina]],
    'distortion.giratina-again': [['js', again]]
  });
})();
