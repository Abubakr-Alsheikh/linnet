import { WordmarkGlyph } from "@/components/icons/WordmarkGlyph";
import { cn } from "@/lib/utils";

/** The glyph and the name in Familjen 700. A link when given `href`. */
export function Wordmark({ name, href, className }: { name: string; href?: string; className?: string }) {
  const classes = cn("inline-flex items-center gap-2.5 font-display text-h3 font-bold text-ink", className);
  const inner = (
    <>
      <WordmarkGlyph />
      {name}
    </>
  );
  if (!href) return <span className={classes}>{inner}</span>;
  return (
    <a href={href} className={cn(classes, "min-h-11 rounded-lg")}>
      {inner}
    </a>
  );
}
