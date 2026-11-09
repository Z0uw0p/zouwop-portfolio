/*
 * js/main.js — renders content from js/data.js and wires up the interactivity:
 * releases, tour dates, quotes, bios, the sticky listen bar, copy-link and
 * contact-form validation. Plain script, no build step, no dependencies.
 */
(function () {
  'use strict';

  var data = window.SITE_DATA || { site: {}, releases: [], tour: [], quotes: [], bios: {}, pressKit: {} };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return String(iso || '');
    var day = String(parseInt(m[3], 10));
    return day + ' ' + MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1];
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
      if (key === 'email') el.setAttribute('href', 'mailto:' + site.email);
      else if (key === 'phone') el.setAttribute('href', 'tel:' + String(site.phone).replace(/[^\d+]/g, ''));
      else if (key === 'url') el.setAttribute('href', site.url);
      else if (key === 'booking') el.setAttribute('href', site.booking);
      else if (key === 'listenUrl') el.setAttribute('href', site.listenUrl);
    });
  }

  /* --- releases --------------------------------------------------------- */
  var LINK_LABELS = { spotify: 'Spotify', apple: 'Apple Music', bandcamp: 'Bandcamp', youtube: 'YouTube' };

  function releaseLinks(links) {
    return Object.keys(LINK_LABELS).map(function (key) {
      var url = (links && links[key]) || '';
      if (url) {
        return '<a class="chip" href="' + esc(url) + '">' + LINK_LABELS[key] + '</a>';
      }
      return '<span class="chip chip-disabled" aria-disabled="true" title="Not available">' + LINK_LABELS[key] + '</span>';
    }).join('');
  }

  function renderLatest() {
    var root = document.querySelector('[data-render="latest"]');
    if (!root) return;
    var r = (data.releases || [])[0];
    if (!r) return;
    root.innerHTML =
      '<div class="latest-art">' +
        '<img src="' + esc(r.cover) + '" alt="Cover art for ' + esc(r.title) + '" width="600" height="600">' +
      '</div>' +
      '<div class="latest-meta">' +
        '<p class="kicker">Latest release</p>' +
        '<h2 class="latest-title">' + esc(r.title) + '</h2>' +
        '<p class="latest-sub">' + esc(r.type) + ' &middot; ' + esc(r.year) + '</p>' +
        '<div class="chip-row">' + releaseLinks(r.links) + '</div>' +
      '</div>';
  }

  function renderReleases() {
    var root = document.querySelector('[data-render="releases"]');
    if (!root) return;
    var rest = (data.releases || []).slice(1);
    root.innerHTML = rest.map(function (r) {
      return (
        '<article class="release">' +
          '<img src="' + esc(r.cover) + '" alt="Cover art for ' + esc(r.title) + '" width="600" height="600" loading="lazy">' +
          '<h3>' + esc(r.title) + '</h3>' +
          '<p class="release-sub">' + esc(r.type) + ' &middot; ' + esc(r.year) + '</p>' +
          '<div class="chip-row">' + releaseLinks(r.links) + '</div>' +
        '</article>'
      );
    }).join('');
  }

  /* --- tour ------------------------------------------------------------- */
  function tourRow(r) {
    var date = formatDate(r.date);
    var sold = r.status === 'sold-out';
    var action;
    if (sold) {
      action = '<span class="btn btn-outline is-disabled" aria-disabled="true">Sold out</span>';
    } else if (r.status === 'announced') {
      action = '<span class="btn btn-outline is-disabled" aria-disabled="true">Announced</span>';
    } else if (r.ticketUrl) {
      action = '<a class="btn btn-outline" href="' + esc(r.ticketUrl) + '">Tickets</a>';
    } else {
      action = '<span class="btn btn-outline is-disabled" aria-disabled="true">Tickets</span>';
    }
    return (
      '<li class="tour-row' + (sold ? ' is-sold' : '') + '">' +
        '<time class="tour-date" datetime="' + esc(r.date) + '">' + esc(date) + '</time>' +
        '<span class="tour-city">' + esc(r.city) + '</span>' +
        '<span class="tour-venue">' + esc(r.venue) + '</span>' +
        '<span class="tour-action">' + action + '</span>' +
      '</li>'
    );
  }

  function renderTour() {
    var root = document.querySelector('[data-render="tour"]');
    if (!root) return;
    var tour = data.tour || [];
    var onSale = tour.filter(function (r) { return r.status === 'on-sale'; });
    var announced = tour.filter(function (r) { return r.status === 'announced'; });
    var soldOut = tour.filter(function (r) { return r.status === 'sold-out'; });

    var html = '';
    if (onSale.length) {
      html += '<h3 class="tour-group">On sale</h3><ul class="tour-list">' + onSale.map(tourRow).join('') + '</ul>';
    }
    if (announced.length) {
      html += '<h3 class="tour-group">Announced</h3><ul class="tour-list">' + announced.map(tourRow).join('') + '</ul>';
    }
    if (soldOut.length) {
      html += '<h3 class="tour-group">Sold out</h3><ul class="tour-list">' + soldOut.map(tourRow).join('') + '</ul>';
    }
    root.innerHTML = html;
  }

  /* --- quotes ----------------------------------------------------------- */
  function renderQuotes() {
    var root = document.querySelector('[data-render="quotes"]');
    if (!root) return;
    root.innerHTML = (data.quotes || []).map(function (q) {
      return (
        '<blockquote class="quote">' +
          '<p>' + esc(q.text) + '</p>' +
          '<footer>' + esc(q.source) + '</footer>' +
        '</blockquote>'
      );
    }).join('');
  }

  /* --- bios ------------------------------------------------------------- */
  function renderBios() {
    var site = data.site || {};
    document.querySelectorAll('[data-render="bio-short"]').forEach(function (el) {
      el.textContent = (data.bios && data.bios.short) || '';
    });
    document.querySelectorAll('[data-render="bio-long"]').forEach(function (el) {
      var long = (data.bios && data.bios.long) || '';
      el.innerHTML = long.split(/\n\s*\n/).map(function (p) {
        return '<p>' + esc(p) + '</p>';
      }).join('');
    });
    document.querySelectorAll('[data-render="socials"]').forEach(function (el) {
      el.innerHTML = (site.socials || []).map(function (s) {
        return '<li><a href="' + esc(s.href) + '">' + esc(s.label) + ' <span class="mono">' + esc(s.handle) + '</span></a></li>';
      }).join('');
    });
  }

  /* --- press kit -------------------------------------------------------- */
  function renderPressKit() {
    var photos = (data.pressKit && data.pressKit.photos) || [];
    var root = document.querySelector('[data-render="press-photos"]');
    if (root) {
      root.innerHTML = photos.map(function (p) {
        return (
          '<figure class="press-photo">' +
            '<img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" width="600" height="900">' +
            '<figcaption><a href="' + esc(p.src) + '" download="' + esc(p.name) + '.svg">Download</a></figcaption>' +
          '</figure>'
        );
      }).join('');
    }
    var rider = document.querySelector('[data-render="rider"]');
    if (rider) rider.textContent = (data.pressKit && data.pressKit.rider) || '';
  }

  /* --- listen bar + copy link ------------------------------------------ */
  function renderListenBar() {
    var site = data.site || {};
    document.querySelectorAll('[data-render="listen-name"]').forEach(function (el) {
      el.textContent = site.name || '';
    });
  }

  function initCopyLink() {
    var buttons = document.querySelectorAll('[data-copy]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-copy');
        var text = target === 'url' ? (data.site && data.site.listenUrl) : (data.site && data.site.email) || '';
        var done = function () {
          var original = btn.textContent;
          btn.textContent = 'Copied';
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('is-copied');
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
        } else {
          fallbackCopy(text);
          done();
        }
      });
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* --- contact form ----------------------------------------------------- */
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
    if (!field.getAttribute('aria-describedby')) field.setAttribute('aria-describedby', errorId);
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    var error = field.parentElement.querySelector('.field-error');
    if (error) error.remove();
    if (field.getAttribute('aria-describedby') === field.id + '-error') field.removeAttribute('aria-describedby');
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
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
        var first = form.querySelector('.field-error');
        if (first) {
          var f = first.closest('.field').querySelector('input, textarea');
          if (f) f.focus();
        }
        return;
      }
      form.reset();
      var success = document.getElementById('form-success');
      if (success) success.classList.add('is-visible');
    });
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.hasAttribute('aria-invalid')) clearError(field);
      });
    });
  }

  function init() {
    renderSite();
    renderLatest();
    renderReleases();
    renderTour();
    renderQuotes();
    renderBios();
    renderPressKit();
    renderListenBar();
    initCopyLink();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
