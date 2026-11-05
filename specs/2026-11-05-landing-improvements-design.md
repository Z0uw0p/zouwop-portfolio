# Landing Improvements — Design Spec

**Date:** 2026-11-05
**Status:** Approved (pending written-spec review)
**Scope:** Issue #1 plus every finding from the live design review.

## Context

Issue #1 asks for:

1. A top navigation menu that appears/disappears on scroll.
2. No price on the landing page.
3. Web development findable as a skill.

The design review of `https://zouwop.com` added one AA contrast blocker, a
missing `h1`/`main` on the homepage, a tablet grid orphan, a misleading
whole-card hover, an unhonoured `prefers-reduced-motion`, a hero CTA/label
mismatch, a faint secondary button, and several nits (metadata, token drift,
third-party console warnings).

Decisions already made with the user:

- Move prices to a separate `/services` page (keep pricing, just off `/`).
- Sticky header: wordmark, Services / Portfolio / Links / Contact, plus a
  "Book a call" CTA; hide on scroll down, show on scroll up; hamburger on mobile.
- Promote the existing "Web development" entry into the main services list
  as a fourth offering.

## Goals

- Give every page a usable top navigation.
- Keep pricing available but off the landing page.
- Make web development a first-class offering.
- Clear the accessibility blocker and high-priority finding.
- Fix the medium/nit findings that touch the changed surfaces.

## Non-goals

- Deploying to Cloudflare Pages (implementation stops at a local build + review).
- Fixing the 28 console warnings emitted by the third-party
  `beatricedaudelin.com` embed on `/portfolio`; they do not originate in this repo.
- Producing an Open Graph image asset.
- Adding Cal.com or a booking calendar.

## Architecture

```
Layout.astro
├── skip link
├── Header.astro            (new, shared by every page)
│   ├── brand wordmark → /
│   ├── nav: Services / Portfolio / Links / Contact
│   └── CTA: Book a call → /#contact
└── slot
    ├── <main id="main">    (page-owned, one per page)
    └── <Footer />
```

Each page owns its `main` landmark and keeps `<Footer />` outside it.
`/links` and `/portfolio` already do this; the homepage gains a `main`, and the
new `/services` page adds one. `Layout` renders only the skip link and
`Header`, so no page gets a nested `main` or a `footer` inside `main`.

### Data flow

`src/data/services.ts` remains the single source of truth. Add:

- `summary: string` — one line used on the homepage card.
- A fourth entry, `id: "web"`, name "Web development":
  - price: "Scoped per job"
  - summary: "Landing pages, small sites, and internal tools — static or Astro."
  - points: landing/portfolio/internal tools; fixed scope and price agreed in
    writing; Astro + Cloudflare Pages or plain HTML/CSS.
  - excluded: copywriting, photography, and ongoing content updates.
  - CTA: "Email about a site" → `booking@zouwop.com`, subject "Web development".

Order stays: Setup, Tech call, Hosted services, Web development.

## Components and pages

### `src/components/Header.astro` (new)

- Sticky top bar, `background: rgba(13,13,18,0.85)`, backdrop blur,
  bottom border using `--border`.
- Desktop (≥720px): brand left, centred/left nav links, CTA right.
- Mobile (<720px): brand + 44×44 menu button; panel below the bar with stacked
  links and a full-width CTA.
- Active link: `aria-current="page"` when `Astro.url.pathname` matches
  `/services`, `/portfolio`, or `/links`. Contact is never active.
- Behaviour script:
  - Relies on the `js` class added by `Layout` in `<head>` before paint, so CSS
    can opt into the JavaScript layout. Without JS the nav links remain visible
    and wrap, and the burger button is hidden.
  - Scroll: after `scrollY > 80`, scrolling down adds `header--hidden`
    (`translateY(-100%)`); scrolling up or returning to the top removes it.
    A `focusin` listener reveals the header if a link receives keyboard focus
    while hidden. The header never hides while the mobile panel is open.
  - Mobile menu: toggles `aria-expanded`, opens the panel, moves focus to the
    first link, closes on Escape / outside click / link click / resize ≥720px,
    and returns focus to the toggle. Prevents the header from hiding while open.
- All interactive targets are at least 44×44 CSS px.

### `src/layouts/Layout.astro`

- Props: `title` (required), `description` (defaults to the current site
  description), `path` (defaults to `Astro.url.pathname`).
- Emits `<title>`, meta description, canonical link, `og:type`,
  `og:site_name`, `og:title`, `og:description`, `og:url`, `twitter:card`,
  and `theme-color` (`#0d0d12`). `Astro.site` (`https://zouwop.com`) resolves
  the absolute URL.
- Renders an inline `<script is:inline>` in `<head>` that adds `js` to
  `<html>` before paint, then the skip link and `<Header />`; the page slot
  follows. No `main` wrapper here.
- Default description becomes
  "Self-hosted infrastructure setup, tech support calls, web development, and
  managed hosting on a server you control." (removes the `$20` from metadata).
- Homepage title becomes
  "Zouwop — self-hosted infrastructure & tech support".

