import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The footer's copyright year. A prerendered server component cannot call
  // `new Date()` under Cache Components, so the build supplies it.
  env: { LINNET_BUILD_YEAR: String(new Date().getUTCFullYear()) },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

/**
 * Page copy lives in `src/content/*.mdx`, compiled at build time and imported
 * like components. No .mdx routes: `pageExtensions` stays at the default.
 * With Turbopack, remark and rehype plugins must be given by name (strings).
 */
const withMDX = createMDX({});

export default withMDX(nextConfig);
