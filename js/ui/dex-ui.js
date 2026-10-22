/* ============ dex-ui.js — the Pokédex ============
 *   G.DexUI.open()
 *   G.Dex.seen(sp) · G.Dex.caught(sp) · G.Dex.counts() -> { seen, caught }   (the battle HUD asks too)
 * A list up to the highest number seen; the entry under the cursor shows on the
 * right: sprite, category, types, height, weight and the Pokédex text once it is
 * caught (only the sprite and name when just seen). A click plays its cry.
 */
G.Dex = (() => {
  const dex = () => G.Field.save.dex;
  return {
    seen: sp => !!dex().seen[sp] || !!dex().caught[sp],
    caught: sp => !!dex().caught[sp],
    counts: () => ({ seen: Object.keys(Object.assign({}, dex().seen, dex().caught)).length, caught: Object.keys(dex().caught).length })
  };
})();

G.DexUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null, shown = 0, watch = 0;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-dex';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box dex-box"><div class="opt-head"><h3></h3><span class="dex-count sub"></span><button class="btn small ghost" data-back></button></div>'
      + '<div class="dex-main"><div class="menu-list dex-list"></div><div class="dex-card"><canvas width="128" height="112"></canvas><div class="dex-info"></div></div></div></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('[data-back]').onclick = close;
  }

  const num = n => String(n).padStart(3, '0');
  const dec = v => (v / 10).toLocaleString(G.I18n.lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  function show(sp) {
    if (sp === shown) return;
    shown = sp;
    const cv = el.querySelector('.dex-card canvas');
    const box = el.querySelector('.dex-info');
    if (!G.Dex.seen(sp)) {
      cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
      G.UI.sprite(cv, sp, { silhouette: true, hero: true, scale: 3 });
      box.innerHTML = `<b>${num(sp)} ?????</b>`;
      return;
    }
    G.UI.sprite(cv, sp, { hero: true, scale: 3 });
    const S = G.SPECIES[sp];
    let h = `<b>${num(sp)} ${esc(G.Names.mon(sp))}</b><span class="sub">${esc(G.Names.genus(sp))}</span>`;
    if (G.Dex.caught(sp)) {
      h += `<div>${G.UI.typeChips(S.types)}</div>`
        + `<div class="dex-hw"><span>${esc(T('Height'))} ${dec(S.h)} m</span><span>${esc(T('Weight'))} ${dec(S.w)} kg</span></div>`
        + `<p class="dex-text">${esc(G.Names.desc('mon', sp))}</p>`;
    }
    box.innerHTML = h;
  }

  function render() {
    const c = G.Dex.counts();
    el.querySelector('h3').textContent = T('Pokédex');
    el.querySelector('.dex-count').textContent = fmt('Seen {s} · Owned {c}', { s: c.seen, c: c.caught });
    el.querySelector('[data-back]').textContent = T('Back');
    const all = Object.keys(G.SPECIES).map(Number).sort((a, b) => a - b);
    const top = Math.max(1, ...all.filter(sp => G.Dex.seen(sp)));
    const list = el.querySelector('.dex-list');
    list.innerHTML = all.filter(sp => sp <= top).map(sp => {
      const seen = G.Dex.seen(sp), caught = G.Dex.caught(sp);
      return `<button class="menu-item${seen ? '' : ' unseen'}" data-sp="${sp}"><span class="dex-no">${num(sp)}</span>`
        + `<span class="grow">${esc(seen ? G.Names.mon(sp) : '-----')}</span>${caught ? '<i class="dex-ball"></i>' : ''}</button>`;
    }).join('');
    list.querySelectorAll('[data-sp]').forEach(b => {
      b.onclick = () => { const sp = +b.dataset.sp; show(sp); if (G.Dex.seen(sp) && G.Audio.cry) G.Audio.cry(sp); };
      b.onmouseenter = () => show(+b.dataset.sp);
    });
    shown = 0;
    show(all.find(sp => G.Dex.seen(sp)) || 1);
  }

  function open() {
    if (!el) build();
    render();
    G.UI.open(el, { onBack: close, focus: el.querySelector(`[data-sp="${shown}"]`) });
    cancelAnimationFrame(watch);
    const loop = () => {
      if (!G.UI.isOpen('scr-dex')) return;
      const f = G.Nav.focused;
      if (f && f.dataset && f.dataset.sp) show(+f.dataset.sp);
      watch = requestAnimationFrame(loop);
    };
    watch = requestAnimationFrame(loop);
  }
  function close() { G.UI.close(el); }

  return { open, close };
})();
