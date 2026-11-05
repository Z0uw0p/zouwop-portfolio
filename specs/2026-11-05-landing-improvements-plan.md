# Landing Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared top navigation, move all pricing to a new `/services` page, promote web development, and clear every design-review finding on zouwop.com.

**Architecture:** A new `Header.astro` is rendered by `Layout.astro` on every page, alongside a shared skip link and metadata; each page owns its own `main` landmark and footer. `/services` becomes the single place where prices render; homepage service cards become whole-card links to it. Tokens and a reduced-motion block live in `global.css`.

**Tech Stack:** Astro 5 (static output), vanilla CSS, a small vanilla JS header script. No new dependencies.

## Global Constraints

- Static output only; `astro.config.mjs` already sets `site: 'https://zouwop.com'` and `output: 'static'`.
- No prices on `/`: `$20` must not appear in the rendered homepage.
- Prices render only on `/services`.
- Every interactive target is at least 44×44 CSS px.
- Focus rings are 2px solid `var(--focus)` with 2px offset.
- After Task 6, no raw `#23232e`, `#2a2a38`, or `#3a3a4a` literals remain in `src/` outside the `:root` token declarations in `src/styles/global.css`.
- Run `npm run build` after every task; the repo has no unit-test runner, so build assertions and Playwright checks are the test cycle.
- Commit steps are included for a normal workflow. Do not run them unless the user has explicitly approved committing.

---

### Task 1: Global tokens, reduced motion, skip-link and screen-reader utilities

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `--border`, `--border-strong`, `--border-hover`, `--focus`, `.skip-link`, `.sr-only`, and global `[id]` scroll offsets used by every later task.

- [ ] **Step 1: Replace the `:root` block and add utilities**

Replace the existing `:root { ... }` block (lines 1–11) with:

```css
:root {
  --bg: #0d0d12;
  --bg-soft: #14141c;
  --orange: #ff8c42;
  --purple: #a78bfa;
  --text: #e6e6eb;
  --text-dim: #9a9aa8;
  --border: #23232e;
  --border-strong: #5f5f74;
  --border-hover: #3a3a4a;
  --focus: var(--orange);
  --mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;
  --sans: 'Inter', system-ui, -apple-system, sans-serif;
  --radius: 14px;
}
```

After the `html { scroll-behavior: smooth; }` line, add:

```css
section[id],
main[id] {
  scroll-margin-top: 88px;
}

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

.skip-link {
  position: absolute;
  left: 16px;
  top: -100px;
  z-index: 100;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--orange);
  color: #0d0d12;
  font-weight: 600;
  text-decoration: none;
}

.skip-link:focus {
  top: 16px;
}
```

- [ ] **Step 2: Switch existing borders to tokens**

Change `.btn-secondary`:

```css
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border-strong);
}
```

Change `.card` and `.card:hover`:

```css
.card {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card:hover {
  border-color: var(--border-hover);
  transform: translateY(-4px);
}
```

- [ ] **Step 3: Add the reduced-motion block at the end of the file**

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: build succeeds.

Run: `grep -n "prefers-reduced-motion\|--border-strong\|skip-link\|scroll-margin" src/styles/global.css`
Expected: all four appear.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add border tokens, skip link, and reduced-motion support"
```

---

### Task 2: Header, Layout integration, metadata, and main landmark

**Files:**
- Create: `src/components/Header.astro`
- Modify: `src/components/Wordmark.astro`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro` (add the `main` landmark)
- Modify: `src/pages/links.astro` (main `id`, description)
- Modify: `src/pages/portfolio.astro` (main `id`, description)

**Interfaces:**
- Consumes: `.skip-link`, `.sr-only`, `--border`, `--border-strong`, `--focus`, and `[id]` offsets from Task 1.
- Produces: `Header` rendered by `Layout`; `Wordmark` gains `as?: 'span' | 'h1'`; `Layout` gains `description?` and `path?` props. Each page owns its `<main id="main">`.

- [ ] **Step 1: Give `Wordmark` an `as` prop**

Replace `src/components/Wordmark.astro` with:

