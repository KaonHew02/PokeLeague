/* ============ radio.js — Team Rocket takes the Radio Tower ============
 * Chapter 17, the end of the chapter. After the Glacier Badge the radio carries Team Rocket's
 * message (script radio.broadcast in Mahogany; flag rocket-broadcast): they have taken Goldenrod's
 * Radio Tower (from flag pryce-beaten until flag radio-freed). Its stairs are open: Grunts on
 * every floor. On 3F the "Director" is Petrel in disguise: beaten, he drops the Basement Key.
 * The key opens the warehouse under the Goldenrod Underground (its entrance is a new building in
 * the city), where the thief battles you on the way (losing allowed, flag underground-rival)
 * and Grunts guard the real Director, tied up: he gives the code of 3F's locked stairs (flag
 * director-saved). On 4F Ariana, on 5F Archer: beaten, Team Rocket breaks up again (flag
 * radio-freed), the Director gives TM24 Thunderbolt (flag got-tm24), and the chapter ends
 * (`ending(17)`).
 */
const RADIO_TOWER = { loc: 'radio-tower', region: 'johto', tileset: 'indoor', palette: 'lab', music: 'cave', battleBg: 'indoor' };
const ROCKET_DAYS = ['pryce-beaten', '!radio-freed'];

G.Maps.def(Object.assign({
  id: 'radio-tower-2f',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '^+bb+++++++b+^', '++++++++++++++', '++==++++++==++', '++++++++++++++', 'p++++++++++++p', '++++++++++++++'],
  warps: [{ x: 13, y: 2, to: 'radio-tower-1f', spot: 'from-above' }, { x: 0, y: 2, to: 'radio-tower-3f', spot: 'from-below' }],
  spots: { 'from-below': [13, 3, 'down'], 'from-above': [0, 3, 'down'] },
  npcs: [{ id: 'dj', who: 'gentleman', x: 7, y: 5, move: 'look', if: 'radio-freed',
           say: 'This is the music studio. Thanks to you, we are back on the air!' }],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 4, y: 5, dir: 'right', sight: 3, if: ROCKET_DAYS,
      team: [['zubat', 33], ['golbat', 35]],
      before: 'This studio is ours! From now on, the radio plays only Team Rocket!',
      defeat: 'Off the air...',
      after: 'The Director is on the floor above. He works for us now. Ha!' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 10, y: 3, dir: 'down', sight: 3, if: ROCKET_DAYS,
      team: [['grimer', 34], ['muk', 35]],
      before: 'You again? How many times do we have to tell you to go away?',
      defeat: 'Many more times, it seems...',
      after: 'When Giovanni hears our broadcast, he will come back to lead us!' }
  ]
}, RADIO_TOWER));

G.Maps.def(Object.assign({
  id: 'radio-tower-3f',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '^+bb+++++++b+^', '++++++++++++++', '++++++==++++++', '++++++++++++++', 'p++++++++++++p', '++++++++++++++'],
  warps: [{ x: 0, y: 2, to: 'radio-tower-2f', spot: 'from-above' },
          { x: 13, y: 2, to: 'radio-tower-4f', spot: 'from-below', if: 'director-saved', locked: 'radio.door-locked' }],
  spots: { 'from-below': [0, 3, 'down'], 'from-above': [13, 3, 'down'] },
  npcs: [{ id: 'dj', who: 'lass', x: 7, y: 5, move: 'look', if: 'radio-freed',
           say: 'The Pokémon Talk show is recorded on this floor. Our guest today is Professor Oak!' }],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 3, y: 5, dir: 'right', sight: 3, if: ROCKET_DAYS,
      team: [['koffing', 34], ['weezing', 36]],
      before: 'Nobody gets near the Director! He is very busy... being our Director.',
      defeat: 'Okay, you can get near him...',
      after: 'The Director up there is a little odd today. Don\'t ask why.' },
    { id: 'petrel', who: 'gentleman', cls: 'executive', name: 'Petrel', x: 10, y: 4, dir: 'down', sight: 2, if: ROCKET_DAYS,
      team: [['koffing', 34], ['koffing', 34], ['koffing', 34], ['weezing', 37]],
      before: 'Ah, a visitor! I am the Director of the Radio Tower... Ha! Fooled you! It is me, Petrel, in disguise! The real Director is locked away!',
      defeat: 'Gah! My disguise did not help at all!',
      win: 'radio.petrel-win' }
  ]
}, RADIO_TOWER));

