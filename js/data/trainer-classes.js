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
  leader:        { title: 'Leader', who: 'brock', prize: 100 }
};