```astro
---
interface Props { size?: 'sm' | 'lg'; as?: 'span' | 'h1'; }
const { size = 'lg', as: Tag = 'span' } = Astro.props;
---
<Tag class:list={['wordmark', size === 'lg' ? 'wordmark-lg' : 'wordmark-sm']}>Zouwop</Tag>

<style>
  .wordmark {
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(90deg, var(--orange), var(--purple));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .wordmark-lg { font-size: clamp(2.5rem, 8vw, 4.5rem); }
  .wordmark-sm { font-size: 1.4rem; }
</style>
```

- [ ] **Step 2: Create `src/components/Header.astro`**

```astro
---
import Wordmark from './Wordmark.astro';

const path = Astro.url.pathname.replace(/\/+$/, '') || '/';
const links = [
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Links', href: '/links' },
  { label: 'Contact', href: '/#contact' },
];
const isActive = (href: string) => href === path;
---
<header class="site-header" data-header>
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="Zouwop home">
      <Wordmark size="sm" />
    </a>

    <button
      class="menu-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="site-menu"
      data-menu-toggle
    >
      <span class="sr-only">Menu</span>
      <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
    </button>

    <nav id="site-menu" class="site-nav" aria-label="Primary" data-menu>
      {links.map((link) => (
        <a href={link.href} aria-current={isActive(link.href) ? 'page' : undefined}>
          {link.label}
        </a>
      ))}
      <a class="btn btn-primary header-cta" href="/#contact">Book a call</a>
    </nav>
  </div>
</header>

<script>
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (header && toggle && menu) {
    let lastY = window.scrollY;
    let ticking = false;
    let menuOpen = false;

    const setMenu = (open) => {
      menuOpen = open;
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      if (open) {
        header.classList.remove('header--hidden');
        const first = menu.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }
    };

    toggle.addEventListener('click', () => setMenu(!menuOpen));

    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (menuOpen && !header.contains(event.target)) setMenu(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 720 && menuOpen) setMenu(false);
    });

    header.addEventListener('focusin', () => header.classList.remove('header--hidden'));

    const onScroll = () => {
      const y = window.scrollY;
      if (!menuOpen) {
        if (y > lastY && y > 80) header.classList.add('header--hidden');
        else header.classList.remove('header--hidden');
      }
      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    }, { passive: true });
  }
</script>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 60;
    background: rgba(13, 13, 18, 0.86);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    transition: transform 0.2s ease;
  }
  .site-header.header--hidden { transform: translateY(-100%); }
  .header-inner {
    display: flex;
    align-items: center;
    gap: 20px;
    min-height: 64px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    text-decoration: none;
  }
  .menu-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-left: auto;
    padding: 0;
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
  }
  .menu-icon {
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
  }
  .menu-icon span {
    display: block;
    width: 18px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
  }
  .site-nav {
    display: flex;
    align-items: center;
    gap: 22px;
    margin-left: auto;
  }
  .site-nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--text-dim);
    font-size: 0.9rem;
    text-decoration: none;
  }
  .site-nav a:hover { color: var(--text); }
  .site-nav a[aria-current='page'] { color: var(--orange); }
  .header-cta {
    padding: 10px 18px;
    font-size: 0.9rem;
  }
  .site-nav a.header-cta {
    color: #0d0d12;
  }
  .site-nav a.header-cta:hover {
    color: #0d0d12;
  }
  .site-nav a:focus-visible,
  .menu-toggle:focus-visible,
  .brand:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  @media (max-width: 719px) {
    .header-inner { flex-wrap: wrap; }
    :global(html.js) .site-nav {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      margin: 0;
      padding: 8px 24px 20px;
      background: rgba(13, 13, 18, 0.98);
      border-bottom: 1px solid var(--border);
    }
    :global(html.js) .site-nav.is-open { display: flex; }
    :global(html.js) .menu-toggle { display: inline-flex; }
    :global(html.js) .site-nav a { min-height: 48px; }
    .header-cta {
      justify-content: center;
      margin-top: 8px;
    }
  }
</style>
```

