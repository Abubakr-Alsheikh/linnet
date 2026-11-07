"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { springs, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A formatted amount whose changed digits roll (linnet-motion recipe 1).
 * Slots are keyed by their position from the right, so the decimals stay
 * put and a new leading digit simply appears. Only digits move: the
 * currency sign and separators swap in place. The first render is static,
 * and under reduced motion every change is a plain swap. The DOM is the same
 * either way, so the server HTML always hydrates cleanly. `delay` (seconds)
 * offsets the whole roll, for the pricing cards' left-to-right stagger.
 * Needs a LazyMotion provider above it.
 */
export function DigitRoll({
  value,
  className,
  delay = 0,
  anchor = "end",
}: {
  value: string;
  className?: string;
  delay?: number;
  /** "end" keys slots from the right (amounts with decimals); "start" from the left (left-aligned whole prices). */
  anchor?: "start" | "end";
}) {
  const reduce = useReducedMotion() ?? false;
  const chars = [...value];

  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((char, index) => {
          const fromRight = chars.length - 1 - index;
          const key = anchor === "end" ? fromRight : index;
          return <Slot key={key} char={char} delay={delay + fromRight * stagger.digits} still={reduce} />;
        })}
      </span>
    </span>
  );
}

function Slot({ char, delay, still }: { char: string; delay: number; still: boolean }) {
  if (!/\d/.test(char)) return <span className="inline-block whitespace-pre">{char}</span>;
  return (
    // clip-path, not overflow: an overflow box would move the baseline.
    <span className="relative inline-block [clip-path:inset(-0.1em_0)]">
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={char}
          className="inline-block"
          initial={still ? false : { y: "40%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={still ? undefined : { y: "-40%", opacity: 0 }}
          transition={{ ...springs.digit, delay }}
        >
          {char}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
