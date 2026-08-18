/*
  KhurshedTech "Motion" Layer — Phase 3
  --------------------------------------
  Builds on assets/kt-hero-fx.js and assets/kt-experience-fx.js without
  modifying either. Same rules apply: no Three.js / GSAP / Framer Motion /
  WebGL / Lottie — everything here is hand-built with CSS3 and vanilla JS,
  kept in its own file so the already-shipped layers stay untouched.

  Adds:
    - A word-by-word, blur-to-sharp scroll reveal applied to every section
      heading (<h2>) site-wide — the "every word animation" system,
      implemented without GSAP SplitText.
    - A matching line-style reveal for the About section's intro
      paragraphs.
    - Magnetic + glow hover on the primary hero buttons, the social pill
      links, and the floating action buttons (composes with the site's
      existing hover-lift CSS rather than replacing it).
    - A "Skill Evolution" timeline in the About section, built strictly
      from certifications and experience already documented elsewhere on
      this site (Cisco CCNA/CCNP, Azure Administrator, Microsoft 365,
      Windows Server & VMware) — no invented job titles, employers, or
      dates, per an explicit decision to keep this honest rather than
      fabricate a career history.
  Respects prefers-reduced-motion and pointer:coarse throughout, and does
  nothing until DOM is ready.
*/
(function(){
  if (window.__ktMotionFxInit) return;
  window.__ktMotionFxInit = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------- CSS */
  var css = "\
    .kt-word{display:inline-block;opacity:0;filter:blur(7px);transform:translateY(18px) rotateX(-35deg);transform-origin:50% 100%;transition:opacity .6s cubic-bezier(.22,1,.36,1),filter .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1);will-change:transform,filter,opacity;}\
    .kt-word.is-in{opacity:1;filter:blur(0);transform:none;}\
    \
    .kt-para-reveal{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease;}\
    .kt-para-reveal.is-in{opacity:1;transform:none;}\
    \
    .kt-magnetic{transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .25s ease;}\
    .kt-magnetic.kt-magnetic-hover{box-shadow:0 0 22px rgba(0,194,255,0.4),0 0 42px rgba(124,58,237,0.22);}\
    \
    .kt-timeline{margin-top:44px;position:relative;}\
    .kt-timeline-track{display:flex;gap:0;position:relative;}\
    .kt-timeline-track::before{content:'';position:absolute;left:0;right:0;top:22px;height:2px;background:linear-gradient(90deg,rgba(0,194,255,0.15),rgba(0,194,255,0.5),rgba(124,58,237,0.5),rgba(124,58,237,0.15));transform:scaleX(0);transform-origin:left;transition:transform 1.1s cubic-bezier(.22,1,.36,1);}\
    .kt-timeline-track.is-in::before{transform:scaleX(1);}\
    .kt-timeline-node{flex:1;min-width:0;padding:0 14px;text-align:center;opacity:0;transform:translateY(14px);transition:opacity .55s ease,transform .55s ease;}\
    .kt-timeline-node.is-in{opacity:1;transform:none;}\
    .kt-timeline-dot{width:46px;height:46px;margin:0 auto 14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(0,194,255,0.25),rgba(7,26,43,0.95));border:1.5px solid rgba(0,194,255,0.55);display:flex;align-items:center;justify-content:center;font-size:1.15rem;box-shadow:0 0 16px rgba(0,194,255,0.25);position:relative;z-index:1;}\
    .kt-timeline-node h4{font-family:'Poppins',sans-serif;font-size:.9rem;color:var(--navy,#071A2B);margin-bottom:6px;}\
    .kt-timeline-node p{font-size:.76rem;color:#5A6B85;line-height:1.5;margin-bottom:8px;}\
    .kt-timeline-chip{display:inline-block;font-size:.68rem;font-weight:700;color:#0A66FF;background:rgba(10,102,255,0.08);border:1px solid rgba(10,102,255,0.2);border-radius:999px;padding:4px 10px;}\
    @media (max-width:820px){\
      .kt-timeline-track{flex-direction:column;gap:26px;}\
      .kt-timeline-track::before{display:none;}\
      .kt-timeline-node{padding:0;text-align:left;display:flex;align-items:flex-start;gap:14px;}\
      .kt-timeline-dot{margin:0;flex:0 0 auto;}\
    }\
    \
    @media (prefers-reduced-motion:reduce){\
      .kt-word{opacity:1;filter:none;transform:none;transition:none;}\
      .kt-para-reveal{opacity:1;transform:none;transition:none;}\
      .kt-timeline-track::before{transition:none;}\
      .kt-timeline-node{opacity:1;transform:none;transition:none;}\
      .kt-magnetic{transition:none;}\
    }\
  ";
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ------------------------------------------------- Word-by-word reveal */
  function splitIntoWords(el){
    var text = el.textContent;
    var words = text.split(/\s+/).filter(Boolean);
    el.textContent = '';
    words.forEach(function(w, i){
      var span = document.createElement('span');
      span.className = 'kt-word';
      span.style.transitionDelay = (i * 50) + 'ms';
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  function initWordReveal(){
    var heads = document.querySelectorAll('section h2');
    if (!heads.length) return;
    heads.forEach(function(h){ splitIntoWords(h); });

    if (reduceMotion || !('IntersectionObserver' in window)){
      document.querySelectorAll('.kt-word').forEach(function(w){ w.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.querySelectorAll('.kt-word').forEach(function(w){ w.classList.add('is-in'); });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    heads.forEach(function(h){ io.observe(h); });
  }

  /* ------------------------------------------------------ Para reveal */
  function initParaReveal(){
    var paras = document.querySelectorAll('.about-lead');
    if (!paras.length) return;
    paras.forEach(function(p, i){
      p.classList.add('kt-para-reveal');
      p.style.transitionDelay = (i * 120) + 'ms';
    });
    if (reduceMotion || !('IntersectionObserver' in window)){
      paras.forEach(function(p){ p.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    paras.forEach(function(p){ io.observe(p); });
  }

  /* --------------------------------------------- Magnetic + glow buttons */
  function initMagneticButtons(){
    if (coarsePointer || reduceMotion) return;
    var targets = document.querySelectorAll('.hero-actions .btn, .social-pill, .quote-float, .messenger-float, .whatsapp-float');
    targets.forEach(function(el){
      el.classList.add('kt-magnetic');
      var baseLift = el.classList.contains('btn') ? -3 : 0; // preserve existing .btn:hover lift
      el.addEventListener('mouseenter', function(){
        el.classList.add('kt-magnetic-hover');
      });
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        var pull = 0.28;
        var maxOffset = 7;
        var x = Math.max(-maxOffset, Math.min(maxOffset, relX * pull));
        var y = Math.max(-maxOffset, Math.min(maxOffset, relY * pull));
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y + baseLift).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function(){
        el.classList.remove('kt-magnetic-hover');
        el.style.transform = '';
      });
    });
  }

  /* -------------------------------------------- About: skill-evolution timeline */
  function initCareerTimeline(){
    var grid = document.querySelector('#about .about-grid');
    if (!grid || !grid.parentNode) return;

    var stages = [
      { icon: '🖧', title: 'Networking & Support', text: 'Foundational IT support and networking, validated by Cisco’s associate-level exam.', chip: 'Cisco CCNA' },
      { icon: '☁️', title: 'Systems & Cloud', text: 'Windows Server, VMware virtualization, and Microsoft 365 & Azure administration.', chip: 'Azure Administrator · M365' },
      { icon: '🛡️', title: 'Enterprise Security', text: 'Advanced enterprise networking, WAN technologies, and infrastructure design.', chip: 'Cisco CCNP Enterprise' },
      { icon: '🤖', title: 'Automation & Modern IT', text: 'Workflow automation and modern tooling that cuts busywork out of day-to-day IT.', chip: '20+ Years Applied' }
    ];

    var wrap = document.createElement('div');
    wrap.className = 'kt-timeline';
    var eyebrow = document.createElement('span');
    eyebrow.className = 'section-eyebrow';
    eyebrow.textContent = 'How the skill set grew';
    wrap.appendChild(eyebrow);

    var track = document.createElement('div');
    track.className = 'kt-timeline-track';
    stages.forEach(function(s){
      var node = document.createElement('div');
      node.className = 'kt-timeline-node';
      node.innerHTML =
        '<div class="kt-timeline-dot" aria-hidden="true">' + s.icon + '</div>' +
        '<h4>' + s.title + '</h4>' +
        '<p>' + s.text + '</p>' +
        '<span class="kt-timeline-chip">' + s.chip + '</span>';
      track.appendChild(node);
    });
    wrap.appendChild(track);
    grid.parentNode.insertBefore(wrap, grid.nextSibling);

    if (reduceMotion || !('IntersectionObserver' in window)){
      track.classList.add('is-in');
      track.querySelectorAll('.kt-timeline-node').forEach(function(n){ n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          track.classList.add('is-in');
          var nodes = Array.prototype.slice.call(track.querySelectorAll('.kt-timeline-node'));
          nodes.forEach(function(n, i){
            setTimeout(function(){ n.classList.add('is-in'); }, 260 + i * 160);
          });
          io.unobserve(track);
        }
      });
    }, { threshold: 0.3 });
    io.observe(track);
  }

  /* --------------------------------------------------------------- Init */
  function init(){
    initWordReveal();
    initParaReveal();
    initMagneticButtons();
    initCareerTimeline();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
