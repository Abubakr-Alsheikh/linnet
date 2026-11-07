/**
 * Calendar dates for the demo, in the visitor's own time zone. Formatting is
 * fixed ("6 Nov 2026", "14:05") rather than left to Intl, because en-GB in
 * current ICU writes September as "Sept" and the COPY style is three letters.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Midnight at the start of the given moment's local day. */
export function startOfDay(moment: Date): Date {
  return new Date(moment.getFullYear(), moment.getMonth(), moment.getDate());
}

/** The local day `days` after `day`. Month ends, leap days and clock changes roll over correctly. */
export function addDays(day: Date, days: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + days);
}

/** Issue date and due date for payment terms of `termsDays` days. */
export function invoiceDates(now: Date, termsDays: number): { issued: Date; due: Date } {
  const issued = startOfDay(now);
  return { issued, due: addDays(issued, termsDays) };
}

/** "6 Nov 2026". */
export function formatDate(day: Date): string {
  return `${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`;
}

/** "14:05", 24-hour. */
export function formatTime(moment: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(moment.getHours())}:${pad(moment.getMinutes())}`;
}

/** A local day as "2026-11-06", for a stable snapshot that changes only at midnight. */
export function dayKey(moment: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`;
}

/** The inverse of dayKey: local midnight of that day. */
export function fromDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
