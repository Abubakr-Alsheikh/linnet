import type { ReactNode } from "react";
import { Headline } from "./Headline";
import { titleId } from "./Section";

/**
 * Eyebrow and h2 in columns 1-7, the intro in columns 8-12 aligned to the
 * heading's last line (linnet-design section 3).
 */
export function SectionHeader({
  id,
  eyebrow,
  headline,
  intro,
}: {
  id: string;
  eyebrow: string;
  headline: { title: string; accent?: string };
  intro?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
      <div className="flex flex-col gap-4 lg:col-span-7">
        <p className="text-sm font-semibold text-ink-muted">{eyebrow}</p>
        <h2 id={titleId(id)} className="font-display text-h2 font-bold text-balance">
          <Headline {...headline} />
        </h2>
      </div>
      {intro && <div className="max-w-[44ch] text-lede text-ink-muted lg:col-span-5 lg:col-start-8">{intro}</div>}
    </div>
  );
}
