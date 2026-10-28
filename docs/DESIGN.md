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
| `G.Names` | `mon(id), move(id), item(id), type(id), loc(id), nature(id), genus(id), stat(id), pretty(id)`. Reads `G.NAMES` (M1); falls back to English, then to a readable id. `desc('mon' \| 'move' \| 'item', id)` = the Pokédex entry or description (`G.DEX_TEXT`) |
| `G.Settings` | `get, set, on(fn), all, touch` (touch = phone or tablet). Keys: textSpeed (slow/mid/fast), battleAnim, battleStyle (shift/set), follower, gamepad, padRumble, calm |
| `G.Audio` | `music(name), sfx(name), setVolume, toggleMute, unlock, canPlay`, plus `_internals` for jingles (M7). Unknown SFX names are ignored |
| `G.Input` | raw keys and pointer: `held(code), tap(code), virtual(code), mouse(), clicks(), endFrame()`. Pointer buttons are codes `mouseleft` / `mouseright`; `clicks()` = this frame's left clicks or taps on the canvas, `[{x, y, touch}]` in canvas CSS px |
| `G.Btn` | logical buttons up/down/left/right/a/b/start/select: `held(b)` (`'run'` = B or Shift), `pressed(b)`, `repeat(b)`, `dir4()`, `any()`, `swallow()`, `set(source, b, on)`. Keys: WASD/arrows; A = Space, Enter, E, Z; B = X, Backspace, right click; Start = Esc, C |
| `G.Nav` | spatial DOM menu navigation: `step(dir), press(), back(), focusFirst(el), hide(), topScreen(), focused`. A screen may take a direction itself: `screen.onNavStep(dir, focused)` returning true (amounts, pages, pockets) |
| `G.Pad` | the controller; feeds `G.Btn`. There are **no on-screen buttons**: phones play by tapping (see section 4) |
| `G.Sprites` | `PX=2, Animator(dex, scale, shiny)` with `.dir .loop(anim) .play(anim, {hold}) .update(dt) .draw(ctx, x, y, {flash, softFlash, alpha})`; also `preload(dexes)`, `drawShadow`, `bodyHeight`, `DIR4`, `hasShiny`. Rows: 0 Down … 3 UpRight … 7 DownLeft |
| `G.Camera` | `VIEW_W=480, VIEW_H=320` (15×10 tiles of 32), `resize, snap(x,y), follow, kick, apply(ctx), left(), top(), sees()` |
| `G.Types` | `LIST, CHART, eff(atkType, defTypes), label(m)` |
| `G.UI` | `open(id, {onBack, focus}), close(id), closeAll(), isOpen, anyOpen, top, toast(msg), typeChips(types), sprite(cv, dex, opts), spriteCanvas(...)` |
| `G.Game` | `define(name, {enter, exit, update(dt, {ui}), render(ctx, view, dt)}), setMode(name, arg), mode, view {w, h, dpr}, canvas` |
| `G.TitleUI` | `open()`. Continue and New game call `G.NewGame.continue()` / `.start()` (M5) |
| `G.OptionsUI` | Settings like PokéGo's: `open(tab)` with tabs game (language, text speed, battle animations, battle style, follower), sound (music, effects, mute), controls (keyboard, mouse, phone, controller), display (full screen, less shaking); `close()`; `muteButton(el)` makes a quick mute toggle. The start menu (M5) opens it too |

- **Frame:** `#frame` is a 3:2 box holding `<canvas id="game">` and every `.scr` screen.
  Inside it, CSS `em` follows the frame width (container units).
- **Input:** while a DOM screen is open, `game.js` sends the buttons to `G.Nav`, and the
  mode's `update` gets `{ ui: true }`. A screen with `data-noinput` (for example a dialog
  box that reads `G.Btn` itself) is skipped by Nav.

## 2. Data: `tools/fetch_data.py` (M1 ✅)

