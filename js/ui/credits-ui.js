/* ============ credits-ui.js — the credits, and the end of the first chapter ============
 *   G.CreditsUI.open()      from the title screen: who made what (licences, sprite artists)
 *   await G.CreditsUI.ending(n)  after a chapter's last Gym (1 Brock, 2 Misty … 8 Giovanni; 9 the Champion): "Chapter n
 *                           complete!", the player's numbers and party, then the credits;
 *                           Save and continue / Continue. Sets the flag chapter-n-done.
 * The text scrolls slowly by itself; the wheel, a finger or the arrows take over.
 * Artist names come from CREDITS.md (js/data/credits.js, made by tools/credits_js.js).
 */
G.CreditsUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const AUTHOR = 'KaonHew02';
  let el = null, done = null, raf = 0;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-credits-roll';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box cr-box"><div class="cr-roll" data-pad></div><div class="row end cr-buttons"></div></div>';
    document.getElementById('frame').appendChild(el);
    const roll = el.querySelector('.cr-roll');
    // Any touch of the scroll stops the automatic scrolling.
    for (const ev of ['wheel', 'pointerdown', 'touchstart']) roll.addEventListener(ev, () => { auto = false; }, { passive: true });
    el.onNavStep = dir => {
      if (dir !== 'up' && dir !== 'down') return false;
      auto = false;
      roll.scrollBy({ top: (dir === 'down' ? 1 : -1) * roll.clientHeight * 0.4, behavior: 'smooth' });
      return true;
    };
  }

  /** What each chapter's ending says (literal keys for the translations). */
  function chapterText(n, player) {
    if (n === 69) return { title: T('Chapter 69 complete!'),
      done: fmt('{player} met the ghost of the Old Chateau in Eterna Forest, climbed the Lost Tower on Route 209 and received the old women\'s two tags.', { player }),
      next: T('Thank you for playing! The rest of Sinnoh waits in a future update.') };
    if (n === 68) return { title: T('Chapter 68 complete!'),
      done: fmt('{player} went down through the frozen floors of Snowpoint Temple, brought Regirock, Regice and Registeel home and woke Regigigas.', { player }),
      next: T('Thank you for playing! The rest of Sinnoh waits in a future update.') };
    if (n === 67) return { title: T('Chapter 67 complete!'),
      done: fmt('{player} went into the far side of Victory Road, walked with Marley through the fog of Route 224 and read the old stone at its end.', { player }),
      next: T('Thank you for playing! The rest of Sinnoh waits in a future update.') };
    if (n === 66) return { title: T('Chapter 66 complete!'),
      done: fmt('{player} climbed Route 211 from Eterna City and went through Mt. Coronet by its old tunnel, all the way to Celestic Town.', { player }),
      next: T('Thank you for playing! The rest of Sinnoh waits in a future update.') };
    if (n === 65) return { title: T('Chapter 65 complete!'),
      done: fmt('{player} found Mira lost in the dark of Wayward Cave, battled beside her all the way out, and saw her join the Battleground.', { player }),
      next: T('Thank you for playing! The rest of Sinnoh waits in a future update.') };
    if (n === 64) return { title: T('Chapter 64 complete!'),
      done: fmt('{player} walked Route 212 from Hearthome City to Pastoria City through sun and rain, battled the maids of the Pokémon Mansion and met Mr. Backlot.', { player }),
      next: T('Thank you for playing! The rest of Sinnoh waits in a future update.') };
    if (n === 63) return { title: T('Chapter 63 complete!'),
      done: fmt('{player} crossed the sandstorm on Route 228, walked the shore to the Resort Area and found the Gym Leaders of Sinnoh waiting at the Battleground.', { player }),
      next: T('Thank you for playing! The rest of Sinnoh waits in a future update.') };
    if (n === 62) return { title: T('Chapter 62 complete!'),
      done: fmt('{player} crossed the sea to Stark Mountain, fought beside Buck, saw Team Galactic end for good and met Heatran in the deepest room.', { player }),
      next: T('Thank you for playing! The Battleground and the rest of the Battle Zone wait in a future update.') };
    if (n === 61) return { title: T('Chapter 61 complete!'),
      done: fmt('{player} sailed to the Battle Zone, beat Flint and Volkner beside Barry in Fight Area, and followed Route 225 to the Survival Area.', { player }),
      next: T('Thank you for playing! The road to the volcano waits in a future update.') };
    if (n === 60) return { title: T('Chapter 60 complete!'),
      done: fmt('{player} received the National Pokédex from Professor Rowan, found the two orbs in Mt. Coronet and faced Dialga and Palkia at the Spear Pillar.', { player }),
      next: T('Thank you for playing! The Battle Zone and the rest of Sinnoh wait in a future update.') };
    if (n === 59) return { title: T('Chapter 59 complete!'),
      done: fmt('{player} beat Aaron, Bertha, Flint and Lucian, won the great battle with Cynthia and entered the Hall of Fame as the Champion of Sinnoh.', { player }),
      next: T('Thank you for playing! The story of Sinnoh is told. What comes after it waits in a future update.') };
    if (n === 58) return { title: T('Chapter 58 complete!'),
      done: fmt('{player} surfed Route 223, climbed the waterfall, crossed Victory Road and beat Barry for the last time, before the doors of the Pokémon League of Sinnoh.', { player }),
      next: T('Thank you for playing! The Elite Four and the Champion of Sinnoh wait in a future update.') };
    if (n === 57) return { title: T('Chapter 57 complete!'),
      done: fmt('{player} told Professor Rowan the whole story, followed the coast to Sunyshore City, woke Volkner from his boredom and won the Beacon Badge, the last of the eight badges of Sinnoh.', { player }),
      next: T('Thank you for playing! The road to the Pokémon League of Sinnoh waits in a future update.') };
    if (n === 56) return { title: T('Chapter 56 complete!'),
      done: fmt('{player} crossed the Distortion World beside Cynthia, beat Cyrus for the last time and faced Giratina. The distortion has stopped, and {player} came back to the world at Sendoff Spring.', { player }),
      next: T('Thank you for playing! Professor Rowan and the road to Sunyshore City wait in a future update.') };
    if (n === 55) return { title: T('Chapter 55 complete!'),
      done: fmt('{player} climbed Mt. Coronet to the Spear Pillar and beat Mars and Jupiter beside Barry. But a great shadow took Cyrus through a rift in the air, and Cynthia is ready to follow.', { player }),
      next: T('Thank you for playing! The world behind the rift waits in a future update.') };
    if (n === 54) return { title: T('Chapter 54 complete!'),
      done: fmt('{player} joined Looker of the International Police, broke into Team Galactic\'s building in Veilstone, beat Cyrus and Saturn and set Uxie, Mesprit and Azelf free. But Cyrus has gone to Mt. Coronet with the Red Chain.', { player }),
      next: T('Thank you for playing! The peak of Mt. Coronet waits in a future update.') };
    if (n === 53) return { title: T('Chapter 53 complete!'),
      done: fmt('{player} crossed Mt. Coronet into the snow and won the Icicle Badge from Candice, but reached Lake Acuity too late: Commander Jupiter left with Uxie.', { player }),
      next: T('Thank you for playing! Team Galactic\'s headquarters in Veilstone waits in a future update.') };
    if (n === 52) return { title: T('Chapter 52 complete!'),
      done: fmt('{player} heard the old story of the three lakes, found Lake Valor drained by a bomb and beat Commanders Saturn and Mars, but Team Galactic got away with Azelf and Mesprit.', { player }),
      next: T('Thank you for playing! Mt. Coronet and Snowpoint City wait in a future update.') };
    if (n === 51) return { title: T('Chapter 51 complete!'),
      done: fmt('{player} crossed the sea to Canalave City, beat Barry on the bridge, drove Team Galactic out of Iron Island with Riley and earned the Mine Badge from Byron.', { player }),
      next: T('Thank you for playing! Team Galactic in Veilstone and Snowpoint City wait in a future update.') };
    if (n === 50) return { title: T('Chapter 50 complete!'),
      done: fmt("{player} cured the Psyduck with Cynthia's Secret Potion, crossed the fog of Route 210, faced Cyrus in the ruins of Celestic Town and brought the Old Charm home.", { player }),
      next: T('Thank you for playing! Canalave City and Iron Island wait in a future update.') };
    if (n === 49) return { title: T('Chapter 49 complete!'),
      done: fmt('{player} crossed Route 214 and the beach of Route 213, earned the Fen Badge from Crasher Wake, chased a Team Galactic bomber to Valor Lakefront and beat Barry in Pastoria City.', { player }),
      next: T('Thank you for playing! Lake Valor and Celestic Town wait in a future update.') };
    if (n === 48) return { title: T('Chapter 48 complete!'),
      done: fmt('{player} crossed Route 209 to Solaceon Town, met the Unown of the Solaceon Ruins, braved the rain on Route 215 and earned the Cobble Badge from Maylene.', { player }),
      next: T('Thank you for playing! Route 214 and Pastoria City wait in a future update.') };
    if (n === 47) return { title: T('Chapter 47 complete!'),
      done: fmt("{player} freed a Clefairy from Team Galactic's Eterna Building, rode down Cycling Road, met Cyrus inside Mt. Coronet and earned the Relic Badge from Fantina.", { player }),
      next: T('Thank you for playing! Routes 209 and 212 wait in a future update.') };
    if (n === 46) return { title: T('Chapter 46 complete!'),
      done: fmt('{player} drove Team Galactic out of Floaroma Meadow and the Valley Windworks, crossed Eterna Forest with Cheryl and earned the Forest Badge from Gardenia.', { player }),
      next: T("Thank you for playing! Team Galactic's building in Eterna City waits in a future update.") };
    if (n === 45) return { title: T('Chapter 45 complete!'),
      done: fmt('{player} stood up to Team Galactic in Jubilife City, beat Barry again on Route 203, found Roark deep in the Oreburgh Mine and earned the Coal Badge.', { player }),
      next: T('Thank you for playing! Route 204 and Floaroma Town wait in a future update.') };
    if (n === 44) return { title: T('Chapter 44 complete!'),
      done: fmt("{player} sailed to the Sinnoh region, met Barry and Professor Rowan at Lake Verity, and chose a new partner from the professor's briefcase.", { player }),
      next: T('Thank you for playing! Route 202 and Jubilife City wait in a future update.') };
    if (n === 43) return { title: T('Chapter 43 complete!'),
      done: fmt('{player} won seven battles in a row at the Battle Tower.', { player }),
      next: T('The streak goes on: Anabel, the Salon Maiden, waits for whoever wins twenty-one in a row.') };
    if (n === 42) return { title: T('Chapter 42 complete!'),
      done: fmt('{player} found Groudon and Kyogre where the weather ran wild, chased a Pokémon across the skies of Hoenn, and sailed to Southern Island.', { player }),
      next: T('Thank you for playing! Every legend of Hoenn has met you now.') };
    if (n === 41) return { title: T('Chapter 41 complete!'),
      done: fmt('{player} read the braille of Hoenn\'s ruins, unsealed the chamber under the sea, and met Regirock, Regice and Registeel.', { player }),
      next: T('Groudon and Kyogre still sleep somewhere in Hoenn, and people say two Pokémon of red and blue soar over its skies...') };
    if (n === 40) return { title: T('Chapter 40 complete!'),
      done: fmt('{player} rode the currents from Pacifidlog to Slateport, fought two against two, and beat Steven deep in Meteor Falls.', { player }),
      next: T('Thank you for playing! Steven left a gift at his house in Mossdeep City.') };
    if (n === 39) return { title: T('Chapter 39 complete!'),
      done: fmt('{player} climbed Victory Road, beat Wally, Hoenn\'s Elite Four and the Champion Wallace, and entered the Hall of Fame as the Champion of Hoenn!', { player }),
      next: T('Thank you for playing! The journey through Kanto, Johto and Hoenn is complete. Hoenn\'s Elite Four will battle you again, ten levels stronger, whenever you return.') };
    if (n === 38) return { title: T('Chapter 38 complete!'),
      done: fmt('{player} dived into Sootopolis City, woke Rayquaza at the top of the Sky Pillar to end the battle of Groudon and Kyogre, and earned the Rain Badge from Juan.', { player }),
      next: T('Thank you for playing! Victory Road and Hoenn\'s Pokémon League wait in a future update.') };
    if (n === 37) return { title: T('Chapter 37 complete!'),
      done: fmt('{player} learned to Dive with Steven\'s HM08, followed Team Aqua down to the Seafloor Cavern and battled Archie, but Kyogre woke and vanished into the sea.', { player }),
      next: T('Thank you for playing! Sootopolis City and the masters of the land and sea wait in a future update.') };
    if (n === 36) return { title: T('Chapter 36 complete!'),
      done: fmt('{player} raided Team Aqua\'s hideout, crossed the sea to Mossdeep City, earned the Mind Badge from Tate and Liza and drove Team Magma out of the Space Center.', { player }),
      next: T('Thank you for playing! The sea where Team Aqua took the submarine waits in a future update.') };
    if (n === 35) return { title: T('Chapter 35 complete!'),
      done: fmt('{player} reached Lilycove City, battled {rival3} at the Department Store and watched Team Aqua and Team Magma take the orbs from the summit of Mt. Pyre.', { player, rival3: G.Field.vars().rival3 }),
      next: T('Thank you for playing! Team Aqua\'s hideout and Mossdeep City wait in a future update.') };
    if (n === 34) return { title: T('Chapter 34 complete!'),
      done: fmt('{player} drove Team Aqua out of the Weather Institute, battled {rival3} on Route 119, uncovered a hidden Kecleon with the Devon Scope and earned the Feather Badge from Winona.', { player, rival3: G.Field.vars().rival3 }),
      next: T('Thank you for playing! Route 121 and Lilycove City wait in a future update.') };
    if (n === 33) return { title: T('Chapter 33 complete!'),
      done: fmt('{player} visited Wally in Verdanturf Town, earned the Balance Badge from Norman and met Steven again across the water on Route 118.', { player }),
      next: T('Thank you for playing! Route 119, the Weather Institute and Fortree City wait in a future update.') };
    if (n === 32) return { title: T('Chapter 32 complete!'),
      done: fmt('{player} crossed the Fiery Path, saw Team Magma steal a meteorite at Meteor Falls, stopped Maxie on Mt. Chimney and earned the Heat Badge from Flannery.', { player }),
      next: T('Thank you for playing! Norman, the Gym Leader of Petalburg City, awaits you in a future update.') };
    if (n === 31) return { title: T('Chapter 31 complete!'),
      done: fmt('{player} delivered the Devon Goods to the Oceanic Museum, drove Team Aqua out of it, battled {rival3} and Wally, and earned the Dynamo Badge from Wattson.', { player, rival3: G.Field.vars().rival3 }),
      next: T('Thank you for playing! The roads beyond Mauville City open in a future update.') };
    if (n === 30) return { title: T('Chapter 30 complete!'),
      done: fmt("{player} got the Devon Goods back from Team Aqua, sailed to Dewford Town in Mr. Briney's boat and earned the Knuckle Badge from Brawly.", { player }),
      next: T('Thank you for playing! Slateport City, where the Devon Goods must go, waits in a future update.') };
    if (n === 29) return { title: T('Chapter 29 complete!'),
      done: fmt('{player} helped Wally catch his first Pokémon, drove Team Aqua out of Petalburg Woods and earned the Stone Badge from Roxanne: the first badge of Hoenn.', { player }),
      next: T("Thank you for playing! Hoenn's next Gym, across the sea in Dewford Town, opens in a future update.") };
    if (n === 28) return { title: T('Chapter 28 complete!'),
      done: fmt('{player} sailed to Hoenn, saved Professor Birch from a wild Zigzagoon on Route 101 and got a Pokédex for Hoenn: a new journey begins.', { player }),
      next: T('Thank you for playing! The road west to Petalburg City and Hoenn\'s first Gym opens in a future update.') };
    if (n === 27) return { title: T('Chapter 27 complete!'),
      done: fmt('{player} climbed Mt. Silver and beat {rival} at the snowy summit: the strongest Trainer in Kanto and Johto.', { player, rival: G.Field.save.rival.name }),
      next: T('Thank you for playing! Your journey through Kanto and Johto is complete. Professor Oak has news from a faraway region: go and see him in Pallet Town.') };
    if (n === 26) return { title: T('Chapter 26 complete!'), done: fmt('{player} learned to give Pokémon items to hold, and traded the Red Scale to Mr. Pokémon for the Exp. Share.', { player }),
      next: T('Thank you for playing! More of Johto\'s secrets wait in a future update.') };
    if (n === 25) return { title: T('Chapter 25 complete!'), done: fmt('{player} hatched an Egg from the Day Care and showed Professor Elm how Pokémon are born.', { player }),
      next: T('Thank you for playing! More of Johto\'s secrets wait in a future update.') };
    if (n === 24) return { title: T('Chapter 24 complete!'), done: fmt('{player} put the four stone panels of the Ruins of Alph back together and met the Unown in the inner chamber.', { player }),
      next: T('Thank you for playing! More of Johto\'s secrets wait in a future update.') };
    if (n === 23) return { title: T('Chapter 23 complete!'), done: fmt('{player} found the black Apricorn deep in the Dark Cave, and Kurt made one of each of his seven Apricorn Balls.', { player }),
      next: T('Thank you for playing! More of Johto\'s secrets wait in a future update.') };
    if (n === 22) return { title: T('Chapter 22 complete!'), done: fmt('{player} calmed the whirlpools of the Whirl Islands and met Lugia, the guardian of the sea, in its chamber deep below.', { player }),
      next: T('Thank you for playing! More of Johto\'s secrets wait in a future update.') };
    if (n === 21) return { title: T('Chapter 21 complete!'), done: fmt('{player} rang the Clear Bell, met Suicune, Raikou and Entei, and climbed the Bell Tower to meet Ho-Oh.', { player }),
      next: T('Thank you for playing! More of Johto\'s legends wait in a future update.') };
    if (n === 20) return { title: T('Chapter 20 complete!'), done: fmt("{player} beat Johto's Elite Four and Lance, and entered the Hall of Fame as Johto's Champion.", { player }),
      next: T('Thank you for playing! Your Johto journey is complete. More adventures open in a future update.') };
    if (n === 19) return { title: T('Chapter 19 complete!'), done: fmt('{player} climbed the falls, crossed Victory Road and beat the thief one last time: the Indigo Plateau, with all eight Johto badges.', { player }),
      next: T('Thank you for playing! The Johto League opens in a future update.') };
    if (n === 18) return { title: T('Chapter 18 complete!'), done: fmt("{player} crossed the Ice Path, passed the dragon clan's test and won the Rising Badge from Clair: all eight Johto badges.", { player }),
      next: T('Thank you for playing! The road to the Pokémon League opens in a future update.') };
    if (n === 17) return { title: T('Chapter 17 complete!'), done: fmt('{player} took the Radio Tower back from Team Rocket, and Team Rocket broke up once again.', { player }),
                           next: T("Thank you for playing! The rest of Johto opens in a future update.") };
    if (n === 16) return { title: T('Chapter 16 complete!'), done: fmt('{player} calmed the Lake of Rage, shut down the Rocket hideout with Lance and earned the Glacier Badge from Pryce.', { player }),
                           next: T("Thank you for playing! The rest of Johto opens in a future update.") };
    if (n === 15) return { title: T('Chapter 15 complete!'), done: fmt('{player} crossed the sea for the Secret Potion, earned the Storm Badge from Chuck and the Mineral Badge from Jasmine.', { player }),
                           next: T("Thank you for playing! The rest of Johto opens in a future update.") };
    if (n === 14) return { title: T('Chapter 14 complete!'), done: fmt('{player} woke the three legendary Pokémon under the Burned Tower and earned the Fog Badge from Morty.', { player }),
                           next: T("Thank you for playing! The rest of Johto opens in a future update.") };
    if (n === 13) return { title: T('Chapter 13 complete!'), done: fmt("{player} found the lost Farfetch'd in Ilex Forest and, after a few tears, earned the Plain Badge from Whitney.", { player }),
                           next: T("Thank you for playing! The rest of Johto opens in a future update.") };
    if (n === 12) return { title: T('Chapter 12 complete!'), done: fmt('{player} drove Team Rocket out of the Slowpoke Well and earned the Hive Badge from Bugsy.', { player }),
                           next: T("Thank you for playing! The rest of Johto opens in a future update.") };
    if (n === 11) return { title: T('Chapter 11 complete!'), done: fmt('{player} beat Falkner and earned the Zephyr Badge: the first badge of Johto.', { player }),
                           next: T("Thank you for playing! The rest of Johto opens in a future update.") };
    if (n === 10) return { title: T('Chapter 10 complete!'), done: fmt('{player} faced Mewtwo deep in Cerulean Cave.', { player }),
                           next: T('Thank you for playing! Kanto is complete, and the next region opens in a future update.') };
    if (n === 9) return { title: T('Congratulations, Champion!'), done: fmt('{player} beat the Elite Four and the Champion, and entered the Hall of Fame!', { player }),
                          next: T('Thank you for playing! The story of Kanto is complete. More adventures come in a future update.') };
    if (n === 8) return { title: T('Chapter 8 complete!'), done: fmt('{player} beat Giovanni and earned the Earth Badge: all eight badges!', { player }),
                          next: T('Victory Road, the Elite Four and the Champion are waiting: your adventure goes on!') };
    if (n === 7) return { title: T('Chapter 7 complete!'), done: fmt('{player} beat Blaine and earned the Volcano Badge.', { player }),
                          next: T('Cycling Road, Fly and the last Gym in Viridian City are waiting: your adventure goes on!') };
    if (n === 6) return { title: T('Chapter 6 complete!'), done: fmt('{player} beat Sabrina and earned the Marsh Badge.', { player }),
                          next: T('The sea routes, the Seafoam Islands and Cinnabar Island are waiting: your adventure goes on!') };
    if (n === 5) return { title: T('Chapter 5 complete!'), done: fmt('{player} beat Koga and earned the Soul Badge.', { player }),
                          next: T('The Safari Zone, Saffron City and Silph Co. are waiting: your adventure goes on!') };
    if (n === 4) return { title: T('Chapter 4 complete!'), done: fmt('{player} beat Erika and earned the Rainbow Badge.', { player }),
                          next: T('Team Rocket, the Pokémon Tower and Fuchsia City are waiting: your adventure goes on!') };
    if (n === 3) return { title: T('Chapter 3 complete!'), done: fmt('{player} beat Lt. Surge and earned the Thunder Badge.', { player }),
                          next: T('Rock Tunnel, Lavender Town and Celadon City are waiting: your adventure goes on!') };
    if (n === 2) return { title: T('Chapter 2 complete!'), done: fmt('{player} beat Misty and earned the Cascade Badge.', { player }),
                          next: T('Nugget Bridge, Bill and Vermilion City are waiting: your adventure goes on!') };
    return { title: T('Chapter 1 complete!'), done: fmt('{player} beat Brock and earned the Boulder Badge.', { player }),
             next: T('The road east is open: Route 3, Mt. Moon and Cerulean City are waiting!') };
  }

  function endingHtml(n) {
    const S = G.Field.save, p = S.player, txt = chapterText(n, p.name);
    const party = S.party.map(m => `<div class="cr-mon"><canvas width="64" height="64" data-sp="${m.sp}" data-shiny="${m.shiny ? 1 : 0}"></canvas>`
      + `<span>${esc(G.Mon.name(m))}</span><small>${esc(fmt('Lv. {n}', { n: m.lvl }))}</small></div>`).join('');
    return `<h2 class="cr-big">${esc(txt.title)}</h2>`
      + `<p>${esc(txt.done)}</p>`
      + `<div class="cr-stats"><span>${esc(fmt('Time {t}', { t: G.Menus.time(S.playTime) }))}</span>`
      + `<span>${esc(fmt('Pokédex {n}', { n: Object.keys(S.dex.caught).length }))}</span>`
      + `<span>${esc(fmt('Badges {n}', { n: p.badges.length }))}</span></div>`
      + `<div class="cr-party">${party}</div>`
      + `<p>${esc(txt.next)}</p><hr>`;
  }

  function creditsHtml() {
    const names = (G.SPRITE_ARTISTS || []).map(n => `<span>${esc(n)}</span>`).join('');
    return `<h3 class="cr-title">PokeLeague</h3>`
      + `<p>${esc(fmt('A free fan game by {author}.', { author: AUTHOR }))}</p>`
      + `<p>${esc(T('PokeLeague is a free fan game. It is not for sale and has no ads or paid items.'))}</p>`
      + `<p>${esc(T('Based on PokéSurvivor by JPTER78. Code under the PolyForm Noncommercial License 1.0.0.'))}</p>`
      + '<p class="mono">Required Notice: Copyright 2026 JPTER78 (https://github.com/JPTER78/pokesurvivor)</p>'
      + `<h4>${esc(T('Pokémon sprites'))}</h4><p>${esc(T('By the artists of SpriteCollab, under CC BY-NC 4.0:'))}</p><div class="cr-names">${names}</div>`
      + `<h4>${esc(T('Data and font'))}</h4><p>${esc(T('Pokémon data and names: PokeAPI. Font: Pixelify Sans (SIL Open Font License).'))}</p>`
      + `<h4>${esc(T('Music'))}</h4><p>${esc(T("Original music from PokéSurvivor, played by the game's own synthesiser."))}</p>`
      + `<p class="sub">${esc(T('Pokémon and all related names are trademarks of Nintendo, Creatures Inc. and GAME FREAK. This project is not affiliated with or endorsed by them.'))}</p>`;
  }

  // Slow automatic scrolling until the player takes over.
  let auto = true;
  function scroll() {
    cancelAnimationFrame(raf);
    const roll = el.querySelector('.cr-roll');
    roll.scrollTop = 0;
    auto = true;
    let last = performance.now(), pos = 0;
    const loop = now => {
      if (!G.UI.isOpen(el.id)) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (auto && roll.scrollTop + roll.clientHeight < roll.scrollHeight - 1) {
        pos += dt * roll.clientHeight * 0.06;
        if (pos >= 1) { roll.scrollTop += Math.floor(pos); pos -= Math.floor(pos); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function show(ending, buttons) {
    if (!el) build();
    el.querySelector('.cr-roll').innerHTML = (ending ? endingHtml(ending) : '') + creditsHtml();
    el.querySelectorAll('canvas[data-sp]').forEach(cv => G.UI.sprite(cv, +cv.dataset.sp, { shiny: cv.dataset.shiny === '1', hero: true, scale: 2 }));
    const row = el.querySelector('.cr-buttons');
    row.innerHTML = '';
    buttons.forEach(([label, fn, cls, back]) => {
      const b = document.createElement('button');
      b.className = 'btn small ' + (cls || '');
      b.textContent = label;
      if (back) b.setAttribute('data-back', '');
      b.onclick = fn;
      row.appendChild(b);
    });
    G.UI.open(el, { onBack: buttons.find(b => b[3])[1], focus: row.querySelector('button:last-child') });
    scroll();
  }

  function close() {
    cancelAnimationFrame(raf);
    G.UI.close(el);
    const d = done; done = null;
    if (d) d();
  }

  function open() { show(false, [[T('Back'), close, 'ghost', true]]); }

  /** After a chapter's last badge. Resolves when the player goes back to the game. */
  function ending(n = 1) {
    G.Field.setFlag('chapter-' + n + '-done');
    if (G.Audio.context) G.Audio.context('title');
    return new Promise(res => {
      done = () => {
        const m = G.World && G.World.map;
        if (m && G.World.song) G.Audio.music(G.World.song(m.music) || m.music);
        res();
      };
      const saveAndGo = async () => {
        let slot = G.Session.slot;
        if (!slot) slot = await G.SlotsUI.pick('save');
        if (slot && G.Session.save(slot)) { G.Audio.sfx('save'); G.UI.toast(fmt('{player} saved the game.', { player: G.Field.save.player.name })); }
        else if (slot) G.UI.toast(T('Could not save: the browser storage is full or blocked.'), 4000);
        close();
      };
      show(n, [[T('Continue'), close, 'ghost', true], [T('Save and continue'), saveAndGo, 'gold']]);
    });
  }

  return { open, ending, close };
})();
