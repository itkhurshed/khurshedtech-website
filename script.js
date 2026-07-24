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
