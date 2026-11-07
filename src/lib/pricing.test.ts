import { describe, expect, it } from "vitest";
import { billedYearly, savingPercent, tierPrices, yearlyPerMonth } from "./pricing";

describe("yearly pricing", () => {
  it("applies the 20 percent yearly discount to the COPY prices: 10/25/60 -> 8/20/48", () => {
    expect([10, 25, 60].map((monthly) => yearlyPerMonth(monthly, 20))).toEqual([8, 20, 48]);
  });

  it("bills a year at once: 96/240/576", () => {
    expect([8, 20, 48].map(billedYearly)).toEqual([96, 240, 576]);
  });

  it("states the saving as a whole percent", () => {
    expect(savingPercent(10, 8)).toBe(20);
    expect(savingPercent(25, 20)).toBe(20);
    expect(savingPercent(60, 48)).toBe(20);
    expect(savingPercent(30, 25)).toBe(17);
    expect(savingPercent(0, 0)).toBe(0);
  });

  it("refuses a discount that leaves cents", () => {
    expect(() => yearlyPerMonth(15, 20)).not.toThrow();
    expect(() => yearlyPerMonth(11, 20)).toThrow(RangeError);
    expect(() => yearlyPerMonth(10, 120)).toThrow(RangeError);
    expect(() => yearlyPerMonth(9.5, 20)).toThrow(RangeError);
  });

  it("puts a tier's three prices together", () => {
    expect(tierPrices(25, 20)).toEqual({ monthly: 25, yearlyPerMonth: 20, billedYearly: 240 });
  });
});