```
python tools/fetch_data.py --region kanto            # dex 1-151 (about 1,200 requests the first time)
python tools/fetch_data.py --region johto            # dex 1-251, Kanto and Johto places (what js/data/ holds now)
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
    newest entry.
  - Johto: `dex (1,251)`; learnsets FRLG first for 1-151, HGSS first for 152-251
    (`learnset_vg_from`; Emerald's lists for Johto Pokémon are older and slower); TMs still FRLG;
    text adds HGSS. The Generation 4 moves this brings are special-cased (Gyro Ball, Punishment,
    Wring Out) or in FALLBACK. Move tutors: `TUTOR_MOVES` (Headbutt) from HGSS's tutor lists give a
    species its `tu` list (only the species that can learn one).
    `regions` lists each region with its own encounter versions (Kanto: FRLG first; Johto:
    HGSS first); a place with no table there falls back to the other region's versions (Routes 26
    and 27 are `kanto-route-26/27` in PokeAPI but only HGSS has them). Encounter conditions
    `morning` / `day` / `night` give a table its `morning` and `night` lists beside `mons` (the
    day); swarms and the radio are skipped.
- **Evolutions:**
  - Level-up becomes `{how:'level', level}`; a stone becomes `{how:'item', item}`.
  - Trades become `{how:'level', level:37, via:'trade'}`; Kadabra uses 36. A trade holding an
    item becomes using that item: `{how:'item', item:'metal-coat', via:'trade'}` (Steelix,
    Scizor, Slowking, Politoed, Kingdra, Porygon2).
  - Friendship becomes `{how:'friendship', min}`, with `time` ('day' / 'night': Espeon, Umbreon)
    and `move` kept. Tyrogue's three evolutions carry `stats` (Attack vs Defense).
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
  tm:['hm01','tm06', …], tu:['headbutt'] /* move tutors (chapter 13); absent when none */ } }
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
- **State:** `G.Field.save` is the save itself (section 6). `G.Session.begin(slot, save)` binds the
  real one with `bind(save)`; before that (debug URLs) a throwaway one is used, `fake` is true and
  the world gives it a Pikachu Lv. 5. Also `flag/setFlag/clearFlag`,
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
- **Chapter 7 map fields:** `boulders: [{ id, x, y, if, fixed }]` (pushed with Strength; one that
  fell into a pit sets flag `rock:<map>:<id>`; a `fixed` one may lie in water and never moves),
  `bars` (gates, above), `calm` (a condition: fast water becomes water) and `flow`, `encounters.water`
  (an area whose `surf` and rod tables the water of this map uses; a walk area gives them too), and
  people with `swim: true` (they stand in water and are drawn up to the shoulders).
- **Chapter 8 map fields:** `fly: { spot, if }` (a town you can fly to: its landing spot, and a
  condition that counts it as visited in saves older than chapter 8; arriving sets flag
  `visited:<map>`), `bike: true` (Cycling Road: with a Bicycle you are on it there and cannot get
  off), `slope: 'down'` (while riding and letting go you roll that way; riding against it is slow)
  and `noBike: true` (an outdoor map without the Bicycle).
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
  them. The menu button and Start call `G.StartMenu.open()` (M5).
- **Repel:** `save.repel` counts steps; while it is on, wild Pokémon below the lead's level stay
  away; when it runs out the next quiet step says so. `G.Field.toBox(mon)` puts a Pokémon in the
  first free slot from the current box on (healed, like the PC does) and returns the box or -1.
- **Nicknames from scripts:** `['giveMon', sp, lvl, { nickname: true }]` asks "Give a nickname
  to {mon}?" afterwards (the starter, gifts).
- **Music:** a map's `music` is a context; the world plays `G.MUSIC_MAP[ctx]` (or `.get(ctx)`, M7),
  else a song of that name, else a built-in guess (town → village, route → forest...).
- **Sounds used** (silent until M7 adds them): `bump`, `door`, `ledge`, `grass`, `exclaim`, `cry`, `pc`.
- **Debug keys** also include **F3**: the map id, the player's tile and a grid.

**Kanto content (M6), built so far:**
- **M6a** `pallet.js`: `pallet`, `player-1f`, `player-2f` (a new game starts here, spot `start`),
  `rival-house` (Daisy), `oak-lab`; `route1.js`: `route1` (Pallet south, Viridian north once M6b
  connects it). Story flags: `oak-escort` (Oak stops you at the grass and takes you to the lab),
  `lab-intro`, `got-starter`, `lab-rival-battle`, `rival-left-lab`, `got-route1-potion`.
  `save.rival.starter` is the starter strong against yours (Bulbasaur → Charmander → Squirtle →
  Bulbasaur). The first rival battle (`oak-lab:rival-lab`) may be lost. Mom heals the party and
  is the first `lastHeal` (`player-1f:mom`) until a Pokémon Center.
- **M6b** `viridian.js`: `viridian` (Route 1 south, Route 2 north), `viridian-center`,
  `viridian-mart`, `viridian-school`, `viridian-house`; `route2.js`: `route2` (the south half; its
  top-left path enters Viridian Forest once M6c connects it). The errand: the Mart clerk gives
  Oak's Parcel on entering (`got-parcel`; the shop opens after `parcel-delivered`); Oak gives
  the Pokédex (`has-pokedex`) and 5 Poké Balls; Daisy a Town Map (`got-town-map`). An old man
  and his granddaughter block the road north until `has-pokedex`. The Gym is a locked door.
- **M6c** `forest.js`: `viridian-forest` (a maze: in at the bottom from Route 2, out at the top;
  battle background `forest`), five Bug Catchers (Doug, Rick, Anthony, Charlie, Sammy), item balls
  and a hidden Potion; `route2-north` (no wild Pokémon, as in the games) leads to Pewter City.
- **M6d** `pewter.js`: `pewter` (south from Route 2; the road east to Route 3 is closed by a
  worker for now), `pewter-gym` (Camper Liam; Leader Brock: Geodude 12, Onix 14 with Rock Tomb,
  one Potion; prize ₽1400), `pewter-museum`, two houses, `pewter-center`, `pewter-mart`.
  Brock's `win` script gives badge 1 and TM39. `tests/kanto.test.cjs` checks that every map is
  reachable from `player-2f`, the order of the way north, Brock, and that waited-for flags are set.
- **M8** `route22.js`: `route22` west of Viridian (Rattata, Mankey, Spearow), the optional rival
  battle once you have the Pokédex (Pidgey 9 and his starter 8; flag `route22-rival`), and the
  League gate, locked without eight badges. `if: 'scripted'` marks people that only scripts show.
  Brock's Geodude knows Tackle and Defense Curl and he carries no items, as in FireRed.
  After his `win` script, `G.CreditsUI.ending()` shows "Chapter 1 complete!" with the player's
  numbers and party, then the credits, with Save and continue (flag `chapter-1-done`).
  `G.CreditsUI.open()` is the title's Credits; the artists come from CREDITS.md through
  `tools/credits_js.js` (`js/data/credits.js`, made by the build; a lint test checks they agree).
  Render: a map's neighbours are baked a moment after arriving and only drawn (baked) when they
  reach into the view, so crossing onto a long route no longer stalls a frame (about 90 ms → 4 ms).
  Phones: in portrait a hint asks to turn the phone; on touch screens the menu button is 42 px.
- **Engine additions:** a trainer's `win` script runs after a won battle (after the `defeat`
  line), for badges and gifts. A locked door is a warp `{ x, y, locked: script }` (no `to`), or with
  `to` and `if: cond`: walking into it runs `locked` instead of entering. `G.Maps.center(id,
  { npcs })` and `G.Maps.mart(id, { npcs, clerk })` take extra people and the clerk's own
  script. An item with a `script` runs it instead of being picked up and may lie
  on a table (the starter balls; `G.World.refresh()` after marking it done). `say` / `choice`
  speaker names are keys and may use `{player}` / `{rival}` (`{ name: 'Prof. Oak' }`,
  `{ name: '{rival}' }`). People: `daisy`, `aide`. `G.TRAINER_CLASSES` (title, who, prize base:
  youngster, lass, bug-catcher, camper, picnicker, hiker, leader). The rival and other named
  characters have no class: their def has `name` and `prize`.
- **Texts in content files:** `tools/i18n_keys.js` finds `['say' | 'choice', '…']`, the fields
  `say before defeat after text sign name title`, sign texts (`'x,y': '…'`) and `G.T('…')` in
  helper code (`h.say(G.T('…'), { vars })`). Translations go in `js/i18n/<lang>/kanto-<area>.js`;
  trainer classes in `trainers.js`.

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
  - `c` small tree: solid until a Pokémon with Cut clears it (needs badge 2); it grows back
    when you come back to the map
- `=` wooden bridge over water (walkable; Route 12's Silence Bridge)
- `Y` an office tower 8×6 (Silph Co.)
- Chapter 7: `R` a burnt mansion 6×5 (the Pokémon Mansion); `o` a hole in a cave floor (a warp you
  fall through, until a boulder fills it: flag `pit:<map>:<x>,<y>`, floor from then on); `r` fast
  water (solid, its foam drawn by render.js, until the map's `calm` condition holds; `flow` gives
  its direction)
- Chapter 9: `x` a floor switch (a boulder pushed onto it stays for good: flag
  `plate:<map>:<x>,<y>`), `b` a rock barrier (a `bars` gate, drawn as a pile of rocks outdoors),
  `I` the Pokémon League 8×6 (the Indigo Plateau)
- Ledges `v` `<` `>`: you can only jump them one way.
- Buildings, drawn as stamps:
  - `H` house 4×3
  - `C` Pokémon Center 5×4
  - `M` Mart 4×3
  - `G` Gym 6×5
  - `L` lab 6×4
  - `K` Pokémon Tower 5×5, `E` department store 8×5, `B` big building 6×4 (a mansion, a game
    corner, a gate)
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
  - `u` trash can (solid; give it a sign `{ script }` to make it do something)
  - `g` gravestone, `k` hedge (both solid)
  - `s` slot machine, `q` poster on a wall (both solid)
- Chapter 5:
  - `Q` a poster that hides stairs: a warp with `if` and `locked`, drawn as a poster until its
    `if` holds, then as stairs going down (render.js)
  - `e` lift doors in a wall (a warp; the hideout's lift uses locked warps with scripts)
  - spin tiles `U` `D` `L` `R`: stepping on one sends you sliding that way (spinning) until a stop
    tile `o` or something in the way; floor keeps you sliding, another arrow turns you
  - `i` a wall you cannot see (drawn as floor; Koga's Gym)
- Chapter 6: `n` a door with a card slot (solid until the Card Key opens it for good: flag
  `door:<map>:<x>,<y>`; drawn as a prop while closed) and `w` a teleport pad (a warp; its spot is
  the pad it lands on, so arriving never sends you on again)
- Chapter 7: `O` a hole in the floor (as outdoor `o`), `y` a gate of iron bars (open while the rule
  of the map's `bars` rectangle over it holds: `bars: [{ x, y, w, h, if }]`), `j` a statue (solid;
  a sign `{ script }` makes it a switch), `z` a quiz machine (solid; Blaine's Gym)
- Exits: `X` exit mat and `^` stairs, both warps. An exit mat whose warp is `locked` runs its
  script instead (the hideout's lift).
- `G.Maps.center(id, {exit})` and `G.Maps.mart(id, {exit, stock})` build the standard interiors.
- A sign may be `{ script: 'name' }` instead of a text: the script runs with `h.ctx = { x, y }`
  (Bill's machine, Lt. Surge's trash cans). A person may be a Pokémon: `mon: 'clefairy'`
  draws its PMD sprite instead of a trainer sprite.

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
    bugcatcher, camper, brock, guide, oldman, daisy, aide (chapter 1); rocket, supernerd,
    hiker, misty, swimmer (chapter 2); officer, sailor, gentleman, engineer, captain, surge,
    bill (chapter 3); gambler, pokemaniac, beauty, channeler, biker, cooltrainer, erika (chapter 4);
    giovanni, fuji, scientist, fisherman, rocker, birdkeeper, juggler, tamer, koga, warden (chapter 5);
    blackbelt, psychic, sabrina (chapter 6); swimmerf, burglar, blaine (chapter 7); cueball (chapter 8);
    lorelei, bruno, agatha, lance (chapter 9).
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

## 5. UI (M4 ✅ battle, M5 ✅ menus)

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
- After a catch the battle screen adds it to the Pokédex ("{mon}'s data was added…" once the
  player has one), offers a nickname, and says when it went to the PC (`result.toBox`; the
  overworld stores it). An evolution registers the new species in the Pokédex.
- Not done yet: trainer sprites in the intro (`people.js` from M3).
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

**Menus (M5, built).** Each screen builds its own `<section class="scr">` (translate="no") in
`#frame`; G.Nav drives them, B goes back.

