import { templates } from './templates';
import { site } from './site';
import { SUPPORT_DAYS, UPDATES_MONTHS } from './fulfilment';

const available = templates.filter((template) => template.status === 'available');

if (available.length === 0) {
  throw new Error('pricing.ts: no available templates — pricing cannot be derived.');
}

const licencePrices = available.map((template) => template.priceCents);

/** Cheapest available licence; the single price when every entry matches. */
export const licenceMinCents = Math.min(...licencePrices);

/** True when the catalog does not share one price, so the page can say "from". */
export const licenceFrom = licencePrices.some((cents) => cents !== licenceMinCents);

export interface Offer {
  id: string;
  name: string;
  /** Integer minor units, or null while the price is not set. */
  priceCents: number | null;
  cadence: 'one-time' | 'monthly';
  summary: string;
  ctaLabel: string;
  ctaHref: string;
}

export const fullBuild: Offer & { priceCents: number } = {
  id: 'full-build',
  name: 'Full build',
  priceCents: 200_000,
  cadence: 'one-time',
  summary:
    'I adapt a template to your content, connect your domain, put it on hosting and launch it for you.',
  ctaLabel: 'See what a build covers',
  ctaHref: '/services',
};

export const hosted: Offer & { priceCents: number | null; includes: string[] } = {
  id: 'hosted',
  name: 'Hosting + maintenance',
  priceCents: null,
  cadence: 'monthly',
  summary:
    'Your site runs on zouwop-server: I keep it updated, back it up, and make small changes.',
  includes: [
    'Hosting on a server I run',
    'Template and dependency updates',
    'Backups',
    'Small content changes',
  ],
  ctaLabel: 'Email about hosting',
  ctaHref: `mailto:${site.contact.billing}?subject=${encodeURIComponent('Hosting + maintenance')}`,
};

export const custom = {
  id: 'custom',
  name: 'Something else',
  priceLabel: 'Scoped per job',
  href: '/services',
  summary: 'Setup, custom work or a mix of offers. Scope and price agreed in writing first.',
};

export interface ComparisonRow {
  label: string;
  licence: string;
  fullBuild: string;
  hosted: string;
}

export const comparison: ComparisonRow[] = [
  {
    label: 'Files',
    licence: 'Source files, emailed after payment',
    fullBuild: 'Your site, adapted, installed and launched',
    hosted: 'Included',
  },
  {
    label: 'Licence',
    licence: 'One end product',
    fullBuild: 'One end product',
    hosted: 'Included with the site',
  },
  {
    label: 'Updates',
    licence: `${UPDATES_MONTHS} months`,
    fullBuild: `${UPDATES_MONTHS} months`,
    hosted: 'Ongoing',
  },
  {
    label: 'Support',
    licence: `${SUPPORT_DAYS} days of bug fixes`,
    fullBuild: `${SUPPORT_DAYS} days after launch`,
    hosted: 'Ongoing small changes',
  },
  {
    label: 'Hosting',
    licence: 'You host it',
    fullBuild: 'Optional',
    hosted: 'On zouwop-server',
  },
  {
    label: 'Maintenance',
    licence: 'None',
    fullBuild: 'None',
    hosted: 'Included',
  },
  {
    label: 'Domain & launch',
    licence: 'No',
    fullBuild: 'Yes',
    hosted: 'Yes',
  },
];
