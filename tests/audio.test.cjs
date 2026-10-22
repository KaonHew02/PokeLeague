// Audio: song compilation, the jingle step limit, the music map and cries.
// The scheduler and jingles run on a small stand-in for Web Audio (no sound):
// the test moves its clock and calls the scheduler's tick() by hand.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, CORE, plain } = require('./helpers.cjs');

const FILES = CORE.concat('js/core/audio.js', 'js/data/music.js', 'js/data/music-map.js');
const JINGLES = ['heal', 'levelup', 'caught', 'item', 'badge', 'evolved'];
const NEW_LOOPS = ['title', 'center', 'evolution', 'victory-wild', 'victory-trainer'];
const OLD_LOOPS = ['village', 'forest', 'cave', 'volcano', 'boss', 'rift', 'judgment'];
const DRUMS = ['kick', 'snare', 'hat', 'shaker', 'tom', 'crash'];

/** Just enough of an AudioContext for the synth: every node accepts every call. */
function FakeAudioContext() {
  const param = () => ({ value: 0, setValueAtTime(v) { this.value = v; }, linearRampToValueAtTime(v) { this.value = v; },
    exponentialRampToValueAtTime(v) { this.value = v; }, setTargetAtTime() {}, cancelScheduledValues() {} });
  const made = { osc: 0, nodes: 0 };
  const node = () => {
    made.nodes++;
    return { connect: d => d, disconnect() {}, start() {}, stop() {}, gain: param(), frequency: param(), Q: param(),
      threshold: param(), ratio: param(), getFloatTimeDomainData() {} };
  };
  return {
    currentTime: 0, state: 'running', sampleRate: 8000, destination: node(), made,
    resume: () => Promise.resolve(),
    createGain: node, createDynamicsCompressor: node, createConvolver: node, createBiquadFilter: node,
    createBufferSource: node, createAnalyser: node,
    createOscillator() { made.osc++; return node(); },
    createBuffer: (ch, len) => ({ getChannelData: () => new Float32Array(len) })
  };
}

/** Boots the audio files with the stand-in, unlocked and ready to play. */
function withSound(extra = []) {
  const box = boot(FILES.concat(extra));
  box.AudioContext = FakeAudioContext;
  box.G.Audio.unlock();
  const ac = box.G.Audio._internals.ctx;
  const at = t => { ac.currentTime = t; box.G.Audio._internals.tick(); };
  return { G: box.G, ac, at };
}

test('every song compiles: bars of 16 steps, notes that parse, instruments that exist', () => {
  const { G } = boot(FILES);
  const A = G.Audio._internals;
  for (const [name, song] of Object.entries(G.MUSIC)) {
    for (const tr of song.melody || []) {
      assert.ok(A.INST[tr.inst] && !DRUMS.includes(tr.inst), `${name}: unknown instrument ${tr.inst}`);
      tr.bars.forEach((bar, i) => {
        const len = bar.trim().split(/\s+/).reduce((a, tok) => a + (+tok.split(':')[1] || 1), 0);
        assert.equal(len, 16, `${name} (${tr.inst}) bar ${i + 1} is ${len} steps`);
      });
    }
    for (const p of song.parts || []) {
      assert.ok(A.INST[p.inst], `${name}: unknown instrument ${p.inst}`);
      assert.equal(p.pattern.length, 16, `${name} (${p.inst}) pattern`);
    }
    for (const [inst, pat] of Object.entries(song.drums || {})) {
      assert.ok(DRUMS.includes(inst), `${name}: ${inst} is not a drum`);
      assert.equal(pat.length % 16, 0, `${name} (${inst}) drum pattern`);
    }
    const c = A.compile(song);
    assert.ok(c.steps >= 16 && c.steps % 16 === 0, name);
    assert.equal(c.ev.length, c.steps);
    for (const step of c.ev) {
      for (const e of step) {
        assert.ok(typeof A.INST[e.inst] === 'function', `${name}: ${e.inst}`);
        if (!e.drum) assert.ok(Number.isFinite(e.f) && e.f > 25 && e.f < 5000, `${name}: a note that does not parse (${e.f})`);
      }
    }
  }
});

