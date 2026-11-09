import { afterEach, describe, expect, test } from "bun:test";

import { formatHeatmapMonthLabel } from "./format";

const originalTz = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTz;
});

describe("formatHeatmapMonthLabel", () => {
  for (const tz of ["America/Sao_Paulo", "Asia/Tokyo", "UTC"]) {
    test(`names the requested month in ${tz}`, () => {
      process.env.TZ = tz;
      expect(formatHeatmapMonthLabel(2026, 10, "en", false)).toBe("Nov");
    });

    test(`keeps the requested year in January in ${tz}`, () => {
      process.env.TZ = tz;
      expect(formatHeatmapMonthLabel(2026, 0, "en", true)).toBe("Jan 2026");
    });
  }
});
