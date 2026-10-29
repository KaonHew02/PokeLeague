/* ============ field-items.js — using items from the Bag outside battle ============
 *   G.FieldItems.kind(item)          'mon' (used on a Pokémon) | 'tm' | 'field' (Repel, Escape Rope…) | 'key' | null
 *   G.FieldItems.needsMove(item)     Ether, Max Ether, PP Up and PP Max ask for a move
 *   G.FieldItems.canUse(item, mon, { move })   -> true if it would do something
 *   G.FieldItems.use(item, mon, { move })      -> { ok, lines: [texts], level, learn: [moves], evolve: sp }
 *       Changes the Pokémon. It does not take the item from the bag: the caller does, when ok.
 *       level: the new level after a Rare Candy; learn: moves to offer at that level;
 *       evolve: the species it evolves into (Rare Candy, stones). The bag screen
 *       shows the lines and runs the learn-move and evolution scenes.
 *   G.FieldItems.tm(item)            -> the move a TM / HM teaches, or null
 *   G.FieldItems.tmFor(mon, item)    -> 'able' | 'unable' | 'learned'
 *   G.FieldItems.repel(save, item)   -> 'ok' | 'active'   (sets save.repel)
 *   G.FieldItems.canHold(item)       a Pokémon may hold it (chapter 26, once Mr. Pokémon has told you
 *                                    about it, flag held-items): any item but key items, TMs and HMs
 *   G.FieldItems.give(mon, item)     from the bag to the Pokémon -> the item it held before (back in the bag), or null
 *   G.FieldItems.take(mon)           its item back into the bag -> that item, or null
 */
