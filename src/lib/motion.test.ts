import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DIAGRAM_LAST_STEP, durations, ease, sendTimeline, springs, stagger } from "./motion";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function cssMs(name: string): number {
  const match = css.match(new RegExp(`--${name}:\\s*(\\d+)ms;`));
  if (!match) throw new Error(`--${name} is missing from globals.css`);
  return Number(match[1]);
}

describe("motion presets", () => {
  it("matches the CSS durations used by transitions and overlays", () => {
    expect(cssMs("duration-press")).toBe(durations.press * 1000);
    expect(cssMs("duration-quick")).toBe(durations.quick * 1000);
    expect(cssMs("duration-base")).toBe(durations.base * 1000);
    expect(cssMs("duration-diagram-step")).toBe(durations.diagramStep * 1000);
    expect(cssMs("diagram-stagger")).toBe(stagger.diagram * 1000);
  });

  it("matches the CSS ease-out curve", () => {
    expect(css).toContain(`--ease-out-quint: cubic-bezier(${ease.out.join(", ")});`);
  });

  it("keeps the send sequence in order and under 3 s", () => {
    const steps = Object.values(sendTimeline);
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
    expect(sendTimeline.paid).toBeLessThan(3000);
  });

  it("keeps a diagram to 1.6 s at most", () => {
    expect(durations.diagram).toBeLessThanOrEqual(1.6);
    expect(DIAGRAM_LAST_STEP * stagger.diagram + durations.diagramStep).toBeLessThanOrEqual(durations.diagram);
  });

  it("uses springs only", () => {
    for (const spring of Object.values(springs)) expect(spring.type).toBe("spring");
  });
});
