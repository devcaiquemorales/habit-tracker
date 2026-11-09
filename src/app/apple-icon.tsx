import { ImageResponse } from "next/og";

import { PwaAppIconImage } from "@/presentation/components/pwa/pwa-app-icon-image";

/**
 * Apple touch icon — `apple-icon.tsx` is picked up by Next metadata.
 * Larger than the nominal 180px: recent iPhones draw home screen icons above it.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<PwaAppIconImage pixelSize={512} />, {
    ...size,
  });
}
