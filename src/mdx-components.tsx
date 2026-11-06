import type { MDXComponents } from "mdx/types";

/**
 * Global element mapping for every MDX file. Required by @next/mdx in the App
 * Router. Sections pass their own `components` prop when they need a
 * different mapping (a FAQ answer, a feature caption).
 */
const components: MDXComponents = {
  p: ({ children }) => <p className="max-w-[60ch] text-pretty">{children}</p>,
  a: ({ href, children }) => (
    <a href={href} className="text-brand-ink underline decoration-line-strong underline-offset-4 hover:decoration-brand">
      {children}
    </a>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
