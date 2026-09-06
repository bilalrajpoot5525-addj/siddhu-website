const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const revealItems = document.querySelectorAll('.reveal');
const yearEl = document.getElementById('year');
const contactForm = document.querySelector('.contact-card');
const faqItems = document.querySelectorAll('.faq-item');
const assetImages = document.querySelectorAll('img[data-asset-key]');
const propertyCards = [...document.querySelectorAll('.property-card[data-property-id]')];
const propertySearch = document.getElementById('property-search');
const propertyTypeFilter = document.getElementById('property-type-filter');
const propertyPriceFilter = document.getElementById('property-price-filter');
const propertySizeFilter = document.getElementById('property-size-filter');
const searchButton = document.getElementById('search-properties');
const searchResultCount = document.getElementById('search-result-count');
const propertyModal = document.getElementById('property-modal');
const modalImage = document.getElementById('modal-property-image');
const modalThumbs = document.getElementById('modal-gallery-thumbs');
const calculator = document.getElementById('installment-calculator');

assetImages.forEach((image) => {
  const fallbackSource = image.src;
  const localSource = `assets/${image.dataset.assetKey}.jpg`;

  image.addEventListener('error', () => {
    image.src = fallbackSource;
  }, { once: true });

  image.src = localSource;
});

const propertyPhotoSets = {
  'house-5-marla': ['images/5_marla_house.jpg', 'images/signature_residence.jpg', 'images/contemporary_living.jpg'],
  'residential-plot': ['images/signature_residence.jpg', 'images/5_marla_house.jpg', 'images/contemporary_living.jpg'],
  'commercial-shop': ['images/contemporary_living.jpg', 'images/signature_residence.jpg', 'images/5_marla_house.jpg'],
  'agricultural-land': ['images/contemporary_living.jpg', 'images/5_marla_house.jpg'],
  'commercial-property': ['images/signature_residence.jpg', 'images/contemporary_living.jpg']
};

const formatLac = (amount) => `PKR ${amount.toFixed(2)} Lac`;

const getSavedProperties = () => {
  try {
    return JSON.parse(localStorage.getItem('siddhu-favorites') || '[]');
  } catch (error) {
    return [];
  }
};

const saveFavorites = (favorites) => {
  localStorage.setItem('siddhu-favorites', JSON.stringify(favorites));
};

const updateFavoriteButton = (button, isSaved) => {
  button.classList.toggle('is-saved', isSaved);
  button.setAttribute('aria-pressed', String(isSaved));
  button.querySelector('i').className = isSaved ? 'fas fa-heart' : 'far fa-heart';
};

document.querySelectorAll('.favorite-button').forEach((button) => {
  const card = button.closest('.property-card');
  const propertyId = card.dataset.propertyId;
  updateFavoriteButton(button, getSavedProperties().includes(propertyId));

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const favorites = getSavedProperties();
    const isSaved = favorites.includes(propertyId);
    const nextFavorites = isSaved ? favorites.filter((id) => id !== propertyId) : [...favorites, propertyId];
    saveFavorites(nextFavorites);
    updateFavoriteButton(button, !isSaved);
  });
});

const matchesPrice = (price, range) => {
  if (range === 'under-25') return price < 25;
  if (range === '25-60') return price >= 25 && price <= 60;
  if (range === 'over-60') return price > 60;
  return true;
};

