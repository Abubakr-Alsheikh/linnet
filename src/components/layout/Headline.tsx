import { splitAround } from "@/lib/content/template";
import { cn } from "@/lib/utils";

/**
 * A heading's text with its accent phrase in brand-ink (linnet-design
 * section 5.4). The content schema guarantees the accent is part of the title.
 */
export function Headline({
  title,
  accent,
  accentClassName,
}: {
  title: string;
  accent?: string;
  accentClassName?: string;
}) {
  const parts = accent ? splitAround(title, accent) : null;
  if (!parts) return title;
  const [before, phrase, after] = parts;
  return (
    <>
      {before}
      <span className={cn("text-brand-ink", accentClassName)}>{phrase}</span>
      {after}
    </>
  );
}
