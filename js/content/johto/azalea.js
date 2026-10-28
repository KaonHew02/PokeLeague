/* ============ azalea.js — Azalea Town, the Slowpoke Well, Bugsy ============
 * Chapter 12, the end of the chapter. Azalea Town: Center, Mart, Kurt's house, the charcoal kiln.
 * The Slowpoke are gone: a Team Rocket Grunt guards the well. Kurt hears why (they cut the
 * Slowpoke's tails to sell them) and goes down himself (flag kurt-well); the guard leaves. In
 * the Slowpoke Well (`cave`) Kurt has hurt his back by the ladder; four Grunts, the last in charge
 * (flag well-cleared: the Slowpoke come back, Kurt goes home, Bugsy is back at his Gym, whose door
 * was locked till then). Bugsy's Gym: three Bug Catchers, then Bugsy (Metapod, Kakuna, Scyther):
 * badge 10, the Hive Badge (Pokémon up to Lv. 30 obey), TM17 Protect (flag bugsy-beaten). Leaving
 * the Gym, the thief is waiting (Gastly, Zubat and his evolved starter; losing is allowed), and
 * the chapter ends. West of town lies Ilex Forest (chapter 13, ilex.js).
 */
G.Maps.def({
  id: 'azalea', loc: 'azalea-town', region: 'johto', tileset: 'outdoor', palette: 'kanto', music: 'town', battleBg: 'grass', border: 'T',
  fly: { spot: 'center-door' },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTT................................T',
    'TTT................................T',
    'TTT................................T',
    'TTT................................T',
    'TTT.........GGGGGG.................T',
    'TTT.........GGGGGG......CCCCC......T',
    'TTT.HHHH....GGGGGG.HHHH.CCCCC.MMMM.T',
    'TTT.HHHH....GGGGGG.HHHH.CCCCC.MMMM.T',
    'TTT.HDHH....GGDGGG.HDHH.CCDCC.MDMM.T',
    'TTTS.,.....S..,.....,.....,....,...T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
    'TTT......,..................S......T',
    'TTT......,..S......................T',
    'TTT.....#O##...ff..................T',
    'TTT.....####...ff...............ff.T',
    'TTT.....####..........TTTTTTTTT....T',
    'TTT...................TTTTTTTTT....T',
    'TTT.ff................TTTTTTTTT....T',
    'TTT...................TTTTTTTTT....T',
    'TTT................................T',
    'TTT................................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { east: { map: 'route33', offset: 4 }, west: { map: 'ilex-forest', offset: -13 } },
  warps: [
    { x: 5, y: 9, to: 'kurt-house', spot: 'door' },
    { x: 14, y: 9, to: 'azalea-gym', spot: 'door', if: 'well-cleared', locked: 'azalea.gym-closed' },
    { x: 20, y: 9, to: 'charcoal-house', spot: 'door' },
    { x: 26, y: 9, to: 'azalea-center', spot: 'door' },
    { x: 31, y: 9, to: 'azalea-mart', spot: 'door' },
    { x: 9, y: 15, to: 'slowpoke-well', spot: 'ladder' }
  ],
  spots: { 'kurt-door': [5, 10, 'down'], 'gym-door': [14, 10, 'down'], 'kiln-door': [20, 10, 'down'],
           'center-door': [26, 10, 'down'], 'mart-door': [31, 10, 'down'], 'well-door': [9, 14, 'up'] },
  signs: {
    '28,13': 'Azalea Town. A sleepy old town that loves its Slowpoke.',
    '11,10': 'Azalea Town Pokémon Gym. Leader: Bugsy, a young expert on all things Bug-type!',
    '12,14': 'Slowpoke Well. Long ago, they say, the yawn of a Slowpoke ended a terrible drought here.',
    '3,10': 'West: Ilex Forest. Fallen trees block the path for now.'
  },
  npcs: [
    { id: 'guard', who: 'rocket', x: 9, y: 14, dir: 'down', if: '!kurt-well',
      say: 'This well is closed. Team business. ...What? No, we are definitely not doing anything to the Slowpoke. Move along!' },
    { id: 'rival', who: 'silver', x: 14, y: 14, dir: 'up', if: 'scripted' },
    { id: 'oldman', who: 'oldman', x: 22, y: 14, move: 'look', if: '!well-cleared',
      say: 'The Slowpoke have all vanished from town... I saw strange people in black near the well.' },
    { id: 'oldman2', who: 'oldman', x: 22, y: 14, move: 'look', if: 'well-cleared',
      say: 'The Slowpoke are back! When they yawn, rain is sure to follow.' },
    { id: 'girl', who: 'lass', x: 27, y: 14, move: 'wander', r: 2,
      say: 'Kurt makes Poké Balls out of Apricorns. People come from all over Johto to see him!' },
    { id: 'kid', who: 'youngster', x: 17, y: 12, move: 'wander', r: 2,
      say: 'The Gym Leader, Bugsy, knows everything about Bug Pokémon. And he is barely older than me!' },
    { id: 'slowpoke1', who: 'slowpoke', mon: 'slowpoke', x: 18, y: 16, dir: 'down', fixed: true, if: 'well-cleared',
      say: 'A Slowpoke, yawning in the sun. It is glad to be home.' },
    { id: 'slowpoke2', who: 'slowpoke', mon: 'slowpoke', x: 31, y: 14, dir: 'left', fixed: true, if: 'well-cleared',
      say: 'A Slowpoke. It stares at nothing in particular.' }
  ],
  triggers: [{ x: 12, y: 10, w: 6, h: 3, if: ['bugsy-beaten', '!azalea-rival'], script: 'azalea.rival' }]
});

