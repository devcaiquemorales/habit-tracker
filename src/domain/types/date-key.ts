/** UTC calendar date as `YYYY-MM-DD` — kept for server-side repositories only. */
export function toUtcDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parses a UTC `YYYY-MM-DD` key to UTC midnight — kept for server-side use. */
export function utcDateFromDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

/** UTC midnight for the current instant's calendar day — server-side only. */
export function getUtcToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/** UTC midnight at the start of the Sunday–Saturday week — server-side only. */
export function getUtcWeekStartSunday(date: Date): Date {
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  const dow = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - dow);
  return d;
}

// ─── Local-timezone variants (client / domain logic) ──────────────────────────

/**
 * Local calendar date as `YYYY-MM-DD` using the device timezone.
 * Use this everywhere a date key is generated or compared on the client.
 */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Parses a `YYYY-MM-DD` key to local midnight (00:00 in the device timezone).
 * Use this on the client to convert stored keys back to Date objects.
 */
export function localDateFromDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

/**
 * Local midnight (00:00) for today's calendar date in the device timezone.
 * A new habit-day starts when this date advances — i.e. at local midnight.
 */
export function getLocalToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Local midnight at the start of the Sunday–Saturday week containing `date`.
 */
export function getLocalWeekStartSunday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = d.getDay();
  d.setDate(d.getDate() - dow);
  return d;
}
