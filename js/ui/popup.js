/* ============ popup.js — small boxes over the menus: choices, yes/no, messages, amounts ============
 *   await G.Popup.choose(title, [{ label, value, disabled }], { at })   -> value | null (B)
 *   await G.Popup.confirm(text, { yes, no })                            -> true | false
 *   await G.Popup.say(text)                                             A, B or a click closes it
 *   await G.Popup.count({ title, max, price, money })                   -> 1..max | null
 * Each is its own .scr on top of the stack, so G.Nav drives it and B closes it.
 * Texts arrive translated; options are plain strings or { label, value }.
 */
G.Popup = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s);
  let n = 0;

  function make(cls) {
    const el = document.createElement('section');
    el.className = 'scr pop-scr hidden';
    el.id = 'pop-' + (++n);
    el.setAttribute('translate', 'no');
    el.innerHTML = `<div class="box pop ${cls || ''}"></div>`;
    document.getElementById('frame').appendChild(el);
    return el;
  }
  function done(el) { G.UI.close(el); el.remove(); }

  function choose(title, options, o = {}) {
    return new Promise(res => {
      const el = make('pop-choose');
      const box = el.firstChild;
      box.innerHTML = (title ? `<p class="pop-t">${esc(title)}</p>` : '') + '<div class="menu-list"></div>';
      const list = box.querySelector('.menu-list');
      const end = v => { done(el); res(v); };
      options.forEach((op, i) => {
        const opt = typeof op === 'string' ? { label: op, value: i } : op;
        const b = document.createElement('button');
        b.className = 'menu-item';
        b.textContent = opt.label;
        if (opt.disabled) b.disabled = true;
        if (opt.back) b.setAttribute('data-back', '');
        b.onclick = () => end(opt.value === undefined ? i : opt.value);
        list.appendChild(b);
      });
      if (o.at === 'right') el.classList.add('pop-right');
      G.UI.open(el, { onBack: () => end(null) });
    });
  }

  function confirm(text, o = {}) {
    return choose(text, [{ label: o.yes || T('Yes'), value: true }, { label: o.no || T('No'), value: false, back: true }])
      .then(v => v === true);
  }

  function say(text) {
    return new Promise(res => {
      const el = make('pop-say');
      el.firstChild.innerHTML = `<p>${esc(text)}</p><div class="row end"><button class="btn small" data-first>${esc(T('OK'))}</button></div>`;
      const end = () => { done(el); res(); };
      el.querySelector('button').onclick = end;
      G.UI.open(el, { onBack: end });
    });
  }

  /** How many? Up / down ±1, left / right ±10. With a price, shows the total and keeps it within money. */
  function count(o = {}) {
    return new Promise(res => {
      const max = Math.max(1, o.price ? Math.min(o.max, Math.floor((o.money | 0) / o.price)) : o.max);
      let v = 1;
      const el = make('pop-count');
      el.firstChild.innerHTML = (o.title ? `<p class="pop-t">${esc(o.title)}</p>` : '')
        + `<div class="cnt"><button class="btn small ghost" data-d="-10">«</button><button class="btn small ghost" data-d="-1">−</button>`
        + `<b class="cnt-v"></b><button class="btn small ghost" data-d="1">+</button><button class="btn small ghost" data-d="10">»</button></div>`
        + (o.price ? '<p class="cnt-total"></p>' : '')
        + `<div class="row end"><button class="btn small ghost" data-back>${esc(T('Cancel'))}</button><button class="btn small gold" data-ok data-first>${esc(T('OK'))}</button></div>`;
      const show = () => {
        el.querySelector('.cnt-v').textContent = '×' + v;
        const t = el.querySelector('.cnt-total');
        if (t) t.textContent = G.Menus.money(v * o.price);
      };
      const end = r => { done(el); res(r); };
      const add = d => { v = Math.max(1, Math.min(max, v + d)); show(); };
      el.querySelectorAll('[data-d]').forEach(b => { b.dataset.sfx = 'select'; b.setAttribute('data-nonav', ''); b.onclick = () => add(+b.dataset.d); });
      el.querySelector('[data-ok]').onclick = () => end(v);
      el.querySelector('[data-back]').onclick = () => end(null);
      // The arrows change the amount (G.Nav would only move between the two buttons).
      el.onNavStep = d => { add({ up: 1, down: -1, right: 10, left: -10 }[d]); G.Audio.sfx('select'); return true; };
      show();
      G.UI.open(el, { onBack: () => end(null) });
    });
  }

  return { choose, confirm, say, count };
})();

/** Shared formatting for the menu screens. */
G.Menus = (() => {
  const fmtNum = n => (Math.round(n) | 0).toLocaleString(G.I18n.lang === 'pt-BR' ? 'pt-BR' : G.I18n.lang || 'en');
  /** Money with the Pokédollar sign. */
  const money = n => '₽' + fmtNum(n);
  /** Play time as h:mm. */
  const time = secs => { const m = Math.floor((secs | 0) / 60); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
  const COLORS = ['#9aa0a8', '#4aa8ff', '#ff9a2a', '#7ad86a', '#ff6fb0', '#ffd23f', '#ff4a3a', '#3fbf6a',
                  '#b8cce8', '#e8a830', '#f4d858', '#9a78d0', '#d8643c', '#b8c0c8', '#78d0f0', '#e04848'];
  const badgeNames = () => [G.T('Boulder Badge'), G.T('Cascade Badge'), G.T('Thunder Badge'), G.T('Rainbow Badge'),
                            G.T('Soul Badge'), G.T('Marsh Badge'), G.T('Volcano Badge'), G.T('Earth Badge'),
                            G.T('Zephyr Badge'), G.T('Hive Badge'), G.T('Plain Badge'), G.T('Fog Badge'),
                            G.T('Storm Badge'), G.T('Mineral Badge'), G.T('Glacier Badge'), G.T('Rising Badge')];
  /** The badges as rows of coloured gems (Kanto 1-8; Johto 9-16 once one is earned); the ones not earned are dark. */
  function badges(have) {
    const names = badgeNames();
    const row = from => `<div class="badges">${COLORS.slice(from, from + 8).map((col, j) => {
      const i = from + j, on = have.includes(i + 1);
      return `<span class="badge${on ? ' on' : ''}" style="--c:${col}" title="${G.U.esc(on ? names[i] : '?')}"></span>`;
    }).join('')}</div>`;
    return row(0) + (have.some(b => b > 8) ? row(8) : '');
  }
  const badgeName = n => badgeNames()[n - 1];
  return { money, time, badges, badgeName, num: fmtNum };
})();
