import { z } from "zod";
import { THEME_CHOICES } from "@/lib/theme";
import { placeholders, splitAround } from "./template";

/**
 * One Zod schema per file in src/content. Every MDX file exports `meta`
 * (typed `unknown`); src/lib/content/index.ts parses it with the schema
 * below, so a missing field, a typo in a key or a broken copy rule fails the
 * build. Objects are strict: an unknown key is an error, not a silent extra.
 */

/**
 * Code points covered by the `latin` subset that next/font loads for both
 * faces. Anything outside it falls back to another font.
 */
const LATIN_SUBSET: [number, number][] = [
  [0x0000, 0x00ff],
  [0x0131, 0x0131],
  [0x0152, 0x0153],
  [0x02bb, 0x02bc],
  [0x02c6, 0x02c6],
  [0x02da, 0x02da],
  [0x02dc, 0x02dc],
  [0x2000, 0x206f],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2212, 0x2212],
];

function inLatinSubset(text: string): boolean {
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (!LATIN_SUBSET.some(([from, to]) => code >= from && code <= to)) return false;
  }
  return true;
}

/** A visible string, held to the copy rules in COPY.md. */
export const copy = z
  .string()
  .min(1)
  .refine((text) => text === text.trim(), "Remove the spaces at the start or end.")
  .refine((text) => !text.includes("—"), "No em dashes in copy.")
  .refine((text) => !text.includes("!"), "No exclamation marks in copy.")
  .refine(inLatinSubset, "Keep copy inside the font's latin subset (see COPY.md).");

/** A string that must carry exactly these `{placeholders}`. */
export function template(...names: string[]) {
  return copy.refine(
    (text) => placeholders(text).sort().join() === [...names].sort().join(),
    `Use exactly these placeholders: ${names.map((name) => `{${name}}`).join(", ")}.`,
  );
}

/** A section's `id`, which is also its anchor (`#features`). */
export const sectionId = z.string().regex(/^[a-z][a-z-]*$/, "Use lowercase letters and hyphens.");

/** A link to a section on the page. */
export const sectionLink = z.strictObject({ label: copy, target: sectionId });

/** A heading with an optional accent phrase, which must appear in the title. */
export const headline = z
  .strictObject({ title: copy, accent: copy.optional() })
  .refine((value) => value.accent === undefined || splitAround(value.title, value.accent) !== null, {
    message: "The accent must be part of the title.",
    path: ["accent"],
  });

const sectionFields = { id: sectionId, eyebrow: copy, headline };

// layout.mdx: header, theme menu, mobile nav and footer. The body is the footer disclaimer.
export const layoutSchema = z.strictObject({
  wordmark: copy,
  tagline: copy,
  skipLink: copy,
  nav: z.strictObject({
    label: copy,
    links: z.array(sectionLink).min(1),
    cta: sectionLink,
  }),
  theme: z.strictObject({
    label: copy,
    options: z.record(z.enum(THEME_CHOICES), copy),
  }),
  mobileNav: z.strictObject({ open: copy, title: copy, close: copy }),
  footer: z
    .strictObject({
      label: copy,
      links: z.array(sectionLink).min(1),
      concept: copy,
      credit: copy,
      creditLink: copy,
      source: copy,
      smallPrint: template("year"),
    })
    .refine((footer) => splitAround(footer.credit, footer.creditLink) !== null, {
      message: "creditLink must be part of credit.",
      path: ["creditLink"],
    }),
});

// hero.mdx: the first screen. The body is the lede.
export const heroSchema = z.strictObject({
  eyebrow: copy,
  headline,
  primaryCta: sectionLink,
  secondaryCta: sectionLink,
  hint: copy,
});

// features.mdx, integrations.mdx, pricing.mdx, faq.mdx: section headers.
// The body is the section intro (empty for the FAQ).
export const featuresSchema = z.strictObject({ ...sectionFields });
export const integrationsSchema = z.strictObject({ ...sectionFields });
export const pricingSchema = z.strictObject({ ...sectionFields });
export const faqSchema = z.strictObject({ ...sectionFields });

// quotes.mdx: the header plus the always-visible fictional label. No body.
export const quotesSchema = z.strictObject({ ...sectionFields, label: copy });

const field = z.strictObject({ label: copy, hint: copy.optional() });

const choiceField = z
  .strictObject({
    label: copy,
    options: z.array(z.strictObject({ value: z.string().min(1), label: copy })).min(2),
    default: z.string(),
  })
  .refine((choice) => choice.options.some((option) => option.value === choice.default), {
    message: "default must be one of the option values.",
    path: ["default"],
  });

// waitlist.mdx: the header and the form's field labels, keyed by the field
// names Netlify Forms receives. The body is the section intro.
export const waitlistSchema = z.strictObject({
  ...sectionFields,
  fields: z.strictObject({
    name: field,
    email: field,
    team: choiceField,
    currency: choiceField,
    note: z.strictObject({ label: copy, counter: template("n") }),
    "bot-field": field,
  }),
});
