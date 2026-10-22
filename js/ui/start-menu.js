/* ============ start-menu.js — the overworld menu (Esc, Start, or the menu button) ============
 *   G.StartMenu.open()    Pokédex · Pokémon · Bag · {player} · Save · Settings · Close
 *   G.StartMenu.card()    the trainer card
 *   G.StartMenu.save()    asks, then saves the game -> Promise<boolean>
 * The Pokédex shows once the player has it (flag 'has-pokedex', or in a debug game),
 * Pokémon once there is one. Saving only happens here, so only in the overworld.
 */
G.StartMenu = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null, cardEl = null;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-start';
    el.className = 'scr start-scr hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box start-box"><div class="menu-list"></div></div>';
    document.getElementById('frame').appendChild(el);
    // A click outside the box closes the menu.
    el.addEventListener('click', e => { if (e.target === el) close(); });
  }

  const hasDex = () => G.Field.flag('has-pokedex') || (G.Debug && G.Debug.on);

  function items() {
    const S = G.Field.save;
    const out = [];
    if (hasDex()) out.push(['dex', T('Pokédex'), () => G.DexUI.open()]);
    if (S.party.length) out.push(['party', T('Pokémon'), () => G.PartyUI.open()]);
    out.push(['bag', T('Bag'), () => G.BagUI.open()]);
    out.push(['card', S.player.name, card]);
    out.push(['save', T('Save'), save]);
    out.push(['options', T('Settings'), () => G.OptionsUI.open()]);
    out.push(['close', T('Close'), close]);
    return out;
  }

  let lastPick = null;
  function open() {
    if (!el) build();
    const list = el.querySelector('.menu-list');
    list.innerHTML = '';
    let focus = null;
    for (const [id, label, fn] of items()) {
      const b = document.createElement('button');
      b.className = 'menu-item';
      b.dataset.id = id;
      b.textContent = label;
      if (id === 'close') b.setAttribute('data-back', '');
      b.onclick = () => { lastPick = id; fn(); };
      if (id === lastPick) focus = b;
      list.appendChild(b);
    }
    G.UI.open(el, { onBack: close, focus });
  }
  function close() { G.UI.close(el); }

  // ---------------- trainer card ----------------

  function card() {
    const S = G.Field.save, p = S.player;
    if (!cardEl) {
      cardEl = document.createElement('section');
      cardEl.id = 'scr-card';
      cardEl.className = 'scr dim hidden';
      cardEl.setAttribute('translate', 'no');
      document.getElementById('frame').appendChild(cardEl);
    }
    const caught = Object.keys(S.dex.caught).length;
    const row = (k, v) => `<div class="tc-row"><span class="sub">${esc(k)}</span><b>${esc(v)}</b></div>`;
    cardEl.innerHTML = `<div class="box tc-box"><div class="opt-head"><h3>${esc(T('Trainer card'))}</h3>`
      + `<button class="btn small ghost" data-back>${esc(T('Back'))}</button></div>`
      + `<div class="tc-main"><div class="tc-rows">`
      + row(T('Name'), p.name) + row(T('ID No.'), String(p.id).padStart(5, '0')) + row(T('Money'), G.Menus.money(p.money))
      + (hasDex() ? row(T('Pokédex'), String(caught)) : '') + row(T('Time'), G.Menus.time(S.playTime))
      + `</div><canvas class="tc-pic" width="64" height="96"></canvas></div>`
      + `<h4 class="opt-h">${esc(T('Badges'))}</h4>${G.Menus.badges(p.badges)}</div>`;
    const cv = cardEl.querySelector('canvas'), art = G.People.portrait(p.gender === 'f' ? 'player-girl' : 'player-boy', 4);
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.drawImage(art, (cv.width - art.width) / 2, cv.height - art.height);
    cardEl.querySelector('[data-back]').onclick = () => G.UI.close(cardEl);
    G.UI.open(cardEl, { onBack: () => G.UI.close(cardEl) });
  }

  // ---------------- saving ----------------

  async function save() {
    if (G.Game.mode !== 'overworld' || (G.World && G.World.locked)) { G.UI.toast(T("You can't save right now.")); return false; }
    const S = G.Field.save, p = S.player;
    const m = p.map && G.Maps.has(p.map) ? G.Maps.get(p.map) : null;
    const place = m && m.loc ? G.Names.loc(m.loc) : '';
    const info = [p.name, fmt('Badges {n}', { n: p.badges.length }), fmt('Pokédex {n}', { n: Object.keys(S.dex.caught).length }),
                  fmt('Time {t}', { t: G.Menus.time(S.playTime) }), place].filter(Boolean).join(' · ');
    if (!(await G.Popup.confirm(T('Would you like to save the game?') + '\n' + info))) return false;
    let slot = G.Session.slot;
    if (!slot) slot = await G.SlotsUI.pick('save');       // a game that has no slot yet (debug)
    if (!slot) return false;
    if (!G.Session.save(slot)) { await G.Popup.say(T('Could not save: the browser storage is full or blocked.')); return false; }
    G.Audio.sfx('save');
    await G.Popup.say(fmt('{player} saved the game.', { player: p.name }));
    return true;
  }

  return { open, close, card, save };
})();
