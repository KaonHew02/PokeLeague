/* ============ nugget.js — Nugget Bridge (Route 24), Route 25 and Bill's Sea Cottage ============
 * North of Cerulean City (the texts are our own; the events follow the games):
 *   - At the foot of the bridge the rival wants a rematch (flag route24-rival).
 *   - Five Trainers on the bridge; at the end a man hands a Nugget to whoever beats all
 *     five, then turns out to be a Team Rocket recruiter (route24:recruiter).
 *   - Route 25 leads east to Bill's Sea Cottage. Bill got mixed up with a Clefairy in his
 *     teleporter: he steps into the pod, you switch on the machine, and he gives you a
 *     ticket for the S.S. Anne (flags bill-asked, bill-saved, got-ss-ticket).
 * Wild Pokémon here: Oddish and Abra among the bugs (good against Misty, for a Charmander).
 */
G.Maps.def({
  id: 'route24', loc: 'kanto-route-24', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'T......................T',
    'T.""""".,,.S...........T',
    'T.""""".,,,,,,,,,,,,,,,,',
    'T.""""".,,.."""""""....T',
    'T.""""".,,.."""""""TTT.T',
    'T.""""".,,.."""""""TTT.T',
    'T.......,,.."""""""....T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T~~~~~~~,,~~~~~~~~~~~~~T',
    'T.......,,.............T',
    'T.""""".,,.."""""......T',
    'T.""""".,,.S"""""......T',
    'T.""""".,,.."""""......T',
    'T.""""".,,.."""""......T',
    'T.......,,.............T',
    'TTTTTTTT,,TTTTTTTTTTTTTT'
  ],
  connect: { south: { map: 'cerulean', offset: -8 }, east: { map: 'route25', offset: 0 } },
  spots: { south: [8, 28, 'up'], east: [22, 3, 'left'] },
  signs: {
    '11,25': 'Nugget Bridge. Beat all five Trainers on the bridge to win a prize!',
    '11,2': 'Route 24. East: Route 25 and the Sea Cottage. South: Cerulean City.'
  },
  npcs: [
    { id: 'rival', who: 'rival', x: 2, y: 28, dir: 'up', if: 'scripted' },
    { id: 'prizeman', who: 'guide', x: 9, y: 9, dir: 'down', script: 'route24.recruiter' }
  ],
  trainers: [
    { id: 'cale', who: 'bugcatcher', cls: 'bug-catcher', name: 'Cale', x: 8, y: 20, dir: 'right', sight: 1,
      team: [['caterpie', 10], ['weedle', 10], ['metapod', 10], ['kakuna', 10]],
      before: 'This is Nugget Bridge! Beat all five of us and you win a prize! I am number one!',
      defeat: 'Number one... down already?',
      after: 'Four more to go! Good luck!' },
    { id: 'ali', who: 'lass', cls: 'lass', name: 'Ali', x: 9, y: 18, dir: 'left', sight: 1,
      team: [['pidgey', 12], ['oddish', 12], ['bellsprout', 12]],
      before: "I'm number two! You won't get past me so easily!",
      defeat: 'Oh, I lost!',
      after: 'The prize at the end is really something. Keep going!' },
    { id: 'timmy', who: 'youngster', cls: 'youngster', name: 'Timmy', x: 8, y: 16, dir: 'right', sight: 1,
      team: [['sandshrew', 14], ['ekans', 14]],
      before: "Number three, coming through! Let's battle!",
      defeat: 'Aww, I was so close!',
      after: 'Only two more after me.' },
    { id: 'reli', who: 'lass', cls: 'lass', name: 'Reli', x: 9, y: 14, dir: 'left', sight: 1,
      team: [['nidoran-m', 16]],
      before: "I'm number four! Getting nervous yet?",
      defeat: 'You really are good...',
      after: 'The last one is the strongest. Be careful!' },
    { id: 'ethan', who: 'camper', cls: 'camper', name: 'Ethan', x: 8, y: 12, dir: 'right', sight: 1,
      team: [['mankey', 18]],
      before: "I'm the last of the five! Give it everything you've got!",
      defeat: 'Whoa! You beat all five of us!',
      after: 'Go and claim your prize at the end of the bridge!' },
    { id: 'recruiter', who: 'rocket', cls: 'team-rocket', x: 1, y: 1, dir: 'down', sight: 0, if: 'scripted',
      team: [['ekans', 15], ['zubat', 15]],
      before: '…', defeat: 'Argh! You really are strong...', after: '…' }
  ],
  triggers: [
    { x: 8, y: 23, w: 2, h: 1, if: '!route24-rival', script: 'route24.rival' },
    { x: 8, y: 10, w: 2, h: 1, if: '!done:route24:recruiter', script: 'route24.recruiter' }
  ],
  items: [
    { x: 22, y: 7, item: 'tm45', flag: 'route24-tm45' },
    { x: 3, y: 1, item: 'potion', flag: 'route24-hidden-potion', hidden: true }
  ],
  encounters: { walk: '@kanto-route-24-area' }
});

