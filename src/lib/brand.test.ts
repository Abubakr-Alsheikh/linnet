import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brand } from "./brand";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const block = (selector: string) => css.slice(css.indexOf(selector), css.indexOf("}", css.indexOf(selector)));

describe("brand colours", () => {
  it("match the light tokens in globals.css", () => {
    const light = block(":root {");
    for (const [name, value] of Object.entries(brand.light)) {
      expect(light).toContain(`--${kebab(name)}: ${value};`);
    }
  });

  it("match the dark canvas token", () => {
    expect(block(':root[data-theme="dark"]')).toContain(`--canvas: ${brand.dark.canvas};`);
  });
});
