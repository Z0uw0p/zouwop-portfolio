# Licence, Terms and FAQ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `/licence`, `/terms`, and `/faq` as data-driven static pages, linked from the footer, with a CI-enforced hash that keeps the licence text and the `LICENSE.txt` shipped in the `templates` repo in step.

**Architecture:** Legal content lives in `src/data/licence.json` (structured, one object per section) and two TypeScript modules (`terms.ts`, `faq.ts`). `src/data/licence.ts` is the typed public wrapper. The three Astro pages render data only. A Node script renders the same licence data to `licence/LICENSE.txt` and pins its SHA-256 in `licence/parity.lock`; CI fails when the two drift.

**Tech Stack:** Astro 5 (`output: 'static'`), TypeScript, plain scoped CSS, Node 22 scripts. No new dependencies.

## Global Constraints

- No new dependencies; no Tailwind, no UI framework, no client-side JavaScript on these pages.
- One `h1` per page. Section headings are `h2`; item headings are `h3`.
- Reuse `Layout.astro`, `.container`, `.card`, `.mono`, and existing CSS tokens (`--bg-soft`, `--border`, `--text-dim`, `--orange`, `--radius`).
- `updated` renders as `<time datetime="2026-11-07">`.
- The rule **"One purchase covers one end product."** appears verbatim in exactly: `/licence`, `docs/fulfilment.md`, and (in #12) the product page. Do not repeat it on `/services`, `/faq`, or `/portfolio`.
- No invented claims: no "100% satisfaction", no "lifetime updates", no GST/QST number, no fake company details.
- French block is `lang="fr"`, uses proper accents and « » quotes, and promises nothing the English does not.
- `/licence` section order: summary → grant → limits → included → not included → third-party → updates → support → refunds → transfer → end → French summary.
- Any legal-string change requires re-running `npm run licence:render` and re-vendoring `licence/LICENSE.txt` into `templates`.

---

### Task 1: Legal data model

**Files:**
- Create: `src/data/licence.json`
- Create: `src/data/licence.ts`
- Create: `src/data/terms.ts`
- Create: `src/data/faq.ts`
- Modify: `tsconfig.json`
- Test: `npm run check`

**Interfaces:**
- Produces: `LegalItem { title: string; body: string }`, `LegalSection { title: string; items: LegalItem[] }`, `licence`, `LICENCE_RULE`, `licenceSections`, `terms`, `faqGroups`.
- Consumes: nothing.

- [ ] **Step 1: Install dependencies**

Run: `npm ci`
Expected: clean install, `node_modules/` present.

- [ ] **Step 2: Create `src/data/licence.json`**

```json
{
  "updated": "2026-11-07",
  "rule": "One purchase covers one end product.",
  "summary": [
    {
      "title": "One purchase covers one end product",
      "body": "Buy once, publish one website — for yourself or for one client. A second website needs a second licence."
    },
    {
      "title": "Edit it however you like",
      "body": "Change the copy, layout, styles, and code. Remove the footer credit if you want."
    },
    {
      "title": "Don't resell the template itself",
      "body": "You can sell the website you build with it. You can't sell, share, or redistribute the template files."
    }
  ],
  "order": [
    "grant",
    "limits",
    "included",
    "not-included",
    "third-party",
    "updates",
    "support",
    "refunds",
    "transfer",
    "end"
  ],
  "sections": {
    "grant": {
      "title": "What you can do",
      "items": [
        {
          "title": "Use it as one end product",
          "body": "You can use this template to build and publish one website — for yourself or for one client."
        },
        {
          "title": "Edit it freely",
          "body": "Change the copy, layout, styles, and code as much as you like."
        },
        {
          "title": "Keep a staging copy",
          "body": "You can run a private staging or test copy while you build. It must not be published as a separate site."
        },
        {
          "title": "Remove the credit",
          "body": "You may remove the footer credit. You do not have to link back to me."
        },
        {
          "title": "Keep what you make",
          "body": "Your content, your edits, and the site you publish are yours."
        }
      ]
    },
    "limits": {
      "title": "What you can't do",
      "items": [
        {
          "title": "No reselling the template",
          "body": "You may not sell, sublicense, give away, or redistribute the template files, the ZIP, or the source as a template."
        },
        {
          "title": "No template marketplaces",
          "body": "You may not use this template, or a modified version of it, in a competing template marketplace or template shop."
        },
        {
          "title": "No sharing the files",
          "body": "You may not share the ZIP or a downloadable copy with anyone else. Each buyer needs their own licence."
        },
        {
          "title": "No claiming authorship",
          "body": "You may not present the template as your own original work for sale as a template."
        },
        {
          "title": "One end product per purchase",
          "body": "A second website, for a second client or yourself, needs a second licence."
        }
      ]
    },
    "included": {
      "title": "What's included",
      "items": [
        {
          "title": "The template files",
          "body": "The HTML, CSS, JavaScript, or Astro source listed on the product page, in the structure described there."
        },
        {
          "title": "Build scripts",
          "body": "Any build or development scripts that ship inside the ZIP."
        },
        {
          "title": "Bundled fonts and placeholder art",
          "body": "Fonts and placeholder images that come with the template, for use as part of it."
        },
        {
          "title": "The licence",
          "body": "A copy of this licence as LICENSE.txt inside the ZIP."
        }
      ]
    },
    "not-included": {
      "title": "What's not included",
      "items": [
        {
          "title": "A domain name",
          "body": "You register and pay for your own domain."
        },
        {
          "title": "Hosting",
          "body": "You choose and pay for your own host. Any static host works."
        },
        {
          "title": "Email and third-party services",
          "body": "Forms, analytics, booking, payment, and similar services are yours to set up and pay for."
        },
        {
          "title": "Stock assets you add",
          "body": "Photos, fonts, or icons you bring in are not covered by this licence."
        }
      ]
    },
    "third-party": {
      "title": "Third-party assets",
      "items": [
        {
          "title": "Placeholders are for layout",
          "body": "Placeholder images and sample text are there to show the layout. Check each asset's own licence before you publish it."
        },
        {
          "title": "Bundled fonts",
          "body": "Fonts that ship with the template are included as part of the template. Fonts you add are not."
        },
        {
          "title": "Assets you add are yours to licence",
          "body": "This licence does not cover third-party code, photos, or fonts that you add."
        }
      ]
    },
    "updates": {
      "title": "Updates",
      "items": [
        {
          "title": "12 months of updates",
          "body": "Bug fixes and template updates are emailed free for 12 months from your purchase date."
        },
        {
          "title": "No lifetime updates",
          "body": "I do not promise lifetime updates. After 12 months, email me if you need a fix and I will quote it."
        },
        {
          "title": "How updates arrive",
          "body": "I email a new ZIP to the address on your Stripe receipt. Keep that address current or tell me if it changes."
        }
      ]
    },
    "support": {
      "title": "Support",
      "items": [
        {
          "title": "30 days of email support",
          "body": "Email support for bugs in the template as shipped, for 30 days from purchase."
        },
        {
          "title": "Response window",
          "body": "I reply within one business day, Monday to Friday."
        },
        {
          "title": "What is not covered",
          "body": "Content changes, new features, hosting, domains, email, and third-party services are not part of support."
        },
        {
          "title": "Custom work",
          "body": "Changes beyond a bug fix are quoted separately at my hourly rate. See the Services page."
        }
      ]
    },
    "refunds": {
      "title": "Refunds",
      "items": [
        {
          "title": "Sales are final after delivery",
          "body": "Once the ZIP is emailed, the sale is final, because digital files cannot be returned."
        },
        {
          "title": "If something is wrong",
          "body": "If the ZIP is broken or does not match the product page, email me and I will fix it or refund it."
        },
        {
          "title": "Redistribution ends the licence",
          "body": "If you redistribute the template, the licence ends and there is no refund."
        }
      ]
    },
    "transfer": {
      "title": "Transferring the licence",
      "items": [
        {
          "title": "You can transfer it once",
          "body": "If you sell the end product, you may hand this licence to the buyer once."
        },
        {
          "title": "Keep no copy",
          "body": "After transferring, you must keep no copy of the template or the end product."
        },
        {
          "title": "Tell me in writing",
          "body": "Email billing@zouwop.com so my records match the new owner. The new owner is bound by this licence."
        }
      ]
    },
    "end": {
      "title": "When the licence ends",
      "items": [
        {
          "title": "When it ends",
          "body": "The licence ends if you break these terms or transfer it without following the steps above."
        },
        {
          "title": "What to do",
          "body": "Stop using the template and remove it from any live site."
        },
        {
          "title": "What survives",
          "body": "The liability limit and the rules about resale and redistribution survive the end of the licence."
        }
      ]
    }
  },
  "frSummary": "Une licence, un site. Un achat vous permet de publier le modèle comme un seul site web — pour vous ou pour un seul client — et de le modifier comme vous voulez. Vous pouvez transférer la licence une fois, avec ce site. Vous ne pouvez pas revendre, redistribuer ni partager le modèle lui-même, ni l'utiliser dans une place de marché de modèles. Les corrections de bogues sont envoyées par courriel pendant 12 mois. Les ventes sont finales une fois le fichier ZIP envoyé."
}
```

- [ ] **Step 3: Create `src/data/licence.ts`**

```ts
import data from './licence.json';

export interface LegalItem {
  title: string;
  body: string;
}

export interface LegalSection {
  title: string;
  items: LegalItem[];
}

interface LicenceData {
  updated: string;
  rule: string;
  summary: LegalItem[];
  order: string[];
  sections: Record<string, LegalSection>;
  frSummary: string;
}

export const licence = data as LicenceData;

export const LICENCE_RULE: string = licence.rule;

export interface LicenceSectionRef extends LegalSection {
  id: string;
}

export const licenceSections: LicenceSectionRef[] = licence.order.map((id) => {
  const section = licence.sections[id];
  if (!section) throw new Error(`Unknown licence section: ${id}`);
  return { id, ...section };
});
```

- [ ] **Step 4: Create `src/data/terms.ts`**

```ts
import { licence, type LegalItem } from './licence';

export interface TermsSection {
  id: string;
  title: string;
  items: LegalItem[];
}

export const terms: { updated: string; intro: string; sections: TermsSection[] } = {
  updated: '2026-11-07',
  intro:
    'These terms cover buying and using a Zouwop template. The licence itself is on the licence page; where the two overlap, the licence explains what you may do with the files.',
  sections: [
    {
      id: 'ordering',
      title: 'Ordering',
      items: [
        {
          title: 'Payment',
          body: 'Templates are bought through a Stripe Payment Link on the template page. Stripe handles the payment; I never see or store your card details.',
        },
        {
          title: 'Your email',
          body: 'Stripe collects the email address on the receipt. I use it to deliver the template and any updates.',
        },
      ],
    },
    {
      id: 'prices',
      title: 'Prices and taxes',
      items: [
        {
          title: 'Currency',
          body: 'Prices are in Canadian dollars (CAD).',
        },
        {
          title: 'Taxes',
          body: 'I am not registered for GST or QST, so no tax is added at checkout today. If I register, tax will be shown before you pay.',
        },
      ],
    },
    {
      id: 'delivery',
      title: 'Delivery',
      items: [
        {
          title: 'By email, by hand',
          body: 'After payment, I email the ZIP, LICENSE.txt, and a README to the address on the Stripe receipt.',
        },
        {
          title: 'One business day',
          body: 'I send it within one business day, Monday to Friday. There is no instant download.',
        },
        {
          title: 'If it does not arrive',
          body: 'Reply to the Stripe receipt with the receipt number and I will resend it.',
        },
      ],
    },
    {
      id: 'refunds',
      title: 'Refunds',
      items: licence.sections.refunds.items,
    },
    {
      id: 'chargebacks',
      title: 'Chargebacks',
      items: [
        {
          title: 'Disputes pause the licence',
          body: 'If you dispute a charge with your bank, the licence and update emails pause until the dispute is resolved.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Liability',
      items: [
        {
          title: 'Limit',
          body: 'My total liability for a template is limited to the amount you paid for it.',
        },
        {
          title: 'No extra promises',
          body: 'I do not promise that the template will be error-free or fit a particular purpose beyond what the product page describes.',
        },
      ],
    },
    {
      id: 'law',
      title: 'Governing law',
      items: [
        {
          title: 'Québec',
          body: 'These terms are governed by the laws of Québec, Canada.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      items: [
        {
          title: 'Email',
          body: 'For anything about an order or these terms, email billing@zouwop.com.',
        },
      ],
    },
  ],
};
```

- [ ] **Step 5: Create `src/data/faq.ts`**

```ts
export interface FaqItem {
  q: string;
  a: string;
  link?: { label: string; href: string };
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: 'buying',
    title: 'Buying',
    items: [
      {
        q: 'How is the template delivered?',
        a: 'By email, by hand, within one business day of payment. You get a ZIP with the template files, LICENSE.txt, and a README. There is no instant download.',
      },
      {
        q: 'Can I pay another way?',
        a: 'Card payment through Stripe is the default. If you need an invoice or cannot pay by card, email billing@zouwop.com before you buy.',
      },
      {
        q: 'Do you send invoices?',
        a: 'Stripe emails a receipt. If you need an invoice with specific details, ask before buying and I will include them.',
      },
    ],
  },
  {
    id: 'using',
    title: 'Using a template',
    items: [
      {
        q: 'What do I need to run it?',
        a: 'It depends on the template. Static templates are plain HTML, CSS, and JavaScript — you only need a browser and a host. Astro templates need Node 20 or newer and npm to build. The product page lists the stack for each one.',
      },
      {
        q: 'Do I need Node installed?',
        a: 'Only for the Astro templates. Static templates are plain files you can upload as they are.',
      },
      {
        q: 'Can I host it anywhere?',
        a: 'Yes. Any static host works: Cloudflare Pages, Netlify, GitHub Pages, or your own server.',
      },
      {
        q: 'Can I edit it without a developer?',
        a: 'The copy and most colours are plain HTML and CSS. If you are not comfortable editing code, I can make the changes for you at my hourly rate.',
        link: { label: 'See services and rates', href: '/services' },
      },
      {
        q: 'Do I have to keep the footer credit?',
        a: 'No. You can remove it.',
      },
    ],
  },
  {
    id: 'custom',
    title: 'Custom work',
    items: [
      {
        q: 'Can you build on the template?',
        a: 'Yes. I can adapt it to your brand, add pages, or connect a content system. It is scoped work, quoted before I start.',
        link: { label: 'See services', href: '/services' },
      },
      {
        q: 'What is your rate?',
        a: '$75 per hour in CAD, with a one-hour minimum, then billed in 15-minute increments. You get an estimate before I start.',
      },
      {
        q: 'Do I still need to buy the template?',
        a: 'Yes. Buying the template is separate from the custom work.',
      },
    ],
  },
  {
    id: 'bugs',
    title: 'Bugs',
    items: [
      {
        q: 'What is covered?',
        a: 'Bugs in the template as shipped, for 30 days after purchase. I reply within one business day, Monday to Friday.',
      },
      {
        q: 'How do I report a bug?',
        a: 'Email support@zouwop.com with the template name, what you expected, what happened, and your browser. A screenshot helps.',
      },
      {
        q: 'What is not covered?',
        a: 'Content changes, new features, hosting, domains, and third-party services.',
      },
    ],
  },
];
```

- [ ] **Step 6: Allow JSON imports in `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "resolveJsonModule": true
  },
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 7: Type-check**

Run: `npm run check`
Expected: PASS. If it reports `Cannot find module './licence.json'`, confirm Step 6 and re-run.

- [ ] **Step 8: Commit**

```bash
git add src/data/licence.json src/data/licence.ts src/data/terms.ts src/data/faq.ts tsconfig.json
git commit -m "feat(legal): add structured licence, terms and FAQ data"
```

---

### Task 2: `/licence` page

**Files:**
- Create: `src/pages/licence.astro`
- Test: `npm run build`, `npm run check:links`

**Interfaces:**
- Consumes: `licence`, `LICENCE_RULE`, `licenceSections` from Task 1.
- Produces: static route `/licence/` with anchor ids `grant`, `limits`, `included`, `not-included`, `third-party`, `updates`, `support`, `refunds`, `transfer`, `end`, `resume`.

- [ ] **Step 1: Confirm the route does not exist yet**

Run: `npm run build && ls dist/licence 2>/dev/null`
Expected: no `dist/licence` directory.

- [ ] **Step 2: Create `src/pages/licence.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Footer from '../components/Footer.astro';
import { licence, LICENCE_RULE, licenceSections } from '../data/licence';

const date = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'long',
  timeZone: 'UTC',
}).format(new Date(`${licence.updated}T00:00:00Z`));
---
<Layout
  title="Licence — Zouwop"
  description="What you can and cannot do with a Zouwop template: one purchase covers one end product."
