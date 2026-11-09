import { describe, expect, test } from "bun:test";

import { getTodayStatusPresentation } from "./habit-today-status";

const t = (key: string) => key;
const monday = new Date(2026, 10, 9);
const todayKey = "2026-11-09";

describe("getTodayStatusPresentation", () => {
  test("a flexible habit logged today reads as completed", () => {
    const { kind, label } = getTodayStatusPresentation(
      { type: "flexible" },
      true,
      monday,
      new Set([todayKey]),
      t,
    );
    expect(kind).toBe("completed");
    expect(label).toBe("status.completedToday");
  });

  test("a flexible habit not logged today stays neutral", () => {
    const { kind, label } = getTodayStatusPresentation(
      { type: "flexible" },
      false,
      monday,
      new Set(),
      t,
    );
    expect(kind).toBe("not_scheduled");
    expect(label).toBe("status.notCompletedToday");
  });

  test("a log on an unscheduled day counts as completed", () => {
    const { kind } = getTodayStatusPresentation(
      { type: "specificDays", days: [2] },
      false,
      monday,
      new Set([todayKey]),
      t,
    );
    expect(kind).toBe("completed");
  });

  test("an unscheduled day without a log says so", () => {
    const { kind } = getTodayStatusPresentation(
      { type: "specificDays", days: [2] },
      false,
      monday,
      new Set(),
      t,
    );
    expect(kind).toBe("not_scheduled");
  });
});
