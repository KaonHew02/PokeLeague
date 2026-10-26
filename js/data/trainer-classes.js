/* ============ trainer-classes.js — G.TRAINER_CLASSES: what each kind of trainer is ============
 * A map trainer names its class with `cls`; the class gives
 *   title   the label before the name ("Bug Catcher Rick"), an English key translated with G.T
 *   who     the default sprite (people.js archetype) when the trainer has none
 *   prize   base prize money: the player wins prize × the level of the trainer's last Pokémon
 *           (the Gen 3 rule, G.Exp.prize)
 * The rival and other named characters have no class: their def carries name and prize itself.
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
  sailor:        { title: 'Sailor', who: 'sailor', prize: 32 },
  gentleman:     { title: 'Gentleman', who: 'gentleman', prize: 72 },
  engineer:      { title: 'Engineer', who: 'engineer', prize: 48 },
  gambler:       { title: 'Gambler', who: 'gambler', prize: 72 },
  pokemaniac:    { title: 'PokéManiac', who: 'pokemaniac', prize: 50 },
  beauty:        { title: 'Beauty', who: 'beauty', prize: 72 },
  channeler:     { title: 'Channeler', who: 'channeler', prize: 32 },
  biker:         { title: 'Biker', who: 'biker', prize: 20 },
  cooltrainer:   { title: 'Cool Trainer', who: 'cooltrainer', prize: 48 },
  leader:        { title: 'Leader', who: 'brock', prize: 100 }
};
