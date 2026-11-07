import { cn } from "@/lib/utils";

export type GlyphName = "draft" | "sent" | "viewed" | "paid" | "overdue";

/**
 * Status glyphs for chips and the activity list, drawn for Linnet on a 16 px
 * grid with a 1.5 px stroke: hollow circle (draft), arrow (sent), eye
 * (viewed), check (paid), clock (overdue). A glyph always sits beside its
 * word, so status never depends on colour alone.
 */
export function StatusGlyph({ name, className }: { name: GlyphName; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-3.5 shrink-0", className)}
    >
      {name === "draft" && <circle cx="8" cy="8" r="5" />}
      {name === "sent" && <path d="M2.75 8h10M9.25 4.5 12.75 8l-3.5 3.5" />}
      {name === "viewed" && (
        <>
          <path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8z" />
          <circle cx="8" cy="8" r="1.75" />
        </>
      )}
      {name === "paid" && <path d="m3.25 8.5 3 3 6.5-7" />}
      {name === "overdue" && (
        <>
          <circle cx="8" cy="8" r="5.75" />
          <path d="M8 5v3.25l2 1.25" />
        </>
      )}
    </svg>
  );
}
