window.G = window.G || {};

// Procedural sound engine (Web Audio): layered SFX with reverb, continuous engine/rover/cockpit loops,
// generative ambient music and automatic UI sounds for every button.
G.Audio = (function () {
  let ctx = null, masterGain, musicGain, sfxGain, ambGain, reverb, reverbSend, comp, noiseBuf = null;
  let musicTimer = null, musicMode = null, nextBeat = 0, beat = 0;
  let loops = null, lastPlay = {};
  let settings = { music: 0.5, sfx: 0.8 };

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
      comp.connect(ctx.destination);
      masterGain = ctx.createGain(); masterGain.connect(comp);
      reverb = ctx.createConvolver(); reverb.buffer = impulse(2.6, 2.4);
      reverbSend = ctx.createGain(); reverbSend.gain.value = 0.5;
      reverbSend.connect(reverb); reverb.connect(masterGain);
      musicGain = ctx.createGain(); musicGain.connect(masterGain);
      const mSend = ctx.createGain(); mSend.gain.value = 0.7; musicGain.connect(mSend); mSend.connect(reverb);
      sfxGain = ctx.createGain(); sfxGain.connect(masterGain);
      ambGain = ctx.createGain(); ambGain.connect(masterGain);
      applyVolumes();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  function noise() {
    if (!noiseBuf) {
      const len = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  function applyVolumes() {
    if (!ctx) return;
    musicGain.gain.value = settings.music * 0.32;
    sfxGain.gain.value = settings.sfx * 0.9;
    ambGain.gain.value = settings.sfx * 0.55;
  }

  // One shaped note. o: {f, f2, type, dur, vol, a (attack), delay, cut (lowpass), q, pan, rev, out}
  function note(o) {
    if (!ensureCtx()) return;
    const t0 = ctx.currentTime + (o.delay || 0), dur = o.dur || 0.2;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    if (o.detune) osc.detune.value = o.detune;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (o.cut) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.cut; f.Q.value = o.q || 0.7; node.connect(f); node = f; }
    node.connect(g);
    let out = g;
    if (o.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p; }
    out.connect(o.out || sfxGain);
    if (o.rev) { const s = ctx.createGain(); s.gain.value = o.rev; out.connect(s); s.connect(reverbSend); }
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  // Filtered noise. o: {dur, vol, f, f2, type ('bandpass'|'lowpass'|'highpass'), q, a, delay, rev}
  function hiss(o) {
    if (!ensureCtx()) return;
    const t0 = ctx.currentTime + (o.delay || 0), dur = o.dur || 0.3;
    const src = ctx.createBufferSource(); src.buffer = noise();
    src.loopStart = Math.random(); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || 0.8;
    f.frequency.setValueAtTime(o.f || 800, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(sfxGain);
    if (o.rev) { const s = ctx.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(reverbSend); }
    src.start(t0, Math.random() * 1.5); src.stop(t0 + dur + 0.05);
  }

  function arp(freqs, step, o) {
    freqs.forEach(function (f, i) { note(Object.assign({}, o, { f: f, delay: (o.delay || 0) + i * step })); });
  }

  const sfx = {
    tap: function () { note({ f: 1250, f2: 900, dur: 0.06, vol: 0.09, type: 'triangle' }); note({ f: 2500, dur: 0.03, vol: 0.03, type: 'sine', delay: 0.01 }); },
    hover: function () { note({ f: 2100, dur: 0.035, vol: 0.025, type: 'sine' }); },
    click: function () { sfx.tap(); },
    blip: function () { note({ f: 1400 + Math.random() * 900, dur: 0.035, vol: 0.022, type: 'square', cut: 3000 }); },
    open: function () { note({ f: 420, f2: 980, dur: 0.18, vol: 0.09, type: 'sine', rev: 0.3 }); hiss({ dur: 0.18, vol: 0.04, f: 2500, f2: 6000, type: 'highpass' }); },
    close: function () { note({ f: 900, f2: 380, dur: 0.15, vol: 0.08, type: 'sine' }); },
    ping: function () { note({ f: 1046, dur: 0.6, vol: 0.18, a: 0.005, rev: 0.6 }); note({ f: 1568, dur: 0.5, vol: 0.07, delay: 0.06, rev: 0.6 }); },
    scan: function () {
      note({ f: 300, f2: 1600, dur: 1.2, vol: 0.09, type: 'sawtooth', cut: 2200, q: 6, rev: 0.4 });
      for (let i = 0; i < 6; i++) note({ f: 1800 + i * 120, dur: 0.05, vol: 0.05, type: 'square', cut: 4000, delay: 0.15 + i * 0.17 });
    },
    success: function () { arp([523.3, 659.3, 784, 1046.5], 0.085, { dur: 0.35, vol: 0.13, type: 'triangle', rev: 0.4 }); },
    discover: function () {
      arp([392, 523.3, 659.3, 784, 1046.5, 1318.5], 0.07, { dur: 0.5, vol: 0.1, type: 'triangle', rev: 0.6 });
      note({ f: 130.8, dur: 1.4, vol: 0.12, a: 0.05, type: 'sine', rev: 0.5 });
      hiss({ dur: 1.0, vol: 0.03, f: 6000, type: 'highpass', a: 0.2, rev: 0.6 });
    },
    error: function () { note({ f: 196, dur: 0.16, vol: 0.12, type: 'square', cut: 900 }); note({ f: 147, dur: 0.24, vol: 0.12, type: 'square', cut: 800, delay: 0.14 }); },
    alert: function () { note({ f: 880, dur: 0.12, vol: 0.1, type: 'square', cut: 2000 }); note({ f: 660, dur: 0.12, vol: 0.1, type: 'square', cut: 2000, delay: 0.16 }); },
    notify: function () { note({ f: 1318.5, dur: 0.18, vol: 0.07, rev: 0.4 }); note({ f: 1760, dur: 0.3, vol: 0.06, delay: 0.09, rev: 0.4 }); },
    thruster: function () { hiss({ dur: 0.35, vol: 0.08, f: 320, type: 'lowpass' }); },
    boost: function () { hiss({ dur: 0.9, vol: 0.18, f: 300, f2: 2400, type: 'bandpass', q: 1.2, a: 0.05 }); note({ f: 80, f2: 160, dur: 0.8, vol: 0.12, type: 'sawtooth', cut: 500 }); },
    dock: function () {
      note({ f: 110, dur: 0.35, vol: 0.2, type: 'sine', a: 0.003 }); hiss({ dur: 0.25, vol: 0.12, f: 900, type: 'bandpass', q: 3 });
      hiss({ dur: 0.7, vol: 0.06, f: 5000, f2: 1500, type: 'highpass', delay: 0.25 });
      arp([440, 554.4, 659.3], 0.1, { dur: 0.3, vol: 0.08, type: 'triangle', delay: 0.4, rev: 0.4 });
    },
    land: function () { hiss({ dur: 1.2, vol: 0.2, f: 1200, f2: 150, type: 'lowpass', a: 0.1 }); note({ f: 90, f2: 45, dur: 0.9, vol: 0.22, type: 'sine', delay: 0.6 }); },
    warp: function () {
      note({ f: 60, f2: 900, dur: 1.0, vol: 0.14, type: 'sawtooth', cut: 1800, q: 4, a: 0.3, rev: 0.5 });
      note({ f: 90, f2: 1300, dur: 1.0, vol: 0.08, type: 'sawtooth', detune: 12, cut: 2000, a: 0.3 });
      hiss({ dur: 1.4, vol: 0.2, f: 200, f2: 7000, type: 'bandpass', q: 1.5, a: 0.6, rev: 0.6 });
      note({ f: 40, dur: 1.2, vol: 0.25, type: 'sine', delay: 0.95, rev: 0.8 });
      hiss({ dur: 1.2, vol: 0.14, f: 3000, f2: 200, type: 'lowpass', delay: 0.95, rev: 0.8 });
    },
    radio: function () { hiss({ dur: 0.12, vol: 0.06, f: 2600, q: 2 }); note({ f: 1900, dur: 0.06, vol: 0.05, type: 'square', cut: 3000, delay: 0.12 }); note({ f: 2400, dur: 0.06, vol: 0.05, type: 'square', cut: 3000, delay: 0.19 }); },
    badge: function () {
      arp([784, 988, 1175, 1568], 0.09, { dur: 0.6, vol: 0.11, type: 'triangle', rev: 0.7 });
      arp([1568, 1976, 2349], 0.05, { dur: 0.3, vol: 0.04, type: 'sine', delay: 0.4, rev: 0.7 });
    }
  };

  function play(name) {
    if (!ensureCtx() || !sfx[name]) return;
    const now = performance.now();
    if (lastPlay[name] && now - lastPlay[name] < (name === 'blip' ? 30 : 60)) return;
    if ((name === 'click' || name === 'tap') && lastPlay.tap && now - lastPlay.tap < 90) return;
    lastPlay[name === 'click' ? 'tap' : name] = now;
    sfx[name]();
  }

  // ---------- continuous loops: ship engine, rover motor, cockpit ambience ----------
  function makeLoops() {
    const L = {};
    // ship engine: low saw drone + rumble noise
    L.engGain = ctx.createGain(); L.engGain.gain.value = 0; L.engGain.connect(ambGain);
    L.engF = ctx.createBiquadFilter(); L.engF.type = 'lowpass'; L.engF.frequency.value = 300; L.engF.Q.value = 2; L.engF.connect(L.engGain);
    L.eng1 = ctx.createOscillator(); L.eng1.type = 'sawtooth'; L.eng1.frequency.value = 48;
    L.eng2 = ctx.createOscillator(); L.eng2.type = 'sawtooth'; L.eng2.frequency.value = 48.7;
    L.eng1.connect(L.engF); L.eng2.connect(L.engF);
    L.rum = ctx.createBufferSource(); L.rum.buffer = noise(); L.rum.loop = true;
    L.rumF = ctx.createBiquadFilter(); L.rumF.type = 'lowpass'; L.rumF.frequency.value = 400;
    L.rumG = ctx.createGain(); L.rumG.gain.value = 0;
    L.rum.connect(L.rumF); L.rumF.connect(L.rumG); L.rumG.connect(ambGain);
    // rover motor: whine
    L.rovG = ctx.createGain(); L.rovG.gain.value = 0; L.rovG.connect(ambGain);
    L.rov = ctx.createOscillator(); L.rov.type = 'square'; L.rov.frequency.value = 90;
    L.rovF = ctx.createBiquadFilter(); L.rovF.type = 'bandpass'; L.rovF.frequency.value = 600; L.rovF.Q.value = 3;
    L.rov.connect(L.rovF); L.rovF.connect(L.rovG);
    // cockpit hum: soft 55 Hz + air hiss
    L.humG = ctx.createGain(); L.humG.gain.value = 0; L.humG.connect(ambGain);
    L.hum = ctx.createOscillator(); L.hum.type = 'sine'; L.hum.frequency.value = 55; L.hum.connect(L.humG);
    L.air = ctx.createBufferSource(); L.air.buffer = noise(); L.air.loop = true;
    L.airF = ctx.createBiquadFilter(); L.airF.type = 'bandpass'; L.airF.frequency.value = 1800; L.airF.Q.value = 0.5;
    L.airG = ctx.createGain(); L.airG.gain.value = 0;
    L.air.connect(L.airF); L.airF.connect(L.airG); L.airG.connect(ambGain);
    [L.eng1, L.eng2, L.rum, L.rov, L.hum, L.air].forEach(function (n) { n.start(); });
    L.chirpT = 3;
    return L;
  }

  // Called every frame by the game. kind: 'ship' | 'rover' | null (menu / paused)
  function engine(kind, level, boost, dt) {
    if (!ctx || ctx.state !== 'running') return;
    if (!loops) loops = makeLoops();
    const t = ctx.currentTime, L = loops, lv = Math.min(1, Math.abs(level || 0));
    const ship = kind === 'ship', rover = kind === 'rover';
    L.engGain.gain.setTargetAtTime(ship ? 0.05 + lv * (boost ? 0.28 : 0.16) : 0, t, 0.15);
    L.engF.frequency.setTargetAtTime(200 + lv * (boost ? 1400 : 700), t, 0.2);
    L.eng1.frequency.setTargetAtTime(42 + lv * (boost ? 40 : 24), t, 0.25);
    L.eng2.frequency.setTargetAtTime(42.6 + lv * (boost ? 41 : 24.5), t, 0.25);
    L.rumG.gain.setTargetAtTime(ship ? lv * (boost ? 0.32 : 0.14) : 0, t, 0.15);
    L.rumF.frequency.setTargetAtTime(250 + lv * (boost ? 1600 : 500), t, 0.2);
    L.rovG.gain.setTargetAtTime(rover ? 0.015 + lv * 0.07 : 0, t, 0.12);
    L.rov.frequency.setTargetAtTime(70 + lv * 160, t, 0.15);
    L.rovF.frequency.setTargetAtTime(400 + lv * 900, t, 0.15);
    L.humG.gain.setTargetAtTime(kind ? 0.05 : 0, t, 0.5);
    L.airG.gain.setTargetAtTime(kind ? 0.012 : 0, t, 0.5);
    if (boost && !L.wasBoost && ship) play('boost');
    L.wasBoost = boost && ship;
    if (kind && dt) {
      L.chirpT -= dt;
      if (L.chirpT <= 0) {
        L.chirpT = 5 + Math.random() * 9;
        const b = 1800 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) note({ f: b + (Math.random() - 0.5) * 900, dur: 0.05, vol: 0.012, type: 'sine', delay: i * 0.07, pan: Math.random() * 1.6 - 0.8, out: ambGain });
      }
    }
  }

  // ---------- generative ambient music ----------
  const MODES = {
    earth: { root: 261.63, chords: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], arp: 'triangle', bpm: 76 },
    deep: { root: 220, chords: [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]], arp: 'sine', bpm: 64 },
    discovery: { root: 293.66, chords: [[0, 4, 7, 14], [5, 9, 12, 16], [7, 11, 14, 19], [0, 4, 7, 12]], arp: 'triangle', bpm: 84 }
  };
  const semi = function (root, s) { return root * Math.pow(2, s / 12); };

  function pad(freqs, t0, dur) {
    freqs.forEach(function (f, i) {
      [-7, 7].forEach(function (det) {
        const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = f / 2; o.detune.value = det;
        fl.type = 'lowpass'; fl.frequency.setValueAtTime(500, t0); fl.frequency.linearRampToValueAtTime(1100, t0 + dur / 2); fl.frequency.linearRampToValueAtTime(500, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.045 / (1 + i * 0.3), t0 + dur * 0.35);
        g.gain.linearRampToValueAtTime(0.0001, t0 + dur + 0.6);
        o.connect(fl); fl.connect(g); g.connect(musicGain);
        o.start(t0); o.stop(t0 + dur + 0.7);
      });
    });
  }

  function scheduleMusic() {
    if (!ctx || ctx.state !== 'running' || !musicMode) return;
    const m = MODES[musicMode] || MODES.deep, spb = 60 / m.bpm;
    while (nextBeat < ctx.currentTime + 0.6) {
      const bar = Math.floor(beat / 8), chord = m.chords[bar % m.chords.length], b = beat % 8;
      const t0 = nextBeat;
      if (b === 0) {
        pad(chord.map(function (s) { return semi(m.root, s); }), t0, spb * 8);
        note({ f: semi(m.root, chord[0]) / 4, dur: spb * 7, vol: 0.12, a: 0.6, type: 'sine', delay: t0 - ctx.currentTime, out: musicGain });
      }
      const pattern = [0, 2, 1, 3, 2, 1, 3, 2];
      if (Math.random() < (b % 2 === 0 ? 0.85 : 0.45)) {
        const s = chord[pattern[b]] + (bar % 2 && b > 4 ? 12 : 0);
        note({ f: semi(m.root, s) * 2, dur: spb * 1.6, vol: 0.05, a: 0.01, type: m.arp, cut: 2600, delay: t0 - ctx.currentTime, pan: (b % 2 ? 0.4 : -0.4), out: musicGain });
      }
      if (b === 6 && Math.random() < 0.3) note({ f: semi(m.root, chord[3]) * 4, dur: spb * 3, vol: 0.02, a: 0.3, type: 'sine', delay: t0 - ctx.currentTime, out: musicGain });
      nextBeat += spb; beat++;
    }
  }

  function startMusic(mode) {
    if (!ensureCtx()) return;
    if (musicMode === mode && musicTimer) return;
    stopMusic();
    musicMode = mode;
    beat = 0;
    nextBeat = ctx.currentTime + 0.1;
    musicTimer = setInterval(scheduleMusic, 200);
    scheduleMusic();
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    musicMode = null;
  }

  function setVolumes(music, sfxV) {
    settings.music = music;
    settings.sfx = sfxV;
    applyVolumes();
  }

  function speak(text, rate, onend) {
    if (!window.speechSynthesis) { if (onend) onend(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate || 1;
    u.pitch = 1.05;
    u.volume = settings.sfx;
    const voices = window.speechSynthesis.getVoices();
    for (let i = 0; i < voices.length; i++) {
      if (voices[i].lang && voices[i].lang.indexOf('en') === 0) { u.voice = voices[i]; break; }
    }
    if (onend) u.onend = onend;
    window.speechSynthesis.speak(u);
  }

  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  // ---------- automatic UI sounds for every button ----------
  const BTN = 'button, .menu-btn, .term-btn, .chip, [data-sfx], .marker.tappable, .touch-btn';
  let hoverEl = null;
  document.addEventListener('pointerdown', function (e) {
    const b = e.target.closest && e.target.closest(BTN);
    if (!b || b.disabled) return;
    ensureCtx();
    play(/close|back/i.test(b.id + ' ' + b.className) ? 'close' : 'tap');
  }, true);
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse' || !ctx) return;
    const b = e.target.closest && e.target.closest(BTN);
    if (b === hoverEl) return;
    hoverEl = b;
    if (b && !b.disabled) play('hover');
  }, true);

  return {
    play: play,
    engine: engine,
    startMusic: startMusic,
    stopMusic: stopMusic,
    setVolumes: setVolumes,
    speak: speak,
    stopSpeak: stopSpeak,
    unlock: ensureCtx
  };
})();
