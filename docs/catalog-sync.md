# Catalog sync

The store's template data comes from the private [`Z0uw0p/templates`](https://github.com/Z0uw0p/templates)
repository. Cloudflare Pages cannot read a private repo at build time, so the sync
runs **locally or in CI** and the result is committed:

| Committed output | Source |
|---|---|
| `src/data/templates.generated.ts` | `release/catalog.json` |
| `public/templates/<slug>/desktop.webp` | `<slug>/preview/desktop-1440.webp` |
| `public/templates/<slug>/mobile.webp` | `<slug>/preview/mobile-390.webp` |
| `scripts/fixtures/catalog.sample.json` | snapshot of the catalog, used by CI |
| `scripts/fixtures/<slug>/preview/*.webp` | snapshot of the previews, used by CI |

Nothing here fetches over the network and the site build adds no dependencies.

## Who runs it, and when

The store owner runs it after a release in the templates repo — that is, after
`scripts/package.mjs` has written `release/catalog.json` with `zip`, `bytes`,
`sha256`, and `packagedAt` for each template.

```bash
# from this repo, with a local checkout of the private templates repo
npm run sync:templates -- --from ../templates
```

If you only have a catalog file, point at it instead:

```bash
npm run sync:templates -- --catalog path/to/catalog.json
```

By default `--catalog` resolves previews from the catalog file's directory
(`<dir>/<slug>/preview/...`). Use `--root <dir>` if the previews live elsewhere.

Review the diff, then commit `src/data/templates.generated.ts`,
`public/templates/**`, and the refreshed fixture files.

## Why the output is committed

- The templates repo is private. A Cloudflare Pages build cannot clone it, and
  we do not want to hand Pages a GitHub token.
- The build must be offline and reproducible: same commit in, same `dist/` out.
- The generated file is plain data, so a reviewer can see exactly what changed
  when the catalog changes.

## Store-owned overrides

`src/data/templates.overrides.ts` holds copy and commerce that the templates repo
has no business owning: `description`, `features`, `includes`,
`priceCents`, `hostedMonthlyCents`, `status`, and so on. Stripe Payment Links
live in `src/data/stripe-links.json` instead, because
`scripts/sync-redirects.mjs` reads that file to generate `public/_redirects`.
An override may still set `buyUrl`; it wins over the JSON map.

`src/data/templates.ts` merges generated data, then the Stripe link map, then
overrides, so an override always wins. Defaults are `currency: 'CAD'`,
`status: 'coming-soon'`, `description` = the generated blurb, and empty
`features`/`includes`.

An override for a slug that is no longer in the generated catalog is an error:
the import throws, and `npm run build` also fails because its `prebuild` step
runs `--check`, which reports the orphan. Remove the override, or restore the
template.

## Safety: an empty catalog cannot wipe the store

The script keeps any template that a human marked `status: 'available'` in
`templates.overrides.ts`, even when it disappears from the catalog, and prints a
warning naming it. Templates that were only `coming-soon` are removed with a
warning instead. A mistakenly empty or truncated catalog therefore cannot empty
the live shop.

## Validation and limits

Every entry is checked against the `template.json` contract from the templates
repo, plus the release fields from `release/catalog.json`:

- required fields and types, semver `version`, kebab-case `slug`, blurb ≤ 140
  characters, non-negative integer `priceCents`;
- unknown keys are an error (including inside `previews`);
- previews must exist, be readable WebP files, and be at least 5 KB;
- bad input prints one `template: reason` line per problem and exits non-zero
  without writing anything;
- duplicate slugs are an error.

## CI

`.github/workflows/ci.yml` runs, after `npm ci`:

```bash
npm run sync:templates -- --check
```

`--check` rebuilds the output in memory from the committed fixture
(`scripts/fixtures/catalog.sample.json`) and diffs it against the working tree.
It never writes. It fails the PR when:

- someone edits `src/data/templates.generated.ts` or a preview by hand;
- a catalog or preview changes upstream but the regenerated output was not
  committed;
- an override no longer matches a generated template.

`npm run build` runs the same check via the `prebuild` hook.

## Fixing a drift failure

1. Run `npm run sync:templates -- --from ../templates` (or `--catalog ...`).
2. Inspect the diff. If a template was removed by accident, restore it upstream
   and re-run. If the change is real, note it in the PR.
3. Commit the regenerated TS, previews, and fixture snapshot.
4. If you only want to reproduce what CI saw, run
   `npm run sync:templates -- --check` and read the file names it reports.
