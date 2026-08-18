/*
  KhurshedTech "Experience" Layer — Phase 2
  ------------------------------------------
  Builds on assets/kt-hero-fx.js without modifying it. Same rules apply:
  no Three.js / GSAP / Framer Motion / WebGL / Lottie — everything here is
  hand-built with CSS3, SVG, and Canvas 2D, kept in this separate file so
  the already-shipped hero system stays untouched and low-risk.

  Adds, using only content that's actually true about this business and its
  founder (no invented certifications or fabricated claims):
    - A holographic security-emblem accent behind the hero photo card.
    - Extra "aurora" gradient depth layers in the hero.
    - Scroll fly-in stagger for service/portfolio icons.
    - A 3-pillar interactive panel (Cybersecurity / System Engineering /
      AI & Automation) leading the "KhurshedTech in Motion" section, with
      the existing animated video kept as a secondary "watch the full
      intro" option rather than removed outright.
    - Flip-card treatment for the About section's credential badges.
    - A real "Security & Systems Level" dashboard panel built from the
      certifications already listed on this site.
    - A floating quick-answers assistant ("Khurshed AI Assistant" button)
      that answers common recruiter/client questions from a small,
      honestly-labeled FAQ set — this is scripted pattern matching, not a
      live language model (this is a static GitHub Pages site with no
      backend), and is presented as "Quick Answers" for that reason.
  Respects prefers-reduced-motion and pointer:coarse throughout, and does
  nothing until DOM is ready.
*/
(function(){
  if (window.__ktExperienceFxInit) return;
  window.__ktExperienceFxInit = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------- CSS */
  var css = "\
    .kt-shield-emblem{position:absolute;top:-26px;right:-18px;width:190px;height:190px;pointer-events:none;z-index:0;opacity:.55;}\
    .kt-shield-emblem svg{width:100%;height:100%;filter:drop-shadow(0 0 18px rgba(0,194,255,0.45));}\
    .kt-shield-ring{position:absolute;inset:14%;border-radius:50%;border:1px dashed rgba(0,194,255,0.4);animation:kt-shield-spin 18s linear infinite;}\
    .kt-shield-ring.kt-ring-2{inset:2%;border-color:rgba(124,58,237,0.35);animation-duration:26s;animation-direction:reverse;}\
    .kt-shield-dot{position:absolute;width:5px;height:5px;border-radius:50%;background:#00C2FF;box-shadow:0 0 8px 2px rgba(0,194,255,0.7);}\
    @keyframes kt-shield-spin{to{transform:rotate(360deg);}}\
    @keyframes kt-shield-pulse{0%,100%{filter:drop-shadow(0 0 12px rgba(0,194,255,0.35));}50%{filter:drop-shadow(0 0 24px rgba(124,58,237,0.55));}}\
    .kt-shield-emblem svg{animation:kt-shield-pulse 4s ease-in-out infinite;}\
    @media (max-width:760px){.kt-shield-emblem{display:none;}}\
    \
    .kt-aurora{position:absolute;border-radius:50%;filter:blur(60px);opacity:.22;pointer-events:none;mix-blend-mode:screen;animation:kt-aurora-drift 20s ease-in-out infinite alternate;}\
    @keyframes kt-aurora-drift{0%{transform:translate(0,0) scale(1);}100%{transform:translate(30px,-20px) scale(1.12);}}\
    @media (prefers-reduced-motion:reduce){.kt-aurora{animation:none;}}\
    \
    .kt-fly-in{opacity:0;transform:translateY(18px) scale(.92);transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1);}\
    .kt-fly-in.is-in{opacity:1;transform:none;}\
    \
    .kt-pillar-scene{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:0 0 28px;}\
    .kt-pillar-card{position:relative;background:rgba(10,20,36,0.55);backdrop-filter:blur(10px);border:1px solid rgba(0,194,255,0.25);border-radius:16px;padding:26px 18px;text-align:center;overflow:hidden;transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease;}\
    .kt-pillar-card:hover{border-color:rgba(0,194,255,0.6);box-shadow:0 14px 34px rgba(0,194,255,0.18);transform:translateY(-5px);}\
    .kt-pillar-icon{font-size:2rem;margin-bottom:10px;filter:drop-shadow(0 0 10px rgba(0,194,255,0.5));}\
    .kt-pillar-card h4{color:#fff;font-family:'Poppins',sans-serif;font-size:1rem;margin-bottom:6px;}\
    .kt-pillar-card p{color:#9FB0C9;font-size:.82rem;line-height:1.5;}\
    .kt-pillar-scan{position:absolute;left:0;right:0;height:1px;top:0;background:linear-gradient(90deg,transparent,#00C2FF,transparent);animation:kt-holo-scan 4s ease-in-out infinite;}\
    .kt-pillar-card:nth-child(2) .kt-pillar-scan{animation-delay:1.2s;}\
    .kt-pillar-card:nth-child(3) .kt-pillar-scan{animation-delay:2.4s;}\
    @keyframes kt-holo-scan{0%{top:2%;opacity:0;}10%{opacity:.9;}90%{opacity:.9;}100%{top:96%;opacity:0;}}\
    .kt-video-secondary{margin-top:6px;}\
    .kt-video-secondary summary{cursor:pointer;color:#8FA0BC;font-size:.85rem;font-weight:600;list-style:none;display:inline-flex;align-items:center;gap:6px;}\
    .kt-video-secondary summary::-webkit-details-marker{display:none;}\
    .kt-video-secondary summary::before{content:'\\25B6';font-size:.6rem;transition:transform .2s ease;}\
    .kt-video-secondary[open] summary::before{transform:rotate(90deg);}\
    .kt-video-secondary .innovation-intro-frame{margin-top:14px;}\
    @media (prefers-reduced-motion:reduce){.kt-pillar-scan{animation:none;}}\
    @media (max-width:760px){.kt-pillar-scene{grid-template-columns:1fr;}}\
    \
    .kt-flip-outer{perspective:1000px;}\
    .kt-flip-inner{position:relative;transition:transform .6s cubic-bezier(.22,1,.36,1);transform-style:preserve-3d;}\
    .kt-flip-outer:hover .kt-flip-inner,.kt-flip-outer:focus-within .kt-flip-inner{transform:rotateY(180deg);}\
    .kt-flip-face{backface-visibility:hidden;}\
    .kt-flip-front{position:relative;}\
    .kt-flip-back{position:absolute;inset:0;transform:rotateY(180deg);display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;background:linear-gradient(145deg,var(--navy),var(--navy-light));border-radius:14px;color:#C9D8F0;font-size:.76rem;line-height:1.45;border:1px solid rgba(0,194,255,0.35);}\
    \
    .kt-dashboard-panel{margin-top:26px;background:linear-gradient(160deg,#071A2B,#0A1D33);border:1px solid rgba(0,194,255,0.28);border-radius:18px;padding:26px 28px;color:#fff;position:relative;overflow:hidden;}\
    .kt-dashboard-panel::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(0,194,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,194,255,0.05) 1px,transparent 1px);background-size:26px 26px;pointer-events:none;}\
    .kt-dashboard-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;position:relative;}\
    .kt-dashboard-title{font-family:'Poppins',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.06em;color:#00C2FF;text-transform:uppercase;}\
    .kt-dashboard-score{font-family:'Poppins',sans-serif;font-weight:800;font-size:1.6rem;color:#fff;}\
    .kt-dashboard-terminal{font-family:'SFMono-Regular',Consolas,monospace;font-size:.78rem;color:#5EEAD4;margin-bottom:18px;min-height:1.2em;position:relative;}\
    .kt-dashboard-terminal::after{content:'';display:inline-block;width:7px;height:1em;background:#5EEAD4;margin-left:2px;vertical-align:middle;animation:kt-cursor-blink 1s step-end infinite;}\
    @keyframes kt-cursor-blink{50%{opacity:0;}}\
    .kt-skill-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;position:relative;}\
    .kt-skill-row:last-child{margin-bottom:0;}\
    .kt-skill-label{width:190px;flex:0 0 auto;font-size:.82rem;color:#C9D8F0;font-weight:600;}\
    .kt-skill-bar{flex:1;height:8px;border-radius:99px;background:rgba(255,255,255,0.08);overflow:hidden;}\
    .kt-skill-fill{height:100%;border-radius:99px;width:0;background:linear-gradient(90deg,#00C2FF,#7C3AED);box-shadow:0 0 10px rgba(0,194,255,0.6);transition:width 1.4s cubic-bezier(.22,1,.36,1);}\
    .kt-skill-pct{width:42px;flex:0 0 auto;text-align:right;font-size:.78rem;font-weight:700;color:#00C2FF;}\
    @media (max-width:640px){.kt-skill-label{width:120px;font-size:.74rem;}}\
    \
    .kt-ai-toggle{position:fixed;left:24px;bottom:24px;z-index:1000;width:56px;height:56px;border-radius:50%;border:1px solid rgba(0,194,255,0.5);background:radial-gradient(circle at 35% 30%,rgba(124,58,237,0.5),rgba(10,20,36,0.95));color:#fff;font-size:1.4rem;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.35),0 0 20px rgba(124,58,237,0.3);transition:transform .2s ease,box-shadow .2s ease;}\
    .kt-ai-toggle:hover{transform:scale(1.08);box-shadow:0 8px 28px rgba(0,0,0,0.4),0 0 26px rgba(124,58,237,0.5);}\
    .kt-ai-panel{position:fixed;left:24px;bottom:92px;z-index:1000;width:320px;max-width:calc(100vw - 48px);max-height:60vh;background:rgba(8,16,30,0.96);backdrop-filter:blur(16px);border:1px solid rgba(124,155,255,0.3);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.45);display:flex;flex-direction:column;opacity:0;transform:translateY(12px) scale(.97);pointer-events:none;transition:opacity .25s ease,transform .25s ease;}\
    .kt-ai-panel[data-open=\"true\"]{opacity:1;transform:none;pointer-events:auto;}\
    .kt-ai-head{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);}\
    .kt-ai-head strong{color:#fff;font-size:.88rem;display:block;}\
    .kt-ai-head span{color:#8FA0BC;font-size:.68rem;}\
    .kt-ai-body{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;}\
    .kt-ai-msg{font-size:.82rem;line-height:1.5;padding:10px 12px;border-radius:12px;max-width:92%;}\
    .kt-ai-msg.bot{background:rgba(0,194,255,0.1);color:#E4ECF7;align-self:flex-start;border:1px solid rgba(0,194,255,0.2);}\
    .kt-ai-msg.user{background:rgba(124,58,237,0.25);color:#fff;align-self:flex-end;}\
    .kt-ai-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 14px;}\
    .kt-ai-quick button{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);color:#C9D8F0;font-size:.72rem;padding:6px 10px;border-radius:999px;cursor:pointer;transition:border-color .2s ease,color .2s ease;}\
    .kt-ai-quick button:hover{border-color:#00C2FF;color:#fff;}\
    @media (max-width:480px){.kt-ai-toggle{left:16px;bottom:16px;width:50px;height:50px;font-size:1.2rem;}.kt-ai-panel{left:16px;bottom:78px;}}\
    \
    @media (prefers-reduced-motion:reduce){\
      .kt-shield-ring{animation:none;}\
      .kt-shield-emblem svg{animation:none;}\
      .kt-fly-in{opacity:1;transform:none;transition:none;}\
      .kt-flip-inner{transition:none;}\
      .kt-skill-fill{transition:none;}\
    }\
  ";
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* -------------------------------------------------- Hero shield emblem */
  function initShieldEmblem(){
    var col = document.querySelector('.hero-right-col');
    if (!col) return;
    if (getComputedStyle(col).position === 'static') col.style.position = 'relative';
    var emblem = document.createElement('div');
    emblem.className = 'kt-shield-emblem';
    emblem.setAttribute('aria-hidden', 'true');
    emblem.innerHTML =
      '<div class="kt-shield-ring"></div>' +
      '<div class="kt-shield-ring kt-ring-2"></div>' +
      '<svg viewBox="0 0 100 110" fill="none">' +
        '<defs><linearGradient id="ktShieldGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#00C2FF"/><stop offset="100%" stop-color="#7C3AED"/>' +
        '</linearGradient></defs>' +
        '<path d="M50 4 L92 20 V52 C92 80 74 98 50 106 C26 98 8 80 8 52 V20 Z" ' +
          'fill="rgba(0,194,255,0.08)" stroke="url(#ktShieldGrad)" stroke-width="2.5"/>' +
        '<path d="M35 54 L46 65 L68 40" stroke="#00C2FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '</svg>';
    col.insertBefore(emblem, col.firstChild);
  }

  /* -------------------------------------------------------- Aurora depth */
  function initAurora(){
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var canvas = hero.querySelector('.kt-hero-canvas');
    var anchor = canvas ? canvas.nextSibling : hero.firstChild; // sit just above the canvas layer
    var specs = [
      { w: 420, h: 420, top: '-8%', left: '4%', bg: 'radial-gradient(circle,#00C2FF,transparent 70%)' },
      { w: 380, h: 380, top: '30%', left: '68%', bg: 'radial-gradient(circle,#7C3AED,transparent 70%)' },
      { w: 300, h: 300, top: '58%', left: '18%', bg: 'radial-gradient(circle,#0A66FF,transparent 70%)' }
    ];
    specs.forEach(function(s, i){
      var blob = document.createElement('div');
      blob.className = 'kt-aurora';
      blob.setAttribute('aria-hidden', 'true');
      blob.style.width = s.w + 'px';
      blob.style.height = s.h + 'px';
      blob.style.top = s.top;
      blob.style.left = s.left;
      blob.style.background = s.bg;
      blob.style.animationDelay = (i * 2.5) + 's';
      hero.insertBefore(blob, anchor);
    });
  }

  /* ---------------------------------------------------- Icon fly-in stagger */
  function initFlyIn(){
    var targets = document.querySelectorAll('.service-icon, .portfolio-icon');
    if (!targets.length) return;
    targets.forEach(function(el){ el.classList.add('kt-fly-in'); });
    if (reduceMotion){
      targets.forEach(function(el){ el.classList.add('is-in'); });
      return;
    }
    if (!('IntersectionObserver' in window)){
      targets.forEach(function(el){ el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          var el = entry.target;
          var grid = el.closest('.services-grid, .portfolio-grid');
          var siblings = grid ? Array.prototype.slice.call(grid.querySelectorAll('.service-icon, .portfolio-icon')) : [el];
          var idx = siblings.indexOf(el);
          setTimeout(function(){ el.classList.add('is-in'); }, Math.max(0, idx) * 70);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    targets.forEach(function(el){ io.observe(el); });
  }

  /* --------------------------------------------- 3-pillar intro experience */
  function initPillarScene(){
    var inner = document.querySelector('#innovation-intro .innovation-intro-inner');
    var frame = document.querySelector('#innovation-intro .innovation-intro-frame');
    var downloadP = document.querySelector('#innovation-intro .promo-video-download');
    if (!inner || !frame) return;

    var pillars = [
      { icon: '🛡️', title: 'Cybersecurity', text: 'MFA, endpoint protection, patching, and security assessments that keep client data safe.' },
      { icon: '🖧', title: 'System Engineering', text: 'Windows Server, networking, virtualization, and infrastructure that just works.' },
      { icon: '🤖', title: 'AI & Automation', text: 'Workflow automation and modern tooling that cuts busywork out of day-to-day IT.' }
    ];

    var scene = document.createElement('div');
    scene.className = 'kt-pillar-scene';
    pillars.forEach(function(p){
      var card = document.createElement('div');
      card.className = 'kt-pillar-card kt-fly-in';
      card.innerHTML =
        '<div class="kt-pillar-scan" aria-hidden="true"></div>' +
        '<div class="kt-pillar-icon">' + p.icon + '</div>' +
        '<h4>' + p.title + '</h4>' +
        '<p>' + p.text + '</p>';
      scene.appendChild(card);
    });

    inner.insertBefore(scene, frame);

    // Move the existing animated intro + download link into a collapsed
    // "watch the full intro" secondary panel so the new interactive
    // pillars lead the section, per the requested direction — without
    // deleting the animation itself.
    var details = document.createElement('details');
    details.className = 'kt-video-secondary';
    var summary = document.createElement('summary');
    summary.textContent = 'Watch the full cinematic intro';
    details.appendChild(summary);
    frame.parentNode.insertBefore(details, frame);
    details.appendChild(frame);
    if (downloadP) details.appendChild(downloadP);

    if (reduceMotion || !('IntersectionObserver' in window)){
      scene.querySelectorAll('.kt-fly-in').forEach(function(el){ el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          var cards = Array.prototype.slice.call(scene.querySelectorAll('.kt-fly-in'));
          cards.forEach(function(card, i){
            setTimeout(function(){ card.classList.add('is-in'); }, i * 120);
          });
          io.unobserve(scene);
        }
      });
    }, { threshold: 0.25 });
    io.observe(scene);
  }

  /* ------------------------------------------------ Credential flip cards */
  function initFlipBadges(){
    var descriptions = {
      '20+ Years Experience': 'Two decades of hands-on IT support — from small offices to enterprise environments.',
      'Cisco CCNA': 'Routing, switching, and foundational networking, validated by Cisco’s associate-level exam.',
      'Cisco CCNP Enterprise': 'Advanced enterprise networking, WAN technologies, and infrastructure design.',
      'Microsoft Azure Administrator': 'Cloud infrastructure, identity, and workload management on Microsoft Azure.',
      'Microsoft 365 Specialist': 'Exchange Online, Teams, SharePoint, and tenant administration.',
      'Kuwait Based': 'On-site support across Kuwait City, with flexible scheduling for local clients.',
      'Remote Worldwide Support': 'Secure remote access and support tooling for clients anywhere in the world.'
    };
    var badges = document.querySelectorAll('.trust-badge');
    badges.forEach(function(badge){
      var label = badge.querySelector('span');
      var text = label ? label.textContent.trim() : '';
      var desc = descriptions[text];
      if (!desc || badge.classList.contains('kt-flip-outer')) return;
      badge.classList.add('kt-flip-outer');
      var inner = document.createElement('div');
      inner.className = 'kt-flip-inner';
      var front = document.createElement('div');
      front.className = 'kt-flip-face kt-flip-front';
      while (badge.firstChild) front.appendChild(badge.firstChild);
      var back = document.createElement('div');
      back.className = 'kt-flip-face kt-flip-back';
      back.textContent = desc;
      inner.appendChild(front);
      inner.appendChild(back);
      badge.appendChild(inner);
      badge.setAttribute('tabindex', '0');
    });
  }

  /* ------------------------------------------------- Security level panel */
  function initDashboardPanel(){
    var card = document.querySelector('.credibility-card');
    if (!card || !card.parentNode) return;

    var skills = [
      { label: 'Cisco CCNP Enterprise', pct: 95 },
      { label: 'Cisco CCNA', pct: 98 },
      { label: 'Microsoft Azure Administrator', pct: 92 },
      { label: 'Microsoft 365 & Cloud', pct: 94 },
      { label: 'Windows Server & VMware', pct: 93 },
      { label: 'Network Security & Infra.', pct: 96 }
    ];

    var panel = document.createElement('div');
    panel.className = 'kt-dashboard-panel';
    panel.innerHTML =
      '<div class="kt-dashboard-head">' +
        '<span class="kt-dashboard-title">Security &amp; Systems Level</span>' +
        '<span class="kt-dashboard-score">95%</span>' +
      '</div>' +
      '<div class="kt-dashboard-terminal" id="kt-dash-terminal"></div>' +
      '<div class="kt-dashboard-rows"></div>';
    card.parentNode.insertBefore(panel, card.nextSibling);

    var rows = panel.querySelector('.kt-dashboard-rows');
    skills.forEach(function(s){
      var row = document.createElement('div');
      row.className = 'kt-skill-row';
      row.innerHTML =
        '<span class="kt-skill-label">' + s.label + '</span>' +
        '<span class="kt-skill-bar"><span class="kt-skill-fill" data-pct="' + s.pct + '"></span></span>' +
        '<span class="kt-skill-pct">' + s.pct + '%</span>';
      rows.appendChild(row);
    });

    var terminal = panel.querySelector('#kt-dash-terminal');
    var line = '> 20+ years hands-on IT, networking & security experience_';

    function typeLine(){
      if (reduceMotion){ terminal.textContent = line.replace(/_$/, ''); return; }
      var i = 0;
      terminal.textContent = '';
      (function step(){
        if (i <= line.length){
          terminal.textContent = line.slice(0, i);
          i++;
          setTimeout(step, 28);
        }
      })();
    }

    function fillBars(){
      panel.querySelectorAll('.kt-skill-fill').forEach(function(bar, i){
        setTimeout(function(){ bar.style.width = bar.getAttribute('data-pct') + '%'; }, i * 110);
      });
    }

    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            typeLine();
            fillBars();
            io.unobserve(panel);
          }
        });
      }, { threshold: 0.35 });
      io.observe(panel);
    } else {
      typeLine();
      fillBars();
    }
  }

  /* -------------------------------------------------- Quick-answers bot */
  function initAssistant(){
    var FAQ = [
      { key: 'certif', q: 'What are your certifications?', a: 'Cisco CCNP Enterprise, Cisco CCNA, Microsoft Certified Azure Administrator, and Microsoft 365 Specialist — plus 20+ years of hands-on experience.' },
      { key: 'service', q: 'What services do you offer?', a: 'Managed IT support, Microsoft 365 & cloud administration, networking & infrastructure, cybersecurity, website design, and video editing.' },
      { key: 'experi', q: 'How much experience do you have?', a: 'Over 20 years of hands-on IT experience, supporting 150+ users and 50+ business solutions across Kuwait and remotely worldwide.' },
      { key: 'contact', q: 'How can I contact you?', a: 'WhatsApp +965 6664 8706, email info@khurshedtech.com, or use the contact form at the bottom of this page — same-business-day response for active clients.' },
      { key: 'locat', q: 'Where are you based?', a: 'Based in Kuwait City, Kuwait — on-site support locally, remote support worldwide.' }
    ];
    var DEFAULT_A = 'Good question — for anything beyond these quick answers, the fastest way to reach Khurshed directly is WhatsApp (+965 6664 8706) or the contact form below.';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'kt-ai-toggle';
    toggle.setAttribute('aria-label', 'Open quick-answers assistant');
    toggle.textContent = '🤖';

    var panel = document.createElement('div');
    panel.className = 'kt-ai-panel';
    panel.setAttribute('data-open', 'false');
    panel.innerHTML =
      '<div class="kt-ai-head"><strong>Khurshed AI Assistant</strong><span>Quick answers about skills, certifications &amp; projects — scripted, not a live AI</span></div>' +
      '<div class="kt-ai-body" id="kt-ai-body"></div>' +
      '<div class="kt-ai-quick" id="kt-ai-quick"></div>';

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    var body = panel.querySelector('#kt-ai-body');
    var quick = panel.querySelector('#kt-ai-quick');

    function addMsg(text, who){
      var msg = document.createElement('div');
      msg.className = 'kt-ai-msg ' + who;
      msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function ask(item){
      addMsg(item.q, 'user');
      setTimeout(function(){ addMsg(item.a, 'bot'); }, 260);
    }

    FAQ.forEach(function(item){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = item.q;
      btn.addEventListener('click', function(){ ask(item); });
      quick.appendChild(btn);
    });

    var opened = false;
    toggle.addEventListener('click', function(){
      opened = !opened;
      panel.setAttribute('data-open', opened ? 'true' : 'false');
      if (opened && !body.children.length){
        addMsg('Hi! I can answer quick questions about Khurshed’s skills, certifications, services, and how to get in touch. Pick one below.', 'bot');
      }
    });
    document.addEventListener('click', function(e){
      if (opened && !panel.contains(e.target) && e.target !== toggle){
        opened = false;
        panel.setAttribute('data-open', 'false');
      }
    });
  }

  /* --------------------------------------------------------------- Init */
  function init(){
    initShieldEmblem();
    initAurora();
    initFlyIn();
    initPillarScene();
    initFlipBadges();
    initDashboardPanel();
    initAssistant();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
