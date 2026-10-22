/* ============ party-ui.js — the party screen ============
 *   G.PartyUI.open()                          from the start menu: Summary, Switch
 *   await G.PartyUI.pick({ title, note })     -> index | null   choose one (items, TMs...)
 *       note(mon, i) -> a short label shown on the card instead of the HP ('Able', 'Learned'...)
 *       or null; disabled(mon, i) -> true greys it out.
 * Six cards in two columns: sprite, name, level, HP bar, status.
 */
G.PartyUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null;
  let st = null;          // { mode: 'menu' | 'pick', title, note, disabled, done, moving }

  function build() {
    el = document.createElement('section');
    el.id = 'scr-party';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box party-box"><div class="party-grid"></div>'
      + '<div class="party-foot"><p class="party-hint"></p><button class="btn small ghost" data-back></button></div></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('[data-back]').onclick = back;
  }

  const party = () => G.Field.save.party;
  const barClass = f => (f > 0.5 ? '' : f > 0.2 ? 'mid' : 'low');
  const STATUS = { psn: 'PSN', tox: 'PSN', brn: 'BRN', par: 'PAR', slp: 'SLP', frz: 'FRZ' };
  function statusChip(m) {
    if (m.hp <= 0) return `<span class="st st-fnt">${esc(T('FNT'))}</span>`;
    if (!m.status) return '';
    const label = { PSN: T('PSN'), BRN: T('BRN'), PAR: T('PAR'), SLP: T('SLP'), FRZ: T('FRZ') }[STATUS[m.status]];
    return `<span class="st st-${m.status}">${esc(label)}</span>`;
  }
  const genderMark = m => (m.gender === 'm' ? '<i class="g-m">♂</i>' : m.gender === 'f' ? '<i class="g-f">♀</i>' : '');

  function cardHtml(m, i) {
    const max = G.Mon.maxHp(m), f = Math.max(0, m.hp / max);
    const note = st.note ? st.note(m, i) : null;
    const dis = st.disabled && st.disabled(m, i);
    const cls = ['pt-card', i === 0 ? 'lead' : '', m.hp <= 0 ? 'fainted' : '', st.moving === i ? 'moving' : ''].filter(Boolean).join(' ');
    return `<button class="${cls}" data-i="${i}"${dis ? ' disabled' : ''}><canvas width="64" height="64"></canvas>`
      + `<span class="pt-txt"><span class="pt-name">${esc(G.Mon.name(m))}${genderMark(m)}</span>`
      + `<span class="pt-lv">${esc(fmt('Lv. {n}', { n: m.lvl }))} ${statusChip(m)}</span>`
      + (note != null ? `<span class="pt-note">${esc(note)}</span>`
        : `<span class="hpbar"><i class="${barClass(f)}" style="width:${(f * 100).toFixed(0)}%"></i></span><span class="pt-hp">${m.hp}/${max}</span>`)
      + '</span></button>';
  }

  function render(focusIdx) {
    const grid = el.querySelector('.party-grid');
    grid.innerHTML = party().map(cardHtml).join('') + '<span class="pt-empty"></span>'.repeat(Math.max(0, 6 - party().length));
    grid.querySelectorAll('.pt-card').forEach(b => {
      const m = party()[+b.dataset.i];
      G.UI.sprite(b.querySelector('canvas'), m.sp, { shiny: !!m.shiny, hero: true, scale: 2 });
      b.onclick = () => choose(+b.dataset.i);
    });
    el.querySelector('.party-hint').textContent = st.moving != null ? T('Move to where?') : st.title || T('Choose a Pokémon.');
    el.querySelector('[data-back]').textContent = st.mode === 'pick' ? T('Cancel') : T('Back');
    if (focusIdx != null) { const b = grid.querySelector(`[data-i="${focusIdx}"]`); if (b) G.Nav.focusFirst(b); }
  }

  async function choose(i) {
    if (st.mode === 'pick') { finish(i); return; }
    if (st.moving != null) {
      const a = st.moving;
      st.moving = null;
      if (a !== i) { const p = party(); [p[a], p[i]] = [p[i], p[a]]; G.Audio.sfx('confirm'); }
      render(i);
      return;
    }
    const m = party()[i];
    const v = await G.Popup.choose(G.Mon.name(m), [
      { label: T('Summary'), value: 'summary' },
      { label: T('Switch'), value: 'switch', disabled: party().length < 2 },
      { label: T('Cancel'), value: null, back: true }]);
    if (v === 'summary') G.SummaryUI.open(party(), i, () => render());
    else if (v === 'switch') { st.moving = i; render(i); }
  }

  function back() {
    if (st.moving != null) { st.moving = null; render(); return; }
    finish(null);
  }
  function finish(v) {
    G.UI.close(el);
    const d = st.done;
    st = null;
    if (d) d(v);
  }

  function show(s) {
    if (!el) build();
    st = s;
    render();
    G.UI.open(el, { onBack: back, focus: el.querySelector('.pt-card:not(:disabled)') });
  }

  function open() { show({ mode: 'menu', moving: null }); }
  function pick(o = {}) {
    return new Promise(res => show({ mode: 'pick', title: o.title, note: o.note, disabled: o.disabled, done: res, moving: null }));
  }
  /** Redraws the cards (after an item changed a Pokémon while the screen is open). */
  function refresh() { if (st && G.UI.isOpen('scr-party')) render(); }

  return { open, pick, refresh };
})();
