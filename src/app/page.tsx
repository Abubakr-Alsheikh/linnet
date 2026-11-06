import { placeholder } from "@/lib/content/placeholder";
import { site } from "@/lib/site";

/** Holding page until milestone M1 builds the shell and M2 the hero demo. */
export default function Home() {
  const { meta, Body } = placeholder;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[1200px] flex-col px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
      <header className="flex items-center justify-between gap-6">
        <p className="font-display text-2xl font-bold tracking-tight">{site.name}</p>
        <p className="rounded-sm bg-surface-2 px-2 py-1 text-xs font-semibold text-ink-muted">{meta.status}</p>
      </header>

      <section className="grid flex-1 content-center gap-8 py-16 lg:grid-cols-12">
        <h1 className="font-display text-display font-bold lg:col-span-8">
          {meta.headline} <span className="text-brand-ink">{meta.accent}</span>
        </h1>
        <div className="text-lede text-ink-muted lg:col-span-6">
          <Body />
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-line pt-4 text-sm text-ink-muted sm:flex-row sm:items-baseline sm:justify-between">
        <p className="font-semibold text-ink">{site.concept}</p>
        <p>
          Designed and built by{" "}
          <a
            href={site.author.url}
            className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-brand"
          >
            {site.author.name}
          </a>
        </p>
      </footer>
    </main>
  );
}
