# Pricing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/pricing` with three offers (template licence, full build, hosting + maintenance), one price formatter, and data-driven price display across the store — no bundles, no ZIP hosting.

**Architecture:** `src/data/pricing.ts` derives the single-licence price from `templates`, holds the full-build/hosted/custom offers and the comparison rows. `src/lib/format-price.ts` is the only formatter. `src/pages/pricing.astro` renders a scoped-header comparison table that becomes row cards below 720px with no client JS. Product pages and the catalog read prices through the same data and formatter.

**Tech Stack:** Astro 5 (static), TypeScript, plain CSS, Node 22. No new dependencies.

## Global Constraints

- `output: 'static'`; no client JS for the table; no new dependencies.
- Prices are integer minor units; display only through `src/lib/format-price.ts`.
- Single-licence price is derived from `templates` (`status: 'available'`); never hardcode it in markup.
- `hosted.priceCents` is `null` today: print no monthly number until it is set.
- No ZIP file in `public/` and no link to a ZIP anywhere. Delivery copy says "emailed after payment".
- Copy is plain, first person, no invented claims; `12 months` / `30 days` come from `src/data/fulfilment.ts`.
- `npm run check`, `npm run build`, `npm run check:links` and `npm run check:links -- --self-test` must pass.
- Reuse `--orange`, `--purple`, `--bg-soft`, `--border`, `--radius`, `.container`, `.card`, `.btn`, `.mono`, `.sr-only`.

---

### Task 1: One price formatter

**Files:**
- Create: `src/lib/format-price.ts`
- Delete: `src/lib/money.ts`
- Modify: `src/components/BuyButton.astro:3`
- Modify: `src/components/StickyBuyBar.astro:3`
- Modify: `src/components/PriceTag.astro` (remove the hardcoded `$`)
- Modify: `src/components/TemplateCard.astro:18-23` (drop `currency` prop)
- Modify: `src/pages/templates/[slug].astro:115-122` (drop `currency` prop)

**Interfaces:**
- Produces: `formatCad(cents: number): string` → `$1,050.50 CAD`; `formatCadShort(cents: number): string` → `$500`. Both throw `RangeError` on negative/non-finite input.
- Consumes: nothing.

- [ ] **Step 1: Create `src/lib/format-price.ts`**

```ts
const wholeCad = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fractionalCad = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function assertCents(cents: number): void {
  if (!Number.isFinite(cents) || cents < 0) {
    throw new RangeError(`format-price: expected a non-negative number, got ${cents}`);
  }
}

/** `$500` — the short price used by cards, the table and copy. */
export function formatCadShort(cents: number): string {
  assertCents(cents);
  const formatter = cents % 100 === 0 ? wholeCad : fractionalCad;
  return formatter.format(cents / 100);
}

/** `$1,050.50 CAD` — the full price used by buy CTAs and the sticky bar. */
export function formatCad(cents: number): string {
  return `${formatCadShort(cents)} CAD`;
}
```

- [ ] **Step 2: Delete the old module and update imports**

Run: `git rm src/lib/money.ts`

In `src/components/BuyButton.astro:3` and `src/components/StickyBuyBar.astro:3`, change:
```ts
import { formatCad } from '../lib/money';
```
to:
```ts
import { formatCad } from '../lib/format-price';
```

- [ ] **Step 3: Rewrite `PriceTag.astro` without a `$` literal**

Full file:
```astro
---
import { formatCadShort } from '../lib/format-price';

interface Props {
  amountCents: number;
  /** Optional trailing unit, e.g. '/mo'. */
  suffix?: string;
}

const { amountCents, suffix } = Astro.props;
---

<span class="price-tag">{formatCadShort(amountCents)}{suffix && <span class="suffix">{suffix}</span>}</span>

<style>
  .price-tag {
    font-family: var(--mono);
    white-space: nowrap;
  }
  .suffix {
    margin-left: 1px;
  }
</style>
```

- [ ] **Step 4: Drop the removed `currency` prop at the two call sites**

`src/components/TemplateCard.astro`:
```astro
{entry.niche} · licence <PriceTag amountCents={entry.priceCents} />
{
  entry.hostedMonthlyCents != null && (
    <> · hosting <PriceTag amountCents={entry.hostedMonthlyCents} suffix="/mo" /></>
  )
}
```

