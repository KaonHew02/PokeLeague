/* ============ people.js — trainer and NPC sprites painted from ASCII ============
 * 16×24 art px, in the style of the handheld games. Each archetype is a head,
 * a body and legs, plus a palette:
 *
 *   G.People.TYPES                 the archetypes (player-boy, oak, nurse, lass...)
 *   G.People.draw(ctx, who, dir, frame, x, y, k)   feet at (x, y), k world units per art px
 *   G.People.sheet(who)            3 frames (stand, step, step) × down, up, left, right
 *   G.People.portrait(who, k=4)    the front frame ×4 (trainer battle intros)
 *
 * Templates: front and back views are written as their LEFT HALF (8 columns)
 * and mirrored; side views face left (right is left mirrored). A dark outline
 * is added around the whole figure. Template letters:
 *   h/H hair · s/S skin · e eyes · a/A hat · b hat brim or band · c/C shirt
 *   j/J jacket, coat or skirt · p/P trousers · l/L legs (trousers or skin) · k shoes · w white
 */
G.People = (() => {
  const W = 16, HT = 24;
  const TYPES = ['player-boy', 'player-girl', 'rival', 'oak', 'mom', 'nurse', 'clerk', 'youngster',
                 'lass', 'bugcatcher', 'camper', 'brock', 'guide', 'oldman', 'daisy', 'aide'];

  // Face rows shared by most heads (front view, rows 6..11).
  const FACE = ['..hsssss', '..hssess', '..hssess', '..hSssss', '...Sssss', '....SSss'];
  const FACE_SIDE = [
    '...sssssshhhhh..',
    '..ssessssshhhh..',
    '..ssessssshhhh..',
    '..sssssssShhh...',
    '...ssssssShh....',
    '....SSsssS......'
  ];
  const BACK = ['..hhhhhh', '..hhhhhh', '..hhhhhh', '..hHhhhh', '...HHhhh', '....SSss'];

  // Heads: rows from 1. down/up are halves; left is full width.
  const HEADS = {
    cap: {
      down: ['.....aaa', '...aaaaa', '..aaaaaa', '..AAaaaa', '.bbbbbbb', ...FACE],
      up: ['.....aaa', '...aaaaa', '..aaaaaa', '..aaaaaa', '..Abbbbb', ...BACK],
      left: ['......aaaaa.....', '....aaaaaaaaa...', '...aaaaaaaaaaa..', '...aaaaaaaaaaA..', 'bbbbbbbbbaaaaA..', ...FACE_SIDE]
    },
    spiky: {
      down: ['..h...hh', '..hh.hhh', '.hhhhhhh', '.hhhhhhh', '..hhhHhh', ...FACE],
      up: ['..h...hh', '..hh.hhh', '.hhhhhhh', '.hhhhhhh', '..hhhhhh', ...BACK],
      left: ['........hh......', '.....hhhhhh.hh..', '....hhhhhhhhhh..', '...hhhhhhhhhhhh.', '...hhhhhhhhhhh..', ...FACE_SIDE]
    },
    short: {
      down: ['........', '....hhhh', '..hhhhhh', '..hhhhhh', '..hhhHhh', ...FACE],
      up: ['........', '....hhhh', '..hhhhhh', '..hhhhhh', '..hhhhhh', ...BACK],
      left: ['................', '.....hhhhhh.....', '....hhhhhhhhh...', '...hhhhhhhhhhh..', '...hhhhhhhhhhh..', ...FACE_SIDE]
    },
    brock: {
      down: ['..h..h.h', '.hhhhhhh', '.hhhhhhh', 'hhhhhhhh', '.hhhHhhh', '..hsssss', '..hsssss', '..hseess', '..hSssss', '...Sssss', '....SSss'],
      up: ['..h..h.h', '.hhhhhhh', '.hhhhhhh', 'hhhhhhhh', '.hhhhhhh', ...BACK],
      left: ['.......h.h......', '....hhhhhhhhh...', '...hhhhhhhhhhhh.', '..hhhhhhhhhhhhh.', '...hhhhhhhhhhh..',
             '...sssssshhhhh..', '..sssssssshhhh..', '..seessssshhhh..', '..sssssssShhh...', '...ssssssShh....', '....SSsssS......']
    },
    long: {
      down: ['........', '....hhhh', '..hhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhsssss', '.hhssess', '.hhssess', '.hhSssss', '.hhSssss', '.hh.SSss', '.hh.....', '.hH.....', '..H.....'],
      up: ['........', '....hhhh', '..hhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hHhhhhh', '..HHHhhh'],
      left: ['................', '.....hhhhhh.....', '....hhhhhhhhh...', '...hhhhhhhhhhh..', '...hhhhhhhhhhhh.',
             '...hssssshhhhhh.', '..ssessssshhhhh.', '..ssessssshhhhh.', '..sssssssShhhhh.', '...ssssssShhhhh.', '....SSsssShhhhh.',
             '.........hhhhh..', '.........hhhH...', '..........HH....']
    },
    hat: {
      down: ['....aaaa', '..aaaaaa', '.aaaaaaa', '.bbbbbbb', 'aaaaaaaa', '.hhsssss', '.hhssess', '.hhssess', '.hhSssss', '.hhSssss', '.hh.SSss', '.hh.....', '.hH.....', '..H.....'],
      up: ['....aaaa', '..aaaaaa', '.aaaaaaa', '.bbbbbbb', 'aaaaaaaa', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hhhhhhh', '.hHhhhhh', '..HHHhhh'],
      left: ['.......aaaa.....', '.....aaaaaaaa...', '....aaaaaaaaaa..', '....bbbbbbbbbb..', '.aaaaaaaaaaaaaa.',
             '...hssssshhhhhh.', '..ssessssshhhhh.', '..ssessssshhhhh.', '..sssssssShhhhh.', '...ssssssShhhhh.', '....SSsssShhhhh.',
             '.........hhhhh..', '.........hhhH...', '..........HH....']
    },
    nurse: {
      down: ['....aaaa', '...aabaa', '..hhaaaa', '.hhhhhhh', 'hhhhhhhh', 'hhhsssss', 'hh.ssess', 'hh.ssess', 'hH.Sssss', '.H.Sssss', '....SSss'],
      up: ['....aaaa', '...aaaaa', '..hhaaaa', '.hhhhhhh', 'hhhhhhhh', 'hhhhhhhh', 'hhhhhhhh', 'hhhhhhhh', 'hHhHhhhh', '.H.HHhhh', '....SSss'],
      left: ['.......aaaa.....', '......aabaa.....', '....hhhaaaahh...', '...hhhhhhhhhhh..', '...hhhhhhhhhhhh.',
             '...sssssshhhhhhh', '..ssessssshhhhhh', '..ssessssshhh.hh', '..sssssssShhh.hH', '...ssssssShh...H', '....SSsssS......']
    },
    straw: {
      down: ['........', '....aaaa', '...aaaaa', '..AAAAAA', 'bbbbbbbb', '..hhhhhh', '..hssess', '..hssess', '..hSssss', '...Sssss', '....SSss'],
      up: ['........', '....aaaa', '...aaaaa', '..AAAAAA', 'bbbbbbbb', '..hhhhhh', '..hhhhhh', '..hhhhhh', '..hHhhhh', '...HHhhh', '....SSss'],
      left: ['................', '......aaaaa.....', '.....aaaaaaa....', '....AAAAAAAAA...', 'bbbbbbbbbbbbbbb.',
             '...hhhhhhhhhhh..', '..ssessssshhhh..', '..ssessssshhhh..', '..sssssssShhh...', '...ssssssShh....', '....SSsssS......']
    },
    oak: {
      down: ['........', '...hhhhh', '..hhhhhh', '.hhhHhhh', '.hhHHhhh', '..hsssss', '..hssess', '..hssess', '..hSssss', '...Sssss', '....SSss'],
      up: ['........', '...hhhhh', '..hhhhhh', '.hhhhhhh', '.hhhhhhh', '..hhhhhh', '..hhhhhh', '..hhhhhh', '..hHhhhh', '...HHhhh', '....SSss'],
      left: ['................', '....hhhhhhh.....', '...hhhhhhhhhh...', '..hHHhhhhhhhhh..', '...hhhhhhhhhhh..', ...FACE_SIDE]
    },
    bald: {
      down: ['........', '....ssss', '..ssssss', '..ssssss', '..hsssss', '..hsssss', '..hssess', '..hSsSss', '..hSssss', '...Shhhh', '....hhhh'],
      up: ['........', '....ssss', '..ssssss', '..ssssss', '..hSssss', '..hhhhhh', '..hhhhhh', '..hhhhhh', '..hHhhhh', '...HHhhh', '....SSss'],
      left: ['................', '.....ssssss.....', '....sssssssss...', '...sssssssssss..', '...sssssssssss..',
             '...sssssshhhhh..', '..ssessssshhhh..', '..sSSssssshhh...', '..shhhhhhShhh...', '...hhhhhhShh....', '....hhhhhS......']
    }
  };

  // Bodies: rows from 12. Some reach row 19 or 20 (coats, skirts).
  const BODIES = {
    tee: {
      down: ['....cccc', '..cccccc', '..cCcccc', '..sCcccc', '..sCcccc', '...ppppp', '...ppppp'],
      up: ['....cccc', '..cccccc', '..cCcccc', '..sCcccc', '..sCcccc', '...ppppp', '...ppppp'],
      left: ['......cccc......', '.....cccccc.....', '.....ccCccc.....', '.....cCsCcc.....', '.....ccsccc.....', '......ppppp.....', '......ppppp.....']
    },
    jacket: {
      down: ['....jccc', '..jjjccc', '..jJjccc', '..sJjccc', '..sJjjcc', '...ppppp', '...ppppp'],
      up: ['....jjjj', '..jjjjjj', '..jJjjjj', '..sJjjjj', '..sJjjjj', '...ppppp', '...ppppp'],
      left: ['......jjjj......', '.....jjjjjj.....', '.....jjJjjj.....', '.....jJsJjj.....', '.....jjsjjj.....', '......ppppp.....', '......ppppp.....']
    },
    coat: {
      down: ['....jccc', '..jjjccc', '.jjJjccc', '.sjJjccc', '.sjJjjcc', '..jjjppp', '..jjjppp', '..jjJ...', '..jjJ...'],
      up: ['....jjjj', '..jjjjjj', '.jjJjjjj', '.sjJjjjj', '.sjJjjjj', '..jjjjjj', '..jjjjjj', '..jjJjjj', '..jjJJjj'],
      left: ['......jjjj......', '.....jjjjjj.....', '.....jjJjjj.....', '.....jJsJjj.....', '.....jjsjjjj....', '.....jjjjjjj....', '.....jjjjjjjj...', '.....jjjj..jj...', '.....jjj....j...']
    },
    dress: {
      down: ['....cccc', '..cccccc', '..cCcccc', '..sCcccc', '..sjjjjj', '..jjjjjj', '.jjjjjjj', '.jJjjjjj'],
      up: ['....cccc', '..cccccc', '..cCcccc', '..sCcccc', '..sjjjjj', '..jjjjjj', '.jjjjjjj', '.jJjjjjj'],
      left: ['......cccc......', '.....cccccc.....', '.....ccCccc.....', '.....cCsCcc.....', '.....jjsjjj.....', '....jjjjjjjj....', '....jjjjjjjjj...', '...jjjjjjjjjj...']
    }
  };

  // Legs, rows 19..22: stand, step (and its mirror for down/up).
  const LEGS = {
    down: [['....llL.', '....llL.', '....kkk.', '...kkkk.'], ['....llL..Lll....', '....llL..kkk....', '....kkk..kkk....', '...kkkk.........']],
    left: [['......llLL......', '......llLL......', '.....kkkkk......', '.....kkkkk......'],
           ['.....lll.LL.....', '....lll...LL....', '...kkk....kkk...', '...kkk.....kk...'],
           ['.....LLL.ll.....', '....LLL...ll....', '...kkk....kkk...', '...kkk.....kk...']]
  };

  const SKIN = { s: '#f8d0a8', S: '#d89c74' };
  const LOOK = {
    'player-boy': { head: 'cap', body: 'jacket', legs: 'pants', a: '#e04040', A: '#a82c2c', b: '#f4f4f4', h: '#3c2c24', H: '#24180f', j: '#3c5cb0', J: '#2a4080', c: '#f4f4f4', C: '#c8c8d0', p: '#343c50', P: '#222838', k: '#d84848' },
    'player-girl': { head: 'hat', body: 'dress', legs: 'bare', a: '#f4f4f4', A: '#c8c8d0', b: '#e04848', h: '#b0502c', H: '#7c341c', c: '#58a4ea', C: '#3a7cc4', j: '#e04848', J: '#a82c2c', k: '#f4f4f4' },
    rival: { head: 'spiky', body: 'tee', legs: 'pants', h: '#9c6634', H: '#6a4220', c: '#7454ac', C: '#523a84', p: '#5a4c3c', P: '#3e3428', k: '#4c4040' },
    oak: { head: 'oak', body: 'coat', legs: 'pants', h: '#b8b8c0', H: '#8a8a94', j: '#f4f4f4', J: '#c4c8d0', c: '#8a6a4a', C: '#6a4e34', p: '#6c5c4a', P: '#4e4234', k: '#5a4434' },
    mom: { head: 'long', body: 'dress', legs: 'bare', h: '#a0482c', H: '#6c2c1a', c: '#ec8a8a', C: '#c46464', j: '#5a74c4', J: '#3c5296', k: '#a04848' },
    nurse: { head: 'nurse', body: 'dress', legs: 'bare', a: '#f8f8f8', A: '#d0d0d8', b: '#e85060', h: '#f494b4', H: '#c86a8c', c: '#f8b4cc', C: '#d888a4', j: '#f8f8f8', J: '#d0d0d8', k: '#f8f8f8' },
    clerk: { head: 'short', body: 'tee', legs: 'pants', h: '#4c3424', H: '#30200f', c: '#4c7cc8', C: '#33589c', p: '#334262', P: '#222c44', k: '#3a3030' },
    youngster: { head: 'cap', body: 'tee', legs: 'bare', a: '#f0c838', A: '#c09a20', b: '#3c64b4', h: '#3c2c24', H: '#24180f', c: '#f4f4f4', C: '#c8c8d0', p: '#3c5cb0', P: '#2a4080', k: '#d84848' },
    lass: { head: 'long', body: 'dress', legs: 'bare', h: '#e08c3c', H: '#a8601e', c: '#f4f4f4', C: '#c8c8d0', j: '#5a7cd0', J: '#3c58a4', k: '#e85a78' },
    bugcatcher: { head: 'straw', body: 'tee', legs: 'bare', a: '#ecd488', A: '#c4a858', b: '#d8b860', h: '#3c2c24', H: '#24180f', c: '#f4f4f4', C: '#c8c8d0', p: '#6c9c4c', P: '#4c7834', k: '#7c5c3c' },
    camper: { head: 'cap', body: 'tee', legs: 'bare', a: '#4c9c4c', A: '#347434', b: '#2e5e2e', h: '#3c2c24', H: '#24180f', c: '#ecc070', C: '#c49a48', p: '#7c6040', P: '#5a4428', k: '#5a4434' },
    brock: { head: 'brock', body: 'jacket', legs: 'pants', h: '#3a2c24', H: '#20160e', j: '#5a7c40', J: '#3e5a2a', c: '#d4843c', C: '#a8622a', p: '#5a4c3c', P: '#3e3428', k: '#3a3030', s: '#d8a070', S: '#b07c50' },
    guide: { head: 'short', body: 'jacket', legs: 'pants', h: '#5c4c44', H: '#3c302a', j: '#5c8c5c', J: '#3e6a3e', c: '#f4f4f4', C: '#c8c8d0', p: '#5a5a6a', P: '#40404c', k: '#3a3030' },
    daisy: { head: 'long', body: 'dress', legs: 'bare', h: '#8a5430', H: '#5e361a', c: '#f4f4f4', C: '#c8c8d0', j: '#5c9c5c', J: '#3e763e', k: '#7a5236' },
    aide: { head: 'short', body: 'coat', legs: 'pants', h: '#3c3434', H: '#241e1e', j: '#f4f4f4', J: '#c4c8d0', c: '#5a8ac8', C: '#3e66a0', p: '#4c4c5c', P: '#34343e', k: '#3a3030' },
    oldman: { head: 'bald', body: 'coat', legs: 'pants', h: '#ececec', H: '#b8b8c0', j: '#9c7a54', J: '#74583a', c: '#c8a878', C: '#a08458', p: '#6c5c4a', P: '#4e4234', k: '#4c3c2c' }
  };

  const mirror = half => half + [...half].reverse().join('');
  const full = (rows, dir) => rows.map(r => r.length === 8 ? mirror(r) : r);

  function palette(L) {
    const { pack } = G.Tiles;
    const out = {};
    const src = Object.assign({ e: '#202028', w: '#f8f8f8' }, SKIN, L);
    for (const [k, v] of Object.entries(src)) if (typeof v === 'string' && v[0] === '#') out[k] = pack(v);
    out.l = L.legs === 'bare' ? out.s : out.p;
    out.L = L.legs === 'bare' ? out.S : out.P;
    return out;
  }

  /** One frame (f: 0 stand, 1 and 2 steps) facing down, up or left. */
  function paint(who, dir, f) {
    const { Pix, ascii, outline, pack } = G.Tiles;
    const L = LOOK[who] || LOOK.youngster;
    const C = palette(L);
    const P = Pix(W, HT);
    const view = dir === 'left' ? 'left' : dir;
    // Legs
    let legs;
    if (view === 'left') legs = LEGS.left[f];
    else if (f === 0) legs = full(LEGS.down[0]);
    else legs = f === 1 ? LEGS.down[1] : LEGS.down[1].map(r => [...r].reverse().join(''));
    const bob = f ? 1 : 0;
    ascii(P, 0, 19, legs, C);
    // Body then head (long hair falls over the shoulders).
    ascii(P, 0, 12 + bob, full(BODIES[L.body][view]), C);
    ascii(P, 0, 1 + bob, full(HEADS[L.head][view]), C);
    outline(P, pack('#202028'));
    return P.canvas();
  }

  const sheets = {};
  /** 3 frames × 4 rows (down, up, left, right). */
  function sheet(who) {
    if (sheets[who]) return sheets[who];
    const cv = document.createElement('canvas');
    cv.width = W * 3; cv.height = HT * 4;
    const c = cv.getContext('2d');
    ['down', 'up', 'left'].forEach((d, row) => {
      for (let f = 0; f < 3; f++) {
        const fr = paint(who, d, f);
        c.drawImage(fr, f * W, row * HT);
        if (d === 'left') {
          c.save(); c.translate(f * W + W, 3 * HT); c.scale(-1, 1); c.drawImage(fr, 0, 0); c.restore();
        }
      }
    });
    return (sheets[who] = cv);
  }

  const ROW = { down: 0, up: 1, left: 2, right: 3 };
  /** Draws a person with the feet (bottom centre) at (x, y); k world units per art px. */
  function draw(ctx, who, dir, frame, x, y, k = G.Sprites.PX, alpha = 1) {
    const s = sheet(LOOK[who] ? who : 'youngster');
    const prev = ctx.globalAlpha;
    if (alpha < 1) ctx.globalAlpha = prev * alpha;
    ctx.drawImage(s, (frame | 0) * W, (ROW[dir] || 0) * HT, W, HT, Math.round(x - W * k / 2), Math.round(y - HT * k), W * k, HT * k);
    ctx.globalAlpha = prev;
  }

  /** The front frame, k times larger (crisp, for trainer intros). */
  function portrait(who, k = 4) {
    const s = sheet(LOOK[who] ? who : 'youngster');
    const cv = document.createElement('canvas');
    cv.width = W * k; cv.height = HT * k;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.drawImage(s, 0, 0, W, HT, 0, 0, W * k, HT * k);
    return cv;
  }

  /** Template problems (rows of the wrong width, missing parts): for the tests. */
  function check() {
    const E = [];
    for (const who of TYPES) {
      const L = LOOK[who];
      if (!L) { E.push(`${who}: no look`); continue; }
      for (const [part, set] of [['head', HEADS[L.head]], ['body', BODIES[L.body]]]) {
        if (!set) { E.push(`${who}: unknown ${part} ${L[part]}`); continue; }
        for (const view of ['down', 'up', 'left']) {
          const rows = set[view] && full(set[view]);
          if (!rows) { E.push(`${who}: ${part} ${L[part]} has no ${view} view`); continue; }
          rows.forEach((r, i) => { if (r.length !== W) E.push(`${who}: ${part} ${L[part]} ${view} row ${i} is ${r.length} wide`); });
          const top = part === 'head' ? 1 : 12;
          if (top + rows.length > 21) E.push(`${who}: ${part} ${L[part]} ${view} is too tall`);
        }
      }
    }
    for (const rows of [LEGS.down[1], ...LEGS.left, full(LEGS.down[0])]) rows.forEach(r => { if (r.length !== W) E.push(`legs row "${r}" is ${r.length} wide`); });
    return E;
  }

  return { TYPES, W, H: HT, LOOK, draw, sheet, portrait, check };
})();
