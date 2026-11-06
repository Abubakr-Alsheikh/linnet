import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a token font size next to a token colour", () => {
    expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
    expect(cn("text-h2 font-display", "text-brand-ink")).toBe("text-h2 font-display text-brand-ink");
  });

  it("still resolves real conflicts, last one wins", () => {
    expect(cn("text-h2", "text-h3")).toBe("text-h3");
    expect(cn("bg-surface", "bg-surface-2")).toBe("bg-surface-2");
    expect(cn("rounded-card", "rounded-lg")).toBe("rounded-lg");
    expect(cn("shadow-paper", "shadow-float")).toBe("shadow-float");
  });
});