| Module | API |
|---|---|
| `G.Popup` (popup.js) | `choose(title, [{ label, value, disabled, back }])` → value \| null · `confirm(text)` → bool · `say(text)` · `count({ title, max, price, money })` → n \| null |
| `G.Menus` (popup.js) | `money(n)` (₽, grouped in the player's language) · `time(secs)` (h:mm) · `badges(list)` (8 gems) · `badgeName(n)` |
| `G.NameUI` | `ask({ kind: 'player' \| 'rival' \| 'mon', gender, mon, cancel })` → name \| null. A text field plus suggestion chips (for controllers); 10 characters |
| `G.SlotsUI` | `pick('load' \| 'new' \| 'save')` → 1..3 \| null; each slot also has Export and Delete, and Import reads a file |
| `G.NewGame` | `start()` (slot, then the professor's welcome in mode 'intro': boy or girl, name, rival's name; saves at once), `continue()`, `resume(save)`, `START` (first existing of player-2f, player-1f, pallet, then the dev sandbox) |
| `G.StartMenu` | `open()`: Pokédex (flag `has-pokedex`, or debug) · Pokémon · Bag · {player} (trainer card) · Save · Settings · Close; `card()`, `save()` |
| `G.PartyUI` | `open()` (Summary, Switch), `pick({ title, note(mon, i), disabled(mon, i) })` → index \| null, `refresh()` |
| `G.SummaryUI` | `open(list, index, onClose)`: Info · Stats · Moves; left / right change the page |
| `G.BagUI` | `open()` (Use / Teach, Toss), `pick({ title, filter, price })` → item (the shop's Sell), `itemLabel(id)` |
| `G.FieldItems` | pure logic: `kind(item)`, `needsMove`, `canUse(item, mon, { move })`, `use(...)` → `{ ok, lines, level, learn, evolve }`, `tm(item)`, `tmFor(mon, item)` → able / unable / learned, `repel(save, item)` |
| `G.Dex`, `G.DexUI` | `seen(sp)`, `caught(sp)`, `counts()`; `open()` |
| `G.PCUI` | `open()` → Promise when logged off: party and the current box (6 × 5), Withdraw / Deposit / Summary / Release |
| `G.ShopUI` | `open(stock)` → Promise: Buy (G.ITEM_FX prices), Sell (half price, not key items or HMs) |

- **Rules chosen:** TMs and HMs are not used up (as in the newer games), so a shop sells each
  once. A stone is only used up when the evolution is not cancelled. Vitamins raise a stat's EVs
  up to 100. Rare Candy: a level, its moves, then the evolution if due. The PC heals what it
  stores. The party always keeps one Pokémon that can battle.

## 6. Save: `js/core/store.js` (M5 ✅)

- **Keys:** `pl.save.1` to `pl.save.3`. Before each write the old save moves to
  `pl.save.N.bak`. `pl.slot` holds the last slot used.
```js
{ v:1, app:'PokeLeague', created, savedAt, playTime,
  player:{ name, gender, id, money, badges:[], map, x, y, dir, lastHeal:{ map, spot }, surf?:1, bike?:1 },
  rival:{ name, starter }, party:[mon], boxes:[[mon|null ×30] ×8], box:0, bag:{ potion:2 }, repel:0,
  dex:{ seen:{16:1}, caught:{4:1} }, flags:{}, vars:{}, done:{ 'route2:rick':1 },
  fame:[{ at, party:[{ sp, lvl, nick, shiny }] }],       // the Hall of Fame (chapter 9)
  daycare:[{ mon, lvl }] }                                // the Day Care (chapter 13): at most two, lvl = level when left
```
- `migrate(s)` runs `while (s.v < V) MIG[s.v++](s)`, then sanitises the shapes.
- Export writes `{ app:'PokeLeague', kind:'save', v, at, save }` to a JSON file. Import
  rejects other apps, newer versions and bad shapes, then asks before overwriting.
- Saving only happens in the overworld, never during a battle.
- **API:** `G.Store.newSave({ name, gender, rival, id })`, `slots()` → summaries (or
  `{ broken: true }`), `load(n)` (falls back to the `.bak`; `usedBackup`), `write(n, save)`,
  `remove(n)`, `lastSlot()`, `exportText(save)`, `importText(text)` → `{ save }` or
  `{ error: 'not-json' | 'other-app' | 'newer' | 'bad' }`, `migrate(s, to, steps)`, `sanitize(s)`
  (every field checked against `newSave()`: unknown species or moves dropped, HP and PP within
  their maximum, a party over six spills into the PC, unknown items dropped), `cleanName(s)`.
- **G.Session** (store.js): `begin(slot, save)`, `slot`, `save(slot?)`. Play time counts the
  seconds the page is visible in the overworld, a battle or an evolution. A new game is written
  at once; after that only the menu's Save writes (no autosave, as in the games).

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
- **story:** a headless run of the slice reaches the Boulder Badge (`tests/story.test.cjs`): the
  real scripts, save and battle engine in the node sandbox; a stand-in host answers the dialog and
  an auto-player fights with its strongest move (Low Kick and other variable-power moves through
  `G.SpecialMoves[id].power`); wild battles raise the party; a lost battle blacks out. It also
  fights every Kanto trainer to the end and prints `[balance]` win rates of each starter alone
  against Brock (Squirtle easy; Bulbasaur from about Lv. 14, since Vine Whip is physical now and
  Onix's Defense is huge; Charmander needs help: with a Route 22 Mankey's Low Kick it wins about
  90% at Lv. 12, as in the games).
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
| M5 ✅ | js/core/store.js, js/world/field-items.js, js/ui/{popup,name-ui,slots-ui,new-game,start-menu,party-ui,summary-ui,bag-ui,dex-ui,pc-ui,shop-ui}.js, css/menus.css (append), js/i18n/<lang>/menus.js, tests/save.test.cjs | the full menu flow, slots, export and import; the start menu has Settings (G.OptionsUI.open) |
| M6 ✅ (a–d) | js/content/kanto/<area>.js, js/data/trainer-classes.js, js/i18n/<lang>/kanto-<area>.js | each area plays via `?debug&map=…` |
| M7 | js/core/audio.js (jingles, cries), js/data/music.js, js/data/music-map.js | jingles on heal and level up |
| M8 ✅ | integration, js/ui/credits-ui.js, tests/story.test.cjs | Pallet Town to the Boulder Badge |

- **Can run in parallel:**
  - After M0: M1, M2, M3 and M7.
  - After M2 and M3: M4 and M5.
  - After M3 (map format fixed): M6a–d.
- **Each module's translations** go in `js/i18n/<lang>/<module>.js`: battle, world, menus,
  kanto-pallet…

## 10. Chapters

The game grows chapter by chapter; each ends at a Gym with `G.CreditsUI.ending(n)`.

- **Chapter 1** (M0–M8): Pallet Town to Brock and the Boulder Badge.
- **Chapter 2** ✅: Pewter's east road (a boy sends you back to the Gym until badge 1), Route 3
  (seven Trainers), Route 4 split by the mountain (the Mt. Moon Pokémon Center with the Magikarp
  salesman: ₽500, once), Mt. Moon 1F / B1F / B2F (`cave: true`; five Trainers on 1F, four Team
  Rocket Grunts and Super Nerd Miguel on B2F; the fossils: Miguel battles first, you keep one,
  he takes the other, flag `got-fossil`), Cerulean City (Center, Mart, Bike Shop, two houses; the
  roads north, south and east are closed until chapter 3) and Misty's pool Gym (Swimmer Luis,
  Picnicker Diana, Misty: Staryu 18, Starmie 21; prize ₽2100, badge 2, TM03 Water Pulse).
  Files: `route3.js`, `mtmoon.js`, `cerulean.js` (translations `kanto-route3`, `kanto-mtmoon`,
  `kanto-cerulean`).
- **Engine for chapter 2:** caves are outdoor-style maps with `palette: 'cave'`, `border: '#'`
  and `cave: true` (wild Pokémon on any step; `#` rock walls are cliffs, the floor is "grass").
  New outdoor tiles `%` ladder and `O` cave mouth (both warps; a cave mouth sits in a rock wall
  with open ground below). Indoor maps may have `~` water (the `pool` palette paints the corners
  in floor colours). People: `rocket`, `supernerd`, `hiker`, `misty`, `swimmer`; classes
  `super-nerd`, `team-rocket`, `swimmer`.
- **Balance** (`tests/story.test.cjs` prints both): Misty beats a lone Charmeleon (0% at Lv. 24)
  and a lone Wartortle below Lv. 24, Ivysaur Lv. 22 wins ~80%; Charmeleon with a Paras from
  Mt. Moon (Bug hits Starmie's Psychic type) wins every time. The Gym guide says so. The story
  test plays chapter 2 too (Squirtle with a Paras caught in the cave).
- **Chapter 3** ✅: Cerulean's north road: Route 24 (the rival at the foot of Nugget Bridge, five
  bridge Trainers, then the prize man: a Nugget, and he turns out to be a Team Rocket recruiter
  who battles you), Route 25 (five Trainers) and Bill's Sea Cottage (Bill is stuck as a Clefairy;
  he steps into the pod, you switch on the machine by his PC, he gives you the S.S. Ticket, flags
  `bill-asked`, `bill-saved`, `got-ss-ticket`). With the ticket the thief appears in the robbed
  Cerulean house (a Rocket Grunt: Machop, Drowzee; TM28 Dig, flag `caught-burglar`) and the
  officer leaves the south road. Route 5, the Underground Path (north entrance, tunnel, south
  entrance), Route 6 (four Trainers), Vermilion City (Center, Mart, the Pokémon Fan Club, the
  harbour), the S.S. Anne (two decks, five Trainers, the rival outside the captain's cabin; the
  seasick captain gives HM01 Cut, flag `got-hm01`; back at the harbour the ship sails, flag
  `ss-anne-left`). The Gym sits behind a small tree only Cut clears. Inside, an electric barrier:
  two switches in fifteen trash cans (the first in a random can, the second next to it; a wrong
  can resets), flag `surge-locks-open`; Engineer Baily, Sailor Dwayne, Gentleman Tucker, then
  Lt. Surge (Voltorb 21, Pikachu 18, Raichu 24; prize ₽2400, badge 3, TM34 Shock Wave).
  Files: `nugget.js`, `vermilion.js`, `ssanne.js`, `surge.js` (translations `kanto-nugget`,
  `kanto-vermilion`, `kanto-ssanne`, `kanto-surge`).
