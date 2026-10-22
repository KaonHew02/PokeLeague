/* ============ route22.js — Route 22: west of Viridian City ============
 * Tall grass with Rattata, Mankey and Spearow (the games' FireRed table): Mankey's
 * Low Kick is what helps a Charmander against Brock. Once you have the Pokédex the
 * rival waits here for an optional battle (Pidgey Lv. 9 and his starter Lv. 8, as in
 * the games). The Pokémon League gate at the far end stays shut without eight badges.
 */
G.Maps.def({
  id: 'route22', loc: 'kanto-route-22', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T.HHHH........"""""""........T',
    'T.HHHH........"""""""........T',
    'T.HDHH..S.TTT.""""""".......TT',
    'T..,.....TTT..........""""...T',
    'T..,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'T.....""""""......""""".....TT',
    'T.....""""""......"""""......T',
    'T.......TT...........S.......T',
    'T..""""".........""""........T',
    'T..""""".........""""........T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'viridian', offset: -4 } },
  warps: [{ x: 3, y: 3, locked: 'route22.gate' }],
  spots: { east: [28, 5, 'left'] },
  signs: {
    '8,3': 'Pokémon League Front Gate',
    '21,8': 'Route 22. West: the Pokémon League. East: Viridian City.'
  },
  npcs: [
    { id: 'rival', who: 'rival', x: 27, y: 7, dir: 'left', if: 'scripted' }
  ],
  triggers: [
    { x: 26, y: 4, w: 1, h: 3, if: ['has-pokedex', '!route22-rival'], script: 'route22.rival' }
  ],
  encounters: { walk: '@kanto-route-22-area' }
});

(() => {
  const T = s => G.T(s);
  const RIVAL = { name: '{rival}' };

  /** The rival catches up with you: an optional battle (losing blacks out, as usual). */
  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('route22-rival');
    await h.say(T("Hey, {player}! Heading for the Pokémon League already?"), RIVAL);
    h.place('rival', me.x + 2, me.y, 'left');
    h.show('rival');
    await h.walkTo('rival', me.x + 1, me.y);
    h.face('player', 'right');
    await h.say(T("I caught a few more Pokémon since the lab. Let's see if you've been training too!"), RIVAL);
    const out = await h.battle({ id: 'rival-22', who: 'rival', name: S.rival.name, prize: 35, ai: 'basic',
                                 team: [['pidgey', 9], [S.rival.starter || 7, 8]] }, {});
    if (out !== 'lose') {
      await h.say(T("Tch! Lucky win. I'm heading for Pewter City. Its Gym Leader won't go easy on you!"), RIVAL);
      await h.walkTo('rival', me.x + 3, me.y);
      h.hide('rival');
    }
  }

  G.Script.def({
    'route22.rival': [['js', rival]],
    'route22.gate': [
      ['say', 'The gate to the Pokémon League. A guard calls out from inside:'],
      ['say', 'Only Trainers who have all eight Gym Badges may pass. Come back when you have them!']
    ]
  });
})();
