/* ============ held.js — held items in battle (chapter 26) ============
 * A Pokémon may hold one item (mon.item). What it does is G.ITEM_FX[item].held:
 *   'boost' (+ type)  its moves of that type have 1.2× power (Charcoal, Mystic Water…, Metal Coat, Silk Scarf)
 *   'orb' (+ sp, types)  the same for those types, only for that Pokémon (the Adamant Orb on Dialga, the Lustrous Orb on Palkia)
 *   'berry'           eaten when its HP falls to half or less (fx.heal) or it gets a status the berry cures
 *                     (fx.cure); then it is gone. A pinch berry (fx.pinch: a stat, chapter 77: the Liechi Berry)
 *                     is eaten at a quarter of its HP or less, if that stat can still rise: +1 stage
 *   'leftovers'       1/16 of its max HP back at the end of each turn
 *   'shell-bell'      1/8 of the damage its moves deal, back as HP
 *   'quick-claw'      one time in five, it moves first among moves of the same priority
 *   'kings-rock'      one time in ten, its damaging move (one with no flinch chance of its own) makes the
 *                     target flinch, if the target has not moved yet
 *   'focus-band'      one time in ten, it holds on with 1 HP against a hit that would knock it out
 *   'scope-lens'      one more critical-hit stage; 'lucky-punch' (Chansey) and 'stick' (Farfetch'd) two
 *   'bright-powder'   moves against it are a tenth less accurate
 *   'light-ball'      Pikachu's Attack and Sp. Atk ×2 · 'thick-club' Cubone's and Marowak's Attack ×2
 *                     · 'metal-powder' Ditto's Defense ×2 · 'deep-sea-tooth' / 'deep-sea-scale' Clamperl's
 *                     Sp. Atk / Sp. Def ×2 (chapter 28)
 *   'lucky-egg'       its Exp. ×1.5 · 'exp-share' it shares the Exp. without fighting (battle.js)
 *   'amulet-coin'     double prize money once it has been in the battle (battle.js)
 *   'smoke-ball'      it always gets away from wild Pokémon (battle.js)
 *   'cleanse-tag'     on the lead, a third fewer wild Pokémon (field.js, chapter 69)
 *   'light-clay'      its Reflect and Light Screen last 8 turns instead of 5 (moves-special.js, chapter 74)
 *   'white-herb'      after an action that left a stat of it lowered, every lowered stat goes back to 0; then it
 *                     is gone (chapter 80: Spenser's Arcanine, after Overheat)
 *   'everstone'       it does not evolve (evolution.js); at the Day Care it may pass on its nature (daycare.js)
 * Chapter 93, Generation 4's:
 *   'choice' (+ stat) Choice Band / Specs / Scarf: Attack / Sp. Atk / Speed x1.5; the first move it uses is the only one it
 *                     can choose until it switches out (bm.vol.choice: `locked(bm)`)
 *   'focus-sash'      at full HP, it holds on with 1 HP against a foe's hit that would knock it out; then it is gone
 *   'life-orb'        its moves x1.3 damage; after a move that hit, a tenth of its max HP lost (not with Magic Guard)
 *   'muscle-band' / 'wise-glasses'  physical / special moves x1.1 power · 'expert-belt'  super-effective hits x1.2
 *   'metronome'       the same move used again and again: +10% power for each time in a row, x2 at most
 *   'wide-lens'       its moves x1.1 accurate · 'zoom-lens'  x1.2 when its target has already moved this turn
 *   'big-root'        HP from draining moves, Leech Seed and Ingrain x1.3
 *   'black-sludge'    end of turn: a poison type gets 1/16 of its HP back, any other loses 1/8
 *   'iron-ball'       Speed halved; Ground moves hit it even if it flies or levitates
 *   'lagging-tail'    it moves after the others of the same priority (as with Stall)
 *   'power' (+ ev)    the Power items: Speed halved; 4 more EVs in their stat when it gains EVs (exp.js)
 *   'status-orb' (+ status)  Toxic Orb / Flame Orb: end of turn, it is badly poisoned / burned (if it can be)
 *   'power-herb'      a two-turn move without its first turn; then it is gone
 *   'grip-claw'       its binding moves last five turns
 *   'resist' (+ type) a super-effective hit of that type does half its damage; then the berry is gone (the Chilan Berry:
 *                     any Normal hit)
 *   berries: the Persim Berry cures confusion; pinch berries for Defense, Sp. Atk, Sp. Def, the Lansat Berry (as Focus
 *   Energy) and the Starf Berry (a random stat +2)
 * Chapter 94: 'shed-shell' (it can always switch out: battle.js), 'mental-herb' (infatuation cured at once, used up),
 *   'destiny-knot' (infatuated, it infatuates the one who did it); the plates (boost, `plate`: Arceus's Multitype takes the
 *   type, `multitype(mon)`). The moves that move items (moves-special.js) use `sticky(b, bm)` (Sticky Hold, Multitype),
 *   `takeAway(b, bm)` (an item lost to another Pokémon), `throwAway(b, bm)` (its own item used up by Fling, Natural Gift),
 *   `eatBerry(b, bm, item)` (a berry's effect at once: Pluck, Bug Bite, a flung berry), `flingEffect(b, user, target, f)`.
 *   An item used up by its own holder is noted on the battle (`b.markUsed`): at the end the player's Pokémon get back what
 *   they held at the start, unless they used it up themselves (battle.js `finish`).
 * Chapter 104: Embargo (moves-special.js, `mon.embargo` while it lasts): no held item does anything (`fxOf`); an item used up
 *   by its holder is remembered for Recycle by its place on the field (`b.recycle`, Platinum's recycleItem[battler]);
 *   'macho-brace' Speed halved, its EVs doubled (exp.js); 'soothe-bell' friendship gains x1.5 (`friendship(mon, n)`).
 * The numbers are those of Generation 4. The battle asks:
 *   kind(mon) · is(mon, k) · power(mon, type, M, bm) · statMult(mon, key) · critBonus(mon) · accMult(mon) · userAcc(user, target)
 *   · finalMult(user, eff) · resist(b, target, type, eff) · drainMult(bm) · locked(bm) · beforeMove(bm, id) · afterMove(b, bm)
 *   · powerHerb(b, bm) · quick(b, bm) · afterHit(b, user, target, M, total) · survives(b, bm) · berry(b, bm) · herb(b, bm)
 *   · endOfTurn(b, bm) · orbs(b, bm) · expMult(mon)
 * Random rolls are made only for a Pokémon that holds the item, so battles without held items
 * play exactly as before.
 */
