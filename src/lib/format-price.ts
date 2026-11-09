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

/** `500.00` — the machine-readable decimal used by JSON-LD offers. */
export function formatCadAmount(cents: number): string {
  assertCents(cents);
  return (cents / 100).toFixed(2);
}
