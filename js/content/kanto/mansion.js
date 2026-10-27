/* ============ mansion.js — the Pokémon Mansion ============
 * Chapter 7, part 4. The burnt-out home of researchers on Cinnabar Island (cinnabar.js), full of
 * wild Pokémon (on any step, as in a cave), Burglars and Scientists. Statues hide a switch (indoor
 * tile `j`): each press flips flag mansion-switch, which opens some gates (`y`, map `bars`) and
 * closes others on every floor. The way: 2F, then 3F, whose switch opens the room with a hole in
 * the floor (`O`): it drops you into a closed room of 1F with the stairs to B1F, where the Secret
 * Key for Blaine's Gym lies behind another gate. Every part of the house has a switch within reach,
 * so no gate can shut you in for good. Torn journal pages tell of Mew and Mewtwo.
 */
G.Maps.def({
  id: 'pokemon-mansion-1f', loc: 'pokemon-mansion', tileset: 'indoor', palette: 'mansion', music: 'cave', battleBg: 'indoor', cave: true, escape: true,
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWW',
    'W^___W__b_____b___^W',
    'W____W_____________W',
    'W____y_____________W',
    'W_j__W___t____t____W',
    'WWWWWW_____________W',
    'W__________________W',
    'W__________rrrr____W',
    'Wp_________rrrr___pW',
    'W__________________W',
    'W__t_______________W',
    'WWWWWWWWWXWWWWWWWWWW'
  ],
  warps: [
    { x: 9, y: 12, to: 'cinnabar', spot: 'mansion-door' },
    { x: 18, y: 2, to: 'pokemon-mansion-2f', spot: 'stairs-1f' },
    { x: 1, y: 2, to: 'pokemon-mansion-b1f', spot: 'stairs' }
  ],
  spots: { door: [9, 12, 'up'], 'stairs-2f': [18, 2, 'down'], 'stairs-b1f': [1, 2, 'down'], west: [3, 3, 'down'] },
  bars: [{ x: 5, y: 4, if: 'mansion-switch' }],
  signs: {
    '2,5': { script: 'mansion.switch' },
    '9,5': 'A burnt notice: "Danger! This building is unsafe. Keep out!"',
    '3,11': 'A charred guest book. The last visitor signed it many years ago.'
  },
  trainers: [
    { id: 'ted', who: 'scientist', cls: 'scientist', name: 'Ted', x: 12, y: 7, dir: 'down', sight: 3,
      team: [['magnemite', 34], ['magneton', 35]],
      before: 'This mansion is full of secrets. I will not let you find them first!',
      defeat: 'Short-circuited...',
      after: 'The statues here are not just decoration. Look at them closely.' },
    { id: 'simon', who: 'burglar', cls: 'burglar', name: 'Simon', x: 16, y: 10, dir: 'left', sight: 4,
      team: [['growlithe', 34], ['ponyta', 35]],
      before: 'Huh? I am not stealing anything! I am just... looking. Battle!',
      defeat: 'Caught red-handed...',
      after: 'There is treasure in this house, I know it. I just cannot get past the gates.' }
  ],
  items: [
    { x: 4, y: 2, item: 'carbos', flag: 'mansion-1f-carbos' },
    { x: 17, y: 3, item: 'escape-rope', flag: 'mansion-1f-rope' }
  ],
  encounters: { walk: '@pokemon-mansion-1f' }
});

G.Maps.def({
  id: 'pokemon-mansion-2f', loc: 'pokemon-mansion', tileset: 'indoor', palette: 'mansion', music: 'cave', battleBg: 'indoor', cave: true, escape: true,
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWW',
    'W^________W_______^W',
    'W_________W__j_____W',
    'W___t_____y________W',
    'W___t_____W________W',
    'W_________WWWWWWWWWW',
    'W______________WWWWW',
    'W______________W___W',
    'W______________y___W',
    'Wp_____________W___W',
    'W_______t______W___W',
    'WWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [
    { x: 1, y: 2, to: 'pokemon-mansion-1f', spot: 'stairs-2f' },
    { x: 18, y: 2, to: 'pokemon-mansion-3f', spot: 'stairs-2f' }
  ],
  spots: { 'stairs-1f': [1, 2, 'down'], 'stairs-3f': [18, 2, 'down'] },
  bars: [{ x: 10, y: 4, if: '!mansion-switch' }, { x: 15, y: 9, if: 'mansion-switch' }],
  signs: {
    '13,3': { script: 'mansion.switch' },
    '4,4': 'A torn journal page: "...far to the south, deep in a rain forest, our team found a Pokémon no one had ever seen..."',
    '4,5': 'Another page: "...we named it Mew. It is tiny, yet its power is beyond anything we can measure..."',
    '8,11': 'A diary, its pages stuck together by the heat. Only one word can be read: "Mew".'
  },
  trainers: [
    { id: 'arnie', who: 'burglar', cls: 'burglar', name: 'Arnie', x: 6, y: 9, dir: 'right', sight: 4,
      team: [['vulpix', 35], ['ninetales', 36]],
      before: 'Finders keepers! Whatever is in this house is mine!',
      defeat: 'I keep nothing...',
      after: 'I heard there is a key down in the basement. A key to what, I wonder?' }
  ],
  items: [
    { x: 17, y: 10, item: 'calcium', flag: 'mansion-2f-calcium' },
    { x: 14, y: 5, item: 'max-revive', flag: 'mansion-2f-maxrevive' }
  ],
  encounters: { walk: '@pokemon-mansion-2f' }
});

