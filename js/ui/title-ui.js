/* ============ title-ui.js — title screen, language picker, credits ============
 *   Continue   (only when a save exists)
 *   New game
 *   Language   the 7 languages, each in its own name; changing reloads the page
 *   Credits    licences and authors (the full artist list is CREDITS.md)
 */
G.TitleUI = (() => {
  const $ = id => document.getElementById(id);

  /** Is there any save in this browser? (store.js owns the format; this only looks.) */
  function hasSave() {
    if (G.Store && G.Store.slots) return G.Store.slots().some(Boolean);
    try { for (let i = 1; i <= 3; i++) if (localStorage.getItem('pl.save.' + i)) return true; } catch (e) { /* blocked */ }
    return false;
  }

  function open() {
    G.Game.setMode('title');
    G.Audio.music('village');
    $('t-continue').classList.toggle('hidden', !hasSave());
    G.UI.closeAll();
    G.UI.open('scr-title', { onBack: () => {} });
  }

  function wire() {
    $('t-new').onclick = () => {
      if (G.NewGame && G.NewGame.start) G.NewGame.start();
      else G.UI.toast(G.T('Coming soon'));
    };
    $('t-continue').onclick = () => {
      if (G.NewGame && G.NewGame.continue) G.NewGame.continue();
      else G.UI.toast(G.T('Coming soon'));
    };
    $('t-lang').onclick = openLang;
    $('t-credits').onclick = () => G.UI.open('scr-credits');
    $('credits-back').onclick = () => G.UI.close('scr-credits');
    $('lang-back').onclick = () => G.UI.close('scr-lang');
  }

  function openLang() {
    const list = $('lang-list');
    list.innerHTML = '';
    for (const [id, name] of G.I18n.choices) {
      const b = document.createElement('button');
      b.className = 'menu-item' + (id === G.I18n.lang ? ' on' : '');
      b.setAttribute('translate', 'no');
      b.lang = id;
      b.textContent = name;
      if (id === G.I18n.lang) b.dataset.first = '';
      b.onclick = () => { if (id === G.I18n.lang) G.UI.close('scr-lang'); else G.I18n.set(id); };
      list.appendChild(b);
    }
    G.UI.open('scr-lang');
  }

  return { open, wire, hasSave };
})();
