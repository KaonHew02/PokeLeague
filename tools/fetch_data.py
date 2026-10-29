#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Downloads the game data of a region from PokeAPI and writes it to js/data/.
After that the game never touches the internet: everything is local.

    python tools/fetch_data.py --region kanto            # dex 1-151
    python tools/fetch_data.py --region johto            # dex 1-251: Kanto (FireRed) and Johto (HeartGold)
    python tools/fetch_data.py --region kanto --offline  # cache only; fails on a miss
    python tools/fetch_data.py --region kanto --refresh  # download everything again

Every raw response is cached in tools/cache/pokeapi/<endpoint>/<key>.json, so
running it again is fast and works offline. (Adapted from PokéSurvivor's
tools/fetch_pokedex.py.)

Writes (all generated, do not edit by hand):
    js/data/species.js     G.SPECIES     stats, types, catch rate, growth, evolutions, learnsets, TMs
    js/data/moves.js       G.MOVES, G.TMS
    js/data/items.js       G.ITEMS
    js/data/growth.js      G.GROWTH      total EXP per level for each growth rate
    js/data/natures.js     G.NATURES
    js/data/names.js       G.NAMES       official names in en, es, fr, it, zh-Hans, zh-Hant
    js/data/encounters.js  G.ENCOUNTERS  wild Pokémon per location area
    js/data/dex-text.js    G.DEX_TEXT    Pokédex entries, move and item descriptions
