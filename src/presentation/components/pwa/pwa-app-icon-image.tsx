/**
 * Opaque app icon for `next/og` ImageResponse. Mirrors `BrandMark` with a full-bleed
 * tile, since Android and iOS round the corners themselves; the H stays inside
 * the mask safe zone.
 */
const TILE = "#0EA5BD";
const MARK = "#191919";

export function PwaAppIconImage({ pixelSize }: { pixelSize: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 160 160"
    >
      <rect width="160" height="160" fill={TILE} />
      <g transform="translate(24 24) scale(0.7)">
        <rect x="44" y="61" width="72" height="34" fill={MARK} />
        <rect x="20" y="12" width="34" height="136" rx="17" fill={MARK} />
        <rect x="106" y="12" width="34" height="136" rx="17" fill={MARK} />
      </g>
    </svg>
  );
}
