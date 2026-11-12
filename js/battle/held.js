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
 *   'everstone'       it does not evolve (evolution.js); at the Day Care it may pass on its nature (daycare.js)
 * The numbers are those of Generation 4. The battle asks:
 *   kind(mon) · is(mon, k) · power(mon, type) · statMult(mon, key) · critBonus(mon) · accMult(mon)
 *   · quick(b, bm) · afterHit(b, user, target, M, total) · survives(b, bm) · berry(b, bm) · endOfTurn(b, bm)
 *   · expMult(mon)
 * Random rolls are made only for a Pokémon that holds the item, so battles without held items
 * play exactly as before.
 */
G.Held = (() => {
  const fxOf = mon => (mon && mon.item && G.ITEM_FX[mon.item]) || null;
  // Klutz (chapter 44): its item does nothing in battle (an Exp. Share or a Lucky Egg still works).
  const kind = mon => {
    const fx = fxOf(mon), k = (fx && fx.held) || null;
    return k && k !== 'exp-share' && k !== 'lucky-egg' && G.Abilities && G.Abilities.klutz(mon) ? null : k;
  };
  const is = (mon, k) => kind(mon) === k;

  function power(mon, type) {
    const fx = fxOf(mon);
    if (fx && fx.held === 'orb') return mon.sp === fx.sp && fx.types.includes(type) ? 1.2 : 1;
    return fx && fx.held === 'boost' && fx.type === type ? 1.2 : 1;
  }

  function statMult(mon, key) {
    const k = kind(mon), sp = mon.sp;
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
  const quick = (b, bm) => is(bm.mon, 'quick-claw') && b.rng.pct(20);
  const survives = (b, bm) => is(bm.mon, 'focus-band') && b.rng.pct(10);
  const expMult = mon => (is(mon, 'lucky-egg') ? 1.5 : 1);

  /** After a damaging move: King's Rock, Shell Bell. */
  function afterHit(b, user, target, M, total) {
    if (total <= 0) return;
    if ((is(user.mon, 'kings-rock') || is(user.mon, 'razor-fang')) && !M.meta.flinch && b.alive(target) && !target.moved && b.rng.pct(10)) target.vol.flinch = true;
    if (is(user.mon, 'shell-bell') && b.alive(user))
      b.heal(user, Math.max(1, Math.floor(total / 8)), 'held', { item: user.mon.item, held: 'shell-bell' });
  }

  /** A berry, eaten when it is needed (after every action). */
  function berry(b, bm) {
    if (!b.alive(bm) || !is(bm.mon, 'berry')) return;
    const item = bm.mon.item, fx = G.ITEM_FX[item], max = b.maxHp(bm), st = bm.mon.status;
    if (fx.heal && bm.mon.hp * 2 <= max) {
      bm.mon.item = null;
      if (bm.ability === 'unburden') bm.vol.unburden = true;              // Unburden (chapter 44)
      b.heal(bm, fx.heal === 'full' ? max : fx.heal, 'held', { item, held: 'berry' });
    } else if (fx.cure && st && (fx.cure === 'all' || fx.cure.includes(st))) {
      bm.mon.item = null;
      if (bm.ability === 'unburden') bm.vol.unburden = true;
      bm.mon.status = null; bm.mon.slp = 0; bm.mon.tox = 0;
      b.emit('cure', { side: bm.side, uid: bm.mon.uid, item });
    } else if (fx.pinch && bm.mon.hp * 4 <= max && bm.stages[fx.pinch] < 6) {
      bm.mon.item = null;
      if (bm.ability === 'unburden') bm.vol.unburden = true;
      b.emit('eat', { side: bm.side, uid: bm.mon.uid, item });
      b.stage(bm, fx.pinch, 1, { source: bm });
    }
  }

  /** The end of the turn: Leftovers. */
  function endOfTurn(b, bm) {
    if (b.alive(bm) && is(bm.mon, 'leftovers') && bm.mon.hp < b.maxHp(bm))
      b.heal(bm, Math.max(1, Math.floor(b.maxHp(bm) / 16)), 'held', { item: bm.mon.item, held: 'leftovers' });
  }

  return { kind, is, power, statMult, critBonus, accMult, quick, survives, expMult, afterHit, berry, endOfTurn };
})();
