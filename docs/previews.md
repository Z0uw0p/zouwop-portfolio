# Live template previews

A buyer can open any template as a real website before buying it. The demo is a
static copy of the template's build output, served from the same origin as the
store:

```
/templates/forge-trades/            product page
/templates/forge-trades/preview/    preview shell (device toggle, iframe)
/templates/forge-trades/demo/       the template itself, full screen
```

## How a demo gets here

The store does not build templates. The private
[`Z0uw0p/templates`](https://github.com/Z0uw0p/templates) repo builds the demos
with its `scripts/build-demos.mjs` and writes them to
`release/demos/<slug>/`. This repo copies that output:

```bash
# from this repo, with a local templates checkout
npm run sync:demos -- --from ../templates
```

`scripts/sync-demos.mjs` reads `src/data/demos.json` and copies one demo per
slug marked `available` into `public/templates/<slug>/demo/`. It refuses to
copy a demo for a slug the manifest does not mark available, and it refuses an
orphan demo that has no catalog template.

Because the templates repo is private, CI cannot reach it. The committed
fixture at `scripts/fixtures/demos/` is the reproducible input CI checks:

```bash
npm run sync:demos -- --check
```

`--check` rebuilds the expected output from the fixture and diffs it against
the working tree. It never writes. It fails when a demo was edited by hand, a
file went missing, or an unexpected file appeared.

`npm run build` runs the same check through the `prebuild` hook, and
`.github/workflows/ci.yml` runs it before the build.

## Base paths matter

A demo is served from `/templates/<slug>/demo/`, not from the site root. A
template built with root-absolute asset URLs (`/_astro/…`, `/css/style.css`,
`/images/…`) will therefore load **unstyled**: the browser asks for
`https://zouwop.com/_astro/…` and gets a 404.

`sync-demos.mjs` scans every copied HTML and CSS file for root-absolute asset
URLs and refuses any URL that does not carry that demo's own base path. A demo
must use relative URLs or exactly `/templates/<slug>/demo/…`:

```
forge-trades/index.html: root-absolute asset URL "/css/style.css" — build this
template with base /templates/forge-trades/demo/ (or relative paths)
```

The fix belongs upstream in the templates repo: build the demo with the base
path `/templates/<slug>/demo/`, or use relative URLs. Do not patch the copied
artifact here — the next sync would overwrite it, and the store would silently
ship a broken demo.

The templates repo's `scripts/build-demos.mjs` produces those demos for all
nine templates, and its `--verify` mode serves each one under the correct base
and requests every referenced page asset. All nine slugs in
`src/data/demos.json` are `available`; a missing demo still falls back to the
saved capture in the preview shell.

To prove a demo really works, run the site and request the CSS file it
references. A `200` for the stylesheet is the evidence; the HTML alone is not.

## Refreshing after a template changes

1. In the templates repo, build the demos and the release.
2. Here, run `npm run sync:demos -- --from ../templates`.
3. Review the diff under `public/templates/<slug>/demo/` and
   `scripts/fixtures/demos/`.
4. Commit both. CI's `--check` keeps the fixture and the served copy honest.

When a new template becomes previewable, set its slug to `"available"` in
`src/data/demos.json`. Until its demo lands, leave it `"coming-soon"`: the
preview page still builds, explains that the live demo is coming, and links
back to the product page. Every template in the current catalog is
`"available"`.

## What the preview shell guarantees, and what it does not

The shell gives a buyer a device toggle (desktop and a 390px phone frame), a
shareable `?device=phone` URL, a direct full-screen link, and a way back to the
product page and the buy CTA. It is a static copy of the template: nothing the
visitor types is saved, and it is not a hosted site for the buyer.

Demos are not content. The preview page has `noindex` and a canonical link to
its product page. Demo URLs are `noindex` via `public/_headers` and
`Disallow`ed in `public/robots.txt`. A sitemap, when one exists, must exclude
`/templates/*/preview/` and `/templates/*/demo/`.
