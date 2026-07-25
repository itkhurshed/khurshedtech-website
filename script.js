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

// AOS (Animate On Scroll) init — powers all data-aos="..." attributes across the page
if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });
}

// ---------- Dark / Light mode toggle ----------
const themeToggle = document.getElementById('theme-toggle');
const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggle) themeToggle.textContent = '🌙';
  }
};
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('kt-theme'); } catch (e) {}
  applyTheme(saved === 'dark' ? 'dark' : 'light');
})();
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('kt-theme', next); } catch (e) {}
  });
}

// ---------- Multi-language switcher (English / Arabic / French / Bangla / Hindi) ----------
// Translates nav, hero, footer and the promo-banner section. Other sections remain
// English-only for now — full-site translation across every section is a larger future phase.
const SUPPORTED_LANGS = ['en', 'ar', 'fr', 'bn', 'hi'];
const langSelect = document.getElementById('lang-select');
const applyLang = (lang) => {
  if (!SUPPORTED_LANGS.includes(lang)) lang = 'en';

  document.querySelectorAll('[data-en]').forEach((el) => {
    const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
    if (text) el.textContent = text;
  });

  document.querySelectorAll('.promo-banner-card').forEach((el) => {
    el.hidden = el.getAttribute('data-banner-lang') !== lang;
  });

  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
  document.documentElement.setAttribute('lang', lang);
  if (langSelect) langSelect.value = lang;
};
(function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('kt-lang'); } catch (e) {}
  applyLang(SUPPORTED_LANGS.includes(saved) ? saved : 'en');
})();
if (langSelect) {
  langSelect.addEventListener('change', () => {
    const next = langSelect.value;
    applyLang(next);
    try { localStorage.setItem('kt-lang', next); } catch (e) {}
  });
}

// Contact form -> opens WhatsApp with prefilled message (no backend required)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    const name = val('cf-name');
    const company = val('cf-company');
    const email = val('cf-email');
    const phone = val('cf-phone');
    const employees = val('cf-employees');
    const service = val('cf-service');
    const supportType = val('cf-support-type');
    const time = val('cf-time');
    const message = val('cf-message');
    const budget = val('cf-budget');

    const lines = [
      `Hello KhurshedTech, my name is ${name}.`,
      company && `Company: ${company}`,
      email && `Email: ${email}`,
      phone && `Phone: ${phone}`,
      employees && `Employees: ${employees}`,
      service && `Interested in: ${service}`,
      supportType && `Support type: ${supportType}`,
      time && `Preferred contact time: ${time}`,
      budget && `Estimated budget: ${budget}`,
      message && `Message: ${message}`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));

    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: 'Contact Form Submit',
      });
    }

    window.open(`https://wa.me/96566648706?text=${text}`, '_blank');

    const confirmationEl = document.getElementById('cf-confirmation');
    if (confirmationEl) confirmationEl.hidden = false;
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

// Scroll-reveal animations (fallback for sections not using AOS; harmless alongside AOS)
const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-left, .reveal-right, .reveal-zoom');
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

// Animated stat counters (run once, when the stats scroll into view)
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

// Analytics event tracking on WhatsApp / CTA / phone / email links.
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

// ---------- Quote calculator ----------
// Pure client-side estimate. Clearly labeled as an estimate, not a final quotation.
const calcSubmit = document.getElementById('calc-submit');
if (calcSubmit) {
  calcSubmit.addEventListener('click', () => {
    const users = parseInt(document.getElementById('calc-users').value, 10) || 1;
    const locations = parseInt(document.getElementById('calc-locations').value, 10) || 1;
    const onsiteVisits = parseInt(document.getElementById('calc-onsite').value, 10) || 0;
    const remote = document.getElementById('calc-remote').checked;
    const m365 = document.getElementById('calc-m365').checked;
    const server = document.getElementById('calc-server').checked;
    const network = document.getElementById('calc-network').checked;
    const security = document.getElementById('calc-security').checked;

    const resultBox = document.getElementById('calc-result');
    const rangeEl = document.getElementById('calc-range');

    // Enterprise: 40+ users routes straight to a custom quote, matching the
    // Starter (up to 20) / Business (up to 40) / Enterprise (custom) plan structure.
    if (users > 40) {
      if (rangeEl) rangeEl.textContent = 'Custom Enterprise pricing — contact us for a quote';
      if (resultBox) {
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (typeof gtag === 'function') {
        gtag('event', 'quote_calculated', { event_category: 'engagement', event_label: 'Enterprise (custom)' });
      }
      return;
    }

    // Base per-user cost (remote helpdesk baseline), aligned to Starter/Business tiers
    let low = users <= 5 ? 60 : users <= 20 ? 99 : 149;
    let high = low + 50;

    // Adjustments
    if (locations >= 2) { low += 20; high += 30; }
    if (locations >= 3) { low += 20; high += 30; }
    if (onsiteVisits >= 1) { low += 25; high += 40; }
    if (onsiteVisits >= 4) { low += 30; high += 50; }
    if (m365) { low += 15; high += 25; }
    if (server) { low += 30; high += 50; }
    if (network) { low += 15; high += 25; }
    if (security) { low += 25; high += 45; }
    if (!remote && onsiteVisits === 0) { low += 10; high += 10; }

    if (rangeEl) rangeEl.textContent = `${low}–${high} KWD / month (estimate)`;
    if (resultBox) {
      resultBox.hidden = false;
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (typeof gtag === 'function') {
      gtag('event', 'quote_calculated', {
        event_category: 'engagement',
        event_label: `${low}-${high} KWD`,
      });
    }
  });
}

const calcLeadForm = document.getElementById('calc-lead-form');
if (calcLeadForm) {
  calcLeadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('calc-name').value.trim();
    const company = document.getElementById('calc-company').value.trim();
    const email = document.getElementById('calc-email').value.trim();
    const whatsapp = document.getElementById('calc-whatsapp').value.trim();
    const range = document.getElementById('calc-range') ? document.getElementById('calc-range').textContent : '';

    const lines = [
      `Hello KhurshedTech, my name is ${name}.`,
      company && `Company: ${company}`,
      email && `Email: ${email}`,
      whatsapp && `WhatsApp: ${whatsapp}`,
      `I used the online calculator and got an estimate of: ${range}.`,
      `Please send me a confirmed quotation.`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));

    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: 'Quote Calculator Lead',
      });
    }

    window.open(`https://wa.me/96566648706?text=${text}`, '_blank');
  });
}

