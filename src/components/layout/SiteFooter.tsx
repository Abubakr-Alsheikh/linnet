import { layout } from "@/lib/content";
import { fill, splitAround } from "@/lib/content/template";
import { site } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const LINK = "underline decoration-line-strong underline-offset-4 transition-colors duration-(--duration-press) hover:decoration-brand";

/**
 * Wordmark and tagline, section links, the concept label with the
 * disclaimer (layout.mdx's body), then the copyright, credit and source.
 */
export function SiteFooter() {
  const { meta, Body: Disclaimer } = layout;
  const { footer } = meta;
  const [creditBefore, creditName, creditAfter] = splitAround(footer.credit, footer.creditLink) ?? [footer.credit, "", ""];

  return (
    <footer className="border-t border-line">
      <div className="page-width grid grid-cols-1 gap-10 py-14 md:grid-cols-12 md:gap-6 lg:py-20">
        <div className="flex flex-col gap-3 md:col-span-5">
          <Wordmark name={meta.wordmark} />
          <p className="max-w-[32ch] text-ink-muted">{meta.tagline}</p>
        </div>
        <nav aria-label={footer.label} className="md:col-span-3">
          <ul className="-my-3 grid grid-cols-2 gap-x-6 md:grid-cols-1">
            {footer.links.map((link) => (
              <li key={link.target}>
                <a
                  href={`#${link.target}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-ink transition-colors duration-(--duration-press) hover:text-brand-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2 md:col-span-4">
          <p className="text-sm font-semibold text-ink">{footer.concept}</p>
          <div className="text-sm text-ink-muted">
            <Disclaimer />
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="page-width flex flex-col gap-3 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="tabular-nums">{fill(footer.smallPrint, { year: site.buildYear })}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              {creditBefore}
              {creditName && (
                <a href={site.author.url} className={`${LINK} text-ink`}>
                  {creditName}
                </a>
              )}
              {creditAfter}
            </li>
            <li>
              <a href={site.repo} className={`${LINK} text-ink`}>
                {footer.source}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
