import { cva, type VariantProps } from "class-variance-authority";

/**
 * Select trigger looks, kept apart from select.tsx so a plain button can
 * wear them before the Radix Select loads (the demo's lazy selects).
 *
 * - field: a 44 px bordered field, like Input (the waitlist form).
 * - inline: text on a control underline, for the invoice sheet. Disabled, it
 *   reads as printed text: no underline, no chevron, no fading.
 */
export const selectTriggerVariants = cva(
  "flex w-full min-w-0 items-center justify-between gap-2 text-left text-ink whitespace-nowrap transition-colors duration-(--duration-press) select-none aria-invalid:border-negative data-placeholder:text-ink-muted *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        field:
          "h-11 rounded-lg border border-control bg-surface pr-2.5 pl-3 text-base disabled:cursor-not-allowed disabled:opacity-50",
        inline:
          "h-11 rounded-sm border-0 border-b border-control bg-transparent px-0 text-base hover:border-ink disabled:cursor-default disabled:border-transparent disabled:[&_svg]:invisible md:h-10",
      },
    },
    defaultVariants: { variant: "field" },
  },
);

export type SelectTriggerVariant = NonNullable<VariantProps<typeof selectTriggerVariants>["variant"]>;
