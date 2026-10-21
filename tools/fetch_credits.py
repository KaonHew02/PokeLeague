#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Writes CREDITS.md with the artists of every sprite in assets/pokemon/.
(Adapted from PokéSurvivor's tools/fetch_credits.py.)

    python tools/fetch_credits.py

Each SpriteCollab folder has a credits.txt (no header) with lines
    date <TAB> author <TAB> ...
where the author is a name or a Discord id ("<@!123...>"). The ids are
resolved with the credit_names.txt at the root of the repository.
"""
import io
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor

RAW = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'assets', 'pokemon')
OUT = os.path.join(ROOT, 'CREDITS.md')


def fetch(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'pokeleague/1.0'})
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.read().decode('utf-8', 'replace')
    except Exception:
        return ''


def write(per_artist, dexes):
    """per_artist: {(display, contact): set(dex)}"""
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(HEAD)
        f.write('| Artist | Contact | Sprites (Pokédex no.) |\n|---|---|---|\n')
        for (display, contact), dx in sorted(per_artist.items(), key=lambda kv: kv[0][0].lower()):
            nums = ', '.join(str(d) for d in sorted(dx))
            f.write(f'| {display} | {contact} | {nums} |\n')
        f.write(TAIL)


HEAD = '''# Credits

PokeLeague is a free, noncommercial fan game. It is based on
[PokéSurvivor](https://github.com/JPTER78/pokesurvivor) by JPTER78 (code under the
PolyForm Noncommercial License 1.0.0, see `LICENSE`).

Required Notice: Copyright 2026 JPTER78 (https://github.com/JPTER78/pokesurvivor)

## Sprites

The *Pokémon Mystery Dungeon* style sprites come from
[SpriteCollab](https://github.com/PMDCollab/SpriteCollab), under the
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) licence:
**noncommercial** use, with attribution to their artists. The sheets were
re-encoded as palette PNGs (lossless) and are otherwise unchanged.

'''

TAIL = '''
## Data

Base stats, moves, learnsets, evolutions, items and official names in every
language: [PokeAPI](https://pokeapi.co/), downloaded once by `tools/fetch_data.py`
and stored in `js/data/`.

## Music

Original compositions from PokéSurvivor (not Nintendo's), played by the game's
own synthesiser (`js/core/audio.js`, `js/data/music.js`).

## Font

[Pixelify Sans](https://github.com/eifetx/Pixelify-Sans) (SIL Open Font License 1.1,
licence in `assets/fonts/OFL.txt`). The game uses PokéSurvivor's modified version,
"Pixelify PS", with redrawn digits.

## Trademarks

Pokémon and all related names are trademarks of Nintendo, Creatures Inc. and
GAME FREAK. This is a noncommercial fan project, not affiliated with or
endorsed by them.
'''


def main():
    # Discord id / alias -> (display name, contact)
    names = {}
    for line in fetch(f'{RAW}/credit_names.txt').splitlines()[1:]:
        parts = line.split('\t')
        if len(parts) >= 2:
            display = parts[0].strip()
            contact = parts[2].strip() if len(parts) > 2 else ''
            names[parts[1].strip()] = (display, contact)
            names[display] = (display, contact)

    dexes = sorted(int(d) for d in os.listdir(ASSETS) if d.isdigit())

    def one(dex):
        # Credits of the normal sprite and the shiny (which can be by someone else).
        txt = fetch(f'{RAW}/sprite/{dex:04d}/credits.txt')
        if os.path.isdir(os.path.join(ASSETS, str(dex), 's')):
            txt += '\n' + fetch(f'{RAW}/sprite/{dex:04d}/0000/0001/credits.txt')
        authors = []
        for line in txt.splitlines():
            parts = line.split('\t')
            a = parts[1].strip() if len(parts) > 1 else ''
            if a and names.get(a, (a, ''))[0]:
                authors.append(a)
        return dex, authors

    per_artist = {}
    with ThreadPoolExecutor(max_workers=12) as ex:
        for dex, authors in ex.map(one, dexes):
            for a in set(authors):
                display, contact = names.get(a, (a, ''))
                per_artist.setdefault((display, contact), set()).add(dex)

    write(per_artist, dexes)
    print(f'{len(per_artist)} artists for {len(dexes)} Pokemon -> CREDITS.md')


if __name__ == '__main__':
    main()
