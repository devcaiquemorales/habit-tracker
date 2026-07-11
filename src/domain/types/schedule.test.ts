/// <reference types="bun" />
import { describe, expect, test } from "bun:test";

import {
  isDayExpected,
  isPastDayLoggable,
  isTodayScheduled,
  isWeeklyTargetSchedule,
  type Schedule,
} from "./schedule";

describe("isDayExpected", () => {
  test("daily schedule returns true for any day", () => {
    const schedule: Schedule = { type: "daily" };
    expect(isDayExpected(schedule, new Date(2026, 6, 5))).toBe(true); // Sunday
    expect(isDayExpected(schedule, new Date(2026, 6, 6))).toBe(true); // Monday
    expect(isDayExpected(schedule, new Date(2026, 6, 12))).toBe(true); // Sunday
  });

  test("specificDays returns true only for specified days", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] }; // Mon, Wed, Fri
    expect(isDayExpected(schedule, new Date(2026, 6, 6))).toBe(true); // Monday (day 1)
    expect(isDayExpected(schedule, new Date(2026, 6, 8))).toBe(true); // Wednesday (day 3)
    expect(isDayExpected(schedule, new Date(2026, 6, 10))).toBe(true); // Friday (day 5)
    expect(isDayExpected(schedule, new Date(2026, 6, 5))).toBe(false); // Sunday (day 0)
    expect(isDayExpected(schedule, new Date(2026, 6, 7))).toBe(false); // Tuesday (day 2)
  });

  test("everyOtherDay returns true/false in deterministic parity", () => {
    const schedule: Schedule = { type: "everyOtherDay" };
    // Two consecutive local dates should have opposite results
    const day1Result = isDayExpected(schedule, new Date(2026, 6, 5)); // July 5
    const day2Result = isDayExpected(schedule, new Date(2026, 6, 6)); // July 6
    expect(day1Result).not.toBe(day2Result); // Must be opposite
  });

  test("everyOtherDay with anchorDateKey: anchor day expected", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-05",
    };
    expect(isDayExpected(schedule, new Date(2026, 6, 5))).toBe(true); // Anchor day
  });

  test("everyOtherDay with anchorDateKey: anchor+1 not expected", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-05",
    };
    expect(isDayExpected(schedule, new Date(2026, 6, 6))).toBe(false); // Day after anchor
  });

  test("everyOtherDay with anchorDateKey: anchor+2 expected", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-05",
    };
    expect(isDayExpected(schedule, new Date(2026, 6, 7))).toBe(true); // Two days after anchor
  });

  test("everyOtherDay with anchorDateKey: day before anchor not expected", () => {
    const schedule: Schedule = {
      type: "everyOtherDay",
      anchorDateKey: "2026-07-05",
    };
    expect(isDayExpected(schedule, new Date(2026, 6, 4))).toBe(false); // Day before anchor
  });

  test("weeklyTarget returns true for any day", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    expect(isDayExpected(schedule, new Date(2026, 6, 5))).toBe(true); // Sunday
    expect(isDayExpected(schedule, new Date(2026, 6, 6))).toBe(true); // Monday
    expect(isDayExpected(schedule, new Date(2026, 6, 12))).toBe(true); // Sunday
  });

  test("flexible returns false for any day", () => {
    const schedule: Schedule = { type: "flexible" };
    expect(isDayExpected(schedule, new Date(2026, 6, 5))).toBe(false); // Sunday
    expect(isDayExpected(schedule, new Date(2026, 6, 6))).toBe(false); // Monday
    expect(isDayExpected(schedule, new Date(2026, 6, 12))).toBe(false); // Sunday
  });
});

describe("isTodayScheduled", () => {
  test("daily returns true for any day", () => {
    const schedule: Schedule = { type: "daily" };
    expect(isTodayScheduled(schedule, new Date(2026, 6, 5))).toBe(true);
    expect(isTodayScheduled(schedule, new Date(2026, 6, 6))).toBe(true);
  });

  test("specificDays matches isDayExpected behavior", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    const date1 = new Date(2026, 6, 6); // Monday
    const date2 = new Date(2026, 6, 5); // Sunday
    expect(isTodayScheduled(schedule, date1)).toBe(isDayExpected(schedule, date1));
    expect(isTodayScheduled(schedule, date2)).toBe(isDayExpected(schedule, date2));
  });

  test("everyOtherDay matches isDayExpected behavior", () => {
    const schedule: Schedule = { type: "everyOtherDay" };
    const date1 = new Date(2026, 6, 5);
    const date2 = new Date(2026, 6, 6);
    expect(isTodayScheduled(schedule, date1)).toBe(isDayExpected(schedule, date1));
    expect(isTodayScheduled(schedule, date2)).toBe(isDayExpected(schedule, date2));
  });

  test("weeklyTarget returns true for any day", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    expect(isTodayScheduled(schedule, new Date(2026, 6, 5))).toBe(true);
    expect(isTodayScheduled(schedule, new Date(2026, 6, 6))).toBe(true);
    expect(isTodayScheduled(schedule, new Date(2026, 6, 12))).toBe(true);
  });

  test("flexible returns true for any day", () => {
    const schedule: Schedule = { type: "flexible" };
    expect(isTodayScheduled(schedule, new Date(2026, 6, 5))).toBe(true);
    expect(isTodayScheduled(schedule, new Date(2026, 6, 6))).toBe(true);
    expect(isTodayScheduled(schedule, new Date(2026, 6, 12))).toBe(true);
  });
});

