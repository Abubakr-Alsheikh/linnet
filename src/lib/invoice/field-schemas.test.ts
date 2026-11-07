import { describe, expect, it } from "vitest";
import { fieldError, invoiceFieldSchemas } from "./field-schemas";

describe("invoiceFieldSchemas", () => {
  const errors = {
    descriptionEmpty: "Describe the work.",
    descriptionLong: "Keep it under 80 characters.",
    quantity: "Use a number from 0 to 999.75.",
    rate: "Use an amount from 0 to 100,000.",
    taxRate: "Use a rate from 0 to 30%.",
  };
  const schemas = invoiceFieldSchemas(errors);

  it("parses valid input to integers", () => {
    expect(schemas.quantity.parse("18,5")).toBe(1850);
    expect(schemas.rate.parse("1,572.50")).toBe(157250);
    expect(schemas.taxRate.parse("20")).toBe(2000);
    expect(schemas.description.parse("Discovery workshop")).toBe("Discovery workshop");
  });

  it("reports the COPY error for each field", () => {
    expect(fieldError(schemas.description, "")).toBe(errors.descriptionEmpty);
    expect(fieldError(schemas.description, "x".repeat(81))).toBe(errors.descriptionLong);
    expect(fieldError(schemas.quantity, "1000")).toBe(errors.quantity);
    expect(fieldError(schemas.rate, "lots")).toBe(errors.rate);
    expect(fieldError(schemas.taxRate, "31")).toBe(errors.taxRate);
    expect(fieldError(schemas.quantity, "6")).toBeNull();
  });
});
