/* ============ debug.js — dev-only helpers (?debug): warp, give, win... Not in the published build. ============
 * URL (with ?debug):
 *   map=sandbox&spot=start      start in the overworld instead of the title (spot: a name or x,y)
 *   party=charmander:9,pidgey:7 items=poke-ball:10,potion:3 flags=a,b badges=3 seed=42
 *   fast (no typewriter) · noenc (no wild Pokémon)
 *   time=morning|day|night      pins the time of day (Johto's wild Pokémon and light)
 *   wild=caterpie:6             with map: a wild battle at once, from the overworld
 *                               (without map the battle screen runs its own test battle)
 *   trainer=pewter-gym:brock    a trainer battle at once (map defaults to sandbox)
 * Keys:
 *   F2 heal the party · F3 tile / map info · F4 wild encounters on/off · F6 win the battle
 *   F7 the next ball catches · F8 walk through walls · F9 print the save to the console
 * The battle UI (M4) reads G.Debug.win and G.Debug.catchNext (and clears them).
 */
G.Debug = (() => {
  const q = new URLSearchParams(location.search);
  const api = { on: q.has('debug'), win: false, catchNext: false, info: false };
  if (!api.on) return api;
  const P = k => q.get(k);
  const list = k => (P(k) || '').split(',').map(s => s.trim()).filter(Boolean);
  const toast = s => G.UI.toast('[debug] ' + s);

  if (P('seed')) G.World.seed(+P('seed') >>> 0);
  if (q.has('fast')) G.Dialog.instant = true;
  if (q.has('noenc')) G.World.debug.noEnc = true;
  if (P('time') && G.Clock) G.Clock.set(P('time'));

  function setup() {
    const S = G.Field.save;
    if (P('party')) {
      S.party.length = 0;
      for (const p of list('party')) {
        const [sp, lvl] = p.split(':');
        try { G.Field.giveMon(sp, +lvl || 5); } catch (e) { console.warn('[debug] party: ' + e.message); }
      }
    }
    for (const it of list('items')) { const [id, n] = it.split(':'); G.Field.giveItem(id, +n || 1); }
    for (const f of list('flags')) G.Field.setFlag(f);
    const b = +P('badges') || 0;
    for (let i = 1; i <= b; i++) G.Field.badge(i);
  }

  // Without a map, ?debug&wild=... / &vs=... is the battle screen's own test battle (G.BattleUI.debugFromUrl).
  // With a map, the battle starts from the overworld instead, through the normal encounter / trainer path.
  const wild = P('wild'), trainer = P('trainer');
  const map = P('map') || (trainer ? 'sandbox' : null);
  if (map && G.BattleUI && G.BattleUI.debugFromUrl) G.BattleUI.debugFromUrl = () => false;
  if (map) {
    // Skip the title: the first time the game would show it, go to the map instead.
    const title = G.TitleUI.open;
    let first = true;
    G.TitleUI.open = function () {
      if (!first) return title.apply(this, arguments);
      first = false;
      setup();
      G.World.start({ map, spot: P('spot') });
      setTimeout(() => {
        const h = G.World.host();
        if (wild) { const [sp, lvl] = wild.split(':'); G.Script.run([['wild', sp, +lvl || 5]], h); }
        else if (trainer) G.Script.run([['battle', trainer.includes(':') ? trainer : map + ':' + trainer, {}]], h);
      }, 500);
    };
  }

  /** Console: G.Debug.warp('sandbox-house', 'door') */
  api.warp = (m, spot) => G.World.warp(m, spot);
  api.give = (sp, lvl = 5) => G.Field.giveMon(sp, lvl);

  addEventListener('keydown', e => {
    const k = e.key;
    if (!/^F[2-9]$/.test(k)) return;
    e.preventDefault();
    if (k === 'F2') { G.Field.healAll(); toast('party healed'); }
    else if (k === 'F3') { api.info = !api.info; }
    else if (k === 'F4') { G.World.debug.noEnc = !G.World.debug.noEnc; toast('wild encounters ' + (G.World.debug.noEnc ? 'off' : 'on')); }
    else if (k === 'F6') { api.win = true; toast('the battle will be won'); }
    else if (k === 'F7') { api.catchNext = true; toast('the next ball catches'); }
    else if (k === 'F8') { G.World.debug.noclip = !G.World.debug.noclip; toast('walk through walls ' + (G.World.debug.noclip ? 'on' : 'off')); }
    else if (k === 'F9') { console.log('[debug] save', JSON.stringify(G.Field.save, null, 2)); toast('save printed to the console'); }
  });

  // F3: the map, the tile under the player, and a grid.
  G.WorldRender.extra.push((ctx, S) => {
    if (!api.info || !S.map) return;
    const TS = G.Maps.TS, m = S.map;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= m.w; x++) { ctx.moveTo(x * TS, 0); ctx.lineTo(x * TS, m.h * TS); }
    for (let y = 0; y <= m.h; y++) { ctx.moveTo(0, y * TS); ctx.lineTo(m.w * TS, y * TS); }
    ctx.stroke();
    const me = S.me;
    const text = `${m.id}  ${me.x},${me.y} ${me.dir}  ${G.Maps.kindAt(m, me.x, me.y)}`;
    ctx.font = '12px monospace';
    const x = G.Camera.left() + 6, y = G.Camera.top() + 16;
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(x - 3, y - 12, ctx.measureText(text).width + 6, 16);
    ctx.fillStyle = '#ffe680';
    ctx.fillText(text, x, y);
    ctx.restore();
  });

  console.info('[debug] on. F2 heal · F3 info · F4 encounters · F6 win · F7 catch · F8 no walls · F9 save');
  return api;
})();
