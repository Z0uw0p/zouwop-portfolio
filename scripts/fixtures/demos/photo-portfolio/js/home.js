async function initHome() {
  const [site, projects] = await Promise.all([
    loadJSON(PATHS.site),
    loadJSON(PATHS.projects),
    loadImageMeta(),
  ]);
  renderNav(site, 'home');
  renderFooter(site);
  renderHero(site);
  renderHomeGallery(site, projects);
}

function renderHero(site) {
  const hero = document.getElementById('hero');
  if (!site.heroImage) return;
  const picture = el('picture', 'hero-picture');
  if (site.heroImageMobile) {
    const source = el('source');
    source.media = '(max-width: 768px)';
    source.sizes = '100vw';
    source.srcset = srcsetString(site.heroImageMobile) || site.heroImageMobile;
    picture.appendChild(source);
  }
  const img = el('img');
  img.src = site.heroImage;
  img.alt = site.name;
  sizeImage(img, site.heroImage);
  responsive(img, site.heroImage, 'hero');
  picture.appendChild(img);
  hero.appendChild(picture);
  hero.appendChild(el('h1', 'hero-name', (site.name || '').toUpperCase()));
  if (STRINGS.home.tagline) hero.appendChild(el('p', 'hero-tagline', STRINGS.home.tagline));
}

function renderHomeGallery(site, projects) {
  const grid = document.getElementById('home-gallery');
  for (const item of (site.homeGallery || [])) {
    const fig = el('figure', 'masonry-item');
    const img = el('img');
    img.src = item.src;
    img.alt = item.alt || '';
    img.loading = 'lazy';
    sizeImage(img, item.src);
    responsive(img, item.src, 'masonry');
    if (item.project) {
      const project = projectBySlug(projects, item.project);
      const a = el('a');
      a.href = project ? projectHref(project) : '#';
      a.appendChild(img);
      fig.appendChild(a);
    } else {
      fig.appendChild(img);
    }
    grid.appendChild(fig);
  }
}

document.addEventListener('DOMContentLoaded', initHome);
