/* ============ pc-ui.js — the Pokémon Storage System ============
 *   await G.PCUI.open()     resolves when the player logs off (scripts: ['pc'])
 * The party on the left, the current box (6 × 5) on the right, ◀ ▶ for the
 * eight boxes. A Pokémon in a box: Withdraw, Summary, Release. One in the party:
 * Deposit, Summary, Release. The party always keeps a Pokémon that can battle.
 * Storing a Pokémon restores it (G.Field.toBox does the same).
 */
G.PCUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  let el = null, done = null;

  const S = () => G.Field.save;
  function boxes() {
    const s = S();
    if (!s.boxes.length) for (let i = 0; i < G.Store.BOXES; i++) s.boxes.push(new Array(G.Store.BOX_SIZE).fill(null));
    return s.boxes;
  }

  function build() {
    el = document.createElement('section');
    el.id = 'scr-pc';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box pc-box"><div class="opt-head"><h3></h3><button class="btn small ghost" data-back></button></div>'
      + '<div class="pc-main"><div class="pc-party"></div><div class="pc-right"><div class="pc-nav">'
      + '<button class="btn small ghost pc-prev" data-sfx="select">◀</button><b class="pc-name"></b><button class="btn small ghost pc-next" data-sfx="select">▶</button>'
      + '</div><div class="pc-grid"></div></div></div><p class="pc-hint sub"></p></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('[data-back]').onclick = logOff;
    el.querySelector('.pc-prev').onclick = () => turn(-1);
    el.querySelector('.pc-next').onclick = () => turn(1);
  }

  function turn(d) {
    const s = S();
    s.box = (s.box + d + boxes().length) % boxes().length;
    render();
  }

  const cell = (m, attrs) => `<button class="pc-cell${m ? '' : ' none'}" ${attrs}${m ? '' : ' disabled'}>`
    + (m ? `<canvas width="56" height="56"></canvas><span class="pc-lv">${esc(fmt('Lv. {n}', { n: m.lvl }))}</span>` : '') + '</button>';

  function render(focusSel) {
    const s = S(), box = boxes()[s.box];
    el.querySelector('h3').textContent = T('Pokémon Storage System');
    el.querySelector('[data-back]').textContent = T('Log off');
    el.querySelector('.pc-name').textContent = fmt('Box {n}', { n: s.box + 1 }) + ` · ${box.filter(Boolean).length}/${box.length}`;
    el.querySelector('.pc-party').innerHTML = `<p class="sub">${esc(T('Party'))}</p>`
      + [0, 1, 2, 3, 4, 5].map(i => cell(s.party[i], `data-p="${i}"`)).join('');
    el.querySelector('.pc-grid').innerHTML = box.map((m, i) => cell(m, `data-b="${i}"`)).join('');
    el.querySelectorAll('.pc-cell canvas').forEach(cv => {
      const b = cv.parentElement;
      const m = b.dataset.p != null ? s.party[+b.dataset.p] : box[+b.dataset.b];
      G.UI.sprite(cv, m.sp, { shiny: !!m.shiny, scale: 2, hero: true, shadow: false });
      b.title = G.Mon.name(m);
    });
    el.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => partyMon(+b.dataset.p); });
    el.querySelectorAll('[data-b]').forEach(b => { b.onclick = () => boxMon(+b.dataset.b); });
    el.querySelector('.pc-hint').textContent = T('Choose a Pokémon to move it between your party and the box.');
    if (focusSel) G.Nav.focusFirst(el.querySelector(focusSel) || undefined);
  }

  /** Can this one leave the party? There must be another that can still battle. */
  const canLeave = mon => S().party.some(m => m !== mon && m.hp > 0);

  async function partyMon(i) {
    const s = S(), mon = s.party[i];
    const v = await G.Popup.choose(G.Mon.name(mon), [
      { label: T('Deposit'), value: 'deposit' }, { label: T('Summary'), value: 'summary' },
      { label: T('Release'), value: 'release' }, { label: T('Cancel'), value: null, back: true }]);
    if (v === 'summary') { G.SummaryUI.open(s.party, i, () => render(`[data-p="${i}"]`)); return; }
    if (v === 'deposit' || v === 'release') {
      if (!canLeave(mon)) { await G.Popup.say(T("That's your last Pokémon that can battle!")); return; }
    }
    if (v === 'deposit') {
      const box = boxes()[s.box], j = box.indexOf(null);
      if (j < 0) { await G.Popup.say(T('This box is full.')); return; }
      s.party.splice(i, 1);
      G.Mon.heal(mon);
      box[j] = mon;
      G.Audio.sfx('pop');
      render(`[data-b="${j}"]`);
    } else if (v === 'release') {
      if (await release(mon)) { s.party.splice(i, 1); render('[data-p="0"]'); }
    }
  }

  async function boxMon(j) {
    const s = S(), box = boxes()[s.box], mon = box[j];
    const v = await G.Popup.choose(G.Mon.name(mon), [
      { label: T('Withdraw'), value: 'withdraw' }, { label: T('Summary'), value: 'summary' },
      { label: T('Release'), value: 'release' }, { label: T('Cancel'), value: null, back: true }]);
    if (v === 'summary') { G.SummaryUI.open(box, j, () => render(`[data-b="${j}"]`)); return; }
    if (v === 'withdraw') {
      if (s.party.length >= 6) { await G.Popup.say(T('Your party is full!')); return; }
      box[j] = null;
      s.party.push(mon);
      G.Audio.sfx('pop');
      render(`[data-p="${s.party.length - 1}"]`);
    } else if (v === 'release') {
      if (await release(mon)) { box[j] = null; render(); }
    }
  }

  async function release(mon) {
    const name = G.Mon.name(mon);
    if (!(await G.Popup.confirm(fmt('Release {mon}? You will never see it again.', { mon: name })))) return false;
    await G.Popup.say(fmt('{mon} was released. Bye-bye, {mon}!', { mon: name }));
    return true;
  }

  function logOff() {
    G.UI.close(el);
    const d = done; done = null;
    if (d) d();
  }

  function open() {
    if (!el) build();
    return new Promise(res => {
      done = res;
      render();
      G.UI.open(el, { onBack: logOff, focus: el.querySelector('.pc-cell:not(:disabled)') });
    });
  }

  return { open };
})();