`src/pages/templates/[slug].astro` hosting section:
```astro
<PriceTag amountCents={entry.hostedMonthlyCents} suffix="/mo" />
```

- [ ] **Step 5: Verify**

Run: `npm run check`
Expected: 0 errors. There must be no remaining import of `../lib/money`.

Run: `grep -rn "lib/money\|currency === 'CAD' ? '\\\$'" src/`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/lib/format-price.ts src/components src/pages/templates
git commit -m "refactor: one CAD price formatter"
```

---

### Task 2: Pricing data

**Files:**
- Create: `src/data/pricing.ts`

**Interfaces:**
- Consumes: `templates` from `./templates`; `UPDATES_MONTHS`, `SUPPORT_DAYS` from `./fulfilment`; `site` from `./site`.
- Produces: `licenceMinCents: number`, `licenceFrom: boolean`, `fullBuild: Offer & { priceCents: number }`, `hosted: Offer & { priceCents: number | null; includes: string[] }`, `custom`, `comparison: ComparisonRow[]`, types `Offer` and `ComparisonRow`.

- [ ] **Step 1: Create `src/data/pricing.ts`**

```ts
import { templates } from './templates';
import { site } from './site';
import { SUPPORT_DAYS, UPDATES_MONTHS } from './fulfilment';

const available = templates.filter((template) => template.status === 'available');

if (available.length === 0) {
  throw new Error('pricing.ts: no available templates — pricing cannot be derived.');
}

const licencePrices = available.map((template) => template.priceCents);

/** Cheapest available licence; the single price when every entry matches. */
export const licenceMinCents = Math.min(...licencePrices);

/** True when the catalog does not share one price, so the page can say "from". */
export const licenceFrom = licencePrices.some((cents) => cents !== licenceMinCents);

export interface Offer {
  id: string;
  name: string;
  /** Integer minor units, or null while the price is not set. */
  priceCents: number | null;
  cadence: 'one-time' | 'monthly';
  summary: string;
  ctaLabel: string;
  ctaHref: string;
}

export const fullBuild: Offer & { priceCents: number } = {
  id: 'full-build',
  name: 'Full build',
  priceCents: 200_000,
  cadence: 'one-time',
  summary:
    'I adapt a template to your content, connect your domain, put it on hosting and launch it for you.',
  ctaLabel: 'See what a build covers',
  ctaHref: '/services',
};

export const hosted: Offer & { priceCents: number | null; includes: string[] } = {
  id: 'hosted',
  name: 'Hosting + maintenance',
  priceCents: null,
  cadence: 'monthly',
  summary:
    'Your site runs on zouwop-server: I keep it updated, back it up, and make small changes.',
  includes: [
    'Hosting on a server I run',
    'Template and dependency updates',
    'Backups',
    'Small content changes',
  ],
  ctaLabel: 'Email about hosting',
  ctaHref: `mailto:${site.contact.billing}?subject=${encodeURIComponent('Hosting + maintenance')}`,
};

export const custom = {
  id: 'custom',
  name: 'Something else',
  priceLabel: 'Scoped per job',
  href: '/services',
  summary: 'Setup, custom work or a mix of offers. Scope and price agreed in writing first.',
};

export interface ComparisonRow {
  label: string;
  licence: string;
  fullBuild: string;
  hosted: string;
}

export const comparison: ComparisonRow[] = [
  {
    label: 'Files',
    licence: 'Source files, emailed after payment',
    fullBuild: 'Your site, adapted, installed and launched',
    hosted: 'Included',
  },
  {
    label: 'Licence',
    licence: 'One end product',
    fullBuild: 'One end product',
    hosted: 'Included with the site',
  },
  {
    label: 'Updates',
    licence: `${UPDATES_MONTHS} months`,
    fullBuild: `${UPDATES_MONTHS} months`,
    hosted: 'Ongoing',
  },
  {
    label: 'Support',
    licence: `${SUPPORT_DAYS} days of bug fixes`,
    fullBuild: `${SUPPORT_DAYS} days after launch`,
    hosted: 'Ongoing small changes',
  },
  {
    label: 'Hosting',
    licence: 'You host it',
    fullBuild: 'Optional',
    hosted: 'On zouwop-server',
  },
  {
    label: 'Maintenance',
    licence: 'None',
    fullBuild: 'None',
    hosted: 'Included',
  },
  {
    label: 'Domain & launch',
    licence: 'No',
    fullBuild: 'Yes',
    hosted: 'Yes',
  },
];
```

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: 0 errors; `fullBuild.priceCents` is `number`, `hosted.priceCents` is `number | null`.

- [ ] **Step 3: Commit**

```bash
git add src/data/pricing.ts
git commit -m "feat: add pricing model and comparison rows"
```

---

### Task 3: `/pricing` page and footer link

**Files:**
- Create: `src/pages/pricing.astro`
- Modify: `src/components/Footer.astro` (add the `Pricing` link)

**Interfaces:**
- Consumes: `licenceMinCents`, `licenceFrom`, `fullBuild`, `hosted`, `custom`, `comparison` from `../data/pricing`; `formatCadShort` from `../lib/format-price`; `site` from `../data/site`.
- Produces: route `/pricing` with anchor `#hosted`.

