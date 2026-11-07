"use client";

import { m, useReducedMotion } from "motion/react";
import { durations, springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The PAID stamp (linnet-design 5.1, linnet-motion recipe 3). It lands once
 * per send with one small overshoot and rests at -9°; `onSettled` lets the
 * sheet give its 2 px nudge. Under reduced motion it appears in place with
 * a 120 ms fade (`durations.press`). Render it inside AnimatePresence so
 * reset can fade it out.
 */
export function PaidStamp({
  word,
  date,
  className,
  onSettled,
}: {
  word: string;
  date: string;
  className?: string;
  onSettled?: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <m.p
      className={cn(
        "pointer-events-none flex flex-col items-center rounded-lg border-3 border-brand-ink px-3 pt-1 pb-1.5 text-brand-ink",
        className,
      )}
      initial={reduce ? { opacity: 0, rotate: -9, scale: 1 } : { opacity: 0, rotate: -14, scale: 1.6 }}
      animate={{ opacity: 1, rotate: -9, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: durations.quick } }}
      transition={reduce ? { duration: durations.press } : springs.stamp}
      onAnimationComplete={() => {
        if (!reduce) onSettled?.();
      }}
    >
      <span className="font-display text-h3 font-bold tracking-[0.08em]">{word}</span>
      <span className="text-xs font-semibold tabular-nums">{date}</span>
    </m.p>
  );
}
