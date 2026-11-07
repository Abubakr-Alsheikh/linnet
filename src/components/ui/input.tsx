import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Input, restyled: 44 px, surface fill, 1 px control border
 * (WCAG 1.4.11), the global focus ring, negative border when invalid. The
 * label sits above and the hint or error below, outside this component.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-control bg-surface px-3 text-base text-ink transition-colors duration-(--duration-press) placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-negative",
        className
      )}
      {...props}
    />
  )
}

export { Input }