- [ ] **Step 3: Rewrite `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';

interface Props {
  title: string;
  description?: string;
  path?: string;
}
const {
  title,
  description = 'Self-hosted infrastructure setup, tech support calls, web development, and managed hosting on a server you control.',
  path,
} = Astro.props;

const site = Astro.site ?? new URL('https://zouwop.com');
const canonical = new URL(path ?? Astro.url.pathname, site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical.href} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Zouwop" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical.href} />
    <meta name="twitter:card" content="summary" />
    <meta name="theme-color" content="#0d0d12" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
    <script is:inline>document.documentElement.classList.add('js');</script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <Header />
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Add the homepage `main` landmark**

In `src/pages/index.astro`, wrap Hero → Contact in `<main id="main" tabindex="-1">` and keep `<Footer />` outside it:

```astro
<Layout title="Zouwop">
  <main id="main" tabindex="-1">
    <Hero />
    <Services />
    <Stack />
    <Elsewhere />
    <Contact />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 5: Add `id="main"` to the subpage landmarks and add descriptions**

In `src/pages/links.astro`, change `<main class="page">` to
`<main id="main" tabindex="-1" class="page">`, then change the opening layout tag to:

```astro
<Layout
  title="Links — Zouwop"
  description="Referral offers I actually use — sign up through these and we both get a bonus."
>
```

In `src/pages/portfolio.astro`, change `<main class="page">` to
`<main id="main" tabindex="-1" class="page">`, then change the layout tag to:

```astro
<Layout
  title="Portfolio — Zouwop"
  description="Sites I've built, offered as templates. See the live site and the placeholder template."
>
```

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: build succeeds.

Run:

```bash
node -e "
const fs = require('fs');
for (const file of ['dist/index.html','dist/links/index.html','dist/portfolio/index.html']) {
  const html = fs.readFileSync(file, 'utf8');
  const mains = (html.match(/<main\b/g) || []).length;
  if (mains !== 1) throw new Error(file + ': expected 1 main, found ' + mains);
  if (!html.includes('class=\"site-header\"')) throw new Error(file + ': header missing');
  if (!html.includes('skip-link')) throw new Error(file + ': skip link missing');
  if (!html.includes('id=\"main\"')) throw new Error(file + ': main target missing');
  if (!html.includes('rel=\"canonical\"')) throw new Error(file + ': canonical missing');
}
console.log('layout checks passed');
"
```

Expected: `layout checks passed`.

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.astro src/components/Wordmark.astro src/layouts/Layout.astro src/pages/links.astro src/pages/portfolio.astro
git commit -m "feat: add shared header, main landmark, and page metadata"
```

---

### Task 3: Service data and homepage service cards

**Files:**
- Modify: `src/data/services.ts`
- Rewrite: `src/components/Services.astro`

**Interfaces:**
- Consumes: `--border`, `--text-dim`, `--orange`, `--focus` from Task 1.
- Produces: `Service.summary: string`; a fourth service with `id: 'web'`; homepage cards linking to `/services#<id>`.

- [ ] **Step 1: Add `summary` and the web entry**

Replace `src/data/services.ts` with:

