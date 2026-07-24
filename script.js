// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Contact form -> opens WhatsApp with prefilled message (no backend required)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const service = document.getElementById('cf-service').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const text = encodeURIComponent(
      `Hello KhurshedTech, my name is ${name}.\nInterested in: ${service}\nMessage: ${message}`
    );
    window.open(`https://wa.me/96566648706?text=${text}`, '_blank');
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Sticky header shadow on scroll
const siteHeader = document.querySelector('header');
if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Scroll-reveal animations (fade/slide in when a section enters the viewport)
const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger');
if (revealTargets.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('visible'));
}

// Animated stat counters (run once, when the hero stats scroll into view)
const counters = document.querySelectorAll('.counter');
if (counters.length) {
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }
}

// Analytics event tracking on WhatsApp / CTA buttons.
// Safe no-op until a real GA4 Measurement ID is added in index.html <head> —
// gtag() is only called if Google Analytics has actually loaded.
document.querySelectorAll('.track-cta').forEach((el) => {
  el.addEventListener('click', () => {
    const plan = el.getAttribute('data-plan') || 'Unknown CTA';
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: plan,
      });
    }
  });
});
