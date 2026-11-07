import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { faq, faqList } from "@/lib/content";

/**
 * Nine questions in an accordion (several can be open). Each question is a
 * full-width button inside an h3; the answers are the MDX bodies, rendered
 * on the server and handed to the client accordion. FaqAccordion shows a
 * plain closed copy until the first press, then loads Radix, which mounts an
 * answer while it is open, so a closed answer is out of the accessibility
 * tree and the tab order.
 */
export function Faq() {
  const { meta } = faq;
  const items = faqList.map(({ meta: item, Body }) => ({
    value: `faq-${item.order}`,
    question: item.question,
    answer: <Body />,
  }));
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} />
      <div className="mt-12 max-w-3xl lg:mt-16">
        <FaqAccordion items={items} />
      </div>
    </Section>
  );
}
