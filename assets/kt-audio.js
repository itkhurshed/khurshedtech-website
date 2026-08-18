/*
  KhurshedTech Ambient Audio System (site-wide)
  ----------------------------------------------
  Self-injecting widget: include this one script tag near the end of <body> on
  any page and it builds its own markup + styles + generative soundtrack.
  No external audio files — the "music" is synthesized live via the Web Audio
  API. Sound design: "Classical Relaxing Piano + Soft Violin & Cello +
  Calm Cinematic Orchestra" — a peaceful, luxury-corporate presentation
  atmosphere. No vocals, no beats, nothing aggressive.
    - Strings (violin & cello): four sustained, gently vibrato'd voices —
      warm low triangle tones standing in for cello/viola, filtered
      sawtooth voices on top standing in for violin — with a slow shared
      "swell" so the section breathes like a bowed string ensemble.
    - Soft Piano: a generative note scheduler plucks soft, piano-like notes
      from a per-section major/minor-pentatonic scale through a short
      delay/echo tail, at an unhurried, non-looping pace.
    - A touch of ambient shimmer is reserved only for the Skills section
      ("slightly more futuristic ambient layer" — per spec); every other
      section stays clean, warm, and calm.
  Nothing to download, zero impact on page weight or load time.

  Autoplay-policy safe: the AudioContext is only created/resumed inside a
  real user gesture (first click, keypress, touch, or scroll), and the UI
  only reports "playing" once the browser has actually confirmed the
  context is running — a scroll gesture isn't always treated as a
  qualifying "activation" by the browser's autoplay policy, so this file
  verifies real state instead of assuming success.
*/
(function(){
  if (window.__ktAudioInit) return; // avoid double-init if the script is ever included twice
  window.__ktAudioInit = true;

  var LS_ENABLED = 'kt-audio-enabled';
  var LS_VOLUME  = 'kt-audio-volume';

  var CSS = "\
    .kt-audio-widget{position:fixed;right:24px;bottom:242px;z-index:1000;display:flex;align-items:center;gap:10px;background:rgba(10,20,36,0.55);backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);border:1px solid rgba(124,155,255,0.35);border-radius:999px;padding:9px 12px;box-shadow:0 8px 28px rgba(0,0,0,0.35),0 0 0 1px rgba(124,58,237,0.08);transition:box-shadow .3s ease,transform .2s ease;font-family:'Poppins','Inter',Arial,sans-serif;}\
    .kt-audio-widget:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(0,0,0,0.4),0 0 22px rgba(0,194,255,0.25);}\
    .kt-audio-widget[data-playing=\"true\"]{box-shadow:0 8px 28px rgba(0,0,0,0.35),0 0 26px rgba(0,194,255,0.35),0 0 46px rgba(124,58,237,0.18);}\
    .kt-audio-glow{position:absolute;inset:-1px;border-radius:999px;pointer-events:none;opacity:0;background:linear-gradient(120deg,rgba(0,194,255,0.5),rgba(124,58,237,0.5));filter:blur(10px);z-index:-1;transition:opacity .6s ease;}\
    .kt-audio-widget[data-playing=\"true\"] .kt-audio-glow{opacity:.55;animation:kt-glow-pulse 3.2s ease-in-out infinite;}\
    @keyframes kt-glow-pulse{0%,100%{opacity:.35;}50%{opacity:.65;}}\
    .kt-audio-toggle{width:38px;height:38px;border-radius:50%;border:1px solid rgba(0,194,255,0.5);background:radial-gradient(circle at 35% 30%,rgba(0,194,255,0.35),rgba(10,20,36,0.9));color:#fff;font-size:.8rem;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto;transition:transform .2s ease,box-shadow .2s ease;padding:0;}\
    .kt-audio-toggle:hover{transform:scale(1.08);box-shadow:0 0 16px rgba(0,194,255,0.5);}\
    .kt-audio-toggle .kt-icon-play{margin-left:2px;}\
    .kt-audio-note{position:absolute;top:-6px;right:-4px;font-size:.65rem;opacity:0;transform:translateY(0) scale(.8);pointer-events:none;}\
    .kt-audio-widget[data-playing=\"true\"] .kt-audio-note{animation:kt-note-float 2.6s ease-in infinite;}\
    @keyframes kt-note-float{0%{opacity:0;transform:translateY(0) scale(.7) rotate(-6deg);}15%{opacity:.9;}70%{opacity:.7;}100%{opacity:0;transform:translateY(-22px) scale(1.05) rotate(8deg);}}\
    .kt-audio-eq{display:flex;align-items:flex-end;gap:3px;height:20px;}\
    .kt-audio-eq span{width:3px;height:6px;border-radius:2px;background:linear-gradient(180deg,#00E5FF,#7C3AED);transform-origin:bottom;transition:height .12s ease;opacity:.55;display:block;}\
    .kt-audio-widget[data-playing=\"true\"] .kt-audio-eq span{opacity:1;animation:kt-eq-bounce 1.1s ease-in-out infinite;}\
    .kt-audio-eq span:nth-child(1){animation-delay:0s;}.kt-audio-eq span:nth-child(2){animation-delay:.12s;}.kt-audio-eq span:nth-child(3){animation-delay:.24s;}.kt-audio-eq span:nth-child(4){animation-delay:.08s;}.kt-audio-eq span:nth-child(5){animation-delay:.2s;}\
    @keyframes kt-eq-bounce{0%,100%{height:5px;}50%{height:18px;}}\
    .kt-audio-expand{width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#C9D1D9;font-size:.75rem;cursor:pointer;flex:0 0 auto;line-height:1;padding:0;}\
    .kt-audio-expand:hover{border-color:rgba(0,194,255,0.6);color:#fff;}\
    .kt-audio-panel{position:absolute;right:0;bottom:calc(100% + 12px);width:220px;background:rgba(8,16,30,0.92);backdrop-filter:blur(14px);border:1px solid rgba(124,155,255,0.3);border-radius:14px;padding:14px 16px;box-shadow:0 12px 30px rgba(0,0,0,0.45);opacity:0;transform:translateY(8px) scale(.96);pointer-events:none;transition:opacity .25s ease,transform .25s ease;}\
    .kt-audio-widget[data-expanded=\"true\"] .kt-audio-panel{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}\
    .kt-audio-label{display:block;color:#fff;font-size:.78rem;font-weight:700;margin-bottom:8px;}\
    .kt-audio-slider{width:100%;accent-color:#00C2FF;}\
    .kt-audio-hint{display:block;margin-top:8px;color:#8FA0BC;font-size:.7rem;line-height:1.4;}\
    .kt-audio-status{display:block;margin-top:6px;color:#00C2FF;font-size:.68rem;font-weight:600;min-height:1em;}\
    @media (max-width:640px){.kt-audio-widget{bottom:196px;right:16px;padding:7px 10px;}.kt-audio-toggle{width:34px;height:34px;}}\
    @media (prefers-reduced-motion:reduce){.kt-audio-widget[data-playing=\"true\"] .kt-audio-glow,.kt-audio-widget[data-playing=\"true\"] .kt-audio-eq span,.kt-audio-widget[data-playing=\"true\"] .kt-audio-note{animation:none;}}\
  ";

  var HTML = '\
    <div class="kt-audio-glow"></div>\
    <button id="kt-audio-toggle" class="kt-audio-toggle" aria-label="Play ambient soundtrack" aria-pressed="false" title="Ambient soundtrack">\
      <span class="kt-audio-icon kt-icon-play">▶</span>\
      <span class="kt-audio-icon kt-icon-pause" hidden>❚❚</span>\
      <span class="kt-audio-note" aria-hidden="true">♪</span>\
    </button>\
    <div class="kt-audio-eq" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>\
    <button id="kt-audio-expand" class="kt-audio-expand" aria-label="Volume settings" aria-expanded="false">⋯</button>\
    <div class="kt-audio-panel">\
      <label for="kt-audio-volume" class="kt-audio-label">Ambient Soundtrack</label>\
      <input type="range" id="kt-audio-volume" class="kt-audio-slider" min="0" max="100" value="35" aria-label="Volume">\
      <span class="kt-audio-hint">Classical piano, soft strings &amp; cinematic orchestra</span>\
      <span class="kt-audio-status" id="kt-audio-status"></span>\
    </div>\
  ';

  function inject(){
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var widget = document.createElement('div');
    widget.id = 'kt-audio-widget';
    widget.className = 'kt-audio-widget';
    widget.setAttribute('data-expanded', 'false');
    widget.innerHTML = HTML;
    document.body.appendChild(widget);
    return widget;
  }

  var widget = inject();
  var toggleBtn = document.getElementById('kt-audio-toggle');
  var expandBtn = document.getElementById('kt-audio-expand');
  var volumeInput = document.getElementById('kt-audio-volume');
  var statusEl = document.getElementById('kt-audio-status');
  var iconPlay = widget.querySelector('.kt-icon-play');
  var iconPause = widget.querySelector('.kt-icon-pause');
  var eqBars = widget.querySelectorAll('.kt-audio-eq span');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var savedVolume = parseInt(localStorage.getItem(LS_VOLUME), 10);
  if (isNaN(savedVolume)) savedVolume = 35;
  volumeInput.value = savedVolume;
  var userDisabled = localStorage.getItem(LS_ENABLED) === 'false';

  var ctx, master, filter, filterLFO, filterLFOGain, analyser;
  var noiseSrc, noiseGain, noiseFilter;
  var shimmerGain, shimmerLFOGain;
  var stringsBus, vibratoLFO, vibratoDepth, swellLFO, swellGain;
  var pianoBus, pianoDelay, pianoDelayFilter, pianoFeedback, pianoWet;
  var padVoices = [];
  var built = false, playing = false, rafId = null, noteTimer = null;

  // Section moods: Hero / About / Services("Skills") / Portfolio("Projects") / Contact.
  // Calm classical palette throughout — only Skills gets a light "futuristic
  // ambient" touch (a hint of shimmer + slightly more filter movement), per
  // spec. Everywhere else stays warm, peaceful, and still.
  // Pages that don't have a given id simply won't switch into that mood — harmless.
  var PRESETS = {
    home: {
      pad: [73.42, 110.00, 146.83, 185.00],                         // D2 A2 D3 F#3 — gentle cinematic piano bed
      cutoff: 900, lfoRate: 0.03, lfoDepth: 90,
      noise: 0.0, shimmer: 0.0,
      scale: [293.66, 329.63, 369.99, 440.00, 493.88, 587.33],       // D major pentatonic
      noteMin: 3.0, noteMax: 6.0, density: 0.6
    },
    about: {
      pad: [65.41, 98.00, 130.81, 164.81],                          // C2 G2 C3 E3 — calm, inspirational
      cutoff: 1000, lfoRate: 0.025, lfoDepth: 70,
      noise: 0.0, shimmer: 0.0,
      scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],       // C major pentatonic
      noteMin: 2.6, noteMax: 5.0, density: 0.75
    },
    services: {
      pad: [82.41, 123.47, 164.81, 207.65],                         // E2 B2 E3 G#3 — a touch brighter/futuristic
      cutoff: 1300, lfoRate: 0.08, lfoDepth: 260,
      noise: 0.02, shimmer: 0.014,
      scale: [329.63, 369.99, 415.30, 493.88, 554.37, 659.25],       // slightly more ambient movement
      noteMin: 2.2, noteMax: 4.4, density: 0.65
    },
    portfolio: {
      pad: [110.00, 164.81, 220.00, 277.18],                        // A2 E3 A3 C#4 — steady, professional
      cutoff: 1000, lfoRate: 0.02, lfoDepth: 60,
      noise: 0.0, shimmer: 0.0,
      scale: [220.00, 246.94, 277.18, 329.63, 369.99, 440.00],       // A major pentatonic
      noteMin: 2.8, noteMax: 5.2, density: 0.55
    },
    contact: {
      pad: [87.31, 130.81, 174.61, 220.00],                         // F2 C3 F3 A3 — warm, peaceful ending
      cutoff: 1100, lfoRate: 0.02, lfoDepth: 60,
      noise: 0.0, shimmer: 0.0,
      scale: [349.23, 392.00, 440.00, 523.25, 587.33, 698.46],       // F major pentatonic
      noteMin: 2.4, noteMax: 4.6, density: 0.78
    }
  };
  var DEFAULT_PRESET = 'home';
  var currentPreset = DEFAULT_PRESET;

  function makeNoiseBuffer(ac){
    var len = ac.sampleRate * 2;
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function buildGraph(){
    if (built) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    master = ctx.createGain();
    master.gain.value = 0;

    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = PRESETS[currentPreset].cutoff;
    filter.Q.value = 0.6;

    filterLFO = ctx.createOscillator();
    filterLFO.frequency.value = PRESETS[currentPreset].lfoRate;
    filterLFOGain = ctx.createGain();
    filterLFOGain.gain.value = PRESETS[currentPreset].lfoDepth;
    filterLFO.connect(filterLFOGain).connect(filter.frequency);
    filterLFO.start();

    // --- Strings bus: warm cello/viola voices (triangle) + filtered violin
    // voices (sawtooth, tamed by the shared lowpass filter), all lightly
    // vibrato'd and breathing together via a slow shared "swell". ---
    stringsBus = ctx.createGain();
    stringsBus.gain.value = 1;

    vibratoLFO = ctx.createOscillator();
    vibratoLFO.type = 'sine';
    vibratoLFO.frequency.value = 4.8; // gentle bowed-string vibrato rate
    vibratoDepth = ctx.createGain();
    vibratoDepth.gain.value = 3.5;    // +/- ~3.5 cents, subtle not wobbly
    vibratoLFO.connect(vibratoDepth);
    vibratoLFO.start();

    swellLFO = ctx.createOscillator();
    swellLFO.type = 'sine';
    swellLFO.frequency.value = 0.045; // one slow breath roughly every 22s
    swellGain = ctx.createGain();
    swellGain.gain.value = 0.12;
    swellLFO.connect(swellGain).connect(stringsBus.gain);
    swellLFO.start();

    var padTypes = ['triangle', 'triangle', 'sawtooth', 'sawtooth']; // cello, cello/viola, violin, violin
    var padLevels = [0.5, 0.32, 0.22, 0.16];
    PRESETS[currentPreset].pad.forEach(function(f, i){
      var osc = ctx.createOscillator();
      osc.type = padTypes[i] || 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (i - 1.5) * 4;
      vibratoDepth.connect(osc.detune); // shared gentle vibrato
      var g = ctx.createGain();
      g.gain.value = padLevels[i] || 0.2;
      osc.connect(g).connect(stringsBus);
      osc.start();
      padVoices.push({ osc: osc, gain: g });
    });
    stringsBus.connect(filter);

    // --- Faint ambient shimmer — reserved almost entirely for the Skills
    // section's "slightly more futuristic ambient layer" ---
    var shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 1760;
    shimmerGain = ctx.createGain();
    shimmerGain.gain.value = PRESETS[currentPreset].shimmer;
    var shimmerLFO = ctx.createOscillator();
    shimmerLFO.frequency.value = 0.07;
    shimmerLFOGain = ctx.createGain();
    shimmerLFOGain.gain.value = PRESETS[currentPreset].shimmer * 0.8;
    shimmerLFO.connect(shimmerLFOGain).connect(shimmerGain.gain);
    shimmer.connect(shimmerGain).connect(filter);
    shimmer.start(); shimmerLFO.start();

    // --- Very light texture bed (silent unless a preset calls for it) ---
    noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = makeNoiseBuffer(ctx);
    noiseSrc.loop = true;
    noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2200;
    noiseFilter.Q.value = 1.2;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseSrc.connect(noiseFilter).connect(noiseGain).connect(filter);
    noiseSrc.start();

    filter.connect(master);

    // --- Soft Piano: relaxed, generative notes through a short echo/delay tail ---
    pianoBus = ctx.createGain();
    pianoBus.gain.value = 1;
    pianoDelay = ctx.createDelay(2.0);
    pianoDelay.delayTime.value = 0.36;
    pianoDelayFilter = ctx.createBiquadFilter();
    pianoDelayFilter.type = 'lowpass';
    pianoDelayFilter.frequency.value = 2200;
    pianoFeedback = ctx.createGain();
    pianoFeedback.gain.value = 0.28;
    pianoWet = ctx.createGain();
    pianoWet.gain.value = 0.5;

    pianoBus.connect(master); // dry piano signal
    pianoBus.connect(pianoDelay);
    pianoDelay.connect(pianoDelayFilter);
    pianoDelayFilter.connect(pianoFeedback).connect(pianoDelay); // feedback loop = echo tail
    pianoDelayFilter.connect(pianoWet).connect(master);          // wet (echoed) signal to output

    master.connect(analyser);
    analyser.connect(ctx.destination);
    built = true;
  }

  // A single soft, piano-like note: gentle hammer-strike attack, long
  // natural decay, a quiet octave overtone for warmth, and soft stereo
  // placement — a relaxed classical touch, never a rhythmic loop.
  function playPianoNote(freq, velocity){
    if (!ctx || !pianoBus) return;
    var t = ctx.currentTime;
    var fundamental = ctx.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.value = freq;
    var overtone = ctx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.value = freq * 2;

    var voiceGain = ctx.createGain();
    voiceGain.gain.value = 0;
    var overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.14;

    fundamental.connect(voiceGain);
    overtone.connect(overtoneGain).connect(voiceGain);

    var outNode = voiceGain;
    if (ctx.createStereoPanner){
      var panner = ctx.createStereoPanner();
      panner.pan.value = (Math.random() * 1.0) - 0.5;
      voiceGain.connect(panner);
      outNode = panner;
    }
    outNode.connect(pianoBus);

    var peak = 0.4 * (velocity || 0.8);
    voiceGain.gain.setValueAtTime(0, t);
    voiceGain.gain.linearRampToValueAtTime(peak, t + 0.02);
    voiceGain.gain.exponentialRampToValueAtTime(0.0008, t + 3.8);

    fundamental.start(t);
    overtone.start(t);
    fundamental.stop(t + 4.0);
    overtone.stop(t + 4.0);
  }

  function scheduleNextNote(){
    if (!playing){ noteTimer = null; return; }
    var p = PRESETS[currentPreset];
    var delay = (p.noteMin + Math.random() * (p.noteMax - p.noteMin)) * 1000;
    noteTimer = setTimeout(function(){
      if (playing){
        var p2 = PRESETS[currentPreset];
        if (Math.random() < p2.density){
          var scale = p2.scale;
          var freq = scale[Math.floor(Math.random() * scale.length)];
          playPianoNote(freq, 0.5 + Math.random() * 0.35);
        }
      }
      scheduleNextNote();
    }, delay);
  }

  function applyPreset(key, smooth){
    var p = PRESETS[key];
    if (!p || !ctx) return;
    currentPreset = key;
    var t = ctx.currentTime;
    var ramp = smooth ? 2.4 : 0;
    filter.frequency.cancelScheduledValues(t);
    filter.frequency.setTargetAtTime(p.cutoff, t, ramp / 3 || 0.01);
    filterLFO.frequency.setTargetAtTime(p.lfoRate, t, ramp / 3 || 0.01);
    filterLFOGain.gain.setTargetAtTime(p.lfoDepth, t, ramp / 3 || 0.01);
    noiseGain.gain.setTargetAtTime(p.noise * (volumeInput.value / 100), t, ramp / 2 || 0.01);
    if (shimmerGain) shimmerGain.gain.setTargetAtTime(p.shimmer, t, ramp / 2 || 0.01);
    if (shimmerLFOGain) shimmerLFOGain.gain.setTargetAtTime(p.shimmer * 0.8, t, ramp / 2 || 0.01);
    padVoices.forEach(function(v, i){
      var f = p.pad[i];
      if (f) v.osc.frequency.setTargetAtTime(f, t, ramp / 2 || 0.01);
    });
  }

  function targetVolume(){
    return Math.max(0, Math.min(1, volumeInput.value / 100)) * 0.5;
  }

  function fadeIn(){
    if (!ctx) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(targetVolume(), t + 2.8);
  }
  function fadeOut(cb){
    if (!ctx) { if (cb) cb(); return; }
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 1.6);
    setTimeout(function(){ if (cb) cb(); }, 1650);
  }

  function setPlayingUI(isPlaying){
    playing = isPlaying;
    widget.setAttribute('data-playing', isPlaying ? 'true' : 'false');
    toggleBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    iconPlay.hidden = isPlaying;
    iconPause.hidden = !isPlaying;
  }

  function showStatus(msg, ms){
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    if (msg && ms) setTimeout(function(){ if (statusEl.textContent === msg) statusEl.textContent = ''; }, ms);
  }

  // The core fix (kept from the previous release): only report "playing"
  // once the AudioContext has actually resumed. A scroll gesture may not
  // satisfy the browser's autoplay policy — in that case we stay armed for
  // the next click/keydown/touch instead of silently pretending playback
  // started.
  function start(){
    buildGraph();
    applyPreset(currentPreset, false);
    var p = ctx.resume ? ctx.resume() : Promise.resolve();
    p.then(function(){
      if (ctx.state === 'running'){
        fadeIn();
        setPlayingUI(true);
        localStorage.setItem(LS_ENABLED, 'true');
        runVisualizer();
        if (!noteTimer) scheduleNextNote();
        detachArmedListeners();
      } else {
        showStatus('Tap again to enable sound', 2500);
      }
    }).catch(function(){
      showStatus('Tap again to enable sound', 2500);
    });
  }

  function stop(){
    fadeOut(function(){
      if (ctx && ctx.state === 'running') ctx.suspend();
    });
    setPlayingUI(false);
    localStorage.setItem(LS_ENABLED, 'false');
    if (rafId) cancelAnimationFrame(rafId);
    if (noteTimer) { clearTimeout(noteTimer); noteTimer = null; }
  }

  function runVisualizer(){
    if (reduceMotion || !analyser) return;
    var data = new Uint8Array(analyser.frequencyBinCount);
    var binMap = [0, 1, 2, 4, 7];
    function loop(){
      if (!playing) return;
      analyser.getByteFrequencyData(data);
      for (var i = 0; i < eqBars.length; i++){
        var v = data[binMap[i]] || 0;
        eqBars[i].style.height = Math.max(5, (v / 255) * 20) + 'px';
      }
      rafId = requestAnimationFrame(loop);
    }
    loop();
  }

  toggleBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if (playing) stop(); else start();
  });

  expandBtn.addEventListener('click', function(e){
    e.stopPropagation();
    var open = widget.getAttribute('data-expanded') === 'true';
    widget.setAttribute('data-expanded', open ? 'false' : 'true');
    expandBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
  });
  document.addEventListener('click', function(e){
    if (!widget.contains(e.target)) widget.setAttribute('data-expanded', 'false');
  });

  volumeInput.addEventListener('input', function(){
    localStorage.setItem(LS_VOLUME, volumeInput.value);
    if (ctx && playing){
      var t = ctx.currentTime;
      master.gain.setTargetAtTime(targetVolume(), t, 0.15);
      noiseGain.gain.setTargetAtTime(PRESETS[currentPreset].noise * (volumeInput.value / 100), t, 0.15);
    }
  });

  // First-interaction auto-start. Click/keydown/touchstart are reliable
  // "user activation" gestures for the autoplay policy; scroll is not
  // guaranteed to be, so it's included (per spec) but start() itself
  // verifies the real resulting AudioContext state before updating the UI,
  // and the click/keydown/touch listeners stay armed until playback is
  // actually confirmed running.
  function firstInteraction(){
    if (userDisabled || playing) return;
    start();
  }
  function detachArmedListeners(){
    window.removeEventListener('click', firstInteraction);
    window.removeEventListener('keydown', firstInteraction);
    window.removeEventListener('touchstart', firstInteraction);
  }
  window.addEventListener('click', firstInteraction, { passive:true });
  window.addEventListener('keydown', firstInteraction, { passive:true });
  window.addEventListener('touchstart', firstInteraction, { passive:true });
  window.addEventListener('scroll', firstInteraction, { passive:true, once:true });

  // Scroll-based atmosphere per section (only observes sections that exist on this page)
  var sectionIds = Object.keys(PRESETS);
  var sections = sectionIds.map(function(id){ return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting && entry.intersectionRatio > 0.4){
          var id = entry.target.id;
          if (PRESETS[id] && id !== currentPreset && built){
            applyPreset(id, true);
          }
        }
      });
    }, { threshold:[0.4] });
    sections.forEach(function(s){ io.observe(s); });
  }

  document.addEventListener('visibilitychange', function(){
    if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!document.hidden && playing) { runVisualizer(); }
  });
})();