- [ ] **Step 1: Create `src/pages/pricing.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Footer from '../components/Footer.astro';
import { formatCadShort } from '../lib/format-price';
import { site } from '../data/site';
import {
  comparison,
  custom,
  fullBuild,
  hosted,
  licenceFrom,
  licenceMinCents,
} from '../data/pricing';

const licencePrice = `${licenceFrom ? 'from ' : ''}${formatCadShort(licenceMinCents)}`;
const hostedPrice =
  hosted.priceCents == null
    ? 'Monthly, price on request'
    : `${formatCadShort(hosted.priceCents)}/mo`;

const description = `Three ways to buy: a template licence for ${licencePrice}, a full build for ${formatCadShort(fullBuild.priceCents)}, or hosting and maintenance. Prices in CAD.`;
---

<Layout title="Pricing — Zouwop" description={description} path="/pricing">
  <main id="main" tabindex="-1" class="page">
    <div class="container">
      <a class="back" href="/">← zouwop.com</a>
      <h1>Pricing</h1>
      <p class="intro">
        Three ways to buy: the template files, the whole site built for you, or the
        site hosted and maintained.
      </p>

      <section aria-labelledby="compare-heading">
        <h2 id="compare-heading">What each offer includes</h2>
        <table>
          <caption>Offer comparison: template licence, full build, hosting and maintenance.</caption>
          <thead>
            <tr>
              <td class="corner"></td>
              <th scope="col">
                <span class="offer-name">Template licence</span>
                <span class="offer-price mono">{licencePrice}</span>
                <span class="offer-note">one-time, per template</span>
              </th>
              <th scope="col">
                <span class="offer-name">{fullBuild.name}</span>
                <span class="offer-price mono">{formatCadShort(fullBuild.priceCents)}</span>
                <span class="offer-note">one-time</span>
              </th>
              <th scope="col">
                <span class="offer-name">{hosted.name}</span>
                <span class="offer-price mono">{hostedPrice}</span>
                <span class="offer-note">monthly</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr>
                <th scope="row">{row.label}</th>
                <td data-label="Template licence">{row.licence}</td>
                <td data-label="Full build">{row.fullBuild}</td>
                <td data-label="Hosting + maintenance">{row.hosted}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td class="corner"><span class="sr-only">Choose an offer</span></td>
              <td data-label="Template licence">
                <a class="btn btn-secondary" href="/templates/">Browse templates</a>
              </td>
              <td data-label="Full build">
                <a class="btn btn-secondary" href={fullBuild.ctaHref}>{fullBuild.ctaLabel}</a>
              </td>
              <td data-label="Hosting + maintenance">
                <a class="btn btn-secondary" href={hosted.ctaHref}>{hosted.ctaLabel}</a>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section id="hosted" class="hosted" aria-labelledby="hosted-heading">
        <h2 id="hosted-heading">{hosted.name}</h2>
        <p class="hosted-price mono">{hostedPrice}</p>
        <p>{hosted.summary}</p>
        <ul class="check-list">
          {hosted.includes.map((item) => <li>{item}</li>)}
        </ul>
        <a class="btn btn-primary" href={hosted.ctaHref}>{hosted.ctaLabel}</a>
      </section>

      <p class="closing">
        The full build is {formatCadShort(fullBuild.priceCents)} because I do the
        adaptation and launch with you; the licence is the files, installed by you.
        If you expect to use more than one template,{' '}
        <a href={`mailto:${site.contact.billing}`}>email me</a> and I will price the
        set rather than print a made-up number here.
      </p>
      <p class="fine">
        Prices in CAD. Paid through Stripe; files are emailed within one business day.
        <a href="/licence">Read the licence</a> · <a href={custom.href}>{custom.name} — {custom.priceLabel}</a>.
      </p>
    </div>
  </main>
  <Footer />
</Layout>

<style>
  .page { padding: 48px 0 64px; }
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
  .intro {
    color: var(--text-dim);
    font-size: 1.05rem;
    max-width: 65ch;
    margin-bottom: 40px;
  }
  h2 {
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    margin-bottom: 14px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  caption {
    caption-side: top;
    text-align: left;
    color: var(--text-dim);
    font-size: 0.9rem;
    padding-bottom: 12px;
  }
  th,
  td {
    padding: 14px 16px;
    text-align: left;
    vertical-align: top;
    border-top: 1px solid var(--border);
  }
  thead th {
    width: 23%;
    background: var(--bg-soft);
    border-top: none;
    vertical-align: bottom;
  }
  tbody th {
    width: 31%;
    font-size: 0.9rem;
    font-weight: 600;
  }
  td {
    color: var(--text-dim);
    font-size: 0.92rem;
  }
  .corner { width: 31%; }
  .offer-name { display: block; font-size: 1rem; font-weight: 700; color: var(--text); }
  .offer-price { display: block; color: var(--orange); margin-top: 4px; }
  .offer-note { display: block; color: var(--text-dim); font-size: 0.75rem; margin-top: 2px; }
  tfoot td { background: var(--bg-soft); }
  tfoot .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    font-size: 0.9rem;
    padding: 10px 18px;
  }
  .hosted {
    margin-top: 48px;
    padding: 28px;
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .hosted-price {
    color: var(--orange);
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  .check-list {
    display: grid;
    gap: 8px;
    list-style: none;
    color: var(--text-dim);
    margin: 16px 0 20px;
  }
  .check-list li::before {
    content: '✓';
    color: var(--purple);
    margin-right: 10px;
  }
  .closing {
    color: var(--text-dim);
    max-width: 65ch;
    margin-top: 40px;
    margin-bottom: 12px;
  }
  .fine {
    color: var(--text-dim);
    font-size: 0.88rem;
  }
  a { color: var(--orange); }
  a:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

  @media (max-width: 719px) {
    table,
    tbody,
    tfoot,
    tr,
    th,
    td {
      display: block;
    }
    table {
      border: 0;
    }
    thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
    .corner {
      display: none;
    }
    tbody tr,
    tfoot tr {
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 20px;
      margin-bottom: 16px;
    }
    tbody th,
    tbody td,
    tfoot td {
      width: auto;
      border: 0;
      padding: 0;
      background: transparent;
    }
    tbody th {
      color: var(--orange);
      font-family: var(--mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 10px;
    }
    tbody td {
      display: grid;
      gap: 2px;
      padding-top: 10px;
    }
    tbody td::before,
    tfoot td::before {
      content: attr(data-label);
      font-family: var(--mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
    }
    tfoot td {
      display: grid;
      gap: 8px;
      padding-top: 12px;
    }
    tfoot .btn {
      width: 100%;
    }
  }
</style>
```

