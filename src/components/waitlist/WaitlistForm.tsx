"use client";

import { CircleAlertIcon } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { WaitlistContent } from "@/lib/content/schemas";
import { fill, splitAround } from "@/lib/content/template";
import { cn } from "@/lib/utils";
import type { Team, WaitlistCurrency, WaitlistErrors, WaitlistField, WaitlistValues } from "@/lib/waitlist";

type Status = "idle" | "sending" | "success" | "failure";

/** Zod and the submit helper load on the first focus or press inside the form, not before LCP. */
const loadWaitlist = () => import("@/lib/waitlist");

/** Fields in page order, for moving focus to the first invalid one. */
const FIELD_ORDER: WaitlistField[] = ["email", "name", "currency", "team", "note"];

const noSubscribe = () => () => {};

function Message({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-negative">
      <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

/**
 * The waitlist form (linnet-quality section 7). It posts to Netlify Forms
 * through /__forms.html, where the form is declared; the React form carries
 * none of Netlify's form attributes. Without JavaScript it submits natively
 * to the same path, with the browser's own required and email checks. With
 * JavaScript it validates on blur and on submit, moves focus to the first
 * invalid field, posts by fetch, then either replaces itself with the
 * success message (which takes focus) or keeps every value and shows the
 * failure panel with a way to reach the owner.
 */
export function WaitlistForm({ content, contactUrl }: { content: WaitlistContent; contactUrl: string }) {
  const { fields } = content;
  const [values, setValues] = useState<WaitlistValues>({
    name: "",
    email: "",
    team: fields.team.default as Team,
    currency: fields.currency.default as WaitlistCurrency,
    note: "",
    "bot-field": "",
  });
  const [teamChosen, setTeamChosen] = useState(false);
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const [touched, setTouched] = useState<ReadonlySet<WaitlistField>>(() => new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [sentName, setSentName] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const waitlistModule = useRef<ReturnType<typeof loadWaitlist>>(undefined);
  const load = useCallback(() => (waitlistModule.current ??= loadWaitlist()), []);
  const id = useId();

  // A pricing card links to /?team=<tier>#waitlist; that preselects "How do you work?" until the visitor picks.
  const urlTeam = useSyncExternalStore(
    noSubscribe,
    () => {
      const team = new URLSearchParams(window.location.search).get("team");
      return fields.team.options.some((option) => option.value === team) ? (team as Team) : null;
    },
    () => null,
  );
  const current: WaitlistValues = { ...values, team: teamChosen ? values.team : (urlTeam ?? values.team) };

  // Once hydrated, this script validates; before that, the browser's own checks run.
  useEffect(() => {
    if (form.current) form.current.noValidate = true;
  }, []);

  useEffect(() => {
    if (status === "success") heading.current?.focus();
  }, [status]);

  const validate = async (next: WaitlistValues, only?: WaitlistField) => {
    const waitlist = await load();
    const result = waitlist.validateWaitlist(next, content.errors);
    const found = result.ok ? {} : result.errors;
    if (only) setErrors((previous) => ({ ...previous, [only]: found[only] }));
    else setErrors(found);
    return result;
  };

  const update = (field: WaitlistField, value: string) => {
    const next = { ...current, [field]: value } as WaitlistValues;
    setValues(next);
    if (touched.has(field)) void validate(next, field);
  };

  const leave = (field: WaitlistField) => {
    setTouched((previous) => (previous.has(field) ? previous : new Set(previous).add(field)));
    void validate(current, field);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const result = await validate(current);
    if (!result.ok) {
      setTouched(new Set(FIELD_ORDER));
      const first = FIELD_ORDER.find((field) => result.errors[field]);
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      return;
    }
    setStatus("sending");
    try {
      const waitlist = await load();
      await waitlist.submitWaitlist(result.data);
      setSentName(result.data.name);
      setStatus("success");
    } catch {
      setStatus("failure");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
        <h3 ref={heading} tabIndex={-1} className="font-display text-h3 font-bold">
          {sentName ? fill(content.success.headingNamed, { name: sentName }) : content.success.heading}
        </h3>
        <p className="mt-3 max-w-[60ch] text-pretty text-ink-muted">{content.success.body}</p>
      </div>
    );
  }

  const ids = (field: string) => ({ input: `${id}-${field}`, hint: `${id}-${field}-hint`, error: `${id}-${field}-error` });
  const describedBy = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ") || undefined;
  const shown = (field: WaitlistField) => (touched.has(field) ? errors[field] : undefined);
  const label = "block text-sm font-semibold text-ink";
  const optional = <span className="ml-2 font-normal text-ink-muted">{content.optional}</span>;
  const [failBefore, failLink, failAfter] = splitAround(content.failure.text, content.failure.link) ?? [content.failure.text, "", ""];
  const email = ids("email");
  const name = ids("name");
  const currency = ids("currency");
  const note = ids("note");
  const counterId = `${id}-note-counter`;

  return (
    <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
      <form
        ref={form}
        name="waitlist"
        method="POST"
        action="/__forms.html"
        onSubmit={onSubmit}
        onFocusCapture={() => void load()}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <input type="hidden" name="form-name" value="waitlist" />
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={`${id}-bot`}>{fields["bot-field"].label}</label>
          <input
            id={`${id}-bot`}
            type="text"
            name="bot-field"
            tabIndex={-1}
            autoComplete="off"
            value={current["bot-field"]}
            onChange={(event) => update("bot-field", event.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor={email.input} className={label}>
            {fields.email.label}
          </label>
          <Input
            id={email.input}
            name="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            value={current.email}
            aria-invalid={shown("email") ? true : undefined}
            aria-describedby={describedBy(fields.email.hint && email.hint, shown("email") && email.error)}
            onChange={(event) => update("email", event.target.value)}
            onBlur={() => leave("email")}
            className="mt-2"
          />
          {fields.email.hint && (
            <p id={email.hint} className="mt-2 text-sm text-ink-muted">
              {fields.email.hint}
            </p>
          )}
          {shown("email") && <Message id={email.error}>{shown("email")}</Message>}
        </div>

        <div>
          <label htmlFor={name.input} className={label}>
            {fields.name.label}
            {optional}
          </label>
          <Input
            id={name.input}
            name="name"
            type="text"
            autoComplete="name"
            value={current.name}
            aria-invalid={shown("name") ? true : undefined}
            aria-describedby={describedBy(shown("name") && name.error)}
            onChange={(event) => update("name", event.target.value)}
            onBlur={() => leave("name")}
            className="mt-2"
          />
          {shown("name") && <Message id={name.error}>{shown("name")}</Message>}
        </div>

        <div>
          <label htmlFor={currency.input} className={label}>
            {fields.currency.label}
          </label>
          <NativeSelect
            id={currency.input}
            name="currency"
            required
            value={current.currency}
            onChange={(event) => update("currency", event.target.value)}
            wrapperClassName="mt-2"
          >
            {fields.currency.options.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <fieldset className="md:col-span-2">
          <legend className={label}>{fields.team.label}</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {fields.team.options.map((option) => (
              <label
                key={option.value}
                className="group/option flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-control bg-surface px-3 py-2.5 text-sm font-semibold transition-colors duration-(--duration-press) hover:bg-surface-2 has-checked:border-ink has-checked:bg-surface-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
              >
                <input
                  type="radio"
                  name="team"
                  value={option.value}
                  checked={current.team === option.value}
                  onChange={() => {
                    setTeamChosen(true);
                    update("team", option.value);
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center rounded-full border border-control bg-surface group-has-checked/option:border-ink"
                >
                  <span className="size-2.5 rounded-full bg-ink opacity-0 group-has-checked/option:opacity-100" />
                </span>
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <label htmlFor={note.input} className={label}>
            {fields.note.label}
            {optional}
          </label>
          <Textarea
            id={note.input}
            name="note"
            value={current.note}
            aria-invalid={shown("note") ? true : undefined}
            aria-describedby={describedBy(counterId, shown("note") && note.error)}
            onChange={(event) => update("note", event.target.value)}
            onBlur={() => leave("note")}
            className="mt-2"
          />
          <p id={counterId} className="mt-2 text-right text-sm text-ink-muted tabular-nums">
            {fill(fields.note.counter, { n: current.note.length })}
          </p>
          {shown("note") && <Message id={note.error}>{shown("note")}</Message>}
        </div>

        {status === "failure" && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-negative-tint p-4 text-sm text-negative md:col-span-2">
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              {failBefore}
              {failLink && (
                <a href={contactUrl} className="font-semibold underline underline-offset-4">
                  {failLink}
                </a>
              )}
              {failAfter}
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <Button type="submit" aria-disabled={status === "sending" || undefined} className={cn("w-full sm:w-auto sm:min-w-48")}>
            {status === "sending" ? content.sending : content.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
