# PokeLeague — design and implementation spec

The first playable slice goes from Pallet Town to Brock's Boulder Badge:

- title, new game and continue
- Oak's lab and the starter choice (Bulbasaur, Charmander or Squirtle), then the rival battle
- Route 1, then Viridian City (Pokémon Center, Mart, Oak's Parcel)
- Route 2 and Viridian Forest (Caterpie and Weedle, bug catchers)
- Pewter City, then Brock and the Boulder Badge

It must include catching, healing, EXP and levels, learning moves, cancellable evolution,
a party of 6 plus a PC box, the bag, the Pokédex (seen and caught), and saving.

This file is the contract between milestones. A session working on one milestone may rely
on everything listed for the milestones before it. If an API here changes, update this file
in the same change.

## 0. Decisions

- **Source language is English.** Pokémon, move, item, type and place names come from
  generated PokeAPI data in en, es, fr, it, zh-Hans and zh-Hant. pt-BR shows English names.
- **Mechanics:**
  - Damage: the Gen 5+ formula, with each move's own physical or special category and the
    Gen 6+ type chart (`G.Types.eff`).
  - Critical hits: ×1.5, chance by stage 1/24, 1/8, 1/2, 1.
  - Capture and running away: the Gen 3/4 formulas.
  - EXP: the Gen 3/4 flat formula, split between the Pokémon that took part.
  - Stats: Gen 3 IVs, EVs and natures.
  - Types and stats are PokeAPI's current ones (Clefairy is Fairy).
  - Abilities and held items are not in the slice; the save schema keeps their fields.
- **localStorage prefix `pl.`.** Local server on port 8130.
- **No `Math.random` in `js/battle/`.** Everything that changes the game state uses `G.RNG`.
- Dialogue is paraphrased. Music is original.

## 1. What M0 built (available to every milestone)

| Module | API |
|---|---|
| `G.U` (util.js) | `clamp, int, str, list, lerp, rand, randInt, pick, dist, norm, damp, hash, hms, esc, TYPE_COLOR` |
| `G.RNG(seed)` | `next, int(a,b), chance(p), pct(n), pick(list), u16(), state`; `G.RNG.seed()` makes a fresh seed |
| `G.I18n` | `lang, locale, choices, add(dict, lang, ctx), t(s, ctx), fmt(key, vars, ctx), has, num(n), font(size, weight), set(lang), walk(el)`; `G.T` is `t` |
| `G.Names` | `mon(id), move(id), item(id), type(id), loc(id), nature(id), genus(id), stat(id), pretty(id)`. Reads `G.NAMES` (M1); falls back to English, then to a readable id |
| `G.Settings` | `get, set, on(fn), all, touch` (touch = phone or tablet). Keys: textSpeed (slow/mid/fast), battleAnim, battleStyle (shift/set), follower, gamepad, padRumble, calm |
| `G.Audio` | `music(name), sfx(name), setVolume, toggleMute, unlock, canPlay`, plus `_internals` for jingles (M7). Unknown SFX names are ignored |
| `G.Input` | raw keys and pointer: `held(code), tap(code), virtual(code), mouse(), clicks(), endFrame()`. Pointer buttons are codes `mouseleft` / `mouseright`; `clicks()` = this frame's left clicks or taps on the canvas, `[{x, y, touch}]` in canvas CSS px |
| `G.Btn` | logical buttons up/down/left/right/a/b/start/select: `held(b)` (`'run'` = B or Shift), `pressed(b)`, `repeat(b)`, `dir4()`, `any()`, `swallow()`, `set(source, b, on)`. Keys: WASD/arrows; A = Space, Enter, E, Z; B = X, Backspace, right click; Start = Esc, C |
| `G.Nav` | spatial DOM menu navigation: `step(dir), press(), back(), focusFirst(el), hide(), topScreen()` |
| `G.Pad` | the controller; feeds `G.Btn`. There are **no on-screen buttons**: phones play by tapping (see section 4) |
| `G.Sprites` | `PX=2, Animator(dex, scale, shiny)` with `.dir .loop(anim) .play(anim, {hold}) .update(dt) .draw(ctx, x, y, {flash, softFlash, alpha})`; also `preload(dexes)`, `drawShadow`, `bodyHeight`, `DIR4`, `hasShiny`. Rows: 0 Down … 3 UpRight … 7 DownLeft |
| `G.Camera` | `VIEW_W=480, VIEW_H=320` (15×10 tiles of 32), `resize, snap(x,y), follow, kick, apply(ctx), left(), top(), sees()` |
| `G.Types` | `LIST, CHART, eff(atkType, defTypes), label(m)` |
| `G.UI` | `open(id, {onBack, focus}), close(id), closeAll(), isOpen, anyOpen, top, toast(msg), typeChips(types), sprite(cv, dex, opts), spriteCanvas(...)` |
| `G.Game` | `define(name, {enter, exit, update(dt, {ui}), render(ctx, view, dt)}), setMode(name, arg), mode, view {w, h, dpr}, canvas` |
| `G.TitleUI` | `open()`. It calls `G.NewGame.start()` and `G.NewGame.continue()` once something defines them (M5) |
| `G.OptionsUI` | Settings like PokéGo's: `open(tab)` with tabs game (language, text speed, battle animations, battle style, follower), sound (music, effects, mute), controls (keyboard, mouse, phone, controller), display (full screen, less shaking); `close()`; `muteButton(el)` makes a quick mute toggle. The start menu (M5) opens it too |

- **Frame:** `#frame` is a 3:2 box holding `<canvas id="game">` and every `.scr` screen.
  Inside it, CSS `em` follows the frame width (container units).
- **Input:** while a DOM screen is open, `game.js` sends the buttons to `G.Nav`, and the
  mode's `update` gets `{ ui: true }`. A screen with `data-noinput` (for example a dialog
  box that reads `G.Btn` itself) is skipped by Nav.

