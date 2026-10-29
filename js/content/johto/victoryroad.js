/* ============ victoryroad.js — Johto's Victory Road, the rival, the Indigo Plateau ============
 * Chapter 19, the end of the chapter. Victory Road runs from the top of Route 26 to the Indigo
 * Plateau (a mouth east of Kanto's); Johto's Trainers may only go in from Route 26 with all eight
 * Johto badges (newbark.js). Two floors of winding cave, no Trainers, nothing that blocks the way
 * back (a Champion from Kanto first comes down this way, chapter 11). Near the top the thief waits
 * for one last battle (flag vr-rival; losing allowed): he has begun to see what Lance and the
 * Elder meant. Stepping out onto the Plateau afterwards ends the chapter (flag johto-plateau,
 * `ending(19)`).
 */
const JOHTO_VR = { loc: 'kanto-victory-road-1', region: 'johto', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true };

G.Maps.def(Object.assign({
  id: 'johto-victory-1f',
  rows: [
    '##############################',
    '###O##########################',
    '#.....##..........##.........#',
    '#.....##..........##.........#',
    '#.....##..........##..#......#',
    '#.....##..........##.........#',
    '#.....##....##....##....##...#',
    '#.....##..#.##....##....##...#',
    '#.....##....##....##....##...#',
    '#vvv..##....##....##....##...#',
    '#.....##....##....##....##...#',
    '#.....##....##....##....##...#',
    '#.....##vv..##....##....##.#.#',
    '#.#...##....##....##....##...#',
    '#.....##....##....##....##...#',
    '#.....##....##....##....##...#',
    '#...........##..........##...#',
    '#...........##.#........##...#',
    '#...#.......##..........##...#',
    '#...........##..........##.%.#',
    '#...........##..........##...#',
    '##############################'
  ],
  warps: [{ x: 3, y: 1, to: 'route26', spot: 'vr-door' }, { x: 27, y: 19, to: 'johto-victory-2f', spot: 'ladder' }],
  spots: { south: [3, 2, 'down'], ladder: [27, 19, 'left'] },
  items: [
    { x: 9, y: 3, item: 'full-restore', flag: 'johto-vr-1f-fullrestore' },
    { x: 21, y: 19, item: 'max-revive', flag: 'johto-vr-1f-maxrevive' },
    { x: 2, y: 20, item: 'hp-up', flag: 'johto-vr-1f-hpup' }
  ],
  encounters: { walk: '@kanto-victory-road-1-1f' }
}, JOHTO_VR));

G.Maps.def(Object.assign({
  id: 'johto-victory-2f',
  rows: [
    '##############################',
    '####O#########################',
    '#.......##..........##.......#',
    '#.......##..........##.......#',
    '#.......##.......#..##.......#',
    '#.......##..........##.......#',
    '#.......##....##....##.......#',
    '#.......##....##....##.......#',
    '#..#....##....##....##.......#',
    '#.......##....##....##vvvvv..#',
    '#.......##....##....##.......#',
    '#.......##....##....##.......#',
    '#....#..##....##....##.......#',
    '#.............##vv...........#',
    '#.............##.............#',
    '#..........#..##.........#...#',
    '#.............##.............#',
    '#.............##...........%.#',
    '#.............##.............#',
    '##############################'
  ],
  warps: [{ x: 4, y: 1, to: 'indigo', spot: 'johto-cave-door' }, { x: 27, y: 17, to: 'johto-victory-1f', spot: 'ladder' }],
  spots: { north: [4, 2, 'down'], ladder: [27, 17, 'left'] },
  triggers: [{ x: 1, y: 4, w: 7, h: 3, if: ['clair-beaten', '!vr-rival'], script: 'jvr.rival' }],
  npcs: [{ id: 'rival', who: 'silver', x: 4, y: 2, dir: 'down', if: 'scripted' }],
  items: [
    { x: 11, y: 2, item: 'max-elixir', flag: 'johto-vr-2f-maxelixir' },
    { x: 28, y: 2, item: 'carbos', flag: 'johto-vr-2f-carbos' }
  ],
  encounters: { walk: '@kanto-victory-road-1-2f' }
}, JOHTO_VR));

(() => {
  const T = s => G.T(s);
  const RIVAL2 = { name: '{rival2}' };
  /** The thief's starter, fully evolved (Meganium, Typhlosion, Feraligatr). */
  const final = sp => ({ 152: 154, 155: 157, 158: 160 })[sp] || 157;

  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('vr-rival');
    h.place('rival', 4, 2, 'down');
    h.show('rival');
    await h.walkTo('rival', me.x, me.y - 1);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T('...Wait. You are on your way to the Pokémon League too.'), RIVAL2);
    await h.say(T('Since the Dragon\'s Den I keep thinking about what that old man said. I still do not get it. So I will find out the only way I know.'), RIVAL2);
    await h.say(T('Battle me. Here. Now.'), RIVAL2);
    await h.battle({ id: 'rival2-victory', who: 'silver', name: S.rival2.name || '???', prize: 60, ai: 'basic',
                     team: [['sneasel', 39], ['golbat', 41], ['magneton', 40], ['haunter', 40], ['kadabra', 40], [final(S.rival2.starter), 43]] }, { canLose: true });
    if (F.lastBattle === 'lose') {
      await h.say(T('Hmph. If that is all you have, the Elite Four will eat you alive. Get stronger.'), RIVAL2);
    } else {
      await h.say(T('...I lost again. But my Pokémon kept fighting for me, every one of them, to the very end.'), RIVAL2);
      await h.say(T('I only ever told them to win. I never once asked what they wanted.'), RIVAL2);
      await h.say(T('Go on to the League. Next time we meet, I will battle with my Pokémon, not just give them orders.'), RIVAL2);
    }
    await h.walkTo('rival', 4, 2);
    h.hide('rival');
  }

  async function plateau(h) {
    const F = G.Field;
    F.setFlag('johto-plateau');
    await h.say(T('The Indigo Plateau! The Pokémon League stands at the top of the road.'));
    await h.say(T('With all eight of Johto\'s badges, the League\'s challenge for Johto\'s Trainers is open to you.'));
    if (G.CreditsUI) await G.CreditsUI.ending(19); else F.setFlag('chapter-19-done');
  }

  G.Script.def({
    'jvr.rival': [['js', rival]],
    'jvr.plateau': [['js', plateau]]
  });
})();
