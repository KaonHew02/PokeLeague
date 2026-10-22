/* ============ music-map.js — which theme plays in each context ============
 * Maps (`music:'town'`) and scripts (`music('wild')`) name a context, never a
 * song: G.Audio.context('town') looks the song up here, so giving every town a
 * new theme is one line. null = silence. The songs are in data/music.js.
 *
 * Jingles are named by their event directly: G.Audio.jingle('heal'), 'levelup',
 * 'caught', 'item', 'badge', 'evolved'.
 */
G.MusicMap = {
  title: 'title',                      // title screen
  town: 'village',                     // towns, and the houses and labs in them
  lab: 'village',
  center: 'center',                    // Pokémon Centers
  mart: 'center',                      // Poké Marts share the Center's tune
  route: 'forest',
  forest: 'cave',                      // Viridian Forest
  cave: 'cave',
  wild: 'volcano',                     // battle with a wild Pokémon
  trainer: 'boss',                     // battle with a trainer
  rival: 'boss',
  gym: 'rift',                         // battle with a gym leader
  'victory-wild': 'victory-wild',
  'victory-trainer': 'victory-trainer',
  'victory-gym': 'victory-trainer',
  evolution: 'evolution',              // while a Pokémon evolves (then the 'evolved' jingle)
  league: 'judgment',                  // the Elite Four and the Champion (later)
  silence: null
};
