import { describe, expect, it } from "vitest";
import { fill, placeholders, splitAround } from "./template";

describe("placeholders", () => {
  it("lists the names in order", () => {
    expect(placeholders("Remove line {n}")).toEqual(["n"]);
    expect(placeholders("Sent to {email} at {time}")).toEqual(["email", "time"]);
    expect(placeholders("Total due")).toEqual([]);
  });
});

describe("fill", () => {
  it("replaces every placeholder", () => {
    expect(fill("© {year} Linnet is a fictional product.", { year: 2026 })).toBe("© 2026 Linnet is a fictional product.");
    expect(fill("{n}/500", { n: "12" })).toBe("12/500");
  });

  it("throws on a missing value", () => {
    expect(() => fill("Line {n} added.", {})).toThrow("{n}");
  });
});

describe("splitAround", () => {
  it("splits around the first match", () => {
    expect(splitAround("Send the invoice. Get paid.", "Get paid.")).toEqual(["Send the invoice. ", "Get paid.", ""]);
    expect(splitAround("Designed and built by Abubakr Alsheikh", "Abubakr Alsheikh")).toEqual([
      "Designed and built by ",
      "Abubakr Alsheikh",
      "",
    ]);
  });

  it("returns null when the part is missing or empty", () => {
    expect(splitAround("Fits the tools you already use.", "done.")).toBeNull();
    expect(splitAround("Anything", "")).toBeNull();
  });
});
