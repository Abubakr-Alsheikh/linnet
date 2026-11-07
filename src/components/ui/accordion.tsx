"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { PlusMinus, accordionClasses } from "./accordion-parts"

/**
 * shadcn/ui Accordion, restyled for the FAQ: one surface block, items
 * divided by hairlines, the trigger a full-width button inside an h3
 * (Radix's Header). The plus turns into a minus: its vertical bar rotates
 * 90° onto the horizontal one (transform only). The panel opens with
 * shadcn's accordion-down and accordion-up keyframes. Looks live in
 * accordion-parts.tsx so a plain stand-in can match them before Radix loads.
 */
function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(accordionClasses.root, className)}
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
      className={cn(accordionClasses.item, className)}
      {...props}
    />
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
        className={cn(accordionClasses.trigger, className)}
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
      className={accordionClasses.content}
      {...props}
    >
      <div className={cn(accordionClasses.contentInner, className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
