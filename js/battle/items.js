/* ============ items.js — items used in battle (G.ITEM_FX) ============
 *   G.BattleItems.canUse(battle, side, { item, target, move }) -> true if it would do something
 *   G.BattleItems.use(battle, side, { item, target, move })       uses one (from the bag, or a trainer's items)
 *
 * target = index in that side's party (healing, curing, reviving, PP); X items,
 * Dire Hit and Guard Spec. act on the Pokémon in battle. move = move slot for Ether.
 * Doubles (chapter 40): `user` is the battler whose turn uses it (its own Pokémon by default).
 * Chapter 107: a `flute` is never used up; `vol` ends that volatile status (confusion, attract) on a Pokémon in battle.
 */
G.BattleItems = (() => {
  const all = ['psn', 'tox', 'brn', 'par', 'slp', 'frz'];

  function fxOf(item) { return G.ITEM_FX[item] || {}; }

  /** The party index an item goes to, and the battler of that Pokémon if it is in battle. */
  function aim(b, side, a, user) {
    const idx = a.target != null ? a.target : b.double && user ? side.party.indexOf(user.mon) : side.active;
    const mon = side.party[idx];
    return { idx, mon, bm: b.double ? (mon && b.bmOf(mon)) : (side.party[side.active] === mon ? side.bm : null) };
  }

  function canUse(b, side, a, user) {
    const fx = fxOf(a.item);
    const { mon, bm: active } = aim(b, side, a, user);
    if (!mon) return false;
    if (embargoed(b, side, mon)) return false;                  // Embargo (chapter 104)
    if (fx.revive) return mon.hp <= 0;
    if (mon.hp <= 0) return false;
    if (fx.stage || fx.crit || fx.mist) return true;
    let does = false;
    // Chapter 107: the Yellow and Red Flutes end confusion or infatuation, on a Pokémon out on the field.
    if (fx.vol) does = !!(active && active.vol[fx.vol]);
    if (fx.heal) does = does || mon.hp < G.Mon.maxHp(mon);
    if (fx.cure) {
      const list = fx.cure === 'all' ? all : fx.cure;
      does = does || list.includes(mon.status) || (fx.cure === 'all' && !!(active && active.vol.confusion));
    }
    if (fx.pp) {
      const slots = fx.ppAll ? mon.moves : [mon.moves[a.move]].filter(Boolean);
      does = does || slots.some(m => m.pp < G.Mon.ppMax(m.id, m.ppUp));
    }
    return does;
  }

  function use(b, side, a, user) {
    const fx = fxOf(a.item);
    const store = side.side === 0 ? side.bag : side.items;
    // Emerald's glass flutes (chapter 107, party_menu.c IsItemFlute) are never used up.
    if (!fx.flute && store[a.item] > 0) { store[a.item]--; if (!store[a.item]) delete store[a.item]; }
    const { mon, bm } = aim(b, side, a, user);
    const self = b.double && user ? user : side.bm;
    b.emit('item', { side: side.side, item: a.item, uid: mon.uid, trainer: side.side === 1 && side.trainer ? side.trainer.id : null });
    if (fx.revive) {
      mon.hp = Math.max(1, Math.floor(G.Mon.maxHp(mon) * fx.revive));
      mon.status = null;
      b.emit('revived', { side: side.side, uid: mon.uid, hp: mon.hp, max: G.Mon.maxHp(mon) });
      return;
    }
    if (fx.heal) {
      const max = G.Mon.maxHp(mon);
      const amt = fx.heal === 'full' ? max : fx.heal;
      const got = Math.min(amt, max - mon.hp);
      if (got > 0) {
        mon.hp += got;
        b.emit('heal', { side: side.side, uid: mon.uid, amt: got, hp: mon.hp, max, why: 'item', active: !!bm });
      }
    }
    if (fx.cure) {
      const list = fx.cure === 'all' ? all : fx.cure;
      if (list.includes(mon.status)) { mon.status = null; mon.slp = 0; mon.tox = 0; b.emit('cure', { side: side.side, uid: mon.uid }); }
      if (fx.cure === 'all' && bm && bm.vol.confusion) { bm.vol.confusion = 0; b.emit('confusionEnd', { side: side.side, uid: mon.uid }); }
    }
    if (fx.vol && bm && bm.vol[fx.vol]) {
      bm.vol[fx.vol] = fx.vol === 'confusion' ? 0 : false;
      b.emit(fx.vol === 'confusion' ? 'confusionEnd' : 'attractEnd', { side: side.side, uid: mon.uid });
    }
    if (fx.pp) {
      const slots = fx.ppAll ? mon.moves : [mon.moves[a.move || 0]];
      for (const m of slots) m.pp = fx.pp === 'full' ? G.Mon.ppMax(m.id, m.ppUp) : Math.min(G.Mon.ppMax(m.id, m.ppUp), m.pp + fx.pp);
      b.emit('ppRestored', { side: side.side, uid: mon.uid });
    }
    if (fx.stage && self) b.stage(self, fx.stage[0], fx.stage[1], { source: self });
    if (fx.crit && self) { self.vol.focusEnergy = true; b.emit('pumped', { side: side.side, uid: self.mon.uid }); }
    if (fx.mist) { side.field.mist = 5; b.emit('field', { side: side.side, effect: 'mist' }); }
  }

  /** Embargo (chapter 104) on that Pokémon, out on the field: no item from the Bag can be used on it. */
  function embargoed(b, side, mon) { return !!(mon && mon.embargo); }

  return { canUse, use, embargoed };
})();
