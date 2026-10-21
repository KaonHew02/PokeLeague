/* ============ main.js — start-up ============ */
(() => {
  // If a file failed to load (a phone connection dropping), say so instead
  // of starting half a game. Each milestone adds the modules it delivers.
  const NEED = ['U', 'RNG', 'I18n', 'Names', 'Settings', 'Audio', 'Input', 'Btn', 'Nav', 'Pad', 'TouchPad',
                'Sprites', 'Camera', 'Types', 'MUSIC', 'SPRITE_META', 'UI', 'TitleUI', 'Game',
                // M1: game data
                'SPECIES', 'MOVES', 'TMS', 'ITEMS', 'ITEM_FX', 'GROWTH', 'NATURES', 'NAMES', 'ENCOUNTERS', 'DEX_TEXT'];
  function broken() {
    // (In the published build G is not on window: see tools/build.js.)
    const miss = NEED.filter(k => typeof G !== 'object' || !G[k]);
    if (!miss.length) return false;
    const T = s => typeof G === 'object' && G.T ? G.T(s) : s;
    const el = document.getElementById('boot');
    el.innerHTML = `<div class="boot-in"><p>${T('Could not load the whole game (did the connection drop?)')}</p><button class="btn gold">${T('Reload')}</button></div>`;
    el.querySelector('button').onclick = () => location.reload();
    console.warn('[Boot] missing:', miss.join(', '));
    return true;
  }

  /**
   * Browsers only allow sound after the first touch or key press. This screen
   * asks for one, so the music starts as soon as you are in.
   * (Skipped when the browser already allows sound.)
   */
  function tapToStart(then) {
    G.Audio.unlock();
    if (G.Audio.canPlay()) { then(); return; }
    const el = document.getElementById('tap-start');
    el.classList.remove('hidden');
    const go = e => {
      if (e.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      G.Audio.unlock();
      el.classList.add('hidden');
      el.removeEventListener('pointerup', go); removeEventListener('keydown', go, true);
      G.Input.endFrame();             // this key only starts the game: it must not press a menu item too
      G.Btn.swallow();
      then();
    };
    el.addEventListener('pointerup', go);
    addEventListener('keydown', go, true);
  }

  function boot() {
    if (broken()) return;
    G.I18n.startDom();
    G.Game.init();
    G.TitleUI.wire();
    // Wait for the pixel font so the interface does not jump when it arrives.
    const ready = document.fonts && document.fonts.load ? document.fonts.load('16px Pixelify') : Promise.resolve();
    ready.catch(() => {}).then(() => {
      document.getElementById('boot').classList.add('hidden');
      G.Game.setMode('title');
      tapToStart(() => G.TitleUI.open());
    });
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
})();
