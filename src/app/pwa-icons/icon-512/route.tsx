import { ImageResponse } from "next/og";

import { PwaAppIconImage } from "@/presentation/components/pwa/pwa-app-icon-image";

/** High-res launcher + maskable source (512). */
export const runtime = "edge";

export async function GET() {
  return new ImageResponse(<PwaAppIconImage pixelSize={512} />, {
    width: 512,
    height: 512,
  });
}
