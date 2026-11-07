import { describe, expect, it } from "vitest";
import {
  checkDescription,
  formatHundredths,
  formatShort,
  parseHundredths,
  parseQuantity,
  parseRate,
  parseTaxRate,
} from "./parse";

describe("parseHundredths", () => {
  it.each([
    ["18.5", 1850],
    ["18,5", 1850],
    ["1,572.50", 157250],
    ["1.572,50", 157250],
    ["1,572", 157200],
    [" 95 ", 9500],
    ["95.00", 9500],
    ["0", 0],
    [".5", 50],
    ["5.", 500],
    ["100,000", 10000000],
    ["1 572,50", 157250],
    ["0,75", 75],
    ["1,57", 157],
  ])("reads %j as %i", (input, expected) => {
    expect(parseHundredths(input)).toBe(expected);
  });

  it.each(["", " ", "abc", "1.2.3", "18.555", "12,34,567", "-5", "1e3", "1,572.50.1", ".", "1234567890"])(
    "rejects %j",
    (input) => {
      expect(parseHundredths(input)).toBeNull();
    },
  );
});

describe("field parsers", () => {
  it("bounds quantity at 999.75", () => {
    expect(parseQuantity("999.75")).toBe(99975);
    expect(parseQuantity("999.76")).toBeNull();
    expect(parseQuantity("0")).toBe(0);
  });

  it("bounds rate at 100,000", () => {
    expect(parseRate("100,000")).toBe(10000000);
    expect(parseRate("100000.01")).toBeNull();
  });

  it("reads tax in percent as basis points, 0 to 30", () => {
    expect(parseTaxRate("20")).toBe(2000);
    expect(parseTaxRate("17,5")).toBe(1750);
    expect(parseTaxRate("20%")).toBe(2000);
    expect(parseTaxRate("0")).toBe(0);
    expect(parseTaxRate("30")).toBe(3000);
    expect(parseTaxRate("30.5")).toBeNull();
  });

  it("checks descriptions", () => {
    expect(checkDescription("Discovery workshop")).toBeNull();
    expect(checkDescription("   ")).toBe("empty");
    expect(checkDescription("x".repeat(80))).toBeNull();
    expect(checkDescription("x".repeat(81))).toBe("long");
  });
});

describe("input formatting", () => {
  it("formats rates with two decimals and grouping", () => {
    expect(formatHundredths(9500)).toBe("95.00");
    expect(formatHundredths(157250)).toBe("1,572.50");
    expect(formatHundredths(1850)).toBe("18.50");
  });

  it("formats quantities and tax rates in their shortest form", () => {
    expect(formatShort(1850)).toBe("18.5");
    expect(formatShort(600)).toBe("6");
    expect(formatShort(99975)).toBe("999.75");
    expect(formatShort(2000)).toBe("20");
  });

  it("round-trips through the parsers", () => {
    for (const value of [0, 75, 1850, 99975]) expect(parseQuantity(formatShort(value))).toBe(value);
    for (const value of [0, 9500, 157250, 10000000]) expect(parseRate(formatHundredths(value))).toBe(value);
  });
});
