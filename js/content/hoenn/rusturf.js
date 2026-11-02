/* ============ rusturf.js — the Devon Goods, Route 116, the Rusturf Tunnel, the Devon Corporation ============
 * Chapter 30. Back in Rustboro with the Stone Badge, a Team Aqua grunt runs out of the Devon
 * Corporation with the Devon Goods (G.Hoenn.theft, flag goods-stolen) and east along Route 116 into
 * the Rusturf Tunnel, the tunnel to Verdanturf Town that is not dug through yet. On the way he grabbed
 * Peeko, Mr. Briney's Wingull: Briney waits at the tunnel's mouth. At the tunnel's dead end you
 * battle the grunt (Poochyena), who drops the Goods and runs; Peeko flies back to Briney, who offers
 * his boat (flags goods-recovered, peeko-saved). Devon's door opens: on 3F the company's president
 * thanks you and asks two favours: a Letter for his son Steven in Dewford Town, and the Goods for the
 * Oceanic Museum in Slateport City (flag stone-met).
 * Chapter 33: the tunnel is dug through to Verdanturf Town (verdanturf.js) but for one cracked rock,
 * which Rock Smash breaks (field.js; it is back each time you come in).
 */
(() => {
  const T = s => G.T(s);
  const GRUNT = { name: 'Team Aqua Grunt' }, RESEARCHER = { name: 'Devon Researcher' }, BRINEY = { name: 'Mr. Briney' };
  const PRESIDENT = { name: 'Devon President' };
  const HOENN = { region: 'hoenn' };

  // ---------------- Route 116 ----------------
  G.Maps.def(Object.assign({
    id: 'route116', loc: 'hoenn-route-116', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..........................########T',
      'T.."""""""....TTT..........########T',
      'T.."""""""....TTT..........########T',
      'T..""""""".................########T',
      'T........................S.####O###T',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,T',
      'T..................................T',
      'T..........."""""""""..""""""......T',
      'T..........."""""""""..""""""..TTT.T',
      'T..........."""""""""..""""""..TTT.T',
      'T..............................TTT.T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    connect: { west: { map: 'rustboro', offset: -3 } },
    warps: [{ x: 31, y: 5, to: 'rusturf-tunnel', spot: 'mouth' }],
    spots: { mouth: [31, 6, 'down'] },
    signs: { '25,5': 'Route 116. East: the Rusturf Tunnel. West: Rustboro City.' },
    trainers: [
      { id: 'joey', who: 'youngster', cls: 'youngster', name: 'Joey', x: 8, y: 5, dir: 'down', sight: 2, team: [['machop', 9]],
        before: 'My Machop trains every single day. Want to see how strong it got?',
        defeat: 'Machop, we need more training!',
        after: 'Fighting types hit Normal and Rock types hard. Remember that!' },
      { id: 'kelsey', who: 'lass', cls: 'school-kid', name: 'Kelsey', x: 15, y: 8, dir: 'up', sight: 2, team: [['shroomish', 9], ['zigzagoon', 9]],
        before: 'I just finished class at the Trainers\' School. Time to test what I learned!',
        defeat: 'I should have studied harder...',
        after: 'The teacher says a Trainer should always know which types their Pokémon are weak to.' },
      { id: 'jose', who: 'bugcatcher', cls: 'bug-catcher', name: 'Jose', x: 21, y: 5, dir: 'down', sight: 2, team: [['wurmple', 8], ['nincada', 8]],
        before: 'Did you know Nincada lives underground? I dug this one up myself!',
        defeat: 'Back into the ground...',
        after: 'They say when Nincada evolves, something strange happens. I cannot wait to see it!' }
    ],
    npcs: [
      { id: 'briney', who: 'captain', x: 33, y: 6, dir: 'left', if: ['goods-stolen', '!peeko-saved'],
        say: 'Peeko! My Peeko! A man in a striped shirt grabbed her and ran into that tunnel! Please, young one, help an old sailor!' }
    ],
    items: [{ x: 1, y: 12, item: 'x-speed', flag: 'route116-xspeed' }, { x: 34, y: 12, item: 'super-potion', flag: 'route116-superpotion' }],
    encounters: { walk: '@hoenn-route-116-area' }
  }, HOENN));

  // ---------------- the Rusturf Tunnel ----------------
  G.Maps.def(Object.assign({
    id: 'rusturf-tunnel', loc: 'rusturf-tunnel', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#',
    cave: true, escape: true,
    rows: [
      '##################################',
      '##################################',
      '##################################',
      '##########............####......##',
      '##########.............k........##',
      '##########.............k........##',
      '##################....####......##',
      '##################....####......##',
      '##......##########....####......##',
      '##....................####......##',
      '##....................####......##',
      '##......#####################O####',
      '####O#############################',
      '##################################'
    ],
    warps: [{ x: 4, y: 12, to: 'route116', spot: 'mouth' }, { x: 29, y: 11, to: 'verdanturf', spot: 'tunnel' }],
    spots: { mouth: [4, 11, 'up'], verdanturf: [29, 10, 'up'] },
    triggers: [{ x: 13, y: 3, w: 1, h: 3, if: '!goods-recovered', script: 'rusturf.grunt' }],
    trainers: [
      { id: 'mike', who: 'hiker', cls: 'hiker', name: 'Mike', x: 14, y: 10, dir: 'left', sight: 3, team: [['geodude', 10], ['geodude', 10]],
        before: 'Hold it! I am looking for a good rock to rest on. A battle will do too!',
        defeat: 'Rocks rolled away...',
        after: 'They have been digging this tunnel for ages. The rock past here is too hard for their machines.' }
    ],
    npcs: [
      { id: 'grunt', who: 'aqua', x: 11, y: 4, dir: 'right', if: '!goods-recovered', script: 'rusturf.grunt' },
      { id: 'peeko', who: 'wingull', mon: 'wingull', x: 10, y: 4, dir: 'right', fixed: true, if: '!peeko-saved', script: 'rusturf.grunt' },
      { id: 'briney', who: 'captain', x: 12, y: 3, dir: 'left', if: 'scripted' },
      { id: 'digger', who: 'engineer', x: 3, y: 9, move: 'look',
        say: 'We are digging toward Verdanturf Town, but the rock is too hard. If only we had a Pokémon strong enough to smash it...' }
    ],
    items: [{ x: 21, y: 3, item: 'poke-ball', flag: 'rusturf-pokeball' }],
    encounters: { walk: '@rusturf-tunnel-area' }
  }, HOENN));

  // ---------------- the Devon Corporation ----------------
  G.Maps.def(Object.assign({
    id: 'devon-1f', loc: 'rustboro-city', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbb+++++++^bb', '+++++++++++++', '++===++++++++', '+++++++++++++', 'p+++++++++++p',
           '+++++++++++++', '++++++X++++++'],
    warps: [{ x: 6, y: 8, to: 'rustboro', spot: 'devon-door' }, { x: 10, y: 2, to: 'devon-3f', spot: 'stairs' }],
    spots: { door: [6, 8, 'up'], stairs: [10, 3, 'down'] },
    npcs: [
      { id: 'clerk', who: 'clerk', x: 3, y: 3, dir: 'down',
        say: 'Welcome to the Devon Corporation. Our president\'s office is on the third floor.' },
      { id: 'researcher', who: 'scientist', x: 8, y: 5, dir: 'left', script: 'devon.researcher' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'devon-3f', loc: 'rustboro-city', tileset: 'indoor', palette: 'lab', music: 'lab', battleBg: 'indoor',
    rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'bbbbb+++++^bb', '+++++++++++++', '+++++ttt+++++', '+++++++++++++', 'p+++++++++++p',
           '+++++++++++++'],
    warps: [{ x: 10, y: 2, to: 'devon-1f', spot: 'stairs' }],
    spots: { stairs: [10, 3, 'down'] },
    npcs: [{ id: 'president', who: 'president', x: 6, y: 3, dir: 'down', script: 'devon.president' }]
  }, HOENN));

  // ---------------- the theft, the tunnel ----------------
  async function theft(h) {
    const F = G.Field;
    // The grunt comes running along the road from Devon, past the Gym's door, and off to the east.
    h.place('thief', 3, 9, 'right'); h.show('thief');
    await h.walkTo('thief', 7, 9);
    h.face('player', 'down');
    h.emote('thief', '!');
    await h.say(T('Out of my way! These Devon Goods belong to Team Aqua now!'), GRUNT);
    await h.walkTo('thief', 15, 9);
    h.hide('thief');
    F.setFlag('goods-stolen');
    h.place('chaser', 3, 9, 'right'); h.show('chaser');
    await h.walkTo('chaser', 7, 9);
    h.face('chaser', 'up');
    await h.say(T('Stop! Thief! Somebody stop him!'), RESEARCHER);
    await h.say(T('Oh, it is you, the Trainer from Petalburg Woods! That man stole the Devon Goods, the parts we were about to ship!'), RESEARCHER);
    await h.say(T('He ran east, toward Route 116 and the Rusturf Tunnel. Please, get them back!'), RESEARCHER);
    await h.walkTo('chaser', 15, 9);
    h.hide('chaser');
  }

  async function grunt(h) {
    const F = G.Field;
    if (F.flag('goods-recovered')) return;
    h.face('grunt', 'right');
    await h.say(T('What? You followed me all the way in here? This tunnel does not even go anywhere!'), GRUNT);
    await h.say(T('Fine! You want the Goods and this noisy bird back? Then beat me!'), GRUNT);
    const out = await h.battle({ id: 'aqua-tunnel', who: 'aqua', cls: 'team-aqua', name: '', team: [['poochyena', 11]] }, {});
    if (out === 'lose') return;
    await h.say(T('Argh! Take your stupid parts. I am out of here!'), GRUNT);
    h.hide('grunt');
    F.giveItem('devon-goods', 1);
    F.setFlag('goods-recovered');
    const j = h.jingle('item');
    await h.say(T('{player} got the {item} back!'), { vars: { item: G.Names.item('devon-goods') } });
    await j;
    h.place('briney', 12, 3, 'left'); h.show('briney');
    await h.say(T('Peeko! There you are, my girl!'), BRINEY);
    if (G.Audio && G.Audio.cry) G.Audio.cry(278);
    await h.say(T('Peeko flew happily back to Mr. Briney.'));
    h.hide('peeko');
    F.setFlag('peeko-saved');
    await h.say(T('Thank you, young one! I am Briney, an old sailor. If you ever need to cross the sea, come to my cottage on Route 104. My boat is yours!'), BRINEY);
    h.hide('briney');
  }

  G.Script.def({
    'rusturf.grunt': [['js', grunt]],
    'devon.researcher': [
      ['if', 'stone-met', [
        ['say', 'Thanks to you, the Devon Goods are safe. Please take good care of them on the way to Slateport!', RESEARCHER]
      ], [
        ['say', 'You got the Devon Goods back! Thank you! Our president wants to thank you himself. His office is upstairs.', RESEARCHER]
      ]]
    ],
    'devon.president': [
      ['if', 'stone-met', [
        ['if', 'steven-letter', [
          ['say', 'You gave Steven my letter? Thank you. That boy is always off somewhere, looking at rocks.', PRESIDENT]
        ], [
          ['say', 'My son Steven is in Granite Cave, near Dewford Town. Mr. Briney\'s boat can take you across the sea.', PRESIDENT]
        ]],
        ['end']
      ]],
      ['say', 'So you are the Trainer who saved our research in the woods, and then the Devon Goods! I am the president of the Devon Corporation. You have my thanks.', PRESIDENT],
      ['say', 'May I ask two favours of you? First, this letter is for my son, Steven. He is in Dewford Town, exploring Granite Cave as usual.', PRESIDENT],
      ['giveItem', 'letter', 1],
      ['say', 'Second, the Devon Goods must reach the Oceanic Museum in Slateport City. Would you take them there for us?', PRESIDENT],
      ['say', 'Old Mr. Briney on Route 104 still has his boat. I am sure he would take you across the sea.', PRESIDENT],
      ['setFlag', 'stone-met']
    ]
  });
  G.Hoenn.theft = theft;
})();
