import { LIMITS } from "./calc";

/**
 * Typed input to integers. People type "18.5", "18,5", "1,572.50",
 * "1.572,50" or " 95 ", so the parsers accept a comma or a point as the
 * decimal mark and either as the thousands separator, and allow at most two
 * decimals. Each returns null when the text is not a number in range.
 *
 * field-schemas.ts wraps the same parsers in Zod schemas with the COPY
 * error strings. This module stays free of Zod: the reducer and the totals
 * use it on every keystroke, and it ships in the demo's first-load chunk.
 */

const SPACES = /[\s  ]/g;

/** A decimal string as hundredths (value × 100), or null. */
export function parseHundredths(input: string): number | null {
  let text = input.replace(SPACES, "");
  if (text === "") return null;

  const lastComma = text.lastIndexOf(",");
  const lastPoint = text.lastIndexOf(".");
  let decimalMark: "," | "." | null = null;
  if (lastComma >= 0 && lastPoint >= 0) decimalMark = lastComma > lastPoint ? "," : ".";
  else if (lastPoint >= 0) decimalMark = ".";
  else if (lastComma >= 0) decimalMark = /^\d{1,3}(,\d{3})+$/.test(text) ? null : ",";

  const thousands = decimalMark === "," ? "." : ",";
  const [whole, fraction, ...rest] = decimalMark ? text.split(decimalMark) : [text];
  if (rest.length > 0) return null;

  if (whole.includes(thousands)) {
    if (!new RegExp(`^\\d{1,3}(\\${thousands}\\d{3})+$`).test(whole)) return null;
  }
  text = whole.split(thousands).join("");

  if (!/^\d*$/.test(text) || (fraction !== undefined && !/^\d{0,2}$/.test(fraction))) return null;
  if (text === "" && !fraction) return null;
  if (text.length > 9) return null;

  return Number(text || "0") * 100 + Number((fraction ?? "").padEnd(2, "0"));
}

/** Hours or units, as hundredths, from 0 to 999.75. */
export function parseQuantity(input: string): number | null {
  const value = parseHundredths(input);
  return value !== null && value <= LIMITS.quantity ? value : null;
}

/** A rate, as minor units, from 0 to 100,000.00. */
export function parseRate(input: string): number | null {
  const value = parseHundredths(input);
  return value !== null && value <= LIMITS.rate ? value : null;
}

/** A tax rate in percent ("20", "17.5", "20%"), as basis points from 0 to 3000. */
export function parseTaxRate(input: string): number | null {
  const value = parseHundredths(input.trim().replace(/%$/, ""));
  return value !== null && value <= LIMITS.taxRate ? value : null;
}

export const DESCRIPTION_MAX = 80;

export type DescriptionProblem = "empty" | "long";

export function checkDescription(input: string): DescriptionProblem | null {
  const text = input.trim();
  if (text === "") return "empty";
  if (text.length > DESCRIPTION_MAX) return "long";
  return null;
}

const twoDecimals = new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const upToTwoDecimals = new Intl.NumberFormat("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** A rate for its input: 950000 -> "9,500.00", 1850 -> "18.50". */
export function formatHundredths(value: number): string {
  return twoDecimals.format(value / 100);
}

/** A quantity or tax rate for its input, shortest form: 1850 -> "18.5", 600 -> "6", 1750 -> "17.5". */
export function formatShort(value: number): string {
  return upToTwoDecimals.format(value / 100);
}