describe("isPastDayLoggable", () => {
  test("returns true if date key is in completedKeys", () => {
    const schedule: Schedule = { type: "daily" };
    const date = new Date(2026, 6, 5);
    const completedKeys = new Set(["2026-07-05"]);
    expect(isPastDayLoggable(schedule, date, completedKeys)).toBe(true);
  });

  test("flexible returns true even for non-completed date", () => {
    const schedule: Schedule = { type: "flexible" };
    const date = new Date(2026, 6, 5);
    const completedKeys = new Set<string>();
    expect(isPastDayLoggable(schedule, date, completedKeys)).toBe(true);
  });

  test("weeklyTarget returns true even for non-completed date", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    const date = new Date(2026, 6, 5);
    const completedKeys = new Set<string>();
    expect(isPastDayLoggable(schedule, date, completedKeys)).toBe(true);
  });

  test("daily returns true for expected days (not completed)", () => {
    const schedule: Schedule = { type: "daily" };
    const date = new Date(2026, 6, 5); // any day
    const completedKeys = new Set<string>();
    expect(isPastDayLoggable(schedule, date, completedKeys)).toBe(true);
  });

  test("specificDays returns true only for expected days (not completed)", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    const monday = new Date(2026, 6, 6); // Monday (day 1 - expected)
    const sunday = new Date(2026, 6, 5); // Sunday (day 0 - not expected)
    const completedKeys = new Set<string>();
    expect(isPastDayLoggable(schedule, monday, completedKeys)).toBe(true);
    expect(isPastDayLoggable(schedule, sunday, completedKeys)).toBe(false);
  });

  test("specificDays returns true even for non-expected days if completed", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    const sunday = new Date(2026, 6, 5); // Sunday (day 0 - not expected)
    const completedKeys = new Set(["2026-07-05"]);
    expect(isPastDayLoggable(schedule, sunday, completedKeys)).toBe(true);
  });

  test("everyOtherDay returns true only for expected days (not completed)", () => {
    const schedule: Schedule = { type: "everyOtherDay" };
    const date1 = new Date(2026, 6, 5);
    const date2 = new Date(2026, 6, 6);
    const completedKeys = new Set<string>();
    // One should be true, one should be false
    const result1 = isPastDayLoggable(schedule, date1, completedKeys);
    const result2 = isPastDayLoggable(schedule, date2, completedKeys);
    expect(result1).not.toBe(result2);
  });

  test("everyOtherDay returns true even for non-expected days if completed", () => {
    const schedule: Schedule = { type: "everyOtherDay" };
    const date1 = new Date(2026, 6, 5);
    const completedKeys = new Set(["2026-07-05"]);
    expect(isPastDayLoggable(schedule, date1, completedKeys)).toBe(true);
  });
});

describe("isWeeklyTargetSchedule", () => {
  test("returns true for weeklyTarget schedule", () => {
    const schedule: Schedule = { type: "weeklyTarget", timesPerWeek: 3 };
    expect(isWeeklyTargetSchedule(schedule)).toBe(true);
  });

  test("returns false for daily schedule", () => {
    const schedule: Schedule = { type: "daily" };
    expect(isWeeklyTargetSchedule(schedule)).toBe(false);
  });

  test("returns false for specificDays schedule", () => {
    const schedule: Schedule = { type: "specificDays", days: [1, 3, 5] };
    expect(isWeeklyTargetSchedule(schedule)).toBe(false);
  });

  test("returns false for everyOtherDay schedule", () => {
    const schedule: Schedule = { type: "everyOtherDay" };
    expect(isWeeklyTargetSchedule(schedule)).toBe(false);
  });

  test("returns false for flexible schedule", () => {
    const schedule: Schedule = { type: "flexible" };
    expect(isWeeklyTargetSchedule(schedule)).toBe(false);
  });
});
