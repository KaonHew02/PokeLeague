/* ============ slots-ui.js — the three save slots: choose, export, import, delete ============
 *   await G.SlotsUI.pick('load' | 'new' | 'save')  -> 1..3 | null
 *     load: only slots with a save can be chosen (Continue)
 *     new:  any slot; a used one asks before it is replaced (New game)
 *     save: any slot, the same way (saving a game that has no slot yet)
 * Each used slot also has Export (a .json file) and Delete; Import reads a file
 * into a slot. G.Store does the checking.
 */
G.SlotsUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null, mode = 'load', done = null;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-slots';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box slots-box"><div class="opt-head"><h3></h3><button class="btn small ghost" data-back></button></div>'
      + '<div class="slots"></div><div class="row slots-foot"><button class="btn small ghost sl-import"></button>'
      + '<input type="file" accept=".json,application/json" class="hidden"></div></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('[data-back]').onclick = () => finish(null);
    el.querySelector('.sl-import').onclick = () => el.querySelector('input[type=file]').click();
    el.querySelector('input[type=file]').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) importFile(f); };
  }

  function finish(v) {
    G.UI.close(el);
    const d = done; done = null;
    if (d) d(v);
  }

  function where(id) {
    const m = id && G.Maps && G.Maps.has && G.Maps.has(id) ? G.Maps.get(id) : null;
    return m && m.loc ? G.Names.loc(m.loc) : '';
  }
  const date = ms => (ms ? new Date(ms).toLocaleDateString(G.I18n.lang, { year: 'numeric', month: 'short', day: 'numeric' }) : '');

  function card(s, n) {
    const head = `<b>${esc(fmt('Slot {n}', { n }))}</b>`;
    if (!s) return `<div class="slot empty"><button class="slot-main menu-item"${mode === 'load' ? ' disabled' : ''} data-slot="${n}">${head}<span class="sub">${esc(T('Empty'))}</span></button></div>`;
    if (s.broken) return `<div class="slot"><button class="slot-main menu-item"${mode === 'load' ? ' disabled' : ''} data-slot="${n}">${head}<span class="sub">${esc(T('This save is damaged.'))}</span></button>`
      + `<div class="slot-acts"><button class="btn small ghost" data-del="${n}">${esc(T('Delete'))}</button></div></div>`;
    const place = where(s.map);
    return `<div class="slot"><button class="slot-main menu-item" data-slot="${n}"${s.newer ? ' disabled' : ''}>${head} <span class="slot-name">${esc(s.name)}</span>`
      + `<span class="slot-info">${esc(fmt('Badges {n}', { n: s.badges }))} · ${esc(fmt('Pokédex {n}', { n: s.dex }))} · ${esc(fmt('Time {t}', { t: G.Menus.time(s.playTime) }))}</span>`
      + `<span class="slot-info sub">${esc([place, date(s.savedAt)].filter(Boolean).join(' · '))}</span>`
      + (s.newer ? `<span class="slot-info sub">${esc(T('Saved by a newer version of the game.'))}</span>` : '')
      + `</button><div class="slot-mons">${s.party.map(() => '<canvas width="48" height="48"></canvas>').join('')}</div>`
      + `<div class="slot-acts"><button class="btn small ghost" data-exp="${n}">${esc(T('Export'))}</button>`
      + `<button class="btn small ghost" data-del="${n}">${esc(T('Delete'))}</button></div></div>`;
  }

  function render() {
    const list = G.Store.slots();
    el.querySelector('h3').textContent = mode === 'load' ? T('Continue') : mode === 'new' ? T('New game: choose a slot') : T('Save in which slot?');
    el.querySelector('[data-back]').textContent = T('Back');
    el.querySelector('.sl-import').textContent = T('Import a save');
    const box = el.querySelector('.slots');
    box.innerHTML = list.map((s, i) => card(s, i + 1)).join('');
    list.forEach((s, i) => {
      if (!s || !s.party) return;
      box.querySelectorAll('.slot')[i].querySelectorAll('.slot-mons canvas').forEach((cv, k) => G.UI.sprite(cv, s.party[k], { scale: 1 }));
    });
    box.querySelectorAll('[data-slot]').forEach(b => { b.onclick = () => choose(+b.dataset.slot, list[+b.dataset.slot - 1]); });
    box.querySelectorAll('[data-exp]').forEach(b => { b.onclick = () => exportSlot(+b.dataset.exp); });
    box.querySelectorAll('[data-del]').forEach(b => { b.onclick = () => del(+b.dataset.del); });
    return list;
  }

  async function choose(n, s) {
    if (mode !== 'load' && s) {
      const ok = await G.Popup.confirm(fmt('Replace the save in slot {n} ({name})? It will be lost.', { n, name: s.name || '?' }));
      if (!ok) return;
    }
    finish(n);
  }

  async function del(n) {
    if (!(await G.Popup.confirm(fmt('Delete the save in slot {n}? This cannot be undone.', { n })))) return;
    G.Store.remove(n);
    G.Audio.sfx('back');
    render();
    G.Nav.focusFirst();
  }

  function exportSlot(n) {
    const s = G.Store.load(n);
    if (!s) { G.Popup.say(T('This save could not be read.')); return; }
    const name = `PokeLeague-${s.player.name.replace(/[^\w-]+/g, '') || 'save'}-slot${n}-${new Date().toISOString().slice(0, 10)}.json`;
    const url = URL.createObjectURL(new Blob([G.Store.exportText(s)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    G.UI.toast(T('Save exported.'));
  }

  async function importFile(f) {
    const r = f.size > 4e6 ? { error: 'bad' } : G.Store.importText(await f.text());
    if (r.error) {
      const msg = { 'not-json': T('That file is not a save file.'), 'other-app': T('That file is not a PokeLeague save.'),
                    newer: T('That save comes from a newer version of the game.'), bad: T('That save file is damaged.') }[r.error];
      await G.Popup.say(msg);
      return;
    }
    const list = G.Store.slots();
    const n = await G.Popup.choose(fmt('Import the save of {name} into which slot?', { name: r.save.player.name }),
      list.map((s, i) => ({ label: fmt('Slot {n}', { n: i + 1 }) + ' · ' + (s ? (s.name || '?') : T('Empty')), value: i + 1 }))
        .concat([{ label: T('Cancel'), value: null, back: true }]));
    if (!n) return;
    if (list[n - 1] && !(await G.Popup.confirm(fmt('Replace the save in slot {n} ({name})? It will be lost.', { n, name: list[n - 1].name || '?' })))) return;
    if (!G.Store.write(n, r.save)) { await G.Popup.say(T('Could not save: the browser storage is full or blocked.')); return; }
    G.Audio.sfx('save');
    G.UI.toast(T('Save imported.'));
    render();
  }

  function pick(m) {
    if (!el) build();
    mode = m || 'load';
    return new Promise(res => {
      done = res;
      render();
      const last = G.Store.lastSlot();
      const first = el.querySelector(`[data-slot="${last}"]:not(:disabled)`) || el.querySelector('[data-slot]:not(:disabled)');
      G.UI.open(el, { onBack: () => finish(null), focus: first });
    });
  }

  return { pick };
})();