G.Maps.center('azalea-center', {
  loc: 'azalea-town', exit: { map: 'azalea', spot: 'center-door' },
  npcs: [{ id: 'man', who: 'gentleman', x: 9, y: 5, move: 'look',
           say: 'Have you met Kurt? His Poké Balls are famous, but these days he is busy with the Slowpoke trouble.' }]
}).region = 'johto';

G.Maps.mart('azalea-mart', {
  loc: 'azalea-town', exit: { map: 'azalea', spot: 'mart-door' },
  stock: ['poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'escape-rope', 'repel'],
  npcs: [{ id: 'shopper', who: 'hiker', x: 6, y: 5, move: 'look',
           say: 'Union Cave is full of Zubat. Repels sell well in this town!' }]
}).region = 'johto';

G.Maps.def({
  id: 'kurt-house', loc: 'azalea-town', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb_______p', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'azalea', spot: 'kurt-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: { '0,2': 'Apricorns of every colour, sorted by size.', '1,2': 'Apricorns of every colour, sorted by size.',
           '2,2': 'Tools for making Poké Balls by hand.' },
  npcs: [
    { id: 'kurt', who: 'kurt', x: 7, y: 3, dir: 'down', if: '!kurt-well', script: 'azalea.kurt' },
    { id: 'kurt2', who: 'kurt', x: 7, y: 3, dir: 'down', if: 'well-cleared', script: 'azalea.kurt-thanks' },
    { id: 'granddaughter', who: 'lass', x: 3, y: 5, dir: 'right', if: '!well-cleared',
      say: 'Grandpa ran off to the well... I hope he is all right.' },
    { id: 'granddaughter2', who: 'lass', x: 3, y: 5, dir: 'right', if: 'well-cleared',
      say: 'A Slowpoke\'s tail grows back, Grandpa says. But it must still hurt. Thank you for saving them!' }
  ]
});

G.Maps.def({
  id: 'charcoal-house', loc: 'azalea-town', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bb___p___bb', '___________', '____ttt____', '____ttt____', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'azalea', spot: 'kiln-door' }],
  spots: { door: [4, 7, 'up'] },
  npcs: [
    { id: 'maker', who: 'gentleman', x: 7, y: 4, dir: 'left', if: '!charcoal-gift',
      say: 'I make charcoal in the kiln out back. My apprentice took our Farfetch\'d to Ilex Forest to cut wood. He should be back by now...' },
    { id: 'maker2', who: 'gentleman', x: 7, y: 4, dir: 'left', if: 'charcoal-gift',
      say: 'Our Farfetch\'d cuts the wood for the kiln with its leek. Without it, there would be no charcoal. Thank you again!' },
    { id: 'apprentice', who: 'youngster', x: 2, y: 5, dir: 'right', if: 'charcoal-gift',
      say: 'I will never let go of Farfetch\'d again. Well... I will try.' },
    { id: 'farfetchd', who: 'farfetchd', mon: 'farfetchd', x: 3, y: 6, dir: 'up', fixed: true, if: 'charcoal-gift',
      say: 'Farfetch\'d waves its leek proudly.' }
  ]
});

G.Maps.def({
  id: 'slowpoke-well', loc: 'slowpoke-well', region: 'johto', tileset: 'outdoor', palette: 'cave', music: 'cave', battleBg: 'cave', border: '#', cave: true, escape: true,
  rows: [
    '########################',
    '########################',
    '##.%.......##.........##',
    '##.........##.........##',
    '##.........##.........##',
    '##....~~~~.##.........##',
    '##....~~~~.##.........##',
    '##....~~~~............##',
    '##....~~~~............##',
    '##...........~~~~~....##',
    '##...######..~~~~~....##',
    '##...######..~~~~~....##',
    '##...........~~~~~....##',
    '##...........~~~~~....##',
    '##....................##',
    '##....................##',
    '########################',
    '########################'
  ],
  warps: [{ x: 3, y: 2, to: 'azalea', spot: 'well-door' }],
  spots: { ladder: [3, 3, 'down'] },
  npcs: [
    { id: 'kurt', who: 'kurt', x: 5, y: 3, dir: 'left', if: ['kurt-well', '!well-cleared'], script: 'well.kurt' },
    { id: 'slowpoke1', who: 'slowpoke', mon: 'slowpoke', x: 8, y: 13, dir: 'down', fixed: true,
      say: 'A Slowpoke. Its tail has been cut short, but it only yawns.' },
    { id: 'slowpoke2', who: 'slowpoke', mon: 'slowpoke', x: 16, y: 4, dir: 'left', fixed: true,
      say: 'A Slowpoke, dozing. It does not seem to know anything is wrong.' }
  ],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 14, y: 3, dir: 'left', sight: 2, if: '!well-cleared',
      team: [['rattata', 9], ['zubat', 9]],
      before: 'Who let a kid down here? Get lost!',
      defeat: 'Ugh... I lost.',
      after: 'Slowpoke tails are a delicacy, you know. They sell for a fortune!' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 4, y: 13, dir: 'up', sight: 3, if: '!well-cleared',
      team: [['ekans', 11]],
      before: 'We are busy here. Do not make me deal with you!',
      defeat: 'I got dealt with...',
      after: 'Team Rocket is back! Did you not hear?' },
    { id: 'grunt3', who: 'rocket', cls: 'team-rocket', x: 19, y: 6, dir: 'down', sight: 3, if: '!well-cleared',
      team: [['rattata', 9], ['zubat', 9], ['rattata', 9]],
      before: 'Those Slowpoke do not even notice when we cut their tails. So why should you care?',
      defeat: 'Okay, okay. You care a lot.',
      after: 'The one in charge is at the back. He will deal with you.' },
    { id: 'grunt4', who: 'rocket', cls: 'team-rocket', x: 19, y: 14, dir: 'left', sight: 2, if: '!well-cleared',
      team: [['zubat', 12], ['koffing', 14]],
      before: 'So you made it all the way down here. I am in charge of this job, and you are not ruining it!',
      defeat: 'Unbelievable... a kid beat me.',
      win: 'well.cleared' }
  ],
  items: [{ x: 20, y: 2, item: 'super-potion', flag: 'well-potion' }],
  encounters: { walk: '@slowpoke-well-1f', water: '@slowpoke-well-1f' }
});

