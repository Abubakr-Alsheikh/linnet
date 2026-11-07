/**
 * Brand colours for places CSS cannot reach: the share image, the app
 * icon, the web manifest and the browser's theme colour. The same values
 * are tokens in src/app/globals.css; brand.test.ts fails if they drift.
 */
export const brand = {
  light: {
    canvas: "#f1f2ee",
    surface: "#ffffff",
    line: "#dcddd6",
    lineStrong: "#c5c7bf",
    ink: "#1b1c1f",
    inkMuted: "#575a60",
    brand: "#b3203d",
    onBrand: "#ffffff",
    brandInk: "#a51c38",
    brandTint: "#f8e1e5",
  },
  dark: {
    canvas: "#121315",
  },
} as const;
