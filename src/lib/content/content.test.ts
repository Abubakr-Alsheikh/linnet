import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { STATUSES, createDemoState, evaluate } from "@/lib/invoice/demo-machine";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";
import { demoDefaults } from "./demo-defaults";
import { demo, faq, featureList, features, hero, integrations, layout, parseMeta, pricing, quotes, sections, waitlist } from "./index";
import { copy, demoSchema, headline, heroSchema, template } from "./schemas";

const sectionIds = sections.map((section) => section.meta.id);
const render = (Body: (typeof sections)[number]["Body"]) => renderToStaticMarkup(createElement(Body));

describe("content files", () => {
  it("parse, in page order, with the anchors the plan names", () => {
    expect(sectionIds).toEqual(["features", "integrations", "pricing", "quotes", "faq", "waitlist"]);
  });

  it("use unique section ids", () => {
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });

  it("only link to sections that exist", () => {
    const targets = [
      ...layout.meta.nav.links,
      layout.meta.nav.cta,
      ...layout.meta.footer.links,
      hero.meta.primaryCta,
      hero.meta.secondaryCta,
    ].map((link) => link.target);
    for (const target of targets) expect(sectionIds).toContain(target);
  });

  it("repeat the tagline the metadata uses", () => {
    expect(layout.meta.tagline).toBe(site.tagline);
    expect(hero.meta.eyebrow).toBe(site.tagline);
  });

  it("keep prose in the body where a section has an intro", () => {
    for (const { Body } of [hero, features, integrations, pricing, waitlist, layout]) {
      expect(render(Body)).toMatch(/^<p>.+<\/p>$/);
    }
    for (const { Body } of [quotes, faq]) expect(render(Body)).toBe("");
  });

  it("put the concept disclaimer in the footer", () => {
    expect(render(layout.Body)).toContain("Linnet is a fictional product.");
    expect(layout.meta.footer.concept).toBe("Concept · self-initiated");
  });
});

describe("features", () => {
  it("lists six features with orders 1 to 6, each once", () => {
    expect(featureList.map((feature) => feature.meta.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("draws six different diagrams", () => {
    const diagrams = featureList.map((feature) => feature.meta.diagram);
    expect(new Set(diagrams).size).toBe(6);
  });

  it("gives each feature a paragraph and a diagram description", () => {
    for (const { meta, Body } of featureList) {
      expect(render(Body)).toMatch(/^<p>.+<\/p>$/);
      expect(meta.diagramLabel.length).toBeGreaterThan(meta.title.length);
    }
  });

  it("names the replay button after the feature", () => {
    expect(features.meta.replay).toContain("{title}");
  });

  it("splits tracked hours into blocks that add up to the invoiced hours", () => {
    const hours = featureList.find((feature) => feature.meta.diagram === "hours")?.meta;
    if (hours?.diagram !== "hours") throw new Error("hours feature missing");
    const total = hours.figure.blocks.reduce((sum, block) => sum + Number.parseFloat(block), 0);
    expect(hours.figure.quantity.startsWith(`${total} h`)).toBe(true);
  });
});

describe("demo.mdx", () => {
  const defaults = demoDefaults(demo.meta);

  it("starts on the COPY defaults: €2,327.50, €465.50, €2,793.00", () => {
    const { totals, valid } = evaluate(createDemoState(defaults));
    expect(valid).toBe(true);
    expect([totals.subtotal, totals.tax, totals.total].map((minor) => formatMoney(minor, defaults.currency))).toEqual([
      "€2,327.50",
      "€465.50",
      "€2,793.00",
    ]);
  });

  it("bills Moss Lane Press in euro on 14-day terms by default", () => {
    expect(defaults).toMatchObject({ clientId: "moss-lane", currency: "EUR", termsDays: 14, taxRate: "20" });
  });

  it("gives each fictional client a different currency and a .example address", () => {
    const currencies = demo.meta.clients.map((client) => client.currency);
    expect(new Set(currencies).size).toBe(demo.meta.clients.length);
    for (const client of demo.meta.clients) expect(client.email).toMatch(/\.example$/);
  });

  it("names the send states the machine uses", () => {
    expect(Object.keys(demo.meta.status).sort()).toEqual([...STATUSES].sort());
  });

  it("keeps the footnote in the body", () => {
    expect(render(demo.Body)).toContain("nothing is sent");
  });

  it("rejects a client address outside .example", () => {
    const clients = [{ ...demo.meta.clients[0], email: "accounts@mosslane.com" }];
    expect(demoSchema.safeParse({ ...demo.meta, clients }).success).toBe(false);
  });
});

describe("waitlist fields and public/__forms.html", () => {
  const html = readFileSync(new URL("../../../public/__forms.html", import.meta.url), "utf8");
  const form = html.match(/<form name="waitlist"[\s\S]*?<\/form>/)?.[0] ?? "";
  const names = [...form.matchAll(/\bname="([^"]+)"/g)].map((match) => match[1]);
  const optionsOf = (select: string) =>
    [...(form.match(new RegExp(`<select name="${select}">[\\s\\S]*?</select>`))?.[0] ?? "").matchAll(/value="([^"]+)"/g)].map(
      (match) => match[1],
    );

  it("declares a form named waitlist", () => {
    expect(form).not.toBe("");
    expect(names).toContain("form-name");
  });

  it("declares every field the content names", () => {
    for (const field of Object.keys(waitlist.meta.fields)) expect(names).toContain(field);
  });

  it("declares the same option values", () => {
    expect(waitlist.meta.fields.team.options.map((option) => option.value)).toEqual(optionsOf("team"));
    expect(waitlist.meta.fields.currency.options.map((option) => option.value)).toEqual(optionsOf("currency"));
  });
});

describe("content schemas", () => {
  it("hold copy to the house rules", () => {
    expect(copy.safeParse("Send the invoice.").success).toBe(true);
    expect(copy.safeParse("€1,572.50 · Sending…").success).toBe(true);
    expect(copy.safeParse("Fast — and simple").success).toBe(false);
    expect(copy.safeParse("Get paid!").success).toBe(false);
    expect(copy.safeParse("Tomáš Černý").success).toBe(false);
    expect(copy.safeParse(" padded").success).toBe(false);
    expect(copy.safeParse("").success).toBe(false);
  });

  it("require the accent to be part of the title", () => {
    expect(headline.safeParse({ title: "Send the invoice. Get paid.", accent: "Get paid." }).success).toBe(true);
    expect(headline.safeParse({ title: "Send the invoice.", accent: "Get paid." }).success).toBe(false);
  });

  it("require a template's placeholders", () => {
    expect(template("year").safeParse("© {year} Linnet").success).toBe(true);
    expect(template("year").safeParse("© 2026 Linnet").success).toBe(false);
    expect(template("year").safeParse("© {year} {month}").success).toBe(false);
  });

  it("reject unknown keys and name the file", () => {
    const bad = { ...hero.meta, subtitle: "extra" };
    expect(() => parseMeta("hero.mdx", heroSchema, bad)).toThrow(/src\/content\/hero\.mdx[\s\S]*subtitle/);
  });
});
