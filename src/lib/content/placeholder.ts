import { z } from "zod";
import Body, { meta } from "@/content/placeholder.mdx";

/** Fields of the holding page's content file. Replaced by the real sections. */
export const placeholderMeta = z.object({
  status: z.string().min(1),
  headline: z.string().min(1),
  accent: z.string().min(1),
});

export const placeholder = { meta: placeholderMeta.parse(meta), Body };
