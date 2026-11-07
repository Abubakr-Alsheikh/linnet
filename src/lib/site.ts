/**
 * Site-wide facts for metadata and links: names, URLs, locale. Visible copy
 * lives in src/content (the footer's concept label and disclaimer are in
 * layout.mdx); a content test keeps the shared tagline in step.
 */
export const site = {
  name: "Linnet",
  tagline: "Invoicing for freelancers and small studios",
  description:
    "Linnet is a concept invoicing product for freelancers and small software studios. Build an invoice, send it and watch it get paid. A portfolio piece by Abubakr Alsheikh.",
  /** The Netlify site (linnet.netlify.app belongs to someone else). metadataBase, sitemap and robots build on it. */
  url: "https://linnet-app.netlify.app",
  author: {
    name: "Abubakr Alsheikh",
    url: "https://abubakr-alsheikh.netlify.app",
  },
  repo: "https://github.com/Abubakr-Alsheikh/linnet",
  locale: "en-GB",
  /** Set in next.config.ts when the build runs, for the footer's copyright line. */
  buildYear: process.env.LINNET_BUILD_YEAR ?? "",
} as const;
