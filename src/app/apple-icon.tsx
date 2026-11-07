import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

/*
 * The home-screen icon for iOS, 180 × 180: icon.svg's mark full bleed (iOS
 * rounds the corners itself). Prerendered at build.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: brand.light.brand }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M10 7.5h3.6v13.4H23v3.6H10z" fill={brand.light.onBrand} />
          <circle cx="20.5" cy="11" r="2.2" fill={brand.light.onBrand} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
