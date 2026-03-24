import type { Schedule } from "@/domain/types/schedule";
import type { CreateScheduleValue } from "@/presentation/components/create-habit-dialog/schedule-selector";

export function buildScheduleFromForm(form: CreateScheduleValue): Schedule {
  if (form.category === "flexible") {
    return { type: "flexible" };
  }
  if (form.category === "weeklyTarget") {
    const n = Math.min(7, Math.max(1, form.timesPerWeek));
    return { type: "weeklyTarget", timesPerWeek: n };
  }
  switch (form.mode) {
    case "daily":
      return { type: "daily" };
    case "everyOtherDay":
      return { type: "everyOtherDay" };
    case "specificDays":
      return {
        type: "specificDays",
        days: [...form.days].sort((a, b) => a - b),
      };
    default:
      return { type: "daily" };
  }
}

export function scheduleToFormValue(schedule: Schedule): CreateScheduleValue {
  switch (schedule.type) {
    case "flexible":
      return { category: "flexible" };
    case "weeklyTarget":
      return {
        category: "weeklyTarget",
        timesPerWeek: Math.min(7, Math.max(1, schedule.timesPerWeek)),
      };
    case "daily":
      return { category: "fixed", mode: "daily", days: [] };
    case "everyOtherDay":
      return { category: "fixed", mode: "everyOtherDay", days: [] };
    case "specificDays":
      return {
        category: "fixed",
        mode: "specificDays",
        days: [...schedule.days].sort((a, b) => a - b),
      };
  }
}
