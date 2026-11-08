# Template Shop — Design Spec

**Date:** 2026-11-08
**Status:** Approved
**Scope:** Issue #12 — a template shop at `/templates`, separate from `/portfolio`.

## Why the two sections are separate

`/portfolio` answers *what has Zouwop built for clients?* `/templates` answers
*what can I buy and run myself?* They share a design language, not a page.

Mixing them made both weaker: a shop buried inside a case study, and a portfolio
that read like a price list. So:

- `/portfolio` stays, as client work and case studies — no prices, no buy
  buttons, no sale framing.
- `/templates` is the shop — one card per catalog entry, one product page each.
- The two cross-link in prose ("I built this one for a client — the template
  version is here"), never by sharing a page.
- `Header.astro` links both as ordinary pages; neither owns the other.

## Routes

| Route | Purpose |
|---|---|
| `/templates/` | The catalog: intro, one large card per entry, hosting/build outro. |
| `/templates/<slug>/` | Product page, generated from the catalog by `getStaticPaths`. |
| `/portfolio/` | Unchanged in structure; copy and the Béatrice entry reframed as a case study. |

`output: 'static'`; no `_redirects` entry for `/portfolio`.

### Conditional links to sibling issues

`/licence` and `/pricing` ship in separate issues. To keep `check:links` green
on this branch, `src/lib/pages.ts` reports whether a page file exists at build
time, and the templates pages only render those links when the target page is
present. Once the sibling pages land, the links appear with no further edit.

## The card format

The index is a catalog of large cards, not a thumbnail grid:

- one card per template, single column on mobile, `repeat(auto-fit,
  minmax(520px, 1fr))` from 640px, `32px` gap;
- each card is a `.card` panel (`--bg-soft`, `1px solid var(--border)`, `14px`
  radius) with `24px` padding;
- header: name as `h2` (linked to the product page), then a mono meta line in
  `--orange`, uppercase, `12px`, letter-spacing `.06em` reading
  `<niche> · licence $500`, and one-sentence blurb in `--text-dim`;
- body: `TemplateFigure` — the full-page desktop capture scaled to the column
  width, with the phone capture beside it (`150px`, `14px` radius), `16px` gap.
  Both are `<a href>` to the full image, with explicit `width`/`height` and
  `loading="lazy"`;
- footer: a "What's included →" link to the product page, and the stack in mono
  microcopy;
- at 360px the captures stack and the phone capture stays at `150px`.

The hosting segment of the meta line renders only when `hostedMonthlyCents` is
set. No monthly number is printed while hosting is unpriced.

## Data model

The catalog merges two files, matching the catalog sync from issue #13 (merged
before this work landed):

- `src/data/templates.generated.ts` — machine-owned facts from the templates
  repo (`slug`, `name`, `niche`, `audience`, `stack`, `version`, `blurb`,
  `tags`, `priceCents`, `previews`, `release`). Never edited by hand.
- `src/data/templates.overrides.ts` — store-owned copy and commerce for each
  slug: `niche` label, `description`, `features`, `includes`, `priceCents`,
  `currency`, `buyUrl`, `hostedMonthlyCents`, `status`.
- `src/data/templates.ts` — the merge. Generated data first, overrides second;
  an override for a slug that is not in the generated catalog fails the build.

The merged `TemplateEntry` is the shape the pages consume:

```ts
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
```

Adding a template to the generated catalog produces a card and a product page
with no markup edits; adding an override only changes copy and commerce.

- `priceCents` is `50000` for every entry.
- `buyUrl` is absent until the Stripe issue lands; the buy CTA falls back to a
  prefilled `mailto:billing@zouwop.com`.
- `status: 'coming-soon'` renders a "Coming soon" badge instead of the buy CTA
  and still builds a page.

## Components

| Component | Responsibility |
|---|---|
| `TemplateFigure.astro` | Desktop + phone capture pair. Both are `<a href>` to the full image, keyboard operable, no JS lightbox. `size="product"` widens the phone column to `200px` on desktop. |
| `PriceTag.astro` | Formats `priceCents` as `$500`; optional `suffix` for a unit. |
| `TemplateCard.astro` | One catalog card: header, figure, product link and stack. |

`src/lib/pages.ts` provides `pageExists(route)` for the conditional links.

## Migration

Previews and generated metadata come from the templates repo through the
issue #13 sync:

```bash
npm run sync:templates -- --from ../templates
```

The nine entries: `forge-trades`, `fade-barbershop`, `rivage-coiffeur`,
`taverna-restaurant`, `atelier-studio`, `wavelength-musician`,
`meridian-clinic`, `photo-portfolio`, `website`. The sync reads each preview's
intrinsic WebP dimensions, so every `img` has explicit `width`/`height` and no
layout shift. The photo-portfolio phone capture is `195×9416`; the rest are
`390` wide. `scripts/fixtures/catalog.sample.json` is refreshed so
`sync:templates -- --check` (and the `prebuild` hook) stays green in CI.

The nine overrides live in `src/data/templates.overrides.ts`, all
`status: 'available'`, `priceCents: 50000`, with `features`/`includes` and the
human niche labels.

`src/data/portfolio.ts` keeps its screenshots and gains `templateSlug`; pricing
and `buyEmail` are removed. `public/portfolio/beatrice/*` is untouched.

## Risks

- **Tall full-page captures.** Both previews are full-page screenshots, so the
  phone column can be very tall. The figure is height-agnostic; a future change
  could crop the phone to a viewport ratio if the effect is too heavy.
- **Transitional purchase flow.** Until `buyUrl` exists, buying is an email
  handover. This is deliberate and matches the current site pattern.
- **Conditional links.** If the sibling `/licence` and `/pricing` issues are
  closed without adding their pages, the links simply stay absent — no broken
  links, but also no entry point. Add the pages and they appear.
- **Fixture ahead of releases.** Only `photo-portfolio` and `website` have
  packaged ZIPs in the templates repo today. The fixture carries all nine so
  the shop shows nine products; the sync's carry-over safety keeps the seven
  `available` overrides when a real sync sees a shorter catalog. Re-run the
  sync (and commit the refreshed fixture) once the other seven are packaged.
- **Generated preview dimensions.** The sync reads dimensions from the actual
  WebP, so the previous placeholder `1440×900`/`390×844` values are gone. If a
  preview is replaced upstream, re-run the sync rather than editing the
  generated file.