- [ ] **Step 2: Add `Pricing` to the footer**

In `src/components/Footer.astro`, after the `Templates` link:
```astro
<a href="/pricing">Pricing</a>
```

- [ ] **Step 3: Verify the build and links**

Run: `npm run build`
Expected: `dist/pricing/index.html` exists.

Run: `npm run check:links`
Expected: `Checked N internal links — all resolve.`

Run: `npm run check:links -- --self-test`
Expected: `Self-test passed: caught 2 broken links ...`

- [ ] **Step 4: Commit**

```bash
git add src/pages/pricing.astro src/components/Footer.astro
git commit -m "feat: add /pricing page with offer comparison"
```

---

### Task 4: Wire data into the catalog and product pages

**Files:**
- Modify: `src/pages/templates/index.astro` (imports, `description`, outro)
- Modify: `src/pages/templates/[slug].astro` (hosting section only)

**Interfaces:**
- Consumes: `formatCadShort`; `licenceMinCents`, `licenceFrom`, `fullBuild` from `../../data/pricing`; `templates.length`.
- Produces: no new exports.

- [ ] **Step 1: Make the catalog description and outro data-driven**

In `src/pages/templates/index.astro` frontmatter:
```ts
import { formatCadShort } from '../../lib/format-price';
import { fullBuild, licenceFrom, licenceMinCents } from '../../data/pricing';

const licenceNote = `${licenceFrom ? 'from ' : ''}${formatCadShort(licenceMinCents)} each`;
```

