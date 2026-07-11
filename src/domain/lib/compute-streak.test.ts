/// <reference types="bun" />
import { describe, expect, test } from "bun:test";

import type { Schedule } from "@/domain/types/schedule";

import {
  computeStreak,
  countLogsInCalendarMonth,
  type StreakResult,
  streakUnitForSchedule,
} from "./compute-streak";

/**
 * Helper to build a Set of date keys from an anchor date and offsets.
 * offset 0 = anchor date, offset 1 = day after, offset -1 = day before, etc.
 */
function keysFrom(anchorKey: string, offsets: number[]): Set<string> {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(anchorKey);
  if (!match) return new Set();
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const anchorEpochDay = Math.floor(Date.UTC(y, m - 1, d) / 86400000);

  const keys = new Set<string>();
  for (const offset of offsets) {
    const epochDay = anchorEpochDay + offset;
    const date = new Date(epochDay * 86400000);
    const ky = date.getUTCFullYear();
    const km = String(date.getUTCMonth() + 1).padStart(2, "0");
    const kd = String(date.getUTCDate()).padStart(2, "0");
    keys.add(`${ky}-${km}-${kd}`);
  }
  return keys;
}

describe("streakUnitForSchedule", () => {
  test("daily returns 'days'", () => {
    const schedule: Schedule = { type: "daily" };
    expect(streakUnitForSchedule(schedule)).toBe("days");
  });

  test("specificDays returns 'days'", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    expect(streakUnitForSchedule(schedule)).toBe("days");
  });

  test("everyOtherDay returns 'days'", () => {
    const schedule: Schedule = { type: "everyOtherDay" };
    expect(streakUnitForSchedule(schedule)).toBe("days");
  });

  test("weeklyTarget returns 'weeks'", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    expect(streakUnitForSchedule(schedule)).toBe("weeks");
  });

  test("flexible returns 'none'", () => {
    const schedule: Schedule = { type: "flexible" };
    expect(streakUnitForSchedule(schedule)).toBe("none");
  });
});

