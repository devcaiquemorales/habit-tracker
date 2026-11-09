/// <reference types="vite/client" />
import { register } from "@convex-dev/better-auth/test";
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";

import { api, components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const adapter = components.betterAuth.adapter;

function setup() {
  const t = convexTest(schema, modules);
  register(t);
  return t;
}

type T = ReturnType<typeof setup>;

async function signIn(t: T, email: string) {
  const now = Date.now();
  const user = (await t.mutation(adapter.create, {
    input: {
      model: "user",
      data: {
        name: email,
        email,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    },
  })) as { _id: string };
  const session = (await t.mutation(adapter.create, {
    input: {
      model: "session",
      data: {
        token: `token-${email}`,
        userId: user._id,
        expiresAt: now + 3_600_000,
        createdAt: now,
        updatedAt: now,
      },
    },
  })) as { _id: string };
  return {
    userId: user._id,
    as: t.withIdentity({ subject: user._id, sessionId: session._id }),
  };
}

const daily = { type: "daily" } as const;
const newHabit = { name: "Gym", colorVariant: "green", schedule: daily } as const;
const SINCE = "2020-01-01";
const DAY = "2024-02-29";

async function twoUsers() {
  const t = setup();
  const alice = await signIn(t, "alice@example.test");
  const bob = await signIn(t, "bob@example.test");
  const habitId = (await alice.as.mutation(
    api.habits.create,
    newHabit,
  )) as Id<"habits">;
  await alice.as.mutation(api.logs.mark, { habitId, logDate: DAY });
  return { t, alice, bob, habitId };
}

const notFound = /errors\.habitNotFound/;

describe("access between users", () => {
  test("a signed-out caller reads nothing and cannot write", async () => {
    const { t, habitId } = await twoUsers();
    expect(await t.query(api.dashboard.get, { sinceKey: SINCE })).toBeNull();
    expect(await t.query(api.reminders.list, {})).toEqual([]);
    await expect(t.mutation(api.habits.create, newHabit)).rejects.toThrow(
      /errors\.notSignedIn/,
    );
    await expect(
      t.mutation(api.logs.mark, { habitId, logDate: DAY }),
    ).rejects.toThrow(/errors\.notSignedIn/);
  });

  test("the dashboard only returns the caller's habits and logs", async () => {
    const { alice, bob, habitId } = await twoUsers();
    const own = await alice.as.query(api.dashboard.get, { sinceKey: SINCE });
    expect(own?.habits.map((h) => h.id)).toEqual([habitId]);
    expect(own?.logKeysRecord[habitId]).toEqual([DAY]);

    const other = await bob.as.query(api.dashboard.get, { sinceKey: SINCE });
    expect(other?.habits).toEqual([]);
    expect(other?.logKeysRecord).toEqual({});
  });

  test("another user cannot edit, delete or reorder a habit", async () => {
    const { alice, bob, habitId } = await twoUsers();
    await expect(
      bob.as.mutation(api.habits.update, { habitId, ...newHabit, name: "Hacked" }),
    ).rejects.toThrow(notFound);
    await expect(
      bob.as.mutation(api.habits.remove, { habitId }),
    ).rejects.toThrow(notFound);
    await expect(
      bob.as.mutation(api.habits.reorder, { orderedIds: [habitId] }),
    ).rejects.toThrow(notFound);

    const own = await alice.as.query(api.dashboard.get, { sinceKey: SINCE });
    expect(own?.habits[0]?.name).toBe("Gym");
  });

  test("another user cannot mark or unmark a day", async () => {
    const { alice, bob, habitId } = await twoUsers();
    await expect(
      bob.as.mutation(api.logs.mark, { habitId, logDate: "2024-03-01" }),
    ).rejects.toThrow(notFound);
    await expect(
      bob.as.mutation(api.logs.unmark, { habitId, logDate: DAY }),
    ).rejects.toThrow(notFound);

    const own = await alice.as.query(api.dashboard.get, { sinceKey: SINCE });
    expect(own?.logKeysRecord[habitId]).toEqual([DAY]);
  });

  test("another user cannot touch a reminder or subscription", async () => {
    const { alice, bob } = await twoUsers();
    await alice.as.mutation(api.reminders.upsert, {
      reminderTime: "09:00",
      enabled: true,
    });
    const [reminder] = await alice.as.query(api.reminders.list, {});
    const reminderId = reminder.id as Id<"reminders">;

    await expect(
      bob.as.mutation(api.reminders.setEnabled, { reminderId, enabled: false }),
    ).rejects.toThrow();
    await expect(
      bob.as.mutation(api.reminders.remove, { reminderId }),
    ).rejects.toThrow();
    expect(await bob.as.query(api.reminders.list, {})).toEqual([]);

    const subscription = { endpoint: "https://push.test/1", p256dh: "k", auth: "a" };
    await alice.as.mutation(api.reminders.saveSubscription, subscription);
    await bob.as.mutation(api.reminders.deleteSubscription, {
      endpoint: subscription.endpoint,
    });
  });
});

describe("habit log rules", () => {
  test("marking twice, even at once, keeps a single row", async () => {
    const { t, alice, habitId } = await twoUsers();
    await Promise.all([
      alice.as.mutation(api.logs.mark, { habitId, logDate: DAY }),
      alice.as.mutation(api.logs.mark, { habitId, logDate: DAY }),
    ]);
    const rows = await t.run((ctx) => ctx.db.query("habitLogs").collect());
    expect(rows).toHaveLength(1);
  });

  test("rejects malformed and impossible dates", async () => {
    const { alice, habitId } = await twoUsers();
    for (const logDate of ["2024-02-30", "2024-2-1", "yesterday"]) {
      await expect(
        alice.as.mutation(api.logs.mark, { habitId, logDate }),
      ).rejects.toThrow(/errors\.invalidDate/);
    }
  });

  test("rejects a day that is still in the future for the user", async () => {
    const { alice, habitId } = await twoUsers();
    await expect(
      alice.as.mutation(api.logs.mark, { habitId, logDate: "2999-01-01" }),
    ).rejects.toThrow(/errors\.invalidDate/);
  });

  test("deleting a habit removes its logs", async () => {
    const { t, alice, habitId } = await twoUsers();
    await alice.as.mutation(api.habits.remove, { habitId });
    expect(await t.run((ctx) => ctx.db.query("habitLogs").collect())).toEqual([]);
  });
});

describe("habit and reminder rules", () => {
  test("new habits go last and reorder persists", async () => {
    const t = setup();
    const { as } = await signIn(t, "alice@example.test");
    const first = await as.mutation(api.habits.create, newHabit);
    const second = await as.mutation(api.habits.create, newHabit);
    await as.mutation(api.habits.reorder, { orderedIds: [second, first] });
    const data = await as.query(api.dashboard.get, { sinceKey: SINCE });
    expect(data?.habits.map((h) => h.id)).toEqual([second, first]);
  });

  test("validates the name and schedule shape", async () => {
    const t = setup();
    const { as } = await signIn(t, "alice@example.test");
    const invalid = /errors\.invalidInput/;
    await expect(
      as.mutation(api.habits.create, { ...newHabit, name: "  " }),
    ).rejects.toThrow(invalid);
    await expect(
      as.mutation(api.habits.create, {
        ...newHabit,
        schedule: { type: "specificDays", days: [] },
      }),
    ).rejects.toThrow(invalid);
    await expect(
      as.mutation(api.habits.create, {
        ...newHabit,
        schedule: { type: "weeklyTarget", timesPerWeek: 8 },
      }),
    ).rejects.toThrow(invalid);
  });

  test("every-other-day habits get an anchor from the user's day", async () => {
    const t = setup();
    const { as } = await signIn(t, "alice@example.test");
    await as.mutation(api.habits.create, {
      ...newHabit,
      schedule: { type: "everyOtherDay" },
    });
    const data = await as.query(api.dashboard.get, { sinceKey: SINCE });
    const schedule = data?.habits[0]?.schedule;
    expect(schedule?.type === "everyOtherDay" && schedule.anchorDateKey).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });

  test("reminders snap to the hour and stay unique", async () => {
    const t = setup();
    const { as } = await signIn(t, "alice@example.test");
    await as.mutation(api.reminders.upsert, { reminderTime: "09:45", enabled: true });
    await as.mutation(api.reminders.upsert, { reminderTime: "09:00", enabled: false });
    const list = await as.query(api.reminders.list, {});
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ reminderTime: "09:00", enabled: false });
  });
});

describe("invites and rate limit", () => {
  test("an invite is valid once, then consumed at signup", async () => {
    const t = setup();
    const email = "friend@example.test";
    expect(await t.query(internal.invites.isValid, { email })).toBe(false);

    await t.mutation(internal.invites.create, { email: " Friend@Example.test " });
    expect(await t.query(internal.invites.isValid, { email })).toBe(true);

    await t.mutation(internal.profiles.onUserCreated, {
      userId: "user1",
      email,
      displayName: "Friend",
      motivationPhrase: "Why",
    });
    expect(await t.query(internal.invites.isValid, { email })).toBe(false);
    await expect(
      t.mutation(internal.invites.create, { email }),
    ).rejects.toThrow(/invite_already_used/);
  });

  test("blocks after ten attempts for the same key only", async () => {
    const t = setup();
    for (let i = 0; i < 10; i++) {
      expect(await t.mutation(internal.rateLimit.hit, { key: "a" })).toBe(true);
    }
    expect(await t.mutation(internal.rateLimit.hit, { key: "a" })).toBe(false);
    expect(await t.mutation(internal.rateLimit.hit, { key: "b" })).toBe(true);
  });
});