- **Engine for chapter 3:** `c` small trees and Cut (`field.js` keeps the cut trees of the
  current visit; `render.js` draws them as props), `u` trash cans, signs with `{ script }`,
  Pokémon NPCs (`mon`). People: `officer`, `sailor`, `gentleman`, `engineer`, `captain`,
  `surge`, `bill`; classes `sailor`, `gentleman`, `engineer`. `names.js` has a small `FIX`
  table for official names PokeAPI lacks (the S.S. Anne in Chinese, the Underground Path).
- **Balance:** Lt. Surge is the hardest wall so far (Raichu's Double Team, Voltorb's
  Self-Destruct): a lone Wartortle Lv. 26 never wins, a lone Charmeleon or Ivysaur rarely.
  Grass types take Electric moves well: Wartortle 26 with a Paras 24 wins ~80%, Charmeleon 26
  with a Gloom 24 ~75%; a Geodude helps less (25–45%). The Gym guide points to Geodude, Oddish and Paras. The story test plays chapter 3
  (Paras evolves on the way, learns Cut in place of a status move and leads against Surge).

- **Chapter 4** ✅: Route 11 east of Vermilion (five Trainers; the gate to Route 12 is closed) and
  Diglett's Cave to a new east side of Route 2 (behind a small tree on the road), where Professor
  Oak's aide gives HM05 Flash once ten kinds are caught (flag `got-hm05`). Cerulean's east road,
  behind a small tree: Route 9 (five Trainers), Route 10 with its Pokémon Center, Rock Tunnel 1F
  and B1F (`dark: true`, six Trainers), Lavender Town (Center, Mart, the Pokémon House whose Mr.
  Fuji has not come back, a house with a Cubone) and the Pokémon Tower 1F/2F (the rival on 2F,
  flag `tower-rival`; the stairs up are blocked until a later chapter brings the Silph Scope).
  Route 8 (five Trainers; the Saffron gates are closed, the guards are thirsty), the Underground
  Path west-east, Route 7 and Celadon City: Pokémon Center, Department Store 1F–4F and roof
  (TMs with prices, evolution stones, X items and vitamins, a vending machine; a girl trades TM16,
  TM20, TM33 for drinks), Celadon Mansion with an Eevee (Lv. 25) on the roof (flag `got-eevee`),
  a restaurant, a house, the Game Corner (closed for now) and Erika's greenhouse Gym behind a
  small tree: Lass Kay, Beauty Bridget, Cool Trainer Mary, Picnicker Tina, Beauty Lori, then Erika
  (Victreebel 27, Tangela 24, Vileplume 27; prize ₽2700, badge 4, TM19 Giga Drain).
  Files: `diglett.js`, `rocktunnel.js`, `lavender.js`, `celadon.js`, `erika.js` (translations
  `kanto-diglett`, `kanto-rocktunnel`, `kanto-lavender`, `kanto-celadon`, `kanto-erika`).
