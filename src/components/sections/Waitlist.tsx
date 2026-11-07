import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { waitlist } from "@/lib/content";
import { site } from "@/lib/site";

/** The waitlist: the header and intro on the server, the form as the one client leaf. */
export function Waitlist() {
  const { meta, Body } = waitlist;
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} intro={<Body />} />
      <div className="mt-12 max-w-3xl lg:mt-16">
        <WaitlistForm content={meta} contactUrl={site.author.contact} />
      </div>
    </Section>
  );
}
