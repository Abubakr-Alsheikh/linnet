"use client";

import { CircleAlertIcon, XIcon } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { fill } from "@/lib/content/template";
import type { Line, LineField } from "@/lib/invoice/demo-machine";
import { durations } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DigitRoll } from "./DigitRoll";

/**
 * The invoice's lines, twice: a real table from `md`, and one labelled
 * group per line below it (description on its own row, then Qty, Rate and
 * Amount). Only one is displayed; the other is `display: none`, so it is out
 * of the tab order and the accessibility tree. Inputs carry `data-line` and
 * `data-field` so the demo can move focus to the visible copy.
 */

export interface LineLabels {
  description: string;
  quantity: string;
  quantityHint: string;
  rate: string;
  amount: string;
  group: string;
  remove: string;
}

export interface LinesProps {
  lines: Line[];
  amounts: string[];
  labels: LineLabels;
  locked: boolean;
  canRemove: boolean;
  errorFor: (lineId: string, field: LineField) => string | null;
  onChange: (lineId: string, field: LineField, value: string) => void;
  onBlur: (lineId: string, field: LineField) => void;
  onRemove: (lineId: string, index: number) => void;
  /** A unique id per view, line and field. */
  idFor: (view: "table" | "group", lineId: string, field: string) => string;
}

const ROW_MOTION = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: durations.quick },
} as const;

const FIELDS: LineField[] = ["description", "quantity", "rate"];

type CellInputProps = Omit<ComponentProps<"input">, "onChange"> & {
  lineId: string;
  field: LineField;
  error: string | null;
  errorId: string;
  locked: boolean;
  numeric?: boolean;
  onValue: (value: string) => void;
};

function CellInput({ lineId, field, error, errorId, locked, numeric, onValue, className, ...props }: CellInputProps) {
  return (
    <input
      type="text"
      autoComplete="off"
      spellCheck={false}
      inputMode={numeric ? "decimal" : undefined}
      readOnly={locked}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      data-line={lineId}
      data-field={field}
      onChange={(event) => onValue(event.target.value)}
      className={cn(
        "h-11 w-full min-w-0 rounded-sm border-0 border-b border-control bg-transparent px-2 text-base text-ink transition-colors duration-(--duration-press) hover:bg-surface-2 focus-visible:bg-surface-2 aria-invalid:border-negative read-only:border-transparent read-only:hover:bg-transparent md:h-10 md:text-sm",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** The messages for one line, each with the id its field points at. */
function LineErrors({ view, line, props }: { view: "table" | "group"; line: Line; props: LinesProps }) {
  const messages = FIELDS.map((field) => ({ field, message: props.errorFor(line.id, field) })).filter(
    (entry): entry is { field: LineField; message: string } => entry.message !== null,
  );
  if (messages.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 text-sm text-negative">
      {messages.map(({ field, message }) => (
        <li key={field} id={props.idFor(view, line.id, `${field}-error`)} className="flex items-start gap-1.5">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {message}
        </li>
      ))}
    </ul>
  );
}

function RemoveButton({ line, index, props, size }: { line: Line; index: number; props: LinesProps; size: "icon" | "icon-dense" }) {
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={fill(props.labels.remove, { n: index + 1 })}
      disabled={!props.canRemove}
      data-line={line.id}
      data-field="remove"
      className={cn("text-ink-muted hover:text-ink", props.locked && "invisible")}
      onClick={() => props.onRemove(line.id, index)}
    >
      <XIcon />
    </Button>
  );
}

function inputProps(view: "table" | "group", line: Line, field: LineField, props: LinesProps) {
  return {
    id: props.idFor(view, line.id, field),
    lineId: line.id,
    field,
    value: line[field],
    error: props.errorFor(line.id, field),
    errorId: props.idFor(view, line.id, `${field}-error`),
    locked: props.locked,
    numeric: field !== "description",
    onValue: (value: string) => props.onChange(line.id, field, value),
    onBlur: () => props.onBlur(line.id, field),
  };
}

export function LineTable(props: LinesProps) {
  const { labels } = props;
  const head = (column: string) => props.idFor("table", "head", column);
  return (
    <table className="w-full table-fixed border-collapse max-md:hidden">
      <colgroup>
        <col />
        <col className="w-16" />
        <col className="w-24" />
        <col className="w-28" />
        <col className="w-11" />
      </colgroup>
      <thead>
        <tr className="border-b border-line text-left text-xs font-semibold text-ink-muted">
          <th id={head("description")} scope="col" className="px-2 pb-2 font-semibold">
            {labels.description}
          </th>
          <th id={head("quantity")} scope="col" className="px-2 pb-2 text-right font-semibold">
            {labels.quantity}
            <span className="sr-only"> ({labels.quantityHint})</span>
          </th>
          <th id={head("rate")} scope="col" className="px-2 pb-2 text-right font-semibold">
            {labels.rate}
          </th>
          <th scope="col" className="px-2 pb-2 text-right font-semibold">
            {labels.amount}
          </th>
          <td />
        </tr>
      </thead>
      <AnimatePresence initial={false}>
        {props.lines.map((line, index) => (
          <m.tbody key={line.id} className="border-b border-line" {...ROW_MOTION}>
            <tr>
              {FIELDS.map((field) => (
                <td key={field} className="py-1.5 pr-1">
                  <CellInput aria-labelledby={head(field)} {...inputProps("table", line, field, props)} />
                </td>
              ))}
              <td className="px-2 py-1.5 text-right text-sm">
                <DigitRoll value={props.amounts[index]} />
              </td>
              <td className="py-1.5 text-right">
                <RemoveButton line={line} index={index} props={props} size="icon-dense" />
              </td>
            </tr>
            {FIELDS.some((field) => props.errorFor(line.id, field) !== null) && (
              <tr>
                <td colSpan={5} className="px-2 pb-3">
                  <LineErrors view="table" line={line} props={props} />
                </td>
              </tr>
            )}
          </m.tbody>
        ))}
      </AnimatePresence>
    </table>
  );
}

export function LineGroups(props: LinesProps) {
  const { labels } = props;
  const label = "text-xs font-semibold text-ink-muted";
  return (
    <div className="border-t border-line md:hidden">
      <AnimatePresence initial={false}>
        {props.lines.map((line, index) => (
          <m.div
            key={line.id}
            role="group"
            aria-label={fill(labels.group, { n: index + 1 })}
            className="flex flex-col gap-3 border-b border-line py-4"
            {...ROW_MOTION}
          >
            <div className="flex items-end gap-1">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor={props.idFor("group", line.id, "description")} className={label}>
                  {labels.description}
                </label>
                <CellInput {...inputProps("group", line, "description", props)} />
              </div>
              <RemoveButton line={line} index={index} props={props} size="icon" />
            </div>
            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor={props.idFor("group", line.id, "quantity")} className={label}>
                  {labels.quantity}
                  <span className="sr-only"> ({labels.quantityHint})</span>
                </label>
                <CellInput {...inputProps("group", line, "quantity", props)} />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor={props.idFor("group", line.id, "rate")} className={label}>
                  {labels.rate}
                </label>
                <CellInput {...inputProps("group", line, "rate", props)} />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className={cn(label, "text-right")}>{labels.amount}</span>
                <p className="flex h-11 items-center justify-end text-base">
                  <DigitRoll value={props.amounts[index]} />
                </p>
              </div>
            </div>
            <LineErrors view="group" line={line} props={props} />
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
