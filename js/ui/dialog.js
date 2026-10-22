/* ============ dialog.js — dialog box with typewriter text and choices ============
 *   await G.Dialog.say(text, { name })                  one text (already translated)
 *   const i = await G.Dialog.ask(text, { options, name })  options default [Yes, No]; B picks the last
 *   G.Dialog.open      is a box on screen (or about to be)
 *   G.Dialog.instant   debug: no typewriter
 *
 * A DOM box (translate="no": the text arrives translated) at the bottom of
 * #frame. It types one code point at a time (CJK and emoji safe) at the
 * textSpeed setting, splits long text into pages of two lines (measured, so
 * every language and font fits), blinks ▼ when a page is done, and reads the
 * buttons itself (data-noinput: G.Nav leaves it alone). A finishes the page,
 * then advances; so does B, and a click or tap anywhere on the box.
 */
G.Dialog = (() => {
  const SPEED = { slow: 24, mid: 48, fast: 110 };     // code points per second
  let el = null, box, nameEl, textEl, onEl, offEl, more, choiceEl, measure;
  let st = null;              // the text being shown
  let hideTimer = 0;
  let raf = 0, last = 0;
  let instant = false;

  function build() {
    if (el) return;
    el = document.createElement('section');
    el.id = 'scr-dialog';
    el.className = 'scr dlg hidden';
    el.setAttribute('data-noinput', '');
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="dlg-wrap"><div class="box dlg-choices hidden"></div>'
      + '<div class="box dlg-box"><div class="dlg-name hidden"></div>'
      + '<div class="dlg-text"><span class="dlg-on"></span><span class="dlg-off"></span></div>'
      + '<div class="dlg-measure dlg-text" aria-hidden="true"></div><div class="dlg-more">▼</div></div></div>';
    document.getElementById('frame').appendChild(el);
    box = el.querySelector('.dlg-box');
    nameEl = el.querySelector('.dlg-name');
    textEl = el.querySelector('.dlg-text');
    onEl = el.querySelector('.dlg-on');
    offEl = el.querySelector('.dlg-off');
    more = el.querySelector('.dlg-more');
    choiceEl = el.querySelector('.dlg-choices');
    measure = el.querySelector('.dlg-measure');
    el.addEventListener('pointerdown', e => {
      if (e.button !== 0 || (e.target.closest && e.target.closest('.dlg-choices'))) return;
      e.preventDefault();
      advance();
    });
  }

  // ---------------- pages ----------------

  // Words with their spaces; CJK characters and full-width punctuation one by one.
  const TOKENS = /\n|[⺀-鿿豈-﫿＀-￯]|[^\s⺀-鿿豈-﫿＀-￯]+[^\S\n]*|[^\S\n]+/gu;
  function paginate(text) {
    measure.style.width = textEl.offsetWidth + 'px';
    const maxH = linesHeight(2);
    const fits = s => { measure.textContent = s; return measure.offsetHeight <= maxH; };
    const pages = [];
    let cur = '';
    const push = () => { const p = cur.replace(/\s+$/, ''); if (p) pages.push(p); cur = ''; };
    for (const tok of text.match(TOKENS) || []) {
      if (fits(cur + tok)) { cur += tok; continue; }
      push();
      let t = tok.replace(/^[^\S\n]+/, '');
      if (t === '\n') continue;
      if (!fits(t)) {
        // A word too long for the box: split it by code points.
        for (const ch of Array.from(t)) { if (!fits(cur + ch)) push(); cur += ch; }
        continue;
      }
      cur = t;
    }
    push();
    return pages.length ? pages : [''];
  }
  function linesHeight(n) {
    measure.textContent = 'Ag';
    const one = measure.offsetHeight;
    measure.textContent = 'Ag\nAg';
    const two = measure.offsetHeight;
    return one + (two - one) * (n - 1) + 2;
  }

  // ---------------- showing ----------------

  function begin(s) {
    build();
    clearTimeout(hideTimer);
    if (el.classList.contains('hidden')) G.UI.open(el, { onBack: () => {} });
    G.Btn.swallow();
    st = s;
    nameEl.textContent = s.name || '';
    nameEl.classList.toggle('hidden', !s.name);
    choiceEl.classList.add('hidden');
    st.pages = paginate(String(s.text || ''));
    st.page = 0;
    startPage();
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }

  function startPage() {
    st.cps = Array.from(st.pages[st.page]);
    st.n = 0; st.acc = 0;
    st.typing = true;
    more.classList.remove('on');
    draw();
    if (instant) finishPage();
  }

  function draw() {
    onEl.textContent = st.cps.slice(0, st.n).join('');
    offEl.textContent = st.cps.slice(st.n).join('');
  }

  function finishPage() {
    st.n = st.cps.length;
    st.typing = false;
    draw();
    const lastPage = st.page >= st.pages.length - 1;
    if (lastPage && st.ask) showChoices();
    else more.classList.add('on');
  }

  function showChoices() {
    const a = st.ask;
    choiceEl.innerHTML = '';
    a.options.forEach((label, i) => {
      const b = document.createElement('button');
      b.className = 'menu-item' + (i === a.sel ? ' sel' : '');
      b.textContent = label;
      b.setAttribute('data-sfx', 'none');
      b.addEventListener('click', e => { e.stopPropagation(); a.sel = i; pick(); });
      b.addEventListener('mouseenter', () => { a.sel = i; markSel(); });
      choiceEl.appendChild(b);
    });
    choiceEl.classList.remove('hidden');
  }
  function markSel() { [...choiceEl.children].forEach((b, i) => b.classList.toggle('sel', i === st.ask.sel)); }

  function pick() {
    if (!st || !st.ask) return;
    G.Audio.sfx('click');
    done(st.ask.sel);
  }

  function advance() {
    if (!st) return;
    if (st.typing) { finishPage(); return; }
    if (st.page < st.pages.length - 1) { G.Audio.sfx('select'); st.page++; startPage(); return; }
    if (st.ask) return;
    G.Audio.sfx('select');
    done();
  }

  function done(v) {
    const s = st;
    st = null;
    more.classList.remove('on');
    // Hide on the next frame unless another text follows at once (no flicker between boxes).
    hideTimer = setTimeout(close, 40);
    G.Btn.swallow();
    s.res(v);
  }

  function close() {
    if (st || !el) return;
    G.UI.close(el);
    choiceEl.classList.add('hidden');
  }

  function loop(ts) {
    raf = 0;
    const dt = Math.min(0.1, (ts - last) / 1000);
    last = ts;
    if (!st) return;
    if (st.typing) {
      st.acc += dt * (SPEED[G.Settings.get('textSpeed')] || SPEED.mid);
      const n = Math.min(st.cps.length, Math.floor(st.acc));
      if (n !== st.n) { st.n = n; draw(); }
      if (st.n >= st.cps.length) finishPage();
    }
    const choosing = !st.typing && st.ask && st.page >= st.pages.length - 1;
    if (choosing) {
      const a = st.ask;
      if (G.Btn.repeat('up') || G.Btn.repeat('left')) { a.sel = (a.sel + a.options.length - 1) % a.options.length; markSel(); G.Audio.sfx('select'); }
      else if (G.Btn.repeat('down') || G.Btn.repeat('right')) { a.sel = (a.sel + 1) % a.options.length; markSel(); G.Audio.sfx('select'); }
      else if (G.Btn.pressed('a')) pick();
      else if (G.Btn.pressed('b')) { a.sel = a.options.length - 1; markSel(); pick(); }
    } else if (G.Btn.pressed('a') || G.Btn.pressed('b')) advance();
    if (st) raf = requestAnimationFrame(loop);
  }

  function say(text, o = {}) {
    return new Promise(res => begin({ text, name: o.name, res }));
  }

  function ask(text, o = {}) {
    const options = o.options && o.options.length ? o.options : [G.T('Yes'), G.T('No')];
    return new Promise(res => begin({ text, name: o.name, res, ask: { options, sel: o.sel | 0 } }));
  }

  return { say, ask, close,
           get open() { return !!st || (!!el && !el.classList.contains('hidden')); },
           get instant() { return instant; }, set instant(v) { instant = !!v; } };
})();