### `src/pages/index.astro`

- Wraps Hero → Contact in `<main id="main" tabindex="-1">`, with `<Footer />`
  outside it.
- Passes the new title/description to `Layout`.
- Hero primary CTA becomes **Book a call** → `#contact`; the `$20` is removed.
  Secondary **What I run ↓** stays.
- "What I do" renders four `<a class="card service-card" href={/services#id}>`
  cards with `<h3>`, summary, and "See details →". No prices, no inner CTA.
  Grid: 1 column base, 2 columns from 640px, staying 2×2 on desktop.
- "Also available" keeps only AI agents; copy becomes singular.
- Hero wordmark becomes `<h1>` via `<Wordmark as="h1" />`.

### `src/pages/services.astro` (new)

- `<h1>Services</h1>` plus a short intro.
- One anchored `<section id={s.id}>` per service: name, price pill, full points,
  the "not included" note, and the existing email CTA. Web development is
  included through the same data array.
- Anchored service sections get `scroll-margin-top` equal to the sticky header
  height (88px) so `/services#id` does not land under the bar. The existing
  `#services`, `#stack`, and `#contact` homepage targets get the same treatment.
- Ends with a "Not sure which fits?" contact CTA pointing at `/#contact`.
- Wraps the content in `<main id="main" tabindex="-1" class="page">`, with
  `<Footer />` outside it.
- Uses `Layout`, `Header` (implicit), and `Footer`.

### `src/components/Services.astro`

- Rewritten as the homepage card grid described above.
- No price rendering on `/`.
- Whole card is the link, so the existing lift hover is truthful.

### `src/components/Wordmark.astro`

- Add an `as` prop (`'span' | 'h1'`, default `'span'`) so the hero can render
  the site name as the page `h1` without changing header/footer usage.

### `src/components/Elsewhere.astro`

- Remove the Web development item; keep AI agents.

### `src/components/Footer.astro`

- Add a **Services** link before Links.

## Design tokens, contrast, motion

### `src/styles/global.css`

- Add:
  - `--border: #23232e`
  - `--border-strong: #5f5f74` (≈3.1:1 against `#0d0d12`)
  - `--focus: var(--orange)`
- Replace hardcoded border colours with tokens in:
  `global.css`, `Stack.astro`, `Footer.astro`, `Portfolio.astro`,
  `pages/links.astro`, and the new header/services components.
- `.btn-secondary` border moves from `#2a2a38` to `--border-strong`.
- Base focus rule (`:focus-visible` orange 2px, 2px offset) stays as-is per
  component; no regression.
- Reduced motion:

  ```css
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

### `src/components/Services.astro` / `services.astro`

- `.excluded` removes `opacity: 0.75`. `--text-dim` on `--bg-soft` is 6.55:1,
  clearing the 4.5:1 AA threshold.
- Price pills keep the existing orange-on-dark treatment.

## Error handling and progressive enhancement

- Without JS: header is visible and sticky; links wrap on small screens; the
  burger layout and hide/show are not applied. Content and CTAs work.
- Scroll handler uses `requestAnimationFrame` + a passive listener, and only
  writes classes; no layout reads per scroll event beyond `scrollY`.
- Mobile menu closes on route-hash navigation because it listens for clicks on
  its links.
- Missing/unknown service `id` in the URL simply lands at the top of `/services`
  (native anchor behaviour); no custom handling needed.

## Verification

- `npm run build` succeeds.
- Local preview checked with Playwright at 1440×900, 768×1024, 375×812:
  - Header visible; hides on scroll down, returns on scroll up.
  - Mobile menu opens/closes via click, Enter, Escape, and link click; focus returns.
  - Skip link moves focus to `main`.
  - Exactly one `h1` on `/`; one `main` per page; no nested `main`.
  - `/services` shows all four price pills; `/` shows none.
  - No horizontal overflow at 320, 375, 720, 768, 1440.
  - axe-core 4.10.2 (WCAG 2.1 A/AA): 0 violations on `/`, `/services`,
    `/links`, `/portfolio`.
  - `prefers-reduced-motion: reduce` emulated: scroll and transitions are
    effectively instant.
- The rendered text of `/` contains no `$20`; `$20` remains in
  `src/data/services.ts` and renders only on `/services`.

## Acceptance criteria

1. Issue #1's three asks are satisfied: nav with scroll show/hide, no price on
   `/`, web development in the main services list.
2. `/services` is reachable from the header, footer, and every homepage card.
3. Homepage has an `h1`, a `main` landmark, and no AA contrast violations.
4. No new console errors or warnings from first-party code.
5. Existing `/links` and `/portfolio` content and behaviour are unchanged
   apart from the shared header and tokens.
6. Build output is static and deployable to Cloudflare Pages with no new runtime
   dependency.

## Risks

- Header JavaScript is the only new client behaviour; keep it tiny and ensure
  the no-JS fallback is tested.
- Moving the price changes the hero's visual weight; the CTA must stay the
  strongest element.
- The fourth card changes grid geometry; 2×2 is deliberate and must be verified
  at 640, 768, and 1440.
