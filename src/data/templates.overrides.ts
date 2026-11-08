import type { TemplateEntry } from './templates';

/**
 * Store-owned copy and commerce. Everything here wins over the generated
 * catalog in src/data/templates.generated.ts. A key that no longer exists in
 * the generated catalog fails the build.
 */
export const overrides: Record<string, Partial<TemplateEntry>> = {
  'forge-trades': {
    niche: 'Trades contractor',
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
    includes: [
      'HTML, CSS and JavaScript source',
      'Placeholder artwork',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  'fade-barbershop': {
    niche: 'Barbershop',
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
    includes: [
      'HTML, CSS and JavaScript source',
      'Placeholder artwork',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  'rivage-coiffeur': {
    niche: 'Salon de coiffure',
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
    includes: [
      'HTML, CSS and JavaScript source',
      'Placeholder artwork',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  'taverna-restaurant': {
    niche: 'Restaurant',
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
    includes: [
      'Astro 5 source (src/)',
      'package.json and lockfile',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  'atelier-studio': {
    niche: 'Design studio',
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
    includes: [
      'Astro 5 source (src/)',
      'package.json and lockfile',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  'wavelength-musician': {
    niche: 'Musician',
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
    includes: [
      'HTML, CSS and JavaScript source',
      'Placeholder artwork',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  'meridian-clinic': {
    niche: 'Health clinic',
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
    includes: [
      'HTML, CSS and JavaScript source',
      'Placeholder artwork',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  'photo-portfolio': {
    niche: 'Photography',
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
      'HTML, CSS and JavaScript source',
      'Placeholder artwork',
      'Node build and validate scripts (sharp)',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
  website: {
    niche: 'Technical services',
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
    includes: [
      'Astro 5 source (src/)',
      'package.json and lockfile',
      'template.json catalog metadata',
      'README with run and edit notes',
      'End-Product Licence (LICENSE.txt)',
    ],
    priceCents: 50000,
    currency: 'CAD',
    status: 'available',
  },
};
