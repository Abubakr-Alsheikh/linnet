import type { CSSProperties } from "react";

/*
 * Step classes for the feature diagrams (linnet-motion recipe 5). Each names
 * what an element looks like in the diagram's first frame; its resting
 * state, which the server renders, is plain. DiagramFrame puts
 * `data-phase="from"` on the frame to snap to the first frame and removes
 * it to play. `at(n)` delays a step by n × --diagram-stagger.
 */

const STEP = "dg-step group-data-[phase=from]/dg:transition-none";

/** Fades in. */
export const fade = `${STEP} group-data-[phase=from]/dg:opacity-0`;
/** Fades in while rising 8 px. */
export const rise = `${STEP} group-data-[phase=from]/dg:opacity-0 group-data-[phase=from]/dg:translate-y-2`;
/** Fades in while dropping 16 px into place. */
export const drop = `${STEP} group-data-[phase=from]/dg:opacity-0 group-data-[phase=from]/dg:-translate-y-4`;
/** Fades in while sliding 24 px to the right. */
export const slideIn = `${STEP} group-data-[phase=from]/dg:opacity-0 group-data-[phase=from]/dg:-translate-x-6`;
/** Grows from half size: a point lighting up. */
export const pop = `${STEP} group-data-[phase=from]/dg:opacity-0 group-data-[phase=from]/dg:scale-50`;
/** Shrinks into place from 125%: a chip landing, like the stamp. */
export const land = `${STEP} group-data-[phase=from]/dg:opacity-0 group-data-[phase=from]/dg:scale-125`;
/** Springs back from 90%: a button being pressed. */
export const press = `${STEP} group-data-[phase=from]/dg:scale-90`;
/** Draws an SVG path with pathLength={1} from start to end. */
export const draw = `${STEP} [stroke-dasharray:1] group-data-[phase=from]/dg:[stroke-dashoffset:1]`;

/** The step a diagram element plays at (0 to DIAGRAM_LAST_STEP in src/lib/motion.ts). */
export function at(step: number): CSSProperties {
  return { "--step": step } as CSSProperties;
}

/** A small status chip inside a diagram, with a glyph and a word. */
export const chip = "inline-flex h-5 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-semibold whitespace-nowrap";
