/* ============ learn-ui.js — learning a new move outside battle ============
 *   G.LearnUI.teach(mon, moveId, say) -> Promise<boolean learned>
 *       say(text, { wait }) shows a line (a text box of the caller: evolution
 *       scene, dialog box...). With four moves already it asks which to forget.
 *   G.LearnUI.chooseForget(mon, moveId) -> Promise<slot 0..3 | -1>
 * (In battle the engine asks for the same thing; battle-ui.js shows its own list.)
 */
G.LearnUI = (() => {
  const fmt = (k, v) => G.I18n.fmt(k, v);
  const esc = s => G.U.esc(s);
  let scr = null;

  function build() {
    scr = document.createElement('section');
    scr.id = 'scr-learn';
    scr.className = 'scr dim hidden';
    scr.setAttribute('translate', 'no');
    scr.innerHTML = '<div class="box" style="min-width:55%"><h3></h3><p class="sub"></p><div class="menu-list"></div></div>';
    document.getElementById('frame').appendChild(scr);
  }

  function chooseForget(mon, move) {
    if (!scr) build();
    return new Promise(done => {
      const M = G.MOVES[move];
      scr.querySelector('h3').textContent = fmt('Which move should {mon} forget?', { mon: G.Mon.name(mon) });
      scr.querySelector('.sub').textContent = fmt('New move: {move} ({type}, PP {pp})', { move: G.Names.move(move), type: G.Names.type(M.type), pp: M.pp });
      const list = scr.querySelector('.menu-list');
      list.innerHTML = '';
      const end = v => { G.UI.close(scr); done(v); };
      mon.moves.forEach((m, i) => {
        const b = document.createElement('button');
        b.className = 'menu-item';
        if (!i) b.dataset.first = '';
        b.innerHTML = `${esc(G.Names.move(m.id))} <small>${esc(G.Names.type(G.MOVES[m.id].type))} · PP ${m.pp}/${G.Mon.ppMax(m.id, m.ppUp)}</small>`;
        b.onclick = () => end(i);
        list.appendChild(b);
      });
      const no = document.createElement('button');
      no.className = 'menu-item';
      no.setAttribute('data-back', '');
      no.textContent = fmt("Don't learn {move}", { move: G.Names.move(move) });
      no.onclick = () => end(-1);
      list.appendChild(no);
      G.UI.open(scr, { onBack: () => end(-1) });
    });
  }

  async function teach(mon, move, say) {
    if (G.Mon.knows(mon, move)) return false;
    const name = G.Mon.name(mon), mv = G.Names.move(move);
    if (mon.moves.length < 4) {
      G.Mon.learn(mon, move);
      G.Audio.sfx('levelup');
      await say(fmt('{mon} learned {move}!', { mon: name, move: mv }), { wait: true });
      return true;
    }
    await say(fmt('{mon} wants to learn {move}, but it already knows four moves. Forget a move to make room?', { mon: name, move: mv }), { wait: true });
    const slot = await chooseForget(mon, move);
    if (slot < 0) { await say(fmt('{mon} did not learn {move}.', { mon: name, move: mv }), { wait: true }); return false; }
    const old = G.Mon.learn(mon, move, slot);
    await say(fmt('1, 2 and... Poof! {mon} forgot {move}.', { mon: name, move: G.Names.move(old) }), { wait: true });
    G.Audio.sfx('levelup');
    await say(fmt('{mon} learned {move}!', { mon: name, move: mv }), { wait: true });
    return true;
  }

  return { teach, chooseForget };
})();
