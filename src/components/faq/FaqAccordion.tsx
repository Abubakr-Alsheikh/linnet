"use client";

import { Suspense, lazy, useState, type ReactNode } from "react";
import { PlusMinus, accordionClasses } from "@/components/ui/accordion-parts";

export interface FaqItem {
  value: string;
  question: string;
  answer: ReactNode;
}

const loadPanel = () => import("./FaqAccordionPanel");
const FaqAccordionPanel = lazy(loadPanel);

/** The closed accordion as plain markup: the same h3 > button structure and looks, no Radix. */
function PlainAccordion({ items, onOpen }: { items: FaqItem[]; onOpen?: (value: string) => void }) {
  return (
    <div className={accordionClasses.root}>
      {items.map((item) => (
        <div key={item.value} className={accordionClasses.item}>
          <h3 className="flex">
            <button
              type="button"
              aria-expanded={false}
              className={accordionClasses.trigger}
              onPointerEnter={loadPanel}
              onFocus={loadPanel}
              onClick={() => onOpen?.(item.value)}
            >
              {item.question}
              <PlusMinus />
            </button>
          </h3>
        </div>
      ))}
    </div>
  );
}

/**
 * The FAQ accordion, with Radix loaded on first use: a plain, closed copy
 * until a question is pressed, then the Radix Accordion (`type="multiple"`),
 * which opens that question and takes over keys and state. Keeps about 8 KB
 * of script and the hydration of nine Radix items out of the first load
 * (measured: +49 ms median TBT when they were in it).
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [first, setFirst] = useState<string | null>(null);
  if (first === null) return <PlainAccordion items={items} onOpen={setFirst} />;
  return (
    <Suspense fallback={<PlainAccordion items={items} />}>
      <FaqAccordionPanel items={items} first={first} />
    </Suspense>
  );
}
