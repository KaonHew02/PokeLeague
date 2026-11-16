/* ============ supercontest-ui.js — the Super Contest on screen (chapter 85) ============
 *   const standings = await G.SuperContestUI.run(state)     (state: G.SuperContest.create; the player is entrant 0)
 * One screen through the three rounds (supercontest.js has the rules): the Visual round's hearts; four dances on a beat
 * track (the four arrows: keys, the pad or the buttons on screen; the lead's steps light up on the first half of the
 * track, the copies go on the second half); four turns of Acting (pick a move, then a judge; then each performance in
 * order, the judges' voltage stars, their hearts); the results. Everything shown is translated here (translate="no").
 * Chapter 86: the title shows `state.label` (Hoenn's ranks) when there is one, and
 *   await G.SuperContestUI.painting({ cat, sp, title, plate })   one of the Lilycove Museum's paintings (A or B closes it).
 */
G.SuperContestUI = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v), esc = s => G.U.esc(s);
  const SC = () => G.SuperContest;
  const ARROW = { up: '▲', down: '▼', left: '◀', right: '▶' };
  let el = null, state = null, onDir = null;

  const catName = c => SC().catName(c), rankName = r => SC().rankName(r);
  const judgeName = j => [T('Jordan'), T('Dexter'), T('Keira')][j];
  /** What each Super Contest effect does, as the move list says it (my own words). */
  const effectText = id => ({
    1: T('Performs first in the next turn.'), 2: T('Performs last in the next turn.'), 4: T("+2 if the judge's voltage goes up."),
    5: T('A plain, solid performance.'), 6: T('+3 if no one else picks the same judge.'), 7: T('Can be used twice in a row.'),
    8: T('Adds the voltage it raises to its score.'), 9: T('+15 if all four pick the same judge.'), 10: T("Lowers every judge's voltage by one."),
    11: T('Doubles the score of the next turn.'), 12: T('Earns the voltage the one before left behind.'), 13: T('No voltage can rise for the rest of the turn.'),
    14: T('Shuffles the order of the next turn.'), 15: T('Doubles its score in the last turn.'), 16: T("Scores more the lower the judge's voltage."),
    17: T('+2 if it performs first.'), 18: T('+2 if it performs last.'), 19: T('No voltage can fall for the rest of the turn.'),
    20: T('+3 if it raises the voltage right after another did.'), 21: T('Scores more the later it performs.'),
    22: T("+3 if the one before filled a judge's voltage."), 23: T('+3 if it scores the lowest this turn.')
  })[id] || '';
  const who = e => (e.player ? G.Field.save.player.name : T(e.name));
  // The rivals' names (G.SuperContest.NAMES), written out for tools/i18n_keys.js.
  const RIVALS = () => [T('Lena'), T('Marco'), T('Yuki'), T('Sasha'), T('Tomas'), T('Ivy'), T('Remy'), T('Nadia'), T('Lucio'), T('Clara'),
                        T('Hugo'), T('Mina'), T('Oscar'), T('Pia'), T('Ravi'), T('Selma')];
  const monName = e => e.mon.nick || G.Names.mon(e.mon.sp);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function build() {
    el = document.createElement('section');
    el.id = 'scr-scontest';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box sc-box"><div class="sc-head"><b class="sc-t"></b><span class="sc-round"></span></div>'
      + '<div class="sc-cards"></div><div class="sc-stage"></div><div class="sc-foot"></div></div>';
    document.getElementById('frame').appendChild(el);
    el.onNavStep = dir => { if (onDir) { onDir(dir); return true; } return false; };
  }

  // ---------------- the four entrants ----------------
  function cards(extra = {}) {
    const box = el.querySelector('.sc-cards');
    if (!box.children.length) {
      box.innerHTML = state.entrants.map(e => `<div class="sc-card${e.player ? ' me' : ''}"><canvas width="48" height="48"></canvas>`
        + `<div class="sc-who"><b>${esc(who(e))}</b><span>${esc(monName(e))}</span></div><div class="sc-pts"></div></div>`).join('');
      state.entrants.forEach((e, i) => { const cv = box.children[i].querySelector('canvas'); if (G.UI.sprite) G.UI.sprite(cv, e.mon.sp, { scale: 1 }); });
    }
    state.entrants.forEach((e, i) => {
      const pts = box.children[i].querySelector('.sc-pts');
      pts.innerHTML = `<span>${esc(T('Visual'))} ${e.visual}</span><span>${esc(T('Dance'))} ${e.dance}</span><span>${esc(T('Acting'))} ${e.acting}</span>`
        + (extra[i] != null ? `<em>${esc(extra[i])}</em>` : '');
    });
  }
  const stage = html => { el.querySelector('.sc-stage').innerHTML = html; };
  const round = text => { el.querySelector('.sc-round').textContent = text; };
  /** Buttons in the foot: -> the value of the one pressed. */
  function ask(buttons) {
    return new Promise(res => {
      const foot = el.querySelector('.sc-foot');
      foot.innerHTML = buttons.map((b, k) => `<button class="btn small${b.cls ? ' ' + b.cls : ''}" data-k="${k}"${b.disabled ? ' disabled' : ''}>${b.html || esc(b.label)}</button>`).join('');
      foot.querySelectorAll('button').forEach(btn => { btn.onclick = () => { foot.innerHTML = ''; res(buttons[+btn.dataset.k].value); }; });
      const first = foot.querySelector('button:not([disabled])');
      if (first && G.Nav && G.Nav.focusFirst) G.Nav.focusFirst(first);
    });
  }
  const next = () => ask([{ label: T('Next'), value: true }]);

  // ---------------- Visual ----------------
  async function visual() {
    round(T('Visual Competition'));
    SC().visual(state);
    stage(`<p class="sc-msg">${esc(T('The judges and the audience look over each Pokémon: its condition is what counts.'))}</p>`);
    cards();
    await next();
  }

  // ---------------- Dance ----------------
  function track(n, lead) {
    const cells = [];
    for (let k = 0; k < 2 * n; k++) cells.push(`<div class="sc-beat${k < n ? ' lead' : ''}" data-b="${k}"></div>`);
    const how = lead.e.player ? T('You lead: step on the blue beats, any way you like.') : T('Watch the lead on the blue beats, then copy its steps on the rest.');
    return `<p class="sc-msg">${esc(fmt('Dance {n} of 4. Leading: {name}', { n: lead.r + 1, name: who(lead.e) }))}<br><small>${esc(how)}</small></p>`
      + `<div class="sc-track">${cells.join('')}<div class="sc-cursor"></div></div><p class="sc-grade"></p>`
      + `<div class="sc-pad">${['left', 'up', 'down', 'right'].map(d => `<button class="btn sc-dir" data-dir="${d}">${ARROW[d]}</button>`).join('')}</div>`;
  }
  async function dance() {
    round(T('Dance Competition'));
    stage(`<p class="sc-msg">${esc(T('Each Pokémon leads one dance. The lead sets the steps on the first half of the beats; the others copy them on the second half, on the beat.'))}</p>`);
    cards();
    await next();
    const S = SC(), rank = state.rank, n = S.STEPS[rank], B = S.BEAT[rank];
    for (let r = 0; r < S.ROUNDS; r++) {
      const L = S.leadOf(state, r), lead = state.entrants[L], mine = [];
      stage(track(n, { r, e: lead }));
      const t0 = performance.now() + B;                             // a beat of lead-in, then beats 1..2n
      const leadSteps = lead.player ? null : S.npcSteps(state, L, null);
      const beatAt = k => (k + 1) * B;
      const show = (k, dir, cls) => { const c = el.querySelector(`.sc-beat[data-b="${k}"]`); if (c) { c.textContent = ARROW[dir] || '·'; if (cls) c.classList.add(cls); } };
      const press = dir => {
        const t = performance.now() - t0, k = Math.round(t / B) - 1;
        mine.push({ dir, t });
        const g = k >= 0 && k < 2 * n ? S.grade(t - beatAt(k), rank) : 0;
        el.querySelector('.sc-grade').textContent = [T('Miss'), T('Good!'), T('Excellent!')][g];
        if (k >= 0 && k < 2 * n && (lead.player ? k < n : k >= n)) show(k, dir, ['miss', 'good', 'great'][g]);
      };
      onDir = press;
      el.querySelectorAll('.sc-dir').forEach(b => { b.onpointerdown = ev => { ev.preventDefault(); press(b.dataset.dir); }; });
      // The cursor runs over the track; the computer lead's steps light up as it makes them.
      const cursor = el.querySelector('.sc-cursor'), end = beatAt(2 * n) + B * 0.6;
      if (leadSteps) for (const s of leadSteps) setTimeout(() => { const k = Math.round(s.t / B) - 1; if (k >= 0 && k < n) show(k, s.dir, 'npc'); }, Math.max(0, t0 - performance.now() + s.t));
      await new Promise(res => {
        (function tick() {
          const t = performance.now() - t0;
          cursor.style.left = Math.max(0, Math.min(100, (t / B - 0.5) / (2 * n) * 100)) + '%';
          if (t >= end) res(); else requestAnimationFrame(tick);
        })();
      });
      onDir = null;
      // The points of this dance.
      const res = lead.player ? S.danceLead(mine, rank) : S.danceLead(leadSteps, rank);
      lead.dance += res.points;
      const got = { [L]: '+' + res.points };
      for (const e of state.entrants) {
        if (e.i === L) continue;
        const p = S.danceBack(e.player ? mine : S.npcSteps(state, e.i, res.seq), res.seq, rank);
        e.dance += p;
        got[e.i] = '+' + p;
      }
      cards(got);
      await wait(900);
    }
    stage(`<p class="sc-msg">${esc(T('The dances are over.'))}</p>`);
    cards();
    await next();
  }

  // ---------------- Acting ----------------
  function judges() {
    const S = SC();
    return `<div class="sc-judges">${S.JUDGES.map((j, k) => `<div class="sc-judge${j.head ? ' head' : ''}"><b>${esc(judgeName(k))}</b>`
      + `<span class="sc-volt">${'★'.repeat(state.voltage[k])}${'☆'.repeat(S.VMAX - state.voltage[k])}</span></div>`).join('')}</div>`;
  }
  async function acting() {
    const S = SC();
    round(T('Acting Competition'));
    stage(judges() + `<p class="sc-msg">${esc(T('Four turns: pick a move and a judge. A move of the contest\'s category raises that judge\'s voltage; the one who fills it earns a bonus. Judges picked by fewer Pokémon give more.'))}</p>`);
    cards();
    await next();
    for (let t = 0; t < S.TURNS; t++) {
      const order = S.startTurn(state);
      const me = state.entrants[0];
      let pickMove = null, pickJudge = null;
      while (pickJudge == null) {
        stage(judges() + `<p class="sc-msg">${esc(fmt('Turn {n} of {all}. Order: {names}', { n: t + 1, all: S.TURNS, names: order.map(i => who(state.entrants[i])).join(', ') }))}</p>`);
        pickMove = await ask(S.choices(state, 0).map(o => ({
          value: o.id, disabled: !o.ok, cls: 'sc-move ' + (o.ct || ''),
          html: `<span class="sc-mv-top"><b>${esc(G.Names.move(o.id))}</b><i>${esc(catName(o.ct))} · ${'♥'.repeat(((G.SUPER_CONTEST || {})[o.sce] || {}).appeal || 0) || '♡'}</i></span>`
            + `<small>${esc(effectText(o.sce))}</small>`
        })));
        stage(judges() + `<p class="sc-msg">${esc(fmt('{move}: to which judge?', { move: G.Names.move(pickMove) }))}</p>`);
        pickJudge = await ask(S.JUDGES.map((j, k) => ({ value: k, label: judgeName(k) })).concat([{ value: null, label: T('Back'), cls: 'ghost' }]));
      }
      const picks = state.entrants.map(e => (e.player ? { move: pickMove, judge: pickJudge } : S.pick(state, e.i)));
      const shown = state.voltage.slice(), res = S.playTurn(state, picks), after = state.voltage.slice();
      // Each performance in turn.
      state.voltage = shown;
      for (const ev of res.events) {
        const e = state.entrants[ev.i];
        state.voltage = ev.volts.slice();
        stage(judges() + `<p class="sc-msg">${esc(fmt("{name}'s {mon}: {move}, for {judge}.", { name: who(e), mon: monName(e), move: G.Names.move(ev.move), judge: judgeName(ev.judge) }))}`
          + `<br>${esc(ev.ok ? fmt('+{n} ♥', { n: ev.hearts }) : T('It cannot use the same move twice in a row!'))}`
          + (ev.filled ? `<br><b>${esc(fmt("{judge}'s voltage is at its peak!", { judge: judgeName(ev.judge) }))}</b>` : '') + '</p>');
        await wait(1100);
      }
      state.voltage = after;
      stage(judges() + `<p class="sc-msg">${esc(T('The judges hand out their hearts.'))}</p>`);
      cards(Object.fromEntries(res.hearts.map((h, i) => [i, '+' + h + ' ♥'])));
      await next();
    }
  }

  // ---------------- the results ----------------
  async function results() {
    const S = SC(), st = S.standings(state), win = state.entrants[st[0].i];
    round(T('Results'));
    stage(`<table class="sc-res"><tr><th></th><th></th><th>${esc(T('Visual'))}</th><th>${esc(T('Dance'))}</th><th>${esc(T('Acting'))}</th><th>${esc(T('Total'))}</th></tr>`
      + st.map(x => { const e = state.entrants[x.i]; return `<tr${e.player ? ' class="me"' : ''}><td>${x.place}</td><td>${esc(who(e))} · ${esc(monName(e))}</td>`
        + `<td>${e.visual}</td><td>${e.dance}</td><td>${e.acting}</td><td><b>${x.total}</b></td></tr>`; }).join('') + '</table>'
      + `<p class="sc-msg">${esc(fmt('{name} and {mon} win the contest!', { name: who(win), mon: monName(win) }))}</p>`);
    cards();
    await next();
    return st;
  }

  /** Plays a whole contest on screen: -> the standings. */
  async function run(st) {
    if (!el) build();
    state = st;
    el.querySelector('.sc-cards').innerHTML = '';
    el.querySelector('.sc-t').textContent = fmt('{cat} Contest · {rank}', { cat: catName(st.cat), rank: st.label || rankName(st.rank) });
    G.UI.open(el, { onBack: () => {} });
    try {
      await visual();
      await dance();
      await acting();
      return await results();
    } finally {
      onDir = null;
      G.UI.close(el);
    }
  }

  // ---------------- a painting (chapter 86: the Lilycove Museum's second floor) ----------------
  let pel = null;
  /** The Pokémon in a gold frame on its category's color, the title and the plate. -> when it is closed */
  function painting({ cat, sp, title, plate }) {
    if (!pel) {
      pel = document.createElement('section');
      pel.id = 'scr-painting';
      pel.className = 'scr dim hidden';
      pel.setAttribute('translate', 'no');
      pel.innerHTML = '<div class="box pt-box"><div class="pt-frame"><canvas width="96" height="96"></canvas></div>'
        + '<b class="pt-title"></b><p class="pt-plate"></p><button class="btn small pt-back" data-back></button></div>';
      document.getElementById('frame').appendChild(pel);
    }
    pel.querySelector('.pt-frame').className = 'pt-frame ' + (cat || '');
    if (G.UI.sprite) G.UI.sprite(pel.querySelector('canvas'), sp, { scale: 2 });
    pel.querySelector('.pt-title').textContent = '“' + title + '”';
    pel.querySelector('.pt-plate').textContent = plate;
    const back = pel.querySelector('.pt-back');
    back.textContent = T('Back');
    return new Promise(res => {
      const done = () => { G.UI.close(pel); res(); };
      back.onclick = done;
      G.UI.open(pel, { onBack: done });
    });
  }

  return { run, painting, catName, rankName, judgeName, effectText, RIVALS };
})();
