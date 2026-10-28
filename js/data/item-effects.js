/* ============ item-effects.js — what each item does (hand-written) ============
 * Names, pockets and descriptions are generated (items.js, names.js, dex-text.js);
 * the behaviour and the shop prices are here. Prices are those of the Kanto
 * remakes; an item sells for half its price. Items with no price are not sold.
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
 *   held       held-item effect id (exp-share) — held items come after the first slice
 *   key        key item (cannot be sold, tossed or used on a Pokémon)
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
  // Berries (chapter 15): from berry trees, used like medicine (no held items yet).
  'oran-berry':    { heal: 10,  field: 1, battle: 1 },
  'sitrus-berry':  { heal: 30,  field: 1, battle: 1 },
  'pecha-berry':   { cure: ['psn', 'tox'], field: 1, battle: 1 },
  'cheri-berry':   { cure: ['par'], field: 1, battle: 1 },
  'chesto-berry':  { cure: ['slp'], field: 1, battle: 1 },
  'rawst-berry':   { cure: ['brn'], field: 1, battle: 1 },
  'aspear-berry':  { cure: ['frz'], field: 1, battle: 1 },
  'ether':         { pp: 10,     field: 1, battle: 1 },
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
  'metal-coat':    { evo: 1, field: 1, price: 2100 },
  'kings-rock':    { evo: 1, field: 1, price: 2100 },
  'dragon-scale':  { evo: 1, field: 1, price: 2100 },
  'up-grade':      { evo: 1, field: 1, price: 2100 },

  // ---- TMs sold in shops (Celadon Department Store) ----
  'tm05':          { price: 1000 },
  'tm15':          { price: 7500 },
  'tm28':          { price: 2000 },
  'tm31':          { price: 3000 },
  'tm43':          { price: 3000 },
  'tm45':          { price: 3000 },

  // ---- valuables (only for selling) ----
  'nugget':        { price: 10000 },
  'tiny-mushroom': { price: 500 },
  'big-mushroom':  { price: 5000 },
  'pearl':         { price: 1400 },
  'big-pearl':     { price: 7500 },
  'stardust':      { price: 2000 },
  'star-piece':    { price: 9800 },

  // ---- held ----
  'exp-share':     { held: 'exp-share' },

  // ---- key items ----
  'oaks-parcel':   { key: 1 },
  'squirt-bottle': { key: 1 },
  'secret-potion': { key: 1 },
  'town-map':      { key: 1, field: 1 },
  'bicycle':       { key: 1, field: 1 },
  'old-rod':       { key: 1, field: 1, rod: 1 },
  'good-rod':      { key: 1, field: 1, rod: 1 },
  'super-rod':     { key: 1, field: 1, rod: 1 },
  'ss-ticket':     { key: 1 },
  'poke-flute':    { key: 1, field: 1 },
  'silph-scope':   { key: 1 },
  'card-key':      { key: 1 },
  'lift-key':      { key: 1 },
  'secret-key':    { key: 1 },
  'coin-case':     { key: 1, field: 1 },
  'gold-teeth':    { key: 1 },
  'bike-voucher':  { key: 1 },
  'mystery-egg':   { key: 1 },

  // ---- fossils ----
  'helix-fossil':  { fossil: 138 },
  'dome-fossil':   { fossil: 140 },
  'old-amber':     { fossil: 142 }
};
