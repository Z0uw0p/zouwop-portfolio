/*
 * js/main.js — renders content from js/data.js and wires up the interactivity:
 * the price board, the chairs, gallery, hours with an open/closed state, and
 * the mobile nav. Plain script, no build step, no dependencies.
 */
(function () {
  'use strict';

  var data = window.SITE_DATA || {
    site: {}, services: [], barbers: [], gallery: [], hours: [], notes: [], reviews: []
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

  /* Compute the open/closed state for `now`. `hours` is Monday-first; the
     browser's Date#getDay is Sunday-first, so the index is rotated. */
  function hoursState(hours, now) {
    var idx = (now.getDay() + 6) % 7; // Monday-first
    var mins = now.getHours() * 60 + now.getMinutes();
    var today = hours[idx];

    if (!today.closed) {
      var openMins = parseTime(today.opens);
      var closeMins = parseTime(today.closes);
      if (mins >= openMins && mins < closeMins) {
        return { open: true, label: 'Open now — closes at ' + fmtTime(today.closes) };
      }
      if (mins < openMins) {
        return { open: false, label: 'Closed — opens at ' + fmtTime(today.opens) };
      }
    }

    for (var i = 1; i <= 7; i++) {
      var next = hours[(idx + i) % 7];
      if (!next.closed) {
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
      else if (key === 'booking') el.setAttribute('href', site.bookingUrl);
    });
  }

  /* --- price board (rendered entirely from `services`) ------------------- */
  function renderPriceBoard() {
    var root = document.querySelector('[data-render="price-board"]');
    if (!root) return;
    root.innerHTML = (data.services || []).map(function (group, g) {
      var titleId = 'board-group-' + g;
      var items = (group.items || []).map(function (item) {
        return (
          '<li class="board-row">' +
            '<span class="board-item">' +
              '<span class="board-name">' + esc(item.name) + '</span>' +
              '<span class="board-desc">' + esc(item.description) + '</span>' +
            '</span>' +
            '<span class="board-price">' + esc(item.price) + '</span>' +
          '</li>'
        );
      }).join('');
      return (
        '<section class="board-group" aria-labelledby="' + titleId + '">' +
          '<h3 class="board-group-title" id="' + titleId + '">' + esc(group.group) + '</h3>' +
          '<ul class="board-list">' + items + '</ul>' +
        '</section>'
      );
    }).join('');
  }

  /* --- expanded services (services.html) ---------------------------------- */
  function renderServicesFull() {
    var root = document.querySelector('[data-render="services-full"]');
    if (!root) return;
    root.innerHTML = (data.services || []).map(function (group, g) {
      var titleId = 'svc-group-' + g;
      var items = (group.items || []).map(function (item) {
        return (
          '<li class="svc-row">' +
            '<div class="svc-main">' +
              '<h4 class="svc-name">' + esc(item.name) + '</h4>' +
              '<p class="svc-desc">' + esc(item.description) + '</p>' +
            '</div>' +
            '<span class="svc-price">' + esc(item.price) + '</span>' +
          '</li>'
        );
      }).join('');
      return (
        '<section class="svc-group" aria-labelledby="' + titleId + '">' +
          '<h3 class="svc-group-title" id="' + titleId + '">' + esc(group.group) + '</h3>' +
          '<ul class="svc-list">' + items + '</ul>' +
        '</section>'
      );
    }).join('');
  }

  /* --- the chairs ------------------------------------------------------- */
  function renderBarbers() {
    var root = document.querySelector('[data-render="barbers"]');
    if (!root) return;
    root.innerHTML = (data.barbers || []).map(function (barber, i) {
      var plate = 'assets/placeholder/chair-' + (i + 1) + '.svg';
      return (
        '<article class="chair-card">' +
          '<img src="' + esc(plate) + '" alt="Portrait plate for ' + esc(barber.name) + '" width="600" height="800">' +
          '<p class="chair-no">' + esc(barber.chair) + '</p>' +
          '<h3>' + esc(barber.name) + '</h3>' +
          '<p class="speciality">' + esc(barber.speciality) + '</p>' +
          '<a class="btn btn-brass" data-site-href="booking" href="' + esc(barber.bookingUrl) + '">Book ' + esc(barber.name) + '</a>' +
        '</article>'
      );
    }).join('');
  }

  /* --- gallery ---------------------------------------------------------- */
  function renderGallery() {
    var root = document.querySelector('[data-render="gallery"]');
    if (!root) return;
    root.innerHTML = (data.gallery || []).map(function (shot) {
      return (
        '<li class="gallery-item">' +
          '<img src="' + esc(shot.src) + '" alt="' + esc(shot.alt) + '" width="600" height="450">' +
        '</li>'
      );
    }).join('');
  }

  /* --- hours table + open state ------------------------------------------ */
  function renderHours() {
    var html = (data.hours || []).map(function (row) {
      var time = row.closed ? 'Closed' : esc(row.opens) + ' &ndash; ' + esc(row.closes);
      var dayCell = '<th scope="row">' + esc(row.day) + '</th>';
      if (row.closed) {
        return '<tr class="is-closed">' + dayCell + '<td><span class="hours-closed">Closed</span></td></tr>';
      }
      return '<tr>' + dayCell + '<td>' + esc(row.opens) + ' &ndash; ' + esc(row.closes) + '</td></tr>';
    }).join('');
    document.querySelectorAll('[data-render="hours"]').forEach(function (tbody) {
      tbody.innerHTML = html;
    });
  }

  function renderOpenState() {
    var el = document.querySelector('[data-open-state]');
    if (!el) return;
    var state = hoursState(data.hours || [], new Date());
    el.textContent = state.label;
    el.classList.toggle('is-open', state.open);
    el.classList.toggle('is-closed', !state.open);
  }

  /* --- house notes ------------------------------------------------------- */
  function renderNotes() {
    var root = document.querySelector('[data-render="notes"]');
    if (!root) return;
    root.innerHTML = (data.notes || []).map(function (note) {
      return '<li class="note"><h3>' + esc(note.title) + '</h3><p>' + esc(note.text) + '</p></li>';
    }).join('');
  }

  /* --- reviews (generic attributions only, no invented names) ------------ */
  function renderReviews() {
    var root = document.querySelector('[data-render="reviews"]');
    if (!root) return;
    root.innerHTML = (data.reviews || []).map(function (review) {
      return (
        '<article class="review">' +
          '<blockquote>' + esc(review.text) + '</blockquote>' +
          '<p class="source">' + esc(review.name) + '</p>' +
        '</article>'
      );
    }).join('');
  }

  /* --- socials ----------------------------------------------------------- */
  function renderSocials() {
    var root = document.querySelector('[data-render="socials"]');
    if (!root) return;
    root.innerHTML = (data.site.socials || []).map(function (social) {
      return '<li><a href="' + esc(social.href) + '">' + esc(social.handle) + '</a></li>';
    }).join('');
  }

  /* --- footer year ------------------------------------------------------- */
  function renderYear() {
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* --- mobile nav -------------------------------------------------------- */
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

  function init() {
    renderSite();
    renderPriceBoard();
    renderServicesFull();
    renderBarbers();
    renderGallery();
    renderHours();
    renderOpenState();
    renderNotes();
    renderReviews();
    renderSocials();
    renderYear();
    initNav();
  }

  /* Exposed for verification: lets a reviewer mock the clock and check the
     open/closed string without touching the DOM. */
  window.FADE = { hoursState: hoursState };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