G.Maps.def({
  id: 'azalea-gym', loc: 'azalea-town', region: 'johto', tileset: 'indoor', palette: 'garden', music: 'gym', battleBg: 'indoor',
  rows: ['WWWWWWWWWWWWW', 'WWWWWWWWWWWWW', 'p+++++++++++p', '+++++++++++++', '+++kkk+kkk+++', '+++++++++++++',
         '+k+++++++++k+', '+k++kkkkk++k+', '+++++++++++++', '+++++++++++++', '+kkk+++++kkk+', '+++++++++++++',
         '+++++++++++++', '++++++X++++++'],
  warps: [{ x: 6, y: 13, to: 'azalea', spot: 'gym-door' }],
  spots: { door: [6, 13, 'up'] },
  npcs: [{ id: 'guide', who: 'guide', x: 8, y: 12, dir: 'left', script: 'azalea.gym-guide' }],
  trainers: [
    { id: 'benny', who: 'bugcatcher', cls: 'bug-catcher', name: 'Benny', x: 2, y: 9, dir: 'right', sight: 3,
      team: [['weedle', 7], ['kakuna', 9, ['poison-sting', 'string-shot', 'harden']], ['beedrill', 12]],
      before: 'Bugs evolve fast, and so do I! Battle!',
      defeat: 'My bugs needed more time...',
      after: 'Bugsy studies how Bug Pokémon grow. He is a real scientist!' },
    { id: 'al', who: 'bugcatcher', cls: 'bug-catcher', name: 'Al', x: 10, y: 8, dir: 'left', sight: 3,
      team: [['caterpie', 12], ['weedle', 12]],
      before: 'You cannot reach Bugsy without getting past me!',
      defeat: 'Squashed...',
      after: 'Fire moves are tough on bugs. That is no secret.' },
    { id: 'josh', who: 'bugcatcher', cls: 'bug-catcher', name: 'Josh', x: 3, y: 5, dir: 'right', sight: 3,
      team: [['paras', 13]],
      before: 'Paras grow mushrooms on their backs. Cool, right? Battle!',
      defeat: 'My mushrooms wilted...',
      after: 'Bugsy\'s Scyther is fast and sharp. Watch out!' },
    { id: 'bugsy', who: 'bugsy', cls: 'leader', name: 'Bugsy', x: 6, y: 3, dir: 'down', sight: 0, leader: true, ai: 'leader',
      team: [['metapod', 14, ['tackle', 'string-shot', 'harden']], ['kakuna', 14, ['poison-sting', 'string-shot', 'harden']],
             ['scyther', 15, ['quick-attack', 'leer', 'fury-cutter']]],
      before: 'I am Bugsy! I may be young, but nobody has studied Bug Pokémon more than me. Let me show you what I have learned!',
      defeat: 'Whoa, amazing! You really know your Pokémon.',
      win: 'azalea.bugsy-win',
      afterScript: [['say', 'Bug Pokémon are full of surprises. I am going to keep studying them, and one day I will know them all!', { name: 'Bugsy' }]] }
  ]
});

