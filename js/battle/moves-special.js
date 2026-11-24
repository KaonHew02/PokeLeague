/* ============ moves-special.js — moves with their own rules ============
 * Hooks are described at the top of effects.js. FALLBACK lists the moves that
 * are knowingly simplified: status moves that just fail, and damaging moves
 * that only deal plain damage. tests/effects.test.cjs checks that every move
 * of the game is generic, special-cased here, or listed in FALLBACK.
 */
G.SpecialMoves = (() => {
  const me = bm => ({ side: bm.side, uid: bm.mon.uid });
  /** Chapter 110: Future Sight and Doom Desire (Platinum's BtlCmd_TryFutureSight), with Platinum's power and accuracy (the
   *  data has PokeAPI's later values: Future Sight 120 and 100, Doom Desire 140 and 100). */
  const FUTURE = { 'future-sight': [80, 90], 'doom-desire': [120, 85] };
  const futureMove = id => ({ acc: () => null, hitsInvuln: ['fly', 'dig', 'dive'], power: () => FUTURE[id][0], use: (b, u, t) => {
    const k = t.side + ':' + (t.slot || 0);
    if (b.futures[k]) return fail(b);
    const dmg = G.Damage.calc({ lvl: u.mon.lvl, pow: FUTURE[id][0], atk: b.stat(u, 'spa'), def: b.stat(t, 'spd'), eff: 1, roll: b.rng.int(85, 100),
                                screen: !!b.sideOf(t).field.lightScreen });
    b.futures[k] = { turns: 3, dmg: Math.floor(dmg * (u.vol.helped ? 1.5 : 1)), move: id, side: u.side, acc: FUTURE[id][1] };
    b.emit('foresee', Object.assign({ move: id }, me(u))); return {}; } });
  const fail = b => { b.emit('fail', {}); return false; };
  const hpPct = bm => bm.mon.hp / G.Mon.maxHp(bm.mon);
  const W = b => G.Abilities.weather(b);              // none while Cloud Nine or Air Lock is out
  /** How many times a rolling move (Rollout) already hit in a row. */
  const rolls = (u, id) => (u.vol.rampage && u.vol.rampage.move === id ? u.vol.rampage.n : 0);

  const S = {
    // ---------- two-turn moves ----------
    'solar-beam':  { charge: true, noChargeIf: b => W(b) === 'sun',
                     power: (b, u, t, M) => (['rain', 'sand', 'hail', 'fog'].includes(W(b)) ? M.pow / 2 : M.pow) },
    'dig':         { charge: (b, u) => { u.vol.invuln = 'dig'; } },
    'fly':         { charge: (b, u) => { u.vol.invuln = 'fly'; } },
    'bounce':      { charge: (b, u) => { u.vol.invuln = 'fly'; } },
    'dive':        { charge: (b, u) => { u.vol.invuln = 'dive'; } },
    'skull-bash':  { charge: (b, u) => { b.stage(u, 'def', 1, { source: u }); } },
    'sky-attack':  { charge: true },
    'razor-wind':  { charge: true },

    // ---------- recharge and rampage ----------
    'hyper-beam':  { recharge: true },
    'giga-impact': { recharge: true },
    'rock-wrecker': { recharge: true },
    'roar-of-time': { recharge: true },
    'blast-burn':  { recharge: true },              // the ultimate moves (chapter 96: Route 228's tutor)
    'hydro-cannon': { recharge: true },
    'frenzy-plant': { recharge: true },
    'thrash':      { rampage: true },
    'petal-dance': { rampage: true },
    'outrage':     { rampage: true },

    // ---------- fixed damage ----------
    'sonic-boom':   { fixed: () => 20 },
    'dragon-rage':  { fixed: () => 40 },
    'seismic-toss': { fixed: (b, u) => u.mon.lvl },
    'night-shade':  { fixed: (b, u) => u.mon.lvl },
    'super-fang':   { fixed: (b, u, t) => Math.max(1, Math.floor(t.mon.hp / 2)) },
    'psywave':      { fixed: (b, u) => Math.max(1, Math.floor(u.mon.lvl * b.rng.int(50, 150) / 100)) },
    'endeavor':     { fixed: (b, u, t) => (t.mon.hp > u.mon.hp ? t.mon.hp - u.mon.hp : null) },
    'counter':      { fixed: (b, u) => (u.lastHit && u.lastHit.cat === 'physical' && u.lastHit.from !== u.side ? 2 * u.lastHit.amt : null) },
    'mirror-coat':  { fixed: (b, u) => (u.lastHit && u.lastHit.cat === 'special' && u.lastHit.from !== u.side ? 2 * u.lastHit.amt : null) },

    // ---------- the user faints ----------
    'self-destruct': { faints: true, after: selfKO, onMiss: selfKO, onBlocked: selfKO },
    'explosion':     { faints: true, after: selfKO, onMiss: selfKO, onBlocked: selfKO },

    // ---------- variable power ----------
    'flail':        { power: (b, u) => reversalPower(u) },
    'reversal':     { power: (b, u) => reversalPower(u) },
    'magnitude':    { hitsInvuln: ['dig'], doubleVsInvuln: true, oncePower: true, power: (b) => {
                        const r = b.rng.int(1, 100), i = r <= 5 ? 0 : r <= 15 ? 1 : r <= 35 ? 2 : r <= 65 ? 3 : r <= 85 ? 4 : r <= 95 ? 5 : 6;
                        b.emit('magnitude', { n: i + 4 });
                        return [10, 30, 50, 70, 90, 110, 150][i]; } },
    'earthquake':   { hitsInvuln: ['dig'], doubleVsInvuln: true },
    'gust':         { hitsInvuln: ['fly'], doubleVsInvuln: true },
    'twister':      { hitsInvuln: ['fly'], doubleVsInvuln: true },
    'surf':         { hitsInvuln: ['dive'], doubleVsInvuln: true },
    'whirlpool':    { hitsInvuln: ['dive'], doubleVsInvuln: true },
    'thunder':      { hitsInvuln: ['fly'], acc: (b, u, t, M) => (W(b) === 'rain' ? null : W(b) === 'sun' ? 50 : M.acc) },
    // Blizzard never misses in hail (Generation 4).
    'blizzard':     { acc: (b, u, t, M) => (W(b) === 'hail' ? null : M.acc) },
    'sky-uppercut': { hitsInvuln: ['fly'] },
    'brick-break':  { beforeHit: (b, u, t) => {
                        const f = b.sideOf(t).field;
                        if (f.reflect || f.lightScreen) { delete f.reflect; delete f.lightScreen; b.emit('screensBroken', { side: t.side }); } } },
    'tri-attack':   { after: (b, u, t, M, res) => {
                        if (res.total > 0 && b.alive(t) && !t.vol.substitute && !G.Abilities.shieldDust(t) && b.rng.pct(G.Abilities.chance(u, 20)))
                          b.inflict(t, ['brn', 'par', 'frz'][b.rng.int(0, 2)], { source: u, silent: true }); } },
    'low-kick':     { power: (b, u, t) => { const kg = G.SPECIES[t.mon.sp].w / 10;
                        return kg < 10 ? 20 : kg < 25 ? 40 : kg < 50 ? 60 : kg < 100 ? 80 : kg < 200 ? 100 : 120; } },
    'return':       { power: (b, u) => Math.max(1, Math.floor((u.mon.friendship || 0) * 10 / 25)) },
    // Generation 4 moves of the Johto learnsets (HeartGold / SoulSilver).
    'gyro-ball':    { power: (b, u, t) => Math.min(150, Math.floor(25 * b.stat(t, 'spe') / Math.max(1, b.stat(u, 'spe'))) + 1) },
    'punishment':   { power: (b, u, t) => Math.min(200, 60 + 20 * Object.values(t.stages).reduce((n, v) => n + Math.max(0, v), 0)) },
    'wring-out':    { power: (b, u, t) => Math.max(1, Math.floor(120 * hpPct(t))) },
    'frustration':  { power: (b, u) => Math.max(1, Math.floor((255 - (u.mon.friendship || 0)) * 10 / 25)) },
    // Generation 4 moves of Sinnoh's Pokémon (chapter 44).
    'crush-grip':   { power: (b, u, t) => Math.max(1, Math.floor(120 * hpPct(t))) + 1 },
    'grass-knot':   { power: (b, u, t) => { const kg = G.SPECIES[t.mon.sp].w / 10;
                        return kg < 10 ? 20 : kg < 25 ? 40 : kg < 50 ? 60 : kg < 100 ? 80 : kg < 200 ? 100 : 120; } },
    'metal-burst':  { fixed: (b, u) => (u.lastHit && u.lastHit.from !== u.side && u.lastHit.amt > 0 ? Math.floor(u.lastHit.amt * 3 / 2) : null) },
    'acupressure':  { use: (b, u) => {
                        const up = G.Battle.STAGES.filter(k => u.stages[k] < 6);
                        if (!up.length) return fail(b);
                        b.stage(u, up[b.rng.int(0, up.length - 1)], 2, { source: u }); return {}; } },
    'heart-swap':   { use: (b, u, t) => {
                        const mine = Object.assign({}, u.stages);
                        Object.assign(u.stages, t.stages); Object.assign(t.stages, mine);
                        b.emit('heartSwap', Object.assign({ target: t.mon.uid, tside: t.side }, me(u))); return {}; } },
    'defog':        { use: (b, u, t) => {
                        b.stage(t, 'eva', -1, { source: u });
                        const s = b.sideOf(t), f = s.field;
                        for (const k of ['reflect', 'lightScreen', 'safeguard', 'mist']) if (f[k]) { delete f[k]; b.emit('fieldEnd', { side: t.side, effect: k }); }
                        if (s.rocks) { s.rocks = false; b.emit('rocksGone', { side: t.side }); }
                        // Chapter 110: Spikes and Toxic Spikes too.
                        if (s.spikes) { s.spikes = 0; b.emit('hazardGone', Object.assign({ move: 'spikes' }, me(u))); }
                        if (s.toxicSpikes) { s.toxicSpikes = 0; b.emit('hazardGone', Object.assign({ move: 'toxic-spikes' }, me(u))); }
                        if (b.weather && b.weather.w === 'fog') { b.weather = null; b.emit('weatherEnd', { w: 'fog' }); }   // (chapter 92)
                        return {}; } },
    // ---------- chapter 110: common moves, Platinum's (pret/pokeplatinum effect scripts and battle_script.c) ----------
    // Spikes (BtlCmd_TrySpikes): three layers at most on the foes' side; Toxic Spikes (BtlCmd_TryToxicSpikes): two. The damage
    // and the poison on the one coming in: battle.js hazards().
    'spikes':       { use: (b, u) => {
                        const s = b.sides[1 - u.side];
                        if ((s.spikes || 0) >= 3) return fail(b);
                        s.spikes = (s.spikes || 0) + 1; b.emit('spikes', { side: s.side }); return {}; } },
    'toxic-spikes': { use: (b, u) => {
                        const s = b.sides[1 - u.side];
                        if ((s.toxicSpikes || 0) >= 2) return fail(b);
                        s.toxicSpikes = (s.toxicSpikes || 0) + 1; b.emit('toxicSpikes', { side: s.side }); return {}; } },
    // Taunt (subscript_taunt_start): three to five turns without status moves (battle.js doMove, options; ends in endOfTurn).
    'taunt':        { use: (b, u, t) => {
                        if (t.vol.taunt) return fail(b);
                        t.vol.taunt = b.rng.int(3, 5); b.emit('taunt', me(t)); return {}; } },
    // Pursuit (BtlCmd_TryPursuit): double power on a foe switching out (battle.js pursuit() sets vol.pursuing).
    'pursuit':      { power: (b, u, t, M) => (u.vol.pursuing ? M.pow * 2 : M.pow) },
    // Baton Pass (subscript_baton_pass): fails with no one to come in; else the switch after the move (battle.js batonPass).
    'baton-pass':   { use: (b, u) => {
                        if (!b.bench(b.sideOf(u), u.slot || 0).length) return fail(b);
                        b.emit('batonPass', me(u));
                        b.insert(() => b.batonPass(u)); return {}; } },
    // Wish (BtlCmd_TryWish): the end of the next turn, for whoever stands in its place (battle.js endOfTurn).
    'wish':         { use: (b, u) => {
                        const k = u.side + ':' + (u.slot || 0);
                        if (b.wishes[k]) return fail(b);
                        b.wishes[k] = { turns: 2, from: { sp: u.mon.sp, nick: u.mon.nick || null } }; return {}; } },
    // Future Sight and Doom Desire (BtlCmd_TryFutureSight): the damage reckoned now, with no type matchup and no critical hit
    // (Light Screen and Helping Hand count), on the one in that place at the end of the turn after next; never misses now.
    'future-sight': futureMove('future-sight'),
    'doom-desire':  futureMove('doom-desire'),
    // Tailwind (subscript_tailwind_start): Speed x2 on its side for three turns, this one included (battle.js stat, endOfTurn).
    'tailwind':     { use: (b, u) => {
                        const f = b.sideOf(u).field;
                        if (f.tailwind) return fail(b);
                        f.tailwind = 3; b.emit('field', { side: u.side, effect: 'tailwind' }); return {}; } },
    'stealth-rock': { use: (b, u, t) => {
                        const s = b.sideOf(t);
                        if (s.rocks) return fail(b);
                        s.rocks = true; b.emit('rocks', { side: t.side }); return {}; } },
    'trick-room':   { use: (b, u) => {
                        if (b.trickRoom) { b.trickRoom = 0; b.emit('trickRoomEnd', {}); return {}; }
                        b.trickRoom = 5; b.emit('trickRoom', me(u)); return {}; } },
    // ---------- moves that move items (chapter 94, Generation 4) ----------
    // Fling: its own item thrown (used up even if it misses), Fling's power and effect from PokeAPI; no item that can be
    // thrown: it fails (Klutz does not stop it in Generation 4).
    'fling':        { check: (b, u) => {
                        const it = u.mon.item, d = it && G.ITEMS[it];
                        if (!d || !d.fling || u.mon.embargo) return false;          // Embargo (chapter 104)
                        u.vol.flung = { item: it, pow: d.fling, fx: d.flingFx || null };
                        G.Held.throwAway(b, u);
                        b.emit('flung', Object.assign({ item: it }, me(u)));
                        return true; },
                      power: (b, u) => (u.vol.flung ? u.vol.flung.pow : 0),
                      onMiss: (b, u) => { u.vol.flung = null; },
                      after: (b, u, t, M, res) => {
                        const f = u.vol.flung; u.vol.flung = null;
                        if (f && res.total > 0 && !res.sub) G.Held.flingEffect(b, u, t, f); } },
    // Natural Gift: its own berry's type and power (Generation 4's), the berry used up; Klutz stops it.
    'natural-gift': { check: (b, u) => {
                        const it = u.mon.item, g = it && G.NATURAL_GIFT && G.NATURAL_GIFT[it];
                        if (!g || G.Abilities.klutz(u.mon) || u.mon.embargo) return false;      // Embargo (chapter 104)
                        u.vol.gift = g;
                        G.Held.throwAway(b, u);
                        return true; },
                      moveType: (b, u) => (u.vol.gift ? u.vol.gift[0] : 'normal'),
                      power: (b, u) => (u.vol.gift ? u.vol.gift[1] : 0) },
    // ---------- chapter 104, Platinum's (subscript_embargo_start.s, effect_script_0184.s) ----------
    // Embargo: five turns without held items or the Bag's items for the target; it fails behind a substitute, against
    // Multitype or the Griseous Orb, and on one already under it. It ends on switching out (battle.js).
    'embargo':      { use: (b, u, t) => {
                        if (!t || !b.alive(t) || t.vol.substitute > 0 || t.ability === 'multitype' || t.vol.embargo || t.mon.item === 'griseous-orb') return fail(b);
                        t.vol.embargo = 5; t.mon.embargo = true;
                        b.emit('embargo', me(t)); return {}; } },
    // Recycle: the last item used up from its place on the field (b.recycle), back, if it holds nothing.
    'recycle':      { use: (b, u) => {
                        const key = u.side + ':' + (u.slot || 0), item = b.recycle && b.recycle[key];
                        if (u.mon.item || !item) return fail(b);
                        delete b.recycle[key];
                        u.mon.item = item;
                        b.emit('recycle', Object.assign({ item }, me(u))); return {}; } },
    // Judgment (chapter 100): the type of the plate its user holds (Generation 4's), else Normal.
    'judgment':     { moveType: (b, u) => { const fx = u.mon.item && G.ITEM_FX[u.mon.item]; return fx && fx.plate ? fx.type : 'normal'; } },
    // Trick and Switcheroo: the two swap items (nothing to swap, Sticky Hold, Multitype or a substitute: it fails). A Choice
    // item got this way holds its new owner from its next move (my own simplification).
    'trick':        { use: (b, u, t) => swapItems(b, u, t) },
    'switcheroo':   { use: (b, u, t) => swapItems(b, u, t) },
    // Thief and Covet: a hit takes the target's item if the user holds none (not Sticky Hold, Multitype, a substitute).
    'thief':        { after: (b, u, t, M, res) => steal(b, u, t, res) },
    'covet':        { after: (b, u, t, M, res) => steal(b, u, t, res) },
    // Knock Off: the target's item is gone for the rest of the battle.
    'knock-off':    { after: (b, u, t, M, res) => {
                        if (!res || !res.total || res.sub || !t.mon.item || !b.alive(u)) return;
                        if (G.Held.sticky(b, t)) return G.Abilities.say(b, t, 'protect');
                        const item = t.mon.item;
                        G.Held.takeAway(b, t);
                        b.emit('knockOff', Object.assign({ item, target: t.mon.uid, tside: t.side }, me(u))); } },
    // Pluck and Bug Bite: the user eats the target's berry and gets its effect (with Klutz, nothing: Generation 4).
    'pluck':        { after: (b, u, t, M, res) => pluck(b, u, t, res) },
    'bug-bite':     { after: (b, u, t, M, res) => pluck(b, u, t, res) },
    'gravity':      { use: b => {
                        if (b.gravity) return fail(b);
                        b.gravity = 5; b.emit('gravity', {}); return {}; } },
    'hidden-power': { power: (b, u) => hiddenPower(u.mon).pow, moveType: (b, u) => hiddenPower(u.mon).type },
    'facade':       { power: (b, u, t, M) => (['psn', 'tox', 'par', 'brn'].includes(u.mon.status) ? M.pow * 2 : M.pow) },
    // Eruption and Water Spout: weaker as the user's HP falls (150 at full HP).
    'eruption':     { power: (b, u, t, M) => Math.max(1, Math.floor(M.pow * u.mon.hp / b.maxHp(u))) },
    'water-spout':  { power: (b, u, t, M) => Math.max(1, Math.floor(M.pow * u.mon.hp / b.maxHp(u))) },
    // Smelling Salts: double against a paralysed target, and it cures it.
    'smelling-salts': { power: (b, u, t, M) => (t.mon.status === 'par' ? M.pow * 2 : M.pow),
                        after: (b, u, t) => { if (b.alive(t) && t.mon.status === 'par') { t.mon.status = null; b.emit('cure', { side: t.side, uid: t.mon.uid }); } } },
    'revenge':      { power: (b, u, t, M) => (u.lastHit && u.lastHit.from !== u.side ? M.pow * 2 : M.pow) },
    // Avalanche (TM72): like Revenge, twice as hard after being hit this turn.
    'avalanche':    { power: (b, u, t, M) => (u.lastHit && u.lastHit.from !== u.side ? M.pow * 2 : M.pow) },
    // Brine (TM55): double against a target at half its HP or less.
    'brine':        { power: (b, u, t, M) => (t.mon.hp * 2 <= b.maxHp(t) ? M.pow * 2 : M.pow) },
    // Rollout rolls on for five turns (a miss stops it), doubling each time; twice as hard after Defense Curl.
    'rollout':      { roll: true, power: (b, u, t, M) => M.pow * 2 ** rolls(u, 'rollout') * (u.vol.curl ? 2 : 1) },
    'ice-ball':     { roll: true, power: (b, u, t, M) => M.pow * 2 ** rolls(u, 'ice-ball') * (u.vol.curl ? 2 : 1) },
    'defense-curl': { after: (b, u) => { u.vol.curl = true; } },
    // Fury Cutter doubles with each hit in a row, up to 160 (40, 80, 160: Generation 6 on).
    'fury-cutter':  { power: (b, u, t, M) => { u.vol.cutter = u.lastMoveHit === 'fury-cutter' ? Math.min(3, (u.vol.cutter || 0) + 1) : 0; return Math.min(160, M.pow * 2 ** u.vol.cutter); },
                      after: (b, u) => { u.lastMoveHit = 'fury-cutter'; }, onMiss: (b, u) => { u.lastMoveHit = null; } },
    'spit-up':      { check: (b, u) => (u.vol.stockpile || 0) > 0,
                      power: (b, u) => 100 * u.vol.stockpile, after: (b, u) => { u.vol.stockpile = 0; } },
    'fake-out':     { check: (b, u) => u.turns === 0 },
    'false-swipe':  { leaveOne: true },
    'dream-eater':  { check: (b, u, t) => t.mon.status === 'slp' },
    'snore':        { whileAsleep: true, check: (b, u) => u.mon.status === 'slp' },
    'high-jump-kick': { onMiss: crash, onBlocked: crash },
    'jump-kick':    { onMiss: crash, onBlocked: crash },
    'pay-day':      { after: (b, u) => { b.payDay += u.mon.lvl * 5; b.emit('coins', {}); } },
    'rage':         { after: (b, u) => { u.vol.rage = true; } },
    'rapid-spin':   { after: (b, u) => {
                        if (u.vol.trap || u.vol.seeded) { u.vol.trap = null; u.vol.seeded = false; b.emit('spunFree', me(u)); }
                        // Chapter 110, Platinum's BtlCmd_RapidSpin: the hazards on its own side are blown away.
                        const s = b.sideOf(u);
                        if (s.spikes) { s.spikes = 0; b.emit('hazardGone', Object.assign({ move: 'spikes' }, me(u))); }
                        if (s.toxicSpikes) { s.toxicSpikes = 0; b.emit('hazardGone', Object.assign({ move: 'toxic-spikes' }, me(u))); }
                        if (s.rocks) { s.rocks = false; b.emit('hazardGone', Object.assign({ move: 'stealth-rock' }, me(u))); } } },
    'struggle':     { typeless: true, after: (b, u) => { if (b.alive(u)) b.hurt(u, Math.max(1, Math.floor(G.Mon.maxHp(u.mon) / 4)), { why: 'recoil' }); } },
    'flame-wheel':  { thawsUser: true },
    'sacred-fire':  { thawsUser: true },

    // ---------- status moves with their own rules ----------
    'focus-energy': { use: (b, u) => { if (u.vol.focusEnergy) return fail(b); u.vol.focusEnergy = true; b.emit('pumped', me(u)); return {}; } },
    'rest':         { use: (b, u) => {
                        if (u.mon.hp >= G.Mon.maxHp(u.mon) || u.mon.status === 'slp' || G.Abilities.blocksStatus(u, 'slp', b)) return fail(b);   // Insomnia
                        u.mon.status = 'slp'; u.mon.slp = 2; u.vol.nightmare = false;
                        b.emit('rest', me(u)); b.heal(u, G.Mon.maxHp(u.mon), 'rest'); return {}; } },
    'substitute':   { use: (b, u) => {
                        const cost = Math.floor(G.Mon.maxHp(u.mon) / 4);
                        if (u.vol.substitute) return fail(b);
                        if (u.mon.hp <= cost) { b.emit('tooWeak', me(u)); return false; }
                        b.hurt(u, cost, { why: 'substitute' }); u.vol.substitute = cost;
                        b.emit('substitute', me(u)); return {}; } },
    'splash':       { use: b => { b.emit('nothing', {}); return {}; } },
    'teleport':     { use: (b, u) => {
                        if (b.kind !== 'wild') return fail(b);
                        b.emit('teleported', me(u)); b.finish(u.side === 0 ? 'run' : 'fled'); return {}; } },
    'protect':      { use: protect('protect') },
    'detect':       { use: protect('protect') },
    'endure':       { use: protect('endure') },
    'mirror-move':  { use: (b, u, t) => {
                        const m = t && t.lastMove;
                        if (!m || m === 'mirror-move' || m === 'struggle') return fail(b);
                        G.BattleFx.useMove(b, u, t, m, { called: true }); return {}; } },
    'metronome':    { use: (b, u, t) => {
                        const pool = Object.keys(G.MOVES).filter(id => !NO_CALL.has(id)).sort();
                        const m = pool[b.rng.int(0, pool.length - 1)];
                        b.emit('metronome', { move: m });
                        G.BattleFx.useMove(b, u, t, m, { called: true }); return {}; } },
    'sleep-talk':   { whileAsleep: true, use: (b, u, t) => {
                        if (u.mon.status !== 'slp') return fail(b);
                        const pool = u.mon.moves.map(m => m.id).filter(id => id !== 'sleep-talk' && !NO_CALL.has(id) && !(S[id] && S[id].charge));
                        if (!pool.length) return fail(b);
                        G.BattleFx.useMove(b, u, t, pool[b.rng.int(0, pool.length - 1)], { called: true }); return {}; } },
    'conversion':   { use: (b, u) => {
                        const t = u.mon.moves.map(m => G.MOVES[m.id].type).find(ty => !u.types.includes(ty) && ty !== 'unknown');
                        if (!t) return fail(b);
                        u.types = [t]; b.emit('typeChange', Object.assign({ to: t }, me(u))); return {}; } },
    // Encore: for three turns the target can only repeat the move it used last.
    'encore':       { use: (b, u, t) => {
                        const m = t.lastMove;
                        if (!m || t.vol.encore || ['encore', 'mimic', 'transform', 'mirror-move', 'struggle'].includes(m)
                            || !t.mon.moves.some(x => x.id === m && x.pp > 0)) return fail(b);
                        t.vol.encore = { move: m, turns: 3 };
                        b.emit('encore', Object.assign({ move: m }, me(t))); return {}; } },
    'disable':      { use: (b, u, t) => {
                        const m = t.lastMove;
                        if (!m || t.vol.disable || m === 'struggle' || !t.mon.moves.some(x => x.id === m && x.pp > 0)) return fail(b);
                        t.vol.disable = { move: m, turns: 4 };
                        b.emit('disabled', Object.assign({ move: m }, me(t))); return {}; } },
    'belly-drum':   { use: (b, u) => {
                        const half = Math.floor(G.Mon.maxHp(u.mon) / 2);
                        if (u.mon.hp <= half || u.stages.atk >= 6) return fail(b);
                        b.hurt(u, half, { why: 'bellyDrum' }); u.stages.atk = 6;
                        b.emit('bellyDrum', me(u)); return {}; } },
    'curse':        { use: (b, u) => {
                        if (u.types.includes('ghost')) return fail(b);      // the Ghost-type curse is not in the first slice
                        b.stage(u, 'spe', -1, { source: u }); b.stage(u, 'atk', 1, { source: u }); b.stage(u, 'def', 1, { source: u }); return {}; } },
    'psych-up':     { use: (b, u, t) => { Object.assign(u.stages, t.stages); b.emit('psychUp', me(u)); return {}; } },
    'spite':        { use: (b, u, t) => {
                        const slot = t.lastMove && t.mon.moves.find(m => m.id === t.lastMove);
                        if (!slot || slot.pp <= 0) return fail(b);
                        const n = Math.min(4, slot.pp); slot.pp -= n;
                        b.emit('spite', Object.assign({ move: slot.id, n }, me(t))); return {}; } },
    'destiny-bond': { use: (b, u) => { u.vol.destinyBond = true; b.emit('destinyBondSet', me(u)); return {}; } },
    // Grudge (chapter 109, Emerald's Cmd_trysetgrudge): until its next action (battle.js doAction), a foe's move that knocks it
    // out loses all its PP (battle.js hurt).
    'grudge':       { use: (b, u) => { u.vol.grudge = true; b.emit('grudgeSet', me(u)); return {}; } },
    'refresh':      { use: (b, u) => {
                        if (!['psn', 'tox', 'par', 'brn'].includes(u.mon.status)) return fail(b);
                        u.mon.status = null; b.emit('cure', me(u)); return {}; } },
    'aromatherapy': { use: (b, u) => {
                        const side = b.sideOf(u);
                        for (const m of side.party) if (m.status && m.hp > 0) { m.status = null; m.slp = 0; m.tox = 0; }
                        b.emit('aromatherapy', { side: u.side }); return {}; } },
    'heal-bell':    { use: (b, u) => {
                        const side = b.sideOf(u);
                        for (const m of side.party) if (m.status && m.hp > 0) { m.status = null; m.slp = 0; m.tox = 0; }
                        b.emit('healBell', { side: u.side }); return {}; } },
    'block':        { use: trapUse },
    'mean-look':    { use: trapUse },
    'spider-web':   { use: trapUse },
    // Pain Split: both share their HP evenly (each up to its own maximum).
    'pain-split':   { use: (b, u, t) => {
                        const avg = Math.floor((u.mon.hp + t.mon.hp) / 2);
                        b.emit('painSplit', me(u));
                        for (const bm of [u, t]) {
                          if (bm.mon.hp > avg) b.hurt(bm, bm.mon.hp - avg, { why: 'painSplit' });
                          else if (bm.mon.hp < avg) b.heal(bm, avg - bm.mon.hp, 'painSplit');
                        }
                        return {}; } },
    // Beat Up: one hit of 10 power for every party Pokémon that can still fight (Gen 2-4).
    'beat-up':      { power: () => 10, hits: (b, u) => Math.max(1, b.sideOf(u).party.filter(m => m.hp > 0 && !m.status).length) },
    'lock-on':      { use: (b, u, t) => { u.vol.lockOn = true; b.emit('lockOn', Object.assign({ target: t.mon.uid }, me(u))); return {}; } },
    'mind-reader':  { use: (b, u, t) => { u.vol.lockOn = true; b.emit('lockOn', Object.assign({ target: t.mon.uid }, me(u))); return {}; } },
    'memento':      { use: (b, u, t) => {
                        b.stage(t, 'atk', -2, { source: u, statusMove: true }); b.stage(t, 'spa', -2, { source: u, statusMove: true });
                        b.hurt(u, u.mon.hp, { why: 'memento' }); return {}; } },
    'stockpile':    { use: (b, u) => {
                        if ((u.vol.stockpile || 0) >= 3) return fail(b);
                        u.vol.stockpile = (u.vol.stockpile || 0) + 1;
                        b.emit('stockpile', Object.assign({ n: u.vol.stockpile }, me(u))); return {}; } },
    'swallow':      { use: (b, u) => {
                        const n = u.vol.stockpile || 0;
                        if (!n || u.mon.hp >= G.Mon.maxHp(u.mon)) return fail(b);
                        b.heal(u, G.Mon.maxHp(u.mon) * [0, 0.25, 0.5, 1][n], 'move'); u.vol.stockpile = 0; return {}; } },
    'haze':         { use: b => { for (const bm of b.allActive()) for (const k of G.Battle.STAGES) bm.stages[k] = 0; b.emit('haze', {}); return {}; } },
    'mist':         { use: field('mist') },
    'reflect':      { use: field('reflect') },
    'light-screen': { use: field('lightScreen') },
    'safeguard':    { use: field('safeguard') },
    'sunny-day':    { use: weather('sun') },
    'rain-dance':   { use: weather('rain') },
    'sandstorm':    { use: weather('sand') },
    'hail':         { use: weather('hail') },
    'moonlight':    { healPct: weatherHeal },
    'synthesis':    { healPct: weatherHeal },
    'morning-sun':  { healPct: weatherHeal },
    // Doubles only (chapter 40): the partner's move this turn is 1.5× as strong; the foes' moves aim at the user.
    'helping-hand': { use: (b, u) => {
                        const a = b.ally(u);
                        if (!a || a.moved) return fail(b);
                        a.vol.helped = true;
                        b.emit('helpingHand', Object.assign({ target: a.mon.uid, tside: a.side }, me(u))); return {}; } },
    'follow-me':    { use: (b, u) => {
                        if (!b.double) return fail(b);
                        u.vol.followMe = true;
                        b.emit('followMe', me(u)); return {}; } }
  };

  // Moves Metronome / Sleep Talk never call.
  const NO_CALL = new Set(['metronome', 'struggle', 'mirror-move', 'sleep-talk', 'protect', 'detect', 'endure', 'counter',
    'mirror-coat', 'destiny-bond', 'mimic', 'transform', 'helping-hand', 'follow-me', 'snatch', 'trick', 'focus-punch', 'thief', 'covet',
    'switcheroo']);

  function selfKO(b, u) { if (u.mon.hp > 0) b.hurt(u, u.mon.hp, { why: 'selfKO' }); }

  // ---------- items moved (chapter 94) ----------
  function swapItems(b, u, t) {
    if (!b.alive(t) || (!u.mon.item && !t.mon.item) || t.vol.substitute > 0 || u.ability === 'multitype') return fail(b);
    if (G.Held.sticky(b, t)) { G.Abilities.say(b, t, 'protect'); return false; }
    const mine = u.mon.item, theirs = t.mon.item;
    u.mon.item = theirs; t.mon.item = mine;
    for (const [bm, gave] of [[u, mine], [t, theirs]]) {
      bm.vol.choice = null;
      if (gave && !bm.mon.item && bm.ability === 'unburden') bm.vol.unburden = true;
    }
    b.emit('trick', me(u));
    if (theirs) b.emit('obtain', Object.assign({ item: theirs }, me(u)));
    if (mine) b.emit('obtain', { side: t.side, uid: t.mon.uid, item: mine });
    return {};
  }
  function steal(b, u, t, res) {
    if (!res || !res.total || res.sub || u.mon.item || !t.mon.item || !b.alive(u)) return;
    if (G.Held.sticky(b, t)) return G.Abilities.say(b, t, 'protect');
    const item = t.mon.item;
    G.Held.takeAway(b, t);
    u.mon.item = item;
    b.emit('steal', Object.assign({ item, target: t.mon.uid, tside: t.side }, me(u)));
  }
  function pluck(b, u, t, res) {
    const item = t.mon.item, fx = item && G.ITEM_FX[item];
    if (!res || !res.total || res.sub || !fx || (fx.held !== 'berry' && fx.held !== 'resist') || !b.alive(u)) return;
    G.Held.takeAway(b, t);
    b.emit('pluck', Object.assign({ item }, me(u)));
    if (!G.Abilities.klutz(u.mon)) G.Held.eatBerry(b, u, item);
  }
  function crash(b, u) { if (b.alive(u)) { b.emit('crash', me(u)); b.hurt(u, Math.max(1, Math.floor(G.Mon.maxHp(u.mon) / 2)), { why: 'crash' }); } }

  function reversalPower(u) {
    const p = Math.floor(48 * u.mon.hp / G.Mon.maxHp(u.mon));
    return p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
  }

  /** Generation 3–5 Hidden Power: type and power (30–70) from the IVs. */
  const HP_TYPES = ['fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark'];
  function hiddenPower(mon) {
    const order = [0, 1, 2, 5, 3, 4];                 // hp atk def spe spa spd
    let t = 0, p = 0;
    order.forEach((s, i) => { t += (mon.ivs[s] & 1) << i; p += ((mon.ivs[s] >> 1) & 1) << i; });
    return { type: HP_TYPES[Math.floor(t * 15 / 63)], pow: Math.floor(p * 40 / 63) + 30 };
  }

  function protect(kind) {
    return (b, u) => {
      const n = u.vol.protectCount || 0;
      if (b.rng.next() >= 1 / Math.pow(2, n)) { u.vol.protectCount = 0; return fail(b); }
      u.vol.protectCount = n + 1;
      u.vol[kind] = true;
      b.emit(kind === 'endure' ? 'bracing' : 'protecting', me(u));
      return {};
    };
  }
  function trapUse(b, u, t) {
    if (b.trapped(t)) return fail(b);
    t.vol.cantEscape = u.mon.uid;
    b.emit('cantEscapeNow', me(t)); return {};
  }
  function field(k) {
    return (b, u) => {
      const f = b.sideOf(u).field;
      if (f[k]) return fail(b);
      // Light Clay (chapter 74): the screens of its holder last 8 turns.
      f[k] = (k === 'reflect' || k === 'lightScreen') && G.Held && G.Held.is(u.mon, 'light-clay') ? 8 : 5;
      b.emit('field', { side: u.side, effect: k });
      return {};
    };
  }
  function weather(w) {
    return b => {
      if (b.weather && b.weather.w === w) return fail(b);
      b.weather = { w, turns: 5 };
      b.emit('weather', { w });
      G.Abilities.forecast(b);
      return {};
    };
  }
  function weatherHeal(b) { const w = W(b); return w === 'sun' ? 66.7 : w ? 25 : 50; }

  // Every other move of the learnsets (Kanto and Johto) that is knowingly simplified:
  // status moves that fail, damaging moves that only deal their damage.
  const FALLBACK = new Set([
    // status: no effect in a single battle without abilities / held items yet
    'camouflage', 'conversion-2', 'imprison', 'mimic', 'role-play',
    'skill-swap', 'snatch', 'torment', 'transform', 'mud-sport', 'water-sport',
    'sketch', 'assist', 'nature-power',
    'aqua-ring', 'copycat', 'gastro-acid', 'guard-swap', 'heal-block', 'healing-wish', 'lunar-dance', 'lucky-chant',
    'magic-coat', 'magnet-rise', 'power-swap', 'power-trick', 'psycho-shift', 'worry-seed',
    // damaging: just their damage (no uproar lock; the item moves are real since chapter 94; Future Sight, Pursuit and
    // Focus Punch since chapter 110)
    'uproar', 'bide', 'present', 'triple-kick',
    'me-first', 'trump-card'
  ]);

  S.FALLBACK = FALLBACK;
  S.NO_CALL = NO_CALL;
  S.hiddenPower = hiddenPower;
  return S;
})();
