import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Button, restyled to linnet-design section 6. Focus uses the
 * global 2 px ring from globals.css; the only motion is a 1 px press.
 *
 * - primary: the crimson action. One per view (hero, Studio card, form submit).
 * - ink: the strong neutral action (header CTA, the demo's Send).
 * - secondary: surface with a control border.
 * - ghost: no border until hovered.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-sm font-semibold whitespace-nowrap select-none transition-colors duration-(--duration-press) ease-out-quint active:not-disabled:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-brand text-on-brand hover:bg-[color-mix(in_oklab,var(--brand),var(--ink)_8%)]",
        ink: "bg-ink text-canvas hover:bg-[color-mix(in_oklab,var(--ink),var(--canvas)_16%)]",
        secondary: "border-control bg-surface text-ink hover:bg-surface-2",
        ghost: "text-ink hover:bg-surface-2 aria-expanded:bg-surface-2",
      },
      size: {
        default: "h-11 px-4",
        /** Inside the demo's dense rows only. */
        dense: "h-10 px-3",
        icon: "size-11",
        "icon-dense": "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
