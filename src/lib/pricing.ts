/**
 * Plan prices in whole euros. Content gives each tier's monthly price and
 * one yearly discount; everything else derives from those two, so the cards,
 * the "Save" badge and the billed-yearly line can never disagree.
 */

function assertWhole(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${name} must be a whole, non-negative number, got ${value}`);
}

/** The monthly price on a yearly plan. Throws unless the discount leaves whole euros. */
export function yearlyPerMonth(monthly: number, discountPercent: number): number {
  assertWhole("monthly", monthly);
  assertWhole("discountPercent", discountPercent);
  if (discountPercent > 100) throw new RangeError(`discountPercent must be 100 or less, got ${discountPercent}`);
  const hundredths = monthly * (100 - discountPercent);
  if (hundredths % 100 !== 0) {
    throw new RangeError(`A ${discountPercent}% discount on €${monthly} is not a whole number of euros`);
  }
  return hundredths / 100;
}

/** What a yearly plan bills once a year. */
export function billedYearly(perMonth: number): number {
  assertWhole("perMonth", perMonth);
  return perMonth * 12;
}

/** The yearly saving against monthly billing, as a whole percent. */
export function savingPercent(monthly: number, perMonth: number): number {
  assertWhole("monthly", monthly);
  assertWhole("perMonth", perMonth);
  if (monthly === 0) return 0;
  return Math.round(((monthly - perMonth) / monthly) * 100);
}

export type BillingPeriod = "monthly" | "yearly";

export interface TierPrices {
  monthly: number;
  yearlyPerMonth: number;
  billedYearly: number;
}

export function tierPrices(monthly: number, discountPercent: number): TierPrices {
  const perMonth = yearlyPerMonth(monthly, discountPercent);
  return { monthly, yearlyPerMonth: perMonth, billedYearly: billedYearly(perMonth) };
}
