# Zouwop Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static Astro portfolio for Zouwop at `zouwop.com`, built from a GitHub repo and served by Cloudflare Pages, with self-hosted Cal.com booking at `cal.zouwop.com`.

**Architecture:** Astro (SSG) source in `Z0uw0p/zouwop-portfolio` → Cloudflare Pages builds/hosts → DNS `zouwop.com` + `www` proxied to Pages. Cal.com runs self-hosted in Docker on the server and is embedded on the homepage.

**Tech Stack:** Astro (latest), plain CSS (no Tailwind — keep it lean), Cal.com (Docker + Postgres), Cloudflare Pages, nginx (host), Node 22 / npm 11.

## Global Constraints

- Site is a **single page** (all sections on `/`); no router, no nav links yet.
- **Dark theme only**: bg `#0d0d12`. Accents: **orange** (primary CTA) `#ff8c42`, **purple** (secondary) `#a78bfa`. Gradients run orange→purple.
- Wordmark is styled text `zouwop` (lowercase, orange→purple gradient). No image logo.
- All content lives in `src/data/offerings.ts` + `src/data/site.ts` (single sources of truth).
- Repo is **public**: `Z0uw0p/zouwop-portfolio`.
- No placeholders in shipped code — every field in the data files is filled with real (or clearly-draft) copy.
- Git identity: `Z0uw0p <zouwop@users.noreply.github.com>` (already configured globally).
- Contact handles: Discord, email, LinkedIn, GitHub. Exact values are user-supplied at launch (see Task 5); until provided, use the placeholder strings listed in that task so the build never breaks.

---

## File Structure

```
/home/zouwop/self-hosted/portfolio/
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── data/
    │   ├── site.ts          # name, tagline, contact handles, cal link
    │   └── offerings.ts     # showcase grid data
    ├── layouts/
    │   └── Layout.astro     # <html> shell, imports global.css, meta
    ├── components/
    │   ├── Wordmark.astro   # "zouwop" gradient text
    │   ├── Hero.astro
    │   ├── Services.astro
    │   ├── Showcase.astro
    │   ├── About.astro
    │   ├── Contact.astro
    │   └── Footer.astro
    ├── styles/
    │   └── global.css
    └── pages/
        └── index.astro      # assembles all sections
```

---

### Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/styles/global.css`, `public/favicon.svg`

**Interfaces:**
- Produces: a working `npm run build` that outputs `dist/`.

- [ ] **Step 1: Create the project directory and base files**

```bash
mkdir -p /home/zouwop/self-hosted/portfolio/src/{pages,layouts,components,data,styles} /home/zouwop/self-hosted/portfolio/public
```

Write `package.json`:
```json
{
  "name": "zouwop-portfolio",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

Write `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://zouwop.com',
  output: 'static',
});
```

Write `tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

Write `.gitignore`:
```
node_modules/
dist/
.astro/
```

- [ ] **Step 2: Install dependencies**

```bash
cd /home/zouwop/self-hosted/portfolio && npm install
```
Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Write a minimal index page and layout**

`src/layouts/Layout.astro`:
```astro
---
interface Props { title: string; }
const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/pages/index.astro`:
```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="zouwop">
  <main><h1>zouwop</h1></main>
</Layout>
```

`src/styles/global.css` (bootstrap only — expand in Task 2):
```css
:root { --bg: #0d0d12; --orange: #ff8c42; --purple: #a78bfa; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: var(--bg); color: #e6e6eb; font-family: system-ui, sans-serif; }
```

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d0d12"/>
  <text x="16" y="22" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle" fill="#ff8c42">z</text>
</svg>
```

- [ ] **Step 4: Verify the build works**

```bash
cd /home/zouwop/self-hosted/portfolio && npm run build
```
Expected: exit 0, `dist/index.html` exists.

- [ ] **Step 5: Initialize git**

```bash
cd /home/zouwop/self-hosted/portfolio && git init -b main && git add -A && git commit -m "chore: scaffold Astro portfolio"
```
Expected: commit created on `main`.

---

### Task 2: Global styles & theme

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Produces: CSS custom properties and utility classes used by every component in later tasks (`--bg`, `--orange`, `--purple`, `.container`, `.gradient-text`, `.btn`, `.card`, `.glow`).

- [ ] **Step 1: Replace global.css with the full theme**

`src/styles/global.css`:
```css
:root {
  --bg: #0d0d12;
  --bg-soft: #14141c;
  --orange: #ff8c42;
  --purple: #a78bfa;
  --text: #e6e6eb;
  --text-dim: #9a9aa8;
  --mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;
  --sans: 'Inter', system-ui, -apple-system, sans-serif;
  --radius: 14px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  background-image:
    radial-gradient(circle at 15% 0%, rgba(167,139,250,0.08), transparent 40%),
    radial-gradient(circle at 85% 100%, rgba(255,140,66,0.06), transparent 40%);
  color: var(--text);
  font-family: var(--sans);
  line-height: 1.6;
}

