import type { Metadata } from "next";
import { Wordmark } from "@/components/layout/Wordmark";
import { Button } from "@/components/ui/button";
import { layout, notFound } from "@/lib/content";

export const metadata: Metadata = { title: notFound.meta.title };

/**
 * The 404 page (COPY section 12): the wordmark, one line and the way back
 * to the invoice. A plain link, not next/link: this file sits in the root
 * layout's boundary, so any client component here would ship on every page.
 */
export default function NotFound() {
  const { meta, Body } = notFound;
  return (
    <main id="main" className="page-width flex min-h-dvh flex-col justify-center gap-8 py-16">
      <Wordmark name={layout.meta.wordmark} />
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-display font-bold text-balance">{meta.title}</h1>
        <div className="text-lede text-ink-muted">
          <Body />
        </div>
      </div>
      <Button asChild variant="primary" className="self-start">
        {/* A full load home is fine from a 404; next/link here would add 3.6 KB to every page. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">{meta.link}</a>
      </Button>
    </main>
  );
}
