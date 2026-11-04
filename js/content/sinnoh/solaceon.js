/* ============ solaceon.js — Route 209, Solaceon Town and its ruins, Route 210 (south) ============
 * Chapter 48. Route 209 runs east from Hearthome City (open with the Relic Badge, hearthome.js), over a
 * river and north to Solaceon Town: a Pokémon Center, a Mart, a house and a Day Care (the same couple's
 * scripts as Route 34's: there is one Day Care in the save, so a Pokémon left in Solaceon can be taken
 * back in Johto and the other way round). Solaceon Ruins, south-east of town: a chamber of carved letters
 * where wild Unown of every letter float (G.Ruins.wildForm, johto/ruins.js). Route 210 north of town:
 * a crowd of Psyduck blocks the way north until Cynthia's Secret Potion cures them (chapter 50: she gives it at
 * Valor Lakefront, and here the Old Charm; flag psyduck-cured); the way east is Route 215 (veilstone.js).
 * Platinum's wild Pokémon.
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const CYNTHIA = { name: 'Cynthia' };
  const HOUSE = ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb__p______', '___________', '____ttt____', '____ttt____', '___________', '____X______'];

  // ---------------- Route 209 ----------------
  G.Maps.def(Object.assign({
    id: 'route209', loc: 'sinnoh-route-209', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTT,,TTTTTTTTTTT',
      'T.........~~~......,,..........T',
      'T.""""""".~~~."""".,,."""""""..T',
      'T.""""""".~~~."""".,,."""""""..T',
      'T.""""""".~~~."""".,,."""""""..T',
      'T.""""""".~~~."""".,,."""""""..T',
      'T.""""""".~~~."""".,,."""""""..T',
      'T.""""""".~~~."""".,,."""""""..T',
      'T.........~~~."""".,,."""""""..T',
      'T.........~~~......,,..........T',
      ',,,,,,,,,,===,,,,,,,,..........T',
      'T,,,,,,,,,===,,,,,,,,..........T',
      'T.........~~~.........S........T',
      'T.........~~~..........."""""".T',
      'T.""""""".~~~."""""""""."""""".T',
      'T.""""""".~~~."""""""""."""""".T',
      'T.""""""".~~~."""""""""."""""".T',
      'T.""""""".~~~."""""""""."""""".T',
      'T.""""""".~~~."""""""""."""""".T',
      'T.""""""".~~~."""""""""."""""".T',
      'T.""""""".~~~."""""""""."""""".T',
      'T.........~~~..........."""""".T',
      'T.........~~~..........."""""".T',
      'T.""""""".~~~..................T',
      'T.""""""".~~~............TTTT..T',
      'T.""""""".~~~............TTTT..T',
      'T.""""""".~~~............TTTT..T',
      'T.""""""".~~~............TTTT..T',
      'T.........~~~..................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'hearthome', offset: -3 }, north: { map: 'solaceon', offset: 4 } },
    signs: { '22,12': 'Route 209. North: Solaceon Town. West: Hearthome City.' },
    trainers: [
      { id: 'summer', who: 'lass', cls: 'picnicker', name: 'Summer', x: 6, y: 9, dir: 'down', sight: 1, team: [['roselia', 21], ['marill', 21]],
        before: 'The river here is so pretty. Battling beside it is even better!',
        defeat: 'At least the view is nice.',
        after: 'Marill float on the river like little balloons. So cute!' },
      { id: 'carl', who: 'fisherman', cls: 'fisherman', name: 'Carl', x: 13, y: 9, dir: 'down', sight: 1, team: [['magikarp', 21], ['shellos', 22]],
        before: 'Nothing is biting today. You will have to do!',
        defeat: 'Still nothing biting...',
        after: 'The best fishing spot is under the bridge. Do not tell anyone.' },
      { id: 'terry', who: 'camper', cls: 'camper', name: 'Terry', x: 15, y: 12, dir: 'up', sight: 1, team: [['ponyta', 22], ['staravia', 22]],
        before: 'I am camping my way to Solaceon. Battle me on the road!',
        defeat: 'Back to walking, then.',
        after: 'Solaceon has a Day Care. You can leave a Pokémon there while you travel.' },
      { id: 'cindy', who: 'pokefan', cls: 'pokefan', name: 'Cindy', x: 21, y: 5, dir: 'left', sight: 1, team: [['clefairy', 23], ['bibarel', 22]],
        before: 'My Pokémon are the cutest in Sinnoh. Let me show you!',
        defeat: 'Cute and strong are not the same thing...',
        after: 'Did you know Clefairy dance under the full moon on Mt. Coronet?' }
    ],
    encounters: { walk: '@sinnoh-route-209-area', water: '@sinnoh-route-209-area' }
  }, SINNOH));

  // ---------------- Solaceon Town ----------------
  G.Maps.def(Object.assign({
    id: 'solaceon', loc: 'solaceon-town', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
    fly: { spot: 'center-door' },
    rows: [
      'TTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTT',
      'T..............,,..............T',
      'T..............,,...HHHH.......T',
      'T...CCCCC......,,...HHHH.......T',
      'T...CCCCC.MMMM.,,...HDHH.......T',
      'T...CCCCC.MMMM.,,,,............T',
      'T...CCDCC.MDMM.,,..FFFFFFFFFF..T',
      'T.....,....,...,,..F........F..T',
      'T.fff.,....,...,,..F........F..T',
      'T.fff.,....,...,,..F........F..T',
      'T.fff.,....,.S.,,..FFFFFFFFFF..T',
      'T.....,....,...,,..............T',
      'T..,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T..,,,,,,,,,,,,,,,,,,,,,,,,,,..T',
      'T..............,,.........ffff.T',
      'T........ffff..,,..............T',
      'T........ffff..,,....########..T',
      'T...HHHH.ffff..,,....########..T',
      'T...HHHH.ffff..,,....########..T',
      'T...HDHH.......,,....########..T',
      'T....,,,,,,,,,,,,....########..T',
      'T..............,,...S###O####..T',
      'T..............,,,,,,,,,,......T',
      'T..............,,..............T',
      'T..............,,..............T',
      'TTTTTTTTTTTTTTT,,TTTTTTTTTTTTTTT'
    ],
    connect: { south: { map: 'route209', offset: -4 }, north: { map: 'route210s', offset: 6 } },
    warps: [
      { x: 6, y: 6, to: 'solaceon-center', spot: 'door' },
      { x: 11, y: 6, to: 'solaceon-mart', spot: 'door' },
      { x: 21, y: 4, to: 'solaceon-daycare', spot: 'door' },
      { x: 5, y: 19, to: 'solaceon-house', spot: 'door' },
      { x: 24, y: 21, to: 'solaceon-ruins', spot: 'door' }
    ],
    spots: { 'center-door': [6, 7, 'down'], 'mart-door': [11, 7, 'down'], 'daycare-door': [21, 5, 'down'], 'house-door': [5, 20, 'down'],
             ruins: [24, 22, 'down'] },
    signs: { '13,10': 'Solaceon Town. A quiet town where people and Pokémon live at an easy pace.',
             '20,21': 'Solaceon Ruins. Please do not touch the carvings.' },
    npcs: [
      { id: 'oldman', who: 'oldman', x: 24, y: 5, dir: 'down', script: 'daycare.man' },
      { id: 'girl', who: 'lass', x: 20, y: 15, move: 'look',
        say: 'Strange letter Pokémon float around inside the ruins. Every one of them has a different shape!' },
      { id: 'man', who: 'gentleman', x: 9, y: 14, move: 'wander', r: 2,
        say: 'Life here is slow and peaceful. That is just how we like it in Solaceon.' }
    ]
  }, SINNOH));

  G.Maps.center('solaceon-center', {
    loc: 'solaceon-town', exit: { map: 'solaceon', spot: 'center-door' },
    npcs: [{ id: 'girl', who: 'lass', x: 3, y: 5, move: 'look',
             say: 'Veilstone City is east of Route 210. Its Gym Leader, Maylene, fights with her own fists... and Fighting-type Pokémon!' }]
  }).region = 'sinnoh';

  G.Maps.mart('solaceon-mart', {
    loc: 'solaceon-town', exit: { map: 'solaceon', spot: 'mart-door' },
    stock: ['poke-ball', 'great-ball', 'ultra-ball', 'potion', 'super-potion', 'hyper-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'full-heal', 'escape-rope', 'repel', 'super-repel'],
    npcs: [{ id: 'shopper', who: 'granny', x: 6, y: 5, move: 'look',
             say: 'It rains all the time on Route 215. Fire moves are weaker in the rain, you know.' }]
  }).region = 'sinnoh';

  G.Maps.def(Object.assign({
    id: 'solaceon-daycare', loc: 'solaceon-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'solaceon', spot: 'daycare-door' }],
    spots: { door: [4, 7, 'up'] },
    signs: { '0,2': 'A note on the shelf: "Our cousins run the Day Care on Route 34 in Johto. A Pokémon left with one of us can be picked up at either!"',
             '1,2': 'A note on the shelf: "Our cousins run the Day Care on Route 34 in Johto. A Pokémon left with one of us can be picked up at either!"' },
    npcs: [{ id: 'lady', who: 'granny', x: 7, y: 4, dir: 'left', script: 'daycare.lady' }]
  }, SINNOH));

  G.Maps.def(Object.assign({
    id: 'solaceon-house', loc: 'solaceon-town', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
    rows: HOUSE,
    warps: [{ x: 4, y: 7, to: 'solaceon', spot: 'house-door' }],
    spots: { door: [4, 7, 'up'] },
    npcs: [{ id: 'boy', who: 'youngster', x: 7, y: 4, dir: 'left',
             say: 'Grandpa says the ruins are older than any town in Sinnoh. Nobody knows who carved those letters.' }]
  }, SINNOH));

  // ---------------- Solaceon Ruins ----------------
  G.Maps.def(Object.assign({
    id: 'solaceon-ruins', loc: 'solaceon-ruins', tileset: 'indoor', palette: 'ruins', music: 'cave', battleBg: 'cave', cave: true, escape: true,
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', '+++++++++++++', '++W+++++++W++', '+++++++++++++', '+++++W+W+++++', '+++++++++++++', '++W+++++++W++',
           '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 9, to: 'solaceon', spot: 'ruins' }],
    spots: { door: [6, 9, 'up'] },
    signs: { '6,1': 'Letters are carved all over the wall. Together they seem to say: "Every life began from one, and every thread still leads back to it."' },
    items: [{ x: 11, y: 2, item: 'ultra-ball', flag: 'solaceon-ruins-ball' }],
    encounters: { walk: '@solaceon-ruins-1f' }
  }, SINNOH));

  // ---------------- Route 210, south ----------------
  G.Maps.def(Object.assign({
    id: 'route210s', loc: 'sinnoh-route-210', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTT,,TTTTTTTTT',
      'T........,,........T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T........,,."""""".T',
      'T........,,."""""".T',
      'T."""""".,,........T',
      'T."""""".,,........T',
      'T."""""".,,,,,,,,,,,',
      'T."""""".,,,,,,,,,,,',
      'T."""""".,,........T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T."""""".,,."""""".T',
      'T........,,."""""".T',
      'T........,,."""""".T',
      'T........,,S"""""".T',
      'T........,,........T',
      'TTTTTTTTT,,TTTTTTTTT'
    ],
    connect: { south: { map: 'solaceon', offset: -6 }, east: { map: 'route215', offset: 5 }, north: { map: 'route210n', offset: -25 } },
    signs: { '11,21': 'Route 210. South: Solaceon Town. East: Route 215 and Veilstone City.' },
    npcs: [
      // The way north opens with Cynthia's Secret Potion (chapter 50).
      { id: 'psyduck1', who: 'psyduck', mon: 'psyduck', x: 9, y: 1, dir: 'down', fixed: true, if: '!psyduck-cured', script: 'route210.psyduck' },
      { id: 'psyduck2', who: 'psyduck', mon: 'psyduck', x: 10, y: 1, dir: 'down', fixed: true, if: '!psyduck-cured', script: 'route210.psyduck' },
      { id: 'cynthia', who: 'cynthia', x: 9, y: 6, dir: 'up', if: 'scripted' }
    ],
    trainers: [
      { id: 'joel', who: 'psychic', cls: 'psychic', name: 'Joel', x: 8, y: 6, dir: 'right', sight: 1, team: [['kadabra', 23]],
        before: 'I bent a spoon this morning. Now I will bend your will!',
        defeat: 'My spoon is straight again...',
        after: 'Those Psyduck up north have terrible headaches. Something must be bothering them.' },
      { id: 'dana', who: 'cooltrainer', cls: 'cooltrainer-f', name: 'Dana', x: 11, y: 9, dir: 'left', sight: 1, team: [['staravia', 23], ['luxio', 24]],
        before: 'A Champion of three regions? I have been waiting for someone like you!',
        defeat: 'Worth the wait.',
        after: 'Maylene in Veilstone is strong. Bring Flying or Psychic moves.' },
      { id: 'ramon', who: 'camper', cls: 'camper', name: 'Ramon', x: 8, y: 16, dir: 'right', sight: 1, team: [['geodude', 22], ['ponyta', 23]],
        before: 'This route is all grass and hills. Perfect for training!',
        defeat: 'More training needed.',
        after: 'East of here is Route 215. Bring an umbrella. It never stops raining.' }
    ],
    encounters: { walk: '@sinnoh-route-210-south-towards-solaceon-town' }
  }, SINNOH));

  /** The Psyduck: Cynthia's Secret Potion cures them, and she asks you to take the Old Charm to Celestic Town. */
  async function psyduck(h) {
    const F = G.Field, me = G.World.player;
    await h.say(T('A crowd of Psyduck is holding its heads and blocking the path. They will not budge.'));
    if (!F.flag('cynthia-potion') || !F.count('secret-potion')) return;
    const vars = { item: G.Names.item('secret-potion') };
    if (await h.choice(T('Give them the {item}?'), { vars }) !== 0) return;
    F.takeItem('secret-potion', 1);
    await h.fade('out', 0.3);
    F.setFlag('psyduck-cured');
    await h.fade('in', 0.3);
    await h.say(T('The Psyduck stopped holding their heads and waddled away, quacking happily!'));
    if (me) h.place('cynthia', me.x, me.y + 3, 'up');
    h.show('cynthia');
    if (me) { await h.walkTo('cynthia', me.x, me.y + 1); h.face('cynthia', 'up'); h.face('player', 'down'); }
    await h.say(T('You cured them! Thank you, {player}. The road north is open again.'), CYNTHIA);
    await h.say(T('Could I ask one more favor? This Old Charm belongs to my grandmother, the elder of Celestic Town, past the fog to the west.'), CYNTHIA);
    F.giveItem('old-charm', 1);
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('old-charm') } });
    await j;
    await h.say(T('I hear Team Galactic has been seen near the ruins there. Please be careful.'), CYNTHIA);
    h.hide('cynthia');
  }

  G.Script.def({ 'route210.psyduck': [['js', psyduck]] });
})();
