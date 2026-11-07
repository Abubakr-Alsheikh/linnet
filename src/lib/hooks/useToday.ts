import { useSyncExternalStore } from "react";
import { dayKey, fromDayKey } from "@/lib/invoice/dates";

const subscribe = () => () => {};

/**
 * The visitor's local day, or null on the server and during hydration.
 * The page prerenders once at build (Cache Components forbids `new Date()`
 * there), and the date must be the visitor's own, so dates render after
 * mount. The snapshot is a day key, which changes only at midnight; no timer
 * runs.
 */
export function useToday(): Date | null {
  const key = useSyncExternalStore(subscribe, () => dayKey(new Date()), () => null);
  return key === null ? null : fromDayKey(key);
}
