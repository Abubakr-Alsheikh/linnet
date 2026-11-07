import { StatusGlyph } from "@/components/icons/StatusGlyph";
import type { Feature } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";
import { at, chip, draw, fade, land, pop, press, rise, slideIn } from "./steps";

/*
 * The six feature diagrams (linnet-design section 8). Server components:
 * plain HTML and inline SVG in their final frame, tokens only, every string
 * from the feature's MDX `figure`. The step classes and `at(n)` describe how
 * each part enters when DiagramFrame plays it. The frame carries role="img"
 * and the label, so screen readers hear the description, not these parts.
 */

type Figure<D extends Feature["diagram"]> = Extract<Feature, { diagram: D }>["figure"];

const PAPER = "rounded-md border border-line bg-surface";
const positive = "bg-positive-tint text-positive";

/** Tracked blocks slide in and close into one bar, then the invoice line and its amount. */
function HoursDiagram({ figure }: { figure: Figure<"hours"> }) {
  const hours = figure.blocks.map((block) => Number.parseFloat(block));
  const total = hours.reduce((sum, value) => sum + value, 0);
  return (
    <div className="flex h-full flex-col justify-center px-5 sm:px-7">
      <div className="flex h-9">
        {figure.blocks.map((block, index) => (
          <span
            key={block}
            style={{ ...at(index), width: `${(hours[index] / total) * 100}%` }}
            className={cn(
              slideIn,
              "flex items-center justify-center border border-line bg-surface-2 text-xs font-semibold tabular-nums first:rounded-l-md last:rounded-r-md not-first:-ml-px",
            )}
          >
            {block}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 2 24" preserveAspectRatio="none" className="mx-auto h-5 w-0.5 text-control" aria-hidden="true">
        <path d="M1 0v24" stroke="currentColor" strokeWidth="2" pathLength={1} style={at(3)} className={draw} />
      </svg>
      <div style={at(3)} className={cn(rise, PAPER, "px-3 py-2.5")}>
        <p className="text-xs font-semibold">{figure.line}</p>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-ink-muted tabular-nums">
          <span>{figure.quantity}</span>
          <span style={at(4)} className={cn(fade, "rounded-sm bg-brand-tint px-1.5 py-0.5 font-semibold text-ink")}>
            {figure.amount}
          </span>
        </div>
      </div>
    </div>
  );
}

/** A schedule line draws, three points light in turn, and the last reminder is cancelled: paid. */
function RemindersDiagram({ figure }: { figure: Figure<"reminders"> }) {
  const last = figure.steps.length - 1;
  return (
    <div className="flex h-full items-center px-6 sm:px-8">
      <ol className="relative flex flex-col gap-4">
        <svg
          viewBox="0 0 2 100"
          preserveAspectRatio="none"
          className="absolute top-1.5 bottom-1.5 left-[5px] w-0.5 text-control"
          aria-hidden="true"
        >
          <path d="M1 0v100" stroke="currentColor" strokeWidth="2" pathLength={1} style={at(0)} className={draw} />
        </svg>
        {figure.steps.map((step, index) => (
          <li key={step} className="relative flex items-center gap-3 text-xs">
            <span className="relative size-3 shrink-0 rounded-full border-[1.5px] border-control bg-canvas">
              {index < last && <span style={at(index + 1)} className={cn(pop, "absolute -inset-[1.5px] rounded-full bg-ink")} />}
            </span>
            <span className={index < last ? "font-semibold" : "text-ink-muted line-through"}>{step}</span>
            {index === last && (
              <span style={at(4)} className={cn(land, chip, positive)}>
                <StatusGlyph name="paid" className="size-3" />
                {figure.cancelled}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Pay is pressed, card and bank transfer appear, card is picked, the invoice turns Paid. */
function PaymentsDiagram({ figure }: { figure: Figure<"payments"> }) {
  return (
    <div className="flex h-full items-center justify-center px-5">
      <div className={cn(PAPER, "w-full max-w-60 p-3")}>
        <div className="flex h-5 items-center justify-between">
          <span className="h-2 w-14 rounded-sm bg-surface-2" />
          <span style={at(3)} className={cn(land, chip, positive)}>
            <StatusGlyph name="paid" className="size-3" />
            {figure.paid}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          <span className="h-1.5 w-full rounded-sm bg-surface-2" />
          <span className="h-1.5 w-2/3 rounded-sm bg-surface-2" />
        </div>
        <span
          style={at(0)}
          className={cn(press, "mt-3 flex h-7 items-center justify-center rounded-md bg-ink text-xs font-semibold text-canvas tabular-nums")}
        >
          {figure.pay}
        </span>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
          <span style={at(1)} className={cn(rise, "relative flex h-7 items-center justify-center rounded-md border border-line font-semibold")}>
            {figure.card}
            <span style={at(2)} className={cn(fade, "absolute -inset-px rounded-md border-[1.5px] border-ink")} />
          </span>
          <span style={at(1)} className={cn(rise, "flex h-7 items-center justify-center rounded-md border border-line text-ink-muted")}>
            {figure.transfer}
          </span>
        </div>
      </div>
    </div>
  );
}

/** The same total in euro, pounds and dollars, then the day's rate. */
function CurrenciesDiagram({ figure }: { figure: Figure<"currencies"> }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 px-5">
      {figure.amounts.map((amount, index) => (
        <span
          key={amount}
          style={at(index)}
          className={cn(
            rise,
            PAPER,
            "flex h-8 w-44 items-center justify-end px-3 text-sm font-semibold tabular-nums",
            index === 0 && "border-brand-tint bg-brand-tint",
          )}
        >
          {amount}
        </span>
      ))}
      <span style={at(3)} className={cn(fade, "mt-1.5 text-xs text-ink-muted")}>
        {figure.rate}
      </span>
    </div>
  );
}

/** A month strip: October's retainer leaves on the 1st and is paid; November's leaves on its 1st. */
function RetainersDiagram({ figure }: { figure: Figure<"retainers"> }) {
  return (
    <div className="flex h-full items-center px-5 sm:px-7">
      <ol className="relative flex w-full flex-col gap-5">
        <span aria-hidden="true" className="absolute top-2.5 bottom-2.5 left-[5px] w-0.5 bg-line-strong" />
        {figure.months.map((month, index) => (
          <li key={month} className="relative grid grid-cols-[auto_1fr] items-start gap-x-3">
            <span className="mt-1.5 size-3 rounded-full border-[1.5px] border-ink bg-canvas" />
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <span className="text-xs font-semibold tabular-nums">{month}</span>
              <span
                style={at(index === 0 ? 0 : 2)}
                className={cn(rise, PAPER, "px-2.5 py-1.5 text-xs whitespace-nowrap tabular-nums")}
              >
                {figure.invoice}
              </span>
              {index === 0 && (
                <span style={at(1)} className={cn(land, chip, positive)}>
                  <StatusGlyph name="paid" className="size-3" />
                  {figure.paid}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Three invoices slide toward a file, the arrow draws, the file shows its name. */
function ExportDiagram({ figure }: { figure: Figure<"export"> }) {
  return (
    <div className="flex h-full items-center justify-center gap-3 px-5">
      <div className="flex flex-col gap-1.5">
        {figure.invoices.map((invoice, index) => (
          <span key={invoice} style={at(index)} className={cn(slideIn, PAPER, "px-2 py-1 text-xs font-semibold tabular-nums")}>
            {invoice}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 32 12" className="w-8 shrink-0 text-control" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 6h28M25 2l4 4-4 4" pathLength={1} style={at(3)} className={draw} />
      </svg>
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 40 48" className="h-14 w-12 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2h20l8 8v36H6z" className="fill-surface" />
          <path d="M26 2v8h8" />
          <path d="M11 20h18M11 27h18M11 34h18M19 16v22" className="text-line-strong" stroke="currentColor" />
        </svg>
        <span style={at(4)} className={cn(rise, "rounded-sm bg-brand-tint px-1.5 py-0.5 text-xs font-semibold tabular-nums")}>
          {figure.file}
        </span>
      </div>
    </div>
  );
}

/** The drawing for a feature, chosen by its `diagram` id. */
export function Diagram({ feature }: { feature: Feature }) {
  switch (feature.diagram) {
    case "hours":
      return <HoursDiagram figure={feature.figure} />;
    case "reminders":
      return <RemindersDiagram figure={feature.figure} />;
    case "payments":
      return <PaymentsDiagram figure={feature.figure} />;
    case "currencies":
      return <CurrenciesDiagram figure={feature.figure} />;
    case "retainers":
      return <RetainersDiagram figure={feature.figure} />;
    case "export":
      return <ExportDiagram figure={feature.figure} />;
  }
}