## 2. Data: `tools/fetch_data.py` (M1 ✅)

```
python tools/fetch_data.py --region kanto            # dex 1-151 (about 1,200 requests the first time)
python tools/fetch_data.py --region kanto --offline  # cache only; fails on a miss
python tools/fetch_data.py --region kanto --refresh  # download again
```

- **Cache:** raw responses go to `tools/cache/pokeapi/<endpoint>/<key>.json` (gitignored),
  written to a temp file and renamed. 8 threads.
- **Region config** (`REGIONS` in the tool):
  - Kanto: `dex (1,151)`; learnsets from `firered-leafgreen` (then emerald, HGSS); TMs from
    `firered-leafgreen`; encounters from the first of firered, leafgreen, red, blue, yellow
    that has data.
  - Flavor text: FRLG first (English only), then Let's Go (the other languages), else the
    newest entry. For Johto, add a `johto` entry with `dex (1,251)` and HGSS first.
- **Evolutions:**
  - Level-up becomes `{how:'level', level}`; a stone becomes `{how:'item', item}`.
  - Trades become `{how:'level', level:37, via:'trade'}`; Kadabra uses 36.
  - Friendship becomes `{how:'friendship', min}`, with `time` and `move` kept for later regions.
- **Gaps PokeAPI has:**
  - No es, it or Chinese **place names**: the tool's `LOC_NAMES` table adds the official
    ones for Kanto's towns, routes ("Ruta N", "Percorso N", "N号道路") and main dungeons.
    The Sevii Islands etc. still fall back to English.
  - Almost no **prices**: they are hand-written in `item-effects.js`.
  - The English FRLG texts write names in capitals; the tool turns "POKéMON" and
    "THUNDER WAVE" into "Pokémon" and "Thunder Wave" (HP, PP, TM, HM stay).
  - Line breaks are removed from Chinese text, where they must not become spaces.

