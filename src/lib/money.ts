/**
 * Money is integer minor units (cents, pence) everywhere. Format only at the
 * edge. The invoice maths in the hero demo builds on these helpers.
 */

export const CURRENCIES = ["EUR", "USD", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: Currency, locale: string): Intl.NumberFormat {
  const key = `${locale}:${currency}`;
  let format = formatters.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      // "$", not "US$", in an en-GB page.
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(key, format);
  }
  return format;
}

/** Formats an amount in minor units, e.g. 157250 EUR -> "€1,572.50". */
export function formatMoney(minor: number, currency: Currency, locale = "en-GB"): string {
  if (!Number.isSafeInteger(minor)) {
    throw new RangeError(`Money must be a whole number of minor units, got ${minor}`);
  }
  return formatter(currency, locale).format(minor / 100);
}
