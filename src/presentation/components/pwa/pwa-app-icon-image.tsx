/**
 * Opaque app icon for `next/og` ImageResponse. Mirrors `BrandMark`, drawn smaller
 * so it stays inside the Android and iOS mask safe zone.
 */
const BACKGROUND = "#191919";
const STEM = "#EDE6DA";
const LEAF = "#0EA5BD";

export function PwaAppIconImage({ pixelSize }: { pixelSize: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 160 160"
    >
      <rect width="160" height="160" fill={BACKGROUND} />
      <g transform="translate(28 31) scale(0.62)">
        <rect x="18" y="10" width="36" height="140" rx="18" fill={STEM} />
        <rect x="36" y="72" width="106" height="32" rx="16" fill={STEM} />
        <rect x="106" y="76" width="36" height="74" rx="18" fill={STEM} />
        <path d="M72 62C72 28 104 8 150 8C150 42 118 62 72 62Z" fill={LEAF} />
      </g>
    </svg>
  );
}
