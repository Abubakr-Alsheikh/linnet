import { cn } from "@/lib/utils";

/** The app icon's mark (src/app/icon.svg) drawn with theme tokens: an L and a dot on a crimson square. */
export function WordmarkGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 shrink-0", className)}>
      <rect width="32" height="32" rx="7" className="fill-brand" />
      <path d="M10 7.5h3.6v13.4H23v3.6H10z" className="fill-on-brand" />
      <circle cx="20.5" cy="11" r="2.2" className="fill-on-brand" />
    </svg>
  );
}