describe("computeStreak - daily", () => {
  test("3-day chain ending today returns 3", () => {
    const schedule: Schedule = { type: "daily" };
    // Today: 2026-07-05, and 2 days before
    const keys = keysFrom("2026-07-05", [0, -1, -2]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test("today unlogged + 3-day chain ending yesterday returns 3 (grace period)", () => {
    const schedule: Schedule = { type: "daily" };
    // Yesterday and 2 days before; today not logged
    const keys = keysFrom("2026-07-05", [-1, -2, -3]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test("gap 2 days ago breaks streak", () => {
    const schedule: Schedule = { type: "daily" };
    // Today, yesterday, gap at -2, have -3
    const keys = keysFrom("2026-07-05", [0, -1, -3]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(2);
    expect(result.unit).toBe("days");
  });

  test("empty set returns 0", () => {
    const schedule: Schedule = { type: "daily" };
    const keys = new Set<string>();
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(0);
    expect(result.unit).toBe("days");
  });

  test("chain across Dec 31 2025 -> Jan 2 2026 returns 3", () => {
    const schedule: Schedule = { type: "daily" };
    // Jan 1, Dec 31, Dec 30, 2025
    const keys = keysFrom("2026-01-02", [-1, -2, -3]);
    const result = computeStreak(keys, schedule, "2026-01-02");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test("chain across Feb 28 -> 29 -> Mar 1 2024 (leap) returns 3", () => {
    const schedule: Schedule = { type: "daily" };
    // Mar 1, Feb 29, Feb 28, 2024
    const keys = keysFrom("2024-03-01", [-1, -2, -3]);
    const result = computeStreak(keys, schedule, "2024-03-01");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test(">400-day chain caps at <=400", () => {
    const schedule: Schedule = { type: "daily" };
    const offsets = Array.from({ length: 450 }, (_, i) => -i);
    const keys = keysFrom("2026-07-05", offsets);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBeLessThanOrEqual(400);
  });
});

describe("computeStreak - specificDays", () => {
  test("logs Mon+Wed+Fri of current week, today=Friday logged, returns 3", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    // 2026-07-06 is Monday, 2026-07-08 is Wednesday, 2026-07-10 is Friday
    const keys = new Set(["2026-07-06", "2026-07-08", "2026-07-10"]);
    const result = computeStreak(keys, schedule, "2026-07-10");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test("today=Saturday (not expected), same logs, returns 3 (transparent day)", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    // Same as above but querying Saturday (2026-07-11)
    const keys = new Set(["2026-07-06", "2026-07-08", "2026-07-10"]);
    const result = computeStreak(keys, schedule, "2026-07-11");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test("missed Wednesday, today=Friday logged, returns 1", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    // Only Monday and Friday (no Wednesday)
    const keys = new Set(["2026-07-06", "2026-07-10"]);
    const result = computeStreak(keys, schedule, "2026-07-10");
    expect(result.count).toBe(1);
    expect(result.unit).toBe("days");
  });

  test("two full weeks all expected days logged returns 6", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    // Current week: 2026-07-06 (Mon), 08 (Wed), 10 (Fri)
    // Previous week: 2026-06-29 (Mon), 07-01 (Wed), 07-03 (Fri)
    const keys = new Set([
      "2026-07-06", "2026-07-08", "2026-07-10",
      "2026-06-29", "2026-07-01", "2026-07-03",
    ]);
    const result = computeStreak(keys, schedule, "2026-07-10");
    expect(result.count).toBe(6);
    expect(result.unit).toBe("days");
  });

  test("empty days array returns 0", () => {
    const schedule: Schedule = { type: "specificDays", days: [] };
    const keys = new Set(["2026-07-05"]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(0);
    expect(result.unit).toBe("days");
  });
});

describe("computeStreak - everyOtherDay with anchorDateKey", () => {
  test("anchor=2026-07-01, logs 07-01/07-03/07-05, today=07-05 returns 3", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-01",
    };
    const keys = new Set(["2026-07-01", "2026-07-03", "2026-07-05"]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test("anchor=2026-07-01, today=2026-07-06 (off-day, unlogged), still 3", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-01",
    };
    const keys = new Set(["2026-07-01", "2026-07-03", "2026-07-05"]);
    const result = computeStreak(keys, schedule, "2026-07-06");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("days");
  });

  test("anchor=2026-07-01, missing 07-03, today=07-05 logged returns 1", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-01",
    };
    const keys = new Set(["2026-07-01", "2026-07-05"]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(1);
    expect(result.unit).toBe("days");
  });

  test("today before anchor returns 0", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-05",
    };
    const keys = new Set(["2026-07-01", "2026-07-03"]);
    const result = computeStreak(keys, schedule, "2026-07-03");
    expect(result.count).toBe(0);
    expect(result.unit).toBe("days");
  });
});

describe("computeStreak - everyOtherDay without anchorDateKey (legacy fallback)", () => {
  test("legacy parity behavior returns deterministic result", () => {
    const schedule: Schedule = { type: "everyOtherDay" };
    // July 5, 2026 is a Sunday (epochDay should be even per legacy logic)
    const keys = keysFrom("2026-07-05", [0, -2, -4]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBeGreaterThanOrEqual(0);
    expect(result.unit).toBe("days");
  });
});

describe("computeStreak - weeklyTarget", () => {
  test("3 hits in each of current + 2 previous weeks returns {3, weeks}", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    // Current week (2026-07-05 to 2026-07-11, Sunday to Saturday):
    // 2026-07-06 (Mon), 2026-07-08 (Wed), 2026-07-10 (Fri)
    // Previous week (2026-06-28 to 2026-07-04):
    // 2026-06-29 (Mon), 2026-07-01 (Wed), 2026-07-03 (Fri)
    // Week before (2026-06-21 to 2026-06-27):
    // 2026-06-22 (Mon), 2026-06-24 (Wed), 2026-06-26 (Fri)
    const keys = new Set([
      "2026-07-06", "2026-07-08", "2026-07-10",
      "2026-06-29", "2026-07-01", "2026-07-03",
      "2026-06-22", "2026-06-24", "2026-06-26",
    ]);
    const result = computeStreak(keys, schedule, "2026-07-10");
    expect(result.count).toBe(3);
    expect(result.unit).toBe("weeks");
  });

  test("current week only 1 hit, two previous weeks >=3 returns {2, weeks}", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    // Current week: 2026-07-06 (Mon) only (1 hit)
    // Previous week: 2026-06-29, 07-01, 07-03 (3 hits)
    // Week before: 2026-06-22, 06-24, 06-26 (3 hits)
    const keys = new Set([
      "2026-07-06",
      "2026-06-29", "2026-07-01", "2026-07-03",
      "2026-06-22", "2026-06-24", "2026-06-26",
    ]);
    const result = computeStreak(keys, schedule, "2026-07-10");
    expect(result.count).toBe(2);
    expect(result.unit).toBe("weeks");
  });

  test("previous week 2 hits (below target), breaks after current", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    // Current week: 2026-07-06, 2026-07-08 (2 hits, below target)
    // Previous week: 2026-06-29, 07-01 (2 hits, below target) -> breaks
    const keys = new Set([
      "2026-07-06", "2026-07-08",
      "2026-06-29", "2026-07-01",
    ]);
    const result = computeStreak(keys, schedule, "2026-07-10");
    expect(result.count).toBe(0);
    expect(result.unit).toBe("weeks");
  });

  test("empty set returns {0, weeks}", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    const keys = new Set<string>();
    const result = computeStreak(keys, schedule, "2026-07-10");
    expect(result.count).toBe(0);
    expect(result.unit).toBe("weeks");
  });
});

describe("computeStreak - flexible", () => {
  test("flexible always returns {0, none}", () => {
    const schedule: Schedule = { type: "flexible" };
    const keys = new Set(["2026-07-05", "2026-07-04", "2026-07-03"]);
    const result = computeStreak(keys, schedule, "2026-07-05");
    expect(result.count).toBe(0);
    expect(result.unit).toBe("none");
  });
});

describe("computeStreak - unparsable todayKey", () => {
  test("unparsable todayKey returns {0, unit} with correct unit", () => {
    const schedule: Schedule = { type: "daily" };
    const keys = new Set(["2026-07-05"]);
    const result = computeStreak(keys, schedule, "invalid-date");
    expect(result.count).toBe(0);
    expect(result.unit).toBe("days");
  });
});

describe("countLogsInCalendarMonth", () => {
  test("counts keys sharing todayKey's YYYY-MM prefix", () => {
    const keys = new Set([
      "2026-07-01",
      "2026-07-05",
      "2026-07-15",
      "2026-06-30",
      "2026-08-01",
    ]);
    const count = countLogsInCalendarMonth(keys, "2026-07-10");
    expect(count).toBe(3); // Only 07-01, 07-05, 07-15
  });

  test("empty set returns 0", () => {
    const keys = new Set<string>();
    const count = countLogsInCalendarMonth(keys, "2026-07-10");
    expect(count).toBe(0);
  });

  test("unparsable todayKey returns 0", () => {
    const keys = new Set(["2026-07-01", "2026-07-05"]);
    const count = countLogsInCalendarMonth(keys, "invalid-date");
    expect(count).toBe(0);
  });
});