(() => {
  const T = s => G.T(s);
  const KURT = { name: 'Kurt' }, RIVAL2 = { name: '{rival2}' };
  /** The thief's starter, one stage up (Bayleef, Quilava, Croconaw). */
  const evolved = sp => ({ 152: 153, 155: 156, 158: 159 })[sp] || 156;

  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('azalea-rival');
    h.place('rival', me.x, Math.min(me.y + 3, 14), 'up');
    h.show('rival');
    await h.walkTo('rival', me.x, me.y + 1);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T('...You again. I heard you ran Team Rocket out of the well.'), RIVAL2);
    await h.say(T('Those Rocket clowns only act tough in a crowd. I cannot stand people like that.'), RIVAL2);
    await h.say(T("But I didn't come for them. I came to beat you!"), RIVAL2);
    await h.battle({ id: 'rival2-azalea', who: 'silver', name: S.rival2.name || '???', prize: 40, ai: 'basic',
                     team: [['gastly', 12], ['zubat', 14], [evolved(S.rival2.starter), 16]] }, { canLose: true });
    await h.say(T("...Tch. My Pokémon were too weak. I'll get stronger ones, whatever it takes."), RIVAL2);
    await h.walkTo('rival', me.x, 14);
    h.hide('rival');
    // The end of the twelfth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(12); else F.setFlag('chapter-12-done');
  }

  G.Script.def({
    'azalea.kurt': [
      ['say', 'Hm? A Trainer? I am Kurt. I make Poké Balls out of Apricorns.', { name: 'Kurt' }],
      ['say', 'But there is no time for that now! Team Rocket is back, and they are cutting off the Slowpoke\'s tails in the well to sell them!', { name: 'Kurt' }],
      ['say', 'I will not stand for it. I am going down there to teach them a lesson myself!', { name: 'Kurt' }],
      ['setFlag', 'kurt-well']
    ],
    'well.kurt': [
      ['say', 'Ouch... I jumped down the ladder and hurt my back. I can barely move!', { name: 'Kurt' }],
      ['say', 'Please, drive Team Rocket out for me. The Slowpoke are counting on you!', { name: 'Kurt' }]
    ],
    'well.cleared': [
      ['say', 'Fine! We are pulling out. We cut enough tails already, anyway.'],
      ['setFlag', 'well-cleared'],
      ['say', '{player}! You did it! The Slowpoke are safe. Let us get out of here. Come and see me at my house.', { name: 'Kurt' }]
    ],
    'azalea.kurt-thanks': [
      ['say', 'You chased Team Rocket out of the well. The Slowpoke are safe, thanks to you!', { name: 'Kurt' }],
      ['say', 'My back still hurts, though... Oh, and Bugsy is back at his Gym. He came running when he heard the news.', { name: 'Kurt' }]
    ],
    'azalea.gym-closed': [
      ['say', 'The Gym\'s door is locked. A note on it reads: "Out looking for rare bugs. Back soon! Bugsy"']
    ],
    'azalea.gym-guide': [
      ['say', 'Yo, Champion! Bugsy uses Bug-type Pokémon. Fire and Flying moves will do the trick.'],
      ['say', 'With one Johto badge, Pokémon up to level 25 obey you. Win here, and it goes up to 30!']
    ],
    'azalea.bugsy-win': [
      ['say', 'Okay, you win. This is yours: the Hive Badge.', { name: 'Bugsy' }],
      ['badge', 10],
      ['jingle', 'badge'],
      ['say', '{player} received the Hive Badge from Bugsy!'],
      ['say', 'With the Hive Badge, Pokémon up to level 30 will listen to you.', { name: 'Bugsy' }],
      ['say', 'Take this too: TM17, Protect. Bug Pokémon survive by hiding in their shells. With Protect, any Pokémon can do the same for a turn.', { name: 'Bugsy' }],
      ['giveItem', 'tm17', 1],
      ['setFlag', 'bugsy-beaten']
    ],
    'azalea.rival': [['js', rival]]
  });
})();
