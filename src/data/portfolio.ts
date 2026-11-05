export interface PortfolioScreenshot {
  src: string;
  alt: string;
  kind: 'desktop' | 'mobile';
}

export interface PortfolioPricing {
  label: string;
  price: string;
  subject: string;
  cta: string;
}

export interface PortfolioEntry {
  id: string;
  name: string;
  liveUrl: string;
  description: string;
  buyEmail: string;
  pricing: PortfolioPricing[];
  screenshots: PortfolioScreenshot[];
}

/**
 * Sites built for clients, sold as templates. Each entry is self-contained:
 * adding a second project means adding one object here and dropping its
 * screenshots into public/portfolio/<id>/.
 */
export const portfolio: PortfolioEntry[] = [
  {
    id: 'photographer',
    name: 'Béatrice Daudelin — Photographer',
    liveUrl: 'https://beatricedaudelin.com/',
    description:
      'A photographer portfolio — masonry gallery, project and exposition pages, agency inquiry flow.',
    buyEmail: 'billing@zouwop.com',
    pricing: [
      {
        label: 'Buy the template',
        price: '$1,000',
        subject: 'Template purchase — Photographer portfolio',
        cta: 'Email to buy',
      },
      {
        label: 'Hosted + maintained',
        price: '$50/month',
        subject: 'Hosting + maintenance — Photographer portfolio',
        cta: 'Email about hosting',
      },
    ],
    screenshots: [
      {
        src: '/portfolio/beatrice/home-desktop.png',
        alt: 'Home page on desktop: full-screen hero photo over the photographer’s name, then a masonry gallery.',
        kind: 'desktop',
      },
      {
        src: '/portfolio/beatrice/agency-desktop.png',
        alt: 'Agency page on desktop: a grid of portrait covers with captions.',
        kind: 'desktop',
      },
      {
        src: '/portfolio/beatrice/projects-desktop.png',
        alt: 'Projects page on desktop: masonry grid of project covers.',
        kind: 'desktop',
      },
      {
        src: '/portfolio/beatrice/expositions-desktop.png',
        alt: 'Expositions page on desktop: a horizontal carousel of publication covers with arrows and dots.',
        kind: 'desktop',
      },
      {
        src: '/portfolio/beatrice/about-desktop.png',
        alt: 'About page on desktop: portrait beside the biography and contact links.',
        kind: 'desktop',
      },
      {
        src: '/portfolio/beatrice/project-desktop.png',
        alt: 'A project page on desktop: title, then a masonry photo grid.',
        kind: 'desktop',
      },
      {
        src: '/portfolio/beatrice/home-mobile.png',
        alt: 'Home page on a phone: full-width hero, then a single-column gallery.',
        kind: 'mobile',
      },
      {
        src: '/portfolio/beatrice/agency-mobile.png',
        alt: 'Agency page on a phone: two-column cover grid.',
        kind: 'mobile',
      },
      {
        src: '/portfolio/beatrice/projects-mobile.png',
        alt: 'Projects page on a phone: two-column cover grid.',
        kind: 'mobile',
      },
      {
        src: '/portfolio/beatrice/expositions-mobile.png',
        alt: 'Expositions page on a phone: carousel of covers with a dot navigation bar.',
        kind: 'mobile',
      },
      {
        src: '/portfolio/beatrice/about-mobile.png',
        alt: 'About page on a phone: stacked portrait, biography and contact links.',
        kind: 'mobile',
      },
      {
        src: '/portfolio/beatrice/project-mobile.png',
        alt: 'A project page on a phone: title and single-column photo grid.',
        kind: 'mobile',
      },
    ],
  },
];
