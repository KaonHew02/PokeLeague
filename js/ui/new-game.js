/* ============ new-game.js — New game and Continue (called by the title screen) ============
 *   G.NewGame.start()      a slot, the professor's welcome (boy or girl, names), then the first map
 *   G.NewGame.continue()   a slot, then the world where the save left off
 *   G.NewGame.START        where a new game begins: the first of these maps that exists
 *
 * The welcome is the 'intro' mode: the canvas shows the professor, a Pokémon,
 * the player and the rival; the dialog box (dialog.js) tells the story.
 * The texts are our own, not the games'.
 */
G.NewGame = (() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  /** Kanto starts in the player's room (M6); the sandbox stands in until the Kanto maps exist (dev only). */
  const START = [{ map: 'player-2f', spot: 'start' }, { map: 'player-1f', spot: 'start' }, { map: 'pallet', spot: 'player-door' },
                 { map: 'sandbox', spot: 'start' }];
  const INTRO_MON = 25;
  /** Until the first Pokémon Center, losing a battle takes you home to Mom. */
  const HOME = { map: 'player-1f', spot: 'mom' };

  function startPlace() { return START.find(p => G.Maps.has(p.map)) || null; }

  // ---------------- the 'intro' mode ----------------

  const scene = { cast: [], mon: null, fade: 0, t: 0 };
  /** who: 'oak' | 'mon' | 'player-boy' | 'player-girl' | 'rival', shown alone or with the Pokémon. */
  function show(...who) { scene.cast = who; scene.t = 0; }

  const Mode = {
    enter() { scene.fade = 1; scene.t = 0; },
    exit() {},
    update(dt) {
      G.Dialog.tick(dt);
      scene.t += dt;
      scene.fade = Math.max(0, scene.fade - dt * 2);
      if (scene.mon) scene.mon.update(dt);
    },
    render(c, v) {
      const g = c.createRadialGradient(v.w / 2, v.h * 0.48, v.h * 0.05, v.w / 2, v.h * 0.48, v.h * 0.85);
      g.addColorStop(0, '#5a7fd0'); g.addColorStop(0.55, '#203a78'); g.addColorStop(1, '#070d22');
      c.fillStyle = g; c.fillRect(0, 0, v.w, v.h);
      const k = Math.max(2, Math.floor(v.h * 0.4 / 24));
      const floor = v.h * 0.64;
      c.fillStyle = 'rgba(255,255,255,.12)';
      c.beginPath(); c.ellipse(v.w / 2, floor, v.w * 0.3, v.h * 0.05, 0, 0, 6.2832); c.fill();
      const people = scene.cast.filter(w => w !== 'mon');
      const withMon = scene.cast.includes('mon');
      const pop = Math.min(1, scene.t * 4);
      people.forEach((who, i) => {
        const x = v.w / 2 + (withMon ? -v.w * 0.09 : 0) + (i - (people.length - 1) / 2) * v.w * 0.16;
        G.People.draw(c, who, 'down', 0, x, floor, k, pop);
      });
      if (withMon && scene.mon) {
        const a = scene.mon;
        a.scale = k / G.Sprites.PX * 0.9;
        const x = v.w / 2 + v.w * 0.11;
        G.Sprites.drawShadow(c, a.dex, x, floor, a.scale);
        a.draw(c, x, floor);
      }
      if (scene.fade > 0) { c.fillStyle = `rgba(0,0,0,${scene.fade})`; c.fillRect(0, 0, v.w, v.h); }
    }
  };
  G.Game ? G.Game.define('intro', Mode) : addEventListener('DOMContentLoaded', () => G.Game.define('intro', Mode));

  const say = text => G.Dialog.say(text, { name: T('Prof. Oak') });

  /** The welcome. -> { gender, name, rival } */
  async function intro() {
    G.UI.closeAll();
    G.Game.setMode('intro');
    // (the title theme keeps playing)
    scene.mon = new G.Sprites.Animator(INTRO_MON, 1, false);
    scene.mon.dir = 0;
    scene.mon.loop('Idle');
    show('oak');
    await say(T('Ah, a new face! Welcome to the world of Pokémon.'));
    await say(T('My name is Oak. People around here call me the Pokémon Professor.'));
    show('oak', 'mon');
    if (G.Audio.cry) G.Audio.cry(INTRO_MON);
    await say(T('This world is home to creatures called Pokémon. They live in the tall grass, in caves, in the sea... everywhere.'));
    await say(T('Some people keep them as friends, others battle with them. Me? I study them.'));
    show('oak');
    const g = await G.Dialog.ask(T('But first, tell me about yourself. Are you a boy or a girl?'), { options: [T('Boy'), T('Girl')], name: T('Prof. Oak') });
    const gender = g === 1 ? 'f' : 'm';
    const me = gender === 'f' ? 'player-girl' : 'player-boy';
    show(me);
    await say(T('And what is your name?'));
    const name = await G.NameUI.ask({ kind: 'player', gender });
    await say(fmt('So you are {player}! Very nice to meet you.', { player: name }));
    show('rival');
    await say(T('This is my grandson. The two of you have been rivals ever since you were little.'));
    await say(T('Hmm... now what was his name again?'));
    const rival = await G.NameUI.ask({ kind: 'rival' });
    await say(fmt("That's it! {rival}, of course.", { rival }));
    show(me);
    await say(fmt('{player}! Your own Pokémon journey starts today. Wild Pokémon, new friends and tough trainers are all waiting out there.', { player: name }));
    await say(T('Off you go!'));
    return { gender, name, rival };
  }

  // ---------------- new game and continue ----------------

  let busy = false;
  async function start() {
    if (busy) return;
    busy = true;
    try {
      const used = G.Store.slots();
      const slot = used.every(s => !s) ? 1 : await G.SlotsUI.pick('new');
      if (!slot) return;
      const who = await intro();
      const save = G.Store.newSave({ name: who.name, gender: who.gender, rival: who.rival, id: G.RNG.seed() % 65536 });
      if (G.Maps.has(HOME.map)) save.player.lastHeal = Object.assign({}, HOME);
      G.Session.begin(slot, save);
      const at = startPlace();
      if (!at) { G.UI.toast(T('No map to start on yet.')); G.TitleUI.open(); return; }
      // Until the Kanto maps exist (M6) the dev sandbox has no professor: a Pokémon to start with.
      if (at.map === 'sandbox') G.Field.giveMon(INTRO_MON, 5);
      G.World.start({ map: at.map, spot: at.spot });
      if (!G.Session.save()) G.UI.toast(T('Could not save: the browser storage is full or blocked.'), 4000);
    } finally { busy = false; }
  }

  async function cont() {
    if (busy) return;
    busy = true;
    try {
      const slot = await G.SlotsUI.pick('load');
      if (!slot) return;
      const save = G.Store.load(slot);
      if (!save) { await G.Popup.say(T('This save could not be read.')); return; }
      G.Session.begin(slot, save);
      resume(save);
      if (G.Store.usedBackup) G.UI.toast(T('The save was damaged: the backup copy was loaded.'), 4000);
    } finally { busy = false; }
  }

  /** Back where the save left off: its map and tile, else the last Pokémon Center, else the start. */
  function resume(save) {
    const p = save.player;
    if (p.map && G.Maps.has(p.map)) { G.World.start({ map: p.map, x: p.x, y: p.y, dir: p.dir }); return; }
    if (p.lastHeal && G.Maps.has(p.lastHeal.map)) { G.World.start({ map: p.lastHeal.map, spot: p.lastHeal.spot }); return; }
    const at = startPlace();
    if (at) G.World.start(at);
    else { G.UI.toast(T('No map to start on yet.')); G.TitleUI.open(); }
  }

  return { start, continue: cont, resume, START };
})();