>
  <main id="main" tabindex="-1" class="legal">
    <div class="container narrow">
      <h1>Licence</h1>
      <p class="updated">Last updated <time datetime={licence.updated}>{date}</time>.</p>

      <div class="card summary">
        <p class="rule">{LICENCE_RULE}</p>
        <ul class="bullets">
          {licence.summary.map((item) => (
            <li><strong>{item.title}.</strong> {item.body}</li>
          ))}
        </ul>
      </div>

      <nav class="toc" aria-label="On this page">
        <h2>On this page</h2>
        <ol>
          {licenceSections.map((section) => (
            <li><a href={`#${section.id}`}>{section.title}</a></li>
          ))}
          <li><a href="#resume">Résumé en français</a></li>
        </ol>
      </nav>

      {licenceSections.map((section) => (
        <section id={section.id} class="legal-section">
          <h2>{section.title}</h2>
          {section.items.map((item) => (
            <Fragment>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Fragment>
          ))}
        </section>
      ))}

      <section id="resume" lang="fr" class="legal-section fr">
        <h2>Résumé en français</h2>
        <p>{licence.frSummary}</p>
      </section>

      <p class="updated">
        Questions? Email <a href="mailto:billing@zouwop.com">billing@zouwop.com</a>.
      </p>
    </div>
  </main>
  <Footer />
