import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Integrations } from "@/components/sections/Integrations";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { Quotes } from "@/components/sections/Quotes";
import { Waitlist } from "@/components/sections/Waitlist";
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
