/* ============ title-ui.js — title screen and credits ============
 *   Continue   (only when a save exists)
 *   New game
 *   Settings   language, sound, controls, display (options-ui.js)
 *   Credits    licences and authors (the full artist list is CREDITS.md)
 * The speaker button in the corner mutes everything with one click.
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
    $('t-options').onclick = () => G.OptionsUI.open();
    $('t-credits').onclick = () => G.UI.open('scr-credits');
    $('credits-back').onclick = () => G.UI.close('scr-credits');
    G.OptionsUI.muteButton($('t-mute'));
  }

  return { open, wire, hasSave };
})();
