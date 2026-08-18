/*
  KhurshedTech Ambient Audio System (site-wide)
  ----------------------------------------------
  Self-injecting widget: include this one script tag near the end of <body> on
  any page and it builds its own markup + styles + generative soundtrack.
  No external audio files — the "music" is synthesized live via the Web Audio
  API (layered detuned oscillators + a slow-modulated lowpass filter + a
  filtered-noise texture layer), so there is nothing to download and zero
  impact on page weight or load time.

  Autoplay-policy safe: the AudioContext is only created/resumed inside a
  real user gesture, and the UI only reports "playing" once the browser has
  actually confirmed the context is running (some gestures, like a page
  scroll, are not treated as a qualifying "activation" gesture by Chrome's
  autoplay policy — this file accounts for that instead of assuming success).
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
    @media (prefers-reduced-motion:reduce){.kt-audio-widget[data-playing=\"true\"] .kt-audio-glow,.kt-audio-widget[data-playing=\"true\"] .kt-audio-eq span{animation:none;}}\
  ";

  var HTML = '\
    <div class="kt-audio-glow"></div>\
    <button id="kt-audio-toggle" class="kt-audio-toggle" aria-label="Play ambient soundtrack" aria-pressed="false" title="Ambient soundtrack">\
      <span class="kt-audio-icon kt-icon-play">▶</span>\
      <span class="kt-audio-icon kt-icon-pause" hidden>❚❚</span>\
    </button>\
    <div class="kt-audio-eq" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>\
    <button id="kt-audio-expand" class="kt-audio-expand" aria-label="Volume settings" aria-expanded="false">⋯</button>\
    <div class="kt-audio-panel">\
      <label for="kt-audio-volume" class="kt-audio-label">Ambient Soundtrack</label>\
      <input type="range" id="kt-audio-volume" class="kt-audio-slider" min="0" max="100" value="35" aria-label="Volume">\
      <span class="kt-audio-hint">Cinematic AI &amp; cybersecurity atmosphere</span>\
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

  var ctx, master, filter, filterLFO, filterLFOGain, analyser, noiseSrc, noiseGain, noiseFilter;
  var voices = [];
  var built = false, playing = false, rafId = null;

  // Section moods: Hero / About / Services("Skills") / Portfolio("Projects") / Contact.
  // Pages that don't have a given id simply won't switch into that mood — harmless.
  var PRESETS = {
    home:     { freqs:[55, 82.5, 110],     cutoff:600,  lfoRate:0.05, lfoDepth:220, noise:0.0 },
    about:    { freqs:[65.4, 98, 130.8],   cutoff:850,  lfoRate:0.06, lfoDepth:200, noise:0.0 },
    services: { freqs:[73.4, 110, 146.8],  cutoff:1400, lfoRate:0.12, lfoDepth:420, noise:0.05 },
    portfolio:{ freqs:[61.7, 92.5, 123.4], cutoff:1800, lfoRate:0.09, lfoDepth:520, noise:0.08 },
    contact:  { freqs:[87.3, 110, 130.8],  cutoff:1200, lfoRate:0.04, lfoDepth:180, noise:0.02 }
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
    filter.Q.value = 0.7;

    filterLFO = ctx.createOscillator();
    filterLFO.frequency.value = PRESETS[currentPreset].lfoRate;
    filterLFOGain = ctx.createGain();
    filterLFOGain.gain.value = PRESETS[currentPreset].lfoDepth;
    filterLFO.connect(filterLFOGain).connect(filter.frequency);
    filterLFO.start();

    PRESETS[currentPreset].freqs.forEach(function(f, i){
      var osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 6;
      var g = ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.28;
      osc.connect(g).connect(filter);
      osc.start();
      voices.push({ osc: osc, gain: g });
    });

    var shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 1760;
    var shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.015;
    var shimmerLFO = ctx.createOscillator();
    shimmerLFO.frequency.value = 0.07;
    var shimmerLFOGain = ctx.createGain();
    shimmerLFOGain.gain.value = 0.012;
    shimmerLFO.connect(shimmerLFOGain).connect(shimmerGain.gain);
    shimmer.connect(shimmerGain).connect(filter);
    shimmer.start(); shimmerLFO.start();
    voices.push({ osc: shimmer, gain: shimmerGain, isShimmer:true });

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
    master.connect(analyser);
    analyser.connect(ctx.destination);
    built = true;
  }

  function applyPreset(key, smooth){
    var p = PRESETS[key];
    if (!p || !ctx) return;
    currentPreset = key;
    var t = ctx.currentTime;
    var ramp = smooth ? 2.2 : 0;
    filter.frequency.cancelScheduledValues(t);
    filter.frequency.setTargetAtTime(p.cutoff, t, ramp / 3 || 0.01);
    filterLFO.frequency.setTargetAtTime(p.lfoRate, t, ramp / 3 || 0.01);
    filterLFOGain.gain.setTargetAtTime(p.lfoDepth, t, ramp / 3 || 0.01);
    noiseGain.gain.setTargetAtTime(p.noise * (volumeInput.value / 100), t, ramp / 2 || 0.01);
    voices.forEach(function(v, i){
      if (v.isShimmer) return;
      var f = p.freqs[i];
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
    master.gain.linearRampToValueAtTime(targetVolume(), t + 2.5);
  }
  function fadeOut(cb){
    if (!ctx) { if (cb) cb(); return; }
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 1.5);
    setTimeout(function(){ if (cb) cb(); }, 1550);
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

  // The core fix: only report "playing" once the AudioContext has actually
  // resumed. A scroll gesture may not satisfy the browser's autoplay policy —
  // in that case we stay armed for the next click/keydown/touch instead of
  // silently pretending playback started.
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
