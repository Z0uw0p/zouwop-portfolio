import type { TemplateEntry } from '../data/templates';
import { formatCadAmount } from './format-price';

const BRAND = 'Zouwop';

/** `Forge Trades template — trades | Zouwop` — unique, ≤ 60 chars. */
export function productTitle(entry: TemplateEntry): string {
  return `${entry.name} template — ${entry.niche} | ${BRAND}`;
}

/** `Forge Trades: a trades website template built with HTML, CSS, JavaScript.` — unique, ≤ 155 chars. */
export function productDescription(entry: TemplateEntry): string {
  return `${entry.name}: a ${entry.niche} website template built with ${entry.stack.join(', ')}.`;
}

export function seoImagePath(entry: TemplateEntry): string {
  return `/templates/${entry.slug}/og.jpg`;
}

function absolute(path: string, site: URL): string {
  return new URL(path, site).href;
}

export function productJsonLd(entry: TemplateEntry, site: URL): Record<string, unknown> {
  const productUrl = absolute(`/templates/${entry.slug}/`, site);
  const availability =
    entry.status === 'available'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/PreOrder';
  const offerUrl = entry.buyUrl?.trim() ? absolute(`/go/${entry.slug}`, site) : productUrl;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: entry.name,
    description: entry.description,
    sku: `${entry.slug}-${entry.version}`,
    brand: { '@type': 'Brand', name: BRAND },
    url: productUrl,
    image: [absolute(seoImagePath(entry), site)],
    offers: {
      '@type': 'Offer',
      price: formatCadAmount(entry.priceCents),
      priceCurrency: entry.currency,
      availability,
      url: offerUrl,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function breadcrumbJsonLd(entry: TemplateEntry, site: URL): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absolute('/', site) },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Templates',
        item: absolute('/templates/', site),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: entry.name,
        item: absolute(`/templates/${entry.slug}/`, site),
      },
    ],
  };
}

export interface PricingJsonLdInput {
  site: URL;
  licenceMinCents: number;
  licenceMaxCents: number;
  licenceOfferCount: number;
  fullBuildName: string;
  fullBuildCents: number;
  hostedName: string;
  hostedSummary: string;
}

/**
 * Honest mapping: the licence is the only thing sold as a product, and every
 * licence really costs the same, so an AggregateOffer with a real low price is
 * accurate. Full build is a service with one fixed price; hosting is sold at a
 * quote, so it has a Service entry and no Offer at all — never an invented price.
 */
export function pricingJsonLd(input: PricingJsonLdInput): Record<string, unknown>[] {
  const aggregate: Record<string, unknown> = {
    '@type': 'AggregateOffer',
    priceCurrency: 'CAD',
    lowPrice: formatCadAmount(input.licenceMinCents),
    highPrice: formatCadAmount(input.licenceMaxCents),
    offerCount: input.licenceOfferCount,
    availability: 'https://schema.org/InStock',
    url: absolute('/templates/', input.site),
  };

  const provider = { '@type': 'Organization', name: BRAND, url: absolute('/', input.site) };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Zouwop website template licence',
      description:
        'A one-time licence to build and run one end product from a Zouwop website template.',
      brand: { '@type': 'Brand', name: BRAND },
      url: absolute('/templates/', input.site),
      offers: aggregate,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: input.fullBuildName,
      description:
        'A Zouwop website template adapted to your content and launched on your domain.',
      provider,
      offers: {
        '@type': 'Offer',
        price: formatCadAmount(input.fullBuildCents),
        priceCurrency: 'CAD',
        availability: 'https://schema.org/InStock',
        url: absolute('/services', input.site),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: input.hostedName,
      description: input.hostedSummary,
      provider,
    },
  ];
}
