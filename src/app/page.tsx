import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Faq, Integrations, Pricing, Quotes, Waitlist } from "@/components/sections/stubs";
import { layout } from "@/lib/content";

/** The one page. A server component: only the interactive leaves inside it ship as client code. */
export default function Home() {
  return (
    <>
      <SkipLink label={layout.meta.skipLink} target="main" />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Features />
        <Integrations />
        <Pricing />
        <Quotes />
        <Faq />
        <Waitlist />
      </main>
      <SiteFooter />
    </>
  );
}
