import type { DemoDefaults } from "@/lib/invoice/demo-machine";
import type { DemoContent } from "./schemas";

/**
 * The demo's starting invoice from demo.mdx. A separate module with a
 * type-only import of the schemas, so the client chunk never pulls in Zod.
 */
export function demoDefaults(content: DemoContent): DemoDefaults {
  const client = content.clients.find((candidate) => candidate.id === content.defaultClient) ?? content.clients[0];
  return {
    clientId: client.id,
    currency: client.currency,
    termsDays: content.terms.default,
    taxRate: content.defaultTaxRate,
    lines: content.defaultLines,
  };
}
