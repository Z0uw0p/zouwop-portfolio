# Analytics and discovery

How zouwop.com measures the store without cookies, a consent banner, or a
third-party tracker.

## What is collected

- **Cloudflare Web Analytics** — cookieless page views, referrers, paths,
  countries and devices. There is no cookie, no fingerprint, no session replay
  and no cross-site tracking, so no banner is required.
- **`/go/<slug>` redirects** — the store's buy-click counter.

Nothing else is loaded. There is no Google Analytics, no pixel, no heatmap and
no A/B script.

## Turning the beacon on

`src/layouts/Layout.astro` renders the Cloudflare beacon only when all of these
are true:

| Condition | Meaning |
|---|---|
| `import.meta.env.PROD` | a built site, never `npm run dev` |
| `PUBLIC_ANALYTICS !== 'off'` | an escape hatch for a local production build |
| `PUBLIC_CF_ANALYTICS_TOKEN` is non-empty | the site token from the Cloudflare dashboard |

Set the token in **Cloudflare Pages → your project → Settings → Environment
variables** as `PUBLIC_CF_ANALYTICS_TOKEN`, for the production environment, then
redeploy. Do not commit the token. Because `npm run dev` is not a production
build, it never renders the beacon; a local `npm run build` without the token
does not either.

To deliberately build production HTML without analytics, set
`PUBLIC_ANALYTICS=off`.

## The `/go/<slug>` buy-click metric

Product CTAs point at `/go/<slug>`, not at Stripe directly.
`public/_redirects` contains one 302 per available template:

```
/go/forge-trades https://buy.stripe.com/... 302
```

The file is generated from `src/data/stripe-links.json` by
`scripts/sync-redirects.mjs`:

```bash
npm run sync:redirects          # write public/_redirects
npm run sync:redirects -- --check   # CI: fail on drift
```

`npm run build` runs the check through `prebuild`. An unknown `/go/<slug>` has
no rule and no file, so Cloudflare Pages serves the 404 page with a 404 status.

Fill `src/data/stripe-links.json` with one entry per template you can actually
sell:

```json
{
  "forge-trades": "https://buy.stripe.com/..."
}
```

The build rejects a Stripe link for an unknown slug, a link on a
`coming-soon` template, a non-https URL, and a placeholder containing `...`.
A template that is `available` but has no link gets no redirect and the product
button still says "Available soon"; `sync-redirects` prints a warning naming it.

## What the click count can and cannot tell you

**Can tell you**

- How many times each `/go/<slug>` URL was requested, per template.
- Which templates get viewed, from normal Web Analytics path data.
- Rough referrer and country mix for store traffic.

**Cannot tell you**

- **Whether the click became a sale.** That is in Stripe Dashboard → Payments.
  Compare the two by hand; there is no shared identifier.
- **Who clicked.** No cookie, no user id, no per-buyer data. Stripe owns the
  buyer identity on the receipt.
- **Why they clicked.** No funnels, no scroll depth, no session replay, no
  attribution beyond the referrer the browser sends.
- **A bot-free number.** Link scanners, preview crawlers, uptime checks and
  curious curl requests hit `/go/*` too. Treat the number as an upper bound.
- **A beacon event for the redirect itself.** The Cloudflare JS beacon fires on
  rendered pages; a 302 never renders a page. Whether `/go/*` appears as a path
  depends on the edge analytics you have enabled. Verify it in the Cloudflare
  dashboard after the first click. If your plan only reports beacon page views,
  the redirect will not appear there — use Cloudflare's request analytics /
  Logpush for `/go/*`, or ask for a 200 interstitial before the redirect (at the
  cost of one extra hop).

The honest summary: `/go/*` measures **buy intent**, not sales, and only
approximately.

## Sitemap and robots

`npm run build` writes `dist/sitemap.xml` after `astro build` with
`scripts/build-sitemap.mjs`. It lists every indexable page, excludes
`/thank-you/`, `/templates/*/preview/`, `/templates/*/demo/` and `/go/`, and
uses `lastmod` from the last git commit that touched the page's source (HEAD
date as fallback, omitted when git is unavailable).

`public/robots.txt` points at `https://zouwop.com/sitemap.xml`.

## Current gap

No template has a Stripe Payment Link yet, so `src/data/stripe-links.json` is
empty and `/go/*` has no rules. The mechanism and its checks are in place; the
click metric starts the moment the links are added.
