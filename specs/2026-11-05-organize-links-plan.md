# Organize Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `/links` into Affiliates and Referrals, add DigitalOcean as a live affiliate, and show Hostinger/Proton as pending placeholders.

**Architecture:** Single static Astro page backed by one typed `offers` array in `src/data/links.ts`. The page filters offers by `kind` (`affiliate` / `referral`) and renders live cards with CTAs plus pending cards with a non-interactive "Coming soon" pill.

**Tech Stack:** Astro 5, TypeScript, plain CSS scoped in the page component.

## Global Constraints

- No new runtime dependencies.
- No new client-side JavaScript beyond the existing copy-code handler.
- Keep the existing dark/orange/purple visual language and `--mono` styling.
- Pending offers must render no outbound link and no disabled anchor.
- Heading hierarchy: one `h1`, section `h2`, card `h3`.

---

### Task 1: Rework the links data model and page

**Files:**
- Modify: `src/data/links.ts`
- Modify: `src/pages/links.astro`
- Test: `npm run check`, `npm run build`, `npm run check:links`

**Interfaces:**
- Produces: `offers: Offer[]` exported from `src/data/links.ts`.
- Produces: `Offer` with `kind: 'referral' | 'affiliate'`, optional `status: 'live' | 'pending'`, optional `url`, `reward`, `steps`, `ctaLabel`, and optional `badge: { src: string; alt: string }`.
- Consumes: no earlier tasks.

- [ ] **Step 1: Replace `src/data/links.ts`**

```ts
export type OfferKind = 'referral' | 'affiliate';
export type OfferStatus = 'live' | 'pending';

export interface Offer {
  id: string;
  kind: OfferKind;
  status?: OfferStatus;
  name: string;
  url?: string;
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

export const offers: Offer[] = [
  {
    id: 'shopify',
    kind: 'affiliate',
    name: 'Shopify',
    url: 'https://shopify.pxf.io/en05Yg',
    headline: 'Want help building your online shop?',
    pitch: 'Start on Shopify, then I can build the storefront, products, and payments for you — or you can do it yourself with the free trial.',
    reward: 'Try Shopify free for 3 days, then $1/month. I earn a commission when you become a paying merchant.',
    steps: [
      'Open my Shopify link and start a store.',
      'Use the trial to claim your store name and pick a theme.',
      'Want me to build it? Book a call and we will scope the work; when you are ready, choose a Basic, Grow, or Advanced plan.',
    ],
    ctaLabel: 'Start on Shopify →',
    secondary: { label: 'Get help building it →', href: 'mailto:booking@zouwop.com?subject=Shopify%20build' },
    terms: 'The commission is paid to me by Shopify and does not change what you pay. Commission is only earned on full-price Basic, Grow, or Advanced plans; Plus, Enterprise, and Retail are excluded.',
  },
  {
    id: 'digitalocean',
    kind: 'affiliate',
    name: 'DigitalOcean',
    url: 'https://m.do.co/c/f247ce82b5fe',
    headline: '$25 in DigitalOcean credit',
    pitch: 'Developer-friendly cloud for VPS, Docker, and self-hosted apps — a small server without the big-provider learning curve.',
    reward: 'I get $25 in DigitalOcean credit once you sign up and pay your first $25 of usage — no extra cost to you.',
    steps: [
      'Open my referral link and create a DigitalOcean account.',
      'Add a payment method and use the platform normally.',
      'Once you have spent and paid your first $25, I receive $25 in credit.',
    ],
    ctaLabel: 'Start on DigitalOcean →',
    terms: 'Referral credit is paid to me by DigitalOcean and does not change what you pay. DigitalOcean sets the exact credit rules per account.',
    badge: { src: 'https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg', alt: '' },
  },
  {
    id: 'hostinger',
    kind: 'affiliate',
    status: 'pending',
    name: 'Hostinger',
    headline: 'Self-hosting-friendly VPS hosting',
    pitch: 'Affordable VPS plans that suit a small self-hosted stack — application pending.',
  },
  {
    id: 'proton',
    kind: 'affiliate',
    status: 'pending',
    name: 'Proton',
    headline: 'Private email, VPN, and drive',
    pitch: 'Privacy-first tools for moving your mail and files off Big Tech — application pending.',
  },
  {
    id: 'wealthsimple',
    kind: 'referral',
    name: 'Wealthsimple',
    url: 'https://wealthsimple.com/invite/U3IQYG',
    code: 'U3IQYG',
    headline: 'Give $25, get $25',
    pitch: 'A simple way to invest, save, and hold cash in one app — good if you are starting to invest or want a high-interest account.',
    reward: 'We both get $25 when you deposit $100 or more.',
    steps: [
      'Open my invite link — or enter code U3IQYG when you sign up.',
      'Create your Wealthsimple account and deposit $100 or more into your first account.',
      'Do it within 30 days of signing up, and we both get $25.',
    ],
    ctaLabel: 'Claim $25 →',
    terms: "New Wealthsimple clients only. 30-day deposit window; full terms on Wealthsimple's site.",
  },
  {
    id: 'wise',
    kind: 'referral',
    name: 'Wise',
    url: 'https://wise.com/invite/dic/mathisclaudet',
    headline: 'Transfer money abroad for less',
    pitch: 'Mid-market exchange rates and a multi-currency card — useful for travel, freelance income, or sending money to family abroad.',
    reward: 'You get one fee-free transfer up to CA$800 — the value comes off the transfer fee, not as cash. I earn a cash referral reward once you qualify.',
    steps: [
      'Open my invite link and create a new personal Wise account.',
      'Make more than CA$300 in eligible cross-currency transfers or card payments — it can be across several transactions.',
      'Use your fee-free transfer voucher on a transfer of up to CA$800.',
    ],
    ctaLabel: 'Open Wise →',
    terms: 'New personal accounts only. Same-currency transfers, ATM withdrawals, cash-like, crypto, and gambling payments do not count. The voucher usually expires about six months after signup, and Wise sets the exact offer per account.',
  },
  {
    id: 'tangerine',
    kind: 'referral',
    name: 'Tangerine',
    url: 'https://www.tangerine.ca/en/offers/referral',
    code: '64537010S1',
    headline: '$50 for you, $50 for me',
    pitch: 'No-fee daily chequing and savings with an ongoing referral offer — good if you want a free everyday bank account.',
    reward: 'Get $50 when you open your first eligible account, deposit $250 within 60 days, and keep at least $250 there for 60 straight days. I get $50 too.',
    steps: [
      'Open a Tangerine account through my link, or enter Orange Key 64537010S1 during signup.',
      'Deposit at least $250 within 60 days of becoming a client.',
      'Keep a balance of at least $250 for 60 consecutive days.',
      'Your $50 bonus is deposited within 30 days of qualifying.',
    ],
    ctaLabel: 'Open Tangerine →',
    terms: "New clients only (never had an ING Direct or Tangerine account). Credit cards do not count as the eligible first account; mortgages and loans have no minimum deposit. Cannot be combined with other enrollment bonuses.",
  },
];
```

