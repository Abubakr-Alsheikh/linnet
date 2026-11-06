import { describe, expect, it } from "vitest";
import { placeholder } from "./placeholder";

describe("MDX content pipeline", () => {
  it("imports an .mdx file and validates its meta with Zod", () => {
    expect(placeholder.meta.headline).toBe("Send the invoice.");
    expect(typeof placeholder.Body).toBe("function");
  });
});