- **Engine for chapter 4:** dark caves (map def `dark: true`): `render.js` draws a small circle of
  light around the player; a Pokémon that knows Flash (with badge 1) lights the cave until you
  leave the dark maps — `field.js` offers it when you come in and when you press A at nothing.
  New stamps `K` tower (floors of windows), `E` department store, `B` big building; indoor tiles
  `g` gravestone and `k` hedge; palettes `tower` and `garden`. Shop prices for the TMs the
  Department Store sells (`item-effects.js`). `names.js` FIX gains Rock Tunnel.
- **Balance:** with modern moves and stats Erika's original Lv. 29 Victreebel and Vileplume
  (Petal Dance, Sleep Powder, Stun Spore) beat nearly every team of the auto-player, which never
  heals; so they are Lv. 27 with gentler moves (Mega Drain in place of Petal Dance). A Parasect
  leading a Wartortle wins ~92%, a Kadabra leading a Wartortle ~75%, Charmeleon with a Pidgeotto
  ~95%; a lone Wartortle or Ivysaur never wins. The guide points to Fire, Flying, Ice and Psychic
  and to Eevee + Fire Stone. The story test plays chapter 4 (Eevee becomes Flareon; Parasect
  leads against Erika).

- **Chapter 5** ✅: the Celadon Game Corner opens (its slot machines are switched off); a Grunt
  guards a poster with a switch behind it (flag `hideout-switch`) that opens stairs down to the
  Rocket Hideout: B1F (four Grunts), B2F and B3F (spin-tile mazes from a seeded generator, checked
  to be solvable and free of endless loops; a conveyor along the bottom row always takes you back
  to the stairs), B4F in two halves: the Grunt by the stairs drops the Lift Key, the lift (B1F,
  B2F, B4F; var `hideout-lift`) reaches the other half, two guards and Giovanni (Onix 25, Rhyhorn
  24, Kangaskhan 29, as in the games), who leaves the Silph Scope (flag `hideout-boss`). With the
  scope the Pokémon Tower opens above 2F: Channelers on 3F to 6F, a purified zone on 5F that heals,
  the spirit of Marowak on 6F (a wild battle it cannot be caught in; flag `marowak-calm`), three
  Grunts and Mr. Fuji on 7F, who takes you home and gives the Poké Flute (flags `fuji-saved`,
  `got-poke-flute`). Lavender's south road: Route 12 with the Silence Bridge (four Fishermen), the
  gate from Route 11, Snorlax across the road (the Poké Flute wakes it for a Lv. 30 battle; flag
  `route12-snorlax`), Routes 13 (fences), 14 (ledges) and 15, and Fuchsia City: Center, Mart, the
  Safari Zone's little zoo, the Safari Zone gate (closed: the warden lost his teeth), the warden's
  house, a house, and Koga's Gym, a dojo of invisible walls (a seeded Prim maze; its six Trainers
  stand in dead ends beside the way): Koga (Koffing 33, Muk 35, Koffing 33, Weezing 37; prize
  ₽3700, badge 5, TM06 Toxic). Files: `hideout.js`, `tower.js`, `route12.js`, `fuchsia.js`
  (translations `kanto-hideout`, `kanto-tower`, `kanto-route12`, `kanto-fuchsia`).
- **Engine for chapter 5:** spin and stop tiles (`field.js` slides the player, spinning, and gives
  up after 300 tiles in case of a loop of arrows), `secret` stairs behind a poster, lift doors,
  slot machines, invisible walls, the wooden bridge; palettes `hideout`, `corner`, `dojo`. Exit
  mats with a locked warp run its script. Scripted wild battles take options:
  `['wild', sp, lvl, { noCatch }]` (`rules.noCatch`: the ball is dodged and kept), and scripts can
  test the outcome of the last battle: `'battle=win'`, `'battle!=lose'`, `'battle=run'`
  (`G.Field.lastBattle`). Sounds `spin` and `lift`; an original jingle `flute` (the Poké Flute).
  New trainer classes: scientist, fisherman, rocker, bird-keeper, juggler, tamer, boss.
