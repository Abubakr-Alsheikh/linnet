import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/money";
import { LIMITS, invoiceTotals, lineAmount, taxAmount } from "./calc";

describe("lineAmount", () => {
  it("multiplies hundredths by minor units", () => {
    expect(lineAmount(600, 9500)).toBe(57000); // 6 × 95.00
    expect(lineAmount(1850, 9500)).toBe(175750); // 18.5 × 95.00
  });

  it("rounds half away from zero", () => {
    expect(lineAmount(50, 1)).toBe(1); // 0.5 × 0.01 = 0.005 -> 0.01
    expect(lineAmount(49, 1)).toBe(0); // 0.0049 -> 0.00
    expect(lineAmount(150, 3)).toBe(5); // 1.5 × 0.03 = 0.045 -> 0.05
    expect(lineAmount(125, 1001)).toBe(1251); // 1.25 × 10.01 = 12.5125 -> 12.51
  });

  it("returns zero for an empty line", () => {
    expect(lineAmount(0, 9500)).toBe(0);
    expect(lineAmount(600, 0)).toBe(0);
  });

  it("rejects fractions and negatives", () => {
    expect(() => lineAmount(1.5, 100)).toThrow(RangeError);
    expect(() => lineAmount(-1, 100)).toThrow(RangeError);
  });
});

describe("taxAmount", () => {
  it("applies basis points", () => {
    expect(taxAmount(232750, 2000)).toBe(46550);
    expect(taxAmount(232750, 0)).toBe(0);
    expect(taxAmount(232750, 3000)).toBe(69825);
  });

  it("rounds half away from zero", () => {
    expect(taxAmount(1, 5000)).toBe(1); // 0.005 -> 0.01
    expect(taxAmount(25, 2000)).toBe(5); // 0.05
    expect(taxAmount(1, 4999)).toBe(0);
    expect(taxAmount(105, 750)).toBe(8); // 7.875 cents -> 8
  });
});

describe("invoiceTotals", () => {
  it("gives the COPY defaults: €2,327.50, €465.50, €2,793.00", () => {
    const totals = invoiceTotals(
      [
        { quantity: 600, rate: 9500 },
        { quantity: 1850, rate: 9500 },
      ],
      2000,
    );
    expect(totals.lines).toEqual([57000, 175750]);
    expect(formatMoney(totals.subtotal, "EUR")).toBe("€2,327.50");
    expect(formatMoney(totals.tax, "EUR")).toBe("€465.50");
    expect(formatMoney(totals.total, "EUR")).toBe("€2,793.00");
  });

  it("handles zero lines and zero tax", () => {
    expect(invoiceTotals([{ quantity: 0, rate: 0 }], 0)).toEqual({ lines: [0], subtotal: 0, tax: 0, total: 0 });
    expect(invoiceTotals([], 2000).total).toBe(0);
  });

  it("stays a safe integer at six lines of the maximum at 30%", () => {
    const max = Array.from({ length: LIMITS.lines }, () => ({ quantity: LIMITS.quantity, rate: LIMITS.rate }));
    const totals = invoiceTotals(max, LIMITS.taxRate);
    expect(totals.lines[0]).toBe(9_997_500_000);
    expect(totals.subtotal).toBe(59_985_000_000);
    expect(totals.tax).toBe(17_995_500_000);
    expect(totals.total).toBe(77_980_500_000);
    expect(Number.isSafeInteger(LIMITS.quantity * LIMITS.rate)).toBe(true);
    expect(Number.isSafeInteger(totals.subtotal * LIMITS.taxRate)).toBe(true);
    expect(formatMoney(totals.total, "GBP")).toBe("£779,805,000.00");
  });
});
