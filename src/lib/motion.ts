/**
 * Motion presets for the whole page (see the linnet-motion skill). Import
 * these instead of writing numbers in a component.
 *
 * CSS transitions and the tw-animate-css keyframes on the shadcn primitives
 * read the same durations from custom properties in globals.css
 * (`--duration-press`, `--duration-quick`, `--duration-base`), used as
 * `duration-(--duration-quick)`. `motion.test.ts` keeps the two in step.
 */

/** Seconds, as Motion expects. */
export const durations = { press: 0.12, quick: 0.18, base: 0.24, diagramStep: 0.42, diagram: 1.6 } as const;

/**
 * A feature diagram plays its steps 0 to DIAGRAM_LAST_STEP, each one
 * `stagger.diagram` after the last and lasting `durations.diagramStep`.
 * The diagrams run on CSS transitions (the `dg-step` utility in
 * globals.css), so the same numbers live there as custom properties.
 */
export const DIAGRAM_LAST_STEP = 4;

/** `out` matches `--ease-out-quint` in globals.css. */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const springs = {
  /** Toggles, rows, chips. */
  snappy: { type: "spring", stiffness: 520, damping: 42, mass: 0.9 },
  /** The digit roll on changing amounts and prices. */
  digit: { type: "spring", stiffness: 380, damping: 34, mass: 0.7 },
  /** One small overshoot, then rest. */
  stamp: { type: "spring", stiffness: 460, damping: 20, mass: 1 },
} as const;

/** Seconds between the items of one animation. */
export const stagger = { digits: 0.025, tiers: 0.04, diagram: 0.18 } as const;

/**
 * The demo's send sequence, in ms from the click. The reducer owns the
 * timeline and the tests read it. Keep the whole run under 3,000 ms.
 */
export const sendTimeline = { sending: 0, sent: 600, viewed: 1500, paid: 2400 } as const;
