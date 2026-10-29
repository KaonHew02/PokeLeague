/* ============ kurt.js — Kurt's Apricorn Balls ============
 * Chapter 23, after Lugia (flag lugia-met; the elder in Ecruteak sends you, ecruteak.js). Kurt's
 * back has healed: he gives the Apricorn Box (key item) and makes a ball out of each Apricorn you
 * bring him, there and then. As in HeartGold and SoulSilver: Red → Level Ball, Blue → Lure Ball,
 * Yellow → Moon Ball, Green → Friend Ball, Pink → Love Ball, White → Fast Ball, Black → Heavy Ball
 * (what each one is good at: G.Capture.ballMod). Apricorn trees are berry trees whose item is an
 * Apricorn (field.js), one a day: white in Azalea Town, pink on Route 33, red and blue on Route 37,
 * green and yellow on Route 42, black only in the Dark Cave's hollow (darkcave.js). The first ball
 * of each kind comes with a word on what it is for (flags made:<ball>); once all seven have been
 * made (flag kurt-seven), the chapter ends (`ending(23)`).
 */
(() => {
  const T = s => G.T(s);
  const KURT = { name: 'Kurt' };
  /** The ball Kurt makes out of each Apricorn. */
  const BALL_OF = {
    'red-apricorn': 'level-ball', 'blue-apricorn': 'lure-ball', 'yellow-apricorn': 'moon-ball', 'green-apricorn': 'friend-ball',
    'pink-apricorn': 'love-ball', 'white-apricorn': 'fast-ball', 'black-apricorn': 'heavy-ball'
  };
  const BALLS = Object.values(BALL_OF);
  /** What Kurt says of each ball, the first time he makes one. */
  const KNACK = {
    'level-ball': () => T("A Level Ball works better the higher your own Pokémon's level is above the wild one's."),
    'lure-ball': () => T('A Lure Ball is made for Pokémon you hook with a fishing rod.'),
    'moon-ball': () => T('A Moon Ball works wonders on Pokémon that evolve with a Moon Stone.'),
    'friend-ball': () => T('A Pokémon caught in a Friend Ball takes to you right away.'),
    'love-ball': () => T('A Love Ball works on a Pokémon of the same species as yours, but of the other gender.'),
    'fast-ball': () => T('A Fast Ball is made for catching very fast Pokémon, the kind that always run away.'),
    'heavy-ball': () => T('A Heavy Ball works better the heavier the Pokémon is. On light ones, it is worse than a plain ball.')
  };

  async function balls(h) {
    const F = G.Field;
    if (!F.count('apricorn-box')) {
      await h.say(T('{player}! Look at this: my back is finally better. I can sit at my bench again!'), KURT);
      await h.say(T('The elder of Ecruteak says you met Ho-Oh and Lugia. When I heard that, my hands began to itch to make Poké Balls again.'), KURT);
      await h.say(T('I make them out of Apricorns, a fruit that grows on trees all over Johto. Each colour makes a different kind of ball. Keep them in this.'), KURT);
      F.giveItem('apricorn-box', 1);
      const j = h.jingle('item');
      await h.say(T('{player} received {item}!'), { vars: { item: G.Names.item('apricorn-box') } });
      await j;
      await h.say(T('A tree bears one Apricorn a day. There is a white one right here in town, a pink one on Route 33, a red and a blue one on Route 37, and a green and a yellow one on Route 42.'), KURT);
      await h.say(T('The black one is the rarest of all. The only tree I know grows in a hollow deep in the Dark Cave. Its mouth is on Route 31, just east of Violet City.'), KURT);
      await h.say(T('Bring me Apricorns, and I will turn them into balls right here while you wait!'), KURT);
      return;
    }
    const have = Object.keys(BALL_OF).filter(a => F.count(a) > 0);
    if (!have.length) {
      const left = BALLS.filter(b => !F.flag('made:' + b));
      if (left.length) await h.say(T('Bring me Apricorns, and I will make balls out of them. I have not made you a {item} yet!'), Object.assign({ vars: { item: G.Names.item(left[0]) } }, KURT));
      else await h.say(T('Bring me Apricorns any time. A Trainer can never have too many good balls!'), KURT);
      return;
    }
    await h.say(T('Apricorns! Leave them to me...'), KURT);
    await h.fade('out', 0.4);
    h.sfx('click');
    await h.fade('in', 0.4);
    const made = [];
    for (const a of have) {
      const n = F.count(a), ball = BALL_OF[a];
      F.takeItem(a, n);
      F.giveItem(ball, n);
      made.push([ball, n]);
    }
    const j = h.jingle('item');
    for (const [ball, n] of made) await h.say(T('{player} received {item} ×{n}!'), { vars: { item: G.Names.item(ball), n } });
    await j;
    for (const [ball] of made) {
      if (F.flag('made:' + ball)) continue;
      F.setFlag('made:' + ball);
      await h.say(KNACK[ball](), KURT);
    }
    if (BALLS.every(b => F.flag('made:' + b)) && !F.flag('kurt-seven')) {
      F.setFlag('kurt-seven');
      await h.say(T('That makes all seven kinds! I have not made a full set like this since I was a young man.'), KURT);
      await h.say(T('Use them well, and come back whenever you find more Apricorns.'), KURT);
      if (G.CreditsUI) await G.CreditsUI.ending(23); else F.setFlag('chapter-23-done');
    }
  }

  G.Script.def({ 'kurt.balls': [['js', balls]] });
})();
