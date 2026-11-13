/* ============ trainer-classes.js — G.TRAINER_CLASSES: what each kind of trainer is ============
 * A map trainer names its class with `cls`; the class gives
 *   title   the label before the name ("Bug Catcher Rick"), an English key translated with G.T
 *   who     the default sprite (people.js archetype) when the trainer has none
 *   prize   base prize money: the player wins prize × the level of the trainer's last Pokémon
 *           (the Gen 3 rule, G.Exp.prize)
 * The rival and other named characters have no class: their def carries name and prize itself.
 *   ctx     the translation context of the title (default 'trainer'): 'trainer-f' for a woman's
 *           title that is the same word in English but not in other languages (a Swimmer)
 */
G.TRAINER_CLASSES = {
  youngster:     { title: 'Youngster', who: 'youngster', prize: 16 },
  lass:          { title: 'Lass', who: 'lass', prize: 16 },
  'bug-catcher': { title: 'Bug Catcher', who: 'bugcatcher', prize: 12 },
  camper:        { title: 'Camper', who: 'camper', prize: 20 },
  picnicker:     { title: 'Picnicker', who: 'lass', prize: 20 },
  hiker:         { title: 'Hiker', who: 'hiker', prize: 36 },
  'super-nerd':  { title: 'Super Nerd', who: 'supernerd', prize: 24 },
  'team-rocket': { title: 'Team Rocket Grunt', who: 'rocket', prize: 30 },
  swimmer:       { title: 'Swimmer', who: 'swimmer', prize: 4 },
  'swimmer-f':   { title: 'Swimmer', ctx: 'trainer-f', who: 'swimmerf', prize: 4 },
  sailor:        { title: 'Sailor', who: 'sailor', prize: 32 },
  gentleman:     { title: 'Gentleman', who: 'gentleman', prize: 72 },
  engineer:      { title: 'Engineer', who: 'engineer', prize: 48 },
  gambler:       { title: 'Gambler', who: 'gambler', prize: 72 },
  pokemaniac:    { title: 'PokéManiac', who: 'pokemaniac', prize: 50 },
  beauty:        { title: 'Beauty', who: 'beauty', prize: 72 },
  channeler:     { title: 'Channeler', who: 'channeler', prize: 32 },
  biker:         { title: 'Biker', who: 'biker', prize: 20 },
  cooltrainer:   { title: 'Cool Trainer', who: 'cooltrainer', prize: 48 },
  'cooltrainer-f': { title: 'Cool Trainer', ctx: 'trainer-f', who: 'cooltrainer', prize: 48 },
  pokefan:       { title: 'Pokéfan', who: 'pokefan', prize: 60 },
  'kimono-girl': { title: 'Kimono Girl', who: 'kimono', prize: 40 },
  medium:        { title: 'Medium', who: 'channeler', prize: 32 },
  skier:         { title: 'Skier', ctx: 'trainer-f', who: 'skier', prize: 40 },
  boarder:       { title: 'Boarder', who: 'boarder', prize: 40 },
  executive:     { title: 'Team Rocket Executive', who: 'rocket', prize: 60 },
  scientist:     { title: 'Scientist', who: 'scientist', prize: 48 },
  fisherman:     { title: 'Fisherman', who: 'fisherman', prize: 36 },
  rocker:        { title: 'Rocker', who: 'rocker', prize: 24 },
  'bird-keeper': { title: 'Bird Keeper', who: 'birdkeeper', prize: 24 },
  juggler:       { title: 'Juggler', who: 'juggler', prize: 42 },
  tamer:         { title: 'Tamer', who: 'tamer', prize: 40 },
  boss:          { title: 'Boss', who: 'giovanni', prize: 100 },
  'black-belt':  { title: 'Black Belt', who: 'blackbelt', prize: 24 },
  psychic:       { title: 'Psychic', who: 'psychic', prize: 24 },
  burglar:       { title: 'Burglar', who: 'burglar', prize: 90 },
  'cue-ball':    { title: 'Cue Ball', who: 'cueball', prize: 24 },
  'elite-four':  { title: 'Elite Four', who: 'lorelei', prize: 100 },
  champion:      { title: 'Champion', who: 'rival', prize: 100 },
  sage:          { title: 'Sage', who: 'sage', prize: 32 },
  // Hoenn (chapter 29)
  'team-aqua':   { title: 'Team Aqua Grunt', who: 'aqua', prize: 20 },
  'school-kid':  { title: 'School Kid', who: 'youngster', prize: 20 },
  'battle-girl': { title: 'Battle Girl', who: 'battlegirl', prize: 24 },
  // Chapter 43: the Battle Tower's Frontier Brain.
  'salon-maiden': { title: 'Salon Maiden', who: 'anabel', prize: 0 },
  guitarist:     { title: 'Guitarist', who: 'rocker', prize: 32 },
  'team-magma':  { title: 'Team Magma Grunt', who: 'magma', prize: 20 },
  'magma-admin': { title: 'Magma Admin', who: 'tabitha', prize: 40 },
  'magma-leader': { title: 'Magma Leader', who: 'maxie', prize: 60 },
  kindler:       { title: 'Kindler', who: 'kindler', prize: 32 },
  'aqua-admin':  { title: 'Aqua Admin', who: 'shelly', prize: 40 },
  'aqua-leader': { title: 'Aqua Leader', who: 'archie', prize: 60 },
  // Double-battle pairs (chapter 40).
  twins:         { title: 'Twins', who: 'twin', prize: 12 },
  'young-couple': { title: 'Young Couple', who: 'cooltrainerm', prize: 32 },
  'sis-and-bro': { title: 'Sis and Bro', who: 'swimmerf', prize: 16 },
  'old-couple':  { title: 'Old Couple', who: 'oldman', prize: 40 },
  // Sinnoh (chapter 45)
  'team-galactic': { title: 'Team Galactic Grunt', who: 'galactic', prize: 20 },
  worker:        { title: 'Worker', who: 'engineer', prize: 40 },
  // Chapter 46
  'galactic-commander': { title: 'Galactic Commander', who: 'mars', prize: 50 },
  'aroma-lady':  { title: 'Aroma Lady', who: 'beauty', prize: 40 },
  // Chapter 47
  cyclist:       { title: 'Cyclist', who: 'cyclist', prize: 32 },
  // Chapter 49
  collector:     { title: 'Collector', who: 'pokemaniac', prize: 64 },
  pi:            { title: 'PI', who: 'gentleman', prize: 60 },
  'ruin-maniac': { title: 'Ruin Maniac', who: 'hiker', prize: 48 },
  tuber:         { title: 'Tuber', who: 'youngster', prize: 4 },
  'tuber-f':     { title: 'Tuber', ctx: 'trainer-f', who: 'lass', prize: 4 },
  // Chapter 50
  'ninja-boy':   { title: 'Ninja Boy', who: 'youngster', prize: 8 },
  'dragon-tamer': { title: 'Dragon Tamer', who: 'cooltrainerm', prize: 48 },
  // Chapter 61
  ranger:        { title: 'Pokémon Ranger', who: 'ranger', prize: 48 },
  'ranger-f':    { title: 'Pokémon Ranger', ctx: 'trainer-f', who: 'rangerf', prize: 48 },
  'galactic-boss': { title: 'Galactic Boss', who: 'cyrus', prize: 100 },
  // Chapter 52: Saturn (the other Commanders' title is feminine in some languages).
  'galactic-commander-m': { title: 'Team Galactic Commander', who: 'saturn', prize: 50 },
  'galactic-commanders': { title: 'Galactic Commanders', who: 'mars', prize: 50 },
  'rich-boy':    { title: 'Rich Boy', who: 'gentleman', prize: 120 },
  // Chapter 64: the Pokémon Mansion and Route 212.
  maid:          { title: 'Maid', who: 'maid', prize: 40 },
  lady:          { title: 'Lady', who: 'lady', prize: 160 },
  socialite:     { title: 'Socialite', who: 'socialite', prize: 200 },
  'parasol-lady': { title: 'Parasol Lady', who: 'parasol', prize: 32 },
  veteran:       { title: 'Veteran', who: 'gentleman', prize: 80 },
  // Chapter 69: the Lost Tower.
  roughneck:     { title: 'Roughneck', who: 'cueball', prize: 32 },
  'belle-pa':    { title: 'Belle & Pa', who: 'belle', prize: 32 },
  'double-team': { title: 'Double Team', who: 'cooltrainerm', prize: 48 },
  policeman:     { title: 'Policeman', who: 'officer', prize: 40 },
  'poke-kid':    { title: 'Poké Kid', who: 'lass', prize: 16 },
  'school-kid-f': { title: 'School Kid', ctx: 'trainer-f', who: 'lass', prize: 20 },
  'skier-m':     { title: 'Skier', who: 'boarder', prize: 40 },
  leader:        { title: 'Leader', who: 'brock', prize: 100 },
  // Chapter 76: the Seven Stars restaurant (prizes are mine). Only women have the Breeder's and the Reporter's titles
  // here, so their translations are the women's titles (no ctx).
  'pokemon-breeder': { title: 'Pokémon Breeder', who: 'breeder', prize: 48 },
  artist:        { title: 'Artist', who: 'artist', prize: 64 },
  cameraman:     { title: 'Cameraman', who: 'cameraman', prize: 48 },
  reporter:      { title: 'Reporter', who: 'reporter', prize: 48 },
  // Chapter 78: the Battle Factory's Frontier Brain.
  'factory-head': { title: 'Factory Head', who: 'noland', prize: 0 },
  // Chapter 79: the Battle Arena's Frontier Brain (only Greta has this title, so it is translated as a woman's).
  'arena-tycoon': { title: 'Arena Tycoon', who: 'greta', prize: 0 },
  // Chapter 80: the Battle Palace's Frontier Brain.
  'palace-maven': { title: 'Palace Maven', who: 'spenser', prize: 0 },
  // Chapter 81: the Battle Dome's Frontier Brain.
  'dome-ace':    { title: 'Dome Ace', who: 'tucker', prize: 0 },
  // Chapter 82: the Battle Pike's Frontier Brain (only Lucy has this title).
  'pike-queen':  { title: 'Pike Queen', who: 'lucy', prize: 0 },
  // Chapter 83: the Battle Pyramid's Frontier Brain.
  'pyramid-king': { title: 'Pyramid King', who: 'brandon', prize: 0 }
};