- **Balance:** Koga's original Lv. 37–43 team with Toxic, Smokescreen and Self-Destruct beats any
  small team of the auto-player, which never heals: his Pokémon are Lv. 33–37 and only Weezing
  keeps Smokescreen. A Kadabra leading a Wartortle wins every time, a Charmeleon + Pidgeotto +
  Dugtrio team ~95%, Blastoise with a Dugtrio ~65%; a lone Blastoise never does (its moves by
  Lv. 38 are weak). The guide points to Ground and Psychic. The story test plays chapter 5
  (a Dugtrio from Diglett's Cave leads against Koga).

- **Chapter 6** ✅: the Safari Zone north of Fuchsia: ₽500 buys a Safari Game (30 Safari Balls,
  600 steps; flag `safari-on`, var `safari-steps`, shown in a corner) in four areas (center, east,
  north, west) with the games' encounter tables; the game ends when steps or balls run out
  (`safari.timeup`, `safari.out-of-balls`) or when you walk out, and the balls left go back. The
  Secret House in the west gives HM03 Surf (flag `got-hm03`); the warden's Gold Teeth lie by the
  water there, and he gives HM04 Strength for them (flag `got-hm04`; Strength's field use comes
  with the first boulders). Saffron City: a drink from the Celadon rooftop for a thirsty guard
  opens all four gates (flag `saffron-open`; gate houses on Routes 7 and 8, guards on the roads of
  Routes 5 and 6). Team Rocket holds the city and Silph Co. (11 floors; stairs everywhere, a lift
  to 1F, 3F, 5F, 7F, 9F and 11F; the Card Key on 5F opens the doors with a card slot; the rival on
  7F, flag `silph-rival`; a Lapras on 7F, flag `got-lapras`; a nurse on 9F; a teleport pad from 7F
  to the boardroom on 11F, where Giovanni (Nidorino 35, Kangaskhan 34, Rhyhorn 35, Nidoqueen 38)
  battles you and leaves, flag `silph-cleared`; the president gives the Master Ball). Also: the
  Fighting Dojo (four Black Belts and their master Hideki; then Hitmonlee or Hitmonchan),
  Mr. Psychic (TM29 Psychic), and Sabrina's Gym: nine rooms joined by teleport pads, seven
  Psychics and Channelers, Sabrina (Kadabra 35, Mr. Mime 35, Venomoth 36, Alakazam 39; prize
  ₽3900, badge 6, TM04 Calm Mind). Files: `safari.js`, `saffron.js`, `silph.js`, `sabrina.js`
  (translations `kanto-safari`, `kanto-saffron`, `kanto-silph`, `kanto-sabrina`).
- **Engine for chapter 6:** the Safari battle (`js/battle/safari.js`, its own tests): Safari
  Balls, Bait (catch rate ×½, flee ×¼), Rocks (catch rate ×2, flee ×2; both last 1 to 5 turns), fleeing
  by speed; the battle screen shows Ball ×N / Bait / Rock / Run (`G.BattleUI.safari`). Surf in the
  field: with the Soul Badge and a Pokémon that knows it, press A at water; the player rides that
  Pokémon (`Actor.ride`), water rolls the map's `surf` table (or the surf table of its grass area),
  and stepping on land ends the ride (the save remembers it). Key doors and teleport pads; the
  office stamp `Y`; sounds `surf`; trainer classes black-belt and psychic. Gold Teeth come from
  PokeAPI (`fetch_data.py`).
- **Balance:** Sabrina's four Psychic Pokémon are the hardest yet for the auto-player: a lone
  Blastoise never wins, Charizard with a Snorlax always does, Blastoise with Surf and a Parasect
  ~60%, Snorlax with a Scyther ~55%. Her Alakazam has no Recover (no endless stalls) and her team
  is three to four levels below the games'. The story test plays chapter 6 (Parasect and Dugtrio
  against Sabrina).

- **Chapter 7** ✅: the sea. Fuchsia's beach leads to Sea Route 19 (six Swimmers), Route 20 (five
  Trainers on the water and sandbanks) and Cinnabar Island; Route 21 (two Fishermen, three
  Swimmers, Tangela in its grass) joins Pallet Town's shore to Cinnabar. The Seafoam Islands fill
  Route 20 from top to bottom: 1F to B3F, an icy cave whose way west needs Strength (a boulder in the
  way on B1F; on B2F two boulders pushed into pits fall to B3F and dam the current, flags
  `pit:seafoam-b2f:12,8` and `12,11`), then Surf across the calmed lake; Articuno (Lv. 50, flag
  `seafoam-articuno`) rests there. Cinnabar Island: Center, Mart, the Pokémon Lab (fossils come back
  to life at Lv. 30 after a walk outside: the Helix or Dome Fossil from Mt. Moon, the Old Amber from
  a scientist in the Pewter Museum; flags `fossil-waiting`, `fossil-ready`, var `fossil-mon`), the
  Pokémon Mansion (1F to 3F and B1F: Burglars and Scientists, journal pages about Mew and Mewtwo,
  statues with a switch that flips flag `mansion-switch` and with it every gate; 3F's hole drops you
  into a closed room of 1F with the stairs down; the Secret Key in the basement) and Blaine's Gym,
  locked until you hold the Secret Key: five quiz machines before five gates (flags
  `blaine-q1`…`blaine-q5`; a wrong answer brings out the Trainer of that room first), then Blaine
  (Growlithe 40, Ponyta 38, Rapidash 40, Arcanine 43; prize ₽4300, badge 7, TM38 Fire Blast). The
  rods: the old fisherman of Vermilion (Old Rod), a fisherman in Fuchsia (Good Rod), an angler by
  Route 12's bridge (Super Rod). Files: `sea.js`, `seafoam.js`, `cinnabar.js`, `mansion.js`,
  `blaine.js` (translations `kanto-sea`, `kanto-seafoam`, `kanto-cinnabar`, `kanto-mansion`,
  `kanto-blaine`).
- **Engine for chapter 7:** Strength (with the Rainbow Badge; press A at a boulder: the boulders of
  the map move until you leave it, a push takes one tile and a pit swallows a boulder for good),
  holes in the floor, fast water, gates and statues (above). Fishing: `G.World.fish(rod)` from the
  Bag, or A at the water (Surf or Fish to choose from); a bite (70–80%) rolls the map's `old-rod`,
  `good-rod` or `super-rod` table into a wild battle. Battle backgrounds `sea` (on the water outside
  caves) and `ice`. Trainers see across water; swimmers swim up to you and land trainers stop at the
  shore. A trainer class may name a translation context: `swimmer-f` is "Swimmer" in English and
  takes the feminine title elsewhere (context `trainer-f`, dictionary `trainers-f`). The stamp `R`,
  palettes `seafoam`, `mansion`, `volcano`; sounds `strength` and `fall`; class burglar.
  `tests/field.test.cjs` runs field.js without a screen (boulders, pits, gates, fast water, fishing,
  swimmers).
- **Balance:** four Fire types: a lone Venusaur or Charizard never wins, Blastoise Lv. 42 with Surf
  wins ~75%, Charizard with a Dugtrio that knows Dig ~90%, Venusaur with a Surfing Blastoise ~65%.
  Surf is needed to reach Cinnabar at all, so every player has the answer. The story test plays
  chapter 7 (Wartortle learns Surf, Dugtrio learns Dig and leads against Blaine).

- **Chapter 8** ✅: the Bicycle: the Pokémon Fan Club chairman in Vermilion City gives the Bike
  Voucher to anyone who listens to him praise Rapidash (flag `got-bike-voucher`); the Bike Shop in
  Cerulean City takes it for a Bicycle (flag `got-bicycle`). Route 16 west of Celadon City: a
  second Snorlax where the trees close in (the Poké Flute, flag `route16-snorlax`), a meadow behind
  a small tree with a hidden house, where a girl gives HM02 Fly (flag `got-hm02`), two Bikers and
  two Cue Balls, and the gate to Cycling Road. Route 17, Cycling Road: Bicycles only (the guards
  of both gates stop you without one), a long downhill road with eight Bikers and Cue Balls who
  stand on it, side meadows behind the fences; its south gate opens on Route 18 (three Bird
  Keepers), which joins Fuchsia City from the west. Every town is a place to fly to once visited.
  The Viridian Gym opens with seven badges: its Leader is Giovanni. Spin tiles in three rooms
  (an arrow up through a gap in each wall, an arrow down beside it to go back), eight Trainers
  (Tamers, Black Belts, Cool Trainers), then Giovanni (Rhyhorn 45, Dugtrio 42, Nidoqueen 44,
  Nidoking 45, Rhydon 50, as in the games; prize ₽5000, badge 8, TM26 Earthquake); he breaks up
  Team Rocket and leaves (flags `giovanni-gym`, `giovanni-left`). Files: `cycling.js`,
  `giovanni.js` (translations `kanto-cycling`, `kanto-giovanni`).
