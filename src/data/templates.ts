export type TemplateStatus = 'available' | 'coming-soon';

export interface TemplatePreview {
  src: string;
  alt: string;
  kind: 'desktop' | 'mobile';
  width: number;
  height: number;
}

export interface TemplateEntry {
  /** Matches the template folder in the templates repo, e.g. 'forge-trades'. */
  slug: string;
  name: string;
  /** Human-readable niche, shown in the card meta line. */
  niche: string;
  audience: 'business' | 'creative';
  stack: string[];
  /** One sentence, <= 140 chars. */
  blurb: string;
  /** 2-3 sentences for the product page. */
  description: string;
  features: string[];
  /** What the ZIP contains. */
  includes: string[];
  tags: string[];
  demoUrl?: string;
  /** Stripe Payment Link — set once checkout exists. */
  buyUrl?: string;
  priceCents: number;
  currency: 'CAD';
  /** Monthly hosting price. Leave unset until hosting is priced. */
  hostedMonthlyCents?: number;
  status: TemplateStatus;
  previews: TemplatePreview[];
}

interface PreviewSize {
  desktop: { width: number; height: number };
  mobile: { width: number; height: number };
}

const preview = (
  slug: string,
  name: string,
  sizes: PreviewSize,
): TemplatePreview[] => [
  {
    src: `/templates/${slug}/desktop.webp`,
    alt: `${name} — full home page on a desktop screen.`,
    kind: 'desktop',
    width: sizes.desktop.width,
    height: sizes.desktop.height,
  },
  {
    src: `/templates/${slug}/mobile.webp`,
    alt: `${name} — the same pages on a phone.`,
    kind: 'mobile',
    width: sizes.mobile.width,
    height: sizes.mobile.height,
  },
];

const plainStack = ['HTML', 'CSS', 'JavaScript'];
const astroStack = ['Astro 5', 'static'];

const plainIncludes = [
  'HTML, CSS and JavaScript source',
  'Placeholder artwork',
  'template.json catalog metadata',
  'README with run and edit notes',
  'End-Product Licence (LICENSE.txt)',
];

const astroIncludes = [
  'Astro 5 source (src/)',
  'package.json and lockfile',
  'template.json catalog metadata',
  'README with run and edit notes',
  'End-Product Licence (LICENSE.txt)',
];

/**
 * The shop catalog. One object per template; each becomes a card on /templates
 * and a page at /templates/<slug>/. Adding an entry is the only edit needed.
 */
