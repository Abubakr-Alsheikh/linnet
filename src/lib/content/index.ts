import type { MDXContent } from "mdx/types";
import { z } from "zod";
import DemoBody, { meta as demoMeta } from "@/content/demo.mdx";
import FaqBody, { meta as faqMeta } from "@/content/faq.mdx";
import Faq01Body, { meta as faq01Meta } from "@/content/faq/01-real.mdx";
import Faq02Body, { meta as faq02Meta } from "@/content/faq/02-who.mdx";
import Faq03Body, { meta as faq03Meta } from "@/content/faq/03-currencies.mdx";
import Faq04Body, { meta as faq04Meta } from "@/content/faq/04-tax.mdx";
import Faq05Body, { meta as faq05Meta } from "@/content/faq/05-payments.mdx";
import Faq06Body, { meta as faq06Meta } from "@/content/faq/06-hours.mdx";
import Faq07Body, { meta as faq07Meta } from "@/content/faq/07-cancel.mdx";
import Faq08Body, { meta as faq08Meta } from "@/content/faq/08-data.mdx";
import Faq09Body, { meta as faq09Meta } from "@/content/faq/09-email.mdx";
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
import NotFoundBody, { meta as notFoundMeta } from "@/content/not-found.mdx";
import PricingBody, { meta as pricingMeta } from "@/content/pricing.mdx";
import QuotesBody, { meta as quotesMeta } from "@/content/quotes.mdx";
import WaitlistBody, { meta as waitlistMeta } from "@/content/waitlist.mdx";
import {
  demoSchema,
  faqItemSchema,
  faqSchema,
  featureSchema,
  featuresSchema,
  heroSchema,
  integrationsSchema,
  layoutSchema,
  notFoundSchema,
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
export const notFound = load("not-found.mdx", notFoundSchema, notFoundMeta, NotFoundBody);
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

/** The nine questions, in `order`. */
export const faqList = [
  load("faq/01-real.mdx", faqItemSchema, faq01Meta, Faq01Body),
  load("faq/02-who.mdx", faqItemSchema, faq02Meta, Faq02Body),
  load("faq/03-currencies.mdx", faqItemSchema, faq03Meta, Faq03Body),
  load("faq/04-tax.mdx", faqItemSchema, faq04Meta, Faq04Body),
  load("faq/05-payments.mdx", faqItemSchema, faq05Meta, Faq05Body),
  load("faq/06-hours.mdx", faqItemSchema, faq06Meta, Faq06Body),
  load("faq/07-cancel.mdx", faqItemSchema, faq07Meta, Faq07Body),
  load("faq/08-data.mdx", faqItemSchema, faq08Meta, Faq08Body),
  load("faq/09-email.mdx", faqItemSchema, faq09Meta, Faq09Body),
].sort((a, b) => a.meta.order - b.meta.order);
export const waitlist = load("waitlist.mdx", waitlistSchema, waitlistMeta, WaitlistBody);

/** The page's sections in reading order, after the hero. */
export const sections = [features, integrations, pricing, quotes, faq, waitlist] as const;
