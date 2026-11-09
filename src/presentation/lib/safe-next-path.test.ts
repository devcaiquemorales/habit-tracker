import { describe, expect, test } from "bun:test";

import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  test("keeps internal paths", () => {
    expect(safeNextPath("/settings")).toBe("/settings");
    expect(safeNextPath("/habits/abc?x=1")).toBe("/habits/abc?x=1");
  });

  test("falls back to home for anything leaving the site", () => {
    for (const raw of [null, "", "https://evil.test", "//evil.test", "/\\evil.test"]) {
      expect(safeNextPath(raw)).toBe("/");
    }
  });
});
