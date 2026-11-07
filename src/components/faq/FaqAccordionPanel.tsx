"use client";

import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItem } from "./FaqAccordion";

/**
 * The Radix FAQ accordion. It replaces FaqAccordion's plain copy on the first
 * press, mounts closed, moves focus to the pressed question's trigger (the
 * plain button it replaced is gone), then opens that question two frames
 * later so Radix plays its opening animation instead of snapping open.
 */
export default function FaqAccordionPanel({ items, first }: { items: FaqItem[]; first: string }) {
  const [open, setOpen] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    root.current?.querySelector<HTMLElement>(`[data-value="${first}"] button`)?.focus();
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setOpen((current) => (current.includes(first) ? current : [...current, first])));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [first]);

  return (
    <Accordion ref={root} type="multiple" value={open} onValueChange={setOpen}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} data-value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
