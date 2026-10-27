/* ============ text.js — battle events as lines of text ============
 *   G.BattleText.line(event, battle) -> string, or null for events that are only animation
 * Used by the battle screen (M4) and tools/sim_battle.js. All text goes through
 * G.I18n.fmt with English keys (translations: js/i18n/<lang>/battle.js); names
 * come from G.Names. The foe's Pokémon are "Wild X" or "Foe X".
 */
G.BattleText = (() => {
  const fmt = (k, v) => G.I18n.fmt(k, v);

  function findMon(b, uid) {
    for (const s of b.sides) { const m = s.party.find(x => x.uid === uid); if (m) return { mon: m, side: s.side }; }
    const r = b.result && b.result.mon;
    return r && r.uid === uid ? { mon: r, side: 1 } : null;
  }

  /** Display name of a battler: yours as it is, the foe's as "Wild X" / "Foe X". */
  function who(b, uid, side) {
    const f = findMon(b, uid);
    if (!f) return '?';
    const n = G.Mon.name(f.mon);
    if ((side == null ? f.side : side) === 0) return n;
    return b.kind === 'wild' || b.kind === 'safari' ? fmt('Wild {mon}', { mon: n }) : fmt('Foe {mon}', { mon: n });
  }
  const plain = (b, uid) => { const f = findMon(b, uid); return f ? G.Mon.name(f.mon) : '?'; };

  function trainerName(b) {
    const t = b.foe.trainer;
    if (!t) return '';
    return t.title ? G.T(t.title, t.titleCtx || 'trainer') + ' ' + t.name : t.name;
  }
  const money = n => '₽' + G.I18n.num(n);

  function stageLine(mon, stat, d, capped) {
    const s = G.Names.stat(stat);
    if (capped) return d > 0 ? fmt("{mon}'s {stat} won't go any higher!", { mon, stat: s }) : fmt("{mon}'s {stat} won't go any lower!", { mon, stat: s });
    if (d >= 3) return fmt("{mon}'s {stat} rose drastically!", { mon, stat: s });
    if (d === 2) return fmt("{mon}'s {stat} rose sharply!", { mon, stat: s });
    if (d === 1) return fmt("{mon}'s {stat} rose!", { mon, stat: s });
    if (d === -1) return fmt("{mon}'s {stat} fell!", { mon, stat: s });
    if (d === -2) return fmt("{mon}'s {stat} harshly fell!", { mon, stat: s });
    return fmt("{mon}'s {stat} severely fell!", { mon, stat: s });
  }

  function chargeLine(mon, move) {
    switch (move) {
      case 'solar-beam': return fmt('{mon} absorbed light!', { mon });
      case 'dig': return fmt('{mon} burrowed its way under the ground!', { mon });
      case 'fly': return fmt('{mon} flew up high!', { mon });
      case 'skull-bash': return fmt('{mon} tucked in its head!', { mon });
      case 'bounce': return fmt('{mon} sprang up!', { mon });
      case 'dive': return fmt('{mon} hid underwater!', { mon });
      case 'sky-attack': return fmt('{mon} became cloaked in a harsh light!', { mon });
      case 'razor-wind': return fmt('{mon} whipped up a whirlwind!', { mon });
      default: return fmt('{mon} is getting ready!', { mon });
    }
  }

  function statusLine(mon, s) {
    switch (s) {
      case 'par': return fmt('{mon} is paralyzed! It may be unable to move!', { mon });
      case 'slp': return fmt('{mon} fell asleep!', { mon });
      case 'psn': return fmt('{mon} was poisoned!', { mon });
      case 'tox': return fmt('{mon} was badly poisoned!', { mon });
      case 'brn': return fmt('{mon} was burned!', { mon });
      case 'frz': return fmt('{mon} was frozen solid!', { mon });
      default: return null;
    }
  }

  function damageLine(b, e, mon) {
    switch (e.why) {
      case 'confusion': return fmt('It hurt itself in its confusion!', {});
      case 'recoil': return fmt('{mon} is damaged by the recoil!', { mon });
      case 'psn': case 'tox': return fmt('{mon} is hurt by poison!', { mon });
      case 'brn': return fmt('{mon} is hurt by its burn!', { mon });
      case 'seed': return fmt("{mon}'s health is sapped by Leech Seed!", { mon });
      case 'trap': return fmt('{mon} is hurt by {move}!', { mon, move: G.Names.move(e.src) });
      case 'nightmare': return fmt('{mon} is locked in a nightmare!', { mon });
      case 'sand': return fmt('{mon} is buffeted by the sandstorm!', { mon });
      case 'hail': return fmt('{mon} is pelted by hail!', { mon });
      case 'crash': return null;
      default: return null;                       // ordinary hits: only the HP bar moves
    }
  }

  function line(e, b) {
    const mon = e.uid ? who(b, e.uid, e.side) : null;
    switch (e.type) {
      case 'start':
        if (b.kind === 'wild' || b.kind === 'safari') { const f = b.foe.party[0]; return fmt('Wild {mon} appeared!', { mon: G.Mon.name(f) }); }
        return fmt('{trainer} would like to battle!', { trainer: trainerName(b) });
      case 'send':
        if (e.side === 0) return fmt('Go! {mon}!', { mon: plain(b, e.uid) });
        return b.kind === 'trainer' ? fmt('{trainer} sent out {mon}!', { trainer: trainerName(b), mon: plain(b, e.uid) }) : null;
      case 'withdraw': return e.side === 0 ? fmt('{mon}, come back!', { mon: plain(b, e.uid) }) : fmt('{trainer} withdrew {mon}!', { trainer: trainerName(b), mon: plain(b, e.uid) });
      case 'move': return fmt('{mon} used {move}!', { mon, move: G.Names.move(e.move) });
      case 'charge': return chargeLine(mon, e.move);
      case 'cantMove':
        switch (e.why) {
          case 'par': return fmt("{mon} is paralyzed! It can't move!", { mon });
          case 'slp': return fmt('{mon} is fast asleep.', { mon });
          case 'frz': return fmt('{mon} is frozen solid!', { mon });
          case 'flinch': return fmt("{mon} flinched and couldn't move!", { mon });
          case 'recharge': return fmt('{mon} must recharge!', { mon });
          case 'attract': return fmt('{mon} is immobilized by love!', { mon });
          case 'disabled': return fmt("{mon}'s move is disabled!", { mon });
        }
        return null;
      case 'wake': return fmt('{mon} woke up!', { mon });
      case 'thaw': return fmt('{mon} thawed out!', { mon });
      case 'confused': return fmt('{mon} is confused!', { mon });
      case 'hurtSelf': return null;              // the damage event says it
      case 'confusionEnd': return fmt('{mon} snapped out of its confusion!', { mon });
      case 'confuse': return e.why === 'fatigue' ? fmt('{mon} became confused due to fatigue!', { mon }) : fmt('{mon} became confused!', { mon });
      case 'damage': return damageLine(b, e, mon);
      case 'heal':
        if (e.why === 'drain') return fmt('{mon} had its energy drained!', { mon: who(b, e.from, e.fromSide) });
        if (e.why === 'leech' || e.why === 'rest' || e.why === 'item') return e.why === 'item' ? fmt("{mon}'s HP was restored.", { mon }) : null;
        if (e.why === 'ingrain') return fmt('{mon} absorbed nutrients with its roots!', { mon });
        return fmt('{mon} regained health!', { mon });
      case 'status': return statusLine(mon, e.s);
      case 'cure': return fmt("{mon}'s status returned to normal!", { mon });
      case 'noEffect': return fmt("It doesn't affect {mon}...", { mon });
      case 'fail': return fmt('But it failed!', {});
      case 'miss': return fmt("{mon}'s attack missed!", { mon });
      case 'noTarget': return fmt('But there was no target...', {});
      case 'protected': return fmt('{mon} protected itself!', { mon });
      case 'hits': return fmt('Hit {n} times!', { n: e.n });
      case 'effective': return e.eff > 1 ? fmt("It's super effective!", {}) : fmt("It's not very effective...", {});
      case 'ohko': return fmt("It's a one-hit KO!", {});
      case 'stage': return stageLine(mon, e.stat, e.delta, e.capped);
      case 'mistBlock': return fmt('{mon} is protected by the mist!', { mon });
      case 'subDamage': return fmt('The substitute took damage for {mon}!', { mon });
      case 'subFade': return fmt("{mon}'s substitute faded!", { mon });
      case 'substitute': return fmt('{mon} put in a substitute!', { mon });
      case 'tooWeak': return fmt('But it does not have enough HP left to make a substitute!', {});
      case 'endured': return fmt('{mon} endured the hit!', { mon });
      case 'bracing': return fmt('{mon} braced itself!', { mon });
      case 'protecting': return fmt('{mon} protected itself!', { mon });
      case 'destinyBondSet': return fmt('{mon} is hoping to take its attacker down with it!', { mon });
      case 'destinyBond': return fmt('{mon} took its attacker down with it!', { mon });
      case 'faint': return fmt('{mon} fainted!', { mon });
      case 'trap': return fmt('{mon} was trapped by {move}!', { mon, move: G.Names.move(e.move) });
      case 'freed': return fmt('{mon} was freed from {move}!', { mon, move: G.Names.move(e.move) });
      case 'seeded': return fmt('{mon} was seeded!', { mon });
      case 'attract': return fmt('{mon} fell in love!', { mon });
      case 'yawn': return fmt('{mon} grew drowsy!', { mon });
      case 'nightmare': return fmt('{mon} began having a nightmare!', { mon });
      case 'perishSong': return fmt('All Pokémon that hear the song will faint in three turns!', {});
      case 'perish': return fmt("{mon}'s perish count fell to {n}.", { mon, n: e.n });
      case 'ingrain': return fmt('{mon} planted its roots!', { mon });
      case 'identified': return fmt('{mon} was identified!', { mon });
      case 'blownAway': return fmt('{mon} was blown away!', { mon });
      case 'draggedOut': return fmt('{mon} was dragged out!', { mon });
      case 'magnitude': return fmt('Magnitude {n}!', { n: e.n });
      case 'coins': return fmt('Coins were scattered everywhere!', {});
      case 'spunFree': return fmt('{mon} got free!', { mon });
      case 'pumped': return fmt('{mon} is getting pumped!', { mon });
      case 'rest': return fmt('{mon} slept and became healthy!', { mon });
      case 'nothing': return fmt('But nothing happened!', {});
      case 'teleported': return fmt('{mon} fled from the battle!', { mon });
      // The Safari Zone (safari.js).
      case 'bait': return fmt('{player} threw some Bait!', { player: e.player });
      case 'rock': return fmt('{player} threw a Rock!', { player: e.player });
      case 'eating': return fmt('{mon} is eating!', { mon: who(b, e.uid, 1) });
      case 'angry': return fmt('{mon} is angry!', { mon: who(b, e.uid, 1) });
      case 'watching': return fmt('{mon} is watching carefully!', { mon: who(b, e.uid, 1) });
      case 'safariFled': return fmt('{mon} fled!', { mon: who(b, e.uid, 1) });
      case 'noBalls': return fmt('You have no Safari Balls left!', {});
      case 'metronome': return fmt('Waggling a finger let it use {move}!', { move: G.Names.move(e.move) });
      case 'typeChange': return fmt("{mon}'s type changed to {type}!", { mon, type: G.Names.type(e.to) });
      case 'disabled': return fmt("{mon}'s {move} was disabled!", { mon, move: G.Names.move(e.move) });
      case 'disableEnd': return fmt('{mon} is no longer disabled!', { mon });
      case 'bellyDrum': return fmt('{mon} cut its own HP and maximized its Attack!', { mon });
      case 'psychUp': return fmt("{mon} copied its opponent's stat changes!", { mon });
      case 'spite': return fmt("It reduced the PP of {mon}'s {move} by {n}!", { mon, move: G.Names.move(e.move), n: e.n });
      case 'aromatherapy': return fmt('A soothing aroma wafted through the area!', {});
      case 'cantEscapeNow': return fmt('{mon} can no longer escape!', { mon });
      case 'lockOn': return fmt('{mon} took aim!', { mon });
      case 'stockpile': return fmt('{mon} stockpiled {n}!', { mon, n: e.n });
      case 'haze': return fmt('All stat changes were eliminated!', {});
      case 'screensBroken': return fmt('The wall shattered!', {});
      case 'crash': return fmt('{mon} kept going and crashed!', { mon });
      case 'field': return fieldLine(e.side, e.effect, true);
      case 'fieldEnd': return fieldLine(e.side, e.effect, false);
      case 'weather': return { sun: fmt('The sunlight turned harsh!', {}), rain: fmt('It started to rain!', {}),
                               sand: fmt('A sandstorm kicked up!', {}), hail: fmt('It started to hail!', {}) }[e.w];
      case 'weatherEnd': return { sun: fmt('The sunlight faded.', {}), rain: fmt('The rain stopped.', {}),
                                  sand: fmt('The sandstorm subsided.', {}), hail: fmt('The hail stopped.', {}) }[e.w];
      case 'weatherTick': return null;
      case 'run': return e.ok ? fmt('Got away safely!', {}) : fmt("Can't escape!", {});
      case 'noRunTrainer': return fmt("No! There's no running from a trainer battle!", {});
      case 'ball':
        if (e.caught) return fmt('Gotcha! {mon} was caught!', { mon: plain(b, e.uid) });
        return [fmt('Oh no! The Pokémon broke free!', {}), fmt('Aww! It appeared to be caught!', {}),
                fmt('Aargh! Almost had it!', {}), fmt('Gah! It was so close, too!', {})][e.shakes];
      case 'item':
        if (e.side === 0) return fmt('{player} used {item}!', { player: b.player.name, item: G.Names.item(e.item) });
        return fmt('{trainer} used {item}!', { trainer: trainerName(b), item: G.Names.item(e.item) });
      case 'revived': return fmt('{mon} was revived!', { mon: plain(b, e.uid) });
      case 'ppRestored': return fmt("{mon}'s PP was restored.", { mon: plain(b, e.uid) });
      case 'exp': return fmt('{mon} gained {n} Exp. Points!', { mon: plain(b, e.uid), n: G.I18n.num(e.amt) });
      case 'levelup': return fmt('{mon} grew to Lv. {n}!', { mon: plain(b, e.uid), n: e.lvl });
      case 'learned': return fmt('{mon} learned {move}!', { mon: plain(b, e.uid), move: G.Names.move(e.move) });
      case 'learnPrompt': return fmt('{mon} wants to learn {move}, but it already knows four moves. Forget a move to make room?',
                                     { mon: plain(b, e.uid), move: G.Names.move(e.move) });
      case 'forgot': return fmt('1, 2 and... Poof! {mon} forgot {move}.', { mon: plain(b, e.uid), move: G.Names.move(e.move) });
      case 'notLearned': return fmt('{mon} did not learn {move}.', { mon: plain(b, e.uid), move: G.Names.move(e.move) });
      case 'defeated': return fmt('{player} defeated {trainer}!', { player: b.player.name, trainer: trainerName(b) });
      case 'payDay': return fmt('{player} picked up {money}!', { player: b.player.name, money: money(e.amt) });
      case 'money': return fmt('{player} got {money} for winning!', { player: b.player.name, money: money(e.amt) });
      case 'outOfPokemon': return fmt('{player} is out of usable Pokémon!', { player: b.player.name });
      default: return null;
    }
  }

  function fieldLine(side, k, on) {
    const mine = side === 0;
    if (on) {
      switch (k) {
        case 'reflect': return mine ? fmt("Reflect raised your team's Defense!", {}) : fmt("Reflect raised the foe team's Defense!", {});
        case 'lightScreen': return mine ? fmt("Light Screen raised your team's Sp. Def!", {}) : fmt("Light Screen raised the foe team's Sp. Def!", {});
        case 'mist': return mine ? fmt('Your team became shrouded in mist!', {}) : fmt('The foe team became shrouded in mist!', {});
        case 'safeguard': return mine ? fmt('Your team became cloaked in a mystical veil!', {}) : fmt('The foe team became cloaked in a mystical veil!', {});
      }
      return null;
    }
    const name = G.Names.move({ lightScreen: 'light-screen' }[k] || k);
    return mine ? fmt("Your team's {effect} wore off!", { effect: name }) : fmt("The foe team's {effect} wore off!", { effect: name });
  }

  return { line, who, trainerName };
})();
