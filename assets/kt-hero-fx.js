/*
  KhurshedTech Immersive Hero + Motion System
  --------------------------------------------
  Self-injecting, dependency-free (no Three.js/GSAP/Lottie — pure Canvas 2D +
  CSS3, matching the zero-dependency pattern used everywhere else on this
  site). Adds:
    - An animated hero background: slow gradient light waves, a drifting
      "neural network" particle field, and soft rotating light-ray glows —
      all mouse-parallaxed.
    - A rotating identity ticker: Cybersecurity Engineer / System
      Administrator / AI Technology Specialist, each with its own icon and
      accent color, cross-fading on a timer (pauses on hover/focus).
    - An animated gradient headline treatment.
    - 3D hover-tilt on service and portfolio cards.
    - A CSS-only "3D rotating technology orbit" ambient accent near Services.
    - A hologram ring around the About-section profile photo.
    - Gentle floating motion on credential/trust badges.
    - A small pulsing location-pin accent near the Contact map.
  Everything respects prefers-reduced-motion (animations are skipped, static
  content still renders), pauses when off-screen or the tab is hidden, and
  is capped for performance (devicePixelRatio clamp, single rAF loop, no
  external assets, nothing that blocks first paint).
*/
(function(){
  if (window.__ktHeroFxInit) return;
  window.__ktHeroFxInit = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------- CSS */
  var css = "\
    .kt-hero-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;}\
    .kt-role-ticker{display:inline-flex;align-items:center;gap:9px;background:rgba(124,58,237,0.14);border:1px solid rgba(124,58,237,0.4);color:#fff;padding:7px 16px 7px 12px;border-radius:999px;font-size:0.82rem;font-weight:700;letter-spacing:0.02em;margin-bottom:14px;position:relative;overflow:hidden;}\
    .kt-role-ticker .kt-role-icon{font-size:1rem;line-height:1;filter:drop-shadow(0 0 6px currentColor);}\
    .kt-role-ticker .kt-role-text{transition:opacity .45s ease,transform .45s ease;display:inline-block;}\
    .kt-role-ticker[data-fading=\"true\"] .kt-role-text{opacity:0;transform:translateY(-6px);}\
    .kt-role-dots{display:inline-flex;gap:5px;margin-left:6px;}\
    .kt-role-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.3);transition:background .3s ease,transform .3s ease;cursor:pointer;border:none;padding:0;}\
    .kt-role-dot.is-active{background:#fff;transform:scale(1.3);}\
    .kt-gradient-text{background:linear-gradient(92deg,#00C2FF 0%,#7C3AED 35%,#0A66FF 65%,#00C2FF 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:kt-gradient-move 9s ease-in-out infinite;}\
    @keyframes kt-gradient-move{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}\
    .kt-tilt-active{transition:transform .12s ease-out,box-shadow .25s ease,border-color .25s ease;will-change:transform;}\
    .service-card:hover{box-shadow:0 14px 34px rgba(0,194,255,0.22),var(--shadow-lg);}\
    .portfolio-card:hover{box-shadow:0 14px 34px rgba(10,102,255,0.18),var(--shadow-lg);border-color:rgba(0,194,255,0.5);}\
    .kt-holo-wrap{position:relative;border-radius:var(--radius);isolation:isolate;overflow:visible;}\
    .kt-holo-wrap::before{content:\"\";position:absolute;inset:-7px;border-radius:calc(var(--radius) + 7px);border:2px solid #00C2FF;box-shadow:0 0 18px 2px rgba(0,194,255,0.5),inset 0 0 14px rgba(0,194,255,0.22);animation:kt-holo-glow 4s ease-in-out infinite;pointer-events:none;z-index:1;}\
    .kt-holo-wrap::after{content:\"\";position:absolute;left:3%;right:3%;height:2px;top:4%;background:linear-gradient(90deg,transparent,#00C2FF,transparent);opacity:.85;animation:kt-holo-scan 3.6s ease-in-out infinite;z-index:2;pointer-events:none;}\
    @keyframes kt-holo-glow{0%,100%{border-color:#00C2FF;box-shadow:0 0 18px 2px rgba(0,194,255,0.5),inset 0 0 14px rgba(0,194,255,0.22);}50%{border-color:#7C3AED;box-shadow:0 0 22px 4px rgba(124,58,237,0.55),inset 0 0 16px rgba(124,58,237,0.28);}}\
    @keyframes kt-holo-scan{0%{top:4%;opacity:0;}10%{opacity:.9;}90%{opacity:.9;}100%{top:92%;opacity:0;}}\
    .kt-badge-float{animation:kt-badge-bob 4.6s ease-in-out infinite;}\
    @keyframes kt-badge-bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}\
    .kt-tech-orbit{position:absolute;top:6px;right:18px;width:150px;height:150px;perspective:600px;opacity:.5;pointer-events:none;z-index:0;}\
    .kt-tech-orbit-ring{position:absolute;inset:0;transform-style:preserve-3d;animation:kt-orbit-spin 16s linear infinite;}\
    .kt-tech-orbit-item{position:absolute;top:50%;left:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:9px;background:rgba(10,102,255,0.1);border:1px solid rgba(0,194,255,0.45);display:flex;align-items:center;justify-content:center;font-size:.95rem;backface-visibility:visible;box-shadow:0 0 12px rgba(0,194,255,0.25);}\
    @keyframes kt-orbit-spin{from{transform:rotateY(0deg) rotateX(8deg);}to{transform:rotateY(360deg) rotateX(8deg);}}\
    .kt-map-pin-accent{position:absolute;top:-14px;right:10px;width:34px;height:34px;z-index:2;}\
    .kt-map-pin-accent svg{width:100%;height:100%;filter:drop-shadow(0 0 6px rgba(0,194,255,0.7));}\
    .kt-map-pin-accent .kt-pin-ring{transform-origin:17px 17px;animation:kt-pin-pulse 2.4s ease-out infinite;}\
    @keyframes kt-pin-pulse{0%{transform:scale(0.4);opacity:.9;}100%{transform:scale(1.9);opacity:0;}}\
    @media (max-width:760px){.kt-tech-orbit{display:none;}}\
    @media (prefers-reduced-motion:reduce){\
      .kt-role-ticker .kt-role-text{transition:none;}\
      .kt-gradient-text{animation:none;background-position:0 50%;}\
      .kt-holo-wrap::before{animation:none;}\
      .kt-holo-wrap::after{animation:none;opacity:0;}\
      .kt-badge-float{animation:none;}\
      .kt-tech-orbit-ring{animation:none;}\
      .kt-pin-ring{animation:none;}\
      .kt-tilt-active{transition:none;}\
    }\
  ";
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ------------------------------------------------------- Hero canvas */
  function initHeroCanvas(){
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'kt-hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var nodes = [];
    var NODE_COUNT = 34;
    var LINK_DIST = 130;
    var mx = 0.5, my = 0.5; // normalized mouse position for parallax
    var rafId = null;
    var running = false;
    var t = 0;

    function resize(){
      var rect = hero.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedNodes(){
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++){
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 1.1 + Math.random() * 1.6
        });
      }
    }

    hero.addEventListener('mousemove', function(e){
      var rect = hero.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width;
      my = (e.clientY - rect.top) / rect.height;
    }, { passive: true });

    function drawWaves(){
      var bands = [
        { amp: 14, freq: 0.006, speed: 0.4, y: h * 0.72, color: 'rgba(0,194,255,0.07)' },
        { amp: 20, freq: 0.004, speed: 0.25, y: h * 0.84, color: 'rgba(124,58,237,0.06)' }
      ];
      bands.forEach(function(b){
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (var x = 0; x <= w; x += 12){
          var y = b.y + Math.sin(x * b.freq + t * b.speed) * b.amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = b.color;
        ctx.fill();
      });
    }

    function drawRays(){
      var px = (mx - 0.5) * 30;
      var py = (my - 0.5) * 20;
      var glows = [
        { x: w * 0.18 + px * 0.5, y: h * 0.28 + py * 0.5, r: Math.max(w, h) * 0.32, color: 'rgba(0,194,255,0.10)' },
        { x: w * 0.85 - px * 0.5, y: h * 0.65 - py * 0.5, r: Math.max(w, h) * 0.28, color: 'rgba(124,58,237,0.09)' }
      ];
      glows.forEach(function(g){
        var grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
        grad.addColorStop(0, g.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
    }

    function drawNetwork(){
      var px = (mx - 0.5) * 12;
      var py = (my - 0.5) * 12;
      for (var i = 0; i < nodes.length; i++){
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
      }
      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++){
        for (var bIdx = a + 1; bIdx < nodes.length; bIdx++){
          var n1 = nodes[a], n2 = nodes[bIdx];
          var dx = n1.x - n2.x, dy = n1.y - n2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST){
            var alpha = (1 - dist / LINK_DIST) * 0.18;
            ctx.strokeStyle = 'rgba(0,194,255,' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(n1.x + px, n1.y + py);
            ctx.lineTo(n2.x + px, n2.y + py);
            ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++){
        var node = nodes[k];
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,194,255,0.55)';
        ctx.shadowColor = 'rgba(0,194,255,0.8)';
        ctx.shadowBlur = 6;
        ctx.arc(node.x + px, node.y + py, node.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function frame(){
      if (!running) return;
      t += 1;
      ctx.clearRect(0, 0, w, h);
      drawRays();
      drawWaves();
      drawNetwork();
      rafId = requestAnimationFrame(frame);
    }

    function start(){
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop(){
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    resize();
    seedNodes();
    window.addEventListener('resize', function(){
      resize();
      // keep node count stable across resizes rather than reseeding entirely
      nodes.forEach(function(n){ n.x = Math.min(n.x, w); n.y = Math.min(n.y, h); });
    }, { passive: true });

    if (reduceMotion){
      // Draw a single static, calm frame — no rAF loop at all.
      t = 0;
      drawRays();
      drawWaves();
      drawNetwork();
      return;
    }

    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.05 });
      io.observe(hero);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', function(){
      if (document.hidden) stop();
      else if (hero.getBoundingClientRect().bottom > 0) start();
    });
  }

  /* ------------------------------------------------------- Role ticker */
  function initRoleTicker(){
    var eyebrow = document.querySelector('.hero .hero-eyebrow');
    if (!eyebrow || !eyebrow.parentNode) return;

    var roles = [
      { icon: '🛡️', text: 'Cybersecurity Engineer' },
      { icon: '🖥️', text: 'System Administrator' },
      { icon: '🤖', text: 'AI Technology Specialist' }
    ];

    var ticker = document.createElement('div');
    ticker.className = 'kt-role-ticker';
    ticker.setAttribute('aria-live', 'polite');
    ticker.innerHTML =
      '<span class="kt-role-icon">' + roles[0].icon + '</span>' +
      '<span class="kt-role-text">' + roles[0].text + '</span>' +
      '<span class="kt-role-dots"></span>';
    eyebrow.parentNode.insertBefore(ticker, eyebrow);

    var iconEl = ticker.querySelector('.kt-role-icon');
    var textEl = ticker.querySelector('.kt-role-text');
    var dotsEl = ticker.querySelector('.kt-role-dots');
    var dots = roles.map(function(_, i){
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'kt-role-dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', 'Show role ' + (i + 1));
      dotsEl.appendChild(d);
      return d;
    });

    if (reduceMotion) return; // static, first role only — no cycling

    var idx = 0, timer = null, paused = false;

    function show(i){
      idx = i;
      ticker.setAttribute('data-fading', 'true');
      setTimeout(function(){
        iconEl.textContent = roles[idx].icon;
        textEl.textContent = roles[idx].text;
        dots.forEach(function(d, di){ d.classList.toggle('is-active', di === idx); });
        ticker.removeAttribute('data-fading');
      }, 260);
    }

    function next(){ show((idx + 1) % roles.length); }

    function schedule(){
      timer = setInterval(function(){ if (!paused) next(); }, 4200);
    }
    schedule();

    ticker.addEventListener('mouseenter', function(){ paused = true; });
    ticker.addEventListener('mouseleave', function(){ paused = false; });
    ticker.addEventListener('focusin', function(){ paused = true; });
    ticker.addEventListener('focusout', function(){ paused = false; });
    dots.forEach(function(d, i){
      d.addEventListener('click', function(){ show(i); });
    });

    document.addEventListener('visibilitychange', function(){
      if (document.hidden){ clearInterval(timer); }
      else { clearInterval(timer); schedule(); }
    });
  }

  /* -------------------------------------------------- Gradient heading */
  function initGradientText(){
    var h1 = document.querySelector('.hero h1');
    if (h1) h1.classList.add('kt-gradient-text');
  }

  /* --------------------------------------------------------- Tilt cards */
  function initTiltCards(){
    if (coarsePointer) return; // skip on touch devices — hover tilt has no touch equivalent
    var selectors = '.service-card, .portfolio-card';
    var cards = document.querySelectorAll(selectors);
    cards.forEach(function(card){
      card.classList.add('kt-tilt-active');
      var raf = null;
      card.addEventListener('mousemove', function(e){
        if (reduceMotion) return;
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function(){
          var rx = (-py * 7).toFixed(2);
          var ry = (px * 9).toFixed(2);
          card.style.transform = 'translateY(-6px) perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        });
      }, { passive: true });
      card.addEventListener('mouseleave', function(){
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }

  /* --------------------------------------------------- Hologram profile */
  function initHologramPhoto(){
    var photo = document.querySelector('.credibility-photo');
    if (!photo) return;
    var target = photo.closest('picture') || photo;
    if (target.parentNode.classList.contains('kt-holo-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'kt-holo-wrap';
    target.parentNode.insertBefore(wrap, target);
    wrap.appendChild(target);
  }

  /* -------------------------------------------------------- Badge float */
  function initBadgeFloat(){
    if (reduceMotion) return;
    var items = document.querySelectorAll('.trust-badge, .hero-badge-item');
    items.forEach(function(el, i){
      el.classList.add('kt-badge-float');
      el.style.animationDelay = (i % 6) * 0.35 + 's';
    });
  }

  /* ---------------------------------------------- Services tech orbit */
  function initTechOrbit(){
    var section = document.querySelector('#services .section-header');
    if (!section || !section.parentNode) return;
    if (getComputedStyle(section.parentNode).position === 'static'){
      section.parentNode.style.position = 'relative';
    }
    var icons = ['🛡️','☁️','🖧','🔒','💻','🌐','⚙️','🤖'];
    var orbit = document.createElement('div');
    orbit.className = 'kt-tech-orbit';
    orbit.setAttribute('aria-hidden', 'true');
    var ring = document.createElement('div');
    ring.className = 'kt-tech-orbit-ring';
    icons.forEach(function(icon, i){
      var item = document.createElement('div');
      item.className = 'kt-tech-orbit-item';
      item.textContent = icon;
      var angle = (360 / icons.length) * i;
      item.style.transform = 'rotateY(' + angle + 'deg) translateZ(74px)';
      ring.appendChild(item);
    });
    orbit.appendChild(ring);
    section.parentNode.insertBefore(orbit, section);
  }

  /* --------------------------------------------------------- Map pin */
  function initMapPin(){
    var map = document.querySelector('#contact .map-embed');
    if (!map) return;
    if (getComputedStyle(map).position === 'static') map.style.position = 'relative';
    var pin = document.createElement('div');
    pin.className = 'kt-map-pin-accent';
    pin.setAttribute('aria-hidden', 'true');
    pin.innerHTML =
      '<svg viewBox="0 0 34 34" fill="none">' +
      '<circle class="kt-pin-ring" cx="17" cy="17" r="9" fill="none" stroke="#00C2FF" stroke-width="1.4"/>' +
      '<path d="M17 6c-4.4 0-8 3.5-8 7.9 0 5.9 8 14.1 8 14.1s8-8.2 8-14.1C25 9.5 21.4 6 17 6z" fill="#00C2FF"/>' +
      '<circle cx="17" cy="13.5" r="2.6" fill="#071A2B"/>' +
      '</svg>';
    map.appendChild(pin);
  }

  /* --------------------------------------------------------------- Init */
  function init(){
    initHeroCanvas();
    initRoleTicker();
    initGradientText();
    initTiltCards();
    initHologramPhoto();
    initBadgeFloat();
    initTechOrbit();
    initMapPin();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
