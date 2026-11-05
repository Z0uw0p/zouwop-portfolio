# Organize Links — Design Spec

**Date:** 2026-11-05
**Status:** Approved
**Scope:** Issue #9 — separate referrals from affiliates on `/links`, add DigitalOcean, and placeholder Hostinger and Proton.

## Context

`/links` currently renders one flat list titled "Referrals". That is inaccurate:
Shopify is an affiliate link where only the site owner earns a commission, while
Wealthsimple, Wise, and Tangerine are two-sided referrals. Issue #9 asks to
organize the page by type and to start adding affiliate partners that fit the
self-hosting / web-infrastructure audience.

The user has a live DigitalOcean affiliate link, has applied for Hostinger and
Proton affiliates, and wants their cards visible as "Coming soon" placeholders
until approval.

## Goals

- Make the referral-vs-affiliate distinction explicit on `/links`.
- Add DigitalOcean as a live affiliate offer.
- Show Hostinger and Proton as visible, non-clickable "Coming soon" cards.
- Keep the page static, accessible, and consistent with the existing design.

## Non-goals

- Applying for or negotiating affiliate programs.
- Adding tracking, analytics, or redirects.
- Changing page routing (`/links` stays the only URL).
- Adding Hostinger or Proton outbound links before the user supplies them.

## Decisions

- One page with **Affiliates** and **Referrals** in two columns on wide screens,
  stacking vertically below 900px.
- Affiliates show live offers first, then pending placeholders.
- Pending cards render a non-interactive "Coming soon" pill instead of a CTA and
  have no outbound link.
- DigitalOcean is classified as an affiliate because only the site owner
  receives credit from the link.

## Data model

`src/data/links.ts` exports a single `offers` array.

```ts
type OfferKind = 'referral' | 'affiliate';
type OfferStatus = 'live' | 'pending';

interface Offer {
  id: string;
  kind: OfferKind;
  status?: OfferStatus;      // defaults to 'live'
  name: string;
  url?: string;              // required when status is 'live'
  code?: string;
  headline: string;
  pitch: string;
  reward?: string;
  steps?: string[];
  ctaLabel?: string;
  secondary?: { label: string; href: string };
  terms?: string;
  badge?: { src: string; alt: string };
}
```

- `url`, `reward`, `steps`, and `ctaLabel` are optional so a pending offer can
  exist without inventing a link or copy.
- The page filters by `kind` and renders pending offers with no anchor.

## Page structure

`src/pages/links.astro`:

```
h1 Links
intro paragraph (max-width 65ch)

two-column grid at ≥900px, one column below

left column
  h2 Affiliates
  p  "I earn a commission or credit when you sign up. You pay the same price."
  article (live): Shopify, DigitalOcean
  article (pending): Hostinger, Proton with "Coming soon" pill

right column
  h2 Referrals
  p  "We both get a bonus when you sign up."
  article: Wealthsimple, Wise, Tangerine
```

- Card names become `h3` under the section `h2`.
- Section headings use the existing typographic scale.
- The page container widens from 640px to 1000px to fit two columns.
- No shared card markup is extracted; the current card is small enough to
  duplicate per section.

## DigitalOcean card copy

- id: `digitalocean`
- kind: `affiliate`
- name: `DigitalOcean`
- url: `https://m.do.co/c/f247ce82b5fe`
- headline: `$25 in DigitalOcean credit`
- pitch: `Developer-friendly cloud for VPS, Docker, and self-hosted apps — a small server without the big-provider learning curve.`
- reward: `I get $25 in DigitalOcean credit once you sign up and pay your first $25 of usage — no extra cost to you.`
- steps:
  1. `Open my referral link and create a DigitalOcean account.`
  2. `Add a payment method and use the platform normally.`
  3. `Once you have spent and paid your first $25, I receive $25 in credit.`
- ctaLabel: `Start on DigitalOcean →`
- terms: `Referral credit is paid to me by DigitalOcean and does not change what you pay. DigitalOcean sets the exact credit rules per account.`
- badge: `https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg`

The badge renders as a decorative image (`alt=""`) in the card. The CTA carries
the tracking link.

## Pending placeholders

- **Hostinger** — affiliate, `status: 'pending'`; headline
  `Self-hosting-friendly VPS hosting`; pitch about cheap VPS plans for small
  self-hosted stacks.
- **Proton** — affiliate, `status: 'pending'`; headline
  `Private email, VPN, and drive`; pitch about privacy-first tools for moving
  services off Big Tech.

Pending cards show name, headline, pitch, and a `Coming soon` pill. They render
no code row, steps, CTA, or terms.

## Existing offers

- Wealthsimple, Wise, Tangerine → `kind: 'referral'`.
- Shopify → `kind: 'affiliate'`.

Ordering inside Referrals is unchanged.

## Files

- `src/data/links.ts` — new kinds, statuses, DigitalOcean, placeholders.
- `src/pages/links.astro` — two sections, section copy, pending rendering,
  badge image, `h2`/`h3` hierarchy.
- `specs/2026-11-05-organize-links-design.md` — this document.

## Accessibility

- `h1` → `h2` section → `h3` card hierarchy.
- Pending cards are not links; "Coming soon" is plain text, not a disabled
  anchor, so keyboard users do not land on dead controls.
- Badge image is decorative (`alt=""`) and lazy-loaded; the brand name is
  already in the card heading.
- Existing focus styles and 44px minimum targets are preserved.

## Verification

- `npm run check` passes.
- `npm run build` passes.
- `npm run check:links` passes (external links are skipped by the checker).
- Local preview of `/links`:
  - Affiliates section shows Shopify and DigitalOcean above Hostinger and
    Proton.
  - Hostinger and Proton show "Coming soon" and expose no link.
  - Referrals section shows Wealthsimple, Wise, and Tangerine.
  - Exactly one `h1`; card names are `h3`.
  - No horizontal overflow at 375 and 1440.
  - DigitalOcean badge loads and CTA opens the referral URL.

## Acceptance criteria

1. `/links` visibly separates affiliates from referrals with a one-line
   explanation per section.
2. Shopify is in Affiliates; Wealthsimple, Wise, and Tangerine are in Referrals.
3. DigitalOcean appears as a live affiliate with the supplied referral link.
4. Hostinger and Proton appear as non-clickable "Coming soon" cards.
5. Build, type-check, and internal link check all pass.
6. No new runtime dependencies and no client-side JS changes beyond the existing
   copy-code handler.

## Risks

- Placeholder cards could read as unfinished. The "Coming soon" label and the
  affiliate explainer make the state intentional.
- DigitalOcean's credit wording is based on the user's referral dashboard copy;
  if the program terms change, only the card copy needs updating.