</Layout>

<style>
  .legal { padding: 48px 0 64px; }
  .narrow { max-width: 760px; margin: 0 auto; }
  h1 {
    font-size: clamp(2rem, 6vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .updated { color: var(--text-dim); font-size: 0.9rem; }
  .summary { margin: 32px 0; }
  .rule { font-weight: 700; font-size: 1.15rem; margin-bottom: 12px; color: var(--orange); }
  .bullets { list-style: disc; padding-left: 20px; display: grid; gap: 8px; color: var(--text-dim); }
  .bullets strong { color: var(--text); }
  .toc {
    margin: 40px 0;
    padding: 20px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-soft);
  }
  .toc h2 { font-size: 1rem; margin-bottom: 12px; }
  .toc ol { padding-left: 20px; display: grid; gap: 6px; }
  .toc a { color: var(--text-dim); }
  .toc a:hover { color: var(--orange); }
  .legal-section { padding: 32px 0; border-top: 1px solid var(--border); }
  .legal-section h2 { font-size: 1.5rem; margin-bottom: 20px; }
  .legal-section h3 { font-size: 1.05rem; margin: 20px 0 4px; }
  .legal-section p { color: var(--text-dim); }
  .fr { border-top: 2px solid var(--border-strong); }
  a { color: var(--orange); }
  a:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
</style>
```

- [ ] **Step 3: Build and check links**

Run: `npm run build && npm run check:links`
Expected: PASS; the build creates `dist/licence/index.html`, and every TOC anchor resolves.

- [ ] **Step 4: Verify page structure**

Run:
```bash
grep -c '<h1' dist/licence/index.html
grep -c 'lang="fr"' dist/licence/index.html
grep -c 'datetime="2026-11-07"' dist/licence/index.html
grep -c 'One purchase covers one end product' dist/licence/index.html
```
Expected: `1`, `1`, `1`, and at least `1` (the summary rule; the bullet repeats the phrase with a full stop).

- [ ] **Step 5: Commit**

```bash
git add src/pages/licence.astro
git commit -m "feat(legal): add licence page"
```

---

### Task 3: `/terms` page

**Files:**
- Create: `src/pages/terms.astro`
- Test: `npm run build`, `npm run check:links`

**Interfaces:**
- Consumes: `terms` from Task 1, `site.contact.linkedin` from `src/data/site.ts`.
- Produces: static route `/terms/`.

- [ ] **Step 1: Create `src/pages/terms.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Footer from '../components/Footer.astro';
import { terms } from '../data/terms';
import { site } from '../data/site';

const date = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'long',
  timeZone: 'UTC',
}).format(new Date(`${terms.updated}T00:00:00Z`));
---
<Layout
  title="Terms — Zouwop"
  description="How buying a Zouwop template works: ordering, CAD prices and taxes, delivery, refunds, chargebacks, liability, and Québec law."
