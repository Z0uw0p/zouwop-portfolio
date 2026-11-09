async function initProject() {
  const [site, projects] = await Promise.all([
    loadJSON(PATHS.site),
    loadJSON(PATHS.projects),
    loadImageMeta(),
  ]);
  const main = document.getElementById('project-main');
  const slug = (main && main.dataset.slug) || getSlug();
  const project = projectBySlug(projects, slug);
  if (!project) {
    renderNav(site, null);
    renderFooter(site);
    renderNotFound(main, site);
    return;
  }
  renderNav(site, project.collection);
  renderFooter(site);
  if (main.dataset.prerendered === 'true') {
    hydrateProject(project);
  } else if (!isLocalDev()) {
    window.location.replace(projectHref(project));
  } else {
    renderProjectDetail(project, projects, site);
  }
}

/** A generated page already contains the markup; bind the viewer to it. */
function hydrateProject(project) {
  const images = visibleImages(project);
  const nodes = document.querySelectorAll('#project-main .masonry-item img');
  nodes.forEach((img, fallback) => {
    const index = Number(img.dataset.index);
    img.addEventListener('click', () => openLightbox(images, Number.isInteger(index) ? index : fallback));
  });
}

function renderProjectDetail(project, projects, site) {
  const main = document.getElementById('project-main');
  const back = el('a', 'back-link', '← ' + STRINGS.project.back);
  back.href = collectionHref({ id: project.collection });
  main.appendChild(back);

  main.appendChild(el('h1', 'project-title', project.title));
  if (project.year) main.appendChild(el('p', 'project-meta', project.year));
  if (project.description) main.appendChild(el('p', 'project-desc', project.description));

  const images = visibleImages(project);
  const grid = el('div', 'masonry');
  images.forEach((img, i) => {
    const fig = el('figure', 'masonry-item');
    const im = el('img');
    im.src = img.src; im.alt = img.alt || (project.title + ' — ' + (i + 1)); im.loading = 'lazy';
    sizeImage(im, img.src);
    responsive(im, img.src, 'masonry');
    im.addEventListener('click', () => openLightbox(images, i));
    fig.appendChild(im);
    grid.appendChild(fig);
  });
  main.appendChild(grid);

  for (const v of (project.videos || [])) {
    const video = el('video', 'project-video');
    video.controls = true;
    video.preload = 'none';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    if (v.poster) {
      video.poster = v.poster;
      sizeImage(video, v.poster);
    }
    const src = el('source');
    src.src = v.src; src.type = 'video/mp4';
    video.appendChild(src);
    main.appendChild(video);
  }

  renderPrevNext(projects, project, main);
}

function renderPrevNext(projects, current, main) {
  const peers = projects.filter((p) => p.collection === current.collection);
  const idx = peers.findIndex((p) => p.slug === current.slug);
  const nav = el('div', 'project-nav');
  const prev = peers[idx - 1], next = peers[idx + 1];
  if (prev) {
    const a = el('a', 'prev', '← ' + STRINGS.project.previous + ': ' + prev.title);
    a.href = projectHref(prev);
    nav.appendChild(a);
  }
  if (next) {
    const a = el('a', 'next', STRINGS.project.next + ': ' + next.title + ' →');
    a.href = projectHref(next);
    nav.appendChild(a);
  }
  main.appendChild(nav);
}

function openLightbox(images, index) {
  const lb = document.getElementById('lightbox');
  lb.hidden = false;
  lb.textContent = '';
  let i = index;
  const img = el('img', 'lightbox-img');
  const render = () => {
    img.src = assetPath(images[i].src);
    img.alt = images[i].alt || '';
    responsive(img, images[i].src, 'lightbox');
  };
  render();
  const prevBtn = el('button', 'lightbox-btn prev', '‹');
  const nextBtn = el('button', 'lightbox-btn next', '›');
  const closeBtn = el('button', 'lightbox-btn close', '✕');
  prevBtn.onclick = () => { i = (i - 1 + images.length) % images.length; render(); };
  nextBtn.onclick = () => { i = (i + 1) % images.length; render(); };
  const close = () => { lb.hidden = true; lb.textContent = ''; document.removeEventListener('keydown', onKey); };
  closeBtn.onclick = close;
  lb.appendChild(img); lb.appendChild(prevBtn); lb.appendChild(nextBtn); lb.appendChild(closeBtn);
  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  }
  document.addEventListener('keydown', onKey);
}

document.addEventListener('DOMContentLoaded', initProject);