```ts
export interface Service {
  id: string;
  name: string;
  summary: string;    // one line used on the homepage card
  price: string;      // shown only on /services
  points: string[];   // 2-3 concrete bullets
  excluded?: string;  // one honest "not included" line
  ctaLabel: string;
  ctaSubject: string; // pre-filled mailto subject
  ctaEmail: string;   // full address the CTA points at
}

export const services: Service[] = [
  {
    id: 'setup',
    name: 'Setup, done for you',
    summary: 'Server, network, and app installs — scoped and agreed in writing.',
    price: 'Scoped per job',
    points: [
      'Automations, server and network setup, installs and configuration: Nextcloud, Immich, Jellyfin, the *arr stack, Kavita, Tailscale, backups, monitoring.',
      'Scope and price agreed in writing before I start.',
    ],
    excluded: 'Not included: hardware, domains, licences, or ongoing maintenance — unless we agree on it separately.',
    ctaLabel: 'Email what you need',
    ctaSubject: 'Setup job',
    ctaEmail: 'booking@zouwop.com',
  },
  {
    id: 'tech-call',
    name: 'Tech call',
    summary: 'A 30-minute call on any tech question, with follow-up research.',
    price: '30 min · $20',
    points: [
      "Any tech question: a service that won't start, whether to self-host something, backups, what hardware to buy, whether AI agents are worth it in your case.",
      "If I don't know it offhand, I say so on the call and research it afterwards — you get what I find, or a pointer to someone who does know.",
    ],
    ctaLabel: 'Email to book',
    ctaSubject: 'Tech call (30 min, $20)',
    ctaEmail: 'booking@zouwop.com',
  },
  {
    id: 'hosted',
    name: 'Hosted services',
    summary: 'An account on infrastructure I run and maintain for you.',
    price: 'Monthly',
    points: [
      'An account on infrastructure I run and maintain — nothing for you to install or babysit.',
      'Live today: book library, budget tracking. In progress: file conversion.',
      'Small number of accounts. Email for availability and price.',
    ],
    ctaLabel: 'Email for availability',
    ctaSubject: 'Hosted services',
    ctaEmail: 'billing@zouwop.com',
  },
  {
    id: 'web',
    name: 'Web development',
    summary: 'Landing pages, small sites, and internal tools — static or Astro.',
    price: 'Scoped per job',
    points: [
      'Landing pages, portfolio sites, and small internal tools.',
      'Fixed scope and price agreed in writing before I start.',
      'Astro + Cloudflare Pages, or plain HTML/CSS if you prefer.',
    ],
    excluded: 'Not included: copywriting, photography, or ongoing content updates — unless we agree on it separately.',
    ctaLabel: 'Email about a site',
    ctaSubject: 'Web development',
    ctaEmail: 'booking@zouwop.com',
  },
];
```

- [ ] **Step 2: Rewrite `src/components/Services.astro` as the card grid**

```astro
---
import { services } from '../data/services';
---
<section id="services">
  <div class="container">
    <h2>What I do</h2>
    <p class="section-sub">Four ways to work with me. Prices and full details are on the services page.</p>
    <div class="grid">
      {services.map((s) => (
        <a class="card service-card" href={`/services#${s.id}`}>
          <h3>{s.name}</h3>
          <p class="summary">{s.summary}</p>
          <span class="more">See details <span aria-hidden="true">→</span></span>
        </a>
      ))}
    </div>
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 640px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }
  .service-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: inherit;
    text-decoration: none;
  }
  h3 {
    font-size: 1.25rem;
    margin-bottom: 8px;
  }
  .summary {
    color: var(--text-dim);
    font-size: 0.95rem;
  }
  .more {
    margin-top: auto;
    padding-top: 20px;
    color: var(--orange);
    font-weight: 600;
    font-size: 0.9rem;
  }
  .service-card:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
</style>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build succeeds.

