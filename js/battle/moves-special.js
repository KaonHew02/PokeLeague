/* ============ moves-special.js — moves with their own rules ============
 * Hooks are described at the top of effects.js. FALLBACK lists the moves that
 * are knowingly simplified: status moves that just fail, and damaging moves
 * that only deal plain damage. tests/effects.test.cjs checks that every move
 * of the game is generic, special-cased here, or listed in FALLBACK.
 */
G.SpecialMoves = (() => {
  const me = bm => ({ side: bm.side, uid: bm.mon.uid });
  const fail = b => { b.emit('fail', {}); return false; };
  const hpPct = bm => bm.mon.hp / G.Mon.maxHp(bm.mon);
  const W = b => b.weather && b.weather.w;
  /** How many times a rolling move (Rollout) already hit in a row. */
  const rolls = (u, id) => (u.vol.rampage && u.vol.rampage.move === id ? u.vol.rampage.n : 0);

  const S = {
    // ---------- two-turn moves ----------
    'solar-beam':  { charge: true, noChargeIf: b => W(b) === 'sun',
                     power: (b, u, t, M) => (['rain', 'sand', 'hail'].includes(W(b)) ? M.pow / 2 : M.pow) },
    'dig':         { charge: (b, u) => { u.vol.invuln = 'dig'; } },
    'fly':         { charge: (b, u) => { u.vol.invuln = 'fly'; } },
    'bounce':      { charge: (b, u) => { u.vol.invuln = 'fly'; } },
    'dive':        { charge: (b, u) => { u.vol.invuln = 'dive'; } },
    'skull-bash':  { charge: (b, u) => { b.stage(u, 'def', 1, { source: u }); } },
    'sky-attack':  { charge: true },
    'razor-wind':  { charge: true },

    // ---------- recharge and rampage ----------
    'hyper-beam':  { recharge: true },
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
    'self-destruct': { after: selfKO, onMiss: selfKO, onBlocked: selfKO },
    'explosion':     { after: selfKO, onMiss: selfKO, onBlocked: selfKO },

    // ---------- variable power ----------
    'flail':        { power: (b, u) => reversalPower(u) },
    'reversal':     { power: (b, u) => reversalPower(u) },
    'magnitude':    { hitsInvuln: ['dig'], doubleVsInvuln: true, power: (b) => {
                        const r = b.rng.int(1, 100), i = r <= 5 ? 0 : r <= 15 ? 1 : r <= 35 ? 2 : r <= 65 ? 3 : r <= 85 ? 4 : r <= 95 ? 5 : 6;
                        b.emit('magnitude', { n: i + 4 });
                        return [10, 30, 50, 70, 90, 110, 150][i]; } },
    'earthquake':   { hitsInvuln: ['dig'], doubleVsInvuln: true },
    'gust':         { hitsInvuln: ['fly'], doubleVsInvuln: true },
    'twister':      { hitsInvuln: ['fly'], doubleVsInvuln: true },
    'surf':         { hitsInvuln: ['dive'], doubleVsInvuln: true },
    'whirlpool':    { hitsInvuln: ['dive'], doubleVsInvuln: true },
    'thunder':      { hitsInvuln: ['fly'], acc: (b, u, t, M) => (W(b) === 'rain' ? null : W(b) === 'sun' ? 50 : M.acc) },
    'sky-uppercut': { hitsInvuln: ['fly'] },
    'brick-break':  { beforeHit: (b, u, t) => {
                        const f = b.sideOf(t).field;
                        if (f.reflect || f.lightScreen) { delete f.reflect; delete f.lightScreen; b.emit('screensBroken', { side: t.side }); } } },
    'tri-attack':   { after: (b, u, t, M, res) => {
                        if (res.total > 0 && b.alive(t) && !t.vol.substitute && b.rng.pct(20)) b.inflict(t, ['brn', 'par', 'frz'][b.rng.int(0, 2)], { source: u, silent: true }); } },
    'low-kick':     { power: (b, u, t) => { const kg = G.SPECIES[t.mon.sp].w / 10;
                        return kg < 10 ? 20 : kg < 25 ? 40 : kg < 50 ? 60 : kg < 100 ? 80 : kg < 200 ? 100 : 120; } },
    'return':       { power: (b, u) => Math.max(1, Math.floor((u.mon.friendship || 0) * 10 / 25)) },
    // Generation 4 moves of the Johto learnsets (HeartGold / SoulSilver).
    'gyro-ball':    { power: (b, u, t) => Math.min(150, Math.floor(25 * b.stat(t, 'spe') / Math.max(1, b.stat(u, 'spe'))) + 1) },
    'punishment':   { power: (b, u, t) => Math.min(200, 60 + 20 * Object.values(t.stages).reduce((n, v) => n + Math.max(0, v), 0)) },
    'wring-out':    { power: (b, u, t) => Math.max(1, Math.floor(120 * hpPct(t))) },
    'frustration':  { power: (b, u) => Math.max(1, Math.floor((255 - (u.mon.friendship || 0)) * 10 / 25)) },
    'hidden-power': { power: (b, u) => hiddenPower(u.mon).pow, moveType: (b, u) => hiddenPower(u.mon).type },
    'facade':       { power: (b, u, t, M) => (['psn', 'tox', 'par', 'brn'].includes(u.mon.status) ? M.pow * 2 : M.pow) },
    'revenge':      { power: (b, u, t, M) => (u.lastHit && u.lastHit.from !== u.side ? M.pow * 2 : M.pow) },
    // Rollout rolls on for five turns (a miss stops it), doubling each time; twice as hard after Defense Curl.
    'rollout':      { roll: true, power: (b, u, t, M) => M.pow * 2 ** rolls(u, 'rollout') * (u.vol.curl ? 2 : 1) },
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
    'rapid-spin':   { after: (b, u) => { if (u.vol.trap || u.vol.seeded) { u.vol.trap = null; u.vol.seeded = false; b.emit('spunFree', me(u)); } } },
    'struggle':     { typeless: true, after: (b, u) => { if (b.alive(u)) b.hurt(u, Math.max(1, Math.floor(G.Mon.maxHp(u.mon) / 4)), { why: 'recoil' }); } },
    'flame-wheel':  { thawsUser: true },
    'sacred-fire':  { thawsUser: true },

    // ---------- status moves with their own rules ----------
    'focus-energy': { use: (b, u) => { if (u.vol.focusEnergy) return fail(b); u.vol.focusEnergy = true; b.emit('pumped', me(u)); return {}; } },
    'rest':         { use: (b, u) => {
                        if (u.mon.hp >= G.Mon.maxHp(u.mon) || u.mon.status === 'slp') return fail(b);
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
    'haze':         { use: b => { for (const s of b.sides) if (s.bm) for (const k of G.Battle.STAGES) s.bm.stages[k] = 0; b.emit('haze', {}); return {}; } },
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
    'helping-hand': { use: fail },          // doubles only
    'follow-me':    { use: fail }
  };

  // Moves Metronome / Sleep Talk never call.
  const NO_CALL = new Set(['metronome', 'struggle', 'mirror-move', 'sleep-talk', 'protect', 'detect', 'endure', 'counter',
    'mirror-coat', 'destiny-bond', 'mimic', 'transform', 'helping-hand', 'follow-me', 'snatch', 'trick', 'focus-punch', 'thief', 'covet']);

  function selfKO(b, u) { if (u.mon.hp > 0) b.hurt(u, u.mon.hp, { why: 'selfKO' }); }
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
      f[k] = 5;
      b.emit('field', { side: u.side, effect: k });
      return {};
    };
  }
  function weather(w) {
    return b => {
      if (b.weather && b.weather.w === w) return fail(b);
      b.weather = { w, turns: 5 };
      b.emit('weather', { w });
      return {};
    };
  }
  function weatherHeal(b) { const w = W(b); return w === 'sun' ? 66.7 : w ? 25 : 50; }

  // Every other move of the learnsets (Kanto and Johto) that is knowingly simplified:
  // status moves that fail, damaging moves that only deal their damage.
  const FALLBACK = new Set([
    // status: no effect in a single battle without abilities / held items yet
    'baton-pass', 'camouflage', 'conversion-2', 'grudge', 'imprison', 'mimic', 'recycle', 'role-play',
    'skill-swap', 'snatch', 'spikes', 'taunt', 'torment', 'transform', 'trick', 'mud-sport', 'water-sport',
    'sketch', 'wish',
    'aqua-ring', 'copycat', 'embargo', 'gastro-acid', 'guard-swap', 'heal-block', 'healing-wish', 'lucky-chant',
    'magic-coat', 'magnet-rise', 'power-swap', 'power-trick', 'psycho-shift', 'tailwind', 'toxic-spikes', 'worry-seed',
    // damaging: just their damage (no delayed hit, uproar lock, item theft, switch hit)
    'future-sight', 'uproar', 'covet', 'thief', 'knock-off', 'pursuit', 'focus-punch', 'bide', 'present', 'triple-kick',
    'fling', 'natural-gift', 'me-first', 'trump-card'
  ]);

  S.FALLBACK = FALLBACK;
  S.NO_CALL = NO_CALL;
  S.hiddenPower = hiddenPower;
  return S;
})();
