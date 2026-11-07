import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";
import { demo, hero, layout } from "@/lib/content";
import { demoDefaults } from "@/lib/content/demo-defaults";
import { splitAround } from "@/lib/content/template";
import { createDemoState, evaluate } from "@/lib/invoice/demo-machine";
import { formatMoney } from "@/lib/money";

/*
 * The share image (COPY section 13): the wordmark, the headline, a small
 * invoice with the PAID stamp and the concept label. Static TTF fonts are
 * read at module scope, so the route prerenders at build (○); next/og reads
 * neither woff2 nor variable fonts. Words come from the content files and
 * the amounts from the demo's own maths, so the image matches the page.
 */

export const alt = layout.meta.shareAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = join(process.cwd(), "assets/og");
const [familjenBold, publicSans, publicSansSemiBold] = await Promise.all([
  readFile(join(fonts, "FamiljenGrotesk-Bold.ttf")),
  readFile(join(fonts, "PublicSans-Regular.ttf")),
  readFile(join(fonts, "PublicSans-SemiBold.ttf")),
]);

const c = brand.light;

export default function Image() {
  const defaults = demoDefaults(demo.meta);
  const { totals } = evaluate(createDemoState(defaults));
  const money = (minor: number) => formatMoney(minor, defaults.currency);
  const { title, accent } = hero.meta.headline;
  const [before, phrase] = (accent && splitAround(title, accent)) || [title, ""];
  const row = { display: "flex", justifyContent: "space-between", alignItems: "baseline" } as const;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: c.canvas, padding: 72, fontFamily: "Public Sans", color: c.ink }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="48" height="48" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="7" fill={c.brand} />
              <path d="M10 7.5h3.6v13.4H23v3.6H10z" fill={c.onBrand} />
              <circle cx="20.5" cy="11" r="2.2" fill={c.onBrand} />
            </svg>
            <span style={{ fontFamily: "Familjen Grotesk", fontSize: 44, fontWeight: 700 }}>{layout.meta.wordmark}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Familjen Grotesk", fontSize: 84, fontWeight: 700, lineHeight: 0.98, letterSpacing: -2.5 }}>
            <span>{before.trim()}</span>
            {phrase && <span style={{ color: c.brandInk }}>{phrase}</span>}
          </div>
          <span style={{ fontSize: 24, fontWeight: 600, color: c.inkMuted }}>{layout.meta.footer.concept}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
            marginLeft: "auto",
            width: 452,
            padding: 36,
            background: c.surface,
            border: `1px solid ${c.line}`,
            borderRadius: 6,
            boxShadow: "0 32px 64px -32px rgba(27, 28, 31, 0.35)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Familjen Grotesk", fontSize: 32, fontWeight: 700 }}>{demo.meta.title}</span>
            <span style={{ fontSize: 18, color: c.inkMuted }}>{demo.meta.number}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 18 }}>
            {defaults.lines.map((line, index) => (
              <div key={line.description} style={{ ...row, padding: "12px 0", borderBottom: `1px solid ${c.line}` }}>
                <span>{line.description}</span>
                <span>{money(totals.lines[index])}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", position: "relative", flexDirection: "column", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${c.lineStrong}` }}>
            <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-end", width: 258, gap: 10, fontSize: 18 }}>
              <div style={{ ...row, color: c.inkMuted }}>
                <span>{demo.meta.totals.subtotal}</span>
                <span style={{ color: c.ink }}>{money(totals.subtotal)}</span>
              </div>
              <div style={{ ...row, color: c.inkMuted }}>
                <span>{`${demo.meta.totals.tax} ${defaults.taxRate}%`}</span>
                <span style={{ color: c.ink }}>{money(totals.tax)}</span>
              </div>
              <div style={{ ...row, alignItems: "center", marginTop: 4 }}>
                <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{demo.meta.totals.total}</span>
                <span style={{ fontFamily: "Familjen Grotesk", fontSize: 30, fontWeight: 700, background: c.brandTint, padding: "2px 8px", borderRadius: 3 }}>
                  {money(totals.total)}
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: 0,
                top: 50,
                padding: "2px 12px",
                border: `4px solid ${c.brandInk}`,
                borderRadius: 8,
                color: c.brandInk,
                fontFamily: "Familjen Grotesk",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 3,
                transform: "rotate(-9deg)",
              }}
            >
              {demo.meta.stamp}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Familjen Grotesk", data: familjenBold, weight: 700, style: "normal" },
        { name: "Public Sans", data: publicSans, weight: 400, style: "normal" },
        { name: "Public Sans", data: publicSansSemiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
