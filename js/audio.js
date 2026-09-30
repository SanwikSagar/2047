window.G = window.G || {};

G.Audio = (function () {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let musicNodes = [];
  let musicTimer = null;
  let started = false;
  let settings = { music: 0.5, sfx: 0.8 };

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.connect(masterGain);
      sfxGain = ctx.createGain();
      sfxGain.connect(masterGain);
      applyVolumes();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function applyVolumes() {
    if (!ctx) return;
    musicGain.gain.value = settings.music * 0.35;
    sfxGain.gain.value = settings.sfx;
  }

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ensureCtx()) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.3, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noiseBurst(dur, vol, freq) {
    if (!ensureCtx()) return;
    const t0 = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq || 800; f.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = vol || 0.2;
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start(t0);
  }

  const sfx = {
    click: function () { tone(660, 0.07, 'square', 0.12); },
    ping: function () { tone(880, 0.25, 'sine', 0.25); tone(1320, 0.3, 'sine', 0.12, null, 0.08); },
    scan: function () { tone(500, 0.5, 'sine', 0.2, 1400); },
    success: function () { tone(523, 0.15, 'triangle', 0.25); tone(659, 0.15, 'triangle', 0.25, null, 0.12); tone(784, 0.3, 'triangle', 0.25, null, 0.24); },
    discover: function () { tone(523, 0.2, 'sine', 0.22); tone(659, 0.2, 'sine', 0.22, null, 0.1); tone(784, 0.2, 'sine', 0.22, null, 0.2); tone(1047, 0.45, 'sine', 0.25, null, 0.3); },
    error: function () { tone(220, 0.25, 'sawtooth', 0.15, 160); },
    thruster: function () { noiseBurst(0.3, 0.12, 300); },
    dock: function () { tone(330, 0.12, 'triangle', 0.2); tone(440, 0.12, 'triangle', 0.2, null, 0.1); tone(550, 0.25, 'triangle', 0.2, null, 0.2); },
    land: function () { noiseBurst(0.5, 0.2, 200); tone(140, 0.4, 'sine', 0.2, 70); },
    radio: function () { noiseBurst(0.15, 0.08, 2000); },
    badge: function () { tone(784, 0.15, 'triangle', 0.22); tone(988, 0.15, 'triangle', 0.22, null, 0.1); tone(1175, 0.35, 'triangle', 0.22, null, 0.2); }
  };

  function play(name) {
    if (!ensureCtx()) return;
    if (sfx[name]) sfx[name]();
  }

  const SCALES = {
    earth: [261.6, 293.7, 329.6, 392.0, 440.0, 523.3],
    deep: [130.8, 146.8, 164.8, 196.0, 220.0, 261.6],
    discovery: [523.3, 659.3, 784.0, 1046.5]
  };

  function startMusic(mode) {
    if (!ensureCtx()) return;
    stopMusic();
    started = true;
    const scale = SCALES[mode] || SCALES.deep;
    let step = 0;
    musicTimer = setInterval(function () {
      if (!ctx || ctx.state !== 'running') return;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = mode === 'earth' ? 'triangle' : 'sine';
      const note = scale[step % scale.length] * (step % 12 >= 6 ? 0.5 : 1);
      osc.frequency.value = note;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.5, t0 + 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 2.8);
      osc.connect(g); g.connect(musicGain);
      osc.start(t0); osc.stop(t0 + 3);
      if (step % 4 === 0) {
        const bass = ctx.createOscillator();
        const bg = ctx.createGain();
        bass.type = 'sine';
        bass.frequency.value = note / 4;
        bg.gain.setValueAtTime(0, t0);
        bg.gain.linearRampToValueAtTime(0.35, t0 + 0.5);
        bg.gain.exponentialRampToValueAtTime(0.001, t0 + 3.5);
        bass.connect(bg); bg.connect(musicGain);
        bass.start(t0); bass.stop(t0 + 3.6);
      }
      step++;
    }, 1400);
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
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

  return {
    play: play,
    startMusic: startMusic,
    stopMusic: stopMusic,
    setVolumes: setVolumes,
    speak: speak,
    stopSpeak: stopSpeak,
    unlock: ensureCtx
  };
})();
