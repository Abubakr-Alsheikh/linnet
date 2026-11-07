"use client";

import { PlusIcon } from "lucide-react";
import { LazyMotion, MotionConfig, m, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { demoDefaults } from "@/lib/content/demo-defaults";
import type { DemoContent } from "@/lib/content/schemas";
import { fill } from "@/lib/content/template";
import { useToday } from "@/lib/hooks/useToday";
import { formatDate, formatTime, invoiceDates } from "@/lib/invoice/dates";
import {
  MAX_LINES,
  MIN_LINES,
  SCHEDULE,
  createDemoState,
  demoReducer,
  evaluate,
  sendBlocker,
  type LineField,
} from "@/lib/invoice/demo-machine";
import type { InvoiceFieldSchemas } from "@/lib/invoice/field-schemas";
import { formatHundredths, formatShort, parseQuantity, parseRate, parseTaxRate } from "@/lib/invoice/parse";
import { formatMoney, type Currency } from "@/lib/money";
import { durations, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Activity, type ActivityRow } from "./Activity";
import { LineGroups, LineTable } from "./LineItems";
import { StatusChip } from "./StatusChip";
import { Totals } from "./Totals";

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

const TOTAL_ANNOUNCE_DELAY = 600;
const TAX_STEP = 50; // 0.5% in basis points

/** Finds the copy of an element that is displayed (the line table or the line groups). */
function visible(root: HTMLElement | null, selector: string): HTMLElement | null {
  if (!root) return null;
  return [...root.querySelectorAll<HTMLElement>(selector)].find((element) => element.getClientRects().length > 0) ?? null;
}

/**
 * The hero's working invoice. Edit lines, client, currency, terms and tax;
 * the totals add up in integer minor units; Send runs draft -> sent ->
 * viewed -> paid in 2.4 s and ends on the PAID stamp. State lives in the
 * pure reducer in src/lib/invoice/demo-machine.ts; this component renders
 * it, runs one timer per step, moves focus and speaks through a polite live
 * region. Every word comes from demo.mdx.
 */
export function InvoiceDemo({ content }: { content: DemoContent }) {
  const defaults = useMemo(() => demoDefaults(content), [content]);
  const [state, dispatch] = useReducer(demoReducer, defaults, createDemoState);
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [message, setMessage] = useState({ text: "", key: 0 });
  const [nudge, setNudge] = useState(false);
  const reduce = useReducedMotion() ?? false;
  const today = useToday();
  const root = useRef<HTMLDivElement>(null);
  const totalTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();

  // Zod and the field schemas load on the first focus inside the invoice,
  // not before LCP. Errors only show after a field loses focus, so they are
  // ready by then.
  const [validation, setValidation] = useState<{
    schemas: InvoiceFieldSchemas;
    fieldError: typeof import("@/lib/invoice/field-schemas").fieldError;
  } | null>(null);
  const validationRequested = useRef(false);
  const loadValidation = useCallback(() => {
    if (validationRequested.current) return;
    validationRequested.current = true;
    void import("@/lib/invoice/field-schemas").then((mod) =>
      setValidation({ schemas: mod.invoiceFieldSchemas(content.errors), fieldError: mod.fieldError }),
    );
  }, [content.errors]);

  const { totals } = evaluate(state);
  const blocker = state.status === "draft" ? sendBlocker(state) : null;
  const locked = state.status !== "draft";
  const client = content.clients.find((candidate) => candidate.id === state.clientId) ?? content.clients[0];
  const money = (minor: number) => formatMoney(minor, state.currency);
  const totalText = money(totals.total);
  const dates = today ? invoiceDates(today, state.termsDays) : null;

  const announce = useCallback((text: string) => setMessage((previous) => ({ text, key: previous.key + 1 })), []);

  // The total is read when the timer fires, so it is always the latest one.
  const latestTotal = useRef(totalText);
  useEffect(() => {
    latestTotal.current = totalText;
  });
  const scheduleTotalAnnouncement = useCallback(() => {
    clearTimeout(totalTimer.current);
    totalTimer.current = setTimeout(
      () => announce(fill(content.announce.total, { total: latestTotal.current })),
      TOTAL_ANNOUNCE_DELAY,
    );
  }, [announce, content.announce.total]);
  useEffect(() => () => clearTimeout(totalTimer.current), []);

  // One timer per step of the send sequence; cleared on unmount.
  const sentText = fill(content.announce.sent, { client: client.name });
  const paidText = fill(content.announce.paid, { total: totalText });
  useEffect(() => {
    const step = SCHEDULE[state.status];
    if (!step) return;
    const timer = setTimeout(() => {
      dispatch({ type: "advance", at: Date.now() });
      if (step.next === "sent") announce(sentText);
      if (step.next === "paid") announce(paidText);
    }, step.after);
    return () => clearTimeout(timer);
  }, [state.status, announce, sentText, paidText]);

  const fieldKey = (lineId: string, field: string) => `${lineId}:${field}`;
  const isShown = (key: string) => showAllErrors || touched.has(key);
  const touch = (key: string) => setTouched((previous) => (previous.has(key) ? previous : new Set(previous).add(key)));

  const errorFor = (lineId: string, field: LineField) => {
    if (!isShown(fieldKey(lineId, field))) return null;
    const line = state.lines.find((candidate) => candidate.id === lineId);
    return line && validation ? validation.fieldError(validation.schemas[field], line[field]) : null;
  };
  const taxError =
    isShown("tax") && validation ? validation.fieldError(validation.schemas.taxRate, state.taxRate) : null;

  const onLineChange = (lineId: string, field: LineField, value: string) => {
    dispatch({ type: "editLine", id: lineId, field, value });
    if (field !== "description") scheduleTotalAnnouncement();
  };

  // On leaving a valid number, show it in its tidy form ("95" -> "95.00").
  const onLineBlur = (lineId: string, field: LineField) => {
    touch(fieldKey(lineId, field));
    const line = state.lines.find((candidate) => candidate.id === lineId);
    if (!line || locked || field === "description") return;
    const parsed = field === "quantity" ? parseQuantity(line.quantity) : parseRate(line.rate);
    if (parsed === null) return;
    const tidy = field === "quantity" ? formatShort(parsed) : formatHundredths(parsed);
    if (tidy !== line[field]) dispatch({ type: "editLine", id: lineId, field, value: tidy });
  };

  const onAddLine = () => {
    if (locked || state.lines.length >= MAX_LINES) return;
    const newId = `line-${state.nextLineId}`;
    dispatch({ type: "addLine" });
    announce(fill(content.announce.added, { n: state.lines.length + 1 }));
    requestAnimationFrame(() => visible(root.current, `[data-line="${newId}"][data-field="description"]`)?.focus());
  };

  const onRemoveLine = (lineId: string, index: number) => {
    if (locked || state.lines.length <= MIN_LINES) return;
    dispatch({ type: "removeLine", id: lineId });
    announce(fill(content.announce.removed, { n: index + 1 }));
    scheduleTotalAnnouncement();
    const previous = index > 0 && state.lines.length - 1 > MIN_LINES ? state.lines[index - 1] : null;
    requestAnimationFrame(() => {
      const target = previous
        ? visible(root.current, `[data-line="${previous.id}"][data-field="remove"]`)
        : visible(root.current, '[data-field="add"]');
      target?.focus();
    });
  };

  const onClient = (clientId: string) => {
    const next = content.clients.find((candidate) => candidate.id === clientId);
    if (!next) return;
    dispatch({ type: "setClient", clientId: next.id, currency: next.currency });
    scheduleTotalAnnouncement();
  };

  const onTaxBlur = () => {
    touch("tax");
    const parsed = parseTaxRate(state.taxRate);
    if (parsed !== null && !locked) dispatch({ type: "setTaxRate", value: formatShort(parsed) });
  };

  const onTaxStep = (direction: 1 | -1) => {
    const current = parseTaxRate(state.taxRate) ?? 0;
    const next = Math.min(3000, Math.max(0, Math.round(current / TAX_STEP) * TAX_STEP + direction * TAX_STEP));
    dispatch({ type: "setTaxRate", value: formatShort(next) });
    scheduleTotalAnnouncement();
  };

  // One button: Send, then Sending… and Sent while locked, then Start a new
  // invoice. Keeping one element keeps keyboard focus on it all the way.
  const onAction = () => {
    if (state.status === "paid") {
      dispatch({ type: "reset", defaults });
      setTouched(new Set());
      setShowAllErrors(false);
      setNudge(false);
      announce(content.announce.reset);
      return;
    }
    if (locked) return;
    if (blocker === "invalid") {
      setShowAllErrors(true);
      requestAnimationFrame(() => visible(root.current, '[aria-invalid="true"]')?.focus());
      return;
    }
    if (blocker) return;
    clearTimeout(totalTimer.current);
    dispatch({ type: "send" });
    announce(fill(content.announce.sending, { client: client.name }));
  };

  const actionLabel = {
    draft: content.actions.send,
    sending: content.actions.sending,
    sent: content.actions.sent,
    viewed: content.actions.sent,
    paid: content.actions.reset,
  }[state.status];
  const hint = locked
    ? content.hints.locked
    : blocker === "invalid"
      ? content.hints.invalid
      : blocker === "zero"
        ? content.hints.zeroTotal
        : "";
  const actionDisabled = state.status !== "paid" && (locked || blocker !== null);

  const activityRows: ActivityRow[] = state.activity.map((event) => ({
    kind: event.kind,
    time: formatTime(new Date(event.at)),
    text:
      event.kind === "sent"
        ? fill(content.activity.sent, { email: client.email })
        : event.kind === "viewed"
          ? fill(content.activity.viewed, { client: client.name })
          : content.activity.paid,
  }));
  const paidAt = state.activity.find((event) => event.kind === "paid")?.at;

  const ids = {
    title: `${id}-title`,
    billTo: `${id}-bill-to`,
    terms: `${id}-terms`,
    currency: `${id}-currency`,
    tax: `${id}-tax`,
    hint: `${id}-hint`,
    limit: `${id}-limit`,
  };
  const metaLabel = "text-sm text-ink-muted";
  const linesProps = {
    lines: state.lines,
    amounts: totals.lines.map(money),
    labels: { ...content.columns, group: content.line.label, remove: content.line.remove },
    locked,
    canRemove: state.lines.length > MIN_LINES,
    errorFor,
    onChange: onLineChange,
    onBlur: onLineBlur,
    onRemove: onRemoveLine,
    idFor: (view: string, lineId: string, field: string) => `${id}-${view}-${lineId}-${field}`,
  };
  const atLimit = state.lines.length >= MAX_LINES;

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <div
          ref={root}
          role="group"
          aria-labelledby={ids.title}
          className="mx-auto w-full max-w-[640px]"
          onFocusCapture={loadValidation}
          onPointerEnter={loadValidation}
        >
          <m.div
            className="rounded-paper border border-line bg-surface p-6 shadow-paper sm:p-8"
            animate={{ y: nudge && !reduce ? [0, 2, 0] : 0 }}
            transition={{ duration: durations.press * 2, ease: ease.out }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={ids.title} className="font-display text-h3 font-bold">
                  {content.title}
                </h2>
                <p className="text-sm text-ink-muted tabular-nums">{content.number}</p>
              </div>
              <StatusChip status={state.status} labels={content.status} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="flex flex-col">
                <p className={metaLabel}>{content.from.label}</p>
                <p className="flex h-11 items-center font-semibold md:h-10">{content.from.name}</p>
                <p className="text-sm text-ink-muted">{content.from.line}</p>
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor={ids.billTo} className={metaLabel}>
                  {content.billTo}
                </label>
                <NativeSelect
                  id={ids.billTo}
                  variant="inline"
                  value={state.clientId}
                  onChange={(event) => onClient(event.target.value)}
                  disabled={locked}
                  className="font-semibold"
                >
                  {content.clients.map((option) => (
                    <NativeSelectOption key={option.id} value={option.id}>
                      {option.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <p className="truncate text-sm text-ink-muted">
                  {fill(content.contact, { email: client.email, city: client.city })}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <div className="flex flex-col">
                <p className={metaLabel}>{content.issued}</p>
                <p className="flex h-11 items-center text-sm tabular-nums md:h-10">{dates ? formatDate(dates.issued) : " "}</p>
              </div>
              <div className="flex flex-col">
                <p className={metaLabel}>{content.due}</p>
                <p className="flex h-11 items-center text-sm tabular-nums md:h-10">{dates ? formatDate(dates.due) : " "}</p>
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor={ids.terms} className={metaLabel}>
                  {content.terms.label}
                </label>
                <NativeSelect
                  id={ids.terms}
                  variant="inline"
                  value={String(state.termsDays)}
                  onChange={(event) => dispatch({ type: "setTerms", days: Number(event.target.value) })}
                  disabled={locked}
                  className="md:text-sm"
                >
                  {content.terms.options.map((option) => (
                    <NativeSelectOption key={option.days} value={String(option.days)}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex min-w-0 flex-col">
                <label htmlFor={ids.currency} className={metaLabel}>
                  {content.currency.label}
                </label>
                <NativeSelect
                  id={ids.currency}
                  variant="inline"
                  value={state.currency}
                  onChange={(event) => {
                    dispatch({ type: "setCurrency", currency: event.target.value as Currency });
                    scheduleTotalAnnouncement();
                  }}
                  disabled={locked}
                  className="md:text-sm"
                >
                  {content.currency.options.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="mt-8">
              <LineTable {...linesProps} />
              <LineGroups {...linesProps} />
              <div className={cn("mt-2 flex flex-wrap items-center gap-x-3 gap-y-1", locked && "invisible")}>
                <Button
                  variant="ghost"
                  data-field="add"
                  aria-disabled={atLimit || undefined}
                  aria-describedby={atLimit ? ids.limit : undefined}
                  className="-ml-3 px-3"
                  onClick={onAddLine}
                >
                  <PlusIcon />
                  {content.line.add}
                </Button>
                {atLimit && (
                  <p id={ids.limit} className="text-sm text-ink-muted">
                    {content.line.limit}
                  </p>
                )}
              </div>
            </div>

            <Totals
              labels={content.totals}
              subtotal={money(totals.subtotal)}
              tax={money(totals.tax)}
              total={totalText}
              taxRate={state.taxRate}
              taxRateId={ids.tax}
              taxError={taxError}
              locked={locked}
              stamp={state.status === "paid" && paidAt ? { word: content.stamp, date: formatDate(new Date(paidAt)) } : null}
              onTaxRate={(value) => {
                dispatch({ type: "setTaxRate", value });
                scheduleTotalAnnouncement();
              }}
              onTaxBlur={onTaxBlur}
              onTaxStep={onTaxStep}
              onStampSettled={() => setNudge(true)}
            />

            <Activity rows={activityRows} />
          </m.div>

          <div className="mt-5 flex flex-col items-start gap-2">
            <Button
              variant={state.status === "paid" ? "secondary" : "ink"}
              aria-disabled={actionDisabled || undefined}
              aria-describedby={hint ? ids.hint : undefined}
              className="min-w-44"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
            <p id={ids.hint} className="min-h-10 text-sm text-ink-muted sm:min-h-5">
              {hint}
            </p>
          </div>

          <p role="status" className="sr-only">
            <span key={message.key}>{message.text}</span>
          </p>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
