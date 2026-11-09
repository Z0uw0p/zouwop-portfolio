async function initAbout() {
  const [site] = await Promise.all([loadJSON(PATHS.site), loadImageMeta()]);
  renderNav(site, 'about');
  renderFooter(site);
  const main = document.getElementById('about-main');

  const wrap = el('div', 'about-wrap');
  wrap.appendChild(el('h1', 'about-heading', STRINGS.about.heading));

  const layout = el('div', 'about-layout');

  if (site.aboutImage) {
    const media = el('div', 'about-media');
    const img = el('img', 'about-image');
    img.src = site.aboutImage;
    img.alt = 'Portrait of ' + site.name;
    sizeImage(img, site.aboutImage);
    responsive(img, site.aboutImage, 'about');
    media.appendChild(img);
    layout.appendChild(media);
  } else {
    layout.classList.add('about-layout--text-only');
  }

  const body = el('div', 'about-body');
  const text = el('div', 'about-text');
  site.about.split('\n\n').forEach((para) => { if (para.trim()) text.appendChild(el('p', '', para.trim())); });
  body.appendChild(text);

  body.appendChild(el('h2', 'contact-heading', STRINGS.about.contactHeading));
  const contact = el('div', 'contact-links');
  const mail = el('a', '', site.contact.email); mail.href = 'mailto:' + site.contact.email;
  const ig = el('a', '', 'Instagram'); ig.href = site.contact.instagram; ig.target = '_blank';
  const li = el('a', '', 'LinkedIn'); li.href = site.contact.linkedin; li.target = '_blank';
  contact.append(mail, ig, li);
  body.appendChild(contact);

  layout.appendChild(body);
  wrap.appendChild(layout);
  main.appendChild(wrap);
}
document.addEventListener('DOMContentLoaded', initAbout);
