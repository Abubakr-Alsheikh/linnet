import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { selectTriggerVariants, type SelectTriggerVariant } from "./select-trigger-styles"

/**
 * shadcn/ui NativeSelect, restyled with the Select trigger's looks
 * (select-trigger-styles.ts). A real <select>: no JavaScript, the platform's
 * own picker on phones, full keyboard and screen reader support, and nothing
 * hidden from assistive tech while it is open. The invoice demo uses it.
 */
function NativeSelect({
  className,
  wrapperClassName,
  variant = "field",
  ...props
}: React.ComponentProps<"select"> & { variant?: SelectTriggerVariant; wrapperClassName?: string }) {
  return (
    <div data-slot="native-select-wrapper" className={cn("relative w-full min-w-0", wrapperClassName)}>
      <select
        data-slot="native-select"
        className={cn(selectTriggerVariants({ variant }), "peer appearance-none", variant === "field" ? "pr-9" : "pr-6", className)}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden="true"
        data-slot="native-select-icon"
        className={cn(
          "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink-muted peer-disabled:invisible",
          variant === "field" ? "right-3" : "right-0"
        )}
      />
    </div>
  )
}

/** Options take the system canvas colours, which follow the page's color-scheme. */
function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] font-normal text-[CanvasText]", className)}
      {...props}
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
