/* ============ item-effects.js — what each item does (hand-written) ============
 * Names, pockets and descriptions are generated (items.js, names.js, dex-text.js);
 * the behaviour and the shop prices are here. Prices are those of the Kanto
 * remakes; an item sells for half its price. Items with no price are not sold.
 * The five plain berries (Cheri, Chesto, Pecha, Rawst, Aspear) cost 100 at Hearthome's Poffin House (chapter 85; my own price).
 *
 *   price      shop price (sell = floor(price / 2))
 *   field: 1   usable from the bag outside battle      battle: 1  usable in battle
 *   ball       catch-rate multiplier (master-ball: 255 = always catches)
 *   heal       HP restored (number, or 'full')
 *   cure       statuses cured: 'all' or a list of psn | tox | brn | par | slp | frz | confusion
 *   revive     fraction of max HP a fainted Pokémon comes back with
 *   pp         PP restored ('full' or a number); ppAll: to every move, else to one move
 *   stage      [stat, stages] raised in battle (X items); dire-hit: crit +2 stages; guard-spec: mist
 *   ev         [stat, points] (vitamins, up to 100 EVs from items)
 *   ppUp       PP Up (+1) / PP Max (+3) steps on one move
 *   level      Rare Candy: +1 level
 *   repel      steps without wild encounters (weaker than your lead)
 *   escape     back to the last Pokémon Center door (outside towns)
 *   evo        evolution stone (G.SPECIES[..].evo has { how:'item', item })
 *   held       what it does when a Pokémon holds it (chapter 26, js/battle/held.js): 'boost' (+ type),
 *              'berry' (its heal / cure, eaten when needed), 'leftovers', 'quick-claw', 'everstone'…
 *   key        key item (cannot be sold, tossed or used on a Pokémon); stack: 1, the Bag shows how many
 *   fossil     the species a lab brings back from it
 */
