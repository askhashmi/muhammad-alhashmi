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

  // English-only for now. Arabic content remains in the markup (hidden) and the
  // toggle is hidden via CSS, so it can be re-enabled later by restoring the
  // stored/browser-preference logic below.
  setLanguage('en');

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

  /* =========================================================
     ADVISORY ENQUIRY MODAL + FORM
     ========================================================= */

  // Formspree endpoint — created at https://formspree.io
  var FORM_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_FORM_ID';

  var overlay = document.getElementById('leadModal');
  if (overlay) {
    var modalClose = document.getElementById('modalClose');
    var form = document.getElementById('leadForm');
    var successBox = document.getElementById('leadSuccess');
    var statusEl = document.getElementById('lfStatus');
    var submitBtn = document.getElementById('lfSubmit');
    var submitLabel = submitBtn ? submitBtn.querySelector('.lf-label') : null;
    var serviceSel = document.getElementById('lf-service');
    var lastFocused = null;

    function openModal(presetService) {
      lastFocused = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (presetService && serviceSel) {
        for (var i = 0; i < serviceSel.options.length; i++) {
          if (serviceSel.options[i].value === presetService || serviceSel.options[i].text === presetService) {
            serviceSel.selectedIndex = i; break;
          }
        }
      }
      var firstField = document.getElementById('lf-name');
      if (firstField) setTimeout(function () { firstField.focus(); }, 120);
    }
    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // Open triggers
    document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(btn.getAttribute('data-service'));
      });
    });
    if (modalClose) modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    // Submit
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        statusEl.textContent = '';
        statusEl.classList.remove('err');

        // Basic validation
        var valid = true;
        ['lf-name', 'lf-email', 'lf-phone', 'lf-service'].forEach(function (id) {
          var el = document.getElementById(id);
          var wrap = el.closest('.field');
          if (!el.value || (el.type === 'email' && el.validity && !el.validity.valid)) {
            valid = false; if (wrap) wrap.classList.add('error');
          } else if (wrap) { wrap.classList.remove('error'); }
        });
        if (!valid) {
          statusEl.textContent = 'Please complete the required fields.';
          statusEl.classList.add('err');
          return;
        }

        if (FORM_ENDPOINT.indexOf('REPLACE_WITH_FORM_ID') !== -1) {
          statusEl.textContent = 'Form is not connected yet. Please email me@askhashmi.com.';
          statusEl.classList.add('err');
          return;
        }

        submitBtn.setAttribute('disabled', 'true');
        if (submitLabel) submitLabel.textContent = 'Sending…';

        var data = new FormData(form);
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(function (res) {
          if (res.ok) {
            form.hidden = true;
            if (successBox) successBox.hidden = false;
          } else {
            return res.json().then(function (d) {
              throw new Error((d && d.errors && d.errors[0] && d.errors[0].message) || 'Submission failed');
            });
          }
        }).catch(function () {
          statusEl.textContent = 'Something went wrong. Please try again or email me@askhashmi.com.';
          statusEl.classList.add('err');
        }).then(function () {
          submitBtn.removeAttribute('disabled');
          if (submitLabel) submitLabel.textContent = 'Send request';
        });
      });
    }
  }
})();
