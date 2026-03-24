import type { DashboardPayload } from "./home-dashboard-data";

/** Wire format for `/api/dashboard` and SWR cache. */
export type DashboardJson = {
  profile: DashboardPayload["profile"];
  habits: DashboardPayload["habits"];
  logKeysRecord: Record<string, string[]>;
};

export function dashboardPayloadToJson(
  payload: DashboardPayload,
): DashboardJson {
  const logKeysRecord: Record<string, string[]> = {};
  for (const [habitId, keys] of payload.logKeysByHabitId) {
    logKeysRecord[habitId] = [...keys];
  }
  return {
    profile: payload.profile,
    habits: payload.habits,
    logKeysRecord,
  };
}

export function dashboardJsonToLogKeysMap(
  json: DashboardJson,
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const habitId of Object.keys(json.logKeysRecord)) {
    map.set(habitId, new Set(json.logKeysRecord[habitId] ?? []));
  }
  return map;
}