Replace the `description` attribute with:
```astro
description={`Website templates I build and sell: ${templates.length} complete sites for trades, restaurants, clinics, studios, musicians and photographers. Licence ${licenceNote}.`}
```

Replace the outro:
```astro
<p class="outro">
  Want something built or changed for you? The full build is{' '}
  {formatCadShort(fullBuild.priceCents)} — <a href="/pricing">see pricing</a> or{' '}
  <a href="/#contact">get in touch</a>.
</p>
```

- [ ] **Step 2: Replace the product-page hosting block**

In `src/pages/templates/[slug].astro`, replace the existing `<section aria-labelledby="hosting-heading">…</section>` with:
```astro
<section aria-labelledby="hosting-heading">
  <h2 id="hosting-heading">Hosting + maintenance</h2>
  {
    entry.hostedMonthlyCents != null ? (
      <p>
        I host and maintain it for{' '}
        <PriceTag amountCents={entry.hostedMonthlyCents} suffix="/mo" />, including
        updates, backups and small changes.{' '}
        <a href="/pricing#hosted">What hosting covers</a>.
      </p>
    ) : (
      <p>
        I can host and maintain it on zouwop-server, including updates, backups and
        small changes. It is a monthly membership —{' '}
        <a href="/pricing#hosted">see hosting</a> or{' '}
        <a
          href={`mailto:${site.contact.billing}?subject=${encodeURIComponent(`Hosting — ${entry.name}`)}`}
        >
          email about hosting
        </a>.
      </p>
    )
  }
</section>
```

- [ ] **Step 3: Verify**

Run: `npm run check`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds; no product page grew a bundle block.

Run: `grep -rn '\$[0-9]' src/ | grep -v 'src/data/links.ts' | grep -v 'src/data/services.ts'`
Expected: no output (all store prices now come from the formatter). The two excluded files are non-store marketing copy and are reported in the PR.

- [ ] **Step 4: Commit**

```bash
git add src/pages/templates
git commit -m "feat: derive store prices from pricing data"
```

---

### Task 5: Prove propagation and finish

**Files:**
- No source edits (temporary price edits are reverted).

- [ ] **Step 1: Run the full verification suite**

```bash
npm run check
npm run build
npm run check:links
npm run check:links -- --self-test
```
Expected: all pass.

- [ ] **Step 2: Prove a full-build price change reaches the pages**

```bash
sed -i 's/priceCents: 200_000,/priceCents: 210_000,/' src/data/pricing.ts
npm run build
grep -o '\$2,100' dist/pricing/index.html | head -1
grep -o '\$2,100' dist/templates/index.html | head -1
git checkout -- src/data/pricing.ts
```
Expected: both greps print `$2,100`. Record the output.

- [ ] **Step 3: Prove a template price change reaches its card, product page and the "from" price**

```bash
sed -i "0,/priceCents: 50000,/s//priceCents: 49000,/" src/data/templates.overrides.ts
npm run build
grep -o '\$490' dist/templates/forge-trades/index.html | head -1
grep -o 'from \$490' dist/pricing/index.html | head -1
git checkout -- src/data/templates.overrides.ts
```
Expected: `$490` on the forge-trades product page and `from $490` on `/pricing` (it is the first override). Record the output, then rebuild a clean tree.

- [ ] **Step 4: Record the `$` grep**

```bash
grep -rn '\$' src/ --include=*.ts --include=*.astro --include=*.css | grep -v '\${' | grep -v '\$&'
```
Paste the result into the PR, noting that only `links.ts` and `services.ts` remain (referral and tech-call copy), and that no store price uses a literal.

- [ ] **Step 5: Commit, push, open the PR**

```bash
git status --short
git push -u origin Z0uw0p/store-pricing-page-and-bundles
gh pr create --base main --title "store: pricing page and offer ladder" --body-file /tmp/pricing-pr.md
```
The PR body lists: three offers, no bundle (decision + reason), no ZIP hosting, formatter consolidation, price-propagation before/after, grep output, and the checks run.
