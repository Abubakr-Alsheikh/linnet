import * as React from "react"
import { cn } from "@/lib/utils"

/** shadcn/ui Textarea, restyled to match Input. It grows with its content. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-lg border border-control bg-surface px-3 py-2.5 text-base text-ink transition-colors duration-(--duration-press) placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-negative",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
