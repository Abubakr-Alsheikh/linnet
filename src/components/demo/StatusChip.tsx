"use client";

import { AnimatePresence, m } from "motion/react";
import { StatusGlyph, type GlyphName } from "@/components/icons/StatusGlyph";
import type { Status } from "@/lib/invoice/demo-machine";
import { durations } from "@/lib/motion";
import { cn } from "@/lib/utils";

const GLYPHS: Record<Status, GlyphName> = { draft: "draft", sending: "sent", sent: "sent", viewed: "viewed", paid: "paid" };

/**
 * Glyph and word on a tint, 24 px high. Every label sits invisibly in the
 * same grid cell, so the chip is as wide as its longest word and never
 * changes width; the visible word cross-fades.
 */
export function StatusChip({ status, labels }: { status: Status; labels: Record<Status, string> }) {
  const statuses = Object.keys(labels) as Status[];
  return (
    <span
      className={cn(
        "inline-grid h-6 shrink-0 items-center rounded-lg px-2 text-xs font-semibold",
        status === "paid" ? "bg-positive-tint text-positive" : "bg-surface-2",
        status === "draft" ? "text-ink-muted" : status !== "paid" && "text-ink",
      )}
    >
      {statuses.map((option) => (
        <span key={option} aria-hidden="true" className="invisible col-start-1 row-start-1 flex items-center gap-1.5">
          <StatusGlyph name={GLYPHS[option]} />
          {labels[option]}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <m.span
          key={status}
          className="col-start-1 row-start-1 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: durations.quick }}
        >
          <StatusGlyph name={GLYPHS[status]} />
          {labels[status]}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
