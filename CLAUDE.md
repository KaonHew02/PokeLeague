# PokeLeague — working notes

A classic Pokémon RPG for the browser and phones (starter → routes → 8 gyms → Elite Four →
next region), built on engine parts of PokéGo / PokéSurvivor (JPTER78). The user's other
project, PokéGo, lives in `C:\Users\MIS\Documents\PokeGo`; this is a separate game.
The user writes in Chinese: answer in Simplified Chinese, keep code and identifiers in English.

**Read `docs/DESIGN.md` before working on a milestone**: it has the schemas, APIs, formulas,
the map format and which files each milestone owns.

## Build and test
- Edit `dev.html` (never `index.html`, which is generated) and the files under `js/`, `css/`, `tools/`.
- `node tools/build_langs.js` after changing any translation (dev.html loads the generated `js/lang/*.js`).
- `node --test tests/*.test.cjs` — everything must pass.
- `node tools/build.js` — writes `index.html`, `js/app.min.js`, `css/app.css`, `js/lang/*.js`, `version.json`.
- `node tools/sim_battle.js charmander:5 bulbasaur:5 --seed 1 [--trainer] [--lang zh-Hans]` — a battle in the terminal.
- `python tools/fetch_data.py --region johto [--offline]` — regenerates js/data/ from PokeAPI (cached).
  Use `johto` (dex 1–251, Kanto and Johto places): `--region kanto` would cut the data back to 151.
- `node tools/map_check.js <map-id> | --all` — prints a map with its objects and checks it.
- `tests/story.test.cjs` plays chapters 1 to 15 headless (real scripts and battle engine with an
  auto-player) and prints `[balance]` win rates against the Gym Leaders (Kanto's eight and Johto's first six), the Elite Four
  and the Champion (and their rematches). `tests/field.test.cjs` runs the overworld rules (field.js) without a screen. The game grows chapter by
  chapter (docs/DESIGN.md section 10); a chapter ends with `G.CreditsUI.ending(n)`.
  Try a map in the browser with `dev.html?debug&map=<id>` (`map=sandbox` is the M3 test town).
- Run: `python tools/serve.py` → http://localhost:8130/dev.html (PokéGo uses 8123). It is
  `http.server` with no-cache headers, so edited scripts are never stale. `.claude/launch.json`
  has it as the `pokeleague` preview server.
- A battle in the browser: http://localhost:8130/dev.html?debug&wild=pidgey:3&party=charmander:8
  (or `&vs=geodude:12,onix:14` for a trainer). In a hidden browser pane animation barely runs:
  drive it with `G.Game.step(1/30, n)` from the console or a test script.

## Conventions
- English is the source language: comments, identifiers and dictionary keys.
- Plain browser JS, no npm packages, no bundler. Each file is one module on the global `G`
  (`G.Name = (() => { ... return api; })();`). Every file is registered in `dev.html` in load
  order; a new file needs its `<script defer>` tag (tests/lint checks it).
- localStorage keys start with `pl.` (PokéGo shares the GitHub Pages origin and uses `ps.`).
- Anything that changes the game state uses a seeded `G.RNG`, never `Math.random`
  (always true in `js/battle/`, checked by a test).
- Text: `G.T('English text')` or `G.I18n.fmt('{mon} used {move}!', { mon, move })` with a
  literal key, so `tools/i18n_keys.js` can find it. Every new text gets its translation in
  all six dictionaries: `js/i18n/<lang>/<module>.js` for es, fr, it, pt-BR, zh-Hans, zh-Hant
  (one file per module, so parallel work never edits the same file).
  `node tools/build_langs.js --missing --all` lists the gaps.
- Names of Pokémon, moves, items, types and places are NOT dictionary keys: use
  `G.Names.mon(id)`, `.move(id)`, `.item(id)`, `.type(id)`, `.loc(id)` (official names from PokeAPI).
- DOM built by code goes inside elements with `translate="no"` and is translated before insertion.
- Dialogue is paraphrased, never copied from the official games; music must be original.

## Licence (must be kept)
- Code is PolyForm Noncommercial 1.0.0. Keep `LICENSE`, `LICENSE-NONCOMMERCIAL.md` and the line
  `Required Notice: Copyright 2026 JPTER78 (https://github.com/JPTER78/pokesurvivor)`.
- Sprites are CC BY-NC 4.0: after adding sprites run `python tools/fetch_credits.py`, then
  `node tools/credits_js.js` (or the build) so the credits screen lists the new artists.
- No commercial use: no ads, sales or paid items.
- On GitHub: https://github.com/KaonHew02/PokeLeague (`origin`), published by GitHub Pages from
  `main` (root, `.nojekyll`) at https://kaonhew02.github.io/PokeLeague/. Push only when the user asks.