test('the old themes are kept; the new loops loop and the jingles are short once-songs', () => {
  const { G } = boot(FILES);
  const A = G.Audio._internals;
  for (const name of OLD_LOOPS.concat(NEW_LOOPS)) {
    assert.ok(G.MUSIC[name], name + ' is missing');
    assert.ok(!G.MUSIC[name].once, name + ' should loop');
    assert.ok(A.compile(G.MUSIC[name]).steps >= 8 * 16, name + ' is too short to loop');
  }
  for (const name of JINGLES) {
    assert.ok(G.MUSIC[name] && G.MUSIC[name].once === true, name + ' should be a jingle');
    const secs = A.songLength(A.compile(G.MUSIC[name]));
    assert.ok(secs >= 1 && secs <= 7, `${name} lasts ${secs.toFixed(2)} s`);
  }
  // The chord notation: "C4+E4+G4" is three notes on the same step.
  const c = A.compile({ once: true, bpm: 120, melody: [{ inst: 'pad', bars: ['C4+E4+G4:16'] }] });
  assert.equal(c.ev[0].length, 3);
  assert.deepEqual(plain(c.ev[0].map(e => Math.round(e.f))), [262, 330, 392]);
  // A drum pattern of 32 characters covers two bars.
  const d = A.compile({ bpm: 120, chords: ['C', 'C'], drums: { kick: 'X'.padEnd(16, '.') + '.'.repeat(15) + 'X' } });
  assert.deepEqual(plain(d.ev.map((s, i) => s.length ? i : -1).filter(i => i >= 0)), [0, 31]);
});

test('a jingle stops after its last step; a loop wraps around', () => {
  const { G } = boot(FILES);
  const A = G.Audio._internals;
  const heal = A.compile(G.MUSIC.heal);
  const p = { song: heal, step: 0, next: 0 };
  const steps = [];
  assert.equal(A.advance(p, 1e9, () => {}), true);
  assert.equal(p.step, heal.steps);
  assert.ok(Math.abs(p.next - A.songLength(heal)) < 1e-9, 'p.next is when it ends');
  assert.equal(A.advance(p, 2e9, () => steps.push(1)), true);
  assert.equal(steps.length, 0, 'nothing more after the last step');

  const village = A.compile(G.MUSIC.village);
  const sd = 60 / village.bpm / 4;
  const loop = { song: village, step: 0, next: 0 };
  let notes = 0;
  assert.equal(A.advance(loop, village.steps * sd * 2.5, () => notes++), false);
  assert.equal(loop.step, Math.ceil(village.steps * 2.5));
  assert.ok(notes > 0);
});

test('a jingle pauses the theme and brings it back at the beat where it stopped', async () => {
  const { G, at } = withSound();
  G.Audio.music('village');                          // 100 bpm: a step is 0.15 s
  at(3);
  assert.deepEqual({ ...G.Audio._internals.loop }, { name: 'village', step: 21 });
  const done = G.Audio.jingle('heal');
  assert.equal(G.Audio.jingling, 'heal');
  assert.equal(G.Audio._internals.loop, null);
  assert.equal(G.Audio.track, 'village', 'the theme that comes back');
  at(3.05);
  at(5);
  assert.equal(G.Audio.jingling, 'heal', 'still playing');
  const end = 3.12 + G.Audio._internals.songLength(G.Audio._internals.compile(G.MUSIC.heal));
  at(end + 0.03);
  assert.equal(await done, true);
  assert.equal(G.Audio.jingling, null);
  assert.deepEqual({ ...G.Audio._internals.loop }, { name: 'village', step: 20 });
});

test('a theme asked for during a jingle starts after it; a second jingle cuts the first', async () => {
  const { G, at } = withSound();
  G.Audio.music('village');
  at(3);
  const first = G.Audio.jingle('levelup');
  at(3.2);
  const second = G.Audio.jingle('item');
  assert.equal(await first, false, 'cut');
  assert.equal(G.Audio.jingling, 'item');
  G.Audio.music('forest');
  assert.equal(G.Audio._internals.loop, null, 'the new theme waits');
  at(3.25);
  at(10);
  assert.equal(await second, true);
  assert.deepEqual({ ...G.Audio._internals.loop }, { name: 'forest', step: 0 });

  // music() with a jingle's name plays it as a jingle and keeps the theme.
  at(12);
  G.Audio.music('caught');
  assert.equal(G.Audio.jingling, 'caught');
  assert.equal(G.Audio.track, 'forest');
  at(12.1);
  at(20);
  assert.equal(G.Audio._internals.loop.name, 'forest');
});

test('jingles resolve at once when no sound can play, so scripts never hang', async () => {
  const { G } = boot(FILES);                         // no AudioContext in node
  assert.equal(await G.Audio.jingle('heal'), false);
  assert.equal(await G.Audio.cry(25), false);
  const { G: G2 } = withSound();
  assert.equal(await G2.Audio.jingle('no-such-song'), false);
});