G.Maps.def({
  id: 'route25', loc: 'kanto-route-25', tileset: 'outdoor', palette: 'kanto', music: 'route', battleBg: 'grass', border: 'T',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
    'T......................................T',
    ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....T',
    'T....................TT.......S,.......T',
    'T...""""""...........TT."""""..,.HHHH..T',
    'T...""""""...""""""""..."""""..,.HHHH..T',
    'T...""""""...""""""""..."""""..,.HDHH..T',
    'T...""""""...""""""""..."""""..,,,,,...T',
    'T.........TTT""""""""..."""""..........T',
    'T.........TTT..........................T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
  ],
  connect: { west: { map: 'route24', offset: 0 } },
  warps: [{ x: 34, y: 7, to: 'bill-house', spot: 'door' }],
  spots: { west: [1, 3, 'right'], 'bill-door': [34, 8, 'down'] },
  signs: { '30,4': "Bill's Sea Cottage. Pokémon fans always welcome!" },
  trainers: [
    { id: 'dan', who: 'youngster', cls: 'youngster', name: 'Dan', x: 6, y: 2, dir: 'down', sight: 1,
      team: [['slowpoke', 17]],
      before: 'My Slowpoke is slow, but it hits hard! Battle!',
      defeat: 'Slowpoke... too slow...',
      after: 'Slowpoke takes a while to notice when it loses.' },
    { id: 'chad', who: 'youngster', cls: 'youngster', name: 'Chad', x: 12, y: 4, dir: 'up', sight: 1,
      team: [['ekans', 14], ['sandshrew', 14]],
      before: "Going to see Bill? You'll have to get past me!",
      defeat: 'You got past me...',
      after: "Bill is a genius. He made the PC system everyone uses!" },
    { id: 'haley', who: 'lass', cls: 'lass', name: 'Haley', x: 17, y: 2, dir: 'down', sight: 1,
      team: [['oddish', 13], ['pidgey', 13], ['oddish', 13]],
      before: 'I love Grass-type Pokémon! Let me show you mine!',
      defeat: 'Oh no, my Oddish!',
      after: 'Oddish grow in the grass around here. They are great against Water types!' },
    { id: 'franklin', who: 'hiker', cls: 'hiker', name: 'Franklin', x: 24, y: 4, dir: 'up', sight: 1,
      team: [['machop', 15], ['geodude', 17]],
      before: 'I train my muscles on these hills. Want to see?',
      defeat: 'My muscles failed me!',
      after: 'Even the strongest muscles need rest sometimes.' },
    { id: 'flint', who: 'camper', cls: 'camper', name: 'Flint', x: 27, y: 2, dir: 'down', sight: 1,
      team: [['rattata', 14], ['ekans', 14]],
      before: 'Nobody gets to Bill without a battle!',
      defeat: 'Nobody... except you.',
      after: "Bill's house is just past here. He's a bit strange, but nice." }
  ],
  items: [{ x: 38, y: 10, item: 'ether', flag: 'route25-ether' }],
  encounters: { walk: '@kanto-route-25-area' }
});

G.Maps.def({
  id: 'bill-house', loc: 'kanto-route-25', tileset: 'indoor', palette: 'lab', music: 'town', battleBg: 'indoor',
  rows: [
    'WWWWWWWWWWW',
    'WWWWWWWWWWW',
    'bb_PPP___tt',
    '___________',
    '___________',
    '__rrr______',
    '___________',
    '____X______'
  ],
  warps: [{ x: 4, y: 7, to: 'route25', spot: 'bill-door' }],
  spots: { door: [4, 7, 'up'] },
  signs: {
    '0,2': 'Books about Pokémon and computers, side by side.',
    '1,2': 'Books about Pokémon and computers, side by side.',
    '3,2': { script: 'bill.machine' },
    '4,2': { script: 'bill.machine' },
    '5,2': { script: 'bill.machine' },
    '9,2': 'A teleporter pod. It hums quietly.',
    '10,2': 'A teleporter pod. It hums quietly.'
  },
  npcs: [
    { id: 'bill-mon', mon: 'clefairy', x: 6, y: 4, dir: 'down', if: '!bill-asked', script: 'bill.clefairy' },
    { id: 'bill', who: 'bill', x: 9, y: 3, dir: 'down', if: 'bill-saved', script: 'bill.talk' }
  ]
});

