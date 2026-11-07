import { cn } from "@/lib/utils";

/**
 * The hero's invoice demo lands here in M2. The slot reserves the demo's box
 * now (a fixed min-height below `lg`, a fixed aspect ratio at `lg`), so the
 * hero copy never moves when the demo arrives or hydrates (CLS 0).
 */
export function DemoSlot({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-[56rem] flex-col sm:min-h-[48rem] lg:min-h-0 lg:aspect-[4/5]", className)}>
      <div className="mx-auto w-full max-w-[640px] flex-1 rounded-paper bg-surface shadow-paper" />
    </div>
  );
}
