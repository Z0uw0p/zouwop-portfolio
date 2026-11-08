# Store: Stripe Payment Links + manual fulfilment — Design Spec

**Date:** 2026-11-08
**Issue:** [#14](https://github.com/Z0uw0p/zouwop-portfolio/issues/14)
**Branch:** `Z0uw0p/store-stripe-payment-links-manual-fulfilment`

## Context

Issue #14 completes the purchase path that #12 starts: a Stripe Payment Link per
template, honest fulfilment copy, and a `/thank-you` page. The decision to use
**Payment Links plus manual email fulfilment** is already made — no backend, no
webhook, no Stripe SDK, no card fields.

**Dependency decision (2026-11-08):** this branch is self-contained. #12 (the
`/templates` shop and product pages) is not on `main`, so this branch ships the
purchase components, `/thank-you`, and the fulfilment docs, and leaves the
product-page wiring for the #12 merge. #15 (`/licence`) is also not on `main`;
every CTA must link to `/licence` or `check:links` fails, so this branch adds a
minimal stopgap `/licence` page that #15 replaces with the full version.

The real templates repo currently contains two templates (`photo-portfolio`,
`website`); all copy is data-driven so the page count follows the catalog.

## Goals

- One `BuyButton` renders every purchase CTA, with no dead anchors.
- A `/thank-you` page that is honest about manual delivery, noindex, and can
  name the purchased template from `?template=<slug>` without trusting it.
- A fulfilment runbook an operator can follow for every sale.
- No price literal outside a single CAD formatter.

## Non-goals

- Checkout Sessions, webhooks, automated delivery, licence keys, invoicing,
  taxes, refunds automation.
- Building `/templates` pages, the catalog index, or product-page layout (#12).
- The full licence/terms/FAQ set (#15).

## Components and data

| File | Responsibility |
|---|---|
| `src/lib/money.ts` | `formatCad(cents)` — the only place a price is formatted. `Intl.NumberFormat('en-CA')`, `CAD`, zero fraction digits for whole dollars. |
| `src/data/fulfilment.ts` | Shared strings: `LICENCE_RULE`, `BILLING_EMAIL`, `DELIVERY_SLA`, `DELIVERY_INCLUDES`, `UPDATES_MONTHS`, and pre-encoded mailto helpers. |
| `src/components/BuyButton.astro` | Price, Stripe anchor, licence line, invoice mailto; disabled-looking "Available soon — email me" when it cannot be bought. `compact` variant for the sticky bar. |
| `src/components/StickyBuyBar.astro` | Mobile-only sticky bar (name + price + compact CTA) for #12 to place before the footer. |

Rules:

- `canBuy = status === 'available' && buyUrl` (non-empty after trim).
- When `canBuy` is false the component renders **no anchor with an href** — only
  a muted block and a `mailto:` enquiry.
- The Stripe link opens in the same tab (`target` omitted) so the Payment Link's
  success URL returns the buyer to `/thank-you`. `rel="noopener"` is still set.
- The invoice fallback subject is `Template purchase — <name>`, passed through
  `encodeURIComponent`.

## `/thank-you`

- `Layout.astro` gains `noindex?: boolean`, which emits
  `<meta name="robots" content="noindex">`.
- Copy: payment received, files sent by hand from `billing@zouwop.com` within
  one business day; if missing, email the Stripe receipt number; the email
  contains the ZIP, `LICENSE.txt`, and README; link to `/licence`; free bug-fix
  and update emails for 12 months.
- `?template=<slug>` is read by a tiny `is:inline` script against a JSON slug →
  name map serialised from the catalog. Only `textContent` is written; unknown
  or missing slugs leave the generic sentence in place.
- `public/robots.txt` disallows `/thank-you`. No sitemap exists on `main` (#17),
  so "absent from the sitemap" is satisfied trivially and recorded in the PR.
- The words "instant download" appear nowhere.

## `/licence` stopgap

- `src/pages/licence.astro` renders only the agreed rule, grant, limits,
  refunds/support, updates, and contact wording carried from the #15 design.
- It imports `LICENCE_RULE` and the SLA from `src/data/fulfilment.ts`, so the
  buy button, thank-you page, licence page, and runbook cannot contradict each
  other. #15 replaces the page; the shared strings survive.

## Fulfilment runbook

`docs/fulfilment.md`, linked from `README.md`:

- Stripe Payment Link setup per template: CAD price, collect customer email,
  success URL `https://zouwop.com/thank-you?template=<slug>`, promo codes
  allowed, link stored as `buyUrl` in `templates.overrides.ts`.
- Per-sale checklist: confirm payment → pull the ZIP from `release/` → email
  ZIP + `LICENSE.txt` + receipt reference → log buyer and licence number →
  confirm delivery.
- Refund/dispute path and the one-business-day SLA.
- Checksum policy: publish the catalog `sha256`; no ZIP password by default.

## Verification

- `npm run check`
- `npm run build`
- `npm run check:links` and `npm run check:links -- --self-test`
- Grep that no `$` price literal ships outside `src/lib/money.ts` and the docs.
- A real Stripe test-mode Payment Link walk-through needs account access; it is
  flagged as an open PR checkbox rather than simulated.

## Risks

- **Product-page wiring deferred.** Acceptance items that require a product page
  cannot be demonstrated until #12 merges; the components are ready.
- **`/licence` stopgap conflicts with #15.** The #15 page wins on merge; the
  shared strings in `fulfilment.ts` must be re-exported by `licence.ts` then.
- **Stripe links do not exist yet.** `buyUrl` stays empty, so the site shows
  "Available soon" rather than a dead anchor.
