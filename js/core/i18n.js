/* ============ i18n.js — translations from English source text ============
 * The game is written in English and the English text is the dictionary key:
 *
 *   G.T('Continue')                              -> 'Continuar'
 *   G.I18n.fmt('{mon} used {move}!', { mon, move })
 *                                                -> '¡{mon} usó {move}!' with the slots filled
 *   G.T('Psychic', 'type')                       a context tells apart words that
 *                                                translate differently (type vs move)
 *
 * Placeholders are named ({mon}, {move}, {n}...) so a translation can put
 * them in any order. Names of Pokémon, moves, items, types and places are not
 * in these dictionaries: they come from the game data (G.Names, names.js).
 *
 * The static text of dev.html (titles, buttons) is translated automatically
 * by walking the DOM and watching it with a MutationObserver, by exact match
 * only. Text that code builds (dialog, battle messages, lists) is translated
 * by the code with G.T / fmt before inserting it, inside elements marked
 * translate="no" so the observer leaves it alone.
 *
 * Dictionaries: js/i18n/<lang>/<module>.js call G.I18n.add(dict, lang).
 * tools/build_langs.js bundles them per language into js/lang/<lang>.js,
 * which locales.js loads into window.PL_LANG_Q before the game runs.
 */
G.I18n = (() => {
  const SRC = 'en', KEY = 'pl.lang';
  const { choices, lang, locale } = window.PL_LOCALES;
  const supported = choices.map(([id]) => id);
  const exact = new Map();
  const contexts = new Map();          // context -> Map(key -> text)

  /** Adds translations { 'English text': 'translation' } for one language (only the active one is kept). */
  function add(dict, language, context = '') {
    if (language !== lang || language === SRC) return;
    const into = context ? (contexts.get(context) || contexts.set(context, new Map()).get(context)) : exact;
    for (const [k, v] of Object.entries(dict)) if (v) into.set(k, v);
  }
  for (const [d, l, c] of window.PL_LANG_Q || []) add(d, l, c);

  /** Translates one text to the current language (unknown text comes back as it is). */
  function t(s, context) {
    if (lang === SRC || typeof s !== 'string' || !s) return s;
    if (context) { const c = contexts.get(context); if (c && c.has(s)) return c.get(s); }
    const r = exact.get(s);
    return r === undefined ? s : r;
  }

  /** Translates a text with named slots and fills them: fmt('Lv. {n}', { n: 5 }). */
  function fmt(key, vars = {}, context) {
    return t(key, context).replace(/\{(\w+)\}/g, (m, k) => Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m);
  }

  /** Is this text translated in the current language? */
  const has = (s, context) => lang === SRC || (context ? !!(contexts.get(context) || new Map()).has(s) : exact.has(s));

  /** Number formatted for the player's locale (money, EXP). */
  const num = n => Number(n).toLocaleString(locale);

  // ---------------- DOM ----------------
  const ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];
  const skipEl = el => !!(el && el.closest && el.closest('[translate="no"], script, style, code'));

  function doText(n) {
    const p = n.parentElement;
    if (!p || skipEl(p)) return;
    const v = n.nodeValue;
    if (n.__tr === v) return;
    // Keep the surrounding spaces; inner runs of spaces and line breaks count as one.
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(v);
    const body = m[2].replace(/\s+/g, ' ');
    const r = body ? m[1] + t(body) + m[3] : v;
    n.__tr = r;
    if (r !== v) n.nodeValue = r;
  }
  function doEl(el) {
    if (skipEl(el)) return;
    for (const a of ATTRS) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) { const r = t(v); if (r !== v) el.setAttribute(a, r); }
    }
  }
  function walk(root) {
    if (lang === SRC || !root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || skipEl(root)) return;
    doEl(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else doEl(n); }
  }

  function startDom() {
    document.title = t('PokeLeague');
    if (lang === SRC) return;
    walk(document.body);
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doEl(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  // ---------------- canvas fonts ----------------
  // Pixelify has no Chinese glyphs: canvas text names good system fonts after it.
  const CJK = lang === 'zh-Hant' ? ',"PingFang TC","Microsoft JhengHei","Noto Sans CJK TC"'
            : lang === 'zh-Hans' ? ',"PingFang SC","Microsoft YaHei","Noto Sans CJK SC"' : '';
  /** Canvas font string: font(16) or font(14, 700). */
  const font = (size, weight = 400) => `${weight} ${size}px Pixelify${CJK},sans-serif`;

  function set(l) {
    if (!supported.includes(l)) return;
    try { localStorage.setItem(KEY, l); } catch (e) { /* storage can be blocked */ }
    location.reload();
  }

  return { SRC, choices, lang, locale, add, t, fmt, has, num, font, set, startDom, walk };
})();
G.T = G.I18n.t;
