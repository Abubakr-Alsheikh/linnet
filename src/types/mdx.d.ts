/**
 * Every content file in src/content exports `meta`, the structured fields
 * that sit beside its prose. It is typed `unknown` on purpose: parse it with
 * the matching Zod schema in src/lib/content before a component reads it.
 */
declare module "*.mdx" {
  export const meta: unknown;
}
