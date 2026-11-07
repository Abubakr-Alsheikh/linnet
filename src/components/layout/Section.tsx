import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const titleId = (id: string) => `${id}-title`;

/**
 * A page section: a region named by its h2, an anchor target that clears the
 * sticky header (`scroll-mt-20`), and focusable from script (tabIndex -1) so
 * links from the mobile nav can move focus to it.
 */
export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={titleId(id)}
      tabIndex={-1}
      className={cn("scroll-mt-20 py-20 outline-none lg:py-32", className)}
    >
      <div className="page-width">{children}</div>
    </section>
  );
}
