import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats minor units in each supported currency", () => {
    expect(formatMoney(157250, "EUR")).toBe("€1,572.50");
    expect(formatMoney(157250, "USD")).toBe("$1,572.50");
    expect(formatMoney(157250, "GBP")).toBe("£1,572.50");
  });

  it("always shows two decimals", () => {
    expect(formatMoney(0, "EUR")).toBe("€0.00");
    expect(formatMoney(8500, "EUR")).toBe("€85.00");
  });

  it("rejects amounts that are not whole minor units", () => {
    expect(() => formatMoney(10.5, "EUR")).toThrow(RangeError);
    expect(() => formatMoney(Number.NaN, "EUR")).toThrow(RangeError);
  });
});
