/* ============ name-ui.js — naming the player, the rival and Pokémon ============
 *   await G.NameUI.ask({ kind: 'player' | 'rival' | 'rival2' | 'mon', gender, mon, cancel })   (rival2: Johto's)
 *       -> the name (cleaned, at most G.Store.MAX_NAME characters) | null
 *   'player' and 'rival' always get a name (empty = the first suggestion);
 *   'mon' returns null for "no nickname" (B, Cancel, or the species name).
 *
 * A text field for keyboards and phones, and suggestion chips for controllers.
 */
G.NameUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null;

  const SUGGEST = {
    m: ['Red', 'Ash', 'Jack', 'Kai', 'Leo'],
    f: ['Leaf', 'Green', 'Mia', 'Lily', 'Yui'],
    rival: ['Blue', 'Gary', 'Jay', 'Rex', 'Ken'],
    rival2: ['Silver', 'Kamon', 'Hugo', 'Zack', 'Rai']
  };

  function build() {
    el = document.createElement('section');
    el.id = 'scr-name';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box name-box"><div class="name-pic"><canvas width="96" height="96"></canvas></div>'
      + '<div class="name-main"><h3></h3><input class="field name-in" type="text" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="done">'
      + '<p class="sub name-len"></p><div class="chips name-chips"></div>'
      + '<div class="row end"><button class="btn small ghost name-cancel" data-back></button><button class="btn small gold name-ok"></button></div></div></div>';
    document.getElementById('frame').appendChild(el);
  }

  const len = s => [...s].length;

  function ask(o = {}) {
    if (!el) build();
    const kind = o.kind || 'player';
    const max = G.Store.MAX_NAME;
    const input = el.querySelector('.name-in');
    const title = el.querySelector('h3');
    const cv = el.querySelector('canvas');
    const pic = el.querySelector('.name-pic');
    let picks;
    if (kind === 'mon') {
      const sp = G.Names.mon(o.mon.sp);
      title.textContent = fmt("{mon}'s nickname?", { mon: sp });
      picks = [];
      input.placeholder = sp;
      input.value = o.mon.nick || '';
      G.UI.sprite(cv, o.mon.sp, { shiny: !!o.mon.shiny, hero: true, scale: 3 });
      pic.classList.remove('hidden');
    } else {
      title.textContent = kind === 'rival2' ? T("The thief's name?") : kind === 'rival' ? T("Your rival's name?") : T('Your name?');
      picks = kind === 'rival' || kind === 'rival2' ? SUGGEST[kind] : SUGGEST[o.gender === 'f' ? 'f' : 'm'];
      input.placeholder = picks[0];
      input.value = '';
      const who = kind === 'rival' ? 'rival' : kind === 'rival2' ? 'silver' : (o.gender === 'f' ? 'player-girl' : 'player-boy');
      const art = G.People && G.People.portrait ? G.People.portrait(who, 4) : null;
      const c = cv.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
      if (art) { c.imageSmoothingEnabled = false; c.drawImage(art, (cv.width - art.width) / 2, cv.height - art.height); }
      pic.classList.toggle('hidden', !art);
    }
    input.maxLength = max * 2;                 // characters outside the BMP count twice in maxLength
    const lenEl = el.querySelector('.name-len');
    const showLen = () => { lenEl.textContent = `${len(input.value.trim())}/${max}`; };
    input.oninput = () => {
      if (len(input.value) > max) input.value = [...input.value].slice(0, max).join('');
      showLen();
    };
    showLen();
    const chips = el.querySelector('.name-chips');
    chips.innerHTML = picks.map(p => `<button class="chip" data-n="${esc(p)}">${esc(p)}</button>`).join('');
    chips.classList.toggle('hidden', !picks.length);
    const cancel = el.querySelector('.name-cancel');
    cancel.textContent = kind === 'mon' ? T('No nickname') : T('Back');
    cancel.classList.toggle('hidden', kind !== 'mon' && !o.cancel);
    el.querySelector('.name-ok').textContent = T('OK');

    return new Promise(res => {
      const end = v => { input.blur(); G.UI.close(el); res(v); };
      const ok = () => {
        let v = G.Store.cleanName(input.value, max);
        if (kind === 'mon') { end(v && v !== G.Names.mon(o.mon.sp) ? v : null); return; }
        if (!v) v = picks[0];
        end(v);
      };
      chips.querySelectorAll('[data-n]').forEach(b => { b.onclick = () => { input.value = b.dataset.n; showLen(); ok(); }; });
      el.querySelector('.name-ok').onclick = ok;
      cancel.onclick = () => end(kind === 'mon' || o.cancel ? null : picks[0]);
      input.onkeydown = e => {
        if (e.key === 'Enter') { e.preventDefault(); ok(); }
        else if (e.key === 'Escape') { e.preventDefault(); input.blur(); }
      };
      input.onclick = () => input.focus();
      G.UI.open(el, { onBack: () => cancel.click(), focus: input });
      // On a computer the field takes the keys at once; a phone opens its keyboard on a tap.
      if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => { if (G.UI.isOpen('scr-name')) input.focus(); }, 60);
    });
  }

  return { ask };
})();
