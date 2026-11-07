/*
 * The accordion's looks and its plus/minus glyph, kept apart from
 * accordion.tsx (which imports Radix) so a plain stand-in can render the same
 * markup before Radix loads (the FAQ loads its accordion on first use).
 */

export const accordionClasses = {
  root: "flex w-full flex-col rounded-card border border-line bg-surface",
  item: "border-b border-line last:border-b-0",
  trigger:
    "group/accordion-trigger flex min-h-11 flex-1 items-center justify-between gap-6 px-5 py-5 text-left text-lede font-semibold text-ink -outline-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:px-6",
  content: "overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up",
  contentInner: "max-w-[60ch] px-5 pb-6 text-base text-ink-muted sm:px-6 [&_p:not(:last-child)]:mb-4",
} as const;

/** A plus whose vertical bar rotates 90° onto the horizontal one when the trigger is expanded. */
export function PlusMinus() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 text-ink-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M2 8h12" />
      <path
        d="M8 2v12"
        className="origin-center transition-transform duration-(--duration-quick) ease-out-quint [transform-box:fill-box] group-aria-expanded/accordion-trigger:rotate-90"
      />
    </svg>
  );
}