>
  <main id="main" tabindex="-1" class="legal">
    <div class="container narrow">
      <h1>Terms</h1>
      <p class="updated">Last updated <time datetime={terms.updated}>{date}</time>.</p>
      <p class="intro">{terms.intro}</p>

      {terms.sections.map((section) => (
        <section id={section.id} class="legal-section">
          <h2>{section.title}</h2>
          {section.items.map((item) => (
            <Fragment>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Fragment>
          ))}
        </section>
      ))}

      <p class="updated">
        You can also reach me on
        <a href={site.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
      </p>
    </div>
  </main>
  <Footer />
</Layout>

<style>
  .legal { padding: 48px 0 64px; }
  .narrow { max-width: 760px; margin: 0 auto; }
  h1 {
    font-size: clamp(2rem, 6vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .updated { color: var(--text-dim); font-size: 0.9rem; }
  .intro { color: var(--text-dim); margin: 20px 0 8px; }
  .legal-section { padding: 32px 0; border-top: 1px solid var(--border); }
  .legal-section h2 { font-size: 1.5rem; margin-bottom: 20px; }
  .legal-section h3 { font-size: 1.05rem; margin: 20px 0 4px; }
  .legal-section p { color: var(--text-dim); }
  a { color: var(--orange); }
  a:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
</style>
```

- [ ] **Step 2: Build and check**

Run: `npm run build && npm run check:links`
Expected: PASS; `dist/terms/index.html` exists.

- [ ] **Step 3: Verify terms content**

Run:
```bash
grep -c '<h1' dist/terms/index.html
grep -c 'not registered for GST or QST' dist/terms/index.html
grep -c 'governed by the laws of Québec' dist/terms/index.html
```
Expected: `1`, `1`, `1`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/terms.astro
git commit -m "feat(legal): add terms page"
```

---

### Task 4: `/faq` page

**Files:**
- Create: `src/pages/faq.astro`
- Test: `npm run build`, `npm run check:links`

**Interfaces:**
- Consumes: `faqGroups` from Task 1.
- Produces: static route `/faq/` with group anchors `buying`, `using`, `custom`, `bugs`.

- [ ] **Step 1: Create `src/pages/faq.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Footer from '../components/Footer.astro';
import { faqGroups } from '../data/faq';
---
<Layout
  title="FAQ — Zouwop"
  description="Answers about buying, using, and getting help with a Zouwop template."
>
  <main id="main" tabindex="-1" class="faq">
    <div class="container narrow">
      <h1>Questions</h1>
      <p class="intro">
        Short answers to what buyers ask most. Anything missing:
        <a href="mailto:support@zouwop.com">support@zouwop.com</a>.
      </p>

      {faqGroups.map((group) => (
        <section id={group.id} class="group">
          <h2>{group.title}</h2>
          {group.items.map((item) => (
            <Fragment>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
              {item.link && <p><a href={item.link.href}>{item.link.label}</a></p>}
            </Fragment>
          ))}
        </section>
      ))}
    </div>
  </main>
  <Footer />
</Layout>

<style>
  .faq { padding: 48px 0 64px; }
  .narrow { max-width: 760px; margin: 0 auto; }
  h1 {
    font-size: clamp(2rem, 6vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .intro { color: var(--text-dim); margin-bottom: 24px; }
  .group { padding: 32px 0; border-top: 1px solid var(--border); }
  .group h2 { font-size: 1.5rem; margin-bottom: 20px; }
  .group h3 { font-size: 1.05rem; margin: 24px 0 4px; }
  .group p { color: var(--text-dim); }
  a { color: var(--orange); }
  a:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
</style>
```

- [ ] **Step 2: Build and check**

Run: `npm run build && npm run check:links`
Expected: PASS; `dist/faq/index.html` exists and the `/services` links resolve.

- [ ] **Step 3: Verify FAQ content**

Run:
```bash
grep -c '<h1' dist/faq/index.html
grep -c '\$75 per hour' dist/faq/index.html
grep -c 'One purchase covers one end product' dist/faq/index.html
```
Expected: `1`, `1`, `0` (the rule must not be repeated here).

- [ ] **Step 4: Commit**

```bash
git add src/pages/faq.astro
git commit -m "feat(legal): add FAQ page"
```

---

### Task 5: Footer links and the hourly rate

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/data/services.ts`
- Test: `npm run check`, `npm run build`, `npm run check:links`

**Interfaces:**
- Consumes: routes from Tasks 2–4.
- Produces: footer links `/licence`, `/terms`, `/faq`; a fifth service with `id: 'build-on-template'` and `price: '$75/hour CAD'`.

- [ ] **Step 1: Add the legal links to `src/components/Footer.astro`**

Replace the `.socials` block with:

```astro
    <div class="socials">
      <a href="/services">Services</a>
      <a href="/links">Links</a>
      <a href="/portfolio">Portfolio</a>
      <a href="/licence">Licence</a>
      <a href="/terms">Terms</a>
      <a href="/faq">FAQ</a>
      <a href={site.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href={site.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
```

- [ ] **Step 2: Add the "Build on a template" service**

Insert this object into `services` in `src/data/services.ts` after the `web` entry:

```ts
  {
    id: 'build-on-template',
    name: 'Build on a template',
    summary: 'Buy a template and have me adapt it to your brand and content.',
    price: '$75/hour CAD',
    points: [
      'Adapting a template you bought: copy, colours, sections, and small features.',
      'Quoted before I start. One-hour minimum, then billed in 15-minute increments.',
      'Buying the template itself is separate from the custom work.',
    ],
    ctaLabel: 'Email about a build',
    ctaSubject: 'Build on a template',
    ctaEmail: 'booking@zouwop.com',
  },
```

- [ ] **Step 3: Verify and build**

Run: `npm run check && npm run build && npm run check:links`
Expected: PASS.

- [ ] **Step 4: Verify footer links and the rate**

Run:
```bash
grep -c 'href="/licence"' dist/index.html
grep -c 'href="/terms"' dist/index.html
grep -c 'href="/faq"' dist/index.html
grep -c '\$75/hour CAD' dist/services/index.html
```
Expected: `1`, `1`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro src/data/services.ts
git commit -m "feat(legal): link legal pages from the footer and add template rate"
```

---

### Task 6: Licence render, parity lock and CI check

**Files:**
- Create: `scripts/check-licence.mjs`
- Create: `licence/LICENSE.txt` (generated)
- Create: `licence/parity.lock` (generated)
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Test: `npm run check:licence`, `npm run licence:render`

**Interfaces:**
- Consumes: `src/data/licence.json` and its `order`/`sections` shape from Task 1.
- Produces: `renderLicence(licence) -> string`, `licence/LICENSE.txt`, `licence/parity.lock`, npm scripts `check:licence` and `licence:render`.

- [ ] **Step 1: Create `scripts/check-licence.mjs`**

```js
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'src/data/licence.json');
const LOCK = path.join(ROOT, 'licence/parity.lock');
const TXT = path.join(ROOT, 'licence/LICENSE.txt');

export function renderLicence(licence) {
  const lines = [];
  lines.push('LICENCE — Zouwop');
  lines.push(`Last updated: ${licence.updated}`);
  lines.push('');
  lines.push(licence.rule);

  for (const id of licence.order) {
    const section = licence.sections[id];
    if (!section) throw new Error(`Unknown licence section: ${id}`);
    lines.push('');
    lines.push(section.title.toUpperCase());
    for (const item of section.items) {
      lines.push('');
      lines.push(item.title);
      lines.push(item.body);
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

const data = JSON.parse(readFileSync(DATA, 'utf8'));
const text = renderLicence(data);
const hash = createHash('sha256').update(text).digest('hex');

if (process.argv.includes('--write')) {
  mkdirSync(path.dirname(TXT), { recursive: true });
  writeFileSync(TXT, text);
  writeFileSync(LOCK, `${hash}\n`);
  console.log(`Wrote licence/LICENSE.txt and licence/parity.lock (sha256 ${hash}).`);
} else {
  let locked = '';
  try {
    locked = readFileSync(LOCK, 'utf8').trim();
  } catch {
    locked = '';
  }

  if (!locked) {
    console.error('licence/parity.lock is missing. Run: npm run licence:render');
    process.exit(1);
  }

  if (locked !== hash) {
    console.error('Licence text does not match licence/parity.lock.');
    console.error(`  expected ${locked}`);
    console.error(`  rendered ${hash}`);
    console.error('If the change is intentional: npm run licence:render, then copy licence/LICENSE.txt into the templates repo and update its pinned hash.');
    process.exit(1);
  }

  console.log(`Licence text matches parity.lock (sha256 ${hash.slice(0, 12)}…).`);
}
```

- [ ] **Step 2: Run the check before generating the lock (failing test)**

Run: `node scripts/check-licence.mjs`
Expected: FAIL with "licence/parity.lock is missing" and exit code 1.

- [ ] **Step 3: Generate the lock and text**

Run: `node scripts/check-licence.mjs --write`
Expected: prints `Wrote licence/LICENSE.txt and licence/parity.lock`; both files exist.

- [ ] **Step 4: Verify tamper detection**

Run:
```bash
cp licence/parity.lock /tmp/parity.lock.bak
printf '0000\n' > licence/parity.lock
node scripts/check-licence.mjs
cp /tmp/parity.lock.bak licence/parity.lock
node scripts/check-licence.mjs
```
Expected: the middle command FAILS with a hash mismatch; the last command PASSES.

- [ ] **Step 5: Add npm scripts**

In `package.json`, set `scripts` to:

```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "check:links": "node scripts/check-links.mjs",
    "check:licence": "node scripts/check-licence.mjs",
    "licence:render": "node scripts/check-licence.mjs --write"
  },
```

- [ ] **Step 6: Add the CI step**

In `.github/workflows/ci.yml`, after the "Check internal links" step, add:

```yaml
      - name: Check licence parity
        run: npm run check:licence
```

- [ ] **Step 7: Verify**

Run: `npm run check:licence`
Expected: PASS with the sha256 prefix printed.

- [ ] **Step 8: Commit**

```bash
git add scripts/check-licence.mjs licence/LICENSE.txt licence/parity.lock package.json .github/workflows/ci.yml
git commit -m "feat(legal): render LICENSE.txt and enforce licence parity in CI"
```

---

### Task 7: Parity and fulfilment docs

**Files:**
- Create: `docs/licence-parity.md`
- Create: `docs/fulfilment.md`
- Test: reviewer read-through; `grep` for the rule sentence

**Interfaces:**
- Consumes: the mechanism from Task 6.
- Produces: the operational runbook and the review note.

- [ ] **Step 1: Create `docs/licence-parity.md`**

```markdown
# Licence parity

The licence text exists in one place: `src/data/licence.json`. `src/data/licence.ts` is
its typed wrapper, and `/licence` renders it. Nothing else may restate it.

## How `LICENSE.txt` is produced

`npm run licence:render` runs `scripts/check-licence.mjs --write`, which:

1. renders `src/data/licence.json` to plain text in the order set by its `order` array;
2. writes the result to `licence/LICENSE.txt`;
3. writes the SHA-256 of that text to `licence/parity.lock`.

`npm run check:licence` re-renders and compares. A wording change without re-running
`licence:render` fails CI and prints both hashes.

## Why not a shared markdown file

The issue proposed a markdown file committed in both repos. I did not use that because:

- it would be a second copy of the legal text, which is exactly what drifts;
- the `templates` repo is private, so this repo's CI cannot fetch it to compare.

A pinned hash needs no network access and still catches drift on both sides.

## The contract with `templates`

`templates#1` vendors `licence/LICENSE.txt` as its `LICENSE.txt` template and pins the same
SHA-256 in its CI. Both repos fail when the text changes until both are updated.

## Update checklist

- [ ] Edit `src/data/licence.json` (or `terms.ts` / `faq.ts` for those pages).
- [ ] Run `npm run licence:render`.
- [ ] Run `npm run check`, `npm run build`, `npm run check:links`, `npm run check:licence`.
- [ ] Copy `licence/LICENSE.txt` into the `templates` repo and update its pinned hash.
- [ ] Bump `updated` in `licence.json` and `terms.ts` to the change date.
- [ ] Note the change and the new hash in the PR.

## Before the first sale

**A Québec lawyer should review `/licence` and `/terms` before the first sale.**

Things I was not sure about, and wrote conservatively:

- Whether "sales are final" is enforceable for digital goods in Québec, and whether the
  broken-file exception is enough.
- Whether the 12-month updates promise matches what will actually be delivered.
- Whether "Zouwop" without a registered legal name is enough identification on a consumer
  contract.
- Whether the chargeback-pause clause and the liability cap are enforceable as written.
- Whether `/terms` needs a French version under the Charter of the French Language. Only
  the licence has a French summary today.
```

- [ ] **Step 2: Create `docs/fulfilment.md`**

```markdown
# Fulfilment runbook

Manual fulfilment: Stripe Payment Link, then email the ZIP by hand. Full setup and the
per-sale checklist are added by issue #14. This file currently records the licence rules
that fulfilment must honour.

## Licence rules on every sale

- **One purchase covers one end product.** Email this sentence unchanged if a buyer asks
  what they bought.
- Attach `licence/LICENSE.txt` from this repo to every delivery. It is generated from
  `src/data/licence.json`; do not hand-edit it.
- Support is 30 days for bugs in the template as shipped, with a reply within one business
  day, Monday to Friday.
- Updates are free by email for 12 months from purchase. There is no lifetime-update
  promise.
- Sales are final once the ZIP is emailed. If the ZIP is broken or does not match the
  product page, fix it or refund it.

The full text is on https://zouwop.com/licence. Do not restate it here; link to it.
```

- [ ] **Step 3: Verify the shared sentence appears in both required places**

Run:
```bash
grep -c 'One purchase covers one end product' docs/fulfilment.md
grep -c 'One purchase covers one end product' src/data/licence.json
```
Expected: `1` and `2` (the rule plus the summary bullet).

- [ ] **Step 4: Commit**

```bash
git add docs/licence-parity.md docs/fulfilment.md
git commit -m "docs(legal): add licence parity and fulfilment notes"
```

---

### Task 8: Full verification, responsive check, PR

**Files:**
- No source changes expected.
- Test: the whole pipeline.

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Run the full local pipeline**

Run:
```bash
npm run check && npm run build && npm run check:links && npm run check:licence && npm run check:links -- --self-test
```
Expected: every command passes.

- [ ] **Step 2: Check the page-level acceptance items**

Run:
```bash
grep -c '<h1' dist/licence/index.html dist/terms/index.html dist/faq/index.html
grep -c 'lang="fr"' dist/licence/index.html
grep -o '«[^»]*»' dist/licence/index.html | head -5
```
Expected: `1` for each page; `1` for `lang="fr"`; the French paragraph renders accented text with « ».

- [ ] **Step 3: Check the rule appears in exactly the allowed places**

Run:
```bash
grep -rn 'One purchase covers one end product' src docs dist --include='*.json' --include='*.ts' --include='*.md' --include='*.html'
```
Expected: `/licence` output, `src/data/licence.json`, and `docs/fulfilment.md`. Nothing on `/faq`, `/services`, or `/portfolio`.

- [ ] **Step 4: Responsive and keyboard check**

Run: `npm run dev`
At 360px and 1280px on `/licence`:
- no horizontal scroll; TOC links are reachable by Tab and land on the right section;
- one `h1`; the French block is visually distinct and reads with correct accents;
- `/terms` and `/faq` have no overflow at 360px.

- [ ] **Step 5: Review the diff**

Run: `git status && git diff --stat main...HEAD`
Expected: only the files listed in Tasks 1–7.

- [ ] **Step 6: Push and open the PR**

```bash
git push -u origin Z0uw0p/store-licence-terms-and-faq-pages
gh pr create --base main --head Z0uw0p/store-licence-terms-and-faq-pages \
  --title "store: licence, terms and FAQ pages" \
  --body "Closes #15.

Adds /licence, /terms and /faq, all data-driven from src/data. Adds footer links, a
\$75/hour template-build line on /services, a generated licence/ LICENSE.txt, and a
hash-pinned parity check in CI.

Flags:
- No sitemap exists yet (#17), so these pages are not in one.
- /templates, product pages and /thank-you do not exist yet (#12/#14); their links to
  /licence land there.
- docs/fulfilment.md is a stub for #14.
- A Québec lawyer should review /licence and /terms before the first sale.
- /services had no hourly rate; added \$75/hour CAD as agreed."
```

- [ ] **Step 7: Confirm CI**

Run: `gh pr checks --watch`
Expected: the `Verify` job passes, including "Check licence parity".

## Self-review notes

- Spec coverage: data model (Task 1), three pages (Tasks 2–4), footer + rate (Task 5),
  parity mechanism (Task 6), docs and lawyer note (Task 7), verification and PR (Task 8).
  Deferred by design: sitemap (#17), product/thank-you/templates links (#12/#14).
- Type consistency: `LegalItem` / `LegalSection` / `LicenceSectionRef` are defined once in
  `licence.ts`; `terms.ts` and the pages import them; `renderLicence` reads the same
  `order`/`sections` keys the page maps over.
- No placeholders: every file is written out in full.
