/*
  KhurshedTech "Atmosphere" Layer — Phase 4
  -------------------------------------------
  Background-only upgrade, built on top of assets/kt-hero-fx.js and
  assets/kt-experience-fx.js without modifying either. Same standing rule:
  no Three.js / GSAP / Framer Motion / WebGL — CSS3 + Canvas 2D + vanilla
  JS only, kept in its own file.

  Context for what this file does and does NOT do, since a lot of the
  "background" request was already covered by earlier work or by the
  site's own pre-existing CSS:
    - The hero already has a digital grid (.hero-bg-grid), rising
      particles (.hero-particles), a mouse-parallaxed neural-network +
      light-ray canvas, and three aurora glow blobs — all pre-existing or
      built in earlier phases. Not duplicated here.
    - New in this file: a radar-style HUD scan-line sweep across the hero
      (the one "SOC" background element that was genuinely missing), a
      soft cursor-following light glow active site-wide (desktop only),
      and a quiet aurora accent behind the footer so the site's dark
      zones stay visually alive end to end.
    - Deliberately NOT done: turning the About/Skills/Portfolio sections
      into distinct dark "AI lab" backgrounds per section. Those sections
      are intentionally light for readability and to match the rest of
      this business site's design — a full per-section dark reskin is a
      bigger scope change than "upgrade the background" and would fight
      the site's existing look rather than extend it.
  Respects prefers-reduced-motion and pointer:coarse throughout, and does
  nothing until DOM is ready.
*/
(function(){
  if (window.__ktAtmosphereFxInit) return;
  window.__ktAtmosphereFxInit = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------- CSS */
  var css = "\
    .kt-hud-scan{position:absolute;left:0;right:0;height:2px;top:0;background:linear-gradient(90deg,transparent,rgba(0,229,255,0.6),rgba(124,58,237,0.35),transparent);opacity:0;pointer-events:none;z-index:0;animation:kt-hud-sweep 7.5s ease-in-out infinite;}\
    @keyframes kt-hud-sweep{0%{top:4%;opacity:0;}10%{opacity:.75;}50%{opacity:.35;}90%{opacity:.75;}100%{top:96%;opacity:0;}}\
    \
    .kt-cursor-glow{position:fixed;top:0;left:0;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(0,194,255,0.13) 0%,rgba(124,58,237,0.08) 42%,rgba(0,0,0,0) 72%);pointer-events:none;z-index:2;opacity:0;transition:opacity .5s ease;will-change:transform;}\
    .kt-cursor-glow.is-active{opacity:1;}\
    \
    footer{position:relative;overflow:hidden;}\
    footer > .container{position:relative;z-index:1;}\
    .kt-footer-glow{position:absolute;border-radius:50%;filter:blur(80px);opacity:.13;pointer-events:none;z-index:0;animation:kt-atmosphere-drift 26s ease-in-out infinite alternate;}\
    @keyframes kt-atmosphere-drift{0%{transform:translate(0,0) scale(1);}100%{transform:translate(26px,-18px) scale(1.1);}}\
    \
    @media (prefers-reduced-motion:reduce){\
      .kt-hud-scan{display:none;}\
      .kt-footer-glow{animation:none;}\
    }\
  ";
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* --------------------------------------------------- HUD scan sweep */
  function initHudScan(){
    if (reduceMotion) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
    var scan = document.createElement('div');
    scan.className = 'kt-hud-scan';
    scan.setAttribute('aria-hidden', 'true');
    var grid = hero.querySelector('.hero-bg-grid');
    if (grid && grid.nextSibling) hero.insertBefore(scan, grid.nextSibling);
    else hero.insertBefore(scan, hero.firstChild);
  }

  /* --------------------------------------------- Cursor-following glow */
  function initCursorGlow(){
    if (coarsePointer || reduceMotion || !('requestAnimationFrame' in window)) return;
    var glow = document.createElement('div');
    glow.className = 'kt-cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var cx = tx, cy = ty;
    var active = false;
    var running = true;
    var rafId = null;

    document.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY;
      if (!active){ active = true; glow.classList.add('is-active'); }
    }, { passive: true });

    document.addEventListener('mouseleave', function(){
      active = false;
      glow.classList.remove('is-active');
    });

    document.addEventListener('visibilitychange', function(){
      running = !document.hidden;
      if (running && !rafId) rafId = requestAnimationFrame(loop);
    });

    function loop(){
      if (!running){ rafId = null; return; }
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) translate(-50%,-50%)';
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------ Footer glow */
  function initFooterGlow(){
    var footer = document.querySelector('footer');
    if (!footer) return;
    var specs = [
      { w: 340, h: 340, top: '-10%', left: '6%', bg: 'radial-gradient(circle,#00C2FF,transparent 70%)' },
      { w: 300, h: 300, top: '20%', left: '82%', bg: 'radial-gradient(circle,#7C3AED,transparent 70%)' }
    ];
    specs.forEach(function(s, i){
      var blob = document.createElement('div');
      blob.className = 'kt-footer-glow';
      blob.setAttribute('aria-hidden', 'true');
      blob.style.width = s.w + 'px';
      blob.style.height = s.h + 'px';
      blob.style.top = s.top;
      blob.style.left = s.left;
      blob.style.background = s.bg;
      blob.style.animationDelay = (i * 3) + 's';
      footer.insertBefore(blob, footer.firstChild);
    });
  }

  /* --------------------------------------------------------------- Init */
  function init(){
    initHudScan();
    initCursorGlow();
    initFooterGlow();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