const applyPropertyFilters = () => {
  const query = (propertySearch?.value || '').trim().toLowerCase();
  const type = propertyTypeFilter?.value || 'all';
  const priceRange = propertyPriceFilter?.value || 'all';
  const size = propertySizeFilter?.value || 'all';
  let visibleCount = 0;

  propertyCards.forEach((card) => {
    const searchableText = `${card.dataset.propertyTitle} ${card.dataset.propertyLocation} ${card.dataset.propertyType}`.toLowerCase();
    const isMatch = (!query || searchableText.includes(query))
      && (type === 'all' || card.dataset.propertyType === type)
      && matchesPrice(Number(card.dataset.propertyPrice), priceRange)
      && (size === 'all' || card.dataset.propertySize === size);

    card.hidden = !isMatch;
    if (isMatch) visibleCount += 1;
  });

  if (searchResultCount) {
    searchResultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'property' : 'properties'} available`;
  }
};

[propertySearch, propertyTypeFilter, propertyPriceFilter, propertySizeFilter].forEach((control) => {
  control?.addEventListener('input', applyPropertyFilters);
  control?.addEventListener('change', applyPropertyFilters);
});

searchButton?.addEventListener('click', () => {
  applyPropertyFilters();
  document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const updateModalGallery = (propertyId, title) => {
  const photos = propertyPhotoSets[propertyId] || ['images/contemporary_living.jpg'];
  modalImage.src = photos[0];
  modalImage.alt = title;
  modalThumbs.innerHTML = photos.map((photo, index) => `
    <button class="modal-thumb${index === 0 ? ' is-active' : ''}" type="button" data-photo="${photo}" aria-label="View photo ${index + 1}">
      <img src="${photo}" alt="" />
    </button>
  `).join('');

  modalThumbs.querySelectorAll('.modal-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      modalImage.src = thumb.dataset.photo;
      modalThumbs.querySelectorAll('.modal-thumb').forEach((item) => item.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });
};

const openPropertyModal = (card) => {
  const data = card.dataset;
  document.getElementById('modal-property-title').textContent = data.propertyTitle;
  document.getElementById('modal-property-location').textContent = data.propertyLocation;
  document.getElementById('modal-property-description').textContent = data.propertyDescription;
  document.getElementById('modal-property-specs').innerHTML = [
    `PKR ${data.propertyPrice} Lac`,
    data.propertySize.replace('-', ' '),
    data.propertyBeds,
    data.propertyBaths
  ].map((spec) => `<span>${spec}</span>`).join('');
  document.getElementById('modal-property-features').innerHTML = data.propertyFeatures
    .split('|')
    .map((feature) => `<span>${feature}</span>`)
    .join('');
  document.getElementById('modal-whatsapp-link').href = `https://wa.me/923063996764?text=${encodeURIComponent(`Hello Naeem, I want details about ${data.propertyTitle}.`)}`;
  updateModalGallery(data.propertyId, data.propertyTitle);
  propertyModal.classList.add('is-open');
  propertyModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
};

propertyCards.forEach((card) => {
  card.querySelector('.view-details')?.addEventListener('click', () => openPropertyModal(card));
});

document.querySelectorAll('[data-modal-close]').forEach((control) => {
  control.addEventListener('click', () => {
    propertyModal.classList.remove('is-open');
    propertyModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && propertyModal?.classList.contains('is-open')) {
    propertyModal.querySelector('[data-modal-close]').click();
  }
});

const updateCalculator = () => {
  if (!calculator) return;
  const price = Number(document.getElementById('calculator-price').value) || 0;
  const downPaymentPercent = Number(document.getElementById('calculator-down-payment').value) || 0;
  const duration = Number(document.getElementById('calculator-duration').value) || 1;
  const downPayment = price * (downPaymentPercent / 100);
  const monthly = (price - downPayment) / duration;
  document.getElementById('calculator-down-result').textContent = formatLac(downPayment);
  document.getElementById('calculator-monthly-result').textContent = formatLac(monthly);
};

calculator?.querySelectorAll('input, select').forEach((control) => {
  control.addEventListener('input', updateCalculator);
  control.addEventListener('change', updateCalculator);
});
updateCalculator();

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

const faqToggle = document.querySelector('.faq-toggle');
const faqVisibleLimit = 5;

const syncFaqAnswerHeights = () => {
  faqItems.forEach((item) => {
    const answer = item.querySelector('.faq-answer');
    const question = item.querySelector('.faq-question');
    if (!answer || !question) return;

    if (item.classList.contains('active')) {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      question.setAttribute('aria-expanded', 'true');
    } else {
      answer.style.maxHeight = '0px';
      question.setAttribute('aria-expanded', 'false');
    }
  });
};

const updateFaqVisibility = () => {
  const showAll = faqToggle?.dataset.mode === 'all';
  faqItems.forEach((item, index) => {
    const isVisible = showAll ? true : index < faqVisibleLimit;
    item.classList.toggle('is-hidden', !isVisible);
  });

  if (faqToggle) {
    faqToggle.textContent = showAll ? 'Show less FAQs' : 'View more FAQs';
    faqToggle.setAttribute('aria-expanded', String(showAll));
  }

  syncFaqAnswerHeights();
};

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  const closeButton = item.querySelector('.faq-close');
  const answer = item.querySelector('.faq-answer');

  if (!button || !answer) return;

  button.addEventListener('click', () => {
    const shouldOpen = !item.classList.contains('active');

    faqItems.forEach((faq) => {
      faq.classList.remove('active');
    });

    if (shouldOpen) {
      item.classList.add('active');
    }

    syncFaqAnswerHeights();
  });

  closeButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    item.classList.remove('active');
    syncFaqAnswerHeights();
  });
});

faqToggle?.addEventListener('click', () => {
  const nextMode = faqToggle.dataset.mode === 'all' ? 'more' : 'all';
  faqToggle.dataset.mode = nextMode;
  updateFaqVisibility();
});

updateFaqVisibility();

document.addEventListener('click', (event) => {
  const clickedInsideFaq = event.target.closest('.faq-item');
  if (!clickedInsideFaq) {
    faqItems.forEach((faq) => faq.classList.remove('active'));
    syncFaqAnswerHeights();
  }
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