G.FieldItems = (() => {
  const fmt = (k, v) => G.I18n.fmt(k, v);
  const fxOf = item => G.ITEM_FX[item] || {};
  const STATUSES = ['psn', 'tox', 'brn', 'par', 'slp', 'frz'];
  const EV_ITEM_CAP = 100;                 // vitamins raise a stat's EVs up to 100

  function tm(item) {
    const it = G.ITEMS[item];
    return (it && it.pocket === 'tms' && (it.move || (G.TMS && G.TMS[item]))) || null;
  }

  function kind(item) {
    const fx = fxOf(item), it = G.ITEMS[item] || {};
    if (it.pocket === 'tms') return 'tm';
    if (fx.key || it.pocket === 'key') return 'key';
    if (!fx.field) return null;
    if (fx.repel || fx.escape) return 'field';
    return 'mon';
  }

  const needsMove = item => { const fx = fxOf(item); return !!((fx.pp && !fx.ppAll) || fx.ppUp); };

  function tmFor(mon, item) {
    const move = tm(item);
    if (!move) return 'unable';
    if (G.Mon.knows(mon, move)) return 'learned';
    return (G.SPECIES[mon.sp].tm || []).includes(item) ? 'able' : 'unable';
  }

  const cures = fx => (fx.cure === 'all' ? STATUSES : fx.cure || []);
  const evTotal = mon => mon.evs.reduce((a, b) => a + b, 0);
  const statIndex = id => G.Stats.ORDER.indexOf(id);

  function canUse(item, mon, o = {}) {
    const fx = fxOf(item);
    if (!mon) return false;
    if (fx.revive) return mon.hp <= 0;
    if (fx.evo) return G.Evolution.candidates(mon, { trigger: 'item', item }).length > 0;
    if (mon.hp <= 0 && !fx.ev && !fx.ppUp && !fx.pp) return false;
    const max = G.Mon.maxHp(mon);
    if (fx.heal && mon.hp > 0 && mon.hp < max) return true;
    if (fx.cure && mon.hp > 0 && cures(fx).includes(mon.status)) return true;
    if (fx.pp) {
      const slots = fx.ppAll ? mon.moves : [mon.moves[o.move | 0]].filter(Boolean);
      return slots.some(m => m.pp < G.Mon.ppMax(m.id, m.ppUp));
    }
    if (fx.ppUp) { const m = mon.moves[o.move | 0]; return !!m && (m.ppUp | 0) < 3 && G.MOVES[m.id].pp > 1; }
    if (fx.ev) { const i = statIndex(fx.ev[0]); return mon.evs[i] < EV_ITEM_CAP && evTotal(mon) < G.Exp.MAX_TOTAL; }
    if (fx.level) return mon.lvl < 100;
    return false;
  }

  function cureLine(status, mon) {
    switch (status) {
      case 'psn': case 'tox': return fmt('{mon} was cured of its poisoning.', { mon });
      case 'brn': return fmt("{mon}'s burn was healed.", { mon });
      case 'par': return fmt('{mon} was cured of paralysis.', { mon });
      case 'slp': return fmt('{mon} woke up!', { mon });
      default: return fmt('{mon} thawed out!', { mon });
    }
  }

  function use(item, mon, o = {}) {
    const fx = fxOf(item);
    const out = { ok: false, lines: [], level: 0, learn: [], evolve: null };
    if (!canUse(item, mon, o)) { out.lines.push(G.T("It won't have any effect.")); return out; }
    out.ok = true;
    const name = G.Mon.name(mon), max = G.Mon.maxHp(mon);
    if (fx.revive) {
      mon.hp = Math.max(1, Math.floor(max * fx.revive));
      mon.status = null; mon.slp = 0; mon.tox = 0;
      out.lines.push(fmt('{mon} was revived!', { mon: name }));
      return out;
    }
    if (fx.evo) {
      out.evolve = G.Evolution.candidates(mon, { trigger: 'item', item })[0];
      return out;
    }
    if (fx.heal && mon.hp > 0) {
      const got = Math.min(fx.heal === 'full' ? max : fx.heal, max - mon.hp);
      if (got > 0) { mon.hp += got; out.lines.push(fmt("{mon}'s HP was restored by {n} points.", { mon: name, n: got })); }
    }
    if (fx.cure && cures(fx).includes(mon.status)) {
      out.lines.push(cureLine(mon.status, name));
      mon.status = null; mon.slp = 0; mon.tox = 0;
    }
    if (fx.pp) {
      const slots = fx.ppAll ? mon.moves : [mon.moves[o.move | 0]];
      for (const m of slots) m.pp = fx.pp === 'full' ? G.Mon.ppMax(m.id, m.ppUp) : Math.min(G.Mon.ppMax(m.id, m.ppUp), m.pp + fx.pp);
      out.lines.push(fmt("{mon}'s PP was restored.", { mon: name }));
    }
    if (fx.ppUp) {
      const m = mon.moves[o.move | 0];
      const before = G.Mon.ppMax(m.id, m.ppUp);
      m.ppUp = Math.min(3, (m.ppUp | 0) + fx.ppUp);
      m.pp += G.Mon.ppMax(m.id, m.ppUp) - before;
      out.lines.push(fmt("{move}'s PP increased.", { move: G.Names.move(m.id) }));
    }
    if (fx.ev) {
      const i = statIndex(fx.ev[0]);
      const room = Math.min(EV_ITEM_CAP - mon.evs[i], G.Exp.MAX_TOTAL - evTotal(mon));
      mon.evs[i] += Math.max(0, Math.min(fx.ev[1], room));
      G.Mon.recalc(mon, max);
      out.lines.push(fmt("{mon}'s {stat} rose.", { mon: name, stat: G.Names.stat(fx.ev[0]) }));
    }
    if (fx.level) {
      mon.lvl++;
      mon.exp = Math.max(mon.exp | 0, G.Stats.expAt(G.SPECIES[mon.sp].gr, mon.lvl));
      G.Mon.recalc(mon, max);
      mon.friendship = Math.min(255, (mon.friendship | 0) + 3);
      out.level = mon.lvl;
      out.lines.push(fmt('{mon} grew to Lv. {n}!', { mon: name, n: mon.lvl }));
      out.learn = G.Mon.movesAt(mon.sp, mon.lvl).filter(id => !G.Mon.knows(mon, id));
      out.evolve = G.Evolution.candidates(mon, { trigger: 'level' })[0] || null;
    }
    return out;
  }

  function repel(save, item) {
    if (save.repel > 0) return 'active';
    save.repel = fxOf(item).repel || 100;
    return 'ok';
  }

  // ---------------- held items (chapter 26) ----------------

  function canHold(item) {
    const it = G.ITEMS[item];
    return !!it && it.pocket !== 'key' && it.pocket !== 'tms' && !fxOf(item).key && G.Field.flag('held-items');
  }
  function give(mon, item) {
    if (!mon || !canHold(item) || !(G.Field.count(item) > 0)) return null;
    const old = mon.item || null;
    G.Field.takeItem(item, 1);
    if (old) G.Field.giveItem(old, 1);
    mon.item = item;
    return old;
  }
  function take(mon) {
    const it = mon && mon.item;
    if (!it) return null;
    G.Field.giveItem(it, 1);
    mon.item = null;
    return it;
  }

  return { kind, needsMove, canUse, use, tm, tmFor, repel, canHold, give, take };
})();
