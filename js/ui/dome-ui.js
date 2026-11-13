/* ============ dome-ui.js — the Battle Dome's tournament tree (chapter 81) ============
 *   await G.DomeUI.show({ names: [16], ranks: [16], me: 0, results: [[8], [4], [2], [1]] })
 *     names    the sixteen entrants' names as shown (already translated), slots 0-15
 *     ranks    their ranks 1-16
 *     me       the player's slot (highlighted)
 *     results  results[r][k]: the slot that won match k of round r (the first round has eight
 *              matches), or null while it is still to be played
 * The left half (slots 0-7) and the right half (8-15) meet in the final in the middle, so the
 * tree is eight rows high and fits a phone held sideways. Back closes it.
 */
G.DomeUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s);
  let el = null, done = null;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-dome';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box dome-box"><p class="dome-t"></p><div class="dome-grid"></div>'
      + '<div class="dome-foot"><button class="btn small ghost" data-back></button></div></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('[data-back]').onclick = close;
  }

  /** One entrant in round r (0: the first round), at row `row` spanning `span` rows of column `col`. */
  function cell(b, slot, r, k, col, row, span) {
    const res = b.results || [];
    const decided = res[r] && res[r][k >> 1] != null;
    const cls = ['dome-c', slot === b.me ? 'me' : '', slot == null ? 'tbd' : decided && res[r][k >> 1] !== slot ? 'out' : decided ? 'won' : ''].filter(Boolean).join(' ');
    const label = slot == null ? '—' : (r === 0 ? `<i>${b.ranks[slot]}</i> ` : '') + esc(b.names[slot]);
    return `<div class="${cls}" style="grid-column:${col};grid-row:${row} / span ${span}">${label}</div>`;
  }

  function render(b) {
    const res = b.results || [], at = (r, k) => (res[r] && res[r][k] != null ? res[r][k] : null);
    let html = '';
    for (let i = 0; i < 16; i++) {                                   // the first round: eight a side
      const left = i < 8;
      html += cell(b, i, 0, i, left ? 1 : 7, (i % 8) + 1, 1);
    }
    for (let k = 0; k < 8; k++) {                                    // the eight who won the first round
      const left = k < 4;
      html += cell(b, at(0, k), 1, k, left ? 2 : 6, (k % 4) * 2 + 1, 2);
    }
    for (let k = 0; k < 4; k++) {                                    // the semifinalists
      const left = k < 2;
      html += cell(b, at(1, k), 2, k, left ? 3 : 5, (k % 2) * 4 + 1, 4);
    }
    const name = s => (s == null ? '—' : esc(b.names[s]));
    const f = [at(2, 0), at(2, 1)], champ = at(3, 0);
    const fin = s => `<span class="${['dome-fn', s === b.me ? 'me' : '', champ != null && s != null && champ !== s ? 'out' : ''].filter(Boolean).join(' ')}">${name(s)}</span>`;
    html += `<div class="dome-f"><b>${esc(T('Final'))}</b>${fin(f[0])}<span class="dome-vs">VS</span>${fin(f[1])}`
      + `<span class="dome-champ">${esc(T('Champion'))}: ${name(champ)}</span></div>`;
    el.querySelector('.dome-grid').innerHTML = html;
    el.querySelector('.dome-t').textContent = T('Tournament');
    el.querySelector('[data-back]').textContent = T('Back');
  }

  function show(b) {
    if (!el) build();
    render(b);
    return new Promise(res => {
      done = res;
      G.UI.open(el, { onBack: close, focus: el.querySelector('[data-back]') });
    });
  }
  function close() {
    G.UI.close(el);
    const d = done;
    done = null;
    if (d) d();
  }

  return { show };
})();
