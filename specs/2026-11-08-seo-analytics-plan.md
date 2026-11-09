# Store SEO, structured data, social previews and analytics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make zouwop.com indexable and measurable with a zero-dependency sitemap, per-page JSON-LD, per-template Open Graph images, and Cloudflare Web Analytics plus `/go/<slug>` click redirects.

**Architecture:** Everything is generated from the existing catalog at build time. A post-build Node script walks `dist/` to write `sitemap.xml`; SEO helpers derive titles/descriptions from `templates.ts`; the product page emits JSON-LD; `public/_redirects` is generated from a single Stripe-link map and checked by a script; the Analytics beacon lives in `Layout.astro` behind an env token.

**Tech Stack:** Astro 5 (static), Node 22 scripts, Cloudflare Pages (`_redirects`, `_headers`, Web Analytics), ffmpeg only as a one-off asset generator (never at build time).

## Global Constraints

- Zero new npm dependencies. No `@astrojs/sitemap`, no `sharp`, no image library at build time.
- No cookies, consent banner, fingerprinting, session replay, Google Analytics, or pixels.
- Price is formatted only through `src/lib/format-price.ts`; JSON-LD uses a decimal helper in that file.
- Product `<title>` ≤ 60 chars and meta description ≤ 155 chars, unique across all product pages, derived from catalog data.
- `npm run build` must stay offline and reproducible.
- Known data gaps (reported in the PR, not invented):
  - No template has a Stripe Payment Link (`buyUrl`) yet. `/go/<slug>` rules are generated only for links that exist, and the checker warns about every available template that has no link.
  - No Cloudflare Web Analytics token is committed. The beacon renders only when `PUBLIC_CF_ANALYTICS_TOKEN` is set in the Cloudflare Pages environment.

---

### Task 1: Price + SEO helpers

**Files:**
- Modify: `src/lib/format-price.ts`
- Create: `src/lib/seo.ts`

**Interfaces:**
- Produces: `formatCadAmount(cents: number): string` — `"500.00"`
- Produces: `productTitle(entry: TemplateEntry): string`
- Produces: `productDescription(entry: TemplateEntry): string`
- Produces: `productJsonLd(entry: TemplateEntry, site: URL): object`
- Produces: `breadcrumbJsonLd(entry: TemplateEntry, site: URL): object`
- Produces: `pricingJsonLd(input): object[]`

- [ ] Add `formatCadAmount` next to `formatCad`.
- [ ] Add the SEO helpers (see implementation).
- [ ] Run `npm run check`.

### Task 2: Layout — Open Graph, JSON-LD, analytics beacon

**Files:**
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Props: `image?: string`, `imageWidth?: number` (default 1200), `imageHeight?: number` (default 630), `imageAlt?: string`, `locale?: string` (default `en_CA`), `jsonLd?: object | object[]`.
- Produces: `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:locale`, `twitter:card=summary_large_image`, one JSON-LD `<script>` per object.
- Analytics: renders the Cloudflare beacon only when `import.meta.env.PROD && PUBLIC_CF_ANALYTICS_TOKEN` is non-empty and `PUBLIC_ANALYTICS !== 'off'`.

- [ ] Add props and render the tags/scripts.
- [ ] `npm run build` still passes.

### Task 3: Product page title, description, JSON-LD

**Files:**
- Modify: `src/pages/templates/[slug].astro`

- [ ] Use `productTitle` / `productDescription`.
- [ ] Pass `image={`/templates/${entry.slug}/og.jpg`}` and `jsonLd={[productJsonLd(entry, site), breadcrumbJsonLd(entry, site)]}`.
- [ ] Build and inspect one page.

### Task 4: 1200×630 JPEG per template (committed, source-cropped)

**Files:**
- Create: `scripts/make-og-images.mjs` (one-off, uses `ffmpeg`, not part of build)
- Create: `public/templates/<slug>/og.jpg` × 9

- [ ] Run the script to crop the top 1200×630 of each committed desktop WebP into `og.jpg`.
- [ ] Verify with `ffprobe` that every file is 1200×630 and JPEG.