"""
import argparse
import io
import json
import os
import re
import sys
import tempfile
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

API = 'https://pokeapi.co/api/v2'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'cache', 'pokeapi')
OUT = os.path.join(ROOT, 'js', 'data')
UA = {'User-Agent': 'pokeleague/1.0 (fan game; data cached locally)'}

# Order of the name columns in G.NAMES; Brazilian Portuguese shows English names.
LANGS = ['en', 'es', 'fr', 'it', 'zh-Hans', 'zh-Hant']
API_LANG = {'en': 'en', 'es': 'es', 'fr': 'fr', 'it': 'it', 'zh-Hans': 'zh-hans', 'zh-Hant': 'zh-hant'}

STAT = {'hp': 'hp', 'attack': 'atk', 'defense': 'def', 'special-attack': 'spa',
        'special-defense': 'spd', 'speed': 'spe', 'accuracy': 'acc', 'evasion': 'eva'}
STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
# Moves taught by a move tutor in the game (Ilex Forest: Headbutt), from HeartGold / SoulSilver.
TUTOR_MOVES = {'headbutt'}
# HeartGold / SoulSilver's HMs that FireRed / LeafGreen's machines lack (HM06 there is Rock Smash):
# a tutor teaches them, to the species that learn them from a machine in HeartGold / SoulSilver.
TUTOR_FROM_HM = {'whirlpool'}
# Items whose FireRed / LeafGreen text is about another region: HeartGold / SoulSilver's text instead.
HGSS_TEXT = {'basement-key', 'clear-bell', 'silver-wing'}
TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
         'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy']

ITEMS_COMMON = [
    # balls
    'poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'safari-ball',
    # medicine
    'potion', 'super-potion', 'hyper-potion', 'max-potion', 'full-restore', 'revive', 'max-revive',
    'antidote', 'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'full-heal',
    'ether', 'max-ether', 'elixir', 'max-elixir', 'fresh-water', 'soda-pop', 'lemonade', 'moomoo-milk',
    # battle and growth
    'x-attack', 'x-defense', 'x-speed', 'x-accuracy', 'x-sp-atk', 'guard-spec', 'dire-hit',
    'hp-up', 'protein', 'iron', 'carbos', 'calcium', 'zinc', 'pp-up', 'pp-max', 'rare-candy',
    # field
    'escape-rope', 'repel', 'super-repel', 'max-repel',
    'fire-stone', 'water-stone', 'thunder-stone', 'leaf-stone', 'moon-stone',
    # valuables
    'nugget', 'tiny-mushroom', 'big-mushroom', 'pearl', 'big-pearl', 'stardust', 'star-piece',
    # held
    'exp-share',
]

REGIONS = {
    'kanto': {
        'dex': (1, 151),
        # Level-up learnsets: the first version group that has the species.
        'learnset_vg': ['firered-leafgreen', 'emerald', 'heartgold-soulsilver'],
        'tm_vg': 'firered-leafgreen',
        # Encounter tables: the first version with data for each area.
        # Flavor text: first version (group) with that language, else the newest one.
        'text_versions': ['firered', 'leafgreen', 'lets-go-pikachu', 'lets-go-eevee'],
        'text_vgs': ['firered-leafgreen', 'lets-go-pikachu-lets-go-eevee'],
        'items': ITEMS_COMMON + [
            'oaks-parcel', 'town-map', 'bicycle', 'old-rod', 'good-rod', 'super-rod',
            'ss-ticket', 'poke-flute', 'silph-scope', 'card-key', 'lift-key', 'secret-key',
            'coin-case', 'helix-fossil', 'dome-fossil', 'old-amber', 'gold-teeth', 'bike-voucher',
        ],
        # Places: each region's locations, with the versions whose encounter tables they use.
        'regions': [('kanto', ['firered', 'leafgreen', 'red', 'blue', 'yellow'])],
    },
}
# Johto adds Pokémon 152-251 and its places (HeartGold tables, with morning / day / night slots);
# Kanto keeps its FireRed tables, learnsets and TMs, so the Kanto chapters play as before.
REGIONS['johto'] = dict(REGIONS['kanto'], **{
    'dex': (1, 251),
    'learnset_vg': ['firered-leafgreen', 'emerald', 'heartgold-soulsilver', 'crystal'],
    # Pokémon 152-251 learn as in HeartGold / SoulSilver (FireRed has none of them; Emerald's
    # lists are older and slower: Totodile's Water Gun at 13, no Bite).
    'learnset_vg_from': (152, ['heartgold-soulsilver', 'crystal', 'emerald']),
    'text_versions': ['firered', 'leafgreen', 'heartgold', 'soulsilver', 'lets-go-pikachu', 'lets-go-eevee'],
    'text_vgs': ['firered-leafgreen', 'heartgold-soulsilver', 'lets-go-pikachu-lets-go-eevee'],
    'items': REGIONS['kanto']['items'] + [
        'mystery-egg', 'sun-stone', 'metal-coat', 'kings-rock', 'dragon-scale', 'up-grade',
        'sport-ball', 'squirt-bottle',
        'red-scale', 'basement-key', 'clear-bell', 'silver-wing', 'secret-potion', 'oran-berry', 'sitrus-berry', 'pecha-berry', 'cheri-berry', 'chesto-berry', 'rawst-berry', 'aspear-berry',
    ],
    'regions': [('kanto', ['firered', 'leafgreen', 'red', 'blue', 'yellow']),
                ('johto', ['heartgold', 'soulsilver', 'crystal', 'gold', 'silver'])],
})

# Official place names PokeAPI lacks (it has en and fr, not es, it or Chinese).
# Only names we are sure of; the rest falls back to English and is counted.
#            es                       it                      zh-Hans      zh-Hant
LOC_NAMES = {
    'pallet-town':       ('Pueblo Paleta',      'Biancavilla',         '真新镇',     '真新鎮'),
    'viridian-city':     ('Ciudad Verde',       'Smeraldopoli',        '常青市',     '常青市'),
    'pewter-city':       ('Ciudad Plateada',    'Plumbeopoli',         '深灰市',     '深灰市'),
    'cerulean-city':     ('Ciudad Celeste',     'Celestopoli',         '华蓝市',     '華藍市'),
    'vermilion-city':    ('Ciudad Carmín',      'Aranciopoli',         '枯叶市',     '枯葉市'),
    'lavender-town':     ('Pueblo Lavanda',     'Lavandonia',          '紫苑镇',     '紫苑鎮'),
    'celadon-city':      ('Ciudad Azulona',     'Azzurropoli',         '玉虹市',     '玉虹市'),
    'fuchsia-city':      ('Ciudad Fucsia',      'Fucsiapoli',          '浅红市',     '淺紅市'),
    'saffron-city':      ('Ciudad Azafrán',     'Zafferanopoli',       '金黄市',     '金黃市'),
    'cinnabar-island':   ('Isla Canela',        'Isola Cannella',      '红莲岛',     '紅蓮島'),
    'indigo-plateau':    ('Meseta Añil',        'Altopiano Blu',       '石英高原',   '石英高原'),
    'viridian-forest':   ('Bosque Verde',       'Bosco Smeraldo',      '常青森林',   '常青森林'),
    'mt-moon':           ('Mt. Moon',           'Monte Luna',          '月见山',     '月見山'),
    'digletts-cave':     ('Cueva Diglett',      'Grotta Diglett',      '地鼠洞穴',   '地鼠洞穴'),
    'seafoam-islands':   ('Islas Espuma',       'Isole Spumarine',     '双子岛',     '雙子島'),
    'cerulean-cave':     ('Cueva Celeste',      'Grotta Celeste',      '华蓝洞窟',   '華藍洞窟'),
    'kanto-victory-road-1': ('Calle Victoria',  'Via Vittoria',        '冠军之路',   '冠軍之路'),
    'kanto-victory-road-2': ('Calle Victoria',  'Via Vittoria',        '冠军之路',   '冠軍之路'),
    'kanto-power-plant': ('Central Energía',    'Centrale Elettrica',  '无人发电厂', '無人發電廠'),
    'pokemon-tower':     ('Torre Pokémon',      'Torre Pokémon',       '宝可梦塔',   '寶可夢塔'),
    'pokemon-mansion':   ('Mansión Pokémon',    'Villa Pokémon',       '宝可梦屋',   '寶可夢屋'),
    'kanto-safari-zone': ('Zona Safari',        'Zona Safari',         '狩猎地带',   '狩獵地帶'),
    # Johto
    'new-bark-town':     ('Pueblo Primavera',   'Borgo Foglianova',    '若叶镇',     '若葉鎮'),
    'cherrygrove-city':  ('Ciudad Cerezo',      'Fiorpescopoli',       '吉花市',     '吉花市'),
    'violet-city':       ('Ciudad Malva',       'Violapoli',           '桔梗市',     '桔梗市'),
    'azalea-town':       ('Pueblo Azalea',      'Azalina',             '桧皮镇',     '檜皮鎮'),
    'goldenrod-city':    ('Ciudad Trigal',      'Fiordoropoli',        '满金市',     '滿金市'),
    'ecruteak-city':     ('Ciudad Iris',        'Amarantopoli',        '圆朱市',     '圓朱市'),
    'olivine-city':      ('Ciudad Olivo',       'Olivinopoli',         '浅葱市',     '淺蔥市'),
    'cianwood-city':     ('Ciudad Orquídea',    'Fiorlisopoli',        '湛蓝市',     '湛藍市'),
    'mahogany-town':     ('Pueblo Caoba',       'Mogania',             '卡吉镇',     '卡吉鎮'),
    'blackthorn-city':   ('Ciudad Endrino',     'Ebanopoli',           '烟墨市',     '煙墨市'),
    'sprout-tower':      ('Torre Bellsprout',   'Torre Sprout',        '喇叭芽之塔', '喇叭芽之塔'),
    'dark-cave':         ('Cueva Oscura',       'Grotta Scura',        '黑暗洞穴',   '黑暗洞穴'),
    'union-cave':        ('Cueva Unión',        'Grotta di Mezzo',     '互连洞',     '互連洞'),
    'slowpoke-well':     ('Pozo Slowpoke',      'Pozzo Slowpoke',      '呆呆兽之井', '呆呆獸之井'),
    'ilex-forest':       ('Encinar',            'Bosco di Lecci',      '栎树林',     '櫟樹林'),
    'ruins-of-alph':     ('Ruinas Alfa',        "Rovine d'Alfa",       '阿露福遗迹', '阿露福遺跡'),
    'radio-tower':       ('Torre Radio',        'Torre Radio',         '广播塔',     '廣播塔'),
    'national-park':     ('Parque Nacional',    'Parco Nazionale',     '自然公园',   '自然公園'),
    'burned-tower':      ('Torre Quemada',      'Torre Bruciata',      '烧焦塔',     '燒焦塔'),
    'bell-tower':        ('Torre Campana',      'Torre Campana',       '铃铛塔',     '鈴鐺塔'),
    'johto-lighthouse':  ('Faro Olivo',         'Faro di Olivinopoli', '浅葱灯塔',   '淺蔥燈塔'),
    'whirl-islands':     ('Islas Remolino',     'Isole Vorticose',     '漩涡列岛',   '漩渦列島'),
    'lake-of-rage':      ('Lago de la Furia',   "Lago d'Ira",          '愤怒之湖',   '憤怒之湖'),
    'mt-mortar':         ('Monte Mortero',      'Monte Scodella',      '擂钵山',     '擂缽山'),
    'team-rocket-hq':    ('Guarida del Team Rocket', 'Covo del Team Rocket', '火箭队基地', '火箭隊基地'),
    'ice-path':          ('Ruta Helada',        'Via Gelata',          '冰之洞',     '冰之洞'),
    'dragons-den':       ('Guarida Dragón',     'Tana del Drago',      '龙穴',       '龍穴'),
}
# French names PokeAPI writes with a Pokémon's name in capitals.
LOC_FR = {'sprout-tower': 'Tour Chétiflor', 'slowpoke-well': 'Puits Ramoloss'}


def loc_extra(slug):
    """es, it, zh-Hans, zh-Hant for a place, or None."""
    if slug in LOC_NAMES:
        return LOC_NAMES[slug]
    m = re.fullmatch(r'kanto-route-(\d+)', slug)
    if m:
        n = m.group(1)
        return (f'Ruta {n}', f'Percorso {n}', f'{n}号道路', f'{n}號道路')
    m = re.fullmatch(r'johto-route-(\d+)', slug)
    if m:
        n = m.group(1)
        return (f'Ruta {n}', f'Percorso {n}', f'{n}号道路', f'{n}號道路')
    m = re.fullmatch(r'(?:kanto|johto)-sea-route-(\d+)', slug)
    if m:
        n = m.group(1)
        return (f'Ruta {n}', f'Percorso {n}', f'{n}号水路', f'{n}號水路')
    return None


# Encounter slots that need a swarm or the radio (HeartGold): left out. Times of day kept apart.
SKIP_CONDITIONS = {'swarm-yes', 'radio-hoenn', 'radio-sinnoh'}
TIMES = ['morning', 'day', 'night']

# Trade evolutions become level evolutions (there is no trading).
TRADE_LEVEL = 37
TRADE_LEVEL_OVERRIDE = {64: 36}          # Kadabra -> Alakazam

OFFLINE = False
REFRESH = False
STATS = {'net': 0, 'cache': 0}


# ---------------- fetching with a cache ----------------

def cache_path(endpoint, key):
    return os.path.join(CACHE, endpoint, f'{key}.json')


def get(endpoint, key):
    """One API resource, from the cache when possible. None if it does not exist."""
    path = cache_path(endpoint, key)
    if os.path.exists(path) and not REFRESH:
        STATS['cache'] += 1
        with io.open(path, encoding='utf-8') as f:
            data = json.load(f)
        return None if data == {'__missing__': True} else data
    if OFFLINE:
        raise SystemExit(f'--offline: {endpoint}/{key} is not in the cache')
    url = f'{API}/{endpoint}/{key}/'
    data, last = None, None
    for _ in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                data = json.load(r)
                break
        except urllib.error.HTTPError as e:
            if e.code == 404:
                data = {'__missing__': True}
                break
            last = e
        except Exception as e:  # network hiccup: retry
            last = e
    if data is None:
        raise SystemExit(f'could not download {url}: {last}')
    STATS['net'] += 1
    os.makedirs(os.path.dirname(path), exist_ok=True)
    # Write to a temp file and rename: an interrupted run never leaves half a file.
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix='.tmp')
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(tmp, path)
    return None if data == {'__missing__': True} else data


def split_url(url):
    m = re.search(r'/api/v2/([\w-]+)/([\w-]+)/?$', url)
    return m.group(1), m.group(2)


def get_url(url):
    return get(*split_url(url))


def url_id(url):
    return int(split_url(url)[1])


def pmap(fn, items, workers=8):
    with ThreadPoolExecutor(max_workers=workers) as ex:
        return list(ex.map(fn, items))


# ---------------- names and texts ----------------

GAPS = {}


def names_of(entries, kind, key='name', fallback=''):
    """Official names in LANGS order; a missing one falls back to English (counted)."""
    by = {e['language']['name']: e[key] for e in entries or []}
    en = by.get('en') or fallback
    out = []
    for l in LANGS:
        v = by.get(API_LANG[l])
        if not v:
            GAPS.setdefault(kind, {}).setdefault(l, 0)
            GAPS[kind][l] += 1
            v = en
        out.append(clean(v))
    return out


def clean(s):
    """Game text -> one line (PokeAPI keeps the cartridges' line and page breaks)."""
    s = (s or '').replace('­\n', '').replace('­', '')
    s = re.sub(r'-\n(?=[a-z])', '-', s)
    s = re.sub(r'[\n\f\r ]+', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    # Chinese has no spaces between words: a line break there is just removed.
    cjk = '　-〿㐀-鿿＀-￯'
    return re.sub(rf'(?<=[{cjk}])\s+|\s+(?=[{cjk}])', '', s)


KEEP_CAPS = {'HP', 'PP', 'TM', 'HM', 'KO', 'OHKO'}


def uncaps(s):
    """The old games write names in capitals (POKéMON, THUNDER WAVE): -> Pokémon, Thunder Wave."""
    return re.sub(r"\b[A-Zé]{2,}\b", lambda m: m.group(0) if m.group(0) in KEEP_CAPS else m.group(0)[0] + m.group(0)[1:].lower(), s)


def texts_of(entries, cfg, kind, text_key='flavor_text', by='version'):
    """One flavor text per language: preferred versions first, else the newest entry."""
    prefer = cfg['text_versions'] if by == 'version' else cfg['text_vgs']
    out = []
    for l in LANGS:
        mine = [e for e in entries or [] if e['language']['name'] == API_LANG[l]]
        pick = None
        for v in prefer:
            pick = next((e for e in mine if e[by]['name'] == v), None)
            if pick:
                break
        if not pick and mine:
            pick = mine[-1]
        if not pick:
            GAPS.setdefault(kind, {}).setdefault(l, 0)
            GAPS[kind][l] += 1
        txt = clean(pick[text_key]) if pick else ''
        if l == 'en':
            txt = uncaps(txt)
        out.append(txt)
    # Missing languages show the English text.
    return [t or out[0] for t in out]


# ---------------- the region ----------------

def build(region):
    cfg = REGIONS[region]
    lo, hi = cfg['dex']
    dexes = list(range(lo, hi + 1))
    print(f'== {region}: Pokémon {lo}-{hi}')

    pokemon = dict(zip(dexes, pmap(lambda d: get('pokemon', d), dexes)))
    species = dict(zip(dexes, pmap(lambda d: get('pokemon-species', d), dexes)))

    # ---- learnsets and TM moves ----
    learn, tm_moves, tutor, move_names = {}, {}, {}, {'struggle'}
    for d in dexes:
        p = pokemon[d]
        rows = []
        vgs = cfg['learnset_vg']
        if cfg.get('learnset_vg_from') and d >= cfg['learnset_vg_from'][0]:
            vgs = cfg['learnset_vg_from'][1]
        for vg in vgs:
            rows = [(vd['level_learned_at'], url_id(m['move']['url']), m['move']['name'])
                    for m in p['moves'] for vd in m['version_group_details']
                    if vd['version_group']['name'] == vg and vd['move_learn_method']['name'] == 'level-up']
            if rows:
                break
        if not rows:
            print(f'  ! {d} has no level-up learnset in {cfg["learnset_vg"]}')
        rows.sort()
        learn[d] = [[lvl, name] for lvl, _, name in rows]
        tm_moves[d] = sorted({m['move']['name'] for m in p['moves'] for vd in m['version_group_details']
                              if vd['version_group']['name'] == cfg['tm_vg'] and vd['move_learn_method']['name'] == 'machine'})
        # Move tutors the game has (HeartGold / SoulSilver's, and its HMs FireRed lacks): species field 'tu'.
        tutor[d] = sorted({m['move']['name'] for m in p['moves'] for vd in m['version_group_details']
                           if vd['version_group']['name'] == 'heartgold-soulsilver'
                           and ((vd['move_learn_method']['name'] == 'tutor' and m['move']['name'] in TUTOR_MOVES)
                                or (vd['move_learn_method']['name'] == 'machine' and m['move']['name'] in TUTOR_FROM_HM))})
        move_names.update(n for _, n in learn[d])
        move_names.update(tm_moves[d])
        move_names.update(tutor[d])

    # ---- moves ----
    move_list = sorted(move_names)
    moves_raw = dict(zip(move_list, pmap(lambda n: get('move', n), move_list)))

    # TM / HM numbers of this version group (move -> 'tm39').
    machine_urls = {}
    for n, m in moves_raw.items():
        for mc in m.get('machines', []):
            if mc['version_group']['name'] == cfg['tm_vg']:
                machine_urls[n] = mc['machine']['url']
    machines = dict(zip(machine_urls, pmap(lambda n: get_url(machine_urls[n]), list(machine_urls))))
    move_tm = {n: machines[n]['item']['name'] for n in machines}
    tms = {v: k for k, v in move_tm.items()}

    MOVES, move_txt, names_move = {}, {}, {}
    for n, m in moves_raw.items():
        meta = m.get('meta') or {}
        nz = lambda k: meta.get(k) or 0
        rng = lambda a, b: [meta[a], meta[b]] if meta.get(a) is not None else None
        ail = (meta.get('ailment') or {}).get('name')
        MOVES[n] = {
            'id': m['id'], 'type': m['type']['name'], 'cat': m['damage_class']['name'],
            'pow': m['power'], 'acc': m['accuracy'], 'pp': m['pp'], 'pri': m['priority'],
            'tgt': m['target']['name'], 'eff': m.get('effect_chance'),
            'meta': {'k': (meta.get('category') or {}).get('name', 'unique'),
                     'ail': None if ail in (None, 'none') else ail, 'ailP': nz('ailment_chance'),
                     'crit': nz('crit_rate'), 'drain': nz('drain'), 'heal': nz('healing'),
                     'flinch': nz('flinch_chance'), 'statP': nz('stat_chance'),
                     'hits': rng('min_hits', 'max_hits'), 'turns': rng('min_turns', 'max_turns')},
            'stats': [[STAT[s['stat']['name']], s['change']] for s in m.get('stat_changes', [])],
        }
        names_move[n] = names_of(m['names'], 'move', fallback=n)
        move_txt[n] = texts_of(m.get('flavor_text_entries'), cfg, 'move text', 'flavor_text', 'version_group')

    # ---- evolutions ----
    chain_urls = sorted({species[d]['evolution_chain']['url'] for d in dexes})
    chains = pmap(get_url, chain_urls)
    evo = {d: [] for d in dexes}

    def walk(node):
        frm = url_id(node['species']['url'])
        for nxt in node['evolves_to']:
            to = url_id(nxt['species']['url'])
            if lo <= frm <= hi and lo <= to <= hi:
                rec = evo_rule(frm, to, nxt['evolution_details'])
                if rec:
                    evo[frm].append(rec)
            walk(nxt)
    for c in chains:
        walk(c['chain'])

    # ---- species ----
    SPECIES, names_mon, names_genus, dex_txt = {}, {}, {}, {}
    for d in dexes:
        p, s = pokemon[d], species[d]
        st = {x['stat']['name']: x for x in p['stats']}
        rec = {
            'slug': p['name'],
            'types': [t['type']['name'] for t in sorted(p['types'], key=lambda t: t['slot'])],
            'base': [st[k]['base_stat'] for k in STAT_ORDER],
            'ev': [st[k]['effort'] for k in STAT_ORDER],
            'cr': s['capture_rate'], 'bx': p['base_experience'], 'gr': s['growth_rate']['name'],
            'gf': s['gender_rate'], 'fr': s['base_happiness'], 'h': p['height'], 'w': p['weight'],
            'evo': evo[d], 'learn': learn[d],
            'tm': sorted(move_tm[n] for n in tm_moves[d] if n in move_tm),
        }
        if tutor[d]:
            rec['tu'] = tutor[d]
        if s.get('is_legendary') or s.get('is_mythical'):
            rec['leg'] = 1
        SPECIES[d] = rec
        names_mon[d] = names_of(s['names'], 'mon', fallback=p['name'])
        names_genus[d] = names_of(s['genera'], 'genus', key='genus')
        dex_txt[d] = texts_of(s['flavor_text_entries'], cfg, 'dex text')

    # ---- items ----
    item_list = list(dict.fromkeys(cfg['items'] + sorted(tms)))
    items_raw = dict(zip(item_list, pmap(lambda n: get('item', n), item_list)))
    missing = [n for n, v in items_raw.items() if v is None]
    if missing:
        print('  ! items not found:', ', '.join(missing))
    cats = sorted({v['category']['name'] for v in items_raw.values() if v})
    cat_pocket = dict(zip(cats, [c['pocket']['name'] for c in pmap(lambda c: get('item-category', c), cats)]))
    POCKET = {'pokeballs': 'balls', 'machines': 'tms', 'key': 'key', 'berries': 'berries'}
    ITEMS, names_item, item_txt = {}, {}, {}
    for n, v in items_raw.items():
        if not v:
            continue
        # PokeAPI only has prices for a few items: shop prices live in js/data/item-effects.js.
        price = next((pr['purchase_price'] for pr in v.get('prices', [])
                      if pr['version_group']['name'] == cfg['tm_vg'] and pr.get('purchase_price')), None)
        rec = {'id': v['id'], 'pocket': POCKET.get(cat_pocket[v['category']['name']], 'items'), 'cat': v['category']['name']}
        if price:
            rec['cost'] = price
        if n in tms:
            rec['move'] = tms[n]
        ITEMS[n] = rec
        names_item[n] = names_of(v['names'], 'item', fallback=n)
        tcfg = dict(cfg, text_vgs=['heartgold-soulsilver'] + cfg['text_vgs']) if n in HGSS_TEXT else cfg
        item_txt[n] = texts_of(v.get('flavor_text_entries'), tcfg, 'item text', 'text', 'version_group')

    # ---- growth rates, natures, types, stats ----
    GROWTH = {}
    for g in pmap(lambda i: get('growth-rate', i), range(1, 7)):
        lv = {x['level']: x['experience'] for x in g['levels']}
        GROWTH[g['name']] = [0] + [lv[i] for i in range(1, 101)]
    nature_names = ['hardy', 'lonely', 'brave', 'adamant', 'naughty', 'bold', 'docile', 'relaxed', 'impish',
                    'lax', 'timid', 'hasty', 'serious', 'jolly', 'naive', 'modest', 'mild', 'quiet', 'bashful',
                    'rash', 'calm', 'gentle', 'sassy', 'careful', 'quirky']
    NATURES, names_nature = {}, {}
    for n, v in zip(nature_names, pmap(lambda n: get('nature', n), nature_names)):
        up, down = v.get('increased_stat'), v.get('decreased_stat')
        NATURES[n] = {'up': STAT[up['name']] if up else None, 'down': STAT[down['name']] if down else None}
        names_nature[n] = names_of(v['names'], 'nature', fallback=n)
    names_type = {t: names_of(get('type', t)['names'], 'type', fallback=t) for t in TYPES}
    names_stat = {}
    for s in ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed', 'accuracy', 'evasion']:
        names_stat[STAT[s]] = names_of(get('stat', s)['names'], 'stat', fallback=s)

    # ---- locations and encounters ----
    loc_list, loc_vers = [], {}
    for reg_name, versions in cfg['regions']:
        for l in get('region', reg_name)['locations']:
            if l['name'] not in loc_vers:
                loc_list.append(l['name'])
                loc_vers[l['name']] = versions
    locs = dict(zip(loc_list, pmap(lambda n: get('location', n), loc_list)))
    area_urls = [(l, a['url']) for l, v in locs.items() if v for a in v['areas']]
    areas = pmap(lambda la: (la[0], get_url(la[1])), area_urls)
    names_loc = {}
    for n, v in locs.items():
        if not v:
            continue
        entries = list(v['names'])
        ex = loc_extra(n)
        if ex:
            have = {e['language']['name'] for e in entries}
            for lang, name in zip(['es', 'it', 'zh-hans', 'zh-hant'], ex):
                if lang not in have:
                    entries.append({'language': {'name': lang}, 'name': name})
        if n in LOC_FR:
            entries = [e for e in entries if e['language']['name'] != 'fr'] + [{'language': {'name': 'fr'}, 'name': LOC_FR[n]}]
        names_loc[n] = names_of(entries, 'loc', fallback=n)
    ENC, dropped, used_versions = {}, set(), {}
    for loc, a in areas:
        if not a:
            continue
        by_v = {}
        for pe in a['pokemon_encounters']:
            dex = url_id(pe['pokemon']['url'])
            for vd in pe['version_details']:
                for ed in vd['encounter_details']:
                    conds = {c['name'] for c in ed.get('condition_values', [])}
                    if conds & SKIP_CONDITIONS:
                        continue                   # swarms, the radio: not in this game
                    time = next((t for t in TIMES if 'time-' + t in conds), None)
                    by_v.setdefault(vd['version']['name'], {}).setdefault(ed['method']['name'], []).append(
                        (dex, ed['min_level'], ed['max_level'], ed['chance'], time))
        # A place with no table in its region's versions (Routes 26 and 27 count as Kanto, but only
        # HeartGold has them) takes one from the other regions' versions.
        others = [v for _, vs in cfg['regions'] for v in vs if v not in loc_vers[loc]]
        ver = next((v for v in loc_vers[loc] + others if v in by_v), None)
        if not ver:
            continue
        used_versions[ver] = used_versions.get(ver, 0) + 1
        rates = {}
        for r in a.get('encounter_method_rates', []):
            for vd in r['version_details']:
                if vd['version']['name'] == ver:
                    rates[r['encounter_method']['name']] = vd['rate']
        methods = {}
        for meth, slots in by_v[ver].items():
            # One table per time of day (HeartGold's grass has morning, day and night slots).
            merged = {t: {} for t in TIMES}
            for dex, mn, mx, ch, time in slots:
                if not (lo <= dex <= hi):
                    dropped.add(dex)
                    continue
                for t in ([time] if time else TIMES):
                    merged[t][(dex, mn, mx)] = merged[t].get((dex, mn, mx), 0) + ch
            tables = {t: sorted(([d, mn, mx, ch] for (d, mn, mx), ch in m.items()), key=lambda r: (-r[3], r[0], r[1]))
                      for t, m in merged.items()}
            if tables['day']:
                rec = {'rate': rates.get(meth, 0), 'mons': tables['day']}
                for t in ('morning', 'night'):
                    if tables[t] and tables[t] != tables['day']:
                        rec[t] = tables[t]
                methods[meth] = rec
        if methods:
            ENC[a['name']] = {'loc': loc, 'ver': ver, **methods}
    if dropped:
        print(f'  encounters: left out {len(dropped)} species outside {lo}-{hi}')
    print('  encounter tables per version:', ', '.join(f'{k} {v}' for k, v in used_versions.items()))

    # ---- write ----
    head = lambda what: (f'/* ============ GENERATED by tools/fetch_data.py --region {region}: do not edit by hand ============\n'
                         f' * {what}\n * Data: PokeAPI (https://pokeapi.co/). See docs/DESIGN.md section 2 for the schema.\n */\n')
    write('species.js', head('Species: base stats [hp atk def spa spd spe], EV yield, catch rate (cr), base EXP (bx),\n'
                             ' * growth rate (gr), females in eighths (gf, -1 genderless), base friendship (fr), height/weight,\n'
                             ' * evolutions, level-up learnset [[level, move]] and TM/HM items.')
          + obj('G.SPECIES', SPECIES))
    write('moves.js', head('Moves (cat: physical | special | status; acc null = never misses; meta.k = PokeAPI move category)\n'
                           ' * and G.TMS: TM/HM item -> move, for this region\'s games.')
          + obj('G.MOVES', MOVES) + '\n' + obj('G.TMS', dict(sorted(tms.items()))))
    write('items.js', head('Items: bag pocket (items | balls | tms | key | berries), PokeAPI category, TM move,\n'
                           ' * and cost only when PokeAPI has a price for these games.\n'
                           ' * What each item does and the shop prices are hand-written in js/data/item-effects.js.')
          + obj('G.ITEMS', ITEMS))
    write('growth.js', head('Total EXP needed for each level (index = level, 1-100) per growth rate.')
          + obj('G.GROWTH', GROWTH))
    write('natures.js', head('Natures: the stat raised by 10 % and the one lowered (null for neutral natures).')
          + obj('G.NATURES', NATURES))
    names = {'langs': LANGS, 'mon': names_mon, 'move': names_move, 'item': names_item, 'type': names_type,
             'loc': names_loc, 'nature': names_nature, 'genus': names_genus, 'stat': names_stat}
    write('names.js', head('Official names, one column per language in the order of `langs`.\n'
                           ' * Brazilian Portuguese uses the English column. Read them through G.Names (core/names.js).')
          + nested('G.NAMES', names))
    write('encounters.js', head('Wild Pokémon per location area: { loc, ver, <method>: { rate, mons: [[dex, min, max, chance %]] } }.\n'
                                ' * Methods: walk (tall grass / caves), surf, old-rod, good-rod, super-rod, rock-smash...\n'
                                ' * Johto tables may add `morning` and `night` slot lists (`mons` is the daytime one).')
          + obj('G.ENCOUNTERS', dict(sorted(ENC.items()))))
    write('dex-text.js', head('Pokédex entries and move / item descriptions, one column per language (G.NAMES.langs order).')
          + nested('G.DEX_TEXT', {'mon': dex_txt, 'move': move_txt, 'item': item_txt}))

    print(f'  {len(SPECIES)} species · {len(MOVES)} moves · {len(tms)} TMs/HMs · {len(ITEMS)} items · '
          f'{len(ENC)} encounter areas · {len(names_loc)} locations')
    for kind, per in sorted(GAPS.items()):
        print(f'  names/texts falling back to English: {kind}: ' + ', '.join(f'{l} {n}' for l, n in per.items()))
    cross_check_chinese(names_mon)


def evo_rule(frm, to, details):
    """PokeAPI evolution details -> one simple rule (first trigger that applies)."""
    for d in details:
        trig = d['trigger']['name']
        if trig == 'level-up':
            rec = {'to': to, 'how': 'level', 'level': d.get('min_level') or 1}
            if d.get('relative_physical_stats') is not None:
                rec['stats'] = d['relative_physical_stats']     # Tyrogue: 1 Atk > Def, -1 Atk < Def, 0 equal
            if d.get('min_happiness'):
                rec = {'to': to, 'how': 'friendship', 'min': d['min_happiness']}
            if d.get('time_of_day'):
                rec['time'] = d['time_of_day']
            if d.get('known_move'):
                rec['move'] = d['known_move']['name']
            if d.get('location'):
                continue                       # place-based evolutions: not in Gen 1
            return rec
        if trig == 'use-item' and d.get('item'):
            return {'to': to, 'how': 'item', 'item': d['item']['name']}
        if trig == 'trade' and not d.get('held_item') and not d.get('trade_species'):
            return {'to': to, 'how': 'level', 'level': TRADE_LEVEL_OVERRIDE.get(frm, TRADE_LEVEL), 'via': 'trade'}
        if trig == 'trade' and d.get('held_item'):
            # A trade holding an item (Onix with a Metal Coat): the item is used like a stone.
            return {'to': to, 'how': 'item', 'item': d['held_item']['name'], 'via': 'trade'}
    print(f'  ! no usable evolution rule {frm} -> {to}: {[d["trigger"]["name"] for d in details]}')
    return None


def cross_check_chinese(names_mon):
    """Compares Chinese species names with PokéGo's tables (if that project is next to this one)."""
    pg = os.path.join(os.path.dirname(ROOT), 'PokeGo', 'js', 'data', 'lang-zh-cn-names.js')
    if not os.path.exists(pg):
        return
    txt = io.open(pg, encoding='utf-8').read()
    # The 'pokemon' context section maps dex numbers to names: { "1": "妙蛙种子", ... }
    pairs = dict(re.findall(r'"(\d+)":\s*"([^"]+)"', txt))
    diff = [(d, names_mon[d][4], pairs[str(d)]) for d in names_mon if str(d) in pairs and pairs[str(d)] != names_mon[d][4]]
    print(f'  zh-Hans species names vs PokéGo: {len(names_mon) - len(diff)} equal, {len(diff)} different'
          + (': ' + ', '.join(f'{d} {a}/{b}' for d, a, b in diff[:8]) if diff else ''))


# ---------------- JS output ----------------

def js(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':'))


def key(k):
    return str(k) if isinstance(k, int) or re.fullmatch(r'[A-Za-z_$][\w$]*', str(k)) else json.dumps(k)


def obj(var, d):
    """One entry per line, so diffs stay readable."""
    return var + ' = {\n' + ''.join(f'  {key(k)}: {js(v)},\n' for k, v in d.items()) + '};\n'


def nested(var, d):
    out = var + ' = {\n'
    for k, v in d.items():
        if isinstance(v, dict):
            out += f'  {key(k)}: {{\n' + ''.join(f'    {key(k2)}: {js(v2)},\n' for k2, v2 in v.items()) + '  },\n'
        else:
            out += f'  {key(k)}: {js(v)},\n'
    return out + '};\n'


def write(name, text):
    path = os.path.join(OUT, name)
    with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print(f'  wrote js/data/{name} ({len(text.encode("utf-8")) / 1024:.0f} KB)')


def main():
    global OFFLINE, REFRESH
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--region', default='kanto', choices=sorted(REGIONS))
    ap.add_argument('--offline', action='store_true', help='use only the cache')
    ap.add_argument('--refresh', action='store_true', help='download everything again')
    a = ap.parse_args()
    OFFLINE, REFRESH = a.offline, a.refresh
    build(a.region)
    print(f'  requests: {STATS["net"]} downloaded, {STATS["cache"]} from the cache')


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
