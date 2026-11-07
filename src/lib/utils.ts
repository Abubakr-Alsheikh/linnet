import { createCn } from "cn/config";

/**
 * Class joining and Tailwind conflict resolution (shadcn's `cn`), taught the
 * Linnet theme. Without the font-size entry, `cn("text-h2", "text-ink")`
 * reads `text-h2` as a colour and drops it. Add any new `--text-*`,
 * `--shadow-*` or `--radius-*` token from globals.css here too.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["lede", "total", "h3", "h2", "display"] }],
      shadow: [{ shadow: ["float", "paper"] }],
      rounded: [{ rounded: ["card", "paper"] }],
    },
  },
});
