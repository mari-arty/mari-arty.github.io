(() => {
  'use strict';

  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.navigation');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    navigation.classList.toggle('is-open', expanded);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);

  const dialog = document.querySelector('.lightbox');
  // Anchors retain their ordinary JPEG fallback in browsers without dialog support.
  if (typeof dialog.showModal !== 'function') return;
  const cards = [...document.querySelectorAll('[data-artwork]')];
  const image = dialog.querySelector('.viewer-image');
  const title = document.getElementById('viewer-title');
  const meta = document.getElementById('viewer-meta');
  const price = document.getElementById('viewer-price');
  const count = document.getElementById('viewer-count');
  const error = dialog.querySelector('.viewer-error');
  const loading = dialog.querySelector('.viewer-loading');
  const close = dialog.querySelector('.viewer-close');
  let current = 0;
  let returnFocus;

  function showArtwork(index) {
    current = (index + cards.length) % cards.length;
    const card = cards[current];
    const link = card.querySelector('.artwork-image');
    title.textContent = card.querySelector('h3').textContent;
    meta.textContent = `${card.querySelector('.artwork-medium').textContent} · ${card.querySelector('.artwork-size').textContent}`;
    price.textContent = card.querySelector('.artwork-price').textContent;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    image.alt = `${title.textContent} — Мария Кашмина`;
    error.hidden = true;
    loading.hidden = false;
    image.style.visibility = 'hidden';
    image.onload = () => {
      image.style.visibility = 'visible';
      loading.hidden = true;
    };
    error.querySelector('a').href = link.href;
    // Use the same-format JPEG if this browser cannot decode WebP.
    image.onerror = () => {
      if (image.src !== link.href) {
        image.src = link.href;
      } else {
        error.hidden = false;
        loading.hidden = true;
      }
    };
    image.src = link.dataset.full;
  }
  cards.forEach((card, index) => {
    card.querySelector('.artwork-image').addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      returnFocus = event.currentTarget;
      showArtwork(index);
      dialog.showModal();
      document.body.classList.add('viewer-open');
      close.focus();
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.querySelector('.viewer-prev').addEventListener('click', () => showArtwork(current - 1));
  dialog.querySelector('.viewer-next').addEventListener('click', () => showArtwork(current + 1));
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.classList.contains('viewer-image-wrap')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    returnFocus?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showArtwork(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button, a[href]')].filter(element => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