- [ ] **Step 2: Replace `src/pages/links.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Footer from '../components/Footer.astro';
import { offers } from '../data/links';

const affiliates = offers.filter((offer) => offer.kind === 'affiliate');
const liveAffiliates = affiliates.filter((offer) => offer.status !== 'pending');
const pendingAffiliates = affiliates.filter((offer) => offer.status === 'pending');
const referrals = offers.filter((offer) => offer.kind === 'referral');
---

<Layout
  title="Links — Zouwop"
  description="Tools I use and recommend — referrals and affiliate links with no extra cost to you."
>
  <main id="main" tabindex="-1" class="page">
    <div class="container narrow">
      <a class="back" href="/">← zouwop.com</a>
      <h1>Links</h1>
      <p class="intro">A few tools I use and recommend. Some links pay me a commission or credit; others give us both a bonus — either way it costs you nothing extra.</p>

      <section class="group" aria-labelledby="affiliates-heading">
        <h2 id="affiliates-heading">Affiliates</h2>
        <p class="group-note">I earn a commission or credit when you sign up. You pay the same price.</p>
        <div class="cards">
          {liveAffiliates.map((r) => (
            <article class="card">
              <h3 class="name">{r.name}</h3>
              <p class="headline">{r.headline}</p>
              <p class="pitch">{r.pitch}</p>
              {r.reward && <p class="reward">{r.reward}</p>}
              {r.steps && (
                <ol class="steps">
                  {r.steps.map((s) => <li>{s}</li>)}
                </ol>
              )}
              {r.code && (
                <div class="code-row">
                  <code class="pill">{r.code}</code>
                  <button type="button" class="copy" data-code={r.code} aria-describedby={`status-${r.id}`}>
                    Copy code
                  </button>
                  <span id={`status-${r.id}`} class="sr-only" aria-live="polite"></span>
                </div>
              )}
              {r.url && r.ctaLabel && (
                <a class="btn btn-primary cta" href={r.url} target="_blank" rel="noopener noreferrer">{r.ctaLabel}</a>
              )}
              {r.secondary && (
                <a class="btn btn-secondary cta secondary" href={r.secondary.href}>{r.secondary.label}</a>
              )}
              {r.badge && <img class="badge" src={r.badge.src} alt={r.badge.alt} loading="lazy" />}
              {r.terms && <p class="terms">{r.terms}</p>}
            </article>
          ))}
          {pendingAffiliates.map((r) => (
            <article class="card">
              <h3 class="name">{r.name}</h3>
              <p class="headline">{r.headline}</p>
              <p class="pitch">{r.pitch}</p>
              <span class="soon">Coming soon</span>
            </article>
          ))}
        </div>
      </section>

      <section class="group" aria-labelledby="referrals-heading">
        <h2 id="referrals-heading">Referrals</h2>
        <p class="group-note">We both get a bonus when you sign up.</p>
        <div class="cards">
          {referrals.map((r) => (
            <article class="card">
              <h3 class="name">{r.name}</h3>
              <p class="headline">{r.headline}</p>
              <p class="pitch">{r.pitch}</p>
              {r.reward && <p class="reward">{r.reward}</p>}
              {r.steps && (
                <ol class="steps">
                  {r.steps.map((s) => <li>{s}</li>)}
                </ol>
              )}
              {r.code && (
                <div class="code-row">
                  <code class="pill">{r.code}</code>
                  <button type="button" class="copy" data-code={r.code} aria-describedby={`status-${r.id}`}>
                    Copy code
                  </button>
                  <span id={`status-${r.id}`} class="sr-only" aria-live="polite"></span>
                </div>
              )}
              {r.url && r.ctaLabel && (
                <a class="btn btn-primary cta" href={r.url} target="_blank" rel="noopener noreferrer">{r.ctaLabel}</a>
              )}
              {r.secondary && (
                <a class="btn btn-secondary cta secondary" href={r.secondary.href}>{r.secondary.label}</a>
              )}
              {r.terms && <p class="terms">{r.terms}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  </main>
  <Footer />
</Layout>

<script>
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.getAttribute('data-code');
      const describedBy = btn.getAttribute('aria-describedby');
      const status = describedBy ? document.getElementById(describedBy) : null;
      const label = btn.textContent;
      let ok = false;
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        ok = true;
      } catch {
        ok = false;
      }
      if (status) {
        status.textContent = ok ? `Copied ${code}` : 'Copy failed — select the code manually';
      }
      if (ok) {
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = label; }, 1500);
      }
    });
  });
</script>

<style>
  .page { padding: 48px 0 64px; }
  .narrow { max-width: 640px; margin: 0 auto; }
  .back {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--text-dim);
    text-decoration: none;
    font-size: 0.9rem;
    margin-bottom: 16px;
  }
  .back:hover { color: var(--orange); }
  h1 {
    font-size: clamp(2rem, 6vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .intro { color: var(--text-dim); margin-bottom: 40px; font-size: 1.05rem; }
  .group + .group { margin-top: 48px; }
  .group h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
  .group-note { color: var(--text-dim); font-size: 0.9rem; margin-bottom: 20px; }
  .cards { display: flex; flex-direction: column; gap: 24px; }
  .name { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }
  .headline {
    font-family: var(--mono);
    color: var(--orange);
    font-size: 0.95rem;
    margin-bottom: 12px;
  }
  .pitch { color: var(--text-dim); margin-bottom: 16px; }
  .reward { color: var(--text); margin-bottom: 20px; }
  .steps {
    list-style: none;
    counter-reset: step;
    margin: 0 0 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--text-dim);
  }
  .steps li {
    counter-increment: step;
    display: flex;
    gap: 12px;
  }
  .steps li::before {
    content: counter(step);
    font-family: var(--mono);
    color: var(--purple);
    flex: 0 0 auto;
  }
  .code-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .pill {
    font-family: var(--mono);
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--purple);
    padding: 10px 14px;
    border-radius: 8px;
    user-select: all;
  }
  .copy {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid var(--border-strong);
    color: var(--text);
    font-family: var(--mono);
    font-size: 0.85rem;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }
  .copy:hover { border-color: var(--purple); }
  .cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 48px;
    font-size: 1rem;
  }
  .secondary { margin-top: 12px; font-size: 0.9rem; }
  .badge { display: block; height: 32px; width: auto; max-width: 100%; margin-top: 16px; }
  .soon {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    color: var(--text-dim);
    font-family: var(--mono);
    font-size: 0.8rem;
  }
  .terms { color: var(--text-dim); font-size: 0.75rem; margin-top: 16px; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--orange);
    outline-offset: 2px;
  }
</style>
```

- [ ] **Step 3: Type-check and build**

Run: `npm run check && npm run build && npm run check:links`
Expected: all pass.

- [ ] **Step 4: Verify `/links` in a local preview**

Run: `npm run dev`
Check at 375px and 1440px:
- Affiliates section shows Shopify and DigitalOcean, then Hostinger and Proton with "Coming soon".
- No anchor exists for Hostinger or Proton.
- Referrals section shows all three financial offers.
- One `h1`; card names are `h3`.
- DigitalOcean badge loads; CTA opens `https://m.do.co/c/f247ce82b5fe`.

- [ ] **Step 5: Commit**

```bash
git add src/data/links.ts src/pages/links.astro specs/2026-11-05-organize-links-design.md specs/2026-11-05-organize-links-plan.md
git commit -m "feat(links): split affiliates from referrals and add DigitalOcean"
```
