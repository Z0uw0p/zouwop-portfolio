import type { TemplateEntry } from './templates';

/**
 * Store-owned copy and commerce. Everything here wins over the generated
 * catalog in src/data/templates.generated.ts. A key that no longer exists in
 * the generated catalog fails the build.
 */
export const overrides: Record<string, Partial<TemplateEntry>> = {
  'photo-portfolio': {
    description:
      'A photography portfolio built around the work: collection grids, a carousel, and a keyboard-friendly lightbox. Static HTML, CSS, and JavaScript, with a small Node build script for the image sets.',
    features: [
      'Masonry collection grids with lazy-loaded images',
      'Carousel and keyboard-operable lightbox',
      'Text content lives in a single data file',
    ],
    includes: ['Full source ZIP', 'LICENSE.txt', 'README with run and customise steps'],
    priceCents: 50000,
    status: 'available',
  },
  website: {
    description:
      'A one-page site for selling technical work: a clear hero, service cards, a stack section, and a contact block. Astro 5, static output, no runtime JavaScript.',
    features: [
      'Hero, services, stack, and contact sections',
      'Content in typed data files, not markup',
      'Astro 5 static build — deploy the output anywhere',
    ],
    includes: ['Full source ZIP', 'LICENSE.txt', 'README with run and customise steps'],
    priceCents: 50000,
    status: 'available',
  },
};
