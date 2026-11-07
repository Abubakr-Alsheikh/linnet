/** The first stop on the page. Hidden until focused, then it sits over the header's top-left corner. */
export function SkipLink({ label, target }: { label: string; target: string }) {
  return (
    <a
      href={`#${target}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2.5 focus:left-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-lg focus:bg-ink focus:px-4 focus:text-sm focus:font-semibold focus:text-canvas"
    >
      {label}
    </a>
  );
}
