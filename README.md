# Linnet

**Concept · self-initiated**

Linnet is a launch page for a fictional invoicing product for freelancers and small software studios. It is a portfolio piece by [Abubakr Alsheikh](https://abubakr-alsheikh.netlify.app): the page a SaaS founder could put in front of customers, built with the care an engineer would want to read.

**Status:** in development. Live: [linnet-app.netlify.app](https://linnet-app.netlify.app) (the page shell is up; the invoice demo and the sections arrive next).

## What it will do

- **A working invoice in the hero.** You type line items, hours, a rate and a tax rate, pick a currency, and the invoice totals itself. Press Send and it moves from Draft to Sent to Paid.
- **Features** explained with small diagrams that play once.
- **Integrations** shown as categories (bank feeds, payments, accounting export, calendars, email), with no real brands.
- **Pricing** with a monthly and yearly toggle. The prices are illustrative.
- **Quotes, FAQ and a waitlist** form on Netlify Forms.
- Light and dark themes, keyboard navigation and reduced-motion support from 360 px to 1920 px.

Linnet, its company, customers and quotes are invented. Nothing on the page is a real offer.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, Cache Components), React 19, TypeScript (strict)
- Tailwind CSS 4 with design tokens in `@theme`, light and dark
- [shadcn/ui](https://ui.shadcn.com) on Radix primitives for menus, dialogs and accordions, restyled to the tokens
- MDX through `@next/mdx`: page copy lives in `src/content/*.mdx` and each file's fields are checked with [Zod](https://zod.dev)
- [Motion](https://motion.dev) for the invoice demo and the price change
- [Vitest](https://vitest.dev) for the invoice maths and the content schemas
- Familjen Grotesk and Public Sans through `next/font`
- Netlify (hosting and Forms)

## Scripts

```bash
npm run dev         # local dev server
npm run build       # production build
npm start           # serve the production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run contrast    # WCAG contrast of every colour pair, both themes
npm run screens -- http://localhost:3000 screenshots 360,768,1280,1920        # full-page screenshots
npm run screens -- http://localhost:3000 screenshots/dark 360,1280 dark       # the same in dark mode
npm run axe -- http://localhost:3000 360,1280                                 # axe-core scan
```

The screenshot and axe scripts drive a local Chrome over the DevTools Protocol, with no extra dependencies. Node 24 (`.nvmrc`).

## Quality targets

- Lighthouse mobile 95 or higher for performance, accessibility, best practices and SEO
- Cumulative Layout Shift 0
- axe-core: 0 violations in both themes
- Works from 360 px to 1920 px, by keyboard, and with `prefers-reduced-motion`

## Author

Designed and built by [Abubakr Alsheikh](https://abubakr-alsheikh.netlify.app). MIT licence.
