/* ============ field-abilities.js — G.FieldAbilities: abilities that work outside battle (chapter 98) ============
 * Platinum's rules, from its decompilation (github.com/pret/pokeplatinum): the first Pokémon in the party (slot 0, fainted or
 * not; an Egg has none) changes the wild Pokémon met (src/overlay006/wild_encounters.c), Pickup and Honey Gather find items
 * after a battle won (src/battle/battle_script.c, BtlCmd_GenerateEndOfBattleItem; include/data/pickup.h, no message), and
 * Flame Body or Magma Armor anywhere in the party makes Eggs hatch twice as fast (src/overlay005/daycare.c).
 *   rate(ab, method, weather)   -> the encounter rate's factor: Illuminate, Arena Trap, No Guard x2; Stench, White Smoke,
 *                                  Quick Feet x1/2; Sand Veil in a sandstorm, Snow Cloak in the snow x1/2; never when fishing
 *   slot(ab, mons, rng)         -> Magnet Pull (Steel) or Static (Electric): half the time a row of that type, at random
 *                                  among them (Platinum picks among its 12 slots; this game's rows are one species each: my
 *                                  own simplification); null otherwise, or when no row or every row is of that type
 *   level(ab, row, rng)         -> Hustle, Vital Spirit, Pressure: half the time the row's highest level; else a level at random
 *   blocks(ab, lead, lvl, rng)  -> Keen Eye, Intimidate: a wild Pokémon 5 or more levels below a lead above level 5 is not met
 *                                  half the time
 *   traits(ab, lead, sp, rng)   -> { nature, gender } for the wild one: Synchronize, the lead's nature half the time; Cute
 *                                  Charm, the other gender two times in three (a species with both genders only)
 *   pickup(mon, rng)            -> the item Pickup (one time in ten, by its level: 9 common items, 2 rare) or Honey Gather
 *                                  (5% at levels 1-10 ... 50% at 91-100) finds after a battle won, holding nothing; or null
 *   eggFactor(party)            -> 2 with Flame Body or Magma Armor in the party, else 1
 *   lead(party) · ab(mon)       -> the first Pokémon (slot 0) and its ability
 * Each rule draws from the RNG only when its ability is there, so without them every encounter is the same as before.
 * Left out: Sticky Hold and Suction Cups (Platinum's code means them to raise the bite rate, but its line `newEncRate * 2;`
 * stores nothing, so they do nothing there either), Compound Eyes (wild Pokémon hold no items in this game).
 */
G.FieldAbilities = (() => {
  const ab = mon => (mon && !mon.egg && G.Abilities ? G.Abilities.of(mon) : null);
  const lead = party => (party && party[0]) || null;

  function rate(a, method, weather) {
    if (!a || /-rod$/.test(method || '')) return 1;
    if (a === 'illuminate' || a === 'arena-trap' || a === 'no-guard') return 2;
    if (a === 'sand-veil') return weather === 'sand' ? 0.5 : 1;
    if (a === 'snow-cloak') return weather === 'hail' ? 0.5 : 1;
    if (a === 'white-smoke' || a === 'quick-feet' || a === 'stench') return 0.5;
    return 1;
  }

  const TYPE = { 'magnet-pull': 'steel', static: 'electric' };
  function slot(a, mons, rng) {
    const type = TYPE[a];
    if (!type || rng.int(0, 1) !== 0) return null;
    const of = row => { const sp = G.Maps.species(row[0]); return sp != null && G.SPECIES[sp].types.includes(type); };
    const match = mons.filter(of);
    if (!match.length || match.length === mons.length) return null;
    return match[rng.int(0, match.length - 1)];
  }

  function level(a, row, rng) {
    const [lo, hi] = row[1] <= row[2] ? [row[1], row[2]] : [row[2], row[1]];
    if (a === 'hustle' || a === 'vital-spirit' || a === 'pressure') {
      const lvl = rng.int(lo, hi);
      return rng.int(0, 1) === 0 ? lvl : hi;
    }
    return rng.int(lo, hi);
  }

  function blocks(a, leadMon, lvl, rng) {
    if ((a !== 'keen-eye' && a !== 'intimidate') || !leadMon || leadMon.lvl <= 5) return false;
    return lvl <= leadMon.lvl - 5 && rng.int(0, 1) === 0;
  }

  function traits(a, leadMon, sp, rng) {
    const out = {};
    if (a === 'synchronize' && leadMon && rng.int(0, 1) === 0) out.nature = leadMon.nature;
    const gf = G.SPECIES[sp] ? G.SPECIES[sp].gf : -1;
    if (a === 'cute-charm' && leadMon && leadMon.gender && gf > 0 && gf < 8 && rng.int(0, 2) > 0) out.gender = leadMon.gender === 'f' ? 'm' : 'f';
    return out;
  }

  // Platinum's tables (include/data/pickup.h): a level's window of nine common items, then two rare ones.
  const COMMON = ['potion', 'antidote', 'super-potion', 'great-ball', 'repel', 'escape-rope', 'full-heal', 'hyper-potion', 'ultra-ball',
                  'revive', 'rare-candy', 'dusk-stone', 'shiny-stone', 'dawn-stone', 'full-restore', 'max-revive', 'pp-up', 'max-elixir'];
  const RARE = ['hyper-potion', 'nugget', 'kings-rock', 'full-restore', 'ether', 'white-herb', 'tm44', 'elixir', 'tm01', 'leftovers', 'tm26'];
  const COMMON_RATE = [30, 40, 50, 60, 70, 80, 90, 94, 98];
  const HONEY_RATE = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  function pickup(mon, rng) {
    if (!mon || mon.egg || mon.item) return null;
    const a = ab(mon);
    if (a === 'pickup') {
      if (rng.int(0, 9) !== 0) return null;
      const r = rng.int(0, 99), k = Math.min(9, Math.floor((mon.lvl - 1) / 10));
      if (r >= 98) return RARE[k + (99 - r)];
      return COMMON[k + COMMON_RATE.findIndex(x => x > r)];
    }
    if (a === 'honey-gather') {
      const k = Math.min(9, Math.max(0, Math.ceil(mon.lvl / 10) - 1));
      return rng.int(0, 99) < HONEY_RATE[k] ? 'honey' : null;
    }
    return null;
  }

  const eggFactor = party => ((party || []).some(m => m && !m.egg && (ab(m) === 'flame-body' || ab(m) === 'magma-armor')) ? 2 : 1);

  return { ab, lead, rate, slot, level, blocks, traits, pickup, eggFactor, COMMON, RARE, COMMON_RATE, HONEY_RATE };
})();