- **Engine for chapter 8:** the Bicycle (`G.World.toggleBike()`: from the Bag, a bike button under
  the menu button, or Select / V): outdoor maps only, 11 tiles a second, its own original theme
  (`cycling`), drawn as a red or pink bicycle under the rider; you get off indoors and to Surf, and
  the save remembers it (so does Surf now: `player.surf`, `player.bike`). Cycling Road (`bike`,
  `slope`, above). Fly: the party menu offers it for a Pokémon that knows it (with the Thunder
  Badge, outdoors, not in caves or on Cycling Road); `G.TownMapUI` (`js/ui/town-map-ui.js`) draws
  Kanto with its towns, roads and sea routes and lets you pick a visited town, and the Town Map from
  the Bag shows where you are. `G.World.flyTo(map)` lands on the town's `fly` spot. Sounds `bike`
  and `fly`; the palette `earth`; class cue-ball; the Bike Voucher comes from PokeAPI
  (`fetch_data.py`), the Chinese names of the Bicycle and the voucher from `names.js` FIX. The
  Gym's layout was checked with a simulator of the spin rules (reachable, no endless slide, no
  trap).
- **Balance:** five Ground types (Rhydon's Earthquake, Nidoking's Thrash) against a team that
  never heals: a lone Charizard or Venusaur never wins, Blastoise Lv. 50 with Surf ~85%,
  Charizard with the Lapras from Silph Co. ~95%, Venusaur with a Surfing Blastoise ~90%. The
  guide points to Water, Grass and Ice. The story test plays chapter 8 (Parasect leads).

- **Chapter 9** ✅, the end of Kanto: with eight badges the rival waits in front of the Pokémon
  League Front Gate on Route 22 (flag `route22-rival2`; Pidgeot 46, Rhyhorn 44, two of Gyarados /
  Arcanine / Exeggutor 45, Alakazam 46, his starter 50) and the gate opens on Route 23 (badge-check
  guards, a river to Surf across). Victory Road (`cave`, three floors): on 1F a boulder pushed onto
  a floor switch opens the rock barrier to the ladder (flag `plate:victory-1f:11,17`); on 3F a
  boulder pushed into a hole falls to 2F onto its switch (flag `pit:victory-3f:10,12`), which opens
  the barrier to the way out; Moltres rests on 2F (Lv. 50, flag `victory-moltres`); seven
  Trainers. The Indigo Plateau (a place to fly to): the League building, a lobby that is a Pokémon
  Center and a Mart, and a guard who asks if you are ready. The Elite Four, one room after another
  with no way back (the stairs open with flags `e4-lorelei`, `e4-bruno`, `e4-agatha`, `e4-lance`;
  Lorelei's room clears them, so every run starts over): Lorelei (Ice, 48-51), Bruno (Fighting,
  48-53), Agatha (Ghost, 50-55), Lance (Dragon, 50-56), then the Champion: the rival (51-57, his
  team after his starter, `G.League.championTeam(starter)`), with the league theme. Professor Oak
  comes in and takes you to the Hall of Fame (the team is written to `save.fame`; flags
  `champion`, `hall-of-fame`), you wake up at home and the credits roll (`ending(9)`); Mom has a
  word for the Champion. Files: `victory.js`, `league.js`, `route22.js` (translations
  `kanto-victory`, `kanto-league`, `kanto-route22`).
- **Engine for chapter 9:** floor switches and rock barriers (above; `field.js` keeps a boulder on
  its switch with var `boulder:<map>:<id>`), the stamp `I`, palettes `ice`, `dragon`, `champion`,
  a trainer's `music` (the battle screen plays that context: `league`), classes elite-four and
  champion, `save.fame` (the Hall of Fame, kept by `G.Store.sanitize`), an original fanfare `fame`.
- **Balance:** each member alone against a fresh team of six (a starter at Lv. 55, five others at
  50): Lorelei, Bruno and Agatha ~100%, Lance ~75%, the Champion ~50% (~85% with the team at 58).
  The auto-player neither switches nor uses items; in the League a player heals between the rooms.
  The story test raises the rest of its team on Routes 18 and 23 and beats them all.

- **Chapter 10** ✅, Kanto after the League: Cerulean City's pond now has a rocky shore with a
  cave mouth (Surf); a guard stands in front of it until you are the Champion (flag `champion`).
  Cerulean Cave (`cave`, the games' tables, Lv. 46-67): 1F, a river to Surf across to the ladder
  up; 2F, a winding way to the ladder down into a closed part of 1F; B1F, an underground lake and
  Mewtwo (Lv. 70, flag `cave-mewtwo`; meeting it ends the chapter, `ending(10)`). Route 10 gains a
  river down its east side to the old Power Plant (Surf): wild electric Pokémon on every step
  (`cave` on an indoor map), three Poké Balls that are Voltorb or Electrode (a ball with a
  `script` that marks itself collected, then a wild battle), items (TM25 Thunder, a Thunder Stone)
  and Zapdos (Lv. 50, flag `plant-zapdos`). Once you are the Champion the Elite Four battle with
  teams ten levels stronger (trainers `lorelei2`… beside the first ones, `if: 'champion'`) and
  new opening lines; the rival too (`championTeam(starter, true)`), and a win takes you straight
  to the Hall of Fame again (no credits). Professor Oak rates the Pokédex in his lab (seven
  steps by the number caught); all 150 of Kanto earn the Diploma (flag `diploma`). Files:
  `cave.js`, `plant.js`, `league.js`, `pallet.js`, `rocktunnel.js`, `cerulean.js` (translations
  `kanto-cave`, `kanto-plant`).
- **Balance:** the rematches against a team ten levels up as well: Lance ~75%, the Champion
  ~75%. The story test trains the team in Cerulean Cave, beats them all, then Mewtwo.

- **Chapter 11** ✅, Johto part 1: south of the Indigo Plateau, Route 26 (a rest house that
  heals) and Route 27 (a strait to Surf) lead west to New Bark Town (`region: 'johto'` on every
  Johto map). Professor Elm explains the rule (flag `elm-intro`) and gives a Johto starter, Lv. 5
  (to the PC if the party is full; flag `johto-start`; the thief takes the one strong against
  yours, `save.rival2.starter`). Route 29, Cherrygrove City, Route 30 (three Trainers) and
  Mr. Pokémon, who gives the Mystery Egg; Professor Oak, visiting, adds Johto to the Pokédex
  (flag `johto-dex`) and hears that the lab was robbed (flag `johto-theft`; that ball is gone
  from the lab). The thief waits at Cherrygrove's north exit (flag `rival2-battle`, losing
  allowed); back at the lab the officer asks his name (`G.NameUI` kind `rival2`, flag
  `rival2-named`), and Elm gives the Egg back with five Poké Balls (flag `elm-egg`, var
  `egg-steps` 800: walking hatches Togepi, script `egg.hatch`). Route 31, Violet City (the
  Academy, a Center, a Mart), Sprout Tower (three floors of Sages and Elder Li, who gives TM27
  Return) and the Gym: two Trainers and Falkner (Pidgey 7, Pidgeotto 11; the Zephyr Badge,
  badge 9, and TM40 Aerial Ace; `ending(11)`). Files: `js/content/johto/newbark.js`,
  `cherrygrove.js`, `violet.js` (translations `johto-newbark`, `johto-cherrygrove`,
  `johto-violet`).
