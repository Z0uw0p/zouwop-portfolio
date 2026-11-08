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

/** Format whole cents as a CAD price. The only price formatter on the site. */
export function formatCad(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) {
    throw new RangeError(`formatCad: expected a non-negative number, got ${cents}`);
  }
  const formatter = cents % 100 === 0 ? wholeCad : fractionalCad;
  return `${formatter.format(cents / 100)} CAD`;
}