G.Held = (() => {
  // Embargo (chapter 104, Platinum's Battler_HeldItem): while it lasts, the item does nothing.
  const fxOf = mon => (mon && mon.item && !mon.embargo && G.ITEM_FX[mon.item]) || null;
  // Klutz (chapter 44): its item does nothing in battle (an Exp. Share or a Lucky Egg still works).
  const kind = mon => {
    const fx = fxOf(mon), k = (fx && fx.held) || null;
    return k && k !== 'exp-share' && k !== 'lucky-egg' && G.Abilities && G.Abilities.klutz(mon) ? null : k;
  };
  const is = (mon, k) => kind(mon) === k;
  /** An item used up by its holder: gone (noted on the battle, chapter 94), and Unburden (chapter 44) at work. */
  function useUp(b, bm) {
    if (b && b.markUsed) b.markUsed(bm.mon);
    // Recycle (chapter 104): the last item used up from this place on the field (Platinum's BtlCmd_RemoveItem).
    if (b && b.recycle && bm.mon.item) b.recycle[bm.side + ':' + (bm.slot || 0)] = bm.mon.item;
    bm.mon.item = null;
    if (bm.ability === 'unburden') bm.vol.unburden = true;
  }
  /** An item taken by another Pokémon (Thief, Covet, Knock Off, Pluck, Trick): gone from it, Unburden at work. */
  function takeAway(b, bm) {
    bm.mon.item = null;
    if (bm.ability === 'unburden') bm.vol.unburden = true;
  }
  /** Sticky Hold (not against Mold Breaker) and Multitype keep their item (chapter 94). */
  const sticky = (b, bm) => bm.ability === 'multitype' || G.Abilities.ab(b, bm) === 'sticky-hold';
  /** Arceus's Multitype: the type of the plate it holds, else null. */
  function multitype(mon) {
    const fx = fxOf(mon);
    return fx && fx.plate && G.Abilities.of(mon) === 'multitype' ? [fx.type] : null;
  }

  /** Power: type boosters; Muscle Band, Wise Glasses and Metronome (chapter 93: with the move M and the battler bm). */
  function power(mon, type, M, bm) {
    const fx = fxOf(mon);
    if (fx && fx.held === 'orb') return mon.sp === fx.sp && fx.types.includes(type) ? 1.2 : 1;
    if (fx && fx.held === 'boost') return fx.type === type ? 1.2 : 1;
    const k = M ? kind(mon) : null;
    if (k === 'muscle-band') return M.cat === 'physical' ? 1.1 : 1;
    if (k === 'wise-glasses') return M.cat === 'special' ? 1.1 : 1;
    if (k === 'metronome' && bm && bm.vol.metronome) return 1 + Math.min(10, bm.vol.metronome.n) / 10;
    return 1;
  }

  function statMult(mon, key) {
    const k = kind(mon), sp = mon.sp;
    if (k === 'choice') return G.ITEM_FX[mon.item].stat === key ? 1.5 : 1;                 // Choice Band, Specs, Scarf
    if ((k === 'iron-ball' || k === 'power' || k === 'macho-brace') && key === 'spe') return 0.5;   // Iron Ball, the Power items, the Macho Brace
    if (k === 'light-ball' && sp === 25 && (key === 'atk' || key === 'spa')) return 2;
    if (k === 'thick-club' && (sp === 104 || sp === 105) && key === 'atk') return 2;
    if (k === 'metal-powder' && sp === 132 && key === 'def') return 2;
    if (k === 'deep-sea-tooth' && sp === 366 && key === 'spa') return 2;
    if (k === 'deep-sea-scale' && sp === 366 && key === 'spd') return 2;
    return 1;
  }

  function critBonus(mon) {
    const k = kind(mon);
    if (k === 'scope-lens' || k === 'razor-claw') return 1;
    if ((k === 'lucky-punch' && mon.sp === 113) || (k === 'stick' && mon.sp === 83)) return 2;
    return 0;
  }

  const accMult = mon => (is(mon, 'bright-powder') ? 0.9 : 1);
  /** The user's own: Wide Lens, Zoom Lens (its target has moved already). */
  const userAcc = (user, target) => (is(user.mon, 'wide-lens') ? 1.1 : is(user.mon, 'zoom-lens') && target && target.moved ? 1.2 : 1);
  /** The damage of a hit: Life Orb; Expert Belt on a super-effective one. */
  const finalMult = (user, eff) => (is(user.mon, 'life-orb') ? 1.3 : is(user.mon, 'expert-belt') && eff > 1 ? 1.2 : 1);
  /** A type-resist berry, eaten before a super-effective hit of its type (not behind a substitute): -> 0.5, else 1. */
  function resist(b, target, type, eff) {
    if (!is(target.mon, 'resist') || target.vol.substitute > 0) return 1;
    const fx = G.ITEM_FX[target.mon.item];
    if (type !== fx.type || !(fx.any || eff > 1)) return 1;
    const item = target.mon.item;
    useUp(b, target);
    b.emit('resist', { side: target.side, uid: target.mon.uid, item });
    return 0.5;
  }
  const drainMult = bm => (is(bm.mon, 'big-root') ? 1.3 : 1);
  /** The move a Choice item holds it to, or null. */
  const locked = bm => (bm.vol.choice && is(bm.mon, 'choice') ? bm.vol.choice : null);
  /** As a move starts: the Choice lock, the Metronome's count. */
  function beforeMove(bm, id) {
    if (id === 'struggle') return;
    if (is(bm.mon, 'choice') && !bm.vol.choice) bm.vol.choice = id;
    if (is(bm.mon, 'metronome')) { const m = bm.vol.metronome; bm.vol.metronome = m && m.id === id ? { id, n: m.n + 1 } : { id, n: 0 }; }
  }
  /** After a move: the Life Orb's price, once a move (spread moves too). */
  function afterMove(b, bm) {
    if (!bm.vol.lifeOrb) return;
    bm.vol.lifeOrb = false;
    if (b.alive(bm) && is(bm.mon, 'life-orb')) b.hurt(bm, Math.max(1, Math.floor(b.maxHp(bm) / 10)), { why: 'life-orb' });
  }
  /** Power Herb: a two-turn move at once. -> true if it was used. */
  function powerHerb(b, bm) {
    if (!is(bm.mon, 'power-herb')) return false;
    const item = bm.mon.item;
    useUp(b, bm);
    b.emit('powerHerb', { side: bm.side, uid: bm.mon.uid, item });
    return true;
  }
  const quick = (b, bm) => is(bm.mon, 'quick-claw') && b.rng.pct(20);
  /** Against a hit that would knock it out: the Focus Sash at full HP (used up), else the Focus Band one time in ten.
   *  -> the item's kind, or false. */
  function survives(b, bm) {
    if (is(bm.mon, 'focus-sash') && bm.mon.hp >= b.maxHp(bm)) { useUp(b, bm); return 'focus-sash'; }
    return is(bm.mon, 'focus-band') && b.rng.pct(10) ? 'focus-band' : false;
  }
  const expMult = mon => (is(mon, 'lucky-egg') ? 1.5 : 1);

  /** After a damaging move: King's Rock, Shell Bell; the Life Orb's price is noted for afterMove. */
  function afterHit(b, user, target, M, total) {
    if (total <= 0) return;
    if (is(user.mon, 'life-orb')) user.vol.lifeOrb = true;
    if ((is(user.mon, 'kings-rock') || is(user.mon, 'razor-fang')) && !M.meta.flinch && b.alive(target) && !target.moved && b.rng.pct(10)) target.vol.flinch = true;
    if (is(user.mon, 'shell-bell') && b.alive(user))
      b.heal(user, Math.max(1, Math.floor(total / 8)), 'held', { item: user.mon.item, held: 'shell-bell' });
  }

  /** A berry, eaten when it is needed (after every action). */
  function berry(b, bm) {
    if (!b.alive(bm) || !is(bm.mon, 'berry')) return;
    const item = bm.mon.item, fx = G.ITEM_FX[item], max = b.maxHp(bm), st = bm.mon.status;
    if (fx.heal && bm.mon.hp * 2 <= max) {
      useUp(b, bm);                                                        // Unburden (chapter 44)
      b.heal(bm, fx.heal === 'full' ? max : fx.heal, 'held', { item, held: 'berry' });
    } else if (fx.cure && st && (fx.cure === 'all' || fx.cure.includes(st))) {
      useUp(b, bm);
      bm.mon.status = null; bm.mon.slp = 0; bm.mon.tox = 0;
      b.emit('cure', { side: bm.side, uid: bm.mon.uid, item });
    } else if (Array.isArray(fx.cure) && fx.cure.includes('confusion') && bm.vol.confusion) {     // the Persim Berry (chapter 93)
      useUp(b, bm);
      bm.vol.confusion = 0;
      b.emit('cure', { side: bm.side, uid: bm.mon.uid, item, confusion: true });
    } else if (fx.pinch && bm.mon.hp * 4 <= max && pinchCan(bm, fx.pinch)) {
      useUp(b, bm);
      b.emit('eat', { side: bm.side, uid: bm.mon.uid, item });
      pinch(b, bm, fx.pinch);
    }
  }
  function pinch(b, bm, p) {
    if (p === 'crit') { bm.vol.focusEnergy = true; b.emit('pumped', { side: bm.side, uid: bm.mon.uid }); }      // Lansat
    else if (p === 'random') b.stage(bm, b.rng.pick(PINCH.filter(k => bm.stages[k] < 6)), 2, { source: bm });  // Starf
    else b.stage(bm, p, 1, { source: bm });
  }
  /** A berry's effect at once, whatever the HP (chapter 94: Pluck, Bug Bite, a flung berry). -> true if it did something. */
  function eatBerry(b, bm, item) {
    const fx = G.ITEM_FX[item] || {}, max = b.maxHp(bm), st = bm.mon.status;
    if (!b.alive(bm)) return false;
    if (fx.heal) { if (bm.mon.hp >= max) return false; b.heal(bm, fx.heal === 'full' ? max : fx.heal, 'held', { item, held: 'berry' }); return true; }
    if (fx.cure && st && (fx.cure === 'all' || fx.cure.includes(st))) {
      bm.mon.status = null; bm.mon.slp = 0; bm.mon.tox = 0;
      b.emit('cure', { side: bm.side, uid: bm.mon.uid, item });
      return true;
    }
    if (Array.isArray(fx.cure) && fx.cure.includes('confusion') && bm.vol.confusion) {
      bm.vol.confusion = 0;
      b.emit('cure', { side: bm.side, uid: bm.mon.uid, item, confusion: true });
      return true;
    }
    if (fx.pinch && pinchCan(bm, fx.pinch)) { pinch(b, bm, fx.pinch); return true; }
    return false;
  }
  /** Its own item used up by a move (Fling, Natural Gift). */
  const throwAway = (b, bm) => useUp(b, bm);
  /** A flung item's effect on the target (PokeAPI's fling effects). f: { item, fx } */
  function flingEffect(b, user, target, f) {
    if (!b.alive(target) || !f.fx) return;
    const st = { burn: 'brn', poison: 'psn', 'badly-poison': 'tox', paralyze: 'par' }[f.fx];
    if (st) b.inflict(target, st, { source: user });
    else if (f.fx === 'flinch') { if (!target.moved) target.vol.flinch = true; }
    else if (f.fx === 'berry-effect') eatBerry(b, target, f.item);
    else if (f.fx === 'herb-effect') {
      if (f.item === 'mental-herb' && target.vol.attract) { target.vol.attract = false; b.emit('mentalHerb', { side: target.side, uid: target.mon.uid, item: f.item }); }
      const low = Object.keys(target.stages).filter(k => target.stages[k] < 0);
      if (f.item === 'white-herb' && low.length) { for (const k of low) target.stages[k] = 0; b.emit('herb', { side: target.side, uid: target.mon.uid, item: f.item }); }
    }
  }
  /** Destiny Knot: infatuated, the holder infatuates the one who did it, if it can. */
  function destinyKnot(b, holder, source) {
    if (!is(holder.mon, 'destiny-knot') || !source || !b.alive(source) || source.vol.attract || G.Abilities.blocksAttract(source)) return;
    source.vol.attract = true;
    b.emit('attract', { side: source.side, uid: source.mon.uid, why: 'destiny-knot', from: holder.mon.uid, fromSide: holder.side, item: holder.mon.item });
  }
  const PINCH = ['atk', 'def', 'spa', 'spd', 'spe'];
  /** Whether a pinch berry would do anything: its stat can still rise (Lansat: not pumped yet; Starf: any of five). */
  const pinchCan = (bm, p) => (p === 'crit' ? !bm.vol.focusEnergy : p === 'random' ? PINCH.some(k => bm.stages[k] < 6) : bm.stages[p] < 6);

  /** The White Herb (chapter 80): a lowered stat goes back to normal, once. The Mental Herb (chapter 94): infatuation cured. */
  function herb(b, bm) {
    if (b.alive(bm) && is(bm.mon, 'mental-herb') && bm.vol.attract) {
      const item = bm.mon.item;
      useUp(b, bm);
      bm.vol.attract = false;
      b.emit('mentalHerb', { side: bm.side, uid: bm.mon.uid, item });
      return;
    }
    if (!b.alive(bm) || !is(bm.mon, 'white-herb')) return;
    const low = Object.keys(bm.stages).filter(k => bm.stages[k] < 0);
    if (!low.length) return;
    for (const k of low) bm.stages[k] = 0;
    useUp(b, bm);
    b.emit('herb', { side: bm.side, uid: bm.mon.uid, item: 'white-herb' });
  }

  /** The end of the turn: Leftovers; Black Sludge (chapter 93). */
  function endOfTurn(b, bm) {
    if (b.alive(bm) && is(bm.mon, 'leftovers') && bm.mon.hp < b.maxHp(bm))
      b.heal(bm, Math.max(1, Math.floor(b.maxHp(bm) / 16)), 'held', { item: bm.mon.item, held: 'leftovers' });
    if (b.alive(bm) && is(bm.mon, 'black-sludge')) {
      if (bm.types.includes('poison')) { if (bm.mon.hp < b.maxHp(bm)) b.heal(bm, Math.max(1, Math.floor(b.maxHp(bm) / 16)), 'held', { item: bm.mon.item, held: 'black-sludge' }); }
      else b.hurt(bm, Math.max(1, Math.floor(b.maxHp(bm) / 8)), { why: 'sludge', src: bm.mon.item });
    }
  }
  /** The very end of its turn (after poison and burns): the Toxic Orb and the Flame Orb. */
  function orbs(b, bm) {
    if (!b.alive(bm) || !is(bm.mon, 'status-orb') || bm.mon.status) return;
    b.inflict(bm, G.ITEM_FX[bm.mon.item].status, { silent: true, item: bm.mon.item });
  }

  /** Friendship gained (chapter 104, Platinum's Pokemon_UpdateFriendship): x1.5 (rounded down) with a Soothe Bell. */
  const friendship = (mon, n) => (n > 0 && mon && mon.item === 'soothe-bell' ? Math.floor(n * 150 / 100) : n);

  return { friendship, kind, is, power, statMult, critBonus, accMult, userAcc, finalMult, resist, drainMult, locked, beforeMove, afterMove, powerHerb,
           quick, survives, expMult, afterHit, berry, herb, endOfTurn, orbs,
           takeAway, sticky, multitype, eatBerry, throwAway, flingEffect, destinyKnot };
})();