G.Maps.def(Object.assign({
  id: 'radio-tower-4f',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '^+bb+++++++b+^', '++++++++++++++', '++==++++++==++', '++++++++++++++', 'p++++++++++++p', '++++++++++++++'],
  warps: [{ x: 13, y: 2, to: 'radio-tower-3f', spot: 'from-above' }, { x: 0, y: 2, to: 'radio-tower-5f', spot: 'from-below' }],
  spots: { 'from-below': [13, 3, 'down'], 'from-above': [0, 3, 'down'] },
  npcs: [{ id: 'dj', who: 'pokefan', x: 7, y: 5, move: 'look', if: 'radio-freed',
           say: 'I host the Lucky Number show. Today\'s lucky number is... the number of Rockets you beat!' }],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 11, y: 6, dir: 'left', sight: 3, if: ROCKET_DAYS,
      team: [['raticate', 35], ['arbok', 36]],
      before: 'Our executive is right behind me. You will not get past!',
      defeat: 'You got past...',
      after: 'Ariana is the toughest of us. Well, almost.' },
    { id: 'ariana', who: 'rocket', cls: 'executive', name: 'Ariana', x: 6, y: 4, dir: 'down', sight: 3, if: ROCKET_DAYS,
      team: [['arbok', 35], ['vileplume', 35], ['murkrow', 37]],
      before: 'So you are the child who keeps ruining our plans. I am Ariana, an executive of Team Rocket. You will regret coming here!',
      defeat: 'How... how could I lose to you?',
      after: 'Archer is waiting at the top. He will not be as kind as I was.' }
  ]
}, RADIO_TOWER));

G.Maps.def(Object.assign({
  id: 'radio-tower-5f',
  rows: ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '^+bb++rr+++b+p', '++++++rr++++++', '++++++++++++++', '++++++++++++++', 'p++++++++++++p', '++++++++++++++'],
  warps: [{ x: 0, y: 2, to: 'radio-tower-4f', spot: 'from-above' }],
  spots: { 'from-below': [0, 3, 'down'] },
  npcs: [{ id: 'director', who: 'gentleman', x: 10, y: 3, dir: 'down', if: 'radio-freed', script: 'radio.director-5f' }],
  trainers: [
    { id: 'archer', who: 'rocket', cls: 'executive', name: 'Archer', x: 7, y: 4, dir: 'down', sight: 3, if: ROCKET_DAYS,
      team: [['houndour', 36], ['koffing', 36], ['houndoom', 39]],
      before: 'You have come this far... I am Archer. While Giovanni is away, I lead Team Rocket. We will call him back, and you will not stop us!',
      defeat: 'I... lost. Forgive me, Giovanni.',
      win: 'radio.archer-win' }
  ]
}, RADIO_TOWER));

// ---------------- the Goldenrod Underground ----------------
G.Maps.def({
  id: 'underground-gate', loc: 'goldenrod-city', region: 'johto', tileset: 'indoor', palette: 'house', music: 'town', battleBg: 'indoor',
  rows: ['WWWWWWWWWWW', 'WWWWWWWWWWW', 'bbb___p___^', '___________', '___________', '___________', '___________', '____X______'],
  warps: [{ x: 4, y: 7, to: 'goldenrod', spot: 'underground-door' }, { x: 10, y: 2, to: 'goldenrod-underground', spot: 'from-above' }],
  spots: { door: [4, 7, 'up'], 'from-below': [10, 3, 'down'] },
  npcs: [{ id: 'man', who: 'gentleman', x: 3, y: 4, dir: 'right',
           say: 'The Underground runs beneath the whole city. There are shops down there, and a warehouse at the far end.' }]
});