G.Maps.def({
  id: 'pokemon-mansion-3f', loc: 'pokemon-mansion', tileset: 'indoor', palette: 'mansion', music: 'cave', battleBg: 'indoor', cave: true, escape: true,
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWW',
    'W_____W___________^W',
    'W_O___W___b___b____W',
    'W_____y____________W',
    'W_____W______j_____W',
    'WWWWWWW____________W',
    'W__________________W',
    'W___t______________W',
    'W__________________W',
    'Wp________rrr_____pW',
    'W_________rrr______W',
    'WWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [
    { x: 18, y: 2, to: 'pokemon-mansion-2f', spot: 'stairs-3f' },
    { x: 2, y: 3, to: 'pokemon-mansion-1f', spot: 'west' }
  ],
  spots: { 'stairs-2f': [18, 2, 'down'] },
  bars: [{ x: 6, y: 4, if: 'mansion-switch' }],
  signs: {
    '13,5': { script: 'mansion.switch' },
    '4,8': 'A burnt page: "...Mew\'s child was born here in the lab. We call it Mewtwo..."'
  },
  trainers: [
    { id: 'quinn', who: 'burglar', cls: 'burglar', name: 'Quinn', x: 9, y: 9, dir: 'right', sight: 4,
      team: [['ponyta', 35], ['charmeleon', 36]],
      before: 'Shh! You did not see me here, got it? ...Fine, let us battle.',
      defeat: 'I should have stayed hidden.',
      after: 'The floor over there is broken. Fall through it and you end up somewhere on the ground floor.' },
    { id: 'ivan', who: 'scientist', cls: 'scientist', name: 'Ivan', x: 15, y: 8, dir: 'down', sight: 3,
      team: [['grimer', 34], ['koffing', 34], ['weezing', 36]],
      before: 'I came to read the old research. You are disturbing my studies!',
      defeat: 'My theories went up in smoke.',
      after: 'The researchers here wanted to make the strongest Pokémon. It did not end well.' }
  ],
  items: [
    { x: 1, y: 5, item: 'max-potion', flag: 'mansion-3f-maxpotion' },
    { x: 17, y: 11, item: 'iron', flag: 'mansion-3f-iron' }
  ],
  encounters: { walk: '@pokemon-mansion-3f' }
});

G.Maps.def({
  id: 'pokemon-mansion-b1f', loc: 'pokemon-mansion', tileset: 'indoor', palette: 'mansion', music: 'cave', battleBg: 'indoor', cave: true, escape: true,
  rows: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWW',
    'W^_____________W___W',
    'W____j_________W___W',
    'W______________y___W',
    'W______t_______W___W',
    'W______________WWWWW',
    'W__________________W',
    'W___bb______bb_____W',
    'W__________________W',
    'Wp________t________W',
    'W__________________W',
    'WWWWWWWWWWWWWWWWWWWW'
  ],
  warps: [
    { x: 1, y: 2, to: 'pokemon-mansion-1f', spot: 'stairs-b1f' }
  ],
  spots: { stairs: [1, 2, 'down'] },
  bars: [{ x: 15, y: 4, if: '!mansion-switch' }],
  signs: {
    '5,3': { script: 'mansion.switch' },
    '7,5': 'The last page: "...Mewtwo grows stronger and angrier every day. We were wrong to make it. We cannot hold it any longer..."',
    '10,10': 'Notes on a machine that could copy a Pokémon. The rest has burned away.'
  },
  trainers: [
    { id: 'braydon', who: 'scientist', cls: 'scientist', name: 'Braydon', x: 9, y: 7, dir: 'down', sight: 3,
      team: [['voltorb', 35], ['electrode', 36], ['magneton', 36]],
      before: 'No one leaves this basement without a battle!',
      defeat: 'Discharged!',
      after: 'The gate to the back room only opens when the switch is the other way round.' },
    { id: 'lewis', who: 'burglar', cls: 'burglar', name: 'Lewis', x: 16, y: 10, dir: 'left', sight: 4,
      team: [['growlithe', 36], ['ninetales', 36]],
      before: 'The key is mine! ...Wait, where is it?',
      defeat: 'Locked out...',
      after: 'If you find the key, it opens the Gym in town. Blaine must be furious about losing it.' }
  ],
  items: [
    { x: 17, y: 3, item: 'secret-key', flag: 'mansion-b1f-secretkey' },
    { x: 18, y: 10, item: 'tm14', flag: 'mansion-b1f-tm14' },
    { x: 2, y: 11, item: 'full-restore', flag: 'mansion-b1f-fullrestore' }
  ],
  encounters: { walk: '@pokemon-mansion-b1f' }
});

G.Script.def({
  'mansion.switch': [
    ['say', 'A statue of a Pokémon. One of its eyes looks loose... It is a hidden switch!'],
    ['choice', 'Press the secret switch?', [
      ['sfx', 'click'],
      ['if', 'mansion-switch', [['clearFlag', 'mansion-switch']], [['setFlag', 'mansion-switch']]],
      ['say', 'Click! Somewhere in the mansion, gates slid open and others slammed shut.']
    ], []]
  ]
});