.container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

section { padding: 96px 0; }

h2 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.section-sub {
  color: var(--text-dim);
  margin-bottom: 48px;
  font-size: 1.05rem;
}

.gradient-text {
  background: linear-gradient(90deg, var(--orange), var(--purple));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: none;
  cursor: pointer;
}

.btn:hover { transform: translateY(-2px); }

.btn-primary {
  background: linear-gradient(90deg, var(--orange), var(--purple));
  color: #0d0d12;
}

.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid #2a2a38;
}

.btn-secondary:hover { border-color: var(--purple); }

.card {
  background: var(--bg-soft);
  border: 1px solid #23232e;
  border-radius: var(--radius);
  padding: 28px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card:hover {
  border-color: #3a3a4a;
  transform: translateY(-4px);
}

.mono { font-family: var(--mono); font-size: 0.85em; }
```

- [ ] **Step 2: Load Inter + JetBrains Mono fonts in Layout**

Add to `<head>` of `src/layouts/Layout.astro`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Rebuild to verify**

```bash
cd /home/zouwop/self-hosted/portfolio && npm run build
```
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: dark theme with orange/purple accents and fonts"
```

---

### Task 3: Site data + Wordmark

**Files:**
- Create: `src/data/site.ts`
- Create: `src/data/offerings.ts`
- Create: `src/components/Wordmark.astro`

**Interfaces:**
- Produces:
  - `site` (from `src/data/site.ts`): `{ name, tagline, calUrl, contact: { discord, email, linkedin, github } }`
  - `offerings` (from `src/data/offerings.ts`): `Offering[]` where `Offering = { name, type: 'service'|'product', icon, blurb, status: 'live'|'beta'|'planned', href? }`
  - `<Wordmark />` renders the gradient "zouwop" text.

- [ ] **Step 1: Write site data**

`src/data/site.ts`:
```ts
export const site = {
  name: 'zouwop',
  tagline: 'I build websites, run self-hosted infrastructure, and set up AI agents for businesses.',
  calUrl: 'https://cal.zouwop.com/zouwop/intro', // exact path set during Cal.com setup
  contact: {
    discord: 'zouwop',       // TODO at launch: real handle
    email: 'hello@zouwop.com', // TODO at launch: real address
    linkedin: 'https://www.linkedin.com/in/zouwop', // TODO at launch: real URL
    github: 'https://github.com/Z0uw0p',
  },
};
```

- [ ] **Step 2: Write offerings data**

`src/data/offerings.ts`:
```ts
export type Offering = {
  name: string;
  type: 'service' | 'product';
  icon: string;
  blurb: string;
  status: 'live' | 'beta' | 'planned';
  href?: string;
};

export const offerings: Offering[] = [
  { name: 'Web Development', type: 'service', icon: '🖥️', blurb: 'Custom sites and web apps, built fast and shipped clean.', status: 'live', href: '#contact' },
  { name: 'Self-Hosting Consulting', type: 'service', icon: '🖧', blurb: 'Take back control of your data. I plan, deploy, and maintain your own stack.', status: 'live', href: '#contact' },
  { name: 'AI Agent Setup', type: 'service', icon: '🤖', blurb: 'Automate your business with AI agents that actually work.', status: 'live', href: '#contact' },
];
```

- [ ] **Step 3: Write the Wordmark**

`src/components/Wordmark.astro`:
```astro
---
interface Props { size?: 'sm' | 'lg'; }
const { size = 'lg' } = Astro.props;
---
<span class="wordmark {size === 'lg' ? 'wordmark-lg' : 'wordmark-sm'}">zouwop</span>

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

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: site data, offerings model, and wordmark component"
```

---

### Task 4: Hero section

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site` from `src/data/site.ts`; `<Wordmark />`.
- Produces: `<Hero />` — full-height intro with wordmark, tagline, and two CTAs.

- [ ] **Step 1: Write Hero**

`src/components/Hero.astro`:
```astro
---
import { site } from '../data/site';
import Wordmark from './Wordmark.astro';
---
<section class="hero">
  <div class="container">
    <p class="mono eyebrow">$ whoami</p>
    <Wordmark />
    <p class="tagline">{site.tagline}</p>
    <div class="cta-row">
      <a class="btn btn-primary" href={site.calUrl} target="_blank">Book a call</a>
      <a class="btn btn-secondary" href="#services">See what I offer</a>
    </div>
  </div>
</section>

<style>
  .hero { min-height: 88vh; display: flex; align-items: center; }
  .eyebrow { color: var(--orange); margin-bottom: 16px; }
  .tagline { font-size: clamp(1.1rem, 2.5vw, 1.4rem); color: var(--text-dim); max-width: 560px; margin: 20px 0 32px; }
  .cta-row { display: flex; gap: 14px; flex-wrap: wrap; }
</style>
```

- [ ] **Step 2: Wire Hero into index**

`src/pages/index.astro`:
```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
---
<Layout title="zouwop">
  <Hero />
</Layout>
```

- [ ] **Step 3: Build + visual check**

```bash
cd /home/zouwop/self-hosted/portfolio && npm run build && npm run preview
```
Open `http://localhost:4321` and confirm hero renders with gradient wordmark + tagline + CTAs.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: hero section"
```

---

### Task 5: Services section

**Files:**
- Create: `src/components/Services.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `offerings` filtered to `type: 'service'`; `site.calUrl`.
- Produces: `<Services />` — three service cards with bullets and a "Book" link.

- [ ] **Step 1: Write Services**

`src/components/Services.astro`:
```astro
---
import { offerings } from '../data/offerings';
import { site } from '../data/site';
const services = offerings.filter((o) => o.type === 'service');
---
<section id="services">
  <div class="container">
    <h2>Services</h2>
    <p class="section-sub">How I can help you.</p>
    <div class="grid">
      {services.map((s) => (
        <div class="card">
          <div class="icon">{s.icon}</div>
          <h3>{s.name}</h3>
          <p>{s.blurb}</p>
          <a class="book-link" href={site.calUrl} target="_blank">Book →</a>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
  .icon { font-size: 2rem; margin-bottom: 12px; }
  h3 { font-size: 1.25rem; margin-bottom: 8px; }
  .card p { color: var(--text-dim); font-size: 0.95rem; }
  .book-link { display: inline-block; margin-top: 16px; color: var(--orange); font-weight: 600; text-decoration: none; }
  .book-link:hover { text-decoration: underline; }
</style>
```

- [ ] **Step 2: Wire into index**

Add after `<Hero />` in `src/pages/index.astro`:
```astro
import Services from '../components/Services.astro';
...
  <Hero />
  <Services />
```

- [ ] **Step 3: Build + visual check**, then **Step 4: Commit**

```bash
cd /home/zouwop/self-hosted/portfolio && npm run build
git add -A && git commit -m "feat: services section"
```

---

### Task 6: Showcase ("What's available") section

**Files:**
- Create: `src/components/Showcase.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `offerings` (all); renders status badge from `status`.
- Produces: `<Showcase />` — grid with status badges (🟢 live / 🟡 beta / ⚪ planned).

- [ ] **Step 1: Write Showcase**

`src/components/Showcase.astro`:
```astro
---
import { offerings } from '../data/offerings';
const badge: Record<string, string> = { live: '🟢 live', beta: '🟡 beta', planned: '⚪ planned' };
---
<section id="showcase">
  <div class="container">
    <h2>What's available</h2>
    <p class="section-sub">Services and products you can use or hire me for.</p>
    <div class="grid">
      {offerings.map((o) => (
        <div class="card">
          <div class="row">
            <div class="icon">{o.icon}</div>
            <span class="badge">{badge[o.status]}</span>
          </div>
          <h3>{o.name}</h3>
          <p>{o.blurb}</p>
          {o.href && <a class="link" href={o.href}>Learn more →</a>}
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
  .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .icon { font-size: 2rem; }
  .badge { font-size: 0.75rem; color: var(--text-dim); }
  h3 { margin-bottom: 8px; }
  .card p { color: var(--text-dim); font-size: 0.95rem; }
  .link { display: inline-block; margin-top: 14px; color: var(--purple); font-weight: 600; text-decoration: none; }
  .link:hover { text-decoration: underline; }
</style>
```

- [ ] **Step 2: Wire into index**, **Step 3: build + check**, **Step 4: commit**

```bash
git add -A && git commit -m "feat: showcase section with status badges"
```

---

### Task 7: About + Footer

**Files:**
- Create: `src/components/About.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `<About />` (short personable blurb), `<Footer />` (minimal, socials).

- [ ] **Step 1: Write About**

`src/components/About.astro`:
```astro
---
---
<section id="about">
  <div class="container">
    <h2>About</h2>
    <p class="section-sub">Who's behind zouwop.</p>
    <p class="blurb">
      I'm a developer and self-hosting enthusiast. I help people own their stack —
      from clean websites to full self-hosted infrastructure — and I build AI agents
      that take the busywork off your plate. No black boxes: you keep your data, your
      code, and your keys.
    </p>
  </div>
</section>

<style>
  .blurb { max-width: 640px; font-size: 1.15rem; color: var(--text); }
</style>
```

- [ ] **Step 2: Write Footer**

`src/components/Footer.astro`:
```astro
---
import { site } from '../data/site';
import Wordmark from './Wordmark.astro';
const year = new Date().getFullYear();
---
<footer>
  <div class="container foot">
    <Wordmark size="sm" />
    <p class="mono">self-hosted with ♥ · {year}</p>
    <div class="socials">
      <a href={site.contact.discord} target="_blank">Discord</a>
      <a href={`mailto:${site.contact.email}`}>Email</a>
      <a href={site.contact.linkedin} target="_blank">LinkedIn</a>
      <a href={site.contact.github} target="_blank">GitHub</a>
    </div>
  </div>
</footer>

<style>
  footer { border-top: 1px solid #23232e; padding: 32px 0; }
  .foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .foot p { color: var(--text-dim); font-size: 0.85rem; }
  .socials { display: flex; gap: 18px; }
  .socials a { color: var(--text-dim); text-decoration: none; font-size: 0.9rem; }
  .socials a:hover { color: var(--orange); }
</style>
```

- [ ] **Step 3: Wire into index**, **Step 4: build + check**, **Step 5: commit**

```bash
git add -A && git commit -m "feat: about and footer sections"
```

---

### Task 8: Contact + Cal.com embed

**Files:**
- Create: `src/components/Contact.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site.calUrl`, `site.contact`.
- Produces: `<Contact />` — booking CTA linking to Cal.com (embed added post-Cal-deploy in Task 13; the CTA link works from day one).

- [ ] **Step 1: Write Contact (CTA + link; embed is a later task)**

`src/components/Contact.astro`:
```astro
---
import { site } from '../data/site';
---
<section id="contact">
  <div class="container center">
    <h2>Let's talk</h2>
    <p class="section-sub">Pick a time and we'll figure out the rest.</p>
    <a class="btn btn-primary" href={site.calUrl} target="_blank">Book a call</a>
    <p class="mono direct">
      or reach me — <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
    </p>
  </div>
</section>

<style>
  .center { text-align: center; }
  .direct { margin-top: 20px; color: var(--text-dim); font-size: 0.9rem; }
  .direct a { color: var(--orange); text-decoration: none; }
</style>
```

- [ ] **Step 2: Wire into index** (final full index):

`src/pages/index.astro`:
```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
import Services from '../components/Services.astro';
import Showcase from '../components/Showcase.astro';
import About from '../components/About.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---
<Layout title="zouwop">
  <Hero />
  <Services />
  <Showcase />
  <About />
  <Contact />
  <Footer />
</Layout>
```

- [ ] **Step 3: Build + full visual pass** (dev server, scroll all sections)

```bash
cd /home/zouwop/self-hosted/portfolio && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: contact section and full page assembly"
```

---

### Task 9: Create GitHub repo + push

**Files:**
- Create (remote): `Z0uw0p/zouwop-portfolio`

- [ ] **Step 1: Create the public repo**

```bash
cd /home/zouwop/self-hosted/portfolio && gh repo create zouwop-portfolio --public --source=. --push
```
Expected: repo `github.com/Z0uw0p/zouwop-portfolio` created and `main` pushed.

- [ ] **Step 2: Verify remote**

```bash
git remote -v && gh repo view Z0uw0p/zouwop-portfolio --web
```
Expected: `origin` points at the new repo; repo is public.

---

### Task 10: Create Cloudflare Pages project + build config

**Files:**
- Create (Cloudflare): Pages project `zouwop-portfolio` connected to the GitHub repo.

**Interfaces:**
- Consumes: repo `Z0uw0p/zouwop-portfolio`, build `npm run build`, output `dist`.

- [ ] **Step 1: Create the Pages project (API)**

Use the Cloudflare API:
```
POST /accounts/{account_id}/pages/projects
{
  "name": "zouwop-portfolio",
  "production_branch": "main",
  "build_config": {
    "build_command": "npm run build",
    "destination_dir": "dist"
  },
  "source": {
    "type": "github",
    "config": {
      "owner": "Z0uw0p",
      "repo_name": "zouwop-portfolio",
      "production_branch": "main"
    }
  }
}
```
Note: GitHub connection may require OAuth if not already wired (the `beatricedaudelin` project implies it is). If the API returns a connection error, fall back to creating the project in the Cloudflare dashboard and connecting the repo there.

- [ ] **Step 2: Confirm the first deployment succeeds**

Check the Pages project's latest deployment reaches `success`. Verify the deployed URL (e.g. `zouwop-portfolio.pages.dev`) renders the hero.

---

### Task 11: Point DNS at Pages

**Files:**
- Modify: Cloudflare DNS zone `zouwop.com` (`17a868ef2c3f990fd856875f1b9f63f0`).

- [ ] **Step 1: Add custom domain to the Pages project**

Use the API:
```
POST /accounts/{account_id}/pages/projects/zouwop-portfolio/domains
{ "name": "zouwop.com" }
POST /accounts/{account_id}/pages/projects/zouwop-portfolio/domains
{ "name": "www.zouwop.com" }
```
This creates proxied CNAME records automatically.

- [ ] **Step 2: Verify resolution**

```bash
dig +short zouwop.com && dig +short www.zouwop.com
```
Expected: returns Cloudflare edge IPs (proxied), and `https://zouwop.com` serves the portfolio.

---

### Task 12: Deploy self-hosted Cal.com on the server

**Files:**
- Create: `/home/zouwop/docker/cal/docker-compose.yml`
- Create: `/home/zouwop/docker/cal/.env`

**Interfaces:**
- Produces: running Cal.com stack (web + Postgres) on the internal Docker network, reachable at `http://localhost:3000` inside the compose.

- [ ] **Step 1: Write the compose file**

`/home/zouwop/docker/cal/docker-compose.yml`:
```yaml
services:
  cal-db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: cal
      POSTGRES_PASSWORD: ${CAL_POSTGRES_PASSWORD}
      POSTGRES_DB: cal
    volumes:
      - cal-db-data:/var/lib/postgresql/data
    networks: [cal]

  cal-web:
    image: calcom/cal.com:latest
    restart: unless-stopped
    depends_on:
      - cal-db
    environment:
      DATABASE_URL: postgresql://cal:${CAL_POSTGRES_PASSWORD}@cal-db:5432/cal
      NEXTAUTH_SECRET: ${CAL_NEXTAUTH_SECRET}
      CALENDSO_ENCRYPTION_KEY: ${CAL_ENCRYPTION_KEY}
      NEXTAUTH_URL: https://cal.zouwop.com
      NEXT_PUBLIC_WEBAPP_URL: https://cal.zouwop.com
      EMAIL_FROM: ${CAL_EMAIL_FROM}
      EMAIL_SERVER_HOST: ${CAL_EMAIL_HOST}
      EMAIL_SERVER_PORT: ${CAL_EMAIL_PORT}
      EMAIL_SERVER_USER: ${CAL_EMAIL_USER}
      EMAIL_SERVER_PASSWORD: ${CAL_EMAIL_PASSWORD}
      LICENSE: ""
    ports:
      - "127.0.0.1:3000:3000"
    networks: [cal]

volumes:
  cal-db-data:

networks:
  cal:
```

- [ ] **Step 2: Write .env with generated secrets**

Generate secrets and write `/home/zouwop/docker/cal/.env`:
```bash
CAL_POSTGRES_PASSWORD=$(openssl rand -hex 24)
CAL_NEXTAUTH_SECRET=$(openssl rand -hex 32)
CAL_ENCRYPTION_KEY=$(openssl rand -hex 16)
```
(Store these; also capture SMTP values from user at launch. Cal.com needs a working SMTP for invites/notifications — without it, email features degrade but the booking calendar still functions.)

- [ ] **Step 3: Start the stack**

```bash
cd /home/zouwop/docker/cal && docker compose up -d
```
Expected: `cal-web` and `cal-db` running; `docker logs cal-web --tail 50` shows DB migration then server start.

- [ ] **Step 4: Verify locally**

```bash
curl -I http://localhost:3000
```
Expected: HTTP 200/302.

---

### Task 13: nginx block for cal.zouwop.com + Cal embed

**Files:**
- Modify: `/etc/nginx/sites-available/zouwop-proxy` (add `cal.zouwop.com` server block)

**Interfaces:**
- Consumes: Cal.com on `127.0.0.1:3000`.

- [ ] **Step 1: Add the server block**

Append to `/etc/nginx/sites-available/zouwop-proxy`:
```nginx
# Cal.com
server {
    listen 10.0.0.216:443 ssl;
    listen [2607:fa49:6940:f100:2d8:61ff:febb:f35]:443 ssl;
    listen 100.89.124.118:443 ssl;
    server_name cal.zouwop.com;
    ssl_certificate /etc/letsencrypt/live/zouwop.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zouwop.com/privkey.pem;
    client_max_body_size 10M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

- [ ] **Step 2: Reload nginx**

```bash
sudo nginx -t && sudo systemctl reload nginx
```
Expected: config valid, reload succeeds.

- [ ] **Step 3: Verify**

```bash
curl -I https://cal.zouwop.com
```
Expected: HTTP 200/302 (Cal.com loads behind the proxy).

- [ ] **Step 4: Add Cal embed to Contact section**

Replace the CTA-only `Contact.astro` content with an inline embed script (Cal.com's `cal-inline` embed), dark theme:
```astro
---
import { site } from '../data/site';
---
<section id="contact">
  <div class="container center">
    <h2>Let's talk</h2>
    <p class="section-sub">Pick a time and we'll figure out the rest.</p>
    <div data-cal-link={site.calUrl} data-cal-config='{"theme":"dark"}' data-cal-namespace="intro" />
  </div>
</section>
```
Plus the embed loader script in `Layout.astro` `<head>`:
```html
<script src="https://cal.zouwop.com/embed/embed.js" type="text/javascript"></script>
```
Rebuild and redeploy (push to `main`; Pages rebuilds automatically).

- [ ] **Step 5: Commit + push**

```bash
cd /home/zouwop/self-hosted/portfolio && npm run build && git add -A && git commit -m "feat: Cal.com inline embed" && git push
```

---

### Task 14: Final verification & launch checklist

- [ ] **Step 1:** `https://zouwop.com` and `https://www.zouwop.com` serve the portfolio (hero, services, showcase, about, contact, footer).
- [ ] **Step 2:** Booking embed loads and shows the Cal.com event type; dark theme matches.
- [ ] **Step 3:** `https://cal.zouwop.com` loads; can create a test booking.
- [ ] **Step 4:** Favicon, fonts, and responsive layout (mobile + desktop) render correctly.
- [ ] **Step 5:** Replace launch TODOs in `src/data/site.ts` (real Discord handle, email, LinkedIn URL) and push.
- [ ] **Step 6:** Note in admin memory + daily log (per agent protocol).

---

## Execution notes

- All local work happens in `/home/zouwop/self-hosted/portfolio/`.
- Server-side ops (Tasks 12–13) touch `/home/zouwop/docker/cal/` and `/etc/nginx/sites-available/zouwop-proxy` — allowed paths. nginx edit is reversible; note prior state before editing.
- Cal.com `latest` image is heavy (~1GB+); first pull may take a few minutes.
- If Cal.com self-host proves flaky during setup, the fallback (documented in spec) is a hosted free-tier Cal.com embed — only the embed URL changes in `site.ts`; the site itself is unaffected.
