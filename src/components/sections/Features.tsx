import { DiagramFrame } from "@/components/diagrams/DiagramFrame";
import { Diagram } from "@/components/diagrams/diagrams";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { featureList, features } from "@/lib/content";
import { fill } from "@/lib/content/template";

/**
 * Six features, each a card with a diagram that plays once when it scrolls
 * into view. One column below md, two at md, three at xl. Server-rendered;
 * only DiagramFrame, which decides when to play, runs on the client.
 */
export function Features() {
  const { meta, Body } = features;
  return (
    <Section id={meta.id}>
      <SectionHeader id={meta.id} eyebrow={meta.eyebrow} headline={meta.headline} intro={<Body />} />
      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 xl:grid-cols-3">
        {featureList.map(({ meta: feature, Body: Text }) => (
          <li key={feature.diagram} className="flex flex-col rounded-card border border-line bg-surface p-6">
            <DiagramFrame label={feature.diagramLabel} replayLabel={fill(meta.replay, { title: feature.title })}>
              <Diagram feature={feature} />
            </DiagramFrame>
            <h3 className="mt-6 font-display text-h3 font-bold text-balance">{feature.title}</h3>
            <div className="mt-3 text-ink-muted">
              <Text />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
