import { Button } from "@/components/ui/button";
import { layout } from "@/lib/content";
import { MobileNav } from "./MobileNav";
import { ThemeMenu } from "./ThemeMenu";
import { Wordmark } from "./Wordmark";

/**
 * Sticky, 64 px. At `lg`: wordmark, section links, theme menu, the ink
 * "Join the waitlist" button. Below `lg` the links move into the Menu sheet;
 * the header button stays from `sm`. The bottom rule appears once the page
 * scrolls (`.site-header` in globals.css).
 */
export function SiteHeader() {
  const { meta } = layout;
  const links = meta.nav.links.map((link) => ({ label: link.label, href: `#${link.target}` }));
  const cta = { label: meta.nav.cta.label, href: `#${meta.nav.cta.target}` };

  return (
    <header className="site-header sticky top-0 z-40 bg-canvas">
      <div className="page-width flex h-16 items-center gap-4">
        {/* "#top" scrolls to the top of the document without a reload. */}
        <Wordmark name={meta.wordmark} href="#top" className="-ml-1 px-1" />
        <nav aria-label={meta.nav.label} className="ml-auto max-lg:hidden">
          <ul className="flex items-center">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-muted transition-colors duration-(--duration-press) hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2 max-lg:ml-auto">
          <ThemeMenu labels={meta.theme} />
          <Button asChild variant="ink" className="max-sm:hidden">
            <a href={cta.href}>{cta.label}</a>
          </Button>
          <MobileNav
            className="lg:hidden"
            labels={{ ...meta.mobileNav, nav: meta.nav.label }}
            wordmark={meta.wordmark}
            links={links}
            cta={cta}
          />
        </div>
      </div>
    </header>
  );
}
