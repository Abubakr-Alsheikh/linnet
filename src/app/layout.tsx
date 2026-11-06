import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Public_Sans } from "next/font/google";
import { site } from "@/lib/site";
import { HEAD_CLEANUP_SCRIPT, THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.author.name, url: site.author.url }],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script sets data-theme on <html> before hydration.
    <html lang="en" suppressHydrationWarning className={`${familjen.variable} ${publicSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_CLEANUP_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
