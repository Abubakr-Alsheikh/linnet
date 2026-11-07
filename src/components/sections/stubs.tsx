import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { faq, pricing, quotes, waitlist } from "@/lib/content";

/*
 * The page's sections with their headers only. Each one moves to its own
 * file in src/components/sections when its milestone fills it: pricing
 * (M5), quotes and FAQ (M6), waitlist (M7).
 */

export function Pricing() {
  const { meta, Body } = pricing;
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} intro={<Body />} />
    </Section>
  );
}

export function Quotes() {
  const { meta } = quotes;
  return (
    <Section id={meta.id}>
      <SectionHeader
        id={meta.id}
        eyebrow={meta.eyebrow}
        headline={meta.headline}
        intro={<p className="text-sm font-semibold text-ink">{meta.label}</p>}
      />
    </Section>
  );
}

export function Faq() {
  const { meta } = faq;
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} />
    </Section>
  );
}

export function Waitlist() {
  const { meta, Body } = waitlist;
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} intro={<Body />} />
    </Section>
  );
}
