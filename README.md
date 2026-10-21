# PokeLeague

A free fan-made Pokémon adventure for the browser and phones, in the spirit of
the classic games: pick a starter, catch and train Pokémon on the routes,
evolve them, beat the eight gyms and the League, then move on to the next
region — Kanto first, then Johto, Hoenn…

- Turn-based battles with the games' formulas (type chart, STAB, critical hits,
  status conditions, catch rate, experience).
- Hand-made towns and routes, Pokémon Centers, Poké Marts, trainers and gyms.
- Seven languages: English, Español, Français, Italiano, Português (Brasil), 简体中文, 繁體中文.
- Keyboard and mouse (WASD, click to walk), controllers, and tapping on phones. Saves stay in your browser.

**Status:** early development. The first playable goal is the start of Kanto,
from Pallet Town to Brock's Boulder Badge.

## Running it

```
python -m http.server 8130
```

Then open <http://localhost:8130/dev.html> (source files) or
<http://localhost:8130/> (the built page, after `node tools/build.js`).

## Credits and licence

Based on [PokéSurvivor](https://github.com/JPTER78/pokesurvivor) by JPTER78.
Code under the PolyForm Noncommercial License 1.0.0 (see `LICENSE`); sprites by
the SpriteCollab artists under CC BY-NC 4.0 (see `CREDITS.md`); data from PokeAPI.

Pokémon is © Nintendo, Creatures Inc. and GAME FREAK. This is a noncommercial
fan project, not affiliated with or endorsed by them. Not for sale, no ads, no
paid items.
