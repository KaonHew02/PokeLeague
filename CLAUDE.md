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
- `python tools/fetch_data.py --region kanto [--offline]` — regenerates js/data/ from PokeAPI (cached).
- `node tools/map_check.js <map-id> | --all` — prints a map with its objects and checks it.
  Try a map in the browser with `dev.html?debug&map=<id>` (`map=sandbox` is the M3 test town).
- Run: `python -m http.server 8130` → http://localhost:8130/dev.html (PokéGo uses 8123).
  `.claude/launch.json` has it as the `pokeleague` preview server.

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
- Sprites are CC BY-NC 4.0: after adding sprites run `python tools/fetch_credits.py`.
- No commercial use: no ads, sales or paid items.
- Not on GitHub yet. Create the repo (KaonHew02/PokeLeague) and push only when the user asks.
