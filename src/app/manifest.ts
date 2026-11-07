import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";
import { site } from "@/lib/site";

/** The web app manifest, with its colours from the canvas token. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} · ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: brand.light.canvas,
    theme_color: brand.light.canvas,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
