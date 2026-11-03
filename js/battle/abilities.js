/* ============ abilities.js — abilities in battle (chapter 28, Generation 3 rules) ============
 * Every Pokémon has an ability: one of its species' `ab` (one or two, as in Generation 3), picked
 * by its uid so that creating a Pokémon draws no extra random number; `mon.ability` (a string)
 * forces one. In battle the battler carries its own copy (`bm.ability`, set by makeBM), which
 * Trace may change. The battle asks this module at a few points, like G.Held:
 *   of(mon) · weather(b) (none while Cloud Nine or Air Lock is out)
 *   statMult(b, bm, key)     Huge Power, Pure Power, Hustle, Guts, Marvel Scale, Swift Swim, Chlorophyll
 *   powerMult(b, user, target, type)   Overgrow, Blaze, Torrent, Swarm (at 1/3 HP), Flash Fire, Thick Fat
 *   accMult(b, user, target, M)        Compound Eyes, Hustle, Sand Veil
 *   noCrit(bm) · noOhko(bm) · noRecoil(bm) · chance(bm, pct) (Serene Grace) · shieldDust(bm)
 *   stops(b, user, target, M, type, eff) -> true when the target's ability stops the move:
 *       Water Absorb, Volt Absorb (heal 1/4), Flash Fire, Wonder Guard, Soundproof
 *   immune(user, target, M, type, eff)  the same, as a question (the AI)
 *   blocksStatus(bm, s) · blocksConfusion(bm) · blocksAttract(bm) · blocksFlinch(bm) · blocksDrop(bm, stat)
 *   afterStatus(b, target, s, source)  Synchronize
 *   contact(b, user, target, M)        Static, Flame Body, Poison Point, Effect Spore, Cute Charm, Rough Skin
 *   afterHit(b, user, target, type)    Color Change
 *   switchIn(b, bm)    Intimidate, Trace, Drizzle, Drought, Sand Stream (weather that lasts), Pressure
 *   switchOut(b, bm)   Natural Cure      endOfTurn(b, bm)   Speed Boost, Shed Skin, Rain Dish
 *   forecast(b)        Castform's type follows the weather
 *   truant(b, bm) -> loafs this turn    pressure(target) · damp(b, id) · traps(b, bm) · runAway(bm)
 *   suctionCups(bm) · liquidOoze(bm) · earlyBird(bm)
 * Abilities with no effect in a single battle (Stench, Illuminate, Pickup, Plus, Minus, Lightning
 * Rod, Sticky Hold here) have a name and a description, and do nothing. Random rolls are made only
 * when an ability is at work, so battles where none is play as before. Events: `ability`
 * { side, uid, ability, why: 'show' | 'protect' | 'trace' | 'flash-fire' | 'type' | 'truant' | 'pressure' | 'damp',
 *   target, tside (Trace), to (the new type), move (Damp) } and heal with `why: 'ability'`.
 */
