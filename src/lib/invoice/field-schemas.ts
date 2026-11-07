import * as z from "zod/mini";
import { checkDescription, parseQuantity, parseRate, parseTaxRate } from "./parse";

/**
 * The demo's field schemas with the COPY error strings, which the caller
 * passes in from demo.mdx (no copy lives here). Each parses a raw input
 * string to its integer. The demo imports this module on the first focus
 * inside the invoice, so Zod stays out of the first load.
 */

export interface FieldErrors {
  descriptionEmpty: string;
  descriptionLong: string;
  quantity: string;
  rate: string;
  taxRate: string;
}

function numberField(parse: (input: string) => number | null, message: string) {
  return z.pipe(
    z.string(),
    z.transform((input: string, ctx) => {
      const value = parse(input);
      if (value === null) {
        ctx.issues.push({ code: "custom", message, input });
        return 0;
      }
      return value;
    }),
  );
}

export function invoiceFieldSchemas(errors: FieldErrors) {
  return {
    description: z.string().check(
      z.refine((input: string) => checkDescription(input) !== "empty", errors.descriptionEmpty),
      z.refine((input: string) => checkDescription(input) !== "long", errors.descriptionLong),
    ),
    quantity: numberField(parseQuantity, errors.quantity),
    rate: numberField(parseRate, errors.rate),
    taxRate: numberField(parseTaxRate, errors.taxRate),
  };
}

export type InvoiceFieldSchemas = ReturnType<typeof invoiceFieldSchemas>;

/** The error message for a raw field value, or null when it parses. */
export function fieldError(schema: z.ZodMiniType, input: string): string | null {
  const result = schema.safeParse(input);
  return result.success ? null : (result.error.issues[0]?.message ?? null);
}