export const templates: TemplateEntry[] = [
  {
    slug: 'forge-trades',
    name: 'Forge Trades',
    niche: 'Trades contractor',
    audience: 'business',
    stack: plainStack,
    blurb:
      'Industrial one-page site for a local trade contractor: services, service area, reviews, quote form and FAQ.',
    description:
      'A no-nonsense site for a plumber, electrician, roofer or HVAC contractor. It puts the services and the area you cover first, then answers what customers ask before they call: reviews, a quote form and a FAQ. The phone number stays one tap away on mobile.',
    features: [
      'Four pages: home, services, contact and 404',
      'Services grid and service-area map',
      'Reviews and an FAQ accordion',
      'Quote request form',
      'Sticky call bar on phones',
      'All copy edited in one js/data.js file',
    ],
    includes: plainIncludes,
    tags: ['one-page', 'trades', 'services', 'static'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('forge-trades', 'Forge Trades', {
      desktop: { width: 1440, height: 4675 },
      mobile: { width: 390, height: 7034 },
    }),
  },
  {
    slug: 'fade-barbershop',
    name: 'Fade Barbershop',
    niche: 'Barbershop',
    audience: 'business',
    stack: plainStack,
    blurb:
      'Vintage-industrial barbershop site with a chalkboard price board, the chairs, house rules and booking.',
    description:
      'A dark, worked-in site for a barbershop that wants to feel like the shop itself. Services sit on a chalkboard price board, each barber gets a chair, and hours show a live open or closed state. Every Book button reads one booking link, so you change it once.',
    features: [
      'Four pages: home, services, book and 404',
      'Chalkboard price board',
      'Three barbers, booked by chair',
      'Hours with a live open/closed state',
      'Gallery and customer reviews',
      'One bookingUrl constant drives every Book button',
    ],
    includes: plainIncludes,
    tags: ['barbershop', 'services', 'price-board', 'static'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('fade-barbershop', 'Fade Barbershop', {
      desktop: { width: 1440, height: 5554 },
      mobile: { width: 390, height: 9659 },
    }),
  },
  {
    slug: 'rivage-coiffeur',
    name: 'Rivage Coiffeur',
    niche: 'Salon de coiffure',
    audience: 'business',
    stack: plainStack,
    blurb:
      'Site de salon de coiffure en français : services et tarifs en dollars, équipe, cartes cadeaux et rendez-vous.',
    description:
      'Un site complet en français pour un salon de coiffure québécois, avec les prix en dollars canadiens. Les services, l’équipe, la galerie, les témoignages et les cartes cadeaux sont tous dans un seul fichier de données. La prise de rendez-vous explique aussi la politique d’annulation.',
    features: [
      'Four pages, entirely in French (fr-CA)',
      'Services with durations and “à partir de” prices',
      'Team, gallery and testimonials',
      'Gift cards section',
      'Booking request with a cancellation policy',
      'All content in js/data.js',
    ],
    includes: plainIncludes,
    tags: ['salon', 'coiffure', 'français', 'quatre pages'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('rivage-coiffeur', 'Rivage Coiffeur', {
      desktop: { width: 1440, height: 5563 },
      mobile: { width: 390, height: 8144 },
    }),
  },
  {
    slug: 'taverna-restaurant',
    name: 'Taverna Restaurant',
    niche: 'Restaurant',
    audience: 'business',
    stack: astroStack,
    blurb:
      'A moody restaurant site whose menu updates in one file: sections, dishes, prices, dietary tags.',
    description:
      'A photography-led site for a restaurant or café, dark and warm. The whole menu is data: sections, dishes, prices and dietary tags live in one file, so you change a dish without touching markup. The dietary legend only lists the tags you actually use.',
    features: [
      'Four pages: home, menu, contact and 404',
      'Menu as data: sections, dishes, prices, dietary tags',
      'Dietary pills generated from the menu data',
      'Opening hours and holiday note in data',
      'Full-bleed photography-ready plates',
      'Astro 5, static output, no integrations',
    ],
    includes: astroIncludes,
    tags: ['restaurant', 'menu', 'astro', 'multi-page'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('taverna-restaurant', 'Taverna Restaurant', {
      desktop: { width: 1440, height: 5481 },
      mobile: { width: 390, height: 6278 },
    }),
  },
  {
    slug: 'atelier-studio',
    name: 'Atelier Studio',
    niche: 'Design studio',
    audience: 'creative',
    stack: astroStack,
    blurb:
      'Swiss-editorial studio portfolio with a work index whose thumbnails follow the cursor.',
    description:
      'An editorial, paper-and-ink portfolio for a design studio, illustrator or small agency. Case studies are markdown files in an Astro content collection, so adding a project is one file. The work index floats each project thumbnail under the cursor, and shows it on keyboard focus too.',
    features: [
      'Case studies driven by Astro content collections',
      'Work index thumbnails follow the cursor, or keyboard focus',
      'Visible 12-column hairline grid',
      'One markdown file per project page',
      'Contact form with a visible email fallback',
      'Astro 5, static output, no integrations',
    ],
    includes: astroIncludes,
    tags: ['portfolio', 'studio', 'editorial', 'case-studies'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('atelier-studio', 'Atelier Studio', {
      desktop: { width: 1440, height: 2894 },
      mobile: { width: 390, height: 2745 },
    }),
  },
  {
    slug: 'wavelength-musician',
    name: 'Wavelength Musician',
    niche: 'Musician',
    audience: 'creative',
    stack: plainStack,
    blurb:
      'Neon-on-black electronic press kit: releases, tour dates, press quotes, bios and downloadable press assets.',
    description:
      'A neon-on-black electronic press kit for a musician, band or DJ. It carries releases, tour dates, press quotes and both a short and long bio. Each tour date shows on-sale, sold-out or announced from the data, and a missing ticket link renders as a disabled button instead of a dead end.',
    features: [
      'Three pages: home, press and 404',
      'Latest release plus a release grid',
      'Tour dates with on-sale / sold-out / announced states',
      'Press quotes and short plus long bios',
      'Downloadable press photos, logo and technical rider',
      'All copy in js/data.js',
    ],
    includes: plainIncludes,
    tags: ['one-page', 'epk', 'music', 'static'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('wavelength-musician', 'Wavelength Musician', {
      desktop: { width: 1440, height: 4592 },
      mobile: { width: 390, height: 6699 },
    }),
  },
  {
    slug: 'meridian-clinic',
    name: 'Meridian Clinic',
    niche: 'Health clinic',
    audience: 'business',
    stack: plainStack,
    blurb:
      'A calm, strictly accessible clinic site (dental, physio, chiropractic) with an appointment request form.',
    description:
      'A calm site for a small clinic — dental, physio, chiropractic or optometry. Accessibility is the design brief, not an afterthought: the site is built to WCAG 2.2 AA, and opening hours show open or closed as plain text, never colour alone. Appointment requests go through a simple form with the contact details alongside.',
    features: [
      'Three pages: home, appointments and 404',
      'Built to WCAG 2.2 AA',
      'Live open/closed state, written as text',
      'Appointment request form',
      'Testimonials and an FAQ',
      'Schema.org MedicalClinic structured data',
    ],
    includes: plainIncludes,
    tags: ['clinic', 'health', 'accessible', 'static'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('meridian-clinic', 'Meridian Clinic', {
      desktop: { width: 1440, height: 7702 },
      mobile: { width: 390, height: 12166 },
    }),
  },
  {
    slug: 'photo-portfolio',
    name: 'Photo Portfolio',
    niche: 'Photography',
    audience: 'creative',
    stack: ['HTML', 'CSS', 'JavaScript', 'Node build script'],
    blurb:
      'A masonry photography portfolio with collection grids, a carousel, and a keyboard lightbox.',
    description:
      'A static photography portfolio: a masonry home gallery, per-collection grids, a carousel for publications and exhibitions, and project pages with a keyboard lightbox. A small Node script builds the collection and project pages, the WebP derivatives and the sitemap. Every photo is a neutral placeholder that keeps its aspect ratio, so your own images drop straight in.',
    features: [
      'Masonry home gallery and per-collection grids',
      'Carousel for publications and exhibitions',
      'Project pages with a keyboard lightbox',
      'Node build script generates pages, WebP variants and sitemap.xml',
      'Intrinsic image sizes so pages do not jump',
      'Neutral placeholder photos keep their aspect ratio',
    ],
    includes: [
      ...plainIncludes,
      'Node build and validate scripts (sharp)',
    ],
    tags: ['portfolio', 'photography', 'gallery', 'static'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('photo-portfolio', 'Photo Portfolio', {
      desktop: { width: 1440, height: 5307 },
      mobile: { width: 195, height: 9416 },
    }),
  },
  {
    slug: 'website',
    name: 'Website',
    niche: 'Technical services',
    audience: 'business',
    stack: astroStack,
    blurb:
      'One-page personal site for selling technical work: hero, service cards, stack chips, contact.',
    description:
      'A one-page site for someone who sells technical work. It pairs a direct hero and booking call to action with three priced service cards and a “what I run” list. A short links page handles referral offers shared from a bio. Every mutable string lives in the data folder.',
    features: [
      'One page plus a short /links page',
      'Hero with a booking call to action',
      'Three service cards with prices and mailto CTAs',
      '“What I run” chip list',
      'Availability and contact blocks',
      'All mutable strings in src/data/',
    ],
    includes: astroIncludes,
    tags: ['one-page', 'personal', 'services', 'astro'],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
    previews: preview('website', 'Website', {
      desktop: { width: 1440, height: 3035 },
      mobile: { width: 390, height: 4342 },
    }),
  },
];
