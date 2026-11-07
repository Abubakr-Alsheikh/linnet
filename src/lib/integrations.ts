/**
 * The integration categories, in page order. Content (integrations.mdx)
 * may only name these ids, and the icon map in
 * src/components/icons/IntegrationIcons.tsx must draw every one, so the
 * two can never drift apart. Categories only: no brand appears anywhere.
 */
export const INTEGRATION_IDS = [
  "bank-feeds",
  "card-payments",
  "bank-transfer",
  "accounting-export",
  "calendars",
  "email",
  "time-tracking",
  "api",
] as const;

export type IntegrationId = (typeof INTEGRATION_IDS)[number];
