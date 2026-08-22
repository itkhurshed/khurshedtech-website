/*!
 * Khurshed Alam — Cybersecurity Portfolio
 * Vanilla JS only — no third-party runtime dependencies (reduces supply-chain risk).
 * All effects respect prefers-reduced-motion.
 */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ----------------------------------------------------------
     Footer year
  ---------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     Mobile nav drawer
  ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  function openDrawer() {
    drawer.classList.add('show');
    navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    drawer.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  navToggle && navToggle.addEventListener('click', openDrawer);
  drawerClose && drawerClose.addEventListener('click', closeDrawer);
  drawer && drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ----------------------------------------------------------
     Skill bar percentage labels — single source of truth is the
     --pct custom property on .bar-fill; fill the adjacent label.
  ---------------------------------------------------------- */
  document.querySelectorAll('.skill-row').forEach(row => {
    const fill = row.querySelector('.bar-fill');
    const label = row.querySelector('.lbl b');
    if (fill && label) {
      const pct = fill.style.getPropertyValue('--pct').trim();
      if (pct) label.textContent = pct;
    }
  });

  /* ----------------------------------------------------------
     Scroll reveal (IntersectionObserver)
  ---------------------------------------------------------- */
  const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger, .soc-panel, .timeline, .tl-item');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in', 'in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in', 'in-view'));
  }

  /* ----------------------------------------------------------
     Active nav link highlight on scroll
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window && sections.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => navIO.observe(s));
  }

  /* ----------------------------------------------------------
     Back to top button
  ---------------------------------------------------------- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) toTop.classList.add('show');
      else toTop.classList.remove('show');
    }, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ----------------------------------------------------------
     Ripple + magnetic buttons
  ---------------------------------------------------------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------
     3D tilt for cards
  ---------------------------------------------------------- */
  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll('.tilt, .tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotY = (px - 0.5) * 10;
        const rotX = (0.5 - py) * 10;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.setProperty('--x', (px * 100) + '%');
        card.style.setProperty('--y', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------
     Terminal typing effect (hero)
  ---------------------------------------------------------- */
  const terminalBody = document.getElementById('terminalBody');
  if (terminalBody) {
    const lines = [
      { p: '$ ', t: 'whoami' },
      { p: '> ', t: 'khurshed_alam — cybersecurity_engineer' },
      { p: '$ ', t: 'status --check' },
      { p: '> ', t: 'availability: OPEN_TO_OPPORTUNITIES' },
      { p: '$ ', t: 'focus --list' },
      { p: '> ', t: 'security_ops, cloud, ai_automation' },
    ];
    let li = 0, ci = 0;
    const speed = reduceMotion ? 0 : 32;

    function typeLine() {
      if (li >= lines.length) {
        setTimeout(() => { terminalBody.innerHTML = ''; li = 0; ci = 0; typeLine(); }, 2600);
        return;
      }
      const row = document.createElement('div');
      const promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = lines[li].p;
      row.appendChild(promptSpan);
      const textSpan = document.createElement('span');
      row.appendChild(textSpan);
      const caret = document.createElement('span');
      caret.className = 'caret';
      row.appendChild(caret);
      terminalBody.appendChild(row);

      if (reduceMotion) {
        textSpan.textContent = lines[li].t;
        caret.remove();
        li++;
        setTimeout(typeLine, 260);
        return;
      }

      const full = lines[li].t;
      ci = 0;
      const iv = setInterval(() => {
        textSpan.textContent = full.slice(0, ci + 1);
        ci++;
        if (ci >= full.length) {
          clearInterval(iv);
          caret.remove();
          li++;
          setTimeout(typeLine, 420);
        }
      }, speed);
    }
    typeLine();
  }

  /* ----------------------------------------------------------
     Particle / cyber-grid canvas background
  ---------------------------------------------------------- */
  const particlesCanvas = document.getElementById('particles');
  if (particlesCanvas && !reduceMotion) {
    const ctx = particlesCanvas.getContext('2d');
    let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    const NODE_COUNT = window.innerWidth < 768 ? 34 : 70;
    const LINK_DIST = 130;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      particlesCanvas.style.width = w + 'px';
      particlesCanvas.style.height = h + 'px';
      particlesCanvas.width = w * dpr;
      particlesCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }
    resize();
    initNodes();
    window.addEventListener('resize', () => { resize(); initNodes(); });

    let mouse = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(45,216,239,${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
        const dmx = nodes[i].x - mouse.x, dmy = nodes[i].y - mouse.y;
        const dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < 160) {
          ctx.strokeStyle = `rgba(155,123,255,${0.25 * (1 - dm / 160)})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(45,216,239,0.55)';
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------
     Neural network visual (AI section)
  ---------------------------------------------------------- */
  const neuroCanvas = document.getElementById('neuroCanvas');
  if (neuroCanvas) {
    const ctx = neuroCanvas.getContext('2d');
    let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const layers = [3, 5, 5, 3];
    let layerNodes = [];

    function layout() {
      const parent = neuroCanvas.parentElement;
      w = neuroCanvas.width = parent.clientWidth * dpr;
      h = neuroCanvas.height = parent.clientHeight * dpr;
      neuroCanvas.style.width = parent.clientWidth + 'px';
      neuroCanvas.style.height = parent.clientHeight + 'px';
      const W = parent.clientWidth, H = parent.clientHeight;
      layerNodes = layers.map((count, li) => {
        const x = (W / (layers.length + 1)) * (li + 1);
        return Array.from({ length: count }, (_, ni) => ({
          x, y: (H / (count + 1)) * (ni + 1),
          phase: Math.random() * Math.PI * 2,
        }));
      });
    }
    layout();
    window.addEventListener('resize', layout);

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // connections
      for (let li = 0; li < layerNodes.length - 1; li++) {
        for (let a of layerNodes[li]) {
          for (let b of layerNodes[li + 1]) {
            const pulse = reduceMotion ? 0.5 : (Math.sin(t / 900 + a.phase) + 1) / 2;
            ctx.strokeStyle = `rgba(155,123,255,${0.08 + pulse * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      layerNodes.flat().forEach(n => {
        const pulse = reduceMotion ? 0.5 : (Math.sin(t / 700 + n.phase) + 1) / 2;
        const r = 3 + pulse * 2.2;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        grad.addColorStop(0, `rgba(155,123,255,${0.5 + pulse * 0.4})`);
        grad.addColorStop(1, 'rgba(155,123,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c3b2ff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ----------------------------------------------------------
     Ambient sound toggle — synthesized in-browser (Web Audio API).
     No external audio file required, no autoplay (user-gesture gated).
  ---------------------------------------------------------- */
  const ambienceBtn = document.getElementById('ambienceBtn');
  const ambiencePanel = document.getElementById('ambiencePanel');
  let audioCtx = null, masterGain = null, voices = [], playing = false;

  function buildAmbience() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(masterGain);

    // Soft pad: a few detuned sine/triangle oscillators with slow LFOs = calm ambient tone
    const freqs = [110, 165, 220, 277.18];
    freqs.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const gain = audioCtx.createGain();
      gain.gain.value = 0.06;
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      lfo.start();
      voices.push(osc, lfo);
    });
  }

  function fadeTo(target, duration = 1.2) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(target, now + duration);
  }

  ambienceBtn && ambienceBtn.addEventListener('click', () => {
    if (!audioCtx) buildAmbience();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playing = !playing;
    ambienceBtn.classList.toggle('active', playing);
    ambienceBtn.setAttribute('aria-pressed', String(playing));
    ambiencePanel.classList.toggle('show', playing);
    ambiencePanel.classList.toggle('playing', playing);
    fadeTo(playing ? 0.09 : 0, playing ? 2 : 1);
  });

  /* ----------------------------------------------------------
     AOS (Animate On Scroll) init — library is loaded just
     before this file, so the global is ready here.
  ---------------------------------------------------------- */
  if (window.AOS) {
    window.AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: reduceMotion,
    });
  }

  /* ----------------------------------------------------------
     Animated stat counters — count up from 0 to data-target
     once the element scrolls into view.
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll('.counter[data-target]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.getAttribute('data-target')) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const counterIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => counterIO.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ----------------------------------------------------------
     Floating live-chat widget — toggle popup, auto-reply menu,
     WhatsApp quick replies. Closes on outside click / Escape.
  ---------------------------------------------------------- */
  const chatToggle = document.getElementById('ktChatToggle');
  const chatPopup = document.getElementById('ktChatPopup');
  const chatClose = document.getElementById('ktChatClose');
  if (chatToggle && chatPopup) {
    let chatOpen = false;
    let chatOpenedOnce = false;

    function setChatOpen(open) {
      chatOpen = open;
      chatToggle.classList.toggle('chat-open', open);
      chatToggle.setAttribute('aria-expanded', String(open));
      chatPopup.classList.toggle('show', open);
      chatPopup.setAttribute('aria-hidden', String(!open));
      if (open) {
        chatOpenedOnce = true;
        chatToggle.classList.add('chat-seen');
      }
    }

    chatToggle.addEventListener('click', () => setChatOpen(!chatOpen));
    chatClose && chatClose.addEventListener('click', () => setChatOpen(false));

    document.addEventListener('click', (e) => {
      if (!chatOpen) return;
      if (chatPopup.contains(e.target) || chatToggle.contains(e.target)) return;
      setChatOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatOpen) setChatOpen(false);
    });

    // Gently invite the visitor to open the chat once, after they've
    // been on the page a while, if they haven't already interacted with it.
    setTimeout(() => {
      if (!chatOpenedOnce && !chatOpen) {
        chatToggle.classList.add('chat-hint');
        setTimeout(() => chatToggle.classList.remove('chat-hint'), 2600);
      }
    }, 12000);
  }

  /* ----------------------------------------------------------
     Animated testimonial slider — auto-advances, dot + arrow
     navigation, pauses on hover/focus, respects reduced motion.
  ---------------------------------------------------------- */
  const tSlider = document.getElementById('testimonialSlider');
  const tTrack = document.getElementById('testimonialTrack');
  if (tSlider && tTrack) {
    const slides = tTrack.children;
    const dots = document.querySelectorAll('#testimonialDots .t-dot');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    let idx = 0;
    let timer = null;

    function goTo(i) {
      idx = (i + slides.length) % slides.length;
      tTrack.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === idx));
    }
    function next() { goTo(idx + 1); }
    function prev() { goTo(idx - 1); }
    function startAuto() {
      if (reduceMotion) return;
      stopAuto();
      timer = setInterval(next, 5500);
    }
    function stopAuto() { if (timer) clearInterval(timer); timer = null; }

    dots.forEach((d, di) => d.addEventListener('click', () => { goTo(di); startAuto(); }));
    nextBtn && nextBtn.addEventListener('click', () => { next(); startAuto(); });
    prevBtn && prevBtn.addEventListener('click', () => { prev(); startAuto(); });
    tSlider.addEventListener('mouseenter', stopAuto);
    tSlider.addEventListener('mouseleave', startAuto);
    tSlider.addEventListener('focusin', stopAuto);
    tSlider.addEventListener('focusout', startAuto);

    goTo(0);
    startAuto();
  }

})();