**Output** (`.js` files, because `fetch()` is blocked on file://; one entry per line):
```js
G.SPECIES = { 1: { slug:'bulbasaur', types:['grass','poison'], base:[45,49,49,65,65,45] /* hp atk def spa spd spe */,
  ev:[0,0,0,1,0,0], cr:45 /* catch rate */, bx:64 /* base EXP */, gr:'medium-slow', gf:1 /* females in eighths, -1 genderless */,
  fr:70 /* base friendship */, h:7, w:69, leg:1 /* only legendaries and Mew */,
  evo:[{ to:2, how:'level', level:16 }], learn:[[1,'tackle'],[4,'growl'],[7,'leech-seed'], …] /* sorted; can repeat a move */,
  tm:['hm01','tm06', …] } }
G.MOVES = { ember: { id:52, type:'fire', cat:'special' /* physical|special|status */, pow:40 /* null for status */,
  acc:100 /* null = never misses */, pp:25, pri:0, tgt:'selected-pokemon', eff:10 /* effect chance */,
  meta:{ k:'damage-ailment', ail:'burn', ailP:10, crit:0, drain:0, heal:0, flinch:0, statP:0, hits:null, turns:null },
  stats:[] /* e.g. growl [['atk',-1]]; stats are hp atk def spa spd spe acc eva */ } }
G.TMS = { tm39:'rock-tomb', hm01:'cut', … }                      // this region's machines
G.ITEMS = { potion: { id:17, pocket:'items' /* items|balls|tms|key */, cat:'healing' }, tm39: { …, move:'rock-tomb' } }
G.GROWTH = { 'medium-slow': [0, 0, 9, 57, 96, 135, …] }          // index = level (1-100), value = total EXP
G.NATURES = { adamant: { up:'atk', down:'spa' }, hardy: { up:null, down:null }, … }   // 25
G.NAMES = { langs:['en','es','fr','it','zh-Hans','zh-Hant'], mon:{1:[…]}, move:{…}, item:{…}, type:{…},
            loc:{'viridian-city':[…]}, nature:{…}, genus:{…}, stat:{hp:[…], atk:[…], …, acc:[…], eva:[…]} }
G.ENCOUNTERS = { 'kanto-route-1-area': { loc:'kanto-route-1', ver:'firered',
                 walk: { rate:21, mons:[[16,3,3,35],[19,3,3,35], …] /* [dex, min level, max level, chance %], sums to 100 */ } } }
G.DEX_TEXT = { mon:{1:[6 texts]}, move:{tackle:[…]}, item:{potion:[…]} }
```
- **Encounter methods** use PokeAPI names: `walk` (tall grass and caves), `surf`,
  `old-rod`, `good-rod`, `super-rod`, `rock-smash`.
- **Area keys** for the slice:
  - `kanto-route-1-area`
  - `kanto-route-22-area`
  - `kanto-route-2-south-towards-viridian-city`
  - `kanto-route-2-north-towards-pewter-city`
  - `viridian-forest-area`
- **Growth rate names** are PokeAPI's: `slow`, `medium` (medium-fast), `fast`,
  `medium-slow`, `slow-then-very-fast` (erratic), `fast-then-very-slow` (fluctuating).
- **`meta.k`** (PokeAPI move category) is one of:
  - `damage`, `ailment`, `net-good-stats`, `heal`
  - `damage-ailment`, `swagger`, `damage-lower`, `damage-raise`, `damage-heal`
  - `ohko`, `whole-field-effect`, `field-effect`, `force-switch`, `unique`
- **`meta.ail`** includes the volatile ailments:
  - paralysis, sleep, poison, burn, freeze, confusion, infatuation, trap, leech-seed,
    disable, yawn, nightmare
  - plus some unusual ones (`unknown`, `no-type-immunity`, `perish-song`, `ingrain`,
    `torment`, `protect`) that the engine may treat as unique.
- **Recoil** is a negative `meta.drain`. Struggle instead has `meta.heal: -25` (it loses
  1/4 of max HP).

**`js/data/item-effects.js`** is hand-written: `G.ITEM_FX[item]` describes what an item
does and its shop price (sell = half). The full key list is in the file's header. Examples:
`potion:{heal:20,field:1,battle:1,price:300}`, `'great-ball':{ball:1.5,battle:1,price:600}`,
`'full-heal':{cure:'all',…}`, `'thunder-stone':{evo:1,field:1,price:2100}`,
`'x-attack':{stage:['atk',1],battle:1}`, `repel:{repel:100,…}`, `'oaks-parcel':{key:1}`.

`tests/data.test.cjs` checks all of this, including the growth tables and the slice's
encounter areas.

## 3. Battle engine: `js/battle/` (M2 ✅)

It is pure and deterministic, runs in node, and never touches the DOM. **Built** — what exists:

| File | Module | What it does |
|---|---|---|
| stats.js | `G.Stats` | `calc(base, lvl, ivs, evs, nature)`, `expAt`, `levelFor`, `stage(s)`, `accStage(s)` |
| mon.js | `G.Mon` | `create(sp, lvl, {rng, moves, nature, ivs, shinyOdds, ot, ball, met})`, `stats`, `maxHp`, `types`, `name`, `heal`, `recalc`, `learn(mon, id, slot)`, `knows`, `ppMax`, `defaultMoves`, `movesAt` |
| damage.js | `G.Damage` | `calc({lvl, pow, atk, def, stab, eff, crit, roll, burn, screen, weather})` |
| effects.js | `G.BattleFx` | `useMove(b, user, target, id, {locked, called})`: the generic interpreter |
| moves-special.js | `G.SpecialMoves` | per-move hooks (see the top of effects.js); `FALLBACK` = deliberately simplified moves |
| items.js | `G.BattleItems` | `canUse`, `use`: potions, status heals, revives, Ethers, X items, Dire Hit, Guard Spec. |
| ai.js | `G.BattleAI` | `choose(b, side)`: `random` (wild), `basic` (trainers), `leader` (heals when low) |
| capture.js | `G.Capture` | `roll({max, hp, rate, ball, status, rng})`, `chance(...)` |
| exp.js | `G.Exp` | `gain`, `addEvs`, `prize(base, lastLevel)`, `blackoutLoss(money)` |
| evolution.js | `G.Evolution` | `candidates(mon, {trigger, item})`, `evolve(mon, to)` → moves to learn now |
| battle.js | `G.Battle` | the turn engine below |
| text.js | `G.BattleText` | `line(event, battle)` → translated text or null; `who`, `trainerName` |

Notes for callers:
- `G.Mon.learn(mon, id)` with four moves and no slot returns `false` and changes nothing:
  ask which move to forget first (TM / move tutor UI).
- A lost battle reports `money: 0`; blacking out costs `G.Exp.blackoutLoss(money)`, applied
  by the overworld.
- No Pokémon left able to fight is a loss even if the foe fainted at the same time.

`tools/sim_battle.js` plays a battle in the terminal. Two-turn moves, recharging and
rampage turns need no input: one `act()` plays them through. When a trainer's Pokémon faints
and `rules.shift` is on, the player gets a `shift` prompt (switch or `-1`). A caught Pokémon
is pushed to the party (or `result.toBox` when it is full, with `result.mon`). Nicknames
and the PC are the UI's job after the battle. Exact event fields are in battle.js / effects.js;
every event type has a line (or a deliberate null) in text.js, checked in all languages.

What follows is the original spec, still accurate in its rules.

**Mon instance** (a plain object, saved as it is):
```js
{ uid:'k3f9a', sp:4, nick:null, lvl:5, exp:135, hp:20, status:null /* psn|tox|brn|par|slp|frz */, slp:0, tox:0,
  moves:[{ id:'scratch', pp:35, ppUp:0 }], ivs:[6], evs:[6], nature:'adamant', gender:'m'|'f'|null, shiny:false,
  friendship:70, ball:'poke-ball', ot:{ name, id }, met:{ map, lvl }, item:null, ability:null }
```

**Modules**
- **stats.js**
  - Gen 3 formulas: HP = `floor((2B+I+floor(E/4))·L/100)+L+10`; other stats =
    `floor((floor((2B+I+floor(E/4))·L/100)+5)·nature)`.
  - `expAt(gr, lvl)`, `levelFor(gr, exp)`.
- **mon.js**
  - `create(sp, lvl, {rng, wild})`: rolls IVs, nature and gender. Shiny is 1/4096. Moves are
    the last 4 level-up moves at or below its level.
  - `learnable(mon, from, to)`, `learnMove(mon, move, slot)`, `heal(mon)`.
  - `recalc(mon)`: HP rises by as much as max HP rises.
- **damage.js**
  - `calc({atk, def, move, crit, roll, stages, burn})` returns `{dmg, eff, crit}`.
  - Base: `floor(floor(floor(2L/5+2)·P·A/D)/50)+2`. Then, rounding down at each step:
    crit ×1.5, random 85–100%, STAB ×1.5, type multiplier, burn ×0.5 (physical moves only).
  - At least 1 unless the target is immune. A crit ignores the attacker's negative stages
    and the defender's positive ones.
- **Stages, accuracy and order**
  - Stat stages run ±6, multiplier `max(2,2+s)/max(2,2-s)`.
  - Accuracy and evasion stages use 3/(3−s) and (3+s)/3.
  - Turn order: switch, item and run first; then priority; then speed (halved by
    paralysis); ties go to the RNG.
- **Statuses**
  - Paralysis: fully paralysed 25% of the time.
  - Sleep: 1–3 turns.
  - Freeze: thaws 20% of the time each turn; a damaging Fire move also thaws the target.
  - Poison: 1/8 per turn. Bad poison: n/16, reset by switching. Burn: 1/16.
  - Confusion: 2–5 turns, hits itself 33% of the time (typeless, 40 power, physical).
  - Flinch only works if the user moved first.
  - Type immunities: Fire can't be burned, Electric can't be paralysed, Poison and Steel
    can't be poisoned, Ice can't be frozen, and Grass is immune to powder moves.
  - End-of-turn order: Leech Seed, then poison and burn, then trapping damage.
- **effects.js**: a generic interpreter keyed by `meta.k`.
  - `damage`: `drain` above 0 heals the user, below 0 is recoil.
  - `ailment`, `damage+ailment`: a chance of 0 means 100%.
  - `net-good-stats` (target taken from `tgt`), `damage+lower`, `damage+raise`.
  - `heal`, `swagger`, `ohko`, `force-switch`.
  - Multi-hit: 2–5 hits weighted 35/35/15/15.
- **moves-special.js**: hand-coded families.
  - Two-turn moves (Solar Beam, Dig, Fly, Skull Bash, Sky Attack, Razor Wind) and recharge
    (Hyper Beam).
  - Rampage (Thrash, Petal Dance).
  - Fixed damage (Sonic Boom, Dragon Rage, Seismic Toss, Night Shade, Super Fang, Psywave).
  - Self-KO (Self-Destruct, Explosion).
  - Rage, Rapid Spin, Mirror Move, Focus Energy, Light Screen, Reflect, Mist, Haze, Toxic,
    Rest, Substitute.
  - Struggle: 50 power, recoil 1/4 of max HP, never misses.
- **Fallback** for a move nobody implemented: with power it does plain damage; without
  power it says "But nothing happened!". A test lists every move that falls back.
- **capture.js**
  - `a = floor((3M−2H)·rate·ball/(3M))·status`; status is ×2 for sleep or freeze and ×1.5
    for the others. `a ≥ 255` always catches.
  - Otherwise `b = floor(1048560/floor(√floor(√floor(16711680/a))))`, then 4 checks of
    `u16 < b`. Shakes shown = min(3, checks passed).
- **Running away**: always works if your Pokémon is faster; otherwise
  `F = floor(Sp·128/Sf)+30·attempts`.
- **exp.js**
  - EXP: `floor(floor(b·L/7)·(trainer?1.5:1))`, split evenly between the Pokémon that took
    part and are still standing. EVs are gained with it.
  - Prize money: class base × level of the trainer's last Pokémon. Blacking out costs half
    your money.
- **evolution.js**: `candidates(mon, {trigger:'level'|'item', item})`, `evolve(mon, to)`.
  Stats are recalculated, and the new form's moves at the current level are queued.
- **ai.js**: `random` for wild Pokémon; `basic` (expected damage × effectiveness, skips
  pointless status moves); `leader` (basic, plus a potion below 25% HP).

**API** (an internal task queue: a prompt pauses it and an answer resumes it):
```js
const b = G.Battle.create({ kind:'wild'|'trainer', seed, player:{ name, party, bag },
  foe:{ party:[mon], trainer:{ id, cls, name, ai:'basic', items:{} } | null }, rules:{ canLose:false } });
b.start()      // → events[]
b.prompt       // {kind:'action'} | {kind:'switch',forced} | {kind:'learn',uid,move} | {kind:'nickname',uid} | null
b.options()    // {moves:[{id,pp,max,disabled}], switchable:[i], canRun, canBag}
b.act({type:'move',slot} | {type:'switch',to} | {type:'item',item,target} | {type:'ball',item} | {type:'run'})   // → events[]
b.answer({learnSlot:0..3|-1} | {switchTo:i} | {nick:'…'|null})                                                   // → events[]
b.result       // {outcome:'win'|'lose'|'run'|'caught', caught, money, leveled:[uid], evo:[uid]}
```

**Events** (the UI plays them one by one):
- Flow: `intro`, `send{side,slot}`, `switch{side,to}`, `run{ok}`, `end{outcome}`.
- Moves and damage: `move{side,move}`, `miss`, `fail`,
  `damage{side,amt,hp,max,eff,crit,hit,hits}`, `faint{side}`, `recoil`, `heal{side,amt}`.
- Statuses and stats: `status{side,s}`, `cure`, `statusTick{side,s,amt}`,
  `stage{side,stat,delta,capped}`, `volatile{side,v}`.
- Catching and rewards: `ball{item,shakes,caught}`, `exp{uid,amt}`,
  `levelup{uid,lvl,before,after}`, `learned{uid,move}`, `learnPrompt{uid,move}`, `money{amt}`.
- Text: `msg{key,vars}`, where the key is an English i18n key.

Battle-only state lives in a `BattleMon` wrapper (stages, volatiles, types, last move,
participants). The real mon objects only change HP, PP, status, EXP, EVs, level and moves.

## 4. Overworld: `js/world/`, `js/script/`, `js/ui/dialog.js` (M3 ✅)

**Built** — what exists (the original spec follows and is still accurate):

| File | Module | What it does |
|---|---|---|
| maps.js | `G.Maps` | `def`, `get(id)` (parsed, cached), `parse`, `validate(id)`, `all`, `has`; tile queries `kindAt`, `kindNear` (looks into connected maps), `open`, `ledge`, `info(kind)`, `spot(map, name \| 'x,y,dir' \| [x,y,dir])`, `neighbour(map, side)` / `neighbours` / `across(map, x, y)`, `species(slug \| dex)`, `encounters(map, method)`; `center(id, {exit, loc})`, `mart(id, {exit, loc, stock})`; `TS = 32` world units per tile |
| tiles.js | `G.Tiles` | `PALETTES` (kanto, forest; house, center, mart, lab, gym), `bakeMap(map)` → `{ground:[2 frames], strips, below}`, `border(map)`, `sprite('tree' \| 'tuft' \| 'ball')`, pixel helpers `Pix, pack, shade, disc, outline, ascii` |
| stamps.js | `G.Stamps` | `get(type, doorColumn, {x, y})` → `{canvas, w, h, door, solid, up}`; house roofs take one of 4 colours by position |
| people.js | `G.People` | `TYPES` (the 14 archetypes), `draw(ctx, who, dir, frame, x, y, k)`, `sheet(who)`, `portrait(who, k=4)`, `check()` |
| player.js | `G.Actor`, `G.Player` | an actor on the grid (`step`, `place`, `face`, `emote`, `draw`); the player's controls (keys, run, turn, bump, click / tap walk) |
| path4.js | `G.Path4` | `find(from, goals, {open, ledge, near})` → `{dirs, goal, reached}`; `parse('UULR')` |
| field.js | `G.Field`, `G.World` | the state (below) and the `'overworld'` mode |
| render.js | `G.WorldRender` | `prepare(map)`, `draw(ctx, view, scene)`, `extra` (debug overlays) |
| script.js | `G.Script` | `def(name, cmds)` / `def({…})`, `get`, `all`, `run(cmds, host)`, `check(cmds)` |
| ui/dialog.js | `G.Dialog` | `say(text, {name})`, `ask(text, {options, name})` → index, `open`, `tick(dt)` (called by the overworld each frame), `instant` |
| debug.js | `G.Debug` | URL flags and keys below; `win` and `catchNext` for the battle UI |
| content/sandbox.js | — | `?debug&map=sandbox`: a test town (dev only, `data-dev`): every tile, a house with an upstairs, a Center, a Mart, ledges, grass, a pond, NPCs, a trainer, items, a trigger, a connection north |

- **Starting:** `G.World.start({ map, spot })` (or `{ map, x, y, dir }`) switches to the overworld.
  Returning from a battle: `G.Game.setMode('overworld')` with no argument resumes as it was.
- **State until M5:** `G.Field` holds a save-shaped object (section 6): `save`, `bind(save)` (M5
  calls it with the real save; until then a fake party with a Pikachu Lv. 5), `flag/setFlag/clearFlag`,
  `getVar/setVar`, `isDone/markDone('map:id')`, `party`, `lead` (first Pokémon able to fight: the
  follower), `giveMon(sp, lvl)` (uses `G.Mon.create`; PC box when the party is full), `count`,
  `giveItem`, `takeItem`, `money(delta)`, `healAll`, `badge(n)`, `test(cond)`, `vars()`. The player's
  map, x, y, dir are written to `save.player` after every step; `player.lastHeal` by the nurse.
- **Battles:** the world calls `G.BattleUI.wild(player, sp, lvl, opts)` and `G.BattleUI.trainer(player,
  trainer, opts)` itself, with `player = { name, id, party, bag }` from `G.Field.save`, `opts = { bg:
  map.battleBg, returnMode: 'overworld', rules: { canLose, where: map.loc } }` and the trainer as
  `{ id: 'map:id', name, title (class label), who, cls, ai, prize, items, leader, team }`. It applies
  the result: prize money, `seen` and caught to the Pokédex, a caught Pokémon with `toBox` to the PC.
  `'lose'` without `canLose` blacks out (half the money, heal, warp to `lastHeal`). After a won
  trainer battle the world says the trainer's `defeat` line (the battle screen does not).
  A game can replace the calls with `G.World.onEncounter = async (sp, lvl, area, info) => result`
  and `G.World.onTrainer = async (trainerDef, { map, key, canLose }) => result` (a result object or
  just its outcome). With neither, a toast stands in and counts as a win.
  Debug: `?debug&wild=…` without `map` is the battle screen's own test battle; with `map=…` the wild
  battle starts from the overworld.
- **Extra map fields:** `enter` (script run after arriving by warp), `items[].hidden` (found by facing
  it and pressing A) and `items[].n`, npc/trainer `if` (conditions: shown only while true), `fixed`
  (does not turn to face you), `move: 'still' | 'look' | 'wander' | 'spin'` with `r` (wander radius,
  default 2), trainer `name` (shown as "Class Name" over the box; the class label comes from
  `G.TRAINER_CLASSES[cls].name` or the prettified cls), trainer `afterScript`. Items are stored as
  done `map:flag`, trainers as `map:id`.
- **Script commands added:** `['found', item, n, doneKey]` (item ball), `['lastHeal', spot]`,
  `['addVar', k, n]`, `['place', who, x, y, dir]`, `['js', fn]`. `say` takes `{ name, vars }`;
  `choice` is `['choice', text, [yes], [no], { options, name }]`. `dex('give')` sets the flag
  `has-pokedex`. The full list is at the top of script.js; `G.Script.check` validates arguments.
- **Shop and PC:** the scripts call `G.ShopUI.open(stock)` and `G.PCUI.open()` (M5) and await
  them; until they exist a "Coming soon" toast. The menu button and Start call `G.StartMenu.open()`
  (M5), else the Settings.
- **Music:** a map's `music` is a context; the world plays `G.MUSIC_MAP[ctx]` (or `.get(ctx)`, M7),
  else a song of that name, else a built-in guess (town → village, route → forest...).
- **Sounds used** (silent until M7 adds them): `bump`, `door`, `ledge`, `grass`, `exclaim`, `cry`, `pc`.
- **Debug keys** also include **F3**: the map id, the player's tile and a grid.

**Map files** (`js/content/kanto/<area>.js`, M6) hold the maps, scripts and trainers of one area:
```js
G.Maps.def({ id:'pallet', loc:'pallet-town', tileset:'outdoor', palette:'kanto', music:'town', battleBg:'grass', border:'T',
  rows:[ 'TTTTTTTTT..TTTTTTTTT', 'T........,,........T', 'T.HHHH...,,...HHHH.T', … ],
  connect:{ north:{ map:'route1', offset:0 } },
  warps:[ { x:3, y:4, to:'player-1f', spot:'door' } ],
  spots:{ 'player-door':[3,5,'down'] },
  signs:{ '6,4':"{player}'s house" },
  npcs:[ { id:'girl', who:'lass', x:4, y:7, move:'wander', r:2, say:'Even small Pokémon get strong if you train them.' } ],
  trainers:[ { id:'rick', who:'bugcatcher', cls:'bug-catcher', x:6, y:20, dir:'right', sight:4,
               team:[['weedle',6],['caterpie',6]], before:'…', defeat:'…', after:'…' } ],
  items:[ { x:2, y:9, item:'potion', flag:'forest-potion-1' } ],
  triggers:[ { x:9, y:1, w:2, h:1, if:['!got-starter'], script:'pallet.oak-stops-you' } ],
  encounters:{ walk:'@kanto-route-1-area' } });
```

**Legend: outdoor**
- Ground you can walk on:
  - `.` grass
  - `,` path
  - `:` sand
  - `"` tall grass (encounters)
  - `f` flowers
- Blockers:
  - `T` tree
  - `#` cliff
  - `~` water
  - `F` fence
  - `S` sign
- Ledges `v` `<` `>`: you can only jump them one way.
- Buildings, drawn as stamps:
  - `H` house 4×3
  - `C` Pokémon Center 5×4
  - `M` Mart 4×3
  - `G` Gym 6×5
  - `L` lab 6×4
  - `D` is the door inside a stamp; every `D` needs a warp

**Legend: indoor**
- Walls and floors:
  - `W` wall
  - `_` wood floor
  - `+` tile floor
  - `r` rug
- Furniture:
  - `=` counter (you talk across it)
  - `b` shelf
  - `t` table
  - `p` plant
  - `P` PC
  - `h` healing machine
- Exits: `X` exit mat and `^` stairs, both warps.
- `G.Maps.center(id, {exit})` and `G.Maps.mart(id, {exit, stock})` build the standard interiors.

**Modules**
- `maps.js`: `def`, `get`, `parse` (a kind grid plus a solid mask, and stamp footprint
  checks), `validate`. `tools/map_check.js <id>` prints a map with its objects and errors.
- `tiles.js` (from PokéGo): `PALETTES` instead of biomes, and `bakeMap(map)` paints the
  whole map once at 16 px per tile. Wall and water autotiling are reused. New painters:
  path, sand, tall grass (base plus a front tuft), ledge, fence, flowers, and the indoor
  floor, wall, counter and rug.
- `stamps.js`: `G.Stamps.get(type, variant)` returns `{canvas, w, h, door:[dx,dy], solid}`.
  Stamps are drawn as Y-sorted props, so you can walk behind a roof. Center and Mart signs
  use icons, not letters.
- `people.js`: 16×24 trainer and NPC sprites from ASCII templates and palettes.
  - Directions down, up and left; right is left mirrored. 3 frames each.
  - Archetypes: player-boy, player-girl, rival, oak, mom, nurse, clerk, youngster, lass,
    bugcatcher, camper, brock, guide, oldman.
  - The front frame is drawn at 4× for trainer battle intros.
- `render.js`: the baked map, connected neighbour maps, the `border` fill, Y-sorted
  props and actors, and the tall-grass front tuft.
- `player.js`
  - 4-direction grid steps at 4 tiles/s, 8 when running. A short key press turns on the spot.
  - **Click / tap to walk:** a left click or a tap on the map (`G.Input.clicks()`, canvas px
    → world via `G.Camera`) walks there along a 4-neighbour path (`path4.js`), step by step
    with the same rules (encounters, trainers, ledges only downhill). Clicking a person,
    sign or item walks next to it, faces it and presses A. Any key or a new click cancels the
    walk. This is how phones play: there are no on-screen buttons.
  - A small menu button in a corner of the overworld (also clickable with the mouse) opens
    the start menu, so phones can reach it.
  - Bump sound, 2-tile ledge hop with a shadow, fade for warps, seamless map connections.
  - Tall grass rolls for an encounter on each step (about `rate/180`); trainers check
    their line of sight after each step.
  - The camera snaps to the player.
- **Follower:** the lead Pokémon walks one tile behind you with its PMD Walk animation.
  The `follower` setting turns it off.
- `script.js`: `await G.Script.run(cmds, host)`. Commands:
  - Text and logic: `say`, `choice`, `if(flag|var,[then],[else])`, `call`, `end`.
  - State: `setFlag`, `clearFlag`, `setVar`, `badge(n)`, `dex('give')`.
  - Party and bag: `giveMon`, `giveItem`, `takeItem`, `money`.
  - Battles and services: `battle(trainerRef,{canLose})`, `wild(sp,lvl)`, `heal`,
    `healAnim`, `shop([items])`, `pc`.
  - Actors and the map: `move(actor,'UULL')`, `walkTo`, `face`, `emote(actor,'!')`,
    `show`, `hide`, `warp(map,spot)`.
  - Presentation: `fade`, `wait`, `music`, `sfx`, `jingle`.
  - Flags are kebab-case strings. Defeated trainers and collected items are stored as `map:id`.
- `dialog.js`: a DOM box (`translate="no"`) that types text one code point at a time (CJK
  safe), shows a blinking ▼, splits long text into pages, and has Yes/No choices with an
  optional speaker name. A finishes the line, then advances; so does a click or tap on the box.
- `debug.js` (dev only):
  - URL: `?debug&map=…&spot=…&party=charmander:9,pidgey:7&items=poke-ball:10&flags=a,b&badges=1&seed=42&fast&noenc&wild=caterpie:6&trainer=pewter-gym:brock`.
  - Keys: F2 heal, F4 encounters on/off, F6 win, F7 next ball catches, F8 walk through
    walls, F9 print the save.

## 5. UI (M4 ✅ battle, M5 menus)

**Battle screen (built):**
- `G.BattleUI.start({ kind, player: { name, id, party, bag }, foe: { party, trainer }, seed, bg, rules, music,
  returnMode, returnArg })` returns a Promise of the engine's result. Evolutions (with cancel)
  and the moves the new forms learn are already done by then.
- Shortcuts for the overworld: `G.BattleUI.wild(player, sp, lvl, opts)` and
  `G.BattleUI.trainer(player, { id, name, title, ai, prize, items, leader, team: [[sp, lvl, moves?]] }, opts)`.
- Music: `opts.music`, else `G.Audio.context('wild' | 'trainer' | 'gym')` when M7 provides it,
  else volcano / boss / rift. `trainer.leader` marks gym leaders.
- `G.EvolveUI.run(mon, to)` returns `Promise<boolean>` and sets mode 'evolve'; the caller restores
  its own mode. `G.LearnUI.teach(mon, move, say)` and `chooseForget(mon, move)` work outside battle.
  `G.BattleUI.TextBox(el)` is a reusable typewriter box.
- Not done yet: nicknaming a caught Pokémon, sending it to the PC when the party is full
  (`result.toBox`, `result.mon`: M5), and trainer sprites in the intro (`people.js` from M3).
- Debug: `dev.html?debug&wild=sp:lvl[,sp:lvl]` or `&vs=...` (trainer), plus `&party=`,
  `&items=`, `&seed=`, `&leader`, `&bg=cave`.


- **Canvas:** the overworld, the battle scene (foe at dir 7 on the top-right platform,
  yours at dir 3 bottom-left), the evolution scene.
- **DOM, inside `#frame`:**
  - Battle HUD: the foe's box at the top left and yours at the bottom right, CSS HP bars
    (green above 50%, yellow above 20%, red below), an EXP bar, the text box, a 2×2 action
    menu, and a 2×2 move menu with PP and type.
  - Screens: title, slots, name entry, start menu (Pokédex, Pokémon, Bag, Player, Save,
    Options), party, summary, bag (pockets, use, give, toss, TM teaching), Pokédex, PC
    boxes, shop, options, learn move, nickname, credits.
- **Battle animation**, by move category:
  - Physical: the attacker's Attack plus the target's Hurt and a flash.
  - Special: Shoot plus a projectile in the type colour.
  - Status: Charge plus sparkles.
  - Cries are synthesised from the dex number.

## 6. Save: `js/core/store.js` (M5)

- **Keys:** `pl.save.1` to `pl.save.3`. Before each write the old save moves to
  `pl.save.N.bak`. `pl.slot` holds the last slot used.
```js
{ v:1, app:'PokeLeague', created, savedAt, playTime,
  player:{ name, gender, id, money, badges:[], map, x, y, dir, lastHeal:{ map, spot } },
  rival:{ name, starter }, party:[mon], boxes:[[mon|null ×30] ×8], box:0, bag:{ potion:2 },
  dex:{ seen:{16:1}, caught:{4:1} }, flags:{}, vars:{}, done:{ 'route2:rick':1 } }
```
- `migrate(s)` runs `while (s.v < V) MIG[s.v++](s)`, then sanitises the shapes.
- Export writes `{ app:'PokeLeague', kind:'save', v, at, save }` to a JSON file. Import
  rejects other apps, newer versions and bad shapes, then asks before overwriting.
- Saving only happens in the overworld, never during a battle.

## 7. Audio (M7 ✅)

- `G.Audio.context(name)` plays the theme of a context; maps and scripts name a context,
  never a song. `music-map.js` (`G.MusicMap`): title → title, town and lab → village,
  center and mart → center, route → forest, forest → cave, cave → cave, wild → volcano,
  trainer and rival → boss, gym → rift, victory-wild, victory-trainer (and victory-gym),
  evolution, league → judgment, silence → null. An unknown context is reported and ignored.
- `await G.Audio.jingle(name)` plays a `once:true` song over the music bus: the theme fades
  out, the jingle plays to its last step, then the theme comes back at the beat where it
  stopped (a theme asked for meanwhile starts instead). It resolves true at the end, false
  when another jingle cuts it or no sound can play (at once), so scripts never hang.
  Jingles: heal, levelup, caught, item, badge, evolved.
- New loops: title, center, evolution, victory-wild, victory-trainer. New instruments:
  brass, keys, tom, crash; melodies can hold chords (`C4+E4+G4:8`).
- `G.Audio.cry(dex, {faint, pitch, vol})` → Promise (ends with the cry). The shape comes from
  the evolution family, the pitch and length from the weight, the timbre from the types: the
  same dex always sounds the same. Also `sfx('cry', dex)`.
- Extra SFX: overworld bump, door, warp (stairs, exit mats), ledge, exclaim (a trainer spots
  you), encounter; battle miss, statUp, statDown, status, run, throw, pop (send out), recall,
  lock (the ball clicks shut), shine (badge or item glint), expTick (pass how full the bar
  is, 0..1), lowHp; menus save, pcOn, pcOff. `G.Audio.alarm(true|false)` repeats lowHp.

## 8. Tests (`node --test tests/*.test.cjs`, vm sandbox via `tests/helpers.cjs`)

- **data** (exists): 151 species, stats, types, evolutions, learnsets, TMs, moves, growth
  tables, item effects and prices, natures, names, texts and the slice's encounter areas.
- **stats:** Bulbapedia's Garchomp example (289/278/193/135/171/171).
- **damage:** type chart, STAB, crit and stage rules, burn, minimum 1.
- **effects:** Growl ±6 cap; Thunder Wave on Ground and Electric; powder moves on Grass;
  Leech Seed; Quick Attack priority; flinch only when moving first; multi-hit distribution;
  drain and recoil; Struggle; every move is handled or on the fallback list.
- **capture:** statistics, Master Ball.
- **exp:** formula, participants, learn prompt.
- **evolution:** Caterpie at 7, Metapod at 10, Thunder Stone, trade conversion, cancel.
- **battle:** the same seed and choices give the same event log; forced switch; no
  running from trainers; blackout.
- **maps:** warps, spots and connections resolve; the legend; footprints; scripts;
  encounters.
- **i18n:** placeholders and languages (exists).
- **save:** `pl.` keys, `.bak`, migrate, import checks.
- **story:** a headless run of the slice reaches the Boulder Badge.
- **lint** (exists): dev.html and files match; no `Math.random` in battle; `pl.` keys;
  licence present.

## 9. Milestones and file ownership

Sessions in parallel each own their files, so nobody edits the same file. Shared files
(`dev.html`, `CLAUDE.md`, this document) change only to register something new, in a
small separate edit.

| # | Owns | Done when |
|---|---|---|
| M0 ✅ | core/, ui/ui.js, ui/title-ui.js, ui/options-ui.js (settings), game.js, main.js, tools/build*, tests/helpers + core/i18n/lint, css/base.css, the settings part of css/menus.css | title in 7 languages, settings, tests pass, build works |
| M1 ✅ | tools/fetch_data.py, js/data/{species,moves,items,growth,names,encounters,dex-text,natures,item-effects}.js, tests/data.test.cjs | `G.SPECIES[1]` etc. in the console; data tests pass |
| M2 ✅ | js/battle/* (incl. items.js, text.js), tools/sim_battle.js, js/i18n/<lang>/battle.js, tests/{stats,damage,effects,capture,exp,evolution,battle}.test.cjs | `node tools/sim_battle.js charmander:5 bulbasaur:5 --seed 1` prints a battle |
| M3 ✅ | js/world/*, js/script/*, js/ui/dialog.js, js/debug.js, css/world.css, tools/map_check.js, tests/maps.test.cjs, js/content/sandbox.js, js/i18n/<lang>/world.js | walk, doors, ledges, signs, connections, talk to NPCs |
| M4 ✅ | js/ui/{battle-ui,battle-fx,learn-ui,evolve-ui}.js, css/battle.css, js/i18n/<lang>/battle-ui.js, tools/serve.py | `dev.html?debug&wild=pidgey:3` is playable |
| M5 | js/core/store.js, js/ui/{name-ui,start-menu,party-ui,summary-ui,bag-ui,dex-ui,pc-ui,shop-ui}.js, css/menus.css (append; settings styles exist), tests/save.test.cjs | the full menu flow, slots, export and import; the start menu has Settings (G.OptionsUI.open) |
| M6a–d | js/content/kanto/<area>.js, js/data/trainer-classes.js, js/i18n/<lang>/kanto-<area>.js | each area plays via `?debug&map=…` |
| M7 | js/core/audio.js (jingles, cries), js/data/music.js, js/data/music-map.js | jingles on heal and level up |
| M8 | integration, js/ui/credits-ui.js, tests/story.test.cjs | Pallet Town to the Boulder Badge |

- **Can run in parallel:**
  - After M0: M1, M2, M3 and M7.
  - After M2 and M3: M4 and M5.
  - After M3 (map format fixed): M6a–d.
- **Each module's translations** go in `js/i18n/<lang>/<module>.js`: battle, world, menus,
  kanto-pallet…

## 10. After Brock

1. **Rest of Kanto:**
   - Route 3, Mt. Moon, Cerulean and Misty, Nugget Bridge, Bill.
   - Vermilion, the S.S. Anne and Lt. Surge.
   - Rock Tunnel, Lavender and the Pokémon Tower.
   - Celadon, Erika and the Rocket Hideout.
   - Saffron, Silph Co. and Sabrina.
   - Fuchsia, the Safari Zone and Koga.
   - Cinnabar, Blaine, then Giovanni.
   - Victory Road, the Elite Four, the Champion and the Hall of Fame.
   - Engine features along the way: field moves (Cut, Surf, Strength, Flash, Fly), the
     bike, fishing, more TMs, abilities, held items, weather, Exp. Share, Repel steps,
     legendaries.
2. **Johto:** `fetch_data.py --region johto` (dex 1–251), plus day and night, friendship
   evolutions, berries, new palettes and buildings. Kanto teams carry over, but high levels
   disobey until you earn badges.
3. **Hoenn:** abilities, double battles, weather.
