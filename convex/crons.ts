import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

// Reminders live on whole hours, so one check per hour reaches every slot once.
crons.hourly(
  "send-reminders",
  { minuteUTC: 0 },
  internal.pushNode.dispatchReminders,
);

crons.daily(
  "prune-auth-attempts",
  { hourUTC: 4, minuteUTC: 30 },
  internal.rateLimit.prune,
);

export default crons;
