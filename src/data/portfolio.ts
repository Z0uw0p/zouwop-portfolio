export interface PortfolioScreenshot {
  src: string;
  /** Short caption for the carousel, e.g. "Home — desktop". */
  label: string;
  alt: string;
  kind: 'desktop' | 'mobile';
}

export interface PortfolioEntry {
  id: string;
  name: string;
  liveUrl: string;
  /** Live site shown in a small iframe above the screenshots. */
  embedUrl?: string;
  description: string;
  /** Slug of the matching entry in the template shop, when one exists. */
  templateSlug?: string;
  screenshots: PortfolioScreenshot[];
}

/**
 * Client work and case studies. Each entry is self-contained: adding a second
 * project means adding one object here and dropping its screenshots into
 * public/portfolio/<id>/.
 */
export const portfolio: PortfolioEntry[] = [
  {
    id: 'photographer',
    name: 'Béatrice Daudelin — Photographer',
    liveUrl: 'https://beatricedaudelin.com/',
    embedUrl: 'https://beatricedaudelin.com/',
    description:
      'A photographer portfolio — masonry gallery, project and exposition pages, agency inquiry flow.',
    templateSlug: 'photo-portfolio',
    screenshots: [
      {
        label: 'Home — desktop',
        src: '/portfolio/beatrice/home-desktop.png',
        alt: 'Home page on desktop: full-screen hero photo over the photographer’s name, then a masonry gallery.',
        kind: 'desktop',
      },
      {
        label: 'Agency — desktop',
        src: '/portfolio/beatrice/agency-desktop.png',
        alt: 'Agency page on desktop: a grid of portrait covers with captions.',
        kind: 'desktop',
      },
      {
        label: 'Projects — desktop',
        src: '/portfolio/beatrice/projects-desktop.png',
        alt: 'Projects page on desktop: masonry grid of project covers.',
        kind: 'desktop',
      },
      {
        label: 'Expositions — desktop',
        src: '/portfolio/beatrice/expositions-desktop.png',
        alt: 'Expositions page on desktop: a horizontal carousel of publication covers with arrows and dots.',
        kind: 'desktop',
      },
      {
        label: 'About — desktop',
        src: '/portfolio/beatrice/about-desktop.png',
        alt: 'About page on desktop: portrait beside the biography and contact links.',
        kind: 'desktop',
      },
      {
        label: 'Project detail — desktop',
        src: '/portfolio/beatrice/project-desktop.png',
        alt: 'A project page on desktop: title, then a masonry photo grid.',
        kind: 'desktop',
      },
      {
        label: 'Home — mobile',
        src: '/portfolio/beatrice/home-mobile.png',
        alt: 'Home page on a phone: full-width hero, then a single-column gallery.',
        kind: 'mobile',
      },
      {
        label: 'Agency — mobile',
        src: '/portfolio/beatrice/agency-mobile.png',
        alt: 'Agency page on a phone: two-column cover grid.',
        kind: 'mobile',
      },
      {
        label: 'Projects — mobile',
        src: '/portfolio/beatrice/projects-mobile.png',
        alt: 'Projects page on a phone: two-column cover grid.',
        kind: 'mobile',
      },
      {
        label: 'Expositions — mobile',
        src: '/portfolio/beatrice/expositions-mobile.png',
        alt: 'Expositions page on a phone: carousel of covers with a dot navigation bar.',
        kind: 'mobile',
      },
      {
        label: 'About — mobile',
        src: '/portfolio/beatrice/about-mobile.png',
        alt: 'About page on a phone: stacked portrait, biography and contact links.',
        kind: 'mobile',
      },
      {
        label: 'Project detail — mobile',
        src: '/portfolio/beatrice/project-mobile.png',
        alt: 'A project page on a phone: title and single-column photo grid.',
        kind: 'mobile',
      },
    ],
  },
];
