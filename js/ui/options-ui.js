/* ============ options-ui.js — Settings (like PokéGo's) ============
 * Opens over whatever is on screen (title, start menu) and goes back there.
 * Tabs: Game · Sound · Controls · Display. Everything belongs to this device
 * (G.Settings, G.Audio volumes, G.I18n language), not to the save file.
 *
 *   G.OptionsUI.open('sound')   G.OptionsUI.close()
 *   G.OptionsUI.muteButton(el)  turns a button into the quick mute toggle
 */
G.OptionsUI = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => G.U.esc(s);
  const T = s => G.T(s);
  let tab = 'game';

  function init() {
    document.querySelectorAll('#opt-tabs .opt-tab').forEach(b => {
      b.onclick = () => { tab = b.dataset.t; render(); };
    });
    $('opt-back').onclick = close;
    // Plugging a controller in or out shows at once on the Controls tab.
    for (const ev of ['gamepadconnected', 'gamepaddisconnected']) addEventListener(ev, () => { if (isOpen() && tab === 'controls') render(); });
    document.addEventListener('fullscreenchange', () => { if (isOpen() && tab === 'display') render(); });
  }

  function open(t) {
    if (t) tab = t;
    render();
    G.UI.open('scr-options', { onBack: close });
  }
  function close() { G.UI.close('scr-options'); }
  const isOpen = () => G.UI.isOpen('scr-options');

  // ---------------- pieces ----------------
  const section = (title, sub) => `<h4 class="opt-h">${esc(title)}</h4>${sub ? `<p class="sub opt-sub">${esc(sub)}</p>` : ''}`;
  const row = (label, desc, control) => `<div class="opt-row"><div class="opt-txt"><b>${esc(label)}</b>${desc ? `<small>${esc(desc)}</small>` : ''}</div>`
    + `<div class="opt-ctl">${control}</div></div>`;
  const toggle = (key, on) => `<button class="btn small switch${on ? ' gold' : ''}" data-k="${key}">${esc(on ? T('On') : T('Off'))}</button>`;
  function choice(key, opts) {
    const cur = G.Settings.get(key);
    return `<div class="chips">${opts.map(([v, l]) => `<button class="chip${v === cur ? ' on' : ''}" data-k="${key}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
  }
  const slider = (which, v) => `<input type="range" min="0" max="100" step="5" value="${Math.round(v * 100)}" data-vol="${which}">`;
  const keys = rows => `<div class="keys">${rows.map(([k, what]) => `<div class="k">${k}</div><div>${esc(what)}</div>`).join('')}</div>`;
  const kbd = (...ks) => ks.map(k => `<kbd>${esc(k)}</kbd>`).join('');

  // ---------------- full screen ----------------
  const canFull = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => !!navigator.standalone || (window.matchMedia && matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
  function toggleFull() {
    if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const el = document.documentElement;
      const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      if (p && p.catch) p.catch(() => {});
    }
  }

  // ---------------- tabs ----------------
  function bodyHtml() {
    const S = k => G.Settings.get(k);
    if (tab === 'game') {
      return section(T('Language'), T('The game reloads when you change it.'))
        + `<div class="chips langs">${G.I18n.choices.map(([id, name]) =>
            `<button class="chip${id === G.I18n.lang ? ' on' : ''}" data-lang="${id}" lang="${id}">${esc(name)}</button>`).join('')}</div>`
        + row(T('Text speed'), T('How fast the dialog text appears.'),
              choice('textSpeed', [['slow', T('Slow')], ['mid', T('Normal')], ['fast', T('Fast')]]))
        + row(T('Battle animations'), T('Moves play an animation in battle.'), toggle('battleAnim', S('battleAnim')))
        + row(T('Battle style'), T("Shift: after you defeat one of a trainer's Pokémon, you may switch yours. Set: you keep the same one."),
              choice('battleStyle', [['shift', T('Shift')], ['set', T('Set')]]))
        + row(T('Pokémon follows you'), T('Your first Pokémon walks behind you.'), toggle('follower', S('follower')));
    }
    if (tab === 'sound') {
      const a = G.Audio.settings;
      return row(T('Music'), '', slider('music', a.music))
        + row(T('Sound effects'), '', slider('sfx', a.sfx))
        + row(T('Mute all'), T('Silence the music and the sound effects.'), `<button class="btn small switch${a.muted ? ' gold' : ''}" data-mute>${esc(a.muted ? T('On') : T('Off'))}</button>`);
    }
    if (tab === 'controls') {
      const pad = G.Pad.name;
      return section(T('Keyboard'))
        + keys([
            [kbd('W', 'A', 'S', 'D') + ' ' + kbd('↑', '↓', '←', '→'), T('Move · choose')],
            [kbd('Shift'), T('Run (hold)')],
            [kbd(T('Space'), 'Enter', 'E'), T('Talk · check · confirm')],
            [kbd('X', 'Backspace'), T('Back · cancel')],
            [kbd('Esc'), T('Open the menu')]])
        + section(T('Mouse'))
        + keys([[kbd(T('Left click')), T('Walk there · talk · choose')], [kbd(T('Right click')), T('Back · cancel')]])
        + section(T('Phone or tablet'), T('Tap where you want to go and tap people to talk to them. The menu button in the corner opens the menu.'))
        + section(T('Controller'), pad
            ? G.I18n.fmt('Controller connected: {name}', { name: pad.replace(/\s*\(.*$/, '') })
            : T('Xbox, PlayStation, Switch and most USB or Bluetooth controllers. Connect it and press any button.'))
        + row(T('Use a controller'), '', toggle('gamepad', S('gamepad') !== false))
        + row(T('Vibration'), T('When your Pokémon is hit, if the controller and the browser support it.'), toggle('padRumble', S('padRumble') !== false))
        + keys([[kbd(T('D-pad · left stick')), T('Move · choose')], [kbd('A'), T('Talk · check · confirm')],
                [kbd('B'), T('Back · run (hold)')], [kbd('Start', 'X'), T('Open the menu')]]);
    }
    // display
    let full = '';
    if (canFull()) full = row(T('Full screen'), T('Hide the browser bars.'), `<button class="btn small" data-full>${esc(isFull() ? T('Turn off') : T('Turn on'))}</button>`);
    else if (IOS && !standalone()) full = row(T('Full screen'), T('On iPhone, Safari cannot show websites in full screen. Tap Share, then "Add to Home Screen": opened from that icon, the game fills the screen.'), '');
    return full + row(T('Less shaking and flashing'), T('The screen shakes less and flashes are softer.'), toggle('calm', S('calm')));
  }

  /** Something that identifies a control across re-renders, to keep the focus on it. */
  const idOf = el => el && ['data-k', 'data-v', 'data-vol', 'data-lang', 'data-mute', 'data-full', 'data-t']
    .map(a => el.hasAttribute(a) ? `[${a}="${el.getAttribute(a)}"]` : '').join('');

  function render() {
    const before = idOf(G.Nav.focused);
    document.querySelectorAll('#opt-tabs .opt-tab').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    const box = $('opt-body');
    box.innerHTML = bodyHtml();
    wire(box);
    if (before && isOpen()) {
      const again = document.querySelector('#scr-options ' + before);
      if (again) G.Nav.focusFirst(again);
    }
  }

  function wire(box) {
    box.querySelectorAll('[data-k]').forEach(b => {
      b.onclick = () => {
        const k = b.dataset.k;
        if (b.dataset.v !== undefined) G.Settings.set(k, b.dataset.v);
        else G.Settings.set(k, !(G.Settings.get(k) !== false && G.Settings.get(k)));
        render();
      };
    });
    box.querySelectorAll('[data-lang]').forEach(b => { b.onclick = () => { if (b.dataset.lang !== G.I18n.lang) G.I18n.set(b.dataset.lang); }; });
    box.querySelectorAll('[data-vol]').forEach(r => {
      r.oninput = () => G.Audio.setVolume(r.dataset.vol, r.value / 100);
      r.onchange = () => G.Audio.sfx('select');
    });
    const m = box.querySelector('[data-mute]');
    if (m) m.onclick = () => { G.Audio.toggleMute(); refreshMuteButtons(); render(); };
    const f = box.querySelector('[data-full]');
    if (f) f.onclick = toggleFull;
  }

  // ---------------- quick mute button ----------------
  const ICON_ON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor"/><path d="M11 5.5c1 .8 1 4.2 0 5M12.8 3.8c2 1.8 2 6.6 0 8.4" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
  const ICON_OFF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor"/><path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const muteButtons = new Set();
  function refreshMuteButtons() {
    const muted = G.Audio.settings.muted;
    for (const b of muteButtons) { b.innerHTML = muted ? ICON_OFF : ICON_ON; b.classList.toggle('off', muted); }
  }
  function muteButton(el) {
    muteButtons.add(el);
    el.dataset.sfx = 'none';
    el.onclick = () => {
      const muted = G.Audio.toggleMute();
      refreshMuteButtons();
      G.UI.toast(muted ? T('Sound off') : T('Sound on'), 1400);
      if (!muted) G.Audio.sfx('confirm');
      if (isOpen()) render();
    };
    refreshMuteButtons();
  }

  return { init, open, close, isOpen, muteButton };
})();
