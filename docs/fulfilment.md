# Fulfilment runbook

How a template sale is paid for and delivered. The site sells **Stripe Payment
Links** and delivers by **email, by hand**. There is no backend, no webhook, and
no card field anywhere on zouwop.com.

The promise the site makes: files are emailed **within one business day** from
`billing@zouwop.com`. If that promise changes, change it in
`src/data/fulfilment.ts` (`DELIVERY_SLA`), `/licence`, `/thank-you`, and this
file in the same commit.

## 1. Stripe setup per template

Do this once for each template after its release ZIP exists in the private
templates repo's `release/` directory.

1. **Product** — Stripe Dashboard → Products → New product.
   - Name: the template name from `release/catalog.json` (e.g. `Forge Trades`).
   - Price: **CAD**, one-time. Use the value in `templates.overrides.ts`
     (`priceCents`, e.g. `50000` = `$500 CAD`). Do not type a price into the site.
2. **Payment Link** — create a link for that product.
   - Collect customer email: **on**.
   - Allow promo codes: **on**.
   - Success URL: `https://zouwop.com/thank-you?template=<slug>` where `<slug>`
     is the catalog slug (e.g. `https://zouwop.com/thank-you?template=forge-trades`).
   - Do not enable automatic delivery, file uploads, or a Stripe-hosted
     download.
3. **Copy the link** into `src/data/stripe-links.json` for that slug:

   ```json
   {
     "forge-trades": "https://buy.stripe.com/..."
   }
   ```

   Then run `npm run sync:redirects` to regenerate `public/_redirects`; the
   product CTA points at `/go/<slug>` so the click is counted (see
   [`docs/analytics.md`](analytics.md)). A missing link, or a template still
   marked coming-soon, renders "Available soon — email me" and no anchor. Never
   commit a dead or placeholder URL; the build rejects both.
4. Test in Stripe test mode first: open the link, pay with test card
   `4242 4242 4242 4242`, confirm you land on `/thank-you?template=<slug>`, and
   confirm the template name appears. Then switch the JSON entry to the live
   link and run `npm run sync:redirects` again.

Test-mode purchases are still real records in test mode; do not email files for
them.

## 2. Per-sale checklist

1. **Confirm payment.** Stripe Dashboard → Payments. Check the amount, currency
   (CAD), product, and that the status is `Succeeded`.
2. **Copy the reference.** Note the payment intent / receipt number and the
   buyer's email from the Stripe checkout.
3. **Pull the artifact.** Take the ZIP named in
   `src/data/templates.generated.ts` → `release.zip` from the private templates
   repo's `release/` directory. Do not rebuild or re-zip it.
4. **Verify the artifact.** Compare the file's SHA-256 with `release.sha256` in
   the catalog:

   ```bash
   shasum -a 256 forge-trades-1.0.0.zip
   ```

   If it does not match, stop and fix the release before sending anything.
5. **Email the files** to the buyer's Stripe email address, from
   `billing@zouwop.com`:
   - the template ZIP;
   - `LICENSE.txt`;
   - the README with run and customise steps;
   - the Stripe receipt number, and a line saying which template and version
     this is.
6. **Log the sale.** In the private sales log, record: date, buyer email,
   template slug and version, amount, Stripe payment reference, licence number,
   and the date the files were emailed.
7. **Confirm delivery.** If the email bounces, retry once, then contact the buyer
   through the email on the Stripe payment. Mark the sale as delivered only when
   the email has not bounced.

Target: steps 1–7 complete **within one business day** of the payment.

## 3. Refunds and disputes

- **Refund before delivery** — refund in full from Stripe, do not send the ZIP,
  and record the refund in the sales log.
- **Refund after delivery** — sales are final once the ZIP is emailed. If the
  ZIP is broken or does not match the product page, offer a fix first; if that
  fails, refund in full.
- **Redistribution** — if the buyer shares the ZIP or resells the template, the
  licence ends. No refund.
- **Chargeback / dispute** — respond in Stripe with the payment reference, the
  delivery email, and the licence terms. The licence and update emails pause
  while a payment is disputed.
- After any refund or dispute, note the outcome and date in the sales log.

## 4. Zip password and checksums

- **No ZIP password.** The licence, not encryption, is the control. A password
  makes support and re-downloads worse and adds a secret to lose.
- **Publish checksums.** Every release already records `sha256` and `bytes` in
  `release/catalog.json`, copied into `src/data/templates.generated.ts`. The
  buyer can verify the ZIP they receive:

  ```bash
  shasum -a 256 forge-trades-1.0.0.zip
  ```

- If a ZIP is ever corrupted in transit, regenerate it from `release/`, verify
  the checksum against the catalog, and resend. If the catalog itself is wrong,
  fix the release upstream and re-run `npm run sync:templates`.

## 5. What the site promises

| Promise | Where it is stated |
|---|---|
| Manual email delivery **within one business day** | `/thank-you`, `/licence`, this file |
| From `billing@zouwop.com` | `/thank-you`, this file |
| ZIP + `LICENSE.txt` + README | `/thank-you`, this file |
| Licence: one purchase = one end product | `src/data/fulfilment.ts`, `/licence`, buy CTA |
| Free bug-fix/update emails for 12 months | `/thank-you`, `/licence` |
| 30 days of bug support | `/licence` |
| Sales final once emailed; broken/mismatched ZIP fixed or refunded | `/licence`, this file |
| `LICENSE.txt` matches `src/data/licence.json` (`npm run check:licence`) | `scripts/check-licence.mjs`, CI, this file |

If you change one of these, change every row in the same commit.

## 6. Licence rules on every sale

- **One purchase covers one end product.** Email this sentence unchanged if a buyer asks
  what they bought.
- Attach `licence/LICENSE.txt` from this repo to every delivery. It is generated from
  `src/data/licence.json`; do not hand-edit it. `npm run check:licence` fails the build if
  the file drifts from the data.
- Support is 30 days for bugs in the template as shipped, with a reply within one business
  day, Monday to Friday.
- Updates are free by email for 12 months from purchase. There is no lifetime-update
  promise.
- Sales are final once the ZIP is emailed. If the ZIP is broken or does not match the
  product page, fix it or refund it.

The full text is on https://zouwop.com/licence. Do not restate it here; link to it.
