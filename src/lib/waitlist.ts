import { z } from "zod";

/**
 * The waitlist: its fields, their validation and the submission to Netlify
 * Forms. The form is declared in public/__forms.html, the only place Netlify
 * can find it at deploy time; the React form posts here by fetch, and
 * natively to the same path when JavaScript is off. Every name this module
 * sends must exist in that file (a test checks).
 *
 * The form imports this module on first focus or submit, so Zod stays out
 * of the first load. Error messages come in from waitlist.mdx.
 */

export const WAITLIST_FORM_NAME = "waitlist";
export const WAITLIST_ENDPOINT = "/__forms.html";
export const NAME_MAX = 80;
export const NOTE_MAX = 500;
export const TEAMS = ["solo", "studio", "agency"] as const;
export const WAITLIST_CURRENCIES = ["EUR", "USD", "GBP", "other"] as const;

export type Team = (typeof TEAMS)[number];
export type WaitlistCurrency = (typeof WAITLIST_CURRENCIES)[number];

export interface WaitlistValues {
  name: string;
  email: string;
  team: Team;
  currency: WaitlistCurrency;
  note: string;
  /** The honeypot. People never see it; bots fill it. */
  "bot-field": string;
}

export type WaitlistField = keyof WaitlistValues;
export type WaitlistErrors = Partial<Record<WaitlistField, string>>;

export interface WaitlistMessages {
  emailMissing: string;
  emailInvalid: string;
  nameLong: string;
  noteLong: string;
}

export function isTeam(value: unknown): value is Team {
  return typeof value === "string" && (TEAMS as readonly string[]).includes(value);
}

export function waitlistSchema(messages: WaitlistMessages) {
  return z.object({
    name: z.string().trim().max(NAME_MAX, messages.nameLong),
    email: z.string().trim().min(1, messages.emailMissing).pipe(z.email(messages.emailInvalid)),
    team: z.enum(TEAMS),
    currency: z.enum(WAITLIST_CURRENCIES),
    note: z.string().trim().max(NOTE_MAX, messages.noteLong),
    "bot-field": z.string(),
  });
}

export type ValidWaitlist = z.output<ReturnType<typeof waitlistSchema>>;

/** Parses the form's values; on failure, the first message for each field. */
export function validateWaitlist(
  values: WaitlistValues,
  messages: WaitlistMessages,
): { ok: true; data: ValidWaitlist } | { ok: false; errors: WaitlistErrors } {
  const result = waitlistSchema(messages).safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  const errors: WaitlistErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as WaitlistField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}

/** The urlencoded body Netlify Forms expects, with `form-name` first. */
export function encodeWaitlist(values: ValidWaitlist | WaitlistValues): string {
  return new URLSearchParams({
    "form-name": WAITLIST_FORM_NAME,
    "bot-field": values["bot-field"],
    name: values.name,
    email: values.email,
    team: values.team,
    currency: values.currency,
    note: values.note,
  }).toString();
}

/** Posts to Netlify Forms. Resolves on a 2xx; rejects on any other status or a network error. */
export async function submitWaitlist(values: ValidWaitlist | WaitlistValues, fetchImpl: typeof fetch = fetch): Promise<void> {
  const response = await fetchImpl(WAITLIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeWaitlist(values),
  });
  if (!response.ok) throw new Error(`Waitlist submission failed with status ${response.status}`);
}
