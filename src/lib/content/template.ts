/**
 * Small helpers for copy that carries a value ("© {year} ...", "Remove line
 * {n}") or marks a part of itself (the accent phrase of a headline, the
 * linked name in the footer credit).
 */

const PLACEHOLDER = /\{(\w+)\}/g;

/** Names of the `{placeholders}` in a template, in order. */
export function placeholders(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map((match) => match[1]);
}

/** Replaces each `{name}` with its value. A missing value is a bug, so it throws. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(PLACEHOLDER, (_, name: string) => {
    if (!(name in values)) throw new Error(`No value for {${name}} in "${template}"`);
    return String(values[name]);
  });
}

/**
 * Splits `text` around the first occurrence of `part`, so a component can
 * style or link that part. Returns null when `part` is not in `text`.
 */
export function splitAround(text: string, part: string): [before: string, part: string, after: string] | null {
  const index = text.indexOf(part);
  if (index < 0 || part.length === 0) return null;
  return [text.slice(0, index), part, text.slice(index + part.length)];
}
