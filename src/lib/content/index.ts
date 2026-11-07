import type { MDXContent } from "mdx/types";
import { z } from "zod";
import DemoBody, { meta as demoMeta } from "@/content/demo.mdx";
import FaqBody, { meta as faqMeta } from "@/content/faq.mdx";
import FeaturesBody, { meta as featuresMeta } from "@/content/features.mdx";
import CurrenciesBody, { meta as currenciesMeta } from "@/content/features/currencies.mdx";
import ExportBody, { meta as exportMeta } from "@/content/features/export.mdx";
import HoursBody, { meta as hoursMeta } from "@/content/features/hours.mdx";
import PaymentsBody, { meta as paymentsMeta } from "@/content/features/payments.mdx";
import RemindersBody, { meta as remindersMeta } from "@/content/features/reminders.mdx";
import RetainersBody, { meta as retainersMeta } from "@/content/features/retainers.mdx";
import HeroBody, { meta as heroMeta } from "@/content/hero.mdx";
import IntegrationsBody, { meta as integrationsMeta } from "@/content/integrations.mdx";
import LayoutBody, { meta as layoutMeta } from "@/content/layout.mdx";
import PricingBody, { meta as pricingMeta } from "@/content/pricing.mdx";
import QuotesBody, { meta as quotesMeta } from "@/content/quotes.mdx";
import WaitlistBody, { meta as waitlistMeta } from "@/content/waitlist.mdx";
import {
  demoSchema,
  faqSchema,
  featureSchema,
  featuresSchema,
  heroSchema,
  integrationsSchema,
  layoutSchema,
  pricingSchema,
  quotesSchema,
  waitlistSchema,
} from "./schemas";

/**
 * Every content file, parsed. Import from here, never from src/content
 * directly, so no component sees an unchecked `meta`. This module runs at
 * build time when the page prerenders: a bad field throws and fails the
 * build with the file name and Zod's list of problems.
 *
 * Server components only. A client component gets strings as props and an
 * MDX body as rendered children.
 */

export interface Content<Meta> {
  meta: Meta;
  Body: MDXContent;
}

export function parseMeta<S extends z.ZodType>(file: string, schema: S, meta: unknown): z.output<S> {
  const result = schema.safeParse(meta);
  if (!result.success) {
    throw new Error(`src/content/${file} has invalid meta:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

function load<S extends z.ZodType>(file: string, schema: S, meta: unknown, Body: MDXContent): Content<z.output<S>> {
  return { meta: parseMeta(file, schema, meta), Body };
}

export const layout = load("layout.mdx", layoutSchema, layoutMeta, LayoutBody);
export const hero = load("hero.mdx", heroSchema, heroMeta, HeroBody);
export const demo = load("demo.mdx", demoSchema, demoMeta, DemoBody);
export const features = load("features.mdx", featuresSchema, featuresMeta, FeaturesBody);

/** The six features, in `order`. */
export const featureList = [
  load("features/hours.mdx", featureSchema, hoursMeta, HoursBody),
  load("features/reminders.mdx", featureSchema, remindersMeta, RemindersBody),
  load("features/payments.mdx", featureSchema, paymentsMeta, PaymentsBody),
  load("features/currencies.mdx", featureSchema, currenciesMeta, CurrenciesBody),
  load("features/retainers.mdx", featureSchema, retainersMeta, RetainersBody),
  load("features/export.mdx", featureSchema, exportMeta, ExportBody),
].sort((a, b) => a.meta.order - b.meta.order);
export const integrations = load("integrations.mdx", integrationsSchema, integrationsMeta, IntegrationsBody);
export const pricing = load("pricing.mdx", pricingSchema, pricingMeta, PricingBody);
export const quotes = load("quotes.mdx", quotesSchema, quotesMeta, QuotesBody);
export const faq = load("faq.mdx", faqSchema, faqMeta, FaqBody);
export const waitlist = load("waitlist.mdx", waitlistSchema, waitlistMeta, WaitlistBody);

/** The page's sections in reading order, after the hero. */
export const sections = [features, integrations, pricing, quotes, faq, waitlist] as const;
