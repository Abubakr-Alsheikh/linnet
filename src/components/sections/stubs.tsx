import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { waitlist } from "@/lib/content";

/*
 * The page's last section, with its header only. It moves to its own file
 * in src/components/sections when M7 adds the waitlist form.
 */

export function Waitlist() {
  const { meta, Body } = waitlist;
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} intro={<Body />} />
    </Section>
  );
}
