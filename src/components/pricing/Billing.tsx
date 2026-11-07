"use client";

import { LazyMotion } from "motion/react";
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { DigitRoll } from "@/components/motion/DigitRoll";
import { fill } from "@/lib/content/template";
import { stagger } from "@/lib/motion";
import type { BillingPeriod, TierPrices } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

const PERIODS: BillingPeriod[] = ["monthly", "yearly"];

const BillingContext = createContext<BillingPeriod>("monthly");

export interface BillingSwitchProps {
  labels: { label: string; monthly: string; yearly: string; saving: string };
  announce: Record<BillingPeriod, string>;
  children: ReactNode;
}

/**
 * The billing period for the pricing cards below it, and the toggle that
 * sets it (linnet-motion recipe 4). The toggle is a native radio group, so
 * it is one Tab stop and the arrow keys move and select without any script;
 * the selected segment's background slides on a CSS transform. Each change
 * is announced once. The cards stay server components; only PriceRoll reads
 * the period.
 */
export function BillingSwitch({ labels, announce, children }: BillingSwitchProps) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [message, setMessage] = useState("");
  const id = useId();
  const savingId = `${id}-saving`;

  const choose = (next: BillingPeriod) => {
    setPeriod(next);
    setMessage(announce[next]);
  };

  return (
    <LazyMotion features={loadFeatures} strict>
      <BillingContext.Provider value={period}>
        <fieldset className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mt-16">
          <legend className="sr-only">{labels.label}</legend>
          <div className="relative grid grid-cols-2 rounded-lg bg-surface-2 p-1">
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md border border-line bg-surface transition-transform duration-(--duration-base) ease-out-quint",
                period === "yearly" && "translate-x-full",
              )}
            />
            {PERIODS.map((option) => (
              <label
                key={option}
                className={cn(
                  "relative flex h-10 cursor-pointer items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors duration-(--duration-quick) select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus",
                  option === period ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-period`}
                  value={option}
                  checked={option === period}
                  onChange={() => choose(option)}
                  aria-describedby={option === "yearly" ? savingId : undefined}
                  className="sr-only"
                />
                {labels[option]}
              </label>
            ))}
          </div>
          <span
            id={savingId}
            className={cn(
              "inline-flex h-6 items-center rounded-lg bg-positive-tint px-2 text-xs font-semibold text-positive transition-opacity duration-(--duration-quick)",
              period === "yearly" ? "opacity-100" : "opacity-0",
            )}
          >
            {labels.saving}
          </span>
        </fieldset>
        {children}
        <p role="status" className="sr-only">
          {message}
        </p>
      </BillingContext.Provider>
    </LazyMotion>
  );
}

export interface PriceRollProps {
  prices: TierPrices;
  /** The card's place, left to right, for the roll's stagger. */
  index: number;
  labels: { price: string; per: string; billedMonthly: string; billedYearly: string };
}

/**
 * A tier's price and billed line. The price box keeps the width of the
 * tier's widest price, so "/ month" never moves; the price sits on the
 * left edge with the card's other text, and its changed digits roll, with
 * each card starting `stagger.tiers` after the one to its left. The two
 * billed lines share one grid cell and cross-fade.
 */
export function PriceRoll({ prices, index, labels }: PriceRollProps) {
  const period = useContext(BillingContext);
  const price = (n: number) => fill(labels.price, { n });
  const widest = price(Math.max(prices.monthly, prices.yearlyPerMonth));
  const billed: Record<BillingPeriod, string> = {
    monthly: labels.billedMonthly,
    yearly: fill(labels.billedYearly, { year: prices.billedYearly }),
  };

  return (
    <div className="mt-6">
      <p className="flex items-baseline gap-2">
        <span className="inline-grid font-display text-h2 font-bold tabular-nums">
          <span aria-hidden="true" className="invisible col-start-1 row-start-1">
            {widest}
          </span>
          <DigitRoll
            anchor="start"
            className="col-start-1 row-start-1"
            value={price(period === "yearly" ? prices.yearlyPerMonth : prices.monthly)}
            delay={index * stagger.tiers}
          />
        </span>
        <span className="text-sm text-ink-muted">{labels.per}</span>
      </p>
      <p className="mt-1 grid text-sm text-ink-muted">
        {PERIODS.map((option) => (
          <span
            key={option}
            aria-hidden={option !== period || undefined}
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-(--duration-quick)",
              option === period ? "opacity-100" : "opacity-0",
            )}
          >
            {billed[option]}
          </span>
        ))}
      </p>
    </div>
  );
}