// ---------- Website cost calculator (website-design-services.html) ----------
// Pure client-side estimate, anchored to the real package prices shown on the page.
const wcalcSubmit = document.getElementById('wcalc-submit');
if (wcalcSubmit) {
  wcalcSubmit.addEventListener('click', () => {
    const type = document.getElementById('wcalc-type').value;
    const pages = parseInt(document.getElementById('wcalc-pages').value, 10) || 1;
    const multilang = document.getElementById('wcalc-multilang').checked;
    const booking = document.getElementById('wcalc-booking').checked;
    const seo = document.getElementById('wcalc-seo').checked;
    const content = document.getElementById('wcalc-content').checked;
    const logo = document.getElementById('wcalc-logo').checked;

    const resultBox = document.getElementById('wcalc-result');
    const rangeEl = document.getElementById('wcalc-range');

    if (type === 'enterprise') {
      if (rangeEl) rangeEl.textContent = 'Custom Enterprise pricing — contact us for a quote';
      if (resultBox) {
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (typeof gtag === 'function') {
        gtag('event', 'quote_calculated', { event_category: 'engagement', event_label: 'Website Enterprise (custom)' });
      }
      return;
    }

    // Base price + baseline page count, aligned to the real Starter/Basic/Standard/E-Commerce/Business Pro packages
    const plans = {
      landing:  { base: 79,  basePages: 1,  high: 129 },
      business: { base: 129, basePages: 5,  high: 199 },
      standard: { base: 199, basePages: 10, high: 349 },
      ecommerce:{ base: 349, basePages: 20, high: 499 },
      bookingpro:{ base: 499, basePages: 20, high: 599 },
    };
    const plan = plans[type] || plans.business;
    let low = plan.base;
    let high = plan.high;

    const extraPages = Math.max(0, pages - plan.basePages);
    low += extraPages * 8;
    high += extraPages * 12;

    if (multilang) { low += 40; high += 70; }
    if (booking) { low += 60; high += 100; }
    if (seo) { low += 30; high += 50; }
    if (content) { low += 15 * Math.min(pages, 20); high += 20 * Math.min(pages, 20); }
    if (logo) { low += 25; high += 40; }

    if (rangeEl) rangeEl.textContent = `${low}–${high} KWD (estimate)`;
    if (resultBox) {
      resultBox.hidden = false;
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (typeof gtag === 'function') {
      gtag('event', 'quote_calculated', {
        event_category: 'engagement',
        event_label: `Website ${low}-${high} KWD`,
      });
    }
  });
}

const wcalcLeadForm = document.getElementById('wcalc-lead-form');
if (wcalcLeadForm) {
  wcalcLeadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('wcalc-name').value.trim();
    const company = document.getElementById('wcalc-company').value.trim();
    const email = document.getElementById('wcalc-email').value.trim();
    const whatsapp = document.getElementById('wcalc-whatsapp').value.trim();
    const range = document.getElementById('wcalc-range') ? document.getElementById('wcalc-range').textContent : '';

    const lines = [
      `Hello KhurshedTech, my name is ${name}.`,
      company && `Company: ${company}`,
      email && `Email: ${email}`,
      whatsapp && `WhatsApp: ${whatsapp}`,
      `I used the website cost calculator and got an estimate of: ${range}.`,
      `Please send me a confirmed quotation.`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));

    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        event_category: 'engagement',
        event_label: 'Website Calculator Lead',
      });
    }

    window.open(`https://wa.me/96566648706?text=${text}`, '_blank');
  });
}
