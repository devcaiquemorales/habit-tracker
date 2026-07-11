/// <reference types="bun" />
import { describe, expect, test } from "bun:test";

import {
  getLocalToday,
  getLocalWeekStartSunday,
  getUtcToday,
  getUtcWeekStartSunday,
  localDateFromDateKey,
  toLocalDateKey,
  toUtcDateKey,
  utcDateFromDateKey,
} from "./date-key";

describe("toUtcDateKey", () => {
  test("formats UTC date with zero-padded month and day", () => {
    const date = new Date(Date.UTC(2026, 0, 5)); // Jan 5
    expect(toUtcDateKey(date)).toBe("2026-01-05");
  });

  test("formats UTC date with double-digit month and day", () => {
    const date = new Date(Date.UTC(2026, 11, 25)); // Dec 25
    expect(toUtcDateKey(date)).toBe("2026-12-25");
  });

  test("formats Jan 1 with zero-padded month and day", () => {
    const date = new Date(Date.UTC(2026, 0, 1));
    expect(toUtcDateKey(date)).toBe("2026-01-01");
  });
});

describe("toLocalDateKey", () => {
  test("formats local date with zero-padded month and day", () => {
    const date = new Date(2026, 0, 5); // Jan 5
    expect(toLocalDateKey(date)).toBe("2026-01-05");
  });

  test("formats local date with double-digit month and day", () => {
    const date = new Date(2026, 11, 25); // Dec 25
    expect(toLocalDateKey(date)).toBe("2026-12-25");
  });

  test("formats Jan 1 with zero-padded month and day", () => {
    const date = new Date(2026, 0, 1);
    expect(toLocalDateKey(date)).toBe("2026-01-01");
  });
});

describe("utcDateFromDateKey", () => {
  test("parses valid UTC date key and returns midnight UTC", () => {
    const key = "2026-01-05";
    const result = utcDateFromDateKey(key);
    expect(result).not.toBeNull();
    expect(result!.getUTCFullYear()).toBe(2026);
    expect(result!.getUTCMonth()).toBe(0);
    expect(result!.getUTCDate()).toBe(5);
    expect(result!.getUTCHours()).toBe(0);
    expect(result!.getUTCMinutes()).toBe(0);
    expect(result!.getUTCSeconds()).toBe(0);
    expect(result!.getUTCMilliseconds()).toBe(0);
  });

  test("valid key round-trips back to the same key", () => {
    const key = "2026-01-05";
    const date = utcDateFromDateKey(key);
    expect(date).not.toBeNull();
    expect(toUtcDateKey(date!)).toBe(key);
  });

  test("returns null for invalid format with single-digit month", () => {
    expect(utcDateFromDateKey("2026-1-05")).toBeNull();
  });

  test("returns null for invalid format with single-digit day", () => {
    expect(utcDateFromDateKey("2026-01-5")).toBeNull();
  });

  test("returns null for non-date string", () => {
    expect(utcDateFromDateKey("abc")).toBeNull();
  });

  test("returns null for invalid month (13)", () => {
    expect(utcDateFromDateKey("2026-13-01")).toBeNull();
  });

  test("returns null for invalid day (Feb 30)", () => {
    expect(utcDateFromDateKey("2026-02-30")).toBeNull();
  });

  test("accepts Jan 1 as valid", () => {
    const result = utcDateFromDateKey("2026-01-01");
    expect(result).not.toBeNull();
    expect(toUtcDateKey(result!)).toBe("2026-01-01");
  });
});

describe("localDateFromDateKey", () => {
  test("parses valid local date key and returns local midnight", () => {
    const key = "2026-01-05";
    const result = localDateFromDateKey(key);
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(0);
    expect(result!.getDate()).toBe(5);
    expect(result!.getHours()).toBe(0);
    expect(result!.getMinutes()).toBe(0);
    expect(result!.getSeconds()).toBe(0);
    expect(result!.getMilliseconds()).toBe(0);
  });

  test("valid key round-trips back to the same key", () => {
    const key = "2026-01-05";
    const date = localDateFromDateKey(key);
    expect(date).not.toBeNull();
    expect(toLocalDateKey(date!)).toBe(key);
  });

  test("returns null for invalid format with single-digit month", () => {
    expect(localDateFromDateKey("2026-1-05")).toBeNull();
  });

  test("returns null for invalid format with single-digit day", () => {
    expect(localDateFromDateKey("2026-01-5")).toBeNull();
  });

  test("returns null for non-date string", () => {
    expect(localDateFromDateKey("abc")).toBeNull();
  });

  test("returns null for invalid month (13)", () => {
    expect(localDateFromDateKey("2026-13-01")).toBeNull();
  });

  test("returns null for invalid day (Feb 30)", () => {
    expect(localDateFromDateKey("2026-02-30")).toBeNull();
  });

  test("accepts Jan 1 as valid", () => {
    const result = localDateFromDateKey("2026-01-01");
    expect(result).not.toBeNull();
    expect(toLocalDateKey(result!)).toBe("2026-01-01");
  });
});

