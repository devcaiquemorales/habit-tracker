import { describe, expect, test } from "bun:test";

import {
  buildReminderMessage,
  computeReminderProgress,
  localPartsFor,
} from "./reminder-progress";

describe("localPartsFor", () => {
  test("reports afternoon hours on a 24-hour clock", () => {
    const parts = localPartsFor(
      "America/Sao_Paulo",
      new Date("2026-03-10T17:30:00Z"),
    );
    expect(parts.localHour).toBe(14);
  });

  test("reports midnight as hour 0", () => {
    const parts = localPartsFor("UTC", new Date("2026-03-10T00:10:00Z"));
    expect(parts.localHour).toBe(0);
  });

  test("uses the user's local day, not the UTC day", () => {
    const parts = localPartsFor(
      "America/Sao_Paulo",
      new Date("2026-03-11T02:00:00Z"),
    );
    expect(parts.localDate).toBe("2026-03-10");
    expect(parts.localWeekday).toBe(2);
  });
});

describe("computeReminderProgress", () => {
  const today = "2026-03-11"; // Wednesday
  const weekday = 3;

  test("lists habits expected today and not done", () => {
    const result = computeReminderProgress(
      [
        { id: "a", name: "Gym", schedule: { type: "daily" } },
        { id: "b", name: "Read", schedule: { type: "daily" } },
      ],
      [{ habitId: "a", logDate: today }],
      today,
      weekday,
    );
    expect(result).toEqual({
      expectedCount: 2,
      doneCount: 1,
      pendingNames: ["Read"],
    });
  });

  test("ignores habits not expected today", () => {
    const result = computeReminderProgress(
      [
        { id: "a", name: "Mon", schedule: { type: "specificDays", days: [1] } },
        { id: "b", name: "Any", schedule: { type: "flexible" } },
      ],
      [],
      today,
      weekday,
    );
    expect(result.expectedCount).toBe(0);
  });

  test("a met weekly target counts as done all week", () => {
    const result = computeReminderProgress(
      [
        {
          id: "a",
          name: "Run",
          schedule: { type: "weeklyTarget", timesPerWeek: 2 },
        },
      ],
      [
        { habitId: "a", logDate: "2026-03-08" },
        { habitId: "a", logDate: "2026-03-09" },
      ],
      today,
      weekday,
    );
    expect(result.pendingNames).toEqual([]);
  });

  test("last week's logs do not count toward this week's target", () => {
    const result = computeReminderProgress(
      [
        {
          id: "a",
          name: "Run",
          schedule: { type: "weeklyTarget", timesPerWeek: 1 },
        },
      ],
      [{ habitId: "a", logDate: "2026-03-07" }],
      today,
      weekday,
    );
    expect(result.pendingNames).toEqual(["Run"]);
  });
});

describe("buildReminderMessage", () => {
  test("keeps the body within the notification limit", () => {
    const { body } = buildReminderMessage(
      {
        expectedCount: 40,
        doneCount: 0,
        pendingNames: Array.from({ length: 40 }, (_, i) => `Habit ${i}`),
      },
      "en",
    );
    expect(body.length).toBeLessThanOrEqual(120);
  });
});
