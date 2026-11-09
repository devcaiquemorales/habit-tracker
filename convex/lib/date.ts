import { ConvexError } from "convex/values";

/** Rejects anything that is not a real calendar day in YYYY-MM-DD form. */
export function assertDateKey(key: string): void {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (match) {
    const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(Date.UTC(y, m - 1, d));
    if (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    ) {
      return;
    }
  }
  throw new ConvexError("errors.invalidDate");
}
