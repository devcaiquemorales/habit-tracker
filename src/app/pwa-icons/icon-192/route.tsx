import { ImageResponse } from "next/og";

import { PwaAppIconImage } from "@/presentation/components/pwa/pwa-app-icon-image";

/**
 * Manifest / Android icon (192). Route avoids committing binary PNGs; same artwork as `icon.tsx`.
 */
export const runtime = "edge";

export async function GET() {
  return new ImageResponse(<PwaAppIconImage pixelSize={192} />, {
    width: 192,
    height: 192,
  });
}