G.Maps.def({
  id: 'goldenrod-underground', loc: 'goldenrod-city', region: 'johto', tileset: 'indoor', palette: 'gym', music: 'cave', battleBg: 'indoor',
  rows: ['WWWWWWWWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWWWWWWWW', '^+++b+++++++++++++++b+++^+', '++++++++++++++++++++++++++',
         '++++++++++++++++++++++++++', '++++++++++++++++++++++++++', '++++b+++++++++++++++b+++++', '++++++++++++++++++++++++++'],
  warps: [{ x: 0, y: 2, to: 'underground-gate', spot: 'from-below' },
          { x: 24, y: 2, to: 'underground-warehouse', spot: 'from-above', if: 'has:basement-key', locked: 'underground.locked' }],
  spots: { 'from-above': [1, 3, 'down'], 'from-below': [24, 3, 'down'] },
  npcs: [
    { id: 'rival', who: 'silver', x: 12, y: 4, dir: 'left', if: 'scripted' },
    { id: 'merchant', who: 'hiker', x: 7, y: 7, dir: 'up', script: [
      ['say', 'Herbs! Bitter, but they work. Well... I sell potions too.'],
      ['shop', ['super-potion', 'hyper-potion', 'full-heal', 'revive']]
    ] },
    { id: 'nerd', who: 'supernerd', x: 17, y: 7, move: 'look',
      say: 'That door at the end leads to a warehouse. It has been locked since men in black moved in.' }
  ],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 21, y: 4, dir: 'left', sight: 4, if: ROCKET_DAYS,
      team: [['zubat', 34], ['grimer', 34], ['raticate', 35]],
      before: 'This tunnel is closed! Team Rocket business!',
      defeat: 'Closed for... repairs.',
      after: 'You need a key for the warehouse anyway. And only our executive has it.' }
  ],
  triggers: [{ x: 8, y: 3, w: 2, h: 5, if: ['pryce-beaten', '!underground-rival'], script: 'underground.rival' }]
});

G.Maps.def({
  id: 'underground-warehouse', loc: 'goldenrod-city', region: 'johto', tileset: 'indoor', palette: 'hideout', music: 'cave', battleBg: 'indoor',
  rows: ['WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'bb++bb++++++bb^+', '++++++++++++++++', '++bb++bbbb++bb++', '++++++++++++++++',
         'bb++++bb++bb++++', '++++++++++++++++', '++bbbb++++bbbb++', '++++++++++++++++', '++++++++++++++++', '++++++++++++++++'],
  warps: [{ x: 14, y: 2, to: 'goldenrod-underground', spot: 'from-below' }],
  spots: { 'from-above': [14, 3, 'down'] },
  npcs: [
    { id: 'director', who: 'gentleman', x: 2, y: 10, dir: 'right', if: '!director-saved', script: 'radio.director' },
    { id: 'director2', who: 'gentleman', x: 2, y: 10, dir: 'right', if: ['director-saved', '!radio-freed'],
      say: 'I will wait here until the tower is safe. Please, hurry!' }
  ],
  trainers: [
    { id: 'grunt1', who: 'rocket', cls: 'team-rocket', x: 8, y: 5, dir: 'down', sight: 3, if: ROCKET_DAYS,
      team: [['koffing', 35], ['koffing', 35]],
      before: 'How did you get the key? Did that fool Petrel lose it?',
      defeat: 'He definitely lost it...',
      after: 'We were storing all the stolen things down here.' },
    { id: 'grunt2', who: 'rocket', cls: 'team-rocket', x: 5, y: 9, dir: 'right', sight: 4, if: ROCKET_DAYS,
      team: [['ekans', 34], ['arbok', 36]],
      before: 'The Director stays here until Giovanni comes back! Go away!',
      defeat: 'Giovanni is not coming back, is he...',
      after: 'Fine, talk to the old man. See if I care.' }
  ],
  items: [{ x: 15, y: 11, item: 'ultra-ball', flag: 'warehouse-ultra-ball' }]
});

