import { CheckIcon } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { BillingSwitch, PriceRoll } from "@/components/pricing/Billing";
import { Button } from "@/components/ui/button";
import { pricing } from "@/lib/content";
import { savingPercent, tierPrices } from "@/lib/pricing";
import { fill } from "@/lib/content/template";
import { cn } from "@/lib/utils";

/**
 * Three tiers with a monthly and yearly switch. The cards render on the
 * server; BillingSwitch (the toggle) and PriceRoll (each price) are the only
 * client parts. Studio is featured with an ink border, its label and the
 * section's one crimson button. Each CTA is a plain link to
 * `/?team=<tier>#waitlist`, which works without JavaScript; the waitlist form
 * reads `team` after mount (M7).
 */
export function Pricing() {
  const { meta, Body } = pricing;
  const prices = meta.tiers.map((tier) => tierPrices(tier.monthly, meta.yearlyDiscount));
  // The smallest saving across the tiers, so the badge is true for every plan.
  const saving = Math.min(...meta.tiers.map((tier, index) => savingPercent(tier.monthly, prices[index].yearlyPerMonth)));
  const toggleLabels = { ...meta.toggle, saving: fill(meta.toggle.saving, { percent: saving }) };
  const priceLabels = {
    price: meta.price,
    per: meta.per,
    billedMonthly: meta.billed.monthly,
    billedYearly: meta.billed.yearly,
  };

  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} intro={<Body />} />
      <BillingSwitch labels={toggleLabels} announce={meta.announce}>
        <ul className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {meta.tiers.map((tier, index) => (
            <li
              key={tier.id}
              className={cn("flex flex-col rounded-card border bg-surface p-6 sm:p-8", tier.featured ? "border-ink" : "border-line")}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 id={`tier-${tier.id}`} className="font-display text-h3 font-bold">
                  {tier.name}
                </h3>
                {tier.featured && (
                  <span className="inline-flex h-6 shrink-0 items-center rounded-lg bg-ink px-2 text-xs font-semibold text-canvas">
                    {meta.featuredLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-ink-muted">{tier.who}</p>
              <PriceRoll prices={prices[index]} index={index} labels={priceLabels} />
              <ul className="mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild variant={tier.featured ? "primary" : "secondary"} className="mt-8 w-full">
                <a href={`/?team=${tier.id}#waitlist`} aria-describedby={`tier-${tier.id}`}>
                  {meta.cta}
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </BillingSwitch>
      <p className="mt-6 max-w-[60ch] text-sm text-ink-muted">{meta.note}</p>
    </Section>
  );
}
