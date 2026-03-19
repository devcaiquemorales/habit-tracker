/**
 * Inline layout for PWA / favicons via `next/og` ImageResponse (Satori: flex only, no CSS grid).
 */
const HEATMAP_PATTERN: number[][] = [
  [0, 1, 1, 0, 1, 1, 0],
  [1, 1, 0, 1, 0, 1, 1],
  [0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 1, 0, 1],
];

const BG = "#16141f";
const CELL_IDLE = "#2a2538";
const CELL_DONE = "#34d399";

export function PwaAppIconImage({ pixelSize }: { pixelSize: number }) {
  const pad = Math.round(pixelSize * 0.1);
  const gap = Math.max(2, Math.round(pixelSize * 0.022));
  const cols = HEATMAP_PATTERN[0]?.length ?? 7;
  const rows = HEATMAP_PATTERN.length;
  const inner = pixelSize - pad * 2;
  const cell = Math.floor((inner - gap * (cols - 1)) / cols);
  const gridWidth = cell * cols + gap * (cols - 1);
  const gridHeight = cell * rows + gap * (rows - 1);

  return (
    <div
      style={{
        width: pixelSize,
        height: pixelSize,
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap,
          width: gridWidth,
          height: gridHeight,
        }}
      >
        {HEATMAP_PATTERN.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "flex",
              flexDirection: "row",
              gap,
              height: cell,
            }}
          >
            {row.map((v, ci) => (
              <div
                key={ci}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: Math.max(2, Math.round(cell * 0.2)),
                  background: v ? CELL_DONE : CELL_IDLE,
                  opacity: v ? 1 : 0.45,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
