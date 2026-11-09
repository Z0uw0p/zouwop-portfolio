import manifest from './demos.json';
import { templatesBySlug } from './templates';

export type DemoStatus = 'available' | 'coming-soon';

export interface DemoEntry {
  status: DemoStatus;
}

export const demos = manifest as Record<string, DemoEntry>;

for (const slug of Object.keys(demos)) {
  if (!templatesBySlug[slug]) {
    throw new Error(`demos.json: "${slug}" is not in the template catalog.`);
  }
}

export function demoFor(slug: string): DemoEntry {
  return demos[slug] ?? { status: 'coming-soon' };
}

/** True when a static demo has been committed for this template. */
export function hasDemo(slug: string): boolean {
  return demoFor(slug).status === 'available';
}

export function demoPath(slug: string): string {
  return `/templates/${slug}/demo/`;
}

export function previewPath(slug: string): string {
  return `/templates/${slug}/preview/`;
}
