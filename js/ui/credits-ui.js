/* ============ credits-ui.js — the credits, and the end of the first chapter ============
 *   G.CreditsUI.open()      from the title screen: who made what (licences, sprite artists)
 *   await G.CreditsUI.ending(n)  after a chapter's last Gym (1: Brock, 2: Misty): "Chapter n
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
    if (n === 2) return { title: T('Chapter 2 complete!'), done: fmt('{player} beat Misty and earned the Cascade Badge.', { player }),
                          next: T('Thank you for playing! The road beyond Cerulean City opens in a future update.') };
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