(() => {
  const T = s => G.T(s);
  const RIVAL = { name: '{rival}' };
  const EVOLVED = { 1: 2, 4: 5, 7: 8 };
  const FIVE = ['cale', 'ali', 'timmy', 'reli', 'ethan'];

  /** The rival at the foot of Nugget Bridge (a normal battle: losing blacks out). */
  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('route24-rival');
    await h.say(T('Hey, {player}! Fancy meeting you here.'), RIVAL);
    h.place('rival', me.x === 8 ? 9 : 8, me.y - 1, 'down');
    h.show('rival');
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T("My Pokémon have grown a lot since last time. Let's see if yours can keep up!"), RIVAL);
    const out = await h.battle({ id: 'rival-24', who: 'rival', name: S.rival.name, prize: 35, ai: 'basic',
      team: [['pidgeotto', 17], ['abra', 16], ['rattata', 15], [EVOLVED[S.rival.starter] || 8, 18]] }, {});
    if (out === 'lose') return;
    await h.say(T("Heh, not bad. I've already been to see Bill, by the way. He gave me something great."), RIVAL);
    await h.say(T("You should visit him too. He lives at the end of Route 25. Smell you later!"), RIVAL);
    h.hide('rival');
  }

  /** The man at the end of the bridge: a Nugget for beating all five, then Team Rocket shows its face. */
  async function recruiter(h) {
    const F = G.Field, me = G.World.player;
    h.face('prizeman', 'player');
    if (!FIVE.every(id => F.isDone('route24:' + id))) {
      await h.say(T('Beat all five Trainers on the bridge first, then come and claim your prize!'));
      await h.move('player', ['down'], 4);
      return;
    }
    if (!F.flag('route24-nugget')) {
      await h.say(T('Congratulations! You beat all five of our Trainers! Here is your prize!'));
      F.setFlag('route24-nugget');
      F.giveItem('nugget', 1);
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('nugget') } });
      await j;
    }
    await h.say(T('By the way... how would you like to join Team Rocket? With your skills, you would go far!'));
    await h.choice(T('Will you join Team Rocket?'), {});
    await h.say(T("No? Then I'll make you join by force!"));
    await h.battle('route24:recruiter', {});
  }

  /** Bill as a Clefairy: he steps into the teleporter pod and asks you to run the machine. */
  async function clefairy(h) {
    const F = G.Field;
    if (G.Audio.cry) G.Audio.cry(35);
    await h.say(T("Hiya! Don't let my looks fool you: I'm not a Pokémon, I'm Bill!"));
    await h.say(T('An experiment with my teleporter went wrong, and I got mixed up with a Clefairy!'));
    await h.say(T("I'll get into the teleporter pod. Then please switch on the machine by the PC. It should separate us!"));
    F.setFlag('bill-asked');
    await h.walkTo('bill-mon', 9, 3);
    h.hide('bill-mon');
    h.sfx('door');
  }

  async function machine(h) {
    const F = G.Field, me = G.World.player;
    if (F.flag('bill-saved')) { await h.say(T('The machine is quiet now.')); return; }
    if (!F.flag('bill-asked')) { await h.say(T("A big machine is wired to the PC. Better not touch it while nobody's around.")); return; }
    await h.say(T('{player} switched on the Cell Separation System!'));
    h.sfx('pc');
    await h.fade('out', 0.4);
    F.setFlag('bill-saved');
    h.place('bill', 9, 3, 'down');
    h.show('bill');
    await h.fade('in', 0.4);
    await h.walkTo('bill', me.x + 1, me.y + 1);
    h.face('bill', 'player'); h.face('player', 'bill');
    await h.say(T("Yeehaw! I'm me again! Thanks a million, {player}!"), { name: 'Bill' });
    await h.say(T("Here, take this as a thank-you. It's a ticket for the S.S. Anne, a cruise ship docked in Vermilion City."), { name: 'Bill' });
    F.giveItem('ss-ticket', 1);
    F.setFlag('got-ss-ticket');
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('ss-ticket') } });
    await j;
    await h.say(T("There'll be lots of Trainers on board. Have fun!"), { name: 'Bill' });
  }

  G.Script.def({
    'route24.rival': [['js', rival]],
    'route24.recruiter': [['js', recruiter]],
    'bill.clefairy': [['js', clefairy]],
    'bill.machine': [['js', machine]],
    'bill.talk': [
      ['say', 'Go and see the S.S. Anne in Vermilion City. South of Cerulean, through Route 5 and the Underground Path!', { name: 'Bill' }],
      ['say', 'And if you ever fill your PC boxes, that is my storage system at work. Pretty neat, huh?', { name: 'Bill' }]
    ]
  });
})();
