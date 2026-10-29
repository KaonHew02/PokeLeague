/* ============ whirl.js — the Whirl Islands and Lugia ============
 * Chapter 22, after Ho-Oh. The elder in Ecruteak gives the Silver Wing (ecruteak.js, flag
 * silver-wing): a feather of the Brass Tower's guardian, which flew off to the sea when the tower
 * burned. An old sailor on Cianwood's beach teaches Whirlpool (a tutor here, as FireRed's HM06 is
 * Rock Smash; species field `tu`), and with the Glacier Badge it calms the whirlpools in front of
 * the four caves on Sea Route 41 (cianwood.js; outdoor tile `w`, field.js). Each island has a cave
 * (1F) with a ladder down to B1F: the north-east and south-west ones lead into its main cave, the
 * other two into small closed corners. B1F's ladder goes down to B2F, an underground lake (Surf):
 * Waterfall climbs its falls to a ledge whose ladder goes down to Lugia's chamber, B3F, once you
 * have the Silver Wing. Lugia: a wild battle, Lv. 45 (flag lugia-met; running or losing keeps it
 * there), then the chapter ends (`ending(22)`).
 */
(() => {
  const T = s => G.T(s);
  const WHIRL = { loc: 'whirl-islands', region: 'johto', tileset: 'outdoor', palette: 'whirl', music: 'cave', battleBg: 'cave', border: '#', escape: true };
  const SAILOR = { name: 'Old Sailor' };

  // ---------------- the four caves of 1F ----------------
  G.Maps.def(Object.assign({
    id: 'whirl-islands-nw', cave: true,
    rows: [
      '############',
      '##....::::##',
      '#.....::%:.#',
      '#..........#',
      '#...##.....#',
      '#.......##.#',
      '#..........#',
      '##........##',
      '#####O######',
      '############'
    ],
    warps: [{ x: 5, y: 8, to: 'route41', spot: 'whirl-nw' }, { x: 8, y: 2, to: 'whirl-islands-b1f', spot: 'nw' }],
    spots: { mouth: [5, 7, 'up'], ladder: [8, 2, 'down'] },
    items: [{ x: 2, y: 2, item: 'ultra-ball', flag: 'whirl-nw-ultraball' }],
    encounters: { walk: '@whirl-islands-1f' }
  }, WHIRL));

  G.Maps.def(Object.assign({
    id: 'whirl-islands-ne', cave: true,
    rows: [
      '##############',
      '#~~~~.......##',
      '#~~~~.....%..#',
      '#~~~~........#',
      '#.....##.....#',
      '#........:::.#',
      '#........:::.#',
      '#...........##',
      '#######O######',
      '##############'
    ],
    warps: [{ x: 7, y: 8, to: 'route41', spot: 'whirl-ne' }, { x: 10, y: 2, to: 'whirl-islands-b1f', spot: 'ne' }],
    spots: { mouth: [7, 7, 'up'], ladder: [10, 2, 'down'] },
    items: [{ x: 1, y: 6, item: 'big-pearl', flag: 'whirl-ne-bigpearl' }],
    encounters: { walk: '@whirl-islands-1f', water: '@whirl-islands-1f' }
  }, WHIRL));

  G.Maps.def(Object.assign({
    id: 'whirl-islands-sw', cave: true,
    rows: [
      '############',
      '#####O######',
      '##........##',
      '#..........#',
      '#......#...#',
      '#..##......#',
      '#.....::::.#',
      '#.....::%:.#',
      '#.....::::##',
      '############'
    ],
    warps: [{ x: 5, y: 1, to: 'route41', spot: 'whirl-sw' }, { x: 8, y: 7, to: 'whirl-islands-b1f', spot: 'sw' }],
    spots: { mouth: [5, 2, 'down'], ladder: [8, 7, 'down'] },
    items: [{ x: 1, y: 7, item: 'max-revive', flag: 'whirl-sw-maxrevive' }],
    encounters: { walk: '@whirl-islands-1f' }
  }, WHIRL));

  G.Maps.def(Object.assign({
    id: 'whirl-islands-se', cave: true,
    rows: [
      '############',
      '######O#####',
      '##........##',
      '#..........#',
      '#.......#..#',
      '#....##....#',
      '#::::......#',
      '#:%::......#',
      '##.........#',
      '############'
    ],
    warps: [{ x: 6, y: 1, to: 'route41', spot: 'whirl-se' }, { x: 2, y: 7, to: 'whirl-islands-b1f', spot: 'se' }],
    spots: { mouth: [6, 2, 'down'], ladder: [2, 7, 'down'] },
    items: [{ x: 10, y: 7, item: 'carbos', flag: 'whirl-se-carbos' }],
    encounters: { walk: '@whirl-islands-1f' }
  }, WHIRL));

  // ---------------- B1F: the main cave, and two closed corners ----------------
  G.Maps.def(Object.assign({
    id: 'whirl-islands-b1f', cave: true,
    rows: [
      '################################',
      '##......################.......#',
      '#..%....###############.....%..#',
      '#.......###############........#',
      '#.......###############........#',
      '#.......###############........#',
      '#......#################..######',
      '########################..######',
      '########################..######',
      '##########.....#............####',
      '##########....::::..........####',
      '##########....::::...#......####',
      '##########...###.......#########',
      '##########...###.......#########',
      '##########...###.......##......#',
      '##########...###...%...##......#',
      '##...........###.......##......#',
      '##...........############......#',
      '##.%.........############......#',
      '##..:::::....############....%.#',
      '#########################......#',
      '################################'
    ],
    warps: [
      { x: 3, y: 2, to: 'whirl-islands-nw', spot: 'ladder' },
      { x: 28, y: 2, to: 'whirl-islands-ne', spot: 'ladder' },
      { x: 3, y: 18, to: 'whirl-islands-sw', spot: 'ladder' },
      { x: 29, y: 19, to: 'whirl-islands-se', spot: 'ladder' },
      { x: 19, y: 15, to: 'whirl-islands-b2f', spot: 'ladder' }
    ],
    spots: { nw: [3, 2, 'down'], ne: [28, 2, 'down'], sw: [3, 18, 'down'], se: [29, 19, 'down'], down: [19, 15, 'down'] },
    items: [
      { x: 6, y: 5, item: 'calcium', flag: 'whirl-b1f-calcium' },
      { x: 11, y: 19, item: 'rare-candy', flag: 'whirl-b1f-rarecandy' },
      { x: 26, y: 15, item: 'full-restore', flag: 'whirl-b1f-fullrestore' }
    ],
    encounters: { walk: '@whirl-islands-b1f' }
  }, WHIRL));

  // ---------------- B2F: the underground lake and its falls ----------------
  G.Maps.def(Object.assign({
    id: 'whirl-islands-b2f', cave: true,
    rows: [
      '############################',
      '#.......########~~~~~~~....#',
      '#..%....########~~~~~~~..%.#',
      '#.......########~~~~~~~....#',
      '#.......###########|########',
      '#:::::::###########|########',
      '##~~~~~~~~~~~~~~~~~~~~~~~~##',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~##~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~#~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~:::~~~~~~~~~~~~~#',
      '#~~~~~~~~~~:::~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~##~~~~~~~~#',
      '#~~~~~#~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~~~~~~~~::::::~#',
      '#~~~~~~~~~~~~~~~~~~~::::::~#',
      '####################::::::##',
      '############################'
    ],
    warps: [
      { x: 3, y: 2, to: 'whirl-islands-b1f', spot: 'down' },
      { x: 25, y: 2, to: 'whirl-islands-b3f', spot: 'ladder', if: 'silver-wing', locked: 'whirl.closed' }
    ],
    spots: { ladder: [3, 2, 'down'], chamber: [25, 2, 'down'] },
    items: [
      { x: 12, y: 12, item: 'max-elixir', flag: 'whirl-b2f-maxelixir' },
      { x: 24, y: 20, item: 'pp-up', flag: 'whirl-b2f-ppup' }
    ],
    encounters: { walk: '@whirl-islands-b2f', water: '@whirl-islands-b2f' }
  }, WHIRL));

  // ---------------- B3F: Lugia's chamber ----------------
  G.Maps.def(Object.assign({
    id: 'whirl-islands-b3f',
    rows: [
      '####################',
      '#~~~~~~~:%::~~~~~~~#',
      '#~~~~~~~::::~~~~~#~#',
      '#~~~~~~~::::~~~~~~~#',
      '#~~#~~~~::::~~~~~~~#',
      '#~~~~~~~::::~~~~~~~#',
      '#~~~~~~~::::~~~#~~~#',
      '#~~~~~~~::::~~~~~~~#',
      '#~~~~~~~::::~~~~~~~#',
      '#~~~~~~~::::~~~~~~~#',
      '#~~~~~........~~~~~#',
      '#~~~#~..~~~~..~~~~~#',
      '#~~~~~..~~~~..~~#~~#',
      '#~#~~~..~~~~..~~~~~#',
      '#~~~~~~~~~~~~~~~~~~#',
      '####################'
    ],
    warps: [{ x: 9, y: 1, to: 'whirl-islands-b2f', spot: 'chamber' }],
    spots: { ladder: [9, 1, 'down'] },
    triggers: [{ x: 8, y: 9, w: 4, h: 1, if: '!lugia-met', script: 'whirl.lugia' }],
    // Lugia rests over the pool (`swim`: it may stand on water).
    npcs: [{ id: 'lugia', who: 'lugia', mon: 'lugia', x: 9, y: 12, dir: 'up', fixed: true, swim: true, if: '!lugia-met', script: 'whirl.lugia' }]
  }, WHIRL));

  /** The old sailor on Cianwood's beach: Whirlpool for any Pokémon of a species that can learn it. */
  async function sailor(h) {
    const F = G.Field;
    await h.say(T('Fifty years I sailed around the Whirl Islands. My Pokémon and I learned how to calm their whirlpools.'), SAILOR);
    if (await h.choice(T('Shall I teach Whirlpool to one of your Pokémon?'), {}) !== 0) { await h.say(T('Come back any time.'), SAILOR); return; }
    const can = m => !!(G.SPECIES[m.sp].tu || []).includes('whirlpool');
    const pick = h.pickMon || (o => (G.PartyUI ? G.PartyUI.pick(o) : Promise.resolve(null)));
    const i = await pick({ title: T('Teach which Pokémon?'), note: m => (G.Mon.knows(m, 'whirlpool') ? T('Learned') : can(m) ? T('Able') : T('Unable')),
                           disabled: m => !can(m) || G.Mon.knows(m, 'whirlpool') });
    const mon = i == null ? null : F.party()[i];
    if (!mon) { await h.say(T('Come back any time.'), SAILOR); return; }
    if (!can(mon) || G.Mon.knows(mon, 'whirlpool')) { await h.say(T('That Pokémon cannot learn it. Sorry!'), SAILOR); return; }
    // With four moves already, the player picks one to forget (learn-ui.js).
    if (G.LearnUI) { if (!(await G.LearnUI.teach(mon, 'whirlpool', t => h.say(t)))) return; }
    else {
      G.Mon.learn(mon, 'whirlpool', mon.moves.length < 4 ? null : 0);
      await h.say(T('{mon} learned {move}!'), { vars: { mon: G.Mon.name(mon), move: G.Names.move('whirlpool') } });
    }
    await h.say(T('With the Glacier Badge, Whirlpool calms the whirlpools out at sea. Mind the currents!'), SAILOR);
  }

  async function lugia(h) {
    const F = G.Field;
    h.face('player', 'down');
    await h.say(T('The still water of the chamber begins to stir, although there is no wind...'));
    h.emote('lugia', '!');
    await h.say(T('The Silver Wing glows. A great silver Pokémon raises its head from the water!'));
    h.sfx('cry');
    await h.wild('lugia', 45, {});
    const r = F.lastBattle;
    if (r === 'run') { await h.say(T('Lugia is still there, watching you in silence.')); return; }
    if (r === 'lose') return;
    F.setFlag('lugia-met');
    h.hide('lugia');
    await h.say(T('The chamber falls silent. Far above, the whirlpools around the islands grow calm for a moment.'));
    if (G.CreditsUI) await G.CreditsUI.ending(22); else F.setFlag('chapter-22-done');
  }

  G.Script.def({
    'whirl.sailor': [['js', sailor]],
    'whirl.lugia': [['js', lugia]],
    'whirl.closed': [['say', 'A cold current pours up out of the hole below. Something down there does not want visitors.']]
  });
})();
