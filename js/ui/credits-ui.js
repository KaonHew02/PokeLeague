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
