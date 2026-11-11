/* ============ b1f.js — Mt. Coronet B1F and Victory Road's inner B1F ============
 * Chapter 74, two lakes under the mountains.
 * - Mt. Coronet B1F (`coronet-b1f`): from the tunnel of Route 211 (route211.js) a boulder (Strength) opens a small
 *   room with the ladder down, as in Platinum (the Celestic Town side). Fog (only how it looks), a lake to Surf on with
 *   two islands and an east shore you reach only by water, a cracked rock (Rock Smash) before a pocket, Platinum's eight
 *   floor items and two of its Dowsing Machine's (hidden). Platinum's wild Pokémon by time of day, Surf and the rods, and
 *   Feebas: four tiles of the lake a day (`feebasTiles`, field.js), where half the bites are Feebas whatever the rod.
 *   A fisherman on the shore says so.
 * - Victory Road's inner B1F (`victory-inside-b1f`): a ladder in a notch of the inner Victory Road's west corridor
 *   (route224.js) goes down to a cold lake (PokeAPI's table for that floor). Its three items are those Platinum's
 *   Dowsing Machine finds in this part of Victory Road (hidden). No Trainers: the ones Serebii lists for this part are
 *   all in route224.js already (chapter 67).
 * The first time you reach each shore (flags coronet-lake, victory-lake) you are told about the lake, and about the
 * other one if you have not seen it; with both seen and chapter 73 done, the second shore ends the chapter
 * (`ending(74)`). Mt. Coronet B1F can be reached in the middle of the game: there it only sets its flag.
 * The layouts were checked by scratchpad c74_maps.py; they and the words are mine.
 * Left out: the shards and the Heart Scale (not in the game), Defog (the fog is only how it looks), the Poké Radar.
 */
