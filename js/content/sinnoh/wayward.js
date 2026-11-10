/* ============ wayward.js — Wayward Cave and Mira ============
 * Chapter 65. Under the Cycling Road (Route 206, tgeterna.js) two mouths open in the trees of the south end. The east
 * one goes into the main cave: dark (Flash), in at the top, down past cracked rocks (Rock Smash) and two ledges to a
 * chamber where Mira is lost. She asks you to take her out (flag mira-along): she walks behind you (`companion`), fights
 * beside you against the pairs of Trainers (`ally`, a multi battle; without her they are plain double battles) and heals
 * the team after each battle (`afterBattle`). The ledges cannot be climbed, so the way back is one of the two long ways
 * up, past the Trainers, to the hall by the mouth, where she thanks you and goes (flag mira-done). The west mouth goes
 * into the hidden cave, where Gible lives. Platinum's Trainers (Lv. 19-22), their teams paired by me (the sources only say
 * they may be battled in pairs with Mira), and wild Pokémon. Once she is out, Mira comes to the Battleground
 * (battleground.js). The chapter ends (`ending(65)`) when you bring her out after chapter 64; a player who brought her out
 * in the middle of the game sees it later, from the Battleground's clerk. Left out: the hidden cave's Bicycle slopes, the
 * Dowsing Machine's items, the shards and the Grip Claw (not in the game).
 */
