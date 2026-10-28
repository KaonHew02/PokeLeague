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
                 'lass', 'bugcatcher', 'camper', 'brock', 'guide', 'oldman', 'daisy', 'aide',
                 'rocket', 'supernerd', 'hiker', 'misty', 'swimmer',
                 'officer', 'sailor', 'gentleman', 'engineer', 'captain', 'surge', 'bill',
                 'gambler', 'pokemaniac', 'beauty', 'channeler', 'biker', 'cooltrainer', 'erika',
                 'giovanni', 'fuji', 'scientist', 'fisherman', 'rocker', 'birdkeeper', 'juggler', 'tamer', 'koga', 'warden',
                 'blackbelt', 'psychic', 'sabrina', 'swimmerf', 'burglar', 'blaine', 'cueball',
                 'lorelei', 'bruno', 'agatha', 'lance', 'elm', 'silver', 'sage', 'falkner', 'kurt', 'bugsy',
                 'whitney', 'pokefan', 'granny', 'morty', 'kimono', 'eusine', 'jasmine', 'chuck'];

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
    rocket: { head: 'cap', body: 'jacket', legs: 'pants', a: '#2c2c36', A: '#16161c', b: '#c8283c', h: '#3c2c24', H: '#24180f', j: '#2e2e3a', J: '#1a1a24', c: '#3a3a48', C: '#24242e', p: '#2e2e3a', P: '#1a1a24', k: '#8a2a2a' },
    supernerd: { head: 'short', body: 'tee', legs: 'pants', h: '#2c2420', H: '#16100c', c: '#5a9a5a', C: '#3e7a3e', p: '#6a5a44', P: '#4a3e2e', k: '#3a3030' },
    hiker: { head: 'hat', body: 'jacket', legs: 'pants', a: '#8a5a34', A: '#6a4020', b: '#4e3018', h: '#3a2a1e', H: '#24180f', j: '#c86a3a', J: '#a04e26', c: '#f0e0b0', C: '#c8b888', p: '#6a5a40', P: '#4a3e2c', k: '#4a3626' },
    misty: { head: 'long', body: 'tee', legs: 'bare', h: '#f0843a', H: '#b85e20', c: '#f8d84c', C: '#d0b030', p: '#d84848', P: '#a83030', k: '#e85a4a' },
    swimmer: { head: 'short', body: 'tee', legs: 'bare', h: '#3a2a1e', H: '#24180f', c: '#f8d0a8', C: '#d89c74', p: '#2a5ab8', P: '#1c3e88', k: '#d89c74' },
    officer: { head: 'cap', body: 'jacket', legs: 'pants', a: '#2a3c78', A: '#1c2a58', b: '#f0c838', h: '#3c2c24', H: '#24180f', j: '#2e4688', J: '#1e2f60', c: '#d8e0f0', C: '#a8b4cc', p: '#2a3460', P: '#1c2444', k: '#1a1a22' },
    sailor: { head: 'cap', body: 'tee', legs: 'pants', a: '#f4f4f4', A: '#c8c8d0', b: '#2a4a9a', h: '#3c2c24', H: '#24180f', c: '#f4f4f4', C: '#9cb4dc', p: '#2a4a9a', P: '#1c3470', k: '#3a3030' },
    gentleman: { head: 'short', body: 'jacket', legs: 'pants', h: '#6a6a72', H: '#46464e', j: '#3a2e2a', J: '#261c18', c: '#f4f4f4', C: '#c8c8d0', p: '#3a2e2a', P: '#261c18', k: '#1a1a1a' },
    engineer: { head: 'hat', body: 'jacket', legs: 'pants', a: '#f0c838', A: '#c09a20', b: '#c09a20', h: '#3c2c24', H: '#24180f', j: '#e07a2a', J: '#b05a1a', c: '#5a6a7a', C: '#3e4a56', p: '#4a5a6a', P: '#323e4a', k: '#3a3030' },
    captain: { head: 'cap', body: 'coat', legs: 'pants', a: '#f4f4f4', A: '#c8c8d0', b: '#1c2a58', h: '#e8e8e8', H: '#b8b8c0', j: '#f4f4f4', J: '#c8ccd4', c: '#2a3c78', C: '#1c2a58', p: '#e8e8f0', P: '#b8bcc8', k: '#1a1a22' },
    surge: { head: 'spiky', body: 'jacket', legs: 'pants', h: '#f0d048', H: '#c0a020', s: '#e8b888', S: '#c49064', j: '#5a7a3a', J: '#3e5a26', c: '#3e4a2c', C: '#2a3420', p: '#4a5a32', P: '#323e22', k: '#2a2a22' },
    gambler: { head: 'hat', body: 'jacket', legs: 'pants', a: '#e8e0c8', A: '#bcb49c', b: '#2a2a2a', h: '#5a4a3a', H: '#3a2e24', j: '#c83c3c', J: '#962828', c: '#f4f4f4', C: '#c8c8d0', p: '#3a3a44', P: '#26262e', k: '#2a2222' },
    pokemaniac: { head: 'short', body: 'coat', legs: 'pants', h: '#3a2a20', H: '#24180f', j: '#6a9a3a', J: '#4c7428', c: '#f0d060', C: '#c8a83c', p: '#4a5a6a', P: '#323e4a', k: '#3a3030' },
    beauty: { head: 'long', body: 'dress', legs: 'bare', h: '#f0d070', H: '#c4a448', c: '#b45ac4', C: '#8a3e9c', j: '#b45ac4', J: '#8a3e9c', k: '#e85a9c' },
    channeler: { head: 'long', body: 'dress', legs: 'bare', h: '#e8e8ec', H: '#b8b8c4', c: '#6a4a8a', C: '#4c3268', j: '#6a4a8a', J: '#4c3268', k: '#4c3a3a' },
    biker: { head: 'short', body: 'jacket', legs: 'pants', h: '#c84a2a', H: '#94321a', j: '#2a2a30', J: '#16161c', c: '#5a5a66', C: '#3e3e48', p: '#2a2a30', P: '#16161c', k: '#16161c' },
    cooltrainer: { head: 'long', body: 'dress', legs: 'bare', h: '#c83c3c', H: '#962828', c: '#f4f4f4', C: '#c8c8d0', j: '#3a8a5a', J: '#28683e', k: '#2a2a30' },
    erika: { head: 'short', body: 'coat', legs: 'bare', h: '#2a2220', H: '#16100c', j: '#5aa04a', J: '#3e7a32', c: '#f0a040', C: '#c47a28', k: '#c84a4a' },
    giovanni: { head: 'short', body: 'coat', legs: 'pants', h: '#2a2420', H: '#16100c', j: '#b8743a', J: '#8a5426', c: '#2a2a30', C: '#18181e', p: '#7a5430', P: '#56381e', k: '#2a2222' },
    fuji: { head: 'bald', body: 'coat', legs: 'pants', h: '#e4e4e8', H: '#b4b4bc', j: '#6a6a88', J: '#4c4c66', c: '#c8c0b0', C: '#a09888', p: '#5a5a6a', P: '#40404c', k: '#3a3030' },
    scientist: { head: 'short', body: 'coat', legs: 'pants', h: '#5a4a3a', H: '#3a2e24', j: '#f4f4f4', J: '#c4c8d0', c: '#4a9a8a', C: '#327466', p: '#4c4c5c', P: '#34343e', k: '#3a3030' },
    fisherman: { head: 'hat', body: 'jacket', legs: 'pants', a: '#e8d8a0', A: '#c0ae74', b: '#8a7448', h: '#3a2a1e', H: '#24180f', j: '#5a8a4a', J: '#3e6a32', c: '#f0e8d0', C: '#c8c0a8', p: '#3a5a8a', P: '#283e62', k: '#3a3030' },
    rocker: { head: 'spiky', body: 'jacket', legs: 'pants', h: '#f0e070', H: '#c4b040', j: '#2a2a30', J: '#16161c', c: '#d84040', C: '#a82c2c', p: '#3a3a48', P: '#24242e', k: '#16161c' },
    birdkeeper: { head: 'cap', body: 'tee', legs: 'pants', a: '#f08a30', A: '#c46a1c', b: '#8a4a14', h: '#3c2c24', H: '#24180f', c: '#7ab8e8', C: '#5290c4', p: '#4a5a3a', P: '#323e26', k: '#4a3626' },
    juggler: { head: 'short', body: 'jacket', legs: 'pants', h: '#3a2a20', H: '#24180f', j: '#8a4ac0', J: '#66309a', c: '#f4f4f4', C: '#c8c8d0', p: '#f4f4f4', P: '#c8c8d0', k: '#3a3030' },
    tamer: { head: 'hat', body: 'jacket', legs: 'pants', a: '#6a4a2a', A: '#4a3218', b: '#2e1e0e', h: '#2a1e14', H: '#160e08', j: '#a86a3a', J: '#7c4c26', c: '#e8d8b8', C: '#c0b090', p: '#5a4a3a', P: '#3e3226', k: '#2a2018' },
    koga: { head: 'short', body: 'coat', legs: 'pants', h: '#3a3448', H: '#24202e', j: '#4a3a6a', J: '#30264a', c: '#8a8aa0', C: '#66667a', p: '#3a3050', P: '#262036', k: '#1a1622' },
    blackbelt: { head: 'short', body: 'jacket', legs: 'pants', h: '#2a2018', H: '#16100a', j: '#f4f4f4', J: '#c8c8d0', c: '#2a2a2a', C: '#161616', p: '#f4f4f4', P: '#c8c8d0', k: '#d8a070' },
    psychic: { head: 'short', body: 'coat', legs: 'pants', h: '#5a3a7a', H: '#3c2454', j: '#4a4a8a', J: '#323266', c: '#e8d070', C: '#c4a848', p: '#3a3a5a', P: '#262640', k: '#2a2a3a' },
    sabrina: { head: 'long', body: 'dress', legs: 'bare', h: '#2a2238', H: '#16101e', c: '#c83c4c', C: '#962834', j: '#2a2a34', J: '#16161e', k: '#2a2a34' },
    swimmerf: { head: 'long', body: 'tee', legs: 'bare', h: '#c86a2a', H: '#94481a', c: '#e8486a', C: '#b8304c', p: '#e8486a', P: '#b8304c', k: '#d89c74' },
    burglar: { head: 'bald', body: 'jacket', legs: 'pants', h: '#3a302c', H: '#221a16', j: '#4a4a5c', J: '#30303e', c: '#e8e0d0', C: '#b8b0a0', p: '#3a3a48', P: '#24242e', k: '#1a1a22' },
    blaine: { head: 'bald', body: 'coat', legs: 'pants', h: '#f0f0f0', H: '#c0c0c8', e: '#0c0c14', j: '#f4f4f4', J: '#c4c8d0', c: '#d0482c', C: '#a0321c', p: '#5a4a44', P: '#3e322e', k: '#2a2222' },
    lorelei: { head: 'long', body: 'dress', legs: 'bare', h: '#c8343c', H: '#922430', c: '#3a4a8a', C: '#2a3468', j: '#3a4a8a', J: '#2a3468', k: '#2a2a3a' },
    bruno: { head: 'short', body: 'tee', legs: 'pants', h: '#1e1a18', H: '#0e0c0a', s: '#b07850', S: '#8a5a38', c: '#b07850', C: '#8a5a38', p: '#2a2a2e', P: '#16161a', k: '#2a2018' },
    agatha: { head: 'long', body: 'dress', legs: 'bare', h: '#d8d8dc', H: '#a8a8b0', c: '#6a4a8a', C: '#4c3268', j: '#6a4a8a', J: '#4c3268', k: '#3a2a3a' },
    lance: { head: 'spiky', body: 'coat', legs: 'pants', h: '#c83030', H: '#922020', j: '#2a2a34', J: '#16161e', c: '#3a6a8a', C: '#2a4c66', p: '#3a3a48', P: '#24242e', k: '#1a1a22' },
    elm: { head: 'short', body: 'coat', legs: 'pants', h: '#6a4a2a', H: '#4a3018', j: '#f4f4f4', J: '#c4c8d0', c: '#3a8a5a', C: '#28683e', p: '#4a4a5a', P: '#30303e', k: '#3a3030' },
    silver: { head: 'long', body: 'jacket', legs: 'pants', h: '#c8303a', H: '#8a1e26', j: '#2a2a3a', J: '#16161e', c: '#c8303a', C: '#8a1e26', p: '#3a3a4a', P: '#24242e', k: '#2a2020' },
    sage: { head: 'bald', body: 'coat', legs: 'pants', h: '#3a3a40', H: '#24242a', j: '#5a5a6a', J: '#40404c', c: '#d8c8a0', C: '#b8a880', p: '#4a4a56', P: '#30303a', k: '#2a2a2a' },
    falkner: { head: 'short', body: 'coat', legs: 'pants', h: '#4a5ab8', H: '#323e88', j: '#5a8ad0', J: '#3e66a8', c: '#f4f4f4', C: '#c8c8d0', p: '#2a3a68', P: '#1c284a', k: '#2a2a3a' },
    kurt: { head: 'short', body: 'coat', legs: 'pants', h: '#a4a4ac', H: '#74747c', j: '#3a3030', J: '#241c1c', c: '#c8b890', C: '#a09068', p: '#3a3030', P: '#241c1c', k: '#1a1414' },
    bugsy: { head: 'short', body: 'tee', legs: 'bare', h: '#8a5ab0', H: '#64408a', c: '#f4f4f4', C: '#c8c8d0', p: '#4a8a4a', P: '#346834', k: '#3a5a2a' },
    whitney: { head: 'long', body: 'tee', legs: 'bare', h: '#f07aa8', H: '#c0507e', c: '#f4f4f4', C: '#c8c8d0', p: '#4a6ad0', P: '#34509c', k: '#e85a9c' },
    pokefan: { head: 'short', body: 'coat', legs: 'pants', h: '#5a3a2a', H: '#3e2618', j: '#e8a03a', J: '#b87a24', c: '#f4f4f4', C: '#c8c8d0', p: '#4a4a5a', P: '#30303e', k: '#2a2a3a' },
    morty: { head: 'short', body: 'coat', legs: 'pants', h: '#e8d070', H: '#b89e48', j: '#3a3a52', J: '#26263a', c: '#7a4a9a', C: '#5a3478', p: '#3a3a52', P: '#26263a', k: '#1c1c28' },
    kimono: { head: 'long', body: 'dress', legs: 'bare', h: '#2a2028', H: '#160e14', c: '#e05a7a', C: '#b03c5a', j: '#e05a7a', J: '#b03c5a', k: '#5a2a3a' },
    eusine: { head: 'short', body: 'coat', legs: 'pants', h: '#5a7ab8', H: '#3e5a90', j: '#f0f0f4', J: '#c4c4d0', c: '#4a6ab0', C: '#344e88', p: '#3a4a7a', P: '#26345a', k: '#1c2238' },
    jasmine: { head: 'long', body: 'dress', legs: 'bare', h: '#8a5a3a', H: '#5e3c24', c: '#f4f4f4', C: '#c8c8d0', j: '#f4f4f4', J: '#c8c8d0', k: '#5a7cd0' },
    chuck: { head: 'bald', body: 'tee', legs: 'pants', h: '#3a3030', H: '#241c1c', c: '#e8c098', C: '#c49870', p: '#3a3a3a', P: '#262626', k: '#2a2a2a' },
    granny: { head: 'long', body: 'dress', legs: 'bare', h: '#d8d8e0', H: '#a8a8b4', c: '#9a6ab4', C: '#74508a', j: '#9a6ab4', J: '#74508a', k: '#5a4a3a' },
    cueball: { head: 'bald', body: 'jacket', legs: 'pants', h: '#e8b888', H: '#c49064', j: '#2a2a30', J: '#16161c', c: '#e8e8e8', C: '#b8b8c0', p: '#3a4a7a', P: '#283458', k: '#16161c' },
    warden: { head: 'bald', body: 'coat', legs: 'pants', h: '#d8d8dc', H: '#a8a8b0', j: '#a89a6a', J: '#80744c', c: '#e8e0c8', C: '#c0b8a0', p: '#6a5c44', P: '#4c4230', k: '#3a2e22' },
    bill: { head: 'short', body: 'tee', legs: 'pants', h: '#7a4a2a', H: '#52301a', c: '#4a8ad8', C: '#2e66b0', p: '#5a4a3a', P: '#3e3226', k: '#3a3030' },
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
