import { z } from "zod";
import { INTEGRATION_IDS } from "@/lib/integrations";
import { STATUSES } from "@/lib/invoice/demo-machine";
import { checkDescription, parseQuantity, parseRate, parseTaxRate } from "@/lib/invoice/parse";
import { CURRENCIES } from "@/lib/money";
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

// demo.mdx: every string on the hero's invoice, the fictional clients and
// the starting lines. The body is the footnote under the sheet.
const currency = z.enum(CURRENCIES);

export const demoSchema = z
  .strictObject({
    title: copy,
    number: copy,
    from: z.strictObject({ label: copy, name: copy, line: copy }),
    billTo: copy,
    contact: template("email", "city"),
    clients: z
      .array(
        z.strictObject({
          id: sectionId,
          name: copy,
          // The reserved .example domain: no real inbox ever appears in the demo.
          email: z.email().refine((email) => email.endsWith(".example"), "Use the reserved .example domain."),
          city: copy,
          currency,
        }),
      )
      .min(1),
    defaultClient: z.string(),
    issued: copy,
    due: copy,
    terms: z.strictObject({
      label: copy,
      options: z.array(z.strictObject({ days: z.int().min(0).max(90), label: copy })).min(1),
      default: z.int(),
    }),
    currency: z.strictObject({
      label: copy,
      options: z.array(z.strictObject({ value: currency, label: copy })).length(CURRENCIES.length),
    }),
    columns: z.strictObject({ description: copy, quantity: copy, quantityHint: copy, rate: copy, amount: copy }),
    line: z.strictObject({ label: template("n"), add: copy, limit: copy, remove: template("n") }),
    defaultLines: z
      .array(z.strictObject({ description: copy, quantity: z.string(), rate: z.string() }))
      .min(1)
      .max(6)
      .refine(
        (lines) =>
          lines.every(
            (line) => checkDescription(line.description) === null && parseQuantity(line.quantity) !== null && parseRate(line.rate) !== null,
          ),
        "Every default line must parse.",
      ),
    totals: z.strictObject({ subtotal: copy, tax: copy, taxRate: copy, total: copy }),
    defaultTaxRate: z.string().refine((rate) => parseTaxRate(rate) !== null, "The default tax rate must parse."),
    status: z.record(z.enum(STATUSES), copy),
    actions: z.strictObject({ send: copy, sending: copy, sent: copy, reset: copy }),
    activity: z.strictObject({ sent: template("email"), viewed: template("client"), paid: copy }),
    stamp: copy,
    hints: z.strictObject({ zeroTotal: copy, invalid: copy, locked: copy }),
    errors: z.strictObject({ descriptionEmpty: copy, descriptionLong: copy, quantity: copy, rate: copy, taxRate: copy }),
    announce: z.strictObject({
      total: template("total"),
      added: template("n"),
      removed: template("n"),
      sending: template("client"),
      sent: template("client"),
      paid: template("total"),
      reset: copy,
    }),
  })
  .refine((demo) => demo.clients.some((client) => client.id === demo.defaultClient), {
    message: "defaultClient must be one of the clients.",
    path: ["defaultClient"],
  })
  .refine((demo) => demo.terms.options.some((option) => option.days === demo.terms.default), {
    message: "terms.default must be one of the options.",
    path: ["terms", "default"],
  })
  .refine((demo) => new Set(demo.currency.options.map((option) => option.value)).size === CURRENCIES.length, {
    message: "List each currency once.",
    path: ["currency", "options"],
  });

export type DemoContent = z.output<typeof demoSchema>;

// features.mdx, integrations.mdx, pricing.mdx, faq.mdx: section headers.
// The body is the section intro (empty for the FAQ).
export const featuresSchema = z.strictObject({ ...sectionFields, replay: template("title") });