(() => {
  const T = s => G.T(s);
  const SINNOH = { region: 'sinnoh' };
  const DARK = { loc: 'wayward-cave', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, dark: true, escape: true };
  const MIRA = { name: 'Mira' };
  const MIRA_TEAM = [['kadabra', 26, ['confusion', 'shock-wave', 'flash', 'kinesis']]];
  const PAIR = { cls: 'double-team', sight: 2, double: true };

  // ---------------- The main cave ----------------
  G.Maps.def(Object.assign({
    id: 'wayward-cave', rows: [
      '###############O################',
      '###########.........############',
      '#########.>.........<.##########',
      '#########.#.........#.##########',
      '#########.#.........#.##########',
      '#########.####kkk####.##########',
      '###.......####...####........###',
      '###.......####...####........###',
      '###.......####...####........###',
      '###...########vvv#########...###',
      '###...########...#########...###',
      '###...########...##......#...###',
      '###...##.....#...##..........###',
      '###...##.....#...##......#...###',
      '###..........#...##......#...###',
      '###...##.....#vvv#########...###',
      '###...##.....#...#########...###',
      '###...########...#########...###',
      '###...########...#########...###',
      '###...########...#########...###',
      '###...########...#########...###',
      '###...#..................#...###',
      '###...#..................#...###',
      '###...#..................#...###',
      '###...#......................###',
      '###...#......................###',
      '##.......................#...###',
      '##.......................#######',
      '##.....#########################',
      '################################'
    ],
    ally: { if: 'mira-along', name: 'Mira', team: MIRA_TEAM },
    companion: { if: 'mira-along', who: 'mira', name: 'Mira', say: 'It is so dark in here. Please do not go too fast!' },
    afterBattle: { if: 'mira-along', script: 'wayward.heal' },
    encounters: { walk: '@wayward-cave-1f' },
    warps: [{ x: 15, y: 0, to: 'route206', spot: 'wayward' }],
    spots: { mouth: [15, 1, 'down'] },
    triggers: [{ x: 11, y: 2, w: 9, h: 3, if: 'mira-along', script: 'wayward.mira-bye' }],
    items: [{ x: 2, y: 28, item: 'tm32', flag: 'wayward-tm32' }, { x: 11, y: 1, item: 'escape-rope', flag: 'wayward-rope' },
            { x: 9, y: 14, item: 'rare-candy', flag: 'wayward-candy' }, { x: 23, y: 12, item: 'revive', flag: 'wayward-revive' }],
    npcs: [{ id: 'mira', who: 'mira', x: 22, y: 22, dir: 'down', if: '!mira-met', script: 'wayward.mira' }],
    trainers: [
      Object.assign({ id: 'reginald-lorenzo', who: 'hiker', name: 'Reginald & Lorenzo', x: 3, y: 22, dir: 'right', partner: { who: 'hiker', x: 3, y: 21, dir: 'right' },
        before: 'Two Hikers in a cave. This is where we feel at home!',
        defeat: 'Home is where you lose, apparently.',
        after: 'This cave goes round and round. Keep heading up and you will find the way out.',
        team: [['geodude', 20, ['rock-polish', 'rock-throw', 'magnitude', 'self-destruct']], ['onix', 22, ['rock-throw', 'rage', 'rock-tomb', 'sandstorm']],
               ['geodude', 20, ['rock-polish', 'rock-throw', 'magnitude', 'self-destruct']]] }, PAIR),
      Object.assign({ id: 'cassidy-wayne', who: 'lass', name: 'Cassidy & Wayne', x: 5, y: 13, dir: 'left', partner: { who: 'youngster', x: 5, y: 12, dir: 'left' },
        before: 'We got lost together, so we might as well battle together!',
        defeat: 'Lost and beaten. What a day.',
        after: 'If you see a girl with pink hair, she was looking for the way out too.',
        team: [['buneary', 22, ['foresight', 'endure', 'frustration', 'quick-attack']], ['shellos', 20, ['harden', 'water-pulse', 'mud-bomb', 'hidden-power']],
               ['ponyta', 20, ['tail-whip', 'ember', 'flame-wheel', 'stomp']]] }, PAIR),
      Object.assign({ id: 'tori-diego', who: 'lass', name: 'Tori & Diego', x: 7, y: 8, dir: 'up', partner: { who: 'camper', x: 8, y: 8, dir: 'up' },
        before: 'We came in here for a picnic. It was too dark to see the sandwiches!',
        defeat: 'At least we can see who won.',
        after: 'The mouth is just up there. You can feel the breeze.',
        team: [['psyduck', 22, ['water-gun', 'disable', 'confusion', 'water-pulse']], ['aipom', 22, ['baton-pass', 'tickle', 'fury-swipes', 'swift']]] }, PAIR),
      Object.assign({ id: 'ana-parker', who: 'lass', name: 'Ana & Parker', x: 28, y: 18, dir: 'left', partner: { who: 'camper', x: 28, y: 17, dir: 'left' },
        before: 'Camping in a cave is the best. No rain, no sun, no way out!',
        defeat: 'Not the best, then.',
        after: 'We have been in here three days. We are fine. Probably.',
        team: [['hoothoot', 22, ['peck', 'uproar', 'reflect', 'confusion']], ['buizel', 20, ['water-gun', 'swift', 'quick-attack']],
               ['shinx', 20, ['spark', 'bite']]] }, PAIR),
      Object.assign({ id: 'terry-gerald', who: 'pokemaniac', name: 'Terry & Gerald', x: 24, y: 8, dir: 'up', partner: { who: 'hiker', x: 25, y: 8, dir: 'up' },
        before: 'A collector and a ruin maniac. We both came looking for something rare!',
        defeat: 'Rare, and strong. That was you.',
        after: 'There is another cave under the Cycling Road. That is where the rare one lives.',
        team: [['gible', 22, ['dragon-rage', 'sandstorm', 'take-down', 'sand-tomb']], ['geodude', 19, ['rock-polish', 'rock-throw', 'magnitude', 'self-destruct']],
               ['bronzor', 21, ['hypnosis', 'imprison', 'confuse-ray', 'extrasensory']]] }, PAIR)
    ]
  }, DARK, SINNOH));

  // ---------------- The hidden cave ----------------
  G.Maps.def(Object.assign({
    id: 'wayward-hidden', rows: [
      '###########O############',
      '#########.....##########',
      '#########.....##########',
      '#########.....##########',
      '#########.....##########',
      '#########.....##########',
      '##########...###########',
      '##########...###########',
      '##########...###########',
      '###..................###',
      '###..................###',
      '###..................###',
      '###..................###',
      '###..................###',
      '###...###########....###',
      '###...###########....###',
      '###...###########....###',
      '###..................###',
      '###..................###',
      '###..................###',
      '#################....###',
      '########################'
    ],
    encounters: { walk: '@wayward-cave-b1f' },
    warps: [{ x: 11, y: 0, to: 'route206', spot: 'hidden' }],
    spots: { mouth: [11, 1, 'down'] },
    items: [{ x: 18, y: 20, item: 'tm26', flag: 'wayward-tm26' }, { x: 4, y: 19, item: 'stardust', flag: 'wayward-stardust' },
            { x: 19, y: 9, item: 'max-ether', flag: 'wayward-ether' }, { x: 9, y: 1, item: 'rare-candy', flag: 'wayward-candy2' }]
  }, DARK, SINNOH));

  // ---------------- Mira ----------------
  async function mira(h) {
    const F = G.Field, W = G.World;
    if (F.flag('mira-met')) return;
    h.face('mira', 'player');
    await h.say(T('Oh! Somebody is here! I am Mira. I came in to look for strong Pokémon, and now I cannot find the way out.'), MIRA);
    await h.say(T('Please, can I come with you? My Kadabra and I will help in battles, and I will look after your team!'), MIRA);
    h.hide('mira');
    F.setFlag('mira-met');
    F.setFlag('mira-along');
    if (W.makeFollower) W.makeFollower();
  }

  async function bye(h) {
    const F = G.Field, W = G.World, me = W.player;
    if (!F.flag('mira-along')) return;
    if (me) { h.place('mira', me.x + (me.x < 15 ? 1 : -1), me.y, me.x < 15 ? 'left' : 'right'); h.show('mira'); }
    F.clearFlag('mira-along');
    if (W.makeFollower) W.makeFollower();
    await h.say(T('The way out! I can feel the wind! Thank you, thank you!'), MIRA);
    await h.say(T('I will train until I am never lost again, in caves or in battles. One day I will battle you, and then you will see.'), MIRA);
    await h.fade('out', 0.3);
    h.hide('mira');
    await h.fade('in', 0.3);
    F.setFlag('mira-done');
    if (!F.flag('chapter-64-done') || F.flag('chapter-65-done')) return;
    // The end of the sixty-fifth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(65); else F.setFlag('chapter-65-done');
  }

  G.Wayward = { MIRA_TEAM };
  G.Script.def({
    'wayward.mira': [['js', mira]],
    'wayward.mira-bye': [['js', bye]],
    'wayward.heal': [['healAnim'], ['heal'], ['say', 'Mira looked after your Pokémon. They are fully healed!']]
  });
})();
