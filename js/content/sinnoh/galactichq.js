/* ============ galactichq.js — the Galactic Warehouse and Team Galactic's Veilstone Building ============
 * Chapter 54. After Lake Acuity (flag jupiter-acuity) the grunt at the door of the HQ in Veilstone City (veilstone.js)
 * runs off and drops a key: Looker of the International Police picks it up (flag looker-key) and opens the door of the
 * warehouse (flag looker-door). The basement: three rooms joined by warp panels, two grunts, the Galactic Key, a locked
 * door (`doorKey`: the `n` tiles of these maps open with that key) up into the HQ. 1F: the front door (it opens from
 * Veilstone with the key). 2F: a locked door and warp panels. 3F: Cyrus speaks to his grunts (flag cyrus-speech), a statue
 * with a report on Dialga and Palkia. 4F: Cyrus's office: he says the speech was a lie, battles, gives the Master Ball and
 * leaves for Mt. Coronet (flag cyrus-hq), which switches on the warp panel to the laboratory. There Saturn stands in the
 * way (flag saturn-hq); a switch frees Uxie, Mesprit and Azelf (flag trio-free), then `ending(54)`.
 * Platinum's Trainers, teams and items.
 */
(() => {
  const T = s => G.T(s);
  const LOOKER = { name: 'Looker' }, CYRUS = { name: 'Cyrus' }, SATURN = { name: 'Saturn' }, GRUNT = { name: 'Team Galactic Grunt' };
  const HOUSE = { loc: 'veilstone-city', tileset: 'indoor', palette: 'lab', music: 'gym', battleBg: 'indoor', region: 'sinnoh', doorKey: 'galactic-key' };
  const HQ = Object.assign({}, HOUSE, { loc: 'galactic-hq' });
  const GLAMEOW = ['charm', 'assist', 'captivate', 'slash'], MURKROW = ['night-shade', 'assurance', 'taunt', 'feint-attack'];
  const CROAGUNK = ['mud-bomb', 'sucker-punch', 'nasty-plot', 'poison-jab'], STUNKY = ['slash', 'toxic', 'night-slash', 'memento'];
  const GOLBAT = ['confuse-ray', 'air-cutter', 'mean-look', 'poison-fang'], HOUNDOUR = ['odor-sleuth', 'beat-up', 'fire-fang', 'feint-attack'];
  const grunt = o => Object.assign({ who: 'galactic', cls: 'team-galactic', sight: 4 }, o);

  // ---------------- The warehouse ----------------
  G.Maps.def(Object.assign({}, HOUSE, {
    id: 'galactic-warehouse',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWW',
      'bb^+++++++++bbb',
      '+++++++++++++++',
      'WWWWWWWnWWWWWWW',
      'bb+++++++++++bb',
      'b+++++++++++++b',
      '++++tt+++tt++++',
      '++++tt+++tt++++',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 10, to: 'veilstone', spot: 'warehouse-door' }, { x: 2, y: 2, to: 'galactic-warehouse-b1f', spot: 'stairs' }],
    spots: { door: [7, 10, 'up'], stairs: [2, 3, 'down'] },
    triggers: [{ x: 0, y: 6, w: 15, h: 1, if: ['looker-key', '!looker-door'], script: 'galactic.looker-door' }],
    npcs: [{ id: 'looker', who: 'looker', x: 8, y: 9, dir: 'up', if: 'scripted' }],
    items: [{ x: 12, y: 3, item: 'dusk-stone', flag: 'warehouse-dusk-stone' }]
  }));

  // Three rooms joined by warp panels (a panel's spot is the panel it lands on); the Galactic Key opens the way up to the HQ.
  G.Maps.def(Object.assign({}, HOUSE, {
    id: 'galactic-warehouse-b1f',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'W^+++bbWbb++++bbWbb+++W+^W',
      'W++++++W++++++++W+++++W++W',
      'W+tt+++W++tt++++W+++++W++W',
      'W+tt+++W++tt++++W+++++n++W',
      'W++++++W++++++++W+++++W++W',
      'W+w++w+W+w++++++W++w++W++W',
      'WWWWWWWWWWWWWWWWWWWWWWWWWW'
    ],
    warps: [
      { x: 1, y: 2, to: 'galactic-warehouse', spot: 'stairs' },
      { x: 24, y: 2, to: 'galactic-hq-1f', spot: 'from-below' },
      { x: 5, y: 7, to: 'galactic-warehouse-b1f', spot: 'pad-b' },
      { x: 9, y: 7, to: 'galactic-warehouse-b1f', spot: 'pad-a' },
      { x: 2, y: 7, to: 'galactic-warehouse-b1f', spot: 'pad-c' },
      { x: 19, y: 7, to: 'galactic-warehouse-b1f', spot: 'pad-a2' }
    ],
    spots: { stairs: [1, 3, 'down'], 'from-above': [24, 3, 'down'], 'pad-a': [5, 7, 'up'], 'pad-b': [9, 7, 'up'], 'pad-a2': [2, 7, 'up'], 'pad-c': [19, 7, 'up'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 5, y: 3, dir: 'left', team: [['golbat', 41, GOLBAT]],
        before: 'This basement is off limits! How did you even get down here?',
        defeat: 'That door was supposed to stay locked!',
        after: 'The panels on the floor are how we get around down here. Just step on one.' }),
      grunt({ id: 'grunt-b', x: 18, y: 3, dir: 'down', team: [['houndour', 38, HOUNDOUR], ['murkrow', 40, MURKROW]],
        before: 'Somebody left a key lying around down here. I am guarding it until they remember where it was!',
        defeat: 'Guarding things is harder than it looks.',
        after: 'That key opens every locked door in the building. Do not tell anyone I told you.' })
    ],
    items: [
      { x: 12, y: 2, item: 'tm21', flag: 'warehouse-tm21' },
      { x: 15, y: 7, item: 'tm36', flag: 'warehouse-tm36' },
      { x: 8, y: 3, item: 'zinc', flag: 'warehouse-zinc' },
      { x: 21, y: 2, item: 'galactic-key', flag: 'galactic-key' }
    ]
  }));

  // ---------------- The building ----------------
  G.Maps.def(Object.assign({}, HQ, {
    id: 'galactic-hq-1f',
    rows: [
      'WWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWW',
      'W^+++WPP+++++b^+W',
      'W++++W++++++++++W',
      'W++++n++++++++++W',
      'W++++W+++tt+++++W',
      'W+tt+W+++tt+++++W',
      'W++++W++++++++++W',
      'WWWWWW++++++++++W',
      'WWWWWW++++X+++++W'
    ],
    warps: [
      { x: 10, y: 9, to: 'veilstone', spot: 'hq-door' },
      { x: 1, y: 2, to: 'galactic-warehouse-b1f', spot: 'from-above' },
      { x: 14, y: 2, to: 'galactic-hq-2f', spot: 'from-below' }
    ],
    spots: { door: [10, 9, 'up'], 'from-below': [1, 3, 'down'], 'from-above': [14, 3, 'down'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 8, y: 3, dir: 'down', team: [['glameow', 41, ['assist', 'captivate', 'slash', 'sucker-punch']]],
        before: 'You came in the back way? Nobody comes in the back way!',
        defeat: 'From now on I will watch the back way.',
        after: 'The stairs are right over there. Not that it will do you any good.' }),
      { id: 'fredrick', who: 'scientist', cls: 'scientist', name: 'Fredrick', x: 13, y: 6, dir: 'left', sight: 4,
        team: [['kirlia', 40, ['psychic', 'magical-leaf', 'hypnosis', 'future-sight']], ['kadabra', 40, ['psychic', 'psycho-cut', 'thunder-wave', 'recover']]],
        before: 'An intruder! Good. Let me record how quickly you lose.',
        defeat: 'The result does not match my prediction...',
        after: 'We drew something remarkable out of the three lake Pokémon: a chain, as red as a warning light. The boss has plans for it.' }
    ],
    items: [{ x: 15, y: 8, item: 'tm49', flag: 'hq-tm49' }]
  }));

  G.Maps.def(Object.assign({}, HQ, {
    id: 'galactic-hq-2f',
    rows: [
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'W^++bbbWbb+++W++++^W',
      'W++++++W+++++W+++++W',
      'W++tt++W++t++W++tt+W',
      'W++tt++n++t++W++tt+W',
      'W++++++W+++++W+++++W',
      'W++++++W++w++W+w+++W',
      'WWWWWWWWWWWWWWWWWWWW'
    ],
    warps: [
      { x: 1, y: 2, to: 'galactic-hq-1f', spot: 'from-above' },
      { x: 18, y: 2, to: 'galactic-hq-3f', spot: 'from-below' },
      { x: 10, y: 7, to: 'galactic-hq-2f', spot: 'pad-east' },
      { x: 15, y: 7, to: 'galactic-hq-2f', spot: 'pad-west' }
    ],
    spots: { 'from-below': [1, 3, 'down'], 'from-above': [18, 3, 'down'], 'pad-west': [10, 7, 'up'], 'pad-east': [15, 7, 'up'] },
    trainers: [
      grunt({ id: 'grunt-a', x: 5, y: 3, dir: 'down', team: [['glameow', 37, GLAMEOW], ['murkrow', 38, MURKROW], ['croagunk', 39, CROAGUNK]],
        before: 'Members only on this floor. Do you have a card? I did not think so!',
        defeat: 'I should have asked for the card first.',
        after: 'There is a lock on that door. If you have the key, it is no business of mine.' }),
      grunt({ id: 'grunt-b', x: 9, y: 3, dir: 'right', team: [['golbat', 40, GOLBAT], ['golbat', 38, ['wing-attack', 'confuse-ray', 'air-cutter', 'mean-look']]],
        before: 'The boss is giving a speech today, and I will not miss it because of you!',
        defeat: 'Now I am going to be late.',
        after: 'Step on that panel and you will come out on the far side of the wall.' }),
      grunt({ id: 'grunt-c', x: 15, y: 3, dir: 'down', team: [['golbat', 39, GOLBAT], ['houndour', 39, HOUNDOUR]],
        before: 'You used the panel? Those are for staff!',
        defeat: 'I will be writing a very angry report.',
        after: 'Everyone is gathering upstairs. You could go and listen, I suppose.' })
    ],
    items: [{ x: 12, y: 7, item: 'max-potion', flag: 'hq-max-potion' }, { x: 18, y: 7, item: 'max-revive', flag: 'hq-max-revive' }]
  }));

  G.Maps.def(Object.assign({}, HQ, {
    id: 'galactic-hq-3f',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWW',
      'W^+j++W++rrrr++W+++^+W',
      'W+++++W++rrrr++W+++++W',
      'W+++++n++++++++n+++++W',
      'W+tt++W++++++++W++tt+W',
      'W+tt++W++++++++W++tt+W',
      'W+++++W++++++++W+++++W',
      'W+++++W++++++++W+++++W',
      'WWWWWWWWWWWWWWWWWWWWWW'
    ],
    warps: [{ x: 19, y: 2, to: 'galactic-hq-2f', spot: 'from-above' }, { x: 1, y: 2, to: 'galactic-hq-4f', spot: 'from-below' }],
    spots: { 'from-below': [19, 3, 'down'], 'from-above': [1, 3, 'down'] },
    signs: { '3,2': 'A report is fixed to the base of the statue: "Dialga, said to rule time. Palkia, said to rule space. The Red Chain can bind them both."' },
    triggers: [{ x: 14, y: 4, w: 1, h: 1, if: '!cyrus-speech', script: 'galactic.speech' }],
    npcs: [
      { id: 'boss', who: 'cyrus', x: 10, y: 3, dir: 'down', if: '!cyrus-speech', say: 'The world as it is cannot be mended.' },
      { id: 'crowd1', who: 'galactic', x: 8, y: 6, dir: 'up', if: '!cyrus-speech', say: 'Quiet! The boss is speaking!' },
      { id: 'crowd2', who: 'galactic', x: 10, y: 6, dir: 'up', if: '!cyrus-speech', say: 'Quiet! The boss is speaking!' },
      { id: 'crowd3', who: 'galactic', x: 12, y: 6, dir: 'up', if: '!cyrus-speech', say: 'Quiet! The boss is speaking!' },
      { id: 'crowd4', who: 'galactic', x: 9, y: 7, dir: 'up', if: '!cyrus-speech', say: 'Quiet! The boss is speaking!' },
      { id: 'crowd5', who: 'galactic', x: 11, y: 7, dir: 'up', if: '!cyrus-speech', say: 'Quiet! The boss is speaking!' }
    ],
    trainers: [
      grunt({ id: 'grunt-a', x: 17, y: 4, dir: 'down', team: [['murkrow', 39, MURKROW], ['stunky', 39, STUNKY]],
        before: 'The meeting is about to start, and you are not on the list!',
        defeat: 'You are still not on the list.',
        after: 'The boss always speaks in the room behind that door. You will want the key.' }),
      grunt({ id: 'grunt-b', x: 20, y: 7, dir: 'left', team: [['stunky', 38, STUNKY], ['croagunk', 40, CROAGUNK]],
        before: 'A new world is coming, and I am going to be in it!',
        defeat: 'It will still come. You will see.',
        after: 'The boss promised us a place in the new world. All of us.' }),
      grunt({ id: 'grunt-c', x: 4, y: 4, dir: 'right', team: [['croagunk', 38, CROAGUNK], ['stunky', 38, STUNKY], ['glameow', 38, GLAMEOW]],
        before: 'Nobody gets to the boss. Not while I am standing here!',
        defeat: 'I am still standing, at least.',
        after: 'The boss will not be as easy as me. I hope.' }),
      grunt({ id: 'grunt-d', x: 3, y: 7, dir: 'up', team: [['stunky', 41, STUNKY]],
        before: 'Only one Pokémon, but it is a very smelly one!',
        defeat: 'I can still smell it on my uniform.',
        after: 'The stairs by the statue go up to the boss\'s office.' })
    ],
    items: [
      { x: 1, y: 8, item: 'dubious-disc', flag: 'hq-dubious-disc' },
      { x: 20, y: 8, item: 'max-elixir', flag: 'hq-max-elixir' },
      { x: 13, y: 8, item: 'elixir', flag: 'hq-elixir', hidden: true },
      { x: 5, y: 2, item: 'protein', flag: 'hq-protein', hidden: true }
    ]
  }));

  G.Maps.def(Object.assign({}, HQ, {
    id: 'galactic-hq-4f',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWW',
      'bbb+++ttt+++bbb',
      '+++++++++++++++',
      '+p+++++++++w+p+',
      '+++++rrrrr+++++',
      '+++++rrrrr+++++',
      '+++++rrrrr+++++',
      '+++++++++++++^+'
    ],
    warps: [
      { x: 13, y: 8, to: 'galactic-hq-3f', spot: 'from-above' },
      { x: 11, y: 4, to: 'galactic-hq-lab', spot: 'pad', if: 'cyrus-hq', locked: 'galactic.pad-off' }
    ],
    spots: { 'from-below': [13, 7, 'up'], pad: [11, 4, 'down'] },
    trainers: [
      { id: 'cyrus', who: 'cyrus', cls: 'galactic-boss', name: 'Cyrus', x: 7, y: 3, dir: 'down', sight: 3, ai: 'leader', if: '!cyrus-hq',
        team: [['sneasel', 44, ['slash', 'ice-punch', 'quick-attack', 'screech']],
               ['crobat', 44, ['poison-fang', 'air-cutter', 'bite', 'supersonic']],
               ['honchkrow', 46, ['drill-peck', 'night-shade', 'astonish', 'feint-attack'], 'sitrus-berry']],
        items: { 'super-potion': 1 },
        before: 'So it is you again. You heard my speech, I suppose. It was a lie. There is no place for them in the new world, for it will hold one person alone: me. Spirit only spoils a world. Come, and I will show you what it is worth.',
        defeat: 'I see. So it can still do that.',
        win: 'galactic.cyrus-win' }
    ],
    items: [{ x: 1, y: 7, item: 'full-restore', flag: 'hq-full-restore' }, { x: 1, y: 3, item: 'razor-claw', flag: 'hq-razor-claw', hidden: true }]
  }));

  // The control room (south), with Saturn in the one way through, and the laboratory: three glass tanks and the switch.
  G.Maps.def(Object.assign({}, HQ, {
    id: 'galactic-hq-lab',
    rows: [
      'WWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWW',
      'W+===+++===+++===+W',
      'W+=~=+++=~=+++=~=+W',
      'W+===+++===+++===+W',
      'W+++++++++++++++P+W',
      'WWWWWWWWW+WWWWWWWWW',
      'WPP+++++++++++++PPW',
      'W+++++++++++++++++W',
      'W+++++++++w+++++++W',
      'W+++++++++++++++++W'
    ],
    warps: [{ x: 10, y: 9, to: 'galactic-hq-4f', spot: 'pad' }],
    spots: { pad: [10, 9, 'up'] },
    signs: { '16,5': { script: 'galactic.switch' } },
    npcs: [
      { id: 'uxie', who: 'uxie', mon: 'uxie', x: 3, y: 3, dir: 'down', fixed: true, swim: true, if: '!trio-free', say: 'Uxie floats in the glass tank with its eyes shut tight.' },
      { id: 'mesprit', who: 'mesprit', mon: 'mesprit', x: 9, y: 3, dir: 'down', fixed: true, swim: true, if: '!trio-free', say: 'Mesprit floats in the glass tank. It looks very sad.' },
      { id: 'azelf', who: 'azelf', mon: 'azelf', x: 15, y: 3, dir: 'down', fixed: true, swim: true, if: '!trio-free', say: 'Azelf floats in the glass tank. It is not moving at all.' },
      { id: 'saturn2', who: 'saturn', x: 12, y: 5, dir: 'left', if: ['saturn-hq', '!trio-free'], say: 'The switch is over there. Go on. It no longer matters to us.' },
      { id: 'looker', who: 'looker', x: 9, y: 6, dir: 'up', if: 'scripted' }
    ],
    trainers: [
      { id: 'saturn', who: 'saturn', cls: 'galactic-commander-m', name: 'Saturn', x: 9, y: 6, dir: 'down', sight: 3, ai: 'leader', if: '!saturn-hq',
        team: [['golbat', 42, ['air-cutter', 'bite', 'poison-fang', 'confuse-ray']],
               ['bronzor', 42, ['gyro-ball', 'extrasensory', 'shadow-ball', 'confuse-ray']],
               ['toxicroak', 44, ['poison-jab', 'brick-break', 'x-scissor', 'feint-attack'], 'sitrus-berry']],
        before: 'The boss sent you to me, did he? Then you beat him. I had a feeling you would. Still, I have my orders, and nobody passes this door.',
        defeat: 'That makes it twice. I will not pretend to be surprised.',
        win: 'galactic.saturn-win' }
    ]
  }));

  /** Veilstone City: the grunt at the door runs off, and Looker picks up what he dropped. */
  async function keyDrop(h) {
    const F = G.Field;
    await h.say(T('You! You are the kid who keeps turning up at the lakes!'), GRUNT);
    await h.say(T('There is nothing here for you! And I have never heard of any storage key, so do not ask me about it!'), GRUNT);
    await h.say(T('I just remembered something I have to do. Somewhere else. Far from here!'), GRUNT);
    await h.fade('out', 0.3);
    h.hide('grunt');
    h.show('looker');
    h.face('looker', 'player');
    await h.fade('in', 0.3);
    await h.say(T('The grunt ran off, and a stranger in a long coat stepped up from nowhere and picked something off the ground.'));
    await h.say(T('Aha! He has dropped the very thing I was after. A most fortunate accident.'), LOOKER);
    await h.say(T('Forgive me, I should introduce myself. They call me Looker, of the International Police. Do not tell anyone.'), LOOKER);
    await h.say(T('This key opens their warehouse in the north-east of the city, and the warehouse is the back way into this building.'), LOOKER);
    await h.say(T('The three Pokémon from the lakes must be somewhere inside. It is too much for one detective.'), LOOKER);
    while (await h.choice(T('Will you come in with me?'), LOOKER) !== 0)
      await h.say(T('I understand. It is a great deal to ask. But those Pokémon cannot wait for long.'), LOOKER);
    await h.say(T('Splendid! I will meet you at the warehouse. Walk casually, and try not to look like a detective.'), LOOKER);
    await h.fade('out', 0.3);
    h.hide('looker');
    F.setFlag('looker-key');
    await h.fade('in', 0.3);
  }

  /** The warehouse: Looker opens the security door and goes down first. */
  async function lookerDoor(h) {
    const F = G.Field;
    if (F.flag('looker-door')) return;
    h.show('looker');
    await h.say(T('There you are. Excellent timing. Allow me.'), LOOKER);
    await h.walkTo('looker', 7, 5);
    h.face('looker', 'up');
    h.sfx('click');
    F.setFlag('door:galactic-warehouse:7,4');
    await h.say(T('Looker used the storage key. The door slid open!'));
    await h.say(T('The stairs beyond go down to the basement, and from there the way runs under the city to their building.'), LOOKER);
    await h.say(T('Look out for the panels on the floor down there, and for a key to the doors of the building. I will search the rooms up here.'), LOOKER);
    await h.walkTo('looker', 2, 3);
    h.hide('looker');
    F.setFlag('looker-door');
  }

  /** 3F: everyone is in the meeting room. */
  async function speech(h) {
    const F = G.Field;
    if (F.flag('cyrus-speech')) return;
    await h.say(T('Friends. Look at the world outside these walls. It is unfinished and weak, and it is ruled by feelings.'), CYRUS);
    await h.say(T('Soon the power of time and space will be in our hands. With it we will make a new world, and each of you will have your place there.'), CYRUS);
    await h.say(T('Long live Team Galactic!'), GRUNT);
    await h.say(T('The day is close. Go back to your posts.'), CYRUS);
    await h.fade('out', 0.4);
    F.setFlag('cyrus-speech');
    await h.fade('in', 0.4);
    await h.say(T('Cyrus and the grunts left the meeting room.'));
  }

  /** The laboratory: the switch frees the three lake Pokémon, and the chapter ends. */
  async function freeTrio(h) {
    const F = G.Field;
    if (F.flag('trio-free')) { await h.say(T('The console has gone dark. There is nothing more it can do.')); return; }
    if (await h.choice(T('There is a large red switch on the console. Press it?'), {}) !== 0) return;
    h.sfx('click');
    await h.say(T('The glass tanks slid open!'));
    h.sfx('cry');
    await h.say(T('{uxie}, {mesprit} and {azelf} shot out of their tanks, circled the room once and were gone, each to its own lake.'),
      { vars: { uxie: G.Names.mon(480), mesprit: G.Names.mon(481), azelf: G.Names.mon(482) } });
    h.hide('uxie'); h.hide('mesprit'); h.hide('azelf');
    await h.say(T('So they go home. It changes nothing. The boss has the Red Chain, and that was all he ever wanted from them.'), SATURN);
    await h.say(T('He has gone up Mt. Coronet to call the two he really wants. If he can truly make a new world, I wonder who will be left in it.'), SATURN);
    await h.fade('out', 0.4);
    h.hide('saturn2');
    h.show('looker');
    F.setFlag('trio-free');
    await h.fade('in', 0.4);
    await h.say(T('{player}! Three Pokémon just flew straight through the wall past my ear! You did it!'), LOOKER);
    await h.say(T('I will take care of what is left of this building. But Cyrus has gone to Mt. Coronet, and I do not think the International Police can climb that high.'), LOOKER);
    await h.say(T('Rest, and get ready. I have a feeling this is not over.'), LOOKER);
    h.hide('looker');
    // The end of the fifty-fourth chapter (credits-ui.js).
    if (G.CreditsUI) await G.CreditsUI.ending(54); else F.setFlag('chapter-54-done');
  }

  G.Script.def({
    'galactic.key-drop': [['js', keyDrop]],
    'galactic.looker-door': [['js', lookerDoor]],
    'galactic.speech': [['js', speech]],
    'galactic.pad-off': [['say', 'The warp panel is switched off. Nothing happens.']],
    'galactic.cyrus-win': [
      ['say', 'What I needed from the lake Pokémon is already mine: the Red Chain. The three of them are of no more use to me.', CYRUS],
      ['say', 'Take this. It is a ball that never fails. There will be no need for it in my world.', CYRUS],
      ['giveItem', 'master-ball', 1],
      ['say', 'If you want those three, they are in the laboratory, through the warp panel in this room. Saturn is there. I am leaving for Mt. Coronet.', CYRUS],
      ['fade', 'out', 0.4], ['setFlag', 'cyrus-hq'], ['fade', 'in', 0.4],
      ['say', 'Cyrus left the room. The warp panel began to hum.']
    ],
    'galactic.saturn-win': [
      ['say', 'Enough. The machine has done its work, so it no longer matters who touches it.', SATURN],
      ['say', 'The switch is on the console, behind me. Do as you like.', SATURN],
      ['fade', 'out', 0.3], ['setFlag', 'saturn-hq'], ['fade', 'in', 0.3]
    ],
    'galactic.switch': [['js', freeTrio]]
  });
})();