describe("getUtcToday", () => {
  test("returns UTC midnight (00:00:00.000)", () => {
    const today = getUtcToday();
    expect(today.getUTCHours()).toBe(0);
    expect(today.getUTCMinutes()).toBe(0);
    expect(today.getUTCSeconds()).toBe(0);
    expect(today.getUTCMilliseconds()).toBe(0);
  });

  test("returns current UTC calendar day", () => {
    const today = getUtcToday();
    const now = new Date();
    expect(today.getUTCFullYear()).toBe(now.getUTCFullYear());
    expect(today.getUTCMonth()).toBe(now.getUTCMonth());
    expect(today.getUTCDate()).toBe(now.getUTCDate());
  });
});

describe("getLocalToday", () => {
  test("returns local midnight (00:00:00.000)", () => {
    const today = getLocalToday();
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
    expect(today.getMilliseconds()).toBe(0);
  });

  test("returns current local calendar day", () => {
    const today = getLocalToday();
    const now = new Date();
    expect(today.getFullYear()).toBe(now.getFullYear());
    expect(today.getMonth()).toBe(now.getMonth());
    expect(today.getDate()).toBe(now.getDate());
  });
});

describe("getUtcWeekStartSunday", () => {
  test("returns preceding Sunday for a Wednesday", () => {
    // 2026-07-08 is a Wednesday
    const wednesday = new Date(Date.UTC(2026, 6, 8));
    const result = getUtcWeekStartSunday(wednesday);
    // Should return 2026-07-05 (Sunday)
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(6);
    expect(result.getUTCDate()).toBe(5);
    expect(result.getUTCDay()).toBe(0); // Sunday
  });

  test("returns itself for a Sunday", () => {
    // 2026-07-05 is a Sunday
    const sunday = new Date(Date.UTC(2026, 6, 5));
    const result = getUtcWeekStartSunday(sunday);
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(6);
    expect(result.getUTCDate()).toBe(5);
    expect(result.getUTCDay()).toBe(0); // Sunday
  });

  test("returns preceding Sunday for a Monday", () => {
    // 2026-07-06 is a Monday
    const monday = new Date(Date.UTC(2026, 6, 6));
    const result = getUtcWeekStartSunday(monday);
    // Should return 2026-07-05 (Sunday)
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(6);
    expect(result.getUTCDate()).toBe(5);
    expect(result.getUTCDay()).toBe(0); // Sunday
  });

  test("returns midnight for week start", () => {
    const wednesday = new Date(Date.UTC(2026, 6, 8, 15, 30, 45, 123));
    const result = getUtcWeekStartSunday(wednesday);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });
});

describe("getLocalWeekStartSunday", () => {
  test("returns preceding Sunday for a Wednesday", () => {
    // 2026-07-08 is a Wednesday
    const wednesday = new Date(2026, 6, 8);
    const result = getLocalWeekStartSunday(wednesday);
    // Should return 2026-07-05 (Sunday)
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(5);
    expect(result.getDay()).toBe(0); // Sunday
  });

  test("returns itself for a Sunday", () => {
    // 2026-07-05 is a Sunday
    const sunday = new Date(2026, 6, 5);
    const result = getLocalWeekStartSunday(sunday);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(5);
    expect(result.getDay()).toBe(0); // Sunday
  });

  test("returns preceding Sunday for a Monday", () => {
    // 2026-07-06 is a Monday
    const monday = new Date(2026, 6, 6);
    const result = getLocalWeekStartSunday(monday);
    // Should return 2026-07-05 (Sunday)
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(5);
    expect(result.getDay()).toBe(0); // Sunday
  });

  test("returns local midnight for week start", () => {
    const wednesday = new Date(2026, 6, 8, 15, 30, 45, 123);
    const result = getLocalWeekStartSunday(wednesday);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});