// features/*.mdx: one feature each. `diagram` picks the drawing in
// src/components/diagrams and fixes the shape of `figure`, the short strings
// drawn inside it. The body is the feature's paragraph.
const featureFields = { order: z.int().min(1), title: copy, diagramLabel: copy };
const triple = z.tuple([copy, copy, copy]);

export const featureSchema = z.discriminatedUnion("diagram", [
  z.strictObject({
    ...featureFields,
    diagram: z.literal("hours"),
    figure: z.strictObject({ blocks: triple, line: copy, quantity: copy, amount: copy }),
  }),
  z.strictObject({
    ...featureFields,
    diagram: z.literal("reminders"),
    figure: z.strictObject({ steps: z.tuple([copy, copy, copy, copy]), cancelled: copy }),
  }),
  z.strictObject({
    ...featureFields,
    diagram: z.literal("payments"),
    figure: z.strictObject({ pay: copy, card: copy, transfer: copy, paid: copy }),
  }),
  z.strictObject({
    ...featureFields,
    diagram: z.literal("currencies"),
    figure: z.strictObject({ amounts: triple, rate: copy }),
  }),
  z.strictObject({
    ...featureFields,
    diagram: z.literal("retainers"),
    figure: z.strictObject({ months: z.tuple([copy, copy]), invoice: copy, paid: copy }),
  }),
  z.strictObject({
    ...featureFields,
    diagram: z.literal("export"),
    figure: z.strictObject({ invoices: triple, file: copy }),
  }),
]);

export type Feature = z.output<typeof featureSchema>;
export type DiagramId = Feature["diagram"];
// integrations.mdx: the header, the eight categories (ids from
// src/lib/integrations.ts, each drawn by an icon) and the note under them.
export const integrationsSchema = z.strictObject({
  ...sectionFields,
  items: z
    .array(z.strictObject({ id: z.enum(INTEGRATION_IDS), name: copy, line: copy }))
    .length(INTEGRATION_IDS.length)
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, "List each integration once."),
  note: copy,
});
// pricing.mdx: the header, the billing toggle, three tiers and the
// illustrative-prices note. Tiers give monthly prices only; src/lib/pricing.ts
// derives the yearly ones from `yearlyDiscount`. Tier ids are the waitlist's
// team values, so each CTA can preselect "How do you work?".
export const pricingSchema = z
  .strictObject({
    ...sectionFields,
    toggle: z.strictObject({ label: copy, monthly: copy, yearly: copy, saving: template("percent") }),
    yearlyDiscount: z.int().min(1).max(50),
    price: template("n"),
    per: copy,
    billed: z.strictObject({ monthly: copy, yearly: template("year") }),
    announce: z.strictObject({ monthly: copy, yearly: copy }),
    cta: copy,
    featuredLabel: copy,
    tiers: z
      .array(
        z.strictObject({
          id: z.enum(["solo", "studio", "agency"]),
          name: copy,
          who: copy,
          monthly: z.int().positive(),
          featured: z.literal(true).optional(),
          features: z.array(copy).min(1),
        }),
      )
      .length(3),
    note: copy,
  })
  .refine((pricing) => pricing.tiers.every((tier) => (tier.monthly * (100 - pricing.yearlyDiscount)) % 100 === 0), {
    message: "The yearly discount must leave every tier in whole euros.",
    path: ["yearlyDiscount"],
  })
  .refine((pricing) => pricing.tiers.filter((tier) => tier.featured).length === 1, {
    message: "Mark exactly one tier as featured.",
    path: ["tiers"],
  });
export const faqSchema = z.strictObject({ ...sectionFields });

// quotes.mdx: the header, the always-visible fictional label and five
// fictional quotes. No body.
export const quotesSchema = z.strictObject({
  ...sectionFields,
  label: copy,
  items: z.array(z.strictObject({ quote: copy, name: copy, role: copy })).min(1),
});

// faq/*.mdx: one question each, ordered by `order`. The body is the answer.
export const faqItemSchema = z.strictObject({ order: z.int().min(1), question: copy });

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
