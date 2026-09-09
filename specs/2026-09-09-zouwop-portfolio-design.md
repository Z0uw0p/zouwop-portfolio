# Zouwop Portfolio — Design Spec

**Date:** 2026-09-09
**Status:** Approved (awaiting user spec review)
**Author:** admin agent (zouwop-server)

## Overview

A personal homepage/portfolio for **Zouwop**, served at `zouwop.com` (apex + `www`).
It is the front door for three freelance/services offerings and a data-driven
showcase of "what's available." Built to grow: a future posts/Substack section
drops in via Astro content collections, and a future API exposes the same
offerings data.

## Goals

1. Present Zouwop as a credible freelancer/consultant (person-first, handle-branded).
2. Drive leads into a low-friction booking flow.
3. Showcase products/services in a grid that doubles as the future monetization
   surface (and eventual API source of truth).
4. Keep ops minimal — the site itself is served by Cloudflare, not the server.

## Non-goals (YAGNI)

- No blog/posts section built now (stubbed only).
- No API endpoint built now (data layer separated to allow it later).
- No client portal (future product, separate app).
- No logo image (styled text wordmark only).
- The server does NOT serve the site (only Cal.com stays self-hosted).

## Architecture

- **Astro** static site (SSG). Output = plain HTML/CSS/JS + minimal client JS.
- **Source of truth = GitHub repo** `Z0uw0p/zouwop-portfolio` (public).
- **Cloudflare Pages** builds and serves the static site from the repo.
  (Mirrors the existing `beatricedaudelin` Pages project pattern.)
- **DNS:** `zouwop.com` + `www.zouwop.com` → Cloudflare Pages (proxied).
- **Cal.com** (self-hosted, Docker on the server) for booking, at `cal.zouwop.com`.
  The portfolio embeds/links to it.

```
You push to GitHub (Z0uw0p/zouwop-portfolio)
        │  version control = source of truth
        ▼
Cloudflare Pages builds & serves static site
        │
        ▼
zouwop.com + www.zouwop.com  →  Cloudflare Pages (proxied DNS)

Cal.com booking  →  self-hosted on server at cal.zouwop.com
                    (dynamic app, cannot be static on Pages)
```

## Pages & sections (single page)

1. **Hero** — "zouwop" wordmark, one-line pitch, CTA "Book a call" + secondary
   "See what I offer".
2. **Services** — three cards: Web Development, Self-Hosting Consulting,
   AI Agent Setup. 2–3 bullets each + per-card "Book" link.
3. **Showcase ("What's available")** — grid of offerings (data-driven, see below).
   Cards: name, icon, one-liner, status badge (🟢 live / 🟡 beta / ⚪ planned), link.
4. **About / how I work** — short, personable, trust-building.
5. **Contact + booking** — embedded Cal.com, plus direct links (Discord, email, LinkedIn, GitHub).
6. **Footer** — minimal.

## Aesthetic

- Dark near-black bg (`#0d0d12`), subtle grid/noise texture.
- **Orange** accent = primary CTA/highlights; **purple** accent = secondary/gradients.
- Orange→purple gradients on headings/cards.
- Monospace accents for code-y flavor (e.g. `$ ./book-a-call`); clean sans for body.
- Subtle hover glow on cards/buttons. Responsive, mobile-first.
- Wordmark: styled text "zouwop" (lowercase, orange→purple gradient).

## Showcase data model

Single source of truth, one-file edits, no layout changes:

```ts
// src/data/offerings.ts
{
  name: string;          // "AI Agent Setup"
  type: "service" | "product";
  icon: string;          // inline SVG or icon name
  blurb: string;         // one-liner
  status: "live" | "beta" | "planned";
  href?: string;         // link target or booking anchor
}
```

Initial entries (all `type: "service"`, status per reality):
- Web Development (live)
- Self-Hosting Consulting (live)
- AI Agent Setup (live)

## Booking (Cal.com)

- Self-hosted Cal.com, Docker compose at `/home/zouwop/docker/cal/`, Postgres-backed.
- Exposed at `cal.zouwop.com` via nginx on the server (BEHIND_PROXY / trusted proxy
  config per AGENTS.md gotchas).
- Embedded on homepage via Cal embed, dark theme.
- Fallback: hosted free-tier Cal.com embed (documented, not default).

## Deployment & ops

- **Repo:** `Z0uw0p/zouwop-portfolio` (public). Astro source pushed to `main`.
- **Cloudflare Pages:** new project connected to the repo; production branch `main`;
  build command = Astro build; output dir = `dist/`.
- **DNS:** add `zouwop.com` and `www` records → Pages project (proxied). The zone
  `zouwop.com` is already active on Cloudflare; no zone creation needed.
- **Cal.com:** compose at `/home/zouwop/docker/cal/` + nginx block `cal.zouwop.com`
  + restart. (Server-side, isolated, reversible via `docker compose down`.)
- **Undo path:** Pages project can be deleted; DNS records removed; repo stays.

## Future growth (architected, not built)

- **Posts/Substack**: markdown into `src/content/posts/`, add `/posts` route + nav.
- **API**: offerings data file is the source of truth; expose as JSON later
  (Cloudflare Pages Functions or a Worker).
- **Client portal**: separate future app, linked from showcase.

## Open decisions / follow-ups

- Confirm Cal.com deployment version & Postgres credentials (deploy time).
- Confirm booking page title / event types (deploy time, in Cal.com UI).
- Confirm hero one-liner wording (content, before launch).
- Contact handles (decided): Discord, email, LinkedIn, GitHub.
