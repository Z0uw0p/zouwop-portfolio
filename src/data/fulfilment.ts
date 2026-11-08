import { site } from './site';

/** Matches the wording in /licence, the buy CTA, and docs/fulfilment.md. */
export { LICENCE_RULE } from './licence';

export const BILLING_EMAIL = site.contact.billing;

/** The promise the site makes to buyers, repeated verbatim in the runbook. */
export const DELIVERY_SLA = 'within one business day';

export const DELIVERY_INCLUDES = [
  'the template ZIP',
  'LICENSE.txt',
  'a README with run and customise steps',
];

export const UPDATES_MONTHS = 12;

export const SUPPORT_DAYS = 30;

export function purchaseMailto(name: string): string {
  return `mailto:${BILLING_EMAIL}?subject=${encodeURIComponent(`Template purchase — ${name}`)}`;
}

export function enquiryMailto(name: string): string {
  return `mailto:${BILLING_EMAIL}?subject=${encodeURIComponent(`Template availability — ${name}`)}`;
}
