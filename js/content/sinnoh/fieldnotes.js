/* ============ fieldnotes.js — a notebook and a textbook in Jubilife's Trainers' School ============
 * Chapter 98 (the rules: js/world/field-abilities.js, G.FieldAbilities, Platinum's from its decompilation). Platinum shows none
 * of them happening, so a student's notebook on a desk in the Trainers' School (`jubilife-school`, jubilife.js) sums them up,
 * with the abilities' official names; the student beside it adds a word. Reading it once chapter 97 is done ends the chapter:
 * `ending(98)`. The notebook, the student and the words are my own.
 * Chapter 102 (the rules: wild double battles beside a partner, js/world/field.js and js/battle/battle.js, Platinum's): a
 * textbook on another desk ('1,6') explains them; reading it once chapter 101 is done ends the chapter: `ending(102)`. The
 * textbook and its words are my own.
 */
(() => {
  const T = s => G.T(s), fmt = (k, v) => G.I18n.fmt(k, v);
  const A = id => G.Names.ability(id);

  async function notes(h) {
    const F = G.Field;
    await h.say(T('A notebook lies open on the desk: "What the first Pokémon in your party does outside battle."'));
    await h.say(fmt('"{a} and {b}: more wild Pokémon. {c} and {d}: fewer. {e} in a sandstorm and {f} in the snow: fewer too."',
      { a: A('illuminate'), b: A('arena-trap'), c: A('stench'), d: A('white-smoke'), e: A('sand-veil'), f: A('snow-cloak') }));
    await h.say(fmt('"{a} and {b}: wild Pokémon much weaker than it often run off. {c}, {d} and {e}: wild Pokémon at their strongest more often."',
      { a: A('intimidate'), b: A('keen-eye'), c: A('hustle'), d: A('pressure'), e: A('vital-spirit') }));
    await h.say(fmt('"{a}: more Steel types. {b}: more Electric types. {c}: often the same nature as it. {d}: often the other gender."',
      { a: A('magnet-pull'), b: A('static'), c: A('synchronize'), d: A('cute-charm') }));
    await h.say(fmt('"{a} and {b} sometimes find something after a battle won. With {c} or {d} in the party, Eggs hatch twice as fast."',
      { a: A('pickup'), b: A('honey-gather'), c: A('flame-body'), d: A('magma-armor') }));
    // The end of the ninety-eighth chapter (credits-ui.js), once the ninety-seventh is done.
    if (F.flag('chapter-97-done') && !F.flag('chapter-98-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(98); else F.setFlag('chapter-98-done');
    }
  }

  /** Chapter 102: the textbook on battling beside a partner. */
  async function partners(h) {
    const F = G.Field;
    await h.say(T('A textbook lies on the desk: "Walking with a Partner."'));
    await h.say(T('"When someone walks with you through tall grass or a cave, wild Pokémon often come out two at a time. You and your partner battle them together."'));
    await h.say(T('"A Poké Ball cannot be aimed while two wild Pokémon are out. Knock one out first, then throw at the other."'));
    await h.say(T('"On the water, your partner still battles beside you, though only one wild Pokémon comes at a time."'));
    // The end of the hundred and second chapter (credits-ui.js), once the hundred and first is done.
    if (F.flag('chapter-101-done') && !F.flag('chapter-102-done')) {
      if (G.CreditsUI) await G.CreditsUI.ending(102); else F.setFlag('chapter-102-done');
    }
  }

  G.Script.def({ 'fieldnotes.read': [['js', notes]], 'fieldnotes.partners': [['js', partners]] });
})();
