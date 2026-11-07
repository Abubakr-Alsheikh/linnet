"use client";

import { CircleAlertIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import type { KeyboardEvent } from "react";
import { DigitRoll } from "@/components/motion/DigitRoll";
import { PaidStamp } from "./PaidStamp";

export interface TotalsProps {
  labels: { subtotal: string; tax: string; taxRate: string; total: string };
  subtotal: string;
  tax: string;
  total: string;
  taxRate: string;
  taxRateId: string;
  taxError: string | null;
  locked: boolean;
  stamp: { word: string; date: string } | null;
  onTaxRate: (value: string) => void;
  onTaxBlur: () => void;
  onTaxStep: (direction: 1 | -1) => void;
  onStampSettled: () => void;
}

/**
 * Subtotal, tax with its rate field, and the total on its highlighter band,
 * right-aligned under a strong rule. From `sm` the rows hug the right edge
 * and leave the left side free for the PAID stamp; below `sm` the stamp
 * moves above the rule. Either way it never covers a figure or a label.
 */
export function Totals(props: TotalsProps) {
  const errorId = `${props.taxRateId}-error`;
  return (
    <div className="relative mt-4 border-t border-line-strong pt-4">
      <dl className="ml-auto grid w-fit grid-cols-[auto_auto] items-center justify-end gap-x-6 gap-y-2 text-sm">
        <dt className="text-ink-muted">{props.labels.subtotal}</dt>
        <dd className="text-right">
          <DigitRoll value={props.subtotal} />
        </dd>
        <dt className="flex items-center gap-2 text-ink-muted">
          {props.labels.tax}
          <span className="relative">
            <input
              id={props.taxRateId}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              aria-label={props.labels.taxRate}
              aria-invalid={props.taxError ? true : undefined}
              aria-describedby={props.taxError ? errorId : undefined}
              readOnly={props.locked}
              value={props.taxRate}
              onChange={(event) => props.onTaxRate(event.target.value)}
              onBlur={props.onTaxBlur}
              onKeyDown={(event: KeyboardEvent) => {
                if (props.locked || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
                event.preventDefault();
                props.onTaxStep(event.key === "ArrowUp" ? 1 : -1);
              }}
              className="h-11 w-16 rounded-sm border-0 border-b border-control bg-transparent pr-6 pl-2 text-right text-base text-ink tabular-nums transition-colors duration-(--duration-press) hover:bg-surface-2 focus-visible:bg-surface-2 aria-invalid:border-negative read-only:border-transparent read-only:hover:bg-transparent md:h-10 md:text-sm"
            />
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink-muted">
              %
            </span>
          </span>
        </dt>
        <dd className="text-right">
          <DigitRoll value={props.tax} />
        </dd>
        <dt className="font-semibold text-ink">{props.labels.total}</dt>
        <dd className="-mr-2 rounded-sm bg-brand-tint px-2 py-1 text-right font-display text-total font-bold text-ink">
          <DigitRoll value={props.total} />
        </dd>
      </dl>
      {props.taxError && (
        <p id={errorId} className="mt-2 flex items-start justify-end gap-1.5 text-right text-sm text-negative">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {props.taxError}
        </p>
      )}
      <AnimatePresence>
        {props.stamp && (
          <PaidStamp
            key="stamp"
            word={props.stamp.word}
            date={props.stamp.date}
            onSettled={props.onStampSettled}
            // Below sm the rows fill the width, so the stamp sits in the row
            // "Add a line" leaves empty once the invoice locks.
            className="absolute -top-16 right-2 sm:top-5 sm:right-auto sm:left-4"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
