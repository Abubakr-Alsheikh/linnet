import { sendTimeline } from "@/lib/motion";
import type { Currency } from "@/lib/money";
import { LIMITS, invoiceTotals, type Totals } from "./calc";
import { checkDescription, parseQuantity, parseRate, parseTaxRate } from "./parse";

/**
 * The hero demo's state: the invoice the visitor edits and the send
 * sequence draft -> sending -> sent -> viewed -> paid. The reducer is pure.
 * The component dispatches `advance` from one timer per step, using
 * SCHEDULE for the delays, and the activity times come in with the actions.
 */

export const STATUSES = ["draft", "sending", "sent", "viewed", "paid"] as const;
export type Status = (typeof STATUSES)[number];
export type LineField = "description" | "quantity" | "rate";
export type ActivityKind = "sent" | "viewed" | "paid";

/** Raw text as typed, so a half-typed "18," survives until it parses. */
export interface Line {
  id: string;
  description: string;
  quantity: string;
  rate: string;
}

export interface ActivityEvent {
  kind: ActivityKind;
  /** Epoch milliseconds. */
  at: number;
}

export interface DemoState {
  status: Status;
  clientId: string;
  currency: Currency;
  termsDays: number;
  taxRate: string;
  lines: Line[];
  nextLineId: number;
  activity: ActivityEvent[];
}

export interface DemoDefaults {
  clientId: string;
  currency: Currency;
  termsDays: number;
  taxRate: string;
  lines: Omit<Line, "id">[];
}

export type DemoAction =
  | { type: "editLine"; id: string; field: LineField; value: string }
  | { type: "addLine" }
  | { type: "removeLine"; id: string }
  | { type: "setClient"; clientId: string; currency: Currency }
  | { type: "setCurrency"; currency: Currency }
  | { type: "setTerms"; days: number }
  | { type: "setTaxRate"; value: string }
  | { type: "send" }
  | { type: "advance"; at: number }
  | { type: "reset"; defaults: DemoDefaults };

export const MIN_LINES = 1;
export const MAX_LINES = LIMITS.lines;

/** The next step after each timed status, with its delay in ms (from sendTimeline in motion.ts). */
export const SCHEDULE: Partial<Record<Status, { next: ActivityKind; after: number }>> = {
  sending: { next: "sent", after: sendTimeline.sent - sendTimeline.sending },
  sent: { next: "viewed", after: sendTimeline.viewed - sendTimeline.sent },
  viewed: { next: "paid", after: sendTimeline.paid - sendTimeline.viewed },
};

const lineId = (n: number) => `line-${n}`;

export function createDemoState(defaults: DemoDefaults): DemoState {
  return {
    status: "draft",
    clientId: defaults.clientId,
    currency: defaults.currency,
    termsDays: defaults.termsDays,
    taxRate: defaults.taxRate,
    lines: defaults.lines.map((line, index) => ({ ...line, id: lineId(index + 1) })),
    nextLineId: defaults.lines.length + 1,
    activity: [],
  };
}

export interface Evaluation {
  /** Invalid quantities, rates and tax rates count as zero. */
  totals: Totals;
  valid: boolean;
}

export function evaluate(state: DemoState): Evaluation {
  let valid = true;
  const numbers = state.lines.map((line) => {
    const quantity = parseQuantity(line.quantity);
    const rate = parseRate(line.rate);
    if (quantity === null || rate === null || checkDescription(line.description) !== null) valid = false;
    return { quantity: quantity ?? 0, rate: rate ?? 0 };
  });
  const taxRate = parseTaxRate(state.taxRate);
  if (taxRate === null) valid = false;
  return { totals: invoiceTotals(numbers, taxRate ?? 0), valid };
}

/** Why Send is unavailable in a draft, or null when it can go. */
export function sendBlocker(state: DemoState): "invalid" | "zero" | null {
  const { totals, valid } = evaluate(state);
  if (!valid) return "invalid";
  if (totals.total === 0) return "zero";
  return null;
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  const editable = state.status === "draft";

  switch (action.type) {
    case "editLine":
      if (!editable) return state;
      return {
        ...state,
        lines: state.lines.map((line) => (line.id === action.id ? { ...line, [action.field]: action.value } : line)),
      };
    case "addLine":
      if (!editable || state.lines.length >= MAX_LINES) return state;
      return {
        ...state,
        lines: [...state.lines, { id: lineId(state.nextLineId), description: "", quantity: "", rate: "" }],
        nextLineId: state.nextLineId + 1,
      };
    case "removeLine":
      if (!editable || state.lines.length <= MIN_LINES || !state.lines.some((line) => line.id === action.id)) return state;
      return { ...state, lines: state.lines.filter((line) => line.id !== action.id) };
    case "setClient":
      if (!editable) return state;
      return { ...state, clientId: action.clientId, currency: action.currency };
    case "setCurrency":
      if (!editable) return state;
      return { ...state, currency: action.currency };
    case "setTerms":
      if (!editable) return state;
      return { ...state, termsDays: action.days };
    case "setTaxRate":
      if (!editable) return state;
      return { ...state, taxRate: action.value };
    case "send":
      if (!editable || sendBlocker(state) !== null) return state;
      return { ...state, status: "sending" };
    case "advance": {
      const step = SCHEDULE[state.status];
      if (!step) return state;
      return { ...state, status: step.next, activity: [...state.activity, { kind: step.next, at: action.at }] };
    }
    case "reset":
      if (state.status !== "paid") return state;
      return createDemoState(action.defaults);
  }
}
