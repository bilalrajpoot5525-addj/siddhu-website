const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const revealItems = document.querySelectorAll('.reveal');
const yearEl = document.getElementById('year');
const contactForm = document.querySelector('.contact-card');
const faqItems = document.querySelectorAll('.faq-item');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (header) {
      header.classList.remove('nav-open');
    }
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  if (!button) return;

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');

    faqItems.forEach((faq) => {
      faq.classList.remove('active');
    });

    if (!isOpen) {
      item.classList.add('active');
    }
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.textContent = 'Inquiry Sent';
    submitButton.disabled = true;

    setTimeout(() => {
      contactForm.reset();
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      alert('Thank you for contacting SIDDHU. We will get back to you shortly with property guidance.');
    }, 1200);
  });
}
