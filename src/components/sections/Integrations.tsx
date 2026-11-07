import { INTEGRATION_ICONS } from "@/components/icons/IntegrationIcons";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { integrations } from "@/lib/content";

/**
 * Eight integration categories as tiles: two columns at 360, four at lg.
 * Categories only, with original icons, and the note under the grid says
 * none of them connect to a real service. Fully server-rendered.
 */
export function Integrations() {
  const { meta, Body } = integrations;
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} intro={<Body />} />
      <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-16 lg:grid-cols-4 lg:gap-6">
        {meta.items.map((item) => {
          const Icon = INTEGRATION_ICONS[item.id];
          return (
            <li key={item.id} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink">
                <Icon className="size-6" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
                <p className="text-sm text-pretty text-ink-muted">{item.line}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 max-w-[60ch] text-sm text-ink-muted">{meta.note}</p>
    </Section>
  );
}
