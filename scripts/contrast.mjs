#!/usr/bin/env node
/**
 * Measures every text and shape pairing in src/app/globals.css, in both
 * themes, against WCAG 2.2 AA: 4.5:1 for text, 3:1 for UI shapes, focus
 * rings and large text. Exits 1 on a miss.
 * Usage: node scripts/contrast.mjs   (or npm run contrast)
 *
 * Tokens are read from the `:root {` block (light) and the
 * `:root[data-theme="dark"] {` block (dark). Only 6-digit hex values count.
 * Add a pair here whenever a component puts one token on another.
 */
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const block = (marker) => {
  const at = css.indexOf(marker);
  if (at === -1) throw new Error(`Missing block: ${marker}`);
  const start = css.indexOf("{", at);
  return Object.fromEntries(
    [...css.slice(start, css.indexOf("}", start)).matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]),
  );
};
const themes = { light: block(":root {"), dark: block(':root[data-theme="dark"] {') };

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const TEXT = 4.5;
const SHAPE = 3;
/** [foreground, background, minimum] */
const pairs = [
  ["ink", "canvas", TEXT], ["ink", "surface", TEXT], ["ink", "surface-2", TEXT],
  ["ink-muted", "canvas", TEXT], ["ink-muted", "surface", TEXT], ["ink-muted", "surface-2", TEXT],
  ["on-brand", "brand", TEXT],
  ["brand-ink", "canvas", TEXT], ["brand-ink", "surface", TEXT], ["brand-ink", "brand-tint", TEXT],
  ["ink", "brand-tint", TEXT],
  ["positive", "surface", TEXT], ["positive", "positive-tint", TEXT],
  ["warning", "surface", TEXT], ["warning", "warning-tint", TEXT],
  ["negative", "surface", TEXT], ["negative", "negative-tint", TEXT],
  ["brand", "canvas", SHAPE], ["brand", "surface", SHAPE],
  ["control", "surface", SHAPE], ["control", "canvas", SHAPE], ["control", "surface-2", SHAPE],
  ["focus", "canvas", SHAPE], ["focus", "surface", SHAPE], ["focus", "surface-2", SHAPE],
];

let failed = false;
for (const [name, tokens] of Object.entries(themes)) {
  console.log(name);
  for (const [fg, bg, min] of pairs) {
    if (!tokens[fg] || !tokens[bg]) {
      failed = true;
      console.log(`  MISSING ${fg} or ${bg}`);
      continue;
    }
    const value = ratio(tokens[fg], tokens[bg]);
    const ok = value >= min;
    failed ||= !ok;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${value.toFixed(2).padStart(6)}  ${fg} on ${bg} (min ${min})`);
  }
}
process.exit(failed ? 1 : 0);
