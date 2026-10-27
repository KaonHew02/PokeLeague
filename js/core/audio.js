/* ============ audio.js — synthesiser, sequencer, jingles, cries and sound effects ============
 * Every sound is generated on the spot with Web Audio: there are no audio files.
 *
 *   G.Audio.context('town')      play the theme of a context (data/music-map.js). Maps and
 *                                scripts name a context, never a song; null = silence
 *   G.Audio.music('village')     switch theme by song name, with a cross-fade (data/music.js)
 *   await G.Audio.jingle('heal') a short tune (a song marked once:true) over the music bus:
 *                                the theme pauses and comes back at the beat where it stopped
 *   G.Audio.cry(25, {faint})     the synthesised cry of a species: every dex number sounds
 *                                different, and always the same
 *   G.Audio.sfx('coin')          sound effect (rate-limited); unknown names are ignored
 *   G.Audio.alarm(true | false)  the low-HP beeping in battle, until it is turned off
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
    if (wanted && !current && !jing) startSong(wanted);
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

  /** An oscillator from `t` to `end`, connected to `dest` (none for one that modulates a parameter). */
  function osc(type, f, t, end, dest) {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (dest) o.connect(dest);
    o.start(t); o.stop(end + 0.05);
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

  /** White noise from `t` for `dur` s. `from` picks where in the buffer it starts (random by default). */
  function noise(t, dur, dest, from) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    s.connect(dest); s.start(t, from == null ? Math.random() * 0.5 : from); s.stop(t + dur + 0.05);
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
    /** Synth brass for fanfares: two detuned saws through a low-pass that opens on the attack. */
    brass(t, f, d, v, bus) {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4;
      lp.frequency.setValueAtTime(f * 1.5, t);
      lp.frequency.linearRampToValueAtTime(Math.min(7000, f * 7), t + 0.05);
      lp.frequency.setTargetAtTime(Math.min(5000, f * 4), t + 0.05, 0.2);
      lp.connect(bus);
      const g = gainEnv(lp, t, 0.025, 0.05 * v, d, 0.12, 0.8);
      send(g, 0.25);
      osc('sawtooth', f, t, t + d + 0.25, g);
      osc('sawtooth', f * 1.005, t, t + d + 0.25, g);
    },
    /** Electric piano: a sine whose FM brightness dies away after the attack. */
    keys(t, f, d, v, bus) {
      const g = gainEnv(bus, t, 0.005, 0.16 * v, d, 0.35, 0.5);
      send(g, 0.3);
      const o = osc('sine', f, t, t + d + 0.5, g);
      const m = ctx.createOscillator(); m.frequency.value = f;
      const mg = ctx.createGain();
      mg.gain.setValueAtTime(f * 1.6, t); mg.gain.exponentialRampToValueAtTime(f * 0.12, t + 0.4);
      m.connect(mg); mg.connect(o.frequency);
      m.start(t); m.stop(t + d + 0.5);
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
    },
    /** Timpani-like tom for fanfares and rolls. */
    tom(t, v, bus) {
      const g = ctx.createGain(); g.connect(bus); send(g, 0.2);
      g.gain.setValueAtTime(0.42 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      const o = osc('sine', 120, t, t + 0.45, g);
      o.frequency.exponentialRampToValueAtTime(68, t + 0.3);
    },
    crash(t, v, bus) {
      const hp = filt('highpass', 4800, 0.6, bus);
      const g = ctx.createGain(); g.connect(hp); send(g, 0.3);
      g.gain.setValueAtTime(0.08 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
      noise(t, 1.35, g);
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
   * (16th note). Melodies: "A4:4 C5:2 -:2" (note:length in 16ths), and
   * "C4+E4+G4:8" for several notes at once.
   * Bass lines and arpeggios come from the chords with 16-character patterns.
   * A drum pattern may span several bars (32, 48... characters).
   */
  function compile(song) {
    const bars = song.bars || Math.max(song.chords ? song.chords.length : 0,
      ...(song.melody || []).map(tr => tr.bars.length));
    const steps = bars * 16;
    const ev = Array.from({ length: steps }, () => []);

    for (const tr of song.melody || []) {
      tr.bars.forEach((bar, bi) => {
        let s = 0;
        for (const tok of bar.trim().split(/\s+/)) {
          const [n, len] = tok.split(':');
          const L = +len || 1;
          if (n !== '-') {
            for (const one of n.split('+')) {
              const midi = midiOf(one) + (tr.shift || 0);
              ev[(bi * 16 + s) % steps].push({ inst: tr.inst, f: midiFreq(midi), len: L, v: tr.vel || 1 });
            }
          }
          s += L;
        }
      });
    }

    const chords = (song.chords || []).map(parseChord);
    const chordTone = (ch, i, base) => {
      const third = ch.minor ? 3 : 4;
      const iv = [0, third, 7, 12, 12 + third, 19][i] || 0;
      return base + ch.root + iv;
    };
    for (let b = 0; b < bars; b++) {
      const ch = chords[b % chords.length];
      for (const tr of ch ? song.parts || [] : []) {
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
          const c = pat[(b * 16 + s) % pat.length];
          if (c && c !== '.') ev[b * 16 + s].push({ inst, drum: true, v: c === 'X' ? 1 : c === 'x' ? 0.75 : 0.45 });
        }
      }
    }
    return { steps, ev, bpm: song.bpm, swing: song.swing || 0, once: !!song.once };
  }

  /** Length of a song in seconds (one time through). */
  function songLength(song) { return song.steps * 60 / song.bpm / 4; }

  /**
   * Plans the steps of player `p` ({ song, step, next }) that start before the
   * time `until`, calling play(event, time, stepLength) for each note. A loop
   * wraps around; a song marked once stops after its last step. Returns true
   * when a once song has no steps left: p.next is then the time it ends.
   */
  function advance(p, until, play) {
    const s = p.song, sd = 60 / s.bpm / 4;
    while (p.next < until) {
      if (s.once && p.step >= s.steps) return true;
      const i = p.step % s.steps;
      // Swing: delays the off-beat eighths.
      const t = p.next + (i % 4 === 2 ? s.swing * sd : 0);
      for (const e of s.ev[i]) play(e, t, sd);
      p.next += sd;
      p.step++;
    }
    return s.once && p.step >= s.steps;
  }

  let wanted = null;      // the theme the game asked for (it starts on the first click)
  let current = null;     // the theme playing: { name, song, bus, step, next }
  let jing = null;        // the jingle playing; the theme waits for it to end
  let resume = null;      // { name, step }: where the paused theme comes back
  const compiled = {};

  function player(name, step, fadeIn, delay) {
    const song = compiled[name] || (compiled[name] = compile(G.MUSIC[name]));
    const bus = ctx.createGain(), t = ctx.currentTime;
    if (fadeIn) {
      bus.gain.setValueAtTime(0.0001, t);
      bus.gain.linearRampToValueAtTime(1, t + fadeIn);
    }
    bus.connect(musicBus);
    return { name, song, bus, step, next: t + delay };
  }

  function startSong(name, step = 0) {
    if (!ctx || !G.MUSIC[name]) return;
    current = player(name, step, 0.8, 0.1);
  }

  function fadeOut(p, time) {
    const b = p.bus, t = ctx.currentTime;
    b.gain.cancelScheduledValues(t);
    b.gain.setValueAtTime(b.gain.value, t);
    b.gain.linearRampToValueAtTime(0.0001, t + time);
    setTimeout(() => b.disconnect(), time * 1000 + 200);
  }

  function stopCurrent(time = 0.7) {
    if (!current) return;
    fadeOut(current, time);
    current = null;
  }

  /** Switches theme (with a fade). null = silence. A song marked once plays as a jingle. */
  function music(name) {
    if (name && G.MUSIC[name] && G.MUSIC[name].once) { jingle(name); return; }
    if (wanted === name) return;
    wanted = name;
    if (!ctx || jing) return;            // it starts on the first click, or when the jingle ends
    stopCurrent();
    if (name) startSong(name);
  }

  const playOn = bus => (e, t, sd) => {
    if (e.drum) INST[e.inst](t, e.v, bus);
    else INST[e.inst](t, e.f, e.len * sd, e.v, bus);
  };

  // Scheduler: plans notes 150 ms ahead.
  function tick() {
    if (!ctx || ctx.state !== 'running') return;
    const until = ctx.currentTime + 0.15;
    if (jing) {
      if (advance(jing, until, playOn(jing.bus)) && ctx.currentTime >= jing.next) endJingle(false);
    } else if (current) advance(current, until, playOn(current.bus));
  }
  setInterval(tick, 25);

  // ---------------- jingles ----------------

  /**
   * Plays a short tune (a song marked once:true) on the music bus. The theme
   * fades out, the jingle plays to its last step, then the theme comes back
   * at the beat where it stopped (or the theme asked for meanwhile starts).
   * The Promise resolves true when the jingle ends, false when another jingle
   * cuts it or when no sound can play (at once), so a script can always await it.
   */
  function jingle(name) {
    if (!ctx || ctx.state !== 'running' || !G.MUSIC[name]) return Promise.resolve(false);
    if (jing) endJingle(true);                    // cut it; the paused theme stays paused
    else if (current) {
      resume = { name: current.name, step: current.step - current.step % 4 };
      stopCurrent(0.15);
    } else resume = null;
    return new Promise(res => {
      const p = player(name, 0, 0, 0.12);
      p.done = res;
      // Safety net: it ends even if the audio is suspended in the middle.
      p.timer = setTimeout(() => { if (jing === p) endJingle(false); }, songLength(p.song) * 1000 + 2000);
      jing = p;
    });
  }

  function endJingle(cut) {
    const p = jing;
    jing = null;
    clearTimeout(p.timer);
    if (cut) fadeOut(p, 0.1);
    else setTimeout(() => p.bus.disconnect(), 2500);     // let the last notes ring
    p.done(!cut);
    if (cut) return;
    if (wanted) startSong(wanted, resume && resume.name === wanted ? resume.step : 0);
    resume = null;
  }

  // ---------------- contexts ----------------

  /**
   * Plays the theme of a context ('town', 'route', 'wild', 'gym'... see
   * data/music-map.js) and returns the song's name; null = silence.
   * An unknown context is reported and changes nothing.
   */
  function context(name) {
    if (name == null) { music(null); return null; }
    const map = G.MusicMap || {};
    const song = Object.prototype.hasOwnProperty.call(map, name) ? map[name] : undefined;
    if (song !== null && !(song && G.MUSIC[song])) {
      console.warn('G.Audio.context: unknown music context ' + JSON.stringify(name));
      return undefined;
    }
    music(song);
    return song;
  }

  // ---------------- cries ----------------
  // A cry is 1 to 3 gliding syllables. Its shape (how many syllables, their
  // glides, the filter) comes from a seeded RNG of the evolution family, so a
  // family sounds related. The species' weight sets the pitch and the length
  // (heavier is deeper and longer), its types the timbre (waveform, buzz,
  // trill, rasp), and its own RNG a small detune. Same dex, same cry.

  // Timbre by type. waves: the primary type's choices. vib [rate min, max, depth min,
  // max (semitones)], fm [ratio min, max, index min, max], noise [mix min, max],
  // band: the noise band (× pitch), pitch: semitones up or down.
  const CRY_TYPE = {
    normal:   { waves: ['square', 'sawtooth', 'triangle'] },
    fire:     { waves: ['sawtooth'], noise: [0.35, 0.6], band: [2.5, 5] },
    water:    { waves: ['sine', 'triangle'], vib: [5, 9, 0.5, 1.4] },
    electric: { waves: ['square'], vib: [16, 28, 0.3, 0.9], pitch: 2 },
    grass:    { waves: ['triangle', 'square'], vib: [4, 7, 0.2, 0.6] },
    ice:      { waves: ['sine'], fm: [2, 3.5, 0.6, 1.4], pitch: 3 },
    fighting: { waves: ['sawtooth', 'square'], fm: [0.5, 1, 0.8, 1.8] },
    poison:   { waves: ['sawtooth'], noise: [0.15, 0.35], band: [1, 2] },
    ground:   { waves: ['sawtooth', 'triangle'], noise: [0.25, 0.45], band: [0.7, 1.4], pitch: -2 },
    flying:   { waves: ['triangle', 'square'], pitch: 4 },
    psychic:  { waves: ['sine'], fm: [1.41, 2.76, 0.8, 2.2], vib: [3, 5, 0.4, 1] },
    bug:      { waves: ['square', 'triangle'], vib: [24, 40, 0.6, 1.6], pitch: 3 },
    rock:     { waves: ['sawtooth'], noise: [0.25, 0.45], band: [0.6, 1.2], fm: [0.5, 0.5, 0.6, 1.4], pitch: -2 },
    ghost:    { waves: ['triangle', 'sine'], vib: [2.5, 5, 1.5, 3.5], pitch: -4 },
    dragon:   { waves: ['sawtooth'], fm: [0.5, 1, 1.2, 2.6], pitch: -2 },
    dark:     { waves: ['sawtooth', 'square'], noise: [0.1, 0.25], band: [1.5, 3], pitch: -1 },
    steel:    { waves: ['square'], fm: [2.76, 3.9, 0.8, 1.8] },
    fairy:    { waves: ['sine', 'triangle'], vib: [6, 8, 0.3, 0.8], pitch: 4 }
  };
  const WAVE_VOL = { sine: 0.12, triangle: 0.12, square: 0.085, sawtooth: 0.115 };   // levelled by ear and debugMeter
  const TYPES = Object.keys(CRY_TYPE);

  // Family of each species: its lowest dex number, so a baby form that a later
  // region adds (Pichu) leaves the family's sound alone.
  let famData = null, famOf = {};
  function family(dex) {
    const data = G.SPECIES || null;
    if (famData !== data) {
      famData = data; famOf = {};
      const links = {};
      const link = (a, b) => { (links[a] = links[a] || []).push(b); };
      for (const [id, sp] of Object.entries(data || {})) for (const e of sp.evo || []) { link(+id, e.to); link(e.to, +id); }
      for (const id of Object.keys(links)) {
        if (famOf[id]) continue;
        const group = [+id], seen = new Set(group);
        for (let i = 0; i < group.length; i++) for (const n of links[group[i]]) if (!seen.has(n)) { seen.add(n); group.push(n); }
        const low = Math.min(...group);
        for (const n of group) famOf[n] = low;
      }
    }
    return famOf[dex] || dex;
  }

  const seedOf = (n, salt) => Math.floor(G.U.hash(n, salt, 0x63727921) * 4294967296);

  /** The voice of a species: plain numbers, the same for the same dex. */
  function cryVoice(dex) {
    dex = Math.max(1, dex | 0);
    const sp = G.SPECIES && G.SPECIES[dex];
    const fam = family(dex);
    const shape = G.RNG(seedOf(fam, 1)), tone = G.RNG(seedOf(fam, 2)), own = G.RNG(seedOf(dex, 3));
    const r = (rng, a, b) => a + rng.next() * (b - a);

    // Shape (family): syllables with a start, peak and end pitch in semitones.
    const n = shape.pick([1, 1, 2, 2, 2, 3]);
    const raw = [0, 1, 2].map(i => ({
      w: r(shape, 0.6, 1.6), gap: r(shape, 0.03, 0.1),
      p0: r(shape, -4, 6), rise: r(shape, -2, 8), fall: r(shape, 1, 12), peak: r(shape, 0.12, 0.6)
    })).slice(0, n);
    const total = raw.reduce((a, s, i) => a + s.w + (i ? s.gap : 0), 0);
    let at = 0;
    const syl = raw.map((s, i) => {
      if (i) at += s.gap / total;
      const p1 = s.p0 + s.rise;
      const out = { at: +at.toFixed(4), len: +(s.w / total).toFixed(4), peak: +s.peak.toFixed(3),
        p: [+s.p0.toFixed(2), +p1.toFixed(2), +(p1 - s.fall - (i === n - 1 ? 3 : 0)).toFixed(2)] };
      at += s.w / total;
      return out;
    });
    const cut = r(shape, 3, 8), q = r(shape, 1, 5);

    // Timbre (family and types).
    const types = sp ? sp.types : [TYPES[Math.floor(own.next() * TYPES.length)]];
    const t1 = CRY_TYPE[types[0]] || CRY_TYPE.normal, t2 = CRY_TYPE[types[1]] || {};
    const feat = k => t1[k] || t2[k];
    const wave = t1.waves[Math.floor(tone.next() * t1.waves.length)];
    const v = feat('vib') || [5, 12, 0, 0.5];
    const vib = { rate: +r(tone, v[0], v[1]).toFixed(2), depth: +r(tone, v[2], v[3]).toFixed(2) };
    const f = feat('fm') || [1, 2, 0, 0.6];
    const fm = { ratio: +r(tone, f[0], f[1]).toFixed(2), index: +r(tone, f[2], f[3]).toFixed(2) };
    const nz = feat('noise') || [0.04, 0.18], bd = feat('band') || [1.5, 3];
    const nmix = r(tone, nz[0], nz[1]), band = r(tone, bd[0], bd[1]);

    // Size (species): weight in hectograms, as PokeAPI gives it.
    const size = Math.log10(Math.max(1, sp ? sp.w : Math.pow(10, own.next() * 3.3)));
    const semis = -size * 9 + (t1.pitch || 0) + (t2.pitch || 0) * 0.5 + r(shape, -3, 3) + r(own, -1, 1);
    const hz = G.U.clamp(1400 * Math.pow(2, semis / 12), 150, 1700);
    const dur = G.U.clamp(0.34 + size * 0.13 + r(shape, 0, 0.12) + r(own, 0, 0.05), 0.3, 1);
    fm.index = +(fm.index + size * 0.2).toFixed(2);              // big ones growl

    return { dex, family: fam, f: +hz.toFixed(1), dur: +dur.toFixed(3), wave, syl, vib, fm,
      noise: { mix: +G.U.clamp(nmix + size * 0.04, 0, 0.7).toFixed(3), band: +band.toFixed(2) },
      cut: +cut.toFixed(2), q: +q.toFixed(2), vol: WAVE_VOL[wave] };
  }

  /** Plays a cry on the effects bus now; returns its length in seconds. */
  function playCry(dex, opts = {}) {
    const c = cryVoice(dex);
    const faint = !!opts.faint;
    const f = c.f * (faint ? 0.78 : 1) * (opts.pitch || 1);
    const dur = c.dur * (faint ? 1.35 : 1);
    const t0 = ctx.currentTime + 0.01;
    const out = ctx.createGain(); out.gain.value = c.vol * (opts.vol == null ? 1 : opts.vol); out.connect(sfxBus);
    const lp = filt('lowpass', Math.min(9000, Math.max(1200, f * c.cut)), c.q, out);
    c.syl.forEach((s, i) => {
      const T = t0 + s.at * dur, L = s.len * dur, end = T + L;
      const hz = st => f * Math.pow(2, st / 12);
      const p2 = s.p[2] - (faint && i === c.syl.length - 1 ? 7 : 0);
      const glide = (param, k) => {
        param.setValueAtTime(hz(s.p[0]) * k, T);
        param.linearRampToValueAtTime(hz(s.p[1]) * k, T + s.peak * L);
        param.exponentialRampToValueAtTime(hz(p2) * k, end);
      };
      const env = ctx.createGain(); env.connect(lp);
      env.gain.setValueAtTime(0.0001, T);
      env.gain.linearRampToValueAtTime(1, T + Math.min(0.025, L * 0.2));
      env.gain.linearRampToValueAtTime(0.75, T + L * 0.6);
      env.gain.exponentialRampToValueAtTime(0.001, end);
      const car = osc(c.wave, hz(s.p[0]), T, end, env);
      glide(car.frequency, 1);
      if (c.vib.depth > 0) {
        const lfo = osc('sine', c.vib.rate, T, end, null);
        const lg = ctx.createGain(); lg.gain.value = hz(s.p[1]) * (Math.pow(2, c.vib.depth / 12) - 1);
        lfo.connect(lg); lg.connect(car.frequency);
      }
      if (c.fm.index > 0) {
        const mod = osc('sine', hz(s.p[0]) * c.fm.ratio, T, end, null);
        glide(mod.frequency, c.fm.ratio);
        const mg = ctx.createGain();
        mg.gain.setValueAtTime(hz(s.p[1]) * c.fm.index * 1.5, T);
        mg.gain.linearRampToValueAtTime(hz(s.p[1]) * c.fm.index * 0.6, end);
        mod.connect(mg); mg.connect(car.frequency);
      }
      if (c.noise.mix > 0) {
        const ng = ctx.createGain(); ng.gain.value = c.noise.mix * 2.5; ng.connect(env);
        const bp = filt('bandpass', Math.min(8000, hz(s.p[1]) * c.noise.band), 2.5, ng);
        noise(T, L, bp, (c.dex * 0.0137 + i * 0.11) % 0.5);
      }
    });
    return dur;
  }

  /**
   * Plays the cry of species `dex`. opts: { faint } (lower and slower, as it
   * faints), pitch (×), vol (×). Resolves when the cry ends (at once when
   * effects cannot play).
   */
  function cry(dex, opts) {
    if (!ctx || settings.muted || settings.sfx <= 0 || ctx.state !== 'running' || voices > 24) return Promise.resolve(false);
    let dur;
    try { dur = playCry(dex, opts); } catch (e) { return Promise.resolve(false); }
    voices++; setTimeout(() => voices--, 150);
    return new Promise(res => setTimeout(() => res(true), dur * 1000 + 20));
  }

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
    // Menus and text
    hover:   () => tone('square', 1400, 1400, 0.025, 0.025),
    click:   () => tone('square', 660, 990, 0.05, 0.06),
    back:    () => tone('square', 880, 520, 0.07, 0.05),
    confirm: () => arp('triangle', [784, 988, 1319], 0.05, 0.12, 0.09),
    select:  () => tone('square', 990, 1180, 0.04, 0.045),
    error:   () => arp('square', [330, 262], 0.08, 0.09, 0.05),
    menu:    () => arp('square', [523, 784], 0.05, 0.07, 0.04),
    text:    () => tone('square', 1200, 1200, 0.02, 0.015),
    save:    () => arp('triangle', [659, 880, 1319], 0.09, 0.25, 0.07),
    pcOn:    () => { arp('square', [880, 1320], 0.06, 0.06, 0.035); tone('sine', 2640, 2640, 0.12, 0.03, 0.12); },
    pcOff:   () => arp('square', [1320, 880, 660], 0.06, 0.07, 0.035),
    coin:    () => { tone('square', 1320, 1320, 0.05, 0.035); tone('square', 1760, 1760, 0.14, 0.035, 0.05); },
    buy:     () => { SFX.coin(); arp('triangle', [659, 784, 1047], 0.05, 0.12, 0.06); },
    // Overworld
    bump:    () => { tone('triangle', 120, 55, 0.1, 0.08); hiss(0.06, 0.03, 'lowpass', 420); },
    door:    () => { hiss(0.2, 0.05, 'bandpass', 500, 1600, 0, 1.2); tone('triangle', 150, 80, 0.08, 0.09, 0.15); },
    warp:    () => hiss(0.3, 0.12, 'bandpass', 2200, 400, 0, 1.4),          // stairs, exit mats
    ledge:   () => {
      tone('square', 330, 660, 0.12, 0.035);                                  // the hop...
      tone('triangle', 140, 60, 0.08, 0.12, 0.24); hiss(0.05, 0.04, 'lowpass', 600, 0, 0.24);   // ...and the landing
    },
    grass:   () => hiss(0.06, 0.03, 'highpass', 2600),
    spin:    () => arp('square', [880, 1175, 1568, 1175, 880], 0.03, 0.05, 0.035),        // a spin tile (the Rocket Hideout)
    surf:    () => { hiss(0.45, 0.09, 'bandpass', 700, 2600, 0, 1.2); tone('sine', 300, 600, 0.3, 0.03); },   // Surf: a splash
    lift:    () => { tone('sawtooth', 70, 90, 0.5, 0.05); hiss(0.5, 0.04, 'lowpass', 300); tone('sine', 1320, 1320, 0.2, 0.04, 0.55); },
    exclaim: () => { tone('square', 1568, 1568, 0.05, 0.045); tone('square', 2093, 2093, 0.14, 0.045, 0.06); },  // a trainer spots you
    encounter: () => {                                                         // into a battle
      tone('sawtooth', 180, 1400, 0.55, 0.055); tone('square', 360, 2800, 0.55, 0.03);
      hiss(0.55, 0.06, 'bandpass', 500, 5000, 0, 2);
    },
    // Battle
    hit:     () => { tone('triangle', 230, 90, 0.08, 0.07); hiss(0.08, 0.06, 'lowpass', 1400); },
    hitSuper:() => { tone('square', 300, 80, 0.14, 0.07); hiss(0.14, 0.1, 'lowpass', 2400); },
    hitWeak: () => tone('triangle', 200, 120, 0.06, 0.05),
    miss:    () => hiss(0.18, 0.11, 'bandpass', 2600, 800, 0, 1.4),
    hurt:    () => { tone('square', 150, 70, 0.14, 0.06); hiss(0.1, 0.06, 'lowpass', 900); },
    faint:   () => tone('sine', 720, 120, 0.5, 0.06),
    statUp:  () => arp('square', [523, 659, 784, 988, 1175, 1397], 0.035, 0.07, 0.04),
    statDown:() => arp('square', [1397, 1175, 988, 784, 659, 523], 0.035, 0.07, 0.04),
    status:  () => arp('triangle', [660, 520, 660, 520, 440], 0.05, 0.07, 0.05),   // poisoned, paralysed...
    heal:    () => arp('triangle', [523, 659, 784, 1047], 0.06, 0.18, 0.06),
    levelup: () => { arp('square', [523, 659, 784, 1047], 0.07, 0.14, 0.05); arp('triangle', [1047, 1319, 1568], 0.07, 0.3, 0.05); },
    // The EXP bar filling: call it for each tick, with how full the bar is (0..1).
    expTick: p => { const f = 880 + 880 * G.U.clamp(+p || 0, 0, 1); tone('square', f, f, 0.03, 0.02); },
    lowHp:   () => { tone('square', 1760, 1760, 0.07, 0.025); tone('square', 1760, 1760, 0.07, 0.025, 0.15); },
    run:     () => {                                                           // got away safely
      for (const at of [0, 0.08, 0.16]) hiss(0.06, 0.06, 'bandpass', 1600, 900, at, 1.5);
      tone('sine', 900, 250, 0.3, 0.03, 0.04);
    },
    pop:     () => { tone('sine', 300, 1500, 0.09, 0.06); hiss(0.18, 0.04, 'highpass', 3500); },        // out of the ball
    recall:  () => { tone('sine', 1500, 260, 0.28, 0.05); hiss(0.22, 0.03, 'bandpass', 3000, 700, 0, 1.5); },
    throw:   () => { hiss(0.3, 0.08, 'bandpass', 600, 3000, 0, 2); tone('sine', 420, 1000, 0.28, 0.04); },
    ball:    () => { tone('triangle', 220, 70, 0.12, 0.12); hiss(0.08, 0.06, 'lowpass', 800); },
    shake:   () => tone('square', 420, 380, 0.04, 0.05),
    lock:    () => { tone('square', 2400, 2400, 0.02, 0.05); tone('triangle', 1200, 900, 0.07, 0.07, 0.025); },  // the ball clicks shut
    shiny:   () => [2093, 2637, 3136, 2349, 3520, 4186].forEach((f, i) => INST.bell(ctx.currentTime + i * 0.07, f, 0.3, 0.8, sfxBus)),
    shine:   () => {                                                           // a badge or item glints
      tone('sine', 1600, 4200, 0.2, 0.025);
      INST.bell(ctx.currentTime + 0.12, 3136, 0.4, 0.35, sfxBus); INST.bell(ctx.currentTime + 0.2, 4186, 0.5, 0.28, sfxBus);
    },
    // sfx('cry', 25) or sfx('cry', { dex: 25, faint: true }): same as G.Audio.cry
    cry:     o => playCry(typeof o === 'object' && o ? o.dex : o, typeof o === 'object' && o ? o : {})
  };

  // Minimum gap between repeats of the same effect (ms).
  const MIN_GAP = { hit: 45, coin: 50, grass: 70, hover: 40, text: 30, select: 30,
    bump: 280, ledge: 200, door: 200, expTick: 35, lowHp: 300, exclaim: 150, statUp: 150, statDown: 150 };

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

  // The low-HP alarm repeats until it is turned off (or the battle ends).
  let alarmId = null;
  function alarm(on) {
    if (on && !alarmId) { sfx('lowHp'); alarmId = setInterval(() => sfx('lowHp'), 900); }
    else if (!on && alarmId) { clearInterval(alarmId); alarmId = null; }
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
    music, context, jingle, cry, sfx, alarm, setVolume, toggleMute, unlock, debugMeter,
    // For audio extensions and tests: the synth's parts, and the pure functions.
    get _internals() {
      return { ctx, musicBus, sfxBus, INST, compile, songLength, advance, tick, cryVoice, family, tone, hiss, arp, SFX,
        loop: current && { name: current.name, step: current.step }, resume };
    },
    /** Can it play yet? (browsers only allow it after a touch or key press) */
    canPlay() { return !!ctx && ctx.state === 'running'; },
    get settings() { return settings; },
    get running() { return !!ctx && ctx.state === 'running'; },
    /** The theme playing, or the one that comes back after the jingle. */
    get track() { return current ? current.name : jing ? wanted : null; },
    /** The jingle playing, or null. */
    get jingling() { return jing && jing.name; }
  };
})();