G.ITEM_FX = {
  // ---- balls ----
  'poke-ball':     { ball: 1,   battle: 1, price: 200 },
  'great-ball':    { ball: 1.5, battle: 1, price: 600 },
  'ultra-ball':    { ball: 2,   battle: 1, price: 1200 },
  'master-ball':   { ball: 255, battle: 1 },
  'safari-ball':   { ball: 1.5, battle: 1 },
  'sport-ball':    { ball: 1.5, battle: 1 },
  // Kurt's Apricorn Balls (chapter 23): ×1 here; what they are good at is in G.Capture.ballMod.
  'level-ball':    { ball: 1, battle: 1 },
  'lure-ball':     { ball: 1, battle: 1 },
  'moon-ball':     { ball: 1, battle: 1 },
  'friend-ball':   { ball: 1, battle: 1 },
  'fast-ball':     { ball: 1, battle: 1 },
  'heavy-ball':    { ball: 1, battle: 1 },
  'love-ball':     { ball: 1, battle: 1 },
  // Chapter 105: Generations 3 and 4's special balls, x1 here; what they are good at is in G.Capture.ballMod (Platinum's
  // prices; the Premier Ball is not sold: one comes free with ten Poké Balls bought at once).
  'net-ball':      { ball: 1, battle: 1, price: 1000 },
  'dive-ball':     { ball: 1, battle: 1, price: 1000 },
  'nest-ball':     { ball: 1, battle: 1, price: 1000 },
  'repeat-ball':   { ball: 1, battle: 1, price: 1000 },
  'timer-ball':    { ball: 1, battle: 1, price: 1000 },
  'luxury-ball':   { ball: 1, battle: 1, price: 1000 },
  'premier-ball':  { ball: 1, battle: 1 },
  'dusk-ball':     { ball: 1, battle: 1, price: 1000 },
  'heal-ball':     { ball: 1, battle: 1, price: 300 },
  'quick-ball':    { ball: 1, battle: 1, price: 1000 },

  // ---- medicine ----
  'potion':        { heal: 20,     field: 1, battle: 1, price: 300 },
  'super-potion':  { heal: 50,     field: 1, battle: 1, price: 700 },
  'hyper-potion':  { heal: 200,    field: 1, battle: 1, price: 1200 },
  'max-potion':    { heal: 'full', field: 1, battle: 1, price: 2500 },
  'full-restore':  { heal: 'full', cure: 'all', field: 1, battle: 1, price: 3000 },
  'revive':        { revive: 0.5,  field: 1, battle: 1, price: 1500 },
  'max-revive':    { revive: 1,    field: 1, battle: 1 },
  'antidote':      { cure: ['psn', 'tox'], field: 1, battle: 1, price: 100 },
  'paralyze-heal': { cure: ['par'], field: 1, battle: 1, price: 200 },
  'awakening':     { cure: ['slp'], field: 1, battle: 1, price: 250 },
  'burn-heal':     { cure: ['brn'], field: 1, battle: 1, price: 250 },
  'ice-heal':      { cure: ['frz'], field: 1, battle: 1, price: 250 },
  'full-heal':     { cure: 'all',   field: 1, battle: 1, price: 600 },
  'old-gateau':    { cure: 'all',   field: 1, battle: 1 },             // the Old Chateau (chapter 69)
  // Berries (chapter 15): from berry trees, used like medicine; held (chapter 26), eaten when needed.
  'oran-berry':    { heal: 10,  field: 1, battle: 1, held: 'berry' },
  'sitrus-berry':  { heal: 30,  field: 1, battle: 1, held: 'berry' },
  'liechi-berry':  { held: 'berry', pinch: 'atk' },     // Mirage Island (chapter 77): +1 Attack at a quarter of its HP
  'salac-berry':   { held: 'berry', pinch: 'spe' },     // Greta's Heracross (chapter 79): +1 Speed at a quarter of its HP
  'lum-berry':     { cure: 'all', field: 1, battle: 1, held: 'berry' },   // any status (chapter 79; not confusion here)
  'white-herb':    { held: 'white-herb' },              // lowered stats back to normal, once (chapter 80)
  'pecha-berry':   { cure: ['psn', 'tox'], field: 1, battle: 1, held: 'berry', price: 100 },
  'cheri-berry':   { cure: ['par'], field: 1, battle: 1, held: 'berry', price: 100 },
  'chesto-berry':  { cure: ['slp'], field: 1, battle: 1, held: 'berry', price: 100 },
  'rawst-berry':   { cure: ['brn'], field: 1, battle: 1, held: 'berry', price: 100 },
  'aspear-berry':  { cure: ['frz'], field: 1, battle: 1, held: 'berry', price: 100 },
  'ether':         { pp: 10,     field: 1, battle: 1, price: 1200 },
  'max-ether':     { pp: 'full', field: 1, battle: 1 },
  'elixir':        { pp: 10,     ppAll: 1, field: 1, battle: 1 },
  'max-elixir':    { pp: 'full', ppAll: 1, field: 1, battle: 1 },
  'fresh-water':   { heal: 50,  field: 1, battle: 1, price: 200 },
  'soda-pop':      { heal: 60,  field: 1, battle: 1, price: 300 },
  'lemonade':      { heal: 80,  field: 1, battle: 1, price: 350 },
  'moomoo-milk':   { heal: 100, field: 1, battle: 1, price: 500 },

  // ---- battle items ----
  'x-attack':      { stage: ['atk', 1], battle: 1, price: 500 },
  'x-defense':     { stage: ['def', 1], battle: 1, price: 550 },
  'x-speed':       { stage: ['spe', 1], battle: 1, price: 350 },
  'x-accuracy':    { stage: ['acc', 1], battle: 1, price: 950 },
  'x-sp-atk':      { stage: ['spa', 1], battle: 1, price: 350 },
  'dire-hit':      { crit: 2,  battle: 1, price: 650 },
  'guard-spec':    { mist: 1,  battle: 1, price: 700 },

  // ---- growth ----
  'hp-up':         { ev: ['hp', 10],  field: 1, price: 9800 },
  'protein':       { ev: ['atk', 10], field: 1, price: 9800 },
  'iron':          { ev: ['def', 10], field: 1, price: 9800 },
  'calcium':       { ev: ['spa', 10], field: 1, price: 9800 },
  'zinc':          { ev: ['spd', 10], field: 1, price: 9800 },
  'carbos':        { ev: ['spe', 10], field: 1, price: 9800 },
  'pp-up':         { ppUp: 1, field: 1, price: 9800 },
  'pp-max':        { ppUp: 3, field: 1 },
  'rare-candy':    { level: 1, field: 1, price: 4800 },

  // ---- field ----
  'escape-rope':   { escape: 1, field: 1, price: 550 },
  'repel':         { repel: 100, field: 1, price: 350 },
  'super-repel':   { repel: 200, field: 1, price: 500 },
  'max-repel':     { repel: 250, field: 1, price: 700 },
  'fire-stone':    { evo: 1, field: 1, price: 2100 },
  'water-stone':   { evo: 1, field: 1, price: 2100 },
  'thunder-stone': { evo: 1, field: 1, price: 2100 },
  'leaf-stone':    { evo: 1, field: 1, price: 2100 },
  'moon-stone':    { evo: 1, field: 1, price: 2100 },
  'sun-stone':     { evo: 1, field: 1, price: 2100 },
  // Items that make a Pokémon evolve when it is traded holding them: used like a stone here.
  'metal-coat':    { evo: 1, field: 1, price: 2100, held: 'boost', type: 'steel' },
  'kings-rock':    { evo: 1, field: 1, price: 2100, held: 'kings-rock' },
  // Clamperl's (chapter 28): its evolution, or held, its Sp. Atk / Sp. Def ×2.
  'deep-sea-tooth': { evo: 1, field: 1, price: 2100, held: 'deep-sea-tooth' },
  'deep-sea-scale': { evo: 1, field: 1, price: 2100, held: 'deep-sea-scale' },
  'dragon-scale':  { evo: 1, field: 1, price: 2100 },
  'up-grade':      { evo: 1, field: 1, price: 2100 },
  // Chapter 44 (Sinnoh): stones, and the items a trade evolution needs (used like a stone here).
  'shiny-stone':   { evo: 1, field: 1, price: 2100 },
  'dusk-stone':    { evo: 1, field: 1, price: 2100 },
  'dawn-stone':    { evo: 1, field: 1, price: 2100 },
  'ice-stone':     { evo: 1, field: 1, price: 2100 },          // Glaceon (as in later games)
  'protector':     { evo: 1, field: 1, price: 2100 },
  'electirizer':   { evo: 1, field: 1, price: 2100 },
  'magmarizer':    { evo: 1, field: 1, price: 2100 },
  'dubious-disc':  { evo: 1, field: 1, price: 2100 },
  'reaper-cloth':  { evo: 1, field: 1, price: 2100 },
  // Held to evolve on a level up (Gligar's Razor Fang at night, Happiny's Oval Stone by day); in battle the
  // Razor Claw raises the critical-hit stage and the Razor Fang may make the foe flinch.
  'razor-claw':    { held: 'razor-claw', price: 2100 },
  'razor-fang':    { held: 'razor-fang', price: 2100 },
  'oval-stone':    { held: 'oval-stone', price: 2100 },

  // ---- TMs sold in shops (Celadon Department Store) ----
  'tm05':          { price: 1000 },
  'tm15':          { price: 7500 },
  'tm28':          { price: 2000 },
  'tm31':          { price: 3000 },
  'tm43':          { price: 3000 },
  'tm45':          { price: 3000 },
  // Goldenrod's Department Store (its counter showed only priced TMs until chapter 35).
  'tm10':          { price: 3000 },
  'tm11':          { price: 2000 },
  'tm16':          { price: 2000 },
  'tm17':          { price: 3000 },
  'tm18':          { price: 2000 },
  'tm20':          { price: 2000 },
  'tm33':          { price: 2000 },
  // Lilycove's Department Store (chapter 35).
  'tm14':          { price: 5500 },
  'tm25':          { price: 5500 },
  'tm38':          { price: 5500 },

  // ---- valuables (only for selling) ----
  'nugget':        { price: 10000 },
  'tiny-mushroom': { price: 500 },
  'big-mushroom':  { price: 5000 },
  'pearl':         { price: 1400 },
  'big-pearl':     { price: 7500 },
  'stardust':      { price: 2000 },
  'star-piece':    { price: 9800 },

  // ---- held (chapter 26; G.Held, js/battle/held.js) ----
  'exp-share':     { held: 'exp-share' },
  'leftovers':     { held: 'leftovers' },
  'quick-claw':    { held: 'quick-claw' },
  'focus-band':    { held: 'focus-band', price: 8000 },
  'scope-lens':    { held: 'scope-lens', price: 8000 },
  'bright-powder': { held: 'bright-powder', price: 8000 },
  'shell-bell':    { held: 'shell-bell', price: 8000 },
  // Chapter 104 (Platinum's gifts): friendship gains x1.5; Speed halved and EVs doubled (held.js, exp.js).
  'soothe-bell':   { held: 'soothe-bell' },
  'macho-brace':   { held: 'macho-brace' },
  'lucky-egg':     { held: 'lucky-egg', price: 10000 },
  'amulet-coin':   { held: 'amulet-coin', price: 10000 },
  'everstone':     { held: 'everstone', price: 3000 },
  'smoke-ball':    { held: 'smoke-ball', price: 3000 },
  'light-ball':    { held: 'light-ball' },
  'thick-club':    { held: 'thick-club' },
  'metal-powder':  { held: 'metal-powder' },
  'lucky-punch':   { held: 'lucky-punch' },
  'stick':         { held: 'stick' },
  // Chapter 60: 1.2× two types' moves, in the hands of one Pokémon only.
  'adamant-orb':   { held: 'orb', sp: 483, types: ['dragon', 'steel'] },
  'lustrous-orb':  { held: 'orb', sp: 484, types: ['dragon', 'water'] },
  // 1.2× the power of one type's moves (and Metal Coat above).
  'silk-scarf':    { held: 'boost', type: 'normal',   price: 2000 },
  'charcoal':      { held: 'boost', type: 'fire',     price: 2000 },
  'mystic-water':  { held: 'boost', type: 'water',    price: 2000 },
  'miracle-seed':  { held: 'boost', type: 'grass',    price: 2000 },
  'magnet':        { held: 'boost', type: 'electric', price: 2000 },
  'never-melt-ice': { held: 'boost', type: 'ice',     price: 2000 },
  'black-belt':    { held: 'boost', type: 'fighting', price: 2000 },
  'poison-barb':   { held: 'boost', type: 'poison',   price: 2000 },
  'soft-sand':     { held: 'boost', type: 'ground',   price: 2000 },
  'sharp-beak':    { held: 'boost', type: 'flying',   price: 2000 },
  'twisted-spoon': { held: 'boost', type: 'psychic',  price: 2000 },
  'silver-powder': { held: 'boost', type: 'bug',      price: 2000 },
  'hard-stone':    { held: 'boost', type: 'rock',     price: 2000 },
  'spell-tag':     { held: 'boost', type: 'ghost',    price: 2000 },
  'dragon-fang':   { held: 'boost', type: 'dragon',   price: 2000 },
  'black-glasses': { held: 'boost', type: 'dark',     price: 2000 },
  // Chapter 69: the Dread Plate (the Old Chateau) and the Cleanse Tag (the Lost Tower).
  'dread-plate':   { held: 'boost', type: 'dark', plate: 1 },
  'splash-plate':  { held: 'boost', type: 'water', plate: 1 },          // Sea Route 220 (chapter 71)
  'spooky-plate':  { held: 'boost', type: 'ghost', plate: 1 },          // Amity Square (chapter 72)
  // Chapter 94: the other plates, where Platinum has them (plate: Arceus's Multitype takes their type).
  'flame-plate':   { held: 'boost', type: 'fire', plate: 1 },
  'zap-plate':     { held: 'boost', type: 'electric', plate: 1 },
  'meadow-plate':  { held: 'boost', type: 'grass', plate: 1 },
  'icicle-plate':  { held: 'boost', type: 'ice', plate: 1 },
  'fist-plate':    { held: 'boost', type: 'fighting', plate: 1 },
  'toxic-plate':   { held: 'boost', type: 'poison', plate: 1 },
  'earth-plate':   { held: 'boost', type: 'ground', plate: 1 },
  'sky-plate':     { held: 'boost', type: 'flying', plate: 1 },
  'mind-plate':    { held: 'boost', type: 'psychic', plate: 1 },
  'insect-plate':  { held: 'boost', type: 'bug', plate: 1 },
  'stone-plate':   { held: 'boost', type: 'rock', plate: 1 },
  'draco-plate':   { held: 'boost', type: 'dragon', plate: 1 },
  'iron-plate':    { held: 'boost', type: 'steel', plate: 1 },
  'shed-shell':    { held: 'shed-shell' },                    // it can always switch out
  'mental-herb':   { held: 'mental-herb' },                   // infatuation cured at once, once
  'destiny-knot':  { held: 'destiny-knot' },                  // infatuated, it infatuates the one who did it
  'cleanse-tag':   { held: 'cleanse-tag' },
  'light-clay':    { held: 'light-clay' },     // Mt. Coronet B1F (chapter 74): Reflect and Light Screen last 8 turns
  // Chapter 93: Generation 4's held items (js/battle/held.js says what each kind does).
  'choice-band':   { held: 'choice', stat: 'atk' },          // x1.5, one move until it switches out
  'choice-specs':  { held: 'choice', stat: 'spa' },
  'choice-scarf':  { held: 'choice', stat: 'spe' },
  'focus-sash':    { held: 'focus-sash' },                   // at full HP it holds on with 1 HP, once
  'life-orb':      { held: 'life-orb' },                     // x1.3 damage, a tenth of its HP after each move that hits
  'muscle-band':   { held: 'muscle-band' },                  // physical moves x1.1
  'wise-glasses':  { held: 'wise-glasses' },                 // special moves x1.1
  'expert-belt':   { held: 'expert-belt' },                  // super effective x1.2
  'metronome':     { held: 'metronome' },                    // the same move again and again: +10% each time, x2 at most
  'wide-lens':     { held: 'wide-lens' },                    // accuracy x1.1
  'zoom-lens':     { held: 'zoom-lens' },                    // accuracy x1.2 after its target has moved
  'big-root':      { held: 'big-root' },                     // HP drained, from Leech Seed and Ingrain x1.3
  'black-sludge':  { held: 'black-sludge' },                 // poison types 1/16 back a turn, the others 1/8 lost
  'iron-ball':     { held: 'iron-ball' },                    // Speed halved; Ground moves hit it even in the air
  'lagging-tail':  { held: 'lagging-tail' },                 // it moves last
  'power-weight':  { held: 'power', ev: 0 },                 // Speed halved; +4 EVs in that stat (HP)
  'power-bracer':  { held: 'power', ev: 1 },                 // Attack
  'power-belt':    { held: 'power', ev: 2 },                 // Defense
  'power-lens':    { held: 'power', ev: 3 },                 // Sp. Atk
  'power-band':    { held: 'power', ev: 4 },                 // Sp. Def
  'power-anklet':  { held: 'power', ev: 5 },                 // Speed
  'toxic-orb':     { held: 'status-orb', status: 'tox' },    // badly poisons it at the end of a turn
  'flame-orb':     { held: 'status-orb', status: 'brn' },    // burns it at the end of a turn
  'power-herb':    { held: 'power-herb' },                   // a two-turn move at once, once
  'grip-claw':     { held: 'grip-claw' },                    // its binding moves last five turns
  'persim-berry':  { cure: ['confusion'], battle: 1, held: 'berry' },
  'ganlon-berry':  { held: 'berry', pinch: 'def' },
  'petaya-berry':  { held: 'berry', pinch: 'spa' },
  'apicot-berry':  { held: 'berry', pinch: 'spd' },
  'lansat-berry':  { held: 'berry', pinch: 'crit' },         // its critical-hit ratio up, as Focus Energy
  'starf-berry':   { held: 'berry', pinch: 'random' },       // a random stat +2
  // Half the damage of a super-effective move of its type, once (the Chilan Berry: any Normal move).
  'occa-berry':    { held: 'resist', type: 'fire' },
  'passho-berry':  { held: 'resist', type: 'water' },
  'wacan-berry':   { held: 'resist', type: 'electric' },
  'rindo-berry':   { held: 'resist', type: 'grass' },
  'yache-berry':   { held: 'resist', type: 'ice' },
  'chople-berry':  { held: 'resist', type: 'fighting' },
  'kebia-berry':   { held: 'resist', type: 'poison' },
  'shuca-berry':   { held: 'resist', type: 'ground' },
  'coba-berry':    { held: 'resist', type: 'flying' },
  'payapa-berry':  { held: 'resist', type: 'psychic' },
  'tanga-berry':   { held: 'resist', type: 'bug' },
  'charti-berry':  { held: 'resist', type: 'rock' },
  'kasib-berry':   { held: 'resist', type: 'ghost' },
  'haban-berry':   { held: 'resist', type: 'dragon' },
  'colbur-berry':  { held: 'resist', type: 'dark' },
  'babiri-berry':  { held: 'resist', type: 'steel' },
  'chilan-berry':  { held: 'resist', type: 'normal', any: true },
  // Chapter 97: the incenses (Generation 4's effects; held by a parent at the Day Care, a baby hatches: daycare.js).
  // Not sold in Platinum: no price.
  'sea-incense':   { held: 'boost', type: 'water' },
  'wave-incense':  { held: 'boost', type: 'water' },
  'rock-incense':  { held: 'boost', type: 'rock' },
  'odd-incense':   { held: 'boost', type: 'psychic' },
  'rose-incense':  { held: 'boost', type: 'grass' },
  'lax-incense':   { held: 'bright-powder' },                // moves against it a tenth less accurate
  'full-incense':  { held: 'lagging-tail' },                 // it moves last
  'luck-incense':  { held: 'amulet-coin' },                  // double prize money (not twice with an Amulet Coin)
  'pure-incense':  { held: 'cleanse-tag' },                  // on the lead, a third fewer wild Pokémon
  // Chapter 98: Honey, from Honey Gather after a battle won; sold for Platinum's price by Floaroma's Honey seller (100).
  // Spreading it on trees is left out.
  'honey':         { price: 100, field: 1, scent: 1 },    // chapter 103: used from the Bag, as Sweet Scent (field.js)
  // Chapter 100: the Azure Flute (the Celestic elder's, for all sixteen plates; origin.js).
  'azure-flute':   { key: 1 },

  // ---- key items ----
  'oaks-parcel':   { key: 1 },
  'squirt-bottle': { key: 1 },
  'secret-potion': { key: 1 },
  'old-charm':     { key: 1 },
  'lunar-wing':    { key: 1 },                // Fullmoon Island (chapter 70): it chases bad dreams away
  'red-scale':     { key: 1 },
  'basement-key':  { key: 1 },
  'galactic-key':  { key: 1 },
  'clear-bell':    { key: 1 },
  'silver-wing':   { key: 1 },
  // Chapter 23: the Apricorn Box (from Kurt) and the Apricorns it holds (`stack`: the Bag shows how many).
  'apricorn-box':  { key: 1 },
  'red-apricorn':  { key: 1, stack: 1 },
  'blue-apricorn': { key: 1, stack: 1 },
  'yellow-apricorn': { key: 1, stack: 1 },
  'green-apricorn': { key: 1, stack: 1 },
  'pink-apricorn': { key: 1, stack: 1 },
  'white-apricorn': { key: 1, stack: 1 },
  'black-apricorn': { key: 1, stack: 1 },
  // Chapter 24: which of Unown's letters you have caught (the Bag shows them).
  'unown-report':  { key: 1, field: 1 },
  'town-map':      { key: 1, field: 1 },
  'bicycle':       { key: 1, field: 1 },
  'old-rod':       { key: 1, field: 1, rod: 1 },
  'good-rod':      { key: 1, field: 1, rod: 1 },
  'super-rod':     { key: 1, field: 1, rod: 1 },
  'ss-ticket':     { key: 1 },
  'poke-flute':    { key: 1, field: 1 },
  'poke-radar':    { key: 1, field: 1 },    // chapter 106: used in tall grass (G.World.pokeRadar, radar.js)
  'silph-scope':   { key: 1 },
  'card-key':      { key: 1 },
  'lift-key':      { key: 1 },
  'secret-key':    { key: 1 },
  'coin-case':     { key: 1, field: 1 },
  'gold-teeth':    { key: 1 },
  'bike-voucher':  { key: 1 },
  'mystery-egg':   { key: 1 },
  // Hoenn (chapter 30): the parts stolen from the Devon Corporation, Mr. Stone's letter to his son.
  'devon-goods':   { key: 1 },
  'letter':        { key: 1 },
  // Chapter 32: the Meteorite Team Magma took from Meteor Falls, the Go-Goggles for the desert's sandstorm.
  'meteorite':     { key: 1 },
  'go-goggles':    { key: 1 },
  // Chapter 34: Steven's Devon Scope shows Pokémon that cannot be seen (the Kecleon at Fortree's Gym).
  'devon-scope':   { key: 1 },
  // Chapter 42: the Eon Ticket, for the ferry from Lilycove City to Southern Island.
  'eon-ticket':    { key: 1 },

  // ---- fossils ----
  'helix-fossil':  { fossil: 138 },
  'dome-fossil':   { fossil: 140 },
  'old-amber':     { fossil: 142 }
};
