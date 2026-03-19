import { ImageResponse } from "next/og";

import { PwaAppIconImage } from "@/presentation/components/pwa/pwa-app-icon-image";

/** Apple touch icon — `apple-icon.tsx` is picked up by Next metadata. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<PwaAppIconImage pixelSize={180} />, {
    ...size,
  });
}
