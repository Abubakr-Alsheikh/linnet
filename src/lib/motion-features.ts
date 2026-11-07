import { domAnimation } from "motion/react";

/**
 * Motion's animation features, loaded by LazyMotion after the demo hydrates
 * (`features={() => import("@/lib/motion-features").then((mod) => mod.default)}`).
 * `domAnimation` covers animate, exit, variants and gestures. Layout
 * animation (`domMax`) is left out on purpose: it would add about 15 KB
 * gzip to every client that animates.
 */
export default domAnimation;
