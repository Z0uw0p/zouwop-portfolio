# Pricing Page — Design Spec

**Date:** 2026-11-08
**Status:** Approved
**Issue:** #16 — pricing page and bundles
**Depends on:** #12 (`src/data/templates.ts`), #14 (`BuyButton`), #15 (`/licence`) — all merged except #15, which only supplies copy.

## Decisions

- **No bundle product.** Nine templates at `$500` with no set set-price do not
  justify a column, a saving badge, or a product-page line. `/pricing` sells the
  three offers from the 2026-11-08 pricing comment: **Template licence**,
  **Full build**, **Hosting + maintenance**. A bundle model can be added later
  without UI churn; shipping dormant UI now would be dead weight on a short page.
- **Manual email fulfilment.** The site never hosts a ZIP and never links one.
  `public/` holds preview `.webp` files only; `templates.generated.ts` carries the
  ZIP name and checksum as metadata, but `entry.release` is never rendered and has
  no URL. Copy says "emailed after payment", never "download".
- **`/templates` stays a store.** The existing card catalog is not rewritten and
  no pricing sections are added to it. Only the two hardcoded `$` strings (meta
  description and outro) move into data-derived expressions.
- **`/pricing` stays short.** One intro sentence, one comparison, one hosting
  block, one closing paragraph, links. No FAQ, no testimonials, no long pitch.
- **Prices live in `src/data/pricing.ts`** plus the existing
  `TemplateEntry.priceCents`. No `.astro` file contains a price literal.

## Price model

`src/data/pricing.ts` imports `templates` and derives the single-licence price
from the catalog:

- `licenceMinCents` = lowest `priceCents` among `status: 'available'` entries;
- `licenceFrom` = true when available entries do not share one price, so the
  table can read "from $500" instead of lying;
- `fullBuild` = `{ priceCents: 200_000, cadence: 'one-time', cta: '/services' }`;
- `hosted` = `{ priceCents: null, cadence: 'monthly', cta: mailto billing }` —
  no number is printed until Zouwop sets one; renders `$X/mo` automatically when
  it is set;
- `custom` = `{ priceLabel: 'Scoped per job', href: '/services' }` — a pointer,
  not a package;
- `comparison` = ordered rows consumed by the table.

Prices are integers in minor units. The only formatter is
`src/lib/format-price.ts`:

- `formatCad(cents)` → `$1,050.50 CAD` (buy CTA, sticky bar);
- `formatCadShort(cents)` → `$500` (cards, table, copy);
- both throw on negative or non-finite input, so a negative saving or a broken
  price cannot render.

`src/lib/money.ts` is renamed to `format-price.ts`; `PriceTag`, `BuyButton` and
`StickyBuyBar` import it. `PriceTag` stops hardcoding `$`.

## /pricing page

Route: `src/pages/pricing.astro`, `path="/pricing"`.

1. `<h1>Pricing</h1>` + one intro sentence naming the three offers.
2. Comparison `<table>`:
   - visible `<caption>`: "What each offer includes";
   - `<th scope="col">` per offer, with price under the name;
   - `<th scope="row">` per feature;
   - one CTA per offer in a row directly below the table, aligned to the same
     column grid (not inside `<tfoot>`, because the Astro compiler mis-renders
     repeated `<a>` elements inside a table and duplicates them into the next
     section);
   - desktop: real table; below `720px`: each `<tr>` becomes a card, the `thead`
     is visually hidden but kept in the accessibility tree, and each `<td>` shows
     its column name through `data-label` + `::before`. The CTA row stacks into
     full-width buttons. No horizontal scroll, no client JS.
3. `#hosted` section: what hosting covers (hosting on zouwop-server, updates,
   backups, small changes), monthly price on request or `$X/mo` once set, one CTA.
4. Closing paragraph: what the full build buys, and — honestly — "if you expect to
   use more than one template, email me and I'll price the set".
5. Small print: prices in CAD, Stripe, files emailed within one business day,
   link to `/licence`.

Comparison rows (copy approved in design review):

| Row | Template licence | Full build | Hosting + maintenance |
|---|---|---|---|
| Files | Source files, emailed after payment | Your site, adapted, installed and launched | Included |
| Licence | One end product | One end product | Included with the site |
| Updates | 12 months | 12 months | Ongoing |
| Support | 30 days of bug fixes | 30 days after launch | Ongoing small changes |
| Hosting | You host it | Optional | On zouwop-server |
| Maintenance | None | None | Included |
| Domain & launch | No | Yes | Yes |

`12 months` and `30 days` come from `UPDATES_MONTHS` / `SUPPORT_DAYS` in
`src/data/fulfilment.ts` so `/licence` and `/pricing` cannot drift.

## Product page additions

`src/pages/templates/[slug].astro`, in the existing Hosting section:

- if `hostedMonthlyCents` is set: price per month, what is covered in one line,
  link to `/pricing#hosted`;
- if unset: "monthly membership — see what hosting covers" with the same link.

No bundle line (decision above). No other structural change, so the product page
does not grow.

## Navigation

- `Footer.astro`: add `Pricing` beside `Templates`.
- `/templates` already renders "See pricing" through `pageExists('/pricing')`,
  which becomes true when the page exists — no conditional code change needed
  beyond the data-derived description/outro.

## Out of scope

Bundle pricing, coupons, subscription billing, currency switching, JSON-LD
(#17), and rewriting `/templates`. Non-store `$` copy in `src/data/links.ts`
(affiliate/referral rewards) and `src/data/services.ts` (tech call) is left as is;
those are marketing amounts, not store prices, and are recorded in the PR grep.

## Verification

- `npm run check`, `npm run build`, `npm run check:links`,
  `npm run check:links -- --self-test`.
- Price-propagation proof: change `fullBuild.priceCents` and one template's
  `priceCents`, rebuild, diff the emitted HTML, revert. Show before/after in the
  PR.
- Grep `'$'` in `src/`; PR records every remaining literal and why it is out of
  scope.
- 360px and 1280px check: cards at 360, table at 1280, keyboard focus visible,
  `<caption>` and scoped headers present, no horizontal scroll.