test('the music map: the required contexts, and every context names a theme that loops', () => {
  const { G } = boot(FILES);
  const want = { town: 'village', route: 'forest', forest: 'cave', wild: 'volcano', trainer: 'boss', gym: 'rift',
    center: 'center', title: 'title', evolution: 'evolution', 'victory-wild': 'victory-wild', 'victory-trainer': 'victory-trainer' };
  for (const [ctx, song] of Object.entries(want)) assert.equal(G.MusicMap[ctx], song, ctx);
  for (const [ctx, song] of Object.entries(G.MusicMap)) {
    if (song === null) continue;
    assert.ok(G.MUSIC[song], `${ctx} → ${song}, which does not exist`);
    assert.ok(!G.MUSIC[song].once, `${ctx} → ${song}, a jingle`);
  }
  const used = new Set(Object.values(G.MusicMap));
  for (const name of Object.keys(G.MUSIC)) if (!G.MUSIC[name].once) assert.ok(used.has(name), name + ' is in no context');
});

test('context() plays the mapped song; null is silence; unknown contexts change nothing', () => {
  const { G, at } = withSound();
  assert.equal(G.Audio.context('town'), 'village');
  at(1);
  assert.equal(G.Audio.track, 'village');
  assert.equal(G.Audio.context('wild'), 'volcano');
  assert.equal(G.Audio.track, 'volcano');
  const warn = console.warn; let warned = 0;
  console.warn = () => warned++;
  try { assert.equal(G.Audio.context('village'), undefined, 'a song name is not a context'); } finally { console.warn = warn; }
  assert.equal(warned, 1);
  assert.equal(G.Audio.track, 'volcano');
  assert.equal(G.Audio.context('silence'), null);
  assert.equal(G.Audio.track, null);
});

test('cries: the same every time, different for every species, deeper when heavier', () => {
  const { G } = boot(FILES.concat('js/data/species.js'));
  const A = G.Audio._internals;
  const voices = {};
  for (let dex = 1; dex <= 151; dex++) {
    const v = A.cryVoice(dex);
    assert.deepEqual(A.cryVoice(dex), v, 'deterministic');
    assert.ok(v.f >= 150 && v.f <= 1700, `#${dex} pitch ${v.f}`);
    assert.ok(v.dur >= 0.3 && v.dur <= 1, `#${dex} length ${v.dur}`);
    assert.ok(v.syl.length >= 1 && v.syl.length <= 3);
    const lastEnd = v.syl[v.syl.length - 1].at + v.syl[v.syl.length - 1].len;
    assert.ok(Math.abs(lastEnd - 1) < 0.01, `#${dex} syllables fill the cry`);
    voices[JSON.stringify({ ...v, dex: 0, family: 0 })] = dex;
  }
  assert.equal(Object.keys(voices).length, 151, 'every species sounds different');
  // Onix and Snorlax are deeper than Pikachu; Pikachu than Gastly.
  assert.ok(A.cryVoice(95).f < A.cryVoice(25).f && A.cryVoice(143).f < A.cryVoice(25).f);
  assert.ok(A.cryVoice(25).f < A.cryVoice(92).f);
  // A family shares the shape of its call; the evolved forms are deeper.
  const [a, b, c] = [4, 5, 6].map(d => A.cryVoice(d));
  assert.deepEqual([a.family, b.family, c.family], [4, 4, 4]);
  assert.equal(a.syl.length, c.syl.length);
  assert.deepEqual(plain(a.syl.map(s => s.at)), plain(c.syl.map(s => s.at)));
  assert.ok(a.f > b.f && b.f > c.f);
  assert.equal(A.family(136), 133, 'Flareon is in the Eevee family');
  // Without species data (a later region's dex) it still makes a stable voice.
  const bare = boot(FILES).G.Audio._internals;
  assert.deepEqual(bare.cryVoice(200), bare.cryVoice(200));
});

test('every sound effect runs on the stand-in; unknown effects are ignored', () => {
  const { G, ac } = withSound(['js/data/species.js']);
  const SFX = G.Audio._internals.SFX;
  for (const name of ['bump', 'door', 'ledge', 'expTick', 'lowHp', 'run', 'throw', 'shine', 'cry']) assert.ok(SFX[name], name);
  for (const [name, fn] of Object.entries(SFX)) {
    const before = ac.made.nodes;
    fn(name === 'cry' ? 25 : 0.5);
    assert.ok(ac.made.nodes > before, name + ' made no sound');
  }
  SFX.cry({ dex: 6, faint: true });
  assert.doesNotThrow(() => G.Audio.sfx('no-such-sound'));
  assert.doesNotThrow(() => G.Audio.sfx('none'));
  const osc = ac.made.osc;
  G.Audio.sfx('no-such-sound');
  assert.equal(ac.made.osc, osc);
  G.Audio.cry(25);
  assert.ok(ac.made.osc > osc, 'cry() plays');
});
