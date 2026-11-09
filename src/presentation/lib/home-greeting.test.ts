import { describe, expect, test } from "bun:test";

import type { Habit } from "@/domain/types/habit";

import { type GreetingInput, pickHomeGreeting } from "./home-greeting";

const todayKey = "2026-11-09"; // Monday

function habit(id: string, overrides: Partial<Habit> = {}): Habit {
  return {
    id,
    name: `Habit ${id}`,
    colorVariant: "green",
    schedule: { type: "daily" },
    streak: 0,
    completedToday: false,
    position: 0,
    ...overrides,
  };
}

function greet(overrides: Partial<GreetingInput>) {
  return pickHomeGreeting({
    displayName: "Caique Morales",
    habits: [],
    logKeysRecord: {},
    todayKey,
    hour: 10,
    ...overrides,
  });
}

describe("pickHomeGreeting", () => {
  test("stays neutral without data", () => {
    expect(greet({ habits: undefined }).key).toBe("greeting.neutral");
  });

  test("welcomes someone with no habits, by first name", () => {
    expect(greet({})).toEqual({
      key: "greeting.welcome",
      vars: { name: "Caique" },
    });
  });

  test("celebrates when everything due today is done", () => {
    const { key } = greet({
      habits: [habit("a")],
      logKeysRecord: { a: [todayKey] },
    });
    expect(key).toMatch(/^greeting\.allDone/);
  });

  test("names the only habit left", () => {
    const result = greet({
      habits: [habit("a"), habit("b", { name: "Ler" })],
      logKeysRecord: { a: [todayKey] },
    });
    expect(result.key).toBe("greeting.oneLeft");
    expect(result.vars?.habit).toBe("Ler");
  });

  test("falls back to counts when the remaining name is too long", () => {
    const result = greet({
      habits: [habit("a"), habit("b", { name: "x".repeat(40) })],
      logKeysRecord: { a: [todayKey] },
    });
    expect(result.key).toMatch(/^greeting\.progress/);
  });

  test("reports progress with several left", () => {
    const result = greet({
      habits: [habit("a"), habit("b"), habit("c")],
      logKeysRecord: { a: [todayKey] },
    });
    expect(result.key).toMatch(/^greeting\.progress/);
    expect(result.vars).toMatchObject({ done: 1, total: 3 });
  });

  test("welcomes back after three days away", () => {
    const { key } = greet({
      habits: [habit("a")],
      logKeysRecord: { a: ["2026-11-06"] },
    });
    expect(key).toMatch(/^greeting\.comeback/);
  });

  test("does not treat two days away as a comeback", () => {
    const { key } = greet({
      habits: [habit("a")],
      logKeysRecord: { a: ["2026-11-07"] },
    });
    expect(key).not.toMatch(/^greeting\.comeback/);
  });

  test("acknowledges a free day", () => {
    const { key } = greet({
      habits: [habit("a", { schedule: { type: "specificDays", days: [2] } })],
      logKeysRecord: { a: ["2026-11-08"] },
    });
    expect(key).toBe("greeting.rest");
  });

  test("mentions the longest streak once it is worth it", () => {
    const result = greet({
      habits: [
        habit("a", { streak: 9, name: "Ler" }),
        habit("b", { streak: 3 }),
      ],
      logKeysRecord: { a: ["2026-11-08"], b: ["2026-11-08"] },
    });
    expect(result.key).toMatch(/^greeting\.streak/);
    expect(result.vars).toMatchObject({ habit: "Ler", n: 9 });
  });

  test("notes the time left late at night", () => {
    const { key } = greet({
      habits: [habit("a")],
      logKeysRecord: { a: ["2026-11-08"] },
      hour: 22,
    });
    expect(key).toBe("greeting.late");
  });

  test("keeps the same line through the day", () => {
    const input = {
      habits: [habit("a")],
      logKeysRecord: { a: ["2026-11-08"] },
    };
    expect(greet(input).key).toBe(greet(input).key);
    expect(greet(input).key).toMatch(/^greeting\.fresh/);
  });
});
