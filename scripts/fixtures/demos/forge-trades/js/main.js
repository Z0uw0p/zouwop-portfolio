/*
 * js/main.js — renders content from js/data.js and wires up the interactivity:
 * mobile nav, FAQ accordion, form validation and the footer year. Plain script,
 * no build step, no dependencies.
 */
(function () {
  'use strict';

  var data = window.SITE_DATA || { site: {}, stats: {}, services: [], areas: [], reviews: [], faq: [] };

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function telHref(phone) {
    return 'tel:+' + String(phone).replace(/\D/g, '');
  }

  /* --- site fields ------------------------------------------------------ */
  function renderSite() {
    var site = data.site || {};
    document.querySelectorAll('[data-site]').forEach(function (el) {
      var key = el.getAttribute('data-site');
      if (site[key] != null) el.textContent = site[key];
    });
    document.querySelectorAll('[data-site-href]').forEach(function (el) {
      var key = el.getAttribute('data-site-href');
      if (key === 'phone') el.setAttribute('href', telHref(site.phone));
      else if (key === 'email') el.setAttribute('href', 'mailto:' + site.email);
      else if (key === 'url') el.setAttribute('href', site.url);
      else if (key === 'booking') el.setAttribute('href', site.booking);
    });
  }

  /* --- hero trust stats -------------------------------------------------- */
  function renderStats() {
    var stats = data.stats || {};
    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var key = el.getAttribute('data-stat');
      if (stats[key] != null) el.textContent = stats[key];
    });
  }

  /* --- hours ------------------------------------------------------------ */
  function renderHours() {
    var hours = (data.site && data.site.hours) || [];
    var html = hours.map(function (row) {
      return '<tr><th scope="row">' + esc(row.days) + '</th><td>' + esc(row.time) + '</td></tr>';
    }).join('');
    document.querySelectorAll('[data-render="hours"]').forEach(function (tbody) {
      tbody.innerHTML = html;
    });
  }

  /* --- services --------------------------------------------------------- */
  function renderServices() {
    var root = document.querySelector('[data-render="services"]');
    if (!root) return;
    root.innerHTML = (data.services || []).map(function (s) {
      return (
        '<article class="card" role="listitem">' +
          '<img src="' + esc(s.icon) + '" alt="' + esc(s.name) + ' icon" width="48" height="48">' +
          '<h3>' + esc(s.name) + '</h3>' +
          '<p class="line">' + esc(s.line) + '</p>' +
          '<a class="card-link" href="services.html#' + esc(s.id) + '">Details</a>' +
        '</article>'
      );
    }).join('');
  }

  function renderServicesFull() {
    var root = document.querySelector('[data-render="services-full"]');
    if (!root) return;
    root.innerHTML = (data.services || []).map(function (s) {
      return (
        '<article class="card" id="' + esc(s.id) + '">' +
          '<img src="' + esc(s.icon) + '" alt="' + esc(s.name) + ' icon" width="48" height="48">' +
          '<h3>' + esc(s.name) + '</h3>' +
          '<p class="line">' + esc(s.line) + '</p>' +
          '<p class="mt-1"><strong>Included:</strong> ' + esc(s.included) + '</p>' +
          '<p><strong>Turnaround:</strong> ' + esc(s.turnaround) + '</p>' +
          '<p><strong>Starting price:</strong> ' + esc(s.price) + '</p>' +
          '<a class="btn btn-signal mt-1" href="contact.html">Get a quote</a>' +
        '</article>'
      );
    }).join('');
  }

  /* --- service area ----------------------------------------------------- */
  function renderAreas() {
    var html = (data.areas || []).map(function (town) {
      return '<li>' + esc(town) + '</li>';
    }).join('');
    document.querySelectorAll('[data-render="areas"]').forEach(function (list) {
      list.innerHTML = html;
    });
  }

  /* --- reviews ---------------------------------------------------------- */
  function renderReviews() {
    var root = document.querySelector('[data-render="reviews"]');
    if (!root) return;
    root.innerHTML = (data.reviews || []).map(function (r) {
      return (
        '<article class="review">' +
          '<p class="review-label">Review</p>' +
          '<blockquote>' + esc(r.text) + '</blockquote>' +
          '<p class="source">' + esc(r.source) + '</p>' +
        '</article>'
      );
    }).join('');
  }

  /* --- FAQ accordion ---------------------------------------------------- */
  function renderFaq() {
    var root = document.querySelector('[data-render="faq"]');
    if (!root) return;
    root.innerHTML = (data.faq || []).map(function (item, i) {
      return (
        '<div class="acc-item">' +
          '<h3>' +
            '<button class="acc-trigger" type="button" id="faq-btn-' + i + '" aria-expanded="false" aria-controls="faq-panel-' + i + '">' +
              esc(item.q) + '<span class="indicator" aria-hidden="true">+</span>' +
            '</button>' +
          '</h3>' +
          '<div class="acc-panel" id="faq-panel-' + i + '" role="region" aria-labelledby="faq-btn-' + i + '">' +
            '<p>' + esc(item.a) + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function initAccordion() {
    var root = document.querySelector('[data-render="faq"]');
    if (!root) return;
    var triggers = Array.prototype.slice.call(root.querySelectorAll('.acc-trigger'));
    var items = Array.prototype.slice.call(root.querySelectorAll('.acc-item'));

    function closeAll() {
      items.forEach(function (item) {
        item.classList.remove('is-open');
      });
      triggers.forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
      });
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () {
        var item = trigger.closest('.acc-item');
        var wasOpen = trigger.getAttribute('aria-expanded') === 'true';
        closeAll();
        if (!wasOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      trigger.addEventListener('keydown', function (event) {
        var keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (keys.indexOf(event.key) === -1) return;
        event.preventDefault();
        var target;
        if (event.key === 'ArrowDown') target = triggers[(index + 1) % triggers.length];
        else if (event.key === 'ArrowUp') target = triggers[(index - 1 + triggers.length) % triggers.length];
        else if (event.key === 'Home') target = triggers[0];
        else if (event.key === 'End') target = triggers[triggers.length - 1];
        target.focus();
      });
    });
  }

  /* --- mobile nav ------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* --- form validation -------------------------------------------------- */
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    var errorId = field.id + '-error';
    var error = field.parentElement.querySelector('.field-error');
    if (!error) {
      error = document.createElement('p');
      error.className = 'field-error';
      error.id = errorId;
      field.parentElement.appendChild(error);
    }
    error.textContent = message;
    var described = field.getAttribute('aria-describedby');
    if (!described) {
      field.setAttribute('aria-describedby', errorId);
    }
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    var error = field.parentElement.querySelector('.field-error');
    if (error) error.remove();
    var described = field.getAttribute('aria-describedby');
    if (described === field.id + '-error') field.removeAttribute('aria-describedby');
  }

  function initForms() {
    document.querySelectorAll('form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var valid = true;
        var required = form.querySelectorAll('[required]');
        required.forEach(function (field) {
          clearError(field);
          if (!field.value.trim()) {
            setError(field, 'This field is required.');
            valid = false;
          }
        });

        var email = form.querySelector('input[type="email"]');
        if (email && email.value.trim() && !isValidEmail(email.value.trim())) {
          setError(email, 'Enter a valid email address.');
          valid = false;
        }

        if (!valid) {
          var firstError = form.querySelector('.field-error');
          if (firstError) {
            var field = firstError.closest('.field').querySelector('input, select, textarea');
            if (field) field.focus();
          }
          return;
        }

        form.reset();
        var success = document.getElementById('quote-success');
        if (success) {
          success.classList.add('is-visible');
          success.focus();
        }
      });

      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        field.addEventListener('input', function () {
          if (field.hasAttribute('aria-invalid')) clearError(field);
        });
        field.addEventListener('change', function () {
          if (field.hasAttribute('aria-invalid')) clearError(field);
        });
      });
    });
  }

  /* --- footer year ------------------------------------------------------ */
  function renderYear() {
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function init() {
    renderSite();
    renderStats();
    renderHours();
    renderServices();
    renderServicesFull();
    renderAreas();
    renderReviews();
    renderFaq();
    renderYear();
    initAccordion();
    initNav();
    initForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
