/* ============ bag-ui.js — the Bag outside battle ============
 *   G.BagUI.open()                      from the start menu: Use, Toss
 *   await G.BagUI.pick({ title, filter, price })   -> item id | null   (the shop's Sell)
 * Pockets: Items · Poké Balls · TMs & HMs · Key Items (berries go with the items).
 * The selected item's description shows at the bottom. Using an item on a
 * Pokémon goes through G.FieldItems; a Rare Candy or a stone can lead to the
 * learn-move and evolution scenes, during which the menus step aside.
 * In battle the battle screen has its own item list (battle-ui.js).
 */
G.BagUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const FI = () => G.FieldItems;
  let el = null;
  let st = null;           // { mode: 'menu' | 'pick', pocket, sel, title, filter, price, done }
  const POCKETS = ['items', 'balls', 'tms', 'key'];
  let lastPocket = 'items';

  function build() {
    el = document.createElement('section');
    el.id = 'scr-bag';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box bag-box"><div class="opt-head"><h3></h3><button class="btn small ghost" data-back></button></div>'
      + '<div class="opt-tabs bag-tabs">' + POCKETS.map(p => `<button class="opt-tab" data-pk="${p}"></button>`).join('') + '</div>'
      + '<div class="menu-list bag-list"></div><p class="bag-desc"></p></div>';
    document.getElementById('frame').appendChild(el);
    el.querySelector('[data-back]').onclick = () => finish(null);
    el.querySelectorAll('[data-pk]').forEach(b => { b.onclick = () => { st.pocket = b.dataset.pk; st.sel = null; render(); }; });
    el.onNavStep = (dir, focused) => {
      // Left / right from the list change the pocket.
      if ((dir !== 'left' && dir !== 'right') || !focused || !focused.closest('.bag-list')) return false;
      const k = (POCKETS.indexOf(st.pocket) + (dir === 'right' ? 1 : POCKETS.length - 1)) % POCKETS.length;
      st.pocket = POCKETS[k]; st.sel = null; G.Audio.sfx('select'); render(true);
      return true;
    };
  }

  const bag = () => G.Field.save.bag;
  const pocketOf = id => { const p = (G.ITEMS[id] || {}).pocket || 'items'; return p === 'berries' ? 'items' : p; };
  /** Items of a pocket in the bag, in the data's order (balls by strength, TMs by number...). */
  function itemsIn(pocket) {
    const order = Object.keys(G.ITEMS);
    return Object.keys(bag()).filter(id => bag()[id] > 0 && G.ITEMS[id] && pocketOf(id) === pocket && (!st.filter || st.filter(id)))
      .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }
  const sellPrice = id => Math.floor(((G.ITEM_FX[id] || {}).price || 0) / 2);

  function itemLabel(id) {
    const tm = FI().tm(id);
    return tm ? `${id.toUpperCase()} ${G.Names.move(tm)}` : G.Names.item(id);
  }

  function render(keepFocus) {
    el.querySelector('h3').textContent = st.title || T('Bag');
    el.querySelector('[data-back]').textContent = st.mode === 'pick' ? T('Cancel') : T('Back');
    const labels = { items: T('Items'), balls: T('Poké Balls'), tms: T('TMs & HMs'), key: T('Key Items') };
    el.querySelectorAll('[data-pk]').forEach(b => { b.textContent = labels[b.dataset.pk]; b.classList.toggle('on', b.dataset.pk === st.pocket); });
    const list = el.querySelector('.bag-list');
    const ids = itemsIn(st.pocket);
    list.innerHTML = ids.length ? '' : `<p class="sub bag-empty">${esc(T('Nothing here.'))}</p>`;
    for (const id of ids) {
      const b = document.createElement('button');
      b.className = 'menu-item';
      b.dataset.item = id;
      const right = st.price ? G.Menus.money(sellPrice(id)) : ((st.pocket === 'key' && !(G.ITEM_FX[id] || {}).stack) || (G.ITEMS[id].pocket === 'tms' && /^hm/.test(id)) ? '' : '×' + bag()[id]);
      b.innerHTML = `<span class="grow">${esc(itemLabel(id))}</span><span class="meta">${esc(right)}</span>`;
      b.onclick = () => choose(id);
      b.onmouseenter = b.onfocus = () => describe(id);
      list.appendChild(b);
    }
    const first = list.querySelector(`[data-item="${st.sel}"]`) || list.querySelector('[data-item]');
    describe(first ? first.dataset.item : null);
    if (keepFocus) G.Nav.focusFirst(first || el.querySelector(`[data-pk="${st.pocket}"]`));
    lastPocket = st.pocket;
  }

  function describe(id) {
    const tm = id && FI().tm(id);
    let d = id ? G.Names.desc('item', id) : '';
    if (tm) d = G.Names.desc('move', tm) || d;
    el.querySelector('.bag-desc').textContent = d;
  }

  // Keep the description on the item the keyboard or controller is on.
  let watch = 0;
  function watchFocus() {
    cancelAnimationFrame(watch);
    const loop = () => {
      if (!st || !G.UI.isOpen('scr-bag')) return;
      const f = G.Nav.focused;
      if (f && f.dataset && f.dataset.item && f.dataset.item !== st.sel) { st.sel = f.dataset.item; describe(st.sel); }
      watch = requestAnimationFrame(loop);
    };
    watch = requestAnimationFrame(loop);
  }

  // ---------------- choosing an item ----------------

  async function choose(id) {
    st.sel = id;
    if (st.mode === 'pick') { finish(id); return; }
    const k = FI().kind(id);
    const fx = G.ITEM_FX[id] || {};
    const opts = [];
    if (k === 'tm') opts.push({ label: T('Teach'), value: 'use' });
    else if (k === 'mon' || k === 'field' || (k === 'key' && fx.field)) opts.push({ label: T('Use'), value: 'use' });
    if (FI().canHold(id)) opts.push({ label: T('Give'), value: 'give' });
    if (k !== 'key' && !/^hm/.test(id)) opts.push({ label: T('Toss'), value: 'toss' });
    opts.push({ label: T('Cancel'), value: null, back: true });
    const v = await G.Popup.choose(itemLabel(id), opts);
    if (v === 'use') await use(id);
    else if (v === 'give') await give(id);
    else if (v === 'toss') await toss(id);
    if (st) render(true);
  }

  /** Give: a Pokémon holds the item (chapter 26); one already holding something swaps. */
  async function give(id) {
    const i = await G.PartyUI.pick({ title: fmt('Give {item} to which Pokémon?', { item: G.Names.item(id) }),
                                     note: m => (m.item ? G.Names.item(m.item) : null) });
    const mon = i == null ? null : G.Field.party()[i];
    if (!mon) return;
    if (mon.item && !(await G.Popup.confirm(fmt('{mon} is already holding {item}. Swap the items?', { mon: G.Mon.name(mon), item: G.Names.item(mon.item) })))) return;
    const old = FI().give(mon, id);
    if (old) await G.Popup.say(fmt('{player} took {old} from {mon} and gave it {item}.', { player: G.Field.save.player.name, old: G.Names.item(old), mon: G.Mon.name(mon), item: G.Names.item(id) }));
    else await G.Popup.say(fmt('{mon} is now holding {item}.', { mon: G.Mon.name(mon), item: G.Names.item(id) }));
  }

  async function toss(id) {
    const n = bag()[id] > 1 ? await G.Popup.count({ title: fmt('Toss how many {item}?', { item: G.Names.item(id) }), max: bag()[id] }) : 1;
    if (!n) return;
    if (!(await G.Popup.confirm(fmt('Throw away {n} × {item}?', { n, item: G.Names.item(id) })))) return;
    G.Field.takeItem(id, n);
    await G.Popup.say(fmt('Threw away {n} × {item}.', { n, item: G.Names.item(id) }));
  }

  /** The text a scene shows while the menus are away (evolution, learning a move). */
  const sayLine = text => G.Popup.say(text);

  async function use(id) {
    const k = FI().kind(id), fx = G.ITEM_FX[id] || {};
    const S = G.Field.save;
    // A rod: fish in the water in front of you (G.World.fish).
    if (fx.rod) {
      if (!G.World || !G.World.canFish || !G.World.canFish()) { await G.Popup.say(T("There's no water here to fish in.")); return; }
      finish(null);
      G.UI.closeAll();
      G.World.fish(id);
      return;
    }
    // The Town Map shows Kanto; the Bicycle gets you on or off it (G.World.toggleBike).
    if (id === 'town-map' && G.TownMapUI) { await G.TownMapUI.open(); return; }
    // The Unown Report: the letters caught so far (flags form:201:<letter>).
    if (id === 'unown-report') {
      const got = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l => G.Field.flag('form:201:' + l));
      await G.Popup.say(fmt('Unown caught: {n} of 26.', { n: got.length }) + (got.length ? ' ' + got.join(' ') : ''));
      return;
    }
    if (id === 'bicycle' && G.World && G.World.toggleBike) {
      const W = G.World;
      if (!W.biking && (W.surfing || !W.canRide())) { await G.Popup.say(T("You can't ride your Bicycle here.")); return; }
      if (W.biking && W.mustRide()) { await G.Popup.say(T("You can't get off your Bicycle here!")); return; }
      finish(null);
      G.UI.closeAll();
      W.toggleBike();
      return;
    }
    if (k === 'key') { await G.Popup.say(T("This can't be used now.")); return; }
    if (fx.repel) {
      if (FI().repel(S, id) === 'active') { await G.Popup.say(T('A Repel is still working.')); return; }
      G.Field.takeItem(id, 1);
      G.Audio.sfx('pop');
      await G.Popup.say(fmt('{player} used {item}.', { player: S.player.name, item: G.Names.item(id) }));
      return;
    }
    if (fx.escape) { await escapeRope(id); return; }
    if (k === 'tm') { await teach(id); return; }
    if (!S.party.length) { await G.Popup.say(T('You have no Pokémon.')); return; }
    // An item for a Pokémon: which one (and which move for Ether / PP Up)?
    for (;;) {
      const i = await G.PartyUI.pick({ title: fmt('Use {item} on which Pokémon?', { item: G.Names.item(id) }),
        note: fx.evo ? (m => (FI().canUse(id, m) ? T('Able') : T('Unable'))) : null });
      if (i == null) return;
      const mon = S.party[i];
      let move = 0;
      if (FI().needsMove(id)) {
        move = await G.Popup.choose(fx.ppUp ? T('Raise the PP of which move?') : T('Restore PP of which move?'),
          mon.moves.map((m, j) => ({ label: `${G.Names.move(m.id)}  ${m.pp}/${G.Mon.ppMax(m.id, m.ppUp)}`, value: j }))
            .concat([{ label: T('Cancel'), value: null, back: true }]));
        if (move == null) continue;
      }
      if (!FI().canUse(id, mon, { move })) { await G.Popup.say(T("It won't have any effect.")); continue; }
      const r = FI().use(id, mon, { move });
      if (!r.ok) continue;
      G.Field.takeItem(id, 1);
      // A stone is only used up when the Pokémon really evolves (B cancels the scene).
      if (fx.evo) { if (!(await evolveNow(mon, r.evolve))) G.Field.giveItem(id, 1); return; }
      G.Audio.sfx(fx.level ? 'levelup' : 'heal');
      for (const line of r.lines) await G.Popup.say(line);
      for (const mv of r.learn) await G.LearnUI.teach(mon, mv, sayLine);
      if (r.evolve) await evolveNow(mon, r.evolve);
      return;
    }
  }

  async function teach(id) {
    const S = G.Field.save, move = FI().tm(id);
    if (!S.party.length) { await G.Popup.say(T('You have no Pokémon.')); return; }
    const notes = { able: T('Able'), unable: T('Unable'), learned: T('Learned') };
    if (!(await G.Popup.confirm(fmt('It contains {move}. Teach {move} to a Pokémon?', { move: G.Names.move(move) })))) return;
    const i = await G.PartyUI.pick({ title: fmt('Teach {move} to which Pokémon?', { move: G.Names.move(move) }),
      note: m => notes[FI().tmFor(m, id)] });
    if (i == null) return;
    const mon = S.party[i], can = FI().tmFor(mon, id);
    if (can === 'learned') { await G.Popup.say(fmt('{mon} already knows {move}.', { mon: G.Mon.name(mon), move: G.Names.move(move) })); return; }
    if (can === 'unable') { await G.Popup.say(fmt("{mon} can't learn {move}.", { mon: G.Mon.name(mon), move: G.Names.move(move) })); return; }
    // TMs and HMs can be used again and again (as in the newer games).
    await G.LearnUI.teach(mon, move, sayLine);
  }

  /** Escape Rope: out of a cave or forest, back to the last Pokémon Center. */
  async function escapeRope(id) {
    const map = G.World && G.World.map, p = G.Field.save.player;
    const inside = map && (map.def.escape || ['cave', 'forest'].includes(map.music));
    if (!inside || !p.lastHeal || !G.Maps.has(p.lastHeal.map)) { await G.Popup.say(T("This can't be used now.")); return; }
    G.Field.takeItem(id, 1);
    finish(null);
    G.UI.closeAll();
    G.World.warp(p.lastHeal.map, p.lastHeal.spot, { sfx: 'warp' });
  }

  /** An evolution from the bag: the menus step aside for the scene, then come back. -> evolved? */
  async function evolveNow(mon, to) {
    if (!to || !G.EvolveUI) return false;
    const back = G.Game.mode;
    const open = [...document.querySelectorAll('#frame > .scr:not(.hidden)')].filter(s => s.id !== 'scr-dialog');
    open.forEach(s => s.classList.add('hidden'));
    try { return await G.EvolveUI.run(mon, to); }
    finally {
      G.Game.setMode(back);
      open.forEach(s => s.classList.remove('hidden'));
      G.Nav.focusFirst();
    }
  }

  // ---------------- open / close ----------------

  function show(s) {
    if (!el) build();
    st = Object.assign({ pocket: lastPocket, sel: null }, s);
    if (st.filter && !itemsIn(st.pocket).length) st.pocket = POCKETS.find(p => itemsIn(p).length) || st.pocket;
    render();
    G.UI.open(el, { onBack: () => finish(null), focus: el.querySelector('[data-item]') });
    watchFocus();
  }
  function finish(v) {
    if (!st) return;
    G.UI.close(el);
    const d = st.done;
    st = null;
    if (d) d(v);
  }

  function open() { show({ mode: 'menu' }); }
  function pick(o = {}) { return new Promise(res => show({ mode: 'pick', title: o.title, filter: o.filter, price: o.price, done: res })); }

  return { open, pick, itemLabel };
})();
