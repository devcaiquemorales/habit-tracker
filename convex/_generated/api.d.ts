/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as habits from "../habits.js";
import type * as http from "../http.js";
import type * as invites from "../invites.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_date from "../lib/date.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_validators from "../lib/validators.js";
import type * as logs from "../logs.js";
import type * as profiles from "../profiles.js";
import type * as pushNode from "../pushNode.js";
import type * as rateLimit from "../rateLimit.js";
import type * as reminders from "../reminders.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  dashboard: typeof dashboard;
  habits: typeof habits;
  http: typeof http;
  invites: typeof invites;
  "lib/auth": typeof lib_auth;
  "lib/date": typeof lib_date;
  "lib/email": typeof lib_email;
  "lib/validators": typeof lib_validators;
  logs: typeof logs;
  profiles: typeof profiles;
  pushNode: typeof pushNode;
  rateLimit: typeof rateLimit;
  reminders: typeof reminders;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
