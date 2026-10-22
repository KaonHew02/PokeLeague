/* ============ shop-ui.js — Poké Mart ============
 *   await G.ShopUI.open(stock)    stock: item ids; resolves when the player leaves (scripts: ['shop', [...]])
 * Buy: the stock with its prices (G.ITEM_FX price), how many, the total, the money.
 * Sell: an item from the bag for half its price (key items and HMs are not sold).
 * TMs and HMs can be used forever, so the shop sells each only once.
 */
G.ShopUI = (() => {
  const esc = s => G.U.esc(s);
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const MAX_BAG = 999;
  let el = null;

  const price = id => (G.ITEM_FX[id] || {}).price || 0;
  const sellPrice = id => Math.floor(price(id) / 2);
  const isMachine = id => (G.ITEMS[id] || {}).pocket === 'tms';
  const sellable = id => sellPrice(id) > 0 && !(G.ITEM_FX[id] || {}).key && !/^hm/.test(id);
  const money = () => G.Field.save.player.money;

  function build() {
    el = document.createElement('section');
    el.id = 'scr-shop';
    el.className = 'scr dim hidden';
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="box shop-box"><div class="opt-head"><h3></h3><b class="shop-money"></b><button class="btn small ghost" data-back></button></div>'
      + '<div class="menu-list shop-list"></div><p class="bag-desc shop-desc"></p></div>';
    document.getElementById('frame').appendChild(el);
  }

  function describe(id) { el.querySelector('.shop-desc').textContent = id ? (G.FieldItems.tm(id) ? G.Names.desc('move', G.FieldItems.tm(id)) : G.Names.desc('item', id)) : ''; }

  /** The Buy list. Resolves when the player goes back. */
  function buyList(stock) {
    return new Promise(res => {
      const items = stock.filter(id => G.ITEMS[id] && price(id) > 0);
      const render = focus => {
        el.querySelector('h3').textContent = T('Buy');
        el.querySelector('.shop-money').textContent = G.Menus.money(money());
        const list = el.querySelector('.shop-list');
        list.innerHTML = '';
        for (const id of items) {
          const owned = isMachine(id) && G.Field.count(id) > 0;
          const b = document.createElement('button');
          b.className = 'menu-item';
          b.dataset.item = id;
          b.innerHTML = `<span class="grow">${esc(G.BagUI.itemLabel(id))}</span><span class="meta">${esc(owned ? T('In the bag') : G.Menus.money(price(id)))}</span>`;
          if (owned) b.disabled = true;
          b.onclick = () => buy(id).then(() => render(id));
          b.onmouseenter = () => describe(id);
          list.appendChild(b);
        }
        describe(focus || items[0]);
        G.Nav.focusFirst(list.querySelector(`[data-item="${focus}"]:not(:disabled)`) || list.querySelector('[data-item]:not(:disabled)') || undefined);
      };
      const back = () => { G.UI.close(el); res(); };
      el.querySelector('[data-back]').textContent = T('Back');
      el.querySelector('[data-back]').onclick = back;
      G.UI.open(el, { onBack: back });
      render();
      const loop = () => {
        if (!G.UI.isOpen('scr-shop')) return;
        const f = G.Nav.focused;
        if (f && f.dataset && f.dataset.item) describe(f.dataset.item);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  }

  async function buy(id) {
    const p = price(id), name = G.Names.item(id);
    if (money() < p) { await G.Popup.say(T("You don't have enough money.")); return; }
    const room = MAX_BAG - G.Field.count(id);
    if (room <= 0) { await G.Popup.say(T('Your bag has no room for more of that.')); return; }
    const n = isMachine(id) ? 1 : await G.Popup.count({ title: fmt('{item}? How many would you like?', { item: name }), max: Math.min(99, room), price: p, money: money() });
    if (!n) return;
    const total = n * p;
    if (!(await G.Popup.confirm(fmt('{item} × {n}. That will be {money}. OK?', { item: name, n, money: G.Menus.money(total) })))) return;
    if (money() < total) { await G.Popup.say(T("You don't have enough money.")); return; }
    G.Field.money(-total);
    G.Field.giveItem(id, n);
    G.Audio.sfx('buy');
    await G.Popup.say(T('Here you are! Thank you!'));
  }

  async function sell() {
    for (;;) {
      const id = await G.BagUI.pick({ title: T('Sell which item?'), filter: sellable, price: true });
      if (!id) return;
      const name = G.Names.item(id), have = G.Field.count(id);
      const n = have > 1 ? await G.Popup.count({ title: fmt('{item}? How many would you like to sell?', { item: name }), max: have }) : 1;
      if (!n) continue;
      const total = n * sellPrice(id);
      if (!(await G.Popup.confirm(fmt('I can pay {money} for that. Would you like to sell it?', { money: G.Menus.money(total) })))) continue;
      G.Field.takeItem(id, n);
      G.Field.money(total);
      G.Audio.sfx('buy');
      await G.Popup.say(fmt('You handed over {item} × {n} and got {money}.', { item: name, n, money: G.Menus.money(total) }));
    }
  }

  async function open(stock = []) {
    if (!el) build();
    let first = true;
    for (;;) {
      const v = await G.Popup.choose(first ? T('Welcome! How may I help you?') : T('Is there anything else I can do for you?'), [
        { label: T('Buy'), value: 'buy' }, { label: T('Sell'), value: 'sell' }, { label: T('See you!'), value: null, back: true }]);
      first = false;
      if (v === 'buy') await buyList(stock);
      else if (v === 'sell') await sell();
      else break;
    }
    await G.Popup.say(T('Please come again!'));
  }

  return { open };
})();