G.Abilities = (() => {
  // Moves that touch the target (Generation 3 and the later moves the game has); PokeAPI has no flag.
  const CONTACT = new Set(`pound karate-chop double-slap comet-punch mega-punch fire-punch ice-punch thunder-punch scratch
    vice-grip guillotine cut wing-attack fly bind slam vine-whip stomp double-kick mega-kick jump-kick rolling-kick
    headbutt horn-attack fury-attack horn-drill tackle body-slam wrap take-down thrash double-edge bite peck drill-peck
    submission low-kick counter seismic-toss strength petal-dance dig quick-attack rage lick waterfall clamp skull-bash
    high-jump-kick dizzy-punch leech-life crabhammer fury-swipes hyper-fang super-fang slash struggle triple-kick thief
    flame-wheel flail reversal mach-punch feint-attack outrage rollout false-swipe spark fury-cutter steel-wing return
    frustration dynamic-punch megahorn pursuit rapid-spin iron-tail metal-claw vital-throw cross-chop crunch extreme-speed
    rock-smash fake-out facade focus-punch smelling-salts superpower revenge brick-break knock-off endeavor arm-thrust
    blaze-kick ice-ball needle-arm poison-fang crush-claw meteor-mash shadow-punch sky-uppercut dragon-claw covet
    volt-tackle leaf-blade bounce poison-tail astonish aerial-ace dive uproar dragon-rush zen-headbutt iron-head x-scissor
    night-slash shadow-claw poison-jab wake-up-slap hammer-arm close-combat force-palm brave-bird flare-blitz wood-hammer
    head-smash u-turn thunder-fang ice-fang fire-fang aqua-jet aqua-tail bullet-punch sucker-punch shadow-sneak
    crush-grip power-whip gyro-ball bug-bite pluck assurance payback punishment drain-punch`.split(/\s+/).filter(Boolean));
  const SOUND = new Set(['growl', 'roar', 'sing', 'supersonic', 'screech', 'snore', 'uproar', 'metal-sound', 'grass-whistle',
                         'hyper-voice', 'perish-song', 'heal-bell']);
  const STATUS_BLOCK = { limber: ['par'], insomnia: ['slp'], 'vital-spirit': ['slp'], immunity: ['psn', 'tox'],
                         'water-veil': ['brn'], 'magma-armor': ['frz'] };
  const PINCH = { overgrow: 'grass', blaze: 'fire', torrent: 'water', swarm: 'bug' };
  const WEATHER = { drizzle: 'rain', drought: 'sun', 'sand-stream': 'sand' };
  const FORECAST = { sun: 'fire', rain: 'water', hail: 'ice' };
  // Every ability of the game's Pokémon (Generation 3): each one is handled here, or knowingly has
  // no effect in a single battle (NO_EFFECT). tests/abilities.test.cjs checks the species data.
  const NO_EFFECT = new Set(['stench', 'illuminate', 'pickup', 'sticky-hold']);
  // Double battles (chapter 40): Plus and Minus (Special Attack ×1.5 beside the other one), Lightning
  // Rod (draws the Electric moves aimed at another Pokémon; effects.js), Intimidate on both foes.
  const KNOWN = new Set([...NO_EFFECT, 'plus', 'minus', 'lightning-rod', ...`air-lock arena-trap battle-armor blaze chlorophyll clear-body cloud-nine color-change
    compound-eyes cute-charm damp drizzle drought early-bird effect-spore flame-body flash-fire forecast guts huge-power hustle
    hyper-cutter immunity inner-focus insomnia intimidate keen-eye levitate limber liquid-ooze magma-armor magnet-pull
    marvel-scale natural-cure oblivious overgrow own-tempo poison-point pressure pure-power rain-dish rock-head rough-skin
    run-away sand-stream sand-veil serene-grace shadow-tag shed-skin shell-armor shield-dust soundproof speed-boost static
    sturdy suction-cups swarm swift-swim synchronize thick-fat torrent trace truant vital-spirit volt-absorb water-absorb
    water-veil white-smoke wonder-guard`.split(/\s+/).filter(Boolean)]);

  /** The ability of a Pokémon (not of a battler: see bm.ability). */
  function of(mon) {
    if (!mon) return null;
    if (typeof mon.ability === 'string') return mon.ability;
    const ab = (G.SPECIES[mon.sp] || {}).ab || [];
    if (ab.length < 2) return ab[0] || null;
    let h = 7;
    for (const c of String(mon.uid || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return ab[h % 2];
  }
  const say = (b, bm, why, extra) => b.emit('ability', Object.assign({ side: bm.side, uid: bm.mon.uid, ability: bm.ability, why }, extra));
  const foeOf = (b, bm) => b.other(bm);
  /** Every battler in the field (a double battle has up to four). */
  const active = b => (b.allActive ? b.allActive() : b.sides.map(s => s.bm).filter(Boolean));

  /** The weather that counts: none while a Pokémon with Cloud Nine or Air Lock is in battle. */
  function weather(b) {
    if (!b.weather) return null;
    for (const bm of active(b)) if (b.alive(bm) && (bm.ability === 'cloud-nine' || bm.ability === 'air-lock')) return null;
    return b.weather.w;
  }

  function statMult(b, bm, key) {
    const a = bm.ability, st = bm.mon.status;
    if (!a) return 1;
    if (key === 'atk') return a === 'huge-power' || a === 'pure-power' ? 2 : a === 'hustle' || (a === 'guts' && st) ? 1.5 : 1;
    if (key === 'def') return a === 'marvel-scale' && st ? 1.5 : 1;
    if (key === 'spe') { const w = weather(b); return (a === 'swift-swim' && w === 'rain') || (a === 'chlorophyll' && w === 'sun') ? 2 : 1; }
    if (key === 'spa' && (a === 'plus' || a === 'minus') && b.double) {
      const al = b.ally(bm);
      return al && al.ability === (a === 'plus' ? 'minus' : 'plus') ? 1.5 : 1;
    }
    return 1;
  }

  function powerMult(b, user, target, type) {
    let m = 1;
    if (PINCH[user.ability] === type && user.mon.hp * 3 <= b.maxHp(user)) m *= 1.5;
    if (type === 'fire' && user.vol.flashFire) m *= 1.5;
    if (target.ability === 'thick-fat' && (type === 'fire' || type === 'ice')) m *= 0.5;
    return m;
  }

  function accMult(b, user, target, M) {
    let m = 1;
    if (user.ability === 'compound-eyes') m *= 1.3;
    if (user.ability === 'hustle' && M.cat === 'physical') m *= 0.8;
    if (target.ability === 'sand-veil' && weather(b) === 'sand') m *= 0.8;
    return m;
  }

  const noCrit = bm => bm.ability === 'battle-armor' || bm.ability === 'shell-armor';
  const noOhko = bm => bm.ability === 'sturdy';
  const noRecoil = bm => bm.ability === 'rock-head';
  const shieldDust = bm => bm.ability === 'shield-dust';
  const chance = (bm, pct) => (bm.ability === 'serene-grace' ? Math.min(100, pct * 2) : pct);

  /** Would the target's ability stop this move? (Levitate is in b.eff already.) */
  function immune(user, target, M, type, eff) {
    const a = target.ability, id = G.BattleFx.idOf(M);
    if (!a || target === user) return false;
    if (a === 'soundproof' && SOUND.has(id)) return true;
    if (M.cat === 'status') {
      if (a === 'volt-absorb' && type === 'electric' && M.meta.ail === 'paralysis') return true;
      if (a === 'flash-fire' && type === 'fire' && M.meta.ail === 'burn') return true;
      return false;
    }
    if ((a === 'water-absorb' && type === 'water') || (a === 'volt-absorb' && type === 'electric') || (a === 'flash-fire' && type === 'fire')) return true;
    return a === 'wonder-guard' && eff != null && eff <= 1 && !(G.SpecialMoves[id] || {}).typeless;
  }

  /** The target's ability stops the move: its effect (healing, Flash Fire) and the line. -> stopped? */
  function stops(b, user, target, M, type, eff) {
    if (!immune(user, target, M, type, eff)) return false;
    const a = target.ability;
    if (a === 'water-absorb' || a === 'volt-absorb') {
      if (target.mon.hp < b.maxHp(target)) b.heal(target, b.maxHp(target) / 4, 'ability', { ability: a });
      else say(b, target, 'protect');
    } else if (a === 'flash-fire') {
      target.vol.flashFire = true;
      say(b, target, 'flash-fire');
    } else say(b, target, 'protect');
    return true;
  }

  // ---------------- statuses and stat changes ----------------

  const blocksStatus = (bm, s) => !!(STATUS_BLOCK[bm.ability] && STATUS_BLOCK[bm.ability].includes(s));
  const blocksConfusion = bm => bm.ability === 'own-tempo';
  const blocksAttract = bm => bm.ability === 'oblivious';
  const blocksFlinch = bm => bm.ability === 'inner-focus';
  const blocksDrop = (bm, stat) => bm.ability === 'clear-body' || bm.ability === 'white-smoke'
    || (bm.ability === 'hyper-cutter' && stat === 'atk') || (bm.ability === 'keen-eye' && stat === 'acc');

  /** Synchronize: poison, paralysis or a burn from the foe is passed back to it. */
  function afterStatus(b, target, s, source) {
    if (target.ability !== 'synchronize' || !source || source === target || !['psn', 'tox', 'par', 'brn'].includes(s) || !b.alive(source)) return;
    say(b, target, 'show');
    b.inflict(source, s === 'tox' ? 'psn' : s, { silent: true });
  }

  /** A move that touches the target: the target's ability may answer (one roll, only for these abilities). */
  function contact(b, user, target, M) {
    const a = target.ability;
    if (!a || user === target || !b.alive(user) || !CONTACT.has(G.BattleFx.idOf(M))) return;
    if (a === 'rough-skin') {
      say(b, target, 'show');
      b.hurt(user, Math.max(1, Math.floor(b.maxHp(user) / 16)), { why: 'ability' });
      return;
    }
    const st = { static: 'par', 'flame-body': 'brn', 'poison-point': 'psn' }[a];
    if (st) {
      if (!user.mon.status && b.rng.pct(30)) { say(b, target, 'show'); b.inflict(user, st, { source: target, silent: true }); }
      return;
    }
    if (a === 'effect-spore') {
      if (!user.mon.status && b.rng.pct(10)) { say(b, target, 'show'); b.inflict(user, ['psn', 'par', 'slp'][b.rng.int(0, 2)], { source: target, silent: true }); }
      return;
    }
    if (a === 'cute-charm') {
      const g = user.mon.gender, h = target.mon.gender;
      if (g && h && g !== h && !user.vol.attract && !blocksAttract(user) && b.rng.pct(30)) {
        say(b, target, 'show');
        user.vol.attract = true;
        b.emit('attract', { side: user.side, uid: user.mon.uid });
      }
    }
  }

  /** Color Change: hit by a move, it takes on that move's type. */
  function afterHit(b, user, target, type) {
    if (target.ability !== 'color-change' || !b.alive(target) || !type || target === user) return;
    if (target.types.length === 1 && target.types[0] === type) return;
    target.types = [type];
    say(b, target, 'type', { to: type });
  }

  // ---------------- coming in, going out, the end of the turn ----------------

  function switchIn(b, bm) {
    if (!b.alive(bm)) return;
    const a = bm.ability;
    let foe = foeOf(b, bm);
    // Doubles: Trace copies one of the foes (at random when both can be copied).
    if (a === 'trace' && b.double) { const fs = b.foes(bm).filter(f => f.ability && f.ability !== 'trace'); foe = fs.length > 1 ? fs[b.rng.int(0, 1)] : fs[0]; }
    if (a === 'trace' && foe && b.alive(foe) && foe.ability && foe.ability !== 'trace') {
      bm.ability = foe.ability;
      b.emit('ability', { side: bm.side, uid: bm.mon.uid, ability: foe.ability, why: 'trace', target: foe.mon.uid, tside: foe.side });
      return switchIn(b, bm);
    }
    if (a === 'intimidate' && b.double && b.foes(bm).length) {
      say(b, bm, 'show');
      for (const f of b.foes(bm)) b.stage(f, 'atk', -1, { source: bm });
    } else if (a === 'intimidate' && foe && b.alive(foe)) {
      say(b, bm, 'show');
      b.stage(foe, 'atk', -1, { source: bm });                   // Clear Body, Hyper Cutter and Mist stop it
    }
    if (WEATHER[a] && !(b.weather && b.weather.w === WEATHER[a] && b.weather.turns === Infinity)) {
      say(b, bm, 'show');
      b.weather = { w: WEATHER[a], turns: Infinity };          // Generation 3: it lasts while nothing changes it
      b.emit('weather', { w: WEATHER[a] });
    }
    if (a === 'pressure') say(b, bm, 'pressure');
    forecast(b);
  }

  /** Natural Cure: its status is cured when it leaves the battle. */
  function switchOut(b, bm) {
    if (bm.ability === 'natural-cure' && bm.mon.status) { bm.mon.status = null; bm.mon.slp = 0; bm.mon.tox = 0; }
  }

  function endOfTurn(b, bm) {
    if (!b.alive(bm) || !bm.ability) return;
    const a = bm.ability;
    if (a === 'rain-dish' && weather(b) === 'rain' && bm.mon.hp < b.maxHp(bm)) b.heal(bm, b.maxHp(bm) / 16, 'ability', { ability: a });
    if (a === 'shed-skin' && bm.mon.status && b.rng.int(1, 3) === 1) {
      say(b, bm, 'show');
      bm.mon.status = null; bm.mon.slp = 0; bm.mon.tox = 0;
      b.emit('cure', { side: bm.side, uid: bm.mon.uid });
    }
    if (a === 'speed-boost' && bm.entered < b.turn && bm.stages.spe < 6) { say(b, bm, 'show'); b.stage(bm, 'spe', 1, { source: bm }); }
  }

  /** Castform: Fire in the sun, Water in the rain, Ice in hail, Normal otherwise. */
  function forecast(b) {
    for (const bm of active(b)) {
      if (!b.alive(bm) || bm.ability !== 'forecast') continue;
      const t = FORECAST[weather(b)] || 'normal';
      if (bm.types.length === 1 && bm.types[0] === t) continue;
      bm.types = [t];
      say(b, bm, 'type', { to: t });
    }
  }

  /** Truant: every other turn it loafs around. -> loafs now */
  function truant(b, bm) {
    if (bm.ability !== 'truant') return false;
    if (bm.vol.loafing) { bm.vol.loafing = false; say(b, bm, 'truant'); return true; }
    bm.vol.loafing = true;
    return false;
  }

  const pressure = bm => !!bm && bm.ability === 'pressure';
  /** Damp: no Self-Destruct or Explosion while it is in battle. -> the battler with Damp, or null */
  function damp(b, id) {
    if (id !== 'self-destruct' && id !== 'explosion') return null;
    for (const bm of active(b)) if (b.alive(bm) && bm.ability === 'damp') return bm;
    return null;
  }
  /** Shadow Tag, Arena Trap (not against flying or levitating Pokémon), Magnet Pull (Steel types). */
  function traps(b, bm) {
    return (b.double ? b.foes(bm) : [foeOf(b, bm)]).some(foe => {
      if (!foe || !b.alive(foe) || !foe.ability) return false;
      if (foe.ability === 'shadow-tag') return bm.ability !== 'shadow-tag';
      if (foe.ability === 'arena-trap') return !bm.types.includes('flying') && bm.ability !== 'levitate';
      if (foe.ability === 'magnet-pull') return bm.types.includes('steel');
      return false;
    });
  }
  const runAway = bm => bm.ability === 'run-away';
  const suctionCups = bm => bm.ability === 'suction-cups';
  const liquidOoze = bm => bm.ability === 'liquid-ooze';
  const earlyBird = bm => bm.ability === 'early-bird';

  return { CONTACT, SOUND, KNOWN, NO_EFFECT, of, weather, statMult, powerMult, accMult, noCrit, noOhko, noRecoil, shieldDust, chance, immune, stops,
           blocksStatus, blocksConfusion, blocksAttract, blocksFlinch, blocksDrop, afterStatus, contact, afterHit, switchIn, switchOut,
           endOfTurn, forecast, truant, pressure, damp, traps, runAway, suctionCups, liquidOoze, earlyBird, say };
})();
