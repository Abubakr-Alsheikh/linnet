import { InvoiceDemo } from "@/components/demo/InvoiceDemo";
import { Headline } from "@/components/layout/Headline";
import { Button } from "@/components/ui/button";
import { demo, hero } from "@/lib/content";

/**
 * The first screen. The headline is the LCP element: server-rendered text,
 * final at first paint, never animated in. Copy in columns 1-5 and the
 * invoice in 6-12 at `lg`; stacked below, copy first. The invoice is a
 * client component, server-rendered in its starting state, so the page
 * paints it before it hydrates; its footnote stays on the server.
 */
export function Hero() {
  const { meta, Body } = hero;
  const { meta: demoContent, Body: Footnote } = demo;

  return (
    <section
      aria-labelledby="hero-title"
      className="page-width grid grid-cols-1 gap-12 pt-10 pb-20 lg:grid-cols-12 lg:gap-6 lg:pt-16 lg:pb-32"
    >
      <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:pt-12">
        <p className="text-sm font-semibold text-ink-muted">{meta.eyebrow}</p>
        <h1 id="hero-title" className="font-display text-display font-bold text-balance">
          <Headline {...meta.headline} accentClassName="inline-block" />
        </h1>
        <div className="max-w-[44ch] text-lede text-ink-muted">
          <Body />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild variant="primary">
            <a href={`#${meta.primaryCta.target}`}>{meta.primaryCta.label}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href={`#${meta.secondaryCta.target}`}>{meta.secondaryCta.label}</a>
          </Button>
        </div>
        <p className="text-sm text-ink-muted max-lg:hidden">{meta.hint}</p>
      </div>
      <div className="min-w-0 lg:col-span-7">
        <InvoiceDemo content={demoContent} />
        <div className="mx-auto mt-1 max-w-[640px] text-xs text-ink-muted">
          <Footnote />
        </div>
      </div>
    </section>
  );
}
