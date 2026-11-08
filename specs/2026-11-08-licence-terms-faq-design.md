# Store: licence, terms and FAQ — Design Spec

**Date:** 2026-11-08
**Issue:** [#15](https://github.com/Z0uw0p/zouwop-portfolio/issues/15)
**Status:** Approved (design), pending written-spec review
**Branch:** `Z0uw0p/store-licence-terms-and-faq-pages`

## Context

Templates are sold as one-off purchases, but the site has no page that answers "what am I
allowed to do with this?" in under a minute. This issue adds `/licence`, `/terms`, `/faq`,
the structured data behind them, and the mechanism that keeps the published licence and the
`LICENSE.txt` inside each ZIP from drifting apart.

**Decision already made with the user (2026-11-08):** this branch is self-contained.
The store pages that would link to the legal pages — `/templates`, product pages,
`/thank-you` — do not exist on `main` yet (issues #12, #14, #16 are open). Those links
land in those branches. This branch adds the pages, the data, the footer links, and the
parity doc. It does **not** build stand-in store pages.

The issue's design comment also fixes the sales framing: `/portfolio` stays a
case-study page and never repeats the sales copy. The rule appears in exactly three
places: `/licence`, the template product page summary (#12), and `docs/fulfilment.md`.

## Goals

- `/licence`, `/terms`, `/faq` build as static pages, one `h1` each, semantic sections.
- Every legal string lives in `src/data/*.ts`; the pages are layout only.
- The "one purchase = one end product" rule is stated once and reused verbatim.
- A mechanical, CI-enforced parity mechanism between `src/data/licence.ts` and the
  `LICENSE.txt` shipped in the private `templates` repo.
- Honest copy: no invented guarantees, no fake company details, no legal claims.

## Non-goals

- Legal advice or asserting legal correctness.
- GDPR / Québec Law 25 site data policy (separate issue).
- Automated licence enforcement or DRM.
- Sitemap, structured data, analytics (#17).
- `/templates`, product pages, `/thank-you`, the full `docs/fulfilment.md` (#12, #14).
- Reopening the Stripe + manual email fulfilment decision.

## Agreed policy content (source of truth for `licence.ts` / `terms.ts`)

Seller is **Zouwop**, Québec, Canada; contact `billing@zouwop.com` and the LinkedIn
profile from `src/data/site.ts`. Prices are CAD, $500 per template.

| Topic | Agreed wording (to be rendered as prose, one item each) |
| --- | --- |
| Rule | **One purchase covers one end product.** |
| Grant | Use, modify, and publish the template as one website for yourself or one client. Unlimited edits. Staging/duplicate copies for testing are fine. Remove the footer credit if you want. |
| Limits | No reselling or redistributing the template or its source as a template. No use in a competing template marketplace. No sharing the ZIP or a modified copy as a download. No claiming you wrote it. |
| Included | The files in the ZIP, fonts and placeholder art that ship with it, and the build scripts. |
| Not included | Third-party stock photos/fonts you swap in, a domain, hosting, email, and third-party service fees. Those are yours to licence and pay for. |
| Third-party assets | Placeholder images are for layout only; check each asset's own licence before publishing. The licence does not cover third-party assets you add. |
| Updates | Bug fixes and template updates emailed free for 12 months from purchase. No lifetime-update promise. |
| Support | 30 days of email support for bugs in the template as shipped; reply within one business day. Not covered: content changes, new features, hosting, third-party services. |
| Refunds | Sales are final once the ZIP is emailed, because files can't be returned. If the ZIP is broken or doesn't match the product page, I'll fix it or refund it. Redistribution ends the licence with no refund. |
| Transfer | You may hand the licence to a buyer of the end product **once**, keep no copy, and tell me in writing. |
| Taxes | Not registered for GST/QST, so no tax is added at checkout today. If that changes, tax is shown before payment. |
| Chargebacks | The licence and update emails pause while a charge is disputed. |
| Liability | Total liability is limited to the amount paid for the template. |
| Law | Québec, Canada. |

The French summary at the end of `/licence` is one paragraph, `lang="fr"`, with proper
accents and « » quotes. It promises nothing the English text does not:

> Une licence, un site. Un achat vous permet de publier le modèle comme un seul site web —
> pour vous ou pour un seul client — et de le modifier comme vous voulez. Vous pouvez
> transférer la licence une fois, avec ce site. Vous ne pouvez pas revendre, redistribuer
> ni partager le modèle lui-même, ni l'utiliser dans une place de marché de modèles. Les
> corrections de bogues sont envoyées par courriel pendant 12 mois. Les ventes sont
> finales une fois le fichier ZIP envoyé.

## Data model

```ts
// src/data/licence.ts
export interface LegalItem { title: string; body: string }

export const LICENCE_RULE = 'One purchase covers one end product.';

export const licence = {
  updated: '2026-11-07',
  rule: LICENCE_RULE,
  summary: LegalItem[],   // 3 bullets rendered in the short summary
  grant: LegalItem[],
  limits: LegalItem[],
  included: LegalItem[],
  notIncluded: LegalItem[],
  thirdParty: LegalItem[],
  updates: LegalItem[],
  support: LegalItem[],
  refunds: LegalItem[],
  transfer: LegalItem[],
  frSummary: string,
};
```

`src/data/terms.ts` and `src/data/faq.ts` follow the same `LegalItem` shape (FAQ groups
carry a `group` title and `items`). Types are shared from `src/data/legal.ts` to avoid a
circular import.

`LICENCE_RULE` is exported so #12 and the fulfilment doc import the exact string rather
than retyping it. The product page and `/licence` cannot drift.

## Page structure

- **`/licence`** — `h1`, `<time datetime="2026-11-07">`, a summary card with the rule and
  three bullets, a table of contents (in-page anchors, one per section), then sections in
  the issue's order: grant → limits → included → not included → third-party assets →
  updates → support → refunds → transfer → end of licence. French paragraph last.
- **`/terms`** — order process (Stripe Payment Link, email within one business day),
  CAD prices, taxes, delivery, refunds, chargebacks, liability, Québec law, contact.
- **`/faq`** — grouped *Buying*, *Using a template*, *Custom work*, *Bugs*; each question
  an `h3` with prose under it. Custom work states $75/h CAD, one-hour minimum, estimate
  agreed first, and points to `/services`.
- **`Footer.astro`** — adds Licence · Terms · FAQ alongside the existing links.

All three pages reuse `Layout.astro`, `.container`, `.card`, `.mono`, and the existing
tokens. No new palette, no new dependencies.

## Parity mechanism

`src/data/licence.ts` is the only source of the licence text.

1. `scripts/render-licence.mjs` renders the licence items to plain text (`LICENSE.txt`
   content) and prints a SHA-256 of that text.
2. The hash is pinned in `licence/parity.lock` in this repo **and** as a constant in the
   `templates` repo's CI.
3. `npm run check:licence` re-renders and compares. A wording change here changes the
   hash and fails CI until `parity.lock` is updated; the same hash in `templates` fails
   there until `LICENSE.txt` is re-vendored.

This is preferred over the issue's "shared markdown committed in both repos" because a
second copy of the legal text is exactly the duplication that causes drift, and because
the `templates` repo is private — a hash pin needs no cross-repo network access.
`docs/licence-parity.md` records the mechanism, the update checklist, and the note that a
Québec lawyer should review `/licence` and `/terms` before the first sale.

## Risks and open items (to flag in the PR)

- **No sitemap exists.** `@astrojs/sitemap` is not installed; sitemap inclusion is #17.
- **No `/templates`, product page, `/thank-you`.** The acceptance links from those pages
  land in #12/#14. `Footer.astro` is linked here.
- **`docs/fulfilment.md` does not exist.** This branch creates it with only the licence
  section and the shared rule sentence; #14 expands it. If that overlap is unwanted, the
  rule sentence moves to #14 and this acceptance box stays open.
- **`/services` has no hourly rate.** Add a "Build on a template" line at $75/h CAD.
- **No GST/QST registration number** is printed, per the agreed wording.
- **`updated: 2026-11-07`** is the issue's date; bump it when the text changes.

## Acceptance mapping

| Issue criterion | Where handled |
| --- | --- |
| Three pages build, linked from footer | pages + `Footer.astro` |
| Sitemap | deferred to #17 (flagged) |
| Product page / `/thank-you` / `/templates` links | #12 / #14 (flagged) |
| Items render as headings + prose, no duplication | data-driven pages |
| Rule in three places | `LICENCE_RULE`; `/licence` here, product page #12, `docs/fulfilment.md` here (stub) |
| French summary `lang="fr"`, accents, « » | `/licence` |
| `npm run check` + `check:links` | verified locally and in CI |
| `docs/licence-parity.md` + review note | written here |
| PR into `main`, CI green | CI workflow unchanged |

## Testing

- `npm run check` — Astro/TS types.
- `npm run build` — static output.
- `npm run check:links` — every internal link and in-page anchor resolves.
- `npm run check:licence` — rendered licence hash matches `parity.lock`.
- Manual: 360px layout, one `h1` per page, TOC keyboard-reachable, French block has
  `lang="fr"`, no `$` price literal outside the formatter (there is no formatter yet;
  prices appear only as policy text).
