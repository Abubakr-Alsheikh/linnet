/**
 * Invoice maths in integers only. Money is minor units (cents, pence),
 * quantities are hundredths (18.5 hours = 1850), tax rates are basis points
 * (20% = 2000). Every value here is non-negative, so rounding half away from
 * zero is rounding half up: floor((n + d / 2) / d).
 */

/** Largest values the demo accepts (parse.ts enforces them). */
export const LIMITS = {
  /** 999.75 hours or units. */
  quantity: 99_975,
  /** 100,000.00 in minor units. */
  rate: 10_000_000,
  /** 30%. */
  taxRate: 3_000,
  lines: 6,
} as const;

function divideRounded(numerator: number, denominator: number): number {
  return Math.floor((numerator + denominator / 2) / denominator);
}

function assertWhole(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative whole number, got ${value}`);
  }
}

/** quantity (hundredths) × rate (minor units), in minor units. */
export function lineAmount(quantity: number, rate: number): number {
  assertWhole("quantity", quantity);
  assertWhole("rate", rate);
  return divideRounded(quantity * rate, 100);
}

/** Tax on a subtotal at a rate in basis points, in minor units. */
export function taxAmount(subtotal: number, taxRate: number): number {
  assertWhole("subtotal", subtotal);
  assertWhole("taxRate", taxRate);
  return divideRounded(subtotal * taxRate, 10_000);
}

export interface Totals {
  lines: number[];
  subtotal: number;
  tax: number;
  total: number;
}

/** Amounts for each line, the subtotal, the tax and the total. */
export function invoiceTotals(lines: { quantity: number; rate: number }[], taxRate: number): Totals {
  const amounts = lines.map((line) => lineAmount(line.quantity, line.rate));
  const subtotal = amounts.reduce((sum, amount) => sum + amount, 0);
  const tax = taxAmount(subtotal, taxRate);
  return { lines: amounts, subtotal, tax, total: subtotal + tax };
}
