/* ============ title-ui.js — title screen and credits ============
 *   Continue   (only when a save exists)
 *   New game
 *   Settings   language, sound, controls, display (options-ui.js)
 *   Generations   the other games: the whole journey and the generation pages (gen.js), each with its own saves
 *   Credits    licences and authors (credits-ui.js; the artists come from CREDITS.md)
 * The speaker button in the corner mutes everything with one click.
 */
G.TitleUI = (() => {
  const $ = id => document.getElementById(id);

  /** Is there any save in this browser? (store.js owns the format; this only looks.) */
  function hasSave() {
    if (G.Store && G.Store.slots) return G.Store.slots().some(Boolean);
    try { for (let i = 1; i <= 3; i++) if (localStorage.getItem(G.Gen ? G.Gen.key('save.' + i) : 'pl.save.' + i)) return true; } catch (e) { /* blocked */ }
    return false;
  }

  function open() {
    G.Game.setMode('title');
    if (G.Audio.context) G.Audio.context('title'); else G.Audio.music('village');
    $('t-continue').classList.toggle('hidden', !hasSave());
    // A generation page names its game under the logo.
    const sub = G.Gen && G.Gen.subtitle();
    if (sub) $('t-sub').textContent = sub;
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
    $('t-gens').onclick = games;
    $('t-credits').onclick = () => G.CreditsUI.open();
    G.OptionsUI.muteButton($('t-mute'));
  }

  /** The games: this page is ticked; another opens its own page. */
  async function games() {
    const here = G.Gen.n;
    const opts = [0].concat(G.Gen.PUBLISHED).map(k => ({ label: (k === here ? '✓ ' : '') + G.Gen.label(k), value: k }));
    opts.push({ label: G.T('Back'), value: null, back: true });
    const k = await G.Popup.choose(G.T('Each game has a page of its own, with its own saves.'), opts);
    if (k == null || k === here) return;
    location.href = G.Gen.url(k);
  }

  return { open, wire, hasSave };
})();
