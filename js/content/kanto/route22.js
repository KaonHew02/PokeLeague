/* ============ route22.js — Route 22: west of Viridian City ============
 * Tall grass with Rattata, Mankey and Spearow (the games' FireRed table): Mankey's
 * Low Kick is what helps a Charmander against Brock. Once you have the Pokédex the
 * rival waits here for an optional battle (Pidgey Lv. 9 and his starter Lv. 8, as in
 * the games). The Pokémon League gate at the far end stays shut without eight badges; with
 * them it opens on Route 23 (victory.js), and the rival is back for a second battle in front of it
 * (chapter 9, flag route22-rival2).
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
  warps: [{ x: 3, y: 3, to: 'route22-gate', spot: 'west', if: 'badges>=8', locked: 'route22.gate' }],
  spots: { east: [28, 5, 'left'], 'gate-door': [3, 4, 'down'] },
  signs: {
    '8,3': 'Pokémon League Front Gate',
    '21,8': 'Route 22. West: the Pokémon League. East: Viridian City.'
  },
  npcs: [
    { id: 'rival', who: 'rival', x: 27, y: 7, dir: 'left', if: 'scripted' }
  ],
  triggers: [
    { x: 26, y: 4, w: 1, h: 3, if: ['has-pokedex', '!route22-rival', 'badges<8'], script: 'route22.rival' },
    { x: 7, y: 4, w: 1, h: 3, if: ['badges>=8', '!route22-rival2'], script: 'route22.rival2' }
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

  const FINAL = { 1: 3, 4: 6, 7: 9 };
  // The rival's team after the starter he picked, as in the games (a few levels lower; no Horn Drill).
  const MIDDLE = { 1: [['gyarados', 45, ['hydro-pump', 'bite', 'dragon-rage', 'leer']], ['arcanine', 45, ['flamethrower', 'take-down', 'bite', 'roar']]],
                   4: [['exeggutor', 45, ['egg-bomb', 'confusion', 'stomp', 'leech-seed']], ['gyarados', 45, ['hydro-pump', 'bite', 'dragon-rage', 'leer']]],
                   7: [['arcanine', 45, ['flamethrower', 'take-down', 'bite', 'roar']], ['exeggutor', 45, ['egg-bomb', 'confusion', 'stomp', 'leech-seed']]] };

  /** Eight badges: the rival is back, in front of the League gate. */
  async function rival2(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('route22-rival2');
    await h.say(T('Hold it, {player}!'), RIVAL);
    h.place('rival', me.x + 2, me.y, 'left');
    h.show('rival');
    await h.walkTo('rival', me.x + 1, me.y);
    h.face('player', 'right');
    await h.say(T("So you got all eight badges too? Heh. Then we're both heading for the Pokémon League."), RIVAL);
    await h.say(T("But only one of us gets to be Champion. Let's settle this right here!"), RIVAL);
    const st = S.rival.starter;
    const out = await h.battle({ id: 'rival-22b', who: 'rival', name: S.rival.name, prize: 50, ai: 'leader',
      team: [['pidgeot', 46, ['wing-attack', 'quick-attack', 'whirlwind', 'sand-attack']], ['rhyhorn', 44, ['stomp', 'take-down', 'fury-attack', 'scary-face']],
             ...(MIDDLE[st] || MIDDLE[1]), ['alakazam', 46, ['psychic', 'future-sight', 'reflect', 'disable']], [FINAL[st] || 3, 50]] }, {});
    if (out === 'lose') return;
    await h.say(T("Tch! Fine, you win this one. But the Elite Four are nothing like Gym Leaders. They'll crush you!"), RIVAL);
    await h.say(T("I'm going on ahead. See you at the top, {player}!"), RIVAL);
    await h.walkTo('rival', 3, 4);
    h.hide('rival');
  }

  G.Script.def({
    'route22.rival': [['js', rival]],
    'route22.rival2': [['js', rival2]],
    'route22.gate': [
      ['say', 'The gate to the Pokémon League. A guard calls out from inside:'],
      ['say', 'Only Trainers who have all eight Gym Badges may pass. Come back when you have them!']
    ]
  });
})();
