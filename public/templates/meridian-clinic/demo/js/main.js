/*
 * js/main.js — renders content from js/data.js and wires up the interactivity:
 * the services, team, hours with a live open/closed state, the FAQ accordion,
 * the appointment form validation, Schema.org structured data and the footer
 * year. Plain script, no build step, no dependencies.
 */
(function () {
  'use strict';

  var data = window.SITE_DATA || {
    site: {}, hours: [], services: [], team: [], testimonials: [], faq: []
  };

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function telHref(phone) {
    return 'tel:+' + String(phone).replace(/\D/g, '');
  }

  /* --- time helpers (used by the hours open/closed state) --------------- */
  function parseTime(value) {
    var parts = String(value).split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function fmtTime(value) {
    var parts = String(value).split(':');
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    return h12 + ':' + m + ' ' + ampm;
  }

  /*
   * Compute the open/closed state for `now`. `hours` is Monday-first; the
   * browser's Date#getDay is Sunday-first, so the index is rotated. The result
   * is a plain-text string so the state is never signalled by colour alone.
   */
  function hoursState(hours, now) {
    var idx = (now.getDay() + 6) % 7; // Monday-first
    var mins = now.getHours() * 60 + now.getMinutes();
    var today = hours[idx];

    if (today && !today.closed) {
      var openMins = parseTime(today.opens);
      var closeMins = parseTime(today.closes);
      if (mins >= openMins && mins < closeMins) {
        return { open: true, label: 'Open now — closes at ' + fmtTime(today.closes) };
      }
      if (mins < openMins) {
        return { open: false, label: 'Closed — opens today at ' + fmtTime(today.opens) };
      }
    }

    for (var i = 1; i <= 7; i++) {
      var next = hours[(idx + i) % 7];
      if (next && !next.closed) {
        var dayLabel = i === 1 ? 'tomorrow' : next.day;
        return { open: false, label: 'Closed — opens ' + dayLabel + ' at ' + fmtTime(next.opens) };
      }
    }
    return { open: false, label: 'Closed' };
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

  /* --- hours table + live open/closed state ----------------------------- */
  function renderHours() {
    var html = (data.hours || []).map(function (row) {
      var dayCell = '<th scope="row">' + esc(row.day) + '</th>';
      if (row.closed) {
        return '<tr>' + dayCell + '<td><span class="hours-value">Closed</span></td></tr>';
      }
      return '<tr>' + dayCell + '<td><span class="hours-value">' + esc(row.opens) + ' &ndash; ' + esc(row.closes) + '</span></td></tr>';
    }).join('');
    document.querySelectorAll('[data-render="hours"]').forEach(function (tbody) {
      tbody.innerHTML = html;
    });
  }

  function renderOpenState() {
    var els = document.querySelectorAll('[data-open-state]');
    if (!els.length) return;
    var state = hoursState(data.hours || [], new Date());
    els.forEach(function (el) {
      el.textContent = state.label;
    });
  }

  /* --- services --------------------------------------------------------- */
  function renderServices() {
    var root = document.querySelector('[data-render="services"]');
    if (!root) return;
    root.innerHTML = (data.services || []).map(function (s) {
      return (
        '<li class="card service-card">' +
          '<img src="' + esc(s.icon) + '" alt="' + esc(s.name) + ' icon" width="48" height="48">' +
          '<h3>' + esc(s.name) + '</h3>' +
          '<p class="line">' + esc(s.line) + '</p>' +
          '<a class="card-link" href="#' + esc(s.id) + '">What to expect <span class="visually-hidden">for ' + esc(s.name) + '</span></a>' +
        '</li>'
      );
    }).join('');
  }

  function renderServiceDetails() {
    var root = document.querySelector('[data-render="service-details"]');
    if (!root) return;
    root.innerHTML = (data.services || []).map(function (s) {
      return (
        '<article class="service-detail" id="' + esc(s.id) + '">' +
          '<img src="' + esc(s.icon) + '" alt="' + esc(s.name) + ' icon" width="48" height="48">' +
          '<h3>' + esc(s.name) + '</h3>' +
          '<p>' + esc(s.detail) + '</p>' +
          '<p><strong>What to expect:</strong> ' + esc(s.whatToExpect) + '</p>' +
          '<a class="btn" href="appointments.html">Request an appointment</a>' +
        '</article>'
      );
    }).join('');
  }

  /* --- team ------------------------------------------------------------- */
  function renderTeam() {
    var root = document.querySelector('[data-render="team"]');
    if (!root) return;
    root.innerHTML = (data.team || []).map(function (m) {
      return (
        '<li class="card team-card">' +
          '<img class="portrait" src="' + esc(m.photo) + '" alt="Portrait of ' + esc(m.name) + '" width="600" height="400">' +
          '<h3>' + esc(m.name) + '</h3>' +
          '<p class="role">' + esc(m.role) + '</p>' +
          '<p class="credentials">' + esc(m.credentials) + '</p>' +
        '</li>'
      );
    }).join('');
  }

  function renderServiceOptions() {
    var select = document.getElementById('ap-service');
    if (!select) return;
    var options = (data.services || []).map(function (s) {
      return '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>';
    }).join('');
    select.innerHTML = '<option value="">Choose a service&hellip;</option>' + options;
  }

  /* --- testimonials ----------------------------------------------------- */
  function renderTestimonials() {
    var root = document.querySelector('[data-render="testimonials"]');
    if (!root) return;
    root.innerHTML = (data.testimonials || []).map(function (t) {
      return (
        '<li class="review">' +
          '<blockquote>' + esc(t.text) + '</blockquote>' +
          '<p class="source">' + esc(t.source) + '</p>' +
        '</li>'
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
      toggle.textContent = open ? 'Close menu' : 'Menu';
    });
  }

  /* --- form validation -------------------------------------------------- */
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    var errorId = field.id + '-error';
    var wrap = field.closest('.field') || field.parentElement;
    var error = wrap.querySelector('.field-error');
    if (!error) {
      error = document.createElement('p');
      error.className = 'field-error';
      error.id = errorId;
      error.setAttribute('role', 'alert');
      wrap.appendChild(error);
    }
    error.textContent = message;
    var described = field.getAttribute('aria-describedby');
    if (!described) {
      field.setAttribute('aria-describedby', errorId);
    }
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    var wrap = field.closest('.field') || field.parentElement;
    var error = wrap.querySelector('.field-error');
    if (error) error.remove();
    var described = field.getAttribute('aria-describedby');
    if (described === field.id + '-error') field.removeAttribute('aria-describedby');
  }

  function initForm() {
    var form = document.getElementById('appointment-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var valid = true;
      var required = form.querySelectorAll('[required]');
      required.forEach(function (field) {
        clearError(field);
        if (field.type === 'checkbox' && !field.checked) {
          setError(field, 'You need to confirm before we can process the request.');
          valid = false;
        } else if (field.type !== 'checkbox' && !field.value.trim()) {
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

      form.hidden = true;
      var success = document.getElementById('appointment-success');
      if (success) {
        success.hidden = false;
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
  }

  /* --- Schema.org structured data --------------------------------------- */
  function renderJsonLd() {
    var site = data.site || {};
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: site.name,
      description: site.descriptor,
      telephone: site.phone,
      email: site.email,
      url: site.url,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address
      },
      openingHoursSpecification: (data.hours || [])
        .filter(function (h) { return !h.closed; })
        .map(function (h) {
          return {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'https://schema.org/' + h.day,
            opens: h.opens,
            closes: h.closes
          };
        })
    };
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  }

  /* --- footer year ------------------------------------------------------ */
  function renderYear() {
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function init() {
    renderSite();
    renderHours();
    renderOpenState();
    renderServices();
    renderServiceDetails();
    renderServiceOptions();
    renderTeam();
    renderTestimonials();
    renderFaq();
    renderJsonLd();
    renderYear();
    initAccordion();
    initNav();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose the state helper for the audit's mocked-time checks. */
  window.MERIDIAN_CLINIC = { hoursState: hoursState };
})();
