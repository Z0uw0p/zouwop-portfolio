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
