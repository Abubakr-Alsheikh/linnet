import type { MDXContent } from "mdx/types";
import { z } from "zod";
import FaqBody, { meta as faqMeta } from "@/content/faq.mdx";
import FeaturesBody, { meta as featuresMeta } from "@/content/features.mdx";
import HeroBody, { meta as heroMeta } from "@/content/hero.mdx";
import IntegrationsBody, { meta as integrationsMeta } from "@/content/integrations.mdx";
import LayoutBody, { meta as layoutMeta } from "@/content/layout.mdx";
import PricingBody, { meta as pricingMeta } from "@/content/pricing.mdx";
import QuotesBody, { meta as quotesMeta } from "@/content/quotes.mdx";
import WaitlistBody, { meta as waitlistMeta } from "@/content/waitlist.mdx";
import {
  faqSchema,
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
export const features = load("features.mdx", featuresSchema, featuresMeta, FeaturesBody);
export const integrations = load("integrations.mdx", integrationsSchema, integrationsMeta, IntegrationsBody);
export const pricing = load("pricing.mdx", pricingSchema, pricingMeta, PricingBody);
export const quotes = load("quotes.mdx", quotesSchema, quotesMeta, QuotesBody);
export const faq = load("faq.mdx", faqSchema, faqMeta, FaqBody);
export const waitlist = load("waitlist.mdx", waitlistSchema, waitlistMeta, WaitlistBody);

/** The page's sections in reading order, after the hero. */
export const sections = [features, integrations, pricing, quotes, faq, waitlist] as const;
