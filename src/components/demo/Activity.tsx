"use client";

import { AnimatePresence, m } from "motion/react";
import { StatusGlyph } from "@/components/icons/StatusGlyph";
import type { ActivityKind } from "@/lib/invoice/demo-machine";
import { durations } from "@/lib/motion";

export interface ActivityRow {
  kind: ActivityKind;
  text: string;
  time: string;
}

/**
 * What happened after Send, one line per event. The list always reserves
 * room for its three lines, so the sheet never grows while the sequence
 * plays (the steps land 600 ms and more after the click, past the window
 * in which the browser forgives layout shifts).
 */
export function Activity({ rows }: { rows: ActivityRow[] }) {
  return (
    <ol aria-hidden={rows.length === 0 || undefined} className="mt-6 flex min-h-22 flex-col gap-2 text-xs sm:text-sm">
      <AnimatePresence initial={false}>
        {rows.map((row) => (
          <m.li
            key={row.kind}
            className="flex h-6 items-center gap-2"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.quick }}
          >
            <StatusGlyph name={row.kind} className={row.kind === "paid" ? "text-positive" : "text-ink-muted"} />
            <span className="min-w-0 truncate">{row.text}</span>
            <span className="ml-auto pl-2 text-ink-muted tabular-nums">{row.time}</span>
          </m.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
