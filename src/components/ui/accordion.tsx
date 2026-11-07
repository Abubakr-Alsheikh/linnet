"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Accordion, restyled for the FAQ: one surface block, items
 * divided by hairlines, the trigger a full-width button inside an h3
 * (Radix's Header). The plus turns into a minus: its vertical bar rotates
 * 90° onto the horizontal one (transform only). The panel opens with
 * shadcn's accordion-down and accordion-up keyframes.
 */
function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col rounded-card border border-line bg-surface", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-line last:border-b-0", className)}
      {...props}
    />
  )
}

function PlusMinus() {
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
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex min-h-11 flex-1 items-center justify-between gap-6 px-5 py-5 text-left text-lede font-semibold text-ink -outline-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:px-6",
          className
        )}
        {...props}
      >
        {children}
        <PlusMinus />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div className={cn("max-w-[60ch] px-5 pb-6 text-base text-ink-muted sm:px-6 [&_p:not(:last-child)]:mb-4", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
