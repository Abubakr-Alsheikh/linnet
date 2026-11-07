import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { quotes } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Two wide quotes, then three, at lg; at md the fifth spans both columns. */
const SPANS = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "md:col-span-2 lg:col-span-2"];

/** "Noor Saleh" -> "NS": first letters of the first and last names. */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? (words.at(-1)?.[0] ?? "") : "")).toUpperCase();
}

/**
 * Five fictional quotes. The fictional label sits beside the heading at
 * every width, in the intro's place, never in a tooltip or footnote. Cards
 * sit in rows (two wide, then three at lg), with each name pinned to its
 * card's foot so the names line up. Initials on brand-tint, never photos. The
 * quotation marks come from CSS `open-quote` / `close-quote`, at text size.
 */
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
      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-6">
        {meta.items.map((item, index) => (
          <li key={item.name} className={cn(SPANS[index] ?? "lg:col-span-2")}>
            <figure className="flex h-full flex-col gap-6 rounded-card border border-line bg-surface p-6 sm:p-8">
              <blockquote className="text-lede text-pretty text-ink">
                <p className="before:content-[open-quote] after:content-[close-quote]">{item.quote}</p>
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand-ink"
                >
                  {initials(item.name)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-sm text-ink-muted">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
