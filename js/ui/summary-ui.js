/* ============ summary-ui.js — one Pokémon in detail ============
 *   G.SummaryUI.open(list, index, onClose)    list: the party or a PC box (nulls are skipped)
 * Pages: Info (Pokédex number, types, trainer, nature, where it was met) ·
 * Stats (HP, the five stats with the nature's ▲▼, EXP) · Moves (type, PP, power,
 * accuracy, description). Left / right change the page; ◀ ▶ the Pokémon.
 */
G.SummaryUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null;
  let st = null;              // { list, i, page, move, onClose }
  const PAGES = ['info', 'stats', 'moves'];

  function build() {
    el = document.createElement('section');
    el.id = 'scr-summary';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box sum-box"><div class="sum-head">'
      + '<button class="btn small ghost sum-prev" data-sfx="select">◀</button><canvas width="96" height="96"></canvas>'
      + '<div class="sum-title"></div><button class="btn small ghost sum-next" data-sfx="select">▶</button>'
      + '<button class="btn small ghost sum-back" data-back></button></div>'
      + '<div class="opt-tabs sum-tabs"><button class="opt-tab" data-p="info"></button><button class="opt-tab" data-p="stats"></button>'
      + '<button class="opt-tab" data-p="moves"></button></div><div class="sum-body"></div></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { st.page = b.dataset.p; render(); }; });
    el.querySelector('.sum-prev').onclick = () => turn(-1);
    el.querySelector('.sum-next').onclick = () => turn(1);
    el.querySelector('.sum-back').onclick = close;
    el.onNavStep = dir => {
      if (dir !== 'left' && dir !== 'right') return false;
      const k = PAGES.indexOf(st.page) + (dir === 'right' ? 1 : -1);
      if (k < 0 || k >= PAGES.length) return true;
      st.page = PAGES[k]; G.Audio.sfx('select'); render();
      return true;
    };
  }

  const mons = () => st.list.map((m, i) => [m, i]).filter(([m]) => m);
  function turn(d) {
    const all = mons();
    const k = all.findIndex(([, i]) => i === st.i);
    st.i = all[(k + d + all.length) % all.length][1];
    st.move = 0;
    render();
  }

  const genderMark = m => (m.gender === 'm' ? ' <i class="g-m">♂</i>' : m.gender === 'f' ? ' <i class="g-f">♀</i>' : '');
  const row = (k, v) => `<div class="sum-row"><span class="sub">${esc(k)}</span><span>${v}</span></div>`;
  const place = id => { const m = id && G.Maps && G.Maps.has(id) ? G.Maps.get(id) : null; return m && m.loc ? G.Names.loc(m.loc) : ''; };

  function info(m) {
    const S = G.SPECIES[m.sp];
    const met = m.met ? (m.met.map && place(m.met.map) ? fmt('Met at Lv. {n} in {place}.', { n: m.met.lvl, place: place(m.met.map) }) : fmt('Met at Lv. {n}.', { n: m.met.lvl })) : '';
    return row(T('Pokédex No.'), String(m.sp).padStart(3, '0'))
      + row(T('Species'), esc(G.Names.mon(m.sp)) + ` <small class="sub">${esc(G.Names.genus(m.sp))}</small>`)
      + row(T('Type'), G.UI.typeChips(S.types))
      + row(T('Trainer'), esc(m.ot ? `${m.ot.name} · ${String(m.ot.id).padStart(5, '0')}` : '—'))
      + row(T('Nature'), esc(G.Names.nature(m.nature)))
      + (met ? `<p class="sub sum-memo">${esc(met)}</p>` : '');
  }

  function stats(m) {
    const s = G.Mon.stats(m), max = s[0];
    const N = G.NATURES[m.nature] || {};
    const f = Math.max(0, m.hp / max);
    const gr = G.SPECIES[m.sp].gr;
    const now = G.Stats.expAt(gr, m.lvl), next = m.lvl < 100 ? G.Stats.expAt(gr, m.lvl + 1) : now;
    const ef = next > now ? (m.exp - now) / (next - now) : 1;
    let h = `<div class="sum-row"><span class="sub">${esc(G.Names.stat('hp'))}</span><span class="sum-hp"><span class="hpbar"><i class="${f > 0.5 ? '' : f > 0.2 ? 'mid' : 'low'}" style="width:${(f * 100).toFixed(0)}%"></i></span> ${m.hp}/${max}</span></div>`;
    ['atk', 'def', 'spa', 'spd', 'spe'].forEach((k, i) => {
      const mark = N.up === k ? ' <i class="up">▲</i>' : N.down === k ? ' <i class="down">▼</i>' : '';
      h += row(G.Names.stat(k), `<b>${s[i + 1]}</b>${mark}`);
    });
    h += row(T('EXP points'), String(m.exp));
    h += row(T('To next level'), String(Math.max(0, next - m.exp)));
    h += `<div class="expbar"><i style="width:${(Math.max(0, Math.min(1, ef)) * 100).toFixed(1)}%"></i></div>`;
    return h;
  }

  function moves(m) {
    const cat = c => ({ physical: T('Physical'), special: T('Special'), status: T('Status') }[c] || c);
    const k = Math.min(st.move, m.moves.length - 1);
    let h = '<div class="menu-list sum-moves">';
    m.moves.forEach((x, i) => {
      const M = G.MOVES[x.id];
      h += `<button class="menu-item${i === k ? ' on' : ''}" data-m="${i}">${G.UI.typeChips([M.type])}<span class="grow">${esc(G.Names.move(x.id))}</span>`
        + `<span class="meta">${esc(T('PP'))} ${x.pp}/${G.Mon.ppMax(x.id, x.ppUp)}</span></button>`;
    });
    h += '</div>';
    const M = G.MOVES[m.moves[k].id];
    h += `<div class="sum-move"><div class="sum-mstats"><span>${esc(cat(M.cat))}</span><span>${esc(T('Power'))} ${M.pow || '—'}</span>`
      + `<span>${esc(T('Accuracy'))} ${M.acc ? M.acc + '%' : '—'}</span></div><p>${esc(G.Names.desc('move', m.moves[k].id))}</p></div>`;
    return h;
  }

  function render() {
    const m = st.list[st.i];
    const cv = el.querySelector('canvas');
    G.UI.sprite(cv, m.sp, { shiny: !!m.shiny, hero: true, scale: 3 });
    el.querySelector('.sum-title').innerHTML = `<span><b>${esc(G.Mon.name(m))}</b>${genderMark(m)}</span>`
      + `<span class="sub">${esc(fmt('Lv. {n}', { n: m.lvl }))}${m.shiny ? ' ★' : ''}</span>`;
    const multi = mons().length > 1;
    el.querySelector('.sum-prev').classList.toggle('hidden', !multi);
    el.querySelector('.sum-next').classList.toggle('hidden', !multi);
    el.querySelector('.sum-back').textContent = T('Back');
    const labels = { info: T('Info'), stats: T('Stats'), moves: T('Moves') };
    el.querySelectorAll('[data-p]').forEach(b => { b.textContent = labels[b.dataset.p]; b.classList.toggle('on', b.dataset.p === st.page); });
    const body = el.querySelector('.sum-body');
    body.innerHTML = st.page === 'info' ? info(m) : st.page === 'stats' ? stats(m) : moves(m);
    body.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => { st.move = +b.dataset.m; render(); G.Nav.focusFirst(el.querySelector(`[data-m="${st.move}"]`)); }; });
  }

  function open(list, i, onClose) {
    if (!el) build();
    st = { list, i, page: 'info', move: 0, onClose };
    render();
    G.UI.open(el, { onBack: close, focus: el.querySelector('[data-p="info"]') });
  }
  function close() {
    G.UI.close(el);
    const f = st && st.onClose;
    st = null;
    if (f) f();
  }

  return { open, close };
})();
