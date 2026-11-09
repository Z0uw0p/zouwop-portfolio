/**
 * Base path this build is served from, derived from this script's own URL so
 * the same files work at the domain root and under /templates/<slug>/demo/.
 */
const BASE = (() => {
  const src = (document.currentScript && document.currentScript.src) || '';
  const at = src.indexOf('/js/main.js');
  return at >= 0 ? src.slice(0, at + 1) : '/';
})();
const withBase = (path) => BASE + String(path).replace(/^\//, '');

const PATHS = {
  site: withBase('data/site.json'),
  projects: withBase('data/projects.json'),
  images: withBase('data/images.json'),
};

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: HTTP ${res.status}`);
  return res.json();
}

/**
 * Intrinsic dimensions, keyed by image path. Used for width/height attributes so
 * the browser reserves space before the photo downloads (no layout shift).
 * Missing entries are fine — the image still renders, just without reserved space.
 */
let IMAGE_META = {};
let imageMetaPromise = null;
function loadImageMeta() {
  if (!imageMetaPromise) {
    imageMetaPromise = fetch(PATHS.images)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}))
      .then((meta) => { IMAGE_META = meta || {}; return IMAGE_META; });
  }
  return imageMetaPromise;
}

/** Apply width/height attributes from the manifest, when known. */
function sizeImage(img, src) {
  const meta = IMAGE_META[src];
  if (meta) { img.width = meta.width; img.height = meta.height; }
  return img;
}

const SIZES = {
  masonry: '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 400px',
  carousel: '(max-width: 700px) 80vw, 520px',
  hero: '100vw',
  lightbox: '92vw',
  about: '(max-width: 640px) 100vw, 42vw, 500px',
};

/** Resolve an asset path against the demo/site base, so nested pages work. */
function assetPath(src) {
  return withBase(src);
}

/** Add srcset/sizes from the build manifest, when variants exist. */
function srcsetString(src) {
  const meta = IMAGE_META[src];
  if (!meta || !meta.variants || !meta.variants.length) return '';
  return meta.variants.map((v) => `${assetPath(v.src)} ${v.width}w`).join(', ');
}

function responsive(img, src, sizeKey) {
  const meta = IMAGE_META[src];
  if (meta && meta.variants && meta.variants.length) {
    img.srcset = meta.variants.map((v) => `${assetPath(v.src)} ${v.width}w`).join(', ');
    img.sizes = SIZES[sizeKey] || SIZES.masonry;
  }
  return img;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function navItems(site) {
  return [
    { id: 'home', label: STRINGS.nav.home, href: withBase('') },
    ...(site.collections || []).map((c) => ({ id: c.id, label: c.label, href: withBase(`${c.id}/`) })),
    { id: 'about', label: STRINGS.nav.about, href: withBase('about/') },
  ];
}

/** Build the nav when the page shell did not ship one. */
function buildNav(site, activeId) {
  const nav = el('nav', 'nav');
  nav.setAttribute('aria-label', 'Main');
  const brand = el('a', 'brand', (site.name || '').toUpperCase());
  brand.href = withBase('');
  nav.appendChild(brand);

  const toggle = el('button', 'nav-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'site-menu');
  toggle.setAttribute('aria-label', 'Open menu');
  for (let i = 0; i < 3; i++) toggle.appendChild(el('span'));

  const ul = el('ul', 'nav-links');
  ul.id = 'site-menu';
  for (const it of navItems(site)) {
    const a = el('a', it.id === activeId ? 'active' : '', it.label);
    a.href = it.href;
    if (it.id === activeId) a.setAttribute('aria-current', 'page');
    const li = el('li'); li.appendChild(a); ul.appendChild(li);
  }
  nav.appendChild(ul);
  nav.appendChild(toggle);
  return nav;
}

/** Mobile menu: focus trap, Escape, outside click, scroll lock. */
function wireNav(nav) {
  const ul = nav.querySelector('.nav-links');
  const toggle = nav.querySelector('.nav-toggle');
  if (!ul || !toggle) return;
  const root = document.documentElement;
  const links = Array.from(ul.querySelectorAll('a'));
  let open = false;

  function setOpen(next) {
    if (next === open) return;
    open = next;
    nav.classList.toggle('menu-open', open);
    ul.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) links[0]?.focus();
    else if (nav.contains(document.activeElement)) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(!open));
  for (const a of links) a.addEventListener('click', () => setOpen(false));
  document.addEventListener('click', (e) => {
    if (open && !nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
    if (e.key !== 'Tab') return;
    const focusables = [toggle, ...links];
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  const desktop = window.matchMedia('(min-width: 861px)');
  desktop.addEventListener('change', (e) => { if (e.matches) setOpen(false); });

  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!open) nav.classList.toggle('hidden', y > lastY && y > 120);
    lastY = y;
  }, { passive: true });
}

function renderNav(site, activeId) {
  const header = document.getElementById('site-nav');
  if (!header) return;
  let nav = header.querySelector('.nav');
  if (!nav) {
    nav = buildNav(site, activeId);
    header.appendChild(nav);
  }
  wireNav(nav);
}

function renderFooter(site) {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  // Generated pages ship a static footer; don't duplicate it.
  if (footer.childElementCount > 0) return;
  const year = String(new Date().getFullYear());
  const p = el('p', 'footer-contact');
  const mail = el('a', 'footer-mail', site.contact.email);
  mail.href = 'mailto:' + site.contact.email;
  p.appendChild(mail);
  footer.appendChild(p);
  footer.appendChild(el('p', 'footer-year', `© ${year} ${site.name}`));
}

function getSlug() { return new URLSearchParams(window.location.search).get('slug'); }

function isLocalDev() {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
}

function projectHref(project) { return withBase(`${project.collection}/${project.slug}/`); }
function collectionHref(collection) { return withBase(`${collection.id}/`); }

function projectBySlug(projects, slug) { return projects.find((p) => p.slug === slug) || null; }

/** Friendly not-found state for an unknown slug or collection. */
function renderNotFound(host, site) {
  if (!host) return;
  host.textContent = '';
  host.appendChild(el('p', 'notfound-kicker', '404'));
  host.appendChild(el('h1', 'page-title', 'Page not found'));
  host.appendChild(el('p', 'notfound-text', 'That page may have moved, or the link could be out of date.'));
  const nav = el('nav', 'notfound-links');
  nav.setAttribute('aria-label', 'Where to go next');
  const links = [
    { label: 'Home', href: withBase('') },
    ...((site && site.collections) || []).map((c) => ({ label: c.label, href: collectionHref(c) })),
  ];
  for (const link of links) {
    const a = el('a', '', link.label);
    a.href = link.href;
    nav.appendChild(a);
  }
  host.appendChild(nav);
}

function groupByCollection(projects, collections) {
  const map = {};
  for (const c of collections) map[c.id] = [];
  for (const p of projects) if (map[p.collection]) map[p.collection].push(p);
  return map;
}

function visibleImages(project) {
  return (project.images || []).filter((img) => !img.hidden);
}
