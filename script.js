/* =========================================================
   Muhammad AlHashmi — interactions
   Language toggle (EN/AR + RTL), header, menu, reveals
   ========================================================= */
(function () {
  'use strict';

  var body = document.body;
  var html = document.documentElement;

  /* ---------- Language toggle ---------- */
  var STORAGE_KEY = 'mah-lang';
  var langButtons = document.querySelectorAll('.lang-toggle button');

  function setLanguage(lang) {
    var isAr = lang === 'ar';
    body.classList.toggle('lang-ar', isAr);
    body.classList.toggle('lang-en', !isAr);
    html.setAttribute('lang', isAr ? 'ar' : 'en');
    html.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.title = isAr
      ? 'محمد الهاشمي — مستشار ابتكار'
      : 'Muhammad AlHashmi — Innovation Advisor';
    langButtons.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  langButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      setLanguage(b.getAttribute('data-lang'));
    });
  });

  // Initial language: stored preference, else browser hint, else English
  var initial = 'en';
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) initial = stored;
    else if ((navigator.language || '').toLowerCase().indexOf('ar') === 0) initial = 'ar';
  } catch (e) {}
  setLanguage(initial);

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    var y = new Date().getFullYear();
    if (y && !isNaN(y)) yearEl.textContent = y;
  }
})();
