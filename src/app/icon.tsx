import { ImageResponse } from "next/og";

import { PwaAppIconImage } from "@/presentation/components/pwa/pwa-app-icon-image";

/** Browser tab / legacy favicon via App Router convention (linked automatically). */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<PwaAppIconImage pixelSize={32} />, {
    ...size,
  });
}
