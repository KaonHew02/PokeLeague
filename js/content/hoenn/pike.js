/* ============ pike.js — the Battle Pike ============
 * Chapter 82, Hoenn after the League: a sixth building on the Battle Tower's island (js/content/hoenn/tower.js), a purple
 * tower. The player enters three of their own Pokémon (G.TowerHall.pickEntrants, as at the Battle Tower); copies go in,
 * and through the whole pass their HP, PP and status stay as they are: only a healing room heals. A pass is fourteen
 * rooms in seven pairs: in the first of each pair (battle-pike-hall) there are three doors, and the maid hints at one of
 * them; behind the chosen door (battle-pike-room) something happens (doorsFor, from Emerald's Battle Pike):
 *   single   a Trainer of the pass's round (one Pokémon)        double   two Trainers, one Pokémon each
 *   hard     a Trainer of the next round; won, all are healed   wild     a wild Seviper or Milotic (Lv. 46), else by
 *   status   a Kirlia or Dusclops gives 1-3 of yours a status            pass Dusclops / Electrode / Breloom / Wobbuffet (Lv. 45)
 *   partial  one or two are healed     full  all are healed     empty    nothing (someone says a word)
 * Each hint covers two kinds (people: single or full · nostalgia: status or partial · whisper: double or empty · aroma:
 * hard or wild), and the other two doors are neither. A normal Trainer brings one Pokémon (with three, a team whose HP never
 * comes back got through a pass about one time in thirty; the player chose one), the hard one three. No healing room for a team at full health, no double battle with one
 * able Pokémon, no status room when none is left to take one. All three down ends the challenge; seven pairs make a pass:
 * Battle Points (G.Tower.bpFor), shared with the Tower's Exchange Service Corner; the streak counts passes in a row
 * (G.Tower.streak('single', 'pike')). Lucy, the Pike Queen, is behind every door of the last pair of the 2nd pass (the
 * Silver Luck Symbol) and the 10th (the Gold), with her teams and natures from Emerald. The first pass done once chapter 81
 * is done ends the chapter: `ending(82)`.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const HOENN = { region: 'hoenn' };
  const HALL = 'pike';
  const SALT = 207301;                         // the Pike's seeds differ from the other halls'

  // ---------------- The lobby, the hall of three doors, the room behind them ----------------
  G.Maps.def(Object.assign({
    id: 'battle-pike-lobby', loc: 'battle-pike', tileset: 'indoor', palette: 'pool', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWeW',
      'p+++++++++++++P',
      '++++=======++++',
      '+++++++++++++++',
      '+++++++++++++++',
      't+++++++++++++t',
      '+++++++++++++++',
      '+++++++X+++++++'
    ],
    warps: [{ x: 7, y: 8, to: 'battle-tower', spot: 'pike-door' },
            { x: 13, y: 1, to: 'battle-pike-hall', spot: 'player', if: 'scripted', locked: 'pike.door' }],
    spots: { door: [7, 8, 'up'], single: [7, 4, 'up'] },
    signs: { '13,1': { script: 'pike.door' } },
    npcs: [
      { id: 'single', who: 'clerk', x: 7, y: 2, dir: 'down', script: 'pike.single' },
      { id: 'guide', who: 'hiker', x: 2, y: 6, dir: 'right', script: 'pike.guide' }
    ]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'battle-pike-hall', loc: 'battle-pike', tileset: 'indoor', palette: 'pool', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWWWW',
      'WWeWWeWWeWW',
      '+++++++++++',
      '+++++++++++',
      '+++++++++++',
      '+++++++++++',
      '+++++X+++++'
    ],
    // The three doors open only during a challenge (the counter's script chooses through the maid).
    warps: [{ x: 5, y: 6, to: 'battle-pike-lobby', spot: 'single' },
            ...[2, 5, 8].map(x => ({ x, y: 1, to: 'battle-pike-room', spot: 'player', if: 'scripted', locked: 'pike.maid' }))],
    spots: { player: [5, 4, 'up'] },
    npcs: [{ id: 'maid', who: 'maid', x: 7, y: 3, dir: 'left', script: 'pike.maid' }]
  }, HOENN));

  G.Maps.def(Object.assign({
    id: 'battle-pike-room', loc: 'battle-pike', tileset: 'indoor', palette: 'pool', music: 'center', battleBg: 'indoor',
    rows: [
      'WWWWWWWWW',
      'WWWWWWWWW',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '+++++++++',
      '++++X++++'
    ],
    warps: [{ x: 4, y: 7, to: 'battle-pike-hall', spot: 'player' }],
    spots: { player: [4, 5, 'up'] },
    // Who is behind the door: one Trainer, or two; a nurse; someone who only talks.
    npcs: [
      { id: 'foe', who: 'cooltrainer', x: 4, y: 3, dir: 'down', if: 'scripted' },
      { id: 'foe2', who: 'cooltrainer', x: 5, y: 3, dir: 'down', if: 'scripted' },
      { id: 'nurse', who: 'nurse', x: 3, y: 3, dir: 'down', if: 'scripted' },
      { id: 'npc', who: 'youngster', x: 2, y: 4, dir: 'right', if: 'scripted' }
    ]
  }, HOENN));

  // ---------------- What is behind a door ----------------
  const KINDS = ['single', 'double', 'hard', 'wild', 'status', 'partial', 'full', 'empty'];
  const HINTS = {
    people: [['single', 75], ['full', 25]], nostalgia: [['status', 50], ['partial', 50]],
    whisper: [['double', 80], ['empty', 20]], aroma: [['hard', 75], ['wild', 25]]
  };
  const CATS = Object.keys(HINTS);
  const catOf = kind => CATS.find(c => HINTS[c].some(([k]) => k === kind));
  const weighted = (rng, list) => { let r = rng.int(1, list.reduce((a, [, w]) => a + w, 0)); for (const [k, w] of list) if ((r -= w) <= 0) return k; return list[0][0]; };

  const able = team => team.filter(m => m.hp > 0);
  const full = m => m.hp >= G.Mon.maxHp(m) && !m.status;
  /** Whether a room can be behind a door for this team. */
  function allowed(kind, team) {
    if (kind === 'full' || kind === 'partial') return team.some(m => !full(m));
    if (kind === 'double') return able(team).length >= 2;
    if (kind === 'status') return team.some(m => m.hp > 0 && !m.status);
    return true;
  }

  const seed = (run, pass, n) => G.RNG((((G.Field.save.player.id | 0) * 131 + run * 977 + pass * 7919 + n * 104729 + SALT) >>> 0));
  /** Lucy, the Pike Queen: behind every door of the 7th pair of the 2nd and 10th passes (Serebii's teams, altissimo's natures). */
  const QUEEN = {
    2: { print: 'silver', bp: 10, team: [
      ['seviper', 50, ['swagger', 'crunch', 'poison-fang', 'giga-drain'], 'quick-claw', { nature: 'brave' }],
      ['shuckle', 50, ['toxic', 'sandstorm', 'protect', 'rest'], 'chesto-berry', { nature: 'bold' }],
      ['milotic', 50, ['ice-beam', 'mirror-coat', 'surf', 'recover'], 'leftovers', { nature: 'modest' }]] },
    10: { print: 'gold', bp: 20, team: [
      ['seviper', 50, ['swagger', 'crunch', 'sludge-bomb', 'giga-drain'], 'focus-band', { nature: 'bold' }],
      ['steelix', 50, ['earthquake', 'rock-slide', 'explosion', 'screech'], 'bright-powder', { nature: 'brave' }],
      ['gyarados', 50, ['dragon-dance', 'return', 'rest', 'roar'], 'chesto-berry', { nature: 'adamant' }]] }
  };

  /** The three doors of pair k (0-6) of a pass: { doors: [kind x3], hinted: 0-2, hint: category }; the same for the same pair. */
  function doorsFor(pass, k, run, team) {
    if (QUEEN[pass] && k === 6) return { doors: ['queen', 'queen', 'queen'], hinted: 1, hint: 'dread' };
    const rng = seed(run, pass, k), doors = [];
    const healthy = team.every(full);
    const hinted = rng.int(0, 2);
    let cat = healthy ? weighted(rng, [['people', 3], ['nostalgia', 1], ['whisper', 1], ['aroma', 1]]) : rng.pick(CATS);
    const inCat = c => {
      const k1 = weighted(rng, HINTS[c]), k2 = HINTS[c].find(([x]) => x !== k1)[0];
      return allowed(k1, team) ? k1 : allowed(k2, team) ? k2 : null;
    };
    doors[hinted] = inCat(cat) || 'empty';
    cat = catOf(doors[hinted]);                // an impossible room turns the hint into whispering (nothing there)
    const rest = KINDS.filter(x => catOf(x) !== cat && allowed(x, team));
    for (let d = 0; d < 3; d++) {
      if (d === hinted) continue;
      const kind = inCat(rng.pick(CATS.filter(c => c !== cat)));
      doors[d] = kind && catOf(kind) !== cat ? kind : rng.pick(rest);
    }
    return { doors, hinted, hint: cat };
  }

  /** The wild Pokémon of a pass: Seviper or Milotic (Lv. 46) a quarter of the time each, else the pass's third (Lv. 45). */
  function wildFor(pass, rng) {
    const r = rng.int(1, 100);
    if (r <= 26) return ['seviper', 46];
    if (r <= 52) return ['milotic', 46];
    return [pass <= 20 ? 'dusclops' : pass <= 40 ? 'electrode' : pass <= 60 ? 'breloom' : 'wobbuffet', 45];
  }

  // ---------------- The Trainers ----------------
  const BEFORE = () => [T('So you picked my door. Bad luck for you!'), T('Nobody gets through this room without a battle!'),
    T('The pike is long, and your Pokémon look tired already.'), T('I have been waiting in this room for ages. Let us battle!')];
  const DEFEAT = () => [T('Go on, then. The next door awaits.'), T('Your luck held this time...'), T('I hope the next room is kinder to you.')];
  const speaker = d => G.TowerHall.speaker(d);
  /** A Trainer of round `round` for room k of a pass (`salt` keeps the two of a double battle apart). */
  const trainer = (round, run, pass, k, salt = 0) =>
    G.TowerHall.trainerFor(Math.min(3, round) * 7 + 1, 'single', run * 41 + pass * 7 + k, { salt: SALT + 1009 * (k + 1) + salt, before: BEFORE(), defeat: DEFEAT() });

  function queen(q) {
    const silver = q.print === 'silver';
    return { id: 'lucy', who: 'lucy', cls: 'pike-queen', name: 'Lucy', ai: 'leader', prize: 0, items: {}, music: 'league', team: q.team, queen: q,
             before: silver ? T('...So you made it this far. I am Lucy, the Pike Queen. Luck brought you here. Let us see if it carries you past me.')
               : T('...You again. This time, luck will not be enough.'),
             defeat: silver ? T('...Your luck is real. Take it.') : T('...I see. It was never only luck with you.') };
  }

  // ---------------- The rooms ----------------
  const STATUS = [['psn', 35], ['frz', 25], ['par', 20], ['slp', 10], ['brn', 10]];
  const statusLine = (s, mon) => (s === 'psn' ? fmt('{mon} was poisoned!', { mon }) : s === 'frz' ? fmt('{mon} was frozen solid!', { mon })
    : s === 'par' ? fmt('{mon} is paralyzed! It may be unable to move!', { mon }) : s === 'slp' ? fmt('{mon} fell asleep!', { mon }) : fmt('{mon} was burned!', { mon }));
  const NOBODY = () => [T('Do not mind me. I am only resting my feet.'), T('I took the wrong door three times in a row. Good luck to you!'),
    T('This pike goes on and on... Which way was out again?')];

  /** One room: -> 'lose' when all three are down, else null. */
  async function room(h, kind, c) {
    const { team, run, pass, k } = c, rng = seed(run, pass, 100 + k), Tw = G.Tower;
    const fight = async (d, ids) => {
      ids.forEach((id, i) => { const a = G.World && G.World.actor && G.World.actor(id); if (a) a.who = i ? d.partner.who : d.who; h.show(id); });
      await h.say(d.before, speaker(d));
      const out = await h.battle(d, { canLose: true, record: false, party: team, rules: { noExp: true, noBag: true, shift: false } });
      if (out !== 'lose') await h.say(d.defeat, speaker(d));
      ids.forEach(id => h.hide(id));
      return out;
    };
    if (kind === 'single' || kind === 'hard') {
      const d = trainer(Math.min(3, pass - 1) + (kind === 'hard' ? 1 : 0), run, pass, k);
      if (kind === 'single') d.team = d.team.slice(0, 1);       // one Pokémon; the hard Trainer keeps three
      if (kind === 'hard') await h.say(T('A strong Trainer blocks the way!'));
      if (await fight(d, ['foe']) === 'lose') return 'lose';
      if (kind === 'hard') { team.forEach(m => G.Mon.heal(m)); await h.say(T('Your Pokémon were all restored to full health!')); }
      return null;
    }
    if (kind === 'double') {
      const a = trainer(Math.min(3, pass - 1), run, pass, k), b = trainer(Math.min(3, pass - 1), run, pass, k, 7);
      const d = Object.assign({}, a, { double: true, team: [a.team[0], b.team[0]], partner: { cls: b.cls, name: b.name, who: b.who } });
      await h.say(T('Two Trainers are waiting together!'));
      return await fight(d, ['foe', 'foe2']) === 'lose' ? 'lose' : null;
    }
    if (kind === 'queen') {
      const d = queen(QUEEN[pass]);
      await h.say(T('The Pike Queen has come to battle you herself!'));
      if (await fight(d, ['foe']) === 'lose') return 'lose';
      if (d.queen.print === 'silver') G.Field.setFlag('pike-silver'); else G.Field.setFlag('pike-gold');
      Tw.addBp(d.queen.bp);
      await h.say(d.queen.print === 'silver' ? T('Lucy recognizes your luck. You earned the Silver Luck Symbol!') : T('Lucy recognizes your luck. You earned the Gold Luck Symbol!'));
      await h.say(T('{player} earned {n} BP!'), { vars: { n: d.queen.bp } });
      return null;
    }
    if (kind === 'wild') {
      const [sp, lvl] = wildFor(pass, rng);
      await h.say(T('The room is full of tall grass... Something is moving in it!'));
      const out = await h.wild(sp, lvl, { noCatch: true, party: team, canLose: true, rules: { noExp: true, noBag: true } });
      return out === 'lose' ? 'lose' : null;
    }
    if (kind === 'status') {
      const by = rng.next() < 0.5 ? 'kirlia' : 'dusclops', room = 2 * (k + 1);
      const n = room <= 5 ? 1 : room <= 10 ? 2 : 3;
      await h.say(T('A {mon} jumped out and attacked!'), { vars: { mon: G.Names.mon(G.Maps.species(by)) } });
      const targets = team.filter(m => m.hp > 0 && !m.status);
      for (let i = 0; i < n && targets.length; i++) {
        const m = targets.splice(rng.int(0, targets.length - 1), 1)[0], s = weighted(rng, STATUS);
        m.status = s;
        if (s === 'slp') m.slp = rng.int(2, 5);
        await h.say(statusLine(s, G.Mon.name(m)));
      }
      return null;
    }
    if (kind === 'partial' || kind === 'full') {
      h.show('nurse');
      await h.say(T('A nurse is waiting here to look after your Pokémon.'));
      let healed = team.slice();
      if (kind === 'partial') {                                   // one or two of the hurt ones, at random
        const pool = team.filter(m => !full(m));
        healed = [];
        for (let i = rng.int(1, 2); i > 0 && pool.length; i--) healed.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
      }
      healed.forEach(m => G.Mon.heal(m));
      if (kind === 'full') await h.say(T('Your Pokémon were all restored to full health!'));
      else for (const m of healed) await h.say(T('{mon} was restored to full health!'), { vars: { mon: G.Mon.name(m) } });
      h.hide('nurse');
      return null;
    }
    // Nothing here but someone who talks.
    h.show('npc');
    await h.say(rng.pick(NOBODY()));
    h.hide('npc');
    return null;
  }

  // ---------------- The counter ----------------
  const DOORS = () => [T('Left door'), T('Middle door'), T('Right door')];
  const HINT = {
    people: () => T('That door... I sense someone waiting behind it.'),
    nostalgia: () => T('That door... it fills me with a strange nostalgia.'),
    whisper: () => T('That door... I can hear whispering behind it.'),
    aroma: () => T('That door... there is a scent of Pokémon behind it.'),
    dread: () => T('All three doors... something terrible waits behind every one of them.')
  };

  async function counter(h) {
    const F = G.Field, Tw = G.Tower;
    await h.say(T('Welcome to the Battle Pike! Choose your way through fourteen rooms.'));
    if (!F.flag('pike-rules')) {
      F.setFlag('pike-rules');
      await h.say(T('Enter three Pokémon. In every other room you pick one of three doors. Behind it may be a battle, a wild Pokémon, a nurse... or something worse.'));
      await h.say(T('Your Pokémon are not healed between rooms: only a healing room will help them. If all three faint, your challenge is over.'));
      await h.say(T('Get through all fourteen rooms to finish a pass and earn Battle Points. Pokémon above level 50 battle at level 50, and items from the Bag cannot be used.'));
    }
    await h.say(T('Passes in a row: {n}. Your best: {best}.'), { vars: { n: Tw.streak('single', HALL), best: Tw.best('single', HALL) } });
    if (await h.choice(T('Would you like to take the challenge?'), {}) !== 0) { await h.say(T('Please come again!')); return; }
    const entered = await G.TowerHall.pickEntrants(h, 3);
    if (!entered) return;
    const team = entered.map(m => Tw.copy(m));
    const run = (+F.getVar('pike-runs') || 0) + 1;
    F.setVar('pike-runs', run);
    const pass = Tw.streak('single', HALL) + 1, log = [];
    G.PikeHall.log = log;
    await h.say(T('Good luck in the Pike!'));
    let done = false, lost = false;
    for (let k = 0; k < 7; k++) {
      await G.Script.exec([['warp', 'battle-pike-hall', 'player']], h);
      const plan = doorsFor(pass, k, run, team);
      // Tests only: G.PikeHall.force = [kinds...] puts those rooms behind every door, one pair after another.
      if (G.PikeHall.force && G.PikeHall.force.length) { const f = G.PikeHall.force.shift(); plan.doors = [f, f, f]; }
      await h.say(T('Room {n} of 14.'), { vars: { n: 2 * k + 1 } });
      await h.say(HINT[plan.hint](), { name: T('Maid') });
      const c = await h.choice(T('Which door will you take?'), { options: DOORS().concat(T('Retire')) });
      if (!(c >= 0 && c <= 2)) {
        Tw.setStreak('single', 0, HALL);
        await h.say(T('You retired from the Pike.'));
        break;
      }
      log.push({ plan, door: c, kind: plan.doors[c] });
      await G.Script.exec([['warp', 'battle-pike-room', 'player']], h);
      if (await room(h, plan.doors[c], { team, run, pass, k }) === 'lose') { lost = true; break; }
      if (k === 6) done = true;
    }
    await G.Script.exec([['warp', 'battle-pike-lobby', 'single']], h);
    if (lost) {
      Tw.setStreak('single', 0, HALL);
      await h.say(T('All your Pokémon fainted. Your challenge is over. Please try again!'));
    }
    if (done) {
      Tw.setStreak('single', pass, HALL);
      const bp = Tw.bpFor(pass);
      Tw.addBp(bp);
      await h.say(T('Congratulations! You made it through the Pike!'));
      await h.say(T('{player} earned {n} BP!'), { vars: { n: bp } });
      // The end of the eighty-second chapter (credits-ui.js), once the eighty-first is done.
      if (F.flag('chapter-81-done') && !F.flag('chapter-82-done')) {
        if (G.CreditsUI) G.CreditsUI.ending(82); else F.setFlag('chapter-82-done');
      }
    }
  }

  G.Script.def({
    'pike.single': [['js', counter]],
    'pike.door': [['say', 'The door to the battle room. Challengers must register at the counter first.']],
    'pike.maid': [['say', 'Choose a door, and good luck.']],
    'pike.guide': [
      ['say', 'Listen to the maid. Her hint is about one door, and the other two will never be the same kind of room.'],
      ['say', 'If your Pokémon are worn out, a door with a strange nostalgia or with someone waiting behind it may hold a nurse.'],
      ['say', 'They say the Pike Queen waits at the end of the second pass for a Trainer whose luck holds.']
    ]
  });
  G.PikeHall = { KINDS, HINTS, QUEEN, doorsFor, allowed, catOf, wildFor, log: [], force: null };
})();
