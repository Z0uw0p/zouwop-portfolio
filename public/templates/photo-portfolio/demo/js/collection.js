async function initCollection() {
  const [site, projects] = await Promise.all([
    loadJSON(PATHS.site),
    loadJSON(PATHS.projects),
    loadImageMeta(),
  ]);
  const main = document.getElementById('collection-main');
  const colId = (main && main.dataset.collection) || new URLSearchParams(window.location.search).get('collection');
  const col = (site.collections || []).find((c) => c.id === colId);
  if (!col) {
    renderNav(site, null);
    renderFooter(site);
    renderNotFound(main, site);
    return;
  }
  renderNav(site, col.id);
  renderFooter(site);
  if (main.dataset.prerendered === 'true') { initCarousel(); return; }
  if (!isLocalDev()) { window.location.replace(collectionHref(col)); return; }
  renderCollection(col, projects);
  initCarousel();
}

function renderCollection(col, projects) {
  const main = document.getElementById('collection-main');
  const list = projects.filter((p) => p.collection === col.id);
  main.appendChild(el('h1', 'page-title', col.label));
  if (col.description) main.appendChild(el('p', 'collection-desc', col.description));
  main.appendChild(col.layout === 'carousel' ? renderCarousel(list) : renderGrid(list));
}

function renderGrid(list) {
  const grid = el('div', 'masonry');
  for (const p of list) {
    const card = el('figure', 'cover-card masonry-item');
    const a = el('a');
    a.href = projectHref(p);
    const img = el('img');
    img.src = p.cover; img.alt = p.title; img.loading = 'lazy';
    sizeImage(img, p.cover);
    responsive(img, p.cover, 'masonry');
    a.appendChild(img);
    card.appendChild(a);
    card.appendChild(el('figcaption', 'cover-caption', p.title));
    grid.appendChild(card);
  }
  return grid;
}

function renderCarousel(list) {
  const wrap = el('div', 'carousel-wrap');
  const track = el('div', 'carousel');
  for (const p of list) {
    const card = el('figure', 'carousel-item');
    const a = el('a');
    a.href = projectHref(p);
    const img = el('img');
    img.src = p.cover; img.alt = p.title; img.loading = 'lazy';
    sizeImage(img, p.cover);
    responsive(img, p.cover, 'carousel');
    a.appendChild(img);
    card.appendChild(a);
    card.appendChild(el('figcaption', 'carousel-caption', p.title));
    track.appendChild(card);
  }
  wrap.appendChild(track);
  wrap.appendChild(buildCarouselNav(list));
  return wrap;
}

function arrowIcon(direction) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', direction === 'prev' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.2');
  svg.appendChild(path);
  return svg;
}

/** Slim control bar under the carousel: arrows + one dot per panel. */
function buildCarouselNav(list) {
  const nav = el('nav', 'carousel-nav');
  nav.setAttribute('aria-label', 'Expositions navigation');

  const prev = el('button', 'carousel-arrow prev');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous exposition');
  prev.appendChild(arrowIcon('prev'));

  const dots = el('div', 'carousel-dots');
  list.forEach((project, i) => {
    const dot = el('button', 'carousel-dot' + (i === 0 ? ' active' : ''));
    dot.type = 'button';
    dot.dataset.index = String(i);
    dot.setAttribute('aria-label', 'Go to ' + project.title);
    if (i === 0) dot.setAttribute('aria-current', 'true');
    dots.appendChild(dot);
  });

  const next = el('button', 'carousel-arrow next');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next exposition');
  next.appendChild(arrowIcon('next'));

  nav.append(prev, dots, next);
  return nav;
}

/** Wire the bar to the carousel scroll position. */
function initCarousel() {
  const track = document.querySelector('#collection-main .carousel');
  const wrap = track && track.closest('.carousel-wrap');
  const nav = wrap && wrap.querySelector('.carousel-nav');
  if (!track || !nav) return;
  const items = Array.from(track.querySelectorAll('.carousel-item'));
  if (!items.length) return;
  const dots = Array.from(nav.querySelectorAll('.carousel-dot'));
  const prev = nav.querySelector('.carousel-arrow.prev');
  const next = nav.querySelector('.carousel-arrow.next');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let frame = 0;

  function scrollToIndex(index) {
    const i = Math.max(0, Math.min(items.length - 1, index));
    const item = items[i];
    const left = Math.max(0, item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2);
    try {
      track.scrollTo({ left, behavior: reduce.matches ? 'auto' : 'smooth' });
    } catch (error) {
      track.scrollLeft = left;
    }
  }

  function setActive(index) {
    current = index;
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= items.length - 1;
  }

  function measure() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    items.forEach((item, i) => {
      const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
      if (distance < bestDistance) { bestDistance = distance; best = i; }
    });
    setActive(best);
  }

  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; measure(); });
  }

  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', measure);
  prev.addEventListener('click', () => scrollToIndex(current - 1));
  next.addEventListener('click', () => scrollToIndex(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => scrollToIndex(i)));

  measure();
}

document.addEventListener('DOMContentLoaded', initCollection);
