import { describe, expect,it } from "bun:test";

import {
  parseColorVariant,
  scheduleFromDb,
  scheduleToDbPayload,
} from "./habit-db-mapper";

describe("parseColorVariant", () => {
  it("accepts valid colors", () => {
    expect(parseColorVariant("green")).toBe("green");
    expect(parseColorVariant("blue")).toBe("blue");
    expect(parseColorVariant("amber")).toBe("amber");
    expect(parseColorVariant("purple")).toBe("purple");
    expect(parseColorVariant("red")).toBe("red");
  });

  it("defaults bad colors to green", () => {
    expect(parseColorVariant("invalid")).toBe("green");
    expect(parseColorVariant("")).toBe("green");
  });
});

describe("scheduleFromDb / scheduleToDbPayload round-trip", () => {
  it("round-trips daily", () => {
    const payload = scheduleToDbPayload({ type: "daily" });
    expect(payload.schedule_type).toBe("daily");
    expect(payload.fixed_days).toBe(null);
    expect(payload.weekly_target).toBe(null);

    const schedule = scheduleFromDb(payload.schedule_type, payload.weekly_target, payload.fixed_days, "2026-01-01");
    expect(schedule.type).toBe("daily");
  });

  it("round-trips specificDays", () => {
    const original = { type: "specificDays" as const, days: [1, 3, 5] };
    const payload = scheduleToDbPayload(original);
    expect(payload.schedule_type).toBe("specific_days");
    expect(payload.fixed_days).toEqual([1, 3, 5]);

    const schedule = scheduleFromDb(payload.schedule_type, payload.weekly_target, payload.fixed_days, "2026-01-01");
    expect(schedule.type).toBe("specificDays");
    if (schedule.type === "specificDays") {
      expect(schedule.days).toEqual([1, 3, 5]);
    }
  });

  it("round-trips everyOtherDay with anchor", () => {
    const original = { type: "everyOtherDay" as const, anchorDateKey: "2026-01-15" };
    const payload = scheduleToDbPayload(original);
    expect(payload.schedule_type).toBe("every_other_day");
    expect(payload.anchor_date).toBe("2026-01-15");

    const schedule = scheduleFromDb(payload.schedule_type, payload.weekly_target, payload.fixed_days, payload.anchor_date!);
    expect(schedule.type).toBe("everyOtherDay");
    if (schedule.type === "everyOtherDay") {
      expect(schedule.anchorDateKey).toBe("2026-01-15");
    }
  });

  it("round-trips weeklyTarget", () => {
    const original = { type: "weeklyTarget" as const, timesPerWeek: 3 };
    const payload = scheduleToDbPayload(original);
    expect(payload.schedule_type).toBe("weekly_target");
    expect(payload.weekly_target).toBe(3);

    const schedule = scheduleFromDb(payload.schedule_type, payload.weekly_target, payload.fixed_days, "2026-01-01");
    expect(schedule.type).toBe("weeklyTarget");
    if (schedule.type === "weeklyTarget") {
      expect(schedule.timesPerWeek).toBe(3);
    }
  });

  it("round-trips flexible", () => {
    const payload = scheduleToDbPayload({ type: "flexible" });
    expect(payload.schedule_type).toBe("flexible");

    const schedule = scheduleFromDb(payload.schedule_type, payload.weekly_target, payload.fixed_days, "2026-01-01");
    expect(schedule.type).toBe("flexible");
  });

  it("clamps weeklyTarget to 1-7", () => {
    const payload = scheduleToDbPayload({ type: "weeklyTarget", timesPerWeek: 10 });
    expect(payload.weekly_target).toBe(7);

    const payload2 = scheduleToDbPayload({ type: "weeklyTarget", timesPerWeek: 0 });
    expect(payload2.weekly_target).toBe(1);
  });

  it("filters invalid weekdays in specificDays", () => {
    const payload = scheduleToDbPayload({ type: "specificDays", days: [1, 8, 3, -1] });
    expect(payload.fixed_days).toEqual([1, 3]);
  });

  it("falls back empty fixed_days to daily", () => {
    const schedule = scheduleFromDb("specific_days", null, [], "2026-01-01");
    expect(schedule.type).toBe("daily");
  });

  it("falls back null fixed_days to daily", () => {
    const schedule = scheduleFromDb("specific_days", null, null, "2026-01-01");
    expect(schedule.type).toBe("daily");
  });

  it("converts all-7-days specific_days to daily", () => {
    const schedule = scheduleFromDb("specific_days", null, [0, 1, 2, 3, 4, 5, 6], "2026-01-01");
    expect(schedule.type).toBe("daily");
  });
});