(() => {
  const T = s => G.T(s);
  const RIVAL2 = { name: '{rival2}' }, DIRECTOR = { name: 'Director' };
  /** The thief's starter, fully evolved (Meganium, Typhlosion, Feraligatr). */
  const final = sp => ({ 152: 154, 155: 157, 158: 160 })[sp] || 157;

  async function rival(h) {
    const F = G.Field, S = F.save, me = G.World.player;
    F.setFlag('underground-rival');
    h.place('rival', Math.min(me.x + 4, 24), me.y, 'left');
    h.show('rival');
    await h.walkTo('rival', me.x + 1, me.y);
    h.face('rival', 'player'); h.face('player', 'rival');
    await h.say(T('...You. I heard Team Rocket took the Radio Tower. Pathetic, hiding in a crowd like that.'), RIVAL2);
    await h.say(T('I lost to a Dragon Trainer called Lance. He said I do not care about my Pokémon. What would he know?'), RIVAL2);
    await h.say(T('I will prove I am strong. Starting with you!'), RIVAL2);
    await h.battle({ id: 'rival2-underground', who: 'silver', name: S.rival2.name || '???', prize: 50, ai: 'basic',
                     team: [['golbat', 34], ['magneton', 33], ['haunter', 34], ['sneasel', 35], [final(S.rival2.starter), 37]] }, { canLose: true });
    await h.say(T('...Why? I keep getting stronger, and still... Never mind. I do not need your pity.'), RIVAL2);
    await h.walkTo('rival', Math.min(me.x + 6, 24), me.y);
    h.hide('rival');
  }

  async function director(h) {
    const F = G.Field;
    await h.say(T('You came to save me? Thank you! Team Rocket tied me up down here and took over my tower.'), DIRECTOR);
    await h.say(T('The impostor upstairs is wearing my clothes. Disgraceful! Listen: the stairs on the third floor are locked with a code. Here it is.'), DIRECTOR);
    F.setFlag('director-saved');
    await h.say(T('{player} learned the code of the stairs!'));
    await h.say(T('Their leaders are on the top floors. Please, take my tower back!'), DIRECTOR);
  }

  async function director5f(h) {
    const F = G.Field;
    if (F.flag('got-tm24')) { await h.say(T('Our radio is back on the air, all thanks to you. Tune in any time!'), DIRECTOR); return; }
    await h.say(T('You did it! Team Rocket is gone, and the Radio Tower is ours again. Thank you!'), DIRECTOR);
    await h.say(T('Please, take this. A radio tower runs on electricity, so this seems fitting: TM24, Thunderbolt.'), DIRECTOR);
    F.giveItem('tm24', 1);
    F.setFlag('got-tm24');
    const j = h.jingle('item');
    await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('tm24') } });
    await j;
  }

  async function archerWin(h) {
    const F = G.Field;
    await h.say(T('We could not even do this much in Giovanni\'s absence... Team Rocket is finished. I declare it disbanded!'), { name: 'Archer' });
    F.setFlag('radio-freed');
    h.show('director');
    await director5f(h);
    // The end of the seventeenth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(17); else F.setFlag('chapter-17-done');
  }

  G.Script.def({
    'radio.broadcast': [
      ['setFlag', 'rocket-broadcast'],
      ['say', 'Your radio crackles... and a voice breaks in:'],
      ['say', '"Attention, Johto! This is Team Rocket! We have taken over the Radio Tower in Goldenrod City!"'],
      ['say', '"Giovanni! Wherever you are, if you can hear us, come back! Team Rocket is waiting for you!"'],
      ['say', 'The broadcast ends in a burst of static.']
    ],
    'radio.door-locked': [['say', 'The stairs are blocked by a locked door. It needs a code to open.']],
    'radio.petrel-win': [
      ['say', 'Fine, take it! The real Director is locked in the warehouse under the Underground. Not that it matters!', { name: 'Petrel' }],
      ['giveItem', 'basement-key', 1]
    ],
    'underground.locked': [['say', 'The door to the warehouse is locked. It needs a key.']],
    'underground.rival': [['js', rival]],
    'radio.director': [['js', director]],
    'radio.director-5f': [['js', director5f]],
    'radio.archer-win': [['js', archerWin]]
  });
})();
