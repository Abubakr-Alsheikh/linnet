/** Site-wide facts. One place for names, URLs and the concept disclosure. */
export const site = {
  name: "Linnet",
  tagline: "Invoicing for freelancers and small studios",
  description:
    "Linnet is a concept invoicing product for freelancers and small software studios. Build an invoice, send it and watch it get paid. A portfolio piece by Abubakr Alsheikh.",
  /** Planned Netlify site (linnet.netlify.app belongs to someone else). metadataBase, sitemap and robots build on it. */
  url: "https://linnet-app.netlify.app",
  concept: "Concept · self-initiated",
  disclaimer:
    "Linnet is a fictional product. The company, customers, quotes and prices on this page are invented to show what a real launch page could look like.",
  author: {
    name: "Abubakr Alsheikh",
    url: "https://abubakr-alsheikh.netlify.app",
  },
  /** Planned public repo; it does not exist until the owner creates it. */
  repo: "https://github.com/Abubakr-Alsheikh/linnet",
  locale: "en-GB",
} as const;
