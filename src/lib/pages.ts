const pageFiles = new Set(
  Object.keys(import.meta.glob('../pages/**/*.astro')),
);

/**
 * True when a page with this route exists at build time. Used for links to
 * pages that ship in their own issue (licence, pricing) so the build never
 * emits a link to a page that does not exist yet.
 */
export function pageExists(route: string): boolean {
  const clean = route.replace(/^\/+|\/+$/g, '');
  const file = clean ? `../pages/${clean}.astro` : '../pages/index.astro';
  return pageFiles.has(file);
}
