import { generatedTemplates } from './templates.generated';
import { overrides } from './templates.overrides';
import stripeLinksJson from './stripe-links.json';

export type TemplateStatus = 'available' | 'coming-soon';

export interface TemplatePreview {
  src: string;
  alt: string;
  kind: 'desktop' | 'mobile';
  width: number;
  height: number;
}

export interface ReleaseArtifact {
  zip: string;
  bytes: number;
  sha256: string;
  packagedAt: string;
}

/** Everything the private templates repo owns through release/catalog.json. */
export interface GeneratedTemplate {
  slug: string;
  name: string;
  niche: string;
  audience: string;
  stack: string[];
  version: string;
  blurb: string;
  tags: string[];
  priceCents: number;
  previews: TemplatePreview[];
  release: ReleaseArtifact;
}

/** The store's view: generated facts plus hand-written copy and commerce. */
export interface TemplateEntry extends GeneratedTemplate {
  description: string;
  features: string[];
  includes: string[];
  demoUrl?: string;
  buyUrl?: string;
  currency: 'CAD';
  hostedMonthlyCents?: number;
  status: TemplateStatus;
}

const generatedSlugs = new Set(generatedTemplates.map((template) => template.slug));
for (const slug of Object.keys(overrides)) {
  if (!generatedSlugs.has(slug)) {
    throw new Error(
      `templates.overrides.ts: "${slug}" is not in the generated catalog. ` +
        'Remove the override or run npm run sync:templates.',
    );
  }
}

const stripeLinks = stripeLinksJson as Record<string, string>;
for (const [slug, url] of Object.entries(stripeLinks)) {
  if (!generatedSlugs.has(slug)) {
    throw new Error(
      `stripe-links.json: "${slug}" is not in the generated catalog. ` +
        'Remove it or run npm run sync:templates.',
    );
  }
  if (!/^https:\/\//.test(url) || url.includes('...') || url.trim() !== url) {
    throw new Error(
      `stripe-links.json: "${slug}" must be a real https URL, not a placeholder.`,
    );
  }
}

export const templates: TemplateEntry[] = generatedTemplates.map((generated) => ({
  ...generated,
  description: generated.blurb,
  features: [],
  includes: [],
  currency: 'CAD',
  status: 'coming-soon',
  ...(stripeLinks[generated.slug] ? { buyUrl: stripeLinks[generated.slug] } : {}),
  ...(overrides[generated.slug] ?? {}),
}));

export const templatesBySlug: Record<string, TemplateEntry> = Object.fromEntries(
  templates.map((template) => [template.slug, template]),
);
