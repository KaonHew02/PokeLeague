/* ============ audio.js — synthesiser, sequencer and sound effects ============
 * Every sound is generated on the spot with Web Audio: there are no audio files.
 *
 *   G.Audio.music('village')   switch theme with a cross-fade (see data/music.js); null = silence
 *   G.Audio.sfx('coin')        sound effect (rate-limited); unknown names are ignored
 *   G.Audio.setVolume('music' | 'sfx', 0..1) · toggleMute()
 *
 * Browsers allow no sound before the first click or key press, so the audio
 * context is created then, and the requested theme starts playing.
 * The volume is stored in localStorage (it belongs to the browser, not the save).
 */
G.Audio = (() => {
  const KEY = 'pl.audio';
  let ctx = null, master, outNode, musicBus, sfxBus, reverb, wet;
  const settings = { music: 0.55, sfx: 0.7, muted: false };
  try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage can be blocked */ }
  let noiseBuf = null;

  function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* storage can be blocked */ } }

  // ---------------- start-up ----------------

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createDynamicsCompressor();
    master.threshold.value = -14; master.ratio.value = 4;
    const out = outNode = ctx.createGain(); out.gain.value = 0.9;
    master.connect(out).connect(ctx.destination);

    musicBus = ctx.createGain(); sfxBus = ctx.createGain();
    musicBus.connect(master); sfxBus.connect(master);

    // Reverb: a generated impulse response (noise fading over 1.8 s). It is
    // filled a moment later, in pieces, so it does not stall the page load.
    reverb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 1.8);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    let ch = 0;
    const fill = () => {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) { const g = 1 - i / len; d[i] = (Math.random() * 2 - 1) * g * g * Math.sqrt(g); }
      if (++ch < 2) setTimeout(fill, 30); else reverb.buffer = ir;
    };
    setTimeout(fill, 300);
    wet = ctx.createGain(); wet.gain.value = 0.3;
    reverb.connect(wet).connect(musicBus);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    applyVolumes();
    return true;
  }

  function unlock() {
    if (!init()) return;
    // 'suspended' or 'interrupted' (iPhone coming back from another app): resume.
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    if (wanted && !current) startSong(wanted);
  }
  // On phones touching the screen (pointerdown) does not count as a gesture
  // for sound, lifting the finger does (pointerup / touchend). Listen to all.
  for (const ev of ['pointerdown', 'pointerup', 'touchend', 'keydown']) addEventListener(ev, unlock, { capture: true });

  function applyVolumes() {
    if (!ctx) return;
    const t = ctx.currentTime;
    musicBus.gain.setTargetAtTime(settings.muted ? 0 : settings.music * 0.7, t, 0.05);
    // Effects are generated quietly: ×2.4 puts them level with the music (measured).
    sfxBus.gain.setTargetAtTime(settings.muted ? 0 : settings.sfx * 2.4, t, 0.05);
  }

  function setVolume(which, v) { settings[which] = G.U.clamp(v, 0, 1); save(); applyVolumes(); }
  function toggleMute() { settings.muted = !settings.muted; save(); applyVolumes(); return settings.muted; }

  // ---------------- building blocks ----------------

  const midiFreq = m => 440 * Math.pow(2, (m - 69) / 12);

  function osc(type, f, t, end, dest) {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f, t);
    o.connect(dest); o.start(t); o.stop(end + 0.05);
    return o;
  }

  function gainEnv(dest, t, a, peak, dur, rel, sus = 0.7) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * sus, t + a, Math.max(0.02, dur * 0.4));
    g.gain.setTargetAtTime(0.0001, t + dur, rel / 3);
    g.connect(dest);
    return g;
  }

  function noise(t, dur, dest) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    return s;
  }

  function filt(type, f, q, dest) {
    const b = ctx.createBiquadFilter();
    b.type = type; b.frequency.value = f; b.Q.value = q;
    b.connect(dest);
    return b;
  }

  function send(node, amount) {
    const s = ctx.createGain(); s.gain.value = amount;
    node.connect(s).connect(reverb);
  }

  // ---------------- instruments ----------------

  const INST = {
    flute(t, f, d, v, bus) {
      const lp = filt('lowpass', 3600, 0.5, bus);
      const g = gainEnv(lp, t, 0.045, 0.2 * v, d, 0.14, 0.82);
      send(g, 0.35);
      const o1 = osc('triangle', f, t, t + d + 0.3, g);
      const g2 = ctx.createGain(); g2.gain.value = 0.18; g2.connect(g);
      const o2 = osc('sine', f * 2, t, t + d + 0.3, g2);
      // Vibrato that fades in, like a flute player.
      const lfo = ctx.createOscillator(); lfo.frequency.value = 5.3;
      const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(f * 0.007, t + Math.min(0.35, d));
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
      lfo.start(t); lfo.stop(t + d + 0.35);
      // Breath at the start of the note.
      const bp = filt('bandpass', f * 2.2, 2, g);
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.25, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      ng.connect(bp); noise(t, 0.09, ng);
    },
    bell(t, f, d, v, bus) {
      const g = ctx.createGain(); g.connect(bus); send(g, 0.3);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.22 * v, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0008, t + Math.min(d, 0.45) + 0.45);
      osc('sine', f, t, t + 1, g);
      const g2 = ctx.createGain(); g2.connect(g);
      g2.gain.setValueAtTime(0.35, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc('sine', f * 4, t, t + 0.12, g2);
    },
    pluck(t, f, d, v, bus) {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(3200, t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.8), t + 0.22);
      const g = ctx.createGain(); g.connect(bus); send(g, 0.2);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.11 * v, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0008, t + Math.min(d, 0.35) + 0.25);
      lp.connect(g);
      osc('sawtooth', f, t, t + 0.7, lp);
    },
    bass(t, f, d, v, bus) {
      const lp = filt('lowpass', 900, 0.7, bus);
      const g = gainEnv(lp, t, 0.008, 0.34 * v, d * 0.9, 0.08, 0.65);
      osc('triangle', f, t, t + d + 0.2, g);
      const g2 = ctx.createGain(); g2.gain.value = 0.25; g2.connect(g);
      osc('square', f, t, t + d + 0.2, g2);
    },
    pad(t, f, d, v, bus) {
      const lp = filt('lowpass', 1100, 0.6, bus);
      const g = gainEnv(lp, t, 0.35, 0.05 * v, d, 0.7, 0.9);
      send(g, 0.5);
      osc('sawtooth', f * 1.004, t, t + d + 1, g);
      osc('sawtooth', f * 0.996, t, t + d + 1, g);
    },
    lead(t, f, d, v, bus) {
      const lp = filt('lowpass', 2600, 1, bus);
      const g = gainEnv(lp, t, 0.01, 0.075 * v, d, 0.08, 0.75);
      send(g, 0.2);
      const o1 = osc('square', f, t, t + d + 0.2, g);
      const o2 = osc('square', f * 1.006, t, t + d + 0.2, g);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 6;
      const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(f * 0.008, t + 0.2);
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
      lfo.start(t); lfo.stop(t + d + 0.25);
    },
    kick(t, v, bus) {
      const g = ctx.createGain(); g.connect(bus);
      g.gain.setValueAtTime(0.55 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      const o = osc('sine', 150, t, t + 0.25, g);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    },
    snare(t, v, bus) {
      const hp = filt('highpass', 1300, 0.7, bus);
      const g = ctx.createGain(); g.connect(hp); send(g, 0.15);
      g.gain.setValueAtTime(0.22 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      noise(t, 0.15, g);
      const g2 = ctx.createGain(); g2.connect(bus);
      g2.gain.setValueAtTime(0.12 * v, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc('triangle', 190, t, t + 0.1, g2);
    },
    hat(t, v, bus) {
      const hp = filt('highpass', 7500, 0.7, bus);
      const g = ctx.createGain(); g.connect(hp);
      g.gain.setValueAtTime(0.08 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      noise(t, 0.05, g);
    },
    shaker(t, v, bus) {
      const bp = filt('bandpass', 5200, 1.2, bus);
      const g = ctx.createGain(); g.connect(bp);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.07 * v, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      noise(t, 0.08, g);
    }
  };

  // ---------------- sequencer ----------------

  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midiOf(name) {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
    if (!m) return null;
    return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }

  /** Chord "F", "Dm", "C/E", "F#m"... -> { root (0-11), minor, bass (0-11) } */
  function parseChord(c) {
    const m = /^([A-G])(#|b)?(m?)(?:\/([A-G])(#|b)?)?$/.exec(c);
    const pc = (l, a) => (NOTE[l] + (a === '#' ? 1 : a === 'b' ? -1 : 0) + 12) % 12;
    const root = pc(m[1], m[2]);
    return { root, minor: m[3] === 'm', bass: m[4] ? pc(m[4], m[5]) : root };
  }

  /**
   * Compiles a song from data/music.js into a list of events per step
   * (16th note). Melodies: "A4:4 C5:2 -:2" (note:length in 16ths).
   * Bass lines and arpeggios come from the chords with 16-character patterns.
   */
  function compile(song) {
    const bars = song.bars || song.chords.length;
    const steps = bars * 16;
    const ev = Array.from({ length: steps }, () => []);

    for (const tr of song.melody || []) {
      tr.bars.forEach((bar, bi) => {
        let s = 0;
        for (const tok of bar.trim().split(/\s+/)) {
          const [n, len] = tok.split(':');
          const L = +len || 1;
          if (n !== '-') {
            const midi = midiOf(n) + (tr.shift || 0);
            ev[(bi * 16 + s) % steps].push({ inst: tr.inst, f: midiFreq(midi), len: L, v: tr.vel || 1 });
          }
          s += L;
        }
      });
    }

    const chords = song.chords.map(parseChord);
    const chordTone = (ch, i, base) => {
      const third = ch.minor ? 3 : 4;
      const iv = [0, third, 7, 12, 12 + third, 19][i] || 0;
      return base + ch.root + iv;
    };
    for (let b = 0; b < bars; b++) {
      const ch = chords[b % chords.length];
      for (const tr of song.parts || []) {
        const pat = tr.pattern;
        const base = 12 * (tr.octave + 1);
        for (let s = 0; s < 16; s++) {
          const c = pat[s];
          if (!c || c === '.' || c === '-') continue;
          let len = 1;
          while (s + len < 16 && pat[s + len] === '-') len++;
          let midi;
          if (c === 'R') midi = base + (tr.useBass ? ch.bass : ch.root);
          else if (c === 'F') midi = base + ch.root + 7;
          else if (c === 'O') midi = base + ch.root + 12;
          else if (c === 'T') midi = base + ch.root + (ch.minor ? 3 : 4);
          else if (c === 'C') {           // whole chord (pad)
            for (let i = 0; i < 3; i++) ev[b * 16 + s].push({ inst: tr.inst, f: midiFreq(chordTone(ch, i, base)), len, v: tr.vel || 1 });
            continue;
          } else midi = chordTone(ch, +c, base);
          ev[b * 16 + s].push({ inst: tr.inst, f: midiFreq(midi), len, v: tr.vel || 1 });
        }
      }
      for (const [inst, pat] of Object.entries(song.drums || {})) {
        for (let s = 0; s < 16; s++) {
          const c = pat[s];
          if (c && c !== '.') ev[b * 16 + s].push({ inst, drum: true, v: c === 'X' ? 1 : c === 'x' ? 0.75 : 0.45 });
        }
      }
    }
    return { steps, ev, bpm: song.bpm, swing: song.swing || 0 };
  }

  let wanted = null, current = null;
  const compiled = {};

  function startSong(name) {
    if (!ctx || !G.MUSIC[name]) return;
    const song = compiled[name] || (compiled[name] = compile(G.MUSIC[name]));
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);
    bus.connect(musicBus);
    current = { name, song, bus, step: 0, next: ctx.currentTime + 0.1 };
  }

  function stopCurrent() {
    if (!current) return;
    const b = current.bus;
    b.gain.cancelScheduledValues(ctx.currentTime);
    b.gain.setValueAtTime(b.gain.value, ctx.currentTime);
    b.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
    setTimeout(() => b.disconnect(), 900);
    current = null;
  }

  /** Switches theme (with a fade). null = silence. */
  function music(name) {
    if (wanted === name) return;
    wanted = name;
    if (!ctx) return;                    // it will start on the first click
    stopCurrent();
    if (name) startSong(name);
  }

  // Scheduler: plans notes 150 ms ahead.
  setInterval(() => {
    if (!ctx || !current || ctx.state !== 'running') return;
    const c = current, sd = 60 / c.song.bpm / 4;
    while (c.next < ctx.currentTime + 0.15) {
      const i = c.step % c.song.steps;
      // Swing: delays the off-beat eighths.
      const t = c.next + (i % 4 === 2 ? c.song.swing * sd : 0);
      for (const e of c.song.ev[i]) {
        if (e.drum) INST[e.inst](t, e.v, c.bus);
        else INST[e.inst](t, e.f, e.len * sd, e.v, c.bus);
      }
      c.next += sd;
      c.step++;
    }
  }, 25);

  // ---------------- sound effects ----------------

  const last = {};
  let voices = 0;

  function tone(type, f0, f1, dur, vol, at = 0, bus = sfxBus) {
    const t = ctx.currentTime + at;
    const g = ctx.createGain(); g.connect(bus);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    const o = osc(type, f0, t, t + dur, g);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  }

  function hiss(dur, vol, type, f0, f1, at = 0, q = 1) {
    const t = ctx.currentTime + at;
    const b = ctx.createBiquadFilter(); b.type = type; b.Q.value = q;
    b.frequency.setValueAtTime(f0, t);
    if (f1) b.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); b.connect(g); g.connect(sfxBus);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    noise(t, dur, b);
  }

  function arp(type, freqs, gap, dur, vol) { freqs.forEach((f, i) => tone(type, f, f, dur, vol, i * gap)); }

  const SFX = {
    hover:   () => tone('square', 1400, 1400, 0.025, 0.025),
    click:   () => tone('square', 660, 990, 0.05, 0.06),
    back:    () => tone('square', 880, 520, 0.07, 0.05),
    confirm: () => arp('triangle', [784, 988, 1319], 0.05, 0.12, 0.09),
    select:  () => tone('square', 990, 1180, 0.04, 0.045),
    error:   () => arp('square', [330, 262], 0.08, 0.09, 0.05),
    menu:    () => arp('square', [523, 784], 0.05, 0.07, 0.04),
    text:    () => tone('square', 1200, 1200, 0.02, 0.015),
    hit:     () => { tone('triangle', 230, 90, 0.08, 0.07); hiss(0.08, 0.06, 'lowpass', 1400); },
    hitSuper:() => { tone('square', 300, 80, 0.14, 0.07); hiss(0.14, 0.1, 'lowpass', 2400); },
    hitWeak: () => tone('triangle', 200, 120, 0.06, 0.05),
    faint:   () => tone('sine', 720, 120, 0.5, 0.06),
    coin:    () => { tone('square', 1320, 1320, 0.05, 0.035); tone('square', 1760, 1760, 0.14, 0.035, 0.05); },
    heal:    () => arp('triangle', [523, 659, 784, 1047], 0.06, 0.18, 0.06),
    levelup: () => { arp('square', [523, 659, 784, 1047], 0.07, 0.14, 0.05); arp('triangle', [1047, 1319, 1568], 0.07, 0.3, 0.05); },
    hurt:    () => { tone('square', 150, 70, 0.14, 0.06); hiss(0.1, 0.06, 'lowpass', 900); },
    shiny:   () => [2093, 2637, 3136, 2349, 3520, 4186].forEach((f, i) => INST.bell(ctx.currentTime + i * 0.07, f, 0.3, 0.8, sfxBus)),
    grass:   () => hiss(0.06, 0.03, 'highpass', 2600),
    ball:    () => { tone('triangle', 220, 70, 0.12, 0.12); hiss(0.08, 0.06, 'lowpass', 800); },
    shake:   () => tone('square', 420, 380, 0.04, 0.05),
    buy:     () => { SFX.coin(); arp('triangle', [659, 784, 1047], 0.05, 0.12, 0.06); }
  };

  // Minimum gap between repeats of the same effect (ms).
  const MIN_GAP = { hit: 45, coin: 50, grass: 70, hover: 40, text: 30, select: 30 };

  function sfx(name, opts) {
    if (!ctx || settings.muted || settings.sfx <= 0 || ctx.state !== 'running') return;
    const fn = SFX[name];
    if (!fn) return;
    const now = performance.now();
    if (now - (last[name] || 0) < (MIN_GAP[name] || 0)) return;
    if (voices > 24) return;                    // cap on simultaneous voices
    last[name] = now;
    voices++; setTimeout(() => voices--, 150);
    try { fn(opts); } catch (e) { /* an effect must never break the game */ }
  }

  /** For tests: peak and RMS of the output over `ms` milliseconds. */
  function debugMeter(ms = 2000) {
    if (!ctx) return Promise.resolve(null);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    master.connect(an);
    const buf = new Float32Array(an.fftSize);
    let peak = 0, sum = 0, n = 0;
    return new Promise(res => {
      const t0 = performance.now();
      const id = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        for (const v of buf) { const a = Math.abs(v); if (a > peak) peak = a; sum += v * v; n++; }
        if (performance.now() - t0 > ms) {
          clearInterval(id); master.disconnect(an);
          res({ peak: +peak.toFixed(3), rms: +Math.sqrt(sum / n).toFixed(4) });
        }
      }, 40);
    });
  }

  return {
    music, sfx, setVolume, toggleMute, unlock, debugMeter,
    // For audio extensions (jingles, cries) that build on the same synth.
    get _internals() { return { ctx, musicBus, sfxBus, INST, compile, tone, hiss, arp, SFX }; },
    /** Can it play yet? (browsers only allow it after a touch or key press) */
    canPlay() { return !!ctx && ctx.state === 'running'; },
    get settings() { return settings; },
    get running() { return !!ctx && ctx.state === 'running'; },
    get track() { return current && current.name; }
  };
})();