### Task 5: Stripe link map, `/go/<slug>` redirects, CTA wiring

**Files:**
- Create: `src/data/stripe-links.json` (empty object; operator fills it)
- Modify: `src/data/templates.ts` (merge `buyUrl` from the map; validate slugs/URLs)
- Create: `scripts/sync-redirects.mjs` + `public/_redirects`
- Modify: `src/components/BuyButton.astro`, `src/pages/templates/[slug]/preview.astro`
- Modify: `package.json` (`sync:redirects`, `prebuild`)
- Modify: `docs/fulfilment.md`, `docs/catalog-sync.md`

- [ ] `_redirects` generated as `/go/<slug> <stripe-url> 302` for every available template with a link.
- [ ] `sync-redirects -- --check` fails on drift and on a link for an unknown/coming-soon slug; warns about available slugs with no link.
- [ ] Buy CTAs point at `/go/<slug>` when purchasable.

### Task 6: Sitemap + robots

**Files:**
- Create: `scripts/build-sitemap.mjs`
- Modify: `package.json` (`build`), `public/robots.txt`

- [ ] Walk `dist/`, exclude `/thank-you/`, `/templates/*/preview/`, `/templates/*/demo/`, `404`.
- [ ] Absolute URLs from `https://zouwop.com`; `lastmod` from git per source path, HEAD date fallback, omitted if git is unavailable.
- [ ] `robots.txt` adds `Sitemap: https://zouwop.com/sitemap.xml` and `Disallow: /go/`.

### Task 7: Pricing structured data

**Files:**
- Modify: `src/data/pricing.ts` (`licenceMaxCents`, `licenceOfferCount`)
- Modify: `src/pages/pricing.astro`

- [ ] Template licence → `Product` + `AggregateOffer` (real `lowPrice`/`highPrice`, `offerCount`, CAD).
- [ ] Full build → `Service` + `Offer` ($2000 CAD).
- [ ] Hosting → `Service` with no `offers` (price on request). No invented numbers, no `aggregateRating`.

### Task 8: Analytics docs

**Files:**
- Create: `docs/analytics.md`
- Modify: `README.md`

- [ ] Explain the beacon, the env vars, `/go/<slug>` click counting, and the limits (bots, no attribution, no per-buyer data, no consent banner).

### Task 9: SEO check + CI

**Files:**
- Create: `scripts/check-seo.mjs`
- Modify: `package.json` (`check:seo`), `.github/workflows/ci.yml`

- [ ] Parse every `dist/templates/*/index.html`; assert title/description lengths, uniqueness, and a valid `Product`/`Offer` JSON-LD block.
- [ ] Wire into `npm run build` and CI.

## Verification

- `npm run check`
- `npm run build` (runs prebuild sync checks, sitemap, SEO check)
- `npm run check:links`
- `npm run check:links -- --self-test`
- `npm run check:licence`
- Inspect `dist/sitemap.xml`, `dist/templates/*/index.html`, `dist/_redirects`.

## Validation output (Schema.org validator, 2026-11-08)

Posted each built page to `https://validator.schema.org/validate` (`html=`):

```
dist/templates/atelier-studio/index.html      objects=2 errors=0 warnings=0
dist/templates/fade-barbershop/index.html     objects=2 errors=0 warnings=0
dist/templates/forge-trades/index.html        objects=2 errors=0 warnings=0
dist/templates/meridian-clinic/index.html     objects=2 errors=0 warnings=0
dist/templates/photo-portfolio/index.html     objects=2 errors=0 warnings=0
dist/templates/rivage-coiffeur/index.html     objects=2 errors=0 warnings=0
dist/templates/taverna-restaurant/index.html  objects=2 errors=0 warnings=0
dist/templates/wavelength-musician/index.html objects=2 errors=0 warnings=0
dist/templates/website/index.html             objects=2 errors=0 warnings=0
dist/pricing/index.html                       objects=3 errors=0 warnings=0
```

Each product page emits `Product` + `BreadcrumbList`; `/pricing` emits
`Product` (AggregateOffer) + two `Service` blocks. No `aggregateRating` is
emitted anywhere.