(() => {
  const T = s => G.T(s);
  const CAVE = { tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true, region: 'sinnoh' };

  // ---------------- Mt. Coronet B1F ----------------
  G.Maps.def(Object.assign({
    id: 'coronet-b1f', loc: 'mt-coronet', fog: true, feebasTiles: 4,
    rows: [
      '##############################',
      '##############################',
      '##%.......####################',
      '##........####################',
      '##........####################',
      '#####...######################',
      '##................############',
      '##...~~~~~~~~~~~~~.....#######',
      '##...~~~~~~~~~~~~~~....#######',
      '###..~~~..~~~~~~~~~....#######',
      '#.#..~~~..~~~~~~~~~~...#######',
      '#k...~~~~~~~~..~~~~~...#######',
      '##...~~~~~~~~..~~~~~...#######',
      '##....~~~~~~~~~~~~~~##########',
      '##.....~~~~~~~~~~~~~..########',
      '##.........~~~~~~~~~..########',
      '##.........~~~~~~~~~..########',
      '#########..........###########',
      '##############################',
      '##############################'
    ],
    encounters: { walk: '@mt-coronet-b1f' },
    warps: [{ x: 2, y: 2, to: 'coronet-211', spot: 'ladder' }],
    spots: { ladder: [2, 3, 'down'] },
    triggers: [{ x: 5, y: 5, w: 3, h: 1, if: '!chapter-74-done', script: 'b1f.coronet' }],
    npcs: [{ id: 'fisher', who: 'fisherman', x: 3, y: 8, dir: 'right', script: 'b1f.fisher' }],
    items: [
      { x: 8, y: 9, item: 'tm69', flag: 'coronetb1f-tm69' }, { x: 13, y: 11, item: 'rare-candy', flag: 'coronetb1f-candy' },
      { x: 22, y: 7, item: 'ultra-ball', flag: 'coronetb1f-ultra' }, { x: 17, y: 17, item: 'revive', flag: 'coronetb1f-revive' },
      { x: 21, y: 12, item: 'full-restore', flag: 'coronetb1f-restore' }, { x: 21, y: 15, item: 'max-elixir', flag: 'coronetb1f-elixir' },
      { x: 2, y: 16, item: 'soft-sand', flag: 'coronetb1f-sand' }, { x: 1, y: 10, item: 'light-clay', flag: 'coronetb1f-clay' },
      { x: 23, y: 9, item: 'star-piece', flag: 'coronetb1f-star', hidden: true },
      { x: 1, y: 15, item: 'rare-candy', flag: 'coronetb1f-candy2', hidden: true }
    ]
  }, CAVE));

  // ---------------- Victory Road, the inner B1F ----------------
  // Marley (chapter 67) walks with you here too, and heals after a battle, as on the floor above (route224.js).
  G.Maps.def(Object.assign({
    id: 'victory-inside-b1f', loc: 'sinnoh-victory-road',
    rows: [
      '##############################',
      '##############################',
      '##%......#####################',
      '##.......#####################',
      '####...#######################',
      '##..........................##',
      '##...~~~~~~~~~~~~~~~~~~~~...##',
      '##..~~~~~~~~~~~~~~~~~~~~~~..##',
      '##..~~~~~~~~~~~~~~~~~~~~~~..##',
      '##..~~~~~~~~~....~~~~~~~~~..##',
      '##..~~~~~~~~~....~~~~~~~~~..##',
      '##..~~~~~~~~~~~~~~~~~~~~~~..##',
      '##..~~~~~~~~~~~~~~~~~~~~~~..##',
      '##...~~~~~~~~~~~~~~~~~~~~...##',
      '####~~~~~~~~~~~~~~~~~~~~~~####',
      '###.~~~~~~~~~~~~~~~~~~~~~~.###',
      '###......##########.......####',
      '##############################',
      '##############################',
      '##############################'
    ],
    encounters: { walk: '@sinnoh-victory-road-inside-b1f' },
    warps: [{ x: 2, y: 2, to: 'victory-inside', spot: 'ladder' }],
    spots: { ladder: [2, 3, 'down'] },
    triggers: [{ x: 4, y: 4, w: 3, h: 1, if: '!chapter-74-done', script: 'b1f.victory' }],
    companion: { if: 'marley-along', who: 'marley', name: 'Marley', say: 'Arcanine knows the way by smell. I just follow Arcanine. And you.' },
    afterBattle: { if: 'marley-along', script: 'r224.heal' },
    items: [
      { x: 14, y: 9, item: 'ultra-ball', flag: 'vinsideb1f-ultra', hidden: true },
      { x: 4, y: 16, item: 'rare-candy', flag: 'vinsideb1f-candy', hidden: true },
      { x: 26, y: 16, item: 'hp-up', flag: 'vinsideb1f-hpup', hidden: true }
    ]
  }, CAVE));

  // ---------------- The two shores ----------------
  const LAKE = { coronet: 'coronet-lake', victory: 'victory-lake' };
  /** At a lake's shore: the first time, what it looks like (and where the other is); with both seen, the ending. */
  async function shore(h, here) {
    const F = G.Field, other = here === 'coronet' ? 'victory' : 'coronet';
    if (!F.flag(LAKE[here])) {
      F.setFlag(LAKE[here]);
      if (here === 'coronet') await h.say(T('Past the mist, a still lake fills the cave under Mt. Coronet. Now and then something splashes far out on the water.'));
      else await h.say(T('Below Victory Road the cave opens onto a cold, dark lake. The water is so still that it looks like a second ceiling.'));
      if (!F.flag(LAKE[other])) {
        if (here === 'coronet') await h.say(T('Travelers say there is another lake like this one, deep in Victory Road, past where most Trainers ever go.'));
        else await h.say(T('Travelers say there is another lake like this one under Mt. Coronet, below the tunnel of Route 211.'));
        return;
      }
    } else if (!F.flag(LAKE[other])) return;
    if (!F.flag('chapter-73-done') || F.flag('chapter-74-done')) return;
    await h.say(T('Two lakes under two mountains, and you have stood on the shore of both.'));
    // The end of the seventy-fourth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(74); else F.setFlag('chapter-74-done');
  }

  /** The fisherman on Mt. Coronet's lake: where Feebas is (and is not). */
  async function fisher(h) {
    const S = G.Field.save;
    if (S.dex && S.dex.caught && S.dex.caught[349]) {
      await h.say(T('You caught a Feebas here? Then the lake trusts you. I have been fishing it for three days and seen nothing but Magikarp.'));
      return;
    }
    await h.say(T('Feebas live in this lake, they say. But only on a few spots of the water, and the spots change every day.'));
    await h.say(T('Any rod will do. Cast once on every spot you can reach, and keep going. That is all the advice I have.'));
  }

  G.Script.def({
    'b1f.coronet': [['js', h => shore(h, 'coronet')]],
    'b1f.victory': [['js', h => shore(h, 'victory')]],
    'b1f.fisher': [['js', fisher]]
  });
})();