- **Engine for chapter 11:** Johto data and sprites 152–251 (from PokéGo); `G.Clock`
  (`js/core/clock.js`: morning 4-10, day 10-20, night 20-4 from the device; debug `?time=night`)
  picks a table's `morning` / `night` list and tints Johto's outdoor maps (render `tint`);
  evolutions by friendship and time, by stats (Tyrogue), and trade items used from the Bag
  (`item-effects.js`: Metal Coat, King's Rock, Dragon Scale, Up-Grade, Sun Stone). Friendship
  grows by one every 128 steps (var `walk`). Obedience: on a Johto map after `johto-start`,
  `G.Field.obeyCap(region)` gives `rules.obeyCap` from the Johto badges (`OBEY` = 20, 25, 30,
  35, 40, 50, 60, 70; all eight: no cap). Above it the Gen 3 roll (`rand(0,255) * (lvl + cap)
  / 256 >= cap`) makes a Pokémon use another move, nap, hurt itself or loaf (event `disobey`).
  Badges 9–16 (the badge case shows a second row); the Town Map draws Johto and switches
  region; moves Heal Bell, Spider Web, Pain Split, Beat Up; class sage; people elm, silver,
  sage, falkner.
- **Balance:** Falkner against a team that never heals: Cyndaquil Lv. 13 ~80%, Totodile 13
  ~65%, a lone Chikorita 13 never wins (Gust), Chikorita 15 with a Hoothoot 11 ~60%. The wild
  Pokémon before him are Lv. 2-6, his Trainers up to 10. The story test plays chapter 11 with the
  Kanto team in the party (it obeys only sometimes) and Cyndaquil leading.

- **Chapter 12** ✅, Johto part 2: Violet City's road south opens (the one west is blocked by a
  strange tree). Route 32 along the sea (six Trainers, a Pokémon Center at the south end) to Union
  Cave 1F (`cave`, a pool, three Trainers) and Route 33 (a Hiker) to Azalea Town. A Team Rocket
  Grunt guards the Slowpoke Well and the Gym is locked (a note: Bugsy is out). Kurt hears that
  Team Rocket cuts the Slowpoke's tails and goes down himself (flag `kurt-well`; the guard
  leaves); in the well he has hurt his back by the ladder; four Grunts, the last in charge (win
  script: flag `well-cleared`, the Slowpoke come back to town, Kurt goes home, the Gym opens).
  Bugsy's Gym (palette `garden`, hedges): three Bug Catchers, then Bugsy (Metapod 14, Kakuna 14,
  Scyther 15 with Fury Cutter): badge 10, the Hive Badge (obedience up to Lv. 30), TM17 Protect
  (flag `bugsy-beaten`). Stepping out of the Gym, the thief battles you (Gastly 12, Zubat 14, his
  starter evolved at 16; losing allowed; flag `azalea-rival`) and the chapter ends (`ending(12)`).
  Files: `js/content/johto/route32.js`, `azalea.js` (translations `johto-route32`,
  `johto-azalea`); people kurt, bugsy; official names of Union Cave, the Slowpoke Well, Ilex
  Forest and the Ruins of Alph in `LOC_NAMES` (and French ones PokeAPI writes in capitals,
  `LOC_FR`). Fury Cutter now stops doubling at 160, as in Generation 6 on.
- **Balance:** Bugsy against a team that never heals: Quilava Lv. 17 ~95%, Bayleef 18 with a
  Geodude ~90% (alone it never wins), Croconaw 18 with a Geodude ~55%. The thief took the starter
  strong against yours: one starter alone rarely beats him, with a friend from the way (Flaaffy,
  Pidgeotto, Geodude) 70-100%. The story test plays chapter 12 with the Johto starter leading.

- **Chapter 13** ✅, Johto part 3: Azalea Town's road west opens into Ilex Forest (palette
  `forest`; wild Pokémon in the grass more often than the games' table says, `rate` 20, and in
  the trees). The charcoal maker's apprentice has lost his Farfetch'd: it hops away each time you
  reach it (var `farfetchd` 0-3, four places), the fourth time back to him (4); the charcoal maker
  then gives TM35 Flamethrower (flag `charcoal-gift`; they go home to the kiln). A man by the
  shrine teaches Headbutt (the species' `tu`); a small tree (Cut) blocks the way north. Route 34
  (five Trainers) and the Day Care; Goldenrod City: a Pokémon Center, the Department Store (three
  floors: market, medicine, TMs, battle items and vitamins), the Radio Tower lobby (staff only
  upstairs), the Bike Shop, the Flower Shop (the strange tree that wiggles when watered: chapter
  14), the Name Rater (a new nickname for a Pokémon whose first Trainer is you), Bill's family
  (Bill gives an Eevee, Lv. 20, flag `bill-eevee`) and a house; the gate to Route 35 and the
  Magnet Train are closed. Whitney's Gym (palette `pink`, hedges): two Lasses, two Beauties, then
  Whitney (Clefairy 16 with Encore and Metronome, Miltank 17 with Rollout, Attract, Stomp and
  Milk Drink). Beaten, she cries (flag `whitney-cried`) and gives the badge only when you talk to
  her again: badge 11, the Plain Badge (obedience up to Lv. 35), TM45 Attract (flag
  `whitney-beaten`), and the chapter ends (`ending(13)`). Files: `js/content/johto/ilex.js`,
  `route34.js`, `goldenrod.js` (translations `johto-ilex`, `johto-route34`, `johto-goldenrod`).
- **Engine for chapter 13:** trees to Headbutt (outdoor tile `h`, kind `headtree`, drawn with
  lighter leaves: a Pokémon that knows Headbutt shakes one, and half the time a wild Pokémon of
  the area's `headbutt` table falls out; a map finds that table in its walking area). The Day
  Care (`js/world/daycare.js`, G.DayCare): up to two Pokémon, 1 Exp. point per step each, the
  moves of each new level (the oldest forgotten), no evolution; ₽100 + ₽100 a level to take one
  back (healed); `save.daycare`. Rollout now rolls on by itself for five turns, doubling, stopped
  by a miss or anything that stops a move (Defense Curl doubles it); Encore works (three turns
  of the same move: `options()` and the AI allow only that one). People whitney, pokefan,
  granny; class pokefan; palette pink.
- **Balance:** Whitney against a team that never heals or switches (Rollout and Attract hurt it
  most): Quilava Lv. 24 alone ~60%, Bayleef 24 ~50%, Croconaw 24 ~30%; with a Geodude from
  Union Cave 75-100%. Her levels are two below the games, as for Falkner and Bugsy. The story
  test plays chapter 13 with the Johto starter leading (it learns Headbutt; one Pokémon goes to
  the Day Care and back).

### After chapter 13

1. **Johto, the rest:** Route 35, the National Park and the Bug-Catching Contest, Route 36 (the
   strange tree: the Flower Shop's Squirt Bottle), Ecruteak City and Morty, then the other three
   Gyms, the Lake of Rage, the Radio Tower, the Johto League; Kurt's Apricorn Balls, berries,
   breeding at the Day Care (Eggs) and held items along the way.
2. **Hoenn:** abilities, double battles, weather.
3. Engine features along the way: more TMs, abilities, held items, weather, Exp. Share, Repel steps.