Run:

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const services = html.split('<section id=\"services\"')[1]?.split('</section>')[0] ?? '';
for (const id of ['setup','tech-call','hosted','web']) {
  if (!services.includes('/services#' + id)) throw new Error('missing card link for ' + id);
}
if ((services.match(/class=\"card service-card\"/g) || []).length !== 4) throw new Error('expected 4 service cards');
if (services.includes('\$20') || services.includes('Scoped per job') || services.includes('Monthly')) throw new Error('services section still renders a price');
console.log('service card checks passed');
"
```

Expected: `service card checks passed`.

The homepage-wide “no `$20`” check belongs to Task 5, which removes the hero price; this task only owns the services section.

- [ ] **Step 4: Commit**

```bash
git add src/data/services.ts src/components/Services.astro
git commit -m "feat: promote web development and move pricing off the homepage"
```

---

### Task 4: New `/services` page

**Files:**
- Create: `src/pages/services.astro`

**Interfaces:**
- Consumes: `services` (with `summary`, `price`, `points`, `excluded`, CTA fields) from Task 3; `Layout` and `Footer`.
- Produces: `https://zouwop.com/services` with anchored sections `#setup`, `#tech-call`, `#hosted`, `#web`.

- [ ] **Step 1: Create `src/pages/services.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Footer from '../components/Footer.astro';
import { services } from '../data/services';
---
<Layout
  title="Services — Zouwop"
  description="Self-hosted setup, 30-minute tech calls, managed hosting, and web development. Scope and pricing for each."
>
  <main id="main" tabindex="-1" class="page">
    <div class="container narrow">
      <h1>Services</h1>
      <p class="intro">Four ways to work with me, with prices. Everything starts with an email.</p>

      <div class="service-list">
        {services.map((s) => (
          <section class="service" id={s.id}>
            <h2>{s.name}</h2>
            <span class="mono price">{s.price}</span>
            <ul class="points">
              {s.points.map((p) => <li>{p}</li>)}
            </ul>
            {s.excluded && <p class="excluded">{s.excluded}</p>}
            <a class="cta" href={`mailto:${s.ctaEmail}?subject=${encodeURIComponent(s.ctaSubject)}`}>
              {s.ctaLabel}
            </a>
          </section>
        ))}
      </div>

      <p class="outro">Not sure which fits? <a href="/#contact">Get in touch</a>.</p>
    </div>
  </main>
  <Footer />
</Layout>

<style>
  .page { padding: 48px 0 64px; }
  .narrow { max-width: 760px; margin: 0 auto; }
  h1 {
    font-size: clamp(2rem, 6vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .intro {
    color: var(--text-dim);
    margin-bottom: 40px;
    font-size: 1.05rem;
  }
  .service-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .service {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
  }
  .service h2 {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }
  .price {
    border: 1px solid var(--text-dim);
    color: var(--orange);
    border-radius: 999px;
    padding: 4px 12px;
    margin-bottom: 20px;
  }
  .points {
    list-style: disc;
    padding-left: 18px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: var(--text-dim);
    font-size: 0.95rem;
  }
  .excluded {
    color: var(--text-dim);
    font-size: 0.85rem;
    margin-bottom: 16px;
  }
  .cta {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    margin-top: auto;
    color: var(--orange);
    font-weight: 600;
    text-decoration: none;
  }
  .cta:hover { text-decoration: underline; }
  .outro {
    color: var(--text-dim);
    margin-top: 32px;
  }
  .outro a { color: var(--orange); }
  a:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: build succeeds.

Run:

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/services/index.html', 'utf8');
for (const id of ['setup','tech-call','hosted','web']) {
  if (!html.includes('id=\"' + id + '\"')) throw new Error('missing section ' + id);
}
for (const price of ['Scoped per job','30 min · \$20','Monthly']) {
  if (!html.includes(price)) throw new Error('missing price: ' + price);
}
if ((html.match(/<h1\b/g) || []).length !== 1) throw new Error('expected one h1');
console.log('services page checks passed');
"
```

Expected: `services page checks passed`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/services.astro
git commit -m "feat: add services page with pricing"
```

---

### Task 5: Hero `h1`, honest CTA, Elsewhere cleanup, footer link, homepage metadata

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/components/Elsewhere.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Wordmark as="h1"` from Task 2; `--border` from Task 1.
- Produces: exactly one homepage `h1`; primary CTA points to `#contact`; footer exposes `/services`; home title/description set.

- [ ] **Step 1: Update `src/components/Hero.astro`**

```astro
---
import { site } from '../data/site';
import Wordmark from './Wordmark.astro';
---
<section class="hero">
  <div class="container">
    <p class="mono eyebrow">self-hosted infra · tech support</p>
    <Wordmark as="h1" />
    <p class="tagline">{site.tagline}</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="#contact">Book a call</a>
      <a class="btn btn-secondary" href="#stack">What I run ↓</a>
    </div>
  </div>
</section>

<style>
  .hero { min-height: 76vh; display: flex; align-items: center; }
  .hero .container { width: 100%; }
  .eyebrow { color: var(--text-dim); margin-bottom: 16px; font-size: 0.85rem; }
  .tagline { font-size: clamp(1.1rem, 2.5vw, 1.4rem); color: var(--text-dim); max-width: 560px; margin: 20px 0 32px; }
  .cta-row { display: flex; gap: 14px; flex-wrap: wrap; }
  a:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
</style>
```

- [ ] **Step 2: Update `src/components/Elsewhere.astro`**

```astro
---
const items = [
  { name: 'AI agents', line: 'I run coding and admin agents against my own server daily. Ask whether that maps onto your workflow.' },
];
const links = [
  { label: 'GitHub', href: 'https://github.com/Z0uw0p', external: true },
  { label: 'Portfolio repo', href: 'https://github.com/Z0uw0p/zouwop-portfolio', external: true },
  { label: 'Links', href: '/links', external: false },
];
---
<section id="elsewhere">
  <div class="container">
    <h2>Also available</h2>
    <p class="section-sub">Not packaged yet — ask about it on a call.</p>
    <div class="items">
      {items.map((i) => (
        <div class="item">
          <h3>{i.name}</h3>
          <p>{i.line}</p>
        </div>
      ))}
    </div>
    <div class="links mono">
      {links.map((l) => (
        l.external
          ? <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
          : <a href={l.href}>{l.label}</a>
      ))}
    </div>
  </div>
</section>

<style>
  .items { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; }
  .item h3 { font-size: 1.25rem; margin-bottom: 8px; }
  .item p { color: var(--text-dim); font-size: 0.95rem; max-width: 60ch; }
  .links { display: flex; gap: 18px; flex-wrap: wrap; }
  .links a { color: var(--orange); text-decoration: none; font-size: 0.9rem; display: inline-flex; align-items: center; min-height: 44px; }
  .links a:hover { text-decoration: underline; }
  a:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
</style>
```

- [ ] **Step 3: Add the Services link to `src/components/Footer.astro`**

In the `.socials` div, before the Links anchor, add:

```astro
      <a href="/services">Services</a>
```

- [ ] **Step 4: Update `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
import Services from '../components/Services.astro';
import Stack from '../components/Stack.astro';
import Elsewhere from '../components/Elsewhere.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---
<Layout
  title="Zouwop — self-hosted infrastructure & tech support"
  description="Self-hosted infrastructure setup, tech support calls, web development, and managed hosting on a server you control."
>
  <main id="main" tabindex="-1">
    <Hero />
    <Services />
    <Stack />
    <Elsewhere />
    <Contact />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: build succeeds.

Run:

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
if ((html.match(/<h1\b/g) || []).length !== 1) throw new Error('expected exactly one h1');
if (!/<h1[^>]*class=\"[^\"]*wordmark/.test(html)) throw new Error('h1 is not the wordmark');
if (!html.includes('href=\"#contact\"')) throw new Error('hero CTA not pointing at #contact');
if (html.includes('\$20')) throw new Error('homepage still renders a price');
if (!html.includes('href=\"/services\"')) throw new Error('footer services link missing');
if (!html.includes('<title>Zouwop — self-hosted infrastructure &amp; tech support</title>')) throw new Error('homepage title not updated');
console.log('homepage checks passed');
"
```

Expected: `homepage checks passed`.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro src/components/Elsewhere.astro src/components/Footer.astro src/pages/index.astro
git commit -m "feat: homepage h1, contact CTA, and web-dev promotion cleanup"
```

---

### Task 6: Border-token sweep

**Files:**
- Modify: `src/components/Stack.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/Portfolio.astro`
- Modify: `src/pages/links.astro`

**Interfaces:**
- Consumes: `--border`, `--border-strong`, `--border-hover` from Task 1.
- Produces: no hardcoded `#23232e`, `#2a2a38`, or `#3a3a4a` left in `src/`.

- [ ] **Step 1: Replace literals**

Apply these replacements everywhere in the four files:

- `#23232e` → `var(--border)`
- `#2a2a38` → `var(--border-strong)`
- `#3a3a4a` → `var(--border-hover)`

Expected locations after the swap:

- `Stack.astro`: `.chip` border.
- `Footer.astro`: `footer` border-top.
- `Portfolio.astro`: entry hover border, embed, template divider, shot, price, lightbox, arrows, caption divider.
- `links.astro`: `.pill` and `.copy` borders.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: build succeeds.

Run: `grep -rn "#23232e\|#2a2a38\|#3a3a4a" src | grep -v "src/styles/global.css"`
Expected: no matches (the only remaining occurrences are the `--border*` token definitions in `global.css`).

- [ ] **Step 3: Commit**

```bash
git add src/components/Stack.astro src/components/Footer.astro src/components/Portfolio.astro src/pages/links.astro
git commit -m "style: use border tokens across components"
```

---

### Task 7: Full local verification

**Files:**
- No source changes expected. Screenshots go to `design-review/after-*.png`.

**Interfaces:**
- Consumes: everything above.
- Produces: evidence that the spec's acceptance criteria hold.

- [ ] **Step 1: Build and serve**

Run: `npm run build`
Expected: build succeeds.

Run: `npm run preview -- --port 4321` in the background, then confirm `http://localhost:4321/` returns 200.

- [ ] **Step 2: Automated HTML assertions**

Run:

```bash
node -e "
const fs = require('fs');
const home = fs.readFileSync('dist/index.html', 'utf8');
const services = fs.readFileSync('dist/services/index.html', 'utf8');
const checks = [
  ['one h1 on home', (home.match(/<h1\b/g) || []).length === 1],
  ['one main on home', (home.match(/<main\b/g) || []).length === 1],
  ['no price on home', !home.includes('\$20')],
  ['web link on home', home.includes('/services#web')],
  ['four prices on services', ['Scoped per job','30 min · \$20','Monthly'].every((p) => services.includes(p))],
  ['services has four anchors', ['setup','tech-call','hosted','web'].every((id) => services.includes('id=\"' + id + '\"'))],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error('FAIL: ' + name);
  console.log('ok:', name);
}
"
```

Expected: each line starts with `ok:`.

- [ ] **Step 3: Browser verification at 1440, 768, 375**

Using Playwright against `http://localhost:4321`:

1. Screenshot `/` at each viewport into `design-review/after-desktop.png`, `after-tablet.png`, `after-mobile.png`.
2. Check `document.documentElement.scrollWidth === clientWidth` at each viewport.
3. At 1440, scroll down 400px: header gains `header--hidden`; scroll up 100px: it is removed.
4. At 375, click the menu button: `aria-expanded="true"`; press Escape: `aria-expanded="false"` and focus returns to the button.
5. Tab once from the top: the skip link is visible; Enter moves focus to `#main`.
6. Visit `/services`, `/links`, `/portfolio`: no horizontal overflow, header present, one `main`, one `h1`.
7. Click a homepage card: lands on `/services#<id>` with the service heading visible below the sticky header.

- [ ] **Step 4: Accessibility and motion**

1. Run axe-core 4.10.2 (WCAG 2.1 A/AA) on `/`, `/services`, `/links`, `/portfolio`. Expected: 0 violations.
2. Emulate `prefers-reduced-motion: reduce` on `/`: `getComputedStyle(document.documentElement).scrollBehavior` is `auto`, and `.card` transition duration is `0.00001s` (0.01ms) or lower.
3. Confirm focus rings are visible on the header links, menu toggle, hero buttons, service cards, and footer links.

- [ ] **Step 5: Console**

Expected: `/`, `/services`, and `/links` have 0 errors and 0 warnings from first-party code. `/portfolio` may still show the 28 third-party embed warnings documented as out of scope.

- [ ] **Step 6: Commit (only if approved)**

```bash
git add -A
git commit -m "feat: landing page navigation, services page, and accessibility fixes"
```

---

## Self-Review

- **Spec coverage:** Navigation (Tasks 2), `h1`/`main` (Tasks 2 and 5), pricing moved to `/services` (Tasks 3 and 4), web development promoted (Task 3), tablet grid 2×2 (Task 3), hover affordance (Task 3), reduced motion (Task 1), CTA mismatch (Task 5), faint secondary button (Task 1), metadata (Task 2 and 5), border tokens (Tasks 1 and 6), `.excluded` contrast (Task 4), third-party warnings documented as out of scope (Task 7).
- **Placeholder scan:** no TBD/TODO; every code step contains the code.
- **Type consistency:** `Service.summary` is defined in Task 3 and consumed in the same task; `Wordmark`'s `as` prop is defined in Task 2 and used in Task 5; `Layout`'s `description`/`path` are defined in Task 2 and used in Tasks 2, 4, and 5.
